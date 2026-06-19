import * as THREE from 'three';
import { shyrdakTexture } from '../../utils/TextureFactory';

export class Shyrdak {
  constructor(scene: THREE.Scene) {
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(3.8, 8),
      new THREE.MeshLambertMaterial({ map: shyrdakTexture() })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.006;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}
