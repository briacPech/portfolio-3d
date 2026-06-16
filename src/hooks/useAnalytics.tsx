import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Génère un ID de visiteur unique conservé de manière permanente (localStorage)
const getVisitorId = () => {
  let visitorId = localStorage.getItem('analytics_visitor_id');
  if (!visitorId) {
    visitorId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('analytics_visitor_id', visitorId);
  }
  return visitorId;
};

export const useAnalytics = () => {
  const location = useLocation();
  const hasTrackedInitial = useRef(false);

  useEffect(() => {
    // Ne pas tracker les pages d'administration
    if (location.pathname.startsWith('/admin')) return;

    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert([{
          path: location.pathname,
          session_id: getVisitorId(),
          user_agent: navigator.userAgent
        }]);
      } catch (error) {
        // Silencieux : on ne veut pas bloquer l'utilisateur si les analytics échouent
        console.error("Analytics error:", error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
