import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { executeNmlsTraining, validateNmlsTrainingInput, nmlsTrainingPublicError,
  NMLS_TRAINING_COURSE_ID, NMLS_TRAINING_COURSE_VERSION, NMLS_TRAINING_SOURCE_KEY } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

// Actual unchanged authored source and assessment bank. Only the RPC persistence
// and server clock are synthetic here; no human timing/CE evidence is implied.
const course = getNmlsReviewCourse(NMLS_TRAINING_SOURCE_KEY), definition = getNmlsDraftFinalDefinition(course.id);
function fixture(reviewRole = null) {
  const actor = randomUUID(), enrollment = randomUUID(), events = new Map();
  let now = Date.UTC(2026, 8, 13), revision = 0, runtime = null, active = true, fault = null;
  const calls = [];
  const context = eventId => ({ enrollmentId: enrollment, studentId: actor, courseId: NMLS_TRAINING_COURSE_ID,
    courseVersion: NMLS_TRAINING_COURSE_VERSION, reviewRole, contentDigest: course.digest, definitionDigest: definition.digest,
    revision, runtime: structuredClone(runtime), serverTimeMs: now, event: structuredClone(events.get(eventId) || null) });
  const rpc = async (name, p) => {
    calls.push({ name, params: structuredClone(p) });
    assert.equal(p.p_student_id, actor); assert.equal(p.p_enrollment_id, enrollment);
    if (!active) throw Error('nmls_training_access_denied');
    if (name === 'nmls_training_context') return context(p.p_event_id);
    assert.equal(name, 'nmls_training_commit');
    const old = events.get(p.p_event_id);
    if (old) {
      if (old.command_digest !== p.p_command_digest) throw Error('nmls_training_idempotency_conflict');
      return { ...context(p.p_event_id), replayed: true };
    }
    if (p.p_expected_revision !== revision) throw Error('nmls_training_revision_conflict');
    if (fault) { const e = fault; fault = null; throw Error(e); }
    assert.equal(p.p_runtime.revision, revision + 1);
    revision++; runtime = structuredClone(p.p_runtime);
    events.set(p.p_event_id, { command_digest: p.p_command_digest, audit: structuredClone(p.p_audit) });
    return { ...context(p.p_event_id), replayed: false };
  };
  const input = (operation, extra = {}) => ({ operation, command: { enrollmentId: enrollment,
    ...(operation === 'snapshot' ? {} : { eventId: randomUUID(), expectedRevision: revision }), ...extra } });
  const run = (operation, extra) => executeNmlsTraining(input(operation, extra), actor, { rpc });
  const teaching = (kind, extra = {}) => {
    const s = runtime?.phase === 'remediation' ? runtime.remediation.runtime : runtime?.source;
    return run('teaching', { action: { kind, sessionId: s?.sessionId || null, ...extra } });
  };
  return { actor, enrollment, rpc, run, input, teaching, calls, events, get runtime() { return runtime; },
    get revision() { return revision; }, tick(ms = 1) { now += ms; }, revoke() { active = false; },
    fault(code) { fault = code; }, mutate(fn) { fn(runtime); } };
}

async function complete(h, content) {
  let response = await h.teaching('resume'); assert.equal(response.status, 200);
  for (const module of content.modules) {
    for (const unit of module.units) {
      h.tick(); response = await h.teaching('open_unit', { unitId: unit.id }); assert.equal(response.body.code, 'unit_open');
      const lesson = response.body.progress.lessons.find(l => l.id === unit.id);
      assert.equal(lesson.content, unit.content); assert.equal(lesson.question.stem, unit.actionQuestion.stem);
      assert.equal(Object.hasOwn(lesson.question, 'correctChoice'), false);
      response = await h.teaching('interaction', { visible: true, observation: 'keyboard' });
      let remaining = unit.requiredSeconds * 1000;
      while (remaining) {
        const span = Math.min(remaining, 30_000); h.tick(span);
        response = await h.teaching('interaction', { visible: true, observation: 'scroll' });
        assert.equal(response.status, 200); remaining -= span;
      }
      h.tick(); response = await h.teaching('unit_action', { choice: unit.actionQuestion.correctChoice }); assert.equal(response.status, 200);
      h.tick(); response = await h.teaching('complete_unit'); assert.equal(response.body.code, 'unit_review_complete');
    }
    h.tick(); response = await h.teaching('quiz_start', { moduleId: module.id });
    const quiz = response.body.progress.quiz; assert.ok(quiz);
    const snapshot = await h.run('snapshot');
    assert.equal(snapshot.body.progress.quiz, null); assert.equal(snapshot.body.progress.sessionId, null);
    assert.deepEqual(snapshot.body.progress.lessons, []);
    const privateQuiz = h.runtime.phase === 'remediation' ? h.runtime.remediation.runtime.quiz : h.runtime.source.quiz;
    assert.equal(privateQuiz.id, quiz.id); // a read neither takes over nor redraws
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, module.quiz.bank.find(item => item.id === q.id).correctChoice]));
    h.tick(); response = await h.teaching('quiz_submit', { quizId: quiz.id, answers }); assert.equal(response.body.code, 'module_review_passed');
  }
  assert.equal(response.body.progress.status, 'review_complete');
  assert.equal(response.body.progress.completedPracticeMs, content.modules.flatMap(m => m.units).reduce((n, u) => n + u.requiredSeconds * 1000, 0));
}
function answersFor(form, correct) {
  return Object.fromEntries(form.questions.map(q => {
    const item = definition.items.find(i => i.id === q.id);
    return [q.id, correct ? item.correctChoice : item.options.find(o => o.id !== item.correctChoice).id];
  }));
}

