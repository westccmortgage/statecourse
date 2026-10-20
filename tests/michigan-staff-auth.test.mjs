import { NAMED_SESSION, STAFF_COOKIE } from './fixtures/admin-console/harness.mjs';
import assert from "node:assert/strict";
import test from "node:test";

import { legacyHandler as adminHandler } from "../netlify/functions/admin-michigan-course.mjs";

const STAFF_ID = "11111111-1111-4111-8111-111111111111";
const INSTRUCTOR_ID = "22222222-2222-4222-8222-222222222222";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";
const ENROLLMENT_ID = "44444444-4444-4444-8444-444444444444";
const SUBMISSION_ID = "55555555-5555-4555-8555-555555555555";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function withSupabaseMock({ role = "instructor" } = {}, action) {
  const originalFetch = globalThis.fetch;
  const keys = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "STATECOURSE_BASE_URL"];
  const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const calls = [];
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_ANON_KEY = "anon-test-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.STATECOURSE_BASE_URL = "https://statecourse.test";
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const call = { url, init, body: init.body ? JSON.parse(init.body) : null };
    calls.push(call);
    if (url.pathname === "/auth/v1/user") {
      assert.equal(init.headers.authorization, `Bearer ${NAMED_SESSION}`);
      return json({ id: STAFF_ID, email: "named.staff@example.test", email_confirmed_at: "2026-01-01T00:00:00Z", user_metadata: {} });
    }
    if (url.pathname === "/rest/v1/rpc/statecourse_staff_security") return json({ok:true});
    if (url.pathname === "/rest/v1/current_staff_actor_bindings") return json([{auth_user_id:STAFF_ID,actor_role:role,scope_state:'MI',binding_status:'active'}]);
    if (url.pathname === "/rest/v1/students") return json(null);
    if (url.pathname === "/rest/v1/michigan_current_staff_actor_bindings") {
      return json([{
        auth_user_id: STAFF_ID,
        actor_role: role,
        instructor_id: role === "instructor" ? INSTRUCTOR_ID : null,
        binding_status: "active",
        effective_at: "2026-08-01T00:00:00.000Z",
        expires_at: "2027-08-01T00:00:00.000Z",
      }]);
    }
    if (url.pathname === "/rest/v1/enrollments") {
      return json([{ id: ENROLLMENT_ID, student_id: STUDENT_ID }]);
    }
    if (url.pathname.startsWith("/rest/v1/rpc/")) return json({ ok: true });
    throw new Error(`unexpected_mock_request:${url.pathname}${url.search}`);
  };
  try {
    return await action(calls);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
}

function postEvent(body) {
  return {
    httpMethod: "POST",
    path: "/api/admin/michigan-course",
    headers: {
      cookie: STAFF_COOKIE,
      "x-statecourse-action-proof":"a".repeat(43),
      origin: "https://statecourse.test",
    },
    queryStringParameters: {},
    body: JSON.stringify(body),
  };
}

const scores = {
  law_accuracy: 2,
  fact_analysis: 2,
  professional_boundary: 2,
  action_and_timing: 1,
  record_and_communication: 1,
};
const feedback = Object.fromEntries(Object.keys(scores).map((key) => [key, `Feedback for ${key}.`]));

test("the memo reviewer UUID comes only from the named server-side instructor binding", { concurrency: false }, async () => {
  await withSupabaseMock({ role: "instructor" }, async (calls) => {
    const response = await adminHandler(postEvent({
      eventType: "review_memo",
      submissionId: SUBMISSION_ID,
      scores,
      feedback,
    }));
    assert.equal(response.statusCode, 200);
    const rpcCall = calls.find((call) => call.url.pathname.endsWith("/rpc/review_michigan_applied_memo"));
    assert.ok(rpcCall, "review RPC was not called");
    assert.equal(rpcCall.body.p_reviewer_instructor_id, INSTRUCTOR_ID);
    assert.equal(rpcCall.body.p_submission_id, SUBMISSION_ID);
    assert.ok(calls.some((call) => call.url.searchParams.get("auth_user_id") === `eq.${STAFF_ID}`));
  });
});

test("browser-supplied actor identities are rejected before staff lookup or RPC", { concurrency: false }, async () => {
  await withSupabaseMock({ role: "instructor" }, async (calls) => {
    const response = await adminHandler(postEvent({
      eventType: "review_memo",
      submissionId: SUBMISSION_ID,
      reviewerInstructorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      scores,
      feedback,
    }));
    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), { error: "browser_actor_identity_not_accepted" });
    assert.equal(calls.some((call) => call.url.pathname.includes("michigan_current_staff_actor_bindings")), false);
    assert.equal(calls.some((call) => call.url.pathname.includes("/rpc/") && !call.url.pathname.endsWith("/statecourse_staff_security")), false);
  });
});

test("identity verification derives both student and verifier UUIDs on the server", { concurrency: false }, async () => {
  await withSupabaseMock({ role: "administrator" }, async (calls) => {
    const response = await adminHandler(postEvent({
      eventType: "verify_identity",
      enrollmentId: ENROLLMENT_ID,
      legalName: "Morgan Student",
      method: "Government photo ID",
      evidenceReference: "controlled://identity/fixture",
      evidenceSha256: "a".repeat(64),
    }));
    assert.equal(response.statusCode, 200);
    const rpcCall = calls.find((call) => call.url.pathname.endsWith("/rpc/record_michigan_identity_verification"));
    assert.ok(rpcCall, "identity-verification RPC was not called");
    assert.equal(rpcCall.body.p_student_id, STUDENT_ID);
    assert.equal(rpcCall.body.p_verified_by, STAFF_ID);
    assert.equal(rpcCall.body.p_enrollment_id, ENROLLMENT_ID);
  });
});

test("an administrator account cannot act as the memo-review instructor", { concurrency: false }, async () => {
  await withSupabaseMock({ role: "administrator" }, async (calls) => {
    const response = await adminHandler(postEvent({
      eventType: "review_memo",
      submissionId: SUBMISSION_ID,
      scores,
      feedback,
    }));
    assert.equal(response.statusCode, 403);
    assert.deepEqual(JSON.parse(response.body), { error: "michigan_named_staff_binding_required" });
    assert.equal(calls.some((call) => call.url.pathname.includes("/rpc/") && !call.url.pathname.endsWith("/statecourse_staff_security")), false);
  });
});
