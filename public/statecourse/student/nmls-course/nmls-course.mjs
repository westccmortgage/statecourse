import { mountTrainingWorkspace } from '../nmls-training/nmls-training.mjs';
import { postTraining } from '../nmls-training/training-client.mjs';
import { checkpointsAfterModules, checkpointsBeforeFinal, checkpointsOnOpen, placeholderCopy } from './checkpoint-flow.mjs';

// The reviewers' course uses its own endpoint, which refuses every enrollment that was
// not provisioned with a reviewer role.
export const postCourse = (input, fetcher = globalThis.fetch) => postTraining(input, (url, init) => fetcher('/api/student/nmls/course', init));

export const COURSE_WORDING = Object.freeze({
  route: '/student/nmls-course/',
  messages: Object.freeze({
    nmls_course_review_access_required: 'This course version is available to NMLS reviewer accounts only.',
    nmls_identity_check_required: 'Identity verification is required before the course can continue.',
    nmls_identity_check_unavailable: 'Identity verification is not available right now, so the course cannot continue yet.',
    nmls_training_phase_conflict: 'The course stage changed. Reload saved progress.',
    nmls_training_access_denied: 'This enrollment is unavailable or inactive. Contact StateCourse if you need access restored.',
    nmls_training_content_changed: 'This course version needs staff review. Your saved progress has not been replaced.',
    unit_requirements_unmet: 'Work through the lesson and answer its question. The displayed lesson time must also be reached.',
    enrollment_required: 'Open this course from My StateCourse using your own enrollment.',
  }),
  resumePrompt: 'Saved progress loaded. Choose “Start or resume course” to continue on this device.',
  saved: 'Progress saved. Lesson time is recorded when the lesson is completed.',
  loading: 'Loading your saved course…', saving: 'Saving course activity…',
  offline: 'You are offline. The course is paused. Reconnect, reconcile any pending action, then resume explicitly.',
  loggedOut: 'Course paused. Saved lessons remain available.',
  passedStatus: 'Course lessons and final examination completed and saved.',
  staffStatus: 'Your final examination results are saved. Staff review is required before any further attempt.',
  readOnlyStatus: 'Open review version. Browsing does not record study time, answers or completion.',
  readOnlyNotice: 'Open review version of the course. Every lesson and module quiz can be opened in any order. Answer keys and the final examination bank are not shown here.',
  rulesLabel: 'Final examination rules',
  resumeButton: 'Start or resume course', resumeAssessmentButton: 'Continue final examination',
  modulesPassed: 'module quizzes passed', remediationTag: 'assigned review', unitMinutes: 'min',
  moduleLine: 'Module quiz',
  quizHeading: 'Module quiz', quizIntro: 'A score of 80% is required to continue.', quizSubmit: 'Submit module quiz',
  assessmentHeading: 'Final examination', assessmentIntro: 'Submission is final.', assessmentSubmit: 'Submit final examination',
  unitClock: 'lesson time',
  completeUnit: 'Complete lesson',
  unitReady: 'The question and lesson time are recorded. Save this lesson to continue.',
  unitPending: 'Lesson time is recorded when the lesson is completed.',
  quizPassed: 'Module quiz passed',
  resultLabel: 'Final examination result',
  sourceDoneTitle: 'Lessons and module quizzes finished',
  sourceDoneHelp: 'Your work is saved. Continue to the final examination.',
  startAssessment: 'Start final examination', startSecondAssessment: 'Start second final examination',
  passedTitle: 'Course completed',
  passedHelp: 'Your lessons, module quizzes and passing final examination result are saved.',
  staffHelp: 'Two final examinations have been submitted. A third attempt is not available. Contact StateCourse through My StateCourse for help; your work remains saved.',
});

// Asks the server to start the BioSig-ID check that is owed. The server chooses the
// checkpoint and returns where BSI wants the student sent; this page decides nothing.
export async function startIdentityCheck(enrollmentId, inSession = false, fetcher = globalThis.fetch) {
  const response = await fetcher('/api/student/nmls/identity-check', { method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ enrollmentId, inSession }), signal: AbortSignal.timeout(25000) });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

const IDENTITY_ERRORS = ['nmls_identity_check_required', 'nmls_identity_check_unavailable'];
const HELP = 'For help with identity verification, contact the NMLS help desk.';

