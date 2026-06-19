import * as THREE from 'three';
import { World } from '../world/World';
import { FirstPersonControls } from '../controls/FirstPersonControls';
import { Lighting } from '../systems/Lighting';
import { Overlay } from '../ui/Overlay';

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private world: World;
  private controls: FirstPersonControls;
  private lighting: Lighting;
  private overlay: Overlay;
  private clock = new THREE.Clock();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xb05a18, 35, 130);

    this.camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 300);
    this.camera.position.set(0.4, 0.28, 1.6);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onResize);

    this.lighting = new Lighting(this.scene);
    this.world = new World(this.scene);
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.overlay = new Overlay();
  }

  start() {
    this.overlay.init();
    this.loop();
  }

  private loop = () => {
    requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    this.controls.update(dt);
    this.lighting.update(elapsed);
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  };
}
