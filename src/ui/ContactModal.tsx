import React, { useState } from 'react';
import { Mail, Send, X, Loader2 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { supabase } from '../lib/supabase';

export const ContactModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { profile } = usePortfolio();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Sauvegarde PRIORITAIRE dans Supabase
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message
        }]);

      if (dbError) {
        console.error("Erreur base de données:", dbError);
        throw new Error("Impossible d'enregistrer le message dans la base de données.");
      }

      // 2. Envoi de l'email de notification via Vercel (En tâche de fond, on s'en fiche s'il échoue en local)
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(err => console.log("Email API failed (normal in local dev):", err));

      // 3. Succès immédiat car le message est bien dans Supabase !
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Erreur réseau');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-[#071326]/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[rgba(216,175,58,0.3)] bg-[#0E1B2E]/90 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <header className="flex items-center justify-between border-b border-[rgba(216,175,58,0.2)] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(216,175,58,0.4)] bg-[rgba(216,175,58,0.1)]">
              <Mail className="h-5 w-5 text-[#F0C674]" strokeWidth={1.5} />
            </span>
            <div>
              <h2 id="contact-title" className="text-xl leading-none text-[#F0C674]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Me contacter
              </h2>
              <p className="mt-1.5 text-xs text-[#C9C2B6]">Envoyez-moi un message directement dans ma boîte mail.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#C9C2B6] transition-colors hover:bg-[rgba(216,175,58,0.1)] hover:text-[#F5EFE1]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-6 py-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2ecc71]/20 text-[#2ecc71]">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-[#F5EFE1]">Message envoyé !</h3>
              <p className="text-sm text-[#C9C2B6]">Merci de m'avoir contacté. Je vous répondrai dans les plus brefs délais.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-medium text-[#C9C2B6] uppercase tracking-wider">Nom complet</label>
                  <input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="h-11 rounded-xl border border-[rgba(216,175,58,0.25)] bg-[#071326]/60 px-4 text-sm text-[#F5EFE1] outline-none transition-colors placeholder:text-[#C9C2B6]/40 focus:border-[rgba(216,175,58,0.6)] focus:ring-1 focus:ring-[rgba(216,175,58,0.4)]"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-[#C9C2B6] uppercase tracking-wider">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="h-11 rounded-xl border border-[rgba(216,175,58,0.25)] bg-[#071326]/60 px-4 text-sm text-[#F5EFE1] outline-none transition-colors placeholder:text-[#C9C2B6]/40 focus:border-[rgba(216,175,58,0.6)] focus:ring-1 focus:ring-[rgba(216,175,58,0.4)]"
                    placeholder="jean@exemple.com"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-medium text-[#C9C2B6] uppercase tracking-wider">Votre message</label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  className="rounded-xl border border-[rgba(216,175,58,0.25)] bg-[#071326]/60 p-4 text-sm text-[#F5EFE1] outline-none transition-colors placeholder:text-[#C9C2B6]/40 focus:border-[rgba(216,175,58,0.6)] focus:ring-1 focus:ring-[rgba(216,175,58,0.4)] resize-none"
                  placeholder="Décrivez votre projet ou laissez-moi un mot..."
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-[#e74c3c]">
                  {errorMessage || "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#D8AF3A_0%,#B88A2A_100%)] text-sm font-semibold text-[#071326] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(216,175,58,0.4)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </button>
              
              {/* Liens supplémentaires */}
              <div className="mt-4 pt-4 border-t border-[rgba(216,175,58,0.2)] flex justify-center gap-6">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="text-[#C9C2B6] hover:text-[#F0C674] text-xs transition-colors">Email</a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-[#C9C2B6] hover:text-[#F0C674] text-xs transition-colors">LinkedIn</a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-[#C9C2B6] hover:text-[#F0C674] text-xs transition-colors">GitHub</a>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
