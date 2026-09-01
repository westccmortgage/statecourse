/**
 * Law of Contracts, Topic 01 — course-specific source traceability before and during authoring.
 *
 * These are not inherited reliance claims from another Texas course. The same official bytes were
 * re-read for LOC-0 Topic 01, and the records below state exactly which LOC unit uses each section.
 * The TREC rule copy is the Commission's published reproduction; the Secretary of State codified
 * text remains unavailable and that comparison gap is carried expressly.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS } from "./law-of-contracts-course-form.mjs";
import { FORM_READS } from "./law-of-contracts-form-read-register.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const INVENTORY_PATH = "texas/trec-sources/source-inventory.json";
const FORM_CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/forms/catalog.json";
const MODULE_PATH = "texas/tx-law-of-contracts-30-v1/curriculum/module-01.md";
const inventory = JSON.parse(readFileSync(join(REPO_ROOT, INVENTORY_PATH), "utf8"));
const inventoryByPath = new Map(inventory.files.map((entry) => [entry.path, entry]));
const formCatalog = JSON.parse(readFileSync(join(REPO_ROOT, FORM_CATALOG_PATH), "utf8"));
const formsById = new Map(formCatalog.forms.map((entry) => [entry.formId, entry]));

const read = (section, reliedOnByUnits, note) =>
  Object.freeze({ section, reliedOnByUnits: Object.freeze(reliedOnByUnits), note });

const source = (record) => {
  const held = record.formId ? formsById.get(record.formId) : inventoryByPath.get(record.localCopy);
  if (!held) throw new Error(`LOC Topic 01 source is not in the tracked inventory: ${record.localCopy}`);
  const trackedPath = record.formId ? held.localCopy : held.path;
  if (trackedPath !== record.localCopy) throw new Error(`LOC Topic 01 source path differs from its tracked record: ${record.localCopy}`);
  const sectionsRead = Object.freeze(record.sectionsRead);
  return Object.freeze({
    ...record,
    sha256: held.sha256,
    bytes: held.bytes,
    readOn: "2026-08-31",
    reliedOnByUnits: Object.freeze([...new Set(sectionsRead.flatMap((entry) => entry.reliedOnByUnits))]),
    sectionsRead,
  });
};

export const MODULE_1_SOURCES = Object.freeze([
  source({
    id: "loc-oc-1101",
    citation: "Tex. Occupations Code ch. 1101",
    title: "Real Estate Brokers and Sales Agents (The Real Estate License Act)",
    authority: "Texas Legislature",
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    tier: "controlling",
    url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
    localCopy: "texas/trec-sources/statutes/OC.1101.htm",
    sectionsRead: [
      read("1101.001", ["T01U1", "T01U2"], "The statutory short title is The Real Estate License Act; this is the source for the course's use of the abbreviation TRELA."),
      read("1101.002", ["T01U1"], "Defines broker through the consideration-or-expectation threshold and enumerated acts; defines Commission, license holder, real estate, residential rental locator, and sales agent."),
      read("1101.004", ["T01U1"], "Defines when a person is engaged in real estate brokerage and states three activities that do not alone create brokerage status."),
      read("1101.151", ["T01U1", "T01U2"], "Requires the Commission to administer Chapters 1101 and 1102 and authorizes it to adopt and enforce necessary rules and establish conduct and ethics standards."),
      read("1101.155", ["T01U1", "T01U2", "T01U3", "T01U4"], "Authorizes Commission rules requiring forms prepared by the Broker-Lawyer Committee, preserves owner-prepared and owner-required attorney forms, and states required listing-form provisions."),
      read("1101.251", ["T01U4"], "Defines the committee in the subchapter as the Texas Real Estate Broker-Lawyer Committee."),
      read("1101.252", ["T01U4"], "Creates a thirteen-member committee: six Commission appointees, six State Bar appointees, and one public member appointed by the governor."),
      read("1101.253", ["T01U4"], "Provides staggered six-year committee terms, holdover service, and appointment to fill an unexpired vacancy."),
      read("1101.254", ["T01U4"], "Directs the committee to draft and revise standardizable forms to expedite transactions and minimize controversy, with safeguards adequate to protect principals."),
      read("1101.301", ["T01U2"], "Authorizes Commission standards for approval of qualifying programs and courses, directs the Commission to determine whether a course satisfies the governing chapters, and requires instructor qualifications for an application."),
      read("1101.351", ["T01U1", "T01U2"], "Generally bars acting or representing oneself as a broker, sales agent, or residential rental locator without the chapter's license and requires a sales agent to be sponsored and act for the broker."),
      read("1101.652", ["T01U2", "T01U5"], "States disciplinary grounds, including subsection (a-1)(3) for failing to use a Commission-required contract form and subsection (b) conduct rules relevant to transaction documents."),
      read("1101.654", ["T01U2", "T01U3", "T01U5"], "Requires suspension or revocation for specified unauthorized legal drafting or advice by a non-attorney license holder and states the statutory safe harbor for completing specified forms incidentally to brokerage."),
    ],
  }),
  source({
    id: "loc-bc-17",
    citation: "Tex. Business and Commerce Code ch. 17, subch. E",
    title: "Deceptive Trade Practices–Consumer Protection Act",
    authority: "Texas Legislature",
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    tier: "controlling",
    url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.17.htm",
    localCopy: "texas/trec-sources/statutes/BC.17.htm",
    sectionsRead: [
      read("17.45", ["T01U1", "T01U6"], "Defines goods to include real property purchased or leased for use, plus services, consumer, unconscionable action, trade and commerce, knowingly, economic damages, residence, and intentionally."),
      read("17.46", ["T01U6"], "Declares false, misleading, or deceptive acts in trade or commerce unlawful and enumerates the subsection (b) laundry-list practices, including misrepresented rights and intentional nondisclosure."),
      read("17.49", ["T01U6"], "States exemptions and exceptions, including professional services in subsection (c), qualifying written contracts over $100,000 in subsection (f), transactions over $500,000 in subsection (g), the residence exceptions, and the broker-or-salesperson rule and its three exceptions in subsection (i)."),
      read("17.50", ["T01U6"], "States the four consumer causes of action, producing-cause and detrimental-reliance requirements, economic and mental-anguish damage tiers, injunction and restoration remedies, and fee provisions."),
    ],
  }),
  source({
    id: "loc-tac-537-11",
    citation: "22 TAC § 537.11",
    title: "Use of Standard Contract Forms; Unauthorized Practice of Law",
    authority: "Texas Real Estate Commission published reproduction; Texas Secretary of State controlling text not compared",
    publisher: "Texas Real Estate Commission",
    sourceLayer: "TREC consolidated rules reproduction",
    tier: "controlling-reproduction",
    codifiedTextCompared: false,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/537.11.txt",
    sectionsRead: [
      read("537.11", ["T01U1", "T01U2", "T01U3", "T01U5"], "Read in full: mandatory-form rule and four exceptions; requirements where no mandatory form exists; eight unauthorized-practice prohibitions; permitted explanations and written-instruction changes; attorney-referral, binding-instrument, availability, and reproduction provisions."),
    ],
  }),
  source({
    id: "loc-form-20-19",
    formId: "20-19",
    citation: "TREC Form 20-19",
    title: "One to Four Family Residential Contract (Resale)",
    authority: "Texas Real Estate Commission official instrument",
    publisher: "Texas Real Estate Commission",
    sourceLayer: "official-instrument",
    tier: "instrument",
    effectiveDate: "2026-07-01",
    url: "https://www.trec.texas.gov/forms/one-four-family-residential-contract-resale",
    localCopy: "texas/tx-law-of-contracts-30-v1/sources/forms/20-19.pdf",
    sectionsRead: [
      read("pages 1-12", ["T01U1", "T01U2", "T01U5"], "Every page was text-extracted and visually inspected in the form-read register. Reliance is limited to the instrument's current identity, paragraph architecture, addenda checklist, signatures, broker-information fields, and receipt pages."),
    ],
  }),
]);

export const MODULE_1_SOURCE_GAPS = Object.freeze([
  Object.freeze({
    id: "sos-tac-22-537-11",
    tier: "controlling",
    status: "UNREAD_EXTERNAL_SOURCE",
    affectedUnits: Object.freeze(["T01U1", "T01U2", "T01U3", "T01U5"]),
    note: "The Secretary of State's codified 22 TAC § 537.11 could not be opened from this environment. The course identifies the held TREC reproduction every time it relies on the rule and does not claim a codified-text comparison.",
  }),
]);

const requirement = (sourceId, section, marker) => Object.freeze({ sourceId, section, marker });

/**
 * Every explicit source citation used inside a unit is listed here. Validation checks both halves of
 * the claim: the marker must be present in that unit's authored text, and the corresponding read
 * record must name that same unit. This prevents a source-level read from masquerading as complete
 * unit traceability.
 */
