# Segurança — requisitos de desenvolvimento
Apenas dados inventados, identificados como synthetic=true. Nunca copiar exames, nomes, contactos ou credenciais de pessoas reais, mesmo anonimizados informalmente.
Este repositório não está aprovado para produção nem demonstra conformidade legal.

## Estado implementado v0.6 — contas experimentais

FastAPI/Starlette e argon2-cffi 25.1.0: Argon2id com 64 MiB, 3 passagens e paralelismo 2; salts gerados pela biblioteca, sem palavras-passe em texto simples. No máximo dois trabalhos de hashing simultâneos por event loop. Sessões aleatórias de 256 bits, com apenas o digest na SQLite e cookie HttpOnly/SameSite=Strict, prazo absoluto de oito horas, rotação no login e revogação no logout. Recuperação revoga todas as sessões e outros tokens pendentes. Sessões/tokens de acesso não são guardados em localStorage. CSRF é um nonce ligado à sessão, mantido em memória no frontend; Origin exata e token obrigatórios em escritas autenticadas. Respostas privadas têm no-store/nosniff.

Cookie Secure é configurável por `PULSO_COOKIE_SECURE=true` para HTTPS; o desenvolvimento verificado é HTTP loopback com Secure=false. Não existe TLS/encriptação local apropriada para dados reais nem auditoria independente de segurança. Cookies distinguem hosts, não portas; os serviços locais deste ambiente têm de ser de confiança. O launcher não confia em cabeçalhos de proxy. Não expor a aplicação/API ou Ollama à Internet nem apresentar estas contas como solução pronta para produção.

Limites de tentativas persistidos na mesma SQLite: login por e-mail e endereço de rede, registo/recuperação/verificação limitados; respostas de login/recuperação não identificam desnecessariamente se existe uma conta. Passwords de 12–128 caracteres; pedidos JSON de conta até 8 KB. A autorização liga o dono do URL à sessão; forjar X-Pulso-Profile não dá acesso a outra conta. Todos os endpoints de dados de contas e trabalhos de extração verificam sessão/CSRF conforme a operação. Os dois perfis demo não são contas autenticadas e continuam públicos, apenas com dados fictícios; não são importados para a conta criada.

**Correio apenas em desenvolvimento:** não há SMTP/serviço externo, nem envios alegados. HTTP de recuperação apresenta instruções genéricas; um operador com acesso à base local emite um token pela ferramenta `scripts/auth_dev.py`. Só o hash fica guardado; o código de 256 bits expira em 15 minutos e só pode ser usado uma vez, com consumo transacional. A ferramenta é privilegiada e imprime o código apenas no terminal do operador; não copiar para logs, relatórios ou Git. Alterar e-mail exige sessão/CSRF, palavra-passe atual e confirmação do código antes de substituir o endereço. Confirmação local não prova titularidade de uma caixa de correio real; entrega/verificação real e avaliação contra abuso ficam pendentes.

Fotografia só após autenticação: PNG/JPEG, assinatura/MIME, até 1 MB, 4 MP/4096 px por lado, renderização até 256 px e reencodificação PNG sem EXIF/textos de origem. Sem reconhecimento facial ou envio ao modelo. BLOB privado na mesma conta, sem nome original/URL pública permanente; outro utilizador não pode obter a fotografia. Uploads são limitados e a interface pede apenas imagens sintéticas. Imagens/condições/nascimento são opcionais; condições ficam autodeclaradas e não modificam gráficos, limites ou metas. A finalidade do nascimento é apenas a organização do perfil, explicitada no formulário.

Versões esperadas em edições/eliminações protegem contra substituição silenciosa; erros mantêm campos. Novas confirmações exigem original PDF/PNG/JPEG válido e descartam histórico de alterações enviado pelo cliente; dados antigos continuam legíveis. Fila documental limitada, sem aumento da concorrência GPU; pedidos voláteis ao reiniciar. Estes controlos e testes não constituem pentest, certificação ou conformidade RGPD.

