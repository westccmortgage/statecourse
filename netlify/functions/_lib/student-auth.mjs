import { dbRequest } from "./db.mjs";
import { requireStudentSession } from "./student-session.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^\S+@\S+\.\S+$/;

function validateInput(input) {
  if (!UUID.test(input.studentId || "")) throw Object.assign(new Error("invalid_student_id"), { statusCode: 400 });
  if (!EMAIL.test(input.email || "")) throw Object.assign(new Error("invalid_email"), { statusCode: 400 });
}

export async function resolveCheckoutStudent(event, input, { qaOnly }) {
  validateInput(input);
  const email = String(input.email).trim().toLowerCase();
  const auth = await requireStudentSession(event);
  if (auth.student.id !== input.studentId || String(auth.student.email || "").toLowerCase() !== email) {
    throw Object.assign(new Error("student_session_mismatch"), { statusCode: 403 });
  }
  await dbRequest("students?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      id: auth.student.id,
      email,
      first_name: String(input.firstName || auth.student.firstName || "").trim().slice(0, 100) || null,
      last_name: String(input.lastName || auth.student.lastName || "").trim().slice(0, 100) || null,
      updated_at: new Date().toISOString(),
    },
  });
  return { id: auth.student.id, email, qaOnly:Boolean(qaOnly) };
}
