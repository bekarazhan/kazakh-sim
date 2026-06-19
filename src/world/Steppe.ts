import * as THREE from 'three';
import { lmat } from '../utils/GeomUtils';

export class Steppe {
  constructor(scene: THREE.Scene) {
    this.addGround(scene);
    this.addMountains(scene);
    this.addGrass(scene);
  }

  private addGround(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(400, 400, 60, 60);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      if (Math.sqrt(x * x + z * z) > 10) {
        pos.setZ(i,
          Math.sin(x * 0.08) * 0.35 +
          Math.cos(z * 0.11) * 0.28 +
          Math.sin(x * 0.3 + z * 0.2) * 0.12
        );
      }
    }
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, lmat(0x9b7a42));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private addMountains(scene: THREE.Scene) {
    const peaks: [number, number, number, number, number][] = [
      [-85, -105, 38, 30, 0x5e4a2a],
      [-55, -115, 28, 22, 0x6e5835],
      [-115, -92, 45, 38, 0x4a3818],
      [75,  -100, 32, 26, 0x5e4a2a],
      [105, -108, 50, 42, 0x483615],
      [38,  -112, 22, 18, 0x6e5835],
      [-28, -125, 55, 46, 0x3c2c10],
      [150,  -90, 35, 30, 0x503e1e],
      [-140, -80, 40, 35, 0x4a3818],
    ];
    peaks.forEach(([x, z, h, r, c]) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), lmat(c));
      m.position.set(x, h / 2 - 0.3, z);
      scene.add(m);
    });
  }

  private addGrass(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(0.14, 0.38);
    const matA = lmat(0x8a7535, { side: THREE.DoubleSide });
    const matB = lmat(0x7a6530, { side: THREE.DoubleSide });
    for (let i = 0; i < 500; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d   = 8 + Math.random() * 70;
      const x = Math.cos(ang) * d, z = Math.sin(ang) * d;
      [matA, matB].forEach(m => {
        const g = new THREE.Mesh(geo, m);
        g.position.set(x + (Math.random() - 0.5) * 0.3, 0.19, z + (Math.random() - 0.5) * 0.3);
        g.rotation.y = Math.random() * Math.PI;
        scene.add(g);
      });
    }
  }
}
