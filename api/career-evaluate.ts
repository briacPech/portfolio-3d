import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { jobTextOrUrl } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Clé Gemini manquante" });

    const profile = await getCandidateProfile();

    const toneHint = profile.responseTone
      ? `\n- Ton des réponses souhaité : ${profile.responseTone} (adapter formulations et longueur en conséquence)`
      : "";

    const prompt = `Voici le profil d'un candidat français :
- Poste visé : ${profile.targetRole}
- Secteur : ${profile.sector}
- Localisation idéale : ${profile.location}
- Attentes salariales : ${profile.salaryExpectation}
- Ce qu'il souhaite éviter à tout prix : ${profile.absolutelyAvoid}${toneHint}

Le candidat est Briac, possédant un profil hybride expert "Commercial + No-Code / IA / Automatisation", diplômé de la formation Maestro No Code (Airtable, Make, Notion, Zapier, n8n, Softr, Bubble, intégration d'API, prototypage rapide). Pas un développeur pur.
Son projet phare de référence est "Festival Connect", un système complet d'administration, logistique et de coordination d'événements et festivals conçu par lui en assemblant Bubble, Airtable, et Make, prouvant ses compétences réelles de constructeur produit (Product Builder) et d'intégrateur de flux.

Tu dois donc valoriser en priorité :
- La conception de solutions métiers / Product Builder,
- L'automatisation complète de workflows de process,
- La structuration de bases de données relationnelles complexes (Airtable),
- Les intégrations d'APIs et outils SaaS,
- Le profil hybride commercial (négo, pragmatisme métier, communication, relation client) combiné au No-code.

RÈGLES D'ORIENTATION & DE SCORING (CRITIQUES / MAILLONS FORTS DE TRI) :
1. Ne jamais mélanger les offres no-code / product / ops avec les postes de développeur pur (programmation traditionnelle, backend pur, mobile natif, DevOps infrastructure, administration système).
2. Catégories idéales et très valorisées : No-Code, Product Builder, Automation, Ops, Digital, CRM.
3. Catégories à écarter d'office ou pénaliser sévèrement (note < 2.5/5 ou verdict 'ÉCARTER') : Backend pur, programmation C++/Rust/Java, Mobile natif, DevOps infrastructure matérielle pure.
4. Si la note globale calculée / 5 est inférieure à 3/5 (French equivalency 12/20), le verdict DOIT être 'ÉCARTER' (ou 'PASSER'), sauf raison d'opportunité extraordinaire. Recommande d'écarter si score < 3/5.

Voici le CV actuel du candidat :
${profile.cvText}

Voici l'offre d'emploi copiée-collée :
${jobTextOrUrl}

Calcule la note globale sur 5 de manière objective selon les poids des 8 dimensions suivantes (les poids totalisent 100%):
- Compétences techniques (poids 25%)
- Expérience requise (poids 15%)
- Secteur / industrie (poids 10%)
- Localisation / remote (poids 10%)
- Salaire estimé (poids 15%)
- Culture entreprise (poids 10%)
- Évolution possible (poids 10%)
- Niveau de séniorité (poids 5%)

Chaque dimension doit posséder un score de 1 à 10 et un grade de A à F (90-100% = A, 80-89% = B, 70-79% = C, 60-69% = D, 50-59% = E, <50% = F).

Extrais également les mots-clés ATS clés détectés dans l'offre qu'il faut absolument reprendre dans le CV pour optimiser la compatibilité de filtrage.
Spécifie clairement comment le projet phare Festival Connect de Briac s'insère comme preuve solide d'autorité pour cette offre.
Rédige un conseil stratégique personnalisé pour postuler.

Retourne un JSON avec : jobSummary, dimensions (8 entrées avec name, weight, score, grade, reasoning), globalScore, globalGrade, verdict (POSTULER|GARDER EN VEILLE|PASSER), strengths[], weaknesses[], atsKeywords[], festivalConnectArgument, applicationAdvice, expired (boolean).`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}` }] }],
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
    console.error("Evaluate API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
