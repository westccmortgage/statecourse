import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deriveJurisdictionRecord } from "../config/jurisdiction-record.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const practiceCatalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/free-practice-catalog.json"), "utf8"));
const read = (relativePath) => fs.readFileSync(path.join(publicRoot, relativePath), "utf8");

const areas = [
  { route: "exam-prep", service: "exam", product: "exam preparation", categoryId: "exam-prep" },
  { route: "continuing-education", service: "renew", product: "continuing education", categoryId: "continuing-education" },
];

for (const area of areas) {
  test(`${area.route} answers for the state the finder sends it`, () => {
    const html = read(`${area.route}/index.html`);
    /* The homepage finder navigates here with ?state=XX. The page must carry the
       machinery that reads it, or the parameter is silently dropped again. */
    assert.match(html, new RegExp(`data-service="${area.service}"`));
    assert.match(html, /<select id="serviceStateSelect">/);
    assert.match(html, /<dl id="serviceRecord">/);
    assert.match(html, /<script src="\.\.\/service-area\.js(?:\?[^\"]+)?" defer><\/script>/);
  });

  test(`${area.route} states availability from the catalog, not from copy`, () => {
    const html = read(`${area.route}/index.html`);
    if (area.service === "exam") {
      assert.match(html, new RegExp(`available for ${practiceCatalog.samples.length} states currently in development`));
      assert.match(html, /not licensing-exam questions/i);
      return;
    }
    const category = catalog.categories.find((entry) => entry.category_id === area.categoryId);
    assert.ok(category, `catalog has no ${area.categoryId} category`);
    const areaCourses = (category.programs ?? []).flatMap((program) => program.courses ?? []);
    const record = deriveJurisdictionRecord(areaCourses);

    if (!record.hasCourseRecord) {
      assert.match(html, new RegExp(`StateCourse does not offer ${area.product} in any jurisdiction yet`));
      return;
    }
    /* A course record exists. The page may say it is in development, but it may only
       say enrollment is open where an approval number and an enabled flag meet. */
    if (!record.enrollmentOpen) {
      assert.doesNotMatch(html, /is open only where/, `${area.route} advertises open enrollment with nothing approved`);
    }
  });

  test(`${area.route} promises no product that does not exist`, () => {
    const html = read(`${area.route}/index.html`);
    const impossiblePromises = area.service === "exam"
      ? [/representative licensing-exam questions/i, /retrieve eligible completion certificates/i]
      : [/representative practice questions/i, /free practice/i, /try .{0,20}practice/i, /retrieve eligible completion certificates/i];
    for (const promise of impossiblePromises) {
      assert.doesNotMatch(html, promise, `${area.route} still promises an unbuilt product`);
    }
    if (area.service === "exam") assert.match(html, /href="\.\.\/free-practice\/"/);
  });
}

test("the exam-prep page never offers regulated final-exam material as study material", () => {
  const html = read("exam-prep/index.html");
  assert.match(html, /Protected course final examinations and their answer keys.*never used as public practice material/i);
  assert.match(html, /does not publish examination questions/);
});

test("the homepage finder offers only goals its destinations can answer", () => {
  const finder = read("national.js");
  assert.doesNotMatch(finder, /Free practice questions/, "the finder still offers practice questions that do not exist");
  assert.doesNotMatch(finder, /Find my certificates/, "the finder still offers certificate retrieval from a page that has none");
  /* The finder must still route both intents to the two service areas. */
  assert.match(finder, /exam-prep\/\?state=/);
  assert.match(finder, /continuing-education\/\?state=/);
});

test("the service-area script reads the state parameter and publishes no requirement it has not verified", () => {
  const script = read("service-area.js");
  assert.match(script, /searchParams\.get\("state"\)/);
  assert.match(script, /data\/state-registry\.json/);
  /* Every field the panel prints must come from the registry or be an explicit
     not-verified string; no hour counts, deadlines, or scores may be literals here. */
  assert.doesNotMatch(script, /\b\d+\s*(hours|questions|percent|%)\b/i);
});
