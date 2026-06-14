import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Globe, Save, Loader2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export const SeoManager = () => {
  const [seo, setSeo] = useState<any>({
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    twitter_card: 'summary_large_image'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSeo();
  }, []);

  const fetchSeo = async () => {
    try {
      const { data, error } = await supabase.from('seo_settings').select('*').eq('id', 1).single();
      if (data) {
        setSeo(data);
      } else if (error && error.code === 'PGRST116') {
        // La ligne n'existe pas encore
        console.log("Les paramètres SEO n'existent pas encore.");
      }
    } catch (error) {
      console.error('Error fetching SEO:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({ id: 1, ...seo });
      
      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving SEO:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#D8AF3A] animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-[#D8AF3A]" />
        <h2 className="text-2xl font-serif text-[#F0C674]">Référencement & SEO</h2>
      </div>

      <div className="bg-[#D8AF3A]/10 border border-[#D8AF3A]/30 p-4 rounded-xl mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#F0C674] shrink-0 mt-0.5" />
        <p className="text-[#F5EFE1] text-sm leading-relaxed">
          Ces informations sont celles qui s'afficheront dans les résultats de recherche Google, 
          ainsi que lorsque vous partagerez le lien de votre site sur LinkedIn, WhatsApp, etc.
        </p>
      </div>

      <div className="bg-[#0E1B2E] border border-[#B99A5A]/20 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-[#B99A5A]/20 bg-[#050B14]">
          <h3 className="text-lg font-medium text-[#F5EFE1] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C9C2B6]" />
            Balises Principales (Meta)
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[#C9C2B6] text-sm font-medium mb-2">
              Titre du Site (Title)
            </label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              placeholder="Briac Pécheur - Commercial B2B & Vibe Coder"
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-3 text-[#F5EFE1] focus:border-[#D8AF3A] focus:ring-1 focus:ring-[#D8AF3A] outline-none transition-all"
            />
            <p className="text-xs text-[#C9C2B6]/60 mt-2">Affiché dans l'onglet du navigateur et comme titre principal sur Google (Max 60 caractères conseillé).</p>
          </div>

          <div>
            <label className="block text-[#C9C2B6] text-sm font-medium mb-2">
              Description (Meta Description)
            </label>
            <textarea
              value={seo.description || ''}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              rows={3}
              placeholder="Commercial B2B expérimenté avec plus de 15 ans d'expérience. Création d'applications digitales..."
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-3 text-[#F5EFE1] focus:border-[#D8AF3A] focus:ring-1 focus:ring-[#D8AF3A] outline-none transition-all"
            />
            <p className="text-xs text-[#C9C2B6]/60 mt-2">Résumé affiché sous le titre dans les résultats de recherche (Max 160 caractères conseillé).</p>
          </div>

          <div>
            <label className="block text-[#C9C2B6] text-sm font-medium mb-2">
              Mots-clés (Keywords)
            </label>
            <input
              type="text"
              value={seo.keywords || ''}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
              placeholder="commercial, b2b, nantes, developpeur, vibe coding..."
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-3 text-[#F5EFE1] focus:border-[#D8AF3A] focus:ring-1 focus:ring-[#D8AF3A] outline-none transition-all"
            />
            <p className="text-xs text-[#C9C2B6]/60 mt-2">Séparés par des virgules.</p>
          </div>

          <div>
            <label className="block text-[#C9C2B6] text-sm font-medium mb-2">
              Image de partage (Open Graph Image URL)
            </label>
            <input
              type="text"
              value={seo.og_image || ''}
              onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
              placeholder="https://votre-site.com/image-partage.jpg"
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-3 text-[#F5EFE1] focus:border-[#D8AF3A] focus:ring-1 focus:ring-[#D8AF3A] outline-none transition-all"
            />
            <p className="text-xs text-[#C9C2B6]/60 mt-2">L'URL de l'image qui s'affichera lors d'un partage sur LinkedIn ou Twitter. (Utilisez le gestionnaire de médias pour héberger une image).</p>
            
            {seo.og_image && (
              <div className="mt-4 border border-[#B99A5A]/20 rounded-lg overflow-hidden max-w-sm">
                <img src={seo.og_image} alt="Aperçu Open Graph" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer les paramètres
        </button>

        {saveStatus === 'success' && (
          <span className="text-green-400 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" /> Enregistré
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-red-400 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> Erreur lors de l'enregistrement
          </span>
        )}
      </div>
    </div>
  );
};
