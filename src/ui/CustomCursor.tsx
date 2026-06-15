import { useEffect, useState } from "react";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Ne pas afficher sur mobile
    if (window.matchMedia("(max-width: 768px)").matches) return;
    
    setIsVisible(true);

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // On vérifie si on survole un élément cliquable (bouton, lien, input)
      const isClickable = window.getComputedStyle(target).cursor === 'pointer' || 
                         target.tagName.toLowerCase() === 'button' ||
                         target.tagName.toLowerCase() === 'a' ||
                         target.closest('button') || 
                         target.closest('a');
                         
      setIsHovering(!!isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateHoverState);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // On cache le curseur système
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateHoverState);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Point central */}
      <div 
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#D8AF3A] pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0) scale(${isClicking ? 0.8 : 1})`,
          transition: "transform 0.1s ease-out",
        }}
      />
      {/* Anneau extérieur fluide */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#F0C674] pointer-events-none z-[9998] mix-blend-difference"
        style={{
          transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${isHovering ? 1.5 : (isClicking ? 0.8 : 1)})`,
          transition: "transform 0.2s ease-out, width 0.2s, height 0.2s",
          opacity: isHovering ? 0.8 : 0.4,
          backgroundColor: isHovering ? "rgba(216,175,58,0.1)" : "transparent"
        }}
      />
    </>
  );
};
