import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Calendar, RefreshCw, User, Bot, Trash2, MessageSquare } from 'lucide-react';

interface ChatLog {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string; // clé unique basée sur le timestamp
  messages: ChatLog[];
  startedAt: string;
}

// Regroupe les messages individuels en conversations :
// Un nouveau groupe commence si le délai entre deux messages > 30 minutes
// OU si le pattern n'est pas user->assistant->user->assistant...
function groupIntoConversations(logs: ChatLog[]): Conversation[] {
  if (logs.length === 0) return [];

  // Les logs sont triés DESC (plus récent en premier), on les inverse pour traiter
  const chronological = [...logs].reverse();
  
  const conversations: Conversation[] = [];
  let currentGroup: ChatLog[] = [];
  const GAP_MS = 30 * 60 * 1000; // 30 minutes entre deux sessions

  for (let i = 0; i < chronological.length; i++) {
    const msg = chronological[i];
    const prev = currentGroup[currentGroup.length - 1];

    if (
      prev &&
      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > GAP_MS
    ) {
      // Plus de 30 min d'écart → nouvelle conversation
      conversations.unshift({
        id: currentGroup[0].created_at,
        messages: currentGroup,
        startedAt: currentGroup[0].created_at,
      });
      currentGroup = [];
    }

    currentGroup.push(msg);
  }

  if (currentGroup.length > 0) {
    conversations.unshift({
      id: currentGroup[0].created_at,
      messages: currentGroup,
      startedAt: currentGroup[0].created_at,
    });
  }

  return conversations;
}

export const ChatLogsManager = () => {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { data, error: supabaseError } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (supabaseError) {
      setError(`Erreur Supabase : ${supabaseError.message} (code: ${supabaseError.code})`);
      setLogs([]);
    } else {
      setLogs((data ?? []) as ChatLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const deleteLog = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    const { error } = await supabase.from('chat_logs').delete().eq('id', id);
    if (!error) setLogs(logs.filter(l => l.id !== id));
  };

  const clearAllLogs = async () => {
    if (!confirm('ATTENTION : Supprimer tout l\'historique ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('chat_logs').delete().not('id', 'is', null);
    if (!error) setLogs([]);
  };

  const conversations = groupIntoConversations(logs);
  const totalMessages = logs.length;
  const totalUserMessages = logs.filter(l => l.role === 'user').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#F0C674]">Historique du Chat</h2>
          <p className="text-[#C9C2B6] text-sm mt-1">Échanges avec Le Capitaine, regroupés par conversation.</p>
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

      {/* Stats rapides */}
      {!loading && totalMessages > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Conversations', value: conversations.length, icon: <MessageSquare className="w-4 h-4" /> },
            { label: 'Questions posées', value: totalUserMessages, icon: <User className="w-4 h-4" /> },
            { label: 'Réponses IA', value: totalMessages - totalUserMessages, icon: <Bot className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 p-4 flex items-center gap-3">
              <span className="text-[#D8AF3A]">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold text-[#F5EFE1]">{s.value}</div>
                <div className="text-xs text-[#C9C2B6]/60">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Erreur Supabase */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-xl text-red-300 text-sm space-y-2">
          <p className="font-semibold">⚠️ Impossible de charger l'historique :</p>
          <code className="block text-xs text-red-400 bg-black/30 p-2 rounded">{error}</code>
          <p className="text-xs text-red-300/70">
            Vérifiez que la table <strong>chat_logs</strong> existe bien dans Supabase et que les politiques RLS autorisent la lecture.
          </p>
        </div>
      )}

      {/* Conversations */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-[#C9C2B6] bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20">
            Chargement de l'historique...
          </div>
        ) : conversations.length === 0 && !error ? (
          <div className="p-8 text-center text-[#C9C2B6] flex flex-col items-center bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20">
            <MessageCircle className="w-8 h-8 text-[#D8AF3A]/50 mb-3" />
            <p>Aucun échange enregistré pour le moment.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isExpanded = expandedConv === conv.id;
            const firstUserMsg = conv.messages.find(m => m.role === 'user');
            const preview = firstUserMsg?.content.slice(0, 80) || '…';
            const msgCount = conv.messages.length;

            return (
              <div key={conv.id} className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 overflow-hidden">
                {/* Conversation header — cliquable */}
                <button
                  onClick={() => setExpandedConv(isExpanded ? null : conv.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-[rgba(216,175,58,0.03)] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-0.5 p-1.5 rounded bg-[rgba(216,175,58,0.1)] text-[#F0C674] shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-[#F5EFE1] truncate italic">"{preview}{firstUserMsg && firstUserMsg.content.length > 80 ? '…' : ''}"</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#C9C2B6]/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-[#D8AF3A]/70">{msgCount} message{msgCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#C9C2B6]/50 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Messages de la conversation */}
                {isExpanded && (
                  <div className="border-t border-[#B99A5A]/10 divide-y divide-[#B99A5A]/10">
                    {conv.messages.map((msg) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div key={msg.id} className="p-4 flex gap-3">
                          <span className={`p-1.5 rounded shrink-0 h-fit ${isUser ? 'bg-[rgba(216,175,58,0.1)] text-[#F0C674]' : 'bg-[#050B14] border border-[rgba(216,175,58,0.2)] text-[#D8AF3A]'}`}>
                            {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold ${isUser ? 'text-[#F5EFE1]' : 'text-[#D8AF3A]'}`}>
                                {isUser ? 'Visiteur' : 'Le Capitaine'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#C9C2B6]/50">
                                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                  onClick={() => deleteLog(msg.id)}
                                  className="p-1 rounded text-[#C9C2B6]/30 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-[#C9C2B6]' : 'text-[#8A95A5]'}`}>
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
