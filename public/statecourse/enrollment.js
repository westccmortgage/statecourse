const form = document.querySelector("#enrollmentForm");
const choices = document.querySelector("#courseChoices");
const disclosure = document.querySelector("#disclosureRecord");
const acknowledgments = document.querySelector("#acknowledgments");
const statusBanner = document.querySelector("#paymentStatus");
const checkoutButton = document.querySelector("#checkoutButton");
const checkoutMessage = document.querySelector("#checkoutMessage");

const publicCourses = [
  {id:"va-salesperson",state:"VA",stateName:"Virginia",name:"Principles & Practices of Real Estate",hours:60,status:"In Development / Preparing Submission",regulator:"Virginia Real Estate Board"},
  {id:"me-sales-agent",state:"ME",stateName:"Maine",name:"Maine Real Estate Sales Agent Pre-License",hours:55,status:"In Development",regulator:"Maine Real Estate Commission"},
];
let paymentConfig = {mode:"test", productionPaymentsEnabled:false, courses:[]};
let selectedId = new URLSearchParams(location.search).get("course") || "";

function escapeHtml(value="") { return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function selectedPublic() { return publicCourses.find(course=>course.id===selectedId); }
function selectedPayment() { return paymentConfig.courses.find(course=>course.id===selectedId); }
function money(amount,currency="usd") { return amount == null ? "Price pending" : new Intl.NumberFormat("en-US",{style:"currency",currency:currency.toUpperCase()}).format(amount/100); }

function renderChoices() {
  choices.innerHTML=publicCourses.map(course=>{const payment=paymentConfig.courses.find(item=>item.id===course.id);return `<label class="course-choice${selectedId===course.id?" active":""}"><input type="radio" name="courseId" value="${course.id}" ${selectedId===course.id?"checked":""}/><span class="course-choice-state">${course.state}</span><span><strong>${escapeHtml(course.stateName)}</strong><b>${escapeHtml(course.name)}</b><small>${course.hours} required hours · ${escapeHtml(course.status)}</small></span><em>${money(payment?.amount,payment?.currency)}</em></label>`}).join("");
}

function renderDisclosure() {
  const course=selectedPublic(); const payment=selectedPayment();
  if(!course){disclosure.innerHTML="<p>Select a course to load its state-specific disclosure record.</p>";acknowledgments.innerHTML="";updateButton();return;}
  disclosure.innerHTML=`<dl><div><dt>State regulator</dt><dd>${escapeHtml(course.regulator)}</dd></div><div><dt>Required hours</dt><dd>${course.hours}</dd></div><div><dt>Course status</dt><dd>${escapeHtml(payment?.approvalStatus||course.status)}</dd></div><div><dt>Enrollment status</dt><dd>${payment?.checkoutEnabled?(payment.qaOnly?"Sandbox QA only":"Available"):"Disabled"}</dd></div><div><dt>Regulatory credit</dt><dd>${payment?.qaOnly?"Not eligible — QA enrollment":"Not available until approval"}</dd></div><div><dt>Refund / cancellation</dt><dd>Course-specific policy version must be accepted before checkout</dd></div></dl>`;
  const versions=payment?.versions;
  if(!versions){acknowledgments.innerHTML='<p class="field-note">Acknowledgment versions will load after the payment service and course policies are configured.</p>';updateButton();return;}
  acknowledgments.innerHTML=[
    ["regulatoryAcknowledgment",versions.regulatoryAcknowledgment,"I understand this course’s current regulatory status and that sandbox QA activity provides no licensing credit."],
    ["terms",versions.terms,"I accept the current StateCourse terms for this course."],
    ["refundPolicy",versions.refundPolicy,"I reviewed and accept this state/course refund policy version."],
    ["cancellationPolicy",versions.cancellationPolicy,"I reviewed and accept this state/course cancellation policy version."],
  ].map(([key,version,label])=>`<label class="ack-row"><input type="checkbox" data-ack="${key}" value="${escapeHtml(version)}"/><span>${escapeHtml(label)}<small>Version ${escapeHtml(version)}</small></span></label>`).join("");
  updateButton();
}

function updateButton(){
  const payment=selectedPayment(); const required=[...document.querySelectorAll("[data-ack]")]; const allAccepted=required.length===4&&required.every(input=>input.checked); const fieldsValid=form.checkValidity();
  if(!payment?.checkoutEnabled){checkoutButton.disabled=true;checkoutButton.textContent="Enrollment unavailable";checkoutMessage.textContent=payment?`Checkout blocked: ${payment.checkoutBlockReason.replaceAll("_"," ")}.`:"Payment configuration pending.";return;}
  const studentId=window.statecourseSession?.studentId || (payment.qaOnly ? sandboxStudentId() : null);
  if(!studentId){checkoutButton.disabled=true;checkoutButton.textContent="Student sign-in required";checkoutMessage.textContent="Production checkout requires an authenticated student account.";return;}
  checkoutButton.disabled=!(allAccepted&&fieldsValid); checkoutButton.textContent=payment.qaOnly?`Open Stripe test checkout · ${money(payment.amount,payment.currency)}`:`Continue to Stripe Checkout · ${money(payment.amount,payment.currency)}`; checkoutMessage.textContent=payment.qaOnly?"Sandbox payment creates a clearly marked non-credit QA enrollment.":"Enrollment is created only after a verified paid Stripe webhook.";
}

function sandboxStudentId(){let id=sessionStorage.getItem("statecourse:qa-student-id");if(!id){id=crypto.randomUUID();sessionStorage.setItem("statecourse:qa-student-id",id);}return id;}

async function loadConfig(){
  try{const response=await fetch("/api/payments/config",{headers:{accept:"application/json"}});if(!response.ok)throw new Error("unavailable");paymentConfig=await response.json();const enabled=paymentConfig.courses.filter(course=>course.checkoutEnabled).length;statusBanner.textContent=enabled?`${paymentConfig.mode==="test"?"Stripe sandbox":"Stripe production"}: ${enabled} course checkout path(s) enabled.`:"Payments are safely disabled. No approved enrollment path is currently open.";statusBanner.classList.toggle("ready",Boolean(enabled));}
  catch{statusBanner.textContent="Payments are safely disabled while Stripe and the StateCourse enrollment service are being configured.";}
  renderChoices();renderDisclosure();
}

choices.addEventListener("change",event=>{if(event.target.name!=="courseId")return;selectedId=event.target.value;history.replaceState(null,"",`?course=${encodeURIComponent(selectedId)}`);renderChoices();renderDisclosure();});
form.addEventListener("input",updateButton);
form.addEventListener("submit",async event=>{
  event.preventDefault();const course=selectedPublic();const payment=selectedPayment();if(!course||!payment?.checkoutEnabled)return;checkoutButton.disabled=true;checkoutButton.textContent="Preparing secure checkout…";
  const acceptedVersions=Object.fromEntries([...document.querySelectorAll("[data-ack]")].filter(input=>input.checked).map(input=>[input.dataset.ack,input.value]));
  const data=new FormData(form);const session=window.statecourseSession;const payload={courseId:course.id,state:course.state,studentId:session?.studentId||sandboxStudentId(),email:data.get("email"),firstName:data.get("firstName"),lastName:data.get("lastName"),acceptedVersions};
  const headers={"content-type":"application/json"};if(session?.accessToken)headers.authorization=`Bearer ${session.accessToken}`;
  try{const response=await fetch("/api/payments/checkout",{method:"POST",headers,body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw new Error(body.error||"checkout_unavailable");location.assign(body.checkoutUrl);}catch(error){checkoutMessage.textContent=`Checkout could not start: ${String(error.message).replaceAll("_"," ")}.`;updateButton();}
});
loadConfig();
