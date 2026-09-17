# NVS - Nexo Varejo Suporte

Sistema de suporte técnico para centralizar chamados, histórico de atendimentos, incidentes e indicadores da operação da Nexo Varejo.

## Integrantes

<table width="100%">
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/emanoelhenrick">
        <img src="https://github.com/emanoelhenrick.png" width="90px" style="border-radius:50%;" alt="Emanoel Henrick"/><br />
        <b>Emanoel Henrick</b>
      </a>
      <br />
      <small>Tech Lead / Arquitetura</small>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/jenniferzeferino">
        <img src="https://github.com/jenniferzeferino.png" width="90px" style="border-radius:50%;" alt="Jennifer Zeferino"/><br />
        <b>Jennifer Zeferino</b>
      </a>
      <br />
      <small>Product & Delivery Lead</small>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/RaieleLeite">
        <img src="https://github.com/RaieleLeite.png" width="90px" style="border-radius:50%;" alt="Raiele Leite"/><br />
        <b>Raiele Leite</b>
      </a>
      <br />
      <small>Frontend e Integração</small>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/alancodex">
        <img src="https://github.com/alancodex.png" width="90px" style="border-radius:50%;" alt="Alan Vitor"/><br />
        <b>Alan Vitor</b>
      </a>
      <br />
      <small>QA, DevOps e Qualidade</small>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/Lucas-Viniicius">
        <img src="https://github.com/Lucas-Viniicius.png" width="90px" style="border-radius:50%;" alt="Lucas Vinicius"/><br />
        <b>Lucas Vinicius</b>
      </a>
      <br />
      <small>Full-stack / Apoio Técnico</small>
    </td>
    <td align="center" width="33%">
      <a href="https://github.com/Samara020">
        <img src="https://github.com/Samara020.png" width="90px" style="border-radius:50%;" alt="Samara Mendonça"/><br />
        <b>Samara Mendonça</b>
      </a>
      <br />
      <small>UX/UI e Requisitos</small>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/RayssaRR">
        <img src="https://github.com/RayssaRR.png" width="90px" style="border-radius:50%;" alt="Rayssa Santana"/><br />
        <b>Rayssa Santana</b>
      </a>
      <br />
      <small>Backend e Banco de Dados</small>
    </td>
    <td align="center" width="33%"></td>
    <td align="center" width="33%"></td>
  </tr>
</table>

## Stack escolhida

| Camada | Tecnologia | Versão inicial |
| --- | --- | --- |
| Frontend | Angular | 20.3.x |
| Linguagem frontend | TypeScript | 5.9.x |
| Runtime frontend | Node.js | 22.x |
| Backend | Java + Spring Boot | Java 25 / Spring Boot 4.1.1 |
| Build backend | Gradle Wrapper | 9.7.1 |
| Banco de dados | PostgreSQL | 16 |
| Autenticação | JWT, stateless | A implementar |
| Testes | JUnit/Spring Test e Jasmine/Karma | Conforme os projetos |
| Publicação inicial | Vercel para frontend; AWS para backend e PostgreSQL/RDS | Planejada |

### Justificativa

Angular e Spring Boot foram escolhidos porque são tecnologias já conhecidas pela equipe, reduzem o tempo de entrada e oferecem padrões maduros para manutenção. PostgreSQL atende ao histórico transacional e à correlação de incidentes com consistência ACID. JWT permite autenticação stateless e escala horizontal, mas exige proteção do segredo, expiração e rotação de tokens. A principal atenção inicial é manter Java, Spring Boot, Node e Angular em versões compatíveis e evitar que segredos sejam versionados.

## Pré-requisitos

- Git.
- Docker Engine e Docker Compose.
- Java 25 para executar o backend fora do container.
- Node.js 22 e npm para executar o frontend fora do container.
- Acesso à internet na primeira execução para baixar dependências e imagens.

## Configuração do ambiente

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/emanoelhenrick/nvs-residencia.git
   cd nvs-residencia
   ```

2. Crie o arquivo local de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Altere `POSTGRES_PASSWORD` e `JWT_SECRET` no `.env`. O arquivo `.env` é ignorado pelo Git e nunca deve conter valores reais em commits.

### Variáveis de ambiente

| Variável | Uso | Exemplo seguro de desenvolvimento |
| --- | --- | --- |
| `POSTGRES_USER` | Usuário do PostgreSQL | `docker` |
| `POSTGRES_PASSWORD` | Senha local do PostgreSQL | `change-me` |
| `POSTGRES_DB` | Nome do banco | `nvs-db` |
| `POSTGRES_PORT` | Porta local do PostgreSQL | `5432` |
| `SPRING_DATASOURCE_URL` | URL JDBC usada pelo backend | `jdbc:postgresql://nvs-db:5432/nvs-db` |
| `SPRING_DATASOURCE_USERNAME` | Usuário JDBC | `docker` |
| `SPRING_DATASOURCE_PASSWORD` | Senha JDBC | `change-me` |
| `JWT_SECRET` | Segredo para assinatura de tokens | `replace-with-a-long-random-value` |
| `SERVER_PORT` | Porta HTTP do backend | `8080` |

