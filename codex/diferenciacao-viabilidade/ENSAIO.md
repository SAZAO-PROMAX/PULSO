# Ensaio de diferenciação e viabilidade

## Quem teria motivo para pagar

Começar em Portugal com fornecedores de software laboratorial ou integradores que entreguem resultados a mais de um sistema. A pessoa que sente o custo é o engenheiro que investiga a divergência; o possível comprador é o responsável pela integração ou pela qualidade da entrega. O momento de compra a investigar é a aceitação de uma interface nova ou a regressão após atualização de um mapeamento. Um ciclo repetido em vários clientes favorece licenciamento por equipa ou interface. Um mapeamento artesanal por cliente aproxima o negócio de consultoria.

| Alternativa | O que já oferece | Comparação que o PULSO tem de vencer |
|---|---|---|
| My CUF e Guava | A CUF disponibiliza exames da rede. A Guava agrega informação de saúde, apresenta resultados e já oferece preparação de consulta. | Para o utilizador, medir tempo e sucesso para localizar o mesmo parâmetro em duas origens, explicar uma incompatibilidade e abrir a fonte. |
| Inferno e Firely | Existem conjuntos de testes de conformidade FHIR e validação de instâncias contra perfis. | Usar um validador com versão e perfil fixados e um destino estruturalmente aceite; verificar se comparar com a origem descobre um valor, método, amostra ou data trocados. |
| Scripts e revisão manual do integrador | Constituem a alternativa de compra mesmo quando uma plataforma tem mais funções. | Comparar os mesmos casos à solução já usada, incluindo configuração, falsos alertas e tempo de investigação. |

Fontes públicas consultadas em 13/11/2026: [My CUF](https://www.cuf.pt/my-cuf/resultados-de-exames), [Guava](https://guavahealth.com/), [Inferno](https://inferno.healthit.gov/test-kits/), [Firely](https://docs.fire.ly/projects/Firely-NET-SDK/en/latest/validation/profile-validation-internals.html). Capacidades descritas pelos fornecedores. A cobertura de cada alternativa em Portugal e o desempenho comparado continuam por medir.

## O primeiro caso demonstrável

Um resultado de glicose chega com data de colheita e data de emissão. O exportador usa a data de emissão em lugar da colheita. Ambas são datas válidas. A ferramenta deve localizar a divergência, mostrar os dois campos e indicar qual a linha/página de origem que permite confirmá-la. Outro caso deve preservar um método desconhecido e encaminhar para revisão. O sistema só pode declarar equivalência quando houver evidência suficiente.

| Ordem | Incremento | Critério de aceitação proposto |
|---|---|---|
| 1 | Corpus sintético com pares origem/destino e verdade de referência independente do comparador | 30 pares iniciais, 10 equivalentes, 10 perdas introduzidas e 10 ambíguos. Cobrir unidade, parâmetro, valor, data, método/amostra e proveniência. Separar desenvolvimento e avaliação por família de layout. |
| 2 | Comparação por campo, relatório legível e resultado processável em integração contínua | Cada divergência tem caso, campo, esperado, recebido, gravidade, fonte e regra versionada. Um campo desconhecido tem estado explícito. Repetir produz o mesmo resultado. |
| 3 | Baselines de validação de estrutura e comparação simples por campo | Executar as três abordagens nos mesmos pares. Reportar contagens por tipo, falsos negativos críticos, falsos positivos, abstenções, tempo de revisão e configuração. Divergência de formato equivalente não deve ser erro crítico. |
| 4 | Demonstração web com duas origens | Uma pessoa parte do aviso, identifica o campo alterado, vê a origem e decide se é comparável. Registar tempo, erros e pedidos de ajuda. |
| 5 | Piloto delimitado | Um parceiro identifica interface, responsável, orçamento, esforço de instalação, métricas e preço para um piloto. Uma segunda organização avalia o mesmo núcleo para testar reutilização. |

## Como decidir se merece investimento

Em duas semanas, propor seis entrevistas exploratórias em pelo menos três organizações, sem solicitar documentos clínicos. Perguntar pelo último incidente concreto, frequência, horas de investigação, ferramenta usada, custo de configuração e quem aprovou a despesa. Pedir um exemplo inventado que reproduza a falha. Interesse verbal e elogios à demonstração são evidência fraca.

Valor anual estimado por cliente = integrações por ano × horas poupadas por integração × custo horário carregado + retrabalho evitado, sem dupla contagem. Margem de contribuição do piloto = preço acordado − custo das horas de implementação, revisão e suporte − custos diretos de execução. Registar horas próprias. Não projetar uma margem até ter observações do parceiro.

**Avançar para piloto** se pelo menos duas organizações independentes relatarem o mesmo problema com custo identificável, houver um responsável disposto a discutir um piloto pago e o ensaio mostrar vantagem adicional sobre a melhor alternativa. Propor como alvo inicial zero perdas críticas omitidas no conjunto reservado e redução de 30% no tempo mediano de revisão, mantendo a contagem absoluta de casos. Estes limiares são propostas, não resultados nem garantias. Alternar a ordem das ferramentas para reduzir o efeito de aprendizagem.

**Reorientar** se a ferramenta existente resolver os mesmos casos pelo mesmo custo, se o esforço específico de cada interface absorver a margem ou se ninguém controlar orçamento para esta necessidade. Se os parceiros apontarem o custo principal na digitalização de arquivos antigos, testar separadamente a hipótese C, conversão documental com proveniência. Se forem os utentes a demonstrar maior benefício, retomar a hipótese pessoal com um ensaio da preparação de consulta entre prestadores.
