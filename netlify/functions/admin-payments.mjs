import { requireAdmin } from "./_lib/auth.mjs";
import { dbRequest } from "./_lib/db.mjs";
import { handleError, method, response } from "./_lib/http.mjs";

const safe = (value) => encodeURIComponent(String(value).replace(/[,*()]/g, ""));

export const handler = async (event) => {
  try {
    method(event, "GET");
    requireAdmin(event);
    const query = event.queryStringParameters || {};
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200);
    const filters = [];
    if (query.state) filters.push(`state=eq.${safe(query.state.toUpperCase())}`);
    if (query.course_id) filters.push(`course_id=eq.${safe(query.course_id)}`);
    if (query.payment_status) filters.push(`payment_status=eq.${safe(query.payment_status)}`);
    if (query.student_id) filters.push(`student_id=eq.${safe(query.student_id)}`);
    if (query.enrollment_id) filters.push(`enrollment_id=eq.${safe(query.enrollment_id)}`);
    const path = `admin_payment_ledger?select=*&${filters.join("&")}${filters.length ? "&" : ""}order=payment_date.desc&limit=${limit}`;
    const rows = await dbRequest(path);
    return response(200, { orders: rows || [] });
  } catch (error) {
    return handleError(error);
  }
};
