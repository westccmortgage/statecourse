import { renderLessonMarkdown } from "./student/course/blocks/lesson-markdown.mjs";

const platformRoot = new URL("./", import.meta.url);
const stateSelect = document.querySelector("#practiceStateSelect");
const stateLabel = document.querySelector("#practiceStateLabel");
const courseTitle = document.querySelector("#practiceCourseTitle");
const message = document.querySelector("#practiceMessage");
const content = document.querySelector("#practiceContent");
const record = document.querySelector("#practiceRecord");
const statePath = document.querySelector("#practiceStatePath");
const sectionNav = document.querySelector("#practiceSectionNav");
const previous = document.querySelector("#practicePrevious");
const next = document.querySelector("#practiceNext");
const sectionLabel = document.querySelector("#practiceSectionLabel");

let samples = [];
let sections = [];
let sectionIndex = 0;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");

function splitSections(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const marks = [];
  lines.forEach((line, index) => { if (/^##\s+\S/.test(line)) marks.push(index); });
  if (!marks.length) return [{ title: "Sample lesson", body: markdown }];
  return marks.map((start, index) => ({
    title: lines[start].replace(/^##\s+/, "").trim(),
    body: lines.slice(start + 1, marks[index + 1] ?? lines.length).join("\n"),
  }));
}

function renderSection() {
  if (!sections.length) return;
  sectionIndex = Math.max(0, Math.min(sectionIndex, sections.length - 1));
  const section = sections[sectionIndex];
  content.innerHTML = `<h2>${escapeHtml(section.title)}</h2>${renderLessonMarkdown(section.body)}`;
  sectionLabel.textContent = `Section ${sectionIndex + 1} of ${sections.length}`;
  previous.disabled = sectionIndex === 0;
  next.disabled = sectionIndex === sections.length - 1;
  sectionNav.hidden = sections.length < 2;
}

async function openSample(stateCode) {
  const sample = samples.find((entry) => entry.state_code === stateCode);
  if (!sample) return;
  stateLabel.textContent = `${sample.state_name} · In development · Free practice`;
  courseTitle.textContent = sample.course_title;
  message.textContent = "Loading the practice lesson…";
  content.replaceChildren();
  sectionNav.hidden = true;
  record.innerHTML = `<div><dt>Access</dt><dd>Free · no account required</dd></div><div><dt>Course status</dt><dd>${escapeHtml(sample.public_status)}</dd></div><div><dt>Credit</dt><dd>None — practice only</dd></div>`;
  statePath.href = new URL(`real-estate/${slugify(sample.state_name)}/`, platformRoot).href;
  statePath.hidden = false;
  try {
    const response = await fetch(new URL(sample.content_url, platformRoot), { cache: "no-store", headers: { accept: "text/markdown" } });
    if (!response.ok) throw new Error("Practice lesson unavailable");
    sections = splitSections(await response.text());
    sectionIndex = 0;
    renderSection();
    message.textContent = "Work through the lesson at your own pace. Examples and checks are formative practice, not a licensing examination.";
    const url = new URL(window.location.href);
    url.searchParams.set("state", sample.state_code);
    history.replaceState({}, "", url);
    document.title = `${sample.state_name} Free Practice | StateCourse`;
  } catch (error) {
    console.error(error);
    message.textContent = "This practice lesson is temporarily unavailable. Please try again later.";
  }
}

async function load() {
  try {
    const response = await fetch(new URL("data/free-practice-catalog.json", platformRoot), { cache: "no-store" });
    if (!response.ok) throw new Error("Practice catalog unavailable");
    ({ samples } = await response.json());
    for (const sample of samples) {
      const option = document.createElement("option");
      option.value = sample.state_code;
      option.textContent = `${sample.state_name} — In development · Free practice`;
      stateSelect.append(option);
    }
    const requested = new URL(window.location.href).searchParams.get("state")?.toUpperCase();
    if (requested && samples.some((sample) => sample.state_code === requested)) {
      stateSelect.value = requested;
      await openSample(requested);
    }
  } catch (error) {
    console.error(error);
    stateSelect.disabled = true;
    message.textContent = "Free practice is temporarily unavailable. Please try again later.";
  }
}

stateSelect.addEventListener("change", () => {
  if (stateSelect.value) openSample(stateSelect.value);
});
previous.addEventListener("click", () => { sectionIndex -= 1; renderSection(); content.scrollIntoView({ behavior: "smooth", block: "start" }); });
next.addEventListener("click", () => { sectionIndex += 1; renderSection(); content.scrollIntoView({ behavior: "smooth", block: "start" }); });

load();
