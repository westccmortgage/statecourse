/* StateCourse visit counting. First-party only: this file talks to statecourse.com and
   nowhere else, loads nothing from other companies, and sets no cookie until the visitor
   presses Accept. Declining, or a browser that sends Global Privacy Control, means the
   visit is counted anonymously and nothing is remembered. */
(function () {
  "use strict";
  var YEAR = 60 * 60 * 24 * 365;
  var gpc = navigator.globalPrivacyControl === true;

  function cookie(name) {
    var found = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return found ? decodeURIComponent(found[1]) : "";
  }
  function setCookie(name, value, seconds) {
    document.cookie = name + "=" + encodeURIComponent(value) + "; Max-Age=" + seconds + "; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  }
  function choice() {
    if (gpc) return "declined";
    var saved = cookie("sc_consent");
    return saved === "accepted" || saved === "declined" ? saved : "unset";
  }
  function visitorId() {
    if (choice() !== "accepted") return null;
    var id = cookie("sc_vid");
    if (!/^[a-f0-9-]{36}$/.test(id)) {
      if (!window.crypto || !crypto.randomUUID) return null;
      id = crypto.randomUUID();
    }
    setCookie("sc_vid", id, YEAR);
    return id;
  }
  function report(kind) {
    var query = new URLSearchParams(location.search);
    var body = JSON.stringify({
      k: kind, p: location.pathname, r: document.referrer, c: choice(), v: visitorId(),
      us: query.get("utm_source"), um: query.get("utm_medium"), uc: query.get("utm_campaign"),
      w: navigator.webdriver === true ? 1 : 0
    });
    try {
      /* text/plain keeps this a simple same-origin request; keepalive lets it finish if the
         visitor leaves the page straight away. */
      fetch("/api/collect", { method: "POST", keepalive: true, credentials: "omit", headers: { "content-type": "text/plain" }, body: body }).catch(function () {});
    } catch { /* counting a visit must never affect the page */ }
  }

  function closeNotice() {
    var notice = document.getElementById("sc-cookie-notice");
    if (notice) notice.remove();
  }
  function decide(value) {
    setCookie("sc_consent", value, YEAR);
    if (value === "declined") setCookie("sc_vid", "", 0);
    closeNotice();
    /* Ties the page the visitor arrived on, and where they came from, to their choice. */
    if (value === "accepted") report("consent");
  }
  function button(text, value) {
    var element = document.createElement("button");
    element.type = "button"; element.textContent = text; element.className = "sc-cookie-button";
    element.addEventListener("click", function () { decide(value); });
    return element;
  }
  function showNotice() {
    if (document.getElementById("sc-cookie-notice")) return;
    var notice = document.createElement("section");
    notice.id = "sc-cookie-notice"; notice.className = "sc-cookie-notice";
    notice.setAttribute("role", "region"); notice.setAttribute("aria-label", "Cookie choice");
    var text = document.createElement("p");
    text.append("StateCourse counts visits to improve this site. If you accept, we also remember this browser with a cookie, so we can see how visitors find us and come back. We do not sell this information or share it with advertisers. ");
    var link = document.createElement("a"); link.href = "/privacy/"; link.textContent = "Privacy";
    text.append(link);
    var actions = document.createElement("div"); actions.className = "sc-cookie-actions";
    /* The two choices are the same size and weight: declining is as easy as accepting. */
    actions.append(button("Accept", "accepted"), button("Decline", "declined"));
    notice.append(text, actions);
    document.body.append(notice);
  }

  function start() {
    report("view");
    if (choice() === "unset") showNotice();
    /* Any element marked this way reopens the choice, e.g. the link on the Privacy page. */
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest && event.target.closest("[data-cookie-settings]");
      if (!trigger) return;
      event.preventDefault();
      if (gpc) { trigger.textContent = "Your browser's Global Privacy Control signal is on, so nothing is remembered."; return; }
      showNotice();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
