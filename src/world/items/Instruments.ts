import * as THREE from 'three';
import { pmat } from '../../utils/GeomUtils';
import { woodTexture } from '../../utils/TextureFactory';

export class Instruments {
  constructor(scene: THREE.Scene) {
    this.addDombyra(scene);
  }

  private addDombyra(scene: THREE.Scene) {
    const dx = 3.6, dz = -2.4;

    const group = new THREE.Group();

    // Wood textures
    const lightWoodTex = woodTexture('#e5ba82', '#b58348');
    const lightWoodMat = new THREE.MeshStandardMaterial({
      map: lightWoodTex,
      roughness: 0.65,
      metalness: 0.05
    });

    const darkWoodTex = woodTexture('#7a4822', '#4a2808');
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: darkWoodTex,
      roughness: 0.75,
      metalness: 0.05
    });

    // Body (pear shape using LatheGeometry)
    const profile: THREE.Vector2[] = [];
    const segments = 15;
    const bodyHeight = 0.55;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = t * bodyHeight;
      // Pear shape: fat at bottom, tapers to thin neck joint
      const r = 0.15 * Math.sin(t * Math.PI) * (1.3 - t * 0.95);
      profile.push(new THREE.Vector2(Math.max(r, 0.001), y));
    }

    const bodyGeo = new THREE.LatheGeometry(profile, 18);
    const body = new THREE.Mesh(bodyGeo, lightWoodMat);
    body.scale.set(1.0, 1.0, 0.48); // Flatten slightly on Z axis for dombyra profile
    body.position.y = -bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Soundhole decoration (flat dark circle on front)
    const soundhole = new THREE.Mesh(
      new THREE.CircleGeometry(0.015, 12),
      pmat(0x221105, { roughness: 0.9 })
    );
    soundhole.position.set(0, -0.05, 0.075);
    group.add(soundhole);

    // Bridge
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.012, 0.015),
      darkWoodMat
    );
    bridge.position.set(0, -0.18, 0.075);
    group.add(bridge);

    // Neck
    const neckLen = 0.75;
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.022, neckLen, 8),
      darkWoodMat
    );
    neck.position.y = bodyHeight / 2 + neckLen / 2;
    neck.castShadow = true;
    group.add(neck);

    // Pegbox (headstock)
    const headH = 0.15;
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.038, headH, 0.025),
      darkWoodMat
    );
    head.position.y = bodyHeight / 2 + neckLen + headH / 2;
    head.castShadow = true;
    group.add(head);

    // Pegs (small tuning pins)
    [-0.03, 0.03].forEach((py, idx) => {
      const peg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.05, 5),
        pmat(0x3a1d04, { roughness: 0.9 })
      );
      peg.rotation.z = Math.PI / 2;
      peg.position.set(0, bodyHeight / 2 + neckLen + headH / 2 + py, idx === 0 ? 0.012 : -0.012);
      group.add(peg);
    });

    // Strings (two golden lines)
    [-0.006, 0.006].forEach(ox => {
      const pts = [
        new THREE.Vector3(ox, -0.18, 0.083), // From bridge
        new THREE.Vector3(ox, bodyHeight / 2 + neckLen + 0.04, 0.02), // To pegbox
      ];
      const stringLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xd4b050 })
      );
      group.add(stringLine);
    });

    // Placement of entire group in scene
    group.position.set(dx, 0.8, dz);
    group.rotation.z = -0.25;
    group.rotation.y = 0.1;
    scene.add(group);
  }
}
