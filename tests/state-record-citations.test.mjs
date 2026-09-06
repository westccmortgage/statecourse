import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * A state's public record must cite its own regulator and no other.
 *
 * This guard exists because a real defect shipped: the Arizona registry entry
 * said "SPS 2025.01 controls" and the Arizona course record said the course was
 * "proposed under SPS 2025.01". SPS is Wisconsin's Department of Safety and
 * Professional Services. Nothing in Arizona law is numbered that way. The
 * string reached four generated pages — the national requirements table, the
 * course catalog, the Arizona jurisdiction hub, and the Arizona salesperson
 * course page — because the registry and catalog are the sole source those
 * pages render from and nothing checked them.
 *
 * The scope is deliberately narrow. Curriculum modules DO compare jurisdictions
 * on purpose: the Arizona duties module records that Arizona is a fiduciary
 * state where Washington's statute says its duties are "statutory duties and
 * not fiduciary duties" and Oklahoma abrogated them, and that contrast is the
 * point of the lesson. What must never happen is a state's REGULATORY RECORD —
 * the registry entry and the catalog entry a student reads as the statement of
 * that state's requirements — citing another state's statute, rule or agency.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);

/*
 * One entry per built jurisdiction, holding citation forms and agency names
 * distinctive enough that finding one inside a different state's record is a
 * defect and not a coincidence. Shared forms are excluded on purpose:
 * California and Colorado both publish in a "CCR", so the patterns carry the
 * title number that separates them, and bare "DRE" is not listed at all
 * because California and Colorado both use it.
 */
const JURISDICTION_CITATIONS = {
  AK: [/\bAS 08\.88/, /\b12 AAC 64\b/, /Alaska Real Estate Commission/i],
  AZ: [/A\.R\.S\./, /A\.A\.C\./, /\bR4-28-/, /Arizona Department of Real Estate/i, /\bADRE\b/],
  CA: [/Business and Professions Code/i, /\b10 CCR\b/, /California Department of Real Estate/i],
  CO: [/C\.R\.S\./, /\b4 CCR 725/, /\bREC-33\b/, /Colorado Division of Real Estate/i, /\bDPOS\b/],
  ME: [/M\.R\.S\./, /Maine Real Estate Commission/i],
  MI: [/\bMCL 339/, /\bLARA\b/, /Michigan Department of Licensing/i],
  MO: [/\bRSMo\b/, /\b20 CSR 2250/, /Missouri Real Estate Commission/i],
  NC: [/N\.C\.G\.S\./, /\b21 NCAC 58/, /North Carolina Real Estate Commission/i],
  OK: [/Okla\. Stat\./, /\bOAC 605\b/, /Oklahoma Real Estate Commission/i],
  PA: [/Pa\. Code\b/, /\b63 P\.S\./, /Pennsylvania Real Estate Commission/i],
  VA: [/\b54\.1-2\d/, /\b18 VAC 135/, /\bDPOR\b/],
  WA: [/\bRCW 18\.85/, /\bWAC 308-124/, /Washington State Department of Licensing/i],
  /* "SPS \d" was a Wisconsin marker here until 24 August 2026 and is the reason this file once
     helped delete a true Arizona rule: Wisconsin numbers administrative chapters "ch. SPS 5" and
     ARIZONA numbers its Substantive Policy Statements "S.P.S. 2025.01". The initials belong to both
     and identify neither, so they are not a marker. Wisconsin keeps three that are unambiguous. */
  WI: [/Wis\. Stat\./, /\bREEB\b/, /Department of Safety and Professional Services/i],
};

/* Every string anywhere inside a record, however deeply nested. */
const collectStrings = (value, out = []) => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === "object") for (const item of Object.values(value)) collectStrings(item, out);
  return out;
};

const foreignCitations = (stateCode, record) => {
  const found = [];
  for (const text of collectStrings(record)) {
    for (const [owner, patterns] of Object.entries(JURISDICTION_CITATIONS)) {
      if (owner === stateCode) continue;
      for (const pattern of patterns) {
        if (pattern.test(text)) found.push(`${owner} pattern ${pattern} in: ${text.slice(0, 200)}`);
      }
    }
  }
  return found;
};

