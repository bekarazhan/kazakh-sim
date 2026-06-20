import * as THREE from 'three';
import { steppeGroundTexture, grassTuftTexture, hillsBackdropTexture } from '../utils/TextureFactory';

function getSteppeHeight(x: number, z: number): number {
  const d = Math.hypot(x, z);
  if (d <= 8) return 0; // Flat space around the yurt
  return (
    Math.sin(x * 0.04) * 0.4 +
    Math.cos(z * 0.05) * 0.35 +
    Math.sin(x * 0.12 + z * 0.09) * 0.15
  );
}

export class Steppe {
  constructor(scene: THREE.Scene) {
    this.addGround(scene);
    this.addDistantHills(scene);
    this.addGrass(scene);
  }

  private addGround(scene: THREE.Scene) {
    // Large flat steppe — very gentle undulation
    const geo = new THREE.PlaneGeometry(600, 600, 80, 80);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      if (Math.sqrt(x * x + z * z) > 8) {
        pos.setZ(i, getSteppeHeight(x, z));
      }
    }
    geo.computeVertexNormals();

    const groundTex = steppeGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(geo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private addDistantHills(scene: THREE.Scene) {
    // Replace sphere hills with a large panoramic backdrop cylinder representing distant rolling hills
    const radius = 230;
    const height = 48;

    const geo = new THREE.CylinderGeometry(radius, radius, height, 48, 1, true);
    const tex = hillsBackdropTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: true // allow backdrop to dissolve naturally into sky fog at distance
    });

    const cylinder = new THREE.Mesh(geo, mat);
    cylinder.position.set(0, height / 2 - 5, 0); // align bottom of cylinder with ground
    scene.add(cylinder);
  }

  private addGrass(scene: THREE.Scene) {
    const numTufts = 1500;
    const grassTex = grassTuftTexture();
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });

    const grassGeo = new THREE.PlaneGeometry(0.5, 0.7);
    grassGeo.translate(0, 0.35, 0); // Pivot at bottom

    const instMesh1 = new THREE.InstancedMesh(grassGeo, grassMat, numTufts);
    const instMesh2 = new THREE.InstancedMesh(grassGeo, grassMat, numTufts);
    
    instMesh1.castShadow = true;
    instMesh1.receiveShadow = true;
    instMesh2.castShadow = true;
    instMesh2.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < numTufts; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d   = 6.2 + Math.random() * 95;
      const x = Math.cos(ang) * d;
      const z = Math.sin(ang) * d;
      const y = getSteppeHeight(x, z);

      const rot = Math.random() * Math.PI;
      const scale = 0.75 + Math.random() * 0.5;

      // Plane 1
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instMesh1.setMatrixAt(i, dummy.matrix);

      // Plane 2 (rotated by 90 degrees relative to Plane 1)
      dummy.rotation.set(0, rot + Math.PI / 2, 0);
      dummy.updateMatrix();
      instMesh2.setMatrixAt(i, dummy.matrix);
    }

    scene.add(instMesh1);
    scene.add(instMesh2);
  }
}
