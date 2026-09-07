/**
 * Missouri salesperson pre-license — course engine for BOTH required courses.
 *
 * Missouri is the first state in this project whose licence requires two separately approved
 * courses with two different content authorities, and the engine has to keep them apart:
 *
 *   mo-salesperson-preexam-48-v1   48 clock hours. 20 CSR 2250-6.060(1) requires schools to develop
 *                                  this course from "the detailed content outline as provided by the
 *                                  professional testing service contracted to administer the
 *                                  examination." THE COMMISSION PUBLISHES NO TOPIC LIST FOR IT, and
 *                                  this project HAS NOT READ the testing service's outline. So the
 *                                  nine modules and their hours are a StateCourse organisation, and
 *                                  contentAuthority below says so in the payload rather than only in
 *                                  a comment. Reconciling against the outline is a SUBMISSION GATE.
 *
 *   mo-real-estate-practice-24-v1  24 clock hours. 20 CSR 2250-6.060(2) lists SIXTEEN topics, (A)
 *                                  through (P), that the course "must address" — transcribed below.
 *                                  The rule allocates no hours among them, so the topics are the
 *                                  Commission's and the hour allocation is StateCourse's, and the
 *                                  import-time checks hold every one of the sixteen to a module.
 *
 * A MISSOURI CLOCK HOUR IS NOT AN HOUR OF INSTRUCTION. 20 CSR 2250-7.070(2): "an hour means sixty
 * (60) minutes, at least fifty (50) minutes of which shall be devoted to actual instruction and no
 * more than ten (10) minutes of which shall be devoted to a recess." That differs from Maine and
 * Wisconsin, which require sixty minutes of instruction, and from Virginia's fifty-minute hour. The
 * arithmetic here depends on it and states it.
 *
 * THE 75 PERCENT IS THE COMMISSION'S. 20 CSR 2250-7.080(1)(E) requires the school to deliver a
 * certificate of course completion to a distance student "who achieves a score of at least
 * seventy-five percent (75%)" within ten days following administration of the final examination. So
 * unlike Wisconsin — where every threshold is this school's — Missouri's final-examination standard
 * must be attributed to the Commission, and the 80 percent in-module engagement threshold must be
 * attributed to StateCourse. Getting that attribution backwards in either direction misstates the
 * regulator.
 *
 * TWO FINAL EXAMINATION FORMS, NOT ONE. 20 CSR 2250-7.080(1)(B) requires, for a distance course of
 * more than three hours, "two (2) final examination forms (primary and alternate) of at least fifty
 * (50) multiple choice items each, with no duplication of items." FINAL_EXAM records that as a
 * structural requirement so a build that ships one form fails a test rather than a submission.
 *
 * Course version 1.0 submission draft — neither course is approved. No Missouri pre-license credit
 * is available for either.
 */

import PREEXAM_BANK from "./missouri/preexam-48-question-bank.mjs";
import MREP_BANK from "./missouri/mrep-24-question-bank.mjs";
import { missouriEducationWindow } from "./education-date-windows.mjs";

/* The Commission's figures, from the rules. */
const MINUTES_PER_CLOCK_HOUR = 60;
const INSTRUCTION_MINUTES_PER_CLOCK_HOUR = 50;
const MAX_RECESS_MINUTES_PER_CLOCK_HOUR = 10;
const PREEXAM_CLOCK_HOURS = 48;
const MREP_CLOCK_HOURS = 24;
const COMMISSION_FINAL_PASSING_PERCENT = 75;
const FINAL_EXAM_MIN_ITEMS = 50;
const FINAL_EXAM_FORMS = 2;
const CERTIFICATE_DELIVERY_DAYS = 10;
const RECORD_RETENTION_YEARS = 4;

/* StateCourse standards. 20 CSR 2250 prescribes no in-module assessment and no in-module score. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* 20 CSR 2250-6.060(2)(A) through (P), transcribed. These are the Commission's own words for the
   MREP course's required topics; the rule allocates no hours among them. */
