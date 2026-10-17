# LOGO NEXOS
# Plano de Testes — NVS (Nexo Varejo Suporte)

---

### SQUAD NEXOS
- **Alan Vitor** (QA, DevOps e Qualidade)
- **Emanoel Henrick Alves da Silva** (Tech Lead / Arquitetura)
- **Jennifer Zeferino Cruz de Lima** (Product & Delivery Lead)
- **Raiele Leite da Silva** (Frontend e Integração)
- **Rayssa Santana Ribeiro** (Backend e Banco de Dados)
- **Felipe Lopes de Vasconcelos** (Desenvolvedor)
- **José Leandro Ventura Rocha da Silva** (Desenvolvedor)
- **Lucas Vinicius** (Full-stack / Apoio Técnico)
- **Samara Mendonça** (UX/UI e Requisitos)

---

## 1. INTRODUÇÃO

### 1.1 Objeto de Teste
**NVS — Nexo Varejo Suporte**

### 1.2 Descrição do Objeto de Teste
O **NVS (Nexo Varejo Suporte)** é uma plataforma integrada desenvolvida para centralizar o atendimento técnico, a gestão de chamados operacionais e o acompanhamento de incidentes de lojas físicas, centros de distribuição e canais de e-commerce da rede Nexo Varejo.

A arquitetura do sistema é composta por:
- **Backend:** Desenvolvido em **Java 25 com Spring Boot 4.1.x**, com arquitetura em camadas (Domain-Driven / Clean Architecture), persistência com Spring Data JPA, PostgreSQL e autenticação stateless via Spring Security (JWT).
- **Frontend:** Desenvolvido em **Angular 20.3.x com TypeScript 5.9.x**, componentes modulares e comunicação REST.
- **Banco de Dados:** **PostgreSQL 16** com integridade relacional ACID.

Os principais atores do sistema são:
1. **Operador / Lojista:** Abertura de chamados, envio de evidências e acompanhamento de status.
2. **Analista de Suporte (N1 / N2):** Triagem, atendimento, atualização de progresso e resolução de chamados.
3. **Administrador do Sistema:** Gestão de usuários, catálogo de incidentes, SLAs e monitoramento de indicadores operacionais.

### 1.3 Objetivo de Teste
Estabelecer e formalizar o planejamento de garantia da qualidade (QA) do sistema NVS, em conformidade com as diretrizes da norma **ISO/IEC/IEEE 29119-3**, assegurando:
- A verificação precoce de regras de negócio (*Shift-Left Testing*);
- A integridade do ciclo de vida dos chamados e dos cálculos de SLA;
- A segurança e a proteção de rotas com controle de acesso baseado em papéis (RBAC);
- A estabilidade da interface do usuário no Angular e a resiliência na comunicação com a API;
- A execução contínua e automatizada de testes nas esteiras de integração contínua (CI/CD).

---

## 2. VERSÃO E HISTÓRICO DE ALTERAÇÕES

### Versão do Documento
**1.0**

### Histórico de Alterações

| Versão | Data | Alteração | Responsável |
| :---: | :---: | :--- | :--- |
| **1.0** | 08/10/2026 | Elaboração inicial do Plano de Testes alinhado ao escopo do NVS, definindo estratégia de automação com JUnit 5 / Spring Test (backend) e Jasmine / Karma (frontend), mapeamento de riscos, cenários e casos de teste. | Alan Vitor (QA Lead) & Squad NEXOS |

---

## 3. ESCOPO

### 3.1 Incluído no Escopo
- **Módulo de Chamados (Tickets):** Abertura, validação de campos obrigatórios, máquina de estados (transições de status) e cálculo de prazos de atendimento (SLA).
- **Módulo de Monitoramento e Saúde:** Verificação de integridade operacional do backend via endpoint `GET /health` e feedback visual no frontend.
- **Controle de Acesso e Segurança (RBAC):** Proteção de rotas da API contra acessos não autorizados e permissões por perfil (Lojista, Analista, Admin).
- **Camada de Apresentação (Frontend Angular):** Renderização de componentes, acessibilidade semântica (ARIA), estado operacional e integração do serviço de monitoramento.
- **Tratamento de Erros:** Respostas padronizadas para requisições com dados inválidos, métodos HTTP não suportados e falhas de comunicação.

