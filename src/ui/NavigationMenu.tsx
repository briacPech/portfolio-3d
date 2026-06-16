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
      case "profil": return "Profil";
      case "skills": return "Compétences";
      case "projects": return "Projets";
      case "experience": return "Parcours";
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
    title: getIslandTitle(i.id),
    pos: getIslandPos(i.id)
  }));

  // Fallback de sécurité si Supabase ne répond pas ou que les variables d'environnement manquent
  if (islandsList.length === 0) {
    islandsList = [
      { id: "profil", title: "Profil", pos: { x: 15, z: -20 } },
      { id: "skills", title: "Compétences", pos: { x: -20, z: -25 } },
      { id: "projects", title: "Projets", pos: { x: 25, z: 15 } },
      { id: "experience", title: "Parcours", pos: { x: -15, z: 20 } },
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

  return (
    <>
      {/* Styles CSS injectés une seule fois pour les nav buttons */}
      <style>{`
        .nav-btn-item {
          position: relative;
          padding: 6px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 400;
          font-size: clamp(7px, 2.2vw, 11px);
          letter-spacing: clamp(0.01em, 0.5vw, 0.12em);
          text-transform: uppercase;
          transition: color 0.3s ease, opacity 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
          color: var(--premium-text);
        }
        .nav-btn-item.is-active {
          color: var(--premium-gold);
          font-weight: 500;
        }
        .nav-btn-item.is-dimmed {
          opacity: 0.5;
        }
        .nav-btn-item:not(.is-active):hover {
          color: var(--premium-gold-light);
        }
        .nav-btn-item .nav-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0%;
          height: 1px;
          background: var(--premium-gold);
          transition: width 300ms ease-in-out;
        }
        .nav-btn-item.is-active .nav-underline,
        .nav-btn-item:not(.is-active):hover .nav-underline {
          width: 100%;
        }
        .nav-btn-contact {
          position: relative;
          padding: clamp(4px, 1vw, 6px) 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: clamp(7px, 2.2vw, 11px);
          letter-spacing: clamp(0.01em, 0.5vw, 0.12em);
          text-transform: uppercase;
          transition: color 0.3s ease, text-shadow 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
          color: var(--premium-gold);
        }
        .nav-btn-contact:hover {
          color: #FFF;
          text-shadow: 0 0 10px rgba(216,175,58,0.8);
        }
      `}</style>

      <div className="nav-menu-container">
        {islandsList.map((island) => (
          <button
            key={island.id}
            className={[
              'nav-btn-item',
              targetId === island.id ? 'is-active' : '',
              targetId && targetId !== island.id ? 'is-dimmed' : '',
            ].join(' ')}
            onClick={() => gameState.setTargetWaypoint(island.id, island.pos.x, island.pos.z)}
          >
            {island.title}
            <div className="nav-underline" />
          </button>
        ))}

        {/* Séparateur très fin */}
        <div className="nav-separator" style={{ width: "1px", height: "14px", background: "rgba(216,175,58,0.2)", flexShrink: 0 }} />

        {/* Bouton Contact */}
        <button
          className="nav-btn-contact"
          onClick={() => setIsContactOpen(true)}
        >
          Contact
        </button>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
};