const MREP_TOPICS = Object.freeze([
  { code: "A", topic: "Broker Disclosure Form" },
  { code: "B", topic: "Listing a Property" },
  { code: "C", topic: "Buyer Representation" },
  { code: "D", topic: "Acting as a Dual Agent or Transaction Broker" },
  { code: "E", topic: "Termination of Brokerage Relationships" },
  { code: "F", topic: "Compensation" },
  { code: "G", topic: "Cooperating with Other Licensees" },
  { code: "H", topic: "Obligations of Agents to Clients and Customers" },
  { code: "I", topic: "Pricing Property" },
  { code: "J", topic: "Role of the Appraiser" },
  { code: "K", topic: "Types of Financing" },
  { code: "L", topic: "Estimating Closing Costs" },
  { code: "M", topic: "Contracts" },
  { code: "N", topic: "Earnest Money" },
  { code: "O", topic: "Avoiding Misrepresentation" },
  { code: "P", topic: "Types of Construction" }
].map((item) => Object.freeze(item)));

const freezeModules = (list, courseDir) => Object.freeze(list.map((item) => Object.freeze({
  ...item,
  lastHour: item.firstHour + item.hours - 1,
  instructionMinutes: item.hours * INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
  clockMinutes: item.hours * MINUTES_PER_CLOCK_HOUR,
  commissionTopics: Object.freeze([...(item.commissionTopics ?? [])]),
  curriculumPath: `missouri/${courseDir}/curriculum/${item.id}.md`
})));

const PREEXAM_MODULES = freezeModules([
  { id: "module-01", sequence: 1, title: "Real property, ownership, and the real estate business", firstHour: 1, hours: 5 },
  { id: "module-02", sequence: 2, title: "Interests in real estate, forms of ownership, and legal descriptions", firstHour: 6, hours: 6 },
  { id: "module-03", sequence: 3, title: "Agency and the Missouri brokerage relationships", firstHour: 12, hours: 6 },
  { id: "module-04", sequence: 4, title: "Contracts", firstHour: 18, hours: 6 },
  { id: "module-05", sequence: 5, title: "Real estate finance and real estate mathematics", firstHour: 24, hours: 6 },
  { id: "module-06", sequence: 6, title: "Valuation, market analysis, leases, and property management", firstHour: 30, hours: 5 },
  { id: "module-07", sequence: 7, title: "Title, transfer of title, and closing", firstHour: 35, hours: 5 },
  { id: "module-08", sequence: 8, title: "Fair housing, federal law, land use, and environmental concerns", firstHour: 40, hours: 5 },
  { id: "module-09", sequence: 9, title: "Missouri licence law, the Commission, and professional conduct", firstHour: 45, hours: 4 }
], "mo-salesperson-preexam-48-v1");

const MREP_MODULES = freezeModules([
  { id: "module-01", sequence: 1, title: "The Broker Disclosure Form and the obligations of agents to clients and customers", firstHour: 1, hours: 4, commissionTopics: ["A", "H"] },
  { id: "module-02", sequence: 2, title: "Listing a property and buyer representation", firstHour: 5, hours: 5, commissionTopics: ["B", "C"] },
  { id: "module-03", sequence: 3, title: "Dual agency, transaction brokerage, termination, compensation, and cooperation", firstHour: 10, hours: 4, commissionTopics: ["D", "E", "F", "G"] },
  { id: "module-04", sequence: 4, title: "Pricing property, the role of the appraiser, and types of construction", firstHour: 14, hours: 4, commissionTopics: ["I", "J", "P"] },
  { id: "module-05", sequence: 5, title: "Types of financing and estimating closing costs", firstHour: 18, hours: 4, commissionTopics: ["K", "L"] },
  { id: "module-06", sequence: 6, title: "Contracts, earnest money, and avoiding misrepresentation", firstHour: 22, hours: 3, commissionTopics: ["M", "N", "O"] }
], "mo-real-estate-practice-24-v1");

