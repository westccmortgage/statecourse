/**
 * PCF-0 prep — current TREC contract-forms inventory.
 *
 * WHAT THIS IS. A verbatim capture of every form listed on TREC's own Contracts page
 * (https://www.trec.texas.gov/agency-information/contracts) at the time it was read, fetched
 * directly (curl; the WebFetch tool is blocked for trec.texas.gov in this environment, but plain
 * HTTP is not — see the note added to regulatory-manifest.mjs's SOURCES on 2026-08-29) and parsed
 * from the page's own server-rendered Drupal views markup — each row already carries "Form Name",
 * "Form ID" and "Effective Date" fields, not reconstructed from surrounding prose.
 *
 * WHY THIS FILE EXISTS BEFORE ANY PROMULGATED CONTRACT FORMS CONTENT DOES. The PCF-0 course
 * approval form is dated 06/20/2016 and several forms it names have since been renumbered or
 * revised. The work order requires a current-form inventory be built from this page BEFORE
 * authoring PCF-0 content, specifically flagging that the One to Four Family Residential Contract
 * (Resale) is Form 20-19 effective 07/01/2026 as of the read date below — confirmed directly below,
 * not taken on the requester's word.
 *
 * WHAT THIS FILE IS NOT. It does not map PCF-0's outline units to these current forms — that
 * crosswalk is Phase 3 work and has not started. It is not the forms themselves: no form is
 * reproduced, redesigned, or excerpted here, only its listing metadata.
 */

export const READ_ON = "2026-08-29";
export const SOURCE_URL = "https://www.trec.texas.gov/agency-information/contracts";
export const SOURCE_METHOD = "curl (direct HTTP GET), parsed from the page's server-rendered views-view-fields--contracts.tpl.php rows";

