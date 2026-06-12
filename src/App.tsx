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
import "./App.css";

// Lazy loading des interfaces 2D lourdes
const FloatingChat = lazy(() => import("./ui/FloatingChat").then(module => ({ default: module.FloatingChat })));
const MobileOverlay = lazy(() => import("./ui/MobileOverlay").then(module => ({ default: module.MobileOverlay })));
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
  const [dpr, setDpr] = useState([0.5, 1.5]); // Résolution adaptative

  return (
    <>
      <div id="cover">
        <ErrorBoundary>
          <KeyboardControls map={KEYBOARD_MAP}>
            <Canvas
              dpr={dpr as [number, number]}
              style={{
                height: "95vh",
                width: "100vw",
              }}
              camera={{ fov: 55, near: 0.1, far: 1000, position: [0, 20, 35] }}
              gl={{ antialias: false, powerPreference: "high-performance" }}
              id="canvas"
            >
              <PerformanceMonitor onIncline={() => setDpr([1, 1.5])} onDecline={() => setDpr([0.5, 1])}>
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
        </Suspense>
        
        <Loader {...LOADER_CONFIG} />
      </div>
      <Suspense fallback={null}>
        <MobileOverlay />
        <FloatingChat />
      </Suspense>
      <Leva hidden={!isDebugMode} />
    </>
  );
};

export default App;
