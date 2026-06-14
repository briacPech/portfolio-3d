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
      contents: `${CAREER_OPS_SYSTEM}\n\n---\n\n${prompt}`,
      config: { responseMimeType: "application/json" }
    });

    return new Response(response.text, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("Adapt CV API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
