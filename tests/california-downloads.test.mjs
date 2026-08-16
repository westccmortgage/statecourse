import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const directory = "public/statecourse/downloads/california";
const files = [
  "California_Prelicense_Master_Compliance_and_Filing_Readiness.pdf",
  "California_RE306_Principles_Application_Draft.pdf",
  "California_RE306_Principles_Submission_Binder.pdf",
  "California_RE306_Practice_Application_Draft.pdf",
  "California_RE306_Practice_Submission_Binder.pdf",
  "California_RE306_Mortgage_Loan_Brokering_and_Lending_Application_Draft.pdf",
  "California_RE306_Mortgage_Loan_Brokering_and_Lending_Submission_Binder.pdf",
  "California_RE336_Anatoliy_Kanevsky_Instructor_Qualification_Binder.pdf",
];

test("California submission PDFs are public, valid, and linked", () => {
  const page = fs.readFileSync(`${directory}/index.html`, "utf8");
  for (const file of files) {
    const bytes = fs.readFileSync(`${directory}/${file}`);
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
    assert.ok(bytes.length > 50_000);
    assert.match(page, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /Not submitted or approved/);
});
