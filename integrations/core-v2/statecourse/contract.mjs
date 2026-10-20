import { createHash } from 'node:crypto';
export const COURSE_ID = 'ca-real-estate-principles-45';
export const VERSION = 'statecourse.readonly.1';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class IntegrationError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
export function requestInput(body) {
  if (!body || Object.getPrototypeOf(body) !== Object.prototype || Object.keys(body).some(k => !['courseId','enrollmentId'].includes(k))
      || body.courseId !== COURSE_ID || !UUID.test(body.enrollmentId ?? '')) throw new IntegrationError('invalid_scope');
  return { courseId: COURSE_ID, enrollmentId: body.enrollmentId.toLowerCase() };
}
export function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
