# PULSO no Windows — arranque e estabilização

## Correção de login v0.6.1

Inicia com `.\dev.cmd`, abre `http://localhost:8081` e atualiza com **Ctrl+F5**. Inicia sessão com a conta já criada; não é necessário voltar a registar ou apagar a base. O arranque deixou de forçar a API para `127.0.0.1`; utiliza o hostname do navegador para o cookie acompanhar os pedidos. Se definiste `EXPO_PUBLIC_API_URL` manualmente, usa o mesmo hostname da interface. Cookies recusados impedem a entrada e apresentam mensagem explícita.
## Hub e Aprender
O arranque continua a ser `.\dev.cmd`, descrito abaixo. Atualiza o separador http://localhost:8081 para ver o Hub atualizado. As cinco áreas mantêm os acessos habituais; os resumos usam os registos do perfil selecionado.

Na barra inferior, escolhe **Aprender**. Pesquisa, por exemplo, «glicada», «creatinina» ou «consulta»; escolhe uma categoria e abre uma ficha. Os termos relacionados permitem continuar a leitura. O botão **Ver histórico deste parâmetro** abre a evolução correspondente.

Nos gráficos, resultados, revisão de exames e formulário de tensão, o botão **i** abre uma explicação. No computador podes usar Tab e Enter; Escape fecha e devolve o foco. Em largura reduzida, aparece um painel inferior que podes percorrer sem perder os campos preenchidos.

Com ampliação grande, podes deslocar verticalmente o menu inferior para chegar às restantes opções, mantendo espaço para ler a página.

A biblioteca funciona localmente mesmo se a API estiver indisponível; abrir as fontes externas necessita de Internet. Os textos são educativos, com fontes e data editorial, e revisão clínica independente pendente. Não interpretam os teus valores. Detalhes e limitações em [UX_LEARN.md](UX_LEARN.md).

## Leitura local v0.4 com Ollama
O Ollama e qwen3-vl:4b já foram encontrados neste ASUS; não é necessário reinstalar nem voltar a descarregar o modelo. Abre Ollama no menu Iniciar e mantém a aplicação em execução. Num PowerShell normal podes verificar:
```powershell
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" --version
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" list
Invoke-RestMethod http://127.0.0.1:11434/api/version
```
O teste de leitura da aplicação carrega o modelo quando necessário. Não é preciso iniciar uma conversa em `ollama run`, criar conta, obter chave ou executar signin. Não alteres OLLAMA_HOST nem abras portas na firewall para o Ollama.

Depois de iniciar o PULSO como abaixo, abre **Adicionar exame**. O estado discreto indica se o motor local está disponível. Seleciona apenas um PDF/PNG/JPEG fictício até 2 MB/3 páginas e inicia a leitura; imagens e layouts novos podem demorar. O PDF de exemplo conhecido usa o parser anterior sem IA.

Revê os valores, unidades, datas e origem no original, corrige/exclui linhas e marca cada linha aceite como revista. Só **Confirmar e guardar resultados** escreve na base. Se o valor não existir, escolhe explicitamente **Registar sem valor numérico**; não inventes um número. Se a leitura falhar, usa introdução manual. Campos corrigidos permanecem após falha de gravação; não recarregues nem feches a página antes de guardar.

Após guardar: **Histórico** para consultar/editar/eliminar; **Análises ao sangue** para escolher parâmetro/período e tocar num ponto. O detalhe mostra original e proveniência; destaque só quando existe região textual fiável. Campos sem data/método/amostra ficam no histórico com motivo para não aparecer no gráfico. A confirmação não é validação médica.

Para gerar os exemplos alargados sem usar a GPU, na raiz:
```powershell
.\.venv\Scripts\python.exe scripts/benchmark_extraction.py --fixtures-only
```
Escolhe depois ficheiros de `tmp/v04-benchmark`, por exemplo `simple_digital.pdf`, `fifteen_rows.pdf`, `photo.png` ou `mixed.pdf`. São inteiramente fictícios. Configuração opcional, limites e testes em [LOCAL_EXTRACTION.md](LOCAL_EXTRACTION.md). `.env.example` documenta valores; o arranque usa os valores por defeito e não lê `.env` automaticamente.

