> Fonte: BrainStorm, 07/11/2026. Transcrição das secções 1–15 recuperadas. A secção 16 está truncada na fonte e não foi reconstruída; as instruções operacionais novas estão em AGENTS.md. Este PRD descreve requisitos futuros, não funcionalidades implementadas.

# PULSO
## Product Requirements & Engineering Guidelines — v0.2

**Projeto:** PULSO — Plataforma Pessoal de Saúde  
**Estado:** Especificação para desenvolvimento experimental  
**Data:** 07/11/2026  
**Mercado inicial:** Portugal  
**Expansão pretendida:** União Europeia  
**Público principal:** Adultos com acompanhamento de saúde recorrente, especialmente maiores de 55 anos  
**Ambiente inicial:** Desenvolvimento e testes com dados inteiramente sintéticos

---

# 1. Missão e visão

O PULSO pretende facilitar a organização, compreensão e acompanhamento da informação de saúde de cada pessoa, independentemente das instituições públicas ou privadas onde recebe cuidados.

A aplicação deverá funcionar como um hub pessoal que permite:

- Centralizar documentos e exames.
- Registar medições feitas em casa.
- Consultar a evolução de indicadores ao longo do tempo.
- Compreender melhor os termos e parâmetros de saúde.
- Organizar medicação, exames e consultas.
- Preparar informação para partilhar com profissionais de saúde.
- Apoiar, no futuro, cuidadores e instituições autorizadas.

A finalidade inicial é melhorar a acessibilidade e organização da informação. Não é substituir médicos, diagnosticar doenças ou prestar aconselhamento clínico automatizado.

**Proposta de valor:** toda a informação de saúde relevante, organizada num único local, com uma interface simples, acessível e centrada no paciente.

# 2. Diretrizes estratégicas

O desenvolvimento será orientado por sete princípios.

**2.1. Simplicidade.** As funcionalidades principais devem exigir poucas ações e ser compreensíveis por utilizadores com diferentes níveis de literacia digital.

**2.2. Literacia em saúde.** A aplicação deverá explicar termos, medições e exames através de conteúdos educativos revistos, evitando interpretações clínicas individualizadas não validadas.

**2.3. Segurança clínica.** O sistema não deverá assumir que um valor é seguro por corresponder ao histórico habitual ou à doença declarada.

**2.4. Privacidade desde a conceção.** Recolher apenas a informação necessária e permitir controlo granular sobre acessos e partilhas.

**2.5. Independência institucional.** A experiência do paciente não deverá depender de um laboratório ou grupo hospitalar específico.

**2.6. Rastreabilidade.** Cada medição deverá manter a sua fonte, data, unidade, método quando disponível e estado de confirmação.

**2.7. Desenvolvimento progressivo.** Implementar primeiro um produto funcional e seguro para demonstração; expandir funcionalidades apenas após testes e validação.

# 3. Público-alvo e perfis

## 3.1. Paciente

Pessoa que pretende organizar exames, acompanhar medições e preparar consultas.

O foco inicial será em utilizadores com exames ou medições recorrentes, sem restringir o produto a uma faixa etária.

## 3.2. Paciente com doença crónica

Pessoa que acompanha parâmetros laboratoriais ou medições domiciliárias, como tensão arterial e oximetria.

O PULSO deverá apoiar a organização sem assumir decisões médicas com base na doença declarada.

## 3.3. Cuidador

Familiar ou outra pessoa autorizada que auxilia na organização dos dados.

O cuidador terá identidade própria e apenas os acessos expressamente concedidos.

## 3.4. Profissional de saúde

Médico, enfermeiro ou outro profissional que beneficia de um resumo organizado de resultados disponibilizados pelo paciente.

A interface profissional deverá destacar datas, unidades, origem e documentos originais.

## 3.5. Clínica ou laboratório

Instituição que poderá, futuramente, facilitar a disponibilização e partilha de resultados através do PULSO.

O MVP não terá integração institucional real.

# 4. Áreas funcionais do produto

