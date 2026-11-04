import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("state finder keeps built states usable and disables future states", async () => {
  const [script, homepage, generator] = await Promise.all([
    read("public/statecourse/national.js"),
    read("public/statecourse/index.html"),
    read("scripts/generate-national-platform.mjs"),
  ]);

  assert.match(script, /state\.public_status === "Approved"/);
  assert.match(script, /practiceStateCodes\.has\(state\.state_code\)/);
  assert.match(script, /data\/free-practice-catalog\.json/);
  assert.match(script, /option\.disabled = access === "coming"/);
  assert.match(script, /Free practice available/);
  assert.match(script, /No payment, enrollment, licensing credit, or certificate/);

  for (const markup of [homepage, generator]) {
    assert.match(markup, /status-available">Available/);
    assert.match(markup, /status-development">Free practice available/);
    assert.match(markup, /status-coming">Coming soon/);
    assert.match(markup, /aria-describedby="finderStatusGuide finderMessage"/);
  }
});

test("selectable practice states come from the public manifest, independent of paid status", async () => {
  const registry = JSON.parse(await read("public/statecourse/data/state-registry.json"));
  const practice = JSON.parse(await read("public/statecourse/data/free-practice-catalog.json"));
  const practiceStateCodes = new Set(practice.states.map((state) => state.state_code));

  for (const code of ["FL", "GA", "NY"]) {
    const state = registry.states.find((entry) => entry.state_code === code);
    assert.notEqual(state.public_status, "Approved");
    assert.ok(practiceStateCodes.has(code), `${code} practice must remain selectable`);
  }
  assert.ok(practiceStateCodes.has("CA"));
  assert.equal(practiceStateCodes.has("DC"), false);
});
