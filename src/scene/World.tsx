import { Sky, Environment } from "@react-three/drei";
import { Boat } from "./Boat";
import { Ocean } from "./Ocean";
import { Islands } from "./islands/Islands";

export const World = () => {
  return (
    <>
      <fog attach="fog" args={["#8ecae6", 80, 350]} />
      {/* Ciel Atmosphérique (Jour Tropical) */}
      <Sky distance={450000} sunPosition={[50, 20, 50]} inclination={0.4} azimuth={0.25} turbidity={1.0} rayleigh={1.0} mieCoefficient={0.005} mieDirectionalG={0.8} />
      
      {/* Éclairage Premium Yachting : Plus clair, de jour */}
      <ambientLight intensity={1.3} color="#e0f7fa" />
      
      {/* Lumière d'ambiance globale douce venant du ciel et de la mer */}
      <hemisphereLight intensity={1.2} color="#ffffff" groundColor="#48cae4" />

      <directionalLight 
        position={[50, 20, 50]} 
        intensity={2.2} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      {/* Fill light douce et enveloppante */}
      <directionalLight position={[-50, 20, -50]} intensity={1.0} color="#90e0ef" />

      {/* Ocean Low Poly Animé */}
      <Ocean />

      {/* Bateau */}
      <Boat />

      {/* Îles */}
      <Islands />

    </>
  );
};
