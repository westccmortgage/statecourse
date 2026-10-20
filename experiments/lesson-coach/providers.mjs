// Local comparison only. Does not enable the public coach or use learner records.
import {requestCoach, schema, instructions} from '../../netlify/functions/_lib/learning-coach-provider.mjs';
export async function requestGemini({apiKey,model,input,fetcher=fetch}){
 if(!/^[a-zA-Z0-9._-]+$/.test(model))throw Error('invalid_model');
 const response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
  method:'POST',headers:{'x-goog-api-key':apiKey,'content-type':'application/json'},signal:AbortSignal.timeout(15000),
  body:JSON.stringify({systemInstruction:{parts:[{text:instructions}]},contents:[{role:'user',parts:[{text:JSON.stringify(input)}]}],
   generationConfig:{maxOutputTokens:800,responseMimeType:'application/json',responseJsonSchema:schema,thinkingConfig:{thinkingBudget:0}}})
 });
 if(!response.ok)throw Error('provider_unavailable');
 const result=await response.json(),candidate=result.candidates?.[0];
 if(candidate?.finishReason!=='STOP')throw Error('provider_incomplete');
 const text=(candidate.content?.parts??[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('');
 return {answer:JSON.parse(text),usage:{inputTokens:result.usageMetadata?.promptTokenCount??null,outputTokens:result.usageMetadata?.candidatesTokenCount??null}};
}
export const providers={openai:requestCoach,gemini:requestGemini};
