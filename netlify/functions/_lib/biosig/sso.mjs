import BioSigInterfaceHelper from './interface-helper.mjs';
import { nmlsBiosigCourseFields } from '../../../../config/nmls/biosig.mjs';

// The BioSig-ID standard interface, following BSI's NodeJS sample step for step:
// argument string -> AES (Base64 out) -> URL-encode -> SSOInbound.aspx?args=.
// There is no Base64 step before encryption, whatever the 2019 PDF says.

// Our own passthrough argument. BSI returns prefixed custom arguments unchanged, which is
// how a callback is tied to the one check that is waiting for it.
export const CHALLENGE_ARGUMENT = 'statecourse_ref';

const fail = (message, statusCode = 503) => { throw Object.assign(new Error(message), { statusCode }); };

// The argument string is "key=value&key=value" with no escaping, so a value containing
// "&" or "=" would silently add or change a field. Such characters are removed.
const field = value => String(value ?? '').replace(/[&=\r\n]/g, ' ').replace(/\s+/g, ' ').trim();

export const biosigHelper = config => new BioSigInterfaceHelper(config.pass, config.salt);

// Generic fields from BSI's helper, then the NMLS fields, then our reference.
export function buildNmlsArgumentString(config, { email, firstName, lastName, uid, d3, challengeId }, now = new Date()) {
  if (!field(uid)) fail('nmls_id_required', 409);
  const course = nmlsBiosigCourseFields(now);
  const base = biosigHelper(config).generateArgumentString(config.sharedCode, config.systemId, config.customerId, config.locale, config.newWindow,
    field(email), field(firstName), field(lastName), field(uid), now.toISOString());
  return `${base}&ls=${field(course.ls)}&as=${field(course.as)}&d1=${field(course.d1)}&d2=${field(course.d2)}&d3=${field(d3)}&d4=${field(course.d4)}&d5=${field(course.d5)}&${CHALLENGE_ARGUMENT}=${field(challengeId)}`;
}

export function buildInboundUrl(config, argumentString) {
  const encrypted = biosigHelper(config).encrypt(argumentString, config.vector, config.keySize);
  return `${config.baseUrl}SSOInbound.aspx?args=${encodeURIComponent(encrypted)}`;
}

const entities = text => text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (_, name) => {
  const known = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[name.toLowerCase()];
  if (known) return known;
  const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
});

// SSO_RESPONSE carries four simple elements. They are read directly rather than through
// an XML library; BSI's sample uses fast-xml-parser for the same four values.
export function parseSsoResponseXml(xml) {
  const read = name => {
    const found = String(xml ?? '').match(new RegExp(`<(?:\\w+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${name}\\s*>`, 'i'));
    if (!found) return '';
    const cdata = found[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
    return (cdata ? cdata[1] : entities(found[1])).trim();
  };
  return { status: read('STATUS'), code: read('CODE'), message: read('MESSAGE'), redirect: read('REDIRECT') };
}

const xmlText = value => String(value ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

// The acknowledgement we return to BSI's callback, in the shape of BSI's sample.
export function buildSsoResponseXml(status, code, message, redirectUrl) {
  return `<?xml version="1.0" encoding="utf-8"?>\n<SSO_RESPONSE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n\t<STATUS>${xmlText(status)}</STATUS>\n\t<CODE>${xmlText(code)}</CODE>\n\t<MESSAGE>${xmlText(message)}</MESSAGE>\n\t<REDIRECT>${xmlText(redirectUrl)}</REDIRECT>\n</SSO_RESPONSE>`;
}

export function parseArgumentString(value) {
  const keyed = Object.create(null);
  for (const pair of String(value).split('&').filter(Boolean)) { const [key, ...rest] = pair.split('='); keyed[key] = rest.join('='); }
  return keyed;
}

// A URL-decoded Base64 value may have had "+" turned into spaces. Restore them first.
export const normalizeEncryptedArgs = value => value ? String(value).replace(/ /g, '+') : '';

// Decrypts a callback. Returns the keyed arguments, or null when the value is absent or
// was not produced with our key (wrong key, truncated or forged).
export function decryptCallbackArgs(config, value) {
  const encrypted = normalizeEncryptedArgs(value);
  if (!encrypted || encrypted.length > 8192 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encrypted)) return null;
  try { return parseArgumentString(biosigHelper(config).decrypt(encrypted, config.vector, config.keySize).toString('utf8')); }
  catch { return null; }
}

// BSI's single access signal.
export const validationSucceeded = keyed => String(keyed?.vs || '').toLowerCase() === 'true';

// Step 1 of the flow: ask BSI where to send the student. Returns the draw-pad address.
export async function requestBiosigRedirect(config, argumentString, { fetcher = globalThis.fetch, timeoutMs = 15000 } = {}) {
  let response, body;
  try {
    response = await fetcher(buildInboundUrl(config, argumentString), { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(timeoutMs) });
    body = await response.text();
  } catch { fail('biosig_unreachable'); }
  if (!response.ok) fail('biosig_http_error');
  const sso = parseSsoResponseXml(body);
  let target = null;
  try { target = new URL(sso.redirect); } catch { /* handled below */ }
  // Same test as BSI's sample (code 100 and a redirect), plus: the student is only ever
  // sent to an https address.
  if (sso.code !== '100' || !target || target.protocol !== 'https:') fail(`biosig_refused:${/^\d{1,4}$/.test(sso.code) ? sso.code : 'unreadable'}`, 502);
  return target.href;
}
