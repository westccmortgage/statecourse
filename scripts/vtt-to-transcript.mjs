/**
 * Derive a protected transcript from a caption track.
 *
 * The transcript and the captions must say the same thing — a text equivalent that disagrees
 * with the spoken audio is worse than none, because a student relying on it is quietly given
 * different instruction. Deriving one from the other is what makes them agree by construction
 * rather than by review.
 *
 * Paragraphs break where the narration itself breaks: at a sentence boundary, and only once the
 * paragraph has run long enough to be worth breaking. Anchoring the break in the cue timeline
 * keeps the paragraphing a property of the recording instead of an arbitrary line count.
 *
 *   node scripts/vtt-to-transcript.mjs <input.vtt> [output.txt]
 *
 * With no output path the transcript is written beside the input with a .txt extension.
 */
import fs from "node:fs";
import path from "node:path";

const MIN_PARAGRAPH_SECONDS = 25;

function parseTimestamp(value) {
  const parts = value.trim().split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const seconds = Number(parts.pop());
  const minutes = Number(parts.pop() || 0);
  const hours = Number(parts.pop() || 0);
  if (![seconds, minutes, hours].every(Number.isFinite)) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function parseCues(vtt) {
  const cues = [];
  for (const rawBlock of vtt.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const block = rawBlock.trim();
    if (!block || block.startsWith("WEBVTT") || block.startsWith("NOTE")) continue;
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) continue;
    const [rawStart, rawEnd] = lines[timingIndex].split("-->");
    const start = parseTimestamp(rawStart);
    const end = parseTimestamp((rawEnd || "").split(/\s+/).filter(Boolean)[0] || "");
    /* A cue's text is wrapped for the caption box, not for reading: the line breaks are a
       display artefact and rejoining them is what turns caption text back into prose. */
    const text = lines.slice(timingIndex + 1).join(" ").replace(/\s+/g, " ").trim();
    if (start === null || end === null || !text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

export function transcriptFromCues(cues) {
  const paragraphs = [];
  let current = [];
  let startedAt = 0;
  for (const cue of cues) {
    const previous = current.join(" ");
    const sentenceEnded = /[.!?]["')\]]?$/.test(previous);
    if (current.length && sentenceEnded && cue.start - startedAt >= MIN_PARAGRAPH_SECONDS) {
      paragraphs.push(previous);
      current = [];
    }
    if (!current.length) startedAt = cue.start;
    current.push(cue.text);
  }
  if (current.length) paragraphs.push(current.join(" "));
  return `${paragraphs.join("\n\n")}\n`;
}

export function transcriptFromVtt(vtt) {
  const cues = parseCues(vtt);
  if (!cues.length) throw new Error("no_cues_found");
  return transcriptFromCues(cues);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2);
  if (!input) {
    console.error("usage: node scripts/vtt-to-transcript.mjs <input.vtt> [output.txt]");
    process.exit(2);
  }
  const target = output || path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.txt`);
  const transcript = transcriptFromVtt(fs.readFileSync(input, "utf8"));
  fs.writeFileSync(target, transcript);
  const words = transcript.split(/\s+/).filter(Boolean).length;
  console.log(`${target} — ${transcript.trimEnd().split(/\n{2,}/).length} paragraph(s), ${words} words`);
}
