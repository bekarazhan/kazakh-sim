import * as THREE from 'three';
import { bus } from '../core/EventBus';

const EYE_H = 1.65 + 0.15;       // Standing eye height (1.80m)
const CROUCH_H = 0.85 + 0.15;     // Crouching eye height (1.00m)
const PRONE_H = 0.30 + 0.15;      // Prone/Lying eye height (0.45m)
const WAKE_START_H = 0.28 + 0.15; // Waking up head height above floor
const MOVE_SPEED = 0.048;
const WAKE_DURATION = 3.8;
const YURT_R = 5.2;
const WALL_MARGIN = 0.35;        // how close to wall before bouncing
const DOOR_HALF_WIDTH = 0.80;    // widened door opening half-width for smooth pass
const DOOR_Z = YURT_R - 0.1;    // door is on +Z side

export class FirstPersonControls {
  private camera: THREE.Camera;
  private yaw = 0;
  private pitch = 0;
  private keys: Record<string, boolean> = {};
  private locked = false;
  private awake = false;
  private wakeTimer = 0;
  private outsideYurt = false;
  private stance: 'standing' | 'crouching' | 'prone' = 'standing';

  constructor(camera: THREE.Camera, canvas: HTMLElement) {
    this.camera = camera;

    document.addEventListener('keydown', e => { 
      this.keys[e.code] = true; 
      if (!this.locked || !this.awake) return;
      if (e.code === 'KeyC') {
        this.toggleCrouch();
      } else if (e.code === 'KeyX') {
        this.toggleProne();
      }
    });

    document.addEventListener('keyup', e => { 
      this.keys[e.code] = false; 
    });

    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      this.yaw   -= e.movementX * 0.0018;
      this.pitch -= e.movementY * 0.0018;
      // Allow looking almost straight up (86 degrees) when prone/lying down to see the shanyrak
      const maxPitch = (this.stance === 'prone') ? Math.PI * 0.48 : Math.PI * 0.42;
      this.pitch  = Math.max(-Math.PI * 0.45, Math.min(maxPitch, this.pitch));
    });

    document.addEventListener('pointerlockchange', () => {
      this.locked = !!document.pointerLockElement;
      bus.emit('lockchange', this.locked);
    });

    canvas.addEventListener('click', () => canvas.requestPointerLock());
  }

  private toggleCrouch() {
    if (this.stance === 'crouching') {
      this.stance = 'standing';
    } else {
      this.stance = 'crouching';
    }
  }

  private toggleProne() {
    if (this.stance === 'prone') {
      this.stance = 'standing';
    } else {
      this.stance = 'prone';
    }
  }

  /** Collision with yurt wall. Door on +Z side (x ≈ 0) is the only passage. */
  private collide(pos: THREE.Vector3) {
    const d = Math.hypot(pos.x, pos.z);
    const inDoorway = pos.z > 0 && Math.abs(pos.x) < DOOR_HALF_WIDTH;

    if (!inDoorway) {
      const innerLimit = YURT_R - WALL_MARGIN;
      const outerLimit = YURT_R + WALL_MARGIN;
      const a = Math.atan2(pos.z, pos.x);

      if (!this.outsideYurt && d > innerLimit) {
        // Inside → trying to cross wall outward → push back inside
        pos.x = Math.cos(a) * innerLimit;
        pos.z = Math.sin(a) * innerLimit;
      } else if (this.outsideYurt && d < outerLimit) {
        // Outside → trying to cross wall inward → push back outside
        pos.x = Math.cos(a) * outerLimit;
        pos.z = Math.sin(a) * outerLimit;
      }
    }

    // Update inside/outside state only when passing through door
    if (inDoorway) this.outsideYurt = d > YURT_R;

    // Hard steppe boundary
    const steppeLimit = YURT_R + 8;
    if (d > steppeLimit) {
      const a = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(a) * steppeLimit;
      pos.z = Math.sin(a) * steppeLimit;
    }
  }

  get isLocked() { return this.locked; }
  get isAwake()  { return this.awake; }
  get isOutside() { return this.outsideYurt; }

  update(dt: number) {
    if (!this.locked) return;

    // Wake-up rise animation
    if (!this.awake) {
      this.wakeTimer += dt;
      const p    = Math.min(this.wakeTimer / WAKE_DURATION, 1.0);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      (this.camera as THREE.PerspectiveCamera).position.y = WAKE_START_H + (EYE_H - WAKE_START_H) * ease;
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

      let targetH = EYE_H;
      let speedMult = 1.0;
      if (this.stance === 'crouching') {
        targetH = CROUCH_H;
        speedMult = 0.5;
      } else if (this.stance === 'prone') {
        targetH = PRONE_H;
        speedMult = 0.20; // slow crawl when lying down
      }

      if (this.keys['KeyW'] || this.keys['ArrowUp'])    cam.position.addScaledVector(fwd,  MOVE_SPEED * speedMult);
      if (this.keys['KeyS'] || this.keys['ArrowDown'])  cam.position.addScaledVector(fwd, -MOVE_SPEED * speedMult);
      if (this.keys['KeyA'] || this.keys['ArrowLeft'])  cam.position.addScaledVector(rgt, -MOVE_SPEED * speedMult);
      if (this.keys['KeyD'] || this.keys['ArrowRight']) cam.position.addScaledVector(rgt,  MOVE_SPEED * speedMult);

      this.collide(cam.position);
      
      // Smoothly transition camera height
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetH, dt * 7.0);

      // Clamp pitch in case stance changed
      const maxPitch = (this.stance === 'prone') ? Math.PI * 0.48 : Math.PI * 0.42;
      this.pitch = Math.max(-Math.PI * 0.45, Math.min(maxPitch, this.pitch));
    }

    const cam = this.camera as THREE.Object3D;
    cam.rotation.order = 'YXZ';
    (cam.rotation as THREE.Euler).y = this.yaw;
    (cam.rotation as THREE.Euler).x = this.pitch;
  }
}
