const title = document.querySelector("#confirmationTitle");
const copy = document.querySelector("#confirmationCopy");
const details = document.querySelector("#confirmationDetails");
const sessionId = new URLSearchParams(location.search).get("session_id") || "";
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function check(attempt = 0) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    title.textContent = "Confirmation link is incomplete";
    copy.textContent = "No valid Stripe Checkout Session ID was supplied.";
    return;
  }

  try {
    const response = await fetch(`/api/payments/status?session_id=${encodeURIComponent(sessionId)}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "status_unavailable");

    details.innerHTML = `<div><dt>Payment</dt><dd>${body.paymentStatus || "pending"}</dd></div>
      <div><dt>Enrollment</dt><dd>${body.enrollmentStatus || "pending_webhook"}</dd></div>
      <div><dt>Course</dt><dd>${body.courseId || "Pending"}</dd></div>
      <div><dt>Amount</dt><dd>${body.amount == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: (body.currency || "usd").toUpperCase() }).format(body.amount / 100)}</dd></div>`;

    if (body.enrollmentStatus === "pending_webhook" && attempt < 5) {
      title.textContent = "Payment received; enrollment is processing";
      copy.textContent = "Do not close this page yet. Access is granted only after the signed webhook is recorded.";
      await wait(1600);
      return check(attempt + 1);
    }

    title.textContent = body.enrollmentStatus === "active"
      ? "Enrollment confirmed"
      : body.enrollmentStatus === "qa_non_credit"
        ? "Sandbox enrollment confirmed"
        : "Payment status confirmed";
    copy.textContent = body.enrollmentStatus === "qa_non_credit"
      ? "This is a non-credit QA enrollment. It cannot count as study time, completion, or regulatory credit."
      : "Your payment and course-specific enrollment records are shown below.";
  } catch {
    title.textContent = "Confirmation is still processing";
    copy.textContent = "We could not retrieve the enrollment record yet. Keep your Stripe receipt and refresh this page shortly.";
  }
}

check();
