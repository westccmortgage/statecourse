import { deliveriesForCourse } from '../../../config/course-screen-index.mjs';
import { STREAM_MEDIA } from '../../../config/stream-media.mjs';
import { getCourse, evaluateCheckoutEligibility } from '../../../config/course-catalog.mjs';
import { environmentStatus } from './console-environment.mjs';
import { isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';
import { getCourseConfiguration } from '../../../config/course-registry.mjs';

export const completeSource = source => source?.available === true && source.truncated === false;
export function evidenceFor(events, course, area, key) {
  if (!completeSource(events)) return { status:'unverified', reason:'Evidence storage unavailable or incomplete', source:'console_evidence_events' };
  const rows=events.rows.filter(e=>e.course_id===course.id && e.course_version===course.version && e.area===area && e.evidence_key===key)
    .sort((a,b)=>a.event_order!=null&&b.event_order!=null?(BigInt(a.event_order)>BigInt(b.event_order)?-1:BigInt(a.event_order)<BigInt(b.event_order)?1:0):b.recorded_at.localeCompare(a.recorded_at)||b.id.localeCompare(a.id));
  const e=rows[0];
  if (!e) return { status:'missing', source:'console_evidence_events', reason:'No current-version evidence recorded' };
  return { status:e.effective_at && Date.parse(e.effective_at)>Date.now()?'pending_effective':e.expires_at && Date.parse(e.expires_at)<=Date.now()?'expired':e.status,
    reference:e.reference, note:e.note, recordedAt:e.recorded_at, effectiveAt:e.effective_at, expiresAt:e.expires_at,
    metadata:e.metadata||{},authority:e.authority, approvalNumber:e.approval_number, source:'console_evidence_events', id:e.id };
}

export function regulatoryReadiness(course, publicCourse, state, governance, events, nmls) {
  const n=isNmlsTrainingCourse(course.id), config=n?null:getCourseConfiguration(course.id);
  const evidence=key=>evidenceFor(events,course,'regulatory',key);
  const gates={provider:evidence('provider'),course:evidence('course'),humanReview:evidence('human_review')};
  if(n) Object.assign(gates,{duration:evidence('duration_validation'),rocs:evidence('rocs'),reporting:evidence('reporting_acceptance')});
  else Object.assign(gates,{school:evidence('school'),instructor:evidence('instructor')});
  return { discipline:course.discipline, jurisdiction:course.state, courseVersion:course.version,
    regulator:n?'NMLS / CSBS':publicCourse?.regulator || state?.regulator_name || 'Not verified',
    courseType:n?'CE training; not approved CE':publicCourse?.program_type || 'Not verified',
    year:n?course.version?.split('.')[0]:null,
    recordedOfferingApproval:governance?.approval_status || 'unrecorded',
    offeringApprovalEffective:governance?.approval_currently_effective === true,
    approvalAuthority:governance?.approval_authority || null,approvalNumber:governance?.approval_number || null,
    effectiveDate:governance?.approval_effective_date || null,expiresDate:governance?.approval_expires_date || null,
    gates,
    configuredRequirements:n?{allocation:'Federal 3 / ethics 2 / nontraditional 2 / elective 1 — provisional design',stateSupplement:'Excluded; no state-specific approval claimed',
      duration:'400 provisional minutes; human validation required',rocsOriginalsMissing:nmls?.officialEvidence?.unresolvedOriginalCount ?? null}:
      {provider:state?.provider_status||'Not researched',instructor:state?.instructor_approval_required ?? null,
        timing:config?{requiredHours:config.requiredHours,minimumElapsedHours:config.minimumElapsedHours??null}:state?.prelicense_hours??null,
        exam:publicCourse?.final_exam_rules||state?.final_exam_rules||'Not verified',reporting:publicCourse?.reporting_rules||state?.reporting_requirements||'Not verified',
        renewal:state?.provider_expiration_date||null},
    source:n?'NMLS pinned definition, official-source manifest, offering_public_status and version-scoped evidence':
      'State/course authored configuration (requirements need human validation), offering_public_status and version-scoped evidence',
    safetyGate:n?'NMLS runtime remains training-only regardless of evidence entries. Credit/certificate/reporting release is independently closed.':
      'Evidence entries do not activate enrollment, alter state timing, approve an offering or issue certificates.',
  };
}

export function commerceReadiness(course, governance, events, env=environmentStatus(), catalogCourse=getCourse(course.id)) {
  const price=catalogCourse?.price?.test ?? null;
  const evidence=key=>evidenceFor(events,course,'commerce',key);
  const checkout=evidence('checkout'),webhook=evidence('webhook'),refund=evidence('refund_replay');
  for(const gate of [checkout,webhook,refund])if(gate.status==='verified'&&gate.metadata?.testPriceCents!==price){gate.status='stale';gate.reason='Acceptance predates the current offering test price';}
  const testEligibility=evaluateCheckoutEligibility(catalogCourse,'test'),liveEligibility=evaluateCheckoutEligibility(catalogCourse,'live');
  const reasons=[];
  if(!catalogCourse)reasons.push('No checkout catalog identity; free training can remain available independently.');
  if(!env.stripeTestConnected)reasons.push('STRIPE_SECRET_KEY_TEST and STRIPE_WEBHOOK_SECRET_TEST are not both configured.');
  if(env.stripeTestKeyValid!==true)reasons.push('Stripe test secret key format/mode not verified.');
  if(!testEligibility.allowed)reasons.push(`Checkout catalog gate: ${testEligibility.reason}.`);
  if(env.stripeMode!=='test')reasons.push('Global Stripe mode is not explicitly test.');
  if(!price)reasons.push('Test price not configured for this offering.');
  if(!['sandbox','live'].includes(governance?.payment_mode))reasons.push('Offering sandbox payment decision is not recorded.');
  for(const [key,value] of Object.entries({checkout,webhook,refund}))if(value.status!=='verified')reasons.push(`${key} production sandbox acceptance is ${value.status}.`);
  return {freeTraining:course.trainingStatus==='available',offeringMode:governance?.payment_mode||'disabled',
    sandboxConfigured:Boolean(env.stripeTestConnected),testPriceCents:price,testPriceConfigured:Boolean(price),
    checkout,webhook,refundReplay:refund,checkoutReady:reasons.length===0,
    liveAllowed:governance?.live_charging_permitted===true,
    liveEnabled:!isNmlsTrainingCourse(course.id)&&liveEligibility.allowed&&env.stripeMode==='live'&&env.liveEnabled===true&&governance?.live_charging_permitted===true,
    globalMode:env.stripeMode,globalLiveSwitch:env.liveEnabled,reasons,
    source:'Current server configuration / checkout catalog / offering_public_status / version-scoped acceptance evidence',
    note:'Credential presence is configuration only. This view never creates a checkout, replays a webhook or enables live payments.'};
}

export function mediaReadiness(course, datasets, events, videoMap={}) {
  const code=Object.values(STREAM_MEDIA).filter(a=>a.courseId===course.id);
  const db=(datasets.media?.rows||[]).filter(a=>a.course_id===course.id);
  const keys=[...new Set([...code.map(a=>a.assetKey),...db.map(a=>a.asset_key)])];
  const assets=keys.map(key=>{
    const c=code.find(a=>a.assetKey===key),d=db.find(a=>a.asset_key===key);
    const uid=d?.stream_uid||videoMap[key]||null;
    const ready=(datasets.mediaGates?.rows||[]).find(a=>a.asset_key===key);
    const place=(datasets.mediaPlacements?.rows||[]).find(a=>a.asset_key===key);
    const playback=evidenceFor(events,course,'media',`${key}:playback`);
    if(playback.status==='verified' && (playback.metadata?.streamUid!==uid || !uid)) {playback.status='stale';playback.reason='Playback evidence does not match the current Stream UID';}
    return {assetKey:key,source:c&&d?'code + console':c?'code registry':'console',uid:/^[a-f0-9]{32}$/i.test(uid||'')?uid:null,
      produced:d?.source_sha256?'Uploaded source recorded':c?'Code binding exists; master acceptance unverified':'Upload not confirmed',
      captions:d?.captions_verified_at||null,transcript:d?.transcript_verified_at||null,
      delivery:'Signed Stream required; provider/private-origin acceptance must be checked',
      placement:place?.placement_status|| (c?'code_bound':'not_placed'),
      releaseReady:completeSource(datasets.mediaGates)&&ready?.release_ready===true,
      outstandingGates:ready?.outstanding_gates||[],playback,
      blockers:[!/^[a-f0-9]{32}$/i.test(uid||'')?'Missing or invalid Stream UID':null,!d?.captions_verified_at?'Captions provider readback not recorded':null,
        !d?.transcript_verified_at?'Transcript verification not recorded':null,playback.status!=='verified'?'Signed playback acceptance not recorded':null,!ready?.release_ready?'Release review gates incomplete':null].filter(Boolean)};
  });
  const requirements=evidenceFor(events,course,'media','requirements');
  const requiredCount=requirements.status==='verified'&&Number.isSafeInteger(requirements.metadata?.requiredCount)?requirements.metadata.requiredCount:null;
  return {assets,targets:deliveriesForCourse(course.id),knownAssetCount:keys.length,requiredCount,
    inventoryComplete:completeSource(datasets.media),requirements,
    source:'STREAM_MEDIA / video_assets / video_release_readiness / current_video_placements / current server UID map',
    blockerCount:assets.reduce((n,a)=>n+a.blockers.length,0)+(requiredCount===null?1:Math.max(0,requiredCount-keys.length))};
}
