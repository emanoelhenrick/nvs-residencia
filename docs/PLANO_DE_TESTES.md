# Plano de Testes — NVS (baseado nos requisitos)

**Data:** 17 de out. de 2026  
**Autor:** @alan

## 1. Objetivo e base

Este plano diz o que testar para confirmar que o NVS cumpre o que o projeto prometeu: cada caso sai de um critério de aceite, de uma regra de negócio ou de uma meta de SLA dos documentos. Foi feito para uma pessoa executar sozinha e não depende de como o sistema foi programado.

- **Documento de Visão** (versão 3.2, de 02/10): problema, usuários, premissas e indicadores de sucesso.
- **Análise de Domínio:** glossário, ciclo de vida do chamado, regras de negócio RN01 a RN15 e metas de SLA (itens 8.1 e 8.2).
- **Definição do MVP:** três fluxos essenciais e as histórias HU01 a HU07 com seus critérios de aceite.

Dentro do escopo: abertura e acompanhamento de chamados, formulário contextualizado, triagem, prioridade, detecção e agrupamento de surtos, histórico, SLA e indicadores, em computador, tablet e celular.

Fora do escopo, conforme o MVP: integrações complexas de monitoramento, automações avançadas e recursos que dependam de base histórica estruturada. A IA da V1 usa regras fixas, então a detecção de surto é testada como regra, não como aprendizado.

## 2. Estratégia e dados de teste

Testar na ordem das dependências do MVP (HU01 primeiro, indicadores por último) e gastar mais esforço onde o erro custa mais: acesso, prioridade, SLA e histórico.

### Onde se verifica

| Onde | O que confere | Como |
|---|---|---|
| Interface | Telas, mensagens, bloqueios, uso em tablet | Uso manual no computador e no tablet |
| API | Rejeição no servidor, códigos e dados devolvidos (a HU01-T5 cita `POST /api/v1/tickets`) | Postman ou curl |
| Dados | Histórico gravado, nada apagado, totais dos indicadores | Consultas no banco |
| Tempo | SLA, janela de 15 min, 48 h | Relógio controlável ou datas ajustadas |
| Aceitação | Critérios Dado/Quando/Então das HUs | Roteiro ponta a ponta no fim |

### Técnicas

- **Critério de aceite:** cada Dado/Quando/Então vira um caso.
- **Valor limite:** 15 min do surto, 80% do SLA, 48 h do fechamento e os limites de cada meta de SLA, sempre um pouco antes, no limite e um pouco depois.
- **Tabela de decisão:** severidade x urgência para a prioridade; perfil x ação para o acesso.
- **Transição de estado:** o ciclo de vida do chamado, com as passagens permitidas e as recusadas.
- **Exploratório curto:** 30 minutos por fluxo no fim.

### Risco dos casos

- **Alto:** acesso (RN09), prioridade e SLA (RN03, RN06 a RN08, RN11 a RN13), criação do chamado e histórico (RN01, RN02, RN10, RN14).
- **Médio:** as demais regras e telas.
- **Baixo:** texto e visual.

São três palavras para não confundir com as prioridades P1 a P4 do chamado.

### Dados de teste

- Perfis simulados (a V1 simula perfis): solicitante de loja, operador de CD, triagem N1, especialista N2/N3, fornecedor e líder.
- Locais: duas lojas e um CD, para separar "mesma loja" de "lojas diferentes" no teste de surto.
- Categorias: ao menos três. Os documentos citam PDV, pagamento, impressora e leitor, e e-commerce.
- Dispositivos: ao menos um por local.
- Chamados prontos em cada status e em cada prioridade de P1 a P4, incluindo um com 79% e outro com 80% do TMS consumido, e um Resolvido há 47 h 59 min e outro há 48 h 01 min.

**Tempo.** Caso de tempo não se testa esperando. Peça ao time um relógio controlável no ambiente de teste ou uma forma de ajustar as datas gravadas do chamado.

## 3. Casos de HU01 a HU04

São 19 casos (CT01 a CT19). Os critérios, as regras e as metas citados estão nos três documentos.

