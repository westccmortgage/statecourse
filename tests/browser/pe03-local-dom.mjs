// LOCAL JSDOM/controller acceptance with real loopback HTTP and embedded PGlite.
// Not rendered-browser, Supabase Auth, full production schema or concurrent PG proof.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {pe03Fixture,ids} from '../helpers/pe03-fixture.mjs';
import {createPe03Handler} from '../../netlify/functions/_lib/nmls-pe-http.mjs';
const {JSDOM}=await import(pathToFileURL(process.env.PE_JSDOM_MODULE));
const f=await pe03Fixture();await f.enable();
await f.db.exec("update pe03_cohorts set timezone='UTC',opens_at=date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',closes_at=(date_trunc('day',clock_timestamp() at time zone 'UTC')+interval '14 days') at time zone 'UTC'; create or replace function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select clock_timestamp()$$;");
const report={engine:'PGlite embedded PostgreSQL + JSDOM + real loopback HTTP',productionTouched:false,renderedBrowser:false,auth:'synthetic identities, actual application handler and SQL',checks:[],timing:[]};
const out=path.resolve('artifacts/pe-cohort/dom');await fs.mkdir(out,{recursive:true});
let origin,drop=false;const windows=[];
const handler=role=>createPe03Handler(role,{enabled:()=>true,rpc:f.rpc,authenticate:async event=>({student:{id:ids[event.headers['x-fixture-actor']]}})});
const student=handler('student'),teacher=handler('instructor');
const server=createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks);const response=await(req.url.includes('/admin/')?teacher:student)(new Request(origin+req.url,{method:req.method,headers:req.headers,body,duplex:'half'}));if(drop&&JSON.parse(body).operation==='submit'){drop=false;res.destroy();return;}res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500).end(JSON.stringify({error:e.message}));}});
const until=async(fn,ms=10000)=>{const start=Date.now();while(!fn()){if(Date.now()-start>ms)throw new Error('UI condition timeout');await new Promise(r=>setTimeout(r,25));}};
const html=await fs.readFile(new URL('../../public/statecourse/student/pe03/index.html',import.meta.url),'utf8');
const script=await fs.readFile(new URL('../../public/statecourse/student/pe03/pe03.mjs',import.meta.url),'utf8');
async function page(actor,stored={}){
 let exportBlob=null;
 const dom=new JSDOM(html,{url:`${origin}/student/pe03/?cohort=${ids.cohort}${actor==='instructor'?'&role=instructor':''}`,runScripts:'outside-only',pretendToBeVisual:true});windows.push(dom.window);const w=dom.window;
 w.Blob=Blob;w.URL.createObjectURL=blob=>{exportBlob=blob;return 'blob:synthetic-local-export';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 Object.defineProperty(w.crypto,'randomUUID',{value:randomUUID});Object.defineProperty(w.document,'hasFocus',{value:()=>true});
 w.fetch=(url,options)=>fetch(new URL(url,origin),{...options,headers:{...options.headers,origin,'x-fixture-actor':actor}});
 for(const [key,value]of Object.entries(stored))w.sessionStorage.setItem(key,value);
 w.eval(script);await until(()=>!w.document.getElementById('activity').hidden);
 return {w,exported:()=>exportBlob,$:id=>w.document.getElementById(id),stored:()=>Object.fromEntries(Object.keys(w.sessionStorage).map(k=>[k,w.sessionStorage.getItem(k)]))};
}
try{
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;process.env.STATECOURSE_BASE_URL=origin;
 let a=await page('a');assert.equal(a.$('send').disabled,true);
 const qualify=async(p,actor)=>{const start=Date.now();p.$('study').click();await until(()=>p.$('progress').textContent.includes('initial-submission'),60000);p.$('study').click();await until(()=>!p.$('study').disabled);const state=await f.state(ids[actor]);report.timing.push({actor,wallMs:Date.now()-start,observedMs:state.observedMs});assert.ok(state.observedMs>=30000&&state.observedMs<=Date.now()-start+1000);};
 // Browser lifecycle flags are explicitly simulated by JSDOM, not claimed as rendered QA.
 a.$('study').click();await until(()=>a.$('study').textContent==='Take a break'&&!a.$('study').disabled);
 Object.defineProperty(a.w.navigator,'onLine',{configurable:true,value:false});a.w.dispatchEvent(new a.w.Event('offline'));await new Promise(r=>setTimeout(r,1200));
 Object.defineProperty(a.w.navigator,'onLine',{configurable:true,value:true});a.w.dispatchEvent(new a.w.Event('online'));assert.equal(a.$('study').textContent,'Start observed work');assert.equal((await f.state(ids.a)).observedMs,0);
 a.$('study').click();await until(()=>a.$('study').textContent==='Take a break'&&!a.$('study').disabled);Object.defineProperty(a.w.document,'visibilityState',{configurable:true,value:'hidden'});a.w.document.dispatchEvent(new a.w.Event('visibilitychange'));await until(()=>!a.$('study').disabled);Object.defineProperty(a.w.document,'visibilityState',{configurable:true,value:'visible'});a.w.document.dispatchEvent(new a.w.Event('visibilitychange'));assert.equal((await f.state(ids.a)).observedMs,0);
 report.checks.push('Simulated hidden and true-offline flags pause without backfilling the gap on reconnect');
 await qualify(a,'a');a.$('response').value='E01 is borrower-reported. E03 has a missing page. Ask for the complete checking statement and distinguish it from E04 savings.';a.$('response').dispatchEvent(new a.w.Event('input'));drop=true;a.$('contribution').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await until(()=>a.$('status').textContent.includes('response was interrupted'));
 const stored=a.stored();a.w.close();a=await page('a',stored);await until(()=>a.$('status').textContent.includes('Server record saved'));assert.equal((await f.db.query("select count(*)::int n from pe03_events where kind='submit' and actor_id=$1",[ids.a])).rows[0].n,1);assert.match(a.$('response').value,/E01 is borrower/);
 report.checks.push('Actual wall-clock observation; premature submit disabled; dropped committed response recovers once after a fresh DOM reload, preserving draft');
 const b=await page('b');await qualify(b,'b');b.$('response').value='Distinguish E01 claims from E04 evidence. Request missing E03 checking pages before concluding the available funds are verified.';b.$('contribution').dispatchEvent(new b.w.Event('submit',{cancelable:true}));await until(()=>b.$('progress').textContent.includes('peer-dialogue')&&!b.$('send').disabled);
 b.$('response').value='Your document request is clear. Please distinguish the reported checking amount from the documented savings and explain why the incomplete page matters.';b.$('contribution').dispatchEvent(new b.w.Event('submit',{cancelable:true}));await until(()=>b.$('evidence').textContent.includes('peer')&&b.$('retry').hidden);
 const instructor=await page('instructor');instructor.$('response').value='Keep the original reasoning. Address the peer observation and explain the E10 change while preserving unresolved checking evidence. Avoid any approval promise.';instructor.$('contribution').dispatchEvent(new instructor.w.Event('submit',{cancelable:true}));await until(()=>instructor.$('evidence').textContent.includes('feedback')&&instructor.$('retry').hidden);
 a.$('refresh').click();await until(()=>a.$('progress').textContent.includes('Stage: revision'));assert.match(a.$('materials').textContent,/E10/);
 a.$('response').value='Revision responding to the assigned instructor and peer: preserve E01 claims and E04 evidence separately. E10 changes debt analysis, while incomplete E03 checking evidence remains an open request. No approval is promised.';a.$('contribution').dispatchEvent(new a.w.Event('submit',{cancelable:true}));await until(()=>a.$('progress').textContent.includes('revised-noncredit')&&a.$('retry').hidden);
 report.checks.push('Two synthetic learner submissions, distinct peer response, assigned instructor feedback and final learner revision through controller/HTTP/PGlite');
 const before=(await f.state(ids.a)).observedMs;assert.equal(a.$('study').disabled,true);
 a.w.dispatchEvent(new a.w.Event('offline'));a.w.dispatchEvent(new a.w.PageTransitionEvent('pageshow',{persisted:true}));await until(()=>a.$('progress').textContent.includes('revised-noncredit'));assert.equal(a.$('study').textContent,'Start observed work');assert.equal((await f.state(ids.a)).observedMs,before);
 report.checks.push('Observation is server-closed after initial submission; offline/persisted-pageshow do not auto-resume (lifecycle simulated, not browser Back/Forward verified)');
 instructor.$('export').click();await until(()=>instructor.exported()!==null);const evidence=JSON.parse(await instructor.exported().text());report.checks.push('Read-only export button traverses actual HTTP and produces a parseable scoped NONCREDIT evidence file');await fs.writeFile(path.join(out,'synthetic-cohort-evidence.json'),JSON.stringify(evidence,null,2));
 assert.equal(evidence.evidence.filter(e=>e.kind==='revise').length,1);assert.equal(evidence.creditEligible,false);
 await fs.writeFile(path.join(out,'rendered-dom.html'),a.w.document.documentElement.outerHTML);
 report.completed=true;
}finally{for(const w of windows)w.close();await new Promise(resolve=>server.close(resolve));await f.db.close();report.finished=new Date().toISOString();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
