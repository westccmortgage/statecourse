import { dbRequest } from './_lib/db.mjs';
import { buildDailyReport, emailDailyReport, previousPacificDay } from './_lib/site/report.mjs';

// Every morning: build yesterday's report (Pacific time), keep a copy, and email it.
// 15:00 UTC is 7:00 AM Pacific in winter and 8:00 AM in summer; Netlify schedules run on UTC.
export default async function dailyReport() {
  const report = await buildDailyReport(previousPacificDay());
  let emailed = false;
  try { emailed = await emailDailyReport(report); }
  catch (error) { console.error('Daily site report email failed', String((error as Error)?.message || '').slice(0, 60)); }
  // A missing table must not stop the email, and a failed email must not lose the copy.
  await dbRequest('site_daily_reports?on_conflict=day', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: { day: report.day, report, emailed_at: emailed ? new Date().toISOString() : null } }).catch(() => console.error('Daily site report copy was not stored'));
  console.info('Daily site report', { day: report.day, emailed, visits: report.visits.available, accounts: report.accounts.available });
}
export const config = { schedule: '0 15 * * *' };
