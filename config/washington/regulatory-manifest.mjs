/**
 * Washington regulatory source manifest.
 *
 * Every controlling statement has one home: CLAIMS.  A source record identifies
 * the exact official document read, while each claim records its classification,
 * pinpoint and downstream consumers.  "Interpretation" and "needs-regulator-
 * confirmation" are deliberately not promoted to confirmed facts.
 */

export const VERIFIED_AS_OF = "2026-09-04";
export const MAX_VERIFICATION_AGE_DAYS = 45;

const source = (record) => Object.freeze({
  effectiveDate: null,
  revision: `Current official online version verified ${VERIFIED_AS_OF}`,
  sha256: null,
  expectedMarker: null,
  ...record,
});

export const SOURCES = Object.freeze([
  source({
    id: "wa-rcw-18-85-101",
    authorityClass: "statute",
    title: "RCW 18.85.101 — Broker's license—Requirements",
    publisher: "Washington State Legislature / Office of the Code Reviser",
    url: "https://app.leg.wa.gov/RCW/default.aspx?cite=18.85.101",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "RCW 18.85.101(1)(a)-(d), (2), (3)",
    expectedMarker: "minimum requirements",
  }),
  source({
    id: "wa-wac-308-124a-720",
    authorityClass: "administrative-rule",
    title: "WAC 308-124A-720 — Application for real estate examination, licensed in another jurisdiction",
    publisher: "Washington State Legislature / Office of the Code Reviser",
    url: "https://app.leg.wa.gov/WAC/default.aspx?cite=308-124A-720",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "WAC 308-124A-720(1)-(2)",
    expectedMarker: "licensed in another jurisdiction",
  }),
  source({
    id: "wa-dol-reciprocity",
    authorityClass: "agency-current-guidance",
    title: "Get your license: Real estate broker license by reciprocity",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-brokers/get-your-license-real-estate-broker-license-reciprocity",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Requirements; Apply for the exam; Submit your fingerprints; Apply for your license",
    expectedMarker: "same or lesser level",
  }),
  source({
    id: "wa-dol-managing-broker",
    authorityClass: "agency-current-guidance",
    title: "Get your license: Real estate managing broker",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-managing-brokers/get-your-license-real-estate-managing-broker",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Requirements: Apply by reciprocity; Pass the exams; Submit a fingerprint background check; Submit your application",
    expectedMarker: "Apply by reciprocity",
  }),
  source({
    id: "wa-dol-fees",
    authorityClass: "agency-current-fee-schedule",
    title: "Fees: Real estate",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-brokers/fees-real-estate",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Professional license fees; Real estate education fees",
    expectedMarker: "Apply for school approval",
  }),
  source({
    id: "wa-wac-308-124h",
    authorityClass: "administrative-rule",
    title: "Chapter 308-124H WAC — Real estate course, school, and instructor approval",
    publisher: "Washington State Legislature / Office of the Code Reviser",
    url: "https://app.leg.wa.gov/WAC/default.aspx?cite=308-124H&full=true",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "WAC 308-124H-805 through -990",
    expectedMarker: "Qualifications of instructors",
  }),
  source({
    id: "wa-wac-308-124a",
    authorityClass: "administrative-rule",
    title: "Chapter 308-124A WAC — Real estate licensing and examination",
    publisher: "Washington State Legislature / Office of the Code Reviser",
    url: "https://app.leg.wa.gov/WAC/default.aspx?cite=308-124A&full=true",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "WAC 308-124A-700, -710, -713, -720, -785, -790, -800, -802",
    expectedMarker: "Continuing education clock hour requirements",
  }),
  source({
    id: "wa-curriculum-fundamentals",
    authorityClass: "agency-prescribed-curriculum",
    title: "Washington Real Estate Fundamentals — Required Curriculum and Learning Objectives — 60 Clock Hours",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/media/pdf/1418/real-estate-fundamentals-2022pdf/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    revision: "Rev. 5/2022",
    pinpoint: "12 pages; Introduction through Terminology and related topics",
    sha256: "2734e555ce1861349bf5bf26623656f25dbca0ce33d105a56885dea2cf739a67",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-curriculum-practices",
    authorityClass: "agency-prescribed-curriculum",
    title: "WA Real Estate Practices — Required Curriculum and Learning Objectives — 30 Clock Hours",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/media/pdf/1419/reprac2010pdf/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    effectiveDate: "2009-03-18",
    revision: "Effective 03-18-2009; current DOL curriculum link verified 2026-09-04",
    pinpoint: "9 pages; Business Skills and Procedures through Real Estate Math",
    sha256: "7f65a427036ec4c2d2a7a9f11c8d6f7bbe7997e67c472095a92ac8ed617eb4df",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-form-school-623121",
    authorityClass: "agency-current-form",
    title: "Real Estate School Application",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/forms/view/623121/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    revision: "RE-623-121 (R/12/25)",
    pinpoint: "Pages 1-3",
    sha256: "0ad0f0609bbd193e08c23a8b8780644a3468007e6659978a9f2a2b7e1971088a",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-form-instructor-623125",
    authorityClass: "agency-current-form",
    title: "Real Estate Instructor Approval Application",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/forms/view/623125/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    revision: "RE-623-125 (R/8/23)",
    pinpoint: "Pages 1-4; Qualification; Qualification in demonstrating competency",
    sha256: "16f6fbf0ebdc54fae8cf6daa6b46a38d22b6286b5d6c9ef8e714a637153fd468",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-form-course-623137",
    authorityClass: "agency-current-form",
    title: "Real Estate Prelicensing or Post Licensing Course Approval Application",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/forms/view/623137/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    revision: "RE-623-137 (R/10/25)",
    pinpoint: "Pages 1-3",
    sha256: "cc9156c5db36b6da56a74e577c93af14701cfacd7d53d5a388660fd2ef846866",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-form-distance-600002b",
    authorityClass: "agency-current-form",
    title: "Real Estate Distance Education Delivery Method Application",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/forms/view/600002b/download?inline=",
    retrievedAt: VERIFIED_AS_OF,
    revision: "BPD-600-002B (R/9/21)",
    pinpoint: "Pages 1-2; Delivery method questions 1-8",
    sha256: "33424f5358f58fb094887768d7ffd3c53496fe22cdd7cf045549aeb9dedd14b8",
    expectedMarker: "%PDF-",
  }),
  source({
    id: "wa-dol-course-approval",
    authorityClass: "agency-current-guidance",
    title: "Get your course approval: Real estate educators",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-educators/get-your-course-approval-real-estate-educators",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "New or revised mandated courses; Gather the necessary documents; Submit your application",
    expectedMarker: "Please allow 45 days",
  }),
  source({
    id: "wa-dol-school-approval",
    authorityClass: "agency-current-guidance",
    title: "School approval: Real estate educators",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-educators/school-approval-real-estate-educators",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Apply for a new real estate school; Renew your school approval",
    expectedMarker: "school administrator's resume",
  }),
  source({
    id: "wa-dol-instructor-approval",
    authorityClass: "agency-current-guidance",
    title: "Apply for approval: Real estate instructors",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-educators/apply-approval-real-estate-instructors",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Apply to be a new real estate instructor; Renew your instructor approval",
    expectedMarker: "cover letter stating why",
  }),
  source({
    id: "wa-rcw-28c-10-030",
    authorityClass: "statute",
    title: "RCW 28C.10.030 — Private vocational schools: application of chapter",
    publisher: "Washington State Legislature / Office of the Code Reviser",
    url: "https://app.leg.wa.gov/RCW/default.aspx?cite=28C.10.030",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "RCW 28C.10.030(1)-(11)",
    expectedMarker: "Application of chapter",
  }),
  source({
    id: "wa-wtb-career-school",
    authorityClass: "agency-current-guidance",
    title: "Open a Private Career School",
    publisher: "Washington Workforce Training and Education Coordinating Board",
    url: "https://wtb.wa.gov/private-career-schools/open-private-career-school/",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Does your school need to be licensed; Steps to become a licensed school",
    expectedMarker: "Does your School Need to be Licensed",
  }),
  source({
    id: "wa-dol-firm",
    authorityClass: "agency-current-guidance",
    title: "Get your license: Real estate firms",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-firms/get-your-license-real-estate-firms",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Get firm name approval; File with Secretary of State; File with Department of Revenue; Appoint designated broker",
    expectedMarker: "Appoint your designated broker",
  }),
  source({
    id: "wa-dol-designated-broker",
    authorityClass: "agency-current-guidance",
    title: "Get your endorsement: Real estate designated brokers",
    publisher: "Washington State Department of Licensing",
    url: "https://dol.wa.gov/professional-licenses/real-estate-designated-brokers/get-your-endorsement-real-estate-designated-brokers",
    retrievedAt: VERIFIED_AS_OF,
    pinpoint: "Meet the requirements; Become a designated broker for a new firm",
    expectedMarker: "controlling interest",
  }),
]);