### 3.2 Fora do Escopo
- Integrações físicas com periféricos de ponto de venda (impressoras fiscais, leitores de código de barras reais);
- Testes de estresse e carga de larga escala (> 50.000 requisições simultâneas);
- Migração de bases legadas de tickets de sistemas legados de anos anteriores.

---

## 4. EQUIPE E RESPONSABILIDADES

| Integrante | Papel | Responsabilidades no Processo de Teste |
| :--- | :--- | :--- |
| **Alan Vitor** | QA, DevOps & Qualidade | Elaboração do Plano de Testes, especificação de casos de teste, automação de testes com JUnit 5 e Jasmine/Karma, integração no pipeline de CI/CD. |
| **Emanoel Henrick** | Tech Lead / Arquitetura | Revisão técnica da arquitetura de testes, suporte na infraestrutura de CI e aprovação de padrões de código de teste. |
| **Jennifer Zeferino** | Product & Delivery Lead | Validação dos critérios de aceite, definição de prioridades (MoSCoW) e aceite final das funcionalidades entregues. |
| **Rayssa Santana** | Backend e Banco de Dados | Implementação das regras de domínio e apoio na criação de testes unitários e de integração no Spring Boot. |
| **Raiele Leite** | Frontend e Integração | Implementação dos componentes Angular e apoio na criação dos testes de interface e serviços com Jasmine/Karma. |
| **Felipe Lopes** | Desenvolvedor | Apoio na execução dos testes funcionais e correção de defeitos identificados. |
| **José Leandro** | Desenvolvedor | Apoio no desenvolvimento de regras de negócio e validação de cenários de teste. |
| **Lucas Vinicius** | Full-stack / Apoio Técnico | Apoio nas integrações e manutenção de scripts de build e teste. |
| **Samara Mendonça** | UX/UI e Requisitos | Validação de usabilidade, conformidade com o protótipo e acessibilidade das telas. |

---

## 5. RISCOS E CONTINGÊNCIAS

| # | Risco | Impacto | Probabilidade | Estratégia de Mitigação / Contingência |
| :-: | :--- | :---: | :---: | :--- |
| **R01** | **Regras de transição de status ambíguas** gerarem comportamentos inconsistentes no ciclo de vida do chamado. | Alto | Médio | Formalizar a máquina de estados no domínio com enums estritos e cobrir 100% das transições válidas e inválidas com testes unitários JUnit 5. |
| **R02** | **Falha de controle de acesso (RBAC)** permitindo que operadores acessem dados administrativos ou chamados de outras lojas. | Alto | Médio | Implementar testes de integração automatizados com `spring-security-test` e `MockMvc` validando que requisições não autenticadas ou com perfil inadequado recebam HTTP 401/403. |
| **R03** | **Condição de corrida na atribuição de chamados** simultaneamente para dois atendentes. | Alto | Médio | Testes de integração concorrentes simulando chamadas paralelas com controle de concorrência pessimista/otimista no banco de dados. |
| **R04** | **Falhas silenciosas de integração entre Frontend Angular e Backend Spring Boot.** | Médio | Médio | Criação de testes unitários de serviços com Jasmine e `provideHttpClientTesting`, garantindo parsing correto de DTOs e tratamento de falhas HTTP. |
| **R05** | **Execução de testes instável ou lenta na esteira de CI/CD.** | Médio | Baixo | Uso de navegadores headless otimizados (`ChromeHeadless` / Edge Chromium) e cache de dependências (Gradle e npm) nas GitHub Actions. |

---

## 6. ESTRATÉGIA DE TESTES

### 6.1 Tipos de Teste
- **Testes Funcionais:** Verificação de regras de negócio de chamados, cálculo de SLAs, validação de entradas obrigatórias e rotas da API.
- **Testes de Autorização e Segurança (RBAC):** Garantia de proteção de endpoints contra acesso anônimo e validação de permissões por papel.
- **Testes de Concorrência e Consistência:** Validação de atomicidade em operações críticas no banco de dados.
- **Testes de Usabilidade e Acessibilidade:** Conformidade visual, mensagens informativas de erro e atributos ARIA no frontend.
- **Testes de Regressão Contínua:** Execução automática da suíte a cada Pull Request nas branches `main` e `develop`.

