/* A real continuation with queued work and an unanswered evidence dispute:
 * the runner must stop asking for more paid work and hand the same workflow
 * to the person. No provider or network endpoint is used. */
import { harness } from "../../core-v2/tests/harness.mjs";
import { withThrowawayDatabase } from "../../core-v2/tests/postgres-harness.mjs";
import { buildWorld, startWorkflow, runnerPass, LONG_LIFE } from "./world.mjs";

const t = harness("a human hold stops new work");

await withThrowawayDatabase(async ({ client, organizationId }) => {
  const { truth, pack, world } = buildWorld({
    client, organizationId, seed: "runner/human-hold",
  });
  const { workflowId, store } = await startWorkflow({
    client, organizationId, truth, pack,
  });
  await client.query(
    `insert into public.disagreements
       (organization_id, workflow_id, disagreement_key, kind, state)
     values ($1::uuid, $2::uuid, 'awaiting-owner', 'value', 'needs_human')`,
    [organizationId, workflowId],
  );

  const result = await runnerPass({
    client, world, store, name: "human-hold", life: LONG_LIFE,
  });
  const tasks = (await client.query(
    "select state from public.workflow_tasks where workflow_id = $1::uuid",
    [workflowId],
  )).rows;
  const attempts = (await client.query(
    "select count(*)::integer as n from public.agent_attempts where workflow_id = $1::uuid",
    [workflowId],
  )).rows[0].n;
  const workflow = (await client.query(
    "select state from public.intelligence_workflows where id = $1::uuid",
    [workflowId],
  )).rows[0];

  t.check("the runner saw an actual workflow and passed the human hold",
    result.claimed && result.stopReason === "handed_to_a_person",
    String(result.stopReason));
  t.check("the continuation settled instead of polling again",
    (await store.read(workflowId))?.state === "settled");
  t.check("the workflow records that a person must act", workflow.state === "needs_attention",
    workflow.state);
  t.check("the work is preserved for planning after the decision",
    tasks.some((task) => ["created", "blocked", "queued"].includes(task.state)),
    JSON.stringify(tasks));
  t.check("nothing was leased or submitted while waiting",
    !tasks.some((task) => task.state === "leased" || task.state === "running") && Number(attempts) === 0,
    JSON.stringify({ attempts, tasks }));
});

await withThrowawayDatabase(async ({ client, organizationId }) => {
  const { truth, pack, world } = buildWorld({
    client, organizationId, seed: "runner/hold-after-lease",
  });
  const { workflowId, store } = await startWorkflow({
    client, organizationId, truth, pack,
  });
  const originalRepository = world.repository;
  let injected = false;
  const events = [];
  world.repository = (connection) => {
    const repo = originalRepository(connection);
    return new Proxy(repo, {
      get(target, key) {
        const value = Reflect.get(target, key);
        if (key !== "submitAttempt") return typeof value === "function" ? value.bind(target) : value;
        return async (...args) => {
          if (!injected) {
            injected = true;
            await client.query(
              `insert into public.disagreements
                 (organization_id, workflow_id, disagreement_key, kind, state)
               values ($1::uuid, $2::uuid, 'arrived-after-lease', 'value', 'needs_human')`,
              [organizationId, workflowId],
            );
          }
          return value.apply(target, args);
        };
      },
    });
  };

  await runnerPass({
    client, world, store, name: "hold-after-lease", life: LONG_LIFE,
    events: (event) => events.push(event),
  });
  const attempts = (await client.query(
    "select state,error_code,error_message from public.agent_attempts where workflow_id = $1::uuid",
    [workflowId],
  )).rows;
  const tasks = (await client.query(
    "select state,terminal_reason from public.workflow_tasks where workflow_id = $1::uuid",
    [workflowId],
  )).rows;
  const budget = (await client.query(
    "select reserved, settled from public.workflow_cost_budgets where workflow_id = $1::uuid",
    [workflowId],
  )).rows[0];
  t.check("the hold arrived after an actual lease", injected);
  t.check("prepared work was retained as blocked rather than bought or discarded",
    attempts.some((a) => a.state === "cancelled_before_submission") &&
      tasks.some((task) => task.state === "blocked") &&
      !tasks.some((task) => task.state === "cancelled"),
    JSON.stringify({ attempts, tasks, events: events.filter((event) =>
      /task|attempt|workflow/.test(String(event.event))).slice(-15) }));
  t.check("the hold left neither spend nor an open reservation",
    !attempts.some((a) => a.state === "submitted") &&
      Number(budget.reserved) === 0 && Number(budget.settled) === 0,
    JSON.stringify({ budget, attempts }));
});

t.finish();
