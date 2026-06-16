import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Calendar, RefreshCw, User, Bot, Trash2 } from 'lucide-react';

export const ChatLogsManager = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Récupère les 100 derniers messages
    
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const deleteLog = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce log ?')) return;
    const { error } = await supabase.from('chat_logs').delete().eq('id', id);
    if (!error) {
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  const clearAllLogs = async () => {
    if (!confirm('ATTENTION : Voulez-vous vraiment supprimer tout l\'historique du chat ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('chat_logs').delete().not('id', 'is', null);
    if (!error) {
      setLogs([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#F0C674]">Historique du Chat</h2>
          <p className="text-[#C9C2B6] text-sm mt-1">Consultez les échanges récents avec Le Capitaine.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="p-2 flex items-center justify-center rounded bg-[#0E1B2E] border border-[rgba(216,175,58,0.3)] text-[#D8AF3A] hover:bg-[rgba(216,175,58,0.1)] transition-colors" title="Rafraîchir">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={clearAllLogs} className="px-3 py-2 flex items-center justify-center gap-2 rounded bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Tout effacer</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#C9C2B6]">Chargement de l'historique...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#C9C2B6] flex flex-col items-center">
            <MessageCircle className="w-8 h-8 text-[#D8AF3A]/50 mb-3" />
            <p>Aucun échange enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#B99A5A]/10">
            {logs.map((log) => {
              const isUser = log.role === 'user';
              return (
                <div key={log.id} className="p-5 transition-colors hover:bg-[rgba(216,175,58,0.02)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded flex items-center justify-center ${isUser ? 'bg-[rgba(216,175,58,0.1)] text-[#F0C674]' : 'bg-[#050B14] border border-[rgba(216,175,58,0.2)] text-[#D8AF3A]'}`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </span>
                      <h3 className={`text-sm font-semibold ${isUser ? 'text-[#F5EFE1]' : 'text-[#D8AF3A]'}`}>
                        {isUser ? 'Visiteur' : 'Le Capitaine'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#C9C2B6] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => deleteLog(log.id)} 
                        className="p-1 rounded text-[#C9C2B6]/50 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Supprimer ce log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 pl-9">
                    <div className={`whitespace-pre-wrap text-sm leading-relaxed ${isUser ? 'text-[#C9C2B6]' : 'text-[#8A95A5]'}`}>
                      {log.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
