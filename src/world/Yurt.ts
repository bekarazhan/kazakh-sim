import * as THREE from 'three';
import { lmat } from '../utils/GeomUtils';

export const YURT_R = 5.2;
const WALL_H = 2.3;
const DOME_H = 2.6;
const SHANYRAK_R = 0.72;

export class Yurt {
  constructor(scene: THREE.Scene) {
    this.addFloor(scene);
    this.addWalls(scene);
    this.addDome(scene);
    this.addShanyrak(scene);
    this.addDoor(scene);
  }

  private addFloor(scene: THREE.Scene) {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(YURT_R - 0.05, 48),
      lmat(0x7a5228)
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.001;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  private addWalls(scene: THREE.Scene) {
    // Felt cylinder — rough wool texture
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(YURT_R, YURT_R, WALL_H, 64, 1, true),
      lmat(0xb06030, { side: THREE.DoubleSide, roughness: 0.95, metalness: 0 })
    );
    wall.position.y = WALL_H / 2;
    wall.castShadow = true; wall.receiveShadow = true;
    scene.add(wall);

    // Gold decorative bands — slight sheen
    const bandGeo = new THREE.CylinderGeometry(YURT_R + 0.01, YURT_R + 0.01, 0.18, 64, 1, true);
    [0.3, WALL_H - 0.2].forEach(y => {
      const b = new THREE.Mesh(bandGeo, lmat(0xd4a020, { side: THREE.DoubleSide, roughness: 0.5, metalness: 0.3 }));
      b.position.y = y;
      scene.add(b);
    });

    // Kerege ring at wall top
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(YURT_R + 0.02, 0.06, 8, 64),
      lmat(0x7a4822)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = WALL_H;
    scene.add(ring);
  }

  private addDome(scene: THREE.Scene) {
    // LatheGeometry profile: smooth curve from wall top to shanyrak
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const r = YURT_R * (1 - t) * (1 - t * 0.35) + SHANYRAK_R * t * t + Math.pow(t * (1 - t), 0.7) * 0.2;
      const h = DOME_H * Math.pow(t, 0.6);
      profile.push(new THREE.Vector2(Math.max(r, SHANYRAK_R - 0.01), h));
    }
    const dome = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 64),
      lmat(0xa85828, { side: THREE.DoubleSide, roughness: 0.9, metalness: 0 })
    );
    dome.position.y = WALL_H;
    dome.castShadow = true; dome.receiveShadow = true;
    scene.add(dome);

    // Uyk — 16 wooden roof spokes
    for (let i = 0; i < 16; i++) {
      const ang  = (i / 16) * Math.PI * 2;
      const sx   = Math.cos(ang) * YURT_R * 0.97;
      const sz   = Math.sin(ang) * YURT_R * 0.97;
      const ex   = Math.cos(ang) * SHANYRAK_R;
      const ez   = Math.sin(ang) * SHANYRAK_R;
      const dx   = ex - sx, dz = ez - sz;
      const len  = Math.sqrt(dx * dx + DOME_H * DOME_H + dz * dz);

      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.03, len, 5),
        lmat(0x8B5e2C)
      );
      spoke.position.set((sx + ex) / 2, WALL_H + DOME_H / 2, (sz + ez) / 2);
      const dir = new THREE.Vector3(dx, DOME_H, dz).normalize();
      spoke.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      scene.add(spoke);
    }
  }

  private addShanyrak(scene: THREE.Scene) {
    // Outer ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(SHANYRAK_R, 0.09, 10, 40),
      lmat(0x5a2e0a)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = WALL_H + DOME_H;
    scene.add(ring);

    // Cross spokes
    [0, Math.PI / 2].forEach(angle => {
      const cross = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, SHANYRAK_R * 2, 5),
        lmat(0x5a2e0a)
      );
      cross.rotation.z = Math.PI / 2;
      cross.rotation.y = angle;
      cross.position.y = WALL_H + DOME_H;
      scene.add(cross);
    });
  }

  private addDoor(scene: THREE.Scene) {
    const dz   = YURT_R - 0.08;
    const DW   = 1.05;
    const DH   = 1.75;
    const wood = lmat(0x7a4820);

    // Posts
    [-DW / 2 - 0.04, DW / 2 + 0.04].forEach(px => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, DH, 0.09), wood);
      post.position.set(px, DH / 2, dz);
      scene.add(post);
    });

    // Lintel
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(DW + 0.22, 0.09, 0.09), wood);
    lintel.position.set(0, DH, dz);
    scene.add(lintel);

    // Felt curtains (parted)
    const curtainMat = lmat(0x982830, { side: THREE.DoubleSide });
    [[-0.25, -0.12], [0.25, 0.12]].forEach(([cx, ry]) => {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(DW * 0.55, DH - 0.08), curtainMat);
      c.position.set(cx, DH / 2 - 0.04, dz - 0.01);
      c.rotation.y = ry;
      scene.add(c);
    });
  }
}