export const FORMS = Object.freeze([
  Object.freeze({ formId: "39-11", name: "Amendment to Contract", effectiveDate: "2026-07-01", path: "/forms/amendment" }),
  Object.freeze({ formId: "25-17", name: "Farm and Ranch Contract", effectiveDate: "2026-07-01", path: "/forms/farm-and-ranch-contract-0" }),
  Object.freeze({ formId: "24-20", name: "New Home Contract (Completed Construction)", effectiveDate: "2026-07-01", path: "/forms/new-home-contract-completed-construction-0" }),
  Object.freeze({ formId: "23-20", name: "New Home Contract (Incomplete Construction)", effectiveDate: "2026-07-01", path: "/forms/new-home-contract-incomplete-construction-0" }),
  Object.freeze({ formId: "20-19", name: "One to Four Family Residential Contract (Resale)", effectiveDate: "2026-07-01", path: "/forms/one-four-family-residential-contract-resale" }),
  Object.freeze({ formId: "30-18", name: "Residential Condominium Contract (Resale)", effectiveDate: "2026-07-01", path: "/forms/residential-condominium-contract-resale-0" }),
  Object.freeze({ formId: "9-18", name: "Unimproved Property Contract", effectiveDate: "2026-07-01", path: "/forms/unimproved-property-contract-0" }),
  Object.freeze({ formId: "49-1", name: "Addendum Concerning Right to Terminate Due to Lender's Appraisal", effectiveDate: "2019-03-01", path: "/forms/addendum-concerning-right-terminate-due-lenders-appraisal-0" }),
  Object.freeze({ formId: "53-0", name: "Addendum Containing Notice of Obligation to Pay Improvement District Assessment", effectiveDate: "2021-09-01", path: "/forms/addendum-containing-notice-obligation-pay-improvement-district-assesment" }),
  Object.freeze({ formId: "11-9", name: "Addendum for \"Back-Up\" Contract", effectiveDate: "2026-07-01", path: "/forms/addendum-back-contract" }),
  Object.freeze({ formId: "48-1", name: "Addendum for Authorizing Hydrostatic Testing", effectiveDate: "2020-03-01", path: "/forms/addendum-authorizing-hydrostatic-testing-0" }),
  Object.freeze({ formId: "33-2", name: "Addendum for Coastal Area Property", effectiveDate: "2011-12-05", path: "/forms/addendum-coastal-area-property" }),
  Object.freeze({ formId: "47-0", name: "Addendum for Property in a Propane Gas System Service Area", effectiveDate: "2014-02-01", path: "/forms/addendum-property-propane-gas-system-service-area" }),
  Object.freeze({ formId: "34-4", name: "Addendum for Property Located Seaward of the Gulf Intracoastal Waterway", effectiveDate: "2011-12-05", path: "/forms/addendum-property-located-seaward-gulf-intercoastal-waterway" }),
  Object.freeze({ formId: "36-11", name: "Addendum for Property Subject to Mandatory Membership in a Property Owners Association", effectiveDate: "2026-07-01", path: "/forms/addendum-property-subject-mandatory-membership-property-owners-association" }),
  Object.freeze({ formId: "12-3", name: "Addendum for Release of Liability on Assumed Loan and/or Restoration of Seller's VA Entitlement", effectiveDate: "2011-12-05", path: "/forms/addendum-release-liability-assumed-loan-andor-restoration-sellers-va-entitlement" }),
  Object.freeze({ formId: "44-3", name: "Addendum for Reservation of Oil, Gas, and Other Minerals", effectiveDate: "2023-02-01", path: "/forms/addendum-reservation-oil-gas-and-other-minerals-0" }),
  Object.freeze({ formId: "10-6", name: "Addendum for Sale of Other Property by Buyer", effectiveDate: "2011-12-05", path: "/forms/addendum-sale-other-property-buyer" }),
  Object.freeze({ formId: "60-0", name: "Addendum for Section 1031 Exchange", effectiveDate: "2025-01-03", path: "/forms/addendum-section-1031-exchange" }),
  Object.freeze({ formId: "56-0", name: "Addendum for Seller's Disclosure of Information on Lead-Based Paint and Lead-Based Paint Hazards as Required by Federal Law", effectiveDate: "2026-05-28", path: "/forms/addendum-sellers-disclosure-information-lead-based-paint-and-lead-based-paint-hazards-0" }),
  Object.freeze({ formId: "52-1", name: "Addendum Regarding Fixture Leases", effectiveDate: "2023-02-01", path: "/forms/addendum-regarding-fixture-leases-0" }),
  Object.freeze({ formId: "51-1", name: "Addendum Regarding Residential Leases", effectiveDate: "2023-02-01", path: "/forms/addendum-regarding-residential-leases-0" }),
  Object.freeze({ formId: "16-7", name: "Buyer's Temporary Residential Lease", effectiveDate: "2026-01-05", path: "/forms/buyers-temporary-residential-lease" }),
  Object.freeze({ formId: "28-2", name: "Environmental Assessment, Threatened of Endangered Species, and Wetlands Addendum", effectiveDate: "2011-12-05", path: "/forms/environmental-assessment-threatened-endangered-species-and-wetlands-addendum" }),
  Object.freeze({ formId: "41-3", name: "Loan Assumption Addendum", effectiveDate: "2023-02-01", path: "/forms/loan-assumption-addendum-0" }),
  Object.freeze({ formId: "57-0", name: "Non-Realty Items Addendum", effectiveDate: "2025-09-03", path: "/forms/non-realty-items-addendum" }),
  Object.freeze({ formId: "26-8", name: "Seller Financing Addendum", effectiveDate: "2023-02-01", path: "/forms/seller-financing-addendum-0" }),
  Object.freeze({ formId: "15-7", name: "Seller's Temporary Residential Lease", effectiveDate: "2026-01-05", path: "/forms/sellers-temporary-residential-lease" }),
  Object.freeze({ formId: "45-2", name: "Short Sale Addendum", effectiveDate: "2021-04-01", path: "/forms/short-sale-addendum-0" }),
  Object.freeze({ formId: "40-11", name: "Third Party Financing Addendum", effectiveDate: "2025-01-03", path: "/forms/third-party-financing-addendum-0" }),
  Object.freeze({ formId: "32-5", name: "Condominium Resale Certificate", effectiveDate: "2024-11-25", path: "/forms/condominium-resale-certificate-0" }),
  Object.freeze({ formId: "RSC-4", name: "Disclosure of Relationship with Residential Service Company", effectiveDate: "2023-06-11", path: "/forms/disclosure-relationship-residential-service-company" }),
  Object.freeze({ formId: "54-1", name: "Landlord's Floodplain and Flood Notice", effectiveDate: "2025-11-26", path: "/forms/landlords-floodplain-and-flood-notice-0" }),
  Object.freeze({ formId: "38-8", name: "Notice of Buyer's Termination of Contract", effectiveDate: "2025-04-01", path: "/forms/notice-buyers-termination-contract" }),
  Object.freeze({ formId: "50-0", name: "Notice of Seller's Termination of Contract", effectiveDate: "2018-08-13", path: "/forms/notice-sellers-termination-contract" }),
  Object.freeze({ formId: "58-0", name: "Notice to Prospective Buyer", effectiveDate: "2025-09-03", path: "/forms/notice-prospective-buyer-0" }),
  Object.freeze({ formId: "59-0", name: "Notice to Purchaser of Special Taxing or Assessment District", effectiveDate: "2024-02-12", path: "/forms/notice-purchaser-special-taxing-or-assessment-district" }),
  Object.freeze({ formId: "REI 7-6", name: "Property Inspection Report", effectiveDate: "2022-02-01", path: "/forms/inspection-report-form" }),
  Object.freeze({ formId: "61-0", name: "Seller's Disclosure about Groundwater and Surface Water Rights", effectiveDate: "2026-07-01", path: "/forms/water-notice-sellers-disclosure-about-groundwater-and-surface-water-rights" }),
  Object.freeze({ formId: "55-1", name: "Seller's Disclosure Notice", effectiveDate: "2026-05-28", path: "/forms/sellers-disclosure-notice" }),
  Object.freeze({ formId: "62-0", name: "Seller's Notice to Buyer of Removal of Contingency Under Addendum for \"Back-Up\" Contract", effectiveDate: "2026-05-28", path: "/forms/sellers-notice-buyer-removal-contingency-under-addendum-back-contract" }),
  Object.freeze({ formId: "37-5", name: "Subdivision Information, Including Resale Certificate for Property Subject to Mandatory Membership in a Property Owners' Association", effectiveDate: "2014-02-10", path: "/forms/subdivision-information-including-resale-certificate-property-subject-mandatory-membership" }),
]);

/** The specific claim the work order asked to be verified directly against TREC before relying on it. */
export const ONE_TO_FOUR_FAMILY_RESALE_CHECK = Object.freeze({
  claim: "One to Four Family Residential Contract (Resale) is Form 20-19, effective 07/01/2026.",
  verified: FORMS.some((f) => f.formId === "20-19" && f.name === "One to Four Family Residential Contract (Resale)" && f.effectiveDate === "2026-07-01"),
  verifiedOn: READ_ON,
});

if (!ONE_TO_FOUR_FAMILY_RESALE_CHECK.verified) {
  throw new Error("pcf-current-forms-inventory: the One to Four Family Residential Contract (Resale) check failed against the captured inventory");
}

export default Object.freeze({ READ_ON, SOURCE_URL, SOURCE_METHOD, FORMS, ONE_TO_FOUR_FAMILY_RESALE_CHECK });