## 4.1. PULSO Records — Análises ao sangue

Funcionalidades:
- Importação de PDF, JPEG e PNG.
- Extração de texto através de ferramentas de código.
- Identificação de resultados e unidades por regras determinísticas.
- Revisão obrigatória dos campos extraídos.
- Armazenamento e consulta do documento original.
- Histórico cronológico.
- Gráficos de valores comparáveis.
- Exportação de resumos.

Parâmetros iniciais para demonstração:
- Glicose.
- Hemoglobina glicada.
- Colesterol LDL.
- Hemoglobina.
- Creatinina.

O sistema deverá distinguir resultados confirmados pelo utilizador de dados extraídos ainda pendentes.

## 4.2. PULSO Pressure — Tensão arterial

Funcionalidades:
- Registo de pressão sistólica e diastólica.
- Registo opcional de pulsação.
- Data e hora da medição.
- Registo de múltiplas leituras numa sessão.
- Diário cronológico.
- Gráfico de evolução.
- Exportação para consulta.
- Instruções educativas sobre técnicas de medição.
- Lembretes opcionais, numa fase posterior.

A interface deverá permitir introduzir uma medição rapidamente, sem exigir informação desnecessária.

Não deverá diagnosticar hipertensão nem propor alterações de medicação.

## 4.3. PULSO Respiratory — Saúde respiratória

Funcionalidades:
- Registo manual de SpO₂.
- Registo opcional da frequência cardíaca.
- Informação sobre contexto e dispositivo de medição.
- Histórico de medições.
- Gráficos descritivos.
- Armazenamento de exames respiratórios.
- Conteúdos educativos sobre oximetria.

Não será atribuída automaticamente uma faixa de valores considerada segura com base na doença declarada.

Alvos clínicos individualizados apenas poderão ser usados para interpretação quando forem devidamente validados, no âmbito de uma versão futura e da respetiva avaliação regulatória.

## 4.4. PULSO Care — Medicação e consultas

Funcionalidades previstas:
- Registo de medicamentos.
- Distinção entre informação declarada e prescrição documentada.
- Data de início e fim.
- Histórico de alterações registadas.
- Calendário de consultas.
- Datas de exames futuros.
- Lembretes configuráveis.
- Relação temporal entre tratamentos e medições.

Não serão permitidas recomendações automáticas para iniciar, suspender ou ajustar tratamentos.

O MVP poderá incluir ecrãs demonstrativos desta área; as funcionalidades completas serão implementadas posteriormente.

## 4.5. PULSO Learn — Saúde geral e prevenção

Funcionalidades:
- Biblioteca de explicações simples.
- Cartões educativos associados aos indicadores.
- Preparação de perguntas para consultas.
- Informações gerais de prevenção.
- Objetivos pessoais e rotinas opcionais.
- Identificação das fontes e da data de revisão dos conteúdos.

Os conteúdos deverão ser educativos e não diagnósticos.

Nenhuma função essencial de literacia em saúde deverá depender de uma subscrição premium.

# 5. Onboarding

O onboarding será progressivo e poderá ser concluído sem introduzir doenças.

Sequência proposta:

**ON-01 — Boas-vindas**
- Explicar o objetivo e as limitações da aplicação.
- Iniciar demonstração ou criação de conta.

**ON-02 — Conta**
- Criar identidade de utilizador.
- No MVP, utilizar apenas perfis fictícios.
- Autenticação de produção a desenvolver e auditar posteriormente.

**ON-03 — Acessibilidade**
- Seleção do tamanho de texto.
- Preferências de contraste.
- Possibilidade de ativar modo simples.

**ON-04 — Áreas de interesse**
- Análises ao sangue.
- Tensão arterial.
- Saúde respiratória.
- Medicação e consultas.
- Saúde geral e prevenção.

Permitir selecionar uma, várias ou nenhuma área.

**ON-05 — Condições conhecidas (opcional)**
- Permitir registar condições declaradas.
- Identificar explicitamente o estado de verificação.
- Não atribuir automaticamente objetivos clínicos.

