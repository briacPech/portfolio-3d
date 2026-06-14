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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => (
          <div key={skill.id} className="bg-[#0E1B2E] p-4 rounded-xl border border-[#B99A5A]/20 relative group">
            <button
              onClick={() => handleDelete(skill.id)}
              className="absolute top-2 right-2 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C9C2B6] mb-1">Nom de la compétence</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, name: e.target.value } : s))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-2 text-sm text-[#F5EFE1] focus:border-[#D8AF3A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9C2B6] mb-1">Catégorie</label>
                <input
                  type="text"
                  value={skill.category || ''}
                  onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, category: e.target.value } : s))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-2 text-sm text-[#F5EFE1] focus:border-[#D8AF3A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9C2B6] mb-1">Description détaillée (Optionnel)</label>
                <textarea
                  rows={3}
                  value={skill.description || ''}
                  onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, description: e.target.value } : s))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 rounded-lg p-2 text-sm text-[#F5EFE1] focus:border-[#D8AF3A] focus:outline-none"
                  placeholder="Ex: Gestion de cycles de vente complets..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9C2B6] mb-1">Niveau ({skill.level}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.level}
                  onChange={(e) => setSkills(skills.map(s => s.id === skill.id ? { ...s, level: parseInt(e.target.value) } : s))}
                  className="w-full accent-[#D8AF3A]"
                />
              </div>
              <button
                onClick={() => handleSave(skill)}
                className="w-full bg-[#B99A5A]/20 hover:bg-[#D8AF3A] text-[#F5EFE1] hover:text-[#050B14] p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {saving === skill.id ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3" />} Enregistrer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
