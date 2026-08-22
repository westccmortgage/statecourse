#!/usr/bin/env node
/*
 * The release gates.
 *
 * THREE STATUSES, AND WHY THEY ARE NOT ONE
 *
 *   CA_DRE_SUBMISSION_READY     — the filing. RE 306, instructional material, RE 336 with its
 *                                 supporting documents, the General Information Page, the timed
 *                                 outline, the student and instructor final examinations, and
 *                                 the examination and proctor instructions. This is what goes
 *                                 in an envelope to the Department of Real Estate.
 *
 *   CA_PLATFORM_PRODUCTION_READY — everything that moves money or records a student: Stripe
 *                                 checkout, package fan-out, webhooks, refund reconciliation,
 *                                 idempotency, the academic timing controls, and a fully green
 *                                 test suite.
 *
 *   STATECOURSE_CA_READY        — both of the above, and only then.
 *
 * The first two are INDEPENDENT. An earlier version made the filing depend on the payment
 * chain, which was wrong in a way worth stating: the Department is not asking about Stripe. A
 * submission package is complete or it is not, and whether a webhook test passes has no
 * bearing on whether the Department has what it needs. Coupling them would have meant a
 * payment defect blocking a filing it has nothing to do with, and — worse — a filing being
 * held while a payment problem was fixed, for no reason a regulator would recognise.
 *
 * The coupling that IS real runs the other way and lives in the aggregate: courses must not be
 * sold as qualifying education before the Commissioner approves them, so STATECOURSE_CA_READY
 * requires both, and neither gate alone authorises anything.
 *
 * Usage:
 *   node scripts/release-gate.mjs --gate submission
 *   node scripts/release-gate.mjs --gate platform
 *   node scripts/release-gate.mjs --gate all        (the aggregate; the default)
 *   ... --json
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { INSTRUCTOR, PRICING, PROVIDER } from "../config/california/submission-facts.mjs";
import {
  COMPLIMENTARY_DISCLOSURE,
  getCourse,
  getPackage,
  getPackageCatalog,
  packageAllocation,
} from "../config/course-catalog.mjs";
import { REFUND_POLICY_CLAUSES, REFUND_POLICY_TEXT, REFUND_POLICY_VERSION } from "../lib/refund-policy.mjs";
import { outstanding, submissionStatus } from "../lib/deliverable-status.mjs";
import { CALENDAR_COVERED_YEARS, unresolvedHolidaysFor } from "../config/california/business-day-calendar.mjs";
import { HANDLED_STRIPE_EVENTS } from "../lib/stripe-contract.mjs";
import {
  ACADEMIC_CONTROLS,
  AUTHORITIES,
  BPPE_EXEMPTION,
  DRE_FORMS,
  FORBIDDEN_CLAIMS,
  FIRST_FILING,
  MANIFEST_VERSION,
  SB1495,
  PROGRAMS,
  SCHOOL,
  staleAuthorities,
} from "../config/california/regulatory-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const GATE = flag("gate", "all");
const AS_JSON = args.includes("--json");

const read = (relative) => {
  const full = path.join(root, relative);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
};

/* Markdown, HTML and a PDF's extracted text each carry the same sentence differently.
   Comparing words rather than bytes is what lets one policy be checked in four renderings. */
const words = (text) =>
  String(text)
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll(/&#8220;|&#8221;|[“”]/g, '"')
    .replaceAll(/[‘’]/g, "'")
    .replaceAll(/[*_>]/g, "")
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s+([.,;:])/g, "$1")
    .trim();

const PROVIDER_LEGAL_NAME = PROVIDER.legalName;
const PROVIDER_STREET = PROVIDER.principalOffice.street;
const CONTACT_TITLE = INSTRUCTOR.contactTitle;

const results = [];
const check = (gate, id, title, fn) => {
  try {
    const detail = fn();
    results.push({ gate, id, title, status: "pass", detail: detail ?? null });
  } catch (error) {
    results.push({ gate, id, title, status: "block", detail: error.message });
  }
};
const require_ = (condition, message) => {
  if (!condition) throw new Error(message);
};

/*
 * The numbered directories under california/submission are not all course packets:
 * 00_administrative holds the entity, instructor and fee material that is filed once rather
 * than per course. A course packet is one that carries an RE 313 General Information Page,
 * because RE 313 is per course by definition.
 */
const SUBMISSION_DIRECTORIES = () => {
  const dir = path.join(root, "california/submission");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d\d_/.test(entry.name))
    .map((entry) => entry.name);
};

const COURSE_PACKETS = () =>
  SUBMISSION_DIRECTORIES().filter((name) =>
    fs.existsSync(path.join(root, "california/submission", name, "06-re313-general-information-page.md")),
  );

/* ══════════════════════════════ CA_DRE_SUBMISSION_READY ═══════════════════════════════ */

check("submission", 1, "policy_version is one value everywhere it appears", () => {
  require_(REFUND_POLICY_VERSION === PRICING.refundPolicy.version, "the engine and the facts file disagree on the version");
  const californiaCourses = ["ca-real-estate-principles-45", "ca-real-estate-practice-45", "ca-mortgage-loan-brokering-lending-45"];
  for (const id of californiaCourses) {
    const course = getCourse(id);
    require_(course, `${id} is not in the catalog`);
    require_(course.versions.refundPolicy === REFUND_POLICY_VERSION, `${id} refund version is ${course.versions.refundPolicy}`);
    require_(course.versions.cancellationPolicy === REFUND_POLICY_VERSION, `${id} cancellation version is ${course.versions.cancellationPolicy}`);
  }
  return `version ${REFUND_POLICY_VERSION} on ${californiaCourses.length} courses`;
});

