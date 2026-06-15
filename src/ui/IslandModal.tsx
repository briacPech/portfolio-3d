import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from "react";
import { Anchor, Compass, Cpu } from "lucide-react";
import { gameState } from "../scene/gameState";
import { usePortfolio } from "../contexts/PortfolioContext";

class ModalErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Modal Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "rgba(255,0,0,0.1)", padding: "20px", color: "#ff8888", borderRadius: "8px", border: "1px solid red", fontSize: "12px", fontFamily: "monospace" }}>
          <b>ERREUR FATALE DANS LA MODALE :</b><br/><br/>
          {this.state.error?.message}<br/><br/>
          Prenez une capture de cet écran et envoyez-la moi !
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // --- HELPER DE NETTOYAGE ---
  // Quill génère souvent des espaces insécables (&nbsp;) qui bloquent le retour à la ligne CSS natif
  const cleanHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/&nbsp;/g, ' ').replace(/<p><br><\/p>/g, '');
  };

  // --- RECONSTRUCTION DYNAMIQUE DU CONTENU ---
  let bodyContent: React.ReactNode = null;

  if (islandId === "profil") {
    bodyContent = <div className="rich-text-content" style={{ fontSize: "14px", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: cleanHtml(profile?.bio || profile?.short_description) }}></div>;
  } 
  
  else if (islandId === "skills") {
    bodyContent = (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", fontSize: "14px", paddingBottom: "10px" }}>
        
        {/* Catégorie 1 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <Anchor size={24} strokeWidth={1} color="#D8AF3A" />
            <h4 style={{ color: "#D8AF3A", margin: 0, fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Commercial & Closing
            </h4>
          </div>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#F5EFE1" }}>
            <li>Closing & Grands Comptes</li>
            <li>Relation Client Premium</li>
            <li>Achats & Supply Chain</li>
            <li>Stratégie & Analyse</li>
          </ul>
        </div>

        <div style={{ width: "100%", height: "1px", background: "rgba(185, 154, 90, 0.2)" }} />

        {/* Catégorie 2 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <Compass size={24} strokeWidth={1} color="#D8AF3A" />
            <h4 style={{ color: "#D8AF3A", margin: 0, fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Conception Digitale & IA
            </h4>
          </div>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#F5EFE1" }}>
            <li>Logique Produit & Conception</li>
            <li>Vibe Coding & Prototypage IA</li>
            <li>Analyse de Données & Automatisation</li>
          </ul>
        </div>

        <div style={{ width: "100%", height: "1px", background: "rgba(185, 154, 90, 0.2)" }} />

        {/* Catégorie 3 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <Cpu size={24} strokeWidth={1} color="#D8AF3A" />
            <h4 style={{ color: "#D8AF3A", margin: 0, fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Stack Technique
            </h4>
          </div>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "#F5EFE1" }}>
            <li>IA & Automatisation (Ollama, Gemini, Make, Zapier)</li>
            <li>Dev & Cloud (React, Supabase, Tailwind, Vercel)</li>
            <li>Data & Productivité (Google Sheets, APIs)</li>
            <li>Gestion & Systèmes (CRM, NAS)</li>
          </ul>
        </div>

      </div>
    );
  }
  
  else if (islandId === "experience") {
    const isEducation = (exp: any) => 
      exp.company?.includes("🎓") || 
      exp.company?.toLowerCase()?.includes("university") || 
      exp.job_title?.toLowerCase()?.includes("master") || 
      exp.job_title?.toLowerCase()?.includes("bac");
    
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
                  <div className="rich-text-content" style={{ color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: "1.6", marginTop: "8px" }} dangerouslySetInnerHTML={{ __html: cleanHtml(exp.description) }}></div>
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
                    <li key={edu.id}>• <strong style={{ color: "#ddd" }}>{edu.job_title}</strong> — {edu.company?.replace('🎓', '').trim()} {edu.start_date ? `(${edu.start_date}-${edu.end_date})` : ''}</li>
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
                <a href={project.link_url} target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", wordBreak: "break-all" }}>
                  🔗 {project.link_url?.replace('https://', '')}
                </a>
              )}
              {project.secondary_link_url && (
                <a href={project.secondary_link_url} target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", wordBreak: "break-all" }}>
                  📄 {project.secondary_link_text || 'Voir le lien secondaire'}
                </a>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="rich-text-content" style={{ color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: 1.6, textAlign: "justify", overflowWrap: "break-word", wordBreak: "normal" }} dangerouslySetInnerHTML={{ __html: cleanHtml(project.long_description) }}></div>

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
        width: "400px",
        maxHeight: "calc(100vh - 120px)", 
        display: "flex",
        flexDirection: "column",
        background: "rgba(10, 20, 36, 0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(185, 154, 90, 0.2)",
        borderRadius: "12px",
        pointerEvents: "auto",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        animation: "modalFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}>
        
        {/* Header de la modale fixe */}
        <div style={{ padding: "32px 32px 16px 32px", flexShrink: 0 }}>
          <h3 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--premium-text-muted)",
            marginBottom: "8px",
            fontWeight: 600,
          }}>{islandData.presentation || ''}</h3>
          
          <h1 className="premium-title" style={{
            fontSize: "28px",
            margin: "0",
            lineHeight: 1.15,
            color: "#ffffff"
          }}>{islandData.title || ''}</h1>
        </div>
        
        <div className="modal-scroll-area" style={{
          padding: "0 32px",
          overflowY: "auto",
          flex: 1, 
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          lineHeight: 1.65,
          fontWeight: 300,
          color: "rgba(255,255,255,0.85)", 
        }}>
          <ModalErrorBoundary>
            {bodyContent}
          </ModalErrorBoundary>
        </div>

        <div style={{ padding: "16px 32px 32px 32px", flexShrink: 0, marginTop: "8px" }}>
          <button 
            onClick={() => gameState.setIsland(null)}
            style={{
              background: "linear-gradient(135deg, #D8AF3A, #B8912A)",
              border: "none",
              color: "#050B14",
              padding: "10px 20px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              transition: "all 250ms ease-in-out",
              borderRadius: "6px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(216,175,58,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Reprendre la navigation
            <span style={{ fontSize: "14px" }}>→</span>
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
