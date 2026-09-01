/**
 * FREC Course I — video instruction plan.
 *
 * PLANNING ONLY. Nothing here is scripted, recorded, rendered or active. Every entry is
 * PENDING / NOT ACTIVE and stays that way until the gate at the bottom of this file passes.
 *
 * WHAT FLORIDA SAYS ABOUT VIDEO, WHICH IS LESS THAN A READER WOULD EXPECT. The two rules that once
 * governed it are REPEALED: Rule 61J2-3.016, Video Tape Quality Standards, repealed 4 May 2008, and
 * Rule 61J2-3.017, Video Tape Classroom Viewing Conditions, repealed 27 April 2008. Both still
 * appear in the Department of State's chapter index, carrying "(Repealed)" in their titles, which is
 * exactly the sort of listing that gets cited by someone who read the title and not the status.
 *
 * So no Florida media standard survives. What governs video is the general distance-education
 * criteria in Rule 61J2-3.008(4)(b)3, which say nothing about production and a great deal about
 * time, interaction and evidence. Three of them bear on video and none is about quality:
 *
 *   Hours are hours. Sub-item 1 requires distance study "on a classroom hour per classroom hour
 *   basis"; sub-item 2 makes a 50-minute distance hour the equivalent of a 50-minute classroom hour.
 *
 *   Stated hours must be provable. Sub-item 3.e requires "evidence by means of an objective study
 *   that the stated course hours are consistent with actual hours required to complete the course."
 *
 *   The course must be interactive. Sub-item 2 requires "the interchange of information between the
 *   student, and instructor". Video is not interchange. It can sit inside a course that provides
 *   interchange; it cannot be what provides it.
 *
 * THE TENSION, AND HOW IT RESOLVES. Optional-and-non-blocking sits awkwardly beside hour-per-hour.
 * If a video is optional, a student who skips it has spent less time than the timeline claims; if it
 * counts toward the 3,000 instructional minutes, skipping it makes the stated hours untrue for that
 * student, and 3.e requires the stated hours to be defensible.
 *
 * The resolution is to keep them apart rather than to compromise either: VIDEO SITS OUTSIDE THE
 * INSTRUCTIONAL-HOUR BUDGET. The 3,000 minutes are carried entirely by material every student
 * receives. Video is enrichment layered on a section that already meets its allocation without it.
 * Three consequences follow, and each is a constraint on later work:
 *
 *   1. A video may never be the only place a required point is taught.
 *   2. The objective time study measures the course WITHOUT video; run time is reported separately
 *      and claimed as nothing.
 *   3. Section hour allocations are computed from written and interactive material alone, so adding
 *      or removing a video never disturbs the hour architecture or invalidates the time study.
 *
 * The alternative — counting video toward the hours — would force it to be mandatory, blocking and
 * tracked to the second, contradicting three product rules to buy nothing Florida asked for.
 */

export const FLORIDA_VIDEO_AUTHORITY = Object.freeze({
  repealedRules: Object.freeze([
    Object.freeze({ rule: "61J2-3.016", title: "Video Tape Quality Standards", repealed: "2008-05-04" }),
    Object.freeze({ rule: "61J2-3.017", title: "Video Tape Classroom Viewing Conditions", repealed: "2008-04-27" }),
  ]),
  survivingMediaStandard: null,
  governingCriteria: "Rule 61J2-3.008(4)(b)3, F.A.C. — the general distance-education criteria",
  videoCountsTowardInstructionalHours: false,
  videoCountsTowardInstructionalHoursBasis:
    "No primary authority supports counting it, and the approved time model does not include it. This stays false unless BOTH change.",
});

/* ── production rules ─────────────────────────────────────────────────────────────────────────
   StateCourse's own, and stricter than the regulator's silence. Encoded rather than described so
   that the release gate can check them rather than a reviewer having to remember them. */
export const PRODUCTION_RULES = Object.freeze({
  optional: true,
  neverBlocksProgression: true,
  countsTowardRequiredInstructionalTime: false,
  quizAnswerAtEndOfVideo: false,
  masteryCheckOnNextScreen: true,
  realDocumentsShownAsStaticFrames: true,
  cropsAndHighlightsProducedDeterministicallyInPost: true,
  aiRecreatedGovernmentForms: false,
  automaticZooms: false,
  generatedLabelsOverDocumentText: false,
  captionsMayObscureDiscussedField: false,
  captionsRequired: true,
  transcriptRequired: true,
  posterRequired: true,
  examinationContentInAnyVideoArtifact: false,
  /* A video has more surfaces than a page does, and a reviewer who watched it has not checked most
     of them. Every one of these is a separate artifact that can carry a leak. */
  confidentialitySurfaces: Object.freeze([
    "script", "rendered audio", "caption file (VTT)", "transcript", "poster frame",
    "thumbnail", "chapter markers", "filename",
  ]),
});

