/**
 * National pricing — two products per state, not one national SKU.
 *
 * The decision this file encodes: a price is set per state, from that state's required
 * hours, the competitive intensity of its market, and what students there already pay.
 * A single national price would be wrong in both directions at once — Texas at 180 hours
 * and Virginia at 60 hours are not the same product, and pricing Arizona like California
 * would leave money on the table while making the product look cheap in a market where
 * the incumbent charges $549.
 *
 * Two tiers per state:
 *   requiredEducation  every course the state requires for the licence
 *   completePath       the above, plus exam prep and the licensing/application navigator
 *
 * Amounts are in CENTS, because that is what Stripe takes and what config/course-catalog.mjs
 * already uses. Storing dollars here and converting somewhere else is how a price ends up
 * off by a factor of a hundred.
 *
 * NOTHING HERE IS SELLABLE. A price is a commercial fact; selling a regulated course also
 * requires that state's regulator to have approved it. The two are kept apart deliberately —
 * see evaluateCheckoutEligibility in config/course-catalog.mjs.
 */

/* Build status, so a price cannot be mistaken for a product that exists.
     built       curriculum written, courses in the catalogue
     researched  rules read from primary sources, curriculum not written
     unresearched  neither — the hours below come from market research, not from the statute */
export const BUILD_STATUS = Object.freeze({
  BUILT: "built",
  RESEARCHED: "researched",
  UNRESEARCHED: "unresearched"
});

const state = (code, name, hours, edu, complete, status, notes = {}) => Object.freeze({
  code,
  name,
  requiredHours: hours,
  requiredEducation: Object.freeze({ sku: `SC-${code}-EDU`, cents: edu * 100, usd: edu }),
  completePath: Object.freeze({ sku: `SC-${code}-COMPLETE`, cents: complete * 100, usd: complete }),
  buildStatus: status,
  ...notes
});

