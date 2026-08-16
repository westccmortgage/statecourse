const curriculumFiles = [
  "content/curriculum/hours-01-15.md",
  "content/curriculum/hours-16-30.md",
  "content/curriculum/hours-31-45.md",
  "content/curriculum/hours-46-60.md",
];

const state = {
  hours: [],
  selected: 1,
  reviewed: new Set(),
  query: "",
};

const hourList = document.querySelector("#hourList");
const lessonView = document.querySelector("#lessonView");
const courseSearch = document.querySelector("#courseSearch");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const dayTrack = document.querySelector("#dayTrack");

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1 ↗</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function formatMarkdown(value = "") {
  const cleaned = value.trim().replace(/^---$/gm, "");
  if (!cleaned) return "<p>Content is being finalized for this section.</p>";

  return cleaned
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return "";

      if (lines.every((line) => line.startsWith("- "))) {
        return `<ul>${lines
          .map((line) => `<li>${inlineMarkdown(line.slice(2))}</li>`)
          .join("")}</ul>`;
      }

      return `<p>${lines.map(inlineMarkdown).join("<br />")}</p>`;
    })
    .join("");
}

function getSection(chunk, title) {
  const marker = `### ${title}`;
  const start = chunk.indexOf(marker);
  if (start === -1) return "";
  const contentStart = start + marker.length;
  const remainder = chunk.slice(contentStart);
  const nextHeading = remainder.search(/\n###\s/);
  return (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim();
}

function parseHours(markdown) {
  const pattern = /^## Hour\s+(\d{2})\s+—\s+(.+)$/gm;
  const matches = [...markdown.matchAll(pattern)];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    const chunk = markdown.slice(start, end);
    const mapping = chunk.match(/\*\*Required subject mapping:\*\*\s*(.+)/)?.[1]?.trim() ?? "Course integration";

    return {
      number: Number(match[1]),
      title: match[2].trim(),
      mapping,
      objectives: getSection(chunk, "Learning objectives"),
      content: getSection(chunk, "Instructional content"),
      sequence: getSection(chunk, "50-minute instructional sequence"),
      check: getSection(chunk, "Scored engagement check"),
      remediation: getSection(chunk, "Remediation"),
      source: getSection(chunk, "Instructor source note"),
      searchText: chunk.toLowerCase(),
    };
  });
}

function loadReviewed() {
  try {
    const saved = JSON.parse(localStorage.getItem("statecourse-previewed-hours") || "[]");
    state.reviewed = new Set(saved.filter((value) => Number.isInteger(value)));
  } catch {
    state.reviewed = new Set();
  }
}

function saveReviewed() {
  localStorage.setItem("statecourse-previewed-hours", JSON.stringify([...state.reviewed].sort((a, b) => a - b)));
}

function renderProgress() {
  const count = state.reviewed.size;
  progressText.textContent = `${count} / 60`;
  progressBar.style.width = `${(count / 60) * 100}%`;
}

function topicCodes(mapping) {
  const codes = mapping.match(/T\d{2}/g) ?? [];
  return [...new Set(codes)];
}

function renderDays() {
  dayTrack.innerHTML = Array.from({ length: 15 }, (_, index) => {
    const first = index * 4 + 1;
    const last = first + 3;
    return `
      <button class="day-button" type="button" data-day-hour="${first}">
        <span>Day ${String(index + 1).padStart(2, "0")}</span>
        <strong>${String(first).padStart(2, "0")}–${String(last).padStart(2, "0")}</strong>
      </button>`;
  }).join("");
}

function renderHourList() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.hours.filter((hour) =>
    !query || hour.title.toLowerCase().includes(query) || hour.mapping.toLowerCase().includes(query) || hour.searchText.includes(query)
  );

  if (!filtered.length) {
    hourList.innerHTML = '<div class="empty-list">No course hours match this search.</div>';
    return;
  }

  hourList.innerHTML = filtered.map((hour) => {
    const isActive = hour.number === state.selected;
    const isReviewed = state.reviewed.has(hour.number);
    return `
      <button
        class="hour-item${isActive ? " active" : ""}${isReviewed ? " reviewed" : ""}"
        type="button"
        data-hour="${hour.number}"
        aria-current="${isActive ? "true" : "false"}"
      >
        <span class="hour-number">${String(hour.number).padStart(2, "0")}</span>
        <span class="hour-name">
          ${escapeHtml(hour.title)}
          <span class="hour-topic">${escapeHtml(topicCodes(hour.mapping).join(" · ") || "Integrated")}</span>
        </span>
        <span class="review-dot" aria-label="${isReviewed ? "Previewed" : "Not previewed"}"></span>
      </button>`;
  }).join("");
}

