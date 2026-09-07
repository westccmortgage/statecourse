import { TEXAS_FULL_PRACTICE_SOURCES } from '../scripts/lib/free-practice-activities.mjs';
// Public practice publishes student curriculum and formative exercises only.
// Each course is explicitly mapped; protected examinations are never source inputs.
export const PRACTICE_SOURCES = [
  ['AK','ak-salesperson-prelicense-40-v1','alaska/ak-salesperson-prelicense-40-v1/curriculum','alaska/module'],
  ['AZ','az-salesperson-prelicense-90','arizona/az-salesperson-prelicense-90-v1/curriculum','arizona/prelicense-90'],
  ['AZ','az-contract-writing-6','arizona/az-contract-writing-6-v1/curriculum','arizona/contract-writing-6'],
  ['CA','ca-real-estate-principles-45','california/ca-real-estate-principles-45-v1/curriculum','california/principles'],
  ['CA','ca-real-estate-practice-45','california/ca-real-estate-practice-45-v1/curriculum','california/practice'],
  ['CA','ca-mortgage-loan-brokering-lending-45','california/ca-mortgage-loan-brokering-lending-45-v1/curriculum','california/mortgage'],
  ['CO','co-real-estate-law-practice-48','colorado/co-real-estate-law-and-practice-48-v1/curriculum','colorado/law-and-practice-48'],
  ['CO','co-contracts-regulations-48','colorado/co-contracts-and-regulations-48-v1/curriculum','colorado/contracts-and-regulations-48'],
  ['CO','co-trust-accounts-recordkeeping-8','colorado/co-trust-accounts-and-record-keeping-8-v1/curriculum','colorado/trust-accounts-8'],
  ['CO','co-current-legal-issues-8','colorado/co-current-legal-issues-8-v1/curriculum','colorado/current-legal-issues-8'],
  ['CO','co-real-estate-closings-24','colorado/co-closings-24-v1/curriculum','colorado/closings-24'],
  ['CO','co-practical-applications-32','colorado/co-practical-applications-32-v1/curriculum','colorado/practical-applications-32'],
  ['ME','me-sales-agent-v1','maine/curriculum','maine/module'],
  ['MI','mi-salesperson-prelicensure-40-v1','michigan/mi-salesperson-prelicensure-40-v1/curriculum','michigan/module'],
  ['MO','mo-salesperson-preexam-48','missouri/mo-salesperson-preexam-48-v1/curriculum','missouri/preexam-48'],
  ['MO','mo-real-estate-practice-24','missouri/mo-real-estate-practice-24-v1/curriculum','missouri/mrep-24'],
  ['NC','nc-broker-prelicensing-75','north-carolina/curriculum','north-carolina/module'],
  ['OK','ok-basic-prelicense-90','oklahoma/curriculum','oklahoma/module'],
  ['PA','pa-real-estate-fundamentals-30','pennsylvania/pa-real-estate-fundamentals-30-v1/curriculum','pennsylvania/fundamentals-30'],
  ['PA','pa-real-estate-practice-45','pennsylvania/pa-real-estate-practice-45-v1/curriculum','pennsylvania/practice-45'],
  ['TX','tx-principles-real-estate-i-30','texas/tx-principles-real-estate-i-30-v1/curriculum','texas/principles-i'],
  ['TX','tx-principles-real-estate-ii-30','texas/tx-principles-real-estate-ii-30-v1/curriculum','texas/principles-ii'],
  ['TX','tx-law-of-agency-30','texas/tx-law-of-agency-30-v1/curriculum','texas/law-of-agency'],
  ['VA','va-principles-practices-v1','virginia/curriculum','virginia/module'],
  ['WA','wa-real-estate-fundamentals-60','washington/wa-real-estate-fundamentals-60-v1/curriculum','washington/fundamentals-60'],
  ['WA','wa-real-estate-practices-30','washington/wa-real-estate-practices-30-v1/curriculum','washington/practices-30'],
  ['WI','wi-salesperson','wisconsin/curriculum','wisconsin/module'],
].map(([stateCode,courseId,curriculumDir,bank]) => ({stateCode,courseId,curriculumDir,bankPath:`config/${bank}-question-bank.mjs`,coverage:'authored curriculum'}));

PRACTICE_SOURCES.push(...TEXAS_FULL_PRACTICE_SOURCES);