export const STATE_PRICING = Object.freeze([
  /* Tier 1 — lower-hour states, 40–65 hours */
  state("AK", "Alaska", 40, 299, 399, BUILD_STATUS.BUILT, {
    marketRange: "$385–$395",
    composition: "One 40-hour salesperson prelicense course, delivered as correspondence under 12 AAC 64.430",
    /* Priced well above Michigan at the same hour count: a small market with few providers,
       where approved education sits near $390. Hours alone would price this wrong. */
    note: "Small market, few providers — priced on market value rather than on hours"
  }),
  state("MI", "Michigan", 40, 199, 299, BUILD_STATUS.BUILT, {
    marketRange: "$135–$499",
    composition: "One 40-hour salesperson prelicensure course, including the 4 hours of civil rights law and equal opportunity in housing MCL 339.2504 requires",
    note: "Large, competitive market with a wide spread — priced in the middle of it"
  }),
  state("FL", "Florida", 63, 149, 249, BUILD_STATUS.UNRESEARCHED, {
    hoursSource: "market research only; Florida rules have not been read from primary sources",
    marketRange: "$99–$448"
  }),
  state("VA", "Virginia", 60, 199, 299, BUILD_STATUS.BUILT, { marketRange: "$239–$519" }),
  state("ME", "Maine", 55, 299, 399, BUILD_STATUS.BUILT, {
    marketRange: "$349–$629",
    /* Priced above Virginia despite fewer hours: a small market with few providers, where
       approved education runs $405–$480. Hours alone would price this wrong. */
    note: "Small market, few providers — priced on market value rather than on hours"
  }),
  state("VT", "Vermont", 40, 299, 399, BUILD_STATUS.RESEARCHED, {
    marketRange: "$309–$775",
    composition: "One 40-hour Commission-approved salesperson course",
    /* The smallest market screened. Priced with Alaska rather than with Michigan, for the
       same reason: at 40 hours the hour count says nothing about what the market pays. */
    note: "Small market, few providers — priced on market value rather than on hours"
  }),
  state("NH", "New Hampshire", 40, 249, 349, BUILD_STATUS.RESEARCHED, {
    marketRange: "$250–$500",
    composition: "One 40-hour accredited pre-licensing course, of which a minimum of 32 hours must be classroom or real-time live-class attendance",
    note: "Priced mid-market; the delivery cap is a build constraint, not a pricing one"
  }),
  state("MA", "Massachusetts", 40, 249, 349, BUILD_STATUS.RESEARCHED, {
    marketRange: "$285–$750",
    composition: "One 40-hour board-approved salesperson course",
    note: "Dense market with in-person schools at the top of the range — priced in the middle"
  }),
  state("WY", "Wyoming", 54, 299, 399, BUILD_STATUS.RESEARCHED, {
    marketRange: "not published — no approved provider lists a price publicly",
    composition: "Salesperson Course I of 30 hours and Salesperson Course II of 24 hours, against a curriculum the Commission publishes annually",
    /* Priced with Maine, the nearest comparable: a small market at a similar hour count where
       the approved providers do not compete on advertised price. */
    note: "Small market, no published price to anchor to — priced by comparison with Maine"
  }),
  state("KS", "Kansas", 60, 299, 399, BUILD_STATUS.RESEARCHED, {
    marketRange: "$385 typical, sold as $245 plus $170",
    composition: "A 30-hour principles of real estate course and a 30-hour Kansas practice course, separately approved",
    note: "The market prices the two courses separately and discounts the pair; the bundle grants both"
  }),
  state("MS", "Mississippi", 60, 199, 299, BUILD_STATUS.RESEARCHED, {
    marketRange: "$149–$595",
    composition: "One 60-hour salesperson pre-license course",
    note: "Wide spread with a low floor — priced with Virginia at the same hour count"
  }),
  /* Tier 2 — mid-hour states, 66–100 hours */
  state("WI", "Wisconsin", 72, 249, 349, BUILD_STATUS.BUILT, {
    marketRange: "$279–$679",
    composition: "One 72-hour salesperson pre-license course covering the nineteen topics REEB 25.033 lists"
  }),
  state("MO", "Missouri", 72, 249, 349, BUILD_STATUS.BUILT, {
    marketRange: "$298–$582",
    composition: "48-hour pre-exam course plus 24-hour practice course"
  }),
  state("OK", "Oklahoma", 90, 299, 399, BUILD_STATUS.BUILT, { marketRange: "$299–$829" }),
  state("WA", "Washington", 90, 299, 399, BUILD_STATUS.BUILT, {
    marketRange: "$379–$785",
    composition: "Real Estate Fundamentals (60 clock hours, including the three-hour fair housing and consumer protection block RCW 18.85.101(1)(c) requires) plus Real Estate Practices (30 clock hours) — the two courses the statute names. A Washington clock hour is 50 minutes of actual instruction"
  }),
  state("PA", "Pennsylvania", 75, 299, 399, BUILD_STATUS.BUILT, {
    marketRange: "$252–$685",
    composition: "Real Estate Fundamentals (30 hours / 2 credits) plus Real Estate Practice (45 hours / 3 credits) — the two courses 49 Pa. Code § 35.272(b)(2) names by title. NOTE: the regulatory minimum in § 35.272(a)(2) is four credits, or 60 hours; 75 exceeds it by one credit"
  }),
  state("NC", "North Carolina", 75, 299, 399, BUILD_STATUS.BUILT, {
    marketRange: "$299–$549",
    composition: "One 75-hour Broker Prelicensing Course following the Commission's sixteen Syllabus sections — 72.0 instructional hours plus the 3.0-hour end-of-course examination, which the Commission counts INSIDE the 75"
  }),
  state("AZ", "Arizona", 96, 399, 549, BUILD_STATUS.BUILT, {
    marketRange: "$549–$929",
    /* 96 is 90 + 6, and they are two separate regulatory records. The Arizona bundle must
       therefore grant TWO courses, and the registry's prelicense_hours field records only
       the 90 — it is the pre-license figure, not the total a student must complete. */
    composition: "Real Estate Salesperson Prelicense (90 hours under A.R.S. § 32-2124(B), of which 27 are the Arizona-specific course the commissioner may NOT waive) plus Real Estate Contract Law and Contract Writing (6 hours under § 32-2124(L), requiring the applicant's participation in DRAFTING a purchase contract, a listing agreement and a lease agreement)",
    note: "Two separate regulatory records; the bundle grants both. Subsection (L) requires its six hours AFTER the requirements of subsection (B), certified at the time of application, so the six are additional to the ninety and never inside them"
  }),

  state("MT", "Montana", 70, 249, 349, BUILD_STATUS.RESEARCHED, {
    marketRange: "$250–$400",
    composition: "70 hours of board-approved prelicensing education, obtained within the 24 months before application",
    note: "The tightest spread of any state screened — priced at the bottom of it"
  }),
  state("ID", "Idaho", 90, 399, 549, BUILD_STATUS.RESEARCHED, {
    marketRange: "$719–$1,019",
    composition: "Module 1, Idaho Real Estate Practices, and Module 2, Real Estate Principles — 45 hours each",
    /* The highest floor of any state in the table: the cheapest package found is $719. Priced
       far below it deliberately rather than at the market, because $719 is one provider's
       package price and not evidence of what the market clears at. */
    note: "Priced well under a market whose visible floor is $719"
  }),
  state("NE", "Nebraska", 90, 349, 449, BUILD_STATUS.RESEARCHED, {
    marketRange: "$350–$800",
    composition: "Three commission-approved courses composed of not less than 90 class hours in total",
    /* Providers currently advertise a 96-hour Nebraska course — three 30-hour courses plus a
       6-hour professional practice and standards course — and describe it as effective
       1 January 2026. Neb. Rev. Stat. 81-885.13(2), read on 2026-08-19, says ninety. The
       statute controls until the later text is read directly, so 90 is what is priced; if the
       96-hour figure is confirmed at the statute, this row and the registry both move. */
    note: "Secondary sources describe 96 hours effective 2026-01-01; unconfirmed against the statute"
  }),
  state("NM", "New Mexico", 90, 299, 399, BUILD_STATUS.RESEARCHED, {
    marketRange: "not reliably published — providers quote by package, not by course",
    composition: "Three commission-approved 30-hour prelicensing courses, completed within three years before the examination",
    note: "Priced with Oklahoma and Washington at the same hour count, for want of a visible market floor"
  }),
  state("IA", "Iowa", 96, 349, 449, BUILD_STATUS.RESEARCHED, {
    marketRange: "$300–$600",
    /* 96 is 60 + 36, and the 36 is three separate 12-hour courses that must be live. The
       bundle therefore grants four courses, and only one of the four can be asynchronous. */
    composition: "A 60-hour prelicensing course, which may be distance or live, plus three 12-hour courses that must be live instruction",
    note: "Four separate regulatory records; three of them cannot be delivered asynchronously"
  }),
  /* Tier 3 — high-hour states, 101–150 hours */
  state("SD", "South Dakota", 116, 499, 649, BUILD_STATUS.RESEARCHED, {
    marketRange: "$1,000–$1,250",
    composition: "One 116-hour broker associate course — South Dakota's entry licence is the broker associate",
    /* The highest floor in the table and the largest single course. Priced with Texas at
       180 hours rather than with Colorado at 168, because Texas splits into six courses and
       South Dakota does not: the whole 116 hours is one approval and one enrolment. */
    note: "Priced at half the visible market; the largest single course of any state screened"
  }),
  state("CA", "California", 135, 199, 299, BUILD_STATUS.BUILT, {
    marketRange: "$139–$449",
    composition: "Real Estate Principles, Real Estate Practice, and Mortgage Loan Brokering and Lending — 45 hours each",
    /* The only state with a decided single-course price. */
    singleCourse: Object.freeze({ sku: "SC-CA-SINGLE", cents: 7900, usd: 79 })
  }),

  /* Tier 4 — very high-hour states, 150+ hours */
  state("CO", "Colorado", 168, 499, 699, BUILD_STATUS.BUILT, {
    marketRange: "$429–$1,299",
    /* SIX courses, not one. C.R.S. § 12-10-203(4)(a) fixes 48 and 48 exactly and then "a total of
       seventy-two hours" from four named subjects, allocating none among the four; 4 CCR 725-1 Rule
       2.1.A.2 makes that allocation, stating the first two as EXACT and the other four as FLOORS.
       The bundle must therefore grant six courses, and the registry's prelicense_hours field records
       the 168 total. */
    composition: "Real Estate Law and Practice (48) plus Colorado Real Estate Contracts (48) plus, from the statutory 72-hour group, Real Estate Closings (not less than 24), Trust Accounts and Record Keeping (not less than 8), Current Legal Issues (not less than 8) and Practical Application (not less than 32) — the six courses Rule 2.1.A.2 names",
    note: "Six separate courses; the bundle grants all six. § 12-10-203(4)(b) waives all but CONTRACTS and CLOSINGS for a broker licensed elsewhere, and (4)(c) waives all but CONTRACTS and the 72-hour group for a salesperson licensed elsewhere — so the Colorado contracts course is the one every applicant completes. Kaplan is $799 for 168 hours plus exam prep, $1,299 for its career package",
    marketNote: "The Commission publishes its own qualifying education outline for each of the six, with hours allocated per topic in five of them"
  }),
  state("TX", "Texas", 180, 499, 649, BUILD_STATUS.UNRESEARCHED, {
    hoursSource: "market research only; Texas rules have not been read from primary sources",
    marketRange: "$498–$1,000",
    composition: "six 30-hour courses",
    note: "A single 30-hour course would price around $99–$119, matching the market; not decided"
  })
]);

