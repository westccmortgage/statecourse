import { dbRequest, rpc } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import { SB1495 } from "../../config/california/regulatory-manifest.mjs";
import { getCaliforniaAssessment, getCaliforniaCourse, publicAssessment, scoreCaliforniaAssessment } from "../../config/california-course-engine.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSIGNMENT = /^assignment-(0[1-9]|1[0-5])$/;
const ANSWER_EVENTS = new Map([
  ["answer_applied","applied"],
  ["answer_engagement","engagement"],
  ["answer_remediation","remediation"]
]);

/* RE 303, "Course & Instructor Evaluation": the Commissioner's Regulations require the
   school to notify each student that an online evaluation of courses and instructors is
   available on the Department's website. Delivering it is the requirement, so it is
   sent with every course payload and its first delivery is written to the audit trail —
   a notice the school cannot evidence is a notice the school cannot prove it gave.
   Versioned so a record shows which wording a given student was shown. */
const CALIFORNIA_NOTICES = Object.freeze([Object.freeze({
  id: "dre-course-evaluation",
  version: "re303-2026-08",
  heading: "California course and instructor evaluation",
  body: "An online evaluation of courses and instructors is available on the California Department of Real Estate website. Your evaluation goes to the Department, not to StateCourse.",
  linkLabel: "Open the Department of Real Estate website",
  linkHref: "https://www.dre.ca.gov"
})]);

function fail(message,statusCode=400) {
  throw Object.assign(new Error(message),{ statusCode });
}

function isoNow() { return new Date().toISOString(); }

async function contextFor(studentId,enrollmentId) {
  if (!UUID.test(enrollmentId || "")) fail("invalid_enrollment",400);
  const rows = await dbRequest(`enrollments?id=eq.${encodeURIComponent(enrollmentId)}&select=*&limit=1`);
  const enrollment = rows?.[0];
  if (!enrollment || enrollment.state !== "CA") fail("california_enrollment_not_found",404);
  const reviewRows = await dbRequest(`course_review_access?user_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(enrollment.course_id)}&active=eq.true&select=access_role,expires_at`);
  const review = (reviewRows || []).find((item) => !item.expires_at || new Date(item.expires_at) > new Date());
  const owner = enrollment.student_id === studentId;
  if (!owner && !review) fail("course_access_denied",403);
  let accessGrantedAt = null;
  if (owner) {
    const grants = await dbRequest(`access_grants?enrollment_id=eq.${encodeURIComponent(enrollmentId)}&student_id=eq.${encodeURIComponent(studentId)}&status=eq.active&select=id,granted_at&limit=1`);
    if (!grants?.[0]) fail("course_access_not_active",403);
    accessGrantedAt = grants[0].granted_at ?? null;
    /* RE 303 p.4 requires the coursework to be completed within one year of
       registration; after that the student re-enrolls. The database refuses to credit
       study time to a lapsed enrollment, and refusing here as well means the student is
       told now rather than allowed to keep reading and be stopped at the final. A
       reviewer is unaffected: the regulator's account must reach the material whatever
       a student's clock says. */
    if (enrollment.status === "expired"
        || (enrollment.expires_at && new Date(enrollment.expires_at) <= new Date())) {
      fail("enrollment_expired",403);
    }
  }
  const course = getCaliforniaCourse(enrollment.course_id);
  if (!course) fail("california_course_configuration_missing",503);
  return {
    enrollment,
    course,
    accessGrantedAt,
    mode: review ? (review.access_role === "administrator" ? "admin" : "reviewer") : "student",
    actorId: studentId,
    studentId: enrollment.student_id
  };
}

async function ensureAssignmentState(ctx) {
  if (ctx.mode !== "student") return;
  const existing = await dbRequest(`lms_assignment_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&select=assignment_id&limit=1`);
  if (existing?.length) return;
  await dbRequest("lms_assignment_state",{
    method:"POST",
    prefer:"resolution=ignore-duplicates,return=minimal",
    body:ctx.course.assignments.map((item) => ({
      enrollment_id:ctx.enrollment.id,
      student_id:ctx.studentId,
      course_id:ctx.course.courseId,
      course_version:ctx.enrollment.course_version,
      assignment_id:item.id
    }))
  });
  await dbRequest("lms_assignment_progress",{
    method:"POST",
    prefer:"resolution=ignore-duplicates,return=minimal",
    body:ctx.course.assignments.map((item) => ({
      enrollment_id:ctx.enrollment.id,
      course_id:ctx.course.courseId,
      course_version:ctx.enrollment.course_version,
      assignment_id:item.id,
      assignment_version:"1.0"
    }))
  });
}

