/**
 * Massa de dados do BD fake. Todas as datas são relativas ao momento da geração
 * (rode `npm run api:reset` para "rejuvenescer" os SLAs). Não faz parte do app.
 */
const pad = (n) => String(n).padStart(2, '0');
const toIso = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const PASSWORD = 'demo@nexo123';

function buildDb(nowMs = Date.now()) {
  const a = (minAgo) => toIso(nowMs - minAgo * 60000);
  let seq = 0;
  const id = (p) => `${p}${++seq}`;

  const units = [
    { id: 'Loja 042', type: 'Loja', city: 'Recife', uf: 'PE', manager: 'Ana Silva' },
    { id: 'Loja 015', type: 'Loja', city: 'Salvador', uf: 'BA', manager: 'Bruno Rocha' },
    { id: 'Loja 028', type: 'Loja', city: 'Natal', uf: 'RN', manager: 'Lúcia Moura' },
    { id: 'Loja 009', type: 'Loja', city: 'Maceió', uf: 'AL', manager: 'Rita Gomes' },
    { id: 'CD 003', type: 'Centro de distribuição', city: 'Jaboatão', uf: 'PE', manager: 'Pedro Alves' },
    { id: 'CD 001', type: 'Centro de distribuição', city: 'Recife', uf: 'PE', manager: 'Sérgio Lima' },
  ];

  const user = (o) => ({ unitId: null, supplier: null, device: null, active: true, password: PASSWORD, ...o });
  const users = [
    user({ id: 'USR-02518', name: 'Ana Silva', email: 'ana.silva@nexovarejo.com.br', role: 'REQUESTER', unitId: 'Loja 042', device: 'PDV-07' }),
    user({ id: 'USR-03001', name: 'Bruno Rocha', email: 'bruno.rocha@nexovarejo.com.br', role: 'REQUESTER', unitId: 'Loja 015', device: 'PDV-03' }),
    user({ id: 'USR-03002', name: 'Fernanda Dias', email: 'fernanda.dias@nexovarejo.com.br', role: 'REQUESTER', unitId: 'Loja 009', device: null, active: false }),
    user({ id: 'USR-00841', name: 'Marina Costa', email: 'marina.costa@nexovarejo.com.br', role: 'TRIAGE_AGENT' }),
    user({ id: 'USR-00877', name: 'Rafael Melo', email: 'rafael.melo@nexovarejo.com.br', role: 'SPECIALIST' }),
    user({ id: 'USR-00915', name: 'João Santos', email: 'joao.santos@nexovarejo.com.br', role: 'SPECIALIST' }),
    user({ id: 'EXT-00072', name: 'Carlos Nunes', email: 'carlos@tecprint.com.br', role: 'SUPPLIER', supplier: 'TecPrint' }),
    user({ id: 'USR-00102', name: 'Paulo Lima', email: 'paulo.lima@nexovarejo.com.br', role: 'LEADER' }),
  ];

  const sla = (p = {}) => ({
    consumedMin: 0, runningSince: null, pausedSince: null, pauseReason: null,
    firstResponse: null, concludedAt: null, attentionAt: null, violatedAt: null, ...p,
  });
  const h = (at, author, from, to, text, kind) => ({ id: id('h'), at, author, from, to, text, kind });
  const ev = (name, sizeKb, by, at, note, kind) => ({ id: id('e'), name, sizeKb, by, at, note, kind });
  const cm = (author, at, text) => ({ id: id('c'), author, at, text });

  const ticket = (o) => ({
    kind: 'chamado', description: '', errorCode: '—', impact: '', affectsOthers: false, scope: 'este',
    status: 'OPEN', severity: null, priority: null, urgency: '',
    requester: { id: null, name: '' }, device: '—', assignee: 'Fila N1', assigneeId: null, supplier: null,
    evidences: [], comments: [], history: [], sla: sla(), parentId: null, childIds: [], group: null,
    groupDismissed: null, resolution: null, cancellation: null, reopening: null, closedAuto: null,
    reassessments: [], escalations: [], ...o,
  });

  const ANA = 'Ana Silva · USR-02518';
  const MARINA = 'Marina Costa · N1';
  const SYSTEM = 'Sistema';

  const tickets = [
    ticket({
      id: 'NX-2026-01842', title: 'Venda não finaliza no terminal', category: 'PDV', unitId: 'Loja 042',
      openedAt: a(245), device: 'PDV-07', errorCode: 'E204',
      requester: { id: 'USR-02518', name: 'Ana Silva' },
      description: 'O PDV-07 retorna o erro E204 ao finalizar a venda. O pagamento não foi confirmado e a venda permanece aberta. Os demais terminais continuam operando; os clientes foram direcionados aos outros caixas.',
      impact: 'Um terminal sem finalizar vendas.',
      urgency: 'Venda pendente e fila no caixa; sem alternativa neste terminal.',
      status: 'IN_PROGRESS', severity: 'S2', priority: 'P2', assignee: 'Marina Costa', assigneeId: 'USR-00841',
      evidences: [
        ev('terminal-pdv07.jpg', 310, 'Ana Silva', a(245), 'foto inicial da operação', 'inicial'),
        ev('erro-pdv.jpg', 482, 'Ana Silva', a(200), 'recebida de Ana Silva', 'complementar'),
      ],
      comments: [
        cm('Marina Costa', a(223), 'Ana, envie uma foto da mensagem de erro para continuarmos o diagnóstico.'),
        cm('Ana Silva', a(200), 'Foto enviada. O erro E204 permanece no terminal PDV-07.'),
      ],
      sla: sla({ consumedMin: 22, runningSince: a(200), firstResponse: { by: 'Marina Costa', at: a(231), text: 'Assumi o diagnóstico do terminal PDV-07.' } }),
      history: [
        h(a(200), MARINA, 'Aguardando Solicitante', 'Em atendimento', 'Foto recebida de Ana Silva. Motivo preservado: foto do erro. Início da pausa 10:42; fim 11:05.', 'resume'),
        h(a(223), MARINA, 'Em atendimento', 'Aguardando Solicitante', 'Foto do erro solicitada. Fim da pausa em aberto.', 'pause'),
        h(a(231), MARINA, 'Em triagem', 'Em atendimento', 'Atribuído a Marina Costa. Primeira resposta registrada.', 'assign'),
        h(a(232), MARINA, 'Aberto', 'Em triagem', 'Classificação inicial: S2 Alta; P2 persistida.', 'triage'),
        h(a(245), ANA, null, 'Aberto', 'Venda não finaliza no terminal. Contexto Loja 042 · Recife · PDV-07 capturado.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01841', title: 'Pagamento TEF sem retorno', category: 'Pagamentos', unitId: 'Loja 015',
      openedAt: a(97), device: 'PDV-03', errorCode: 'TEF-504',
      requester: { id: 'USR-03001', name: 'Bruno Rocha' },
      description: 'Pagamento TEF sem retorno na Loja 015 · Salvador. Rafael Melo acompanha o atendimento do terminal PDV-03.',
      impact: 'Vendas com cartão sem confirmação no PDV-03.',
      status: 'IN_PROGRESS', severity: 'S2', priority: 'P1', assignee: 'Rafael Melo', assigneeId: 'USR-00877',
      evidences: [ev('log-tef.txt', 4, 'Bruno Rocha', a(97), 'relato de falha no TEF', 'relato')],
      sla: sla({ runningSince: a(97), firstResponse: { by: 'Rafael Melo', at: a(87), text: 'Em análise do retorno do TEF.' } }),
      history: [
        h(a(87), 'Rafael Melo · Especialista', 'Em triagem', 'Em atendimento', 'Assumiu o atendimento. Primeira resposta registrada.', 'assign'),
        h(a(97), 'Bruno Rocha · USR-03001', null, 'Aberto', 'Pagamento TEF sem retorno. Contexto Loja 015 · Salvador · PDV-03 capturado.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01843', title: 'Terminal trava ao concluir venda', category: 'PDV', unitId: 'Loja 042',
      openedAt: a(240), device: 'PDV-08', errorCode: 'E204',
      requester: { id: 'USR-02518', name: 'Ana Silva' },
      description: 'O PDV-08 trava ao concluir a venda e retorna o erro E204.',
      impact: 'Um terminal não conclui vendas; fila direcionada aos outros caixas.',
      status: 'IN_TRIAGE', severity: 'S2', priority: 'P2',
      evidences: [ev('captura-pdv08.jpg', 390, 'Ana Silva', a(240), 'captura inicial', 'inicial')],
      sla: sla({ runningSince: a(240) }),
      history: [
        h(a(235), MARINA, 'Aberto', 'Em triagem', 'Triagem iniciada.', 'triage'),
        h(a(240), ANA, null, 'Aberto', 'Terminal trava ao concluir venda. Contexto Loja 042 · Recife · PDV-08 capturado.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01844', title: 'Falha na confirmação da venda', category: 'PDV', unitId: 'Loja 042',
      openedAt: a(233), device: 'PDV-09', errorCode: 'E204',
      requester: { id: 'USR-02518', name: 'Ana Silva' },
      description: 'Falha na confirmação da venda no PDV-09 (E204).',
      impact: 'Vendas não confirmadas no terminal.',
      status: 'OPEN', severity: 'S2', priority: 'P2',
      evidences: [ev('relato-falha-pdv09.txt', 2, 'Ana Silva', a(233), 'relato de falha na confirmação', 'relato')],
      sla: sla({ runningSince: a(233) }),
      history: [h(a(233), ANA, null, 'Aberto', 'Falha na confirmação da venda. Contexto Loja 042 · Recife · PDV-09 capturado.', 'open')],
    }),
    ticket({
      id: 'NX-2026-01845', title: 'Wi-Fi sem sinal no depósito', category: 'Rede', unitId: 'Loja 009',
      openedAt: a(14), device: 'Access point',
      requester: { id: null, name: 'Rita Gomes' },
      description: 'Sem sinal de Wi-Fi no depósito da Loja 009 · Maceió; coletores sem comunicação.',
      impact: 'Conferência de mercadorias parada no depósito.',
      sla: sla({ runningSince: a(14) }),
      history: [h(a(14), 'Rita Gomes', null, 'Aberto', 'Wi-Fi sem sinal no depósito. Contexto Loja 009 · Maceió capturado.', 'open')],
    }),
    ticket({
      id: 'NX-2026-01846', title: 'Switch sem comunicação com o PDV', category: 'Rede', unitId: 'Loja 009',
      openedAt: a(8), device: 'Switch',
      requester: { id: null, name: 'Rita Gomes' },
      description: 'Switch do balcão sem comunicação; PDV sem acesso à rede da loja.',
      impact: 'Caixa do balcão sem rede.',
      sla: sla({ runningSince: a(8) }),
      history: [h(a(8), 'Rita Gomes', null, 'Aberto', 'Switch sem comunicação com o PDV. Contexto Loja 009 · Maceió capturado.', 'open')],
    }),
    ticket({
      id: 'NX-2026-01839', title: 'Impressora não emite etiquetas', category: 'Impressora', unitId: 'CD 003',
      openedAt: a(445), device: 'Impressora', errorCode: 'PRT-12',
      requester: { id: null, name: 'Pedro Alves' },
      description: 'Impressora não emite etiquetas no CD 003 · Jaboatão. O chamado está atribuído à TecPrint e aguarda laudo técnico para continuar o diagnóstico.',
      impact: 'Expedição sem etiquetas.',
      status: 'WAITING_THIRD_PARTY', severity: 'S3', priority: 'P3',
      assignee: 'TecPrint · Fornecedor', assigneeId: 'EXT-00072',
      supplier: { org: 'TecPrint', contact: 'Carlos Nunes', userId: 'EXT-00072' },
      evidences: [ev('foto-impressora.jpg', 220, 'Pedro Alves', a(445), 'foto inicial da operação', 'inicial')],
      comments: [cm('Carlos Nunes · TecPrint', a(145), 'Laudo técnico em elaboração. Aguardamos a avaliação da impressora para orientar a continuidade do atendimento.')],
      sla: sla({ consumedMin: 300, pausedSince: a(145), pauseReason: 'laudo técnico', firstResponse: { by: 'Carlos Nunes', at: a(385), text: 'Chamado recebido pela TecPrint.' } }),
      history: [
        h(a(145), 'Carlos Nunes · TecPrint', 'Em atendimento', 'Aguardando Terceiro/Fornecedor', 'Laudo técnico pendente. Fim da pausa em aberto. TMS congelado.', 'pause'),
        h(a(385), 'Carlos Nunes · TecPrint', 'Em triagem', 'Em atendimento', 'Atribuído à TecPrint. Primeira resposta registrada.', 'assign'),
        h(a(445), 'Pedro Alves', null, 'Aberto', 'Impressora não emite etiquetas. Contexto CD 003 · Jaboatão capturado.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01838', title: 'Acesso ao portal de serviços', category: 'Serviços', unitId: 'Loja 028',
      openedAt: a(1335), device: 'Portal',
      requester: { id: null, name: 'Lúcia Moura' },
      description: 'Sem acesso ao portal de serviços na Loja 028 · Natal.',
      impact: 'Atualizações cadastrais bloqueadas.',
      status: 'IN_TRIAGE', severity: 'S4', priority: 'P4',
      sla: sla({ runningSince: a(1335) }),
      history: [
        h(a(1300), MARINA, 'Aberto', 'Em triagem', 'Triagem iniciada.', 'triage'),
        h(a(1335), 'Lúcia Moura', null, 'Aberto', 'Acesso ao portal de serviços. Contexto Loja 028 · Natal capturado.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01837', title: 'Cupom com impressão incompleta', category: 'Impressora', unitId: 'Loja 009',
      openedAt: a(1765), device: 'Impressora',
      requester: { id: null, name: 'Rita Gomes' },
      description: 'Cupom fiscal sai com impressão incompleta na Loja 009 · Maceió.',
      impact: 'Cupons ilegíveis.',
      status: 'RESOLVED', severity: 'S3', priority: 'P3', assignee: 'João Santos', assigneeId: 'USR-00915',
      evidences: [ev('cupom.jpg', 150, 'Rita Gomes', a(1765), 'foto inicial da operação', 'inicial')],
      resolution: { text: 'Cabeçote da impressora limpo e firmware atualizado. Impressão normalizada.', by: 'João Santos · Especialista', at: a(175) },
      sla: sla({ consumedMin: 210, concludedAt: a(175), firstResponse: { by: 'João Santos', at: a(1725), text: 'Em análise.' } }),
      history: [
        h(a(175), 'João Santos · Especialista', 'Em atendimento', 'Resolvido', 'Solução registrada: cabeçote limpo e firmware atualizado.', 'resolve'),
        h(a(1725), 'João Santos · Especialista', 'Em triagem', 'Em atendimento', 'Assumiu o atendimento.', 'assign'),
        h(a(1765), 'Rita Gomes', null, 'Aberto', 'Cupom com impressão incompleta.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01836', title: 'Atualização de cadastro de acesso', category: 'Serviços', unitId: 'CD 001',
      openedAt: a(6000), device: 'Portal',
      requester: { id: null, name: 'Sérgio Lima' },
      description: 'Atualização de cadastro de acesso no CD 001 · Recife.',
      impact: 'Colaborador sem acesso atualizado.',
      status: 'CLOSED', severity: 'S4', priority: 'P4', assignee: 'João Santos', assigneeId: 'USR-00915',
      resolution: { text: 'Cadastro atualizado e acesso validado.', by: 'João Santos · Especialista', at: a(5700) },
      closedAuto: a(2800),
      sla: sla({ consumedMin: 300, concludedAt: a(5700), firstResponse: { by: 'João Santos', at: a(5900), text: 'Em análise.' } }),
      history: [
        h(a(2800), SYSTEM, 'Resolvido', 'Fechado', 'Fechamento automático: mais de 48h sem manifestação após a resolução.', 'close'),
        h(a(5700), 'João Santos · Especialista', 'Em atendimento', 'Resolvido', 'Cadastro atualizado.', 'resolve'),
        h(a(6000), 'Sérgio Lima', null, 'Aberto', 'Atualização de cadastro de acesso.', 'open'),
      ],
    }),
    ticket({
      id: 'NX-2026-01840', kind: 'incidente-pai', title: 'Incidente Pai · falhas na conclusão de vendas',
      category: 'PDV', unitId: 'Loja 042', openedAt: a(230), device: 'PDV-07 / PDV-08 / PDV-09',
      description: 'Incidente pai para acompanhamento conjunto de falhas na conclusão de vendas.',
      requester: { id: null, name: 'Registros de origem' },
      history: [h(a(230), MARINA, null, 'Aberto', 'Incidente pai criado para agrupar falhas de conclusão de venda.', 'open')],
    }),
  ];

  const n = (userId, title, text, ticketId, minAgo, read) => ({ id: id('n'), userId, title, text, ticketId, at: a(minAgo), read });
  const notifications = [
    n('USR-00841', '80% do TMS atingido', 'NX-2026-01841 consumiu 80% do prazo de solução. Revise a necessidade de escalonamento.', 'NX-2026-01841', 5, false),
    n('USR-00841', 'Atendimento retomado', 'Foto recebida; o atendimento de NX-2026-01842 foi retomado.', 'NX-2026-01842', 200, false),
    n('USR-02518', 'Informação solicitada', 'Marina Costa solicitou uma foto da mensagem de erro.', 'NX-2026-01842', 223, true),
    n('EXT-00072', 'Chamado atribuído', 'NX-2026-01839 foi atribuído à TecPrint.', 'NX-2026-01839', 385, true),
  ];

  const accessLogs = [
    { id: id('l'), at: a(2000), by: 'Paulo Lima · Líder / Gestor', title: 'Acesso de Carlos Nunes atualizado', text: 'Perfil mantido como Fornecedor; situação ativa. Justificativa: revisão trimestral de acessos externos.' },
  ];

  return { users, units, tickets, notifications, accessLogs, counters: { ticket: 1847, seq } };
}

module.exports = { buildDb, PASSWORD, toIso };
