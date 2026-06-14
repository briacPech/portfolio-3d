import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';

export const ExperiencesManager = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase.from('experiences').select('*').order('display_order');
    if (data) setExperiences(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    const { data } = await supabase.from('experiences').insert({ job_title: 'Nouveau Poste', company: 'Entreprise' }).select().single();
    if (data) setExperiences([...experiences, data]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    await supabase.from('experiences').delete().eq('id', id);
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const handleSave = async (exp: any) => {
    setSaving(exp.id);
    await supabase.from('experiences').update(exp).eq('id', exp.id);
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-[#F0C674]">Gestion des Expériences</h2>
        <button onClick={handleAdd} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter
        </button>
      </div>

      {experiences.length === 0 && <p className="text-[#C9C2B6]">Aucune expérience pour le moment.</p>}

      <div className="space-y-6">
        {experiences.map(exp => (
          <div key={exp.id} className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
            <div className="flex justify-between items-start mb-4">
              <input 
                type="text" 
                value={exp.job_title} 
                onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, job_title: e.target.value} : x))}
                className="bg-transparent border-b border-[#B99A5A]/30 text-xl font-bold text-[#F5EFE1] focus:outline-none focus:border-[#D8AF3A] pb-1 w-1/2"
                placeholder="Titre du poste"
              />
              <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-300 p-2">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#C9C2B6] text-sm mb-1">Entreprise</label>
                <input 
                  type="text" 
                  value={exp.company || ''} 
                  onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, company: e.target.value} : x))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#C9C2B6] text-sm mb-1">Date début</label>
                  <input 
                    type="text" 
                    value={exp.start_date || ''} 
                    onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, start_date: e.target.value} : x))}
                    className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-[#C9C2B6] text-sm mb-1">Date fin</label>
                  <input 
                    type="text" 
                    value={exp.end_date || ''} 
                    onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, end_date: e.target.value} : x))}
                    className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#C9C2B6] text-sm mb-1">Description détaillée</label>
                <textarea 
                  rows={3}
                  value={exp.description || ''} 
                  onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, description: e.target.value} : x))}
                  className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end mt-4">
                <button 
                  onClick={() => handleSave(exp)}
                  disabled={saving === exp.id}
                  className="bg-[#284A73] hover:bg-[#0F2D3D] text-[#F5EFE1] font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving === exp.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
