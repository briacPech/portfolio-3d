import { Sky, Environment } from "@react-three/drei";
import { Boat } from "./Boat";
import { Ocean } from "./Ocean";
import { Islands } from "./islands/Islands";

export const World = () => {
  return (
    <>
      <fog attach="fog" args={["#0c2242", 50, 300]} />
      {/* Ciel Atmosphérique (Crépuscule Doré) */}
      <Sky distance={450000} sunPosition={[50, 2, 50]} inclination={0.6} azimuth={0.25} turbidity={2.0} rayleigh={2.5} mieCoefficient={0.01} mieDirectionalG={0.8} />
      
      {/* Éclairage Premium Yachting : Plus doux, ombres débouchées */}
      <ambientLight intensity={1.2} color="#3a608f" />
      
      {/* Lumière d'ambiance globale douce venant du ciel et de la mer */}
      <hemisphereLight intensity={0.8} color="#F0C674" groundColor="#0c2242" />

      <directionalLight 
        position={[50, 20, 50]} 
        intensity={2.0} 
        color="#F0C674" 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      {/* Fill light douce et enveloppante */}
      <directionalLight position={[-50, 20, -50]} intensity={0.8} color="#284A73" />

      {/* Ocean Low Poly Animé */}
      <Ocean />

      {/* Bateau */}
      <Boat />

      {/* Îles */}
      <Islands />

    </>
  );
};
