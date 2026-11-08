# Segurança — requisitos de desenvolvimento
Apenas dados inventados, identificados como synthetic=true. Nunca copiar exames, nomes, contactos ou credenciais de pessoas reais, mesmo anonimizados informalmente.
Este repositório não está aprovado para produção nem demonstra conformidade legal.

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
