/**
 * Oklahoma Basic Course of Real Estate, Part I of II (90 clock hours) — course engine.
 *
 * WHAT THE COMMISSION FIXES. 605:10-3-1(a)(1) fixes the provisional sales associate course at ninety
 * clock hours, names it "the Basic Course of Real Estate, Part I of II," and lists TWENTY-TWO areas of
 * study, (A) through (V). It allocates NO hours among them. So the topic list is the Commission's and
 * the module grouping and hour allocation are StateCourse proposals for review — the Wisconsin
 * division, not the Maine one.
 *
 * THREE PASSING PERCENTAGES, THREE EXAMINATIONS. Oklahoma's rules use three, and a document naming one
 * without naming its examination misstates the regulator:
 *
 *   COURSE_FINAL_PASSING_PERCENT      75   the entity's end-of-course final     605:10-5-3(f)
 *   STATE_EXAM_PASSING_PERCENT        70   the state provisional sales assoc.   605:10-3-5(f)
 *   INSTRUCTOR_EXAM_PASSING_PERCENT   80   an instructor applicant's exam       605:10-5-1(f)
 *
 * The 80 percent ENGAGEMENT_PASSING_PERCENT below is none of those. It is a StateCourse standard for
 * in-module progression, which 605:10-5-3 does not prescribe, and it coincides numerically with the
 * instructor figure by accident. The payload keeps all four apart and a test asserts it.
 *
 * ITEM SECURITY. 605:10-5-3(e) requires the end-of-course examination to consist of no less than 150
 * questions and provides that "End-of-course examination questions may not be the same as any
 * previously used questions covering the respective course content." That is the strongest
 * item-security provision this project has read in any state: not merely that the key stays secret,
 * but that AN ITEM ONCE USED MAY NOT BE REUSED. FINAL_EXAM records it as a structural requirement so
 * that a build shipping a single fixed reusable final fails a test rather than a submission.
 * 605:10-5-3(i)(3) separately provides that "An answer key may not be included in any course materials
 * provided to the student" — publicOklahomaAssessment strips correctChoice and rationale, and a test
 * proves it.
 *
 * THE EDUCATION EXPIRES. 59 O.S. § 858-302(A): the education "shall only be valid for a period of
 * three (3) years FROM THE DATE THE SCHOOL CERTIFIED successful completion of the course." Not from
 * the student's last module and not from the application. oklahomaEducationValidity computes it.
 *
 * AN OKLAHOMA CLOCK HOUR. 605:10-5-1(i)(5): "Not more than one clock hour may be registered within any
 * one sixty (60) minute period and no more than ten (10) minutes of each hour shall be utilized for
 * breaks." So sixty minutes containing at least fifty of instruction — Missouri's structure, not
 * Maine's or Wisconsin's sixty minutes of instruction.
 *
 * Course version 1.0 submission draft — not approved. No Oklahoma pre-license credit is available.
 */

import MODULE_BANK from "./oklahoma/module-question-bank.mjs";

const COURSE_ID = "ok-basic-prelicense-90-v1";

/* The Commission's figures. */
const REQUIRED_CLOCK_HOURS = 90;
const MINUTES_PER_CLOCK_HOUR = 60;
const MAX_BREAK_MINUTES_PER_CLOCK_HOUR = 10;
const MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR = MINUTES_PER_CLOCK_HOUR - MAX_BREAK_MINUTES_PER_CLOCK_HOUR;
const COURSE_FINAL_PASSING_PERCENT = 75;      /* 605:10-5-3(f) — the entity's final */
const COURSE_FINAL_MIN_ITEMS = 150;           /* 605:10-5-3(e) */
const STATE_EXAM_PASSING_PERCENT = 70;        /* 605:10-3-5(f) — a DIFFERENT examination */
const INSTRUCTOR_EXAM_PASSING_PERCENT = 80;   /* 605:10-5-1(f) — a THIRD examination */
const EDUCATION_VALIDITY_YEARS = 3;           /* 59 O.S. § 858-302(A) */
const STATE_EXAM_RESULT_VALIDITY_YEARS = 1;   /* 605:10-3-5(g) */
const DISTANCE_ENROLMENT_VALIDITY_MONTHS = 6; /* 605:10-5-3(i)(4) */
const ENTITY_RECORD_RETENTION_YEARS = 5;      /* 605:10-5-1(i)(2) */
const COURSE_APPROVAL_VALIDITY_MONTHS = 36;   /* 605:10-5-1(l) */

