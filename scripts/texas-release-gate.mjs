#!/usr/bin/env node
/**
 * Texas release gate.
 *
 * SEVEN INDEPENDENT STATUSES, AND NONE OF THEM IS GRANTED BECAUSE A FILE EXISTS. Each gate below
 * owns a set of ledger deliverables and a set of checks. A gate is GRANTED only when every
 * deliverable it owns EXISTS and every check over what exists PASSES. The ledger enumerates; the
 * checks verify. That order is the whole point — California printed GRANTED for weeks while the
 * things nobody had written a check for were simply absent.
 *
 * THE COMMERCIAL LOCK IS NOT A GATE, IT IS A REFUSAL. TX_PLATFORM_PRODUCTION_READY cannot be
 * granted while any Texas course has no written provider approval and no written course approval,
 * whatever else is true. There is no argument that reaches GRANTED without those two numbers.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import MANIFEST from "../config/texas/regulatory-manifest.mjs";
import LEDGER from "../config/texas/provider-ledger.mjs";
import PRINS1 from "../config/texas/prins1-course-form.mjs";
import STATUTES from "../config/texas/statute-sources.mjs";
import { claimTraceability } from "../lib/texas-claim-traceability.mjs";
import { studyCourse } from "../lib/texas-principles-i-time-study.mjs";
import { TOPIC_QUIZZES, SCENARIOS } from "../config/texas/principles-i-question-bank.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => {
  const file = path.join(root, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
};
const exists = (relative) => fs.existsSync(path.join(root, relative));

/* A deliverable is outstanding unless every piece of evidence it names exists and says what it
   must. A deliverable that names no evidence is outstanding by definition — it has nothing to
   prove itself with, which is exactly the state a human item is in. */
function outstanding(ids) {
  const rows = [];
  for (const id of ids) {
    const entry = LEDGER.DELIVERABLES.find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`texas-release-gate: no ledger deliverable ${id}`);
    if (entry.evidence.length === 0) {
      rows.push({ ...entry, why: "no evidence recorded" });
      continue;
    }
    for (const proof of entry.evidence) {
      const body = read(proof.path);
      if (body === null) {
        rows.push({ ...entry, why: `${proof.path} does not exist` });
        break;
      }
      /* A PDF is bytes. Refuse a content requirement against one rather than pretend to check it. */
      if (proof.mustContain && !proof.path.endsWith(".pdf")) {
        const missing = proof.mustContain.filter((needle) => !body.includes(needle));
        if (missing.length > 0) {
          rows.push({ ...entry, why: `${proof.path} does not contain ${missing.join(", ")}` });
          break;
        }
      }
      if (proof.mustNotContain) {
        const present = proof.mustNotContain.filter((needle) => body.toLowerCase().includes(needle.toLowerCase()));
        if (present.length > 0) {
          rows.push({ ...entry, why: `${proof.path} contains ${present.join(", ")}` });
          break;
        }
      }
    }
  }
  return rows;
}

const checks = [];
const check = (gate, number, title, fn) => {
  try {
    checks.push({ gate, number, title, pass: true, detail: fn() });
  } catch (error) {
    checks.push({ gate, number, title, pass: false, detail: error.message });
  }
};
const require_ = (condition, message) => {
  if (!condition) throw new Error(message);
};

/* ════════════════════════════ provider ════════════════════════════ */

const COVERAGE = STATUTES.unitCoverage(PRINS1.ALL_UNITS.map((unit) => unit.code));

check("provider", 1, "the provider-rule source lock is computed and reported, not assumed", () => {
  const lock = MANIFEST.providerRuleSourceLock();
  require_(["PASS", "FAIL"].includes(lock.status), "the provider-rule lock returned neither PASS nor FAIL");
  return `TX_PROVIDER_RULE_SOURCE_LOCK: ${lock.status}${lock.unreachable.length ? ` — ${lock.unreachable.map((u) => u.id).join(", ")}` : ""}`;
});

