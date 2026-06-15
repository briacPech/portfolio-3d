import { Html, Text, Clone, useGLTF, Billboard, Sparkles, Center, Float } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useState, useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gameState } from "../gameState";
import { ProfilDecoration, SkillsDecoration, ExperienceDecoration } from "./IslandDecorations";
import { IslandModel } from "./IslandModel";

// Précharger le modèle
useGLTF.preload('/models/toy_rocket/scene.gltf');
useGLTF.preload('/models/island.glb');

/*
// [ARCHITECTURE GLTF - PRÊT À L'EMPLOI]
// Composant générique pour charger de vrais modèles d'îles depuis public/models/
export const IslandGLTF = ({ position, url, title, scale = 1 }: IslandProps & { url: string }) => {
  const { scene } = useGLTF(url);
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="hull">
        <primitive object={scene} scale={scale} castShadow receiveShadow />
      </RigidBody>
      <Text position={[0, 4 * scale, 0]} fontSize={1.5} color="white" outlineWidth={0.1} outlineColor="#000">
        {title}
      </Text>
    </group>
  );
};
*/

// --- Agent Faune : Les Mouettes (Oiseaux Low Poly animés) ---
const Seagull = ({ radius, speed, height, phase }: { radius: number, speed: number, height: number, phase: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Position actuelle sur le cercle
      const angle = t * speed + phase;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height + Math.sin(t * 2 + phase) * 1.5;
      
      groupRef.current.position.set(x, y, z);
      
      // Orientation de l'oiseau : il regarde vers sa prochaine position (tangente)
      const nextAngle = angle + 0.1 * speed;
      const nextX = Math.cos(nextAngle) * radius;
      const nextZ = Math.sin(nextAngle) * radius;
      groupRef.current.rotation.y = Math.atan2(nextX - x, nextZ - z);

      // Inclinaison dans le virage (roll)
      groupRef.current.rotation.z = Math.sin(t) * 0.1 + 0.2; 

      // Battement des ailes
      if (leftWing.current && rightWing.current) {
        // Fréquence de battement variable pour plus de naturel
        const flap = Math.sin(t * 12 + phase) * 0.5 + 0.1;
        leftWing.current.rotation.z = flap;
        rightWing.current.rotation.z = -flap;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Corps */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.7]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      {/* Bec */}
      <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.3, 4]} />
        <meshStandardMaterial color="#f39c12" flatShading />
      </mesh>
      {/* Bout des ailes (Noir) */}
      
      {/* Aile Gauche (Pivot) */}
      <group ref={leftWing} position={[0.1, 0.1, 0]}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.3]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Plume noire au bout */}
        <mesh position={[0.85, 0, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.25]} />
          <meshStandardMaterial color="#2d3436" flatShading />
        </mesh>
      </group>
      {/* Aile Droite (Pivot) */}
      <group ref={rightWing} position={[-0.1, 0.1, 0]}>
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.3]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Plume noire au bout */}
        <mesh position={[-0.85, 0, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.25]} />
          <meshStandardMaterial color="#2d3436" flatShading />
        </mesh>
      </group>
    </group>
  );
};

const Seagulls = () => {
  return (
    <group position={[0, 10, 0]}>
      {/* Une petite volée d'oiseaux autour de l'île */}
      <Seagull radius={12} speed={0.4} height={2} phase={0} />
      <Seagull radius={8} speed={0.5} height={5} phase={Math.PI * 0.8} />
      <Seagull radius={14} speed={0.35} height={-2} phase={Math.PI * 1.5} />
      <Seagull radius={10} speed={0.45} height={8} phase={Math.PI * 0.3} />
    </group>
  );
};

