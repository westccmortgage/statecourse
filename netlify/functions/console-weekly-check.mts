import { dbRequest } from './_lib/db.mjs';
import { assessSnapshot, snapshot } from './_lib/console-operations.mjs';
import { checkedEnvironmentStatus } from './_lib/console-environment.mjs';

export default async function weeklyCheck() {
  const staff = {scopeStates:null,matching:[{actor_role:'administrator',scope_state:null}]};
  const [current,environment] = await Promise.all([snapshot(staff),checkedEnvironmentStatus()]);
  const data = assessSnapshot(current,environment);
  const report = {
    checkedAt:data.checkedAt,outcome:data.outcome,findings:data.findings,
    sources:Object.fromEntries(Object.entries(data.datasets).map(([key,value]) =>
      [key,{available:value.available,truncated:value.truncated,rows:value.rows.length}])),
  };
  await dbRequest('console_health_runs',{
    method:'POST',prefer:'return=minimal',body:{trigger_kind:'weekly',outcome:data.outcome,report},
  });
}
export const config = {schedule:'0 16 * * 1'};
