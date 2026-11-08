import test from 'node:test';
import assert from 'node:assert/strict';
import {safePrivateRoute,privateRoutes} from '../src/routes';
import {setCsrf,sessionEpoch,expireSession,onSessionExpired} from '../src/api';
test('retorno apenas para rotas internas explícitas',()=>{for(const route of privateRoutes)assert.equal(safePrivateRoute(route),route);for(const route of ['https://example.invalid','//example.invalid','/history?next=https://example.invalid','/../history','/history/','javascript:alert(1)','/%68istory'])assert.equal(safePrivateRoute(route),null);});
test('resposta 401 antiga não apaga uma sessão mais recente',()=>{let expired=0;onSessionExpired(()=>expired++);setCsrf('fictitious-one');const old=sessionEpoch();setCsrf('fictitious-two');expireSession(old);assert.equal(expired,0);expireSession(sessionEpoch());assert.equal(expired,1);onSessionExpired(null);setCsrf(null);});
