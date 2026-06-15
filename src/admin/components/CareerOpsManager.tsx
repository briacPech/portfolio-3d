import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, FileText, Mail, Save, Loader2, Zap, X, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { CvPdfDocument } from '../../components/career/CvPdfDocument';

interface Props {
  initialJobText?: string;
  onClearPending?: () => void;
}

export function CareerOpsManager({ initialJobText, onClearPending }: Props) {
  const [activeTab, setActiveTab] = useState('tracker');
  const [loading, setLoading] = useState(false);
  const [trackerJobs, setTrackerJobs] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false); // Toggle between Groq and Gemini

  // States for Evaluation
  const [jobText, setJobText] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);

  // States for Adapt CV
  const [adaptResult, setAdaptResult] = useState<any>(null);
  const [cvTemplate, setCvTemplate] = useState<'classic' | 'premium' | 'corporate'>('premium');

  // States for Lettre
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [lmResult, setLmResult] = useState<any>(null);

  // States for Profil
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCareerProfile();
  }, []);

  useEffect(() => {
    if (initialJobText) {
      setJobText(initialJobText);
      setActiveTab('evaluate');
      if (onClearPending) {
        onClearPending();
      }
    }
  }, [initialJobText]);

  const fetchCareerProfile = async () => {
    const { data } = await supabase.from('career_profile').select('*').limit(1).single();
    if (data) setProfileData(data);
    else setProfileData({ target_role: '', sector: 'Digital / Tech / Ops', location: 'France / Télétravail', salary_expectation: '', absolutely_avoid: '', response_tone: 'Professionnel, direct.', cv_text: '' });
  };

  const saveCareerProfile = async () => {
    setProfileLoading(true);
    setProfileSaved(false);
    if (profileData.id) {
      await supabase.from('career_profile').update({ ...profileData, updated_at: new Date().toISOString() }).eq('id', profileData.id);
    } else {
      const { data } = await supabase.from('career_profile').insert(profileData).select().single();
      if (data) setProfileData(data);
    }
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false });
    if (data) setTrackerJobs(data);
    else console.error(error);
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setEvalResult(null);
    try {
      const res = await fetch('/api/career-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTextOrUrl: jobText, isPremium })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setEvalResult(data);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'évaluation: " + err.message);
    }
    setLoading(false);
  };

  const handleAdaptCV = async () => {
    setLoading(true);
    setAdaptResult(null);
    try {
      const res = await fetch('/api/career-adapt-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTextOrUrl: jobText, isPremium })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setAdaptResult(data);
    } catch (err: any) {
      console.error(err);
      alert("Erreur CV: " + err.message);
    }
    setLoading(false);
  };

  const handleGenerateLM = async () => {
    setLoading(true);
    setLmResult(null);
    try {
      const res = await fetch('/api/career-lm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, role: roleName, jobText, isPremium })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = await res.json();
      setLmResult(data);
    } catch (err: any) {
      console.error(err);
      alert("Erreur LM: " + err.message);
    }
    setLoading(false);
  };

  const handleScoreJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/score', { method: 'POST' });
      const data = await res.json();
      alert(`Scoring terminé. ${data.scored} offres évaluées.`);
      fetchJobs();
    } catch (err: any) {
      alert("Erreur lors du scoring en masse: " + err.message);
    }
    setLoading(false);
  };

  const handleScrapeJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/scrape', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "Product Builder No-Code Automatisation",
          location: "France",
          results_wanted: 10
        })
      });
      const data = await res.json();
      alert(`Scraping terminé. ${data.total || data.scraped_count || 0} offres récupérées.`);
    } catch (err: any) {
      alert("Erreur lors du scraping: " + err.message);
    }
    setLoading(false);
  };

  const saveToTracker = async () => {
    if (!evalResult) return;
    const newJob = {
      company_name: "Entreprise Inconnue", // Idéalement à extraire du texte ou à demander à l'utilisateur
      role_title: "Poste à définir",
      status: '🟡 À préparer',
      score: evalResult.globalScore || 0,
      grade: evalResult.globalGrade || 'N/A',
      job_description: jobText,
      evaluation_summary: evalResult.jobSummary,
      evaluation_strengths: evalResult.strengths,
      evaluation_weaknesses: evalResult.weaknesses,
      cv_json: adaptResult || null,
    };
    const { error } = await supabase.from('job_applications').insert(newJob);
    if (!error) {
      alert("Sauvegardé dans le tracker !");
      fetchJobs();
      setActiveTab('tracker');
    } else {
      alert("Erreur de sauvegarde: " + error.message);
    }
  };

  const updateJobStatus = async (id: string, status: string) => {
    await supabase.from('job_applications').update({ status }).eq('id', id);
    fetchJobs();
  };

  return (
    <div className="bg-[#0E1B2E] border border-[#B99A5A]/20 rounded-xl overflow-hidden text-[#C9C2B6]">
      {/* HEADER TABS */}
      <div className="flex border-b border-[#B99A5A]/20 bg-[#0A1424]">
        <button onClick={() => setActiveTab('tracker')} className={"flex-1 p-3 text-sm font-medium transition-colors " + (activeTab === 'tracker' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Briefcase className="w-4 h-4 mx-auto mb-1" />
          Tracker
        </button>
        <button onClick={() => setActiveTab('evaluate')} className={"flex-1 p-3 text-sm font-medium transition-colors " + (activeTab === 'evaluate' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Zap className="w-4 h-4 mx-auto mb-1" />
          Évaluation
        </button>
        <button onClick={() => setActiveTab('cv')} className={"flex-1 p-3 text-sm font-medium transition-colors " + (activeTab === 'cv' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <FileText className="w-4 h-4 mx-auto mb-1" />
          CV
        </button>
        <button onClick={() => setActiveTab('lm')} className={"flex-1 p-3 text-sm font-medium transition-colors " + (activeTab === 'lm' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Mail className="w-4 h-4 mx-auto mb-1" />
          LM
        </button>
        <button onClick={() => setActiveTab('profil')} className={"flex-1 p-3 text-sm font-medium transition-colors " + (activeTab === 'profil' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <User className="w-4 h-4 mx-auto mb-1" />
          Profil
        </button>
      </div>

      <div className="bg-[#152642] p-3 flex justify-between items-center border-b border-[#B99A5A]/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#C9C2B6]">Modèle IA :</span>
          <div className="flex bg-[#0A1424] rounded-lg p-1 border border-[#B99A5A]/30">
            <button 
              onClick={() => setIsPremium(false)}
              className={`px-3 py-1 text-xs rounded transition-colors ${!isPremium ? 'bg-[#D8AF3A] text-[#050B14] font-bold' : 'text-[#C9C2B6] hover:text-[#F0C674]'}`}
            >
              Standard (Groq)
            </button>
            <button 
              onClick={() => setIsPremium(true)}
              className={`px-3 py-1 text-xs rounded transition-colors ${isPremium ? 'bg-[#D8AF3A] text-[#050B14] font-bold' : 'text-[#C9C2B6] hover:text-[#F0C674]'}`}
            >
              Premium (Gemini)
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: TRACKER */}
        {activeTab === 'tracker' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-[#F0C674]">Tracker de Candidatures</h2>
              <div className="flex gap-2">
                <button onClick={handleScrapeJobs} disabled={loading} className="bg-[#152642] border border-[#D8AF3A] text-[#D8AF3A] px-3 py-1 text-sm rounded hover:bg-[#D8AF3A] hover:text-[#0A1424] transition-colors">
                  {loading ? '...' : 'Lancer JobSpy'}
                </button>
                <button onClick={handleScoreJobs} disabled={loading} className="bg-[#152642] border border-[#D8AF3A] text-[#D8AF3A] px-3 py-1 text-sm rounded hover:bg-[#D8AF3A] hover:text-[#0A1424] transition-colors">
                  {loading ? '...' : 'Scorer Offres Non-Traitées'}
                </button>
              </div>
            </div>
            {trackerJobs.length === 0 ? (
              <p>Aucune candidature sauvegardée. Allez dans "Évaluation" pour commencer.</p>
            ) : (
              <div className="grid gap-4">
                {trackerJobs.map(job => (
                  <div key={job.id} className="bg-[#152642] p-4 rounded-lg border border-[#B99A5A]/10 flex justify-between items-center">
                    <div>
                      <h3 className="text-[#F5EFE1] font-bold">{job.role_title} @ {job.company_name}</h3>
                      <p className="text-sm">Score : {job.score}/5 ({job.grade})</p>
                    </div>
                    <select 
                      value={job.status} 
                      onChange={(e) => updateJobStatus(job.id, e.target.value)}
                      className="bg-[#0A1424] text-[#C9C2B6] border border-[#B99A5A]/30 rounded p-2 outline-none"
                    >
                      <option value="🟡 À préparer">🟡 À préparer</option>
                      <option value="🟠 Envoyée">🟠 Envoyée</option>
                      <option value="🟢 Entretien">🟢 Entretien</option>
                      <option value="🔴 Refus">🔴 Refus</option>
                      <option value="⚪ Abandon">⚪ Abandon</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVALUATION */}
        {activeTab === 'evaluate' && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#F0C674]">Scoring d'une offre</h2>
            <textarea 
              className="w-full h-40 bg-[#0A1424] border border-[#B99A5A]/30 rounded p-4 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]"
              placeholder="Collez ici le texte de l'offre d'emploi..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <button onClick={handleEvaluate} disabled={loading} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Lancer l'évaluation IA
            </button>

            {evalResult && (
              <div className="mt-8 bg-[#152642] p-6 rounded-lg border border-[#B99A5A]/30">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5EFE1]">Verdict: {typeof evalResult.verdict === 'object' ? JSON.stringify(evalResult.verdict) : String(evalResult.verdict || '')}</h3>
                    <p className="text-lg text-[#D8AF3A]">Score Global : {typeof evalResult.globalScore === 'object' ? JSON.stringify(evalResult.globalScore) : String(evalResult.globalScore || '')}/5 ({typeof evalResult.globalGrade === 'object' ? JSON.stringify(evalResult.globalGrade) : String(evalResult.globalGrade || '')})</p>
                  </div>
                  <button onClick={saveToTracker} className="bg-[#0A1424] border border-[#D8AF3A] text-[#D8AF3A] px-4 py-2 rounded hover:bg-[#D8AF3A] hover:text-[#0A1424] transition-colors flex gap-2">
                    <Save className="w-5 h-5" /> Sauvegarder
                  </button>
                </div>
                <p className="mb-4 text-justify">{typeof evalResult.jobSummary === 'object' ? JSON.stringify(evalResult.jobSummary) : String(evalResult.jobSummary || '')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#0A1424] p-4 rounded">
                    <h4 className="font-bold text-[#4ade80] mb-2">Points Forts</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {evalResult.strengths?.map((s: any, i: number) => <li key={i}>{typeof s === 'object' ? JSON.stringify(s) : s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-[#0A1424] p-4 rounded">
                    <h4 className="font-bold text-[#f87171] mb-2">Points Faibles / Risques</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {evalResult.weaknesses?.map((w: any, i: number) => <li key={i}>{typeof w === 'object' ? JSON.stringify(w) : w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADAPT CV */}
        {activeTab === 'cv' && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#F0C674]">Adapter mon CV</h2>
            <p className="text-sm">Assurez-vous d'avoir collé l'offre dans l'onglet "Évaluation" d'abord.</p>
            
            <div className="flex gap-4 items-center">
              <select
                value={cvTemplate}
                onChange={(e) => setCvTemplate(e.target.value as any)}
                className="bg-[#0A1424] text-[#C9C2B6] border border-[#B99A5A]/30 rounded p-2 outline-none focus:border-[#D8AF3A]"
              >
                <option value="classic">Template Classique</option>
                <option value="premium">Template Premium</option>
                <option value="corporate">Template Corporate</option>
              </select>

              <button onClick={handleAdaptCV} disabled={loading || !jobText} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                Générer CV
              </button>
            </div>

            {adaptResult && (
              <div className="mt-6 p-6 bg-[#0A1424] border border-[#B99A5A]/30 rounded-lg">
                {adaptResult.isPureDevDetected && (
                  <div className="bg-red-900/30 border border-red-500/50 p-4 rounded mb-4 text-red-200 flex gap-3">
                    <X className="w-6 h-6 shrink-0 text-red-500" />
                    <div>
                      <strong>Avertissement : Profil Dev Pur Détecté</strong><br/>
                      {adaptResult.pureDevWarning}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mb-4">
                  <PDFDownloadLink
                    document={<CvPdfDocument data={adaptResult} template={cvTemplate} />}
                    fileName="briac-pech-cv.pdf"
                    className="bg-[#152642] border border-[#D8AF3A] text-[#D8AF3A] px-4 py-2 rounded hover:bg-[#D8AF3A] hover:text-[#0A1424] transition-colors flex gap-2 items-center"
                  >
                    {({ loading: pdfLoading }) => (
                      pdfLoading ? 'Génération du PDF...' : 'Télécharger en PDF'
                    )}
                  </PDFDownloadLink>
                </div>
                
                <div className="h-[800px] w-full rounded overflow-hidden border border-[#B99A5A]/20">
                  <PDFViewer width="100%" height="100%" className="border-0">
                    <CvPdfDocument data={adaptResult} template={cvTemplate} />
                  </PDFViewer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LETTRE */}
        {activeTab === 'lm' && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#F0C674]">Lettre de Motivation</h2>
            <div className="flex gap-4">
              <input type="text" placeholder="Nom de l'entreprise" value={companyName} onChange={e => setCompanyName(e.target.value)} className="flex-1 bg-[#0A1424] border border-[#B99A5A]/30 rounded p-3 text-[#F5EFE1] outline-none" />
              <input type="text" placeholder="Intitulé du poste" value={roleName} onChange={e => setRoleName(e.target.value)} className="flex-1 bg-[#0A1424] border border-[#B99A5A]/30 rounded p-3 text-[#F5EFE1] outline-none" />
            </div>
            <button onClick={handleGenerateLM} disabled={loading || (!jobText && !companyName)} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              Générer Lettre
            </button>
            {lmResult && (
              <div className="mt-6 p-6 bg-[#0A1424] border border-[#B99A5A]/30 rounded-lg">
                <div className="prose prose-invert prose-p:text-justify max-w-none">
                  <ReactMarkdown>{lmResult.letterMarkdown}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFIL */}
        {activeTab === 'profil' && profileData && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#F0C674]">Profil Career Ops</h2>
            <p className="text-sm text-[#C9C2B6]/70">Ces informations sont utilisées par l'IA pour scorer et adapter votre candidature.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#D8AF3A] mb-1">Poste visé</label>
                <input type="text" value={profileData.target_role || ''} onChange={e => setProfileData({...profileData, target_role: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
              </div>
              <div>
                <label className="block text-xs text-[#D8AF3A] mb-1">Secteur</label>
                <input type="text" value={profileData.sector || ''} onChange={e => setProfileData({...profileData, sector: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
              </div>
              <div>
                <label className="block text-xs text-[#D8AF3A] mb-1">Localisation idéale</label>
                <input type="text" value={profileData.location || ''} onChange={e => setProfileData({...profileData, location: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
              </div>
              <div>
                <label className="block text-xs text-[#D8AF3A] mb-1">Attentes salariales</label>
                <input type="text" value={profileData.salary_expectation || ''} onChange={e => setProfileData({...profileData, salary_expectation: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#D8AF3A] mb-1">À éviter absolument</label>
              <input type="text" value={profileData.absolutely_avoid || ''} onChange={e => setProfileData({...profileData, absolutely_avoid: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
            </div>

            <div>
              <label className="block text-xs text-[#D8AF3A] mb-1">Ton souhaité dans les réponses IA</label>
              <input type="text" value={profileData.response_tone || ''} onChange={e => setProfileData({...profileData, response_tone: e.target.value})} className="w-full bg-[#0A1424] border border-[#B99A5A]/30 rounded p-2 text-[#F5EFE1] outline-none focus:border-[#D8AF3A]" />
            </div>

            <div>
              <label className="block text-xs text-[#D8AF3A] mb-1">CV complet (Markdown) — utilisé par l'IA pour personnaliser les analyses</label>
              <textarea
                className="w-full h-64 bg-[#0A1424] border border-[#B99A5A]/30 rounded p-3 text-[#F5EFE1] outline-none focus:border-[#D8AF3A] font-mono text-sm"
                placeholder="Collez ici votre CV complet en texte brut ou Markdown..."
                value={profileData.cv_text || ''}
                onChange={e => setProfileData({...profileData, cv_text: e.target.value})}
              />
            </div>

            <button onClick={saveCareerProfile} disabled={profileLoading} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
              {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {profileSaved ? '✅ Sauvegardé !' : 'Sauvegarder le profil'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
