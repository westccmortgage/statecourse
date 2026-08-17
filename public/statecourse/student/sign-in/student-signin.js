const form = document.querySelector("#studentSignIn");
const message = document.querySelector("#signinMessage");
const button = form.querySelector("button");

function returnPath() {
  const value = new URLSearchParams(location.search).get("return_to") || "/student/";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/student/";
}

async function existingSession() {
  const response = await fetch("/api/student/session",{ credentials:"same-origin" }).catch(() => null);
  if (response?.ok) location.replace(returnPath());
}

form.addEventListener("submit",async(event) => {
  event.preventDefault();
  message.textContent = "Signing in…";
  message.classList.remove("error");
  button.disabled = true;
  try {
    const response = await fetch("/api/student/session",{
      method:"POST",
      credentials:"same-origin",
      headers:{ "content-type":"application/json" },
      body:JSON.stringify({ email:form.email.value,password:form.password.value })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "sign_in_failed");
    }
    form.password.value = "";
    location.replace(returnPath());
  } catch (error) {
    console.error(error);
    message.textContent = error.message === "student_auth_unavailable" ? "Student sign-in is not active yet." : "We could not sign you in. Check your email and password.";
    message.classList.add("error");
    button.disabled = false;
  }
});

existingSession();
