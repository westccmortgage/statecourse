import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { ethicsPracticeUnits } from './nmls-ethics-practice-v2.mjs';

// Private manuscript compiler. Only this server module may read source keys.
// The old F01 manifest is unchanged; new variants receive their own grants.
const sha = (text) => createHash('sha256').update(text).digest('hex');
const invalid = () => { throw new Error('nmls_review_content_invalid'); };
const freeze = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const definitions = {
  F00: { file: 'federal-2026-F00-examination-background.md', hash: '8a018cf9d9d8ba44b14215735c348840b230f4c31ece27188d92a9d729c069b9' },
  F01: { file: 'federal-2026-F01-application-clocks.md', hash: 'ecd0051b5fe7b980233028bf20c9b7d478b07286ec2e9f8fde18a30c9ebdc408' },
  F02: { file: 'federal-2026-F02-loan-estimate-tolerances.md', hash: '7c3688b34bc2e130241a2e441b9ba8613edb63d33e866fcacc8db47ee57cb323',
    title: 'Loan Estimate tolerances and corrections', bank: 7, key: 8, count: 16,
    intro: '## Purpose and learning outcomes',
    units: [[1, 1, 9, 'F02-KC01'], [2, 2, 8, 'F02-KC03'], [3, 3, 7, 'F02-KC05'], [4, 4, 10, 'F02-KC08'], [5, 5, 8, 'F02-KC11'], [6, 6, 8, 'F02-KC16']] },
  F03: { file: 'federal-2026-F03-closing-disclosure-and-capstone.md', hash: '96c422ebc2c60fe88ea9768ef69466e551e5c5e9c9ddc9fe4a2b8f194b6946dc',
    title: 'Closing Disclosure and federal-law capstone', bank: 5, key: 6, count: 15,
    intro: '## Scope and learning outcomes',
    units: [[1, 1, 15, 'F03-Q01'], [2, 2, 10, 'F03-Q07'], [3, 4, 15, 'F03-Q14']] },
  E01: { file: 'ethics-2026-E01-consistent-treatment.md', hash: '8e3783c493cd8c4d567c1242b49975a36312d014804fc2aa1a35c810fdb71d94',
    title: 'Ethics: consistent treatment', bank: 7, key: 8, count: 14, separateFormativeMinutes: 8,
    units: [[1, 3, 8, 'E01-Q02'], [4, 4, 13, 'E01-Q03'], [5, 5, 9, 'E01-Q07'], [6, 6, 12, 'E01-Q14']] },
  E02: { file: 'ethics-2026-E02-fraud-resistance-and-consumer-protection.md', hash: 'c878836719ba5f88ede9055dbb392214b6a9186dbe8444be4de1818761869c9e',
    title: 'Ethics: fraud resistance and consumer protection', bank: 9, key: 10, count: 14, separateFormativeMinutes: 7,
    units: [[1, 2, 7, 'E02-Q02'], [3, 4, 11, 'E02-Q04'], [5, 5, 9, 'E02-Q08'], [6, 6, 8, 'E02-Q10'], [7, 8, 8, 'E02-Q14']] },
  N01: { file: 'nontraditional-2026-N01-payment-change-and-product-risk.md', hash: 'c8d78840a8ddcea94063921d7d45a1c0e182e590606d84290932670186e9b22d',
    title: 'Nontraditional mortgages: payment changes and risk', bank: 6, key: 7, count: 14, inlineOptions: true,
    units: [[1, 1, 7, 'N01-Q13'], [2, 2, 11, 'N01-Q03'], [3, 3, 12, 'N01-Q06'], [4, 4, 9, 'N01-Q09'], [5, 5, 11, 'N01-Q08']] },
  N02: { file: 'nontraditional-2026-N02-underwriting-evidence-and-non-qm.md', hash: '0b75034ffe71d4088153add4630292f2babb4c2b7542f3a94edc07f3955ac522',
    title: 'Nontraditional mortgages: underwriting evidence', bank: 9, key: 10, count: 16, inlineOptions: true,
    units: [[1, 1, 8, 'N02-Q01'], [2, 3, 12, 'N02-Q05'], [4, 5, 12, 'N02-Q08'], [6, 7, 10, 'N02-Q12'], [8, 8, 8, 'N02-Q16']] },
  G01: { file: 'general-2026-G01-mortgage-file-integrity.md', hash: 'f099e672d3bc491a53f4391db244eaf1266cda9632da00b28a8aa8c7aff0bffd',
    title: 'Elective: mortgage-file integrity', bank: 7, key: 8, count: 16, intro: '## Purpose, applicability and non-duplication',
    units: [[1, 1, 8, 'G01-KC02'], [2, 2, 9, 'G01-KC04'], [3, 3, 10, 'G01-KC05'], [4, 4, 8, 'G01-KC08'], [5, 5, 9, 'G01-KC12'], [6, 6, 6, 'G01-KC16']] },
  G02: { file: 'general-2026-G02-complex-residential-transaction-coordination.md', hash: 'bb46dc176351350a8dd48a47ae934da88be946b3647a1cedd8c2668682459afe',
    title: 'Elective: complex residential transactions', bank: 6, key: 7, count: 14, intro: '## Purpose and boundaries',
    units: [[1, 1, 8, 'G02-Q02'], [2, 2, 12, 'G02-Q04'], [3, 3, 10, 'G02-Q09'], [4, 4, 12, 'G02-Q11'], [5, 5, 8, 'G02-Q13']] },
  G03: { file: 'general-2026-G03-residential-lending-exception-governance.md', hash: '3ea4be98a6db37fdadd21335c2b404642b7b3d98527112d329877b5858f7d1d2',
    title: 'Elective: residential lending exceptions', bank: 6, key: 7, count: 16, intro: '## Purpose and non-duplication',
    units: [[1, 1, 8, 'G03-Q02'], [2, 2, 12, 'G03-Q05'], [3, 3, 10, 'G03-Q09'], [4, 4, 12, 'G03-Q12'], [5, 5, 8, 'G03-Q16']] },
};
const core = ['F01', 'F02', 'F03', 'E01', 'E02', 'N01', 'N02'];
export const NATIONAL_REVIEW_VARIANTS = freeze({
  'nmls-2026-national-core-private-review': { title: '2026 national core — private development review', modules: core, designMinutes: 350 },
  'nmls-2026-national-comprehensive-private-review': { title: '2026 national comprehensive — private development review', modules: [...core, 'G01'], designMinutes: 400 },
  'nmls-2026-national-core-private-review-v2': { title: '2026 national core — private development review v2', modules: core, designMinutes: 350, ethicsPractice: true },
  'nmls-2026-national-comprehensive-private-review-v2': { title: '2026 national comprehensive — private development review v2', modules: [...core, 'G01'], designMinutes: 400, ethicsPractice: true },
  'nmls-2026-national-core-private-review-v3': { title: '2026 national core — private development review v3', modules: core, designMinutes: 350, ethicsPractice: true, averagingClarification: true },
  'nmls-2026-national-comprehensive-private-review-v3': { title: '2026 national comprehensive — private development review v3', modules: [...core, 'G01'], designMinutes: 400, ethicsPractice: true, averagingClarification: true },
  ...Object.fromEntries([1, 2, 3].map(n => [`nmls-2026-general-${n}-private-review`, {
    title: `2026 general elective ${n} — private development review`, modules: [`G0${n}`], designMinutes: 50,
  }])),
});

