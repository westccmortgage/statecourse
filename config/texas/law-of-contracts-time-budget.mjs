/** Revised authoring inventory. Original teaching floors are preserved despite an added early scenario. */
import {TOPICS,FORM} from './law-of-contracts-course-form.mjs';
import {TOPIC_QUIZZES} from './law-of-contracts-question-bank.mjs';
import {SCENARIOS,MISCONCEPTION_CHECKS} from './law-of-contracts-learning-instruments.mjs';
export const RATES=Object.freeze({label:'PROVIDER_METHODOLOGY_NOT_OBSERVED_TIME',firstPassWordsPerMinute:140,masteryStudyWordsPerMinute:60,activityMinutes:Object.freeze({statuteReadingExercise:12,appliedExercise:10,quizItem:2,misconceptionCheck:3,scenario:20,moduleRecap:5}),replacementSeenFraction:1/3});
const floors=[12740,8260,5320,8960,23100,8400,8260,18620,7140,8400,2380];
const statute=[2,1,1,1,2,1,1,2,1,1,1];
const applied=[2,2,1,2,3,2,2,3,1,2,2];
const a=RATES.activityMinutes;
export const BUDGET=Object.freeze(TOPICS.map((topic,i)=>{
  const quizItems=TOPIC_QUIZZES[topic.code].length;
  const scenarios=SCENARIOS.filter(s=>s.afterTopic===topic.code && !s.courseLevel).length;
  const misconceptionChecks=MISCONCEPTION_CHECKS.filter(m=>m.topicCode===topic.code).length;
  const quizMinutes=quizItems*a.quizItem,exerciseMinutes=statute[i]*a.statuteReadingExercise+applied[i]*a.appliedExercise;
  const scenarioMinutes=scenarios*a.scenario,misconceptionMinutes=misconceptionChecks*a.misconceptionCheck;
  const activityMinutes=quizMinutes+exerciseMinutes+scenarioMinutes+misconceptionMinutes+a.moduleRecap;
  const readingMinutes=floors[i]/RATES.firstPassWordsPerMinute;
  return Object.freeze({topicCode:topic.code,topic:topic.topic,units:topic.units.length,prescribedMinutes:topic.subtotalMinutes,
    quizItems,quizMinutes,replacementMinutes:Math.round(quizItems*RATES.replacementSeenFraction*a.quizItem),
    statuteReadingExercises:statute[i],appliedExercises:applied[i],exerciseMinutes,scenarios,scenarioMinutes,misconceptionChecks,misconceptionMinutes,recapMinutes:a.moduleRecap,
    activityMinutes,readingMinutes,minimumProseWords:floors[i],minimumProseWordsPerUnit:Math.round(floors[i]/topic.units.length),
    baselineFloorPreserved:true,baselinePlanningActivityMinutes:topic.subtotalMinutes-readingMinutes,
    minimumModeledMinutes:readingMinutes+activityMinutes,addedInstructionOverrunMinutes:Math.max(0,readingMinutes+activityMinutes-topic.subtotalMinutes),
    activityOverrunMinutes:Math.max(0,activityMinutes-topic.subtotalMinutes)});
}));
export const COURSE_LEVEL=Object.freeze({capstoneScenarios:SCENARIOS.filter(s=>s.courseLevel).length,minutes:SCENARIOS.filter(s=>s.courseLevel).length*a.scenario,note:'Course-level capstone counted outside every topic allocation.'});
export const TOTALS=Object.freeze({prescribedMinutes:FORM.totalMinutes,budgetedMinutes:FORM.totalMinutes,
  activityMinutes:BUDGET.reduce((s,b)=>s+b.activityMinutes,0),readingMinutes:BUDGET.reduce((s,b)=>s+b.readingMinutes,0),
  baselinePlanningActivityMinutes:BUDGET.reduce((s,b)=>s+b.baselinePlanningActivityMinutes,0),
  quizItems:BUDGET.reduce((s,b)=>s+b.quizItems,0),statuteReadingExercises:BUDGET.reduce((s,b)=>s+b.statuteReadingExercises,0),appliedExercises:BUDGET.reduce((s,b)=>s+b.appliedExercises,0),
  scenarios:SCENARIOS.length,topicScenarios:SCENARIOS.filter(s=>!s.courseLevel).length,misconceptionChecks:MISCONCEPTION_CHECKS.length,
  minimumProseWords:floors.reduce((s,n)=>s+n,0),activityOverrunMinutes:BUDGET.reduce((s,b)=>s+b.activityOverrunMinutes,0),
  addedInstructionOverrunMinutes:BUDGET.reduce((s,b)=>s+b.addedInstructionOverrunMinutes,0),
  minimumTopicModeledMinutes:BUDGET.reduce((s,b)=>s+b.minimumModeledMinutes,0)});
export const REVISION_NOTE='The original first scenario after T05 occurred at 740 prescribed minutes. LOC-SC0 is added after T03 at 345 prescribed minutes so the first and subsequent scenario gaps remain within ten 50-minute credit hours. All 111,580 teaching-word floors remain unchanged. The added 20-minute provider-estimated activity is reported as an overrun, not used to reduce reading or claim observed time.';
if(TOTALS.minimumProseWords!==111580 || TOTALS.scenarios!==6 || TOTALS.addedInstructionOverrunMinutes!==20) throw Error('LOC revised inventory drift');
export default {RATES,BUDGET,COURSE_LEVEL,TOTALS,REVISION_NOTE};
