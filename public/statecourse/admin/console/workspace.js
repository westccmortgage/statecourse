import { renderLessonMarkdown } from '/student/course/blocks/lesson-markdown.mjs';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=v=>String(v??'').replaceAll('_',' ');
const when=v=>v?new Date(v).toLocaleString():'Not recorded';
let session=null, data=null, workspace=null, selectedScreen=null, paymentOffset=0;
let courseRequest=0, screenRequest=0;
function money(amount,currency='USD') {
  const cents=Number(amount);
  if(amount==null||!Number.isSafeInteger(cents))return 'Not recorded';
  try{return new Intl.NumberFormat('en-US',{style:'currency',currency:String(currency).toUpperCase()}).format(cents/100);}catch{return 'Not recorded';}
}
const canEdit=()=>session?.roles.some(r=>['owner','administrator'].includes(r));
const canReview=()=>session?.roles.some(r=>['owner','administrator','instructor'].includes(r));
const isGlobal=()=>session?.bindings.some(b=>['owner','administrator'].includes(b.actorRole)&&!b.scopeState);
const isOwner=()=>session?.bindings.some(b=>b.actorRole==='owner'&&!b.scopeState);
async function api(view,params={}) {
  const viewer=session;
  const res=await fetch('/api/admin/workspace?'+new URLSearchParams({view,...params}),{credentials:'same-origin',cache:'no-store'});
  const body=await res.json();if(viewer!==session)throw new Error('Session changed. Reload the panel.');if(!res.ok)throw new Error(body.error||'Request failed');return body.result;
}
async function send(action,body={}) {
  const res=await fetch('/api/admin/workspace',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action,...body})});
  const result=await res.json();if(!res.ok)throw new Error(result.error||'Save failed');return result.result;
}
function message(text,error=false){const el=$('#workspaceMessage');el.textContent=text;el.classList.toggle('error',error);}
function table(headings,rows){return `<div class="table-wrap"><table class="data-table"><thead><tr>${headings.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(cells=>`<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headings.length}">No records.</td></tr>`}</tbody></table></div>`;}
function unavailable(name){return `<div class="empty-state"><h3>${esc(name)} unavailable</h3><p>The source could not be read. No empty or passing result has been assumed.</p><button type="button" data-work="refresh">Try again</button></div>`;}
function sourceNote(source){return source.truncated?'<p class="message">Showing the most recent 1,000 records. This is not a complete total.</p>':'';}
function panel(id){document.querySelector(`.tab[data-panel="${id}"]`)?.click();}
function courseOptions(){return (data?.datasets.courses.rows||[]).map(c=>`<option value="${esc(c.id)}">${esc(c.state)} · ${esc(c.name)}</option>`).join('');}

