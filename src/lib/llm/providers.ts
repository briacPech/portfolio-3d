import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { PREMIUM_MODEL } from './models';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CallLLMOptions {
  model: string;
  provider?: 'groq' | 'gemini';
  schema?: any; // Zod schema for JSON generation
  temperature?: number;
}

export async function callGroq(prompt: string, options: CallLLMOptions) {
  if (options.schema) {
    const promptWithInstructions = prompt + "\n\nCRITICAL INSTRUCTION: You must return ONLY raw JSON matching the exact requested structure. Do not wrap in markdown blocks like ```json. Do not include any explanations.";
    
    const { text } = await generateText({
      model: groq(options.model),
      prompt: promptWithInstructions,
      temperature: options.temperature ?? 0.2,
    });
    
    try {
      const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Groq JSON:", text);
      throw new Error("Failed to parse JSON from Groq output.");
    }
  } else {
    const { text } = await generateText({
      model: groq(options.model),
      prompt,
      temperature: options.temperature ?? 0.7,
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
    // Default to Groq
    return await callGroq(prompt, options);
  } catch (error) {
    console.warn("Groq failed, falling back to Gemini", error);
    return callGemini(prompt, { ...options, provider: 'gemini' });
  }
}
