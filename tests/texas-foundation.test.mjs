/*
 * Texas — the foundation, and the rule that no Texas content may exist without its sources.
 *
 * WHAT THESE TESTS ARE ABOUT. Texas is the first state in this project whose two highest
 * authorities could not be opened: the Secretary of State moved the Administrative Code into a
 * JavaScript portal and statutes.capitol.texas.gov serves an application shell for every document
 * path. So the interesting invariant here is not "is the content right" — there is no content —
 * it is "can content appear without the law behind it", and the answer has to be no.
 *
 * Two kinds of test below, and the second kind matters more.
 *
 *   FIXED tests assert what is true now: six separate courses, nothing enrolling, nothing charging,
 *   nothing approved, the fee arithmetic computed rather than asserted, the lock failing honestly.
 *
 *   CONDITIONAL tests are vacuous today and become binding the moment a curriculum file appears.
 *   They are written now, before the content, so that the content is written to them rather than
 *   the other way round. A conditional test that nobody notices is worthless; a conditional test
 *   written before the thing it guards is the only kind that ever catches anything.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import MANIFEST, { REACHABILITY } from "../config/texas/regulatory-manifest.mjs";
import LEDGER from "../config/texas/provider-ledger.mjs";
import PRINS1 from "../config/texas/prins1-course-form.mjs";
import PAYMENT from "../config/texas/payment-contract.mjs";
import { financialReadiness } from "../lib/texas-financial-readiness.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
const catalog = JSON.parse(read("public/statecourse/data/course-catalog.json"));
const texasCourses = catalog.categories.flatMap((c) => c.programs ?? []).flatMap((p) => p.courses ?? []).filter((c) => c.state_id === "TX");
const texasState = registry.states.find((s) => s.state_code === "TX");

const CURRICULUM_DIR = "texas/tx-principles-real-estate-i-30-v1/curriculum";
const curriculumExists = () => fs.existsSync(path.join(ROOT, CURRICULUM_DIR));
const curriculum = () =>
  fs.readdirSync(path.join(ROOT, CURRICULUM_DIR)).filter((f) => f.endsWith(".md")).map((f) => read(`${CURRICULUM_DIR}/${f}`)).join("\n");

/* ── the programme shape ─────────────────────────────────────────────────────────────────── */

test("Texas is six separate 30-hour courses", () => {
  assert.equal(MANIFEST.PROGRAMS.length, 6);
  for (const program of MANIFEST.PROGRAMS) assert.equal(program.hours, 30, `${program.courseId} is ${program.hours} hours`);
  assert.equal(new Set(MANIFEST.PROGRAMS.map((p) => p.courseId)).size, 6, "two programmes share a course id");
  assert.equal(new Set(MANIFEST.PROGRAMS.map((p) => p.formNumber)).size, 6, "two programmes share a TREC form");
  assert.equal(texasCourses.length, 6, `the catalog carries ${texasCourses.length} Texas courses`);
  for (const course of texasCourses) assert.equal(course.required_hours, 30);
});

test("the Sales Agent pathway totals 180 hours and is never one course", () => {
  assert.equal(MANIFEST.PATHWAY.totalHours, 180);
  assert.equal(MANIFEST.PATHWAY.modelledAsSingleCourse, false);
  assert.equal(MANIFEST.PATHWAY.courseIds.length, 6);
  assert.equal(texasState.prelicense_hours, 180);
  /* Six approvals, six enrolments, six completion records — so six catalog rows, not a bundle row. */
  assert.equal(texasState.course_ids.length, 6);
});

test("no Texas course can enroll, take payment, earn credit or issue a completion record", () => {
  for (const program of MANIFEST.PROGRAMS) {
    assert.equal(program.enrollmentEnabled, false, `${program.courseId}`);
    assert.equal(program.paymentEnabled, false, `${program.courseId}`);
    assert.equal(program.creditAvailable, false, `${program.courseId}`);
    assert.equal(program.completionRecordEnabled, false, `${program.courseId}`);
    assert.equal(program.providerApprovalNumber, null, `${program.courseId}`);
    assert.equal(program.courseApprovalNumber, null, `${program.courseId}`);
  }
  for (const course of texasCourses) {
    assert.equal(course.enrollment_enabled, false, course.course_id);
    assert.equal(course.approval_number, null, course.course_id);
    assert.equal(course.price, null, course.course_id);
  }
  assert.equal(PAYMENT.CHECKOUT_ENABLED, false);
  assert.equal(PAYMENT.mayOpenCheckout({}).allowed, false);
});

