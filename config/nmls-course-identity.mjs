// One national training offering; this is not an NMLS approval identifier.
// Immutable manuscript keys remain separate from the stable platform identity.
export const NMLS_TRAINING_COURSE = Object.freeze({
  id: 'nmls-ce-2026-comprehensive-8',
  state: 'US',
  jurisdiction: 'United States — national content only; state supplements excluded',
  discipline: 'mortgage',
  productType: 'mortgage_continuing_education',
  version: '2026.3',
  title: '2026 Mortgage Continuing Education — Training Only',
  contentKey: 'nmls-2026-national-comprehensive-private-review-v3',
  contentDigest: 'aad5903b17526825091e1bb59b45ec179dc84fb5c4fa24d29c6dab8e93c4c7b9',
  route: '/mortgage/',
  studentRoute: '/student/nmls-training/',
  operatingMode: 'free_training',
});

export const isNmlsTrainingCourse = id => id === NMLS_TRAINING_COURSE.id;
