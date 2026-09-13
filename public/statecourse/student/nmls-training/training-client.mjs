// Same-origin transport only. Credentials, elapsed time, grades and durable
// progress remain server-owned. Nothing is persisted in browser storage.
export async function postTraining(input, fetcher = globalThis.fetch) {
  const response = await fetcher('/api/student/nmls/training', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(input), signal: AbortSignal.timeout(25000),
  });
  const body = await response.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('uncertain_response');
  return { status: response.status, body };
}
const COURSE = 'nmls-ce-2026-comprehensive-8';
const phases = ['not_started', 'source', 'first_assessment', 'remediation_required', 'remediation', 'second_assessment', 'passed', 'staff_review_required'];
const integer = n => Number.isSafeInteger(n) && n >= 0;
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const question = q => q && typeof q.id === 'string' && typeof q.stem === 'string' && Array.isArray(q.options) && q.options.length === 4 &&
  new Set(q.options.map(o => o.id)).size === 4 && q.options.every(o => ['A', 'B', 'C', 'D'].includes(o.id) && typeof o.text === 'string');
export function isTrainingSnapshot(body, enrollmentId) {
  const p = body?.progress;
  const identity = body?.mode === 'free_training' && body.creditIssuanceAllowed === false && body.nmlsCreditEligible === false &&
    body.courseCompletionIssued === false && body.enrollmentId === enrollmentId && body.course?.id === COURSE && body.course.version === '2026.3' &&
    typeof body.course.title === 'string' && integer(body.revision);
  if (!identity) return false;
  if (body.readOnly === true || body.accessMode === 'regulator_reviewer' || body.phase === 'read_only_review') {
    const r = body.review, a = r?.assessmentRules;
    return body.readOnly === true && body.accessMode === 'regulator_reviewer' && body.phase === 'read_only_review' &&
      p === null && body.assessment === null && body.result === null && typeof r?.notice === 'string' &&
      Array.isArray(r.modules) && r.modules.length > 0 && r.modules.every(m => typeof m.id === 'string' && typeof m.title === 'string' &&
        Array.isArray(m.lessons) && m.lessons.length > 0 && m.lessons.every(l => typeof l.id === 'string' && typeof l.title === 'string' && typeof l.content === 'string' && question(l.question)) &&
        Array.isArray(m.formativeQuestions) && m.formativeQuestions.every(question)) &&
      a?.questionCount === 25 && a.bankCount === 50 && a.maxAutomaticAttempts === 2 && a.requiredCorrect === 18 && a.remediationRequired === true;
  }
  return phases.includes(body.phase) && p?.mode === 'free_training' &&
    ['active', 'logged_out', 'review_complete'].includes(p.status) && (p.sessionId === null || uuid(p.sessionId)) &&
    integer(p.completedPracticeMs) && integer(p.provisionalPracticeMs) && Array.isArray(p.completedUnitIds) && Array.isArray(p.passedModuleIds) &&
    Array.isArray(p.modules) && p.modules.every(m => typeof m.id === 'string' && typeof m.title === 'string' && Array.isArray(m.units) &&
      m.units.every(u => typeof u.id === 'string' && typeof u.title === 'string' && integer(u.requiredSeconds))) &&
    Array.isArray(p.lessons) && p.lessons.every(l => typeof l.id === 'string' && typeof l.content === 'string' && question(l.question)) &&
    (p.quiz === null || p.quiz && uuid(p.quiz.id) && Array.isArray(p.quiz.questions) && p.quiz.questions.every(question)) &&
    (body.assessment === null || body.assessment && uuid(body.assessment.id) && [1, 2].includes(body.assessment.number) &&
      body.assessment.questions?.length === 25 && body.assessment.questions.every(question));
}
const backgroundJob = job => job.input.operation === 'teaching' && ['heartbeat', 'interaction'].includes(job.input.command.action.kind);
const recover = new Set(['nmls_training_revision_conflict', 'nmls_training_session_conflict', 'nmls_training_idempotency_conflict',
  'nmls_training_event_conflict', 'nmls_training_phase_conflict', 'nmls_training_phase_closed', 'nmls_review_session_conflict',
  'nmls_review_revision_conflict', 'nmls_training_scope_mismatch', 'nmls_training_assessment_scope']);

