import test from 'node:test';
import assert from 'node:assert/strict';
import {conditionOptions,searchConditions,customCondition,conditionLabel,validBirthDate,birthDateDisplay,birthDateISO} from '../src/auth/profileOptions';
test('pesquisa sem acentos, sinónimos, nomes e condição ausente sem duplicados',()=>{
 assert.equal(new Set(conditionOptions.map(c=>c.id)).size,conditionOptions.length);
 assert.ok(searchConditions('DPOC').some(c=>c.id==='copd'));
 assert.ok(searchConditions('hipertensao').some(c=>c.id==='hypertension'));
 assert.equal(conditionLabel('custom:Condição fictícia rara'),'Condição fictícia rara');
 assert.equal(customCondition('Asma',[]),null);
 assert.equal(customCondition('  CONDIÇÃO FICTÍCIA  ',['custom:Condição fictícia']),null);
 assert.equal(customCondition('Condição fictícia rara',[]),'custom:Condição fictícia rara');
 assert.equal(customCondition('x',[]),null);assert.equal(customCondition('x'.repeat(101),[]),null);
});
test('nascimento obrigatório, calendário, formato e limites',()=>{
 for(const date of ['','1900-02-29','2001-02-29','1899-12-31','2030-01-01','23/05/1970'])assert.equal(validBirthDate(date,'2026-11-08'),false,date);
 assert.equal(validBirthDate('1972-02-29','2026-11-08'),true);
});

test('data pt-PT apresenta dia e mês sem alterar a data ISO persistida',()=>{
 assert.equal(birthDateDisplay('1970-05-23'),'23/05/1970');
 assert.equal(birthDateISO('23/05/1970'),'1970-05-23');
 assert.equal(birthDateISO(birthDateDisplay('1972-02-29')),'1972-02-29');
 assert.equal(validBirthDate(birthDateISO('31/02/1970')),false);
 assert.equal(validBirthDate(birthDateISO('23/05/')),false);
 assert.equal(birthDateISO('23/05/'),'23/05/');
 assert.equal(birthDateDisplay(''),'');
});
