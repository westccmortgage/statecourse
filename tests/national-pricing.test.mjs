import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { BUILD_STATUS, PRICING_GAPS, STATE_PRICING, lowestAdvertisedPrice, pricingFor } from "../config/national-pricing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "public/statecourse/data/state-registry.json"), "utf8"));

test("every priced state has both tiers, a distinct SKU, and a whole-cent amount", () => {
  const skus = new Set();
  for (const s of STATE_PRICING) {
    for (const tier of [s.requiredEducation, s.completePath]) {
      assert.match(tier.sku, /^SC-[A-Z]{2}-(EDU|COMPLETE)$/, `${s.code}: SKU shape`);
      assert.ok(!skus.has(tier.sku), `${tier.sku} is used twice`);
      skus.add(tier.sku);
      assert.ok(Number.isSafeInteger(tier.cents) && tier.cents > 0, `${tier.sku}: cents must be a positive integer`);
      assert.equal(tier.cents, tier.usd * 100, `${tier.sku}: cents and usd disagree`);
    }
    assert.ok(s.completePath.cents > s.requiredEducation.cents,
      `${s.code}: the complete path must cost more than education alone`);
  }
});

test("the headline price is one a state actually offers", () => {
  /* A "from $X" claim where no state charges $X is deceptive advertising, and for a
     regulated school that is a licensing problem rather than a marketing one. */
  const headline = lowestAdvertisedPrice();
  const offered = STATE_PRICING.map((s) => s.requiredEducation.cents);
  assert.ok(offered.includes(headline.cents), "the headline price matches no state's price");
  assert.equal(headline.cents, Math.min(...offered));
});

test("priced hours agree with the researched registry, or the disagreement is explained", () => {
  const unexplained = [];
  for (const s of STATE_PRICING) {
    const entry = registry.states.find((r) => r.state_code === s.code);
    assert.ok(entry, `${s.code} is priced but absent from the registry`);
    const registryHours = entry.prelicense_hours;

    if (s.buildStatus === BUILD_STATUS.UNRESEARCHED) {
      /* Hours from market research must say so, so nobody later mistakes them for a
         primary-source reading. */
      assert.ok(s.hoursSource, `${s.code}: unresearched hours must record their source`);
      continue;
    }
    if (registryHours === null || registryHours === s.requiredHours) continue;

    /* A difference is allowed only where the state's own composition explains it — Arizona's
       90-hour course plus a separate 6-hour contract writing course being the case in hand. */
    if (s.composition) continue;
    unexplained.push(`${s.code}: priced at ${s.requiredHours}h, registry says ${registryHours}h`);
  }
  assert.deepEqual(unexplained, [], "a priced hour figure contradicts the registry with no explanation");
});

test("states that are built and in development are either priced or listed as a gap", () => {
  const priced = new Set(STATE_PRICING.map((s) => s.code));
  const gaps = new Set(PRICING_GAPS.map((g) => g.code));
  const missing = registry.states
    .filter((r) => r.public_status === "In Development")
    .map((r) => r.state_code)
    .filter((code) => !priced.has(code) && !gaps.has(code));
  assert.deepEqual(missing, [],
    "a state in development has neither a price nor an entry in PRICING_GAPS");
});

test("no unresearched state is treated as ready to sell", () => {
  for (const s of STATE_PRICING.filter((x) => x.buildStatus === BUILD_STATUS.UNRESEARCHED)) {
    const entry = registry.states.find((r) => r.state_code === s.code);
    assert.notEqual(entry.public_status, "In Development",
      `${s.code} is priced from market research but claims development status`);
  }
});

test("pricingFor resolves by code and returns nothing for an unknown state", () => {
  assert.equal(pricingFor("CA").requiredEducation.cents, 19900);
  assert.equal(pricingFor("CA").singleCourse.cents, 7900);
  assert.equal(pricingFor("ZZ"), null);
});

test("the pricing table asserts no approval and no regulatory credit for the extras", () => {
  const source = fs.readFileSync(path.join(root, "config/national-pricing.mjs"), "utf8");
  assert.doesNotMatch(source, /DRE[- ]approved|state[- ]approved/i,
    "the pricing table must not describe any course as approved");
  assert.match(source, /NOTHING HERE IS SELLABLE/,
    "the file must state that a price does not make a course sellable");
});
