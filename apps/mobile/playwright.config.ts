import {defineConfig} from '@playwright/test';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(path.resolve(__dirname,'../../.venv/Scripts/python.exe'),[path.resolve(__dirname,'../../scripts/benchmark_extraction.py'),'--fixtures-only'],{cwd:path.resolve(__dirname,'../..')});
if(process.env.PULSO_G_PARAMETERS==='25')execFileSync(path.resolve(__dirname,'../../.venv/Scripts/python.exe'),['-c',"from scripts.benchmark_extraction import pdf,table; from pathlib import Path; second=[s.replace('hexoquinase | plasma','HPLC | serum') if s.startswith('Glicose') else s for s in table(list(range(10)),date='2026-10-05')]; Path('tmp/g-25.pdf').write_bytes(pdf([table(list(range(15))),second],small=True))"],{cwd:path.resolve(__dirname,'../..')});
const launcher=process.env.PULSO_TEST_LAUNCHER==='true',publicMode=process.env.PULSO_TEST_PUBLIC==='true';
const apiPort=Number(process.env.PULSO_TEST_API_PORT??8000),webPort=Number(process.env.PULSO_TEST_WEB_PORT??8765);
if(![apiPort,webPort].every(p=>Number.isInteger(p)&&p>=1024&&p<=65535)||apiPort===webPort)throw Error('Portas de teste inválidas.');
const apiURL='http://127.0.0.1:'+apiPort,webURL='http://127.0.0.1:'+webPort;
const root=path.resolve(__dirname,'../..'),site=path.resolve(root,'tmp',publicMode?'public-site':'demo-test-site');
const demo=publicMode?'false':'true',testMode=publicMode?'':'synthetic-only';
export default defineConfig({
 workers:1,
 testDir:'./e2e',testMatch:publicMode?'public-*.spec.ts':'*.spec.ts',testIgnore:publicMode?[]:['public-*.spec.ts'],use:{baseURL:launcher?'http://localhost:'+webPort:webURL, viewport:{width:390,height:844}},
 webServer:launcher?[{command:'"'+process.execPath+'" scripts/dev.mjs',cwd:path.resolve(__dirname,'../..'),env:{PULSO_API_PORT:String(apiPort),PULSO_WEB_PORT:String(webPort),PULSO_RUN_DIR:path.resolve(root,'tmp/launcher-state-'+Date.now()),PULSO_WEB_ORIGINS:'http://localhost:'+webPort,EXPO_PUBLIC_PULSO_TEST_DEMO:demo,PULSO_TEST_MODE:testMode,LLM_EXTRACTION_ENABLED:'false',PULSO_DB_PATH:path.resolve(__dirname,'../../tmp/launcher-'+Date.now()+'.sqlite3')},url:'http://localhost:'+webPort,reuseExistingServer:false,timeout:120000}]:[
 {command:'"'+process.execPath+'" "'+path.resolve(__dirname,'node_modules/expo/bin/cli')+'" export --platform web --clear --output-dir "'+site+'" && py -m http.server '+webPort+' --bind 127.0.0.1 --directory "'+site+'"',env:{EXPO_PUBLIC_PULSO_TEST_DEMO:demo,EXPO_PUBLIC_API_URL:apiURL},url:webURL,reuseExistingServer:false,timeout:120000},
 {command:'"'+path.resolve(__dirname,'../../.venv/Scripts/python.exe')+'" -m uvicorn services.api.app.main:app --host 127.0.0.1 --port '+apiPort+' --no-proxy-headers',cwd:path.resolve(__dirname,'../..'),env:{PULSO_WEB_ORIGINS:webURL,PULSO_TEST_MODE:testMode,LLM_EXTRACTION_ENABLED:process.env.PULSO_TEST_LOCAL_LLM==='true'?'true':'false',PULSO_DB_PATH:path.resolve(__dirname,'../../tmp/browser-'+Date.now()+'.sqlite3')},url:apiURL+'/health',reuseExistingServer:false},
 ],
});
