/* Teste de contrato da API fake: node fake-api/test.js (sobe um servidor temporário). */
const path = require('path');
const os = require('os');
process.env.DB_FILE = path.join(os.tmpdir(), `nexo-test-${process.pid}.json`);
process.argv.push('--reset');
const { server, loadDb } = require('./server');

let passed = 0;
const failures = [];
const check = (name, cond, extra) => {
  if (cond) passed++;
  else failures.push(`${name}${extra ? ' → ' + JSON.stringify(extra) : ''}`);
};

(async () => {
  loadDb();
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, token, body) => {
    const res = await fetch(base + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await res.text();
    return { status: res.status, body: txt ? JSON.parse(txt) : null };
  };
  const login = async (email) =>
    (await call('POST', '/login', null, { username: email, password: 'demo@nexo123' })).body?.token;
  const T = {
    ana: await login('ana.silva@nexovarejo.com.br'),
    marina: await login('marina.costa@nexovarejo.com.br'),
    rafael: await login('rafael.melo@nexovarejo.com.br'),
    carlos: await login('carlos@tecprint.com.br'),
    paulo: await login('paulo.lima@nexovarejo.com.br'),
  };
  check('logins', Object.values(T).every(Boolean), T);

  // auth
  check(
    'login inválido 401',
    (await call('POST', '/login', null, { username: 'x@y.com', password: 'z' })).status === 401,
  );
  check(
    'login inativo 403',
    (
      await call('POST', '/login', null, {
        username: 'fernanda.dias@nexovarejo.com.br',
        password: 'demo@nexo123',
      })
    ).status === 403,
  );
  check('sem token 401', (await call('GET', '/tickets')).status === 401);
  const payload = JSON.parse(Buffer.from(T.ana.split('.')[1], 'base64url').toString());
  check(
    'token com role/city/exp',
    payload.role === 'REQUESTER' &&
      payload.city === 'Recife' &&
      payload.exp > Date.now() / 1000 &&
      !payload.password,
    payload,
  );

  // register
  check(
    'register público',
    (
      await call('POST', '/register', null, {
        name: 'Novo Teste',
        email: 'novo@x.com',
        unitId: 'Loja 042',
        password: 'abcdef',
      })
    ).status === 201,
  );
  check(
    'register duplicado 409',
    (
      await call('POST', '/register', null, {
        name: 'Novo Teste',
        email: 'novo@x.com',
        unitId: 'Loja 042',
        password: 'abcdef',
      })
    ).status === 409,
  );
  check('units público', (await call('GET', '/units')).body.length === 6);

  // escopo
  const ana = (await call('GET', '/tickets', T.ana)).body;
  check(
    'requester só vê a unidade e sem incidente pai',
    ana.length > 0 && ana.every((t) => t.unitId === 'Loja 042' && t.kind === 'chamado'),
  );
  const carlos = (await call('GET', '/tickets', T.carlos)).body;
  check(
    'fornecedor só vê atribuídos',
    carlos.length === 1 && carlos[0].id === 'NX-2026-01839',
    carlos.map((t) => t.id),
  );
  check(
    'requester não vê outra unidade 404',
    (await call('GET', '/tickets/NX-2026-01841', T.ana)).status === 404,
  );
  const all = (await call('GET', '/tickets', T.marina)).body;
  check('N1 vê tudo', all.length === 11);
  check(
    'filtro status',
    (await call('GET', '/tickets?status=OPEN', T.marina)).body.every((t) => t.status === 'OPEN'),
  );
  check('filtro busca', (await call('GET', '/tickets?search=tef', T.marina)).body.length === 1);
  check(
    'filtro kind',
    (await call('GET', '/tickets?kind=incidente-pai&category=PDV&unitId=Loja%20042', T.marina)).body
      .length === 1,
  );

  // abertura
  const bad = await call('POST', '/tickets', T.ana, {
    category: 'PDV',
    description: 'curta',
    impact: 'x',
    errorCode: '',
  });
  check('abertura inválida 422', bad.status === 422, bad.body);
  const noEv = await call('POST', '/tickets', T.ana, {
    category: 'PDV',
    title: '',
    description: 'Terminal travado ao fechar a venda',
    impact: 'Caixa parado',
    errorCode: 'E1',
    affectsOthers: false,
    evidence: null,
  });
  check('evidência obrigatória', noEv.status === 422, noEv.body);
  const created = await call('POST', '/tickets', T.ana, {
    category: 'Rede',
    title: 'Rede caiu',
    description: 'A rede da loja caiu por completo',
    impact: 'Sem vendas',
    errorCode: 'N/A',
    affectsOthers: true,
    evidence: null,
  });
  check(
    'abertura 201',
    created.status === 201 && created.body.status === 'OPEN' && created.body.history.length === 1,
    created.body,
  );
  const newId = created.body.id;
  check(
    'requester não faz triagem 403',
    (await call('POST', `/tickets/${newId}/triage`, T.ana, {})).status === 403,
  );
  check(
    'N1 notificado',
    (await call('GET', '/notifications', T.marina)).body.some((n) => n.ticketId === newId),
  );

  // triagem
  check(
    'triagem inválida 422',
    (
      await call('POST', `/tickets/${newId}/triage`, T.marina, {
        severity: 'S2',
        urgency: 'x',
        assigneeId: 'USR-00877',
        justification: 'y',
      })
    ).status === 422,
  );
  check(
    'start-triage',
    (await call('POST', `/tickets/${newId}/start-triage`, T.marina, {})).body.status ===
      'IN_TRIAGE',
  );
  const tri = await call('POST', `/tickets/${newId}/triage`, T.marina, {
    severity: 'S2',
    urgency: 'Loja inteira sem rede',
    scope: 'outros',
    assigneeId: 'USR-00877',
    justification: 'Classificado como alta e enviado ao especialista.',
  });
  check(
    'triagem ok',
    tri.status === 200 &&
      tri.body.status === 'IN_PROGRESS' &&
      tri.body.priority === 'P2' &&
      tri.body.assigneeId === 'USR-00877' &&
      tri.body.sla.firstResponse,
    tri.body,
  );
  check(
    'já classificado 422',
    (
      await call('POST', `/tickets/${newId}/triage`, T.marina, {
        severity: 'S1',
        urgency: 'Loja inteira sem rede',
        assigneeId: 'USR-00877',
        justification: 'Classificar de novo agora',
      })
    ).status === 422,
  );

  // comentário + pausa/retomada solicitante
  check(
    'comentário',
    (await call('POST', `/tickets/${newId}/comments`, T.ana, { text: 'Alguma novidade?' })).body
      .comments.length === 1,
  );
  check(
    'N1 pede info',
    (
      await call('POST', `/tickets/${newId}/wait`, T.rafael, {
        kind: 'requester',
        reason: 'Informar o modelo do roteador da loja',
      })
    ).body.status === 'WAITING_REQUESTER',
  );
  check(
    'requester não retoma via resume 403/422',
    [403, 422].includes(
      (await call('POST', `/tickets/${newId}/resume`, T.ana, { text: 'voltei com a info' })).status,
    ),
  );
  const sent = await call('POST', `/tickets/${newId}/send-info`, T.ana, {
    text: 'Roteador modelo XR-200 da marca Acme.',
    evidence: { name: 'roteador.jpg', sizeKb: 40 },
  });
  check(
    'send-info retoma',
    sent.body.status === 'IN_PROGRESS' &&
      sent.body.sla.pausedSince === null &&
      sent.body.evidences.length === 1,
    sent.body,
  );

  // fornecedor / laudo
  const t39 = 'NX-2026-01839';
  check(
    'resume sem laudo 422',
    (
      await call('POST', `/tickets/${t39}/resume`, T.carlos, {
        text: 'Retomando o atendimento agora',
      })
    ).status === 422,
  );
  check(
    'laudo',
    (
      await call('POST', `/tickets/${t39}/evidences`, T.carlos, {
        name: 'laudo.pdf',
        sizeKb: 90,
        kind: 'laudo',
      })
    ).status === 200,
  );
  const res39 = await call('POST', `/tickets/${t39}/resume`, T.carlos, {
    text: 'Laudo recebido e conferido; seguir diagnóstico.',
  });
  check(
    'resume com laudo',
    res39.body.status === 'IN_PROGRESS' && res39.body.sla.runningSince,
    res39.body,
  );

  // resolver / reabrir / continuar
  check(
    'requester não resolve 403',
    (await call('POST', `/tickets/${newId}/resolve`, T.ana, { text: 'resolvido por mim agora' }))
      .status === 403,
  );
  const resolved = await call('POST', `/tickets/${newId}/resolve`, T.rafael, {
    text: 'Roteador reiniciado e configuração restaurada.',
  });
  check(
    'resolve',
    resolved.body.status === 'RESOLVED' &&
      resolved.body.resolution &&
      resolved.body.sla.runningSince === null &&
      resolved.body.sla.concludedAt,
  );
  const reopened = await call('POST', `/tickets/${newId}/reopen`, T.ana, {
    text: 'A rede caiu de novo agora cedo.',
  });
  check('reopen', reopened.body.status === 'REOPENED' && reopened.body.reopening);
  check(
    'continue',
    (await call('POST', `/tickets/${newId}/continue`, T.marina, {})).body.status === 'IN_PROGRESS',
  );
  check(
    'reassess',
    (
      await call('POST', `/tickets/${newId}/reassess`, T.ana, {
        text: 'Impacto maior que o previsto na loja.',
      })
    ).body.reassessments.length === 1,
  );
  check(
    'escalate',
    (
      await call('POST', `/tickets/${newId}/escalate`, T.marina, {
        text: 'Avaliado: manter com especialista.',
      })
    ).body.escalations.length === 1,
  );
  const cancelled = await call('POST', `/tickets/${newId}/cancel`, T.marina, {
    text: 'Duplicado do NX-2026-01845.',
  });
  check('cancel', cancelled.body.status === 'CANCELLED' && cancelled.body.cancellation);
  check(
    'comentar cancelado 422',
    (await call('POST', `/tickets/${newId}/comments`, T.ana, { text: 'oi' })).status === 422,
  );

  // incidentes
  const link = await call('POST', '/incidents/link', T.marina, {
    childIds: ['NX-2026-01845', 'NX-2026-01846'],
    parentId: 'novo',
    justification: 'Mesma causa: switch do corredor de rede.',
  });
  check('link novo incidente', link.status === 200 && link.body.parentId, link.body);
  const parent = (await call('GET', `/tickets/${link.body.parentId}`, T.marina)).body;
  check(
    'pai com filhos',
    parent.kind === 'incidente-pai' && parent.childIds.length === 2 && parent.group,
  );
  check(
    'filhos vinculados',
    (await call('GET', `/tickets?parentId=${parent.id}`, T.marina)).body.length === 2,
  );
  const disc = await call('POST', '/incidents/discard', T.marina, {
    childIds: ['NX-2026-01842', 'NX-2026-01843', 'NX-2026-01844'],
    justification: 'Falhas independentes entre si.',
  });
  check(
    'discard',
    disc.status === 204 &&
      (await call('GET', '/tickets/NX-2026-01843', T.marina)).body.groupDismissed,
  );

  // notificações
  const notes = (await call('GET', '/notifications', T.ana)).body;
  check('notificações', notes.length >= 1);
  check(
    'marcar lida',
    (await call('PATCH', `/notifications/${notes[0].id}`, T.ana, { read: true })).status === 204,
  );
  check(
    'ler todas',
    (await call('POST', '/notifications/read-all', T.ana, {})).status === 204 &&
      (await call('GET', '/notifications', T.ana)).body.every((n) => n.read),
  );

  // admin
  check('users 403 para requester', (await call('GET', '/users', T.ana)).status === 403);
  check(
    'users assignable',
    (await call('GET', '/users?assignable=true', T.marina)).body.every((u) =>
      ['TRIAGE_AGENT', 'SPECIALIST', 'SUPPLIER'].includes(u.role),
    ),
  );
  check(
    'users role supplier',
    (await call('GET', '/users?role=SUPPLIER', T.marina)).body.length === 1,
  );
  const users = (await call('GET', '/users', T.paulo)).body;
  check('users sem senha', users.length >= 8 && users.every((u) => !('password' in u)));
  const fern = users.find((u) => u.email.startsWith('fernanda'));
  check(
    'patch sem justificativa 422',
    (
      await call('PATCH', `/users/${fern.id}`, T.paulo, {
        role: 'REQUESTER',
        active: true,
        justification: 'x',
      })
    ).status === 422,
  );
  check(
    'ativar usuário',
    (
      await call('PATCH', `/users/${fern.id}`, T.paulo, {
        role: 'REQUESTER',
        active: true,
        justification: 'Cadastro validado com a gerência.',
      })
    ).body.active === true,
  );
  check('login após ativar', !!(await login('fernanda.dias@nexovarejo.com.br')));
  const self = users.find((u) => u.role === 'LEADER');
  check(
    'não rebaixar a si mesmo 409',
    (
      await call('PATCH', `/users/${self.id}`, T.paulo, {
        role: 'SPECIALIST',
        active: true,
        justification: 'Teste de autoproteção.',
      })
    ).status === 409,
  );
  check(
    'criar usuário',
    (
      await call('POST', '/users', T.paulo, {
        name: 'Fornecedor Dois',
        email: 'f2@acme.com',
        role: 'SUPPLIER',
        supplier: 'Acme',
      })
    ).status === 201,
  );
  check('log de acesso', (await call('GET', '/access-logs?limit=1', T.paulo)).body.length === 1);
  check(
    'criar unidade',
    (
      await call('POST', '/units', T.paulo, {
        id: 'Loja 050',
        type: 'Loja',
        city: 'Olinda',
        uf: 'pe',
        manager: 'Zé',
      })
    ).body.uf === 'PE',
  );
  check(
    'unidade duplicada 409',
    (
      await call('POST', '/units', T.paulo, {
        id: 'Loja 050',
        type: 'Loja',
        city: 'Olinda',
        uf: 'PE',
        manager: 'Zé',
      })
    ).status === 409,
  );
  check(
    'editar unidade',
    (
      await call('PUT', '/units/Loja%20050', T.paulo, {
        type: 'Loja',
        city: 'Paulista',
        uf: 'PE',
        manager: 'Zé',
      })
    ).body.city === 'Paulista',
  );

  server.close();
  require('fs').rmSync(process.env.DB_FILE, { force: true });
  console.log(`${passed} verificações OK`);
  if (failures.length) {
    console.error(`\n${failures.length} FALHA(S):\n- ` + failures.join('\n- '));
    process.exit(1);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
