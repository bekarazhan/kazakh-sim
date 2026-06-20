import * as THREE from 'three';
import { lmat } from '../../utils/GeomUtils';
import { woodTexture, feltTexture, noiseBumpTexture, metalTexture } from '../../utils/TextureFactory';

export class Kitchen {
  constructor(scene: THREE.Scene) {
    this.addKazan(scene);
    this.addSaddle(scene);
  }

  private addKazan(scene: THREE.Scene) {
    const kx = 2.2, kz = 1.8;

    // Materials
    const ironTex = metalTexture('#222222', '#3a3a3a');
    const ironBump = noiseBumpTexture();
    const ironMat = new THREE.MeshStandardMaterial({
      map: ironTex,
      bumpMap: ironBump,
      bumpScale: 0.006,
      roughness: 0.65,
      metalness: 0.8
    });

    const tripodMat = new THREE.MeshStandardMaterial({
      map: metalTexture('#2a2a2a', '#444444'),
      roughness: 0.7,
      metalness: 0.75
    });

    const logWoodTex = woodTexture('#5a2808', '#381602');
    const logWoodMat = new THREE.MeshStandardMaterial({
      map: logWoodTex,
      roughness: 0.85,
      metalness: 0.0
    });

    // Tripod legs
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.72, 5),
        tripodMat
      );
      leg.position.set(kx + Math.cos(ang) * 0.22, 0.36, kz + Math.sin(ang) * 0.22);
      leg.rotation.z = 0.22 * Math.sin(ang + 0.5);
      leg.rotation.x = 0.22 * Math.cos(ang + 0.5);
      scene.add(leg);
    }

    // Pot body (Hollow sphere profile using LatheGeometry)
    const profile: THREE.Vector2[] = [];
    const segments = 12;
    const outerR = 0.32;
    const wallThick = 0.015;
    // Outer surface curve
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 0.5; // 0 to 90 deg
      const r = outerR * Math.sin(angle);
      const y = 0.28 * (1 - Math.cos(angle));
      profile.push(new THREE.Vector2(r, y));
    }
    // Inner surface curve (hollow inside)
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const angle = t * Math.PI * 0.5;
      const r = (outerR - wallThick) * Math.sin(angle);
      const y = 0.28 * (1 - Math.cos(angle)) + wallThick;
      profile.push(new THREE.Vector2(r, y));
    }

    const potGeo = new THREE.LatheGeometry(profile, 24);
    const pot = new THREE.Mesh(potGeo, ironMat);
    pot.position.set(kx, 0.44, kz); // 0.44 bottom + 0.28 height = 0.72 rim height
    pot.castShadow = true;
    scene.add(pot);

    // Rim ring
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 8, 28),
      ironMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(kx, 0.72, kz);
    scene.add(rim);

    // Cauldron handles (side loops)
    [0, Math.PI].forEach(angle => {
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI),
        ironMat
      );
      handle.position.set(kx + Math.cos(angle) * 0.33, 0.70, kz + Math.sin(angle) * 0.33);
      handle.rotation.y = -angle;
      handle.rotation.x = 0.4;
      scene.add(handle);
    });

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
        logWoodMat
      );
      log.rotation.z = Math.PI / 2;
      log.position.set(kx + ox, 0.04, kz + 0.05);
      scene.add(log);
    });
  }

  private addSaddle(scene: THREE.Scene) {
    const sx = -3.3, sz = -1.8;

    // Materials
    const woodTex = woodTexture('#8B5e2C', '#533212');
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.8,
      metalness: 0.05
    });

    const leatherTex = feltTexture('#351b11', '#1f0d07');
    const leatherBump = noiseBumpTexture();
    const leatherMat = new THREE.MeshStandardMaterial({
      map: leatherTex,
      bumpMap: leatherBump,
      bumpScale: 0.006,
      roughness: 0.6,
      metalness: 0.1
    });

    // A-frame stand
    [[-0.22, 0.15], [0.22, -0.15]].forEach(([ox, rz]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.035, 1.0, 6),
        woodMat
      );
      leg.rotation.z = rz;
      leg.position.set(sx + ox * 0.4, 0.5, sz);
      scene.add(leg);
    });

    // Cross bar
    const xbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6),
      woodMat
    );
    xbar.rotation.z = Math.PI / 2;
    xbar.position.set(sx, 0.78, sz);
    scene.add(xbar);

    // Seat (leather)
    const seat = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.38),
      leatherMat
    );
    seat.rotation.x = Math.PI;
    seat.scale.set(1.15, 0.6, 0.85);
    seat.position.set(sx, 0.85, sz);
    seat.castShadow = true;
    scene.add(seat);

    // Pommel & cantle (dark leather/wood)
    [sz - 0.22, sz + 0.22].forEach((pz, i) => {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        leatherMat
      );
      p.scale.set(0.7, 1.4, 0.5);
      p.position.set(sx, i === 0 ? 1.02 : 0.99, pz);
      scene.add(p);
    });

    // Gold trim
    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.015, 5, 22, Math.PI),
      lmat(0xd4a020, { roughness: 0.4, metalness: 0.8 })
    );
    trim.rotation.x = -0.4;
    trim.position.set(sx, 0.84, sz);
    scene.add(trim);
  }
}
