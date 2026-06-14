import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, User, Map, FolderGit2, Zap, Briefcase, Menu, X, Globe, Image as ImageIcon } from 'lucide-react';
import { ProfileManager } from './components/ProfileManager';
import { IslandsManager } from './components/IslandsManager';
import { ProjectsManager } from './components/ProjectsManager';
import { SkillsManager } from './components/SkillsManager';
import { ExperiencesManager } from './components/ExperiencesManager';
import { SeoManager } from './components/SeoManager';
import { MediaManager } from './components/MediaManager';
import { DataSeeder } from './components/DataSeeder';
import { DashboardHome } from './components/DashboardHome';
import { MessagesManager } from './components/MessagesManager';
import { CareerOpsManager } from './components/CareerOpsManager';
import { Mail, Briefcase } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-full bg-[#050B14] text-[#F5EFE1] flex flex-col md:flex-row text-sm overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-3 bg-[#0E1B2E] border-b border-[#B99A5A]/20">
        <h2 className="text-lg font-serif text-[#F0C674]">Espace Admin</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#C9C2B6] p-1">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-56 bg-[#0E1B2E] border-b md:border-b-0 md:border-r border-[#B99A5A]/20 flex-col`}>
        <div className="hidden md:block p-4 border-b border-[#B99A5A]/20">
          <h2 className="text-lg font-serif text-[#F0C674]">Espace Admin</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => handleTabClick('dashboard')} />
          <NavItem icon={<Mail className="w-4 h-4" />} label="Boîte de réception" active={activeTab === 'messages'} onClick={() => handleTabClick('messages')} />
          <NavItem icon={<User className="w-4 h-4" />} label="Profil & Contact" active={activeTab === 'profile'} onClick={() => handleTabClick('profile')} />
          <NavItem icon={<Map className="w-4 h-4" />} label="Textes des Îles" active={activeTab === 'islands'} onClick={() => handleTabClick('islands')} />
          <NavItem icon={<FolderGit2 className="w-4 h-4" />} label="Projets" active={activeTab === 'projects'} onClick={() => handleTabClick('projects')} />
          <NavItem icon={<Zap className="w-4 h-4" />} label="Compétences" active={activeTab === 'skills'} onClick={() => handleTabClick('skills')} />
          <NavItem icon={<Briefcase className="w-4 h-4" />} label="Expériences" active={activeTab === 'experiences'} onClick={() => handleTabClick('experiences')} />
          <NavItem icon={<ImageIcon className="w-4 h-4" />} label="Médias" active={activeTab === 'media'} onClick={() => handleTabClick('media')} />
          <NavItem icon={<Globe className="w-4 h-4" />} label="SEO" active={activeTab === 'seo'} onClick={() => handleTabClick('seo')} />
          <div className="my-2 border-t border-[#B99A5A]/20"></div>
          <NavItem icon={<Briefcase className="w-4 h-4 text-[#D8AF3A]" />} label="Career Ops (IA)" active={activeTab === 'careerops'} onClick={() => handleTabClick('careerops')} />
        </nav>
        <div className="p-3 border-t border-[#B99A5A]/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#C9C2B6] hover:text-[#F0C674] transition-colors w-full p-2 rounded hover:bg-[#071326]"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <DataSeeder />
          
          {activeTab === 'dashboard' && (
            <DashboardHome />
          )}

          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'profile' && <ProfileManager />}
          {activeTab === 'islands' && <IslandsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'experiences' && <ExperiencesManager />}
          {activeTab === 'seo' && <SeoManager />}
          {activeTab === 'media' && <MediaManager />}
          {activeTab === 'careerops' && <CareerOpsManager />}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, trend }: { title: string, value: string, trend: string }) => (
  <div className="bg-[#0E1B2E] p-4 md:p-6 rounded-xl border border-[#B99A5A]/20">
    <h3 className="text-[#C9C2B6] text-sm font-medium mb-2">{title}</h3>
    <div className="text-2xl md:text-3xl font-bold text-[#F5EFE1] mb-2">{value}</div>
    <div className="text-[#D8AF3A] text-sm">{trend}</div>
  </div>
);

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active ? 'bg-[#D8AF3A]/10 text-[#D8AF3A] border border-[#D8AF3A]/30' : 'text-[#C9C2B6] hover:bg-[#071326] hover:text-[#F5EFE1]'}`}>
    {icon}
    <span>{label}</span>
  </button>
);
