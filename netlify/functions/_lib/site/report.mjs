import { dbRequest, rpc } from '../db.mjs';
import { siteFailure } from './visit.mjs';

// The daily visit report: one calendar day in Pacific time, built from the visit table
// and from the account activity the site already records.

const ZONE = 'America/Los_Angeles';
const parts = (date, options) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hourCycle: 'h23', ...options }).formatToParts(date).map(p => [p.type, p.value]));

// "2026-11-21" for the Pacific calendar day containing this instant.
export function pacificDay(date = new Date()) {
  const p = parts(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${p.year}-${p.month}-${p.day}`;
}
// The instant at which a Pacific calendar day begins. Correct across daylight-saving changes.
function pacificMidnight(day) {
  const [year, month, date] = day.split('-').map(Number);
  let guess = Date.UTC(year, month - 1, date, 8); // 08:00 UTC is midnight PST, 01:00 PDT
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(guess), { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const shown = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
    guess -= shown - Date.UTC(year, month - 1, date);
  }
  return new Date(guess);
}
export function pacificDayWindow(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`))) throw Object.assign(new Error('invalid_day'), { statusCode: 400 });
  const next = new Date(Date.parse(`${day}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
  return { from: pacificMidnight(day), to: pacificMidnight(next) };
}
export const previousPacificDay = (now = new Date()) => pacificDay(new Date(pacificMidnight(pacificDay(now)).getTime() - 3600000));

const name = student => [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() || student?.email || 'Unnamed account';

// Who signed in and what they did, from records the student portal already keeps.
async function accountActivity({ from, to }, request) {
  const range = column => `${column}=gte.${encodeURIComponent(from.toISOString())}&${column}=lt.${encodeURIComponent(to.toISOString())}`;
  const [events, registered] = await Promise.all([
    request(`student_portal_events?${range('occurred_at')}&select=student_id,event_type,occurred_at&order=occurred_at.asc&limit=5000`),
    request(`students?${range('created_at')}&select=id,email,first_name,last_name,created_at&order=created_at.asc&limit=500`),
  ]);
  const byStudent = new Map();
  for (const event of events || []) {
    const entry = byStudent.get(event.student_id) || { studentId: event.student_id, visits: 0, coursesOpened: 0, last: event.occurred_at };
    if (event.event_type === 'portal_opened') entry.visits++;
    if (event.event_type === 'course_resume_clicked') entry.coursesOpened++;
    entry.last = event.occurred_at; byStudent.set(event.student_id, entry);
  }
  const ids = [...byStudent.keys()].slice(0, 200);
  const profiles = ids.length ? await request(`students?id=in.(${ids.map(encodeURIComponent).join(',')})&select=id,email,first_name,last_name&limit=200`) : [];
  const profile = new Map((profiles || []).map(row => [row.id, row]));
  return {
    activeStudents: byStudent.size, truncated: (events || []).length >= 5000,
    students: [...byStudent.values()].sort((a, b) => b.visits + b.coursesOpened - (a.visits + a.coursesOpened)).slice(0, 50)
      .map(entry => ({ name: name(profile.get(entry.studentId)), email: profile.get(entry.studentId)?.email || null, visits: entry.visits, coursesOpened: entry.coursesOpened, last: entry.last })),
    registrations: (registered || []).map(row => ({ name: name(row), email: row.email, at: row.created_at })),
  };
}

// Each half is reported on its own: if visit counting is not installed yet, the account
// activity still arrives, and the report says plainly what is missing.
export async function buildDailyReport(day, { request = dbRequest, call = rpc } = {}) {
  const window = pacificDayWindow(day);
  const [visits, accounts] = await Promise.all([
    call('site_visit_report', { p_from: window.from.toISOString(), p_to: window.to.toISOString() }).then(data => ({ available: true, ...data }), error => ({ available: false, error: siteFailure(error) })),
    accountActivity(window, request).then(data => ({ available: true, ...data }), error => ({ available: false, error: siteFailure(error) })),
  ]);
  return { day, timeZone: ZONE, from: window.from.toISOString(), to: window.to.toISOString(), visits, accounts };
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SOURCE_LABEL = { direct: 'Typed the address or used a bookmark', search: 'Search engines', social: 'Social networks', ai: 'AI assistants', campaign: 'Tagged campaign links', referral: 'Links on other sites' };
const table = (headings, rows) => rows.length ? `<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">` +
  `<tr>${headings.map(h => `<th align="left" style="border-bottom:2px solid #08102b">${esc(h)}</th>`).join('')}</tr>` +
  rows.map(row => `<tr>${row.map(cell => `<td style="border-bottom:1px solid #e7e4de">${esc(cell)}</td>`).join('')}</tr>`).join('') + '</table>' : '<p style="color:#5d6a75">Nothing recorded.</p>';
const place = row => [row.city, row.region, row.country].filter(Boolean).join(', ');

export function renderDailyReport(report) {
  const v = report.visits, a = report.accounts, section = (title, body) => `<h2 style="font-size:17px;color:#08102b;margin:26px 0 8px">${esc(title)}</h2>${body}`;
  const subject = v.available ? `StateCourse ${report.day}: ${v.people.visitors} visitors, ${v.bots.clients + v.suspect.clients} automated`
    : `StateCourse ${report.day}: visit counting not available`;
  const body = [`<p style="color:#5d6a75;margin:0 0 4px">Daily site report · ${esc(report.day)} · Pacific time</p>`];
  if (!v.available) body.push('<p><strong>Visit counting is not available.</strong> The visit table is missing or could not be read, so no visitor numbers are shown for this day.</p>');
  else {
    body.push(section('Who came', table(['', 'Visitors', 'Pages opened'], [['People', v.people.visitors, v.people.views], ['Robots that name themselves', v.bots.clients, v.bots.views], ['Suspicious (not a normal browser)', v.suspect.clients, v.suspect.views]])),
      '<p style="color:#5d6a75;font-size:13px">A robot that imitates a browser well is counted as a person. A robot that neither runs the page script nor loads images is not seen at all.</p>',
      section('Where people came from', table(['Source', 'Visitors'], v.sources.map(row => [SOURCE_LABEL[row.kind] || row.kind, row.visitors]))),
      section('Sites and campaigns', table(['Site or campaign', 'Kind', 'Visitors'], [...v.referrers.map(row => [row.name, SOURCE_LABEL[row.kind] || row.kind, row.visitors]),
        ...v.campaigns.map(row => [[row.source, row.medium, row.campaign].filter(Boolean).join(' / '), 'Campaign tag', row.visitors])])),
      section('Pages people opened', table(['Page', 'Visitors', 'Times opened'], v.pages.map(row => [row.path, row.visitors, row.views]))),
      section('Where they are', table(['Place', 'Visitors'], v.places.map(row => [place(row), row.visitors]))),
      section('Devices', table(['Device', 'Visitors'], v.devices.map(row => [row.device, row.visitors]))),
      section('Robots', table(['Robot', 'Pages opened'], v.bot_names.map(row => [row.name, row.views]))),
      section('Cookie choice', table(['Choice', 'Visitors'], [['Accepted', v.consent.accepted], ['Declined', v.consent.declined], ['No choice made', v.consent.unset]])),
      section('Visitors who accepted cookies', table(['First came from', 'Visitors', 'Opened the registration page', 'Reached My StateCourse'],
        v.remembered.by_first_source.map(row => [SOURCE_LABEL[row.source] || row.source, row.visitors, row.reached_register, row.reached_account]))),
      `<p style="color:#5d6a75;font-size:13px">${v.remembered.new} new and ${v.remembered.returning} returning among visitors who accepted.</p>`);
  }
  if (!a.available) body.push('<p><strong>Account activity could not be read.</strong></p>');
  else body.push(section('New accounts', table(['Name', 'Email', 'Registered'], a.registrations.map(row => [row.name, row.email, new Date(row.at).toLocaleTimeString('en-US', { timeZone: ZONE, hour: 'numeric', minute: '2-digit' })]))),
    section(`Signed-in students (${a.activeStudents})`, table(['Name', 'Email', 'Opened My StateCourse', 'Opened a course'], a.students.map(row => [row.name, row.email, row.visits, row.coursesOpened]))));
  return { subject, html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#33424f;max-width:720px">${body.join('')}</div>` };
}

export function reportMailConfigured(env = process.env) {
  return env.SITE_REPORT_DELIVERY === 'netlify-forms' || Boolean(String(env.RESEND_API_KEY || '').trim());
}

// Plain text for the school's existing Netlify email notifications. Input is the
// controlled, escaped HTML above; only its table and paragraph formatting is removed.
function reportText(html) {
  return html.replace(/<\/(?:th|td)>/g, '\t').replace(/<\/(?:tr|h2|p)>/g, '\n')
    .replace(/<[^>]*>/g, '').replace(/\t+\n/g, '\n')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
}

// Explicit native delivery reuses the school's verified info@ notification; otherwise
// retain the existing Resend transport. Recipients cannot be supplied by a visitor.
export async function emailDailyReport(report, { env = process.env, fetcher = globalThis.fetch } = {}) {
  const { subject, html } = renderDailyReport(report);
  if (env.SITE_REPORT_DELIVERY === 'netlify-forms') {
    const response = await fetcher('https://statecourse.com/site-report-notification-form/', {
      method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(15000),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'statecourse-daily-reports', 'bot-field': '',
        name: `StateCourse daily report — ${report.day}`, email: 'info@statecourse.com', subject, day: report.day,
        message: `This is the StateCourse daily visitor and student activity report. All times are Pacific.\n\n${reportText(html)}` }).toString(),
    });
    if (!response.ok) throw new Error(`report_email_failed:${response.status}`);
    return true;
  }
  const key = String(env.RESEND_API_KEY || '').trim();
  if (!key) return false;
  const response = await fetcher('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: String(env.SITE_REPORT_FROM || '').trim() || 'StateCourse Reports <reports@statecourse.com>',
      to: [String(env.SITE_REPORT_TO || '').trim() || 'data@statecourse.com'], subject, html }) });
  if (!response.ok) throw new Error(`report_email_failed:${response.status}`);
  return true;
}
