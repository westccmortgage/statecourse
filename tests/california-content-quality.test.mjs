import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const auditor = fileURLToPath(new URL("../scripts/audit-california-content.mjs", import.meta.url));
const report = execFileSync(process.execPath, [auditor], { encoding: "utf8" });

function loadRenderer() {
  const source = readFileSync(fileURLToPath(new URL("../public/statecourse/student/course/student-course.js", import.meta.url)), "utf8");
  const start = source.indexOf("function escapeHtml");
  const tail = 'flush();return output.join("");\n}';
  const end = source.indexOf(tail);
  return new Function(`${source.slice(start, end + tail.length)}\nreturn { renderMarkdown };`)();
}

/* The reader redesign fixed raw Markdown leakage and lowercase headings across all
   45 California lessons. These two tests keep that fixed while the lesson rebuild
   rewrites the prose underneath. */

test("no raw Markdown survives the California reader pipeline", () => {
  assert.match(report, /\[pass\] no raw Markdown reaches the student reader/);
});

test("California lessons render with capitalized headings and sentences", () => {
  assert.match(report, /\[pass\] no rendered heading or sentence starts lowercase/);
});

test("the auditor still measures substance and assessment integrity", () => {
  /* Guards the auditor itself: if these lines stop appearing, the audit has silently
     stopped checking the two gates that are still open. */
  assert.match(report, /lesson prose is written, not templated/);
  assert.match(report, /every scored item has its own answer choices/);
  assert.match(report, /lessons audited: 45/);
});

/* The rebuilt lessons will contain numbered procedures, quoted statutory text, form
   names, and sub-headings below level 3. The reader must render all of them rather
   than printing the Markdown markers to the student. */

test("the reader renders the Markdown constructs real instruction needs", () => {
  const { renderMarkdown } = loadRenderer();
  const html = renderMarkdown([
    "## Section",
    "",
    "1. Verify the identity of the principal.",
    "2. Deliver the disclosure and retain the receipt.",
    "",
    "> Quoted source text.",
    "",
    "#### Sub-heading",
    "",
    "---",
    "",
    "File the `RE 882` form."
  ].join("\n"));

  assert.match(html, /<ol><li>Verify the identity of the principal\.<\/li><li>Deliver/);
  assert.match(html, /<blockquote><p>Quoted source text\.<\/p><\/blockquote>/);
  assert.match(html, /<h4>Sub-Heading<\/h4>/);
  assert.match(html, /<hr>/);
  assert.match(html, /<code>RE 882<\/code>/);

  const text = html.replace(/<[^>]+>/g, "");
  for (const marker of ["#", ">", "`", "---"]) {
    assert.ok(!text.includes(marker), `raw Markdown marker "${marker}" reached the student`);
  }
});

test("a code span cannot smuggle markup into the lesson body", () => {
  const { renderMarkdown } = loadRenderer();
  const html = renderMarkdown("Use `<script>alert(1)</script>` carefully.");
  assert.ok(!html.includes("<script>"));
  assert.match(html, /<code>&lt;script&gt;/);
});