export const STATUS = Object.freeze({
  PENDING: "PENDING / NOT ACTIVE",
  ACTIVE: "ACTIVE",
});

/** Everything that must exist before a video may leave PENDING. */
export const ACTIVATION_REQUIREMENTS = Object.freeze([
  "mp4", "vtt", "transcript", "poster", "placement", "accessibility", "registry",
]);

const candidate = (record) =>
  Object.freeze({
    status: STATUS.PENDING,
    activation: Object.freeze({ mp4: false, vtt: false, transcript: false, poster: false, placement: false, accessibility: false, registry: false }),
    ...record,
  });

/* ── selected candidates ──────────────────────────────────────────────────────────────────────
   Seven. Each is a hypothesis to be re-tested against the finished curriculum, and several may not
   survive that contact — which is the point of testing them afterwards rather than committing now.
   Durations are estimates for planning, not commitments. */
export const CANDIDATES = Object.freeze([
  candidate({
    id: "FL-V01",
    syllabusSection: 4,
    syllabusSectionTitle: "Authorized Relationships, Duties And Disclosure",
    objectives: Object.freeze([
      "4.3 Distinguish among nonrepresentation, single agent and transaction broker (p. 11)",
      "4.5 Compare and contrast the fiduciary duties owed in a single agent relationship and the duties owed in a transaction broker relationship (p. 11)",
      "4.8 Explain the procedure for transition from a single agent to a transaction broker (p. 11)",
    ]),
    placement: "Section 4, after the written treatment of the three authorized relationships and before the duties comparison.",
    whyVideoBeatsText:
      "This is a legal decision tree with three branches and a one-way transition between two of them, and it is the single most confused area of Florida practice. Text presents the branches sequentially, so a reader meets 'transaction broker' having already half-forgotten 'single agent'. Showing the tree with the branches visible at once, and walking the transition as a movement across it, is a structural advantage text cannot match.",
    estimatedMinutes: 7,
    requiredSource: "s. 475.278, Fla. Stat. — Authorized brokerage relationships; presumption of transaction brokerage; required disclosures",
    sourceHeld: true,
    sourceLocalCopy: "florida/frec-sources/extracted/fs-475-sections/475.278.txt",
    presenterDocumentBalance: "Presenter-led with an on-screen diagram. No document frames.",
    postVideoActivity: "Retrieval: given three short fact patterns, identify the relationship and the duties owed. Delivered on the NEXT screen, never at the end of the video.",
    productionStatus: "not started",
  }),

  candidate({
    id: "FL-V02",
    syllabusSection: 4,
    syllabusSectionTitle: "Authorized Relationships, Duties And Disclosure",
    objectives: Object.freeze([
      "4.6 Describe the disclosure procedures for the various authorized relationships (p. 11)",
      "4.7 Describe the required content and format of the various disclosure forms (p. 11)",
    ]),
    placement: "Section 4, immediately after FL-V01.",
    whyVideoBeatsText:
      "The disclosure notices have statutorily prescribed content and format — s. 475.278(3) sets out the text and the required capitalisation and type size. 'Required format' is a visual property. Describing it in prose asks the student to reconstruct an appearance from a description, when the appearance is the requirement.",
    estimatedMinutes: 6,
    requiredSource: "s. 475.278(3), Fla. Stat. — the prescribed notice text and format",
    sourceHeld: true,
    sourceLocalCopy: "florida/frec-sources/extracted/fs-475-sections/475.278.txt",
    presenterDocumentBalance: "Document-led. Static frames of the notice, with deterministic crops in post. No AI recreation of any form; no generated labels over the text.",
    postVideoActivity: "Application: identify which notice is required in a given transaction and at what point it must be given. Next screen.",
    productionStatus: "not started",
  }),

  candidate({
    id: "FL-V03",
    syllabusSection: 10,
    syllabusSectionTitle: "Legal Descriptions",
    objectives: Object.freeze([
      "10.4 Describe the process of creating a legal description using the metes-and-bounds method (p. 31)",
    ]),
    placement: "Section 10, after the three types of legal description are introduced.",
    whyVideoBeatsText:
      "A metes-and-bounds description is a set of sequential instructions that traces a closed figure. Read as text it is a paragraph of bearings; drawn as it is read, it is a shape. The mechanism — that each call continues from where the last one stopped, and that the figure must close — is only visible in motion.",
    estimatedMinutes: 6,
    requiredSource: "None external. A worked description drawn on screen.",
    sourceHeld: true,
    presenterDocumentBalance: "Drawn illustration with voice-over. No presenter on camera.",
    postVideoActivity: "Application: trace a short description and identify the error in one that does not close. Next screen.",
    productionStatus: "not started",
  }),

  candidate({
    id: "FL-V04",
    syllabusSection: 10,
    syllabusSectionTitle: "Legal Descriptions",
    objectives: Object.freeze([
      "10.5 Locate a township by township line and range (p. 31)",
      "10.6 Locate a particular section within a township (p. 31)",
      "10.7 Understand how to subdivide a section (p. 31)",
      "10.8 Calculate the number of acres in a parcel based on the legal description, and convert to square feet (p. 31)",
    ]),
    placement: "Section 10, after FL-V03.",
    whyVideoBeatsText:
      "Four objectives that are one nested spatial idea: township grid, section numbering within it, subdivision of a section, and the acreage that falls out. Each zoom level is derived from the one above. Static diagrams force the student to hold four frames at once; zooming through them in sequence is the explanation.",
    estimatedMinutes: 9,
    requiredSource: "None external.",
    sourceHeld: true,
    presenterDocumentBalance: "Diagram-led with voice-over. Zooms are authored transitions between prepared frames, not automatic camera moves.",
    postVideoActivity: "Calculation: compute acreage for two described parcels and convert to square feet. Next screen.",
    productionStatus: "not started",
  }),

  candidate({
    id: "FL-V05",
    syllabusSection: 14,
    syllabusSectionTitle: "Real Estate Related Computations And Closing Of Transactions",
    objectives: Object.freeze([
      "14.5 Prorate the buyer's and seller's expenses (p. 44)",
      "14.7 Allocate taxes and fees to the proper parties and compute individual costs (p. 44)",
    ]),
    placement: "Section 14, after the preliminary steps to closing and before the Closing Disclosure treatment.",
    whyVideoBeatsText:
      "Proration is a procedure with an order of operations and a debit/credit consequence per party. A worked example shows the numbers landing on the correct side of the correct column as each step is taken. A finished table shows only the answer, which is the part the student already has.",
    estimatedMinutes: 8,
    requiredSource: "None external. Worked example.",
    sourceHeld: true,
    presenterDocumentBalance: "Worked calculation on screen with voice-over.",
    postVideoActivity: "Calculation: prorate two items and place each on the correct side for each party. Next screen.",
    productionStatus: "not started",
  }),

  candidate({
    id: "FL-V06",
    syllabusSection: 14,
    syllabusSectionTitle: "Real Estate Related Computations And Closing Of Transactions",
    objectives: Object.freeze([
      "14.9 Explain the major sections of the Closing Disclosure (p. 44)",
      "14.10 Demonstrate ability to read and check the Closing Disclosure for errors (p. 44)",
    ]),
    placement: "Section 14, after FL-V05.",
    whyVideoBeatsText:
      "Objective 14.10 is expressly a demonstration objective — 'demonstrate ability to read and check'. Reading a real multi-page form for errors is a scanning skill: knowing where to look, and what the relationship between two distant figures should be. That is watchable and hard to write down.",
    estimatedMinutes: 10,
    requiredSource: "The genuine five-page CFPB Closing Disclosure specimen linked from the Bureau's official explainer.",
    sourceHeld: true,
    sourceLocalCopy: "florida/frec-sources/cfpb/cfpb-closing-disclosure-specimen.pdf",
    presenterDocumentBalance: "Document-led. Static frames of the real form; crops and highlights produced deterministically in post-production. Captions positioned so they never obscure the field under discussion.",
    postVideoActivity: "Application: find the two seeded inconsistencies in a supplied specimen. Next screen.",
    productionStatus: "source acquired; production not started",
  }),

  candidate({
    id: "FL-V07",
    syllabusSection: 18,
    syllabusSectionTitle: "Taxes Affecting Real Estate",
    objectives: Object.freeze([
      "18.2 Describe the various personal exemptions available to qualified owners of homestead property (p. 53)",
      "18.3 Compute the property tax on a specific parcel, given the current tax rate, assessed value, eligible exemptions and the taxing authorities (p. 53)",
    ]),
    placement: "Section 18, after immune/exempt/partially exempt property is distinguished.",
    whyVideoBeatsText:
      "Florida homestead is a sequence of exemptions applied to different slices of assessed value, and different exemptions apply to different taxing authorities. The arithmetic is not hard; the ORDER and the per-authority applicability are where students go wrong. Watching the value step down slice by slice is the explanation.",
    estimatedMinutes: 8,
    requiredSource: "Florida homestead exemption provisions. Current figures must be verified against primary authority at scripting time.",
    sourceHeld: true,
    sourceLocalCopy: "florida/frec-sources/statutes/fl-constitution.html; florida/frec-sources/statutes/fs-chapter-196.html",
    presenterDocumentBalance: "Worked calculation on screen with voice-over.",
    postVideoActivity: "Calculation: compute tax on a parcel with and without homestead. Next screen.",
    productionStatus: "sources acquired; production not started",
  }),
]);

