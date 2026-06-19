import * as THREE from 'three';

export class Lighting {
  private fireLamp: THREE.PointLight;
  private shanyraqBeam: THREE.PointLight;
  private lightBeamMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    // Summer midday sun — bright white, high angle
    const sun = new THREE.DirectionalLight(0xfff8e8, 2.8);
    sun.position.set(30, 60, -40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -25;
    sc.right = sc.top = 25;
    scene.add(sun);

    // Sky ambient — cool blue fill from sky
    scene.add(new THREE.AmbientLight(0x9bbfde, 0.9));

    // Ground bounce — warm green from grass
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x5a8a28, 0.6));

    // Shanyrak hole — bright daylight beam
    this.shanyraqBeam = new THREE.PointLight(0xffffff, 1.6, 10);
    this.shanyraqBeam.position.set(0, 3.6, 0);
    scene.add(this.shanyraqBeam);

    // Fire glow — dimmer in daylight
    this.fireLamp = new THREE.PointLight(0xff6010, 0.9, 5);
    this.fireLamp.position.set(2.2, 0.28, 1.8);
    scene.add(this.fireLamp);

    // Light beam cone from shanyrak
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.72 * 0.8, 4.9, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.lightBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.lightBeamMesh.position.y = (2.3 + 2.6) / 2;
    scene.add(this.lightBeamMesh);
  }

  update(t: number) {
    const flicker =
      0.7 +
      Math.sin(t * 7.2) * 0.12 +
      Math.sin(t * 13.1) * 0.06 +
      (Math.random() - 0.5) * 0.1;

    this.fireLamp.intensity = 0.9 * flicker;
    this.shanyraqBeam.intensity = 1.5 + Math.sin(t * 0.3) * 0.1;
    (this.lightBeamMesh.material as THREE.MeshBasicMaterial).opacity =
      0.025 + Math.sin(t * 0.6) * 0.008;
  }
}
