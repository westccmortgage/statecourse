(() => {
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const recovery = hash.get("type") === "recovery";
  const code = query.get("code");
  const error = query.get("error") || hash.get("error");
  if (recovery || code || error) document.documentElement.dataset.authCallback = "true";
  if (recovery) {
    const fragment = location.hash;
    history.replaceState(null, "", location.pathname);
    location.replace("/student/password/" + fragment);
    return;
  }
  if (code || error || hash.has("access_token")) history.replaceState(null, "", location.pathname);
  const show = text => {
    const element = document.getElementById("authFlowMessage");
    if (element) element.textContent = text;
  };
  document.addEventListener("DOMContentLoaded", async () => {
    if (error) show("The sign-in or email link was cancelled or has expired. Please try again.");
    if (code) {
      show("Completing your sign-in…");
      try {
        const res = await fetch("/api/student/account", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "google_finish", code }) });
        if (!res.ok) throw new Error();
        location.replace(location.pathname.startsWith("/admin/") ? "/admin/console/" : "/student/");
        return;
      } catch { show("Google sign-in could not be completed. Start again using Continue with Google."); }
    }
    const button = document.getElementById("googleSignIn");
    if (!button) return;
    button.hidden = true;
    button.disabled = true;
    try {
      const res = await fetch("/api/student/account", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "capabilities" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.providers?.google !== true) return;
      button.hidden = false;
      button.disabled = false;
    } catch { return; }
    button.addEventListener("click", async () => {
      button.disabled = true; show("Connecting to Google…");
      try {
        const res = await fetch("/api/student/account", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "google_start", destination: location.pathname.startsWith("/admin/") ? "admin" : "student" }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data.error === "google_not_configured") button.hidden = true;
          show(data.error === "google_not_configured" ? "Google sign-in is not available yet. Please use email and password." : "Could not start Google sign-in. Please try again shortly.");
          return;
        }
        location.assign(data.url);
      } catch { show("Could not connect. Check your connection and try again."); }
      finally { button.disabled = false; }
    });
  });
})();
