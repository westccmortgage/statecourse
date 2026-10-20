// Test B: actual SourceDocumentsPack, material resolver, SQL and shared completion.
// Local stand-ins read the actual request, with all provider network sealed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {withThrowawayDatabase} from '../../core-v2/tests/postgres-harness.mjs';
import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
// As in the runner's other SQL suites: seal provider transports, leaving the
// throwaway cluster's Unix socket and pg_ctl cleanup available to the harness.
function closeNetwork(){
  let calls=0;
  for(const [target,names] of [[globalThis,['fetch','WebSocket']],[http,['get','request']],
    [https,['get','request']],[tls,['connect']]])for(const name of names)if(name in target)
    Object.defineProperty(target,name,{value:()=>{calls++;throw Error('No provider network in this test');},writable:false,configurable:false});
  return ()=>calls;
}
import {sha256 as sha} from '../../core-v2/kernel/ids.ts';
import {createWorkOrder,attachWorkflow,getWorkOrder} from '../../core-v2/work-orders/store.ts';
import {readAnalysisResults} from '../analysis-results.ts';
import {verifyAnalysisDelivery,ANALYSIS_DELIVERABLE,ANALYSIS_CRITERIA} from '../analysis-work-order.ts';
import {LocalProviderTransport} from '../../core-v2-runtime/providers/local-answers.ts';
import {answerFromRequest} from '../../core-v2-runtime/local-agent/reading-agent.ts';
import {SourceDocumentsPack} from '../../core-v2/domains/source-documents/pack.ts';
import {manifestOfAnalysis,readAnalysis,workflowIdForAnalysis} from '../analysis.ts';
import {questionFor} from '../world.ts';
import {invocationClock} from '../clock.ts';
import {PostgresContinuationStore} from '../continuations.ts';
import {startFromManifest} from '../start.ts';
import {readRoutingHistory} from '../../core-v2-runtime/routing-history.ts';
import {tickOnce} from '../tick.ts';
const CAPABLE = { forcedToolChoice: true, strictSchema: true, images: true, thinking: "none" };
function declaration() {
  const provider = (id, host, model, variable) => ({
    providerId: id, baseUrl: `https://${host}`, apiKeyEnvironmentVariable: variable,
    models: [model], defaultModel: model,
    maximumInputTokens: 60_000, maximumOutputTokens: 4_096, requestTimeoutMs: 30_000,
    maximumMaterialBytes: 512 * 1024, maximumMaterialBytesPerItem: 256 * 1024,
    supportedMediaTypes: ["text/plain; charset=utf-8", "image/png"],
    capabilities: { [model]: { ...CAPABLE } },
  });
  const price = (id, model) => ({
    providerId: id, model, effectiveFrom: "2026-01-01", currency: "USD",
    inputPerMillionTokens: 1, outputPerMillionTokens: 5, cacheWritePerMillionTokens: 1.25,
  });
  return JSON.stringify({
    declaredBy: "an operator under test", declaredAt: "2026-09-09",
    providers: [
      provider("anthropic", "alpha.operator-under-test.net", "operator-model-a", "OPERATOR_KEY_A"),
      provider("openai", "beta.operator-under-test.net", "operator-model-b", "OPERATOR_KEY_B"),
      provider("google", "gamma.operator-under-test.net", "operator-model-c", "OPERATOR_KEY_C"),
    ],
    pricing: [price("anthropic", "operator-model-a"), price("openai", "operator-model-b"), price("google", "operator-model-c")],
    roles: { readerA: "anthropic", readerB: "openai", critic: "google" },
    routing: {
      "reader-family-one": "anthropic", "reader-family-two": "openai",
      "critic-family-one": "google", "arbiter-family-one": "google",
    },
  });
}
const ENVIRONMENT = {
  CORE_V2_RUNNER_REGISTRY: declaration(),
  CORE_V2_RUNNER_CONCURRENT_ATTEMPTS: "6",
  OPERATOR_KEY_A: "not-a-key-and-never-sent-a",
  OPERATOR_KEY_B: "not-a-key-and-never-sent-b",
  OPERATOR_KEY_C: "not-a-key-and-never-sent-c",
};
const gates = { networkFlag: true, environment: (name) => ENVIRONMENT[name] };
const LIFE = { lifetimeMs: 60_000, safetyMs: 500, answerWithinMs: 10_000, settlementRoomMs: 1_000, graceMs: 1_000 };

/* ───────────────────────────────────────── storage, on disk, read by hash-free path */

const store = fs.mkdtempSync(path.join(os.tmpdir(), "mdai-store-"));
const put = (storagePath, bytes) => {
  const file = path.join(store, storagePath.replace(/[^A-Za-z0-9._/-]/g, "_"));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
};
let objectReads = 0;
const readObject = async (storagePath) => {
  objectReads += 1;
  const file = path.join(store, storagePath.replace(/[^A-Za-z0-9._/-]/g, "_"));
  if (!fs.existsSync(file)) throw new Error(`no object at ${storagePath}`);
  return new Uint8Array(fs.readFileSync(file));
};

