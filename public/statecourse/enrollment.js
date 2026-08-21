const form = document.querySelector("#enrollmentForm");
const choices = document.querySelector("#courseChoices");
const disclosure = document.querySelector("#disclosureRecord");
const acknowledgments = document.querySelector("#acknowledgments");
const statusBanner = document.querySelector("#paymentStatus");
const checkoutButton = document.querySelector("#checkoutButton");
const checkoutMessage = document.querySelector("#checkoutMessage");
const accountStatus = document.querySelector("#accountStatus");
const accountAction = document.querySelector("#accountAction");
const accountSignIn = document.querySelector("#accountSignIn");

const publicCourses = [
  {id:"va-salesperson",state:"VA",stateName:"Virginia",name:"Principles & Practices of Real Estate",hours:60,status:"In Development / Preparing Submission",regulator:"Virginia Real Estate Board"},
  {id:"me-sales-agent",state:"ME",stateName:"Maine",name:"Maine Real Estate Sales Agent Pre-License",hours:55,status:"In Development",regulator:"Maine Real Estate Commission"},
  {id:"ca-real-estate-principles-45",state:"CA",stateName:"California",name:"Real Estate Principles",hours:45,status:"In Development",regulator:"California Department of Real Estate"},
  {id:"ca-real-estate-practice-45",state:"CA",stateName:"California",name:"Real Estate Practice",hours:45,status:"In Development",regulator:"California Department of Real Estate"},
  {id:"ca-mortgage-loan-brokering-lending-45",state:"CA",stateName:"California",name:"Mortgage Loan Brokering and Lending",hours:45,status:"In Development",regulator:"California Department of Real Estate"},
];
let paymentConfig = {mode:"test", productionPaymentsEnabled:false, courses:[]};
let selectedId = new URLSearchParams(location.search).get("course") || "";
let studentSession = null;

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
  disclosure.innerHTML=`<dl><div><dt>State regulator</dt><dd>${escapeHtml(course.regulator)}</dd></div><div><dt>Required hours</dt><dd>${course.hours}</dd></div><div><dt>Course status</dt><dd>${escapeHtml(payment?.approvalStatus||course.status)}</dd></div><div><dt>Enrollment status</dt><dd>${payment?.checkoutEnabled?(payment.qaOnly?"Sandbox QA only":"Available"):"Disabled"}</dd></div><div><dt>Regulatory credit</dt><dd>${payment?.qaOnly?"Not eligible — QA enrollment":"Not available until approval"}</dd></div><div><dt>Refund / cancellation</dt><dd>${payment?.policyText?.refund?`Policy ${escapeHtml(payment.versions.refundPolicy)} — shown in full below and must be accepted before checkout`:"Course-specific policy version must be accepted before checkout"}</dd></div></dl>`;
  const versions=payment?.versions;
  if(!versions){acknowledgments.innerHTML='<p class="field-note">Acknowledgment versions will load after the payment service and course policies are configured.</p>';updateButton();return;}
  acknowledgments.innerHTML=[
    ["regulatoryAcknowledgment",versions.regulatoryAcknowledgment,"I understand this course’s current regulatory status and that sandbox QA activity provides no licensing credit."],
    ["terms",versions.terms,"I accept the current StateCourse terms for this course."],
    ["refundPolicy",versions.refundPolicy,"I have read the refund and cancellation policy below and accept it.",payment?.policyText?.refund||null],
    ["cancellationPolicy",versions.cancellationPolicy,"I have read the cancellation terms below and accept them.",payment?.policyText?.cancellation||null],
  ].map(([key,version,label,text])=>{
    /* RE 313's header requires the General Information Page — which carries the refund and
       cancellation policy — to be provided to the participant PRIOR TO
       registration/enrollment. A checkbox naming a version number is not that. Where the
       policy text is available it is displayed in full, above the box that accepts it. */
    const policy=text?`<div class="ack-policy" role="group" aria-label="${escapeHtml(label)}"><p>${escapeHtml(text)}</p></div>`:"";
    return `<div class="ack-item">${policy}<label class="ack-row"><input type="checkbox" data-ack="${key}" value="${escapeHtml(version)}"/><span>${escapeHtml(label)}<small>Version ${escapeHtml(version)}</small></span></label></div>`;
  }).join("");
  updateButton();
}

