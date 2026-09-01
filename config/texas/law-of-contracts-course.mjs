/** Texas Law of Contracts — incremental course record. */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "./law-of-contracts-course-form.mjs";
import { MODULE_1_SOURCES, MODULE_1_SOURCE_GAPS } from "./law-of-contracts-module-1-sources.mjs";
import {
  MODULE_2_SOURCES,
  MODULE_2_PROVIDER_METHODS,
  MODULE_2_SOURCE_GAPS,
} from "./law-of-contracts-module-2-sources.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const COURSE = Object.freeze({
  courseId: "tx-law-of-contracts-30-v1",
  title: "Law of Contracts",
  hours: FORM.courseHours,
  totalMinutes: FORM.totalMinutes,
  approvalForm: FORM.formNumber,
  approvalFormRevision: FORM.revision,
  curriculumDir: "texas/tx-law-of-contracts-30-v1/curriculum",
  buildStatus: "IN_REPO_AUTHORING_IN_PROGRESS",
  curriculumComplete: false,
  contentFreeze: null,
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditReportingEnabled: false,
  certificateIssuanceEnabled: false,
  finalExaminationExists: false,
  finalExaminationAdministrable: false,
  trecApprovalStatus: "NOT_SUBMITTED_NOT_APPROVED",
  submissionReady: false,
});

export const MODULES = Object.freeze(
  TOPICS.map((topic, index) => {
    const nn = String(index + 1).padStart(2, "0");
    const authored = topic.code === "T01" || topic.code === "T02";
    return Object.freeze({
      module: `module-${nn}`,
      file: `module-${nn}.md`,
      topicCode: topic.code,
      topic: topic.topic,
      scopeNote: topic.scopeNote,
      prescribedMinutes: topic.subtotalMinutes,
      units: topic.units.length,
      sourceReady: authored,
      sourceStatus:
        topic.code === "T01"
          ? "READY_WITH_DISCLOSED_CODIFIED_RULE_GAP"
          : topic.code === "T02"
            ? "READY_WITH_DISCLOSED_SCOPE_LIMITS"
            : "NOT_SOURCE_READY",
      authoringStatus: authored ? "AUTHORED_CHECKPOINT" : "NOT_AUTHORED",
    });
  }),
);

/** Objectives are exported only after their topic is source-ready. */
export const UNIT_OBJECTIVES = Object.freeze({
  T01U1: "Classify the operative Texas contract vocabulary by authority layer and apply the statutory definitions of broker, license holder, real estate, sales agent, and brokerage without treating a form or guidance page as legislation.",
  T01U2: "Trace a license holder's contract-form obligations from TRELA through TREC's delegated rulemaking authority to discipline, distinguishing what the Legislature enacted from what the Commission's published rule reproduction states.",
  T01U3: "Decide whether a proposed drafting, explanation, opinion, or modification is permitted brokerage assistance or prohibited legal practice under Occupations Code § 1101.654 and the held TREC reproduction of 22 TAC § 537.11.",
  T01U4: "Explain the Broker-Lawyer Committee's membership and statutory drafting mission, and distinguish the committee's preparation of a standardizable form from the Commission's adoption or mandatory-use decision.",
  T01U5: "Choose the permitted form source for a stated transaction, apply every mandatory-form exception and no-form condition in the held § 537.11 reproduction, and preserve the boundaries on informational entries, conspicuous written-instruction changes, attorney referral, and reproduction.",
  T01U6: "Analyze a real-estate fact pattern under DTPA §§ 17.45, 17.46, 17.49, and 17.50 by testing consumer status, an enumerated practice or unconscionability, the broker exemption and its exceptions, causation or reliance, and the available statutory remedy tier.",
  T02U1: "Distinguish a physical parcel, a legal property interest, and the instrument governing that interest, then apply Texas fee-estate and future-interest rules without treating a deed, survey, or contract as the land itself.",
  T02U2: "Differentiate land, real estate, and real property for the source in use, and reconcile the legal description, improvements, accessories, exclusions, and third-party claims in a residential transaction.",
  T02U3: "Classify an item as a contract allocation, possible fixture, personal property, or third-party asset by applying the current form and the held Article 9 fixture provision without inventing a universal fixture test.",
  T02U4: "Use the disclosed StateCourse property-characteristics framework to convert physical and economic observations into neutral evidence requests, diligence actions, and professional referrals without promising value or legal effect.",
  T02U5: "Compare fee and future estates, concurrent and survivorship arrangements, marital property, and express trusts by locating the controlling instrument and identifying the ownership or signature question that requires qualified review.",
  T02U6: "Separate an organization from its owners and managers, identify the true record owner, and verify contract and signature authority for LLC, partnership, corporate, trust, cooperative, and REIT ownership structures.",
  T02U7: "Differentiate condominium, cooperative, townhouse, and timeshare arrangements by their creating instruments, ownership bundle, governance, shared obligations, and any date-sensitive or nonwaivable statutory protection.",
  T02U8: "Analyze a proposed real-estate use through federal and Texas fair-housing law, municipal zoning, recorded restrictions, and other public and private layers while maintaining neutral service and source-specific conclusions.",
});

