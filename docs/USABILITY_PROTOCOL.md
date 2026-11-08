# Protocolo de usabilidade e tecnologias de apoio — v0.7

**Plano por executar**, preparado em 08/11/2026. Não existem participantes recrutados, entrevistas ou resultados. Apenas aplicação local, perfis fictícios e PDFs sintéticos do projeto. Não recolher informação de saúde dos participantes.

## Preparação e recrutamento

Sessão moderada de cerca de 40 minutos, com pausa e possibilidade de desistir. Explicar a finalidade e obter concordância informada para observações manuais; sem gravação automática, telemetria ou contas reais. Usar códigos de sessão, não nomes, nas notas. Definir responsável, acesso e prazo de eliminação das notas antes do recrutamento.

Plano inicial: procurar 2–3 pessoas em cada grupo 18–34, 35–54, 55–64, 65–74 e 75+ (quando viável), com literacia digital variada; incluir utilizadores habituais de tecnologias de apoio quando possível. É uma amostra exploratória planeada, sem representatividade estatística nem dimensão já obtida. Adaptar duração e pausas às necessidades de cada pessoa.

O facilitador inicia `.\dev.cmd`, confirma serviço local e escolhe um perfil/ambiente de ensaio só com dados fictícios. **Não repor nem apagar a base normal do utilizador.** Preparar cópia de ensaio separada e PDF `data/synthetic/laboratorio-demo.pdf`. Anotar versão/commit, Windows, navegador, largura, zoom, tema e tecnologia de apoio/versões. Explicar como terminar a sessão. Pedir que a pessoa pense em voz alta, sem ensinar antecipadamente o percurso.

## Tarefas e conclusão observável

Dar uma tarefa de cada vez, sem indicar nomes de botões. Medir desde o enunciado até à conclusão/desistência. Aos 3 minutos, perguntar se pretende ajuda; aos 5, permitir terminar ou continuar, anotando a decisão. Qualquer orientação conta como ajuda, sem atribuir culpa ao participante.

| # | Enunciado | Conclusão observável |
|---|---|---|
| 1 | Entre no PULSO com o perfil fictício indicado. | Inicia sessão na conta experimental inteiramente fictícia e identifica o perfil; não usar conta pessoal. |
| 2 | Encontre a última análise ao sangue. | Abre o exame e identifica data/origem; distingue importação da data do relatório. |
| 3 | Consulte a evolução da glicose. | Escolhe parâmetro/período e consulta data, valor, unidade e origem de um ponto. |
| 4 | Descubra o significado de HbA1c. | Abre a explicação e descreve-a pelas suas palavras, sem interpretar um resultado pessoal. |
| 5 | Procure a biblioteca educativa. | Abre Aprender e uma ficha completa. |
| 6 | Encontre uma explicação sobre tensão arterial. | Usa pesquisa/categoria e encontra sistólica ou diastólica. |
| 7 | Registe 128/78 mmHg, pulsação 72 bpm, na data/hora fictícia indicada. | Revê, guarda e encontra o registo no histórico. Não avaliar segurança clínica destes valores. |
| 8 | Importe o PDF sintético fornecido. | Seleciona, importa e chega à revisão, sem gravação automática. |
| 9 | Corrija a glicose para 99 mg/dL neste exercício e confirme o resultado. | Revê as linhas, confirma e encontra a medição/histórico atualizado; original permanece acessível. |
| 10 | Elimine o registo fictício criado na tarefa 7. | Confirma eliminação do registo certo; os restantes mantêm-se após recarregar. |

## Grelha de observação em branco

Copiar uma linha por tarefa/sessão; não preencher com resultados simulados. Sucesso: independente / com ajuda / incompleto / desistiu. Erro: ação que afasta da conclusão, sem contar exploração normal como falha.

| Sessão/tarefa | Sucesso | Tempo | Ajuda e motivo | Nº erros | Confusão | Termos compreendidos/dúvidas | Comentários espontâneos | Barreiras de acessibilidade |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

Perguntar após cada tarefa: «Foi fácil ou difícil (1 a 5)?», «O que esperava que acontecesse?» e «Que palavra foi pouco clara?». No final: «O que distingue confirmar um resultado de uma revisão médica?», «Onde consultaria a origem?», «Que mudança ajudaria mais?». Não pedir doenças, exames pessoais ou recomendações médicas.

Critérios exploratórios definidos **antes** do ensaio: nenhuma perda/associação indevida de dados ou barreira que impeça concluir por teclado/tecnologia de apoio; pelo menos 80% das tentativas concluídas sem ajuda, por tarefa, reportando também números absolutos e diferenças entre perfis; todos os participantes devem conseguir distinguir informação educativa de validação clínica após esclarecimento. Um resultado abaixo do critério origina correção e novo ensaio; não prova incapacidade da pessoa. Amostra pequena não valida eficácia clínica nem conformidade WCAG.

