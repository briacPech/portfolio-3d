import { useEffect, useState } from "react";
import { gameState } from "../scene/gameState";
import { ContactModal } from "./ContactModal";
import { usePortfolio } from "../contexts/PortfolioContext";

export const NavigationMenu = () => {
  const [targetId, setTargetId] = useState<string | null>(null);
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
    const unsubscribe = gameState.subscribe(() => {
      setTargetId(gameState.targetWaypoint?.id || null);
    });
    return unsubscribe;
  }, []);

  return (
    <>
    <div className="nav-menu-container" style={{
        position: "absolute",
        bottom: "20px", 
        left: "50%",
        transform: "translateX(-50%)",
        width: "max-content", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        zIndex: 100,
        pointerEvents: "auto",
        background: "rgba(14, 27, 46, 0.65)",
        padding: "8px 24px", // Pilule ultra-fine
        borderRadius: "100px", 
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4)",
      }}>
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
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transition: "all 0.4s ease",
            opacity: targetId && targetId !== island.id ? 0.5 : 1, 
          }}
          onMouseEnter={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-gold-light)";
              const underline = e.currentTarget.querySelector('.nav-underline') as HTMLElement;
              if (underline) underline.style.transform = "scaleX(1)";
            }
          }}
          onMouseLeave={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-text)";
              const underline = e.currentTarget.querySelector('.nav-underline') as HTMLElement;
              if (underline) underline.style.transform = "scaleX(0)";
            }
          }}
        >
          {island.title}
          
          <div className="nav-underline" style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "1px",
            background: "var(--premium-gold)",
            transform: targetId === island.id ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 300ms ease-in-out"
          }} />
        </button>
      ))}

      {/* Séparateur très fin */}
      <div className="nav-separator" style={{ width: "1px", height: "14px", background: "rgba(216,175,58,0.2)" }} />

      {/* Bouton Contact */}
      <button
        className="nav-btn-premium"
        onClick={() => setIsContactOpen(true)}
        style={{
          position: "relative",
          padding: "6px 0",
          background: "transparent",
          color: "var(--premium-gold)",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontWeight: "600",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transition: "all 0.4s ease",
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
