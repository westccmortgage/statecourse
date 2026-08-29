/**
 * Texas Principles of Real Estate II — scenario-based learning exercises.
 *
 * WHAT THIS FILE IS. The four scenario-based learning exercises for the 30-hour Principles of Real
 * Estate II course. They are the course's APPLIED instrument: a student works a Texas transaction
 * from stated facts, computes what has to be computed, and chooses or states a defensible course of
 * action. They are not the topic quizzes (config/texas/principles-ii-question-bank.mjs) and they are
 * not the final examination (config/texas/principles-ii-final-exam-bank.mjs).
 *
 * THE REGULATORY BASIS, STATED PRECISELY.
 *
 *   - The COUNT comes from 22 TAC § 535.62(b)(7), held at texas/trec-sources/trec-rules/535.62.txt,
 *     which requires "at least one scenario-based learning exercise per every increment of 10 credit
 *     hours or less." For a 30-hour course that floor is three, and it is read from the rule rather
 *     than asserted here: config/texas/trec-rules-source-lock.mjs derives
 *     ASSESSMENT_REQUIREMENTS.minScenarioExercises from COURSE_CREDIT_HOURS, and the invariant at the
 *     foot of this file compares SCENARIO_COUNT against it. This file carries FOUR, one above the
 *     floor, so that a later topic-coverage change cannot drop the course under the minimum.
 *
 *   - The PASSING RESULT requirement comes from the same subsection: a distance-delivered course must
 *     "prevent the student from moving from one topic to the next topic until the student answers all
 *     topic quiz questions correctly and receives a passing grade on the scenario based learning
 *     exercises." Section 535.62(b)(7) states no number for that passing grade. Each scenario below
 *     therefore sets passingScore to 0.7, mirroring the unweighted 70% that 22 TAC § 535.65(h)(4)
 *     fixes for the final examination; that mirroring is this course's design choice and is recorded
 *     as such, not as a rule the Commission has stated for scenarios.
 *
 *   - 22 TAC § 535.65, held at texas/trec-sources/trec-rules/535.65.txt and read in full on
 *     2026-08-29 before this file was written, supplies the operating requirements these exercises are
 *     built to satisfy. Subsection (g)(2) — Distance Education Delivery — requires the provider to
 *     ensure that "the student taking all topics of the course and completing all quizzes and
 *     exercises is the student receiving credit for the course through a student identity verification
 *     process acceptable to the Commission"; that "a qualified instructor is available to answer
 *     students' questions or provide assistance as necessary in a timely manner"; and — the provision
 *     that governs how these exercises are graded — that "a qualified instructor is responsible for
 *     providing answers and rationale for the grading of the course work." That last clause is why
 *     every scenario below carries instructorReview.required = true and why every task carries a
 *     feedbackCorrect and a feedbackIncorrect: the rationale is authored, not improvised at grading
 *     time. Subsection (h)(2) requires final examination questions to be "significantly different from
 *     any quiz questions and exercises used in the course," which is why the fact patterns below were
 *     written against the question bank rather than reusing it.
 *
 *   - The codified Secretary of State text of 22 TAC ch. 535 remains UNREAD. Both rules above are
 *     taken from TREC's own published reproduction, classified TIER 4 in
 *     config/texas/trec-rules-source-lock.mjs, and TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Nothing
 *     here may be described as TREC-approved and no Texas qualifying credit may be offered.
 *
 * DESIGN RULES THIS FILE ENFORCES ON ITSELF, IN CODE.
 *
 *   1. APPLICATION, NOT RECALL. Every task requires a rule to be applied to the stated facts, an
 *      arithmetic result to be produced, or a choice to be made among courses of action a competent
 *      license holder might defend. No task asks for a definition.
 *
 *   2. OBJECTIVE PASSING CRITERIA. A task is a selection with exactly one correct choice, a
 *      computation with an expected value and a tolerance, or a short answer with a rubric of
 *      specific, checkable elements. NO TASK IS GRADED ON LENGTH. There is no word count, no
 *      character count and no minimum-length requirement anywhere in this file, and the invariants
 *      below reject one if a future edit introduces it — both as a stray key and as a phrase in a
 *      prompt or a rubric line.
 *
 *   3. PASSABLE WITHOUT GIVING LEGAL ADVICE. Where the right move is to refer a legal question to
 *      counsel or to the title company, that referral is part of the correct answer. No task can be
 *      passed only by advising a party on a question a Texas license holder may not answer.
 *
 *   4. NO INVENTED LEGAL RULE. Every figure, deadline, threshold and condition a task turns on is
 *      taught in the frozen curriculum at texas/tx-principles-real-estate-ii-30-v1/curriculum/ and
 *      traceable from there to a held source. Every dollar figure invented to make arithmetic
 *      visible is labelled illustrative, in the same terms the modules use for their own.
 *
 *   5. TEXAS ONLY. No California law, no out-of-state doctrine, and no "dual agency."
 *
 * ARITHMETIC. Every numeric answer below was computed and re-computed by hand while authoring, and
 * each computation task's feedbackCorrect prints the working so the student can find the step that
 * went wrong. The selection tasks whose correct choice recites a number use the same figures.
 */

import { TOPICS, ALL_UNITS } from "./principles-ii-course-form.mjs";
import { ASSESSMENT_REQUIREMENTS } from "./trec-rules-source-lock.mjs";

export const REGULATORY_BASIS = Object.freeze({
  scenarioCountRule: "22 TAC § 535.62(b)(7) — at least one scenario-based learning exercise per every increment of 10 credit hours or less",
  scenarioCountFloor: ASSESSMENT_REQUIREMENTS.minScenarioExercises,
  progressionRule: "22 TAC § 535.62(b)(7) — distance delivery must prevent movement to the next topic until the student receives a passing grade on the scenario based learning exercises",
  gradingRule: "22 TAC § 535.65(g)(2)(D) — a qualified instructor is responsible for providing answers and rationale for the grading of the course work",
  instructorAvailabilityRule: "22 TAC § 535.65(g)(2)(B) — a qualified instructor is available to answer students' questions or provide assistance as necessary in a timely manner",
  identityRule: "22 TAC § 535.65(g)(2)(A) — the student completing all quizzes and exercises must be the student receiving credit, through an identity verification process acceptable to the Commission",
  separationFromFinalRule: "22 TAC § 535.65(h)(2) — final examination questions must be significantly different from any quiz questions and exercises used in the course",
  passingScoreNote:
    "§ 535.62(b)(7) requires a passing grade on the scenario exercises but states no figure. Each scenario sets 0.7, mirroring the unweighted 70% that § 535.65(h)(4) fixes for the final examination. The mirroring is this course's design choice, not a Commission-stated scenario threshold.",
  sourceTier: "TREC-published reproduction of 22 TAC ch. 535 (TIER 4). The codified Secretary of State text is unread; TX_PROVIDER_RULE_SOURCE_LOCK still FAILS.",
});

/* ── lookup tables built from the PRINS2-1 transcription, so a typo cannot survive load ────────── */

const TOPIC_CODES = new Set(TOPICS.map((topic) => topic.code));
const UNIT_BY_CODE = new Map(ALL_UNITS.map((unit) => [unit.code, unit]));
const TOPIC_ORDER = TOPICS.map((topic) => topic.code);

/**
 * The curriculum's heading-slug rule, applied to the unit name printed on PRINS2-1: lowercase, drop
 * punctuation in place (keeping hyphens), spaces to hyphens. " - " therefore becomes "---" and " & "
 * becomes "--", which is exactly how the frozen modules' "## Unit:" headings anchor.
 */
function unitAnchorSlug(unitName) {
  return unitName
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
}

function remediationAnchorFor(unitCode) {
  const unit = UNIT_BY_CODE.get(unitCode);
  if (!unit) throw new Error(`principles-ii-scenarios: unknown unit code ${unitCode}`);
  const moduleNumber = unit.topicCode.slice(1);
  return `module-${moduleNumber}.md#unit-${unitAnchorSlug(unit.unit)}`;
}

/* ── the length-requirement ban, enforced rather than merely promised ──────────────────────────── */

const LENGTH_KEYS = [
  "minLength",
  "maxLength",
  "minWords",
  "maxWords",
  "wordCount",
  "characterCount",
  "minCharacters",
  "maxCharacters",
  "minimumLength",
  "minimumWords",
  "length",
];

const LENGTH_PHRASE = /\b\d+\s*(?:-|\s)?\s*(?:word|words|character|characters)\b|\bword count\b|\bcharacter count\b|\bminimum length\b|\bat least\s+\w+\s+(?:words|characters|sentences|paragraphs)\b/i;

function assertNoLengthRequirement(where, task) {
  for (const key of LENGTH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(task, key)) {
      throw new Error(`${where}: task carries a length requirement key "${key}"; scenario tasks are never graded on length`);
    }
  }
  const texts = [task.prompt, task.feedbackCorrect, task.feedbackIncorrect, ...(task.choices ?? []), ...(task.rubric ?? [])];
  for (const text of texts) {
    if (typeof text === "string" && LENGTH_PHRASE.test(text)) {
      throw new Error(`${where}: task text states a word or character count; scenario tasks are never graded on length`);
    }
  }
}

/* ── the scenario factory: it validates, then freezes ──────────────────────────────────────────── */

const SEEN_SCENARIO_IDS = new Set();
const SEEN_TASK_IDS = new Set();

const TASK_TYPES = new Set(["selection", "computation", "short-answer"]);

