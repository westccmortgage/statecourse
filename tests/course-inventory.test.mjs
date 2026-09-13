import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCourseInventory, registerCatalogCourses } from '../netlify/functions/_lib/course-inventory.mjs';
import { createStore, withConsoleMock, STAFF_ID } from './fixtures/admin-console/harness.mjs';
const source = rows => ({available:true,truncated:false,rows});
const catalog = JSON.parse(fs.readFileSync(new URL('../public/statecourse/data/course-catalog.json',import.meta.url)));
const db = source([
  ...['ca-real-estate-principles-45','ca-real-estate-practice-45','ca-mortgage-loan-brokering-lending-45'].map(id=>({id,state:'CA',name:id})),
  ...['ca-exam-prep','ca-licensing-navigator'].map(id=>({id,state:'CA',name:id,approval_status:'not_regulated'})),
  {id:'me-sales-agent',state:'ME',name:'Maine'},
  {id:'mo-real-estate-practice-24',state:'MO',name:'Missouri practice'},
  {id:'mo-salesperson-preexam-48',state:'MO',name:'Missouri pre-exam'},
  {id:'ok-basic-prelicense-90',state:'OK',name:'Oklahoma'},
  {id:'tx-law-of-agency-30-v1',state:'TX',name:'Texas Law of Agency'},
  {id:'va-salesperson',state:'VA',name:'Virginia Principles and Practices'},
  {id:'wi-salesperson',state:'WI',name:'Wisconsin'},
]);
const governance=source(db.rows.slice(0,3).map(c=>({offering_id:c.id,state:'CA',discipline:'real_estate',offering_kind:'course',training_access_enabled:true,payment_mode:'sandbox',approval_status:'none'})));

test('the catalog distinguishes 14 states plus national mortgage and 31 courses from 12 database records',()=>{
  const data=buildCourseInventory(catalog,db,governance);
  assert.deepEqual(data.summary,{catalogStates:14,catalogCourses:31,databaseRecords:12,databaseStates:7,availableTraining:3,databaseServices:2});
  assert.equal(data.rows.length,33);
  assert.equal(data.rows.filter(c=>c.trainingStatus==='registration_needed').length,21);
  assert.deepEqual(data.verticals.find(v=>v.id==='mortgage'),{
    id:'mortgage',title:'Mortgage / NMLS',status:'in_development',launchTarget:catalog.categories.find(c=>c.category_id==='mortgage').launch_target,programCount:1,courseCount:1,states:['US'],
  });
});
test('declared Texas and Virginia identities retain their public IDs while opening the existing database course',()=>{
  const {rows}=buildCourseInventory(catalog,db,governance);
  for(const [publicId,id] of [['tx-law-of-agency-30','tx-law-of-agency-30-v1'],['va-principles-practices-v1','va-salesperson']]){
    const match=rows.filter(r=>r.id===id||r.publicId===publicId);
    assert.equal(match.length,1);assert.equal(match[0].databaseId,id);assert.equal(match[0].publicId,publicId);
    assert.equal(match[0].trainingStatus,'connection_incomplete');
  }
});
test('state scope applies to public-only courses as well as database rows and counts',()=>{
  const result=buildCourseInventory(catalog,db,governance,['AZ']);
  assert.equal(result.rows.length,2);assert.ok(result.rows.every(r=>r.state==='AZ'));
  assert.deepEqual(result.summary,{catalogStates:1,catalogCourses:2,databaseRecords:0,databaseStates:0,availableTraining:0,databaseServices:0});
  assert.equal(result.verticals.some(v=>v.id==='mortgage'),false);
});
test('an unreadable or partial database is not represented as zero missing courses or ready training',()=>{
  for(const database of [{...db,available:false,rows:[]},{...db,truncated:true}]){
    const result=buildCourseInventory(catalog,database,governance);
    assert.equal(result.summary.databaseRecords,null);assert.equal(result.summary.availableTraining,null);
    assert.equal(result.summary.catalogStates,14);
    assert.ok(result.rows.filter(r=>!r.service).every(r=>r.trainingStatus==='not_verified'));
  }
});
test('unreadable public catalog preserves known database records but reports catalog totals as unknown',()=>{
  const result=buildCourseInventory(null,db,governance);
  assert.equal(result.summary.catalogStates,null);assert.equal(result.summary.catalogCourses,null);
  assert.equal(result.rows.length,12);
});
test('neither a cross-state identity nor a permissive decision from another state enables training',()=>{
  const database=source(db.rows.map(r=>r.id==='tx-law-of-agency-30-v1'?{...r,state:'AZ'}:r));
  const decisions=source(governance.rows.map(g=>({...g,state:'TX'})));
  const result=buildCourseInventory(catalog,database,decisions);
  assert.equal(result.rows.find(r=>r.publicId==='tx-law-of-agency-30').databaseId,null);
  assert.equal(result.summary.availableTraining,0);
});
test('ambiguous approval decisions cannot make a course look open',()=>{
  const result=buildCourseInventory(catalog,db,source([...governance.rows,governance.rows[0]]));
  assert.equal(result.rows.find(r=>r.id==='ca-real-estate-principles-45').trainingStatus,'not_verified');
  assert.equal(result.summary.availableTraining,2);
});
test('a future mortgage course reads only mortgage governance, never a real-estate decision',()=>{
  const withMortgage=structuredClone(catalog);
  const vertical=withMortgage.categories.find(c=>c.category_id==='mortgage');
  vertical.programs=[{state_code:'CA',courses:[{course_id:'ca-nmls-ce-8',state_id:'CA',course_title:'NMLS Continuing Education',required_hours:8,route:'/mortgage/california/ce/',course_version:'v1'}]}];
  const database=source([...db.rows,{id:'ca-nmls-ce-8',state:'CA',name:'NMLS Continuing Education',trainingReadiness:{ready:true}}]);
  const shared={offering_id:'ca-nmls-ce-8',state:'CA',offering_kind:'course',training_access_enabled:true,payment_mode:'sandbox',approval_status:'none'};
  const result=buildCourseInventory(withMortgage,database,source([{...shared,discipline:'real_estate'},{...shared,discipline:'mortgage'}]));
  const course=result.rows.find(row=>row.id==='ca-nmls-ce-8');
  assert.equal(course.discipline,'mortgage');
  assert.equal(course.trainingStatus,'available');
});