function between(text, from, to) {
  const a = text.indexOf(from); const b = text.indexOf(to, a + from.length);
  if (a < 0 || b <= a || text.indexOf(from, a + from.length) >= 0) invalid();
  return text.slice(a, b).trim();
}
function chapter(text, number) {
  const sections = [...text.matchAll(/^## (\d+)\. [^\n]+/gm)];
  const i = sections.findIndex(m => Number(m[1]) === number);
  if (i < 0 || sections.filter(m => Number(m[1]) === number).length !== 1) invalid();
  return text.slice(sections[i].index, sections[i + 1]?.index ?? text.length).trim();
}
function stripPrivateGuides(text) {
  const lines = text.split('\n'); const result = []; let skippedLevel = null;
  for (const line of lines) {
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    if (heading && skippedLevel !== null && heading[1].length <= skippedLevel) skippedLevel = null;
    if (heading && /\bprivate\b.*\b(?:key|guide)\b/i.test(heading[2])) skippedLevel = heading[1].length;
    if (skippedLevel === null) result.push(line);
  }
  return result.join('\n').trim();
}
function sourceLinks(text) {
  // Only links and their labels, never the source-ledger prose or private keys.
  const byUrl = new Map();
  for (const m of text.matchAll(/\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g)) {
    const url = new URL(m[2]);
    if (url.username || url.password || url.protocol !== 'https:') invalid();
    if (!byUrl.has(m[2])) byUrl.set(m[2], { title: m[1], url: m[2] });
  }
  if (!byUrl.size) invalid();
  return [...byUrl.values()];
}
function sourceRegister(text, moduleId) {
  // Retain citation identifiers and authority limitations, not just URLs. A
  // learner seeing [S7] must be able to resolve it within the unlocked lesson.
  if (moduleId === 'G01') return chapter(text, 9).split('\n').filter(line => line.startsWith('| ')).join('\n');
  if (moduleId === 'F02') return between(text, '### Primary evidence', 'The current CFPB pages').replace(/^### Primary evidence\s*/, '');
  const entries = text.split('\n').filter(line => /^(?:- )?(?:\*\*)?S\d+(?: — |\. )/.test(line));
  if (!entries.length) invalid();
  return entries.join('\n\n');
}
function learnerIntro(text, moduleId, def) {
  if (def.intro) return between(text, def.intro, '## 1.');
  if (moduleId === 'N01' || moduleId === 'N02') {
    const record = between(text, '## Authoring and category record', '## 1.');
    // Keep category applicability and objectives, omit the authoring time table.
    const paragraphs = record.split(/\n\s*\n/);
    return '## Scope and learning outcomes\n\n' + paragraphs.filter(p => !p.startsWith('## ') && !p.startsWith('| ')).join('\n\n');
  }
  return '';
}
function clarifyAveraging(content) {
  // Additive v3 correction only. Never change the source bytes or prior grants.
  const replacements = [
    ['Retrospective review and adjustment must keep the program from collecting more for the corresponding services than is paid to providers over time.',
      'Apply the retrospective-analysis requirements together with the specific deemed-compliance method described below. For other methods, reconciliation must address aggregate amounts collected above corresponding provider payments over time.'],
    ['It also describes a six-month calculation period with rolling monthly reevaluation as a compliant method; that is not a requirement to use only that one design.',
      'The commentary deems its specified six-month period with rolling monthly reevaluation compliant even if collections exceed provider payments over time. A surplus alone therefore does not establish a violation when that method is satisfied. That method is available, not mandatory.'],
    ['Change another fact: the program has a properly calculated average but permits permanent retention of aggregate overcollections.',
      'Change another fact: the program has a properly calculated average but permits permanent retention of aggregate overcollections, using neither the specified deemed-compliance method nor another compliant retrospective reconciliation method.'],
  ];
  for (const [before, after] of replacements) {
    if (content.split(before).length !== 2) invalid();
    content = content.replace(before, after);
  }
  return content + '\n\n### Averaging clarification source\n\n'
    + 'Reviewed September 11, 2026: [CFPB official comment 19(f)(3)(ii)-5](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#Interp-19-f-3-ii). '
    + 'Read both the general retrospective requirement and the expressly deemed-compliant six-month/rolling-monthly method.';
}
function parseBank(text, def, moduleId, sources) {
  const keyText = chapter(text, def.key);
  const keys = new Map();
  for (const line of keyText.split('\n')) {
    const cells = line.split('|').map(s => s.trim());
    if (!new RegExp(`^${moduleId}-(?:KC|Q)\\d{2}$`).test(cells[1] || '')) continue;
    if (keys.has(cells[1]) || !/^[A-D]$/.test(cells[2]) || !cells[3]) invalid();
    keys.set(cells[1], { correctChoice: cells[2], rationale: cells[3], remediation: cells[4] || `Revisit the relevant explanation and cited authority in ${moduleId}.` });
  }
  const body = chapter(text, def.bank);
  const marker = def.inlineOptions ? /^\*\*([A-Z]\d{2}-Q\d{2})\.\*\* */gm : /^### ([A-Z]\d{2}-(?:Q|KC)\d{2})[^\n]*\n/gm;
  const starts = [...body.matchAll(marker)];
  const questions = starts.map((m, i) => {
    const raw = body.slice(m.index + m[0].length, starts[i + 1]?.index ?? body.length).trim().replace(/\n+---\s*$/, '').trim();
    const optionStart = raw.search(/^A\. /m); if (optionStart < 0) invalid();
    const optionText = raw.slice(optionStart).trim();
    const optionMarkers = [...optionText.matchAll(def.inlineOptions ? /(?:^|\s)([A-D])\. /g : /^([A-D])\. /gm)];
    const options = optionMarkers.map((o, j) => ({ id: o[1], text: optionText.slice(o.index + o[0].length, optionMarkers[j + 1]?.index ?? optionText.length).replace(/\\\s*$/, '').trim() }));
    const key = keys.get(m[1]);
    if (!key || !raw.slice(0, optionStart).trim() || options.map(o => o.id).join('') !== 'ABCD' || options.some(o => !o.text)) invalid();
    return { id: m[1], stem: raw.slice(0, optionStart).trim(), options, ...key,
      sourceUrls: sources.map(s => s.url) };
  });
  if (questions.length !== def.count || keys.size !== def.count || new Set(questions.map(q => q.id)).size !== def.count) invalid();
  return questions;
}

export function compileNationalReview(id, legacyCourse, { readSource = file => readFileSync(resolve(process.cwd(), 'nmls/curriculum', file), 'utf8') } = {}) {
  if (!Object.hasOwn(NATIONAL_REVIEW_VARIANTS, id)) throw new Error('nmls_review_course_not_found');
  const variant = NATIONAL_REVIEW_VARIANTS[id];
  const sourceRecords = [];
  const read = moduleId => {
    const def = definitions[moduleId]; const text = readSource(def.file);
    if (sha(text) !== def.hash) invalid();
    sourceRecords.push({ moduleId, path: `nmls/curriculum/${def.file}`, sha256: def.hash }); return text;
  };
  const modules = variant.modules.map(moduleId => {
    const def = definitions[moduleId]; const text = read(moduleId);
    if (moduleId === 'F01') {
      if (legacyCourse?.id !== 'nmls-2026-f01-private-review' || legacyCourse.editorial.sourceDigest !== def.hash) invalid();
      const module = structuredClone(legacyCourse.modules[0]);
      const background = read('F00');
      module.units[0].content = between(background, '## Learner reading', '## Private editorial boundary')
        + '\n\n### Background source\n\n' + sourceRegister(background, 'F00') + '\n\n' + module.units[0].content;
      module.units[0].requiredSeconds += 180; // One F00 background, not a separate credential or extra hour.
      module.units.at(-1).content += '\n\n' + between(text, '## 8. Transfer exercise', '**Scoring guide for a human reviewer:**');
      module.sources = sourceLinks(text + '\n' + background);
      module.units[0].content += '\n\n### Primary source links\n\n' + module.sources.map(s => `- [${s.title}](${s.url})`).join('\n');
      return module;
    }
    const sources = sourceLinks(text); const bank = parseBank(text, def, moduleId, sources);
    const intro = learnerIntro(text, moduleId, def);
    const register = sourceRegister(text, moduleId);
    const units = def.units.map(([from, to, minutes, action], i) => {
      let content = Array.from({ length: to - from + 1 }, (_, n) => chapter(text, from + n)).join('\n\n');
      if (i === 0 && intro) content = intro + '\n\n' + content;
      if (moduleId === 'F02' && i === def.units.length - 1) content += '\n\n' + between(text, '### Transfer task for human review', 'The expected response tests actual facts');
      if (moduleId === 'F03' && i === def.units.length - 1) content += '\n\n### Evidence retention\n\n'
        + between(text, 'For §1026.19(e)/(f) compliance evidence generally', 'Private production checklist before approval submission or learner release:');
      content = stripPrivateGuides(content);
      if (variant.averagingClarification && moduleId === 'F03' && i === 0) content = clarifyAveraging(content);
      if (moduleId === 'E02') content = content.replace(/(?:Review guide: |^Guide: )[^\n]*/gm, '');
      if (moduleId === 'F03') content = content.replace('### Learner tasks — answer before opening the reviewer key', '### Learner tasks');
      content += '\n\n### Primary sources and authority boundaries\n\n' + register;
      const actionQuestion = bank.find(q => q.id === action); if (!actionQuestion) invalid();
      if (/^#{1,6} .*\bprivate\b.*(?:key|guide|bank)/im.test(content) || /^\| [A-Z]\d{2}-(?:Q|KC)\d{2} \| [A-D] \|/m.test(content)) invalid();
      return { id: `${moduleId}-U${String(i + 1).padStart(2, '0')}`, title: chapter(text, from).split('\n')[0].replace(/^## \d+\. (?:[A-Z]\d{2}-U\d{2} — )?/, ''),
        content, requiredSeconds: minutes * 60, requiredActionIds: [action], actionQuestion };
    });
    if (variant.ethicsPractice && ['E01', 'E02'].includes(moduleId)) units.push(...ethicsPracticeUnits(moduleId));
    return { id: moduleId, title: def.title, units, sources, quiz: { questionsPerAttempt: 5, passPercent: 80, bank } };
  });
  const ids = modules.flatMap(m => m.quiz.bank.map(q => q.id));
  if (new Set(ids).size !== ids.length) invalid();
  if (variant.ethicsPractice) {
    const practiceIds = modules.flatMap(m => m.units.filter(u => u.guidedPractice).map(u => u.actionQuestion.id));
    if (practiceIds.length !== 6 || new Set([...ids, ...practiceIds]).size !== ids.length + 6) invalid();
  }
  const unitSeconds = modules.flatMap(m => m.units).reduce((s, u) => s + u.requiredSeconds, 0);
  const unassignedFormativeMinutes = variant.ethicsPractice ? 0 : variant.modules.reduce((s, m) => s + (definitions[m].separateFormativeMinutes || 0), 0);
  if (unitSeconds / 60 + unassignedFormativeMinutes !== variant.designMinutes) invalid();
  const course = { id, title: variant.title, mode: 'non_credit_review', salesAuthorized: false, approvalId: null, modules,
    editorial: { completeCourse: false, nationalDraftAssembly: true, validatedDuration: false, finalExamIncluded: false,
      designMinutes: variant.designMinutes, provisionalUnitMinutes: unitSeconds / 60, unassignedFormativeMinutes,
      timingNotice: 'Unit budgets are provisional, not approved hours or measured learner duration. Module quizzes award no time.'
        + (unassignedFormativeMinutes ? ` E01/E02 reserve ${unassignedFormativeMinutes} separate formative minutes not implemented here; do not fill that gap by idle waiting.` : ''),
      runtimeExcluded: ['private reviewer guides', 'private keys', 'authoring release ledgers', 'final examination', 'BioSig identity proof', 'credit issuance'],
      sourceRecords } };
  if (variant.ethicsPractice) {
    // Additive v2 only: prior grant keys and digests remain byte-for-byte stable.
    course.editorial.guidedPractice = { version: '2026.2', units: 6, provisionalMinutes: 15,
      sourcePath: 'netlify/functions/_lib/nmls-ethics-practice-v2.mjs',
      bankIndependent: true, humanReviewed: false, writtenResponsesCollected: false };
    course.editorial.timingNotice += ' Six guided Ethics practice units use new transfer decisions and post-answer explanations. Their 15-minute allocation still requires representative-learner timing; passing a choice is not proof of written reflection.';
  }
  if (variant.averagingClarification) {
    course.editorial.sourceClarification = { version: '2026.3', unitId: 'F03-U01', reviewedOn: '2026-09-11',
      source: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#Interp-19-f-3-ii',
      scope: 'Average-charge retrospective-analysis deemed-compliance qualification; prior source bytes and grants unchanged.',
      humanReviewed: false };
  }
  course.digest = sha(JSON.stringify(course));
  return freeze(course);
}
