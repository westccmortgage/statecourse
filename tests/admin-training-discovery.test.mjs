import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, withConsoleMock, STAFF_ID, OTHER_STAFF_ID } from './fixtures/admin-console/harness.mjs';
import { snapshot } from '../netlify/functions/_lib/console-operations.mjs';
import { legacyHandler as paymentConfig } from '../netlify/functions/payment-config.mjs';

const CA = 'ca-real-estate-principles-45', TX = 'tx-law-of-agency-30-v1';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: {'content-type':'application/json'} });
const enrollment = {id:'44444444-4444-4444-8444-444444444444', student_id:STAFF_ID, state:'CA', course_id:CA};
const staff = {scopeStates:['CA'], matching:[{actor_role:'support', scope_state:'CA'}]};

async function fixture(run, {inventoryUnavailable = false, peopleUnavailable = false, decisionsUnavailable = false} = {}) {
  return withConsoleMock(createStore(), async () => {
    const original = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (input, init = {}) => {
      const url = new URL(input), name = url.pathname.replace('/rest/v1/', '');
      calls.push({url, method:init.method || 'GET'});
      if (name === 'courses') return inventoryUnavailable ? json({error:'unavailable'},503) : json([{id:CA, state:'CA', name:'Principles'}]);
      if (name === 'enrollments') {
        assert.equal(url.searchParams.get('state'), 'in.(CA)');
        return json(url.searchParams.get('course_id') === `in.(${CA})` ? [enrollment] : []);
      }
      if (name === 'students') {
        assert.equal(url.searchParams.get('id'), `in.(${STAFF_ID})`);
        return peopleUnavailable ? json({error:'unavailable'},503) : json([{id:STAFF_ID, email:'student@example.invalid', first_name:'A', last_name:'Student'}]);
      }
      if (name === 'lms_regulatory_audit') {
        assert.equal(url.searchParams.get('course_id'), `in.(${CA})`);
        assert.equal(url.searchParams.get('event_type'), 'eq.block_player_opened');
        return json([{enrollment_id:enrollment.id, occurred_at:'2026-09-12T17:30:00Z', actor_mode:'student'}]);
      }
      if (name === 'offering_public_status') return decisionsUnavailable ? json({error:'unavailable'},503) : json([
        {offering_id:CA, state:'CA', discipline:'real_estate', offering_kind:'course', training_access_enabled:true, recorded_by:OTHER_STAFF_ID, note:'Private operator note'},
        {offering_id:TX, state:'TX', discipline:'real_estate', offering_kind:'course', training_access_enabled:true}
      ]);
      if(name==='rpc/training_runtime_definition')return json({message:'Not installed'},404);
      if (['video_assets','console_tasks'].includes(name)) return json([]);
      throw new Error('Unexpected request '+name);
    };
    try { return await run(calls); } finally { globalThis.fetch = original; }
  });
}

test('student roster reads identities only for enrollments in the authorized course inventory', async () => fixture(async calls => {
  const result = await snapshot(staff);
  assert.equal(result.datasets.people.rows[0].email, 'student@example.invalid');
  assert.equal(result.datasets.recentAccess.rows[0].enrollment_id, enrollment.id);
  assert.equal(result.datasets.payments, undefined);
  assert.equal(calls.some(c => c.url.href.includes(OTHER_STAFF_ID)), false);
  assert.equal(calls.every(c => c.method === 'GET'), true);
}));

test('unreadable course scope never causes an unrestricted student directory query', async () => fixture(async calls => {
  const result = await snapshot(staff);
  assert.equal(result.datasets.enrollments.available, false);
  assert.equal(result.datasets.people.available, false);
  assert.deepEqual(result.datasets.people.rows, []);
  assert.equal(calls.some(c => /students|lms_regulatory_audit/.test(c.url.pathname)), false);
}, {inventoryUnavailable:true}));

test('unavailable identity source remains distinguishable from an empty student roster', async () => fixture(async () => {
  const result = await snapshot(staff);
  assert.equal(result.datasets.people.available, false);
  assert.equal(result.datasets.enrollments.rows.length, 1);
  assert.equal(result.datasets.recentAccess.available, true);
}, {peopleUnavailable:true}));

test('public course discovery returns enabled connected training without staff or enrollment data', async () => fixture(async calls => {
  const response = await paymentConfig();
  assert.equal(response.statusCode,200);
  const body = JSON.parse(response.body);
  assert.deepEqual(body.training.courses.map(c => c.id), [CA]);
  assert.deepEqual(Object.keys(body.training.courses[0]).sort(), ['id','name','state']);
  assert.doesNotMatch(response.body, /Private operator note|recorded_by|student_id/);
  assert.equal(calls.length,2);
  assert.equal(calls[0].method,'GET');
  assert.equal(calls[1].url.pathname,'/rest/v1/rpc/training_runtime_definition');
  assert.equal(response.headers['cache-control'],'no-store');
}));

test('payment configuration remains readable when training decisions are unavailable and offers no free enrollment', async () => fixture(async () => {
  const response = await paymentConfig(), body = JSON.parse(response.body);
  assert.equal(response.statusCode,200);
  assert.deepEqual(body.training,{available:false,courses:[]});
  assert.ok(body.courses.length > 0);
}, {decisionsUnavailable:true}));