/* ── rejected candidates ──────────────────────────────────────────────────────────────────────
   Recorded because a plan that lists only what was chosen looks like everything was considered.
   These were considered and rejected, with the reason and the better instrument. */
export const REJECTED = Object.freeze([
  Object.freeze({
    syllabusSection: 1,
    subject: "Course Overview: The Real Estate Business",
    reason: "Orientation prose with no mechanism to show. A video here would be a welcome message, which the production rules exclude.",
    betterInstrument: "text",
  }),
  Object.freeze({
    syllabusSection: 2,
    subject: "Real Estate License Law And Qualifications For Licensure",
    reason:
      "Rule-dense and citation-heavy. Video makes this material harder to verify against the statute and much harder to update: when an hour requirement or a fee changes, a page is edited and a video is re-recorded. Putting volatile regulated detail into video is a maintenance trap.",
    betterInstrument: "text with a citation table",
  }),
  Object.freeze({
    syllabusSection: 3,
    subject: "Real Estate License Law And Commission Rules",
    reason: "Same as Section 2. Commission composition, powers and duties are enumerated facts, and enumerated facts belong in a table a student can scan and an author can update.",
    betterInstrument: "text with a table",
  }),
  Object.freeze({
    syllabusSection: 6,
    subject: "Violations Of License Law, Penalties And Procedures",
    reason:
      "The penalty structure is tabular data — violation, category, range. A table is searchable, comparable and correctable; a video is none of those. The complaint procedure is a sequence, but a numbered list carries it without a production cost.",
    betterInstrument: "table plus a numbered procedure",
  }),
  Object.freeze({
    syllabusSection: 8,
    subject: "Property Rights: Estates And Tenancies",
    reason: "The estates and tenancies material is a set of definitional distinctions best held side by side. A comparison table lets a student see all of them at once, which is exactly what a linear video prevents.",
    betterInstrument: "comparison table",
  }),
  Object.freeze({
    syllabusSection: 15,
    subject: "The Real Estate Markets And Analysis",
    reason:
      "Supply, demand and market indicators are relationships between variables. An interactive that lets a student move one variable and see the others respond teaches the relationship; a video of someone else moving it does not.",
    betterInstrument: "interactive exercise",
  }),
  Object.freeze({
    syllabusSection: 16,
    subject: "Real Estate Appraisal — the three approaches to value, conceptually",
    reason:
      "Sixteen objectives, most of them conceptual distinctions among types and principles of value. Video would be a lecture. The three approaches ARE worth a worked calculation, but as an interactive exercise the student performs rather than watches.",
    betterInstrument: "interactive worked exercise",
    reconsiderIf: "the finished curriculum shows students failing the reconciliation step specifically, which is the one part that may be genuinely procedural",
  }),
  Object.freeze({
    syllabusSection: 19,
    subject: "Planning, Zoning And Environmental Hazards",
    reason: "Largely definitional and jurisdictionally variable. Text keeps it correctable.",
    betterInstrument: "text",
  }),
]);

/* ── the gate ─────────────────────────────────────────────────────────────────────────────────── */
export function activationFailures(video) {
  const failures = [];
  for (const key of ACTIVATION_REQUIREMENTS) {
    if (!video.activation[key]) failures.push(`${video.id}: ${key} missing`);
  }
  if (video.sourceHeld === false) failures.push(`${video.id}: required source not held — ${video.sourceAcquisitionNote ?? "unacquired"}`);
  return failures;
}

export function anyActive() {
  return CANDIDATES.some((v) => v.status === STATUS.ACTIVE);
}

export const TOTALS = Object.freeze({
  selected: CANDIDATES.length,
  rejected: REJECTED.length,
  estimatedMinutes: CANDIDATES.reduce((n, v) => n + v.estimatedMinutes, 0),
  blockedOnSourceAcquisition: CANDIDATES.filter((v) => v.sourceHeld === false).length,
  active: CANDIDATES.filter((v) => v.status === STATUS.ACTIVE).length,
});

export default Object.freeze({
  FLORIDA_VIDEO_AUTHORITY,
  PRODUCTION_RULES,
  STATUS,
  ACTIVATION_REQUIREMENTS,
  CANDIDATES,
  REJECTED,
  TOTALS,
  activationFailures,
  anyActive,
});
