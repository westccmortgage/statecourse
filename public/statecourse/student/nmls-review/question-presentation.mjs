// Presentation order only: option IDs stay unchanged for server-side grading.
// Called on an actual form transition, never a heartbeat. Does not validate an
// item or conceal a poor distractor; editorial/SME review remains separate.
function secureIndex(limit) {
  const ceiling = Math.floor(0x100000000 / limit) * limit;
  let value;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= ceiling);
  return value % limit;
}
export function presentOptions(options, chooseIndex = secureIndex) {
  const ordered = options.map((option) => ({ ...option }));
  for (let i = ordered.length - 1; i > 0; i--) {
    const j = chooseIndex(i + 1); [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  // Manuscript feedback refers to stable A–D choices. Randomize position, not
  // identity: relabelling would make an explanation refer to a different answer.
  return ordered.map((option) => ({ ...option, displayLabel: option.id }));
}
