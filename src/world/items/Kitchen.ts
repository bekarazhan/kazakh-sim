import * as THREE from 'three';
import { lmat } from '../../utils/GeomUtils';

export class Kitchen {
  constructor(scene: THREE.Scene) {
    this.addKazan(scene);
    this.addSaddle(scene);
  }

  private addKazan(scene: THREE.Scene) {
    const kx = 2.2, kz = 1.8;

    // Tripod legs
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.72, 5),
        lmat(0x444444)
      );
      leg.position.set(kx + Math.cos(ang) * 0.22, 0.36, kz + Math.sin(ang) * 0.22);
      leg.rotation.z = 0.22 * Math.sin(ang + 0.5);
      leg.rotation.x = 0.22 * Math.cos(ang + 0.5);
      scene.add(leg);
    }

    // Pot body
    const pot = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
      lmat(0x2a2a2a)
    );
    pot.rotation.x = Math.PI;
    pot.position.set(kx, 0.72, kz);
    pot.castShadow = true;
    scene.add(pot);

    // Rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 8, 28),
      lmat(0x383838)
    );
    rim.position.set(kx, 0.72, kz);
    scene.add(rim);

    // Embers
    const embers = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 10),
      new THREE.MeshBasicMaterial({ color: 0xff3800 })
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.set(kx, 0.005, kz);
    scene.add(embers);

    // Logs
    [-0.1, 0.1].forEach(ox => {
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.028, 0.4, 7),
        lmat(0x5a2808)
      );
      log.rotation.z = Math.PI / 2;
      log.position.set(kx + ox, 0.04, kz + 0.05);
      scene.add(log);
    });
  }

  private addSaddle(scene: THREE.Scene) {
    const sx = -3.3, sz = -1.8;

    // A-frame stand
    [[-0.22, 0.15], [0.22, -0.15]].forEach(([ox, rz]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.035, 1.0, 6),
        lmat(0x8B5e2C)
      );
      leg.rotation.z = rz;
      leg.position.set(sx + ox * 0.4, 0.5, sz);
      scene.add(leg);
    });

    // Cross bar
    const xbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6),
      lmat(0x8B5e2C)
    );
    xbar.rotation.z = Math.PI / 2;
    xbar.position.set(sx, 0.78, sz);
    scene.add(xbar);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.38),
      lmat(0x2c1208)
    );
    seat.rotation.x = Math.PI;
    seat.scale.set(1.15, 0.6, 0.85);
    seat.position.set(sx, 0.85, sz);
    seat.castShadow = true;
    scene.add(seat);

    // Pommel & cantle
    [sz - 0.22, sz + 0.22].forEach((pz, i) => {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        lmat(0x3a1808)
      );
      p.scale.set(0.7, 1.4, 0.5);
      p.position.set(sx, i === 0 ? 1.02 : 0.99, pz);
      scene.add(p);
    });

    // Gold trim
    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.015, 5, 22, Math.PI),
      lmat(0xd4a020)
    );
    trim.rotation.x = -0.4;
    trim.position.set(sx, 0.84, sz);
    scene.add(trim);
  }
}
