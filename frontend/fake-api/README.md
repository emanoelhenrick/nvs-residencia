# API fake (BD fake) do Nexo Varejo

Servidor HTTP **sem dependências** (só Node ≥ 18) que simula o backend: login com JWT, escopo por perfil,
regras de SLA, triagem, pausa/retomada, incidentes, notificações e administração. Os dados ficam em
`fake-api/db.json` (alterações feitas pelo app são gravadas lá).

```bash
node fake-api/server.js            # http://localhost:3000  (PORT=4000 para trocar)
node fake-api/server.js --reset    # recria o db.json com datas relativas a "agora" (rejuvenesce os SLAs)
node fake-api/test.js              # teste de contrato da API (sobe um servidor temporário)
```

CORS está liberado — não precisa de proxy. O front aponta para `environment.api` (`src/environment/enviroment.ts`).

## Contas de teste (senha de todas: `demo@nexo123`)

| Perfil            | E-mail                           | Observação                                   |
|-------------------|----------------------------------|----------------------------------------------|
| Loja/CD (REQUESTER) | ana.silva@nexovarejo.com.br    | Loja 042 · tem chamados ativos                |
| Loja/CD           | bruno.rocha@nexovarejo.com.br    | Loja 015 (não enxerga a Loja 042)             |
| Loja/CD (inativa) | fernanda.dias@nexovarejo.com.br  | Cadastro pendente: ative em Admin → Usuários |
| Triagem (TRIAGE_AGENT) | marina.costa@nexovarejo.com.br | Fila N1, sugestões de incidente            |
| Especialista      | rafael.melo@nexovarejo.com.br    | Atende o chamado P1 em atenção               |
| Especialista      | joao.santos@nexovarejo.com.br    |                                              |
| Fornecedor        | carlos@tecprint.com.br           | Só vê o chamado atribuído à TecPrint         |
| Líder             | paulo.lima@nexovarejo.com.br     | Administração                                |

## Contrato (o que o front chama)

Autenticação: `Authorization: Bearer <token>` (o token é um JWT sem assinatura real; o payload é o `IUser` + `exp`).
Erros vêm como `{ "message": "..." }` com 401/403/404/409/422.

| Método e rota | Perfis | Descrição |
|---|---|---|
| `POST /login` `{username,password}` | público | `{token}`; 401 credencial inválida; 403 usuário inativo |
| `POST /register` · `POST /forgot-password` | público | cadastro nasce **inativo**; recuperação sempre 204 |
| `GET /units` | público | usado no cadastro |
| `POST /units` · `PUT /units/:id` | LEADER | cadastro/edição de unidade |
| `GET /users?role=&active=&assignable=` | N1, especialista, líder | sem senha |
| `POST /users` · `PATCH /users/:id` `{role,active,justification}` | LEADER | alteração gera registro em `/access-logs` |
| `GET /access-logs?limit=` | LEADER | mais recente primeiro |
| `GET /notifications` · `PATCH /notifications/:id` · `POST /notifications/read-all` | autenticado | sempre do próprio usuário |
| `GET /tickets?search&unitId&status&priority&assignee&category&from&to&kind&parentId` | autenticado | **já filtrado pelo escopo do perfil** |
| `GET /tickets/:id` | autenticado | 404 se fora do escopo |
| `POST /tickets` | solicitante, N1, especialista, líder | abre o chamado (status `OPEN`) |
| `POST /tickets/:id/start-triage` · `/triage` | N1, líder | classificação + atribuição (`IN_PROGRESS`) |
| `POST /tickets/:id/comments` · `/evidences` | conforme escopo | comentário (com anexo opcional) / laudo |
| `POST /tickets/:id/wait` · `/resume` · `/send-info` | ver regras | pausa/retoma o SLA |
| `POST /tickets/:id/resolve` · `/cancel` · `/reopen` · `/continue` | ver regras | ciclo de vida |
| `POST /tickets/:id/reassess` · `/escalate` | solicitante/staff · staff | registros auditáveis |
| `POST /incidents/link` · `/incidents/discard` | N1, líder | vínculo humano ao incidente pai / descarte |

Regras implementadas no servidor: escopo de visão (solicitante = sua unidade; fornecedor = só atribuídos),
SLA desde a abertura com pausa/retomada e saldo preservado, TMR na atribuição, laudo obrigatório para retomar
com fornecedor, fechamento automático após 48h de Resolvido, histórico imutável e notificações por evento.
O ator (`by`) vem do token — o front **não** envia `actor`.
