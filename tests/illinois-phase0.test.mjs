import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { inspectIllinoisCapture } from "../scripts/lib/illinois-source-integrity.mjs";

const sourceLock = JSON.parse(readFileSync(new URL("../config/illinois/source-lock.json", import.meta.url), "utf8"));
const matrix = JSON.parse(readFileSync(new URL("../config/illinois/requirements.json", import.meta.url), "utf8"));
const byId = Object.fromEntries(matrix.requirements.map((item) => [item.id, item]));
const docs = (path) => readFileSync(new URL(`../illinois/${path}`, import.meta.url), "utf8");

test("Illinois Phase 0 uses a dated, primary-authority source lock", () => {
  assert.equal(sourceLock.retrievedOn, "2026-09-04");
  assert.ok(sourceLock.sources.length >= 18);
  assert.ok(sourceLock.sources.every((source) => source.validation.titleMatched));
  assert.ok(sourceLock.sources.every((source) => source.validation.expectedContentMatched));
  assert.ok(sourceLock.sources.every((source) => source.validation.soft404Rejected));
  assert.ok(sourceLock.sources.every((source) => source.pinpoints.length));
  assert.ok(sourceLock.sources.some((source) => source.authorityClass === "statute"));
  assert.ok(sourceLock.sources.some((source) => source.authorityClass === "administrative_rule"));
});

test("every controlling claim is traceable to the locked source set", () => {
  const sources = new Set(sourceLock.sources.map((source) => source.id));
  assert.ok(matrix.requirements.length >= 30);
  for (const item of matrix.requirements) {
    assert.ok(item.sourceIds.length, item.id);
    assert.ok(item.pinpoint, item.id);
    assert.ok(item.evidenceParaphrase, item.id);
    for (const sourceId of item.sourceIds) assert.ok(sources.has(sourceId), `${item.id}: ${sourceId}`);
  }
});

test("Broker is the prepared route and Managing Broker equivalence is not overclaimed", () => {
  assert.equal(byId["IL-END-003"].status, "confirmed");
  assert.match(byId["IL-END-003"].implementation, /Do not describe issuance as guaranteed/);
  assert.equal(byId["IL-END-004"].status, "needs_regulator_confirmation");
  assert.match(docs("personal-path.md"), /Do \*\*not\*\* select Illinois Managing Broker yet/);
});

test("the instructor path has exam, expertise, training, fee and issuance gates", () => {
  assert.equal(byId["IL-INS-002"].status,"needs_regulator_confirmation");
  assert.ok(byId["IL-INS-002"].sourceIds.includes("IL-ACT-1"));
  assert.match(byId["IL-INS-001"].claim, /75%/);
  assert.match(byId["IL-INS-002"].claim, /immediately preceding two years/);
  assert.match(byId["IL-INS-003"].claim, /12-hour/);
  assert.match(byId["IL-INS-004"].claim, /\$150/);
  assert.match(byId["IL-PROV-007"].implementation, /hard filing gate/i);
});

test("mandatory curriculum evidence verifies actual bytes and rejects changed bytes",()=>{
  const evidence=JSON.parse(readFileSync(new URL("../config/illinois/source-evidence.json",import.meta.url),"utf8"));
  const hash=b=>createHash("sha256").update(b).digest("hex");
  for(const capture of evidence.captures){
    const bytes=readFileSync(new URL(`../${capture.path}`,import.meta.url));
    const extracted=readFileSync(new URL(`../${capture.textPath}`,import.meta.url), "utf8");
    const source=sourceLock.sources.find(source=>source.id===capture.id);
    assert.equal(hash(bytes),capture.sha256,capture.id);
    assert.deepEqual(inspectIllinoisCapture(capture,{bytes,extracted,source}),[],capture.id);
    const tampered=Buffer.from(bytes); tampered[0]^=1;
    assert.ok(inspectIllinoisCapture(capture,{bytes:tampered,extracted,source}).some(error=>error.includes("SHA-256")),capture.id);
  }
  for(const id of ["IL-CURR-75","IL-CURR-45POST","IL-CURR-45MB","IL-CURR-END-BROKER","IL-CURR-END-MB"]) assert.ok(evidence.captures.some(c=>c.id===id));
});