export const MODULE_1_UNIT_SOURCE_REQUIREMENTS = Object.freeze({
  T01U1: Object.freeze([
    requirement("loc-oc-1101", "1101.001", "1101.001"),
    requirement("loc-oc-1101", "1101.002", "1101.002"),
    requirement("loc-oc-1101", "1101.004", "1101.004"),
    requirement("loc-oc-1101", "1101.151", "1101.151"),
    requirement("loc-oc-1101", "1101.155", "1101.155"),
    requirement("loc-oc-1101", "1101.351", "1101.351"),
    requirement("loc-bc-17", "17.45", "17.45"),
    requirement("loc-tac-537-11", "537.11", "537.11"),
    requirement("loc-form-20-19", "pages 1-12", "Form 20-19"),
  ]),
  T01U2: Object.freeze([
    requirement("loc-oc-1101", "1101.001", "1101.001"),
    requirement("loc-oc-1101", "1101.151", "1101.151"),
    requirement("loc-oc-1101", "1101.155", "1101.155"),
    requirement("loc-oc-1101", "1101.301", "1101.301"),
    requirement("loc-oc-1101", "1101.351", "1101.351"),
    requirement("loc-oc-1101", "1101.652", "1101.652"),
    requirement("loc-oc-1101", "1101.654", "1101.654"),
    requirement("loc-tac-537-11", "537.11", "537.11"),
    requirement("loc-form-20-19", "pages 1-12", "Form 20-19"),
  ]),
  T01U3: Object.freeze([
    requirement("loc-oc-1101", "1101.155", "1101.155"),
    requirement("loc-oc-1101", "1101.654", "1101.654"),
    requirement("loc-tac-537-11", "537.11", "537.11"),
  ]),
  T01U4: Object.freeze([
    requirement("loc-oc-1101", "1101.155", "1101.155"),
    requirement("loc-oc-1101", "1101.251", "1101.251"),
    requirement("loc-oc-1101", "1101.252", "1101.252"),
    requirement("loc-oc-1101", "1101.253", "1101.253"),
    requirement("loc-oc-1101", "1101.254", "1101.254"),
  ]),
  T01U5: Object.freeze([
    requirement("loc-oc-1101", "1101.652", "1101.652"),
    requirement("loc-oc-1101", "1101.654", "1101.654"),
    requirement("loc-tac-537-11", "537.11", "537.11"),
    requirement("loc-form-20-19", "pages 1-12", "Form 20-19"),
  ]),
  T01U6: Object.freeze([
    requirement("loc-bc-17", "17.45", "17.45"),
    requirement("loc-bc-17", "17.46", "17.46"),
    requirement("loc-bc-17", "17.49", "17.49"),
    requirement("loc-bc-17", "17.50", "17.50"),
  ]),
});

