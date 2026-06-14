import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { companyName, role, jobText } = req.body || {};
    if (!companyName || !role) return res.status(400).json({ error: "Entreprise ou rôle manquant" });

    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Clé Gemini manquante" });

    const profile = await getCandidateProfile();

    const prompt = `Voici le profil du candidat :
${profile.cvText}

Voici l'offre d'emploi cible :
Rôle: ${role}
Entreprise: ${companyName}
Détails de l'offre: ${jobText || 'Non fournis'}

Rédige une lettre de motivation ou un message de prospection percutant (selon ce qui est le plus adapté).
Le ton doit être direct, professionnel, légèrement audacieux, et mettre en valeur le côté hybride (produit/business) et pragmatique du profil.

Retourne un JSON strict : { "letterMarkdown": "..." }`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: CAREER_OPS_SYSTEM,
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return res.status(200).json(JSON.parse(cleanText || '{}'));
  } catch (error: any) {
    console.error("Cover Letter API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
