import { PE03_DEFINITION, pe03Materials } from '../../../config/nmls/pe-oil-definition.mjs';
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const invalid = () => { throw new Error('pe03_invalid_request'); };
export function validatePe03Request(input, role) {
  if (!input || Object.getPrototypeOf(input) !== Object.prototype) invalid();
  const { operation } = input;
  const reads = ['snapshot','export'];
  if (!(role === 'instructor' ? [...reads,'feedback'] : [...reads,'observe','submit','peer','revise']).includes(operation)) invalid();
  const keys = ['operation','cohortId'];
  if (!reads.includes(operation)) keys.push('requestId','expectedRevision','actorId');
  if (operation === 'observe') keys.push('tabId','mode');
  if (['submit','peer','feedback','revise'].includes(operation)) keys.push('text');
  if (['peer','feedback','revise'].includes(operation)) keys.push('targetId');
  if (Reflect.ownKeys(input).length !== keys.length || keys.some(key => !Object.hasOwn(input,key)) || !uuid(input.cohortId)) invalid();
  if (!reads.includes(operation) && (!uuid(input.actorId) || !uuid(input.requestId) || !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 || input.expectedRevision > 2147483647)) invalid();
  if (keys.includes('targetId') && !uuid(input.targetId)) invalid();
  if (operation === 'observe' && (!uuid(input.tabId) || !['active','paused'].includes(input.mode))) invalid();
  if (keys.includes('text') && (typeof input.text !== 'string' || input.text.trim().length < 20 || input.text.length > 8000)) invalid();
  return { ...input, contentHash: PE03_DEFINITION.contentHash };
}
export async function executePe03(input, actorId, role, { rpc }) {
  if (!uuid(actorId) || !['student','instructor'].includes(role)) throw new Error('pe03_access_denied');
  const validated = validatePe03Request(input,role);
  if (validated.actorId && validated.actorId !== actorId) throw new Error('pe03_access_denied');
  // actorId is an expected-account binding, never an authority source.
  const { actorId: expectedActor, ...request } = validated;
  void expectedActor;
  const state = await rpc('pe03_command',{p_actor_id:actorId,p_role:role,p_request:request});
  validatePe03State(state,actorId,role,request.cohortId);
  return { ...state, definition: PE03_DEFINITION, materials: pe03Materials(state.stage) };

}

