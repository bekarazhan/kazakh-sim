import * as THREE from 'three';
import { lmat } from '../../utils/GeomUtils';

export class Weapons {
  constructor(scene: THREE.Scene) {
    this.addBowAndQuiver(scene);
  }

  private addBowAndQuiver(scene: THREE.Scene) {
    const bx = -3.8, bz = -2.2;

    // Bow arc (QuadraticBezierCurve3)
    const bowCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.55, 0),
      new THREE.Vector3(0.38, 0, 0),
      new THREE.Vector3(0, 0.55, 0)
    );
    const bowGeo = new THREE.BufferGeometry().setFromPoints(bowCurve.getPoints(24));
    const bow    = new THREE.Line(bowGeo, new THREE.LineBasicMaterial({ color: 0x7a4a1a }));
    bow.position.set(bx, 1.05, bz);
    bow.rotation.z = 0.12;
    scene.add(bow);

    // Bowstring
    const strGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.55, 0),
      new THREE.Vector3(0, 0.55, 0),
    ]);
    const str = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xccaa66 }));
    str.position.copy(bow.position);
    str.rotation.copy(bow.rotation);
    scene.add(str);

    // Quiver
    const quiver = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.65, 10),
      lmat(0x4a2010)
    );
    quiver.position.set(bx + 0.22, 0.35, bz - 0.08);
    quiver.rotation.z = 0.28;
    quiver.castShadow = true;
    scene.add(quiver);

    // Arrow shafts
    [-0.06, 0, 0.06].forEach(ox => {
      const arrow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.55, 4),
        lmat(0xd4b050)
      );
      arrow.position.set(bx + 0.22 + ox, 0.72, bz - 0.08);
      arrow.rotation.z = 0.15;
      scene.add(arrow);
    });
  }
}