function updateButton(){
  const payment=selectedPayment(); const required=[...document.querySelectorAll("[data-ack]")]; const allAccepted=required.length===4&&required.every(input=>input.checked); const fieldsValid=form.checkValidity();
  if(!payment?.checkoutEnabled){checkoutButton.disabled=true;checkoutButton.textContent="Enrollment unavailable";checkoutMessage.textContent=payment?`Checkout blocked: ${payment.checkoutBlockReason.replaceAll("_"," ")}.`:"Payment configuration pending.";return;}
  const studentId=studentSession?.studentId;
  if(!studentId){checkoutButton.disabled=true;checkoutButton.textContent="Student account required";checkoutMessage.textContent="Create or sign in to your StateCourse account before checkout.";return;}
  checkoutButton.disabled=!(allAccepted&&fieldsValid); checkoutButton.textContent=payment.qaOnly?`Open Stripe test checkout · ${money(payment.amount,payment.currency)}`:`Continue to Stripe Checkout · ${money(payment.amount,payment.currency)}`; checkoutMessage.textContent=payment.qaOnly?"Sandbox payment creates a clearly marked non-credit QA enrollment.":"Enrollment is created only after a verified paid Stripe webhook.";
}

function accountReturnPath(){return `/enroll/?course=${encodeURIComponent(selectedId)}`;}

async function loadStudentSession(){
  const registerUrl=`/student/register/?course=${encodeURIComponent(selectedId)}&return_to=${encodeURIComponent(accountReturnPath())}`;
  const signInUrl=`/student/sign-in/?return_to=${encodeURIComponent(accountReturnPath())}`;
  accountAction.href=registerUrl;
  accountSignIn.href=signInUrl;
  try{
    const response=await fetch("/api/student/session",{credentials:"same-origin",headers:{accept:"application/json"}});
    if(!response.ok)throw new Error("not_signed_in");
    const data=await response.json();
    studentSession={studentId:data.student.id,email:data.student.email,firstName:data.student.firstName,lastName:data.student.lastName};
    form.email.value=data.student.email||"";
    form.firstName.value=data.student.firstName||"";
    form.lastName.value=data.student.lastName||"";
    accountStatus.textContent=`Signed in as ${data.student.email}.`;
    accountAction.textContent="Open My Courses";
    accountAction.href="/student/";
    accountSignIn.hidden=true;
  }catch{
    studentSession=null;
    accountStatus.textContent="Create or sign in to your StateCourse account to continue.";
    accountAction.textContent="Create Account";
    accountSignIn.hidden=false;
  }
  updateButton();
}

async function loadConfig(){
  try{const response=await fetch("/api/payments/config",{headers:{accept:"application/json"}});if(!response.ok)throw new Error("unavailable");paymentConfig=await response.json();const enabled=paymentConfig.courses.filter(course=>course.checkoutEnabled).length;statusBanner.textContent=enabled?`${paymentConfig.mode==="test"?"Stripe sandbox":"Stripe production"}: ${enabled} course checkout path(s) enabled.`:"Payments are safely disabled. No approved enrollment path is currently open.";statusBanner.classList.toggle("ready",Boolean(enabled));}
  catch{statusBanner.textContent="Payments are safely disabled while Stripe and the StateCourse enrollment service are being configured.";}
  renderChoices();renderDisclosure();
}

choices.addEventListener("change",event=>{if(event.target.name!=="courseId")return;selectedId=event.target.value;history.replaceState(null,"",`?course=${encodeURIComponent(selectedId)}`);renderChoices();renderDisclosure();loadStudentSession();});
form.addEventListener("input",updateButton);
form.addEventListener("submit",async event=>{
  event.preventDefault();const course=selectedPublic();const payment=selectedPayment();if(!course||!payment?.checkoutEnabled)return;checkoutButton.disabled=true;checkoutButton.textContent="Preparing secure checkout…";
  const acceptedVersions=Object.fromEntries([...document.querySelectorAll("[data-ack]")].filter(input=>input.checked).map(input=>[input.dataset.ack,input.value]));
  const data=new FormData(form);const payload={courseId:course.id,state:course.state,studentId:studentSession.studentId,email:data.get("email"),firstName:data.get("firstName"),lastName:data.get("lastName"),acceptedVersions};
  const headers={"content-type":"application/json"};
  try{const response=await fetch("/api/payments/checkout",{method:"POST",credentials:"same-origin",headers,body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw new Error(body.error||"checkout_unavailable");location.assign(body.checkoutUrl);}catch(error){checkoutMessage.textContent=`Checkout could not start: ${String(error.message).replaceAll("_"," ")}.`;updateButton();}
});
Promise.all([loadConfig(),loadStudentSession()]);
