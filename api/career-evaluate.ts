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

    const prompt = `Voici le profil d'un candidat français :
- Poste visé : ${profile.targetRole}
- Secteur : ${profile.sector}
- Localisation idéale : ${profile.location}
- Attentes salariales : ${profile.salaryExpectation}
- Ce qu'il souhaite éviter : ${profile.absolutelyAvoid}
- Ton souhaité : ${profile.responseTone}

Le candidat est Briac, possédant un profil hybride expert "Commercial + No-Code / IA / Automatisation", diplômé de la formation Maestro No Code.
Pas un développeur pur.
Tu dois valoriser en priorité :
- La conception de solutions métiers / Product Builder,
- L'automatisation complète de workflows de process,
- La structuration de bases de données,
- Les intégrations d'APIs et outils SaaS,
- Le profil hybride commercial (négo, pragmatisme métier).

RÈGLES D'ORIENTATION & DE SCORING (CRITIQUES) :
1. Ne jamais mélanger les offres no-code/product avec les postes de développeur pur (backend, mobile natif, DevOps).
2. Catégories idéales : No-Code, Product Builder, Automation, Ops, Digital.
3. Si la note calculée / 5 est < 3/5, le verdict DOIT être 'ÉCARTER' ou 'PASSER'.

Voici le CV/Background actuel du candidat :
${profile.cvText}

Voici l'offre d'emploi copiée-collée :
${jobTextOrUrl}

Calcule la note globale sur 5 de manière objective selon les dimensions (Compétences techniques, Expérience, Secteur, Localisation, Salaire, Culture, Évolution, Séniorité).
Extrais les mots-clés ATS clés détectés dans l'offre.
Rédige un conseil stratégique personnalisé pour postuler.

Retourne un JSON strict avec : jobSummary, dimensions (8 entrées avec name, weight, score, grade, reasoning), globalScore, globalGrade, verdict (POSTULER|GARDER EN VEILLE|PASSER), strengths[], weaknesses[], atsKeywords[], festivalConnectArgument, applicationAdvice, expired (boolean).`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: CAREER_OPS_SYSTEM,
      prompt: prompt,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return res.status(200).json(JSON.parse(cleanText || '{}'));
  } catch (error: any) {
    console.error("Evaluate API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
