import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOSIG_ACCESS_RESULTS,
  BIOSIG_COURSE_EVENTS,
  BIOSIG_D3,
  BIOSIG_D3_VALUES,
  biosigD3ForCourseEvent,
  decideBioSigAccess,
  isBioSigD3,
} from '../config/nmls/biosig-checkpoints.mjs';

test('the contract exposes exactly the five vendor-supplied d3 values', () => {
  assert.deepEqual(BIOSIG_D3_VALUES, [
    'Enrollment',
    'Begin',
    'Middle#1',
    'Resuming',
    'FinalExam',
  ]);
  assert.equal(Object.isFrozen(BIOSIG_D3), true);
  assert.equal(Object.isFrozen(BIOSIG_D3_VALUES), true);
});

test('each protected course event maps to its exact wire value', () => {
  assert.equal(biosigD3ForCourseEvent(BIOSIG_COURSE_EVENTS.ENROLLMENT), 'Enrollment');
  assert.equal(biosigD3ForCourseEvent(BIOSIG_COURSE_EVENTS.BEGIN), 'Begin');
  assert.equal(biosigD3ForCourseEvent(BIOSIG_COURSE_EVENTS.MIDDLE_1), 'Middle#1');
  assert.equal(biosigD3ForCourseEvent(BIOSIG_COURSE_EVENTS.RESUMING), 'Resuming');
  assert.equal(biosigD3ForCourseEvent(BIOSIG_COURSE_EVENTS.FINAL_EXAM), 'FinalExam');
});

test('unknown events and approximate spellings are never sent as d3', () => {
  for (const event of [undefined, null, '', 'middle', 'resume', 'FinalExam']) {
    assert.equal(biosigD3ForCourseEvent(event), null, String(event));
  }
  for (const value of ['enrollment', 'Middle1', 'Resuming ', 'Final Exam', '', null]) {
    assert.equal(isBioSigD3(value), false, String(value));
  }
});

test('a matching successful checkpoint opens only that protected boundary', () => {
  for (const d3 of BIOSIG_D3_VALUES) {
    assert.deepEqual(decideBioSigAccess({
      expectedD3: d3,
      returnedD3: d3,
      result: BIOSIG_ACCESS_RESULTS.PASSED,
    }), {
      allowAccess: true,
      retryAllowed: false,
      contact: null,
      reason: 'biosig_passed',
    }, d3);
  }
});

test('failed validation blocks access and allows a retry', () => {
  assert.deepEqual(decideBioSigAccess({
    expectedD3: BIOSIG_D3.BEGIN,
    returnedD3: BIOSIG_D3.BEGIN,
    result: BIOSIG_ACCESS_RESULTS.FAILED,
  }), {
    allowAccess: false,
    retryAllowed: true,
    contact: null,
    reason: 'biosig_failed',
  });
});

test('a SOAP or vendor error fails closed and routes support to NMLS', () => {
  assert.deepEqual(decideBioSigAccess({
    expectedD3: BIOSIG_D3.RESUMING,
    returnedD3: BIOSIG_D3.RESUMING,
    result: BIOSIG_ACCESS_RESULTS.ERROR,
  }), {
    allowAccess: false,
    retryAllowed: true,
    contact: 'nmls_help_desk',
    reason: 'biosig_error',
  });
});

test('a passed result for the wrong checkpoint cannot open access', () => {
  assert.deepEqual(decideBioSigAccess({
    expectedD3: BIOSIG_D3.FINAL_EXAM,
    returnedD3: BIOSIG_D3.BEGIN,
    result: BIOSIG_ACCESS_RESULTS.PASSED,
  }), {
    allowAccess: false,
    retryAllowed: true,
    contact: 'nmls_help_desk',
    reason: 'biosig_invalid_response',
  });
});

test('missing and invented result values fail closed without throwing', () => {
  for (const input of [undefined, {}, { result: 'success' }, {
    expectedD3: BIOSIG_D3.BEGIN,
    returnedD3: BIOSIG_D3.BEGIN,
    result: 'approved',
  }]) {
    const decision = decideBioSigAccess(input);
    assert.equal(decision.allowAccess, false);
    assert.equal(decision.retryAllowed, true);
    assert.equal(decision.contact, 'nmls_help_desk');
    assert.equal(decision.reason, 'biosig_invalid_response');
  }
});

test('the decision cannot itself grant completion, a certificate or NMLS credit', () => {
  const decision = decideBioSigAccess({
    expectedD3: BIOSIG_D3.FINAL_EXAM,
    returnedD3: BIOSIG_D3.FINAL_EXAM,
    result: BIOSIG_ACCESS_RESULTS.PASSED,
  });
  assert.deepEqual(Object.keys(decision).sort(), [
    'allowAccess',
    'contact',
    'reason',
    'retryAllowed',
  ]);
  assert.equal(Object.isFrozen(decision), true);
});

