import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * The Netlify deployment artifact.
 *
 * WHAT THIS FILE USED TO BE. It imported `dist/server/index.js` and asserted the response
 * carried `<meta name="codex-preview" content="development">`. That is a marker from the
 * vinext starter template this repository was scaffolded from — `worker/index.ts`,
 * `vite.config.ts`, `next.config.ts` and `app/` are all still that scaffold. None of it is
 * deployed by Netlify: netlify.toml builds `bash site/build.sh` and publishes `dist`, while
 * the Sites target is built and validated separately. The test therefore failed on every
 * Netlify-only run and had done so for as long as it existed.
 *
 * It could only have been made to pass by installing Next and vinext and building an
 * application this project does not have and does not ship. Reviving a template to satisfy a
 * test is not a fix, and a permanently red test is worse than no test: it trains everyone to
 * read "one failure" as "passing".
 *
 * WHAT IT IS NOW. The same job — does the thing we deploy actually work — asked of the thing
 * we actually deploy. netlify.toml is a set of promises about `dist`, and every one of them
 * is checkable: the rewrite targets exist, the functions the API routes point at exist, and
 * the pages satisfy the Content-Security-Policy the same file sets on them.
 *
 * The Sites runtime is intentionally separate. This file records that boundary so a Sites
 * build is never mistaken for the artifact Netlify publishes.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const netlifyToml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");

const redirects = [...netlifyToml.matchAll(/from = "([^"]+)"\s*\n\s*to = "([^"]+)"\s*\n\s*status = (\d+)/g)].map(
  ([, from, to, status]) => ({ from, to, status: Number(status) }),
);

const htmlFiles = (dir, found = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, found);
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
};

test("the build produced the artifact netlify.toml publishes", () => {
  assert.ok(fs.existsSync(dist), "dist does not exist — run site/build.sh");
  assert.match(netlifyToml, /command = "bash site\/build\.sh"/);
  assert.match(netlifyToml, /publish = "dist"/);
  assert.ok(fs.existsSync(path.join(dist, "index.html")), "dist/index.html is missing");
  assert.ok(redirects.length > 20, `only ${redirects.length} redirects parsed from netlify.toml`);
});

/*
 * A rewrite whose target does not exist returns 404 to the student rather than the page. The
 * enrollment, checkout, payment and student routes are all rewrites, so this is the check
 * that says the money paths resolve at all.
 */
test("every 200 rewrite in netlify.toml points at a file the build produced", () => {
  const missing = redirects
    .filter((redirect) => redirect.status === 200 && !redirect.to.startsWith("/.netlify/"))
    .map((redirect) => redirect.to)
    .filter((target) => !fs.existsSync(path.join(dist, target)));
  assert.deepEqual(missing, [], `netlify.toml rewrites to files the build does not produce: ${missing.join(", ")}`);
});

test("every API route points at a Netlify function that exists", () => {
  const routes = redirects.filter((redirect) => redirect.to.startsWith("/.netlify/functions/"));
  assert.ok(routes.length >= 10, `only ${routes.length} API routes found`);
  const functions = [...new Set(routes.map(route => route.to.replace("/.netlify/functions/", "")))].map(name => ({
    name,
    entries:["mjs", "mts", "js", "ts"].filter(extension => fs.existsSync(path.join(root, "netlify/functions", `${name}.${extension}`)))
  }));
  const missing = functions.filter(item => item.entries.length === 0).map(item => item.name);
  assert.deepEqual(missing, [], `API routes point at functions that do not exist: ${missing.join(", ")}`);
  assert.deepEqual(functions.filter(item => item.entries.length > 1), [], "API route has ambiguous duplicate function entrypoints");

  /* The payment chain in particular, named rather than counted, so a route cannot quietly
     disappear and leave the suite green. */
  for (const required of [
    "/api/payments/config",
    "/api/payments/checkout",
    "/api/stripe/webhook",
    "/api/admin/refunds",
  ]) {
    assert.ok(
      routes.some((route) => route.from === required),
      `${required} is not routed`,
    );
  }
});

/*
 * netlify.toml sets `script-src 'self'` on every page. An inline <script> or an inline event
 * handler is silently blocked by that policy in the browser, so the page ships and simply
 * does not work — the failure mode this catches is invisible to a build that succeeds.
 */
test("no page violates the Content-Security-Policy the deploy sets on it", () => {
  assert.match(netlifyToml, /script-src 'self'/, "the CSP no longer restricts scripts to 'self'");
  const offenders = [];
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, "utf8");
    const relative = path.relative(dist, file);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const [, attributes, body] = match;
      if (body.trim() !== "" && !/\btype=["']application\/(ld\+json|json)["']/.test(attributes)) {
        offenders.push(`${relative}: inline <script>`);
      }
      const src = attributes.match(/\bsrc=["']([^"']+)["']/)?.[1];
      if (src && /^[a-z]+:\/\//i.test(src)) offenders.push(`${relative}: external script ${src}`);
    }
    if (/\son(click|load|error|submit|change|input|focus|blur)=["']/i.test(html)) {
      offenders.push(`${relative}: inline event handler`);
    }
  }
  assert.deepEqual(offenders, [], `pages that the CSP will break:\n${offenders.join("\n")}`);
});

test("every page is a complete document with a title", () => {
  const broken = [];
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, "utf8");
    const relative = path.relative(dist, file);
    if (!/^<!doctype html>/i.test(html.trimStart())) broken.push(`${relative}: no doctype`);
    if (!/<title>[^<]+<\/title>/i.test(html)) broken.push(`${relative}: no title`);
    if (!/<html[^>]*\blang=/i.test(html)) broken.push(`${relative}: no lang on <html>`);
    if (!/<\/html>\s*$/i.test(html.trimEnd())) broken.push(`${relative}: document is truncated`);
  }
  assert.deepEqual(broken, [], `incomplete documents:\n${broken.join("\n")}`);
});

/*
 * Netlify and Sites have separate build contracts. A Sites worker may exist, but Netlify must
 * continue to build the static artifact that its redirects and functions expect.
 */
test("the Netlify artifact does not depend on the Sites runtime", () => {
  assert.equal(/command = "bash site\/build\.sh"/.test(netlifyToml), true);
  assert.equal(/vinext|next build|wrangler deploy/.test(netlifyToml), false, "netlify.toml now builds the scaffold");

  /* site/build.sh must remain independently deployable without a Sites Worker. */
  const buildScript = fs.readFileSync(path.join(root, "site/build.sh"), "utf8");
  assert.equal(
    /dist\/server\/index\.js/.test(buildScript),
    false,
    "site/build.sh now produces a worker entry — revive the scaffold's test alongside it",
  );
});
