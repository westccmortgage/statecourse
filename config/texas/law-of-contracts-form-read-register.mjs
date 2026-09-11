/**
 * Texas Law of Contracts — page-level read register for current TREC contract forms.
 *
 * `catalog.json` proves that 42 current official PDFs are held. This file records the smaller and
 * materially different fact that a human authoring pass has opened every page of eight priority
 * forms, extracted the complete text layer, and inspected a render of every page. The distinction
 * is intentional: a hash proves which file is held; it does not prove that anyone read it.
 *
 * FORM TEXT IS NOT A SUBSTITUTE FOR CONTROLLING LAW. These records clear the forms for accurate
 * description of what the instrument says and how its paragraphs connect. They do not make a form
 * a statute, decide a common-law issue, or clear a proposition supplied by a statute, rule, case,
 * federal programme, lender requirement, or local practice. `candidateUnits` is an illustrative,
 * non-exhaustive planning list of where a read form may be used; it is not itself a curriculum-reliance claim. A
 * course-specific source layer must name the exact unit and read scope before reliance exists.
 */

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_UNITS } from "./law-of-contracts-course-form.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CATALOG_PATH = "texas/tx-law-of-contracts-30-v1/sources/forms/catalog.json";
const CATALOG_SHA256 = "937f30ef7368443ad0e0a2e6848af39ac2d1fa44ed1b923e82ede45955c46676";

export const READ_METHOD = Object.freeze({
  readOn: "2026-08-31",
  textLayer: "Complete text extracted page by page with pdfplumber; headings and paragraph boundaries reconciled to the render.",
  visual: "Every page rendered with Poppler and visually inspected; all 25 pages were present, legible, and free of visible clipping.",
  authorityLimit:
    "Official TREC instrument text may establish what the form says. It may not replace governing statutes, rules, cases, programme requirements, lender requirements, or transaction-specific legal advice.",
});

const page = (number, paragraphs, note) => Object.freeze({ number, paragraphs: Object.freeze(paragraphs), note });

const read = (record) =>
  Object.freeze({
    status: "FORM_TEXT_READ",
    ...record,
    candidateUnits: Object.freeze(record.candidateUnits),
    pagesRead: Object.freeze(record.pagesRead),
  });

