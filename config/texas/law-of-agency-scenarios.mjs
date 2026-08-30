/**
 * Texas Law of Agency — the five scenario-based learning exercises.
 *
 * WHAT THIS FILE IS. The applied instrument of the 30-hour Law of Agency course. Four scenarios sit
 * on topics — T03, T06, T09 and T11, the four topics the time budget allocates a scenario to — and
 * the fifth is the COURSE CAPSTONE, whose twenty minutes are course-level time attributed to no
 * topic at all. These are not the topic quizzes and they are not the final examination.
 *
 * THE REGULATORY BASIS, STATED PRECISELY.
 *
 *   - The COUNT comes from 22 TAC § 535.62(b)(7)(B), held at texas/trec-sources/trec-rules/535.62.txt:
 *     "at least one scenario-based learning exercise per every increment of 10 credit hours or less."
 *     For a 30-hour course that floor is three. The floor is READ rather than asserted:
 *     config/texas/trec-rules-source-lock.mjs derives ASSESSMENT_REQUIREMENTS.minScenarioExercises
 *     from COURSE_CREDIT_HOURS, this file reads that key by its exact name, and the invariant at the
 *     foot compares SCENARIO_COUNT against it. Five is two above the floor, so that a later coverage
 *     change cannot drop the course under the minimum.
 *
 *   - The PASSING RESULT requirement comes from § 535.62(b)(7)(C)(i): distance delivery must prevent
 *     a student moving from one topic to the next "until the student answers all topic quiz questions
 *     correctly and receives a passing grade on the scenario based learning exercises." The rule
 *     states no figure for that passing grade. Each scenario sets 0.7, mirroring the unweighted 70%
 *     that § 535.65(h)(4) fixes for the final examination. That mirroring is this course's design
 *     choice and is recorded as one, not as a Commission-stated scenario threshold.
 *
 *   - § 535.65(g)(2)(D) makes "a qualified instructor … responsible for providing answers and
 *     rationale for the grading of the course work." That is why every scenario carries
 *     instructorReview and every task carries an authored feedbackCorrect and feedbackIncorrect: the
 *     rationale is written in advance, not improvised at grading time.
 *
 *   - The codified Secretary of State text of 22 TAC ch. 535 remains UNREAD. The rules above are
 *     taken from TREC's own published reproduction, classified TIER 4 in the rule lock, and
 *     TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Nothing here may be described as TREC-approved and no
 *     Texas qualifying credit may be offered.
 *
 * THE CAPSTONE IS COURSE-LEVEL TIME. config/texas/law-of-agency-time-budget.mjs exports COURSE_LEVEL
 * and explains why: a capstone draws on the whole course, so attributing its minutes to whichever
 * topic happens to sit last is an accounting artefact and would let a surplus in one topic appear to
 * cure a shortfall in another. LOA-SC5 is therefore written as an integrated exercise across seven
 * topics, is placed after the final topic because that is when a student has finished the course, and
 * carries placement.timeAttribution === "COURSE_LEVEL". The invariants below reconcile the four topic
 * scenarios against BUDGET, topic by topic, and the capstone against COURSE_LEVEL — so a scenario
 * that quietly became a T12 exercise would fail to load.
 *
 * DESIGN RULES THIS FILE ENFORCES ON ITSELF, IN CODE.
 *
 *   1. APPLICATION, NOT RECALL. Every task requires a rule to be applied to stated facts, a figure or
 *      a date to be produced, or a choice among courses of action a competent licence holder might
 *      defend. No task asks for a definition, and every task carries the judgement it tests.
 *
 *   2. OBJECTIVE PASSING CRITERIA. A task is a selection with exactly one correct choice, a
 *      computation with an expected value and a tolerance, or a short answer graded against a rubric
 *      of specific checkable elements. NO TASK IS GRADED ON LENGTH. There is no minimum number of
 *      words, characters, sentences or paragraphs anywhere in this file; nothing is revealed only
 *      after a student types a quota; and the invariants reject both a length-shaped key and a length
 *      phrase in any authored string, in any scenario, at load time.
 *
 *   3. REFLECTIVE WRITING IS OPTIONAL. Each scenario offers a reflection prompt. It carries no
 *      points, is not graded, and cannot affect whether the scenario is passed. The invariants
 *      enforce all three.
 *
 *   4. THE PROFESSIONAL LIMIT IS PART OF THE ANSWER. Every scenario contains at least one task where
 *      the correct response includes referring the matter to the broker or to legal counsel, and no
 *      scenario can be passed by answering a question a Texas licence holder may not answer. A
 *      scenario that rewarded a licence holder for opining on the sufficiency of an instrument, on an
 *      estate's authority to convey, or on whether a claim will succeed would be teaching the wrong
 *      thing. The invariant below requires at least one task per scenario tagged referral.
 *
 *   5. NOTHING DEPENDS ON OPTIONAL-REFERENCE CONTENT. Modules 02, 03, 07, 09, 10, 11 and 12 close
 *      with a "## Optional reference:" section, which the generated block maps carry as a block with
 *      required: false and noAssessmentMayDependOnThis: true. Every task here names the required
 *      block-map screens it draws on, in its `teaches` array, and the invariants resolve every screen
 *      id against the twelve generated block maps and reject any screen whose block is not required,
 *      whose type is not instruction or practice, or whose block does not belong to a unit the task
 *      declares. A student who skips every optional section can complete every scenario.
 *
 *   6. NO MISCONCEPTION CHECK IS DUPLICATED. config/texas/law-of-agency-misconception-checks.mjs
 *      holds seven FORMATIVE_INSTRUCTIONAL items. They are instruction, counted once, and none of
 *      them may be re-tested here. Any task reaching a unit that a misconception check also reaches
 *      must state, in differsFromMisconception, which check it sits beside and how the judgement
 *      differs; and no task prompt may come near a check's prompt on token similarity. Both are
 *      enforced below.
 *
 *   7. NO INVENTED LAW. Every provision, threshold, deadline and condition a task turns on is taught
 *      in the frozen curriculum at texas/tx-law-of-agency-30-v1/curriculum/ and traceable from there
 *      to a held source. Every dollar figure invented to make arithmetic visible is labelled
 *      illustrative, in the same terms the modules use for their own.
 *
 *   8. TEXAS ONLY. No out-of-state doctrine, and no "dual agency" — the words appear in Chapter 1101
 *      nowhere, and this course does not use them as though Texas regulated a capacity it does not
 *      recognise.
 *
 * ARITHMETIC. Every numeric answer was computed and re-computed by hand while authoring, and each
 * computation task's feedbackCorrect prints the working so a student can find the step that went
 * wrong. Selection choices that recite a figure use the same figures.
 *
 * CONFIDENTIALITY. These scenarios are student-facing instruction and are not part of the secure
 * examination bank. Nothing in this file may be reused as an examination item; § 535.65(h)(2)
 * requires examination questions to be significantly different from the quiz questions and exercises
 * used in the course, and these are those exercises.
 */

import { TOPICS, ALL_UNITS } from "./law-of-agency-course-form.mjs";
import { UNIT_OBJECTIVES } from "./law-of-agency-course.mjs";
import { ASSESSMENT_REQUIREMENTS } from "./trec-rules-source-lock.mjs";
import { BUDGET, COURSE_LEVEL, RATES } from "./law-of-agency-time-budget.mjs";
import { MISCONCEPTION_CHECKS } from "./law-of-agency-misconception-checks.mjs";
import { MODULE_1_BLOCKS } from "./law-of-agency-module-1-blocks.mjs";
import { MODULE_2_BLOCKS } from "./law-of-agency-module-2-blocks.mjs";
import { MODULE_3_BLOCKS } from "./law-of-agency-module-3-blocks.mjs";
import { MODULE_4_BLOCKS } from "./law-of-agency-module-4-blocks.mjs";
import { MODULE_5_BLOCKS } from "./law-of-agency-module-5-blocks.mjs";
import { MODULE_6_BLOCKS } from "./law-of-agency-module-6-blocks.mjs";
import { MODULE_7_BLOCKS } from "./law-of-agency-module-7-blocks.mjs";
import { MODULE_8_BLOCKS } from "./law-of-agency-module-8-blocks.mjs";
import { MODULE_9_BLOCKS } from "./law-of-agency-module-9-blocks.mjs";
import { MODULE_10_BLOCKS } from "./law-of-agency-module-10-blocks.mjs";
import { MODULE_11_BLOCKS } from "./law-of-agency-module-11-blocks.mjs";
import { MODULE_12_BLOCKS } from "./law-of-agency-module-12-blocks.mjs";

export const REGULATORY_BASIS = Object.freeze({
  scenarioCountRule:
    "22 TAC § 535.62(b)(7)(B) — at least one scenario-based learning exercise per every increment of 10 credit hours or less",
  scenarioCountFloor: ASSESSMENT_REQUIREMENTS.minScenarioExercises,
  creditHours: ASSESSMENT_REQUIREMENTS.creditHours,
  progressionRule:
    "22 TAC § 535.62(b)(7)(C)(i) — distance delivery must prevent the student moving from one topic to the next until the student answers all topic quiz questions correctly and receives a passing grade on the scenario based learning exercises",
  gradingRule:
    "22 TAC § 535.65(g)(2)(D) — a qualified instructor is responsible for providing answers and rationale for the grading of the course work",
  instructorAvailabilityRule:
    "22 TAC § 535.65(g)(2)(B) — a qualified instructor is available to answer students' questions or provide assistance as necessary in a timely manner",
  identityRule:
    "22 TAC § 535.65(g)(2)(A) — the student completing all quizzes and exercises must be the student receiving credit, through an identity verification process acceptable to the Commission",
  separationFromFinalRule:
    "22 TAC § 535.65(h)(2) — final examination questions must be significantly different from any quiz questions and exercises used in the course",
  passingScoreNote:
    "§ 535.62(b)(7) requires a passing grade on the scenario exercises but states no figure. Each scenario sets 0.7, mirroring the unweighted 70% that § 535.65(h)(4) fixes for the final examination. The mirroring is this course's design choice, not a Commission-stated scenario threshold.",
  sourceTier:
    "TREC-published reproduction of 22 TAC ch. 535 (TIER 4). The codified Secretary of State text is unread; TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Nothing here is TREC-approved and no Texas credit is offered.",
});

