import { dbRequest } from './_lib/db.mjs';
import { buildDailyReport, emailDailyReport, previousPacificDay, reportMailConfigured } from './_lib/site/report.mjs';
import { siteConfiguration, siteFailure } from './_lib/site/visit.mjs';

// Every morning: build yesterday's report (Pacific time), keep a copy, and email it.
// 15:00 UTC is 7:00 AM Pacific in winter and 8:00 AM in summer; Netlify schedules run on UTC.
export default async function dailyReport() {
  const report = await buildDailyReport(previousPacificDay());
  let emailed = false, stored = false;
  try { emailed = await emailDailyReport(report); }
  catch (error) {
    const code = String((error as Error)?.message || '').match(/^report_email_failed:\d{3}$/)?.[0] || 'mail_provider_unavailable';
    console.error('Daily site report email failed', { day: report.day, reason: code });
  }
  if (!emailed && !reportMailConfigured()) console.error('Daily site report email not configured', { day: report.day });
  // A missing table must not stop the email, and a failed email must not lose the copy.
  await dbRequest('site_daily_reports?on_conflict=day', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: { day: report.day, report, emailed_at: emailed ? new Date().toISOString() : null } })
    .then(() => { stored = true; }, error => console.error('Daily site report persistence failed', { day: report.day, reason: siteFailure(error), ...siteConfiguration(process.env) }));
  const complete = stored && emailed && report.visits.available && report.accounts.available;
  const outcome = { day: report.day, stored, emailed, visits: report.visits.available, accounts: report.accounts.available };
  if (complete) console.info('Daily site report', outcome);
  else console.error('Daily site report incomplete', { ...outcome, visitError: report.visits.error || null, accountError: report.accounts.error || null });
  return Response.json(outcome, { status: complete ? 200 : 503 });
}
export const config = { schedule: '0 15 * * *' };
