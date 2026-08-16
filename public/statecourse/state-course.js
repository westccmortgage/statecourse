const root = document.querySelector("[data-course-id]");
const courseId = root?.dataset.courseId;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function renderCourse(course) {
  document.querySelectorAll("[data-hours]").forEach((node) => { node.textContent = `${course.required_hours} hours`; });
  document.querySelectorAll("[data-course-title]").forEach((node) => { node.textContent = course.title; });
  document.querySelector("[data-regulator]").textContent = course.regulator;
  document.querySelector("[data-delivery]").textContent = course.delivery;
  document.querySelector("[data-module-count]").textContent = `${course.modules.length} modules`;
  document.querySelector("[data-module-list]").innerHTML = course.modules.map((module, index) => `
    <article class="framework-module">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div><p>${escapeHtml(module.id)}</p><h3>${escapeHtml(module.title)}</h3></div>
      <strong>${escapeHtml(module.hours)} ${module.hours === 1 ? "hour" : "hours"}</strong>
    </article>`).join("");
}

fetch("../../../../data/launch-course-frameworks.json")
  .then((response) => {
    if (!response.ok) throw new Error("course_framework_unavailable");
    return response.json();
  })
  .then((data) => {
    const course = data.courses.find((item) => item.course_id === courseId);
    if (!course) throw new Error("course_framework_missing");
    renderCourse(course);
  })
  .catch((error) => {
    console.error(error);
    const list = document.querySelector("[data-module-list]");
    if (list) list.innerHTML = '<p class="framework-error">The curriculum framework is temporarily unavailable.</p>';
  });