test("the payment contract refuses a checkout for each of its own reasons", () => {
  /* Even with checkout switched on, each refusal has to stand alone — satisfying five of them is
     not an argument for ignoring the sixth. */
  const ok = {
    providerApprovalNumber: "P-1", courseApprovalNumber: "C-1", enrollmentEnabled: true,
    courseApprovalExpiresOn: null, providerStatus: "active", studentAcceptanceTimestamp: "2026-01-01T00:00:00Z",
    enrollmentAgreementVersion: "v1", amount: 100, perCourseAllocation: [{ course_id: "x", amount: 100 }],
    asOf: "2026-01-01",
  };
  for (const refusal of PAYMENT.REFUSALS) {
    assert.equal(refusal.test(ok), false, `${refusal.id} fires on a complete context`);
  }
  assert.equal(PAYMENT.REFUSALS.find((r) => r.id === "no-provider-approval").test({ ...ok, providerApprovalNumber: null }), true);
  assert.equal(PAYMENT.REFUSALS.find((r) => r.id === "allocation-mismatch").test({ ...ok, amount: 101 }), true);
});

/* ── sources ─────────────────────────────────────────────────────────────────────────────── */

test("the source lock fails while an authority cannot be opened, and says which", () => {
  /* Updated by TX-0.1. The Occupations Code WAS recorded here as unreachable; it is now held from
     the Legislative Council's static layer, and asserting the old state would pin the mistake. */
  const provider = MANIFEST.providerRuleSourceLock();
  assert.equal(provider.status, "FAIL", "the provider lock passes while the codified TAC is unread");
  const ids = provider.unreachable.map((entry) => entry.id);
  assert.ok(ids.includes("sos-tac-22-535"), "the Administrative Code is not recorded as unreachable");
  const occ = MANIFEST.SOURCES.find((s) => s.id === "tx-occupations-code-1101");
  assert.equal(occ.reachability, REACHABILITY.READ, "the Occupations Code is still recorded as unreachable");
  assert.ok(occ.localCopy && occ.sha256, "the Occupations Code is recorded as read with no held copy");
});

test("every held source copy is on disk and hashes to what the manifest recorded", () => {
  const held = MANIFEST.held();
  assert.ok(held.length >= 6, `${held.length} copies held; at least the six course approval forms are expected`);
  for (const entry of held) {
    const file = path.join(ROOT, entry.localCopy);
    assert.ok(fs.existsSync(file), `${entry.id}: ${entry.localCopy} is recorded and missing`);
    const actual = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    assert.equal(actual, entry.sha256, `${entry.id}: ${entry.localCopy} has changed since it was recorded`);
  }
});

test("the TREC consolidated rules page is recorded as read and carries no claim", () => {
  const entry = MANIFEST.SOURCES.find((s) => s.id === "trec-consolidated-rules-page");
  assert.ok(entry, "the convenience copy is not recorded at all");
  assert.equal(entry.reachability, REACHABILITY.READ_NOT_AUTHORITY);
  assert.equal(entry.materialClaims.length, 0, "a material claim rests on the agency's own reproduction of the rules");
});

test("no Texas record cites another jurisdiction as authority", () => {
  /* The Arizona defect, generalised. Texas is a state whose own citation forms — A.R.S.-style
     initials it does not use — make a stray import easy to spot. */
  const FOREIGN = [
    [/\bA\.R\.S\./, "Arizona"], [/\bR4-28-/, "Arizona"], [/Business and Professions Code/i, "California"],
    [/\b10 CCR\b/, "California"], [/\bREEB\b/, "Wisconsin"], [/M\.R\.S\./, "Maine"], [/\b18 ?VAC ?135/, "Virginia"],
    [/\bRCW 18\.85/, "Washington"], [/Okla\. Stat\./, "Oklahoma"], [/\bRSMo\b/, "Missouri"],
  ];
  const strings = (value, out = []) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
    else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
    return out;
  };
  for (const record of [texasState, ...texasCourses]) {
    for (const text of strings(record, [])) {
      for (const [pattern, owner] of FOREIGN) {
        assert.doesNotMatch(text, pattern, `a Texas record cites ${owner}: ${text.slice(0, 140)}`);
      }
    }
  }
});