export const FORM_READS = Object.freeze([
  read({
    formId: "20-19",
    title: "One to Four Family Residential Contract (Resale)",
    pageCount: 12,
    candidateUnits: [
      "T01U5", "T05U4", "T06U2", "T06U3", "T06U4", "T06U5", "T06U6", "T06U7", "T06U8", "T06U9",
      "T07U1", "T07U2", "T07U3", "T08U5", "T09U1", "T09U5", "T10U1", "T10U2", "T10U6", "T10U7",
      "T10U8", "T10U9", "T11U1", "T11U2",
    ],
    authoringScope:
      "The current resale contract's paragraph architecture, defined terms, notices, option and earnest-money mechanics, title/survey objections, condition and disclosure choices, closing, possession, expenses, default, mediation, escrow, notices, addenda checklist, signatures, broker information, and receipt pages.",
    pagesRead: [
      page(1, ["1-4"], "Parties; property, improvements, accessories, exclusions and reservations; sales price; leases."),
      page(2, ["5", "6A-6B"], "Earnest money and termination option; title policy and title commitment."),
      page(3, ["6C-6E"], "Survey, objections, and the first portion of the contract's title notices."),
      page(4, ["6E", "7A-7D"], "Remaining title notices; access, inspections, utilities, seller disclosure, lead paint, and acceptance of condition."),
      page(5, ["7E-7I", "8"], "Repairs, environmental matters, service contracts, water-right disclosures, and broker or sales-agent disclosure."),
      page(6, ["9-12A"], "Closing, possession, smart devices, special provisions, and the first portion of settlement expenses."),
      page(7, ["12B-12C", "13-18A"], "Brokerage compensation and expense limits; prorations, casualty, default, mediation, attorney fees, and beginning of escrow."),
      page(8, ["18A-18E", "19-21"], "Escrow administration and demands; representations, governmental requirements, and notices."),
      page(9, ["22-23"], "Entire agreement, addenda and notices checklist, and the consult-an-attorney provision."),
      page(10, ["execution"], "Effective-date box, party signatures, and TREC's form-use limitation."),
      page(11, ["broker information"], "Seller, buyer, and intermediary broker contact-information fields."),
      page(12, ["receipts"], "Option fee, earnest money, contract, and additional earnest-money receipt fields."),
    ],
  }),
  read({
    formId: "39-11",
    title: "Amendment to Contract",
    pageCount: 1,
    candidateUnits: ["T07U2", "T11U1", "T11U2"],
    authoringScope:
      "The ten current amendment choices, including sales price, repairs, closing, expenses, option-period changes, financing-approval date, other modifications, final acceptance, and the no-legal-advice warning.",
    pagesRead: [page(1, ["1-10", "execution"], "All amendment choices, warning, signatures, final-acceptance field, and TREC form-use limitation.")],
  }),
  read({
    formId: "40-11",
    title: "Third Party Financing Addendum",
    pageCount: 2,
    candidateUnits: ["T06U3", "T07U1", "T08U5", "T08U8", "T08U9", "T10U3", "T11U1"],
    authoringScope:
      "Financing types, the duty to apply, buyer and property approval, termination evidence, security, FHA/VA language, and information-release authorizations stated by the current addendum.",
    pagesRead: [
      page(1, ["1", "2"], "Financing types and parameters; duty to apply and obtain approval; the two-part approval framework."),
      page(2, ["2A-2B", "3-5"], "Buyer and property approval, termination mechanics, security, FHA/VA language, and release authorizations."),
    ],
  }),
  read({
    formId: "26-8",
    title: "Seller Financing Addendum",
    pageCount: 2,
    candidateUnits: ["T06U3", "T08U3", "T08U4", "T08U5", "T08U7", "T11U1"],
    authoringScope:
      "Credit documentation and approval, the note terms printed by the form, and deed-of-trust choices for transfers, insurance, escrow, and prior liens. Regulatory loan-law consequences remain outside this form read.",
    pagesRead: [
      page(1, ["A-D(1)(a)"], "Warnings; credit documentation and approval; promissory-note choices; beginning of deed-of-trust transfer terms."),
      page(2, ["D(1)(b)-D(4)"], "Consent/due terms, continuing buyer liability, insurance, tax-and-insurance escrow, prior liens, signatures, and form limitation."),
    ],
  }),
  read({
    formId: "41-3",
    title: "Loan Assumption Addendum",
    pageCount: 2,
    candidateUnits: ["T06U3", "T08U3", "T08U4", "T08U7", "T11U1"],
    authoringScope:
      "The addendum's credit, assumption, noteholder-consent, seller-lien, escrow, release, continuing-liability, and due-on-sale provisions. The form warns the parties to inspect the actual note and deed of trust.",
    pagesRead: [
      page(1, ["A-E"], "Credit documentation and approval, assumed obligations, modification thresholds, and noteholder consent."),
      page(2, ["F-H", "notices"], "Seller liens, escrow transfer, information release, buyer/seller liability notices, due-on-sale notice, signatures, and form limitation."),
    ],
  }),
  read({
    formId: "45-2",
    title: "Short Sale Addendum",
    pageCount: 1,
    candidateUnits: ["T07U1", "T08U6", "T11U1"],
    authoringScope:
      "The form's definition of a short sale, lienholder-consent contingency, amended effective date, termination and refund mechanics, time-of-essence language, and information release.",
    pagesRead: [page(1, ["A-I"], "All defined terms and operative paragraphs, signatures, and TREC form-use limitation.")],
  }),
  read({
    formId: "55-1",
    title: "Seller's Disclosure Notice",
    pageCount: 4,
    candidateUnits: ["T06U4", "T07U1", "T11U1", "T11U2"],
    authoringScope:
      "The current Property Code §5.008(b) notice as an instrument: its knowledge/warranty disclaimer, item and condition checklists, flood definitions and history, permits and restrictions, environmental and coastal prompts, signatures, and receipt acknowledgement.",
    pagesRead: [
      page(1, ["intro", "1"], "Knowledge-date and no-warranty language; occupancy, systems, equipment, utilities, and known-defect prompts."),
      page(2, ["2-4"], "Smoke-detector prompt and explanation; defect, structural, environmental, and safety-condition prompts."),
      page(3, ["5-8"], "Repair needs; floodplain, floodway, flood-pool and reservoir prompts and definitions; flood claims and aid."),
      page(4, ["9-11", "signatures"], "Permits, restrictions, litigation, health/safety, conservation, insurance, roads and tanks; coastal and military notices; signatures and receipt."),
    ],
  }),
  read({
    formId: "38-8",
    title: "Notice of Buyer's Termination of Contract",
    pageCount: 1,
    candidateUnits: ["T06U8", "T06U9", "T07U1", "T11U1", "T11U2"],
    authoringScope:
      "The eight current termination-notice choices and their cross-references, plus the express warning that the notice is not an election of remedies and that earnest-money release is governed by the contract.",
    pagesRead: [page(1, ["1-8", "note"], "All termination choices, remedy/earnest-money note, legal-advice warning, signatures, and form limitation.")],
  }),
]);

