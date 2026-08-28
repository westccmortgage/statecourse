import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage uses a compact institutional hero with the approved columns photograph", async () => {
  const [html, css] = await Promise.all([
    read("public/statecourse/index.html"),
    read("public/statecourse/national.css"),
  ]);
  assert.match(html, /Real Estate Licensing/);
  assert.match(html, /State by State/);
  assert.match(html, /licensing-finder/);
  /* The one photograph is the owner-supplied classical-columns image, set as a CSS
     background under a navy scrim; no stock classroom photography anywhere. */
  assert.doesNotMatch(html, /hero-photo|adult-student-classroom/);
  assert.match(css, /media\/hero-columns\.webp/);
  assert.match(css, /\.national-hero::before/);
  assert.doesNotMatch(css, /min-height:\s*620px/);
  /* The approved StateCourse design language: self-hosted Playfair Display headings with the
     Georgia stack as fallback (the CSP allows same-origin fonts only), and gold reserved as a
     signal color rather than decoration. */
  assert.match(css, /--serif: "Playfair Display", Georgia, "Times New Roman", serif/);
  assert.match(css, /@import url\("fonts\/fonts\.css"\)/);
});
