import { consoleVideosForDelivery } from './console-video-overlay.mjs';
import { nmlsCurriculumSummary } from './nmls-readiness.mjs';
import { NMLS_TRAINING_COURSE } from '../../../config/nmls-course-identity.mjs';

// Overlay only already-authorized source lessons; never assessments or remediation.
export async function withNmlsMedia(body, read=consoleVideosForDelivery) {
 if(body?.course?.id!==NMLS_TRAINING_COURSE.id||body.course.version!==NMLS_TRAINING_COURSE.version)return body;
 const lessons=body.readOnly?body.review?.modules?.flatMap(m=>m.lessons)||[]:body.phase==='source'?body.progress?.lessons||[]:[];
 if(!lessons.length)return body;
 const summary=nmlsCurriculumSummary();
 for(const unit of summary.modules||[]) {
  const visible=lessons.filter(l=>unit.lessons.some(m=>m.id===l.id));
  if(!visible.length)continue;
  const media=await read(body.course.id,unit.id);
  for(const lesson of visible){const video=media.get(lesson.id);if(video)lesson.videos=[video];}
 }
 return body;
}
