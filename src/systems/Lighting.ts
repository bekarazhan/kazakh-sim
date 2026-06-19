import * as THREE from 'three';

export class Lighting {
  private fireLamp: THREE.PointLight;
  private shanyraqBeam: THREE.PointLight;
  private lightBeamMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    // Morning sun — warm low-angle directional
    const sun = new THREE.DirectionalLight(0xff8840, 2.2);
    sun.position.set(-18, 9, -20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -20;
    sc.right = sc.top = 20;
    scene.add(sun);

    // Warm ambient
    scene.add(new THREE.AmbientLight(0x7a2e08, 1.0));

    // Shanyrak hole — morning light
    this.shanyraqBeam = new THREE.PointLight(0xffe0a0, 2.0, 12);
    this.shanyraqBeam.position.set(0, 3.6, 0);
    scene.add(this.shanyraqBeam);

    // Fire glow
    this.fireLamp = new THREE.PointLight(0xff6010, 1.8, 6);
    this.fireLamp.position.set(2.2, 0.28, 1.8);
    this.fireLamp.castShadow = false;
    scene.add(this.fireLamp);

    // Ground bounce
    scene.add(new THREE.HemisphereLight(0xff9040, 0x3a1800, 0.4));

    // Light beam from shanyrak (translucent cone)
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.72 * 0.8, 4.9, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffcc70,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.lightBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.lightBeamMesh.position.y = (2.3 + 2.6) / 2;
    scene.add(this.lightBeamMesh);
  }

  /** Called every frame with total elapsed time. */
  update(t: number) {
    const flicker =
      0.7 +
      Math.sin(t * 7.2) * 0.12 +
      Math.sin(t * 13.1) * 0.06 +
      (Math.random() - 0.5) * 0.1;

    this.fireLamp.intensity = 1.8 * flicker;
    this.shanyraqBeam.intensity = 1.8 + Math.sin(t * 0.4) * 0.3;
    (this.lightBeamMesh.material as THREE.MeshBasicMaterial).opacity =
      0.03 + Math.sin(t * 0.8) * 0.01;
  }
}
