import * as THREE from 'three';
import { skyTexture } from '../utils/TextureFactory';

export class Sky {
  constructor(scene: THREE.Scene) {
    // Gradient sky sphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(250, 32, 16),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide })
    ));

    // Sun — high in the sky (summer noon)
    const sunPos = new THREE.Vector3(40, 80, -120);
    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xfffde7 })
    );
    sunDisc.position.copy(sunPos);
    sunDisc.lookAt(0, 0, 0);
    scene.add(sunDisc);

    // Soft corona
    const corona = new THREE.Mesh(
      new THREE.CircleGeometry(8, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
    );
    corona.position.copy(sunPos);
    corona.lookAt(0, 0, 0);
    scene.add(corona);
  }
}
