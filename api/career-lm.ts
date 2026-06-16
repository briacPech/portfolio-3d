import { getCandidateProfile, CAREER_OPS_SYSTEM } from './_career-utils';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './_llm-providers';
import { PREMIUM_MODEL, LETTER_MODEL } from './_llm-models';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { companyName, role, jobText, isPremium } = req.body || {};
    if (!companyName || !role) return res.status(400).json({ error: "Entreprise ou rôle manquant" });

    const profile = await getCandidateProfile();

    const prompt = `Rédige une lettre de motivation française hautement professionnelle et adaptée au profil d'un expert "No-Code / IA / Product Builder" (formation Maestro) pour :
Entreprise : ${companyName}
Poste : ${role}

Description du poste :
${jobText || 'Non fournis'}

Profil du candidat :
${profile.cvText}

Règles de génération expertes pour éviter le style robotique d'IA :
- PAS d'expressions clichées ou ampoulées comme "Je vous écris ce jour pour exprimer mon enthousiasme débordant", "titulaire d'un master, dynamique, motivé et rigoureux".
- Style : Pro, percutant, authentique, humble mais assuré. Valorise l'approche "Product Builder" pragmatique : concevoir des solutions métiers adaptées rapidement, automatiser au maximum avec des outils comme Make ou n8n, structurer proprement les données métier sans code inutile.
- Strictement 3 paragraphes principaux :
  1. Accroche personnalisée (VOUS) : pourquoi cette entreprise spécifique et son actualité ou sa mission, son besoin d'automatisation ou d'outils fluides, lien immédiat de pertinence avec le poste.
  2. Valeur ajoutée (MOI) : mes réalisations concrètes d'automatisation ou de conception de produits (ex: Festival Connect), compétences d'intégration IA & outils applicables directement à leurs enjeux opérationnels, sans jamais mentir ni inventer d'expérience.
  3. Projection et action (NOUS) : perspectives d'optimisation de leurs opérations/produits, proposition d'un échange direct.
- Formule de politesse finale distinguée et moderne.
- Mets en évidence ton hybridité : tu n'es pas qu'un tech, tu es aussi un commercial capable de comprendre les enjeux métiers et de négocier.

Tu dois UNIQUEMENT retourner du JSON strict avec cette structure :
{
  "subject": "Objet clair et percutant de la lettre",
  "letter": "Le contenu complet de la lettre de motivation (avec retours à la ligne)",
  "tone": "Description courte du ton utilisé (ex: Direct, pragmatique, orienté ROI)"
}

Aucune phrase d'intro, uniquement le JSON.`;

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
