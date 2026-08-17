import { getPracticeAssessment } from "./california-practice-assessments.mjs";

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

const CHOICES = [
  "Verify the governing facts and current authority, document the analysis, and escalate questions beyond the licensee's scope.",
  "Rely on customary practice when the file is incomplete because speed is the controlling consideration.",
  "Treat a verbal assurance as a substitute for required disclosure, consent, or documentary evidence.",
  "Choose the result that benefits the licensee and correct the record only if a consumer later objects."
];

function rotateChoices(correctIndex) {
  const ordered = [];
  for (let index = 0; index < CHOICES.length; index += 1) {
    ordered.push(CHOICES[(index - correctIndex + CHOICES.length) % CHOICES.length]);
  }
  return ordered;
}

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
    finalPassingPercent: 60,
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

export function getCaliforniaAssessment(courseId, assignmentId, kind = "engagement") {
  const course = getCaliforniaCourse(courseId);
  const assignment = course?.assignments.find((item) => item.id === assignmentId);
  if (!course || !assignment) return null;
  if (courseId === "ca-real-estate-practice-45") {
    const curated = getPracticeAssessment(assignment.sequence, kind);
    if (curated) return { id: assignment.id + "-" + kind, ...curated };
  }
  const correctIndex = kind === "remediation"
    ? (assignment.sequence + 1) % CHOICES.length
    : assignment.sequence % CHOICES.length;
  const choices = rotateChoices(correctIndex);
  const correctChoice = choices.findIndex((choice) => choice === CHOICES[0]);
  if (kind === "applied") {
    return {
      id: assignment.id + "-applied",
      prompt: "A California transaction file presents an unresolved issue involving " + assignment.title.toLowerCase() + ". Which response best protects the consumer and the integrity of the file?",
      choices,
      correctChoice,
      rationale: "A compliant professional verifies facts and current authority, documents the decision path, and obtains broker or specialist guidance when the issue exceeds the licensee's role."
    };
  }
  if (kind === "remediation") {
    return {
      id: assignment.id + "-remediation",
      prompt: "After reviewing a second scenario involving " + assignment.title.toLowerCase() + ", which action should occur before an irreversible deadline or consumer decision?",
      choices,
      correctChoice,
      rationale: "Verification, documentation, and appropriate escalation must occur before the professional treats a disputed or incomplete issue as resolved."
    };
  }
  return {
    id: assignment.id + "-engagement",
    prompt: "Which professional control is most important when applying this assignment's material on " + assignment.title.toLowerCase() + "?",
    choices,
    correctChoice,
    rationale: "The course uses a fact–authority–application–record workflow. Custom, speed, or self-interest cannot replace verified authority and a reconstructable record."
  };
}

export function publicAssessment(assessment) {
  if (!assessment) return null;
  const { correctChoice: _hidden, rationale: _hiddenRationale, ...safe } = assessment;
  return safe;
}

export const CALIFORNIA_COURSE_IDS = Object.freeze(Object.keys(COURSE_DEFINITIONS));
