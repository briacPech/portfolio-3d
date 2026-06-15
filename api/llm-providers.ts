import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import type { ZodSchema } from 'zod';
import { PREMIUM_MODEL } from './llm-models.js';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CallLLMOptions {
  model: string;
  provider?: 'groq' | 'gemini';
  schema?: ZodSchema;
  temperature?: number;
}

export async function callGroq(prompt: string, options: CallLLMOptions) {
  if (options.schema) {
    const { object } = await generateObject({
      model: groq(options.model),
      prompt,
      schema: options.schema,
      mode: 'json',
      temperature: options.temperature ?? 0.2,
      maxRetries: 1,
    });
    return object;
  } else {
    const { text } = await generateText({
      model: groq(options.model),
      prompt,
      temperature: options.temperature ?? 0.7,
      maxRetries: 1,
    });
    return text;
  }
}

export async function callGemini(prompt: string, options: CallLLMOptions) {
  const modelName = options.model === PREMIUM_MODEL ? options.model : PREMIUM_MODEL;
  if (options.schema) {
    const { object } = await generateObject({
      model: google(modelName),
      prompt,
      schema: options.schema,
      temperature: options.temperature ?? 0.2,
    });
    return object;
  } else {
    const { text } = await generateText({
      model: google(modelName),
      prompt,
      temperature: options.temperature ?? 0.7,
    });
    return text;
  }
}

export async function callLLM(prompt: string, options: CallLLMOptions) {
  if (options.provider === 'gemini') {
    return callGemini(prompt, options);
  }

  try {
    return await callGroq(prompt, options);
  } catch (groqError: any) {
    console.warn("Groq failed:", groqError?.message || groqError);
    try {
      console.log("Falling back to Gemini...");
      return await callGemini(prompt, { ...options, provider: 'gemini' });
    } catch (geminiError: any) {
      console.error("Gemini fallback also failed:", geminiError?.message || geminiError);
      throw new Error(`Failed after 3 attempts. Last error: ${groqError?.message || 'Unknown Groq error'}. Gemini fallback error: ${geminiError?.message || 'Unknown Gemini error'}`);
    }
  }
}