export function validateFormReads() {
  const catalogBytes = readFileSync(join(REPO_ROOT, CATALOG_PATH));
  const catalog = JSON.parse(catalogBytes.toString("utf8"));
  const catalogHash = createHash("sha256").update(catalogBytes).digest("hex");
  const catalogById = new Map(catalog.forms.map((entry) => [entry.formId, entry]));
  const courseUnits = new Set(ALL_UNITS.map((unit) => unit.code));
  const problems = [];
  let verifiedFiles = 0;
  let pagesRead = 0;

  if (catalogHash !== CATALOG_SHA256) problems.push(`catalog hash ${catalogHash} does not match ${CATALOG_SHA256}`);

  for (const record of FORM_READS) {
    const held = catalogById.get(record.formId);
    if (!held) {
      problems.push(`${record.formId}: missing from acquisition catalog`);
      continue;
    }
    if (held.name !== record.title) problems.push(`${record.formId}: title differs from acquisition catalog`);

    const expectedPages = Array.from({ length: record.pageCount }, (_, index) => index + 1);
    const actualPages = record.pagesRead.map((entry) => entry.number);
    if (JSON.stringify(actualPages) !== JSON.stringify(expectedPages)) {
      problems.push(`${record.formId}: page reads are not contiguous 1-${record.pageCount}`);
    }
    if (record.pagesRead.some((entry) => !entry.paragraphs.length || !entry.note.trim())) {
      problems.push(`${record.formId}: page read lacks paragraph scope or a note`);
    }
    for (const unit of record.candidateUnits) {
      if (!courseUnits.has(unit)) problems.push(`${record.formId}: unknown LOC-0 candidate unit ${unit}`);
    }

    const path = join(REPO_ROOT, held.localCopy);
    const bytes = statSync(path).size;
    const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
    if (bytes !== held.bytes || sha256 !== held.sha256) {
      problems.push(`${record.formId}: held PDF no longer matches its acquisition record`);
    } else {
      verifiedFiles += 1;
    }
    pagesRead += record.pagesRead.length;
  }

  return Object.freeze({
    status: problems.length ? "FAIL" : "PASS",
    readForms: FORM_READS.length,
    verifiedFiles,
    pagesRead,
    heldFormsNotYetRead: catalog.formCount - FORM_READS.length,
    problems: Object.freeze(problems),
  });
}

const validation = validateFormReads();
if (validation.status !== "PASS") {
  throw new Error(`law-of-contracts-form-read-register: ${validation.problems.join("; ")}`);
}

export default Object.freeze({ CATALOG_PATH, CATALOG_SHA256, READ_METHOD, FORM_READS, validateFormReads });