**ON-06 — Preferências**
- Escolher notificações opcionais.
- Definir áreas prioritárias no painel.

**ON-07 — Privacidade**
- Explicar como são utilizados os dados.
- Apresentar permissões específicas.
- Não solicitar autorizações desnecessárias.

**ON-08 — Finalização**
- Mostrar as escolhas.
- Permitir voltar atrás.
- Abrir o painel inicial.

Todas as opções de personalização deverão poder ser alteradas posteriormente.

# 6. Dashboard inicial

O painel principal será designado **A minha saúde**.

A navegação base terá cinco entradas:

1. Início.
2. Histórico.
3. Registar.
4. Aprender.
5. Perfil.

A página inicial terá:

- Saudação e identificação do perfil.
- Ação principal para adicionar documentos ou medições.
- Acesso às áreas selecionadas.
- Última atividade, quando aplicável.
- Próximos compromissos registados.
- Sugestões educativas gerais.
- Estados vazios com instruções claras.

Não será apresentado um índice global de saúde, diagnóstico ou pontuação que induza o utilizador a pensar que está clinicamente seguro.

As áreas não selecionadas deverão continuar acessíveis através de opções de personalização.

## 6.1. Orientações visuais

- Identidade PULSO original, inspirada na clareza de aplicações de acompanhamento físico.
- Verde-lima como cor de destaque.
- Suporte para modo claro e escuro.
- Tipografia legível e ajustável.
- Navegação previsível.
- Botões amplos.
- Não depender exclusivamente de cores para comunicar informação.
- Compatibilidade com leitores de ecrã.

# 7. Dados e modelo clínico

O sistema deverá distinguir os seguintes estados:

**Declarado pelo utilizador:** informação fornecida pelo próprio.

**Extraído automaticamente:** informação proveniente de processamento documental e ainda não revista.

**Confirmado pelo utilizador:** dados revistos pelo utilizador, sem equivaler a validação médica.

**Validado por fonte profissional:** dados ou objetivos cuja proveniência e aprovação profissional foram efetivamente verificadas.

## 7.1. Entidades principais

- UserProfile.
- HealthInterest.
- HealthCondition.
- HealthDocument.
- Observation.
- BloodPressureSession.
- RespiratoryMeasurement.
- MedicationRecord.
- Appointment.
- ClinicalTarget.
- EducationalContent.
- AccessGrant.
- AuditEvent.

## 7.2. Regras de integridade

- Preservar o documento original.
- Registar data de realização e data de importação separadamente.
- Associar cada resultado à respetiva origem.
- Preservar unidades originais.
- Registar alterações.
- Não gerar valores em falta.
- Não comparar parâmetros incompatíveis.
- Não confundir valores habituais, intervalos de referência e alvos clínicos.
- Não interpretar condições autodeclaradas como diagnósticos confirmados.

# 8. Regras para reconhecimento de exames

A primeira versão não utilizará LLMs nem agentes de IA para extrair ou interpretar resultados.

Pipeline proposto:

1. Validar o ficheiro.
2. Identificar se o PDF contém texto.
3. Extrair texto diretamente quando possível.
4. Utilizar OCR local quando necessário.
5. Identificar campos por regras programáticas.
6. Validar dados e unidades.
7. Sinalizar ambiguidades.
8. Apresentar ecrã de confirmação.
9. Persistir apenas os resultados confirmados.

Tecnologias candidatas:
- PyMuPDF.
- Tesseract OCR.
- Python.
- Expressões regulares.
- Dicionários de parâmetros laboratoriais.
- Regras de normalização de unidades.

Um motor OCR pode utilizar modelos de reconhecimento de caracteres, mas não deverá tomar decisões clínicas.

O processamento deve funcionar inicialmente sobre layouts sintéticos conhecidos e ser expandido após medição dos erros.

# 9. Arquitetura técnica

## 9.1. Stack proposta

**Frontend:** React Native, Expo e TypeScript.

**Backend:** Python e FastAPI.

**Base de dados:** PostgreSQL.

