import practiceBank from "./california/practice-question-bank.mjs";
import principlesBank from "./california/principles-question-bank.mjs";
import mortgageBank from "./california/mortgage-question-bank.mjs";
import principlesFinal from "./california/principles-final-exam-bank.mjs";
import practiceFinal from "./california/practice-final-exam-bank.mjs";
import mortgageFinal from "./california/mortgage-final-exam-bank.mjs";

const COURSE_DEFINITIONS = {
  "ca-real-estate-principles-45": {
    title: "Real Estate Principles",
    contentFolder: "ca-real-estate-principles-45-v1",
    subjects: [
      "The real estate profession and California regulatory structure",
      "Real property, personal property, and fixtures",
      "Estates, ownership, and common interests",
      "Land description, measurement, and boundaries",
      "Encumbrances, liens, easements, and restrictions",
      "Government powers, land use, and environmental controls",
      "Agency and brokerage relationships",
      "Contracts and transaction formation",
      "Transfer, deeds, title, and recording",
      "Escrow, settlement, and transaction chronology",
      "Real estate finance foundations",
      "Valuation and appraisal foundations",
      "Taxation, investment, and real estate mathematics",
      "Fair housing, civil rights, and consumer protection",
      "Leasing, property management, license law, and integrated transaction"
    ]
  },
  "ca-real-estate-practice-45": {
    title: "Real Estate Practice",
    contentFolder: "ca-real-estate-practice-45-v1",
    subjects: [
      "California practice standards and the regulated professional",
      "Building a lawful real estate practice",
      "Agency disclosure and fiduciary performance",
      "Seller counseling and listing agreements",
      "Market analysis and pricing strategy",
      "Marketing, advertising, and fair access",
      "Buyer representation and property selection",
      "Purchase agreements, counteroffers, and contingencies",
      "Disclosures and property-condition risk",
      "Financing the transaction",
      "Escrow, title, closing, and possession",
      "Property management and leasing practice",
      "Ethics, risk management, and dispute prevention",
      "Implicit bias and fair housing participatory practicum",
      "Integrated California residential transaction"
    ]
  },
  "ca-mortgage-loan-brokering-lending-45": {
    title: "Mortgage Loan Brokering and Lending",
    contentFolder: "ca-mortgage-loan-brokering-lending-45-v1",
    subjects: [
      "California mortgage brokerage and regulatory structure",
      "Money, interest, notes, and loan mathematics",
      "Security instruments and lien priority",
      "Mortgage markets, sources, and loan products",
      "Application, borrower information, and qualification",
      "Underwriting, collateral, and approval conditions",
      "Federal consumer mortgage law",
      "California broker law, trust funds, and records",
      "Mortgage disclosures, compensation, and closing costs",
      "Origination, processing, and closing workflow",
      "Appraisal, title, escrow, and settlement",
      "Private money, seller financing, and nontraditional transactions",
      "Servicing, payoff, default, and foreclosure",
      "Fair lending, fraud prevention, and ethical mortgage practice",
      "Integrated California mortgage brokerage file"
    ]
  }
};

const QUESTION_BANKS = {
  "ca-real-estate-principles-45": principlesBank,
  "ca-real-estate-practice-45": practiceBank,
  "ca-mortgage-loan-brokering-lending-45": mortgageBank
};

/* An applied exercise is a single decision on one transaction file, so it is scored
   whole. The engagement check and its remediation alternate are five-item quizzes
   against the 80% lesson mastery threshold the lesson plan states. */
const PASSING_PERCENT = { applied: 100, engagement: 80, remediation: 80 };

/* RE 303 p.4 and database/004_california_prelicense.sql both fix the final examination
   at two forms of 100 questions, 60% to pass, one retake on different questions. The
   banks live outside `public/` and site/build.sh fails the build if a file matching
   /final-exam-bank|answer-key/ reaches `dist`. */
const FINAL_EXAM_BANKS = {
  "ca-real-estate-principles-45": principlesFinal,
  "ca-real-estate-practice-45": practiceFinal,
  "ca-mortgage-loan-brokering-lending-45": mortgageFinal
};
const FINAL_PASSING_PERCENT = 60;
const FINAL_QUESTION_COUNT = 100;
const FINAL_EXAM_MINUTES = 180;
export const CALIFORNIA_FINAL_EXAM_FORMS = Object.freeze(["A", "B"]);

