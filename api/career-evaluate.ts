import { getCandidateProfile, CAREER_OPS_SYSTEM } from './_career-utils';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './_llm-providers';
import { PREMIUM_MODEL, JOB_SCORING_MODEL } from './_llm-models';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { jobTextOrUrl, isPremium } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

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
- Le profil Commercial B2B pur (SDR, Closer, Account Executive, Business Developer) : Briac excelle en vente, prospection et négociation. C'est son cœur de métier initial.
- La conception de solutions métiers / Product Builder et l'automatisation de workflows.
- Le profil hybride (Commercial + Tech/No-code).

RÈGLES D'ORIENTATION & DE SCORING (CRITIQUES) :
1. REGLE ABSOLUE : Une offre purement commerciale (Vente, SDR, Closer) est une EXCELLENTE opportunité. NE PÉNALISE SURTOUT PAS une offre commerciale sous prétexte qu'elle ne mentionne pas le No-Code, l'IA ou l'automatisation. Le No-Code est un bonus, pas un pré-requis pour les offres Sales.
2. Catégories idéales (Score 4 ou 5) : Vente B2B, SDR, Closer, Account Executive, No-Code, Product Builder, Ops.
3. Catégories à écarter d'office (Score < 2.5) : Backend pur, C++/Java, Mobile natif.
4. Les champs texte de ta réponse JSON (jobSummary, strengths, weaknesses, reasoning) DOIVENT être longs, très détaillés et argumentés (plusieurs phrases). Ne fais pas de réponses courtes.

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

Tu dois UNIQUEMENT retourner du JSON strict avec EXACTEMENT cette structure (ne change pas les clés) :
{
  "jobSummary": "Rédige un résumé très détaillé et argumenté de 3 à 4 phrases expliquant le rationnel derrière ce score et l'analyse du poste.",
  "dimensions": [
    {
      "name": "Nom de la dimension",
      "weight": 0,
      "score": 0,
      "grade": "lettre",
      "reasoning": "Justification très précise et détaillée"
    }
  ],
  "globalScore": 0,
  "globalGrade": "A-F",
  "verdict": "POSTULER, GARDER EN VEILLE, ou ÉCARTER",
  "strengths": ["Point fort 1 très détaillé (1-2 phrases)", "Point fort 2 très détaillé"],
  "weaknesses": ["Point faible 1 très détaillé (1-2 phrases)", "Point faible 2 très détaillé"],
  "atsKeywords": ["mot1", "mot2"],
  "festivalConnectArgument": "Argumentaire solide de 2-3 phrases",
  "applicationAdvice": "Conseil d'approche ultra-personnalisé et stratégique",
  "expired": false
}

Aucune phrase d'intro, uniquement le JSON.`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: isPremium ? PREMIUM_MODEL : JOB_SCORING_MODEL,
      provider: isPremium ? 'gemini' : 'groq',
      schema: z.object({
        jobSummary: z.string(),
        dimensions: z.array(z.object({
          name: z.string(),
          weight: z.number(),
          score: z.number(),
          grade: z.string(),
          reasoning: z.string()
        })),
        globalScore: z.number(),
        globalGrade: z.string(),
        verdict: z.string(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        atsKeywords: z.array(z.string()),
        festivalConnectArgument: z.string(),
        applicationAdvice: z.string(),
        expired: z.boolean()
      })
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Evaluate API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
