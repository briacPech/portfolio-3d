import { useEffect, useState } from "react";
import { Hand } from "lucide-react";
import { useProgress } from "@react-three/drei";

export const OnboardingTooltip = () => {
  const [visible, setVisible] = useState(false);
  const { progress } = useProgress();

  useEffect(() => {
    // On n'affiche le tooltip que si le chargement est terminé
    if (progress === 100) {
      // On retarde un peu l'affichage pour laisser la scène apparaître
      const timer = setTimeout(() => {
        // On vérifie si l'utilisateur n'a pas DÉJÀ interagi avant la fin du timer
        if (!localStorage.getItem("has_interacted_3d")) {
          setVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    const handleInteraction = () => {
      if (visible) {
        setVisible(false);
        localStorage.setItem("has_interacted_3d", "true");
      }
    };

    // On écoute les clics et le drag
    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("wheel", handleInteraction); // Si molette

    return () => {
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[150] pointer-events-none transition-opacity duration-1000 ease-in-out opacity-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[rgba(14,27,46,0.6)] backdrop-blur-md border border-[rgba(216,175,58,0.3)] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <Hand 
            className="w-5 h-5 text-[#F0C674]" 
            style={{
              animation: "dragHand 2.5s infinite ease-in-out"
            }} 
          />
        </div>
        <span 
          className="bg-[rgba(14,27,46,0.6)] backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-[#F5EFE1] border border-[rgba(255,255,255,0.05)] shadow-xl"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Faites glisser pour explorer
        </span>
      </div>
      
      {/* Animation CSS injectée directement ici pour la main */}
      <style>{`
        @keyframes dragHand {
          0% { transform: translateX(10px) rotate(15deg); }
          50% { transform: translateX(-10px) rotate(-15deg); }
          100% { transform: translateX(10px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
};
