/** Structural evidence is not a semantic correctness or exam-separation certification. */
import { createHash } from "node:crypto";
import { ASSESSMENT_REQUIREMENTS } from "../../config/texas/trec-rules-source-lock.mjs";

const need = key => {
  if (!(key in ASSESSMENT_REQUIREMENTS)) throw new Error(`Missing rule-source requirement: ${key}`);
  return ASSESSMENT_REQUIREMENTS[key];
};
const normalized = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const unitOf = item => item.tests ?? item.unitCode ?? item.unit;
const topicOf = item => String(unitOf(item) ?? "").slice(0, 3);
const tokens = text => new Set(normalized(text).split(" ").filter(word => word.length > 2));
function similarity(a, b) {
  const A = tokens(a), B = tokens(b);
  const shared = [...A].filter(word => B.has(word)).length;
  return shared / Math.max(1, A.size + B.size - shared);
}

export function validateTexasAssessments({ topics, quizzes, replacements, scenarios, bank, forms, misconceptions = [], exercisePrompts = [] }) {
  const checks = [];
  const check = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });
  const primaries = Object.values(quizzes).flat();
  const related = Object.values(replacements).flat();
  const items = [...primaries, ...related, ...bank];
  const units = new Set(topics.flatMap(topic => topic.units.map(unit => unit.code)));
  const topicCodes = new Set(topics.map(topic => topic.code));
  const ids = items.map(item => item.id);
  check("unique nonempty item identities", ids.every(id => typeof id === "string" && id.length > 0) && new Set(ids).size === ids.length, { count: ids.length });
  const malformed = items.filter(item => !Array.isArray(item.choices) || item.choices.length !== 4
    || item.choices.some(choice => typeof choice !== "string" || !choice.trim())
    || new Set(item.choices.map(normalized)).size !== 4 || !Number.isInteger(item.correctChoice)
    || item.correctChoice < 0 || item.correctChoice > 3 || !item.prompt?.trim() || !item.rationale?.trim());
  check("all items have a prompt, four distinct choices, a valid key and rationale", !malformed.length, { invalid: malformed.map(item => item.id) });
  const untraced = items.filter(item => !units.has(unitOf(item)) || !item.source || !item.section);
  check("all items name an actual required unit and a pinpoint source", !untraced.length, { invalid: untraced.map(item => item.id) });
  const unknownGroups = [...Object.keys(quizzes), ...Object.keys(replacements)].filter(code => !topicCodes.has(code));
  check("no unknown assessment topic groups", !unknownGroups.length, unknownGroups);
  const uncovered = [...units].filter(unit => !primaries.some(item => unitOf(item) === unit));
  check("every outline unit has primary retrieval practice", !uncovered.length, uncovered);
  const shortTopics = topics.filter(topic => (quizzes[topic.code]?.length ?? 0) < need("minQuestionsPerTopicQuiz"));
  check("each topic meets the primary-quiz floor", !shortTopics.length, shortTopics.map(topic => topic.code));
  const misplaced = Object.entries(quizzes).flatMap(([code, list]) => list.filter(item => topicOf(item) !== code).map(item => item.id));
  check("quiz placement matches unit identity", !misplaced.length, misplaced);
  const replacementFailures = [];
  for (const primary of primaries) {
    const matches = related.filter(item => item.replaces === primary.id);
    if (matches.length !== 1 || unitOf(matches[0]) !== unitOf(primary)
      || normalized(matches[0].prompt) === normalized(primary.prompt)) replacementFailures.push(primary.id);
  }
  const orphanReplacements = related.filter(item => !primaries.some(primary => primary.id === item.replaces));
  check("every primary has exactly one distinct related replacement, with no orphans", !replacementFailures.length && !orphanReplacements.length,
    { primaries: replacementFailures, orphans: orphanReplacements.map(item => item.id) });

  check("actual scenarios meet the minimum", scenarios.length >= need("minScenarioExercises"), { count: scenarios.length });
  const invalidScenarios = scenarios.filter(scenario => !scenario.id || !topicCodes.has(scenario.afterTopic ?? scenario.placement?.afterTopic)
    || !String(scenario.context ?? scenario.narrative ?? scenario.prompt ?? "").trim()
    || !Array.isArray(scenario.tasks) || !scenario.tasks.length
    || scenario.tasks.some(task => !task.id || !String(task.prompt ?? "").trim()));
  check("scenarios have authored contexts, tasks and valid placement", !invalidScenarios.length, invalidScenarios.map(scenario => scenario.id));
  check("scenario identities are unique", new Set(scenarios.map(s => s.id)).size === scenarios.length, { count: scenarios.length });
  check("secure bank meets its own minimum", bank.length >= need("minExamBankQuestions"), { count: bank.length, minimum: need("minExamBankQuestions") });
  const byId = new Map(bank.map(item => [item.id, item]));
  const versions = Object.entries(forms);
  check("enough different examination versions exist", versions.length >= need("minExamVersions"), { count: versions.length });
  const formErrors = [];
  for (const [version, itemIds] of versions) {
    if (!Array.isArray(itemIds)) { formErrors.push({ version, reason: "not an item list" }); continue; }
    if (itemIds.length < need("minQuestionsPerExamVersion")) formErrors.push({ version, reason: "too short" });
    if (new Set(itemIds).size !== itemIds.length) formErrors.push({ version, reason: "duplicate item" });
    if (itemIds.some(id => !byId.has(id))) formErrors.push({ version, reason: "unknown item" });
    const covered = new Set(itemIds.filter(id => byId.has(id)).map(id => topicOf(byId.get(id))));
    if ([...topicCodes].some(code => !covered.has(code))) formErrors.push({ version, reason: "missing topic" });
  }
  check("every version has enough distinct known items and every topic", !formErrors.length, formErrors);
  const overlaps = [];
  for (let a = 0; a < versions.length; a++) for (let b = a + 1; b < versions.length; b++) {
    if (!Array.isArray(versions[a][1]) || !Array.isArray(versions[b][1])) continue;
    const left = new Set(versions[a][1]), right = new Set(versions[b][1]);
    const count = [...left].filter(id => right.has(id)).length;
    // Use the shorter version: a longer version cannot conceal the fraction of repeats in a shorter one.
    overlaps.push({ pair: `${versions[a][0]}/${versions[b][0]}`, count, fraction: count / Math.max(1, Math.min(left.size, right.size)) });
  }
  check("pairwise overlap stays within the source-locked cap", overlaps.every(row => row.fraction <= need("maxCrossVersionOverlapFraction")), overlaps);
  const formative = [...primaries, ...related, ...misconceptions, ...exercisePrompts];
  const exactLeaks = bank.filter(item => formative.some(practice => normalized(practice.prompt ?? practice.text) === normalized(item.prompt)));
  check("no final prompt is an exact formative prompt", !exactLeaks.length, exactLeaks.map(item => item.id));
  const duplicateFinals = bank.filter((item, index) => bank.slice(0, index).some(previous => normalized(previous.prompt) === normalized(item.prompt)));
  check("secure prompts are not duplicate items with new identities", !duplicateFinals.length, duplicateFinals.map(item => item.id));
  // Return nearest candidates for EVERY final. A low lexical score is never proof of separate reasoning.
  const separationCandidates = bank.map(item => {
    const nearest = formative.map(practice => ({ formativeId: practice.id, similarity: similarity(item.prompt, practice.prompt ?? practice.text) }))
      .sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    return { finalId: item.id, nearest };
  });
  return {
    schemaVersion: 1, pass: checks.every(entry => entry.pass), checks,
    artifactSha256: digest({ topics, quizzes, replacements, scenarios, bank, forms, misconceptions, exercisePrompts }),
    counts: { topics: topics.length, units: units.size, primary: primaries.length, replacement: related.length, scenarios: scenarios.length, secureItems: bank.length, versions: versions.length },
    separationCandidates,
    limitation: "Structural checks and nearest-text candidates do not certify legal accuracy or semantic separation. Each final item still requires review against instruction and formative fact patterns; names and numbers alone do not create a different question.",
  };
}
