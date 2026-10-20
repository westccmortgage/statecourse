import { sha256 } from '../../core-v2/kernel/ids.ts';

// A projection must use the material the decision actually read, never today's
// mutable product row. Refuse ambiguous legacy fields rather than invent data.
export function sourceSnapshot(rows: Record<string, unknown>[], key: string) {
  const candidates=rows.filter(r=>r.external_subject_key===key&&r.segment_kind==='record_fields');
  if(candidates.length!==1)return null;
  const row=candidates[0],content=String(row.content);
  if(sha256(content)!==row.content_sha256)return null;
  const fields:Record<string,string>={};
  for(const line of content.split('\n')){
    const at=line.indexOf(': '),name=line.slice(0,at);
    if(at<1||!/^[a-z][a-z0-9_]*$/.test(name)||Object.hasOwn(fields,name))return null;
    fields[name]=line.slice(at+2);
  }
  return {recordVersion:String(row.record_version),contentHash:String(row.content_sha256),fields};
}

export function reviewKind(signature:Record<string,unknown>):'technical_recovery'|'human_decision' {
  // This marker is written by the scheduler when independent coverage could
  // not be obtained. It is not two competing, verified business alternatives.
  return signature.reason==='independence_unavailable'?'technical_recovery':'human_decision';
}
