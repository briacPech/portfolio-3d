import { GoogleGenAI } from '@google/genai';
import { getCandidateProfile, CAREER_OPS_SYSTEM } from './career-utils';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  try {
    const { jobTextOrUrl } = await req.json();
    if (!jobTextOrUrl) return new Response(JSON.stringify({ error: "Offre manquante" }), { status: 400 });

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "Clé Gemini manquante" }), { status: 500 });
    const ai = new GoogleGenAI({ apiKey });

    const profile = await getCandidateProfile();

    const prompt = `Voici le profil d'un candidat français :
- Poste visé : \${profile.targetRole}
- Secteur : \${profile.sector}
- Localisation idéale : \${profile.location}
- Attentes salariales : \${profile.salaryExpectation}
- Ce qu'il souhaite éviter : \${profile.absolutelyAvoid}
- Ton souhaité : \${profile.responseTone}

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
\${profile.cvText}

Voici l'offre d'emploi copiée-collée :
\${jobTextOrUrl}

Calcule la note globale sur 5 de manière objective selon les dimensions (Compétences techniques, Expérience, Secteur, Localisation, Salaire, Culture, Évolution, Séniorité).
Extrais les mots-clés ATS clés détectés dans l'offre.
Rédige un conseil stratégique personnalisé pour postuler.

Retourne un JSON strict avec : jobSummary, dimensions (8 entrées avec name, weight, score, grade, reasoning), globalScore, globalGrade, verdict (POSTULER|GARDER EN VEILLE|PASSER), strengths[], weaknesses[], atsKeywords[], festivalConnectArgument, applicationAdvice, expired (boolean).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: \`\${CAREER_OPS_SYSTEM}\\n\\n---\\n\\n\${prompt}\`,
      config: { responseMimeType: "application/json" }
    });

    return new Response(response.text, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("Evaluate API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
