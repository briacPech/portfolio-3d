import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from '../src/lib/llm/providers.js';
import { PREMIUM_MODEL, LETTER_MODEL } from '../src/lib/llm/models.js';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { companyName, role, jobText, isPremium } = req.body || {};
    if (!companyName || !role) return res.status(400).json({ error: "Entreprise ou rôle manquant" });

    const profile = await getCandidateProfile();

    const prompt = `Voici le profil du candidat :
${profile.cvText}

Voici l'offre d'emploi cible :
Rôle: ${role}
Entreprise: ${companyName}
Détails de l'offre: ${jobText || 'Non fournis'}

Rédige une lettre de motivation ou un message de prospection percutant (selon ce qui est le plus adapté).
Le ton doit être direct, professionnel, légèrement audacieux, et mettre en valeur le côté hybride (produit/business) et pragmatique du profil.

Tu dois UNIQUEMENT retourner du JSON strict. Aucune phrase d'intro.`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: isPremium ? PREMIUM_MODEL : LETTER_MODEL,
      provider: isPremium ? 'gemini' : 'groq',
      schema: z.object({
        subject: z.string(),
        letter: z.string(),
        tone: z.string()
      })
    });

    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error("Cover Letter API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
