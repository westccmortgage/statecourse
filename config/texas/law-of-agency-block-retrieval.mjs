import { allItems, replacementFor } from './law-of-agency-question-bank.mjs';

// Adapt the existing reviewed Law of Agency items. No question text or answer is authored here.
const entries = [];
for (const primary of allItems()) {
  const match = /^LOA-(T\d{2}U\d+)-Q(\d*)$/.exec(primary.id);
  if (!match) throw new Error(`Unmapped Law of Agency item: ${primary.id}`);
  const blockId = match[1].toLowerCase();
  const id = `${blockId}-q${match[2] || '1'}`;
  const replacement = replacementFor(primary.id);
  if (!replacement) throw new Error(`Missing Law of Agency replacement: ${primary.id}`);
  const replacementId = `${id}-replacement`;
  const adapt = (item,role) => Object.freeze({
    sourceQuestionId:item.id,blockId,concept:primary.tests,role,
    replacementId:role==='primary'?replacementId:null,remediationScreen:item.screen,
    prompt:item.prompt,choices:item.choices,correctChoice:item.correctChoice,rationale:item.rationale,
  });
  entries.push([id,adapt(primary,'primary')],[replacementId,adapt(replacement,'replacement')]);
}
export const LAW_OF_AGENCY_RETRIEVAL = Object.freeze(Object.fromEntries(entries));

export function completeLawOfAgencyDelivery(delivery) {
  return {...delivery,assignmentId:delivery.moduleId,blocks:delivery.blocks.map(block=>{
    const screens=block.screens.map(screen=>({...screen}));
    const existing=new Set(screens.filter(s=>s.type==='retrieval').map(s=>s.questionId));
    for(const [questionId,item] of entries) {
      if(item.blockId!==block.id||item.role!=='primary'||existing.has(questionId))continue;
      screens.push({id:`${block.id}-retrieval-${questionId}`,sequence:screens.length+1,type:'retrieval',title:'Additional retrieval check',questionId});
    }
    for(const screen of screens.filter(s=>s.type==='retrieval')) {
      const item=LAW_OF_AGENCY_RETRIEVAL[screen.questionId];
      if(!item||item.blockId!==block.id||!screens.some(s=>s.id===item.remediationScreen))throw new Error(`Incomplete Law of Agency retrieval: ${screen.id}`);
    }
    return {...block,screens};
  })};
}
