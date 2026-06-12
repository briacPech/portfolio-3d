import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gameState } from "./gameState";

// --- SILLAGE DU BATEAU (Traînée d'écume Low Poly) ---
const MAX_PARTICLES = 80;
const _dummy = new THREE.Object3D();

const BoatWake = ({ boatRef, currentSpeed }: { boatRef: React.RefObject<THREE.Group | null>, currentSpeed: React.MutableRefObject<number> }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // État des particules sans déclencher de re-rendu React (Performance maximale)
  const particles = useRef(Array.from({ length: MAX_PARTICLES }, () => ({
    active: false,
    pos: new THREE.Vector3(),
    scale: 0,
    life: 0
  })));
  
  const nextParticleIdx = useRef(0);
  const timeSinceLastSpawn = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !boatRef.current) return;

    const speed = Math.abs(currentSpeed.current);
    
    // Génération de la mousse quand on avance
    if (speed > 1.0) {
      timeSinceLastSpawn.current += delta;
      // Cadence de génération basée sur la vitesse
      const spawnInterval = 0.03 + (12 - speed) * 0.005; 
      
      if (timeSinceLastSpawn.current > spawnInterval) {
        timeSinceLastSpawn.current = 0;
        
        // Génère 2 particules d'un coup (gauche et droite de la poupe)
        for (let i = 0; i < 2; i++) {
          const p = particles.current[nextParticleIdx.current];
          p.active = true;
          p.life = 1.0; // Durée de vie
          p.scale = Math.random() * 0.3 + 0.3 + (speed / 12) * 0.4;
          
          // Position à l'arrière du bateau
          const offset = new THREE.Vector3(i === 0 ? -0.5 : 0.5, 0, 1.2);
          offset.applyEuler(boatRef.current.rotation);
          
          p.pos.copy(boatRef.current.position).add(offset);
          
          // Dispersion aléatoire
          p.pos.x += (Math.random() - 0.5) * 0.5;
          p.pos.z += (Math.random() - 0.5) * 0.5;
          p.pos.y = 0.02; // Juste au-dessus de l'eau
          
          nextParticleIdx.current = (nextParticleIdx.current + 1) % MAX_PARTICLES;
        }
      }
    }

    // Animation de la mousse
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles.current[i];
      if (!p.active) {
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0,0,0);
        _dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, _dummy.matrix);
        continue;
      }

      p.life -= delta * 0.6; // Disparaît en ~1.5 secondes
      
      if (p.life <= 0) {
        p.active = false;
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0,0,0);
      } else {
        // La mousse s'étend doucement
        p.scale += delta * 0.8;
        _dummy.position.copy(p.pos);
        
        // Rétrécit à la fin de sa vie pour disparaître proprement
        const currentScale = p.scale * Math.min(1.0, p.life * 4.0);
        _dummy.scale.set(currentScale, 1.0, currentScale); // Le Y importe peu car l'objet est plat
        
        // Rotation aléatoire
        _dummy.rotation.y = p.life * Math.PI;
      }
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, MAX_PARTICLES]}>
      {/* Cylindre très écrasé à 6 faces (hexagone Low Poly) */}
      <cylinderGeometry args={[1, 1, 0.05, 6]} />
      <meshStandardMaterial color="#e2f1f8" flatShading roughness={1} transparent opacity={0.25} depthWrite={false} />
    </instancedMesh>
  );
};

// --- GESTION DU DÉPLACEMENT (Agent de Navigation) ---
const ISLANDS_DATA = [
  { id: "profil", pos: [15, -20], radius: 10 },
  { id: "skills", pos: [-20, -25], radius: 12 },
  { id: "projects", pos: [25, 15], radius: 10 },
  { id: "experience", pos: [-15, 20], radius: 12 }
];

// Le bateau hybride : Utilise le GLTF "low_poly_old_boat" comme coque, et ajoute les voiles/mât demandés
const SailboatGLTF = ({ tilt }: { tilt: number }) => {
  const { scene } = useGLTF("/models/low_poly_old_boat/scene.gltf");
  
  // Teinter la coque du GLTF en crème (#F5EFE1)
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          // Shader personnalisé pour passer la texture originale en Noir & Blanc (très clair)
          child.material.onBeforeCompile = (shader: any) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              `
              #include <dithering_fragment>
              // Conversion en niveaux de gris (luminance)
              float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
              // Booster énormément le blanc et adoucir les noirs
              float brightGray = gray * 1.8 + 0.3; 
              float finalColor = smoothstep(0.0, 1.2, brightGray);
              gl_FragColor = vec4(vec3(finalColor), gl_FragColor.a);
              `
            );
          };
          child.material.roughness = 0.6;
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group rotation={[0, 0, tilt]} scale={1.2} position={[0, 1.0, 0]}>
      {/* 1. La coque pure : ajustée pour ne pas prendre l'eau */}
      <group position={[0, 0.0, 0]} scale={0.8}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
};

