import { useEffect, useState } from "react";
import { gameState } from "../scene/gameState";
import { ContactModal } from "./ContactModal";

const islands = [
  { id: "profil", title: "Profil", pos: { x: 15, z: -20 } },
  { id: "skills", title: "Compétences", pos: { x: -20, z: -25 } },
  { id: "projects", title: "Projets", pos: { x: 25, z: 15 } },
  { id: "experience", title: "Expérience", pos: { x: -15, z: 20 } },
];

export const NavigationMenu = () => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

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
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: "30px",
      zIndex: 100,
      pointerEvents: "auto",
      background: "var(--glass-bg)",
      padding: "15px 40px",
      borderRadius: "4px", // Bords plus droits, moins ronds pour faire chic
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid var(--glass-border)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
    }}>
      {/* On supprime la boussole Emoji */}
      
      {islands.map((island) => (
        <button
          key={island.id}
          className="nav-btn-premium"
          onClick={() => gameState.setTargetWaypoint(island.id, island.pos.x, island.pos.z)}
          style={{
            position: "relative",
            padding: "8px 0",
            background: "transparent",
            color: targetId === island.id ? "var(--premium-gold)" : "var(--premium-text)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: targetId === island.id ? "500" : "300",
            fontSize: "13px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            transition: "all 0.4s ease",
            opacity: targetId && targetId !== island.id ? 0.5 : 1, // Atténue les autres quand on en sélectionne un
          }}
          onMouseEnter={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-gold-light)";
            }
          }}
          onMouseLeave={(e) => {
            if (targetId !== island.id) {
              e.currentTarget.style.color = "var(--premium-text)";
            }
          }}
        >
          {island.title}
          
          {/* Ligne dorée animée sous le texte actif */}
          {/* Ligne dorée animée sous le texte actif */}
          <div style={{
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "1px",
            background: "var(--premium-gold)",
            transform: targetId === island.id ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 0.4s ease"
          }} />
        </button>
      ))}

      {/* Séparateur */}
      <div style={{ width: "1px", height: "20px", background: "rgba(216,175,58,0.3)" }} />

      {/* Bouton Contact */}
      <button
        className="nav-btn-premium"
        onClick={() => setIsContactOpen(true)}
        style={{
          position: "relative",
          padding: "8px 0",
          background: "transparent",
          color: "var(--premium-gold)",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontWeight: "600",
          fontSize: "13px",
          letterSpacing: "0.15em",
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
