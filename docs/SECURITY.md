# Segurança — requisitos de desenvolvimento
Apenas dados inventados, identificados como synthetic=true. Nunca copiar exames, nomes, contactos ou credenciais de pessoas reais, mesmo anonimizados informalmente.
Este repositório não está aprovado para produção nem demonstra conformidade legal.

## Limites clínicos
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

## Implementação experimental atual
PDF apenas do modelo PULSO SYNTHETIC LAB V1, 512 KB / 3 páginas / processo com prazo de 8 s. CORS local e cabeçalho explícito, sem autenticação. Só texto determinístico; cifrados, imagens e layouts desconhecidos rejeitados. Nomes internos gerados; PDF e evidência preservados. Confirmação de cada linha selecionada e confirmação final precedem a escrita. Não é classificação clínica.
Persistência localStorage não encriptada, apenas fictícia, por perfil demonstrativo. Não existe proteção de produção contra acesso ao bundle/armazenamento nem sincronização. Falha de quota impede gravação sem declarar sucesso. Reposição exige confirmação e afeta apenas o perfil atual. Não usar múltiplos separadores para escrever simultaneamente. O processo com timeout não substitui isolamento e revisão de segurança de produção.

## Estabilização — estado atual
Persistência ativa é agora SQLite .local/pulso.sqlite3, não localStorage. Cópia antiga só removida depois de migrar com confirmação da API. Validação de perfil/original/IDs/datas/valores e transações antes de guardar/editar/eliminar. X-Pulso-Profile verifica âmbito e dono do recurso, mas não prova identidade: qualquer pessoa com acesso à API de demonstração pode selecionar um perfil conhecido. Nenhuma autenticação de produção implementada ou declarada. Base e cópias de teste excluídas do Git/ZIP. Dados continuam fictícios, sem encriptação de produção. LAN apenas mediante arranque explícito na rede privada; backend não exposto à Internet.
