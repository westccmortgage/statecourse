import { NextRequest, NextResponse } from "next/server";

const COURSE_ID = "va-salesperson-principles-v1";
const COURSE_VERSION = "1.0-submission-draft";
const APPROVAL_STATUS = "submission_draft";
const REQUIRED_SECONDS = 3_000;
const REQUIRED_SECTIONS = 3;
const MAX_HEARTBEAT_GAP = 45;
const HEARTBEAT_CAP = 20;
const IDLE_AFTER = 120;

type CourseRole = "student" | "reviewer" | "regulator" | "admin" | "instructor";
type ProgressRow = {
  active_seconds: number;
  sections_viewed_json: string;
  activity_complete: number;
  engagement_complete: number;
  remediation_triggered: number;
  remediation_content_viewed: number;
  remediation_satisfied: number;
  compliance_block: string | null;
  completed_at: string | null;
};

const HOUR_ONE = {
  concept: "Local real estate markets and land immobility",
  primary: {
    id: "va-v1-h01-primary-01",
    prompt: "Why does the immobility of land make real estate markets local?",
    options: [
      "Because location-specific employment, infrastructure, regulation, schools, amenities, and supply affect demand and value.",
      "Because every parcel can be moved to a market with stronger demand.",
      "Because national averages always determine the value of an individual parcel.",
      "Because immobility prevents property ownership from being transferred.",
    ],
    correctIndex: 0,
    rationale: "Land cannot move to meet demand elsewhere, so location-specific forces directly shape its market.",
  },
  remediation: {
    explanation: "Immobility means the parcel stays in one place. Demand must come to that location, so nearby jobs, roads, services, land-use rules, amenities, and competing supply matter.",
    scenario: "Two physically similar homes are located in different counties. One is near expanding employment and transit; the other is far from services with rising inventory. Their local demand conditions can produce different prices even though the buildings are similar.",
    id: "va-v1-h01-remediation-01",
    prompt: "Which fact best explains why the two similar homes may have different market values?",
    options: [
      "The homes are legally required to sell for the same price.",
      "Their different location-specific demand, services, regulation, and competing supply affect their separate local markets.",
      "Only the national median home price may be considered.",
      "Physical similarity eliminates the effect of location.",
    ],
    correctIndex: 1,
    rationale: "Physical similarity does not erase location. Each parcel participates in its own local competitive environment.",
  },
};

async function db() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function nowIso() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }

async function opaqueToken(questionId: string, optionIndex: number) {
  const bytes = new TextEncoder().encode(`${COURSE_ID}:${COURSE_VERSION}:${questionId}:${optionIndex}:server-only-v1`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function publicQuestion(question: typeof HOUR_ONE.primary) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: await Promise.all(question.options.map(async (label, index) => ({ label, token: await opaqueToken(question.id, index) }))),
  };
}

async function correctToken(question: typeof HOUR_ONE.primary) {
  return opaqueToken(question.id, question.correctIndex);
}

