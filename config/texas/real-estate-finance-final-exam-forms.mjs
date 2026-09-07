/** Four sixty-item forms. Two pairs share16, other pairs15; no pair exceeds20.
 *148 distinct authored items:92 shared across exactly two forms and56 unique to one form.
 *Interleaved topic allocation keeps every required topic on every form. No public answer key.
 */
import {EXAM_BANK} from './real-estate-finance-final-exam-bank.mjs';
import {TOPICS} from './real-estate-finance-course-form.mjs';
const queues=TOPICS.map(t=>EXAM_BANK.filter(q=>q.topic===t.code));
const ordered=[];while(queues.some(q=>q.length))for(const q of queues)if(q.length)ordered.push(q.shift());
const bins={A:[],B:[],C:[],D:[]};let cursor=0;
for(const [a,b,n] of [['A','B',16],['A','C',15],['A','D',15],['B','C',15],['B','D',15],['C','D',16]])for(let i=0;i<n;i++){const id=ordered[cursor++].id;bins[a].push(id);bins[b].push(id);}
for(const v of ['A','B','C','D'])for(let i=0;i<14;i++)bins[v].push(ordered[cursor++].id);
export const FORM_DEFINITIONS=Object.freeze(Object.fromEntries(Object.entries(bins).map(([version,itemIds])=>[version,Object.freeze({version,id:`REF-FORM-${version}`,itemIds:Object.freeze(itemIds),questionCount:60,passingPercent:70,passingCount:42,closedBook:true})])));
export const FORMS=Object.freeze(Object.fromEntries(Object.entries(FORM_DEFINITIONS).map(([version,definition])=>[version,definition.itemIds])));
export const ROTATION=Object.freeze({versions:Object.freeze(['A','B','C','D']),subsequentAttemptMustDiffer:true,secondFailureRequiresRetake:true,authority:'22TAC535.62(b)(8),535.65(h)–(i); current TREC published rules require reviewer verification'});
const byId=new Map(EXAM_BANK.map(q=>[q.id,q]));
for(const f of Object.values(FORM_DEFINITIONS)){if(f.itemIds.length!==60||new Set(f.itemIds).size!==60)throw Error(`REF form size ${f.version}`);for(const t of TOPICS)if(!f.itemIds.some(id=>byId.get(id).topic===t.code))throw Error(`REF missing topic ${f.version}/${t.code}`);}
for(const a of Object.values(FORM_DEFINITIONS))for(const b of Object.values(FORM_DEFINITIONS))if(a.version<b.version&&a.itemIds.filter(id=>b.itemIds.includes(id)).length>20)throw Error('REF overlap');
export default FORMS;
