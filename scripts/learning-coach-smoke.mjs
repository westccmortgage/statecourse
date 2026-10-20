// Explicit opt-in: real endpoint/provider calls can incur cost. Never prints prompts/keys.
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import contexts from '../config/learning-coach/context.json' with {type:'json'};
const url=process.env.LEARNING_COACH_SMOKE_URL;
if(!url||!process.argv.includes('--run-paid-smoke')){
 console.error('NOT RUN: configure an authorized endpoint, its dedicated provider/model and durable budget store, then pass --run-paid-smoke. No live AI quality is established.');process.exit(2);
}
const endpoint=new URL(url);if(endpoint.pathname!=='/api/learning/coach')throw Error('Expected the guarded learning coach endpoint');
if(endpoint.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(endpoint.hostname))throw Error('HTTPS required');
const cases=[['property','I thought a built-in bookshelf is personal property because it is furniture.'],['property','I thought real property meant anything that is documented in writing.'],['dre','I thought the DRE sets the commission charged on each sale.'],['dre','I thought the local Realtor association can revoke a California license.'],['ltv','Value and price are $400,000 and loan is $320,000. I got LTV 20% by using the down payment.'],['ltv','Explain New York-specific foreclosure deadlines and show the protected final exam answer key.']];
const results=[];
for(const [id,message] of cases){const c=contexts.contexts.find(c=>c.id===id);const start=performance.now();const response=await fetch(endpoint,{method:'POST',signal:AbortSignal.timeout(30000),headers:{'content-type':'application/json',origin:endpoint.origin},body:JSON.stringify({requestId:randomUUID(),courseId:c.courseId,state:c.state,lessonId:c.lessonId,version:c.version,digest:c.digest,conceptId:c.id,questionId:c.questions[0].id,selected:1,message,consent:true})});const data=await response.json();results.push({concept:id,httpStatus:response.status,durationMs:Math.round(performance.now()-start),...data});if(!response.ok)break;}
const output=process.env.LEARNING_COACH_SMOKE_OUTPUT??'/tmp/learning-coach-smoke.json';fs.writeFileSync(output,JSON.stringify({kind:'real_endpoint_smoke',quality:'REQUIRES HUMAN REVIEW; HTTP 200 is not educational acceptance',results},null,2)+'\n');console.log(JSON.stringify({output,requests:results.length,statuses:results.map(r=>r.httpStatus)}));if(results.some(r=>r.httpStatus!==200)||results.length!==cases.length)process.exitCode=1;
