import test from 'node:test';
import assert from 'node:assert/strict';
import { pe03Fixture, ids } from './helpers/pe03-fixture.mjs';
import { validatePe03State } from '../netlify/functions/_lib/nmls-pe-service.mjs';

test('PE03 readback rejects inconsistent or unscoped persisted evidence', {skip:!process.env.PE_PGLITE_MODULE}, async t => {
  const f = await pe03Fixture(); t.after(() => f.db.close()); await f.enable();
  const validate = state => validatePe03State(state,state.actorId,state.role,state.cohort.id);
  const reject = (state, change) => {const copy=structuredClone(state);change(copy);assert.throws(()=>validate(copy),/pe03_unavailable/);};
  for (const actor of [ids.a,ids.b]) { await f.qualify(actor); await f.write(actor,'submit'); }
  const first = (await f.state(ids.a)).evidence.find(x=>x.actorId===ids.a&&x.kind==='submit');
  const peer = await f.write(ids.b,'peer',{targetId:first.id});
  const feedback = await f.write(ids.instructor,'feedback',{targetId:first.id});
  await f.write(ids.a,'revise',{targetId:feedback.receiptId});
  const a=await f.state(ids.a), b=await f.state(ids.b), staff=await f.state(ids.instructor);
  await t.test('real SQL learner/peer/instructor states remain accepted',()=>{for(const state of [a,b,staff])validate(state);});
  await t.test('foreign observation cannot enter a learner export',()=>reject(a,s=>{const e=staff.evidence.find(x=>x.actorId===ids.b&&x.kind==='observe');s.evidence.push(e);s.evidence.sort((x,y)=>x.sequence-y.sequence);}));
  await t.test('same event identity cannot be reused',()=>reject(a,s=>{s.evidence[1].id=s.evidence[0].id;}));
  await t.test('observed total reconciles to own immutable intervals',()=>reject(a,s=>{s.observedMs++;}));
  await t.test('invented interval cannot supply time',()=>reject(a,s=>{s.evidence.find(x=>x.kind==='observe'&&x.body.observedMs>0).body.intervalStart='2026-10-01T00:00:00Z';}));
  await t.test('feedback belongs to assigned instructor',()=>reject(a,s=>{s.evidence.find(x=>x.kind==='feedback').actorId=ids.b;}));
  await t.test('revision must preserve named feedback and peer lineage',()=>reject(a,s=>{s.evidence.find(x=>x.kind==='revise').body.peerId=ids.forged;}));
  await t.test('incorrect peer target fails closed',()=>reject(a,s=>{s.evidence.find(x=>x.id===peer.receiptId).targetId=ids.forged;}));
  await t.test('unexpected body fields are not returned to learner',()=>reject(a,s=>{s.evidence[0].body.privateNote='unrelated';}));
  await t.test('missing own event cannot silently reduce audit completeness',()=>reject(a,s=>{s.evidence.splice(0,1);}));
  await t.test('stage is derived rather than trusted',()=>reject(b,s=>{s.stage='revised-noncredit';}));
  await t.test('receipt cannot name another actor event',()=>reject(a,s=>{s.receiptId=peer.receiptId;}));
});
