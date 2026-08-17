const stateSelect = document.querySelector("#homeStateSelect");
const goalSelect = document.querySelector("#homeGoalSelect");
const finder = document.querySelector("#licensing-finder");
const message = document.querySelector("#finderMessage");
const platformRoot = new URL("./", document.currentScript.src);

const slugify = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");

function updateGoalOptions(intent) {
  const options = {
    licensed: [["first-license", "First real estate license"], ["broker", "Broker education"], ["requirements", "Understand requirements"]],
    exam: [["exam-prep", "State licensing exam preparation"], ["free-practice", "Free practice questions"], ["exam-rules", "Understand the state exam"]],
    renew: [["ce", "Continuing education"], ["renewal-rules", "Understand renewal requirements"], ["certificates", "Find my certificates"]],
  };
  goalSelect.innerHTML = options[intent].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

async function loadStates() {
  try {
    const response = await fetch(new URL("data/state-registry.json", platformRoot));
    if (!response.ok) throw new Error("State registry unavailable");
    const { states } = await response.json();
    const jurisdictions = [...states, { state_name: "District of Columbia", state_code: "DC" }].sort((a, b) => a.state_name.localeCompare(b.state_name));
    stateSelect.insertAdjacentHTML("beforeend", jurisdictions.map((state) => `<option value="${state.state_code}" data-slug="${slugify(state.state_name)}">${state.state_name}</option>`).join(""));
  } catch (error) {
    console.error(error);
    message.textContent = "State selection is temporarily unavailable. Please use State Requirements.";
  }
}

document.querySelectorAll('input[name="intent"]').forEach((radio) => radio.addEventListener("change", () => updateGoalOptions(radio.value)));

finder?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = stateSelect.selectedOptions[0];
  if (!selected?.value) {
    message.textContent = "Choose a state to continue.";
    stateSelect.focus();
    return;
  }
  const intent = document.querySelector('input[name="intent"]:checked')?.value || "licensed";
  if (intent === "exam") window.location.href = new URL(`exam-prep/?state=${encodeURIComponent(selected.value)}`, platformRoot);
  else if (intent === "renew") window.location.href = new URL(`continuing-education/?state=${encodeURIComponent(selected.value)}`, platformRoot);
  else window.location.href = new URL(`real-estate/${selected.dataset.slug}/`, platformRoot);
});

loadStates();
