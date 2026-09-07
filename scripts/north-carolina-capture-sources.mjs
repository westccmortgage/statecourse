#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NC_SOURCES } from '../config/north-carolina/regulatory-manifest.mjs';
const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = 'north-carolina/regulatory/captures/2026-09-06';
await mkdir(join(root, directory), { recursive: true });
const python = process.env.NC_PYTHON || 'python3';
const jobs = [...new Set(NC_SOURCES.filter(s => new URL(s.url).pathname.endsWith('.pdf')).map(s => s.url))];
const results = [];
async function capture(url) {
  const sources = NC_SOURCES.filter(s => s.url === url);
  const stem = sources[0].id.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const relative = `${directory}/${stem}.pdf`;
  const output = join(root, relative);
  const row = { sourceIds: sources.map(s => s.id), requestedUrl: url, attemptedAt: new Date().toISOString(), status: 'RETRIEVAL_FAILED', snapshotPath: null, sha256: null, pdfReview: { status: 'NOT_REVIEWED', pages: [], ocrStatus: 'NOT_APPLICABLE_UNLESS_TEXT_DISPUTED' } };
  try {
    const { stdout } = await exec('curl', ['--silent','--show-error','--location','--max-redirs','5','--connect-timeout','8','--max-time','18','--proto','=https','--proto-redir','=https','--output',output,'--write-out','%{json}',url], { maxBuffer: 1024 * 1024 });
    const info = JSON.parse(stdout);
    row.httpStatus = info.http_code; row.finalUrl = info.url_effective; row.contentType = info.content_type;
    const bytes = await readFile(output);
    row.receivedBytes = bytes.length;
    row.responseSha256 = createHash('sha256').update(bytes).digest('hex');
    if (info.http_code !== 200) { row.failure = `HTTP ${info.http_code}`; await unlink(output); return row; }
    if (bytes.subarray(0,5).toString() !== '%PDF-' || !/^application\/pdf(?:;|$)/i.test(info.content_type || '')) { row.status = 'IDENTITY_FAILED'; row.failure = 'Expected PDF magic and application/pdf; rejected possible error/soft-404 page'; await unlink(output); return row; }
    const { stdout: extracted } = await exec(python, ['-c', 'import json,sys; from pypdf import PdfReader; r=PdfReader(sys.argv[1]); print(json.dumps({"pages":len(r.pages),"metadata":{str(k):str(v) for k,v in (r.metadata or {}).items()},"pageText":[p.extract_text() or "" for p in r.pages]}))', output], {maxBuffer: 16 * 1024 * 1024});
    const pdf = JSON.parse(extracted);
    row.snapshotPath = relative; row.sha256 = row.responseSha256; row.status = 'CAPTURED_UNREVIEWED'; row.pdfPages = pdf.pages; row.pdfMetadata = pdf.metadata;
    row.textPath = relative.replace(/\.pdf$/, '.text.json');
    await writeFile(join(root, row.textPath), JSON.stringify(pdf.pageText, null, 2) + '\n');
    row.textSha256 = createHash('sha256').update(await readFile(join(root, row.textPath))).digest('hex');
  } catch (error) {
    row.failure = (error.stderr || error.message).trim().slice(0, 900);
    try { await unlink(output); } catch {}
  }
  return row;
}
let next = 0;
await Promise.all(Array.from({length: 4}, async () => { while(next < jobs.length) { const url = jobs[next++]; const row = await capture(url); results.push(row); console.log(`${row.sourceIds.join(',')}: ${row.status} ${row.failure || `${row.pdfPages} PDF pages`}`); } }));
results.sort((a,b) => a.sourceIds[0].localeCompare(b.sourceIds[0]));
await writeFile(join(root, directory, 'capture-log.json'), JSON.stringify({ controlDate:'2026-09-06', generatedAt:new Date().toISOString(), uniquePdfUrls:jobs.length, entries:results }, null, 2) + '\n');
console.log(`Retained ${results.filter(r => r.snapshotPath).length}/${jobs.length} unique official PDF responses; no visual review is inferred from retrieval.`);
