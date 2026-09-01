/**
 * Texas Law of Contracts — section-level read register for the nine course-local statute chapters.
 *
 * The acquisition catalog proves which official chapter bytes are held. This register records the
 * narrower fact that 45 named sections were opened and read for pre-authoring research. Candidate
 * units identify where a section may be useful; they are not a claim that curriculum exists or that
 * a unit relies on the section. Common-law propositions, federal law, TREC rules, and statutes held
 * elsewhere still need their own source treatment before authoring.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_UNITS } from "./law-of-contracts-course-form.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/statutes/catalog.json";
export const CATALOG_SHA256 = "85077f6000f163ecbffb11c0abc8677ccf67c1ac33b50b8e93b02078db7f9b0e";

export const READ_SCOPE = Object.freeze({
  readOn: "2026-08-31",
  method:
    "The complete official HTML text of each named section was read in its held chapter; the section heading and operative subsections were reconciled before the note was written.",
  authorityLimit:
    "A section-level read supports only the proposition in its note. It does not establish the content of an unread section, decide a common-law question, replace another controlling source, or create curriculum reliance.",
  authoringStatus:
    "CANDIDATE_REGISTER_ONLY: this reusable register makes no curriculum-reliance claim. A course-specific source layer may separately establish exact unit reliance; candidate units remain planning labels and no approval, enrollment, or Texas credit is claimed.",
});

const s = (section, candidateUnits, note) =>
  Object.freeze({ section, candidateUnits: Object.freeze(candidateUnits), note });

const READS = Object.freeze({
  "bc-3": Object.freeze([
    s("3.104", ["T08U3"], "Defines a negotiable instrument as the specified unconditional promise or order to pay a fixed amount of money; an instrument is a note when it is a promise and a draft when it is an order."),
    s("3.303", ["T08U3"], "States when an instrument is issued or transferred for value and defines consideration for Article 3, including the maker's defense when an instrument is issued without consideration."),
    s("3.412", ["T08U3"], "Makes the issuer of a note or cashier's check obliged to pay according to the instrument's applicable terms to a person entitled to enforce it or to a qualifying indorser who paid it."),
  ]),
  "bc-322": Object.freeze([
    s("322.002", ["T03U1", "T03U2", "T06U6"], "Defines agreement, contract, electronic record, electronic signature, record, automated transaction, and related terms used by the Texas Uniform Electronic Transactions Act."),
    s("322.005", ["T03U2", "T06U1", "T06U6"], "Provides that the Act does not force electronic dealing and applies only when each party agrees to transact electronically, with agreement determined from context, circumstances, and conduct."),
    s("322.007", ["T03U1", "T06U6", "T06U7"], "Provides that a record, signature, or contract may not be denied legal effect solely for being electronic, and that an electronic record or signature can satisfy a writing or signature requirement."),
    s("322.009", ["T06U6"], "Makes an electronic record or signature attributable to a person when it was that person's act, and directs that its effect be determined from context, circumstances, agreement, and other law."),
    s("322.011", ["T06U6", "T09U2"], "Allows an electronic notarization, acknowledgment, verification, or oath requirement to be satisfied when the authorized person's electronic signature and all other required information are associated with the record."),
    s("322.012", ["T06U2", "T09U5"], "States conditions under which an accessible electronic record accurately reflecting the final information satisfies retention and original-form requirements, while preserving agency authority to add requirements."),
  ]),
  "pr-24": Object.freeze([
    s("24.002", ["T05U7", "T05U11"], "Defines forcible detainer for specified holdover, at-will, sufferance, foreclosure-occupant, and derivative-tenancy situations, and requires a written demand compliant with Section 24.005."),
    s("24.005", ["T05U7", "T05U11"], "Requires written notice before specified eviction suits, generally setting a three-day default for tenants who default or hold over while allowing a written lease or agreement to prescribe a shorter or longer period."),
  ]),
  "pr-81": Object.freeze([
    s("81.0011", ["T02U7"], "Limits Chapter 81 to condominium regimes created before January 1, 1994, while recognizing that specified Chapter 82 provisions also govern those older regimes through Section 82.002."),
    s("81.101", ["T02U7"], "States that an owner or developer establishes a condominium regime by recording a master deed, master lease, or declaration that complies with Section 81.102."),
    s("81.102", ["T02U7"], "Lists required contents of an older-regime condominium declaration, master deed, or master lease, including property and unit descriptions, common elements, ownership percentages, and amendment protections."),
    s("81.106", ["T02U7", "T09U4"], "Requires an apartment deed in a Chapter 81 condominium to reference the declaration plats, state encumbrances, describe the apartment from the plat, and state its fractional or percentage regime interest."),
    s("81.107", ["T02U7"], "Provides that apartment owners share ownership of common elements and may use them for their intended purposes without interfering with the rights of other apartment owners."),
    s("81.208", ["T02U7", "T10U8"], "Allocates unpaid condominium assessments on conveyance to the seller from sale proceeds or to the purchaser, subject to the section's priority for taxes and valid recorded mortgage obligations."),
  ]),
  "pr-82": Object.freeze([
    s("82.002", ["T02U7"], "Sets the post-January 1, 1994 applicability line for Chapter 82, explains how an older regime may opt in, and identifies Chapter 82 provisions that apply to pre-1994 condominiums."),
    s("82.051", ["T02U7"], "Requires creation of a Chapter 82 condominium through a properly executed and recorded declaration, addresses mortgage-holder consent before unit conveyance, and states county recording requirements."),
    s("82.156", ["T02U7", "T06U4", "T07U1"], "Creates specified purchaser cancellation rights when required condominium documents, a resale certificate, or a condominium information statement were not timely supplied, and prescribes written cancellation and refund treatment."),
    s("82.157", ["T02U7", "T06U4", "T07U1"], "Requires a non-declarant seller to furnish current governing documents and a recent association resale certificate before contract or conveyance, lists certificate disclosures, and states reliance and waiver mechanics."),
    s("82.158", ["T02U7", "T10U9"], "Requires a deposit connected with a unit purchase or reservation from a declarant to be held in a qualifying Texas escrow account until closing, purchaser default, or refund."),
  ]),
  "pr-221": Object.freeze([
    s("221.002", ["T02U7"], "Defines the people, interests, plans, disclosures, accommodations, assessments, reservations, and other core terms used by the Texas Timeshare Act."),
    s("221.021", ["T02U7", "T06U4"], "Generally prohibits offering or disposing of a timeshare interest before plan registration, while setting escrow, disclosure, cancellation, and Commission-authorization conditions for reservations and presales."),
    s("221.032", ["T02U7", "T06U4"], "Requires delivery and written acknowledgment of a timeshare disclosure statement before an acquisition agreement is signed and specifies extensive plan, cost, title, financing, lien, insurance, and cancellation disclosures."),
    s("221.041", ["T02U7", "T07U1"], "Allows a purchaser to cancel before the sixth day after signing and receiving the purchase contract or receiving the required disclosure statement, whichever is later, and makes the right nonwaivable."),
    s("221.042", ["T02U7", "T07U1"], "Prescribes hand delivery, prepaid mail, or overnight-carrier notice for cancellation and requires a penalty-free refund within the later statutory deadline stated by the section."),
    s("221.043", ["T02U7", "T06U2", "T06U4"], "Requires conspicuous statutory cancellation language and other named information in each timeshare purchase contract, including parties, property, sales presenter, assessments, signature date, and annual-statement notice."),
  ]),
  "oc-1102": Object.freeze([
    s("1102.001", ["T10U5"], "Defines a real estate inspection as a written or oral opinion about the condition of real-property improvements and distinguishes apprentice, real estate, and professional inspectors."),
    s("1102.002", ["T10U5"], "Excludes specified repair, maintenance, and inspection work when the person does not hold out as being in the inspection business, and preserves acts authorized under other government licenses."),
    s("1102.102", ["T10U5"], "Prohibits acting or attempting to act as a real estate inspector for a buyer or seller without the chapter's license and indirect supervision by a professional inspector."),
    s("1102.103", ["T10U5"], "Prohibits acting as a professional inspector for a buyer or seller of real property without holding a professional inspector license under Chapter 1102."),
    s("1102.302", ["T10U5", "T11U2"], "Bars an inspection assignment whose employment or fee depends on a predetermined condition or findings not known true when accepted, and bars dishonesty, fraud, deceit, and misrepresentation."),
    s("1102.303", ["T10U5", "T11U2"], "Prohibits an inspector from acting in the same transaction as both inspector and an undisclosed principal, broker, or salesperson."),
    s("1102.304", ["T10U5", "T11U2"], "Prohibits an inspector from performing or agreeing to perform repairs or maintenance connected with an inspection under an earnest-money contract, lease, or property exchange."),
  ]),
  "fi-156": Object.freeze([
    s("156.002", ["T08U9"], "Defines mortgage applicant, mortgage company, residential mortgage loan company, residential mortgage loan originator, and other Chapter 156 actors while cross-referencing Chapter 180 for several operative definitions."),
    s("156.004", ["T08U9"], "Requires a sponsored residential mortgage loan originator to give an applicant a standard disclosure describing the relationship, duties, and compensation when the application is submitted."),
    s("156.201", ["T08U9"], "Generally requires an active license, registration, or statutory exemption before conducting or advertising the business of a residential mortgage loan company and assigns responsibility for sponsored-originator conduct."),
    s("156.202", ["T08U5", "T08U9"], "Lists entity exemptions from Chapter 156, including a narrowly bounded owner-financing exemption for no more than three residential mortgage loans in a twelve-month period, with aggregation rules."),
  ]),
  "fi-157": Object.freeze([
    s("157.002", ["T08U9"], "Defines a mortgage banker by specified residential-loan activity plus HUD, Fannie Mae, Freddie Mac, or Ginnie Mae authorization, and cross-references Chapter 180 definitions for loans and originators."),
    s("157.0021", ["T08U9"], "Requires mortgage-banker applicant and servicing notices using prescribed forms, including department contact, complaint or recovery-fund information, proof of delivery, and a servicing-complaint notice."),
    s("157.003", ["T08U9"], "Requires registration before conducting mortgage-banker business unless exempt and states enrollment, good-standing, qualification, compliance, office-listing, approval, and servicing-designation conditions."),
    s("157.004", ["T08U9"], "Exempts the listed federally insured institutions and subsidiaries, Chapter 156 companies, Chapter 342 lenders, and Texas governmental entities or in-scope employees from Chapter 157."),
    s("157.012", ["T08U9"], "Generally prohibits an individual from acting as a residential mortgage loan originator without exemption, temporary authority, or the required license, sponsorship, registry enrollment, Chapter 180 compliance, and eligibility."),
    s("157.0121", ["T08U5", "T08U9"], "Lists individual and employee exemptions from originator requirements, separately treating immediate-family, own-residence, attorney, depository, and bounded owner-financing situations without merging their different limits."),
  ]),
});

const catalogBytes = readFileSync(join(REPO_ROOT, CATALOG_PATH));
const catalog = JSON.parse(catalogBytes.toString("utf8"));

export const STATUTE_READS = Object.freeze(
  catalog.sources.map((source) => {
    const sectionsRead = READS[source.id];
    if (!sectionsRead) throw new Error(`law-of-contracts statute reads: no read record for ${source.id}`);
    return Object.freeze({
      ...source,
      status: "SECTION_TEXT_READ",
      readOn: READ_SCOPE.readOn,
      candidateUnits: Object.freeze([...new Set(sectionsRead.flatMap((entry) => entry.candidateUnits))]),
      sectionsRead,
    });
  }),
);

export function validateStatuteReads() {
  const problems = [];
  const unitCodes = new Set(ALL_UNITS.map((unit) => unit.code));
  const catalogHash = createHash("sha256").update(catalogBytes).digest("hex");
  if (catalogHash !== CATALOG_SHA256) problems.push(`catalog hash ${catalogHash} does not match ${CATALOG_SHA256}`);
  if (catalog.sources.length !== 9) problems.push(`expected 9 held chapters, found ${catalog.sources.length}`);
  if (Object.keys(READS).length !== catalog.sources.length) problems.push("read-register source count differs from catalog");

  let verifiedFiles = 0;
  let sectionsRead = 0;
  const candidateUnits = new Set();

  for (const source of STATUTE_READS) {
    const bytes = readFileSync(join(REPO_ROOT, source.localCopy));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== source.bytes || hash !== source.sha256) {
      problems.push(`${source.id}: held chapter no longer matches its acquisition record`);
    } else {
      verifiedFiles += 1;
    }

    const html = bytes.toString("utf8");
    const seenSections = new Set();
    for (const entry of source.sectionsRead) {
      sectionsRead += 1;
      if (seenSections.has(entry.section)) problems.push(`${source.id}: duplicate read section ${entry.section}`);
      seenSections.add(entry.section);
      const marker = `name="${entry.section}"`;
      if (html.split(marker).length - 1 !== 1) problems.push(`${source.id}: section anchor ${entry.section} is not unique`);
      const start = html.indexOf(marker);
      const nearby = start < 0 ? "" : html.slice(start, start + 900);
      if (!nearby.includes(`Sec. ${entry.section}.`)) problems.push(`${source.id}: heading not found for ${entry.section}`);
      if (entry.note.length < 80) problems.push(`${source.id} ${entry.section}: substantive note is too short`);
      if (!entry.candidateUnits.length) problems.push(`${source.id} ${entry.section}: no candidate unit`);
      for (const unit of entry.candidateUnits) {
        candidateUnits.add(unit);
        if (!unitCodes.has(unit)) problems.push(`${source.id} ${entry.section}: unknown LOC-0 unit ${unit}`);
      }
    }
  }

  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    heldSources: catalog.sources.length,
    readSources: STATUTE_READS.length,
    verifiedFiles,
    sectionsRead,
    candidateUnits: candidateUnits.size,
    problems: Object.freeze(problems),
  });
}

const validation = validateStatuteReads();
if (validation.status !== "PASS") {
  throw new Error(`law-of-contracts statute reads: ${validation.problems.join("; ")}`);
}

export default Object.freeze({ CATALOG_PATH, CATALOG_SHA256, READ_SCOPE, STATUTE_READS, validateStatuteReads });
