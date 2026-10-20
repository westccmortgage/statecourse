// Operational observations, not provider success relabelled as quality.
export type RoutingObservation={
  attemptId:string;roleKey:string;roleVersion:string;family:string;configuration:string;
  provider:string|null;model:string|null;state:string;verifiedQuality:'pass'|'fail'|null;
  failureType:string|null;latencyMs:number|null;actualCost:number|null;repairRequired:boolean;finalAccepted:boolean;
};
export function outcomeScore(history:readonly RoutingObservation[],roleKey:string,roleVersion:string,
  family:string,configuration:string,provider?:string,model?:string){
  // An executor without a declared provider/model has no comparable paid history.
  if(!provider||!model)return {score:0.5,samples:0,passed:0,reason:'no comparable verified history'};
  const sample=history.filter(o=>o.roleKey===roleKey&&o.roleVersion===roleVersion&&o.family===family
    &&o.configuration===configuration&&o.provider===provider&&o.model===model
    &&(o.verifiedQuality!==null||['failed_known','output_limited','outcome_unknown'].includes(o.state)));
  if(sample.length<3)return {score:0.5,samples:sample.length,passed:0,reason:'fewer than three comparable measured outcomes'};
  const passed=sample.filter(o=>o.state==='succeeded'&&o.verifiedQuality==='pass').length;
  return {score:(passed+1)/(sample.length+2),samples:sample.length,passed,
    reason:`${passed}/${sample.length} independently accepted or failed outcomes for this role, version and model`};
}
