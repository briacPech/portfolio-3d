import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, SeoSettings, IslandData, Skill, Experience, Project } from '../types';
import { INITIAL_EXPERIENCES, INITIAL_PROJECTS } from '../data/initialData';

type PortfolioData = {
  profile: Profile | null;
  seoSettings: SeoSettings | null;
  islands: Record<string, IslandData>;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
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

        const islandsData: IslandData[] = islandsRes.data || [];
        const islandsMap = islandsData.reduce((acc: Record<string, IslandData>, island: IslandData) => {
          acc[island.id] = island;
          return acc;
        }, {});

        // Merge fetched experiences with initial data defaults to guarantee newest entries like RNCP41143 & Maestro title
        let fetchedExps: any[] = experiencesRes.data && experiencesRes.data.length > 0 ? experiencesRes.data : INITIAL_EXPERIENCES;
        for (const initExp of INITIAL_EXPERIENCES) {
          const matchIndex = fetchedExps.findIndex(e => e.company?.includes("Maestro") && initExp.company?.includes("Maestro"));
          if (matchIndex >= 0 && initExp.job_title?.includes("Forward Deployed")) {
            fetchedExps[matchIndex] = { ...fetchedExps[matchIndex], job_title: initExp.job_title };
          }
          const hasCert = fetchedExps.some(e => e.job_title?.includes("RNCP41143"));
          if (!hasCert && initExp.job_title?.includes("RNCP41143")) {
            fetchedExps.push(initExp);
          }
        }

        // Merge fetched projects with initial data defaults to guarantee newest entries like Hackathon
        let fetchedProjects: any[] = projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data : INITIAL_PROJECTS;
        for (const initProj of INITIAL_PROJECTS) {
          const exists = fetchedProjects.some(p => p.title?.toLowerCase().includes(initProj.title.toLowerCase().slice(0, 10)));
          if (!exists) {
            fetchedProjects.push(initProj);
          }
        }

        setData({
          profile: profileRes.data || {},
          seoSettings: seoRes.data || null,
          islands: islandsMap,
          skills: skillsRes.data || [],
          experiences: fetchedExps,
          projects: fetchedProjects,
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