/* ── lookup tables built from LOA-1's own transcription, so a typo cannot survive load ─────────── */

const TOPIC_CODES = new Set(TOPICS.map((topic) => topic.code));
const TOPIC_ORDER = TOPICS.map((topic) => topic.code);
const UNIT_BY_CODE = new Map(ALL_UNITS.map((unit) => [unit.code, unit]));
const FINAL_TOPIC = TOPIC_ORDER[TOPIC_ORDER.length - 1];

/**
 * The curriculum's heading-slug rule, applied to the unit name printed on LOA-1: lowercase, drop
 * punctuation in place (keeping hyphens), spaces to hyphens. " - " therefore becomes "---", which is
 * exactly how the frozen modules' "## Unit:" headings anchor. Verified against all 57 headings.
 */
function unitAnchorSlug(unitName) {
  return unitName
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
}

function moduleNumberFor(topicCode) {
  return topicCode.slice(1);
}

function remediationAnchorFor(unitCode) {
  const unit = UNIT_BY_CODE.get(unitCode);
  if (!unit) throw new Error(`law-of-agency-scenarios: unknown unit code ${unitCode}`);
  return `module-${moduleNumberFor(unit.topicCode)}.md#unit-${unitAnchorSlug(unit.unit)}`;
}

/* ── the required-screen index, built from the generated block maps ────────────────────────────── */

const BLOCK_MAPS = [
  MODULE_1_BLOCKS, MODULE_2_BLOCKS, MODULE_3_BLOCKS, MODULE_4_BLOCKS,
  MODULE_5_BLOCKS, MODULE_6_BLOCKS, MODULE_7_BLOCKS, MODULE_8_BLOCKS,
  MODULE_9_BLOCKS, MODULE_10_BLOCKS, MODULE_11_BLOCKS, MODULE_12_BLOCKS,
];

/** Screen types a scenario task may draw on. A retrieval screen is a quiz screen, not instruction. */
const CITABLE_SCREEN_TYPES = new Set(["instruction", "practice"]);

const SCREEN_INDEX = new Map();
for (const map of BLOCK_MAPS) {
  for (const block of map.blocks) {
    for (const screen of block.screens) {
      if (SCREEN_INDEX.has(screen.id)) {
        throw new Error(`law-of-agency-scenarios: block maps carry two screens with id ${screen.id}`);
      }
      SCREEN_INDEX.set(screen.id, Object.freeze({
        moduleId: map.moduleId,
        blockId: block.id,
        unitCode: block.code ?? null,
        required: block.required !== false,
        nonBlocking: block.nonBlocking === true,
        noAssessmentMayDependOnThis: block.noAssessmentMayDependOnThis === true,
        type: screen.type,
        title: screen.title,
      }));
    }
  }
}

/* ── the length-requirement ban, enforced rather than merely promised ──────────────────────────── */

const LENGTH_KEYS = [
  "minLength", "maxLength", "minWords", "maxWords", "wordCount", "characterCount",
  "minCharacters", "maxCharacters", "minimumLength", "minimumWords", "minSentences",
  "maxSentences", "minParagraphs", "maxParagraphs", "wordLimit", "characterLimit", "length",
];

const LENGTH_PHRASE =
  /\b\d+\s*(?:-|\s)?\s*(?:word|words|character|characters)\b|\bword count\b|\bcharacter count\b|\bminimum length\b|\bat least\s+\w+\s+(?:words|characters|sentences|paragraphs)\b|\bno fewer than\s+\w+\s+(?:words|characters|sentences|paragraphs)\b/i;

/** A reveal that a student must type their way past is the practice the work order forbids. */
const REVEAL_GATE =
  /\b(?:type|write|enter|submit)\b[^.]{0,80}\b(?:to (?:reveal|unlock|view|see|continue|proceed))\b/i;

/** Nothing authored here may describe this course as approved. The claim is checked, not trusted. */
const APPROVAL_CLAIM = /\btrec[-\s]approved\b|\bapproved by (?:the )?trec\b|\bapproved by the commission\b|\btexas credit (?:is )?available\b/i;

function walkStrings(value, visit, path = "") {
  if (typeof value === "string") { visit(value, path); return; }
  if (Array.isArray(value)) { value.forEach((item, i) => walkStrings(item, visit, `${path}[${i}]`)); return; }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) walkStrings(child, visit, path ? `${path}.${key}` : key);
  }
}

function assertNoLengthKeys(where, object) {
  for (const key of LENGTH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      throw new Error(`${where}: carries a length requirement key "${key}"; scenario work is never graded on length`);
    }
  }
}

function assertNoBannedText(where, object) {
  walkStrings(object, (text, path) => {
    if (LENGTH_PHRASE.test(text)) {
      throw new Error(`${where}: ${path || "text"} states a word, character, sentence or paragraph count; scenario work is never graded on length`);
    }
    if (REVEAL_GATE.test(text)) {
      throw new Error(`${where}: ${path || "text"} gates a reveal on the student typing something; no answer in this course is unlocked by typing`);
    }
    if (APPROVAL_CLAIM.test(text)) {
      throw new Error(`${where}: ${path || "text"} claims an approval this course does not hold`);
    }
  });
}

/* ── misconception-check separation ────────────────────────────────────────────────────────────── */

const MC_UNIT_CODES = new Set(MISCONCEPTION_CHECKS.map((check) => check.unitCode));
const MC_BY_ID = new Map(MISCONCEPTION_CHECKS.map((check) => [check.id, check]));

