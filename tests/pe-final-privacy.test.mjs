import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import candidate from '../config/nmls/pe-final/bank-candidate.json' with {type:'json'};
import {definePeFinalBank,peFinalCandidateDigest} from '../lib/nmls-pe-final-domain.mjs';
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
test('AI review sidecar is hash-bound and cannot assert human or regulatory approval',()=>{
 assert.equal(definePeFinalBank({...candidate,sourceReviewComplete:true}).sourceReviewComplete,false);
 const review={kind:'independent_ai_source_math_review',status:'passed',candidateContentDigest:peFinalCandidateDigest(candidate),evidenceSha256:'0'.repeat(64),holds:[],humanSmeApproved:false,regulatoryApproved:false};
 const bank=definePeFinalBank(candidate,{review});assert.equal(bank.sourceReviewComplete,true);assert.equal(bank.humanReviewed,false);assert.equal(bank.creditEligible,false);assert.equal(bank.certificateEligible,false);assert.equal(bank.bankingEligible,false);
 for(const patch of [{candidateContentDigest:'0'.repeat(64)},{humanSmeApproved:true},{regulatoryApproved:true},{holds:['unresolved source issue']}])assert.throws(()=>definePeFinalBank(candidate,{review:{...review,...patch}}),/review_mismatch/);
});
test('static learner artifacts contain no protected PE bank IDs, stems or key fields',async()=>{
 const root=new URL('../public/statecourse/',import.meta.url);let files=0;
 const visit=async directory=>{for(const entry of await fs.readdir(directory,{withFileTypes:true})){const target=new URL(entry.name+(entry.isDirectory()?'/':''),directory);if(entry.isDirectory()){await visit(target);continue;}files++;const bytes=await fs.readFile(target);const raw=bytes.toString('utf8'),normalized=normalize(raw);for(const item of candidate.items){assert.equal(raw.includes(item.id),false,`${target.pathname}: protected ID ${item.id}`);assert.equal(normalized.includes(normalize(item.stem)),false,`${target.pathname}: protected stem ${item.id}`);}assert.equal(raw.includes('"correctChoice"'),false,target.pathname);}};
 await visit(root);assert.ok(files>0);
 const html=await fs.readFile(new URL('../public/statecourse/student/pe-final/index.html',import.meta.url),'utf8');
 assert.match(html,/src="\/staff\/action-proof.js"/);
 const loader=await fs.readFile(new URL('../netlify/functions/_lib/nmls-pe-final-http.mjs',import.meta.url),'utf8');assert.match(loader,/STATECOURSE_PE_FINAL_ENABLED/);assert.match(loader,/STATECOURSE_PE_COURSE_ENABLED/);
 assert.equal(path.basename(new URL('../config/nmls/pe-final/bank-candidate.json',import.meta.url).pathname),'bank-candidate.json');
});
test('checked-in AI review evidence matches the exact bank and preserves release limitations',async()=>{
 const {createHash}=await import('node:crypto');const digest=b=>createHash('sha256').update(b).digest('hex');
 const root=new URL('../config/nmls/pe-final/',import.meta.url);const review=JSON.parse(await fs.readFile(new URL('source-review.json',root),'utf8'));
 const raw=await fs.readFile(new URL('bank-candidate.json',root));assert.equal(digest(raw),review.candidateFileSha256);
 const evidence=await fs.readFile(new URL(review.evidenceFile,root));assert.equal(digest(evidence),review.evidenceSha256);const packet=JSON.parse(evidence);
 assert.equal(packet.bankFileSha256,review.candidateFileSha256);assert.equal(packet.reports.length,2);assert.equal(packet.reports[1].review.reviewedBankSha256,review.candidateFileSha256);assert.deepEqual(packet.reports[1].review.blockingRevisedItemIds,[]);
 const bank=definePeFinalBank(candidate,{review});assert.equal(bank.sourceReviewComplete,true);assert.equal(bank.humanReviewed,false);assert.equal(bank.creditEligible,false);assert.ok(review.limitations.some(s=>s.includes('eCFR')));assert.ok(review.limitations.some(s=>s.includes('Human mortgage SME')));
});
