import { dbRequest } from '../db.mjs';

// Which identifier BSI is given as `uid`. Confirmed by BSI's analyst on 2026-11-20.
//
//   reviewer override  an identifier assigned to a specific account always wins
//   real licensee      their own NMLS ID
//   test account       a provider-marked identifier, never a number that could be a real
//                      person's NMLS ID: "StateCourse-001" or "1405133000000001"
//
// A test account is never sent under its NMLS ID field, even if one was typed into the
// profile: a reviewer who enters a real-looking number must not take over that person's
// BioSig-ID profile. Returns null when there is no identifier to send.
export async function resolveBiosigUid(config, { studentId, nmlsId, testAccount }, { request = dbRequest } = {}) {
  const override = config.reviewerUids[studentId];
  if (override) return override;
  if (!testAccount) return /^[0-9]{1,12}$/.test(nmlsId || '') ? nmlsId : null;
  // Assign a number on first use; a second request for the same student changes nothing.
  await request('nmls_biosig_identifiers?on_conflict=student_id', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: { student_id: studentId } });
  const row = (await request(`nmls_biosig_identifiers?student_id=eq.${encodeURIComponent(studentId)}&select=sequence&limit=1`))?.[0];
  const sequence = Number(row?.sequence);
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 999999999) return null;
  return config.testUidFormat === 'provider_numeric' ? `${config.providerId}${String(sequence).padStart(9, '0')}`
    : `${config.uidPrefix}-${String(sequence).padStart(3, '0')}`;
}
