import { createHash } from 'node:crypto';
import material from '../pe-public-practice/PE03-evidence-lab.json' with { type: 'json' };
// A separate PE activity definition; never an alias/configuration change to annual CE.
const identity = {
  id: 'national-pe03-oil-noncredit-v1', version: 1, educationType: 'prelicensure',
  delivery: 'private-cohort-trial', activityId: 'PE03-evidence-dialogue',
  title: 'PE03 · Evidence, peer review and reasoned revision',
  category: 'general_mortgage', minimumObservedMs: 30000, heartbeatMs: 10000,
  maxObservedIntervalMs: 20000, creditEligible: false, certificateEligible: false,
  bankingEligible: false, durationValidated: false, completeCourse: false,
  disclaimer: 'NONCREDIT development trial. The 30-second observation floor tests persistence only; it is not validated lesson duration, a 20-hour course, or NMLS approval.',
  initialPrompt: 'Using fictional E01–E04, separate borrower-reported claims from documented amounts. Identify missing evidence and write a specific next request. Do not infer that a missing page is a zero balance or make an approval promise.',
  peerPrompt: 'Reply to another learner’s initial submission. Identify one evidence-supported point and one missing item or assumption; explain the practical consequence and a useful next step. Your own reply cannot satisfy your incoming peer gate.',
  feedbackPrompt: 'Review the initial submission and its linked peer response. Give specific feedback on source/claim separation, missing evidence and the proposed next step. Ask for a reasoned revision; this is not an automated passing grade.',
  revisionPrompt: 'Preserve the original analysis. Respond to the named instructor feedback and peer observation, identify what changed and why, and use the E10 update without erasing unresolved evidence. Cite exhibit IDs and avoid an approval claim.',
};
const materials = material.exhibits.filter(x => ['E01','E02','E03','E04','E10'].includes(x.id));
export const PE03_DEFINITION = Object.freeze({ ...identity, contentHash: createHash('sha256').update(JSON.stringify({ identity, materials })).digest('hex') });
export function pe03Materials(stage) {
  return structuredClone(materials.filter(x => x.id !== 'E10' || ['revision','revised-noncredit','instructor-review'].includes(stage)));
}
