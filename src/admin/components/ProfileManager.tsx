import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Upload, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

export const ProfileManager = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    setUploadingAvatar(true);
    
    try {
      const { error } = await supabase.storage
        .from('portfolio-media')
        .upload('avatar.png', file, {
          cacheControl: '0',
          upsert: true
        });
        
      if (error) throw error;
      
      // Update timestamp to force image refresh
      setAvatarTimestamp(Date.now());
      alert('Photo de profil mise à jour avec succès !');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Erreur lors de l\\'upload : ' + error.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#D8AF3A] h-8 w-8" /></div>;

  return (
    <div className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
      <h2 className="text-2xl font-serif text-[#F0C674] mb-6">Gestion du Profil & Contact</h2>
      
      {/* Photo de profil */}
      <div className="mb-8 p-6 bg-[#050B14] rounded-xl border border-[#B99A5A]/30 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full border-2 border-[#D8AF3A] overflow-hidden bg-[#0E1B2E] flex shrink-0 items-center justify-center">
          <img 
            src={`${supabase.storage.from('portfolio-media').getPublicUrl('avatar.png').data.publicUrl}?t=${avatarTimestamp}`} 
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if no avatar exists yet
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23B99A5A" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-[#F5EFE1] font-bold mb-2">Photo de profil</h3>
          <p className="text-[#C9C2B6] text-sm mb-4">Cette image s'affichera dans le panneau "Mon Profil" public. Format recommandé : carré (JPG ou PNG).</p>
          <label className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] px-4 py-2 rounded-lg font-bold inline-flex items-center gap-2 cursor-pointer transition-colors text-sm">
            {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploadingAvatar ? 'Envoi...' : 'Changer la photo'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
      </div>

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
