import {createHash} from 'node:crypto';
export const digest=text=>createHash('sha256').update(text).digest('hex');
// Split by headings/paragraphs, retaining every character in the normalized text.
// Hard limits also apply to a single enormous paragraph; offsets remain auditable.
export function chunkLesson(text,{maxChars=1800}={}){
 if(typeof text!=='string'||!Number.isInteger(maxChars)||maxChars<200)throw Error('invalid_chunk_input');
 const normalized=text.replace(/\r\n/g,'\n');const chunks=[];let start=0,heading='Lesson';
 while(start<normalized.length){
  let end=Math.min(start+maxChars,normalized.length);
  if(end<normalized.length){const boundary=normalized.lastIndexOf('\n\n',end-2);if(boundary>start+maxChars/2)end=boundary+2;}
  if(end<normalized.length&&/[\uD800-\uDBFF]/.test(normalized[end-1])&&/[\uDC00-\uDFFF]/.test(normalized[end]))end--;
  const excerpt=normalized.slice(start,end);
  const headings=[...excerpt.matchAll(/^#{1,6}\s+(.+)$/gm)];
  if(headings.length)heading=headings[0][1];
  chunks.push({id:digest(`${start}:${end}:${excerpt}`).slice(0,24),heading,start,end,excerpt});
  if(headings.length)heading=headings.at(-1)[1];start=end;
 }
 return chunks;
}
export function selectChunks(chunks,query,{limit=5}={}){
 const terms=[...new Set(String(query).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)??[])];
 const ranked=chunks.map((chunk,index)=>({chunk,index,score:terms.reduce((sum,t)=>sum+(chunk.excerpt.toLowerCase().includes(t)?1:0)+(chunk.heading.toLowerCase().includes(t)?2:0),0)}));
 return ranked.sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,limit).sort((a,b)=>a.index-b.index).map(x=>x.chunk);
}
