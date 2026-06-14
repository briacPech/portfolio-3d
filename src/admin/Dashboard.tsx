import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, FileText, Image, Settings, Activity, User, Map, FolderGit2, Zap, Briefcase } from 'lucide-react';
import { ProfileManager } from './components/ProfileManager';
import { IslandsManager } from './components/IslandsManager';
import { ProjectsManager } from './components/ProjectsManager';
import { SkillsManager } from './components/SkillsManager';
import { ExperiencesManager } from './components/ExperiencesManager';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F5EFE1] flex" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#0E1B2E] border-r border-[#B99A5A]/20 flex flex-col">
        <div className="p-6 border-b border-[#B99A5A]/20">
          <h2 className="text-xl font-serif text-[#F0C674]">Espace Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<User />} label="Profil & Contact" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<Map />} label="Textes des Îles" active={activeTab === 'islands'} onClick={() => setActiveTab('islands')} />
          <NavItem icon={<FolderGit2 />} label="Projets" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
          <NavItem icon={<Zap />} label="Compétences" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
          <NavItem icon={<Briefcase />} label="Expériences" active={activeTab === 'experiences'} onClick={() => setActiveTab('experiences')} />
        </nav>
        <div className="p-4 border-t border-[#B99A5A]/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#C9C2B6] hover:text-[#F0C674] transition-colors w-full p-2 rounded hover:bg-[#071326]"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold font-serif text-[#F5EFE1]">Bienvenue Capitaine</h1>
              <p className="text-[#C9C2B6] mt-2">Voici l'aperçu de votre navire.</p>
            </header>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Visiteurs aujourd'hui" value="--" trend="Bientôt dispo" />
              <StatCard title="Temps de session" value="--" trend="Bientôt dispo" />
              <StatCard title="Statut du site" value="En ligne" trend="Vercel OK" />
            </div>

            {/* Sections */}
            <div className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 p-6">
              <h3 className="text-xl font-serif mb-4 text-[#F0C674]">Activité Récente</h3>
              <p className="text-[#C9C2B6]">L'interface d'administration vient d'être initialisée. Utilisez le menu de gauche pour modifier vos contenus.</p>
            </div>
          </>
        )}

        {activeTab === 'profile' && <ProfileManager />}
        {activeTab === 'islands' && <IslandsManager />}
        {activeTab === 'projects' && <ProjectsManager />}
        {activeTab === 'skills' && <SkillsManager />}
        {activeTab === 'experiences' && <ExperiencesManager />}

      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active ? 'bg-[#D8AF3A]/10 text-[#D8AF3A] border border-[#D8AF3A]/30' : 'text-[#C9C2B6] hover:bg-[#071326] hover:text-[#F5EFE1]'}`}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, trend }: { title: string, value: string, trend: string }) => (
  <div className="bg-[#0E1B2E] p-6 rounded-xl border border-[#B99A5A]/20">
    <h3 className="text-[#C9C2B6] text-sm mb-2">{title}</h3>
    <div className="text-3xl font-bold text-[#F5EFE1] mb-2">{value}</div>
    <div className="text-sm text-[#6A7B4F]">{trend}</div>
  </div>
);