### HU01 — Registrar chamado

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT01 | **Registro válido:** o solicitante de uma loja abre o formulário, informa só a descrição (e anexo, se quiser) e envia. O chamado fica com status Aberto, a tela confirma com o número de protocolo e o histórico guarda o evento de criação. | HU01-C1, HU01-T3, RN01 | Alto |
| CT02 | **Contexto automático:** o formulário já traz usuário, loja/CD e dispositivo, sem digitar. O chamado de um usuário de loja e o de um operador de CD saem cada um com o seu local, e o solicitante não consegue trocar esses dados. | RN01, HU01-T4 | Alto |
| CT03 | **Campo obrigatório ausente:** o sistema indica o campo pendente e impede o envio, na tela (botão bloqueado, aviso ao preencher) e no servidor (a chamada sem os dados mínimos é rejeitada e não cria chamado). | HU01-C2, RN02, HU01-T2, HU01-T5 | Alto |
| CT04 | **Dados mínimos por tipo de falha:** falha de hardware sem código de erro e sem foto é bloqueada; com um dos dois é aceita. A regra exata por categoria está em aberto (seção 6). | RN02 | Médio |
| CT05 | **Protocolo:** chamados criados em sequência recebem protocolos diferentes, e o protocolo da confirmação é o mesmo que aparece depois na consulta. | HU01-T3, HU05-C1 | Alto |
| CT06 | **Anexos:** anexar e remover uma evidência antes de enviar; o anexo enviado fica ligado ao chamado. | Fluxo 1 do MVP | Baixo |
| CT07 | **Persistência:** chamado e histórico ficam gravados e podem ser consultados depois; nenhuma tela nem chamada da API apaga um chamado. | HU01-T6, RN10 | Alto |

### HU02 — Realizar triagem

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT08 | **Classificação:** a triagem abre um chamado Aberto e seleciona a classificação. Ela fica registrada e o status passa a Em Triagem. | HU02-C1, ciclo de vida | Alto |
| CT09 | **Encaminhamento:** depois de classificar, escolhe a equipe (N1, N2, Infra, E-commerce ou Fornecedor). O encaminhamento fica no histórico e o chamado entra na fila dessa equipe. | HU02-C2 | Alto |
| CT10 | **Restrição do fornecedor:** com um chamado atribuído a ele e outro de outra equipe, o fornecedor vê e edita só o dele. Abrir o outro, pelo menu, por endereço direto ou pela API, é negado. | HU02-C3, RN09 | Alto |
| CT11 | **Acesso por perfil:** tabela de decisão com os seis perfis de teste contra abrir chamado, triagem, atendimento e indicadores. As permissões detalhadas da V1 estão em aberto: o resultado vira pergunta ao time. | RN09, seção 6 | Médio |

### HU03 — Calcular e atribuir prioridade

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT12 | **Matriz:** para cada combinação de severidade e urgência, a prioridade calculada é a da matriz do negócio e fica registrada. A matriz completa precisa ser fornecida (seção 6). | HU03-C1, RN03 | Alto |
| CT13 | **Edição direta bloqueada:** tentar mudar a prioridade sem reavaliar severidade e urgência é impedido. | HU03-C2, RN04 | Alto |
| CT14 | **Reavaliação:** mudar severidade ou urgência exige justificativa. Com ela, a prioridade é recalculada e a justificativa vai para o histórico; sem ela, a mudança é impedida. | HU03-C2 | Alto |
| CT15 | **O solicitante não altera a prioridade** em nenhuma tela nem na API. | RN04 | Médio |

### HU04 — Detectar e agrupar surtos

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT16 | **Limite do surto, com mesma categoria e mesma loja/CD:** 2 chamados não geram alerta; 3 em até 15 min geram; 3 com o último aos 15 min e 1 s não geram; 4 em 15 min listam os 4. | HU04-C1, RN05 | Alto |
| CT17 | **Não é surto:** 3 chamados da mesma categoria em lojas diferentes, ou da mesma loja em categorias diferentes, não geram alerta. | HU04-C1, RN05 | Médio |
| CT18 | **Alerta na triagem:** ao abrir o painel de triagem de um dos chamados do surto, aparecem o alerta e a sugestão de agrupamento com os chamados correlatos. | HU04-C1 | Alto |
| CT19 | **Confirmação:** o atendente confirma, os chamados secundários ficam ligados a um chamado pai, o status mostra a dependência e o histórico de cada um registra o vínculo. | HU04-C2 | Alto |

