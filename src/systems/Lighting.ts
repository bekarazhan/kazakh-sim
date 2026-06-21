import * as THREE from 'three';

// Shanyrak opening radius (yurt model scaled ×1.47, original shanyrak ~0.58m → ×1.47 ≈ 0.85m)
const SHANYRAK_R  = 0.85;
// Height of the shanyrak ring above the floor
const SHANYRAK_Y  = 3.55;

export class Lighting {
  private fireLamp:       THREE.PointLight;
  private shanyraqSpot:   THREE.SpotLight;
  
  private dustGeometry!:  THREE.BufferGeometry;
  private dustInitialX!:  Float32Array;
  private dustInitialY!:  Float32Array;
  private dustInitialZ!:  Float32Array;
  private dustVelocities!: Float32Array;
  private dustPhases!:    Float32Array;

  constructor(scene: THREE.Scene) {
    // ── Directional sun ──────────────────────────────────────────────────
    // Bright midday sun — high intensity so exterior is genuinely dazzling
    const sun = new THREE.DirectionalLight(0xfff5e0, 3.5);
    sun.position.set(30, 60, -40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 120;
    sun.shadow.bias        = -0.0003;
    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = sc.bottom = -25;
    sc.right = sc.top   =  25;
    scene.add(sun);

    // Ambient — slightly raised so interior isn't completely cave-dark
    scene.add(new THREE.AmbientLight(0x8ab4d4, 0.07));
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a8c2a, 0.15));

    // ── Shanyrak sky disc ──────────────────────────────────────
    // A bright white disc placed at the shanyrak opening (inside face only).
    // When the player looks up from inside the yurt, this disc is pure white
    // and triggers the same bloom overexposure as the door opening.
    const skyDiscGeo = new THREE.CircleGeometry(SHANYRAK_R * 0.92, 48);
    const skyDiscMat = new THREE.MeshBasicMaterial({
      color:      0xffffff,      // pure white → above any bloom threshold
      side:       THREE.BackSide, // visible only from below (inside yurt)
      depthWrite: false,
    });
    const skyDisc = new THREE.Mesh(skyDiscGeo, skyDiscMat);
    skyDisc.rotation.x = -Math.PI / 2;  // horizontal, normal facing down
    skyDisc.position.y  = SHANYRAK_Y - 0.01;
    scene.add(skyDisc);

    // ── Shanyrak SpotLight (replaces old PointLight) ─────────────────────
    // SpotLight shines strictly downward in a cone matching the shanyrak
    // opening → objects beneath it cast proper shadows (table, fire, mats).
    this.shanyraqSpot = new THREE.SpotLight(0xfff4e8, 2.2);
    this.shanyraqSpot.position.set(0, SHANYRAK_Y, 0);

    // The spot target stays at ground level directly below
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    scene.add(spotTarget);
    this.shanyraqSpot.target = spotTarget;

    // angle: half-angle of the cone — match the shanyrak opening radius
    this.shanyraqSpot.angle     = Math.atan(SHANYRAK_R / SHANYRAK_Y);
    this.shanyraqSpot.penumbra  = 0.30;  // soft edge — realistic diffuse transition
    this.shanyraqSpot.decay     = 1.8;
    this.shanyraqSpot.distance  = SHANYRAK_Y + 2.5; // just past the floor

    // Enable shadow so furniture/objects block the beam properly
    this.shanyraqSpot.castShadow            = true;
    this.shanyraqSpot.shadow.mapSize.set(1024, 1024);
    this.shanyraqSpot.shadow.camera.near    = 0.3;
    this.shanyraqSpot.shadow.camera.far     = SHANYRAK_Y + 3.0;
    this.shanyraqSpot.shadow.bias           = -0.001;
    this.shanyraqSpot.shadow.normalBias     = 0.02;

    scene.add(this.shanyraqSpot);

    // ── Campfire / hearth glow ───────────────────────────────────────────
    this.fireLamp = new THREE.PointLight(0xff5500, 1.2, 4.5);
    this.fireLamp.position.set(0, 0.2, 0);
    scene.add(this.fireLamp);

    // ── Floating Dust Particles System ───────────────────────────────────
    // Soft, golden-white dust motes floating under the shanyrak column
    const particleCount = 140;
    this.dustGeometry   = new THREE.BufferGeometry();
    this.dustInitialX   = new Float32Array(particleCount);
    this.dustInitialY   = new Float32Array(particleCount);
    this.dustInitialZ   = new Float32Array(particleCount);
    this.dustVelocities = new Float32Array(particleCount * 3);
    this.dustPhases     = new Float32Array(particleCount);

    const positions = new Float32Array(particleCount * 3);
    const rMax = 1.8; // radius of concentration under shanyrak

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * rMax;
      
      const px = Math.cos(theta) * r;
      const py = 0.1 + Math.random() * (SHANYRAK_Y - 0.2);
      const pz = Math.sin(theta) * r;

      this.dustInitialX[i] = px;
      this.dustInitialY[i] = py;
      this.dustInitialZ[i] = pz;

      positions[i * 3]     = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Velocities: vx/vz sway drift, vy slow upward drift
      this.dustVelocities[i * 3]     = (Math.random() - 0.5) * 0.02; // vx
      this.dustVelocities[i * 3 + 1] = 0.04 + Math.random() * 0.06;   // vy
      this.dustVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // vz

      this.dustPhases[i] = Math.random() * Math.PI * 2;
    }

    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dustMat = new THREE.PointsMaterial({
      color:           0xfffab0, // warm sunset gold glow
      size:            0.015,    // tiny realistic specks
      sizeAttenuation: true,
      map:             this.createDustTexture(),
      transparent:     true,
      opacity:         0.35,     // soft and subtle
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
    });

    const dustPoints = new THREE.Points(this.dustGeometry, dustMat);
    scene.add(dustPoints);
  }

  private createDustTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    
    // Smooth radial gradient for fuzzy, out-of-focus dust motes
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0.00, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 242, 200, 0.8)');
    grad.addColorStop(1.00, 'rgba(255, 255, 255, 0.0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }

  update(t: number) {
    const flicker =
      0.85 +
      Math.sin(t * 7.2)  * 0.10 +
      Math.sin(t * 13.1) * 0.05 +
      (Math.random() - 0.5) * 0.06;

    this.fireLamp.intensity = 1.2 * flicker;

    // Gentle breathing of the shanyrak light (clouds passing over)
    this.shanyraqSpot.intensity = 2.1 + Math.sin(t * 0.25) * 0.12;

    // Dynamic stateless floating of dust motes
    const posAttr = this.dustGeometry.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    
    for (let i = 0; i < this.dustPhases.length; i++) {
      const initialY = this.dustInitialY[i];
      const vy = this.dustVelocities[i * 3 + 1];
      // Slow upward drift wrapping around
      const newY = 0.1 + ((initialY + vy * t) % (SHANYRAK_Y - 0.2));

      // Swaying in a circle
      const initialX = this.dustInitialX[i];
      const initialZ = this.dustInitialZ[i];
      const phase = this.dustPhases[i];
      const newX = initialX + Math.sin(t * 1.2 + phase) * 0.06;
      const newZ = initialZ + Math.cos(t * 1.0 + phase) * 0.06;

      array[i * 3]     = newX;
      array[i * 3 + 1] = newY;
      array[i * 3 + 2] = newZ;
    }
    posAttr.needsUpdate = true;
  }
}