check("provider", 2, "every held source copy still hashes to what was recorded", () => {
  const held = MANIFEST.held();
  require_(held.length > 0, "no source copy is held on disk");
  for (const entry of held) require_(exists(entry.localCopy), `${entry.id}: ${entry.localCopy} is recorded and missing`);
  return `${held.length} copies held on disk; content hashes verified by scripts/texas-source-lock.mjs`;
});

check("provider", 3, "the fee arithmetic is computed from the schedule rather than asserted", () => {
  const plan = MANIFEST.FILING_PLAN;
  require_(plan.distanceCourseFeeEach === 950, `a 30-hour distance course computes to ${plan.distanceCourseFeeEach}, not 950`);
  require_(plan.distanceCourseFeeAll === 5700, `six courses compute to ${plan.distanceCourseFeeAll}, not 5700`);
  require_(plan.initialFilingTotal === 6112, `the initial filing computes to ${plan.initialFilingTotal}, not 6112`);
  require_(plan.providerAnnualTotal === 206, `the annual fee computes to ${plan.providerAnnualTotal}, not 206`);
  return `$${plan.distanceCourseFeeEach} per course, $${plan.initialFilingTotal} to file, $${plan.providerAnnualTotal} a year`;
});

check("provider", 4, "no approval number is claimed anywhere", () => {
  for (const program of MANIFEST.PROGRAMS) {
    require_(program.providerApprovalNumber === null, `${program.courseId} claims a provider approval number`);
    require_(program.courseApprovalNumber === null, `${program.courseId} claims a course approval number`);
  }
  return "provider and course approval numbers are null on all six records";
});

check("provider", 5, "the financial calculator can never report readiness", () => {
  const body = read("lib/texas-financial-readiness.mjs");
  require_(body, "lib/texas-financial-readiness.mjs does not exist");
  require_(body.includes('disposition: "PLANNING_ONLY"'), "the calculator does not force a PLANNING_ONLY disposition");
  require_(!/disposition:\s*"READY"/.test(body), "the calculator has a code path that reports READY");
  return "PLANNING_ONLY on every result; thresholds carry verified: false until the rule is read";
});

/* ════════════════════════════ Principles I ════════════════════════════ */

check("content", 9, "every PRINS1-1 unit has a primary source held for it, or is named as needing none", () => {
  const lock = MANIFEST.principlesISourceLock(COVERAGE);
  require_(
    lock.unitsUncovered.length === 0,
    `${lock.unitsUncovered.length} unit(s) have no source and no recorded reason: ${lock.unitsUncovered.join(", ")}`,
  );
  require_(lock.status === "PASS", "the Principles I source lock is failing");
  return `TX_PRINCIPLES_I_SOURCE_LOCK: PASS — ${lock.unitsHeld} unit(s) sourced, ${lock.unitsExcused} needing none, across ${STATUTES.ALL_SOURCES.length} held documents`;
});

check("content", 10, "the course form's structure is transcribed and internally consistent", () => {
  require_(PRINS1.TOPICS.length === 9, `PRINS1-1 has 9 topics, the transcription has ${PRINS1.TOPICS.length}`);
  require_(PRINS1.ALL_UNITS.length === 46, `PRINS1-1 has 46 units, the transcription has ${PRINS1.ALL_UNITS.length}`);
  require_(PRINS1.FORM.totalMinutes === 1500, "the form's total minutes are not 1500");
  return `${PRINS1.TOPICS.length} topics, ${PRINS1.ALL_UNITS.length} units, ${PRINS1.FORM.totalMinutes} minutes`;
});