export function validatePe03State(state,actorId,role,cohortId) {
  const fail=()=>{throw new Error('pe03_unavailable');};
  const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const integer=x=>Number.isSafeInteger(x)&&x>=0;
  const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  const exact=(x,keys)=>record(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
  if(!exact(state,['schemaVersion','cohort','actorId','role','revision','stage','observedMs','serverAt','evidence','receiptId','creditEligible','certificateEligible','bankingEligible','durationValidated']))fail();
  if(state.schemaVersion!==1||state.actorId!==actorId||state.role!==role||!integer(state.revision)||!integer(state.observedMs)||!date(state.serverAt)||!Array.isArray(state.evidence)||!(state.receiptId===null||uuid(state.receiptId))||state.creditEligible!==false||state.certificateEligible!==false||state.bankingEligible!==false||state.durationValidated!==false)fail();
  if(!exact(state.cohort,['id','title','definitionId','contentHash','timezone','opensAt','closesAt','assignedInstructorId'])||state.cohort.id!==cohortId||state.cohort.definitionId!==PE03_DEFINITION.id||state.cohort.contentHash!==PE03_DEFINITION.contentHash||!uuid(state.cohort.assignedInstructorId)||typeof state.cohort.title!=='string'||typeof state.cohort.timezone!=='string'||!date(state.cohort.opensAt)||!date(state.cohort.closesAt)||Date.parse(state.cohort.closesAt)<=Date.parse(state.cohort.opensAt))fail();
  if(!(role==='instructor'?['instructor-review']:['observe','initial-submission','peer-dialogue','awaiting-instructor','revision','revised-noncredit']).includes(state.stage))fail();
  let sequence=0;
  for(const event of state.evidence){
    if(!exact(event,['id','sequence','actorId','kind','at','revision','targetId','body'])||!uuid(event.id)||!uuid(event.actorId)||!integer(event.sequence)||event.sequence<=sequence||!integer(event.revision)||event.revision<1||!date(event.at)||!record(event.body)||!['observe','submit','peer','feedback','revise'].includes(event.kind))fail();
    sequence=event.sequence;
    if(['observe','submit'].includes(event.kind)?event.targetId!==null:!uuid(event.targetId))fail();
    if(event.kind==='observe'){
      if(!integer(event.body.observedMs)||event.body.observedMs>PE03_DEFINITION.maxObservedIntervalMs||!['active','paused'].includes(event.body.mode)||!uuid(event.body.tabId)||!date(event.body.intervalEnd)||(event.body.intervalStart!==null&&!date(event.body.intervalStart)))fail();
    }else if(typeof event.body.text!=='string'||event.body.text.trim().length<20||event.body.text.length>8000)fail();
  }
  validatePe03Evidence(state, fail);
}


// Treat RPC readback as an authority boundary too. A future SQL regression must
// not leak unrelated learner evidence or fabricate technical completion.
function validatePe03Evidence(state, fail) {
  const events = state.evidence;
  const byId = new Map(events.map(event => [event.id, event]));
  if (byId.size !== events.length) fail();
  const own = events.filter(event => event.actorId === state.actorId);
  const initial = own.find(event => event.kind === 'submit');
  const feedback = events.find(event => event.kind === 'feedback' && event.targetId === initial?.id);
  const incoming = events.find(event => event.kind === 'peer' && event.targetId === initial?.id);
  const revised = own.find(event => event.kind === 'revise');
  let observedMs = 0, revision = 0;
  const revisions = new Set();
  const uniqueTransitions = new Set();
  for (const event of events) {
    if (Date.parse(event.at) > Date.parse(state.serverAt)) fail();
    const revisionKey = `${event.actorId}:${event.revision}`;
    if (revisions.has(revisionKey)) fail();
    revisions.add(revisionKey);
    if (event.actorId === state.actorId) {
      if (event.revision !== revision + 1) fail();
      revision = event.revision;
      if (event.kind === 'observe') observedMs += event.body.observedMs;
    }
    if (state.role === 'student' && event.actorId !== state.actorId && !(
      (initial && event.kind === 'submit') ||
      (initial && ['peer', 'feedback'].includes(event.kind) && event.targetId === initial.id)
    )) fail();
    const bodyKeys = event.kind === 'observe'
      ? ['mode','tabId','observedMs','intervalStart','intervalEnd']
      : event.kind === 'feedback' ? ['text','peerId']
      : event.kind === 'revise' ? ['text','initialId','peerId'] : ['text'];
    if (Object.keys(event.body).length !== bodyKeys.length || bodyKeys.some(k => !Object.hasOwn(event.body,k))) fail();
    if (event.kind === 'observe') {
      const end = Date.parse(event.body.intervalEnd), start = Date.parse(event.body.intervalStart);
      if (end !== Date.parse(event.at)) fail();
      if (event.body.observedMs === 0 ? event.body.intervalStart !== null : (
        event.body.mode !== 'active' || !Number.isFinite(start) || end <= start ||
        Math.abs((end - start) - event.body.observedMs) > 1
      )) fail();
      continue;
    }
    const key = event.kind === 'peer' ? `${event.kind}:${event.actorId}:${event.targetId}`
      : event.kind === 'feedback' ? `${event.kind}:${event.targetId}` : `${event.kind}:${event.actorId}`;
    if (uniqueTransitions.has(key)) fail();
    uniqueTransitions.add(key);
    if (event.kind === 'submit') continue;
    const target = byId.get(event.targetId);
    if (!target || target.sequence >= event.sequence) fail();
    if (event.kind === 'peer' && (target.kind !== 'submit' || target.actorId === event.actorId)) fail();
    if (event.kind === 'feedback') {
      const peer = byId.get(event.body.peerId);
      if (event.actorId !== state.cohort.assignedInstructorId || target.kind !== 'submit' ||
        !peer || peer.kind !== 'peer' || peer.targetId !== target.id || peer.sequence >= event.sequence) fail();
    }
    if (event.kind === 'revise') {
      const first = byId.get(event.body.initialId);
      if (target.kind !== 'feedback' || target.actorId !== state.cohort.assignedInstructorId ||
        !first || first.kind !== 'submit' || first.actorId !== event.actorId || target.targetId !== first.id ||
        event.body.peerId !== target.body.peerId) fail();
    }
  }
  if (!Number.isSafeInteger(observedMs) || observedMs !== state.observedMs || revision !== state.revision) fail();
  if (state.receiptId !== null && (!byId.has(state.receiptId) || byId.get(state.receiptId).actorId !== state.actorId || byId.get(state.receiptId).revision !== state.revision)) fail();
  if (state.role === 'student') {
    const stage = revised ? 'revised-noncredit' : feedback ? 'revision' : incoming ? 'awaiting-instructor'
      : initial ? 'peer-dialogue' : observedMs >= PE03_DEFINITION.minimumObservedMs ? 'initial-submission' : 'observe';
    if (state.stage !== stage || (initial && observedMs < PE03_DEFINITION.minimumObservedMs)) fail();
  } else if (own.some(event => event.kind !== 'feedback')) fail();
}

export function pe03PublicError(error) {
  const code = error?.message;
  const status = ['student_auth_required','invalid_student_session','invalid_staff_session'].includes(code) ? 401
    : ['origin_not_allowed','pe03_access_denied','staff_binding_required','staff_role_not_authorized','staff_mfa_required','staff_session_required','staff_step_up_required','fresh_action_authorization_required'].includes(code) ? 403
    : code === 'pe03_invalid_request' ? 400
    : code === 'pe03_disabled' ? 404
    : ['pe03_window_closed','pe03_observation_closed','pe03_clock_regressed','pe03_content_changed','pe03_revision_conflict','pe03_idempotency_conflict','pe03_tab_conflict','pe03_already_recorded','pe03_observation_required','pe03_peer_required','pe03_feedback_required'].includes(code) ? 409 : 503;
  return { status, body: { error: status === 503 ? 'pe03_unavailable' : code } };
}
