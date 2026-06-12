import React from 'react'
import { useGLTF, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'

import { useMemo } from 'react'

export function IslandModel({ islandId, ...props }: any) {
  const { nodes } = useGLTF('/models/island.glb') as any

  // Chargement des textures stylisées générées par IA
  const textures = useTexture({
    sand: '/textures/sand.png',
    grass: '/textures/grass.png',
    gravel: '/textures/gravel.png',
    dirt: '/textures/dirt.png',
    rock: '/textures/rock.png',
    trunk: '/textures/trunk.png',
    leaves: '/textures/leaves.png'
  });

  // Application du Tiling pour éviter l'étirement "PS1"
  useMemo(() => {
    Object.values(textures).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8); // Répétition douce
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  // Création de matériaux uniques pour chaque île afin de varier les ambiances
  const { matSand, matLeaves, matTrunk, matRock, matCloud, matCoconut } = useMemo(() => {
    let currentTexture = textures.sand;
    // Couleurs Premium Yachting (Éclaircies pour lisibilité)
    let leavesColor = "#8B9F6A"; // Végétation plus claire
    let rockColor = "#8A7E6C"; // Pierre plus claire
    let baseTint = "#DED4BC"; // Sable plus lumineux
    
    if (islandId === 'skills') {
      currentTexture = textures.grass;
      leavesColor = "#9DB377"; 
      rockColor = "#8A7E6C"; 
      baseTint = "#EBE2CE";
    } else if (islandId === 'projects') {
      currentTexture = textures.gravel;
      leavesColor = "#8B9F6A"; 
      rockColor = "#9B8D7A"; 
      baseTint = "#DED4BC";
    } else if (islandId === 'experience') {
      currentTexture = textures.dirt;
      leavesColor = "#7A8E5C"; 
      rockColor = "#8A7E6C"; 
      baseTint = "#CECAAF";
    }

    // Restauration du style Low Poly pur
    return {
      // Application de la texture sur le sable avec une couleur blanche pour ne pas la teinter
      matSand: new THREE.MeshStandardMaterial({ color: baseTint, map: currentTexture, flatShading: true, roughness: 1.0, metalness: 0.05 }), 
      
      // On applique la texture d'herbe/feuilles, tout en gardant une légère teinte colorColor pour différencier les îles
      matLeaves: new THREE.MeshStandardMaterial({ color: leavesColor, map: textures.leaves, flatShading: true, roughness: 0.9, metalness: 0.1 }),
      
      // Le tronc est unifié avec la roche
      matTrunk: new THREE.MeshStandardMaterial({ color: "#8A7E6C", map: textures.trunk, flatShading: true, roughness: 0.9 }),
      
      // La roche pure, teintée
      matRock: new THREE.MeshStandardMaterial({ color: rockColor, map: textures.rock, flatShading: true, roughness: 0.8, metalness: 0.2 }),
      
      // Nuages non-impactés par la lumière pour rester cotonneux (Gris bleuté très clair)
      matCloud: new THREE.MeshBasicMaterial({ color: "#B8C1CB" }),
      
      // Noix de coco sombre
      matCoconut: new THREE.MeshStandardMaterial({ color: "#050B14", flatShading: true, roughness: 0.9 })
    };
  }, [textures, islandId]);

  // Tri dynamique des "feuilles" pour identifier celles qui lévitent (les noix de coco)
  const { groundedBushes, floatingCoconuts } = useMemo(() => {
    const bushes: any[] = [];
    const coconuts: any[] = [];
    
    // Étape 1 : Calculer la hauteur moyenne de tous les buissons
    let sumY = 0;
    let count = 0;
    const allIco: {node: any, y: number}[] = [];
    
    Object.keys(nodes).forEach(key => {
      const node = nodes[key];
      if (node.isMesh && key.includes('Icosphere') && !key.includes('Cloud')) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        node.geometry.boundingBox.getCenter(center);
        sumY += center.y;
        count++;
        allIco.push({ node, y: center.y });
      }
    });
    
    const avgY = count > 0 ? sumY / count : 0;
    
    // Étape 2 : Séparer ceux qui sont anormalement hauts (les lévitants)
    allIco.forEach(item => {
      // Si la forme géométrique est bien au-dessus de la moyenne des buissons, c'est une noix de coco flottante !
      if (item.y > avgY + 1.5) {
        coconuts.push(item.node);
      } else {
        bushes.push(item.node);
      }
    });
    
    return { groundedBushes: bushes, floatingCoconuts: coconuts };
  }, [nodes]);

  // Variations selon l'île pour qu'elles aient toutes un look unique
  const hideSomeTrees = islandId === 'projects' || islandId === 'skills';
  
  // On remet tous les palmiers d'origine (l'Agent 3D a compris son erreur !)
  const hideSomePalms = false; 
  const hideSomeRocks = islandId === 'experience';

  return (
    <group {...props} dispose={null}>
      {/* Sable et Base de l'île */}
      <mesh geometry={nodes.Cube029_Cube035.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube026_Cube032.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube023_Cube029.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube022_Cube028.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube020_Cube026.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube016_Cube022.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube015_Cube021.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube013_Cube018.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube010_Cube013.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube007_Cube010.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube005_Cube008.geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes.Cube.geometry} material={matSand} castShadow receiveShadow />

      {/* VÉRITABLE BASE DE L'ÎLE (Planes) - Ils manquaient ! */}
      <mesh geometry={nodes['Plane001_Plane003-Mesh'].geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes['Plane001_Plane003-Mesh_1'].geometry} material={matSand} castShadow receiveShadow />
      <mesh geometry={nodes['Plane001_Plane003-Mesh_2'].geometry} material={matSand} castShadow receiveShadow />

      {/* Rochers */}
      <mesh geometry={nodes.Cube028_Cube034.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube027_Cube033.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube025_Cube031.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube024_Cube030.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube021_Cube027.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube019_Cube025.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube018_Cube024.geometry} material={matRock} castShadow receiveShadow />
      {!hideSomeRocks && (
        <>
          <mesh geometry={nodes.Cube017_Cube023.geometry} material={matRock} castShadow receiveShadow />
          <mesh geometry={nodes.Cube014_Cube020.geometry} material={matRock} castShadow receiveShadow />
          <mesh geometry={nodes.Cube012_Cube017.geometry} material={matRock} castShadow receiveShadow />
          <mesh geometry={nodes.Cube011_Cube014.geometry} material={matRock} castShadow receiveShadow />
          <mesh geometry={nodes.Cube009_Cube012.geometry} material={matRock} castShadow receiveShadow />
          <mesh geometry={nodes.Cube008_Cube011.geometry} material={matRock} castShadow receiveShadow />
        </>
      )}
      <mesh geometry={nodes.Cube006_Cube009.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube004_Cube007.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube003_Cube006.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube002_Cube005.geometry} material={matRock} castShadow receiveShadow />
      <mesh geometry={nodes.Cube001_Cube004.geometry} material={matRock} castShadow receiveShadow />

      {/* Buissons (Leaves) restés au sol */}
      {groundedBushes.map((node, i) => (
        <mesh key={`bush-${i}`} geometry={node.geometry} material={matLeaves} castShadow receiveShadow />
      ))}

      {/* Les Icosphere flottantes (erreurs du modélisateur) sont supprimées ! */}

      {/* Nuages */}
      <mesh geometry={nodes.Cloud002_Icosphere001.geometry} material={matCloud} />
      <mesh geometry={nodes.Cloud000_Icosphere000.geometry} material={matCloud} />
      <mesh geometry={nodes.Cloud001_Icosphere048.geometry} material={matCloud} />

      {/* Arbres et Palmiers (Troncs et Feuilles) */}
      <mesh geometry={nodes['Tree007_Cube019-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Tree007_Cube019-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      
      <mesh geometry={nodes['Tree006_Cube016-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Tree006_Cube016-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      
      <mesh geometry={nodes['Tree005_Cube015-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Tree005_Cube015-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      
      <mesh geometry={nodes['Tree004_Cube003-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Tree004_Cube003-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      
      {!hideSomeTrees && (
        <>
          <mesh geometry={nodes['Tree003_Cube002-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Tree003_Cube002-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
          
          <mesh geometry={nodes['Tree002_Cube001-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Tree002_Cube001-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
          
          <mesh geometry={nodes['Tree000_Cube000-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Tree000_Cube000-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
          
          <mesh geometry={nodes['Tree001_Cube050-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
          <mesh geometry={nodes['Tree001_Cube050-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
        </>
      )}

      {/* Palmiers avec leurs vraies noix de coco attachées (Mesh_2 et Mesh_3) ! */}
      <mesh geometry={nodes['Palmtree007_Cylinder011-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree007_Cylinder011-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree007_Cylinder011-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree007_Cylinder011-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
      
      <mesh geometry={nodes['Palmtree006_Cylinder010-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree006_Cylinder010-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree006_Cylinder010-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree006_Cylinder010-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
      
      <mesh geometry={nodes['Palmtree005_Cylinder009-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree005_Cylinder009-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree005_Cylinder009-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree005_Cylinder009-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
      
      <mesh geometry={nodes['Palmtree004_Cylinder008-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree004_Cylinder008-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree004_Cylinder008-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
      <mesh geometry={nodes['Palmtree004_Cylinder008-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
      


      {!hideSomePalms && (
        <>
          <mesh geometry={nodes['Palmtree003_Cylinder003-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree003_Cylinder003-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree003_Cylinder003-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree003_Cylinder003-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
          
          <mesh geometry={nodes['Palmtree002_Cylinder002-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree002_Cylinder002-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree002_Cylinder002-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree002_Cylinder002-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
          
          <mesh geometry={nodes['Palmtree000_Cylinder001-Mesh'].geometry} material={matTrunk} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree000_Cylinder001-Mesh_1'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree000_Cylinder001-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree000_Cylinder001-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
          
          <mesh geometry={nodes['Palmtree001_Cylinder-Mesh'].geometry} material={matLeaves} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree001_Cylinder-Mesh_1'].geometry} material={matTrunk} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree001_Cylinder-Mesh_2'].geometry} material={matCoconut} castShadow receiveShadow />
          <mesh geometry={nodes['Palmtree001_Cylinder-Mesh_3'].geometry} material={matCoconut} castShadow receiveShadow />
        </>
      )}
    </group>
  )
}

useGLTF.preload('/models/island.glb')