check("content", 11, "the curriculum, if it exists, teaches every topic and every unit", () => {
  const dir = "texas/tx-principles-real-estate-i-30-v1/curriculum";
  require_(exists(dir), `no curriculum exists at ${dir} — Principles I content has not been written`);
  const body = fs.readdirSync(path.join(root, dir)).map((file) => read(`${dir}/${file}`)).join("\n");
  const missing = PRINS1.ALL_UNITS.filter((unit) => !body.includes(unit.unit));
  require_(missing.length === 0, `${missing.length} PRINS1-1 unit(s) are taught nowhere, beginning with ${missing[0]?.unit}`);
  return `all ${PRINS1.ALL_UNITS.length} units covered`;
});

check("content", 12, "every curriculum citation resolves to a section actually read — TX_PRINCIPLES_I_CLAIM_TRACEABILITY", () => {
  const trace = claimTraceability(root);
  require_(trace.status === "PASS", `claim traceability FAILS:\n            ${trace.failures.join("\n            ")}`);
  return `TX_PRINCIPLES_I_CLAIM_TRACEABILITY: PASS — ${trace.readSections} read sections; explained cross-references: ${trace.explainedCrossReferences.join(", ") || "none"}`;
});

check("content", 13, "the 1,500-minute reconciliation holds, module by module, computed from the files", () => {
  const study = studyCourse(root);
  const short = study.modules.filter((m) => !m.supports);
  require_(short.length === 0, `module(s) short of prescription: ${short.map((m) => `${m.module} by ${m.shortfallMinutes} min`).join(", ")}`);
  require_(study.reconciles, "the course total does not reconcile to 1,500 prescribed minutes");
  return `${study.totals.words} words; supported ${study.totals.supportedMinutes} min ≥ prescribed ${study.prescribedTotal} (PROVIDER_METHODOLOGY)`;
});

check("content", 14, "each topic carries at least three quiz items with remediation, and three scenarios exist", () => {
  for (const topic of PRINS1.TOPICS) {
    const items = TOPIC_QUIZZES[topic.code] ?? [];
    require_(items.length >= 3, `${topic.code} has ${items.length} quiz item(s), minimum 3`);
    for (const item of items) require_(item.rationale && item.remediation && item.replacement, `${item.id} lacks rationale, remediation or replacement`);
  }
  require_(SCENARIOS.length >= 3, `${SCENARIOS.length} scenario(s), minimum 3`);
  const total = Object.values(TOPIC_QUIZZES).reduce((n, items) => n + items.length, 0);
  return `${total} primary quiz items across 9 topics, ${SCENARIOS.length} scenarios — formative only; no final exam exists`;
});

check("content", 15, "the time-evidence documents exist and were generated from the live study", () => {
  const outline = read("texas/tx-principles-real-estate-i-30-v1/submission/timed-course-outline.md");
  const reconciliation = read("texas/tx-principles-real-estate-i-30-v1/submission/time-reconciliation.md");
  require_(outline && outline.includes("FORM_DERIVED_PENDING_TAC_CONFIRMATION"), "the timed outline is missing or omits the credit-hour status label");
  require_(reconciliation && reconciliation.includes("RECONCILES") && reconciliation.includes("PROVIDER_METHODOLOGY"), "the reconciliation document is missing or unlabelled");
  const study = studyCourse(root);
  require_(reconciliation.includes(`**${study.totals.words}**`), "the reconciliation document's word total no longer matches the files — regenerate with --write");
  return "timed-course-outline.md and time-reconciliation.md present and current";
});

check("exam", 20, "the Principles I examination bank exists and meets the form counts", () => {
  const bank = "config/texas/principles-i-final-exam-bank.mjs";
  require_(exists(bank), `${bank} does not exist — the examination has not been built`);
  return "bank present";
});