// --- Agent VFX : Le Socle Universel ---
export const MonumentBase = ({ color, children }: { color: string, children: React.ReactNode }) => {
  return (
    <group position={[0, 0.2, 0.8]}>
      {/* Socle en pierre Low-Poly */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.8, 0.4, 8]} />
        <meshStandardMaterial color="#7f8c8d" flatShading roughness={0.9} />
      </mesh>
      
      {/* Cœur lumineux du socle */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      
      {/* Lumière ambiante */}
      <pointLight color={color} intensity={2} distance={15} position={[0, 0.5, 0]} />
      
      {/* Étincelles magiques du socle */}
      <Sparkles count={30} scale={2} size={8} speed={1.5} opacity={1} color={color} position={[0, 0.5, 0]} />

      {/* L'objet spécifique de l'île (Fusée, Valise, etc.) posé sur le socle */}
      <group position={[0, 0.2, 0]}>
        {children}
      </group>
    </group>
  );
};

// --- Agents Matériaux & VFX : La Fusée ---
const RocketModel = () => {
  const { scene } = useGLTF('/models/toy_rocket/scene.gltf');
  const groupRef = useRef<THREE.Group>(null);
  const [isTakingOff, setIsTakingOff] = useState(false);

  // Écouter quand le bateau s'arrête sur l'île Projets
  useEffect(() => {
    const handleStateChange = () => {
      setIsTakingOff(gameState.currentIsland === "projects");
    };
    handleStateChange(); // check initial
    return gameState.subscribe(handleStateChange);
  }, []);

  // Agent Matériaux : Restauration des vraies couleurs avec un fini Premium
  const customizedRocket = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.lerp(new THREE.Color("#f1c40f"), 0.15);
        child.material.flatShading = true;
        child.material.roughness = 0.4; 
        child.material.metalness = 0.2; 
        child.material.needsUpdate = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Hauteur cible : 20 au décollage, 3.3 (posé) au sol
      const targetY = isTakingOff ? 20 : 3.3;
      
      // Interpolation majestueuse et indépendante du framerate
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 1.0 - Math.exp(-0.8 * delta));
      
      if (groupRef.current.position.y > 4.0) {
        // En vol : Rotation lente et flottement élégant
        groupRef.current.rotation.y += 1.5 * delta; 
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01; 
      } else {
        // Au sol : On remet la fusée droite (rotation = 0)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 1.0 - Math.exp(-2.0 * delta));
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 3.3, 0]} scale={[6, 6, 6]}>
       <primitive object={customizedRocket} />
       
       {/* Flammes / Étincelles du réacteur au décollage */}
       {isTakingOff && (
         <group position={[0, -0.4, 0]}>
           <Sparkles count={30} scale={0.4} size={8} speed={3} noise={2} color="#ff7f50" opacity={0.8} />
           <Sparkles count={20} scale={0.2} size={10} speed={2} noise={1} color="#f1c40f" opacity={1} />
         </group>
       )}
    </group>
  );
};

interface IslandProps {
  id: string;
  position: [number, number, number];
  title: string;
  color?: string;
  scale?: number;
  rotationY?: number;
}