export function getCaliforniaCourse(courseId) {
  const course = COURSE_DEFINITIONS[courseId];
  if (!course) return null;
  return {
    courseId,
    title: course.title,
    version: "1.0",
    state: "CA",
    regulator: "California Department of Real Estate",
    requiredHours: 45,
    assignmentCount: 15,
    expectedMinutesPerAssignment: 180,
    minimumElapsedHours: 420,
    finalPassingPercent: FINAL_PASSING_PERCENT,
    finalQuestionCount: FINAL_QUESTION_COUNT,
    finalExamMinutes: FINAL_EXAM_MINUTES,
    finalExamOpenBook: false,
    finalExamProctored: true,
    maxFinalAttempts: 2,
    approvalStatus: "Submission draft — not yet approved",
    subjects: [...course.subjects],
    assignments: course.subjects.map((title, index) => ({
      id: "assignment-" + String(index + 1).padStart(2, "0"),
      sequence: index + 1,
      title,
      expectedMinutes: 180,
      sectionCount: 6,
      contentPath: "/content/california/" + course.contentFolder + "/lesson-" + String(index + 1).padStart(2, "0") + ".md"
    }))
  };
}

/* Items are authored with the correct answer written first, which keeps the banks
   readable and reviewable. Presenting them that way would hand every student the
   answer key, so each item's choices are permuted deterministically from its id: the
   order is stable across requests and across sessions, which the audit trail requires
   because a recorded selected_choice must keep meaning the same option forever. */
function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

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

export function getCaliforniaAssessment(courseId, assignmentId, kind = "engagement") {
  const course = getCaliforniaCourse(courseId);
  const assignment = course?.assignments.find((item) => item.id === assignmentId);
  const lesson = QUESTION_BANKS[courseId]?.assignments?.[assignmentId];
  if (!course || !assignment || !lesson) return null;
  const authored = kind === "applied" ? [lesson.applied] : lesson[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${assignmentId}-${kind}`,
    kind,
    assignmentId,
    passingPercent: PASSING_PERCENT[kind],
    items: authored.map((item, index) => {
      const id = `${assignmentId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

/* The final examination is served through the same shape as a lesson assessment, so
   `publicAssessment` strips the answer key and `scoreCaliforniaAssessment` grades it by
   the same code path the tests already cover. `form` selects the attempt: A is the first
   examination, B the single retake, and RE 303 requires the retake to use different
   questions. `source` stays on the server object for the instructor answer key and is
   dropped by `publicAssessment` before anything reaches a browser. */
export function getCaliforniaFinalExam(courseId, form = "A") {
  const course = getCaliforniaCourse(courseId);
  const authored = FINAL_EXAM_BANKS[courseId]?.forms?.[form];
  if (!course || !Array.isArray(authored) || authored.length !== FINAL_QUESTION_COUNT) return null;
  return {
    id: `${courseId}-final-${form}`,
    kind: "final",
    form,
    assignmentId: null,
    passingPercent: FINAL_PASSING_PERCENT,
    minutes: FINAL_EXAM_MINUTES,
    items: authored.map((item, index) => {
      const id = `final-${form}-${String(index + 1).padStart(3, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return {
        id,
        prompt: item.prompt,
        choices: presented.choices,
        correctChoice: presented.correctChoice,
        rationale: item.rationale,
        source: item.source,
        crossReferences: item.crossReferences ?? []
      };
    })
  };
}

/* Which form a given attempt uses. Attempt 1 is Form A; the single permitted retake is
   Form B. Anything beyond `maxFinalAttempts` has no form, which is the point. */
export function californiaFinalExamForm(attemptNumber) {
  return CALIFORNIA_FINAL_EXAM_FORMS[Number(attemptNumber) - 1] ?? null;
}

/* The student payload must never carry an answer key. Stripping happens per item so
   that adding a field to an item cannot accidentally leak it to the browser. */
export function publicAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    assignmentId: assessment.assignmentId,
    passingPercent: assessment.passingPercent,
    /* Present only on a final examination. The form letter and the time limit are not
       secrets — the student is told both — but the answer key, the rationale, and the
       answer-key source reference are stripped with every other unlisted field. */
    ...(assessment.form ? { form: assessment.form } : {}),
    ...(assessment.minutes ? { minutes: assessment.minutes } : {}),
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

/* Scoring lives here rather than in the request handler so that the student path, the
   reviewer path, and the tests all grade identically. `answers` is positional: one
   choice index per item, in item order. */
export function scoreCaliforniaAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    const selectedChoice = Number(answers[index]);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    const correct = selectedChoice === item.correctChoice;
    results.push({ itemId: item.id, selectedChoice, correct, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

export const CALIFORNIA_COURSE_IDS = Object.freeze(Object.keys(COURSE_DEFINITIONS));
