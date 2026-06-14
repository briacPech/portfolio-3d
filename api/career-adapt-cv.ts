import { GoogleGenAI } from '@google/genai';
import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { jobTextOrUrl } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Clé Gemini manquante" });
    const ai = new GoogleGenAI({ apiKey });

    const profile = await getCandidateProfile();

    const prompt = `Tu es un expert CV pour le marché français, spécialisé dans les profils No-Code / IA / Automatisation.

PROFIL CANDIDAT
Poste ciblé : ${profile.targetRole}
Secteur : ${profile.sector}
Localisation : ${profile.location}

CV d'origine (Markdown construit depuis la base de données) :
${profile.cvText}

Voici l'offre d'emploi ciblée :
${jobTextOrUrl}

MISSION
Adapte le CV du candidat à l'offre d'emploi.
Vérifie si le poste est orienté "Dev Pur" (développement traditionnel backend, C++, Java, Rust, infra pure). Si oui, définis isPureDevDetected à true et rédige un avertissement stratégique (pureDevWarning).
Valorise en priorité les expériences no-code, automatisation, intégrations. Ne fabrique aucune expérience absente. Injecte les mots-clés ATS de manière naturelle. Format français sobre sur une page.
Génère la version du CV en markdown adaptée.

Retourne un JSON strict : adaptedCvMarkdown, adjustmentsSummary, isPureDevDetected, pureDevWarning, injectedKeywords[{keyword, justification}].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`
    });

    return res.status(200).json({ adaptedCv: response.text });
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
