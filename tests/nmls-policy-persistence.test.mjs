import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { applyNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { startNmlsCourseReview, reduceNmlsReview } from '../lib/nmls-review-runtime.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { executeNmlsReview } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { transactNmlsPolicyReview, validateNmlsPolicyCommand, NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';

test('policy transport rejects browser clocks, replacement state and interval evidence before RPC', async () => {
  const base={kind:'check_access',attemptId:randomUUID(),eventId:randomUUID(),sessionId:randomUUID(),expectedRevision:0,expectedActorRevision:0};
  for (const field of ['studentId','serverTimeMs','ledger','offering','studyInterval','grade','presentation']) {
    assert.throws(()=>validateNmlsPolicyCommand({...base,[field]:{}}),/invalid_policy_request/);
  }
  assert.throws(()=>validateNmlsPolicyCommand({...base,expectedActorRevision:null}),/invalid_policy_request/);
  assert.throws(()=>validateNmlsPolicyCommand({...base,kind:'observe_study'}),/invalid_review_command/);
  await assert.rejects(()=>transactNmlsPolicyReview(base,randomUUID(),{}),/evaluator_not_connected/);
});

test('actor-policy SQL + private transaction transport (disposable PGlite, NOT live approval)', {
  skip:process.env.NMLS_TEST_PGLITE_MODULE?false:'Set NMLS_TEST_PGLITE_MODULE; a skip is not persistence verification.',
},async(t)=>{
  const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db=new PGlite(); t.after(()=>db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for(const file of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql']) {
    await db.exec(readFileSync(new URL(`../database/nmls-private/${file}`,import.meta.url),'utf8'));
  }
  const actor=randomUUID(),other=randomUUID(),course=getNmlsReviewCourse('nmls-2026-f01-private-review');
  await db.query('insert into public.students(id) values($1),($2)',[actor,other]);
  const rpc=async(name,args)=>{
    assert.match(name,/^nmls_(review|policy)_[a-z_]+$/);
    const keys=Object.keys(args);
    assert.ok(keys.every(k=>/^p_[a-z_]+$/.test(k)));
    return (await db.query(`select public.${name}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')}) as result`,Object.values(args))).rows[0].result;
  };
  const now=async()=>Number((await db.query('select floor(extract(epoch from clock_timestamp())*1000) as ms')).rows[0].ms);
  const clockYear=new Date(await now()).getUTCFullYear();
  assert.ok(clockYear>=2026&&clockYear<=2100,'Fixture requires a current supported annual year');
  const offering=(id,overrides={})=>({id,contentDigest:course.digest,educationType:'annual_ce',year:clockYear,
    opensAtMs:Date.UTC(clockYear,0,1),closesAtMs:Date.UTC(clockYear+1,0,1),timeZone:'UTC',
    deadlineBasisId:'synthetic-test-window-not-an-approved-deadline',
    rocs:{version:'4',documentDigest:'c'.repeat(64),fullDocumentVerified:true,evidenceId:'SYNTHETIC-NO-ACTUAL-DOCUMENT'},...overrides});
  async function grant(who=actor){const id=randomUUID(); await db.query(`insert into public.nmls_review_access_grants
    (id,student_id,course_key,content_digest,expires_at,granted_by,evidence) values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC integration only')`,[id,who,course.id,course.digest]);return id;}
  const bind=(id,who=actor,overrides={})=>rpc('nmls_policy_bind',{p_student_id:who,p_grant_id:id,p_policy_id:P.id,p_policy_digest:NMLS_POLICY_DIGEST,p_offering:offering(id,overrides)});
  const startArgs=(id,who=actor)=>({p_student_id:who,p_grant_id:id,p_course_key:course.id,p_content_digest:course.digest,p_initial_runtime:startNmlsCourseReview(course)});
  async function prepared(who=actor,overrides={}){const id=await grant(who);await bind(id,who,overrides);const result=await rpc('nmls_policy_start',startArgs(id,who));return{grantId:id,attemptId:result.attempt.id,who};}
  const context=(f)=>rpc('nmls_policy_context',{p_student_id:f.who,p_attempt_id:f.attemptId});
  const snapshot=async(f)=>({ctx:await context(f),events:(await db.query('select * from public.nmls_review_actor_policy_events where student_id=$1 order by resulting_revision',[f.who])).rows,
    lease:(await db.query('select * from public.nmls_review_study_leases where student_id=$1',[f.who])).rows});
  const stripClock=(s)=>{const c=structuredClone(s);delete c.ctx.serverTimeMs;return c;};
  async function command(f,kind,extra={}){const c=await context(f);return{kind,attemptId:f.attemptId,eventId:randomUUID(),
    expectedRevision:c.attempt.revision,expectedActorRevision:c.actorPolicy?.revision??0,sessionId:c.attempt.runtime.sessionId,...extra};}

  // Test-only composition of the two ACTUAL pure reducers. The production
  // combined engagement evaluator is deliberately NOT implemented by this
  // fixture. No browser/HTTP flow, fake attendance or real ROCS document.
  function evaluator({interval=null}={}) {return ({command:cmd,course,runtime,ledger,offering,evidence})=>{
    const isPolicy=['accept_rocs','begin_break','end_break','check_access'].includes(cmd.kind);
    const policyCommand={kind:interval?'observe_study':cmd.kind==='resume'?'open_session':isPolicy?cmd.kind:'check_access',expectedRevision:ledger.revision};
    if(cmd.kind==='accept_rocs')Object.assign(policyCommand,{version:cmd.version,documentDigest:cmd.documentDigest,acknowledged:cmd.acknowledged});
    const pr=applyNmlsSessionPolicy(ledger,policyCommand,offering,{...evidence,...(interval?{studyInterval:interval(evidence,ledger)}:{})});
    const canStudy=pr.ok&&pr.code==='session_policy_allowed';
    const review=reduceNmlsReview(runtime,{...cmd,kind:cmd.kind==='resume'||cmd.kind==='logout'?cmd.kind:
      !isPolicy&&canStudy?cmd.kind:'policy_control_only'},course,evidence.receivedAtMs);
    const deliveryAllowed=canStudy&&review.outcome.progress.status==='active'&&!isPolicy&&cmd.kind!=='logout';
    const out={...review.outcome,actorRevision:pr.state.revision,policyCode:pr.code,
      deliveryAllowed,deliveryUntilMs:deliveryAllowed?evidence.receivedAtMs+pr.maxNextStudyMs:null};
    if(!deliveryAllowed){out.progress.lessons=[];out.progress.quiz=null;out.progress.feedback=null;}
    return{ledger:pr.state,runtime:review.state,outcome:out,audit:{review:review.audit,policy:pr.audit},deliveryUntilMs:out.deliveryUntilMs};
  };}
  const run=(f,input,deps={})=>transactNmlsPolicyReview(input,f.who,{rpc,courseFor:getNmlsReviewCourse,evaluate:evaluator(),...deps});
  async function act(f,kind,extra={},deps={}){const input=await command(f,kind,extra);return{input,result:await run(f,input,deps)};}
  async function accept(f){await act(f,'resume');const receipt=await rpc('nmls_policy_present_rocs',{p_student_id:f.who,p_attempt_id:f.attemptId,p_document_digest:'c'.repeat(64)});
    await act(f,'accept_rocs',{version:'4',documentDigest:'c'.repeat(64),acknowledged:true,presentationId:receipt.id});await act(f,'resume');return receipt;}

  const f=await prepared(),unbound=await grant();
  await t.test('actual roles cannot bypass internal functions or private tables; own old grants still work',async()=>{
    for(const role of ['anon','authenticated','service_role']){
      await db.exec(`set role ${role}`);
      try{
        for(const table of ['nmls_review_policy_bindings','nmls_review_actor_policy','nmls_review_rocs_presentations','nmls_review_actor_policy_events']){
          await assert.rejects(()=>db.query(`select * from public.${table}`),/permission denied/);
        }
        await assert.rejects(()=>rpc('nmls_review_start_legacy_internal',startArgs(f.grantId)),/permission denied/);
        await assert.rejects(()=>rpc('nmls_review_context_legacy_internal',{p_student_id:actor,p_attempt_id:f.attemptId}),/permission denied/);
        if(role!=='service_role')await assert.rejects(()=>context(f),/permission denied/);
        else {assert.equal((await context(f)).attempt.student_id,actor);await rpc('nmls_review_start',startArgs(unbound));}
      }finally{await db.exec('reset role');}
    }
    assert.deepEqual((await rpc('nmls_review_list',{p_student_id:actor})).map(x=>x.grantId),[unbound]);
    assert.ok((await db.query("select rowsecurity from pg_tables where schemaname='public' and tablename like 'nmls_review_%'")).rows.every(x=>x.rowsecurity));
    await assert.rejects(()=>rpc('nmls_review_start',startArgs(f.grantId)),/policy_flow_required/);
    await assert.rejects(()=>rpc('nmls_review_context',{p_student_id:actor,p_attempt_id:f.attemptId}),/policy_flow_required/);
    await assert.rejects(()=>rpc('nmls_review_start',startArgs(f.grantId,other)),/access_denied/);
    await assert.rejects(()=>rpc('nmls_policy_start',startArgs(f.grantId,other)),/access_denied/);
    await assert.rejects(()=>rpc('nmls_review_context',{p_student_id:other,p_attempt_id:f.attemptId}),/access_denied/);
  });
  await t.test('binding is immutable and refuses already started legacy grants',async()=>{
    await bind(f.grantId);
    await assert.rejects(()=>bind(f.grantId,actor,{closesAtMs:Date.UTC(clockYear,11,1)}),/binding_conflict/);
    await assert.rejects(()=>bind(unbound),/binding_conflict/);
    const legacy=await executeNmlsReview({kind:'start',grantId:unbound,courseKey:course.id},actor,{rpc,courseFor:getNmlsReviewCourse});
    assert.equal(legacy.body.progress.creditIssuanceAllowed,false);
    const resumed=await executeNmlsReview({kind:'resume',attemptId:legacy.body.attemptId,eventId:randomUUID(),expectedRevision:0},actor,{rpc,courseFor:getNmlsReviewCourse});
    const opened=await executeNmlsReview({kind:'open_unit',attemptId:legacy.body.attemptId,eventId:randomUUID(),
      expectedRevision:resumed.body.progress.revision,sessionId:resumed.body.progress.sessionId,unitId:'F01-U01'},actor,{rpc,courseFor:getNmlsReviewCourse});
    assert.equal(opened.body.progress.currentUnitId,'F01-U01');assert.equal(opened.body.progress.lessons.length,1);
  });
  await t.test('ROCS is per offering and its presentation is durable; forged/cross-actor IDs fail',async()=>{
    await act(f,'resume');const c=await context(f);assert.equal(c.actorPolicy.ledger.acceptances.length,0);
    const forged=await command(f,'accept_rocs',{version:'4',documentDigest:'c'.repeat(64),acknowledged:true,presentationId:randomUUID()});
    await assert.rejects(()=>run(f,forged),/presentation_denied/);
    const receipt=await accept(f);assert.equal((await context(f)).actorPolicy.ledger.acceptances[0].presentationId,receipt.id);
    await assert.rejects(()=>rpc('nmls_policy_read_presentation',{p_student_id:other,p_attempt_id:f.attemptId,p_presentation_id:receipt.id}),/access_denied/);
    const f2=await prepared();await act(f2,'resume');
    await assert.rejects(async()=>run(f2,await command(f2,'accept_rocs',{version:'4',documentDigest:'c'.repeat(64),acknowledged:true,presentationId:receipt.id})),/presentation_denied/);
    await act(f,'resume');
  });
  await t.test('attempt + actor CAS, exact replay, actor-wide event-ID conflict and takeover fence',async()=>{
    const opened=await act(f,'open_unit',{unitId:'F01-U01'});
    assert.equal(opened.result.body.deliveryAllowed,true);assert.ok(opened.result.body.progress.lessons.length);
    const old=stripClock(await snapshot(f));
    const duplicate=await run(f,opened.input);
    assert.equal(duplicate.body.duplicate,true);assert.equal(duplicate.body.deliveryAllowed,false);assert.deepEqual(duplicate.body.progress.lessons,[]);
    assert.deepEqual(stripClock(await snapshot(f)),old);
    await assert.rejects(()=>run(f,{...opened.input,unitId:'F01-U02'}),/idempotency_conflict/);
    const stale=await command(f,'check_access');await act(f,'check_access');
    await assert.rejects(()=>run(f,stale),/revision_conflict/);
    const second=await prepared();await accept(second);
    const cross=await command(second,'check_access',{eventId:opened.input.eventId});
    await assert.rejects(()=>run(second,cross),/idempotency_conflict/);
    await assert.rejects(()=>act(f,'check_access'),/session_conflict/);
    await act(f,'resume');
  });
  await t.test('two offerings competing for one actor revision cannot both commit; other actor is independent',async()=>{
    const second=await prepared(),foreign=await prepared(other);
    const c1=await command(f,'resume'),c2=await command(second,'resume');
    const results=await Promise.allSettled([run(f,c1),run(second,c2)]);
    assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
    assert.match(results.find(x=>x.status==='rejected').reason.message,/revision_conflict/);
    await act(foreign,'resume');assert.equal((await context(foreign)).actorPolicy.revision,1);
    await act(f,'resume');
  });
  await t.test('SQL rejects independent stale/null revisions, forged credit and a horizon exceeding the remaining budget',async()=>{
    let captured;
    const capture=async(name,args)=>{if(name==='nmls_policy_commit')captured=structuredClone(args);return rpc(name,args);};
    await act(f,'check_access',{}, {rpc:capture});
    const ctx=await context(f),before=stripClock(await snapshot(f));
    const input=await command(f,'resume');
    const tr=evaluator()({command:input,course,runtime:ctx.attempt.runtime,ledger:ctx.actorPolicy.ledger,
      offering:ctx.binding.offering,evidence:{actorId:actor,receivedAtMs:Number(ctx.serverTimeMs),presentation:null}});
    const args={...captured,p_event_id:input.eventId,p_expected_revision:input.expectedRevision,
      p_expected_actor_revision:input.expectedActorRevision,p_evaluated_at_ms:Number(ctx.serverTimeMs),
      p_ledger:tr.ledger,p_runtime:tr.runtime,p_outcome:tr.outcome,p_audit:tr.audit,p_delivery_until_ms:tr.deliveryUntilMs};
    for(const key of ['p_expected_revision','p_expected_actor_revision']) {
      await assert.rejects(()=>rpc('nmls_policy_commit',{...args,[key]:null}),/revision_conflict/);
      await assert.rejects(()=>rpc('nmls_policy_commit',{...args,[key]:args[key]-1}),/revision_conflict/);
    }
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_ledger:{...tr.ledger,creditIssuanceAllowed:true}}),/invalid_policy_state/);
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_runtime:{...tr.runtime,creditIssuanceAllowed:true}}),/invalid_state/);
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_ledger:{...tr.ledger,studySinceBreakMs:null}}),/invalid_policy_state/);
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_ledger:{...tr.ledger,studySinceBreakMs:P.breakAfterStudyMs-1}}),/invalid_delivery/);
    const rolling=[{start:Number(ctx.serverTimeMs)-P.rollingStudyLimitMs+1,end:Number(ctx.serverTimeMs)}];
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_ledger:{...tr.ledger,studyIntervals:rolling}}),/invalid_delivery/);
    const forgedReceipt={...tr.ledger.acceptances[0],presentationId:randomUUID(),acceptedAtMs:Number(ctx.serverTimeMs)};
    await assert.rejects(()=>rpc('nmls_policy_commit',{...args,p_ledger:{...tr.ledger,acceptances:[...tr.ledger.acceptances,forgedReceipt]}}),/invalid_rocs_receipt/);
    // Internal commit is not invocable even by service_role; old wrapper refuses
    // bound attempts before any mutation. These are actual privilege checks.
    const legacyArgs={p_student_id:actor,p_attempt_id:f.attemptId,p_event_id:input.eventId,p_command_digest:'b'.repeat(64),
      p_expected_revision:input.expectedRevision,p_expected_session_id:input.sessionId,p_evaluated_at_ms:Number(ctx.serverTimeMs),
      p_content_digest:course.digest,p_runtime:tr.runtime,p_outcome:tr.outcome,p_audit:tr.audit.review};
    await assert.rejects(()=>rpc('nmls_review_commit',legacyArgs),/policy_flow_required/);
    await assert.rejects(()=>rpc('nmls_review_commit',{...legacyArgs,p_student_id:other}),/access_denied/);
    await db.exec('set role service_role');
    try{await assert.rejects(()=>rpc('nmls_review_commit_legacy_internal',legacyArgs),/permission denied/);}
    finally{await db.exec('reset role');}
    assert.deepEqual(stripClock(await snapshot(f)),before);
  });
  await t.test('clock-refresh retry preserves intent; late nonduplicate response cannot deliver stale material',async()=>{
    const digests=[];let failed=false;
    const refresh=async(name,args)=>{if(name==='nmls_policy_commit'){digests.push(args.p_command_digest);if(!failed){failed=true;throw new Error('nmls_review_clock_refresh_required');}}return rpc(name,args);};
    await act(f,'check_access',{}, {rpc:refresh});assert.equal(digests.length,2);assert.equal(digests[0],digests[1]);
    const delayed=async(name,args)=>{const result=await rpc(name,args);if(name==='nmls_policy_commit')await new Promise(resolve=>setTimeout(resolve,100));return result;};
    const shortEvaluator=arg=>{const tr=evaluator()(arg);if(tr.outcome.deliveryAllowed){tr.deliveryUntilMs=arg.evidence.receivedAtMs+70;tr.outcome.deliveryUntilMs=tr.deliveryUntilMs;}return tr;};
    const result=await act(f,'open_unit',{unitId:'F01-U01'},{rpc:delayed,evaluate:shortEvaluator});
    assert.equal(result.result.body.duplicate,false);assert.equal(result.result.body.deliveryAllowed,false);assert.deepEqual(result.result.body.progress.lessons,[]);
  });
  await t.test('overshoot exposure persists; idle denial clears only provisional work and keeps actor counters',async()=>{
    await act(f,'open_unit',{unitId:'F01-U01'});
    const c=await context(f),at=await now();
    // Synthetic fixture places the real engine at the boundary without faking
    // six actual hours of participant attendance or waiting in a test suite.
    c.actorPolicy.ledger.studySinceBreakMs=P.breakAfterStudyMs-1;
    c.actorPolicy.ledger.lastStudyAtMs=at-20;c.actorPolicy.ledger.studyBoundaryAtMs=at-20;
    c.actorPolicy.ledger.studyIntervals=[];
    await db.query('update public.nmls_review_actor_policy set ledger=$1 where student_id=$2',[c.actorPolicy.ledger,actor]);
    const before=(await context(f)).actorPolicy.ledger.studySinceBreakMs;
    const r=await act(f,'check_access',{}, {evaluate:evaluator({interval:e=>({start:at-10,end:e.receivedAtMs})})});
    assert.equal(r.result.body.policyCode,'mandatory_break_required');assert.equal(r.result.body.deliveryAllowed,false);
    assert.ok((await context(f)).actorPolicy.ledger.studySinceBreakMs>before);
    const idle=await context(f);idle.attempt.runtime.lastActivityMs=at-360001;idle.attempt.runtime.current.provisionalMs=12345;
    await db.query('update public.nmls_review_attempts set runtime=$1 where id=$2',[idle.attempt.runtime,f.attemptId]);
    const s=(await context(f)).actorPolicy.ledger.studySinceBreakMs;
    const ended=await act(f,'check_access');assert.equal(ended.result.status,401);
    const persisted=await context(f);assert.equal(persisted.attempt.runtime.status,'logged_out');assert.equal(persisted.attempt.runtime.current,null);
    assert.equal(persisted.actorPolicy.ledger.studySinceBreakMs,s);
    assert.equal((await snapshot(f)).lease[0].attempt_id,null);
  });
  await t.test('a failure after attempt write rolls back attempt, actor ledger, lease and both audit tables',async()=>{
    const before=stripClock(await snapshot(f));
    await db.exec(`create function reject_test_policy_event() returns trigger language plpgsql as $$begin raise exception 'synthetic_after_attempt_write';end$$;
      create trigger reject_test_policy_event before insert on public.nmls_review_actor_policy_events for each row execute function reject_test_policy_event();`);
    try{await assert.rejects(()=>act(f,'resume'),/synthetic_after_attempt_write/);}finally{await db.exec('drop trigger reject_test_policy_event on public.nmls_review_actor_policy_events;drop function reject_test_policy_event();');}
    assert.deepEqual(stripClock(await snapshot(f)),before);
    assert.equal((await db.query('select count(*)::int as n from public.nmls_review_attempt_events where attempt_id=$1',[f.attemptId])).rows[0].n,before.ctx.attempt.revision);
  });
  await t.test('cutoff crossing during commit rejects successful non-delivery action and exact same intent retries safely',async()=>{
    const cut=await now()+500,yearEnd=Date.UTC(clockYear+1,0,1);
    assert.ok(cut<yearEnd);
    const short=await prepared(other,{closesAtMs:cut});await act(short,'resume');
    const receipt=await rpc('nmls_policy_present_rocs',{p_student_id:other,p_attempt_id:short.attemptId,p_document_digest:'c'.repeat(64)});
    const input=await command(short,'accept_rocs',{version:'4',documentDigest:'c'.repeat(64),acknowledged:true,presentationId:receipt.id});
    const before=stripClock(await snapshot(short));
    // Deterministic SQL-stage delay after legacy attempt persistence. This tests
    // final clock sampling, not multi-connection lock contention (PGlite is one).
    await db.exec(`create function delay_test_policy_event() returns trigger language plpgsql as $$begin
      while floor(extract(epoch from clock_timestamp())*1000)<=${cut+10} loop end loop; return new;end$$;
      create trigger delay_test_policy_event before insert on public.nmls_review_actor_policy_events for each row execute function delay_test_policy_event();`);
    try{await assert.rejects(()=>run(short,input,{clockRetries:0}),/clock_refresh_required/);}finally{
      await db.exec('drop trigger delay_test_policy_event on public.nmls_review_actor_policy_events;drop function delay_test_policy_event();');}
    assert.deepEqual(stripClock(await snapshot(short)),before);
    const retry=await run(short,input);assert.equal(retry.body.policyCode,'delivery_window_closed');
    assert.equal((await context(short)).actorPolicy.ledger.acceptances.some(x=>x.offeringId===short.grantId),false);
    const open=await prepared(other);await accept(open);const held=stripClock(await snapshot(open));
    await assert.rejects(()=>act(short,'resume'),/invalid_delivery/);
    assert.deepEqual(stripClock(await snapshot(open)),held,'closed offering cannot steal an active course lease');
  });
  await t.test('idle boundary crossing during SQL work rolls back and refreshed refusal persists logout',async()=>{
    // f remains over the break threshold, so this also exercises a policy denial
    // at the six-minute boundary, without permitting hidden assessment delivery.
    await act(f,'resume');const ctx=await context(f),boundary=await now()+300;
    ctx.attempt.runtime.lastActivityMs=boundary-360000;
    await db.query('update public.nmls_review_attempts set runtime=$1 where id=$2',[ctx.attempt.runtime,f.attemptId]);
    const input=await command(f,'check_access'),before=stripClock(await snapshot(f));
    await db.exec(`create function delay_test_idle_event() returns trigger language plpgsql as $$begin
      while floor(extract(epoch from clock_timestamp())*1000)<=${boundary+5} loop end loop;return new;end$$;
      create trigger delay_test_idle_event before insert on public.nmls_review_actor_policy_events for each row execute function delay_test_idle_event();`);
    try{await assert.rejects(()=>run(f,input,{clockRetries:0}),/clock_refresh_required/);}finally{
      await db.exec('drop trigger delay_test_idle_event on public.nmls_review_actor_policy_events;drop function delay_test_idle_event();');}
    assert.deepEqual(stripClock(await snapshot(f)),before);
    const retry=await run(f,input);assert.equal(retry.status,401);assert.equal((await context(f)).attempt.runtime.status,'logged_out');
  });
  await t.test('grant revocation closes context, writes and exact-event replay',async()=>{
    await act(f,'resume');const previous=await act(f,'check_access');
    await db.query("update public.nmls_review_access_grants set status='revoked' where id=$1",[f.grantId]);
    await assert.rejects(()=>run(f,previous.input),/access_denied/);
  });
});
