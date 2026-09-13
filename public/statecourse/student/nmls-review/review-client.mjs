// Browser-only transport coordinator. The server owns identity, time, grades,
// revision and the study lease. No credential or answer draft is persisted here.
export async function postReview(input, fetcher = globalThis.fetch) {
  const response = await fetcher('/api/student/nmls/review', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(input), signal: AbortSignal.timeout(25000),
  });
  const body = await response.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('uncertain_response');
  return { status: response.status, body };
}

const conflict = new Set(['nmls_review_revision_conflict', 'nmls_review_session_conflict', 'nmls_review_idempotency_conflict']);
const denied = new Set(['nmls_review_access_denied', 'nmls_review_content_changed', 'nmls_review_course_not_found']);
const backgroundKind = (kind) => ['heartbeat', 'interaction'].includes(kind);
const isProgress = (p) => p && p.mode === 'non_credit_review' && p.creditIssuanceAllowed === false &&
  Number.isSafeInteger(p.revision) && p.revision >= 0 && typeof p.contentDigest === 'string' &&
  typeof p.title === 'string' && Number.isFinite(p.completedReviewMs) && p.completedReviewMs >= 0 &&
  Number.isFinite(p.provisionalReviewMs) && p.provisionalReviewMs >= 0 &&
  ['active', 'logged_out', 'review_complete'].includes(p.status) &&
  Array.isArray(p.modules) && p.modules.every((m) => typeof m.id === 'string' && Array.isArray(m.units) &&
    m.units.every((u) => typeof u.id === 'string' && typeof u.title === 'string' && Number.isSafeInteger(u.requiredSeconds))) &&
  Array.isArray(p.lessons) && p.lessons.every((l) => typeof l.id === 'string' && typeof l.content === 'string' &&
    typeof l.question?.stem === 'string' && Array.isArray(l.question.options)) &&
  Array.isArray(p.completedUnitIds) && Array.isArray(p.passedModuleIds) &&
  (!p.quiz || (typeof p.quiz.id === 'string' && Array.isArray(p.quiz.questions) && p.quiz.questions.every((q) => typeof q.stem === 'string' && Array.isArray(q.options))));

export class ReviewClient {
  constructor({ transport = postReview, newId = () => crypto.randomUUID(), onChange = () => {}, onRenderError = () => {} } = {}) {
    this.transport = transport; this.newId = newId; this.onChange = onChange;
    this.onRenderError = onRenderError;
    this.epoch = 0; this.queue = []; this.pending = null;
    this.view = { phase: 'idle', progress: null, attemptId: null, error: null, code: null, grant: null };
  }
  publish(patch = {}) {
    Object.assign(this.view, patch);
    this.view.foregroundPending = Boolean(this.pending && !this.pending.read && !backgroundKind(this.pending.input.kind)) ||
      this.queue.some((job) => !job.read && !backgroundKind(job.input.kind));
    try { this.onChange(this.view); }
    catch {
      // Rendering cannot strand a transport promise or continue invisible writes.
      this.cancel(); this.view.phase = 'render_error'; this.view.progress = null;
      try { this.onRenderError(); } catch { /* Delivery remains settled. */ }
    }
  }
  cancel() {
    this.epoch += 1;
    this.pending?.resolve({ cancelled: true }); this.pending = null;
    this.queue.splice(0).forEach((job) => job.resolve({ cancelled: true }));
  }
  stop() { this.cancel(); this.publish({ phase: 'idle', progress: null, attemptId: null, error: null, code: null, grant: null }); }
  open(grant) {
    this.cancel();
    this.publish({ phase: 'loading', progress: null, attemptId: null, error: null, code: null, grant });
    return this.enqueue({ kind: 'start', grantId: grant.grantId, courseKey: grant.courseKey }, true);
  }
  send(kind, fields = {}, { background = false } = {}) {
    if (!['ready', 'busy'].includes(this.view.phase) || !this.view.progress ||
      (kind !== 'resume' && !this.view.progress.sessionId)) return Promise.resolve({ cancelled: true });
    // Polls are disposable; don't accumulate them behind an answer or outage.
    if (background && (this.pending || this.queue.length)) return Promise.resolve({ coalesced: true });
    if (!backgroundKind(kind) && this.view.foregroundPending) return Promise.resolve({ coalesced: true });
    return this.enqueue({ ...structuredClone(fields), kind });
  }
  enqueue(input, read = false) {
    return new Promise((resolve) => {
      this.queue.push({ input, read, resolve, epoch: this.epoch });
      if (this.pending) this.publish();
      this.pump();
    });
  }
  pump() {
    if (this.pending || !this.queue.length) return;
    const job = this.queue.shift();
    const input = job.read ? job.input : { ...job.input, attemptId: this.view.attemptId,
      eventId: this.newId(), expectedRevision: this.view.progress.revision,
      sessionId: this.view.progress.sessionId };
    // Retain the exact serialized command after an ambiguous network failure.
    this.pending = { ...job, wire: JSON.stringify(input), sending: false };
    this.deliver();
  }
  async deliver() {
    const job = this.pending;
    if (!job || job.sending) return;
    job.sending = true; this.publish({ phase: job.read ? 'loading' : 'busy', busyCommand: JSON.parse(job.wire).kind, error: null });
    if (this.epoch !== job.epoch || this.pending !== job) return;
    let result;
    try {
      result = await this.transport(JSON.parse(job.wire));
      if (this.epoch !== job.epoch || this.pending !== job) return;
      const { status, body } = result;
      const code = body.error || body.code;
      // A 5xx or malformed response does not prove a write failed. Retry safely.
      if (status >= 500 || (!isProgress(body.progress) && !(status >= 400 && typeof code === 'string'))) throw new Error('uncertain_response');
      if (body.progress) {
        const old = this.view.progress;
        if (!isProgress(body.progress) || !body.attemptId ||
          body.progress.courseKey !== this.view.grant.courseKey ||
          (old && (body.attemptId !== this.view.attemptId || body.progress.contentDigest !== old.contentDigest))) throw new Error('uncertain_response');
        // An old idempotent replay may settle a request, never regress the UI.
        if (!old || body.progress.revision >= old.revision) {
          this.view.progress = body.progress; this.view.attemptId = body.attemptId;
        }
      }
      let phase = 'ready';
      if (conflict.has(code)) phase = 'recover';
      else if (denied.has(code) || status === 403 || status === 404) phase = 'denied';
      else if (status === 401 && !['course_logout_required', 'review_already_complete'].includes(code)) phase = 'auth';
      if (['recover', 'denied', 'auth'].includes(phase)) {
        if (this.view.progress) this.view.progress = { ...this.view.progress, sessionId: null };
        this.queue.splice(0).forEach((item) => item.resolve({ cancelled: true }));
      }
      if (code === 'course_logout_required' || code === 'course_logged_out') {
        this.queue.splice(0).forEach((item) => item.resolve({ cancelled: true }));
      }
      if (['denied', 'auth'].includes(phase)) this.view.progress = null;
      this.pending = null;
      this.publish({ phase, code: code || null, error: status >= 400 ? code : null });
      job.resolve(result); this.pump();
    } catch {
      if (this.epoch !== job.epoch || this.pending !== job) return;
      job.sending = false;
      this.publish({ phase: 'uncertain', error: 'connection_interrupted' });
      // Keep the promise, payload, draft and queue pending until explicit retry.
    }
  }
  retry() { if (this.view.phase === 'uncertain') return this.deliver(); }
}
