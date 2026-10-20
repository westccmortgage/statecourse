import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {withLambda} from '@netlify/aws-lambda-compat';
const context={requestId:'isolated-modern-test'};
test('every migrated HTTP endpoint retains the same method rejection without external requests',async()=>{
 const prior=globalThis.fetch;let calls=0;globalThis.fetch=()=>{calls++;throw Error('No network permitted in transport regression.');};
 try{
  let checked=0;
  for(const name of await readdir(new URL('../netlify/functions/',import.meta.url))){
   if(!name.endsWith('.mjs'))continue;
   const url=new URL('../netlify/functions/'+name,import.meta.url);
   if(!(await readFile(url,'utf8')).includes('export default withLambda(handler)'))continue;
   const module=await import(url);const headers={origin:'https://isolated.test','content-type':'application/json'};
   const expected=await module.legacyHandler({httpMethod:'OPTIONS',headers,body:null});
   const actual=await module.default(new Request('https://isolated.test/.netlify/functions/'+name.replace('.mjs',''),{method:'OPTIONS',headers}),context);
   assert.equal(actual.status,expected.statusCode,name);assert.equal(await actual.text(),expected.body??'',name);
   for(const [key,value] of Object.entries(expected.headers??{}))assert.equal(actual.headers.get(key),String(value),name+': '+key);
   checked++;
  }
  assert.equal(checked,28);assert.equal(calls,0);
 }finally{globalThis.fetch=prior;}
});
test('transport preserves signed JSON bytes, auth/cookie headers, repeated queries and multiple response cookies',async()=>{
 const body='{ "type": "fixture", "text": "café", "value": 1 }\n';let event;
 const wrapped=withLambda(async input=>{event=input;return {statusCode:303,headers:{location:'/student/','cache-control':'no-store'},multiValueHeaders:{'set-cookie':['a=one; HttpOnly; Secure; SameSite=Lax','b=two; HttpOnly; Secure; SameSite=Lax']},body:''};});
 const response=await wrapped(new Request('https://isolated.test/api/stripe/webhook?a=1&a=2',{method:'POST',headers:{'content-type':'application/json','stripe-signature':'fixture-signature',authorization:'Bearer fixture',cookie:'session=fixture','x-nf-client-connection-ip':'192.0.2.1'},body}),context);
 assert.equal(event.body,body);assert.equal(event.isBase64Encoded,false);assert.equal(event.headers['stripe-signature'],'fixture-signature');assert.equal(event.headers.authorization,'Bearer fixture');assert.equal(event.headers.cookie,'session=fixture');assert.equal(event.headers['x-nf-client-connection-ip'],'192.0.2.1');assert.deepEqual(event.multiValueQueryStringParameters.a,['1','2']);
 assert.equal(response.status,303);assert.equal(response.headers.get('location'),'/student/');assert.equal(response.headers.getSetCookie().length,2);
});
test('transport preserves binary request and response bodies',async()=>{
 const bytes=Uint8Array.of(0,127,128,255);let captured;
 const response=await withLambda(async event=>{captured=event;return {statusCode:200,isBase64Encoded:true,body:event.body};})(new Request('https://isolated.test/binary',{method:'POST',headers:{'content-type':'application/octet-stream'},body:bytes}),context);
 assert.equal(captured.isBase64Encoded,true);assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
});
