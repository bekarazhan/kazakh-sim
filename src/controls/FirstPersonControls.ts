import * as THREE from 'three';
import { bus } from '../core/EventBus';

const EYE_H = 1.65 + 0.15;       // Standing eye height (1.80m)
const CROUCH_H = 0.85 + 0.15;     // Crouching eye height (1.00m)
const PRONE_H = 0.30 + 0.15;      // Prone/Lying eye height (0.45m)
const WAKE_START_H = 0.28 + 0.15; // Waking up head height above floor
const MOVE_SPEED = 0.048;
const WAKE_DURATION = 3.8;
const YURT_R = 5.2;
const WALL_MARGIN = 0.65;        // keep player clear of inner wall decorations/carpets
const DOOR_HALF_WIDTH = 0.85;    // slightly wider door passage to compensate
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

  // Interior collision
  private collidables: THREE.Mesh[] = [];
  private collidableBoxes: { mesh: THREE.Mesh; box: THREE.Box3 }[] = [];
  private tableCenter = new THREE.Vector2();
  private tableRadius = 0.60;
  private hasTable = false;

  setCollidables(meshes: THREE.Mesh[]) {
    this.collidables = meshes;
    this.collidableBoxes = [];
    this.hasTable = false;

    const furnitureKeywords = ['Chests', 'Sofa'];

    for (const mesh of meshes) {
      const name = mesh.name || '';
      
      if (name.includes('MainTable')) {
        mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.tableCenter.set(center.x, center.z);
        
        const size = new THREE.Vector3();
        box.getSize(size);
        // Table radius is set to 42% of the smaller axis (tight fit, ~0.56m) to make sure there is plenty of room
        this.tableRadius = Math.min(size.x, size.z) * 0.42;
        this.hasTable = true;
        continue;
      }

      const isFurniture = furnitureKeywords.some(keyword => name.includes(keyword));
      if (isFurniture) {
        // Extract individual bounding boxes for composite meshes (like combined Chests)
        const boxes = this.extractIndividualBoxes(mesh);
        for (const box of boxes) {
          this.collidableBoxes.push({ mesh, box });
        }
      }
    }
  }

  /** Helper to extract individual bounding boxes from a combined mesh's geometry in world space */
  private extractIndividualBoxes(mesh: THREE.Mesh): THREE.Box3[] {
    const boxes: THREE.Box3[] = [];
    mesh.updateMatrixWorld(true);
    
    const geom = mesh.geometry;
    const posAttr = geom.attributes.position;
    if (!posAttr) return [];
    
    // Sample every 5th vertex to keep startup parsing extremely fast
    const stride = 5;
    const worldPositions: THREE.Vector3[] = [];
    const tempV = new THREE.Vector3();
    const count = posAttr.count;
    
    for (let i = 0; i < count; i += stride) {
      tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      tempV.applyMatrix4(mesh.matrixWorld);
      worldPositions.push(tempV.clone());
    }

    // Grid-based clustering on XZ plane (0.3m grid cell resolution)
    const cellSize = 0.3;
    const grid: Record<string, THREE.Vector3[]> = {};
    
    for (const p of worldPositions) {
      const gx = Math.floor(p.x / cellSize);
      const gz = Math.floor(p.z / cellSize);
      const key = `${gx},${gz}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(p);
    }
    
    const visited = new Set<string>();
    
    for (const key in grid) {
      if (visited.has(key)) continue;
      
      const componentPoints: THREE.Vector3[] = [];
      const queue = [key];
      visited.add(key);
      
      while (queue.length > 0) {
        const curr = queue.shift()!;
        componentPoints.push(...grid[curr]);
        
        const [gx, gz] = curr.split(',').map(Number);
        const neighbors = [
          `${gx+1},${gz}`, `${gx-1},${gz}`,
          `${gx},${gz+1}`, `${gx},${gz-1}`,
          `${gx+1},${gz+1}`, `${gx-1},${gz-1}`,
          `${gx+1},${gz-1}`, `${gx-1},${gz+1}`
        ];
        
        for (const n of neighbors) {
          if (grid[n] && !visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      
      if (componentPoints.length > 0) {
        const box = new THREE.Box3();
        for (const p of componentPoints) {
          box.expandByPoint(p);
        }
        boxes.push(box);
      }
    }
    
    return boxes;
  }

  constructor(camera: THREE.Camera, canvas: HTMLElement) {
    this.camera = camera;

    document.addEventListener('keydown', e => { 
      this.keys[e.code] = true; 
      if (!this.locked || !this.awake) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.stance = 'standing';       // Space always stands up
      } else if (e.code === 'KeyC') {
        this.toggleCrouch();            // C = crouch
      } else if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        e.preventDefault();
        this.toggleProne();             // Ctrl = lie down
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

      // Auto-crouch in the doorway passage (the yurt door frame is low, around 1.45m)
      const d = Math.hypot(cam.position.x, cam.position.z);
      const forceCrouch = cam.position.z > 0 && 
                          Math.abs(cam.position.x) < DOOR_HALF_WIDTH && 
                          d > (YURT_R - 1.10) && d < (YURT_R + 0.50);

      let targetH = EYE_H;
      let speedMult = 1.0;
      if (this.stance === 'prone') {
        targetH = PRONE_H;
        speedMult = 0.20; // slow crawl when lying down
      } else if (this.stance === 'crouching' || forceCrouch) {
        targetH = CROUCH_H;
        speedMult = 0.50; // force crouch speed/height in the doorway
      }

      let moved = false;
      const prevX = cam.position.x;
      const prevZ = cam.position.z;

      if (this.keys['KeyW'] || this.keys['ArrowUp'])    { cam.position.addScaledVector(fwd,  MOVE_SPEED * speedMult); moved = true; }
      if (this.keys['KeyS'] || this.keys['ArrowDown'])  { cam.position.addScaledVector(fwd, -MOVE_SPEED * speedMult); moved = true; }
      if (this.keys['KeyA'] || this.keys['ArrowLeft'])  { cam.position.addScaledVector(rgt, -MOVE_SPEED * speedMult); moved = true; }
      if (this.keys['KeyD'] || this.keys['ArrowRight']) { cam.position.addScaledVector(rgt,  MOVE_SPEED * speedMult); moved = true; }

      if (moved) this.collideFurniture(cam, prevX, prevZ);

      this.collide(cam.position);
      
      // Smoothly transition camera height (increased from 7.0 to 12.0 for faster response)
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetH, dt * 12.0);

      // Clamp pitch in case stance changed
      const maxPitch = (this.stance === 'prone') ? Math.PI * 0.48 : Math.PI * 0.42;
      this.pitch = Math.max(-Math.PI * 0.45, Math.min(maxPitch, this.pitch));
    }

    const cam = this.camera as THREE.Object3D;
    cam.rotation.order = 'YXZ';
    (cam.rotation as THREE.Euler).y = this.yaw;
    (cam.rotation as THREE.Euler).x = this.pitch;
  }

  /** Block movement when the player walks into interior furniture. */
  private collideFurniture(cam: THREE.PerspectiveCamera, prevX: number, prevZ: number) {
    const PLAYER_RADIUS = 0.35; // player body radius (metres)
    const currentX = cam.position.x;
    const currentZ = cam.position.z;

    // 1. Table collision (Circle vs Circle)
    if (this.hasTable) {
      const dx = currentX - this.tableCenter.x;
      const dz = currentZ - this.tableCenter.y;
      const dist = Math.hypot(dx, dz);
      const minDist = this.tableRadius + PLAYER_RADIUS;

      if (dist < minDist) {
        const pushDist = minDist - dist;
        if (dist > 0.0001) {
          cam.position.x += (dx / dist) * pushDist;
          cam.position.z += (dz / dist) * pushDist;
        } else {
          cam.position.x = prevX;
          cam.position.z = prevZ;
        }
      }
    }

    // 2. AABB sliding collision for other furniture (Chests, Sofa)
    // Individual bounding boxes are pre-clustered at load time, resolving combined mesh bounding box issues
    if (this.collidableBoxes.length > 0) {
      const playerY = cam.position.y;

      for (const item of this.collidableBoxes) {
        const box = item.box;

        // Check Y-axis overlap
        if (box.min.y > playerY || box.max.y < 0.15) {
          continue;
        }

        // Check XZ distance from player center to box
        const checkX = cam.position.x;
        const checkZ = cam.position.z;

        const closestX = Math.max(box.min.x, Math.min(checkX, box.max.x));
        const closestZ = Math.max(box.min.z, Math.min(checkZ, box.max.z));

        const dx = checkX - closestX;
        const dz = checkZ - closestZ;
        const dist = Math.hypot(dx, dz);

        if (dist < PLAYER_RADIUS) {
          const pushDist = PLAYER_RADIUS - dist;
          if (dist > 0.0001) {
            // Push player away from the closest point (sliding collision)
            cam.position.x += (dx / dist) * pushDist;
            cam.position.z += (dz / dist) * pushDist;
          } else {
            // Resolve deep penetration (push player to the closest edge of the box)
            const left = checkX - box.min.x;
            const right = box.max.x - checkX;
            const back = checkZ - box.min.z;
            const front = box.max.z - checkZ;

            const minDist = Math.min(left, right, back, front);
            if (minDist === left) {
              cam.position.x = box.min.x - PLAYER_RADIUS;
            } else if (minDist === right) {
              cam.position.x = box.max.x + PLAYER_RADIUS;
            } else if (minDist === back) {
              cam.position.z = box.min.z - PLAYER_RADIUS;
            } else {
              cam.position.z = box.max.z + PLAYER_RADIUS;
            }
          }
        }
      }
    }
  }
}
