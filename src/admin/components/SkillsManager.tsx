import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';

export const SkillsManager = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data } = await supabase.from('skills').select('*').order('category').order('display_order');
    if (data) setSkills(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    const { data } = await supabase.from('skills').insert({ name: 'Nouvelle Compétence', level: 50, category: 'Frontend' }).select().single();
    if (data) setSkills([...skills, data]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    await supabase.from('skills').delete().eq('id', id);
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleSave = async (skill: any) => {
    setSaving(skill.id);
    await supabase.from('skills').update(skill).eq('id', skill.id);
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-[#F0C674]">Gestion des Compétences</h2>
        <button onClick={handleAdd} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter
        </button>
      </div>

      {skills.length === 0 && <p className="text-[#C9C2B6]">Aucune compétence pour le moment.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(skill => (
          <div key={skill.id} className="bg-[#0E1B2E] p-4 rounded-xl border border-[#B99A5A]/20">
            <div className="flex justify-between items-start mb-2">
              <input 
                type="text" 
                value={skill.name} 
                onChange={e => setSkills(skills.map(s => s.id === skill.id ? {...s, name: e.target.value} : s))}
                className="bg-transparent border-b border-[#B99A5A]/30 text-lg font-bold text-[#F5EFE1] focus:outline-none focus:border-[#D8AF3A] pb-1 w-2/3"
                placeholder="Nom (ex: React)"
              />
              <button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-[#C9C2B6] text-xs mb-1">Catégorie</label>
                <input 
                  type="text" 
                  value={skill.category || ''} 
                  onChange={e => setSkills(skills.map(s => s.id === skill.id ? {...s, category: e.target.value} : s))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[#C9C2B6] text-xs mb-1">Niveau (%)</label>
                <input 
                  type="range" 
                  min="0" max="100"
                  value={skill.level || 50} 
                  onChange={e => setSkills(skills.map(s => s.id === skill.id ? {...s, level: parseInt(e.target.value)} : s))}
                  className="w-full accent-[#D8AF3A]"
                />
              </div>
              <button 
                onClick={() => handleSave(skill)}
                disabled={saving === skill.id}
                className="w-full bg-[#284A73] hover:bg-[#0F2D3D] text-[#F5EFE1] font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 mt-2 text-sm"
              >
                {saving === skill.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
