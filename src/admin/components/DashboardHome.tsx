import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Users, Eye, ArrowUpRight } from 'lucide-react';

export const DashboardHome = () => {
  const [stats, setStats] = useState({
    todayVisitors: 0,
    totalViews: 0,
    totalUniqueVisitors: 0,
    recentPages: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total des vues
      const { count: totalViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      // Visiteurs uniques aujourd'hui (basé sur session_id unique)
      const { data: todayData } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', today.toISOString());
        
      const uniqueToday = new Set(todayData?.map(d => d.session_id)).size;

      // Visiteurs uniques (Total)
      const { data: allData } = await supabase
        .from('page_views')
        .select('session_id');
        
      const totalUniqueVisitors = new Set(allData?.map(d => d.session_id)).size;

      // Pages récemment vues
      const { data: recent } = await supabase
        .from('page_views')
        .select('path, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        todayVisitors: uniqueToday,
        totalViews: totalViews || 0,
        totalUniqueVisitors: totalUniqueVisitors,
        recentPages: recent || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold font-serif text-[#F5EFE1]">Bienvenue Capitaine</h1>
        <p className="text-[#C9C2B6] mt-1 text-sm">Voici l'aperçu de votre navire.</p>
      </header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard 
          title="Visiteurs uniques (Aujourd'hui)" 
          value={loading ? "..." : stats.todayVisitors.toString()} 
          trend="Depuis minuit" 
          icon={<Users className="w-5 h-5 text-[#D8AF3A]" />}
        />
        <StatCard 
          title="Pages vues (Total)" 
          value={loading ? "..." : stats.totalViews.toString()} 
          trend="Historique complet" 
          icon={<Eye className="w-5 h-5 text-[#D8AF3A]" />}
        />
        <StatCard 
          title="Visiteurs uniques (Total)" 
          value={loading ? "..." : stats.totalUniqueVisitors.toString()} 
          trend="Historique complet" 
          icon={<Users className="w-5 h-5 text-[#D8AF3A]" />}
        />
        <StatCard 
          title="Statut du site" 
          value="En ligne" 
          trend="Systèmes nominaux" 
          icon={<Activity className="w-5 h-5 text-green-400" />}
        />
      </div>

      {/* Sections */}
      <div className="bg-[#0E1B2E] rounded-xl border border-[#B99A5A]/20 p-4 md:p-6 mb-8">
        <h3 className="text-xl font-serif mb-4 text-[#F0C674] flex items-center gap-2">
          <Activity className="w-5 h-5" /> Activité Récente (En direct)
        </h3>
        
        {loading ? (
          <p className="text-[#C9C2B6]">Chargement des radars...</p>
        ) : stats.recentPages.length === 0 ? (
          <p className="text-[#C9C2B6]">Aucun visiteur n'a encore exploré l'océan.</p>
        ) : (
          <ul className="space-y-3">
            {stats.recentPages.map((page, i) => (
              <li key={i} className="flex items-center justify-between py-2 border-b border-[#B99A5A]/10 last:border-0">
                <span className="text-[#F5EFE1] font-medium font-mono text-sm">{page.path === '/' ? '/ (Accueil)' : page.path}</span>
                <span className="text-[#C9C2B6] text-xs">
                  {new Date(page.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

const StatCard = ({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) => (
  <div className="bg-[#0E1B2E] p-4 md:p-6 rounded-xl border border-[#B99A5A]/20">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-[#C9C2B6] text-sm font-medium">{title}</h3>
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-[#F5EFE1] mb-2">{value}</div>
    <div className="text-[#D8AF3A] text-xs flex items-center gap-1">
      <ArrowUpRight className="w-3 h-3" /> {trend}
    </div>
  </div>
);