async function registrationFixture(run) {
  return withConsoleMock(createStore(),async()=>{
    const original=globalThis.fetch,records=structuredClone(db.rows),writes=[];
    globalThis.fetch=async(input,init={})=>{
      const url=new URL(input);assert.equal(url.pathname,'/rest/v1/courses');
      let rows=records;
      if(init.method==='POST'){
        const body=JSON.parse(init.body);writes.push(body);rows=body.filter(r=>!records.some(c=>c.id===r.id));records.push(...rows);
        assert.match(init.headers.prefer,/ignore-duplicates/);
      }
      return new Response(JSON.stringify(rows),{headers:{'content-type':'application/json'}});
    };
    try{return await run({records,writes});}finally{globalThis.fetch=original;}
  });
}
const owner={matching:[{actor_role:'owner',scope_state:null}],auth:{student:{id:STAFF_ID}}};
const registration=()=>({note:'Connect the existing public catalog to course administration.',expectedIds:buildCourseInventory(catalog,db,governance).rows.filter(r=>r.trainingStatus==='registration_needed'&&r.category==='real-estate').map(r=>r.publicId)});
test('catalog registration inserts only missing real courses and never grants approval, enrollment or payments',async()=>registrationFixture(async({records,writes})=>{
  const existing=JSON.stringify(records);
  const result=await registerCatalogCourses(owner,{...registration(),approval_status:'approved',enrollment_enabled:true,payment_mode:'live'});
  assert.equal(result.verified,20);assert.equal(records.length,32);assert.equal(JSON.stringify(records.slice(0,12)),existing);
  assert.ok(writes.flat().every(r=>r.enrollment_enabled===false && r.approval_status==='submission_draft' && r.regulatory_approval_number===null));
  assert.ok(writes.flat().every(r=>!('payment_mode' in r)));
}));
test('a stale registration list is refused before any row is inserted',async()=>registrationFixture(async({writes})=>{
  await assert.rejects(()=>registerCatalogCourses(owner,{...registration(),expectedIds:[]}),/catalog_changed/);assert.equal(writes.length,0);
}));
test('a scoped owner or administrator cannot register the national catalog',async()=>registrationFixture(async({writes})=>{
  for(const binding of [{actor_role:'owner',scope_state:'CA'},{actor_role:'administrator',scope_state:null}])await assert.rejects(()=>registerCatalogCourses({matching:[binding]},registration()),/unscoped_owner_required/);
  assert.equal(writes.length,0);
}));
test('registration repeated after a reload is a no-op and preserves all existing records',async()=>registrationFixture(async({records,writes})=>{
  await registerCatalogCourses(owner,registration());
  const saved=JSON.stringify(records),result=await registerCatalogCourses(owner,{...registration(),expectedIds:[]});
  assert.equal(result.registered,0);assert.equal(JSON.stringify(records),saved);assert.equal(writes.length,1);
}));
