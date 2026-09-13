import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Server-only original-source verification. Included files stay outside public/.
// A new acquisition must be deliberately reviewed and pinned here; picking the
// newest arbitrary JSON file could silently replace the regulatory evidence.
export const NMLS_EVIDENCE_PATH='nmls/evidence/2026-09-13';
export const NMLS_EVIDENCE_RUN='2026-09-13T09-49-48-993Z-5f1d5dc2-b86c-4b0b-9b61-67e7a849776b';
const manifestPin='1b104faae63a426eeff6b0d346a5ef8b63f4145d09ef64b6fdd4c4eaba897be0';
const ids=['INDEX','SAFE','STATE-APPROVAL','PROVIDER','COURSE','SUCCESSIVE','STATE-HUB','CE-FAQ','FINAL','QUIZZES','OSS-DESIGN','OSS-TIME','IDENTITY','ROCS-REQUIREMENT','BANKING','RETENTION','CERTIFICATE','MARKETING','ANNUAL-2026'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const orderedSame=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const officialUrl=value=>{
  try {const url=new URL(value);return url.protocol==='https:'&&url.hostname==='mortgage.nationwidelicensingsystem.org'&&!url.username&&!url.password&&!url.port?url.href:null;}
  catch{return null;}
};
const text=html=>html.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();

export function nmlsOfficialEvidence({read=readFileSync,root=process.cwd()}={}) {
  const file=relative=>read(resolve(root,NMLS_EVIDENCE_PATH,relative));
  const unavailable=()=>({available:false,checkedOn:null,expectedHtmlCount:19,retainedHtmlCount:null,aiReviewedHtmlCount:null,
    unresolvedOriginalCount:null,allOriginalsRetained:false,aiBodyReviewComplete:false,humanReviewed:false,legalSignoff:false,
    operationalAuthorityCreated:false,sources:[],unresolvedArtifacts:[],reason:'nmls_official_evidence_unverified'});
  try {
    const registerBytes=file('source-register.json'),manifestBytes=file(`acquisitions/${NMLS_EVIDENCE_RUN}/manifest.json`);
    const register=JSON.parse(registerBytes),manifest=JSON.parse(manifestBytes);
    if(sha(manifestBytes)!==manifestPin||sha(registerBytes)!==manifest.registerSha256||
      register.schema!=='statecourse-nmls-official-evidence-register-v1'||manifest.schema!=='statecourse-nmls-source-acquisition-v1'||
      manifest.runId!==NMLS_EVIDENCE_RUN||!orderedSame(register.sources?.map(s=>s.id),ids)||!orderedSame(manifest.results?.map(s=>s.id),ids)||
      !orderedSame(register.unresolvedArtifacts?.map(s=>s.id),['ROCS-V4','ROCS-FAQ']))return unavailable();
    let aiReviewValid=false;
    try {
      const review=JSON.parse(file('ai-body-review.json'));
      aiReviewValid=review.schema==='statecourse-nmls-ai-body-review-v1'&&review.reviewerKind==='AI desk review'&&
        review.manifestSha256===manifestPin&&review.registerSha256===manifest.registerSha256&&orderedSame(review.sourceIds,ids)&&
        review.humanReviewed===false&&review.legalSignoff===false&&review.operationalAuthorityCreated===false;
    }catch{/* Retention can be verified without inventing a review. */}
    const sources=register.sources.map((source,index)=>{
      const receipt=manifest.results[index],url=officialUrl(source.url);let retained=false;
      try {
        if(!url||receipt.requestedUrl!==url||receipt.finalUrl!==url||receipt.status!=='original_html_response_body_retained'||
          receipt.httpStatus!==200||receipt.contentType!=='text/html'||!Number.isSafeInteger(receipt.bytes)||receipt.bytes<1||
          !/^[a-f0-9]{64}$/.test(receipt.sha256)||receipt.file!==`${source.id}.${receipt.sha256}.html`)throw Error('invalid_receipt');
        const bytes=file(`acquisitions/${NMLS_EVIDENCE_RUN}/${receipt.file}`),html=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
        const headings=[...html.matchAll(/<(h1|title)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>text(m[2]));
        retained=bytes.length===receipt.bytes&&sha(bytes)===receipt.sha256&&text(html).includes(source.expectedMarker)&&headings.some(h=>h.includes(source.expectedHeading));
      }catch{/* A missing or changed body is not a retained source. */}
      return {id:source.id,title:source.title,url,status:retained?'original_html_verified':'original_html_unverified',
        aiBodyReviewed:retained&&aiReviewValid,humanReviewed:false,legalSignoff:false};
    });
    const unresolvedArtifacts=register.unresolvedArtifacts.map(source=>({id:source.id,url:officialUrl(source.url),format:'pdf',status:'original_not_retained',humanReviewed:false}));
    const retainedHtmlCount=sources.filter(source=>source.status==='original_html_verified').length;
    return {available:true,checkedOn:register.checkedOn,expectedHtmlCount:ids.length,retainedHtmlCount,
      aiReviewedHtmlCount:sources.filter(source=>source.aiBodyReviewed).length,unresolvedOriginalCount:unresolvedArtifacts.length,
      allOriginalsRetained:false,aiBodyReviewComplete:aiReviewValid&&retainedHtmlCount===ids.length,
      humanReviewed:false,legalSignoff:false,operationalAuthorityCreated:false,sources,unresolvedArtifacts,
      reason:retainedHtmlCount===ids.length?'rocs_original_pdfs_missing':'nmls_official_html_incomplete'};
  }catch{return unavailable();}
}
