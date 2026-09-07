/* Shared behaviour for the two national service areas — Exam Prep and Renew / CE.

   The homepage finder sends visitors here with ?state=XX when they pick "Pass My
   Exam" or "Renew My License". Both pages used to ignore that parameter completely
   and answer in the future tense, so a visitor who chose California arrived at a page
   with no California on it and three links back to where they came from.

   This script fills in the jurisdiction record for the selected state from the same
   state registry the requirements table reads. It states availability only for what
   the catalog actually contains; the availability sentence itself is rendered by the
   generator from the catalog, not decided here. */

const platformRoot = new URL("./", document.currentScript.src);
const page = document.querySelector("[data-service]");
const service = page?.dataset.service;
const stateSelect = document.querySelector("#serviceStateSelect");
const record = document.querySelector("#serviceRecord");
const recordTitle = document.querySelector("#serviceRecordTitle");
const links = document.querySelector("#serviceLinks");
const message = document.querySelector("#serviceMessage");

const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

/* Only fields whose value is verified in the registry appear. An unverified field is
   shown as pending rather than filled with a plausible-sounding requirement. */
const fieldSets = {
  exam: (state) => [
    ["Regulator", escapeHtml(state.regulator_name)],
    ["Required pre-license education", state.prelicense_hours ? `${escapeHtml(state.prelicense_hours)} hours before the licensing examination` : "Pending verification"],
    ["StateCourse free practice", practiceStates.has(state.state_code) ? "Free lesson and formative-practice preview" : "Coming soon"],
    ["StateCourse education status", escapeHtml(state.public_status)],
  ],
  renew: (state) => [
    ["Regulator", escapeHtml(state.regulator_name)],
    ["Renewal cycle and CE hours", "Not yet researched from official sources"],
    ["StateCourse continuing education", "Not offered"],
    ["StateCourse education status", escapeHtml(state.public_status)],
  ],
};

const followUp = {
  exam: "StateCourse practice uses formative lesson material, not protected course finals or licensing-exam questions. The licensing examination remains controlled by the regulator and its examination provider.",
  renew: "Renewal deadlines, mandatory subjects, and accepted continuing education are set by the regulator and are not yet recorded here for this jurisdiction. Use the regulator's current renewal instructions.",
};

let jurisdictions = [];
let practiceStates = new Set();

function renderState(stateCode) {
  const state = jurisdictions.find((entry) => entry.state_code === stateCode);
  if (!state) {
    if (recordTitle) recordTitle.textContent = "Jurisdiction record";
    if (record) record.innerHTML = `<div><dt>Selected state</dt><dd>None selected</dd></div>`;
    if (links) links.innerHTML = "";
    if (message) message.textContent = "";
    return;
  }
  if (recordTitle) recordTitle.textContent = `${state.state_name} record`;
  if (record) {
    record.innerHTML = fieldSets[service](state)
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`)
      .join("");
  }
  if (message) message.textContent = followUp[service];
  if (links) {
    const official = state.regulator_url
      ? `<a class="cta-button" href="${escapeHtml(state.regulator_url)}" target="_blank" rel="noopener">Open the ${escapeHtml(state.state_name)} regulator ↗</a>`
      : "";
    const practice = service === "exam" && practiceStates.has(state.state_code)
      ? `<a class="cta-button" href="${platformRoot.href}free-practice/?state=${encodeURIComponent(state.state_code)}">Start free ${escapeHtml(state.state_name)} practice →</a>`
      : "";
    links.innerHTML = `${practice}${official}<a class="cta-secondary" href="${platformRoot.href}real-estate/${slugify(state.state_name)}/">See the ${escapeHtml(state.state_name)} licensing path</a>`;
  }
}

function selectedFromUrl() {
  const requested = new URL(window.location.href).searchParams.get("state");
  return requested ? requested.toUpperCase() : "";
}

async function loadJurisdictions() {
  if (!stateSelect) return;
  try {
    const [registryResponse, practiceResponse] = await Promise.all([
      fetch(new URL("data/state-registry.json", platformRoot)),
      fetch(new URL("data/free-practice-catalog.json", platformRoot)),
    ]);
    if (!registryResponse.ok || !practiceResponse.ok) throw new Error("State registry unavailable");
    const { states } = await registryResponse.json();
    const practiceCatalog = await practiceResponse.json();
    practiceStates = new Set((practiceCatalog.samples || []).map((sample) => sample.state_code));
    jurisdictions = [...states].sort((a, b) => a.state_name.localeCompare(b.state_name));
    stateSelect.insertAdjacentHTML("beforeend", jurisdictions
      .map((state) => `<option value="${escapeHtml(state.state_code)}">${escapeHtml(state.state_name)}</option>`)
      .join(""));
    const requested = selectedFromUrl();
    if (requested && jurisdictions.some((state) => state.state_code === requested)) stateSelect.value = requested;
    renderState(stateSelect.value);
  } catch (error) {
    console.error(error);
    if (message) message.textContent = "State information is temporarily unavailable. Use State Requirements to compare jurisdictions.";
  }
}

stateSelect?.addEventListener("change", () => {
  renderState(stateSelect.value);
  const url = new URL(window.location.href);
  if (stateSelect.value) url.searchParams.set("state", stateSelect.value);
  else url.searchParams.delete("state");
  window.history.replaceState({}, "", url);
});

loadJurisdictions();
