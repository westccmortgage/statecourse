import { NextRequest, NextResponse } from "next/server";

const COURSE_ID = "va-salesperson-principles-v1";

export async function GET(request: NextRequest) {
  const { env } = await import("cloudflare:workers");
  const email = request.headers.get("oai-authenticated-user-email")?.toLowerCase();
  if (!email || !env.DB) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const role = await env.DB.prepare(`SELECT role FROM course_roles WHERE user_email = ? AND course_id = ? AND role IN ('instructor','admin') AND active = 1 LIMIT 1`)
    .bind(email, COURSE_ID).first<{ role: string }>();
  if (!role) return NextResponse.json({ error: "Instructor or administrator role required" }, { status: 403 });
  const rows = await env.DB.prepare(`SELECT id, student_id, student_email, course_id, course_version, hour_id, concept,
    attempts, last_activity_at, help_requested, status, instructor_id, resolved_at
    FROM instructor_support_queue WHERE course_id = ? ORDER BY CASE status WHEN 'open' THEN 0 ELSE 1 END, last_activity_at DESC LIMIT 250`)
    .bind(COURSE_ID).all();
  return NextResponse.json({ records: rows.results });
}
