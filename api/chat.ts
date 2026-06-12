import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { SYSTEM_PROMPT } from '../src/data/systemPrompt';

// Initialize the Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const config = {
  runtime: 'edge', // Edge runtime is required for streaming
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Groq API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
