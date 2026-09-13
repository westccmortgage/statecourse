import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Evidence acquisition only. No credentials, login, proxy, alternate host,
// approval flags, runtime writes, prior-PDF retries or redirect workarounds.
// Files are raw decoded HTTP response-body bytes, never regenerated documents.
const root = dirname(fileURLToPath(import.meta.url));
const register = JSON.parse(await readFile(resolve(root, 'source-register.json'), 'utf8'));
const args = process.argv.slice(2);
const acquire = args.includes('--acquire');
const onlyArg = args.find(a => a.startsWith('--only='));
const only = onlyArg?.slice('--only='.length);
if (args.some(a => a !== '--acquire' && a !== '--dry-run' && a !== onlyArg) ||
    only && !register.sources.some(s => s.id === only)) throw Error('invalid_acquisition_arguments');
const selected = register.sources.filter(s => !only || s.id === only);
for (const s of selected) {
  const u = new URL(s.url);
  if (!/^[A-Z][A-Z0-9-]*$/.test(s.id) || u.protocol !== 'https:' ||
      u.hostname !== 'mortgage.nationwidelicensingsystem.org' || u.username || u.password || u.port ||
      s.format !== 'html' || s.acquisitionPolicy !== 'ordinary_get_only') throw Error('source_not_allowlisted');
}
if (!acquire) {
  console.log(JSON.stringify({mode:'dry_run_no_network_no_writes', sources:selected.map(s=>s.id),
    priorDeniedPdfsExcluded:register.unresolvedArtifacts.map(s=>s.id)}, null, 2));
  process.exit(0);
}

const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID();
const runRoot = resolve(root, 'acquisitions', runId);
await mkdir(runRoot, {recursive:true});
const results = [];
let networkStopped = false;
for (const source of selected) {
  const receipt = {id:source.id, requestedUrl:source.url, requestedAt:new Date().toISOString(),
    status:'not_acquired', httpStatus:null, finalUrl:null, contentType:null, bytes:null,
    sha256:null, file:null, humanReviewed:false, legalSignoff:false,
    reviewState:'No original bytes acquired'};
  if (networkStopped) { receipt.reason='not_attempted_after_network_or_access_failure'; results.push(receipt); continue; }
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 15000);
  try {
    // Redirect responses are recorded/refused, not followed silently to a hub,
    // login or another host. A newly observed legitimate URL needs new review.
    const response = await fetch(source.url, {method:'GET', redirect:'manual', signal:abort.signal,
      headers:{accept:'text/html', 'user-agent':'StateCourse-Evidence-Review/1.0'}});
    receipt.httpStatus=response.status; receipt.finalUrl=response.url;
    receipt.contentType=response.headers.get('content-type');
    receipt.lastModified=response.headers.get('last-modified');
    receipt.etag=response.headers.get('etag');
    if (response.status !== 200) {
      receipt.reason='http_status_not_200';
      await response.body?.cancel();
      if ([401,403,429].includes(response.status)) networkStopped=true;
    } else if (!/^text\/html(?:;|$)/i.test(receipt.contentType ?? '')) {
      receipt.reason='unexpected_content_type'; await response.body?.cancel();
    } else {
      const parts=[]; let length=0;
      for await (const part of response.body) {
        length+=part.byteLength;
        if (length>5_000_000) throw Error('source_response_exceeds_limit');
        parts.push(part);
      }
      const bytes=Buffer.concat(parts);
      const normalize=s=>s.replace(/<[^>]*>/g,' ').replace(/&(?:#39|apos);/g,"'")
        .replace(/&(?:#8217|rsquo);/g,"'").replace(/[’‘]/g,"'").replace(/&amp;/g,'&')
        .replace(/\s+/g,' ').trim();
      const html=bytes.toString('utf8'), text=normalize(html);
      // The official index uses its document title instead of an h1. Require
      // an exact expected document marker AND an independently expected title
      // or heading; do not treat any successful 200 response as evidence.
      const headings=[...html.matchAll(/<(h1|title)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>normalize(m[2]));
      // A successful status or a provider homepage is not the requested source.
      if (!text.includes(source.expectedMarker) || !headings.some(h=>h.includes(source.expectedHeading)) ||
          !/<(?:!doctype\s+html|html)\b/i.test(html)) {
        receipt.reason='expected_document_marker_missing';
      } else {
        const sha256=createHash('sha256').update(bytes).digest('hex');
        const file=`${source.id}.${sha256}.html`;
        await writeFile(resolve(runRoot,file),bytes,{flag:'wx'});
        receipt.sha256=sha256; receipt.bytes=bytes.length; receipt.file=file;
        receipt.status='original_html_response_body_retained';
        receipt.reviewState='Raw HTML captured; page/body comparison and human review pending; not PDF verification';
      }
    }
  } catch(error) {
    // Bounded codes only; never print environment values, request headers or
    // arbitrary remote error bodies. Stop rather than retrying a denied network.
    receipt.reason='network_or_stream_failure';
    receipt.errorCode=String(error?.cause?.code ?? error?.name ?? 'UNKNOWN').slice(0,80);
    networkStopped=true;
  } finally { clearTimeout(timeout); receipt.finishedAt=new Date().toISOString(); }
  results.push(receipt);
  console.log(JSON.stringify({id:receipt.id,status:receipt.status,httpStatus:receipt.httpStatus,reason:receipt.reason ?? null}));
}
const manifest={schema:'statecourse-nmls-source-acquisition-v1',runId,createdAt:new Date().toISOString(),
  originalByteDefinition:'Raw decoded HTTP response body returned by fetch; no reformatting or generated content.',
  registerSha256:createHash('sha256').update(await readFile(resolve(root,'source-register.json'))).digest('hex'),
  humanReviewed:false, runtimeAuthorityCreated:false, results};
await writeFile(resolve(runRoot,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({manifest:resolve(runRoot,'manifest.json'),retained:results.filter(r=>r.file).length}));
