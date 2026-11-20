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

export function mountCourse({ document: doc = globalThis.document, window: win = globalThis.window, transport = postCourse, ...rest } = {}) {
  const el = id => doc.getElementById(id);
  let mode = 'off', sequence = [], queue = [], opened = false, passedBefore = null, finalCleared = false, workspace = null;
  const step = id => sequence.find(item => item.id === id);
  function show() {
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
    workspace?.pause(); show();
  }
  function onView(view) {
    const s = view.snapshot, review = s?.creditReview;
    if (!review) return;
    mode = review.checkpoints?.mode === 'placeholder' ? 'placeholder' : 'off'; sequence = review.checkpoints?.sequence || [];
    el('courseVersion').textContent = review.version === 'open' ? 'Open review version' : 'Student version';
    el('checkpointMap').hidden = mode !== 'placeholder';
    if (mode === 'placeholder' && !el('checkpointList').children.length)
      el('checkpointList').replaceChildren(...sequence.map(item => Object.assign(doc.createElement('li'), { textContent: item.kind === 'biosig' ? `BioSig-ID “${item.d3}”: ${item.label}` : item.label })));
    const passed = s.phase === 'source' ? s.progress?.passedModuleIds || [] : null;
    if (!opened) { opened = true; passedBefore = passed; raise(checkpointsOnOpen(s, sequence)); return; }
    if (passed && passedBefore) raise(checkpointsAfterModules(passedBefore, passed, sequence));
    if (passed) passedBefore = passed;
  }
  function beforePhaseAction(action) {
    if (mode !== 'placeholder' || action !== 'issue_assessment') return true;
    if (finalCleared) { finalCleared = false; return true; }
    queue.push(...checkpointsBeforeFinal(sequence)); finalCleared = true; show();
    return false;
  }
  el('checkpointContinue').addEventListener('click', () => { queue.shift(); show(); });
  workspace = mountTrainingWorkspace({ document: doc, window: win, transport, wording: COURSE_WORDING,
    title: '8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education', onView, beforePhaseAction, ...rest });
  return { workspace, pending: () => [...queue] };
}
if (typeof document !== 'undefined' && typeof window !== 'undefined') mountCourse();
