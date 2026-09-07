import test from "node:test";
import assert from "node:assert/strict";
import { validateTexasAssessments } from "../scripts/lib/texas-assessment-evidence.mjs";

const item = (id, extra = {}) => ({ id, tests: "T01U1", prompt: `Case ${id} considers a distinct transaction issue`, choices: ["First answer", "Second answer", "Third answer", "Fourth answer"], correctChoice: 0, rationale: "Because the specified rule applies.", source: "Test source", section: "Section 1", ...extra });
const inputs = () => {
  const bank = Array.from({ length: 132 }, (_, i) => item(`F${i + 1}`));
  const pairs = [["A", "B"], ["A", "C"], ["A", "D"], ["B", "C"], ["B", "D"], ["C", "D"]];
  const forms = { A: [], B: [], C: [], D: [] };
  let offset = 0;
  for (const pair of pairs) {
    const ids = bank.slice(offset, offset + 18).map(item => item.id);
    for (const version of pair) forms[version].push(...ids);
    offset += 18;
  }
  for (const version of Object.keys(forms)) { forms[version].push(...bank.slice(offset, offset + 6).map(item => item.id)); offset += 6; }
  return {
    topics: [{ code: "T01", units: [{ code: "T01U1" }] }],
    quizzes: { T01: [1, 2, 3].map(i => item(`Q${i}`, { prompt: `Retrieval problem ${i}` })) },
    replacements: { T01: [1, 2, 3].map(i => item(`R${i}`, { replaces: `Q${i}`, prompt: `Related application ${i}` })) },
    scenarios: [1, 2, 3].map(i => ({ id: `SC${i}`, afterTopic: "T01", context: `Case context ${i}`, tasks: [{ id: `task${i}`, prompt: "Resolve this case" }] })),
    bank, forms,
  };
};

test("structural assessment evidence computes real counts and all six overlaps", () => {
  const evidence = validateTexasAssessments(inputs());
  assert.equal(evidence.pass, true);
  const overlap = evidence.checks.find(check => check.name.startsWith("pairwise"));
  assert.equal(overlap.detail.length, 6);
  assert.ok(overlap.detail.every(row => row.count === 18 && row.fraction === 0.3));
  assert.equal(evidence.separationCandidates.length, 132);
  assert.match(evidence.limitation, /do not certify/);
});

test("missing replacements cannot be hidden behind a matching total count", () => {
  const args = inputs();
  args.replacements.T01[1].replaces = "Q1";
  assert.equal(validateTexasAssessments(args).pass, false);
});

test("duplicate final content, invalid answer keys, and shared final prompts fail", () => {
  for (const mutate of [
    args => { args.bank[1].prompt = args.bank[0].prompt; },
    args => { args.bank[0].correctChoice = 8; },
    args => { args.bank[0].choices[1] = args.bank[0].choices[0]; },
    args => { args.bank[0].prompt = args.quizzes.T01[0].prompt; },
    args => { args.forms.A[0] = "absent"; },
    args => { args.forms.A[0] = args.forms.A[1]; },
    args => { args.bank[0].section = ""; },
  ]) {
    const args = inputs(); mutate(args);
    assert.equal(validateTexasAssessments(args).pass, false);
  }
});

test("a bank that exists without examination forms is incomplete", () => {
  const args = inputs(); args.forms = {};
  assert.equal(validateTexasAssessments(args).pass, false);
});
