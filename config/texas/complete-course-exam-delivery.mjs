/** PROTECTED internal reviewer utility. Never import into public practice.
 * Stable permutation permits reproducible review, not production examination security.
 * Correct-position counts differ by at most one; their sequence is independently shuffled.
 * Returned question views omit answers, rationales, source pins and learning-objective hints.
 */
const rng = seed => {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
};
const shuffle = (list, random) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export function prepareTexasFinal({ bank, itemIds, version, freeze }) {
  if (!Array.isArray(itemIds) || !itemIds.length || new Set(itemIds).size !== itemIds.length
    || !version || !freeze) throw new Error("A distinct item list, version and freeze are required");
  const byId = new Map(bank.map(item => [item.id, item]));
  const random = rng(`${freeze}:${version}:balanced-choice-v1`);
  const positions = shuffle(itemIds.map((_, index) => index % 4), random);
  const keyed = itemIds.map((id, index) => {
    const item = byId.get(id);
    if (!item || item.choices?.length !== 4 || new Set(item.choices).size !== 4
      || !Number.isInteger(item.correctChoice) || item.correctChoice < 0 || item.correctChoice > 3)
      throw new Error(`Invalid protected item: ${id}`);
    const distractors = shuffle([0, 1, 2, 3].filter(choice => choice !== item.correctChoice), random);
    distractors.splice(positions[index], 0, item.correctChoice);
    return { id, prompt: item.prompt, choices: distractors.map(choice => item.choices[choice]), correctChoice: positions[index] };
  });
  return Object.freeze({
    questions: Object.freeze(keyed.map(({ id, prompt, choices }) => Object.freeze({ id, prompt, choices: Object.freeze(choices) }))),
    // Closure retains canonical-to-display mapping. No answer key is returned with the question view.
    grade(answers) {
      if (!answers || typeof answers !== "object" || Array.isArray(answers)
        || Object.keys(answers).length !== keyed.length
        || keyed.some(item => !Number.isInteger(answers[item.id]) || answers[item.id] < 0 || answers[item.id] > 3))
        throw new Error("Answer every final item with a valid choice");
      const missed = keyed.filter(item => answers[item.id] !== item.correctChoice).map(item => item.id);
      return { correct: keyed.length - missed.length, total: keyed.length, missed };
    },
  });
}
