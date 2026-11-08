import type {Parameter} from '../clinical/data';

export const categories=['Análises ao sangue','Tensão arterial','Saúde respiratória','Medicação','Consultas','Prevenção'] as const;
export type Category=typeof categories[number];
export interface Source{name:string;url:string;language?:'pt'|'en';verification?:'consulted'|'not_verified';checkedOn?:string;note?:string}
export interface Topic{
 id:string;slug:string;term:string;title:string;category:Category;summary:string;aliases:string[];
 sections:{title:string;body:string}[];related:string[];sources:Source[];
 reviewedOn:string;status:'published'|'draft';editorialStatus:'draft'|'reviewed';clinicalReview:'pending'|'reviewed';parameter?:Parameter;
 professionalReview?:{name:string;qualification:string;reviewedOn:string;evidence:string};reviewNotes:string[];
}
const reviewedOn='2026-11-08'; // Editorial source check, not an independent clinical review.
const med=(path:string):Source=>({name:'MedlinePlus · National Library of Medicine',url:'https://medlineplus.gov/lab-tests/'+path+'/',language:'en',verification:'consulted',checkedOn:reviewedOn});
const pressureSource:Source={name:'NHS · Medição da tensão arterial',url:'https://www.nhs.uk/tests-and-treatments/blood-pressure-test/',language:'en',verification:'consulted',checkedOn:reviewedOn};
const dgsLiteracy:Source={name:'DGS · Literacia em saúde',url:'https://www.dgs.pt/paginas-de-sistema/saude-de-a-a-z/literacia-em-saude.aspx',language:'pt',verification:'consulted',checkedOn:reviewedOn};
const clinicalUse:Record<Parameter,string>={
 glucose:'É relacionada com o momento da colheita, sintomas e outras análises.',
 hba1c:'É avaliada com a glicemia e os fatores que podem alterar os glóbulos vermelhos.',
 hemoglobin:'É lida com os outros elementos do hemograma, o conjunto de análises às células do sangue.',
 creatinine:'Pode integrar a avaliação da capacidade de filtração dos rins, com outras análises e informações.',
 cholesterol_total:'Integra o perfil lipídico, um conjunto de análises às gorduras no sangue.',
 ldl:'É avaliado com os outros componentes do perfil lipídico e o contexto da pessoa.',
 hdl:'É avaliado com os outros componentes do perfil lipídico e o contexto da pessoa.',
 triglycerides:'É avaliado no perfil lipídico, juntamente com colesterol total, LDL e HDL.',
 ferritin:'É relacionada com o hemograma e outros indicadores do ferro e de inflamação.',
 tsh:'É avaliada com T4 livre e informação sobre sintomas e medicamentos.',
 ft4:'É avaliada com TSH, distinguindo T4 livre de T4 total.',
 vitamin_d:'A utilidade depende do motivo da análise e da avaliação feita pela equipa de saúde.',
 urea:'É lida com outros indicadores dos rins e o estado de hidratação.',
 sodium:'Integra a avaliação do equilíbrio de sais e da função dos rins.',
 potassium:'Integra a avaliação do equilíbrio de sais e da função dos rins.',
 systolic:'As duas pressões são consideradas em conjunto, com a técnica de medição e o contexto.',
 diastolic:'As duas pressões são consideradas em conjunto, com a técnica de medição e o contexto.',
 heart_rate:'É considerada com o contexto de repouso ou esforço e a regularidade dos batimentos.',
 spo2:'É relacionada com a observação da respiração e as limitações do aparelho.',
};
function term(id:Parameter,title:string,label:string,summary:string,what:string,why:string,influences:string,variation:string,source:Topic['sources'][number],related:string[],category:Category='Análises ao sangue',aliases:string[]=[]):Topic{
 return {id,slug:id.replaceAll('_','-'),term:label,title,summary,category,aliases,parameter:id,related,sources:[source],reviewedOn,status:'published',editorialStatus:'reviewed',clinicalReview:'pending',reviewNotes:[],sections:[
  {title:'O que é',body:what},{title:'Para que serve',body:why},{title:'O que pode influenciar',body:influences},
  {title:'Como é utilizado na avaliação clínica',body:clinicalUse[id]},
  {title:'Antes de interpretar o resultado',body:variation},
  {title:'Questões para o profissional de saúde',body:'Que contexto é importante neste resultado? É comparável aos anteriores? Preciso de esclarecer algum cuidado antes de uma nova colheita ou medição?'},
 ]};
}
function guide(id:string,title:string,category:Category,summary:string,sections:Topic['sections'],sources:Topic['sources'],related:string[]):Topic{
 return {id,slug:id,term:title,title,category,summary,sources,related,reviewedOn,status:'published',editorialStatus:'reviewed',clinicalReview:'pending',reviewNotes:[],aliases:[],sections:[
  {title:'O que é',body:summary},{title:'Para que serve',body:sections[0].body},
  {title:'Pontos a ter em conta',body:sections[1].body},
  {title:'Como é usado nos cuidados de saúde',body:sections.length>3?sections[2].body:'Ajuda a organizar informação e dúvidas para conversar com a equipa de saúde.'},
  {title:'Antes de usar esta informação',body:sections[sections.length-1].body},
  {title:'Questões para o profissional de saúde',body:'O que devo preparar? Que informação falta? Como posso confirmar que compreendi o que ficou combinado?'},
 ]};
}