test('snapshot is read-only; exact input rejects actor/clock/state/operation injection', async () => {
  const h = fixture(), response = await h.run('snapshot');
  assert.equal(response.body.phase, 'not_started'); assert.equal(h.revision, 0);
  assert.equal(response.body.creditIssuanceAllowed, false); assert.deepEqual(response.body.progress.lessons, []);
  assert.deepEqual(h.calls.map(c => c.name), ['nmls_training_context']);
  for (const extra of [{ studentId: h.actor }, { runtime: {} }, { serverTimeMs: 0 }, { sessionId: randomUUID() }]) {
    assert.throws(() => validateNmlsTrainingInput(h.input('snapshot', extra)), /invalid_request/);
  }
  for (const operation of ['bind', 'present_rocs', 'approve', 'pay', 'enroll']) assert.throws(() => validateNmlsTrainingInput(h.input(operation)), /invalid_request/);
  let invoked = false; const bad = h.input('snapshot'); Object.defineProperty(bad.command, 'enrollmentId', { enumerable: true, get() { invoked = true; } });
  assert.throws(() => validateNmlsTrainingInput(bad), /invalid_request/); assert.equal(invoked, false);
  await assert.rejects(executeNmlsTraining(h.input('snapshot'), 'actor-from-browser', { rpc: h.rpc }), /authentication_required/);
});

test('dedicated regulator scope exposes every real lesson but no keys, grades, leases or mutation', async () => {
  const h = fixture('regulator_reviewer'), { body } = await h.run('snapshot');
  assert.equal(body.readOnly, true); assert.equal(body.accessMode, 'regulator_reviewer');
  assert.equal(body.phase, 'read_only_review'); assert.equal(body.progress, null);
  assert.equal(body.assessment, null); assert.equal(body.result, null);
  assert.deepEqual(body.review.modules.map(m => m.id), course.modules.map(m => m.id));
  assert.equal(body.review.modules.flatMap(m => m.lessons).length, 45);
  for (const [i, module] of body.review.modules.entries()) {
    assert.deepEqual(module.lessons.map(l => l.content), course.modules[i].units.map(u => u.content));
    for (const q of [...module.lessons.map(l => l.question), ...module.formativeQuestions]) {
      assert.deepEqual(Object.keys(q), ['id', 'stem', 'options']);
      assert.ok(q.options.every(o => Object.keys(o).join(',') === 'id,text'));
    }
  }
  assert.deepEqual(body.review.assessmentRules, { questionCount: 25, bankCount: 50, maxAutomaticAttempts: 2, requiredCorrect: 18, remediationRequired: true });
  assert.doesNotMatch(JSON.stringify(body), /correctChoice|rationale|"answers"|"sessionId"|"studentId"|N26-FIN-/);
  const commands = [h.input('teaching', {action:{kind:'resume',sessionId:null}}), h.input('issue_assessment'), h.input('start_remediation'),
    h.input('submit_assessment',{assessmentId:randomUUID(),answers:Object.fromEntries(definition.items.slice(0,25).map(q=>[q.id,'A']))})];
  for (const input of commands) await assert.rejects(executeNmlsTraining(input,h.actor,{rpc:h.rpc}),/nmls_training_read_only/);
  assert.ok(h.calls.every(c => c.name === 'nmls_training_context')); assert.equal(h.revision, 0); assert.equal(h.runtime, null);
  assert.deepEqual(nmlsTrainingPublicError(Error('nmls_training_read_only')), {status:403,body:{error:'nmls_training_read_only'}});
});

