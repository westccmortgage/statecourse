import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage uses a compact institutional hero without photography", async () => {
  const [html, css] = await Promise.all([
    read("public/statecourse/index.html"),
    read("public/statecourse/institutional-v2.css"),
  ]);
  assert.match(html, /Real estate licensing education, organized by state/);
  assert.match(html, /hero-program-strip/);
  assert.doesNotMatch(html, /hero-photo|adult-student-classroom/);
  assert.doesNotMatch(css, /min-height:\s*620px/);
  assert.match(css, /font-family: Georgia, "Times New Roman", serif/);
});
