/**
 * Florida — school permit, instructor permit, and course approval: what must exist before anything
 * can be offered, and what StateCourse actually has.
 *
 * WHY A LEDGER AND NOT A CHECK. California taught this project the difference and Texas wrote it
 * down: a check VERIFIES what exists, and only a ledger ENUMERATES what must exist. A gate built on
 * checks alone reports READY while half the packet is missing, because a deliverable nobody wrote a
 * check for cannot fail one. So this file lists what Florida requires, and readiness is refused
 * while any entry is outstanding, whether or not a check exists for it.
 *
 * THE FLORIDA-SPECIFIC POINT, WHICH IS SHARPER THAN THE OTHER STATES'. In California and Texas the
 * hard part of provider approval is paperwork and money — forms, bonds, financial statements. In
 * Florida the hard part is a PERSON. Rule 61J2-17.011(2), F.A.C. says, in its own words, that the
 * school permit holder "must be a holder of a Florida Broker's license". Not a broker's licence.
 * A FLORIDA broker's licence. StateCourse's principal holds California broker licence 01385024 and
 * holds no Florida licence, so on the day this ledger was written there is no person who could sign
 * a Florida school permit application for StateCourse. No amount of build work moves that. It is
 * recorded as a BLOCKING gate rather than as one line item among forty, because treating it as one
 * line item among forty is how a project spends six months building against a door it cannot open.
 *
 * THREE OWNERS, AND ONLY ONE OF THEM IS THIS REPOSITORY.
 *   build     — this repository can produce it.
 *   human     — a person must sign, pay, sit an examination, or obtain a document or a licence.
 *   regulator — FREC or DBPR must answer or issue something before it can exist.
 *
 * WHAT IS NOT IN THIS FILE, DELIBERATELY. No form numbers. The DBPR real estate schools page could
 * not be made to yield a school permit application, an instructor permit application, or a fee
 * schedule from this environment — it serves a navigation shell whose content is assembled
 * client-side — so no form number is recorded anywhere in this Florida build. A plausible-looking
 * form number is worse than none: it is the kind of confident detail that survives review because
 * it looks like it was checked. Every entry below therefore carries
 * `verifiedAgainstApplication: false`, and the ledger reports itself as INCOMPLETE. It is a floor
 * built from the statute and the rules, not a transcription of the application.
 */

export const OWNER = Object.freeze({ BUILD: "build", HUMAN: "human", REGULATOR: "regulator" });

const item = (record) => Object.freeze({ verifiedAgainstApplication: false, held: false, ...record });

/* ── what StateCourse holds today ─────────────────────────────────────────────────────────────
   Read from the same entity record the California filings are generated from. Nothing here is a
   Florida credential, because there are none. */
export const APPLICANT = Object.freeze({
  legalName: "StateCourse LLC",
  formationState: "CA",
  secretaryOfStateFileNumber: "B20260376786",
  principal: "Anatoliy Kanevsky",
  principalLicence: "California real estate broker licence 01385024",
  principalHoldsFloridaBrokerLicence: false,
  principalPassedFrecInstructorExamination: false,
  floridaSchoolPermitNumber: null,
  floridaInstructorPermitNumber: null,
  floridaCourseNumber: null,
  applicationFiled: false,
});

/* ── the gate that decides whether any of the rest can start ──────────────────────────────────
   Stated separately from the deliverables so that it cannot be lost among them. */
