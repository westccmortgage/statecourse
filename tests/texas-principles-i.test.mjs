/**
 * TX-1A — Principles of Real Estate I content build: the tests that make the build's promises
 * falsifiable, and the mutation tests that prove the guards actually guard.
 *
 * The mutation half is the part that earns its keep: each mutation applies a specific corruption
 * to COPIES of the real files in a temp directory and asserts the corresponding guard FAILS.
 * A guard that cannot fail is a decoration.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PRINS1 = (await import(path.join(ROOT, "config/texas/prins1-course-form.mjs"))).default;
const COURSE_CFG = (await import(path.join(ROOT, "config/texas/principles-i-course.mjs"))).default;
const BANK = await import(path.join(ROOT, "config/texas/principles-i-question-bank.mjs"));
const STATUTES = (await import(path.join(ROOT, "config/texas/statute-sources.mjs"))).default;
const { claimTraceability } = await import(path.join(ROOT, "lib/texas-claim-traceability.mjs"));
const { studyCourse } = await import(path.join(ROOT, "lib/texas-principles-i-time-study.mjs"));

const CURRICULUM = "texas/tx-principles-real-estate-i-30-v1/curriculum";
const moduleFiles = COURSE_CFG.MODULES.map((m) => `${CURRICULUM}/${m.file}`);
const allModules = () => moduleFiles.map((f) => read(f)).join("\n");

/* ── 1-3: structure ──────────────────────────────────────────────────────────────────────── */

test("the PRINS1-1 structure is preserved: 9 topics, 46 units, 1500 minutes, subtotals intact", () => {
  assert.equal(PRINS1.TOPICS.length, 9);
  assert.equal(PRINS1.ALL_UNITS.length, 46);
  assert.equal(PRINS1.FORM.totalMinutes, 1500);
  for (const topic of PRINS1.TOPICS) {
    assert.equal(topic.units.reduce((n, u) => n + u.minutes, 0), topic.subtotalMinutes, topic.code);
  }
});

test("one module per topic, in the form's order, and every unit taught under its exact title", () => {
  assert.equal(COURSE_CFG.MODULES.length, 9);
  for (const [index, moduleEntry] of COURSE_CFG.MODULES.entries()) {
    assert.equal(moduleEntry.topicCode, PRINS1.TOPICS[index].code);
    const body = read(`${CURRICULUM}/${moduleEntry.file}`);
    for (const unit of PRINS1.TOPICS[index].units) {
      assert.ok(body.includes(`## Unit: ${unit.unit}`), `${moduleEntry.file} lacks heading for ${unit.code}`);
    }
  }
});

test("every unit carries a learning objective and a read source or a stated no-statute reason", () => {
  assert.equal(COURSE_CFG.UNIT_TRACE.length, 46);
  for (const trace of COURSE_CFG.UNIT_TRACE) {
    assert.ok(trace.objectives.length >= 1, trace.code);
    assert.ok(trace.sources.length > 0 || trace.noStatuteRequired, `${trace.code} is untraced`);
    for (const source of trace.sources) assert.ok(source.sections.length > 0, `${trace.code}: held source ${source.sourceId} with nothing read — HELD IS NOT READ`);
  }
});

/* ── 4-8: traceability and honesty ───────────────────────────────────────────────────────── */

test("TX_PRINCIPLES_I_CLAIM_TRACEABILITY passes on the real files", () => {
  const trace = claimTraceability(ROOT);
  assert.equal(trace.status, "PASS", trace.failures.join("\n"));
  assert.deepEqual(trace.explainedCrossReferences, ["50", "53.254"]);
});

test("the read register is substantive: every read section carries a note stating what was taken", () => {
  assert.ok(STATUTES.SECTIONS_READ.length >= 70, `${STATUTES.SECTIONS_READ.length} sections read`);
  for (const entry of STATUTES.SECTIONS_READ) {
    assert.ok(entry.note && entry.note.length >= 40, `${entry.citation} § ${entry.section}: note too thin to review against`);
  }
});

test("the four no-statute units are exactly the four named, with reasons", () => {
  assert.deepEqual(STATUTES.NO_STATUTE_REQUIRED.map((e) => e.unit).sort(), ["T03U1", "T05U5", "T05U6", "T05U7"]);
  for (const entry of STATUTES.NO_STATUTE_REQUIRED) assert.ok(entry.reason.length > 40, entry.unit);
});

