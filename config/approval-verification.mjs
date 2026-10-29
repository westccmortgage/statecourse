/* How a member of the public verifies a StateCourse approval in the regulator's own
   records, jurisdiction by jurisdiction.
 *
 * This exists because of a specific obligation and a specific opportunity. California
 * Regulation 3004(b) requires advertising for an approved course to carry the
 * Department's course approval number, so there must be a surface that shows it and it
 * cannot be a footer. And the schools that compete here publish, at most, a sponsor
 * number: none of them walks the reader into the regulator's database and shows them
 * how to check it. Doing that is cheap, verifiable, and the one trust signal that
 * cannot be imitated by a provider whose record does not hold up.
 *
 * Every entry is written from the regulator's own site and carries the date it was
 * read. A jurisdiction with no entry gets the registry's regulator link and nothing
 * more — an invented lookup procedure would defeat the purpose of the page.
 */

export const VERIFICATION_PROCEDURES = Object.freeze({
  CA: Object.freeze({
    regulator: "California Department of Real Estate",
    lookupLabel: "DRE approved statutory and pre-license course search",
    lookupUrl: "https://secure.dre.ca.gov/publicasp/cestatutory.asp",
    reviewedOn: "2026-08-19",
    steps: Object.freeze([
      "Open the Department's public course search. No account or sign-in is required.",
      "Enter the course provider name, or the provider number if you have it.",
      "Select the delivery type — correspondence for an online, self-directed course.",
      "Select the statutory course you are checking: Real Estate Principles, Real Estate Practice, or Mortgage Loan Brokering and Lending.",
      "Confirm the provider is listed for that course. The record shows the provider name, number, address, and the courses the Department has approved."
    ]),
    note: "The Department's search returns approved providers by course. A provider that does not appear for a course is not approved to offer it, whatever any advertisement says."
  }),
  VA: Object.freeze({
    regulator: "Virginia Real Estate Board, Department of Professional and Occupational Regulation",
    lookupLabel: "DPOR License Lookup",
    lookupUrl: "https://www.dpor.virginia.gov/LicenseLookup",
    reviewedOn: "2026-08-19",
    steps: Object.freeze([
      "Open DPOR's License Lookup, the Department's own public record search.",
      "Search for StateCourse. Approval of an education provider and of each course is a Real Estate Board record held by DPOR.",
      "Check the date on the record as well as its existence."
    ]),
    /* Deliberately not written as a numbered path through the lookup's own screens: no
       StateCourse approval exists in Virginia to check one against, and describing a
       search we have not run against a real record would be the kind of confident
       detail this page exists to avoid. The exact path is published with the approval. */
    note: "Board approval of a course expires three years from the last day of the month in which it was granted (18VAC135-20-362 C), so a record must be current, not merely present."
  })
});

/* What StateCourse is allowed to say about itself today, drawn from the same record the
   DRE forms are generated from. Nothing here is a claim of approval; the point of the
   page is that the reader does not have to take our word for any of it. */
export const PROVIDER_FACTS = Object.freeze({
  legalName: "StateCourse LLC",
  formationState: "CA",
  /* Articles of Organization filed with and stamped by the California Secretary of State
     on 18 August 2026. This is the document RE 303 item 3 asks for — a document issued by
     the California Secretary of State — and it is now held in the submission sources.
     The file number is public record; nothing else about the entity is published here. */
  registrationStatus: "California domestic LLC, formed 18 August 2026",
  secretaryOfStateFileNumber: "B20260376786",
  secretaryOfStateFiledOn: "2026-08-18",
  principalOffice: "150 E Olive Avenue, Suite 112, Burbank, CA 91502",
  address: "150 E Olive Ave, Unit 112, Burbank, CA 91502",
  managementStructure: "Member-managed",
  agentForServiceOfProcess: "Anatoliy Kanevsky",
  principal: "Anatoliy Kanevsky, Founder",
  principalLicense: "California real estate broker licence 01385024",
  sponsorNumber: null,
  /* Owner-reported 2026-10-19 and reconfirmed 2026-10-29: the three California course
     applications are submitted and under DRE review. Receipt/date not yet recorded. */
  applicationStatus: "Applications for StateCourse's three California courses have been submitted to the California Department of Real Estate and are under review. No approval has been issued yet."
});

export function verificationFor(stateCode) {
  return VERIFICATION_PROCEDURES[stateCode] ?? null;
}
