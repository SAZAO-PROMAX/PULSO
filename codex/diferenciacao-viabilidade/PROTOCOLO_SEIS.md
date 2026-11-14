# Tempo até decidir uma divergência de integração

**Estado:** planeado. Seis lugares reservados, zero incidentes externos recebidos, zero sessões observadas. Preencher uma cópia local. Manter o oráculo e as notas do observador separados dos pacotes dos participantes.

**Pergunta.** Com os mesmos originais, contexto e registos, qual ferramenta permite chegar mais depressa a uma decisão de aceitação corretamente fundamentada? Comparar o PULSO corrigido com o script normalizado em services/fidelity/normalized.py. Fixar commit, catálogo, configurações e hashes dos pacotes antes da primeira sessão. Os 30 casos históricos ficam exclusivamente para regressão.

## Preparação pelo integrador e pelo moderador

Obter seis incidentes novos inteiramente inventados pelo integrador, representativos de problemas que já investigou. Para cada um pedir origem e destino, contrato de entrega, identificadores e regra de emparelhamento, mapeamento, campos obrigatórios/opcionais, unidades e formatos autorizados, original sintético com linhas numeráveis e a decisão que aceitaria com a respetiva prova. Identificar pelo menos uma perda crítica, uma ausência legítima, uma contradição e uma ligação de evidência insuficiente. Podem coexistir no mesmo incidente. Registar dificuldades de preparação e minutos de configuração por ferramenta. Se os dados não forem representáveis pelo contrato do ensaio, registar o limite antes da medição e preservar o original. Nenhuma transformação pode revelar a resposta, corrigir uma divergência ou apagar uma ambiguidade.

O moderador prepara pacote neutro com id I01–I06, synthetic=true, source, destination, evidence e sourceSha256 (SHA-256 dos bytes de sources/Ixx.txt). Usar a estrutura de pairs.json para as células e referências. No formato de uma página, documentId identifica synthetic-Ixx. Dar aos dois participantes exatamente o mesmo JSON, original, contrato e contexto, sem classe, título sugestivo, decisão ou campo assinalado pelo autor. Disponibilizar ambos os registos e o original para consulta manual em ambas as condições. Verificar que cada ferramenta abre o pacote. Congelar a configuração. Guardar o oráculo fora da pasta distribuída e ocultar respostas dos restantes participantes.

Na raiz, executar cada ferramenta sobre o mesmo ficheiro. O comando pulso escreve em tmp/study o HTML individual sem resposta de referência nem resultado da outra ferramenta. O comando script mostra a classe e os campos identificados pela normalização.
~~~powershell
python -m services.fidelity.study pulso CAMINHO/I01.json
python -m services.fidelity.study script CAMINHO/I01.json
~~~

**Oráculo reservado — preencher e fechar os seis antes de cronometrar.** Aceitar / bloquear / pedir revisão são decisões de entrega. A classe técnica é equivalente / perda / ambíguo. Definir previamente as respostas alternativas aceitáveis, a prova mínima e quando a falta de prova é a própria resposta correta. O moderador e o integrador datam e aprovam esta folha. Uma alteração posterior invalida o caso para a análise principal.

| ID | Classe | Decisão esperada e fundamento no contrato | Campo, origem → destino e prova mínima (doc./linha) | Crítico? | Hash do pacote, aprovação e data |
|---|---|---|---|---|---|
| I01 | | | | | |
| I02 | | | | | |
| I03 | | | | | |
| I04 | | | | | |
| I05 | | | | | |
| I06 | | | | | |

## Sessões

Dois engenheiros com experiência comparável, diferentes do autor dos casos. Sortear qual segue A ou B. Fazer treino igual nas duas ferramentas com material separado. Sortear os seis pacotes pelos códigos antes de começar, registar a atribuição. Cada engenheiro vê cada incidente uma única vez, três por ferramenta. Cada incidente recebe ambas as ferramentas, por pessoas diferentes. Alternar a ferramenta a cada tarefa. Sem discussão nem feedback até à conclusão. A começa com PULSO, B com script, em ordem diferente de incidentes.

