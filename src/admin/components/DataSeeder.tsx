import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const INITIAL_SKILLS = [
  // Commercial
  { name: "Closing & Grands Comptes", level: 90, category: "Commercial, Closing & Opérations", description: "Gestion de cycles de vente complets, prospection B2B, négociation de contrats et référencements auprès de centrales d'achat (GMS / Grossistes / RHD).", display_order: 1 },
  { name: "Relation Client Premium", level: 95, category: "Commercial, Closing & Opérations", description: "Suivi personnalisé de portefeuilles d'envergure et gestion de litiges commerciaux complexes.", display_order: 2 },
  { name: "Achats & Supply Chain", level: 85, category: "Commercial, Closing & Opérations", description: "Sourcing et achats internationaux (Islande, Norvège, USA), coordination logistique de flux tendus et suivi qualité (QHSE).", display_order: 3 },
  { name: "Stratégie & Analyse", level: 85, category: "Commercial, Closing & Opérations", description: "Analyse de marché, suivi des indicateurs de performance commerciale (KPIs) et optimisation des leviers de marge.", display_order: 4 },
  
  // Digital
  { name: "Logique Produit & Conception", level: 85, category: "Conception Digitale, Vibe Coding & Data", description: "Capacité à traduire un besoin métier ou un processus de vente complexe en une application digitale structurée, modulaire et fonctionnelle.", display_order: 5 },
  { name: "Vibe Coding & Prototypage IA", level: 85, category: "Conception Digitale, Vibe Coding & Data", description: "Création et déploiement d'applications modernes en s'appuyant sur les LLM pour générer, auditer et faire évoluer du code de production de manière agile.", display_order: 6 },
  { name: "Analyse de Données & Automatisation", level: 90, category: "Conception Digitale, Vibe Coding & Data", description: "Centralisation et nettoyage de données brutes, automatisation de workflows (emails, SMS, notifications) et création de tableaux de bord décisionnels.", display_order: 7 },
  
  // Stack technique
  { name: "IA & Automatisation (Ollama, Gemini, Groq, Make, Zapier)", level: 85, category: "Stack Technique & Logiciels", description: "Ollama (modèles open-source exécutés en local), ChatGPT / Prompt Engineering, Gemini Flash, Groq, Make (Integromat), Zapier.", display_order: 8 },
  { name: "Dev & Cloud (React, Supabase, Tailwind, Vercel)", level: 80, category: "Stack Technique & Logiciels", description: "React 18, TypeScript, Supabase (PostgreSQL, Edge Functions, Auth, RLS), Tailwind CSS, FastAPI, GitHub, Vercel.", display_order: 9 },
  { name: "Outils Data & Productivité (Google Sheets, APIs)", level: 95, category: "Stack Technique & Logiciels", description: "Google Sheets (fonctions avancées & automatisation), Excel, Google Workspace API (Gmail, Drive, Calendar, Sheets).", display_order: 10 },
  { name: "Gestion & Systèmes (CRM, NAS)", level: 85, category: "Stack Technique & Logiciels", description: "CRM, outils de reporting, serveurs locaux / scripts NAS (sauvegardes et infrastructures autonomes hors internet).", display_order: 11 },
];

