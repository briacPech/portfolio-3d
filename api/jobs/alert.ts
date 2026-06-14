import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export const maxDuration = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { jobs } = req.body || {};
    if (!jobs || jobs.length === 0) return res.status(200).json({ message: 'Aucune offre à alerter' });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({ error: 'Gmail non configuré (GMAIL_USER / GMAIL_APP_PASSWORD manquants)' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    const jobsHtml = jobs.map((job: any) => `
      <div style="border:1px solid #D8AF3A;border-radius:8px;padding:16px;margin-bottom:16px;background:#0E1B2E;color:#F5EFE1;">
        <h3 style="color:#F0C674;margin:0 0 8px">${job.title} @ ${job.company}</h3>
        <p style="margin:4px 0;color:#C9C2B6;">📍 ${job.location} — ${job.platform}</p>
        <p style="margin:4px 0;color:#4ade80;font-weight:bold;">Score : ${job.score}/5 (${job.grade}) — ${job.verdict}</p>
        <p style="margin:8px 0;font-style:italic;">${job.why_one_line}</p>
        ${job.url ? `<a href="${job.url}" style="color:#D8AF3A;">Voir l'offre →</a>` : ''}
      </div>
    `).join('');

    await transporter.sendMail({
      from: `"Career Ops 🎯" <${gmailUser}>`,
      to: gmailUser,
      subject: `🚨 ${jobs.length} offre(s) top score détectée(s) — Career Ops`,
      html: `
        <div style="font-family:sans-serif;background:#050B14;padding:24px;border-radius:12px;max-width:600px;">
          <h2 style="color:#F0C674;margin-bottom:16px;">🎯 Career Ops — Offres à ne pas rater !</h2>
          <p style="color:#C9C2B6;">Briac, ${jobs.length} offre(s) ont un score ≥ 4/5 et méritent votre attention :</p>
          ${jobsHtml}
          <p style="color:#C9C2B6;margin-top:24px;font-size:12px;">Généré automatiquement par Career Ops</p>
        </div>
      `
    });

    // Mark jobs as alert sent
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    );
    const ids = jobs.map((j: any) => j.id).filter(Boolean);
    if (ids.length > 0) {
      await supabase.from('scraped_jobs').update({ alert_sent: true }).in('id', ids);
    }

    return res.status(200).json({ sent: jobs.length });
  } catch (error: any) {
    console.error('Alert API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
