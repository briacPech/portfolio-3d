import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { jobTextOrUrl } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Clé Gemini manquante" });

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

Retourne un JSON strict respectant CE FORMAT EXACT (pas de markdown en dehors des valeurs si nécessaire, mais préfère du texte simple pour le PDF) :
{
  "identity": { "name": "Prénom Nom", "contact": "Email • Téléphone • LinkedIn", "location": "Ville" },
  "title": "Titre du poste visé",
  "summary": "Accroche percutante...",
  "skills": { "hard": ["Compétence 1", "Compétence 2"], "soft": ["Soft skill 1"] },
  "experience": [ { "company": "Nom", "role": "Titre", "duration": "Dates", "bullets": ["Point 1", "Point 2"] } ],
  "projects": [ { "name": "Projet", "description": "Desc", "technologies": ["Tech 1"] } ],
  "education": [ { "degree": "Diplôme", "school": "École", "date": "Année" } ],
  "tools": ["Outil 1", "Outil 2"],
  "isPureDevDetected": false,
  "pureDevWarning": ""
}`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Erreur Gemini API: ${response.status}`);
    }

    const data: any = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    const cleanText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return res.status(200).json(JSON.parse(cleanText || '{}'));
    
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
