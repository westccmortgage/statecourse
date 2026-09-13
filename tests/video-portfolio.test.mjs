import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const portfolio = readJson("video-production/portfolio.json");
const catalog = readJson("public/statecourse/data/course-catalog.json");
const courses = catalog.categories.filter(category => category.category_id === 'real-estate').flatMap((category) => category.programs).flatMap((program) => program.courses);

test("real-estate video portfolio reconciles exactly to its public course catalog", () => {
  const byState = Map.groupBy(courses, (course) => course.state_id);
  assert.equal(portfolio.built_state_count, byState.size);
  assert.equal(portfolio.course_count, courses.length);
  assert.equal(portfolio.states.length, byState.size);
  for (const state of portfolio.states) {
    const catalogCourses = byState.get(state.state_code) || [];
    assert.equal(state.course_count, catalogCourses.length, state.state_code);
    assert.deepEqual(new Set(state.course_ids), new Set(catalogCourses.map((course) => course.course_id)), state.state_code);
  }
});

test("video priorities are unique and cover every built state once", () => {
  assert.deepEqual(portfolio.states.map((state) => state.priority).sort((a, b) => a - b), Array.from({ length: 14 }, (_, index) => index + 1));
  assert.equal(new Set(portfolio.states.map((state) => state.state_code)).size, 14);
});

test("California's four active videos have complete shipping assets", () => {
  const stems = [
    "document-overview-loan-estimate-page-1",
    "document-overview-loan-estimate-page-2",
    "document-overview-loan-estimate-page-3",
    "promissory-note-overview",
  ];
  for (const stem of stems) {
    for (const extension of ["mp4", "vtt"]) {
      const file = path.join(root, `public/statecourse/media/${stem}.${extension}`);
      assert.ok(fs.existsSync(file) && fs.statSync(file).size > 0, file);
    }
    const poster = path.join(root, `public/statecourse/media/${stem}-poster.webp`);
    assert.ok(fs.existsSync(poster) && fs.statSync(poster).size > 0, poster);
  }
  const california = portfolio.states.find((state) => state.state_code === "CA");
  assert.equal(california.rendered_instructional_videos, 4);
  assert.equal(california.active_instructional_videos, 4);
});

test("Texas records three rendered videos, activates two, and publishes none of them", () => {
  const texas = portfolio.states.find((state) => state.state_code === "TX");
  assert.equal(texas.editorial_packages_ready, 3);
  /* Three renders exist. Two are active: the v02 and v03 packages were reviewed for public
     delivery and carry no signed-playback or origin-restriction record, so activating them
     under private delivery would assert a review nobody performed. Rendered and active are
     separate numbers precisely so that gap is visible rather than rounded away. */
  assert.equal(texas.rendered_instructional_videos, 3);
  assert.equal(texas.active_instructional_videos, 2);
  for (const active of ["tx-iabs-1-2-document-overview", "tx-intermediary-brokerage"]) {
    for (const extension of ["vtt", "txt"]) {
      const file = path.join(root, `private-media/texas/${active}.${extension}`);
      assert.ok(fs.existsSync(file) && fs.statSync(file).size > 0, file);
    }
    for (const extension of ["mp4", "vtt", "txt"]) {
      assert.equal(fs.existsSync(path.join(root, `public/statecourse/media/${active}.${extension}`)), false, `${active}.${extension} must not be public`);
    }
    assert.equal(fs.existsSync(path.join(root, `public/statecourse/media/${active}-poster.webp`)), false, `${active}-poster.webp must not be public`);
  }
  /* The rendered-but-inactive packages must not reach the public tree either — not the
     media, and above all not the transcript, which is the whole text of a paid lesson. */
  for (const stem of [
    "tx-representation-or-showing-only-2026",
    "tx-loa-v02-representation-or-showing-only-2026",
    "tx-loa-v03-texas-intermediary-brokerage",
  ]) {
    for (const extension of ["mp4", "vtt", "en.vtt", "txt"]) {
      assert.equal(
        fs.existsSync(path.join(root, `public/statecourse/media/${stem}.${extension}`)),
        false,
        `${stem}.${extension} must not be public`,
      );
    }
  }
});

test("the portfolio release rule requires every asset and review layer", () => {
  const text = Object.values(portfolio.initial_policy).join(" ");
  for (const requirement of ["MP4", "poster", "VTT", "transcript", "factual review", "visual review", "logo-safety review", "accessibility review", "Cloudflare Stream", "signed-playback", "origin restriction"]) {
    assert.match(text, new RegExp(requirement, "i"), requirement);
  }
});
