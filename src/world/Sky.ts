import * as THREE from 'three';
import { skyTexture } from '../utils/TextureFactory';

export class Sky {
  constructor(scene: THREE.Scene) {
    // Gradient sky sphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(250, 32, 16),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide })
    ));

    // Sun disc
    const sunPos = new THREE.Vector3(-65, 18, -110);
    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(5.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe080 })
    );
    sunDisc.position.copy(sunPos);
    sunDisc.lookAt(0, 10, 0);
    scene.add(sunDisc);

    // Glow halo
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(11, 32),
      new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.22 })
    );
    glow.position.copy(sunPos);
    glow.lookAt(0, 10, 0);
    scene.add(glow);
  }
}
