import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { CALIFORNIA_COURSE_IDS, getCaliforniaAssessment, getCaliforniaCourse, publicAssessment } from "../config/california-course-engine.mjs";

test("California keeps three independent 45-hour course records",()=>{
  assert.deepEqual(CALIFORNIA_COURSE_IDS,[
    "ca-real-estate-principles-45",
    "ca-real-estate-practice-45",
    "ca-mortgage-loan-brokering-lending-45"
  ]);
  for(const id of CALIFORNIA_COURSE_IDS){
    const course=getCaliforniaCourse(id);
    assert.equal(course.requiredHours,45);
    assert.equal(course.assignmentCount,15);
    assert.equal(course.assignments.length,15);
    assert.equal(course.minimumElapsedHours,420);
    assert.equal(new Set(course.assignments.map((item)=>item.id)).size,15);
  }
});

test("student assessment payload never exposes its answer or rationale",()=>{
  const full=getCaliforniaAssessment("ca-real-estate-practice-45","assignment-01","engagement");
  const safe=publicAssessment(full);
  assert.ok(full.items.length>1);
  for(const item of full.items){
    assert.equal(typeof item.correctChoice,"number");
    assert.equal(typeof item.rationale,"string");
  }
  for(const item of safe.items){
    assert.equal("correctChoice" in item,false);
    assert.equal("rationale" in item,false);
  }
  assert.equal(JSON.stringify(safe).includes("correctChoice"),false);
  assert.equal(JSON.stringify(safe).includes("rationale"),false);
});

test("California is not assigned the Virginia 50-minute hour completion rule",()=>{
  const source=getCaliforniaCourse(CALIFORNIA_COURSE_IDS[0]);
  assert.equal(source.expectedMinutesPerAssignment,180);
  assert.equal("requiredActiveMinutesPerAssignment" in source,false);
});

test("course reader and migration contain sequencing, heartbeat, remediation, review, and calendar controls",async()=>{
  const [api,client,sql]=await Promise.all([
    fs.readFile("netlify/functions/student-course.mjs","utf8"),
    fs.readFile("public/statecourse/student/course/student-course.js","utf8"),
    fs.readFile("database/004_california_prelicense.sql","utf8")
  ]);
  assert.match(api,/assignment_locked/);
  assert.match(api,/complete_instructional_sections_first/);
  assert.match(api,/remediation_content_viewed/);
  assert.match(api,/noStudentCredit/);
  assert.match(client,/visibilityState/);
  assert.match(client,/idleSeconds>=120/);
  assert.match(sql,/interval '420 hours'/);
  assert.match(sql,/interval '35 days'/);
  assert.match(sql,/record_california_heartbeat/);
  assert.match(sql,/create_qa_california_bundle/);
});