export class TrainingClient {
  constructor({ transport = postTraining, newId = () => crypto.randomUUID(), onChange = () => {}, onRenderError = () => {} } = {}) {
    this.transport = transport; this.newId = newId; this.onChange = onChange; this.onRenderError = onRenderError;
    this.epoch = 0; this.queue = []; this.pending = null;
    this.view = { phase: 'idle', snapshot: null, enrollmentId: null, error: null, code: null, foregroundPending: false };
  }
  publish(patch = {}) {
    Object.assign(this.view, patch);
    this.view.foregroundPending = Boolean(this.pending && !this.pending.read && !backgroundJob(this.pending)) ||
      this.queue.some(job => !job.read && !backgroundJob(job));
    try { this.onChange(this.view); }
    catch { this.cancel(); this.view.phase = 'render_error'; this.view.snapshot = null; try { this.onRenderError(); } catch {} }
  }
  cancel() {
    this.epoch++;
    this.pending?.resolve({ cancelled: true }); this.pending = null;
    this.queue.splice(0).forEach(job => job.resolve({ cancelled: true }));
  }
  stop() { this.cancel(); this.publish({ phase: 'idle', snapshot: null, enrollmentId: null, error: null, code: null }); }
  open(enrollmentId) {
    this.cancel();
    if (!uuid(enrollmentId)) { this.publish({ phase: 'denied', snapshot: null, enrollmentId: null, error: 'enrollment_required' }); return Promise.resolve({ cancelled: true }); }
    enrollmentId = enrollmentId.toLowerCase();
    this.publish({ phase: 'loading', snapshot: null, enrollmentId, error: null, code: null });
    return this.enqueue({ operation: 'snapshot', command: { enrollmentId } }, true);
  }
  send(operation, fields = {}, { background = false } = {}) {
    if (!['ready', 'busy'].includes(this.view.phase) || !this.view.snapshot || this.view.snapshot.readOnly === true) return Promise.resolve({ cancelled: true });
    if (operation === 'teaching' && fields.action?.kind !== 'resume' && !this.view.snapshot.progress.sessionId) return Promise.resolve({ cancelled: true });
    if (background && (this.pending || this.queue.length)) return Promise.resolve({ coalesced: true });
    if (!background && this.view.foregroundPending) return Promise.resolve({ coalesced: true });
    return this.enqueue({ operation, command: structuredClone(fields) });
  }
  teach(kind, fields = {}, options = {}) { return this.send('teaching', { action: { ...fields, kind } }, options); }
  enqueue(input, read = false) {
    return new Promise(resolve => { this.queue.push({ input, read, resolve, epoch: this.epoch }); if (this.pending) this.publish(); this.pump(); });
  }
  pump() {
    if (this.pending || !this.queue.length) return;
    const job = this.queue.shift(), input = structuredClone(job.input);
    if (!job.read) {
      input.command.enrollmentId = this.view.enrollmentId;
      input.command.eventId = this.newId(); input.command.expectedRevision = this.view.snapshot.revision;
      if (input.operation === 'teaching') input.command.action.sessionId = this.view.snapshot.progress.sessionId;
    }
    this.pending = { ...job, wire: JSON.stringify(input), sending: false };
    this.deliver();
  }
  async deliver() {
    const job = this.pending;
    if (!job || job.sending) return;
    job.sending = true; this.publish({ phase: job.read ? 'loading' : 'busy', error: null });
    if (job.epoch !== this.epoch || this.pending !== job) return;
    try {
      const result = await this.transport(JSON.parse(job.wire));
      if (job.epoch !== this.epoch || this.pending !== job) return;
      const { status, body } = result, code = body.error || body.code;
      if (status >= 500 || (!isTrainingSnapshot(body, this.view.enrollmentId) && !(status >= 400 && typeof code === 'string' && !body.progress))) throw new Error('uncertain_response');
      if (body.progress || body.readOnly === true) {
        if (!isTrainingSnapshot(body, this.view.enrollmentId)) throw new Error('uncertain_response');
        if (!this.view.snapshot || body.revision >= this.view.snapshot.revision) this.view.snapshot = body;
      }
      let phase = recover.has(code) ? 'recover' : status === 403 || status === 404 || code === 'nmls_training_content_changed' ? 'denied'
        : status === 401 && code !== 'course_logout_required' ? 'auth' : 'ready';
      if (['recover', 'denied', 'auth'].includes(phase) || ['course_logout_required', 'course_logged_out'].includes(code)) {
        this.queue.splice(0).forEach(item => item.resolve({ cancelled: true }));
      }
      if (body.readOnly === true || body.progress && ['not_started', 'source', 'remediation'].includes(body.phase) && !body.progress.sessionId) {
        // Snapshot/replay intentionally withholds the other device's lease.
        // Any queued teaching command was composed before this fence. It must
        // not be pumped with a null lease, or silently follow a later Resume.
        this.queue.splice(0).forEach(item => item.resolve({ cancelled: true }));
      }
      if (['denied', 'auth', 'recover'].includes(phase)) this.view.snapshot = null;
      this.pending = null; this.publish({ phase, code: code || null, error: status >= 400 ? code : null });
      job.resolve(result); this.pump();
    } catch {
      if (job.epoch !== this.epoch || this.pending !== job) return;
      job.sending = false; this.publish({ phase: 'uncertain', error: 'connection_interrupted' });
      // Retain this exact command and event ID. Only explicit retry can resend
      // it; queued actions never overtake an unacknowledged answer or write.
    }
  }
  retry() { if (this.view.phase === 'uncertain') return this.deliver(); }
}
