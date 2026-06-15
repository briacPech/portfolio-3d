import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { Boat } from "./Boat";
import { Ocean } from "./Ocean";
import { Islands } from "./islands/Islands";

const SkyGradient = () => {
  return (
    <mesh>
      <sphereGeometry args={[400, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          colorTop: { value: new THREE.Color("#8ab6d6") }, // Bleu ciel doux
          colorBottom: { value: new THREE.Color("#fbf8cc") } // Crème vers l'horizon
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 colorTop;
          uniform vec3 colorBottom;
          varying vec3 vWorldPosition;
          void main() {
            vec3 dir = normalize(vWorldPosition);
            float mixVal = smoothstep(-0.1, 0.5, dir.y);
            gl_FragColor = vec4(mix(colorBottom, colorTop, mixVal), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
};

export const World = () => {
  return (
    <>
      <fog attach="fog" args={["#bfd9e8", 50, 300]} />
      
      {/* Ciel Atmosphérique Premium */}
      <SkyGradient />
      
      {/* Éclairage Premium Yachting : Plus clair, de jour */}
      <ambientLight intensity={1.2} color="#ffffff" />
      
      {/* Lumière d'ambiance globale douce venant du ciel et de la mer */}
      <hemisphereLight intensity={1.2} color="#ffffff" groundColor="#48cae4" />

      <directionalLight 
        position={[50, 30, 50]} 
        intensity={2.2} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
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
