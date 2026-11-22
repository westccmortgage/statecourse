import {withLambda} from '@netlify/aws-lambda-compat';
import { requireAdmin } from "./_lib/auth.mjs";
import { handleError, method, response } from "./_lib/http.mjs";
import { buildDailyReport, pacificDay, previousPacificDay } from "./_lib/site/report.mjs";

// The visit report for one Pacific day, for the owner and administrators only. Built on
// request, so today's figures can be read before the morning email covers them.
const handler=async(event)=>{
  try{
    method(event,"GET");await requireAdmin(event);
    const asked=String(event.queryStringParameters?.day||"");
    const day=asked==="today"?pacificDay():asked||previousPacificDay();
    return response(200,await buildDailyReport(day));
  }catch(error){return handleError(error);}
};
export {handler as legacyHandler};
export default withLambda(handler);
