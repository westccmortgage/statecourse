/**
 * The public Texas record may not outrun the rule text this repository actually holds.
 *
 * The record used to say the examination and retention rules "could not be opened". That was true
 * when it was written and false by the time it was read: the provider rules were retrieved from
 * TREC's published Chapter 535 and their subsection lettering was confirmed against the Secretary
 * of State's Texas Register publication of the 535.62/535.65 proposal. A public regulatory record
 * that under-claims is a smaller problem than one that over-claims, but it is still wrong, and it
 * had been wrong for a week.
 *
 * The opposite failure is the one that matters more, and these tests exist for it. The held copy
 * is TREC's own reproduction — TIER 4, the regulated agency publishing the rules it administers,
 * not the Secretary of State's adopted text, which remains unread from this environment. So the
 * public record must carry the provenance with the substance, must not describe the text as
 * adopted or codified, and must not quietly drop the source-lock failure that is still open.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { SOURCE } from "../config/texas/trec-rules-source-lock.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "public/statecourse/data/state-registry.json"), "utf8"));
const texas = registry.states.find((state) => state.state_code === "TX");
const ruleText = (section) => fs.readFileSync(path.join(root, `texas/trec-sources/trec-rules/${section}.txt`), "utf8");

test("the rules the Texas record now cites are on disk, not remembered", () => {
  for (const section of ["535.62", "535.65"]) {
    const file = path.join(root, `texas/trec-sources/trec-rules/${section}.txt`);
    assert.ok(fs.existsSync(file), `${section} is cited by the public record but is not held`);
  }
});

/**
 * Each claim the record makes is checked against a phrase that must be present in the held text.
 * These are deliberately short and verbatim: the point is that the number or the rule survived the
 * trip from the rule to the public page, not that the sentence around it was copied.
 */
test("every examination figure the public record states appears in the held rule text", () => {
  const s62 = ruleText("535.62");
  const s65 = ruleText("535.65");
  const claims = [
    [s62, "include at least four versions of a final examination", "four versions"],
    [s62, "does not contain any true/false questions", "no true/false questions"],
    [s62, "does not repeat more than one third of the questions", "one-third overlap cap"],
    [s62, "consists of at least two questions per credit course hour", "two questions per credit hour"],
    [s62, "at least four questions per credit course hour", "bank of four per credit hour"],
    [s65, "unweighted passing score of 70%", "70% unweighted"],
    [s65, "kept confidential and be significantly different from any quiz questions", "confidentiality and separation"],
    [s65, "no later than the 90th day after the date the original class concludes", "90-day subsequent examination limit"],
    [s65, "minimum of four years following completion of the course", "four-year retention"],
  ];
  for (const [text, phrase, label] of claims) {
    assert.ok(text.includes(phrase), `${label}: the held rule text does not contain "${phrase}"`);
  }
  /* And the record must actually state them, or it has drifted back to saying nothing. */
  for (const fragment of ["at least four versions", "one third", "unweighted passing score of 70%", "90th day"]) {
    assert.ok(texas.final_exam_rules.includes(fragment), `the public record no longer states: ${fragment}`);
  }
  assert.ok(texas.record_retention_period.includes("four years"), "the public record no longer states the retention period");
});

/**
 * The cross-reference disagreement is the rule's own, and it is recorded rather than resolved.
 * A later editor who "tidies" the record by picking one paragraph would be asserting a resolution
 * nobody has authority to make from here.
 */
test("the record reports the rule's own cross-reference conflict instead of choosing a side", () => {
  const s65 = ruleText("535.65");
  assert.ok(s65.includes("required by §535.62(b)(7)"), "the held text no longer carries the (b)(7) cross-reference");
  assert.ok(s65.includes("must comply with §535.62(b)(8)"), "the held text no longer carries the (b)(8) cross-reference");
  assert.match(texas.final_exam_rules, /CONFLICT RECORDED, NOT RESOLVED/);
  assert.ok(texas.final_exam_rules.includes("535.62(b)(7)") && texas.final_exam_rules.includes("535.62(b)(8)"));
});

/**
 * Provenance travels with the substance. TREC's own reproduction is evidence, not authority, and
 * the record may never describe it as the adopted or codified text.
 */
test("the record states the tier it read from and does not promote it", () => {
  const fields = [texas.final_exam_rules, texas.proctoring_rules, texas.record_retention_period];
  for (const field of fields) {
    assert.ok(field.includes("TREC's published reproduction"), "a rule claim is made without naming the source it came from");
    assert.ok(field.includes("TRD-202601975"), "the lettering is cited without naming where the lettering was read");
    assert.ok(
      field.includes("adopted") && field.includes("has still not been opened"),
      "a rule claim omits that the Secretary of State's adopted text is still unread",
    );
    assert.ok(field.includes("TX_PROVIDER_RULE_SOURCE_LOCK remains FAIL"), "a rule claim omits the open source-lock failure");
  }
  /* The source lock is the single place that decides the tier. If it is ever promoted, these
     claims must be re-examined rather than silently inheriting a stronger status. */
  assert.equal(SOURCE.codifiedTextCompared, false);
  assert.match(SOURCE.tier, /TIER 4/);
  assert.match(SOURCE.codifiedTextStatus, /^UNREAD/);
});

test("reading the rules changed nothing about what Texas is allowed to sell", () => {
  assert.equal(texas.public_status, "In Development");
  assert.equal(texas.provider_approval_number, null);
  assert.match(texas.final_exam_rules, /remains a provider proposal until TREC approves it/);
  assert.match(texas.proctoring_rules, /will administer no examination until TREC approves the submitted method/);
});
