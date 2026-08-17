const page={enrollmentId:new URLSearchParams(location.search).get("enrollment_id")||"",assignment:new URLSearchParams(location.search).get("assignment")||"",data:null,sessionId:crypto.randomUUID(),lastInteraction:Date.now(),heartbeat:null,observer:null,sectionTimers:new Map()};
const $=(selector)=>document.querySelector(selector);
const message=$("#courseMessage"),shell=$("#courseShell"),actionMessage=$("#actionMessage");

function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function inline(text){
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>");
}
function renderMarkdown(markdown){
  const lines=String(markdown||"").replace(/\r/g,"").split("\n"),output=[];
  let paragraph=[],list=[],table=[],tracked=0;
  const flushParagraph=()=>{if(paragraph.length){output.push("<p>"+inline(paragraph.join(" "))+"</p>");paragraph=[];}};
  const flushList=()=>{if(list.length){output.push("<ul>"+list.map((item)=>"<li>"+inline(item)+"</li>").join("")+"</ul>");list=[];}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter((row)=>!row.every((cell)=>/^:?-+:?$/.test(cell)));if(rows.length)output.push("<table><thead><tr>"+rows[0].map((cell)=>"<th>"+inline(cell)+"</th>").join("")+"</tr></thead><tbody>"+rows.slice(1).map((row)=>"<tr>"+row.map((cell)=>"<td>"+inline(cell)+"</td>").join("")+"</tr>").join("")+"</tbody></table>");table=[];};
  const flush=()=>{flushParagraph();flushList();flushTable();};
  for(const raw of lines){
    const line=raw.trim();
    if(line.startsWith("|")&&line.endsWith("|")){flushParagraph();flushList();table.push(line.slice(1,-1).split("|").map((cell)=>cell.trim()));continue;}
    if(table.length)flushTable();
    if(!line){flushParagraph();flushList();continue;}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){flush();const level=heading[1].length;const isTracked=level===2&&/^\d+\./.test(heading[2])&&tracked<6;if(isTracked)tracked+=1;output.push(`<h${level}${isTracked?` class="section-marker" data-section="${tracked}"`:""}>${inline(heading[2])}</h${level}>`);continue;}
    if(/^[-*]\s+/.test(line)){flushParagraph();list.push(line.replace(/^[-*]\s+/,""));continue;}
    paragraph.push(line);
  }
  flush();return output.join("");
}
function formatDuration(seconds){const total=Math.max(0,Math.floor(Number(seconds||0))),hours=Math.floor(total/3600),minutes=Math.floor((total%3600)/60),secs=total%60;return hours?`${hours}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`:`${minutes}:${String(secs).padStart(2,"0")}`;}
function formatDate(value){if(!value)return"Pending";const date=new Date(value);return Number.isNaN(date.getTime())?"Pending":date.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});}
function eventBody(eventType,extra={}){return{eventType,enrollmentId:page.enrollmentId,assignmentId:page.data.selectedAssignment.id,...extra};}
async function post(eventType,extra={}){
  const response=await fetch("/api/student/course",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(eventBody(eventType,extra))});
  const data=await response.json().catch(()=>({}));
  if(response.status===401){location.replace("/student/sign-in/?return_to="+encodeURIComponent(location.pathname+location.search));return null;}
  if(!response.ok)throw new Error(data.error||"course_action_failed");return data;
}
function assignmentStatusLabel(item){if(item.status==="completed")return"✓ Completed";if(item.status==="locked")return"🔒 Locked";if(item.status==="review_available")return"Review available";if(item.status==="remediation_required")return"Remediation required";return"● In progress";}
function renderRail(){
  const{course,progress,assignments,selectedAssignment}=page.data;
  $("#courseTitle").textContent=course.title;$("#courseMeta").textContent=`45-hour correspondence course · Version ${course.version}`;$("#courseProgressBar").style.width=progress.percent+"%";$("#courseProgressText").textContent=`Course progress: ${progress.completed} / ${progress.total} assignments completed`;
  $("#assignmentList").innerHTML=assignments.map((item)=>`<li><button class="assignment-link" type="button" data-assignment="${escapeHtml(item.id)}" ${item.accessible?"":"disabled"} aria-current="${item.id===selectedAssignment.id}"><span class="number">${String(item.sequence).padStart(2,"0")}</span><span><strong>${escapeHtml(item.title)}</strong><small class="state">${assignmentStatusLabel(item)}</small></span></button></li>`).join("");
}
function requirement(element,complete,completeText="Complete",pendingText="Pending"){element.textContent=complete?completeText:pendingText;element.className=complete?"complete":"pending";}
function renderStatus(){
  const selected=page.data.selectedAssignment;$("#statusHeading").textContent=`Assignment ${String(selected.sequence).padStart(2,"0")}`;$("#activeTime").textContent=formatDuration(selected.activeSeconds);$("#sectionStatus").textContent=`${selected.viewedSections.length} / ${selected.sectionCount}`;$("#sectionStatus").className=selected.viewedSections.length>=selected.sectionCount?"complete":"pending";requirement($("#appliedStatus"),selected.appliedComplete);requirement($("#engagementStatus"),selected.engagementComplete);
  const remediation=selected.remediationStatus;$("#remediationStatus").textContent=remediation==="not_required"?"Not required":remediation==="satisfied"?"Complete":remediation==="content_viewed"?"Alternate question pending":"Required";$("#remediationStatus").className=remediation==="not_required"||remediation==="satisfied"?"complete":"pending";
  const eligibility=page.data.progress.eligibility;$("#earliestFinal").textContent=formatDate(eligibility?.earliest_final_exam_at);const remaining=Array.isArray(eligibility?.remaining_requirements)?eligibility.remaining_requirements:[];$("#finalRequirements").textContent=remaining.length?remaining.join(" · "):"Final eligibility requirements complete";
}
function renderAssessment(target,assessment,kind,complete,enabled){
  if(complete){target.innerHTML='<p class="assessment-result"><strong>Complete.</strong> This requirement is recorded for the assignment version.</p>';return;}
  if(!assessment){target.innerHTML="";return;}
  const name=kind+"Choice";
  target.innerHTML=`<form data-kind="${kind}"><fieldset ${enabled?"":"disabled"}><legend>${escapeHtml(assessment.prompt)}</legend>${assessment.choices.map((choice,index)=>`<label class="choice"><input type="radio" name="${name}" value="${index}" required><span>${escapeHtml(choice)}</span></label>`).join("")}</fieldset><button type="submit" ${enabled?"":"disabled"}>${kind==="remediation"?"Submit alternate answer":"Submit answer"}</button>${enabled?"":'<p class="assessment-result">Complete the preceding lesson requirement first.</p>'}<div class="assessment-result" hidden></div></form>`;
  const form=target.querySelector("form");
  form?.addEventListener("submit",async(event)=>{event.preventDefault();const selected=new FormData(form).get(name);if(selected===null)return;const button=form.querySelector("button"),result=form.querySelector(".assessment-result:last-child");button.disabled=true;try{const response=await post("answer_"+kind,{choice:Number(selected)});if(!response)return;result.hidden=false;result.innerHTML=`<strong>${response.correct?"Correct.":"Not yet."}</strong> ${escapeHtml(response.rationale||response.message||"")}`;actionMessage.textContent=response.message||"";if(response.remediationRequired||response.completed||response.correct)setTimeout(()=>loadCourse(page.data.selectedAssignment.id),800);}catch(error){result.hidden=false;result.textContent="We could not record this answer. Please try again.";button.disabled=false;}});
}
function renderAssessments(){
  const selected=page.data.selectedAssignment,review=page.data.mode!=="student",contentReady=selected.viewedSections.length>=selected.sectionCount;
  renderAssessment($("#appliedAssessment"),page.data.assessments.applied,"applied",selected.appliedComplete,review||contentReady);renderAssessment($("#engagementAssessment"),page.data.assessments.engagement,"engagement",selected.engagementComplete,review||selected.appliedComplete);
  const needs=selected.remediationStatus==="required"||selected.remediationStatus==="content_viewed";$("#remediationSection").hidden=!needs;$("#remediationViewed").disabled=selected.remediationStatus==="content_viewed";renderAssessment($("#remediationAssessment"),page.data.assessments.remediation,"remediation",selected.remediationStatus==="satisfied",review||selected.remediationStatus==="content_viewed");
}
function setupSectionTracking(){
  page.observer?.disconnect();for(const timer of page.sectionTimers.values())clearTimeout(timer);page.sectionTimers.clear();const viewed=new Set(page.data.selectedAssignment.viewedSections);
  document.querySelectorAll(".section-marker").forEach((marker)=>{const section=Number(marker.dataset.section);if(viewed.has(section))marker.dataset.recorded="true";});
  if(page.data.mode!=="student")return;
  page.observer=new IntersectionObserver((entries)=>{for(const entry of entries){const section=Number(entry.target.dataset.section);if(viewed.has(section))continue;if(entry.isIntersecting){if(page.sectionTimers.has(section))continue;page.sectionTimers.set(section,setTimeout(async()=>{try{await post("section_viewed",{section});viewed.add(section);entry.target.dataset.recorded="true";page.data.selectedAssignment.viewedSections=Array.from(viewed);renderStatus();renderAssessments();}catch(error){console.error(error);}page.sectionTimers.delete(section);},3500));}else if(page.sectionTimers.has(section)){clearTimeout(page.sectionTimers.get(section));page.sectionTimers.delete(section);}}},{rootMargin:"0px 0px -45% 0px",threshold:0});
  document.querySelectorAll(".section-marker").forEach((marker)=>page.observer.observe(marker));
}
async function renderLesson(){
  const selected=page.data.selectedAssignment;$("#assignmentNumber").textContent=`Lesson assignment ${String(selected.sequence).padStart(2,"0")} of 15`;$("#assignmentTitle").textContent=selected.title;document.title=selected.title+" | StateCourse";
  const response=await fetch(selected.contentPath,{headers:{accept:"text/markdown"},cache:"no-store"});if(!response.ok)throw new Error("lesson_content_unavailable");$("#lessonBody").innerHTML=renderMarkdown(await response.text());setupSectionTracking();renderAssessments();
  const previous=page.data.assignments[selected.sequence-2],next=page.data.assignments[selected.sequence];$("#previousAssignment").disabled=!previous?.accessible;$("#previousAssignment").dataset.assignment=previous?.id||"";$("#nextAssignment").disabled=!next?.accessible;$("#nextAssignment").dataset.assignment=next?.id||"";
}
function renderMode(){const banner=$("#reviewBanner");banner.hidden=!page.data.reviewNotice;banner.textContent=page.data.reviewNotice||"";$("#requestHelp").hidden=page.data.mode!=="student";if(page.data.enrollment.qaOnly)actionMessage.textContent="QA non-credit enrollment. Activity is test data and cannot award California pre-license credit.";}
async function loadCourse(assignment=page.assignment){
  if(!page.enrollmentId){location.replace("/student/");return;}message.hidden=false;message.classList.remove("error");message.textContent="Opening your California course record…";shell.hidden=true;
  try{const url="/api/student/course?enrollment_id="+encodeURIComponent(page.enrollmentId)+(assignment?"&assignment="+encodeURIComponent(assignment):"");const response=await fetch(url,{credentials:"same-origin",headers:{accept:"application/json"}});if(response.status===401){location.replace("/student/sign-in/?return_to="+encodeURIComponent(location.pathname+location.search));return;}const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"course_unavailable");page.data=data;page.assignment=data.selectedAssignment.id;page.sessionId=crypto.randomUUID();const nextUrl=new URL(location.href);nextUrl.searchParams.set("enrollment_id",page.enrollmentId);nextUrl.searchParams.set("assignment",page.assignment);history.replaceState({},"",nextUrl);renderRail();renderStatus();renderMode();await renderLesson();message.hidden=true;shell.hidden=false;$("#lessonContent").focus({preventScroll:true});startHeartbeat();}
  catch(error){console.error(error);message.textContent=error.message==="california_enrollment_not_found"?"This is not a California course enrollment. Return to My StateCourse and select a California course.":"Your California course is temporarily unavailable. Confirm that migration 004 has been applied, then try again.";message.classList.add("error");}
}
async function sendHeartbeat(){
  if(!page.data)return;const idleSeconds=Math.floor((Date.now()-page.lastInteraction)/1000),visible=document.visibilityState==="visible",focused=document.hasFocus();$("#timerState").textContent=!visible||!focused?"Paused while this course page is not active.":idleSeconds>=120?"Paused after inactivity. Interact with the lesson to resume.":"Active study is being recorded.";
  try{const result=await post("heartbeat",{sessionId:page.sessionId,visible,focused,idleSeconds,userAgent:navigator.userAgent});if(result?.creditedSeconds&&page.data.mode==="student"){page.data.selectedAssignment.activeSeconds+=result.creditedSeconds;$("#activeTime").textContent=formatDuration(page.data.selectedAssignment.activeSeconds);}}catch(error){$("#timerState").textContent="Connection interrupted. Study time is paused until the record reconnects.";}
}
function startHeartbeat(){clearInterval(page.heartbeat);sendHeartbeat();page.heartbeat=setInterval(sendHeartbeat,15000);}
function navigateAssignment(id){if(!id)return;page.assignment=id;window.scrollTo({top:0,behavior:"smooth"});loadCourse(id);}

