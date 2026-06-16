import { getCandidateProfile, CAREER_OPS_SYSTEM } from './_career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './_llm-providers.js';
import { JOB_SCORING_MODEL } from './_llm-models.js';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { role, jobText } = req.body || {};
    if (!role) return res.status(400).json({ error: "Le poste est manquant." });

    const profile = await getCandidateProfile();

    const prompt = `Prépare un entretien d'embauche de très haut niveau pour le poste de : ${role}

Description du poste :
${jobText || "Poste ciblant le profil hybride du candidat"}

Candidat (Briac, profil hybride Commercial + No-Code / IA / Automatisation) :
${profile.cvText}

Génère précisément 5 questions d'entretien clés avec des réponses structurées selon la méthode STAR (Situation, Tâche, Action, Résultat) rédigées à la première personne ("Je") de manière percutante et naturelle :
1. "Parlez-moi de vous" (Pitch d'intro offrant un aperçu marquant du profil hybride).
2. "Pourquoi nous ?" (Motivation de moderniser, fluidifier les process internes avec des outils digitaux).
3. "Parlez-nous de votre projet phare : Festival Connect" (Une question sur ce système complexe bâti avec Bubble, Airtable et Make, démontrant l'aptitude d'architecte produit).
4. Une question technique pointue sur l'offre : gestion de scénarios Make avancés, CRM, bases Airtable, IA.
5. "Quelles sont vos prétentions salariales et comment justifiez-vous cela ?" (La question critique de négociation, justifiée par la double valeur : apporter du CA + livrer/automatiser).

Pour chaque question, fournis :
- La question exacte
- Le type de question (Générale, Technique, Projet Réel, Négociation)
- La réponse STAR détaillée (rédigée en un seul bloc fluide et percutant)
- Un conseil tactique spécifique pour réussir cette question face à un recruteur français.

Tu dois uniquement retourner du JSON strict avec la clé "questions" contenant le tableau des 5 objets.`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: JOB_SCORING_MODEL,
      provider: 'groq',
      schema: z.object({
        questions: z.array(z.object({
          question: z.string(),
          type: z.string(),
          starAnswer: z.string(),
          advice: z.string()
        }))
      })
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Interview API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