async function statesFor(ctx) {
  if (ctx.mode !== "student") {
    return ctx.course.assignments.map((item) => ({
      assignment_id:item.id,status:"review_available",viewed_sections:[],
      applied_exercise_complete:false,engagement_check_complete:false,
      remediation_status:"not_required",active_seconds:0,assessment_attempts:0,
      remediation_attempts:0
    }));
  }
  return dbRequest(`lms_assignment_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&order=assignment_id.asc`);
}

function statusMap(course,states,mode) {
  const byId = new Map(states.map((item) => [item.assignment_id,item]));
  let priorComplete = true;
  return course.assignments.map((assignment) => {
    const row = byId.get(assignment.id) || {};
    const completed = row.status === "completed";
    const accessible = mode !== "student" || completed || priorComplete;
    const status = mode !== "student"
      ? "review_available"
      : completed ? "completed"
      : accessible ? (row.status === "not_started" || !row.status ? "in_progress" : row.status)
      : "locked";
    if (!completed) priorComplete = false;
    return {
      ...assignment,
      status,
      accessible,
      activeSeconds:Number(row.active_seconds || 0),
      viewedSections:Array.isArray(row.viewed_sections) ? row.viewed_sections : [],
      appliedComplete:Boolean(row.applied_exercise_complete),
      engagementComplete:Boolean(row.engagement_check_complete),
      remediationStatus:row.remediation_status || "not_required",
      assessmentAttempts:Number(row.assessment_attempts || 0),
      remediationAttempts:Number(row.remediation_attempts || 0),
      completedAt:row.completed_at || null
    };
  });
}

async function coursePayload(ctx,requestedAssignment) {
  await ensureAssignmentState(ctx);
  const states = await statesFor(ctx);
  const assignments = statusMap(ctx.course,states,ctx.mode);
  let selected = assignments.find((item) => item.id === requestedAssignment && item.accessible);
  if (!selected) selected = assignments.find((item) => item.accessible && item.status !== "completed") || assignments[assignments.length-1];
  const eligibilityRows = ctx.mode === "student"
    ? await dbRequest(`course_final_eligibility?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&select=*&limit=1`)
    : [];
  const completed = assignments.filter((item) => item.status === "completed").length;
  const eligibility = eligibilityRows?.[0] || null;
  /* SB 1495. Sent whenever the selected assignment is the practicum, so the page can render
     the two role-play prompts and show which of them the student has actually submitted. The
     response text is not sent back: it is evidence, not a draft to be re-edited in place. */
  const participation = ctx.course.courseId === SB1495.courseId && selected.id === SB1495.assignmentId
    ? await sb1495Participation(ctx)
    : null;
  return {
    mode:ctx.mode,
    participatory:participation ? {
      assignmentId:SB1495.assignmentId,
      statement:SB1495.statement,
      minimumCharacters:SB1495_MINIMUM_RESPONSE,
      roles:SB1495.roles.map((role) => ({
        id:role.id,
        label:role.label,
        section:role.topic,
        submitted:Boolean(participation[`${role.id}_role_submitted`])
      })),
      complete:Boolean(participation.both_roles_submitted)
    } : null,
    /* Sent on every load. The student cannot dismiss it away permanently, because the
       obligation is to notify the student, not to have notified them once. */
    regulatoryNotices:CALIFORNIA_NOTICES,
    finalExam:{
      /* The examination lives on its own page; the course record says only whether it
         is open and, when it is not, what is still outstanding. */
      eligible:Boolean(eligibility?.final_exam_eligible),
      earliestAt:eligibility?.earliest_final_exam_at || null,
      remaining:Array.isArray(eligibility?.remaining_requirements) ? eligibility.remaining_requirements : [],
      href:`/student/final-exam/?enrollment_id=${encodeURIComponent(ctx.enrollment.id)}`
    },
    reviewNotice:ctx.mode === "student" ? null : "Regulatory Review Mode — time and sequencing restrictions bypassed. Reviewer activity creates no student completion credit.",
    enrollment:{
      id:ctx.enrollment.id,
      status:ctx.enrollment.status,
      registeredAt:ctx.enrollment.enrollment_date,
      /* The minimum-period clock runs from access, not from registration - RE 303 p.3 -
         so the student is shown the date the clock actually started. */
      accessGrantedAt:ctx.accessGrantedAt,
      expiresAt:ctx.enrollment.expires_at,
      qaOnly:ctx.enrollment.status === "qa_non_credit",
      creditEligible:Boolean(ctx.enrollment.compliance_credit_eligible)
    },
    course:{
      courseId:ctx.course.courseId,
      title:ctx.course.title,
      version:ctx.course.version,
      state:ctx.course.state,
      regulator:ctx.course.regulator,
      requiredHours:ctx.course.requiredHours,
      assignmentCount:ctx.course.assignmentCount,
      expectedMinutesPerAssignment:ctx.course.expectedMinutesPerAssignment,
      minimumElapsedHours:ctx.course.minimumElapsedHours,
      approvalStatus:ctx.course.approvalStatus
    },
    progress:{
      completed,
      total:assignments.length,
      percent:Math.round(100*completed/assignments.length),
      activeSeconds:assignments.reduce((sum,item) => sum+item.activeSeconds,0),
      eligibility
    },
    assignments,
    selectedAssignment:selected,
    assessments:{
      applied:publicAssessment(getCaliforniaAssessment(ctx.course.courseId,selected.id,"applied")),
      engagement:publicAssessment(getCaliforniaAssessment(ctx.course.courseId,selected.id,"engagement")),
      remediation:selected.remediationStatus === "required" || selected.remediationStatus === "content_viewed"
        ? publicAssessment(getCaliforniaAssessment(ctx.course.courseId,selected.id,"remediation"))
        : null
    }
  };
}

