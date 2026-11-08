import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const json = p => JSON.parse(readFileSync(new URL('../'+p, import.meta.url), 'utf8'));
test('estrutura documental e destinos de desenvolvimento existem', () => {
 for (const p of ['README.md','docs/PRD_v0.2.md','docs/ARCHITECTURE.md','docs/SECURITY.md','docs/DECISIONS.md','apps/mobile','services/api']) assert.ok(existsSync(new URL('../'+p, import.meta.url)),p);
});
test('exemplos fictícios têm proprietários válidos e proveniência', () => {
 const profiles=json('data/synthetic/profiles.json'), observations=json('data/synthetic/observations.json');
 assert.equal(new Set(profiles.map(p=>p.id)).size,profiles.length);
 for(const p of profiles) assert.equal(p.synthetic,true);
 for(const o of observations) {
  assert.equal(o.synthetic,true);
  assert.ok(profiles.some(p=>p.id===o.ownerId));
  assert.ok(Number.isFinite(o.value));
  assert.ok(o.unit && o.source && o.confirmationStatus);
  assert.ok(Number.isFinite(Date.parse(o.measuredAt)));
 }
 assert.ok(profiles.some(p=>p.conditions.length===0));
});
