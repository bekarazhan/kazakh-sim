import * as THREE from 'three';

export function skyTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 2; cvs.height = 512;
  const ctx = cvs.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  // Clear summer day — deep blue zenith → pale blue horizon
  g.addColorStop(0.00, '#1565c0');
  g.addColorStop(0.30, '#1e88e5');
  g.addColorStop(0.65, '#64b5f6');
  g.addColorStop(0.85, '#b3d9f7');
  g.addColorStop(1.00, '#d6eefa');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  return new THREE.CanvasTexture(cvs);
}

export function shyrdakTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 1024; cvs.height = 1024;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = '#7a1010';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = '#d4a020'; ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 992, 992);
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 944, 944);

  function diamond(cx: number, cy: number, size: number) {
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = '#d4a020';
    ctx.beginPath();
    ctx.moveTo(0, -size); ctx.lineTo(size * 0.55, 0);
    ctx.lineTo(0, size); ctx.lineTo(-size * 0.55, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a1010';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.52); ctx.lineTo(size * 0.28, 0);
    ctx.lineTo(0, size * 0.52); ctx.lineTo(-size * 0.28, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d4a020';
    ctx.beginPath(); ctx.arc(0, 0, size * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  diamond(512, 512, 90);
  [130, 512, 894].forEach(x =>
    [130, 512, 894].forEach(y => {
      if (x === 512 && y === 512) return;
      diamond(x, y, x === 512 || y === 512 ? 55 : 48);
    })
  );

  // Inner ring
  ctx.strokeStyle = '#c88820'; ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.arc(512, 512, 340, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  return new THREE.CanvasTexture(cvs);
}

export function kilimTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 400;
  const ctx = cvs.getContext('2d')!;
  ctx.fillStyle = '#1e0848';
  ctx.fillRect(0, 0, 256, 400);
  ctx.strokeStyle = '#d4a020'; ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, 236, 380);
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 216, 360);
  ctx.fillStyle = '#d4a020';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 48 + col * 82, y = 55 + row * 68;
      ctx.save(); ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -26); ctx.lineTo(20, 0); ctx.lineTo(0, 26); ctx.lineTo(-20, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  return new THREE.CanvasTexture(cvs);
}

export function woodTexture(baseColor: string, grainColor: string): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = grainColor;
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 1 + Math.random() * 2;
    const h = 40 + Math.random() * 220;
    ctx.globalAlpha = 0.03 + Math.random() * 0.08;
    ctx.fillRect(x, y, w, h);
  }

  ctx.strokeStyle = grainColor;
  ctx.lineWidth = 1.5;
  for (let knot = 0; knot < 4; knot++) {
    const kx = 100 + Math.random() * 312;
    const ky = 100 + Math.random() * 312;
    ctx.globalAlpha = 0.04 + Math.random() * 0.04;
    for (let r = 10; r < 200; r += 14) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, r * 0.25, r, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1.0;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function feltTexture(colorHex: string, noiseHex: string): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = noiseHex;
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const w = 1 + Math.random() * 1.5;
    const h = 1 + Math.random() * 1.5;
    ctx.globalAlpha = 0.04 + Math.random() * 0.07;
    ctx.fillRect(x, y, w, h);
  }

  ctx.globalAlpha = 1.0;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function noiseBumpTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = 1 + Math.random() * 1.5;
    const color = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.04 + Math.random() * 0.07;
    ctx.fillRect(x, y, size, size);
  }

  ctx.globalAlpha = 1.0;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