function sectionTemplate(index, title, content, className = "") {
  if (!content) return "";
  return `
    <section class="lesson-section ${className}">
      <h4><span class="section-index">${String(index).padStart(2, "0")}</span>${title}</h4>
      ${formatMarkdown(content)}
    </section>`;
}

function renderLesson() {
  const hour = state.hours.find((item) => item.number === state.selected);
  if (!hour) return;

  const codes = topicCodes(hour.mapping);
  const reviewed = state.reviewed.has(hour.number);

  lessonView.innerHTML = `
    <div class="lesson-topline">
      <span class="lesson-hour">Virginia course · Hour ${String(hour.number).padStart(2, "0")} of 60</span>
      <button class="review-button${reviewed ? " active" : ""}" type="button" id="reviewButton">
        ${reviewed ? "Previewed" : "Mark as previewed"}
      </button>
    </div>
    <h3 class="lesson-title">${escapeHtml(hour.title)}</h3>
    <div class="topic-row">
      ${codes.map((code) => `<span class="topic-badge">${escapeHtml(code)}</span>`).join("")}
      <span class="topic-badge">50 instructional minutes</span>
    </div>
    <div class="lesson-divider"></div>
    ${sectionTemplate(1, "Learning objectives", hour.objectives)}
    ${sectionTemplate(2, "Instructional content", hour.content)}
    ${sectionTemplate(3, "50-minute sequence", hour.sequence, "sequence")}
    ${sectionTemplate(4, "Scored engagement check", hour.check, "check")}
    ${sectionTemplate(5, "Remediation", hour.remediation, "remediation")}
    ${sectionTemplate(6, "Official source note", hour.source, "source-note")}
    <nav class="lesson-nav" aria-label="Lesson navigation">
      <button type="button" data-step="-1" ${hour.number === 1 ? "disabled" : ""}>← Previous hour</button>
      <button type="button" data-step="1" ${hour.number === 60 ? "disabled" : ""}>Next hour →</button>
    </nav>
    <p class="preview-disclaimer">
      Device-local preview tracking is not instructional time, enrollment, completion, or pre-license credit.
    </p>`;

  lessonView.scrollTop = 0;

  document.querySelector("#reviewButton")?.addEventListener("click", () => {
    if (state.reviewed.has(hour.number)) state.reviewed.delete(hour.number);
    else state.reviewed.add(hour.number);
    saveReviewed();
    renderProgress();
    renderHourList();
    renderLesson();
  });

  lessonView.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => selectHour(hour.number + Number(button.dataset.step)));
  });
}

function selectHour(number, shouldScroll = false) {
  if (!state.hours.some((hour) => hour.number === number)) return;
  state.selected = number;
  localStorage.setItem("statecourse-last-hour", String(number));
  history.replaceState(null, "", `#hour-${String(number).padStart(2, "0")}`);
  renderHourList();
  renderLesson();

  const active = hourList.querySelector(".hour-item.active");
  active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (shouldScroll) document.querySelector("#curriculum")?.scrollIntoView({ behavior: "smooth" });
}

async function loadCourse() {
  try {
    loadReviewed();
    renderDays();

    const responses = await Promise.all(curriculumFiles.map((path) => fetch(path)));
    if (responses.some((response) => !response.ok)) throw new Error("Curriculum file unavailable");
    const documents = await Promise.all(responses.map((response) => response.text()));
    state.hours = documents.flatMap(parseHours).sort((a, b) => a.number - b.number);

    if (state.hours.length !== 60) throw new Error(`Expected 60 hours; loaded ${state.hours.length}`);

    const hashHour = Number(location.hash.match(/hour-(\d{1,2})/)?.[1]);
    const savedHour = Number(localStorage.getItem("statecourse-last-hour"));
    state.selected = hashHour || savedHour || 1;
    if (state.selected < 1 || state.selected > 60) state.selected = 1;

    renderProgress();
    renderHourList();
    renderLesson();
  } catch (error) {
    console.error(error);
    hourList.innerHTML = '<div class="empty-list">Course index unavailable.</div>';
    lessonView.innerHTML = `
      <div class="load-error">
        <h3>The course preview could not load.</h3>
        <p>Please refresh this page. If the problem continues, the latest curriculum deployment may still be publishing.</p>
      </div>`;
  }
}

hourList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-hour]");
  if (button) selectHour(Number(button.dataset.hour));
});

courseSearch.addEventListener("input", () => {
  state.query = courseSearch.value;
  renderHourList();
});

dayTrack.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day-hour]");
  if (button) selectHour(Number(button.dataset.dayHour), true);
});

document.querySelectorAll("[data-open-hour]").forEach((link) => {
  link.addEventListener("click", () => {
    if (state.hours.length) selectHour(Number(link.dataset.openHour));
  });
});

loadCourse();