const sourcesByUnit = new Map();
for (const source of [...MODULE_1_SOURCES, ...MODULE_2_SOURCES]) {
  for (const entry of source.sectionsRead) {
    for (const unit of entry.reliedOnByUnits) {
      if (!sourcesByUnit.has(unit)) sourcesByUnit.set(unit, []);
      sourcesByUnit.get(unit).push(
        Object.freeze({
          sourceId: source.id,
          citation: source.citation,
          tier: source.tier,
          sourceLayer: source.sourceLayer,
          codifiedTextCompared: source.codifiedTextCompared ?? null,
          localCopy: source.localCopy,
          section: entry.section,
        }),
      );
    }
  }
}

const providerMethodsByUnit = new Map();
for (const method of MODULE_2_PROVIDER_METHODS) {
  for (const unit of method.affectedUnits) {
    if (!providerMethodsByUnit.has(unit)) providerMethodsByUnit.set(unit, []);
    providerMethodsByUnit.get(unit).push(
      Object.freeze({ id: method.id, tier: method.tier, status: method.status, marker: method.marker, note: method.note }),
    );
  }
}

const ALL_SOURCE_GAPS = Object.freeze([...MODULE_1_SOURCE_GAPS, ...MODULE_2_SOURCE_GAPS]);

export const UNIT_TRACE = Object.freeze(
  ALL_UNITS.map((unit) => {
    const module = MODULES.find((entry) => entry.topicCode === unit.topicCode);
    const authored = module.authoringStatus === "AUTHORED_CHECKPOINT";
    return Object.freeze({
      code: unit.code,
      unit: unit.unit,
      topicCode: unit.topicCode,
      module: module.module,
      file: module.file,
      prescribedMinutes: unit.minutes,
      sourceReady: module.sourceReady,
      authored,
      objective: UNIT_OBJECTIVES[unit.code] ?? null,
      sources: Object.freeze(sourcesByUnit.get(unit.code) ?? []),
      providerMethods: Object.freeze(providerMethodsByUnit.get(unit.code) ?? []),
      sourceGaps: Object.freeze(
        ALL_SOURCE_GAPS.filter((gap) => gap.affectedUnits.includes(unit.code)).map((gap) =>
          Object.freeze({ id: gap.id, tier: gap.tier, status: gap.status, note: gap.note }),
        ),
      ),
    });
  }),
);

const topic1File = join(REPO_ROOT, COURSE.curriculumDir, "module-01.md");
const topic2File = join(REPO_ROOT, COURSE.curriculumDir, "module-02.md");
for (const trace of UNIT_TRACE.filter((entry) => entry.topicCode === "T01" || entry.topicCode === "T02")) {
  if (!trace.objective || (!trace.sources.length && !trace.providerMethods.length)) {
    throw new Error(`law-of-contracts course: source-ready unit ${trace.code} lacks objective and source or disclosed provider method`);
  }
}
for (const trace of UNIT_TRACE.filter((entry) => entry.topicCode !== "T01" && entry.topicCode !== "T02")) {
  if (trace.authored || trace.objective || trace.sources.length || trace.sourceGaps.length || trace.providerMethods.length) {
    throw new Error(`law-of-contracts course: ${trace.code} is prematurely marked authored or sourced`);
  }
}
for (const trace of UNIT_TRACE.filter((entry) => MODULE_1_SOURCE_GAPS[0].affectedUnits.includes(entry.code))) {
  const rule = trace.sources.find((source) => source.sourceId === "loc-tac-537-11");
  if (!rule || rule.sourceLayer !== "TREC consolidated rules reproduction" || rule.codifiedTextCompared !== false || !trace.sourceGaps.length) {
    throw new Error(`law-of-contracts course: ${trace.code} loses the disclosed codified-rule limitation`);
  }
}
if (!existsSync(topic1File)) throw new Error("law-of-contracts course: Topic 01 is marked authored but module-01.md is absent");
if (!existsSync(topic2File)) throw new Error("law-of-contracts course: Topic 02 is marked authored but module-02.md is absent");
if (MODULES.length !== 11 || UNIT_TRACE.length !== 80) throw new Error("law-of-contracts course: LOC-0 structure changed unexpectedly");
if (COURSE.trecApprovalStatus !== "NOT_SUBMITTED_NOT_APPROVED" || COURSE.submissionReady) {
  throw new Error("law-of-contracts course: this course has not been submitted or approved");
}
if (COURSE.enrollmentEnabled || COURSE.paymentEnabled || COURSE.creditReportingEnabled || COURSE.certificateIssuanceEnabled) {
  throw new Error("law-of-contracts course: downstream operations must remain disabled");
}

export default Object.freeze({ COURSE, MODULES, UNIT_OBJECTIVES, UNIT_TRACE, ALL_SOURCE_GAPS });
