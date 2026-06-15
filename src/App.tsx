import { Suspense, useState, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
  KeyboardControls,
  Loader,
  PerformanceMonitor,
  Stats,
} from "@react-three/drei";
import { useLocation } from "react-router-dom";
import { Leva } from "leva";
import { LOADER_CONFIG } from "./constants/loaderConfig";
import { KEYBOARD_MAP } from "./hooks/useMovementState";
import useDefaults from "./hooks/useDefaults";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { PremiumLoader } from "./ui/PremiumLoader";
import { CustomCursor } from "./ui/CustomCursor";
import { OnboardingTooltip } from "./ui/OnboardingTooltip";
import "./App.css";

// Lazy loading des interfaces 2D lourdes
const FloatingChat = lazy(() => import("./ui/FloatingChat").then(module => ({ default: module.FloatingChat })));
const NavigationMenu = lazy(() => import("./ui/NavigationMenu").then(module => ({ default: module.NavigationMenu })));
const IslandModal = lazy(() => import("./ui/IslandModal").then(module => ({ default: module.IslandModal })));
// Lazy loading de la scène 3D pour éviter de bloquer le thread principal au chargement
const World = lazy(() => import("./scene/World").then(module => ({ default: module.World })));

const App = () => {
  const {
    physics: { debug },
  } = useDefaults();
  const { hash } = useLocation();

  const isDebugMode = hash === "#debug";
  const [dpr, setDpr] = useState([0.8, 1.5]); // Équilibre parfait : fluide sur tel, mais pas de "bouillie de pixels" (min 0.8 au lieu de 0.5)

  return (
    <>
      <div id="cover">
        <ErrorBoundary>
          <KeyboardControls map={KEYBOARD_MAP}>
            <Canvas
              dpr={dpr as [number, number]}
              style={{
                height: "100vh",
                width: "100vw",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              camera={{ fov: 55, near: 0.1, far: 1000, position: [0, 20, 35] }}
              gl={{ antialias: true, powerPreference: "high-performance" }} // On garde l'anti-aliasing pour la beauté des bords
              id="canvas"
            >
              <PerformanceMonitor onIncline={() => setDpr([1, 1.5])} onDecline={() => setDpr([0.8, 1])}>
                {isDebugMode && <Stats />}
                <Suspense fallback={null}>
                  <Physics debug={isDebugMode && debug}>
                    <World />
                  </Physics>
                </Suspense>
              </PerformanceMonitor>
            </Canvas>
          </KeyboardControls>
        </ErrorBoundary>

        <Suspense fallback={null}>
          <NavigationMenu />
          <IslandModal />
          <OnboardingTooltip />
        </Suspense>
        
        <PremiumLoader />
        <CustomCursor />
      </div>
      <Suspense fallback={null}>
        <FloatingChat />
      </Suspense>
      <Leva hidden={!isDebugMode} />
    </>
  );
};

export default App;