check("submission", 2, "the canonical policy text is identical in every rendering", () => {
  const canonical = words(REFUND_POLICY_TEXT);
  require_(canonical.length > 200, "the canonical policy text is suspiciously short");
  for (const id of ["ca-real-estate-principles-45", "ca-real-estate-practice-45", "ca-mortgage-loan-brokering-lending-45"]) {
    require_(words(getCourse(id).policyText.refund) === canonical, `${id} serves a different policy text`);
  }
  /* Every clause must be a real sentence, not an empty string that trivially matches. */
  for (const [clause, text] of Object.entries(REFUND_POLICY_CLAUSES)) {
    require_(words(text).length > 40, `the ${clause} clause is empty or truncated`);
  }
  return `${Object.keys(REFUND_POLICY_CLAUSES).length} clauses, ${canonical.length} characters`;
});

check("submission", 3, "RE 313 carries the policy, its version, and no undecided field", () => {
  const packets = COURSE_PACKETS();
  require_(packets.length > 0, "no course packets have been generated");
  const canonical = words(REFUND_POLICY_TEXT);
  for (const packet of packets) {
    const relative = `california/submission/${packet}/06-re313-general-information-page.md`;
    const text = read(relative);
    require_(text, `${relative} is missing`);
    require_(words(text).includes(canonical), `${relative} does not carry the policy verbatim`);
    require_(text.includes(REFUND_POLICY_VERSION), `${relative} does not name the policy version`);
    require_(!/no policy has been decided|enter at signing/i.test(text), `${relative} still marks the refund field undecided`);
    require_(!/DRE requires seven|Department of Real Estate requires seven/i.test(text), `${relative} attributes the seven-day count to DRE`);
  }
  return `${packets.length} RE 313 sheets`;
});

check("submission", 4, "the published Terms carry every clause verbatim", () => {
  const terms = read("public/statecourse/terms/index.html");
  require_(terms, "the Terms page is missing");
  const normalised = words(terms);
  for (const [clause, text] of Object.entries(REFUND_POLICY_CLAUSES)) {
    require_(normalised.includes(words(text)), `the Terms do not carry the ${clause} clause verbatim`);
  }
  require_(normalised.includes(REFUND_POLICY_VERSION), "the Terms do not name the policy version");
  return "all clauses present";
});

check("submission", 5, "the policy is disclosed before checkout, not merely named", () => {
  const enrollment = read("public/statecourse/enrollment.js");
  const config = read("netlify/functions/payment-config.mjs");
  require_(enrollment && config, "the enrollment flow or the config endpoint is missing");
  require_(/policyText\?\.refund/.test(enrollment), "the refund acknowledgment does not render the policy text");
  require_(/policyText\?\.cancellation/.test(enrollment), "the cancellation acknowledgment does not render the policy text");
  require_(/ack-policy/.test(enrollment), "there is no element to display the policy in");
  require_(/policyText: course\.policyText/.test(config), "the config endpoint does not serve the policy text");
  const styles = read("public/statecourse/styles.css");
  require_(styles && /\.ack-policy/.test(styles), "the policy block has no styling and may render collapsed");
  return "policy text rendered above its acknowledgment";
});

