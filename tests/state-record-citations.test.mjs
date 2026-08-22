import assert from "node:assert/strict";
import fs from "node:fs";
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
  WI: [/Wis\. Stat\./, /\bREEB\b/, /\bSPS \d/, /Department of Safety and Professional Services/i],
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
 * The Arizona entry that carried the defect, pinned by its corrected content.
 * The figures here are the ones a source states: 75 percent is A.A.C.
 * R4-28-401(A)(1), the in-person proctoring requirement is A.R.S. § 32-2124(B),
 * and the five-year record is R4-28-404(D). The two manufactured claims — an
 * item-bank ratio and a student-device restriction — must not return.
 */
test("the Arizona record states the rules a source states and none it invented", () => {
  const arizona = registry.states.find((state) => state.state_code === "AZ");
  assert.ok(arizona, "Arizona is missing from the registry");

  assert.match(arizona.final_exam_rules, /75 percent/, "the passing score R4-28-401(A)(1) states is missing");
  assert.match(arizona.final_exam_rules, /R4-28-401\(A\)\(1\)/, "the passing score is stated without its rule");
  assert.match(arizona.proctoring_rules, /32-2124\(B\)/, "the proctoring statute is missing");
  assert.match(arizona.proctoring_rules, /IN PERSON/, "the statute's in-person proctoring requirement is missing");
  assert.match(arizona.record_retention_period, /R4-28-404\(D\)/, "the five-year record rule is missing");

  /*
   * Patterns that can only be an assertion. "no item-bank ratio is stated and
   * none is claimed" is the corrected text and must survive, so the ratio
   * pattern matches the figure rather than the words around it.
   */
  const invented = [
    /\b\d+\s*:\s*\d+\b[^.]{0,40}\b(bank|ratio|item pool)\b/i,
    /\b(bank|item pool)\b[^.]{0,40}\b\d+\s*:\s*\d+\b/i,
    /student-supplied device/i,
    /\bSPS \d/,
  ];
  for (const state of registry.states) {
    for (const text of collectStrings(state)) {
      for (const pattern of invented) {
        assert.equal(pattern.test(text), false, `${state.state_name} carries a manufactured rule matching ${pattern}: ${text.slice(0, 200)}`);
      }
    }
  }
  for (const course of catalogCourses) {
    for (const text of collectStrings(course)) {
      for (const pattern of invented) {
        assert.equal(pattern.test(text), false, `${course.course_id} carries a manufactured rule matching ${pattern}: ${text.slice(0, 200)}`);
      }
    }
  }
});

/*
 * Every built state must state its own source boundary — what was read, and
 * what was not and is therefore stated nowhere in the build. It is the section
 * a reviewer needs first, because it tells them what the build is silent about
 * on purpose rather than by oversight.
 *
 * The states do not share one heading. Eight use "what was NOT read"; Alaska
 * and Michigan use "open questions that must be answered before filing"; Maine
 * used "what has not been read" and Virginia "what is not yet read" until both
 * were rewritten. An audit pass that matched only one spelling reported Maine
 * and Virginia as having no boundary section when both did — hence the
 * alternatives below, and hence matching on the HEADING rather than on prose
 * anywhere in the file.
 */
const BOUNDARY_HEADING = /^#{2,3} .*(what (was|is|has) not|not (yet |been )?read|NOT obtained|open questions)/im;

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

test("every built state's regulatory record states its own source boundary", () => {
  for (const state of BUILT_STATE_DIRECTORIES) {
    const dir = path.join(root, state, "regulatory");
    assert.ok(fs.existsSync(dir), `${state} has no regulatory directory`);
    const carriers = fs
      .readdirSync(dir)
      .filter((file) => BOUNDARY_HEADING.test(fs.readFileSync(path.join(dir, file), "utf8")));
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
    // Code of Civil Procedure
    580: "CCP §§ 580b and 580d — anti-deficiency",
    704: "CCP § 704.730 — homestead exemption",
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
