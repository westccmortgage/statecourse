/** Read-only live source-link diagnostics for the newly completed courses.
 * HTTP success alone is not source verification. In particular the retired Texas /Docs/ URLs
 * can return a generic 200 SPA shell. Report identity failures and transport failures separately.
 * Output contains URLs/response metadata, never protected assessment questions or answer keys.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { TEXAS_COMPLETION_COURSES } from "../config/texas/completion-courses.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv.find(arg => arg.startsWith("--course="))?.slice(9);
const selected = TEXAS_COMPLETION_COURSES.filter(course => !requested || requested === course.slug);
if (!selected.length) throw new Error("Unknown Texas completion course");
const references = new Map();
const inputs = [];
for (const course of selected) {
  const directory = path.join(root, course.curriculumDir);
  if (!fs.existsSync(directory)) throw new Error(`Missing full curriculum: ${course.slug}`);
  const files = [
    ...fs.readdirSync(directory).filter(file => /^module-\d+\.md$/.test(file)).map(file => `${course.curriculumDir}/${file}`),
    ...fs.readdirSync(path.join(root, "config/texas")).filter(file => file.startsWith(course.slug + "-") && file.endsWith(".mjs") && !file.includes("practice-bank")).map(file => `config/texas/${file}`),
  ];
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(root, file));
    inputs.push({ path: file, sha256: createHash("sha256").update(bytes).digest("hex") });
    for (const match of bytes.toString().matchAll(/https:\/\/[^\s<>"'`\\)]+/g)) {
      const value = match[0].replace(/[.,;]+$/, "");
      const parsed = new URL(value);
      const fragment = parsed.hash;
      parsed.hash = "";
      const url = parsed.href;
      if (!references.has(url)) references.set(url, { files: new Set(), fragments: new Set() });
      references.get(url).files.add(file);
      if (fragment) references.get(url).fragments.add(fragment.slice(1));
    }
  }
}
const decode = text => text.replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const queue = [...references];
const results = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const [url, refs] = queue.shift();
    const base = { url, files: [...refs.files].sort(), fragments: [...refs.fragments].sort() };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const bytes = Buffer.from(await response.arrayBuffer());
      const pdf = bytes.subarray(0, 5).toString() === "%PDF-";
      const html = pdf ? "" : bytes.toString();
      const title = pdf ? null : decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      const issues = [];
      if (!response.ok) issues.push(`HTTP_${response.status}`);
      if (/\.pdf$/i.test(new URL(url).pathname) && !pdf) issues.push("EXPECTED_PDF_SIGNATURE_MISSING");
      if (!pdf && /just a moment|access denied|page not found|404 not found/i.test(title)) issues.push("CHALLENGE_OR_ERROR_PAGE");
      const chapter = new URL(url).pathname.match(/\/(?:Docs|resources)\/[A-Z]+\/htm\/[A-Z]+\.(\d+)\.htm$/);
      if (chapter) {
        const pattern = new RegExp(`CHAPTER\\s+${chapter[1]}(?:\\.|\\s)`, "i");
        if (!pattern.test(title) || !pattern.test(html)) issues.push("EXPECTED_STATUTORY_CHAPTER_MISSING");
        for (const fragment of refs.fragments) {
          const key = decodeURIComponent(fragment);
          if (!html.includes(`name="${key}"`) && !html.includes(`NAME="${key}"`) && !html.includes(`id="${key}"`)) issues.push(`ANCHOR_NOT_FOUND:${key}`);
        }
      }
      results.push({ ...base, status: response.status, finalUrl: response.url, contentType: response.headers.get("content-type"),
        bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), pdf, title,
        transportAndBasicIdentityPass: issues.length === 0, issues });
    } catch (error) { results.push({ ...base, transportAndBasicIdentityPass: false, issues: [error.message] }); }
  }
}));
results.sort((a, b) => a.url.localeCompare(b.url));
const report = { schemaVersion: 1, checkedAt: new Date().toISOString(), courses: selected.map(course => course.slug),
  inputs, urls: results.length, passed: results.filter(row => row.transportAndBasicIdentityPass).length,
  failed: results.filter(row => !row.transportAndBasicIdentityPass).length, results,
  limitation: "Response identity and reachability are checked. This is not an independent legal interpretation, a complete claim-to-source audit, a finding that every form is effective, or proof of learner access in every browser." };
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