test("no state registry entry cites another state's statute, rule or agency", () => {
  for (const state of registry.states) {
    const found = foreignCitations(state.state_code, state);
    assert.deepEqual(found, [], `${state.state_name} registry entry carries a foreign citation:\n${found.join("\n")}`);
  }
});

test("no catalog course record cites another state's statute, rule or agency", () => {
  for (const course of catalogCourses) {
    const found = foreignCitations(course.state_id, course);
    assert.deepEqual(found, [], `${course.course_title} carries a foreign citation:\n${found.join("\n")}`);
  }
});

test("every catalog course belongs to a state the registry lists, and the registry claims it back", () => {
  const byCode = new Map(registry.states.map((state) => [state.state_code, state]));
  for (const course of catalogCourses) {
    const state = byCode.get(course.state_id);
    assert.ok(state, `${course.course_id} names state ${course.state_id}, which the registry does not list`);
    assert.ok(
      (state.course_ids ?? []).includes(course.course_id),
      `${course.course_id} is in the catalog but ${state.state_name}'s registry entry does not list it`,
    );
  }
});

test("every course a registry entry claims exists in the catalog", () => {
  const catalogIds = new Set(catalogCourses.map((course) => course.course_id));
  for (const state of registry.states) {
    for (const courseId of state.course_ids ?? []) {
      assert.ok(catalogIds.has(courseId), `${state.state_name} claims course ${courseId}, which the catalog does not contain`);
    }
  }
});

/*
 * The Arizona entry, and the correction that replaced this test's original premise.
 *
 * This test used to assert that two claims in Arizona's record were absent: a 2:1 question-bank
 * ratio and a rule that the examination is not taken on a device the student supplies. The audit
 * of 21 August 2026 had called them manufactured and deleted them, and this test pinned the
 * deletion.
 *
 * Both are real. They are in ADRE Substantive Policy Statement 2025.01, Distance Learning
 * Education Course Guidelines, revised 6 March 2025, which that audit never opened — it reasoned
 * from the initials that "SPS" was Wisconsin's. ADRE's own Course Application Form (Rev. 09/2025)
 * makes the school administrator attest to following it. So the test asserted the absence of two
 * requirements the Department imposes, and would have kept them out indefinitely.
 *
 * The guard that was worth keeping is the one underneath: a rule of this kind must not appear
 * WITHOUT a source. That is now what is checked, in every state, and it is a better rule than a
 * word ban — it fails an invented requirement and passes a cited one, which is the actual
 * distinction the audit was reaching for and got backwards.
 */
test("the Arizona record states the rules its sources state, each with its source", () => {
  const arizona = registry.states.find((state) => state.state_code === "AZ");
  assert.ok(arizona, "Arizona is missing from the registry");

  /* What A.A.C. R4-28-401(A)(1), A.R.S. § 32-2124(B) and R4-28-404(D) state. */
  assert.match(arizona.final_exam_rules, /75 percent/, "the passing score R4-28-401(A)(1) states is missing");
  assert.match(arizona.final_exam_rules, /R4-28-401\(A\)\(1\)/, "the passing score is stated without its rule");
  assert.match(arizona.proctoring_rules, /32-2124\(B\)/, "the proctoring statute is missing");
  assert.match(arizona.proctoring_rules, /in person/i, "the statute's in-person proctoring requirement is missing");
  assert.match(arizona.record_retention_period, /R4-28-404\(D\)/, "the five-year record rule is missing");

  /* What S.P.S. 2025.01 states, restored 24 August 2026. Each must carry the policy statement. */
  assert.match(arizona.final_exam_rules, /2:1/, "the question-bank ratio S.P.S. 2025.01 requires is missing again");
  assert.match(arizona.final_exam_rules, /2025\.01/, "the ratio is stated without the policy statement that requires it");
  assert.match(arizona.proctoring_rules, /device provided by the student|student-supplied device/i, "the device rule S.P.S. 2025.01 states is missing again");
  assert.match(arizona.proctoring_rules, /2025\.01/, "the device rule is stated without the policy statement that states it");
  assert.match(arizona.proctoring_rules, /lock-?down browser/i, "the lock-down browser requirement is missing");

  /* A.R.S. § 32-2101(25) defines distance learning as possibly asynchronous. */
  assert.equal(arizona.asynchronous_online_allowed, true, "Arizona's asynchronous delivery is permitted by § 32-2101(25)");
  assert.ok(
    arizona.allowed_delivery_methods.some((method) => /32-2101\(25\)/.test(method)),
    "asynchronous delivery is asserted without the definition that permits it",
  );
});

