import { useEffect, useState } from "react";
import { gameState } from "../scene/gameState";

const CONTENT_MAP: Record<string, { title: string, subtitle: string, body: React.ReactNode }> = {
  profil: {
    title: "Briac Pécheur",
    subtitle: "Commercial B2B & Solutions Digitales",
    body: "Commercial B2B expérimenté avec plus de 15 ans d'expérience et la gestion de portefeuilles, je mets aujourd'hui mon sens du commerce et ma compréhension des besoins métier au service de solutions digitales concrètes. Entre agroalimentaire, développement commercial, no-code, IA et vibe coding, je sais vendre, comprendre et créer pour aider les entreprises à gagner du temps et mieux s'organiser.",
  },
  skills: {
    title: "Mes Compétences",
    subtitle: "L'arsenal de ma navigation",
    body: (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "15px" }}>
        
        <div>
          <h4 style={{ color: "var(--premium-gold)", marginBottom: "12px", fontSize: "15px", fontWeight: 500, letterSpacing: "0.05em" }}>🔹 Commercial, Closing & Opérations</h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Closing & Grands Comptes :</strong> Gestion de cycles de vente complets, prospection B2B, négociation de contrats et référencements auprès de centrales d'achat (GMS / Grossistes / RHD).</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Relation Client Premium :</strong> Suivi personnalisé de portefeuilles d'envergure et gestion de litiges commerciaux complexes.</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Achats & Supply Chain :</strong> Sourcing et achats internationaux (Islande, Norvège, USA), coordination logistique de flux tendus et suivi qualité (QHSE).</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Stratégie & Analyse :</strong> Analyse de marché, suivi des indicateurs de performance commerciale (KPIs) et optimisation des leviers de marge.</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "var(--premium-gold)", marginBottom: "12px", fontSize: "15px", fontWeight: 500, letterSpacing: "0.05em" }}>🔹 Conception Digitale, Vibe Coding & Data</h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Logique Produit & Conception :</strong> Capacité à traduire un besoin métier ou un processus de vente complexe en une application digitale structurée, modulaire et fonctionnelle.</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Vibe Coding & Prototypage IA :</strong> Création et déploiement d'applications modernes en s'appuyant sur les LLM pour générer, auditer et faire évoluer du code de production de manière agile.</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Analyse de Données & Automatisation :</strong> Centralisation et nettoyage de données brutes, automatisation de workflows (emails, SMS, notifications) et création de tableaux de bord décisionnels.</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "var(--premium-gold)", marginBottom: "12px", fontSize: "15px", fontWeight: 500, letterSpacing: "0.05em" }}>🛠️ Stack Technique & Logiciels</h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>IA & Automatisation (Cloud & Local) :</strong> Ollama (modèles open-source exécutés en local), ChatGPT / Prompt Engineering, Gemini Flash, Groq, Make (Integromat), Zapier.</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Développement & Cloud (Vibe Coding) :</strong> React 18, TypeScript, Supabase (PostgreSQL, Edge Functions, Auth, RLS), Tailwind CSS, FastAPI, GitHub, Vercel.</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Outils Data & Productivité :</strong> Google Sheets (fonctions avancées & automatisation), Excel, Google Workspace API (Gmail, Drive, Calendar, Sheets).</li>
            <li><strong style={{ color: "#fff", fontWeight: 500 }}>Gestion & Systèmes :</strong> CRM, outils de reporting, serveurs locaux / scripts NAS (sauvegardes et infrastructures autonomes hors internet).</li>
          </ul>
        </div>

      </div>
    )
  },
  experience: {
    title: "Mon Sillage",
    subtitle: "Parcours et expériences",
    body: (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14px", maxHeight: "55vh", overflowY: "auto", paddingRight: "10px" }}>
        
        {/* Parcours Professionnel */}
        <div>
          <h4 style={{ color: "var(--premium-gold)", marginBottom: "16px", fontSize: "16px", fontWeight: 500, letterSpacing: "0.05em", borderBottom: "1px solid rgba(216, 175, 58, 0.3)", paddingBottom: "8px" }}>💼 Parcours Professionnel</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Maestro No Code */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Maestro No Code</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(Formation d'excellence)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Product Builder No-Code x IA</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Création de bases de données et automatisation de workflows complexes.</li>
                <li>Construction de CRM personnalisés et prototypage de produits digitaux.</li>
                <li>Maîtrise d'outils de pointe : Airtable, Make et Softr.</li>
              </ul>
            </div>

            {/* Elafood */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Elafood – Nantes</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(11/2023 - 07/2025)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Commercial / Gestion opérationnelle GMS & Grossistes</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Gestion d'un portefeuille de clients GMS & grossistes représentant un CA de 20 M€ au sein d'une équipe de 4 personnes.</li>
                <li>Achats internationaux (Islande, Norvège, USA) : suivi des approvisionnements, coordination logistique et qualité.</li>
                <li>Facturation, suivi des commandes clients/fournisseurs et résolution des litiges.</li>
              </ul>
            </div>

            {/* Les Viviers de Noirmoutier */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Les Viviers de Noirmoutier – St-Gilles-Croix-de-Vie</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(01/2021 - 08/2023)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Commercial - Produits de la Mer Frais d'Exception</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Vente et closing auprès de comptes clés en GMS, commerce de gros et export pour des produits premium.</li>
                <li>Suivi des comptes clés et service client haut de gamme.</li>
              </ul>
            </div>

            {/* Pomona Terre Azur */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Pomona Terre Azur – Nantes</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(11/2017 - 01/2021)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Commercial GMS - Produits de la Mer</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Gestion et développement d'un portefeuille d'hypermarchés et supermarchés (CA : 2,8 M€).</li>
                <li>Analyse de marché et recommandations adaptées aux besoins clients.</li>
              </ul>
            </div>

            {/* Pomona Passion Froid */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Pomona Passion Froid – Aix-en-Provence</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(10/2014 - 07/2017)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Commercial RHD - Produits Agroalimentaires Haut de Gamme</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Développement du portefeuille RHD haut de gamme sur les secteurs compétitifs de Saint-Tropez et de la Riviera.</li>
                <li>Vente de produits premium, suivi client personnalisé et négociation de contrats.</li>
              </ul>
            </div>

            {/* Les Pêcheries Océane */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Les Pêcheries Océane – Nantes</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(01/2009 - 10/2014)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Commercial GMS - Produits de la Mer</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Gestion d'un portefeuille de clients RHD (CA : 1,8 M€) et analyse du marché.</li>
              </ul>
            </div>

            {/* Socavi */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <strong style={{ color: "#fff", fontSize: "15px" }}>Socavi (Groupe Unicopa) – Languidic</strong>
                <span style={{ color: "var(--premium-gold)", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "10px" }}>(09/2006 - 10/2008)</span>
              </div>
              <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px", fontStyle: "italic" }}>Chef de Secteur GMS - Apprentissage</div>
              <ul style={{ listStyleType: "circle", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px", color: "var(--premium-text-muted)" }}>
                <li>Développement de la stratégie commerciale, merchandising sur le terrain et accompagnement clients.</li>
                <li>Supervision des accords nationaux et optimisation du référencement produits.</li>
              </ul>
            </div>
            
          </div>
        </div>

        {/* Éducation & Certifications */}
        <div>
          <h4 style={{ color: "var(--premium-gold)", marginBottom: "16px", fontSize: "16px", fontWeight: 500, letterSpacing: "0.05em", borderBottom: "1px solid rgba(216, 175, 58, 0.3)", paddingBottom: "8px", marginTop: "10px" }}>🎓 Éducation & Certifications</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div>
              <strong style={{ color: "#fff", fontSize: "14px", display: "block", marginBottom: "8px" }}>Formations & Certifications Digitales :</strong>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", color: "var(--premium-text-muted)", fontSize: "13px" }}>
                <li>• <strong style={{ color: "#ddd" }}>Prompt Engineering pour ChatGPT</strong> — Vanderbilt University</li>
                <li>• <strong style={{ color: "#ddd" }}>Google Sheets : Analyse et automatisation</strong> — Google Cloud</li>
                <li>• <strong style={{ color: "#ddd" }}>High Perf. Collaboration: Leadership & Teamwork</strong> — Northwestern University</li>
                <li>• <strong style={{ color: "#ddd" }}>Intro à l’analyse d’entreprise avec tableurs</strong> — Coursera Project Network</li>
                <li>• <strong style={{ color: "#ddd" }}>Foundations: Data, Data, Everywhere</strong> — Google / Coursera</li>
              </ul>
            </div>

            <div>
              <strong style={{ color: "#fff", fontSize: "14px", display: "block", marginBottom: "8px" }}>Diplômes Initiaux :</strong>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", color: "var(--premium-text-muted)", fontSize: "13px" }}>
                <li>• <strong style={{ color: "#ddd" }}>Master 1 CC2A (Cadre Commercial Agroalimentaire)</strong> — SUP'T G Niort (2006-2008)</li>
                <li>• <strong style={{ color: "#ddd" }}>BTS Industries Agroalimentaires</strong> — Lycée Agricole Laval (2005-2006)</li>
                <li>• <strong style={{ color: "#ddd" }}>Baccalauréat STAE</strong> — Lycée Jules Rieffel (2002-2004)</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    )
  },
  projects: {
    title: "Mes Expéditions",
    subtitle: "Projets et réalisations",
    body: (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14px", maxHeight: "55vh", overflowY: "auto", paddingRight: "10px" }}>
        
        {/* Projet 1 */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "20px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <img src="/images/festival-connect-logo.png" alt="Festival Connect" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "rgba(0,0,0,0.2)", padding: "4px" }} />
            <div>
              <h4 style={{ color: "var(--premium-gold)", fontSize: "16px", fontWeight: 500, margin: 0 }}>🎵 Projet 1 : Festival Connect</h4>
              <div style={{ color: "#fff", fontSize: "13px", marginTop: "4px" }}>CRM Global & Hub d'Opérations Terrain</div>
            </div>
          </div>
          
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <a href="https://festivalconnect.vercel.app" target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              🔗 festivalconnect.vercel.app
            </a>
            <a href="https://app.notion.com/p/Festival-Connect-Presentation-188e32ad451547b383b9b9c05b8e599f?v=364eed8c523280a3a5d6000c4294edb1&source=copy_link" target="_blank" rel="noreferrer" style={{ color: "#3498db", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              📄 Présentation détaillée (Notion)
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <strong style={{ color: "#fff", fontSize: "13px" }}>Le Problème :</strong>
              <p style={{ margin: "4px 0 0 0", color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                Les organisations gèrent souvent leurs contacts, leurs ventes, leurs plannings et leurs communications dans une multitude d'outils séparés (tableurs, mails, SMS), ce qui fragmente l'information et ralentit les équipes.
              </p>
            </div>
            
            <div>
              <strong style={{ color: "#fff", fontSize: "13px" }}>La Solution :</strong>
              <p style={{ margin: "4px 0 0 0", color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                Une application web moderne et centralisée qui regroupe toutes les opérations au même endroit (contacts, suivi des partenaires/sponsors, billetterie, gestion logistique et terrain).
              </p>
            </div>

            <div>
              <strong style={{ color: "#fff", fontSize: "13px" }}>Mon Rôle :</strong>
              <p style={{ margin: "4px 0 0 0", color: "var(--premium-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                Conception fonctionnelle, logique du produit, organisation de la base de données PostgreSQL et structuration globale du projet pour répondre fidèlement aux usages concrets du terrain.
              </p>
            </div>

            <div>
              <strong style={{ color: "#fff", fontSize: "13px" }}>Stack Technique :</strong>
              <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["React 18", "TypeScript", "Supabase", "PostgreSQL", "Auth", "Edge Functions", "Vercel", "HelloAsso API", "Google Workspace", "Gemini Flash / Groq", "Expo Web"].map(tech => (
                  <span key={tech} style={{ background: "rgba(216, 175, 58, 0.15)", color: "var(--premium-gold)", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.05em" }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }
};

export const IslandModal = () => {
  const [islandId, setIslandId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = gameState.subscribe(() => {
      setIslandId(gameState.currentIsland);
    });
    return unsubscribe;
  }, []);

  if (!islandId || !CONTENT_MAP[islandId]) return null;

  const content = CONTENT_MAP[islandId];

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end", // Sur la droite pour laisser voir le bateau à gauche
      padding: "50px",
      pointerEvents: "none", // Laisse passer les clics autour
      zIndex: 50,
    }}>
      <div style={{
        width: "500px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--glass-border)",
        borderLeft: "4px solid var(--premium-gold)",
        borderRadius: "4px",
        padding: "50px 40px",
        color: "var(--premium-text)",
        pointerEvents: "auto",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5)",
        animation: "modalFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}>
        <h3 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--premium-gold)",
          marginBottom: "10px",
          fontWeight: 500,
        }}>{content.subtitle}</h3>
        
        <h1 className="premium-title" style={{
          fontSize: "36px",
          margin: "0 0 30px 0",
          lineHeight: 1.2,
          color: "#ffffff"
        }}>{content.title}</h1>
        
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: "16px",
          lineHeight: 1.8,
          fontWeight: 300,
          color: "var(--premium-text-muted)",
          marginBottom: "40px"
        }}>
          {content.body}
        </div>

        <button 
          onClick={() => gameState.setIsland(null)}
          style={{
            background: "transparent",
            border: "1px solid var(--premium-border)",
            color: "var(--premium-text)",
            padding: "12px 30px",
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: "2px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--premium-gold)";
            e.currentTarget.style.color = "var(--premium-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--premium-text)";
          }}
        >
          Reprendre la navigation
        </button>
      </div>

      <style>{`
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
