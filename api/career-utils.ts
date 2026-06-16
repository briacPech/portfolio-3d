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
  
  // Requêtes concurrentes pour récupérer toutes les données
  const [
    { data: careerProfile },
    { data: profile },
    { data: projects },
    { data: experiences },
    { data: skills }
  ] = await Promise.all([
    supabase.from('career_profile').select('*').limit(1).single(),
    supabase.from('profile').select('*').limit(1).single(),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('experiences').select('*').order('start_date', { ascending: false }),
    supabase.from('skills').select('*').order('display_order', { ascending: true })
  ]);

  // Construction dynamique du CV Brut à partir de la BDD du Portfolio
  const cvText = `
--- INFORMATIONS PERSONNELLES ---
NOM : ${profile?.full_name || 'Non précisé'}
BIO : ${profile?.bio || 'Non précisée'}
DESCRIPTION COURTE : ${profile?.short_description || 'Non précisée'}

--- EXPÉRIENCES PROFESSIONNELLES ---
${experiences?.map((exp: any) => `- ${exp.job_title} chez ${exp.company_name} (${exp.duration}) : ${exp.description}`).join('\n') || 'Aucune expérience enregistrée.'}

--- PROJETS RÉALISÉS ---
${projects?.map((proj: any) => `- ${proj.name} : ${proj.short_description}`).join('\n') || 'Aucun projet enregistré.'}

--- COMPÉTENCES ---
${skills?.map((skill: any) => `- ${skill.name} (Niveau ${skill.level || 'Non précisé'} / Catégorie: ${skill.category || 'Non précisée'})`).join('\n') || 'Aucune compétence enregistrée.'}
`.trim();

  // On renvoie un mix des préférences Career Ops et du CV généré
  return {
    targetRole: careerProfile?.target_role || 'Product Builder / Ops No-Code',
    sector: careerProfile?.sector || 'Digital / Tech / Ops',
    location: careerProfile?.location || 'France / Télétravail',
    salaryExpectation: careerProfile?.salary_expectation || 'À discuter',
    absolutelyAvoid: careerProfile?.absolutely_avoid || '',
    responseTone: careerProfile?.response_tone || 'Professionnel, direct.',
    cvText: cvText
  };
}

