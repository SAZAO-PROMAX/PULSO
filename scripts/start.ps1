$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
# Compatibilidade com o comando antigo; o launcher comum mostra todos os erros.
& (Join-Path $root 'dev.cmd') @args
if ($LASTEXITCODE -ne 0) { throw "O arranque terminou com código $LASTEXITCODE." }
