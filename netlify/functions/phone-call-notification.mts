import { getStore } from '@netlify/blobs';
import { createPhoneNotificationHandler, PHONE_FORM_URL } from './_lib/phone-notifications.mjs';

export const config = { path: '/api/phone/post-call' };

const handler = createPhoneNotificationHandler({
  getSecret: () => globalThis.Netlify?.env.get('STATECOURSE_ELEVENLABS_WEBHOOK_SECRET') || process.env.STATECOURSE_ELEVENLABS_WEBHOOK_SECRET,
  getStore: () => getStore({ name: 'statecourse-phone-notifications-production', consistency: 'strong' }),
  submit: fields => fetch(PHONE_FORM_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  }),
});

export default async (request: Request, context) => {
  if (context?.deploy?.context !== 'production') return new Response('Not Found', { status: 404 });
  return handler(request);
};