async function loadOverview(){
  data=await api('overview');
  const {courses,enrollments,videos,governance,tasks}=data.datasets;
  const inventory=data.inventory?.summary||{};
  const metric=value=>value==null?'Not verified':value;
  const count=(source,predicate=()=>true)=>source?.available&&!source.truncated?source.rows.filter(predicate).length:'Not verified';
  $('#overviewBody').innerHTML=`<div class="summary-grid">${[
    ['Catalog states',metric(inventory.catalogStates),'coursesPanel'],['Catalog courses',metric(inventory.catalogCourses),'coursesPanel'],['Database records',count(courses),'coursesPanel'],['Database states',metric(inventory.databaseStates),'coursesPanel'],['Training available',metric(inventory.availableTraining),'coursesPanel'],['Active enrollments',count(enrollments,r=>r.status==='active'),'studentsPanel'],['Review / non-credit enrollments',count(enrollments,r=>r.status==='qa_non_credit'),'studentsPanel'],['Console video assets',count(videos),'videoPanel'],['Open tasks',count(tasks,r=>r.status!=='closed'),'tasksPanel']
  ].map(([name,value,target])=>`<button class="stat" type="button" data-work="navigate" data-target="${target}"><span>${name}</span><strong>${esc(value)}</strong></button>`).join('')}</div>
  <div class="overview-columns"><article class="card"><h3>Sources and availability</h3>${Object.entries(data.datasets).map(([key,source])=>`<p class="source-line"><span>${esc(words(key))}</span><strong class="${source.available&&!source.truncated?'agrees':'error'}">${source.available?(source.truncated?'Partial result':'Connected'):'Not verified'}</strong></p>`).join('')}</article>
  <article class="card"><h3>Training and payment decisions</h3><p>Approval, free access and payment mode are independent decisions for each offering.</p>${governance.available?`<p>${governance.rows.filter(g=>g.training_access_enabled).length} recorded offerings allow free training.</p><p>${governance.rows.filter(g=>g.live_charging_permitted).length} recorded offerings permit live charging. Site payment settings still apply.</p>`:unavailable('Offering decisions')}<button type="button" data-work="navigate" data-target="offeringsPanel">Open decisions</button></article></div>
  <p class="note">Updated ${esc(when(data.checkedAt))}. Catalog totals describe published course records. Database totals include ${esc(metric(inventory.databaseServices))} service records. Training available counts courses with connected delivery and recorded free access; it is not an approval count.</p>`;
  renderCourses();renderStudents();renderTasks();
}
function renderCourses(){
  const source=data.datasets.courses;
  const inventory=data.inventory;
  if(!inventory&&!source.available){$('#courseList').innerHTML=unavailable('Courses');return;}
  const all=inventory?.rows||source.rows.map(c=>({...c,databaseId:c.id,approval:c.approval_status,trainingStatus:c.trainingReadiness?.ready?'closed':'connection_incomplete'}));
  const search=$('#courseSearch').value.toLowerCase(),state=$('#courseState').value;
  $('#courseState').innerHTML='<option value="">All states</option>'+[...new Set(all.map(c=>c.state))].sort().map(s=>`<option>${esc(s)}</option>`).join('');$('#courseState').value=state;
  const labels={available:'Available for free training',closed:'Training closed',connection_incomplete:'Learning connection incomplete',registration_needed:'Database registration needed',not_verified:'Not verified',service:'Service / tool'};
  const rows=all.filter(c=>(!state||c.state===state)&&`${c.name} ${c.id} ${c.publicId||''}`.toLowerCase().includes(search));
  const pending=all.filter(c=>c.trainingStatus==='registration_needed');
  const registration=isOwner()&&inventory?.publicAvailable&&inventory?.databaseAvailable&&pending.length?`<div class="card"><h3>Connect catalog records</h3><p>${pending.length} existing public courses have no database record. Registering them creates closed course records for administration. Learning access requires a connected course engine and a separate decision.</p><button type="button" data-work="register-catalog">Register ${pending.length} catalog courses</button></div>`:'';
  const notice=inventory&&!inventory.publicAvailable?'<p class="message error">Public catalog unavailable. The list below is incomplete.</p>':'';
  $('#courseList').innerHTML=notice+registration+sourceNote(source)+`<p>${rows.length} records shown. A catalog listing is separate from a connected learning course.</p>`+table(['Course','State','Course connection','Recorded approval','Payments',''],rows.map(c=>{
    const actions=c.databaseId?`<button type="button" data-work="course" data-id="${esc(c.databaseId)}">Open course</button> <button type="button" data-work="course-decisions" data-id="${esc(c.databaseId)}">Training &amp; payments</button>`:/^\/[a-z0-9/_-]+\/$/i.test(c.route||'')?`<a href="${esc(c.route)}">Course page</a>`:'Registration pending';
    return [`<strong>${esc(c.name)}</strong><small>${esc(c.id)}</small>${c.publicId&&c.publicId!==c.id?`<small>Public catalog: ${esc(c.publicId)}</small>`:''}`,esc(c.state),esc(labels[c.trainingStatus]||'Not verified'),esc(words(c.approval||'No recorded decision')),esc(words(c.paymentMode||'No recorded decision')),actions];
  }));
}

