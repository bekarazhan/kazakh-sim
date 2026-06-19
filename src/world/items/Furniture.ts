import * as THREE from 'three';
import { box, lmat } from '../../utils/GeomUtils';

export class Furniture {
  constructor(scene: THREE.Scene) {
    this.addDastarkhan(scene);
    this.addSandyk(scene);
    this.addSleepingMat(scene);
    this.addKilim(scene);
  }

  private addDastarkhan(scene: THREE.Scene) {
    // Cloth
    const cloth = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 10),
      lmat(0xd8c890)
    );
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(0, 0.007, -0.6);
    scene.add(cloth);

    // Nan (flatbread)
    const nan = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.055, 14), lmat(0xc09030));
    nan.position.set(0.32, 0.03, -0.38);
    scene.add(nan);
    // Bread scoring ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.012, 4, 14),
      lmat(0xa07020)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.32, 0.06, -0.38);
    scene.add(ring);

    // Bowls
    this.bowl(scene, -0.55, -0.5);
    this.bowl(scene, -0.7,  -0.3, 0x7a3c10);
    this.bowl(scene,  0.65, -0.75);
    this.bowl(scene,  0.1,  -0.9);

    // Kumiss vessel
    const vessel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.13, 0.42, 10),
      lmat(0x4a2808)
    );
    vessel.position.set(-0.85, 0.22, -0.8);
    vessel.castShadow = true;
    scene.add(vessel);
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.07, 0.12, 10),
      lmat(0x4a2808)
    );
    neck.position.set(-0.85, 0.49, -0.8);
    scene.add(neck);
  }

  private bowl(scene: THREE.Scene, x: number, z: number, color = 0x8B5e14) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      lmat(color)
    );
    s.rotation.x = Math.PI;
    s.position.set(x, 0.008, z);
    s.castShadow = true;
    scene.add(s);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.012, 6, 20),
      lmat(0xd4aa30)
    );
    rim.position.set(x, 0.008, z);
    scene.add(rim);
  }

  private addSandyk(scene: THREE.Scene) {
    const cx = 0.5, cz = -3.8;
    box(scene, 1.8, 0.72, 0.72, 0x6b3818, cx, 0.36, cz);
    box(scene, 1.82, 0.16, 0.74, 0x7a4220, cx, 0.76, cz - 0.01);

    // Dome lid
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.37, 0.37, 1.82, 16, 1, false, 0, Math.PI),
      lmat(0x7a4220)
    );
    arch.rotation.z = Math.PI / 2;
    arch.scale.y = 0.4;
    arch.position.set(cx, 0.87, cz);
    arch.castShadow = true;
    scene.add(arch);

    // Metal straps
    [-0.72, 0, 0.72].forEach(ox => box(scene, 0.055, 0.88, 0.76, 0xc8a020, cx + ox, 0.44, cz));

    // Lock
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.04), lmat(0xd4b030));
    lock.position.set(cx, 0.77, cz - 0.37);
    scene.add(lock);

    // Stacked textiles on top
    [0xc03028, 0x2848a0, 0xd4a020].forEach((c, i) =>
      box(scene, 1.4, 0.06, 0.38, c, cx, 0.95 + i * 0.065, cz + 0.1)
    );
  }

  private addSleepingMat(scene: THREE.Scene) {
    box(scene, 1.6, 0.055, 2.6, 0x9a3525, 0.4, 0.027, 1.6);
    box(scene, 0.65, 0.13, 0.44, 0xc83838, 0.4, 0.1, 0.5);   // pillow
    box(scene, 1.4, 0.13, 1.0, 0x7a1828, 0.4, 0.1, 1.9);     // blanket
  }

  private addKilim(scene: THREE.Scene) {
    import('../../utils/TextureFactory').then(({ kilimTexture }) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 1.72),
        new THREE.MeshLambertMaterial({ map: kilimTexture(), side: THREE.DoubleSide })
      );
      mesh.position.set(0.8, 1.55, -5.08);
      scene.add(mesh);

      // Tassels
      for (let i = 0; i < 8; i++) {
        const t = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.002, 0.12, 4),
          new THREE.MeshLambertMaterial({ color: 0xd4a020 })
        );
        t.position.set(0.8 + (i / 7 - 0.5) * 1.0, 0.68, -5.06);
        scene.add(t);
      }
    });
  }
}
