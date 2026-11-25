import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { browserOf, buildVisit, classifyVisitor, dayHash, deviceOf, publicPath, sourceOf, siteConfiguration, siteFailure } from '../netlify/functions/_lib/site/visit.mjs';
import { buildDailyReport, emailDailyReport, pacificDay, pacificDayWindow, previousPacificDay, renderDailyReport, reportMailConfigured } from '../netlify/functions/_lib/site/report.mjs';
import { countsVisits, injectInto, pagePath } from '../scripts/inject-site-analytics.mjs';
import collect, { config as collectConfig } from '../netlify/functions/site-collect.mts';
import dailyReport from '../netlify/functions/site-daily-report.mts';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const person = { scriptRan: true, webdriver: false };

test('people, robots that name themselves, and clients that are not a normal browser', () => {
  assert.deepEqual(classifyVisitor(CHROME, person), { visitorClass: 'human', botName: null });
  assert.deepEqual(classifyVisitor(IPHONE, person), { visitorClass: 'human', botName: null });
  for (const [ua, name] of [['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Googlebot'],
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)', 'GPTBot'],
    ['Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'ClaudeBot'], ['Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', 'Bingbot'],
    ['facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'Meta'], ['Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'AhrefsBot']])
    assert.deepEqual(classifyVisitor(ua, person), { visitorClass: 'bot', botName: name }, ua);
  // A robot is a robot even when it ran the page script.
  for (const ua of ['curl/8.5.0', 'python-requests/2.32.3', 'Go-http-client/2.0', 'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/131.0.0.0 Safari/537.36', 'SomeNewCrawler/1.0 (+https://example.test)'])
    assert.equal(classifyVisitor(ua, person).visitorClass, 'bot', ua);
  // Not a named robot, but not a normal browser either.
  assert.equal(classifyVisitor('', person).visitorClass, 'suspect');
  assert.equal(classifyVisitor('Mozilla/4.0', person).visitorClass, 'suspect');
  assert.equal(classifyVisitor(CHROME, { scriptRan: true, webdriver: true }).visitorClass, 'suspect', 'a browser driven by automation');
  assert.equal(classifyVisitor(CHROME, { scriptRan: false, webdriver: false }).visitorClass, 'suspect', 'a browser name without running the page script');
  assert.equal(deviceOf(CHROME), 'desktop'); assert.equal(deviceOf(IPHONE), 'mobile');
  assert.equal(deviceOf('Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'), 'tablet'); assert.equal(deviceOf('curl/8'), 'other');
  assert.equal(browserOf(CHROME), 'Chrome'); assert.equal(browserOf(IPHONE), 'Safari');
  assert.equal(browserOf('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/131.0 Safari/537.36 Edg/131.0'), 'Edge');
});

test('where a visit came from: only the referring site\'s name is kept', () => {
  const from = (referrer, utmSource) => sourceOf({ referrer, utmSource, siteHost: 'statecourse.com' });
  assert.deepEqual(from('', null), { sourceKind: 'direct', sourceName: null });
  assert.deepEqual(from('https://www.google.com/search?q=private+words', null), { sourceKind: 'search', sourceName: 'google.com' });
  assert.deepEqual(from('https://duckduckgo.com/', null), { sourceKind: 'search', sourceName: 'duckduckgo.com' });
  assert.deepEqual(from('https://l.facebook.com/l.php?u=x', null), { sourceKind: 'social', sourceName: 'l.facebook.com' });
  assert.deepEqual(from('https://chatgpt.com/', null), { sourceKind: 'ai', sourceName: 'chatgpt.com' });
  assert.deepEqual(from('https://gemini.google.com/app', null), { sourceKind: 'ai', sourceName: 'gemini.google.com' }, 'not counted as Google search');
  assert.deepEqual(from('https://some-blog.example/post/9', null), { sourceKind: 'referral', sourceName: 'some-blog.example' });
  assert.deepEqual(from('https://statecourse.com/mortgage/', null), { sourceKind: 'internal', sourceName: null });
  assert.deepEqual(from('https://www.google.com/', 'Newsletter'), { sourceKind: 'campaign', sourceName: 'newsletter' }, 'a campaign tag outranks the referrer');
  for (const bad of ['javascript:alert(1)', 'not a url', 'ftp://x.example/']) assert.equal(from(bad, null).sourceKind, 'direct');
  assert.equal(from('', '<script>').sourceKind, 'direct', 'a tag with markup in it is ignored');
});

