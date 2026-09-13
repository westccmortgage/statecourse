import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { compileNationalReview, NATIONAL_REVIEW_VARIANTS } from './nmls-national-review-content.mjs';

// PRIVATE server loader: the source contains formative keys. Never import this
// module from browser code or copy the manuscript into the published tree.
const sourcePath = 'nmls/curriculum/federal-2026-F01-application-clocks.md';
let cached;
const nationalCache = new Map();
export function getNmlsReviewCourse(id) {
  if (Object.hasOwn(NATIONAL_REVIEW_VARIANTS, id)) {
    if (!nationalCache.has(id)) nationalCache.set(id, compileNationalReview(id,
      NATIONAL_REVIEW_VARIANTS[id].modules.includes('F01') ? getNmlsReviewCourse('nmls-2026-f01-private-review') : null));
    return nationalCache.get(id);
  }
  if (id !== 'nmls-2026-f01-private-review') throw new Error('nmls_review_course_not_found');
  if (cached) return cached;
  // Netlify included_files are rooted at the packaged task root. Bundling
  // changes import.meta.url, so never resolve assets relative to module depth.
  const text = readFileSync(resolve(process.cwd(), sourcePath), 'utf8');
  const part = (start, end) => {
    const a = text.indexOf(start); const b = text.indexOf(end, a + start.length);
    if (a < 0 || b <= a) throw new Error('nmls_review_content_invalid');
    return text.slice(a, b).trim();
  };
  const keyLines = part('## 7. Answer key', '## 8. Transfer exercise').split('\n');
  const keys = new Map(keyLines.filter((line) => /^\| KC\d{2} \|/.test(line)).map((line) => {
    const cells = line.split('|').map((s) => s.trim());
    return [cells[1], { correctChoice: cells[2], rationale: cells[3], remediation: cells[4] }];
  }));
  const blocks = part('## 6. Formative knowledge checks', '## 7. Answer key').split(/^### /m).slice(1);
  const questionSourceUrls = [
    'https://www.consumerfinance.gov/rules-policy/regulations/1002/2/',
    'https://www.consumerfinance.gov/rules-policy/regulations/1002/9/',
    'https://www.consumerfinance.gov/rules-policy/regulations/1002/12/',
    'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/',
  ];
  const bank = blocks.map((block) => {
    const id = block.match(/^(KC\d{2}) /)?.[1];
    const optionsAt = block.search(/^A\. /m);
    const key = keys.get(id);
    if (!key || optionsAt < 0) throw new Error('nmls_review_content_invalid');
    const options = [...block.slice(optionsAt).matchAll(/^([A-D])\. (.+)$/gm)]
      .map((match) => ({ id: match[1], text: match[2].replace(/\\$/, '').trim() }));
    if (options.length !== 4 || !options.some((o) => o.id === key.correctChoice)) throw new Error('nmls_review_content_invalid');
    return { id, stem: block.slice(block.indexOf('\n') + 1, optionsAt).trim(), options,
      ...key, sourceUrls: questionSourceUrls };
  });
  if (bank.length !== 12 || keys.size !== 12) throw new Error('nmls_review_content_invalid');
  const definitions = [
    ['F01-U01', 'Two application tests', '## 1. One customer', '## 2. The first LE', 720, 'KC01'],
    ['F01-U02', 'The first Loan Estimate clock', '## 2. The first LE', '## 3. Incomplete', 900, 'KC03'],
    ['F01-U03', 'Incomplete applications and action notices', '## 3. Incomplete', '## 4. A reason', 600, 'KC06'],
    ['F01-U04', 'Actual adverse-action reasons', '## 4. A reason', '## 5. Preserve', 720, 'KC07'],
    ['F01-U05', 'Preserve and reconcile the record', '## 5. Preserve', '## 6. Formative', 480, 'KC09'],
  ];
  const intro = part('## Purpose and boundaries', '## 1. One customer');
  const units = definitions.map(([unitId, title, start, end, requiredSeconds, questionId], index) => ({
    id: unitId, title, requiredSeconds, requiredActionIds: [questionId],
    content: `${index === 0 ? intro + '\n\n' : ''}${part(start, end)}`,
    actionQuestion: bank.find((q) => q.id === questionId),
  }));
  const course = { id, title: '2026 Federal CE — Application clocks (private development review)',
    mode: 'non_credit_review', salesAuthorized: false, approvalId: null,
    modules: [{ id: 'F01', title: 'Application clocks and evidence', units,
      quiz: { questionsPerAttempt: 5, passPercent: 80, bank } }],
    editorial: { completeCourse: false, validatedDuration: false, finalExamIncluded: false,
      sourcePath, sourceDigest: createHash('sha256').update(text).digest('hex') } };
  // All runtime-relevant fields participate; editing a question, time, source or
  // parser output invalidates the existing grant instead of changing it in place.
  course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
  const freeze = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
  cached = freeze(course);
  return cached;
}
