import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, FileText, Mail, Save, Loader2, Zap, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function CareerOpsManager() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [loading, setLoading] = useState(false);
  const [trackerJobs, setTrackerJobs] = useState<any[]>([]);

  // States for Evaluation
  const [jobText, setJobText] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);

  // States for Adapt CV
  const [adaptResult, setAdaptResult] = useState<any>(null);

  // States for Lettre
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [lmResult, setLmResult] = useState<any>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

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
        body: JSON.stringify({ jobTextOrUrl: jobText })
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
        body: JSON.stringify({ jobTextOrUrl: jobText })
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
        body: JSON.stringify({ companyName, role: roleName, jobText })
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
        <button onClick={() => setActiveTab('tracker')} className={"flex-1 p-4 font-medium transition-colors " + (activeTab === 'tracker' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Briefcase className="w-5 h-5 mx-auto mb-1" />
          Tracker
        </button>
        <button onClick={() => setActiveTab('evaluate')} className={"flex-1 p-4 font-medium transition-colors " + (activeTab === 'evaluate' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Zap className="w-5 h-5 mx-auto mb-1" />
          Évaluation
        </button>
        <button onClick={() => setActiveTab('cv')} className={"flex-1 p-4 font-medium transition-colors " + (activeTab === 'cv' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <FileText className="w-5 h-5 mx-auto mb-1" />
          Adapter CV
        </button>
        <button onClick={() => setActiveTab('lm')} className={"flex-1 p-4 font-medium transition-colors " + (activeTab === 'lm' ? 'text-[#F0C674] border-b-2 border-[#D8AF3A] bg-[#152642]' : 'hover:bg-[#0E1B2E]')}>
          <Mail className="w-5 h-5 mx-auto mb-1" />
          Lettre Motiv'
        </button>
      </div>

      <div className="p-6">
        {/* TAB 1: TRACKER */}
        {activeTab === 'tracker' && (
          <div>
            <h2 className="text-xl font-serif text-[#F0C674] mb-4">Tracker de Candidatures</h2>
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
                    <h3 className="text-2xl font-bold text-[#F5EFE1]">Verdict: {evalResult.verdict}</h3>
                    <p className="text-lg text-[#D8AF3A]">Score Global : {evalResult.globalScore}/5 ({evalResult.globalGrade})</p>
                  </div>
                  <button onClick={saveToTracker} className="bg-[#0A1424] border border-[#D8AF3A] text-[#D8AF3A] px-4 py-2 rounded hover:bg-[#D8AF3A] hover:text-[#0A1424] transition-colors flex gap-2">
                    <Save className="w-5 h-5" /> Sauvegarder
                  </button>
                </div>
                <p className="mb-4 text-justify">{evalResult.jobSummary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#0A1424] p-4 rounded">
                    <h4 className="font-bold text-[#4ade80] mb-2">Points Forts</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {evalResult.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-[#0A1424] p-4 rounded">
                    <h4 className="font-bold text-[#f87171] mb-2">Points Faibles / Risques</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {evalResult.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
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
            <button onClick={handleAdaptCV} disabled={loading || !jobText} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-6 rounded transition-colors flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              Générer CV
            </button>
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
                <div className="prose prose-invert prose-p:text-justify max-w-none">
                  <ReactMarkdown>{adaptResult.adaptedCvMarkdown}</ReactMarkdown>
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

      </div>
    </div>
  );
}