const Island = ({ id, position, title, color = "#ffffff", scale = 1, rotationY = 0 }: IslandProps) => {
  const [isNear, setIsNear] = useState(false);
  const islandGroupRef = useRef<THREE.Group>(null);
  const timeOffset = useRef(Math.random() * 100); // Randomize bobbing start

  useFrame((state) => {
    const dist = Math.hypot(gameState.boatPosition.x - position[0], gameState.boatPosition.z - position[2]);
    const near = dist < 40 * scale; // Zone de détection très large car le bateau s'arrête plus loin
    if (near !== isNear) setIsNear(near);
  });

  return (
    <group position={position} ref={islandGroupRef}>
      {/* Composant Float très léger et lent pour que l'île paraisse flotter gracieusement sans donner la nausée / effet de saccade */}
      <Float
        speed={0.5} 
        rotationIntensity={0.05} 
        floatIntensity={0.1} 
        floatingRange={[-0.1, 0.1]} 
      >
        <RigidBody type="fixed" colliders="hull">
          <group
            onClick={(e) => {
              e.stopPropagation();
              gameState.setTargetWaypoint(id, position[0], position[2]);
            }}
            onPointerEnter={() => document.body.style.cursor = 'pointer'}
            onPointerLeave={() => document.body.style.cursor = 'auto'}
          >
            {/* L'île posée naturellement sur le sol de son groupe */}
            <IslandModel scale={[scale * 0.45, scale * 0.45, scale * 0.45]} position={[0, 0, 0]} rotation={[0, rotationY, 0]} islandId={id} />
            
            {/* Agent Vent : Poussières Magiques (Lucioles) */}
            {/* Particules Premium douces (lucoles dorées) */}
            <Sparkles count={25} scale={20 * scale} size={1.5} speed={0.1} opacity={0.3} color="#f1c40f" position={[0, 5, 0]} />
            
            {/* Oiseaux plus discrets */}
            <group scale={0.6}>
              <Seagulls />
            </group>

            {/* Agent Secret : Easter Egg lumineux sur Expérience */}
            {id === 'experience' && (
              <group position={[5, 1, -5]}>
                <mesh position={[0, 0, 0]}>
                  <octahedronGeometry args={[0.5]} />
                  <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
                </mesh>
                <pointLight color="#ff00ff" intensity={2} distance={10} />
              </group>
            )}
            {/* Monument thématique Low Poly personnalisé posé sur le socle universel */}
            <MonumentBase color={color}>
              {id === "profil" && <ProfilDecoration />}
              {id === "skills" && <SkillsDecoration />}
              {id === "experience" && <ExperienceDecoration />}
              {id === "projects" && <RocketModel />}
            </MonumentBase>

          </group>
        </RigidBody>
      </Float>

      {/* Interface Utilisateur Holographique (HTML) */}
      <IslandLabel isNear={isNear} id={id} title={title} scale={scale} />
    </group>
  );
};

// Composant isolé pour éviter de re-render l'île complète quand isNear change
const IslandLabel = ({ isNear, id, title, scale }: { isNear: boolean, id: string, title: string, scale: number }) => {
  if (!isNear) return null;
  return (
    <Html position={[0, 5.5 * scale, 0]} center zIndexRange={[100, 0]}>
      <div style={{
        animation: "islandBadgeFade 1.2s ease-out forwards, islandBadgeFloat 4s ease-in-out infinite 1.2s",
        opacity: 0 // Commence invisible pour le fade in
      }}>
        {/* Badge du Titre (Pilule Premium) */}
        <div 
          onClick={() => gameState.setIsland(id)}
          style={{
            background: "rgba(14, 27, 46, 0.55)",
            backdropFilter: "blur(20px)",
            padding: "10px 24px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            cursor: "pointer",
            color: "#ffffff",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontSize: "0.85rem",
            pointerEvents: "auto",
            transition: "all 250ms ease",
            boxShadow: "0 12px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            animation: "islandBadgeFade 1s ease forwards, islandBadgeFloat 4s ease-in-out infinite",
          }}
          onPointerOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)";
          }}
          onPointerOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)";
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0d49a, #b8854f)', display: 'inline-block', boxShadow: '0 0 10px rgba(216,175,58,0.5)' }}></span>
            <span>{title}</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

export const Islands = () => {
  return (
    <group>
      {/* Placement des îles pour que la base soit légèrement immergée dans l'océan (-1.0) */}
      <Island id="profil" title="Mon Profil" position={[15, -0.6, -20]} scale={3.0} rotationY={0} color="#f1c40f" />
      <Island id="skills" title="Mes Compétences" position={[-20, -0.6, -25]} scale={3.6} rotationY={Math.PI / 4} color="#2ecc71" />
      <Island id="projects" title="Mes Projets" position={[25, -0.6, 15]} scale={2.6} rotationY={-Math.PI / 6} color="#e74c3c" />
      <Island id="experience" title="Mon Expérience" position={[-15, -0.6, 20]} scale={3.4} rotationY={Math.PI} color="#9b59b6" />
    </group>
  );
};
