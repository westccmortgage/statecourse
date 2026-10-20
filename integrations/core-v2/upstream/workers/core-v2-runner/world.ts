/* THE PRODUCTION WORLD ONE RUNNER INVOCATION ADVANCES ONE WORKFLOW IN.
 *
 * Everything provider-shaped is here, behind gates, and nothing above it in
 * the runner knows any of it exists. The runner's own file names no provider
 * and this one names none either — it reads an operator's declaration and
 * builds whatever that declares.
 *
 * THE ORDER MATTERS AND IS THE POINT.
 *
 *   1. the workflow's OWN sources are read from the record, and the material
 *      is rebuilt from the seed they carry and checked hash by hash. A runner
 *      that cannot prove it holds this workflow's material builds nothing;
 *   2. the operator's declaration is loaded and validated;
 *   3. the gates are asked: is the network flag on THIS invocation, is the
 *      paid-calls variable set, is there an authority for this workflow;
 *   4. only then is a transport built, and only then can a key be read — by
 *      the sealed executor, at the submission boundary, which is the one
 *      place in this repository that touches one.
 *
 * With the gates shut the world is still built and still runs: the executors
 * refuse before submission, the ledger holds nothing, and the workflow ends
 * up saying, in the record, that it could not be run. That is deliberate. A
 * runner that crashes when it cannot spend tells an operator nothing; a
 * runner that records a refusal tells them exactly what to turn on.
 */
import type { OrchestrationRepository } from "../core-v2/kernel/repository.ts";
import type { Queryable } from "../core-v2/postgres/wire.ts";
import { DECLARED_SEGMENTS, PostgresOrchestrationRepository } from "../core-v2/postgres/repository.ts";
import { SyntheticRecordsPack } from "../core-v2/domains/synthetic-records/pack.ts";
import { SourceDocumentsPack } from "../core-v2/domains/source-documents/pack.ts";
import type { ScopePair } from "../core-v2/domains/source-documents/pack.ts";
import { AnalysisMaterialResolver, analysisOfSourceUri, manifestOfAnalysis, readAnalysis } from "./analysis.ts";
import type { ReadObject } from "./analysis.ts";
import { RoleRegistry } from "../core-v2/kernel/roles.ts";
import type { WorkPacket } from "../core-v2/kernel/contracts.ts";
import { BudgetLedger } from "../core-v2-runtime/budget/ledger.ts";
import { meteredRepository } from "../core-v2-runtime/budget/metered.ts";
import { buildProviderRegistry } from "../core-v2-runtime/providers/registry.ts";
import { compilePrompt } from "../core-v2-runtime/prompt-compiler.ts";
import { InMemoryMaterialResolver } from "../core-v2-runtime/material/memory-resolver.ts";
import type { RuntimeConfig } from "../core-v2-runtime/runtime-config.ts";
import { loadOperatorRegistry } from "../core-v2-canary/operator-registry.ts";
import type { OperatorRegistry } from "../core-v2-canary/operator-registry.ts";
import { sourceSetOfRecord } from "./source-set.ts";
import { CeoAdminPack } from "../core-v2/domains/ceo-admin/pack.ts";
import { recordOfUri } from "../core-v2/domains/ceo-admin/records.ts";
import { packOptionsOfScope, isSubmissionRefusal } from "./ceo-admin/submission.ts";
import { CeoAdminMaterialResolver, PostgresCeoMaterialStore } from "./ceo-admin/material.ts";
import type { HttpRequest, HttpResponse, HttpTransport } from "../core-v2-runtime/transport/transport.ts";
import { NetworkNotAuthorized } from "../core-v2-runtime/transport/transport.ts";
import type { RunnerWorld } from "./runner.ts";

export const REGISTRY_VARIABLE = "CORE_V2_RUNNER_REGISTRY";
export const PAID_CALLS_VARIABLE = "CORE_V2_ALLOW_PAID_CALLS";
export const AUTHORITY_VARIABLE = "CORE_V2_RUNNER_AUTHORIZED_USD";
export const CONCURRENCY_VARIABLE = "CORE_V2_RUNNER_CONCURRENT_ATTEMPTS";

/* Dormant by default, and every one of these is a deliberate act by an
   operator. None has a value that turns anything on by accident. */
export const DEFAULT_CONCURRENT_ATTEMPTS = 6;
export const DEFAULT_MAXIMUM_ATTEMPTS = 60;

export type Gates = {
  /* This invocation asked for the provider network. Never a default: an
     operator turns it on per call, and the tick that a watchdog sends does
     not carry it unless the deployment says so. */
  networkFlag: boolean;
  environment: (name: string) => string | undefined;
};