**Validação:** Pydantic.

**Persistência:** SQLAlchemy e Alembic.

**Ficheiros:** armazenamento documental separado da base relacional.

**Testes:** Pytest e ferramentas de teste de interfaces.

**Versionamento:** Git.

**Infraestrutura inicial:** ambiente local reproduzível, com possibilidade de Docker Compose.

## 9.2. Estrutura proposta

```text
pulso/
  README.md
  .gitignore
  docs/
    PRD_v0.2.md
    ARCHITECTURE.md
    SECURITY.md
    DECISIONS.md
  apps/
    mobile/
  services/
    api/
    document_processing/
  packages/
    shared/
  data/
    synthetic/
  tests/
  scripts/
```

Os serviços poderão começar como módulos do mesmo backend, em vez de microserviços independentes. A separação física só deverá acontecer quando houver uma necessidade concreta.

## 9.3. Princípios de engenharia

- Código legível e modular.
- TypeScript com verificação estrita.
- Tipos e esquemas explícitos.
- Testes automatizados para as regras fundamentais.
- API documentada com OpenAPI.
- Migrações versionadas.
- Configurações por ambiente.
- Nenhum segredo no repositório.
- Dependências controladas.
- Ficheiros de exemplo inteiramente fictícios.

# 10. Permissões e segurança

## 10.1. Modelo de acesso futuro

**Paciente:** controla os seus registos e as partilhas autorizadas.

**Cuidador:** acede apenas aos recursos e operações delegados.

**Médico:** acede apenas a informação autorizada, mediante verificação adequada da identidade e função.

**Instituição:** não recebe acesso global ao histórico por ser fornecedora de um exame.

**Administrador técnico:** não deve possuir acesso livre a conteúdos de saúde.

## 10.2. Requisitos obrigatórios

- Autenticação forte no produto real.
- Autorização por recurso.
- Encriptação apropriada.
- Gestão segura de credenciais.
- Registos de auditoria.
- Mecanismos de revogação.
- Minimização de dados.
- Sem publicidade direcionada por saúde.
- Sem dados clínicos nos logs.
- Gestão de consentimentos quando aplicável.
- Política de retenção e eliminação.
- Separação entre testes e produção.

## 10.3. Regulamentação

Antes de trabalhar com dados reais, avaliar:
- RGPD.
- Lei portuguesa n.º 58/2019.
- Necessidade de Avaliação de Impacto sobre a Proteção de Dados.
- MDR e IVDR, conforme a finalidade de cada módulo.
- AI Act, nas fases em que sejam introduzidas funções abrangidas.
- Regulamento EHDS.
- Regras de investigação clínica e ética, quando aplicáveis.

A classificação regulatória deve ser validada por especialistas antes de qualquer lançamento que envolva funções clínicas relevantes.

# 11. Âmbito do primeiro MVP

## 11.1. Deve estar funcional

- Perfis de demonstração.
- Onboarding.
- Personalização do dashboard.
- Navegação pelas cinco áreas.
- Importação de PDF ou imagem sintética.
- Extração determinística de resultados num conjunto limitado de formatos.
- Revisão e confirmação.
- Histórico.
- Gráficos laboratoriais.
- Diário de tensão arterial.
- Registo simples de SpO₂.
- Conteúdos educativos estáticos.
- Exportação de histórico de demonstração.

## 11.2. Pode existir apenas como protótipo de interface

- Lista completa de medicação.
- Calendário avançado.
- Perfis de cuidadores.
- Painel profissional.
- Notificações avançadas.

## 11.3. Excluído

- Diagnóstico automático.
- Triagem de sintomas.
- Alertas clínicos individualizados.
- Ajustes de medicação.
- Personalização automática de valores clínicos de segurança.
- Integrações reais com o SNS.
- Acesso a registos de instituições sem acordo e autorização.
- Tratamento de dados reais de pacientes.

# 12. Requisitos de aceitação

O primeiro MVP deverá passar os seguintes testes:

