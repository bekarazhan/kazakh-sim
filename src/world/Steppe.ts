import * as THREE from 'three';
import { lmat } from '../utils/GeomUtils';

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
        pos.setZ(i,
          Math.sin(x * 0.04) * 0.4 +
          Math.cos(z * 0.05) * 0.35 +
          Math.sin(x * 0.12 + z * 0.09) * 0.15
        );
      }
    }
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, lmat(0x6b8f3e));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private addDistantHills(scene: THREE.Scene) {
    // Low rolling hills on the horizon — not pyramids, just gentle bumps
    const hills: [number, number, number, number, number][] = [
      [-120, -160, 8, 55, 0x4a7a28],
      [ -60, -180, 6, 45, 0x567a30],
      [  20, -170, 9, 60, 0x4a7228],
      [  90, -155, 7, 50, 0x527832],
      [ 160, -165, 5, 40, 0x4e7830],
      [-190, -140, 7, 52, 0x4a7228],
      [ 200, -145, 6, 48, 0x527030],
    ];
    hills.forEach(([x, z, h, r, c]) => {
      // Flattened sphere half for a natural hill shape
      const geo = new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.35);
      const m = new THREE.Mesh(geo, lmat(c));
      m.position.set(x, -r * 0.55 + h * 0.5, z);
      scene.add(m);
    });
  }

  private addGrass(scene: THREE.Scene) {
    const geoTall   = new THREE.PlaneGeometry(0.12, 0.42);
    const geoShort  = new THREE.PlaneGeometry(0.10, 0.28);
    const matA = lmat(0x7ab840, { side: THREE.DoubleSide });
    const matB = lmat(0x5a9e2c, { side: THREE.DoubleSide });
    const matC = lmat(0x8cc844, { side: THREE.DoubleSide });

    for (let i = 0; i < 700; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d   = 7 + Math.random() * 80;
      const x = Math.cos(ang) * d;
      const z = Math.sin(ang) * d;
      const mats = [matA, matB, matC];
      const geo  = Math.random() > 0.4 ? geoTall : geoShort;

      for (let j = 0; j < 2; j++) {
        const g = new THREE.Mesh(geo, mats[Math.floor(Math.random() * mats.length)]);
        g.position.set(
          x + (Math.random() - 0.5) * 0.4,
          geo === geoTall ? 0.21 : 0.14,
          z + (Math.random() - 0.5) * 0.4
        );
        g.rotation.y = Math.random() * Math.PI;
        scene.add(g);
      }
    }
  }
}
