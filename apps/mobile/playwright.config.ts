import {defineConfig} from '@playwright/test';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(path.resolve(__dirname,'../../.venv/Scripts/python.exe'),[path.resolve(__dirname,'../../scripts/benchmark_extraction.py'),'--fixtures-only'],{cwd:path.resolve(__dirname,'../..')});
export default defineConfig({
 workers:1,
 testDir:'./e2e', use:{baseURL:'http://127.0.0.1:8765', viewport:{width:390,height:844}},
 webServer:[
 {command:'py -m http.server 8765 --bind 127.0.0.1 --directory dist',url:'http://127.0.0.1:8765',reuseExistingServer:false},
 {command:'"'+path.resolve(__dirname,'../../.venv/Scripts/python.exe')+'" -m uvicorn services.api.app.main:app --host 127.0.0.1 --port 8000 --no-proxy-headers',cwd:path.resolve(__dirname,'../..'),env:{LLM_EXTRACTION_ENABLED:process.env.PULSO_TEST_LOCAL_LLM==='true'?'true':'false',PULSO_DB_PATH:path.resolve(__dirname,'../../tmp/browser-'+Date.now()+'.sqlite3')},url:'http://127.0.0.1:8000/health',reuseExistingServer:false},
 ],
});
