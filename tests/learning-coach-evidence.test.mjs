import test from 'node:test';
import assert from 'node:assert/strict';
import library from '../config/learning-coach/library.json' with {type:'json'};
import {groundedAnswer,sourcePassages,providerInput} from '../netlify/functions/_lib/learning-coach-provider.mjs';
const fixture=(course,needle,text)=>{
 const lesson=library.lessons.find(l=>l.courseId===course&&l.lessonId==='module-01');
 const source=lesson.chunks.find(c=>c.excerpt.includes(needle));assert.ok(source);
 const passage=sourcePassages(source).find(p=>p.text.includes(needle));assert.ok(passage);
 return {input:{sources:[{id:source.id,excerpt:source.excerpt}]},answer:{status:'answer',refusal:'',nextStep:'Review the cited lesson.',evidence:[{text,sourceId:source.id,passageId:passage.id}]}};
};
const alaska=()=>fixture('ak-salesperson-prelicense-40-v1','additional duties in AS 08.88.620','Representation adds the AS 08.88.620 duties to those under AS 08.88.615.');
const texas=()=>fixture('tx-principles-real-estate-i-30','sponsored by a licensed broker','A Texas sales agent performs the described acts through sponsorship by a licensed broker.');
test('AK/TX public answers are assembled from statements tied to existing source passages',()=>{
 for(const {input,answer} of [alaska(),texas()]){
  const result=groundedAnswer(answer,input);assert.equal(result.explanation,answer.evidence[0].text);assert.deepEqual(result.sourceIds,[answer.evidence[0].sourceId]);assert.equal(result.evidence,undefined);
 }
});
test('Alaska duties cannot use an invented source or passage, or a model-authored quotation',()=>{
 const {input,answer}=alaska();
 for(const item of [{...answer.evidence[0],sourceId:'not-supplied'},{...answer.evidence[0],passageId:'invented'},{...answer.evidence[0],quote:'Confidentiality and expert referrals.'}])assert.throws(()=>groundedAnswer({...answer,evidence:[item]},input),/invalid_provider_evidence/);
});
test('Texas explanation cannot append a prohibition outside the supported statement contract',()=>{
 const {input,answer}=texas();assert.throws(()=>groundedAnswer({...answer,explanation:'Jane cannot perform those acts unless she has her own broker license.'},input),/invalid_provider_evidence/);
});
test('missing evidence and boundary refusals cannot masquerade as supported answers',()=>{
 const {input,answer}=alaska();const old={...answer};delete old.evidence;
 for(const invalid of [old,{...answer,evidence:[]},{...answer,status:'insufficient_sources'}])assert.throws(()=>groundedAnswer(invalid,input),/invalid_provider_evidence/);
 const refusal={status:'insufficient_sources',refusal:'I cannot provide protected exam answers.',nextStep:'Ask your instructor.',evidence:[]};
 assert.deepEqual(groundedAnswer(refusal,{sources:[]}).sourceIds,[]);
});
test('provider receives complete source passages with stable IDs without duplicating source text',()=>{
 for(const {input} of [alaska(),texas()]){
  const wire=providerInput(input);assert.equal(wire.sources[0].excerpt,undefined);
  assert.deepEqual(wire.sources[0].passages,sourcePassages(input.sources[0]));
  assert.ok(wire.sources[0].passages.every(p=>input.sources[0].excerpt.includes(p.text)));
  assert.deepEqual(providerInput(input),wire);
 }
});
