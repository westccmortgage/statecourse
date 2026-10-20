import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import contexts from '../../config/learning-coach/context.json' with {type:'json'};
import {validateAnswer,resolveContext} from '../../netlify/functions/_lib/learning-coach.mjs';
import library from '../../config/learning-coach/library.json' with {type:'json'};
import {providers} from './providers.mjs';
import {cases} from './cases.mjs';
import {portfolioCases} from './portfolio-cases.mjs';

export function makeInput(item){
 let c=contexts.contexts.find(c=>c.id===item.concept);
 if(item.contextId){const l=library.lessons.find(l=>l.id===item.contextId);if(!l)throw Error('unknown_case_context');c=resolveContext({requestId:'11111111-1111-4111-8111-111111111111',courseId:l.courseId,state:l.state,lessonId:l.lessonId,version:l.version,digest:l.digest,conceptId:l.id,message:item.message,consent:true},{allowPrivate:true}).context;}
 if(!c)throw Error('unknown_case_context');
 return {context:c,input:{context:{state:c.state,discipline:c.discipline??'real_estate',course:c.courseId,lesson:c.lessonId,version:c.version,digest:c.digest,concept:c.title},sources:c.sources.map(({id,excerpt})=>({id,excerpt})),learnerMessage:item.message,practice:null}};
}
export function assess(answer,context,item){
 validateAnswer(answer,context);
 return {schemaAndSourceIds:'pass',expectedStatus:item.expected,observedStatus:answer.status,statusMatch:item.expected==='review'?null:answer.status===item.expected,humanReview:'REQUIRED: factual correctness, source support, teaching quality, arithmetic, and appropriate refusal'};
}
export async function run({live=false,output,env=process.env,suite='pilot'}={}){
 if(!output)throw Error('output_path_required');
 if(!['pilot','portfolio'].includes(suite))throw Error('unknown_suite');const selectedCases=suite==='portfolio'?portfolioCases:cases;
 const report={createdAt:new Date().toISOString(),kind:live?'live_comparison':'offline_readiness',suite,qualityVerdict:'NOT ESTABLISHED',cases:selectedCases.length,results:[]};
 // Fresh exclusive output prevents accidental overwriting/re-running a paid run.
 fs.mkdirSync(path.dirname(output),{recursive:true});const fd=fs.openSync(output,'wx',0o600);
 const save=()=>{fs.ftruncateSync(fd,0);fs.writeSync(fd,JSON.stringify(report,null,2)+'\n',0,'utf8');fs.fsyncSync(fd);};
 try{
  for(const [name,provider] of Object.entries(providers)){
   const prefix=name.toUpperCase(),key=env[`${prefix}_API_KEY`],model=env[`COMPARE_${prefix}_MODEL`];
   const row={provider:name,model:model??null,keyPresent:Boolean(key),status:'not_run',items:[]};report.results.push(row);save();
   if(!live){row.status='offline_only';continue;}
   if(!key||!model){row.status='missing_configuration';continue;}
   // Explicit verified price ceiling is mandatory. Reserve full upper bounds even on errors.
   const inputRate=Number(env[`COMPARE_${prefix}_INPUT_RATE`]),outputRate=Number(env[`COMPARE_${prefix}_OUTPUT_RATE`]);
   if(![inputRate,outputRate].every(x=>Number.isFinite(x)&&x>0)){row.status='missing_verified_prices';continue;}
   const reserve=(16000*inputRate+800*outputRate)/1e6;
   if(reserve*selectedCases.length>0.5){row.status='exceeds_provider_budget_0_50_usd';continue;}
   row.maximumReservedUsd=reserve*selectedCases.length;row.status='running';save();
   for(const item of selectedCases){
    const {context,input}=makeInput(item);
    if(Buffer.byteLength(JSON.stringify(input))>14000)throw Error('context_too_large');
    const record={caseId:item.id,context:{course:context.courseId,lesson:context.lessonId,version:context.version,digest:context.digest},status:'reserved',reservedUsd:reserve};row.items.push(record);save();
    const start=performance.now();
    try{const result=await provider({apiKey:key,model,input});Object.assign(record,{status:'completed',durationMs:Math.round(performance.now()-start),answer:result.answer,usage:result.usage,checks:assess(result.answer,context,item)});}
    catch{record.status='failed';record.durationMs=Math.round(performance.now()-start);row.status='stopped_after_failure';save();break;}
    save();
   }
   if(row.status==='running')row.status='completed_requires_human_review';
  }
  save();return report;
 }finally{fs.closeSync(fd);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const live=process.argv.includes('--live'),index=process.argv.indexOf('--output');
 const output=index>=0?process.argv[index+1]:null;
 const suiteIndex=process.argv.indexOf('--suite'),suite=suiteIndex>=0?process.argv[suiteIndex+1]:'pilot';
 const report=await run({live,output,suite});console.log(JSON.stringify({output,kind:report.kind,suite:report.suite,cases:report.cases,providers:report.results.map(({provider,status})=>({provider,status}))}));
 if(live&&report.results.some(r=>r.status!=='completed_requires_human_review'))process.exitCode=2;
}