export function mountCourse({ document: doc = globalThis.document, window: win = globalThis.window, transport = postCourse, identityTransport = startIdentityCheck, ...rest } = {}) {
  const el = id => doc.getElementById(id);
  let mode = 'off', sequence = [], queue = [], opened = false, passedBefore = null, finalCleared = false, workspace = null;
  let identity = null, identityOwed = false, identityNote = '', enrollmentId = null, pausing = false;
  // True once study has actually run on this page. A checkpoint reached after that is part
  // of the sitting; one met on arrival is a return, which BSI is told as "Resuming-…".
  let studiedHere = false;
  // Pausing redraws the workspace, which reports the same view again. Without this guard
  // a checkpoint raised during a redraw would pause, redraw and raise itself forever.
  const pauseStudy = () => { if (pausing) return; pausing = true; try { workspace?.pause(); } finally { pausing = false; } };
  const step = id => sequence.find(item => item.id === id);
  // Real BioSig-ID mode. The panel only explains and sends the student to BSI; whether
  // the course continues is decided by the server after BSI's own callback.
  function showIdentity() {
    el('checkpointPanel').hidden = !identityOwed; el('courseBody').hidden = identityOwed;
    el('checkpointContinue').hidden = true; el('identityStart').hidden = !identityOwed;
    if (!identityOwed) return;
    const due = identity?.due, failed = identity?.last?.status === 'failed';
    el('checkpointPosition').textContent = due?.d3 ? `BioSig-ID checkpoint: ${due.d3}` : 'BioSig-ID checkpoint';
    el('checkpointTitle').textContent = 'Identity verification';
    el('checkpointBody').textContent = `${due?.label || 'Identity verification is required'}. You will be taken to BioSig-ID to confirm your identity and then returned to this course.`;
    el('checkpointStatus').textContent = identityNote || (identity?.available === false ? `Identity verification is not available right now, so the course cannot continue yet. ${HELP}`
      : failed ? `The last identity check was not successful. You can try again. ${HELP}` : HELP);
    el('identityStart').disabled = identity?.available === false;
  }
  async function beginIdentity() {
    el('identityStart').disabled = true; identityNote = 'Contacting BioSig-ID…'; showIdentity();
    try {
      const { status, body } = await identityTransport(enrollmentId, studiedHere);
      if (status === 200 && body.ready === true) { identityOwed = false; identityNote = ''; showIdentity(); workspace?.client.open(enrollmentId); return; }
      if (status === 200 && typeof body.redirect === 'string' && body.redirect.startsWith('https://')) { win.location.assign(body.redirect); return; }
      identityNote = body.error === 'nmls_id_required' ? 'Add your NMLS ID in My StateCourse first. BioSig-ID identifies you by that number.'
        : `Identity verification could not be started. You can try again. ${HELP}`;
    } catch { identityNote = `Identity verification could not be started. Check your connection and try again. ${HELP}`; }
    showIdentity(); el('identityStart').disabled = false;
  }
  function show() {
    if (mode === 'biosig') { showIdentity(); return; }
    el('identityStart').hidden = true; el('checkpointContinue').hidden = false;
    const current = queue.length ? step(queue[0]) : null;
    el('checkpointPanel').hidden = !current; el('courseBody').hidden = Boolean(current);
    if (!current) return;
    const copy = placeholderCopy(current);
    el('checkpointTitle').textContent = copy.title; el('checkpointBody').textContent = copy.body; el('checkpointStatus').textContent = copy.status;
    el('checkpointPosition').textContent = `Checkpoint ${sequence.indexOf(current) + 1} of ${sequence.length}`;
  }
  function raise(found) {
    if (mode !== 'placeholder' || !found.length) return;
    queue.push(...found.filter(id => !queue.includes(id)));
    // A checkpoint interrupts study, so the study session is paused rather than left
    // counting lesson time behind the placeholder.
    pauseStudy(); show();
  }
  function onView(view) {
    if (pausing) return;
    const s = view.snapshot, review = s?.creditReview;
    if (s?.progress?.sessionId) studiedHere = true;
    enrollmentId = view.enrollmentId || enrollmentId;
    if (mode === 'biosig' && IDENTITY_ERRORS.includes(view.error)) {
      identityOwed = true; if (view.error === 'nmls_identity_check_unavailable') identity = { ...identity, available: false };
      pauseStudy(); showIdentity(); return;
    }
    if (!review) return;
    mode = ['placeholder', 'biosig'].includes(review.checkpoints?.mode) ? review.checkpoints.mode : 'off'; sequence = review.checkpoints?.sequence || [];
    if (mode === 'biosig') {
      el('courseVersion').textContent = review.version === 'open' ? 'Open review version' : 'Student version';
      el('checkpointMap').hidden = true;
      if (review.checkpoints.identity !== undefined) {
        identity = review.checkpoints.identity;
        // Shown up front while lessons are in progress and the owed check is not yet passed.
        identityOwed = Boolean(identity) && !identity.ready && ['not_started', 'source', 'remediation'].includes(s.phase);
      }
      showIdentity(); return;
    }
    el('courseVersion').textContent = review.version === 'open' ? 'Open review version' : 'Student version';
    el('checkpointMap').hidden = mode !== 'placeholder';
    if (mode === 'placeholder' && !el('checkpointList').children.length)
      el('checkpointList').replaceChildren(...sequence.map(item => Object.assign(doc.createElement('li'), { textContent: item.kind === 'biosig' ? `BioSig-ID “${item.d3}”: ${item.label}` : item.label })));
    const passed = s.phase === 'source' ? s.progress?.passedModuleIds || [] : null;
    if (!opened) { opened = true; passedBefore = passed; raise(checkpointsOnOpen(s, sequence)); return; }
    const before = passedBefore; if (passed) passedBefore = passed;
    if (passed && before) raise(checkpointsAfterModules(before, passed, sequence));
  }
  function beforePhaseAction(action) {
    if (mode !== 'placeholder' || action !== 'issue_assessment') return true;
    if (finalCleared) { finalCleared = false; return true; }
    queue.push(...checkpointsBeforeFinal(sequence)); finalCleared = true; show();
    return false;
  }
  el('checkpointContinue').addEventListener('click', () => { queue.shift(); show(); });
  el('identityStart').addEventListener('click', beginIdentity);
  workspace = mountTrainingWorkspace({ document: doc, window: win, transport, wording: COURSE_WORDING,
    title: '8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education', onView, beforePhaseAction, ...rest });
  return { workspace, pending: () => [...queue] };
}
if (typeof document !== 'undefined' && typeof window !== 'undefined') mountCourse();
