/* Public list prices shown on /pricing/. Display only: checkout amounts come from the Stripe
   price configuration and nothing here enables enrollment, payment or credit.
   Owner decision 2026-10-29: competitor median minus ~10-15%, then a further 20% reduction.
   Competitor research (2026-10-29) is kept outside the repo. */
export const PUBLIC_PRICES = Object.freeze([
  ["CA", "California", "Salesperson pre-license: three statutory courses", 135, 99],
  ["TX", "Texas", "Sales agent qualifying education: six courses", 180, 219],
  ["FL", "Florida", "Sales associate pre-license (Course I)", 63, 69],
  ["AZ", "Arizona", "Salesperson pre-license with contract writing", 96, 279],
  ["CO", "Colorado", "Broker pre-license: six courses", 168, 199],
  ["WA", "Washington", "Fundamentals and practices", 90, 139],
  ["PA", "Pennsylvania", "Fundamentals and practice", 75, 159],
  ["MI", "Michigan", "Salesperson pre-licensure", 40, 89],
  ["MO", "Missouri", "Salesperson pre-exam and practice", 72, 129],
  ["NC", "North Carolina", "Broker pre-licensing", 75, 269],
  ["OK", "Oklahoma", "Basic pre-license", 90, 229],
  ["VA", "Virginia", "Salesperson principles and practices", 60, 99],
  ["WI", "Wisconsin", "Salesperson pre-license", 72, 159],
  ["ME", "Maine", "Sales agent pre-license", 55, 199],
  ["AK", "Alaska", "Salesperson pre-licensing", 40, 179],
].map(([code, state, course, hours, price]) => Object.freeze({ code, state, course, hours, price })));

export const NMLS_PRICE = Object.freeze({ course: "National 8-hour SAFE continuing education", hours: 8, price: 69, plusNmlsFee: true });