test('sample-student scope follows real gated non-credit study and cannot request a reviewer role', async () => {
  const h=fixture('student_reviewer'); const initial=(await h.run('snapshot')).body;
  assert.equal(initial.accessMode,'student_reviewer');assert.equal(initial.readOnly,false);assert.deepEqual(initial.progress.lessons,[]);
  await assert.rejects(h.run('issue_assessment'),/review_prerequisites/);
  const resumed=(await h.teaching('resume')).body;assert.equal(resumed.accessMode,'student_reviewer');assert.equal(resumed.nmlsCreditEligible,false);
  assert.ok(resumed.progress.sessionId);assert.equal(h.revision,1);
  assert.throws(()=>validateNmlsTrainingInput(h.input('snapshot',{reviewRole:'regulator_reviewer'})),/invalid_request/);
  for(const role of [undefined,'owner','student','']) {
    const malformed=fixture(role);
    if(role===undefined) await assert.rejects(executeNmlsTraining(malformed.input('snapshot'),malformed.actor,{rpc:async(n,p)=>({...await malformed.rpc(n,p),reviewRole:undefined})}),/access_denied/);
    else await assert.rejects(malformed.run('snapshot'),/access_denied/);
  }
});

test('real45-unit source, failed first, mandatory real remediation, disjoint second pass and terminal replay', async () => {
  const h = fixture();
  await assert.rejects(h.run('issue_assessment'), /review_prerequisites/);
  await complete(h, course);
  const source = structuredClone(h.runtime.source);
  let response = await h.run('issue_assessment'); const first = response.body.assessment;
  assert.equal(first.questions.length, 25); assert.equal(first.number, 1);
  assert.doesNotMatch(JSON.stringify(first), /correctChoice|rationale|sourceRefs|optionOrder/);
  const firstRevision = h.revision;
  assert.deepEqual((await h.run('snapshot')).body.assessment, first); assert.equal(h.revision, firstRevision);
  const wrong = answersFor(first, false), submitted = h.input('submit_assessment', { assessmentId: first.id, answers: wrong });
  response = await executeNmlsTraining(submitted, h.actor, { rpc: h.rpc });
  assert.equal(response.body.phase, 'remediation_required'); assert.equal(response.body.result.correct, 0);
  assert.equal(response.body.assessment, null);
  await assert.rejects(h.run('issue_assessment'), /phase_conflict/);
  await h.run('start_remediation');
  assert.equal(h.runtime.remediation.runtime.completedUnitIds.length, 0);
  await assert.rejects(h.run('issue_assessment'), /review_prerequisites/);
  const child = makeNmlsFinalRemediationCourse(definition, course, h.runtime.finals[0].selection, wrong);
  await complete(h, child);
  response = await h.run('issue_assessment'); const second = response.body.assessment;
  assert.equal(second.number, 2); assert.ok(second.questions.every(q => !first.questions.some(x => x.id === q.id)));
  assert.deepEqual((await h.run('snapshot')).body.assessment, second);
  response = await h.run('submit_assessment', { assessmentId: second.id, answers: answersFor(second, true) });
  assert.equal(response.body.phase, 'passed'); assert.equal(response.body.result.correct, 25);
  assert.equal(response.body.nmlsCreditEligible, false); assert.equal(response.body.courseCompletionIssued, false);
  assert.deepEqual(h.runtime.source, source);
  const revision = h.revision, count = h.events.size;
  response = await executeNmlsTraining(submitted, h.actor, { rpc: h.rpc });
  assert.equal(response.body.phase, 'passed'); assert.equal(response.body.replayed, true);
  assert.equal(response.body.assessment, null); assert.equal(h.revision, revision); assert.equal(h.events.size, count);
  await assert.rejects(h.run('issue_assessment'), /phase_conflict/);
  await assert.rejects(executeNmlsTraining({ ...submitted, command: { ...submitted.command, answers: answersFor(first, true) } }, h.actor, { rpc: h.rpc }), /idempotency_conflict/);
});