### 6.2 Técnicas de Teste
- **Teste Baseado em Cenário:** Casos derivados diretamente dos critérios de aceite das Histórias de Usuário.
- **Partição de Equivalência:** Entradas válidas e inválidas para prioridades (`BAIXA`, `MEDIA`, `ALTA`, `CRITICA`), status (`ABERTO`, `EM_ATENDIMENTO`, `RESOLVIDO`, `FECHADO`) e tamanhos de campos.
- **Análise de Valor Limite:** Validação de limites mínimos e máximos (ex.: tamanho de título, SLA em horas: 2h, 4h, 8h, 24h).
- **Teste de Transição de Estado:** Matriz de transição de status de chamados (permitidas vs. bloqueadas).
- **Matriz de Controle de Acesso:** Matriz de perfis (Anônimo, Lojista, Atendente, Administrador) contra endpoints protegidos.

### 6.3 Níveis de Teste
1. **Unitário:**
   - **Backend:** Teste de regras de negócio isoladas, enums de status, regras de SLA e validação de modelos com **JUnit 5 (JUnit Jupiter)** e **AssertJ**.
   - **Frontend:** Teste de componentes, modelos e serviços isolados com **Jasmine**.
2. **Integração:**
   - **Backend:** Testes de controladores REST, filtros de segurança e serialização JSON utilizando **Spring Boot Test** (`@WebMvcTest`, `@SpringBootTest`) e **MockMvc**.
   - **Frontend:** Testes de serviços HTTP utilizando `provideHttpClientTesting` e `HttpTestingController` do Angular.
3. **Componentes / Sistema:**
   - Renderização completa de templates Angular, disparos de eventos e verificação do DOM com **Angular TestBed** e **Karma Runner** em modo headless.
4. **Aceitação:**
   - Homologação dos critérios de aceite das Histórias de Usuário prioritárias (*Must Have*) junto ao Product Owner.

### 6.4 Ferramentas e Ambientes

#### Ferramentas
- **Testes Backend (Unitário e Integração):** JUnit 5 (`org.junit.jupiter`), Spring Boot Starter Test, Spring Security Test, MockMvc, AssertJ.
- **Testes Frontend (Unitário e Componentes):** Jasmine Core 5.9, Karma 6.4, Karma Chrome Launcher, Angular Testing Utilities (`TestBed`).
- **Build & Automação:** Gradle Wrapper 9.7 (Backend), npm & Angular CLI 20.3 (Frontend).
- **Integração Contínua (CI):** GitHub Actions configurado em `.github/workflows/ci.yml`.

#### Ambientes
- **Ambiente Local:** Execução via Gradle (`./gradlew test`) e Karma headless (`npm test -- --watch=false --browsers=ChromeHeadless`).
- **Ambiente de CI:** Contêiner Ubuntu com JDK 25 (Temurin) e Node.js 22 com ChromeHeadless.

---

## 7. CRITÉRIOS DE ACEITAÇÃO DO PROCESSO DE TESTE

### 7.1 Critérios de Entrada
- Código compilando sem erros em ambas as camadas (`backend` e `frontend`);
- Dependências de teste resolvidas e configuradas nos arquivos de build;
- Branch de trabalho atualizada com a branch base.

### 7.2 Critérios de Saída
- 100% dos testes unitários e de integração implementados executando com sucesso (0 falhas);
- Ausência de defeitos com severidade Crítica ou Bloqueante abertos;
- Pipeline de integração contínua (CI) com status verde (*passing*).

### 7.3 Condições de Suspensão e Retomada
- **Suspensão:** Falha no ambiente de compilação, dependências corrompidas ou falha geral no provisionamento do banco de dados nos testes.
- **Retomada:** Correção das dependências/configurações e validação prévia de compilação local antes de reexecutar a suíte completa.

