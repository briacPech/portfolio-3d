import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Génère un ID de session unique conservé pendant la durée de la visite
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
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
          session_id: getSessionId(),
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
