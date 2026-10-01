// Local-only, owned Chromium driver. No existing profile, hosted endpoint, or
// renderer focus/visibility override is used. One driver gives one actor an
// isolated default context, where connectOverCDP({noDefaults:true}) applies.
// Supported APIs: https://playwright.dev/docs/api/class-browserserver#browser-server-process
// https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp-option-no-defaults
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const timeout = 15000;

function localOrigin(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'http:', 'Driver requires an HTTP loopback fixture');
  assert.equal(url.hostname, '127.0.0.1', 'Driver requires literal IPv4 loopback');
  assert.ok(url.port && !url.username && !url.password, 'Fixture requires an explicit loopback port');
  assert.equal(value, url.origin, 'Pass only the fixture origin');
  return value;
}

async function ownedEndpoint(server) {
  // process() is public and exposes only the browser this helper just launched.
  // Chromium writes its OS-selected debugging port into this generated profile.
  const args = server.process().spawnargs;
  const profiles = args.filter(arg => arg.startsWith('--user-data-dir='));
  assert.equal(profiles.length, 1, 'Expected one generated Chromium profile');
  const profile = profiles[0].slice('--user-data-dir='.length);
  assert.ok(path.isAbsolute(profile), 'Generated profile must be absolute');
  assert.ok(path.basename(profile).startsWith('playwright_chromiumdev_profile-'), 'Refusing an unrecognized profile');
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const [portText, endpointPath] = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/);
      const port = Number(portText);
      assert.ok(Number.isInteger(port) && port > 0 && port <= 65535, 'Invalid owned debugging port');
      assert.match(endpointPath, /^\/devtools\/browser\/[a-zA-Z0-9-]+$/, 'Invalid owned browser endpoint');
      return `ws://127.0.0.1:${port}${endpointPath}`;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (server.process().exitCode !== null) throw new Error('Owned Chromium exited before exposing its debugging port');
      await delay(50);
    }
  }
  throw new Error('Owned Chromium did not expose its ephemeral debugging port');
}

export async function launchPe03BrowserDriver({ origin, artifactDir, viewport = { width: 1100, height: 900 } }) {
  origin = localOrigin(origin);
  assert.equal(process.env.PE_CHROMIUM_HEADED, '1', 'Real visibility diagnostic requires PE_CHROMIUM_HEADED=1');
  const { chromium } = require(process.env.PE_PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright');
  artifactDir = path.resolve(artifactDir);
  await fs.mkdir(artifactDir, { recursive: true });
  const downloadsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pe03-owned-downloads-'));
  let server, browser, downloadSession, closed = false, downloadInProgress = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    const failures = [];
    for (const action of [() => browser?.close(), () => server?.close(), () => fs.rm(downloadsDir, { recursive: true, force: true })]) {
      try { await action(); } catch (error) { failures.push(error); }
    }
    if (failures.length) throw new AggregateError(failures, 'Owned driver cleanup failed');
  };
  try {
    server = await chromium.launchServer({
      headless: false,
      host: '127.0.0.1',
      ...(process.env.PE_CHROMIUM ? { executablePath: process.env.PE_CHROMIUM } : {}),
      args: ['--no-sandbox', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0'],
    });
    browser = await chromium.connectOverCDP(await ownedEndpoint(server), { noDefaults: true, isLocal: true, artifactsDir: downloadsDir });
    const contexts = browser.contexts();
    assert.equal(contexts.length, 1, 'Expected exactly one fresh default context');
    const context = contexts[0];
    assert.equal(context.pages().length, 0, 'Fresh owned driver must not inherit pages');
    context.setDefaultTimeout(timeout);
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await context.routeWebSocket('**/*', route => route.close());
    downloadSession = await browser.newBrowserCDPSession();
    // noDefaults intentionally omits download setup. Use the public CDP events
    // on this same session and read only its generated GUID-named download file.
    await downloadSession.send('Browser.setDownloadBehavior', { behavior: 'allowAndName', downloadPath: downloadsDir, eventsEnabled: true });
    const focus = async page => {
      assert.equal(page.context(), context, 'Cannot operate an unowned page');
      await page.bringToFront();
      await page.waitForFunction(() => document.visibilityState === 'visible' && document.hasFocus(), {}, { polling: 100, timeout });
    };
    const newPage = async () => {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      return page;
    };
    const saveDownload = async (page, trigger, destination) => {
      assert.equal(page.context(), context, 'Cannot download from an unowned page');
      assert.equal(downloadInProgress, false, 'Only one download at a time per owned driver');
      destination = path.resolve(destination);
      const relative = path.relative(artifactDir, destination);
      assert.ok(relative && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative), 'Download destination must remain in the artifact directory');
      downloadInProgress = true;
      let pageSession, timer, onBegin, onProgress;
      try {
        await focus(page);
        pageSession = await context.newCDPSession(page);
        const { frameTree } = await pageSession.send('Page.getFrameTree');
        let started;
        const completed = new Promise((resolve, reject) => {
          timer = setTimeout(() => reject(new Error('Owned fixture download did not complete')), timeout);
          onBegin = event => {
            if (event.frameId !== frameTree.frame.id) return;
            try {
              assert.equal(new URL(event.url).origin, origin, 'Download must originate at the local fixture');
              assert.match(event.guid, /^[a-zA-Z0-9-]+$/, 'Unexpected download GUID');
              assert.equal(started, undefined, 'Expected exactly one fixture download');
              started = event;
            } catch (error) { reject(error); }
          };
          onProgress = event => {
            if (!started || event.guid !== started.guid) return;
            if (event.state === 'canceled') reject(new Error('Owned fixture download was canceled'));
            if (event.state === 'completed') resolve({ ...started, receivedBytes: event.receivedBytes });
          };
          downloadSession.on('Browser.downloadWillBegin', onBegin);
          downloadSession.on('Browser.downloadProgress', onProgress);
        });
        const [event] = await Promise.all([completed, Promise.resolve().then(trigger)]);
        const bytes = await fs.readFile(path.join(downloadsDir, event.guid));
        assert.ok(bytes.length > 0, 'Downloaded fixture is empty');
        assert.equal(bytes.length, event.receivedBytes, 'Downloaded file differs from the completed browser transfer');
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, bytes);
        return { path: destination, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), suggestedFilename: event.suggestedFilename, url: event.url };
      } finally {
        clearTimeout(timer);
        if (onBegin) downloadSession.off('Browser.downloadWillBegin', onBegin);
        if (onProgress) downloadSession.off('Browser.downloadProgress', onProgress);
        try { await pageSession?.detach(); } finally { downloadInProgress = false; }
      }
    };
    return { browser, context, newPage, focus, saveDownload, close };
  } catch (error) {
    try { await close(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Driver setup and cleanup failed'); }
    throw error;
  }
}