const STOP = new Set(
  "a an and are as at be by for from has have if in is it its may must no not of on or shall should than that the their them then there these they this to under was were what when which who will with would you your your own".split(" "),
);
const tokens = (s) => (String(s).toLowerCase().match(/[a-z0-9§.()-]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared += 1;
  return shared / (A.size + B.size - shared);
};

/**
 * A scenario task that reads like a misconception check is a misconception check counted twice. The
 * threshold is deliberately far below the 0.70 the examination separation check uses, because these
 * two instruments share a vocabulary and the point here is to catch a duplicated judgement early.
 */
const MC_SIMILARITY_CEILING = 0.35;

/* ── the scenario factory: it validates, then freezes ──────────────────────────────────────────── */

const SEEN_SCENARIO_IDS = new Set();
const SEEN_TASK_IDS = new Set();
const TASK_TYPES = new Set(["selection", "computation", "short-answer"]);
const TIME_ATTRIBUTIONS = new Set(["TOPIC", "COURSE_LEVEL"]);

function scenario(id, spec) {
  const where = `law-of-agency-scenarios ${id}`;

  if (!/^LOA-SC[1-9][0-9]*$/.test(id)) throw new Error(`${where}: scenario id must look like LOA-SC1`);
  if (SEEN_SCENARIO_IDS.has(id)) throw new Error(`${where}: duplicate scenario id`);
  SEEN_SCENARIO_IDS.add(id);
  const scenarioNumber = id.slice("LOA-SC".length);

  if (typeof spec.title !== "string" || spec.title.trim() === "") throw new Error(`${where}: missing title`);
  if (typeof spec.context !== "string" || spec.context.trim() === "") throw new Error(`${where}: missing context`);
  if (!Array.isArray(spec.facts) || spec.facts.length === 0) throw new Error(`${where}: missing facts`);
  for (const fact of spec.facts) {
    if (typeof fact !== "string" || fact.trim() === "") throw new Error(`${where}: every fact must be a non-empty string`);
  }

  /* placement, including how the twenty minutes are attributed */
  const placement = spec.placement;
  if (!placement || typeof placement !== "object") throw new Error(`${where}: missing placement`);
  if (!TOPIC_CODES.has(placement.afterTopic)) {
    throw new Error(`${where}: placement.afterTopic ${placement.afterTopic} is not an LOA-1 topic code`);
  }
  if (!TIME_ATTRIBUTIONS.has(placement.timeAttribution)) {
    throw new Error(`${where}: placement.timeAttribution must be TOPIC or COURSE_LEVEL — say which budget pays for these minutes`);
  }
  if (placement.timeAttribution === "TOPIC" && placement.attributedToTopic !== placement.afterTopic) {
    throw new Error(`${where}: a topic scenario's minutes are attributed to the topic it is placed on`);
  }
  if (placement.timeAttribution === "COURSE_LEVEL" && placement.attributedToTopic !== null) {
    throw new Error(`${where}: a course-level scenario is attributed to no topic; set attributedToTopic to null`);
  }
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
    if (!UNIT_OBJECTIVES[unitCode]) {
      throw new Error(`${where}: unit ${unitCode} has no learning objective in law-of-agency-course.mjs`);
    }
  }
  const allowedUnits = new Set(spec.assessesUnits);
  const allowedAnchors = new Set(spec.assessesUnits.map((unitCode) => remediationAnchorFor(unitCode)));

  /* tasks */
  if (!Array.isArray(spec.tasks) || spec.tasks.length < 3) {
    throw new Error(`${where}: a scenario must carry at least three independently gradeable tasks`);
  }

  const unitsReached = new Set();
  const tasks = spec.tasks.map((task) => {
    const taskWhere = `${where} task ${task.id}`;

    if (typeof task.id !== "string" || !new RegExp(`^SC${scenarioNumber}-T[1-9][0-9]*$`).test(task.id)) {
      throw new Error(`${taskWhere}: task id must look like SC${scenarioNumber}-T1`);
    }
    if (SEEN_TASK_IDS.has(task.id)) throw new Error(`${taskWhere}: duplicate task id`);
    SEEN_TASK_IDS.add(task.id);

    if (typeof task.prompt !== "string" || task.prompt.trim() === "") throw new Error(`${taskWhere}: missing prompt`);
    if (!TASK_TYPES.has(task.type)) throw new Error(`${taskWhere}: unknown task type ${task.type}`);
    if (typeof task.points !== "number" || !Number.isFinite(task.points) || task.points <= 0) {
      throw new Error(`${taskWhere}: points must be a positive number`);
    }
    if (typeof task.judgement !== "string" || task.judgement.trim() === "") {
      throw new Error(`${taskWhere}: state the judgement this task tests — a task that cannot name one is testing recall`);
    }
    if (typeof task.feedbackCorrect !== "string" || task.feedbackCorrect.trim() === "") throw new Error(`${taskWhere}: missing feedbackCorrect`);
    if (typeof task.feedbackIncorrect !== "string" || task.feedbackIncorrect.trim() === "") throw new Error(`${taskWhere}: missing feedbackIncorrect`);
    if (!Array.isArray(task.sources) || task.sources.length === 0) throw new Error(`${taskWhere}: names no controlling source`);
    for (const source of task.sources) {
      if (typeof source !== "string" || source.trim() === "") throw new Error(`${taskWhere}: every source must be a non-empty string`);
    }

    /* unit trace */
    if (!Array.isArray(task.unitCodes) || task.unitCodes.length === 0) throw new Error(`${taskWhere}: names no unit`);
    if (new Set(task.unitCodes).size !== task.unitCodes.length) throw new Error(`${taskWhere}: repeats a unit code`);
    for (const unitCode of task.unitCodes) {
      if (!allowedUnits.has(unitCode)) {
        throw new Error(`${taskWhere}: names unit ${unitCode}, which this scenario does not declare in assessesUnits`);
      }
      unitsReached.add(unitCode);
    }

    /* screen trace — this is the mechanism that keeps every task off optional-reference content */
    if (!Array.isArray(task.teaches) || task.teaches.length === 0) {
      throw new Error(`${taskWhere}: names no instructional screen; every task traces to required block-map screens`);
    }
    if (new Set(task.teaches).size !== task.teaches.length) throw new Error(`${taskWhere}: repeats a screen id`);
    for (const screenId of task.teaches) {
      const screen = SCREEN_INDEX.get(screenId);
      if (!screen) throw new Error(`${taskWhere}: screen ${screenId} is in no Law of Agency block map`);
      if (!screen.required || screen.nonBlocking || screen.noAssessmentMayDependOnThis) {
        throw new Error(`${taskWhere}: screen ${screenId} belongs to a non-required block; no required item may depend on optional-reference content`);
      }
      if (!CITABLE_SCREEN_TYPES.has(screen.type)) {
        throw new Error(`${taskWhere}: screen ${screenId} is a ${screen.type} screen; a task traces to instruction or practice screens`);
      }
      if (!screen.unitCode || !task.unitCodes.includes(screen.unitCode)) {
        throw new Error(`${taskWhere}: screen ${screenId} belongs to unit ${screen.unitCode}, which this task does not name`);
      }
    }

    /* remediation on failure */
    if (typeof task.remediation !== "string" || !/^module-(?:0[1-9]|1[0-2])\.md#unit-[a-z0-9-]+$/.test(task.remediation)) {
      throw new Error(`${taskWhere}: remediation must be a module anchor of the form module-NN.md#unit-slug`);
    }
    if (!allowedAnchors.has(task.remediation)) {
      throw new Error(`${taskWhere}: remediation ${task.remediation} does not match any unit this scenario assesses`);
    }

    /* type-specific shape */
    if (task.type === "selection") {
      if (!Array.isArray(task.choices) || task.choices.length < 3) throw new Error(`${taskWhere}: a selection task needs at least three choices`);
      for (const choice of task.choices) {
        if (typeof choice !== "string" || choice.trim() === "") throw new Error(`${taskWhere}: every choice must be a non-empty string`);
      }
      if (new Set(task.choices).size !== task.choices.length) throw new Error(`${taskWhere}: repeats a choice`);
      if (task.correctChoice !== 0) {
        throw new Error(`${taskWhere}: the correct answer must be authored FIRST (correctChoice 0); the engine permutes at serve time`);
      }
      if ("expected" in task || "tolerance" in task || "rubric" in task) {
        throw new Error(`${taskWhere}: a selection task carries no expected value, tolerance or rubric`);
      }
    } else if (task.type === "computation") {
      if (typeof task.expected !== "number" || !Number.isFinite(task.expected)) throw new Error(`${taskWhere}: a computation task needs a finite expected value`);
      if (typeof task.tolerance !== "number" || !Number.isFinite(task.tolerance) || task.tolerance < 0) {
        throw new Error(`${taskWhere}: a computation task needs a non-negative numeric tolerance`);
      }
      if (typeof task.unit !== "string" || task.unit.trim() === "") {
        throw new Error(`${taskWhere}: a computation task must say what the number is — dollars, a day of the month, a year`);
      }
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

    /* the referral tag, and the note that has to come with it */
    if ("referral" in task) {
      if (task.referral !== true) throw new Error(`${taskWhere}: referral, when present, is true`);
      if (typeof task.referralNote !== "string" || task.referralNote.trim() === "") {
        throw new Error(`${taskWhere}: a referral task must say which professional limit is reached and to whom the matter goes`);
      }
    } else if ("referralNote" in task) {
      throw new Error(`${taskWhere}: carries a referralNote without being tagged referral`);
    }

    /* separation from the seven misconception checks */
    const sharedMcUnits = task.unitCodes.filter((unitCode) => MC_UNIT_CODES.has(unitCode));
    if (sharedMcUnits.length > 0) {
      if (typeof task.differsFromMisconception !== "string" || task.differsFromMisconception.trim() === "") {
        throw new Error(
          `${taskWhere}: reaches unit(s) ${sharedMcUnits.join(", ")} that a misconception check also reaches; state in differsFromMisconception which check it sits beside and how the judgement differs`,
        );
      }
      const named = [...MC_BY_ID.keys()].filter((mcId) => task.differsFromMisconception.includes(mcId));
      if (named.length === 0) {
        throw new Error(`${taskWhere}: differsFromMisconception names no misconception check id`);
      }
    }
    const promptTokens = tokens(task.prompt);
    for (const check of MISCONCEPTION_CHECKS) {
      const similarity = jaccard(promptTokens, tokens(`${check.prompt} ${check.misconception} ${check.options.join(" ")}`));
      if (similarity >= MC_SIMILARITY_CEILING) {
        throw new Error(
          `${taskWhere}: prompt sits at Jaccard ${similarity.toFixed(3)} against misconception check ${check.id}; a scenario task may not re-test a formative check`,
        );
      }
    }

    assertNoLengthKeys(taskWhere, task);
    assertNoBannedText(taskWhere, task);

    return Object.freeze({
      ...task,
      unitCodes: Object.freeze([...task.unitCodes]),
      teaches: Object.freeze([...task.teaches]),
      sources: Object.freeze([...task.sources]),
      choices: task.choices ? Object.freeze([...task.choices]) : undefined,
      rubric: task.rubric ? Object.freeze([...task.rubric]) : undefined,
      objectives: Object.freeze(task.unitCodes.map((unitCode) => Object.freeze({ unitCode, objective: UNIT_OBJECTIVES[unitCode] }))),
    });
  });

  const unreached = spec.assessesUnits.filter((unitCode) => !unitsReached.has(unitCode));
  if (unreached.length) {
    throw new Error(`${where}: declares unit(s) ${unreached.join(", ")} that no task reaches; assessesUnits is a claim about what is tested`);
  }
  if (!tasks.some((task) => task.referral === true)) {
    throw new Error(`${where}: no task credits referring the matter to the broker or to legal counsel; every scenario must reach a professional limit and reward respecting it`);
  }

  /* passing score and the elements that are not tradeable for points */
  if (typeof spec.passingScore !== "number" || !Number.isFinite(spec.passingScore) || spec.passingScore <= 0 || spec.passingScore > 1) {
    throw new Error(`${where}: passingScore must be a fraction of total points greater than 0 and no greater than 1`);
  }
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const pointsToPass = Math.ceil(totalPoints * spec.passingScore * 100) / 100;

  const criticalCriteria = spec.criticalCriteria ?? [];
  if (!Array.isArray(criticalCriteria)) throw new Error(`${where}: criticalCriteria must be an array`);
  const allRubricLines = new Set(tasks.flatMap((task) => task.rubric ?? []));
  for (const criterion of criticalCriteria) {
    if (!allRubricLines.has(criterion)) {
      throw new Error(`${where}: criticalCriteria names a line that is not a rubric criterion of any task in this scenario`);
    }
  }

  /* remediation plan */
  const remediation = spec.remediation;
  if (!remediation || typeof remediation !== "object") throw new Error(`${where}: missing remediation plan`);
  if (typeof remediation.onFailure !== "string" || remediation.onFailure.trim() === "") {
    throw new Error(`${where}: the remediation plan must say what happens when a student does not pass`);
  }
  if (!Array.isArray(remediation.revisit) || remediation.revisit.length === 0) {
    throw new Error(`${where}: the remediation plan must name the screens a student is sent back to`);
  }
  for (const screenId of remediation.revisit) {
    const screen = SCREEN_INDEX.get(screenId);
    if (!screen) throw new Error(`${where}: remediation names screen ${screenId}, which is in no block map`);
    if (!screen.required || screen.noAssessmentMayDependOnThis) {
      throw new Error(`${where}: remediation sends a student to non-required screen ${screenId}`);
    }
  }
  if (remediation.reattemptPermitted !== true) {
    throw new Error(`${where}: § 535.62(b)(7)(C)(i) gates progression on a passing grade, so a student who does not pass must be able to work the exercise again after remediation`);
  }

  /* the optional reflection: offered, never graded, never load-bearing */
  const reflection = spec.optionalReflection;
  if (!reflection || typeof reflection !== "object") throw new Error(`${where}: missing optionalReflection`);
  if (typeof reflection.prompt !== "string" || reflection.prompt.trim() === "") throw new Error(`${where}: optionalReflection needs a prompt`);
  if (reflection.required !== false || reflection.graded !== false || reflection.affectsScore !== false) {
    throw new Error(`${where}: reflective writing stays optional, ungraded and outside the score`);
  }
  if ("points" in reflection) throw new Error(`${where}: optionalReflection carries no points`);
  assertNoLengthKeys(`${where} optionalReflection`, reflection);

  /* instructor review */
  const review = spec.instructorReview;
  if (!review || typeof review !== "object" || typeof review.required !== "boolean" || typeof review.reason !== "string" || review.reason.trim() === "") {
    throw new Error(`${where}: instructorReview must state required (boolean) and a reason`);
  }
  if (tasks.some((task) => task.type === "short-answer") && review.required !== true) {
    throw new Error(`${where}: a scenario with a short-answer task must require instructor review — § 535.65(g)(2)(D) puts the answers and rationale on a qualified instructor`);
  }
  if (criticalCriteria.length > 0 && review.required !== true) {
    throw new Error(`${where}: a scenario with a critical rubric element must require instructor review, because the element is not tradeable for points`);
  }

  const frozen = Object.freeze({
    id,
    title: spec.title,
    placement: Object.freeze({
      afterTopic: placement.afterTopic,
      attributedToTopic: placement.attributedToTopic,
      timeAttribution: placement.timeAttribution,
      unlockRequires: Object.freeze([...placement.unlockRequires]),
    }),
    /* Flat mirrors of the placement, so a coverage report or the assessment validator can read the
       placement without knowing this file's shape. */
    afterTopic: placement.afterTopic,
    courseLevel: placement.timeAttribution === "COURSE_LEVEL",
    minutes: RATES.activityMinutes.scenario,
    assessesTopics: Object.freeze([...spec.assessesTopics]),
    assessesUnits: Object.freeze([...spec.assessesUnits]),
    context: spec.context,
    facts: Object.freeze([...spec.facts]),
    tasks: Object.freeze(tasks),
    totalPoints,
    pointsToPass,
    passingScore: spec.passingScore,
    passingCriteria: Object.freeze({
      pointsToPass,
      of: totalPoints,
      basis: "unweighted points across the tasks, mirroring § 535.65(h)(4)'s 70% for the final examination; a StateCourse design choice, not a Commission-stated scenario threshold",
      criticalCriteria: Object.freeze([...criticalCriteria]),
      criticalCriteriaNote:
        criticalCriteria.length > 0
          ? "These rubric elements are not tradeable for points. A student who reaches the point total while failing one of them has not passed, and the instructor confirms each before the scenario is recorded as passed."
          : "This scenario has no element outside the point total.",
    }),
    remediation: Object.freeze({
      onFailure: remediation.onFailure,
      revisit: Object.freeze([...remediation.revisit]),
      reattemptPermitted: true,
      progressionRule: REGULATORY_BASIS.progressionRule,
    }),
    optionalReflection: Object.freeze({ ...reflection }),
    instructorReview: Object.freeze({ required: review.required, reason: review.reason }),
    referralTasks: Object.freeze(tasks.filter((task) => task.referral === true).map((task) => task.id)),
  });

  assertNoBannedText(where, frozen);
  return frozen;
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 1 — placed after T03 (Duties and Disclosures to Third Parties)

   The estate sale is the fact pattern in which every reflex a student has just learned points the
   wrong way. The seller is exempt from the § 5.008 notice, so the student's instinct is that nothing
   is disclosable. A death occurred in the house, and § 1101.556 is the section every licence holder
   half-remembers as "you never have to disclose a death in Texas." Both instincts fail here for the
   same reason: the exemption and the relief are narrower than their reputations, and neither touches
   the licence holder's own duty under § 1101.652(b)(4). A student who has memorised § 5.008(e) and
   § 1101.556 and cannot apply them will answer this scenario confidently and wrongly.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC1 = scenario("LOA-SC1", {
  title: "An estate sale in Amarillo: the exemption that does not reach you",
  placement: {
    afterTopic: "T03",
    attributedToTopic: "T03",
    timeAttribution: "TOPIC",
    unlockRequires: ["T01", "T02", "T03"],
  },
  assessesTopics: ["T02", "T03"],
  assessesUnits: ["T02U4", "T03U1", "T03U3", "T03U4", "T03U5", "T03U6"],
  context:
    "You are a Texas sales agent sponsored by Llano Estacado Realty, a Potter County brokerage in Amarillo. Your broker is Ruth Ann Delacroix.\n\n" +
    "Eleven days ago you took a listing on a single-family house on Hughes Street. The seller is Curtis Vandermeer, the independent executor of his mother's estate; the house was his mother's homestead and she lived in it alone until her death last year. Curtis has never lived in the house and tells you, accurately, that he knows almost nothing about it.\n\n" +
    "Yesterday two things happened. Curtis emailed you the Potter County fire marshal's report on his mother's death, and an unrepresented buyer walked the house with you and has started asking questions. Every dollar figure below is illustrative and invented so that the arithmetic and the dates are visible; no Texas statute or Commission rule sets a listing price, a fee or a repair cost.",
  facts: [
    "THE PROPERTY: a single-family house on Hughes Street, one dwelling unit, built 1974, listed at $214,900. Curtis is selling it in his capacity as independent executor of his mother's estate. He has never occupied it.",
    "THE FIRE MARSHAL'S REPORT, dated last November and emailed to you yesterday: Curtis's mother died in the house of carbon monoxide poisoning. The report traces the carbon monoxide to a cracked heat exchanger in the original gas furnace and records the death as accidental.",
    "THE FURNACE: the same furnace is still in the house. Nothing has been repaired or replaced, and the utilities are off. You have read the report and you have seen the furnace.",
    "CURTIS'S INSTRUCTION, by email yesterday evening: \"Nobody needs to hear about the furnace or how Mom died. It's an estate sale, we're selling as-is, and my lawyer says the estate doesn't have to fill out a disclosure form. Please don't bring either one up.\"",
    "THE UNREPRESENTED BUYER: Wes Tarrant walked the house with you on Saturday. He has no representation agreement with any broker, has told you he does not want one, and is dealing with you directly. You have made no agreement of any kind with him, orally or in writing.",
    "WES'S QUESTIONS, asked in the kitchen: \"How old is the roof?\" — \"Did anyone die in this house?\" — \"There are three heirs; is the estate actually going to be able to give me clear title?\" — \"Is $214,900 a good buy for this street?\"",
    "WHAT YOU KNOW ABOUT THE ROOF: at the listing appointment Curtis said, \"I think the roof is maybe six or seven years old, but honestly I'm guessing.\" You have not verified it and there is no invoice in the file. You put \"roof approx. 6-7 yrs\" in the marketing remarks without saying where the figure came from.",
    "THE EMAIL YOU HAVE NOT ANSWERED: Wes emailed you at 6:40 p.m. on Saturday 28 November, asking for the survey and the utility averages. You have not replied. The brokerage is closed Sunday and Monday for the holiday weekend.",
    "YOUR BROKER: Ruth Ann is available by phone and email throughout the weekend, and Llano Estacado's written policy requires an agent to bring any disclosure question to her before answering it.",
  ],
  tasks: [
    {
      id: "SC1-T1",
      type: "selection",
      prompt:
        "Curtis's lawyer is right that the estate need not complete the seller's disclosure notice. Apply Property Code § 5.008 and Occupations Code § 1101.652 to these facts and choose the statement that correctly describes what follows from that exemption.",
      choices: [
        "The estate is exempt from the § 5.008 notice under subsection (e)(5), which covers a transfer by a fiduciary in the course of the administration of a decedent's estate, and the exemption is complete as to that notice. It does nothing to your own position: § 1101.652(b)(4) makes it a ground for discipline to fail to disclose to a potential buyer a significant defect known to the licence holder, and you know about the cracked heat exchanger. The exemption is from the seller's statutory notice, not from your disclosure duty.",
        "The estate is exempt under subsection (e)(5), and because § 5.008 is the source of every residential disclosure obligation in Texas, the exemption ends the analysis for the seller and for you alike. Nothing about the furnace has to be volunteered to anyone.",
        "The exemption does not apply, because the house is a single-family dwelling occupied as a homestead until last year and subsection (a) reaches every seller of residential real property comprising not more than one dwelling unit. Curtis must complete the notice, and your duty is to see that he does.",
        "The estate is exempt, but the exemption may be waived, and the safe course is to have Curtis complete the notice anyway and to sign it yourself as the person who assembled the answers, so that the file shows the information was given.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student can hold two duties apart — the seller's statutory notice duty under Property Code § 5.008 and the licence holder's own disclosure duty under Occupations Code § 1101.652(b)(4) — when an exemption removes the first.",
      unitCodes: ["T03U5"],
      teaches: ["t03u5-s1", "t03u5-s2"],
      sources: [
        "Property Code § 5.008(a)",
        "Property Code § 5.008(e)(5)",
        "Occupations Code § 1101.652(b)(3)",
        "Occupations Code § 1101.652(b)(4)",
      ],
      feedbackCorrect:
        "Exactly. Subsection (e) lists eleven transfers the section does not apply to, and the estate-administration exemption is subdivision (5) — the reason an executor selling a parent's house delivers no notice. But § 5.008 imposes a duty on the SELLER. Your duty comes from a different statute with a different addressee: § 1101.652(b)(4) reaches a licence holder who fails to disclose to a potential buyer a significant defect, known to the licence holder, that would be a significant factor to a reasonable and prudent buyer. A cracked heat exchanger that has already killed someone is that defect, and you know about it because you have read the report and seen the furnace.",
      feedbackIncorrect:
        "Ask, for each duty, who it is imposed on. Property Code § 5.008(a) says \"[a] seller … shall give to the purchaser\" a notice; its exemptions in subsection (e) therefore relieve the seller of the seller's duty and nobody else of anything. Occupations Code § 1101.652(b)(4) says nothing about sellers: it reaches a licence holder who fails to disclose a known significant defect to a potential buyer. Two duties, two addressees, one exemption that touches only the first. Note also that you must not complete or sign the notice for a seller in any event — subsection (d) makes it a statement of the seller's own knowledge as of the seller's signature. Review module-03.md, Unit: Section 5.008 of the Texas Property Code (Seller's Disclosure).",
      remediation: "module-03.md#unit-section-5008-of-the-texas-property-code-sellers-disclosure",
    },
    {
      id: "SC1-T2",
      type: "selection",
      prompt:
        "Now apply Occupations Code § 1101.556 to the death itself. Which statement is correct on these facts?",
      choices: [
        "Section 1101.556(2) does not relieve you here. Its relief runs to a death by natural causes, suicide, or accident \"unrelated to the condition of the property,\" and this death was caused by the property's condition, so the qualifier is not satisfied. The condition that caused it is separately a significant defect you know about, which § 1101.652(b)(4) requires you to disclose to a potential buyer — and in any event § 1101.556 removes a duty to inquire or disclose rather than permitting you to answer Wes's question falsely.",
        "Section 1101.556(2) relieves you, because the fire marshal recorded the death as accidental and the subdivision names accident among the three manners of death it covers. You need not disclose the death, and because the furnace is part of the same event you need not raise it either.",
        "Section 1101.556 does not apply at all, because it covers only a previous occupant's AIDS or HIV status; deaths are governed exclusively by Property Code § 5.008(c), from which this estate is exempt, so nothing about the death or the furnace is disclosable.",
        "Section 1101.556 relieves you of the duty to disclose the death, and the relief extends to the cause of the death, because a licence holder cannot be required to disclose the reason for something the statute says need not be disclosed at all.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student applies the qualifier \"unrelated to the condition of the property\" to facts where the property's condition caused the death, and separates the stigma from the condition rather than letting the statute's reputation answer the question.",
      unitCodes: ["T03U6"],
      teaches: ["t03u6-s1"],
      sources: [
        "Occupations Code § 1101.556(2)",
        "Property Code § 5.008(c)",
        "Occupations Code § 1101.652(b)(4)",
        "22 TAC § 535.156",
        "22 TAC § 531.3",
      ],
      feedbackCorrect:
        "That is the whole point of the qualifier. Subdivision (2) covers a death by natural causes, suicide, or accident unrelated to the condition of the property — and the case where the death matters most to a buyer is precisely the case the relief does not reach, because the property's condition produced it. Two further things follow. The cracked heat exchanger is a condition, and conditions are reached by § 1101.652(b)(3) and (b)(4) whatever is true about the death. And § 1101.556 says a licence holder \"is not required to … disclose\"; it does not say a licence holder may misstate. If you tell Wes nobody died here, § 1101.652(b)(2), 22 TAC § 535.156 and 22 TAC § 531.3 are all available to him.",
      feedbackIncorrect:
        "Read subdivision (2) to its last four words. The relief is for a death by \"natural causes, suicide, or accident unrelated to the condition of the property\" — the qualifier modifies the deaths, and a carbon monoxide death produced by a cracked heat exchanger is the opposite of unrelated to the property's condition. Then separate the two things a buyer might be told: the EVENT may sit outside your disclosure duty in an ordinary case, while the CONDITION that produced it is squarely inside § 1101.652(b)(4) whenever you know about it. Finally, do not convert relief from a duty into a licence to answer falsely; the statute removes a requirement and creates no privilege. Review module-03.md, Unit: Stigmatized Properties.",
      remediation: "module-03.md#unit-stigmatized-properties",
    },
    {
      id: "SC1-T3",
      type: "selection",
      prompt:
        "Curtis is your client and he has given you a direct instruction about the furnace and the death. What do you do with the instruction, and why?",
      choices: [
        "You do not carry it out so far as the furnace is concerned. Obedience runs to a client's lawful instructions, and an instruction to withhold a known significant defect from a potential buyer is an instruction to violate § 1101.652(b)(4) and to misrepresent by omission contrary to 22 TAC § 531.3. You take the instruction to Ruth Ann the same day, as the firm's written policy requires, and the file records what you disclosed and when. That the estate is selling as-is changes the contract's repair obligations; it does not change what you must disclose.",
        "You carry it out. A client's instruction on what may be said about the client's own property is the clearest case of the duty of obedience, and the buyer's remedy is the inspection he is free to obtain before closing.",
        "You carry it out, but protect yourself by adding \"sold as-is, buyer to verify all information\" to the marketing remarks, which puts every prospective buyer on notice that nothing in the listing is warranted.",
        "You withdraw from the listing at once and say nothing further to anybody, because continuing to market a house you know to be defective would make you a participant in the concealment.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student recognises the limit of obedience on facts where the unlawful instruction concerns a property defect rather than the discrimination example the module uses, and routes the conflict to the broker instead of resolving it alone.",
      unitCodes: ["T02U4", "T03U4"],
      teaches: ["t02u4-s1", "t03u4-s1"],
      sources: [
        "22 TAC § 535.16(a)",
        "22 TAC § 531.3",
        "Occupations Code § 1101.652(b)(4)",
        "Occupations Code § 1101.652(b)(2)",
        "Business & Commerce Code § 17.46(b)(24)",
      ],
      feedbackCorrect:
        "Obedience is real and it is bounded. The affirmative side sits in 22 TAC § 535.16(a); the boundary is that no client instruction makes unlawful conduct lawful, and \"my seller told me to\" is a confession rather than a defence. Note what the wrong answers get right and then ruin: the buyer does have inspection rights, and an as-is sale is perfectly lawful — but neither displaces a disclosure duty that attaches to what YOU know. A general \"buyer to verify\" line is not a disclosure of a specific known defect, and silence chosen because disclosure would cost the seller the deal is the fact pattern DTPA § 17.46(b)(24) was drafted around.",
      feedbackIncorrect:
        "Two errors produce most wrong answers here. The first is treating obedience as unlimited: it reaches lawful instructions, and an instruction to conceal a known significant defect asks you to violate § 1101.652(b)(4) and § 531.3, which forbids misrepresentation \"by acts of commission or omission.\" The second is treating withdrawal as a cure. Ending the listing does not unknow what you know, does not answer the buyer already in the transaction, and leaves your broker — who is answerable for your conduct — to discover the problem later. Tell the broker, disclose the defect to potential buyers, and document both. Review module-02.md, Unit: Duty to Respond, Fiduciary Duties and Responsibilities, on the limits of obedience, and module-03.md, Unit: Avoiding Disclosure and Misrepresentation Problems.",
      remediation: "module-02.md#unit-duty-to-respond-fiduciary-duties-and-responsibilities",
    },
    {
      id: "SC1-T4",
      type: "computation",
      prompt:
        "Wes emailed you at 6:40 p.m. on Saturday 28 November and has had no reply. Apply 22 TAC § 535.157. Counting the day the message arrived as day zero, so that the two calendar days the rule allows are the two days that follow it, on what day of the month is your response due? Answer with the day of the month as a number.",
      expected: 30,
      tolerance: 0,
      unit: "day of the month",
      points: 3,
      judgement:
        "Whether the student applies a calendar-day rule across a holiday weekend and a month boundary instead of silently converting it to business days, and knows which of the rule's three categories an unrepresented buyer falls into.",
      unitCodes: ["T03U3"],
      teaches: ["t03u3-s1"],
      sources: ["22 TAC § 535.157", "Occupations Code § 1101.551(2)"],
      feedbackCorrect:
        "The 30th. Wes is \"an unrepresented party to a real estate transaction,\" the third of the three categories § 535.157 names, so the duty runs to him although you represent the estate and not him. The rule says two CALENDAR days: from Saturday 28 November the two days are Sunday the 29th and Monday the 30th, and neither the weekend nor the holiday nor the office closure moves it. Two further things the rule does not say, and you should not add: it does not require the response to be in writing, and it does not require the response to resolve anything — a message saying you have the request, that the survey is being pulled, and when you will have it, is a response.",
      feedbackIncorrect:
        "The error here almost always runs one way: the student converts calendar days into business days and answers late. Compare the two rules the Commission wrote side by side — 22 TAC § 535.146(b) sets a trust-money deposit deadline in WORKING days, and § 535.157 sets the response duty in CALENDAR days. The Commission knows how to write \"working day.\" It did not write it here, and the rule says nothing about weekends, holidays or office hours. Count two calendar days from arrival. Note also that the rule leaves the starting point unstated, which is why this task told you the convention to use rather than leaving you to guess it. Review module-03.md, Unit: Define Third Party/Obligations to Third Party/Duty to Respond.",
      remediation: "module-03.md#unit-define-third-partyobligations-to-third-partyduty-to-respond",
    },
    {
      id: "SC1-T5",
      type: "selection",
      prompt:
        "Wes asked you four questions in the kitchen: how old the roof is; whether anyone died in the house; whether the estate can convey clear title with three heirs; and whether $214,900 is a good buy for this street. Choose the response that handles all four correctly.",
      choices: [
        "Give the roof figure with its source attached — that Curtis said six or seven years, that he told you he was guessing, and that you have not verified it. On the death, either decline and explain that Texas law does not require you to inquire about or disclose that information, or answer truthfully with the seller's authorisation; do not deny it, and disclose the furnace regardless. On title, say you cannot answer whether the estate can convey and send him to his own attorney and to the title company. On value, decline: you represent the seller, and an opinion of value is not something you may hand a buyer as though it were a professional valuation.",
        "Answer all four as helpfully as you can. Wes is unrepresented and 22 TAC § 535.156 requires you to convey accurate information to members of the public, so refusing to answer any of his questions would itself be a violation.",
        "Decline all four, citing § 1101.556. Because you owe an unrepresented buyer no fiduciary duty, the safe course is to answer nothing and refer him to the seller for everything.",
        "Answer the first three — the roof figure as you have it, that nobody died in the house so far as you are aware, and that an independent executor has full authority to convey under the will — and decline only the fourth, since value is the one subject a licence holder may never discuss.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student can sort four questions from one unrepresented person into what must be answered accurately, what may be declined, what must be attributed, and what has reached a professional limit and belongs to counsel.",
      unitCodes: ["T03U1", "T03U4"],
      teaches: ["t03u1-s1", "t03u4-s1"],
      sources: [
        "22 TAC § 535.156",
        "22 TAC § 531.3",
        "Occupations Code § 1101.805(e)",
        "Occupations Code § 1101.556",
        "Occupations Code § 1101.652(b)(4)",
        "22 TAC § 535.17",
      ],
      referral: true,
      referralNote:
        "Whether an independent executor can convey clear title where there are three heirs is a legal question about authority to convey. It goes to the buyer's own attorney and to the title company, and a licence holder who answers it has given legal advice.",
      feedbackCorrect:
        "Four questions, four different limits. The roof is a fact you are repeating, so attribute it: attribution converts your assertion into a report of someone else's, which is the ground on which § 1101.805(e) operates, and an unattributed \"roof approx. 6-7 yrs\" in your remarks is your own statement. The death is the one question § 1101.556 lets you decline — and declining is not lying. Title is a legal conclusion about the estate's authority; it belongs to his attorney and the title company, and answering it is the mistake that turns a disclosure problem into an unauthorised practice problem. And value: 22 TAC § 535.17 keeps an opinion of value behind a credential and a prescribed disclaimer, and you act for the seller in any event.",
      feedbackIncorrect:
        "Work the four separately rather than looking for a single posture. Accuracy is owed on every fact you choose to state, which is what 22 TAC § 535.156 and § 531.3 require — but neither compels you to answer a question at all, so \"answer everything\" and \"answer nothing\" are both wrong. The decisive error in the last option is the third answer: telling a buyer that an independent executor has full authority to convey is a legal opinion about the estate's power, and no held source lets a licence holder give it. Refer that one out. Review module-03.md, Unit: Non-Fiduciary Duties, for the catalogue of what you owe a third party, and Unit: Avoiding Disclosure and Misrepresentation Problems, for attribution and referral.",
      remediation: "module-03.md#unit-non-fiduciary-duties",
    },
    {
      id: "SC1-T6",
      type: "short-answer",
      prompt:
        "It is Sunday morning. Set out the note you send Ruth Ann before you answer either Curtis or Wes: what you have concluded, what you propose to do, and what you are not going to decide yourself.",
      rubric: [
        "Identifies that the estate is exempt from the Property Code § 5.008 notice as a transfer by a fiduciary administering a decedent's estate, and states that the exemption does not reach the licence holder's own duty under Occupations Code § 1101.652(b)(4).",
        "Identifies the cracked heat exchanger as a significant defect known to the licence holder that must be disclosed to a potential buyer, and states that Curtis's instruction does not change that.",
        "States that Occupations Code § 1101.556(2) gives no relief on these facts because the death was not unrelated to the condition of the property, and that the section removes a duty rather than permitting a false answer.",
        "Refers to the broker the decision on how and in what form the disclosure is made, and refers to the estate's attorney both whether this transfer is exempt and what the estate's own exposure is — rather than advising Curtis on either.",
        "Records the response owed to Wes Tarrant under 22 TAC § 535.157 and the day it is due, and treats responding as distinct from resolving.",
        "States the position plainly rather than reassuring the client — that the licence holder can say what the provisions require but is not opining on the estate's liability or on the sufficiency of anything the estate signs.",
      ],
      points: 5,
      judgement:
        "Whether the student can assemble the three separate conclusions into an instruction to the broker while keeping the two legal questions — the estate's exemption and the estate's exposure — on the other side of the professional line.",
      unitCodes: ["T03U4", "T03U5"],
      teaches: ["t03u4-s1", "t03u4-s2", "t03u5-s1"],
      sources: [
        "Property Code § 5.008(e)(5)",
        "Occupations Code § 1101.652(b)(4)",
        "Occupations Code § 1101.556(2)",
        "22 TAC § 535.157",
        "22 TAC § 535.2",
      ],
      referral: true,
      referralNote:
        "Whether the transfer is exempt and what the estate risks by staying silent are legal questions about the estate's position. They go to the estate's attorney; the decision on how the disclosure is made goes to the sponsoring broker, whose written policy requires it.",
      feedbackCorrect:
        "That is the whole of the job on a Sunday morning: read the provisions accurately, apply them to the facts you actually have, tell the person who is answerable for your conduct, and hand the legal conclusions to the people whose conclusions they are. Note how little of this is discretionary — the disclosure duty attaches to what you know, the response clock is already running, and the only genuinely open questions are the ones you are referring out.",
      feedbackIncorrect:
        "Three things have to be in the note and two have to be out of it. In: that the § 5.008 exemption does not reach § 1101.652(b)(4); that the cracked heat exchanger is disclosable to potential buyers whatever the client says; and that § 1101.556(2) does not cover a death the property's condition caused. Out: any advice to Curtis about whether the estate is exempt, and any opinion about what the estate risks — both are legal questions for the estate's attorney. And do not lose the clock: § 535.157 runs on Wes's email whether or not the disclosure question is settled. Review module-03.md, Unit: Avoiding Disclosure and Misrepresentation Problems, and Unit: Section 5.008 of the Texas Property Code (Seller's Disclosure).",
      remediation: "module-03.md#unit-avoiding-disclosure-and-misrepresentation-problems",
    },
  ],
  passingScore: 0.7,
  criticalCriteria: [
    "Refers to the broker the decision on how and in what form the disclosure is made, and refers to the estate's attorney both whether this transfer is exempt and what the estate's own exposure is — rather than advising Curtis on either.",
    "Identifies the cracked heat exchanger as a significant defect known to the licence holder that must be disclosed to a potential buyer, and states that Curtis's instruction does not change that.",
  ],
  remediation: {
    onFailure:
      "A student who does not reach the points to pass, or who misses either critical element, is returned to the three instructional screens below with the instructor's written rationale for each task answered wrongly, and works the scenario again. § 535.62(b)(7)(C)(i) gates movement to the next topic on a passing grade, so the reattempt is the mechanism by which the gate is satisfied rather than an indulgence.",
    revisit: ["t03u5-s1", "t03u6-s1", "t03u4-s1", "t03u3-s1"],
    reattemptPermitted: true,
  },
  optionalReflection: {
    prompt:
      "Optional and never graded: think about the moment Curtis's email arrived. What would have made it easier to answer him the same evening — a written firm policy you had read, a rehearsed sentence, a habit of attributing every figure you publish? Write as much or as little as you like; nothing here is scored and nothing is unlocked by it.",
    required: false,
    graded: false,
    affectsScore: false,
  },
  instructorReview: {
    required: true,
    reason:
      "Task SC1-T6 is graded against a rubric of identified provisions and a required referral, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student can reach the point total while still proposing to advise the executor on the estate's exposure, the instructor confirms both critical elements before the scenario is recorded as passed.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 2 — placed after T06 (Representing More Than One Party: Intermediary Brokerage)

   THE 2026 SEQUENCE, AGAINST A CLOCK. Sections 1101.558, 1101.562 and 1101.563 are the most
   consequential change in this course and the first thing a licence holder trained before 1 January
   2026 will get wrong, because the old habits are fast and the new sequence is not. This scenario
   runs one Saturday in real order: a phone call, a sentence said in a driveway, two prospects with
   different postures, a showing, an offer on Monday, and an in-house listing that makes the
   intermediary machinery compulsory rather than optional.

   The discriminator is deliberately NOT "must something be signed before a showing" — that judgement
   belongs to misconception check MC-T05 and is not re-tested here. What is tested is what a licence
   holder does when the two postures are not interchangeable: an oral promise has already destroyed
   the § 1101.562 posture for one prospect and not for the other, the showing-only instrument carries
   two hard limits and cannot grow quietly into representation, only three items may be confirmed in
   the kitchen, and the brokerage's own listing converts the second signature into an intermediary
   problem the broker — not the sales agent — must solve.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC2 = scenario("LOA-SC2", {
  title: "One Saturday in Georgetown: two prospects, one in-house listing",
  placement: {
    afterTopic: "T06",
    attributedToTopic: "T06",
    timeAttribution: "TOPIC",
    unlockRequires: ["T04", "T05", "T06"],
  },
  assessesTopics: ["T05", "T06"],
  assessesUnits: ["T05U1", "T05U3", "T05U5", "T06U2", "T06U3"],
  context:
    "You are a Texas sales agent sponsored by Alicia Ferrer, the broker of San Gabriel Realty in Georgetown, Williamson County. The firm has nine sponsored sales agents.\n\n" +
    "San Gabriel Realty holds the listing on 1907 Serenada Drive, a single-family house. Your colleague Renae Coulter is the listing agent. The listing agreement authorises Alicia to act as an intermediary and to make appointments, and sets out the § 1101.651(d) prohibitions in conspicuous bold print.\n\n" +
    "Today is Saturday 7 March. Two people want to see the house, you have made a different kind of start with each of them, and one of them wants to write an offer on Monday. Every dollar figure below is illustrative and invented so the arithmetic is visible; compensation is not set by law and is fully negotiable, and no Texas statute or Commission rule fixes any rate or figure used here.",
  facts: [
    "THE LISTING: 1907 Serenada Drive, a single-family house, listed at $362,500. At the listing appointment the seller, Marguerite Bowen, told Renae she would take $338,000 to be gone by the end of the school year. Nothing about that figure is in any writing signed by Marguerite.",
    "PROSPECT ONE — TEODORO SALAS. He called you at 8:52 a.m. about the sign. He is not represented and has signed nothing with anybody. In the call you said: \"Come on out at eleven, and don't worry — I'll look after you on this one.\" You then answered three questions about the neighbourhood and told him the sellers \"have been on the market a while.\"",
    "TEODORO'S POSITION: he says he will not sign anything that ties him up, because he may instead buy a lot in Liberty Hill from a builder and does not want to owe two brokers.",
    "PROSPECT TWO — RENATA VILLALOBOS. She emailed at 10:15 a.m. asking to see the house at two o'clock. You have exchanged three emails with her about times and directions and nothing else: no promise about representing her, no opinion about the house, no advice of any kind. She is represented by no one and says she wants to look at several houses before deciding whether to engage anybody.",
    "WHAT RENATA SIGNS: at 2:00 p.m. on Saturday 7 March, before entering the house, Renata signs your broker's written showing agreement for the sole purpose of showing real property under § 1101.562. Alicia's form leaves the termination date blank for the agent to complete.",
    "RENATA'S QUESTIONS IN THE KITCHEN: \"How big is this house?\" — \"Is $362,500 a fair number for this street?\" — \"Should I do the inspection before I spend money on an appraisal?\"",
    "MONDAY: Teodoro calls and asks you to write an offer on Serenada Drive. He is ready to sign whatever your broker needs. He tells you he would go to $356,000 but wants to start at $344,000.",
    "MONDAY, WHAT GETS SIGNED: Teodoro signs San Gabriel Realty's buyer representation agreement. It authorises Alicia to act as an intermediary and to appoint associated licence holders, and states the source of the compensation the broker expects. Marguerite's listing agreement does the same.",
    "THE COMPENSATION TERMS, all illustrative: the listing agreement provides for total compensation to San Gabriel Realty of 5.5 percent of the sales price, of which the listing earmarks 2.5 percent of the sales price for the work done on the buyer's side. Teodoro's buyer representation agreement provides that the broker will receive 3 percent of the sales price, and that the buyer pays the broker the amount, if any, by which that 3 percent exceeds what the broker receives from the seller's side for the buyer's representation.",
    "THE CLOSING: the parties settle and the sale closes at $349,000. San Gabriel Realty receives nothing from any source other than as described above.",
  ],
  tasks: [
    {
      id: "SC2-T1",
      type: "selection",
      prompt:
        "At 10:50 a.m. you are working out what paper each prospect needs before eleven o'clock and two o'clock. Teodoro will not sign a representation agreement, and you consider putting him on the same showing-only form Renata will sign. Which statement is correct about the two prospects?",
      choices: [
        "Renata may be shown the house under a showing agreement for the sole purpose of a § 1101.562 showing, because nothing you have said to her has agreed to represent her and you have given her no opinion or advice. Teodoro may not: § 1101.562(a)(1) requires that the broker has \"not agreed with the party, either orally or in writing, to represent the party,\" and \"I'll look after you on this one\" is an oral agreement to represent, which the subsection counts. For him the honest instrument is a representation agreement under § 1101.563, and signing him to a showing-only form would misstate his status in the box § 1101.563(c)(1)(D) requires.",
        "Both may be shown under the same showing-only form. Section 1101.563 requires a writing and Teodoro has signed nothing, so nothing you said on the telephone has any legal effect on which form he may sign now.",
        "Neither may be shown under a showing-only form, because § 1101.562 is available only where the broker does not hold the listing on the property being shown, and San Gabriel Realty holds this listing.",
        "Both may be shown under the showing-only form, and Teodoro's telephone conversation is cured by having him initial a line acknowledging that you have not agreed to represent him.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student can tell two prospects apart on the § 1101.562(a) conditions — recognising that an oral promise destroys the non-representation posture even though an oral promise could never establish representation under § 1101.563 — rather than treating the showing-only form as the default instrument for anyone who will not sign a representation agreement.",
      unitCodes: ["T05U3", "T05U1"],
      teaches: ["t05u3-s1", "t05u3-s2", "t05u1-s1"],
      sources: [
        "Occupations Code § 1101.562(a)(1)",
        "Occupations Code § 1101.562(a)(2)",
        "Occupations Code § 1101.563(b)",
        "Occupations Code § 1101.563(c)(1)(D)",
      ],
      differsFromMisconception:
        "MC-T05 tests whether a student knows that something written must be in place before a residential showing at all. This task assumes that and tests the next judgement: which of the two instruments each prospect is eligible for, given that an oral promise to look after a buyer satisfies § 1101.562(a)(1) and takes the non-representation posture away.",
      feedbackCorrect:
        "That is the trap the subsection was drafted to catch. Read condition (1) again: the broker must have \"not agreed with the party, either orally or in writing, to represent the party.\" The statute counts oral agreements for the purpose of taking the non-representation posture away from you, while requiring a writing for the purpose of establishing representation. Those two rules point the same direction — say nothing to a prospect about representing them that you are not prepared to reduce to writing. Note also what you did after the sentence: you answered questions about the neighbourhood and volunteered that the sellers had been on the market a while, which is an opinion bearing on their position, so condition (3) is in difficulty as well.",
      feedbackIncorrect:
        "Two errors account for most wrong answers. The first is reading § 1101.562(a)(1) as though it required a written agreement to represent; it says \"either orally or in writing,\" and the whole point of that phrase is that a driveway promise counts. The second is treating an acknowledgement line as a cure: the condition is about what you agreed, not about what a form later says you agreed, and papering over the fact would compound it. On the third option, nothing in § 1101.562 turns on who holds the listing — that is the intermediary question, which arrives later and separately. Review module-05.md, Unit: The Creation of Buyer Agency.",
      remediation: "module-05.md#unit-the-creation-of-buyer-agency",
    },
    {
      id: "SC2-T2",
      type: "computation",
      prompt:
        "Renata signs the showing agreement on Saturday 7 March and asks you to fill in the termination date. Applying the limit in Occupations Code § 1101.563(e)(2), what is the latest date the agreement may state? Answer with the day of the month as a number.",
      expected: 21,
      tolerance: 0,
      unit: "day of the month",
      points: 3,
      judgement:
        "Whether the student reads the fourteen days as an outer limit measured from the date the agreement is entered into, rather than as a default term or as a period measured from some other event.",
      unitCodes: ["T05U1"],
      teaches: ["t05u1-s1", "t05u1-s2"],
      sources: ["Occupations Code § 1101.563(e)(1)", "Occupations Code § 1101.563(e)(2)", "Occupations Code § 1101.563(d)"],
      feedbackCorrect:
        "The 21st. Subsection (e)(2) forbids an agreement entered into for the sole purpose of showing property under § 1101.562 to \"state a termination date more than fourteen days from the date the agreement is entered into,\" and the agreement was entered into on the 7th. Two things to keep with that number. It is a ceiling and not a default: for one Saturday of showings, a term of a day or three days is lawful and cleaner. And subsection (e)(1) forbids the same agreement to be exclusive, so a prospect who signs one is free to walk into another brokerage that afternoon.",
      feedbackIncorrect:
        "Count from the date in the statute. The period runs \"from the date the agreement is entered into\" — not from the first showing, not from the date of first contact, and not from the start of the following week. Add the fourteen days the subsection allows to 7 March. Then notice what the subsection does not do: it sets no minimum term, and it is a maximum rather than a term you must use. Review module-05.md, Unit: Buyer Representation Agreement, on subsections (d) and (e).",
      remediation: "module-05.md#unit-buyer-representation-agreement",
    },
    {
      id: "SC2-T3",
      type: "selection",
      prompt:
        "You are in the kitchen at 1907 Serenada Drive with Renata, showing the house under her § 1101.562 showing agreement. She asks how big the house is, whether $362,500 is a fair number for this street, and whether she should do the inspection before paying for an appraisal. Which response keeps you inside the section?",
      choices: [
        "Confirm the size, and confirm the list price and the seller's stated terms if she asks about those. Decline the other two: § 1101.562(a)(3) forbids you to provide opinions or advice regarding the real property or regarding real estate transactions in general, whether the price is fair is an opinion about the property, and the order in which she should spend money on inspections and appraisals is advice about real estate transactions in general. Say that you cannot give her an opinion while you are showing without representing her, and that advice is available if she wants to discuss a representation agreement with your broker.",
        "Answer all three. Subsection (c) permits a broker showing property under the section to confirm information about the size, price and terms of the property, and a question about what to inspect and when is a question about terms.",
        "Answer the first two and decline the third. Size and price are both expressly permitted by subsection (c), so confirming that the price is a fair one for the street is inside the permission, while inspection sequencing is professional advice that is not.",
        "Decline all three and say nothing at all about the property, because a broker showing property under § 1101.562 may not communicate information about the property to a person the broker does not represent.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student applies the verb in § 1101.562(c) — confirm, not evaluate — and recognises that the second phrase in subsection (a)(3), advice about real estate transactions in general, reaches ordinary practical guidance a helpful agent gives without thinking.",
      unitCodes: ["T05U3"],
      teaches: ["t05u3-s1", "t05u3-s2"],
      sources: ["Occupations Code § 1101.562(a)(3)", "Occupations Code § 1101.562(a)(4)", "Occupations Code § 1101.562(c)"],
      differsFromMisconception:
        "MC-T05 tests what must exist before a showing happens. This task tests what may be said once the showing is under way, which is the § 1101.562(c) permission and the § 1101.562(a)(3) prohibition rather than the § 1101.563(b) trigger.",
      feedbackCorrect:
        "Subsection (c) is a short list and a precise verb: \"may confirm information to a party regarding the size, price, and terms of the real property available for sale or lease.\" Confirming that the price is $362,500 is permitted. Saying the price is fair is an evaluation, and evaluation is what agents do for clients. The most common way licence holders lose the non-representation posture is by answering one friendly question in the hallway, which is why the sentence you use to decline should be decided before the appointment rather than improvised in the kitchen.",
      feedbackIncorrect:
        "Take the two provisions in order. Subsection (a)(3) forbids opinions or advice \"regarding the real property or real estate transactions in general\" — that second phrase is broader than students expect and covers inspection sequencing, market timing and negotiating suggestions. Subsection (c) then carves out three items, and only three: size, price and terms. Whether a price is fair is not one of them; the price is. And the last option overcorrects: the section plainly contemplates that you are in the house answering questions about size, price and terms, so refusing to say anything is neither required nor good practice. Review module-05.md, Unit: The Creation of Buyer Agency.",
      remediation: "module-05.md#unit-the-creation-of-buyer-agency",
    },
    {
      id: "SC2-T4",
      type: "selection",
      prompt:
        "On Monday Teodoro signs San Gabriel Realty's buyer representation agreement and the brokerage now represents both sides of the Serenada Drive transaction. You tell Alicia you will handle Teodoro and Renae will handle Marguerite, and ask her to appoint you both. Which statement correctly describes what the statute requires and permits here?",
      choices: [
        "Alicia must act as intermediary, because § 1101.561(b) makes the posture compulsory once the broker agrees to represent both the buyer and the seller in the transaction, and she may do so because both written consents comply with § 1101.559(a) — consent from each party for the broker to act as intermediary, and the source of the broker's expected compensation stated in the consent. She may then appoint you to Teodoro and Renae to Marguerite, because both consents authorise appointment; but the appointments take effect only when Alicia herself provides written notice of them to all parties, and it is Alicia who appoints, not you and Renae by agreeing between yourselves.",
        "You and Renae may proceed as each other's counterparts without any appointment, because you are working for different clients within the same firm and the appointment mechanism exists only for brokerages too small to separate the two sides.",
        "Alicia may appoint you to both Teodoro and Marguerite to keep the file simple, because § 1101.560(c) permits an appointed licence holder to advise the party to whom the licence holder is appointed and Teodoro and Marguerite have both consented in writing.",
        "Appointments must be made before the written consents are obtained, so that each party knows who will be advising them when they decide whether to consent; a consent obtained after the appointment is ineffective under § 1101.560(b)(1).",
      ],
      correctChoice: 0,
      points: 5,
      judgement:
        "Whether the student can run the intermediary machinery in the right order and attribute each act to the right actor — the broker consents, the broker appoints, the broker notifies — instead of treating appointment as something two sales agents arrange between themselves.",
      unitCodes: ["T06U2", "T06U3"],
      teaches: ["t06u2-s1", "t06u2-s2", "t06u3-s1", "t06u3-s2"],
      sources: [
        "Occupations Code § 1101.561(b)",
        "Occupations Code § 1101.559(a)(1)",
        "Occupations Code § 1101.559(a)(2)",
        "Occupations Code § 1101.560(a)",
        "Occupations Code § 1101.560(b)(1)",
        "Occupations Code § 1101.560(b)(2)",
        "Occupations Code § 1101.560(c)",
      ],
      feedbackCorrect:
        "Four acts, all the broker's. Section 1101.561(b) makes intermediary status follow from the fact of representing both parties rather than from anyone's preference. Section 1101.559(a) states the two conditions and joins them with \"and\" — written consent from each party, and the source of any expected compensation stated in the consent. Section 1101.560(a) puts the appointment in the broker's hands and describes one licence holder for one party and \"another license holder\" for any other. And § 1101.560(b) makes both conditions gates, using the word \"only if\": the consent must authorise the appointment, and the broker must provide written notice of the appointment to all parties involved in the transaction — the broker, in writing, to everyone.",
      feedbackIncorrect:
        "Sort the acts by who performs them. A sales agent never acts as intermediary and never appoints; both are the broker's, because the clients are the broker's clients and § 1101.351(c) confines you to acting for your broker. Two agents agreeing to \"each work our own client\" is not an appointment and produces none of its effects. On the ordering, § 1101.560(a) opens with \"A broker who complies with the written consent requirements of Section 1101.559 may appoint\" — consent first, appointment second, and there is no lawful sequence in the other direction. And one appointee cannot serve both parties: subsection (c) lets an appointee advise the party to whom they are appointed, which is impossible to perform for two parties at once. Review module-06.md, Unit: Intermediary Brokerage, and Unit: Representation of More Than One Party in a Transaction.",
      remediation: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
    },
    {
      id: "SC2-T5",
      type: "computation",
      prompt:
        "The sale closes at $349,000. Under the listing agreement San Gabriel Realty receives total compensation of 5.5 percent of the sales price, of which the listing earmarks 2.5 percent of the sales price for the work done on the buyer's side. Teodoro's buyer representation agreement provides that the broker will receive 3 percent of the sales price and that Teodoro pays the amount, if any, by which that 3 percent exceeds what the broker receives from the seller's side for his representation. How many dollars does Teodoro owe the broker at closing?",
      expected: 1745,
      tolerance: 0.01,
      unit: "dollars",
      points: 4,
      judgement:
        "Whether the student can apply a buyer-side compensation term of the kind § 1101.563(c)(1)(E) requires to be stated — the amount or rate AND how it will be determined — to figures that only reconcile if each percentage is taken on the sales price and the seller-side contribution is netted against the buyer's obligation.",
      unitCodes: ["T05U5", "T05U1"],
      teaches: ["t05u5-s1", "t05u5-s2", "t05u1-s1"],
      sources: [
        "Occupations Code § 1101.563(c)(1)(E)",
        "Occupations Code § 1101.563(c)(2)",
        "Occupations Code § 1101.651(b)",
        "22 TAC § 535.3",
      ],
      feedbackCorrect:
        "$1,745. Three percent of $349,000 is $10,470 — what the broker is to receive for representing Teodoro. From the seller's side the listing earmarks 2.5 percent of $349,000, which is $8,725. Teodoro owes the excess: $10,470 - $8,725 = $1,745. Check the whole against the listing: 5.5 percent of $349,000 is $19,195 to San Gabriel Realty from the seller's side, of which $8,725 is the buyer-side earmark. And note why the agreement had to say all this in the first place: § 1101.563(c)(1)(E) requires the amount or rate AND how it will be determined, so \"to be determined\" is not compliance, and § 1101.563(c)(2) requires the conspicuous statement that compensation is not set by law and is fully negotiable.",
      feedbackIncorrect:
        "Take each percentage on the sales price, one at a time, before you subtract anything. The buyer's agreement fixes what the broker is to receive for representing him: 3 percent of the sales price. The listing fixes what comes from the seller's side for that work: 2.5 percent of the sales price. What the buyer owes is the gap between them, and it is zero if the seller's side covers the whole obligation. The commonest errors are taking a percentage of the wrong base — the list price rather than the sales price, or the total commission rather than the sales price — and forgetting to net the seller-side contribution at all. Review module-05.md, Unit: Written Notification of Compensation to Broker.",
      remediation: "module-05.md#unit-written-notification-of-compensation-to-broker",
    },
    {
      id: "SC2-T6",
      type: "short-answer",
      prompt:
        "Before he signs on Monday, Teodoro asks you to strike the compensation clause from the broker's form and to add a sentence saying he owes nothing if he buys a lot from a builder in Liberty Hill. He also asks whether the showing agreement he nearly signed on Saturday would have \"locked him in.\" Set out what you tell him and what you do.",
      rubric: [
        "States that the licence holder does not strike or add contract language, and identifies 22 TAC § 537.11(b) as forbidding a licence holder to draft or recommend language defining or affecting the rights, obligations or remedies of the principals to a real estate transaction.",
        "Refers the requested change to the broker's form and to Teodoro's own attorney, rather than negotiating the wording with him or telling him what the change would mean legally.",
        "Answers the showing-agreement question accurately from § 1101.563(e): such an agreement may not be exclusive and may not state a termination date more than fourteen days out, so it could not have tied him to the brokerage.",
        "Identifies that a compensation term must state the amount or rate and how it will be determined under § 1101.563(c)(1)(E), and that the agreement must disclose in conspicuous language that broker compensation is not set by law and is fully negotiable under § 1101.563(c)(2).",
        "Identifies that a written agreement entered into for the sole purpose of showing does not upgrade itself, and that § 1101.563(d) requires a separate agreement before further acts of real estate brokerage are performed for the buyer.",
        "Takes the request to the sponsoring broker rather than deciding alone whether the firm's form can be varied.",
      ],
      points: 5,
      judgement:
        "Whether the student can answer the questions a licence holder may answer — what the statute requires an agreement to contain and what it forbids a showing-only agreement to do — while refusing the one thing the request actually asks for, which is drafting.",
      unitCodes: ["T05U1", "T05U5"],
      teaches: ["t05u1-s1", "t05u1-s2", "t05u5-s1"],
      sources: [
        "22 TAC § 537.11(b)",
        "Occupations Code § 1101.563(c)(1)(E)",
        "Occupations Code § 1101.563(c)(2)",
        "Occupations Code § 1101.563(d)",
        "Occupations Code § 1101.563(e)",
      ],
      referral: true,
      referralNote:
        "Striking a clause and adding a carve-out is drafting contract language that affects the parties' rights. It goes to the broker, whose form it is, and to the buyer's own attorney; a licence holder who redlines it has practised law contrary to 22 TAC § 537.11(b).",
      feedbackCorrect:
        "The line here is clean and worth rehearsing. You may tell a buyer what the statute requires the agreement to contain and what it forbids it to do — those are facts about the law that the Legislature put in the agreement for the buyer's benefit. You may not write the clause he wants, recommend wording, or tell him what a variation would do to his rights. The Commission does not promulgate a buyer representation form, so the form is your broker's, drawn by an attorney or a trade association; a buyer who wants it changed needs a lawyer, and saying so is the professional answer rather than an evasion.",
      feedbackIncorrect:
        "Separate the two halves of what he asked. The showing-agreement question is answerable: § 1101.563(e) makes such an agreement non-exclusive and caps its term, so it could not have locked him in, and § 1101.563(d) is why it could not have grown into representation without a separate agreement. The drafting request is not answerable by you at all: 22 TAC § 537.11(b) forbids a licence holder to draft or recommend contract language defining or affecting the rights, obligations or remedies of the principals. Route it to your broker and to his attorney, and do not explain what the change would mean — that explanation is the advice the rule forbids. Review module-05.md, Unit: Buyer Representation Agreement.",
      remediation: "module-05.md#unit-buyer-representation-agreement",
    },
  ],
  passingScore: 0.7,
  criticalCriteria: [
    "States that the licence holder does not strike or add contract language, and identifies 22 TAC § 537.11(b) as forbidding a licence holder to draft or recommend language defining or affecting the rights, obligations or remedies of the principals to a real estate transaction.",
    "Refers the requested change to the broker's form and to Teodoro's own attorney, rather than negotiating the wording with him or telling him what the change would mean legally.",
  ],
  remediation: {
    onFailure:
      "A student who does not reach the points to pass, or who misses either critical element, is returned to the screens below with the instructor's written rationale for each task answered wrongly, and works the scenario again. The buyer-side sequence is the part of this course a licence holder will meet first in practice, so the remediation is the whole sequence rather than the single task missed.",
    revisit: ["t05u1-s1", "t05u3-s1", "t05u3-s2", "t05u5-s1", "t06u2-s1", "t06u3-s1"],
    reattemptPermitted: true,
  },
  optionalReflection: {
    prompt:
      "Optional and never graded: write the sentence you will actually say in a kitchen when someone asks whether a price is fair and you are showing without representing them. Then write the sentence you will say at 8:52 a.m. instead of \"I'll look after you.\" Nothing here is scored and nothing is unlocked by it.",
    required: false,
    graded: false,
    affectsScore: false,
  },
  instructorReview: {
    required: true,
    reason:
      "Task SC2-T6 is graded against a rubric that includes a required refusal to draft, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student may reach a passing point total while still offering to redline the broker's form, the instructor confirms both critical elements before the scenario is recorded as passed. The instructor also reviews any computation answered within tolerance by visibly wrong method.",
  },
});