export const BLOCKING_GATES = Object.freeze([
  Object.freeze({
    id: "school-permitholder-florida-broker-licence",
    cite: "Rule 61J2-17.011(2), F.A.C.; s. 475.451(2)(a), Fla. Stat.",
    requirement: "The school permit holder must be the holder of a Florida broker's licence.",
    statecoursePosition: "The principal holds a California broker's licence and no Florida licence. No person currently associated with StateCourse can be named as school permit holder.",
    routesOut: Object.freeze([
      "The principal obtains a Florida broker's licence in their own right.",
      "A Florida-licensed broker is engaged and named as the school permit holder.",
      "FREC confirms that s. 475.451(2)(a)'s statutory alternative — passing a Commission-approved instructor's examination — remains open to a school permit holder notwithstanding the narrower wording of Rule 61J2-17.011(2). See the conflict recorded against FAC-61J2-17.011 in the regulatory manifest: the rule's cross-reference to 's. 475.25(2)(a)' does not resolve, s. 475.25(2) being the revocation-for-mistake provision.",
    ]),
    owner: OWNER.HUMAN,
    resolved: false,
  }),
  Object.freeze({
    id: "permitted-instructor-for-distance-delivery",
    cite: "s. 475.451(6), Fla. Stat.; Rule 61J2-3.008(5)(b), F.A.C.",
    requirement: "A Commission-prescribed pre-licence course delivered by distance learning must be taught by a CURRENTLY PERMITTED instructor of the school, and students must be given that instructor's address, e-mail address and telephone number together with the times they are available to assist.",
    statecoursePosition: "StateCourse holds no Florida instructor permit. An asynchronous Florida course cannot be delivered, and cannot publish the contact details Rule 61J2-3.008(5)(b) requires, until a permitted instructor is registered with the school.",
    routesOut: Object.freeze([
      "A person meeting one of the three routes in s. 475.451(2)(b)1 obtains a Florida instructor permit and is registered with the school.",
    ]),
    owner: OWNER.HUMAN,
    resolved: false,
  }),
]);

/* ── instructor permit: the three statutory routes ────────────────────────────────────────────
   s. 475.451(2)(b)1, Fla. Stat., with Rule 61J2-17.011(1), F.A.C. supplying the definition that
   makes route (b) concrete. Recorded as alternatives because they ARE alternatives — meeting any
   one qualifies — and a ledger that flattened them into a list of requirements would misstate the
   law and overstate the burden. */
export const INSTRUCTOR_PERMIT_ROUTES = Object.freeze([
  Object.freeze({
    id: "degree-business-related",
    cite: "s. 475.451(2)(b)1.a, Fla. Stat.",
    requirement: "A bachelor's degree in a business-related subject — real estate, finance, accounting, business administration or equivalent — AND a valid Florida broker's licence.",
  }),
  Object.freeze({
    id: "degree-plus-experience",
    cite: "s. 475.451(2)(b)1.b, Fla. Stat.; Rule 61J2-17.011(1), F.A.C.",
    requirement: "A bachelor's degree, extensive real estate experience, AND a valid Florida broker's licence.",
    /* The rule makes 'extensive' testable, and the second half of it is easy to miss: the five
       closings must fall in the twelve months immediately before the application, so this route can
       lapse for someone who once qualified. */
    extensiveExperienceMeans: "a minimum of three years of full-time experience as a broker, including having participated in closing at least five real estate transactions as a licensee or as the employing broker of licensees, within the 12-month period immediately preceding the filing of the instructor application",
  }),
  Object.freeze({
    id: "instructor-examination",
    cite: "s. 475.451(2)(b)1.c, Fla. Stat.",
    requirement: "Passing an instructor's examination approved by the Commission.",
    note: "The only one of the three routes that does not require a Florida broker's licence.",
  }),
]);

export const INSTRUCTOR_PERMIT_MAINTENANCE = Object.freeze({
  cite: "s. 475.451(2)(b)3, Fla. Stat.; Rules 61J2-17.016 and 61J2-3.011, F.A.C.",
  renewalCycle: "biennial, on the schedule in Rule 61-6.001, F.A.C.",
  continuingEducationHoursPerRenewal: 7,
  continuingEducationSubject: "real estate subjects or instructional techniques, as prescribed by the Commission",
  unrenewedBecomes: "involuntarily inactive",
  expiresAfterInactiveYears: 2,
});

