import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';

export const IslandsManager = () => {
  const [islands, setIslands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchIslands();
  }, []);

  const fetchIslands = async () => {
    const { data } = await supabase.from('islands').select('*').order('id');
    if (data) setIslands(data);
    setLoading(false);
  };

  const handleSave = async (island: any) => {
    setSaving(island.id);
    await supabase.from('islands').update({
      title: island.title,
      presentation: island.presentation,
      is_active: island.is_active
    }).eq('id', island.id);
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-[#F0C674] mb-6">Gestion des Îles (Sections 3D)</h2>
      
      {islands.map(island => (
        <div key={island.id} className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#F5EFE1] capitalize">Section : {island.id}</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[#C9C2B6] text-sm">Visible sur la carte</span>
              <input 
                type="checkbox" 
                checked={island.is_active}
                onChange={e => setIslands(islands.map(i => i.id === island.id ? {...i, is_active: e.target.checked} : i))}
                className="w-4 h-4 accent-[#D8AF3A]"
              />
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[#C9C2B6] text-sm mb-1">Titre affiché (Menu & Modal)</label>
              <input 
                type="text" 
                value={island.title} 
                onChange={e => setIslands(islands.map(i => i.id === island.id ? {...i, title: e.target.value} : i))}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-[#C9C2B6] text-sm mb-1">Texte d'introduction</label>
              <textarea 
                rows={3}
                value={island.presentation || ''} 
                onChange={e => setIslands(islands.map(i => i.id === island.id ? {...i, presentation: e.target.value} : i))}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
              />
            </div>
            <button 
              onClick={() => handleSave(island)}
              disabled={saving === island.id}
              className="bg-[#284A73] hover:bg-[#0F2D3D] text-[#F5EFE1] font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving === island.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
              Mettre à jour l'île
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
