import { NMLS_TRAINING_COURSE } from '../nmls-course-identity.mjs';
import { NMLS_CREDIT_REVIEW } from './credit-review.mjs';

// BioSig-ID configuration for the credit version of the national mortgage course.
//
// Every value BSI issues is read from the environment and from nowhere else. Nothing in
// this file, or anywhere in the repository, is a real identifier, pass phrase, salt or
// vector. With any value missing the integration reports itself unavailable and no
// request is ever built.
//
//   BIOSIG_SYSTEM_ID      sid          from BSI
//   BIOSIG_CUSTOMER_ID    cid          from BSI
//   BIOSIG_SHARED_CODE    sc           from BSI
//   BIOSIG_PASS           AES pass     from BSI
//   BIOSIG_SALT           AES salt     from BSI
//   BIOSIG_VECTOR         AES IV, 16 characters, from BSI
//   BIOSIG_PARTNER        path segment in the interface address, from BSI
//   BIOSIG_KEY_SIZE       128 unless BSI says otherwise
//   BIOSIG_ENVIRONMENT    "sandbox" (default) or "production"
//   BIOSIG_REVIEWER_UIDS  optional "student-uuid=uid,student-uuid=uid" for reviewer accounts
export const BIOSIG_REQUIRED = Object.freeze(['BIOSIG_SYSTEM_ID', 'BIOSIG_CUSTOMER_ID', 'BIOSIG_SHARED_CODE', 'BIOSIG_PASS', 'BIOSIG_SALT', 'BIOSIG_VECTOR', 'BIOSIG_PARTNER']);

// Interface hosts as written in BSI's sample configuration. Confirm both with BSI.
const HOSTS = Object.freeze({ sandbox: 'sandbox.verifyexpress.com', production: 'verifyexpress.com' });

// Fields BSI's generic helper does not send but an NMLS course must (BSI 2019 Interface
// Specification). `d2` is the NMLS course number once one is assigned; until then the
// application number, which BSI has been asked to confirm.
export function nmlsBiosigCourseFields(now = new Date()) {
  return Object.freeze({
    ls: NMLS_TRAINING_COURSE.providerId,
    as: 'CE-course',
    d1: String(now.getUTCFullYear()),
    d2: NMLS_TRAINING_COURSE.courseApprovalId || NMLS_CREDIT_REVIEW.applicationId,
    d4: NMLS_CREDIT_REVIEW.title,
    d5: '8',
  });
}

const clean = value => String(value ?? '').trim();
const placeholder = value => /\[(?:FROM|PROVIDED)[ -]/i.test(value);

// Returns { ready:true, ...values } or { ready:false, missing:[names] }. Names only: a
// value is never echoed, logged or returned to a caller.
export function biosigConfig(env = process.env) {
  const missing = BIOSIG_REQUIRED.filter(name => !clean(env[name]) || placeholder(clean(env[name])));
  const vector = clean(env.BIOSIG_VECTOR), partner = clean(env.BIOSIG_PARTNER);
  const keySize = clean(env.BIOSIG_KEY_SIZE) ? Number(clean(env.BIOSIG_KEY_SIZE)) : 128;
  const environment = clean(env.BIOSIG_ENVIRONMENT) || 'sandbox';
  const invalid = [];
  // The helper derives a 16-byte key whatever the key size says, so only 128 can work.
  if (keySize !== 128) invalid.push('BIOSIG_KEY_SIZE');
  if (vector && Buffer.from(vector, 'latin1').length !== 16) invalid.push('BIOSIG_VECTOR');
  if (partner && !/^[A-Za-z0-9._-]+$/.test(partner)) invalid.push('BIOSIG_PARTNER');
  if (!Object.hasOwn(HOSTS, environment)) invalid.push('BIOSIG_ENVIRONMENT');
  if (missing.length || invalid.length) return Object.freeze({ ready: false, missing: Object.freeze([...new Set([...missing, ...invalid])]) });
  return Object.freeze({
    ready: true, environment, keySize, vector,
    pass: clean(env.BIOSIG_PASS), salt: clean(env.BIOSIG_SALT),
    sharedCode: clean(env.BIOSIG_SHARED_CODE), systemId: clean(env.BIOSIG_SYSTEM_ID), customerId: clean(env.BIOSIG_CUSTOMER_ID),
    locale: 'en_US', newWindow: false,
    baseUrl: `https://${HOSTS[environment]}/interface/standard/${partner}/`,
    reviewerUids: Object.freeze(Object.fromEntries(clean(env.BIOSIG_REVIEWER_UIDS).split(',').map(pair => pair.split('=').map(clean))
      .filter(([id, uid]) => /^[a-f0-9-]{36}$/i.test(id) && /^[A-Za-z0-9._-]{1,40}$/.test(uid || '')).map(([id, uid]) => [id.toLowerCase(), uid]))),
  });
}
