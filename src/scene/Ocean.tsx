import { useRef, useState, useEffect } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gameState } from "./gameState";

declare module "@react-three/fiber" {
  interface ThreeElements {
    waterMaterial: any;
  }
}

const WaterMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorBase: new THREE.Color("#071326"),
    uColorSecondary: new THREE.Color("#0F2D3D"),
    uColorReflect: new THREE.Color("#284A73"),
    uGoldColor: new THREE.Color("#D8AF3A"),
    uLightDirection: new THREE.Vector3(50.0, 10.0, 50.0).normalize(),
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calcul du déplacement des vagues très douces (smooth rolling waves)
    float wave1 = sin(pos.x * 0.1 + uTime * 0.3) * 0.1;
    float wave2 = cos(pos.y * 0.1 + uTime * 0.2) * 0.1;
    float wave3 = sin((pos.x + pos.y) * 0.05 + uTime * 0.1) * 0.05;
    pos.z += wave1 + wave2 + wave3;
    
    // Calcul analytique de la normale pour des reflets élégants
    float dx = cos(pos.x * 0.1 + uTime * 0.3) * 0.01 + cos((pos.x + pos.y) * 0.05 + uTime * 0.1) * 0.0025;
    float dy = -sin(pos.y * 0.1 + uTime * 0.2) * 0.01 + cos((pos.x + pos.y) * 0.05 + uTime * 0.1) * 0.0025;
    vec3 localNormal = normalize(vec3(-dx, -dy, 1.0));
    
    // Transmission au Fragment Shader
    vNormal = normalize(normalMatrix * localNormal);
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
  `,
  // Fragment Shader
  `
  uniform vec3 uColorBase;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorReflect;
  uniform vec3 uGoldColor;
  uniform float uTime;
  uniform vec3 uLightDirection;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  // Fonction de hash pour le bruit
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Bruit de Voronoi pour les caustiques de l'eau
  float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash(n + g);
        o = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * o); // Animation plus lente
        vec2 r = g - f + o;
        float d = dot(r, r);
        m = min(m, d);
      }
    }
    return sqrt(m);
  }

  void main() {
    // Projection des UVs en espace monde pour une surface infinie
    vec2 uvCaustics = vWorldPosition.xz * 0.15;
    
    // Caustiques générées de façon procédurale (très adoucies)
    float c1 = voronoi(uvCaustics * 0.8 + uTime * 0.1);
    float c2 = voronoi(uvCaustics * 1.2 - uTime * 0.08);
    
    // Dégradé profond basé sur la normale Y
    float depthMix = smoothstep(0.8, 1.0, vNormal.y);
    vec3 baseWaterColor = mix(uColorSecondary, uColorBase, depthMix);
    
    // Caustiques (Reflets très subtils)
    float caustics = pow(1.0 - c1, 4.0) * 0.3 + pow(1.0 - c2, 4.0) * 0.2;
    caustics *= 0.8;

    // Lumière spéculaire (Soleil d'or doux et élégant)
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfVector = normalize(uLightDirection + viewDir);
    float NdotH = max(0.0, dot(vNormal, halfVector));
    float specular = pow(NdotH, 128.0) * 1.0; // Plus doux et concentré

    // Effet Fresnel subtil avec la couleur secondaire
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.0);
    vec3 fresnelColor = mix(baseWaterColor, uColorReflect, fresnel * 0.5);

    // Mélange final
    vec3 waterColor = mix(baseWaterColor, uColorReflect, caustics * 0.2);
    vec3 finalColor = mix(waterColor, fresnelColor, 0.4) + (uGoldColor * specular);

    gl_FragColor = vec4(finalColor, 1.0); // Opaque pour corriger le bug d'affichage
    
    // IMPORTANT: Support des couleurs encodées correctement pour sRGB
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
  `
);

// Ajout du composant à R3F
extend({ WaterMaterial });

declare module "@react-three/fiber" {
  interface IntrinsicElements {
    waterMaterial: any;
  }
}

const ClickFeedback = ({ mark }: { mark: { x: number, z: number, time: number } | null }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (meshRef.current && materialRef.current && mark) {
      const age = (Date.now() - mark.time) / 1000;
      if (age < 1.0) {
        meshRef.current.scale.setScalar(1 + age * 3);
        materialRef.current.opacity = 1.0 - age;
      } else {
        materialRef.current.opacity = 0;
      }
    }
  });

  if (!mark) return null;

  return (
    <mesh ref={meshRef} position={[mark.x, -0.5, mark.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.0, 32]} />
      <meshBasicMaterial ref={materialRef} color="#F0C674" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

export const Ocean = () => {
  const materialRef = useRef<any>(null);
  const [clickMark, setClickMark] = useState<{ x: number, z: number, time: number } | null>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <ClickFeedback mark={clickMark} />
      <mesh 
        position={[0, 0.4, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          gameState.setTargetWaypoint("ocean", e.point.x, e.point.z);
          setClickMark({ x: e.point.x, z: e.point.z, time: Date.now() });
        }}
        onPointerEnter={() => document.body.style.cursor = 'crosshair'}
        onPointerLeave={() => document.body.style.cursor = 'auto'}
      >
        {/* Grille détaillée pour une géométrie douce et ondulée */}
        <planeGeometry args={[600, 600, 64, 64]} />
        <waterMaterial 
          ref={materialRef} 
          transparent={false} 
          uColorBase={new THREE.Color("#0077b6")} 
          uColorSecondary={new THREE.Color("#00b4d8")} 
          uColorReflect={new THREE.Color("#90e0ef")} 
          uGoldColor={new THREE.Color("#ffffff")} 
          uLightDirection={new THREE.Vector3(50, 20, 50).normalize()}
        />
      </mesh>
    </group>
  );
};