/* ── the deliverables ─────────────────────────────────────────────────────────────────────────── */
export const DELIVERABLES = Object.freeze([
  /* ── the school permit ── */
  item({ id: "school-permit", section: "School permit", owner: OWNER.REGULATOR, cite: "s. 475.451(1), Fla. Stat.",
    title: "A permit from the Department to offer or conduct a Commission-prescribed course",
    note: "Required BEFORE commencing or continuing to offer the course. Offering without one is a second-degree misdemeanour under s. 475.451(4)." }),
  item({ id: "school-permitholder-named", section: "School permit", owner: OWNER.HUMAN, cite: "s. 475.451(2)(a), Fla. Stat.; Rule 61J2-17.011(2), F.A.C.",
    title: "A named school permit holder who holds a Florida broker's licence",
    note: "The blocking gate. See BLOCKING_GATES." }),
  item({ id: "school-permitholder-qualifications", section: "School permit", owner: OWNER.HUMAN, cite: "s. 475.451(2), Fla. Stat.",
    title: "The permit holder meets the qualifications for practice in s. 475.17(1) — at least 18, high school diploma or equivalent, honest, truthful, trustworthy, of good character and good reputation for fair dealing" }),
  item({ id: "school-permit-per-location", section: "School permit", owner: OWNER.REGULATOR, cite: "Rule 61J2-17.013, F.A.C.",
    title: "A permit for each address or location at which the course is offered or conducted",
    note: "The rule construes 'each person, school, or institution' in s. 475.451(1) to mean one address or location. What that means for a school with no Florida classroom — whether the permit attaches to the out-of-state address of record — is an open question for FREC." }),
  item({ id: "background-investigation", section: "School permit", owner: OWNER.HUMAN, cite: "s. 475.451(2), Fla. Stat.",
    title: "Character investigation, including fingerprints processed through the FBI if the Department requires them",
    note: "The Department 'may' require fingerprints and 'shall' make such investigation as it deems necessary. Not optional on the applicant's say-so." }),

  /* ── the instructor permit ── */
  item({ id: "instructor-permit", section: "Instructor permit", owner: OWNER.REGULATOR, cite: "s. 475.451(2)(b), Fla. Stat.",
    title: "An instructor permit for at least one person, obtained by one of the three routes in INSTRUCTOR_PERMIT_ROUTES" }),
  item({ id: "instructor-registered-with-school", section: "Instructor permit", owner: OWNER.HUMAN, cite: "Rule 61J2-3.008(5)(b), F.A.C.",
    title: "The permitted instructor is registered with the school and is the person whose contact details students receive" }),
  item({ id: "instructor-contact-published", section: "Instructor permit", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(5)(b), F.A.C.",
    title: "The course publishes the permitted instructor's address, e-mail address and telephone number, and the times they are available to assist with instruction" }),
  item({ id: "instructor-availability-posted", section: "Instructor permit", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.g, F.A.C.",
    title: "Instructor and technical assistance availability during normal business hours is posted in a prominent location" }),

  /* ── the course approval ── */
  item({ id: "course-submission", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b), F.A.C.",
    title: "The course materials and the end-of-course examinations, submitted to the Commission" }),
  item({ id: "course-access-for-evaluation", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b), F.A.C.",
    title: "A copy of the course, and ACCESS to the course, in the format in which it will be offered to the student",
    note: "Not a PDF of the course. A working reviewer account against the real delivery, which is a build deliverable and a real one." }),
  item({ id: "course-timeline", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.d, F.A.C.",
    title: "A detailed course time-line, submitted and published to students before enrolment" }),
  item({ id: "objective-time-study", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.e, F.A.C.",
    title: "An objective study evidencing that the stated course hours are the hours the course actually takes" }),
  item({ id: "examination-time-method", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.f, F.A.C.",
    title: "A detailed description of the objective method that gives students only the allotted examination time" }),
  item({ id: "identity-verification-policy", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.c, F.A.C.",
    title: "Policies and technical processes verifying and documenting student identity at enrolment, during participation, and at completion" }),
  item({ id: "continuity-plan", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(b)3.b, F.A.C.",
    title: "Alternative plans for uninterrupted learner services and technical support on primary system failure" }),
  item({ id: "examination-forms", section: "Course approval", owner: OWNER.BUILD, cite: "Rule 61J2-3.008(4)(d), F.A.C.",
    title: "At least two forms of the end-of-course examination, with no more than 15% shared items, a unique answer key per form, and page references for every item and correct answer" }),
  item({ id: "primary-school-letter", section: "Course approval", owner: OWNER.HUMAN, cite: "Rule 61J2-3.008(4)(b), F.A.C.",
    title: "Not required if StateCourse files as a primary school developing its own material; required only of a secondary school submitting another school's course",
    note: "Recorded so that the primary/secondary choice is made deliberately. It sets the re-evaluation cadence." }),

  /* ── operating obligations that exist from the first enrolment ── */
  item({ id: "records-retention-3yr", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.451(8), Fla. Stat.",
    title: "Registration records, course rosters, attendance records, a file copy of each examination and progress test, and all student answer sheets, kept at least 3 years from the beginning of each course and producible to the Department" }),
  item({ id: "certificate-retention-5yr", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-3.015(6)(f), F.A.C.",
    title: "A copy of each course completion certificate kept at least 5 years after completion" }),
  item({ id: "completion-certificate", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-3.015(6)(a), F.A.C.",
    title: "A course completion certificate carrying every field the Commission prescribes, including the school licence number and the course number — neither of which StateCourse holds" }),
  item({ id: "anti-recruiting-statement", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-17.015(2), F.A.C.",
    title: "The Commission's anti-recruiting statement posted and read at the beginning of the course" }),
  item({ id: "no-brokerage-recruiting", section: "Operating", owner: OWNER.BUILD, cite: "Rule 61J2-17.015(1), F.A.C.",
    title: "No recruiting for any real estate brokerage firm during instructional time" }),
  item({ id: "advertising-evidence", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.4511(2), Fla. Stat.",
    title: "Every advertising and publicity claim about the school rests on relevant facts supported by evidence establishing their truth" }),
  item({ id: "no-pass-guarantee", section: "Operating", owner: OWNER.BUILD, cite: "s. 475.451(3), Fla. Stat.; Rule 61J2-17.013, F.A.C.",
    title: "No guarantee that pupils will pass, including any pass-or-refund promise, and no representation that a permit is a recommendation or endorsement" }),
]);