const INITIAL_EXPERIENCES = [
  { job_title: "Product Builder / Forward Deployed Engineer", company: "Maestro No Code", start_date: "Formation", end_date: "d'excellence", description: "Création de bases de données et automatisation de workflows complexes.\nConstruction de CRM personnalisés et prototypage de produits digitaux.\nMaîtrise d'outils de pointe : Airtable, Make et Softr.", display_order: 1 },
  { job_title: "Commercial / Gestion opérationnelle GMS & Grossistes", company: "Elafood – Nantes", start_date: "11/2023", end_date: "07/2025", description: "Gestion d'un portefeuille de clients GMS & grossistes représentant un CA de 20 M€ au sein d'une équipe de 4 personnes.\nAchats internationaux (Islande, Norvège, USA) : suivi des approvisionnements, coordination logistique et qualité.\nFacturation, suivi des commandes clients/fournisseurs et résolution des litiges.", display_order: 2 },
  { job_title: "Commercial - Produits de la Mer Frais d'Exception", company: "Les Viviers de Noirmoutier", start_date: "01/2021", end_date: "08/2023", description: "Vente et closing auprès de comptes clés en GMS, commerce de gros et export pour des produits premium.\nSuivi des comptes clés et service client haut de gamme.", display_order: 3 },
  { job_title: "Commercial GMS - Produits de la Mer", company: "Pomona Terre Azur", start_date: "11/2017", end_date: "01/2021", description: "Gestion et développement d'un portefeuille d'hypermarchés et supermarchés (CA : 2,8 M€).\nAnalyse de marché et recommandations adaptées aux besoins clients.", display_order: 4 },
  { job_title: "Commercial RHD - Produits Agroalimentaires Haut de Gamme", company: "Pomona Passion Froid", start_date: "10/2014", end_date: "07/2017", description: "Développement du portefeuille RHD haut de gamme sur les secteurs compétitifs de Saint-Tropez et de la Riviera.\nVente de produits premium, suivi client personnalisé et négociation de contrats.", display_order: 5 },
  { job_title: "Commercial GMS - Produits de la Mer", company: "Les Pêcheries Océane", start_date: "01/2009", end_date: "10/2014", description: "Gestion d'un portefeuille de clients RHD (CA : 1,8 M€) et analyse du marché.", display_order: 6 },
  { job_title: "Chef de Secteur GMS - Apprentissage", company: "Socavi (Groupe Unicopa)", start_date: "09/2006", end_date: "10/2008", description: "Développement de la stratégie commerciale, merchandising sur le terrain et accompagnement clients.\nSupervision des accords nationaux et optimisation du référencement produits.", display_order: 7 },
  
  // Educations
  { job_title: "Concepteur de solution No-code (RNCP41143 - Niveau 6)", company: "🎓 LION / Maestro", start_date: "2026", end_date: "2026", description: "Certification professionnelle de niveau 6 enregistrée au RNCP (Code NSF 326 : Informatique, traitement de l'information, réseaux de transmission).", display_order: 7.5 },
  { job_title: "Prompt Engineering pour ChatGPT", company: "🎓 Vanderbilt University", start_date: "", end_date: "", description: "Certification en ingénierie de prompts.", display_order: 8 },
  { job_title: "Google Sheets : Analyse et automatisation", company: "🎓 Google Cloud", start_date: "", end_date: "", description: "Certification en analyse de données.", display_order: 9 },
  { job_title: "High Perf. Collaboration: Leadership & Teamwork", company: "🎓 Northwestern University", start_date: "", end_date: "", description: "Certification en leadership.", display_order: 10 },
  { job_title: "Intro à l'analyse d'entreprise avec tableurs", company: "🎓 Coursera Project Network", start_date: "", end_date: "", description: "Certification en analyse d'entreprise.", display_order: 11 },
  { job_title: "Foundations: Data, Data, Everywhere", company: "🎓 Google / Coursera", start_date: "", end_date: "", description: "Certification data.", display_order: 12 },
  { job_title: "Master 1 CC2A (Cadre Commercial Agroalimentaire)", company: "🎓 SUP'T G Niort", start_date: "2006", end_date: "2008", description: "Diplôme initial.", display_order: 13 },
  { job_title: "BTS Industries Agroalimentaires", company: "🎓 Lycée Agricole Laval", start_date: "2005", end_date: "2006", description: "Diplôme initial.", display_order: 14 },
  { job_title: "Baccalauréat STAE", company: "🎓 Lycée Jules Rieffel", start_date: "2002", end_date: "2004", description: "Diplôme initial.", display_order: 15 },
];