### 7.4 Métricas de Teste
- **Taxa de Sucesso dos Testes:** $\ge 100\%$ nos testes automatizados ativos.
- **Cobertura de Critérios de Aceite:** Rastreabilidade de 100% das histórias de usuário prioritárias em casos de teste.
- **Tempo de Execução da Suíte de CI:** $\le 3$ minutos por execução.

---

## 8. CENÁRIOS E CASOS DE TESTE

### Matriz de Cenários de Teste (TS)

| ID | Cenário de Teste | Nível | Camada |
| :---: | :--- | :---: | :---: |
| **TS01** | Disponibilidade e Monitoramento do Sistema (Health Check) | Integração / Sistema | Backend / Frontend |
| **TS02** | Autenticação, Proteção de Rotas e Controle de Acesso (RBAC) | Integração / Segurança | Backend |
| **TS03** | Ciclo de Vida e Transições de Status do Chamado (Ticket) | Unitário | Backend |
| **TS04** | Validação de Regras de Negócio e Cálculo de SLAs | Unitário | Backend |
| **TS05** | Layout, Navegação, Renderização e Formulários das Páginas do Frontend | Componente / Unitário | Frontend |
| **TS06** | Consumo e Resiliência do TicketsService no Frontend | Integração / Unitário | Frontend |

---

### Casos de Teste Detalhados (TC)

#### TC01 — Verificação de Disponibilidade da API via Health Check
- **Cenário:** TS01
- **Nível:** Integração
- **Camada:** Backend (Spring Test / MockMvc)
- **Pré-condições:** Aplicação Spring Boot em execução ou contexto de teste carregado.
- **Passos:**
  1. Realizar uma requisição HTTP `GET` para o endpoint `/health` sem cabeçalhos de autenticação.
  2. Verificar o status code da resposta.
  3. Verificar o corpo JSON retornado.
- **Resultado Esperado:**
  - Status HTTP `200 OK`.
  - Content-Type `application/json`.
  - Corpo da resposta contendo exatamente `{"status":"ONLINE"}`.

---

#### TC02 — Rejeição de Métodos HTTP Não Permitidos no Endpoint de Saúde
- **Cenário:** TS01
- **Nível:** Integração
- **Camada:** Backend (Spring Test / MockMvc)
- **Pré-condições:** Contexto de teste carregado.
- **Passos:**
  1. Enviar requisição HTTP `POST` para o endpoint `/health`.
  2. Enviar requisição HTTP `DELETE` para o endpoint `/health`.
- **Resultado Esperado:**
  - Resposta com status HTTP `405 Method Not Allowed` para requisições de escrita, garantindo que o endpoint permaneça estritamente como consulta.

---

#### TC03 — Bloqueio de Acesso Não Autenticado a Rotas Protegidas
- **Cenário:** TS02
- **Nível:** Integração / Segurança
- **Camada:** Backend (Spring Security Test / MockMvc)
- **Pré-condições:** Filtro do Spring Security ativo conforme `SecurityConfig`.
- **Passos:**
  1. Enviar requisição HTTP `GET` para uma rota de recurso do sistema (ex.: `/api/v1/tickets` ou qualquer rota diferente de `/health`) sem credenciais ou token JWT.
- **Resultado Esperado:**
  - A requisição é interceptada pelo SecurityFilterChain e retorna status HTTP `401 Unauthorized` ou `403 Forbidden`.

---

#### TC04 — Acesso Permitido a Rotas Protegidas com Usuário Autenticado
- **Cenário:** TS02
- **Nível:** Integração / Segurança
- **Camada:** Backend (Spring Security Test / MockMvc)
- **Pré-condições:** Contexto de segurança carregado.
- **Passos:**
  1. Enviar requisição HTTP `GET` para `/api/v1/tickets` acompanhada de contexto autenticado (`@WithMockUser`).
- **Resultado Esperado:**
  - A requisição não é bloqueada pelo filtro de autenticação (não retorna 401/403).

---