test('second failure is staff-review terminal, never automatic third form', async () => {
  const h = fixture(); await complete(h, course);
  let form = (await h.run('issue_assessment')).body.assessment;
  const wrong = answersFor(form, false);
  await h.run('submit_assessment', { assessmentId: form.id, answers: wrong }); await h.run('start_remediation');
  await complete(h, makeNmlsFinalRemediationCourse(definition, course, h.runtime.finals[0].selection, wrong));
  form = (await h.run('issue_assessment')).body.assessment;
  const result = await h.run('submit_assessment', { assessmentId: form.id, answers: answersFor(form, false) });
  assert.equal(result.body.phase, 'staff_review_required'); assert.equal(h.runtime.finals.length, 2);
  await assert.rejects(h.run('start_remediation'), /phase_conflict/); await assert.rejects(h.run('issue_assessment'), /phase_conflict/);
});

test('clean save/resume preserves partial work; idle clears it; stale sessions and revisions never write', async () => {
  const h = fixture(), unit = course.modules[0].units[0];
  await h.teaching('resume'); await h.teaching('open_unit', { unitId: unit.id });
  await h.teaching('interaction', { visible: true, observation: 'pointer' }); h.tick(10_000);
  await h.teaching('interaction', { visible: true, observation: 'scroll' });
  const oldSession = h.runtime.source.sessionId, oldEvent = h.input('teaching', { action: { kind: 'logout', sessionId: oldSession } });
  await executeNmlsTraining(oldEvent, h.actor, { rpc: h.rpc });
  assert.equal(h.runtime.source.bookmark.current.provisionalMs, 10_000);
  const snapshot = await h.run('snapshot'); assert.deepEqual(snapshot.body.progress.lessons, []); assert.equal(snapshot.body.progress.resumeRequired, true);
  h.tick(100_000); await h.teaching('resume');
  assert.equal(h.runtime.source.current.provisionalMs, 10_000); assert.notEqual(h.runtime.source.sessionId, oldSession);
  const revision = h.revision;
  await assert.rejects(h.run('teaching', { action: { kind: 'logout', sessionId: oldSession } }), /session_conflict/);
  assert.equal(h.revision, revision);
  const stale = h.input('teaching', { action: { kind: 'logout', sessionId: h.runtime.source.sessionId } }); stale.command.expectedRevision--;
  await assert.rejects(executeNmlsTraining(stale, h.actor, { rpc: h.rpc }), /revision_conflict/);
  assert.equal(h.calls.at(-1).params.p_runtime, null);
  h.tick(360_000); const expired = await h.teaching('heartbeat', { visible: true });
  assert.equal(expired.status, 401); assert.equal(h.runtime.source.current, null); assert.equal(h.runtime.source.bookmark, undefined);
  assert.deepEqual(expired.body.progress.lessons, []);
  h.revoke(); await assert.rejects(executeNmlsTraining(oldEvent, h.actor, { rpc: h.rpc }), /access_denied/);
});

test('clock retry is bounded, unknown failure is not retried, raw errors stay opaque', async () => {
  const h = fixture(); h.fault('nmls_training_clock_refresh_required');
  await h.teaching('resume'); assert.equal(h.calls.filter(c => c.name === 'nmls_training_commit').length, 2);
  h.fault('network_uncertain'); await assert.rejects(h.teaching('logout'), /network_uncertain/);
  assert.equal(h.calls.filter(c => c.name === 'nmls_training_commit').length, 3);
  for (const message of ['secret nmls_training_access_denied', 'nmls_training_access_denied: SECRET', 'password=SECRET']) {
    assert.deepEqual(nmlsTrainingPublicError(Error(message)), { status: 503, body: { error: 'nmls_training_unavailable' } });
  }
  assert.equal(nmlsTrainingPublicError(Error('nmls_training_access_denied')).status, 403);
});

