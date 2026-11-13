# Ensaio de fidelidade — utilização e passagem de fase

13/11/2026. Base preservada: `e255f0e`, aplicação pessoal **0.7.4 experimental**. Incremento separado **fidelity-1.0**, branch `trabalho/diferenciacao`. Sem alteração de versão, esquema, autenticação, UI ou pipeline de extração da aplicação.

## Executar no Windows

Na raiz desta cópia completa (contém apps, services, packages e codex):

```powershell
.\ensaio.cmd
# Em alternativa, sem depender de pacotes da aplicação:
python -m services.fidelity.run --check --demo
python -m unittest discover -s tests/fidelity -v
Start-Process .\tmp\fidelity\demo.html
```

Python 3.15.2 foi efetivamente usado. O laboratório usa só biblioteca padrão e importa exclusivamente o módulo puro `services/api/app/laboratory.py`, que lê o catálogo partilhado. Não importa o servidor, não abre SQLite, não liga ao Ollama, não faz chamadas de rede e não usa dados da instalação anterior.

`ensaio.cmd` usa a venv local quando disponível e executa também `--reference`, com o Pydantic 2.14.3 já fixado nas dependências da aplicação. O comando Python sem essa opção funciona sem pacotes adicionais. Para reproduzir a referência explicitamente: `.\.venv\Scripts\python.exe -m services.fidelity.run --check --demo --reference`.

O comando escreve `results.json`, `report.md`, `demo.html` e `runtime.json` em `tmp/fidelity`. Saídas determinísticas exceto duração operacional em runtime.json. `--check` devolve 1 se classe/campos divergem da verdade de referência, 0 quando o ensaio cumpre o oráculo. As perdas introduzidas são resultados esperados do ensaio, não sinal de que a CI deve falhar.

## Demonstração de dois minutos

1. Abrir demo.html, selecionar **Conservado (E01)**: colheita 5 de novembro, emissão 7; campos preservados.
2. Selecionar **Alterado (L01)**: destino põe 7 na colheita. Abrir “Evidência e regra”: página, linha, excerto e regra versionada. Abrir o original sintético completo.
3. Selecionar **Omitido (L02)**: a colheita confirmada na origem desaparece do destino; ausência é explícita.
4. Selecionar **Desconhecido (A01)**: o método já não era conhecido na origem. Revisão necessária, sem inventar método ou equivalência.

Cada campo mostra origem, recebido, estado, gravidade de fidelidade, razão e evidência. O ficheiro HTML é autónomo, sem JavaScript nem recursos externos. Este relatório navegável não constitui integração do laboratório na interface pessoal. Não foi feito ensaio de usabilidade com uma pessoa.

## Corpus, regras e avaliação

30 pares: 10 equivalentes, 10 perdas, 10 ambíguos. Casos e verdade de referência são ficheiros separados; `author_corpus.py` declara os oráculos sem importar o comparador. A/B desenvolvimento (20), C avaliação (10), ordenações de linhas distintas. O comparador recebe campos estruturados, não faz OCR nem mapeamentos automáticos. A reserva foi designada antes da primeira execução; não representa avaliação cega por terceiro. Não se alteraram regras após observar os resultados da família C.

Identificadores, alias e unidades vêm de `packages/shared/laboratory.json`; normalização explícita reutiliza `laboratory.py`. Campos de prova correspondem a `Result.evidence`/`sourceFields` em data.ts/importData.ts: colheita, emissão, método/amostra, página, excerto, valor/unidade originais e processamento separado. Este é um contrato de ensaio separado, não uma migração do modelo da aplicação. Sem códigos LOINC/UCUM inventados e sem representação FHIR.

Baseline simples: igualdade literal de nove campos, com ausência distinta de desconhecido e processedAt excluído da decisão semântica em ambas as abordagens. Baseline de estrutura: contrato nativo local v1 executado por `validate_record`; verifica estados/valores suportados, sem comparar com a origem. Referência existente adicional: **Pydantic 2.14.3**, contrato **fidelity-record-1**, modelos de células com estados explícitos, sem regras do comparador ou acesso ao oráculo. Aceitou os 30 pares e não detetou as 10 perdas de significado; verifica estrutura de transporte, não semântica de origem. Não se apresentam estes contratos locais como Inferno, Firely ou conformidade FHIR. Avaliação contra validador institucional independente permanece pendente.

## Resultado da execução

Ver [RESULTADOS.md](RESULTADOS.md) para tabela por caso, conjunto reservado, hashes, falsos positivos, perdas omitidas e abstenções. PULSO: 30/30 classes e campos esperados; comparação simples: 12/30 classes, mas também deteta todas as 10 perdas. O ganho demonstrado limita-se a oito falsos alertas de representação evitados e dez situações ambíguas enviadas para revisão. Não há ganho demonstrado na deteção das perdas críticas sobre a comparação simples.