#### TC05 — Transição Válida de Status do Chamado
- **Cenário:** TS03
- **Nível:** Unitário
- **Camada:** Backend (JUnit 5)
- **Pré-condições:** Instância de chamado criada no estado `ABERTO`.
- **Passos:**
  1. Solicitar transição de status para `EM_ATENDIMENTO`.
  2. Solicitar transição de status para `RESOLVIDO`.
  3. Solicitar transição de status para `FECHADO`.
- **Resultado Esperado:**
  - Cada transição é autorizada com sucesso, atualizando o status do chamado e registrando o histórico correspondente.

---

#### TC06 — Bloqueio de Transições de Status Inválidas ou Proibidas
- **Cenário:** TS03
- **Nível:** Unitário
- **Camada:** Backend (JUnit 5)
- **Pré-condições:** Instância de chamado no estado `FECHADO` ou `ABERTO`.
- **Passos:**
  1. Tentar transicionar um chamado `FECHADO` diretamente para `ABERTO` ou `EM_ATENDIMENTO`.
  2. Tentar transicionar um chamado `ABERTO` diretamente para `FECHADO` (sem passar por resolução prévia).
- **Resultado Esperado:**
  - A máquina de estados rejeita a operação, lançando exceção de regra de negócio (`IllegalStateException` ou erro de domínio) e preservando o status original.

---

#### TC07 — Validação de Campos Obrigatórios na Criação de Chamado
- **Cenário:** TS04
- **Nível:** Unitário
- **Camada:** Backend (JUnit 5 / Bean Validation)
- **Pré-condições:** Nenhuma.
- **Passos:**
  1. Instanciar chamado com título nulo ou vazio.
  2. Instanciar chamado com descrição com menos de 10 caracteres.
  3. Instanciar chamado com todos os dados preenchidos corretamente.
- **Resultado Esperado:**
  - Casos 1 e 2 disparam violação de validação (`IllegalArgumentException` ou ConstraintViolation).
  - Caso 3 cria a entidade válida com prioridade padrão e status inicial `ABERTO`.

---

#### TC08 — Cálculo de SLA em Horas por Severidade
- **Cenário:** TS04
- **Nível:** Unitário
- **Camada:** Backend (JUnit 5 - `@ParameterizedTest`)
- **Pré-condições:** Enum de Prioridade carregado.
- **Passos:**
  1. Consultar SLA para prioridade `CRITICA`.
  2. Consultar SLA para prioridade `ALTA`.
  3. Consultar SLA para prioridade `MEDIA`.
  4. Consultar SLA para prioridade `BAIXA`.
- **Resultado Esperado:**
  - `CRITICA`: SLA de 2 horas.
  - `ALTA`: SLA de 4 horas.
  - `MEDIA`: SLA de 8 horas.
  - `BAIXA`: SLA de 24 horas.

---

#### TC09 — Renderização do Layout Shell com Menu Lateral e Área de Conteúdo
- **Cenário:** TS05
- **Nível:** Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Módulo de testes configurado com `TestBed` e rotas de teste.
- **Passos:**
  1. Instanciar o componente `Shell` no `TestBed` com rotas e dependências providas.
  2. Disparar a detecção de mudanças (`fixture.detectChanges()`).
  3. Inspecionar a presença do elemento `<app-header>`.
  4. Inspecionar a presença do elemento `<app-side-bar>`.
  5. Inspecionar a presença do contêiner `.body-content` com `<router-outlet>`.
- **Resultado Esperado:**
  - Componente instanciado com sucesso.
  - O layout contém o header, o menu lateral e a área de conteúdo principal.

---

#### TC10 — Itens de Navegação do Menu Lateral (SideBar)
- **Cenário:** TS05
- **Nível:** Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `SideBar` compilado no `TestBed`.
- **Passos:**
  1. Instanciar o componente `SideBar` no `TestBed`.
  2. Disparar a detecção de mudanças.
  3. Consultar todos os elementos `<a>` dentro de `.nav-list`.
  4. Verificar os textos dos links de navegação.
- **Resultado Esperado:**
  - O menu exibe exatamente 5 itens: "Dashboard", "Lista de Chamados", "Abrir chamado", "Triagem" e "Atendimento".
  - O elemento `<nav>` possui `aria-label="Navegação principal"`.

