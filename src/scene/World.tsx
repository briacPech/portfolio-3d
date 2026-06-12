import { Sky, Environment } from "@react-three/drei";
import { Boat } from "./Boat";
import { Ocean } from "./Ocean";
import { Islands } from "./islands/Islands";

export const World = () => {
  return (
    <>
      {/* Ciel Atmosphérique (Crépuscule Doré) */}
      <Sky distance={450000} sunPosition={[50, 2, 50]} inclination={0.6} azimuth={0.25} turbidity={2.0} rayleigh={2.5} mieCoefficient={0.01} mieDirectionalG={0.8} />
      
      {/* Éclairage Premium Yachting : Plus doux, ombres débouchées */}
      <ambientLight intensity={1.5} color="#152B44" /> {/* Ombres beaucoup moins profondes */}
      
      {/* Lumière d'ambiance globale douce venant du ciel et de la mer */}
      <hemisphereLight intensity={1.0} color="#F0C674" groundColor="#071326" />

      <directionalLight 
        position={[50, 10, 50]} /* Soleil rasant */
        intensity={2.5} /* Contraste réduit (au lieu de 4.0) */
        color="#F0C674" /* Accent or doux */
        castShadow 
        shadow-mapSize={[512, 512]} 
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* Fill light plus forte et enveloppante pour lier la scène */}
      <directionalLight position={[-50, 50, -50]} intensity={3.5} color="#284A73" />

      {/* Ocean Low Poly Animé */}
      <Ocean />

      {/* Bateau */}
      <Boat />

      {/* Îles */}
      <Islands />

    </>
  );
};