/* States that are built or in development but carry no price. Listed explicitly rather than
   left to be noticed, because an unpriced built course is a finished product that cannot be
   sold for a reason nobody wrote down. */
export const PRICING_GAPS = Object.freeze([
  /* Empty as of 2026-08-20: Alaska and Michigan were the two built states without a price
     and both are now priced. The list stays, and the test that reads it stays, because the
     next state built will land here until someone prices it. */
]);

/* Neither exists in any state. The completePath tier cannot be delivered until they do. */
export const UNBUILT_COMPONENTS = Object.freeze([
  Object.freeze({ name: "Exam Prep", tier: "completePath", regulatoryCredit: false }),
  Object.freeze({ name: "Licensing/Application Navigator", tier: "completePath", regulatoryCredit: false })
]);

export function pricingFor(stateCode) {
  return STATE_PRICING.find((s) => s.code === stateCode) ?? null;
}

/* The homepage claim. Computed rather than written down, so it cannot drift from the table
   under it — a headline price no state actually offers is a deceptive advertising problem,
   not a copy problem. */
export function lowestAdvertisedPrice() {
  const cents = Math.min(...STATE_PRICING.map((s) => s.requiredEducation.cents));
  return { cents, usd: cents / 100, display: `from $${cents / 100}` };
}