Iniciar ao revelar o pacote e a ferramenta prontos. Parar quando a pessoa submeter a decisão final, campo, razão e referência verificável (ou justificar a insuficiência). Limite pré-fixado: 10 minutos. Guardar duração real mesmo com erro ou limite atingido. O avaliador pontua contra o oráculo congelado, sem conhecer a ferramenta sempre que possível. Exatidão exige decisão e fundamento aceites. Perda crítica aceite significa autorização de entrega quando o oráculo exige bloqueio por perda crítica. Ajuda só a pedido, com número, conteúdo e instante. Registar se houve intervenção que revelou a resposta.

| Pessoa / ordem | ID | Ferramenta | Tempo (s) / limite atingido? | Decisão, campo e prova indicados | Correto? | Perda crítica aceite? | Ajuda (n.º, teor) | Falhas C/E/U e observação |
|---|---|---|---|---|---|---|---|---|
| A1 | I01 | PULSO | | | | | | |
| A2 | I02 | Script | | | | | | |
| A3 | I03 | PULSO | | | | | | |
| A4 | I04 | Script | | | | | | |
| A5 | I05 | PULSO | | | | | | |
| A6 | I06 | Script | | | | | | |
| B1 | I03 | Script | | | | | | |
| B2 | I04 | PULSO | | | | | | |
| B3 | I05 | Script | | | | | | |
| B4 | I06 | PULSO | | | | | | |
| B5 | I01 | Script | | | | | | |
| B6 | I02 | PULSO | | | | | | |

**C** = classe técnica errada face ao contrato. **E** = prova ausente, contraditória, mal atribuída ou insuficiente para a conclusão apresentada. **U** = dificuldade observada de navegação, leitura ou descoberta da fonte. Permitir múltiplas marcas. Descrever a ação observada e distinguir a saída da ferramenta da decisão humana. Uma revisão correta porque a origem é insuficiente não é, por si, falha.

## Análise predefinida

Apresentar as doze observações, incluindo erros, desistências, ajuda e limites. Por ferramenta: decisões corretas / 6, perdas críticas aceites / total crítico, pedidos de ajuda, tempo de configuração e contagens C/E/U. Para cada incidente mostrar os dois tempos, as duas decisões e a diferença em segundos. Para pares com ambas as decisões corretas calcular 100 × (tempo script − tempo PULSO) / tempo script e a mediana dessas seis reduções se todos forem elegíveis. Se uma decisão for incorreta ou faltar, apresentar o par marcado e o número elegível; não substituir o tempo por zero nem declarar a meta cumprida a partir do subconjunto favorável.

| ID | PULSO (s / correto?) | Script (s / correto?) | Diferença e redução individual | Ajuda e falhas relevantes |
|---|---|---|---|---|
| I01 | | | | |
| I02 | | | | |
| I03 | | | | |
| I04 | | | | |
| I05 | | | | |
| I06 | | | | |

**Avançar para uma amostra maior** se os seis pares forem avaliáveis, o PULSO tiver pelo menos a mesma exatidão, zero perdas críticas aceites e mediana de redução de pelo menos 30% nas decisões corretas. Reportar também configuração e ajuda. **Reorientar** se o script igualar ou superar exatidão e rapidez, ou se uma perda crítica for aceite pelo PULSO. Investigar a falha C/E/U antes de ampliar. Restantes resultados são inconclusivos. Seis incidentes e dois engenheiros deixam diferenças de experiência, ordem e seleção de casos por resolver. O limiar é exploratório e não estima a poupança de um cliente.

**Materiais ainda em falta:** seis pacotes sintéticos, originais e contratos correspondentes, critérios de gravidade, oráculos aprovados, dois participantes e disponibilidade de observação. Preencher tempos e decisões humanas apenas durante sessões realizadas.
