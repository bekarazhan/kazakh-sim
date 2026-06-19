import * as THREE from 'three';
import { lmat } from '../../utils/GeomUtils';

export class Instruments {
  constructor(scene: THREE.Scene) {
    this.addDombyra(scene);
  }

  private addDombyra(scene: THREE.Scene) {
    const dx = 3.6, dz = -2.4;

    // Body (pear shape)
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      lmat(0x8B5e2C)
    );
    body.scale.set(0.75, 1.0, 0.3);
    body.position.set(dx, 0.8, dz);
    body.rotation.z = -0.25;
    body.castShadow = true;
    scene.add(body);

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.04, 0.75, 6),
      lmat(0x7a4a1a)
    );
    neck.rotation.z = -0.22;
    neck.position.set(dx - 0.04, 1.32, dz);
    scene.add(neck);

    // Pegbox
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.16, 0.04),
      lmat(0x6a3a0a)
    );
    head.rotation.z = -0.22;
    head.position.set(dx - 0.09, 1.72, dz);
    scene.add(head);

    // Strings
    [-0.008, 0.008].forEach(ox => {
      const pts = [
        new THREE.Vector3(dx + ox, 0.55, dz + 0.01),
        new THREE.Vector3(dx + ox - 0.15, 1.8, dz + 0.01),
      ];
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xd4b050 })
      ));
    });
  }
}
