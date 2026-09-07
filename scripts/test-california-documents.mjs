#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { PROGRAMS } from "../config/california/regulatory-manifest.mjs";
import { californiaDocumentEnvironment } from "./lib/california-document-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { env } = californiaDocumentEnvironment();
const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
if (process.argv.includes("--prepare")) {
  run(["scripts/build-california-print-volume.mjs"]);
  run(["scripts/generate-course-dossier.mjs"]);
  run(["scripts/build-human-closeout-print-set.mjs"]);
  run(["scripts/sync-california-print-metadata.mjs"]);
  run(["scripts/generate-sb1495-traceability.mjs"]);
} else {
  for (const program of PROGRAMS) {
    const pdf = path.join(root, `california/print/${program.courseId}-course-text.pdf`);
    if (!fs.existsSync(pdf)) throw new Error(`Missing generated PDF: ${pdf}. Run node scripts/test-california-documents.mjs --prepare first. The browser-free build needs Python with pypdf/reportlab and DejaVu fonts.`);
  }
}
const requested = process.argv.slice(2).filter((arg) => arg !== "--prepare");
const testFiles = requested.length ? requested : [
  "tests/california-filled-forms.test.mjs",
  "tests/california-instructional-volume.test.mjs",
  "tests/california-sb1495.test.mjs",
  "tests/california-submission-consistency.test.mjs",
  "tests/california-exam-integrity.test.mjs",
];
run(["--test", ...testFiles]);