/* StateCourse standards. 605:10-5-3 prescribes no in-module assessment and no in-module score. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* 605:10-3-1(a)(1)(A) through (V), transcribed. The Commission's own words. */
const AREAS_OF_STUDY = Object.freeze([
  { code: "A", area: "Real Estate Economics and Marketing" },
  { code: "B", area: "Nature of Real Estate" },
  { code: "C", area: "Rights and Interest in Real Estate" },
  { code: "D", area: "Legal Descriptions" },
  { code: "E", area: "Title Search, Encumbrances, and Land Use Control" },
  { code: "F", area: "Transfer of Rights" },
  { code: "G", area: "Service Contracts" },
  { code: "H", area: "Estimating Transaction Expenses" },
  { code: "I", area: "Value and Appraisal" },
  { code: "J", area: "Marketing Activities" },
  { code: "K", area: "Fair Housing" },
  { code: "L", area: "Contract Law Overview" },
  { code: "M", area: "Contract Law and Performance" },
  { code: "N", area: "Offers and Purchase Contracts" },
  { code: "O", area: "Financing Real Estate" },
  { code: "P", area: "Closing a Transaction" },
  { code: "Q", area: "Regulations Affecting Real Estate" },
  { code: "R", area: "Disclosures and Environmental Issues" },
  { code: "S", area: "Property Management and Leasing" },
  { code: "T", area: "Risk Management" },
  { code: "U", area: "Professional Standards of Conduct" },
  { code: "V", area: "Law of Agency" }
].map((item) => Object.freeze(item)));

/* The hour allocation. A StateCourse proposal — 605:10-3-1(a)(1) allocates no hours. */
const MODULES = Object.freeze([
  { id: "module-01", sequence: 1, title: "Real estate economics, marketing, and the nature of real estate", firstHour: 1, hours: 5, areas: ["A", "B"] },
  { id: "module-02", sequence: 2, title: "Rights and interests in real estate, and legal descriptions", firstHour: 6, hours: 6, areas: ["C", "D"] },
  { id: "module-03", sequence: 3, title: "Law of agency — and why Oklahoma does not have one", firstHour: 12, hours: 7, areas: ["V"] },
  { id: "module-04", sequence: 4, title: "Title search, encumbrances, and land use control", firstHour: 19, hours: 6, areas: ["E"] },
  { id: "module-05", sequence: 5, title: "Transfer of rights", firstHour: 25, hours: 5, areas: ["F"] },
  { id: "module-06", sequence: 6, title: "Service contracts and marketing activities", firstHour: 30, hours: 6, areas: ["G", "J"] },
  { id: "module-07", sequence: 7, title: "Value and appraisal", firstHour: 36, hours: 6, areas: ["I"] },
  { id: "module-08", sequence: 8, title: "Estimating transaction expenses", firstHour: 42, hours: 5, areas: ["H"] },
  { id: "module-09", sequence: 9, title: "Contract law overview, and contract law and performance", firstHour: 47, hours: 7, areas: ["L", "M"] },
  { id: "module-10", sequence: 10, title: "Offers and purchase contracts", firstHour: 54, hours: 6, areas: ["N"] },
  { id: "module-11", sequence: 11, title: "Financing real estate", firstHour: 60, hours: 8, areas: ["O"] },
  { id: "module-12", sequence: 12, title: "Closing a transaction", firstHour: 68, hours: 5, areas: ["P"] },
  { id: "module-13", sequence: 13, title: "Fair housing", firstHour: 73, hours: 5, areas: ["K"] },
  { id: "module-14", sequence: 14, title: "Regulations affecting real estate, and professional standards of conduct", firstHour: 78, hours: 5, areas: ["Q", "U"] },
  { id: "module-15", sequence: 15, title: "Disclosures, environmental issues, and risk management", firstHour: 83, hours: 5, areas: ["R", "T"] },
  { id: "module-16", sequence: 16, title: "Property management and leasing", firstHour: 88, hours: 3, areas: ["S"] }
].map((item) => Object.freeze({
  ...item,
  lastHour: item.firstHour + item.hours - 1,
  minInstructionMinutes: item.hours * MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
  clockMinutes: item.hours * MINUTES_PER_CLOCK_HOUR,
  areas: Object.freeze([...item.areas]),
  curriculumPath: `oklahoma/curriculum/${item.id}.md`
})));