/*
 * The guard the Arizona defect actually needed: a requirement of this shape may be stated, and
 * may not be stated without naming what states it. An invented rule has no citation to give.
 */
test("no state's record states a bank ratio or a device rule without its source", () => {
  const requiresSource = [
    /\b\d+\s*:\s*\d+\b[^.]{0,40}\b(bank|ratio|item pool)\b/i,
    /\b(bank|item pool)\b[^.]{0,40}\b\d+\s*:\s*\d+\b/i,
    /student-supplied device|device provided by the student/i,
  ];
  /* A statute, a rule, or a numbered policy statement — enough to be checked against a publisher. */
  const SOURCE = /A\.R\.S\.|A\.A\.C\.|R4-28-|S\.P\.S\.|Substantive Policy Statement|§|Stat\.|Admin\. Code|\bCCR\b|\bVAC\b|\bWAC\b|\bCSR\b|\bNCAC\b|\bOAC\b|M\.R\.S\.|C\.R\.S\.|RCW|RSMo/;
  const audit = (label, record) => {
    for (const text of collectStrings(record)) {
      for (const pattern of requiresSource) {
        if (!pattern.test(text)) continue;
        assert.match(
          text,
          SOURCE,
          `${label} states a rule matching ${pattern} and names no source for it: ${text.slice(0, 200)}`,
        );
      }
    }
  };
  for (const state of registry.states) audit(state.state_name, state);
  for (const course of catalogCourses) audit(course.course_id, course);
});

/*
 * Every built state must state its own source boundary — what was read, and
 * what was not and is therefore stated nowhere in the build. It is the section
 * a reviewer needs first, because it tells them what the build is silent about
 * on purpose rather than by oversight.
 *
 * The states do not share one heading. Eight use "what was NOT read"; Alaska
 * and Michigan historically used "open questions that must be answered before filing"; Maine
 * used "what has not been read" and Virginia "what is not yet read" until both
 * were rewritten. An audit pass that matched only one spelling reported Maine
 * and Virginia as having no boundary section when both did — hence the
 * alternatives below, and hence matching on the HEADING rather than on prose
 * anywhere in the file.
 */
const BOUNDARY_HEADING = /^#{2,3} .*(what (was|is|has) not|not (yet |been )?read|NOT obtained|open questions|source boundary|filing questions)/im;

const BUILT_STATE_DIRECTORIES = [
  "alaska",
  "arizona",
  "california",
  "colorado",
  "maine",
  "michigan",
  "missouri",
  "north-carolina",
  "oklahoma",
  "pennsylvania",
  "virginia",
  "washington",
  "wisconsin",
];

const boundaryCarriers = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((file) => BOUNDARY_HEADING.test(fs.readFileSync(path.join(dir, file), "utf8")));

test("source-boundary scans ignore evidence subdirectories", (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "statecourse-boundary-"));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));

  fs.writeFileSync(path.join(fixture, "record.md"), "## Source boundary\nReviewed sources are recorded here.\n");
  fs.mkdirSync(path.join(fixture, "source-evidence"));
  fs.writeFileSync(path.join(fixture, "source-evidence", "capture.txt"), "supporting evidence\n");

  assert.deepEqual(boundaryCarriers(fixture), ["record.md"]);
});

test("every built state's regulatory record states its own source boundary", () => {
  for (const state of BUILT_STATE_DIRECTORIES) {
    const dir = path.join(root, state, "regulatory");
    assert.ok(fs.existsSync(dir), `${state} has no regulatory directory`);
    const carriers = boundaryCarriers(dir);
    assert.ok(
      carriers.length > 0,
      `${state} states no source boundary — a reviewer cannot tell what the build is silent about on purpose`,
    );
  }
});

