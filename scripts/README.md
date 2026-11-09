# Scripts

- `dev.cmd` na raiz / `dev.mjs`: arranque local; não apaga a base.
- `auth_dev.py`: emissão local privilegiada de códigos de recuperação/verificação para contas fictícias. Sem envio de e-mail ou endpoint público para obter códigos; usar o procedimento em `docs/GUIA_WINDOWS.md`, nunca guardar códigos em Git/relatórios.
- `load_test.py`: carga HTTP isolada na porta 8877, SQLite nova sob `tmp`, apenas dois perfis fictícios partilhados e Ollama desligado. Reutiliza httpx da venv, sem dependências novas. Resultados/configuração em `results.json`, isolamento em `isolation.json`, servidor em `server.log`. Consultar `docs/LOAD_TEST.md` para o ensaio executado e limitações.

PowerShell, na raiz:

```powershell
# Ensaio completo: subida gradual e 10 minutos de mistura na maior carga estável
.\.venv\Scripts\python.exe scripts/load_test.py
# Ensaio curto para verificar a ferramenta
.\.venv\Scripts\python.exe scripts/load_test.py --users 1 --duration 1 --ramp 0.2 --pause 0.1 --soak 0 --max-seconds 90
# Configuração explícita; a pasta de saída tem de ser nova
.\.venv\Scripts\python.exe scripts/load_test.py --users 1 10 25 50 100 250 --duration 12 --ramp 2 --pause 0.3 --soak 600 --max-seconds 1800 --port 8877 --output tmp/carga-exemplo
# Testes das fronteiras do gerador
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
# Colisões de identificadores/edições, sem carga
.\.venv\Scripts\python.exe scripts/load_test.py --probes-only --port 8878
# Prova pequena de admissão/cancelamento da fila, sem inferência
.\.venv\Scripts\python.exe scripts/load_test.py --queue-probe --port 8878
# Opcional separado: uma única inferência, com Ollama local disponível
.\.venv\Scripts\python.exe scripts/load_test.py --inference-only --port 8878 --max-seconds 360
```

Parar com Ctrl+C no terminal que iniciou o ensaio: preserva resultados parciais e termina o servidor que criou. Prazo global configurável; saída 124 ao expirar e 130 em interrupção pelo teclado. Porta ocupada ou pasta fora de `tmp`/já existente são recusadas. Não apontar o gerador à API normal: não aceita URL remota. O ensaio principal não invoca inferência; não é um benchmark de Ollama nem de renderização de centenas de navegadores.

`--fixture` aceita apenas PDF sob `data/synthetic`, até 2 MB. O fluxo revê explicitamente um valor fictício para 99 mg/dL; não transforma propostas em resultados reais. `--inference-only` reutiliza o gerador sintético já existente, não confirma nem guarda propostas e não executa os patamares de carga. As recusas 429/409 são contadas separadamente: `stable` avalia integridade e objetivos provisórios de latência/erro, **não garante que importações recusadas foram atendidas**. `integrity` exige schema/proprietários/vínculos válidos, PRAGMA integrity_check e estado final exatamente igual ao inicial após eliminar apenas os registos do ensaio. Uma falha nesta igualdade exige inspeção; não implica por si só corrupção física da SQLite.

Cada utilizador repete percursos com pausa configurável e variação ±20%; leituras incluem intervalo entre Hub e histórico. O padrão de 0,3 s é acelerado para stress, não representa o tempo humano de preencher/rever um formulário. Para percursos mais espaçados, usar por exemplo `--pause 3`; resultados dessa carga diferente não são diretamente intercambiáveis. Recursos Windows são amostras de 2 s do processo real da API e do gerador; subprocessos curtos de extração, GPU, renderização web e toda a árvore de processos não são contabilizados nesses totais.


## Coorte e fidelidade v0.7.3
profile_reliability.py gera fixtures determinísticas de 1.000 contas/históricos, usa serviço próprio em loopback e nova SQLite em tmp, verifica autorização/persistência e faz carga progressiva com interrupção por objetivos provisórios. Não cria contas na base normal, não desativa autenticação e distingue sessões internas de fixture de logins HTTP. Configuração, comandos e tabela em ../docs/LOAD_TEST.md. Saída tem de ser uma pasta nova dentro de tmp; Ctrl+C/deadline conserva artefactos e termina só o servidor próprio. Para limpar, confirmar server_stopped=true e eliminar apenas a pasta de ensaio; nunca .local.
document_reliability.py reutiliza corpus/ground truth e hybrid; modos disabled/real e --only limitam a amostra. Escreve referência antes da inferência e métricas por documento/parâmetro em tmp; não altera o motor. Comandos e limitações em ../docs/VALIDATION.md. Não executar carga e inferência real simultaneamente. Nenhum modelo é instalado pelo script.