async function audit(ctx,assignmentId,eventType,detail={},sessionId=null) {
  await dbRequest("lms_regulatory_audit",{
    method:"POST",prefer:"return=minimal",
    body:{
      actor_id:ctx.actorId,actor_mode:ctx.mode,student_id:ctx.studentId,
      enrollment_id:ctx.enrollment.id,course_id:ctx.course.courseId,
      course_version:ctx.enrollment.course_version,assignment_id:assignmentId || null,
      event_type:eventType,session_id:sessionId || null,detail
    }
  });
}

async function assignmentRow(ctx,assignmentId) {
  const rows = await dbRequest(`lms_assignment_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&assignment_version=eq.1.0&select=*&limit=1`);
  const row = rows?.[0];
  if (!row) fail("assignment_state_not_found",404);
  return row;
}

async function patchAssignment(ctx,assignmentId,body) {
  await dbRequest(`lms_assignment_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&assignment_version=eq.1.0`,{
    method:"PATCH",prefer:"return=minimal",body:{...body,updated_at:isoNow()}
  });
}

async function maybeSupportFlag(ctx,assignmentId,attempts) {
  if (attempts < 3) return;
  const open = await dbRequest(`student_help_requests?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&status=in.(open,assigned)&select=id&limit=1`);
  if (open?.length) return;
  await dbRequest("student_help_requests",{
    method:"POST",prefer:"return=minimal",
    body:{student_id:ctx.studentId,enrollment_id:ctx.enrollment.id,course_id:ctx.course.courseId,assignment_id:assignmentId,concept:"Repeated assessment difficulty",status:"open"}
  });
}

/* The minimum a submission must be to be a submission. A participatory component evidenced by
   an empty box is a participatory component nobody can review, and the same figure is written
   into the database's own check constraint so the two cannot disagree. */
const SB1495_MINIMUM_RESPONSE = 200;

async function sb1495Participation(ctx) {
  if (ctx.course.courseId !== SB1495.courseId) return null;
  return rpc("sb1495_participation",{p_enrollment_id:ctx.enrollment.id});
}

