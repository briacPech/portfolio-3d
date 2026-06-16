import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl) throw new Error("Supabase URL manquant dans l'environnement");
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const CAREER_OPS_SYSTEM = `Tu es l'assistant Career-Ops pour la recherche d'emploi en France. Profil cible : expert hybride Commercial + No-Code / IA / Automatisation (Maestro), projet phare Festival Connect. Réponds en français.`;

export async function getCandidateProfile() {
  const supabase = getSupabase();
  const { data: rawData, error } = await supabase
    .from('career_profile')
    .select('*')
    .limit(1)
    .single();
    
  const data = rawData as any;

  if (error || !data) {
    return {
      targetRole: '',
      sector: '',
      location: '',
      salaryExpectation: '',
      absolutelyAvoid: '',
      responseTone: '',
      cvText: ''
    };
  }

  return {
    targetRole: data.target_role || '',
    sector: data.sector || '',
    location: data.location || '',
    salaryExpectation: data.salary_expectation || '',
    absolutelyAvoid: data.absolutely_avoid || '',
    responseTone: data.response_tone || '',
    cvText: data.cv_text || ''
  };
}

