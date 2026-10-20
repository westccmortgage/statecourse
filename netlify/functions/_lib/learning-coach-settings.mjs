// Only coach configuration may come from the service-role-only ledger RPC.
// Provider credentials always remain in the deployment's existing environment.
export const coachSettingKeys = Object.freeze([
 'LEARNING_COACH_ENABLED', 'LEARNING_COACH_PROVIDER', 'LEARNING_COACH_MODEL',
 'LEARNING_COACH_ORIGIN', 'LEARNING_COACH_HASH_SECRET',
 'LEARNING_COACH_INPUT_USD_PER_MILLION', 'LEARNING_COACH_OUTPUT_USD_PER_MILLION',
 'LEARNING_COACH_DAILY_BUDGET_USD'
]);
export async function loadCoachEnvironment({env,store}) {
 // Preserve explicit deployment configuration, including the emergency off switch.
 if (env.LEARNING_COACH_ENABLED !== undefined) return env;
 const stored = await store('settings', {});
 if (!stored || typeof stored !== 'object' || Array.isArray(stored) ||
     Object.entries(stored).some(([key,value]) => !coachSettingKeys.includes(key) || typeof value !== 'string')) {
  throw Error('coach_unavailable');
 }
 return {...env, ...stored};
}
