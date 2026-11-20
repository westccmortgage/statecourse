import { NMLS_TRAINING_COURSE } from '../nmls-course-identity.mjs';

// The credit version of the national mortgage course, shown to NMLS reviewers only.
//
// It is the same pinned course (same lessons, quizzes, final assessment and saved
// progress) presented as the course submitted under application 109386, without the
// free-training labels. It is not open to students and it issues no credit: the course
// has no NMLS course number, and enrollment, payment, certificate and reporting controls
// are untouched.
export const NMLS_CREDIT_REVIEW = Object.freeze({
  courseId: NMLS_TRAINING_COURSE.id,
  applicationId: '109386',
  title: '8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education',
  route: '/student/nmls-course/',
  // NMLS asks for one "open" version (free navigation) and two "closed" versions (the
  // student experience). These are the two reviewer roles the database already enforces.
  roles: Object.freeze({ regulator_reviewer: 'open', student_reviewer: 'closed' }),
});

// Identity and conduct checkpoints, in course order. `d3` is BioSig-ID's name for the
// point in the course. This list is sequence only; the BioSig-ID interface itself is in
// netlify/functions/_lib/biosig/ and config/nmls/biosig.mjs.
export const NMLS_CREDIT_CHECKPOINTS = Object.freeze([
  Object.freeze({ id: 'rules_of_conduct', kind: 'rules_of_conduct', when: 'before_course', label: 'NMLS Rules of Conduct' }),
  Object.freeze({ id: 'begin', kind: 'biosig', d3: 'Begin', when: 'before_course', label: 'Identity verification before the course' }),
  Object.freeze({ id: 'middle_1', kind: 'biosig', d3: 'Middle#1', when: 'after_module', moduleId: 'F03', label: 'Identity verification during the course (1 of 2)' }),
  Object.freeze({ id: 'middle_2', kind: 'biosig', d3: 'Middle#2', when: 'after_module', moduleId: 'E02', label: 'Identity verification during the course (2 of 2)' }),
  Object.freeze({ id: 'final_exam', kind: 'biosig', d3: 'FinalExam', when: 'before_final', label: 'Identity verification before the final examination' }),
  Object.freeze({ id: 'resuming', kind: 'biosig', d3: 'Resuming', when: 'on_return', label: 'Identity verification when you return' }),
]);

// "off" (default), "placeholder" (describes each checkpoint, verifies nothing) or
// "biosig" (real BioSig-ID checks). Any other value is "off". "biosig" on its own opens
// nothing: without every BSI value the checks report themselves unavailable and the
// course stays closed at each checkpoint rather than skipping it.
export function nmlsCheckpointMode(env = process.env) {
  const value = env?.NMLS_CREDIT_CHECKPOINTS;
  return value === 'placeholder' || value === 'biosig' ? value : 'off';
}
