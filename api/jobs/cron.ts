// Vercel Cron Job — runs every 6 hours
// Triggers: scrape → score → alert pipeline
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel cron sends GET requests
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    console.log('[Cron] Starting Career Ops pipeline...');

    // Step 1: Scrape new jobs
    const scrapeRes = await fetch(`${baseUrl}/api/jobs/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Product Builder No-Code Automatisation Ops',
        location: 'France',
        hours_old: 24,
        results_wanted: 15,
        platforms: ['linkedin', 'indeed', 'glassdoor', 'google']
      })
    });
    const scrapeData = await scrapeRes.json();
    console.log(`[Cron] Scraped: ${scrapeData.total || 0} jobs`);

    // Step 2: Score unscored jobs
    const scoreRes = await fetch(`${baseUrl}/api/jobs/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const scoreData = await scoreRes.json();
    console.log(`[Cron] Scored: ${scoreData.scored || 0} jobs, ${scoreData.highScore || 0} high score`);

    return res.status(200).json({
      success: true,
      scraped: scrapeData.total || 0,
      scored: scoreData.scored || 0,
      highScore: scoreData.highScore || 0
    });
  } catch (error: any) {
    console.error('[Cron] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