/* ── the course form ─────────────────────────────────────────────────────────────────────── */

test("PRINS1-1 is transcribed exactly, and the transcription checks itself", () => {
  assert.equal(PRINS1.FORM.formNumber, "PRINS1-1");
  assert.equal(PRINS1.FORM.revision, "09/11/2024");
  assert.equal(PRINS1.TOPICS.length, 9);
  assert.equal(PRINS1.ALL_UNITS.length, 46);
  assert.equal(PRINS1.FORM.totalMinutes, 1500);
  for (const topic of PRINS1.TOPICS) {
    const sum = topic.units.reduce((total, unit) => total + unit.minutes, 0);
    assert.equal(sum, topic.subtotalMinutes, `${topic.code} units sum to ${sum}, form prints ${topic.subtotalMinutes}`);
  }
  assert.equal(PRINS1.TOPICS.reduce((t, topic) => t + topic.subtotalMinutes, 0), 1500);
});

test("the 50-minute credit hour is labelled as the form's arithmetic, not as a rule", () => {
  assert.equal(PRINS1.FORM.minutesPerCreditHour, 50);
  assert.equal(PRINS1.FORM.minutesPerCreditHourStatus, "FORM_DERIVED_PENDING_TAC_CONFIRMATION");
});

/* ── fees and terms ──────────────────────────────────────────────────────────────────────── */

test("the filing arithmetic is computed from the published schedule", () => {
  assert.equal(MANIFEST.courseApplicationFee({ creditHours: 30 }), 950);
  assert.equal(MANIFEST.courseApplicationFee({ creditHours: 30, classroom: true }), 1250);
  assert.equal(MANIFEST.FILING_PLAN.distanceCourseFeeAll, 5700);
  assert.equal(MANIFEST.FILING_PLAN.initialFilingTotal, 6112);
  assert.equal(MANIFEST.FILING_PLAN.providerAnnualTotal, 206);
  assert.equal(MANIFEST.FEES.scheduleEffective, "2025-12-15");
});

test("provider and course approval terms are tracked, and the unread ones say so", () => {
  assert.equal(MANIFEST.PROVIDER_TERM.providerApprovalYears, 4);
  assert.ok(MANIFEST.PROVIDER_TERM.providerApprovalYearsSource, "the four-year term is asserted with no source");
  assert.equal(MANIFEST.PROVIDER_TERM.courseApprovalYears, null, "a course approval term is claimed and 22 TAC was not read");
  assert.match(MANIFEST.PROVIDER_TERM.courseApprovalYearsStatus, /UNVERIFIED/);
  /* The bond is now sourced — as PROPOSED text, which the status has to say. The reserve is not. */
  assert.match(MANIFEST.PROVIDER_TERM.bondAmountStatus, /as proposed/i, "the bond amount claims more than the source gives");
  assert.doesNotMatch(MANIFEST.PROVIDER_TERM.bondAmountStatus, /^VERIFIED\.?$/, "the bond amount is stated as fully verified");
  assert.match(MANIFEST.PROVIDER_TERM.reserveAmountStatus, /UNVERIFIED/);
});

test("the financial calculator is planning evidence and can never report readiness", () => {
  const result = financialReadiness({ cashAndEquivalents: 1, totalAssets: 1, currentLiabilities: 1, totalLiabilities: 0, equity: 1 });
  assert.equal(result.disposition, "PLANNING_ONLY");
  assert.equal(result.thresholdsVerifiedAgainstRule, false, "the thresholds claim to be verified against a rule nobody read");
  assert.match(result.caveat, /must not be filed/);
  const body = read("lib/texas-financial-readiness.mjs");
  assert.doesNotMatch(body, /disposition:\s*"READY"/);
  /* A zero denominator is not a pass. */
  const zero = financialReadiness({ cashAndEquivalents: 10, totalAssets: 10, currentLiabilities: 0, totalLiabilities: 0, equity: 10 });
  assert.equal(zero.meetsAllStatedThresholds, false, "a balance sheet with no current liabilities reports as meeting the thresholds");
});

