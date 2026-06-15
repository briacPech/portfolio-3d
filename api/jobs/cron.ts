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

    console.log('[Cron] Fetching custom Job Spy settings...');
    let spySettings = {
      query: 'Product Builder No-Code Automatisation Ops',
      location: 'France',
      hours_old: 24,
      results_wanted: 15,
      platforms: ['linkedin', 'indeed', 'glassdoor', 'google']
    };

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: urlData } = supabase.storage.from('portfolio-media').getPublicUrl('job-spy-settings.json');
      if (urlData && urlData.publicUrl) {
        const res = await fetch(urlData.publicUrl + '?t=' + Date.now());
        if (res.ok) {
          const customSettings = await res.json();
          console.log('[Cron] Custom settings found:', customSettings);
          if (customSettings.query) spySettings.query = customSettings.query;
          if (customSettings.location) spySettings.location = customSettings.location;
          if (customSettings.platforms) {
            spySettings.platforms = Object.entries(customSettings.platforms)
              .filter(([, v]) => v)
              .map(([k]) => k);
          }
        }
      }
    } catch (e) {
      console.log('[Cron] Failed to fetch custom settings, using defaults.', e);
    }

    console.log('[Cron] Starting Career Ops pipeline with query:', spySettings.query);

    // Step 1: Scrape new jobs
    const scrapeRes = await fetch(`${baseUrl}/api/jobs/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spySettings)
    });
    const scrapeData: any = await scrapeRes.json();
    console.log(`[Cron] Scraped: ${scrapeData.total || 0} jobs`);

    // Step 2: Score unscored jobs
    const scoreRes = await fetch(`${baseUrl}/api/jobs/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const scoreData: any = await scoreRes.json();
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
