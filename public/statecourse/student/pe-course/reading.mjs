// Presentation-only views over the preserved manuscript. Offsets are UTF-16
// string offsets; concatenating every chunk.text reproduces the source exactly.
export const READING_CHUNK_LIMIT = 4200;

function sourceBlocks(text) {
 const blocks=[];let start=0,offset=0,fence=null,heading=null;
 const flush=()=>{if(offset>start){blocks.push({start,end:offset,heading});start=offset;heading=null;}};
 for(const line of text.match(/[^\n]*(?:\n|$)/g)||[]){
  if(!line)continue;
  const marker=line.match(/^\s{0,3}(`{3,}|~{3,})/);
  const title=!fence&&line.match(/^(#{1,6})\s+(.+?)(?:\r?\n)?$/);
  if(title){flush();heading={level:title[1].length,title:title[2],offset};offset+=line.length;flush();continue;}
  if(marker&&!fence){flush();fence=marker[1];}
  else if(marker&&fence&&marker[1][0]===fence[0]&&marker[1].length>=fence.length){offset+=line.length;fence=null;flush();continue;}
  offset+=line.length;
  if(!fence&&!line.trim())flush();
 }
 flush();return blocks;
}

export function chunkLesson(text,moduleId,{limit=READING_CHUNK_LIMIT}={}) {
 if(typeof text!=='string'||!/^[A-Za-z0-9_-]+$/.test(moduleId))throw new TypeError('Invalid preserved reading source');
 if(!Number.isInteger(limit)||limit<128)throw new RangeError('Reading chunk limit must be at least 128');
 const chunks=[];let start=0,end=0,hasBody=false,title=moduleId,unit=null,headings=[],section=0,part=0;
 const flush=()=>{
  if(end<=start)return;
  chunks.push(Object.freeze({id:`${moduleId.toLowerCase()}-reading-${start.toString(36)}`,start,end,text:text.slice(start,end),title,unit,section,part:++part,headings:Object.freeze(headings)}));
  start=end;hasBody=false;headings=[];
 };
 for(const block of sourceBlocks(text)){
  if(end>start&&block.end-block.start<=limit&&end-start+block.end-block.start>limit)flush();
  if(block.heading){
   if(hasBody)flush();
   const h=block.heading;
   if(h.level<=2){unit=h.title.match(/^Unit\s+(\d+[A-Z])\b/)?.[1]||null;}
   // Keep a parent heading with the first child paragraph, rather than presenting
   // a heading-only page when the manuscript has consecutive headings.
   if(start===end){title=h.title;section++;part=0;}
   headings.push(h);
  }
  let position=block.start;
  while(position<block.end){
   if(end-start===limit)flush();
   let next=Math.min(block.end,position+limit-(end-start));
   if(next<block.end){
    // Prefer intact lines or words for an exceptionally long paragraph. Source
    // whitespace belongs to the earlier slice and is never deleted or rewritten.
    const available=text.slice(position,next),newline=available.lastIndexOf('\n'),space=available.search(/\s+\S*$/);
    const split=newline>=Math.floor(available.length/2)?newline+1:space>=Math.floor(available.length/2)?space+1:available.length;
    next=position+split;
    // Never bisect a UTF-16 surrogate pair.
    if(next>position&&/[\uD800-\uDBFF]/.test(text[next-1])&&/[\uDC00-\uDFFF]/.test(text[next]))next--;
   }
   if(next===position){flush();continue;}
   end=next;position=next;
   if(!block.heading&&text.slice(block.start,block.end).trim())hasBody=true;
   if(position<block.end)flush();
  }
 }
 flush();
 return Object.freeze(chunks);
}

export function readingChunkIndex(chunks,{anchor='',saved='',unitId=''}={}) {
 for(const id of [anchor,saved]){const i=chunks.findIndex(chunk=>chunk.id===id);if(i>=0)return i;}
 const i=chunks.findIndex(chunk=>chunk.headings.some(h=>new RegExp(`^Unit\\s+${unitId.replace(/[^0-9A-Z]/gi,'')}\\b`).test(h.title)));
 return i<0?0:i;
}

export function readingBookmarkKey({role,courseId,actorId,unitId,sourceHash}) {
 return `pe-course-reading:${role}:${courseId}:${actorId}:${unitId}:${sourceHash}`;
}

// No HTML or embedded source URL is trusted. This preserves the existing lesson
// presentation while rendering only the selected verbatim source slice.
export function renderLessonChunk(document,chunk) {
 const fragment=document.createDocumentFragment();let list=null,pre=null;
 for(const line of chunk.text.split('\n')){
  if(/^\s{0,3}(?:`{3,}|~{3,})/.test(line)){if(pre){pre=null;}else{pre=document.createElement('pre');fragment.append(pre);}continue;}
  if(pre){pre.textContent+=line+'\n';continue;}
  if(!line.trim()){list=null;continue;}
  const heading=line.match(/^(#{1,6})\s+(.*)$/);
  if(heading){const el=document.createElement('h'+Math.min(6,heading[1].length+2));el.textContent=heading[2];fragment.append(el);list=null;continue;}
  const bullet=line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
  if(bullet){if(!list){list=document.createElement('ul');fragment.append(list);}const el=document.createElement('li');el.textContent=bullet[1];list.append(el);continue;}
  list=null;const el=document.createElement('p');el.textContent=line;fragment.append(el);
 }
 return fragment;
}