/* ─────────────────────────── A REFUSAL SOMEBODY CAN READ BACK AFTERWARDS
 *
 * WHY A CODE AND NOT ONLY A SENTENCE.
 *
 * Every refusal below used to arrive at `tick.ts` as prose and leave it as the
 * single word `material_not_provable`, which is the label of exactly ONE of
 * them. On 2026-09-27 the only real workflow this engine has been given was
 * stopped for good under that label by a refusal about MONEY, and the true
 * reason was not recoverable from the record or from the log, because neither
 * held anything but the label. A day went into recovering it by elimination.
 *
 * So a refusal now carries a machine word for what it was, and a second machine
 * word for the safe part of why. Both are chosen from the closed sets below —
 * never built from a message, a row, an address or a provider answer — so a
 * refusal can be logged and stored without carrying anybody's content.
 *
 * `refused` stays, and stays a sentence: it is what a person reads. What is
 * written to the record and to the log is the codes. */
export const REFUSAL = {
  /* the workflow is not there, or is not this organisation's */
  workflowNotInRecord: "workflow_not_in_record",
  /* the pack this workflow was planned under cannot be rebuilt */
  packNotRebuildable: "pack_not_rebuildable",
  /* the material this workflow read cannot be proved held */
  materialNotProvable: "material_not_provable",
  /* nobody authorised an amount for this workflow, or the authority is unusable */
  authorityNotInRecord: "authority_not_in_record",
  /* this deployment cannot read stored objects, and this workflow needs it */
  deploymentCannotRead: "deployment_cannot_read",
  /* the operator's declaration is missing or was refused */
  notDeclared: "not_declared",
} as const;

export type RefusalCode = typeof REFUSAL[keyof typeof REFUSAL];

/* The safe part of WHY, as a closed set. A detail code says which of a
   refusal's several causes it was, and says it in a word that could not
   contain a subject, an address, a body or a key. */
export const DETAIL = {
  none: "none",
  rowMissing: "row_missing",
  wrongOrganization: "wrong_organization",
  contractVersionMismatch: "contract_version_mismatch",
  partsMissingFromStore: "parts_missing_from_store",
  budgetRowMissing: "budget_row_missing",
  budgetCurrencyUnexpected: "budget_currency_unexpected",
  budgetNotPositive: "budget_not_positive",
  budgetPerAttemptInvalid: "budget_per_attempt_invalid",
  budgetAttemptLimitInvalid: "budget_attempt_limit_invalid",
  budgetStopped: "budget_stopped",
  deploymentCeilingIsZero: "deployment_ceiling_is_zero",
  declarationMissing: "declaration_missing",
  declarationRefused: "declaration_refused",
  storageNotConfigured: "storage_not_configured",
  analysisNotInRecord: "analysis_not_in_record",
} as const;

export type DetailCode = typeof DETAIL[keyof typeof DETAIL];

/* THE VERSION OF THE THING THAT REFUSED. Bumped by hand when the refusals or
   their meanings change, so a log line from a deployment nobody can identify
   any more still says which set of rules produced it. */
export const RUNNER_VERSION = "core-v2-runner.4";

export type WorldProblem = {
  /* what a person reads */
  refused: string;
  /* what a machine reads, and what is written to the record */
  code: RefusalCode;
  detailCode: DetailCode;
  /* free-form, for a response body only. NEVER logged and never stored: a
     refusal about material names counts, and a refusal about a declaration
     names an operator's problems, and neither is content this engine should
     put into a log line it does not control the retention of. */
  detail?: unknown;
};

export function isProblem(value: unknown): value is WorldProblem {
  return typeof value === "object" && value !== null && "refused" in (value as Record<string, unknown>);
}

/* The one authority number this deployment gives a workflow, in the currency
   the declaration prices in. It is per workflow and it is set once, at start;
   a continuation never offers one. */
