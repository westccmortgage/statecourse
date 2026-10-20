/* The CEO Admin world's two preflight proofs, without a database process.
 *
 * The database-backed suite proves the SQL contract. This smaller suite pins
 * the policy that previously failed production: material is proven from the
 * immutable declarations stored with each source, and spending authority is
 * read from this workflow's budget row. No transport method is called. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { harness } from "../../core-v2/tests/harness.mjs";
import { FIXTURE_PROJECTS, FIXTURE_RECORDS, FIXTURE_TODAY } from "../../core-v2/domains/ceo-admin/fixture.ts";
import { SOURCE_CONTRACT_VERSION } from "../../core-v2/domains/ceo-admin/records.ts";
import { admit, isSubmissionRefusal, parseSubmission } from "../ceo-admin/submission.ts";
import { CEO_ADMIN_TEXT_MIME_TYPE, CeoAdminMaterialResolver } from "../ceo-admin/material.ts";
import {
  AUTHORITY_VARIABLE, DETAIL, REFUSAL, buildWorldFor, isProblem, operatorRegistry,
} from "../world.ts";

const t = harness("CEO Admin world policy");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BUNDLED = JSON.parse(readFileSync(join(ROOT, "workers", "core-v2-canary", "registry.canary.json"), "utf8"));
const ORG = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const parsed = parseSubmission({
  domain: "ceo_admin",
  contractVersion: SOURCE_CONTRACT_VERSION,
  organizationId: ORG,
  batchId: "policy-proof",
  capturedAt: "2031-03-17T08:00:00Z",
  today: FIXTURE_TODAY,
  projectKeys: FIXTURE_PROJECTS,
  records: FIXTURE_RECORDS.map((record) => ({ ...record.input })),
  conflictPairs: [],
});
if (isSubmissionRefusal(parsed)) throw new Error(parsed.refused);
const admitted = admit(parsed);
if (isSubmissionRefusal(admitted)) throw new Error(admitted.refused);

const registry = operatorRegistry(() => undefined, BUNDLED);
if (isProblem(registry)) throw new Error(registry.refused);

class Record {
  constructor({ material = admitted.material, authority = 1, stopped = null } = {}) {
    this.material = material;
    this.authority = authority;
    this.stopped = stopped;
  }
  async query(sql) {
    if (sql.includes("from public.workflow_sources")) {
      return { rows: admitted.manifest.sources.map((source) => ({
        ordinal: String(source.ordinal),
        uri: source.uri,
        content_hash: source.contentHash,
        media: JSON.stringify({
          ...source.media,
          "core_v2.declared_segments": source.declaredSegments,
        }),
      })) };
    }
    if (sql.includes("from public.intelligence_workflows")) {
      return { rows: [{ requested_scope: JSON.stringify(admitted.manifest.requestedScope) }] };
    }
    if (sql.includes("ceo_admin_read_material")) {
      return { rows: [...this.material].map(([hash, content]) => ({ content_sha256: hash, content })) };
    }
    if (sql.includes("from public.workflow_cost_budgets")) {
      if (this.authority === null) return { rows: [] };
      return { rows: [{
        organization_id: ORG,
        currency: "USD",
        authorized_maximum: String(this.authority),
        maximum_per_attempt: String(Math.min(0.75, this.authority)),
        maximum_attempts: null,
        stopped_reason: this.stopped,
        stopped_at: this.stopped === null ? null : "2031-03-17T08:01:00Z",
      }] };
    }
    throw new Error(`unexpected query: ${sql}`);
  }
}

const attempted = [];
const transport = () => ({
  unresolvedHosts: [],
  send: (request) => {
    attempted.push(request.url);
    throw new Error("this suite performs no request");
  },
});
const environment = (values) => (name) => values[name];
const build = (record, values = {}) => buildWorldFor({
  client: record,
  workflowId: admitted.workflowId,
  organizationId: ORG,
  registry,
  gates: { networkFlag: false, environment: environment(values) },
  answerWithinMs: 5_000,
  authorized: 0,
  transport,
});

t.section("recorded authority");
const fromRecord = await build(new Record());
t.check("a recorded workflow authority builds the world without a deployment-wide amount",
  !isProblem(fromRecord) && fromRecord.config.authorization.maximumAuthorizedCost === 1);

const capped = await build(new Record(), { [AUTHORITY_VARIABLE]: "0.40" });
t.check("the optional deployment amount only lowers the recorded ceiling",
  !isProblem(capped) && capped.config.authorization.maximumAuthorizedCost === 0.4);

const invalid = await build(new Record(), { [AUTHORITY_VARIABLE]: "invalid" });
t.check("an invalid optional ceiling fails closed",
  isProblem(invalid) && invalid.detailCode === DETAIL.deploymentCeilingIsZero);

const absent = await build(new Record({ authority: null }));
t.check("a workflow without its own budget row cannot borrow deployment authority",
  isProblem(absent) && absent.code === REFUSAL.authorityNotInRecord
  && absent.detailCode === DETAIL.budgetRowMissing);

const stopped = await build(new Record({ stopped: "owner_stop" }));
t.check("a stopped workflow cannot rebuild a spend-capable world",
  isProblem(stopped) && stopped.detailCode === DETAIL.budgetStopped);

t.section("declared material");
const missingMaterial = new Map(admitted.material);
missingMaterial.delete(missingMaterial.keys().next().value);
const missing = await build(new Record({ material: missingMaterial }));
t.check("a missing declared part is refused before any runtime is built",
  isProblem(missing) && missing.refused.includes("cannot prove it holds"));

t.section("provider material contract");
const [materialHash, materialText] = admitted.material.entries().next().value;
const resolver = new CeoAdminMaterialResolver({
  getMany: async (_workflowId, hashes) => new Map(
    hashes.filter((hash) => admitted.material.has(hash)).map((hash) => [hash, admitted.material.get(hash)]),
  ),
}, admitted.workflowId);
const [resolved] = await resolver.resolve([{
  sourceId: admitted.manifest.sources[0].sourceId,
  segmentId: "policy-segment",
  contentHash: materialHash,
  locator: "policy-proof",
}]);
t.check("CEO Admin text declares the UTF-8 MIME type used by every configured provider",
  resolved?.mimeType === CEO_ADMIN_TEXT_MIME_TYPE
  && BUNDLED.providers.every((provider) => provider.supportedMediaTypes.includes(resolved.mimeType)),
  resolved?.mimeType);
t.check("the resolver's declared byte length is the UTF-8 byte length it sends",
  resolved?.byteLength === new TextEncoder().encode(materialText).length);

t.check("no request left the suite", attempted.length === 0, `${attempted.length} attempts`);
t.finish();
