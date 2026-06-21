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

// Exposure targets: inside the dark yurt vs outside in sunlight
const EXPOSURE_INSIDE  = 0.11;  // low middleGrey = high exposure = door/shanyrak blow out
const EXPOSURE_OUTSIDE = 0.48;  // normal middleGrey for outdoor scene
const ADAPT_SPEED      = 1.0;   // lerp speed (units/sec)

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene:    THREE.Scene;
  readonly camera:   THREE.PerspectiveCamera;

  private world:        World;
  private controls:     FirstPersonControls;
  private lighting:     Lighting;
  private overlay:      Overlay;
  private composer:     EffectComposer;
  private audioManager: AudioManager;
  private clock = new THREE.Timer();

  // Eye adaptation
  private wasOutside   = false;
  private adaptEl!:    HTMLDivElement;
  private bloomFX!:    BloomEffect;
  private toneFX!:     ToneMappingEffect;
  private curExposure  = EXPOSURE_OUTSIDE; // current middleGrey (lerped each frame)

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x87ceef, 0.0045);

    this.camera = new THREE.PerspectiveCamera(80, innerWidth / innerHeight, 0.05, 400);
    this.camera.position.set(0.4, 0.43, 1.6);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFShadowMap;
    this.renderer.outputColorSpace   = THREE.SRGBColorSpace;
    this.renderer.toneMapping        = THREE.NoToneMapping;
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    // ── Post-processing pipeline ───────────────────────────────────────────
    this.bloomFX = new BloomEffect({
      intensity:          1.8,    // strong bloom
      luminanceThreshold: 0.35,   // low threshold — bright sky / door opening blooms
      luminanceSmoothing: 0.5,
      mipmapBlur:         true,
    });

    this.toneFX = new ToneMappingEffect({
      mode:             ToneMappingMode.REINHARD2_ADAPTIVE,
      resolution:       256,
      adaptationRate:   0.25,
      averageLuminance: 1.0,
      middleGrey:       EXPOSURE_OUTSIDE,
      maxLuminance:     48.0,     // allow full overexposure of sunlit exterior
    });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(
      this.camera,
      new SMAAEffect(),
      this.bloomFX,
      this.toneFX,
    ));

    // Eye-adaptation flash overlay (CSS-driven)
    this.adaptEl = document.createElement('div');
    this.adaptEl.id = 'eye-adapt';
    document.body.appendChild(this.adaptEl);

    window.addEventListener('resize', this.onResize);

    this.lighting     = new Lighting(this.scene);
    this.world        = new World(this.scene, this.renderer,
      (meshes) => this.controls.setCollidables(meshes)
    );
    this.controls     = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.overlay      = new Overlay();
    this.audioManager = new AudioManager(this.camera, this.scene, () => this.controls.isOutside);
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
    this.audioManager.update(dt);

    const nowOutside = this.controls.isOutside;

    // ── Doorway crossing: CSS flash ────────────────────────────────────────
    if (nowOutside !== this.wasOutside) {
      this.wasOutside = nowOutside;
      const flashColor = nowOutside
        ? 'rgba(255,252,240,0.90)'   // white squint going outside
        : 'rgba(0,0,0,0.85)';        // black blindness going inside
      this.adaptEl.style.background = flashColor;
      this.adaptEl.style.opacity    = '1';
      this.adaptEl.style.transition = 'none';
      requestAnimationFrame(() => {
        this.adaptEl.style.transition = 'opacity 1.6s ease-out';
        this.adaptEl.style.opacity    = '0';
      });
    }

    // ── Continuous exposure lerp ───────────────────────────────────────────
    // When inside: exposure → EXPOSURE_INSIDE  (very high, doorway blows out)
    // When outside: exposure → EXPOSURE_OUTSIDE (normal)
    const targetExposure = nowOutside ? EXPOSURE_OUTSIDE : EXPOSURE_INSIDE;
    this.curExposure += (targetExposure - this.curExposure) * Math.min(dt * ADAPT_SPEED, 1);

    // Write the lerped middleGrey back into the live ToneMappingEffect
    // @ts-ignore — postprocessing exposes middleGrey as a settable property
    this.toneFX.middleGrey = this.curExposure;

    // Also lerp bloom: inside gets stronger bloom (exterior door glows)
    this.bloomFX.intensity = nowOutside
      ? 1.0 + (1.8 - 1.0) * (1 - this.curExposure / EXPOSURE_OUTSIDE)
      : 1.8 + (3.5 - 1.8) * (1 - this.curExposure / EXPOSURE_INSIDE) * 0.3;

    this.composer.render();
  };

  private onResize = () => {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.composer.setSize(innerWidth, innerHeight);
  };
}
