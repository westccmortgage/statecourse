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
 *     TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. This course is not TREC-approved, and no Texas
 *     qualifying credit may be offered for it.
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
    "TREC-published reproduction of 22 TAC ch. 535 (TIER 4). The codified Secretary of State text is unread; TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. This course is not TREC-approved, and no Texas credit is offered for it.",
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

/**
 * Nothing authored here may describe this course as approved. The scan is NEGATION-AWARE, in the
 * same way tests/texas-law-of-agency.test.mjs's is and for the same reason: the required disclaimer
 * is itself a sentence containing the phrase, so what matters is whether the phrase is asserted or
 * denied. A match preceded by a negation inside the same clause is the disclaimer doing its job.
 */
const APPROVAL_CLAIM = /\btrec[-\s]approved\b|\bapproved by (?:the )?trec\b|\bapproved by the commission\b|\btexas credit is available\b|\bearn texas credit\b/gi;
const NEGATED_BEFORE = /\b(?:not|no|never|cannot|is not|does not|without)\b[^.]{0,80}$/i;

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
    for (const match of text.matchAll(APPROVAL_CLAIM)) {
      const before = text.slice(Math.max(0, match.index - 90), match.index);
      if (!NEGATED_BEFORE.test(before)) {
        throw new Error(`${where}: ${path || "text"} claims an approval this course does not hold`);
      }
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

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 3 — placed after T09 (Employment Issues)

   This scenario puts the student in the broker's chair, because every provision in T09 is written to
   the broker and a sales agent who has only ever read them from the other side misapplies them. The
   week is ordinary: a team leader who has been leading a team for a month without a written
   delegation, an unlicensed assistant doing three things of which one is lawful, an agent who has
   earned compensation and then changed brokerages, a listing that expired unsold, and a question
   about independent contractor status that is not a real estate question at all.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC3 = scenario("LOA-SC3", {
  title: "A week at a Beaumont brokerage: supervision, assistants and where the money goes",
  placement: {
    afterTopic: "T09",
    attributedToTopic: "T09",
    timeAttribution: "TOPIC",
    unlockRequires: ["T07", "T08", "T09"],
  },
  assessesTopics: ["T09"],
  assessesUnits: ["T09U1", "T09U2", "T09U4", "T09U5", "T09U6"],
  context:
    "You are Marguerite Devereaux, the sponsoring broker of Neches Bend Realty, a fourteen-agent brokerage in Beaumont, Jefferson County. You are also the designated broker of the licensed business entity through which the firm operates.\n\n" +
    "Five things have arrived in one week, and each of them is a question about somebody else's money or somebody else's authority. Every dollar figure below is illustrative and invented to make the arithmetic visible; compensation is not set by law and is fully negotiable, and no Texas statute or Commission rule fixes a commission rate, a split or a wage used here.",
  facts: [
    "THE DELEGATION: on 6 April you put your agent Corinne Adjei in charge of the firm's four-person Lakeside Team. She assigns their leads, reviews their contract work and answers their questions. You expect the arrangement to run through the end of the year. You told her so in a corridor conversation and nothing has been written down.",
    "THE ASSISTANT: Trey Okafor is not licensed and is paid an hourly wage by the agent he works for, Yolanda Ferris, out of her own pocket. This week Yolanda asked him to do three things: drive to the firm's Calder Avenue listing and unlock it so a prospective buyer could walk through while she finished a closing; answer her business line and, after telling the caller he is her administrative assistant, confirm the advertised square footage, list price and the seller's requested closing date; and telephone eleven owners whose listings with other firms have expired to ask whether they would like to relist.",
    "THE ASSISTANT'S PROPOSED BONUS: Yolanda wants to add $500 to Trey's pay for every transaction that closes from a lead he brings in. She has not asked you about any of it.",
    "THE DEPARTING AGENT: Yolanda earned her compensation on a Calder Avenue-area purchase while sponsored by you. Two weeks before the closing she terminated her sponsorship with Neches Bend and moved to another Beaumont brokerage. The sale closed at $326,000. The listing broker's written offer of compensation to the buyer's broker is 2.75 percent of the sales price, and Yolanda's sponsorship agreement with Neches Bend gave her 60 percent of what the firm received on a transaction she originated.",
    "WHAT YOLANDA HAS ASKED FOR: she has emailed the listing broker directly asking that her share be paid to her by cheque, since she no longer works for you.",
    "THE EXPIRED LISTING: the firm's listing at 4402 Calder Avenue expired unsold on 14 November 2026. The seller did not relist. The file holds the listing agreement, the seller's disclosures, and eight weeks of text messages between the listing agent and the seller about price reductions and a roof estimate.",
    "THE INDEPENDENT CONTRACTOR QUESTION: Corinne has read her written agreement with the firm, which describes her as an independent contractor, and has emailed you three questions — whether that means the firm owes her nothing at all beyond commissions, whether she can be treated as an employee for the purpose of the firm's health plan while remaining a contractor for tax, and whether your supervision of the Lakeside Team endangers her status.",
    "THE FIRM'S POLICIES: Neches Bend maintains written policies and procedures, last revised in 2019. Two of the firm's agents took their first-ever listings this month and have had no coaching from anyone.",
  ],
  tasks: [
    {
      id: "SC3-T1",
      type: "computation",
      prompt:
        "Apply 22 TAC § 535.2(e) to Corinne's delegation, which began on 6 April and is anticipated to last through the end of the year. Assuming the delegation is put in writing on the day it began, on what day of the month does the period for providing her name to the Commission end? Answer with the day of the month as a number.",
      expected: 6,
      tolerance: 0,
      unit: "day of the month",
      points: 3,
      judgement:
        "Whether the student applies the notification period to a delegation that is anticipated to last more than three consecutive months, rather than waiting to see whether it actually does, and knows the period runs from the delegation and not from the end of the three months.",
      unitCodes: ["T09U5"],
      teaches: ["t09u5-s1", "t09u5-s2"],
      sources: ["22 TAC § 535.2(e)"],
      feedbackCorrect:
        "The 6th — of the following month, thirty days from 6 April. The subsection requires the broker to provide the name of each delegated supervisor to the Commission \"within 30 days of any such delegation that has lasted or is anticipated to last more than three consecutive months,\" and the two limbs matter: a delegation you expect to run through the year is inside the rule on the day it is made, so nothing waits for three months to elapse. The same thirty days runs again after the delegation ends. And note the sentence before it — any licence holder who leads, supervises, directs or manages a team must be delegated as a supervisor, and the delegation must be in writing, so a corridor conversation has not started this clock at all.",
      feedbackIncorrect:
        "Read the two limbs of the trigger: a delegation \"that has lasted or is anticipated to last more than three consecutive months.\" The second limb is satisfied the moment the delegation is made, on facts where the broker expects it to run through the year, so the thirty days does not begin at the end of a three-month waiting period. Count thirty days from the date of the delegation. Then note the separate defect in these facts: the delegation must be in writing, and it is not. Review module-09.md, Unit: Broker Responsibility (Relationships between Brokers and Agents, §535.2).",
      remediation: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
    },
    {
      id: "SC3-T2",
      type: "selection",
      prompt:
        "Take Trey Okafor's three tasks and his proposed bonus together. Which statement is correct?",
      choices: [
        "Unlocking the Calder Avenue listing for a prospective buyer is showing property under 22 TAC § 535.4(c), which defines showing to include unlocking or providing access for a prospective buyer, so it requires a licence. Telephoning owners of expired listings to ask about relisting is soliciting listings under § 535.4(f), which also requires a licence. Confirming the advertised size, price and terms to a caller, after identifying himself as an administrative assistant, sits inside § 535.5(g) and requires no licence. The proposed $500 per closing fails: 22 TAC § 535.147(a) reaches a payee who both engages in acts for which a licence is required and is not actively licensed, and § 1101.651(a) forbids a broker to pay or otherwise compensate, directly or indirectly, a person who is not a licence holder for performing an act of a broker.",
        "All three tasks are lawful for an unlicensed assistant provided he gives no opinions and answers no questions beyond what he is told to say, because the licensing requirement attaches to negotiating rather than to physical acts. The bonus is lawful because it is paid by Yolanda personally rather than by the brokerage.",
        "Only the telephone call to expired listings requires a licence. Unlocking a door is a ministerial act, and § 535.4(c) reaches hosting an open house rather than admitting a single buyer by appointment. The bonus is lawful because Trey brings in the lead but does not negotiate.",
        "All three tasks require a licence, including the telephone confirmation, because § 535.5(g) applies only to a licensed answering service and not to an employee of a sales agent. The bonus is lawful once the brokerage, rather than the agent, pays it.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student sorts three concrete tasks against the definition of showing in § 535.4(c) and the narrow permission in § 535.5(g), and sees that a payment contingent on a closing is caught by two provisions no matter whose pocket it comes out of.",
      unitCodes: ["T09U4"],
      teaches: ["t09u4-s1", "t09u4-s2"],
      sources: [
        "22 TAC § 535.4(c)",
        "22 TAC § 535.4(f)",
        "22 TAC § 535.5(g)",
        "22 TAC § 535.147(a)",
        "22 TAC § 535.3",
        "Occupations Code § 1101.651(a)",
      ],
      feedbackCorrect:
        "The definition is the whole of the first answer: to \"show\" a property includes \"causing or permitting the property to be viewed by a prospective buyer or tenant, unlocking or providing access onto or into a property for a prospective buyer or tenant, and hosting an open house at the property.\" Unlocking is named. Section 535.5(g) is the clearest permission in the rules and every element of it is load-bearing — the person must be identified to callers as clerical or administrative, the information must be a confirmation of size, price and terms, and the property must have been advertised. On the money, note two things: § 1101.651(a) reaches compensation \"directly or indirectly,\" and 22 TAC § 535.3 independently requires your written consent before a sales agent pays valuable consideration to anyone.",
      feedbackIncorrect:
        "Start from the rule's own definition rather than from what the word \"show\" sounds like: § 535.4(c) names unlocking and providing access alongside hosting an open house, so admitting one buyer by appointment is inside it. Then read § 535.5(g) element by element and notice that it fits the telephone confirmation exactly — that is the one lawful task here. On the bonus, the source of the money does not save it: § 535.147(a) turns on what the payee does and whether the payee is licensed, and § 1101.651(a) reaches indirect compensation, so routing it through the agent or through the brokerage changes nothing. Review module-09.md, Unit: Employment and Compensation of Personal Assistants.",
      remediation: "module-09.md#unit-employment-and-compensation-of-personal-assistants",
    },
    {
      id: "SC3-T3",
      type: "computation",
      prompt:
        "The purchase Yolanda originated closed at $326,000. The listing broker's written offer of compensation to the buyer's broker is 2.75 percent of the sales price, and Yolanda's sponsorship agreement gave her 60 percent of what the firm received on a transaction she originated. How many dollars is Yolanda's share?",
      expected: 5379,
      tolerance: 0.01,
      unit: "dollars",
      points: 3,
      judgement:
        "Whether the student takes the offered compensation on the sales price and then applies the split to what the FIRM received, rather than applying the split to the sales price or to some other base.",
      unitCodes: ["T09U6"],
      teaches: ["t09u6-s1", "t09u6-s2"],
      sources: ["Occupations Code § 1101.651(b)", "22 TAC § 535.3"],
      feedbackCorrect:
        "$5,379. The compensation to the buyer's broker is 2.75 percent of $326,000, which is $8,965 — and note who receives it: the BROKER, not the agent. Yolanda's 60 percent is then taken on what the firm received, so 0.60 x $8,965 = $5,379, and the firm retains $3,586. The order matters because the split is a term of a sponsorship agreement between a broker and a sales agent, and it operates on the brokerage's compensation rather than on the sale.",
      feedbackIncorrect:
        "Work it in two steps and check the base of each. Step one: the offer of compensation is a percentage of the SALES PRICE and it is paid to the broker. Step two: the split is a percentage of what the BROKER received, not of the sales price — applying 60 percent to $326,000 produces a number larger than the whole commission, which is the check that catches this error. Review module-09.md, Unit: Compensation Issues.",
      remediation: "module-09.md#unit-compensation-issues",
    },
    {
      id: "SC3-T4",
      type: "selection",
      prompt:
        "Yolanda has asked the listing broker to pay her share directly, because she is no longer sponsored by you. How is she lawfully paid, and what has to exist first?",
      choices: [
        "The listing broker may not pay her at all. Occupations Code § 1101.651(b) permits a sales agent to accept compensation for a real estate transaction only from the broker sponsoring the sales agent or the broker who was sponsoring the sales agent when the compensation was earned, so payment runs to Neches Bend and from Neches Bend to Yolanda; and 22 TAC § 535.3 requires the written consent of her sponsoring broker or of the broker who sponsored her when she became entitled to it, which on these facts is you.",
        "The listing broker may pay her directly, because she earned the compensation personally and § 1101.651(b) restricts only the broker that is currently sponsoring her; her move to another firm ended your authority over the payment.",
        "Her new sponsoring broker must be paid and must then pay her, because a sales agent may be paid only through the broker sponsoring her at the time payment is made, and Neches Bend has no remaining claim to a transaction that closed after she left.",
        "She forfeits the compensation. A sales agent who terminates a sponsorship before closing has not completed the transaction, and § 1101.651(b) provides no route by which a former sponsoring broker may pay a departed agent.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student reads § 1101.651(b) to its second limb — the broker who WAS sponsoring the agent when the compensation was earned — instead of stopping at the first and producing a rule that would make a change of brokerage forfeit earned compensation.",
      unitCodes: ["T09U6"],
      teaches: ["t09u6-s1", "t09u6-s2"],
      sources: [
        "Occupations Code § 1101.651(a)",
        "Occupations Code § 1101.651(b)",
        "Occupations Code § 1101.651(c)",
        "22 TAC § 535.3",
        "22 TAC § 535.2(i)",
      ],
      feedbackCorrect:
        "The clause students drop is the one that solves the problem: a sales agent may not accept compensation \"from a person other than the broker that is sponsoring the sales agent or was sponsoring the sales agent when the sales agent earned the compensation.\" Both brokers are permitted payers; the listing broker is neither. Section 535.3 then adds the paperwork, and it too anticipates the change of firms by naming two possible consenting brokers. Keep the neighbouring provisions in view: § 1101.651(a) bars a broker from compensating anyone who is not a licence holder, and § 1101.651(c) confines a sales agent's own payments to a person to the broker sponsoring her at that time.",
      feedbackIncorrect:
        "Any reading of § 1101.651(b) that stops after \"the broker that is sponsoring the sales agent\" states a different and wrong rule, because it would make it impossible for an agent who changes brokerages to be paid on a transaction earned at the old firm. Read the rest of the sentence. Then ask who is permitted to pay at all: the compensation moves broker to broker and broker to agent, and a listing broker paying a sales agent at another firm is outside the section however the cheque is described. Review module-09.md, Unit: Compensation Issues.",
      remediation: "module-09.md#unit-compensation-issues",
    },
    {
      id: "SC3-T5",
      type: "selection",
      prompt:
        "The Calder Avenue listing expired unsold on 14 November 2026 and the seller did not relist. Your office manager asks whether the file can be closed out and the text messages deleted. Which answer is correct?",
      choices: [
        "No. 22 TAC § 535.2(h) requires the broker to maintain the listed record categories in a format readily available to the Commission for at least four years from the date of closing, termination of the contract, or end of the real estate transaction — here 14 November 2026, so until 14 November 2030. The listing agreement is a commission agreement, the seller's disclosures are disclosures, and the eight weeks of texts about price and a roof estimate are substantive communications with a party to the transaction; all three categories are named in the rule, and the only excuse it recognises for missing records is destruction by an Act of God not intentionally caused by the broker.",
        "Yes, once the listing has expired. The four years run from the date a transaction closes, and a listing that produced no closing produced no transaction, so nothing in § 535.2(h) attaches to it.",
        "The listing agreement and the disclosures must be kept until 14 November 2030, but the text messages may be deleted, because § 535.2(h) reaches formal documents and an informal exchange between an agent and a client is not a record of the transaction.",
        "Everything must be kept until 14 November 2030, and the four years may be shortened only if the seller consents in writing to the destruction of the file.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student applies the retention rule to a listing that never closed, using the correct one of the three triggers the rule names, and recognises text messages as substantive communications rather than as informal correspondence outside the rule.",
      unitCodes: ["T09U5"],
      teaches: ["t09u5-s1", "t09u5-s2"],
      sources: ["22 TAC § 535.2(h)"],
      feedbackCorrect:
        "Three triggers, and you use whichever one the facts supply: \"the date of closing, termination of the contract, or end of a real estate transaction.\" A listing that expires unsold ends on the day it expires, and the four years run from then. The eight categories are worth knowing as a list, because two of them catch people out: \"substantive communications with parties to the transaction\" reaches texts and emails, and \"commission agreements such as listing agreements, buyer representation agreements, or other written agreements relied upon to claim compensation\" reaches an agreement that produced no commission at all.",
      feedbackIncorrect:
        "The rule does not run only from closing. It names three events and uses whichever occurs — closing, termination of the contract, or end of the transaction — so an expired listing starts its own four years. And do not read the categories narrowly: substantive communications with parties are expressly listed, and the medium is irrelevant. Note also the single excuse the rule recognises for missing records, which is destruction by an Act of God not intentionally caused by the broker; a client's consent is not among them. Review module-09.md, Unit: Broker Responsibility (Relationships between Brokers and Agents, §535.2).",
      remediation: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
    },
    {
      id: "SC3-T6",
      type: "short-answer",
      prompt:
        "Answer Corinne's three questions — whether independent contractor status means the firm owes her nothing beyond commissions, whether she can be an employee for the health plan while remaining a contractor for tax, and whether your supervision of the Lakeside Team endangers her status. Say what you tell her, and what you do not answer.",
      rubric: [
        "States that a sales agent's independent contractor status for tax or unemployment compensation purposes does not reduce the broker's supervision duty or the broker's responsibility for the agent's authorised acts, citing 22 TAC § 535.2 and Occupations Code § 1101.803.",
        "Identifies at least two obligations the firm owes Corinne regardless of the label — such as the written notice of the scope of her authorised activities, the response within two calendar days under § 535.2(j), delivery of Commission correspondence within three calendar days under § 535.2(k), or the coaching required the first three times an agent performs a type of activity under § 535.2(i).",
        "States that each authority in this area serves one limited purpose, so a conclusion under one — unemployment compensation, federal tax treatment, or discrimination law — does not decide the others.",
        "Refers the tax and employee-benefit characterisation to the firm's own legal or tax adviser rather than answering it, and says plainly that the broker is not giving tax or legal advice.",
        "Answers the supervision question directly: supervision does not endanger the status, and the broker could not lawfully reduce supervision to protect it in any event.",
        "Identifies the two defects in the firm's own house that this email exposes — the delegation that is not in writing and the policies last revised in 2019, which 22 TAC § 535.2(i) requires to be maintained on a current basis — and states what will be done about each.",
      ],
      points: 5,
      judgement:
        "Whether the student can answer the brokerage-law half of a mixed question, refuse the tax and employment-law half, and recognise that the question has exposed two compliance defects of the broker's own.",
      unitCodes: ["T09U1", "T09U2"],
      teaches: ["t09u1-s1", "t09u2-s1"],
      sources: [
        "22 TAC § 535.2",
        "22 TAC § 535.2(i)",
        "22 TAC § 535.2(j)",
        "22 TAC § 535.2(k)",
        "Occupations Code § 1101.803",
        "Labor Code § 201.072",
      ],
      referral: true,
      referralNote:
        "Whether a person may be an employee for a benefit plan while remaining a contractor for tax is an employment and tax characterisation question. It goes to the firm's own legal or tax adviser; a broker who answers it is advising on a subject outside the licence.",
      feedbackCorrect:
        "The discipline here is keeping the word \"employment\" in its two senses apart. In the law of agency it means an engagement — the seller employs the broker. In Labor Code chapter 201 and in the federal tax provisions it carries consequences that have nothing to do with brokerage supervision, and § 535.2 closes by saying in terms that the section is not meant to create or require an employer/employee relationship between a broker and a sponsored sales agent. So supervision is safe, the obligations you owe her are real and enumerated, and the tax and benefits question is somebody else's to answer.",
      feedbackIncorrect:
        "Answer the question you are competent to answer and refer the rest. The brokerage-law half is settled: § 535.2 imposes the supervision duties whatever the label, § 1101.803 makes you liable for conduct by a sales agent associated with or acting for you, and several of the rule's requirements run TO the agent — the written scope notice, the two-calendar-day response, the three-calendar-day delivery of Commission correspondence, the coaching the first three times. The tax and benefits half is not yours; each authority in this area serves one limited purpose, and a conclusion under one does not travel to another. Review module-09.md, Unit: Independent Contract Agreements, and Unit: Employment Law.",
      remediation: "module-09.md#unit-independent-contract-agreements",
    },
  ],
  passingScore: 0.7,
  criticalCriteria: [
    "Refers the tax and employee-benefit characterisation to the firm's own legal or tax adviser rather than answering it, and says plainly that the broker is not giving tax or legal advice.",
    "Answers the supervision question directly: supervision does not endanger the status, and the broker could not lawfully reduce supervision to protect it in any event.",
  ],
  remediation: {
    onFailure:
      "A student who does not reach the points to pass, or who misses either critical element, is returned to the screens below with the instructor's written rationale for each task answered wrongly, and works the scenario again. Where the failure is on SC3-T2 or SC3-T4 the instructor also assigns the two statute readings, because both errors are errors of reading a rule to its second clause rather than errors of judgement.",
    revisit: ["t09u5-s1", "t09u5-s2", "t09u4-s1", "t09u6-s1", "t09u1-s1"],
    reattemptPermitted: true,
  },
  optionalReflection: {
    prompt:
      "Optional and never graded: you have just found two defects in your own brokerage while answering somebody else's question. Which of the two would you fix first, and what would you have to stop doing this week to fix it? Nothing here is scored and nothing is unlocked by it.",
    required: false,
    graded: false,
    affectsScore: false,
  },
  instructorReview: {
    required: true,
    reason:
      "Task SC3-T6 is graded against a rubric that includes a required referral of a tax and employment-law question, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student may reach a passing point total while confidently answering the benefits question, the instructor confirms both critical elements before the scenario is recorded as passed.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 4 — placed after T11 (Deceptive Trade Practices and Consumer Protection Act)

   The DTPA is the topic where a licence holder's instincts are worth least. The exemption written
   for brokers reads like immunity and is not; the buyer who never signed anything with you and never
   paid you a dollar is nonetheless a consumer who can sue you; the multiplier's base changes with a
   finding about your state of mind that a jury may infer from your own file; and the cheapest exit
   in the statute closes thirty days after a letter arrives. This scenario walks one claim from the
   sentence that caused it to the decision that has to be made in the first week.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC4 = scenario("LOA-SC4", {
  title: "A Longview listing, a sentence in the remarks, and a demand letter",
  placement: {
    afterTopic: "T11",
    attributedToTopic: "T11",
    timeAttribution: "TOPIC",
    unlockRequires: ["T10", "T11"],
  },
  assessesTopics: ["T11"],
  assessesUnits: ["T11U1", "T11U2", "T11U3", "T11U4", "T11U5"],
  context:
    "You are a Texas sales agent sponsored by Pine Tree Realty in Longview, Gregg County. Eighteen months ago you listed and sold a house on Whaley Street.\n\n" +
    "The buyer was represented by an agent at another brokerage. You never met her alone, she signed nothing with you, and she paid you nothing. A letter from her lawyer arrived this morning. Every dollar figure below is illustrative and invented so the arithmetic is visible; the statutory thresholds and multipliers identified as such are the statute's own.",
  facts: [
    "THE LISTING: a single-family house on Whaley Street, sold to Adaeze Nwosu for $268,000. She bought it to live in and has lived in it since closing.",
    "WHAT THE SELLER TOLD YOU: at the listing appointment the seller said the house \"has never taken water.\"",
    "WHAT YOU PUBLISHED: you wrote in the marketing remarks, in writing and without attribution, \"Never flooded. Not in a flood zone.\" You did not look at a flood map, did not ask for an elevation certificate, and gave nobody any written notice that you were relying on anything the seller had told you.",
    "WHAT WAS IN YOUR FILE: a copy of the seller's flood insurance renewal notice, which you had collected with the utility bills at the listing appointment and never read.",
    "WHAT HAPPENED: four months after closing the house took eleven inches of water in a storm. Ms. Nwosu was not represented by legal counsel when she negotiated the purchase, and no lawyer was involved on her side at any point before this letter.",
    "THE DEMAND LETTER, received on 8 September: it advises you in reasonable detail of her specific complaint and states economic damages of $28,000, damages for mental anguish of $16,000, and attorneys' fees reasonably incurred to date in asserting the claim of $4,200.",
    "IF THE CASE IS TRIED, ASSUME: the trier of fact finds economic damages of $28,000 and mental anguish of $16,000, and the court finds reasonable and necessary attorneys' fees of $54,000 and court costs of $3,600.",
    "YOUR BROKER'S FIRST REACTION, by telephone this morning: \"We're exempt — she has a written contract, it was well over a hundred thousand dollars, and the statute exempts brokers anyway. Call her and tell her she has no claim, then we can all stop worrying.\"",
  ],
  tasks: [
    {
      id: "SC4-T1",
      type: "selection",
      prompt:
        "Test your broker's two exemption arguments against Business & Commerce Code § 17.49. Which statement is correct?",
      choices: [
        "Neither argument works. The broker exemption in § 17.49(i) covers a claim against a licence holder arising from an act or omission while acting as one, but it does not apply to an express misrepresentation of a material fact that cannot be characterised as advice, judgment or opinion — and \"Never flooded. Not in a flood zone.\" is a factual assertion, not an opinion. The written-contract exemption in § 17.49(f) has three conditions joined by \"and\": the consideration exceeds $100,000 here, but Ms. Nwosu was not represented by legal counsel in negotiating the contract, and the contract involves her residence, so two of the three fail.",
        "Both arguments work. Section 17.49(i) exempts claims against licence holders without qualification, and § 17.49(f) exempts any claim arising out of a written contract involving consideration of more than $100,000, which this transaction plainly was.",
        "The § 17.49(i) exemption fails but § 17.49(f) succeeds, because the residence condition in § 17.49(f)(3) asks whether the property is a residence rather than whether it is the consumer's own, and a single-family house is a residence in either case.",
        "Both arguments fail, but for a different reason: § 17.49(i) and § 17.49(f) apply only where the defendant is the party to the written contract, and a listing agent is not a party to the sale contract at all.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student can run a claim against the two exemptions a licence holder will reach for first, applying the carve-out in § 17.49(i) to a specific published sentence and the three conjunctive conditions of § 17.49(f) to the facts rather than to the dollar figure alone.",
      unitCodes: ["T11U4"],
      teaches: ["t11u4-s1", "t11u4-s2"],
      sources: [
        "Business & Commerce Code § 17.49(i)",
        "Business & Commerce Code § 17.49(f)",
        "Business & Commerce Code § 17.45(12)",
        "Business & Commerce Code § 17.46(b)(24)",
      ],
      feedbackCorrect:
        "The general rule in § 17.49(i) genuinely does exempt licence holders, and every real case lives in the carve-outs. Carve-out (1) has four conditions in one clause — express, a misrepresentation, of a material fact, and one that cannot be characterised as advice, judgment or opinion — and a flat statement that a house has never flooded satisfies all four; dressing it in \"I think\" would not have saved it, because a court reads the substance. On § 17.49(f), the definition of \"Residence\" in § 17.45(12) has two limbs, the building type AND occupancy as the consumer's residence, and both are satisfied here. Most residential buyers have no lawyer, so condition (2) usually fails too. That exemption almost never protects a residential licence holder.",
      feedbackIncorrect:
        "Read § 17.49(i) past its first sentence: the exemption \"does not apply to\" three things, and the first of them is an express misrepresentation of a material fact that cannot be characterised as advice, judgment or opinion. Then read § 17.49(f) as three conditions joined by \"and\" and test each separately — the dollar threshold, counsel of the consumer's own choosing, and a contract that does not involve the consumer's residence. Failing any one defeats the exemption, and here two fail. Commit both thresholds while you are there: more than $100,000 at § 17.49(f), more than $500,000 at § 17.49(g), and the residence exception in both. Review module-11.md, Unit: Defenses.",
      remediation: "module-11.md#unit-defenses",
    },
    {
      id: "SC4-T2",
      type: "selection",
      prompt:
        "Ms. Nwosu never signed anything with you, was represented by another brokerage, and paid you nothing. Your broker says that means she cannot sue you under the DTPA. Which statement is correct?",
      choices: [
        "She can. Section 17.45(4) defines a consumer as one who seeks or acquires by purchase or lease, by gift or otherwise, goods or services — the definition turns on what she acquired, not on whether she dealt with you, engaged you or paid you, and she acquired the house. Under § 17.50(a)(1) she must then establish that she relied on the representation to her detriment and that it was a producing cause of her economic damages, and a listing remark she read before touring and buying is capable of both.",
        "She cannot. A DTPA claim requires privity between the consumer and the defendant, and the absence of any agreement or payment between you defeats the claim before any question of misrepresentation arises.",
        "She can, and nothing further is required of her: proving that a listed statement was false is by itself a violation for which § 17.50(b)(1) awards economic damages, without reliance or causation.",
        "She can sue the seller and her own broker but not you, because your duty ran to your seller and a listing agent's marketing remarks are addressed to cooperating brokers rather than to buyers.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student applies the consumer definition to a buyer who never dealt with the licence holder contractually, and then holds on to the two things § 17.50(a)(1) still requires rather than treating a false statement as automatically actionable.",
      unitCodes: ["T11U2"],
      teaches: ["t11u2-s1", "t11u2-s2"],
      sources: [
        "Business & Commerce Code § 17.45(4)",
        "Business & Commerce Code § 17.50(a)(1)",
        "Business & Commerce Code § 17.46(b)",
        "22 TAC § 535.156",
      ],
      feedbackCorrect:
        "This is the feature of the DTPA that surprises licence holders most: standing comes from what the plaintiff acquired, not from any relationship with the defendant. She bought the house; she is a consumer; you published the sentence she read. What the statute still asks of her is real, though — reliance to her detriment and producing cause under § 17.50(a)(1) — and those are the elements a defence is actually built on. Note the parallel duty that never depended on the DTPA at all: 22 TAC § 535.156 requires you to convey accurate information to members of the public with whom you deal, and she was one.",
      feedbackIncorrect:
        "The definition does not mention privity, payment or an agreement, and a claim does not fail because the plaintiff was somebody else's client. Read § 17.45(4) for what it does require — that she sought or acquired goods or services — and then read § 17.50(a)(1) for what she must add: reliance to her detriment, and that the conduct was a producing cause of economic damages. Those two are the elements you argue about; standing is not. Review module-11.md, Unit: Deceptive Trade Practices and Consumer Protection.",
      remediation: "module-11.md#unit-deceptive-trade-practices-and-consumer-protection",
    },
    {
      id: "SC4-T3",
      type: "computation",
      prompt:
        "Assume the case is tried, the trier of fact finds economic damages of $28,000 and mental anguish of $16,000, and finds that the conduct was committed knowingly. Applying Business & Commerce Code § 17.50(b)(1), what is the maximum in dollars the trier of fact may award in damages, excluding court costs and attorneys' fees?",
      expected: 128000,
      tolerance: 0.01,
      unit: "dollars",
      points: 4,
      judgement:
        "Whether the student uses the correct multiplier base at the knowing tier — economic damages alone — and adds the mental anguish without multiplying it, rather than trebling the whole award.",
      unitCodes: ["T11U3"],
      teaches: ["t11u3-s1", "t11u3-s2"],
      sources: [
        "Business & Commerce Code § 17.50(b)(1)",
        "Business & Commerce Code § 17.50(e)",
        "Business & Commerce Code § 17.45(11)",
      ],
      feedbackCorrect:
        "$128,000. At the knowing tier two things unlock: mental anguish \"as found by the trier of fact,\" and additional damages of \"not more than three times the amount of economic damages.\" So economic damages $28,000, plus mental anguish $16,000, plus three times the economic damages, $84,000 — $128,000 in all. Two guards on the arithmetic. Mental anguish is recoverable but is NOT in the multiplier base at this tier; it joins the base only on a finding that the conduct was intentional, which would move the maximum to $28,000 + $16,000 + 3 x $44,000, or $176,000. And § 17.50(e) keeps attorneys' fees, costs and prejudgment interest out of the base entirely.",
      feedbackIncorrect:
        "Identify the tier first, then the base. On a knowing finding the statute permits \"not more than three times the amount of economic damages\" — economic damages only. Mental anguish is added once, not multiplied. The two errors that produce most wrong answers are putting mental anguish into the base at the knowing tier, which is the intentional tier's rule, and trebling the whole judgment including fees, which § 17.50(e) forbids in terms. Rebuild it as three lines: economic, mental anguish, multiplier. Review module-11.md, Unit: Damages.",
      remediation: "module-11.md#unit-damages",
    },
    {
      id: "SC4-T4",
      type: "computation",
      prompt:
        "The demand letter received on 8 September states economic damages of $28,000, mental anguish of $16,000, and attorneys' fees reasonably incurred in asserting the claim of $4,200. If the decision is taken to use the tender defence in Business & Commerce Code § 17.506(d), how many dollars must be tendered?",
      expected: 48200,
      tolerance: 0.01,
      unit: "dollars",
      points: 4,
      judgement:
        "Whether the student reads the tender provision as requiring both categories of damages AND the expenses including fees, rather than tendering the economic damages alone and losing the defence.",
      unitCodes: ["T11U4"],
      teaches: ["t11u4-s1", "t11u4-s2"],
      sources: ["Business & Commerce Code § 17.506(d)", "Business & Commerce Code § 17.505(a)"],
      feedbackCorrect:
        "$48,200 — $28,000 plus $16,000 plus $4,200. Subsection (d) requires the defendant to tender both \"the amount of economic damages and damages for mental anguish claimed\" and \"the expenses, including attorneys' fees, if any, reasonably incurred by the consumer in asserting the claim,\" and the window is thirty days after the day the notice was received, so 8 October on these facts. Set that against the alternative: a claim that could reach $128,000 in damages at the knowing tier, plus $54,000 in fees and $3,600 in costs at trial. It is the cheapest exit in the statute, which is exactly why the thirty days matters.",
      feedbackIncorrect:
        "Tender is all-or-nothing and the subsection lists two things, not one. Add the economic damages and the mental anguish claimed, then add the expenses including attorneys' fees reasonably incurred in asserting the claim. A tender that omits the fees is not a tender under the subsection and buys no defence. Note the two clocks the letter started, both running from receipt: the sixty days under § 17.505(a) before suit may be filed, and the thirty days under § 17.506(d) in which a tender must be made. Review module-11.md, Unit: Defenses.",
      remediation: "module-11.md#unit-defenses",
    },
    {
      id: "SC4-T5",
      type: "selection",
      prompt:
        "Everything in the arithmetic turns on a finding about your state of mind. Which statement about that finding, and about the flood insurance renewal notice sitting unread in your file, is correct?",
      choices: [
        "Section 17.45(9) defines \"knowingly\" as actual awareness, at the time of the act or practice, of the falsity, deception or unfairness of the act or practice, and adds that actual awareness may be inferred where objective manifestations indicate that a person acted with actual awareness — so the renewal notice in your own file is the kind of objective manifestation from which a jury may infer the finding that trebles the exposure, even though you say you never read it.",
        "Actual awareness must be proved directly, so a document you never read cannot support a knowing finding; the multiplier is available only where the defendant admits knowledge or a witness testifies to it.",
        "The renewal notice makes the finding automatic. A defendant who possessed a document contradicting the statement is knowing as a matter of law under § 17.45(9), and the trier of fact has no discretion.",
        "The renewal notice is irrelevant to state of mind, because the § 17.506(a) reliance defence protects a defendant who repeated written information obtained from another source, and the seller's statement was such information.",
      ],
      correctChoice: 0,
      points: 3,
      judgement:
        "Whether the student understands that the culpability finding is inferable from objective manifestations rather than proved by confession, and does not mistake a defence with conditions for an automatic protection.",
      unitCodes: ["T11U1"],
      teaches: ["t11u1-s1", "t11u1-s2"],
      sources: [
        "Business & Commerce Code § 17.45(9)",
        "Business & Commerce Code § 17.45(13)",
        "Business & Commerce Code § 17.506(a)",
        "Business & Commerce Code § 17.506(b)",
      ],
      feedbackCorrect:
        "That sentence at the end of § 17.45(9) is the one to remember: actual awareness \"may be inferred where objective manifestations indicate that a person acted with actual awareness.\" The same inference is available for \"intentionally\" under § 17.45(13). A file containing a flood insurance renewal notice, collected by you and never read, is exactly the objective manifestation a plaintiff will put in front of a jury. And on the last option, note why the § 17.506(a) defence is unavailable here: it requires reasonable and timely WRITTEN notice to the plaintiff, given BEFORE consummation of the transaction, of your reliance on written information — you gave none, and the seller's statement was oral in any event.",
      feedbackIncorrect:
        "Two opposite errors are possible on this item and both are wrong. Actual awareness is not confined to what a defendant admits, because the statute expressly permits it to be inferred from objective manifestations; and it is not automatic from the existence of a document, because the inference is the trier of fact's to draw. On the § 17.506(a) option, count that defence's conditions: written information, written notice of your reliance given to the plaintiff before consummation, information that was in fact false, and proof you did not know and could not reasonably have known. Students remember it as \"I can rely on what I am told,\" which is not what it says. Review module-11.md, Unit: Fraud versus Misrepresentation, and Unit: Defenses.",
      remediation: "module-11.md#unit-fraud-versus-misrepresentation",
    },
    {
      id: "SC4-T6",
      type: "short-answer",
      prompt:
        "Your broker wants you to telephone Ms. Nwosu today and tell her she has no claim. Set out what you do about the letter this week and what you tell your broker about that instruction.",
      rubric: [
        "Does not telephone the consumer to answer the allegations or to tell her she has no claim, and identifies that telling her what her legal position is would be giving legal advice contrary to 22 TAC § 537.11(b).",
        "Notes the date of receipt and identifies the two periods it started — the sixty days under § 17.505(a) before suit may be filed, and the thirty days under § 17.506(d) within which a tender must be made.",
        "Gets the letter to the brokerage's legal counsel and notifies the errors and omissions carrier, and states that the decision whether to tender under § 17.506(d) is counsel's and the carrier's rather than the licence holder's.",
        "Preserves the entire file unaltered, including the flood insurance renewal notice, and states that nothing is removed, corrected in place or re-dated.",
        "Identifies that this course states the day-one handling as practice rather than as law, and cites no Texas authority for it beyond the two statutory periods.",
        "Identifies that the same conduct can be reached by TRELA independently of the DTPA — Business & Commerce Code § 17.43 provides that a violation of another law is not in and of itself a DTPA violation, and the reverse is equally true — so the Commission's interest in the matter is not answered by resolving the civil claim.",
      ],
      points: 5,
      judgement:
        "Whether the student can refuse a sponsoring broker's instruction that would harm both the consumer and the licence holder, and can separate what must be done on a clock from what must be decided by counsel.",
      unitCodes: ["T11U5", "T11U4"],
      teaches: ["t11u5-s1", "t11u4-s1"],
      sources: [
        "Business & Commerce Code § 17.505(a)",
        "Business & Commerce Code § 17.506(d)",
        "Business & Commerce Code § 17.43",
        "22 TAC § 537.11(b)",
        "Occupations Code § 1101.652(b)(2)",
      ],
      referral: true,
      referralNote:
        "Whether the claim is defensible, and whether to tender, are legal decisions. They go to the brokerage's counsel and to the errors and omissions carrier; a licence holder who telephones the consumer to tell her she has no claim has given legal advice and made a witness of himself.",
      feedbackCorrect:
        "Everything you say to her from this morning onward is evidence, and the one thing your broker has asked you to say is a legal conclusion you are not permitted to give. Note that the course is honest about the status of this advice: the day-one handling is practice, and no held Texas source prescribes it. What is law is the two periods running from receipt, the requirement that a tender include both categories of damages and the expenses, and the fact that resolving a civil claim does not answer to the Commission.",
      feedbackIncorrect:
        "Two things have to happen and one thing must not. Happen: note the date of receipt and the two periods it started, and get the letter to counsel and the carrier the same day. Not happen: any conversation with the consumer about the merits. Telling a person what her legal position is falls squarely inside what 22 TAC § 537.11(b) forbids, and it will be quoted back to you. Note also that a licence holder who follows an instruction like this one owns the consequence — a broker's instruction is not a defence to § 1101.652(b)(2). Review module-11.md, Unit: Ethical and Legal Concerns, and Unit: Defenses.",
      remediation: "module-11.md#unit-ethical-and-legal-concerns",
    },
  ],
  passingScore: 0.7,
  criticalCriteria: [
    "Does not telephone the consumer to answer the allegations or to tell her she has no claim, and identifies that telling her what her legal position is would be giving legal advice contrary to 22 TAC § 537.11(b).",
    "Gets the letter to the brokerage's legal counsel and notifies the errors and omissions carrier, and states that the decision whether to tender under § 17.506(d) is counsel's and the carrier's rather than the licence holder's.",
  ],
  remediation: {
    onFailure:
      "A student who does not reach the points to pass, or who misses either critical element, is returned to the screens below with the instructor's written rationale for each task answered wrongly, and works the scenario again. Where the failure is on either computation the instructor works the three damage tiers with the student before the reattempt, because a student who has the tiers wrong will misjudge every settlement decision in practice.",
    revisit: ["t11u4-s1", "t11u2-s1", "t11u3-s1", "t11u3-s2", "t11u1-s1", "t11u5-s1"],
    reattemptPermitted: true,
  },
  optionalReflection: {
    prompt:
      "Optional and never graded: look back at the sentence in the marketing remarks. Write the version of it you would publish now, and note where the information in it would have come from. Nothing here is scored and nothing is unlocked by it.",
    required: false,
    graded: false,
    affectsScore: false,
  },
  instructorReview: {
    required: true,
    reason:
      "Task SC4-T6 is graded against a rubric that requires a licence holder to decline a sponsoring broker's instruction, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student may reach a passing point total while still proposing to telephone the consumer, the instructor confirms both critical elements before the scenario is recorded as passed.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   SCENARIO 5 — THE COURSE CAPSTONE. Course-level time, attributed to no topic.

   WHY IT IS NOT A T12 EXERCISE. The work this scenario asks for is reconstruction: a closed file is
   put in front of the student and the question is what happened, in what order, and which provision
   each departure engages. Doing that draws on seven topics at once — the duty to respond from T03,
   the buyer-side sequence from T05, the appointment machinery from T06, the brokerage's own
   disclosure policy from T08, broker responsibility and records from T09, the disciplinary catalogue
   from T10, and the title advisory and risk-management practice from T12. Attributing its twenty
   minutes to T12 because the capstone module sits last would say that a student spent those minutes
   on Implementation and Presentation, which is not what happened. The minutes are therefore
   course-level, exactly as config/texas/law-of-agency-time-budget.mjs's COURSE_LEVEL records them,
   and the invariants at the foot of this file check that no topic's budget is charged for them.

   It is PLACED after the final topic because that is when a student has the whole course to draw on.
   Placement and time attribution are different questions, and this file keeps them apart.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const SC5 = scenario("LOA-SC5", {
  title: "Reconstructing a Wichita Falls file",
  placement: {
    afterTopic: "T12",
    attributedToTopic: null,
    timeAttribution: "COURSE_LEVEL",
    unlockRequires: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12"],
  },
  assessesTopics: ["T03", "T05", "T06", "T08", "T09", "T10", "T12"],
  assessesUnits: ["T03U3", "T05U6", "T06U3", "T08U2", "T09U5", "T10U3", "T12U2", "T12U3", "T12U5"],
  context:
    "You are a sales agent sponsored by Red River Brokerage in Wichita Falls, and your broker, Delia Marchetti, delegated you in writing three months ago to assist in administering compliance with the Act and the Commission's rules. The Commission has been notified of the delegation.\n\n" +
    "A complaint has been filed naming Kip Larousse, one of the firm's sales agents. Delia has handed you the whole file on the Kemp Boulevard transaction and asked you to reconstruct it before she answers anything. This is not a question about whether Kip is a bad agent. It is the ordinary problem of a file in which each thing happened at nearly the right time, in nearly the right order, by nearly the right person.\n\n" +
    "Every dollar figure below is illustrative and invented so the arithmetic is visible; compensation is not set by law and is fully negotiable, and no Texas statute or Commission rule fixes any rate used here.",
  facts: [
    "THE TRANSACTION: 3805 Kemp Boulevard, a single-family house listed by Red River Brokerage at $296,000 and sold to Hannah and Omar Sadiq for $289,500. Both sides of the transaction were the firm's: Renae Coulter held the listing, Kip worked with the buyers.",
    "THE FILE'S DATED DOCUMENTS, in the order they are dated: a text message thread beginning 4 February in which Kip and the buyers discuss two specific houses; a first showing of Kemp Boulevard on 7 February; an Information About Brokerage Services notice emailed to the buyers on 8 February; a buyer representation agreement signed by the buyers on 17 February, the day the offer was written; the executed contract dated 17 February; and the closing statement dated 21 March.",
    "WHAT IS NOT IN THE FILE: any written advice to the buyers about having an abstract examined by an attorney of their choosing or being provided with or obtaining a title insurance policy.",
    "THE INTERMEDIARY PAPER: the sellers' listing agreement authorises Red River Brokerage to act as an intermediary and sets out the § 1101.651(d) prohibitions in conspicuous bold print. It says nothing about appointments. The buyers' representation agreement authorises both intermediary status and appointments.",
    "THE APPOINTMENT NOTICE: a one-page notice in the file names Kip as appointed to the buyers and Renae as appointed to the sellers. It is signed by Kip. Delia did not sign it, did not send it, and says the first she saw of it was this morning.",
    "THE UNANSWERED EMAILS: a second prospective buyer, Aurelio Bengochea, toured Kemp Boulevard unrepresented on 9 February and emailed Kip on 10 February and again on 14 February asking whether the sellers would consider a later closing. Kip replied on 19 February.",
    "THE MISSING TEXTS: the file's text thread starts on 4 February, but Kip says he had been messaging the buyers about the property since late January. Those messages are on a handset he traded in and were not exported.",
    "THE COMPENSATION: under the listing agreement Red River Brokerage receives 5 percent of the sales price, of which the listing earmarks 2.5 percent of the sales price for the work done on the buyers' side.",
    "THE FIRM'S POLICY MANUAL: its page headed \"Agency\" reads, in full, \"Red River Brokerage complies with all TREC disclosure requirements.\"",
    "WHAT THE BUYERS HAVE ASKED YOU, by email this morning: \"Now that we know none of this was done properly, can we get out of the purchase, and should we be suing somebody?\"",
  ],
  tasks: [
    {
      id: "SC5-T1",
      type: "selection",
      prompt:
        "Reconstruct the buyer-side sequence from the file's own dates. Which statement identifies the departures correctly?",
      choices: [
        "Two triggers were missed. The buyers were shown a residential property on 7 February with no written agreement in place, and § 1101.563(b) requires the written agreement before showing any residential real property to a prospective buyer — the agreement is dated 17 February, and § 1101.652(b)(34) makes the failure a ground for discipline. Separately, the IABS was sent on 8 February although the text thread shows substantive communication about specific real property from 4 February, and § 1101.558(b-1) fixes the trigger at the first substantive communication rather than at the first showing or the first appointment.",
        "Nothing was missed. The written agreement is required before an offer is presented, and it was signed on the day the offer was written; the IABS is required before a contract is executed, and it was sent more than a week earlier.",
        "One trigger was missed. The IABS was late, but the written agreement was timely, because § 1101.563(b) applies only where the licence holder is representing the buyer and Kip was not yet representing anybody on 7 February.",
        "One trigger was missed. The written agreement was late, but the IABS was timely, because the notice is due at the first showing and the first showing was 7 February.",
        "Neither instrument was required at all, because Red River Brokerage held the listing and a licence holder showing the firm's own listing acts for the seller.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student can reconstruct two independent triggers from a file's dates — one keyed to a showing, one keyed to a communication — and resist the reading that a signature on the day of the offer cures a showing that happened ten days earlier.",
      unitCodes: ["T05U6", "T12U2"],
      teaches: ["t05u6-s1", "t05u6-s2", "t12u2-s1"],
      sources: [
        "Occupations Code § 1101.563(b)",
        "Occupations Code § 1101.652(b)(34)",
        "Occupations Code § 1101.558(b-1)",
        "22 TAC § 531.20",
      ],
      feedbackCorrect:
        "The two provisions have different triggers and a file is reconstructed against both. Section 1101.563(b) is keyed to the showing — before you show any residential real property to a prospective buyer, or, where none will be shown, before you present an offer — and there is no grace period and no papering it at the offer. Section 1101.558(b-1) is keyed to the first substantive communication about specific real property, which the text thread dates to 4 February. Note the third option's error, which is the seductive one: the § 1101.563(b) duty attaches to a licence holder performing any act of real estate brokerage for a prospective buyer, and helping a buyer find and view houses is that act — the absence of a signed agreement is the violation, not a defence to one.",
      feedbackIncorrect:
        "Take the two dates the statute cares about and find them in the file. The showing is 7 February and the agreement is 17 February, so the § 1101.563(b) trigger passed unmet; the second trigger in that subsection, presenting an offer, applies where no property will be shown, and property was shown. The first substantive communication about specific real property is 4 February on the text thread, so the notice sent on the 8th was late against § 1101.558(b-1) whatever it was in time for. Review module-05.md, Unit: Buyer's Broker Disclosures, and module-12.md, Unit: The Broker Working for/with the Buyer.",
      remediation: "module-05.md#unit-buyers-broker-disclosures",
    },
    {
      id: "SC5-T2",
      type: "computation",
      prompt:
        "No written advice about an abstract or a title insurance policy is in the file. Under the listing agreement Red River Brokerage receives 5 percent of the sales price of $289,500, of which the listing earmarks 2.5 percent of the sales price for the work done on the buyers' side. Applying Occupations Code § 1101.806(d) to the buyers' side, how many dollars are at risk?",
      expected: 7237.5,
      tolerance: 0.01,
      unit: "dollars",
      points: 3,
      judgement:
        "Whether the student computes the buyer-side compensation from the correct base and understands that § 1101.806(d) forfeits the whole of it rather than reducing it or offsetting a penalty against it.",
      unitCodes: ["T12U2"],
      teaches: ["t12u2-s1"],
      sources: [
        "Occupations Code § 1101.555",
        "Occupations Code § 1101.806(d)",
        "Occupations Code § 1101.652(b)(29)",
      ],
      feedbackCorrect:
        "$7,237.50 — 2.5 percent of $289,500. Check the whole against the listing: 5 percent of $289,500 is $14,475 to the firm, of which the buyer-side earmark is half. Now read the sanction exactly: \"A license holder who fails to advise a buyer as provided by Section 1101.555 may not receive payment of or recover any commission agreed to be paid on the sale.\" Not reduced, not offset, not subject to a hardship exception. Section 1101.555 is one sentence, triggered by the signature of the offer rather than by acceptance, owed to each buyer including an unrepresented one, and required to be in writing; § 1101.652(b)(29) states the same duty as a disciplinary ground phrased around closing. A one-sentence advisory in the file protects the entire fee.",
      feedbackIncorrect:
        "Two steps. First take the earmarked buyer-side percentage on the SALES PRICE, not on the list price and not on the firm's total compensation. Then read § 1101.806(d) for what it does to that number: the licence holder \"may not receive payment of or recover any commission agreed to be paid on the sale,\" which is forfeiture of the whole, not a penalty measured against it. Review module-12.md, Unit: The Broker Working for/with the Buyer.",
      remediation: "module-12.md#unit-the-broker-working-forwith-the-buyer",
    },
    {
      id: "SC5-T3",
      type: "selection",
      prompt:
        "Both sides of this transaction were the firm's. Test the intermediary paper in the file against Occupations Code §§ 1101.559 and 1101.560. Which statement is correct?",
      choices: [
        "The appointments are bad twice over. Section 1101.560(b) permits an appointment \"only if\" the written consent of the parties authorises the broker to make it and the broker provides written notice of the appointment to all parties — and the sellers' listing agreement says nothing about appointments, so the first condition fails as to them. The notice is also signed by Kip: it is the broker who appoints and the broker who provides the notice, and a sales agent can do neither. The lawful configurations on this paper were intermediary without appointments, or curing the sellers' consent before any appointment was made.",
        "The appointments are good. The buyers' agreement authorises appointments, the sellers' agreement authorises intermediary status, and between the two documents both conditions of § 1101.560(b) are met for the transaction as a whole.",
        "The appointments are unnecessary. Where each party already has a different licence holder working with them, appointment adds nothing, and § 1101.560 applies only where the broker proposes to advise a party personally.",
        "The appointments are bad, and the consequence is that the brokerage could not lawfully have proceeded at all: without valid appointments a broker may not represent both parties, and the firm should have withdrawn from one side.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student tests each party's own consent against the appointment conditions instead of aggregating two documents, and attributes the appointment and its notice to the broker rather than to the agent who signed the page.",
      unitCodes: ["T06U3"],
      teaches: ["t06u3-s1", "t06u3-s2"],
      sources: [
        "Occupations Code § 1101.559(a)",
        "Occupations Code § 1101.559(b)",
        "Occupations Code § 1101.560(a)",
        "Occupations Code § 1101.560(b)(1)",
        "Occupations Code § 1101.560(b)(2)",
        "Occupations Code § 1101.561(b)",
      ],
      feedbackCorrect:
        "The consent must do two distinct jobs — authorise intermediary status, and authorise appointments — and the second is not implied by the first. A consent that does the first alone permits an intermediary without appointments and nothing more, which is a perfectly lawful configuration in which nobody in the firm advises anybody about this transaction. On the signature, § 1101.560(b)(2) puts the notice on the broker, requires it in writing, and sends it to all parties involved in the transaction rather than only to the party whose appointee is named. Note why the last option is wrong: § 1101.561(b) makes the intermediary posture compulsory when the broker agrees to represent both, so withdrawal was never the required answer.",
      feedbackIncorrect:
        "Do not aggregate the two agreements. Each party's own written consent has to authorise what is being done to that party, and the sellers' consent authorises intermediary status only, so no appointment could be made on their side. Then ask who performed each act: § 1101.560(a) says the BROKER appoints, and (b)(2) says the BROKER provides written notice to all parties. A notice signed by an appointee is not the broker's notice. Review module-06.md, Unit: Representation of More Than One Party in a Transaction.",
      remediation: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
    },
    {
      id: "SC5-T4",
      type: "selection",
      prompt:
        "Aurelio Bengochea, unrepresented, emailed Kip on 10 February and again on 14 February and was answered on 19 February. Delia says the duty did not run because Aurelio was never going to buy and was nobody's client. Which statement is correct?",
      choices: [
        "The duty ran and was missed twice. 22 TAC § 535.157 requires a broker or sales agent to respond within two calendar days to the licence holder's principal, to a broker or sales agent representing another party, or to an unrepresented party to a real estate transaction — and an unrepresented prospective buyer who has toured the property is within the third category, since Occupations Code § 1101.551(2) defines a party to include a prospective buyer. Two calendar days from 10 February and two from 14 February both expired before 19 February, and the rule does not require the response to resolve anything.",
        "The duty did not run. Section 535.157's third category reaches an unrepresented party to a transaction, and a person who has made no offer is not a party to any transaction, so Kip owed him nothing until he wrote.",
        "The duty ran once. The two calendar days run from the first message only, so the 14 February email did not restart the clock and a single late reply is a single failure.",
        "The duty ran but was met, because Kip was inside the two calendar days on both emails once weekends and the intervening holiday are excluded from the count.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student applies the response rule to someone with no agreement, no offer and no client relationship, and resists both of the escapes a busy agent reaches for — that a prospect is not a party, and that the days are business days.",
      unitCodes: ["T03U3", "T09U5"],
      teaches: ["t03u3-s1", "t09u5-s1"],
      sources: [
        "22 TAC § 535.157",
        "Occupations Code § 1101.551(2)",
        "22 TAC § 535.2(j)",
        "22 TAC § 535.2(k)",
      ],
      feedbackCorrect:
        "Two features of the definition decide it. Section 1101.551(2) includes PROSPECTIVE buyers, sellers, landlords and tenants — someone who has signed nothing and may never buy is still a party — and it excludes only a licence holder who represents a party. And the rule says calendar days, with nothing about weekends, holidays or office hours; the Commission wrote \"working day\" in the trust-money rule and did not write it here. Each message starts its own obligation. Keep the broker-side clocks alongside: § 535.2(j) requires a broker or delegated supervisor to respond to sponsored sales agents within two calendar days, and § 535.2(k) requires Commission correspondence to be delivered to them within three.",
      feedbackIncorrect:
        "Test the two escapes separately. First, is he a party? Section 1101.551(2) says a party includes a prospective buyer, so the absence of an offer or an agreement does not remove him from the rule. Second, are the days business days? The rule says calendar days and excludes nothing. Then count each message on its own: nothing in § 535.157 makes a second unanswered message part of the first. Review module-03.md, Unit: Define Third Party/Obligations to Third Party/Duty to Respond, and module-09.md, Unit: Broker Responsibility (Relationships between Brokers and Agents, §535.2).",
      remediation: "module-03.md#unit-define-third-partyobligations-to-third-partyduty-to-respond",
    },
    {
      id: "SC5-T5",
      type: "selection",
      prompt:
        "The early text messages are gone with the handset, and the complaint names Kip alone. Which statement about the records and about who is answerable is correct?",
      choices: [
        "The missing messages are a records problem of the broker's. 22 TAC § 535.2(h) requires the broker to maintain substantive communications with parties to the transaction, among eight categories, in a format readily available to the Commission for at least four years from closing, termination of the contract, or end of the transaction, and the only excuse the rule recognises is destruction by an Act of God not intentionally caused by the broker — a traded-in handset is not one. Under 22 TAC § 535.141 a complaint naming a sales agent is also a complaint against the sponsoring broker for the limited purpose of determining the broker's involvement and whether the broker met the broker's professional responsibilities, and Occupations Code § 1101.803 makes the broker liable to the Commission, the public and the broker's clients for the agent's conduct.",
        "The missing messages are Kip's problem alone, because he sent them from his own handset and § 535.2(h) reaches the broker's own files rather than an agent's device. The complaint likewise reaches only the person it names.",
        "The messages need not have been kept at all. Section 535.2(h) lists formal documents — agreements, offers, disclosures and statements of account — and informal messaging is not among the eight categories.",
        "The records duty ended at closing. The four years run to the closing date rather than from it, so a transaction that closed on 21 March is outside the retention period by the time any complaint is filed.",
      ],
      correctChoice: 0,
      points: 4,
      judgement:
        "Whether the student locates the records duty on the broker rather than on the agent's device, recognises text messages as a named category, and knows that a complaint against an agent reaches the sponsoring broker by rule rather than by inference.",
      unitCodes: ["T09U5", "T10U3"],
      teaches: ["t09u5-s1", "t09u5-s2", "t10u3-s1", "t10u3-s2"],
      sources: [
        "22 TAC § 535.2(h)",
        "22 TAC § 535.141",
        "Occupations Code § 1101.803",
        "Occupations Code § 1101.652(a)(4)",
        "Occupations Code § 1101.652(a-1)(2)",
      ],
      feedbackCorrect:
        "Three things travel together here. The retention duty is the broker's and it names substantive communications with parties, so where the messages physically live is a practical problem rather than a legal answer. The complaint reaches the broker by rule, which is why brokers write policies and why you follow them. And two disciplinary grounds sit alongside the missing file: § 1101.652(a-1)(2) reaches a failure or refusal to produce records for inspection, and § 1101.652(a)(4) reaches a failure to provide, within a reasonable time, information the Commission requests in connection with a complaint — a licence is more often lost for ignoring the letter than for the original conduct.",
      feedbackIncorrect:
        "Ask who the rule addresses. Section 535.2 is written to the broker throughout, and subsection (h) requires the broker to maintain the eight categories \"in a format that is readily available to the Commission\" — a category of record does not fall outside the rule because it lived on an agent's telephone. Substantive communications with parties are expressly listed and the medium is irrelevant. And the four years run FROM closing, termination or end of the transaction, not to them. Review module-09.md, Unit: Broker Responsibility (Relationships between Brokers and Agents, §535.2), and module-10.md, Unit: TRELA and Rules of the Commission (Ethics).",
      remediation: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
    },
    {
      id: "SC5-T6",
      type: "selection",
      prompt:
        "Delia points at the manual's Agency page — \"Red River Brokerage complies with all TREC disclosure requirements\" — and says the firm's policy was adequate and Kip simply departed from it. What is the correct assessment?",
      choices: [
        "The sentence is not a policy. 22 TAC § 535.2(i) requires a broker who sponsors sales agents to maintain, on a current basis, written policies and procedures on the subjects the rule lists, and a policy's work begins where the rule stops: who delivers the notice when two of the firm's agents are in contact with the same buyer, in which channel it goes when first contact arrives by text, where the sent copy is filed so the broker can retrieve it without the agent, and at what point in an appointment the written agreement is presented. On these facts every one of those questions was left to Kip, and the file shows what he decided.",
        "The sentence is an adequate policy. The rule requires written policies and procedures without prescribing their content, so a statement committing the firm to compliance satisfies it, and the defect is entirely Kip's.",
        "The sentence is inadequate, but the defect is immaterial, because a brokerage policy is a business document and no Commission rule requires one to exist.",
        "The sentence is inadequate, and the cure is to adopt the Commission's model brokerage policy manual, which 22 TAC § 535.2 adopts by reference for firms that sponsor sales agents.",
      ],
      correctChoice: 0,
      points: 3,
      judgement:
        "Whether the student can say what a written policy is for — answering the questions the rule leaves open — rather than treating a statement of intent to comply as compliance, and without inventing a Commission form that does not exist.",
      unitCodes: ["T08U2"],
      teaches: ["t08u2-s1", "t08u2-s2"],
      sources: ["22 TAC § 535.2(i)", "22 TAC § 535.2", "22 TAC § 531.20", "Occupations Code § 1101.558(b-1)"],
      feedbackCorrect:
        "The law sets a floor: it says what must happen, not how a firm makes it happen the same way every time. That is the policy's job, and the absence of one is the commonest reason a firm's deliveries are inconsistent. Note what the last option invents — no Commission model policy manual is adopted by reference, and the structure of a manual is a business decision no source read for this course prescribes. What the rule prescribes is that written policies exist, be maintained on a current basis, and cover the listed subjects.",
      feedbackIncorrect:
        "A policy that says the firm complies with the rules has made no decision. Test it by asking what it would have told Kip to do at the moment the first text arrived about a specific house: which channel to move to, what to send, who sends it when a colleague is also in contact with the buyer, and where the copy goes. None of those has an answer in the sentence on the page. And do not reach for a Commission form to cure it; none exists for a policy manual. Review module-08.md, Unit: Understanding a Brokerage Company's Policy.",
      remediation: "module-08.md#unit-understanding-a-brokerage-companys-policy",
    },
    {
      id: "SC5-T7",
      type: "short-answer",
      prompt:
        "Write the memorandum to Delia. Set out what the firm does now, in what order, and answer the buyers' email — or say why you are not answering it.",
      rubric: [
        "Does not answer the buyers' questions about getting out of the purchase or about suing anybody, and refers them to their own attorney, identifying 22 TAC § 537.11(b) as forbidding a licence holder to give legal advice.",
        "States that the firm's own response to the Commission is a matter for the broker with the firm's legal counsel, and that Occupations Code § 1101.652(a)(4) makes a failure to provide requested information within a reasonable time an independent ground for discipline.",
        "Identifies the missing § 1101.555 written advice and states what § 1101.806(d) does to the commission on the sale, without opining on whether the firm can nonetheless keep the money.",
        "States that the file is added to and never altered — nothing removed, corrected in place or re-dated — and identifies § 1101.652(a-1)(2) and 22 TAC § 535.2(h) as the reasons.",
        "Identifies at least two corrections that can be made now rather than argued about later, such as reconstructing what can be reconstructed of the missing communications from other sources, putting the appointment defect in writing to both parties, or fixing the policy manual and the delivery routine that produced the late notice.",
        "Names 22 TAC § 535.2 and Occupations Code § 1101.803 as the reasons the broker is told immediately and in full, rather than after the position is tidied.",
        "Notes that Occupations Code § 1101.702(b) puts efforts to correct the violation among the factors that set the amount of an administrative penalty, so prompt correction is relevant to the outcome and not merely decent.",
      ],
      points: 6,
      judgement:
        "Whether the student can produce a defensible first response to a file that has gone wrong: correct what can be corrected, preserve what must be preserved, tell the person who is answerable, and hand both legal questions — the buyers' remedies and the firm's exposure — to the people whose questions they are.",
      unitCodes: ["T12U5", "T12U3"],
      teaches: ["t12u5-s1", "t12u5-s2", "t12u3-s1", "t12u3-s2"],
      sources: [
        "22 TAC § 537.11(b)",
        "22 TAC § 535.2",
        "22 TAC § 535.2(h)",
        "22 TAC § 535.156",
        "Occupations Code § 1101.555",
        "Occupations Code § 1101.806(d)",
        "Occupations Code § 1101.652(a)(4)",
        "Occupations Code § 1101.652(a-1)(2)",
        "Occupations Code § 1101.702(b)",
        "Occupations Code § 1101.803",
      ],
      referral: true,
      referralNote:
        "Whether the buyers may rescind and whom they may sue are legal questions belonging to their own attorney; how the firm answers the Commission is a question for the broker with the firm's counsel. A delegated supervisor who answers either has given legal advice and has spoken for the broker without authority to do so.",
      feedbackCorrect:
        "This is the part of risk management that is almost never taught and the part you will actually need. There is no held Texas source prescribing a self-correction procedure, and none is invented here; what the held sources supply is a set of obligations that together describe the only defensible response. Tell the broker immediately. Correct the record in writing and toward everyone who relied on it. Add to the file and never alter it. Answer the Commission. And do not offer a legal conclusion about your own firm's mistake to the people harmed by it — that is exactly the moment they should be talking to a lawyer, whom you may not discourage them from employing.",
      feedbackIncorrect:
        "Sort the memorandum into three piles before you write it. Things to do now: tell Delia in full, preserve and add to the file, reconstruct what can be reconstructed, fix the routine that produced the late notice. Things that are somebody else's: whether the buyers can rescind, whom they might sue, and how the firm answers the Commission. Things to state without deciding: that no § 1101.555 advisory is in the file and what § 1101.806(d) says about the commission, leaving whether the firm can keep the money to counsel. The commonest failure here is a memorandum that answers the buyers' email in a friendly and legally confident paragraph. Review module-12.md, Unit: Risk Management, and Unit: A Practical Guide to Everyday Practice.",
      remediation: "module-12.md#unit-risk-management",
    },
  ],
  passingScore: 0.7,
  criticalCriteria: [
    "Does not answer the buyers' questions about getting out of the purchase or about suing anybody, and refers them to their own attorney, identifying 22 TAC § 537.11(b) as forbidding a licence holder to give legal advice.",
    "States that the file is added to and never altered — nothing removed, corrected in place or re-dated — and identifies § 1101.652(a-1)(2) and 22 TAC § 535.2(h) as the reasons.",
    "Names 22 TAC § 535.2 and Occupations Code § 1101.803 as the reasons the broker is told immediately and in full, rather than after the position is tidied.",
  ],
  remediation: {
    onFailure:
      "A student who does not reach the points to pass, or who misses any critical element, is returned to the screens below with the instructor's written rationale for each task answered wrongly, and works the capstone again. Because the capstone is integrative, the remediation is routed by the task missed rather than as a single block: a sequence failure sends the student back to the buyer-side screens, an appointment failure to the intermediary screens, and a records or response failure to the supervision screens.",
    revisit: ["t05u6-s1", "t12u2-s1", "t06u3-s1", "t03u3-s1", "t09u5-s1", "t10u3-s1", "t08u2-s1", "t12u5-s1"],
    reattemptPermitted: true,
  },
  optionalReflection: {
    prompt:
      "Optional and never graded: nothing in this file was done by a dishonest person. Pick the single habit that would have prevented the most of it, and say when in your week you would have to perform it. Nothing here is scored and nothing is unlocked by it.",
    required: false,
    graded: false,
    affectsScore: false,
  },
  instructorReview: {
    required: true,
    reason:
      "Task SC5-T7 is graded against a rubric that includes a required refusal to answer the buyers' legal questions and a required instruction not to alter the file, and 22 TAC § 535.65(g)(2)(D) makes a qualified instructor responsible for providing the answers and the rationale for the grading of course work. Because a student may reach a passing point total while writing a reassuring answer to the buyers, the instructor confirms all three critical elements before the capstone is recorded as passed.",
  },
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   Exports and the set-level invariants
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

export const SCENARIOS = Object.freeze([SC1, SC2, SC3, SC4, SC5]);

export const SCENARIO_COUNT = SCENARIOS.length;

export const TOPIC_SCENARIOS = Object.freeze(SCENARIOS.filter((item) => item.placement.timeAttribution === "TOPIC"));

export const COURSE_LEVEL_SCENARIOS = Object.freeze(SCENARIOS.filter((item) => item.placement.timeAttribution === "COURSE_LEVEL"));

export const TOTAL_TASKS = SCENARIOS.reduce((sum, item) => sum + item.tasks.length, 0);

export const TOTAL_MINUTES = SCENARIOS.reduce((sum, item) => sum + item.minutes, 0);

/**
 * What the scenario set actually assesses. Returns the distinct topics and units the five scenarios
 * reach, each scenario's placement and time attribution, the task mix, the referral moments, and the
 * required screens the set depends on — the figures a coverage matrix or a submission exhibit needs
 * without re-deriving them from the scenario bodies.
 */
export function scenarioCoverage() {
  const topics = new Set();
  const units = new Set();
  const screens = new Set();
  const taskTypes = { selection: 0, computation: 0, "short-answer": 0 };
  let referralTasks = 0;

  for (const item of SCENARIOS) {
    for (const topicCode of item.assessesTopics) topics.add(topicCode);
    for (const unitCode of item.assessesUnits) units.add(unitCode);
    for (const task of item.tasks) {
      taskTypes[task.type] += 1;
      if (task.referral === true) referralTasks += 1;
      for (const screenId of task.teaches) screens.add(screenId);
    }
  }

  return Object.freeze({
    scenarioCount: SCENARIO_COUNT,
    minimumRequired: ASSESSMENT_REQUIREMENTS.minScenarioExercises,
    creditHours: ASSESSMENT_REQUIREMENTS.creditHours,
    topicScenarios: TOPIC_SCENARIOS.length,
    courseLevelScenarios: COURSE_LEVEL_SCENARIOS.length,
    totalTasks: TOTAL_TASKS,
    totalMinutes: TOTAL_MINUTES,
    taskTypes: Object.freeze({ ...taskTypes }),
    referralTasks,
    topics: Object.freeze(TOPIC_ORDER.filter((code) => topics.has(code))),
    topicsNotAssessed: Object.freeze(TOPIC_ORDER.filter((code) => !topics.has(code))),
    units: Object.freeze(ALL_UNITS.map((unit) => unit.code).filter((code) => units.has(code))),
    requiredScreensReliedOn: Object.freeze([...screens].sort()),
    placements: Object.freeze(
      SCENARIOS.map((item) =>
        Object.freeze({
          id: item.id,
          title: item.title,
          afterTopic: item.placement.afterTopic,
          timeAttribution: item.placement.timeAttribution,
          attributedToTopic: item.placement.attributedToTopic,
          minutes: item.minutes,
          unlockRequires: item.placement.unlockRequires,
          assessesTopics: item.assessesTopics,
          assessesUnits: item.assessesUnits,
          tasks: item.tasks.length,
          taskTypes: Object.freeze(
            item.tasks.reduce((counts, task) => ({ ...counts, [task.type]: (counts[task.type] ?? 0) + 1 }), {}),
          ),
          totalPoints: item.totalPoints,
          pointsToPass: item.pointsToPass,
          criticalCriteria: item.passingCriteria.criticalCriteria.length,
          referralTasks: item.referralTasks,
          instructorReviewRequired: item.instructorReview.required,
        }),
      ),
    ),
  });
}

/* ── 1. The floor from § 535.62(b)(7)(B), compared rather than asserted ─────────────────────────── */
{
  const key = "minScenarioExercises";
  if (!(key in ASSESSMENT_REQUIREMENTS)) {
    throw new Error(
      `law-of-agency-scenarios: ASSESSMENT_REQUIREMENTS has no key ${JSON.stringify(key)} — the rule lock must state it; this file will not assume a value`,
    );
  }
  if (SCENARIO_COUNT < ASSESSMENT_REQUIREMENTS[key]) {
    throw new Error(
      `law-of-agency-scenarios: ${SCENARIO_COUNT} scenarios against the § 535.62(b)(7)(B) floor of ${ASSESSMENT_REQUIREMENTS[key]} for a ${ASSESSMENT_REQUIREMENTS.creditHours}-hour course`,
    );
  }
}

/* ── 2. The minutes reconcile with the budget, topic by topic and at course level ───────────────
   This is the invariant that keeps the capstone honest. If someone later re-attributes it to T12,
   or adds a sixth scenario without budgeting it, one of these throws. */
{
  for (const budget of BUDGET) {
    const placed = TOPIC_SCENARIOS.filter((item) => item.placement.attributedToTopic === budget.topicCode);
    if (placed.length !== budget.scenarios) {
      throw new Error(
        `law-of-agency-scenarios: ${budget.topicCode} budgets ${budget.scenarios} scenario(s) but ${placed.length} are attributed to it`,
      );
    }
    const minutes = placed.reduce((sum, item) => sum + item.minutes, 0);
    if (minutes !== budget.scenarioMinutes) {
      throw new Error(
        `law-of-agency-scenarios: ${budget.topicCode} budgets ${budget.scenarioMinutes} scenario minutes but the authored scenarios spend ${minutes}`,
      );
    }
  }
  if (COURSE_LEVEL_SCENARIOS.length !== COURSE_LEVEL.capstoneScenarios) {
    throw new Error(
      `law-of-agency-scenarios: the time budget records ${COURSE_LEVEL.capstoneScenarios} course-level scenario(s) and ${COURSE_LEVEL_SCENARIOS.length} are authored`,
    );
  }
  const capstoneMinutes = COURSE_LEVEL_SCENARIOS.reduce((sum, item) => sum + item.minutes, 0);
  if (capstoneMinutes !== COURSE_LEVEL.minutes) {
    throw new Error(
      `law-of-agency-scenarios: the capstone spends ${capstoneMinutes} minutes against COURSE_LEVEL.minutes of ${COURSE_LEVEL.minutes}`,
    );
  }
  if (TOTAL_MINUTES !== BUDGET.reduce((sum, b) => sum + b.scenarioMinutes, 0) + COURSE_LEVEL.minutes) {
    throw new Error("law-of-agency-scenarios: the set's minutes do not reconcile with the topic budgets plus the course-level allowance");
  }
  for (const item of SCENARIOS) {
    if (item.minutes !== RATES.activityMinutes.scenario) {
      throw new Error(`law-of-agency-scenarios ${item.id}: a scenario is allowed ${RATES.activityMinutes.scenario} minutes by the provider time model`);
    }
  }
}

/* ── 3. Distribution. The set must sit at materially different points in the course ─────────────── */
{
  const placements = SCENARIOS.map((item) => item.placement.afterTopic);
  if (new Set(placements).size !== placements.length) {
    throw new Error("law-of-agency-scenarios: two scenarios are placed after the same topic; the set must be distributed across the course");
  }
  const atTheEnd = placements.filter((code) => code === FINAL_TOPIC).length;
  if (atTheEnd > 1) throw new Error("law-of-agency-scenarios: more than one scenario is placed after the final topic");
  const earliestIndex = Math.min(...placements.map((code) => TOPIC_ORDER.indexOf(code)));
  if (earliestIndex > Math.floor(TOPIC_ORDER.length / 2)) {
    throw new Error("law-of-agency-scenarios: the earliest scenario sits past the midpoint of the course; the set is back-loaded");
  }
  for (const item of SCENARIOS) {
    const afterIndex = TOPIC_ORDER.indexOf(item.placement.afterTopic);
    for (const required of item.placement.unlockRequires) {
      if (TOPIC_ORDER.indexOf(required) > afterIndex) {
        throw new Error(`law-of-agency-scenarios ${item.id}: unlockRequires names ${required}, which the student has not reached at the placement point`);
      }
    }
  }
}

/* ── 4. The capstone is integrative, not the twelfth topic's exercise ───────────────────────────── */
{
  for (const item of COURSE_LEVEL_SCENARIOS) {
    if (item.assessesTopics.length < 4) {
      throw new Error(
        `law-of-agency-scenarios ${item.id}: a course-level scenario draws on the whole course; it assesses ${item.assessesTopics.length} topic(s)`,
      );
    }
    if (item.assessesTopics.length === 1 && item.assessesTopics[0] === item.placement.afterTopic) {
      throw new Error(`law-of-agency-scenarios ${item.id}: a course-level scenario that assesses only the topic it sits behind is that topic's exercise`);
    }
    if (item.placement.unlockRequires.length !== TOPIC_ORDER.length) {
      throw new Error(`law-of-agency-scenarios ${item.id}: the capstone unlocks only after every topic is complete`);
    }
  }
}

/* ── 5. Every task type is represented, so the set cannot degrade into one format ───────────────── */
{
  const coverage = scenarioCoverage();
  for (const [type, count] of Object.entries(coverage.taskTypes)) {
    if (count === 0) throw new Error(`law-of-agency-scenarios: no task of type ${type} in the set`);
  }
  if (coverage.referralTasks < SCENARIO_COUNT) {
    throw new Error("law-of-agency-scenarios: the set must credit referral at least once in every scenario");
  }
}

/* ── 6. Nothing in the set touches an optional-reference block ──────────────────────────────────── */
{
  const optionalScreens = new Set();
  for (const [screenId, screen] of SCREEN_INDEX) {
    if (!screen.required || screen.noAssessmentMayDependOnThis) optionalScreens.add(screenId);
  }
  for (const item of SCENARIOS) {
    for (const task of item.tasks) {
      for (const screenId of task.teaches) {
        if (optionalScreens.has(screenId)) {
          throw new Error(`law-of-agency-scenarios ${task.id}: depends on optional-reference screen ${screenId}`);
        }
      }
    }
    for (const screenId of item.remediation.revisit) {
      if (optionalScreens.has(screenId)) {
        throw new Error(`law-of-agency-scenarios ${item.id}: remediation sends a student to optional-reference screen ${screenId}`);
      }
    }
  }
  if (optionalScreens.size === 0) {
    throw new Error("law-of-agency-scenarios: the block maps carry no optional-reference block, so this check is not doing anything — verify the maps before removing it");
  }
}

/* ── 7. The length ban and the approval ban, applied once more to the whole frozen set ──────────── */
assertNoBannedText("law-of-agency-scenarios (set)", SCENARIOS);

/* ── 8. Task ids are unique across the set and points are positive integrals of the whole ───────── */
{
  const ids = SCENARIOS.flatMap((item) => item.tasks.map((task) => task.id));
  if (new Set(ids).size !== ids.length) throw new Error("law-of-agency-scenarios: duplicate task id across the set");
  for (const item of SCENARIOS) {
    if (item.pointsToPass <= 0 || item.pointsToPass > item.totalPoints) {
      throw new Error(`law-of-agency-scenarios ${item.id}: pointsToPass ${item.pointsToPass} is not inside 0..${item.totalPoints}`);
    }
    const highest = Math.max(...item.tasks.map((task) => task.points));
    if (item.totalPoints - highest < item.pointsToPass) {
      throw new Error(
        `law-of-agency-scenarios ${item.id}: a student could fail the single highest-value task and still be unable to pass; that makes one task a hidden gate rather than a graded item`,
      );
    }
  }
}

/* ── 9. The guards are proved, not merely declared ──────────────────────────────────────────────
   A check whose only failure mode is silence is not a check. These four probes prove that the
   length ban, the reveal gate, the approval scan and its negation-awareness actually fire, so that
   invariant 7 passing means something rather than meaning the patterns never match anything. */
{
  const fires = (label, probe) => {
    try {
      assertNoBannedText("self-test", probe);
    } catch {
      return true;
    }
    throw new Error(`law-of-agency-scenarios: the ${label} guard did not fire on a probe designed to trip it`);
  };
  fires("length-phrase", { prompt: "Answer in at least 150 words." });
  fires("length-phrase", { rubric: ["States the position in at least three sentences."] });
  fires("reveal-gate", { prompt: "Type your answer to reveal the rationale." });
  fires("approval", { context: "This is a TREC-approved course." });
  /* And the negation-aware half: the required disclaimer must survive the same scan. */
  assertNoBannedText("self-test", { context: "This is not a TREC-approved course and no Texas credit is offered for it." });
  /* A length-shaped key is caught by name as well as by phrase. */
  try {
    assertNoLengthKeys("self-test", { minWords: 200 });
    throw new Error("law-of-agency-scenarios: the length-key guard did not fire on a probe designed to trip it");
  } catch (error) {
    if (!/length requirement key/.test(error.message)) throw error;
  }
}

export default Object.freeze({
  REGULATORY_BASIS,
  SCENARIOS,
  SCENARIO_COUNT,
  TOPIC_SCENARIOS,
  COURSE_LEVEL_SCENARIOS,
  TOTAL_TASKS,
  TOTAL_MINUTES,
  scenarioCoverage,
});
