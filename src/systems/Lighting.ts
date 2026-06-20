import * as THREE from 'three';

export class Lighting {
  private fireLamp: THREE.PointLight;
  private shanyraqBeam: THREE.PointLight;
  private lightBeamMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    // Summer midday sun — bright, slightly warm white (muted intensity 2.2 instead of 3.5)
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
    sun.position.set(30, 60, -40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0003;
    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -25;
    sc.right = sc.top   =  25;
    scene.add(sun);

    // Sky ambient — cool blue diffuse (intensity 0.45 instead of 0.7)
    scene.add(new THREE.AmbientLight(0x8ab4d4, 0.45));

    // Hemisphere: sky above, green earth below (intensity 0.5 instead of 0.8, earth color: dark olive)
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x5c643b, 0.5));

    // Shanyrak — bright daylight shaft
    this.shanyraqBeam = new THREE.PointLight(0xfff8f0, 1.8, 11);
    this.shanyraqBeam.position.set(0, 3.6, 0);
    scene.add(this.shanyraqBeam);
    // Center fire lamp — dim flickering glow
    this.fireLamp = new THREE.PointLight(0xff5500, 1.2, 4.5);
    this.fireLamp.position.set(0, 0.2, 0);
    scene.add(this.fireLamp);
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.58, 4.9, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.028,
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
      Math.sin(t * 7.2)  * 0.12 +
      Math.sin(t * 13.1) * 0.06 +
      (Math.random() - 0.5) * 0.08;

    this.fireLamp.intensity    = 1.2 * flicker;
    this.shanyraqBeam.intensity = 1.7 + Math.sin(t * 0.3) * 0.1;
    (this.lightBeamMesh.material as THREE.MeshBasicMaterial).opacity =
      0.022 + Math.sin(t * 0.6) * 0.006;
  }
}