---

#### TC11 — Mapeamento de Rotas para os Cinco Módulos
- **Cenário:** TS05
- **Nível:** Unitário
- **Camada:** Frontend (Angular / Jasmine)
- **Pré-condições:** Arquivo `app.routes.ts` carregado.
- **Passos:**
  1. Importar a constante `routes` do módulo de rotas.
  2. Verificar que a rota raiz (`''`) redireciona para `dashboard`.
  3. Verificar que existem rotas filhas para `dashboard`, `list-tickets`, `new-ticket`, `triage` e `attendance`.
  4. Verificar que cada rota filha mapeia para o componente correto (`Dashboard`, `TicketList`, `NewTicket`, `Triage`, `Attendance`).
- **Resultado Esperado:**
  - Todas as 5 rotas estão configuradas corretamente dentro do Shell.
  - A rota raiz faz redirect para `/dashboard`.

---

#### TC12 — Métodos HTTP do TicketsService (Integração com HttpTestingController)
- **Cenário:** TS06
- **Nível:** Integração / Unitário
- **Camada:** Frontend (Jasmine / `HttpTestingController`)
- **Pré-condições:** `TicketsService` injetado com `provideHttpClientTesting()`.
- **Passos:**
  1. Chamar `postTicket(payload)` e verificar que uma requisição `POST` é disparada para `http://localhost:8080/api/v1/tickets`.
  2. Chamar `getAllTickets()` e verificar que uma requisição `GET` é disparada para `http://localhost:8080/api/v1/tickets`.
  3. Chamar `getTicketById('123')` e verificar que uma requisição `GET` é disparada para `http://localhost:8080/api/v1/tickets/123`.
  4. Chamar `getHistoryTicket('123')` e verificar que uma requisição `GET` é disparada para `http://localhost:8080/api/v1/tickets/123/history`.
- **Resultado Esperado:**
  - Cada método dispara a requisição HTTP correta com URL e verbo adequados.
  - Não restam requisições pendentes no controlador de testes.

---

#### TC13 — Renderização da Página Dashboard
- **Cenário:** TS05
- **Nível:** Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `Dashboard` compilado no `TestBed`.
- **Passos:**
  1. Instanciar o componente `Dashboard` no `TestBed`.
  2. Disparar a detecção de mudanças.
  3. Verificar a presença do título `<h1>` com texto "Dashboard".
  4. Verificar a presença dos 4 cards KPI na seção `.kpi-grid`.
  5. Verificar a presença do banner de alerta `.alert-banner`.
- **Resultado Esperado:**
  - O título principal é "Dashboard".
  - Os 4 cards KPI são renderizados com seus valores.
  - O alerta de SLA é exibido.

---

#### TC14 — Validação de Campos Obrigatórios no Formulário de Novo Chamado
- **Cenário:** TS05
- **Nível:** Unitário
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `NewTicket` compilado no `TestBed`.
- **Passos:**
  1. Instanciar o componente `NewTicket` e obter a instância do `FormGroup`.
  2. Verificar que o formulário inicia como inválido (campos obrigatórios vazios).
  3. Preencher apenas os campos obrigatórios (`category`, `description`, `impact`, `errorCode`).
  4. Verificar que o formulário passa a ser válido.
- **Resultado Esperado:**
  - Formulário começa inválido.
  - Após preenchimento dos 4 campos obrigatórios, o formulário torna-se válido.

---

#### TC15 — Envio de Chamado pelo Formulário (NewTicket onSubmit)
- **Cenário:** TS06
- **Nível:** Integração
- **Camada:** Frontend (Jasmine / `HttpTestingController`)
- **Pré-condições:** Componente `NewTicket` compilado no `TestBed` com `provideHttpClientTesting()`.
- **Passos:**
  1. Preencher os campos obrigatórios do formulário.
  2. Invocar `onSubmit()`.
  3. Interceptar a requisição `POST` disparada para `/api/v1/tickets`.
  4. Responder com status 201 e corpo de resposta simulado.
