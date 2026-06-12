import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Matériaux partagés (Premium Low Poly) pour correspondre au style du socle et de la fusée
const materialProfil = new THREE.MeshStandardMaterial({ color: "#e1b12c", flatShading: true, roughness: 0.2, metalness: 0.3 });
const materialSkills = new THREE.MeshStandardMaterial({ color: "#4cd137", flatShading: true, roughness: 0.2, metalness: 0.3 });
const materialProjects = new THREE.MeshStandardMaterial({ color: "#00a8ff", flatShading: true, roughness: 0.2, metalness: 0.3 });
const materialExperience = new THREE.MeshStandardMaterial({ color: "#9c88ff", flatShading: true, roughness: 0.2, metalness: 0.3 });

// Décoration Profil (Buste Low Poly Abstrait)
export const ProfilDecoration = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group position={[0, 1.2, 0]} ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      {/* Corps */}
      <mesh material={materialProfil} position={[0, -0.5, 0]}>
        <coneGeometry args={[1, 1.5, 6]} /> {/* Forme pyramidale/cristal */}
      </mesh>
      {/* Tête */}
      <mesh material={materialProfil} position={[0, 0.8, 0]}>
        <icosahedronGeometry args={[0.6, 0]} />
      </mesh>
    </group>
  );
};

// Décoration Compétences (Engrenage Low Poly en rotation)
export const SkillsDecoration = () => {
  const gearRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (gearRef.current) {
      gearRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[0, 1.5, 0]} ref={gearRef} scale={[1.5, 1.5, 1.5]}>
      <mesh material={materialSkills}>
        <cylinderGeometry args={[1, 1, 0.3, 8]} />
      </mesh>
      <mesh material={materialSkills} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.5, 0.3, 0.3]} />
      </mesh>
      <mesh material={materialSkills} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[2.5, 0.3, 0.3]} />
      </mesh>
      {/* Trou central */}
      <mesh position={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
        <meshBasicMaterial color="#2d3436" />
      </mesh>
      <mesh position={[0, 0, -0.16]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
        <meshBasicMaterial color="#2d3436" />
      </mesh>
    </group>

  );
};

// Décoration Expérience (Mallette professionnelle Low Poly)
export const ExperienceDecoration = () => {
  return (
    <group position={[0, 0.6, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Base */}
      <mesh material={materialExperience}>
        <boxGeometry args={[1.8, 1.2, 0.4]} />
      </mesh>
      {/* Poignée */}
      <mesh material={materialExperience} position={[0, 0.7, 0]}>
        <torusGeometry args={[0.3, 0.08, 4, 8, Math.PI]} />
      </mesh>
      {/* Serrures */}
      <mesh position={[0.4, 0.4, 0.2]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.4, 0.4, 0.2]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};
