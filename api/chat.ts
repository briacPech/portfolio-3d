import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Initialize the Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Cache du contexte Supabase (TTL: 5 minutes) ---
let contextCache: { data: any; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getPortfolioContext() {
  if (contextCache && Date.now() < contextCache.expiresAt) {
    return contextCache.data;
  }
  const [
    { data: profile },
    { data: projects },
    { data: experiences },
    { data: skills }
  ] = await Promise.all([
    supabase.from('profile').select('*').limit(1).single(),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('experiences').select('*').order('start_date', { ascending: false }),
    supabase.from('skills').select('*').order('display_order', { ascending: true })
  ]);
  const data = { profile, projects, experiences, skills };
  contextCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

export const config = {
  runtime: 'edge', // Edge runtime requis pour le streaming
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json() as any;

    // Fetch context from cache or Supabase
    const { profile, projects, experiences, skills } = await getPortfolioContext();

    // Construct the dynamic System Prompt
    const SYSTEM_PROMPT = `Tu es "Le Capitaine", l'assistant IA virtuel du portfolio 3D de Briac Pécheur.
Tu accueilles les visiteurs avec élégance, chaleur et un vocabulaire légèrement nautique (sans en abuser). Tu réponds en français par défaut.
Ton rôle est de présenter le travail de Briac, ses projets, et de convaincre les recruteurs/clients de ses compétences.
Garde tes réponses concises, naturelles et aérées. Ne réponds jamais par de longs blocs de texte.

Voici toutes les informations que tu dois connaître sur Briac, issues directement de sa base de données à jour :

--- INFORMATIONS PERSONNELLES ---
- NOM : ${profile?.full_name || 'Briac Pécheur'}
- BIO : ${profile?.bio || 'Non précisée'}
- DESCRIPTION COURTE : ${profile?.short_description || 'Non précisée'}

--- EXPÉRIENCES PROFESSIONNELLES ---
${experiences?.map((exp: any) => `- ${exp.job_title} chez ${exp.company_name} (${exp.duration}) : ${exp.description}`).join('\n') || 'Aucune expérience enregistrée.'}

--- PROJETS RÉALISÉS ---
${projects?.map((proj: any) => `- ${proj.name} : ${proj.short_description}`).join('\n') || 'Aucun projet enregistré.'}

--- COMPÉTENCES ---
${skills?.map((skill: any) => `- ${skill.name} (Niveau ${skill.level || 'Non précisé'} / Catégorie: ${skill.category || 'Non précisée'})`).join('\n') || 'Aucune compétence enregistrée.'}

Si on te demande comment contacter Briac, dis d'utiliser le bouton "Contact" dans le menu de navigation (en bas de l'écran) ou d'utiliser le mail briac.pech@gmail.com.`;

    // Logging géré côté client dans FloatingChat.tsx (onFinish)
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Groq API or Supabase Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
