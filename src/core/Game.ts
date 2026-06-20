import * as THREE from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';
import { World } from '../world/World';
import { FirstPersonControls } from '../controls/FirstPersonControls';
import { Lighting } from '../systems/Lighting';
import { Overlay } from '../ui/Overlay';
import { AudioManager } from '../systems/AudioManager';

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  private world: World;
  private controls: FirstPersonControls;
  private lighting: Lighting;
  private overlay: Overlay;
  private composer: EffectComposer;
  private clock = new THREE.Timer();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xc5dff0, 0.004);

    this.camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 400);
    this.camera.position.set(0.4, 0.43, 1.6);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // SMAA handles AA
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping; // handled by postprocessing
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    // Post-processing pipeline
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(
      this.camera,
      new SMAAEffect(),
      new BloomEffect({
        intensity: 0.55,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.3,
        mipmapBlur: true,
      }),
      new ToneMappingEffect({
        mode: ToneMappingMode.ACES_FILMIC,
        whitePoint: 4.0,
        middleGrey: 0.6,
      }),
    ));

    window.addEventListener('resize', this.onResize);

    this.lighting = new Lighting(this.scene);
    this.world    = new World(this.scene, this.renderer);
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.overlay  = new Overlay();

    // Start audio manager
    new AudioManager(this.camera, this.scene);
  }

  start() {
    this.overlay.init();
    this.loop();
  }

  private loop = () => {
    requestAnimationFrame(this.loop);
    this.clock.update();
    const dt      = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsed();
    this.controls.update(dt);
    this.lighting.update(elapsed);
    this.composer.render();
  };

  private onResize = () => {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.composer.setSize(innerWidth, innerHeight);
  };
}
