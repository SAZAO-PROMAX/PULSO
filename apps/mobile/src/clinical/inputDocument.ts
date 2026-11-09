export interface InputDocument {name:string;size:number;type:string;arrayBuffer:()=>Promise<ArrayBuffer>;dataUrl?:string;capture?:{source:'browser-camera'|'native-camera'|'native-library';pages:1;metadata:'not-collected'|'jpeg-metadata-removed';sourceSha256?:string}}
export const MAX_DOCUMENT_BYTES=2*1024*1024,MAX_IMAGE_PIXELS=12000000;
export function checkPhoto(width:number,height:number,size:number){if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width*height>MAX_IMAGE_PIXELS)throw Error('A imagem deve ter até 12 megapíxeis. Repita com uma resolução inferior.');if(!Number.isFinite(size)||size<0||size>MAX_DOCUMENT_BYTES)throw Error('A imagem deve ter até 2 MB. Selecione um ficheiro menor ou repita a fotografia.');}
/** Remove JPEG metadata segments without decoding/recompressing the image pixels. */
export function stripJpegMetadata(raw:Uint8Array):Uint8Array{
 if(raw[0]!==255||raw[1]!==216)throw Error('Fotografia JPEG inválida.');const parts=[raw.slice(0,2)];let offset=2;
 while(offset<raw.length){if(raw[offset]!==255)throw Error('Fotografia JPEG inválida.');const marker=raw[offset+1];if(marker===218||marker===217){parts.push(raw.slice(offset));const out=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0));let at=0;for(const part of parts){out.set(part,at);at+=part.length;}return out;}const length=(raw[offset+2]<<8)|raw[offset+3],end=offset+2+length;if(length<2||end>raw.length)throw Error('Fotografia JPEG incompleta.');if(marker!==225&&marker!==237&&marker!==254)parts.push(raw.slice(offset,end));offset=end;}
 throw Error('Fotografia JPEG incompleta.');
}
