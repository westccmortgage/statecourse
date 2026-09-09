/**
 * TX Law of Agency — reviewer surface builder.
 *
 * WHY A SURFACE EXISTS AT ALL. Accessibility is asked of the RENDERED course, and inferring it from
 * data structures is not measurement — a screen reader operates markup, not a config file. This
 * builds the smallest honest thing that can be tested: every screen TYPE the course delivers,
 * rendered with the semantics a student player would use.
 *
 * WHERE IT GOES, AND WHY NOT public/. The output lands in
 * texas/tx-law-of-agency-30-v1/reviewer-surface/, deliberately outside public/ and dist/. The build
 * guards scan those trees for examination material; a reviewer artifact living there would either
 * trip the guard or, worse, be published. It is not served, not linked from the site, and carries
 * noindex.
 *
 * THE EXAMINATION SCREEN USES PLACEHOLDER ITEMS, AND THAT IS THE POINT. Accessibility is a property
 * of the rendering — heading order, form labels, radio-group semantics, focus, announcements — not
 * of which question is asked. Rendering real bank items would put stems, choices and the key into a
 * tracked file for no testing benefit whatever, and 22 TAC § 535.65(h)(2) requires the questions to
 * be kept confidential. The placeholders carry byte-identical markup to the real thing and say on
 * the page that they are placeholders.
 *
 * FOUR UI RULES THIS BUILD IS HELD TO, EACH VISIBLE IN THE MARKUP.
 *   1. Every control does something. There are no decorative badges, no ornamental icons and no
 *      buttons whose only effect is to look like a course. The surface renders exactly the controls
 *      the delivery contract needs, and scripts/loa-accessibility-audit.mjs fails the build if it
 *      finds a control with no handler and no destination.
 *   2. Optional material never blocks progress. An optional-reference section and an optional
 *      reflection are rendered as skippable regions carrying an explicit "not required" statement,
 *      outside the required-time accounting, and the Next control is reachable without touching
 *      either.
 *   3. No video gates anything. This isolated reviewer fixture deliberately omits external Stream
 *      playback and renders the video screen as a labelled placeholder stating that the transcript
 *      is the primary artifact and the screen carries no completion requirement.
 *   4. A short-answer box has no minimum length. The rubric text says the answer is graded on the
 *      elements identified and never on length, and no input carries a minlength attribute.
 *
 * NON-CREDIT, ON EVERY PAGE. Each page carries a banner stating that this is a reviewer surface,
 * that the course holds no TREC approval, and that no Texas credit is available.
 *
 * Usage:  node scripts/build-loa-reviewer-surface.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { COURSE, MODULES } from "../config/texas/law-of-agency-course.mjs";
import { TOPICS } from "../config/texas/law-of-agency-course-form.mjs";
import { TOPIC_QUIZZES } from "../config/texas/law-of-agency-question-bank.mjs";
import { MISCONCEPTION_CHECKS } from "../config/texas/law-of-agency-misconception-checks.mjs";
import { SCENARIOS } from "../config/texas/law-of-agency-scenarios.mjs";
import { VERSIONS, SCORING, EXAM_READY } from "../config/texas/law-of-agency-final-exam-forms.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "texas/tx-law-of-agency-30-v1");
const OUT = path.join(HOME, "reviewer-surface");
const CURRICULUM = path.join(HOME, "curriculum");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal, dependency-free markdown → HTML for the frozen module text. Headings keep their
    relative level so the page's hierarchy mirrors the source's, which is what an audit tests. */
function mdToHtml(md, { demote = 2 } = {}) {
  const out = [];
  let inList = false;
  for (const raw of String(md).split("\n")) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h${Math.min(6, heading[1].length + demote - 1)}>${inline(heading[2])}</h${Math.min(6, heading[1].length + demote - 1)}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }
    if (!line) continue;
    if (/^>\s?/.test(line)) { out.push(`<blockquote><p>${inline(line.replace(/^>\s?/, ""))}</p></blockquote>`); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|\W)\*(?!\s)(.+?)(?<!\s)\*(?=\W|$)/g, "$1<em>$2</em>");

const BANNER = `<div class="review-banner" role="note">
      <strong>Reviewer surface — not a student course.</strong>
      StateCourse holds no Texas Real Estate Commission approval for this course and no application has been filed.
      Nothing here may be taken for Texas qualifying credit. Enrollment is disabled and the final examination is not administrable.
    </div>`;

