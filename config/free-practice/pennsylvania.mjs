const license = {
  reference:'Pennsylvania Real Estate Commission · Salesperson standard method',
  url:'https://www.pa.gov/agencies/dos/resources/professional-licensing-resources/licensure-processing-guides-and-timelines/real-estate-commission-guide',
};
const act = {
  reference:'Pennsylvania Act 75 of 2018 · RELRA § 521',
  url:'https://www.legis.state.pa.us/WU01/LI/LI/US/HTM/2018/0/0075..HTM',
};

const replacements = new Map([
  ['A student finishing this course asks you three things:', [
    'A first-time Pennsylvania salesperson candidate plans to rely on a 60-hour course advertised using older regulatory text. What should the candidate verify?',
    ['The standard path calls for 75 qualifying hours under RELRA § 521 and current Commission instructions.', 'Any 60 hours qualifies for a new applicant.', 'Public practice counts toward the missing hours.', 'The 75-hour requirement applies only after licensure.'],
    'For a new standard-method candidate without an applicable exception, the current Commission guide implements the 75-hour statute. The older rule language is not current application guidance.',
  ]],
  ['What does 49 Pa. Code § 35.272(a)(2) require', [
    'Which two subjects does the Pennsylvania Commission identify for standard salesperson prelicensing education?',
    ['Real Estate Fundamentals and Real Estate Practice', 'Brokerage Management and Commercial Appraisal', 'Real Estate Finance and Mortgage Origination', 'Property Inspection and Land Surveying'],
    'The Commission identifies Fundamentals and Practice as the two basic courses. This practice does not award credit.',
  ]],
  ['Under § 35.272(b)(3), the ten-year education window', [
    'How does the Pennsylvania Commission measure the ordinary five-year prelicensing education window?',
    ['From course completion to successful completion of the licensing examination', 'From course enrollment to license renewal', 'From the date the broker signs an affiliation agreement', 'From the first practice session to the license application'],
    'The current guide says the qualifying coursework must be completed within five years before successful completion of the licensing examination.',
  ]],
  ['What must a real estate education provider give a student within 30 days', [
    'Why should a Pennsylvania applicant retain the official transcript from the education provider?',
    ['It documents qualifying coursework and the completion date for licensing review.', 'It creates active authority to perform brokerage.', 'It replaces the Commission’s exam record.', 'It creates a credit record for public practice.'],
    'An official transcript documents education. The Commission determines whether that education qualifies and whether its timing meets the current application requirements.',
  ]],
]);

export function pennsylvaniaPracticeQuestion(item) {
  for (const [start, [prompt, choices, rationale]] of replacements) {
    if (item.prompt.startsWith(start)) return {...item,prompt,choices,rationale,correctChoice:0,sources:[license,act]};
  }
  return item;
}
