import {test as base,expect} from '@playwright/test';
export const test=base.extend<{demoDatabase:void}>({
 demoDatabase:[async({request},use)=>{
  for(const owner of ['demo-a','demo-b']){
   const response=await request.post('http://127.0.0.1:8000/demo/profiles/'+owner+'/reset',{headers:{'X-Pulso-Profile':owner},data:{confirm:owner}});
   expect(response.ok()).toBeTruthy();
  }
  await use();
 },{auto:true}],
});
export {expect};