/** Claim-level needles guard the highest-risk read notes against a right anchor / wrong summary. */
export const MODULE_1_CLAIM_NEEDLES = Object.freeze({
  "loc-oc-1101:1101.252": Object.freeze([
    "consists of 13 members",
    "six members appointed by the commission",
    "one public member appointed by the governor",
  ]),
  "loc-oc-1101:1101.652": Object.freeze([
    "fails to use a contract form required by the commission under section 1101.155",
    "fails or refuses to provide, on request, a copy of a document relating to a real estate transaction",
  ]),
  "loc-oc-1101:1101.654": Object.freeze([
    "drafts an instrument, other than a form described by section 1101.155",
    "completes a contract form for the sale, exchange, option, or lease of an interest in real property",
  ]),
  "loc-bc-17:17.49": Object.freeze([
    "involving total consideration by the consumer of more than $100,000",
    "represented by legal counsel who is not directly or indirectly identified, suggested, or selected by the defendant",
    "involving total consideration by the consumer of more than $500,000",
    "claim against a person licensed as a broker or salesperson under chapter 1101",
  ]),
  "loc-bc-17:17.50": Object.freeze([
    "producing cause of economic damages or damages for mental anguish",
    "relied on by a consumer to the consumer's detriment",
    "not more than three times the amount of economic damages",
  ]),
  "loc-tac-537-11:537.11": Object.freeze([
    "use only those contract forms approved for mandatory use by the Commission",
    "draft or recommend language to be included in a contract form defining or affecting the rights, obligations, or remedies",
    "the license holder shall advise the license holder's principals to consult an attorney",
  ]),
});

