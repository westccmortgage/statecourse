import {createLearningCoach} from './learning-coach.js';
// Uses the same public teaching corpus as free practice. A changed manuscript
// digest has no matching context and stays unavailable until rebuilt/reviewed.
export async function attachReadingCoach({anchor,courseId,lessonId,lessonText,getEligible}){
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(lessonText));
 const lessonDigest=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 return createLearningCoach({anchor,getContext:()=>{const scope=getEligible();return scope&&!document.hidden?{courseId,lessonId,lessonDigest,scope,question:null,selected:null}:null;},goToQuestion(){}});
}
