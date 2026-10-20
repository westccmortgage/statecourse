/* ONE TICK, AS THE THING A TEST CAN ALSO CALL.
 *
 * WHY THIS FILE EXISTS AT ALL.
 *
 * The behaviour that matters — which workflow is chosen, whose material is
 * rebuilt, how much of the container's life is left by the time anything is
 * submitted, what is written down when a pass gives up — used to live inside
 * a Deno request handler. An offline suite could only reach it by building a
 * simplified copy of the same sequence, which is a test of the copy.
 *
 * So the sequence lives here, in ordinary portable TypeScript, and the Edge
 * Function is a door: a secret, an environment, a JSON response. Both call
 * THIS. A test injects a sealed transport and a controllable clock; the
 * function injects the Edge Runtime's transport and the real one. Nothing
 * else differs, and nothing else is allowed to.
 *
 * THE ORDER, AND WHY IT IS THIS ORDER.
 *
 *   1. the deadline is taken FIRST, by the caller, before a socket exists;
 *   2. one continuation is claimed — one workflow, and the hold stays ours;
 *   3. that workflow's organisation, sources and material are read and
 *      proven, and its world is built from them;
 *   4. the SAME hold is handed to the pass. It is never given back and
 *      re-claimed: a world built for workflow A and a pass that ran workflow
 *      B is the exact failure this repository already paid for once.
 */
import type { Queryable } from "../core-v2/postgres/wire.ts";
import type { InvocationClock } from "./clock.ts";
import type { ContinuationStore } from "./continuations.ts";
import { runOnePass } from "./runner.ts";
import type { ReadObject } from "./analysis.ts";
import type { PassOutcome } from "./runner.ts";
import { authorityFor, buildWorldFor, concurrencyFor, isProblem, operatorRegistry } from "./world.ts";
import type { DetailCode, Gates, RefusalCode } from "./world.ts";
import { AUTHORITY_VARIABLE, PAID_CALLS_VARIABLE, REGISTRY_VARIABLE, RUNNER_VERSION } from "./world.ts";
import type { RuntimeConfig } from "../core-v2-runtime/runtime-config.ts";
import type { HttpTransport } from "../core-v2-runtime/transport/transport.ts";
import type { EventSink } from "../core-v2-runtime/dispatcher.ts";

