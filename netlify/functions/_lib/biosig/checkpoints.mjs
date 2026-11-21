import { randomUUID } from 'node:crypto';
import { dbRequest } from '../db.mjs';
import { NMLS_CREDIT_CHECKPOINTS, NMLS_CREDIT_REVIEW } from '../../../../config/nmls/credit-review.mjs';

// Which identity check a student owes, and the record that proves one was passed.
// Enforced on the server: the course endpoint refuses to continue until BSI's own
// callback has verified the check. Nothing the browser sends can satisfy it.

const fail = (message, statusCode = 409) => { throw Object.assign(new Error(message), { statusCode }); };
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const step = id => NMLS_CREDIT_CHECKPOINTS.find(item => item.id === id);
const TABLE = 'nmls_identity_challenges';

export const CHALLENGE_LIFETIME_MS = 20 * 60 * 1000;   // time to finish at BioSig-ID
export const VERIFIED_LIFETIME_MS = 30 * 60 * 1000;    // time to use a passed check
export const CALLBACK_CLOCK_DRIFT_MS = 10 * 60 * 1000;

const teachingRuntime = runtime => runtime?.phase === 'remediation' ? runtime.remediation?.runtime : runtime?.source;

// The check owed before study may continue. `passed` is every checkpoint whose verified
// check has already been used for this enrollment.
export function dueStudyCheckpoint(runtime, passed) {
  if (!passed.has('begin')) return 'begin';
  const modules = runtime?.source?.passedModuleIds || [];
  for (const item of NMLS_CREDIT_CHECKPOINTS.filter(entry => entry.when === 'after_module'))
    if (modules.includes(item.moduleId) && !passed.has(item.id)) return item.id;
  return 'resuming';
}

// The check owed right now, including the one at the door of the final examination.
export function dueCheckpoint(runtime, passed) {
  const study = dueStudyCheckpoint(runtime, passed);
  if (study !== 'resuming') return study;
  const lessonsDone = ['source', 'remediation'].includes(runtime?.phase) && teachingRuntime(runtime)?.status === 'review_complete';
  return lessonsDone ? 'final_exam' : 'resuming';
}

// What a request needs before it may be committed: null (nothing), or
// { checkpoint, spend } where spend says the passed check is used up by this request.
export function requirementFor(input, runtime, passed) {
  const study = dueStudyCheckpoint(runtime, passed);
  if (input.operation === 'issue_assessment') return { checkpoint: study !== 'resuming' ? study : 'final_exam', spend: true };
  if (input.operation !== 'teaching') return null;
  const kind = input.command?.action?.kind;
  // Ending or observing a session is never blocked: a student must always be able to stop.
  if (['heartbeat', 'interaction', 'logout'].includes(kind)) return null;
  // Every return to study owes a fresh check: Begin, a Middle check that has come due, or Resuming.
  if (kind === 'resume') return { checkpoint: study, spend: true };
  // Inside a session, work stops when a Begin or Middle check is owed and not yet passed.
  return study === 'resuming' ? null : { checkpoint: study, spend: false, owed: true };
}

