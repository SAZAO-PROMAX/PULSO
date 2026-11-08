import fixture from '../../../data/synthetic/clinical.json';
import {ClinicalData,ClinicalRepository,validateData} from '../src/clinical/data';
export class FixtureRepository implements ClinicalRepository {
 constructor(private data:ClinicalData=fixture as ClinicalData){}
 async load(ownerId:string):Promise<ClinicalData> {
  validateData(this.data);
  return JSON.parse(JSON.stringify({...this.data, events:(this.data.events??[]).filter(e=>e.ownerId===ownerId),documents:this.data.documents.filter(d=>d.ownerId===ownerId),results:this.data.results.filter(r=>r.ownerId===ownerId)})) as ClinicalData;
 }
}