export function metalTexture(baseColorHex: string, scratchColorHex: string): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 256;
  const ctx = cvs.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = scratchColorHex;
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = 1 + Math.random() * 2;
    ctx.globalAlpha = 0.03 + Math.random() * 0.07;
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = scratchColorHex;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 40; i++) {
    const x1 = Math.random() * 256;
    const y1 = Math.random() * 256;
    const angle = Math.random() * Math.PI * 2;
    const len = 10 + Math.random() * 30;
    ctx.globalAlpha = 0.02 + Math.random() * 0.04;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function steppeGroundTexture(): THREE.CanvasTexture {
  const S   = 1024; // larger canvas = more internal detail, fewer visible repetitions
  const cvs = document.createElement('canvas');
  cvs.width = S; cvs.height = S;
  const ctx = cvs.getContext('2d')!;

  /**
   * Draw a filled ellipse at (x, y) AND at all 8 wrap-around neighbours so
   * the texture tiles seamlessly — patches that cross an edge are continued
   * on the opposite side, eliminating the telltale seam line.
   */
  const tilePatch = (
    px: number, py: number, rx: number, ry: number,
    color: string, alpha: number
  ) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    for (const dx of [-S, 0, S]) {
      for (const dy of [-S, 0, S]) {
        ctx.beginPath();
        ctx.ellipse(px + dx, py + dy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Base — rich green steppe soil
  ctx.fillStyle = '#4a5f33';
  ctx.fillRect(0, 0, S, S);

  // Layer 1: Soil / bare earth patches (dark brown)
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 25 + Math.random() * 70;
    tilePatch(x, y, r, r * 0.75, '#4c4432', 0.14);
  }

  // Layer 2: Drier yellow-green patches
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 18 + Math.random() * 60;
    tilePatch(x, y, r, r * 0.80, '#8a9a52', 0.13);
  }

  // Layer 3: Lush darker green patches
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 18 + Math.random() * 55;
    tilePatch(x, y, r, r * 0.70, '#2d5a1b', 0.18);
  }

  // Layer 4: Fine pixel noise (dirt / micro-variation)
  // Painted in 4 quadrants tiled so the noise itself is seamless
  ctx.globalAlpha = 1.0;
  for (let i = 0; i < 60000; i++) {
    const x    = Math.random() * S;
    const y    = Math.random() * S;
    const size = 1 + Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.55 ? '#2c2518' : '#b8aa7a';
    ctx.globalAlpha = 0.06 + Math.random() * 0.09;
    // Tile the pixel too so noise doesn't add a visible edge
    ctx.fillRect(x,         y,         size, size);
    ctx.fillRect(x - S,     y,         size, size);
    ctx.fillRect(x,         y - S,     size, size);
    ctx.fillRect(x - S,     y - S,     size, size);
  }

  ctx.globalAlpha = 1.0;
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS    = THREE.RepeatWrapping;
  tex.wrapT    = THREE.RepeatWrapping;
  tex.repeat.set(55, 55);           // fewer tiles on 900m plane (was 120 on 512px canvas)
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 16;              // keeps texture sharp at oblique ground angles
  tex.needsUpdate = true;
  return tex;
}


export function grassTuftTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 512;
  const ctx = cvs.getContext('2d')!;

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, 256, 512);

  // Draw 18-25 blades of grass growing from the bottom center (128, 512) - VIVID greens
  const colors = ['#5a8232', '#7aaa3e', '#4d7228', '#6b9e38', '#3d6121', '#8dc44e'];
  
  for (let i = 0; i < 28; i++) {
    ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.lineWidth = 3 + Math.random() * 4;
    ctx.lineCap = 'round';

    // Start point: bottom center with slight offset
    const sx = 128 + (Math.random() - 0.5) * 60;
    const sy = 512;

    // End point (tip of blade): curved left or right, height is random
    const angle = (Math.random() - 0.5) * 0.6; // curvature direction
    const length = 320 + Math.random() * 170;
    const ex = sx + Math.sin(angle) * length;
    const ey = sy - Math.cos(angle) * length;

    // Control point for quadratic curve to make it look bent
    const cx = sx + Math.sin(angle) * length * 0.5 + (Math.random() - 0.5) * 40;
    const cy = sy - Math.cos(angle) * length * 0.5;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(cvs);
  return tex;
}

export function hillsBackdropTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 2048; cvs.height = 256;
  const ctx = cvs.getContext('2d')!;

  // Clear canvas (fully transparent)
  ctx.clearRect(0, 0, 2048, 256);

  // Draw three layers of rolling hills from back to front
  // Back layer (farthest, lightest, most faded sky-blue-grey fog)
  ctx.fillStyle = '#b1c3c7';
  ctx.beginPath();
  ctx.moveTo(0, 256);
  for (let x = 0; x <= 2048; x += 10) {
    const y = 110 + 
              Math.sin(x * 0.003) * 20 + 
              Math.cos(x * 0.007) * 12 + 
              Math.sin(x * 0.015) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(2048, 256);
  ctx.closePath();
  ctx.fill();

  // Middle layer
  ctx.fillStyle = '#94adab';
  ctx.beginPath();
  ctx.moveTo(0, 256);
  for (let x = 0; x <= 2048; x += 10) {
    const y = 140 + 
              Math.cos(x * 0.004) * 24 + 
              Math.sin(x * 0.009) * 14 + 
              Math.cos(x * 0.02) * 5;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(2048, 256);
  ctx.closePath();
  ctx.fill();

  // Front layer (closest, matches steppe base horizon fog color)
  ctx.fillStyle = '#728882';
  ctx.beginPath();
  ctx.moveTo(0, 256);
  for (let x = 0; x <= 2048; x += 10) {
    const y = 175 + 
              Math.sin(x * 0.005) * 18 + 
              Math.cos(x * 0.011) * 8;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(2048, 256);
  ctx.closePath();
  ctx.fill();

  // Draw a gradient at the bottom to transition smoothly to the flat steppe ground color
  const g = ctx.createLinearGradient(0, 160, 0, 256);
  g.addColorStop(0.0, 'rgba(114, 136, 130, 0.0)');
  g.addColorStop(1.0, '#5c643b'); // matches steppe ground base color!
  ctx.fillStyle = g;
  ctx.fillRect(0, 160, 2048, 96);

  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
