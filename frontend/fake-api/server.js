#!/usr/bin/env node
/**
 * API fake do Nexo Varejo (zero dependências).
 *   node fake-api/server.js            -> usa db.json (cria se não existir)
 *   node fake-api/server.js --reset    -> recria db.json com dados relativos a "agora"
 * Persistência em fake-api/db.json. Regras de negócio ficam AQUI (como no backend real):
 * o front só faz chamadas HTTP e refaz o GET depois de cada ação.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildDb, toIso, PASSWORD } = require('./fixtures');

const PORT = Number(process.env.PORT || 3000);
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'db.json');
const TOKEN_TTL_S = 8 * 60 * 60;
const HOUR_MS = 3600 * 1000;

// ───────────────────────── persistência ─────────────────────────
let db;
function loadDb() {
  if (process.argv.includes('--reset') || !fs.existsSync(DB_FILE)) {
    db = buildDb();
    saveDb();
    console.log('BD fake recriado.');
  } else {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
}
const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// ───────────────────────── utilidades ─────────────────────────
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const need = (cond, message, status = 422) => {
  if (!cond) throw new HttpError(status, message);
};
const now = () => toIso(Date.now());
const toMs = (iso) => new Date(iso).getTime();
const minutesBetween = (a, b) => Math.max(0, Math.floor((b - a) / 60000));
const uid = (p) => `${p}${++db.counters.seq}`;
const clean = (u) => {
  const { password, ...rest } = u;
  return rest;
};
const text = (v, min = 1) => (typeof v === 'string' ? v.trim() : '');
const long = (v, label, min = 10) => {
  const s = text(v);
  need(s.length >= min, `${label}: informe ao menos ${min} caracteres.`);
  return s;
};

const STATUS_LABEL = {
  OPEN: 'Aberto',
  IN_TRIAGE: 'Em triagem',
  IN_PROGRESS: 'Em atendimento',
  WAITING_REQUESTER: 'Aguardando Solicitante',
  WAITING_THIRD_PARTY: 'Aguardando Terceiro/Fornecedor',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
  REOPENED: 'Reaberto',
};
const ACTIVE = [
  'OPEN',
  'IN_TRIAGE',
  'IN_PROGRESS',
  'WAITING_REQUESTER',
  'WAITING_THIRD_PARTY',
  'REOPENED',
];
const STAFF = ['TRIAGE_AGENT', 'SPECIALIST', 'LEADER'];
const EVIDENCE_REQUIRED = ['PDV', 'Pagamentos', 'Impressora'];
const ROLES = ['REQUESTER', 'TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER', 'LEADER'];

const authorOf = (u) =>
  ({
    REQUESTER: `${u.name} · ${u.id}`,
    SUPPLIER: `${u.name} · ${u.supplier}`,
    TRIAGE_AGENT: `${u.name} · N1`,
    SPECIALIST: `${u.name} · Especialista`,
    LEADER: `${u.name} · Líder`,
  })[u.role] || u.name;
const commentAuthor = (u) => (u.role === 'SUPPLIER' ? `${u.name} · ${u.supplier}` : u.name);

// ───────────────────────── autenticação ─────────────────────────
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function signToken(u) {
  const unit = db.units.find((x) => x.id === u.unitId);
  const payload = {
    ...clean(u),
    city: unit ? unit.city : null,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_S,
  };
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64(payload)}.fake-signature`;
}
function authenticate(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  need(m, 'Autenticação necessária.', 401);
  let payload;
  try {
    payload = JSON.parse(Buffer.from(m[1].split('.')[1], 'base64url').toString('utf8'));
  } catch {
    throw new HttpError(401, 'Token inválido.');
  }
  need(payload.exp * 1000 > Date.now(), 'Sessão expirada.', 401);
  const user = db.users.find((u) => u.id === payload.id);
  need(user && user.active, 'Usuário inativo ou inexistente.', 401);
  return user;
}
const allow = (user, ...roles) =>
  need(roles.includes(user.role), 'Seu perfil não permite esta ação.', 403);

// ───────────────────────── regras de chamados ─────────────────────────
const visibleTo = (u, t) => {
  if (u.role === 'REQUESTER') return t.kind === 'chamado' && t.unitId === u.unitId;
  if (u.role === 'SUPPLIER')
    return (
      t.kind === 'chamado' && (t.assigneeId === u.id || (t.supplier && t.supplier.userId === u.id))
    );
  return true;
};

function sweepAutoClose() {
  let changed = false;
  for (const t of db.tickets) {
    if (
      t.status === 'RESOLVED' &&
      t.resolution &&
      Date.now() - toMs(t.resolution.at) > 48 * HOUR_MS
    ) {
      t.status = 'CLOSED';
      t.closedAuto = now();
      addHistory(
        t,
        'Sistema',
        'Resolvido',
        'Fechado',
        'Fechamento automático: mais de 48h sem manifestação após a resolução.',
        'close',
      );
      changed = true;
    }
  }
  if (changed) saveDb();
}

function addHistory(t, author, from, to, txt, kind) {
  t.history.unshift({ id: uid('h'), at: now(), author, from, to, text: txt, kind });
}
function accrue(t) {
  if (t.sla.runningSince) {
    t.sla.consumedMin += minutesBetween(toMs(t.sla.runningSince), Date.now());
    t.sla.runningSince = null;
  }
}
function setStatus(t, user, to, txt, kind) {
  const from = STATUS_LABEL[t.status];
  t.status = to;
  addHistory(t, authorOf(user), from, STATUS_LABEL[to], txt, kind);
}
function notify(userIds, title, txt, ticketId, exceptId) {
  const ids = [...new Set(userIds.filter((x) => x && x !== exceptId))].filter((id) =>
    db.users.some((u) => u.id === id),
  );
  for (const userId of ids)
    db.notifications.unshift({
      id: uid('n'),
      userId,
      title,
      text: txt,
      ticketId,
      at: now(),
      read: false,
    });
}
const usersWithRole = (...roles) =>
  db.users.filter((u) => u.active && roles.includes(u.role)).map((u) => u.id);
const involved = (t) => [t.requester.id, t.assigneeId, t.supplier && t.supplier.userId];

function loadTicket(user, id) {
  const t = db.tickets.find((x) => x.id === id);
  need(t && visibleTo(user, t), 'Chamado não encontrado.', 404);
  return t;
}
function loadChamado(user, id) {
  const t = loadTicket(user, id);
  need(t.kind === 'chamado', 'Ação disponível apenas para chamados.');
  return t;
}
const hasEvidenceSincePause = (t) =>
  t.sla.pausedSince && t.evidences.some((e) => toMs(e.at) >= toMs(t.sla.pausedSince));

function pushEvidence(t, file, by, kind, note) {
  need(file && text(file.name), 'Arquivo inválido.');
  t.evidences.push({
    id: uid('e'),
    name: text(file.name),
    sizeKb: Math.max(1, Number(file.sizeKb) || 1),
    by,
    at: now(),
    note,
    kind,
  });
}
function pushComment(t, user, txt, file) {
  const author = commentAuthor(user);
  t.comments.push({ id: uid('c'), author, at: now(), text: txt });
  if (file) pushEvidence(t, file, user.name, 'complementar', `recebida de ${user.name}`);
}

// ───────────────────────── handlers ─────────────────────────
const routes = [];
const route = (method, pattern, opts, handler) => {
  const keys = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$',
  );
  routes.push({ method, regex, keys, public: !!opts.public, handler });
};
const ok = (body, status = 200) => ({ status, body });

// ── público
route('POST', '/login', { public: true }, ({ body }) => {
  const user = db.users.find((u) => u.email.toLowerCase() === text(body.username).toLowerCase());
  need(user && user.password === body.password, 'E-mail ou senha inválidos.', 401);
  need(user.active, 'Seu acesso ainda não foi ativado pelo administrador.', 403);
  return ok({ token: signToken(user) });
});

route('POST', '/register', { public: true }, ({ body }) => {
  const name = text(body.name),
    email = text(body.email).toLowerCase();
  need(name.length >= 3, 'Informe seu nome completo.');
  need(/^\S+@\S+\.\S+$/.test(email), 'Informe um e-mail válido.');
  need(String(body.password || '').length >= 6, 'A senha deve ter ao menos 6 caracteres.');
  need(
    db.units.some((u) => u.id === body.unitId),
    'Selecione uma unidade válida.',
  );
  need(
    !db.users.some((u) => u.email.toLowerCase() === email),
    'Já existe um cadastro com este e-mail.',
    409,
  );
  db.users.push({
    id: `USR-${20000 + ++db.counters.seq}`,
    name,
    email,
    role: 'REQUESTER',
    unitId: body.unitId,
    supplier: null,
    device: null,
    active: false,
    password: body.password,
  });
  saveDb();
  return ok({ message: 'Cadastro registrado. Aguarde a ativação pelo administrador.' }, 201);
});

route('POST', '/forgot-password', { public: true }, () => ok(null, 204));
route('GET', '/units', { public: true }, () => ok(db.units));

// ── unidades (admin)
route('POST', '/units', {}, ({ user, body }) => {
  allow(user, 'LEADER');
  const id = text(body.id);
  need(
    id && text(body.city) && text(body.uf).length === 2 && text(body.manager),
    'Preencha todos os campos da unidade.',
  );
  need(['Loja', 'Centro de distribuição'].includes(body.type), 'Tipo de unidade inválido.');
  need(
    !db.units.some((u) => u.id.toLowerCase() === id.toLowerCase()),
    `A unidade ${id} já está cadastrada.`,
    409,
  );
  const unit = {
    id,
    type: body.type,
    city: text(body.city),
    uf: text(body.uf).toUpperCase(),
    manager: text(body.manager),
  };
  db.units.push(unit);
  saveDb();
  return ok(unit, 201);
});
route('PUT', '/units/:id', {}, ({ user, params, body }) => {
  allow(user, 'LEADER');
  const unit = db.units.find((u) => u.id === params.id);
  need(unit, 'Unidade não encontrada.', 404);
  need(
    text(body.city) && text(body.uf).length === 2 && text(body.manager),
    'Preencha todos os campos da unidade.',
  );
  need(['Loja', 'Centro de distribuição'].includes(body.type), 'Tipo de unidade inválido.');
  Object.assign(unit, {
    type: body.type,
    city: text(body.city),
    uf: text(body.uf).toUpperCase(),
    manager: text(body.manager),
  });
  saveDb();
  return ok(unit);
});

route('DELETE', '/units/:id', {}, ({ user, params }) => {
  allow(user, 'LEADER');

  const id = decodeURIComponent(params.id);
  const index = db.units.findIndex((u) => u.id === id);

  need(index !== -1, 'Unidade não encontrada.', 404);

  const [deleted] = db.units.splice(index, 1);
  saveDb();

  return ok(deleted);
});

// ── usuários
route('GET', '/users', {}, ({ user, query }) => {
  allow(user, ...STAFF);
  let list = db.users;
  if (query.role) list = list.filter((u) => u.role === query.role);
  if (query.active !== undefined) list = list.filter((u) => String(u.active) === query.active);
  if (query.assignable === 'true')
    list = list.filter(
      (u) => u.active && ['TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER'].includes(u.role),
    );
  return ok(
    list.map((u) => {
      const unit = db.units.find((x) => x.id === u.unitId);
      return { ...clean(u), city: unit ? unit.city : null };
    }),
  );
});
route('POST', '/users', {}, ({ user, body }) => {
  allow(user, 'LEADER');
  const name = text(body.name),
    email = text(body.email).toLowerCase();
  need(name.length >= 3 && /^\S+@\S+\.\S+$/.test(email), 'Informe nome e e-mail válidos.');
  need(ROLES.includes(body.role), 'Perfil inválido.');
  need(
    !db.users.some((u) => u.email.toLowerCase() === email),
    'Já existe um usuário com este e-mail.',
    409,
  );
  if (body.role === 'REQUESTER')
    need(
      db.units.some((u) => u.id === body.unitId),
      'Selecione a unidade do usuário.',
    );
  if (body.role === 'SUPPLIER') need(text(body.supplier), 'Informe o fornecedor.');
  const created = {
    id: `${body.role === 'SUPPLIER' ? 'EXT' : 'USR'}-${20000 + ++db.counters.seq}`,
    name,
    email,
    role: body.role,
    unitId: body.role === 'REQUESTER' ? body.unitId : null,
    supplier: body.role === 'SUPPLIER' ? text(body.supplier) : null,
    device: null,
    active: true,
    password: PASSWORD,
  };
  db.users.push(created);
  db.accessLogs.unshift({
    id: uid('l'),
    at: now(),
    by: authorOf(user),
    title: `Usuário ${name} cadastrado`,
    text: `Perfil ${body.role}. Senha provisória definida pelo administrador.`,
  });
  saveDb();
  return ok(clean(created), 201);
});
route('PATCH', '/users/:id', {}, ({ user, params, body }) => {
  allow(user, 'LEADER');
  const target = db.users.find((u) => u.id === params.id);
  need(target, 'Usuário não encontrado.', 404);
  need(ROLES.includes(body.role), 'Perfil inválido.');
  const why = long(body.justification, 'Justificativa');
  need(
    !(target.id === user.id && (!body.active || body.role !== 'LEADER')),
    'Você não pode inativar ou rebaixar o seu próprio acesso.',
    409,
  );
  if (body.role === 'REQUESTER')
    need(target.unitId, 'Este usuário não possui unidade vinculada para o perfil Loja/CD.');
  if (body.role === 'SUPPLIER')
    need(target.supplier, 'Este usuário não possui fornecedor vinculado para o perfil Fornecedor.');
  const before = `${target.role}/${target.active ? 'ativo' : 'inativo'}`;
  target.role = body.role;
  target.active = !!body.active;
  db.accessLogs.unshift({
    id: uid('l'),
    at: now(),
    by: authorOf(user),
    title: `Acesso de ${target.name} atualizado`,
    text: `${before} → ${target.role}/${target.active ? 'ativo' : 'inativo'}. Justificativa: ${why}`,
  });
  saveDb();
  return ok(clean(target));
});
route('GET', '/access-logs', {}, ({ user, query }) => {
  allow(user, 'LEADER');
  return ok(
    [...db.accessLogs].sort((a, b) => b.at.localeCompare(a.at)).slice(0, Number(query.limit) || 20),
  );
});

// ── notificações (sempre do usuário autenticado)
route('GET', '/notifications', {}, ({ user }) =>
  ok(db.notifications.filter((n) => n.userId === user.id).sort((a, b) => b.at.localeCompare(a.at))),
);
route('POST', '/notifications/read-all', {}, ({ user }) => {
  db.notifications.filter((n) => n.userId === user.id).forEach((n) => (n.read = true));
  saveDb();
  return ok(null, 204);
});
route('PATCH', '/notifications/:id', {}, ({ user, params }) => {
  const n = db.notifications.find((x) => x.id === params.id && x.userId === user.id);
  need(n, 'Notificação não encontrada.', 404);
  n.read = true;
  saveDb();
  return ok(null, 204);
});

// ── chamados: consulta
route('GET', '/tickets', {}, ({ user, query }) => {
  sweepAutoClose();
  const q = text(query.search).toLowerCase();
  const from = query.from ? new Date(`${query.from}T00:00:00`).getTime() : null;
  const to = query.to ? new Date(`${query.to}T23:59:59`).getTime() : null;
  const list = db.tickets
    .filter((t) => visibleTo(user, t))
    .filter((t) => !query.kind || t.kind === query.kind)
    .filter((t) => !query.parentId || t.parentId === query.parentId)
    .filter((t) => !query.unitId || t.unitId === query.unitId)
    .filter((t) => !query.status || t.status === query.status)
    .filter((t) => !query.priority || t.priority === query.priority)
    .filter((t) => !query.assignee || t.assignee === query.assignee)
    .filter((t) => !query.category || t.category === query.category)
    .filter((t) => from === null || toMs(t.openedAt) >= from)
    .filter((t) => to === null || toMs(t.openedAt) <= to)
    .filter((t) => !q || [t.id, t.title, t.description].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  return ok(list);
});
route('GET', '/tickets/:id', {}, ({ user, params }) => {
  sweepAutoClose();
  return ok(loadTicket(user, params.id));
});

// ── chamados: abertura
route('POST', '/tickets', {}, ({ user, body }) => {
  allow(user, 'REQUESTER', ...STAFF);
  const unitId = user.unitId || body.unitId;
  need(
    db.units.some((u) => u.id === unitId),
    'Selecione a unidade do chamado.',
  );
  need(text(body.category), 'Informe a categoria.');
  const description = long(body.description, 'Descrição');
  const impact = long(body.impact, 'Impacto', 5);
  need(text(body.errorCode), 'Informe o código de erro (ou N/A).');
  need(
    !EVIDENCE_REQUIRED.includes(body.category) || (body.evidence && text(body.evidence.name)),
    'Adicione a evidência exigida para esta categoria.',
  );
  const unit = db.units.find((u) => u.id === unitId);
  const year = new Date().getFullYear();
  const t = {
    id: `NX-${year}-${String(db.counters.ticket++).padStart(5, '0')}`,
    kind: 'chamado',
    title: text(body.title) || description.slice(0, 60),
    description,
    category: body.category,
    errorCode: text(body.errorCode),
    impact,
    affectsOthers: !!body.affectsOthers,
    scope: body.affectsOthers ? 'outros' : 'este',
    status: 'OPEN',
    severity: null,
    priority: null,
    urgency: '',
    requester: { id: user.id, name: user.name },
    unitId,
    device: user.device || '—',
    assignee: 'Fila N1',
    assigneeId: null,
    supplier: null,
    openedAt: now(),
    evidences: [],
    comments: [],
    history: [],
    sla: {
      consumedMin: 0,
      runningSince: now(),
      pausedSince: null,
      pauseReason: null,
      firstResponse: null,
      concludedAt: null,
      attentionAt: null,
      violatedAt: null,
    },
    parentId: null,
    childIds: [],
    group: null,
    groupDismissed: null,
    resolution: null,
    cancellation: null,
    reopening: null,
    closedAuto: null,
    reassessments: [],
    escalations: [],
  };
  if (body.evidence)
    pushEvidence(t, body.evidence, user.name, 'inicial', 'foto inicial da operação');
  addHistory(
    t,
    authorOf(user),
    null,
    'Aberto',
    `${t.title}. Contexto ${unitId} · ${unit.city} · ${t.device} capturado.`,
    'open',
  );
  db.tickets.push(t);
  notify(
    usersWithRole('TRIAGE_AGENT'),
    'Novo chamado na fila',
    `${t.id} · ${t.title} aguarda triagem.`,
    t.id,
    user.id,
  );
  saveDb();
  return ok(t, 201);
});

// ── chamados: ações
const action = (name, handler) =>
  route('POST', `/tickets/:id/${name}`, {}, (ctx) => {
    const t = handler({ ...ctx, t: loadChamado(ctx.user, ctx.params.id) });
    saveDb();
    return ok(t);
  });

action('start-triage', ({ user, t }) => {
  allow(user, 'TRIAGE_AGENT', 'LEADER');
  need(t.status === 'OPEN', 'Apenas chamados Abertos podem iniciar a triagem.');
  setStatus(t, user, 'IN_TRIAGE', 'Triagem iniciada.', 'triage');
  return t;
});

action('triage', ({ user, t, body }) => {
  allow(user, 'TRIAGE_AGENT', 'LEADER');
  need(['OPEN', 'IN_TRIAGE'].includes(t.status), 'O chamado já foi classificado.');
  need(['S1', 'S2', 'S3', 'S4'].includes(body.severity), 'Selecione a severidade.');
  const urgency = long(body.urgency, 'Urgência');
  const why = long(body.justification, 'Justificativa');
  const assignee = db.users.find(
    (u) =>
      u.id === body.assigneeId &&
      u.active &&
      ['TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER'].includes(u.role),
  );
  need(assignee, 'Selecione um responsável válido.');

  const wasOpen = t.status === 'OPEN';
  t.severity = body.severity;
  t.urgency = urgency;
  t.scope = body.scope === 'outros' ? 'outros' : 'este';
  if (!t.priority) t.priority = `P${body.severity.slice(1)}`;
  if (wasOpen)
    setStatus(
      t,
      user,
      'IN_TRIAGE',
      `Classificação: ${body.severity}; ${t.priority}. ${why}`,
      'triage',
    );

  const previous = t.assignee;
  t.assigneeId = assignee.id;
  t.assignee = assignee.role === 'SUPPLIER' ? `${assignee.supplier} · Fornecedor` : assignee.name;
  t.supplier =
    assignee.role === 'SUPPLIER'
      ? { org: assignee.supplier, contact: assignee.name, userId: assignee.id }
      : t.supplier;
  if (!t.sla.runningSince && !t.sla.pausedSince) t.sla.runningSince = now();
  if (!t.sla.firstResponse)
    t.sla.firstResponse = {
      by: user.name,
      at: now(),
      text: `Chamado classificado e atribuído a ${t.assignee}.`,
    };
  setStatus(
    t,
    user,
    'IN_PROGRESS',
    `Responsável anterior: ${previous}; novo: ${t.assignee}. ${why} Primeira resposta registrada.`,
    'assign',
  );

  notify([assignee.id], 'Chamado atribuído', `${t.id} foi atribuído a você.`, t.id, user.id);
  notify(
    [t.requester.id],
    'Chamado em atendimento',
    `${t.id} foi classificado (${t.severity}/${t.priority}) e está em atendimento.`,
    t.id,
    user.id,
  );
  return t;
});

action('comments', ({ user, t, body }) => {
  need(
    !['CLOSED', 'CANCELLED'].includes(t.status),
    'Chamados fechados ou cancelados não aceitam comentários.',
  );
  pushComment(t, user, long(body.text, 'Comentário', 1), body.evidence);
  const toRequester = user.role !== 'REQUESTER';
  notify(
    toRequester ? [t.requester.id, t.assigneeId] : [t.assigneeId],
    'Novo comentário',
    `${commentAuthor(user)} comentou em ${t.id}.`,
    t.id,
    user.id,
  );
  return t;
});

action('evidences', ({ user, t, body }) => {
  need(['laudo', 'complementar'].includes(body.kind), 'Tipo de evidência inválido.');
  need(!['CLOSED', 'CANCELLED'].includes(t.status), 'Chamado encerrado.');
  if (body.kind === 'laudo') {
    need(
      user.role === 'SUPPLIER' || STAFF.includes(user.role),
      'Seu perfil não pode anexar laudo.',
      403,
    );
    need(
      t.status === 'WAITING_THIRD_PARTY',
      'O laudo só pode ser anexado enquanto o chamado aguarda o fornecedor.',
    );
  }
  pushEvidence(
    t,
    body,
    user.name,
    body.kind,
    body.kind === 'laudo' ? `laudo recebido de ${user.name}` : `recebida de ${user.name}`,
  );
  notify(
    involved(t),
    'Evidência recebida',
    `${user.name} anexou ${body.name} em ${t.id}.`,
    t.id,
    user.id,
  );
  return t;
});

action('wait', ({ user, t, body }) => {
  allow(user, ...STAFF);
  need(t.status === 'IN_PROGRESS', 'A espera só pode ser registrada em chamados Em atendimento.');
  const reason = long(body.reason, 'Motivo da espera');
  need(['requester', 'third-party'].includes(body.kind), 'Estado de espera inválido.');
  if (body.kind === 'third-party' && !t.supplier) {
    const s = db.users.find((u) => u.id === body.supplierId && u.active && u.role === 'SUPPLIER');
    need(s, 'Selecione o fornecedor.');
    t.supplier = { org: s.supplier, contact: s.name, userId: s.id };
  }
  accrue(t);
  t.sla.pausedSince = now();
  t.sla.pauseReason = reason;
  const to = body.kind === 'requester' ? 'WAITING_REQUESTER' : 'WAITING_THIRD_PARTY';
  setStatus(
    t,
    user,
    to,
    `${reason}. Início da pausa ${now().slice(11, 16)}; fim em aberto. TMS congelado.`,
    'pause',
  );
  notify(
    body.kind === 'requester' ? [t.requester.id] : [t.supplier.userId],
    'Informação solicitada',
    `${t.id}: ${reason}`,
    t.id,
    user.id,
  );
  return t;
});

function resumeSla(t) {
  t.sla.pausedSince = null;
  t.sla.runningSince = now();
}

action('resume', ({ user, t, body }) => {
  need(
    user.role === 'SUPPLIER' || STAFF.includes(user.role),
    'Seu perfil não permite retomar.',
    403,
  );
  need(
    t.status === 'WAITING_THIRD_PARTY',
    'Apenas chamados aguardando terceiro/fornecedor podem ser retomados.',
  );
  need(
    hasEvidenceSincePause(t),
    'Nenhuma evidência recebida desde o início da pausa. Anexe o laudo técnico antes de retomar.',
  );
  const why = long(body.text, 'Motivo da retomada');
  const note = `${why}. Motivo preservado: ${t.sla.pauseReason}. Início da pausa ${t.sla.pausedSince.slice(11, 16)}; fim ${now().slice(11, 16)}.`;
  resumeSla(t);
  t.sla.pauseReason = null;
  setStatus(t, user, 'IN_PROGRESS', note, 'resume');
  notify(involved(t), 'Atendimento retomado', `${t.id} voltou para Em atendimento.`, t.id, user.id);
  return t;
});

action('send-info', ({ user, t, body }) => {
  allow(user, 'REQUESTER', ...STAFF);
  need(t.status === 'WAITING_REQUESTER', 'O chamado não aguarda informação do solicitante.');
  const info = long(body.text, 'Informação');
  pushComment(t, user, info, body.evidence);
  const note = `Informação recebida de ${user.name}. Motivo preservado: ${t.sla.pauseReason}. Início da pausa ${t.sla.pausedSince.slice(11, 16)}; fim ${now().slice(11, 16)}.`;
  resumeSla(t);
  t.sla.pauseReason = null;
  setStatus(t, user, 'IN_PROGRESS', note, 'resume');
  notify(
    [t.assigneeId],
    'Atendimento retomado',
    `${user.name} respondeu em ${t.id}.`,
    t.id,
    user.id,
  );
  return t;
});

action('resolve', ({ user, t, body }) => {
  need(
    user.role === 'SUPPLIER' || STAFF.includes(user.role),
    'Seu perfil não pode resolver chamados.',
    403,
  );
  need(t.status === 'IN_PROGRESS', 'Apenas chamados Em atendimento podem ser resolvidos.');
  const solution = long(body.text, 'Solução aplicada');
  accrue(t);
  t.sla.concludedAt = now();
  t.resolution = { text: solution, by: authorOf(user), at: now() };
  setStatus(t, user, 'RESOLVED', `Solução registrada: ${solution}`, 'resolve');
  notify(
    [t.requester.id],
    'Chamado resolvido',
    `${t.id} foi resolvido. Informe se o problema continuar.`,
    t.id,
    user.id,
  );
  return t;
});

action('cancel', ({ user, t, body }) => {
  allow(user, ...STAFF);
  need(ACTIVE.includes(t.status), 'Apenas chamados ativos podem ser cancelados.');
  const why = long(body.text, 'Justificativa do cancelamento');
  accrue(t);
  t.sla.pausedSince = null;
  t.cancellation = { text: why, by: authorOf(user), at: now() };
  setStatus(t, user, 'CANCELLED', `Cancelado: ${why}`, 'cancel');
  notify(involved(t), 'Chamado cancelado', `${t.id} foi cancelado.`, t.id, user.id);
  return t;
});

action('reopen', ({ user, t, body }) => {
  allow(user, 'REQUESTER', ...STAFF);
  need(t.status === 'RESOLVED', 'Apenas chamados Resolvidos podem ser reabertos.');
  const why = long(body.text, 'Justificativa da reabertura');
  t.reopening = { text: why, by: authorOf(user), at: now() };
  t.sla.concludedAt = null;
  setStatus(
    t,
    user,
    'REOPENED',
    `Problema continua: ${why} Solução anterior e SLA consumido preservados.`,
    'reopen',
  );
  notify(
    [t.assigneeId, ...usersWithRole('TRIAGE_AGENT')],
    'Chamado reaberto',
    `${t.id} foi reaberto pelo solicitante.`,
    t.id,
    user.id,
  );
  return t;
});

action('continue', ({ user, t }) => {
  allow(user, ...STAFF);
  need(t.status === 'REOPENED', 'Apenas chamados Reabertos podem ter o atendimento continuado.');
  t.sla.runningSince = now();
  setStatus(
    t,
    user,
    'IN_PROGRESS',
    'Atendimento continuado após reabertura. SLA consumido preservado.',
    'continue',
  );
  return t;
});

action('reassess', ({ user, t, body }) => {
  allow(user, 'REQUESTER', ...STAFF);
  need(
    ACTIVE.includes(t.status) && t.status !== 'OPEN',
    'A reavaliação só é possível após a triagem.',
  );
  const why = long(body.text, 'Justificativa');
  t.reassessments.push({ text: why, by: authorOf(user), at: now() });
  addHistory(
    t,
    authorOf(user),
    STATUS_LABEL[t.status],
    STATUS_LABEL[t.status],
    `Reavaliação de prioridade solicitada: ${why}`,
    'reassessment',
  );
  notify(usersWithRole('TRIAGE_AGENT'), 'Reavaliação solicitada', `${t.id}: ${why}`, t.id, user.id);
  return t;
});

action('escalate', ({ user, t, body }) => {
  allow(user, ...STAFF);
  need(ACTIVE.includes(t.status), 'Apenas chamados ativos podem ter o escalonamento revisado.');
  const why = long(body.text, 'Justificativa da revisão');
  t.escalations.push({ text: why, by: authorOf(user), at: now() });
  addHistory(
    t,
    authorOf(user),
    STATUS_LABEL[t.status],
    STATUS_LABEL[t.status],
    `Revisão de escalonamento registrada: ${why}`,
    'escalation',
  );
  notify(usersWithRole('LEADER'), 'Revisão de escalonamento', `${t.id}: ${why}`, t.id, user.id);
  return t;
});

// ── incidentes
route('POST', '/incidents/link', {}, ({ user, body }) => {
  allow(user, 'TRIAGE_AGENT', 'LEADER');
  const why = long(body.justification, 'Justificativa do vínculo');
  need(
    Array.isArray(body.childIds) && body.childIds.length >= 1,
    'Selecione os chamados a vincular.',
  );
  const children = body.childIds.map((id) => db.tickets.find((t) => t.id === id));
  need(
    children.every((c) => c && c.kind === 'chamado' && !c.parentId),
    'Há chamados inexistentes ou já vinculados a um incidente.',
  );
  const first = children[0];
  let parent;
  if (body.parentId === 'novo') {
    const year = new Date().getFullYear();
    parent = {
      id: `NX-${year}-${String(db.counters.ticket++).padStart(5, '0')}`,
      kind: 'incidente-pai',
      title: `Incidente Pai · falhas de ${first.category} (${first.unitId})`,
      description: `Incidente pai para acompanhamento conjunto de ${children.length} chamados de ${first.category}.`,
      category: first.category,
      errorCode: '—',
      impact: '',
      affectsOthers: false,
      scope: 'este',
      status: 'OPEN',
      severity: null,
      priority: null,
      urgency: '',
      requester: { id: null, name: 'Registros de origem' },
      unitId: first.unitId,
      device: [...new Set(children.map((c) => c.device))].join(' / '),
      assignee: 'Fila N1',
      assigneeId: null,
      supplier: null,
      openedAt: now(),
      evidences: [],
      comments: [],
      history: [],
      sla: {
        consumedMin: 0,
        runningSince: null,
        pausedSince: null,
        pauseReason: null,
        firstResponse: null,
        concludedAt: null,
        attentionAt: null,
        violatedAt: null,
      },
      parentId: null,
      childIds: [],
      group: null,
      groupDismissed: null,
      resolution: null,
      cancellation: null,
      reopening: null,
      closedAuto: null,
      reassessments: [],
      escalations: [],
    };
    addHistory(
      parent,
      authorOf(user),
      null,
      'Aberto',
      'Incidente pai criado a partir de sugestão de agrupamento.',
      'open',
    );
    db.tickets.push(parent);
  } else {
    parent = db.tickets.find((t) => t.id === body.parentId && t.kind === 'incidente-pai');
    need(parent, 'Incidente pai não encontrado.', 404);
  }
  if (!parent.group)
    parent.group = {
      text: why,
      by: authorOf(user),
      at: now(),
      criterion: 'Mesma categoria e unidade em janela curta de abertura; confirmação humana.',
      evidenceNote: children
        .map((c) => `${c.id} (${c.evidences.map((e) => e.name).join(', ') || 'sem evidência'})`)
        .join('; '),
    };
  for (const c of children) {
    c.parentId = parent.id;
    if (!parent.childIds.includes(c.id)) parent.childIds.push(c.id);
    addHistory(c, authorOf(user), null, `Vinculado ao incidente ${parent.id}`, why, 'link');
    notify(
      involved(c),
      'Chamado vinculado a incidente',
      `${c.id} foi vinculado a ${parent.id}. Status e prioridade mantidos.`,
      c.id,
      user.id,
    );
  }
  addHistory(
    parent,
    authorOf(user),
    null,
    'Vínculo confirmado',
    `${children.length} chamado(s) vinculado(s): ${children.map((c) => c.id).join(', ')}. ${why}`,
    'link',
  );
  saveDb();
  return ok({ parentId: parent.id });
});

route('POST', '/incidents/discard', {}, ({ user, body }) => {
  allow(user, 'TRIAGE_AGENT', 'LEADER');
  const why = long(body.justification, 'Justificativa do descarte');
  const children = (body.childIds || [])
    .map((id) => db.tickets.find((t) => t.id === id))
    .filter(Boolean);
  need(children.length >= 1, 'Selecione os chamados da sugestão.');
  for (const c of children) {
    c.groupDismissed = { text: why, by: authorOf(user), at: now() };
    addHistory(c, authorOf(user), null, 'Sugestão de incidente descartada', why, 'link');
  }
  saveDb();
  return ok(null, 204);
});

// ───────────────────────── servidor ─────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 5e6) reject(new HttpError(413, 'Corpo muito grande.'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new HttpError(400, 'JSON inválido.'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(status === 204 || body === null ? '' : JSON.stringify(body));
  };

  try {
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const query = Object.fromEntries(url.searchParams);
    let matched = null;
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.regex.exec(pathname);
      if (m) {
        matched = {
          r,
          params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])),
        };
        break;
      }
    }
    need(matched, 'Rota não encontrada.', 404);
    const user = matched.r.public ? null : authenticate(req);
    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {};
    const out = matched.r.handler({ user, params: matched.params, query, body });
    send(out.status, out.body);
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { message: e.message });
    console.error(e);
    send(500, { message: 'Erro interno da API fake.' });
  }
});

if (require.main === module) {
  loadDb();
  server.listen(PORT, () =>
    console.log(`API fake em http://localhost:${PORT}  (senha de todos os usuários: ${PASSWORD})`),
  );
}

module.exports = { server, loadDb, getDb: () => db };