/*
 * California's register was the last one written, and it is unlike the other twelve.
 *
 * The build carried no statutory or regulatory section citations at all — the only four- and
 * five-digit numbers in its 45 lesson assignments were calendar years and arithmetic — and the
 * register said so, because a register that implied a traceability the curriculum did not have
 * would be the worst kind of document in this project.
 *
 * That changed on 22 August 2026, and it changed because of a requirement rather than a
 * preference. SB 1495 obliges the Real Estate Practice course to cover federal AND STATE fair
 * housing law, and a state-law component naming no California statute is not one. Six texts were
 * read in full and are now cited in Assignment 14.
 *
 * So the invariant is no longer "no citations". It is the stronger one the register now states:
 * EVERY section cited anywhere in the California curriculum must be a text this project has read
 * in its own words and recorded. A citation outside that list is a claim about law nobody here
 * has read.
 */
test("every California section citation is a text the register records as read", () => {
  const register = fs.readFileSync(path.join(root, "california/regulatory/primary-text-readings.md"), "utf8");
  /* The register's opening finding, which now describes an expansion rather than an absence. */
  assert.match(register, /not one lesson assignment cited a California statutory or regulatory section/i);
  assert.match(register, /Real Estate Principles, thirteen of fifteen assignments/i);
  assert.match(register, /is the statement of California law\s+correct/i);
  /* The register has to name the rule, not only happen to comply with it. */
  assert.match(register, /every statutory section cited anywhere in\s+the California curriculum must be one this register records as read in its own text/i);

  /*
   * The sections cited in the California curriculum, each read in its own text and recorded in
   * the register. The list is exact rather than generous: a citation outside it fails, and a
   * member of it that the register does not record fails too, so the two cannot drift apart.
   *
   * When a citation has to be added, the fix is to read the text and record it — never to delete
   * the citation and leave the teaching that rested on it.
   */
  /*
   * The sections cited in the California curriculum, each read in its own text and recorded in
   * the register. The list is exact rather than generous: a citation outside it fails, and a
   * member of it the register does not record fails too, so the two cannot drift apart.
   *
   * It grew on 22 August 2026, when the Principles instructional volume was expanded to meet
   * RE 303's ~450-page equivalence benchmark. The material used to close that gap was the
   * primary statutory text this register had recorded as the build's largest omission, which is
   * why the list is now mostly Business and Professions Code and Civil Code rather than nothing.
   *
   * When a citation has to be added, the fix is to read the text and record it — never to delete
   * the citation and leave the teaching that rested on it.
   */
  /*
   * Keyed by the INTEGER part of the citation, because that is what the scan captures: "§ 10153.2"
   * yields 10153 and "§ 704.730" yields 704. Subdivision numbers are not part of the key, so a
   * section and its subdivisions share one entry — which is correct here, since reading § 1102
   * is what licenses citing § 1102 at all.
   */
  const READ_IN_FULL = {
    // Federal, for the SB 1495 fair housing component
    3601: "42 U.S.C. § 3601 — Fair Housing Act, declaration of policy",
    3604: "42 U.S.C. § 3604 — the federal prohibitions",
    // Business and Professions Code
    10130: "B&P § 10130 — unlawful to act without a licence",
    10131: "B&P § 10131 — the acts that require a licence",
    10145: "B&P § 10145 — trust funds",
    10153: "B&P § 10153.2 — the statutory courses",
    10176: "B&P § 10176 — discipline within licensed activity",
    10177: "B&P § 10177 — discipline including outside a transaction",
    11000: "B&P § 11000 — subdivided lands",
    // Civil Code
    51: "Civil Code § 51 — Unruh Civil Rights Act",
    660: "Civil Code § 660 — affixation",
    683: "Civil Code § 683 — joint tenancy",
    1102: "Civil Code § 1102 — residential transfer disclosure article",
    1214: "Civil Code § 1214 — effect of recording",
    1624: "Civil Code § 1624 — statute of frauds",
    1950: "Civil Code § 1950.5 — security deposits",
    2079: "Civil Code § 2079.16 — the agency disclosure form",
    2924: "Civil Code § 2924 — power of sale",
    2192: "R&T § 2192.1 — tax and assessment liens take priority regardless of when created",
    8402: "Civil Code § 8402 — the site-improvement lien § 8450(a) excepts",
    8450: "Civil Code § 8450 — mechanics lien priority, measured from commencement of the work",
    8452: "Civil Code § 8452 — the payment-bond exception to § 8450",
    8458: "Civil Code § 8458 — site-improvement lien priority, set separately",
    // Code of Civil Procedure
    580: "CCP §§ 580b and 580d — anti-deficiency",
    703: "CCP §§ 703.140(b) and 703.150 — the Judicial Council's published exemption amounts, and their scope",
    704: "CCP §§ 704.010 et seq. and 704.730 — the exemption articles, and the homestead exemption",
    // Government Code, Health and Safety Code, Revenue and Taxation Code
    11911: "R&T § 11911 — documentary transfer tax",
    12955: "Government Code § 12955 — FEHA housing discrimination",
    35800: "Health and Safety Code Part 6 from § 35800 — the Holden Act",
    35801: "Health and Safety Code § 35801 — the Legislature's findings",
    66410: "Government Code § 66410 — the Subdivision Map Act",
    66424: "Government Code § 66424 — 'subdivision' for map purposes",
  };
  for (const [section, description] of Object.entries(READ_IN_FULL)) {
    assert.ok(register.includes(section), `${description} is on the allow-list and the register does not record it`);
  }

  /*
   * Sections that appear ONLY inside the quoted text of a section that was read. The register
   * names each and says none was opened. They are allowed in the curriculum for that reason and
   * for no other, and nothing in the build rests on any of them.
   */
  const QUOTED_ONLY = {
    // § 1102.2 and § 2079.13/.14 share their integer part with sections that were read.
    2985: "Civil Code § 2985, inside § 1102",


    4000: "Civil Code § 4000 (Davis-Stirling), inside B&P § 10153.2",
    6500: "Civil Code § 6500, inside B&P § 10153.2",
    5100: "Probate Code § 5100, inside Civil Code § 683",
    10000: "B&P § 10000, inside Civil Code § 1102(b)",
    11302: "B&P § 11302, inside Government Code § 12955(i)(2)",
    65000: "Government Code § 65000, inside § 12955(l)",
    12926: "Government Code § 12926, inside § 12955 and Civil Code § 51",
  };
  for (const [section, description] of Object.entries(QUOTED_ONLY)) {
    assert.ok(register.includes(section), `${description} is quoted in the curriculum and the register does not name it`);
  }
  assert.match(register, /Sections named inside a quotation are not sections this project has read/);

  const lessons = fs
    .readdirSync(path.join(root, "california"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, "california", entry.name, "curriculum")))
    .flatMap((entry) => {
      const dir = path.join(root, "california", entry.name, "curriculum");
      return fs
        .readdirSync(dir)
        .filter((file) => /^lesson-\d+\.md$/.test(file))
        .map((file) => ({ file: `${entry.name}/${file}`, text: fs.readFileSync(path.join(dir, file), "utf8") }));
    });
  assert.equal(lessons.length, 45, `expected 45 California lessons, found ${lessons.length}`);

  const citing = [];
  for (const lesson of lessons) {
    /* The § symbol admits two digits, because Civil Code § 51 is one. The bare word "Section"
       needs three, because the rectangular survey system numbers its sections 1 to 36 and
       "Beginning at the northeast corner of Section 14" is a legal description, not a citation. */
    const citations = [...lesson.text.matchAll(/(?:§\s?(\d{2,5})|(?:Section|Bus\. & Prof\.|B&P)\s?(\d{3,5}))(?:\.\d+)?/g)].map(
      (match) => match[1] ?? match[2],
    );
    if (citations.length > 0) citing.push(lesson.file);
    for (const section of citations) {
      assert.ok(
        Object.hasOwn(READ_IN_FULL, section) || Object.hasOwn(QUOTED_ONLY, section),
        `${lesson.file} cites § ${section}, which this project has neither read in its own text nor ` +
          "recorded as quoted from a section it did read. Read it and record it in " +
          "california/regulatory/primary-text-readings.md, or do not cite it.",
      );
    }
  }

  /* And the count the register states. If a second lesson starts citing law, the register's
     opening finding stops being true and has to be rewritten with it. */
  /* Thirteen Principles assignments and one Practice assignment. Mortgage cites nothing, and
     Practice's other fourteen cite nothing — which is what the register says. */
  assert.equal(citing.filter((file) => file.startsWith("ca-real-estate-principles")).length, 13, `Principles lessons citing law: ${citing.join(", ")}`);
  assert.deepEqual(
    citing.filter((file) => !file.startsWith("ca-real-estate-principles")),
    ["ca-real-estate-practice-45-v1/lesson-14.md"],
    `non-Principles lessons citing law: ${citing.join(", ")}`,
  );
});

