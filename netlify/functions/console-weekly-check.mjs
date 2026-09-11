import { dbRequest } from './_lib/db.mjs';
import { assessSnapshot, snapshot } from './_lib/console-operations.mjs';

export default async function weeklyCheck() {
  // This internal scheduled job has no public route and creates no staff binding.
  const staff={scopeStates:null,matching:[{actor_role:'administrator',scope_state:null}]};
  const get=key=>globalThis.Netlify?.env.get(key);
  const data=assessSnapshot(await snapshot(staff),{stripeTestConnected:Boolean(get('STRIPE_SECRET_KEY_TEST')&&get('STRIPE_WEBHOOK_SECRET_TEST')),googleConnected:false});
  const report={checkedAt:data.checkedAt,outcome:data.outcome,findings:data.findings,sources:Object.fromEntries(Object.entries(data.datasets).map(([key,value])=>[key,{available:value.available,truncated:value.truncated,rows:value.rows.length}]))};
  await dbRequest('console_health_runs',{method:'POST',prefer:'return=minimal',body:{trigger_kind:'weekly',outcome:data.outcome,report}});
}
export const config={schedule:'0 16 * * 1'};