async function openCourse(id){
  const request=++courseRequest;++screenRequest;
  const result=await api('course',{course_id:id});if(request!==courseRequest)return;
  workspace=result;selectedScreen=null;
  const w=workspace;
  $('#courseWorkspace').hidden=false;
  $('#courseWorkspace').innerHTML=`<div class="panel-heading"><div><p class="eyebrow">${esc(w.course.state)} · Course workspace</p><h2>${esc(w.course.name)}</h2></div><button type="button" class="secondary-button" data-work="close-course">Close course</button></div>
    <div class="course-subnav"><button type="button" data-work="course-tab" data-target="contentEditor">Content</button><button type="button" data-work="course-tab" data-target="courseRules">Learning rules</button><button type="button" data-work="course-tab" data-target="courseReview">Review & publish</button><button type="button" data-work="course-tab" data-target="courseVersions">Versions</button></div>
    ${!w.storageAvailable?'<p class="message error">Draft storage is not available. Published course structure can be inspected; saving, reviewing and publishing are unavailable.</p>':''}
    <section id="contentEditor" class="course-section"><div class="editor-layout"><nav class="lesson-tree" aria-label="Lessons">${w.structure.units.map(u=>`<details><summary>${esc(u.title)}</summary>${u.blocks.map(b=>`<p class="tree-block">${esc(b.title)}</p>${b.screens.map(s=>`<button type="button" data-work="screen" data-unit="${esc(u.id)}" data-screen="${esc(s.id)}">${esc(s.title)}<small>${esc(s.type)}</small></button>`).join('')}`).join('')}</details>`).join('')||'<p>No student delivery is registered for this course.</p>'}</nav><div id="screenEditor" class="card"><h3>Select a lesson screen</h3><p>Instruction and review text can be drafted and previewed here. Existing exercises and retrieval questions retain their registered learning rules.</p></div></div></section>
    <section id="courseRules" class="course-section" hidden><h3>Registered learning rules</h3><p class="note">These are the current engine rules. Editing regulatory rules and question banks is not implemented in this workspace.</p>${table(['Setting','Value'],Object.entries(w.structure.rules||{}).filter(([,v])=>typeof v!=='object').map(([k,v])=>[esc(k),esc(v)]))}</section>
    <section id="courseReview" class="course-section" hidden><div class="overview-columns"><article class="card"><h3>Review saved draft</h3><p>${w.draft?`Revision ${w.draft.revision} · ${w.draft.payload.overrides.length} edited screens`:'No saved draft.'}</p><form id="courseReviewForm"><label>Review basis<textarea name="note" minlength="10" required></textarea></label><label>Outcome<select name="outcome"><option value="pass">Pass — I reviewed this version</option><option value="fail">Needs correction</option></select></label><button ${!w.draft||!w.storageAvailable||!canReview()?'disabled':''}>Record review</button></form></article>
    <article class="card"><h3>Publish for new enrollments</h3><p>Existing students keep their current content version. This publishes text changes only; it does not change approval, price, progress or course rules.</p><form id="coursePublishForm"><label>Publication reason<textarea name="note" minlength="10" required></textarea></label><button ${!w.draft||!w.storageAvailable||!canEdit()?'disabled':''}>Publish reviewed draft</button></form></article></div>
    ${table(['Reviewed','Outcome','Basis'],w.reviews.map(r=>[esc(when(r.reviewed_at)),esc(r.outcome),esc(r.note)]))}</section>
    <section id="courseVersions" class="course-section" hidden><h3>Publication history</h3>${table(['Published','Version','Reason'],w.releases.map(r=>[esc(when(r.published_at)),esc(r.id),esc(r.note)]))}</section>`;
  $('#courseWorkspace').scrollIntoView({block:'start',behavior:'smooth'});
}
async function openScreen(unitId,screenId){
  const request=++screenRequest,current=workspace;
  const unit=workspace.structure.units.find(u=>u.id===unitId),screen=unit?.blocks.flatMap(b=>b.screens).find(s=>s.id===screenId);
  if(!screen)return;
  const override=workspace.draft?.payload.overrides.find(o=>o.deliveryId===unitId&&o.screenId===screenId);
  let text=override;
  if(!text&&screen.content)text=await api('screen',{course_id:workspace.course.id,delivery_id:unitId,screen_id:screenId});
  if(request!==screenRequest||workspace!==current)return;
  selectedScreen={unitId,screenId};
  const editable=['instruction','review'].includes(screen.type)&&workspace.storageAvailable&&canEdit();
  $('#screenEditor').innerHTML=`<p class="eyebrow">${esc(screen.type)} · ${esc(screen.id)}</p><form id="screenDraftForm"><label>Title<input name="title" value="${esc(text?.title||screen.title)}" minlength="3" maxlength="200" required ${editable?'':'readonly'}></label>
    ${text?`<label>Lesson text<textarea name="bodyMarkdown" rows="15" minlength="20" maxlength="60000" ${editable?'':'readonly'}>${esc(text.bodyMarkdown)}</textarea></label>`:'<p>This screen uses the registered assessment engine. Its question and scoring are not editable here.</p>'}
    <div class="gate-actions"><button ${editable?'':'disabled'}>Save draft</button><button type="button" class="secondary-button" data-work="preview-text">Preview as student</button></div></form><article id="textPreview" class="lesson-preview" hidden></article>`;
}
function renderStudents(){
  const source=data.datasets.enrollments;
  if(!source.available){$('#studentsBody').innerHTML=unavailable('Enrollments');return;}
  const people=new Map((data.datasets.people?.rows||[]).map(p=>[p.id,p]));
  const access=new Map();for(const entry of data.datasets.recentAccess?.rows||[])if(!access.has(entry.enrollment_id))access.set(entry.enrollment_id,entry.occurred_at);
  const filter=$('#studentSearch').value.toLowerCase();
  const rows=source.rows.filter(e=>{const p=people.get(e.student_id);return `${p?.email||''} ${p?.first_name||''} ${p?.last_name||''} ${e.course_id} ${e.id} ${e.student_id}`.toLowerCase().includes(filter);});
  $('#studentsBody').innerHTML=sourceNote(source)+table(['Student','Course','Enrollment','Status','Last recorded course access',''],rows.map(e=>{
    const person=people.get(e.student_id),name=[person?.first_name,person?.last_name].filter(Boolean).join(' '),last=access.get(e.id)||e.last_course_accessed_at;
    return [`<strong>${esc(person?.email||e.student_id)}</strong><small>${esc(name)}</small>`,esc(data.datasets.courses.rows.find(c=>c.id===e.course_id)?.name||e.course_id),`<small>${esc(e.id)}</small>`,esc(e.status),last?esc(when(last)):data.datasets.recentAccess?.available?'No recent record':'Not verified',`<button type="button" data-work="student" data-id="${esc(e.id)}">Open student</button>`];
  }));
}
async function openStudent(id){
  const s=await api('student',{enrollment_id:id});
  $('#studentDetail').hidden=false;
  $('#studentDetail').innerHTML=`<h3>${esc(s.student?.email||'Student identity unavailable')}</h3><p>${esc(s.enrollment.course_id)} · ${esc(s.enrollment.status)}</p><p>Course version: ${esc(s.enrollment.course_version)}. Content release: ${esc(s.enrollment.console_content_release_id||'Registered course content')}.</p><p>${s.progress?`${s.progress.completed} / ${s.progress.total} required blocks mastered against the current registered structure. Historical version comparison has not been verified.`:'Progress could not be calculated.'}</p>
    ${s.problems.length?`<ul class="error">${s.problems.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:'<p>Access grant, registration and expiry checks found no listed obstacle. This does not verify the entire learning path.</p>'}
    ${table(['Assignment','Status','Recorded active seconds'],s.datasets.assignments.rows.map(a=>[esc(a.assignment_id),esc(a.status),esc(a.active_seconds??'Not recorded')]))}`;
}
function renderTasks(){
  const source=data.datasets.tasks;
  $('#taskCourse').innerHTML=courseOptions();$('#taskCreateForm').hidden=!canEdit();
  $('#tasksBody').innerHTML=source.available?table(['Task','Course','Priority','Status',''],source.rows.map(t=>[esc(t.title),esc(t.course_id),esc(t.priority),esc(words(t.status)),canEdit()?`<form class="taskChange" data-id="${esc(t.id)}" data-revision="${t.revision}"><label>Next status<select name="status">${['open','in_progress','needs_verification','closed'].map(s=>`<option value="${s}" ${s===t.status?'selected':''}>${esc(words(s))}</option>`).join('')}</select></label><label>Due date<input type="date" name="dueDate" value="${esc(t.due_date||'')}" /></label><label>Reason / verification evidence<textarea name="note" minlength="10" required></textarea></label><button>Save</button></form>`:'Read only'])):unavailable('Task storage');
}
async function loadHealth(){
  const source=await api('health');
  $('#runHealth').disabled=!canEdit();
  $('#checksBody').innerHTML=source.available?source.rows.map(r=>`<article class="card"><h3>${esc(when(r.checked_at))}</h3><p>${esc(words(r.outcome))} · ${esc(r.trigger_kind)}</p>${table(['Severity','Course','Finding'],(r.report.findings||[]).map(f=>[esc(f.severity),esc(f.courseId||'Platform'),esc(f.message)]))}</article>`).join('')||'<p>No saved checks yet. Run a check to create the first report.</p>':unavailable('Check history');
}
async function loadTeam(){
  const t=await api('team');$('#teamBody').innerHTML=t.bindings.available?table(['Account','Role','State','Status','Expires'],t.bindings.rows.map(b=>[esc(t.people.rows.find(p=>p.id===b.auth_user_id)?.email||b.auth_user_id),esc(words(b.actor_role)),esc(b.scope_state||'All'),esc(b.binding_status),esc(b.expires_at?when(b.expires_at):'No expiry')])):unavailable('Staff bindings');
  $('#bindingPerson').innerHTML='<option value="">Select an existing account…</option>'+t.people.rows.map(p=>`<option value="${esc(p.id)}">${esc(p.email)}</option>`).join('');$('#bindingRole').innerHTML='<option value="">Select a role…</option>'+t.roles.map(r=>`<option value="${r}">${esc(words(r))}</option>`).join('');
}
async function loadMessages(){
  const m=await api('messages');$('#messagesBody').innerHTML=`<p class="message">This outbox covers recorded course notifications. Supabase confirmation and password-reset delivery are not reported here. Automated student reminders are not enabled.</p>${m.outbox.available?table(['Created','Type','Status','Sent'],m.outbox.rows.map(r=>[esc(when(r.created_at)),esc(words(r.notification_type)),esc(r.status),esc(when(r.sent_at))])):unavailable('Notification outbox')}`;
}
async function loadAudit(){
  const s=await api('audit');$('#historyBody').innerHTML=s.available?table(['Time','Action','Subject','Actor'],s.rows.map(r=>[esc(when(r.occurred_at)),esc(r.action),esc(r.subject),esc(r.auth_user_id)])):unavailable('Action history');
}
async function loadSettings(){
  const s=await api('settings');$('#settingsBody').innerHTML=table(['Connection / setting','Current state'],[
    ['Cloudflare Stream uploads',s.cloudflareUploadConfigured?'Configured':'Missing configuration'],['Protected Cloudflare playback',s.cloudflareSigningConfigured?'Configured':'Missing configuration'],['Stripe mode',esc(s.stripeMode)],['Stripe sandbox checkout and webhook',s.stripeTestConnected?'Credentials configured; transaction still needs verification':'Not connected'],['Global live payment switch',s.liveEnabled?'Enabled; per-offering approval and activation still required':'Off'],['Google sign-in',s.googleConfigured===true?'Provider enabled; completed sign-in still needs verification':s.googleConfigured===false?'Provider not enabled in Supabase':'Provider settings could not be read'],['Weekly structural check',esc(s.weeklySchedule)]
  ]);
}
async function loadPayments(){
  const s=await api('payments',{offset:String(paymentOffset)});$('#paymentRowsBody').innerHTML=s.available?table(['Course','Student','Mode','Status','Amount'],s.rows.map(r=>[esc(r.course_id),esc(r.student_email||r.student_id),esc(r.stripe_mode??r.mode??'Not recorded'),esc(r.payment_status),esc(money(r.amount,r.currency))])):unavailable('Payment ledger');
  $('#paymentsNext').disabled=!s.hasMore;$('#paymentsPrevious').disabled=paymentOffset===0;
}

document.addEventListener('statecourse:staff',async event=>{
  session=event.detail;data=null;workspace=null;selectedScreen=null;paymentOffset=0;++courseRequest;++screenRequest;
  for(const id of ['overviewBody','courseList','studentsBody','studentDetail','tasksBody','teamBody','checksBody','messagesBody','historyBody','settingsBody','paymentRowsBody','courseWorkspace'])$("#"+id)?.replaceChildren();
  if(!session?.roles.length)return;
  $('[data-panel="teamPanel"]').hidden=!isOwner();
  for(const id of ['checksPanel','historyPanel','messagesPanel','settingsPanel'])$(`[data-panel="${id}"]`).hidden=!isGlobal();
  $('[data-panel="financePanel"]').hidden=!canEdit();
  try{await loadOverview();message('');}catch(error){message(words(error.message),true);}
});
for(const [id,load] of Object.entries({checksPanel:loadHealth,teamPanel:loadTeam,messagesPanel:loadMessages,historyPanel:loadAudit,settingsPanel:loadSettings,financePanel:loadPayments})) {
  $(`[data-panel="${id}"]`).addEventListener('click',()=>load().catch(e=>message(words(e.message),true)));
}
$('#courseSearch').addEventListener('input',()=>data&&renderCourses());$('#courseState').addEventListener('change',()=>data&&renderCourses());$('#studentSearch').addEventListener('input',()=>data&&renderStudents());
document.addEventListener('click',async event=>{
  const b=event.target.closest('[data-work]');if(!b)return;
  const action=b.dataset.work;
  try{
    if(action==='navigate')panel(b.dataset.target);
    else if(action==='refresh')await loadOverview();
    else if(action==='register-catalog'){b.disabled=true;try{const expectedIds=data.inventory.rows.filter(r=>r.trainingStatus==='registration_needed').map(r=>r.publicId);const result=await send('register_catalog',{expectedIds,note:'Register the existing public catalog courses for administration; retain closed enrollment and no regulatory approval.'});await loadOverview();message(`${result.verified} catalog courses verified in the database. Learning and payment decisions remain separate.`);}finally{b.disabled=false;}}
    else if(action==='course-decisions'){const course=data.datasets.courses.rows.find(c=>c.id===b.dataset.id);const governance=data.datasets.governance.rows.find(g=>g.offering_id===course?.id&&g.state===course.state);document.dispatchEvent(new CustomEvent('statecourse:offering',{detail:{course,governance}}));panel('offeringsPanel');}
    else if(action==='course')await openCourse(b.dataset.id);
    else if(action==='close-course')$('#courseWorkspace').hidden=true;
    else if(action==='course-tab')document.querySelectorAll('.course-section').forEach(s=>s.hidden=s.id!==b.dataset.target);
    else if(action==='screen')await openScreen(b.dataset.unit,b.dataset.screen);
    else if(action==='preview-text') {const input=$('#screenDraftForm [name="bodyMarkdown"]');$('#textPreview').hidden=false;$('#textPreview').innerHTML='<p class="preview-badge">Administrative preview · no progress or credit recorded</p>'+renderLessonMarkdown(input?.value||'No text content on this screen.');}
    else if(action==='student')await openStudent(b.dataset.id);
    else if(action==='health'){b.disabled=true;try{await send('health_run');await loadHealth();}finally{b.disabled=false;}}
    else if(action==='payments-next'){paymentOffset+=200;await loadPayments();}
    else if(action==='payments-previous'){paymentOffset=Math.max(0,paymentOffset-200);await loadPayments();}
  }catch(error){message(words(error.message),true);}
});
document.addEventListener('submit',async event=>{
  const form=event.target;
  if(!['screenDraftForm','courseReviewForm','coursePublishForm','taskCreateForm','bindingForm'].includes(form.id)&&!form.classList.contains('taskChange'))return;
  event.preventDefault();const fields=Object.fromEntries(new FormData(form)),button=event.submitter;button.disabled=true;
  try{
    if(form.id==='screenDraftForm'){
      const overrides=[...(workspace.draft?.payload.overrides||[])].filter(o=>o.deliveryId!==selectedScreen.unitId||o.screenId!==selectedScreen.screenId);
      overrides.push({deliveryId:selectedScreen.unitId,screenId:selectedScreen.screenId,title:fields.title,bodyMarkdown:fields.bodyMarkdown});
      workspace.draft=await send('save_draft',{courseId:workspace.course.id,expectedRevision:workspace.draft?.revision||0,payload:{baseFingerprint:workspace.baseFingerprint,overrides}});
      const selected={...selectedScreen};await openCourse(workspace.course.id);await openScreen(selected.unitId,selected.screenId);message('Draft saved in the cloud. Published content has not changed.');
    }else if(form.id==='courseReviewForm'){await send('review',{courseId:workspace.course.id,contentHash:workspace.draft.content_hash,...fields});await openCourse(workspace.course.id);message('Review recorded for this saved version.');}
    else if(form.id==='coursePublishForm'){await send('publish',{courseId:workspace.course.id,contentHash:workspace.draft.content_hash,note:fields.note,audience:'new_enrollments'});await openCourse(workspace.course.id);message('Published for new enrollments. Existing progress and versions preserved.');}
    else if(form.id==='taskCreateForm'){await send('task_create',fields);form.reset();await loadOverview();message('Task saved.');}
    else if(form.classList.contains('taskChange')){await send('task_update',{id:form.dataset.id,expectedRevision:Number(form.dataset.revision),...fields,dueDate:fields.dueDate||null});await loadOverview();message('Task change recorded.');}
    else if(form.id==='bindingForm'){await send('binding',fields);await loadTeam();message('Staff access decision recorded.');}
  }catch(error){message(words(error.message),true);}finally{button.disabled=false;}
});

document.addEventListener('statecourse:governance-updated',()=>loadOverview().catch(e=>message(words(e.message),true)));
