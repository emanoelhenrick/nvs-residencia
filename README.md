# Sistema de Gerenciamento de Chamados de Suporte

## Contexto

A **Nexo Varejo** é uma empresa varejista com 85 lojas no Nordeste, dois centros de distribuição e uma operação de e-commerce 24h, totalizando cerca de 2.500 colaboradores. O suporte técnico recebe em média 1.800 solicitações por mês, vindas de diferentes canais (e-mail, telefone, chat, mensagens diretas, formulários e planilhas próprias de cada área).

Essa fragmentação gera problemas recorrentes:

- Não existe uma **base central** com o histórico dos atendimentos.
- Gerentes de loja preferem falar diretamente com analistas conhecidos, por acreditarem que é mais rápido do que o canal oficial — isso faz parte do trabalho não ser registrado nem contabilizado.
- Solicitações chegam **sem informações essenciais** (loja, equipamento, horário, evidências do erro).
- Em incidentes com múltiplas lojas afetadas pela mesma causa, a falta de correlação entre chamados leva a **retrabalho e demora no diagnóstico**.
- Diferentes áreas apresentam **números incompatíveis** sobre quantidade de incidentes, tempo de indisponibilidade e impacto financeiro.
- Chamados ficam sem responsável definido, ou são encerrados informalmente sem registro adequado.

## Objetivo

Criar um sistema único de gerenciamento de chamados que permita:

1. **Centralizar** o registro e o histórico de todas as solicitações, independentemente da origem (loja, e-commerce, centro de distribuição).
2. **Padronizar as informações** coletadas em cada chamado (unidade, sistema/equipamento envolvido, horário, descrição, evidências).
3. **Correlacionar incidentes** relacionados, evitando que múltiplos times investiguem separadamente a mesma causa-raiz.
4. **Dar visibilidade à liderança** sobre indisponibilidade, impacto nas vendas, tempo de atendimento e desempenho das equipes.
5. **Definir responsáveis** claros por chamado, incluindo o repasse correto para fornecedores externos apenas quando cabível.
6. Manter o registro **rápido e simples** para quem abre o chamado (vendedores, gerentes de loja), evitando que voltem a preferir contato informal por telefone ou mensagem.

> Observação: o histórico de dados ainda não é centralizado nem padronizado, o que deve ser resolvido antes de se avaliar automações futuras, como classificação e priorização por inteligência artificial.

## Outros objetivos

- Autenticação integrada com identidade corporativa.
- Integrações com sistemas de monitoramento e comunicação.
- Classificação automática de chamados via IA.

Esses itens são considerados evoluções futuras, a serem definidas após a primeira versão do sistema estar estável e com dados confiáveis.
