import catalogue from '../../../../packages/shared/conditions.json';
export const conditionOptions=catalogue;
export const commonConditionIds=['diabetes','hypertension','asthma','dyslipidemia','copd','hypothyroidism','osteoarthritis','anxiety'];
export const normalize=(s:string)=>s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').replace(/\s+/g,' ');
export const conditionLabel=(id:string)=>id.startsWith('custom:')?id.slice(7):catalogue.find(c=>c.id===id)?.label??id;
export function searchConditions(query:string){const q=normalize(query);return q?catalogue.filter(c=>normalize(c.label+' '+c.aliases).includes(q)):catalogue.filter(c=>commonConditionIds.includes(c.id));}
export function customCondition(query:string,selected:string[]){const label=query.trim().replace(/\s+/g,' '),key=normalize(label);if(label.length<2||label.length>100||/[\u0000-\u001f\u007f]/.test(label)||selected.some(id=>normalize(conditionLabel(id))===key)||catalogue.some(c=>normalize(c.label)===key))return null;return 'custom:'+label;}
export function validBirthDate(value:string,today=new Date().toISOString().slice(0,10)){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1900-01-01'&&value<=today&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export const avatarOptions=[{id:'leaf',label:'Folha',symbol:'❧',color:'#d2f18a'},{id:'sun',label:'Sol',symbol:'☀',color:'#ffe09b'},{id:'wave',label:'Onda',symbol:'≈',color:'#a5deeb'},{id:'heart',label:'Coração',symbol:'♥',color:'#f5b5c3'},{id:'mountain',label:'Montanha',symbol:'▲',color:'#c6d6bd'},{id:'flower',label:'Flor',symbol:'✿',color:'#dbc8f1'},{id:'moon',label:'Lua',symbol:'☾',color:'#c6cff4'},{id:'star',label:'Estrela',symbol:'★',color:'#f1d9ac'}];

/** Display only; persistence and the API continue to use ISO calendar dates. */
export function birthDateDisplay(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)?value.split('-').reverse().join('/'):value;}
export function birthDateISO(value:string){return /^\d{2}\/\d{2}\/\d{4}$/.test(value)?value.split('/').reverse().join('-'):value;}
