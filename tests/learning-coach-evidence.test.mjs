import test from 'node:test';
import assert from 'node:assert/strict';
import library from '../config/learning-coach/library.json' with {type:'json'};
import {groundedAnswer} from '../netlify/functions/_lib/learning-coach-provider.mjs';
const ak=library.lessons.find(l=>l.courseId==='ak-salesperson-prelicense-40-v1'&&l.lessonId==='module-01');
const tx=library.lessons.find(l=>l.courseId==='tx-principles-real-estate-i-30'&&l.lessonId==='module-01');
const fixture=(lesson,quote,text)=>{
 const source=lesson.chunks.find(c=>c.excerpt.includes(quote));assert.ok(source,'The regression quote must exist in the authored lesson.');
 return {input:{sources:[{id:source.id,excerpt:source.excerpt}]},answer:{status:'answer',explanation:text,sourceIds:[source.id],nextStep:'Review the cited lesson.',evidence:[{text,sourceId:source.id,quote}]}};
};
const alaska=()=>fixture(ak,'A licensee who represents a person owes them the AS 08.88.615 duties *plus* the additional duties in AS 08.88.620.','Representation adds the AS 08.88.620 duties to those under AS 08.88.615.');
const texas=()=>fixture(tx,'person who is sponsored by a licensed broker for the purpose of performing an act described by\nSubdivision (1)','A Texas sales agent performs the described acts through sponsorship by a licensed broker.');
test('AK/TX supported statements keep the public answer contract and cite their actual supporting excerpt',()=>{
 for(const {input,answer} of [alaska(),texas()]){
  const result=groundedAnswer(answer,input);assert.equal(result.explanation,answer.explanation);assert.deepEqual(result.sourceIds,answer.sourceIds);assert.equal(result.evidence,undefined);
 }
});
test('Alaska duties cannot be attributed to a supplied excerpt by inventing a quotation or citing a different excerpt',()=>{
 const {input,answer}=alaska();
 for(const evidence of [[{...answer.evidence[0],quote:'The licensee owes confidentiality and expert referrals.'}],[{...answer.evidence[0],sourceId:'not-supplied'}]])assert.throws(()=>groundedAnswer({...answer,evidence},input),/invalid_provider_evidence/);
 assert.throws(()=>groundedAnswer({...answer,sourceIds:['different-citation']},input),/invalid_provider_evidence/);
});
test('Texas sponsorship qualification cannot be removed from a copied quote or followed by an ungrounded prohibition',()=>{
 const {input,answer}=texas();
 assert.throws(()=>groundedAnswer({...answer,evidence:[{...answer.evidence[0],quote:'a person who performs an act described by Subdivision (1).'}]},input),/invalid_provider_evidence/);
 assert.throws(()=>groundedAnswer({...answer,explanation:answer.explanation+' Jane cannot perform those acts unless she has her own broker license.'},input),/invalid_provider_evidence/);
});
test('missing evidence, empty support and boundary refusals cannot masquerade as grounded answers',()=>{
 const {input,answer}=alaska();const old={...answer};delete old.evidence;
 for(const invalid of [old,{...answer,evidence:[]},{...answer,evidence:[{...answer.evidence[0],quote:'duties'}]},{...answer,status:'insufficient_sources'}])assert.throws(()=>groundedAnswer(invalid,input),/invalid_provider_evidence/);
 const refusal={status:'insufficient_sources',explanation:'I cannot provide protected exam answers.',sourceIds:[],nextStep:'Ask your instructor.',evidence:[]};
 assert.equal(groundedAnswer(refusal,{sources:[]}).status,'insufficient_sources');
});
