import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveJurisdictionRecord, JURISDICTION_APPROVAL_LABELS } from "../config/jurisdiction-record.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public/statecourse");
const registry = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/state-registry.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicRoot, "data/course-catalog.json"), "utf8"));
const catalogCourses = catalog.categories.flatMap((category) => category.programs ?? []).flatMap((program) => program.courses ?? []);

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
// Six state course pages are hand-authored and tracked in git. They carry
// state-specific academic detail this generator does not model, and an earlier
// run silently replaced them with the generic template. The generator now
// refuses to overwrite them; delete the file first if a route is meant to
// return to generated output.
const handBuiltRoutes = new Set([
  "real-estate/virginia/pre-license/principles-and-practices/index.html",
  "real-estate/maine/pre-license/sales-agent/index.html",
  "real-estate/wisconsin/pre-license/salesperson/index.html",
  "real-estate/missouri/pre-license/salesperson-pre-exam/index.html",
  "real-estate/missouri/pre-license/real-estate-practice/index.html",
  "real-estate/oklahoma/pre-license/basic/index.html",
]);
const preserved = [];

const write = (relativePath, content) => {
  const target = path.join(publicRoot, relativePath);
  if (handBuiltRoutes.has(relativePath) && fs.existsSync(target)) {
    preserved.push(relativePath);
    return;
  }
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
  return `<a class="skip-link" href="#main-content">Skip to main content</a><header class="national-header"><div class="header-shell"><a class="national-brand" href="${prefix}" aria-label="StateCourse home"><span class="brand-mark" aria-hidden="true">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><nav class="desktop-nav" aria-label="Primary navigation">${links}</nav><div class="header-actions"><a class="account-link" href="${prefix}student/register/">Create Account</a><a class="account-link" href="${prefix}student/">My Courses</a><a class="state-button" href="${prefix}get-licensed/">Choose Your State</a></div><details class="mobile-menu"><summary aria-label="Open navigation">Menu</summary><nav>${links}<a href="${prefix}student/register/">Create Account</a><a href="${prefix}student/">My Courses</a></nav></details></div></header>`;
}

