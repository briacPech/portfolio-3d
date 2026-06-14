import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, MailOpen, Trash2, Calendar, RefreshCw } from 'lucide-react';

export const MessagesManager = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: !is_read })
      .eq('id', id);
    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: !is_read } : m));
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#F0C674]">Boîte de réception</h2>
        <button onClick={fetchMessages} className="p-2 rounded bg-[#0E1B2E] border border-[rgba(216,175,58,0.3)] text-[#D8AF3A] hover:bg-[rgba(216,175,58,0.1)] transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-[#C9C2B6]">Aucun message reçu pour le moment.</div>
        ) : (
          <div className="divide-y divide-[#B99A5A]/10">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-5 transition-colors ${msg.is_read ? 'bg-transparent' : 'bg-[#D8AF3A]/5'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`text-lg ${msg.is_read ? 'text-[#C9C2B6] font-medium' : 'text-[#F5EFE1] font-semibold'}`}>
                      {msg.name}
                    </h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-[#D8AF3A] hover:underline">{msg.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#C9C2B6] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button 
                      onClick={() => markAsRead(msg.id, msg.is_read)} 
                      className="p-1.5 rounded bg-[rgba(216,175,58,0.1)] text-[#D8AF3A] hover:bg-[rgba(216,175,58,0.2)]"
                      title={msg.is_read ? "Marquer comme non lu" : "Marquer comme lu"}
                    >
                      {msg.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)} 
                      className="p-1.5 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={`mt-3 whitespace-pre-wrap text-sm ${msg.is_read ? 'text-[#8A95A5]' : 'text-[#C9C2B6]'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
