import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const examSource=fs.readFileSync("public/statecourse/california-practice-exam.js","utf8");
const previewSource=fs.readFileSync("public/statecourse/student/course-preview/course-preview.js","utf8");

test("California free diagnostic contains a substantive original question bank",()=>{
  const itemIds=[...examSource.matchAll(/id:"(?:own|agency|value|finance|transfer|practice|contract)-\d+"/g)];
  assert.equal(itemIds.length,48);
  assert.match(examSource,/ownership:5, agency:5, valuation:4, financing:3, transfer:2, practice:7, contracts:4/);
  assert.match(examSource,/question_count:state\.questions\.length/);
  assert.match(examSource,/regulated_progress:false/);
  assert.doesNotMatch(examSource,/California DRE examination question/i);
});

test("all three California course manuscripts are available in the public lesson library",()=>{
  for(const course of ["ca-real-estate-principles-45-v1","ca-real-estate-practice-45-v1","ca-mortgage-loan-brokering-lending-45-v1"]){
    assert.match(previewSource,new RegExp(course));
    for(let assignment=1;assignment<=15;assignment+=1){
      const file=`california/${course}/curriculum/lesson-${String(assignment).padStart(2,"0")}.md`;
      const words=fs.readFileSync(file,"utf8").split(/\s+/).filter(Boolean).length;
      assert.ok(words>3000,`${file} must contain substantive instructional material`);
    }
  }
});

test("course framework links every California assignment to the lesson preview",()=>{
  const framework=fs.readFileSync("public/statecourse/state-course.js","utf8");
  assert.match(framework,/\/student\/course-preview\/\?course_id=/);
  assert.match(framework,/assignment=\$\{index \+ 1\}/);
});
