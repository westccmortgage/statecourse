/**
 * Florida — distance delivery, requirement by requirement, against the actual delivery engine.
 *
 * WHAT THIS FILE IS FOR. Phase 0 v1 listed twenty-one distance-delivery obligations with citations,
 * which was a list of what Florida says. It was not an analysis of what the engine must therefore
 * do, and the gap between those two is where compliance work actually lives. A rule that says
 * "verify and document student identity for enrollment, course participation and course completion"
 * is three separate engine behaviours at three separate moments, and a citation does not say which.
 *
 * So every row below carries four things, kept apart on purpose:
 *
 *   REQUIRED  — what Florida expressly requires, with the quote. If this column is empty, Florida
 *               did not say it, and anything in the next column is StateCourse's own choice.
 *   POLICY    — what StateCourse does where Florida is silent or permissive. A product decision,
 *               revisable without a rule change.
 *   ENGINE    — what the delivery engine must actually do. The implementable statement.
 *   OPEN      — what remains genuinely unresolved.
 *
 * WHAT IS DELIBERATELY NOT HERE. No behaviour is carried across from the Texas engine. Texas and
 * Florida differ on points that look similar and are not: Florida's hour is 50 minutes, its pass
 * mark is 70% on a single end-of-course examination, its examination may not be ordered to follow
 * the course, its retake rule is one retest after 30 days within a year, and its pre-licence
 * examination is expressly not required to be proctored. Any of those imported from a neighbour
 * would be wrong in a way that reads as reasonable. Where a Florida row happens to match Texas
 * practice, it is because Florida authority says so and the citation is given.
 *
 * THE ROW THAT MATTERS MOST IS "seat time alone". Florida does not permit a course that is a timer
 * over a document. Rule 61J2-3.008(4)(b)3.1 requires distance study to "require students to read,
 * conduct research, complete timed exams and similar assignments, designed to measure the student's
 * competency", and 3.h requires the school to "describe the method of assessment of the student's
 * performance periodically throughout the course of instruction". Time is necessary and is not
 * sufficient. That single finding constrains the engine more than any other row in this file.
 */

const row = (record) =>
  Object.freeze({
    required: null,
    requiredCite: null,
    policy: null,
    engine: null,
    open: null,
    ...record,
  });

