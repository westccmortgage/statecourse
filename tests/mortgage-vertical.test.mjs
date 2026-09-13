/**
 * The mortgage vertical: its own door, its own page, and no claim it has not earned.
 *
 * Mortgage loan originator education is a different licence from real estate, under a different
 * regulator, with course approval running through NMLS rather than a state real estate commission.
 * The point of splitting the homepage is that a visitor who needs mortgage continuing education
 * never lands in the real estate funnel by default. These tests hold that split in place and hold
 * the page to the same source discipline as every other page on the site: it may say what is being
 * built, and it may not publish a requirement nobody has read from an official source.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const read = (relativePath) => fs.readFileSync(path.join(publicRoot, relativePath), "utf8");
const catalog = JSON.parse(read("data/course-catalog.json"));
const mortgageCategory = catalog.categories.find((entry) => entry.category_id === "mortgage");

test("the homepage offers two doors, and each one goes somewhere real", () => {
  const html = read("index.html");
  const doors = html.match(/<a class="vertical-door" href="([^"]+)"/g) ?? [];
  assert.equal(doors.length, 2, "the homepage must offer exactly two vertical doors");
  assert.match(html, /<a class="vertical-door" href="#licensing-finder"/, "no real estate door");
  assert.match(html, /<a class="vertical-door" href="mortgage\/"/, "no mortgage door");
  /* The real estate door points at an anchor. The anchor has to exist, or the door is a dead
     control on the most prominent surface the site has. */
  assert.match(html, /id="licensing-finder"/);
  assert.ok(fs.existsSync(path.join(publicRoot, "mortgage/index.html")), "the mortgage door points at a page that does not exist");
});

test("splitting the hero did not cost the state finder any of its parts", () => {
  const html = read("index.html");
  /* The finder moved out of the hero and into its own band. Moving it is fine; losing a field
     silently is not, and a partially copied form still renders as a form. */
  for (const fragment of ['id="homeStateSelect"', 'id="homeGoalSelect"', 'id="finderMessage"', 'class="intent-tabs"', "</form>"]) {
    assert.ok(html.includes(fragment), `the licensing finder lost ${fragment}`);
  }
  assert.equal((html.match(/<form/g) ?? []).length, (html.match(/<\/form>/g) ?? []).length, "unbalanced form tags");
});

test("the mortgage launch date is data, and the homepage repeats the catalog rather than inventing one", () => {
  assert.ok(mortgageCategory, "catalog has no mortgage category");
  const target = mortgageCategory.launch_target;
  assert.ok(target?.label, "the mortgage category records no launch target");
  const home = read("index.html");
  const page = read("mortgage/index.html");
  assert.ok(home.includes(target.label), `the homepage door does not carry the catalog's launch label ${target.label}`);
  assert.ok(page.includes(target.label), "the mortgage page does not carry the catalog's launch label");
  /* A date that appears in two places and is edited in one is the failure this guards. */
  const otherMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"]
    .filter((month) => !target.label.startsWith(month));
  for (const month of otherMonths) {
    assert.ok(!page.includes(`Launching ${month}`), `the mortgage page names a second launch month: ${month}`);
  }
});

test("the mortgage page offers training discovery but claims no approval or credit enrollment", () => {
  const page = read("mortgage/index.html");
  const courses = (mortgageCategory.programs ?? []).flatMap((program) => program.courses ?? []);
  if (courses.length === 0) {
    assert.match(page, /StateCourse does not offer mortgage continuing education in any jurisdiction yet/);
  }
  assert.match(page, /holds no NMLS provider approval and no NMLS course approval/);
  /* The launch date is a build target. It must never be worded as a regulatory date. */
  assert.ok(!/approved (in|from|by) October/i.test(page), "the page implies approval arrives on the launch date");
  assert.match(page, /not an approval date/);
  assert.match(page, /Sign in to view free training/);
  assert.match(page, /Course training completed/);
  assert.match(page, /not NMLS credit earned/);
  assert.doesNotMatch(page, /free-practice\/\?state=US|null-hour|null hours/);
});

/**
 * The discipline the rest of the site follows: a requirement is published only once it has been
 * read from the official source and recorded here. Nothing from the SAFE Act or NMLS has been read
 * into the public claims registry, so the mortgage page describes training and does not state an hour
 * count, a subject split, or a renewal deadline — the three things a visitor would most reasonably
 * assume were verified.
 */
test("the mortgage page publishes no requirement that has not been read from an official source", () => {
  const page = read("mortgage/index.html");
  const body = page.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(body, /\b\d+\s*(hours?|credits?)\b/i, "the page states an hour or credit requirement");
  assert.doesNotMatch(body, /\b\d+\s*hours? of (continuing education|ethics|federal law)/i);
  assert.doesNotMatch(body, /renew(al)? (is )?due|deadline of|expires on/i, "the page states a renewal deadline");
  assert.match(page, /publishes no continuing-education hour requirement/);
});

test("the mortgage page does not answer a mortgage question with a real estate regulator", () => {
  const page = read("mortgage/index.html");
  /* service-area.js prints a row from the real estate state registry. Wiring it to this page
     would answer every one of 51 jurisdictions with the wrong agency. */
  assert.doesNotMatch(page, /service-area\.js/, "the mortgage page loads the real estate service-area script");
  assert.doesNotMatch(page, /id="serviceStateSelect"/, "the mortgage page offers a real estate jurisdiction selector");
});

test("the mortgage vertical is reachable from the site's own navigation", () => {
  for (const page of ["index.html", "get-licensed/index.html", "continuing-education/index.html", "exam-prep/index.html"]) {
    const html = read(page);
    assert.match(html, /href="(\.\.\/)?mortgage\/">Mortgage \/ NMLS</, `${page} does not link to the mortgage vertical`);
  }
});
