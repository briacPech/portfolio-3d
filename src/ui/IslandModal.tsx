import { useEffect, useState } from "react";
import { gameState } from "../scene/gameState";
import { usePortfolio } from "../contexts/PortfolioContext";

export const IslandModal = () => {
  const [islandId, setIslandId] = useState<string | null>(null);
  const { profile, islands, skills, experiences, projects, loading } = usePortfolio();

  useEffect(() => {
    const unsubscribe = gameState.subscribe(() => {
      setIslandId(gameState.currentIsland);
    });
    return unsubscribe;
  }, []);

  if (!islandId) return null;
  
  const islandData = islands[islandId];
  if (!islandData) return null; // Attend que les données soient chargées

  // --- RECONSTRUCTION DYNAMIQUE DU CONTENU ---
  let bodyContent: React.ReactNode = null;

  if (islandId === "profil") {
    bodyContent = <div style={{ whiteSpace: "pre-line", fontSize: "14px", lineHeight: "1.6" }}>{profile?.bio || profile?.short_description || ""}</div>;
  } 
  
  else if (islandId === "skills") {
    const categories = Array.from(new Set(skills.map(s => s.category)));
    bodyContent = (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "15px" }}>
        {categories.map((cat: string) => {
          const catSkills = skills.filter(s => s.category === cat);
          return (
            <div key={cat}>
              <h4 style={{ color: "var(--premium-gold)", marginBottom: "12px", fontSize: "15px", fontWeight: 500, letterSpacing: "0.05em" }}>🔹 {cat}</h4>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {catSkills.map(skill => (
                  <li key={skill.id}>
                    <strong style={{ color: "#fff", fontWeight: 500 }}>{skill.name} :</strong> {skill.description || "Compétence validée."}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  } 
  
  else if (islandId === "experience") {
    const isEducation = (exp: any) => exp.company?.includes("🎓") || exp.company?.toLowerCase().includes("university") || exp.job_title?.toLowerCase().includes("master") || exp.job_title?.toLowerCase().includes("bac");
    const proExps = experiences.filter(e => !isEducation(e));
    const eduExps = experiences.filter(e => isEducation(e));

    bodyContent = (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14px" }}>
        
        {/* Parcours Professionnel */}
        {proExps.length > 0 && (
          <div>
            <h4 style={{ color: "var(--premium-gold)", marginBottom: "16px", fontSize: "16px", fontWeight: 500, letterSpacing: "0.05em", borderBottom: "1px solid rgba(216, 175, 58, 0.3)", paddingBottom: "8px" }}>💼 Parcours Professionnel</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {proExps.map(exp => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <strong style={{ color: "#fff", fontSize: "15px" }}>{exp.company}</strong>
                    <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>
                      ({exp.start_date} - {exp.end_date})
                    </span>
                  </div>
                  <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>{exp.job_title}</div>
                  <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                    {exp.description?.split('\n').map((line: string, i: number) => line.trim() ? <li key={i}>{line.trim().replace(/^[-•]/, '')}</li> : null)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Éducation & Certifications */}
        {eduExps.length > 0 && (
          <div>
            <h4 style={{ color: "var(--premium-gold)", marginBottom: "16px", fontSize: "16px", fontWeight: 500, letterSpacing: "0.05em", borderBottom: "1px solid rgba(216, 175, 58, 0.3)", paddingBottom: "8px", marginTop: "10px" }}>🎓 Éducation & Certifications</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", color: "var(--premium-text-muted)", fontSize: "13px" }}>
                  {eduExps.map(edu => (
                    <li key={edu.id}>• <strong style={{ color: "#ddd" }}>{edu.job_title}</strong> — {edu.company.replace('🎓', '').trim()} {edu.start_date ? `(${edu.start_date}-${edu.end_date})` : ''}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  else if (islandId === "projects") {
    bodyContent = (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14px" }}>
        {projects.map(project => (
          <div key={project.id} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "20px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              {project.image_url && <img src={project.image_url} alt={project.title} style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "rgba(0,0,0,0.2)", padding: "4px" }} />}
              <div>
                <h4 style={{ color: "var(--premium-gold)", fontSize: "16px", fontWeight: 500, margin: 0 }}>🎵 {project.title}</h4>
                <div style={{ color: "#fff", fontSize: "13px", marginTop: "4px" }}>{project.short_description}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {project.link_url && (
                <a href={project.link_url} target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  🔗 {project.link_url.replace('https://', '')}
                </a>
              )}
              {project.secondary_link_url && (
                <a href={project.secondary_link_url} target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  📄 {project.secondary_link_text || 'Voir le lien secondaire'}
                </a>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ whiteSpace: "pre-line", color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                {project.long_description}
              </div>

              {project.tags && project.tags.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <strong style={{ color: "#fff", fontSize: "13px" }}>Stack Technique :</strong>
                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {project.tags.map((tech: string) => (
                      <span key={tech} style={{ background: "rgba(216, 175, 58, 0.15)", color: "var(--premium-gold)", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.05em" }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="island-modal-wrapper" style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end", // Sur la droite pour laisser voir le bateau à gauche
      padding: "20px 40px 80px 40px", // Marges réduites
      pointerEvents: "none", 
      zIndex: 50,
    }}>
      <div className="island-modal-content" style={{
        width: "400px", // Beaucoup plus fin (400px au lieu de 460/500)
        maxHeight: "calc(100vh - 120px)", 
        display: "flex",
        flexDirection: "column",
        background: "rgba(14, 27, 46, 0.75)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: "2px solid var(--premium-gold)", // Liseré très fin
        borderRadius: "8px", // Coins moins massifs
        pointerEvents: "auto",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        animation: "modalFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}>
        
        {/* Header de la modale fixe */}
        <div style={{ padding: "24px 24px 12px 24px", flexShrink: 0 }}>
          <h3 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "9px", // Très petit et chic
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--premium-gold)",
            marginBottom: "6px",
            fontWeight: 600,
          }}>{islandData.presentation || ''}</h3>
          
          <h1 className="premium-title" style={{
            fontSize: "24px", // Titre beaucoup plus petit
            margin: "0",
            lineHeight: 1.1,
            color: "#ffffff"
          }}>{islandData.title || ''}</h1>
        </div>
        
        {/* Corps de la modale (Scrollable) */}
        <div className="modal-scroll-area" style={{
          padding: "0 24px",
          overflowY: "auto",
          flex: 1, 
          fontFamily: "var(--font-sans)",
          fontSize: "12.5px", // Police de lecture fine et compacte
          lineHeight: 1.5,
          fontWeight: 300,
          color: "rgba(255,255,255,0.85)", 
        }}>
          {bodyContent}
        </div>

        {/* Footer (Sticky bottom) */}
        <div style={{ padding: "16px 24px 24px 24px", flexShrink: 0, marginTop: "8px" }}>
          <button 
            onClick={() => gameState.setIsland(null)}
            style={{
              background: "rgba(216,175,58,0.1)",
              border: "1px solid rgba(216,175,58,0.4)",
              color: "var(--premium-gold)",
              padding: "8px 16px", // Bouton plus fin
              fontSize: "10px", // Texte du bouton très discret
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "4px",
              width: "100%", 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--premium-gold)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(216,175,58,0.1)";
              e.currentTarget.style.color = "var(--premium-gold)";
            }}
          >
            Reprendre la navigation
          </button>
        </div>
      </div>

      <style>{`
        /* Scrollbar élégante pour la modale */
        .modal-scroll-area::-webkit-scrollbar {
          width: 4px;
        }
        .modal-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(216, 175, 58, 0.3);
          border-radius: 4px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(216, 175, 58, 0.6);
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