## Execução local

### Com Docker Compose

Suba banco, backend e frontend:

```bash
docker compose up --build
```

Acesse:

- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- Saúde da API: http://localhost:8080/health
- PostgreSQL: `localhost:5432`

Para parar os serviços:

```bash
docker compose down
```

### Sem container para as aplicações

Suba apenas o banco:

```bash
docker compose up -d nvs-db
```

Em um terminal, execute o backend:

```bash
cd backend
./gradlew bootRun
```

Em outro terminal, instale e execute o frontend:

```bash
cd frontend
npm ci
npm start
```

## Testes e builds

Backend:

```bash
cd backend
./gradlew test
./gradlew build
```

Frontend:

```bash
cd frontend
npm ci
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

O endpoint `GET /health` retorna `{ "status": "ONLINE" }` sem autenticação para permitir monitoramento básico. Os demais endpoints devem exigir autenticação quando forem implementados.

## Estrutura do repositório

A estrutura abaixo representa uma organização futura para o desenvolvimento. Ela ainda será construída conforme os módulos do sistema forem implementados.

```text
backend/src/
├── main/
│   ├── java/com/nvs/ams/
│   │   ├── AmsApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   └── OpenApiConfig.java
│   │   ├── shared/
│   │   │   ├── validation/
│   │   │   └── util/
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── ticket/
│   │   │   │   ├── incident/
│   │   │   │   └── user/
│   │   │   ├── exception/
│   │   │   └── service/
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   └── service/
│   │   ├── presentation/
│   │   │   └── controller/
│   │   └── infra/
│   │       └── repository/
│   └── resources/
│       ├── application.properties
│       └── db/migration/
└── test/
   └── java/com/nvs/ams/
      ├── domain/
      ├── application/
      ├── presentation/
      └── infra/

frontend/src/
├── main.ts
├── index.html
├── styles.scss
└── app/
   ├── core/
   │   ├── guards/
   │   ├── interceptors/
   │   ├── services/
   │   └── models/
   ├── shared/
   │   ├── components/
   │   ├── directives/
   │   ├── pipes/
   │   └── models/
   ├── layout/
   │   ├── components/
   │   └── layout.routes.ts
   ├── features/
   │   ├── auth/
   │   │   ├── pages/
   │   │   ├── components/
   │   │   ├── services/
   │   │   └── models/
   │   ├── tickets/
   │   │   ├── pages/
   │   │   ├── components/
   │   │   ├── services/
   │   │   └── models/
   │   ├── incidents/
   │   └── dashboard/
   ├── app.config.ts
   ├── app.routes.ts
   └── app.spec.ts
```

## Convenções de desenvolvimento

### Branches

- `main`: produção.
- `develop`: integração.
- `feature/nome-da-tarefa`: novas funcionalidades.
- `fix/nome-do-bug`: correções.
- `hotfix/nome`: correções urgentes em produção.

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade.
- `fix:` correção de bug.
- `docs:` documentação.
- `refactor:` refatoração sem mudança de comportamento.
- `test:` inclusão ou ajuste de testes.
- `chore:` manutenção e configurações.

Exemplo: `feat: adiciona correlação automática de chamados por unidade`.

### Pull Requests

Toda alteração deve partir de `develop`, usar o template em `.github/PULL_REQUEST_TEMPLATE.md`, informar como foi validada e receber pelo menos uma revisão antes do merge. O CI precisa estar verde.

Os responsáveis por aprovar Pull Requests são [Emanoel Henrick](https://github.com/emanoelhenrick) e [Raiele Leite](https://github.com/RaieleLeite). Pelo menos uma dessas pessoas deve revisar cada PR.

## Publicação inicial

- Frontend: Vercel, conectado ao repositório e ao branch de produção.
- Backend: AWS, preferencialmente em serviço gerenciado ou containerizado.
- Banco: PostgreSQL em AWS RDS, com backups, credenciais em secret manager e acesso restrito à rede do backend.
- Segredos de produção: nunca usar `.env` versionado; configurar no provedor de deploy.

## Estado atual

A estrutura inicial executável inclui frontend Angular, backend Spring Boot, PostgreSQL local via Docker Compose, endpoint `/health`, testes básicos e pipeline de build/testes. Autenticação JWT, domínio de chamados, integrações e classificação por IA permanecem como próximas entregas.

## Pull Request de referência

A criar no GitHub a partir da branch `develop`, com revisão de outro integrante da equipe antes do merge.
