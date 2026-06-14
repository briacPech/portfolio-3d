import { GoogleGenAI } from '@google/genai';
import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { companyName, role, jobText } = req.body || {};
    if (!companyName || !role) return res.status(400).json({ error: "Entreprise ou rôle manquant" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Clé Gemini manquante" });
    const ai = new GoogleGenAI({ apiKey });

    const profile = await getCandidateProfile();

    const prompt = `Rédige une lettre de motivation française hautement professionnelle et adaptée au profil d'un expert "No-Code / IA / Product Builder" pour :
Entreprise : ${companyName}
Poste : ${role}

Description du poste :
${jobText || "Poste d'expert dans le domaine de compétences du candidat."}

Profil du candidat :
Poste cible : ${profile.targetRole}
Compétences et CV (depuis la base de données) :
${profile.cvText}

Règles de génération expertes Career-FR pour éviter le style robotique d'IA :
- PAS d'expressions clichées ou ampoulées comme "Je vous écris ce jour pour exprimer mon enthousiasme débordant", "titulaire d'un master, dynamique, motivé et rigoureux".
- Style : Pro, percutant, authentique, humble mais assuré. Valorise l'approche "Product Builder" pragmatique.
- Strictement 3 paragraphes principaux :
  1. Accroche personnalisée (VOUS) : pourquoi cette entreprise spécifique, lien immédiat avec le poste.
  2. Valeur ajoutée (MOI) : mes réalisations concrètes d'automatisation, compétences d'intégration IA & outils (Airtable, Make, n8n) applicables à leurs enjeux.
  3. Projection et action (NOUS) : perspectives d'optimisation de leurs opérations/produits, proposition d'échange.
- Coordonnées fictives d'usage en haut, Objet clair, formule de politesse finale distinguée et moderne.

Retourne un JSON strict : { "letterMarkdown": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`
    });

    return res.status(200).json({ letter: response.text });
  } catch (error: any) {
    console.error("Cover Letter API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
