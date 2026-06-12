import { useEffect, useState } from "react";
import "./MobileOverlay.css";

export const MobileOverlay = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="mobile-overlay">
      <div className="mobile-header">
        <h1>Briac Pecheur</h1>
        <p>Naviguer entre le terrain et les systèmes automatisés.</p>
      </div>
      <div className="mobile-controls">
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))}>↑</button>
        <div className="mobile-controls-row">
          <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))}>←</button>
          <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }))}>↓</button>
          <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))}>→</button>
        </div>
      </div>
      <div className="mobile-info">
        <p>Utilisez les flèches pour naviguer le voilier.</p>
        <p>Pour une expérience complète, visitez sur un ordinateur de bureau.</p>
      </div>
    </div>
  );
};
