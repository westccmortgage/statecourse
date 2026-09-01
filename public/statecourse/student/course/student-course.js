const page={enrollmentId:new URLSearchParams(location.search).get("enrollment_id")||"",assignment:new URLSearchParams(location.search).get("assignment")||"",data:null,sessionId:crypto.randomUUID(),lastInteraction:Date.now(),heartbeat:null,observer:null,sectionTimers:new Map()};
const $=(selector)=>document.querySelector(selector);
const message=$("#courseMessage"),shell=$("#courseShell"),actionMessage=$("#actionMessage");

function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function sentenceCase(text){return String(text??"").replace(/[A-Za-z]/,(letter)=>letter.toUpperCase());}
function titleCaseHeading(text){
  const minor=new Set(["a","an","and","as","at","but","by","for","from","in","into","nor","of","on","or","over","per","the","to","via","with"]),known=new Map([["dre","DRE"],["mls","MLS"],["hoa","HOA"],["fha","FHA"],["va","VA"],["apr","APR"],["tila","TILA"],["respa","RESPA"],["cfpb","CFPB"]]);
  const source=String(text??""),words=source.match(/[A-Za-z][A-Za-z'’-]*/g)||[];let index=0;
  return source.replace(/[A-Za-z][A-Za-z'’-]*/g,(word)=>{const lower=word.toLowerCase(),position=index++;if(known.has(lower))return known.get(lower);if(/^[A-Z0-9]{2,}$/.test(word))return word;if(position>0&&position<words.length-1&&minor.has(lower))return lower;return lower.replace(/(^|-)([a-z])/g,(_,prefix,letter)=>prefix+letter.toUpperCase());});
}
function inline(text){
  const code=[];
  return escapeHtml(text)
    .replace(/`([^`]+)`/g,(_,body)=>{code.push(body);return "\u0001"+(code.length-1)+"\u0001";})
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>")
    .replace(/\u0001(\d+)\u0001/g,(_,index)=>"<code>"+code[Number(index)]+"</code>");
}
function renderMarkdown(markdown){
  const lines=String(markdown||"").replace(/\r/g,"").split("\n"),output=[];
  let paragraph=[],list=[],ordered=[],quote=[],table=[],metadata=[],tracked=0,primaryHeadingSeen=false;
  const flushParagraph=()=>{if(paragraph.length){output.push("<p>"+inline(sentenceCase(paragraph.join(" ")))+"</p>");paragraph=[];}};
  const flushList=()=>{if(list.length){output.push("<ul>"+list.map((item)=>"<li>"+inline(sentenceCase(item))+"</li>").join("")+"</ul>");list=[];}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter((row)=>!row.every((cell)=>/^:?-+:?$/.test(cell)));if(rows.length)output.push('<div class="table-wrap"><table><thead><tr>'+rows[0].map((cell)=>"<th>"+inline(titleCaseHeading(cell))+"</th>").join("")+"</tr></thead><tbody>"+rows.slice(1).map((row)=>"<tr>"+row.map((cell)=>"<td>"+inline(sentenceCase(cell))+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>");table=[];};
  const flushOrdered=()=>{if(ordered.length){output.push("<ol>"+ordered.map((item)=>"<li>"+inline(sentenceCase(item))+"</li>").join("")+"</ol>");ordered=[];}};
  const flushQuote=()=>{if(quote.length){output.push("<blockquote><p>"+inline(sentenceCase(quote.join(" ")))+"</p></blockquote>");quote=[];}};
  const flushMetadata=()=>{if(metadata.length){output.push('<dl class="lesson-metadata">'+metadata.map(({label,value})=>`<div><dt>${inline(titleCaseHeading(label))}</dt><dd>${inline(sentenceCase(value))}</dd></div>`).join("")+"</dl>");metadata=[];}};
  const flushText=()=>{flushParagraph();flushList();flushOrdered();flushQuote();};
  const flush=()=>{flushText();flushTable();flushMetadata();};
  for(const raw of lines){
    const line=raw.trim();
    if(line.startsWith("|")&&line.endsWith("|")){flushText();table.push(line.slice(1,-1).split("|").map((cell)=>cell.trim()));continue;}
    if(table.length)flushTable();
    if(!line){flushText();continue;}
    if(/^(-{3,}|\*{3,}|_{3,})$/.test(line)){flush();output.push("<hr>");continue;}
    const quoted=line.match(/^>\s?(.*)$/);
    if(quoted){flushParagraph();flushList();flushOrdered();if(quoted[1])quote.push(quoted[1]);continue;}
    if(quote.length)flushQuote();
    const metadataLine=line.match(/^\*\*([^:*]+):\*\*\s*(.+)$/);
    if(metadataLine){flushText();metadata.push({label:metadataLine[1],value:metadataLine[2]});continue;}
    if(metadata.length)flushMetadata();
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    if(heading){flush();const level=heading[1].length;if(level===1)continue;if(level===2&&!primaryHeadingSeen){primaryHeadingSeen=true;continue;}const isTracked=level===2&&/^\d+\./.test(heading[2])&&tracked<6;if(isTracked)tracked+=1;output.push(`<h${level}${isTracked?` class="section-marker" data-section="${tracked}"`:""}>${inline(titleCaseHeading(heading[2]))}</h${level}>`);continue;}
    if(/^[-*]\s+/.test(line)){flushParagraph();flushOrdered();list.push(line.replace(/^[-*]\s+/,""));continue;}
    if(/^\d+[.)]\s+/.test(line)){flushParagraph();flushList();ordered.push(line.replace(/^\d+[.)]\s+/,""));continue;}
    flushList();flushOrdered();
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
  $("#courseTitle").textContent=course.title;$("#drawerCourseTitle").textContent=course.title;$("#courseMeta").textContent=`45-hour correspondence course · Version ${course.version}`;$("#courseProgressBar").style.width=progress.percent+"%";$("#courseProgressText").textContent=`Course progress: ${progress.completed} / ${progress.total} assignments completed`;$("#toolbarAssignmentLabel").textContent=`${progress.completed} / ${progress.total}`;
  $("#assignmentList").innerHTML=assignments.map((item)=>`<li><button class="assignment-link" type="button" data-assignment="${escapeHtml(item.id)}" ${item.accessible?"":"disabled"} aria-current="${item.id===selectedAssignment.id}"><span class="number">${String(item.sequence).padStart(2,"0")}</span><span><strong>${escapeHtml(titleCaseHeading(item.title))}</strong><small class="state">${assignmentStatusLabel(item)}</small></span></button></li>`).join("");
}
function requirement(element,complete,completeText="Complete",pendingText="Pending"){element.textContent=complete?completeText:pendingText;element.className=complete?"complete":"pending";}
function renderStatus(){
  const selected=page.data.selectedAssignment;$("#statusHeading").textContent=`Assignment ${String(selected.sequence).padStart(2,"0")}`;$("#activeTime").textContent=formatDuration(selected.activeSeconds);$("#toolbarProgressLabel").textContent=formatDuration(selected.activeSeconds);$("#sectionStatus").textContent=`${selected.viewedSections.length} / ${selected.sectionCount}`;$("#sectionStatus").className=selected.viewedSections.length>=selected.sectionCount?"complete":"pending";requirement($("#appliedStatus"),selected.appliedComplete);requirement($("#engagementStatus"),selected.engagementComplete);
  const remediation=selected.remediationStatus;$("#remediationStatus").textContent=remediation==="not_required"?"Not required":remediation==="satisfied"?"Complete":remediation==="content_viewed"?"Alternate question pending":"Required";$("#remediationStatus").className=remediation==="not_required"||remediation==="satisfied"?"complete":"pending";
  const eligibility=page.data.progress.eligibility;$("#earliestFinal").textContent=formatDate(eligibility?.earliest_final_exam_at);const remaining=Array.isArray(eligibility?.remaining_requirements)?eligibility.remaining_requirements:[];$("#finalRequirements").textContent=remaining.length?remaining.join(" · "):"Final eligibility requirements complete";
  renderFinalExamLink();renderNotices();
}
/* The link appears only once the engine says the examination is open. A student who is
   not eligible is not shown a door that will refuse them. */
function renderFinalExamLink(){
  const link=$("#finalExamLink"),final=page.data.finalExam;
  if(!link)return;
  const open=page.data.mode==="student"&&Boolean(final?.eligible);
  link.hidden=!open;
  if(open&&final.href)link.href=final.href;
}
/* RE 303 requires the school to notify each student that the Department's online course
   and instructor evaluation exists. The notice text and its version come from the
   server so that one wording is delivered, recorded, and displayed. */
function renderNotices(){
  const panel=$("#regulatoryNotices"),notices=Array.isArray(page.data.regulatoryNotices)?page.data.regulatoryNotices:[];
  if(!panel)return;
  panel.hidden=notices.length===0;
  panel.innerHTML=notices.map((notice)=>`<h3>${escapeHtml(notice.heading)}</h3><p>${escapeHtml(notice.body)}${notice.linkHref?` <a href="${escapeHtml(notice.linkHref)}" target="_blank" rel="noopener">${escapeHtml(notice.linkLabel||"Open")} ↗</a>`:""}</p>`).join("");
}
function assessmentLabel(kind,count){
  if(kind==="applied")return"Submit applied response";
  return kind==="remediation"?`Submit alternate answers (${count})`:`Submit answers (${count})`;
}
function renderAssessment(target,assessment,kind,complete,enabled,blockedMessage){
  if(complete){target.innerHTML='<p class="assessment-result"><strong>Complete.</strong> This requirement is recorded for the assignment version.</p>';return;}
  if(!assessment||!assessment.items?.length){target.innerHTML="";return;}
  const items=assessment.items,total=items.length;
  const threshold=kind==="applied"?"":`<p class="assessment-standard">${total} scored items · ${assessment.passingPercent}% required to complete this check.</p>`;
  target.innerHTML=`<form data-kind="${kind}">${threshold}${items.map((item,position)=>`<fieldset ${enabled?"":"disabled"} data-item="${escapeHtml(item.id)}"><legend>${total>1?`<span class="item-number">Question ${position+1} of ${total}</span>`:""}${escapeHtml(item.prompt)}</legend>${item.choices.map((choice,index)=>`<label class="choice"><input type="radio" name="${escapeHtml(item.id)}" value="${index}" required><span>${escapeHtml(choice)}</span></label>`).join("")}<p class="item-result" hidden></p></fieldset>`).join("")}<button type="submit" ${enabled?"":"disabled"}>${assessmentLabel(kind,total)}</button>${enabled?"":`<p class="assessment-result">${escapeHtml(blockedMessage||"Complete the preceding lesson requirement first.")}</p>`}<div class="assessment-result" hidden></div></form>`;
  const form=target.querySelector("form");
  form?.addEventListener("submit",async(event)=>{
    event.preventDefault();
    const data=new FormData(form),answers=items.map((item)=>data.get(item.id));
    if(answers.some((answer)=>answer===null))return;
    const button=form.querySelector("button"),result=form.querySelector(".assessment-result:last-child");
    button.disabled=true;
    try{
      const response=await post("answer_"+kind,{answers:answers.map(Number)});
      if(!response)return;
      /* Per-item feedback marks which questions were missed. Rationales arrive only on a
         passing attempt; on a failed attempt the student is routed to remediation. */
      for(const outcome of response.results||[]){
        const field=form.querySelector(`[data-item="${CSS.escape(outcome.itemId)}"] .item-result`);
        if(!field)continue;
        field.hidden=false;
        field.className="item-result "+(outcome.correct?"correct":"incorrect");
        field.innerHTML=`<strong>${outcome.correct?"Correct.":"Incorrect."}</strong> ${escapeHtml(outcome.rationale||"")}`;
      }
      result.hidden=false;
      const scoreLine=typeof response.percent==="number"&&response.total>1?`${response.correctCount} of ${response.total} correct (${response.percent}%). `:"";
      result.innerHTML=`<strong>${response.correct?"Requirement met.":"Not yet."}</strong> ${escapeHtml(scoreLine)}${escapeHtml(response.message||"")}`;
      actionMessage.textContent=response.message||"";
      if(response.remediationRequired||response.completed||response.correct)setTimeout(()=>loadCourse(page.data.selectedAssignment.id),1400);
    }catch(error){result.hidden=false;result.textContent="We could not record these answers. Please try again.";button.disabled=false;}
  });
}
/* The SB 1495 interactive participatory component.
   DRE's FAQ requires the applicant to "role play as both a consumer and real estate
   professional". The panel renders one box per role, shows which have been submitted, and
   never renders a submitted response back into an editable box — the submission is evidence
   of what the student wrote at the time, not a draft. */
function renderParticipatory(){
  const panel=$("#participatorySection"),data=page.data.participatory;
  if(!panel)return;
  if(!data||page.data.selectedAssignment.id!==data.assignmentId){panel.hidden=true;return;}
  panel.hidden=false;
  const review=page.data.mode!=="student";
  const selected=page.data.selectedAssignment;
  const ready=selected.viewedSections.length>=selected.sectionCount;
  $("#participatoryRoles").innerHTML=data.roles.map((role)=>{
    if(role.submitted)return`<div class="participatory-role complete"><h4>Role: ${escapeHtml(role.label)}</h4><p class="participatory-state complete">✓ Submitted and recorded</p></div>`;
    if(review)return`<div class="participatory-role"><h4>Role: ${escapeHtml(role.label)}</h4><p class="participatory-state">Review mode — reviewer submissions are not recorded against a student record.</p></div>`;
    if(!ready)return`<div class="participatory-role"><h4>Role: ${escapeHtml(role.label)}</h4><p class="participatory-state pending">Read the lesson, including section ${escapeHtml(role.section)}, to unlock this submission.</p></div>`;
    return`<div class="participatory-role"><h4>Role: ${escapeHtml(role.label)}</h4>
      <p class="participatory-state pending">Section ${escapeHtml(role.section)} sets out the scenario and the questions to address.</p>
      <textarea id="participatory-${escapeHtml(role.id)}" rows="10" aria-label="Your response in the ${escapeHtml(role.label)} role" placeholder="Write from inside this position, addressing each question in the lesson section."></textarea>
      <p class="participatory-minimum">At least ${data.minimumCharacters} characters.</p>
      <button type="button" data-role="${escapeHtml(role.id)}" class="participatory-submit">Submit ${escapeHtml(role.label)} response</button>
      <p class="participatory-result" data-result="${escapeHtml(role.id)}" hidden></p></div>`;
  }).join("");
  for(const button of document.querySelectorAll(".participatory-submit")){
    button.addEventListener("click",async()=>{
      const role=button.dataset.role;
      const box=$("#participatory-"+role),result=document.querySelector(`[data-result="${role}"]`);
      const response=String(box.value||"").trim();
      result.hidden=false;
      if(response.length<data.minimumCharacters){result.textContent=`Please write at least ${data.minimumCharacters} characters. You have ${response.length}.`;return;}
      button.disabled=true;result.textContent="Recording your response…";
      try{
        await post("sb1495_role_submitted",{participantRole:role,response});
        await loadCourse(page.data.selectedAssignment.id);
      }catch(error){
        button.disabled=false;
        result.textContent=error.message==="sb1495_response_too_short"
          ?"That response is too short to be recorded."
          :"We could not record your response. Please try again.";
      }
    });
  }
}
function renderAssessments(){
  const selected=page.data.selectedAssignment,review=page.data.mode!=="student",contentReady=selected.viewedSections.length>=selected.sectionCount;
  const viewed=selected.viewedSections.length,sections=selected.sectionCount,remainingSections=Math.max(0,sections-viewed);
  const appliedBlocked=`Read the lesson to unlock this exercise. You have viewed ${viewed} of ${sections} sections — ${remainingSections} remaining.`;
  const engagementBlocked="Submit the applied exercise above to unlock the scored check.";
  renderParticipatory();
  renderAssessment($("#appliedAssessment"),page.data.assessments.applied,"applied",selected.appliedComplete,review||contentReady,appliedBlocked);renderAssessment($("#engagementAssessment"),page.data.assessments.engagement,"engagement",selected.engagementComplete,review||selected.appliedComplete,engagementBlocked);
  const needs=selected.remediationStatus==="required"||selected.remediationStatus==="content_viewed";$("#remediationSection").hidden=!needs;$("#remediationViewed").disabled=selected.remediationStatus==="content_viewed";renderAssessment($("#remediationAssessment"),page.data.assessments.remediation,"remediation",selected.remediationStatus==="satisfied",review||selected.remediationStatus==="content_viewed","Review the remediation content above and mark it viewed to unlock the alternate questions.");
}
function setupSectionTracking(){
  page.observer?.disconnect();for(const timer of page.sectionTimers.values())clearTimeout(timer);page.sectionTimers.clear();const viewed=new Set(page.data.selectedAssignment.viewedSections);
  document.querySelectorAll(".section-marker").forEach((marker)=>{const section=Number(marker.dataset.section);if(viewed.has(section))marker.dataset.recorded="true";});
  if(page.data.mode!=="student")return;
  page.observer=new IntersectionObserver((entries)=>{for(const entry of entries){const section=Number(entry.target.dataset.section);if(viewed.has(section))continue;if(entry.isIntersecting){if(page.sectionTimers.has(section))continue;page.sectionTimers.set(section,setTimeout(async()=>{try{await post("section_viewed",{section});viewed.add(section);entry.target.dataset.recorded="true";page.data.selectedAssignment.viewedSections=Array.from(viewed);renderStatus();renderAssessments();}catch(error){console.error(error);}page.sectionTimers.delete(section);},3500));}else if(page.sectionTimers.has(section)){clearTimeout(page.sectionTimers.get(section));page.sectionTimers.delete(section);}}},{rootMargin:"0px 0px -45% 0px",threshold:0});
  document.querySelectorAll(".section-marker").forEach((marker)=>page.observer.observe(marker));
}
async function renderLesson(){
  const selected=page.data.selectedAssignment,displayTitle=titleCaseHeading(selected.title);$("#assignmentNumber").textContent=`Lesson assignment ${String(selected.sequence).padStart(2,"0")} of 15`;$("#assignmentTitle").textContent=displayTitle;document.title=displayTitle+" | StateCourse";
  const response=await fetch(selected.contentPath,{headers:{accept:"text/markdown"},cache:"no-store"});if(!response.ok)throw new Error("lesson_content_unavailable");$("#lessonBody").innerHTML=renderMarkdown(await response.text());setupSectionTracking();renderAssessments();
  const previous=page.data.assignments[selected.sequence-2],next=page.data.assignments[selected.sequence];$("#previousAssignment").disabled=!previous?.accessible;$("#previousAssignment").dataset.assignment=previous?.id||"";$("#nextAssignment").disabled=!next?.accessible;$("#nextAssignment").dataset.assignment=next?.id||"";
}
function renderMode(){const banner=$("#reviewBanner");banner.hidden=!page.data.reviewNotice;banner.textContent=page.data.reviewNotice||"";$("#requestHelp").hidden=page.data.mode!=="student";if(page.data.enrollment.qaOnly)actionMessage.textContent="QA non-credit enrollment. Activity is test data and cannot award California pre-license credit.";}
async function loadCourse(assignment=page.assignment){
  if(!page.enrollmentId){location.replace("/student/");return;}message.hidden=false;message.classList.remove("error");message.textContent="Opening your California course record…";shell.hidden=true;
  try{const url="/api/student/course?enrollment_id="+encodeURIComponent(page.enrollmentId)+(assignment?"&assignment="+encodeURIComponent(assignment):"");const response=await fetch(url,{credentials:"same-origin",headers:{accept:"application/json"}});if(response.status===401){location.replace("/student/sign-in/?return_to="+encodeURIComponent(location.pathname+location.search));return;}const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"course_unavailable");page.data=data;page.assignment=data.selectedAssignment.id;
    /* CA-BLOCK-1: assignments delivered as learning blocks open in the block player — one
       instructional screen at a time. Reviewer accounts keep this page's full-document view. */
    if(data.selectedAssignment.blockDelivery&&data.selectedAssignment.blockPlayerHref&&data.mode==="student"){location.replace(data.selectedAssignment.blockPlayerHref);return;}
    page.sessionId=crypto.randomUUID();const nextUrl=new URL(location.href);nextUrl.searchParams.set("enrollment_id",page.enrollmentId);nextUrl.searchParams.set("assignment",page.assignment);history.replaceState({},"",nextUrl);renderRail();renderStatus();renderMode();await renderLesson();message.hidden=true;shell.hidden=false;$("#lessonContent").focus({preventScroll:true});startHeartbeat();}
  catch(error){console.error(error);message.textContent=error.message==="california_enrollment_not_found"?"This is not a California course enrollment. Return to My StateCourse and select a California course.":"Your California course is temporarily unavailable. Confirm that migration 004 has been applied, then try again.";message.classList.add("error");}
}
async function sendHeartbeat(){
  if(!page.data)return;const idleSeconds=Math.floor((Date.now()-page.lastInteraction)/1000),visible=document.visibilityState==="visible",focused=document.hasFocus();$("#timerState").textContent=!visible||!focused?"Paused while this course page is not active.":idleSeconds>=120?"Paused after inactivity. Interact with the lesson to resume.":"Active study is being recorded.";
  try{const result=await post("heartbeat",{sessionId:page.sessionId,visible,focused,idleSeconds,userAgent:navigator.userAgent});if(result?.creditedSeconds&&page.data.mode==="student"){page.data.selectedAssignment.activeSeconds+=result.creditedSeconds;const formatted=formatDuration(page.data.selectedAssignment.activeSeconds);$("#activeTime").textContent=formatted;$("#toolbarProgressLabel").textContent=formatted;}}catch(error){$("#timerState").textContent="Connection interrupted. Study time is paused until the record reconnects.";}
}
function startHeartbeat(){clearInterval(page.heartbeat);sendHeartbeat();page.heartbeat=setInterval(sendHeartbeat,15000);}
function navigateAssignment(id){if(!id)return;closeDrawers(false);page.assignment=id;window.scrollTo({top:0,behavior:"smooth"});loadCourse(id);}

let lastDrawerTrigger=null;
function closeDrawers(restoreFocus=true){
  $("#assignmentRail").hidden=true;$("#statusPanel").hidden=true;$("#drawerScrim").hidden=true;$("#assignmentToggle").setAttribute("aria-expanded","false");$("#progressToggle").setAttribute("aria-expanded","false");document.body.classList.remove("drawer-open");if(restoreFocus&&lastDrawerTrigger)lastDrawerTrigger.focus();lastDrawerTrigger=null;
}
function openDrawer(type,trigger){
  closeDrawers(false);const drawer=type==="assignments"?$("#assignmentRail"):$("#statusPanel"),toggle=type==="assignments"?$("#assignmentToggle"):$("#progressToggle");lastDrawerTrigger=trigger;drawer.hidden=false;$("#drawerScrim").hidden=false;toggle.setAttribute("aria-expanded","true");document.body.classList.add("drawer-open");drawer.querySelector(".drawer-close")?.focus();
}

$("#assignmentToggle").addEventListener("click",(event)=>openDrawer("assignments",event.currentTarget));$("#progressToggle").addEventListener("click",(event)=>openDrawer("progress",event.currentTarget));$("#assignmentClose").addEventListener("click",()=>closeDrawers());$("#progressClose").addEventListener("click",()=>closeDrawers());$("#drawerScrim").addEventListener("click",()=>closeDrawers());
$("#assignmentList").addEventListener("click",(event)=>navigateAssignment(event.target.closest("[data-assignment]:not(:disabled)")?.dataset.assignment));$("#previousAssignment").addEventListener("click",(event)=>navigateAssignment(event.currentTarget.dataset.assignment));$("#nextAssignment").addEventListener("click",(event)=>navigateAssignment(event.currentTarget.dataset.assignment));
$("#remediationViewed").addEventListener("click",async()=>{try{await post("remediation_content_viewed");await loadCourse(page.assignment);}catch(error){actionMessage.textContent="We could not record the remediation review. Please try again.";}});
$("#requestHelp").addEventListener("click",async()=>{try{await post("help_requested",{concept:page.data.selectedAssignment.title});actionMessage.textContent="Your help request is now in the instructor remediation queue.";$("#requestHelp").disabled=true;}catch(error){actionMessage.textContent="We could not send the help request. Please try again.";}});
$("#signOut").addEventListener("click",async()=>{await fetch("/api/student/session",{method:"DELETE",credentials:"same-origin"}).catch(()=>null);location.replace("/student/sign-in/");});
for(const eventName of["pointerdown","keydown","scroll","touchstart"])addEventListener(eventName,()=>{page.lastInteraction=Date.now();},{passive:true});
addEventListener("keydown",(event)=>{if(event.key==="Escape"&&!$("#drawerScrim").hidden)closeDrawers();});
document.addEventListener("visibilitychange",sendHeartbeat);addEventListener("focus",()=>{page.lastInteraction=Date.now();sendHeartbeat();});addEventListener("blur",sendHeartbeat);
loadCourse();
