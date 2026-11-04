# Controle de SLA — guia de implementação e demonstração

Este documento descreve somente o complemento de controle de SLA feito sobre o backend existente.

## Regras implementadas

1. **Pausa/retomada:** ao mudar o status para `WAITING_REQUESTER` ou `WAITING_THIRD_PARTY`, o backend registra o início da pausa. Ao sair desses status, acumula o tempo coberto de pausa e retoma a contagem. Os segundos acumulados são persistidos no PostgreSQL.
2. **Alerta de 80%:** um agendador verifica os chamados periodicamente. Quando o tempo de resolução consumido atinge 80% do TMS, grava `SLA_WARNING_80` no histórico. O campo `sla_80_alerted_at` evita emitir o mesmo alerta novamente para o chamado.
3. **Fechamento automático:** quando um chamado fica `RESOLVED` por 48 horas sem uma resposta posterior do solicitante, o agendador muda o status para `CLOSED`, registra `closed_at` e grava eventos de auditoria.
4. **Resposta do solicitante:** a nova rota registra a resposta. Se o chamado estava resolvido, reabre o chamado; se estava aguardando o solicitante, retoma o relógio e move o status para `IN_PROGRESS`.
5. **Histórico:** a rota de eventos mostra os registros de criação, classificação, mudanças de status, pausas, retomadas, alertas e fechamento automático.

O cálculo TMR/TMS por prioridade, cobertura semanal, fuso horário e feriados que já existia foi mantido e complementado para considerar o tempo pausado.

## Como executar

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up --build
```

O backend fica em `http://localhost:8080`. A aplicação usa `X-User-Id` como identidade de desenvolvimento, conforme o projeto original. Os usuários de desenvolvimento são inseridos pela migration `V2__seed_dev_data.sql` (por exemplo, solicitantes e agentes de suporte).

Se preferir executar somente o banco via Docker e o backend localmente:

```bash
docker compose up -d nvs-db
cd backend
./gradlew bootRun
```

> A primeira execução precisa baixar as imagens/dependências. Neste ambiente de preparação, não foi possível executar Gradle porque o ambiente não conseguiu acessar `services.gradle.org`; execute os testes no seu Mac com acesso à internet antes de apresentar como validado.

## Endpoints novos

Todos os endpoints usam o header `X-User-Id`, seguindo o padrão atual do projeto.

### 1. Pausar o relógio (solicitando informação)

```http
PATCH /api/v1/tickets/1/status
X-User-Id: 4
Content-Type: application/json

{"status":"WAITING_REQUESTER"}
```

### 2. Pausar enquanto aguarda terceiro

```http
PATCH /api/v1/tickets/1/status
X-User-Id: 4
Content-Type: application/json

{"status":"WAITING_THIRD_PARTY"}
```

### 3. Retomar o relógio

```http
PATCH /api/v1/tickets/1/status
X-User-Id: 4
Content-Type: application/json

{"status":"IN_PROGRESS"}
```

`X-User-Id: 4` é um exemplo baseado na ordem de inserção dos dados de desenvolvimento; confira os IDs no seu banco. Somente usuários que não sejam `REQUESTER` podem mudar status, e o serviço impede alterações genéricas para `RESOLVED`, `CLOSED` e `CANCELLED`.

### 4. Resposta do solicitante

```http
POST /api/v1/tickets/1/requester-responses
X-User-Id: 1
Content-Type: application/json

{"message":"Testei novamente e o problema continua."}
```

O solicitante só pode responder aos próprios chamados. Se o chamado estiver `RESOLVED`, ele será reaberto.

### 5. Consultar o histórico

```http
GET /api/v1/tickets/1/events
X-User-Id: 4
```

Procure os tipos `SLA_PAUSED`, `SLA_RESUMED`, `SLA_WARNING_80`, `AUTO_CLOSED`, `REQUESTER_RESPONDED` e `STATUS_CHANGED`.

## Teste do alerta

O agendador verifica os chamados a cada 60 segundos por padrão. Para facilitar testes locais, ajuste temporariamente no `.env`:

```dotenv
SLA_SCHEDULER_DELAY_MS=5000
```

Reinicie o backend após mudar a variável. Para gerar o alerta, crie um chamado, classifique-o com uma prioridade e deixe o TMS atingir 80% do prazo. O alerta é gravado no histórico; o campo `sla.resolutionWarning80Percent` da resposta também informa se o limiar foi atingido.

## Teste do fechamento sem esperar 48 horas

O padrão continua sendo **48 horas**. Para uma demonstração local rápida, configure temporariamente:

```dotenv
SLA_AUTO_CLOSE_HOURS=0
SLA_SCHEDULER_DELAY_MS=5000
```

Reinicie a aplicação, resolva um chamado e aguarde a próxima execução do agendador. O chamado deve passar a `CLOSED` e o histórico deve conter `AUTO_CLOSED`. Depois do teste, restaure `SLA_AUTO_CLOSE_HOURS=48`.

## Testes automatizados

Na pasta `backend`:

```bash
./gradlew test
```

Foram adicionados testes unitários para a pausa/retomada no cálculo do tempo e para o limiar de 80%. A execução do Gradle precisa ser confirmada no ambiente local, pois a máquina usada para preparar este ZIP não conseguiu baixar a distribuição do Gradle.

## Arquivos complementados

- `Ticket.java`: campos persistidos de pausa, alerta, última resposta do solicitante e fechamento.
- `SlaService.java`: desconta pausas dos tempos consumidos e estende os deadlines.
- `TicketService.java`: regras de mudança de status, pausa/retomada e resposta do solicitante.
- `SlaScheduler.java`: verificação periódica do alerta de 80% e fechamento automático.
- `TicketController.java`: rotas HTTP para status, resposta do solicitante e histórico.
- `TicketEventRepository.java` e `TicketEventResponse.java`: consulta do histórico.
- `TicketSlaResponse.java`: expõe o estado da pausa e o indicador de 80%.
- `V4__sla_pause_alert_auto_close.sql`: adiciona as colunas e permite os novos tipos de evento.
- `SlaServiceTest.java`: testes do cálculo de pausa e do alerta.
