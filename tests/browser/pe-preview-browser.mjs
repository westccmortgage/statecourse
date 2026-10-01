// Browser acceptance of the already-public PR23 practice preview. No server,
// login, real borrower data, production route, or write request is used.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const origin = 'https://deploy-preview-23--chipper-maamoul-a2b9d5.netlify.app';
const landing = origin + '/mortgage/pre-license/';
const labUrl = origin + '/free-practice/?course=national-safe-pe-foundations&lesson=module-03&mode=lab';
const appHead = '90ab28b833c4dbbf777b8f394911d5f14aa4ddf1';
const fingerprints = {
  'free-practice.js': '7ce1ddf3d60870abd92862a0d1b8650fc5584551e19b36ad1006da1c1f1fe993',
  'evidence-lab.mjs': '4b6d7f79ac4d898b4528039e17d82d1ac13e0334cffe9837aeef789b4bb3b520',
  'practice-activities.mjs': 'c640e434486d70bbfbd8580f5411f47f3b0f40071b77ea0fed50fc77200094e5',
  'practice-core.mjs': '7f996eb6bcd394eccad77f45146a6dda159682e11f077d196e99f73c64f33353',
  'national.css': '2993d05e1a23fd88e5ef5470e365ba82fec7488bb5ca23ee5057105220eb975d',
  'free-practice/courses/national-safe-pe-foundations.json': 'cd149523175e2f9821e9b4ec9318f6cd28906cc9d5b4e143e24640729fa53122',
};
const out = path.resolve('artifacts/pe-preview');
await fs.mkdir(out, { recursive: true });
const report = { applicationBaseline: appHead, preview: origin, started: new Date().toISOString(), checks: [], assets: [], screenshots: [], viewports: [], blockedWrites: [], pageErrors: [], completed: false };
const check = name => report.checks.push(name);
let browser, page;
try {
  // These public asset hashes identify the actual application independently of
  // a later test-only commit or deploy-preview alias update.
  for (const [file, expected] of Object.entries(fingerprints)) {
    const response = await fetch(origin + '/' + file, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `Public asset unavailable: ${file}`);
    const digest = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    assert.equal(digest, expected, `Application bytes changed: ${file}`);
    report.assets.push({ path: file, sha256: digest });
  }
  check('Exact public application assets match the reviewed application baseline');
  assert.ok(path.isAbsolute(process.env.PE_BROWSER_PACKAGE ?? ''), 'Expected isolated browser package directory');
  const require = createRequire(path.join(process.env.PE_BROWSER_PACKAGE, 'package.json'));
  const { chromium } = require('playwright');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1188, height: 900 } });
  await context.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) {
      const url = new URL(request.url());
      report.blockedWrites.push({ origin: url.origin, path: url.pathname, method: request.method() });
      return route.abort();
    }
    return route.continue();
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const shot = async name => {
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: false });
    report.screenshots.push(name + '.png');
  };
  const waitLab = async () => {
    await page.locator('#practiceEvidenceLab').waitFor({ state: 'visible' });
    await page.locator('[data-lab-stage]').waitFor({ state: 'visible' });
  };
  const selectStage = async index => {
    await page.locator('[data-lab-stage]').selectOption(String(index));
    assert.equal(await page.locator('[data-lab-stage]').inputValue(), String(index));
  };
  const selectPath = async branch => {
    await page.locator('[data-lab-branch]').selectOption(branch);
    assert.equal(await page.locator('[data-lab-branch]').inputValue(), branch);
  };
  const taskCase = (branch, id) => page.locator(`[data-case="national-safe-pe-foundations:PEEL-${branch}-${id}"]`);
  const fillCase = async (branch, id, numbers, reasoning) => {
    const container = taskCase(branch, id);
    for (const [key, value] of Object.entries(numbers)) await container.locator(`[name$="-${key}"]`).fill(String(value));
    await container.locator('textarea').fill(reasoning);
    await container.locator('button[type=submit]').click();
    await container.locator('.practice-case-summary').waitFor({ state: 'visible' });
    return container;
  };

  await page.goto(landing, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('a').filter({ hasText: /^Read PE0[1-8] and practice/ }).count(), 8);
  assert.match(await page.locator('main').innerText(), /no NMLS provider or course approval/);
  assert.match(await page.locator('main').innerText(), /No licensing credit/);
  await page.getByRole('link', { name: 'Open the document evidence lab →' }).click();
  await waitLab();
  assert.equal(await page.locator('[data-exhibit]').count(), 4);
  assert.equal(await page.locator('[data-exhibit=E06]').count(), 0);
  assert.equal(await page.locator('[data-exhibit=E09]').count(), 0);
  assert.equal(await page.locator('#practiceLessonSelect option').count(), 8);
  check('Eight-module landing links to the actual PE03 lab with only release-one evidence');
  await shot('lab-release-1-desktop');

  await selectStage(2);
  assert.equal(await page.locator('[data-exhibit=E06]').count(), 1);
  await selectPath('U');
  assert.equal(await page.locator('[data-exhibit=E06]').count(), 0);
  assert.equal(await page.locator('[data-exhibit=E09]').count(), 0);
  assert.equal(await page.locator('[name$="-R_checking_credits"]').count(), 0);
  const analysisU = 'Path U: M1 accepts only the supplied savings. The missing checking page remains unresolved; the cash result is not loan approval.';
  let container = await fillCase('U', 'T12', { U_closing_shortfall: 12000, U_combined_funding_gap: 15000 }, analysisU);
  assert.equal(await container.locator('.is-correct').count(), 2);
  assert.ok((await container.innerText()).includes('no automatic grade'));
  await container.locator('.practice-case-summary').scrollIntoViewIfNeeded();
  await shot('path-u-cash-feedback');
  await selectPath('R');
  assert.equal(await taskCase('R', 'T12').locator('[name$="-R_funds_after_closing"]').inputValue(), '');
  container = await fillCase('R', 'T12', { R_funds_after_closing: 5000, R_surplus_above_target: 2000 }, 'Path R: the supplied record supports 27000 assets. Closing funds and remaining reserves are counted once, without a funding promise.');
  assert.equal(await container.locator('.is-correct').count(), 2);
  await selectPath('U');
  assert.equal(await taskCase('U', 'T12').locator('[name$="-U_closing_shortfall"]').inputValue(), '12000');
  assert.equal(await taskCase('U', 'T12').locator('textarea').inputValue(), analysisU);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitLab();
  assert.equal(await page.locator('[data-lab-branch]').inputValue(), 'U');
  assert.equal(await page.locator('[data-lab-stage]').inputValue(), '2');
  assert.equal(await taskCase('U', 'T12').locator('[name$="-U_combined_funding_gap"]').inputValue(), '15000');
  check('Both evidence paths produce correct feedback and retain separate numeric/written responses across switching and reload');

  await selectStage(3);
  assert.equal(await page.locator('[data-exhibit=E09]').count(), 1);
  assert.equal(await page.locator('[data-exhibit=E10]').count(), 0);
  await selectStage(4);
  assert.equal(await page.locator('[data-exhibit=E10]').count(), 1);
  const numeric = { revised_other_debt: 880, revised_dti_numerator: 3330, revised_total_dti: 52.23, dti_increase: 2.77 };
  container = await fillCase('U', 'T15', numeric, 'Preserve the old calculation and use the September 23 inclusion decision. The ratio does not resolve the missing asset evidence.');
  assert.equal(await container.locator('.is-incorrect').count(), 1);
  numeric.revised_total_dti = 51.23;
  container = await fillCase('U', 'T15', numeric, 'Revised calculation: 3330 divided by 6500 is 51.23 percent. Preserve the original response and route unresolved checking evidence.');
  assert.equal(await container.locator('.is-incorrect').count(), 0);
  assert.equal(await container.locator('.is-correct').count(), 4);
  await page.locator('.evidence-history > summary').click();
  const history = page.locator('.evidence-history');
  assert.ok((await history.innerText()).includes('Submitted versions stay here'));
  assert.equal(await history.locator(':scope > details').count(), 3);
  await history.locator(':scope > details').nth(1).locator('summary').click();
  await history.locator(':scope > details').nth(2).locator('summary').click();
  assert.ok((await history.innerText()).includes('52.23'));
  assert.ok((await history.innerText()).includes('51.23'));
  await history.scrollIntoViewIfNeeded();
  await shot('path-u-revision-history');
  check('Later debt releases, wrong-to-correct calculation feedback and retained first/revised submissions work in Chromium');

  // A real warm session is currently in lab mode. Explicit Read must override it.
  await page.goto(landing, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Read PE03 and practice →' }).click();
  await page.locator('#practiceContent').waitFor({ state: 'visible' });
  assert.equal(new URL(page.url()).searchParams.get('mode'), 'read');
  assert.equal(await page.locator('#practiceEvidenceLab').isVisible(), false);
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.goForward({ waitUntil: 'domcontentloaded' });
  await page.locator('#practiceContent').waitFor({ state: 'visible' });
  await page.locator('#practiceEvidenceMode').click();
  await waitLab();
  assert.equal(await taskCase('U', 'T15').locator('[name$="-revised_total_dti"]').inputValue(), '51.23');
  await page.locator('#practiceStateSelect').selectOption('CA');
  await page.locator('#practiceMode').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#practiceEvidenceMode').isVisible(), false);
  await page.goto(labUrl, { waitUntil: 'domcontentloaded' });
  await waitLab();
  assert.equal(await page.locator('[data-lab-branch]').inputValue(), 'U');
  assert.equal(await taskCase('U', 'T15').locator('[name$="-revised_total_dti"]').inputValue(), '51.23');
  check('Warm Read links, Back/Forward, course switching and returning to saved lab work pass');

  for (const width of [390, 768, 1100, 1188, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(landing, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(geometry.document <= geometry.viewport + 1, `Landing overflows at ${width}`);
    const menu = page.locator('.mobile-menu > summary');
    if (await menu.isVisible()) {
      await menu.click();
      assert.equal(await page.locator('.mobile-menu[open] a').count(), 10);
      assert.equal(await page.locator('.mobile-menu[open]').getByRole('link', { name: 'Create Account' }).isVisible(), true);
      assert.equal(await page.locator('.mobile-menu[open]').getByRole('link', { name: 'My Courses' }).isVisible(), true);
      await menu.click();
    } else {
      assert.equal(await page.locator('.header-actions').getByRole('link', { name: 'Create Account' }).isVisible(), true);
      assert.equal(await page.locator('.header-actions').getByRole('link', { name: 'My Courses' }).isVisible(), true);
    }
    await page.goto(labUrl, { waitUntil: 'domcontentloaded' });
    await waitLab();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-lab-stage]').scrollIntoViewIfNeeded();
    const labGeometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(labGeometry.document <= labGeometry.viewport + 1, `Lab overflows at ${width}`);
    report.viewports.push({ width, landing: geometry, lab: labGeometry });
    await shot('lab-viewport-' + width);
  }
  check('Header/menu/account actions and non-overflowing landing/lab layouts pass at five Chromium viewport widths');
  assert.equal(report.blockedWrites.filter(request => request.origin === origin && /\/(?:api\/|\.netlify\/functions\/)/.test(request.path)).length, 0);
  assert.deepEqual(report.pageErrors, []);
  check('No app page errors or attempted same-origin API/function writes were observed');
  report.completed = true;
} catch (error) {
  report.failure = { name: error.name, message: error.message, stack: error.stack };
  if (page) try { await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: false }); report.screenshots.push('failure.png'); } catch {}
  process.exitCode = 1;
} finally {
  report.finished = new Date().toISOString();
  if (browser) await browser.close();
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ completed: report.completed, checks: report.checks, viewports: report.viewports, failure: report.failure?.message, applicationBaseline: appHead }, null, 2));
}
