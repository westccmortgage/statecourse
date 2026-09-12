export const WEEKLY_SCHEDULE_LABEL = 'Every Monday at 16:00 UTC';

export function environmentStatus() {
  const get = key => String(globalThis.Netlify?.env.get(key) ?? process.env[key] ?? '').trim();
  return {
    stripeMode: get('STRIPE_MODE') || 'not_configured',
    liveEnabled: get('STATECOURSE_LIVE_PAYMENTS_ENABLED') === 'true',
    stripeTestConnected: Boolean(get('STRIPE_SECRET_KEY_TEST') && get('STRIPE_WEBHOOK_SECRET_TEST')),
    cloudflareUploadConfigured: Boolean(get('CLOUDFLARE_ACCOUNT_ID') && get('CLOUDFLARE_STREAM_API_TOKEN')),
    cloudflareSigningConfigured: Boolean(get('CLOUDFLARE_STREAM_KEY_ID') && get('CLOUDFLARE_STREAM_SIGNING_JWK') && get('CLOUDFLARE_STREAM_CUSTOMER_CODE')),
    googleConnected: false,
    weeklySchedule: WEEKLY_SCHEDULE_LABEL,
    workspaceReadOnly: false,
    secretsExposed: false,
  };
}

export async function checkedEnvironmentStatus() {
  const result = environmentStatus();
  const get = key => String(globalThis.Netlify?.env.get(key) ?? process.env[key] ?? '').trim();
  try {
    const url = get('SUPABASE_URL'), key = get('SUPABASE_ANON_KEY');
    if (!url || !key) throw new Error('auth_configuration_missing');
    const res = await fetch(url.replace(/\/$/,'') + '/auth/v1/settings', {
      headers:{apikey:key},signal:AbortSignal.timeout(10000),redirect:'error',
    });
    if (!res.ok) throw new Error('auth_configuration_unavailable');
    const settings = await res.json();
    result.googleConfigured = settings.external?.google === true;
    result.authSettingsAvailable = true;
  } catch {
    result.googleConfigured = null;
    result.authSettingsAvailable = false;
  }
  return result;
}
