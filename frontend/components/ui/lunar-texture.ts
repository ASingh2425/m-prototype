// lunar-texture.ts
// Generates a procedural high-fidelity greyscale lunar surface texture & bump map
import * as THREE from 'three';

export function createProceduralMoonTextures(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 512;

  // 1. Color / Albedo Map Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 2. Bump Map Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Base lunar regolith: mid-tone greys
  ctx.fillStyle = '#9e9ea3';
  ctx.fillRect(0, 0, width, height);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);

  // Micro-texture noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const bData = bCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  const bPixels = bData.data;

  // Simple pseudo-random hash
  function pseudoRandom(x: number, y: number, seed: number = 42) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n1 = pseudoRandom(x * 0.05, y * 0.05, 1);
      const n2 = pseudoRandom(x * 0.1, y * 0.1, 7);
      const n3 = pseudoRandom(x * 0.01, y * 0.01, 13);
      const val = 140 + (n1 * 20 - 10) + (n2 * 12 - 6) + (n3 * 30 - 15);
      pixels[idx] = val;
      pixels[idx + 1] = val;
      pixels[idx + 2] = val;

      const bumpVal = 128 + (n1 * 18 - 9) + (n2 * 10 - 5);
      bPixels[idx] = bumpVal;
      bPixels[idx + 1] = bumpVal;
      bPixels[idx + 2] = bumpVal;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bData, 0, 0);

  // Large Lunar Maria (dark basaltic plains)
  const maria = [
    { x: 280, y: 200, rx: 120, ry: 90, darkness: 0.55 }, // Mare Imbrium
    { x: 420, y: 240, rx: 90, ry: 80, darkness: 0.5 },   // Mare Serenitatis
    { x: 530, y: 260, rx: 80, ry: 70, darkness: 0.52 },  // Mare Tranquillitatis
    { x: 620, y: 290, rx: 70, ry: 60, darkness: 0.48 },  // Mare Crisium
    { x: 200, y: 310, rx: 140, ry: 110, darkness: 0.6 }, // Oceanus Procellarum
    { x: 380, y: 350, rx: 90, ry: 65, darkness: 0.53 },  // Mare Nubium
  ];

  maria.forEach(m => {
    const grad = ctx.createRadialGradient(m.x, m.y, m.rx * 0.1, m.x, m.y, m.rx);
    grad.addColorStop(0, `rgba(45, 47, 52, ${m.darkness})`);
    grad.addColorStop(0.6, `rgba(60, 62, 68, ${m.darkness * 0.7})`);
    grad.addColorStop(1, 'rgba(150, 150, 155, 0)');
    ctx.save();
    ctx.scale(1, m.ry / m.rx);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y * (m.rx / m.ry), m.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Maria are slightly depressed in bump map
    const bGrad = bCtx.createRadialGradient(m.x, m.y, m.rx * 0.1, m.x, m.y, m.rx);
    bGrad.addColorStop(0, 'rgba(80, 80, 80, 0.4)');
    bGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bCtx.save();
    bCtx.scale(1, m.ry / m.rx);
    bCtx.fillStyle = bGrad;
    bCtx.beginPath();
    bCtx.arc(m.x, m.y * (m.rx / m.ry), m.rx, 0, Math.PI * 2);
    bCtx.fill();
    bCtx.restore();
  });

  // Impact Craters with bright rims and ejecta rays
  interface Crater {
    x: number;
    y: number;
    r: number;
    rays?: boolean;
  }

  const craters: Crater[] = [
    { x: 360, y: 410, r: 24, rays: true }, // Tycho
    { x: 240, y: 220, r: 18, rays: true }, // Copernicus
    { x: 190, y: 210, r: 14 },             // Kepler
    { x: 310, y: 130, r: 20 },             // Plato
    { x: 490, y: 390, r: 16 },
    { x: 700, y: 180, r: 22 },
    { x: 820, y: 340, r: 19 },
    { x: 120, y: 380, r: 15 },
    { x: 650, y: 400, r: 17 },
    { x: 880, y: 210, r: 13 },
  ];

  // Add 80 smaller craters
  for (let i = 0; i < 90; i++) {
    craters.push({
      x: (pseudoRandom(i, 11) * width),
      y: (pseudoRandom(i, 23) * height),
      r: 3 + pseudoRandom(i, 37) * 9,
    });
  }

  craters.forEach(c => {
    // Ejecta rays
    if (c.rays) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
        const rayLen = c.r * (3 + pseudoRandom(angle, c.x) * 4);
        const rayGrad = ctx.createLinearGradient(
          c.x, c.y,
          c.x + Math.cos(angle) * rayLen,
          c.y + Math.sin(angle) * rayLen
        );
        rayGrad.addColorStop(0, 'rgba(230, 230, 240, 0.45)');
        rayGrad.addColorStop(1, 'rgba(230, 230, 240, 0)');
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(angle) * rayLen, c.y + Math.sin(angle) * rayLen);
        ctx.stroke();
      }
    }

    // Outer bright rim
    const rimGrad = ctx.createRadialGradient(c.x, c.y, c.r * 0.7, c.x, c.y, c.r * 1.3);
    rimGrad.addColorStop(0, 'rgba(235, 235, 245, 0.75)');
    rimGrad.addColorStop(0.5, 'rgba(200, 200, 210, 0.5)');
    rimGrad.addColorStop(1, 'rgba(150, 150, 155, 0)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Dark crater floor
    const floorGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 0.85);
    floorGrad.addColorStop(0, 'rgba(50, 52, 58, 0.75)');
    floorGrad.addColorStop(0.7, 'rgba(70, 72, 78, 0.6)');
    floorGrad.addColorStop(1, 'rgba(130, 130, 135, 0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Bump map crater: high rim, depressed center
    const bCraterGrad = bCtx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 1.2);
    bCraterGrad.addColorStop(0, 'rgba(40, 40, 40, 0.8)');
    bCraterGrad.addColorStop(0.65, 'rgba(70, 70, 70, 0.5)');
    bCraterGrad.addColorStop(0.85, 'rgba(220, 220, 220, 0.9)'); // bright rim = raised bump
    bCraterGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bCtx.fillStyle = bCraterGrad;
    bCtx.beginPath();
    bCtx.arc(c.x, c.y, c.r * 1.2, 0, Math.PI * 2);
    bCtx.fill();
  });

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  return { map, bumpMap };
}
