import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readTheme,writeTheme} from '../src/preferences.web';

test('preferência persiste só o tema e ignora valores desconhecidos',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'window');const items=new Map<string,string>();const keys:string[]=[];
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:(k:string)=>{keys.push(k);return items.get(k)??null;},setItem:(k:string,v:string)=>{keys.push(k);items.set(k,v);}}}});
 try{assert.equal(readTheme().theme,'light');assert.equal(writeTheme('dark'),'');assert.equal(readTheme().theme,'dark');items.set('pulso.theme.v1','unexpected');assert.equal(readTheme().theme,'light');assert.ok(keys.every(k=>k==='pulso.theme.v1'));assert.deepEqual([...items.keys()],['pulso.theme.v1']);}
 finally{if(original)Object.defineProperty(globalThis,'window',original);else Reflect.deleteProperty(globalThis,'window');}
});
test('armazenamento bloqueado não impede o tema e não declara que foi guardado',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{get localStorage(){throw Error('blocked');}}});
 try{assert.equal(readTheme().theme,'light');assert.match(readTheme().warning,/sessão/);assert.match(writeTheme('dark'),/Não foi possível guardar/);}
 finally{if(original)Object.defineProperty(globalThis,'window',original);else Reflect.deleteProperty(globalThis,'window');}
});