/* ---- Import-time invariants ---- */

const totalHours = MODULES.reduce((sum, module) => sum + module.hours, 0);
if (totalHours !== REQUIRED_CLOCK_HOURS) {
  throw new Error(`Oklahoma course engine: modules total ${totalHours} clock hours; 605:10-3-1(a)(1) requires ${REQUIRED_CLOCK_HOURS}.`);
}

const claimedHours = [];
for (const module of MODULES) {
  for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimedHours.push(hour);
}
if (new Set(claimedHours).size !== claimedHours.length) {
  throw new Error("Oklahoma course engine: two modules claim the same clock hour.");
}
for (let hour = 1; hour <= REQUIRED_CLOCK_HOURS; hour += 1) {
  if (!claimedHours.includes(hour)) throw new Error(`Oklahoma course engine: hour ${hour} is claimed by no module.`);
}

if (AREAS_OF_STUDY.length !== 22) {
  throw new Error(`Oklahoma course engine: 605:10-3-1(a)(1) lists twenty-two areas of study; ${AREAS_OF_STUDY.length} are transcribed.`);
}

const covered = new Set(MODULES.flatMap((module) => module.areas));
const uncovered = AREAS_OF_STUDY.filter((area) => !covered.has(area.code));
if (uncovered.length) {
  throw new Error(`Oklahoma course engine: areas of study carried by no module: ${uncovered.map((a) => `(${a.code}) ${a.area}`).join("; ")}`);
}
const unknown = [...covered].filter((code) => !AREAS_OF_STUDY.some((area) => area.code === code));
if (unknown.length) {
  throw new Error(`Oklahoma course engine: modules claim areas 605:10-3-1(a)(1) does not list: ${unknown.join(", ")}`);
}

const bankless = MODULES.filter((module) => !MODULE_BANK[module.id]);
if (bankless.length) {
  throw new Error(`Oklahoma course engine: modules with no question bank: ${bankless.map((m) => m.id).join(", ")}`);
}
/* The bank's own area tags must agree with the module table, or the two could drift apart while each
   looked complete on its own. */
for (const module of MODULES) {
  const tagged = MODULE_BANK[module.id].commissionTopics ?? [];
  if (tagged.join(",") !== module.areas.join(",")) {
    throw new Error(`Oklahoma course engine: ${module.id} bank tags [${tagged}] disagree with the module table [${module.areas}].`);
  }
}

if (MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR + MAX_BREAK_MINUTES_PER_CLOCK_HOUR !== MINUTES_PER_CLOCK_HOUR) {
  throw new Error("Oklahoma course engine: the clock-hour arithmetic does not match 605:10-5-1(i)(5).");
}

/* The three regulator percentages must remain distinct from one another and from this school's
   engagement threshold. A refactor that collapsed any pair would misstate the regulator silently. */
