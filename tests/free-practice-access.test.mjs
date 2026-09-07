import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("every built state has one public non-credit practice sample", () => {
  const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
  const catalog = JSON.parse(read("public/statecourse/data/course-catalog.json"));
  const practice = JSON.parse(read("public/statecourse/data/free-practice-catalog.json"));
  const builtStates = new Set(catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => (program.courses ?? []).map((course) => course.state_id || program.state_code)));
  const practiceStates = new Set(practice.samples.map((sample) => sample.state_code));
  const expectedFiles = practice.samples.map((sample) => `${sample.state_code.toLowerCase()}.md`).sort();
  const generatedFiles = fs.readdirSync(path.join(root, "public/statecourse/free-practice/content")).sort();
  assert.deepEqual([...practiceStates].sort(), [...builtStates].sort());
  assert.deepEqual(generatedFiles, expectedFiles, "public practice output must contain only explicitly allowlisted lessons");
  assert.match(practice.disclosure, /No enrollment.*licensing credit.*certificate.*final examination/i);
  for (const sample of practice.samples) {
    assert.equal(registry.states.find((state) => state.state_code === sample.state_code)?.public_status, "In Development");
    assert.match(sample.content_url, /^free-practice\/content\/[a-z]{2}\.md$/);
    const publicLesson = read(`public/statecourse/${sample.content_url}`);
    assert.ok(publicLesson.length > 1000, `${sample.state_code} practice lesson is unexpectedly short`);
    assert.doesNotMatch(
      publicLesson,
      /final-exam-form-[ab]-answer-key|##\s*Answer key|\bcorrectChoice\b|module-question-bank|final-exam-bank|instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export/i,
    );
  }
});

test("practice routes explain the non-credit boundary and link from state services", () => {
  const page = read("public/statecourse/free-practice/index.html");
  const script = read("public/statecourse/free-practice.js");
  const service = read("public/statecourse/service-area.js");
  assert.match(page, /does not create enrollment.*licensing credit.*completion certificate.*protected course final examination/i);
  assert.match(page, /id="practiceStateSelect"/);
  assert.match(script, /renderLessonMarkdown/);
  assert.match(script, /formative practice, not a licensing examination/);
  assert.match(service, /Start free.*practice/);
  assert.match(service, /practiceStates\.has\(state\.state_code\)/);
});

test("every built jurisdiction page opens its state-specific practice preview", () => {
  const practice = JSON.parse(read("public/statecourse/data/free-practice-catalog.json"));
  for (const sample of practice.samples) {
    const stateSlug = sample.state_name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
    const statePage = read(`public/statecourse/real-estate/${stateSlug}/index.html`);
    assert.match(statePage, new RegExp(`free-practice/\\?state=${sample.state_code}`));
    assert.match(statePage, /Practice access is non-credit|public practice preview is separate from regulated enrollment/);
  }
});
