import * as THREE from 'three';
import { steppeGroundTexture, grassTuftTexture } from '../utils/TextureFactory';

export class Steppe {
  constructor(scene: THREE.Scene) {
    this.addGround(scene);
    this.addGrass(scene);
  }

  private addGround(scene: THREE.Scene) {
    // Large flat steppe ground — completely flat to prevent grass levitation
    const geo = new THREE.PlaneGeometry(900, 900, 4, 4);
    geo.computeVertexNormals();

    const groundTex = steppeGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.95,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(geo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private addGrass(scene: THREE.Scene) {
    const numTufts = 1500;
    const grassTex = grassTuftTexture();

    // 1. Rich meadow-green (standard steppe color)
    const grassMat1 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x6aaa38,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });

    // 2. Lighter yellow-green (sunlit steppe grass)
    const grassMat2 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x8dc44a,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });

    // 3. Deep forest green (dense/sheltered grass)
    const grassMat3 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x4d7a26,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });

    const grassGeo = new THREE.PlaneGeometry(0.5, 0.7);
    grassGeo.translate(0, 0.35, 0); // Pivot at bottom

    // Create 3 separate instanced meshes to render three different color variations
    // Capacity of 600 per type ensures no overflow with random distribution of 1500 total
    const instMeshes1 = [
      new THREE.InstancedMesh(grassGeo, grassMat1, 600),
      new THREE.InstancedMesh(grassGeo, grassMat2, 600),
      new THREE.InstancedMesh(grassGeo, grassMat3, 600)
    ];
    const instMeshes2 = [
      new THREE.InstancedMesh(grassGeo, grassMat1, 600),
      new THREE.InstancedMesh(grassGeo, grassMat2, 600),
      new THREE.InstancedMesh(grassGeo, grassMat3, 600)
    ];
    
    instMeshes1.forEach(m => { m.castShadow = true; m.receiveShadow = true; });
    instMeshes2.forEach(m => { m.castShadow = true; m.receiveShadow = true; });

    const dummy = new THREE.Object3D();
    const counts = [0, 0, 0];

    for (let i = 0; i < numTufts; i++) {
      // Pick random material variation (0: olive, 1: straw, 2: green)
      const matIdx = Math.floor(Math.random() * 3);
      const instIdx = counts[matIdx];
      counts[matIdx]++;

      const ang = Math.random() * Math.PI * 2;
      const d   = 9.0 + Math.random() * 92; // keep well clear of yurt wall (YURT_R=5.2m + margin), scatter up to ~100m
      const x = Math.cos(ang) * d;
      const z = Math.sin(ang) * d;
      const y = 0.01; // tiny offset above ground to prevent z-fighting

      const rot = Math.random() * Math.PI;
      const scale = 0.65 + Math.random() * 0.6; // organic sizing variation (65% to 125%)

      // Plane 1
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instMeshes1[matIdx].setMatrixAt(instIdx, dummy.matrix);

      // Plane 2 (rotated by 90 degrees)
      dummy.rotation.set(0, rot + Math.PI / 2, 0);
      dummy.updateMatrix();
      instMeshes2[matIdx].setMatrixAt(instIdx, dummy.matrix);
    }

    // CRITICAL: set draw count to actual filled count so unfilled
    // default-matrix slots (which sit at origin = inside the yurt) are never rendered
    instMeshes1.forEach((m, i) => { m.count = counts[i]; m.instanceMatrix.needsUpdate = true; });
    instMeshes2.forEach((m, i) => { m.count = counts[i]; m.instanceMatrix.needsUpdate = true; });

    instMeshes1.forEach(m => scene.add(m));
    instMeshes2.forEach(m => scene.add(m));
  }
}
