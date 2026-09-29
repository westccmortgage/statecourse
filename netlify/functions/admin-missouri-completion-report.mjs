import { requireAdmin } from "./_lib/auth.mjs";
import { rpc } from "./_lib/db.mjs";
import { handleError, method, response } from "./_lib/http.mjs";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const handler = async (event) => {
  try {
    method(event, "POST");
    await requireAdmin(event);
    const input = JSON.parse(event.body || "{}");
    if (!isoDate.test(input.period_start || "") || !isoDate.test(input.period_end || "")) {
      throw Object.assign(new Error("invalid_reporting_period"), { statusCode: 400 });
    }
    const report = await rpc("build_missouri_completion_time_report", {
      p_period_start: input.period_start,
      p_period_end: input.period_end,
    });
    return response(200, { report });
  } catch (error) {
    return handleError(error);
  }
};

