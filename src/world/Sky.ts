import * as THREE from 'three';
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js';

export class Sky {
  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    // ── Atmospheric sky (ThreeSky shader) ─────────────────────────────────
    const sky = new ThreeSky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const sunDir = new THREE.Vector3();
    const u = sky.material.uniforms;
    u['turbidity'].value         = 2.8;
    u['rayleigh'].value          = 1.0;
    u['mieCoefficient'].value    = 0.003;
    u['mieDirectionalG'].value   = 0.92;

    // Sun position: ~55° above horizon, south-southwest
    const phi   = THREE.MathUtils.degToRad(90 - 55);
    const theta = THREE.MathUtils.degToRad(200);
    sunDir.setFromSphericalCoords(1, phi, theta);
    u['sunPosition'].value.copy(sunDir);

    // Build env map from sky, clamp intensity to avoid PBR overbright
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();
    const rt = pmrem.fromScene(sky as unknown as THREE.Scene);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.12;
    pmrem.dispose();

    // ── Realistic cumulus cloud clusters (billboard sprites) ───────────────
    this.addClouds(scene);
  }

  private addClouds(scene: THREE.Scene) {
    // Two cloud textures: bright top-lit puff and softer wispy puff
    const texPuff  = this.makeCloudTexture('puff');
    const texWispy = this.makeCloudTexture('wispy');

    const matPuff = new THREE.SpriteMaterial({
      map: texPuff,
      transparent: true,
      depthWrite: false,
      opacity: 1.0,
      fog: false,
    });
    const matWispy = new THREE.SpriteMaterial({
      map: texWispy,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
      fog: false,
    });

    const NUM_CLUSTERS = 38;

    for (let c = 0; c < NUM_CLUSTERS; c++) {
      // Place cluster in a wide ring around the player
      const ang  = (c / NUM_CLUSTERS) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 120 + Math.random() * 260;
      const cx   = Math.cos(ang) * dist;
      const cz   = Math.sin(ang) * dist;
      const cy   = 90 + Math.random() * 35;          // 90–125 m altitude

      // Each cluster is 5–9 overlapping sprites
      const puffCount = 5 + Math.floor(Math.random() * 5);
      const clusterW  = 18 + Math.random() * 30;      // cluster base width in metres

      for (let p = 0; p < puffCount; p++) {
        const isWispy = p === puffCount - 1;           // last puff is a softer wisp at edge
        const mat = isWispy ? matWispy.clone() : matPuff.clone();

        const sprite = new THREE.Sprite(mat);

        // Scatter puffs within cluster
        const ox = (Math.random() - 0.5) * clusterW * 1.2;
        const oy = (Math.random() - 0.5) * clusterW * 0.25; // less vertical scatter
        const oz = (Math.random() - 0.5) * clusterW * 0.6;

        sprite.position.set(cx + ox, cy + oy, cz + oz);

        // Size: central puffs bigger, edge puffs smaller
        const centrality = 1 - (Math.hypot(ox, oz) / (clusterW * 0.8));
        const baseSize = clusterW * (0.55 + Math.random() * 0.45);
        const s = baseSize * (0.55 + Math.max(0, centrality) * 0.55);
        sprite.scale.set(s, s * 0.65, 1);             // slightly squashed vertically = flat cumulus

        // Slight random opacity variation for depth
        (mat as THREE.SpriteMaterial).opacity = isWispy
          ? 0.45 + Math.random() * 0.25
          : 0.72 + Math.random() * 0.22;

        sprite.renderOrder = 2;
        scene.add(sprite);
      }
    }
  }

  /**
   * Procedural cumulus cloud texture.
   * 'puff'  — bright white core, light grey shadowed bottom edge
   * 'wispy' — soft transparent edge puff
   */
  private makeCloudTexture(type: 'puff' | 'wispy'): THREE.CanvasTexture {
    const SIZE = 512;
    const cvs  = document.createElement('canvas');
    cvs.width  = SIZE;
    cvs.height = SIZE;
    const ctx  = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2;
    const cy = SIZE / 2;

    if (type === 'puff') {
      // ── Cumulus puff: bright white top, subtle grey-blue at bottom ─────
      // Base blob — soft overall shape
      const base = ctx.createRadialGradient(cx, cy - 30, 0, cx, cy, 220);
      base.addColorStop(0.00, 'rgba(255,255,255,0.98)');
      base.addColorStop(0.35, 'rgba(250,252,255,0.88)');
      base.addColorStop(0.65, 'rgba(235,242,255,0.55)');
      base.addColorStop(1.00, 'rgba(220,230,245,0.00)');
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 210, 175, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright highlight — sun-lit top crown
      const top = ctx.createRadialGradient(cx, cy - 60, 0, cx, cy - 30, 130);
      top.addColorStop(0.00, 'rgba(255,255,255,0.95)');
      top.addColorStop(0.50, 'rgba(255,255,255,0.60)');
      top.addColorStop(1.00, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 55, 130, 110, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sub-puff left
      const left = ctx.createRadialGradient(cx - 80, cy + 10, 0, cx - 80, cy + 10, 100);
      left.addColorStop(0.00, 'rgba(252,254,255,0.80)');
      left.addColorStop(0.60, 'rgba(245,250,255,0.40)');
      left.addColorStop(1.00, 'rgba(240,248,255,0.00)');
      ctx.fillStyle = left;
      ctx.beginPath();
      ctx.ellipse(cx - 80, cy + 10, 105, 85, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sub-puff right
      const right = ctx.createRadialGradient(cx + 85, cy + 5, 0, cx + 85, cy + 5, 95);
      right.addColorStop(0.00, 'rgba(252,254,255,0.78)');
      right.addColorStop(0.60, 'rgba(245,250,255,0.38)');
      right.addColorStop(1.00, 'rgba(240,248,255,0.00)');
      ctx.fillStyle = right;
      ctx.beginPath();
      ctx.ellipse(cx + 85, cy + 5, 100, 80, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Subtle grey shadow on the bottom — gives 3D illusion
      const shadow = ctx.createRadialGradient(cx, cy + 80, 0, cx, cy + 60, 170);
      shadow.addColorStop(0.00, 'rgba(180,192,210,0.22)');
      shadow.addColorStop(0.50, 'rgba(190,205,220,0.10)');
      shadow.addColorStop(1.00, 'rgba(200,215,230,0.00)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 70, 160, 100, 0, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // ── Wispy edge puff: very soft, semi-transparent ───────────────────
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      grad.addColorStop(0.00, 'rgba(255,255,255,0.65)');
      grad.addColorStop(0.40, 'rgba(250,253,255,0.38)');
      grad.addColorStop(0.75, 'rgba(240,248,255,0.14)');
      grad.addColorStop(1.00, 'rgba(235,245,255,0.00)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 215, 175, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(cvs);
  }
}