## Protocolo de acessibilidade por executar

Referência: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Registar componente, passos, anúncio observado, anúncio esperado, gravidade e correção. Repetir tarefas essenciais nos dois temas. Não confundir inspeção automática de atributos com leitura real.

- **Windows + NVDA + Chrome/Firefox:** confirmar versões e voz portuguesa, iniciar leitura no Hub, percorrer títulos/links e Tab/Shift+Tab. Abrir «Sobre Glicose» com Enter, verificar nome do diálogo, foco no fecho, leitura das duas secções, confinamento do foco e Escape com retorno ao botão. Consultar a lista «Medições de Glicose» e selecionar com Espaço. Submeter tensão vazia: verificar anúncio do erro, associação ao campo e foco. Percorrer PDF/revisão/guardar/editar/eliminar e anúncios de sucesso/erro. Usar modos de navegação/foco conforme o [guia NVDA](https://download.nvaccess.org/releases/stable/documentation/en/userGuide.html).
- **Android + TalkBack + Chrome:** ensaiar a versão web por LAN privada, quando existir dispositivo autorizado e acesso ao serviço. Percorrer controlos por deslize, ativar com duplo toque e explorar por toque; verificar nomes, estados, ordem, modal/fecho, formulário/teclado, lista dos pontos e retorno do foco. Aumentar texto no sistema sem perder ações. [Gestos oficiais TalkBack](https://support.google.com/accessibility/android/answer/6151827?hl=en-uk). Não confundir com suporte nativo Expo: seletor documental nativo continua em falta.
- **iOS + VoiceOver + Safari:** repetir no dispositivo físico pela versão web; percorrer por deslize, ativar por duplo toque e usar rotor de títulos/controlos. Confirmar leitura de unidade/data/origem, foco no modal/retorno, erros e ações com texto ampliado. [Documentação oficial VoiceOver](https://developer.apple.com/documentation/uikit/supporting-voiceover-in-your-app). A avaliação da app nativa requer build e ensaio próprios.
- **Zoom real Windows:** menu do navegador → Zoom 200%, depois 400% para reflow; registar percentagem e janela. Percorrer Hub, ficha completa, modal, formulário e gráfico por teclado, incluindo rolagem. Procurar cortes, sobreposição e necessidade de rolagem em duas direções; voltar a 100%. Não usar CSS zoom como substituto.

Estado atual: NVDA não encontrado nos locais habituais/PATH/processos; não instalado durante o sprint. Controlo do Chrome para zoom real não autorizado dentro do tempo de espera, sem ações de zoom executadas. TalkBack, VoiceOver, dispositivos físicos, recrutamento e sessões humanas **pendentes**. Estes limites não são supridos pelos testes Playwright.


## Comparação planeada dos modos — v0.7
Plano ainda sem participantes/resultados. Registar modo escolhido, experiência digital autodeclarada opcional e preferências de apoio; grupos etários não atribuem modo ou competência. Contrabalançar a ordem dos três modos entre sessões e usar os mesmos dados/tarefas, permitindo mudar preferências e fazer pausas. Não esconder funções no modo Simples; observar se a expansão de resumos/períodos é compreendida. Não recolher doenças ou identidade pessoais nem gravar/ativar telemetria sem avaliação própria.
Tarefas adicionais: concluir/retomar onboarding; mudar modo sem perder dados; escolher período personalizado; comparar tensão e pulsação distinguindo mmHg/bpm; criar acontecimento fictício e encontrar marcador/documento; explicar que coincidência temporal não é causalidade. Repetir encontrar exame, HbA1c, tensão e PDF. Medir sucesso, tempo, erros, ajuda, compreensão, satisfação e barreiras na grelha existente, sem preencher resultados fictícios. Testar teclado, leitor real e texto/zoom nos três modos. Zoom CSS e exportação JS não substituem zoom real ou ensaio físico.


## Percursos de entrada e simplificação v0.7.1 — por executar com pessoas
Acrescentar às tarefas existentes: reconhecer a página pública sem sessão; entrar na conta fictícia vazia e identificar as três ações iniciais; guardar exame e encontrar detalhe/evolução; abrir filtros e opções avançadas; mudar grupo do Perfil; terminar sessão e usar Voltar sem ver dados. Comparar os três modos e cinco larguras, observando se a divulgação progressiva é compreendida. Continuam sem participantes/resultados, leitor real, zoom real ou certificação. A matriz automatizada não substitui este protocolo.