check("submission", 6, "checkout persists a per-course allocation and refuses a stale acknowledgment", () => {
  const checkout = read("netlify/functions/create-checkout.mjs");
  require_(checkout, "create-checkout.mjs is missing");
  require_(/checkout_course_allocations/.test(checkout), "checkout does not persist an allocation");
  require_(/missing_or_stale_/.test(checkout), "checkout does not reject a stale acknowledgment version");
  require_(/checkoutMetadata\(/.test(checkout), "checkout does not build its Stripe metadata from the contract");
  const migration = read("database/008_california_refund_policy.sql");
  require_(migration && /create table if not exists checkout_course_allocations/.test(migration), "the allocation table is not created");
  return "allocation written before the student reaches Stripe";
});

check("submission", 7, "the refund calculation is the policy's, and refuses rather than guesses", () => {
  const endpoint = read("netlify/functions/request-refund.mjs");
  const contract = read("lib/stripe-contract.mjs");
  require_(endpoint && contract, "the refund path is missing");
  require_(/evaluateRefund/.test(endpoint), "the endpoint does not call the policy");
  require_(/california_refund_basis/.test(endpoint), "the endpoint does not read the refund basis");
  require_(/refund_progress_unknown_for_/.test(endpoint), "the endpoint does not stop on unknown progress");
  require_(!/input\.policyReviewApproved !== true/.test(endpoint), "the superseded manual approval gate is back");
  require_(/exceeds_policy_entitlement/.test(contract), "nothing refuses to exceed the entitlement");
  require_(/no_refund_due_under_policy/.test(contract), "nothing refuses a refund the policy denies");
  require_(!/"destination"|refund_destination/.test(contract + endpoint), "a refund is sent somewhere other than the original payment method");
  /* The business-day calendar must cover the years a window can fall in. */
  require_(CALENDAR_COVERED_YEARS.length > 0, "the business-day calendar covers no year at all");
  const thisYear = new Date().getUTCFullYear();
  require_(
    CALENDAR_COVERED_YEARS.includes(thisYear),
    `the business-day calendar does not cover ${thisYear}: no recorded date for ${unresolvedHolidaysFor(thisYear).join(", ")}`,
  );
  return `calendar covers ${CALENDAR_COVERED_YEARS.join(", ")}`;
});

check("submission", 8, "every package composition allocates to the cent and discloses what is free", () => {
  const packages = getPackageCatalog();
  require_(packages.length > 0, "no packages are defined");
  for (const bundle of packages) {
    const { allocated, reason } = packageAllocation(bundle.id);
    require_(allocated, `${bundle.id} cannot allocate: ${reason}`);
    const total = allocated.reduce((sum, entry) => sum + entry.allocatedAmount, 0);
    require_(total === bundle.priceCents, `${bundle.id} allocates ${total} cents against a price of ${bundle.priceCents}`);
    /* Determinism: the same package must allocate the same way on every run, or a pro-rata
       refund computed today and re-checked later would not agree. */
    const again = packageAllocation(bundle.id).allocated;
    require_(JSON.stringify(again) === JSON.stringify(allocated), `${bundle.id} does not allocate deterministically`);
    for (const component of bundle.complimentaryComponents) {
      const entry = allocated.find((item) => item.courseId === component.id);
      require_(entry, `${bundle.id} drops its complimentary component ${component.id}`);
      require_(entry.allocatedAmount === 0, `${component.id} is complimentary but carries ${entry.allocatedAmount} cents`);
      require_(COMPLIMENTARY_DISCLOSURE.includes(component.name), `${component.name} is not named in the disclosure`);
    }
  }
  return `${packages.length} packages allocate exactly`;
});

check("submission", 9, "no generated document carries a forbidden claim or a placeholder", () => {
  const forbidden = [
    [/state\s+course\s+LLC/i, "the provider name is misspelled as two words"],
    [/\bDRE[- ]approved\b/i, "a document claims DRE approval"],
    [/\bState[- ]Approved\b/i, "a document claims state approval"],
    [/\bapproved (provider|instructor|school)\b/i, "a document claims an approved provider, instructor or school"],
    [/\bTBD\b|\bTODO\b|\bXXX\b|\bLorem ipsum\b|\bPLACEHOLDER\b/i, "a placeholder survives in a filing document"],
    [/\bS\d{4,}\b/, "a sponsor number appears that DRE has not assigned"],
  ];
  const offenders = [];
  for (const packet of SUBMISSION_DIRECTORIES()) {
    const dir = path.join(root, "california/submission", packet);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      for (const [pattern, message] of forbidden) {
        const hit = text.match(pattern);
        /* A document may state that it does NOT claim approval; the claim is what is banned. */
        if (!hit) continue;
        /* A document may quote a forbidden string in order to forbid it, and the work order
           and the QA checklist both do. A hit inside quotes or backticks is a mention; a hit
           in running prose is a use. */
        const before = text.slice(Math.max(0, hit.index - 2), hit.index);
        const after = text.slice(hit.index + hit[0].length, hit.index + hit[0].length + 2);
        if (/["'`]$/.test(before) && /^["'`]/.test(after)) continue;
        const context = text.slice(Math.max(0, hit.index - 120), hit.index + 80);
        if (/\bnot\b|\bno\b|\buntil\b|never|forbid|must not|cannot|were wrong|was wrong|superseded|reappears/i.test(context)) continue;
        offenders.push(`${packet}/${file}: ${message} ("${hit[0]}")`);
      }
    }
  }
  require_(offenders.length === 0, offenders.join("; "));
  return `${SUBMISSION_DIRECTORIES().length} directories clean`;
});

check("submission", 10, "the human-only items are recorded as outstanding, not assumed done", () => {
  /*
   * These cannot be satisfied by code and must never be silently treated as satisfied. The
   * gate's job is to make sure the filing checklist still says they are outstanding, so that a
   * packet cannot be printed while a signature nobody has given is presumed given.
   */
  const outstanding = [
    ["professor equivalence certification", /equivalence certification|college.{0,20}certification/i],
    ["RE 306 signature", /RE 306/],
    ["RE 336 signature", /RE 336/],
    ["Certificate of Status", /Certificate of Status|Good Standing/i],
  ];
  const workOrder = read("docs/california/CLAUDE_DRE_REMEDIATION_WORK_ORDER.md");
  require_(workOrder, "the work order is missing");
  for (const [label, pattern] of outstanding) {
    require_(pattern.test(workOrder), `the filing checklist no longer tracks the ${label}`);
  }
  /* And nothing anywhere may assert that any of them is already in hand. */
  const claimed = /signature (has been|was) (obtained|received)|certification (has been|is) signed/i;
  for (const packet of SUBMISSION_DIRECTORIES()) {
    const dir = path.join(root, "california/submission", packet);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
      require_(!claimed.test(fs.readFileSync(path.join(dir, file), "utf8")), `${packet}/${file} asserts a signature is already obtained`);
    }
  }
  return `${outstanding.length} human-only items still tracked as outstanding`;
});

check("submission", 11, "RE 306 states each field the way the form and the regulation require", () => {
  for (const packet of COURSE_PACKETS()) {
    const relative = `california/submission/${packet}/01-re306-answer-sheet.md`;
    const text = read(relative);
    require_(text, `${relative} is missing`);

    /* Item 1A: the printed S is DRE's, the digits are DRE's to assign. */
    require_(/Leave the digits blank/.test(text), `${relative} item 1A does not say to leave the sponsor digits blank`);
    require_(/prefix; that character is DRE's and stays/.test(text), `${relative} item 1A does not preserve the printed S prefix`);

    /* Item 4: a principal office is an office, not a classroom. */
    require_(
      /N\/A — no classroom facility; correspondence\/internet course only/.test(text),
      `${relative} item 4 does not state that there is no classroom facility`,
    );
    require_(
      /principal office must not be entered here/i.test(text),
      `${relative} item 4 does not forbid entering the principal office as a classroom`,
    );
    const item4 = text.split("\n").find((line) => line.startsWith("| 4 |")) ?? "";
    require_(
      !new RegExp(PROVIDER_STREET.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(item4.split("must not be entered")[0]),
      `${relative} item 4 enters the principal office address as the classroom facility`,
    );

    /* Item 8: the exemption that can be proved on the day of filing. */
    require_(/94874\(f\)/.test(text), `${relative} item 8 does not cite the exemption relied on`);
    require_(
      !/94874\(d\)\(2\)\(A\)/.test(text),
      `${relative} item 8 still relies on the withdrawn licence-examination-preparation exemption`,
    );

    /* Page 3: two blocks, two signatures, one title. */
    require_(/owner \/ authorized school official/i.test(text), `${relative} does not require the owner/official block`);
    require_(/Digital or rubber-stamp signatures are not accepted/i.test(text), `${relative} does not state the signature rule`);
    require_(text.includes(CONTACT_TITLE), `${relative} does not carry the contact title from the facts file`);
  }
  return `${COURSE_PACKETS().length} RE 306 sheets`;
});

check("submission", 12, "the BPPE exemption is one the Bureau's own rule lets us evidence today", () => {
  const sheet = read("california/submission/00_administrative/A4-bppe-exemption-statement.md");
  require_(sheet, "the BPPE exemption statement is missing");
  require_(/94874\(f\)/.test(sheet), "the exemption statement does not cite Education Code 94874(f)");
  /* The Bureau asks a 94874(d)(2) claimant for a letter from the approving agency — an
     approval this application is applying for and does not have. */
  require_(/71395\(b\)\(7\)/.test(sheet), "the statement does not address the Bureau's evidentiary rule for 94874(d)(2)");
  require_(/71395\(b\)\(9\)/.test(sheet), "the statement does not address the Bureau's evidentiary rule for 94874(f)");
  require_(/withdrawn/i.test(sheet), "the statement does not record that the earlier basis was withdrawn");
  /* And the figure the exemption turns on must be the real one. */
  require_(
    sheet.includes(`$${PRICING.completePath.usd}`),
    `the statement does not state the highest program charge as $${PRICING.completePath.usd}`,
  );
  require_(PRICING.completePath.cents <= 250000, "the highest program charge now exceeds the 94874(f) threshold of $2,500");
  return `94874(f), highest charge $${PRICING.completePath.usd} against a $2,500 threshold`;
});

check("submission", 13, "RE 336 is the Department's own form, one per course, correctly named", () => {
  const generated = path.join(root, "california/dre-sources/generated");
  require_(fs.existsSync(generated), "no RE 336 forms have been generated");
  const forms = fs.readdirSync(generated).filter((name) => /^RE336-.*\.pdf$/.test(name));
  require_(forms.length === 3, `expected three course-specific RE 336 forms, found ${forms.length}`);
  /* Filled from the official form rather than retyped: the certification is made under
     penalty of perjury and must carry the Department's exact words. */
  require_(fs.existsSync(path.join(root, "california/dre-sources/RE336.pdf")), "the official RE 336 is not held");
  const filler = read("scripts/fill-re336.mjs");
  require_(/RE336\.pdf/.test(filler), "the filler does not start from the official form");
  require_(/Signature and date fields are deliberately left empty/.test(filler), "the filler may be signing the form");

  const data = JSON.parse(read("california/dre-sources/re336-data.json"));
  require_(data.provider.legalName === PROVIDER_LEGAL_NAME, `RE 336 names the provider "${data.provider.legalName}"`);
  require_(data.provider.sponsorId === "", "RE 336 carries a sponsor id DRE has not assigned");
  require_(data.primaryContact.title === CONTACT_TITLE, "RE 336 and the facts file give the contact different titles");
  require_(data.courses.length === 3, "RE 336 is not produced for all three courses");
  /* No blank duplicate: every generated form names its course. */
  const slugs = data.courses.map((title) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  for (const slug of slugs) {
    require_(forms.includes(`RE336-${slug}.pdf`), `no RE 336 generated for ${slug}`);
  }
  return `3 forms, provider ${PROVIDER_LEGAL_NAME}, sponsor id blank`;
});

check("submission", 14, "the sources are where we read them and unchanged since", () => {
  /* Run offline here: the gate must be runnable without egress, and the lock reports a skipped
     network check as skipped rather than as a pass. The online run is a separate command and
     is what must be green before a packet is printed. */
  let report = null;
  try {
    const stdout = execFileSync("node", ["scripts/regulatory-source-lock.mjs", "--offline", "--json"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    report = JSON.parse(stdout);
  } catch (error) {
    try {
      report = JSON.parse(error.stdout);
    } catch {
      require_(false, error.message.split("\n")[0]);
    }
  }
  /* The lock and the drift report are two answers, and this check needs both. A source that
     moved and a source that changed are different problems; either one stops a filing. */
  require_(
    report.REGULATORY_SOURCE_LOCK === "PASS",
    `REGULATORY_SOURCE_LOCK: FAIL — ${report.findings
      .filter((finding) => finding.status === "fail")
      .map((finding) => `${finding.id}: ${finding.message.split("\n")[0]}`)
      .join("; ")}`,
  );
  require_(
    report.REGULATORY_SOURCE_DRIFT === "NONE",
    `REGULATORY_SOURCE_DRIFT: ${report.REGULATORY_SOURCE_DRIFT} — a held document is not the one whose ` +
      "claims are recorded. Read it again; do not update the hash alone.",
  );
  require_(staleAuthorities().length === 0, `authorities need re-reading: ${staleAuthorities().join(", ")}`);
  return `LOCK PASS, DRIFT NONE — ${AUTHORITIES.length} authorities, ${DRE_FORMS.length} forms, manifest ${MANIFEST_VERSION}`;
});

check("submission", 15, "every regulated fact has one home and the manifest is it", () => {
  /* The two defects this manifest was built for: a BPPE basis that could not be evidenced, and
     a contact title nothing stated. Both are now facts with a single source. */
  require_(SCHOOL.legalName === PROVIDER.legalName, "the manifest and the facts file disagree on the legal name");
  require_(SCHOOL.contactTitle === INSTRUCTOR.contactTitle, "the manifest and the facts file disagree on the contact title");
  require_(SCHOOL.sponsorId === null, "the manifest carries a sponsor id DRE has not assigned");
  require_(BPPE_EXEMPTION.basis.includes("94874(f)"), "the manifest does not rely on the exemption that can be evidenced");
  require_(
    BPPE_EXEMPTION.highestProgramChargeUsd === PRICING.completePath.usd,
    "the manifest's highest program charge does not match the price list",
  );
  require_(
    BPPE_EXEMPTION.highestProgramChargeUsd <= BPPE_EXEMPTION.thresholdUsd,
    `the highest charge of $${BPPE_EXEMPTION.highestProgramChargeUsd} exceeds the $${BPPE_EXEMPTION.thresholdUsd} exemption threshold`,
  );
  for (const program of PROGRAMS) {
    require_(program.approvalNumber === null, `${program.title} carries an approval number`);
    require_(program.hours === ACADEMIC_CONTROLS.minimumHoursPerCourse, `${program.title} is ${program.hours} hours`);
  }
  /* Exactly one course carries the SB 1495 obligation, and it is the practice course. */
  const sb1495 = PROGRAMS.filter((program) => program.sb1495);
  require_(sb1495.length === 1 && /practice/i.test(sb1495[0].title), "SB 1495 is not attached to the practice course alone");
  return `${PROGRAMS.length} programs, ${AUTHORITIES.length} authorities, no approval claimed`;
});

check("submission", 16, "the academic controls are the regulation's numbers, enforced not described", () => {
  const controls = ACADEMIC_CONTROLS;
  /* Regulation 3000(a)(1). */
  require_(controls.minimumHoursPerCourse === 45, `minimum hours is ${controls.minimumHoursPerCourse}`);
  require_(controls.minimumLessonAssignments === 15, `minimum assignments is ${controls.minimumLessonAssignments}`);
  require_(controls.minutesPerClassroomPeriod === 50, `a period is ${controls.minutesPerClassroomPeriod} minutes`);
  /* RE 303 p.3: two and a half weeks is 420 hours, and the window is five weeks. */
  require_(controls.minimumElapsedHoursPerCourse === 420, `minimum elapsed is ${controls.minimumElapsedHoursPerCourse} hours`);
  require_(controls.maximumCoursesPerWindow === 2 && controls.windowDays === 35, "the two-course five-week window is wrong");
  require_(controls.crossSchoolRule === true, "the window is not applied across schools, and RE 303 says it must be");
  require_(controls.maximumCompletionDays === 365, `completion deadline is ${controls.maximumCompletionDays} days`);
  /* RE 303 final examination. */
  require_(controls.finalExamMinimumQuestions === 100, "the question minimum is wrong");
  require_(controls.finalExamPassingPercent === 60, "the passing score is wrong");
  require_(controls.finalExamMaximumAttempts === 2 && controls.finalExamRetakeMustDiffer, "the retake rule is wrong");
  require_(controls.finalExamNeverFurnishedToStudent === true, "the examination may be furnished to a student");
  require_(controls.certificateDeliveryDays === 15, "the certificate deadline is wrong");

  /* Described is not enough: the database must carry the same numbers. */
  const migration = read("database/004_california_prelicense.sql");
  require_(migration, "the California enrollment migration is missing");
  require_(
    new RegExp(`"minimum_elapsed_hours":${controls.minimumElapsedHoursPerCourse}`).test(migration),
    "the database does not enforce the minimum elapsed time",
  );
  require_(
    new RegExp(`"maximum_completion_days":${controls.maximumCompletionDays}`).test(migration),
    "the database does not enforce the completion deadline",
  );
  require_(
    new RegExp(`"window_days":${controls.windowDays}`).test(migration),
    "the database does not enforce the five-week window",
  );
  require_(
    new RegExp(`"lesson_assignments":${controls.minimumLessonAssignments}`).test(migration),
    "the database does not record the assignment count",
  );
  return `45h / 15 assignments / 420h elapsed / 2 per 35 days / 365 days, enforced in the database`;
});

check("submission", 17, "the examinations are sourced, distinct, traceable and complete", () => {
  /* The four gates RE 303's four sentences imply, run in full. scripts/exam-integrity.mjs is
     where each is defined; this is the gate refusing to grant while any of them is broken.
     Both defects it found on its first run were real: eighteen examination documents named a
     provider that is not the entity, and eight topics were taught in the lessons and examined
     on neither form. */
  let report = null;
  try {
    report = JSON.parse(
      execFileSync("node", ["scripts/exam-integrity.mjs", "--json"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
    );
  } catch (error) {
    try {
      report = JSON.parse(error.stdout);
    } catch {
      require_(false, error.message.split("\n")[0]);
    }
  }
  const broken = Object.entries(report.gates).filter(([, gate]) => !gate.pass);
  require_(
    broken.length === 0,
    broken.map(([name, gate]) => `${name}: ${gate.failures[0]}${gate.failures.length > 1 ? ` (and ${gate.failures.length - 1} more)` : ""}`).join("; "),
  );
  return `${report.counts.items} items, ${report.counts.forms} forms, ${report.counts.topics} topics — all ${Object.keys(report.gates).length} gates pass`;
});

check("submission", 18, "SB 1495 is enforced by the platform, not described by the course", () => {
  /* The defect: `interactive_requirements_complete` was `v_completed = 15` — a count of finished
     assignments. It reported the interactive participatory requirement satisfied for a student
     who had never written a word in either role. */
  const migration = read("database/012_sb1495_participatory_component.sql");
  require_(migration, "migration 012 does not exist");
  require_(/create table if not exists sb1495_participatory_submissions/.test(migration), "no table stores a role-play response");
  require_(/create trigger sb1495_assignment_completion_guard/.test(migration), "the completion guard is not a trigger, so a second caller could route around it");
  require_(
    /v_interactive := \(v_participation->>'both_roles_submitted'\)::boolean/.test(migration),
    "eligibility does not read the interactive requirement from the submissions",
  );
  require_(!/interactive_requirements_complete[^\n]*v_completed=15/.test(migration), "eligibility still counts assignments for the interactive requirement");
  require_(/sb1495_not_applicable_to_this_course/.test(migration), "the components could be submitted against a course that does not carry the requirement");

  const matrix = read(`california/submission/${SB1495.packageDir}/07-sb1495-traceability.md`);
  require_(matrix, "the traceability matrix does not exist");
  for (const banned of ["NOT FOUND", "NOT EXAMINED", "not located in the volume", "volume not read"]) {
    require_(!matrix.includes(banned), `the traceability matrix carries "${banned}"`);
  }
  const unproved = [...matrix.matchAll(/^\| (.+?) \| (.+?) \| \*\*(YES|NO)\*\* \|$/gm)].filter((row) => row[3] === "NO");
  require_(unproved.length === 0, `the matrix records ${unproved.length} participatory propert(ies) as not proved`);

  /* And the statement itself, on the two documents that carry it — and on no other course. */
  const practice = PROGRAMS.find((program) => program.sb1495);
  for (const file of ["06-re313-general-information-page.md", "15-re311-certificate-specimen.md"]) {
    require_(read(`california/submission/${practice.packageDir}/${file}`)?.includes(SB1495.statement), `${file} does not state "${SB1495.statement}"`);
    for (const other of PROGRAMS.filter((program) => !program.sb1495)) {
      require_(!read(`california/submission/${other.packageDir}/${file}`)?.includes(SB1495.statement), `${other.title} ${file} claims SB 1495 compliance`);
    }
  }
  const elements = SB1495.implicitBias.length + SB1495.fairHousing.length;
  return `${elements} elements traced, ${SB1495.roles.length} roles enforced, ${SB1495.enforcement.length} platform properties`;
});

check("submission", 19, "nothing anywhere offers these courses as approved qualifying education", () => {
  /*
   * The Commissioner approves a private-school course before it may be offered as qualifying
   * education. Until then the site may describe, price and test the courses, and may not
   * present them as approved. This is the one coupling between the two gates and it runs in
   * only one direction.
   */
  require_(/Approval sought/i.test(SCHOOL.approvalStatus), "the manifest's approval status no longer says approval is sought");

  /*
   * Scoped to California's own records rather than to any occurrence of the words.
   *
   * The registry and the catalog describe fifty-one jurisdictions, and describing another
   * state's rule is not a claim about ours: South Dakota's SDCL 36-21A-30.1 allows education
   * in "a commission-approved course given by commission-approved instructors", and Alaska's
   * 12 AAC 64.430(b) speaks of an examination turned in to "the approved instructor". Those
   * are those states' words about those states. What must never appear is an approval claim
   * attached to a StateCourse California course.
   */
  const californiaRecords = [];
  const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
  const california = (registry.states ?? registry).find((state) => state.state_code === "CA");
  require_(california, "California is missing from the state registry");
  californiaRecords.push({ where: "state-registry.json CA entry", value: california });

  const catalog = JSON.parse(read("public/statecourse/data/course-catalog.json"));
  const walk = (node, out = []) => {
    if (Array.isArray(node)) node.forEach((item) => walk(item, out));
    else if (node && typeof node === "object") {
      if (node.state_id === "CA") out.push(node);
      else Object.values(node).forEach((item) => walk(item, out));
    }
    return out;
  };
  for (const course of walk(catalog)) {
    californiaRecords.push({ where: `course-catalog.json ${course.course_id}`, value: course });
  }
  require_(californiaRecords.length >= 4, `expected the CA registry entry and three courses, found ${californiaRecords.length}`);

  const strings = (value, out = []) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => strings(item, out));
    else if (value && typeof value === "object") Object.values(value).forEach((item) => strings(item, out));
    return out;
  };
  for (const record of californiaRecords) {
    /* Structurally, first: an approval number or an open enrollment is a claim no wording can
       soften. */
    if (record.value.approval_number != null) require_(false, `${record.where} carries an approval number`);
    if (record.value.enrollment_enabled === true) require_(false, `${record.where} has enrollment enabled before approval`);
    if (record.value.approval_status && /^approved$/i.test(record.value.approval_status)) {
      require_(false, `${record.where} states approval_status "approved"`);
    }
    for (const text of strings(record.value)) {
      for (const claim of FORBIDDEN_CLAIMS) {
        const hit = text.match(claim.pattern);
        if (!hit) continue;
        const context = text.slice(Math.max(0, hit.index - 150), hit.index + 110);
        if (/\bnot\b|\bno\b|\buntil\b|never|pending|sought|proposed/i.test(context)) continue;
        require_(false, `${record.where} claims "${hit[0]}" — ${claim.why}`);
      }
    }
  }

  /* The Terms, which are one document about StateCourse and not a survey of states. */
  const terms = read("public/statecourse/terms/index.html");
  for (const claim of FORBIDDEN_CLAIMS) {
    const hit = terms?.match(claim.pattern);
    if (!hit) continue;
    const context = terms.slice(Math.max(0, hit.index - 150), hit.index + 110);
    if (/\bnot\b|\bno\b|\buntil\b|never|pending|sought/i.test(context)) continue;
    require_(false, `the Terms claim "${hit[0]}" — ${claim.why}`);
  }

  /* And enrollment stays shut until an approval record exists. */
  const catalogSource = read("config/course-catalog.mjs");
  require_(/course\.approvalStatus !== "approved"/.test(catalogSource), "checkout no longer requires an approval status");
  return `${californiaRecords.length} California records and the Terms carry no approval claim`;
});

/* ═══════════════════════════ CA_PLATFORM_PRODUCTION_READY ═════════════════════════════ */

check("platform", 20, "Stripe carries the same facts the database does", () => {
  const checkout = read("netlify/functions/create-checkout.mjs");
  const contract = read("lib/stripe-contract.mjs");
  require_(/asStripeParams\(metadata\)/.test(checkout), "the Checkout Session does not carry the metadata");
  require_(/asStripeParams\(metadata, "payment_intent_data\[metadata\]"\)/.test(checkout), "the PaymentIntent does not carry the metadata");
  for (const key of ["policy_version|refund_policy_version", "package_id", "course_allocation", "amount", "checkout_attempt_id"]) {
    require_(new RegExp(key).test(contract), `the metadata contract does not carry ${key}`);
  }
  require_(/allocation totals \$\{allocated\} cents but the charge is/.test(contract), "the allocation is not checked against the charge");
  return "session and intent both carry policy, package, allocation and amount";
});

check("platform", 21, "every Stripe event the system depends on is handled", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  require_(webhook, "the webhook is missing");
  for (const eventName of HANDLED_STRIPE_EVENTS) {
    require_(webhook.includes(`case "${eventName}"`), `${eventName} is not handled`);
  }
  require_(/verifyStripeSignature/.test(webhook), "the webhook processes unsigned requests");
  return `${HANDLED_STRIPE_EVENTS.length} events handled`;
});

check("platform", 22, "a repeated webhook cannot create a second enrollment or a second refund", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/001_payments_enrollment.sql");
  require_(/claim_stripe_event/.test(webhook), "events are not claimed");
  require_(/duplicate: true/.test(webhook), "a duplicate event is not short-circuited");
  require_(/if v_enrollment_id is not null then return v_enrollment_id; end if;/.test(migration), "a repeated paid session can create a second enrollment");
  require_(/on conflict \(stripe_refund_id\) do update/.test(migration), "a repeated refund event can create a second refund row");
  require_(/raise exception 'checkout payment mismatch'/.test(migration), "the charged amount is not checked against the attempt");
  return "idempotent at the event, the enrollment and the refund";
});

check("platform", 23, "Stripe and the database are reconciled, and a disagreement is recorded not raised", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/009_stripe_integrity.sql");
  require_(migration, "the Stripe integrity migration is missing");
  require_(/reconcileAgainstRecord/.test(webhook), "the webhook does not reconcile");
  require_(/add column if not exists stripe_charge_id/.test(migration), "the charge is not recorded");
  require_(/create table if not exists stripe_reconciliation_events/.test(migration), "a disagreement has nowhere to go");
  require_(/create or replace view stripe_reconciliation_open/.test(migration), "open disagreements cannot be listed");
  require_(!/raise exception[^;]*mismatch/i.test(migration), "a reconciliation mismatch raises instead of being recorded");
  return "intent, charge, currency, amount and status compared";
});

check("platform", 24, "a refund made in the Stripe Dashboard is recorded, classified and surfaced", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/010_external_refunds.sql");
  require_(migration, "external refunds are not handled");
  require_(/classifyRefundOrigin/.test(webhook), "the webhook does not classify a refund's origin");
  require_(/mark_external_refund/.test(webhook), "an external refund is not marked as one");
  require_(/origin text not null default 'platform'/.test(migration), "refunds do not record where they came from");
  require_(/policy_exception/.test(migration), "a refund exceeding the entitlement is not recorded as an exception");
  require_(/create or replace view refund_policy_exceptions_open/.test(migration), "exceptions cannot be surfaced to an administrator");
  /* The money has already moved, and no code path may try to take it back. The check is for
     a CALL that would reverse it, not for the word: the migration says in prose that a paid
     refund is "not something to reverse", and banning the word would ban saying so. */
  const reversal = /\b(reverse_refund|cancel_refund|void_refund|undo_refund)\b|stripeRequest\([^)]*reverse/i;
  require_(!reversal.test(migration + (read("netlify/functions/admin-refund-exceptions.mjs") ?? "")), "a code path attempts to reverse a refund that has already been paid");
  /* The assessment is separate from the recording, and does not live in the webhook. */
  const assessor = read("netlify/functions/admin-refund-exceptions.mjs");
  require_(assessor, "nothing assesses an external refund against the entitlement");
  require_(/assess_external_refund/.test(assessor), "the assessor does not record its assessment");
  require_(/create or replace view external_refunds_unassessed/.test(migration), "unassessed external refunds cannot be listed");
  require_(!/certificate_issued|percent_complete/.test(webhook), "the webhook reads course progress; payment must stay clear of compliance state");
  const toml = read("netlify.toml");
  require_(/\/api\/admin\/refund-exceptions/.test(toml), "the exception review endpoint is not routed");
  return "recorded at Stripe's amount, assessed separately, surfaced when it exceeds the entitlement";
});

check("platform", 25, "package fan-out creates one enrollment per component", () => {
  const migration = read("database/011_package_enrollments.sql");
  require_(migration, "package fan-out is not implemented: a package purchase would create one enrollment, not one per component");
  require_(/create or replace function finalize_paid_package/.test(migration), "there is no package finalisation path");
  for (const bundle of getPackageCatalog()) {
    require_(bundle.purchasable === true, `${bundle.id} is still marked not purchasable: ${bundle.notPurchasableReason}`);
  }
  return "one purchase, one allocation row per component, one enrollment per component";
});

check("platform", 26, "the whole test suite passes", () => {
  const output = execFileSync("node", ["--test", ...fs.readdirSync(path.join(root, "tests")).filter((name) => name.endsWith(".test.mjs")).map((name) => `tests/${name}`)], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  const pass = Number(output.match(/^# pass (\d+)$/m)?.[1] ?? 0);
  const fail = Number(output.match(/^# fail (\d+)$/m)?.[1] ?? -1);
  require_(fail === 0, `${fail} test(s) failing`);
  require_(pass > 0, "no tests ran");
  return `${pass} of ${pass} passing`;
});

/* ═════════════════════════════════════ report ══════════════════════════════════════════ */

/*
 * WHAT "GRANTED" MEANS, AND WHAT IT USED TO MEAN
 *
 * It used to mean that every check passed. That is a weaker statement than it reads as, and
 * this gate printed GRANTED on it while the SB 1495 traceability, the review credentials and
 * the signature sheets did not exist at all. Every check passed. None of them was about the
 * things that were missing, because a deliverable nobody wrote a check for cannot fail one.
 *
 * So the deliverable ledger comes first. A gate is GRANTED only when every mandatory
 * deliverable it is responsible for EXISTS, and every check over what exists PASSES. Checks
 * verify; they do not enumerate. The manifest enumerates.
 *
 * Only the submission gate carries deliverables. The platform gate is about behaviour rather
 * than about an envelope, and behaviour is exactly what a check is good at.
 */
const GATES = {
  submission: {
    key: "CA_DRE_SUBMISSION_READY",
    of: (result) => result.gate === "submission",
    deliverables: () => submissionStatus(),
  },
  platform: {
    key: "CA_PLATFORM_PRODUCTION_READY",
    of: (result) => result.gate === "platform",
    deliverables: () => [],
  },
};

const summary = Object.fromEntries(
  Object.entries(GATES).map(([name, gate]) => {
    const checks = results.filter(gate.of);
    const deliverables = gate.deliverables();
    const missing = outstanding(deliverables);
    return [
      name,
      {
        key: gate.key,
        checks,
        blocked: checks.filter((check) => check.status === "block"),
        deliverables,
        missing,
        granted: checks.every((check) => check.status === "pass") && missing.length === 0,
      },
    ];
  }),
);
const aggregateGranted = Object.values(summary).every((gate) => gate.granted);

const shown =
  GATE === "all" ? Object.keys(summary) : Object.keys(summary).filter((name) => name === GATE);
if (shown.length === 0) {
  console.error(`unknown gate "${GATE}" — expected submission, platform or all`);
  process.exit(2);
}
const shownGranted = shown.every((name) => summary[name].granted);

const PROGRAM_COUNT = PROGRAMS.length;
const owned = (missing, owner) => missing.filter((group) => group.owner === owner);
/* Naming three courses when all three are outstanding says less than saying so. */
const scopeOf = (group) =>
  group.programs.length === 0
    ? "filed once"
    : group.programs.length === PROGRAM_COUNT
      ? `all ${PROGRAM_COUNT} courses`
      : group.programs.join(", ");

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        aggregate: { key: "STATECOURSE_CA_READY", granted: aggregateGranted },
        firstFiling: FIRST_FILING.title,
        gates: Object.fromEntries(
          shown.map((name) => [
            summary[name].key,
            {
              granted: summary[name].granted,
              checks: summary[name].checks,
              deliverables: {
                required: summary[name].deliverables.length,
                satisfied: summary[name].deliverables.filter((entry) => entry.satisfied).length,
                outstanding: summary[name].missing,
              },
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );
} else {
  for (const name of shown) {
    const gate = summary[name];
    const width = Math.max(...gate.checks.map((check) => check.title.length));
    const ledger =
      gate.deliverables.length > 0
        ? ` over ${gate.deliverables.filter((entry) => entry.satisfied).length}/${gate.deliverables.length} deliverables`
        : "";
    console.log(`\n  ${gate.key} — ${gate.checks.length} checks${ledger}\n`);
    for (const check of gate.checks) {
      const mark = check.status === "pass" ? "PASS " : "BLOCK";
      console.log(`  ${mark}  ${String(check.id).padStart(2)}. ${check.title.padEnd(width)}  ${check.detail ?? ""}`);
    }
    console.log("");
    if (gate.granted) {
      console.log(`  ${gate.key}: GRANTED`);
    } else {
      console.log(`  ${gate.key}: BLOCKED`);
      if (gate.blocked.length > 0) {
        console.log(`\n    ${gate.blocked.length} check(s) failed:`);
        for (const check of gate.blocked) console.log(`      ${check.id}. ${check.title}\n         ${check.detail}`);
      }
      if (gate.missing.length > 0) {
        const shortfall = gate.deliverables.filter((entry) => !entry.satisfied).length;
        console.log(`\n    ${shortfall} of ${gate.deliverables.length} mandatory deliverables do not exist:`);
        const build = owned(gate.missing, "build");
        const human = owned(gate.missing, "human");
        if (build.length > 0) {
          console.log("\n      to be built:");
          for (const group of build) {
            console.log(`        ${group.section.padEnd(4)} ${group.label} — ${scopeOf(group)}`);
            for (const reason of group.reasons.slice(0, 3)) console.log(`             ${reason}`);
            if (group.reasons.length > 3) console.log(`             ... and ${group.reasons.length - 3} more`);
          }
        }
        if (human.length > 0) {
          console.log("\n      awaiting a signature, a letter, or an envelope — no amount of code finishes these:");
          for (const group of human) {
            console.log(`        ${group.section.padEnd(4)} ${group.label} — ${scopeOf(group)}`);
          }
        }
      }
    }
  }
  if (GATE === "all") {
    console.log("");
    console.log(
      aggregateGranted
        ? "  STATECOURSE_CA_READY: GRANTED — both gates pass.\n"
        : "  STATECOURSE_CA_READY: BLOCKED — the aggregate requires both gates.\n",
    );
    console.log(`  First filing: ${FIRST_FILING.title} only. DRE advises a first-time applicant to`);
    console.log("  submit one course, so that a deficiency is found once rather than three times.\n");
    /* Neither gate authorises selling a course. The Commissioner does. */
    console.log(
      "  Neither gate authorises offering these courses as qualifying education. Commissioner\n" +
        "  approval does, and none has been issued.\n",
    );
  } else {
    console.log("");
  }
}

process.exit(shownGranted ? 0 : 1);