## Abrir sem o Codex
Abrir um PowerShell normal, sem administrador:
```powershell
Set-Location -LiteralPath 'C:\Users\diogo\OneDrive\Documentos\ChatGPT\PULSO'
.\dev.cmd
```
É o comando recomendado nesta máquina: encontra Node instalado em Program Files, sem depender do PATH temporário do Codex. Também aceita a cópia portátil .tools se não houver instalação normal. Não é preciso manter o Codex aberto quando o comando é lançado no teu próprio terminal.
Com Node/npm disponíveis no PATH, funciona igualmente na raiz:
```powershell
npm.cmd run dev
```
Em terminais onde npm não é bloqueado pela política de scripts, npm run dev é equivalente. Não é necessário enfraquecer essa política.
Abrir http://localhost:8081. API: http://127.0.0.1:8000/docs. Manter a janela aberta. Ctrl+C para os dois servidores; para voltar a abrir, repetir .\dev.cmd.
Não basta fechar a página do navegador para parar os servidores.

## Diagnosticar um erro de arranque
```powershell
.\dev.cmd --check
```
Verifica Python/Expo e portas 8000/8081. Se a porta estiver ocupada, o comando falha com erro 1 e não cria duplicados nem reutiliza uma API antiga. Fecha o servidor anterior com Ctrl+C na janela onde foi iniciado. O launcher não mata processos desconhecidos.
Os erros de Python, dependências ou Metro aparecem na mesma janela. Se a API terminar inesperadamente, o frontend também é parado.
Se npm não for reconhecido, usar dev.cmd ou fechar e reabrir o terminal após instalar Node.

## Instalação inicial, só se faltar
Node.js LTS x64 e Python 3 x64 devem estar instalados. Na raiz:
```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r services/api/requirements-dev.txt
Set-Location apps/mobile
& 'C:\Program Files\nodejs\npm.cmd' ci
Set-Location ../..
.\dev.cmd
```
Se Node estiver noutro local, usar npm.cmd pelo PATH. A instalação atual usa Expo 57/React Native 0.86.3, sem Expo Router, com pré-visualização web. Python foi verificado com 3.15.2. Não há dependências npm novas na raiz.

## Guardar, corrigir e eliminar
- Adicionar exame → selecionar o PDF de exemplo → Importar PDF → rever/corrigir as linhas → marcar as linhas revistas → confirmar.
- Sucesso só depois da resposta da API. Falha preserva valores preenchidos para tentar novamente.
- Histórico e gráficos usam a mesma base. Em cada área, escolher parâmetro e período; contagens indicam resultados recuperados, representados e fora do período.
- Unidades distintas ficam separadas. Dados incompletos/não comparáveis permanecem no Histórico com a explicação da exclusão.
- Histórico → Consultar resultado → Editar medição ou Eliminar medição.
- Histórico → Gerir exame → editar título/origem ou eliminar exame completo. A confirmação indica quantos resultados associados serão eliminados.
- Cancelar uma importação não confirmada não guarda resultados.
- Adicionar medição mantém o fluxo simples de tensão com revisão antes da escrita.

A base única é .local/pulso.sqlite3. Contém snapshots transacionais por perfil, incluindo o PDF original e evidência da extração. NÃO apagar .local para reiniciar os servidores: isso apagaria a base. Para uma cópia de segurança manual, parar os servidores antes de copiar o ficheiro.
Os dados antigos do navegador migram para a API na primeira leitura desse perfil. A cópia antiga só é removida após confirmação. Uma migração que conflite com dados já alterados na base é recusada e a cópia é preservada; não apagar cópias para contornar o erro.
No modo de demonstração, os dois perfis não são contas autenticadas: o cabeçalho só verifica âmbito. A v0.6 acrescenta contas experimentais separadas, com sessão; não transfere os dados demo para essas contas. Não usar identidade ou documentos reais.

