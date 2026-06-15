import { useEffect, useState } from "react";
import { gameState } from "../scene/gameState";
import { ContactModal } from "./ContactModal";
import { usePortfolio } from "../contexts/PortfolioContext";

export const NavigationMenu = () => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [currentIsland, setCurrentIsland] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { islands } = usePortfolio();
  
  const getIslandPos = (id: string) => {
    switch(id) {
      case 'profil': return { x: 15, z: -20 };
      case 'skills': return { x: -20, z: -25 };
      case 'projects': return { x: 25, z: 15 };
      case 'experience': return { x: -15, z: 20 };
      default: return { x: 0, z: 0 };
    }
  };

  const getIslandTitle = (id: string) => {
    switch (id) {
      case "profil": return "Mon Profil";
      case "skills": return "Mes Compétences";
      case "projects": return "Mes Projets";
      case "experience": return "Mon Expérience";
      default: return "";
    }
  };

  // Transforme l'objet islands en tableau ordonné
  let islandsList = Object.values(islands).sort((a: any, b: any) => {
    const orderA = ["profil", "skills", "projects", "experience"].indexOf(a.id);
    const orderB = ["profil", "skills", "projects", "experience"].indexOf(b.id);
    return (orderA !== -1 ? orderA : 99) - (orderB !== -1 ? orderB : 99);
  }).map((i: any) => ({
    id: i.id,
    title: getIslandTitle(i.id), // Force les anciens noms
    pos: getIslandPos(i.id)
  }));

  // Fallback de sécurité si Supabase ne répond pas ou que les variables d'environnement manquent
  if (islandsList.length === 0) {
    islandsList = [
      { id: "profil", title: "Mon Profil", pos: { x: 15, z: -20 } },
      { id: "skills", title: "Mes Compétences", pos: { x: -20, z: -25 } },
      { id: "projects", title: "Mes Projets", pos: { x: 25, z: 15 } },
      { id: "experience", title: "Mon Expérience", pos: { x: -15, z: 20 } },
    ];
  }

  useEffect(() => {
    setCurrentIsland(gameState.currentIsland);
    const unsubscribe = gameState.subscribe(() => {
      setTargetId(gameState.targetWaypoint?.id || null);
      setCurrentIsland(gameState.currentIsland);
    });
    return unsubscribe;
  }, []);

  // On s'assure que le menu de navigation est toujours visible
  // const isMobile = window.matchMedia("(max-width: 768px)").matches;

  return (
    <>
    <div className="nav-menu-container">
      {/* On supprime la boussole Emoji */}
      
      {islandsList.map((island) => (
        <button
          key={island.id}
          className="nav-btn-premium"
          onClick={() => gameState.setTargetWaypoint(island.id, island.pos.x, island.pos.z)}
          style={{
            position: "relative",
            padding: "6px 0",
            background: "transparent",
            color: targetId === island.id ? "var(--premium-gold)" : "var(--premium-text)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: targetId === island.id ? "500" : "400",
            fontSize: "clamp(9px, 2.5vw, 11px)",
            letterSpacing: "clamp(0.05em, 1vw, 0.12em)",
            textTransform: "uppercase",
            transition: "all 0.4s ease",
            opacity: targetId && targetId !== island.id ? 0.5 : 1,
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-gold-light)";
              const underline = e.currentTarget.querySelector('.nav-underline') as HTMLElement;
              if (underline) underline.style.width = "100%";
            }
          }}
          onMouseLeave={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-text)";
              const underline = e.currentTarget.querySelector('.nav-underline') as HTMLElement;
              if (underline) underline.style.width = "0%";
            }
          }}
        >
          {island.title}
          
          <div className="nav-underline" style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: targetId === island.id ? "100%" : "0%",
            height: "1px",
            background: "var(--premium-gold)",
            transition: "width 300ms ease-in-out"
          }} />
        </button>
      ))}

      {/* Séparateur très fin */}
      <div className="nav-separator" style={{ width: "1px", height: "14px", background: "rgba(216,175,58,0.2)", flexShrink: 0 }} />

      {/* Bouton Contact */}
      <button
        className="nav-btn-premium"
        onClick={() => setIsContactOpen(true)}
        style={{
          position: "relative",
          padding: "clamp(4px, 1vw, 6px) 0",
          background: "transparent",
          color: "var(--premium-gold)",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontWeight: "600",
          fontSize: "clamp(9px, 2.5vw, 11px)",
          letterSpacing: "clamp(0.05em, 1vw, 0.12em)",
          textTransform: "uppercase",
          transition: "all 0.4s ease",
          whiteSpace: "nowrap",
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#FFF";
          e.currentTarget.style.textShadow = "0 0 10px rgba(216,175,58,0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--premium-gold)";
          e.currentTarget.style.textShadow = "none";
        }}
      >
        Contact
      </button>
    </div>
    <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
};
