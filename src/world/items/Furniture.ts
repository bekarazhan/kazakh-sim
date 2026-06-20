import * as THREE from 'three';
import { pmat, lmat } from '../../utils/GeomUtils';
import { woodTexture, feltTexture, noiseBumpTexture, metalTexture, kilimTexture } from '../../utils/TextureFactory';

export class Furniture {
  constructor(scene: THREE.Scene) {
    this.addDastarkhan(scene);
    this.addSandyk(scene);
    this.addSleepingMat(scene);
    this.addKilim(scene);
  }

  private addBox(scene: THREE.Scene, w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  private addDastarkhan(scene: THREE.Scene) {
    // Cloth with felt texture
    const clothTex = feltTexture('#d8c890', '#bba972');
    clothTex.repeat.set(3, 3);
    const clothMat = new THREE.MeshStandardMaterial({
      map: clothTex,
      bumpMap: noiseBumpTexture(),
      bumpScale: 0.008,
      roughness: 0.9,
      metalness: 0.0
    });

    const cloth = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 12),
      clothMat
    );
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(0, 0.007, -0.6);
    cloth.receiveShadow = true;
    scene.add(cloth);

    // Nan (flatbread)
    const nanMat = new THREE.MeshStandardMaterial({
      color: 0xc09030,
      roughness: 0.9,
      metalness: 0.0
    });
    const nan = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.055, 14), nanMat);
    nan.position.set(0.32, 0.03, -0.38);
    nan.castShadow = true;
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
    const vesselWoodTex = woodTexture('#5e320f', '#3a1e09');
    const vesselWoodMat = new THREE.MeshStandardMaterial({
      map: vesselWoodTex,
      roughness: 0.75,
      metalness: 0.05
    });

    const vessel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.13, 0.42, 10),
      vesselWoodMat
    );
    vessel.position.set(-0.85, 0.22, -0.8);
    vessel.castShadow = true;
    scene.add(vessel);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.07, 0.12, 10),
      vesselWoodMat
    );
    neck.position.set(-0.85, 0.49, -0.8);
    scene.add(neck);
  }

  private bowl(scene: THREE.Scene, x: number, z: number, color = 0x8B5e14) {
    const bowlWoodTex = woodTexture(color === 0x8B5e14 ? '#8B5e14' : '#7a3c10', '#3e1d03');
    const bowlWoodMat = new THREE.MeshStandardMaterial({
      map: bowlWoodTex,
      roughness: 0.7,
      metalness: 0.05
    });

    // Bowl body using LatheGeometry for hollow shape
    const profile: THREE.Vector2[] = [];
    const segments = 8;
    const rMax = 0.13;
    const hMax = 0.08;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const r = rMax * Math.sin(t * Math.PI * 0.5);
      const y = hMax * t;
      profile.push(new THREE.Vector2(r, y));
    }
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const r = (rMax - 0.008) * Math.sin(t * Math.PI * 0.5);
      const y = hMax * t + 0.008;
      profile.push(new THREE.Vector2(r, y));
    }

    const sGeo = new THREE.LatheGeometry(profile, 14);
    const s = new THREE.Mesh(sGeo, bowlWoodMat);
    s.position.set(x, 0.008, z);
    s.castShadow = true;
    scene.add(s);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(rMax, 0.008, 6, 20),
      lmat(0xd4aa30, { roughness: 0.4, metalness: 0.7 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 0.008 + hMax, z);
    scene.add(rim);
  }

  private addSandyk(scene: THREE.Scene) {
    const cx = 0.5, cz = -3.8;

    // Wood textures
    const sandykWoodTex = woodTexture('#753f19', '#462106');
    sandykWoodTex.repeat.set(2, 2);
    const sandykWoodMat = new THREE.MeshStandardMaterial({
      map: sandykWoodTex,
      roughness: 0.75,
      metalness: 0.1
    });

    const ironStrapsMat = new THREE.MeshStandardMaterial({
      map: metalTexture('#d4b030', '#90720c'),
      roughness: 0.45,
      metalness: 0.8
    });

    this.addBox(scene, 1.8, 0.72, 0.72, sandykWoodMat, cx, 0.36, cz);
    this.addBox(scene, 1.82, 0.16, 0.74, sandykWoodMat, cx, 0.76, cz - 0.01);

    // Dome lid
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.37, 0.37, 1.82, 16, 1, false, 0, Math.PI),
      sandykWoodMat
    );
    arch.rotation.z = Math.PI / 2;
    arch.scale.y = 0.4;
    arch.position.set(cx, 0.87, cz);
    arch.castShadow = true;
    scene.add(arch);

    // Metal straps
    [-0.72, 0, 0.72].forEach(ox => this.addBox(scene, 0.055, 0.88, 0.76, ironStrapsMat, cx + ox, 0.44, cz));

    // Lock
    const lock = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.04), 
      lmat(0xd4b030, { roughness: 0.4, metalness: 0.8 })
    );
    lock.position.set(cx, 0.77, cz - 0.37);
    scene.add(lock);

    // Stacked textiles on top
    const textileColors = ['#c03028', '#2848a0', '#d4a020'];
    const bumpMap = noiseBumpTexture();

    textileColors.forEach((color, i) => {
      const tex = feltTexture(color, '#444444');
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        bumpMap,
        bumpScale: 0.01,
        roughness: 0.95
      });
      this.addBox(scene, 1.4, 0.06, 0.38, mat, cx, 0.95 + i * 0.065, cz + 0.1);
    });
  }

  private addSleepingMat(scene: THREE.Scene) {
    const bumpMap = noiseBumpTexture();

    const matTex = feltTexture('#9a3525', '#5a1d13');
    const matMat = new THREE.MeshStandardMaterial({
      map: matTex,
      bumpMap,
      bumpScale: 0.015,
      roughness: 0.95
    });

    const pillowTex = feltTexture('#c83838', '#7e2020');
    const pillowMat = new THREE.MeshStandardMaterial({
      map: pillowTex,
      bumpMap,
      bumpScale: 0.012,
      roughness: 0.95
    });

    const blanketTex = feltTexture('#7a1828', '#470b15');
    const blanketMat = new THREE.MeshStandardMaterial({
      map: blanketTex,
      bumpMap,
      bumpScale: 0.015,
      roughness: 0.95
    });

    this.addBox(scene, 1.6, 0.055, 2.6, matMat, 0.4, 0.027, 1.6);
    this.addBox(scene, 0.65, 0.13, 0.44, pillowMat, 0.4, 0.1, 0.5);   // pillow
    this.addBox(scene, 1.4, 0.13, 1.0, blanketMat, 0.4, 0.1, 1.9);     // blanket
  }

  private addKilim(scene: THREE.Scene) {
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
  }
}
