import fs from "node:fs";
import path from "node:path";

const [source, destination] = process.argv.slice(2);
if (!source || !destination || path.extname(source).toLowerCase() !== ".srt" || path.extname(destination).toLowerCase() !== ".vtt") {
  throw new Error("usage: node scripts/convert-srt-to-vtt.mjs source.srt destination.vtt");
}
const input = fs.readFileSync(source, "utf8").replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
const cues = input.split(/\n{2,}/).map((cue) => {
  const lines = cue.split("\n");
  const timingIndex = lines.findIndex((line) => line.includes(" --> "));
  if (timingIndex < 0) throw new Error("caption cue has no timing line");
  const timing = lines[timingIndex].replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  if (!/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/.test(timing)) {
    throw new Error(`invalid caption timing: ${lines[timingIndex]}`);
  }
  const identifier = lines.slice(0, timingIndex).filter(Boolean);
  const text = lines.slice(timingIndex + 1);
  if (!text.some((line) => line.trim())) throw new Error("caption cue has no text");
  return [...identifier, timing, ...text].join("\n");
});
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `WEBVTT\n\n${cues.join("\n\n")}\n`);
