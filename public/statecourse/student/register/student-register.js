const form = document.querySelector("#studentRegister");
const message = document.querySelector("#registerMessage");
const button = form.querySelector("button");
const params = new URLSearchParams(location.search);

function safeReturnPath(value) {
  const path = String(value || "/student/");
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/student/";
}

const returnTo = safeReturnPath(params.get("return_to"));
const courseId = String(params.get("course") || "").replace(/[^a-z0-9-]/gi,"").slice(0,100);
const signInUrl = `../sign-in/?return_to=${encodeURIComponent(returnTo)}`;
document.querySelector("#studentSignInLink").href = signInUrl;
document.querySelector("#headerSignIn").href = signInUrl;

form.addEventListener("submit",async(event) => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error");
  if (form.password.value !== form.passwordConfirm.value) {
    message.textContent = "Passwords do not match.";
    message.classList.add("error");
    form.passwordConfirm.focus();
    return;
  }
  button.disabled = true;
  button.textContent = "Creating account…";
  try {
    const response = await fetch("/api/student/register",{
      method:"POST",
      credentials:"same-origin",
      headers:{ "content-type":"application/json", accept:"application/json" },
      body:JSON.stringify({
        firstName:form.firstName.value,
        lastName:form.lastName.value,
        email:form.email.value,
        password:form.password.value,
        courseId
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "registration_failed");
    form.password.value = "";
    form.passwordConfirm.value = "";
    if (!data.confirmationRequired) {
      location.replace(returnTo);
      return;
    }
    form.hidden = true;
    message.textContent = "Account created. Check your email to confirm the address, then sign in to continue.";
    document.querySelector("#studentSignInLink").textContent = "Continue to Student Sign In →";
    document.querySelector("#studentSignInLink").focus();
  } catch (error) {
    console.error(error);
    message.textContent = error.message === "invalid_registration"
      ? "Enter your legal name, a valid email address, and a password of at least 10 characters."
      : "We could not create the account. If this email is already registered, use Student Sign In.";
    message.classList.add("error");
    button.disabled = false;
    button.textContent = "Create Account";
  }
});

