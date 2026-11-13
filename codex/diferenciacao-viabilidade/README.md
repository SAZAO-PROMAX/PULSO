# PULSO · Diferenciação e viabilidade
Continuação executada no Windows em 13/11/2026. Consultar [EXECUCAO.md](EXECUCAO.md) para comandos, resultados, limites e sincronização; [RESULTADOS.md](RESULTADOS.md) contém a execução do corpus. As instruções de criação de pasta abaixo preservam a passagem original e já foram cumpridas por clone independente, na branch trabalho/diferenciacao.
13 de novembro de 2026. Pasta de trabalho para abrir uma nova tarefa Codex sobre o repositório completo. Base da aplicação: main em e255f0eeac4502d46f64e078121d7710c39a1355, versão 0.7.4 experimental.

**Decisão proposta.** Manter a aplicação pessoal como demonstração PENGEL e bancada de ensaio. Investigar primeiro se uma equipa que integra resultados laboratoriais pagaria por detetar perdas de significado entre a origem e a entrega ao sistema de destino. A decisão de investir num produto fica dependente de evidência técnica e comercial.

1. A auditoria original `AUDITORIA.md` fica na cópia local, fora do Git por resumir documentos privados. Explica de onde vêm as conclusões e os limites da revisão.
2. [Ensaio de produto e viabilidade](ENSAIO.md) define comprador, concorrência, experiência, métricas e decisões.
3. [Primeira tarefa para o Codex](ARRANQUE.md) delimita um incremento reproduzível.

Para usar o pacote no Windows, executar na raiz do repositório existente, escolhendo um destino irmão livre. Estes comandos criam uma pasta independente a partir do checkpoint auditado.

~~~powershell
git fetch origin
git worktree add -b trabalho/diferenciacao ../PULSO-Diferenciacao e255f0eeac4502d46f64e078121d7710c39a1355
Expand-Archive -LiteralPath "$HOME/Downloads/PULSO_Codex_Diferenciacao.zip" -DestinationPath ../PULSO-Diferenciacao
~~~

Se guardaste o ZIP noutra localização, adapta o caminho de origem. No Codex abre PULSO-Diferenciacao como projeto e usa ARRANQUE.md. A pasta de continuação está no ZIP; o repositório remoto contém o checkpoint da aplicação.