// Static educational content: no access to results, conditions, accounts, Ollama or risk rules.
export const topics:Topic[]=[
 term('glucose','Glicose: o açúcar no sangue','Glicose','Percebe o que é medido num resultado de glicose.',
  'É um açúcar que o organismo utiliza como fonte de energia. A análise mede a sua quantidade no sangue, também chamada glicemia.',
  'Ajuda profissionais a avaliar como o organismo gere o açúcar.',
  'O momento da refeição, o jejum, algumas doenças e medicamentos podem alterar o resultado.',
  'Valores elevados podem estar associados a dificuldades em regular o açúcar; valores baixos também têm várias causas. É necessário conhecer o contexto da análise.',
  med('blood-glucose-test'),['hba1c','read-results'],undefined,['glicemia','glucose']),
 term('hba1c','O que é a HbA1c?','Hemoglobina glicada (HbA1c)','Uma perspetiva da glicose ao longo de dois a três meses.',
  'Mede a proporção de hemoglobina à qual se ligou glicose, refletindo aproximadamente os últimos dois a três meses.',
  'Complementa a medição da glicose num único momento.',
  'Alterações dos glóbulos vermelhos, algumas doenças e medicamentos podem afetar a leitura.',
  'Uma HbA1c mais alta pode acompanhar uma média de glicose mais elevada. Valores baixos ou inesperados precisam também de contexto; a app não define objetivos individuais.',
  med('hemoglobin-a1c-hba1c-test'),['glucose','hemoglobin'],undefined,['hemoglobina glicada','hemoglobina a1c']),
 term('hemoglobin','Hemoglobina e transporte de oxigénio','Hemoglobina','Conhece uma proteína presente nos glóbulos vermelhos.',
  'É uma proteína dos glóbulos vermelhos que transporta oxigénio pelo corpo. Não é a mesma análise que HbA1c.',
  'Integra frequentemente o hemograma e ajuda a avaliar os glóbulos vermelhos.',
  'Hidratação, perdas de sangue, nutrientes, altitude e algumas doenças podem influenciar o valor.',
  'Valores baixos podem acompanhar anemia ou perdas de sangue. Valores altos podem ter outras causas, incluindo desidratação. O resultado não identifica sozinho a causa.',
  med('hemoglobin-test'),['ferritin','hba1c','spo2']),
 term('creatinine','O que mede a creatinina?','Creatinina','Compreende um dos indicadores usados na avaliação dos rins.',
  'É uma substância produzida pela atividade muscular e eliminada principalmente pelos rins.',
  'É usada com outras informações para avaliar a função renal.',
  'Massa muscular, alimentação, atividade física e certos medicamentos podem influenciar o resultado.',
  'Uma elevação pode acompanhar uma diminuição da eliminação pelos rins, entre outras causas. Um valor baixo pode relacionar-se com menor massa muscular. Um valor no intervalo não exclui problemas renais.',
  med('creatinine-test'),['urea','read-results']),
 term('cholesterol_total','Colesterol total: ver o conjunto','Colesterol total','Um valor que reúne diferentes componentes do colesterol.',
  'Resume colesterol transportado por diferentes partículas no sangue.',
  'É lido em conjunto com LDL e HDL.',
  'Alimentação, hereditariedade e medicamentos podem influenciá-lo.',
  'O total, alto ou baixo, não descreve sozinho o risco individual.',
  med('cholesterol-levels'),['ldl','hdl','triglycerides']),
 term('ldl','O que significa colesterol LDL?','LDL','Conhece uma das partículas que transportam colesterol.',
  'LDL transporta colesterol no sangue.',
  'Quantidade excessiva pode favorecer depósitos nas artérias.',
  'Hereditariedade, alimentação e medicamentos podem influenciá-lo.',
  'Uma elevação merece contextualização; um valor baixo não garante ausência de risco cardiovascular.',
  med('cholesterol-levels'),['hdl','cholesterol_total'],undefined,['colesterol ldl']),
 term('hdl','O que é o colesterol HDL?','HDL','Uma peça do perfil de gorduras no sangue.',
  'HDL participa no transporte de colesterol de volta ao fígado.',
  'É avaliado com outros indicadores cardiovasculares.',
  'Hereditariedade, atividade física e medicamentos podem influenciá-lo.',
  'Um HDL baixo pode acompanhar maior risco. Um valor alto não deve ser usado isoladamente como garantia de proteção.',
  med('cholesterol-levels'),['ldl','cholesterol_total'],undefined,['colesterol hdl']),
 term('triglycerides','Triglicéridos: energia em reserva','Triglicéridos','Outro tipo de gordura medido nas análises.',
  'São gorduras que o organismo utiliza e armazena como energia.',
  'Fazem parte da avaliação das gorduras no sangue.',
  'Refeições, álcool, hereditariedade, certas doenças e medicamentos podem influenciar o resultado.',
  'Valores elevados podem acompanhar maior risco cardiovascular e ter outras implicações. Valores baixos também precisam de contexto. Não se define tratamento a partir deste cartão.',
  med('triglycerides-test'),['ldl','cholesterol_total']),
 term('ferritin','Ferritina e reservas de ferro','Ferritina','Conhece uma proteína que armazena ferro.',
  'A ferritina é uma proteína que armazena ferro no organismo.',
  'Ajuda a avaliar as reservas de ferro em conjunto com outros exames.',
  'Inflamação, doenças do fígado e medicamentos podem afetar o resultado.',
  'Valores baixos podem indicar reservas reduzidas. Uma ferritina elevada pode ter várias causas, incluindo inflamação, e não significa necessariamente excesso de ferro.',
  med('ferritin-blood-test'),['hemoglobin','read-results']),
 term('tsh','TSH: um sinal para a tiroide','TSH','Como o organismo regula a produção de hormonas tiroideias.',
  'É uma hormona produzida pela hipófise que estimula a tiroide.',
  'Ajuda a avaliar o funcionamento da tiroide, muitas vezes com a T4 livre.',
  'Medicamentos, gravidez, idade e outras doenças podem afetar o resultado.',
  'TSH alta pode acompanhar produção insuficiente de hormonas tiroideias; TSH baixa pode acompanhar produção excessiva. Existem outras explicações, pelo que a avaliação não termina aqui.',
  med('tsh-thyroid-stimulating-hormone-test'),['ft4','read-results']),
 term('ft4','T4 livre: uma hormona da tiroide','T4 livre','Distingue T4 livre de T4 total.',
  'É a parte da hormona T4 que circula sem estar ligada a proteínas e está disponível para os tecidos.',
  'É interpretada em conjunto com TSH e outras informações.',
  'Medicamentos, suplementos e alterações da tiroide podem influenciar o resultado.',
  'Valores altos ou baixos podem acompanhar alterações da produção hormonal, mas não permitem identificar sozinhos a causa. T4 livre e T4 total não são intercambiáveis.',
  med('thyroxine-t4-test'),['tsh'],undefined,['ft4','tiroxina']),
 term('vitamin_d','Vitamina D: o que mostra a análise?','Vitamina D','Conhece a forma habitualmente medida no sangue.',
  'A análise mede habitualmente a 25-hidroxivitamina D, uma forma que circula no sangue.',
  'Ajuda na avaliação da disponibilidade de vitamina D, importante para ossos e outras funções.',
  'Exposição solar, alimentação, absorção e suplementos podem influenciar o resultado.',
  'Valores baixos podem indicar disponibilidade reduzida. Valores elevados podem relacionar-se com excesso de suplementação. O resultado não determina sozinho a necessidade de suplementos.',
  med('vitamin-d-test'),['read-results'],undefined,['25-oh','25(oh)d']),
 term('urea','Ureia: um produto de eliminação','Ureia','Uma substância avaliada com outros indicadores dos rins.',
  'É formada durante o processamento das proteínas e eliminada sobretudo pelos rins.',
  'Pode integrar uma avaliação renal juntamente com creatinina e outros indicadores.',
  'Hidratação, ingestão de proteínas e situações de maior degradação de tecidos podem influenciá-la.',
  'Uma elevação ou redução tem várias explicações. A ureia isolada não permite concluir como estão os rins.',
  {name:'North West London Pathology · Ureia',url:'https://www.nwlpathology.nhs.uk/test/urea/',language:'en',verification:'not_verified',note:'A ligação não pôde ser confirmada nesta revisão. Rever a fonte laboratorial específica.'},['creatinine','sodium']),
 term('sodium','Sódio e equilíbrio de líquidos','Sódio','Uma análise diferente da quantidade de sal que comes.',
  'É um mineral que participa no equilíbrio de líquidos e na atividade de nervos e músculos.',
  'Ajuda a avaliar o equilíbrio de água e sais do organismo.',
  'Alterações de hidratação, funcionamento dos rins e medicamentos podem influenciar o resultado.',
  'Valores altos ou baixos podem refletir alterações do equilíbrio de líquidos ou outras situações. A análise não é uma medição direta do consumo de sal.',
  med('sodium-blood-test'),['potassium','creatinine']),
 term('potassium','Potássio: um mineral essencial','Potássio','Conhece o papel do potássio nos músculos e no coração.',
  'É um mineral importante para o funcionamento dos nervos, músculos e coração.',
  'A análise ajuda a avaliar o equilíbrio deste mineral no sangue.',
  'Função renal, medicamentos e condições da amostra podem afetar o valor.',
  'Valores altos e baixos podem ter várias causas e afetar a atividade muscular e cardíaca. Precisam de avaliação profissional; este cartão não estabelece limites seguros.',
  med('potassium-blood-test'),['sodium','creatinine']),
 term('systolic','Tensão sistólica: o primeiro número','Tensão sistólica','O primeiro número de uma leitura de tensão arterial.',
  'É a pressão nas artérias durante a contração do coração.',
  'É registada com a tensão diastólica, em milímetros de mercúrio (mmHg). Tensão e pressão arterial designam aqui a mesma medição.',
  'Posição do braço, movimento e forma de medir podem alterar a leitura.',
  'Valores altos ou baixos precisam de contexto; uma leitura não é uma avaliação completa.',
  pressureSource,['diastolic','measure-pressure'],'Tensão arterial',['sistólica','pressão sistólica']),
 term('diastolic','Tensão diastólica: o segundo número','Tensão diastólica','O segundo número de uma leitura de tensão arterial.',
  'É a pressão nas artérias quando o coração relaxa entre batimentos.',
  'Completa a leitura da tensão sistólica, em milímetros de mercúrio (mmHg).',
  'A técnica e o contexto da medição influenciam o resultado.',
  'Valores altos ou baixos não identificam sozinhos uma causa. Leituras habituais não garantem segurança.',
  pressureSource,['systolic','measure-pressure'],'Tensão arterial',['diastólica','pressão diastólica']),
 term('heart_rate','Frequência cardíaca e pulsação','Frequência cardíaca','O número de batimentos do coração por minuto.',
  'Expressa quantas vezes o coração bate num minuto; é apresentada em bpm.',
  'Ajuda a descrever o ritmo dos batimentos no momento da medição.',
  'Atividade física, repouso e algumas condições ou medicamentos podem influenciar a pulsação.',
  'Uma frequência mais alta ou mais baixa pode ter várias explicações. Variações persistentes ou um ritmo irregular merecem conversa com um profissional, sem concluir a causa pela app.',
  {name:'MedlinePlus · Pulsação',url:'https://medlineplus.gov/ency/article/003399.htm',language:'en',verification:'consulted',checkedOn:reviewedOn},['systolic','diastolic'],'Tensão arterial',['pulsação','batimentos','bpm']),
 term('spo2','O que é SpO₂?','SpO₂','Uma estimativa do oxigénio transportado no sangue.',
  'É uma estimativa, em percentagem, da saturação de oxigénio da hemoglobina, obtida por um oxímetro.',
  'Pode ajudar profissionais a acompanhar a oxigenação. Não mede dióxido de carbono nem substitui a avaliação da respiração.',
  'Movimento, mãos frias, verniz, colocação do sensor e pigmentação da pele podem influenciar a precisão.',
  'Uma leitura mais baixa pode refletir menor oxigenação ou erro de medição. Uma leitura alta não exclui problemas. Não são definidos alvos individuais ou garantias de segurança.',
  {name:'MHRA · Limitações dos oxímetros',url:'https://www.gov.uk/guidance/the-use-and-regulation-of-pulse-oximeters-information-for-healthcare-professionals',language:'en',verification:'consulted',checkedOn:reviewedOn},['hemoglobin'],'Saúde respiratória',['spo2','saturação periférica de oxigénio','saturação de oxigénio','oxímetro']),
 guide('measure-pressure','Como medir a tensão arterial?','Tensão arterial','Pequenos cuidados ajudam a tornar os registos mais consistentes.',[
  {title:'Preparar a medição',body:'Segue as instruções do aparelho e da equipa que acompanha as medições. Senta-te com as costas apoiadas e os pés no chão.'},
  {title:'Durante a leitura',body:'Apoia o braço, coloca a braçadeira sobre a pele e mantém-te relaxado, sem falar. Regista os dois números e a data.'},
  {title:'Combinar o acompanhamento',body:'Confirma com um profissional quando e quantas vezes medir. O PULSO organiza os registos; não decide se uma leitura é segura.'},
 ],[{name:'Fundação Portuguesa de Cardiologia · Medir a pressão arterial',url:'https://www.fpcardiologia.pt/como-medir-pressao-arterial/',language:'pt',verification:'consulted',checkedOn:reviewedOn,note:'Data de revisão da página não identificada.'},pressureSource],['systolic','diastolic']),
 guide('medicine-list','Levar uma lista de medicação','Medicação','Prepara informação útil para conversar com o médico ou farmacêutico.',[
  {title:'O que reunir',body:'Anota os medicamentos que utilizas, incluindo os sem receita, vitaminas e suplementos, e como os estás a tomar.'},
  {title:'O que perguntar',body:'Leva dúvidas sobre as instruções e dificuldades de utilização. Refere alergias e alterações recentes.'},
  {title:'Uma conversa, não uma alteração de tratamento',body:'Esta lista ajuda a comunicar. Não é uma recomendação para iniciar, suspender ou ajustar medicamentos.'},
 ],[{name:'INFARMED · Folheto informativo',url:'https://www.infarmed.pt/documents/15786/1228470/Siaba_mais_Folheto_Informativo.pdf/229c3f0f-542a-467b-982a-c753dc51a427?version=1.1',language:'pt',verification:'consulted',checkedOn:reviewedOn,note:'Brochura de março de 2009. Usada apenas para explicar o folheto e o esclarecimento de dúvidas, sem aplicar recomendações terapêuticas.'},{name:'FDA · Conversar com o farmacêutico',url:'https://www.fda.gov/drugs/information-consumers-and-patients-drugs/stop-learn-go-tips-talking-your-pharmacist-learn-how-use-medicines-safely',language:'en',verification:'consulted',checkedOn:reviewedOn}],['prepare-visit']),
 guide('prepare-visit','Como preparar uma consulta médica?','Consultas','Leva as perguntas certas e encontra mais facilmente a tua informação.',[
  {title:'Antes da consulta',body:'Escreve as tuas principais dúvidas e reúne os relatórios e a lista de medicação que queres discutir.'},
  {title:'Durante a conversa',body:'Descreve as tuas preocupações com clareza. Pede explicação de palavras que não compreendes e toma notas se te ajudar.'},
  {title:'Antes de sair',body:'Confirma o que ficou combinado e como esclarecer dúvidas depois. Um acompanhante pode ajudar a ouvir e a registar informação, se o desejares.'},
 ],[dgsLiteracy],['medicine-list','read-results']),
 guide('read-results','Como ler um relatório sem tirar conclusões precipitadas?','Prevenção','Distingue resultado, referência do laboratório e histórico pessoal.',[
  {title:'Resultado e referência',body:'O resultado é o valor medido. O intervalo de referência pertence ao laboratório e ao método; não é um objetivo personalizado.'},
  {title:'Comparar com cuidado',body:'Confere datas, unidades e métodos. Um valor fora do intervalo pode ter várias explicações; um valor dentro dele não exclui todos os problemas.'},
  {title:'Histórico e objetivos',body:'O histórico mostra registos anteriores, sem garantir segurança. Um objetivo individual depende de avaliação profissional; o PULSO não o cria a partir de uma doença declarada.'},
  {title:'Educação e avaliação',body:'Usa as explicações para preparar dúvidas. A interpretação dos resultados exige contexto e conversa com um profissional de saúde.'},
 ],[med('how-to-understand-your-lab-results')],['glucose','prepare-visit']),
];

