import { getCandidateProfile, CAREER_OPS_SYSTEM } from '../career-utils.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { callLLM } from '../../src/lib/llm/providers.js';
import { JOB_SCORING_MODEL } from '../../src/lib/llm/models.js';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch only 1 unscored job at a time to avoid Vercel 10s timeout limits
    const { data: jobs, error } = await supabase
      .from('scraped_jobs')
      .select('*')
      .is('score', null)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!jobs || jobs.length === 0) return res.status(200).json({ message: 'Aucune offre à scorer', scored: 0 });

    const profile = await getCandidateProfile();

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
Tu dois UNIQUEMENT retourner du JSON strict. Aucune phrase d'intro.`;

        const result: any = await callLLM(prompt, {
          model: JOB_SCORING_MODEL,
          provider: 'groq',
          schema: z.object({
             score: z.number(),
             grade: z.string(),
             verdict: z.string(),
             why_one_line: z.string(),
             profile_fit: z.string().optional(),
             contract_fit: z.string().optional(),
             remote_fit: z.string().optional()
          })
        });

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
