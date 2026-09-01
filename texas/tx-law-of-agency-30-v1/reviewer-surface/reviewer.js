document.addEventListener("click", (event) => {
  const button = event.target.closest(".rs-check");
  if (!button) return;
  const itemId = button.dataset.for;
  const correctIndex = Number(button.dataset.correct);
  const chosen = document.querySelector('input[name="' + itemId + '"]:checked');
  const feedback = document.getElementById("fb-" + itemId);
  const rationale = document.getElementById("rat-" + itemId);
  if (!chosen) {
    feedback.textContent = "Select an answer before checking.";
    return;
  }
  if (Number(chosen.value) === correctIndex) {
    feedback.textContent = "Correct. The next question is available.";
  } else {
    feedback.textContent = "Not correct. Read the explanation below; a different related question follows.";
  }
  rationale.hidden = false;
});
