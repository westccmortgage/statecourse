import {IntegrationError} from './contract.mjs';
// Shared bounded parser for both the synchronous submission and background worker.
export async function readJson(request) {
 const length=request.headers.get('content-length');
 if(length && (!/^\d+$/.test(length) || Number(length)>1024))throw new IntegrationError('request_too_large',413);
 const stream=request.body?.getReader();let text='',size=0;
 if(stream){const decoder=new TextDecoder();try{while(true){const next=await stream.read();if(next.done)break;size+=next.value.byteLength;
  if(size>1024){await stream.cancel();throw new IntegrationError('request_too_large',413);}text+=decoder.decode(next.value,{stream:true});}text+=decoder.decode();}finally{stream.releaseLock();}}
 try{return JSON.parse(text);}catch{throw new IntegrationError('invalid_json');}
}
