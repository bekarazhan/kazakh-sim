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

  private initialized = false;
  private nextAnimalTime = 0;

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.camera = camera;
    this.scene = scene;

    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    // Initialize audio on first user interaction (pointer lock request)
    bus.on('lockchange', (locked) => {
      if (locked && !this.initialized) {
        this.initAudio();
      }
    });
  }

  private initAudio() {
    this.initialized = true;
    const loader = new THREE.AudioLoader();

    // 1. Wind ambient loop
    this.wind = new THREE.Audio(this.listener);
    loader.load('/audio/wind.mp3', (buffer) => {
      this.wind.setBuffer(buffer);
      this.wind.setLoop(true);
      this.wind.setVolume(0.25);
      this.wind.play();
    });

    // 2. Nature & Birds chirping ambient loop
    this.birds = new THREE.Audio(this.listener);
    loader.load('/audio/birds.mp3', (buffer) => {
      this.birds.setBuffer(buffer);
      this.birds.setLoop(true);
      this.birds.setVolume(0.18);
      this.birds.play();
    });

    // 3. Fire crackling (positional sound centered in yurt)
    this.fire = new THREE.PositionalAudio(this.listener);
    loader.load('/audio/fire.mp3', (buffer) => {
      this.fire.setBuffer(buffer);
      this.fire.setLoop(true);
      this.fire.setVolume(0.7);
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

    // Schedule first animal sound in 10-25 seconds
    this.nextAnimalTime = Date.now() + 10000 + Math.random() * 15000;
    this.tick();
  }

  private playAnimalSound() {
    const buffers = [this.horseBuffer, this.sheepBuffer, this.cowBuffer].filter(Boolean);
    if (buffers.length === 0) return;

    // Pick random sound buffer
    const buffer = buffers[Math.floor(Math.random() * buffers.length)];

    // Create positional audio for animal in the distance
    const animalAudio = new THREE.PositionalAudio(this.listener);
    animalAudio.setBuffer(buffer);
    animalAudio.setVolume(0.6);
    animalAudio.setRefDistance(10);
    animalAudio.setMaxDistance(180);

    // Choose random position on the steppe (outside yurt, radius 15 to 70 meters)
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 55;
    const ax = Math.cos(angle) * distance;
    const az = Math.sin(angle) * distance;

    const animalMesh = new THREE.Object3D();
    animalMesh.position.set(ax, 0.5, az);
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
}
