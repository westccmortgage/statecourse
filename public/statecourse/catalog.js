const directory = document.querySelector("#stateDirectory");
const summary = document.querySelector("#directorySummary");
const search = document.querySelector("#stateSearch");
const statusFilter = document.querySelector("#statusFilter");

let registry = [];

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function stateHref(state) {
  if (state.state_code === "VA") return "real-estate/virginia/pre-license/principles-and-practices/";
  if (state.state_code === "ME") return "real-estate/maine/pre-license/sales-agent/";
  return `#state-${state.state_code.toLowerCase()}`;
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

  summary.textContent = `${filtered.length} of 50 states shown`;
  directory.innerHTML = filtered.map((state) => {
    const active = state.state_code === "VA" || state.state_code === "ME";
    const program = state.state_code === "VA" ? "Real Estate Salesperson Pre-License · 60 hours" : state.state_code === "ME" ? "Real Estate Sales Agent Pre-License · 55 hours" : "Programs not yet available";
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