async function finishIfReady(ctx,assignmentId) {
  const row = await assignmentRow(ctx,assignmentId);
  const assignment = ctx.course.assignments.find((item) => item.id === assignmentId);
  const viewed = Array.isArray(row.viewed_sections) ? row.viewed_sections : [];
  const remediationSatisfied = row.remediation_status === "not_required" || row.remediation_status === "satisfied";
  /* SB 1495: the practicum assignment needs both roles taken as well. Reading the answer from
     the submissions rather than from a flag on the assignment row is the whole point — a flag
     is something a code path can set, and a submission is something a student wrote. */
  let participatory = true;
  if (ctx.course.courseId === SB1495.courseId && assignmentId === SB1495.assignmentId) {
    const participation = await sb1495Participation(ctx);
    participatory = Boolean(participation?.both_roles_submitted);
  }
  const ready = viewed.length >= assignment.sectionCount
    && row.applied_exercise_complete
    && row.engagement_check_complete
    && remediationSatisfied
    && participatory;
  if (ready && row.status !== "completed") {
    const completedAt=isoNow();
    await patchAssignment(ctx,assignmentId,{status:"completed",completed_at:completedAt});
    await dbRequest(`lms_assignment_progress?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&assignment_version=eq.1.0`,{
      method:"PATCH",prefer:"return=minimal",
      body:{status:"completed",quiz_mastery_percent:100,remediation_required:row.remediation_status !== "not_required",completed_at:completedAt,updated_at:completedAt}
    });
    const next = ctx.course.assignments.find((item) => item.sequence === assignment.sequence+1);
    await dbRequest(`student_portal_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}`,{
      method:"PATCH",prefer:"return=minimal",
      body:{last_lesson_id:next?.id || assignmentId,resume_path:"/student-course.html?enrollment_id="+ctx.enrollment.id+(next ? "&assignment="+next.id : ""),last_activity_at:completedAt,updated_at:completedAt}
    });
    await audit(ctx,assignmentId,"assignment_completed",{
      automatic:true,
      requirements:["sections","applied_exercise","engagement_check","remediation"].concat(
        ctx.course.courseId===SB1495.courseId && assignmentId===SB1495.assignmentId ? ["sb1495_both_roles"] : []
      )
    });
  }
  await rpc("refresh_california_eligibility",{p_enrollment_id:ctx.enrollment.id});
  return ready;
}

