import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSEO() {
  const seoData = {
    id: 1,
    title: "Briac Pécheur | Product Builder & Ingénieur Commercial B2B",
    description: "Découvrez le portfolio interactif 3D de Briac Pécheur. Ingénieur d'affaires expérimenté, expert en solutions digitales, automatisation (No-Code) et IA.",
    keywords: "commercial, b2b, nantes, developpeur, nocode, make, airtable, portfolio 3d, react, threejs, closer, product builder, ia, automatisation",
    og_image: "https://briac-pecheur.vercel.app/og-image.png",
    twitter_card: "summary_large_image"
  };

  console.log("Upserting SEO data...");
  const { data, error } = await supabase.from('seo_settings').upsert(seoData).select();
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success:", data);
  }
}

updateSEO();
