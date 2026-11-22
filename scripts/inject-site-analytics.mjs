// Adds visit counting to the built public pages. Run by site/build.sh on dist/ only; the
// source pages are not changed, so a page cannot ship with a stale or duplicated tag.
//
// Counted: every public page, and the four account pages a visitor passes through on the
// way in (sign-in, register, My StateCourse, free practice), so the report can show how
// many visitors from each source go on to open an account.
// Never counted: course lessons, quizzes, examinations, the administration console and
// staff pages. Nothing is loaded there.
import fs from 'node:fs';
import path from 'node:path';

const ACCOUNT_PAGES = new Set(['student/index.html', 'student/sign-in/index.html', 'student/register/index.html', 'student/free-training/index.html']);
export function countsVisits(relative) {
  const file = relative.split(path.sep).join('/');
  if (!file.endsWith('.html')) return false;
  if (/^(admin|staff|content)\//.test(file) || file === 'student-course.html') return false;
  return file.startsWith('student/') ? ACCOUNT_PAGES.has(file) : true;
}
export const pagePath = relative => '/' + relative.split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');

const MARK = '<!-- site-visits -->';
export function injectInto(html, relative) {
  if (html.includes(MARK) || !/<\/head>/i.test(html) || !/<\/body>/i.test(html)) return html;
  const head = `${MARK}<link rel="stylesheet" href="/analytics.css"/><script src="/analytics.js" defer></script>`;
  // For clients that do not run scripts: one invisible image request records the visit.
  const pixel = `<noscript><img src="/api/collect?p=${encodeURIComponent(pagePath(relative))}" width="1" height="1" alt=""/></noscript>`;
  return html.replace(/<\/head>/i, `${head}</head>`).replace(/<\/body>/i, `${pixel}</body>`);
}

function walk(directory, base = directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, base, found); else found.push(path.relative(base, full));
  }
  return found;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const root = path.resolve(process.argv[2] || 'dist');
  let changed = 0, skipped = 0;
  for (const relative of walk(root)) {
    if (!relative.endsWith('.html')) continue;
    if (!countsVisits(relative)) { skipped++; continue; }
    const file = path.join(root, relative), before = fs.readFileSync(file, 'utf8'), after = injectInto(before, relative);
    if (after !== before) { fs.writeFileSync(file, after); changed++; }
  }
  if (!changed) throw new Error('No page received visit counting; check the build output.');
  console.log(`Visit counting added to ${changed} pages; ${skipped} private pages left untouched.`);
}