const INITIAL_PROJECTS: any[] = [
  { 
    title: "Festival Connect", 
    short_description: "CRM Global & Hub d'Opérations Terrain", 
    long_description: "Le Problème : Les organisations gèrent souvent leurs contacts, leurs ventes, leurs plannings et leurs communications dans une multitude d'outils séparés (tableurs, mails, SMS), ce qui fragmente l'information et ralentit les équipes.\nLa Solution : Une application web moderne et centralisée qui regroupe toutes les opérations au même endroit (contacts, suivi des partenaires/sponsors, billetterie, gestion logistique et terrain).\nMon Rôle : Conception fonctionnelle, logique du produit, organisation de la base de données PostgreSQL et structuration globale du projet pour répondre fidèlement aux usages concrets du terrain.",
    link_url: "https://festivalconnect.vercel.app",
    secondary_link_text: "📄 Présentation détaillée (Notion)",
    secondary_link_url: "https://app.notion.com/p/Festival-Connect-Presentation-188e32ad451547b383b9b9c05b8e599f?v=364eed8c523280a3a5d6000c4294edb1&source=copy_link",
    image_url: "/images/festival-connect-logo.png",
    status: "published",
    display_order: 1
  },
  {
    title: "Portfolio Immersif 3D & Career Ops IA",
    short_description: "Application web 3D interactive agissant comme une carte de visite, dotée d'un Closer IA et d'un Job Spy automatique.",
    long_description: "<h3>🚨 Le Problème</h3><p>Les CV traditionnels et portfolios classiques peinent à démontrer concrètement des compétences transverses (Vente, Tech, IA). De plus, la veille d'offres et les candidatures prennent un temps considérable, et les recruteurs manquent d'un moyen de conversion direct sur un profil.</p><h3>💡 La Solution</h3><p>Développement de bout en bout d'une web app :</p><ul><li><strong>Portfolio Immersif 3D :</strong> Interface React Three Fiber esthétique et \"wow effect\".</li><li><strong>Assistant \"Closer\" IA :</strong> Agent conversationnel entraîné pour pitcher le profil et convertir en rendez-vous.</li><li><strong>Career Ops (Job Spy) :</strong> Back-office sécurisé avec scraping quotidien et automatique d'offres, scoring IA et génération de CV.</li><li><strong>AEO :</strong> Fichier <code>llms.txt</code> dynamique pour optimiser l'indexation par ChatGPT/Perplexity.</li></ul><h3>🎯 Mon Rôle</h3><p>Product Builder & Ingénieur Commercial : Conception de A à Z (Front/Back/DB), ingénierie de prompt, automatisation des flux, et UX orientée conversion.</p>",
    link_url: "https://github.com/briacPech/portfolio-3d",
    secondary_link_text: "Aperçu en ligne",
    secondary_link_url: "https://briac-pecheur.vercel.app/",
    tags: ["React", "Three.js", "Supabase", "Edge Functions", "IA / LLMs", "TailwindCSS"],
    image_url: "/bp_favicon_gold.png",
    status: "published",
    display_order: 2
  },
  {
    title: "Jarvis - Assistant IA Vocal & Local",
    short_description: "Assistant vocal autonome hybride, doté de STT/TTS local, mémoire RAG, routage intelligent Ollama/Groq et pilotage Windows.",
    long_description: "<h3>🚨 Le Problème</h3><p>Les assistants vocaux (Siri, Alexa) soulèvent de forts enjeux de confidentialité des données. Les API cloud (OpenAI) sont coûteuses pour une utilisation 24/7. De plus, les assistants actuels manquent d'une véritable mémoire long terme et ne sont pas programmables pour des actions locales poussées.</p><h3>💡 La Solution</h3><p>Développement de <strong>Jarvis</strong>, une IA personnelle 100% autonome et hybride :</p><ul><li><strong>Routage Local/Cloud intelligent :</strong> Modèle local (Ollama/Qwen 3B) pour les tâches simples avec bascule sur le Cloud (Groq) pour les requêtes complexes, assurant rapidité et économie.</li><li><strong>Mémoire & RAG :</strong> Mémoire persistante SQLite + ChromaDB permettant à l'assistant de retenir des faits et le contexte des conversations passées.</li><li><strong>100% Vocal :</strong> Détection de mot d'éveil hors-ligne (\"Salut Jarvis\") et Text-To-Speech (Piper).</li><li><strong>Interface & Système :</strong> Backend FastAPI robuste, pilotage du système local (volume, musique via Tidal) et interface Web.</li></ul><h3>🎯 Mon Rôle</h3><p>Ingénieur IA & Développeur Backend (Python) : Architecture système, implémentation des algorithmes d'IA (RAG, routage), développement du backend API, et optimisation de la stack pour GPU modeste (GTX 1650 4Go).</p>",
    link_url: "https://github.com/briacPech/jarvis-assistant",
    tags: ["Python", "FastAPI", "Ollama", "Groq", "ChromaDB", "SQLite", "Piper TTS"],
    image_url: "",
    status: "published",
    display_order: 3
  },
  {
    title: "AutoPoster Pro - IA pour Artisans",
    short_description: "Application SaaS pour générer des annonces via l'IA et récolter des prospects (CRM intégré).",
    long_description: "<h3>🚨 Le Problème</h3><p>Les professionnels de l'artisanat manquent de temps et de compétences en marketing digital pour créer des annonces accrocheuses, gérer des Landing Pages et suivre efficacement les demandes de devis entrants.</p><h3>💡 La Solution</h3><p>Développement de <strong>AutoPoster Pro</strong>, une solution SaaS :</p><ul><li><strong>Génération IA :</strong> Création automatique d'annonces optimisées via Google Gemini.</li><li><strong>CRM & Leads :</strong> Centralisation et traitement des demandes de devis.</li><li><strong>Landing Page :</strong> Page vitrine générée automatiquement, optimisée SEO local.</li></ul><h3>🎯 Mon Rôle</h3><p>Développeur Full-Stack & Intégrateur IA : React/Zustand pour l'interface, Node/Express pour le backend, et prompt engineering sur l'API Gemini.</p>",
    link_url: "",
    tags: ["React 19", "TypeScript", "Node.js", "Express", "Google Gemini AI", "Zustand"],
    image_url: "",
    status: "published",
    display_order: 4
  }
];

