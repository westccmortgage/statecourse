const stateSelect = document.querySelector("#stateSelect");
const courseSelect = document.querySelector("#courseSelect");
const viewButton = document.querySelector("#viewCourseButton");
const courseStatus = document.querySelector("#courseStatus");
const finder = document.querySelector("#course-finder");

let coursesByState = new Map();
let coursesById = new Map();
let statesByCode = new Map();

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function setCourseStatus(course) {
  if (!course) {
    viewButton.disabled = true;
    return;
  }

  const hours = course.required_hours ? `${course.required_hours} hours` : "Hours pending";
  const status = course.approval_status || "Status pending";
  courseStatus.textContent = `${hours} · ${status}. Enrollment is closed.`;
  viewButton.disabled = !course.route;
}

function populateCourses(stateCode) {
  const state = statesByCode.get(stateCode);
  const courses = coursesByState.get(stateCode) || [];

  courseSelect.replaceChildren();
  viewButton.disabled = true;

  if (!stateCode) {
    courseSelect.append(option("", "Choose a state first"));
    courseSelect.disabled = true;
    courseStatus.textContent = "Select a state to see its available course records.";
    return;
  }

  if (!courses.length) {
    courseSelect.append(option("", "No courses available yet"));
    courseSelect.disabled = true;
    courseStatus.textContent = `Courses for ${state?.state_name || stateCode} are not yet available.`;
    return;
  }

  courseSelect.disabled = false;
  courseSelect.append(option("", courses.length === 1 ? "Choose this course" : `Choose one of ${courses.length} courses`));

  for (const course of courses) {
    const hours = course.required_hours ? ` · ${course.required_hours} hours` : "";
    courseSelect.append(option(course.course_id, course.course_title + hours));
  }

  if (courses.length === 1) {
    courseSelect.value = courses[0].course_id;
    setCourseStatus(courses[0]);
  } else {
    courseStatus.textContent = "This state has multiple separate regulatory course records.";
  }
}

async function loadFinder() {
  try {
    const [registryResponse, catalogResponse] = await Promise.all([
      fetch("data/state-registry.json"),
      fetch("data/course-catalog.json")
    ]);

    if (!registryResponse.ok || !catalogResponse.ok) throw new Error("Course catalog unavailable");

    const registry = await registryResponse.json();
    const catalog = await catalogResponse.json();
    const states = [...registry.states].sort((a, b) => a.state_name.localeCompare(b.state_name));
    const courses = (catalog.categories || [])
      .flatMap((category) => category.programs || [])
      .flatMap((program) => (program.courses || []).map((course) => ({ ...course, state_id: course.state_id || program.state_code })));

    statesByCode = new Map(states.map((state) => [state.state_code, state]));
    coursesById = new Map(courses.map((course) => [course.course_id, course]));
    coursesByState = courses.reduce((map, course) => {
      const list = map.get(course.state_id) || [];
      list.push(course);
      map.set(course.state_id, list);
      return map;
    }, new Map());

    for (const state of states) {
      const count = (coursesByState.get(state.state_code) || []).length;
      const suffix = count ? ` (${count} ${count === 1 ? "course" : "courses"})` : "";
      stateSelect.append(option(state.state_code, state.state_name + suffix));
    }
  } catch (error) {
    console.error(error);
    stateSelect.disabled = true;
    courseStatus.textContent = "The course catalog is temporarily unavailable.";
  }
}

stateSelect.addEventListener("change", () => populateCourses(stateSelect.value));
courseSelect.addEventListener("change", () => setCourseStatus(coursesById.get(courseSelect.value)));
finder.addEventListener("submit", (event) => {
  event.preventDefault();
  const course = coursesById.get(courseSelect.value);
  if (course?.route) window.location.assign(course.route);
});

loadFinder();
