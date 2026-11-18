// BioSig-ID checkpoint contract supplied for application 90788 on 2026-11-18.
// This module deliberately does not model SOAP fields or vendor result codes: those
// remain unknown until the NMLS custom-code package and development endpoint arrive.

export const BIOSIG_D3 = Object.freeze({
  ENROLLMENT: 'Enrollment',
  BEGIN: 'Begin',
  MIDDLE_1: 'Middle#1',
  RESUMING: 'Resuming',
  FINAL_EXAM: 'FinalExam',
});

export const BIOSIG_D3_VALUES = Object.freeze(Object.values(BIOSIG_D3));

export const BIOSIG_COURSE_EVENTS = Object.freeze({
  ENROLLMENT: 'enrollment',
  BEGIN: 'begin',
  MIDDLE_1: 'middle_1',
  RESUMING: 'resuming',
  FINAL_EXAM: 'final_exam',
});

const D3_BY_EVENT = Object.freeze({
  [BIOSIG_COURSE_EVENTS.ENROLLMENT]: BIOSIG_D3.ENROLLMENT,
  [BIOSIG_COURSE_EVENTS.BEGIN]: BIOSIG_D3.BEGIN,
  [BIOSIG_COURSE_EVENTS.MIDDLE_1]: BIOSIG_D3.MIDDLE_1,
  [BIOSIG_COURSE_EVENTS.RESUMING]: BIOSIG_D3.RESUMING,
  [BIOSIG_COURSE_EVENTS.FINAL_EXAM]: BIOSIG_D3.FINAL_EXAM,
});

export const BIOSIG_ACCESS_RESULTS = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  ERROR: 'error',
});

export function biosigD3ForCourseEvent(event) {
  return D3_BY_EVENT[event] ?? null;
}

export function isBioSigD3(value) {
  return typeof value === 'string' && BIOSIG_D3_VALUES.includes(value);
}

// Only a matching, successful checkpoint can open the protected course boundary.
// Failure, transport error, malformed input and a mismatched checkpoint all fail closed.
export function decideBioSigAccess({ expectedD3, returnedD3, result } = {}) {
  const checkpointKnown = isBioSigD3(expectedD3);
  const checkpointMatched = checkpointKnown && returnedD3 === expectedD3;
  const passed = checkpointMatched && result === BIOSIG_ACCESS_RESULTS.PASSED;
  const failed = checkpointMatched && result === BIOSIG_ACCESS_RESULTS.FAILED;
  const error = checkpointMatched && result === BIOSIG_ACCESS_RESULTS.ERROR;

  return Object.freeze({
    allowAccess: passed,
    retryAllowed: !passed,
    contact: error || (!passed && !failed) ? 'nmls_help_desk' : null,
    reason: passed
      ? 'biosig_passed'
      : failed
        ? 'biosig_failed'
        : error
          ? 'biosig_error'
          : 'biosig_invalid_response',
  });
}