const INITIAL_ISLANDS = [
  { id: 'profil', title: "Briac Pécheur", presentation: "Commercial B2B & Solutions Digitales", is_active: true },
  { id: 'skills', title: "Mes Compétences", presentation: "L'arsenal de ma navigation", is_active: true },
  { id: 'experience', title: "Mon Sillage", presentation: "Parcours et expériences", is_active: true },
  { id: 'projects', title: "Mes Expéditions", presentation: "Projets et réalisations", is_active: true }
];

export const DataSeeder = () => {
  const [needsSeeding, setNeedsSeeding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    const { count } = await supabase.from('experiences').select('*', { count: 'exact', head: true });
    // Afficher toujours le seeder en mode "Forcer l'import complet" pour le débogage
    setNeedsSeeding(true);
    setLoading(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    
    // Vider les tables existantes pour éviter les doublons lors de cet import forcé
    await supabase.from('skills').delete().not('id', 'is', null);
    await supabase.from('experiences').delete().not('id', 'is', null);
    await supabase.from('projects').delete().not('id', 'is', null);

    // Insert Skills
    for (const skill of INITIAL_SKILLS) {
      await supabase.from('skills').insert(skill);
    }
    
    // Insert Experiences
    for (const exp of INITIAL_EXPERIENCES) {
      await supabase.from('experiences').insert(exp);
    }

    // Insert Projects
    for (const proj of INITIAL_PROJECTS) {
      await supabase.from('projects').insert(proj);
    }

    // Update Islands
    for (const island of INITIAL_ISLANDS) {
      await supabase.from('islands').update({ 
        title: island.title, 
        presentation: island.presentation 
      }).eq('id', island.id);
    }

    // Update Profile
    await supabase.from('profile').update({
      name: "Briac Pécheur",
      title: "Commercial B2B & Solutions Digitales",
      short_description: "Commercial B2B expérimenté avec plus de 15 ans d'expérience...",
      bio: "Commercial B2B expérimenté avec plus de 15 ans d'expérience et la gestion de portefeuilles, je mets aujourd'hui mon sens du commerce et ma compréhension des besoins métier au service de solutions digitales concrètes. Entre agroalimentaire, développement commercial, no-code, IA et vibe coding, je sais vendre, comprendre et créer pour aider les entreprises à gagner du temps et mieux s'organiser.",
    }).eq('id', 1);

    setSeeding(false);
    setDone(true);
    alert('Importation complète réussie !');
    window.location.reload();
  };

  if (loading) return null;
  if (!needsSeeding && !done) return null;

  return (
    <div className="bg-[#D8AF3A]/10 border border-[#D8AF3A]/30 p-4 md:p-6 rounded-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-[#F0C674] font-serif text-lg md:text-xl mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" /> Importation Complète (Écrasement)
        </h3>
        <p className="text-[#C9C2B6] text-xs md:text-sm">
          Cette action va importer L'INTÉGRALITÉ de vos textes actuels (toutes les expériences et formations).
          Attention : cela écrasera les données que vous venez peut-être d'importer.
        </p>
      </div>
      <button 
        onClick={handleSeed}
        disabled={seeding || done}
        className="w-full md:w-auto bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {seeding ? <Loader2 className="animate-spin h-5 w-5" /> : (done ? <CheckCircle className="h-5 w-5" /> : <Database className="h-5 w-5" />)}
        {seeding ? 'Importation...' : (done ? 'Terminé !' : 'Lancer l\'import')}
      </button>
    </div>
  );
};
