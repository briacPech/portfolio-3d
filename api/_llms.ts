import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl) {
    return new Response("Missing configuration.", { status: 500 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: urlData } = supabase.storage.from('portfolio-media').getPublicUrl('llms.txt');
    
    if (!urlData || !urlData.publicUrl) {
       return new Response("File not found.", { status: 404 });
    }
    
    // Ajout d'un timestamp pour éviter que Vercel/Supabase cache l'ancien fichier
    const fetchUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const res = await fetch(fetchUrl);
    
    if (!res.ok) {
       // Si le fichier n'existe pas encore dans le bucket, on renvoie un fallback propre.
       const defaultText = `# Briac Pécheur - Portfolio & Profil Professionnel

## À propos
Briac Pécheur est un Ingénieur d'Affaires expérimenté évoluant en tant que Commercial B2B et Product Builder.
Il est spécialisé dans la vente complexe, la création de solutions digitales, l'automatisation (No-Code, Make, Airtable) et l'intégration d'Intelligence Artificielle.

## Compétences Clés
- Vente B2B & Closing
- Product Building & Développement Web (React, ThreeJS)
- Automatisation & No-Code (Make, Zapier, Airtable)
- Intelligence Artificielle (Agents conversationnels)

## Contact & Liens
- Site web officiel : https://briac-pecheur.vercel.app/
- LinkedIn : https://www.linkedin.com/in/briac-pecheur/`;

       return new Response(defaultText, {
         status: 200,
         headers: { 
             'Content-Type': 'text/plain; charset=utf-8',
             'Cache-Control': 'public, max-age=0, must-revalidate'
         }
       });
    }

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    return new Response("Internal Server Error.", { status: 500 });
  }
}