const claim = (record) => Object.freeze(record);

export const CLAIMS = Object.freeze([
  claim({ id: "wa-license-level", sourceId: "wa-dol-reciprocity", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Opening paragraph", evidence: "Washington has Broker and Managing Broker levels; an out-of-state applicant may seek the same or a lesser level than currently held.", claim: "A California broker may request Washington Managing Broker treatment, but DOL must determine that California's level is the same or greater capacity.", reliedOnBy: ["personal-license-path", "regulator-inquiry"] }),
  claim({ id: "wa-reciprocity-six-months", sourceId: "wa-wac-308-124a-720", authorityClass: "administrative-rule", classification: "confirmed", pinpoint: "WAC 308-124A-720(1)", evidence: "An applicant actively licensed in the same or greater capacity, in good standing now or within the preceding six months, takes only the Washington-law portion.", claim: "Reciprocity requires an active, good-standing out-of-state license in the same or greater capacity now or within the preceding six months and waives the national exam only.", reliedOnBy: ["personal-license-path"] }),
  claim({ id: "wa-license-history-fields", sourceId: "wa-dol-reciprocity", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Requirements", evidence: "The official history must show agency heading, active dates, level, expiration, discipline, method obtained, and creation date; copies and screenshots are rejected.", claim: "The user must upload an official California DRE license history containing all seven DOL-listed data elements; a license copy or online screenshot is insufficient.", reliedOnBy: ["personal-license-path", "user-actions"] }),
  claim({ id: "wa-reciprocity-sequence", sourceId: "wa-dol-managing-broker", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Steps 2-5", evidence: "State exam only; fingerprints after passing; apply after DOL receives exam and background results; exam results last one year.", claim: "For Managing Broker reciprocity the operational order is DOL exam approval, Washington state exam, fingerprints, DOL notice, and license application within one year of passing.", reliedOnBy: ["personal-license-path"] }),
  claim({ id: "wa-exam-approval-window", sourceId: "wa-dol-managing-broker", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Apply by reciprocity; Schedule your exam", evidence: "DOL states that reciprocity exam approval is valid for six months and tells an approved applicant to wait four business days before contacting PSI.", claim: "The user's reciprocity exam-approval window is six months, and the current DOL scheduling instruction is to wait four business days after approval before contacting PSI.", reliedOnBy: ["personal-license-path", "timeline"] }),
  claim({ id: "wa-personal-fees", sourceId: "wa-dol-fees", authorityClass: "agency-current-fee-schedule", classification: "confirmed", pinpoint: "Professional license fees", evidence: "$210 examination and $330 original Managing Broker license; fingerprint vendor charge is separate and not fixed in this record.", claim: "The currently published fixed DOL fees for the user's Managing Broker route are $210 for each exam attempt and $330 for the original license, excluding fingerprint/vendor charges.", reliedOnBy: ["personal-license-path", "budget"] }),
  claim({ id: "wa-prescribed-fundamentals", sourceId: "wa-curriculum-fundamentals", authorityClass: "agency-prescribed-curriculum", classification: "confirmed", pinpoint: "Title and pages 1-12", evidence: "The current DOL document prescribes 60 clock hours and detailed learning objectives for Washington Real Estate Fundamentals.", claim: "The prelicense program must include the DOL-prescribed 60-hour Washington Real Estate Fundamentals course and trace its submitted materials to the current objectives.", reliedOnBy: ["course-engine", "curriculum-traceability", "course-applications"] }),
  claim({ id: "wa-prescribed-practices", sourceId: "wa-curriculum-practices", authorityClass: "agency-prescribed-curriculum", classification: "confirmed", pinpoint: "Title and pages 1-9", evidence: "The current DOL-linked document prescribes 30 clock hours and detailed learning objectives for Washington Real Estate Practices.", claim: "The prelicense program must include the DOL-prescribed 30-hour Real Estate Practices course and trace its submitted materials to the current objectives.", reliedOnBy: ["course-engine", "curriculum-traceability", "course-applications"] }),
  claim({ id: "wa-course-exams", sourceId: "wa-wac-308-124h", authorityClass: "administrative-rule", classification: "confirmed", pinpoint: "WAC 308-124H-820(8)", evidence: "Courses of 30 hours or more need at least three questions per clock hour, minimum 90, answer keys, and at least a 70 percent passing grade.", claim: "Fundamentals needs at least 180 comprehensive-exam questions and Practices at least 90; each exam needs an answer key and a 70 percent minimum passing grade.", reliedOnBy: ["course-engine", "course-gap-register", "course-applications"] }),
  claim({ id: "wa-distance-controls", sourceId: "wa-form-distance-600002b", authorityClass: "agency-current-form", classification: "confirmed", pinpoint: "Delivery method questions 1-8", evidence: "The form asks for orientation, technology/inactivity shutdown, identity and dual certification, instructor access, interactive events, equivalence, clock-hour basis, mastery, progress and remediation.", claim: "A self-paced online filing must substantively answer all eight current delivery-method questions and implement the represented controls before enrollment.", reliedOnBy: ["distance-delivery", "operational-gates"] }),
  claim({ id: "wa-five-year-records", sourceId: "wa-wac-308-124h", authorityClass: "administrative-rule", classification: "confirmed", pinpoint: "WAC 308-124H-895(4) and -935", evidence: "School administrator maintains required records for five years; student record includes contact data, attendance dates, registration date where relevant, courses/exam results, and evaluation.", claim: "The school must retain each student record and each edition of its required publication for at least five years and provide a student copy on request.", reliedOnBy: ["records-policy", "operational-gates"] }),
  claim({ id: "wa-school-filing", sourceId: "wa-form-school-623121", authorityClass: "agency-current-form", classification: "confirmed", pinpoint: "Instructions and pages 2-3", evidence: "Original filing requires publication, course descriptions, administrator resume, $380; form seeks UBI and administrator experience; approval lasts two years and DOL says allow 45 days.", claim: "The school application package requires the current RE-623-121, required publication, course descriptions, administrator resume and $380 fee; current form revision is R/12/25.", reliedOnBy: ["filing-index", "school-datasheet"] }),
  claim({ id: "wa-instructor-technique", sourceId: "wa-wac-308-124h", authorityClass: "administrative-rule", classification: "confirmed", pinpoint: "WAC 308-124H-960(3)", evidence: "One instructional-technique route is an approved instructor-training course plus two years full-time real estate or related-field experience within five years.", claim: "The user's most plausible instructional-technique route is approved instructor training plus documented two years of full-time recent real-estate experience.", reliedOnBy: ["instructor-dossier", "user-actions"] }),
  claim({ id: "wa-instructor-subject", sourceId: "wa-form-instructor-623125", authorityClass: "agency-current-form", classification: "needs-regulator-confirmation", pinpoint: "Page 2, Fundamentals/Practices competency criteria", evidence: "The form lists three years active licensure within the preceding five years as one competency option, without stating that the license must be Washington-issued.", claim: "A current California broker history appears capable of supporting Fundamentals and Practices subject competency, but DOL must confirm acceptance of the California credential and supporting experience record.", reliedOnBy: ["instructor-dossier", "regulator-inquiry"] }),
  claim({ id: "wa-instructor-fee", sourceId: "wa-dol-fees", authorityClass: "agency-current-fee-schedule", classification: "confirmed", pinpoint: "Real estate instructors", evidence: "$114 original/renewal for a two-year period; $38 to add topics.", claim: "Initial instructor approval for requested subject areas costs $114 and lasts two years; adding topic areas currently costs $38.", reliedOnBy: ["filing-index", "budget"] }),
  claim({ id: "wa-instructor-processing", sourceId: "wa-dol-instructor-approval", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Apply to be a new real estate instructor", evidence: "The current DOL instructor page says to submit the form, cover letter and supporting documentation and allow 45 days for processing.", claim: "DOL's published planning figure for an original instructor application is 45 days; it is not an approval guarantee.", reliedOnBy: ["filing-index", "timeline"] }),
  claim({ id: "wa-course-filing", sourceId: "wa-form-course-623137", authorityClass: "agency-current-form", classification: "confirmed", pinpoint: "Pages 1-3", evidence: "One inclusive PDF per course includes outline/hour breakdown/objectives, final exam and key, texts/handouts/materials, and distance application when applicable.", claim: "Each prescribed course needs a current RE-623-137 package with detailed outline, instructional materials, final exam/key and distance-method application or school-specific ARELLO certificate.", reliedOnBy: ["filing-index", "course-applications"] }),
  claim({ id: "wa-education-fees", sourceId: "wa-dol-fees", authorityClass: "agency-current-fee-schedule", classification: "confirmed", pinpoint: "Real estate courses; schools; instructors", evidence: "Fundamentals $456; other mandated courses $15.20/hour; school $380; instructor $114. Non-core approvals last four years, school/instructor two years.", claim: "Base education filing fees are $380 school, $114 instructor, $456 Fundamentals and $456 Practices, for a $1,406 fixed DOL total before entity, PVS, ARELLO or ancillary costs.", reliedOnBy: ["budget", "filing-index"] }),
  claim({ id: "wa-course-processing", sourceId: "wa-dol-course-approval", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Submit your application", evidence: "DOL says allow 45 days to process a course application.", claim: "DOL's published planning figure is 45 days for course review; it is not an approval guarantee or service-level promise.", reliedOnBy: ["filing-index", "timeline"] }),
  claim({ id: "wa-no-proctor-claim", sourceId: "wa-wac-308-124h", supportingSourceIds: ["wa-form-course-623137", "wa-form-distance-600002b"], authorityClass: "administrative-rule", classification: "interpretation", pinpoint: "WAC 308-124H-820(8), -840; current forms RE-623-137 and BPD-600-002B", evidence: "The reviewed course and distance rules/forms prescribe exam size, key, score and distance controls but do not state an independent-proctor requirement.", claim: "The reviewed authorities do not impose an express independent-proctor requirement; StateCourse must not convert silence into a claim that proctoring is prohibited or can never be required by DOL during review.", reliedOnBy: ["course-administration-policy"] }),
  claim({ id: "wa-pvs-status", sourceId: "wa-wtb-career-school", supportingSourceIds: ["wa-rcw-28c-10-030"], authorityClass: "agency-current-guidance", classification: "needs-regulator-confirmation", pinpoint: "Does your School Need to be Licensed?; RCW 28C.10.030(1)-(11)", evidence: "The Workforce Board says paid vocational programs longer than three days may need a PVS license and directs providers to submit its self-test; RCW 28C.10.030 contains no blanket real-estate-school exemption.", claim: "StateCourse must obtain a written Workforce Board determination before enrollment; DOL school approval alone is not treated as proof of a PVS exemption.", reliedOnBy: ["filing-index", "regulator-inquiry", "operational-gates"] }),
  claim({ id: "wa-school-entity-status", sourceId: "wa-form-school-623121", authorityClass: "agency-current-form", classification: "needs-regulator-confirmation", pinpoint: "Page 2, school information", evidence: "The current form requests a 16-digit UBI/Business ID/Location ID; WAC 308-124H-890 expressly requests SOS evidence for a corporation or corporate subsidiary but is not explicit about an out-of-state LLC.", claim: "StateCourse LLC should not file until DOL confirms whether Washington foreign registration and a UBI are mandatory for this California distance-only LLC; the package presently carries placeholders.", reliedOnBy: ["school-datasheet", "regulator-inquiry", "user-actions"] }),
  claim({ id: "wa-school-vs-firm", sourceId: "wa-form-school-623121", authorityClass: "agency-current-form", classification: "confirmed", pinpoint: "Pages 1-3", evidence: "The school form requires administrator experience but contains no broker, managing-broker, designated-broker or firm-license prerequisite.", claim: "A Washington real-estate firm license and designated-broker endorsement are not stated prerequisites to education-school approval; they matter only if StateCourse also conducts brokerage services.", reliedOnBy: ["personal-license-path", "firm-implications"] }),
  claim({ id: "wa-firm-designated-broker", sourceId: "wa-dol-firm", authorityClass: "agency-current-guidance", classification: "confirmed", pinpoint: "Steps 1-6", evidence: "A brokerage firm requires name approval, SOS filing where applicable, DOR UBI, a Washington Managing Broker with controlling interest as designated broker, and firm application.", claim: "If the user later operates a Washington brokerage, that is a separate firm filing and requires a Washington Managing Broker with controlling interest to obtain designated-broker endorsement.", reliedOnBy: ["firm-implications"] }),
  claim({ id: "wa-product-ladder", sourceId: "wa-wac-308-124a", authorityClass: "administrative-rule", classification: "confirmed", pinpoint: "WAC 308-124A-785 and -790", evidence: "First active broker renewal is 90 hours including law, advanced practices and 30 hours CE; later active renewals require 30 hours including current core and fair housing curricula.", claim: "Beyond the 90-hour prelicense product, Washington supports a 90-hour first-renewal portfolio and recurring 30-hour CE portfolio, including current CORE and fair-housing components.", reliedOnBy: ["commercial-roadmap"] }),
]);

const ids = new Set(SOURCES.map((entry) => entry.id));
if (ids.size !== SOURCES.length) throw new Error("Washington manifest: duplicate source id");
for (const record of SOURCES) {
  if (!record.authorityClass || !record.url || !record.pinpoint || !record.retrievedAt || !record.revision) {
    throw new Error(`Washington manifest: incomplete source ${record.id}`);
  }
}

const claimIds = new Set(CLAIMS.map((entry) => entry.id));
if (claimIds.size !== CLAIMS.length) throw new Error("Washington manifest: duplicate claim id");
for (const record of CLAIMS) {
  if (!ids.has(record.sourceId)) throw new Error(`Washington manifest: ${record.id} references unknown source ${record.sourceId}`);
  for (const sourceId of record.supportingSourceIds ?? []) {
    if (!ids.has(sourceId)) throw new Error(`Washington manifest: ${record.id} references unknown supporting source ${sourceId}`);
  }
  if (!["confirmed", "interpretation", "needs-regulator-confirmation"].includes(record.classification)) {
    throw new Error(`Washington manifest: ${record.id} has invalid classification`);
  }
  if (!record.authorityClass || !record.pinpoint || !record.evidence || !record.claim || !record.reliedOnBy?.length) {
    throw new Error(`Washington manifest: incomplete controlling claim ${record.id}`);
  }
}

export function washingtonSource(id) {
  return SOURCES.find((entry) => entry.id === id) ?? null;
}

export function washingtonClaim(id) {
  return CLAIMS.find((entry) => entry.id === id) ?? null;
}

export function staleWashingtonSources(asOf = new Date()) {
  const millisecondsPerDay = 86_400_000;
  return SOURCES.filter((entry) => {
    const verified = new Date(`${entry.retrievedAt}T00:00:00Z`);
    return !Number.isFinite(verified.getTime()) || (asOf.getTime() - verified.getTime()) / millisecondsPerDay > MAX_VERIFICATION_AGE_DAYS;
  }).map((entry) => entry.id);
}