if (COURSE_FINAL_PASSING_PERCENT === STATE_EXAM_PASSING_PERCENT) {
  throw new Error("Oklahoma course engine: the course final and state examination passing scores are different figures for different examinations and must not be equal.");
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

const FINAL_EXAM = Object.freeze({
  id: "end-of-course-examination",
  minimumItems: COURSE_FINAL_MIN_ITEMS,
  passingPercent: COURSE_FINAL_PASSING_PERCENT,
  /* 605:10-5-3(e), final sentence. An item once used may not be reused. */
  itemsMayNotRepeatPreviouslyUsedQuestions: true,
  /* 605:10-5-3(f) — an entity MAY allow a failing student another examination without repeating
     instruction. Recorded as permitted, not as required. */
  retakeWithoutRepeatingInstructionPermitted: true,
  /* 605:10-5-3(i)(3) */
  answerKeyMayNotBeProvidedToStudent: true,
  prescribedByRule: true,
  ruleCitation: "605:10-5-3(e), (f), (g) and (i)(3)"
});

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* Deterministic per item id, so the presented order is stable for as long as the item exists and a
   recorded selection keeps its meaning permanently. Authoring puts the correct answer first; no
   student ever sees that order. */
function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function getOklahomaCourse(courseId = COURSE_ID) {
  if (courseId !== COURSE_ID) return null;
  return Object.freeze({
    courseId: COURSE_ID,
    title: "Basic Course of Real Estate, Part I of II",
    version: "1.0-submission-draft",
    state: "OK",
    regulator: "Oklahoma Real Estate Commission",
    clockHours: REQUIRED_CLOCK_HOURS,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    minInstructionMinutesPerClockHour: MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    maxBreakMinutesPerClockHour: MAX_BREAK_MINUTES_PER_CLOCK_HOUR,
    areasOfStudy: AREAS_OF_STUDY,
    modules: MODULES,
    finalExam: FINAL_EXAM,
    /* 605:10-5-3(j) — the entity must promote this as Part I of a two part series. Ninety hours is
       not the whole of a student's education and no document may imply that it is. */
    partOfSeries: Object.freeze({
      part: 1,
      of: 2,
      thisPart: "Basic Course of Real Estate, Part I of II",
      nextPart: "Provisional Postlicense Course of Real Estate, Part II",
      ruleCitation: "605:10-5-3(j)",
      note: "Ninety hours qualifies an applicant for a PROVISIONAL sales associate licence. 59 O.S. § 858-302 requires further postlicense education after that licence issues before a full sales associate licence."
    }),
    /* What the Commission fixes. */
    commissionRequirements: Object.freeze([
      `605:10-3-1(a)(1) fixes the course at ${REQUIRED_CLOCK_HOURS} clock hours and names it the Basic Course of Real Estate, Part I of II.`,
      "605:10-3-1(a)(1)(A) through (V) list twenty-two areas of study the course shall encompass.",
      `605:10-5-1(i)(5): not more than one clock hour may be registered within any one ${MINUTES_PER_CLOCK_HOUR}-minute period and no more than ${MAX_BREAK_MINUTES_PER_CLOCK_HOUR} minutes of each hour may be used for breaks.`,
      `605:10-5-3(e): the end-of-course examination shall consist of no less than ${COURSE_FINAL_MIN_ITEMS} questions, and end-of-course examination questions may not be the same as any previously used questions covering the respective course content.`,
      `605:10-5-3(f): a student must complete all modules and achieve a passing score of at least ${COURSE_FINAL_PASSING_PERCENT} percent on the entity's final examination; an entity may allow a student who fails to take another examination without repeating instruction.`,
      "605:10-5-3(g): the entity shall publish grading standards and give them to a student in written form at the beginning of the course.",
      "605:10-5-3(i)(3): an answer key may not be included in any course materials provided to the student.",
      `605:10-5-3(i)(4): from the date of enrolment the course has a validity period of ${DISTANCE_ENROLMENT_VALIDITY_MONTHS} months in which to allow successful completion.`,
      "605:10-3-1(d): to complete a distance education course a person must successfully complete all course requirements including all modules and an examination.",
      `605:10-5-1(i)(2): the entity shall maintain enrolment records and roll sheets including hours completed by each student for ${ENTITY_RECORD_RETENTION_YEARS} years.`,
      `59 O.S. § 858-302(A): the education is valid only ${EDUCATION_VALIDITY_YEARS} years from the date the school certified successful completion of the course.`,
      `605:10-3-5(f): ${STATE_EXAM_PASSING_PERCENT} percent passes the STATE provisional sales associate examination — a different examination from this course's final.`,
      `605:10-3-5(g): passing state examination results are valid ${STATE_EXAM_RESULT_VALIDITY_YEARS} year.`,
      `605:10-5-1(l): Commission approval of a pre-license course expires ${COURSE_APPROVAL_VALIDITY_MONTHS} months after issuance.`
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      `The grouping of the Commission's twenty-two areas of study into ${MODULES.length} modules.`,
      `The allocation of the ${REQUIRED_CLOCK_HOURS} clock hours among those modules. 605:10-3-1(a)(1) allocates no hours among its areas of study.`,
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. 605:10-5-3 prescribes no in-module assessment and no in-module passing score. The ${COURSE_FINAL_PASSING_PERCENT} percent that IS prescribed applies to the end-of-course examination.`
    ]),
    /* Three regulator percentages and one of this school's, kept apart deliberately. */
    passingPercentages: Object.freeze({
      courseFinalExamination: Object.freeze({ percent: COURSE_FINAL_PASSING_PERCENT, examination: "the entity's end-of-course final examination", rule: "605:10-5-3(f)", isCommissionFigure: true }),
      stateLicensingExamination: Object.freeze({ percent: STATE_EXAM_PASSING_PERCENT, examination: "the state provisional sales associate / sales associate examination", rule: "605:10-3-5(f)", isCommissionFigure: true }),
      instructorQualifyingExamination: Object.freeze({ percent: INSTRUCTOR_EXAM_PASSING_PERCENT, examination: "an instructor applicant's qualifying examination", rule: "605:10-5-1(f)", isCommissionFigure: true }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isCommissionFigure: false })
    }),
    educationValidityYears: EDUCATION_VALIDITY_YEARS,
    entityRecordRetentionYears: ENTITY_RECORD_RETENTION_YEARS,
    distanceEnrolmentValidityMonths: DISTANCE_ENROLMENT_VALIDITY_MONTHS,
    approvalStatus: "Not approved. No Oklahoma pre-license credit is available for this course. 605:10-5-1(d) bars advertising a course as approved before the Commission approves it, and bars advertising that the entity is endorsed, recommended or accredited by the Commission."
  });
}

export function getOklahomaModule(moduleId) {
  return MODULES.find((item) => item.id === moduleId) ?? null;
}

export function getOklahomaAssessment(moduleId, kind = "engagement") {
  const module = getOklahomaModule(moduleId);
  const bank = MODULE_BANK[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${moduleId}-${kind}`,
    kind,
    moduleId,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${COURSE_ID}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

/* 605:10-5-3(i)(3): "An answer key may not be included in any course materials provided to the
   student." This is the only shape that reaches a student. */
export function publicOklahomaAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreOklahomaAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read would
       silently record choice 0 — a selection the student never made — into a permanent record. */
    const raw = answers[index];
    const selectedChoice = typeof raw === "number"
      ? raw
      : (typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    results.push({ itemId: item.id, selectedChoice, correct: selectedChoice === item.correctChoice, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

/**
 * Credit and completion.
 *
 * 605:10-3-1(d): to complete a distance education course a person must successfully complete ALL
 * course requirements INCLUDING ALL MODULES AND AN EXAMINATION. 605:10-5-3(b) and (c) say the same
 * from the entity's side. So module completion is server-authoritative and the final examination is
 * a separate gate above it.
 *
 * The certificate gate sits above both. 605:10-5-1(d) bars advertising a course as approved before
 * approval, and 605:10-5-1(i)(3) requires a certificate for "each individual successfully completing
 * a course of study approved by the Commission" — without an approval there is no approved course of
 * study and so nothing to certify.
 */
export function oklahomaCreditedClockHours(moduleStates = [], options = {}) {
  const { finalExamPercent = null, approvalNumber = null } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = MODULES.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const allModulesComplete = credited.length === MODULES.length;

  const finalPassed = typeof finalExamPercent === "number" && finalExamPercent >= COURSE_FINAL_PASSING_PERCENT;
  const courseComplete = allModulesComplete && finalPassed;

  return {
    completedModules: credited.length,
    totalModules: MODULES.length,
    creditedClockHours: creditedHours,
    requiredClockHours: REQUIRED_CLOCK_HOURS,
    creditedMinInstructionMinutes: creditedHours * MIN_INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    areasCovered: Object.freeze([...new Set(credited.flatMap((module) => module.areas))].sort()),
    allModulesComplete,
    finalExamPassed: finalPassed,
    courseFinalPassingPercent: COURSE_FINAL_PASSING_PERCENT,
    courseComplete,
    certificateEligible: courseComplete && Boolean(approvalNumber),
    certificateBlockedBy: (() => {
      if (!allModulesComplete) {
        return `605:10-3-1(d) requires completion of all modules: ${credited.length} of ${MODULES.length} complete (${creditedHours} of ${REQUIRED_CLOCK_HOURS} clock hours).`;
      }
      if (!finalPassed) {
        return finalExamPercent === null
          ? "The end-of-course examination has not been taken."
          : `The end-of-course examination was scored at ${finalExamPercent} percent, below the ${COURSE_FINAL_PASSING_PERCENT} percent required by 605:10-5-3(f). An entity may allow another examination without repeating instruction.`;
      }
      if (!approvalNumber) {
        return "No Oklahoma Real Estate Commission course approval number is recorded, so there is no approved course of study to certify.";
      }
      return null;
    })()
  };
}

/**
 * 59 O.S. § 858-302(A) — the education is valid three years FROM THE DATE THE SCHOOL CERTIFIED
 * successful completion. Not from the last module and not from the application.
 *
 * certifiedOn and applicationDate are ISO date strings. Nothing here decides eligibility for a
 * licence — that is the Commission's. This reports what the school's own record shows.
 */
export function oklahomaEducationValidity(certifiedOn, applicationDate = null) {
  if (typeof certifiedOn !== "string") return null;
  const certified = new Date(certifiedOn);
  if (Number.isNaN(certified.valueOf())) return null;

  const expiresOn = new Date(certified);
  expiresOn.setFullYear(expiresOn.getFullYear() + EDUCATION_VALIDITY_YEARS);

  let withinWindow = null;
  let application = null;
  if (typeof applicationDate === "string") {
    const parsed = new Date(applicationDate);
    if (!Number.isNaN(parsed.valueOf())) {
      application = parsed;
      withinWindow = parsed <= expiresOn;
    }
  }

  return {
    certifiedOn: certified.toISOString().slice(0, 10),
    validityYears: EDUCATION_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    applicationDate: application ? application.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredFrom: "the date the school certified successful completion of the course — 59 O.S. § 858-302(A)",
    blockedBy: withinWindow === false
      ? `The school certified completion on ${certified.toISOString().slice(0, 10)}. Under 59 O.S. § 858-302(A) the education was valid only until ${expiresOn.toISOString().slice(0, 10)}; a further ninety clock hours of basic real estate instruction is required.`
      : null
  };
}

export const OKLAHOMA_COURSE_ID = COURSE_ID;
export const OKLAHOMA_MODULE_IDS = Object.freeze(MODULES.map((item) => item.id));
export const OKLAHOMA_AREAS_OF_STUDY = AREAS_OF_STUDY;
export const OKLAHOMA_COURSE_FINAL_PASSING_PERCENT = COURSE_FINAL_PASSING_PERCENT;
export const OKLAHOMA_STATE_EXAM_PASSING_PERCENT = STATE_EXAM_PASSING_PERCENT;
export const OKLAHOMA_REQUIRED_CLOCK_HOURS = REQUIRED_CLOCK_HOURS;
