/** Student-facing formative proposal. No final-examination payload is imported here. */
import { PAIRS_01_04 } from './law-of-contracts-formative-01-04.mjs';
import { PAIRS_05_07 } from './law-of-contracts-formative-05-07.mjs';
import { PAIRS_08_11 } from './law-of-contracts-formative-08-11.mjs';
const pairs=[...PAIRS_01_04,...PAIRS_05_07,...PAIRS_08_11];
const codes=Array.from({length:11},(_,i)=>`T${String(i+1).padStart(2,'0')}`);
export const TOPIC_QUIZZES=Object.freeze(Object.fromEntries(codes.map(code=>[code,Object.freeze(pairs.filter(p=>p.tests.startsWith(code)).map(p=>p.primary))])));
export const REPLACEMENTS=Object.freeze(Object.fromEntries(codes.map(code=>[code,Object.freeze(pairs.filter(p=>p.tests.startsWith(code)).map(p=>p.replacement))])));
export const UNIT_OBJECTIVES=Object.freeze(Object.fromEntries([...new Set(pairs.map(p=>p.tests))].map(code=>[code,pairs.filter(p=>p.tests===code).map(p=>p.objective).join(' ')])));
export const FORMATIVE_POLICY=Object.freeze({allPrimaryDecisionsMustBeCorrect:true,incorrectResponseShowsRationale:true,relatedSuccessorForEachPrimary:true,answerAuthoredAtIndex:0,choiceOrderMustBePermutedByDelivery:true,finalPayloadIncluded:false,status:'AUTHOR_PROPOSAL_PENDING_INDEPENDENT_REVIEW'});
if(pairs.length!==81 || Object.keys(UNIT_OBJECTIVES).length!==80) throw Error('Incomplete LOC formative coverage');
for(const code of codes) if(TOPIC_QUIZZES[code].length<3) throw Error(`Missing minimum quiz count ${code}`);
