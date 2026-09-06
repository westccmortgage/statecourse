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
  assert.match(script, /catalogStateCodes\.has\(state\.state_code\)/);
  assert.match(script, /option\.disabled = access === "coming"/);
  assert.match(script, /In development · Free practice/);
  assert.match(script, /No payment, enrollment, licensing credit, or certificate/);

  for (const markup of [homepage, generator]) {
    assert.match(markup, /status-available">Available/);
    assert.match(markup, /status-development">In development · Free practice/);
    assert.match(markup, /status-coming">Coming soon/);
    assert.match(markup, /aria-describedby="finderStatusGuide finderMessage"/);
  }
});

test("only catalog-backed or approved jurisdictions are selectable", async () => {
  const registry = JSON.parse(await read("public/statecourse/data/state-registry.json"));
  const catalog = JSON.parse(await read("public/statecourse/data/course-catalog.json"));
  const catalogStateCodes = new Set(
    catalog.categories
      .flatMap((category) => category.programs ?? [])
      .flatMap((program) => (program.courses ?? []).map((course) => course.state_id || program.state_code))
  );

  for (const state of registry.states) {
    const selectable = state.public_status === "Approved" || catalogStateCodes.has(state.state_code);
    if (state.public_status === "In Development") assert.equal(selectable, true, `${state.state_code} should stay usable`);
    if (["Coming Soon", "In Research", "Not Started"].includes(state.public_status)) {
      assert.equal(selectable, false, `${state.state_code} should be coming soon`);
    }
  }
});