const COURSES = Object.freeze({
  "mo-salesperson-preexam-48-v1": Object.freeze({
    courseId: "mo-salesperson-preexam-48-v1",
    title: "Missouri Salesperson Pre-Examination Course",
    clockHours: PREEXAM_CLOCK_HOURS,
    modules: PREEXAM_MODULES,
    bank: PREEXAM_BANK,
    curriculumDir: "mo-salesperson-preexam-48-v1",
    /* The whole point of splitting the two courses. */
    contentAuthority: "20 CSR 2250-6.060(1) requires this course to be developed from the detailed content outline supplied by the professional testing service contracted to administer the examination. The Commission publishes no topic list for it. That outline has NOT been read for this project, so the nine modules and their hour allocation are a StateCourse organisation of the general body of salesperson pre-license knowledge, and the course must be reconciled against the outline before submission.",
    contentAuthorityIsCommission: false,
    commissionTopics: null
  }),
  "mo-real-estate-practice-24-v1": Object.freeze({
    courseId: "mo-real-estate-practice-24-v1",
    title: "Missouri Real Estate Practice Course",
    clockHours: MREP_CLOCK_HOURS,
    modules: MREP_MODULES,
    bank: MREP_BANK,
    curriculumDir: "mo-real-estate-practice-24-v1",
    contentAuthority: "20 CSR 2250-6.060(2) lists sixteen topics, (A) through (P), that this course must address. The topics are the Commission's. The rule allocates no hours among them, so the grouping into six modules and the hour allocation are StateCourse proposals for Commission review.",
    contentAuthorityIsCommission: true,
    commissionTopics: MREP_TOPICS
  })
});

/* ---- Import-time invariants. Arithmetic drift in an hour table is silent: it produces a course
   that looks complete and is not, and 20 CSR 2250-7.090(5)(K) makes awarding credit to a student
   who has not satisfactorily completed the course a ground for a complaint. ---- */

for (const course of Object.values(COURSES)) {
  const total = course.modules.reduce((sum, module) => sum + module.hours, 0);
  if (total !== course.clockHours) {
    throw new Error(`Missouri course engine: ${course.courseId} modules total ${total} clock hours; the rule requires ${course.clockHours}.`);
  }

  const claimed = [];
  for (const module of course.modules) {
    for (let hour = module.firstHour; hour <= module.lastHour; hour += 1) claimed.push(hour);
  }
  if (new Set(claimed).size !== claimed.length) {
    throw new Error(`Missouri course engine: ${course.courseId} has two modules claiming the same clock hour.`);
  }
  for (let hour = 1; hour <= course.clockHours; hour += 1) {
    if (!claimed.includes(hour)) {
      throw new Error(`Missouri course engine: ${course.courseId} hour ${hour} is claimed by no module.`);
    }
  }

  const bankless = course.modules.filter((module) => !course.bank[module.id]);
  if (bankless.length) {
    throw new Error(`Missouri course engine: ${course.courseId} modules with no question bank: ${bankless.map((m) => m.id).join(", ")}`);
  }
  const orphanBanks = Object.keys(course.bank).filter((id) => !course.modules.some((m) => m.id === id));
  if (orphanBanks.length) {
    throw new Error(`Missouri course engine: ${course.courseId} bank has entries for no module: ${orphanBanks.join(", ")}`);
  }
}

/* The MREP course must carry all sixteen of the Commission's topics, and may claim no other. */
if (MREP_TOPICS.length !== 16) {
  throw new Error(`Missouri course engine: 20 CSR 2250-6.060(2) lists sixteen MREP topics; ${MREP_TOPICS.length} are transcribed.`);
}
const mrepCovered = new Set(MREP_MODULES.flatMap((module) => module.commissionTopics));
const mrepUncovered = MREP_TOPICS.filter((topic) => !mrepCovered.has(topic.code));
if (mrepUncovered.length) {
  throw new Error(`Missouri course engine: MREP topics carried by no module: ${mrepUncovered.map((t) => `(${t.code}) ${t.topic}`).join("; ")}`);
}
const mrepUnknown = [...mrepCovered].filter((code) => !MREP_TOPICS.some((topic) => topic.code === code));
if (mrepUnknown.length) {
  throw new Error(`Missouri course engine: MREP modules claim topics the rule does not list: ${mrepUnknown.join(", ")}`);
}
/* And the bank's own topic tags must agree with the module table, or the two could drift apart
   while each looked complete on its own. */