function footer(prefix) {
  return `<footer class="national-footer"><div class="footer-shell"><div><a class="national-brand inverse" href="${prefix}"><span class="brand-mark">SC</span><span><strong>StateCourse</strong><small>Professional Licensing Education</small></span></a><p>Real estate licensing, state by state.</p></div><nav aria-label="Footer navigation"><a href="${prefix}get-licensed/">Get Licensed</a><a href="${prefix}state-requirements/">State Requirements</a><a href="${prefix}courses/">Courses</a><a href="${prefix}resources/">Resources</a><a href="${prefix}student/">My Courses</a></nav><p class="footer-disclosure">Programs shown as In Development are not approved enrollment offers and cannot award regulatory credit.</p></div></footer>`;
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

const getLicensedBody = `${pageHero("Get Licensed", "Build your state licensing path.", "Start with your jurisdiction and license goal. StateCourse will show verified requirements, available education, examinations, application milestones, and the next action.")}<section class="page-body"><div style="max-width:820px;margin:auto">${finderForm()}</div><div class="content-grid" style="margin-top:55px"><article class="content-card"><p class="overline">Step 1</p><h2>Choose your state</h2><p>Licensing titles, required education, regulators, exams, and application procedures are jurisdiction-specific.</p><a href="../state-requirements/">Compare requirements →</a></article><article class="content-card"><p class="overline">Step 2</p><h2>Review your path</h2><p>See education, examination, application, background-check, and renewal information before choosing a product.</p><a href="../courses/">View current programs →</a></article><article class="content-card"><p class="overline">Step 3</p><h2>Enroll only when approved</h2><p>Regulated course enrollment stays disabled until the exact approval record and required disclosures are active.</p><a href="../student/">Returning student sign in →</a></article></div></section>`;
write("get-licensed/index.html", document({ title: "Get Licensed", description: "Build a state-specific real estate licensing path.", active: "licensed", body: getLicensedBody, scripts: '<script src="../national.js" defer></script>' }));

const requirementRows = states.map((state) => `<tr data-state="${esc(`${state.state_name} ${state.state_code}`.toLowerCase())}" data-status="${esc(state.public_status)}" data-online="${state.asynchronous_online_allowed === true ? "yes" : state.asynchronous_online_allowed === false ? "no" : "pending"}"><td><a href="../real-estate/${slugify(state.state_name)}/">${esc(state.state_name)}</a><br/><small>${esc(state.state_code)}</small></td><td>${esc(state.regulator_name)}</td><td>${state.prelicense_hours ?? '<span class="empty-value">Pending verification</span>'}</td><td>${state.asynchronous_online_allowed === true ? "Yes — subject to approval" : state.asynchronous_online_allowed === false ? "No" : '<span class="empty-value">Pending verification</span>'}</td><td>${esc(state.final_exam_rules ?? "Pending official-source research")}</td><td><span class="status-text${state.public_status === "Approved" ? " status-approved" : ""}">${esc(state.public_status)}</span></td><td>${state.regulator_url ? `<a href="${esc(state.regulator_url)}" target="_blank" rel="noopener">Official source ↗</a>` : '<span class="empty-value">Research pending</span>'}</td></tr>`).join("");
const requirementsBody = `${pageHero("National regulatory directory", "State requirements, compared carefully.", "Search 50 states and Washington, D.C. Requirements are published only after official-source review and remain separate from StateCourse product approval status.")}<section class="page-body"><div class="page-tools"><label>Search state<input id="requirementsSearch" type="search" placeholder="State name or code"/></label><label>Status<select id="requirementsStatus"><option value="all">All statuses</option>${registry.statuses.map((status) => `<option>${esc(status)}</option>`).join("")}</select></label><label>Online education<select id="requirementsOnline"><option value="all">All</option><option value="yes">Allowed / approval-based</option><option value="pending">Pending verification</option><option value="no">Not allowed</option></select></label></div><p class="summary-line" id="requirementsSummary">${states.length} jurisdictions shown</p><div class="table-wrap"><table class="requirements-table"><thead><tr><th>State</th><th>Regulator</th><th>Pre-license hours</th><th>Online education</th><th>Final examination</th><th>StateCourse status</th><th>Official source</th></tr></thead><tbody id="requirementsRows">${requirementRows}</tbody></table></div><div class="source-box"><h2>Regulatory data rule</h2><p>Official regulators, statutes, regulations, forms, and regulator guidance control this database. “In Development” describes StateCourse work only; it does not mean a course is approved or available for enrollment.</p></div></section>`;
write("state-requirements/index.html", document({ title: "State Requirements", description: "Compare real estate licensing requirements across 50 states and Washington, D.C.", active: "requirements", body: requirementsBody, scripts: '<script src="../state-requirements.js" defer></script>' }));

const courseCards = catalogCourses.map((course) => `<article class="content-card" data-state="${esc(course.state_id)}" data-type="${esc(course.program_type)}"><p class="overline">${esc(course.state_id)} · ${esc(course.approval_status)}</p><h2>${esc(course.course_title)}</h2><p>${esc(course.required_hours)} hours · ${esc(course.delivery_method)}</p><a href="${relativeRoute("../", course.route)}">Review course record →</a></article>`).join("");
const coursesBody = `${pageHero("National course catalog", "Regulated education, grouped by state.", "Every course has its own jurisdiction, version, instructor, approval record, delivery rules, examinations, disclosures, and enrollment gate.")}<section class="page-body"><p class="notice"><strong>Enrollment remains closed.</strong> Every listed qualifying-education product is currently in development and cannot award regulatory credit.</p><div class="content-grid" style="margin-top:34px">${courseCards}</div></section>`;
write("courses/index.html", document({ title: "Course Catalog", description: "StateCourse real estate licensing education catalog.", body: coursesBody }));

const simplePages = [
  ["resources", "resources", "Resources", "Practical licensing guidance before you purchase anything.", "Use state checklists, vocabulary, real estate math, financing guides, exam-day guidance, application steps, and regulator-linked updates.", [["State licensing checklists", "Understand education, examination, application, and background requirements."], ["Sample lessons", "Review StateCourse’s text-first digital textbook approach."], ["Real estate math", "Practice prorations, commissions, financing, valuation, and investment calculations."]]],
  ["blog", "blog", "StateCourse Journal", "Clear reporting on licensing and professional practice.", "Editorial state guides, exam preparation, regulatory updates, continuing education, finance, and career topics—each with an author, review date, and official sources when regulatory facts are discussed.", [["State Guides", "How to understand the licensing path in a specific jurisdiction."], ["Exam Preparation", "What candidates should expect and how to study responsibly."], ["Regulatory Updates", "Material changes reviewed against official regulator sources."]]],
];
for (const [route, active, overline, title, lede, cards] of simplePages) {
  const body = `${pageHero(overline, title, lede)}<section class="page-body"><div class="content-grid">${cards.map(([heading, copy], index) => `<article class="content-card"><p class="overline">${String(index + 1).padStart(2, "0")}</p><h2>${esc(heading)}</h2><p>${esc(copy)}</p><a href="../state-requirements/">Start with your state →</a></article>`).join("")}</div><div class="source-box"><h2>Development status</h2><p>This national service area is being built inside the shared StateCourse platform. Regulated products remain unavailable until their individual approvals are recorded.</p></div></section>`;
  write(`${route}/index.html`, document({ title: overline, description: lede, active, body }));
}

/* Exam Prep and Renew / CE are the two destinations the homepage finder sends people
   to with ?state=XX. They used to be generic template pages that ignored the state
   entirely and promised products in the future tense — "Try representative practice
   questions" linked to a page with no questions on it. Each now answers for the
   selected jurisdiction and states plainly what StateCourse offers there today.

   The availability sentence is derived from the catalog category, so it cannot drift
   from what actually exists, and it uses the same approval/enrollment coupling as the
   state pages: a course counts as available only with an approval number AND an
   enabled enrollment flag. */
const serviceAreas = [
  {
    route: "exam-prep",
    active: "exam",
    service: "exam",
    categoryId: "exam-prep",
    overline: "Exam Preparation",
    title: "Prepare for the examination—separately from regulatory credit.",
    lede: "Choose your jurisdiction to see who administers the license, what education must come first, and exactly what StateCourse offers there today.",
    product: "exam preparation",
    cards: [
      ["Education comes first", "Every jurisdiction requires its own pre-license education before the licensing examination. Confirm those hours before spending anything on preparation."],
      ["Regulator rules control the exam", "Examination content, scoring, scheduling, and retake rules come from the regulator and its examination provider, not from a course provider."],
      ["Course finals stay closed", "StateCourse final examinations are secure regulatory instruments. They are never published, previewed, or reused as practice material."],
    ],
    sourceHeading: "What this page does not claim",
    sourceCopy: "StateCourse does not publish examination questions, pass rates, or vendor procedures for any jurisdiction. Regulated course final examinations are administered only inside an approved course and are never furnished to students as study material.",
  },
  {
    route: "continuing-education",
    active: "renew",
    service: "renew",
    categoryId: "continuing-education",
    overline: "Renew / Continuing Education",
    title: "Stay licensed with the right state requirements.",
    lede: "Choose your jurisdiction to see its regulator, what StateCourse offers there today, and where the controlling renewal instructions live.",
    product: "continuing education",
    cards: [
      ["Renewal is jurisdiction-specific", "Cycles, deadlines, mandatory subjects, and accepted delivery methods differ by state and are set by the regulator."],
      ["Approval is per course", "A continuing-education course must carry its own approval record in its own jurisdiction. Approval of any other StateCourse program does not extend to it."],
      ["Records stay with your account", "Completion records and eligible certificates always point to the exact approved course and version completed."],
    ],
    sourceHeading: "What this page does not claim",
    sourceCopy: "StateCourse has not published verified renewal cycles, continuing-education hour requirements, or mandatory subjects for any jurisdiction. Nothing on this page substitutes for the regulator's current renewal instructions.",
  },
];

for (const area of serviceAreas) {
  const category = catalog.categories.find((entry) => entry.category_id === area.categoryId);
  const areaCourses = (category?.programs ?? []).flatMap((program) => program.courses ?? []);
  const areaRecord = deriveJurisdictionRecord(areaCourses);
  const availability = !areaRecord.hasCourseRecord
    ? `StateCourse does not offer ${area.product} in any jurisdiction yet. No course record exists, so nothing on this page is an offer, and no enrollment, credit, or certificate is available here.`
    : areaRecord.enrollmentOpen
      ? `StateCourse ${area.product} is open only where an approval record and an enabled enrollment are both recorded: ${areaRecord.approvedCourses.filter((entry) => entry.enrollmentEnabled).map((entry) => entry.courseTitle).join(", ")}.`
      : `StateCourse has ${areaCourses.length} ${area.product} course record${areaCourses.length === 1 ? "" : "s"} in development. Enrollment stays closed until each one's own approval is recorded.`;
  const cards = area.cards.map(([heading, copy], index) => `<article class="content-card"><p class="overline">${String(index + 1).padStart(2, "0")}</p><h2>${esc(heading)}</h2><p>${esc(copy)}</p></article>`).join("");
  const body = `${pageHero(area.overline, area.title, area.lede)}<section class="page-body" data-service="${esc(area.service)}">
    <div class="notice"><strong>Availability:</strong> ${esc(availability)}</div>
    <div class="page-tools"><label>Jurisdiction<select id="serviceStateSelect"><option value="">Choose your state</option></select></label></div>
    <div class="state-summary">
      <aside class="state-record"><p class="overline" id="serviceRecordTitle">Jurisdiction record</p><dl id="serviceRecord"><div><dt>Selected state</dt><dd>None selected</dd></div></dl></aside>
      <div>
        <p class="overline">Where the answer actually comes from</p>
        <p id="serviceMessage">Choose a jurisdiction above to see its regulator and the education already verified for it. Requirements are published here only after official-source review.</p>
        <div class="cta-actions" id="serviceLinks"></div>
        <p class="cta-note">Selecting a state here does not create an account, an enrollment, study time, or regulatory credit.</p>
      </div>
    </div>
    <div class="content-grid" style="margin-top:34px">${cards}</div>
    <div class="source-box"><h2>${esc(area.sourceHeading)}</h2><p>${esc(area.sourceCopy)} Compare every jurisdiction on the <a href="../state-requirements/">State Requirements</a> directory.</p></div>
  </section>`;
  write(`${area.route}/index.html`, document({ title: area.overline, description: area.lede, active: area.active, body, scripts: '<script src="../service-area.js" defer></script>' }));
}

write("my-statecourse/index.html", document({ title: "My StateCourse", description: "Return to your StateCourse licensing path and courses.", body: `${pageHero("Returning student", "Continue where you left off.", "Sign in to view active courses, progress, assessments, instructor support, payments, and certificates tied to your exact course version.")}<section class="page-body"><div class="content-grid"><article class="content-card"><p class="overline">My Licensing Path</p><h2>See the next required action</h2><p>Your education, exam preparation, application milestones, and renewal path remain organized in one account.</p><a href="../student/sign-in/">Student sign in →</a></article><article class="content-card"><p class="overline">My Courses</p><h2>Return to active education</h2><p>Continue only the courses connected to your verified enrollment record.</p><a href="../student/">Open course dashboard →</a></article><article class="content-card"><p class="overline">Records</p><h2>Preserve completed education</h2><p>Eligible certificates always point to the exact approved course and version completed.</p><a href="../student/">View my records →</a></article></div></section>` }));

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

  /* Both lines come from config/jurisdiction-record.mjs, which reads the catalog's
     approval and enrollment fields and holds the approval/enrollment safety coupling. */
  const jurisdiction = deriveJurisdictionRecord(stateCourses);
  const courseApprovalLine = jurisdiction.approvalState === "approved"
    ? jurisdiction.approvedCourses.map((entry) => `${esc(entry.courseTitle)}: ${esc(entry.approvalNumber)}`).join("<br/>")
    : JURISDICTION_APPROVAL_LABELS[jurisdiction.approvalState];
  const enrollmentLine = jurisdiction.enrollmentLine;
  const official = state.regulator_url ? `<a href="${esc(state.regulator_url)}" target="_blank" rel="noopener">Open the regulator’s official website ↗</a>` : "Official regulator identification and source review are pending.";
  const registerHref = `${prefix}student/register/?state=${encodeURIComponent(state.state_code)}`;
  const signInHref = `${prefix}student/sign-in/?return_to=${encodeURIComponent("/student/")}`;
  const ctaPanel = (heading, copy, primaryLabel, primaryHref, note) => `<section class="state-cta"><div><p class="overline">Next step</p><h2>${heading}</h2><p>${copy}</p><p class="cta-note">${note}</p></div><div class="cta-actions"><a class="cta-button" href="${primaryHref}">${primaryLabel}</a><a class="cta-secondary" href="${signInHref}">Already have an account? Sign in</a></div></section>`;
  const accountAction = stateCourses.length
    ? ctaPanel(
        `Create your free ${esc(state.state_name)} account.`,
        `Set up your student account to follow the ${esc(state.state_name)} course records, see the required disclosures, and be ready to enroll the day approval is recorded. Creating an account is free and takes about a minute.`,
        "Create Free Account →",
        registerHref,
        "Creating an account does not enroll you, start study time, award credit, or issue a certificate. Enrollment stays closed until the regulator approval record is entered.")
    : ctaPanel(
        `Track ${esc(state.state_name)} licensing with a free account.`,
        `StateCourse education is not yet available in ${esc(state.state_name)}. Create a free account to keep your licensing research in one place, or compare the verified requirements for this jurisdiction first.`,
        "Create Free Account →",
        registerHref,
        "Creating an account does not enroll you in any course and does not create regulatory credit. No StateCourse program is offered in this jurisdiction yet.");
  const closingAction = stateCourses.length
    ? ctaPanel(
        "Ready to continue?",
        `Your account is where course records, required disclosures, enrollment, progress, and certificates live. Create it now and you will not have to repeat any of this when ${esc(state.state_name)} approval is recorded.`,
        "Create Free Account →",
        registerHref,
        "Account creation and public previews are separate from enrollment, study time, course credit, and certificates.")
    : `<section class="state-cta"><div><p class="overline">Next step</p><h2>Compare requirements across states.</h2><p>See verified entry education, delivery rules, and regulator information for every jurisdiction while ${esc(state.state_name)} remains in development.</p><p class="cta-note">Requirement research is informational and is not a substitute for the regulator's official published requirements.</p></div><div class="cta-actions"><a class="cta-button" href="${prefix}state-requirements/">Compare State Requirements →</a><a class="cta-secondary" href="${registerHref}">Create a free account</a></div></section>`;
  const body = `${pageHero(`${state.state_code} · ${state.public_status}`, `${state.state_name} Real Estate Licensing`, `Regulator: ${state.regulator_name}. Review the state path, current education research, and StateCourse availability before taking the next step.`, true)}<section class="page-body">${accountAction}<div class="state-summary"><aside class="state-record"><p class="overline">Jurisdiction record</p><dl><div><dt>Entry education</dt><dd>${state.prelicense_hours ? `${esc(state.prelicense_hours)} hours` : "Pending verification"}</dd></div><div><dt>Online delivery</dt><dd>${state.asynchronous_online_allowed === true ? "Allowed subject to approval" : state.asynchronous_online_allowed === false ? "Not allowed" : "Pending verification"}</dd></div><div><dt>StateCourse status</dt><dd>${esc(state.public_status)}</dd></div><div><dt>Course approval</dt><dd>${courseApprovalLine}</dd></div><div><dt>Enrollment</dt><dd>${esc(enrollmentLine)}</dd></div></dl></aside><div><p class="overline">Your licensing path</p><ol class="license-path">${genericPath.map(([heading, copy]) => `<li><h3>${esc(heading)}</h3><p>${esc(copy)}</p></li>`).join("")}</ol></div></div><section class="course-list"><p class="overline">StateCourse programs</p><h2>${stateCourses.length ? `Programs currently in development for ${esc(state.state_name)}.` : "No approved StateCourse program yet."}</h2>${courseRows}</section><div class="source-box"><h2>Official source and verification</h2><p>${official}<br/>Last internal regulatory review: ${esc(registry.last_regulatory_review)}. StateCourse status is independent from regulator approval.</p></div>${closingAction}</section>`;
  write(`real-estate/${slugify(state.state_name)}/index.html`, document({ title: `${state.state_name} Real Estate Licensing`, description: `${state.state_name} real estate licensing requirements and StateCourse program status.`, prefix, body }));
}

