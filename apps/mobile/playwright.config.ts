import {defineConfig} from '@playwright/test';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(path.resolve(__dirname,'../../.venv/Scripts/python.exe'),[path.resolve(__dirname,'../../scripts/benchmark_extraction.py'),'--fixtures-only'],{cwd:path.resolve(__dirname,'../..')});
const launcher=process.env.PULSO_TEST_LAUNCHER==='true',publicMode=process.env.PULSO_TEST_PUBLIC==='true';
const root=path.resolve(__dirname,'../..'),site=path.resolve(root,'tmp',publicMode?'public-site':'demo-test-site');
const demo=publicMode?'false':'true',testMode=publicMode?'':'synthetic-only';
export default defineConfig({
 workers:1,
 testDir:'./e2e',testMatch:publicMode?'public-*.spec.ts':'*.spec.ts',testIgnore:publicMode?[]:['public-*.spec.ts'],use:{baseURL:launcher?'http://localhost:8081':'http://127.0.0.1:8765', viewport:{width:390,height:844}},
 webServer:launcher?[{command:'"'+process.execPath+'" scripts/dev.mjs',cwd:path.resolve(__dirname,'../..'),env:{EXPO_PUBLIC_PULSO_TEST_DEMO:demo,PULSO_TEST_MODE:testMode,LLM_EXTRACTION_ENABLED:'false',PULSO_DB_PATH:path.resolve(__dirname,'../../tmp/launcher-'+Date.now()+'.sqlite3')},url:'http://localhost:8081',reuseExistingServer:false,timeout:120000}]:[
 {command:'"'+process.execPath+'" "'+path.resolve(__dirname,'node_modules/expo/bin/cli')+'" export --platform web --output-dir "'+site+'" && py -m http.server 8765 --bind 127.0.0.1 --directory "'+site+'"',env:{EXPO_PUBLIC_PULSO_TEST_DEMO:demo},url:'http://127.0.0.1:8765',reuseExistingServer:false,timeout:120000},
 {command:'"'+path.resolve(__dirname,'../../.venv/Scripts/python.exe')+'" -m uvicorn services.api.app.main:app --host 127.0.0.1 --port 8000 --no-proxy-headers',cwd:path.resolve(__dirname,'../..'),env:{PULSO_TEST_MODE:testMode,LLM_EXTRACTION_ENABLED:process.env.PULSO_TEST_LOCAL_LLM==='true'?'true':'false',PULSO_DB_PATH:path.resolve(__dirname,'../../tmp/browser-'+Date.now()+'.sqlite3')},url:'http://127.0.0.1:8000/health',reuseExistingServer:false},
 ],
});