async function handleStudentEvent(ctx,input) {
  const assignmentId=String(input.assignmentId || "");
  if (!ASSIGNMENT.test(assignmentId) || !ctx.course.assignments.some((item) => item.id === assignmentId)) fail("invalid_assignment");
  const assignments=statusMap(ctx.course,await statesFor(ctx),ctx.mode);
  const nav=assignments.find((item) => item.id===assignmentId);
  if (!nav?.accessible) fail("assignment_locked",403);
  const eventType=String(input.eventType || "");

  if (eventType === "heartbeat") {
    if (!UUID.test(String(input.sessionId || ""))) fail("invalid_session");
    const active=Boolean(input.visible && input.focused && Number(input.idleSeconds || 999)<120);
    const result=await rpc("record_california_heartbeat",{
      p_session_id:String(input.sessionId),p_enrollment_id:ctx.enrollment.id,p_actor_id:ctx.actorId,
      p_assignment_id:assignmentId,p_mode:ctx.mode,p_active:active,
      p_metadata:{visible:Boolean(input.visible),focused:Boolean(input.focused),idle_seconds:Math.max(0,Math.min(3600,Number(input.idleSeconds || 0))),user_agent:String(input.userAgent || "").slice(0,300)}
    });
    return {ok:true,creditedSeconds:Number(result || 0),noStudentCredit:ctx.mode!=="student"};
  }

  if (ctx.mode !== "student") {
    const kind=ANSWER_EVENTS.get(eventType);
    if (kind) {
      const assessment=getCaliforniaAssessment(ctx.course.courseId,assignmentId,kind);
      if(!assessment) fail("assessment_unavailable",409);
      const score=scoreCaliforniaAssessment(assessment,input.answers);
      if(!score) fail("invalid_answers");
      await audit(ctx,assignmentId,"review_assessment",{kind,percent:score.percent,passed:score.passed,no_student_credit:true});
      /* A reviewer always sees every rationale; reviewer answers never touch student records. */
      return {ok:true,correct:score.passed,percent:score.percent,correctCount:score.correctCount,total:score.total,results:score.results,noStudentCredit:true};
    }
    await audit(ctx,assignmentId,"review_"+eventType,{no_student_credit:true});
    return {ok:true,noStudentCredit:true};
  }

  const row=await assignmentRow(ctx,assignmentId);
  if (eventType === "section_viewed") {
    const section=Number(input.section);
    if (!Number.isInteger(section) || section<1 || section>6) fail("invalid_section");
    const sections=Array.from(new Set([...(Array.isArray(row.viewed_sections)?row.viewed_sections:[]),section])).sort((a,b)=>a-b);
    await patchAssignment(ctx,assignmentId,{viewed_sections:sections,status:row.status==="not_started"?"in_progress":row.status,started_at:row.started_at || isoNow()});
    await audit(ctx,assignmentId,"section_viewed",{section});
    await finishIfReady(ctx,assignmentId);
    return {ok:true,viewedSections:sections};
  }

  if (eventType === "remediation_content_viewed") {
    if (row.remediation_status !== "required" && row.remediation_status !== "content_viewed") fail("remediation_not_required",409);
    await patchAssignment(ctx,assignmentId,{remediation_status:"content_viewed",status:"remediation_required"});
    await dbRequest("lms_remediation_events",{method:"POST",prefer:"return=minimal",body:{enrollment_id:ctx.enrollment.id,student_id:ctx.studentId,course_id:ctx.course.courseId,course_version:ctx.enrollment.course_version,assignment_id:assignmentId,event_type:"content_viewed",attempt_number:Math.max(1,row.remediation_attempts)}});
    await audit(ctx,assignmentId,"remediation_content_viewed");
    return {ok:true};
  }

  if (eventType === "sb1495_role_submitted") {
    /* The interactive participatory component. DRE's SB 1495 FAQ requires the applicant to
       "role play as both a consumer and real estate professional" — so a response is written
       and stored per role, and the assignment does not complete until both exist. The database
       enforces the same rule in a trigger, because this endpoint is one caller of it. */
    if (assignmentId !== SB1495.assignmentId) fail("sb1495_wrong_assignment",409);
    const role=String(input.participantRole || "");
    if (!SB1495.roles.some((entry) => entry.id === role)) fail("sb1495_unknown_role");
    const response=String(input.response || "").trim();
    if (response.length < SB1495_MINIMUM_RESPONSE) fail("sb1495_response_too_short");
    const viewedCount=Array.isArray(row.viewed_sections)?row.viewed_sections.length:0;
    /* The scenario is in the lesson. A response written without reading it is a response to
       nothing, so the sections come first — the same ordering the applied exercise uses. */
    if (viewedCount<6) fail("complete_instructional_sections_first",409);
    const result=await rpc("record_sb1495_submission",{
      p_enrollment_id:ctx.enrollment.id,
      p_participant_role:role,
      p_response:response.slice(0,20000),
      p_prompts_answered:Math.max(0,Math.min(20,Number(input.promptsAnswered || 0)))
    });
    await audit(ctx,assignmentId,"sb1495_role_submitted",{participant_role:role,characters:response.length});
    const completed=await finishIfReady(ctx,assignmentId);
    return {ok:true,completed,participation:result?.participation ?? null,revision:result?.revision ?? null};
  }

  if (eventType === "help_requested") {
    const open=await dbRequest(`student_help_requests?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&status=in.(open,assigned)&select=id&limit=1`);
    if (!open?.length) await dbRequest("student_help_requests",{method:"POST",prefer:"return=minimal",body:{student_id:ctx.studentId,enrollment_id:ctx.enrollment.id,course_id:ctx.course.courseId,assignment_id:assignmentId,concept:String(input.concept || "Student requested help").slice(0,240),status:"open"}});
    await audit(ctx,assignmentId,"help_requested");
    return {ok:true};
  }

  const kind=ANSWER_EVENTS.get(eventType);
  if (!kind) fail("invalid_course_event");
  const viewedCount=Array.isArray(row.viewed_sections)?row.viewed_sections.length:0;
  if (kind==="applied" && viewedCount<6) fail("complete_instructional_sections_first",409);
  if (kind==="engagement" && !row.applied_exercise_complete) fail("complete_applied_exercise_first",409);
  if (kind==="remediation" && row.remediation_status!=="content_viewed") fail("view_remediation_first",409);
  const assessment=getCaliforniaAssessment(ctx.course.courseId,assignmentId,kind);
  if (!assessment) fail("assessment_unavailable",409);
  const score=scoreCaliforniaAssessment(assessment,input.answers);
  if (!score) fail("invalid_answers");
  /* One attempt covers the whole item set, so the attempt number comes from the highest
     recorded attempt rather than the row count: a five-item quiz writes five rows. */
  const previous=await dbRequest(`lms_assessment_attempts?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&assessment_kind=eq.${kind}&select=attempt_number&order=attempt_number.desc&limit=1`);
  const attemptNumber=Number(previous?.[0]?.attempt_number || 0)+1;
  const correct=score.passed;
  await dbRequest("lms_assessment_attempts",{method:"POST",prefer:"return=minimal",body:score.results.map((result)=>({enrollment_id:ctx.enrollment.id,student_id:ctx.studentId,course_id:ctx.course.courseId,course_version:ctx.enrollment.course_version,assignment_id:assignmentId,assessment_kind:kind,question_id:result.itemId,selected_choice:result.selectedChoice,correct:result.correct,attempt_number:attemptNumber,reviewer_bypass:false}))});
  if (kind==="applied") {
    await patchAssignment(ctx,assignmentId,{applied_exercise_complete:correct || row.applied_exercise_complete,assessment_attempts:row.assessment_attempts+1,status:"in_progress",started_at:row.started_at || isoNow()});
  } else if (kind==="engagement" && correct) {
    await patchAssignment(ctx,assignmentId,{engagement_check_complete:true,assessment_attempts:row.assessment_attempts+1,status:"in_progress"});
  } else if (kind==="engagement" && !correct) {
    await patchAssignment(ctx,assignmentId,{engagement_check_complete:false,assessment_attempts:row.assessment_attempts+1,remediation_status:"required",remediation_attempts:row.remediation_attempts+1,status:"remediation_required"});
    await dbRequest("lms_remediation_events",{method:"POST",prefer:"return=minimal",body:{enrollment_id:ctx.enrollment.id,student_id:ctx.studentId,course_id:ctx.course.courseId,course_version:ctx.enrollment.course_version,assignment_id:assignmentId,event_type:"triggered",attempt_number:row.remediation_attempts+1}});
  } else if (kind==="remediation") {
    await patchAssignment(ctx,assignmentId,{engagement_check_complete:correct,remediation_status:correct?"satisfied":"content_viewed",remediation_attempts:row.remediation_attempts+1,status:correct?"in_progress":"remediation_required"});
    await dbRequest("lms_remediation_events",{method:"POST",prefer:"return=minimal",body:{enrollment_id:ctx.enrollment.id,student_id:ctx.studentId,course_id:ctx.course.courseId,course_version:ctx.enrollment.course_version,assignment_id:assignmentId,event_type:correct?"alternate_question_correct":"alternate_question_incorrect",attempt_number:row.remediation_attempts+1}});
  }
  await audit(ctx,assignmentId,"assessment_submitted",{kind,correct,percent:score.percent,correct_count:score.correctCount,total_items:score.total,attempt:attemptNumber});
  if (!correct) await maybeSupportFlag(ctx,assignmentId,attemptNumber);
  const completed=await finishIfReady(ctx,assignmentId);
  return {
    ok:true,correct,completed,
    percent:score.percent,correctCount:score.correctCount,total:score.total,
    /* Rationales are withheld on a failed attempt: the student is routed to the
       alternate explanation and the remediation item set instead of being handed the
       answer key to the questions they just missed. */
    results:score.results.map((result)=>({itemId:result.itemId,correct:result.correct,rationale:correct?result.rationale:null})),
    remediationRequired:kind==="engagement" && !correct,
    message:correct ? "Correct. The explanation is now available." : (kind==="engagement" ? "Review the alternate explanation and complete the remediation question." : "Review the lesson section and try again.")
  };
}

