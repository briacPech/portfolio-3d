import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { jobTextOrUrl } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Clé Gemini manquante" });

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

Retourne un JSON strict : { "adaptedCvMarkdown": "...", "adjustmentsSummary": "...", "isPureDevDetected": false, "pureDevWarning": "", "injectedKeywords": [{"keyword": "...", "justification": "..."}] }`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: CAREER_OPS_SYSTEM,
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return res.status(200).json(JSON.parse(cleanText || '{}'));
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