test("The Benefits is taught without tax propositions, and the student is sent to a tax professional", () => {
  const m05 = read(`${CURRICULUM}/module-05.md`).replace(/\s+/g, " ");
  assert.match(m05, /qualified tax professional/i);
  /* The same vocabulary the traceability guard bans — "deduct and withhold" in § 1445's own text is
     a withholding duty, not a tax benefit, and stays legal. */
  const flat = allModules().replace(/\s+/g, " ");
  for (const banned of [/tax[- ]deducti/i, /depreciat/i, /capital[- ]gains?/i, /1031/, /passive[- ](activity )?loss/i, /write[- ]off/i]) {
    assert.doesNotMatch(flat, banned, `tax-benefit vocabulary ${banned} in the Texas curriculum`);
  }
});

test("no module claims TREC approval, and the register never claims the codified TAC was read", () => {
  assert.doesNotMatch(allModules(), /TREC[- ]approved|approved by the (Texas Real Estate )?Commission/i);
  const register = read("texas/regulatory/primary-text-readings.md");
  assert.match(register, /TX_PROVIDER_RULE_SOURCE_LOCK: FAIL/);
});

/* ── 9-12: assessments ───────────────────────────────────────────────────────────────────── */

test("every topic has at least three quiz items; every item has rationale, remediation and replacement", () => {
  for (const topic of PRINS1.TOPICS) {
    const items = BANK.TOPIC_QUIZZES[topic.code] ?? [];
    assert.ok(items.length >= 3, `${topic.code}: ${items.length} items`);
    for (const item of items) {
      assert.ok(item.rationale.length > 60, `${item.id}: rationale too thin to teach`);
      assert.ok(item.remediation.startsWith("module-0"), item.id);
      assert.ok(item.replacement.rationale.length > 40, `${item.id}: replacement without a teaching rationale`);
    }
  }
});

test("no assessment item is true/false, and every correct choice index is valid", () => {
  const everyItem = Object.values(BANK.TOPIC_QUIZZES).flat().flatMap((item) => [item, item.replacement]);
  for (const item of everyItem) {
    assert.ok(item.choices.length >= 3, `${item.id}: ${item.choices.length} choices — true/false is banned`);
    assert.ok(item.correctChoice >= 0 && item.correctChoice < item.choices.length, item.id);
  }
});

test("three scenario exercises exist, each with facts, tasks, model analysis, passing standard and remediation", () => {
  assert.ok(BANK.SCENARIOS.length >= 3);
  for (const scenario of BANK.SCENARIOS) {
    for (const field of ["facts", "tasks", "modelAnalysis", "passing", "remediation"]) {
      assert.ok(scenario[field], `${scenario.id} lacks ${field}`);
    }
  }
});

test("the formative bank never presents itself as the final examination, and the TX-1B artifacts exist where they must", () => {
  const bankSource = read("config/texas/principles-i-question-bank.mjs");
  assert.match(bankSource.replace(/\s+\*\s+/g, " ").replace(/\s+/g, " "), /NOT the final examination/i);
  /* TX-1B was owner-authorized 2026-08-28: the bank, forms and engine exist — in config/ and
     lib/, outside every student-served tree — and the input manifest records the authorization. */
  for (const required of [
    "config/texas/principles-i-final-exam-bank.mjs",
    "config/texas/principles-i-final-exam-forms.mjs",
    "lib/texas-principles-i-exam-engine.mjs",
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, required)), `${required} missing — TX-1B was built`);
  }
  assert.equal(fs.existsSync(path.join(ROOT, "public/statecourse/config/texas/principles-i-final-exam-bank.mjs")), false);
  assert.ok(fs.existsSync(path.join(ROOT, "texas/submission/tx1b-exam-build-input-manifest.md")));
});

/* ── 13-16: time evidence ────────────────────────────────────────────────────────────────── */

test("the 1,500-minute reconciliation holds module by module, computed from the files", () => {
  const study = studyCourse(ROOT);
  for (const m of study.modules) assert.ok(m.supports, `${m.module} short by ${m.shortfallMinutes} min`);
  assert.ok(study.reconciles);
  assert.ok(study.totals.words > 40000, "the course text is implausibly thin for 1,500 minutes");
});

