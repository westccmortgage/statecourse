import { dbRequest } from '../db.mjs';

// Which identifier BSI is given as `uid` for a student. One place, so the convention can
// be switched by configuration once BSI confirms it.
//
//   reviewer override   an identifier assigned to a reviewer account always wins
//   provider_prefixed   "StateCourse-001": a number assigned to the student once, kept forever
//   nmls_id             the student's own NMLS ID from their profile
//
// Returns null when the student has no identifier under the chosen convention.
export async function resolveBiosigUid(config, { studentId, nmlsId }, { request = dbRequest } = {}) {
  const override = config.reviewerUids[studentId];
  if (override) return override;
  if (config.uidMode === 'nmls_id') return nmlsId || null;
  if (config.uidMode !== 'provider_prefixed') return null;
  // Assign on first use; a second request for the same student changes nothing.
  await request('nmls_biosig_identifiers?on_conflict=student_id', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: { student_id: studentId } });
  const row = (await request(`nmls_biosig_identifiers?student_id=eq.${encodeURIComponent(studentId)}&select=sequence&limit=1`))?.[0];
  const sequence = Number(row?.sequence);
  if (!Number.isSafeInteger(sequence) || sequence < 1) return null;
  return `${config.uidPrefix}-${String(sequence).padStart(3, '0')}`;
}