export function createChallengeStore({ request = dbRequest, now = () => Date.now(), newId = randomUUID } = {}) {
  const iso = ms => new Date(ms).toISOString();
  const select = filter => request(`${TABLE}?${filter}`);
  // Conditional on the current status, so two callbacks or two requests cannot both win.
  const move = async (id, from, patch) => (await request(`${TABLE}?id=eq.${encodeURIComponent(id)}&status=eq.${from}`,
    { method: 'PATCH', prefer: 'return=representation', body: patch }))?.[0] || null;
  return {
    async history(enrollmentId) {
      const rows = await select(`enrollment_id=eq.${encodeURIComponent(enrollmentId)}&select=id,checkpoint,status,completed_at,created_at&order=created_at.desc&limit=200`) || [];
      // A checkpoint counts as passed once its check has been used to continue. A check
      // BSI has verified but that has not been used yet is still the one that is owed.
      return { rows, passed: new Set(rows.filter(row => row.status === 'consumed').map(row => row.checkpoint)) };
    },
    usable(rows, checkpoint) {
      return rows.find(row => row.checkpoint === checkpoint && row.status === 'verified' && now() - Date.parse(row.completed_at) <= VERIFIED_LIFETIME_MS) || null;
    },
    async create({ enrollmentId, studentId, checkpoint, uid, d3 = step(checkpoint).d3 }) {
      // Only the newest check for an enrollment can be answered.
      await request(`${TABLE}?enrollment_id=eq.${encodeURIComponent(enrollmentId)}&status=eq.pending`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'expired' } });
      const row = { id: newId(), enrollment_id: enrollmentId, student_id: studentId, course_id: NMLS_CREDIT_REVIEW.courseId, checkpoint, d3, uid,
        status: 'pending', expires_at: iso(now() + CHALLENGE_LIFETIME_MS) };
      await request(TABLE, { method: 'POST', prefer: 'return=minimal', body: row });
      return row;
    },
    fail: id => move(id, 'pending', { status: 'failed', completed_at: iso(now()) }),
    spend: id => move(id, 'verified', { status: 'consumed', consumed_at: iso(now()) }),
    // BSI's answer. Returns the row when it was pending, unexpired and for this identifier.
    async answer(id, { uid, verified }) {
      if (!uuid(id)) return null;
      const row = (await select(`id=eq.${encodeURIComponent(id)}&select=*&limit=1`))?.[0];
      if (!row || row.status !== 'pending') return null;
      if (Date.parse(row.expires_at) <= now()) { await move(id, 'pending', { status: 'expired' }); return null; }
      // A callback that names a different identifier is not an answer to this check.
      if (uid !== undefined && uid !== row.uid) { await move(id, 'pending', { status: 'failed', completed_at: iso(now()) }); return null; }
      return move(id, 'pending', { status: verified ? 'verified' : 'failed', completed_at: iso(now()) });
    },
  };
}

// Wraps the training service's database calls for the reviewers' course. The service
// reads its context first and commits last; the identity requirement is settled between
// the two, so a refused request writes nothing.
export function identityGate(callRpc, input, { store, config }) {
  let context = null;
  return async (name, args) => {
    if (name === 'nmls_training_context') { context = await callRpc(name, args); return context; }
    // Read-only reviewers never reach a write, and the open version has no checkpoints.
    if (context?.reviewRole !== 'student_reviewer') return callRpc(name, args);
    const { rows, passed } = await store.history(context.enrollmentId);
    const need = requirementFor(input, context.runtime, passed);
    if (need) {
      if (!config.ready) fail('nmls_identity_check_unavailable', 503);
      if (need.owed) fail('nmls_identity_check_required');
      const proof = store.usable(rows, need.checkpoint);
      if (!proof || !(await store.spend(proof.id))) fail('nmls_identity_check_required');
    }
    return callRpc(name, args);
  };
}

// The `d3` value BSI is sent. A student who comes back after leaving, at a point where a
// Middle or FinalExam check is also due, makes one combined stop ("Resuming-FinalExam")
// instead of two, as BSI's analyst described on 2026-11-20. Begin is always plain Begin.
export function checkpointD3(checkpoint, { returning }) {
  const base = step(checkpoint).d3;
  return returning && ['middle_1', 'middle_2', 'final_exam'].includes(checkpoint) ? `Resuming-${base}` : base;
}

// For the course page: which check is owed, and how the last one ended.
export async function identityStatus(context, { store, config }) {
  if (context?.reviewRole !== 'student_reviewer') return null;
  const { rows, passed } = await store.history(context.enrollmentId);
  const due = dueCheckpoint(context.runtime, passed), item = step(due);
  const last = rows[0] || null;
  return { available: config.ready, due: { id: due, d3: item.d3, label: item.label }, ready: Boolean(store.usable(rows, due)),
    last: last ? { checkpoint: last.checkpoint, status: last.status } : null };
}
