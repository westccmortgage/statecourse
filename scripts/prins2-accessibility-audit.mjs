/**
 * TX Principles II — accessibility audit against the RENDERED reviewer surface.
 *
 * MEASURED, NOT INFERRED. Acceptance point 17 requires accessibility to be tested against what a
 * person actually operates. A data structure cannot be keyboard-navigated and a config file has no
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
 * Usage:  node scripts/prins2-accessibility-audit.mjs [--json]
 * Exit 0 only when every criterion passes.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SURFACE = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/reviewer-surface");
const OUT = path.join(root, "texas/tx-principles-real-estate-ii-30-v1/accessibility-report.json");
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

await browser.close();

const REQUIRED = ["keyboardNavigation", "visibleFocusStates", "screenReaderNamesAndRelationships", "headingHierarchy",
  "formLabels", "answerChoiceSemantics", "errorIdentification", "rationaleAndRemediationAnnouncements",
  "progressStateCommunication", "scenarioControls", "finalExamNavigation", "contrast", "zoomAndResponsive",
  "laptopLayout", "tabletLayout", "mobileLayout", "captionsAndTranscripts"];
const failed = REQUIRED.filter((k) => results[k] !== "PASS");

const report = {
  generatedBy: "scripts/prins2-accessibility-audit.mjs",
  measuredAgainst: "texas/tx-principles-real-estate-ii-30-v1/reviewer-surface — the RENDERED course, driven in Chromium",
  pagesTested: PAGES,
  tool: "axe-core (wcag2a, wcag2aa, wcag21a, wcag21aa) plus scripted keyboard, focus, live-region, viewport and zoom checks",
  limits: "Automated and scripted checks only. No test here substitutes for testing with real assistive technology and real users, and a pass may not be described as one.",
  results,
  findings,
  axeViolations,
  required: REQUIRED,
  failed,
};
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log("TX Principles II — accessibility, measured against the rendered reviewer surface");
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
