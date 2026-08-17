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
  const full=getCaliforniaAssessment(CALIFORNIA_COURSE_IDS[0],"assignment-01","engagement");
  const safe=publicAssessment(full);
  assert.equal(typeof full.correctChoice,"number");
  assert.equal(typeof full.rationale,"string");
  assert.equal("correctChoice" in safe,false);
  assert.equal("rationale" in safe,false);
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