function scenario(id, spec) {
  const where = `principles-ii-scenarios ${id}`;

  if (!/^PRINS2-SC[1-9][0-9]*$/.test(id)) throw new Error(`${where}: scenario id must look like PRINS2-SC1`);
  if (SEEN_SCENARIO_IDS.has(id)) throw new Error(`${where}: duplicate scenario id`);
  SEEN_SCENARIO_IDS.add(id);
  const scenarioNumber = id.slice("PRINS2-SC".length);

  if (typeof spec.title !== "string" || spec.title.trim() === "") throw new Error(`${where}: missing title`);
  if (typeof spec.context !== "string" || spec.context.trim() === "") throw new Error(`${where}: missing context`);
  if (!Array.isArray(spec.facts) || spec.facts.length === 0) throw new Error(`${where}: missing facts`);
  for (const fact of spec.facts) {
    if (typeof fact !== "string" || fact.trim() === "") throw new Error(`${where}: every fact must be a non-empty string`);
  }

  /* placement */
  const placement = spec.placement;
  if (!placement || typeof placement !== "object") throw new Error(`${where}: missing placement`);
  if (!TOPIC_CODES.has(placement.afterTopic)) throw new Error(`${where}: placement.afterTopic ${placement.afterTopic} is not a PRINS2-1 topic code`);
  if (!Array.isArray(placement.unlockRequires) || placement.unlockRequires.length === 0) {
    throw new Error(`${where}: placement.unlockRequires must list the topics that must be completed first`);
  }
  for (const topicCode of placement.unlockRequires) {
    if (!TOPIC_CODES.has(topicCode)) throw new Error(`${where}: placement.unlockRequires names unknown topic ${topicCode}`);
  }
  if (!placement.unlockRequires.includes(placement.afterTopic)) {
    throw new Error(`${where}: placement.unlockRequires must include the afterTopic it is placed behind`);
  }
  if (new Set(placement.unlockRequires).size !== placement.unlockRequires.length) {
    throw new Error(`${where}: placement.unlockRequires repeats a topic`);
  }

  /* assessed topics and units */
  if (!Array.isArray(spec.assessesTopics) || spec.assessesTopics.length === 0) throw new Error(`${where}: assessesTopics is empty`);
  for (const topicCode of spec.assessesTopics) {
    if (!TOPIC_CODES.has(topicCode)) throw new Error(`${where}: assessesTopics names unknown topic ${topicCode}`);
    if (!placement.unlockRequires.includes(topicCode)) {
      throw new Error(`${where}: assesses topic ${topicCode} which the placement does not require the student to have completed`);
    }
  }
  if (!Array.isArray(spec.assessesUnits) || spec.assessesUnits.length === 0) throw new Error(`${where}: assessesUnits is empty`);
  if (new Set(spec.assessesUnits).size !== spec.assessesUnits.length) throw new Error(`${where}: assessesUnits repeats a unit`);
  for (const unitCode of spec.assessesUnits) {
    const unit = UNIT_BY_CODE.get(unitCode);
    if (!unit) throw new Error(`${where}: assessesUnits names unknown unit ${unitCode}`);
    if (!spec.assessesTopics.includes(unit.topicCode)) {
      throw new Error(`${where}: unit ${unitCode} belongs to topic ${unit.topicCode}, which this scenario does not assess`);
    }
  }
  const allowedAnchors = new Set(spec.assessesUnits.map((unitCode) => remediationAnchorFor(unitCode)));

  /* tasks */
  if (!Array.isArray(spec.tasks) || spec.tasks.length < 3) throw new Error(`${where}: a scenario must carry at least three independently gradeable tasks`);

  const tasks = spec.tasks.map((task) => {
    const taskWhere = `${where} task ${task.id}`;
    if (typeof task.id !== "string" || !new RegExp(`^SC${scenarioNumber}-T[1-9][0-9]*$`).test(task.id)) {
      throw new Error(`${taskWhere}: task id must look like SC${scenarioNumber}-T1`);
    }
    if (SEEN_TASK_IDS.has(task.id)) throw new Error(`${taskWhere}: duplicate task id`);
    SEEN_TASK_IDS.add(task.id);

    if (typeof task.prompt !== "string" || task.prompt.trim() === "") throw new Error(`${taskWhere}: missing prompt`);
    if (!TASK_TYPES.has(task.type)) throw new Error(`${taskWhere}: unknown task type ${task.type}`);
    if (typeof task.points !== "number" || !Number.isFinite(task.points) || task.points <= 0) throw new Error(`${taskWhere}: points must be a positive number`);
    if (typeof task.feedbackCorrect !== "string" || task.feedbackCorrect.trim() === "") throw new Error(`${taskWhere}: missing feedbackCorrect`);
    if (typeof task.feedbackIncorrect !== "string" || task.feedbackIncorrect.trim() === "") throw new Error(`${taskWhere}: missing feedbackIncorrect`);

    if (typeof task.remediation !== "string" || !/^module-0[1-9]\.md#unit-[a-z0-9-]+$/.test(task.remediation)) {
      throw new Error(`${taskWhere}: remediation must be a module anchor of the form module-NN.md#unit-slug`);
    }
    if (!allowedAnchors.has(task.remediation)) {
      throw new Error(`${taskWhere}: remediation ${task.remediation} does not match any unit this scenario assesses`);
    }

    if (task.type === "selection") {
      if (!Array.isArray(task.choices) || task.choices.length < 3) throw new Error(`${taskWhere}: a selection task needs at least three choices`);
      for (const choice of task.choices) {
        if (typeof choice !== "string" || choice.trim() === "") throw new Error(`${taskWhere}: every choice must be a non-empty string`);
      }
      if (new Set(task.choices).size !== task.choices.length) throw new Error(`${taskWhere}: repeats a choice`);
      if (task.correctChoice !== 0) throw new Error(`${taskWhere}: the correct answer must be authored FIRST (correctChoice 0); the engine permutes at serve time`);
      if ("expected" in task || "tolerance" in task || "rubric" in task) throw new Error(`${taskWhere}: a selection task carries no expected value, tolerance or rubric`);
    } else if (task.type === "computation") {
      if (typeof task.expected !== "number" || !Number.isFinite(task.expected)) throw new Error(`${taskWhere}: a computation task needs a finite expected value`);
      if (typeof task.tolerance !== "number" || !Number.isFinite(task.tolerance) || task.tolerance < 0) throw new Error(`${taskWhere}: a computation task needs a non-negative numeric tolerance`);
      if ("choices" in task || "correctChoice" in task || "rubric" in task) throw new Error(`${taskWhere}: a computation task carries no choices or rubric`);
    } else {
      if (!Array.isArray(task.rubric) || task.rubric.length === 0) throw new Error(`${taskWhere}: a short-answer task needs a rubric of checkable elements`);
      for (const criterion of task.rubric) {
        if (typeof criterion !== "string" || criterion.trim() === "") throw new Error(`${taskWhere}: every rubric criterion must be a non-empty string`);
      }
      if (new Set(task.rubric).size !== task.rubric.length) throw new Error(`${taskWhere}: repeats a rubric criterion`);
      if ("choices" in task || "correctChoice" in task || "expected" in task || "tolerance" in task) {
        throw new Error(`${taskWhere}: a short-answer task carries no choices, expected value or tolerance`);
      }
    }

    assertNoLengthRequirement(taskWhere, task);

    return Object.freeze({
      ...task,
      choices: task.choices ? Object.freeze([...task.choices]) : undefined,
      rubric: task.rubric ? Object.freeze([...task.rubric]) : undefined,
    });
  });

  /* passing score */
  if (typeof spec.passingScore !== "number" || !Number.isFinite(spec.passingScore) || spec.passingScore <= 0 || spec.passingScore > 1) {
    throw new Error(`${where}: passingScore must be a fraction of total points greater than 0 and no greater than 1`);
  }

  /* instructor review */
  const review = spec.instructorReview;
  if (!review || typeof review !== "object" || typeof review.required !== "boolean" || typeof review.reason !== "string" || review.reason.trim() === "") {
    throw new Error(`${where}: instructorReview must state required (boolean) and a reason`);
  }
  const hasShortAnswer = tasks.some((task) => task.type === "short-answer");
  if (hasShortAnswer && review.required !== true) {
    throw new Error(`${where}: a scenario with a short-answer task must require instructor review — § 535.65(g)(2)(D) puts the answers and rationale on a qualified instructor`);
  }

  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);

  return Object.freeze({
    id,
    title: spec.title,
    placement: Object.freeze({ afterTopic: placement.afterTopic, unlockRequires: Object.freeze([...placement.unlockRequires]) }),
    assessesTopics: Object.freeze([...spec.assessesTopics]),
    assessesUnits: Object.freeze([...spec.assessesUnits]),
    context: spec.context,
    facts: Object.freeze([...spec.facts]),
    tasks: Object.freeze(tasks),
    totalPoints,
    pointsToPass: Math.ceil(totalPoints * spec.passingScore * 100) / 100,
    passingScore: spec.passingScore,
    instructorReview: Object.freeze({ required: review.required, reason: review.reason }),
  });
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 1 — after T02 (Real Estate Financing Principles) and T03 (Real Estate Appraisal)
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC1 = scenario("PRINS2-SC1", {
  title: "Valuing a Kyle homestead and testing a proposed home equity loan",
  placement: { afterTopic: "T03", unlockRequires: ["T02", "T03"] },
  assessesTopics: ["T02", "T03"],
  assessesUnits: ["T02U4", "T02U6", "T03U5", "T03U6"],
  context:
    "You are a Texas sales agent sponsored by a Hays County broker. Delia Ortega has owned and lived in a house on Barton Hollow Drive in Kyle since she bought it in 2016. She wants to borrow against the equity to fund a business expansion, and she has applied to a local credit union for a home equity loan under article XVI, section 50(a)(6) of the Texas Constitution.\n\n" +
    "Delia has asked you for two things before she spends money on the lender's appraisal fee. First, a written price opinion — a comparative market analysis — so she can see whether the loan is likely to produce enough cash to be worth pursuing. Second, a plain reading of the closing package the credit union has emailed her, which she says she does not understand.\n\n" +
    "You have a verified set of three closed sales from Delia's own subdivision and school attendance zone, and you have the credit union's quoted closing charges. The credit union has separately engaged a Texas certified residential appraiser, whose report is the value figure the loan documents will use. Every dollar figure in this exercise is illustrative and invented to make the arithmetic visible; no Texas statute or constitutional provision sets a rent, a price, a fee, or an interest rate.",
  facts: [
    "SUBJECT PROPERTY: built 2009; 2,240 square feet of gross living area; four bedrooms; two baths; two-car garage; no pool; interior lot. Delia occupies it as her homestead and has never taken a section 50(a)(6) extension of credit on it.",
    "RECORDED ENCUMBRANCES ON THE HOMESTEAD: a purchase-money first-lien note with a current principal balance of $291,500, and a 2023 home-improvement lien for a roof-and-siding contract with a current balance of $18,000. There are no other liens of record.",
    "COMPARABLE A: closed sale price $438,000; sold 2 months ago; 2,180 square feet; four bedrooms; two-car garage; no pool.",
    "COMPARABLE B: closed sale price $455,000; sold 4 months ago; 2,120 square feet; four bedrooms; three-car garage; no pool.",
    "COMPARABLE C: closed sale price $479,000; sold 1 month ago; 2,410 square feet; five bedrooms; two-car garage; pool.",
    "ADJUSTMENT AMOUNTS, all illustrative and derived from paired sales in this subdivision: gross living area at $80 per square foot; each garage bay $6,000; each additional bedroom $7,500; pool $21,000; market conditions 0.3 percent of the comparable's sale price per month since sale, in a rising market.",
    "THE CREDIT UNION'S APPRAISAL: a Texas certified residential appraiser reports a fair market value of $460,000, and that is the figure the loan documents will use as the fair market value of the homestead on the date the extension of credit is made.",
    "THE CREDIT UNION'S QUOTED CLOSING CHARGES, all illustrative: loan origination fee $700; loan processing fee $180; document preparation fee $250; recording fee $95; appraisal performed by a third-party appraiser $600; property survey performed by a Texas licensed surveyor $525; state base premium for a mortgagee policy of title insurance with endorsements $1,430.",
    "AN ALTERNATIVE OFFER: the credit union has also floated a graduated-payment structure on the same principal at an annual interest rate of 7.2 percent, payable monthly, with a first-year scheduled payment of $330 per month.",
    "TIMING AND PLACE: Delia submitted her loan application on a Monday and received the lender's section 50(g) notice the same day. She wants to sign on the eighth day after that Monday, at your brokerage office, because it is closer to her work than the title company.",
  ],
  tasks: [
    {
      id: "SC1-T1",
      type: "computation",
      prompt:
        "Adjust Comparable B to the subject using the stated adjustment amounts. Adjust the comparable, not the subject: where the comparable is superior, subtract; where it is inferior, add. Apply the market-conditions adjustment to Comparable B's own sale price. What is Comparable B's adjusted sale price, in dollars?",
      expected: 464060,
      tolerance: 1,
      points: 4,
      feedbackCorrect:
        "$464,060. Gross living area: the subject has 2,240 square feet against the comparable's 2,120, so the comparable is inferior by 120 square feet — add 120 x $80 = +$9,600. Garage: the comparable has three bays to the subject's two, so it is superior — subtract $6,000. Bedrooms and pool are identical, so $0 each. Market conditions: 4 months x 0.3% = 1.2%; 0.012 x $455,000 = +$5,460. Net adjustment $9,600 - $6,000 + $5,460 = +$9,060, and $455,000 + $9,060 = $464,060.",
      feedbackIncorrect:
        "Two errors produce most wrong answers here. The first is adjusting the subject instead of the comparable: the subject is the unknown, so every adjustment is made to the comparable's sale price to answer what that comparable would have sold for if it had been the subject. The second is taking the market-conditions percentage on the subject's indicated value rather than on the comparable's own sale price. Rebuild the line items one at a time — GLA, garage, bedrooms, pool, then market conditions — and re-add. Review module-03.md, Unit: Three Approaches to Value, the sales comparison grid.",
      remediation: "module-03.md#unit-three-approaches-to-value",
    },
    {
      id: "SC1-T2",
      type: "selection",
      prompt:
        "Adjusted for the same items, Comparable A comes to $445,428 and Comparable C to $438,337, so your three adjusted indications run from $438,337 to $464,060 against unadjusted sales of $438,000, $455,000 and $479,000. Another agent tells Delia to drop Comparable C — the only one of the three superior to the subject — and to add two active listings priced at $492,000 and $505,000, because \"a stronger number gets her a bigger loan.\" What should you do with the comparable set?",
      choices: [
        "Keep Comparable C and do not add the active listings. Comparable C is the only sale in the set superior to the subject, and dropping it would leave every comparable inferior, every adjustment positive, and the conclusion above every sale in the set — extrapolation rather than a conclusion bracketed by sales the market actually made. An active listing is evidence of what one seller hopes for, not of what a buyer paid.",
        "Replace Comparable C with the two active listings. Active listings are the better evidence because they describe the market as it stands today, while closed sales describe a market that has already moved on.",
        "Keep all three closed sales but report the simple average of the three adjusted indications. Averaging is the reconciliation step, and it removes any need to weight the comparables or to bracket the subject.",
        "Report Comparable A alone, because it required the smallest net adjustment. A single closely matched sale is a bracketed conclusion by itself, and reporting one number avoids confusing the client with a range.",
      ],
      correctChoice: 0,
      points: 3,
      feedbackCorrect:
        "Bracketing is the quality check the sales comparison approach lives on: the comparable set should contain at least one property superior to the subject and at least one inferior, so the conclusion falls inside a range the market has already demonstrated. A set in which every adjustment is positive is the classic structure of an overpriced opinion. And an active listing proves only what a seller is asking.",
      feedbackIncorrect:
        "Work back from what each option does to the range. Dropping the only superior sale and adding two unsold listings pushes the conclusion above every price anyone has actually paid — that is extrapolation, and it is the structure that produces an unsupported opinion. Reconciliation is a weighing of indications by their reliability, not an average; and one comparable, however close, cannot bracket anything. Review module-03.md, Unit: Pricing a Property, on bracketing, reconciling to a supported range, and why active listings are context rather than evidence of value.",
      remediation: "module-03.md#unit-pricing-a-property",
    },
    {
      id: "SC1-T3",
      type: "computation",
      prompt:
        "Using the credit union's appraised fair market value and the recorded encumbrances stated in the facts, apply the test in article XVI, section 50(a)(6)(B) of the Texas Constitution. What is the largest principal amount, in dollars, that the new home equity extension of credit could carry and still satisfy that paragraph?",
      expected: 58500,
      tolerance: 1,
      points: 4,
      feedbackCorrect:
        "$58,500. Section 50(a)(6)(B) tests the new principal amount \"when added to the aggregate total of the outstanding principal balances of all other indebtedness secured by valid encumbrances of record against the homestead\" against 80 percent of fair market value on the date the credit is extended. Eighty percent of $460,000 is $368,000. The other recorded indebtedness totals $291,500 + $18,000 = $309,500. $368,000 - $309,500 = $58,500.",
      feedbackIncorrect:
        "The paragraph is routinely misread as an 80 percent limit on the new loan by itself. It is not. The ceiling is 80 percent of fair market value for the new principal PLUS every other outstanding balance secured by a valid encumbrance of record — here both the purchase-money first lien and the 2023 home-improvement lien. Take 80 percent of value first, then subtract the recorded balances; whatever is left is the room the Constitution leaves. Review module-02.md, Unit: Texas Loan Programs, on section 50(a)(6)(B).",
      remediation: "module-02.md#unit-texas-loan-programs",
    },
    {
      id: "SC1-T4",
      type: "computation",
      prompt:
        "Assume the credit union writes the loan at exactly the principal you computed in the previous task. Applying article XVI, section 50(a)(6)(E), what is the maximum aggregate amount, in dollars, of the fees to which that paragraph's cap applies?",
      expected: 1170,
      tolerance: 0.01,
      points: 3,
      feedbackCorrect:
        "$1,170. Section 50(a)(6)(E) forbids requiring the owner to pay fees \"necessary to originate, evaluate, maintain, record, insure, or service the extension of credit that exceed, in the aggregate, two percent of the original principal amount of the extension of credit.\" Two percent of $58,500 is $1,170. Note what the cap does not reach: interest, and bona fide discount points used to buy the rate down, are outside it by the paragraph's own words.",
      feedbackIncorrect:
        "The cap is a percentage of the original principal amount of the extension of credit, not of the property's value and not of the total indebtedness. Take two percent of the new loan's principal. Review module-02.md, Unit: Texas Loan Programs, on section 50(a)(6)(E) and the four categories the paragraph excludes from the cap.",
      remediation: "module-02.md#unit-texas-loan-programs",
    },
    {
      id: "SC1-T5",
      type: "selection",
      prompt:
        "Now run the credit union's quoted closing charges against the cap you just computed. Which statement about that comparison is correct?",
      choices: [
        "Four charges count toward the cap — the $700 origination fee, the $180 processing fee, the $250 document preparation fee and the $95 recording fee — for an aggregate of $1,225, which exceeds the $1,170 cap by $55. The $600 third-party appraisal, the $525 survey by a Texas licensed surveyor, and the $1,430 state base premium for the mortgagee policy of title insurance with endorsements are excluded by section 50(a)(6)(E)(i), (ii) and (iii).",
        "All seven charges count, for an aggregate of $3,780, so the package exceeds the cap by $2,610; section 50(a)(6)(E) excludes nothing, and any charge collected at a home equity closing is a fee necessary to originate the credit.",
        "Only the $700 origination fee counts, so the package is comfortably inside the cap; the cap reaches origination charges alone, and processing, document preparation and recording are third-party pass-through costs.",
        "None of the charges counts, because section 50(a)(6)(E) caps only the interest rate and the discount points, and the Constitution leaves closing charges on a home equity loan to the lender's schedule.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "$700 + $180 + $250 + $95 = $1,225 against a $1,170 cap, an excess of $55. Section 50(a)(6)(E) excludes exactly four categories: a third-party appraisal, a survey by a state registered or licensed surveyor, the state base premium for a mortgagee policy of title insurance with endorsements, and a title examination report costing less than the state base premium without endorsements. Everything else necessary to originate, evaluate, maintain, record, insure or service the credit is inside the two percent.",
      feedbackIncorrect:
        "Sort the charges before you add them. The paragraph's exclusions are a closed list of four categories, and three of them appear in this package — the third-party appraisal, the licensed surveyor's survey, and the state base premium for the mortgagee title policy. What is left is what the two percent has to cover. Then compare that aggregate against the cap; do not compare the whole closing package. Note also what the cap never touches: interest, and bona fide discount points used to buy the rate down. Review module-02.md, Unit: Texas Loan Programs.",
      remediation: "module-02.md#unit-texas-loan-programs",
    },
    {
      id: "SC1-T6",
      type: "computation",
      prompt:
        "Consider the credit union's alternative graduated-payment structure: the same principal you computed in task SC1-T3, an annual interest rate of 7.2 percent payable monthly, and a first-year scheduled payment of $330 per month. By how many dollars does the first scheduled payment fall short of the interest that accrues in the first month?",
      expected: 21,
      tolerance: 0.01,
      points: 3,
      feedbackCorrect:
        "$21.00. The periodic rate is 0.072 / 12 = 0.006. Interest accrued in month one is $58,500 x 0.006 = $351.00. The scheduled payment is $330.00, so $351.00 - $330.00 = $21.00 of accrued interest goes unpaid and is added to principal — negative amortization, on a payment made in full and on time. That matters constitutionally as well as economically: section 50(a)(6)(L) requires a home equity loan to be repaid in substantially equal successive periodic installments \"each of which equals or exceeds the amount of accrued interest as of the date of the scheduled installment,\" so a payment below accrued interest fails a condition, not merely a preference.",
      feedbackIncorrect:
        "Convert the annual rate to a periodic rate before you do anything else: 7.2 percent per year payable monthly is 0.072 / 12 = 0.006 per month. Multiply that by the outstanding principal to get the interest accrued in the first month, then subtract the scheduled payment. If the payment is the smaller number, the difference is added to principal and the debt grows. Review module-02.md, Unit: Payment Plans, on negative amortization, and note the constitutional consequence in module-02.md, Unit: Texas Loan Programs, at section 50(a)(6)(L).",
      remediation: "module-02.md#unit-payment-plans",
    },
    {
      id: "SC1-T7",
      type: "short-answer",
      prompt:
        "Delia asks you two questions: \"Can I sign on the eighth day, at your office, since I already have the notice?\" and \"With those two liens on the house, is this loan going to be valid?\" Set out what you tell her about the timing and the place of closing, and how you handle the validity question.",
      rubric: [
        "Identifies the closing-timing rule in article XVI, section 50(a)(6)(M)(i) — the credit may not be closed before the 12th day after the later of the date the owner submits the loan application or the date the lender provides the owner a copy of the section 50(g) notice — and applies it to conclude that the eighth day is too early on these facts.",
        "Identifies the place-of-closing rule in article XVI, section 50(a)(6)(N) — the credit must be closed only at the office of the lender, an attorney at law, or a title company — and states that a brokerage office is not one of the three.",
        "Identifies at least one further condition bearing on these facts, such as the section 50(a)(6)(B) 80 percent test measured against the new principal plus all other indebtedness secured by valid encumbrances of record, or the section 50(a)(6)(M)(ii) requirement that the credit be closed not before one business day after the owner receives a copy of the loan application, if not previously provided, and a final itemized disclosure of the actual fees, points, interest, costs and charges that will be charged at closing.",
        "Does not answer the validity question, and instead refers whether this particular loan satisfies every condition of section 50(a)(6) to the lender's counsel, the closing attorney, or the title company.",
        "States the position honestly rather than reassuring the client — that the license holder can point out what the provision requires but cannot opine on the legal sufficiency of the loan documents.",
      ],
      points: 5,
      feedbackCorrect:
        "That is the whole of the license holder's job here: read the conditions accurately, apply them to the facts you have, and hand the legal conclusion to the people whose job it is. Three clocks run under section 50(a)(6)(M) — twelve days from the later of application or the section 50(g) notice; one business day from the loan application copy and the final itemized disclosure of actual fees, points, interest, costs and charges; and one year from the closing of any prior section 50(a)(6) loan on the same homestead — and section 50(a)(6)(N) fixes the place at the office of the lender, an attorney at law, or a title company, and nowhere else.",
      feedbackIncorrect:
        "Two things have to be in your answer and one thing has to be out of it. In: the twelve-day clock in section 50(a)(6)(M)(i), which runs from the LATER of the application and the section 50(g) notice, and the three permitted closing locations in section 50(a)(6)(N). Out: any conclusion about whether the loan will be valid. That is a legal question about the sufficiency of instruments, and it belongs to the lender's counsel or the title company. Review module-02.md, Unit: Texas Loan Programs, on the section 50(a)(6) conditions.",
      remediation: "module-02.md#unit-texas-loan-programs",
    },
  ],
  passingScore: 0.7,
  instructorReview: {
    required: true,
    reason:
      "Task SC1-T7 is graded against a rubric of identified provisions, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. The instructor also reviews any computation answered within tolerance but by visibly wrong method, so that the § 535.62(b)(7) rationale requirement is met in substance.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 2 — after T04 (Leases) and T05 (Control of Land Use)
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC2 = scenario("PRINS2-SC2", {
  title: "A fourplex, a retail suite, and two systems of land-use control",
  placement: { afterTopic: "T05", unlockRequires: ["T04", "T05"] },
  assessesTopics: ["T04", "T05"],
  assessesUnits: ["T04U3", "T04U4", "T04U5", "T05U1"],
  context:
    "You are a Texas sales agent sponsored by a broker whose firm handles leasing for small owners. Your client, Ruben Ortiz, owns two adjoining properties on Arroyo Street inside a Texas home-rule municipality: a four-unit residential building and a vacant 1,900-square-foot retail suite. Both lots sit inside the recorded Arroyo Heights subdivision, whose declaration was filed in the county real property records in 1998 and has been amended twice since.\n\n" +
    "Three things have landed on your desk in the same week. A tenant in the fourplex has a sewage problem and a water shutoff that your client ordered. The retail suite has two competing lease structures on the table. And the city has posted a hearing on rezoning the block.\n\n" +
    "Every dollar figure below is illustrative and invented for teaching. No Texas statute sets rents, base rents, operating costs, or damages amounts other than the statutory figures identified as such.",
  facts: [
    "THE FOURPLEX, UNIT 3: a written twelve-month residential lease at $1,275 per month, due the first. The tenant, Nadia Brooks, was current in rent at all times in March. She pays the municipal water bill directly to the city.",
    "MARCH 4: raw sewage backs up inside Unit 3. Nadia sends written notice to the address where rent is normally paid, by certified mail, return receipt requested; delivery is confirmed March 5. Neither Ruben nor your firm dispatches anyone.",
    "MARCH 9: on Ruben's instruction — \"shut her water off until she stops complaining\" — a maintenance technician closes the water cutoff serving Unit 3. The water stays off for six days. The interruption does not result from bona fide repairs, construction, or an emergency.",
    "MARCH 14: Nadia hires an independent plumbing company, which clears the line and replaces a collapsed section. The bill is $1,540. She pays it and delivers the bill and the receipt to Ruben with her rent balance.",
    "LATER: Nadia sues. The court finds her actual damages from the water interruption to be $640 and finds that she is $425 delinquent in rent as of trial.",
    "RUBEN'S FORM LEASE contains a printed paragraph, in the same type size and weight as the rest of the lease and not underlined, providing that the tenant \"shall pay for all repairs of every kind, including plumbing stoppages of any cause, and waives all remedies under Property Code chapter 92.\"",
    "THE RETAIL SUITE, OPTION 1 — a gross lease at $3,400 per month for twelve months, with Ruben paying the year's property taxes of $8,100, insurance of $2,300, and common area maintenance of $3,600.",
    "THE RETAIL SUITE, OPTION 2 — a triple net lease at a base rent of $2,450 per month for twelve months, with the tenant paying those same three items directly.",
    "THE RETAIL SUITE, A PROSPECT: a tenant wants to operate a taproom open until 1:00 a.m. The zoning district permits the use. The Arroyo Heights declaration limits every lot in the subdivision to \"retail uses closing not later than 9:00 p.m.\"",
    "THE HEARING: the municipality has posted a hearing on rezoning the Arroyo Street block from a multifamily district to a single-family district. The fourplex was built and occupied long before the proposal.",
  ],
  tasks: [
    {
      id: "SC2-T1",
      type: "computation",
      prompt:
        "Property Code § 92.008(f) tells a tenant whose utility service was unlawfully interrupted what she may recover: \"actual damages, one month's rent plus $1,000, reasonable attorney's fees, and court costs, less any delinquent rents.\" Using the court's findings, compute the amount Nadia recovers under that subsection, in dollars, excluding attorney's fees and court costs.",
      expected: 2490,
      tolerance: 0.01,
      points: 4,
      feedbackCorrect:
        "$2,490. Actual damages $640, plus one month's rent $1,275, plus $1,000 = $2,915; less delinquent rents of $425 = $2,490, before the attorney's fees and court costs the subsection separately awards. Note the structure of the remedy: the statutory component ($1,275 + $1,000) is fixed by the lease rent and the statute and does not depend on proving loss at all, and the tenant may also either recover possession or terminate the lease under the same subsection. Any waiver of it is void.",
      feedbackIncorrect:
        "Build the figure in the order the subsection lists it. Start with actual damages as found; add one month's rent under the lease; add the flat $1,000; then subtract delinquent rents. The most common errors are treating \"one month's rent plus $1,000\" as an alternative to actual damages rather than an addition to them, and subtracting the delinquency from the actual damages alone rather than from the total. Review module-04.md, Unit: Texas Landlord & Tenant Statutes, on §§ 92.008 and 92.0081.",
      remediation: "module-04.md#unit-texas-landlord--tenant-statutes",
    },
    {
      id: "SC2-T2",
      type: "selection",
      prompt:
        "Nadia now wants to deduct the plumber's $1,540 from her next rent payment. Ruben says she cannot deduct anything because he never authorized the repair. Which analysis is correct?",
      choices: [
        "She may deduct, but not the whole bill. Raw sewage backing up inside the dwelling is one of the conditions listed in § 92.0561(d)(3), and § 92.0561(e) sets no waiting period for sewage or flooding; the work was done by an independent company as § 92.0561 requires, and the bill and receipt went to the landlord with the rent balance. Section 92.0561(b) caps the deduction at one month's rent under the lease or $500, whichever is greater — here $1,275 — so $265 of the bill falls outside the deduction.",
        "She may deduct the entire $1,540. The § 92.0561(b) cap applies only where the tenant performs the work personally; a bill from an independent contractor is a landlord expense in full.",
        "She may deduct $500 and no more. Section 92.0561(b) caps the deduction at one month's rent or $500, whichever is less, and the tenant bears the balance.",
        "She may deduct nothing. Repair and deduct is available only after a court has ordered the repair, and in any event only where a local official has certified in writing that the condition materially affects health or safety.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Three separate requirements had to line up and did: a listed condition, the waiting period for that condition, and an independent repairer with the paperwork delivered to the landlord. Then the cap applies. Read § 92.0561(b) carefully — one month's rent OR $500, WHICHEVER IS GREATER — because the wrong reading is the single most common error on this section, and on a $1,275 rent it costs the tenant $775.",
      feedbackIncorrect:
        "Take the section in order. First, is the condition on the § 92.0561(d)(3) list — sewage or flooding inside the dwelling, a total cessation of potable water, inadequate heat or cooling, or a condition a local official has certified? Second, what waiting period does § 92.0561(e) attach to that condition? Sewage and flooding carry none. Third, was the repair made by an independent company, contractor or repairman, with the bill and receipt going to the landlord? Only then apply the § 92.0561(b) cap, which is the GREATER of one month's rent or $500. The written certification by a local official is a route to the remedy for other conditions, not a precondition for all of them. Review module-04.md, Unit: Texas Landlord & Tenant Statutes.",
      remediation: "module-04.md#unit-texas-landlord--tenant-statutes",
    },
    {
      id: "SC2-T3",
      type: "selection",
      prompt:
        "Ruben points to the printed paragraph in his form lease and says it settles both the plumbing bill and the chapter 92 claims. Evaluate the paragraph.",
      choices: [
        "It does neither. Section 92.006(a) makes the landlord duties and tenant remedies concerning security deposits, security devices, disclosure of ownership and management, and utility cutoffs non-waivable, and § 92.006(c) makes subchapter B's duties and remedies unwaivable except as subsections (d), (e) and (f) allow. Section 92.006(f) permits shifting repair cost only for wastewater stoppages caused by foreign or improper objects in lines exclusively serving the dwelling, damage to doors, windows or screens, and damage from windows or doors left open — and only where the § 92.006(e)(4) formalities are met: a written lease, the agreement underlined or in boldface in the lease or in a separate written addendum, specific and clear, and made knowingly, voluntarily and for consideration. A paragraph in ordinary type shifting \"all repairs of every kind\" satisfies none of that.",
        "It is fully effective. Chapter 92 supplies defaults only, and a signed written lease may allocate repair cost and remedies however the parties agree.",
        "It is effective as to the stoppage but not as to the waiver of remedies, because § 92.006(f) permits cost-shifting for any wastewater stoppage regardless of its cause or of how the agreement is formatted.",
        "It is void, and its invalidity makes the entire lease unenforceable, so Nadia holds over at sufferance and owes no rent from the date of the backup.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Formatting is substantive in Texas residential leasing. The narrow cost-shifting § 92.006(f) allows is available only on the statute's own terms — a closed list of three damage categories, a stoppage caused by foreign or improper objects in lines exclusively serving the dwelling, and an agreement that is underlined or in boldface, specific and clear, and made knowingly, voluntarily and for consideration. A blanket clause in ordinary type is not a partial win; it fails the gateway.",
      feedbackIncorrect:
        "Ask two questions of any clause like this. First, does chapter 92 permit this duty or remedy to be bargained away at all? Section 92.006(a) answers no for security deposits, security devices, ownership-and-management disclosure and utility cutoffs, and § 92.006(c) makes subchapter B unwaivable except as (d) through (f) allow. Second, if a narrow permission exists, were its formalities met? Section 92.006(f) reaches only three damage categories and one kind of stoppage, and § 92.006(e)(4) requires the agreement to be underlined or in boldface, specific and clear, and made knowingly, voluntarily and for consideration. Note also that an ineffective clause is ineffective as to the covered duties; it does not destroy the lease. Review module-04.md, Unit: Common Lease Provisions.",
      remediation: "module-04.md#unit-common-lease-provisions",
    },
    {
      id: "SC2-T4",
      type: "computation",
      prompt:
        "Compare the two structures on the retail suite over a full twelve months, using only the figures stated. By how many dollars does Ruben's annual net under the triple net lease (Option 2) exceed his annual net under the gross lease (Option 1)?",
      expected: 2600,
      tolerance: 0.01,
      points: 4,
      feedbackCorrect:
        "$2,600. Option 1: $3,400 x 12 = $40,800 of rent, less the three carrying costs Ruben pays — $8,100 + $2,300 + $3,600 = $14,000 — for a net of $26,800. Option 2: $2,450 x 12 = $29,400, with the tenant paying the three items directly, so the net is $29,400. $29,400 - $26,800 = $2,600. Notice what else changed with the money: under Option 2 Ruben has also shed the risk that taxes, insurance or common area maintenance rise mid-term, which is precisely why a landlord can command a lower base rent on a net structure.",
      feedbackIncorrect:
        "Annualize each rent first, then subtract from the gross figure only the costs the landlord actually pays under that structure. Under the triple net option the tenant pays taxes, insurance and common area maintenance directly, so none of them is subtracted from the landlord's rent. Subtracting them from both options, or from neither, is the usual slip. Review module-04.md, Unit: Types of Leases, on gross, net and percentage structures — and remember that these labels are market vocabulary, not statutory definitions, so the expense clauses in the document control.",
      remediation: "module-04.md#unit-types-of-leases",
    },
    {
      id: "SC2-T5",
      type: "selection",
      prompt:
        "The city adopts the rezoning and the Arroyo Street block becomes a single-family district. Ruben calls in a panic: does he have to empty the fourplex? Which statement is correct?",
      choices: [
        "No, not on the ordinance alone. Under Local Government Code § 211.019(b) a person using property in a manner considered a nonconforming use as a result of the adoption of or change to a zoning regulation may continue to use the property in the same manner unless required by the municipality to stop; if the municipality does require the use to stop, § 211.019(d) gives the owner or lessee a choice between a municipal payment of the costs directly attributable to ceasing the use plus the diminution in market value, and continued nonconforming use until that amount is recovered through continued business activity. Section 211.019(o) removes the protection for a use intentionally abandoned for at least six months. Separately, § 211.006(a-1) requires targeted written notice to each owner and occupant, not later than the 10th day before the hearing, where a proposed change would turn a conforming use into a nonconforming one.",
        "Yes, on the effective date of the ordinance. Chapter 211's nonconforming-use protection runs to structures rather than to uses, so the building may remain but the four-unit use must cease; the owner's only route to continue is a variance from the board of adjustment.",
        "No, and the protection is permanent. Section 211.019(b) grandfathers an existing use for as long as the building stands, and a Texas municipality has no power to require an existing lawful use to stop.",
        "The rezoning cannot reach this block at all. Section 211.005(b) requires zoning regulations to be uniform for each class or kind of building in a district, and a fourplex is not the same class as a single-family house, so the block cannot be placed in a single-family district while the fourplex stands.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "\"Grandfathering\" in Texas means continuation as of right, not immunity forever, and the statute says both halves out loud: continue \"unless required by a municipality to stop,\" and then a compensation-or-continuation choice under § 211.019(d) if the municipality does require it. The six-month intentional-abandonment rule in § 211.019(o) is the trap for an owner who takes a building offline while deciding what to do with it.",
      feedbackIncorrect:
        "Read § 211.019(b) to its last clause. The right to continue is real but conditional — \"unless required by a municipality to stop\" — and § 211.019(d) then supplies what happens next, which is a choice between a payment and continued use until the amount is recovered. Section 211.019(o) is the other half of the answer: intentional abandonment for at least six months ends the protection. And note § 211.006(a-1), which entitles this owner and his occupants to targeted written notice before the hearing precisely because the change would make a conforming use nonconforming. Review module-05.md, Unit: Land-Use Controls.",
      remediation: "module-05.md#unit-land-use-controls",
    },
    {
      id: "SC2-T6",
      type: "short-answer",
      prompt:
        "Ruben forwards the taproom prospect's letter of intent and writes: \"The zoning allows it, so the subdivision covenant is dead — confirm that for me in writing and I'll sign.\" Set out what you tell him, and identify anything in his request you must decline.",
      rubric: [
        "States that public zoning and the recorded private restriction are independent controls, enforced by different parties out of different records, so that the stricter of the two governs what the owner may actually do with the lot — a permitted use under the ordinance is not permission under the declaration.",
        "Identifies where each control is found: the ordinance, district map and plat at the municipality, and the declaration and its amendments in the county real property records.",
        "Identifies that under Property Code § 202.006(b) a dedicatory instrument has no effect until it is filed in the real property records of each county in which the property is located, and that the Arroyo Heights declaration was so filed.",
        "Identifies at least one consequence of enforcement of a restrictive covenant — for example the civil damages a court may assess under Property Code § 202.004(c) of up to $200 for each day of the violation, or the reasonable attorney's fees Property Code § 5.006(a) requires be allowed to a prevailing party who asserted the action, or that under § 202.004(a) an association's exercise of discretionary authority is presumed reasonable unless shown to be arbitrary, capricious or discriminatory.",
        "Declines to confirm that the covenant is unenforceable, and instead refers the question whether this covenant binds this lot and this proposed use to the client's attorney rather than answering it.",
      ],
      points: 5,
      feedbackCorrect:
        "Two searches, two places, every time. The client's premise — that the ordinance overrides the covenant — is exactly backwards about how the two systems relate: neither overrides the other, each is independently enforceable by its own enforcer, and the owner's actual freedom is the narrower of the two. Confirming in writing that a recorded covenant is \"dead\" would be an opinion on the legal effect of an instrument, which is not yours to give.",
      feedbackIncorrect:
        "Your answer needs three moves. Name both control systems and where each lives — city hall for the ordinance and the plat, the county real property records for the declaration. Say what happens when they differ: the stricter governs, because each is enforced by a different party under a different body of law. And stop at the line: whether this particular covenant is enforceable against this lot and this use is a legal question for the client's attorney, and putting the opposite in writing for a client is exactly the sentence that ends up in a lawsuit. Review module-05.md, Unit: Land-Use Controls, on private restrictions, Property Code §§ 202.004 and 202.006(b), and the two-search practice rule.",
      remediation: "module-05.md#unit-land-use-controls",
    },
  ],
  passingScore: 0.7,
  instructorReview: {
    required: true,
    reason:
      "Task SC2-T6 is graded against a rubric of identified provisions and a required refusal, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. The instructor also confirms that a passing student actually declined the legal opinion rather than merely describing the two control systems.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 3 — after T06 (Texas Real Estate License Act) and T07 (Brokerage and Law of Agency)
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC3 = scenario("PRINS2-SC3", {
  title: "An open house, a permit that was never issued, and a DTPA demand letter",
  placement: { afterTopic: "T07", unlockRequires: ["T06", "T07"] },
  assessesTopics: ["T06", "T07"],
  assessesUnits: ["T06U5", "T07U2", "T07U5"],
  context:
    "Priya Anand is a Texas sales agent sponsored by Kestrel Realty in Fort Worth. On a Saturday she covers an open house at a listing held by a different brokerage. She is not a member of the listing broker's office and she does not represent the seller; she is there as a showing agent under an arrangement with the listing brokerage.\n\n" +
    "A married couple, the Okafors, walk in. They already have a written representation agreement with a third brokerage, and their own agent is out of town. They want to see the house today. Everything in this exercise happens after January 1, 2026.\n\n" +
    "What Priya says during the walk-through, what she signs before it, and what she does when a demand letter arrives four months later are three separate problems, and the statutes that answer them are three different statutes. Dollar figures are illustrative.",
  facts: [
    "Priya holds an active Texas sales agent license and is sponsored by a licensed broker at all relevant times.",
    "Priya does not represent the seller, has not agreed to represent the Okafors, and is not otherwise acting as their agent when they arrive.",
    "The Okafors hold a written representation agreement with a third brokerage. Their agent is unreachable that day.",
    "Two weeks before the open house, the listing broker emailed the cooperating agents that the previous owner enclosed the rear patio without a permit and that the city has an open code-enforcement file on the enclosure. Priya read the email.",
    "During the walk-through, Mr. Okafor asks about the enclosed patio. Priya answers: \"That was permitted and inspected — the city signed off on it.\"",
    "The Okafors buy the house. Four months later the city requires the enclosure to be brought into compliance, and the Okafors spend $24,500 doing it. They testify to sleeplessness and distress.",
    "In the eventual suit the trier of fact finds economic damages of $24,500, finds damages for mental anguish of $6,000, and finds that the conduct was committed knowingly. All three figures are illustrative.",
    "Before filing, the Okafors' attorney sends Priya and Kestrel Realty a written notice describing the complaint in reasonable detail and stating the amounts claimed.",
    "Separately, after the contract was signed, the Okafors emailed Priya the title commitment and a special provision the seller's lawyer had drafted about a fence encroachment, asking whether the Schedule B exceptions are \"a problem,\" whether the special provision is enforceable, and whether Priya can \"just write us a paragraph fixing it.\"",
  ],
  tasks: [
    {
      id: "SC3-T1",
      type: "selection",
      prompt:
        "The Okafors are standing in the entry and want to walk through now. What must Priya do before she shows them the house?",
      choices: [
        "Provide the written notice required by Occupations Code § 1101.558(b-1) — the Information About Brokerage Services notice — and enter into a written agreement with the Okafors as described by § 1101.563(c). Both are required before the showing, and both are required even though the Okafors already have a written representation agreement with another broker, because Priya is not a member of the listing broker's office and does not represent the seller.",
        "Nothing beyond a friendly introduction. Section 1101.558(c)(3) excuses the written notice at a property held open for prospective buyers, and § 1101.563(b) applies only to a prospective buyer who has no representation agreement with any broker.",
        "Only the disclosure required by § 1101.558(b), made orally or in writing, because an agent hosting an open house is treated as the listing broker's representative for the duration of the open house and therefore represents the owner.",
        "Only the written agreement. The Information About Brokerage Services notice is owed at first substantive communication about specific real property, and a conversation at the property being held open cannot be that communication.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "The open-house exception in § 1101.558(c)(3) is narrower than its reputation, and after January 1, 2026 something else is required in any event: § 1101.563(b) requires a written agreement with a prospective buyer of residential real property before showing any residential real property to that buyer. A showing agent who is not in the listing broker's office and does not represent the seller owes both the notice and the agreement, and the buyer's existing agreement with another broker does not excuse either. Section 1101.652(b)(34) makes failure to enter into the § 1101.563 agreement a ground for suspension or revocation. The uncomfortable consequence is real: if the buyers will not sign, Priya cannot show the property.",
      feedbackIncorrect:
        "Separate the two obligations in § 1101.558 before you decide anything. Subsection (b) is the representation disclosure — oral or written, at first contact, owed by a license holder who represents a party. Subsection (b-1) is the written Information About Brokerage Services notice, owed at first substantive communication about specific real property. Then add the January 1, 2026 layer: § 1101.562 permits showing without representing, and § 1101.563(b) requires a written agreement before any showing of residential real property to a prospective buyer. For a hosting agent outside the listing broker's office who does not represent the seller, both the notice and the agreement come before the showing, whatever agreements the buyer has elsewhere. Review module-07.md, Unit: Agency Positions and Disclosure.",
      remediation: "module-07.md#unit-agency-positions-and-disclosure",
    },
    {
      id: "SC3-T2",
      type: "selection",
      prompt:
        "The Okafors will sign nothing that could interfere with their existing agreement, so Priya offers a showing-only agreement. Kestrel's office form is exclusive and runs ninety days. Which statement about that form is correct?",
      choices: [
        "Both terms must change. Section 1101.563(e) provides that a showing-only agreement may not be an exclusive agreement with the license holder and may not state a termination date more than fourteen days from the date it is entered into. Under § 1101.563(c) the agreement must also state the services to be provided, the termination date, whether it is exclusive or non-exclusive, that the license holder does not represent the buyer where the only brokerage act is showing property under § 1101.562, the amount or rate of compensation and how it will be determined, and a disclosure in conspicuous language that broker compensation is not set by law and is fully negotiable. Section 1101.563(d) requires a separate agreement if further brokerage acts follow.",
        "Neither term must change. Section 1101.563(e)'s limits apply to buyer representation agreements; a showing-only agreement creates no representation, so the parties may make it exclusive and may set any term they agree on.",
        "Only the exclusivity must change. The termination date is governed by § 1101.652(b)(12), which requires a definite termination date not subject to prior notice but sets no outer limit, so ninety days is unobjectionable.",
        "Only the term must change, and the agreement need not address compensation at all, because a license holder who does not represent the buyer cannot be compensated by the buyer and § 1101.651(a) forecloses the question.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Section 1101.563(e) caps the showing-only agreement twice over — non-exclusive, and no termination date more than fourteen days out — and § 1101.563(c) prescribes what has to be in it, including the compensation terms and the conspicuous statement that broker compensation is not set by law and is fully negotiable. A ninety-day exclusive showing agreement is not a stricter version of a permitted document; it is a document the section does not permit.",
      feedbackIncorrect:
        "Read § 1101.563 as three layers. Subsection (c) is the content list, and it includes compensation and the conspicuous negotiability disclosure. Subsection (d) requires a fresh agreement if the relationship grows past showing. Subsection (e) is the pair of hard limits that apply specifically to a showing-only agreement: not exclusive, and not more than fourteen days. Section 1101.652(b)(12) is a different rule about a different document, and it is expressly not the source of the fourteen-day limit. Review module-07.md, Unit: Agency Positions and Disclosure.",
      remediation: "module-07.md#unit-agency-positions-and-disclosure",
    },
    {
      id: "SC3-T3",
      type: "selection",
      prompt:
        "The Okafors' claim rests on Priya's answer about the patio enclosure. Which subdivision of Business & Commerce Code § 17.46(b) does that answer most directly implicate, and what must the consumers establish beyond the act itself under § 17.50(a)(1)?",
      choices: [
        "Section 17.46(b)(5) — representing that goods or services have characteristics, uses or benefits which they do not have. Under § 17.50(a)(1) the consumers must also show that the enumerated act was relied on by them to their detriment and was a producing cause of their economic damages.",
        "Section 17.46(b)(24) — failing to disclose known information. Under § 17.50(a)(1) the consumers must show proximate cause, and under (b)(24) silence alone suffices whether or not it was intended to induce the transaction.",
        "Section 17.46(b)(14) — misrepresenting the authority of an agent to negotiate final terms. Under § 17.50(a)(1) nothing further is required, because § 17.46(a) declares such acts unlawful without more.",
        "No subdivision applies, because § 17.46(b) opens with \"includes, but is not limited to,\" which makes the list a guide for enforcement by the consumer protection division; a private consumer proceeds under § 17.46(a) directly.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "A statement that an unpermitted enclosure was permitted and inspected is a representation about a characteristic the improvement does not have, which is why (b)(5) is the workhorse subdivision in this business. Two further points from the answer are worth fixing: § 17.46(d) closes the list for a private plaintiff even though § 17.46(b) reads as open-ended, so a private consumer must point at a numbered item; and the causal standard in § 17.50(a)(1) is producing cause, not proximate cause, coupled with detrimental reliance.",
      feedbackIncorrect:
        "Two habits fix this. First, match the conduct to the subdivision by what the conduct actually is: an affirmative statement about a characteristic the property does not have is (b)(5), not a failure to disclose under (b)(24) — and (b)(24) has elements of its own, requiring that the information was known at the time and that the failure was intended to induce the consumer into a transaction the consumer would not otherwise have entered. Second, remember that the private route adds two requirements the public route does not: detrimental reliance, and producing cause of economic damages. Review module-07.md, Unit: Texas Deceptive Trade Practices - Consumer Protection Act.",
      remediation: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    },
    {
      id: "SC3-T4",
      type: "computation",
      prompt:
        "The trier of fact finds economic damages of $24,500, damages for mental anguish of $6,000, and that the conduct was committed knowingly. Under Business & Commerce Code § 17.50(b)(1), what is the maximum total damages award, in dollars, that the trier of fact may make on those findings — leaving out attorney's fees, court costs and prejudgment interest, which § 17.50(e) excludes from the computation of additional damages?",
      expected: 104000,
      tolerance: 1,
      points: 4,
      feedbackCorrect:
        "$104,000. On a knowing finding the consumer may recover the economic damages found ($24,500), plus damages for mental anguish as found ($6,000), plus additional damages of not more than three times the amount of ECONOMIC damages (3 x $24,500 = $73,500). $24,500 + $6,000 + $73,500 = $104,000. Change the finding to \"intentionally\" and the multiplier's base changes rather than the multiplier: additional damages of not more than three times the COMBINED mental anguish and economic damages, 3 x $30,500 = $91,500, for a maximum of $122,000.",
      feedbackIncorrect:
        "Parse § 17.50(b)(1) into its two tiers before you multiply. Knowingly unlocks mental anguish damages plus additional damages of up to three times the ECONOMIC damages. Intentionally unlocks mental anguish damages plus additional damages of up to three times the COMBINED mental anguish and economic damages. The multiplier is three in both tiers; what changes is what it is applied to. And the additional damages are on top of the compensatory findings, not a substitute for them. Review module-07.md, Unit: Texas Deceptive Trade Practices - Consumer Protection Act.",
      remediation: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    },
    {
      id: "SC3-T5",
      type: "selection",
      prompt:
        "The written notice from the Okafors' attorney arrives on a Monday. Priya's broker asks what can usefully be done before suit is filed. Which statement describes the two routes the statute actually opens?",
      choices: [
        "Under § 17.5052 the recipient of a § 17.505 notice may tender an offer of settlement during the sixty days after receipt, separately stating an amount to settle the damages claim and an amount for the consumer's attorney's fees incurred to that date; if the amount tendered proves to be the same as, substantially the same as, or more than the damages the trier of fact finds, the consumer's recovery of damages and fees is capped accordingly. Separately, under § 17.506(d) a defendant who tenders the damages claimed plus the consumer's reasonably incurred expenses, including attorney's fees, within thirty days after the day the notice was received has a defense to the cause of action.",
        "The only route is a plea in abatement under § 17.505(c), which stops the sixty-day clock; neither a tender nor an offer of settlement affects what the consumer may recover.",
        "They may tender the damages claimed at any time before trial and obtain a complete defense under § 17.506(d), and they may separately obtain a defense under § 17.506(a) by producing any written information they relied on, whether or not they gave notice of that reliance before the transaction was consummated.",
        "Nothing is open to them, because § 17.42(a) makes any pre-suit resolution of a DTPA claim a waiver of the consumer's rights that is contrary to public policy and void.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "The sixty-day window is the cheapest moment the dispute will ever have, and it contains two distinct mechanisms: a § 17.5052 offer of settlement, which caps recovery if it turns out to have been good enough, and a § 17.506(d) tender within thirty days after receipt of the notice, which is a complete defense to the cause of action. Note what each requires — the offer must break out damages and fees separately, and the tender must cover the damages claimed plus reasonably incurred expenses including attorney's fees.",
      feedbackIncorrect:
        "Distinguish the three sections that live around the notice. Section 17.505 is the notice requirement itself and the plea-in-abatement machinery for a defendant who received none. Section 17.5052 is the offer of settlement during the sixty days, whose payoff is a cap on recovery. Section 17.506(d) is a complete defense, and it is on a clock of its own — thirty days after the day the notice was received, not any time before trial. Section 17.506(a)'s reliance defense is also conditional: it requires reasonable and timely written notice of the reliance given before consummation of the transaction. And § 17.42 concerns waivers of the subchapter by a consumer, not settlements. Review module-07.md, Unit: Texas Deceptive Trade Practices - Consumer Protection Act.",
      remediation: "module-07.md#unit-texas-deceptive-trade-practices---consumer-protection-act",
    },
    {
      id: "SC3-T6",
      type: "short-answer",
      prompt:
        "Set aside the DTPA claim and go back to the Okafors' email about the title commitment and the seller's special provision. Identify what Priya may do, what she may not do, and what she owes the buyers in writing.",
      rubric: [
        "Identifies that Occupations Code § 1101.654(a) requires the Commission to suspend or revoke the license of a non-attorney license holder who, for consideration or in connection with the license holder's employment, agency or fiduciary relationship, drafts an instrument, other than a form described by § 1101.155, that transfers or otherwise affects an interest in real property — so Priya may not write the requested paragraph.",
        "Identifies that § 1101.654(a) equally reaches advising a person regarding the validity or legal sufficiency of an instrument or the validity of title to real property, so Priya may not answer whether the Schedule B exceptions are a problem or whether the seller's special provision is enforceable.",
        "Identifies the protected zone in § 1101.654(b): completing a contract form for the sale, exchange, option or lease of an interest in real property, incidental to acting as a broker, is not the unauthorized practice of law where the form was adopted by the Commission for that type of transaction, or was prepared by a Texas attorney and approved by that attorney for that type of transaction, or was prepared by the property owner or by an attorney and required by the owner.",
        "Identifies the affirmative duty in § 1101.555: when an offer to purchase real estate in this state is signed, a license holder shall advise each buyer in writing that the buyer should have the abstract covering the real estate examined by an attorney chosen by the buyer, or be provided with or obtain a title insurance policy.",
        "States that the two legal questions are referred to the buyers' attorney or to the title company rather than answered, and does not supply an opinion on either.",
      ],
      points: 5,
      feedbackCorrect:
        "The line here is statutory and the discipline is mandatory — § 1101.654(a) says the Commission \"shall\" suspend or revoke, not \"may.\" What survives on the permitted side is real and useful: filling in a promulgated form, choosing among promulgated addenda, completing an owner-required attorney-prepared form. What does not survive is drafting a custom provision that changes legal rights, or telling a buyer whether a title exception or a lawyer's clause is legally sufficient. And § 1101.555 turns the referral into a documented habit rather than a one-off instinct.",
      feedbackIncorrect:
        "Your answer needs both halves of § 1101.654 and the affirmative duty that sits next to it. Subsection (a) is two prohibitions, not one: drafting an instrument that transfers or affects an interest in real property, and advising on the validity or legal sufficiency of an instrument or the validity of title. Subsection (b) is the safe harbour — a Commission-adopted form, an attorney-prepared and attorney-approved form, or an owner-required form, completed incidental to acting as a broker. And § 1101.555 requires written advice, when the offer is signed, to have the abstract examined by an attorney of the buyer's choosing or to obtain a title policy. Then say the sentence that answers the client without answering the legal question. Review module-06.md, Unit: The Purpose of Licensing Laws - What a License Holder Can and Cannot Do.",
      remediation: "module-06.md#unit-the-purpose-of-licensing-laws---what-a-license-holder-can-and-cannot-do",
    },
  ],
  passingScore: 0.7,
  instructorReview: {
    required: true,
    reason:
      "Task SC3-T6 is graded against a rubric of identified provisions and a required refusal to answer two legal questions, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because the DTPA tasks carry disciplinary and civil consequences that students routinely conflate, the instructor also reviews the feedback delivered on any incorrect selection.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 4 — after T08 (Fair Housing Laws) and T09 (Property Management)
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC4 = scenario("PRINS2-SC4", {
  title: "A community that calls itself 55-plus, and the manager who has to answer for it",
  placement: { afterTopic: "T09", unlockRequires: ["T08", "T09"] },
  assessesTopics: ["T08", "T09"],
  assessesUnits: ["T08U1", "T08U3", "T09U1", "T09U2"],
  context:
    "Del Valle Commons is a 60-unit garden-apartment community in a Texas suburb, built in 2014 and marketed since it opened as \"a 55-plus community.\" It is owned by an out-of-state limited partnership and managed by Rio Bend Property Services, a licensed Texas broker. Marcus Hale is the sponsored sales agent who runs the site.\n\n" +
    "Marcus has been turning away applicant households with a child under eighteen, telling them the community is 55-plus. He has never seen a written age policy for the property, and nobody has ever asked him for occupancy data. A resident has now made two requests connected with her disability, the spring make-ready has run over budget, and the owner's asset manager has sent an email that Marcus does not want to answer.\n\n" +
    "Every dollar figure below is illustrative and invented to make the arithmetic visible; no statute sets a rent, an expense, a management fee, or a debt service figure.",
  facts: [
    "Rio Bend Property Services holds a Texas broker license and manages Del Valle Commons under a written property management agreement paid as a percentage of collections. Marcus holds an active Texas sales agent license and is sponsored by Rio Bend's designated broker.",
    "Del Valle Commons has 60 units. Five are vacant and are held out for rent to anyone who qualifies; 55 are occupied.",
    "Of the 55 occupied units, 40 are occupied by at least one person aged 55 or older.",
    "The community has never published policies or procedures demonstrating an intent to operate for occupancy by persons 55 or older, and there is no written statement by the facility that it complies with the requirements of the housing-for-older-persons exemption.",
    "Marcus has declined four applications in the past year from households with a child under eighteen, telling each applicant that the community is 55-plus.",
    "A resident with a mobility disability has asked (a) to have grab bars installed in her bathroom, at her own expense, by her own contractor; and (b) that the community's \"no animals\" rule be waived for her assistance animal and that she be assigned the marked space nearest her door, which the community keeps as unreserved parking.",
    "OPERATING PROJECTION, all figures illustrative: 60 units at a market rent of $1,180 per unit per month; vacancy and collection loss estimated at 9 percent; management fee 7 percent of effective gross income.",
    "PROJECTED EXPENSES, all illustrative: property taxes $141,000; insurance $43,500; common-area utilities $22,800; repairs and maintenance $61,400; landscaping and pest control $16,900; on-site payroll $58,000; make-ready and turnover $29,300; administrative and marketing $13,700.",
    "ALSO ON THE OWNER'S BOOKS, all illustrative: annual debt service of $214,000, and a roof replacement completed this year at a cost of $96,000.",
    "THE MAKE-READY SHORTFALL: Marcus proposes to pay a flooring vendor's $6,400 invoice out of the account holding the residents' security deposits and to reimburse that account from May rent, and to accept the vendor's $320 volume rebate as an offset against Rio Bend's management fee without showing it on the owner's monthly statement.",
    "THE OWNER'S EMAIL: \"Stop approving households with children — we're a 55-plus property. Change the ad to read 'Quiet adult community, no children.' If you won't, we will find a manager who will.\"",
  ],
  tasks: [
    {
      id: "SC4-T1",
      type: "computation",
      prompt:
        "Apply the occupancy threshold in 42 U.S.C. § 3607(b)(2)(C)(i) to Del Valle Commons as it stands. What is the minimum number of units that must be occupied by at least one person aged 55 years of age or older for the community to satisfy that clause?",
      expected: 44,
      tolerance: 0.01,
      points: 4,
      feedbackCorrect:
        "44. Clause (i) requires that \"at least 80 percent of the occupied units are occupied by at least one person who is 55 years of age or older.\" The word \"occupied\" fixes the denominator: 55 units, not 60, because the five vacant units are excluded. Eighty percent of 55 is 44, and the community has 40 — a shortfall of four units. Note the other half of the arithmetic point: only ONE person aged 55 or older is needed in each qualifying unit, which is what separates the 55-and-over threshold standard from the \"intended for, and solely occupied by\" standard for 62-and-over in § 3607(b)(2)(B).",
      feedbackIncorrect:
        "The denominator is the trap. Clause (i) counts occupied units, and § 3607(b)(3) separately provides that unoccupied units do not break the exemption so long as they are reserved for occupancy by persons meeting the age requirements — so vacant units are out of the calculation rather than counted against the community. Take 80 percent of the occupied units. Review module-08.md, Unit: Equal Opportunity in Housing, on housing for older persons under § 3607(b).",
      remediation: "module-08.md#unit-equal-opportunity-in-housing",
    },
    {
      id: "SC4-T2",
      type: "selection",
      prompt:
        "Given the occupancy figures and the absence of any published age policy or written statement of compliance, what follows for Del Valle Commons and for Marcus personally?",
      choices: [
        "On this text the community is not housing for older persons under § 3607(b)(2)(C): it is below the 80 percent threshold in clause (i), it has not published and adhered to policies and procedures demonstrating the required intent under clause (ii), and there is nothing showing compliance with the Secretary's occupancy-verification rules under clause (iii) — so every familial-status exclusion it has made is unprotected. The personal shelter in § 3607(b)(5)(A) is unavailable to Marcus, because § 3607(b)(5)(B) permits good-faith reliance to be shown only by no actual knowledge that the community is not or will not be eligible AND a formal written statement by the community that it complies.",
        "The community qualifies. Section 3607(b)(3) excludes unoccupied units from the analysis, and once the five vacancies are excluded the 40 qualifying units satisfy clause (i).",
        "The community qualifies under § 3607(b)(2)(B), because it is intended for persons 55 and older; subparagraph (B) requires only that intent, and subparagraph (C) is an alternative route rather than the applicable one.",
        "The shortfall is immaterial. Subparagraph (C)'s opening words require only that the housing be intended and operated for occupancy by persons 55 years of age or older, and clauses (i) through (iii) are illustrations of that intent rather than requirements.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Three requirements, all of them, and the community meets none. Two further points are worth carrying away. First, even a community that DOES qualify is exempt only from the familial-status provisions — race, color, religion, sex, national origin and handicap apply in full inside a seniors community, so \"it's senior housing\" answers exactly one question. Second, § 3607(b)(5)(B) uses the word \"only\": a manager who takes a community's word for its status has no defense, and the fix is documentary — get the written statement of compliance.",
      feedbackIncorrect:
        "Read subparagraph (C) as a list of conjunctive requirements rather than as a description. The community must be intended and operated for occupancy by persons 55 or older AND meet clause (i)'s 80 percent of occupied units AND publish and adhere to policies and procedures demonstrating that intent AND comply with the Secretary's verification rules. Subparagraph (B) is a different and stricter route — intended for, and SOLELY occupied by, persons 62 or older — not an easier one. And § 3607(b)(3)'s treatment of unoccupied units keeps them out of the denominator; it does not convert 40 qualifying units into 80 percent of anything. Review module-08.md, Unit: Equal Opportunity in Housing.",
      remediation: "module-08.md#unit-equal-opportunity-in-housing",
    },
    {
      id: "SC4-T3",
      type: "selection",
      prompt:
        "Classify the resident's two requests and state who bears the cost of each.",
      choices: [
        "The grab bars are a reasonable modification under 42 U.S.C. § 3604(f)(3)(A) — a change to existing premises, at the expense of the person with the handicap, and in a rental the landlord may, where it is reasonable to do so, condition permission on the renter agreeing to restore the interior of the premises to its prior condition, reasonable wear and tear excepted. Waiving the no-animals rule for the assistance animal and assigning the closer parking space are reasonable accommodations under § 3604(f)(3)(B) — changes in rules, policies, practices or services, to which the paragraph attaches no expense provision and no restoration provision. Property Code § 301.025(c) states the same pair for Texas.",
        "Both requests are reasonable modifications, so the community must install the grab bars at its own expense and may require the resident to restore the unreserved parking designation when she moves out.",
        "Both requests are reasonable accommodations, so the community must pay for the grab bars as well as waive the rule, because § 3604(f)(3)(B) attaches no expense provision to an accommodation.",
        "Neither request is required of this building. Section 3604(f)(3)(C)'s design and construction requirements reach only covered multifamily dwellings for first occupancy after the date 30 months after September 13, 1988, and a garden community with no elevator is outside them.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Learn the contrast as four differences and it stops being confusing. Object: a modification changes the premises, an accommodation changes rules, policies, practices or services. Expense: modifications are at the expense of the person with the handicap, and (B) says nothing about expense because changing a rule ordinarily costs nothing. Standard: \"full enjoyment of the premises\" against \"equal opportunity to use and enjoy a dwelling.\" Restoration: only (A) carries a restoration proviso, and it is narrow — a rental, a landlord acting where it is reasonable to do so, the interior only, reasonable wear and tear excepted.",
      feedbackIncorrect:
        "Ask what each request would change. Grab bars change the physical premises, which puts them in § 3604(f)(3)(A) with the expense on the person with the handicap and a possible interior-restoration condition in a rental. Waiving a no-animals rule and assigning a parking space change rules and practices, which puts them in § 3604(f)(3)(B), where the paragraph attaches no expense clause and no restoration clause. Note also that § 3604(f)(3)(C) is a separate design-and-construction duty for covered multifamily dwellings; whether it reaches this building is irrelevant, because (f)(3)(A) and (B) apply to dwellings generally. Review module-08.md, Unit: Housing Discrimination, and the reasonable modification and accommodation discussion in module-08.md, Unit: Equal Opportunity in Housing.",
      remediation: "module-08.md#unit-housing-discrimination",
    },
    {
      id: "SC4-T4",
      type: "computation",
      prompt:
        "Build the property's projected annual operating statement from the figures given and compute net operating income, in dollars. Round to the cent.",
      expected: 332416.48,
      tolerance: 0.02,
      points: 5,
      feedbackCorrect:
        "$332,416.48. Gross potential rent: 60 x $1,180 x 12 = $849,600. Vacancy and collection loss: $849,600 x 0.09 = $76,464. Effective gross income: $849,600 - $76,464 = $773,136. Management fee: $773,136 x 0.07 = $54,119.52. The eight listed expenses total $386,600, so total operating expenses are $386,600 + $54,119.52 = $440,719.52. Net operating income: $773,136 - $440,719.52 = $332,416.48. The $214,000 of debt service and the $96,000 roof are both outside the statement — debt service because net operating income measures what the property earns rather than how this owner financed it, and the roof because it is a capital expenditure funded from reserves rather than a recurring operating cost.",
      feedbackIncorrect:
        "Three things go wrong here. First, the management fee is a percentage of EFFECTIVE gross income, not of gross potential rent, so it cannot be computed until vacancy has been deducted. Second, annual debt service never appears in an operating statement: two identical buildings, one owned free and clear and one heavily mortgaged, have the same net operating income. Third, a roof replacement is a capital expenditure, not an operating expense. Work the chain in order — gross potential rent, less vacancy and collection loss, equals effective gross income; less operating expenses including the management fee, equals net operating income. Review module-09.md, Unit: Management Considerations.",
      remediation: "module-09.md#unit-management-considerations",
    },
    {
      id: "SC4-T5",
      type: "selection",
      prompt:
        "Evaluate the two things Marcus proposes to do about the make-ready shortfall: paying the flooring vendor from the residents' security deposit account and reimbursing it from May rent, and taking the vendor's $320 rebate against the management fee without showing it on the owner's statement.",
      choices: [
        "Both fail, and neither turns on dishonest intent. Paying a vendor out of money held in the security deposit account disburses funds deposited in a custodial, trust or escrow account before the completion or termination of the transaction, which Occupations Code § 1101.652(b)(31) reaches, and applies money belonging to the residents to the owner's obligations, which § 1101.652(b)(10) reaches as commingling. Taking the $320 without disclosure is an undisclosed commission, rebate or direct profit on an expenditure made for a principal under § 1101.652(b)(13), and omitting it from the owner's statement independently reaches § 1101.652(b)(24), which forbids withholding from or inserting into a statement of account a statement the license holder knows makes it materially inaccurate.",
        "Both are permissible so long as the security deposit account is made whole within the same month. Section 1101.652(b)(30) governs only the account into which trust funds must be deposited and says nothing about how they may be disbursed.",
        "The vendor payment fails but the rebate does not. A rebate paid by a vendor out of the vendor's own margin is the vendor's money rather than a profit on an expenditure made for a principal, so § 1101.652(b)(13) is not engaged and there is nothing to report.",
        "Neither fails. A security deposit is the landlord's money from the day it is collected until the tenancy ends, § 1101.652(b)(31) reaches only earnest money held in a sale, and a rebate is adequately disclosed by the vendor's own invoice reaching the owner's file.",
      ],
      correctChoice: 0,
      points: 4,
      feedbackCorrect:
        "Read subdivisions (9), (10), (30) and (31) as the life of a dollar: get it into the right account promptly, keep it apart from your own money while it sits there, do not pay it out early, and account for it and remit it to its owner within a reasonable time. Most of those are administrative rather than moral requirements, which is exactly why careless managers lose licenses over them. And § 1101.652(b)(13) and (b)(24) sit alongside: the owner statement is not a courtesy document.",
      feedbackIncorrect:
        "The money in the security deposit account belongs to the residents, subject to the landlord's right to deduct — it is not a float, and it does not become the landlord's on the day it is collected. Spending it on the owner's make-ready is an early disbursement under § 1101.652(b)(31) and a commingling of other people's money under (b)(10), and restoring it later does not undo either; the violation is complete when the funds move. On the rebate, § 1101.652(b)(13) is drafted around the expenditure, not around whose margin the money came out of: an undisclosed commission, rebate or direct profit on an expenditure made FOR A PRINCIPAL is the ground, and disclosure means disclosure to the principal, which is what the monthly statement is for. Review module-09.md, Unit: Property Management.",
      remediation: "module-09.md#unit-property-management",
    },
    {
      id: "SC4-T6",
      type: "short-answer",
      prompt:
        "Answer the owner's email. Set out what you do about the instruction and about the proposed advertisement, and identify the provisions that decide it.",
      rubric: [
        "States that the instruction is refused and not carried out, and that the advertisement is not published.",
        "Identifies that Occupations Code § 1101.652(b)(32) makes it a ground for discipline for a license holder to discriminate against an owner, potential buyer, landlord or potential tenant on the basis of race, color, religion, sex, disability, familial status, national origin or ancestry — including directing a prospective buyer or tenant interested in equivalent properties to a different area on those grounds — and that the exposure is the license holder's own regardless of who gave the instruction.",
        "Identifies that Property Code § 301.022 prohibits publishing a notice, statement or advertisement about the sale or rental of a dwelling that indicates a preference, limitation or discrimination, or the intention to make one, because of a protected characteristic including familial status, and that 42 U.S.C. § 3604(c) is the federal counterpart.",
        "Identifies that the housing-for-older-persons exemption in 42 U.S.C. § 3607(b) removes only the familial-status provisions and nothing else, and that on the facts of this community — below the 80 percent occupancy threshold, with no published age policy and no written statement of compliance — the exemption is unavailable in any event.",
        "States the operating response as well as the refusal: apply the written tenant-selection criteria uniformly to every applicant and document each decision, rather than deviating from them on an owner's instruction.",
      ],
      points: 5,
      feedbackCorrect:
        "The instruction the fair housing clause of a management agreement exists to forbid is the one a manager is most likely to receive, and this is it. Two points carry the answer. The license holder's exposure under § 1101.652(b)(32) is personal and does not move to the owner because the owner asked; and the exemption the owner is invoking, even where it exists, answers only the familial-status question and cannot be invoked at all by a community that has never published an age policy or documented its occupancy.",
      feedbackIncorrect:
        "Answer three questions in order. Does a familial-status exemption exist for this community? On these facts it does not, and even where it does it removes only the familial-status provisions. Is the proposed advertisement lawful independently of the exemption question? No — Property Code § 301.022 and 42 U.S.C. § 3604(c) prohibit a statement indicating a preference or limitation or the intention to make one. And whose license is on the line? Yours: § 1101.652(b)(32) reaches the license holder's own act however the instruction arrived. Then say what you will do instead — apply the written criteria uniformly and document each decision. Review module-09.md, Unit: Management Considerations, on tenant selection, and module-08.md, Unit: Equal Opportunity in Housing.",
      remediation: "module-09.md#unit-management-considerations",
    },
  ],
  passingScore: 0.7,
  instructorReview: {
    required: true,
    reason:
      "Task SC4-T6 is graded against a rubric of identified provisions and a required refusal of an owner's instruction, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student may reach a passing point total while still endorsing the owner's instruction on the short-answer task, the instructor confirms that the refusal element was met before the scenario is recorded as passed.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   Exports and the set-level invariants
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

export const SCENARIOS = Object.freeze([SC1, SC2, SC3, SC4]);

export const SCENARIO_COUNT = SCENARIOS.length;

export const TOTAL_TASKS = SCENARIOS.reduce((sum, item) => sum + item.tasks.length, 0);

/**
 * What the scenario set actually assesses. Returns the distinct topic codes and unit codes reached by
 * the four scenarios, the placement of each scenario, and the task mix — the figures a coverage matrix
 * or a submission exhibit needs without re-deriving them from the scenario bodies.
 */
export function scenarioCoverage() {
  const topics = new Set();
  const units = new Set();
  const taskTypes = { selection: 0, computation: 0, "short-answer": 0 };

  for (const item of SCENARIOS) {
    for (const topicCode of item.assessesTopics) topics.add(topicCode);
    for (const unitCode of item.assessesUnits) units.add(unitCode);
    for (const task of item.tasks) taskTypes[task.type] += 1;
  }

  const orderedTopics = TOPIC_ORDER.filter((code) => topics.has(code));
  const orderedUnits = ALL_UNITS.map((unit) => unit.code).filter((code) => units.has(code));

  return Object.freeze({
    scenarioCount: SCENARIO_COUNT,
    minimumRequired: ASSESSMENT_REQUIREMENTS.minScenarioExercises,
    totalTasks: TOTAL_TASKS,
    taskTypes: Object.freeze({ ...taskTypes }),
    topics: Object.freeze(orderedTopics),
    units: Object.freeze(orderedUnits),
    topicsNotAssessed: Object.freeze(TOPIC_ORDER.filter((code) => !topics.has(code))),
    placements: Object.freeze(
      SCENARIOS.map((item) =>
        Object.freeze({
          id: item.id,
          afterTopic: item.placement.afterTopic,
          unlockRequires: item.placement.unlockRequires,
          assessesTopics: item.assessesTopics,
          assessesUnits: item.assessesUnits,
          tasks: item.tasks.length,
          totalPoints: item.totalPoints,
          pointsToPass: item.pointsToPass,
          instructorReviewRequired: item.instructorReview.required,
        }),
      ),
    ),
  });
}

/* The floor from § 535.62(b)(7), compared rather than asserted. */
if (SCENARIO_COUNT < ASSESSMENT_REQUIREMENTS.minScenarioExercises) {
  throw new Error(
    `principles-ii-scenarios: ${SCENARIO_COUNT} scenarios against the § 535.62(b)(7) floor of ${ASSESSMENT_REQUIREMENTS.minScenarioExercises} for a ${ASSESSMENT_REQUIREMENTS.creditHours}-hour course`,
  );
}

/* Distribution. The scenarios must sit at materially different points in the course, not all at the end. */
{
  const placements = SCENARIOS.map((item) => item.placement.afterTopic);
  if (new Set(placements).size !== placements.length) {
    throw new Error("principles-ii-scenarios: two scenarios are placed after the same topic; the set must be distributed across the course");
  }
  const finalTopic = TOPIC_ORDER[TOPIC_ORDER.length - 1];
  const atTheEnd = placements.filter((code) => code === finalTopic).length;
  if (atTheEnd > 1) {
    throw new Error("principles-ii-scenarios: more than one scenario is placed after the final topic");
  }
  const earliestIndex = Math.min(...placements.map((code) => TOPIC_ORDER.indexOf(code)));
  if (earliestIndex > Math.floor(TOPIC_ORDER.length / 2)) {
    throw new Error("principles-ii-scenarios: the earliest scenario sits past the midpoint of the course; the set is back-loaded");
  }
  for (const item of SCENARIOS) {
    const afterIndex = TOPIC_ORDER.indexOf(item.placement.afterTopic);
    for (const required of item.placement.unlockRequires) {
      if (TOPIC_ORDER.indexOf(required) > afterIndex) {
        throw new Error(`principles-ii-scenarios ${item.id}: unlockRequires names ${required}, which the student has not reached at the placement point`);
      }
    }
  }
}

/* Every task type is represented, so no scenario set can degrade into a single-format instrument. */
{
  const coverage = scenarioCoverage();
  for (const [type, count] of Object.entries(coverage.taskTypes)) {
    if (count === 0) throw new Error(`principles-ii-scenarios: no task of type ${type} in the set`);
  }
}

export default Object.freeze({ REGULATORY_BASIS, SCENARIOS, SCENARIO_COUNT, TOTAL_TASKS, scenarioCoverage });
