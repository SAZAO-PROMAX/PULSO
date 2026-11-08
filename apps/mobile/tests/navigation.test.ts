import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tabs,areas,reducer,initialState} from '../src/model';
test('todos os separadores e áreas podem ser abertos e abandonados',()=>{
 for(const tab of tabs) {
  const state=reducer(initialState,{type:'tab',tab});
  assert.equal(state.tab,tab);
  for(const area of areas) {
   const detail=reducer(state,{type:'area',area});
   assert.equal(detail.area,area);
   assert.equal(reducer(detail,{type:'tab',tab}).area,null);
  }
 }
});
test('troca de perfil limpa detalhe',()=>{
 const a=reducer(initialState,{type:'area',area:'Tensão arterial'});

 const b=reducer(a,{type:'profile',id:'demo-b'});
 assert.equal(b.area,null); assert.equal(b.tab,'Início');

 assert.equal(reducer(b,{type:'profile',id:'demo-a'}).profileId,'demo-a');
});
test('perfil desconhecido não revela dados nem altera seleção',()=>{

 assert.deepEqual(reducer(initialState,{type:'profile',id:'unknown'}),initialState);
});

