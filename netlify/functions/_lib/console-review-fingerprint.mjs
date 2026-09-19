import coverage from '../../../config/console-course-evidence.json' with { type: 'json' };
import { baseFingerprint,contentHash } from './console-content.mjs';
// Include authored lesson bytes, not just screen IDs. Enrollment release hash is
// pinned separately so later publication cannot silently inherit this signoff.
export function reviewFingerprint(courseId,releaseHash=null) {
 return contentHash({structure:baseFingerprint(courseId),curriculum:coverage.courses.find(c=>c.courseId===courseId)?.curriculumFiles||[],releaseHash});
}