test("California's register describes the build it currently has, not the one it used to have", () => {
  /*
   * The stale-state defect, and the only kind of defect this file is exposed to.
   *
   * The register's closing section was written on 21 August 2026 and was accurate that day: it said
   * California carried no section citations at all, that no California statutory or regulatory
   * figure appeared anywhere, and that the curriculum ran to 386,565 words. The expansion of 22
   * August and the correction of 23 August falsified all three, and rewrote the OPENING finding
   * into the past tense while leaving the closing one in the present. For a day the register's last
   * word on California traceability was a paragraph denying the traceability recorded in the tables
   * immediately above it.
   *
   * Nothing could have caught that. No generator writes this file, no gate reads it, and the source
   * lock scans california/submission only. So the counts it states are checked here against the
   * curriculum they describe, and the sentences that went stale are named so they cannot come back.
   */
  const root = path.resolve(import.meta.dirname, "..");
  const register = fs.readFileSync(path.join(root, "california/regulatory/primary-text-readings.md"), "utf8");

  /* Each of these was true on 21 August and false afterwards. A register may quote them as history
     — the current section does — but not assert them, so each is checked as a sentence rather than
     as a phrase: the historical paragraph reports them indirectly and does not reproduce them. */
  for (const stale of [
    /the build\s+carries no section citations at all/,
    /a sweep of all 45 lessons finds \*\*no California statutory or\s+regulatory figure of any kind\*\*/,
    /are written \*\*without a single citation to\s+the California law they describe/,
    /\*\*no California module states\s+a section number/,
  ]) {
    assert.doesNotMatch(register, stale, `the register asserts, in the present tense, something that stopped being true on 22 August 2026: ${stale}`);
  }

  /* The word counts, against the lessons themselves. This is what goes stale first and shows last. */
  const courses = {
    "Real Estate Principles": "ca-real-estate-principles-45-v1",
    "Real Estate Practice": "ca-real-estate-practice-45-v1",
    "Mortgage Loan Brokering and Lending": "ca-mortgage-loan-brokering-lending-45-v1",
  };
  let total = 0;
  for (const [title, courseId] of Object.entries(courses)) {
    const dir = path.join(root, "california", courseId, "curriculum");
    const words = fs
      .readdirSync(dir)
      .filter((file) => /^lesson-\d+\.md$/.test(file))
      .reduce((sum, file) => sum + fs.readFileSync(path.join(dir, file), "utf8").split(/\s+/).filter(Boolean).length, 0);
    total += words;
    assert.ok(
      register.includes(words.toLocaleString("en-US")),
      `${title} is ${words.toLocaleString("en-US")} words and the register does not state that figure`,
    );
  }
  assert.ok(
    register.includes(total.toLocaleString("en-US")),
    `the California curriculum is ${total.toLocaleString("en-US")} words and the register does not state that total`,
  );

  /* And the counts of what cites law, spelled as the section spells them. */
  const spell = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
    "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  const named = (value) => (value <= 20 ? spell[value] : value === 31 ? "thirty-one" : String(value));
  const citing = { "ca-real-estate-principles-45-v1": 0, "ca-real-estate-practice-45-v1": 0, "ca-mortgage-loan-brokering-lending-45-v1": 0 };
  let lessons = 0;
  for (const courseId of Object.keys(citing)) {
    const dir = path.join(root, "california", courseId, "curriculum");
    for (const file of fs.readdirSync(dir).filter((name) => /^lesson-\d+\.md$/.test(name))) {
      lessons += 1;
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      if (/(?:§\s?\d{2,5}|(?:Section|Bus\. & Prof\.|B&P)\s?\d{3,5})/.test(text)) citing[courseId] += 1;
    }
  }
  const cited = Object.values(citing).reduce((sum, value) => sum + value, 0);
  const expectations = [
    [named(citing["ca-real-estate-principles-45-v1"]), "Real Estate Principles lesson assignments that cite law"],
    [named(lessons - cited), "lesson assignments that cite nothing"],
  ];
  for (const [word, what] of expectations) {
    assert.match(
      register.toLowerCase(),
      new RegExp(word.toLowerCase()),
      `the register does not state "${word}" — the number of ${what}`,
    );
  }
});
