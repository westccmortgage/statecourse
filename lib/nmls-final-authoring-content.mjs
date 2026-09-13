import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { defineNmlsDraftFinal, inspectNmlsFinalCandidates } from './nmls-final-assessment.mjs';

// PRIVATE AUTHORING ONLY. Intentionally not imported by any route or build and
// not added to Netlify included_files. Never send this module or its banks to a
// learner. Content pins are integrity checks, not human approval or authority.
const fail = () => { throw new Error('nmls_final_authoring_content_invalid'); };
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const sources = [
  ['federal-revised-candidates.json', '19fb9534dabfa994e6f6878aef9a118f06b4371e97962392c025c27618256360', 'federal', 24],
  ['ethics-revised-candidates.json', '6e9c2fbc31a89484731325369e755116c8209a11b5c4ac67da1ce920d8c869a7', 'ethics', 16],
  ['nontraditional-revised-candidates.json', 'a45ddd18165e1a903a5dd4daf3f972b783201ebc823f89dde686126c17d05cd8', 'nontraditional', 16],
  ['general-candidates.json', '051aaea36b6d775d478f7f39f384e689372c20efdd22de42e670d75373d99f80', 'general', 8],
];
const ids = (prefix, numbers) => numbers.map(number => `N26-FIN-${prefix}${String(number).padStart(2, '0')}`);
const firstEight = [1, 2, 3, 4, 5, 6, 7, 8];
const shared = {
  F01: ids('F', firstEight),
  F03: ids('F', [17, 18, 20, 21, 23, 24]),
  E01: ids('E', [1, 2, 3, 4, 5, 6]),
  N01: ids('N', [1, 3, 4, 5, 6, 7]),
};
export const NMLS_FINAL_AUTHORING_BLUEPRINTS = freeze({
  'nmls-2026-national-core-private-review-v3': {
    id: 'nmls-2026-national-core-private-final-v1',
    contentDigest: 'fff356a81fdbc32712eee3981ed4de4776c737b5e21da51466305c5994b4176b',
    moduleQuotas: { F01: 4, F02: 4, F03: 3, E01: 3, E02: 4, N01: 3, N02: 4 },
    activeByModule: { ...shared, F02: ids('F', [9, 10, 11, 12, 13, 14, 15, 16]),
      E02: ids('E', [7, 8, 9, 10, 11, 12, 13, 14]), N02: ids('N', [9, 10, 11, 12, 13, 14, 15, 16]) },
  },
  'nmls-2026-national-comprehensive-private-review-v3': {
    id: 'nmls-2026-national-comprehensive-private-final-v1',
    contentDigest: 'aad5903b17526825091e1bb59b45ec179dc84fb5c4fa24d29c6dab8e93c4c7b9',
    moduleQuotas: { F01: 4, F02: 3, F03: 3, E01: 3, E02: 3, N01: 3, N02: 3, G01: 3 },
    activeByModule: { ...shared, F02: ids('F', [9, 11, 12, 13, 15, 16]),
      E02: ids('E', [7, 8, 9, 10, 12, 13]), N02: ids('N', [9, 10, 11, 12, 14, 16]),
      G01: ids('G', [1, 2, 3, 5, 6, 7]) },
  },
});
export const NMLS_FINAL_CANDIDATE_HOLDS = freeze({
  'N26-FIN-G04': 'Do not select: specific contractual safeguards and periodic vendor assessment are not expressly taught in G01-U04.',
  'N26-FIN-G08': 'Do not select: duplicates the resolved-condition counterfactual already taught in G01-U06.',
});
let candidates;
export function getNmlsFinalAuthoringCandidates() {
  if (!candidates) {
    const items = sources.flatMap(([file, hash, category, count]) => {
      const bytes = readFileSync(fileURLToPath(new URL(`../nmls/assessment/2026/${file}`, import.meta.url)));
      if (createHash('sha256').update(bytes).digest('hex') !== hash) fail();
      const parsed = JSON.parse(bytes);
      if (parsed.schema !== 'statecourse-nmls-final-authoring-v1' || parsed.year !== 2026 ||
          parsed.category !== category || parsed.items?.length !== count) fail();
      return parsed.items;
    });
    inspectNmlsFinalCandidates(getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'), items);
    candidates = freeze(items);
  }
  return candidates;
}
export function getNmlsDraftFinalDefinition(courseKey) {
  if (!Object.hasOwn(NMLS_FINAL_AUTHORING_BLUEPRINTS, courseKey)) fail();
  const blueprint = NMLS_FINAL_AUTHORING_BLUEPRINTS[courseKey];
  const course = getNmlsReviewCourse(courseKey);
  if (course.digest !== blueprint.contentDigest) fail();
  const candidates = getNmlsFinalAuthoringCandidates();
  const items = Object.entries(blueprint.activeByModule).flatMap(([moduleId, chosen]) => chosen.map(id => {
    const item = candidates.find(candidate => candidate.id === id);
    if (!item || item.moduleId !== moduleId || Object.hasOwn(NMLS_FINAL_CANDIDATE_HOLDS, id)) fail();
    return item;
  }));
  return defineNmlsDraftFinal(course, { id: blueprint.id, items, moduleQuotas: blueprint.moduleQuotas });
}