## 4. Casos de HU05 a HU07

São 17 casos (CT20 a CT36).

### HU05 — Acompanhar chamado

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT20 | **Status atual:** o solicitante abre o chamado dele e vê o status certo depois de cada mudança do ciclo de vida. | HU05-C1 | Alto |
| CT21 | **Histórico:** um chamado com várias movimentações mostra todas, em ordem, com data e autor. | HU05-C2 | Alto |
| CT22 | **Pendência:** com o chamado em Aguardando Solicitante, a tela diz o que falta para o atendimento continuar. | HU05-C3 | Médio |
| CT23 | **Visibilidade:** o solicitante vê só os próprios chamados. Regra inferida de "meu chamado"; confirmar com o time. | HU05 | Alto |
| CT24 | **Pausa e histórico do SLA:** ao mudar para Aguardando Solicitante ou Aguardando Terceiro/Fornecedor, o SLA pausa. A pausa, a retomada e cada movimentação do SLA aparecem no histórico. | HU05-C4, HU05-C5, RN06, RN14 | Alto |

### HU06 — Encerrar chamado

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT25 | **Resolução:** o atendente registra a solução. Ela fica no histórico e o status passa a Resolvido. | HU06-C1 | Alto |
| CT26 | **Encerramento:** com a resolução registrada, o atendente encerra e o status vira Fechado. | HU06-C2 | Alto |
| CT27 | **Fechamento automático:** um chamado Resolvido sem resposta há 47 h 59 min continua Resolvido; há mais de 48 h vira Fechado sozinho, com registro no histórico. | HU06-C3, RN08 | Alto |
| CT28 | **TMR e TMS:** o TMR para no primeiro atendimento efetivo e o TMS para quando o chamado vira Resolvido. Os dois são independentes: um pode estar violado e o outro cumprido. | HU06-C4, RN11 | Alto |
| CT29 | **Violação:** ao passar do limite do TMR ou do TMS, a violação fica registrada no histórico. | HU06-C5, RN12 | Alto |
| CT30 | **Justificativa:** encerrar um chamado com SLA violado exige o motivo. Sem motivo, o encerramento é impedido; com motivo, ele é guardado para auditoria. | HU06-C6, RN12 | Alto |
| CT31 | **Reabertura:** o usuário discorda antes do fechamento automático e o chamado vira Reaberto, com histórico, prioridade e SLA já consumido preservados. O cronômetro não recomeça do zero. | HU06-C7, RN13 | Alto |
| CT32 | **Escalonamento aos 80%:** sem movimentação e fora de Resolvido, o líder N2/N3 recebe alerta com chamado, prioridade, percentual consumido e tempo restante. Aos 79% não alerta; chamado Resolvido ou pausado não alerta. | HU06-C8, RN07 | Alto |
| CT33 | **Cancelamento:** chamado duplicado, aberto por engano ou descartado na triagem vai para Cancelado com justificativa registrada, e continua no banco e no histórico. | RN10 | Médio |

### HU07 — Acompanhar indicadores de SLA

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT34 | **Consulta:** com chamados registrados, o líder vê o cumprimento e as violações de SLA, de TMR e de TMS. | HU07-C1, RN15 | Médio |
| CT35 | **Filtros:** por prioridade, por equipe, por período e os três combinados mostram só os dados selecionados. | HU07-C2, C3, C4 | Médio |
| CT36 | **Consistência:** os totais dos indicadores batem com a contagem real de chamados e violações nos dados. O documento de visão pede relatórios 100% consistentes. | RN15, KPI de unificação | Alto |

## 5. Casos de SLA, ciclo de vida e requisitos não funcionais

São 12 casos (CT37 a CT48). Nos testes de limite, a suposição é que até o limite o prazo está cumprido e um segundo depois está violado (seção 6).