export const handler=async(event)=>{
  try {
    const auth=await requireStudentSession(event);
    const cookies=auth.refreshedSession?sessionCookies(auth.refreshedSession):[];
    const input=event.httpMethod==="POST" ? parseJson(event) : {};
    const enrollmentId=event.httpMethod==="GET"
      ? String(event.queryStringParameters?.enrollment_id || "")
      : String(input.enrollmentId || "");
    const ctx=await contextFor(auth.student.id,enrollmentId);
    if (event.httpMethod==="GET") {
      const payload=await coursePayload(ctx,String(event.queryStringParameters?.assignment || ""));
      await audit(ctx,payload.selectedAssignment.id,"course_opened",{mode:ctx.mode});
      if (ctx.mode === "student") {
        await audit(ctx,null,"regulatory_notice_delivered",{
          notices:CALIFORNIA_NOTICES.map((notice) => ({id:notice.id,version:notice.version}))
        });
      }
      return sessionResponse(200,payload,cookies);
    }
    if (event.httpMethod==="POST") {
      requireSameOrigin(event);
      const result=await handleStudentEvent(ctx,input);
      return sessionResponse(200,result,cookies);
    }
    fail("method_not_allowed",405);
  } catch(error) {
    const status=Number(error?.statusCode)||500;
    if(status>=500) console.error("Student course endpoint error",error?.message);
    return sessionResponse(status,{error:status>=500?"student_course_unavailable":error.message});
  }
};
