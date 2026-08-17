const directory = document.querySelector("#stateDirectory");
const summary = document.querySelector("#directorySummary");
const search = document.querySelector("#stateSearch");
const statusFilter = document.querySelector("#statusFilter");

let registry = [];

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function stateHref(state) {
  const slug = state.state_name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
  return `real-estate/${slug}/`;
}

function cardAction(state) {
  if (state.public_status === "Approved") return "View courses";
  if (["In Research", "In Development", "Submitted", "Pending Approval"].includes(state.public_status)) return "View requirements";
  return "Not yet available";
}

function render() {
  const query = search.value.trim().toLowerCase();
  const status = statusFilter.value;
  const filtered = registry.filter((state) => {
    const matchesQuery = !query || state.state_name.toLowerCase().includes(query) || state.state_code.toLowerCase().includes(query);
    const matchesStatus = status === "all" || state.public_status === status;
    return matchesQuery && matchesStatus;
  });

  summary.textContent = `${filtered.length} of ${registry.length} jurisdictions shown`;
  directory.innerHTML = filtered.map((state) => {
    const activeCodes = ["VA", "ME", "WI", "MO", "OK", "AZ", "WA", "PA", "NC", "CO", "CA"];
    const active = activeCodes.includes(state.state_code);
    const programs = {
      VA: "Real Estate Salesperson Pre-License · 60 hours",
      ME: "Real Estate Sales Agent Pre-License · 55 hours",
      WI: "Real Estate Salesperson Pre-License · 72 hours",
      MO: "Pre-Exam 48h + Practice 24h · separate approvals",
      OK: "Basic Pre-License · 90 hours",
      AZ: "Salesperson 90h + Contract Writing 6h · separate approvals",
      WA: "Fundamentals 60h + Practices 30h · separate approvals",
      PA: "Fundamentals 30h + Practice 45h · separate approvals",
      NC: "Broker Prelicensing · 75 hours",
      CO: "Six qualifying courses · 168 hours total",
      CA: "Principles + Practice + Mortgage Lending · three 45h approvals",
    };
    const program = programs[state.state_code] || "Coming Soon / Not Yet Available";
    return `<article class="state-directory-card" id="state-${state.state_code.toLowerCase()}">
      <div class="state-card-top"><span>${escapeHtml(state.state_code)}</span><strong class="directory-status ${active ? "in-development" : ""}">${escapeHtml(state.public_status)}</strong></div>
      <h3>${escapeHtml(state.state_name)}</h3>
      <p class="regulator-name">${escapeHtml(state.regulator_name)}</p>
      <p class="program-name">${escapeHtml(program)}</p>
      <a class="${active ? "" : "disabled-link"}" href="${stateHref(state)}" ${active ? "" : 'aria-disabled="true"'}>${cardAction(state)}${active ? " →" : ""}</a>
    </article>`;
  }).join("");
}

async function loadRegistry() {
  try {
    const response = await fetch("data/state-registry.json");
    if (!response.ok) throw new Error("Registry unavailable");
    registry = (await response.json()).states;
    render();
  } catch (error) {
    console.error(error);
    summary.textContent = "The state registry is temporarily unavailable.";
  }
}

search.addEventListener("input", render);
statusFilter.addEventListener("change", render);
loadRegistry();