function page({ title, heading, crumb, body, prev, next: nextHref }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${esc(title)} | Reviewer surface</title>
  <link rel="stylesheet" href="reviewer.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="rs-header">
    <p class="rs-brand"><strong>StateCourse</strong> <span>Texas Law of Agency — reviewer surface</span></p>
    <nav aria-label="Reviewer surface">
      <ul class="rs-nav">
        <li><a href="index.html">Overview</a></li>
        <li><a href="topic-T01.html">Topics</a></li>
        <li><a href="scenario-${esc(SCENARIOS[0].id)}.html">Scenarios</a></li>
        <li><a href="final-exam.html">Final examination</a></li>
      </ul>
    </nav>
  </header>
  <main id="main" class="rs-main">
    ${BANNER}
    <nav aria-label="Breadcrumb"><ol class="rs-crumb">${crumb}</ol></nav>
    <h1>${esc(heading)}</h1>
${body}
    <nav class="rs-pager" aria-label="Course navigation">
      ${prev ? `<a class="rs-prev" href="${esc(prev.href)}">Previous: ${esc(prev.label)}</a>` : "<span></span>"}
      ${nextHref ? `<a class="rs-next" href="${esc(nextHref.href)}">Next: ${esc(nextHref.label)}</a>` : "<span></span>"}
    </nav>
  </main>
  <footer class="rs-footer">
    <p>Reviewer surface generated from the frozen curriculum at ${esc(COURSE.contentFreeze)}. No TREC approval. No Texas credit.</p>
  </footer>
  <script src="reviewer.js" defer></script>
</body>
</html>
`;
}

/* ── the pages ───────────────────────────────────────────────────────────────────────────────── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/* overview */
const overviewBody = `    <section aria-labelledby="courseFacts">
      <h2 id="courseFacts">Course record</h2>
      <dl class="rs-facts">
        <dt>Approval form</dt><dd>${esc(COURSE.approvalForm)} rev. ${esc(COURSE.approvalFormRevision)}</dd>
        <dt>Credit hours</dt><dd>${COURSE.hours} (${COURSE.totalMinutes} prescribed minutes)</dd>
        <dt>TREC approval</dt><dd>${esc(COURSE.trecApprovalStatus)}</dd>
        <dt>Enrollment</dt><dd>Disabled</dd>
        <dt>Texas credit</dt><dd>Not available</dd>
        <dt>Final examination</dt><dd>${esc(COURSE.finalExaminationStatus)}</dd>
      </dl>
    </section>
    <section aria-labelledby="topicList">
      <h2 id="topicList">Topics</h2>
      <ol class="rs-topics">
${TOPICS.map((topic) => `        <li><a href="topic-${topic.code}.html">${esc(topic.topic)}</a> <span class="rs-meta">${topic.units.length} units · ${topic.subtotalMinutes} min</span></li>`).join("\n")}
      </ol>
    </section>
    <section aria-labelledby="scenarioList">
      <h2 id="scenarioList">Scenario exercises</h2>
      <ul>
${SCENARIOS.map((s) => `        <li><a href="scenario-${esc(s.id)}.html">${esc(s.title)}</a> <span class="rs-meta">after ${esc(s.afterTopic)}${s.courseLevel ? " · course-level capstone" : ""}</span></li>`).join("\n")}
      </ul>
    </section>`;
fs.writeFileSync(path.join(OUT, "index.html"), page({
  title: "Overview", heading: "Texas Law of Agency", crumb: "<li>Overview</li>",
  body: overviewBody, prev: null, next: { href: "topic-T01.html", label: TOPICS[0].topic },
}));

/* one page per topic: instruction, the video placeholder, an optional-reference region where the
   frozen module has one, the topic quiz, and the misconception check where the topic carries one */
const checksByTopic = new Map();
for (const check of MISCONCEPTION_CHECKS) checksByTopic.set(check.topicCode, check);
const scenarioAfterTopic = new Map(SCENARIOS.map((s) => [s.afterTopic, s]));

TOPICS.forEach((topic, index) => {
  const mod = MODULES[index];
  const md = fs.readFileSync(path.join(CURRICULUM, mod.file), "utf8");
  const firstUnit = md.split(/^## Unit: /m)[1] || "";
  const unitTitle = firstUnit.split("\n")[0]?.trim() ?? topic.topic;
  const unitBody = firstUnit.split("\n").slice(1).join("\n").split(/^### /m)[0];
  const optional = md.split(/^## Optional reference: /m)[1] || null;
  const items = TOPIC_QUIZZES[topic.code] || [];
  const check = checksByTopic.get(topic.code);

  const quiz = items.map((item, qi) => `        <fieldset class="rs-question" data-item="${esc(item.id)}">
          <legend>Question ${qi + 1} of ${items.length}</legend>
          <p id="stem-${esc(item.id)}">${esc(item.prompt)}</p>
          <div role="radiogroup" aria-labelledby="stem-${esc(item.id)}">
${item.choices.map((c, ci) => `            <div class="rs-choice"><input type="radio" id="${esc(item.id)}-${ci}" name="${esc(item.id)}" value="${ci}"><label for="${esc(item.id)}-${ci}">${esc(c)}</label></div>`).join("\n")}
          </div>
          <button type="button" class="rs-check" data-for="${esc(item.id)}" data-correct="${item.correctChoice}">Check answer</button>
          <p class="rs-feedback" id="fb-${esc(item.id)}" role="status" aria-live="polite"></p>
          <p class="rs-rationale" id="rat-${esc(item.id)}" hidden>${esc(item.rationale)}</p>
        </fieldset>`).join("\n");

  /* The video screen. Nothing is rendered because nothing has been produced, and the screen states
     both facts: no video exists, and the screen gates nothing. */
  const video = `    <section aria-labelledby="videoHeading" class="rs-optional">
      <h2 id="videoHeading">Video segment (optional)</h2>
      <p class="rs-optional-flag"><strong>Not required.</strong> This screen carries no completion requirement, contributes no required minutes, and no assessment depends on it. You may move to the next screen without opening it.</p>
      <p>No video has been produced for this build. When one is produced, the transcript below it is the primary artifact: every proposition a segment states is stated in the module text as well, so a student who never plays a video has read everything the course requires.</p>
    </section>`;

  const optionalSection = optional
    ? `    <section aria-labelledby="optionalHeading" class="rs-optional">
      <h2 id="optionalHeading">Optional reference: ${esc(optional.split("\n")[0].trim())}</h2>
      <p class="rs-optional-flag"><strong>Not required.</strong> This section is outside the required-time accounting for this course and no quiz question, scenario task or examination item depends on it.</p>
${mdToHtml(optional.split("\n").slice(1).join("\n").split(/^### /m)[0], { demote: 3 })}
    </section>`
    : "";

  const misconception = check
    ? `    <section aria-labelledby="mcHeading">
      <h2 id="mcHeading">Misconception check</h2>
      <p>One question, one attempt, no score. It is instructional rather than assessed: whichever answer you choose, the explanation follows and you continue.</p>
      <fieldset class="rs-question" data-item="${esc(check.id)}">
        <legend>${esc(check.unit)}</legend>
        <p id="stem-${esc(check.id)}">${esc(check.prompt)}</p>
        <div role="radiogroup" aria-labelledby="stem-${esc(check.id)}">
${check.options.map((o, oi) => `          <div class="rs-choice"><input type="radio" id="${esc(check.id)}-${oi}" name="${esc(check.id)}" value="${oi}"><label for="${esc(check.id)}-${oi}">${esc(o)}</label></div>`).join("\n")}
        </div>
        <button type="button" class="rs-check" data-for="${esc(check.id)}" data-correct="${check.correctChoice}">Check answer</button>
        <p class="rs-feedback" id="fb-${esc(check.id)}" role="status" aria-live="polite"></p>
        <p class="rs-rationale" id="rat-${esc(check.id)}" hidden>${esc(check.rationale)}</p>
      </fieldset>
    </section>`
    : "";

  const prev = index === 0 ? { href: "index.html", label: "Overview" } : { href: `topic-${TOPICS[index - 1].code}.html`, label: TOPICS[index - 1].topic };
  const scenarioNext = scenarioAfterTopic.get(topic.code);
  const nextPage = scenarioNext
    ? { href: `scenario-${scenarioNext.id}.html`, label: scenarioNext.title }
    : (index === TOPICS.length - 1
      ? { href: "final-exam.html", label: "Final examination" }
      : { href: `topic-${TOPICS[index + 1].code}.html`, label: TOPICS[index + 1].topic });

  fs.writeFileSync(path.join(OUT, `topic-${topic.code}.html`), page({
    title: topic.topic, heading: topic.topic,
    crumb: `<li><a href="index.html">Overview</a></li><li>${esc(topic.code)}</li>`,
    body: `    <p class="rs-progress" role="status">Topic ${index + 1} of ${TOPICS.length} · ${topic.subtotalMinutes} prescribed minutes</p>
    <div class="rs-progressbar"><div class="rs-progressfill" style="width:${Math.round(((index + 1) / TOPICS.length) * 100)}%"></div></div>
    <section aria-labelledby="unitHeading">
      <h2 id="unitHeading">${esc(unitTitle)}</h2>
${mdToHtml(unitBody, { demote: 3 })}
    </section>
${video}
    <section aria-labelledby="quizHeading">
      <h2 id="quizHeading">Topic quiz</h2>
      <p>Every question must be answered correctly before the next topic opens. An incorrect answer shows the reasoning and then serves a different, related question on the same rule.</p>
${quiz}
    </section>
${misconception}${optionalSection}`,
    prev, next: nextPage,
  }));
});

/* scenarios */
SCENARIOS.forEach((scenario, i) => {
  const tasks = scenario.tasks.map((task, ti) => {
    const referral = (scenario.referralTasks || []).includes(task.id);
    const note = referral
      ? `        <p class="rs-meta">Referral task: the defensible answer names the person to escalate to. It is graded on identifying the referral, never on supplying an opinion the license holder may not give.</p>`
      : "";
    if (task.type === "selection") {
      return `        <fieldset class="rs-question">
          <legend>Task ${ti + 1} · ${task.points} points</legend>
          <p id="task-${esc(task.id)}">${esc(task.prompt)}</p>
          <div role="radiogroup" aria-labelledby="task-${esc(task.id)}">
${task.choices.map((c, ci) => `            <div class="rs-choice"><input type="radio" id="${esc(task.id)}-${ci}" name="${esc(task.id)}" value="${ci}"><label for="${esc(task.id)}-${ci}">${esc(c)}</label></div>`).join("\n")}
          </div>
${note}
        </fieldset>`;
    }
    if (task.type === "computation") {
      return `        <div class="rs-question">
          <h3 id="task-${esc(task.id)}">Task ${ti + 1} · ${task.points} points</h3>
          <p>${esc(task.prompt)}</p>
          <label for="${esc(task.id)}">Your answer</label>
          <input type="text" inputmode="decimal" id="${esc(task.id)}" name="${esc(task.id)}" aria-describedby="task-${esc(task.id)}">
${note}
        </div>`;
    }
    return `        <div class="rs-question">
          <h3 id="task-${esc(task.id)}">Task ${ti + 1} · ${task.points} points</h3>
          <p>${esc(task.prompt)}</p>
          <label for="${esc(task.id)}">Your answer</label>
          <textarea id="${esc(task.id)}" name="${esc(task.id)}" rows="5" aria-describedby="rubric-${esc(task.id)}"></textarea>
          <p id="rubric-${esc(task.id)}" class="rs-meta">Graded on the elements identified, never on length. No minimum word or character count applies, and no answer has to reach a length before the explanation is shown.</p>
${note}
        </div>`;
  }).join("\n");

  const reflection = scenario.optionalReflection
    ? `    <section aria-labelledby="reflect" class="rs-optional">
      <h2 id="reflect">Optional reflection</h2>
      <p class="rs-optional-flag"><strong>Not required and never graded.</strong> Skipping it changes nothing: it carries no points, no completion requirement and no minimum length.</p>
      <p>${esc(scenario.optionalReflection.prompt)}</p>
      <label for="reflect-${esc(scenario.id)}">Your notes, if you want to write any</label>
      <textarea id="reflect-${esc(scenario.id)}" name="reflect-${esc(scenario.id)}" rows="4"></textarea>
    </section>`
    : "";

  const topicIndex = TOPICS.findIndex((t) => t.code === scenario.afterTopic);
  const nextTopic = TOPICS[topicIndex + 1];
  fs.writeFileSync(path.join(OUT, `scenario-${scenario.id}.html`), page({
    title: scenario.title, heading: scenario.title,
    crumb: `<li><a href="index.html">Overview</a></li><li>Scenario ${i + 1}</li>`,
    body: `    <p class="rs-progress" role="status">Unlocks after ${esc(scenario.placement.unlockRequires.join(", "))} · ${scenario.pointsToPass} of ${scenario.totalPoints} points to pass · ${scenario.minutes} minutes</p>
    <section aria-labelledby="ctx">
      <h2 id="ctx">Context</h2>
${mdToHtml(scenario.context, { demote: 3 })}
    </section>
    <section aria-labelledby="facts">
      <h2 id="facts">Facts</h2>
      <ul>
${scenario.facts.map((f) => `        <li>${esc(f)}</li>`).join("\n")}
      </ul>
    </section>
    <section aria-labelledby="tasks">
      <h2 id="tasks">Tasks</h2>
${tasks}
    </section>
${reflection}`,
    prev: { href: `topic-${scenario.afterTopic}.html`, label: `Topic ${scenario.afterTopic}` },
    next: nextTopic
      ? { href: `topic-${nextTopic.code}.html`, label: nextTopic.topic }
      : { href: "final-exam.html", label: "Final examination" },
  }));
});

/* final examination — PLACEHOLDER items, never the secure bank */
const placeholders = [
  { stem: "PLACEHOLDER ITEM 1. This is not a bank question. It exists so the examination screen can be tested for keyboard navigation, radio-group semantics and focus order.", choices: ["Placeholder choice A", "Placeholder choice B", "Placeholder choice C", "Placeholder choice D"] },
  { stem: "PLACEHOLDER ITEM 2. Secure items are never rendered into this surface; the markup here is identical to the markup the real examination would use.", choices: ["Placeholder choice A", "Placeholder choice B", "Placeholder choice C", "Placeholder choice D"] },
  { stem: "PLACEHOLDER ITEM 3. Accessibility is a property of the rendering, not of which question is asked.", choices: ["Placeholder choice A", "Placeholder choice B", "Placeholder choice C", "Placeholder choice D"] },
];
const versionA = VERSIONS[0];
fs.writeFileSync(path.join(OUT, "final-exam.html"), page({
  title: "Final examination", heading: "Final examination",
  crumb: `<li><a href="index.html">Overview</a></li><li>Final examination</li>`,
  body: `    <div class="review-banner" role="note"><strong>The examination is not administrable.</strong> ${esc(EXAM_READY.note)} No attempt can be served while the status is ${esc(EXAM_READY.status)}, blocked by ${esc(EXAM_READY.blockedBy)}. The questions below are PLACEHOLDERS, not items from the confidential bank, and exist only so this screen can be tested for accessibility.</div>
    <p class="rs-progress" role="status">Question 1 of ${versionA.itemCount} · pass mark ${SCORING.passingScorePercent}% unweighted (${SCORING.minimumCorrectByVersion[versionA.id]} of ${versionA.itemCount}) · one attempt open</p>
    <div class="rs-progressbar"><div class="rs-progressfill" style="width:2%"></div></div>
    <section aria-labelledby="examHeading">
      <h2 id="examHeading">Questions</h2>
${placeholders.map((p, i) => `      <fieldset class="rs-question">
        <legend>Question ${i + 1} of ${versionA.itemCount}</legend>
        <p id="ex-${i}">${esc(p.stem)}</p>
        <div role="radiogroup" aria-labelledby="ex-${i}">
${p.choices.map((c, ci) => `          <div class="rs-choice"><input type="radio" id="ex-${i}-${ci}" name="ex-${i}" value="${ci}"><label for="ex-${i}-${ci}">${esc(c)}</label></div>`).join("\n")}
        </div>
      </fieldset>`).join("\n")}
    </section>`,
  prev: { href: `scenario-${SCENARIOS[SCENARIOS.length - 1].id}.html`, label: SCENARIOS[SCENARIOS.length - 1].title },
  next: null,
}));

/* stylesheet — contrast chosen to clear WCAG AA on normal text */
fs.writeFileSync(path.join(OUT, "reviewer.css"), `:root{--ink:#15202b;--muted:#4a5b6b;--bg:#ffffff;--panel:#f4f6f8;--line:#c3ccd5;--accent:#0b4f79;--warn:#7a3b00;--warnbg:#fff4e5;--optbg:#f0f5f9}
*{box-sizing:border-box}
body{margin:0;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg)}
.skip-link{position:absolute;left:-9999px}
.skip-link:focus{left:8px;top:8px;z-index:10;background:var(--accent);color:#fff;padding:10px 14px;border-radius:4px}
a{color:var(--accent)}
a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #0b4f79;outline-offset:2px}
.rs-header{border-bottom:1px solid var(--line);padding:12px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}
.rs-brand{margin:0}
.rs-brand span{color:var(--muted)}
.rs-nav{list-style:none;display:flex;gap:16px;margin:0;padding:0;flex-wrap:wrap}
.rs-main{max-width:74ch;margin:0 auto;padding:20px}
.review-banner{background:var(--warnbg);border:1px solid #d9a066;color:var(--warn);padding:12px 14px;border-radius:6px;margin-bottom:20px}
.rs-crumb{list-style:none;display:flex;gap:8px;padding:0;margin:0 0 8px;color:var(--muted);font-size:.9rem}
.rs-crumb li+li::before{content:"/ ";margin-right:6px}
h1{font-size:1.7rem;line-height:1.25}
h2{font-size:1.3rem;margin-top:2rem}
h3{font-size:1.1rem}
.rs-meta{color:var(--muted);font-size:.9rem}
.rs-facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;background:var(--panel);padding:14px;border-radius:6px}
.rs-facts dt{font-weight:600}
.rs-facts dd{margin:0}
.rs-topics{padding-left:1.4em}
.rs-progressbar{background:var(--panel);border:1px solid var(--line);border-radius:99px;height:10px;overflow:hidden}
.rs-progressfill{background:var(--accent);height:100%}
.rs-optional{background:var(--optbg);border:1px dashed var(--line);border-radius:6px;padding:14px;margin-top:2rem}
.rs-optional-flag{margin-top:0}
.rs-question{border:1px solid var(--line);border-radius:6px;padding:14px;margin:18px 0}
.rs-question legend{font-weight:600;padding:0 6px}
.rs-choice{display:flex;gap:10px;align-items:flex-start;margin:8px 0}
.rs-choice input{margin-top:.35em;width:18px;height:18px}
.rs-choice label{flex:1}
.rs-check{background:var(--accent);color:#fff;border:0;border-radius:4px;padding:9px 16px;font-size:1rem;cursor:pointer;min-height:44px}
.rs-feedback:empty{display:none}
.rs-feedback{font-weight:600;margin-top:10px}
.rs-rationale{background:var(--panel);border-left:4px solid var(--accent);padding:10px 12px;margin-top:8px}
label{display:block;font-weight:600;margin-top:10px}
input[type=text],textarea{width:100%;font:inherit;padding:9px;border:1px solid var(--line);border-radius:4px;min-height:44px}
blockquote{border-left:4px solid var(--line);margin:0;padding-left:14px;color:var(--muted)}
.rs-pager{display:flex;justify-content:space-between;gap:12px;margin-top:32px;border-top:1px solid var(--line);padding-top:16px;flex-wrap:wrap}
.rs-footer{border-top:1px solid var(--line);padding:16px 20px;color:var(--muted);font-size:.9rem}
@media (max-width:640px){.rs-main{padding:14px}h1{font-size:1.4rem}.rs-facts{grid-template-columns:1fr}}
`);

/* behaviour: check answer → announce result, reveal the explanation. The explanation is revealed on
   either outcome and without any typed input, because a student who answered should be told why. */
fs.writeFileSync(path.join(OUT, "reviewer.js"), `document.addEventListener("click", (event) => {
  const button = event.target.closest(".rs-check");
  if (!button) return;
  const itemId = button.dataset.for;
  const correctIndex = Number(button.dataset.correct);
  const chosen = document.querySelector('input[name="' + itemId + '"]:checked');
  const feedback = document.getElementById("fb-" + itemId);
  const rationale = document.getElementById("rat-" + itemId);
  if (!chosen) {
    feedback.textContent = "Select an answer before checking.";
    return;
  }
  if (Number(chosen.value) === correctIndex) {
    feedback.textContent = "Correct. The next question is available.";
  } else {
    feedback.textContent = "Not correct. Read the explanation below; a different related question follows.";
  }
  rationale.hidden = false;
});
`);

const written = fs.readdirSync(OUT).sort();
console.log("TX Law of Agency — reviewer surface\n");
console.log(`  pages written ........... ${written.filter((f) => f.endsWith(".html")).length}`);
console.log(`  topics .................. ${TOPICS.length}`);
console.log(`  scenarios ............... ${SCENARIOS.length}`);
console.log(`  misconception checks .... ${MISCONCEPTION_CHECKS.length}`);
console.log(`  examination items rendered  0 (placeholders only — the bank is confidential)`);
console.log(`  output .................. ${path.relative(root, OUT)}`);
