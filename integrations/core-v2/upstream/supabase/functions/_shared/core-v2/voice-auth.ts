export const VOICE_AUTH_VERSION = 'core-v2-voice-hmac-v1';
export const DEFAULT_REPLAY_WINDOW_SECONDS = 60;

export type VoiceServiceCredential = {
  keyId: string;
  secret: string;
  callerApp: string;
  tenantId: string;
};

export type VoiceAuthContext = Omit<VoiceServiceCredential, 'secret'>;
export type VoiceCredentialResolver = (keyId: string) => Promise<VoiceServiceCredential | null>;
export type VoiceReplayStore = { claim(keyId: string, nonce: string, timestamp: number): Promise<boolean> };

export type VoiceAuthResult =
  | { ok: true; context: VoiceAuthContext }
  | { ok: false; status: 401 | 503; code: string };

export async function verifyVoiceServiceRequest(options: {
  request: Request;
  rawBody: string;
  resolveCredential: VoiceCredentialResolver;
  replayStore: VoiceReplayStore;
  nowSeconds?: number;
  replayWindowSeconds?: number;
}): Promise<VoiceAuthResult> {
  const { request, rawBody } = options;
  const keyId = request.headers.get('x-core-voice-key-id') ?? '';
  const timestampText = request.headers.get('x-core-voice-timestamp') ?? '';
  const nonce = request.headers.get('x-core-voice-nonce') ?? '';
  const supplied = request.headers.get('x-core-voice-signature') ?? '';
  if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(keyId) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)
    || !/^\d{10}$/.test(timestampText) || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) {
    return { ok: false, status: 401, code: 'unauthorized' };
  }
  const timestamp = Number(timestampText);
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const window = options.replayWindowSeconds ?? DEFAULT_REPLAY_WINDOW_SECONDS;
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > window) {
    return { ok: false, status: 401, code: 'unauthorized' };
  }
  const credential = await options.resolveCredential(keyId);
  if (!credential || credential.keyId !== keyId || credential.secret.length < 32
    || !credential.callerApp || !credential.tenantId) {
    return { ok: false, status: credential ? 503 : 401, code: credential ? 'service_not_configured' : 'unauthorized' };
  }
  const expected = await voiceRequestSignature({
    secret: credential.secret,
    method: request.method,
    pathname: new URL(request.url).pathname,
    timestamp,
    nonce,
    rawBody,
  });
  if (!constantTimeAsciiEqual(supplied, expected)) return { ok: false, status: 401, code: 'unauthorized' };
  if (!await options.replayStore.claim(keyId, nonce, timestamp)) {
    return { ok: false, status: 401, code: 'unauthorized' };
  }
  return {
    ok: true,
    context: { keyId, callerApp: credential.callerApp, tenantId: credential.tenantId },
  };
}

export async function voiceRequestSignature(options: {
  secret: string;
  method: string;
  pathname: string;
  timestamp: number;
  nonce: string;
  rawBody: string;
}): Promise<string> {
  const bodyDigest = await digest(options.rawBody);
  const canonical = [
    VOICE_AUTH_VERSION,
    options.method.toUpperCase(),
    options.pathname,
    String(options.timestamp),
    options.nonce,
    bodyDigest,
  ].join('\n');
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(options.secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(canonical))));
}

async function digest(value: string): Promise<string> {
  return base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeAsciiEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}