### Metas de SLA por prioridade (item 8.1 da Análise de Domínio)

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT37 | **P1, crítico:** TMR de 15 min e TMS de 2 h, 24 horas por dia. Medir aos 14 min 59 s, 15 min e 15 min 1 s, e o equivalente para 2 h. Um P1 aberto fora do horário comercial aciona a escala de sobreaviso. | 8.1, RN11, política P1 | Alto |
| CT38 | **P2, alto:** TMR de 30 min e TMS de 6 h, no horário de funcionamento da loja/CD. Mesmos três pontos de medição. | 8.1, RN11 | Alto |
| CT39 | **P3, médio:** TMR de 2 h e TMS de 24 h, no horário comercial de segunda a sábado. Mesmos três pontos de medição. | 8.1, RN11 | Médio |
| CT40 | **P4, baixo:** TMR de 4 h e TMS de 72 h, no horário administrativo de segunda a sexta. Mesmos três pontos de medição. | 8.1, RN11 | Médio |
| CT41 | **Janela de cobertura:** um P3 aberto no domingo, ou um P4 aberto no sábado, só começa a contar quando a janela abre. Depende da definição dos horários (seção 6). | 8.1, 8.2 | Médio |
| CT42 | **Pausas somadas:** um chamado com duas pausas, uma em Aguardando Solicitante e outra em Aguardando Terceiro/Fornecedor, só conta os períodos ativos. O tempo restante bate com a conta feita à mão. | RN06, 8.2 | Alto |

### Ciclo de vida do chamado

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT43 | **Caminho completo:** Aberto, Em Triagem, Em Atendimento, Aguardando (Solicitante e depois Terceiro/Fornecedor, voltando a Em Atendimento), Resolvido e Fechado. Cada passagem fica no histórico com data e autor. | Ciclo de vida, RN14 | Alto |
| CT44 | **Exceções:** Cancelado a partir da triagem e Reaberto a partir de Resolvido, antes do fechamento. | Ciclo de vida | Médio |
| CT45 | **Passagens fora do fluxo**, como Fechado para Em Atendimento ou Aberto direto para Resolvido, são recusadas e o status se mantém. A matriz exata não está nos documentos (seção 6). | Ciclo de vida | Médio |

### Requisitos não funcionais (premissas do documento de visão)

| ID | Caso e resultado esperado | Rastreio | Risco |
|---|---|---|---|
| CT46 | **Responsivo:** abrir chamado e acompanhar chamado em computador e em tablet (Android e iPad), na horizontal e na vertical, sem perder função e sem rolagem horizontal. | Premissa de dispositivos | Médio |
| CT47 | **Pico de aberturas:** simular muitas aberturas ao mesmo tempo. A base é de 1.800 chamados por mês (cerca de 60 por dia), multiplicada para um pico de promoção. Nenhum chamado se perde, nenhum protocolo se repete e a tela continua respondendo. O limite de tempo não está definido (seção 6). | Premissa de resiliência | Alto |
| CT48 | **Simplicidade:** além do que já vem do contexto, abrir um chamado exige só a descrição e anexos, com poucos cliques. Anotar o tempo gasto. | Premissa de simplicidade, RN01 | Médio |

## 6. Pontos em aberto nos documentos

Dez pontos não estão definidos e mudam o resultado esperado de alguns casos. Os três primeiros constam na própria lista de pendências da Análise de Domínio. Enquanto o time não decide, use a suposição da tabela e registre-a no resultado do caso.

| # | Ponto em aberto | Casos | Suposição usada no teste |
|---|---|---|---|
| 1 | Matriz de severidade x urgência: os valores não estão definidos. A HU03 fala em Crítica, Alta, Média e Baixa; o SLA usa P1 a P4. | CT12 a CT14 | Crítica = P1, Alta = P2, Média = P3 e Baixa = P4. Preencher a matriz com o time. |
| 2 | Permissões detalhadas de cada perfil na V1. | CT10, CT11, CT23 | Solicitante vê só os seus; fornecedor só os atribuídos; os demais, conforme tabela a confirmar. |
| 3 | Mecanismo de notificação (alerta aos 80%, pendência ao solicitante). | CT22, CT32 | O alerta aparece na tela de quem deve receber. |
| 4 | Quais categorias exigem código de erro ou foto (RN02). | CT04 | Falha de hardware exige um dos dois. |
| 5 | Matriz de transições de status. O documento só desenha o fluxo. | CT43 a CT45 | Valem as passagens do fluxo; reabrir só a partir de Resolvido, antes do fechamento. |
| 6 | Horários das janelas (funcionamento da loja/CD, comercial, administrativo) e se o relógio só corre dentro delas. | CT37 a CT41 | Relógio corrido no P1; nos demais, a definir. |
| 7 | Se o prazo exato do limite está cumprido ou violado. | CT16, CT37 a CT40 | Até o limite cumpre; um segundo depois viola. |
| 8 | Janela do surto: 15 min do primeiro ao último chamado, ou janela móvel. | CT16 | Do primeiro ao último chamado. |
| 9 | O que a triagem faz se recusar a sugestão de surto. O documento só descreve confirmar. | CT19 | Só a confirmação é testada. |
| 10 | Meta numérica para o pico e para o tempo de resposta. | CT47 | Registrar os tempos medidos e propor a meta ao time. |

