import * as THREE from 'three';

export function skyTexture(): THREE.CanvasTexture {
  const cvs = document.createElement('canvas');
  cvs.width = 2; cvs.height = 512;
  const ctx = cvs.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.00, '#050b1e');
  g.addColorStop(0.25, '#0a1540');
  g.addColorStop(0.50, '#6b1a08');
  g.addColorStop(0.72, '#d44010');
  g.addColorStop(0.88, '#ff7820');
  g.addColorStop(1.00, '#ffa040');
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
