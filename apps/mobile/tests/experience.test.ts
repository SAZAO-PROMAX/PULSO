import test from 'node:test';
import assert from 'node:assert/strict';
import {design,defaultExperience,modes} from '../src/experience';
function contrast(a:string,b:string){const l=(h:string)=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('tokens dos dois temas: texto AA, limites/foco identificáveis e modos sem permissões',()=>{
 for(const c of Object.values(design)){
  for(const [a,b] of [[c.ink,c.bg],[c.ink,c.card],[c.ink,c.soft],[c.muted,c.soft],[c.muted,c.bg],[c.muted,c.card],[c.accentInk,c.accent],[c.heroInk,c.hero],[c.info,c.card]])assert.ok(contrast(a,b)>=4.5,`${a}/${b}`);
  for(const b of [c.bg,c.card])assert.ok(contrast(c.control,b)>=3);
 }
 assert.equal(defaultExperience.mode,'balanced');assert.equal(modes.length,3);assert.ok(!('role' in defaultExperience));
});
