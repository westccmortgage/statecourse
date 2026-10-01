import { createHash } from 'node:crypto';
import units from './pe-course/units.json' with { type: 'json' };
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const PE_COURSE_UNITS = Object.freeze(units.map(unit => Object.freeze({
  ...unit, initialMinimumMs: (unit.minutes[0] + unit.minutes[1]) * 60000,
  plannedMs: unit.minutes.reduce((a,b) => a+b,0) * 60000,
  contentHash: hash(unit),
})));
export const PE_COURSE_DEFINITION = Object.freeze({
  id:'national-pe-oil-noncredit-v1', version:1, unitCount:25,
  contentHash:hash(PE_COURSE_UNITS), plannedMinutes:1000,
  minimumObservedMs:0, maxObservedIntervalMs:20000, heartbeatMs:10000,
  creditEligible:false, certificateEligible:false, bankingEligible:false,
  protectedFinalAvailable:false, durationValidated:false, completeCourse:false,
  disclaimer:'NONCREDIT teaching workbench. Planned minutes are unvalidated. No protected final, NMLS credit, certificate, banking or approval is enabled.',
});
if (PE_COURSE_UNITS.length !== 25 || PE_COURSE_UNITS.reduce((n,u)=>n+u.plannedMs,0) !== 60000000) throw new Error('pe_course_manifest_invalid');
