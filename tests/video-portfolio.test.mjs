import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const portfolio = readJson("video-production/portfolio.json");
const catalog = readJson("public/statecourse/data/course-catalog.json");
const courses = catalog.categories.flatMap((category) => category.programs).flatMap((program) => program.courses);

test("video portfolio reconciles exactly to the public course catalog", () => {
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

test("Texas records three ready editorial packages without claiming a render or activation", () => {
  const texas = portfolio.states.find((state) => state.state_code === "TX");
  assert.equal(texas.editorial_packages_ready, 3);
  assert.equal(texas.rendered_instructional_videos, 0);
  assert.equal(texas.active_instructional_videos, 0);
  for (const stem of ["tx-iabs-1-2-document-overview", "tx-representation-or-showing-only-2026", "tx-intermediary-brokerage"]) {
    assert.equal(fs.existsSync(path.join(root, `public/statecourse/media/${stem}.mp4`)), false, stem);
  }
});

test("the portfolio release rule requires every asset and review layer", () => {
  const text = Object.values(portfolio.initial_policy).join(" ");
  for (const requirement of ["MP4", "poster", "VTT", "transcript", "factual review", "visual review", "logo-safety review", "accessibility review"]) {
    assert.match(text, new RegExp(requirement, "i"), requirement);
  }
});
