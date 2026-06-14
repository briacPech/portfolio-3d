import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type PortfolioData = {
  profile: any;
  seoSettings: any;
  islands: Record<string, any>;
  skills: any[];
  experiences: any[];
  projects: any[];
  loading: boolean;
};

const defaultData: PortfolioData = {
  profile: null,
  seoSettings: null,
  islands: {},
  skills: [],
  experiences: [],
  projects: [],
  loading: true,
};

const PortfolioContext = createContext<PortfolioData>(defaultData);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(defaultData);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          profileRes,
          seoRes,
          islandsRes,
          skillsRes,
          experiencesRes,
          projectsRes
        ] = await Promise.all([
          supabase.from('profile').select('*').eq('id', 1).single().then(res => res, () => ({ data: null })),
          supabase.from('seo_settings').select('*').eq('id', 1).maybeSingle().then(res => res, () => ({ data: null })),
          supabase.from('islands').select('*').then(res => res, () => ({ data: [] })),
          supabase.from('skills').select('*').order('display_order').then(res => res, () => ({ data: [] })),
          supabase.from('experiences').select('*').order('display_order').then(res => res, () => ({ data: [] })),
          supabase.from('projects').select('*').eq('status', 'published').order('display_order').then(res => res, () => ({ data: [] }))
        ]);

        const islandsData = islandsRes.data || [];
        const islandsMap = islandsData.reduce((acc: any, island: any) => {
          acc[island.id] = island;
          return acc;
        }, {});

        setData({
          profile: profileRes.data || {},
          seoSettings: seoRes.data || null,
          islands: islandsMap,
          skills: skillsRes.data || [],
          experiences: experiencesRes.data || [],
          projects: projectsRes.data || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAllData();
  }, []);

  return (
    <PortfolioContext.Provider value={data}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