for (const course of catalogCourses) {
  const routeParts = String(course.route).split("/").filter(Boolean);
  const prefix = "../".repeat(routeParts.length);
  const registerUrl = `${prefix}student/register/?course=${encodeURIComponent(course.course_id)}&return_to=${encodeURIComponent(`/enroll/?course=${course.course_id}`)}`;
  const preview = course.state_id === "CA" ? `<a href="${prefix}student/course-preview/?course=${encodeURIComponent(course.course_id)}">Preview Course Library →</a>` : "";
  const body = `${pageHero(`${course.state_id} · ${course.approval_status}`, course.course_title, `${course.required_hours}-hour ${course.program_type} course record.`, true)}
    <section class="page-body">
      <div class="notice"><strong>Regulatory status:</strong> This course is in development and cannot accept a credit-eligible enrollment until the regulator approval record is entered and enrollment is enabled.</div>
      <div class="state-summary">
        <aside class="state-record"><p class="overline">Course record</p><dl>
          <div><dt>Required hours</dt><dd>${esc(course.required_hours)}</dd></div>
          <div><dt>Delivery</dt><dd>${esc(course.delivery_method)}</dd></div>
          <div><dt>Course version</dt><dd>${esc(course.course_version)}</dd></div>
          <div><dt>Approval status</dt><dd>${esc(course.approval_status)}</dd></div>
          <div><dt>Approval number</dt><dd>${esc(course.approval_number || "Pending")}</dd></div>
        </dl></aside>
        <div><p class="overline">Enrollment path</p><ol class="license-path">
          <li><h3>Create or sign in to your StateCourse account</h3><p>Your student identity and course records remain separate from marketing and preview activity.</p></li>
          <li><h3>Review required disclosures</h3><p>The current state, course, refund, cancellation, and regulatory acknowledgment versions are recorded before checkout.</p></li>
          <li><h3>Complete Stripe Checkout</h3><p>Payment is processed by Stripe. Enrollment is created only after a verified paid webhook.</p></li>
          <li><h3>Open the purchased course</h3><p>Only the exact purchased course and version appear in the student cabinet.</p></li>
        </ol></div>
      </div>
      <div class="content-grid">
        <article class="content-card"><p class="overline">Student account</p><h2>Continue to enrollment</h2><p>Create your account first. Checkout remains independently controlled by course approval and environment settings.</p><a href="${registerUrl}">Create Account →</a></article>
        <article class="content-card"><p class="overline">Course review</p><h2>Inspect the course structure</h2><p>Review instructional organization without creating progress or regulatory credit.</p>${preview || `<a href="${prefix}courses/">Return to Course Catalog →</a>`}</article>
        <article class="content-card"><p class="overline">Returning student</p><h2>Resume from your cabinet</h2><p>Sign in to view purchased courses, progress, records, and certificates.</p><a href="${prefix}student/sign-in/?return_to=${encodeURIComponent("/student/")}">Student Sign In →</a></article>
      </div>
      <div class="source-box"><h2>Regulatory separation</h2><p>Account creation and public previews do not create enrollment, start study time, award course credit, or issue a certificate.</p></div>
    </section>`;
  write(`${routeParts.join("/")}/index.html`, document({ title: course.course_title, description: `${course.course_title} course record and enrollment path.`, prefix, body }));
}

