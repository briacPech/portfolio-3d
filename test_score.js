import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
let apiKey = '';

for (const line of envFile.split('\n')) {
  if (line.startsWith('GROQ_API_KEY=')) apiKey = line.split('=')[1].trim();
}

const groq = createGroq({ apiKey });

async function testScore() {
  console.log("Testing generateObject with llama3-70b-8192...");
  try {
    const { object } = await generateObject({
      model: groq('llama3-70b-8192'),
      prompt: "Give me a random number between 1 and 10",
      schema: z.object({
        number: z.number(),
      }),
      mode: 'json'
    });
    console.log("Success:", object);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testScore();