test('only public page addresses are recorded, without query strings', () => {
  assert.equal(publicPath('/mortgage/?utm_source=x&email=a@b.c#top'), '/mortgage/');
  assert.equal(publicPath('/real-estate/california/index.html'), '/real-estate/california/');
  assert.equal(publicPath('/student/'), '/student/');
  for (const refused of ['/admin/console/', '/api/collect', '/staff/x', '//evil.example/', '/a/../admin/', 'https://evil.example/', '', null, '/a b', '/x<script>'])
    assert.equal(publicPath(refused), null, String(refused));
});

test('a stored visit holds no address, no full browser string, and no visitor number without consent', () => {
  const request = { userAgent: CHROME, ip: '203.0.113.9', siteHost: 'statecourse.com', secret: 's', scriptRan: true, now: new Date('2026-11-22T10:00:00Z'),
    geo: { city: 'Los Angeles', country: { code: 'US' }, subdivision: { name: 'California' } } };
  const vid = randomUUID();
  const visit = buildVisit({ p: '/mortgage/?x=1', r: 'https://www.google.com/search?q=nmls', c: 'accepted', v: vid, us: null, w: 0 }, request);
  assert.deepEqual(visit, { kind: 'view', path: '/mortgage/', source_kind: 'search', source_name: 'google.com', utm_source: null, utm_medium: null, utm_campaign: null,
    country: 'US', region: 'California', city: 'Los Angeles', device: 'desktop', browser: 'Chrome', visitor_class: 'human', bot_name: null, script_ran: true,
    day_hash: visit.day_hash, consent: 'accepted', visitor_id: vid });
  assert.match(visit.day_hash, /^[a-f0-9]{16}$/);
  assert.doesNotMatch(JSON.stringify(visit), /203\.0\.113|AppleWebKit|nmls|x=1/);
  // No visitor number unless the visitor accepted.
  for (const c of ['declined', 'unset', undefined, 'yes']) assert.equal(buildVisit({ p: '/', c, v: vid }, request).visitor_id, null, String(c));
  assert.equal(buildVisit({ p: '/', c: 'accepted', v: 'not-a-uuid' }, request).visitor_id, null);
  // Global Privacy Control overrides an earlier acceptance.
  const gpc = buildVisit({ p: '/', c: 'accepted', v: vid }, { ...request, globalPrivacyControl: true });
  assert.equal(gpc.consent, 'declined'); assert.equal(gpc.visitor_id, null);
  // A robot is never given a visitor number, whatever it sends.
  assert.equal(buildVisit({ p: '/', c: 'accepted', v: vid }, { ...request, userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' }).visitor_id, null);
  assert.equal(buildVisit({ p: '/', c: 'accepted', v: vid, k: 'consent' }, request).kind, 'consent');
  assert.equal(buildVisit({ p: '/', c: 'declined', k: 'consent' }, request).kind, 'view', 'only an acceptance is a consent record');
  assert.equal(buildVisit({ p: '/admin/console/' }, request), null);
  // The daily mark: same browser same day, different the next day, different with another key.
  const mark = extra => dayHash({ ip: '203.0.113.9', userAgent: CHROME, day: '2026-11-22', secret: 's', ...extra });
  assert.equal(mark(), mark()); assert.notEqual(mark(), mark({ day: '2026-11-23' })); assert.notEqual(mark(), mark({ secret: 't' })); assert.notEqual(mark(), mark({ ip: '203.0.113.10' }));
});

test('collector: records a visit, never returns data, and a broken database never reaches the page', async t => {
  const names = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'], before = Object.fromEntries(names.map(n => [n, process.env[n]])), originalFetch = globalThis.fetch;
  Object.assign(process.env, { SUPABASE_URL: 'https://visits-db.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service' });
  t.after(() => { globalThis.fetch = originalFetch; for (const n of names) { if (before[n] === undefined) delete process.env[n]; else process.env[n] = before[n]; } });
  let stored = [], fail = false;
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(url); assert.equal(target.origin, 'https://visits-db.invalid'); assert.equal(target.pathname, '/rest/v1/site_visits'); assert.equal(options.method, 'POST');
    if (fail) return new Response(JSON.stringify({ message: 'relation "site_visits" does not exist' }), { status: 404 });
    stored.push(JSON.parse(options.body)); return new Response(null, { status: 201 });
  };
  const origin = 'https://statecourse.com', context = { ip: '203.0.113.9', geo: { city: 'Fresno', country: { code: 'US' }, subdivision: { name: 'California' } } };
  const post = (body, headers = {}) => collect(new Request(`${origin}/api/collect`, { method: 'POST', headers: { origin, 'user-agent': CHROME, 'content-type': 'text/plain', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }), context);
  assert.equal(collectConfig.path, '/api/collect');

  let response = await post({ p: '/free-practice/', r: 'https://chatgpt.com/', c: 'unset', w: 0 });
  assert.equal(response.status, 204); assert.equal(await response.text(), ''); assert.equal(response.headers.get('set-cookie'), null); assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(stored.length, 1); assert.equal(stored[0].path, '/free-practice/'); assert.equal(stored[0].source_kind, 'ai'); assert.equal(stored[0].visitor_class, 'human'); assert.equal(stored[0].city, 'Fresno');
  assert.doesNotMatch(JSON.stringify(stored[0]), /203\.0\.113|AppleWebKit/);

  // The image used when scripts do not run: counted, and marked as not having run the script.
  response = await collect(new Request(`${origin}/api/collect?p=%2Fmortgage%2F`, { headers: { 'user-agent': CHROME } }), context);
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/gif');
  assert.equal(stored[1].script_ran, false); assert.equal(stored[1].visitor_class, 'suspect');

  // Global Privacy Control, sent by the browser itself.
  await post({ p: '/', c: 'accepted', v: randomUUID() }, { 'sec-gpc': '1' });
  assert.equal(stored[2].consent, 'declined'); assert.equal(stored[2].visitor_id, null);

  // Refused quietly: another site posting, oversized or malformed bodies, private paths.
  const count = stored.length;
  for (const attempt of [() => post({ p: '/' }, { origin: 'https://evil.example' }), () => post('x'.repeat(3000)), () => post('not json'), () => post('[1,2]'), () => post({ p: '/admin/console/' }),
    () => collect(new Request(`${origin}/api/collect`, { headers: { 'user-agent': CHROME } }), context)]) {
    const refused = await attempt(); assert.ok([200, 204].includes(refused.status));
  }
  assert.equal(stored.length, count, 'none of those was stored');
  assert.equal((await collect(new Request(`${origin}/api/collect`, { method: 'DELETE' }), context)).status, 405);

  // The table does not exist yet, or the database is down: the page still gets a clean answer.
  fail = true; assert.equal((await post({ p: '/' })).status, 204);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY; fail = false; assert.equal((await post({ p: '/' })).status, 204); assert.equal(stored.length, count);
});

test('the report day is a Pacific calendar day, across daylight-saving changes', () => {
  assert.equal(pacificDay(new Date('2026-11-22T07:59:00Z')), '2026-11-21'); assert.equal(pacificDay(new Date('2026-11-22T08:00:00Z')), '2026-11-22');
  const winter = pacificDayWindow('2026-11-21');
  assert.equal(winter.from.toISOString(), '2026-11-21T08:00:00.000Z'); assert.equal(winter.to.toISOString(), '2026-11-22T08:00:00.000Z');
  const summer = pacificDayWindow('2026-07-04');
  assert.equal(summer.from.toISOString(), '2026-07-04T07:00:00.000Z'); assert.equal(summer.to.toISOString(), '2026-07-05T07:00:00.000Z');
  const fallBack = pacificDayWindow('2026-11-01'), springForward = pacificDayWindow('2026-03-08');
  assert.equal((fallBack.to - fallBack.from) / 3600000, 25, 'the day clocks go back has 25 hours');
  assert.equal((springForward.to - springForward.from) / 3600000, 23, 'the day clocks go forward has 23 hours');
  assert.equal(previousPacificDay(new Date('2026-11-22T15:00:00Z')), '2026-11-21', 'the 7 AM run reports yesterday');
  assert.equal(previousPacificDay(new Date('2026-11-02T15:00:00Z')), '2026-11-01');
  for (const bad of ['today', '2026-13-40', '11/21/2026', '']) assert.throws(() => pacificDayWindow(bad), /invalid_day/);
});

const VISITS = { people: { views: 41, visitors: 17 }, bots: { views: 230, clients: 9 }, suspect: { views: 12, clients: 4 }, consent: { accepted: 5, declined: 3, unset: 9 },
  remembered: { visitors: 5, new: 4, returning: 1, reached_register: 2, reached_account: 1, by_first_source: [{ source: 'search', visitors: 3, reached_register: 2, reached_account: 1 }] },
  pages: [{ path: '/mortgage/', views: 12, visitors: 9 }], sources: [{ kind: 'search', views: 20, visitors: 8 }], referrers: [{ kind: 'search', name: 'google.com', visitors: 7 }],
  campaigns: [{ source: 'newsletter', medium: 'email', campaign: 'nov', visitors: 2 }], places: [{ country: 'US', region: 'California', city: 'Fresno', visitors: 6 }],
  devices: [{ device: 'mobile', visitors: 10 }], bot_names: [{ name: 'Googlebot', views: 120 }], bot_pages: [] };

test('the daily report joins visits with account activity, and says plainly when a half is missing', async () => {
  const studentId = randomUUID();
  const request = async path => {
    if (path.startsWith('student_portal_events?')) { assert.match(path, /occurred_at=gte\.2026-11-21T08%3A00%3A00\.000Z&occurred_at=lt\.2026-11-22T08%3A00%3A00\.000Z/); assert.match(path, /select=student_id,event_type,occurred_at&order=occurred_at.asc/); assert.doesNotMatch(path, /created_at/);
      return [{ student_id: studentId, event_type: 'portal_opened', occurred_at: '2026-11-21T18:00:00Z' }, { student_id: studentId, event_type: 'course_resume_clicked', occurred_at: '2026-11-21T18:05:00Z' }]; }
    if (path.startsWith('students?created_at=')) return [{ id: randomUUID(), email: 'new@example.test', first_name: 'New', last_name: 'Student', created_at: '2026-11-21T20:00:00Z' }];
    if (path.startsWith('students?id=in.')) return [{ id: studentId, email: 'ana@example.test', first_name: 'Ana', last_name: 'Lee' }];
    throw new Error(`unexpected ${path}`);
  };
  const calls = [], call = async (name, args) => { calls.push([name, args]); return VISITS; };
  const report = await buildDailyReport('2026-11-21', { request, call });
  assert.deepEqual(calls, [['site_visit_report', { p_from: '2026-11-21T08:00:00.000Z', p_to: '2026-11-22T08:00:00.000Z' }]]);
  assert.equal(report.visits.available, true); assert.equal(report.visits.people.visitors, 17);
  assert.deepEqual(report.accounts.students, [{ name: 'Ana Lee', email: 'ana@example.test', visits: 1, coursesOpened: 1, last: '2026-11-21T18:05:00Z' }]);
  assert.deepEqual(report.accounts.registrations, [{ name: 'New Student', email: 'new@example.test', at: '2026-11-21T20:00:00Z' }]);

  const { subject, html } = renderDailyReport(report);
  assert.equal(subject, 'StateCourse 2026-11-21: 17 visitors, 13 automated');
  for (const expected of ['People', 'Robots that name themselves', 'Search engines', 'google.com', '/mortgage/', 'Fresno, California, US', 'Googlebot', 'Ana Lee', 'new@example.test', 'newsletter / email / nov', '4 new and 1 returning'])
    assert.ok(html.includes(expected), expected);
  // Values from the outside world are escaped, never inserted as markup.
  const hostile = renderDailyReport({ ...report, visits: { ...report.visits, referrers: [{ kind: 'referral', name: '<img src=x onerror=alert(1)>', visitors: 1 }] } }).html;
  assert.doesNotMatch(hostile, /<img/); assert.match(hostile, /&lt;img src=x/);

  // Visit table not installed: the account half still arrives and the gap is stated.
  const partial = await buildDailyReport('2026-11-21', { request, call: async () => { throw new Error('relation site_visits does not exist'); } });
  assert.deepEqual(partial.visits, { available: false, error: 'database_schema_missing' }); assert.equal(partial.accounts.available, true);
  const rendered = renderDailyReport(partial);
  assert.equal(rendered.subject, 'StateCourse 2026-11-21: visit counting not available'); assert.match(rendered.html, /Visit counting is not available/); assert.match(rendered.html, /Ana Lee/);
  const none = await buildDailyReport('2026-11-21', { request: async () => { throw new Error('down'); }, call: async () => { throw new Error('down'); } });
  assert.match(renderDailyReport(none).html, /Account activity could not be read/);
});

test('the report is emailed to the owner\'s address only when a mail key is set', async () => {
  const report = { day: '2026-11-21', visits: { available: true, ...VISITS }, accounts: { available: true, activeStudents: 0, students: [], registrations: [] } };
  const sent = [], fetcher = async (url, options) => { sent.push([url, options]); return new Response('{"id":"x"}', { status: 200 }); };
  assert.equal(await emailDailyReport(report, { env: {}, fetcher }), false); assert.equal(sent.length, 0, 'no key: nothing is sent, and it is not an error');
  assert.equal(await emailDailyReport(report, { env: { RESEND_API_KEY: 're_test' }, fetcher }), true);
  const [url, options] = sent[0], mail = JSON.parse(options.body);
  assert.equal(url, 'https://api.resend.com/emails'); assert.equal(options.headers.authorization, 'Bearer re_test');
  assert.deepEqual(mail.to, ['data@statecourse.com']); assert.equal(mail.from, 'StateCourse Reports <reports@statecourse.com>'); assert.match(mail.subject, /17 visitors/);
  await emailDailyReport(report, { env: { RESEND_API_KEY: 're_test', SITE_REPORT_TO: 'other@example.test', SITE_REPORT_FROM: 'X <x@example.test>' }, fetcher });
  assert.deepEqual(JSON.parse(sent[1][1].body).to, ['other@example.test']);
  await assert.rejects(() => emailDailyReport(report, { env: { RESEND_API_KEY: 're_test' }, fetcher: async () => new Response('{}', { status: 403 }) }), /report_email_failed:403/);
});

test('counting is added to public pages and to nothing private', () => {
  for (const page of ['index.html', 'mortgage/index.html', 'free-practice/index.html', 'privacy/index.html', 'real-estate/california/index.html',
    'student/index.html', 'student/sign-in/index.html', 'student/register/index.html', 'student/free-training/index.html']) assert.equal(countsVisits(page), true, page);
  for (const page of ['admin/console/index.html', 'admin/visitors/index.html', 'staff/index.html', 'student/course/index.html', 'student/final-exam/index.html', 'student/nmls-course/index.html',
    'student/nmls-training/index.html', 'student/password/index.html', 'site-report-notification-form/index.html', 'student-course.html', 'content/x.html', 'analytics.js', 'data/x.json']) assert.equal(countsVisits(page), false, page);
  assert.equal(pagePath('index.html'), '/'); assert.equal(pagePath('mortgage/index.html'), '/mortgage/'); assert.equal(pagePath('a/b.html'), '/a/b.html');
  const page = '<!doctype html><html><head><title>x</title></head><body><main>y</main></body></html>', out = injectInto(page, 'mortgage/index.html');
  assert.match(out, /<link rel="stylesheet" href="\/analytics\.css"\/><script src="\/analytics\.js" defer><\/script><\/head>/);
  assert.match(out, /<noscript><img src="\/api\/collect\?p=%2Fmortgage%2F" width="1" height="1" alt=""\/><\/noscript><\/body>/);
  assert.equal(injectInto(out, 'mortgage/index.html'), out, 'adding twice changes nothing');
  assert.equal(injectInto('<p>fragment</p>', 'x.html'), '<p>fragment</p>');
});

test('native school notifications use a detected form, bounded destination and readable report, without a mail key', async () => {
  const report = { day: '2026-11-21', visits: { available: true, ...VISITS }, accounts: { available: true, activeStudents: 0, students: [], registrations: [] } };
  const env = { SITE_REPORT_DELIVERY: 'netlify-forms', SITE_REPORT_TO: 'info@statecourse.com' };
  assert.equal(reportMailConfigured(env), true);
  assert.equal(reportMailConfigured({}), false);
  const sent = [];
  assert.equal(await emailDailyReport(report, { env, fetcher: async (url, options) => {
    sent.push([url, options]); return new Response('Thank you', { status: 200 });
  } }), true);
  const [url, options] = sent[0], fields = new URLSearchParams(options.body);
  assert.equal(url, 'https://statecourse.com/site-report-notification-form/');
  assert.equal(options.redirect, 'follow'); assert.equal(options.headers['content-type'], 'application/x-www-form-urlencoded');
  assert.equal(options.headers.authorization, undefined);
  assert.equal(fields.get('form-name'), 'statecourse-daily-reports');
  assert.equal(fields.get('bot-field'), ''); assert.equal(fields.get('day'), report.day);
  assert.match(fields.get('subject'), /17 visitors/); assert.match(fields.get('message'), /People\t17\t41/);
  assert.match(fields.get('message'), /google.com/); assert.doesNotMatch(fields.get('message'), /<table|<div|<td/);
  const skeleton = read('public/statecourse/site-report-notification-form/index.html');
  assert.match(skeleton, /name="statecourse-daily-reports" method="POST" data-netlify="true"/);
  for (const field of fields.keys()) assert.ok(skeleton.includes(`name="${field}"`), field);
  assert.match(skeleton, /noindex,nofollow/);
  await assert.rejects(() => emailDailyReport(report, { env, fetcher: async () => new Response('', { status: 500 }) }), /report_email_failed:500/);
});

test('the page script is first-party, sets nothing before a choice, and offers Decline as plainly as Accept', () => {
  const script = read('public/statecourse/analytics.js'), css = read('public/statecourse/analytics.css');
  assert.doesNotMatch(script, /https?:\/\/|googletagmanager|google-analytics|gtag|fbq|doubleclick|localStorage|sessionStorage|innerHTML|eval\(|document\.write/);
  assert.match(script, /fetch\("\/api\/collect"/); assert.match(script, /credentials: "omit"/);
  // The visitor number is created only on the accepted path.
  assert.match(script, /function visitorId\(\) \{\s*if \(choice\(\) !== "accepted"\) return null;/);
  assert.match(script, /navigator\.globalPrivacyControl === true/); assert.match(script, /if \(gpc\) return "declined";/);
  assert.match(script, /if \(value === "declined"\) setCookie\("sc_vid", "", 0\);/, 'declining removes an earlier visitor number');
  assert.match(script, /actions\.append\(button\("Accept", "accepted"\), button\("Decline", "declined"\)\);/);
  assert.equal((script.match(/className = "sc-cookie-button"/g) || []).length, 1, 'both buttons are made by the same function with the same class');
  assert.doesNotMatch(css, /sc-cookie-(accept|decline|primary|secondary)/, 'no styling that favours one choice');
  // The site's security policy still allows only its own scripts, styles, images and connections.
  const policy = read('netlify.toml').match(/Content-Security-Policy = "([^"]+)"/)[1];
  assert.match(policy, /script-src 'self' https:\/\/embed\.cloudflarestream\.com;/); assert.match(policy, /style-src 'self';/); assert.match(policy, /img-src 'self' data:;/);
  const privacy = read('public/statecourse/privacy/index.html');
  assert.match(privacy, /Visits to this site/); assert.match(privacy, /data-cookie-settings/); assert.match(privacy, /We do not store your IP address/); assert.match(privacy, /Global Privacy Control/);
});

test('migration 034: the visit table and the report it produces', { skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipping is not verification.' }, async () => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); await db.exec('create role service_role; create role anon; create role authenticated;');
  const sql = read('database/034_site_visits.sql'); await db.exec(sql); await db.exec(sql);
  const base = { kind: 'view', path: '/', source_kind: 'direct', source_name: null, utm_source: null, utm_medium: null, utm_campaign: null, country: 'US', region: 'California', city: 'Fresno',
    device: 'desktop', browser: 'Chrome', visitor_class: 'human', bot_name: null, script_ran: true, day_hash: 'a'.repeat(16), consent: 'unset', visitor_id: null };
  const add = (row, at = '2026-11-21 20:00:00+00') => { const r = { ...base, ...row }, keys = Object.keys(r);
    return db.query(`insert into site_visits(occurred_at,${keys.join(',')}) values($1,${keys.map((_, i) => `$${i + 2}`).join(',')})`, [at, ...keys.map(k => r[k])]); };
  const ana = randomUUID(), ben = randomUUID();
  await add({ path: '/mortgage/', source_kind: 'search', source_name: 'google.com', day_hash: '1'.repeat(16), consent: 'accepted', visitor_id: ana });
  await add({ path: '/student/register/', source_kind: 'internal', day_hash: '1'.repeat(16), consent: 'accepted', visitor_id: ana });
  await add({ path: '/student/', source_kind: 'internal', day_hash: '1'.repeat(16), consent: 'accepted', visitor_id: ana });
  await add({ kind: 'consent', path: '/mortgage/', source_kind: 'search', source_name: 'google.com', day_hash: '1'.repeat(16), consent: 'accepted', visitor_id: ana });
  await add({ path: '/', source_kind: 'social', source_name: 'facebook.com', day_hash: '2'.repeat(16), consent: 'accepted', visitor_id: ben }, '2026-11-20 20:00:00+00'); // the day before
  await add({ path: '/free-practice/', day_hash: '2'.repeat(16), consent: 'accepted', visitor_id: ben, device: 'mobile' });
  await add({ path: '/', day_hash: '3'.repeat(16), consent: 'declined', utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'nov', source_kind: 'campaign', source_name: 'newsletter' });
  await add({ path: '/', day_hash: '4'.repeat(16), visitor_class: 'bot', bot_name: 'Googlebot' }); await add({ path: '/mortgage/', day_hash: '4'.repeat(16), visitor_class: 'bot', bot_name: 'Googlebot' });
  await add({ path: '/', day_hash: '5'.repeat(16), visitor_class: 'suspect', script_ran: false });
  // A "person" that opened 301 pages in a day is counted as suspect.
  await db.exec(`insert into site_visits(occurred_at,path,source_kind,device,visitor_class,script_ran,day_hash,consent) select '2026-11-21 21:00:00+00','/','direct','desktop','human',true,'${'6'.repeat(16)}','unset' from generate_series(1,301)`);
  await add({ path: '/', day_hash: '7'.repeat(16) }, '2026-11-22 09:00:00+00'); // outside the day

  const r = (await db.query(`select site_visit_report('2026-11-21 08:00:00+00','2026-11-22 08:00:00+00') r`)).rows[0].r;
  assert.deepEqual(r.people, { views: 5, visitors: 3 }); assert.deepEqual(r.bots, { views: 2, clients: 1 }); assert.deepEqual(r.suspect, { views: 302, clients: 2 });
  assert.deepEqual(r.consent, { accepted: 2, declined: 1, unset: 0 });
  assert.deepEqual(r.bot_names, [{ name: 'Googlebot', views: 2 }]);
  assert.deepEqual(r.sources.map(s => [s.kind, s.visitors]).sort(), [['campaign', 1], ['direct', 1], ['search', 1]]);
  assert.deepEqual(r.referrers.find(x => x.name === 'google.com'), { kind: 'search', name: 'google.com', visitors: 1 });
  assert.deepEqual(r.campaigns, [{ source: 'newsletter', medium: 'email', campaign: 'nov', visitors: 1 }]);
  assert.deepEqual(r.remembered, { visitors: 2, new: 1, returning: 1, reached_register: 1, reached_account: 1,
    by_first_source: [{ source: 'search', visitors: 1, reached_register: 1, reached_account: 1 }, { source: 'social', visitors: 1, reached_register: 0, reached_account: 0 }] });
  assert.equal(r.pages.find(p => p.path === '/mortgage/').views, 1, 'the consent record is not counted as a page opened');

  // Rules of the table itself.
  await assert.rejects(add({ visitor_id: randomUUID(), consent: 'declined' }), /check/, 'no visitor number without acceptance');
  await assert.rejects(add({ path: 'no-slash' }), /check/); await assert.rejects(add({ day_hash: 'short' }), /check/); await assert.rejects(add({ visitor_class: 'vip' }), /check/);
  await assert.rejects(db.query(`update site_visits set path='/x'`), /site_visit_immutable/);
  const grants = (await db.query(`select table_name t, grantee g, string_agg(privilege_type, ',' order by privilege_type) p from information_schema.role_table_grants where table_name in ('site_visits','site_daily_reports') and grantee in ('service_role','anon','authenticated','PUBLIC') group by 1,2 order by 1`)).rows;
  assert.deepEqual(grants, [{ t: 'site_daily_reports', g: 'service_role', p: 'INSERT,SELECT,UPDATE' }, { t: 'site_visits', g: 'service_role', p: 'DELETE,INSERT,SELECT' }]);
  assert.deepEqual((await db.query(`select relname, relrowsecurity from pg_class where relname in ('site_visits','site_daily_reports') order by 1`)).rows.map(x => x.relrowsecurity), [true, true]);
});


test('operational diagnostics expose configuration flags and safe failure categories, never credentials or request details', () => {
  const env = { SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'secret-database-value', RESEND_API_KEY: 'secret-mail-value' };
  assert.deepEqual(siteConfiguration(env), { databaseProject: 'abcdefghijklmnopqrst', databaseUrlSet: true, databaseKeySet: true, mailKeySet: true, reportRecipient: 'data@statecourse.com' });
  assert.doesNotMatch(JSON.stringify(siteConfiguration(env)), /secret-database|secret-mail/);
  assert.equal(siteConfiguration({ SUPABASE_URL: 'https://user:secret@example.invalid/private?key=secret', SITE_REPORT_TO: 'not-an-address' }).databaseProject, null);
  assert.equal(siteConfiguration({ SITE_REPORT_TO: 'not-an-address' }).reportRecipient, null);
  assert.equal(siteFailure(new Error('database_not_configured')), 'database_not_configured');
  assert.equal(siteFailure(new Error('permission denied for table site_visits')), 'database_permission_denied');
  assert.equal(siteFailure(new Error('Could not find the table public.site_visits in the schema cache')), 'database_schema_missing');
  assert.equal(siteFailure(new Error('private-token user@example.test 203.0.113.9')), 'database_unavailable');
});

test('a scheduled report fails visibly on missing mail, denied storage or provider failure, while retaining whichever half succeeds', async t => {
  const keys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'SITE_REPORT_TO', 'SITE_REPORT_DELIVERY'];
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const originalFetch = globalThis.fetch, originalError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch; console.error = originalError;
    for (const key of keys) { if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key]; }
  });
  delete process.env.SITE_REPORT_DELIVERY;
  const logs = []; console.error = (...args) => logs.push(args);
  Object.assign(process.env, { SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-private-db', SITE_REPORT_TO: 'data@statecourse.com' });
  for (const scenario of ['success', 'missing-mail', 'storage-denied', 'mail-denied']) {
    if (scenario === 'missing-mail') delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = 'synthetic-private-mail';
    const saved = [], sent = [];
    globalThis.fetch = async (url, options = {}) => {
      const target = new URL(url);
      if (target.origin === 'https://api.resend.com') {
        sent.push(JSON.parse(options.body));
        return new Response('{}', { status: scenario === 'mail-denied' ? 403 : 200 });
      }
      assert.equal(target.hostname, 'abcdefghijklmnopqrst.supabase.co');
      if (target.pathname === '/rest/v1/rpc/site_visit_report') return Response.json(VISITS);
      if (target.pathname === '/rest/v1/site_daily_reports') {
        if (scenario === 'storage-denied') return Response.json({ message: 'permission denied for table site_daily_reports' }, { status: 403 });
        saved.push(JSON.parse(options.body)); return new Response(null, { status: 201 });
      }
      if (target.pathname === '/rest/v1/students' || target.pathname === '/rest/v1/student_portal_events') return Response.json([]);
      throw new Error('Unexpected test URL');
    };
    const response = await dailyReport();
    assert.equal(response.status, scenario === 'success' ? 200 : 503, scenario);
    const result = await response.json();
    assert.equal(result.stored, scenario !== 'storage-denied', scenario);
    assert.equal(result.emailed, scenario === 'success' || scenario === 'storage-denied', scenario);
    assert.equal(sent.length, scenario === 'missing-mail' ? 0 : 1, scenario);
    if (scenario !== 'storage-denied') assert.equal(Boolean(saved[0].emailed_at), result.emailed);
  }
  assert.ok(logs.some(args => args[0] === 'Daily site report email not configured'));
  assert.ok(logs.some(args => args[1]?.reason === 'database_permission_denied'));
  assert.ok(logs.some(args => args[1]?.reason === 'report_email_failed:403'));
  assert.doesNotMatch(JSON.stringify(logs), /synthetic-private-db|synthetic-private-mail/);
});
