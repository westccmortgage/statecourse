import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

for (const [slug, counts, subtotals] of [
  ["promulgated-contract-forms", [9, 63], [155, 150, 155, 160, 220, 205, 205, 115, 135]],
  ["real-estate-finance", [10, 74], [105, 100, 200, 95, 110, 170, 200, 215, 220, 85]],
]) {
  const { FORM, TOPICS, ALL_UNITS } = await import(`../config/texas/${slug}-course-form.mjs`);
  test(`${slug}: every topic/unit/minute reconciles with the independently read outline`, () => {
    assert.equal(TOPICS.length, counts[0]);
    assert.equal(ALL_UNITS.length, counts[1]);
    assert.equal(new Set(ALL_UNITS.map(unit => unit.code)).size, counts[1]);
    assert.deepEqual(TOPICS.map(topic => topic.subtotalMinutes), subtotals);
    for (const topic of TOPICS) {
      assert.equal(topic.units.reduce((sum, unit) => sum + unit.minutes, 0), topic.subtotalMinutes);
      assert.ok(topic.units.every((unit, index) => unit.code === `${topic.code}U${index + 1}` && unit.minutes > 0));
    }
    assert.equal(subtotals.reduce((a, b) => a + b), FORM.totalMinutes);
    assert.equal(FORM.totalMinutes, 1500);
    assert.equal(FORM.courseHours, 30);
    assert.equal(FORM.minutesPerCreditHourStatus, "FORM_DERIVED");
  });
  test(`${slug}: actual held official PDF matches source identity, byte size and checksum`, () => {
    const body = fs.readFileSync(fileURLToPath(new URL(`../${FORM.localCopy}`, import.meta.url)));
    assert.equal(body.subarray(0, 5).toString(), "%PDF-");
    assert.equal(body.length, FORM.bytes);
    assert.equal(createHash("sha256").update(body).digest("hex"), FORM.sha256);
    assert.equal(FORM.pages, 3);
    assert.equal(new URL(FORM.url).hostname, "www.trec.texas.gov");
  });
}

test("PCF-0 noncontract subordinate entries do not invent extra timed units", async () => {
  const { TOPICS } = await import("../config/texas/promulgated-contract-forms-course-form.mjs");
  const row = TOPICS[6].units.find(unit => unit.code === "T07U9");
  assert.equal(row.minutes, 30);
  assert.equal(row.subentries.length, 3);
  assert.equal(TOPICS[4].units.find(unit => unit.code === "T05U5").minutes, 15);
});
