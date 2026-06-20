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