test("the time model is labelled as the provider's methodology, never as a regulator figure", () => {
  assert.equal(COURSE_CFG.TIME_MODEL.label, "PROVIDER_METHODOLOGY");
  assert.match(COURSE_CFG.TIME_MODEL.note, /[Nn]ot a regulator figure/);
  const reconciliation = read("texas/tx-principles-real-estate-i-30-v1/submission/time-reconciliation.md");
  assert.match(reconciliation, /PROVIDER_METHODOLOGY/);
  assert.match(reconciliation, /RECONCILES/);
});

test("the 50-minute credit hour stays FORM_DERIVED_PENDING_TAC_CONFIRMATION until § 535.65 is read", () => {
  assert.equal(PRINS1.FORM.minutesPerCreditHourStatus, "FORM_DERIVED_PENDING_TAC_CONFIRMATION");
  assert.match(read("texas/tx-principles-real-estate-i-30-v1/submission/timed-course-outline.md"), /FORM_DERIVED_PENDING_TAC_CONFIRMATION/);
});

test("the statutory pacing limits are taught from their read sections: 12-hour day, 60-hour elapsed", () => {
  const m01 = read(`${CURRICULUM}/module-01.md`);
  assert.match(m01, /12 hours|twelve hours/i);
  assert.match(m01, /1101\.003/);
  const reconciliation = read("texas/tx-principles-real-estate-i-30-v1/submission/time-reconciliation.md");
  assert.match(reconciliation, /12 hours/);
  assert.match(reconciliation, /60 hours/);
});

/* ── 17-19: platform state ───────────────────────────────────────────────────────────────── */

test("nothing downstream of content is enabled on the course record", () => {
  const course = COURSE_CFG.COURSE;
  for (const flag of ["enrollmentEnabled", "paymentEnabled", "creditReportingEnabled", "certificateIssuanceEnabled", "finalExaminationAdministrable"]) {
    assert.equal(course[flag], false, flag);
  }
  /* TX-1B built the examination, so it exists — but it is not administrable until the codified
     22 TAC provider rules are read and the administration parameters confirmed. */
  assert.equal(course.finalExaminationExists, true);
  assert.equal(course.finalExaminationStatus, "BUILT_NOT_ADMINISTRABLE_PENDING_TAC_RULES");
  assert.equal(course.trecApprovalStatus, "NOT_SUBMITTED_NOT_APPROVED");
});

test("the curriculum teaches Texas and the two federal statutes only — no other state's law leaks in", () => {
  const body = allModules();
  for (const foreign of [/California Civil Code/i, /Business and Professions Code/i, /\bDRE\b/, /Wis\. Stat/i, /Arizona Revised/i, /\bADRE\b/]) {
    assert.doesNotMatch(body, foreign, `cross-jurisdiction contamination: ${foreign}`);
  }
});

test("the frozen California volume is untouched: same bytes, same hash", () => {
  const pdf = fs.readFileSync(path.join(ROOT, "california/print/final/Real_Estate_Principles_45_Hour_Final_458pp.pdf"));
  assert.equal(pdf.length, 6441134);
  assert.equal(crypto.createHash("sha256").update(pdf).digest("hex"), "f9968a7d2fad6bec8e4d233541912bcbca24c7cdcabddaa6997f7bbab8eab4ef");
});

/* ── 20-21: documents ────────────────────────────────────────────────────────────────────── */

test("the timed course outline traces every unit: objective and sources or stated reason", () => {
  const outline = read("texas/tx-principles-real-estate-i-30-v1/submission/timed-course-outline.md");
  for (const unit of PRINS1.ALL_UNITS) assert.ok(outline.includes(`${unit.code} — ${unit.unit}`), unit.code);
  assert.match(outline, /NOT submitted to or approved by/);
});

test("the TX-1B manifest records the authorization and keeps the administration blockers", () => {
  const manifest = read("texas/submission/tx1b-exam-build-input-manifest.md");
  assert.match(manifest, /TX-1B AUTHORIZED 2026-08-28 by owner instruction/);
  assert.match(manifest, /administration\s+BLOCKED/i);
  assert.match(manifest, /TX_PROVIDER_RULE_SOURCE_LOCK/);
  assert.match(manifest, /may NOT be promoted/i);
});

/* ── mutations: prove the guards can fail ────────────────────────────────────────────────── */