/* ── no stale mandate may be stated ──────────────────────────────────────────────────────── */

test("no Texas record states blanket mandatory proctoring or a closed-book rule as a TREC mandate", () => {
  const texts = [
    JSON.stringify(texasState), JSON.stringify(texasCourses),
    read("texas/regulatory/primary-text-readings.md"),
    read("texas/submission/pre-enrollment-agreement.md"),
    read("texas/submission/distance-delivery-controls.md"),
  ].join("\n");
  /* The shape of the defect: an assertion that TREC requires it, not a mention of the subject. */
  const mandates = [
    /TREC requires (?:that )?(?:the |a )?(?:final |qualifying )?exam\w* (?:be |is )?proctored/i,
    /proctoring is required by TREC/i,
    /TREC requires (?:a |the )?closed[- ]book/i,
    /closed[- ]book (?:is |examination is )?required by TREC/i,
  ];
  for (const pattern of mandates) assert.doesNotMatch(texts, pattern, `a stale mandate matching ${pattern} is stated`);
  /* And the subject IS addressed rather than silently dropped. */
  assert.match(read("texas/submission/pre-enrollment-agreement.md"), /provider policy/i);
});

/* ── the public page ─────────────────────────────────────────────────────────────────────── */

test("the Texas public page says In Development and claims no approval", () => {
  const page = read("public/statecourse/real-estate/texas/index.html");
  assert.match(page, /In Development/);
  assert.match(page, /Not yet approved|Closed until approval/);
  for (const forbidden of [/TREC[- ]approved/i, /State Approved/i, /Enroll Now/i, /launch date/i, /pass rate/i, /Texas campus/i]) {
    assert.doesNotMatch(page, forbidden, `the Texas page carries ${forbidden}`);
  }
  assert.equal(texasState.provider_approval_number, null);
  assert.equal(texasState.public_status, "In Development");
});

/* ── the ledger and the memo ─────────────────────────────────────────────────────────────── */

test("the provider ledger reports itself incomplete against an application nobody could read", () => {
  assert.equal(LEDGER.LEDGER_STATUS.completeAgainstApplication, false);
  assert.match(LEDGER.LEDGER_STATUS.note, /INCOMPLETE/);
  for (const entry of LEDGER.DELIVERABLES) assert.equal(entry.verifiedAgainstApplication, false, `${entry.id} claims verification against the application`);
  const owners = new Set(LEDGER.DELIVERABLES.map((entry) => entry.owner));
  for (const owner of ["build", "human", "regulator"]) assert.ok(owners.has(owner), `no ${owner} deliverable exists`);
});

test("the clarification memo asks only what the sources do not answer, and answers nothing", () => {
  const memo = read("texas/submission/trec-clarification-memo.md");
  assert.match(memo, /REGULATOR CLARIFICATION/);
  for (const subject of [/surety bond/i, /reserve account/i, /registered[- ]agent/i, /records custodian/i, /proctoring/i, /inactivity timeout/i]) {
    assert.match(memo, subject, `the memo omits ${subject}`);
  }
  assert.match(memo, /has been answered by inference/i);
});

/* ── conditional: binding the moment Principles I content appears ────────────────────────── */

test("if Principles I content exists, every PRINS1-1 topic and unit is taught", { skip: !curriculumExists() && "no Principles I curriculum exists yet" }, () => {
  const body = curriculum();
  const missingTopics = PRINS1.TOPICS.filter((topic) => !body.includes(topic.topic));
  assert.deepEqual(missingTopics.map((t) => t.code), [], "PRINS1-1 topics taught nowhere");
  const missingUnits = PRINS1.ALL_UNITS.filter((unit) => !body.includes(unit.unit));
  assert.deepEqual(missingUnits.map((u) => u.code), [], "PRINS1-1 units taught nowhere");
});

