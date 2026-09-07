import test from 'node:test';
import assert from 'node:assert/strict';
import {servePublicAssets} from '../worker/public-assets.mjs';
const origin='https://statecourse-course.crdpartners2020.chatgpt.site';
test('both namespaces resolve pages, CSS, JS, lesson files and JSON to the same assets',async()=>{
 for(const route of ['/','/national.css','/free-practice.js','/free-practice/','/real-estate/michigan/','/free-practice/courses/example.json','/free-practice/lessons/example/module-01.md'])
 for(const prefix of ['','/statecourse']){
  let requested;
  const result=await servePublicAssets(new Request(origin+prefix+route+'?v=123'),{fetch:async r=>{requested=new URL(r.url);return new Response('actual asset');}});
  const expected='/statecourse'+(route.endsWith('/')?route+'index.html':route);
  assert.equal(requested.pathname,expected);assert.equal(requested.search,'?v=123');assert.equal(await result.text(),'actual asset');
 }
});
test('operational HTML goes to canonical backend, not CSS or practice content',async()=>{
 for(const route of ['/student/','/student/sign-in/','/statecourse/admin/','/enroll/index.html','/payment/success/']){
  const r=await servePublicAssets(new Request(origin+route+'?returnTo=test'),null);
  assert.equal(r.status,302);assert.equal(r.headers.get('location'),'https://statecourse.com'+route.replace(/^\/statecourse/,'')+'?returnTo=test');
 }
});
test('API, auth, image routes and mutations never enter the static asset resolver',async()=>{
 const assets={fetch:()=>{throw Error('must not fetch static asset');}};
 for(const route of ['/api/student/course','/.netlify/functions/stripe-webhook','/_vinext/image','/_next/file','/auth/login','/_auth/session'])
  assert.equal(await servePublicAssets(new Request(origin+route),assets),null);
 for(const method of ['POST','PUT','DELETE'])
  assert.equal(await servePublicAssets(new Request(origin+'/free-practice/',{method}),assets),null);
});
test('missing pages fall through, known oversized videos use canonical delivery only',async()=>{
 const assets={fetch:async()=>new Response('missing',{status:404})};
 assert.equal(await servePublicAssets(new Request(origin+'/missing/'),assets),null);
 const media=await servePublicAssets(new Request(origin+'/statecourse/media/statecourse-intro.mp4'),assets);
 assert.equal(media.headers.get('location'),'https://statecourse.com/media/statecourse-intro.mp4');
 assert.equal(await servePublicAssets(new Request('https://statecourse.com/media/statecourse-intro.mp4'),assets),null);
 assert.equal(await servePublicAssets(new Request(origin+'/national.css'),null),null);
});