test('snapshot and old replay never transfer the active teaching lease or expose stale material', async()=>{
  const h=fixture(), unit=course.modules[0].units[0];
  const resume=h.input('teaching',{action:{kind:'resume',sessionId:null}});
  await executeNmlsTraining(resume,h.actor,{rpc:h.rpc});
  await h.teaching('open_unit',{unitId:unit.id});
  await h.teaching('interaction',{visible:true,observation:'keyboard'});h.tick(10000);
  await h.teaching('interaction',{visible:true,observation:'scroll'});
  const before=structuredClone(h.runtime),revision=h.revision,count=h.events.size;
  const blank=p=>{assert.equal(p.sessionId,null);assert.equal(p.currentUnitId,null);assert.equal(p.quiz,null);
    assert.deepEqual(p.lessons,[]);assert.equal(p.feedback,null);assert.equal(p.provisionalPracticeMs,0);assert.equal(p.resumeRequired,true);};
  blank((await h.run('snapshot')).body.progress);
  assert.equal(h.calls.at(-1).name,'nmls_training_context');assert.deepEqual(h.runtime,before);
  const oldLease=h.runtime.source.sessionId;
  await h.teaching('resume');const current=structuredClone(h.runtime),currentCount=h.events.size;
  assert.notEqual(h.runtime.source.sessionId,oldLease);assert.equal(h.runtime.source.current.provisionalMs,10000);
  const replay=await executeNmlsTraining(resume,h.actor,{rpc:h.rpc});blank(replay.body.progress);
  assert.equal(replay.body.replayed,true);assert.equal(h.events.size,currentCount);assert.deepEqual(h.runtime,current);
  await assert.rejects(h.run('teaching',{action:{kind:'heartbeat',sessionId:oldLease,visible:true}}),/session_conflict/);
  h.tick(360000);const expired=await h.run('snapshot');blank(expired.body.progress);
  assert.equal(expired.body.progress.status,'logged_out');assert.deepEqual(h.runtime,current);
  blank((await executeNmlsTraining(resume,h.actor,{rpc:h.rpc})).body.progress);
  assert.equal((await h.teaching('resume')).body.code,'course_logout_required');
  assert.equal(h.runtime.source.current,null);assert.equal(h.runtime.source.bookmark,undefined);
  await h.teaching('resume');assert.equal(h.runtime.source.current,null);
  assert.equal(revision,count);assert.equal(h.runtime.source.completedReviewMs,0);
});

test('same-event unit heartbeat cannot double-count practice or retrieve ungraded answer keys',async()=>{
  const h=fixture(),unit=course.modules[0].units[0];await h.teaching('resume');
  let response=await h.teaching('open_unit',{unitId:unit.id});
  assert.doesNotMatch(JSON.stringify(response.body),/correctChoice|distractorRationales|optionOrder|sourceRefs|"answers"|"rationale"/);
  await h.teaching('interaction',{visible:true,observation:'keyboard'});h.tick(15000);
  const input=h.input('teaching',{action:{kind:'interaction',sessionId:h.runtime.source.sessionId,visible:true,observation:'scroll'}});
  await executeNmlsTraining(input,h.actor,{rpc:h.rpc});const saved=structuredClone(h.runtime),count=h.events.size;
  h.tick(15000);response=await executeNmlsTraining(input,h.actor,{rpc:h.rpc});
  assert.equal(response.body.replayed,true);assert.equal(response.body.progress.sessionId,null);
  assert.equal(h.events.size,count);assert.deepEqual(h.runtime,saved);assert.equal(h.runtime.source.current.provisionalMs,15000);
});

test('exact source and membership pins reject changed course, student, enrollment, version or payload',async()=>{
  for(const changes of [{studentId:randomUUID()},{enrollmentId:randomUUID()},{courseId:'ca-real-estate-principles'},
    {courseVersion:'2026.4'},{contentDigest:'0'.repeat(64)},{definitionDigest:'0'.repeat(64)}]){
    const h=fixture();let writes=0;
    await assert.rejects(executeNmlsTraining(h.input('snapshot'),h.actor,{rpc:async(name,p)=>{
      if(name==='nmls_training_commit')writes++;return {...await h.rpc(name,p),...changes};
    }}),/access_denied|content_changed/);assert.equal(writes,0);
  }
  const h=fixture(),changed=structuredClone(course);changed.modules[0].units[0].content+=' injected source';
  await assert.rejects(executeNmlsTraining(h.input('snapshot'),h.actor,{rpc:h.rpc,courseFor:()=>changed}),/content_changed/);
});

test('UUID case canonicalization preserves the same event and never changes caller input',async()=>{
  const h=fixture(),input=h.input('teaching',{action:{kind:'resume',sessionId:null}}),upper=structuredClone(input);
  upper.command.enrollmentId=upper.command.enrollmentId.toUpperCase();upper.command.eventId=upper.command.eventId.toUpperCase();
  const original=structuredClone(upper);
  await executeNmlsTraining(upper,h.actor.toUpperCase(),{rpc:h.rpc});assert.deepEqual(upper,original);
  const replay=await executeNmlsTraining(input,h.actor,{rpc:h.rpc});assert.equal(replay.body.replayed,true);assert.equal(h.events.size,1);
});