Sem medição de revisão humana, configuração em parceiro, poupança, receita, precisão clínica ou generalização. Tempos da máquina estão em runtime.json e não são tempos de investigação. A autoria dos casos e código pela mesma pessoa/agente é um viés a corrigir na fase seguinte.

## Regras para a próxima fase

Incrementos 1–3 do ENSAIO.md: corpus, comparador/relatório, baselines locais e referência estrutural Pydantic executados. Comparação com ferramenta de interfaces institucionais e tempo humano ficam em aberto; não declarar a prova competitiva concluída. Incremento 4: falta ensaio web com duas origens de um cenário de parceiro e observação humana. O HTML atual é uma demonstração técnica offline. Incremento 5/piloto: não iniciado.

Próximos três objetivos:

1. Obter casos inventados por terceiros e novo conjunto reservado antes de ajustar regras; escolher contrato real e validador de referência com versão/perfil fixados.
2. Medir tempo/erros/ajuda numa demonstração com duas origens, alternando a ordem das ferramentas. Só depois avaliar a meta de redução de 30%.
3. Realizar seis entrevistas em três organizações; avançar para piloto apenas com problema recorrente em duas, custo identificável e responsável disposto a discutir piloto pago. Não foram enviadas mensagens nem marcadas entrevistas.

Se a melhor alternativa resolver os mesmos casos pelo mesmo custo, reorientar conforme ENSAIO.md. A aplicação pessoal mantém a sua função de demonstração PENGEL. Android, redesenho do Hub, produção, dados reais e estabilidade prolongada pertencem a tarefas separadas.

## Manter local e GitHub alinhados

```powershell
.\sync.cmd status
.\sync.cmd pull
# Após editar, testar, rever .gitignore e escolher ficheiros pertinentes:
git add <ficheiros-revistos>
git commit -m "Descrição concreta da alteração"
.\sync.cmd push
```

O script confirma origin oficial, branch, checkout limpo, histórico e igualdade do SHA remoto após push. Integra só fast-forward. Divergências interrompem sem sobrescrever trabalho; não usa force. Atualiza a mesma branch, sem integrar automaticamente main. As verificações do script cobrem o laboratório; mudanças à aplicação exigem os seus testes proporcionais. Atualização é feita a cada entrega, sem serviço de sincronização permanente. Bases, contas, modelos e documentos privados ficam fora do Git.

A instalação anterior no OneDrive permanece separada e operacional; não aponta automaticamente para esta branch nem partilha a sua base. O ZIP original e AUDITORIA.md ficam no computador; a síntese de documentos privados da auditoria está ignorada no Git. Este diretório contém o código completo e o plano operacional necessário.

## Verificações desta entrega

- 18 testes do laboratório aprovados (incluem 30 subcasos com classes/campos e 30 pares na referência), determinismo de três artefactos, preservação dos inputs, precisão decimal, datas inválidas, ausência/desconhecido, prova inexistente, escape HTML e guarda da saída em tmp. Os testes foram repetidos ao integrar a referência; as repetições não contam como testes distintos.
- 111 testes API aprovados em `tmp/fidelity-api-verified`, 26,64 s, dois avisos de depreciação existentes. Comando: `.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/fidelity-api-verified`.
- 62 testes TypeScript e typecheck aprovados; `pip check` sem incompatibilidades. Dependências instaladas pelo lockfile/requirements existentes, sem alterações de versão.
- Launcher `--check` encontrou Python/Expo e portas alternativas 8017/8087 livres; não foi iniciada outra instância sobre as portas habituais. A cópia contém o ambiente de execução instalado, sem base copiada ou supervisão nova.
- Sem novo ensaio web autenticado, OCR/Ollama, carga, estabilidade prolongada, suspensão ou observação humana. A tentativa de pré-visualização do relatório no browser integrado terminou com timeout de ligação ao servidor temporário; o HTML teve validação estrutural/escape, sem validação visual declarada. Servidor temporário encerrado.
- Tentativas iniciais de venv/npm no isolamento falharam por permissões/rede; concluídas com acesso adequado. A primeira execução API sem progresso foi interrompida; só a execução concluída acima conta. O Windows recusou scripts PowerShell; sincronização foi adaptada para Node, sem alterar políticas de segurança.

Sincronização: três testes Node aprovados; origin incorreto, trabalho sem commit e modo inválido são recusados antes de comunicar com remotos, preservando o checkout. Comando: node --test tests/fidelity/sync.test.mjs.
