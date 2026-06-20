import * as THREE from 'three';
import { bus } from '../core/EventBus';

export class AudioManager {
  private listener: THREE.AudioListener;
  private camera: THREE.Camera;
  private scene: THREE.Scene;

  private wind!: THREE.Audio;
  private birds!: THREE.Audio;
  private fire!: THREE.PositionalAudio;

  private horseBuffer!: AudioBuffer;
  private sheepBuffer!: AudioBuffer;
  private cowBuffer!: AudioBuffer;
  private doveBuffer!: AudioBuffer;

  private initialized = false;
  private nextAnimalTime = 0;
  private isOutsideFn: () => boolean;

  private currentWindVol = 0.08;
  private currentBirdsVol = 0.03;
  private currentFireVolMultiplier = 1.0;

  constructor(camera: THREE.Camera, scene: THREE.Scene, isOutsideFn: () => boolean) {
    this.camera = camera;
    this.scene = scene;
    this.isOutsideFn = isOutsideFn;

    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    // Initialize audio on first user interaction (pointer lock request)
    bus.on('lockchange', (locked) => {
      if (locked) {
        if (!this.initialized) {
          this.initAudio();
        } else {
          const ctx = this.listener.context;
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch((err) => console.warn('Failed to resume AudioContext:', err));
          }
        }
      } else {
        if (this.initialized) {
          const ctx = this.listener.context;
          if (ctx && ctx.state === 'running') {
            ctx.suspend().catch((err) => console.warn('Failed to suspend AudioContext:', err));
          }
        }
      }
    });
  }

  private initAudio() {
    this.initialized = true;
    const loader = new THREE.AudioLoader();

    const isOutside = this.isOutsideFn();
    this.currentWindVol = isOutside ? 0.30 : 0.08;
    this.currentBirdsVol = isOutside ? 0.22 : 0.03;
    this.currentFireVolMultiplier = isOutside ? 0.3 : 1.0;

    // 1. Wind ambient loop
    this.wind = new THREE.Audio(this.listener);
    loader.load('/audio/wind.mp3', (buffer) => {
      this.wind.setBuffer(buffer);
      this.wind.setLoop(true);
      this.wind.setVolume(this.currentWindVol);
      this.wind.play();
    });

    // 2. Nature & Birds chirping ambient loop
    this.birds = new THREE.Audio(this.listener);
    loader.load('/audio/birds.mp3', (buffer) => {
      this.birds.setBuffer(buffer);
      this.birds.setLoop(true);
      this.birds.setVolume(this.currentBirdsVol);
      this.birds.play();
    });

    // 3. Fire crackling (positional sound centered in yurt)
    this.fire = new THREE.PositionalAudio(this.listener);
    loader.load('/audio/fire.mp3', (buffer) => {
      this.fire.setBuffer(buffer);
      this.fire.setLoop(true);
      this.fire.setVolume(0.7 * this.currentFireVolMultiplier);
      this.fire.setRefDistance(1.5);
      this.fire.setMaxDistance(12);
      this.fire.play();
    });

    // Create an invisible anchor for positional fire audio
    const fireMesh = new THREE.Object3D();
    fireMesh.position.set(0, 0.2, 0); // Centered in the Yurt
    fireMesh.add(this.fire);
    this.scene.add(fireMesh);

    // 4. Preload animal sound buffers
    loader.load('/audio/horse.mp3', (buffer) => { this.horseBuffer = buffer; });
    loader.load('/audio/sheep.mp3', (buffer) => { this.sheepBuffer = buffer; });
    loader.load('/audio/cow.mp3', (buffer) => { this.cowBuffer = buffer; });
    loader.load('/audio/dove.mp3', (buffer) => { this.doveBuffer = buffer; });

    // Schedule first animal sound in 10-25 seconds
    this.nextAnimalTime = Date.now() + 10000 + Math.random() * 15000;
    this.tick();
  }

  private playAnimalSound() {
    const buffers = [this.horseBuffer, this.sheepBuffer, this.cowBuffer, this.doveBuffer].filter(Boolean);
    if (buffers.length === 0) return;

    // Pick random sound buffer
    const buffer = buffers[Math.floor(Math.random() * buffers.length)];
    const isDove = (buffer === this.doveBuffer);

    // Create positional audio for animal in the distance
    const animalAudio = new THREE.PositionalAudio(this.listener);
    animalAudio.setBuffer(buffer);
    
    // Muffle animal sounds if player is inside the yurt
    const volumeMultiplier = this.isOutsideFn() ? 1.0 : 0.3;
    const baseVolume = isDove ? 0.75 : 0.6;
    animalAudio.setVolume(baseVolume * volumeMultiplier);
    
    if (isDove) {
      animalAudio.setRefDistance(5);
      animalAudio.setMaxDistance(100);
    } else {
      animalAudio.setRefDistance(10);
      animalAudio.setMaxDistance(180);
    }

    // Choose random position on the steppe (outside yurt)
    const angle = Math.random() * Math.PI * 2;
    const distance = isDove ? (5 + Math.random() * 30) : (15 + Math.random() * 55);
    const ax = Math.cos(angle) * distance;
    const az = Math.sin(angle) * distance;
    const ay = isDove ? (1.5 + Math.random() * 4.0) : 0.5;

    const animalMesh = new THREE.Object3D();
    animalMesh.position.set(ax, ay, az);
    animalMesh.add(animalAudio);
    this.scene.add(animalMesh);

    animalAudio.play();

    // Clean up mesh and audio node after playback ends
    animalAudio.onEnded = () => {
      this.scene.remove(animalMesh);
      animalAudio.disconnect();
    };
  }

  private tick = () => {
    if (!this.initialized) return;

    if (Date.now() > this.nextAnimalTime) {
      this.playAnimalSound();
      // Schedule next sound in 18 to 35 seconds
      this.nextAnimalTime = Date.now() + 18000 + Math.random() * 17000;
    }

    setTimeout(this.tick, 2000);
  };

  update(dt: number) {
    if (!this.initialized) return;

    const isOutside = this.isOutsideFn();
    const targetWindVol = isOutside ? 0.30 : 0.08;
    const targetBirdsVol = isOutside ? 0.22 : 0.03;
    const targetFireMultiplier = isOutside ? 0.3 : 1.0;

    // Lerp wind volume
    this.currentWindVol = THREE.MathUtils.lerp(this.currentWindVol, targetWindVol, dt * 2.0);
    if (this.wind && this.wind.isPlaying) {
      this.wind.setVolume(this.currentWindVol);
    }

    // Lerp birds volume
    this.currentBirdsVol = THREE.MathUtils.lerp(this.currentBirdsVol, targetBirdsVol, dt * 2.0);
    if (this.birds && this.birds.isPlaying) {
      this.birds.setVolume(this.currentBirdsVol);
    }

    // Lerp fire volume
    this.currentFireVolMultiplier = THREE.MathUtils.lerp(this.currentFireVolMultiplier, targetFireMultiplier, dt * 2.0);
    if (this.fire && this.fire.isPlaying) {
      this.fire.setVolume(0.7 * this.currentFireVolMultiplier);
    }
  }
}
