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

  /* Tier 2 — mid-hour states, 66–100 hours */
  state("WI", "Wisconsin", 72, 249, 349, BUILD_STATUS.RESEARCHED, { marketRange: "$279–$679" }),
  state("MO", "Missouri", 72, 249, 349, BUILD_STATUS.BUILT, {
    marketRange: "$298–$582",
    composition: "48-hour pre-exam course plus 24-hour practice course"
  }),
  state("OK", "Oklahoma", 90, 299, 399, BUILD_STATUS.BUILT, { marketRange: "$299–$829" }),
  state("WA", "Washington", 90, 299, 399, BUILD_STATUS.RESEARCHED, { marketRange: "$379–$785" }),
  state("PA", "Pennsylvania", 75, 299, 399, BUILD_STATUS.RESEARCHED, { marketRange: "$252–$685" }),
  state("NC", "North Carolina", 75, 299, 399, BUILD_STATUS.RESEARCHED, { marketRange: "$299–$549" }),
  state("AZ", "Arizona", 96, 399, 549, BUILD_STATUS.RESEARCHED, {
    marketRange: "$549–$929",
    /* 96 is 90 + 6, and they are two separate regulatory records. The Arizona bundle must
       therefore grant TWO courses, and the registry's prelicense_hours field records only
       the 90 — it is the pre-license figure, not the total a student must complete. */
    composition: "90-hour salesperson pre-license course plus 6-hour contract writing course",
    note: "Two separate regulatory records; the bundle grants both"
  }),

  /* Tier 3 — high-hour states, 101–150 hours */
  state("CA", "California", 135, 199, 299, BUILD_STATUS.BUILT, {
    marketRange: "$139–$449",
    composition: "Real Estate Principles, Real Estate Practice, and Mortgage Loan Brokering and Lending — 45 hours each",
    /* The only state with a decided single-course price. */
    singleCourse: Object.freeze({ sku: "SC-CA-SINGLE", cents: 7900, usd: 79 })
  }),

  /* Tier 4 — very high-hour states, 150+ hours */
  state("CO", "Colorado", 168, 499, 699, BUILD_STATUS.RESEARCHED, {
    marketRange: "$429–$1,299",
    note: "Kaplan is $799 for 168 hours plus exam prep, $1,299 for its career package"
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
  Object.freeze({ code: "AK", name: "Alaska", requiredHours: 40, buildStatus: BUILD_STATUS.BUILT,
    reason: "Curriculum complete, submission package drafted. No price decided." }),
  Object.freeze({ code: "MI", name: "Michigan", requiredHours: 40, buildStatus: BUILD_STATUS.BUILT,
    reason: "Curriculum complete, submission package drafted. No price decided." })
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
