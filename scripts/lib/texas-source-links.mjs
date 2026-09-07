/** Node-only audit support. Never return exported assessment data, field paths, or keys. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export const decodeHtml = text => String(text).replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
  const value = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
  return value <= 0x10ffff ? String.fromCodePoint(value) : '';
}).replace(/&apos;/gi, "'").replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();

export function urlsInText(text) {
  return [...String(text).matchAll(/https:\/\/[^\s<>"'`\\)\]]+/g)].map(match => {
    try { return new URL(decodeHtml(match[0].replace(/[.,;]+$/, ''))).href; }
    catch { return null; }
  }).filter(Boolean);
}

/** Only inspect concrete values. Never call factories or getters while collecting. */
export function exportedUrls(value, seen = new WeakSet(), urls = new Set()) {
  if (typeof value === 'string') { for (const url of urlsInText(value)) urls.add(url); return urls; }
  if (!value || typeof value !== 'object' || seen.has(value)) return urls;
  seen.add(value);
  if (value instanceof URL) { if (value.protocol === 'https:') urls.add(value.href); return urls; }
  if (value instanceof Map) for (const [key, entry] of value) { exportedUrls(key, seen, urls); exportedUrls(entry, seen, urls); }
  else if (value instanceof Set) for (const entry of value) exportedUrls(entry, seen, urls);
  else for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
    if ('value' in descriptor) exportedUrls(descriptor.value, seen, urls);
  }
  return urls;
}

/** Uses the repository's existing TypeScript parser, not regex over JS string literals. */
export function staticRelativeImports(source, parserRoot = process.cwd()) {
  const ts = createRequire(path.join(parserRoot, 'package.json'))('typescript');
  const parsed = ts.createSourceFile('audit-input.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (parsed.parseDiagnostics.length) throw new Error('Cannot parse a source-audit module');
  return parsed.statements.flatMap(statement => {
    if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))) return [];
    const specifier = statement.moduleSpecifier;
    return specifier && ts.isStringLiteral(specifier) && /^\.{1,2}\//.test(specifier.text) ? [specifier.text] : [];
  });
}

/** Trace static relative imports/reexports solely for input hashes; do not scrape their JS. */
export function traceModuleInputs({root, entries, parserRoot = root}) {
  const base = fs.realpathSync(root), visited = new Set(), inputs = [];
  const visit = file => {
    const absolute = fs.realpathSync(path.resolve(base, file));
    if (!absolute.startsWith(base + path.sep)) throw new Error('Source-audit import escapes the selected checkout');
    if (visited.has(absolute)) return;
    visited.add(absolute);
    const bytes = fs.readFileSync(absolute);
    inputs.push({path: path.relative(base, absolute).split(path.sep).join('/'), sha256: sha(bytes)});
    for (const relative of staticRelativeImports(bytes.toString(), parserRoot)) visit(path.resolve(path.dirname(absolute), relative));
  };
  for (const entry of entries) visit(entry);
  return inputs.sort((a, b) => a.path.localeCompare(b.path));
}

export function selectedAuditModules(course, exists) {
  const required = ['outlinePath', 'coursePath', 'questionBankPath', 'scenarioPath', 'finalBankPath', 'finalFormsPath'];
  const entries = required.map(key => {
    if (!course[key] || !exists(course[key])) throw new Error(`Missing source-audit input: ${key}`);
    return course[key];
  });
  if (course.misconceptionPath && exists(course.misconceptionPath)) entries.push(course.misconceptionPath);
  return [...new Set(entries)];
}

export async function collectCourseReferences({root, courses, parserRoot = root, load = file => import(pathToFileURL(file).href)}) {
  const references = new Map(), inputMap = new Map();
  const add = (url, file) => {
    const parsed = new URL(url), fragment = parsed.hash.slice(1); parsed.hash = '';
    if (!references.has(parsed.href)) references.set(parsed.href, {files: new Set(), fragments: new Set()});
    const row = references.get(parsed.href); row.files.add(file); if (fragment) row.fragments.add(fragment);
  };
  for (const course of courses) {
    const entries = selectedAuditModules(course, file => fs.existsSync(path.join(root, file)));
    for (const input of traceModuleInputs({root, entries, parserRoot})) inputMap.set(input.path, input);
    // Root exports contain the source-factory results and protected source overrides.
    // Dependency source text is only hashed; unused URL prefixes cannot become references.
    for (const file of entries) {
      let namespace;
      try { namespace = await load(path.join(root, file)); }
      catch { throw new Error(`Cannot import selected source-audit input: ${file}`); }
      for (const url of exportedUrls(namespace)) add(url, file);
    }
    const directory = path.join(root, course.curriculumDir);
    const files = fs.readdirSync(directory).filter(file => /^module-\d+\.md$/.test(file)).sort();
    if (!files.length) throw new Error('Missing full curriculum for source audit');
    for (const name of files) {
      const file = `${course.curriculumDir}/${name}`, bytes = fs.readFileSync(path.join(root, file));
      inputMap.set(file, {path: file, sha256: sha(bytes)});
      for (const url of urlsInText(bytes.toString())) add(url, file);
    }
  }
  const inputs = [...inputMap.values()].sort((a, b) => a.path.localeCompare(b.path));
  return {references, inputs, inputSha256: sha(JSON.stringify(inputs))};
}

function roman(number) {
  let result = '';
  for (const [value, symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]) {
    while (number >= value) { result += symbol; number -= value; }
  }
  return result;
}

/** HTML identity only. PDF signatures/text extraction stay the caller's separate concern. */
export function statutoryHtmlIssues(url, html, fragments = []) {
  const parsed = new URL(url);
  if (!/^(?:tcss\.legis\.texas\.gov|statutes\.capitol\.texas\.gov)$/i.test(parsed.hostname)) return [];
  const match = parsed.pathname.match(/\/(?:Docs|resources)\/([a-z]+)\/htm\/([a-z]+)\.(\d+)\.htm$/i);
  if (!match) return [];
  const issues = [], code = match[1].toUpperCase(), number = Number(match[3]);
  if (code !== match[2].toUpperCase()) issues.push('STATUTORY_PATH_CODE_MISMATCH');
  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const body = decodeHtml(html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' '));
  const expected = code === 'CN' ? `ARTICLE\\s+(?:${number}|${roman(number)})(?=\\b)` : `CHAPTER\\s+${number}(?=\\b)`;
  const identity = new RegExp(expected, 'i');
  if (!identity.test(title) || !identity.test(body)) issues.push(code === 'CN' ? 'EXPECTED_CONSTITUTION_ARTICLE_MISSING' : 'EXPECTED_STATUTORY_CHAPTER_MISSING');
  const anchors = new Set([...html.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)].map(m => decodeHtml(m[1] ?? m[2] ?? m[3])));
  const requested = new Set([...fragments, ...(parsed.hash ? [parsed.hash.slice(1)] : [])]);
  for (const fragment of requested) {
    let key; try { key = decodeURIComponent(fragment); } catch { issues.push('INVALID_FRAGMENT_ENCODING'); continue; }
    if (!anchors.has(key)) issues.push(`ANCHOR_NOT_FOUND:${key}`);
  }
  return issues;
}
