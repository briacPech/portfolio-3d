import React, { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export const PremiumLoader = () => {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  // Messages immersifs en fonction du progrès
  const getMessage = (p: number) => {
    if (p < 30) return "Préparation du navire...";
    if (p < 60) return "Hissage des voiles...";
    if (p < 90) return "Étude de la carte marine...";
    return "Arrivée à destination...";
  };

  useEffect(() => {
    if (!active && progress === 100) {
      // Attendre un tout petit peu avant de retirer le loader pour l'effet de transition
      const timer = setTimeout(() => {
        setVisible(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#071326] transition-all duration-1000 ease-in-out"
      style={{
        opacity: active || progress < 100 ? 1 : 0,
        pointerEvents: active || progress < 100 ? "all" : "none",
        clipPath: active || progress < 100 ? "circle(100% at 50% 50%)" : "circle(0% at 50% 50%)"
      }}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full px-6">
        {/* Logo / Titre */}
        <h1 
          className="text-4xl md:text-5xl mb-12 text-[#F0C674] tracking-wider text-center"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Briac Pécheur
        </h1>

        {/* Barre de progression */}
        <div className="w-full h-[2px] bg-[#0E1B2E] rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[linear-gradient(90deg,#D8AF3A,#F0C674)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pourcentage et texte */}
        <div className="flex justify-between w-full mt-4 text-[#C9C2B6] text-xs font-light tracking-[0.2em] uppercase">
          <span>{getMessage(progress)}</span>
          <span className="font-medium text-[#F0C674]">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
