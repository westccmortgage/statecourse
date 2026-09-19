import { nmlsAdministrativeProgress } from './nmls-training-service.mjs';
import { trainingReadiness, verifiedTrainingReadiness } from './training-readiness.mjs';
import { courseInventory } from './course-inventory.mjs';
import { dbRequest } from './db.mjs';
import { getCourseConfiguration, getCourseDelivery, getCourseQuestion as getBlockQuestion } from '../../../config/course-registry.mjs';
import { NMLS_TRAINING_COURSE, isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';
import { nmlsCurriculumSummary, buildNmlsReadiness } from './nmls-readiness.mjs';
import { readNmlsLearning, realEstateLearning, enrollmentClassification, disciplineForEnrollment } from './console-learning.mjs';

export function fail(message, statusCode = 400) { throw Object.assign(new Error(message), { statusCode }); }
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const KEY = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/;
export const PAGE_SIZE = 200;
export function globalOwner(staff) {
  return staff.matching.some(b => b.actor_role === 'owner' && b.scope_state == null);
}
export function courseScope(staff, row) {
  if (!row) fail('course_not_found', 404);
  if (staff.scopeStates && !staff.scopeStates.includes(row.state)) fail('course_outside_staff_scope', 403);
  return row;
}
export async function courseFor(staff, id) {
  if (!KEY.test(id || '')) fail('invalid_course_id');
  return courseScope(staff, (await dbRequest(`courses?id=eq.${encodeURIComponent(id)}&select=*&limit=1`))?.[0]);
}
export async function readRows(path) {
  try {
    const rows = await dbRequest(path);
    if (!Array.isArray(rows)) throw new Error('invalid_dataset');
    return { available: true, rows: rows.slice(0, 1000), truncated: rows.length > 1000 };
  } catch {
    return { available: false, rows: [], truncated: false };
  }
}
function stateFilter(staff) {
  if (!staff.scopeStates) return '';
  const states = staff.scopeStates.filter(s => /^[A-Z]{2}$/.test(s));
  if (!states.length) fail('staff_scope_empty', 403);
  return `&state=in.(${states.join(',')})`;
}
function idsFilter(field, ids) {
  const safe = ids.filter(x => KEY.test(x));
  return safe.length ? `&${field}=in.(${safe.join(',')})` : `&${field}=eq.__no_authorized_records__`;
}

export function courseStructure(courseId) {
  if (isNmlsTrainingCourse(courseId)) {
    const curriculum = nmlsCurriculumSummary();
    return { available: curriculum.available, readOnly: true, curriculum,
      reason: curriculum.available ? null : curriculum.reason,
      units: (curriculum.modules || []).map(module => ({ id: module.id, title: module.title, deliveryAvailable: true,
        blocks: [{ id: module.id, title: module.title, screens: module.lessons.map(lesson => ({ id: lesson.id, title: lesson.title, type: 'nmls_lesson', provisionalMinutes: lesson.provisionalMinutes })) }] })),
      rules: { mode: 'free_training', version: NMLS_TRAINING_COURSE.version, creditIssuanceAllowed: false, reportingEnabled: false, timing: 'Provisional training design; not verified CE attendance' } };
  }
  const config = getCourseConfiguration(courseId);
  if (!config) return { available: false, reason: 'student_renderer_not_registered', units: [], rules: null };
  const units = config.assignments.map(a => {
    const delivery = getCourseDelivery(courseId, a.id);
    return { ...a, blocks: delivery?.blocks || [], deliveryAvailable: Boolean(delivery) };
  });
  const rules = Object.fromEntries(Object.entries(config).filter(([key]) => !['assignments', 'subjects'].includes(key)));
  return { available: true, units, rules };
}

export async function snapshot(staff) {
  const scope = stateFilter(staff);
  const courses = await readRows(`courses?select=*&order=state.asc,id.asc&limit=1001${scope}`);
  courses.rows = await Promise.all(courses.rows.map(async c=>({...c,trainingReadiness:await verifiedTrainingReadiness(c.id)})));
  const ids = courses.rows.map(c => c.id);
  const courseFilter = idsFilter('course_id', ids);
  const queries = {
    enrollments: `enrollments?select=id,student_id,course_id,state,status,course_version,enrollment_origin,review_role,console_content_release_id,checkout_attempt_id,expires_at,compliance_credit_eligible,enrollment_date,completed_at,last_course_accessed_at&order=enrollment_date.desc&limit=1001${scope}${courseFilter}`,
    videos: `video_assets?select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,stream_uid,created_at&order=created_at.desc&limit=1001${courseFilter}`,
    governance: `offering_public_status?select=*&site=eq.${encodeURIComponent(new URL(globalThis.Netlify?.env.get('STATECOURSE_BASE_URL') || process.env.STATECOURSE_BASE_URL).hostname.replace(/^www\./,''))}&order=state.asc,offering_id.asc&limit=1001${scope}`,
    payments: `admin_payment_ledger?select=*&order=payment_date.desc&limit=1001${scope}`,
    tasks: `console_tasks?select=*&order=updated_at.desc&limit=1001${courseFilter}`,
  };
  // Revenue and financial records are not included for a support or reviewer session.
  const mayReadMoney = staff.matching.some(b => ['owner','administrator'].includes(b.actor_role));
  if (!mayReadMoney) delete queries.payments;
  const entries = await Promise.all(Object.entries(queries).map(async ([key, query]) => [key, await readRows(query)]));
  const datasets = { courses, ...Object.fromEntries(entries) };
  if (!courses.available) datasets.enrollments = { available: false, rows: [], truncated: false };
  else if (courses.truncated) datasets.enrollments.truncated = true;
  const studentIds=[...new Set(datasets.enrollments.rows.map(e=>e.student_id).filter(id=>UUID.test(id)))];
  const people=[];let peopleAvailable=datasets.enrollments.available;
  for(let offset=0;offset<studentIds.length;offset+=100){
    const result=await readRows(`students?select=id,email,first_name,last_name&id=in.(${studentIds.slice(offset,offset+100).join(',')})&limit=101`);
    peopleAvailable=peopleAvailable&&result.available;people.push(...result.rows);
  }
  datasets.people={available:peopleAvailable,rows:people,truncated:datasets.enrollments.truncated};
  datasets.recentAccess=courses.available?await readRows(`lms_regulatory_audit?select=enrollment_id,occurred_at,actor_mode&event_type=eq.block_player_opened&order=occurred_at.desc&limit=1001${courseFilter}`):{available:false,rows:[],truncated:false};
  if (courses.truncated) datasets.recentAccess.truncated = true;
  // These queries depend on the course inventory, so an unreadable inventory
  // must not turn an unknown count into a reassuring zero.
  for (const name of ['videos', 'tasks']) {
    if (!courses.available) datasets[name] = { available: false, rows: [], truncated: false };
    else if (courses.truncated) datasets[name].truncated = true;
  }
  const inventory = await courseInventory(courses,datasets.governance,staff.scopeStates);
  if ((!staff.scopeStates || staff.scopeStates.includes(NMLS_TRAINING_COURSE.state)) && ids.includes(NMLS_TRAINING_COURSE.id)) {
    const course = encodeURIComponent(NMLS_TRAINING_COURSE.id);
    const [definitions, attempts] = await Promise.all([
      readRows(`nmls_training_definitions?course_id=eq.${course}&select=course_id,course_version,content_digest,definition_digest&limit=1001`),
      readRows(`nmls_training_attempts?course_id=eq.${course}&select=enrollment_id,student_id,course_id,course_version,revision,runtime,updated_at&limit=1001`),
    ]);
    datasets.nmlsDefinitions = definitions;
    datasets.nmlsProgress = { available: attempts.available, truncated: attempts.truncated, rows: attempts.rows.map(row=>{
      const enrollment=datasets.enrollments.rows.find(e=>e.id===row.enrollment_id);
      try {const p=nmlsAdministrativeProgress(row,enrollment);return {enrollmentId:row.enrollment_id,courseId:row.course_id,revision:p.revision,phase:p.phase,completedUnits:p.completed,passedModules:p.completedModules,trainingCompleted:p.trainingCompleted,nmlsCreditEarned:false,lastActivity:p.lastActivity};}
      catch {return {enrollmentId:row.enrollment_id,phase:'unverified',completedUnits:null,passedModules:null,trainingCompleted:false,nmlsCreditEarned:false,lastActivity:null};}
    }) };
    datasets.nmlsActivity = { available: attempts.available, truncated: attempts.truncated,
      rows: datasets.nmlsProgress.rows.filter(r => r.lastActivity)
        .map(r => ({ enrollment_id: r.enrollmentId, occurred_at: r.lastActivity, source: 'nmls_training_attempts.updated_at' })) };
  }
  const result = { checkedAt: new Date().toISOString(), scopeStates: staff.scopeStates, datasets, inventory };
  if (!staff.scopeStates || staff.scopeStates.includes(NMLS_TRAINING_COURSE.state)) result.nmls = buildNmlsReadiness(result);
  return result;
}

export function assessSnapshot(data, environment = {}) {
  const findings = [];
  const add = (code, severity, courseId, message) => findings.push({ code, severity, courseId, message });
  for (const [name, source] of Object.entries(data.datasets)) {
    if (!source.available) add(`source_${name}`, 'unverified', null, `${name}: source could not be read.`);
    if (source.truncated) add(`incomplete_${name}`, 'unverified', null, `${name}: only the most recent 1,000 rows were checked.`);
  }
  const mortgage=data.inventory?.verticals?.find(vertical=>vertical.id==='mortgage');
  if (data.nmls) {
    for (const finding of data.nmls.findings) add(finding.code,
      ['nmls_course_record_missing','nmls_training_definition_unverified','nmls_learning_connection_unverified','nmls_governance_unverified'].includes(finding.code) ? 'blocking' : 'attention',
      NMLS_TRAINING_COURSE.id, finding.message);
  } else if (data.inventory?.publicAvailable && mortgage && mortgage.courseCount===0) {
    add('nmls_course_record_missing','blocking',null,'Mortgage / NMLS has no published NMLS course record. Provider approval, course approval, enrollment and payments remain closed.');
  }
  for (const course of data.datasets.courses.rows) {
    if (isNmlsTrainingCourse(course.id)) {
      // Its versioned engine and exact database manifest are checked above;
      // California/Texas block-renderer checks are not NMLS course requirements.
      if (!data.nmls) add('nmls_readiness_unverified', 'blocking', course.id, 'The national training readiness record has not been inspected.');
      continue;
    }
    const structure = courseStructure(course.id);
    if (!structure.available) { if(course.approval_status==='not_regulated')continue;add('renderer_missing', 'blocking', course.id, 'No student block renderer is registered for this course.'); continue; }
    if (!course.name?.trim()) add('course_title_missing', 'blocking', course.id, 'Course title is empty.');
    const readiness = course.trainingReadiness || trainingReadiness(course.id);
    if (!readiness.ready) {
      const reasons={database_runtime_verification_required:'The production database runtime has not been verified.',training_database_runtime_unavailable:'Migration 024 is not installed or its runtime functions cannot be reached.',training_database_definition_mismatch:'The database module definition differs from the deployed course definition.',student_renderer_not_registered:'No student renderer is registered for this course.',state_progress_engine_not_connected:'The state progress engine is not connected.',lesson_delivery_missing:'One or more lessons have no student delivery.',retrieval_question_missing:'One or more required knowledge checks are not registered.'};
      add('training_not_ready','blocking',course.id,`Free training cannot open. ${reasons[readiness.reason]||'The recorded learning connection is incomplete.'}`);
    }
    const seen = new Set();
    for (const unit of structure.units) {
      if (!unit.deliveryAvailable) add('unit_delivery_missing', 'blocking', course.id, `${unit.id}: lesson delivery is missing.`);
      for (const block of unit.blocks) {
        if (seen.has(`${unit.id}:${block.id}`)) add('duplicate_block', 'blocking', course.id, `${unit.id}: duplicate block ${block.id}.`);
        seen.add(`${unit.id}:${block.id}`);
        for (const screen of block.screens) {
          if (screen.type === 'retrieval' && !getBlockQuestion(course.id, screen.questionId)) add('retrieval_question_missing', 'blocking', course.id, `${unit.id}/${screen.id}: retrieval question is not registered.`);
        }
      }
    }
  }
  const now = new Date(data.checkedAt).valueOf();
  for (const g of data.datasets.governance.rows) {
    if (g.payment_mode === 'live' && !g.approval_currently_effective) add('live_without_approval', 'blocking', g.offering_id, 'Live payment mode has no effective approval; checkout must remain closed.');
    if (g.approval_expires_date) {
      const days = Math.ceil((new Date(g.approval_expires_date + 'T23:59:59Z').valueOf() - now) / 86400000);
      if (days >= 0 && days <= 30) add('approval_expiring', 'attention', g.offering_id, `Approval expires in ${days} days.`);
    }
  }
  for (const e of data.datasets.enrollments.rows) {
    const c = data.datasets.courses.rows.find(c => c.id === e.course_id);
    if (c && c.state !== e.state) add('enrollment_state_mismatch', 'blocking', e.course_id, `Enrollment ${e.id}: jurisdiction does not match the course.`);
    if (e.status === 'completed' && !e.completed_at) add('completion_evidence_missing', 'attention', e.course_id, `Enrollment ${e.id}: completed status has no completion timestamp.`);
  }
  for (const v of data.datasets.videos.rows) {
    if (!v.stream_uid && now - new Date(v.created_at).valueOf() > 86400000) add('upload_unfinished', 'attention', v.course_id, `${v.asset_key}: upload reservation is more than a day old.`);
  }
  if (environment.stripeMode === 'live' || environment.liveEnabled === true) add('live_payments_enabled', 'attention', null, 'Production payment settings permit live mode; verify the owner activation decision before charging.');
  for (const task of data.datasets.tasks?.rows || []) if (task.status !== 'closed' && task.due_date && Date.parse(task.due_date+'T23:59:59Z') < now) add('task_overdue','attention',task.course_id,`Overdue task: ${task.title}.`);
  if (!environment.stripeTestConnected) add('stripe_test_unconfigured', 'unverified', null, 'Stripe test checkout and webhook credentials are not both configured.');
  if (!environment.googleConnected) add('google_unverified', 'unverified', null, 'Google sign-in has not been verified by this check.');
  add('delivery_checks_pending', 'unverified', null, 'This structural check does not send email, watch video, execute checkout or exercise an authenticated student session.');
  return { ...data, findings, outcome: findings.some(f => f.severity === 'blocking') ? 'action_required' : findings.length ? 'needs_review' : 'checked' };
}

export async function studentDetail(staff, enrollmentId) {
  if (!UUID.test(enrollmentId || '')) fail('invalid_enrollment_id');
  const enrollment = (await dbRequest(`enrollments?id=eq.${enrollmentId}&select=*&limit=1`))?.[0];
  if (!enrollment) fail('enrollment_not_found', 404);
  await courseFor(staff, enrollment.course_id);
  if (isNmlsTrainingCourse(enrollment.course_id)) {
    const [student, grants, learning] = await Promise.all([
      readRows(`students?id=eq.${enrollment.student_id}&select=id,email,first_name,last_name&limit=1`),
      readRows(`access_grants?enrollment_id=eq.${enrollmentId}&select=id,status,granted_at&limit=1001`),
      readNmlsLearning(enrollment, readRows),
    ]);
    return { enrollment, student: student.rows[0] || null, discipline: 'mortgage', classification: enrollmentClassification(enrollment),
      learning, progress: learning.available ? learning : null, datasets: { grants },
      problems: [!learning.available ? learning.reason : null,
        !grants.available ? 'Access grants could not be checked.' : !grants.rows.some(g => g.status === 'active') ? 'No active access grant.' : null].filter(Boolean) };
  }
  // Student identity is fetched only after the enrollment's course is authorized.
  const [student, blocks, assignments, grants, help] = await Promise.all([
    readRows(`students?id=eq.${enrollment.student_id}&select=id,email,first_name,last_name&limit=1`),
    readRows(`lms_block_progress?enrollment_id=eq.${enrollmentId}&select=*&limit=1001`),
    readRows(`lms_assignment_state?enrollment_id=eq.${enrollmentId}&select=*&limit=1001`),
    readRows(`access_grants?enrollment_id=eq.${enrollmentId}&select=id,status,granted_at&limit=1001`),
    readRows(`student_help_requests?enrollment_id=eq.${enrollmentId}&select=*&limit=1001`),
  ]);
  const structure = courseStructure(enrollment.course_id);
  const required = structure.units.flatMap(u => u.blocks.filter(b => b.required !== false).map(b => `${u.id}:${b.id}`));
  const completed = new Set(blocks.rows.filter(b => b.status === 'MASTERED').map(b => `${b.assignment_id}:${b.block_id}`));
  const progress = blocks.available && !blocks.truncated && required.length
    ? { completed: required.filter(id => completed.has(id)).length, total: required.length, definition: 'Mastered required blocks / registered required blocks. Course completion is evaluated separately.', source: 'current_registered_structure', historicalVersionVerified: false }
    : null;
  const assessments = await readRows(`lms_block_assessment_attempts?enrollment_id=eq.${enrollmentId}&select=assignment_id,block_id,kind,correct&limit=1001`);
  const finals=enrollment.state==='CA'?await readRows(`final_exam_sessions?enrollment_id=eq.${enrollmentId}&select=attempt_number,status,correct_count,question_count,passed,submitted_at&limit=1001`):null;
  const learning = realEstateLearning(enrollment, structure, blocks, assignments, assessments,finals);
  return { enrollment, student: student.rows[0] || null, discipline: disciplineForEnrollment(enrollment), classification: enrollmentClassification(enrollment),
    learning, datasets: { blocks, assignments, grants, help }, progress: learning.available ? progress : null,
    problems: [!grants.available ? 'Access grants could not be checked.' : !grants.rows.some(g => g.status === 'active') ? 'No active access grant.' : null,
      !structure.available ? 'Student renderer is not registered.' : null,
      enrollment.expires_at && new Date(enrollment.expires_at) <= new Date() ? 'Enrollment has expired.' : null].filter(Boolean) };
}
