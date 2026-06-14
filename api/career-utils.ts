import { createClient } from '@supabase/supabase-js';

// Lazy initialization to prevent Vercel Serverless crashes if env vars are missing at boot
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

export const CAREER_OPS_SYSTEM = `Tu es l'agent IA "Career Ops" intégré au dashboard administrateur d'un expert tech/business.
Tu agis comme un conseiller carrière hyper-rationnel, orienté produit et business.
Tes analyses doivent être incisives, sans langue de bois, et toujours justifiées.`;

export async function getCandidateProfile() {
  const supabase = getSupabase();
  const [
    { data: profile },
    { data: projects },
    { data: skills }
  ] = await Promise.all([
    supabase.from('profile').select('*').limit(1).single(),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('skills').select('*').order('display_order', { ascending: true })
  ]);

  const targetRole = profile?.short_description || "Product Builder / Ops No-Code";
  const sector = "Digital / Tech / Ops";
  const location = "France / Télétravail";
  const salaryExpectation = "À discuter selon profil et impact généré";
  const absolutelyAvoid = "Développement pur (backend lourd, C++, mobile natif), ESN très classiques";
  
  // Format HTML/text cleanly
  const cleanHtml = (html: string) => (html || '').replace(/<[^>]*>?/gm, '');

  const cvText = `
### Briac Pécheur - ${targetRole}
${cleanHtml(profile?.bio)}

### Compétences
${skills?.map((s: any) => `- ${s.name} (${s.category})`).join('\n') || ''}

### Projets Phares
${projects?.map((p: any) => `#### ${p.name}\n${cleanHtml(p.short_description)}\n`).join('\n') || ''}
  `.trim();

  return {
    targetRole,
    sector,
    location,
    salaryExpectation,
    absolutelyAvoid,
    cvText,
    responseTone: "Professionnel, direct, orienté impact business et technique."
  };
}

export const CAREER_OPS_SYSTEM =
  "Tu es l'assistant Career-Ops pour la recherche d'emploi en France. Profil cible : expert hybride Commercial + No-Code / IA / Automatisation (Maestro). Réponds en français.";
