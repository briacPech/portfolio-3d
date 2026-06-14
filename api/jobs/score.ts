import { getCandidateProfile, CAREER_OPS_SYSTEM } from '../career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Clé Gemini manquante' });

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch unscored jobs
    const { data: jobs, error } = await supabase
      .from('scraped_jobs')
      .select('*')
      .is('score', null)
      .limit(10);

    if (error) throw new Error(error.message);
    if (!jobs || jobs.length === 0) return res.status(200).json({ message: 'Aucune offre à scorer', scored: 0 });

    const profile = await getCandidateProfile();
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let scored = 0;
    const highScore: any[] = [];

    for (const job of jobs) {
      try {
        const prompt = `Voici le profil du candidat Briac :
Poste visé : ${profile.targetRole}
Secteur : ${profile.sector}
À éviter : ${profile.absolutelyAvoid}

CV :
${profile.cvText}

Offre à évaluer :
Titre : ${job.title}
Entreprise : ${job.company}
Plateforme : ${job.platform}
Description : ${job.job_description?.slice(0, 1500) || 'Non fournie'}

Donne un score de 1 à 5, une note lettre (A-F), un verdict (POSTULER|GARDER EN VEILLE|PASSER) et une phrase d'explication (why_one_line).
Les postes de développeur pur (Java, C++, .NET, backend) doivent avoir un score < 2.5 et verdict PASSER.
Retourne JSON strict : { "score": number, "grade": string, "verdict": string, "why_one_line": string }`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${CAREER_OPS_SYSTEM}\n\n${prompt}` }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!response.ok) continue;
        const data: any = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());

        await supabase.from('scraped_jobs').update({
          score: result.score,
          grade: result.grade,
          verdict: result.verdict,
          why_one_line: result.why_one_line,
          processed: true
        }).eq('id', job.id);

        if (result.score >= 4) {
          highScore.push({ ...job, ...result });
        }
        scored++;
      } catch (e) {
        console.error(`Error scoring job ${job.id}:`, e);
      }
    }

    // Trigger alerts for high-score jobs
    if (highScore.length > 0) {
      await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/jobs/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: highScore })
      }).catch(() => {});
    }

    return res.status(200).json({ scored, highScore: highScore.length });
  } catch (error: any) {
    console.error('Score API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