// Explicit audit findings, not a clinical approval or an automated confidence score.
topics.find(t=>t.id==='ldl')!.sources=[{name:'MedlinePlus · Colesterol LDL',url:'https://medlineplus.gov/ldlthebadcholesterol.html',language:'en',verification:'consulted',checkedOn:reviewedOn}];
topics.find(t=>t.id==='hdl')!.sources=[{name:'MedlinePlus · Colesterol HDL',url:'https://medlineplus.gov/hdlthegoodcholesterol.html',language:'en',verification:'consulted',checkedOn:reviewedOn}];
topics.find(t=>t.id==='hba1c')!.sources.push({name:'DGS · Hemoglobina glicada A1c',url:'https://www.dgs.pt/directrizes-da-dgs/normas-e-circulares-normativas/norma-n-0332011-de-30092011-atualizada-a-06122012-jpg.aspx',language:'pt',verification:'consulted',checkedOn:reviewedOn,note:'Norma atualizada em 06/12/2012: referência histórica para terminologia e interferências. Não foram importados limiares, objetivos ou periodicidades.'});
topics.find(t=>t.id==='read-results')!.sources.push({name:'OMS · Literacia em saúde',url:'https://www.who.int/news-room/fact-sheets/detail/health-literacy',language:'en',verification:'consulted',checkedOn:reviewedOn});
topics.find(t=>t.id==='urea')!.reviewNotes.push('Confirmar a fonte laboratorial específica e a redação sobre fatores de variação antes de revisão clínica.');
topics.find(t=>t.id==='tsh')!.sections[4].body='Uma TSH alta ou baixa pode ter várias explicações. É necessário relacioná-la com outras hormonas, medicamentos e o contexto da pessoa; não permite concluir sozinha como funciona a tiroide.';
topics.find(t=>t.id==='creatinine')!.sections[4].body='A creatinina depende também da massa muscular e de outros fatores. Um resultado isolado, dentro ou fora do intervalo do relatório, não confirma nem exclui doença dos rins.';
export function clinicallyReviewed(topic:Topic){const p=topic.professionalReview;return topic.clinicalReview==='reviewed'&&!!p?.name.trim()&&!!p.qualification.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(p.reviewedOn)&&/^https:\/\//.test(p.evidence);}

export const publishedTopics=topics.filter(t=>t.status==='published');
export const topicById=(id:string)=>publishedTopics.find(t=>t.id===id);
export const topicForParameter=(parameter:Parameter)=>publishedTopics.find(t=>t.parameter===parameter);
export const searchKey=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').replace(/₂/g,'2').trim();
export function searchTopics(query:string,category:Category|'Todas'='Todas'){
 const words=searchKey(query).split(/\s+/).filter(Boolean);
 return publishedTopics.filter(t=>(category==='Todas'||t.category===category)&&words.every(word=>searchKey([t.term,t.title,t.summary,...t.aliases].join(' ')).includes(word)));
}
export function todayTopic(date=new Date()){
 const index=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)%publishedTopics.length;
 return publishedTopics[index]; // Calendar only, never selected using clinical data.
}