test("the curriculum cites no section this project has not read (documented cross-references aside)", { skip: !curriculumExists() && "no Principles I curriculum exists yet" }, async () => {
  const { claimTraceability, EXPLAINED_CROSS_REFERENCES } = await import(path.join(ROOT, "lib/texas-claim-traceability.mjs"));
  const trace = claimTraceability(ROOT);
  assert.equal(trace.status, "PASS", trace.failures.join("\n"));
  /* The exceptions themselves stay small and justified. */
  assert.deepEqual(Object.keys(EXPLAINED_CROSS_REFERENCES).sort(), ["50", "53.254"]);
  for (const reason of Object.values(EXPLAINED_CROSS_REFERENCES)) assert.ok(reason.length > 40, "an undocumented cross-reference exception");
});

test("if a Principles I examination bank exists, it meets the form counts", { skip: !fs.existsSync(path.join(ROOT, "config/texas/principles-i-final-exam-bank.mjs")) && "no examination bank exists yet" }, async () => {
  const bank = (await import(path.join(ROOT, "config/texas/principles-i-final-exam-bank.mjs"))).default;
  const items = bank.items ?? [];
  assert.ok(items.length >= 120, `the bank has ${items.length} items, 120 is the floor`);
  const forms = Object.entries(bank.forms ?? {});
  assert.equal(forms.length, 4, `${forms.length} final versions exist, four are required`);
  for (const [name, list] of forms) {
    assert.ok(list.length >= 60, `form ${name} has ${list.length} items`);
    for (const item of list) assert.ok((item.choices ?? []).length > 2, `form ${name} contains a true/false item`);
    const topics = new Set(list.map((item) => item.source?.topic));
    for (const topic of PRINS1.TOPICS) assert.ok(topics.has(topic.code), `form ${name} does not examine ${topic.code}`);
  }
  /* Pairwise overlap: no two 60-item forms may share more than 20 items. */
  for (let i = 0; i < forms.length; i += 1) {
    for (let j = i + 1; j < forms.length; j += 1) {
      const a = new Set(forms[i][1].map((item) => item.id));
      const shared = forms[j][1].filter((item) => a.has(item.id)).length;
      const cap = Math.floor(Math.min(forms[i][1].length, forms[j][1].length) / 3);
      assert.ok(shared <= cap, `forms ${forms[i][0]} and ${forms[j][0]} share ${shared} items, cap ${cap}`);
    }
  }
});

/* ── the boundaries this work order set ──────────────────────────────────────────────────── */

test("no California file changed and the frozen volume is untouched", () => {
  const pdf = path.join(ROOT, "california/print/final/Real_Estate_Principles_45_Hour_Final_458pp.pdf");
  assert.ok(fs.existsSync(pdf), "the frozen California volume is missing");
  assert.equal(
    createHash("sha256").update(fs.readFileSync(pdf)).digest("hex"),
    "f9968a7d2fad6bec8e4d233541912bcbca24c7cdcabddaa6997f7bbab8eab4ef",
    "the frozen California Principles volume has changed",
  );
  assert.match(read("california/print/final/README.md"), /458/);
});

