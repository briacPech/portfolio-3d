import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { callLLM } from './llm-providers.js';
import { PREMIUM_MODEL, CV_DRAFT_MODEL } from './llm-models.js';

export const maxDuration = 60; // 60 seconds timeout

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const { jobTextOrUrl, isPremium } = req.body || {};
    if (!jobTextOrUrl) return res.status(400).json({ error: "Offre manquante" });

    const profile = await getCandidateProfile();

    const prompt = `Tu es un expert CV pour le marché français, spécialisé dans les profils No-Code / IA / Automatisation.

PROFIL CANDIDAT
- Spécialiste No-Code / IA / Automatisation, mais avec une forte casquette Commerciale/Closer.
- Formation Maestro No Code.
- Outils maîtrisés : Airtable, Make, Notion, Zapier, n8n, Softr, Bubble.
- Compétences : automatisation de workflows, CRM, bases de données, intégrations d'API, prototypage rapide, vente complexe, relation client.
- Pas un développeur pur.

Voici son CV actuel (généré depuis sa base de données) :
${profile.cvText}

MISSION
Adapte le CV du candidat à l'offre d'emploi ci-dessous.
Offre cible :
${jobTextOrUrl}

VÉRIFICATION DE SÉCURITÉ DU RÔLE (CRITIQUE) :
Vérifie si le poste est orienté "Dev Pur" (développement traditionnel backend, fullstack coding avec langages comme C++, Java, Swift, Rust, DevOps hardware/infrastructure). Si oui, définis isPureDevDetected à true et rédige un avertissement (pureDevWarning) expliquant que le profil de Briac (Product Builder / No Code) ne matche pas. Sinon, isPureDevDetected doit être false.

RÈGLES D'ADAPTATION DU CV
- Valorise en priorité les expériences pertinentes pour l'offre (no-code, automatisation, ou vente selon l'offre).
- Ne fabrique jamais d'expérience ou de compétence absente (conserve l'intégrité exacte du profil original).
- Injecte les mots-clés ATS de l'offre récoltés de manière naturelle dans les bullet points.
- Mets en évidence (si le poste s'y prête) le côté hybride unique de Briac : capable de vendre ET de construire la solution technique.

Tu dois UNIQUEMENT retourner du JSON strict qui respecte EXACTEMENT cette structure :
{
  "identity": { "name": "Briac Pécheur", "contact": "...", "location": "..." },
  "title": "Titre du profil adapté à l'offre",
  "summary": "Résumé percutant de 3-4 lignes (l'Accroche)",
  "skills": { "hard": ["compétence 1", "compétence 2"], "soft": ["soft skill 1"] },
  "experience": [
    { "company": "...", "role": "...", "duration": "...", "bullets": ["point d'impact 1", "point d'impact 2"] }
  ],
  "projects": [
    { "name": "Festival Connect", "description": "...", "technologies": ["Bubble", "Make", "Airtable"] }
  ],
  "education": [
    { "degree": "...", "school": "...", "date": "..." }
  ],
  "tools": ["Airtable", "Make", "n8n", "Bubble"],
  "isPureDevDetected": false,
  "pureDevWarning": ""
}

Aucune phrase d'intro, uniquement le JSON.`;

    const fullPrompt = `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`;
    
    const result: any = await callLLM(fullPrompt, {
      model: isPremium ? PREMIUM_MODEL : CV_DRAFT_MODEL,
      provider: isPremium ? 'gemini' : 'groq',
      schema: z.object({
        identity: z.object({ name: z.string(), contact: z.string(), location: z.string() }),
        title: z.string(),
        summary: z.string(),
        skills: z.object({ hard: z.array(z.string()), soft: z.array(z.string()) }),
        experience: z.array(z.object({ company: z.string(), role: z.string(), duration: z.string(), bullets: z.array(z.string()) })),
        projects: z.array(z.object({ name: z.string(), description: z.string(), technologies: z.array(z.string()) })),
        education: z.array(z.object({ degree: z.string(), school: z.string(), date: z.string() })),
        tools: z.array(z.string()),
        isPureDevDetected: z.boolean(),
        pureDevWarning: z.string().optional()
      })
    });

    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
