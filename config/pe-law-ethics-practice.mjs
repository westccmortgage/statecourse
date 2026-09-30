// Explicit PUBLIC, noncredit PE05/PE06 inputs only. Instructor keys and protected
// assessments are neither imported nor used to produce browser feedback.
import PE05 from './pe-public-practice/PE05.json' with { type: 'json' };
import PE06 from './pe-public-practice/PE06.json' with { type: 'json' };
import SOURCE_REGISTRY from './pe-public-practice/law-ethics-sources.json' with { type: 'json' };
import { normalizePublicPeBank } from './pe-application-practice.mjs';

export const LAW_ETHICS_TOPIC_QUIZZES = {
  'module-05': normalizePublicPeBank(PE05, 'PE05', SOURCE_REGISTRY.PE05),
  'module-06': normalizePublicPeBank(PE06, 'PE06', SOURCE_REGISTRY.PE06),
};