test("the Arizona correction is intact", () => {
  const arizona = registry.states.find((s) => s.state_code === "AZ");
  assert.equal(arizona.asynchronous_online_allowed, true);
  assert.match(arizona.final_exam_rules, /2:1/);
  assert.match(arizona.proctoring_rules, /device provided by the student/i);
  assert.match(arizona.proctoring_rules, /2025\.01/);
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * TX-0.1 — the source repair, and the two conclusions it corrects.
 *
 * The TX-0 report drew two conclusions that were wrong in the same way: it tested one endpoint and
 * generalised from it to a statement about Texas. `statutes.capitol.texas.gov/Docs/…` returns an
 * application shell, so "Texas statutes are unavailable"; the Texas Register issues through 21
 * August carried no § 535.62 or § 535.65 adoption, so "no adopted amendment appears".
 *
 * Both failed the same way, and the tests below are shaped by that. They do not merely assert the
 * corrected facts — they assert the DISCIPLINE: that a failing path is recorded as evidence about
 * that path, that a rule adopted but not yet in force is neither current nor missing, and that the
 * agency's own courtesy copy cannot stand in for the Secretary of State's text.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

import STATUTES from "../config/texas/statute-sources.mjs";

test("Texas statutes come from the official static Legislative Council layer", () => {
  assert.ok(STATUTES.STATUTE_CHAPTERS.length >= 25, `${STATUTES.STATUTE_CHAPTERS.length} chapters held`);
  for (const entry of STATUTES.STATUTE_CHAPTERS) {
    assert.match(entry.url, /^https:\/\/tcss\.legis\.texas\.gov\/resources\//, `${entry.id} does not use the static layer`);
    assert.doesNotMatch(entry.url, /statutes\.capitol\.texas\.gov/, `${entry.id} still uses the obsolete path`);
    assert.ok(fs.existsSync(path.join(ROOT, entry.localCopy)), `${entry.id}: ${entry.localCopy} is missing`);
    assert.equal(
      createHash("sha256").update(fs.readFileSync(path.join(ROOT, entry.localCopy))).digest("hex"),
      entry.sha256,
      `${entry.id} has changed since it was recorded`,
    );
  }
});

test("the obsolete path is recorded as evidence about itself, not about Texas", () => {
  assert.match(STATUTES.OBSOLETE_PATH.pattern, /statutes\.capitol\.texas\.gov/);
  assert.match(STATUTES.OBSOLETE_PATH.conclusion, /NOT evidence that Texas statutes are unavailable/i);
  const register = read("texas/regulatory/primary-text-readings.md");
  assert.match(register, /tcss\.legis\.texas\.gov/, "the register does not name the source layer that works");
  assert.doesNotMatch(
    register,
    /no Texas statutory text and no Texas rule text is quoted, paraphrased, relied on or\s*\n?stated anywhere in this build/i,
    "the register still carries the TX-0 conclusion that no Texas source could be read",
  );
});

test("holding a chapter is not reading it, and every read section is named", () => {
  assert.ok(STATUTES.SECTIONS_READ.length > 0, "no section is recorded as read");
  for (const entry of STATUTES.SECTIONS_READ) {
    assert.ok(entry.section, "a read record has no section number");
    assert.ok(entry.note && entry.note.length > 30, `${entry.section} is recorded as read with no note on what was taken from it`);
    assert.ok(entry.citation, `${entry.section} has no citation`);
  }
  /* Documents held with nothing read yet are expected and must not be counted as read. */
  const held = STATUTES.ALL_SOURCES.length;
  assert.ok(STATUTES.SECTIONS_READ.length < held * 5, "sections recorded as read outnumber what was plausibly opened");
});

test("every PRINS1-1 unit has a source held or a recorded reason for needing none", () => {
  const coverage = STATUTES.unitCoverage(PRINS1.ALL_UNITS.map((unit) => unit.code));
  assert.deepEqual(coverage.uncovered, [], "PRINS1-1 units with neither a source nor a reason");
  assert.equal(coverage.held.length + coverage.excused.length, 46);
  for (const entry of STATUTES.NO_STATUTE_REQUIRED) {
    assert.ok(entry.reason && entry.reason.length > 40, `${entry.unit} is excused with no real reason`);
  }
});

test("§§ 535.62 and 535.65 are adopted 10 August 2026 and effective 31 August 2026", () => {
  for (const id of ["trec-rule-535-62", "trec-rule-535-65"]) {
    const entry = MANIFEST.SOURCES.find((s) => s.id === id);
    assert.ok(entry, `${id} is not recorded`);
    assert.equal(entry.adoptedDate, "2026-08-10", `${id} adopted date`);
    assert.equal(entry.effectiveDate, "2026-08-31", `${id} effective date`);
    assert.equal(entry.proposedDate, "2026-05-04", `${id} proposed date`);
    assert.ok(entry.sosRecordId, `${id} carries no Secretary of State record id`);
  }
  /* And the register no longer says they do not exist. */
  const register = read("texas/regulatory/primary-text-readings.md");
  assert.doesNotMatch(register, /No adopted amendment to\s*\n?§ 535\.62 or § 535\.65 appears/i);
  assert.match(register, /10 August 2026/);
});

test("an adopted rule that is not yet in force is neither current nor missing", () => {
  /* The whole point of the status. Before 31 August 2026 these are adopted_pending_effective; a
     record calling them "current" would overstate, and one omitting them would understate. */
  for (const id of ["trec-rule-535-62", "trec-rule-535-65"]) {
    const entry = MANIFEST.SOURCES.find((s) => s.id === id);
    assert.equal(entry.status, "adopted_pending_effective", `${id} status`);
    assert.notEqual(entry.status, "current", `${id} is described as current before its effective date`);
  }
  const asOf = new Date("2026-08-27T00:00:00Z");
  const effective = new Date("2026-08-31T00:00:00Z");
  assert.ok(asOf < effective, "the fixture date is no longer before the effective date — revisit this test");
});

test("the TREC courtesy mirror cannot satisfy the official rule lock on its own", () => {
  const mirror = MANIFEST.SOURCES.find((s) => s.id === "trec-consolidated-rules-page");
  assert.equal(mirror.reachability, REACHABILITY.READ_NOT_AUTHORITY);
  assert.equal(mirror.materialClaims.length, 0);
  /* The codified rules are still recorded as unread, and the provider lock still fails. */
  const tac = MANIFEST.SOURCES.find((s) => s.id === "sos-tac-22-535");
  assert.equal(tac.reachability, REACHABILITY.UNREACHABLE_JS_ONLY);
  assert.equal(MANIFEST.providerRuleSourceLock().status, "FAIL", "the provider lock passes while the codified TAC is unread");
});

test("the two locks are independent, and the aggregate needs both", () => {
  const coverage = STATUTES.unitCoverage(PRINS1.ALL_UNITS.map((unit) => unit.code));
  const provider = MANIFEST.providerRuleSourceLock();
  const principles = MANIFEST.principlesISourceLock(coverage);
  const aggregate = MANIFEST.sourceLock(coverage);

  assert.equal(principles.status, "PASS", "the Principles I source lock is failing though every unit is sourced");
  assert.equal(provider.status, "FAIL", "the provider-rule lock passes though the codified TAC is unread");
  assert.equal(aggregate.status, "FAIL", "the aggregate passes while one component fails");

  /* Independence in the other direction: an empty coverage must fail Principles I and leave the
     provider lock exactly where it was. */
  const starved = MANIFEST.principlesISourceLock({ held: [], excused: [], uncovered: ["T01U1"] });
  assert.equal(starved.status, "FAIL");
  assert.equal(MANIFEST.providerRuleSourceLock().status, provider.status, "the provider lock moved when Principles I coverage changed");
});

test("the human export list asks for the unresolved rules and nothing more", () => {
  const list = read("texas/submission/human-export-list.md");
  for (const rule of ["535.55", "535.60", "535.61", "535.63", "535.64", "535.66", "535.67", "535.101"]) {
    assert.match(list, new RegExp(rule.replace(".", "\\.")), `the export list omits § ${rule}`);
  }
  assert.match(list, /not a\s*\n?request to export Texas law by hand/i, "the list does not say what it is not");
  assert.match(list, /535\.62.*535\.65|535\.65.*535\.62/s);
  /* It must not ask for the statutes, which are held. */
  assert.doesNotMatch(list, /export .{0,40}(Property Code|Occupations Code|Estates Code)/i, "the export list asks for statutes that are already held");
});

test("federal sources for Principles I are held and mapped", () => {
  assert.ok(STATUTES.FEDERAL_SOURCES.length >= 4);
  const units = new Set(STATUTES.FEDERAL_SOURCES.flatMap((entry) => entry.reliedOnByUnits));
  for (const unit of ["T09U3", "T08U3"]) assert.ok(units.has(unit), `no federal source is mapped to ${unit}`);
  for (const entry of STATUTES.FEDERAL_SOURCES) {
    assert.ok(fs.existsSync(path.join(ROOT, entry.localCopy)), `${entry.id}: ${entry.localCopy} is missing`);
  }
});

test("TX-1A wrote the curriculum; TX-1B (owner-authorized 2026-08-28) built the examination bank", () => {
  assert.equal(curriculumExists(), true, "the Principles I curriculum is missing — TX-1A built it");
  assert.equal(fs.existsSync(path.join(ROOT, "config/texas/principles-i-final-exam-bank.mjs")), true, "the final examination bank is missing — TX-1B was built");
});
