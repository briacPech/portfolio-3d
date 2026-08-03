import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import type { ZodSchema } from 'zod';
import { GROQ_DEFAULT_MODEL, GEMINI_DEFAULT_MODEL } from './_llm-models.js';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CallLLMOptions {
  model: string;
  provider?: 'groq' | 'gemini';
  schema?: ZodSchema;
  temperature?: number;
}

export async function callGroq(prompt: string, options: CallLLMOptions) {
  const modelName = options.model && !options.model.startsWith('gemini') ? options.model : GROQ_DEFAULT_MODEL;

  if (options.schema) {
    const promptWithInstructions = prompt + "\n\nCRITICAL INSTRUCTION: You must return ONLY raw JSON matching the exact requested structure. Do not wrap in markdown blocks like ```json. Do not include any explanations.";
    
    const { text } = await generateText({
      model: groq(modelName),
      prompt: promptWithInstructions,
      temperature: options.temperature ?? 0.2,
      maxRetries: 2,
    });
    
    try {
      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleanText.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : cleanText;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Groq JSON:", text);
      throw new Error("Failed to parse JSON from Groq output.");
    }
  } else {
    const { text } = await generateText({
      model: groq(modelName),
      prompt,
      temperature: options.temperature ?? 0.7,
      maxRetries: 2,
    });
    return text;
  }
}

export async function callGemini(prompt: string, options: CallLLMOptions) {
  const modelName = options.model && options.model.startsWith('gemini') ? options.model : GEMINI_DEFAULT_MODEL;

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
  const provider = options.provider || 'groq';

  if (provider === 'gemini') {
    try {
      return await callGemini(prompt, { ...options, model: GEMINI_DEFAULT_MODEL });
    } catch (e: any) {
      console.warn("Gemini failed, falling back to Groq:", e?.message);
      return await callGroq(prompt, { ...options, model: GROQ_DEFAULT_MODEL, provider: 'groq' });
    }
  }

  try {
    return await callGroq(prompt, { ...options, model: GROQ_DEFAULT_MODEL });
  } catch (groqError: any) {
    console.warn("Groq failed:", groqError?.message || groqError);
    try {
      console.log("Falling back to Gemini...");
      return await callGemini(prompt, { ...options, model: GEMINI_DEFAULT_MODEL, provider: 'gemini' });
    } catch (geminiError: any) {
      console.error("Gemini fallback also failed:", geminiError?.message || geminiError);
      throw new Error(`Failed after retries. Last Groq error: ${groqError?.message || 'Unknown Groq error'}. Gemini fallback error: ${geminiError?.message || 'Unknown Gemini error'}`);
    }
  }
}
