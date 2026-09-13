import { createHash } from 'node:crypto';
import { dbRequest, rpc } from './db.mjs';
import { courseFor, courseStructure, fail, readRows } from './console-operations.mjs';
import { getCourseDelivery } from '../../../config/course-registry.mjs';
import { sliceLessonRange } from '../../../config/california-block-engine.mjs';

export function contentHash(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function baseFingerprint(courseId) {
  const structure = courseStructure(courseId);
  if (!structure.available) fail('course_renderer_not_registered',409);
  return contentHash(structure);
}
export function validateDraft(courseId, input) {
  const structure = courseStructure(courseId);
  if (!structure.available) fail('course_renderer_not_registered',409);
  if (structure.readOnly) fail('versioned_training_source_is_read_only',409);
  if (!input || !Array.isArray(input.overrides) || input.overrides.length > 300) fail('invalid_content_overrides');
  const fingerprint = baseFingerprint(courseId);
  if (input.baseFingerprint !== fingerprint) fail('course_structure_changed_reload_required',409);
  const seen = new Set();
  const overrides = input.overrides.map(item => {
    const unit = structure.units.find(u => u.id === item.deliveryId);
    const screen = unit?.blocks.flatMap(b => b.screens).find(s => s.id === item.screenId);
    if (!screen || !['instruction','review'].includes(screen.type)) fail('only_instruction_or_review_text_can_be_edited');
    const key = `${unit.id}:${screen.id}`;
    if (seen.has(key)) fail('duplicate_screen_override');
    seen.add(key);
    const title = String(item.title || '').trim();
    const bodyMarkdown = String(item.bodyMarkdown || '').trim();
    if (title.length < 3 || title.length > 200) fail('screen_title_required');
    if (bodyMarkdown.length < 20 || bodyMarkdown.length > 60000) fail('screen_text_must_be_20_to_60000_characters');
    return { deliveryId: unit.id, screenId: screen.id, title, bodyMarkdown };
  }).sort((a,b) => `${a.deliveryId}:${a.screenId}`.localeCompare(`${b.deliveryId}:${b.screenId}`));
  if (JSON.stringify(overrides).length > 500000) fail('course_draft_too_large',413);
  return { schemaVersion: 1, baseFingerprint: fingerprint, overrides };
}

export async function contentWorkspace(staff, courseId) {
  const course = await courseFor(staff,courseId);
  const structure = courseStructure(courseId);
  if (structure.readOnly) return { course, structure, baseFingerprint: structure.available ? baseFingerprint(courseId) : null,
    draft: null, reviews: [], releases: [], storageAvailable: false, readOnly: true };
  const filter = `course_id=eq.${encodeURIComponent(courseId)}`;
  const [draft,reviews,releases] = await Promise.all([
    readRows(`console_course_drafts?${filter}&select=*&limit=1`),
    readRows(`console_course_reviews?${filter}&select=*&order=reviewed_at.desc,id.desc&limit=1001`),
    readRows(`console_course_releases?${filter}&select=id,course_id,content_hash,published_by,note,published_at&order=published_at.desc&limit=1001`),
  ]);
  return { course,structure,baseFingerprint: structure.available ? baseFingerprint(courseId) : null,
    draft: draft.rows[0] || null,reviews:reviews.rows,releases:releases.rows,
    storageAvailable:draft.available && reviews.available && releases.available };
}

export async function screenText(staff,courseId,deliveryId,screenId) {
  await courseFor(staff,courseId);
  const delivery = getCourseDelivery(courseId,deliveryId);
  const screen = delivery?.blocks.flatMap(b=>b.screens).find(s=>s.id===screenId);
  if (!screen?.content) fail('screen_text_not_available',404);
  // The URL is taken only from the registered course, never from a browser parameter.
  if (!/^\/content\/[a-z0-9/_-]+\.md$/.test(delivery.contentPath)) fail('invalid_registered_content_path',500);
  const base = globalThis.Netlify?.env.get('STATECOURSE_BASE_URL');
  if (!base) fail('base_url_not_configured',503);
  const response = await fetch(new URL(delivery.contentPath,new URL(base).origin), {signal:AbortSignal.timeout(12000),redirect:'error'});
  if (!response.ok) fail('lesson_source_unavailable',503);
  const markdown=await response.text();
  if(markdown.length>1000000) fail('lesson_source_too_large',503);
  return { title:screen.title,bodyMarkdown:sliceLessonRange(markdown,screen.content,screen.id),type:screen.type };
}

export async function saveContent(staff,input) {
  await courseFor(staff,input.courseId);
  const payload = validateDraft(input.courseId,input.payload);
  if (!Number.isInteger(input.expectedRevision)||input.expectedRevision<0) fail('expected_revision_required');
  return rpc('console_save_draft',{p_course:input.courseId,p_expected:input.expectedRevision,p_payload:payload,p_hash:contentHash(payload),p_actor:staff.auth.student.id,p_role:staff.actorRole});
}
export async function reviewContent(staff,input) {
  await courseFor(staff,input.courseId);
  if (!['pass','fail'].includes(input.outcome)) fail('invalid_review_outcome');
  if (String(input.note||'').trim().length<10) fail('review_basis_required');
  const draft=(await dbRequest(`console_course_drafts?course_id=eq.${encodeURIComponent(input.courseId)}&select=*&limit=1`))?.[0];
  if (!draft || draft.content_hash!==input.contentHash) fail('draft_changed_reload_required',409);
  validateDraft(input.courseId,draft.payload);
  return rpc('console_review_draft',{p_course:input.courseId,p_hash:draft.content_hash,p_outcome:input.outcome,p_note:String(input.note).trim().slice(0,5000),p_actor:staff.auth.student.id});
}
export async function publishContent(staff,input) {
  await courseFor(staff,input.courseId);
  if (String(input.note||'').trim().length<10) fail('publication_reason_required');
  if(input.audience!=='new_enrollments') fail('publication_audience_required');
  const draft=(await dbRequest(`console_course_drafts?course_id=eq.${encodeURIComponent(input.courseId)}&select=*&limit=1`))?.[0];
  if (!draft || draft.content_hash!==input.contentHash) fail('draft_changed_reload_required',409);
  validateDraft(input.courseId,draft.payload);
  return rpc('console_publish_course',{p_course:input.courseId,p_hash:input.contentHash,p_actor:staff.auth.student.id,p_note:String(input.note).trim().slice(0,5000),p_role:staff.actorRole});
}

export function overlayText(blocks, payload, deliveryId) {
  const overrides=new Map((payload?.overrides||[]).filter(o=>o.deliveryId===deliveryId).map(o=>[o.screenId,o]));
  return blocks.map(block=>({...block,screens:block.screens.map(screen=> {
    const edit=overrides.get(screen.id);
    return edit && ['instruction','review'].includes(screen.type) ? {...screen,title:edit.title,bodyMarkdown:edit.bodyMarkdown} : screen;
  })}));
}

export async function contentForEnrollment(enrollment) {
  if (!enrollment.console_content_release_id) return null;
  const release=(await dbRequest(`console_course_releases?id=eq.${encodeURIComponent(enrollment.console_content_release_id)}&course_id=eq.${encodeURIComponent(enrollment.course_id)}&select=payload,content_hash&limit=1`))?.[0];
  // A pinned release must never quietly disappear or revert to unrelated static content.
  if (!release || contentHash(release.payload)!==release.content_hash) fail('course_content_release_unavailable',503);
  validateDraft(enrollment.course_id,release.payload);
  return release.payload;
}
