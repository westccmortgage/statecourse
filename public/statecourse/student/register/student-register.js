const form = document.querySelector("#studentRegister");
const message = document.querySelector("#registerMessage");
const submitButton = form.querySelector("button[type='submit']");
const signInLinks = [document.querySelector("#studentSignInLink"), document.querySelector("#headerSignIn")];
const params = new URLSearchParams(location.search);

const fields = {
  firstName: form.elements.firstName,
  lastName: form.elements.lastName,
  email: form.elements.email,
  password: form.elements.password,
  passwordConfirm: form.elements.passwordConfirm
};
const errorElements = Object.fromEntries(Object.keys(fields).map((name) => [name, document.querySelector(`#${name}Error`)]));

function safeReturnPath(value, fallback = "/get-licensed/") {
  const path = String(value || fallback);
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : fallback;
}

function deriveReturnPath() {
  const requestedPath = params.get("return_to");
  if (requestedPath) return safeReturnPath(requestedPath);
  const requestedCourse = String(params.get("course") || "").replace(/[^a-z0-9-]/gi, "").slice(0, 100);
  if (requestedCourse) return `/enroll/?course=${encodeURIComponent(requestedCourse)}`;
  const stateRoutes = {
    AZ: "arizona", CA: "california", CO: "colorado", ME: "maine", MO: "missouri",
    NC: "north-carolina", OK: "oklahoma", PA: "pennsylvania", VA: "virginia",
    WA: "washington", WI: "wisconsin"
  };
  const stateCode = String(params.get("state") || "").toUpperCase();
  return stateRoutes[stateCode] ? `/real-estate/${stateRoutes[stateCode]}/` : "/get-licensed/";
}

const returnTo = deriveReturnPath();
const courseId = String(params.get("course") || "").replace(/[^a-z0-9-]/gi, "").slice(0, 100);
const signInUrl = `../sign-in/?return_to=${encodeURIComponent(returnTo)}`;
signInLinks.forEach((link) => { link.href = signInUrl; });

function setFieldError(name, text = "") {
  fields[name].setAttribute("aria-invalid", text ? "true" : "false");
  errorElements[name].textContent = text;
}

function validateField(name) {
  const value = fields[name].value.trim();
  if (name === "firstName" && !value) {
    setFieldError(name, "Please enter your first name.");
    return false;
  }
  if (name === "lastName" && !value) {
    setFieldError(name, "Please enter your last name.");
    return false;
  }
  if (name === "email" && (!value || fields.email.validity.typeMismatch)) {
    setFieldError(name, "Please enter a valid email address.");
    return false;
  }
  if (name === "password" && fields.password.value.length < 10) {
    setFieldError(name, "Your password must contain at least 10 characters.");
    return false;
  }
  if (name === "passwordConfirm") {
    if (!fields.passwordConfirm.value) {
      setFieldError(name, "Please confirm your password.");
      return false;
    }
    if (fields.passwordConfirm.value !== fields.password.value) {
      setFieldError(name, "Passwords do not match.");
      return false;
    }
  }
  setFieldError(name);
  return true;
}

function updatePasswordStrength() {
  const length = fields.password.value.length;
  const bar = document.querySelector("#strengthBar");
  const label = document.querySelector("#passwordStrength");
  let level = 0;
  let text = "Not entered";
  if (length > 0 && length < 10) {
    level = 1;
    text = `${10 - length} more character${10 - length === 1 ? "" : "s"} needed`;
  } else if (length >= 10 && length < 14) {
    level = 2;
    text = "Requirement met";
  } else if (length >= 14) {
    level = 3;
    text = "Strong length";
  }
  bar.dataset.level = String(level);
  label.dataset.level = String(level);
  label.textContent = text;
  if (fields.passwordConfirm.value) validateField("passwordConfirm");
}

Object.keys(fields).forEach((name) => {
  fields[name].addEventListener("blur", () => validateField(name));
  fields[name].addEventListener("input", () => {
    if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
    if (name === "password") updatePasswordStrength();
    if (name === "passwordConfirm" && fields.passwordConfirm.value) validateField(name);
  });
});

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = document.querySelector(`#${toggle.dataset.passwordToggle}`);
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    toggle.textContent = showPassword ? "Hide" : "Show";
    toggle.setAttribute("aria-pressed", String(showPassword));
    toggle.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} ${input.id === "passwordConfirm" ? "confirmed " : ""}password`);
    input.focus();
  });
});

function validateForm() {
  const results = Object.keys(fields).map((name) => [name, validateField(name)]);
  const firstInvalid = results.find(([, valid]) => !valid);
  if (firstInvalid) fields[firstInvalid[0]].focus();
  return !firstInvalid;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error", "success");
  if (!validateForm()) return;
  submitButton.disabled = true;
  submitButton.textContent = "Creating your account…";
  form.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/student/register", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        firstName: fields.firstName.value.trim(),
        lastName: fields.lastName.value.trim(),
        email: fields.email.value.trim(),
        password: fields.password.value,
        courseId
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "registration_failed");
    fields.password.value = "";
    fields.passwordConfirm.value = "";
    if (!data.confirmationRequired) {
      location.replace(returnTo);
      return;
    }
    form.hidden = true;
    message.hidden = false;
    message.textContent = "Your account has been created. Check your email to confirm your address, then sign in to continue your licensing path.";
    message.classList.add("success");
    const primarySignIn = document.querySelector("#studentSignInLink");
    primarySignIn.textContent = "Continue to Student Sign In";
    primarySignIn.focus();
  } catch (error) {
    console.error(error);
    message.textContent = error.message === "invalid_registration"
      ? "Review the highlighted information and try again."
      : "We could not create your account. If this email is already registered, sign in instead.";
    message.classList.add("error");
    submitButton.disabled = false;
    submitButton.textContent = "Create My Account";
  } finally {
    form.removeAttribute("aria-busy");
  }
});
