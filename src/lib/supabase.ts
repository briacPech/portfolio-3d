import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ajwvgqpfmtlpntgdqfvn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_U2zVxvnAFpcVZILCvuX7BQ_fdjZz4x7';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Paramètres Supabase manquants dans les variables d'environnement. Utilisation des clés par défaut.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
