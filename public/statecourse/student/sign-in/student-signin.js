const form = document.querySelector("#studentSignIn");
const message = document.querySelector("#signinMessage");
const submitButton = form.querySelector("button[type='submit']");
const createAccountLinks = [document.querySelector("#createAccountLink"), document.querySelector("#headerCreateAccount")];
const email = form.elements.email;
const password = form.elements.password;
const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");

function returnPath() {
  const value = new URLSearchParams(location.search).get("return_to") || "/student/";
  const safePath = value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/student/";
  const protectedContinuations = ["/student/", "/student-course.html", "/enroll/"];
  return protectedContinuations.some((prefix) => safePath.startsWith(prefix)) ? safePath : "/student/";
}

const registrationUrl = `../register/?return_to=${encodeURIComponent(returnPath())}`;
createAccountLinks.forEach((link) => { link.href = registrationUrl; });

function setError(field, errorElement, text = "") {
  field.setAttribute("aria-invalid", text ? "true" : "false");
  errorElement.textContent = text;
}

function validateEmail() {
  if (!email.value.trim() || email.validity.typeMismatch) {
    setError(email, emailError, "Please enter a valid email address.");
    return false;
  }
  setError(email, emailError);
  return true;
}

function validatePassword() {
  if (!password.value) {
    setError(password, passwordError, "Please enter your password.");
    return false;
  }
  setError(password, passwordError);
  return true;
}

email.addEventListener("blur", validateEmail);
password.addEventListener("blur", validatePassword);
email.addEventListener("input", () => {
  if (email.getAttribute("aria-invalid") === "true") validateEmail();
});
password.addEventListener("input", () => {
  if (password.getAttribute("aria-invalid") === "true") validatePassword();
});

document.querySelector(".password-toggle").addEventListener("click", (event) => {
  const showPassword = password.type === "password";
  password.type = showPassword ? "text" : "password";
  event.currentTarget.textContent = showPassword ? "Hide" : "Show";
  event.currentTarget.setAttribute("aria-pressed", String(showPassword));
  event.currentTarget.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} password`);
  password.focus();
});

async function existingSession() {
  const response = await fetch("/api/student/session", { credentials: "same-origin" }).catch(() => null);
  if (response?.ok) location.replace(returnPath());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error", "success");
  const validEmail = validateEmail();
  const validPassword = validatePassword();
  if (!validEmail || !validPassword) {
    (validEmail ? password : email).focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Signing you in…";
  form.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/student/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      let text = "Sign-in is temporarily unavailable. Please try again shortly.";
      if (response.status === 401 || (response.status === 400 && result.error === "invalid_sign_in")) {
        text = "We could not sign you in. Check your email address and password, then try again.";
      } else if (response.status === 403 && result.error === "email_confirmation_required") {
        text = "Please confirm your email using the confirmation link sent when you registered, then sign in.";
      } else if (response.status === 429) {
        text = "Too many sign-in attempts. Please wait a few minutes, then try again.";
      } else if (response.status === 403) {
        text = "This sign-in request was blocked. Reload this page and try again.";
      }
      throw Object.assign(new Error("sign_in_failed"), { userMessage: text });
    }
    password.value = "";
    location.replace(returnPath());
  } catch (error) {
    message.textContent = error.userMessage || "We could not connect to sign-in. Check your connection and try again.";
    message.classList.add("error");
    submitButton.disabled = false;
    submitButton.textContent = "Sign In to My StateCourse";
    password.focus();
  } finally {
    form.removeAttribute("aria-busy");
  }
});

existingSession();