const californiaCourses = catalogCourses.filter((course) => course.state_id === "CA");
if (californiaCourses.length) {
  const prefix = "../../../";
  const cards = californiaCourses.map((course) => `<article class="content-card"><p class="overline">45-hour correspondence course</p><h2>${esc(course.course_title)}</h2><p>${esc(course.approval_status)} · Course version ${esc(course.course_version)}</p><a href="${prefix}${String(course.route).replace(/^\//,"")}">Review Course Record →</a></article>`).join("");
  const body = `${pageHero("California salesperson education", "California 135-Hour Course Path", "Review the three separate 45-hour StateCourse correspondence-course records and continue through one account and enrollment system.", true)}
    <section class="page-body">
      <div class="notice"><strong>Approval gate:</strong> Each California course remains a separate regulatory record. Credit-eligible enrollment and live payment stay closed until its California DRE approval is recorded.</div>
      <div class="content-grid">${cards}</div>
      <div class="source-box"><h2>Continue with StateCourse</h2><p>Create your student account to continue through course selection, required disclosures, checkout, enrollment, the student cabinet, and permanent records. <a href="${prefix}student/register/?state=CA">Create Account →</a></p></div>
    </section>`;
  write("real-estate/california/pre-license/index.html", document({ title:"California Pre-License Courses", description:"California StateCourse 135-hour salesperson education path.", prefix, body }));
}

console.log(`Generated national platform: ${states.length} jurisdiction hubs, ${catalogCourses.length} course records, and core service routes.`);
if (preserved.length) console.log(`Preserved ${preserved.length} hand-authored course pages: ${preserved.join(", ")}`);
