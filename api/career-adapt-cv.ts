import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './llm-providers.js';
import { PREMIUM_MODEL, CV_DRAFT_MODEL } from './llm-models.js';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { jobTextOrUrl, isPremium } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    const profile = await getCandidateProfile();

    const prompt = `Voici le profil du candidat :
${profile.cvText}

Voici l'offre d'emploi cible :
${jobTextOrUrl}

Adapte le CV pour maximiser l'impact sur cette offre.
Ne mens pas sur les expériences, mais :
1. Reformule les intitulés et bullet points pour faire écho au vocabulaire de l'offre.
2. Mets en avant les compétences (hard et soft) demandées.
3. Propose une accroche percutante.
4. Structure rigoureusement la réponse selon le schéma JSON demandé, adapté pour un export PDF propre.

Tu dois UNIQUEMENT retourner du JSON strict. Aucune phrase d'intro.`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: isPremium ? PREMIUM_MODEL : CV_DRAFT_MODEL,
      provider: isPremium ? 'gemini' : 'groq',
      schema: z.object({
        identity: z.object({ name: z.string(), contact: z.string(), location: z.string() }),
        title: z.string(),
        summary: z.string(),
        skills: z.object({ hard: z.array(z.string()), soft: z.array(z.string()) }),
        experience: z.array(z.object({ company: z.string(), role: z.string(), duration: z.string(), bullets: z.array(z.string()) })),
        projects: z.array(z.object({ name: z.string(), description: z.string(), technologies: z.array(z.string()) })),
        education: z.array(z.object({ degree: z.string(), school: z.string(), date: z.string() })),
        tools: z.array(z.string()),
        isPureDevDetected: z.boolean(),
        pureDevWarning: z.string().optional()
      })
    });

    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
