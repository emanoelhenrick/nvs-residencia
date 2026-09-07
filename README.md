# Sistema de Gerenciamento de Chamados de Suporte — Nexo Varejo

## Contexto

A **Nexo Varejo** é uma empresa varejista com 85 lojas no Nordeste, dois centros de distribuição e uma operação de e-commerce 24h, totalizando cerca de 2.500 colaboradores.

O suporte técnico recebe em média **1.800 solicitações por mês**, vindas de diferentes canais (e-mail, telefone, chat, mensagens diretas, formulários e planilhas próprias de cada área).

## Problemas atuais

- Não existe uma **base central** com o histórico dos atendimentos.
- Gerentes de loja preferem falar diretamente com analistas conhecidos, por acreditarem ser mais rápido do que o canal oficial — isso faz com que o trabalho não seja registrado nem contabilizado.
- Solicitações chegam **sem informações essenciais** (loja, equipamento, horário, evidências do erro).
- Em incidentes com múltiplas lojas afetadas pela mesma causa, a falta de correlação entre chamados gera **retrabalho e demora no diagnóstico**.
- Diferentes áreas apresentam **números incompatíveis** sobre quantidade de incidentes, tempo de indisponibilidade e impacto financeiro.
- Chamados ficam sem responsável definido, ou são encerrados informalmente sem registro adequado.

## Objetivos do sistema

1. **Centralizar** o registro e o histórico de todas as solicitações, independentemente da origem (loja, e-commerce, centro de distribuição).
2. **Padronizar as informações** coletadas em cada chamado (unidade, sistema/equipamento envolvido, horário, descrição, evidências).
3. **Correlacionar incidentes** relacionados, evitando que múltiplos times investiguem separadamente a mesma causa-raiz.
4. **Dar visibilidade à liderança** sobre indisponibilidade, impacto nas vendas, tempo de atendimento e desempenho das equipes.
5. **Definir responsáveis** claros por chamado, incluindo o repasse correto para fornecedores externos apenas quando cabível.
6. Manter o registro **rápido e simples** para quem abre o chamado (vendedores, gerentes de loja), evitando o retorno ao contato informal por telefone ou mensagem.
7. **Integrações** com sistemas de monitoramento e comunicação.
8. **Classificação automática** de chamados via inteligência artificial.

## Arquitetura Tecnológica

- **Frontend -> Angular:** equipe já tem experiência prévia. O framework oferece estrutura sólida e padronizada, com TypeScript reforçando a segurança em formulários (loja, equipamento, horário, evidências).
- **Backend -> Java com Spring Boot:** tecnologia de maior domínio da equipe. Framework maduro, com suporte nativo a APIs REST, segurança (Spring Security) e **WebSockets** para monitoramento em tempo real dos chamados (status, novos incidentes e responsáveis), útil em incidentes que afetam múltiplas lojas.
- **Banco de Dados -> PostgreSQL:** tecnologia já dominada pela equipe. Relacional, robusto e com suporte ACID, ideal para histórico confiável e correlação de incidentes. Boa integração com AWS RDS.
- **Autenticação -> JWT:** autenticação stateless, simplifica a escalabilidade e facilita futura expansão para outros canais.
- **Testes:** foco em testes unitários e de integração desde a primeira versão, garantindo confiabilidade das regras de negócio antes de evoluções futuras.
- **Publicação:** frontend na **Vercel** (deploy simples e rápido). Backend e banco na **AWS**, pelo maior controle de infraestrutura e serviços gerenciados (RDS).

## Convenções de Desenvolvimento

**Branches**
- `main` → produção
- `develop` → integração
- `feature/nome-da-tarefa` → novas funcionalidades
- `fix/nome-do-bug` → correções
- `hotfix/nome` → correções urgentes em produção

**Commits** (padrão [Conventional Commits](https://www.conventionalcommits.org/))
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `refactor:` refatoração sem mudança de comportamento
- `test:` inclusão ou ajuste de testes
- `chore:` tarefas de manutenção (configs, dependências)

Exemplo: `feat: adiciona correlação automática de chamados por unidade`

**Pull Requests**
- Título objetivo e no mesmo padrão dos commits (ex: `feat: tela de abertura de chamado`)
- Descrição breve do que foi feito e por quê
- Vincular à issue/tarefa relacionada, quando existir
- Exigir ao menos 1 revisão (code review) antes do merge
- Só realizar merge com os testes passando (CI verde)
