import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot, ACTOR, SESSION, ENROLLMENT, OTHER, ORGANIZATION, PROOF } from './fixtures.mjs';
import { executors } from './executors.mjs';
import { candidatesFrom } from '../findings.mjs';
import { explainSnapshot, prepare } from '../engine.mjs';
import { createReadOnlyApi } from '../api.mjs';
import { createSupabaseVerifier } from '../auth.mjs';
import { COURSE_ID } from '../contract.mjs';
import { closeTheNetwork } from '../../upstream/workers/core-v2/kernel/network-guard.ts';
const guard=closeTheNetwork();
test.after(()=>{assert.equal(guard.tripped(),0);});
const issue=()=>snapshot(t=>{t.access_grants=[];});
test('package component payment is found; training and pinned historical version are not errors',()=>{
 assert.deepEqual(candidatesFrom(snapshot()),[]);
 const s=snapshot(t=>{t.enrollments[0].enrollment_origin='purchase';t.payment_enrollments=[{payment_id:OTHER,enrollment_id:ENROLLMENT,course_id:COURSE_ID,allocated_amount:'1000',is_primary:false}];t.payments=[{id:OTHER,enrollment_id:OTHER,course_id:'ca-real-estate-practice-45',status:'paid'}];});
 assert.deepEqual(candidatesFrom(s),[]);
});
test('field anchors name captured records and absence names a complete result',()=>{
 const c=candidatesFrom(issue())[0];assert.equal(c.code,'active_access_missing');
 assert.deepEqual(c.evidence[0].key,{id:ENROLLMENT});assert.equal(c.evidence[0].field,'status');
 assert.equal(c.evidence[1].rowCount,0);assert.equal(c.evidence[1].snapshotHash,issue().snapshotHash);
 assert.throws(()=>candidatesFrom({...issue(),snapshotHash:'0'.repeat(64)}),/integrity/);
});
test('real Core scheduler: two blind readers plus separate critic produce accepted observations',async()=>{
 const result=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createExecutors:executors()});
 assert.equal(result.status,'verified_observations',JSON.stringify(result.trace));
 assert.equal(result.observations[0].verification,'accepted');
 assert.ok(result.trace.assessments.some(a=>a.assessment==='supports'));
 const domains=new Set(result.trace.attempts.filter(a=>a.executorFamily!=='deterministic').map(a=>a.independenceDomain));
 assert.equal(domains.size,3);
});
test('silence is not verification; copied executor aliases and invented readings fail closed',async()=>{
 const pending=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createExecutors:executors({silentCritic:true})});
 assert.equal(pending.status,'needs_human_review');assert.equal(pending.observations[0].acceptedClaimIds.length,0);
 await assert.rejects(()=>explainSnapshot(issue(),{organizationId:ORGANIZATION,createExecutors:executors({aliasReaders:true})}),/independent/);
 const wrong=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createExecutors:executors({wrongReading:true})});
 assert.equal(wrong.observations[0].verification,'needs_human_review');
});
test('material resolver denies a different source/hash/segment and locator',async()=>{
 const world=prepare(issue(),ORGANIZATION),s=world.manifest.sources[0],m=world.material.get(s.sourceId);
 const ref={sourceId:s.sourceId,segmentId:m.segmentId,contentHash:s.contentHash,locator:{}};
 assert.equal((await world.resolver.resolve([ref]))[0].content.text,m.text);
 for(const patch of [{sourceId:OTHER},{segmentId:OTHER},{contentHash:'0'.repeat(64)},{locator:{offset:1}}]) await assert.rejects(()=>world.resolver.resolve([{...ref,...patch}]),/scope_or_hash/);
});
function request(body={courseId:COURSE_ID,enrollmentId:ENROLLMENT},headers={}) {return new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{origin:'https://statecourse.invalid','content-type':'application/json',authorization:'Bearer verified-token','x-statecourse-staff-proof':PROOF,...headers},body:JSON.stringify(body)});}
function api(overrides={}) {return createReadOnlyApi({enabled:true,organizationId:ORGANIZATION,allowedOrigin:'https://statecourse.invalid',verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),reader:{read:async()=>issue(),reauthorize:async()=>true},createExecutors:executors(),...overrides});}
test('API denies disabled, wrong origin, missing proof, client authority and wrong course',async()=>{
 assert.equal((await api({enabled:false})(request())).status,503);
 assert.equal((await api()(request(undefined,{origin:'https://attacker.invalid'}))).status,403);
 assert.equal((await api()(request(undefined,{'x-statecourse-staff-proof':''}))).status,401);
 assert.equal((await api()(request({courseId:COURSE_ID,enrollmentId:ENROLLMENT,actorRole:'owner'}))).status,400);
 assert.equal((await api()(request({courseId:'tx-law-of-agency-30-v1',enrollmentId:ENROLLMENT}))).status,400);
});
test('API delivers evidence and rechecks authority after analysis; does not leak database errors',async()=>{
 let checked=0;
 const response=await api({reader:{read:async()=>issue(),reauthorize:async()=>{checked++;}}})(request());
 assert.equal(response.status,200);assert.equal(checked,1);assert.match(response.headers.get('cache-control'),/no-store/);
 assert.equal((await response.json()).observations[0].evidence[0].field,'status');
 const denied=await api({reader:{read:async()=>{throw new Error('secret-connection-string');}}})(request());
 assert.equal(denied.status,503);assert.equal((await denied.text()).includes('secret'),false);
 const revoked=await api({reader:{read:async()=>issue(),reauthorize:async()=>{throw new Error('revoked');}}})(request());assert.equal(revoked.status,503);
});
test('Supabase auth must approve original bearer before session claims are trusted',async()=>{
 const token=(claims)=>'header.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.signature';
 const claims={sub:ACTOR,session_id:SESSION,aal:'aal2',exp:Math.floor(Date.now()/1000)+60};
 let calls=0;
 const verify=createSupabaseVerifier({url:'https://auth.invalid/',publishableKey:'public-fixture',fetch:async(url,options)=>{calls++;assert.equal(url.pathname,'/auth/v1/user');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');return new Response(JSON.stringify({id:ACTOR}));}});
 assert.deepEqual(await verify(token(claims)),{userId:ACTOR,sessionId:SESSION});
 await assert.rejects(()=>verify(token({...claims,aal:'aal1'})),/mfa/);
 await assert.rejects(()=>verify(token({...claims,exp:1})),/mfa/);
 const refused=createSupabaseVerifier({url:'https://auth.invalid/',publishableKey:'fixture',fetch:async()=>new Response('',{status:401})});
 await assert.rejects(()=>refused(token(claims)),/authentication/);assert.equal(calls,3);
});
test('latest evidence and reviewer events supersede earlier states without creating duplicate work',()=>{
 const s=snapshot(t=>{
  t.console_evidence_events=[
   {id:OTHER,event_order:1,area:'regulatory',evidence_key:'approval',status:'missing'},
   {id:ENROLLMENT,event_order:2,area:'regulatory',evidence_key:'approval',status:'verified',expires_at:'2027-01-01T00:00:00Z'},
  ];
  t.console_review_findings=[
   {id:OTHER,event_order:1,course_version:'1.0',finding_key:OTHER,status:'open',content_hash:'a'.repeat(64)},
   {id:ENROLLMENT,event_order:2,course_version:'1.0',finding_key:OTHER,status:'signed_off',content_hash:'a'.repeat(64)},
  ];
 });assert.deepEqual(candidatesFrom(s),[]);
 const expired=snapshot(t=>{t.console_evidence_events=[{id:OTHER,event_order:1,area:'regulatory',evidence_key:'approval',status:'verified',expires_at:'2026-01-01T00:00:00Z'}];});
 const c=candidatesFrom(expired)[0];assert.equal(c.code,'existing_evidence_expired');assert.equal(c.evidence[1].field,'expires_at');
});
test('review confirmation must match the enrollment release hash and latest review, not another release',()=>{
 const s=snapshot(t=>{
  t.enrollments[0].console_content_release_id=OTHER;
  t.console_course_releases=[{id:OTHER,course_id:COURSE_ID,content_hash:'a'.repeat(64)}];
  t.console_course_reviews=[{id:ENROLLMENT,content_hash:'a'.repeat(64),outcome:'pass'},{id:OTHER,content_hash:'a'.repeat(64),outcome:'fail'},{id:ACTOR,content_hash:'b'.repeat(64),outcome:'pass'}];
 });assert.equal(candidatesFrom(s)[0].code,'release_review_not_passed');
});
test('API refuses oversize bodies and unsupported methods without analysis',async()=>{
 assert.equal((await api()(request({courseId:COURSE_ID,enrollmentId:ENROLLMENT,padding:'x'.repeat(2000)}))).status,413);
 const get=new Request('https://core.invalid/v1/statecourse/observations');assert.equal((await api()(get)).status,405);
});
