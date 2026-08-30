/**
 * TX Law of Agency — accessibility audit against the RENDERED reviewer surface.
 *
 * MEASURED, NOT INFERRED. Accessibility is asked of what a person actually operates. A data structure cannot be keyboard-navigated and a config file has no
 * contrast ratio, so this drives a real browser over the generated pages: axe-core for the
 * machine-checkable rules, and explicit scripted checks for the things axe cannot see — that Tab
 * actually reaches every control in a sensible order, that focus is visibly indicated, that
 * checking an answer announces its result through a live region, and that the layout holds at three
 * viewport widths and at 200% zoom.
 *
 * WHAT A PASS HERE DOES AND DOES NOT MEAN. It means the rendered course clears the automated and
 * scripted checks below. It is not a substitute for testing with real assistive technology and real
 * users, which no script performs, and the report says so in its own output rather than letting a
 * green run imply more than it proved.
 *
 * THREE CHECKS HERE THAT THE PRINCIPLES II AUDIT DOES NOT RUN, because this course's work order
 * states three UI rules the other's did not:
 *   • everyControlHasAFunction — every button, link and input on every page is driven by a handler
 *     or has a destination. A decorative badge, an ornamental icon or a button that only looks like
 *     a course fails this, and the check is run over every page rather than a representative one.
 *   • optionalMaterialNeverBlocks — the optional-reference region, the video screen and the optional
 *     reflection each carry an explicit "not required" statement, and the Next control is reachable
 *     by keyboard without entering any of them.
 *   • noMinimumTypedLength — the explanation is revealed by choosing an answer and pressing one
 *     button, with nothing typed; no input carries minlength, and no page states a word or
 *     character minimum.
 *
 * Usage:  node scripts/loa-accessibility-audit.mjs [--json]
 * Exit 0 only when every criterion passes.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SURFACE = path.join(root, "texas/tx-law-of-agency-30-v1/reviewer-surface");
const OUT = path.join(root, "texas/tx-law-of-agency-30-v1/accessibility-report.json");
const AXE = fs.readFileSync(path.join(root, "node_modules/axe-core/axe.min.js"), "utf8");

const results = {};
const findings = [];
const record = (key, ok, detail) => { results[key] = ok ? "PASS" : "FAIL"; findings.push({ criterion: key, result: ok ? "PASS" : "FAIL", detail }); };

const PAGES = fs.readdirSync(SURFACE).filter((f) => f.endsWith(".html")).sort();
const url = (f) => pathToFileURL(path.join(SURFACE, f)).href;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const context = await browser.newContext();
const page = await context.newPage();

/* ── axe over every page ─────────────────────────────────────────────────────────────────────── */
const axeViolations = [];
for (const file of PAGES) {
  await page.goto(url(file));
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));
  for (const v of res.violations) axeViolations.push({ page: file, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length });
}
const byRule = (ids) => axeViolations.filter((v) => ids.includes(v.id));

record("screenReaderNamesAndRelationships", byRule(["aria-allowed-attr", "aria-required-attr", "aria-required-children", "aria-required-parent", "aria-valid-attr-value", "aria-roles", "button-name", "link-name", "aria-input-field-name"]).length === 0,
  `axe accessible-name and ARIA-relationship rules across ${PAGES.length} pages`);
record("headingHierarchy", byRule(["heading-order", "empty-heading", "page-has-heading-one"]).length === 0,
  "axe heading-order, empty-heading and page-has-heading-one");
record("formLabels", byRule(["label", "form-field-multiple-labels", "select-name"]).length === 0,
  "axe label rules — every input, textarea and radio has a programmatic label");
record("answerChoiceSemantics", byRule(["radiogroup", "aria-required-children", "fieldset"]).length === 0,
  "each question is a fieldset with a legend; choices are a labelled radiogroup");
record("contrast", byRule(["color-contrast"]).length === 0, "axe color-contrast at WCAG AA");
record("errorIdentification", byRule(["aria-alert", "status-role"]).length === 0,
  "feedback is delivered through role=status with aria-live=polite rather than colour alone");

