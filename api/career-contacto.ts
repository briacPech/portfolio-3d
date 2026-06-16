import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './llm-providers.js';
import { JOB_SCORING_MODEL } from './llm-models.js';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { companyName, role, jobText } = req.body || {};
    if (!companyName || !role) return res.status(400).json({ error: "Entreprise ou rôle manquant" });

    const profile = await getCandidateProfile();

    const prompt = `Rédige un message d'approche LinkedIn (Icebreaker) extrêmement court, percutant et professionnel pour un recruteur ou un manager chez ${companyName} concernant le poste de ${role}.

Profil du candidat :
${profile.cvText}

Description du poste :
${jobText || "Poste ciblé dans le domaine d'expertise du candidat."}

RÈGLES STRICTES :
1. Maximum 300 caractères (c'est la limite d'une note de connexion LinkedIn).
2. Ton direct, chaleureux, "Closer" et "Product Builder". Ne sois pas générique.
3. PAS de "Bonjour, je me permets de vous contacter", va droit au but.
4. Terminer par une courte question ouverte ou un appel à l'action pour inciter à la réponse.
5. Utilise le tutoiement (très courant en startup/tech) ou un vouvoiement très moderne.

Tu dois uniquement retourner un JSON strict avec la clé "message".`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: JOB_SCORING_MODEL,
      provider: 'groq',
      schema: z.object({
        message: z.string()
      })
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Contacto API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