/** These checks bind high-risk source propositions to the authored unit, not merely to held bytes. */
export const MODULE_1_AUTHORED_CLAIM_CHECKS = Object.freeze([
  Object.freeze({
    sourceId: "loc-oc-1101",
    section: "1101.252",
    unit: "T01U4",
    authoredNeedles: Object.freeze(["thirteen members", "six appointed by the Commission", "one public member appointed by the governor"]),
  }),
  Object.freeze({
    sourceId: "loc-oc-1101",
    section: "1101.652",
    unit: "T01U2",
    authoredNeedles: Object.freeze(["fails to use a contract form required by the Commission", "requested copy of a transaction document"]),
  }),
  Object.freeze({
    sourceId: "loc-oc-1101",
    section: "1101.652",
    unit: "T01U5",
    authoredNeedles: Object.freeze(["on request", "signed copy of a document relating to a transaction"]),
  }),
  Object.freeze({
    sourceId: "loc-oc-1101",
    section: "1101.654",
    unit: "T01U3",
    authoredNeedles: Object.freeze(["requires suspension or revocation", "three form categories", "does not authorize the license holder to advise whether the resulting language is legally sufficient"]),
  }),
  Object.freeze({
    sourceId: "loc-bc-17",
    section: "17.49",
    unit: "T01U6",
    authoredNeedles: Object.freeze(["three exceptions", "more than $100,000", "more than $500,000", "does not involve the consumer's residence"]),
  }),
  Object.freeze({
    sourceId: "loc-bc-17",
    section: "17.50",
    unit: "T01U6",
    authoredNeedles: Object.freeze(["producing cause", "detrimental reliance", "not calculate a litigation recovery"]),
  }),
  Object.freeze({
    sourceId: "loc-tac-537-11",
    section: "537.11",
    unit: "T01U3",
    authoredNeedles: Object.freeze(["may not practice law", "change specifically instructed in writing", "advise principals to consult an attorney"]),
  }),
]);

const normalizeSourceText = (text) =>
  text
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&#39;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();

