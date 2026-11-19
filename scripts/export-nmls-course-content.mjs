// Builds the regulator review copy of the national mortgage course: every lesson,
// every lesson check, every module quiz bank, the final examination bank, and the
// answer keys. It reads the same pinned source the student portal delivers, so the
// document cannot drift from the course.
//
// The output contains answer keys. It is written to .local-export/ (git-ignored)
// and must never be placed in public/, dist/ or a download route.
//
//   node scripts/export-nmls-course-content.mjs            -> HTML
//   node scripts/export-nmls-course-content.mjs --pdf      -> HTML and PDF (needs Playwright)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';

// NMLS Education Management System application ID for this course (owner-supplied, 2026-11-19).
const APPLICATION_ID = '109386';
const CATEGORY = { F: 'Federal law and regulation', E: 'Ethics', N: 'Nontraditional mortgage lending', G: 'Elective' };
const categoryOf = id => CATEGORY[id[0]];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');

// The manuscripts use a small Markdown subset: headings, paragraphs, tables,
// bulleted and numbered lists, block quotes, bold, code and links.
export function renderMarkdown(source, headingShift = 2) {
  const lines = source.replace(/\r/g, '').split('\n'), out = [];
  let i = 0;
  const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) { const level = Math.min(6, heading[1].length + headingShift); out.push(`<h${level}>${inline(heading[2])}</h${level}>`); i++; continue; }
    if (line.startsWith('|') && /^\|[\s:|-]+\|?$/.test(lines[i + 1] || '')) {
      const align = cells(lines[i + 1]).map(c => c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : 'left');
      const cell = (tag, row) => '<tr>' + cells(row).map((c, n) => `<${tag} style="text-align:${align[n] || 'left'}">${inline(c)}</${tag}>`).join('') + '</tr>';
      let html = '<table><thead>' + cell('th', line) + '</thead><tbody>';
      for (i += 2; i < lines.length && lines[i].startsWith('|'); i++) html += cell('td', lines[i]);
      out.push(html + '</tbody></table>'); continue;
    }
    const list = line.match(/^([-*]|\d+\.)\s+/);
    if (list) {
      const ordered = /\d/.test(list[1]), marker = ordered ? /^\d+\.\s+/ : /^[-*]\s+/, items = [];
      while (i < lines.length && (marker.test(lines[i]) || (/^\s+\S/.test(lines[i]) && items.length))) {
        if (marker.test(lines[i])) items.push(lines[i].replace(marker, '')); else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>` + items.map(item => `<li>${inline(item)}</li>`).join('') + `</${ordered ? 'ol' : 'ul'}>`); continue;
    }
    if (line.startsWith('> ')) {
      const quote = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) quote.push(lines[i].replace(/^>\s?/, ''));
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`); continue;
    }
    const paragraph = [];
    for (; i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\||[-*]\s|\d+\.\s|>\s)/.test(lines[i]); i++) paragraph.push(lines[i].trim());
    out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return out.join('\n');
}

// Lessons cite sources as [S1], [S2]…; the numbered definitions live in each manuscript.
const SOURCE_KEY = /^(?:[-*] |\| ?)?\*{0,2}(S\d+)\b\*{0,2}\s*(?:—|\||\.)\s*(.*)$/;
function sourceKeys(course, module, root) {
  const keys = new Map();
  for (const record of course.editorial.sourceRecords.filter(r => r.moduleId === module.id || (module.id === 'F01' && r.moduleId === 'F00')))
    for (const line of fs.readFileSync(path.join(root, record.path), 'utf8').split('\n')) {
      const found = line.match(SOURCE_KEY);
      if (!found || keys.has(found[1])) continue;
      // Keep the citation and its first sentence; the rest is the author's working note.
      const text = found[2].replace(/\s*\|\s*$/, '').replace(/\s*\|\s*/g, ' — '), link = text.search(/\]\([^)]*\)/);
      const from = link < 0 ? 0 : text.indexOf(')', link), stop = text.slice(from).search(/\.(\s|$)/);
      keys.set(found[1], stop < 0 ? text : text.slice(0, from + stop + 1));
    }
  const used = new Set(module.units.flatMap(u => [...u.content.matchAll(/\bS\d+\b/g)].map(m => m[0])).filter(tag => module.units.some(u => u.content.includes('[' + tag))));
  for (const tag of used) if (!keys.has(tag)) throw new Error(`undefined_source_key:${module.id}:${tag}`);
  return [...keys].filter(([tag]) => used.has(tag)).sort((a, b) => a[0].slice(1) - b[0].slice(1));
}