**AC-01:** um utilizador consegue concluir o onboarding sem fornecer doenças.

**AC-02:** consegue escolher e modificar áreas de interesse.

**AC-03:** as cinco áreas aparecem corretamente no dashboard.

**AC-04:** consegue importar um documento sintético suportado.

**AC-05:** os resultados extraídos são apresentados para revisão.

**AC-06:** é impossível confirmar silenciosamente valores ambíguos.

**AC-07:** os resultados guardados aparecem no histórico.

**AC-08:** medições compatíveis aparecem em gráficos cronológicos.

**AC-09:** medições incompatíveis não são agregadas automaticamente.

**AC-10:** o utilizador consegue introduzir tensão sistólica, diastólica, hora e data.

**AC-11:** o diário mostra as leituras registadas e permite exportação.

**AC-12:** o utilizador consegue introduzir SpO₂ sem que o sistema classifique automaticamente a medição como segura.

**AC-13:** os ecrãs educativos apresentam conteúdos fixos com fontes.

**AC-14:** nenhuma função produz diagnósticos ou recomendações terapêuticas.

**AC-15:** os perfis de demonstração estão separados.

**AC-16:** os principais ecrãs suportam texto ampliado e navegação acessível.

**AC-17:** existem testes automatizados para as regras de dados e comparabilidade.

**AC-18:** todos os exemplos clínicos estão identificados como fictícios.

# 13. Plano experimental

## Sprint 0 — Fundação

- Criar o repositório.
- Preparar frontend e backend.
- Documentar comandos de instalação.
- Criar os dados sintéticos.
- Definir o modelo de dados.
- Implementar navegação e ecrãs-base.
- Executar primeiros testes.

**Resultado:** aplicação navegável, ainda sem funcionalidades clínicas.

## Sprint 1 — Onboarding e Dashboard

- Implementar onboarding.
- Implementar preferências.
- Criar as cinco áreas.
- Construir componentes reutilizáveis.
- Testar acessibilidade básica.

**Resultado:** experiência móvel navegável e personalizável.

## Sprint 2 — Histórico e análise de documentos

- Criar importação.
- Integrar extração de texto.
- Implementar reconhecimento de campos.
- Desenvolver confirmação.
- Guardar resultados e documentos fictícios.

**Resultado:** primeiro fluxo completo de digitalização.

## Sprint 3 — Gráficos e medições

- Implementar histórico longitudinal.
- Gráficos laboratoriais.
- Diário de tensão arterial.
- Registo de SpO₂.
- Exportação.

**Resultado:** demonstração funcional das três áreas prioritárias.

## Sprint 4 — Literacia e validação

- Adicionar biblioteca educativa.
- Melhorar o modo simples.
- Criar testes de usabilidade.
- Medir erros de extração.
- Rever segurança e integridade.

**Resultado:** MVP experimental pronto para testes com utilizadores sobre dados fictícios.

# 14. Indicadores de qualidade

Os resultados serão medidos, não presumidos.

Indicadores propostos:
- Taxa de sucesso nas tarefas.
- Tempo para encontrar um exame.
- Tempo para registar tensão arterial.
- Exatidão da extração documental.
- Número de correções necessárias.
- Erros de comparação de valores.
- Compreensão dos conteúdos educativos.
- Utilização sem ajuda.
- Satisfação de médicos e pacientes.
- Número de ações necessárias para tarefas frequentes.

# 15. Validação da proposta comercial

A equipa deverá investigar em paralelo:

- Disponibilidade dos pacientes para usar o serviço.
- Disponibilidade para pagar por módulos opcionais.
- Interesse de clínicas e laboratórios em recomendar o PULSO.
- Custos de processamento e armazenamento.
- Possibilidade de reduzir trabalho administrativo.
- Barreiras de integração.
- Requisitos de aquisição institucional.

O modelo de negócio inicial é uma hipótese de B2C gratuito com funcionalidades premium e eventual oferta B2B2C para parceiros.

Nenhuma receita ou economia operacional deverá ser apresentada como comprovada sem medições.