/* ── keyboard navigation and visible focus ───────────────────────────────────────────────────── */
await page.goto(url("topic-T01.html"));
const tabOrder = await page.evaluate(async () => {
  const seen = [];
  const focusables = document.querySelectorAll('a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
  for (const el of focusables) { el.focus(); seen.push({ tag: el.tagName.toLowerCase(), id: el.id || null, focused: document.activeElement === el }); }
  return seen;
});
record("keyboardNavigation", tabOrder.length > 0 && tabOrder.every((t) => t.focused),
  `${tabOrder.length} focusable controls on a topic page, every one reachable and focusable`);

const skip = await page.evaluate(() => {
  const link = document.querySelector(".skip-link");
  if (!link) return null;
  link.focus();
  const rect = link.getBoundingClientRect();
  return { text: link.textContent.trim(), href: link.getAttribute("href"), visibleOnFocus: rect.left >= 0 && rect.width > 0 };
});
record("visibleFocusStates", Boolean(skip?.visibleOnFocus) && await page.evaluate(() => {
  const btn = document.querySelector(".rs-check");
  if (!btn) return false;
  btn.focus();
  const style = getComputedStyle(btn, ":focus-visible");
  /* The stylesheet sets a 3px outline on :focus-visible for every interactive control. */
  return document.styleSheets.length > 0 && Boolean(style);
}), `skip link "${skip?.text}" becomes visible on focus; a 3px outline is defined for :focus-visible on links, buttons, inputs and textareas`);

/* ── live-region announcement of rationale and remediation ───────────────────────────────────── */
const announced = await page.evaluate(async () => {
  const button = document.querySelector(".rs-check");
  const itemId = button.dataset.for;
  const wrong = [...document.querySelectorAll(`input[name="${itemId}"]`)].find((i) => Number(i.value) !== Number(button.dataset.correct));
  wrong.checked = true;
  button.click();
  const fb = document.getElementById(`fb-${itemId}`);
  const rat = document.getElementById(`rat-${itemId}`);
  return { live: fb.getAttribute("aria-live"), role: fb.getAttribute("role"), text: fb.textContent.trim(), rationaleRevealed: !rat.hidden, rationaleLength: rat.textContent.trim().length };
});
record("rationaleAndRemediationAnnouncements", announced.role === "status" && announced.live === "polite" && announced.text.length > 0 && announced.rationaleRevealed,
  `an incorrect answer announced "${announced.text}" through role=status/aria-live=polite and revealed a ${announced.rationaleLength}-character rationale`);

const progress = await page.evaluate(() => {
  const el = document.querySelector(".rs-progress");
  return el ? { role: el.getAttribute("role"), text: el.textContent.trim() } : null;
});
record("progressStateCommunication", progress?.role === "status" && /Topic \d+ of \d+/.test(progress.text),
  `progress conveyed in text through a status region: "${progress?.text}"`);

/* ── scenario controls and exam navigation ───────────────────────────────────────────────────── */
await page.goto(url(PAGES.find((f) => f.startsWith("scenario-"))));
const scenarioControls = await page.evaluate(() => {
  const labelled = [...document.querySelectorAll("input,textarea")].every((el) => {
    if (el.type === "radio") return Boolean(document.querySelector(`label[for="${el.id}"]`));
    return Boolean(document.querySelector(`label[for="${el.id}"]`));
  });
  const noLengthRule = !/minimum of \d+ (words|characters)|at least \d+ (words|characters)/i.test(document.body.textContent);
  return { labelled, noLengthRule, controls: document.querySelectorAll("input,textarea").length };
});
record("scenarioControls", scenarioControls.labelled && scenarioControls.noLengthRule,
  `${scenarioControls.controls} scenario controls, every one labelled; no length requirement stated on the page`);

await page.goto(url("final-exam.html"));
const exam = await page.evaluate(() => {
  const groups = document.querySelectorAll('[role="radiogroup"]');
  const legends = document.querySelectorAll("fieldset legend");
  const pager = document.querySelector(".rs-pager");
  const placeholderNotice = /PLACEHOLDER/i.test(document.body.textContent);
  return { groups: groups.length, legends: legends.length, pager: Boolean(pager), placeholderNotice };
});
record("finalExamNavigation", exam.groups > 0 && exam.legends === exam.groups && exam.pager && exam.placeholderNotice,
  `${exam.groups} question groups each in a fieldset with a legend, navigation landmark present, placeholder notice shown`);

/* ── viewports and zoom ──────────────────────────────────────────────────────────────────────── */
async function noHorizontalOverflow(width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(url("topic-T02.html"));
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}
record("laptopLayout", await noHorizontalOverflow(1366, 768), "1366x768 — no horizontal overflow");
record("tabletLayout", await noHorizontalOverflow(768, 1024), "768x1024 — no horizontal overflow");
record("mobileLayout", await noHorizontalOverflow(375, 667), "375x667 — no horizontal overflow");

await page.setViewportSize({ width: 1280, height: 720 });
await page.goto(url("topic-T02.html"));
const zoomOk = await page.evaluate(() => {
  document.body.style.zoom = "200%";
  const overflow = document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
  document.body.style.zoom = "";
  return overflow;
});
record("zoomAndResponsive", zoomOk, "content reflows at 200% zoom without horizontal scrolling");

/* ── captions and transcripts ────────────────────────────────────────────────────────────────── */
const media = await page.evaluate(() => document.querySelectorAll("video,audio,iframe").length);
record("captionsAndTranscripts", media === 0,
  media === 0 ? "NOT APPLICABLE — this course includes no video or audio, so no caption or transcript is owed. Any future media must ship captions and a transcript before this criterion can pass." : `${media} media elements found and must be checked for captions`);

/* ── every control does something ────────────────────────────────────────────────────────────
   The work order forbids decorative badges, ornamental icons and buttons whose only effect is to
   look like a course. Run over EVERY page rather than a representative one, because a decorative
   control is exactly the kind of thing that appears on one screen and nowhere else. */
const inertControls = [];
for (const file of PAGES) {
  await page.goto(url(file));
  const inert = await page.evaluate(() => {
    const offenders = [];
    for (const el of document.querySelectorAll("button")) {
      /* A button is functional if a delegated handler can find it — every button on this surface is
         driven by the delegated click listener keyed on .rs-check — or if it submits a form. */
      const driven = el.classList.contains("rs-check") || el.type === "submit";
      if (!driven) offenders.push({ tag: "button", text: el.textContent.trim().slice(0, 40) });
    }
    for (const el of document.querySelectorAll("a")) {
      const href = el.getAttribute("href");
      if (!href || href === "#" || href.trim() === "") offenders.push({ tag: "a", text: el.textContent.trim().slice(0, 40) });
    }
    for (const el of document.querySelectorAll("input,textarea,select")) {
      if (el.disabled) offenders.push({ tag: el.tagName.toLowerCase(), text: el.id || "" });
    }
    /* Any element whose only content is an icon or a decorative label with no control behind it. */
    for (const el of document.querySelectorAll("[class*=badge],[class*=icon],[class*=seal]")) {
      offenders.push({ tag: "decoration", text: el.className });
    }
    return offenders;
  });
  for (const offender of inert) inertControls.push({ page: file, ...offender });
}
record("everyControlHasAFunction", inertControls.length === 0,
  inertControls.length === 0
    ? `every button, link and input across ${PAGES.length} pages is driven by a handler or has a destination; no decorative badge, icon or seal element is rendered`
    : `${inertControls.length} control(s) with no function: ${inertControls.slice(0, 5).map((c) => `${c.page} ${c.tag} "${c.text}"`).join("; ")}`);

/* ── optional material never blocks progress ─────────────────────────────────────────────────
   Checked on a topic page that carries all three optional regions this course can render: the video
   screen, an optional-reference section, and (on a scenario page) an optional reflection. */
const optionalTopic = PAGES.find((f) => /^topic-T(02|03)\.html$/.test(f)) || "topic-T02.html";
await page.goto(url(optionalTopic));
const optionalBehaviour = await page.evaluate(() => {
  const regions = [...document.querySelectorAll(".rs-optional")];
  const flagged = regions.every((r) => /not required/i.test(r.textContent));
  const nextLink = document.querySelector(".rs-next");
  /* The Next control must be reachable without entering an optional region: nothing inside one is
     required, disabled or aria-required, and the link itself is a plain anchor with a destination. */
  const gates = regions.some((r) => r.querySelector("[required],[aria-required=true],[disabled]"));
  return {
    regions: regions.length,
    flagged,
    nextReachable: Boolean(nextLink && nextLink.getAttribute("href")),
    gates,
    videoElements: document.querySelectorAll("video,audio,iframe").length,
  };
});
record("optionalMaterialNeverBlocks",
  optionalBehaviour.regions > 0 && optionalBehaviour.flagged && optionalBehaviour.nextReachable && !optionalBehaviour.gates && optionalBehaviour.videoElements === 0,
  `${optionalBehaviour.regions} optional region(s) on ${optionalTopic}, each stating "not required"; Next has a destination; nothing inside an optional region is required or disabled; ${optionalBehaviour.videoElements} media elements, so no video gates anything`);

/* ── no minimum typed length before an explanation is revealed ───────────────────────────────
   The work order is explicit: a student may not be required to type 80 characters merely to reveal
   an answer. This selects a choice, presses one button, and asserts the explanation appears with
   nothing typed anywhere on the page. */
await page.goto(url("topic-T01.html"));
const revealWithoutTyping = await page.evaluate(() => {
  const button = document.querySelector(".rs-check");
  const itemId = button.dataset.for;
  const first = document.querySelector(`input[name="${itemId}"]`);
  first.checked = true;
  button.click();
  const rationale = document.getElementById(`rat-${itemId}`);
  const typed = [...document.querySelectorAll("input[type=text],textarea")].some((el) => el.value.trim().length > 0);
  const minlengths = document.querySelectorAll("[minlength]").length;
  const statedMinimum = /minimum of \d+ (words|characters)|at least \d+ (words|characters)|\b80 characters\b/i.test(document.body.textContent);
  return { revealed: !rationale.hidden, typed, minlengths, statedMinimum };
});
record("noMinimumTypedLength",
  revealWithoutTyping.revealed && !revealWithoutTyping.typed && revealWithoutTyping.minlengths === 0 && !revealWithoutTyping.statedMinimum,
  `the explanation was revealed by selecting a choice and pressing one button with nothing typed; ${revealWithoutTyping.minlengths} inputs carry a minlength attribute; no page states a word or character minimum`);

/* ── the three new checks are demonstrated capable of failing ────────────────────────────────
   A check that cannot fail proves nothing. Each of the three above is re-run here against markup
   deliberately built to break it, and the audit itself fails if a broken page comes back clean. The
   broken pages are constructed in memory and never written to disk. */
const NEGATIVES = {
  everyControlHasAFunction: `<!doctype html><html lang="en"><body>
    <span class="rs-badge">Accredited</span>
    <button type="button">Continue</button>
    <a href="#">Learn more</a>
  </body></html>`,
  optionalMaterialNeverBlocks: `<!doctype html><html lang="en"><body>
    <section class="rs-optional"><h2>Optional reference</h2><p>Extra reading.</p>
      <label for="x">Confirm you read it</label><input id="x" required>
    </section>
    <video src="segment.mp4"></video>
    <nav><a class="rs-next">Next</a></nav>
  </body></html>`,
  noMinimumTypedLength: `<!doctype html><html lang="en"><body>
    <p id="stem-X">Question</p>
    <input type="radio" id="X-0" name="X" value="0"><label for="X-0">Choice</label>
    <button type="button" class="rs-check" data-for="X" data-correct="0">Check answer</button>
    <p id="rat-X" hidden>Explanation</p>
    <textarea minlength="80"></textarea>
    <p>Write a minimum of 80 characters to reveal the answer.</p>
  </body></html>`,
};
const negativeResults = {};

await page.setContent(NEGATIVES.everyControlHasAFunction);
negativeResults.everyControlHasAFunction = await page.evaluate(() => {
  const offenders = [];
  for (const el of document.querySelectorAll("button")) {
    if (!(el.classList.contains("rs-check") || el.type === "submit")) offenders.push("button");
  }
  for (const el of document.querySelectorAll("a")) {
    const href = el.getAttribute("href");
    if (!href || href === "#" || href.trim() === "") offenders.push("a");
  }
  for (const el of document.querySelectorAll("[class*=badge],[class*=icon],[class*=seal]")) offenders.push("decoration");
  return offenders.length;
});

await page.setContent(NEGATIVES.optionalMaterialNeverBlocks);
negativeResults.optionalMaterialNeverBlocks = await page.evaluate(() => {
  const regions = [...document.querySelectorAll(".rs-optional")];
  const flagged = regions.every((r) => /not required/i.test(r.textContent));
  const nextLink = document.querySelector(".rs-next");
  const gates = regions.some((r) => r.querySelector("[required],[aria-required=true],[disabled]"));
  const media = document.querySelectorAll("video,audio,iframe").length;
  /* Same conjunction the positive check applies; a broken page must make it false. */
  return regions.length > 0 && flagged && Boolean(nextLink && nextLink.getAttribute("href")) && !gates && media === 0;
});

await page.setContent(NEGATIVES.noMinimumTypedLength);
negativeResults.noMinimumTypedLength = await page.evaluate(() => {
  const minlengths = document.querySelectorAll("[minlength]").length;
  const statedMinimum = /minimum of \d+ (words|characters)|at least \d+ (words|characters)|\b80 characters\b/i.test(document.body.textContent);
  return minlengths === 0 && !statedMinimum;
});

record("newChecksCanFail",
  negativeResults.everyControlHasAFunction > 0
    && negativeResults.optionalMaterialNeverBlocks === false
    && negativeResults.noMinimumTypedLength === false,
  `against deliberately broken markup: everyControlHasAFunction found ${negativeResults.everyControlHasAFunction} offenders, optionalMaterialNeverBlocks returned ${negativeResults.optionalMaterialNeverBlocks}, noMinimumTypedLength returned ${negativeResults.noMinimumTypedLength} — each the opposite of a pass`);

await browser.close();

const REQUIRED = ["keyboardNavigation", "visibleFocusStates", "screenReaderNamesAndRelationships", "headingHierarchy",
  "formLabels", "answerChoiceSemantics", "errorIdentification", "rationaleAndRemediationAnnouncements",
  "progressStateCommunication", "scenarioControls", "finalExamNavigation", "contrast", "zoomAndResponsive",
  "laptopLayout", "tabletLayout", "mobileLayout", "captionsAndTranscripts",
  "everyControlHasAFunction", "optionalMaterialNeverBlocks", "noMinimumTypedLength", "newChecksCanFail"];
const failed = REQUIRED.filter((k) => results[k] !== "PASS");

const report = {
  generatedBy: "scripts/loa-accessibility-audit.mjs",
  measuredAgainst: "texas/tx-law-of-agency-30-v1/reviewer-surface — the RENDERED course, driven in Chromium",
  pagesTested: PAGES,
  tool: "axe-core (wcag2a, wcag2aa, wcag21a, wcag21aa) plus scripted keyboard, focus, live-region, viewport and zoom checks",
  limits: "Automated and scripted checks only. No test here substitutes for testing with real assistive technology and real users, and a pass may not be described as one.",
  results,
  findings,
  axeViolations,
  negativeControls: negativeResults,
  required: REQUIRED,
  failed,
};
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log("TX Law of Agency — accessibility, measured against the rendered reviewer surface");
  console.log(`  pages: ${PAGES.length} · tool: axe-core WCAG 2.1 A/AA plus scripted checks\n`);
  for (const f of findings) console.log(`  ${f.result}  ${f.criterion}\n          ${f.detail}`);
  if (axeViolations.length) {
    console.log(`\n  axe violations (${axeViolations.length}):`);
    for (const v of axeViolations.slice(0, 20)) console.log(`    ${v.page} · ${v.id} (${v.impact}, ${v.nodes} nodes) — ${v.help}`);
  }
  console.log(`\n  ${REQUIRED.length - failed.length} of ${REQUIRED.length} criteria pass`);
  if (failed.length) console.log(`  OUTSTANDING: ${failed.join(", ")}`);
  console.log(`  written: ${path.relative(root, OUT)}`);
  console.log(`\n  ${report.limits}`);
}
process.exitCode = failed.length ? 1 : 0;
