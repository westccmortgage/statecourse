/** HB26-1426 section 87, effective August 12, 2026; reviewed November 5. */
export const COLORADO_RELATIONSHIP_POLICY = Object.freeze({
  effectiveOn: '2026-08-12',
  reviewedOn: '2026-11-05',
  defaultRelationship: null,
  writtenAgreementRequiredFor: Object.freeze(['transaction-broker', 'sellers-agent', 'buyers-agent']),
  conspicuousCompensationRequired: true,
  mustCompleteBeforeLicensedActivities: true,
  compensationOnlyDisclosureSufficient: false,
  authority: 'C.R.S. 12-10-403(2), amended by HB26-1426 section 87',
  sources: Object.freeze([
    'https://leg.colorado.gov/bills/hb26-1426',
    'https://content.govdelivery.com/accounts/CODORA/bulletins/424a45a'
  ])
});

export function validateColoradoRelationshipPolicy(policy) {
  const errors = [];
  if (policy.defaultRelationship !== null) errors.push('The repealed automatic relationship must not be restored.');
  for (const id of COLORADO_RELATIONSHIP_POLICY.writtenAgreementRequiredFor) {
    if (!policy.writtenAgreementRequiredFor?.includes(id)) errors.push(`${id} requires a written agreement.`);
  }
  if (policy.conspicuousCompensationRequired !== true) errors.push('Conspicuous compensation amount or rate is required.');
  if (policy.mustCompleteBeforeLicensedActivities !== true) errors.push('The writing must precede the specified licensed activities.');
  if (policy.compensationOnlyDisclosureSufficient !== false) errors.push('The DRE advisory rejects a compensation-only disclosure as sufficient.');
  return errors;
}
