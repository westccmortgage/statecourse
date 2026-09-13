import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path,import.meta.url),"utf8");

test("student session uses secure server cookies and no browser token storage",async() => {
  const session = await read("../netlify/functions/_lib/student-session.mjs");
  const browser = `${await read("../public/statecourse/student/student-portal.js")}\n${await read("../public/statecourse/student/sign-in/student-signin.js")}`;
  assert.match(session,/HttpOnly; Secure; SameSite=Lax/);
  assert.match(session,/__Host-sc_access/);
  assert.match(session,/__Host-sc_refresh/);
  assert.doesNotMatch(browser,/localStorage|sessionStorage/);
});

test("portal queries and events are restricted to the authenticated student",async() => {
  const endpoint = await read("../netlify/functions/_lib/student-portal-handler.mjs");
  assert.match(endpoint,/student_id=eq\.\$\{encodeURIComponent\(auth\.student\.id\)\}/);
  assert.match(endpoint,/enrollmentBelongsTo\(auth\.student\.id,enrollmentId\)/);
  assert.match(endpoint,/requireStudentSession/);
  assert.match(endpoint,/requireSameOrigin/);
});

test("portal cannot award time, completion, exams, or certificates",async() => {
  const endpoint = await read("../netlify/functions/_lib/student-portal-handler.mjs");
  assert.doesNotMatch(endpoint,/credited_study_seconds|final_exam_eligible|regulatory_credit_status|certificate_status/);
  assert.match(endpoint,/last_portal_accessed_at/);
  assert.doesNotMatch(endpoint,/lms_compliance_state.*(?:POST|PATCH)|course_final_eligibility.*(?:POST|PATCH)/s);
});

test("portal data preserves course versions and California-ready student fields",async() => {
  const migration = await read("../database/003_student_portal.sql");
  assert.match(migration,/course_version text not null/);
  assert.match(migration,/assignment_count/);
  assert.match(migration,/quiz_mastery_percent/);
  assert.match(migration,/earliest_final_exam_at/);
  assert.match(migration,/remaining_requirements/);
  assert.match(migration,/instructor_name/);
  assert.match(migration,/open_help_requests/);
  assert.match(migration,/course_certificates/);
  assert.match(migration,/licensing_navigator_state/);
});

test("portal frontend rejects external resume paths and escapes record values",async() => {
  const browser = await read("../public/statecourse/student/student-portal.js");
  assert.match(browser,/function escapeHtml/);
  assert.match(browser,/path\.startsWith\("\/"\)/);
  assert.match(browser,/!path\.startsWith\("\/\/"\)/);
  assert.match(browser,/role="progressbar"/);
});
