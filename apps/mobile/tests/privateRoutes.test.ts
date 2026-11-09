import test from 'node:test';
import assert from 'node:assert/strict';
import {safePrivateRoute,privateRoutes,registrationStep,registrationRoute} from '../src/routes';
import {setCsrf,sessionEpoch,expireSession,onSessionExpired} from '../src/api';
test('retorno apenas para rotas internas explícitas',()=>{for(const route of privateRoutes)assert.equal(safePrivateRoute(route),route);for(const route of ['https://example.invalid','//example.invalid','/history?next=https://example.invalid','/../history','/history/','javascript:alert(1)','/%68istory'])assert.equal(safePrivateRoute(route),null);});
test('resposta 401 antiga não apaga uma sessão mais recente',()=>{let expired=0;onSessionExpired(()=>expired++);setCsrf('fictitious-one');const old=sessionEpoch();setCsrf('fictitious-two');expireSession(old);assert.equal(expired,0);expireSession(sessionEpoch());assert.equal(expired,1);onSessionExpired(null);setCsrf(null);});


test('passos de registo aceitam apenas catálogo explícito sem URLs externas ou campos clínicos',()=>{
 for(const route of ['/record','/record/categories','/record/camera','/record/types/laboratory','/record/form/laboratory/blood']){
  assert.equal(safePrivateRoute(route),'/record');assert.equal(registrationRoute(registrationStep(route)!),route);
 }
 for(const route of ['/record/form/laboratory/unknown','/record/form/medication/medication-entry','/record/form/laboratory/blood/extra','/record/types/%6caboratory','/record?next=https://example.invalid','/record/../app','//record/categories','/record/form/laboratory/blood?value=99'])assert.equal(safePrivateRoute(route),null);
});
