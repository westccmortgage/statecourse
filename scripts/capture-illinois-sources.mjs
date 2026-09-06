#!/usr/bin/env node
// Captures public official evidence; this does not update approval/readiness status.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const lock = JSON.parse(readFileSync(join(root, 'config/illinois/source-lock.json'), 'utf8'));
const python = process.env.IL_SOURCE_PYTHON || 'python3';
const selected = {
  'IL-CURR-75': ['BROKER 75-HOUR PRE-LICENSE CURRICULUM', 'Applied Real Estate Principles'],
  'IL-CURR-45POST': ['45-HOUR BROKER POST-LICENSE CURRICULUM', 'RISK MANAGEMENT/DISCIPLINE', 'TRANSACTIONAL ISSUES'],
  'IL-CURR-45MB': ['45 Hour Managing Broker Pre-License Courses', '12 Hours - Risk Management'],
  'IL-CURR-END-BROKER': ['30-HOUR', 'ENDORSEMENT', '1,500'],
  'IL-CURR-END-MB': ['30-HOUR', 'ENDORSEMENT', '1,500'],
  'IL-FORM-PROVIDER': ['505-0767', 'Illinois Secretary of State'],
  'IL-FORM-COURSE': ['505-0645', 'Learning Management System'],
  'IL-DATA-FY2024': ['Total Number of Applicants 449 4212', 'Number of Licenses Granted* 421 3972'],
  'IL-DATA-BOARD-202603': ['59,006', '13,898'],
  'IL-ACT-1': ['Licensee', 'licensed under this Act'],
  'IL-RULE-1450': ['No more than 250 questions', 'July 13, 2026'],
  'IL-DRE-HUB': ['45 Hour Managing Broker Pre-License Curriculum', 'Broker 75-Hour Pre-License Curriculum']
};
const norm = text => text.replace(/\s+/g, ' ').toLowerCase();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const captures = [];
const captureFailures = [];
for (const [id, markers] of Object.entries(selected)) {
  const source = lock.sources.find(s => s.id === id);
  if (!source) throw Error(`Missing source ${id}`);
  const response = await fetch(source.url, {signal:AbortSignal.timeout(30000)});
  if (!response.ok) {
    if (source.url.endsWith('.pdf')) throw Error(`${id}: HTTP ${response.status}`);
    captureFailures.push({id,url:source.url,httpStatus:response.status,note:'No byte lock. Official page reviewed with web tool; not represented as a captured source.'});
    console.log(`${id}: HTTP ${response.status}; byte evidence unavailable`);
    continue;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!['idfpr.illinois.gov','www.ilga.gov'].includes(new URL(response.url).hostname)) throw Error(`${id}: unexpected final host`);
  const pdf = bytes.subarray(0,5).toString() === '%PDF-';
  if (source.url.endsWith('.pdf') && (!pdf || !response.headers.get('content-type')?.includes('application/pdf'))) throw Error(`${id}: expected PDF type/signature`);
  const rel = `illinois/regulatory/evidence/${id}.${pdf ? 'pdf' : 'html'}`;
  mkdirSync(join(root, 'illinois/regulatory/evidence'), { recursive: true });
  writeFileSync(join(root, rel), bytes);
  const extraction = spawnSync(python, ['-c', pdf
    ? 'import json,sys; from pypdf import PdfReader; r=PdfReader(sys.argv[1]); print(json.dumps([p.extract_text() or "" for p in r.pages]))'
    : 'import json,sys,re,html; print(json.dumps([html.unescape(re.sub("<[^>]+>"," ",open(sys.argv[1]).read()))]))', join(root, rel)], { encoding: 'utf8', maxBuffer: 10*1024*1024 });
  if (extraction.status !== 0) throw Error(`${id}: ${extraction.stderr}`);
  const pages = JSON.parse(extraction.stdout);
  const text = pages.map((p,i)=>`PAGE ${i+1}\n${p.replace(/[ \t]+$/gm,'').trimEnd()}`).join('\n\f\n')+'\n';
  for (const marker of markers) if (!norm(text).includes(norm(marker))) throw Error(`${id}: content marker absent: ${marker}`);
  const textPath = rel.replace(/\.(pdf|html)$/, '.txt');
  writeFileSync(join(root,textPath),text);
  captures.push({id,url:source.url,finalUrl:response.url,retrievedAt:new Date().toISOString(),httpStatus:response.status,contentType:response.headers.get('content-type'),path:rel,sha256:sha(bytes),byteCount:bytes.length,textPath,textSha256:sha(text),pageCount:pdf ? pages.length : null,contentMarkers:markers});
  console.log(`${id}: ${bytes.length} bytes, ${pdf ? pages.length + ' PDF pages' : 'HTML'}, markers matched`);
}
writeFileSync(join(root,'config/illinois/source-evidence.json'), JSON.stringify({snapshotId:'IL-SOURCE-EVIDENCE-2026-09-06-v2',captures,captureFailures},null,2)+'\n');