const question = (q, label) => `<div class="q"><p><strong>${esc(label)}.</strong> ${inline(q.stem)}</p><ol class="opts">` +
  q.options.map(o => `<li>${inline(o.text)}</li>`).join('') + '</ol></div>';

export function buildNmlsCourseContent(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const course = getNmlsReviewCourse(identity.contentKey), final = getNmlsDraftFinalDefinition(identity.contentKey);
  if (course.digest !== identity.contentDigest || final.contentDigest !== course.digest) throw new Error('nmls_content_pin_mismatch');
  const minutes = units => units.reduce((sum, unit) => sum + unit.requiredSeconds / 60, 0);
  const formative = new Map();
  for (const module of course.modules) {
    for (const q of module.quiz.bank) formative.set(q.id, { ...q, moduleId: module.id });
    for (const unit of module.units) if (unit.actionQuestion && !formative.has(unit.actionQuestion.id)) formative.set(unit.actionQuestion.id, { ...unit.actionQuestion, moduleId: module.id, lessonOnly: unit.id });
  }
  const totals = {
    modules: course.modules.length, lessons: course.modules.reduce((sum, m) => sum + m.units.length, 0),
    minutes: minutes(course.modules.flatMap(m => m.units)), formative: formative.size, finalBank: final.items.length,
    byCategory: Object.fromEntries(Object.entries(CATEGORY).map(([k, name]) => [name, minutes(course.modules.filter(m => m.id[0] === k).flatMap(m => m.units))])),
  };
  const passCount = Math.ceil(final.questionCount * final.passPercent / 100);
  const html = [];
  const push = s => html.push(s);

  push(`<section class="cover"><p class="kicker">StateCourse LLC · NMLS Course Provider ID ${esc(identity.providerId)}</p>
<h1>8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education</h1>
<p class="kicker">NMLS course application ${esc(APPLICATION_ID)} · Complete course content</p>
<p>Lessons, lesson checks, module quiz banks, final examination bank and answer keys.</p>
<table class="facts"><tbody>
<tr><th>Delivery format</th><td>Online self-study (OSS)</td></tr>
<tr><th>Structure</th><td>${totals.modules} modules · ${totals.lessons} lessons · ${totals.minutes} instructional minutes</td></tr>
${Object.entries(totals.byCategory).map(([name, m]) => `<tr><th>${esc(name)}</th><td>${m} minutes</td></tr>`).join('')}
<tr><th>Lesson checks and module quizzes</th><td>${totals.formative} questions. Each lesson ends with one required check. Each module quiz draws ${course.modules[0].quiz.questionsPerAttempt} questions from that module's bank; ${course.modules[0].quiz.passPercent}% is required to move on. Quizzes carry no instructional time.</td></tr>
<tr><th>Final examination</th><td>${final.questionCount} questions drawn from a bank of ${final.items.length}, with a fixed number from each module. Passing score: ${final.passPercent}% (${passCount} of ${final.questionCount} correct). A learner who fails must complete assigned remediation lessons before a second form of ${final.questionCount} entirely different questions. There is no automatic third attempt.</td></tr>
<tr><th>Course version</th><td>${esc(identity.version)}</td></tr>
<tr><th>Content fingerprint (SHA-256)</th><td class="mono">${esc(course.digest)}</td></tr>
<tr><th>Examination fingerprint (SHA-256)</th><td class="mono">${esc(final.digest)}</td></tr>
</tbody></table>
<p class="notice"><strong>Confidential.</strong> This copy contains answer keys and is prepared for regulator review only. Instructional minutes are the provider's design budget submitted for review; they are not yet approved credit hours.</p></section>`);

  push('<section><h2>Contents</h2><table class="toc"><thead><tr><th>Module</th><th>Category</th><th>Lessons</th><th>Minutes</th><th>Quiz bank</th></tr></thead><tbody>' +
    course.modules.map((m, n) => `<tr><td>${n + 1}. ${esc(m.title)}</td><td>${esc(categoryOf(m.id))}</td><td>${m.units.length}</td><td>${minutes(m.units)}</td><td>${m.quiz.bank.length}</td></tr>`).join('') +
    `<tr class="sum"><td>Total</td><td></td><td>${totals.lessons}</td><td>${totals.minutes}</td><td></td></tr></tbody></table>
<p>Part A is the instruction exactly as the learner receives it. Part B is the final examination bank. Part C holds every answer key with its rationale and source.</p></section>`);

  push('<h2 class="part">Part A — Lessons, lesson checks and module quizzes</h2>');
  course.modules.forEach((m, n) => {
    push(`<section class="module"><h2>Module ${n + 1}: ${esc(m.title)}</h2><p class="meta">${esc(categoryOf(m.id))} · ${m.units.length} lessons · ${minutes(m.units)} minutes · module code ${esc(m.id)}</p>`);
    m.units.forEach((u, k) => {
      push(`<article><h3>Lesson ${n + 1}.${k + 1}: ${esc(u.title)}</h3><p class="meta">${u.requiredSeconds / 60} minutes · lesson code ${esc(u.id)}</p>`);
      push(renderMarkdown(u.content, 3));
      if (u.actionQuestion) push(`<div class="check"><p class="label">Lesson check (required to complete the lesson)</p>${question(u.actionQuestion, u.actionQuestion.id)}</div>`);
      push('</article>');
    });
    push(`<article><h3>Module ${n + 1} quiz bank</h3><p class="meta">${m.quiz.bank.length} questions · ${m.quiz.questionsPerAttempt} drawn per attempt · ${m.quiz.passPercent}% to pass</p>` +
      m.quiz.bank.map(q => question(q, q.id)).join('') + '</article>');
    const keys = sourceKeys(course, m, root);
    if (keys.length) push('<article><h3>Key to source tags used in this module</h3><table class="key"><tbody>' + keys.map(([tag, text]) => `<tr><td class="ans">${tag}</td><td>${inline(text.replace(/\*\*/g, ''))}</td></tr>`).join('') + '</tbody></table></article>');
    if (m.sources?.length) push('<article><h3>Sources cited in this module</h3><ul class="src">' + m.sources.map(s => `<li>${esc(s.title)} — <a href="${esc(s.url)}">${esc(s.url)}</a></li>`).join('') + '</ul></article>');
    push('</section>');
  });

  push(`<h2 class="part">Part B — Final examination bank</h2><section><p>${final.items.length} questions. Each form draws ${final.questionCount}: ` +
    course.modules.map((m, n) => `${final.moduleQuotas[m.id]} from Module ${n + 1}`).join(', ') + '.</p>');
  course.modules.forEach((m, n) => {
    push(`<h3>Module ${n + 1}: ${esc(m.title)}</h3>`);
    for (const item of final.items.filter(x => x.moduleId === m.id)) push(`<div class="q"><p class="objective">Objective: ${inline(item.objective)}</p>${question(item, item.id)}</div>`);
  });
  push('</section>');

  const letter = (q) => { const at = q.options.findIndex(o => o.id === q.correctChoice); if (at < 0) throw new Error('missing_key:' + q.id); return String.fromCharCode(65 + at); };
  push('<h2 class="part">Part C — Answer keys</h2><section><h3>Lesson checks and module quizzes</h3>');
  course.modules.forEach((m, n) => {
    push(`<h4>Module ${n + 1}: ${esc(m.title)}</h4><table class="key"><thead><tr><th>Question</th><th>Answer</th><th>Rationale</th></tr></thead><tbody>` +
      [...formative.values()].filter(q => q.moduleId === m.id).map(q => `<tr><td>${esc(q.id)}${q.lessonOnly ? `<br><span class="meta">lesson ${esc(q.lessonOnly)} only</span>` : ''}</td><td class="ans">${letter(q)}</td><td>${inline(q.rationale || '')}</td></tr>`).join('') + '</tbody></table>');
  });
  push('<h3>Final examination</h3>');
  course.modules.forEach((m, n) => {
    push(`<h4>Module ${n + 1}: ${esc(m.title)}</h4><table class="key"><thead><tr><th>Question</th><th>Answer</th><th>Rationale and source</th></tr></thead><tbody>` +
      final.items.filter(x => x.moduleId === m.id).map(q => `<tr><td>${esc(q.id)}</td><td class="ans">${letter(q)}</td><td>${inline(q.rationale)}` +
        `<br><span class="meta">Why the others are wrong: ${Object.entries(q.distractorRationales || {}).map(([id, why]) => `${String.fromCharCode(65 + q.options.findIndex(o => o.id === id))} — ${inline(why)}`).join(' ')}</span>` +
        `<br><span class="meta">Source: ${(q.sourceRefs || []).map(r => `${inline(r.locator)} (<a href="${esc(r.url)}">${esc(r.url)}</a>)`).join('; ')}</span>` +
        `<br><span class="meta">Remediation lessons: ${esc((q.remediation?.unitIds || []).join(', '))}</span></td></tr>`).join('') + '</tbody></table>');
  });
  push('</section>');

  const page = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>StateCourse — 8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education — Course Content</title><style>
@page{size:Letter;margin:0.8in 0.75in}
body{font:10.5pt/1.5 Georgia,'Times New Roman',serif;color:#111;max-width:7.2in;margin:0 auto}
h1{font:700 24pt/1.2 Helvetica,Arial,sans-serif;margin:.2in 0}h2,h3,h4,h5,h6{font-family:Helvetica,Arial,sans-serif;line-height:1.25;break-after:avoid}
h2{font-size:16pt;border-bottom:2px solid #111;padding-bottom:4px}h2.part,section.module{break-before:page}h3{font-size:13pt;margin-top:.3in}h4{font-size:11.5pt}h5,h6{font-size:10.5pt}
.cover{break-after:page}.kicker,.meta,.label,.objective{font:9pt Helvetica,Arial,sans-serif;color:#444}.label{font-weight:700;text-transform:uppercase;letter-spacing:.04em}
table{border-collapse:collapse;width:100%;margin:.12in 0;font-size:9.5pt}th,td{border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:left}th{background:#eee;font-family:Helvetica,Arial,sans-serif}
tr{break-inside:avoid}.facts th{width:30%}.sum td{font-weight:700}.mono,code{font:8.5pt Menlo,Consolas,monospace;word-break:break-all}.ans{font-weight:700;text-align:center;width:.6in}
.q{break-inside:avoid;margin:.12in 0}.opts{list-style:upper-alpha;margin:.04in 0 0 .1in}.check{border:1px solid #999;padding:2px 10px;margin:.15in 0;break-inside:avoid}
blockquote{border-left:3px solid #999;margin:.1in 0;padding-left:.15in}.notice{border:1px solid #111;padding:8px 10px}.src{font-size:9pt;word-break:break-all}a{color:#111}
</style></head><body>${html.join('\n')}</body></html>`;
  return { page, totals, passCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), directory = path.join(root, '.local-export', 'nmls');
  const { page, totals, passCount } = buildNmlsCourseContent();
  fs.mkdirSync(directory, { recursive: true });
  const htmlFile = path.join(directory, `StateCourse_${APPLICATION_ID}_Course_Content.html`);
  fs.writeFileSync(htmlFile, page);
  console.log(JSON.stringify({ ...totals, passCount }));
  console.log(htmlFile);
  if (process.argv.includes('--pdf')) {
    // Playwright is not a project dependency; resolve a machine-wide install when present.
    const { createRequire } = await import('node:module');
    const { chromium } = createRequire(import.meta.url)(createRequire(import.meta.url).resolve('playwright', { paths: [root, ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)] }));
    const browser = await chromium.launch(), tab = await browser.newPage();
    await tab.goto('file://' + htmlFile);
    const pdfFile = htmlFile.replace(/\.html$/, '.pdf');
    await tab.pdf({ path: pdfFile, format: 'Letter', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="font:8pt Helvetica;width:100%;text-align:center;color:#555">StateCourse LLC · App ID 109386 · Confidential — contains answer keys · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '0.8in', bottom: '0.8in', left: '0.75in', right: '0.75in' } });
    await browser.close();
    console.log(pdfFile);
  }
}
