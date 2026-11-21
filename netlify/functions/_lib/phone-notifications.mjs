import { createHmac, timingSafeEqual } from 'node:crypto';

export const SCHOOL_AGENT = 'agent_1901m7zkvs9vezhsmnwyngjyew37';
export const SCHOOL_NUMBER = '+17753736657';
export const PHONE_FORM = 'statecourse-phone-calls';
export const PHONE_FORM_URL = 'https://statecourse.com/phone-notification-form/';
export const PHONE_RECIPIENT = 'info@statecourse.com';
export const SCHOOL_MESSAGE_ID = 'aitem_7701m7zm1m6dedmtk070hh26mcqx';
const MAX_BYTES = 1_048_576;
const ID = /^[a-zA-Z0-9_-]{1,128}$/;
const clean = (value, max = 8000) => typeof value === 'string' ? value.replaceAll('\0', '').slice(0, max) : '';
const reply = (status, result) => Response.json({ result }, { status, headers: { 'cache-control': 'no-store' } });

export function verifiedSignature(body, header, secret, now) {
  if (!secret || typeof header !== 'string') return false;
  const parts = header.split(',').map(part => part.trim().split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  if (!/^\d{10,11}$/.test(timestamp || '') || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest();
  return parts.some(([key, value]) => key === 'v0' && /^[a-f0-9]{64}$/i.test(value || '') && timingSafeEqual(expected, Buffer.from(value, 'hex')));
}

export function schoolCallFields(event) {
  if (event?.type !== 'post_call_transcription') return null;
  const data = event.data;
  if (data?.agent_id !== SCHOOL_AGENT || !ID.test(data?.conversation_id || '')) return null;
  const phone = data.metadata?.phone_call;
  // Preview chats for this same agent are useful for delivery tests. When a phone
  // call is present, only this school's inbound line may produce a notification.
  if (phone && (phone.direction !== 'inbound' || phone.agent_number !== SCHOOL_NUMBER)) return null;
  const summary = clean(data.analysis?.transcript_summary, 12000);
  const results = data.analysis?.data_collection_results;
  const messageResult = results?.statecourse_school_message || results?.[SCHOOL_MESSAGE_ID]
    || Object.values(results || {}).find(result => ['statecourse_school_message', SCHOOL_MESSAGE_ID].includes(result?.data_collection_id))
    || (Array.isArray(data.analysis?.data_collection_results_list) ? data.analysis.data_collection_results_list : [])
      .find(result => ['statecourse_school_message', SCHOOL_MESSAGE_ID].includes(result?.data_collection_id));
  const message = clean(messageResult?.value, 16000);
  const transcript = (Array.isArray(data.transcript) ? data.transcript : [])
    .filter(turn => ['agent', 'user'].includes(turn?.role) && typeof turn.message === 'string')
    .map(turn => `${turn.role === 'user' ? 'Caller' : 'StateCourse'}: ${clean(turn.message, 12000)}`)
    .join('\n\n').slice(0, 80000);
  const started = Number(data.metadata?.start_time_unix_secs);
  const duration = Number(data.metadata?.call_duration_secs);
  return {
    'form-name': PHONE_FORM,
    'bot-field': '',
    name: phone ? 'StateCourse inbound phone inquiry' : 'StateCourse assistant delivery check',
    message: [summary, message].filter(Boolean).join('\n\n') || 'No spoken message was captured. Review the conversation in ElevenLabs.',
    caller_number: clean(phone?.external_number, 40) || 'Not provided (web conversation)',
    assistant_number: SCHOOL_NUMBER,
    started_at: Number.isFinite(started) && started > 0 && started < 1e11 ? new Date(started * 1000).toISOString() : 'Not provided',
    duration_seconds: Number.isFinite(duration) && duration >= 0 ? String(Math.round(duration)) : 'Not provided',
    conversation_id: data.conversation_id,
    conversation_link: `https://elevenlabs.io/app/agents/agents/${SCHOOL_AGENT}/history/${data.conversation_id}/details`,
    transcript,
  };
}

export function createPhoneNotificationHandler({ getSecret, getStore, submit, now = Date.now }) {
  return async request => {
    if (request.method !== 'POST') return reply(405, 'method_not_allowed');
    const secret = getSecret();
    if (!secret) return reply(503, 'phone_notifications_unconfigured');
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, 'json_required');
    if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply(413, 'payload_too_large');
    let raw;
    try { raw = await request.text(); } catch { return reply(400, 'invalid_body'); }
    if (Buffer.byteLength(raw) > MAX_BYTES) return reply(413, 'payload_too_large');
    if (!verifiedSignature(raw, request.headers.get('elevenlabs-signature'), secret, now())) return reply(401, 'invalid_signature');
    let event;
    try { event = JSON.parse(raw); } catch { return reply(400, 'invalid_json'); }
    const fields = schoolCallFields(event);
    if (!fields) return reply(200, 'outside_school_scope');
    try {
      const store = getStore();
      const key = `accepted/${fields.conversation_id}`;
      if (await store.get(key)) return reply(200, 'already_accepted');
      const response = await submit(fields);
      if (!response.ok) return reply(502, 'notification_not_accepted');
      // Only a delivery receipt is cached, never the transcript or contacts.
      // This suppresses sequential webhook retries. A simultaneous delivery or
      // an interrupted acknowledgement can still create a duplicate email.
      await store.setJSON(key, { acceptedAt: now() }, { onlyIfNew: true });
      return reply(200, 'accepted_for_school_email');
    } catch {
      // No body, phone number, email, signature or secret is written to logs.
      return reply(503, 'notification_temporarily_unavailable');
    }
  };
}
