# Consistência da entrega fidelity-1.0.1

Base revista cfe2ab4. Commit desta atualização obtém-se por git log -1 -- services/fidelity/normalized.py. Regras PULSO fidelity-1.0.1 e alternativa normalized-1.0, sem alteração das regras de classificação nesta tarefa.

O relatório anterior omitia a alternativa normalizada que o estudo efetivamente usa. run.evaluate executa agora classify de normalized.py para cada par, publica normalized em results.json, nas três tabelas agregadas e em todas as linhas por caso. O metadata normalizedVersion identifica a implementação. RESULTADOS.md foi regenerado com Pydantic 2.14.3. Ambas atingiram 30/30 classes, zero perdas omitidas, zero falsos alertas nos dez equivalentes e dez abstenções. A equivalência refere-se às classes do corpus. PULSO verifica a evidência por campo, enquanto a alternativa normaliza os registos e disponibiliza as fontes para inspeção manual pelo participante.

Reprodução mínima executada sem alterar fixtures
~~~python
pairs, truth = load_corpus()
pair = pairs[0]
pair["evidence"]["value"] = pair["evidence"]["unit"]
evaluate([pair], truth)[0]
~~~
No comparador recuperado de 3afacf6 o resultado foi equivalent. Na implementação atual foi ambiguous, com o motivo “Prova insuficiente: o excerto não identifica este campo.” A causa histórica era aceitar a presença de uma referência sem verificar o suporte ao campo. O defeito mínimo está corrigido. As cinco regressões em test_evidence.py incluem campo errado, prova ausente, contradição, linha conjunta legítima e integridade da referência. Os formatos reconhecidos continuam limitados à gramática etiquetada do ensaio.

Verificações concluídas
- 25 testes Python aprovados com a venv da aplicação, incluindo os dois testes Pydantic.
- Os mesmos 30 pares e oráculos, sem alterações, aprovados com --check --reference.
- Teste adicional confirma a inclusão do normalizado e concordância com as 30 classes.
- Teste dos dois entrypoints do estudo captura source e destination e confirma igualdade com o mesmo pacote, incluindo as chamadas ao comparador atual e ao script normalizado.
- read_original é executado em ambas as condições antes da ferramenta, verificando o mesmo ficheiro e hash. O protocolo disponibiliza JSON, original, contrato e contexto a ambos os participantes.
- Sem sessões humanas executadas. Os testes de entrada usam pacotes sintéticos de regressão.

Comandos reproduzíveis na raiz da pasta local de entrega
~~~powershell
git rev-parse HEAD
.\.venv\Scripts\python.exe -m unittest discover -s tests/fidelity -v
.\.venv\Scripts\python.exe -m services.fidelity.run --check --reference
.\.venv\Scripts\python.exe -m services.fidelity.study pulso CAMINHO/I01.json
.\.venv\Scripts\python.exe -m services.fidelity.study script CAMINHO/I01.json
~~~
Nesta revisão usou-se a cópia isolada tmp/fidelity-review. Nessa pasta o executável equivalente foi ../../.venv/Scripts/python.exe. O script chamado pelo estudo é exatamente a função classificada nas tabelas, sem dependência do oráculo. Fixar o commit impresso acima no registo da sessão.

A comparação principal passa a PULSO versus normalized-1.0. O empate em classes mantém a hipótese de tempo até decisão correta por testar. A comparação literal e os validadores mantêm-se como referências auxiliares. A reserva C foi conhecida pelo autor e mede regressão destas regras. Os oito falsos alertas evitados face à comparação literal não constituem ganho sobre a alternativa normalizada.

Faltam seis incidentes sintéticos novos fornecidos pelo integrador, originais e destinos, contratos/mapeamentos e critérios de gravidade, decisões esperadas e provas mínimas aprovadas antes de medir, e dois engenheiros disponíveis. Usar PROTOCOLO_SEIS.md para distribuição, tempos individuais, exatidão, perdas críticas aceites e ajuda. O limiar de 30% continua exploratório. Zero incidentes externos e zero tempos humanos foram acrescentados.
