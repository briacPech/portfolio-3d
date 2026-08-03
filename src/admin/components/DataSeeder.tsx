import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { INITIAL_SKILLS, INITIAL_EXPERIENCES, INITIAL_PROJECTS, INITIAL_ISLANDS } from '../../data/initialData';

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
