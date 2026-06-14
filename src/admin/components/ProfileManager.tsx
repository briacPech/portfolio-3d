import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Upload, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

export const ProfileManager = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profile').select('*').eq('id', 1).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profile').update(profile).eq('id', 1);
    setSaving(false);
    if (error) {
      alert(`Erreur lors de la sauvegarde : ${error.message}`);
    } else {
      alert('Profil sauvegardé avec succès !');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
      <h2 className="text-2xl font-serif text-[#F0C674] mb-6">Gestion du Profil & Contact</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#C9C2B6] mb-2 text-sm">Nom / Pseudo</label>
            <input 
              type="text" 
              value={profile?.name || ''} 
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-[#C9C2B6] mb-2 text-sm">Titre du poste</label>
            <input 
              type="text" 
              value={profile?.title || ''} 
              onChange={e => setProfile({...profile, title: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#C9C2B6] mb-2 text-sm">Description Courte</label>
            <input 
              type="text" 
              value={profile?.short_description || ''} 
              onChange={e => setProfile({...profile, short_description: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-[#C9C2B6] uppercase tracking-wider">Biographie</label>
            <RichTextEditor 
              value={profile?.bio || ''}
              onChange={(value) => setProfile({ ...profile, bio: value })}
            />
          </div>
          <div>
            <label className="block text-[#C9C2B6] mb-2 text-sm">Lien GitHub</label>
            <input 
              type="text" 
              value={profile?.github_url || ''} 
              onChange={e => setProfile({...profile, github_url: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-[#C9C2B6] mb-2 text-sm">Lien LinkedIn</label>
            <input 
              type="text" 
              value={profile?.linkedin_url || ''} 
              onChange={e => setProfile({...profile, linkedin_url: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-[#C9C2B6] mb-2 text-sm">Email de Contact</label>
            <input 
              type="email" 
              value={profile?.contact_email || ''} 
              onChange={e => setProfile({...profile, contact_email: e.target.value})}
              className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg p-3"
            />
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input 
              type="checkbox" 
              checked={profile?.is_contact_form_active || false}
              onChange={e => setProfile({...profile, is_contact_form_active: e.target.checked})}
              className="w-5 h-5 accent-[#D8AF3A]"
            />
            <label className="text-[#C9C2B6]">Activer le formulaire de contact public</label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
          Enregistrer le profil
        </button>
      </form>
    </div>
  );
};