// Variables globales réutilisables pour éviter le Garbage Collection (car il n'y a qu'un seul bateau)
const _currentVec = new THREE.Vector3();
const _targetVec = new THREE.Vector3();
const _directionToTarget = new THREE.Vector3();
const _repulsion = new THREE.Vector3();
const _islandVec = new THREE.Vector3();
const _pushDir = new THREE.Vector3();
const _euler = new THREE.Euler();
const _camEuler = new THREE.Euler();
const _camQuat = new THREE.Quaternion();
const _boatPos = new THREE.Vector3();
const _cameraOffset = new THREE.Vector3();
const _lookTargetOffset = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export const Boat = () => {
  const groupRef = useRef<THREE.Group>(null);
  const boatRotation = useRef(0);
  const cameraRotation = useRef(0);
  const currentSpeed = useRef(0);
  const tiltAngle = useRef(0);
  const bobbing = useRef(0);
  const smoothedPointer = useRef(new THREE.Vector2());
  const maxSpeed = 18;

  useFrame((state, rawDelta) => {
    if (!groupRef.current) return;

    // Capping strict du delta pour éviter les sauts massifs si le navigateur freeze
    const delta = Math.min(rawDelta, 0.05);

    // Agent Tangage : Bobbing basique
    bobbing.current = Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
    groupRef.current.position.y = bobbing.current;

    // Récupération de la cible
    let targetWaypoint = gameState.targetWaypoint;

    if (targetWaypoint) {
      const currentPos = groupRef.current.position;
      _currentVec.set(currentPos.x, 0, currentPos.z);
      _targetVec.set(targetWaypoint.position.x, 0, targetWaypoint.position.z);
      
      const distance = _currentVec.distanceTo(_targetVec);
      const targetIslandData = ISLANDS_DATA.find(i => i.id === targetWaypoint.id);
      const stopDistance = targetIslandData ? targetIslandData.radius + 2 : 0.5; // On s'approche un poil plus
      
      if (distance > stopDistance) {
        // 1. Direction vers la cible
        _directionToTarget.copy(_targetVec).sub(_currentVec).normalize();
        const targetRotation = Math.atan2(-_directionToTarget.x, -_directionToTarget.z);
        
        // 2. Virage fluide (le bateau met du temps à tourner)
        let angleDiff = targetRotation - boatRotation.current;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        boatRotation.current += angleDiff * 2.0 * delta; 
        
        // 3. Calcul de la vitesse avec inertie et anticipation de l'arrêt
        const distanceToStop = distance - stopDistance;
        const alignmentFactor = Math.max(0.2, 1.0 - Math.abs(angleDiff) / Math.PI);
        const maxAllowedSpeed = Math.min(22, distanceToStop * 1.5); 
        
        const targetSpeed = maxAllowedSpeed * alignmentFactor;
        
        // Accélération/Décélération progressive
        currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 1.5 * delta);
        
      } else {
        // 4. Coast to a halt
        currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, 5.0 * delta); 
        
        // Déclenchement net de l'île
        if (currentSpeed.current < 1.0 && targetWaypoint.id !== "ocean") {
          currentSpeed.current = 0; // Force l'arrêt absolu immédiat
          gameState.setIsland(targetWaypoint.id);
        }
      }
    } else {
      // Dérive lente jusqu'à l'arrêt si pas de cible (cas annulation)
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, 3.0 * delta);
    }

    // 5. Appliquer le déplacement physique avec la vitesse inertielle
    if (Math.abs(currentSpeed.current) > 0.01) {
      const moveX = Math.sin(boatRotation.current) * currentSpeed.current * delta;
      const moveZ = Math.cos(boatRotation.current) * currentSpeed.current * delta;
      
      groupRef.current.position.x -= moveX;
      groupRef.current.position.z -= moveZ;
    }

    // Agent Tangage : Inclinaison dynamique dans les virages (Roulis)
    let angleDiff = 0;
    if (targetWaypoint) {
      _directionToTarget.copy(_targetVec).sub(_currentVec).normalize();
      const targetRotation = Math.atan2(-_directionToTarget.x, -_directionToTarget.z);
      angleDiff = targetRotation - boatRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    }
    // Roulis selon le virage + bobbing des vagues
    const targetTilt = angleDiff * 0.2; 
    tiltAngle.current = THREE.MathUtils.lerp(tiltAngle.current, targetTilt, 2.0 * delta);
    bobbing.current = Math.sin(state.clock.elapsedTime * 2.5) * 0.12;
    
    const currentPos = groupRef.current.position;
    gameState.setBoatPosition(currentPos.x, currentPos.z);
    
    // Application de la rotation ET du roulis au bateau visuel
    _euler.set(bobbing.current, boatRotation.current, tiltAngle.current);
    groupRef.current.setRotationFromEuler(_euler);

    // Lissage de la rotation de la caméra
    let camAngleDiff = boatRotation.current - cameraRotation.current;
    while (camAngleDiff > Math.PI) camAngleDiff -= Math.PI * 2;
    while (camAngleDiff < -Math.PI) camAngleDiff += Math.PI * 2;
    cameraRotation.current += camAngleDiff * 0.3;

    _camEuler.set(0, cameraRotation.current, 0);
    _camQuat.setFromEuler(_camEuler);

    _boatPos.copy(currentPos);
    const speedFactor = Math.abs(currentSpeed.current) / maxSpeed;
    
    // --- GESTION DE LA CAMÉRA (UX Premium) ---
    const currentIslandData = gameState.currentIsland ? ISLANDS_DATA.find(i => i.id === gameState.currentIsland) : null;
    
    // Lerp indépendant du framerate pour la souris (très doux)
    smoothedPointer.current.lerp(state.pointer, 1.0 - Math.exp(-3.0 * delta));

    if (currentIslandData) {
      // 🎥 Caméra Cinématique : Le bateau est amarré, on filme l'île depuis le bateau
      const islandPos = new THREE.Vector3(currentIslandData.pos[0], 0, currentIslandData.pos[1]);
      
      const orbitX = Math.sin(state.clock.elapsedTime * 0.1) * 3;
      const orbitZ = Math.cos(state.clock.elapsedTime * 0.1) * 3;
      
      // On se place derrière et au-dessus du bateau
      _cameraOffset.set(orbitX, 8 + smoothedPointer.current.y * -1.5, 18 + orbitZ);
      
      // On applique la rotation du bateau pour être toujours dans son dos
      _cameraOffset.applyQuaternion(_camQuat);
      
      _targetCamPos.copy(_boatPos).add(_cameraOffset);
      
      state.camera.position.lerp(_targetCamPos, 1.0 - Math.exp(-2.5 * delta));
      
      // On lève la tête pour filmer le monument de l'île (ex: la fusée)
      const lookHeight = currentIslandData.id === "projects" ? 12 : 3;
      _lookTarget.copy(islandPos).add(new THREE.Vector3(0, lookHeight, 0)); 
    } else {
      // 🎥 Caméra Navigation : Suit le bateau
      
      // Effet d'orbite cinématique : la caméra se déplace à l'opposé de la souris
      _cameraOffset.set(
        smoothedPointer.current.x * -6, // Décalage horizontal (orbite)
        4 + speedFactor * 1.5 + smoothedPointer.current.y * -3, // Décalage vertical
        10 + speedFactor * 3.0 // Recul dynamique selon la vitesse
      ).applyQuaternion(_camQuat);
      
      _targetCamPos.copy(_boatPos).add(_cameraOffset);
      
      // Lerp constant et souple pour la navigation (Accéléré de 3.0 à 8.0)
      state.camera.position.lerp(_targetCamPos, 1.0 - Math.exp(-8.0 * delta));
      
      // La caméra pointe devant le bateau
      _lookTargetOffset.set(
        smoothedPointer.current.x * 2, 
        2, 
        -10
      ).applyQuaternion(_camQuat);
      _lookTarget.copy(_boatPos).add(_lookTargetOffset);
    }
    
    // Lerp du LookAt constant et fluide
    if (!state.camera.userData.currentLookTarget) {
      state.camera.userData.currentLookTarget = _lookTarget.clone();
    }
    state.camera.userData.currentLookTarget.lerp(_lookTarget, 1.0 - Math.exp(-3.0 * delta));
    state.camera.lookAt(state.camera.userData.currentLookTarget);
  });

  return (
    <>
      {/* Le sillage en mousse (InstancedMesh très performant) */}
      <BoatWake boatRef={groupRef} currentSpeed={currentSpeed} />

      {/* Application du tangage et roulis global */}
      <group ref={groupRef}>
        <SailboatGLTF tilt={tiltAngle.current} />
      </group>
    </>
  );
};

useGLTF.preload("/models/low_poly_old_boat/scene.gltf");
