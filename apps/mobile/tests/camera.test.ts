import test from 'node:test';
import assert from 'node:assert/strict';
import {checkPhoto,stripJpegMetadata} from '../src/clinical/inputDocument';
test('captura mantém limites existentes e não declara qualidade clínica',()=>{checkPhoto(1600,1200,10000);assert.throws(()=>checkPhoto(5000,3000,100));assert.throws(()=>checkPhoto(10,10,2097153));assert.throws(()=>checkPhoto(0,10,100));});
test('metadados JPEG são removidos sem recomprimir bytes da imagem',()=>{const data=Uint8Array.from([255,216,255,225,0,6,69,88,73,70,255,224,0,4,1,2,255,218,0,2,23,45,255,217]);assert.deepEqual(Array.from(stripJpegMetadata(data)),[255,216,255,224,0,4,1,2,255,218,0,2,23,45,255,217]);assert.throws(()=>stripJpegMetadata(Uint8Array.from([1,2,3])));assert.throws(()=>stripJpegMetadata(Uint8Array.from([255,216,255,225,0,50])));assert.equal(data.length,24);});