test("California reader uses a wide editorial column with accessible course-tool drawers",async()=>{
  const [html,css,client,preview]=await Promise.all([
    fs.readFile("public/statecourse/student/course/index.html","utf8"),
    fs.readFile("public/statecourse/student/course/student-course.css","utf8"),
    fs.readFile("public/statecourse/student/course/student-course.js","utf8"),
    fs.readFile("public/statecourse/student/course-preview/course-preview.js","utf8")
  ]);
  assert.match(html,/id="assignmentToggle"[^>]+aria-controls="assignmentRail"/);
  assert.match(html,/id="progressToggle"[^>]+aria-controls="statusPanel"/);
  assert.match(html,/id="drawerScrim"/);
  assert.match(css,/\.lesson-column\{width:100%;max-width:940px/);
  assert.match(css,/\.course-drawer\{position:fixed/);
  assert.match(client,/class=\"lesson-metadata\"/);
  assert.match(client,/titleCaseHeading/);
  assert.match(client,/sentenceCase/);
  assert.match(preview,/titleCaseHeading/);
});

/* Migration 006 closes three gaps between the engine and Article 24 / RE 303. Each of
   these guards a rule the regulation states, not an implementation preference, and the
   first guards against an error that ran in the student's favour against the regulator. */

test("the 2.5-week minimum runs from the access grant, not from the enrollment date",async()=>{
  const sql=await fs.readFile("database/006_california_timing_and_certificates.sql","utf8");
  const body=sql.slice(sql.indexOf("create or replace function refresh_california_eligibility"),
                       sql.indexOf("-- 2. Expiry enforcement"));
  /* RE 303 p.3 measures from the date access was received. */
  assert.match(body,/from access_grants/);
  assert.match(body,/v_earliest\s*:=\s*v_access_at \+ interval '420 hours'/);
  /* And it must not silently fall back to the enrollment date, which is the
     substitution the migration exists to remove. */
  assert.ok(!/coalesce\(\s*v_access_at\s*,\s*v_enrollment\.enrollment_date/.test(body),
    "eligibility falls back to enrollment_date when no access grant exists");
  assert.ok(!/v_enrollment\.enrollment_date \+ interval '420 hours'/.test(body),
    "eligibility still measures from enrollment_date");
});

test("an expired enrollment cannot accrue study time or reach the final examination",async()=>{
  const sql=await fs.readFile("database/006_california_timing_and_certificates.sql","utf8");
  /* RE 303 p.4: one year from registration, then re-enrollment. */
  assert.match(sql,/raise exception 'enrollment_expired'/);
  assert.match(sql,/v_expired\s*:=\s*v_enrollment\.status='expired'/);
  assert.match(sql,/v_final\s*:=[^;]*not v_expired/);
  assert.match(sql,/Enrollment expired - re-enrollment required/);
  assert.match(sql,/create or replace function expire_lapsed_california_enrollments/);
  /* The sweep revokes access and never edits what the student did. */
  assert.match(sql,/update access_grants set status='revoked'/);
  /* A reviewer keeps access regardless of any student clock. */
  const heartbeat=sql.slice(sql.indexOf("create or replace function record_california_heartbeat"),
                            sql.indexOf("expire_lapsed_california_enrollments"));
  assert.match(heartbeat,/if not v_reviewer and \(v_enrollment\.status='expired'/);
});

test("completion certificates carry a 15-day delivery deadline measured from completion",async()=>{
  const sql=await fs.readFile("database/006_california_timing_and_certificates.sql","utf8");
  /* Regulation 3000(a)(6). */
  assert.match(sql,/create table if not exists course_completion_certificates/);
  assert.match(sql,/delivery_due_at timestamptz not null/);
  assert.match(sql,/v_event\.completed_at \+ interval '15 days'/);
  assert.ok(!/now\(\) \+ interval '15 days'/.test(sql),
    "the deadline is computed from issuance, so a late issuance moves its own deadline");
  /* 3000(a)(4): records sufficient to produce a duplicate on request. */
  assert.match(sql,/certificate_number text not null unique/);
  /* Corrections supersede rather than overwrite, so the record stays reconstructable. */
  assert.match(sql,/supersedes_certificate_id uuid references course_completion_certificates\(id\)/);
  assert.match(sql,/california_certificate_delivery_overdue/);
});

test("certificate issuance is determined by completion, never by payment",async()=>{
  const sql=await fs.readFile("database/006_california_timing_and_certificates.sql","utf8");
  const fn=sql.slice(sql.indexOf("create or replace function issue_california_completion_certificate"),
                     sql.indexOf("create or replace function record_certificate_delivery"));
  assert.match(fn,/from course_completion_events/);
  assert.match(fn,/raise exception 'course_not_completed'/);
  for(const term of ["payments","checkout_attempts","stripe","refund"]){
    assert.ok(!fn.includes(term),`certificate issuance reads ${term}`);
  }
});

test("the course API refuses an expired enrollment and reports the access date",async()=>{
  const api=await fs.readFile("netlify/functions/student-course.mjs","utf8");
  assert.match(api,/fail\("enrollment_expired",403\)/);
  /* The refusal applies to the student, not to a reviewer whose account must reach the
     material whatever a student's clock says. */
  const ctx=api.slice(api.indexOf("async function contextFor"),api.indexOf("function assignmentNavigation"));
  assert.match(ctx,/if \(owner\) \{[\s\S]*enrollment_expired/);
  /* The clock the student is shown is the one the regulation measures. */
  assert.match(api,/accessGrantedAt:ctx\.accessGrantedAt/);
});
