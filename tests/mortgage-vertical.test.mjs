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

test("the homepage has two real destinations and no state form or approval warning in its hero",()=>{
 const html=read('index.html'),hero=html.split('<section class="national-hero"')[1].split('</section>')[0];
 assert.equal((hero.match(/class="vertical-door"/g)||[]).length,2);
 assert.match(hero,/href="get-licensed\/"/);assert.match(hero,/href="mortgage\/"/);
 assert.doesNotMatch(html,/id="homeStateSelect"|id="licensing-finder"/);
 assert.doesNotMatch(hero,/waiting for approval|not available|coming soon/i);
});
test("both verticals offer the same three explicit entry goals",()=>{
 for(const [route,vertical] of [['get-licensed','real-estate'],['mortgage','mortgage']]){
  const page=read(route+'/index.html');
  for(const goal of ['practice','licensed','renew'])assert.ok(page.includes(`vertical=${vertical}&amp;goal=${goal}`));
  assert.match(page,/Start Free Practice/);assert.match(page,/Explore Pre-Licensing/);assert.match(page,/Explore Continuing Education/);
  assert.doesNotMatch(page.split('<details')[0],/waiting for approval|not available|coming soon/i);
 }
});
test("mortgage practice is explicitly non-credit without advertising licensing approval",()=>{
 const page=read('mortgage/index.html');assert.match(page,/does not earn NMLS credit/);
 assert.match(page,/Pre-licensing \(PE\).*continuing education \(CE\)/);
 assert.match(page,/before any credit enrollment or payment/);
 assert.doesNotMatch(page,/holds no NMLS provider approval|approved (in|from|by) October|free-practice\/\?state=US|null-hour|null hours/i);
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