/* ─────────────────────────────────────────────────── the wire, answered locally */

function sealedTransport(seen) {
  return () => new LocalProviderTransport({
    onRequest: (question) => {
      if (!seen) return;
      /* Material is not "the parts that are not text": a page's own text IS
         material and arrives as a text part. What marks a part as material is
         the heading the compiler writes above it, so that is what is counted
         — and the hash in that heading is what is checked. */
      const text = question.parts.filter((p) => p.kind === "text").map((p) => p.text).join("\n");
      const headings = [...text.matchAll(/^ {2}material \d+ — .*$/gm)].map((m) => m[0]);
      const hashes = [...text.matchAll(/^ {4}contentHash: (\S+)$/gm)].map((m) => m[1]);
      seen.push({
        providerId: question.providerId,
        taskId: (text.match(/^taskId: (\S+)$/m) ?? [])[1] ?? null,
        subject: (text.match(/^subject: (\S+)$/m) ?? [])[1] ?? null,
        role: (text.match(/^roleKey: (\S+)$/m) ?? [])[1] ?? null,
        text,
        materialHashes: hashes,
        materialCount: headings.length,
        pictureCount: question.parts.filter((p) => p.kind !== "text").length,
      });
    },
    answer: (question) => {
      try { return answerFromRequest(question); }
      catch (error) { return new Error(`the stand-in could not answer: ${error.message}`); }
    },
  });
}

function tickVia(client, options = {}) {
  const clock = invocationClock({ ...LIFE, ...(options.life ?? {}) });
  const startedAt = options.startedAt ?? Date.now();
  return tickOnce({
    runner: "core-v2-runner-tick",
    client,
    store: new PostgresContinuationStore(client),
    clock, gates,
    transport: options.transport ?? sealedTransport(),
    readObject,
    startedAt,
    deadlineAt: options.deadlineAt ?? (startedAt + clock.deadlineMs),
  });
}

const dueNow = (client, id) => client.query(
  `update public.workflow_continuations set due_at = now() - interval '1 minute' where workflow_id = $1`, [id]);

/* ─────────────────────────────────────────────────────── seeding an analysis */

async function seedAnalysis(client, organizationId, { title, questionKind, question, files }) {
  const run = await client.query(
    `insert into public.analysis_runs(organization_id, title, question_kind, question, state)
     values ($1::uuid, $2, $3, $4, 'ready') returning id::text as id`,
    [organizationId, title, questionKind, question]);
  const analysisId = run.rows[0].id;

  for (const file of files) {
    const storagePath = `${organizationId}/analysis/${analysisId}/${file.ordinal}-source${file.extension}`;
    put(storagePath, file.originalBytes);
    const row = await client.query(
      `insert into public.analysis_files(analysis_id, organization_id, ordinal, kind, file_name,
         media_type, byte_size, storage_path, upload_state, probe, preparation_state, prepared_units, total_units)
       values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, 'stored', $9::jsonb, 'prepared', $10, $10)
       returning id::text as id`,
      [analysisId, organizationId, file.ordinal, file.kind, file.name, file.mediaType,
       file.originalBytes.length, storagePath, JSON.stringify(file.probe ?? {}), file.parts.length]);
    const fileId = row.rows[0].id;
    for (const part of file.parts) {
      let partPath = null;
      if (part.bytes) {
        partPath = `${organizationId}/analysis/${analysisId}/${file.ordinal}/${part.partKind}-${part.ordinal}.png`;
        put(partPath, part.bytes);
      }
      await client.query(
        `insert into public.analysis_parts(analysis_id, file_id, organization_id, part_kind, ordinal,
           storage_path, inline_text, media_type, byte_size, content_sha256, locator)
         values ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)`,
        [analysisId, fileId, organizationId, part.partKind, part.ordinal, partPath,
         part.text ?? null, part.mediaType, part.byteSize, part.contentHash, JSON.stringify(part.locator)]);
    }
  }
  return analysisId;
}