## 7. Rastreabilidade das regras de negócio

As quinze regras têm pelo menos um caso. As histórias já estão ligadas aos casos na coluna Rastreio das seções 3 a 5.

| Regra | Casos |
|---|---|
| RN01 Preenchimento contextual | CT01, CT02, CT48 |
| RN02 Validação preventiva | CT03, CT04 |
| RN03 Matriz de prioridade | CT12 |
| RN04 Sem prioridade manual pelo usuário | CT13, CT15 |
| RN05 Detecção de surto | CT16 a CT19 |
| RN06 Pausa do SLA | CT24, CT42 |
| RN07 Escalonamento aos 80% | CT32 |
| RN08 Fechamento automático em 48 h | CT27 |
| RN09 Acesso do fornecedor | CT10, CT11 |
| RN10 Sem exclusão de histórico | CT07, CT33 |
| RN11 TMR e TMS independentes | CT28, CT37 a CT40 |
| RN12 Registro de violação | CT29, CT30 |
| RN13 SLA preservado na reabertura | CT31 |
| RN14 Auditoria do SLA | CT24, CT43 |
| RN15 Indicadores de SLA | CT34 a CT36 |

## 8. Execução, critérios e riscos

São 48 casos em sete fases, cerca de cinco dias de trabalho para uma pessoa (estimativa). A ordem segue as dependências do MVP: HU01 primeiro, indicadores por último.

1. **Preparar (0,5 dia).** Montar os perfis simulados e os dados de teste (seção 2) e levar ao time os pontos em aberto da seção 6 que bloqueiam casos: matriz de prioridade, permissões, janelas de horário e relógio controlável.
2. **HU01 (0,5 dia).** CT01 a CT07.
3. **HU02, HU03 e HU04 (1 dia).** CT08 a CT19.
4. **HU05 e ciclo de vida (0,5 dia).** CT20 a CT24 e CT43 a CT45.
5. **HU06 e SLA (1,5 dia).** CT25 a CT33 e CT37 a CT42, os que dependem do relógio.
6. **HU07 (0,5 dia).** CT34 a CT36.
7. **Não funcionais e aceite final (0,5 dia).** CT46 a CT48 e uma repetição ponta a ponta dos três fluxos do MVP.

### Entrada

Os fluxos a testar estão disponíveis, os perfis e os dados estão prontos e cada ponto da seção 6 está decidido ou com a suposição registrada.

### Saída

- Todos os casos foram executados ou marcados como **Bloqueado**, com o motivo.
- Cada falha virou um defeito com ID.
- Os casos de risco **Alto** passam, ou têm defeito aberto que o time reconheceu.
- As evidências estão guardadas: prints, respostas da API e consultas ao banco.
- Alguém do time, como a dona do produto, confirmou o resultado esperado dos casos de risco Alto.

### Status de cada caso

- **Passou**
- **Falhou** (com o ID do defeito)
- **Bloqueado** (a funcionalidade ainda não está disponível ou depende de um ponto da seção 6)

Registre em uma planilha simples: ID do caso, status, data, evidência e defeito.

### Defeito

Registrar: ID (DEF-01, DEF-02...), caso, esperado, obtido, evidência e severidade.

- **Crítica:** mostra o chamado de outro usuário ou perde dado.
- **Alta:** impede abrir ou acompanhar um chamado.
- **Média:** regra errada sem travar o fluxo.
- **Baixa:** texto ou visual.