test("the actual evidence validator rejects soft-404, missing bytes and foreign redirects",()=>{
  const evidence=JSON.parse(readFileSync(new URL("../config/illinois/source-evidence.json",import.meta.url),"utf8"));
  const capture=evidence.captures.find(c=>c.id==="IL-CURR-45MB");
  const source=sourceLock.sources.find(s=>s.id===capture.id);
  const bytes=readFileSync(new URL(`../${capture.path}`,import.meta.url));
  const extracted=readFileSync(new URL(`../${capture.textPath}`,import.meta.url),"utf8");
  const html=Buffer.from("<html>Page not found</html>");
  const fake={...capture,sha256:createHash("sha256").update(html).digest("hex"),byteCount:html.length,contentType:"text/html"};
  assert.ok(inspectIllinoisCapture(fake,{bytes:html,extracted,source}).some(e=>e.includes("PDF")));
  assert.ok(inspectIllinoisCapture(capture,{extracted,source}).some(e=>e.includes("Missing source bytes")));
  assert.ok(inspectIllinoisCapture({...capture,finalUrl:"https://example.org/other.pdf"},{bytes,extracted,source}).some(e=>e.includes("Unapproved final URL")));
});

test("seven-course foundation reconciles all official hours and distinct finals",()=>{
  const p=JSON.parse(readFileSync(new URL("../config/illinois/course-portfolio.json",import.meta.url),"utf8"));
  assert.equal(p.courses.length,7);
  assert.equal(p.courses.reduce((n,c)=>n+c.hours,0),165);
  for(const c of p.courses){
    assert.equal(c.instructionMinutes,c.hours*50);
    if(c.blocks)assert.equal(c.blocks.reduce((n,b)=>n+b.hours,0),c.hours);
    if(c.id.startsWith("IL-POST-"))assert.equal(c.finalPolicy,"required_50_questions_minimum_75_percent");
  }
  assert.match(p.firstCommercialProduct,/75-hour entry-level Broker/);
  assert.match(p.personalLicenseProduct,/External approved 30-hour/);
});

test("online question ceiling is required questions per course, not item-bank size",()=>{
  assert.match(byId["IL-COURSE-003"].claim,/require no more than 250 questions per course/);
  assert.match(byId["IL-COURSE-003"].evidenceParaphrase,/not an item-bank-size cap/);
});

test("the seven-course condition prevents a false one-course launch", () => {
  assert.match(byId["IL-PROV-005"].claim, /full seven-course/);
  assert.equal(byId["IL-PROV-006"].status, "needs_regulator_confirmation");
  assert.match(docs("curriculum/portfolio-roadmap.md"), /seven courses/);
  assert.match(docs("submission/00-filing-index.md"), /Required seven course files/);
});

test("the endorsement blueprint reconciles credit minutes and breaks", () => {
  const blueprint = docs("curriculum/30h-endorsement-blueprint.md");
  assert.match(blueprint, /1,500 minutes of instruction plus 300 minutes of breaks/);
  assert.match(blueprint, /\*\*30\*\*[\s\S]*\*\*1,500\*\*/);
  assert.match(blueprint, /breaks are scheduled but never credited/i);
});

test("online distance and home study are kept legally distinct", () => {
  assert.equal(byId["IL-COURSE-004"].status, "needs_regulator_confirmation");
  assert.match(byId["IL-COURSE-004"].implementation, /Online Distance LMS, not Home Study/);
  assert.match(docs("submission/02-course-application-plan.md"), /Do not select Home Study/);
});

test("post-license finals cannot inherit the online-distance waiver", () => {
  assert.match(byId["IL-COURSE-002"].claim, /50-question/);
  assert.match(byId["IL-COURSE-003"].evidenceParaphrase, /does not apply to the 45-hour postlicense exams/);
});

test("every operational launch dependency fails closed", () => {
  const gates = docs("submission/05-operational-gates.md");
  assert.match(gates, /Default state: \*\*DENY\*\*/);
  assert.match(gates, /Provider license[\s\S]*BLOCKED/);
  assert.match(gates, /Course license[\s\S]*BLOCKED/);
  assert.match(gates, /Instructor[\s\S]*BLOCKED/);
  assert.match(gates, /Enrollment\/payment[\s\S]*BLOCKED/);
  assert.match(gates, /A submitted, pending or verbally discussed application never satisfies an approval gate/);
});

test("commercial figures carry dates and the non-cohort caveat", () => {
  const business = docs("business-case.md");
  assert.match(business, /72,904 combined/);
  assert.match(business, /4,212 Broker applications/);
  assert.match(business, /not a cohort conversion rate/);
  assert.match(business, /GO for Phase 0[\s\S]*NO-GO for filing fees and sales/);
});

test("no sensitive identifier or unqualified approval claim is stored", () => {
  const all = [
    JSON.stringify(sourceLock),
    JSON.stringify(matrix),
    docs("README.md"),
    docs("personal-path.md"),
    docs("submission/01-idfpr-provider-answer-sheet.md"),
    docs("submission/05-operational-gates.md")
  ].join("\n");
  assert.doesNotMatch(all, /\b\d{2}-\d{7}\b/);
  assert.doesNotMatch(all, /\b\d{3}-\d{2}-\d{4}\b/);
  assert.doesNotMatch(all, /\bStateCourse (?:is|has been) (?:approved|endorsed|recommended|accredited|licensed)\b/i);
});
