import test from "node:test";
import assert from "node:assert/strict";
import { inspectTexasChapter, buildTexasTimeEvidence } from "../scripts/lib/texas-course-evidence.mjs";

const chapter = `# Module 01
Not timed front matter.
## T01U1 — Required unit
Four actual teaching words.
### Applied exercise: Reason it out
Write your reasoning and compare both outcomes.
#### Feedback
Explain the missing fact and the consequence.
### Module recap
Review the distinction.
Sources: [Reference](https://example.test/)
## Optional reference: Extra
### Applied exercise: Optional task
This is not required learning time.
`;

test("chapter evidence excludes metadata, optional work, references and nested activity feedback", () => {
  const result = inspectTexasChapter(chapter, ["T01U1"]);
  assert.equal(result.wordsBySegment.instruction, 4);
  assert.equal(result.exercises.length, 1);
  assert.equal(result.exercises[0].kind, "appliedExercise");
  assert.ok(result.wordsBySegment.optional > 0);
  assert.ok(result.wordsBySegment.references > 0);
  assert.equal(Object.values(result.wordsBySegment).reduce((a, b) => a + b), result.totalWords);
});

test("outline headings, changed unit identity and malformed recaps cannot satisfy completeness", () => {
  assert.throws(() => inspectTexasChapter(chapter.replace("T01U1", "T02U1"), ["T01U1"]), /order/);
  assert.throws(() => inspectTexasChapter(chapter.replace("Four actual teaching words.", ""), ["T01U1"]), /no instructional prose/);
  assert.throws(() => inspectTexasChapter(chapter.replace("### Module recap", "### Summary"), ["T01U1"]), /recap/);
  assert.throws(() => inspectTexasChapter(chapter.replace("## Optional reference: Extra", "## T01U2 — Late unit"), ["T01U1"]), /follows/);
});

const input = () => ({
  form: { formNumber: "TEST", totalMinutes: 100, courseHours: 2 },
  topics: [{ code: "T01", topic: "Test topic", subtotalMinutes: 100, units: [{ code: "T01U1" }] }],
  chapters: [{ topicCode: "T01", markdown: chapter }],
  assessments: [{ topicCode: "T01", quiz: [{ id: "q1", prompt: "A real question" }], misconceptions: [], scenarios: [] }],
  courseScenarios: [],
});

test("time evidence fails short topics and missing actual instruments instead of using planned allowances", () => {
  const result = buildTexasTimeEvidence(input());
  assert.equal(result.status, "INCOMPLETE");
  assert.equal(result.rows[0].quizItems, 1);
  assert.equal(result.rows[0].activitySeconds, 17 * 60); // one exercise, one primary, one recap
  assert.equal(result.courseLevelSeconds, 0);
  assert.equal(result.timeModelPass, false);
  assert.equal(result.assessmentCountPass, false);
  assert.equal(result.rateBasis.timeStudyPerformed, false);
});

test("a course-level capstone cannot cure a topic deficit", () => {
  const args = input();
  args.courseScenarios = Array.from({ length: 10 }, (_, i) => ({ id: `case${i}`, narrative: `Authored case ${i}` }));
  const result = buildTexasTimeEvidence(args);
  assert.ok(result.grandMinutes > result.prescribedMinutes);
  assert.equal(result.timeModelPass, false);
});

test("same instrument counted twice or an empty planned shell refuses reporting", () => {
  const args = input();
  args.courseScenarios = [{ id: "q1", narrative: "Duplicated identity" }];
  assert.throws(() => buildTexasTimeEvidence(args), /duplicate instrument/);
  args.courseScenarios = [{ id: "shell" }];
  assert.throws(() => buildTexasTimeEvidence(args), /authored prompt/);
});