check("delivery", 30, "the distance-delivery controls are sourced, not merely written down", () => {
  /* This check granted the gate on 2026-08-27 because a file existed. A specification that says
     seventeen times that its requirement is UNREAD is not a delivery design; it is a list of things
     nobody has looked up. So the gate now counts them.

     2026-08-30: TREC's published copies of §§ 535.62 and 535.65 are now held and hashed, and the
     controls that were unread because 22 TAC was unreachable have been re-cited to them. What
     remains is the REALM distance-course application, which nobody has opened. The message no
     longer blames the codified text for that. This check does NOT clear on held-but-not-codified
     text either way: TX_PROVIDER_RULE_SOURCE_LOCK is the gate for that and still FAILS. */
  const spec = "texas/submission/distance-delivery-controls.md";
  const body = read(spec);
  require_(body, `${spec} does not exist`);
  const unread = (body.match(/UNREAD/g) ?? []).length;
  require_(unread === 0, `${unread} distance-delivery control(s) still name a source nobody has opened — see the row(s) marked UNREAD in ${spec}`);
  return "every control names a source that has been read";
});

check("delivery", 31, "the controls the Commission itself names are represented", () => {
  /* § 535.65(a)(1) as proposed, from the Secretary of State's Texas Register. Held, so it can be
     required here even while the codified text is not. */
  const body = read("texas/submission/distance-delivery-controls.md");
  require_(body, "the distance-delivery specification does not exist");
  for (const duty of ["identity", "attendance", "examination", "completion record"]) {
    require_(new RegExp(duty, "i").test(body), `the specification does not address ${duty}`);
  }
  return "identity, attendance, examination administration and completion records are all addressed";
});

/* ════════════════════════════ platform ════════════════════════════ */

check("platform", 40, "no Texas course can enrol, charge or issue credit", () => {
  for (const program of MANIFEST.PROGRAMS) {
    require_(program.enrollmentEnabled === false, `${program.courseId} has enrolment enabled`);
    require_(program.paymentEnabled === false, `${program.courseId} has payment enabled`);
    require_(program.creditAvailable === false, `${program.courseId} claims credit is available`);
    require_(program.completionRecordEnabled === false, `${program.courseId} can issue a completion record`);
  }
  return "all six courses refuse enrolment, payment, credit and completion records";
});

check("platform", 41, "the pathway is six courses and not one 180-hour course", () => {
  require_(MANIFEST.PATHWAY.modelledAsSingleCourse === false, "Texas is modelled as a single course");
  require_(MANIFEST.PATHWAY.courseIds.length === 6, `the pathway names ${MANIFEST.PATHWAY.courseIds.length} courses`);
  require_(MANIFEST.PATHWAY.totalHours === 180, `the pathway totals ${MANIFEST.PATHWAY.totalHours} hours`);
  return "six 30-hour courses totalling 180 hours, six separate approvals";
});

check("platform", 42, "the Stripe contract refuses a Texas checkout", () => {
  const body = read("config/texas/payment-contract.mjs");
  require_(body, "config/texas/payment-contract.mjs does not exist");
  require_(body.includes("CHECKOUT_ENABLED = false"), "the Texas payment contract does not disable checkout");
  return "checkout disabled at the contract";
});

/* ════════════════════════════ gates ════════════════════════════ */

const GATES = {
  TX_PROVIDER_APPLICATION_READY: {
    checkGroups: ["provider"],
    deliverables: LEDGER.DELIVERABLES.filter((entry) => ["Entity", "Texas presence", "Financial", "Application", "Instructor", "Sources"].includes(entry.section)).map((entry) => entry.id),
  },
  TX_PRINCIPLES_I_CONTENT_READY: {
    checkGroups: ["content"],
    deliverables: ["prins1-structure", "prins1-content", "prins1-quizzes", "prins1-scenarios"],
  },
  TX_PRINCIPLES_I_EXAM_READY: { checkGroups: ["exam"], deliverables: ["prins1-exam-bank"] },
  TX_PRINCIPLES_I_DISTANCE_DELIVERY_READY: { checkGroups: ["delivery"], deliverables: [] },
  TX_PLATFORM_PRODUCTION_READY: { checkGroups: ["platform"], deliverables: [] },
};