async function requestMetadata(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unavailable";
  const agent = request.headers.get("user-agent") ?? "unavailable";
  const bytes = new TextEncoder().encode(`${ip}|${agent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return { fingerprint: [...new Uint8Array(digest)].slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("") };
}

async function ensureCourseVersion() {
  const database = await db();
  await database.prepare(`INSERT OR IGNORE INTO course_versions
    (course_id, version, state, title, approval_status, rules_json, content_hash, created_at)
    VALUES (?, ?, 'VA', 'Virginia Principles & Practices of Real Estate', 'submission_draft', ?, 'submission-draft-content-v1', ?)`)
    .bind(COURSE_ID, COURSE_VERSION, JSON.stringify({ requiredActiveSeconds: REQUIRED_SECONDS, requiredSections: REQUIRED_SECTIONS, sequentialNavigation: true }), nowIso()).run();
}

async function contextFor(request: NextRequest) {
  const database = await db();
  const email = request.headers.get("oai-authenticated-user-email")?.toLowerCase() ?? null;
  if (!email) return { email: null, role: "reviewer" as CourseRole, enrollment: null };
  const enrollment = await database.prepare(`SELECT * FROM course_enrollments
    WHERE student_email = ? AND course_id = ? AND course_version = ? AND status = 'active' LIMIT 1`)
    .bind(email, COURSE_ID, COURSE_VERSION).first<Record<string, unknown>>();
  if (enrollment) return { email, role: "student" as CourseRole, enrollment };
  const roleRow = await database.prepare(`SELECT role FROM course_roles WHERE user_email = ? AND course_id = ? AND active = 1
    ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'regulator' THEN 2 WHEN 'reviewer' THEN 3 WHEN 'instructor' THEN 4 ELSE 5 END LIMIT 1`)
    .bind(email, COURSE_ID).first<{ role: CourseRole }>();
  return { email, role: roleRow?.role ?? "reviewer", enrollment: null };
}

function normalizeProgress(row: ProgressRow | null, hour: number) {
  if (!row) return {
    hourId: hour, activeSeconds: 0, sectionsViewed: [], activityComplete: false,
    engagementComplete: false, remediationTriggered: false, remediationContentViewed: false,
    remediationSatisfied: false, complianceBlock: null, completedAt: null,
  };
  return {
    hourId: hour,
    activeSeconds: row.active_seconds,
    sectionsViewed: JSON.parse(row.sections_viewed_json || "[]"),
    activityComplete: Boolean(row.activity_complete),
    engagementComplete: Boolean(row.engagement_complete),
    remediationTriggered: Boolean(row.remediation_triggered),
    remediationContentViewed: Boolean(row.remediation_content_viewed),
    remediationSatisfied: Boolean(row.remediation_satisfied),
    complianceBlock: row.compliance_block,
    completedAt: row.completed_at,
  };
}

function completed(progress: ReturnType<typeof normalizeProgress>) {
  return progress.activeSeconds >= REQUIRED_SECONDS && progress.sectionsViewed.length >= REQUIRED_SECTIONS &&
    progress.activityComplete && progress.engagementComplete &&
    (!progress.remediationTriggered || progress.remediationSatisfied) && !progress.complianceBlock;
}

async function getProgress(enrollmentId: string, hour: number) {
  const database = await db();
  const row = await database.prepare("SELECT * FROM hour_progress WHERE enrollment_id = ? AND hour_id = ?")
    .bind(enrollmentId, hour).first<ProgressRow>();
  return normalizeProgress(row, hour);
}

async function ensureProgress(enrollmentId: string, hour: number) {
  const database = await db();
  await database.prepare(`INSERT OR IGNORE INTO hour_progress
    (enrollment_id, course_id, course_version, hour_id, updated_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(enrollmentId, COURSE_ID, COURSE_VERSION, hour, nowIso()).run();
}

async function audit(request: NextRequest, actorId: string, role: CourseRole, enrollmentId: string | null, studentId: string | null, hour: number | null, eventType: string, event: unknown, sessionId: string | null = null) {
  const database = await db();
  await database.prepare(`INSERT INTO course_audit_log
    (id, actor_id, actor_role, student_id, enrollment_id, course_id, course_version, hour_id, event_type, event_json, session_id, request_metadata_json, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(uuid(), actorId, role, studentId, enrollmentId, COURSE_ID, COURSE_VERSION, hour, eventType, JSON.stringify(event), sessionId, JSON.stringify(await requestMetadata(request)), nowIso()).run();
}

export async function GET(request: NextRequest) {
  try {
    await ensureCourseVersion();
    const database = await db();
    const url = new URL(request.url);
    const hour = Math.min(60, Math.max(1, Number(url.searchParams.get("hour")) || 1));
    const ctx = await contextFor(request);
    const enrollmentId = ctx.enrollment?.id as string | undefined;
    const creditEligible = Boolean(ctx.enrollment?.compliance_credit_eligible) && APPROVAL_STATUS === "approved";
    let progress = normalizeProgress(null, hour);
    let completedHours: number[] = [];
    let currentHour = 1;
    if (enrollmentId) {
      await ensureProgress(enrollmentId, hour);
      progress = await getProgress(enrollmentId, hour);
      completedHours = (await database.prepare("SELECT hour_id FROM hour_progress WHERE enrollment_id = ? AND completed_at IS NOT NULL ORDER BY hour_id")
        .bind(enrollmentId).all<{ hour_id: number }>()).results.map((row) => row.hour_id);
      currentHour = Number(ctx.enrollment?.current_hour ?? 1);
    }
    const bypass = ["reviewer", "regulator", "admin"].includes(ctx.role);
    const canAccess = bypass || (ctx.role === "student" && (completedHours.includes(hour) || hour === currentHour));
    return NextResponse.json({
      mode: ctx.role,
      reviewerBypass: bypass,
      complianceCreditEligible: creditEligible,
      courseId: COURSE_ID,
      courseVersion: COURSE_VERSION,
      approvalStatus: APPROVAL_STATUS,
      requiredActiveSeconds: REQUIRED_SECONDS,
      requiredSections: REQUIRED_SECTIONS,
      completedHours,
      currentHour,
      canAccess,
      progress,
      assessment: hour === 1 ? {
        concept: HOUR_ONE.concept,
        primary: await publicQuestion(HOUR_ONE.primary),
        remediation: {
          explanation: progress.remediationTriggered || bypass ? HOUR_ONE.remediation.explanation : null,
          scenario: progress.remediationTriggered || bypass ? HOUR_ONE.remediation.scenario : null,
          question: progress.remediationTriggered || bypass ? await publicQuestion(HOUR_ONE.remediation) : null,
        },
      } : { concept: "Secure engagement item pending publication for this submission-draft hour", primary: null, remediation: null },
      notice: bypass
        ? "Regulatory Review Mode — time and sequencing restrictions bypassed"
        : creditEligible ? null : "Student simulation — activity is non-credit until course approval and an eligible enrollment are active",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Course compliance service unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureCourseVersion();
    const database = await db();
    const ctx = await contextFor(request);
    if (ctx.role !== "student" || !ctx.enrollment) {
      return NextResponse.json({ error: "Reviewer and administrator actions never create student completion credit" }, { status: 403 });
    }
    const body = await request.json() as Record<string, unknown>;
    const hour = Math.min(60, Math.max(1, Number(body.hour) || 1));
    const enrollmentId = String(ctx.enrollment.id);
    const studentId = String(ctx.enrollment.student_id);
    const currentHour = Number(ctx.enrollment.current_hour ?? 1);
    if (hour !== currentHour && !(await getProgress(enrollmentId, hour)).completedAt) {
      return NextResponse.json({ error: "This hour is locked until the preceding hour is completed" }, { status: 423 });
    }
    await ensureProgress(enrollmentId, hour);
    const action = String(body.action ?? "");
    const stamp = nowIso();

    if (action === "heartbeat") {
      const sessionId = String(body.sessionId ?? "");
      if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
      const session = await database.prepare("SELECT * FROM study_sessions WHERE id = ? AND enrollment_id = ?")
        .bind(sessionId, enrollmentId).first<Record<string, unknown>>();
      if (!session) {
        await database.prepare(`INSERT INTO study_sessions
          (id, enrollment_id, course_id, course_version, hour_id, started_at, last_heartbeat_at, session_metadata_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(sessionId, enrollmentId, COURSE_ID, COURSE_VERSION, hour, stamp, stamp, JSON.stringify({ userAgent: "hashed-in-audit-record" })).run();
      } else {
        const last = Date.parse(String(session.last_heartbeat_at ?? stamp));
        const elapsed = Math.max(0, Math.floor((Date.now() - last) / 1_000));
        const signalsActive = body.visible === true && body.focused === true && body.connected === true && Number(body.secondsSinceInteraction) <= IDLE_AFTER;
        const credit = Boolean(ctx.enrollment.compliance_credit_eligible) && APPROVAL_STATUS === "approved" && signalsActive && elapsed <= MAX_HEARTBEAT_GAP ? Math.min(elapsed, HEARTBEAT_CAP) : 0;
        await database.batch([
          database.prepare("UPDATE study_sessions SET last_heartbeat_at = ?, active_seconds = active_seconds + ?, inactive_seconds = inactive_seconds + ? WHERE id = ?")
            .bind(stamp, credit, Math.max(0, elapsed - credit), sessionId),
          database.prepare("UPDATE hour_progress SET active_seconds = active_seconds + ?, updated_at = ?, revision = revision + 1 WHERE enrollment_id = ? AND hour_id = ?")
            .bind(credit, stamp, enrollmentId, hour),
        ]);
      }
    } else if (action === "section") {
      const sectionId = String(body.sectionId ?? "");
      if (!['objectives', 'instruction', 'sequence'].includes(sectionId)) return NextResponse.json({ error: "Unknown required section" }, { status: 400 });
      const current = await getProgress(enrollmentId, hour);
      const sections = [...new Set([...current.sectionsViewed, sectionId])];
      await database.prepare("UPDATE hour_progress SET sections_viewed_json = ?, updated_at = ?, revision = revision + 1 WHERE enrollment_id = ? AND hour_id = ?")
        .bind(JSON.stringify(sections), stamp, enrollmentId, hour).run();
      await audit(request, ctx.email ?? studentId, ctx.role, enrollmentId, studentId, hour, "section_viewed", { sectionId });
    } else if (action === "activity") {
      await database.prepare("UPDATE hour_progress SET activity_complete = 1, updated_at = ?, revision = revision + 1 WHERE enrollment_id = ? AND hour_id = ?")
        .bind(stamp, enrollmentId, hour).run();
      await audit(request, ctx.email ?? studentId, ctx.role, enrollmentId, studentId, hour, "applied_activity_completed", {});
    } else if (action === "remediation_view") {
      await database.prepare("UPDATE hour_progress SET remediation_content_viewed = 1, updated_at = ?, revision = revision + 1 WHERE enrollment_id = ? AND hour_id = ? AND remediation_triggered = 1")
        .bind(stamp, enrollmentId, hour).run();
      await database.prepare(`INSERT INTO remediation_events
        (id, enrollment_id, course_id, course_version, hour_id, event_type, occurred_at) VALUES (?, ?, ?, ?, ?, 'content_viewed', ?)`)
        .bind(uuid(), enrollmentId, COURSE_ID, COURSE_VERSION, hour, stamp).run();
    } else if (action === "assessment") {
      if (hour !== 1) return NextResponse.json({ error: "Secure engagement item is not published for this draft hour" }, { status: 409 });
      const assessmentType = body.assessmentType === "remediation" ? "remediation" : "primary";
      const item = assessmentType === "remediation" ? HOUR_ONE.remediation : HOUR_ONE.primary;
      const answerToken = String(body.answerToken ?? "");
      const isCorrect = answerToken === await correctToken(item);
      const attempts = await database.prepare("SELECT COUNT(*) AS count FROM assessment_attempts WHERE enrollment_id = ? AND hour_id = ? AND assessment_type = ?")
        .bind(enrollmentId, hour, assessmentType).first<{ count: number }>();
      const attemptNumber = Number(attempts?.count ?? 0) + 1;
      await database.prepare(`INSERT INTO assessment_attempts
        (id, enrollment_id, course_id, course_version, hour_id, concept, assessment_type, question_id, answer_token, correct, attempt_number, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(uuid(), enrollmentId, COURSE_ID, COURSE_VERSION, hour, HOUR_ONE.concept, assessmentType, item.id, answerToken, isCorrect ? 1 : 0, attemptNumber, stamp).run();
      if (assessmentType === "primary") {
        await database.prepare(`UPDATE hour_progress SET engagement_complete = ?, remediation_triggered = ?, updated_at = ?, revision = revision + 1
          WHERE enrollment_id = ? AND hour_id = ?`)
          .bind(isCorrect ? 1 : 0, isCorrect ? 0 : 1, stamp, enrollmentId, hour).run();
      } else {
        const current = await getProgress(enrollmentId, hour);
        const satisfied = isCorrect && current.remediationContentViewed;
        await database.prepare(`UPDATE hour_progress SET engagement_complete = ?, remediation_satisfied = ?, updated_at = ?, revision = revision + 1
          WHERE enrollment_id = ? AND hour_id = ?`)
          .bind(satisfied ? 1 : 0, satisfied ? 1 : 0, stamp, enrollmentId, hour).run();
        await database.prepare(`INSERT INTO remediation_events
          (id, enrollment_id, course_id, course_version, hour_id, event_type, question_id, correct, attempt_number, occurred_at)
          VALUES (?, ?, ?, ?, ?, 'alternate_assessment', ?, ?, ?, ?)`)
          .bind(uuid(), enrollmentId, COURSE_ID, COURSE_VERSION, hour, item.id, isCorrect ? 1 : 0, attemptNumber, stamp).run();
      }
      await audit(request, ctx.email ?? studentId, ctx.role, enrollmentId, studentId, hour, "assessment_attempt", { assessmentType, questionId: item.id, correct: isCorrect, attemptNumber });
      const totalFailures = await database.prepare("SELECT COUNT(*) AS count FROM assessment_attempts WHERE enrollment_id = ? AND hour_id = ? AND correct = 0")
        .bind(enrollmentId, hour).first<{ count: number }>();
      if (Number(totalFailures?.count ?? 0) >= 3) {
        await database.prepare(`INSERT INTO instructor_support_queue
          (id, enrollment_id, student_id, student_email, course_id, course_version, hour_id, concept, attempts, last_activity_at, help_requested, status)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'open'
          WHERE NOT EXISTS (SELECT 1 FROM instructor_support_queue WHERE enrollment_id = ? AND hour_id = ? AND status = 'open')`)
          .bind(uuid(), enrollmentId, studentId, String(ctx.enrollment.student_email), COURSE_ID, COURSE_VERSION, hour, HOUR_ONE.concept, Number(totalFailures?.count), stamp, enrollmentId, hour).run();
      }
      if (isCorrect) (body as Record<string, unknown>).rationale = item.rationale;
    } else if (action === "request_help") {
      await database.prepare(`INSERT INTO instructor_support_queue
        (id, enrollment_id, student_id, student_email, course_id, course_version, hour_id, concept, attempts, last_activity_at, help_requested, status)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, 'open'
        WHERE NOT EXISTS (SELECT 1 FROM instructor_support_queue WHERE enrollment_id = ? AND hour_id = ? AND status = 'open')`)
        .bind(uuid(), enrollmentId, studentId, String(ctx.enrollment.student_email), COURSE_ID, COURSE_VERSION, hour, HOUR_ONE.concept, stamp, enrollmentId, hour).run();
      await audit(request, ctx.email ?? studentId, ctx.role, enrollmentId, studentId, hour, "instructor_help_requested", {});
    } else if (action === "end_session") {
      await database.prepare("UPDATE study_sessions SET ended_at = ?, status = 'ended' WHERE id = ? AND enrollment_id = ?")
        .bind(stamp, String(body.sessionId ?? ""), enrollmentId).run();
    } else {
      return NextResponse.json({ error: "Unknown course action" }, { status: 400 });
    }

    let progress = await getProgress(enrollmentId, hour);
    if (completed(progress) && !progress.completedAt) {
      await database.batch([
        database.prepare("UPDATE hour_progress SET completed_at = ?, updated_at = ?, revision = revision + 1 WHERE enrollment_id = ? AND hour_id = ? AND completed_at IS NULL")
          .bind(stamp, stamp, enrollmentId, hour),
        database.prepare("UPDATE course_enrollments SET current_hour = CASE WHEN current_hour = ? AND current_hour < 60 THEN current_hour + 1 ELSE current_hour END WHERE id = ?")
          .bind(hour, enrollmentId),
      ]);
      await audit(request, ctx.email ?? studentId, ctx.role, enrollmentId, studentId, hour, "hour_completed", { activeSeconds: progress.activeSeconds, nextHour: Math.min(60, hour + 1) }, String(body.sessionId ?? "") || null);
      progress = await getProgress(enrollmentId, hour);
    }
    const response: Record<string, unknown> = { ok: true, progress, completed: Boolean(progress.completedAt), nextHourUnlocked: Boolean(progress.completedAt && hour < 60) };
    if (action === "assessment" && body.rationale) response.rationale = body.rationale;
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Course compliance update failed" }, { status: 500 });
  }
}
