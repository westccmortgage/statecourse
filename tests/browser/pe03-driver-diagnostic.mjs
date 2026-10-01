// Driver capability probe only: success is not PE03 application acceptance.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { launchPe03BrowserDriver } from '../helpers/pe03-browser-driver.mjs';

const out = path.resolve('artifacts/pe-cohort/driver');
await fs.mkdir(out, { recursive: true });
const fixture = Buffer.from(JSON.stringify({ synthetic: true, purpose: 'Chromium driver download diagnostic', applicationAcceptance: false }) + '\n');
const report = { completed: false, scope: 'Synthetic local-only browser driver capability probe; not application acceptance', checks: [], screenshots: [], lifecycle: [], productionTouched: false };
const pageErrors = [];
let driver, primary, serverListening = false, failure;
const server = createServer((request, response) => {
  if (request.url === '/fixture.json') {
    response.writeHead(200, { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="driver-fixture.json"', 'content-length': fixture.length });
    response.end(fixture);
    return;
  }
  if (!['/', '/away'].includes(request.url)) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Owned Chromium visibility probe</title><style>body{margin:0;background:#eef3fa;color:#16233d;font:20px system-ui}main{margin:24px;padding:24px;background:white;border-top:12px solid #3472db}a{display:block;margin-top:24px}</style><main><h1>${request.url === '/away' ? 'Away tab' : 'Synthetic driver probe'}</h1><p>Real tab visibility and screenshot capability</p><a href="/fixture.json" download>Download synthetic fixture</a></main>`);
});

async function capture(page, filename, width, height) {
  await driver.focus(page);
  await page.locator('main').waitFor({ state: 'visible' });
  const png = await page.screenshot({ path: path.join(out, filename) });
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), 'Screenshot must be a PNG');
  assert.equal(png.toString('ascii', 12, 16), 'IHDR');
  assert.equal(png.readUInt32BE(16), width, 'Screenshot width must match the requested viewport');
  assert.equal(png.readUInt32BE(20), height, 'Screenshot height must match the requested viewport');
  assert.ok(png.length > 1000, 'Screenshot must contain rendered fixture content');
  report.screenshots.push({ filename, width, height, bytes: png.length, sha256: createHash('sha256').update(png).digest('hex') });
}

try {
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  serverListening = true;
  const origin = `http://127.0.0.1:${server.address().port}`;
  driver = await launchPe03BrowserDriver({ origin, artifactDir: out });
  report.browser = driver.browser.version();
  report.focusEmulation = 'never enabled on the default context';
  report.legacyScreenshot = process.env.PLAYWRIGHT_LEGACY_SCREENSHOT === '1';
  primary = await driver.newPage();
  primary.on('pageerror', error => pageErrors.push(error.message));
  await primary.goto(origin + '/');
  await driver.focus(primary);
  // This records events only; it neither replaces DOM properties nor dispatches
  // events. isTrusted and actual tab switches must establish the transitions.
  await primary.evaluate(() => {
    window.pe03DriverEvents = [];
    document.addEventListener('visibilitychange', event => {
      window.pe03DriverEvents.push({ type: event.type, visibility: document.visibilityState, focused: document.hasFocus(), trusted: event.isTrusted });
    });
  });
  await capture(primary, '01-visible-desktop.png', 1100, 900);
  report.checks.push('Fresh default context has genuine foreground focus and captures the 1100×900 fixture');
  const away = await driver.newPage();
  await away.goto(origin + '/away');
  await driver.focus(away);
  await primary.waitForFunction(() => document.visibilityState === 'hidden' && !document.hasFocus(), {}, { polling: 100, timeout: 10000 });
  let events = await primary.evaluate(() => window.pe03DriverEvents);
  assert.ok(events.some(event => event.visibility === 'hidden' && event.trusted), 'Expected a genuine hidden visibilitychange event');
  await driver.focus(primary);
  await primary.waitForFunction(() => window.pe03DriverEvents.some(event => event.visibility === 'visible' && event.trusted), {}, { polling: 100, timeout: 10000 });
  events = await primary.evaluate(() => window.pe03DriverEvents);
  assert.ok(events.every(event => event.trusted), 'No synthetic lifecycle events are accepted');
  report.lifecycle = events;
  report.checks.push('An actual tab switch produces trusted hidden and visible events and truthful focus state');
  await away.close();
  await capture(primary, '02-returned-desktop.png', 1100, 900);
  await primary.setViewportSize({ width: 390, height: 844 });
  await capture(primary, '03-mobile.png', 390, 844);
  report.checks.push('Capture survives a genuine hidden/foreground cycle and a 390×844 viewport change');
  report.download = await driver.saveDownload(primary, () => primary.getByRole('link', { name: 'Download synthetic fixture' }).click(), path.join(out, 'downloaded-fixture.json'));
  assert.deepEqual(await fs.readFile(report.download.path), fixture, 'Browser-downloaded bytes must equal the served fixture exactly');
  assert.equal(report.download.suggestedFilename, 'driver-fixture.json');
  report.checks.push('Explicit CDP download events complete and saved browser bytes equal the HTTP fixture');
  assert.deepEqual(pageErrors, []);
  report.completed = true;
} catch (error) {
  failure = error;
  report.failure = { name: error.name, message: error.message };
} finally {
  if (primary && !primary.isClosed()) {
    try { report.lifecycle = await primary.evaluate(() => window.pe03DriverEvents || []); } catch { /* The original driver failure remains authoritative. */ }
  }
  try { await driver?.close(); } catch (error) { report.cleanupFailure = error.message; failure ||= error; report.completed = false; }
  if (serverListening) await new Promise(resolve => server.close(resolve));
  report.pageErrors = pageErrors;
  report.finished = new Date().toISOString();
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
if (failure) throw failure;