export const DELIVERY_MATRIX = Object.freeze([
  row({
    id: "hour-accounting-50-minutes",
    dimension: "50-minute instructional-hour accounting",
    required:
      'A Florida hour is 50 minutes. "This course will consist of 63 hours of 50 minutes each, inclusive of examination." For classroom delivery, "50 minute hours means fifty minutes of classroom instruction, exclusive of any breaks, recesses, or other time not spent in instruction." For distance, "50 minute hours for distance learning courses shall be the equivalent of the 50 minute classroom hour in a classroom delivery course."',
    requiredCite: "Rule 61J2-3.008(1), (2)(b), (4)(b)3.2, F.A.C.; s. 475.17(2)(a)1, Fla. Stat.; FREC Distance Education Checklist — 'Timeline justifying the hours requested on your application. (50 minute hours)'",
    engine:
      "Account instructional time in minutes and convert at 50 minutes to the hour for every display, certificate and report. Never display or store a Florida hour as 60 minutes. Exclude from the accounting anything that is not instruction.",
    policy: "Time is accrued per student against the section actually open, not against wall-clock session length.",
  }),

  row({
    id: "sixty-three-split",
    dimension: "The 60-hour instruction and 3-hour examination split",
    required:
      'The course totals 63 fifty-minute hours inclusive of examination. The Commission\'s syllabus allocates that as "60-hours of instruction with 3-hour end-of-course examination."',
    requiredCite: "s. 475.17(2)(a)1, Fla. Stat.; Rule 61J2-3.008(1), F.A.C.; FREC Course I syllabus p. 2; FREC Distance Education Checklist — 'Courses are approved for a maximum of 63 hours.'",
    engine:
      "3,000 minutes of instruction and 150 minutes of examination, totalling 3,150. The examination clock draws from the 150 and not from the instructional budget. Nothing may push the sum above 3,150.",
    policy:
      "Per-section hour allocation is StateCourse's to design and is NOT recorded anywhere until the curriculum exists and the objective time study has been run against it.",
    open: "Whether 'instruction hour' in the examination item rule means 60 or 63 — carried in assessment-architecture.mjs as instructionHourDefinition.",
  }),

  row({
    id: "student-identity",
    dimension: "Student identity",
    required:
      '"The school must have policies and technical processes in place to verify and document student identity for enrollment, course participation and course completion."',
    requiredCite: "Rule 61J2-3.008(4)(b)3.c, F.A.C.; FREC Distance Education Checklist item 5",
    engine:
      "Three distinct verifications, not one. (1) At enrolment: identity captured and recorded against the account. (2) During participation: a re-assertion of identity during the course, logged with timestamps. (3) At completion: identity re-asserted before the certificate is issued. Each must be DOCUMENTED, meaning retrievable and producible, not merely performed.",
    policy:
      "The participation check is tied to the student certification statement required before the examination, so it is a real gate rather than a second login prompt.",
    open:
      "Florida does not prescribe a method or a strength. Whether a knowledge-based check satisfies 'verify' or whether documentary identity is expected is unresolved and should be put to DBPR alongside the examination questions.",
  }),

  row({
    id: "timed-progression",
    dimension: "Timed progression",
    required:
      'Distance study is offered "on a classroom hour per classroom hour basis", and the school "must present evidence by means of an objective study that the stated course hours are consistent with actual hours required to complete the course."',
    requiredCite: "Rule 61J2-3.008(4)(b)3.1 and 3.e, F.A.C.",
    engine:
      "Each section holds a minimum elapsed instructional time before it may be completed. Time accrues only while the section is actually open and the student is present in it. Idle time is not instructional time.",
    policy:
      "Minimum times are derived from the objective time study, not chosen to fill a budget. Until that study exists no per-section minimum is written down.",
  }),

  row({
    id: "seat-time-not-sufficient",
    dimension: "Whether seat-time alone is sufficient",
    required:
      'No. "Distance learning necessitates a high level of self-direction and should, therefore, require students to read, conduct research, complete timed exams and similar assignments, designed to measure the student\'s competency relative to the required subject matter objectives." And the school "must describe the method of assessment of the student\'s performance periodically throughout the course of instruction."',
    requiredCite: "Rule 61J2-3.008(4)(b)3.1 and 3.h, F.A.C.",
    engine:
      "A section may not be completable by elapsed time alone. Progression requires instructional activity — reading completed, assessment attempted — in addition to time. A pure timer over static text does not satisfy Florida.",
    policy:
      "Activity requirements are real and small: they exist to evidence engagement, not to manufacture difficulty. No artificial minimum-length written work.",
  }),

  row({
    id: "interaction",
    dimension: "Interaction and instructional activity",
    required:
      'The course "shall be interactive, providing for the interchange of information between the student, and instructor". For distance courses the school "shall provide to students an address, email address and telephone number of a permitted instructor registered with such school, who shall be available to assist the students with instruction", and "shall communicate to all students the times in which the permitted instructor will be available". Instructor and technical assistance "must be made available to students and posted in a prominent location."',
    requiredCite: "Rule 61J2-3.008(4)(b)3.2, 3.g and (5)(b), F.A.C.",
    engine:
      "A persistent, reachable surface inside the course carrying the named permitted instructor's postal address, e-mail address and telephone number, plus their stated availability hours. It must be a real route to a real person, and it cannot be a footer. A working channel for student-to-instructor questions, since 'interchange' is two-directional.",
    policy: "The instructor surface is reachable from every section rather than living on one page a student may never open.",
    open: "What 'posted in a prominent location' means for a school with no classroom — carried as an open question.",
  }),

  row({
    id: "formative-checks",
    dimension: "Formative checks and remediation",
    required:
      'The school "must describe the method of assessment of the student\'s performance periodically throughout the course of instruction."',
    requiredCite: "Rule 61J2-3.008(4)(b)3.h, F.A.C.",
    engine:
      "Periodic checks through the course, described in the submission. The hint/back/retry prohibition applies to the END-OF-COURSE EXAMINATION only, so formative checks may tell a student they were wrong, explain why, and let them try again. Building them otherwise would make the course worse for no compliance gain.",
    policy:
      "Formative checks carry real feedback and remediation routing. Written reflection stays optional: Florida requires periodic assessment to exist and be described, and prescribes no form for it, so nothing here imposes an essay or a character minimum.",
  }),

  row({
    id: "examination-access",
    dimension: "Examination access",
    required:
      '"Students shall not take the end-of-course examination without satisfactorily completing all sessions of the syllabus." The student must submit the certification statement "prior to the taking of the final examination". A notice of satisfactory completion "shall not be issued if the student has absences in excess of 8 classroom hours", and the school administers the examination "provided the student has not missed in excess of 8 hours of classroom instruction."',
    requiredCite: "Rule 61J2-3.008(4)(a), (4)(b)3.i and 3.j, F.A.C.; s. 475.17(2)(a)1, Fla. Stat.",
    engine:
      "A hard gate. The examination is unreachable until every one of the nineteen syllabus sections is satisfactorily complete, the certification statement has been submitted and stored, and the delivered-instruction check passes. The gate is a precondition, not a warning.",
    open: "How the 8-hour ceiling is measured with no scheduled class — carried as absenceInDistanceCourse.",
  }),

  row({
    id: "examination-timing",
    dimension: "Examination timing",
    required:
      'Satisfactory completion "requires the satisfactory completion of a timed distance learning course examination". The school "must describe in detail, the objective method used to insure students receive only the allotted time". Overall time "must not exceed the equivalent of 1.8 minutes per item". The examination "shall not include aids such as, but not limited to, hint, back, or retry functionalities", and the school must have "a reasonable method in place to prevent duplication".',
    requiredCite: "s. 475.17(2)(a)2, Fla. Stat.; Rule 61J2-3.008(4)(b)3.f, 3.i and (4)(d), F.A.C.",
    engine:
      "A server-authoritative clock. The allotted time is enforced server-side and survives a closed tab, a refresh, a new device and a clock change on the client. No back navigation, no hint, no retry within a sitting. Items and options delivered so that a bulk copy of the form is not trivially obtainable.",
    policy: "150 minutes allotted — the examination's own three 50-minute hours. Configurable; see assessment-architecture.mjs.",
  }),

  row({
    id: "proctoring",
    dimension: "Proctoring and centralized monitoring",
    required:
      'NOT required, and not prohibited. "Such examination shall not be required to be monitored or given at a centralized location."',
    requiredCite: "s. 475.17(2)(a)2, Fla. Stat.",
    engine:
      "No proctoring and no test centre. Identity is carried by the verification obligation, not by observation. The engine must never tell a Florida student that Florida requires monitoring.",
    policy: "StateCourse does not proctor. The statute permits proctoring; StateCourse declines it as unnecessary and student-hostile where the law does not ask for it.",
  }),

  row({
    id: "retakes",
    dimension: "Retakes and alternate forms",
    required:
      '"Students failing ... must wait at least 30 days from the date of the original examination to retest. Within one year of the original examination, a student may retest a maximum of one time. Otherwise, students failing ... must repeat the course prior to being eligible to take the end-of-course examination again. Schools shall administer a different form of the end-of-course examination to a student that is retaking the exam or repeating the course."',
    requiredCite: "Rule 61J2-3.008(6), F.A.C.",
    engine:
      "Track the ORIGINAL examination date per student. Block retest until 30 days after it. Permit exactly one retest inside one year of that original date. On exhaustion, require the course to be repeated before any further attempt. Serve a different form on every retake and on every repeat — which means form assignment must be recorded per attempt, not chosen at random each time.",
    policy: "Make-up for student or family illness may not extend more than 30 days beyond the scheduled examination without Commission approval (Rule 61J2-3.008(7)).",
  }),

  row({
    id: "course-completion",
    dimension: "Course completion",
    required:
      '"A grade of 70% or higher on the Commission-prescribed end-of-course examination constitutes satisfactory course completion."',
    requiredCite: "Rule 61J2-3.008(4)(a), F.A.C.",
    engine:
      "Completion is the examination result at 70% or above, and nothing else. Not a weighted blend of formative scores and the examination; not a participation grade. Formative checks gate progression, they do not contribute to the completion determination.",
  }),

  row({
    id: "certificates",
    dimension: "Certificates and completion reporting",
    required:
      'Eleven prescribed fields, the Commission\'s prescribed sentence, the original to the student and a copy retained. "The course completion certificate must be completely filled out by the institution, school or sponsor certifying successful course completion and must be typed, printed in ink or delivered electronically to the student." Applicants "must provide the course completion certificate at the individual\'s scheduled examination".',
    requiredCite: "Rule 61J2-3.015(1), (5), (6)(a), (6)(f), F.A.C.",
    engine:
      "Generate a certificate carrying: Name of School, School License Number, Address of School, Course Title: Course I, Course Number, Start Date, Finish Date, Exam Date, Student Name, Student Address, Authorized Signature for the School — plus the prescribed sentence. Electronic delivery to the student is expressly permitted. Two of the eleven fields (School License Number, Course Number) cannot be populated until the permit and approval exist, so certificate generation must be impossible before then rather than emitting a blank.",
    open: "Florida prescribes no electronic reporting of completions to DBPR for pre-licence courses; the certificate is presented by the candidate at the state examination. Whether any roster reporting is expected is unresolved.",
  }),

  row({
    id: "school-record-retention",
    dimension: "School record retention",
    required:
      '"Each person, school, or institution permitted under this section is required to keep registration records, course rosters, attendance records, a file copy of each examination and progress test, and all student answer sheets for a period of at least 3 years subsequent to the beginning of each course and make them available to the department for inspection and copying upon request."',
    requiredCite: "s. 475.451(8), Fla. Stat.",
    engine:
      "Retain for 3 years FROM THE BEGINNING OF EACH COURSE — not from completion, which is the easy misreading and would under-retain for a student who finishes late. Records must be exportable on request in a form the Department can inspect and copy.",
  }),

  row({
    id: "exam-and-answer-sheet-retention",
    dimension: "Examination and answer-sheet retention",
    required:
      'A file copy of each examination and progress test, and ALL student answer sheets, for at least 3 years. Separately, the school keeps a copy of each course completion certificate "for a minimum of five (5) years following the date the course was completed", and may keep it "in any electronic or digital format readily retrivable".',
    requiredCite: "s. 475.451(8), Fla. Stat.; Rule 61J2-3.015(6)(f), (7), F.A.C.",
    engine:
      "TWO retention clocks over two record sets — 3 years for examination copies and answer sheets, 5 years for certificates. Applying one period to both is wrong in one direction or the other. Answer-sheet retention coexists with examination confidentiality: retained is not published.",
  }),

  row({
    id: "accessibility",
    dimension: "Accessibility",
    required: null,
    requiredCite:
      "Nothing found. Chapter 475, Fla. Stat. and Rule Chapter 61J2, F.A.C. impose no accessibility standard on real estate school courses, and the two rules that once governed course media — 61J2-3.016 and 61J2-3.017 — were repealed in 2008.",
    policy:
      "StateCourse applies its own accessibility standard to Florida regardless. The absence of a Florida rule is not a reason to build an inaccessible course, and a course a student cannot use is not one they can complete in the hours the time study claims.",
    engine:
      "Keyboard operability throughout, correct heading structure, sufficient contrast, no colour-only meaning, and no interactive-looking element that does nothing.",
    open: "Whether ADA Title III obligations reach an online-only school is a question for counsel, not for this file, and no position is asserted here.",
  }),

  row({
    id: "captions-transcripts",
    dimension: "Captions and transcripts",
    required: null,
    requiredCite: "Nothing found in Florida authority. Rules 61J2-3.016 and 61J2-3.017 (video standards and viewing conditions) are REPEALED — 2008 — so no Florida media standard survives.",
    policy:
      "Every video captioned, and a transcript available. Captions accurate enough to be read instead of the audio, not alongside it. Applies whether or not video minutes count toward instructional time.",
    engine: "No video ships without a caption track and a transcript. Confidentiality checks run over caption and transcript text as well as the video itself.",
  }),

  row({
    id: "mobile-tablet",
    dimension: "Mobile and tablet delivery",
    required: null,
    requiredCite:
      "Nothing found. Florida requires that 'technical processes used in the delivery of the course operate correctly and the instructional strategies its use supports' (Rule 61J2-3.008(4)(b)3.a) and that alternative plans exist for uninterrupted service on primary system failure (3.b), but prescribes no device or platform.",
    policy: "The course works on phone and tablet, including the examination.",
    engine:
      "Responsive delivery. The server-authoritative examination clock matters more here than anywhere: a mobile session that is backgrounded or loses connectivity must not gain or lose time, and must resume against the same clock.",
  }),
]);

export const DIMENSION_COUNT = DELIVERY_MATRIX.length;

/** Rows where Florida expressly requires something. */
export function expresslyRequired() {
  return DELIVERY_MATRIX.filter((r) => r.required !== null);
}

/** Rows that are StateCourse policy filling a Florida silence. */
export function policyOnly() {
  return DELIVERY_MATRIX.filter((r) => r.required === null && r.policy !== null);
}

/** Rows carrying something still unresolved. */
export function unresolved() {
  return DELIVERY_MATRIX.filter((r) => r.open !== null);
}

export default Object.freeze({
  DELIVERY_MATRIX,
  DIMENSION_COUNT,
  expresslyRequired,
  policyOnly,
  unresolved,
});