/* ── readiness ────────────────────────────────────────────────────────────────────────────────
   Computed, and deliberately incapable of returning READY today. Two things stop it, and they are
   different in kind: an unresolved blocking gate, and a ledger that has never been checked against
   the actual application because the application could not be obtained. */
export function floridaReadiness() {
  const outstanding = DELIVERABLES.filter((d) => !d.held);
  const gates = BLOCKING_GATES.filter((g) => !g.resolved);
  const unverified = DELIVERABLES.filter((d) => !d.verifiedAgainstApplication);
  return Object.freeze({
    status: "NOT READY",
    deliverables: DELIVERABLES.length,
    outstanding: outstanding.length,
    heldCount: DELIVERABLES.length - outstanding.length,
    blockingGates: gates.map((g) => g.id),
    ledgerVerifiedAgainstApplication: unverified.length === 0,
    ledgerIsAFloorNotAList: true,
    byOwner: Object.freeze({
      build: outstanding.filter((d) => d.owner === OWNER.BUILD).length,
      human: outstanding.filter((d) => d.owner === OWNER.HUMAN).length,
      regulator: outstanding.filter((d) => d.owner === OWNER.REGULATOR).length,
    }),
    reason:
      gates.length > 0
        ? `blocked before paperwork: ${gates.map((g) => g.id).join(", ")}`
        : "outstanding deliverables remain",
  });
}

export default Object.freeze({
  OWNER,
  APPLICANT,
  BLOCKING_GATES,
  INSTRUCTOR_PERMIT_ROUTES,
  INSTRUCTOR_PERMIT_MAINTENANCE,
  DELIVERABLES,
  floridaReadiness,
});
