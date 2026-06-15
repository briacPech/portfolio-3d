import { useEffect, useState, useRef } from "react";
import { Compass } from "lucide-react";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const compassRef = useRef<SVGSVGElement>(null);
  const prevPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Ne pas afficher sur mobile
    if (window.matchMedia("(max-width: 768px)").matches) return;
    
    setIsVisible(true);

    const updatePosition = (e: MouseEvent) => {
      const dx = e.clientX - prevPos.current.x;
      const dy = e.clientY - prevPos.current.y;
      
      // Rotation de la boussole dans la direction du mouvement
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (compassRef.current) {
          compassRef.current.style.transform = `rotate(${angle}deg)`;
        }
      }
      
      setPosition({ x: e.clientX, y: e.clientY });
      prevPos.current = { x: e.clientX, y: e.clientY };
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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
    <div 
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center drop-shadow-[0_0_8px_rgba(216,175,58,0.5)]"
      style={{
        transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${isHovering ? 1.25 : (isClicking ? 0.9 : 1)})`,
        transition: "transform 0.1s ease-out",
        width: "32px",
        height: "32px"
      }}
    >
      <Compass 
        ref={compassRef}
        className="text-[#D8AF3A]" 
        style={{ 
          width: "28px", 
          height: "28px",
          transition: "transform 0.15s ease-out",
          filter: isHovering ? "drop-shadow(0 0 12px rgba(216,175,58,0.8))" : "none"
        }} 
        strokeWidth={1.5}
      />
    </div>
  );
};
