import fs from 'node:fs/promises';
import path from 'node:path';
import { trainingReadiness } from './training-readiness.mjs';
import { dbRequest } from './db.mjs';

// Explicit identities for the same named course across the public and delivery catalogs.
// These retain both identifiers; they never copy approval or enable enrollment.
import { COURSE_IDENTITIES } from '../../../config/course-identities.mjs';
export { COURSE_IDENTITIES } from '../../../config/course-identities.mjs';

export function buildCourseInventory(catalog, database, governance, scopeStates = null) {
  const publicAvailable = Array.isArray(catalog?.categories);
  const inScope = state => !scopeStates || scopeStates.includes(state);
  const verticals = (catalog?.categories || []).map(category => {
    const courses=(category.programs || []).flatMap(program => program.courses || []);
    const states=[...new Set(courses.map(course=>course.state_id).filter(Boolean))].sort();
    return {
      id:category.category_id,
      title:category.title,
      status:category.status || null,
      launchTarget:category.launch_target || null,
      programCount:(category.programs || []).length,
      courseCount:courses.length,
      states,
    };
  }).filter(vertical=>!scopeStates || vertical.states.some(inScope));
  const publicCourses = (catalog?.categories || []).flatMap(category =>
    (category.programs || []).flatMap(program => (program.courses || []).map(course => ({
      id:course.course_id,state:course.state_id || program.state_code,name:course.course_title,
      hours:course.required_hours,route:course.route,category:category.category_id,version:course.course_version,
    })))).filter(course => inScope(course.state));
  const records = database.rows.filter(course => inScope(course.state));
  const matched = new Set();
  function row(publicCourse, dbCourse) {
    const id = dbCourse?.id || publicCourse.id;
    const state = dbCourse?.state || publicCourse.state;
    const service = dbCourse?.approval_status === 'not_regulated';
    const readiness = service ? null : dbCourse?.trainingReadiness || trainingReadiness(id);
    const decisions = governance.rows.filter(g => g.offering_id === id && g.state === state && g.offering_kind === 'course' && g.discipline === 'real_estate');
    const decision = governance.available && decisions.length === 1 ? decisions[0] : null;
    const databaseVerified = database.available && !database.truncated;
    const status = service ? 'service'
      : !databaseVerified ? 'not_verified'
      : !dbCourse ? 'registration_needed'
      : !readiness.ready ? 'connection_incomplete'
      : !governance.available || decisions.length > 1 ? 'not_verified'
      : decision?.training_access_enabled === true ? 'available' : 'closed';
    if (dbCourse) matched.add(dbCourse.id);
    return {id,state,name:dbCourse?.name || publicCourse.name,publicId:publicCourse?.id || null,
      databaseId:dbCourse?.id || null,route:publicCourse?.route || null,hours:publicCourse?.hours || null,
      category:publicCourse?.category || null,version:publicCourse?.version || null,
      service,trainingStatus:status,readiness,approval:decision?.approval_status || dbCourse?.approval_status || null,
      paymentMode:decision?.payment_mode || null};
  }
  const rows = publicCourses.map(course => {
    const identity = COURSE_IDENTITIES[course.id];
    const ids = [course.id, ...(identity?.state === course.state ? [identity.id] : [])];
    const candidates = records.filter(record => ids.includes(record.id) && record.state === course.state);
    return row(course, candidates.length === 1 ? candidates[0] : null);
  });
  for (const record of records) if (!matched.has(record.id)) rows.push(row(null,record));
  rows.sort((a,b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  const completeDatabase = database.available && !database.truncated;
  return {publicAvailable,databaseAvailable:completeDatabase,verticals,rows,summary:{
    catalogStates:publicAvailable ? new Set(publicCourses.map(c => c.state)).size : null,
    catalogCourses:publicAvailable ? publicCourses.length : null,
    databaseRecords:completeDatabase ? records.length : null,
    databaseStates:completeDatabase ? new Set(records.map(c => c.state)).size : null,
    availableTraining:completeDatabase && governance.available ? rows.filter(c => c.trainingStatus === 'available').length : null,
    databaseServices:completeDatabase ? records.filter(c => c.approval_status === 'not_regulated').length : null,
  }};
}

export async function courseInventory(database, governance, scopeStates) {
  let catalog = null;
  try {catalog = JSON.parse(await fs.readFile(path.join(process.cwd(),'public/statecourse/data/course-catalog.json'),'utf8'));} catch {}
  return buildCourseInventory(catalog,database,governance,scopeStates);
}

export async function registerCatalogCourses(staff, input) {
  const fail=(message,statusCode=409)=>{throw Object.assign(new Error(message),{statusCode});};
  if (!staff.matching.some(b=>b.actor_role==='owner' && b.scope_state==null)) fail('unscoped_owner_required',403);
  if (typeof input.note!=='string' || input.note.trim().length<10) fail('registration_reason_required',400);
  const records=await dbRequest('courses?select=id,state,name,approval_status&limit=1001');
  if (!Array.isArray(records) || records.length>1000) fail('course_inventory_unavailable',503);
  const inventory=await courseInventory({available:true,truncated:false,rows:records},{available:true,truncated:false,rows:[]},null);
  if (!inventory.publicAvailable) fail('public_catalog_unavailable',503);
  const missing=inventory.rows.filter(r=>r.trainingStatus==='registration_needed');
  const expected=Array.isArray(input.expectedIds)?[...input.expectedIds].sort():[];
  if (JSON.stringify(expected)!==JSON.stringify(missing.map(r=>r.publicId).sort())) fail('catalog_changed_reload_required');
  const bodies=missing.map(r=>{
    const identity=COURSE_IDENTITIES[r.publicId];
    const id=identity?.id || r.publicId;
    if (r.category!=='real-estate' || !/^[A-Z]{2}$/.test(r.state) || !/^[a-z0-9][a-z0-9_-]{0,199}$/.test(id)) fail('unsupported_catalog_record');
    if ((identity && identity.state!==r.state) || records.some(c=>c.id===id)) fail('catalog_identity_conflict');
    return {id,state:r.state,name:r.name,product_type:r.state==='TX'?'real_estate_qualifying_education':'real_estate_prelicense',approval_status:'submission_draft',enrollment_enabled:false,regulatory_approval_number:null};
  });
  if (!bodies.length) return {registered:0,verified:0,courseIds:[]};
  const inserted=await dbRequest('courses?on_conflict=id',{method:'POST',prefer:'resolution=ignore-duplicates,return=representation',body:bodies});
  const ids=bodies.map(r=>r.id);
  const verified=await dbRequest(`courses?select=id,state&id=in.(${ids.join(',')})&limit=1001`);
  if (!Array.isArray(verified) || bodies.some(c=>!verified.some(v=>v.id===c.id && v.state===c.state))) fail('course_registration_not_verified',503);
  return {registered:Array.isArray(inserted)?inserted.length:null,verified:bodies.length,courseIds:ids};
}