## QR Code e telemóvel
O arranque normal usa localhost por segurança. O QR impresso pode indicar exp://127.0.0.1:8081: no telefone, esse endereço é o próprio telefone, pelo que não serve para ligar ao PC.
A stack é Expo/React Native e pode gerar uma versão nativa, mas os fluxos completos aqui verificados são web. Importar/abrir PDF usa o seletor do navegador; o seletor nativo ainda não está implementado. Não foi testado nenhum Android/iPhone físico nesta execução.

### Teste opcional apenas na rede privada local
Parar primeiro dev.cmd. PC e telefone na mesma rede Wi-Fi, sem isolamento de clientes/VPN. Usar ipconfig para identificar o IPv4 do Wi-Fi. Exemplo abaixo: substituir 192.168.1.50 pelo IP real nas duas janelas.
PowerShell 1, na raiz:
```powershell
$env:PULSO_WEB_ORIGINS='http://192.168.1.50:8081,http://localhost:8081'
.\.venv\Scripts\python.exe -m uvicorn services.api.app.main:app --host 192.168.1.50 --port 8000
```
PowerShell 2:
```powershell
Set-Location apps/mobile
$env:EXPO_PUBLIC_API_URL='http://192.168.1.50:8000'
& 'C:\Program Files\nodejs\npx.cmd' expo start --web --lan --port 8081
```
No navegador do telefone, abrir http://192.168.1.50:8081. O backend aponta para o PC, nunca para localhost do telefone.
Para explorar a versão nativa, usar Expo Go compatível com SDK 57 e ler o QR LAN: Android pelo Expo Go; iPhone pela Câmara/Expo Go. Se a aplicação exigir login Expo, CLI e Expo Go devem usar a mesma conta. Uma versão incompatível de Expo Go exigirá uma development build compatível, que não foi preparada neste sprint.
Se a ligação falhar, confirmar IP, rede privada e permissões Node/Python na firewall apenas para essa rede. Não alterei regras de firewall. Este procedimento LAN está documentado, não validado num dispositivo físico.
Tunnel não foi ativado: pode expor o Metro, mas não resolve acesso à API privada. Não é uma alternativa funcional completa para estes fluxos e não foi exposto o backend à Internet.
Referência: [desenvolvimento e dispositivos Expo](https://docs.expo.dev/get-started/start-developing/).

## Verificações essenciais
Parar primeiro os servidores normais antes dos testes de navegador, para não haver conflito de portas.
Na raiz:
```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests -q
node --test tests/foundation.test.mjs
```
Em apps/mobile, com Node/npm no PATH:
```powershell
npm.cmd run typecheck
npm.cmd test
npx.cmd expo export --platform web
npm.cmd run test:web
```
Playwright usa uma base SQLite temporária em tmp e nunca reutiliza a API normal. Os testes são sequenciais e repõem apenas essa base temporária.
Ver STABILIZATION.md para checkpoints e VALIDATION.md para resultados. O repositório foi sincronizado anteriormente com GitHub; os incrementos não fazem publicação automática.

## Experimentar a v0.5

1. Na raiz, executar `.\dev.cmd`. Abrir http://localhost:8081 no navegador do PC. Se já estiver aberto, recarregar a página.
2. No Hub, escolher Análises ao sangue → parâmetro/período. Consultar um ponto ou usar os botões de «Registos do gráfico», com data, unidade e origem. Dados excluídos têm motivo visível e continuam no Histórico.
3. Usar o botão «i» por clique ou Tab/Enter. O foco começa em Fechar explicação; Escape fecha e volta ao botão. «Abrir em Aprender» mostra seis secções, fontes e estado de revisão. Todas as fichas aguardam revisão clínica independente.
4. Em Aprender, pesquisar «glicemia», «HbA1c» ou «tensão». A biblioteca funciona sem Internet, desde que o serviço web local esteja a correr; só abrir uma fonte externa exige Internet. Não existe instalação offline/service worker.
5. Alternar modo claro/escuro, fechar e reabrir o navegador no mesmo endereço: a preferência mantém-se nesse navegador. Se o armazenamento estiver bloqueado, aparece um aviso. Não são guardados dados clínicos nesta preferência. A versão nativa ainda não persiste tema.
6. Adicionar medição → tentar rever com os campos vazios para verificar erros → preencher apenas valores fictícios → rever/guardar. Importação, correção, confirmação, edição e eliminação mantêm o fluxo descrito acima.

Ensaios manuais de zoom real e leitores de ecrã: seguir USABILITY_PROTOCOL.md. São testes pendentes; não foi feita certificação de acessibilidade ou estudo com pessoas. Resultados automáticos executados em VALIDATION.md.

## Experimentar a v0.6

1. Atualizar dependências Python na raiz: `.\.venv\Scripts\python.exe -m pip install -r services/api/requirements-dev.txt`. Argon2id é a única dependência direta nova, com as suas dependências transitivas. Executar `.\dev.cmd` e abrir http://localhost:8081.
2. O círculo no canto superior direito abre o menu de perfil. «Criar conta»: nome de apresentação, e-mail fictício, palavra-passe e confirmação. Informação adicional é opcional. Depois usar «Já tenho conta: iniciar sessão». Nenhum e-mail real é enviado.
3. «O meu perfil»: editar informação, condições autodeclaradas e interesses; escolher avatar e guardar. Fotografia opcional apenas sintética, PNG/JPEG até 1 MB/4 MP; guardar perfil antes de alterar a fotografia. Pode substituir/remover. «Os meus exames» reutiliza o Histórico. «Terminar sessão» revoga a sessão atual.
4. Registar abre «O que pretende registar?», com pesquisa, oito categorias e tipos. Sangue usa a revisão laboratorial; outros tipos guardam o documento sem extrair valores ou interpretar o exame. Registo estruturado de medicação continua «Em preparação». Documentos de prescrição/consulta podem ser guardados.
5. Importação de sangue: estados reais de espera/extração/revisão; pode cancelar enquanto aguarda. Máximo de cinco trabalhos; fila cheia pede nova tentativa. O servidor processa um de cada vez. Reiniciar perde pedidos temporários; nada é guardado antes da confirmação.
6. No Histórico, pesquisar e filtrar por categoria, tipo, especialidade e período. «Gerir exame» → «Editar exame» permite corrigir classificação, data e especialidades. O mesmo original é mantido; resultados/gráficos não são eliminados por mudar categoria. Documentos antigos sem categoria ficam em Todos os registos.
7. Se outra sessão editar o registo, a gravação mostra conflito e mantém os campos. Consultar a versão atual, comparar e escolher explicitamente usá-la como base antes de reaplicar. Nunca é sobrescrita silenciosamente uma versão desatualizada.

Usar o mesmo hostname no frontend e API (localhost com localhost, ou 127.0.0.1 com 127.0.0.1). O cliente escolhe isso por defeito; alterar EXPO_PUBLIC_API_URL para outro hostname pode impedir cookies SameSite. Não guardar sessão/tokens em localStorage. Tema continua específico do navegador/origem. API usa cookie HttpOnly, oito horas, CSRF/Origin em escritas; HTTP loopback é desenvolvimento, não transporte de produção. Não expor por tunnel/Internet. Código local, não se configura serviço de e-mail pago.

### Recuperação e verificação — só desenvolvimento

O formulário «Esqueci-me da palavra-passe» **não envia e-mail**. Um operador com acesso ao computador pode emitir um código na raiz, usando apenas uma conta fictícia existente:

```powershell
.\.venv\Scripts\python.exe scripts/auth_dev.py --email '<email-ficticio>' --purpose reset
# Verificar o endereço atual, também sem envio real:
.\.venv\Scripts\python.exe scripts/auth_dev.py --email '<email-ficticio>' --purpose verify
# Após pedir alteração no perfil, usar o endereço ATUAL para emitir o código:
.\.venv\Scripts\python.exe scripts/auth_dev.py --email '<email-atual-ficticio>' --purpose email-change
```

Introduzir o código de recuperação ou verificação no respetivo formulário. Expira em 15 minutos, uma única utilização; emitir outro invalida o anterior da mesma finalidade. Não partilhar nem guardar o código em Git/relatórios. A ferramenta usa a mesma SQLite (ou PULSO_DB_PATH explícito), não cria contas nem revela códigos por endpoint público. É uma ferramenta privilegiada de operador local; não prova a titularidade de uma caixa de correio real. Alteração de e-mail só se conclui após código e termina as sessões; recuperação também revoga sessões existentes.

Para HTTPS futuro, `PULSO_COOKIE_SECURE=true`; em HTTP loopback, o desenvolvimento verificado usa false. O launcher não lê .env automaticamente: usar variáveis de ambiente quando necessário. Sem autenticação auditada para produção, encriptação local, Android/iOS físicos ou leitor de ecrã ensaiados. A SQLite única preserva os dados anteriores e acrescenta tabelas de conta; nunca apagar `.local` para atualizar. Resultados e pendências atuais em PROJECT_STATUS.md/VALIDATION.md.


## Perfil atualizado — v0.6.1

Atualize `http://localhost:8081` com Ctrl+F5. No círculo do cabeçalho, escolha **O meu perfil**. Preencha a data de nascimento com o calendário (obrigatória no registo e ao guardar alterações); contas antigas continuam acessíveis e recebem aviso no Hub enquanto esse campo estiver vazio. Não volte a registar a conta nem apague a base.

Em **Pesquisar condições**, procure por nome ou termo alternativo, por exemplo «DPOC». As caixas iniciais mantêm condições frequentes; as selecionadas aparecem acima e podem ser removidas com um toque. Se faltar uma condição, escreva o nome e escolha **Adicionar «…»**. A lista local não contém todas as doenças; não atribui códigos clínicos. Até 30 condições, nomes manuais de 2–100 caracteres. Tudo autodeclarado e fictício nesta fase.

Escolha um dos oito avatares ou **Usar iniciais**, consulte a pré-visualização e carregue em **Guardar perfil**. A fotografia guardada continua a ter prioridade: remova-a na secção Fotografia para mostrar o avatar. Nem nascimento nem condições personalizam ainda os resultados do Hub ou os limites dos gráficos.


## Utilizar a v0.7

Arranque com `.\dev.cmd` e abra `http://localhost:8081`; Ctrl+F5 após atualizar. A conta e os exames anteriores são preservados. No Hub, **Configurar a minha experiência** abre sete passos opcionais; **Saltar primeiros passos** dispensa a sequência. No menu circular, **Preferências** muda modo, tema, letra, contraste, ajuda e movimento; **O meu perfil → Rever primeiros passos** permite retomar/rever. As escolhas ficam na conta local; não dependem da idade.

Nos gráficos, escolha **Individual** ou **Combinado**, ative os parâmetros e selecione período. **Personalizado** pede duas datas inclusivas (UTC). No modo Simples, **Mostrar todos os períodos** dá acesso às mesmas opções. Painéis combinados partilham tempo, mantendo unidades/escalas próprias; listas dos pontos dão origem/original. Não são conversões nem interpretações clínicas.

No Hub ou em Registar, escolha **Registar acontecimento**, preencha título/tipo/datas fictícias, associe documentos já guardados se necessário e reveja antes de confirmar. No Histórico, **Acontecimentos** permite pesquisar/filtrar/consultar/editar/eliminar. Nos gráficos, marcadores e botões textuais abrem os acontecimentos do dia; faixas mostram duração. Não significam causa e efeito. Eliminar acontecimento preserva exames; eliminar exame retira as suas ligações aos acontecimentos.

A aplicação continua experimental e local. Exportações Android/iOS são apenas pacotes JavaScript; não há aplicação instalada/publicada nem ligação móvel de produção. Limitações e especificações em ARCHITECTURE.md.
