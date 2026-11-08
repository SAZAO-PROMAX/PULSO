# PULSO no Windows — arranque e estabilização
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
Não existe conta real: os dois perfis continuam demonstrativos. O backend verifica o âmbito do perfil e o dono do registo, mas o cabeçalho do perfil não autentica uma pessoa. Não usar dados reais.

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
Ver STABILIZATION.md para checkpoints e VALIDATION.md para resultados. Não foram criados commits porque há alterações anteriores no index e falta identidade Git configurada.
