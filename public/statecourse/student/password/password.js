const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.hash.slice(1));
let recoveryToken = params.get("type") === "recovery" ? params.get("access_token") : null;
const linkError = params.has("error");
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
const mode = recoveryToken ? "reset" : new URLSearchParams(location.search).get("mode") === "change" ? "change" : "forgot";
const form = $("passwordForm"), message = $("message"), submit = $("submit");
if (mode !== "forgot") {
  $("title").textContent = mode === "reset" ? "Choose a new password" : "Change your password";
  $("intro").textContent = mode === "reset" ? "Set a new password for the account confirmed by your reset link." : "Confirm your current password, then choose a new one.";
  $("emailField").hidden = true; $("email").required = false;
  $("newFields").hidden = false; $("newPassword").required = true; $("confirmPassword").required = true;
  $("currentField").hidden = mode !== "change"; $("currentPassword").required = mode === "change";
  $("forgotLink").hidden = false; submit.textContent = "Save new password";
}
if (linkError) message.textContent = "This reset link is invalid or has expired. Request a new link below.";
$("showPassword").addEventListener("click", () => {
  const show = $("newPassword").type === "password";
  for (const id of ["newPassword", "confirmPassword", "currentPassword"]) $(id).type = show ? "text" : "password";
  $("showPassword").textContent = show ? "Hide passwords" : "Show passwords";
  $("showPassword").setAttribute("aria-pressed", String(show));
});
const errors = {
  password_length: "Use a password between 10 and 200 characters.",
  weak_password: "Choose a stronger password with a mix of letters, numbers and symbols.",
  same_password: "Choose a password different from your current password.",
  current_password_incorrect: "Your current password was not accepted. Try again or request a reset link.",
  current_password_required: "Enter your current password.",
  reset_link_expired: "This reset link has expired. Request a new link.",
  authentication_failed: "Your session or reset link is no longer valid. Sign in again or request a new reset link.",
  student_auth_required: "Please sign in before changing your password, or request a reset link.",
  invalid_student_session: "Please sign in again, or request a reset link.",
  reauthentication_required: "Please sign in again before changing your password.",
  too_many_attempts: "Too many attempts. Wait a few minutes before trying again.",
  invalid_email: "Enter a valid email address."
};
form.addEventListener("submit", async event => {
  event.preventDefault(); message.textContent = "";
  if (!form.reportValidity()) return;
  if (mode !== "forgot" && $("newPassword").value !== $("confirmPassword").value) {
    message.textContent = "The new passwords do not match."; $("confirmPassword").focus(); return;
  }
  submit.disabled = true; form.setAttribute("aria-busy", "true");
  try {
    const body = { action: mode, email: $("email").value.trim(), password: $("newPassword").value, currentPassword: $("currentPassword").value };
    if (mode === "reset") body.recoveryToken = recoveryToken;
    const res = await fetch("/api/student/account", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(errors[data.error] || "Account service is temporarily unavailable. Please try again shortly.");
    if (mode === "forgot") {
      message.textContent = "If an account uses that email, a reset link will be sent. Check your inbox and spam folder. Open the newest password reset email.";
    } else {
      recoveryToken = null; form.reset(); form.hidden = true;
      message.textContent = "Your password has been changed. Sign in below with your new password." + (data.sessionsRevoked === false ? " Other sessions could not be signed out automatically." : "");
    }
  } catch (e) {
    message.textContent = e instanceof TypeError ? "Could not connect. Check your connection and try again." : e.message;
  } finally { submit.disabled = false; form.removeAttribute("aria-busy"); }
});