$("#assignmentList").addEventListener("click",(event)=>navigateAssignment(event.target.closest("[data-assignment]:not(:disabled)")?.dataset.assignment));$("#previousAssignment").addEventListener("click",(event)=>navigateAssignment(event.currentTarget.dataset.assignment));$("#nextAssignment").addEventListener("click",(event)=>navigateAssignment(event.currentTarget.dataset.assignment));
$("#remediationViewed").addEventListener("click",async()=>{try{await post("remediation_content_viewed");await loadCourse(page.assignment);}catch(error){actionMessage.textContent="We could not record the remediation review. Please try again.";}});
$("#requestHelp").addEventListener("click",async()=>{try{await post("help_requested",{concept:page.data.selectedAssignment.title});actionMessage.textContent="Your help request is now in the instructor remediation queue.";$("#requestHelp").disabled=true;}catch(error){actionMessage.textContent="We could not send the help request. Please try again.";}});
$("#signOut").addEventListener("click",async()=>{await fetch("/api/student/session",{method:"DELETE",credentials:"same-origin"}).catch(()=>null);location.replace("/student/sign-in/");});
for(const eventName of["pointerdown","keydown","scroll","touchstart"])addEventListener(eventName,()=>{page.lastInteraction=Date.now();},{passive:true});
document.addEventListener("visibilitychange",sendHeartbeat);addEventListener("focus",()=>{page.lastInteraction=Date.now();sendHeartbeat();});addEventListener("blur",sendHeartbeat);
loadCourse();
