import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nmlsOfficialEvidence } from '../netlify/functions/_lib/nmls-official-evidence.mjs';
import { buildNmlsReadiness } from '../netlify/functions/_lib/nmls-readiness.mjs';

const substitute=(match,change)=>(path)=>{
  const bytes=fs.readFileSync(path);return match(path)?change(bytes):bytes;
};
test('official archive verifies all19 raw HTML hashes while retaining two explicit missing PDF originals',()=>{
  const result=nmlsOfficialEvidence();
  assert.equal(result.available,true);assert.equal(result.expectedHtmlCount,19);assert.equal(result.retainedHtmlCount,19);
  assert.equal(result.aiReviewedHtmlCount,19);assert.equal(result.aiBodyReviewComplete,true);
  assert.equal(result.unresolvedOriginalCount,2);assert.equal(result.allOriginalsRetained,false);
  assert.deepEqual(result.unresolvedArtifacts.map(s=>s.id),['ROCS-V4','ROCS-FAQ']);
  assert.equal(result.humanReviewed,false);assert.equal(result.legalSignoff,false);assert.equal(result.operationalAuthorityCreated,false);
  assert.ok(result.sources.every(s=>s.status==='original_html_verified'&&s.aiBodyReviewed&&!s.humanReviewed));
  assert.ok([...result.sources,...result.unresolvedArtifacts].every(s=>new URL(s.url).hostname==='mortgage.nationwidelicensingsystem.org'));
  assert.doesNotMatch(JSON.stringify(result),/DOCTYPE|<html|derivedRequirement|originalFile|registerSha256|manifestSha256|"runtime"|"answers"/);
});
test('one changed original invalidates that source and the all-body review without losing the other18',()=>{
  const result=nmlsOfficialEvidence({read:substitute(p=>/\/INDEX\.[a-f0-9]+\.html$/.test(p),b=>Buffer.concat([b,Buffer.from('changed')]))});
  assert.equal(result.available,true);assert.equal(result.retainedHtmlCount,18);assert.equal(result.aiReviewedHtmlCount,18);
  assert.equal(result.aiBodyReviewComplete,false);assert.equal(result.sources.find(s=>s.id==='INDEX').status,'original_html_unverified');
  assert.equal(result.reason,'nmls_official_html_incomplete');
});
test('a missing original never yields a verified source or silently removes it from the denominator',()=>{
  const result=nmlsOfficialEvidence({read:substitute(p=>/\/FINAL\.[a-f0-9]+\.html$/.test(p),()=>{throw Error('missing SECRET');})});
  assert.equal(result.expectedHtmlCount,19);assert.equal(result.retainedHtmlCount,18);assert.equal(result.unresolvedOriginalCount,2);
  assert.doesNotMatch(JSON.stringify(result),/SECRET/);
});
test('modified manifest or source-register bytes fail closed rather than accepting self-authored evidence',()=>{
  for(const suffix of ['/manifest.json','/source-register.json']){
    const result=nmlsOfficialEvidence({read:substitute(p=>p.endsWith(suffix),b=>Buffer.concat([b,Buffer.from(' ')]))});
    assert.equal(result.available,false);assert.equal(result.retainedHtmlCount,null);assert.equal(result.unresolvedOriginalCount,null);
    assert.equal(result.allOriginalsRetained,false);assert.deepEqual(result.sources,[]);
  }
});
test('absent AI review preserves proven retention but does not invent body comparison',()=>{
  const result=nmlsOfficialEvidence({read:substitute(p=>p.endsWith('/ai-body-review.json'),()=>{throw Error('absent');})});
  assert.equal(result.retainedHtmlCount,19);assert.equal(result.aiReviewedHtmlCount,0);assert.equal(result.aiBodyReviewComplete,false);
  assert.ok(result.sources.every(s=>!s.aiBodyReviewed));
});
test('AI review cannot turn itself into human signoff or attach to a different acquisition',()=>{
  for(const patch of [{humanReviewed:true},{legalSignoff:true},{operationalAuthorityCreated:true},{manifestSha256:'0'.repeat(64)},
    {registerSha256:'0'.repeat(64)},{reviewerKind:'human'},{sourceIds:['INDEX']}]){
    const result=nmlsOfficialEvidence({read:substitute(p=>p.endsWith('/ai-body-review.json'),b=>Buffer.from(JSON.stringify({...JSON.parse(b),...patch})))});
    assert.equal(result.retainedHtmlCount,19);assert.equal(result.aiBodyReviewComplete,false);assert.equal(result.aiReviewedHtmlCount,0);
    assert.equal(result.humanReviewed,false);assert.equal(result.legalSignoff,false);
  }
});
test('missing bundle reports unverified archive and no raw filesystem details',()=>{
  const result=nmlsOfficialEvidence({read:()=>{throw Error('/private/SECRET/path');}});
  assert.equal(result.available,false);assert.equal(result.retainedHtmlCount,null);assert.equal(result.aiReviewedHtmlCount,null);
  assert.doesNotMatch(JSON.stringify(result),/SECRET|private/);
});
test('existing readiness separates retained HTML, missing ROCS PDFs and human-review blockers',()=>{
  const data={inventory:{rows:[],publicAvailable:true},datasets:{}};
  const result=buildNmlsReadiness(data);
  assert.equal(result.officialEvidence.retainedHtmlCount,19);
  assert.ok(result.findings.some(f=>f.code==='nmls_rocs_originals_missing'));
  assert.ok(result.findings.some(f=>f.code==='nmls_human_review_pending'));
  assert.ok(!result.findings.some(f=>f.code==='nmls_official_evidence_unverified'));
  const unavailable=buildNmlsReadiness(data,undefined,{available:false});
  assert.ok(unavailable.findings.some(f=>f.code==='nmls_official_evidence_unverified'));
  assert.equal(unavailable.creditIssuanceAllowed,false);assert.equal(unavailable.livePaymentsActivated,false);
});