export async function proveSourceWorkOrder({client,organizationId,userId}){
  const reached=closeNetwork();
  const raw=JSON.parse(fs.readFileSync(new URL('../../../tools/fixtures/studio-source-proof.json',import.meta.url),'utf8'));
  const parts=raw.pages.flatMap(page=>{
    const png=Buffer.from(page.png,'base64');
    return [{partKind:'pdf_page_image',ordinal:page.page,bytes:png,mediaType:'image/png',byteSize:png.length,
      contentHash:sha(png),locator:{page:page.page,bbox:[0,0,1,1]}},
      {partKind:'pdf_page_text',ordinal:page.page,text:page.text,mediaType:'text/plain; charset=utf-8',
        byteSize:Buffer.byteLength(page.text),contentHash:sha(page.text),locator:{page:page.page,kind:'text'}}];
  });
  const analysisId=await seedAnalysis(client,organizationId,{title:'Synthetic Studio proof',questionKind:'specific_question',
    question:'Is a smoke detector shown in every bedroom?',files:[{ordinal:1,name:'synthetic-plan.pdf',extension:'.pdf',kind:'pdf',
      mediaType:'application/pdf',originalBytes:Buffer.from(raw.pdf,'base64'),probe:{pages:1},parts}]});
  const analysis=await readAnalysis(client,analysisId),workflowId=workflowIdForAnalysis(analysisId);
  const manifest=manifestOfAnalysis(analysis,workflowId),pack=new SourceDocumentsPack({question:questionFor(analysis)});
  const order=await createWorkOrder(client,organizationId,userId,'measured-decision',{
    idempotency_key:'synthetic_studio_source_20260929',goal:analysis.question,requested_deliverable:ANALYSIS_DELIVERABLE,
    acceptance_criteria:ANALYSIS_CRITERIA,source:{system:'measured-decision',type:'analysis',identifier:analysisId,revision:null}});
  const start=()=>startFromManifest({client,organizationId,manifest,pack,alongside:async(tx,wf)=>{
    await attachWorkflow(tx,organizationId,order.work_order_id,wf,order.revision);
    await tx.query("update analysis_runs set workflow_id=$2,authorized_usd=5,run_requested_at=now(),state='running' where id=$1",[analysisId,wf]);
  }});
  await start();await start();
  const early=await client.transaction(async tx=>verifyAnalysisDelivery(tx,organizationId,analysisId,await readAnalysisResults(tx,organizationId,analysisId)));
  assert.notEqual(early.state,'COMPLETED');
  const seen=[];let ticks=0;
  for(;ticks<20;ticks++){
    await dueNow(client,workflowId);await tickVia(client,{transport:sealedTransport(seen)});
    const state=(await client.query('select state from intelligence_workflows where id=$1',[workflowId])).rows[0].state;
    if(['completed','partial','failed','needs_person'].includes(state))break;
  }
  const result=await readAnalysisResults(client,organizationId,analysisId);
  assert.equal(result.counts.confirmed,1,JSON.stringify(result));
  const reading=seen.filter(r=>r.role==='page_reader');
  assert.equal(new Set(reading.map(r=>r.providerId)).size,2);
  assert.ok(seen.some(r=>r.role==='evidence_critic'));
  assert.ok(objectReads>0);
  assert.ok(result.subjects[0].readings.some(r=>r.status==='accepted'&&r.anchors.length));
  const finish=()=>client.transaction(async tx=>verifyAnalysisDelivery(tx,organizationId,analysisId,await readAnalysisResults(tx,organizationId,analysisId)));
  const incomplete={...result,subjects:result.subjects.map(s=>({...s,section:'needsCheck'}))};
  assert.equal((await client.transaction(tx=>verifyAnalysisDelivery(tx,organizationId,analysisId,incomplete))).state,'VERIFICATION_INCOMPLETE');
  const afterRestart=[];
  await dueNow(client,workflowId);await tickVia(client,{transport:sealedTransport(afterRestart)});
  assert.equal(afterRestart.length,0); // a fresh runner never repurchases a finished read
  const complete=await finish();assert.equal(complete.state,'COMPLETED',JSON.stringify(complete));
  const revision=(await getWorkOrder(client,organizationId,order.work_order_id)).revision;
  assert.equal((await finish()).artifact_digest,complete.artifact_digest);
  const reopened=await getWorkOrder(client,organizationId,order.work_order_id);
  assert.equal(reopened.revision,revision);assert.equal(reopened.current_state,'COMPLETED');
  assert.equal(Number((await client.query('select count(*) n from intelligence_workflows')).rows[0].n),1);
  const history=await readRoutingHistory(client,organizationId,'source-documents','1.0');
  assert.ok(history.some(o=>o.roleKey==='page_reader'&&o.verifiedQuality==='pass'&&o.finalAccepted));
  assert.deepEqual(await readRoutingHistory(client,organizationId,'another-pack','1.0'),[]);
  assert.ok(history.every(o=>o.actualCost===null||o.actualCost>=0));
  assert.equal(reached(),0);
  console.log(JSON.stringify({test:'B original Studio',state:reopened.current_state,workflow_id:workflowId,
    work_order_id:order.work_order_id,subjects:result.subjects.length,source_objects_read:objectReads,
    independent_scripted_readers:2,independent_verification:true,fresh_runner_instances:ticks+2,provider_calls:0,
    new_real_spend:0,artifact_digest:complete.artifact_digest,browser_preparation_proven:false}));
  fs.rmSync(store,{recursive:true,force:true});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await withThrowawayDatabase(proveSourceWorkOrder);
