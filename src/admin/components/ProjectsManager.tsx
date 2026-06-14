import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';

export const ProjectsManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('display_order');
    if (data) setProjects(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    const { data } = await supabase.from('projects').insert({ title: 'Nouveau Projet', status: 'draft' }).select().single();
    if (data) setProjects([...projects, data]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleSave = async (project: any) => {
    setSaving(project.id);
    await supabase.from('projects').update(project).eq('id', project.id);
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-[#F0C674]">Gestion des Projets</h2>
        <button onClick={handleAdd} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ajouter un projet
        </button>
      </div>
      
      {projects.length === 0 && <p className="text-[#C9C2B6]">Aucun projet pour le moment.</p>}

      {projects.map(project => (
        <div key={project.id} className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
          <div className="flex justify-between items-start mb-4">
            <input 
              type="text" 
              value={project.title} 
              onChange={e => setProjects(projects.map(p => p.id === project.id ? {...p, title: e.target.value} : p))}
              className="bg-transparent border-b border-[#B99A5A]/30 text-xl font-bold text-[#F5EFE1] focus:outline-none focus:border-[#D8AF3A] pb-1 w-1/2"
              placeholder="Titre du projet"
            />
            <button onClick={() => handleDelete(project.id)} className="text-red-400 hover:text-red-300 p-2">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[#C9C2B6] text-sm mb-1">Description courte</label>
              <input 
                type="text" 
                value={project.short_description || ''} 
                onChange={e => setProjects(projects.map(p => p.id === project.id ? {...p, short_description: e.target.value} : p))}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-[#C9C2B6] text-sm mb-1">URL de l'image (temporaire avant upload)</label>
              <input 
                type="text" 
                value={project.image_url || ''} 
                onChange={e => setProjects(projects.map(p => p.id === project.id ? {...p, image_url: e.target.value} : p))}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-[#C9C2B6] text-sm mb-1">Lien vers le projet</label>
              <input 
                type="text" 
                value={project.link_url || ''} 
                onChange={e => setProjects(projects.map(p => p.id === project.id ? {...p, link_url: e.target.value} : p))}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
              />
            </div>
            <div className="md:col-span-2 flex justify-between items-center mt-4">
              <select 
                value={project.status} 
                onChange={e => setProjects(projects.map(p => p.id === project.id ? {...p, status: e.target.value} : p))}
                className="bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-2"
              >
                <option value="published">Publié (Visible)</option>
                <option value="draft">Brouillon (Caché)</option>
              </select>
              
              <button 
                onClick={() => handleSave(project)}
                disabled={saving === project.id}
                className="bg-[#284A73] hover:bg-[#0F2D3D] text-[#F5EFE1] font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving === project.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