Referências de implementação consultadas: [argon2-cffi](https://argon2-cffi.readthedocs.io/en/stable/api.html), [sessões OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [recuperação OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [imagens PyMuPDF](https://pymupdf.readthedocs.io/en/latest/recipes-images.html). As secções seguintes mantêm requisitos futuros e o histórico; não anulam as limitações deste protótipo.

## Limites clínicos
Aprender é conteúdo estático educativo, separado dos resultados, referências laboratoriais e histórico. Não recebe valores/condições nem usa Ollama para gerar explicações. Revisão editorial tem data explícita; revisão clínica independente continua pendente. Sem metas ou classificações individuais. Fontes só abrem por ação do utilizador, sem anexar registos à ligação. Pesquisa não é persistida. Ver UX_LEARN.md.
Não diagnosticar, fazer triagem, sugerir doses ou alterar tratamentos. Não gerar faixas seguras por doença declarada. SpO₂ e gráficos não devem transmitir garantia de segurança. Não apresentar health score.
Interesses, condições declaradas e objetivos profissionais são conceitos separados. Objetivos clínicos individualizados ficam fora da implementação inicial.

## Acesso futuro
Negar por defeito; validar utilizador, recurso, operação, finalidade e validade no servidor.
Paciente: recursos próprios. Cuidador: identidade própria e delegação limitada. Profissional: identidade e autorização verificadas. Instituição: apenas âmbito concedido. Administrador: sem acesso livre aos conteúdos.
Testar isolamento entre perfis e revogação. Revogação não recupera cópias já exportadas.

## Permissões do dispositivo
Câmara só ao fotografar; seletor de ficheiros específicos ao importar; notificações opcionais ao configurar lembretes, sem informação de saúde no ecrã bloqueado.
Não pedir localização/contactos. HealthKit/Health Connect fora do MVP. Permissão do sistema não substitui uma base jurídica.

## Controlos previstos
Segredos fora do Git; sem dados clínicos em logs, analytics ou publicidade. Autenticação forte e reautenticação para ações sensíveis. TLS, proteção em repouso e gestão de chaves.
Auditoria sem conteúdo clínico; retenção, eliminação, exportação e recuperação de backups verificáveis.
Uploads: validar conteúdo e extensão, limites de tamanho/páginas/tempo, nomes gerados, bloquear caminhos arbitrários e isolar parser/OCR. Não executar conteúdo incorporado.
Sem uploads ou partilhas reais nesta entrega.

## Antes de dados reais
Revisão especializada da finalidade e enquadramento aplicável, privacidade, bases de tratamento, avaliação de impacto quando exigida, classificação regulatória e investigação/ética. A lista de regulamentos no PRD é uma agenda de avaliação herdada, não aconselhamento jurídico atualizado.
Revisão de ameaças, teste de autorização por recurso, dependências e incidentes são condições de passagem para uma futura fase.

## Extração experimental local v0.4
Só documentos inteiramente fictícios, com opt-in explícito. PDF/PNG/JPEG, verificação de assinatura, 2 MB/3 páginas/12 MP por imagem, texto limitado, subprocesso com prazo global e uma extração de cada vez. Renderização em memória; sem temporários clínicos. Limites não constituem isolamento seguro de produção para documentos hostis.
Ollama apenas em 127.0.0.1:11434 ou localhost equivalente, modelo permitido qwen3-vl:4b; sem Cloud, login, chaves, ferramentas, execução de comandos, acesso do modelo à base ou a ficheiros. httpx ignora proxies de ambiente, não segue redirecionamentos e limita tempo/resposta. Fonte é conteúdo não fiável. Prompt injection não deve ser obedecida; o esquema e o validador não constituem garantia contra alucinações. Não guardar prompts/respostas integrais em logs; métricas só técnicas.
Validação independente compara excertos e associação nome/resultado/unidade nos PDFs de texto; datas devem existir na página. Imagens carecem de verificação textual independente e ficam explicitamente sinalizadas. Campos sem evidência são nulos/sinalizados. Nenhuma proposta é guardada como confirmada sem ação humana; a confirmação não é validação médica. Originais e evidência persistem na SQLite existente. Regiões são recalculadas no original dentro do perfil antes de produzir destaque sem cache.
Local não equivale a conformidade com o RGPD. A autenticação real, encriptação e isolamento de produção permanecem por implementar. Não usar exames reais.

## Educação e preferências v0.5
As 23 fichas estáticas não acedem a medições, doenças ou modelo. Todas estão pendentes de revisão clínica independente; revisão editorial e confirmação pelo utilizador não são validação médica. Evidência de revisão profissional não é inventada. Fontes só são abertas por ação explícita, sem valores/identificadores clínicos na URL e com noopener/noreferrer; não há pedidos remotos na leitura local das fichas. Conteúdo externo pode mudar; a ureia tem referência ainda não confirmada, explicitamente sinalizada.
localStorage contém agora também `pulso.theme.v1`, apenas `light`/`dark`; não é armazenamento clínico ativo. Falha de armazenamento produz aviso. Base clínica continua SQLite. Não há telemetria, gravação de participantes ou novo sistema de perfis. O protocolo de usabilidade é um plano com grelha vazia; qualquer recrutamento futuro exige informação e gestão apropriada das notas.
## Estabilização — estado atual
Persistência ativa é agora SQLite .local/pulso.sqlite3, não localStorage. Cópia antiga só removida depois de migrar com confirmação da API. Validação de perfil/original/IDs/datas/valores e transações antes de guardar/editar/eliminar. X-Pulso-Profile verifica âmbito e dono do recurso, mas não prova identidade: qualquer pessoa com acesso à API de demonstração pode selecionar um perfil conhecido. Nenhuma autenticação de produção implementada ou declarada. Base e cópias de teste excluídas do Git/ZIP. Dados continuam fictícios, sem encriptação de produção. LAN apenas mediante arranque explícito na rede privada; backend não exposto à Internet.
