import {requestCoach} from '../../netlify/functions/_lib/learning-coach-provider.mjs';
import {requestGemini} from '../../netlify/functions/_lib/learning-coach-gemini.mjs';
export {requestGemini};
export const providers={openai:requestCoach,gemini:requestGemini};
