import * as THREE from 'three';
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class Sky {
  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    const sky = new ThreeSky();
    sky.scale.setScalar(450);
    scene.add(sky);

    const sun = new THREE.Vector3();
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value    = 3.5;    // atmospheric haze
    uniforms['rayleigh'].value     = 1.2;    // sky blue scattering
    uniforms['mieCoefficient'].value   = 0.004;
    uniforms['mieDirectionalG'].value  = 0.92;

    // Summer noon sun — high elevation
    const phi   = THREE.MathUtils.degToRad(90 - 68); // 68° above horizon
    const theta = THREE.MathUtils.degToRad(195);
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(sun);

    // Update environment map so PBR materials catch the sky colour
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = envMap;
    pmrem.dispose();
  }
}
