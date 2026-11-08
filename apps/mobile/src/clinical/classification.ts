import catalog from '../../../../packages/shared/registration.json';
import type {MedicalDocument} from './data';
export const registrationCategories=catalog.categories;
export const specialties=catalog.specialties;
export interface Classification{category:string;examType:string;specialties:string[];examDate:string|null}
export function classificationFor(category:string,examType:string):Classification{
 const item=registrationCategories.find(c=>c.id===category);return {category,examType,specialties:[...(item?.specialties??[])],examDate:null};
}
export function validateClassification(doc:MedicalDocument){
 if(doc.category!==undefined){const c=registrationCategories.find(c=>c.id===doc.category);if(!c||!c.types.some(t=>t.id===doc.examType&&!['planned','pressure'].includes(t.mode)))throw Error('Classificação do documento inválida.');}
 else if(doc.examType!==undefined)throw Error('Categoria em falta.');
 if(doc.specialties!==undefined&&(!Array.isArray(doc.specialties)||new Set(doc.specialties).size!==doc.specialties.length||doc.specialties.some(s=>!specialties.some(known=>known.id===s))))throw Error('Especialidades inválidas.');
 if(doc.examDate!==undefined&&doc.examDate!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(doc.examDate)||!Number.isFinite(Date.parse(doc.examDate))||new Date(doc.examDate).toISOString().slice(0,10)!==doc.examDate))throw Error('Data do exame inválida.');
}
export function classificationLabel(doc:MedicalDocument){const category=registrationCategories.find(c=>c.id===doc.category);return category?category.label+' · '+(category.types.find(t=>t.id===doc.examType)?.label??'Tipo não indicado'):'Por classificar';}
export function documentTime(doc:MedicalDocument){return doc.examDate??doc.issuedAt??doc.importedAt;}
