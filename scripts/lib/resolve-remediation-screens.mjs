/**
 * CA-BLOCK — resolves a hand-authored `sourceSubsection` (e.g. "2.3") to the actual generated
 * instruction-screen id that covers it, by re-reading the frozen lesson and the already-generated
 * block map. Used once per assignment while merging agent-drafted retrieval banks, so nobody has
 * to hand-count subsection chunking to guess a screen id (error-prone) or wire in a wrong
 * remediationScreen that the registry's load-time invariants would catch anyway, just later.
 *
 * Usage: node scripts/lib/resolve-remediation-screens.mjs <lessonPath> <generatedBlocksPath>
 * Prints a JSON map: { "2.3": "pr2-b2-s2", ... } covering every subsection in the lesson.
 */
import fs from "node:fs";

function lineIndexOf(lines, needle) {
  if (needle === "^") return 0;
  const index = lines.findIndex((line) => line.trim() === needle.trim());
  if (index === -1) throw new Error(`heading not found in lesson: ${needle}`);
  return index;
}

export function resolveSubsectionScreens(lessonPath, generatedBlocksPath) {
  const lessonLines = fs.readFileSync(lessonPath, "utf8").replace(/\r/g, "").split("\n");
  const subsections = []; // { label, lineIndex }
  for (let i = 0; i < lessonLines.length; i += 1) {
    const sub = lessonLines[i].match(/^### (\d\.\d+) /);
    if (sub) subsections.push({ label: sub[1], lineIndex: i });
  }

  const generatedSource = fs.readFileSync(generatedBlocksPath, "utf8");
  /* Matches: { id: "pr2-b2-s2", sequence: 2, type: "instruction", ..., content: RANGE("from", "to")... */
  const screenPattern = /\{ id: "([\w-]+)", sequence: \d+, type: "instruction"[^}]*content: RANGE\("((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"\)/g;
  const screens = [];
  let match;
  while ((match = screenPattern.exec(generatedSource))) {
    const [, id, fromRaw, toRaw] = match;
    const from = fromRaw.replace(/\\"/g, '"');
    const to = toRaw.replace(/\\"/g, '"');
    screens.push({ id, fromLine: lineIndexOf(lessonLines, from), toLine: lineIndexOf(lessonLines, to) });
  }

  const result = {};
  for (const sub of subsections) {
    const owner = screens.find((screen) => sub.lineIndex >= screen.fromLine && sub.lineIndex < screen.toLine);
    if (!owner) throw new Error(`no instruction screen covers subsection ${sub.label}`);
    result[sub.label] = owner.id;
  }
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [lessonPath, generatedBlocksPath] = process.argv.slice(2);
  console.log(JSON.stringify(resolveSubsectionScreens(lessonPath, generatedBlocksPath), null, 2));
}
