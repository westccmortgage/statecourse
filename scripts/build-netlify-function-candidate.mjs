import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { zipFunctions } from "@netlify/zip-it-and-ship-it";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputArgument = process.argv[2];
assert.ok(outputArgument, "usage: npm run build:functions:candidate -- /absolute/new/output/directory");
const baseHead = String(process.env.STATECOURSE_CANDIDATE_BASE_HEAD || "");
assert.match(baseHead, /^[0-9a-f]{40}$/, "STATECOURSE_CANDIDATE_BASE_HEAD must be the verified 40-character base commit");
const output = resolve(outputArgument);
assert.ok(output.startsWith("/tmp/"), "candidate output must be a new directory under /tmp");
await assert.rejects(stat(output), { code: "ENOENT" }, "candidate output already exists");

const require = createRequire(import.meta.url);
const toml = require("toml");
const settings = toml.parse(await readFile(resolve(root, "netlify.toml"), "utf8"));
const functions = settings.functions || {};
const runtime = settings.build?.environment?.AWS_LAMBDA_JS_RUNTIME;
assert.equal(runtime, "nodejs24.x", "candidate Functions must target the documented Node 24 runtime");

const config = {
  "*": {
    includedFiles: functions.included_files || [],
    nodeVersion: runtime,
    ...(functions.node_bundler ? { nodeBundler: functions.node_bundler } : {}),
    ...(functions.external_node_modules ? { externalNodeModules: functions.external_node_modules } : {}),
  },
};
const manifest = resolve(output, "manifest.json");
const bundles = await zipFunctions(resolve(root, "netlify/functions"), output, {
  archiveFormat: "zip",
  basePath: root,
  config,
  manifest,
});

const versions = {
  nodeTarget: runtime,
  netlifyCli: require("netlify-cli/package.json").version,
  zipItAndShipIt: require("@netlify/zip-it-and-ship-it/package.json").version,
  esbuild: require("esbuild/package.json").version,
};
const candidates = [];
for (const bundle of bundles.sort((left, right) => left.name.localeCompare(right.name))) {
  const bytes = await readFile(bundle.path);
  candidates.push({
    name: bundle.name,
    file: basename(bundle.path),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    size: bytes.length,
    runtimeVersion: bundle.runtimeVersion ?? null,
    runtimeAPIVersion: bundle.runtimeAPIVersion,
    invocationMode: bundle.invocationMode ?? null,
    bundler: bundle.bundler,
    routes: bundle.routes ?? [],
    inputs: (bundle.inputs ?? []).map((path) => path.startsWith(root) ? path.slice(root.length) : path),
  });
}
const inputPaths = [...new Set(bundles.flatMap((bundle) => bundle.inputs || []))].sort();
const inputRecords = [];
for (const path of inputPaths) {
  const bytes = await readFile(path);
  inputRecords.push({
    path: path.startsWith(root) ? path.slice(root.length) : path,
    size: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}
const workspaceInputSha256 = createHash("sha256")
  .update(JSON.stringify(inputRecords))
  .digest("hex");
const report = {
  schemaVersion: 2,
  classification: "modified_worktree_candidate_not_an_exact_head_or_live_artifact",
  baseHead,
  workspaceInputSha256,
  inputRecords,
  versions,
  functionCount: candidates.length,
  candidates,
};
await writeFile(resolve(output, "candidate-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  classification: report.classification,
  baseHead,
  workspaceInputSha256,
  versions,
  functionCount: candidates.length,
  apiVersions: [...new Set(candidates.map(({ runtimeAPIVersion }) => runtimeAPIVersion))].sort(),
  runtimeVersions: [...new Set(candidates.map(({ runtimeVersion }) => runtimeVersion))].sort(),
  report: resolve(output, "candidate-report.json"),
}));
