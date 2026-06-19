import * as THREE from 'three';
import { bus } from '../core/EventBus';

const EYE_H = 1.65;
const MOVE_SPEED = 0.048;
const WAKE_DURATION = 3.8;
const YURT_MAX_DIST = 8.5; // allow stepping just outside door

export class FirstPersonControls {
  private camera: THREE.Camera;
  private yaw = 0;
  private pitch = 0;
  private keys: Record<string, boolean> = {};
  private locked = false;
  private awake = false;
  private wakeTimer = 0;

  constructor(camera: THREE.Camera, canvas: HTMLElement) {
    this.camera = camera;

    document.addEventListener('keydown', e => { this.keys[e.code] = true; });
    document.addEventListener('keyup',   e => { this.keys[e.code] = false; });

    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      this.yaw   -= e.movementX * 0.0018;
      this.pitch -= e.movementY * 0.0018;
      this.pitch  = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.38, this.pitch));
    });

    document.addEventListener('pointerlockchange', () => {
      this.locked = !!document.pointerLockElement;
      bus.emit('lockchange', this.locked);
    });

    canvas.addEventListener('click', () => canvas.requestPointerLock());
  }

  get isLocked() { return this.locked; }
  get isAwake()  { return this.awake; }

  update(dt: number) {
    if (!this.locked) return;

    // Wake-up rise animation
    if (!this.awake) {
      this.wakeTimer += dt;
      const p    = Math.min(this.wakeTimer / WAKE_DURATION, 1.0);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      (this.camera as THREE.PerspectiveCamera).position.y = 0.28 + (EYE_H - 0.28) * ease;
      if (p < 0.6) this.pitch = -0.3 * (1 - p / 0.6);
      if (p >= 1.0) {
        this.awake = true;
        bus.emit('awake');
      }
    }

    // Movement after waking
    if (this.awake) {
      const cam = this.camera as THREE.PerspectiveCamera;
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const rgt = new THREE.Vector3( Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      if (this.keys['KeyW'] || this.keys['ArrowUp'])    cam.position.addScaledVector(fwd,  MOVE_SPEED);
      if (this.keys['KeyS'] || this.keys['ArrowDown'])  cam.position.addScaledVector(fwd, -MOVE_SPEED);
      if (this.keys['KeyA'] || this.keys['ArrowLeft'])  cam.position.addScaledVector(rgt, -MOVE_SPEED);
      if (this.keys['KeyD'] || this.keys['ArrowRight']) cam.position.addScaledVector(rgt,  MOVE_SPEED);

      const d = Math.hypot(cam.position.x, cam.position.z);
      if (d > YURT_MAX_DIST) {
        const a = Math.atan2(cam.position.z, cam.position.x);
        cam.position.x = Math.cos(a) * YURT_MAX_DIST;
        cam.position.z = Math.sin(a) * YURT_MAX_DIST;
      }
      cam.position.y = EYE_H;
    }

    const cam = this.camera as THREE.Object3D;
    cam.rotation.order = 'YXZ';
    (cam.rotation as THREE.Euler).y = this.yaw;
    (cam.rotation as THREE.Euler).x = this.pitch;
  }
}
