import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* A final examination answer key that reaches the public site is not a bug to be tidied up
   later. RE 303: "Under no circumstances shall the final exam be furnished directly to the
   students." A published key invalidates every examination taken against it, retroactively,
   and there is no way to un-publish something a student may already have read.
   
   This happened once: a build step copied the whole california/ tree into public/. These
   tests exist so the class of mistake cannot recur, whatever route it takes. */

const SECRET_PATTERNS = [
  { label: "answer key document", re: /final-exam-form-[ab]-answer-key/i },
  { label: "answer key heading", re: /##\s*Answer key/i },
  // The authenticated reviewer renderer reads item.correctChoice. The forbidden
  // material is an embedded answer value, not a property name used to render a
  // separately authorized response. Access control is tested in review-exams tests.
  { label: "embedded machine answer", re: /\bcorrectChoice["']?\s*[:=]\s*["']?\d+\b/ },
  { label: "question bank module", re: /module-question-bank|final-exam-bank/ }
];

function filesUnder(dir) {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(dir);
  return out;
}

test("no build step copies course source into a published directory", () => {
  /* The actual defect: a script writing into public/ or dist/. Catch it by reading the
     build scripts rather than by waiting for a build to produce the file, because the
     build does not run in every environment and the leak would ship regardless. */
  const scriptsDir = path.join(root, "scripts");
  const offenders = [];

  const buildScripts = fs.readdirSync(scriptsDir)
    .filter((f) => /^build|^.*build.*\.(sh|mjs)$/.test(f))
    .map((f) => path.join(scriptsDir, f));

  for (const script of buildScripts) {
    const text = fs.readFileSync(script, "utf8");
    for (const line of text.split("\n")) {
      if (line.trim().startsWith("#")) continue;
      if (/export-california-source-temp/.test(line)) {
        offenders.push(`${path.relative(root, script)}: invokes the source-export script`);
      }
    }
  }
  assert.deepEqual(offenders, [], "a build script would publish course source to the live site");
});

test("no script targets a published directory as an export destination", () => {
  /* The first version of this test guessed, by grepping for a script that both mentioned
     public/ and mentioned the course tree. It produced two false positives and missed the
     one script that actually did it, because that script walks california/ generically and
     said "submission" only in a comment. Heuristics about intent do not work here.

     So test the property directly instead: no script may name public/ or dist/ as a
     destination it creates and writes a bundle into. */
  const scriptsDir = path.join(root, "scripts");
  const offenders = [];
  for (const file of fs.readdirSync(scriptsDir).filter((f) => f.endsWith(".mjs"))) {
    const text = fs.readFileSync(path.join(scriptsDir, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    /* An export destination is a variable named like an output path that resolves into a
       published directory. Reading from public/ is fine; declaring it as an output is not. */
    const declaresPublicOutput =
      /(?:outputDir|outputPath|destDir|exportDir|outDir)\s*=\s*path\.join\([^;]*['"`](?:public|dist)['"`]/.test(text);
    if (declaresPublicOutput) {
      offenders.push(`scripts/${file}: declares an output path inside a published directory`);
    }
  }
  assert.deepEqual(offenders, [], "a script would write a bundle into the published site");
});

test("nothing resembling an answer key is present in public/ or dist/", () => {
  const offenders = [];
  for (const dir of ["public", "dist"]) {
    for (const file of filesUnder(path.join(root, dir))) {
      const name = path.basename(file);
      if (/answer-key/i.test(name)) {
        offenders.push(`${path.relative(root, file)}: answer-key filename`);
        continue;
      }
      if (!/\.(html|js|mjs|json|css|md|txt)$/.test(name)) continue;
      if (fs.statSync(file).size > 8 * 1024 * 1024) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const { label, re } of SECRET_PATTERNS) {
        if (re.test(text)) offenders.push(`${path.relative(root, file)}: ${label}`);
      }
    }
  }
  assert.deepEqual(offenders, [], "examination material must never reach a published directory");
});

test("the export script writes outside every published directory", () => {
  const script = path.join(root, "scripts/export-california-source-temp.mjs");
  if (!fs.existsSync(script)) return;
  const text = fs.readFileSync(script, "utf8");
  const outputLine = text.split("\n").find((line) => /const outputDir\s*=/.test(line));
  assert.ok(outputLine, "the export script has no outputDir");
  assert.doesNotMatch(outputLine, /['"`](?:public|dist)['"`]/,
    "the export script must not write into a published directory");
  assert.match(outputLine, /\.local-export/, "expected the gitignored local destination");

  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^\.local-export/m, ".local-export must be gitignored");
});

test("public-answer scan detects embedded numeric keys but permits a renderer property access",()=>{
  const pattern=SECRET_PATTERNS.find(p=>p.label==='embedded machine answer').re;
  for(const text of ['{"correctChoice":2}','correctChoice: 0','correctChoice = 3'])assert.equal(pattern.test(text),true);
  assert.equal(pattern.test('render(item.correctChoice)'),false);
});
