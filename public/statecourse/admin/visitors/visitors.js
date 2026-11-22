const message = document.querySelector("#visitorsMessage"), output = document.querySelector("#visitorsReport"), summary = document.querySelector("#visitorsSummary");
const SOURCE = { direct: "Typed the address or used a bookmark", search: "Search engines", social: "Social networks", ai: "AI assistants", campaign: "Tagged campaign links", referral: "Links on other sites" };

/* Built with DOM nodes only: nothing from the report is ever inserted as HTML. */
function table(headings, rows) {
  if (!rows.length) { const empty = document.createElement("p"); empty.className = "visitors-note"; empty.textContent = "Nothing recorded."; return empty; }
  const wrap = document.createElement("div"); wrap.className = "payment-table-wrap";
  const element = document.createElement("table"); element.className = "payment-table";
  const head = element.createTHead().insertRow();
  for (const heading of headings) { const cell = document.createElement("th"); cell.textContent = heading; head.append(cell); }
  const body = element.createTBody();
  for (const row of rows) { const line = body.insertRow(); for (const value of row) line.insertCell().textContent = value ?? "—"; }
  wrap.append(element); return wrap;
}
function section(title, ...children) {
  const element = document.createElement("section"); element.className = "visitors-section";
  const heading = document.createElement("h2"); heading.textContent = title; element.append(heading, ...children); return element;
}
function note(text) { const element = document.createElement("p"); element.className = "visitors-note"; element.textContent = text; return element; }
const place = row => [row.city, row.region, row.country].filter(Boolean).join(", ");
const time = value => new Date(value).toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });

function render(report) {
  const v = report.visits, a = report.accounts, figure = (name, value) => { document.querySelector(`[data-figure="${name}"]`).textContent = value ?? "—"; };
  summary.hidden = false; output.replaceChildren();
  figure("people", v.available ? v.people.visitors : null); figure("views", v.available ? v.people.views : null);
  figure("bots", v.available ? v.bots.clients : null); figure("suspect", v.available ? v.suspect.clients : null);
  figure("registrations", a.available ? a.registrations.length : null); figure("students", a.available ? a.activeStudents : null);
  if (!v.available) output.append(note("Visit counting is not available: the visit table is missing or could not be read. No visitor numbers are shown."));
  else output.append(
    section("Where people came from", table(["Source", "Visitors"], v.sources.map(row => [SOURCE[row.kind] || row.kind, row.visitors]))),
    section("Sites and campaigns", table(["Site or campaign", "Kind", "Visitors"], [...v.referrers.map(row => [row.name, SOURCE[row.kind] || row.kind, row.visitors]),
      ...v.campaigns.map(row => [[row.source, row.medium, row.campaign].filter(Boolean).join(" / "), "Campaign tag", row.visitors])])),
    section("Pages people opened", table(["Page", "Visitors", "Times opened"], v.pages.map(row => [row.path, row.visitors, row.views]))),
    section("Where they are", table(["Place", "Visitors"], v.places.map(row => [place(row), row.visitors]))),
    section("Devices", table(["Device", "Visitors"], v.devices.map(row => [row.device, row.visitors]))),
    section("Robots", table(["Robot", "Pages opened"], v.bot_names.map(row => [row.name, row.views])),
      note("A robot that imitates a browser well is counted as a person. A robot that neither runs the page script nor loads images is not seen at all.")),
    section("Cookie choice", table(["Choice", "Visitors"], [["Accepted", v.consent.accepted], ["Declined", v.consent.declined], ["No choice made", v.consent.unset]])),
    section("Visitors who accepted cookies", table(["First came from", "Visitors", "Opened the registration page", "Reached My StateCourse"],
      v.remembered.by_first_source.map(row => [SOURCE[row.source] || row.source, row.visitors, row.reached_register, row.reached_account])),
      note(`${v.remembered.new} new and ${v.remembered.returning} returning among visitors who accepted.`)));
  if (!a.available) output.append(note("Account activity could not be read."));
  else output.append(
    section("New accounts", table(["Name", "Email", "Registered"], a.registrations.map(row => [row.name, row.email, time(row.at)]))),
    section("Signed-in students", table(["Name", "Email", "Opened My StateCourse", "Opened a course"], a.students.map(row => [row.name, row.email, row.visits, row.coursesOpened]))));
}
async function load(day) {
  message.textContent = "Loading…";
  try {
    const response = await fetch(`/api/admin/site-report${day ? `?day=${encodeURIComponent(day)}` : ""}`, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "unauthorized" : "unavailable");
    const report = await response.json();
    document.querySelector("#visitorsDay").value = report.day;
    render(report); message.textContent = `Report for ${report.day}, Pacific time.`;
  } catch (error) {
    summary.hidden = true; output.replaceChildren();
    message.textContent = error.message === "unauthorized" ? "Sign in to the administration console first, then return to this page." : "The report could not be loaded. Try again shortly.";
  }
}
document.querySelector("#visitorsForm").addEventListener("submit", event => { event.preventDefault(); load(document.querySelector("#visitorsDay").value); });
document.querySelector("#visitorsToday").addEventListener("click", () => load("today"));
load("");