const boundedSectionText = (record, section, text) => {
  if (record.sourceLayer !== "tcss.legis.texas.gov static resources") return normalizeSourceText(text);
  const start = text.indexOf(`name="${section}"`);
  if (start < 0) return "";
  const afterStart = text.slice(start + section.length + 7);
  const next = afterStart.search(/<a name="(?:1101|17)\.\d+"/u);
  return normalizeSourceText(next < 0 ? afterStart : afterStart.slice(0, next));
};

export function validateModule1Sources() {
  const allowedUnits = new Set(["T01U1", "T01U2", "T01U3", "T01U4", "T01U5", "T01U6"]);
  const problems = [];
  let verifiedFiles = 0;
  let readSections = 0;
  const coveredUnits = new Set();
  const sourceEdges = new Set();
  const sourceById = new Map(MODULE_1_SOURCES.map((record) => [record.id, record]));
  const moduleText = readFileSync(join(REPO_ROOT, MODULE_PATH), "utf8");
  const topic = TOPICS.find((entry) => entry.code === "T01");
  const unitTextByCode = new Map();

  for (const [index, unit] of topic.units.entries()) {
    const heading = `## Unit: ${unit.unit}`;
    const start = moduleText.indexOf(heading);
    const next = topic.units[index + 1];
    const cumulativeCheck = moduleText.indexOf("### Misconception check", start);
    const recap = moduleText.indexOf("### Module recap", start);
    const lastUnitEnd = Math.min(...[cumulativeCheck, recap].filter((offset) => offset >= 0));
    const end = next ? moduleText.indexOf(`## Unit: ${next.unit}`) : lastUnitEnd;
    if (start < 0 || end < start) problems.push(`${unit.code}: authored unit heading is missing or out of order`);
    else unitTextByCode.set(unit.code, moduleText.slice(start, end));
  }

  for (const record of MODULE_1_SOURCES) {
    const bytes = readFileSync(join(REPO_ROOT, record.localCopy));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== record.bytes || hash !== record.sha256) {
      problems.push(`${record.id}: held bytes do not match the tracked source inventory`);
    } else {
      verifiedFiles += 1;
    }
    const text = bytes.toString("utf8");
    for (const entry of record.sectionsRead) {
      readSections += 1;
      if (entry.note.length < 80) problems.push(`${record.id} ${entry.section}: read note is too short`);
      for (const unit of entry.reliedOnByUnits) {
        coveredUnits.add(unit);
        sourceEdges.add(`${record.id}:${entry.section}:${unit}`);
        if (!allowedUnits.has(unit)) problems.push(`${record.id} ${entry.section}: non-Topic-01 unit ${unit}`);
      }
      if (record.sourceLayer === "tcss.legis.texas.gov static resources") {
        if (text.split(`name="${entry.section}"`).length - 1 !== 1) {
          problems.push(`${record.id}: section anchor ${entry.section} is not unique`);
        }
      } else if (record.sourceLayer === "TREC consolidated rules reproduction" && !text.includes("§537.11 Use of Standard Contract Forms; Unauthorized Practice of Law")) {
        problems.push(`${record.id}: held rule heading is missing`);
      } else if (record.sourceLayer === "official-instrument") {
        if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") problems.push(`${record.id}: held instrument is not a PDF`);
        if (entry.section !== "pages 1-12") problems.push(`${record.id}: form reliance exceeds the registered page read`);
      }
      const needles = MODULE_1_CLAIM_NEEDLES[`${record.id}:${entry.section}`] ?? [];
      const sectionText = boundedSectionText(record, entry.section, text);
      for (const needle of needles) {
        if (!sectionText.includes(needle.toLowerCase())) problems.push(`${record.id} ${entry.section}: claim needle is absent: ${needle}`);
      }
    }

    if (record.formId) {
      const held = formsById.get(record.formId);
      const formRead = FORM_READS.find((entry) => entry.formId === record.formId);
      if (record.title !== held?.name || record.effectiveDate !== held?.effectiveDate || record.url !== held?.formPageUrl) {
        problems.push(`${record.id}: title, effective date, or URL differs from the acquisition catalog`);
      }
      const pages = formRead?.pagesRead.map((entry) => entry.number) ?? [];
      if (formRead?.title !== record.title || JSON.stringify(pages) !== JSON.stringify(Array.from({ length: 12 }, (_, index) => index + 1))) {
        problems.push(`${record.id}: form-read register does not prove contiguous pages 1-12`);
      }
    }
  }

  const expectedCoverage = [...allowedUnits];
  if (expectedCoverage.some((unit) => !coveredUnits.has(unit))) {
    problems.push(`Topic 01 unit coverage is incomplete: ${expectedCoverage.filter((unit) => !coveredUnits.has(unit)).join(", ")}`);
  }

  const requirementEdges = new Set();
  for (const [unit, requirements] of Object.entries(MODULE_1_UNIT_SOURCE_REQUIREMENTS)) {
    const unitText = unitTextByCode.get(unit) ?? "";
    const actualMarkers = new Set([...unitText.matchAll(/\b(?:1101|17|537)\.\d+\b/gu)].map((match) => match[0]));
    if (unitText.includes("Form 20-19")) actualMarkers.add("Form 20-19");
    const expectedMarkers = new Set(requirements.map((required) => (required.section === "pages 1-12" ? "Form 20-19" : required.section)));
    if (JSON.stringify([...actualMarkers].sort()) !== JSON.stringify([...expectedMarkers].sort())) {
      problems.push(`${unit}: authored citation set ${[...actualMarkers].sort().join(", ")} differs from trace ${[...expectedMarkers].sort().join(", ")}`);
    }
    for (const required of requirements) {
      requirementEdges.add(`${required.sourceId}:${required.section}:${unit}`);
      const record = sourceById.get(required.sourceId);
      const entry = record?.sectionsRead.find((candidate) => candidate.section === required.section);
      if (!entry?.reliedOnByUnits.includes(unit)) {
        problems.push(`${unit}: ${required.sourceId} ${required.section} is cited but not mapped to the unit`);
      }
      if (!unitText.includes(required.marker)) {
        problems.push(`${unit}: expected authored citation marker ${required.marker} is absent`);
      }
    }
  }

  if (JSON.stringify([...sourceEdges].sort()) !== JSON.stringify([...requirementEdges].sort())) {
    problems.push("source→unit edges and authored citation requirements are not exactly bidirectional");
  }

  for (const check of MODULE_1_AUTHORED_CLAIM_CHECKS) {
    const sourceRecord = sourceById.get(check.sourceId);
    const sourceRead = sourceRecord?.sectionsRead.find((entry) => entry.section === check.section);
    if (!sourceRead?.reliedOnByUnits.includes(check.unit)) {
      problems.push(`${check.unit}: authored claim check is outside ${check.sourceId} ${check.section} reliance`);
      continue;
    }
    const authored = (unitTextByCode.get(check.unit) ?? "").toLowerCase();
    for (const needle of check.authoredNeedles) {
      if (!authored.includes(needle.toLowerCase())) problems.push(`${check.unit}: authored claim needle is absent: ${needle}`);
    }
  }

  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    sources: MODULE_1_SOURCES.length,
    verifiedFiles,
    readSections,
    coveredUnits: coveredUnits.size,
    codifiedRuleComparisonGaps: MODULE_1_SOURCE_GAPS.length,
    problems: Object.freeze(problems),
  });
}

const validation = validateModule1Sources();
if (validation.status !== "PASS") throw new Error(`LOC Topic 01 source validation: ${validation.problems.join("; ")}`);

export default Object.freeze({
  MODULE_1_SOURCES,
  MODULE_1_SOURCE_GAPS,
  MODULE_1_UNIT_SOURCE_REQUIREMENTS,
  MODULE_1_CLAIM_NEEDLES,
  MODULE_1_AUTHORED_CLAIM_CHECKS,
  validateModule1Sources,
});
