import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon, Upload, Loader2, Copy, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const BUCKET_NAME = 'portfolio-media';

export const MediaManager = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list();
      
      if (error) {
        console.error('Error fetching files:', error);
        return;
      }
      
      // Filtrer les dossiers cachés (comme .emptyFolderPlaceholder)
      const validFiles = data?.filter(f => f.name !== '.emptyFolderPlaceholder') || [];
      
      // Trier par date de création récente
      validFiles.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      setFiles(validFiles);
    } catch (error) {
      console.error('Error in fetchFiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    setIsUploading(true);
    
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Rafraîchir la liste
      await fetchFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Erreur lors de l\'upload : ' + error.message + '\n\nAvez-vous bien créé le bucket "portfolio-media" en mode Public sur Supabase ?');
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette image ? Les liens qui l\'utilisent seront cassés.')) return;
    
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      if (error) throw error;
      
      setFiles(files.filter(f => f.name !== fileName));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyToClipboard = (fileName: string) => {
    const url = getPublicUrl(fileName);
    navigator.clipboard.writeText(url);
    setCopyStatus(fileName);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-[#D8AF3A]" />
          <h2 className="text-2xl font-serif text-[#F0C674]">Bibliothèque de Médias</h2>
        </div>
        
        <label className="bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] px-4 py-2 rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-colors">
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span>{isUploading ? 'Envoi en cours...' : 'Uploader une image'}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="bg-[#D8AF3A]/10 border border-[#D8AF3A]/30 p-4 rounded-xl mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#F0C674] shrink-0 mt-0.5" />
        <div className="text-[#F5EFE1] text-sm leading-relaxed">
          <p className="font-bold mb-1">Configuration Supabase Requise :</p>
          <p>Avant d'uploader votre première image, assurez-vous d'avoir créé un bucket nommé <strong>portfolio-media</strong> sur votre tableau de bord Supabase (Menu Storage), et de l'avoir paramétré en <strong>Public</strong>.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#D8AF3A] animate-spin" /></div>
      ) : files.length === 0 ? (
        <div className="bg-[#0E1B2E] border border-[#B99A5A]/20 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <ImageIcon className="w-12 h-12 text-[#B99A5A]/40 mb-4" />
          <h3 className="text-lg font-medium text-[#F5EFE1] mb-2">Aucune image pour le moment</h3>
          <p className="text-[#C9C2B6] text-sm max-w-md">
            Uploadez vos logos de projets, votre photo de profil ou vos images d'illustration ici. Vous pourrez ensuite copier leur lien pour les utiliser dans le site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => {
            const url = getPublicUrl(file.name);
            const isCopied = copyStatus === file.name;
            
            return (
              <div key={file.id} className="bg-[#0E1B2E] border border-[#B99A5A]/20 rounded-xl overflow-hidden group relative">
                <div className="aspect-square bg-[#050B14] flex items-center justify-center p-4 relative">
                  <img 
                    src={url} 
                    alt={file.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-[#050B14]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button 
                      onClick={() => copyToClipboard(file.name)}
                      className="bg-[#D8AF3A] text-[#050B14] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
                    >
                      {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copié !' : 'Copier le lien'}
                    </button>
                    <button 
                      onClick={() => handleDelete(file.name)}
                      className="bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="p-3 border-t border-[#B99A5A]/20">
                  <p className="text-xs text-[#C9C2B6] truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-[#C9C2B6]/50 mt-1">{(file.metadata.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
