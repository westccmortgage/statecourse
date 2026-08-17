const search = document.querySelector("#requirementsSearch");
const status = document.querySelector("#requirementsStatus");
const online = document.querySelector("#requirementsOnline");
const rows = [...document.querySelectorAll("#requirementsRows tr")];
const summary = document.querySelector("#requirementsSummary");

function filterRows() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows) {
    const matchesSearch = !query || row.dataset.state.includes(query);
    const matchesStatus = status.value === "all" || row.dataset.status === status.value;
    const matchesOnline = online.value === "all" || row.dataset.online === online.value;
    const show = matchesSearch && matchesStatus && matchesOnline;
    row.hidden = !show;
    if (show) visible += 1;
  }
  summary.textContent = `${visible} of ${rows.length} jurisdictions shown`;
}

search?.addEventListener("input", filterRows);
status?.addEventListener("change", filterRows);
online?.addEventListener("change", filterRows);