- **Resultado Esperado:**
  - A requisição `POST` é disparada com o payload contendo os dados do formulário.
  - O serviço Angular recebe a resposta com sucesso.

---

#### TC16 — Renderização da Página Lista de Chamados
- **Cenário:** TS05
- **Nível:** Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `TicketList` compilado no `TestBed` com `provideHttpClientTesting()`.
- **Passos:**
  1. Instanciar o componente `TicketList` no `TestBed`.
  2. Disparar a detecção de mudanças.
  3. Verificar que a tabela renderiza os 8 chamados mock.
  4. Verificar a presença do formulário de filtros com os campos esperados.
- **Resultado Esperado:**
  - Os 8 chamados mock são exibidos na tabela.
  - O formulário de filtros está presente com campos de busca, unidade, status, prioridade, responsável e categoria.

---

#### TC17 — Formulário de Triagem e Classificação
- **Cenário:** TS05
- **Nível:** Unitário / Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `Triage` compilado no `TestBed`.
- **Passos:**
  1. Instanciar o componente `Triage` e obter a instância do formulário `triageForm`.
  2. Verificar que a fila de chamados contém 3 itens.
  3. Verificar que os campos de classificação possuem valores padrão preenchidos.
  4. Verificar que `prioridadePersistida` está desabilitado (somente leitura).
- **Resultado Esperado:**
  - A fila exibe os 3 chamados para triagem.
  - O campo de prioridade persistida está desabilitado.
  - Os campos de classificação possuem valores pré-preenchidos conforme o componente.

---

#### TC18 — Renderização do Histórico e Formulários da Tela de Atendimento
- **Cenário:** TS05
- **Nível:** Componente
- **Camada:** Frontend (Angular / Jasmine / Karma)
- **Pré-condições:** Componente `Attendance` compilado no `TestBed`.
- **Passos:**
  1. Instanciar o componente `Attendance` no `TestBed`.
  2. Disparar a detecção de mudanças.
  3. Verificar que a timeline exibe 2 entradas de histórico.
  4. Verificar a presença dos 3 formulários: comentário (`commentForm`), espera (`waitForm`) e resolução (`resolveForm`).
  5. Verificar que o `commentForm` inicia com texto pré-preenchido.
- **Resultado Esperado:**
  - O histórico (timeline) exibe 2 eventos.
  - Os 3 formulários estão instanciados e acessíveis.
  - O campo de comentário possui texto padrão.

---

## 9. ATIVIDADES E ESTIMATIVAS

| Atividade | Descrição | Responsável | Prazo Estimado |
| :--- | :--- | :---: | :---: |
| **1. Revisão da Base de Testes** | Refinamento dos critérios de aceite das Histórias de Usuário do NVS com o PO. | Alan Vitor, Jennifer Zeferino | 2 dias |
| **2. Preparação do Ambiente de Testes** | Ajuste dos scripts Gradle, Karma headless e pipeline GitHub Actions. | Alan Vitor, Emanoel Henrick | 1 dia |
| **3. Implementação dos Testes Unitários de Domínio** | Automação com JUnit 5 para enums, regras de transição de chamados e SLAs (TC05, TC06, TC07, TC08). | Alan Vitor, Rayssa Santana | 3 dias |
| **4. Implementação dos Testes de Integração Backend** | Automação com Spring Boot Test e MockMvc para endpoints e segurança (TC01, TC02, TC03, TC04). | Alan Vitor, Rayssa Santana | 3 dias |
| **5. Implementação dos Testes Frontend (Jasmine/Karma)** | Automação de testes de componentes, layout, navegação, formulários e serviços HTTP no Angular (TC09, TC10, TC11, TC12, TC13, TC14, TC15, TC16, TC17, TC18). | Alan Vitor, Raiele Leite | 3 dias |
| **6. Integração e Validação no Pipeline de CI** | Execução de toda a suíte nas GitHub Actions e verificação de relatórios. | Alan Vitor | 1 dia |
| **7. Homologação e Emissão de Evidências** | Validação final dos fluxos com o PO e consolidação do relatório de testes. | Alan Vitor, Jennifer Zeferino | 1 dia |

