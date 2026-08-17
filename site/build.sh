#!/usr/bin/env bash
set -euo pipefail

node scripts/generate-national-platform.mjs

rm -rf dist
mkdir -p dist/content/curriculum dist/content/reference dist/content/california

cp -R public/statecourse/. dist/
cp dist/student/course/index.html dist/student-course.html

if [[ -d virginia/curriculum ]]; then
  cp virginia/curriculum/hours-01-15.md dist/content/curriculum/
  cp virginia/curriculum/hours-16-30.md dist/content/curriculum/
  cp virginia/curriculum/hours-31-45.md dist/content/curriculum/
  cp virginia/curriculum/hours-46-60.md dist/content/curriculum/
  cp virginia/submission/60-hour-timed-course-outline.md dist/content/reference/
  cp virginia/student/student-guide.md dist/content/reference/
  cp virginia/regulatory/compliance-baseline.md dist/content/reference/
fi

for course in \
  ca-real-estate-principles-45-v1 \
  ca-real-estate-practice-45-v1 \
  ca-mortgage-loan-brokering-lending-45-v1
do
  mkdir -p "dist/content/california/${course}"
  cp "california/${course}/curriculum/"lesson-*.md "dist/content/california/${course}/"
done

test -f dist/index.html
test -f dist/app.js
test -f dist/content/curriculum/hours-46-60.md
test -f dist/data/state-registry.json
test -f dist/real-estate/virginia/pre-license/principles-and-practices/index.html
test -f dist/real-estate/maine/pre-license/sales-agent/index.html
test -f dist/real-estate/wisconsin/pre-license/salesperson/index.html
test -f dist/real-estate/missouri/pre-license/salesperson-pre-exam/index.html
test -f dist/real-estate/missouri/pre-license/real-estate-practice/index.html
test -f dist/real-estate/oklahoma/pre-license/basic/index.html
test -f dist/data/launch-course-frameworks.json
test -f dist/enroll/index.html
test -f dist/admin/payments/index.html
test -f dist/student/index.html
test -f dist/student/sign-in/index.html
test -f dist/student/student-portal.js
test -f dist/student/course/index.html
test -f dist/student/course/student-course.js
test -f dist/student-course.html
test -f dist/get-licensed/index.html
test -f dist/state-requirements/index.html
test -f dist/real-estate/california/index.html
test -f dist/real-estate/district-of-columbia/index.html
test -f dist/content/california/ca-real-estate-principles-45-v1/lesson-15.md
test -f dist/content/california/ca-real-estate-practice-45-v1/lesson-15.md
test -f dist/content/california/ca-mortgage-loan-brokering-lending-45-v1/lesson-15.md
test -f dist/media/statecourse-intro.mp4
test -f dist/media/statecourse-intro-poster.webp
test -f dist/media/statecourse-intro.vtt
test -f dist/data/homepage-video.json

node -e 'const r=require("./dist/data/state-registry.json"); if(r.states.length!==51) process.exit(1); for(const c of ["VA","ME","WI","MO","OK","AZ","WA","PA","NC","CO","CA"]) if(r.states.find(s=>s.state_code===c)?.public_status!=="In Development") process.exit(1)'
node -e 'const c=require("./dist/data/course-catalog.json"); const courses=c.categories[0].programs.flatMap(p=>p.courses); for(const id of ["ca-real-estate-principles-45","ca-real-estate-practice-45","ca-mortgage-loan-brokering-lending-45"]) if(!courses.find(x=>x.course_id===id)) process.exit(1)'
! find dist -type f -print | grep -Eq 'final-exam-bank|answer-key'
