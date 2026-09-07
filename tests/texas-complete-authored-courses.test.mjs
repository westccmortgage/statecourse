import test from "node:test";
import assert from "node:assert/strict";
import { loadTexasReviewerCourse } from "../scripts/lib/load-texas-reviewer-course.mjs";
import { createTexasReviewerEngine } from "../config/texas/complete-course-reviewer-engine.mjs";

const at = "2026-09-07T12:00:00.000Z";
const scenarioAnswers = scenario => Object.fromEntries(scenario.tasks.map(task => [task.id,
  task.type === "selection" ? task.correctChoice : task.type === "computation" ? task.answer ?? task.correctValue ?? task.expected : {
    text: "TEST FIXTURE: a reviewer-authored response satisfying the supplied rubric; not a student assessment record.",
    reviewerId: "automated-fixture", reviewRationale: "Fixture drives each authored rubric criterion for a workflow test only.",
    criteria: task.rubric.map(() => true),
  }]));
const courseLevel = scenario => scenario.courseLevel === true || scenario.placement?.timeAttribution === "COURSE_LEVEL";
const placement = scenario => scenario.afterTopic ?? scenario.placement?.afterTopic;

// Explicit inventory: add a course only after its complete artifacts exist. No silent missing-file skips.
for (const slug of ["law-of-contracts", "promulgated-contract-forms", "real-estate-finance"]) {
  test(`${slug}: all actual units, every formative choice/replacement, every scenario and all four finals run non-credit`, async () => {
    const { definition, chapters, provenance } = await loadTexasReviewerCourse(slug);
    const engine = createTexasReviewerEngine(definition);
    assert.match(provenance.digest, /^[a-f0-9]{64}$/);
    assert.equal((await loadTexasReviewerCourse(slug)).provenance.digest, provenance.digest);
    let state = engine.openReviewer({ learnerId: "automated-review-fixture", at });
    assert.throws(() => engine.getFinalQuestions(state), /identity/);
    state = engine.recordIdentityCheck(state, { method: "TEST_ONLY", evidenceRef: "fixture-not-human-identity", at });
    assert.throws(() => engine.getFinalQuestions(state), /no open/);
    let primaryPaths = 0, replacementPaths = 0, scenarioPaths = 0;
    for (const topic of definition.topics) {
      const chapter = chapters.find(item => item.topicCode === topic.code);
      assert.deepEqual(chapter.blocks.map(block => block.code), topic.units.map(unit => unit.code));
      const ids = new Set(definition.quizzes[topic.code].map(item => item.id));
      for (const block of chapter.blocks) {
        const retrieval = block.screens.find(screen => screen.type === "retrieval");
        assert.ok(ids.has(retrieval.questionId), `${block.code}: real retrieval ID`);
        for (const screen of block.screens.filter(item => item.type !== "retrieval")) {
          const start = screen.from === "^" ? 0 : chapter.markdown.indexOf(screen.from);
          const end = screen.to === "$" ? chapter.markdown.length : chapter.markdown.indexOf(screen.to, start + 1);
          assert.ok(start >= 0 && end > start, `${block.code}: nonempty actual screen ${screen.title}`);
        }
      }
      for (const unit of topic.units) state = engine.readUnit(state, { unitCode: unit.code, at });
      for (const primary of definition.quizzes[topic.code]) {
        for (let choice = 0; choice < 4; choice++) {
          const trial = engine.answerQuiz(state, { primaryId: primary.id, choice, at });
          assert.equal(trial.quiz[primary.id].passed, choice === primary.correctChoice, primary.id);
          primaryPaths++;
        }
        const wrong = engine.answerQuiz(state, { primaryId: primary.id, choice: (primary.correctChoice + 1) % 4, at });
        const replacement = definition.replacements[topic.code].find(item => item.replaces === primary.id);
        assert.ok(replacement && replacement.id !== primary.id);
        for (let choice = 0; choice < 4; choice++) {
          const trial = engine.answerQuiz(wrong, { primaryId: primary.id, choice, at });
          assert.equal(trial.quiz[primary.id].servedItemId, replacement.id);
          assert.equal(trial.quiz[primary.id].passed, choice === replacement.correctChoice, replacement.id);
          replacementPaths++;
        }
        state = engine.answerQuiz(wrong, { primaryId: primary.id, choice: replacement.correctChoice, at });
      }
      for (const check of definition.misconceptions.filter(item => item.topicCode === topic.code)) {
        state = engine.reviewMisconception(state, { id: check.id, choice: check.correctChoice, at });
      }
      for (const scenario of definition.scenarios.filter(item => !courseLevel(item) && placement(item) === topic.code)) {
        assert.throws(() => engine.completeTopic(state, { topicCode: topic.code, at }), /scenario/);
        const answers = scenarioAnswers(scenario);
        for (const task of scenario.tasks) {
          const trials = task.type === "selection" ? [0, 1, 2, 3] : task.type === "computation"
            ? [answers[task.id], answers[task.id] + (task.tolerance ?? 0) + 1] : [answers[task.id]];
          for (const answer of trials) {
            const trial = engine.gradeScenario(state, { id: scenario.id, responses: { ...answers, [task.id]: answer }, at });
            assert.equal(trial.scenarios[scenario.id].grades.find(grade => grade.id === task.id).passed,
              task.type === "selection" ? answer === task.correctChoice : task.type === "computation" ? answer === answers[task.id] : true);
            scenarioPaths++;
          }
        }
        state = engine.gradeScenario(state, { id: scenario.id, responses: answers, at });
        assert.equal(state.scenarios[scenario.id].passed, true);
      }
      state = engine.completeTopic(state, { topicCode: topic.code, at });
    }
    for (const scenario of definition.scenarios.filter(courseLevel)) state = engine.gradeScenario(state, { id: scenario.id, responses: scenarioAnswers(scenario), at });
    state = engine.completeCoursework(state, { at });
    assert.equal(state.status, "COURSEWORK_COMPLETE");
    const bank = new Map(definition.bank.map(item => [item.id, item]));
    for (const [index, version] of Object.keys(definition.forms).entries()) {
      const ready = { ...structuredClone(state), rotationIndex: index };
      const open = engine.openFinalAttempt(ready, { at });
      assert.equal(open.finalAttempts[0].version, version);
      const questions = engine.getFinalQuestions(open);
      assert.equal(questions.length, 60);
      const answers = Object.fromEntries(questions.map(item => {
        assert.deepEqual(Object.keys(item).sort(), ["choices", "id", "prompt"]);
        const authored = bank.get(item.id);
        return [item.id, item.choices.indexOf(authored.choices[authored.correctChoice])];
      }));
      const passed = engine.submitFinal(open, { answers, at });
      assert.equal(passed.finalAttempts[0].correct, 60);
      assert.equal(passed.status, "PASSED_NON_CREDIT");
      assert.equal(passed.creditEligible, false);
      assert.equal(passed.certificate, null);
      assert.throws(() => engine.getFinalQuestions(passed), /no open/);
      const constant = engine.submitFinal(open, { answers: Object.fromEntries(questions.map(item => [item.id, 0])), at });
      assert.equal(constant.finalAttempts[0].correct, 15);
      assert.equal(constant.status, "REMEDIATION_REQUIRED");
    }
    assert.equal(primaryPaths, Object.values(definition.quizzes).flat().length * 4);
    assert.equal(replacementPaths, Object.values(definition.replacements).flat().length * 4);
    assert.ok(scenarioPaths > 0);
    for (const method of [engine.openEnrollment, engine.takePayment, engine.issueCertificate, engine.reportCredit]) assert.throws(method, /no production/);
  });
}
