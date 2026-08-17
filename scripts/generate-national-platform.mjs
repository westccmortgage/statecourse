import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);
const studentPortalUrl = "https://statecourse.com/student/sign-in/";

const dc = {
  state_name: "District of Columbia",
  state_code: "DC",
  regulator_name: "Regulator research pending",
  regulator_url: null,
  provider_status: "Not Started",
  public_status: "Coming Soon",
  prelicense_hours: null,
  allowed_delivery_methods: [],
  final_exam_rules: "Pending official-source research",
  proctoring_rules: "Pending official-source research",
  certificate_rules: "Pending official-source research",
  reporting_requirements: "Pending official-source research",
  notes: "Coming Soon / Not Yet Available. No regulatory claims or enrollment are enabled.",
};
const states = [...registry.states, ...(registry.states.some((state) => state.state_code === "DC") ? [] : [dc])].sort((a, b) => a.state_name.localeCompare(b.state_name));

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
const write = (relativePath, content) => {
  const target = path.join(publicRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
const relativeRoute = (prefix, route) => `${prefix}${String(route).replace(/^\//, "")}`;

function header(prefix, active = "") {
  const nav = [
    ["Get Licensed", "get-licensed/", "licensed"],
    ["Exam Prep", "exam-prep/", "exam"],
    ["Renew / CE", "continuing-education/", "renew"],
    ["State Requirements", "state-requirements/", "requirements"],
    ["Resources", "resources/", "resources"],
    ["Blog", "blog/", "blog"],
  ];
  const links = nav.map(([label, href, key]) => `<a href="${prefix}${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip-link" href="#main-content">Skip to main content</a><header class="national-header"><div class="header-shell"><a class="national-brand" href="${prefix}" aria-label="StateCourse home"><span class="brand-mark" aria-hidden="true">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><nav class="desktop-nav" aria-label="Primary navigation">${links}</nav><div class="header-actions"><a class="account-link" href="${studentPortalUrl}">My Courses</a><a class="state-button" href="${prefix}get-licensed/">Choose Your State</a></div><details class="mobile-menu"><summary aria-label="Open navigation">Menu</summary><nav>${links}<a href="${studentPortalUrl}">My Courses</a></nav></details></div></header>`;
}

function footer(prefix) {
  return `<footer class="national-footer"><div class="footer-shell"><div><a class="national-brand inverse" href="${prefix}"><span class="brand-mark">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><p>Real estate licensing, state by state.</p></div><nav aria-label="Footer navigation"><a href="${prefix}get-licensed/">Get Licensed</a><a href="${prefix}state-requirements/">State Requirements</a><a href="${prefix}courses/">Courses</a><a href="${prefix}resources/">Resources</a><a href="${studentPortalUrl}">My Courses</a></nav><p class="footer-disclosure">Programs shown as In Development are not approved enrollment offers and cannot award regulatory credit.</p></div></footer>`;
}

function document({ title, description, prefix = "../", active = "", body, scripts = "" }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="description" content="${esc(description)}"/><meta name="theme-color" content="#10283a"/><title>${esc(title)} | StateCourse</title><link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="${prefix}national.css"/></head><body>${header(prefix, active)}<main id="main-content">${body}</main>${footer(prefix)}${scripts}</body></html>`;
}

function pageHero(overline, title, lede, state = false) {
  return `<section class="${state ? "state-masthead" : "page-hero"}"><div class="page-intro"><p class="overline">${esc(overline)}</p><h1>${esc(title)}</h1><p>${esc(lede)}</p></div></section>`;
}

function finderForm() {
  return `<form class="licensing-finder" id="licensing-finder"><fieldset class="intent-tabs"><legend>What do you need to do?</legend><label><input type="radio" name="intent" value="licensed" checked/><span><strong>Get Licensed</strong><small>I need pre-license education</small></span></label><label><input type="radio" name="intent" value="exam"/><span><strong>Pass My Exam</strong><small>I need exam preparation</small></span></label><label><input type="radio" name="intent" value="renew"/><span><strong>Renew My License</strong><small>I need continuing education</small></span></label></fieldset><div class="finder-fields"><label><span>Start with your state</span><select id="homeStateSelect" required><option value="">Choose your state</option></select></label><label><span>Licensing goal</span><select id="homeGoalSelect"><option value="first-license">First real estate license</option><option value="broker">Broker education</option><option value="requirements">Understand requirements</option></select></label><button type="submit">View My Licensing Path <span aria-hidden="true">→</span></button></div><p id="finderMessage" class="finder-message" aria-live="polite"></p></form>`;
}

const getLicensedBody = `${pageHero("Get Licensed", "Build your state licensing path.", "Start with your jurisdiction and license goal. StateCourse will show verified requirements, available education, examinations, application milestones, and the next action.")}<section class="page-body"><div style="max-width:820px;margin:auto">${finderForm()}</div><div class="content-grid" style="margin-top:55px"><article class="content-card"><p class="overline">Step 1</p><h2>Choose your state</h2><p>Licensing titles, required education, regulators, exams, and application procedures are jurisdiction-specific.</p><a href="../state-requirements/">Compare requirements →</a></article><article class="content-card"><p class="overline">Step 2</p><h2>Review your path</h2><p>See education, examination, application, background-check, and renewal information before choosing a product.</p><a href="../courses/">View current programs →</a></article><article class="content-card"><p class="overline">Step 3</p><h2>Enroll only when approved</h2><p>Regulated course enrollment stays disabled until the exact approval record and required disclosures are active.</p><a href="${studentPortalUrl}">Returning student sign in →</a></article></div></section>`;
write("get-licensed/index.html", document({ title: "Get Licensed", description: "Build a state-specific real estate licensing path.", active: "licensed", body: getLicensedBody, scripts: '<script src="../national.js" defer></script>' }));

const requirementRows = states.map((state) => `<tr data-state="${esc(`${state.state_name} ${state.state_code}`.toLowerCase())}" data-status="${esc(state.public_status)}" data-online="${state.asynchronous_online_allowed === true ? "yes" : state.asynchronous_online_allowed === false ? "no" : "pending"}"><td><a href="../real-estate/${slugify(state.state_name)}/">${esc(state.state_name)}</a><br/><small>${esc(state.state_code)}</small></td><td>${esc(state.regulator_name)}</td><td>${state.prelicense_hours ?? '<span class="empty-value">Pending verification</span>'}</td><td>${state.asynchronous_online_allowed === true ? "Yes — subject to approval" : state.asynchronous_online_allowed === false ? "No" : '<span class="empty-value">Pending verification</span>'}</td><td>${esc(state.final_exam_rules ?? "Pending official-source research")}</td><td><span class="status-text${state.public_status === "Approved" ? " status-approved" : ""}">${esc(state.public_status)}</span></td><td>${state.regulator_url ? `<a href="${esc(state.regulator_url)}" target="_blank" rel="noopener">Official source ↗</a>` : '<span class="empty-value">Research pending</span>'}</td></tr>`).join("");
const requirementsBody = `${pageHero("National regulatory directory", "State requirements, compared carefully.", "Search 50 states and Washington, D.C. Requirements are published only after official-source review and remain separate from StateCourse product approval status.")}<section class="page-body"><div class="page-tools"><label>Search state<input id="requirementsSearch" type="search" placeholder="State name or code"/></label><label>Status<select id="requirementsStatus"><option value="all">All statuses</option>${registry.statuses.map((status) => `<option>${esc(status)}</option>`).join("")}</select></label><label>Online education<select id="requirementsOnline"><option value="all">All</option><option value="yes">Allowed / approval-based</option><option value="pending">Pending verification</option><option value="no">Not allowed</option></select></label></div><p class="summary-line" id="requirementsSummary">${states.length} jurisdictions shown</p><div class="table-wrap"><table class="requirements-table"><thead><tr><th>State</th><th>Regulator</th><th>Pre-license hours</th><th>Online education</th><th>Final examination</th><th>StateCourse status</th><th>Official source</th></tr></thead><tbody id="requirementsRows">${requirementRows}</tbody></table></div><div class="source-box"><h2>Regulatory data rule</h2><p>Official regulators, statutes, regulations, forms, and regulator guidance control this database. “In Development” describes StateCourse work only; it does not mean a course is approved or available for enrollment.</p></div></section>`;
write("state-requirements/index.html", document({ title: "State Requirements", description: "Compare real estate licensing requirements across 50 states and Washington, D.C.", active: "requirements", body: requirementsBody, scripts: '<script src="../state-requirements.js" defer></script>' }));

const courseCards = catalogCourses.map((course) => `<article class="content-card" data-state="${esc(course.state_id)}" data-type="${esc(course.program_type)}"><p class="overline">${esc(course.state_id)} · ${esc(course.approval_status)}</p><h2>${esc(course.course_title)}</h2><p>${esc(course.required_hours)} hours · ${esc(course.delivery_method)}</p><a href="${relativeRoute("../", course.route)}">Review course record →</a></article>`).join("");
const coursesBody = `${pageHero("National course catalog", "Regulated education, grouped by state.", "Every course has its own jurisdiction, version, instructor, approval record, delivery rules, examinations, disclosures, and enrollment gate.")}<section class="page-body"><p class="notice"><strong>Enrollment remains closed.</strong> Every listed qualifying-education product is currently in development and cannot award regulatory credit.</p><div class="content-grid" style="margin-top:34px">${courseCards}</div></section>`;
write("courses/index.html", document({ title: "Course Catalog", description: "StateCourse real estate licensing education catalog.", body: coursesBody }));

const simplePages = [
  ["continuing-education", "renew", "Renew / Continuing Education", "Stay licensed with the right state requirements.", "Renewal cycles, mandatory subjects, reporting, certificates, and approved offerings remain state-specific. No CE product will be represented as available until its separate approval is recorded.", [["Renewal cycle", "See your state deadline and education window."], ["Mandatory subjects", "Keep required topics distinct from elective education."], ["Permanent records", "Retrieve eligible completion certificates from your account."]]],
  ["resources", "resources", "Resources", "Practical licensing guidance before you purchase anything.", "Use state checklists, vocabulary, real estate math, financing guides, exam-day guidance, application steps, and regulator-linked updates.", [["State licensing checklists", "Understand education, examination, application, and background requirements."], ["Sample lessons", "Review StateCourse’s text-first digital textbook approach."], ["Real estate math", "Practice prorations, commissions, financing, valuation, and investment calculations."]]],
  ["blog", "blog", "StateCourse Journal", "Clear reporting on licensing and professional practice.", "Editorial state guides, exam preparation, regulatory updates, continuing education, finance, and career topics—each with an author, review date, and official sources when regulatory facts are discussed.", [["State Guides", "How to understand the licensing path in a specific jurisdiction."], ["Exam Preparation", "What candidates should expect and how to study responsibly."], ["Regulatory Updates", "Material changes reviewed against official regulator sources."]]],
];
for (const [route, active, overline, title, lede, cards] of simplePages) {
  const body = `${pageHero(overline, title, lede)}<section class="page-body"><div class="content-grid">${cards.map(([heading, copy], index) => `<article class="content-card"><p class="overline">${String(index + 1).padStart(2, "0")}</p><h2>${esc(heading)}</h2><p>${esc(copy)}</p><a href="../state-requirements/">Start with your state →</a></article>`).join("")}</div><div class="source-box"><h2>Development status</h2><p>This national service area is being built inside the shared StateCourse platform. Regulated products remain unavailable until their individual approvals are recorded.</p></div></section>`;
  write(`${route}/index.html`, document({ title: overline, description: lede, active, body }));
}

const examPrepBody = `${pageHero("California salesperson examination", "Free California practice exam.", "Answer 30 original StateCourse questions mapped to the California DRE salesperson examination domains. Receive an immediate score, domain-level results, explanations, and a focused study plan.")}<section class="page-body exam-prep-shell"><div class="exam-disclosure"><strong>Practice only.</strong><span>These are original StateCourse study questions, not California DRE examination questions. This diagnostic does not award course credit and never affects regulated LMS progress.</span></div><section class="exam-start" id="examStart"><div><p class="overline">California diagnostic</p><h2>30 questions · seven official DRE content domains</h2><p>The actual California salesperson examination contains 150 multiple-choice questions, allows three hours, and requires at least 70% correct. This shorter diagnostic uses the same published subject categories and approximate weighting.</p><dl class="exam-facts"><div><dt>Questions</dt><dd>30</dd></div><div><dt>Suggested pace</dt><dd>36 minutes</dd></div><div><dt>Target score</dt><dd>70%</dd></div></dl></div><button id="startPracticeExam" type="button">Start free practice exam <span aria-hidden="true">→</span></button></section><section id="practiceExam" class="practice-exam" hidden aria-live="polite"><header class="exam-toolbar"><div><p class="overline">Free California practice</p><h2 id="examProgressHeading">Question 1 of 30</h2></div><div class="exam-meter" aria-hidden="true"><span id="examProgressBar"></span></div><button id="exitPracticeExam" type="button">Exit diagnostic</button></header><article id="questionCard" class="question-card"></article><nav class="exam-navigation" aria-label="Practice examination navigation"><button id="previousPracticeQuestion" type="button">← Previous</button><button id="nextPracticeQuestion" type="button">Next →</button></nav></section><section id="examResults" class="exam-results" hidden tabindex="-1"></section><div class="source-box"><h2>Official basis</h2><p>Domain names and approximate weighting follow the California DRE salesperson examination content outline. Actual examination questions are confidential and are not reproduced here.</p><p><a href="https://www.dre.ca.gov/examinees/SalesExamContent.html" target="_blank" rel="noopener">California DRE salesperson examination content ↗</a> · <a href="https://www.dre.ca.gov/Examinees/TakingExam.html" target="_blank" rel="noopener">Official examination format and passing score ↗</a></p></div></section>`;
write("exam-prep/index.html", document({ title: "California Free Practice Exam", description: "Free 30-question California real estate salesperson practice diagnostic with explanations and domain results.", active: "exam", body: examPrepBody, scripts: '<script src="../california-practice-exam.js" defer></script>' }));

write("my-statecourse/index.html", document({ title: "My StateCourse", description: "Return to your StateCourse licensing path and courses.", body: `${pageHero("Returning student", "Continue where you left off.", "Sign in to view active courses, progress, assessments, instructor support, payments, and certificates tied to your exact course version.")}<section class="page-body"><div class="content-grid"><article class="content-card"><p class="overline">My Licensing Path</p><h2>See the next required action</h2><p>Your education, exam preparation, application milestones, and renewal path remain organized in one account.</p><a href="${studentPortalUrl}">Student sign in →</a></article><article class="content-card"><p class="overline">My Courses</p><h2>Return to active education</h2><p>Continue only the courses connected to your verified enrollment record.</p><a href="${studentPortalUrl}">Open course dashboard →</a></article><article class="content-card"><p class="overline">Records</p><h2>Preserve completed education</h2><p>Eligible certificates always point to the exact approved course and version completed.</p><a href="${studentPortalUrl}">View my records →</a></article></div></section>` }));

const genericPath = [
  ["Verify the entry license", "Confirm the license title and eligibility rules with the state regulator."],
  ["Complete required education", "Use only education accepted under the jurisdiction’s current rules."],
  ["Complete application requirements", "Follow the regulator’s application, identity, background, and fee instructions."],
  ["Pass the licensing examination", "Use the state’s official exam provider and current candidate information."],
  ["Maintain the license", "Track renewal dates, continuing education, and certificate/reporting requirements."],
];

for (const state of states) {
  const prefix = "../../../";
  const stateCourses = catalogCourses.filter((course) => course.state_id === state.state_code);
  const courseRows = stateCourses.length ? stateCourses.map((course) => `<article class="course-row"><div><h3>${esc(course.course_title)}</h3><p>${esc(course.required_hours)} hours · ${esc(course.delivery_method)}</p></div><span>${esc(course.approval_status)}</span><a href="${relativeRoute(prefix, course.route)}">Review record →</a></article>`).join("") : `<p class="notice">StateCourse education is not yet available in this jurisdiction. The licensing guide and official-source research will remain available as development continues.</p>`;
  const official = state.regulator_url ? `<a href="${esc(state.regulator_url)}" target="_blank" rel="noopener">Open the regulator’s official website ↗</a>` : "Official regulator identification and source review are pending.";
  const body = `${pageHero(`${state.state_code} · ${state.public_status}`, `${state.state_name} Real Estate Licensing`, `Regulator: ${state.regulator_name}. Review the state path, current education research, and StateCourse availability before taking the next step.`, true)}<section class="page-body"><div class="state-summary"><aside class="state-record"><p class="overline">Jurisdiction record</p><dl><div><dt>Entry education</dt><dd>${state.prelicense_hours ? `${esc(state.prelicense_hours)} hours` : "Pending verification"}</dd></div><div><dt>Online delivery</dt><dd>${state.asynchronous_online_allowed === true ? "Allowed subject to approval" : state.asynchronous_online_allowed === false ? "Not allowed" : "Pending verification"}</dd></div><div><dt>StateCourse status</dt><dd>${esc(state.public_status)}</dd></div><div><dt>Course approval</dt><dd>${stateCourses.length ? "Not yet approved" : "No course record"}</dd></div><div><dt>Enrollment</dt><dd>Closed</dd></div></dl></aside><div><p class="overline">Your licensing path</p><ol class="license-path">${genericPath.map(([heading, copy]) => `<li><h3>${esc(heading)}</h3><p>${esc(copy)}</p></li>`).join("")}</ol></div></div><section class="course-list"><p class="overline">StateCourse programs</p><h2>${stateCourses.length ? `Programs currently in development for ${esc(state.state_name)}.` : "No approved StateCourse program yet."}</h2>${courseRows}</section><div class="source-box"><h2>Official source and verification</h2><p>${official}<br/>Last internal regulatory review: ${esc(registry.last_regulatory_review)}. StateCourse status is independent from regulator approval.</p></div></section>`;
  write(`real-estate/${slugify(state.state_name)}/index.html`, document({ title: `${state.state_name} Real Estate Licensing`, description: `${state.state_name} real estate licensing requirements and StateCourse program status.`, prefix, body }));
}

console.log(`Generated national platform: ${states.length} jurisdiction hubs, ${catalogCourses.length} course records, and core service routes.`);
