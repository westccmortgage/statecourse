#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist/content/curriculum dist/content/reference

cp -R public/statecourse/. dist/

if [[ -d virginia/curriculum ]]; then
  cp virginia/curriculum/hours-01-15.md dist/content/curriculum/
  cp virginia/curriculum/hours-16-30.md dist/content/curriculum/
  cp virginia/curriculum/hours-31-45.md dist/content/curriculum/
  cp virginia/curriculum/hours-46-60.md dist/content/curriculum/
  cp virginia/submission/60-hour-timed-course-outline.md dist/content/reference/
  cp virginia/student/student-guide.md dist/content/reference/
  cp virginia/regulatory/compliance-baseline.md dist/content/reference/
fi

test -f dist/index.html
test -f dist/app.js
test -f dist/content/curriculum/hours-46-60.md
test -f dist/data/state-registry.json
test -f dist/real-estate/virginia/pre-license/principles-and-practices/index.html
test -f dist/real-estate/maine/pre-license/sales-agent/index.html
test -f dist/enroll/index.html
test -f dist/admin/payments/index.html

node -e 'const r=require("./dist/data/state-registry.json"); if(r.states.length!==50) process.exit(1)'
! find dist -type f -print | grep -Eq 'final-exam-bank|answer-key'
