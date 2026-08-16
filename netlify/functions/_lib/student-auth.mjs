import { dbRequest } from "./db.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^\S+@\S+\.\S+$/;

function validateInput(input) {
  if (!UUID.test(input.studentId || "")) throw Object.assign(new Error("invalid_student_id"), { statusCode: 400 });
  if (!EMAIL.test(input.email || "")) throw Object.assign(new Error("invalid_email"), { statusCode: 400 });
}

export async function resolveCheckoutStudent(event, input, { qaOnly }) {
  validateInput(input);
  const email = String(input.email).trim().toLowerCase();

  if (qaOnly) {
    await dbRequest("students?on_conflict=id", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: {
        id: input.studentId,
        email,
        first_name: String(input.firstName || "QA").trim().slice(0, 100),
        last_name: String(input.lastName || "Student").trim().slice(0, 100),
        updated_at: new Date().toISOString(),
      },
    });
    return { id: input.studentId, email, qaOnly: true };
  }

  const token = String(event.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) throw Object.assign(new Error("student_auth_required"), { statusCode: 401 });
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!response.ok) throw Object.assign(new Error("invalid_student_session"), { statusCode: 401 });
  const student = await response.json();
  if (student.id !== input.studentId || String(student.email || "").toLowerCase() !== email) {
    throw Object.assign(new Error("student_session_mismatch"), { statusCode: 403 });
  }
  await dbRequest("students?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      id: student.id,
      email,
      first_name: String(input.firstName || student.user_metadata?.first_name || "").trim().slice(0, 100) || null,
      last_name: String(input.lastName || student.user_metadata?.last_name || "").trim().slice(0, 100) || null,
      updated_at: new Date().toISOString(),
    },
  });
  return { id: student.id, email, qaOnly: false };
}
