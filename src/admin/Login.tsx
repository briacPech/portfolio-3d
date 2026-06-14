import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(`Erreur Supabase: ${error.message}`);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#071326] flex items-center justify-center p-4" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="w-full max-w-md bg-[#0E1B2E] rounded-2xl shadow-2xl border border-[#B99A5A]/30 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#F0C674] mb-2">Espace Capitaine</h1>
          <p className="text-[#C9C2B6]">Administration du Portfolio</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#C9C2B6] text-sm mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#B99A5A]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[#D8AF3A] transition-colors"
                placeholder="capitaine@navire.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#C9C2B6] text-sm mb-2">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#B99A5A]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050B14] border border-[#B99A5A]/30 text-[#F5EFE1] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[#D8AF3A] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D8AF3A] hover:bg-[#F0C674] text-[#050B14] font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Embarquer'}
          </button>
        </form>
      </div>
    </div>
  );
};
