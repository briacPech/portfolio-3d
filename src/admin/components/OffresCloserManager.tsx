import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, RefreshCw, Loader2, ExternalLink, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  url: string;
  job_description: string;
  salary: string;
  contract_type: string;
  score: number | null;
  grade: string | null;
  verdict: string | null;
  why_one_line: string | null;
  alert_sent: boolean;
  sent_to_career_ops: boolean;
  created_at: string;
}

interface Props {
  onSendToCareerOps?: (jobText: string) => void;
}

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  E: 'bg-red-500/20 text-red-400 border-red-500/30',
  F: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const VERDICT_COLORS: Record<string, string> = {
  'POSTULER': 'text-green-400',
  'GARDER EN VEILLE': 'text-yellow-400',
  'PASSER': 'text-red-400',
};

export function OffresCloserManager({ onSendToCareerOps }: Props) {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [filter, setFilter] = useState<'all' | 'postuler' | 'veille' | 'passer'>('all');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // Search params
  const [query, setQuery] = useState('Product Builder No-Code Automatisation');
  const [location, setLocation] = useState('France');
  const [platforms, setPlatforms] = useState({ linkedin: true, indeed: true, glassdoor: true, google: true });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('scraped_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setJobs(data);
    setLoading(false);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const selectedPlatforms = Object.entries(platforms)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const res = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location,
          platforms: selectedPlatforms,
          results_wanted: 20,
          hours_old: 72
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur scraping');

      // Save to Supabase
      if (data.jobs && data.jobs.length > 0) {
        await supabase.from('scraped_jobs').insert(data.jobs);
        await fetchJobs();
        alert(`✅ ${data.jobs.length} offres scrapées et sauvegardées !`);
      } else {
        alert('Aucune offre trouvée pour ces critères.');
      }
    } catch (err: any) {
      alert('Erreur scraping : ' + err.message);
    }
    setScraping(false);
  };

  const handleScore = async () => {
    setScoring(true);
    let totalScored = 0;
    let totalAlerts = 0;
    
    try {
      while (true) {
        const res = await fetch('/api/jobs/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur scoring');
        
        if (data.scored === 0) {
          break; // Plus rien à scorer
        }
        
        totalScored += data.scored;
        totalAlerts += data.highScore;
        await fetchJobs(); // Mettre à jour l'UI à chaque itération
      }
      
      alert(`✅ Terminé : ${totalScored} offre(s) scorée(s) ! ${totalAlerts} alerte(s) envoyée(s).`);
    } catch (err: any) {
      alert('Erreur scoring (partiel) : ' + err.message);
    }
    setScoring(false);
  };

  const handleSendToCareerOps = async (job: ScrapedJob) => {
    const jobText = `**${job.title}** chez **${job.company}**\n📍 ${job.location}\n\n${job.job_description}`;
    if (onSendToCareerOps) {
      onSendToCareerOps(jobText);
    }
    // Mark as sent
    await supabase.from('scraped_jobs').update({ sent_to_career_ops: true }).eq('id', job.id);
    await fetchJobs();
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === 'postuler') return j.verdict === 'POSTULER';
    if (filter === 'veille') return j.verdict === 'GARDER EN VEILLE';
    if (filter === 'passer') return j.verdict === 'PASSER';
    return true;
  });

  const stats = {
    total: jobs.length,
    scored: jobs.filter(j => j.score !== null).length,
    postuler: jobs.filter(j => j.verdict === 'POSTULER').length,
    alerts: jobs.filter(j => j.alert_sent).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#F0C674]">🎯 Offres Closer</h2>
          <p className="text-sm text-[#C9C2B6]/70 mt-1">Scan automatique + scoring IA des offres d'emploi</p>
        </div>
        <button onClick={fetchJobs} className="text-[#C9C2B6] hover:text-[#F0C674] p-2 rounded transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total offres', value: stats.total, color: 'text-[#F0C674]' },
          { label: 'Scorées', value: stats.scored, color: 'text-blue-400' },
          { label: '🟢 À postuler', value: stats.postuler, color: 'text-green-400' },
          { label: '📧 Alertes envoyées', value: stats.alerts, color: 'text-[#D8AF3A]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0A1424] border border-[#B99A5A]/20 rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-[#C9C2B6]/60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search Form */}
      <div className="bg-[#0A1424] border border-[#B99A5A]/20 rounded-xl p-5 space-y-4">
        <h3 className="text-[#F0C674] font-medium">Paramètres de scan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#D8AF3A] mb-1">Mots-clés</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[#D8AF3A] mb-1">Localisation</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#D8AF3A] mb-2">Plateformes</label>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(platforms).map(([platform, active]) => (
              <button
                key={platform}
                onClick={() => setPlatforms(p => ({ ...p, [platform]: !p[platform as keyof typeof p] }))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-[#D8AF3A]/20 border-[#D8AF3A] text-[#F0C674]'
                    : 'border-[#B99A5A]/30 text-[#C9C2B6]/50'
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-5 rounded transition-colors"
          >
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {scraping ? 'Scan en cours...' : 'Lancer le scan'}
          </button>
          <button
            onClick={handleScore}
            disabled={scoring}
            className="flex items-center gap-2 border border-[#D8AF3A] text-[#D8AF3A] hover:bg-[#D8AF3A]/10 font-medium py-2 px-5 rounded transition-colors"
          >
            {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {scoring ? 'Scoring...' : 'Scorer les offres'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'postuler', 'veille', 'passer'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-[#D8AF3A] text-[#050B14]' : 'bg-[#0A1424] text-[#C9C2B6] hover:bg-[#152642]'
            }`}
          >
            {f === 'all' && `Toutes (${stats.total})`}
            {f === 'postuler' && `🟢 Postuler (${stats.postuler})`}
            {f === 'veille' && `🟡 En veille (${jobs.filter(j => j.verdict === 'GARDER EN VEILLE').length})`}
            {f === 'passer' && `🔴 Passer (${jobs.filter(j => j.verdict === 'PASSER').length})`}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#D8AF3A]" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-[#C9C2B6]/50">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune offre. Lancez un scan pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className={`bg-[#0A1424] border rounded-xl overflow-hidden transition-all ${
                job.verdict === 'POSTULER' ? 'border-green-500/30' :
                job.verdict === 'GARDER EN VEILLE' ? 'border-yellow-500/30' :
                'border-[#B99A5A]/20'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[#F5EFE1] font-semibold truncate">{job.title}</h3>
                      {job.grade && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${GRADE_COLORS[job.grade] || GRADE_COLORS['F']}`}>
                          {job.grade}
                        </span>
                      )}
                      {job.alert_sent && (
                        <span className="text-xs text-[#D8AF3A]" title="Alerte envoyée">📧</span>
                      )}
                      {job.sent_to_career_ops && (
                        <span className="text-xs text-blue-400" title="Envoyé à Career Ops">✓ Career Ops</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-[#C9C2B6]">{job.company}</span>
                      <span className="text-xs text-[#C9C2B6]/50">•</span>
                      <span className="text-xs text-[#C9C2B6]/70">📍 {job.location}</span>
                      <span className="text-xs text-[#C9C2B6]/50">•</span>
                      <span className="text-xs text-[#C9C2B6]/50 capitalize">{job.platform}</span>
                    </div>
                    {job.score !== null && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`w-4 h-1.5 rounded-full ${i <= Math.round(job.score!) ? 'bg-[#D8AF3A]' : 'bg-[#B99A5A]/20'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#D8AF3A] font-medium">{job.score}/5</span>
                        {job.verdict && (
                          <span className={`text-xs font-bold ${VERDICT_COLORS[job.verdict] || 'text-[#C9C2B6]'}`}>
                            — {job.verdict}
                          </span>
                        )}
                      </div>
                    )}
                    {job.why_one_line && (
                      <p className="text-xs text-[#C9C2B6]/70 mt-2 italic">{job.why_one_line}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-[#152642] text-[#C9C2B6] hover:text-[#F0C674] transition-colors"
                        title="Voir l'offre"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {!job.sent_to_career_ops && onSendToCareerOps && (
                      <button
                        onClick={() => handleSendToCareerOps(job)}
                        className="p-1.5 rounded bg-[#D8AF3A]/20 text-[#D8AF3A] hover:bg-[#D8AF3A]/30 transition-colors"
                        title="Traiter dans Career Ops"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expand description */}
                {job.job_description && (
                  <button
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    className="text-xs text-[#C9C2B6]/50 hover:text-[#D8AF3A] mt-2 transition-colors"
                  >
                    {expandedJob === job.id ? '▲ Masquer la description' : '▼ Voir la description'}
                  </button>
                )}
                {expandedJob === job.id && job.job_description && (
                  <div className="mt-3 p-3 bg-[#050B14] rounded-lg text-xs text-[#C9C2B6]/80 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {job.job_description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
