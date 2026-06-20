import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const YURT_R = 5.2;

export class Yurt {
  constructor(scene: THREE.Scene) {
    const loader = new GLTFLoader();
    loader.load(
      '/models/yurt.glb',
      (gltf) => {
        const model = gltf.scene;

        // Scale to fit YURT_R = 5.2 (original model has ~3.54m radius, 5.2 / 3.54 ≈ 1.47)
        model.scale.set(1.47, 1.47, 1.47);

        // Adjust position so the floor sits on the ground
        model.position.set(0, 0, 0);

        // Configure shadow maps and materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  if (mat.normalMap) {
                    mat.normalScale.set(0.6, 0.6);
                  }
                  mat.roughness = Math.max(mat.roughness, 0.55);
                  mat.metalness = Math.min(mat.metalness, 0.15);
                }
              });
            }
          }
        });

        scene.add(model);
        console.log('Yurt GLTF model loaded successfully!');
      },
      undefined,
      (err) => {
        console.error('Failed to load Yurt GLB:', err);
      }
    );
  }
}