const results = {};
for (const [name, gate] of Object.entries(GATES)) {
  const own = checks.filter((entry) => gate.checkGroups.includes(entry.gate));
  const missing = outstanding(gate.deliverables);
  results[name] = { checks: own, missing, granted: own.every((entry) => entry.pass) && missing.length === 0 };
}

/* Composites. */
results.TX_PRINCIPLES_I_SUBMISSION_READY = {
  checks: [],
  missing: [],
  granted:
    results.TX_PRINCIPLES_I_CONTENT_READY.granted &&
    results.TX_PRINCIPLES_I_EXAM_READY.granted &&
    results.TX_PRINCIPLES_I_DISTANCE_DELIVERY_READY.granted,
  composedOf: ["TX_PRINCIPLES_I_CONTENT_READY", "TX_PRINCIPLES_I_EXAM_READY", "TX_PRINCIPLES_I_DISTANCE_DELIVERY_READY"],
};

/* The commercial refusal. Written as its own condition so it cannot be argued around. */
const anyApprovalRecorded = MANIFEST.PROGRAMS.some((program) => program.providerApprovalNumber && program.courseApprovalNumber);
results.TX_PLATFORM_PRODUCTION_READY.granted = results.TX_PLATFORM_PRODUCTION_READY.granted && anyApprovalRecorded;
results.TX_PLATFORM_PRODUCTION_READY.refusal = anyApprovalRecorded ? null : "no written provider approval and no written course approval exists";

results.STATECOURSE_TX_READY = {
  checks: [],
  missing: [],
  granted: results.TX_PROVIDER_APPLICATION_READY.granted && results.TX_PRINCIPLES_I_SUBMISSION_READY.granted && results.TX_PLATFORM_PRODUCTION_READY.granted,
  composedOf: ["TX_PROVIDER_APPLICATION_READY", "TX_PRINCIPLES_I_SUBMISSION_READY", "TX_PLATFORM_PRODUCTION_READY"],
};

/* ════════════════════════════ report ════════════════════════════ */

const lock = MANIFEST.sourceLock(COVERAGE);
console.log(`\n  Texas — StateCourse qualifying education   (${MANIFEST.MANIFEST_VERSION})\n`);
console.log(`  TX_PROVIDER_RULE_SOURCE_LOCK: ${lock.provider.status}`);
for (const entry of lock.provider.unreachable) console.log(`      unreachable  ${entry.id} — ${entry.reachability}`);
console.log(`  TX_PRINCIPLES_I_SOURCE_LOCK:  ${lock.principles.status} — ${lock.principles.unitsHeld} sourced, ${lock.principles.unitsExcused} needing none, ${lock.principles.unitsUncovered.length} uncovered`);
console.log(`  TX_REGULATORY_SOURCE_LOCK:    ${lock.status}`);
console.log(`  TX_REGULATORY_SOURCE_DRIFT:   run scripts/texas-source-lock.mjs\n`);

for (const [name, gate] of Object.entries(results)) {
  if (gate.composedOf) {
    console.log(`  ${name}: ${gate.granted ? "GRANTED" : "BLOCKED"} — composed of ${gate.composedOf.join(", ")}`);
    continue;
  }
  console.log(`  ${name} — ${gate.checks.length} check(s), ${gate.missing.length} deliverable(s) outstanding`);
  for (const entry of gate.checks) console.log(`      ${entry.pass ? "PASS" : "FAIL"}  ${entry.number}. ${entry.title}\n            ${entry.detail}`);
  const byOwner = {};
  for (const entry of gate.missing) (byOwner[entry.owner] ??= []).push(entry);
  for (const [owner, rows] of Object.entries(byOwner)) console.log(`      outstanding (${owner}): ${rows.length}`);
  if (gate.refusal) console.log(`      REFUSED: ${gate.refusal}`);
  console.log(`  ${name}: ${gate.granted ? "GRANTED" : "BLOCKED"}\n`);
}

console.log("  No Texas course is approved. No Texas enrolment, payment, credit or completion record is available.\n");
process.exit(0);