export function authorityFor(environment: (name: string) => string | undefined): number | null {
  const raw = environment(AUTHORITY_VARIABLE);
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function concurrencyFor(environment: (name: string) => string | undefined): number {
  const raw = Number(environment(CONCURRENCY_VARIABLE) ?? "");
  return Number.isFinite(raw) && raw >= 1 ? Math.trunc(raw) : DEFAULT_CONCURRENT_ATTEMPTS;
}

/* ══════════════════════════════ WHAT A WORKFLOW MAY SPEND, FROM THE RECORD
 *
 * WHERE AUTHORITY LIVES, AND WHERE IT DOES NOT.
 *
 * The submission door writes a workflow's authority into
 * `workflow_cost_budgets` in the SAME COMMIT that creates the workflow, so
 * there is no moment in which a runnable workflow exists with no authority and
 * none in which an authority exists for a workflow that does not. That row is
 * the source of truth. It is a row a person's press produced, it is per
 * workflow, and it is auditable after the fact.
 *
 * `CORE_V2_RUNNER_AUTHORIZED_USD` is NOT that. It is a deployment-wide number
 * an operator sets once, and it cannot know what any particular person
 * authorised. The file used to read it INSTEAD of the row — and eighteen lines
 * below the check, its own comment said the row was written first and the
 * variable was "the fallback for a workflow that somehow has none". The code
 * did the opposite of what the comment said, and so a workflow carrying $1.00
 * of somebody's authority was stopped for ever because a variable was unset.
 *
 * So: the row decides, and the variable may only LOWER what the row allows.
 * A missing variable is not a missing authority. A missing row is, and is
 * refused — fail closed, because a workflow nobody authorised must not spend.
 *
 * `analysisWorld` has always read the record (`analysis.authorizedUsd`). This
 * makes CEO Admin agree with it.
 */
export type WorkflowAuthority = {
  /* what may be spent in all, after any deployment ceiling is applied */
  authorized: number;
  /* what the record itself said, before the ceiling */
  recordAuthorized: number;
  maximumPerAttempt: number;
  /* null where the record names none: the deployment's own default applies.
     An invalid value is refused; an absent one is not a refusal. */
  maximumAttempts: number | null;
  currency: string;
  /* the deployment ceiling that was applied, when one was set */
  deploymentCeiling: number | null;
};

const AUTHORITY_CURRENCY = "USD";

/* Reads the row, checks it, and refuses rather than guessing. Every refusal
   names a detail code and no value out of the row, because a refusal is logged
   and an amount is somebody's business. */
export async function authorityFromRecord(
  client: Queryable, workflowId: string, organizationId: string,
  environment: (name: string) => string | undefined,
): Promise<WorkflowAuthority | WorldProblem> {
  const found = await client.query(
    `select organization_id::text as organization_id, currency,
            authorized_maximum::text as authorized_maximum,
            maximum_per_attempt::text as maximum_per_attempt,
            maximum_attempts, stopped_reason
       from public.workflow_cost_budgets where workflow_id = $1::uuid`, [workflowId]);

  if (found.rows.length === 0) {
    return {
      refused: "nobody authorised an amount for this workflow, so nothing may be sent",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetRowMissing,
    };
  }
  const row = found.rows[0] as Record<string, unknown>;

  /* WHOSE AUTHORITY IT IS. A budget row for another organisation is not this
     workflow's authority whatever it says, and reading one would be the first
     step of reading across a tenant boundary. */
  if (String(row.organization_id) !== organizationId) {
    return {
      refused: "the authority recorded for this workflow belongs to another organisation",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.wrongOrganization,
    };
  }
  if (row.stopped_reason !== null && row.stopped_reason !== undefined) {
    return {
      refused: "spending on this workflow was stopped, and a runner does not restart it",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetStopped,
    };
  }
  /* The declaration prices in one currency. A row in another is not a smaller
     or larger authority, it is an authority this runner cannot compare. */
  if (String(row.currency) !== AUTHORITY_CURRENCY) {
    return {
      refused: `this runner prices in ${AUTHORITY_CURRENCY} and this workflow's authority is recorded in another currency`,
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetCurrencyUnexpected,
    };
  }
  const recordAuthorized = Number(row.authorized_maximum);
  if (!Number.isFinite(recordAuthorized) || recordAuthorized <= 0) {
    return {
      refused: "the authority recorded for this workflow permits nothing to be sent",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetNotPositive,
    };
  }
  const maximumPerAttempt = Number(row.maximum_per_attempt);
  if (!Number.isFinite(maximumPerAttempt) || maximumPerAttempt <= 0 || maximumPerAttempt > recordAuthorized) {
    return {
      refused: "the per-attempt limit recorded for this workflow is not a limit this runner can honour",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetPerAttemptInvalid,
    };
  }
  /* ABSENT IS NOT INVALID. The door leaves `maximum_attempts` null and the
     deployment's own default applies; a value that is present and unusable is
     a different thing and is refused. */
  const rawAttempts = row.maximum_attempts;
  let maximumAttempts: number | null = null;
  if (rawAttempts !== null && rawAttempts !== undefined) {
    const attempts = Number(rawAttempts);
    if (!Number.isFinite(attempts) || attempts < 1) {
      return {
        refused: "the attempt limit recorded for this workflow permits no attempt",
        code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetAttemptLimitInvalid,
      };
    }
    maximumAttempts = Math.trunc(attempts);
  }

  /* THE VARIABLE, IN THE ONE DIRECTION IT MAY ACT. Set, it lowers. Unset, it
     does nothing at all — it is not an authority and its absence is not the
     absence of one. A ceiling of zero is an operator saying "this deployment
     sends nothing", and that is honoured and named. */
  const ceiling = authorityFor(environment);
  const ceilingSet = environment(AUTHORITY_VARIABLE) !== undefined && environment(AUTHORITY_VARIABLE) !== "";
  if (ceilingSet && ceiling === null) {
    return {
      refused: `${AUTHORITY_VARIABLE} is set to a value that authorises nothing, so this deployment sends nothing`,
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.deploymentCeilingIsZero,
    };
  }
  const authorized = ceiling === null ? recordAuthorized : Math.min(recordAuthorized, ceiling);

  return {
    authorized, recordAuthorized,
    maximumPerAttempt: Math.min(maximumPerAttempt, authorized),
    maximumAttempts, currency: AUTHORITY_CURRENCY,
    deploymentCeiling: ceiling,
  };
}

export function isAuthority(value: WorkflowAuthority | WorldProblem): value is WorkflowAuthority {
  return !isProblem(value);
}

/* THE DECLARATION THIS DEPLOYMENT ALREADY MADE.
 *
 * An operator's declaration of models, addresses, capabilities and prices is
 * not something this repository may invent, and it does not. What it may do is
 * use the one an operator already wrote, signed their name to and ran a paid
 * canary against — it is in the repository, it passes every check in
 * operator-registry.ts, and the key VARIABLES it names are the ones this
 * project's secrets are already set under.
 *
 * So: the environment wins when it is set, and this is what is used when it is
 * not. Nothing is invented either way, and a deployment that wants different
 * models sets the variable. */
export function operatorRegistry(
  environment: (name: string) => string | undefined,
  fallback?: unknown,
): OperatorRegistry | WorldProblem {
  const declaration = environment(REGISTRY_VARIABLE);
  const source = declaration ? declaration : fallback ? JSON.stringify(fallback) : null;
  if (!source) {
    return {
      refused: `${REGISTRY_VARIABLE} is not set and no declaration was bundled: this runner has no statement of models, addresses, capabilities and prices, and it invents none`,
      code: REFUSAL.notDeclared, detailCode: DETAIL.declarationMissing,
    };
  }
  const { registry, problems } = loadOperatorRegistry(source, declaration ? REGISTRY_VARIABLE : "the declaration this deployment ships with");
  if (!registry) {
    return {
      refused: "the operator declaration was refused",
      code: REFUSAL.notDeclared, detailCode: DETAIL.declarationRefused, detail: problems,
    };
  }
  return registry;
}

/* The configuration the runtime is handed: the operator's declaration, plus
   the authorization this deployment grants, plus the clock's own answer
   window in place of whatever the declaration hoped for. */
export function configuredFor(
  registry: OperatorRegistry, gates: Gates, answerWithinMs: number, authorized: number,
  /* An owner analysis carries its own gate: a person pressed a button and the
     record kept the press. It overrides the deployment-wide variable, and it
     overrides it in one direction only — an analysis nobody authorised cannot
     spend even where the variable is on. */
  paidCallsAllowed?: boolean,
): RuntimeConfig {
  const providers = registry.config.providers.map((provider) => (
    provider.requestTimeoutMs <= answerWithinMs ? provider : { ...provider, requestTimeoutMs: answerWithinMs }
  ));
  return {
    ...registry.config,
    providers,
    authorization: {
      providerNetworkFlag: gates.networkFlag === true,
      environmentGate: paidCallsAllowed === undefined
        ? gates.environment(PAID_CALLS_VARIABLE) === "true"
        : paidCallsAllowed === true,
      maximumAuthorizedCost: authorized,
      currency: "USD",
      providerAllowlist: registry.config.providers.map((p) => p.providerId),
      modelAllowlist: registry.config.providers.flatMap((p) => p.models),
    },
  };
}

export type BuiltWorld = {
  world: RunnerWorld;
  config: RuntimeConfig;
  ledger: BudgetLedger;
  unresolvedHosts: string[];
  seed: string;
};

/* ─────────────────────────── A TRANSPORT THAT WILL NOT BE BUILT IS A REFUSAL
 *
 * The transport a real deployment builds refuses to EXIST unless every
 * authorization is in place. That is right, and it is the ordinary state of a
 * deployment that is deliberately dormant — which is what this repository
 * ships as. Letting that refusal escape from here breaks the promise made at
 * the top of this file, and broke it in production: with the gates shut the
 * world is still built and still runs, and the refusal is what ends up in the
 * record. Instead, the whole pass died with `unhandled`, the workflow stayed
 * at `created`, and an operator was told nothing about which switch was off.
 *
 * So a transport that will not be built is replaced by one that will not
 * send. It carries the reasons the real one gave, and the executors already
 * know what to do with it: `network_not_authorized`, nothing sent, nothing
 * owed, and the reasons written on the attempt where somebody can read them.
 */
class TransportThatWillNotSend implements HttpTransport {
  readonly name = "not-authorised";
  readonly unresolvedHosts: string[] = [];
  readonly said: string;
  readonly refusals: string[];
  constructor(said: string, refusals: string[]) {
    this.said = said;
    this.refusals = refusals;
  }
  send(_request: HttpRequest): Promise<HttpResponse> {
    return Promise.reject(new NetworkNotAuthorized(this.said, this.refusals));
  }
}

function transportOrRefusal(
  make: (config: RuntimeConfig) => HttpTransport & { unresolvedHosts: string[] },
  config: RuntimeConfig,
): HttpTransport & { unresolvedHosts: string[] } {
  try {
    return make(config);
  } catch (error) {
    if (!(error instanceof NetworkNotAuthorized)) throw error;
    return new TransportThatWillNotSend(error.message, error.refusals);
  }
}

/* Builds the world for ONE workflow. The workflow id is not decoration: the
   sources it reads, the material it may resolve and the budget it may hold
   are all that workflow's, and a runner holding this world can advance no
   other. */
export async function buildWorldFor(options: {
  client: Queryable;
  workflowId: string;
  organizationId: string;
  registry: OperatorRegistry;
  gates: Gates;
  answerWithinMs: number;
  authorized: number;
  /* THE ONE THING THIS FILE DOES NOT BUILD.
     Injected, because the Edge Runtime's transport and a test's sealed
     transport are the same shape and everything above this line must not be
     able to tell them apart. It is also the only way an offline suite can
     drive the REAL world builder rather than a simplified copy of it. */
  transport: (config: RuntimeConfig) => HttpTransport & { unresolvedHosts: string[] };
  /* How this deployment reads an object out of storage. Injected, because a
     test reads from a map and the Edge Function reads from Supabase, and
     nothing above this line may be able to tell them apart. Only an analysis
     of uploaded files needs it; the fixture world does not. */
  readObject?: ReadObject;
}): Promise<BuiltWorld | WorldProblem> {
  const { client, workflowId, organizationId, registry, gates, answerWithinMs, authorized } = options;

  const recorded = await client.query(
    `select ordinal, uri, content_hash, media from public.workflow_sources
      where workflow_id = $1 order by ordinal`, [workflowId]);
  const rows = recorded.rows.map((row) => ({
    ordinal: Number(row.ordinal), uri: String(row.uri), contentHash: String(row.content_hash), media: row.media,
  }));

  /* WHICH WORLD THIS WORKFLOW LIVES IN, read from its own sources.
     A workflow's uris say what its material is: a fixture invented from a
     seed, or files somebody uploaded. Nothing ambient decides this. */
  const asAnalysis = rows.length > 0 ? analysisOfSourceUri(rows[0].uri) : null;
  if (asAnalysis) {
    return await analysisWorld({ ...options, rows, analysisId: asAnalysis.analysisId });
  }
  /* Rows another system holds. Recognised by the scheme its sources are named
     under, exactly as an analysis is — nothing ambient decides this either. */
  if (rows.length > 0 && recordOfUri(rows[0].uri)) {
    return await ceoAdminWorld({ ...options, rows });
  }

  let sourceSet;
  try {
    sourceSet = sourceSetOfRecord(workflowId, organizationId, rows);
  } catch (error) {
    return {
      refused: "this runner cannot prove it holds this workflow's material",
      code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore,
      detail: (error as { reasons?: string[] }).reasons ?? String((error as Error).message),
    };
  }

  /* THE DEMONSTRATION SET IS THE ONE PLACE THE VARIABLE IS STILL AN AUTHORITY,
     and deliberately so: a synthetic workflow is invented from a seed, nobody
     pressed a button for it, and there is no row anybody's press produced. An
     operator turning the variable on IS the authorisation here. Every workflow
     over somebody's real rows reads the record instead. */
  if (authorized <= 0) {
    return {
      refused: `${AUTHORITY_VARIABLE} is not set, so no workflow of the demonstration set can be given an authority`,
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.deploymentCeilingIsZero,
    };
  }
  const config = configuredFor(registry, gates, answerWithinMs, authorized);
  const pack = new SyntheticRecordsPack();
  const roles = new RoleRegistry(pack);
  const ledger = new BudgetLedger(client as never, config);

  const stored = new Map<string, { mediaKind: string; mimeType: string; bytes: Uint8Array }>();
  for (const [hash, item] of sourceSet.material) stored.set(hash, item);

  const transport = transportOrRefusal(options.transport, config);
  const executors = buildProviderRegistry({
    config, transport, routing: registry.routing,
    compilePrompt: (packet: WorkPacket) => compilePrompt(packet, roles.role(packet.roleKey)),
    materialResolver: new InMemoryMaterialResolver(stored as never),
    environment: gatesToEnvironment(gates),
  });

  const world: RunnerWorld = {
    pack,
    executors: () => executors.registry,
    repository: (c: Queryable): OrchestrationRepository => meteredRepository(
      new PostgresOrchestrationRepository(c as never, { organizationId }),
      { ledger, config, providerOfFamily: (family: string) => registry.routing[family] ?? null },
    ),
    hasBudget: async (id: string) => (await ledger.budget(id)) !== null,
    authorize: async (id: string) => {
      const concurrent = concurrencyFor(gates.environment);
      await ledger.authorizeWorkflow({
        workflowId: id, organizationId, currency: "USD",
        authorizedMaximum: authorized,
        maximumPerAttempt: worstPerAttempt(config),
        maximumAttempts: DEFAULT_MAXIMUM_ATTEMPTS,
        maximumConcurrentAttempts: concurrent,
        /* Held totals, not per-request ceilings. The canary spent four
           generations discovering that difference one reader at a time. */
        maximumInputTokens: concurrent * Math.max(...config.providers.map((p) => p.maximumInputTokens)),
        maximumOutputTokens: concurrent * Math.max(...config.providers.map((p) => p.maximumOutputTokens)),
      });
    },
  };

  return { world, config, ledger, unresolvedHosts: transport.unresolvedHosts, seed: sourceSet.seed };
}

/* ═══════════════════════════════ THE WORLD OF ROWS ANOTHER SYSTEM HOLDS
 *
 * The same shape as the other two, and different in exactly two places.
 *
 * THE PACK IS REBUILT FROM THE WORKFLOW'S OWN SCOPE. Which projects a message
 * may be classified into, and which day "due" and "nearly here" are measured
 * against, were decided when the batch was submitted and frozen onto the
 * workflow. A pass tomorrow rebuilds them from there rather than from today,
 * because a workflow continued under a different taxonomy would plan
 * different assignments and the kernel's idempotent admission would quietly
 * create a second set of them.
 *
 * THE MATERIAL IS READ BACK, NOT REBUILT. A fixture is rebuilt from a seed and
 * an analysis is read out of storage; this is read out of the engine's own
 * material table, by hash, for this workflow. It cannot be rebuilt from the
 * other system, because the other system's rows move — and a critic handed
 * today's version of a message a reader saw yesterday is the failure the whole
 * source-set check exists to prevent.
 */
async function ceoAdminWorld(options: {
  client: Queryable;
  workflowId: string;
  organizationId: string;
  registry: OperatorRegistry;
  gates: Gates;
  answerWithinMs: number;
  authorized: number;
  transport: (config: RuntimeConfig) => HttpTransport & { unresolvedHosts: string[] };
  rows: { ordinal: number; uri: string; contentHash: string; media: unknown }[];
}): Promise<BuiltWorld | WorldProblem> {
  const { client, workflowId, organizationId, registry, gates, answerWithinMs, authorized, rows } = options;

  /* WHAT THIS WORKFLOW WAS PLANNED UNDER, read back from the workflow. */
  const found = await client.query(
    `select requested_scope from public.intelligence_workflows where id = $1`, [workflowId]);
  if (found.rows.length === 0) {
    return {
      refused: "this workflow is not in the record",
      code: REFUSAL.workflowNotInRecord, detailCode: DETAIL.rowMissing,
    };
  }
  const scopeOptions = packOptionsOfScope(asJsonObject(found.rows[0].requested_scope));
  if (isSubmissionRefusal(scopeOptions)) {
    return {
      refused: "this runner cannot rebuild the pack this workflow was planned under",
      code: REFUSAL.packNotRebuildable, detailCode: DETAIL.contractVersionMismatch,
      detail: [scopeOptions.refused],
    };
  }

  /* THE CHECK THAT SAYS THIS RUNNER HOLDS THIS WORKFLOW'S MATERIAL.
     Every source names a part, every part was stored under the hash of its own
     characters, and a pass that cannot find them all is a pass that would hand
     a reader nothing and call it an answer. Refusing is the honest outcome. */
  const store = new PostgresCeoMaterialStore(client);
  const wanted = new Set<string>();
  for (const row of rows) {
    const declared = asJsonObject(row.media)[DECLARED_SEGMENTS];
    if (!Array.isArray(declared) || declared.length === 0) {
      return {
        refused: "this runner cannot prove it holds this workflow's material",
        code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore,
        detail: [`source ${row.ordinal} declares no material`],
      };
    }
    for (const segment of declared) {
      const hash = asJsonObject(segment).contentHash;
      if (typeof hash !== "string" || !/^[0-9a-f]{64}$/.test(hash)) {
        return {
          refused: "this runner cannot prove it holds this workflow's material",
          code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore,
          detail: [`source ${row.ordinal} declares an invalid material hash`],
        };
      }
      wanted.add(hash);
    }
  }
  const wantedHashes = [...wanted];
  const held = await store.getMany(workflowId, wantedHashes);
  const missing = wantedHashes.filter((hash) => !held.has(hash));
  if (missing.length > 0) {
    return {
      refused: "this runner cannot prove it holds this workflow's material",
      code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore,
      detail: [`${missing.length} of ${wantedHashes.length} parts this workflow read are not in the material store`],
    };
  }

  /* WHAT THIS WORKFLOW MAY SPEND, READ FROM ITS OWN RECORD.
     `authorized` — the deployment-wide number this function is handed — is no
     longer consulted for whether the workflow may run. It reaches the ledger
     only through the ceiling `authorityFromRecord` applies, and a deployment
     that sets nothing lowers nothing. See that function for why. */
  const authority = await authorityFromRecord(client, workflowId, organizationId, gates.environment);
  if (!isAuthority(authority)) return authority;

  const config = configuredFor(registry, gates, answerWithinMs, authority.authorized);
  const pack = new CeoAdminPack(scopeOptions);
  const roles = new RoleRegistry(pack);
  const ledger = new BudgetLedger(client as never, config);

  const transport = transportOrRefusal(options.transport, config);
  const executors = buildProviderRegistry({
    config, transport, routing: registry.routing,
    compilePrompt: (packet: WorkPacket) => compilePrompt(packet, roles.role(packet.roleKey)),
    materialResolver: new CeoAdminMaterialResolver(store, workflowId),
    environment: gatesToEnvironment(gates),
  });

  const world: RunnerWorld = {
    pack,
    executors: () => executors.registry,
    repository: (c: Queryable): OrchestrationRepository => meteredRepository(
      new PostgresOrchestrationRepository(c as never, { organizationId }),
      { ledger, config, providerOfFamily: (family: string) => registry.routing[family] ?? null },
    ),
    hasBudget: async (id: string) => (await ledger.budget(id)) !== null,
    /* The submission door already wrote this workflow's authority. If that row
       disappears after the world was built, the runner refuses: it never
       recreates authority from a stale in-memory reading. */
    authorize: async (id: string) => {
      const current = await authorityFromRecord(client, id, organizationId, gates.environment);
      if (!isAuthority(current)) {
        throw new Error(`core-v2 runner: recorded authority disappeared (${current.code}/${current.detailCode})`);
      }
    },
  };

  return { world, config, ledger, unresolvedHosts: transport.unresolvedHosts, seed: `ceo-admin/${rows.length}` };
}

/* The most any one attempt of any configured model could hold. Priced from
   the ceilings, never from an expectation. */
function worstPerAttempt(config: RuntimeConfig): number {
  let worst = 0;
  for (const provider of config.providers) {
    const price = config.pricing.find((p) => p.providerId === provider.providerId && provider.models.includes(p.model));
    if (!price) continue;
    const input = Math.max(price.inputPerMillionTokens, price.cachedInputPerMillionTokens ?? 0, price.cacheWritePerMillionTokens ?? 0);
    const output = Math.max(price.outputPerMillionTokens, price.reasoningPerMillionTokens ?? 0);
    const ceiling = (provider.maximumInputTokens * input + provider.maximumOutputTokens * output) / 1_000_000;
    if (ceiling > worst) worst = ceiling;
  }
  return Number(worst.toFixed(6));
}

function gatesToEnvironment(gates: Gates): Record<string, string | undefined> {
  return new Proxy({}, {
    get: (_target, name: string) => gates.environment(name),
    has: (_target, name: string) => gates.environment(name) !== undefined,
  }) as Record<string, string | undefined>;
}


/* ─────────────────────────────────── the world of somebody's own files
 *
 * Same shape as the fixture world and the same discipline: the material is
 * rebuilt from the record and proved against what the workflow says it read,
 * before anything is built that could send a request.
 *
 * Two things differ, and both come from the record rather than from a
 * deployment-wide switch:
 *
 *   · the authority is the amount the owner authorised for THIS analysis;
 *   · the paid gate is the owner's own press, kept in `run_requested_at`. An
 *     analysis nobody pressed cannot spend, whatever any environment variable
 *     says, and this is the direction that matters.
 */
async function analysisWorld(options: {
  client: Queryable;
  workflowId: string;
  organizationId: string;
  registry: OperatorRegistry;
  gates: Gates;
  answerWithinMs: number;
  authorized: number;
  transport: (config: RuntimeConfig) => HttpTransport & { unresolvedHosts: string[] };
  readObject?: ReadObject;
  rows: { ordinal: number; uri: string; contentHash: string }[];
  analysisId: string;
}): Promise<BuiltWorld | WorldProblem> {
  const { client, workflowId, organizationId, registry, gates, answerWithinMs, rows, analysisId } = options;

  if (!options.readObject) {
    return {
      refused: "this deployment has no way to read stored material, so an analysis of uploaded files cannot be run here",
      code: REFUSAL.deploymentCannotRead, detailCode: DETAIL.storageNotConfigured,
    };
  }

  const analysis = await readAnalysis(client, analysisId);
  if (!analysis) {
    return {
      refused: "the analysis this workflow names is not in the record",
      code: REFUSAL.workflowNotInRecord, detailCode: DETAIL.analysisNotInRecord,
    };
  }
  if (analysis.organizationId !== organizationId) {
    return {
      refused: "the analysis this workflow names belongs to another organisation",
      code: REFUSAL.workflowNotInRecord, detailCode: DETAIL.wrongOrganization,
    };
  }

  /* WHAT THIS RUN COMPARES, read back rather than decided again.
     The pairs were settled once when the workflow was started and written
     into its requested scope, which 058 freezes. A pass that decided them
     again could reach a different answer — the owner may have changed their
     mind since — and would then be building assignments the first pass never
     made, over material a finished reading already rests on. */
  const scope = (await client.query(
    `select requested_scope from public.intelligence_workflows where id = $1::uuid`, [workflowId])).rows[0];
  const requested = scope ? asJsonObject(scope.requested_scope) : {};
  const pairs = Array.isArray(requested.pairs) ? (requested.pairs as ScopePair[]) : [];

  let manifest;
  try {
    manifest = manifestOfAnalysis(analysis, workflowId, {
      pairs, unpaired: Array.isArray(requested.unpaired) ? requested.unpaired : [],
      note: String(requested.pairingNote ?? ""),
    });
  } catch (error) {
    return {
      refused: "this runner cannot rebuild the material this analysis was started over",
      code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore,
      detail: (error as { reasons?: string[] }).reasons ?? String((error as Error).message),
    };
  }

  /* THE CHECK THAT MAKES A FIXED SET FIXED.
     What the record says this workflow read, against what the analysis holds
     now. A file added, replaced or re-prepared since the start changes a
     source hash, and a changed hash is refused rather than quietly read. */
  const reasons: string[] = [];
  const byOrdinal = new Map(manifest.sources.map((source) => [source.ordinal, source]));
  for (const row of rows) {
    const rebuilt = byOrdinal.get(row.ordinal);
    if (!rebuilt) { reasons.push(`the workflow read a file ${row.ordinal} the analysis no longer holds`); continue; }
    if (rebuilt.contentHash !== row.contentHash) {
      reasons.push(`file ${row.ordinal} has been prepared differently since this analysis started`);
    }
  }
  if (manifest.sources.length !== rows.length) {
    reasons.push(`the workflow was started over ${rows.length} files and the analysis now holds ${manifest.sources.length}`);
  }
  if (reasons.length > 0) {
    return {
      refused: "this runner cannot prove it holds this workflow's material",
      code: REFUSAL.materialNotProvable, detailCode: DETAIL.partsMissingFromStore, detail: reasons,
    };
  }

  const authorized = analysis.authorizedUsd ?? 0;
  if (authorized <= 0) {
    return {
      refused: "nobody has authorised an amount for this analysis, so nothing may be sent",
      code: REFUSAL.authorityNotInRecord, detailCode: DETAIL.budgetNotPositive,
    };
  }

  const config = configuredFor(registry, gates, answerWithinMs, authorized, analysis.paidCallsAllowed);
  const pack = new SourceDocumentsPack({ question: questionFor(analysis), pairs });
  const roles = new RoleRegistry(pack);
  const ledger = new BudgetLedger(client as never, config);

  const transport = transportOrRefusal(options.transport, config);
  const executors = buildProviderRegistry({
    config, transport, routing: registry.routing,
    compilePrompt: (packet: WorkPacket) => compilePrompt(packet, roles.role(packet.roleKey)),
    materialResolver: new AnalysisMaterialResolver(analysis, options.readObject),
    environment: gatesToEnvironment(gates),
  });

  const world: RunnerWorld = {
    pack,
    executors: () => executors.registry,
    repository: (c: Queryable): OrchestrationRepository => meteredRepository(
      new PostgresOrchestrationRepository(c as never, { organizationId }),
      { ledger, config, providerOfFamily: (family: string) => registry.routing[family] ?? null },
    ),
    hasBudget: async (id: string) => (await ledger.budget(id)) !== null,
    authorize: async (id: string) => {
      const concurrent = concurrencyFor(gates.environment);
      await ledger.authorizeWorkflow({
        workflowId: id, organizationId, currency: "USD",
        authorizedMaximum: authorized,
        maximumPerAttempt: worstPerAttempt(config),
        maximumAttempts: DEFAULT_MAXIMUM_ATTEMPTS,
        maximumConcurrentAttempts: concurrent,
        maximumInputTokens: concurrent * Math.max(...config.providers.map((p) => p.maximumInputTokens)),
        maximumOutputTokens: concurrent * Math.max(...config.providers.map((p) => p.maximumOutputTokens)),
      });
    },
  };

  return { world, config, ledger, unresolvedHosts: transport.unresolvedHosts, seed: analysis.analysisId };
}

/* The owner's words when they typed any, and otherwise the plain meaning of
   the kind of analysis they chose. Nothing here embellishes: a reader is
   asked the question that was asked. */
/* A jsonb column arrives as an object from one driver and as text from
   another. Both are read the same way here, and neither is guessed at. */
function asJsonObject(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value === "string") { try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; } }
  return value as Record<string, unknown>;
}

export function questionFor(analysis: { question: string; questionKind: string }): string {
  const typed = (analysis.question ?? "").trim();
  if (typed) return typed;
  if (analysis.questionKind === "plan_consistency") {
    return "Is anything on this page inconsistent with the rest of this set of plans — a dimension, a label, a count or a note that contradicts another?";
  }
  if (analysis.questionKind === "video_against_plans") {
    return "Does what is visible here match what the plans of this set specify?";
  }
  return "Does this material answer the question this analysis was created to ask?";
}
