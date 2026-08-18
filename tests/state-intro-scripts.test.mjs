import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/* Regenerate before asserting, so the tests measure what the generator currently
   produces rather than what happened to be committed. */
execFileSync(process.execPath, [`${root}scripts/generate-state-intro-scripts.mjs`], { encoding: "utf8" });

const registry = JSON.parse(readFileSync(`${root}public/statecourse/data/state-registry.json`, "utf8"));
const manifest = JSON.parse(readFileSync(`${root}public/statecourse/data/state-intros.json`, "utf8"));
const scriptDir = `${root}marketing/state-intros/`;
const scripts = readdirSync(scriptDir).filter((name) => name.endsWith(".md"))
  .map((name) => ({ name, body: readFileSync(scriptDir + name, "utf8") }));

/* Only the lines inside the Script section are spoken. The file also carries guidance
   callouts in blockquotes - including one that mentions approval numbers - so filtering
   on "> " across the whole file would test the instructions rather than the script. */
function spokenLines(body) {
  const start = body.indexOf("## Script");
  if (start < 0) return "";
  const end = body.indexOf("## On-screen text", start);
  return body.slice(start, end < 0 ? undefined : end)
    .split("\n")
    .filter((line) => line.startsWith("> "))
    .map((line) => line.slice(2))
    .join(" ");
}

test("every jurisdiction has a script or a blocked stub", () => {
  assert.equal(scripts.length, registry.states.length);
  assert.equal(manifest.states.length, registry.states.length);
});

test("no script claims approval while the registry holds no approval number", () => {
  const approved = registry.states.filter((state) => state.provider_approval_number);
  assert.equal(approved.length, 0, "registry now has an approval number - verify it before recording");

  for (const { name, body } of scripts) {
    const spoken = spokenLines(body);
    /* "not approved" and "has not been approved" are the required language; an approval
       claim is any assertion that something IS approved. */
    const claim = /\b(is|are|now)\s+(dre[- ])?approved\b/i.test(spoken)
      || /\bapproved (provider|course provider)\b/i.test(spoken)
      || /\bapproval number\b/i.test(spoken);
    assert.ok(!claim, `${name} asserts approval: ${spoken.slice(0, 200)}`);
  }
});

test("no script invites enrollment while enrollment is disabled", () => {
  for (const { name, body } of scripts) {
    const spoken = spokenLines(body);
    assert.ok(!/\benroll now\b/i.test(spoken), `${name} invites enrollment`);
    assert.ok(!/\byou can enroll\b/i.test(spoken), `${name} states enrollment is available`);
  }
});

test("every recordable script identifies the legal entity", () => {
  /* Commissioner's Regulation 3004(a): advertising must clearly and conspicuously identify
     the entity and include its name. */
  for (const { name, body } of scripts) {
    if (body.includes("NOT READY TO RECORD")) continue;
    assert.match(body, /state course LLC/, `${name} omits the legal entity name`);
  }
});

test("every recordable script states that the video is not instruction", () => {
  for (const { name, body } of scripts) {
    if (body.includes("NOT READY TO RECORD")) continue;
    assert.match(body, /not instruction/i, `${name} omits the not-instruction disclaimer`);
    assert.match(body, /no credit|earns no credit/i, `${name} omits the no-credit disclaimer`);
  }
});

test("the manifest never marks an intro video as regulated instruction", () => {
  for (const state of manifest.states) {
    assert.equal(state.regulatedInstruction, false, `${state.state_code} would count as instruction`);
  }
});

test("jurisdictions without verified registry data are blocked from recording", () => {
  for (const state of registry.states) {
    const entry = manifest.states.find((item) => item.state_code === state.state_code);
    const researched = state.regulator_name
      && !/pending|research|tbd|unknown/i.test(state.regulator_name)
      && state.prelicense_hours;
    assert.equal(entry.blocked, !researched, `${state.state_code} blocked flag does not match its data`);
  }
});

test("no script promises a requirements outline it cannot deliver", () => {
  for (const { name, body } of scripts) {
    if (body.includes("NOT READY TO RECORD")) continue;
    const spoken = spokenLines(body);
    if (/outline of what/i.test(spoken)) {
      assert.match(body, /hours pre-license education/, `${name} promises an outline without an hour figure`);
    }
  }
});