const SCRATCH = fs.mkdtempSync(path.join(ROOT, "node_modules/.tx1a-mutation-"));
test.after(() => fs.rmSync(SCRATCH, { recursive: true, force: true }));

/** A temp root whose curriculum is a copy of the real one, with one module body transformed. */
function mutatedRoot(name, file, transform) {
  const rootDir = path.join(SCRATCH, name);
  const dir = path.join(rootDir, CURRICULUM);
  fs.mkdirSync(dir, { recursive: true });
  for (const moduleEntry of COURSE_CFG.MODULES) {
    let body = read(`${CURRICULUM}/${moduleEntry.file}`);
    if (moduleEntry.file === file) body = transform(body);
    fs.writeFileSync(path.join(dir, moduleEntry.file), body);
  }
  return rootDir;
}

/** A temp copy of config/texas with one file transformed, importable in isolation. */
function mutatedConfig(name, file, transform) {
  const dir = path.join(SCRATCH, name);
  fs.mkdirSync(dir, { recursive: true });
  for (const entry of fs.readdirSync(path.join(ROOT, "config/texas"))) {
    let body = read(`config/texas/${entry}`);
    if (entry === file) body = transform(body);
    fs.writeFileSync(path.join(dir, entry), body);
  }
  return dir;
}

test("mutation: an invented dollar figure stated as law is caught", () => {
  const rootDir = mutatedRoot("m-dollar", "module-03.md", (body) =>
    body + "\n\nThe statute requires every applicant to pay a $500 homestead filing fee.\n");
  const trace = claimTraceability(rootDir);
  assert.equal(trace.status, "FAIL");
  assert.ok(trace.failures.some((f) => f.includes("legal figure without citation")), trace.failures.join("\n"));
});

test("mutation: an uncited percentage claim about Texas law is caught", () => {
  const rootDir = mutatedRoot("m-percent", "module-08.md", (body) =>
    body + "\n\nTexas law requires brokers to hold 10 percent of commissions in reserve.\n");
  const trace = claimTraceability(rootDir);
  assert.equal(trace.status, "FAIL");
});

test("mutation: citing a held-but-unread section is caught — HELD IS NOT READ", () => {
  const rootDir = mutatedRoot("m-unread", "module-01.md", (body) =>
    body.replace("§ 1101.351", "§ 1101.652"));
  const trace = claimTraceability(rootDir);
  assert.equal(trace.status, "FAIL");
  assert.ok(trace.failures.some((f) => f.includes("1101.652")), trace.failures.join("\n"));
});

test("mutation: tax-benefit content without the IRC is caught", () => {
  const rootDir = mutatedRoot("m-tax", "module-05.md", (body) =>
    body + "\n\nOwners may also claim depreciation deductions against rental income.\n");
  const trace = claimTraceability(rootDir);
  assert.equal(trace.status, "FAIL");
  assert.ok(trace.failures.some((f) => f.includes("tax-benefit vocabulary")));
});

test("mutation: removing a unit heading breaks the reconciliation", () => {
  const rootDir = mutatedRoot("m-unit", "module-02.md", (body) =>
    body.replaceAll("Personal Property", "[unit removed]"));
  const study = studyCourse(rootDir);
  assert.equal(study.everyUnitPresent, false);
  assert.equal(study.reconciles, false);
});

test("mutation: a unit relying on a source with nothing read refuses to load", async () => {
  const dir = mutatedConfig("m-held", "statute-sources.mjs", (body) => {
    const marker = 'Object.freeze({ section: "4005.001"';
    assert.ok(body.includes(marker));
    /* Empty gv-4005's read list while it still carries T05U8. */
    const start = body.indexOf(marker);
    const end = body.indexOf("],", start);
    return body.slice(0, start) + "\n    " + body.slice(end);
  });
  await assert.rejects(
    import(pathToFileURL(path.join(dir, "principles-i-course.mjs")).href),
    /HELD IS NOT READ/,
  );
});

test("mutation: altering a form subtotal refuses to load", async () => {
  const dir = mutatedConfig("m-subtotal", "prins1-course-form.mjs", (body) =>
    body.replace("subtotalMinutes: 205,", "subtotalMinutes: 210,"));
  await assert.rejects(
    import(pathToFileURL(path.join(dir, "prins1-course-form.mjs")).href),
    /units total|printed subtotal/,
  );
});