export type TickOptions = {
  runner: string;
  client: Queryable;
  store: ContinuationStore;
  clock: InvocationClock;
  gates: Gates;
  transport: (config: RuntimeConfig) => HttpTransport & { unresolvedHosts: string[] };
  /* How this deployment reads a stored object. An analysis of uploaded files
     needs it; the demonstration set does not. */
  readObject?: ReadObject;
  /* The declaration this deployment ships with, used when the environment
     names none. Never invented here: it is a file an operator wrote. */
  bundledRegistry?: unknown;
  /* When the invocation started, and when it must have returned. Both
     absolute, both from the caller, both taken before anything was built. */
  startedAt: number;
  deadlineAt: number;
  /* ONE NAME FOR ONE ATTEMPT AT ONE THING, ACROSS EVERY LINE IT PRODUCES.
     Given by the caller when the caller has one — the door that knocked, a
     test — so a submission and the pass it woke can be read as one story.
     Absent, this tick names itself, because a line that cannot be correlated
     with anything is still better than a line that cannot be found. Validated
     rather than trusted: it goes into log lines, so it may be nothing but a
     bounded run of characters a log cannot be broken with. */
  correlationId?: string;
  now?: () => number;
  events?: EventSink;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

/* `reconciled` names workflows whose continuation had been settled by
   something other than a pass, and which this tick brought back into
   agreement. Every outcome carries it, because the repair runs on every tick
   rather than only on an idle one. */
export type TickOutcome =
  | { kind: "nothing_due"; reconciled: string[] }
  | { kind: "no_such_workflow"; workflowId: string; reconciled: string[] }
  | { kind: "not_configured"; workflowId: string; missing: string[]; reconciled: string[] }
  | {
      /* NOT "material_not_provable". That was the label of one of six refusals
         and it was written for all of them, which is how a refusal about money
         was recorded, for ever, as a refusal about material. */
      kind: "world_not_built"; workflowId: string;
      code: RefusalCode; detailCode: DetailCode; refused: string;
      correlationId: string; runnerVersion: string;
      detail: unknown; reconciled: string[];
    }
  | { kind: "ran"; workflowId: string; outcome: PassOutcome; unresolvedHosts: string[]; seed: string; reconciled: string[] };

/* A correlation id may be carried into a log line, so it is a bounded run of
   characters that cannot break one — never a message, a subject or a url. */
const CORRELATION = /^[A-Za-z0-9._-]{8,64}$/;

function correlationOf(given: string | undefined, workflowSeed: string): string {
  if (typeof given === "string" && CORRELATION.test(given)) return given;
  /* Named from the moment and from a counter, not from the workflow's content:
     a correlation id is for finding lines, and it carries nothing. */
  return `tick-${workflowSeed}`;
}

export async function tickOnce(options: TickOptions): Promise<TickOutcome> {
  const now = options.now ?? (() => Date.now());
  const { client, store, clock, gates } = options;

  /* ── what is due, and it stays ours ─────────────────────────────────── */
  const hold = await store.claim(options.runner, clock.runnerHoldMs);

  /* ── A CONTINUATION CAN BE SETTLED BY SOMETHING THAT IS NOT A PASS ────
   *
   * core_v2_claim_continuation settles a row on the spot when the workflow is
   * already terminal or the continuation ceiling has been reached, and then
   * keeps looking — so the runner is never handed that workflow and never gets
   * the chance to write its state. A pass can also die between settling a
   * continuation and writing the workflow, which leaves the same orphan: a
   * settled continuation beside a workflow that still says it is running,
   * which nothing will ever run and a cancellation cannot reach.
   *
   * So this runs on EVERY tick, immediately after the claim, whether or not a
   * hold was obtained. Doing it only on an idle tick made the repair depend on
   * a tick that might never come; doing it here means the very invocation that
   * caused the settle also repairs it. It is one bounded query and it writes
   * only to workflows that are behind. */
  const reconciled = await store.finishStoppedWorkflows(10);

  if (!hold) return { kind: "nothing_due", reconciled };

  const owner = (await client.query(
    `select organization_id::text as id from public.intelligence_workflows where id = $1::uuid`,
    [hold.workflowId])).rows[0];
  if (!owner) {
    await store.settle(hold.workflowId, "no_such_workflow");
    return { kind: "no_such_workflow", workflowId: hold.workflowId, reconciled };
  }
  const organizationId = String(owner.id);

  /* ── the gates, each named so a refusal says which one to turn on ───── */
  const registry = operatorRegistry(gates.environment, options.bundledRegistry);
  /* An owner's analysis carries its own authority in the record, so a missing
     deployment-wide amount is not a refusal here — the world asks the record
     and refuses if nobody authorised anything. A workflow of the
     demonstration set still needs the variable, and says so. */
  const authorized = authorityFor(gates.environment) ?? 0;
  if (isProblem(registry)) {
    const missing = [
      REGISTRY_VARIABLE,
      gates.environment(PAID_CALLS_VARIABLE) === "true" ? null : PAID_CALLS_VARIABLE,
    ].filter((x): x is string => x !== null);
    /* Nothing was built and nothing was tried. The hold goes back with the
       honest answer, so the record's own backoff applies and a misconfigured
       deployment does not hammer the database. */
    await store.release({ workflowId: hold.workflowId, holdToken: hold.holdToken, moved: false, error: "not_configured" });
    return { kind: "not_configured", workflowId: hold.workflowId, missing, reconciled };
  }

  const built = await buildWorldFor({
    client, workflowId: hold.workflowId, organizationId, registry, gates,
    answerWithinMs: clock.answerWithinMs, authorized, transport: options.transport,
    readObject: options.readObject,
  });
  if (isProblem(built)) {
    /* A runner whose world will not build stops scheduling that workflow rather
       than advancing it wrongly — and the WORKFLOW is told, for the same reason
       every other final stop tells it: a settled continuation beside a workflow
       that still says it is running is two records disagreeing about whether
       anything will ever happen.
       WHAT IS WRITTEN IS THE REFUSAL'S OWN CODE. It used to be the fixed string
       `material_not_provable` whatever the refusal was, so the record accused
       the one cause that had not happened. The code is a machine word from a
       closed set — never a message, a row, an address or a provider answer —
       so it is safe both to store and to log. `detail` is NOT stored and NOT
       logged: it may carry counts and an operator's own problems, and it goes
       only to the caller that asked. */
    const correlationId = correlationOf(options.correlationId, hold.workflowId.slice(0, 8));
    await store.stopForGood(hold.workflowId, built.code);
    return {
      kind: "world_not_built", workflowId: hold.workflowId,
      code: built.code, detailCode: built.detailCode, refused: built.refused,
      correlationId, runnerVersion: RUNNER_VERSION,
      detail: built.detail, reconciled,
    };
  }

  /* ── the same hold, the same workflow, the same world ───────────────── */
  const outcome = await runOnePass({
    name: options.runner,
    clock, store,
    hold,
    startedAt: options.startedAt,
    deadlineAt: options.deadlineAt,
    connect: async () => client as never,
    world: built.world,
    concurrentAttempts: concurrencyFor(gates.environment),
    now,
    events: options.events,
    setTimer: options.setTimer,
    clearTimer: options.clearTimer,
  });

  return { kind: "ran", workflowId: hold.workflowId, outcome, unresolvedHosts: built.unresolvedHosts, seed: built.seed, reconciled };
}