for (const module of MREP_MODULES) {
  const tagged = MREP_BANK[module.id].commissionTopics ?? [];
  if (tagged.join(",") !== module.commissionTopics.join(",")) {
    throw new Error(`Missouri course engine: MREP ${module.id} bank tags [${tagged}] disagree with the module table [${module.commissionTopics}].`);
  }
}

/* The 48-hour course must NOT claim Commission topics, because the Commission lists none for it. */
if (PREEXAM_MODULES.some((module) => module.commissionTopics.length)) {
  throw new Error("Missouri course engine: a pre-examination module claims a Commission topic, but 20 CSR 2250-6.060(1) lists none for that course.");
}

/* The Missouri clock hour, held to the rule's own arithmetic. */
if (INSTRUCTION_MINUTES_PER_CLOCK_HOUR + MAX_RECESS_MINUTES_PER_CLOCK_HOUR !== MINUTES_PER_CLOCK_HOUR) {
  throw new Error("Missouri course engine: the clock-hour arithmetic does not match 20 CSR 2250-7.070(2).");
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

const FINAL_EXAM = Object.freeze({
  forms: FINAL_EXAM_FORMS,
  formNames: Object.freeze(["primary", "alternate"]),
  minimumItemsPerForm: FINAL_EXAM_MIN_ITEMS,
  noDuplicationBetweenForms: true,
  passingPercent: COMMISSION_FINAL_PASSING_PERCENT,
  certificateDeliveryDays: CERTIFICATE_DELIVERY_DAYS,
  prescribedByRule: true,
  ruleCitation: "20 CSR 2250-7.080(1)(B) and (E)"
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

export function getMissouriCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return Object.freeze({
    courseId: course.courseId,
    title: course.title,
    version: "1.0-submission-draft",
    state: "MO",
    regulator: "Missouri Real Estate Commission, Department of Commerce and Insurance",
    clockHours: course.clockHours,
    minutesPerClockHour: MINUTES_PER_CLOCK_HOUR,
    instructionMinutesPerClockHour: INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    maxRecessMinutesPerClockHour: MAX_RECESS_MINUTES_PER_CLOCK_HOUR,
    instructionMinutes: course.clockHours * INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    modules: course.modules,
    commissionTopics: course.commissionTopics,
    contentAuthority: course.contentAuthority,
    contentAuthorityIsCommission: course.contentAuthorityIsCommission,
    finalExam: FINAL_EXAM,
    /* What the Commission fixes. Attributed to the Commission because it IS the Commission's. */
    commissionRequirements: Object.freeze([
      `A Missouri clock hour is ${MINUTES_PER_CLOCK_HOUR} minutes, at least ${INSTRUCTION_MINUTES_PER_CLOCK_HOUR} of which shall be devoted to actual instruction and no more than ${MAX_RECESS_MINUTES_PER_CLOCK_HOUR} to a recess — 20 CSR 2250-7.070(2).`,
      `The final examination passing standard is ${COMMISSION_FINAL_PASSING_PERCENT} percent, and the certificate of course completion is delivered within ${CERTIFICATE_DELIVERY_DAYS} days on a Commission-prescribed form — 20 CSR 2250-7.080(1)(E).`,
      `A distance course of more than three hours requires ${FINAL_EXAM_FORMS} final examination forms, primary and alternate, of at least ${FINAL_EXAM_MIN_ITEMS} multiple choice items each with no duplication of items — 20 CSR 2250-7.080(1)(B).`,
      `Each student's records are maintained for a minimum of ${RECORD_RETENTION_YEARS} years — 20 CSR 2250-7.010(1)(K)5.`,
      "Completion-time statistics are reported by 31 July and 31 January, and if at least fifty percent of students took less time than the course submission identified the school has ten days to withdraw the course or file an amended outline — 20 CSR 2250-7.080(4).",
      "The education must have been successfully completed within six months prior to the date of application for a salesperson licence — § 339.040.6, RSMo.",
      course.contentAuthority
    ]),
    /* What this school decided. Attributed to this school because it IS this school's. */
    stateCourseDecisions: Object.freeze([
      `The grouping into ${course.modules.length} modules and the allocation of the ${course.clockHours} clock hours among them. ${course.contentAuthorityIsCommission ? "20 CSR 2250-6.060(2) lists the topics but allocates no hours among them." : "20 CSR 2250-6.060(1) delegates the content to the testing service's outline, which this project has not read."}`,
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. 20 CSR 2250 prescribes no in-module assessment and no in-module passing score. The ${COMMISSION_FINAL_PASSING_PERCENT} percent that IS prescribed applies to the final examination.`
    ]),
    commissionFinalPassingPercent: COMMISSION_FINAL_PASSING_PERCENT,
    engagementPassingPercent: ENGAGEMENT_PASSING_PERCENT,
    recordRetentionYears: RECORD_RETENTION_YEARS,
    educationValidityMonths: 6,
    approvalStatus: "Not approved. No Missouri pre-license credit is available for this course. 20 CSR 2250-7.010(1)(L)6 bars announcing or advertising a course for credit before the Commission approves it in writing."
  });
}

export function getMissouriModule(courseId, moduleId) {
  return COURSES[courseId]?.modules.find((item) => item.id === moduleId) ?? null;
}

export function getMissouriAssessment(courseId, moduleId, kind = "engagement") {
  const course = COURSES[courseId];
  if (!course) return null;
  const module = getMissouriModule(courseId, moduleId);
  const bank = course.bank[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${courseId}-${moduleId}-${kind}`,
    kind,
    courseId,
    moduleId,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${courseId}-${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, id);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

export function publicMissouriAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    passingPercent: assessment.passingPercent,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreMissouriAssessment(assessment, answers) {
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
 * Credit and completion for one course.
 *
 * Gates, in order:
 *   instructionComplete   every module of that course.
 *   courseComplete        instruction plus the final examination at the COMMISSION'S 75 percent.
 *   certificateEligible   courseComplete AND a recorded Commission course approval number.
 *
 * The last gate is not a formality. 20 CSR 2250-7.010(1)(L)6 bars announcing or advertising a course
 * for credit before written approval, and 20 CSR 2250-7.090(5)(K) makes awarding credit to a student
 * who has not satisfactorily completed the course a ground for a complaint to the Administrative
 * Hearing Commission. Without an approval there is no pre-license credit in existence to certify.
 */
export function missouriCourseCompletion(courseId, moduleStates = [], options = {}) {
  const course = COURSES[courseId];
  if (!course) return null;
  const { finalExamPercent = null, approvalNumber = null } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = course.modules.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const instructionComplete = credited.length === course.modules.length;

  const finalPassed = typeof finalExamPercent === "number" && finalExamPercent >= COMMISSION_FINAL_PASSING_PERCENT;
  const courseComplete = instructionComplete && finalPassed;

  return {
    courseId,
    completedModules: credited.length,
    totalModules: course.modules.length,
    creditedClockHours: creditedHours,
    requiredClockHours: course.clockHours,
    creditedInstructionMinutes: creditedHours * INSTRUCTION_MINUTES_PER_CLOCK_HOUR,
    commissionTopicsCovered: course.commissionTopics
      ? Object.freeze([...new Set(credited.flatMap((module) => module.commissionTopics))].sort())
      : null,
    instructionComplete,
    finalExamPassed: finalPassed,
    commissionFinalPassingPercent: COMMISSION_FINAL_PASSING_PERCENT,
    courseComplete,
    certificateEligible: courseComplete && Boolean(approvalNumber),
    certificateBlockedBy: (() => {
      if (!instructionComplete) {
        return `Not all ${course.clockHours} clock hours completed (${creditedHours} of ${course.clockHours}).`;
      }
      if (!finalPassed) {
        return finalExamPercent === null
          ? "The final examination has not been taken."
          : `The final examination was scored at ${finalExamPercent} percent, below the Commission's ${COMMISSION_FINAL_PASSING_PERCENT} percent standard in 20 CSR 2250-7.080(1)(E).`;
      }
      if (!approvalNumber) {
        return "No Missouri Real Estate Commission course approval number is recorded, so no pre-license credit exists to certify.";
      }
      return null;
    })()
  };
}

/**
 * Licence-education readiness across BOTH courses.
 *
 * Missouri requires the 48-hour pre-examination course AND the 24-hour practice course, and
 * § 339.040.6, RSMo, requires the education to have been "successfully completed within six months
 * prior to the date of application." So finishing both is necessary and not sufficient: the
 * six-month window is what students actually lose courses to, and it is computed here rather than
 * left to be noticed.
 *
 * completedOn / applicationDate are ISO date strings. Nothing here decides eligibility for a licence
 * — that is the Commission's. This reports what the school's own records show.
 */
export function missouriEducationReadiness(completions = {}, options = {}) {
  const required = Object.keys(COURSES);
  const { applicationDate = null } = options;

  const perCourse = required.map((courseId) => {
    const entry = completions[courseId] ?? null;
    return {
      courseId,
      title: COURSES[courseId].title,
      clockHours: COURSES[courseId].clockHours,
      complete: Boolean(entry?.courseComplete),
      certificated: Boolean(entry?.certificateEligible),
      completedOn: entry?.completedOn ?? null
    };
  });

  const allComplete = perCourse.every((entry) => entry.complete);
  const allCertificated = perCourse.every((entry) => entry.certificated);

  // The standard route is anchored to the 48-hour pre-exam completion date.
  const windowStatus = missouriEducationWindow(perCourse, applicationDate);

  return {
    requiredCourses: Object.freeze(perCourse.map((entry) => Object.freeze(entry))),
    allCoursesComplete: allComplete,
    allCoursesCertificated: allCertificated,
    educationValidityMonths: 6,
    educationWindow: windowStatus,
    readinessBlockedBy: (() => {
      const missing = perCourse.filter((entry) => !entry.complete);
      if (missing.length) return `Not complete: ${missing.map((entry) => entry.title).join("; ")}.`;
      if (!allCertificated) return "No Commission course approval number is recorded for every course, so no certificate may issue.";
      if (applicationDate && !windowStatus) return "Valid completion and application dates are required.";
      if (windowStatus?.completionAfterApplication) return "All required education must be completed before application.";
      if (windowStatus && windowStatus.earliestCompletion < windowStatus.windowStartsOn) return "The standard route requires the 48-hour pre-exam course before MREP.";
      if (windowStatus && !windowStatus.withinWindow) {
        return `The pre-exam education was completed on ${windowStatus.windowStartsOn}; § 339.040.6, RSMo, requires completion within six months prior to the date of application, and that window closed on ${windowStatus.windowClosesOn}.`;
      }
      return null;
    })()
  };
}

export const MISSOURI_COURSE_IDS = Object.freeze(Object.keys(COURSES));
export const MISSOURI_PREEXAM_COURSE_ID = "mo-salesperson-preexam-48-v1";
export const MISSOURI_MREP_COURSE_ID = "mo-real-estate-practice-24-v1";
export const MISSOURI_MREP_TOPICS = MREP_TOPICS;
export const MISSOURI_COMMISSION_FINAL_PASSING_PERCENT = COMMISSION_FINAL_PASSING_PERCENT;
