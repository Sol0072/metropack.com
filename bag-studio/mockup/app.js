import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const EMBED = /[?&]embed=1/.test(location.search); if (EMBED) document.documentElement.classList.add('embed');
const IN = 25.4;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ---------- bag catalog (inches) ---------- */
const BAGS = {
  pouch: {
    name: 'stand-up pouch', labels: { w: 'Width', h: 'Height', g: 'Bottom gusset' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 4, h: 6, g: 2.5 }, { w: 5, h: 8, g: 3 }, { w: 6, h: 9, g: 3.5 }, { w: 7, h: 11.5, g: 4 }, { w: 8, h: 12, g: 4.5 }, { w: 10, h: 14, g: 5 }],
    def: 2, lim: { w: [3, 16], h: [4, 20], g: [1.5, 7] },
  },
  wicket: {
    name: 'wicketed bag', labels: { w: 'Width', h: 'Length', g: 'Bottom gusset' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 6, h: 10, g: 2 }, { w: 8, h: 12, g: 3 }, { w: 10, h: 14, g: 3 }, { w: 12, h: 16, g: 4 }, { w: 14, h: 20, g: 4 }],
    def: 1, lim: { w: [4, 20], h: [6, 28], g: [0, 8] },
  },
  bread: {
    name: 'bread bag', labels: { w: 'Width', h: 'Length', g: 'Bottom gusset' }, order: ['w', 'g', 'h'],
    sizes: [{ w: 6, g: 3, h: 15 }, { w: 7, g: 3.5, h: 16 }, { w: 8, g: 4, h: 18 }, { w: 9, g: 4, h: 20 }, { w: 10, g: 5, h: 24 }],
    def: 2, lim: { w: [4, 14], h: [10, 30], g: [2, 8] },
  },
  box: {
    name: 'flat bottom box pouch', labels: { w: 'Width', h: 'Height', g: 'Side gusset' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 4, h: 6, g: 2.5 }, { w: 5, h: 7.5, g: 3 }, { w: 5.5, h: 8.5, g: 3 }, { w: 6, h: 9, g: 3.5 }, { w: 7, h: 11, g: 4 }, { w: 8, h: 12, g: 4.5 }],
    def: 2, lim: { w: [3, 14], h: [4, 18], g: [1.5, 7] }, label: (s) => `${fmt(s.w)} × ${fmt(s.h)} × ${fmt(s.g)}″`, gLabel: 'gusset',
  },
  quad: {
    name: 'quad seal pouch', labels: { w: 'Width', g: 'Side gusset', h: 'Height' }, order: ['w', 'g', 'h'],
    sizes: [{ w: 3.5, g: 2, h: 8 }, { w: 4.25, g: 2.5, h: 10 }, { w: 4.25, g: 2.5, h: 12.5 }, { w: 5, g: 3, h: 13 }, { w: 6, g: 3.5, h: 15 }],
    def: 2, lim: { w: [2.5, 12], h: [6, 24], g: [1.5, 6] }, label: (s) => `${fmt(s.w)} × ${fmt(s.g)} × ${fmt(s.h)}″`, gLabel: 'gusset',
  },
  flat: {
    name: 'flat pouch', labels: { w: 'Width', h: 'Height', g: '' }, order: ['w', 'h'],
    sizes: [{ w: 3, h: 4, g: 0 }, { w: 3.5, h: 5, g: 0 }, { w: 4, h: 6, g: 0 }, { w: 5, h: 7, g: 0 }, { w: 6, h: 9, g: 0 }],
    def: 2, lim: { w: [2, 12], h: [2.5, 16], g: [0, 0] },
  },
  mailer: {
    name: 'poly mailer', labels: { w: 'Width', h: 'Length', g: 'Flap' }, order: ['w', 'h'],
    sizes: [{ w: 6, h: 9, g: 1.75 }, { w: 7.5, h: 10.5, g: 1.75 }, { w: 10, h: 13, g: 2 }, { w: 12, h: 15.5, g: 2 }, { w: 14.5, h: 19, g: 2 }],
    def: 2, lim: { w: [4, 24], h: [6, 30], g: [1, 3] },
  },
  roll: {
    name: 'printed rollstock', labels: { w: 'Web width', h: 'Repeat', g: 'Roll diameter' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 8, h: 6, g: 6 }, { w: 10, h: 8, g: 7 }, { w: 12, h: 9, g: 8 }, { w: 16, h: 11, g: 9 }, { w: 20, h: 14, g: 10 }],
    def: 2, lim: { w: [4, 30], h: [3, 24], g: [4, 14] }, label: (s) => `${fmt(s.w)}″ web · ${fmt(s.h)}″ repeat`, noShelf: true,
  },
  rollzip: {
    name: 'pre-zippered rollstock', labels: { w: 'Web width', h: 'Repeat', g: 'Roll diameter' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 8, h: 6, g: 6 }, { w: 10, h: 8, g: 7 }, { w: 12, h: 9, g: 8 }, { w: 16, h: 11, g: 9 }, { w: 20, h: 14, g: 10 }],
    def: 2, lim: { w: [4, 30], h: [3, 24], g: [4, 14] }, label: (s) => `${fmt(s.w)}″ web · ${fmt(s.h)}″ repeat`, noShelf: true,
  },
  diecut: {
    name: 'die-cut handle bag', labels: { w: 'Width', h: 'Height', g: '' }, order: ['w', 'h'],
    sizes: [{ w: 9, h: 12, g: 0 }, { w: 12, h: 15, g: 0 }, { w: 15, h: 18, g: 0 }, { w: 18, h: 20, g: 0 }, { w: 20, h: 24, g: 0 }],
    def: 1, lim: { w: [6, 24], h: [8, 30], g: [0, 0] },
  },
  doorknob: {
    name: 'door knob hanger bag', labels: { w: 'Width', h: 'Length', g: 'Hanger' }, order: ['w', 'h'],
    sizes: [{ w: 6, h: 9, g: 3.5 }, { w: 7.5, h: 12, g: 4 }, { w: 9, h: 12, g: 4 }, { w: 10, h: 15, g: 4.5 }, { w: 12, h: 18, g: 4.5 }],
    def: 2, lim: { w: [5, 16], h: [6, 24], g: [3, 6] },
  },
  header: {
    name: 'header bag', labels: { w: 'Width', h: 'Height', g: 'Header' }, order: ['w', 'h', 'g'],
    sizes: [{ w: 3, h: 4, g: 1.5 }, { w: 4, h: 6, g: 1.75 }, { w: 5, h: 8, g: 2 }, { w: 6, h: 9, g: 2 }, { w: 8, h: 10, g: 2.5 }],
    def: 2, lim: { w: [2, 14], h: [3, 18], g: [1, 4] }, label: (s) => `${fmt(s.w)} × ${fmt(s.h)}″`, gDim: false,
  },
  tape: {
    name: 'tape closure bag', labels: { w: 'Width', h: 'Height', g: 'Flap' }, order: ['w', 'h'],
    sizes: [{ w: 3, h: 5, g: 1.25 }, { w: 4, h: 6, g: 1.25 }, { w: 5, h: 7, g: 1.5 }, { w: 6, h: 8, g: 1.5 }, { w: 8, h: 10, g: 1.75 }],
    def: 2, lim: { w: [2, 16], h: [3, 20], g: [1, 3] },
  },
  fliptop: {
    name: 'flip-top bag', labels: { w: 'Width', h: 'Height', g: 'Flap' }, order: ['w', 'h'],
    sizes: [{ w: 5, h: 8, g: 2 }, { w: 6, h: 10, g: 2.5 }, { w: 8, h: 12, g: 3 }, { w: 10, h: 14, g: 3 }, { w: 12, h: 18, g: 3.5 }],
    def: 1, lim: { w: [3, 20], h: [5, 26], g: [1.5, 4] },
  },
  staple: {
    name: 'staple pack bag', labels: { w: 'Width', h: 'Length', g: 'Lip' }, order: ['w', 'h'],
    sizes: [{ w: 6, h: 8, g: 1.5 }, { w: 7, h: 10, g: 1.5 }, { w: 8, h: 12, g: 1.75 }, { w: 10, h: 14, g: 2 }, { w: 12, h: 16, g: 2 }],
    def: 1, lim: { w: [4, 16], h: [5, 22], g: [1, 3] },
  },
};

const fmt = (n) => {
  const s = (Math.round(n * 100) / 100).toString();
  return s.replace(/\.5$/, '½').replace(/\.25$/, '¼').replace(/\.75$/, '¾').replace(/^0(?=[½¼¾])/, '');
};
function sizeLabel(type, s) {
  if (type === 'bread') return `${fmt(s.w)} × ${fmt(s.g)} × ${fmt(s.h)}″`;
  if (BAGS[type].label) return BAGS[type].label(s);
  if (!['pouch', 'wicket'].includes(type)) return `${fmt(s.w)} × ${fmt(s.h)}″`;
  return `${fmt(s.w)} × ${fmt(s.h)}${s.g > 0 ? ' + ' + fmt(s.g) + '″ BG' : '″'}`;
}

const state = {
  type: 'pouch', size: { ...BAGS.pouch.sizes[2] }, art: null, artName: '',
  scale: 1, ox: 0, oy: 0, fit: 'fit', back: 'same', color: '#ffffff', finish: 'gloss', mode: 'studio',
  colors: { pouch: '#ffffff', wicket: 'clear', bread: 'clear', box: '#ffffff', quad: '#ffffff', flat: '#ffffff', mailer: '#ffffff', roll: '#ffffff', rollzip: '#ffffff',
    diecut: '#ffffff', doorknob: 'clear', header: 'clear', tape: 'clear', fliptop: 'clear', staple: 'clear' }, // film per bag type; clear poly is the default for the poly bags
  artKO: null, koWhite: true, // artwork with its white background knocked out (for clear film)
};
const isClear = () => state.color === 'clear';
const filmHex = () => (isClear() ? '#ffffff' : state.color);

/* ---------- renderer / scene ---------- */
const canvas = $('#c');
const viewer = $('#viewer');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: false });
} catch (e) {
  $('#nogl').hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;

function gradientTex(top, mid, bot) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const studioBg = gradientTex('#fafafa', '#f5f5f7', '#e8e8ec');
const shelfBg = gradientTex('#e9e8e4', '#dddcd7', '#cfcdc7');
const clearBg = gradientTex('#f2f4f6', '#e7eaee', '#cdd2d9'); // cooler, a touch darker: lets clear film and its highlights read
scene.background = studioBg;
const studioBgNow = () => (isClear() ? clearBg : studioBg);

const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 60);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.enablePan = false; controls.rotateSpeed = 0.9;
controls.autoRotate = true; controls.autoRotateSpeed = 1.2;

const hemi = new THREE.HemisphereLight(0xffffff, 0xcfc8be, 0.28); scene.add(hemi);
const studioFog = new THREE.Fog(0xe7e8e6, 500, 1000), shelfFog = new THREE.Fog(0xdedcd7, 3.4, 11); scene.fog = studioFog;
const key = new THREE.DirectionalLight(0xffffff, 1.55);
key.position.set(1.0, 4.2, 1.5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.002; key.shadow.radius = 6;
scene.add(key); scene.add(key.target);
const fill = new THREE.DirectionalLight(0xfff4e8, 0.3); fill.position.set(-3, 1.5, 1.5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.25); rim.position.set(1.4, 2.6, -2.8); scene.add(rim);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.16 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
})();
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
blob.rotation.x = -Math.PI / 2; blob.position.y = 0.0006; blob.renderOrder = -1; scene.add(blob);

/* ---------- textures: print atlas + film bump ---------- */
const AW = 2048, AH = 2048; // atlas: left half = front panel, right half = back panel
const atlas = document.createElement('canvas'); atlas.width = AW; atlas.height = AH;
const actx = atlas.getContext('2d');
const atlasTex = new THREE.CanvasTexture(atlas);
atlasTex.colorSpace = THREE.SRGBColorSpace; atlasTex.anisotropy = maxAniso;
const bumpC = document.createElement('canvas'); bumpC.width = 1024; bumpC.height = 1024;
const bctx = bumpC.getContext('2d', { willReadFrequently: true });
const bumpTex = new THREE.CanvasTexture(bumpC);
const holeC = document.createElement('canvas'); holeC.width = 512; holeC.height = 512;
const holeTex = new THREE.CanvasTexture(holeC);

const bodyMat = new THREE.MeshPhysicalMaterial({ map: atlasTex, bumpMap: bumpTex, bumpScale: 1.2, roughness: 0.36, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, alphaTest: 0.5, envMapIntensity: 0.9 });
const botC = document.createElement('canvas'); botC.width = botC.height = 256;
(() => { const g = botC.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(0,0,0,0.13)'; g.lineWidth = 14; g.beginPath(); g.ellipse(128, 128, 118, 116, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 2; for (let r = 104; r < 126; r += 4) { g.beginPath(); g.ellipse(128, 128, r, r * 0.98, 0, 0, Math.PI * 2); g.stroke(); }
  const gr = g.createLinearGradient(0, 120, 0, 136); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(14, 120, 228, 16); })();
const botTex = new THREE.CanvasTexture(botC); botTex.colorSpace = THREE.SRGBColorSpace;
const plainMat = new THREE.MeshPhysicalMaterial({ map: botTex, color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 0.8 });
const innerMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.55, alphaMap: holeTex, alphaTest: 0.5, envMapIntensity: 0.6 });
const clipMat = new THREE.MeshPhysicalMaterial({ color: 0x2c6fb7, roughness: 0.45, clearcoat: 0.6 });

/* seeded random so wrinkles stay put between redraws */
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const fnoise = (x, y) => Math.sin(x * 0.071 + y * 0.033) * 0.5 + Math.sin(x * 0.023 - y * 0.061 + 1.3) * 0.35 + Math.sin(x * 0.13 + y * 0.11 + 2.1) * 0.15;

/* ---------- geometry ---------- */
let N = 96, Q = 1; // samples per half (front / back); Q = mesh quality (shelf copies use less)
function loft(rows, smoothSeams) {
  const cols = N + 1, per = cols * 2, M = rows.length;
  const pos = new Float32Array(M * per * 3), uv = new Float32Array(M * per * 2);
  for (let j = 0; j < M; j++) {
    const r = rows[j];
    for (let h = 0; h < 2; h++) {
      const pts = h === 0 ? r.front : r.back;
      const L = [0]; for (let i = 1; i < cols; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const tot = L[cols - 1] || 1;
      for (let i = 0; i < cols; i++) {
        const k = j * per + h * cols + i;
        pos[k * 3] = pts[i][0]; pos[k * 3 + 1] = r.y; pos[k * 3 + 2] = pts[i][1];
        uv[k * 2] = h * 0.5 + (L[i] / tot) * 0.5; uv[k * 2 + 1] = r.v;
      }
    }
  }
  const idx = [];
  for (let j = 0; j < M - 1; j++) for (let h = 0; h < 2; h++) for (let i = 0; i < N; i++) {
    const a = j * per + h * cols + i, b = a + 1, c = a + per, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  if (smoothSeams) {
    const n = g.attributes.normal;
    for (let j = 0; j < M; j++) {
      const pairs = [[j * per + N, j * per + cols], [j * per, j * per + cols + N]];
      for (const [p, q] of pairs) {
        const x = n.getX(p) + n.getX(q), y = n.getY(p) + n.getY(q), z = n.getZ(p) + n.getZ(q), l = Math.hypot(x, y, z) || 1;
        n.setXYZ(p, x / l, y / l, z / l); n.setXYZ(q, x / l, y / l, z / l);
      }
    }
  }
  return g;
}
function cap(row, y, down = true) {
  const pts = row.front.concat(row.back.slice(1, -1));
  const pos = [0, y, 0]; pts.forEach((p) => pos.push(p[0], y, p[1]));
  const idx = []; const n = pts.length;
  for (let i = 0; i < n; i++) { const a = 1 + i, b = 1 + ((i + 1) % n); down ? idx.push(0, a, b) : idx.push(0, b, a); }
  let mx = 1, mz = 1; pts.forEach((p) => { mx = Math.max(mx, Math.abs(p[0])); mz = Math.max(mz, Math.abs(p[1])); });
  const uvs = []; for (let i = 0; i < pos.length; i += 3) uvs.push(0.5 + pos[i] / (2 * mx), 0.5 + pos[i + 2] / (2 * mz));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  const ny = g.attributes.normal.getY(0); if ((down && ny > 0) || (!down && ny < 0)) { g.setIndex(idx.map((v, i) => (i % 3 === 1 ? idx[i + 1] : i % 3 === 2 ? idx[i - 1] : v))); g.computeVertexNormals(); }
  return g;
}
const cosT = (i) => (1 - Math.cos(Math.PI * i / N)) / 2;

/* lens section: two films welded at side seals, pushed apart by depth b */
function lensRow(y, v, a, b, seal, dzFn, off = 0.25) {
  const front = [], back = [];
  for (let i = 0; i <= N; i++) {
    const x = -a + 2 * a * cosT(i);
    const ai = Math.max(1, a - seal), r = Math.abs(x) / ai;
    const sh = r < 1 ? Math.pow(1 - Math.pow(r, 2.3), 0.55) : 0;
    const dz = dzFn ? dzFn(x, y, sh) : 0;
    front.push([x, b * sh + off + dz]);
  }
  for (let i = 0; i <= N; i++) {
    const x = a - 2 * a * cosT(i);
    const ai = Math.max(1, a - seal), r = Math.abs(x) / ai;
    const sh = r < 1 ? Math.pow(1 - Math.pow(r, 2.3), 0.55) : 0;
    const dz = dzFn ? dzFn(-x * 1.13 + 40, y + 17, sh) : 0;
    back.push([x, -(b * sh + off + dz)]);
  }
  return { y, v, front, back };
}

function buildPouch(s) {
  const W = s.w * IN, H = s.h * IN, G = s.g * IN;
  const seal = Math.min(8, W * 0.06), topSeal = Math.min(12, H * 0.06);
  const zipY = H - Math.min(28, H * 0.13);
  const yTop = H - topSeal;
  const P = Math.min(W, H) * 0.1;
  const rows = []; const M = Math.round(200 * Q);
  for (let j = 0; j <= M; j++) {
    const y = H * j / M; const t = Math.min(1, y / yTop);
    let b = (G * 0.42) * Math.pow(1 - t, 2.1) + P * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), 0.75) * (1 - 0.3 * t);
    b *= 1 - smooth(yTop - 6, yTop, y);
    rows.push(lensRow(y, y / H, W / 2, b, seal, (x, yy, sh) => {
      const zip = 1.5 * Math.exp(-Math.pow((yy - zipY) / 1.7, 2)) * Math.min(1, sh * 4 + 0.15);
      return zip + 0.5 * fnoise(x, yy) * sh;
    }));
  }
  const g = new THREE.Group();
  const body = new THREE.Mesh(loft(rows, false), bodyMat); body.castShadow = true; body.userData.role = 'pBody'; body.userData.cast = true; g.add(body);
  const bottom = new THREE.Mesh(cap(rows[0], 0.05), plainMat); bottom.userData.role = 'cap'; g.add(bottom);
  return { group: g, meta: { type: 'pouch', W, H, G, Htot: H, Dmax: G * 0.84 + 4, panelW: W, seal, topSeal, zipY,
    face: { x0: seal + 4, x1: W - seal - 4, y0: 6, y1: zipY - 9 } } };
}


/* ---------- thin-film helpers (wicketed + bread) ---------- */
// soft film material: thinner, softer sheen than the pouch laminate
const filmMat = new THREE.MeshPhysicalMaterial({ map: atlasTex, bumpMap: bumpTex, bumpScale: 0.9, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.32, specularIntensity: 0.7, alphaTest: 0.5, envMapIntensity: 0.75, side: THREE.FrontSide });
const lipInC = document.createElement('canvas'); lipInC.width = lipInC.height = 1024; const lipInTex = new THREE.CanvasTexture(lipInC); lipInTex.colorSpace = THREE.SRGBColorSpace;
const filmInMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: lipInTex, roughness: 0.6, alphaMap: holeTex, alphaTest: 0.5, envMapIntensity: 0.5, side: THREE.BackSide });
const wireMat = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 1, roughness: 0.28, envMapIntensity: 1.1 });
const clipMat2 = new THREE.MeshPhysicalMaterial({ color: 0x2f74c0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });

/* CLEAR POLY FILM: one pass, premultiplied blend. The print (atlas alpha) is opaque ink, the rest is a faint haze;
   reflections are added on top of the see-through film (not scaled by alpha) and the film thickens at grazing angles,
   so welds, edges and creases read the way real clear poly does. No transmission pass, so it stays fast on phones. */
const clearUniforms = { uEdge: { value: 0.38 }, uSpec: { value: 0.5 }, uHaze: { value: 0.07 }, uLipV: { value: 2.0 } };
function makeClearMat(side, backInk = 1, farSign = 0) { // farSign: ±1 hides print on faces turned away (double-sided bodies)
  const m = new THREE.MeshPhysicalMaterial({ map: atlasTex, bumpMap: bumpTex, bumpScale: 0.55, roughness: 0.3, metalness: 0, specularIntensity: 1, ior: 1.5,
    envMapIntensity: 0.85, transparent: true, depthWrite: false, alphaTest: 0.004, premultipliedAlpha: true, side });
  m.forceSinglePass = false;
  const ink = { value: backInk }, far = { value: farSign };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uEdge = clearUniforms.uEdge; sh.uniforms.uSpec = clearUniforms.uSpec; sh.uniforms.uHaze = clearUniforms.uHaze; sh.uniforms.uLipV = clearUniforms.uLipV; sh.uniforms.uInk = ink; sh.uniforms.uFar = far;
    sh.fragmentShader = 'uniform float uEdge;\nuniform float uSpec;\nuniform float uInk;\nuniform float uHaze;\nuniform float uLipV;\nuniform float uFar;\n' + sh.fragmentShader
      .replace('#include <opaque_fragment>', `
        float clrInk = max(uInk * step(0.0, uFar * dot(normalize(vNormal), geometryViewDir)), step(uLipV, vMapUv.y)); // the header lip is nobody's far side: its perforation and hole rims always show
        float clrA = mix(min(diffuseColor.a, uHaze), diffuseColor.a, clrInk); // far panel: its print only tints the film
        float clrF = pow(1.0 - saturate(abs(dot(nonPerturbedNormal, geometryViewDir))), 3.0);
        float clrAF = 1.0 - (1.0 - clrA) * (1.0 - uEdge * clrF);
        vec3 clrD = linearToOutputTexel(vec4((totalDiffuse + totalEmissiveRadiance) * 0.62, 1.0)).rgb; // ink lit like printed film, not blown out
        clrD = mix(vec3(0.78, 0.81, 0.84) * (0.6 + 0.4 * clrD.g), clrD, clrInk); // far panel: plain film, its print stays out
        clrD *= mix(1.0, 0.55, clrF * (1.0 - smoothstep(0.3, 0.7, clrA))); // film seen edge-on reads as a soft grey line
        // two tall softbox reflections (fixed in the room), broken up by the film's creases: the classic glossy-poly streaks
        vec3 clrN = normalize((vec4(normal, 0.0) * viewMatrix).xyz), clrV = normalize((vec4(geometryViewDir, 0.0) * viewMatrix).xyz);
        vec3 clrR = reflect(-clrV, clrN); vec2 clrH = normalize(clrR.xz + vec2(1e-4));
        float clrEl = smoothstep(-0.35, 0.05, clrR.y) * (1.0 - smoothstep(0.55, 0.9, clrR.y));
        float clrS = (smoothstep(0.9955, 0.9992, dot(clrH, normalize(vec2(-0.36, 0.93)))) + 0.6 * smoothstep(0.9965, 0.9994, dot(clrH, normalize(vec2(0.62, 0.78))))) * clrEl;
        vec3 clrSpec = totalSpecular * uSpec * (0.12 + 0.88 * clrAF) * (1.0 - 0.8 * smoothstep(0.5, 0.9, clrA)) + vec3(clrS * 0.65 * uSpec * (1.0 - 0.65 * step(0.5, clrA)));
        gl_FragColor = vec4(clrD * clrAF + clrSpec, clrAF);`)
      .replace('#include <colorspace_fragment>', '')
      .replace('#include <premultiplied_alpha_fragment>', '');
  };
  m.customProgramCacheKey = () => 'clearfilm';
  return m;
}
const clearOut = makeClearMat(THREE.FrontSide);          // wicketed panels, outside
const clearIn = makeClearMat(THREE.BackSide, 0); // inside faces: the far panel's print would ghost through mirrored; keep it out      // wicketed panels, seen from inside / through the other panel
const clearBody = makeClearMat(THREE.DoubleSide, 1, 1);  // bread bag + pouch body: one pass, far-side print hidden so nothing ghosts mirrored
clearBody.forceSinglePass = true;
const clearCap = new THREE.MeshPhysicalMaterial({ color: 0xeef2f5, roughness: 0.25, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1 });
const loafTex = (() => { // sliced sandwich loaf: golden crust, darker crown, faint slice lines
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 512, 0);
  // u runs round the loaf from the crown (u=0, +x): golden-brown top crust, paler golden sides, tan pan bottom (u=0.5)
  gr.addColorStop(0, '#a5602a'); gr.addColorStop(0.07, '#b46d32'); gr.addColorStop(0.16, '#cf9555'); gr.addColorStop(0.25, '#dcae74'); gr.addColorStop(0.38, '#d6a46a');
  gr.addColorStop(0.5, '#c89055'); gr.addColorStop(0.62, '#d6a46a'); gr.addColorStop(0.75, '#dcae74'); gr.addColorStop(0.84, '#cf9555'); gr.addColorStop(0.93, '#b46d32'); gr.addColorStop(1, '#a5602a');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() > 0.5 ? `rgba(90,45,15,${0.05 + r() * 0.08})` : `rgba(250,215,160,${0.04 + r() * 0.08})`; const w = 2 + r() * 9; g.fillRect(r() * 512, r() * 1024, w, w * (0.3 + r())); }
  for (let y = 30; y < 1000; y += 34 + r() * 4) { g.fillStyle = 'rgba(80,40,14,0.07)'; g.fillRect(0, y, 512, 1.5); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,62,22,${0.05 + r() * 0.08})`; g.beginPath(); g.ellipse(r() * 512, r() * 1024, 10 + r() * 40, 4 + r() * 14, r() * 3, 0, 6.3); g.fill(); }
  const v = g.createLinearGradient(0, 0, 0, 1024); v.addColorStop(0, 'rgba(110,55,20,0.45)'); v.addColorStop(0.06, 'rgba(110,55,20,0)'); v.addColorStop(0.94, 'rgba(110,55,20,0)'); v.addColorStop(1, 'rgba(110,55,20,0.45)');
  g.fillStyle = v; g.fillRect(0, 0, 512, 1024);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, maxAniso); return t;
})();
const loafMat = new THREE.MeshStandardMaterial({ map: loafTex, color: 0xf2ece6, roughness: 0.8, metalness: 0, envMapIntensity: 0.45 });
const FILM = { // role -> [opaque film, clear film]
  pBody: () => [bodyMat, clearBody], cap: () => [plainMat, clearCap], wOut: () => [filmMat, clearOut], wIn: () => [filmInMat, clearIn], bBody: () => [breadMat, clearBody],
};
function applyFilm(group) {
  const clear = isClear();
  group.traverse((o) => {
    if (!o.isMesh || !o.userData.role) return;
    const r = o.userData.role;
    if (r === 'loaf') { o.visible = clear; return; }
    const f = FILM[r]; if (f) o.material = f()[clear ? 1 : 0];
    o.castShadow = clear ? false : !!o.userData.cast;
    o.renderOrder = clear && r === 'cap' ? -0.5 : 0;
  });
}

function makeCreases(n, W, H, opt = {}) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const side = rnd() > 0.5 ? 1 : -1;
    const fromSeal = rnd() < (opt.sealBias ?? 0.6);
    const x0 = fromSeal ? side * W * (0.47 - 0.05 * rnd()) : (rnd() - 0.5) * W * 0.7;
    const y0 = H * (0.08 + 0.84 * rnd());
    const ang = fromSeal ? (side > 0 ? Math.PI : 0) + (rnd() - 0.5) * 1.3 : Math.PI / 2 + (rnd() - 0.5) * 1.6;
    const len = (fromSeal ? W * (0.18 + 0.3 * rnd()) : H * (0.12 + 0.25 * rnd()));
    out.push({ x0, y0, dx: Math.cos(ang) * len, dy: Math.sin(ang) * len, w: 2.5 + rnd() * 6, amp: (rnd() > 0.45 ? 1 : -1) * (opt.amp ?? 1) * (0.4 + 0.8 * rnd()) });
  }
  return out;
}
function creaseAt(cr, x, y) {
  let s = 0;
  for (const c of cr) {
    const L2 = c.dx * c.dx + c.dy * c.dy;
    let t = ((x - c.x0) * c.dx + (y - c.y0) * c.dy) / L2; if (t < 0 || t > 1) continue;
    const px = c.x0 + c.dx * t, py = c.y0 + c.dy * t, d = Math.hypot(x - px, y - py);
    if (d > c.w * 3) continue;
    s += c.amp * Math.sin(Math.PI * t) * Math.exp(-(d * d) / (c.w * c.w));
  }
  return s;
}
function gridGeo(nx, ny, P) { // P(i,j) -> [x,y,z,u,v]
  const pos = new Float32Array((nx + 1) * (ny + 1) * 3), uv = new Float32Array((nx + 1) * (ny + 1) * 2);
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const k = j * (nx + 1) + i, p = P(i, j);
    pos[k * 3] = p[0]; pos[k * 3 + 1] = p[1]; pos[k * 3 + 2] = p[2]; uv[k * 2] = p[3]; uv[k * 2 + 1] = p[4];
  }
  const idx = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

/* WICKETED: two flat films welded at the sides, back panel runs up into a 2" header lip */
function buildWicket(s) {
  const W = s.w * IN, H = s.h * IN, G = s.g * IN;
  const seal = Math.min(5, Math.max(3, W * 0.022)), lip = 2 * IN, Ht = H + lip;
  const puff = Math.min(W, H) * 0.010 + (G > 0 ? 1.2 : 0.4);
  seed = 23 + Math.round(W + H);
  const crF = makeCreases(11, W, H, { amp: 1.8 }), crB = makeCreases(11, W, H, { amp: 1.6 });
  const bump2 = (x, y) => 0.35 * fnoise(x * 1.7, y * 1.3) + 0.25 * Math.sin(y * 0.09 + x * 0.02);
  const zAt = (x, y, side) => {
    const ex = W / 2 - Math.abs(x);
    const sx = smooth(seal * 0.9, seal + Math.min(W * 0.2, 40), ex);
    const sy = smooth(G > 0 ? 0 : 2, G > 0 ? Math.max(12, G * 0.4) : Math.max(14, H * 0.07), y);
    let z = puff * Math.sqrt(sx) * sy * (1 - 0.35 * smooth(H * 0.55, H, y));
    if (G > 0) z += 1.3 * sx * Math.exp(-Math.pow((y - G * 0.5) / 5, 2)) + 0.8 * sx * (1 - smooth(0, G * 0.5, y));
    const cr = creaseAt(side > 0 ? crF : crB, x, y);
    z += (cr + bump2(x * side + (side < 0 ? 31 : 0), y)) * Math.min(1, sx * 1.4) * Math.min(1, sy * 1.5);
    if (side > 0) z += 1.6 * Math.pow(smooth(H - 30, H, y), 2) * sx; // the open mouth lifts a touch
    return side * (0.22 + Math.max(0, z));
  };
  const nx = Math.round(84 * Q), nyF = Math.max(12, Math.min(Math.round(150 * Q), Math.round(nx * H / W * 0.9))), nyB = Math.round(nyF * Ht / H);
  const xs = (i, flip) => { const t = i / nx; const c = (t + (1 - Math.cos(Math.PI * t)) / 2) / 2; return flip ? W / 2 - W * c : -W / 2 + W * c; };
  const front = gridGeo(nx, nyF, (i, j) => { const x = xs(i, false), y = H * j / nyF; return [x, y, zAt(x, y, 1), (x + W / 2) / W * 0.5, y / Ht]; });
  const back = gridGeo(nx, nyB, (i, j) => {
    const x = xs(i, true), y = Ht * j / nyB;
    let z;
    if (y <= H) z = zAt(x, y, -1);
    else { const k = 1 - smooth(H, H + lip * 0.35, y); z = zAt(x, H, -1) * k - 0.22 * (1 - k) + 0.25 * Math.sin(x * 0.05 + 1) * smooth(H, Ht, y); }
    return [x, y, z, 0.5 + (W / 2 - x) / W * 0.5, y / Ht];
  });
  const g = new THREE.Group();
  for (const [geo, panel] of [[back, 'back'], [front, 'front']]) { // back first: equal-depth transparents draw in id order
    const o = new THREE.Mesh(geo, filmMat); o.castShadow = false; o.userData.part = 'bag'; o.userData.flat = true; o.userData.role = 'wOut'; o.userData.panel = panel; g.add(o);
    const i = new THREE.Mesh(geo, filmInMat); i.userData.part = 'bag'; i.userData.role = 'wIn'; i.userData.panel = panel; g.add(i);
  }
  const holeSp = W >= 8 * IN ? 5 * IN : W * 0.55;
  const holeY = H + lip * 0.55, holeR = 6;
  // wire wicket: U-shaped steel wire through both holes, tips bent up
  const pinY = holeY + holeR - 2.2, zb = -34, zf = 30;
  const wpts = [];
  const leg = (x, dir) => { const a = [new THREE.Vector3(x, pinY + 16, zf + 2), new THREE.Vector3(x, pinY + 4, zf), new THREE.Vector3(x, pinY, zf - 6), new THREE.Vector3(x, pinY, 0), new THREE.Vector3(x, pinY, zb + 6), new THREE.Vector3(x + dir * 2, pinY, zb + 1)]; return a; };
  const L = leg(-holeSp / 2, 1), R = leg(holeSp / 2, -1).reverse();
  const path = new THREE.CatmullRomCurve3([...L, new THREE.Vector3(0, pinY, zb), ...R], false, 'catmullrom', 0.2);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(path, Math.round(160 * Q), 1.5, 8, false), wireMat); wire.castShadow = false; wire.userData.part = 'wicket'; g.add(wire);
  return { group: g, meta: { type: 'wicket', W, H, G, Htot: Ht, vLen: Ht, Dmax: Math.max(10, puff * 2 + 6), panelW: W, seal, lip,
    holes: [-holeSp / 2, holeSp / 2], holeY, holeR, perfY: H + 6, pinY,
    face: { x0: seal + 5, x1: W - seal - 5, y0: 8, y1: H - 12 } } };
}

/* BREAD: soft gusseted film around a loaf, gathered + clipped neck, floppy tail */
function buildBread(s) {
  const W = s.w * IN, H = s.h * IN, G = s.g * IN;
  const A = W / 2 - 0.1 * G, B = G / 2 * 1.22;           // filled section half-sizes
  const Hl = H * 0.57;                                     // loaf length inside
  const re = Math.min(B * 0.7, 40);                        // rounded loaf shoulder
  const Hf = Math.min(75, Math.max(38, H * 0.11));         // gathered wedge above the loaf
  const rn = 6, Ln = 10, Lt = Math.min(80, Math.max(42, H * 0.12));
  const hb = Math.min(G * 0.42, Hl * 0.18);                // bottom corner folds
  seed = 41 + Math.round(W + G + H);
  const wr = [];
  for (let k = 0; k < 16; k++) wr.push({ s: rnd() * 2 * Math.PI, y: Hl * (0.1 + 0.8 * rnd()), ang: (rnd() - 0.5) * 2.4, len: 30 + rnd() * 70, w: 3 + rnd() * 6, amp: (rnd() > 0.4 ? -1 : 1) * (0.5 + rnd()) });
  const pk = 11, pPh = rnd() * 6.28;
  const pleat = (th, ph, k = pk) => { const v = Math.abs(Math.sin(k * th / 2 + ph)); return Math.pow(v, 0.8) - 0.55 + 0.25 * Math.sin(th * 3 + ph * 2); };
  // centerline: straight up through the body + neck, then the tail arcs over
  const bend = new THREE.Vector3(0.82, 0, -0.57).normalize(), up = new THREE.Vector3(0, 1, 0);
  const tailM = new THREE.Vector3().crossVectors(bend, up).normalize(); // horizontal, normal to bend plane
  const rows = [];
  const yN = Hl + Hf, yT = yN + Ln;
  const pushRow = (cfg) => rows.push(cfg);
  const M1 = Math.round(130 * Q);
  const y0 = Hl - re;                                       // loaf shoulder starts
  for (let j = 0; j <= M1; j++) { // body (bottom folds + loaf)
    const y = y0 * j / M1;
    let a = A, b = B, n = 3.0;
    const tb = smooth(0, hb, y); b *= 0.55 + 0.45 * Math.sqrt(tb); a *= 1.012 - 0.012 * tb; n = lerp(6, 3.0, tb);
    pushRow({ y, c: new THREE.Vector3(0, y, 0), ex: new THREE.Vector3(1, 0, 0), T: up, a, b, n, pa: 0, ph: pPh, body: true });
  }
  const M2 = Math.round(70 * Q), Ltop = re + Hf;
  for (let j = 1; j <= M2; j++) { // shoulder + gathered wedge: front/back collapse first, width gathers later
    const t = j / M2, y = y0 + Ltop * t;
    const fb = 0.5 * (1 + Math.cos(Math.PI * Math.pow(t, 0.75)));  // gusset direction closes early
    const fa = 0.5 * (1 + Math.cos(Math.PI * Math.pow(t, 1.45)));  // width holds, then gathers
    const a = rn + (A - rn) * fa, b = rn * 0.8 + (B - rn * 0.8) * fb;
    const al = 0.3 * smooth(0.4, 1, t);
    pushRow({ y, c: new THREE.Vector3(0, y, 0), ex: new THREE.Vector3(Math.cos(al), 0, -Math.sin(al)), T: up, a, b, n: lerp(3.0, 2, t),
      pa: 0.38 * Math.pow(smooth(0.15, 1, t), 1.2), ph: pPh + t * 0.7, body: t < 0.5, top: t });
  }
  const M3 = Math.max(4, Math.round(10 * Q));
  for (let j = 1; j <= M3; j++) { // neck (squeezed at the clip)
    const t = j / M3, y = yN + Ln * t; const pinch = 1 - 0.4 * Math.exp(-Math.pow((t - 0.5) / 0.25, 2));
    const al = 0.3 + 0.5 * t;
    pushRow({ y, c: new THREE.Vector3(0, y, 0), ex: new THREE.Vector3(Math.cos(al), 0, -Math.sin(al)), T: up, a: rn * pinch, b: rn * 0.8 * pinch, n: 2, pa: 0.4, ph: pPh + 0.7 + t * 1.0 });
  }
  const M4 = Math.round(40 * Q); let c = new THREE.Vector3(0, yT, 0); const ds = Lt / M4;
  for (let j = 1; j <= M4; j++) { // tail: fans out flat and flops over to one side
    const t = j / M4, phi = 2.0 * Math.pow(t, 1.15);
    const T = up.clone().multiplyScalar(Math.cos(phi)).addScaledVector(bend, Math.sin(phi)).normalize();
    c = c.clone().addScaledVector(T, ds);
    const e = Math.pow(t, 0.45);
    pushRow({ y: yT + Lt * t, c, ex: tailM.clone(), T, a: lerp(rn, Math.max(W * 0.17, 20), e), b: lerp(rn * 0.8, Math.max(W * 0.025, 4), e), n: 2, pa: lerp(0.4, 0.22, t), ph: pPh + 1.7 + t * 0.9, tail: t });
  }
  const vLen = yT + Lt;
  // build the surface
  const cols = N + 1, per = cols * 2, R = rows.length;
  const pos = new Float32Array(R * per * 3), uv = new Float32Array(R * per * 2);
  const P = new THREE.Vector3(), ez = new THREE.Vector3();
  for (let j = 0; j < R; j++) {
    const r = rows[j]; ez.crossVectors(r.ex, r.T).normalize();
    for (let h = 0; h < 2; h++) {
      const base = [];
      for (let i = 0; i <= N; i++) {
        const th = h === 0 ? Math.PI - Math.PI * i / N : -Math.PI * i / N;
        const cth = Math.cos(th), sth = Math.sin(th);
        base.push([r.a * Math.sign(cth) * Math.pow(Math.abs(cth), 2 / r.n), r.b * Math.sign(sth) * Math.pow(Math.abs(sth), 2 / r.n), th]);
      }
      const Ls = [0]; for (let i = 1; i <= N; i++) Ls.push(Ls[i - 1] + Math.hypot(base[i][0] - base[i - 1][0], base[i][1] - base[i - 1][1]));
      const tot = Ls[N] || 1;
      for (let i = 0; i <= N; i++) {
        let [x, z, th] = base[i];
        // 2D outward normal of the base section
        const ip = Math.min(N, i + 1), im = Math.max(0, i - 1);
        let tx = base[ip][0] - base[im][0], tz = base[ip][1] - base[im][1]; let nx = tz, nz = -tx; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
        if (nx * x + nz * z < 0) { nx = -nx; nz = -nz; }
        const rad = Math.hypot(x, z);
        let d = r.pa * rad * pleat(th, r.ph);
        if (r.body) {
          // gathered folds run down from the neck onto the loaf, fading
          const fade = Math.exp(-Math.max(0, Hl - r.y) / (Hl * 0.2));
          d += 2.4 * fade * pleat(th, pPh, 7) * smooth(0, 0.6, Math.abs(Math.sin(th)) + 0.2);
          // loose film wrinkles on the faces
          const sArc = (h * tot + Ls[i]);
          for (const w of wr) {
            const du = (sArc - w.s * tot / Math.PI) , dy = r.y - w.y;
            const ca = Math.cos(w.ang), sa = Math.sin(w.ang);
            const along = du * ca + dy * sa, across = -du * sa + dy * ca;
            if (Math.abs(along) > w.len || Math.abs(across) > w.w * 3) continue;
            d += w.amp * Math.cos(Math.PI * along / (2 * w.len)) * Math.exp(-(across * across) / (w.w * w.w));
          }
          // corner folds at the bottom: a triangle tucked into each gusset end
          if (r.y < hb * 1.4) {
            const gz = Math.abs(x) / A; // ~1 on the gusset sides
            const zz = z / Math.max(1, B), yy = r.y / hb;
            const dist = Math.abs(yy - 1.05 * (1 - Math.abs(zz))) * hb;
            d -= 3.2 * smooth(0.72, 0.95, gz) * Math.exp(-(dist * dist) / 16);
            d -= 1.6 * (1 - smooth(0.6, 0.9, gz)) * Math.exp(-Math.pow((r.y - 3) / 3, 2)); // seal roll at the base
          }
          d += 0.6 * fnoise(x * 2 + h * 50, r.y * 1.5) ;
        }
        if (r.tail !== undefined) d += r.tail * 4 * Math.sin(th * 5 + j * 0.15) ;
        x += nx * d; z += nz * d;
        P.copy(r.c).addScaledVector(r.ex, x).addScaledVector(ez, z);
        if (r.tail !== undefined && r.tail > 0.8) P.addScaledVector(r.T, (r.tail - 0.8) / 0.2 * 9 * (0.5 + 0.5 * Math.sin(th * 4 + 1.3)));
        const k = j * per + h * cols + i;
        pos[k * 3] = P.x; pos[k * 3 + 1] = P.y; pos[k * 3 + 2] = P.z;
        uv[k * 2] = h * 0.5 + (Ls[i] / tot) * 0.5; uv[k * 2 + 1] = Math.min(1, r.y / vLen);
      }
    }
  }
  const idx = [];
  for (let j = 0; j < R - 1; j++) for (let h = 0; h < 2; h++) for (let i = 0; i < N; i++) { const a = j * per + h * cols + i, b = a + 1, cc = a + per, dd = cc + 1; idx.push(a, b, cc, b, dd, cc); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  // weld normals across the two half seams
  { const n = geo.attributes.normal; for (let j = 0; j < R; j++) for (const [p, q] of [[j * per + N, j * per + cols], [j * per, j * per + cols + N]]) { const x = n.getX(p) + n.getX(q), y = n.getY(p) + n.getY(q), z = n.getZ(p) + n.getZ(q), l = Math.hypot(x, y, z) || 1; n.setXYZ(p, x / l, y / l, z / l); n.setXYZ(q, x / l, y / l, z / l); } }
  const g = new THREE.Group();
  const body = new THREE.Mesh(geo, breadMat); body.castShadow = true; body.userData.part = 'bag'; body.userData.role = 'bBody'; body.userData.cast = true; g.add(body);
  const bot = new THREE.Mesh(cap(lensLike(rows[0]), 0.4), plainMat); bot.userData.part = 'bag'; bot.userData.role = 'cap'; g.add(bot);
  // the loaf inside (seen only through clear film): sliced sandwich loaf, crown on the +x gusset side
  { const film = rows.filter((r) => r.body || (r.top !== undefined && r.top < 0.6));
    const fAB = (y) => { let k = 0; while (k < film.length - 1 && film[k + 1].y < y) k++; const r0 = film[k], r1 = film[Math.min(film.length - 1, k + 1)]; const t = r1.y > r0.y ? Math.min(1, Math.max(0, (y - r0.y) / (r1.y - r0.y))) : 0; return [lerp(r0.a, r1.a, t), lerp(r0.b, r1.b, t)]; };
    const yb = 2.5, yt = y0 + re * 0.35, len = yt - yb, rh = Math.min(B * 0.55, 28);
    const MS = Math.max(24, Math.round(56 * Q)), MR = Math.max(16, Math.round(60 * Q));
    const lp = new Float32Array((MR + 1) * (MS + 1) * 3), lu = new Float32Array((MR + 1) * (MS + 1) * 2);
    for (let j = 0; j <= MR; j++) {
      const tj = j / MR, y = yb + len * (0.5 - 0.5 * Math.cos(Math.PI * tj));
      const dEnd = Math.min(y - yb, yt - y); const e = dEnd >= rh ? 1 : Math.cbrt(Math.max(0, 1 - Math.pow(1 - dEnd / rh, 3))); // flat heels, rounded edges, closed ends
      const [fa, fb] = fAB(y); const a = Math.min(A * 0.95, fa - 4) * e, b = Math.min(B * 0.93, fb - 4) * e;
      for (let i = 0; i <= MS; i++) {
        const th = 2 * Math.PI * i / MS, c = Math.cos(th), sn = Math.sin(th);
        const n = c > 0 ? lerp(3.6, 1.9, c) : 3.6; // rounded crown on +x, squarer pan sides
        const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * (c > 0 ? 1 + 0.06 * c * c : 1), z = b * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / n);
        const k = j * (MS + 1) + i; lp[k * 3] = x + 0.5 * fnoise(y * 3, th * 40); lp[k * 3 + 1] = y; lp[k * 3 + 2] = z; lu[k * 2] = i / MS; lu[k * 2 + 1] = (y - yb) / len;
      }
    }
    const li = []; for (let j = 0; j < MR; j++) for (let i = 0; i < MS; i++) { const a = j * (MS + 1) + i, b2 = a + 1, c2 = a + MS + 1, d2 = c2 + 1; li.push(a, c2, b2, b2, c2, d2); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('uv', new THREE.BufferAttribute(lu, 2)); lg.setIndex(li); lg.computeVertexNormals();
    const loaf = new THREE.Mesh(lg, loafMat); loaf.userData.part = 'bag'; loaf.userData.role = 'loaf'; loaf.castShadow = true; loaf.visible = false; g.add(loaf);
  }
  // plastic bread clip (flat tab with a slot) squeezing the neck
  const cw = Math.min(36, Math.max(24, W * 0.15)), chh = cw * 0.9, hr = rn * 0.55;
  const sh = new THREE.Shape();
  sh.moveTo(-cw / 2 + 3, -chh / 2); sh.lineTo(cw / 2 - 3, -chh / 2); sh.quadraticCurveTo(cw / 2, -chh / 2, cw / 2, -chh / 2 + 3); sh.lineTo(cw / 2, chh / 2 - 3); sh.quadraticCurveTo(cw / 2, chh / 2, cw / 2 - 3, chh / 2);
  sh.lineTo(1.6, chh / 2); sh.lineTo(0.9, hr + 1.2); sh.absarc(0, 0, hr, Math.PI / 2 - 0.25, Math.PI / 2 + 0.25 - 2 * Math.PI, true); sh.lineTo(-1.6, chh / 2);
  sh.lineTo(-cw / 2 + 3, chh / 2); sh.quadraticCurveTo(-cw / 2, chh / 2, -cw / 2, chh / 2 - 3); sh.lineTo(-cw / 2, -chh / 2 + 3); sh.quadraticCurveTo(-cw / 2, -chh / 2, -cw / 2 + 3, -chh / 2);
  const cg = new THREE.ExtrudeGeometry(sh, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.35, bevelSegments: 2, curveSegments: 18 });
  cg.translate(0, -0, -0.65);
  const clip = new THREE.Mesh(cg, clipMat2); clip.castShadow = true; clip.userData.part = 'bag';
  clip.position.set(0, yN + Ln * 0.5, 0); clip.rotation.set(-Math.PI / 2 + 0.42, 0.1, 0); g.add(clip);
  // P = half perimeter of the body section (atlas width)
  let Pw = 0; { const r = rows[Math.round(M1 * 0.5)]; let px = null; for (let i = 0; i <= N; i++) { const th = Math.PI - Math.PI * i / N, ct = Math.cos(th), st = Math.sin(th); const q = [r.a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / r.n), r.b * Math.sign(st) * Math.pow(Math.abs(st), 2 / r.n)]; if (px) Pw += Math.hypot(q[0] - px[0], q[1] - px[1]); px = q; } }
  geo.computeBoundingBox(); const bb = geo.boundingBox;
  const Dmax = (bb.max.z - bb.min.z);
  return { group: g, meta: { type: 'bread', W, H, G, Htot: bb.max.y, vLen, Dmax: Math.max(Dmax, B * 2), panelW: Pw, Hb: y0, Hd: Hl, Hn: yN + Ln * 0.5, yT,
    face: { x0: (Pw - 2 * A) / 2 + 8, x1: (Pw + 2 * A) / 2 - 8, y0: hb * 0.7 + 6, y1: y0 + re * 0.25 } } };
}
function lensLike(r) { // superellipse ring of a row for the bottom cap
  const front = [], back = [];
  for (let i = 0; i <= N; i++) { const th = Math.PI - Math.PI * i / N, c = Math.cos(th), s = Math.sin(th); front.push([r.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / r.n), r.b * Math.sign(s) * Math.pow(Math.abs(s), 2 / r.n)]); }
  for (let i = 0; i <= N; i++) { const th = -Math.PI * i / N, c = Math.cos(th), s = Math.sin(th); back.push([r.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / r.n), r.b * Math.sign(s) * Math.pow(Math.abs(s), 2 / r.n)]); }
  return { front, back };
}
const breadMat = filmMat.clone(); breadMat.side = THREE.DoubleSide; breadMat.map = atlasTex; breadMat.bumpMap = bumpTex;


/* ================= v7: the rest of Metro's range =================
   flat two-layer bags (die-cut, door knob, header, tape, flip-top, staple pack, mailer, flat pouch),
   block-bottom pouches (box pouch, quad seal) and rollstock. All share the print atlas, film colours and clear film. */
const flapMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.32, envMapIntensity: 0.75, side: THREE.DoubleSide });
const flapClear = new THREE.MeshPhysicalMaterial({ color: 0xe9eef2, roughness: 0.22, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.1 });
const finMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.18, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.8, side: THREE.DoubleSide });
const boxBotC = document.createElement('canvas'); boxBotC.width = boxBotC.height = 256;
(() => { const g = boxBotC.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(0,0,0,0.10)'; g.lineWidth = 6; g.strokeRect(5, 5, 246, 246);
  g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 2; // the folded corners of a block bottom
  for (const [x, y, dx, dy] of [[0, 0, 1, 1], [256, 0, -1, 1], [0, 256, 1, -1], [256, 256, -1, -1]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx * 70, y + dy * 128); g.stroke(); }
  g.beginPath(); g.moveTo(70, 128); g.lineTo(186, 128); g.stroke(); })();
const boxBotTex = new THREE.CanvasTexture(boxBotC); boxBotTex.colorSpace = THREE.SRGBColorSpace;
const boxBotMat = new THREE.MeshPhysicalMaterial({ map: boxBotTex, color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.18, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.8, side: THREE.DoubleSide });
const cardC = document.createElement('canvas'); cardC.width = 512; cardC.height = 512; const cardTex = new THREE.CanvasTexture(cardC); cardTex.colorSpace = THREE.SRGBColorSpace;
const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.82, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide, envMapIntensity: 0.5 });
const chipC = document.createElement('canvas'); chipC.width = 512; chipC.height = 128; const chipTex = new THREE.CanvasTexture(chipC); chipTex.colorSpace = THREE.SRGBColorSpace;
const chipMat = new THREE.MeshStandardMaterial({ map: chipTex, roughness: 0.9, metalness: 0, alphaTest: 0.5, envMapIntensity: 0.4 });
const stapleMat = new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 1, roughness: 0.3, envMapIntensity: 1.1 });
// rollstock: one print repeat, tiled along the web
const RCW = 2048, RCH = 1024;
const rollC = document.createElement('canvas'); rollC.width = RCW; rollC.height = RCH; const rctx = rollC.getContext('2d');
const rollTex = new THREE.CanvasTexture(rollC); rollTex.colorSpace = THREE.SRGBColorSpace; rollTex.wrapS = THREE.RepeatWrapping; rollTex.anisotropy = maxAniso;
const rollOpC = document.createElement('canvas'); rollOpC.width = RCW; rollOpC.height = RCH;
const rollOpTex = new THREE.CanvasTexture(rollOpC); rollOpTex.colorSpace = THREE.SRGBColorSpace; rollOpTex.wrapS = THREE.RepeatWrapping; rollOpTex.anisotropy = maxAniso;
const rollSheetMat = new THREE.MeshPhysicalMaterial({ map: rollTex, roughness: 0.6, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.45, envMapIntensity: 0.42, side: THREE.DoubleSide });
const rollSheetClear = makeClearMat(THREE.DoubleSide, 1, 0); rollSheetClear.map = rollTex; rollSheetClear.forceSinglePass = true;
const rollMat = new THREE.MeshPhysicalMaterial({ map: rollOpTex, roughness: 0.3, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.18, envMapIntensity: 0.85 });
const ringC = document.createElement('canvas'); ringC.width = ringC.height = 512; const ringTex = new THREE.CanvasTexture(ringC); ringTex.colorSpace = THREE.SRGBColorSpace;
const ringMat = new THREE.MeshPhysicalMaterial({ map: ringTex, color: 0xffffff, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.8 });
const coreMat = new THREE.MeshStandardMaterial({ color: 0xb48a5c, roughness: 0.88, metalness: 0, envMapIntensity: 0.4 });
const coreInMat = new THREE.MeshStandardMaterial({ color: 0x7d5c3a, roughness: 0.95, metalness: 0, side: THREE.BackSide, envMapIntensity: 0.2 });
Object.assign(FILM, { flap: () => [flapMat, flapClear], fin: () => [finMat, clearCap], bcap: () => [boxBotMat, clearCap], rSheet: () => [rollSheetMat, rollSheetClear], rRoll: () => [rollMat, rollMat], rEnd: () => [ringMat, ringMat] });

/* two flat films welded at the sides (and bottom); the back film may run up above the front (lip, hanger, flap) */
function flatPanels(o) {
  const { W, Hf, Hb } = o, Hm = o.Hm || Math.max(Hf, Hb), seal = o.seal, bot = o.bot ?? 3, puff = o.puff;
  seed = o.seed || (31 + Math.round(W + Hf));
  const crF = makeCreases(o.crN ?? 9, W, Hf, { amp: o.crAmp ?? 1.2 }), crB = makeCreases(o.crN ?? 9, W, Hf, { amp: (o.crAmp ?? 1.2) * 0.9 });
  const bump2 = (x, y) => 0.3 * fnoise(x * 1.7, y * 1.3) + 0.2 * Math.sin(y * 0.09 + x * 0.02);
  const zAt = (x, y, side) => {
    const ex = W / 2 - Math.abs(x);
    const sx = smooth(seal * 0.9, seal + Math.min(W * 0.2, 40), ex);
    const sy = smooth(bot * 0.9, bot + Math.max(12, Hf * 0.07), y);
    const st = o.topSeal ? 1 - smooth(Hf - o.topSeal - Math.max(12, Hf * 0.07), Hf - o.topSeal * 0.9, y) : 1 - (o.topEase ?? 0.35) * smooth(Hf * 0.55, Hf, y);
    let z = puff * Math.sqrt(sx) * sy * st;
    z += (creaseAt(side > 0 ? crF : crB, x, y) + bump2(x * side + (side < 0 ? 31 : 0), y)) * (o.wrinkle ?? 1) * Math.min(1, sx * 1.4) * Math.min(1, sy * 1.5) * (o.topSeal ? st : 1);
    if (!o.topSeal && side > 0 && o.mouthLift) z += o.mouthLift * Math.pow(smooth(Hf - 30, Hf, y), 2) * sx;
    return side * (0.22 + Math.max(0, z));
  };
  const nx = Math.round(84 * Q), nyF = Math.max(12, Math.min(Math.round(150 * Q), Math.round(nx * Hf / W * 0.9))), nyB = Math.max(nyF, Math.round(nyF * Hb / Hf));
  const xs = (i, flip) => { const t = i / nx; const c = (t + (1 - Math.cos(Math.PI * t)) / 2) / 2; return flip ? W / 2 - W * c : -W / 2 + W * c; };
  const front = gridGeo(nx, nyF, (i, j) => { const x = xs(i, false), y = Hf * j / nyF; return [x, y, zAt(x, y, 1), (x + W / 2) / W * 0.5, y / Hm]; });
  const ext = Hb - Hf;
  const back = gridGeo(nx, nyB, (i, j) => {
    const x = xs(i, true), y = Hb * j / nyB;
    let z;
    if (y <= Hf || ext < 0.5) z = zAt(x, Math.min(y, Hf), -1);
    else { const k = 1 - smooth(Hf, Hf + Math.min(20, ext * 0.35), y); z = zAt(x, Hf, -1) * k - 0.22 * (1 - k) + (o.extZ ? o.extZ(x, y) : 0.2 * Math.sin(x * 0.05 + 1) * smooth(Hf, Hb, y)); }
    return [x, y, z, 0.5 + (W / 2 - x) / W * 0.5, y / Hm];
  });
  const g = new THREE.Group();
  for (const [geo, panel] of [[back, 'back'], [front, 'front']]) {
    const m = new THREE.Mesh(geo, filmMat); m.userData.part = 'bag'; m.userData.flat = true; m.userData.role = 'wOut'; m.userData.panel = panel; g.add(m);
    const i = new THREE.Mesh(geo, filmInMat); i.userData.part = 'bag'; i.userData.role = 'wIn'; i.userData.panel = panel; g.add(i);
  }
  return { g, zAt, Hm };
}
/* a film flap that rises from one panel's top edge, folds over the mouth and lies down over the other panel */
function foldFlap(W, Hf, F, from, zAt, seal) {
  const nx = Math.round(60 * Q), ny = Math.max(10, Math.round(46 * Q)), rf = 0.9, arc = Math.PI * rf, tot = arc + F;
  const geo = gridGeo(nx, ny, (i, j) => {
    const x = -W / 2 + W * i / nx, s = tot * j / ny;
    let y, z;
    if (s <= arc) { const a = s / rf; y = Hf + rf * Math.sin(a) * 1.4; z = from * rf * Math.cos(a); }
    else { y = Hf - (s - arc); const zt = zAt(x, Math.max(y, 0), -from) - from * 0.38; const k = smooth(0, 7, s - arc); z = -from * rf * (1 - k) + zt * k; }
    const edge = smooth(0, seal + 4, W / 2 - Math.abs(x));
    z += -from * 0.25 * Math.sin(x * 0.07 + 1.3) * smooth(arc, tot, s) * edge; // a soft wave in the flap
    return [x, y, z, (x + W / 2) / W, s / tot];
  });
  const m = new THREE.Mesh(geo, flapMat); m.userData.part = 'bag'; m.userData.role = 'flap'; return m;
}
const sealsLR = (W, H, seal, bot) => [[0, 0, seal, H], [W - seal, 0, W, H], [0, 0, W, bot]];

function buildFlatPouch(s) { // three-side seal sachet: crimped side + bottom seals, sealed top with hang hole, tear notch
  const W = s.w * IN, H = s.h * IN, seal = Math.min(9.5, W * 0.09), topSeal = Math.min(22, H * 0.17), bot = seal;
  const puff = Math.min(W, H) * 0.03;
  const fp = flatPanels({ W, Hf: H, Hb: H, seal, bot, puff, topSeal, crN: 5, crAmp: 0.6, wrinkle: 0.5 });
  const holeR = Math.min(4, topSeal * 0.2), holeY = H - topSeal * 0.52, notchY = H - topSeal - 5;
  return { group: fp.g, meta: { type: 'flat', flat2: true, W, H, G: 0, Htot: H, vLen: H, Dmax: 2 * (0.22 + puff) + 3, panelW: W, seal,
    seals: [...sealsLR(W, H, seal, bot), [0, H - topSeal, W, H]],
    cuts: [{ k: 'circle', x: 0, y: holeY, r: holeR }, { k: 'notch', x: -W / 2, y: notchY }, { k: 'notch', x: W / 2, y: notchY }],
    hang: { xs: [0], y: holeY + holeR }, shelf: 'hook',
    face: { x0: seal + 3, x1: W - seal - 3, y0: bot + 3, y1: H - topSeal - 3 } } };
}
function buildDieCut(s) { // FLAT: two layers, sealed sides + bottom, open top, punched oval handle through both. No gusset, no floor.
  const W = s.w * IN, H = s.h * IN, seal = 3.5, bot = 4;
  const fp = flatPanels({ W, Hf: H, Hb: H, seal, bot, puff: 0.8, crN: 10, crAmp: 1.0, mouthLift: 0.5, topEase: 0.2 });
  const hw = Math.min(3.75 * IN, W * 0.38), hh = Math.min(1.15 * IN, H * 0.085), hy = H - Math.min(1.55 * IN, H * 0.115);
  return { group: fp.g, meta: { type: 'diecut', flat2: true, W, H, G: 0, Htot: H, vLen: H, Dmax: 4, panelW: W, seal,
    seals: sealsLR(W, H, seal, bot), cuts: [{ k: 'oval', x: 0, y: hy, w: hw, h: hh }],
    hang: { xs: [0], y: hy + hh / 2 }, shelf: 'hook',
    face: { x0: seal + 10, x1: W - seal - 10, y0: bot + 10, y1: hy - hh / 2 - 14 } } };
}
function buildDoorKnob(s) { // flat bag, the back film runs up into a hanger with a knob hole and slit
  const W = s.w * IN, H = s.h * IN, Hh = (s.g || 4) * IN, Hb = H + Hh, seal = 3.5, bot = 4;
  const fp = flatPanels({ W, Hf: H, Hb, seal, bot, puff: 1.0, crN: 9, mouthLift: 0.9 });
  const r = Math.min(30, W * 0.18, Hh * 0.3), cy = H + Hh * 0.55, a = 0.85;
  const sx0 = r * Math.cos(a), sy0 = cy + r * Math.sin(a), t = (Hb - sy0) / Math.sin(1.0);
  return { group: fp.g, meta: { type: 'doorknob', flat2: true, W, H, G: 0, Htot: Hb, vLen: Hb, Dmax: 5, panelW: W, seal, lipV: (H + 0.5) / Hb, artTop: H,
    seals: sealsLR(W, H, seal, bot), cuts: [{ k: 'circle', x: 0, y: cy, r }, { k: 'slit', pts: [[sx0, sy0], [sx0 + t * Math.cos(1.0), Hb + 2]], w: 1.6 }],
    hang: { xs: [0], y: cy + r }, shelf: 'hook',
    face: { x0: seal + 8, x1: W - seal - 8, y0: bot + 8, y1: H - 14 } } };
}
function buildHeader(s) { // flat bag with a folded card header stapled over the top, euro-slot hang hole
  const W = s.w * IN, H = s.h * IN, Hc = (s.g || 2) * IN, ov = Math.min(0.6 * IN, Hc * 0.35), seal = 3.5, bot = 4;
  const fp = flatPanels({ W, Hf: H, Hb: H, seal, bot, puff: 1.4, crN: 8, topSeal: ov + 2 });
  const yb = H - ov, yt = yb + Hc, ct = 0.9, arc = Math.PI * ct, Lp = 2 * Hc + arc;
  const hy = yt - Math.min(13, Hc * 0.3);
  const g = fp.g;
  { // the card: up the front, round the fold, down the back
    const nx = Math.round(40 * Q), ny = Math.round(60 * Q);
    const geo = gridGeo(nx, ny, (i, j) => { const x = -W / 2 + W * i / nx, sp = Lp * j / ny; let y, z;
      if (sp <= Hc) { y = yb + sp; z = ct; } else if (sp <= Hc + arc) { const q = (sp - Hc) / ct; y = yt + ct * Math.sin(q) * 0.8; z = ct * Math.cos(q); } else { y = yt - (sp - Hc - arc); z = -ct; }
      return [x, y, z, (x + W / 2) / W, sp / Lp]; });
    const c = new THREE.Mesh(geo, cardMat); c.castShadow = true; c.userData.part = 'bag'; c.userData.cast = true; g.add(c);
    const cg = cardC.getContext('2d'); cg.clearRect(0, 0, 512, 512); cg.fillStyle = '#fbfaf6'; cg.fillRect(0, 0, 512, 512);
    seed = 77; for (let k = 0; k < 900; k++) { cg.fillStyle = `rgba(${rnd() > 0.5 ? '0,0,0' : '255,255,255'},0.035)`; cg.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    const V = (sp) => (1 - sp / Lp) * 512, U = (x) => (x + W / 2) / W * 512;
    { const gr = cg.createLinearGradient(0, V(Hc + arc), 0, V(Hc)); gr.addColorStop(0, 'rgba(0,0,0,0.06)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.06)'); cg.fillStyle = gr; cg.fillRect(0, V(Hc + arc), 512, V(Hc) - V(Hc + arc)); }
    cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000';
    for (const sp of [hy - yb, Lp - (hy - yb)]) { // same hole through front and back of the card
      const sw = Math.min(16, W * 0.16), sh = 2.2, cr = 4.2, sy = sp + (sp < Lp / 2 ? 1 : -1) * 0; const up = sp < Lp / 2 ? 1 : -1;
      cg.beginPath(); cg.ellipse(U(0), V(sp + up * 2.6), cr / W * 512, cr / Lp * 512, 0, 0, 6.3); cg.fill();
      cg.beginPath(); cg.ellipse(U(-sw + sh), V(sy), sh / W * 512, sh / Lp * 512, 0, 0, 6.3); cg.ellipse(U(sw - sh), V(sy), sh / W * 512, sh / Lp * 512, 0, 0, 6.3); cg.fill();
      cg.fillRect(U(-sw + sh), V(sy + sh), U(sw - sh) - U(-sw + sh), V(sy - sh) - V(sy + sh));
    }
    cg.globalCompositeOperation = 'source-over'; cardTex.needsUpdate = true;
    // two staples through card + bag
    const sg = new THREE.BoxGeometry(11, 0.7, 0.45);
    for (const x of [-Math.min(W * 0.3, 45), Math.min(W * 0.3, 45)]) for (const z of [ct + 0.25, -ct - 0.25]) { const st = new THREE.Mesh(sg, stapleMat); st.position.set(x, yb + Math.min(ov * 0.45, 7), z); st.userData.part = 'bag'; g.add(st); }
  }
  return { group: g, meta: { type: 'header', flat2: true, W, H, G: 0, Htot: yt + ct, vLen: H, Dmax: 6, panelW: W, seal,
    seals: sealsLR(W, H, seal, bot), cuts: [], hang: { xs: [0], y: hy + 7 }, shelf: 'hook',
    face: { x0: seal + 6, x1: W - seal - 6, y0: bot + 6, y1: yb - 6 } } };
}
function buildTape(s) { // flat bag, the back film runs up into an open flap with a resealable tape strip (release liner on)
  const W = s.w * IN, H = s.h * IN, F = (s.g || 1.5) * IN, Hb = H + F, seal = 3, bot = 3;
  const fp = flatPanels({ W, Hf: H, Hb, seal, bot, puff: 1.6, crN: 8, mouthLift: 0.8, extZ: (x, y) => -4 * Math.pow((y - H) / F, 2) });
  const ty0 = H + F * 0.42, ty1 = ty0 + Math.min(11, F * 0.3);
  return { group: fp.g, meta: { type: 'tape', flat2: true, W, H, G: 0, Htot: Hb, vLen: Hb, Dmax: 10, panelW: W, seal, lipV: (H + 0.5) / Hb, artTop: H,
    seals: sealsLR(W, H, seal, bot), cuts: [], shelf: 'stack', tape: { y0: ty0, y1: ty1, x0: 5, x1: W - 5 },
    face: { x0: seal + 6, x1: W - seal - 6, y0: bot + 6, y1: H - 12 } } };
}
function buildFlip(s) { // shirt-bag style: the back film's flap folds over the mouth and lies down over the front
  const W = s.w * IN, H = s.h * IN, F = Math.min((s.g || 2.5) * IN, H * 0.35), seal = 3, bot = 3;
  const fp = flatPanels({ W, Hf: H, Hb: H, seal, bot, puff: 2.0, crN: 9, topEase: 0.55 });
  fp.g.add(foldFlap(W, H, F, -1, fp.zAt, seal));
  return { group: fp.g, meta: { type: 'fliptop', flat2: true, W, H, G: 0, Htot: H + 1.3, vLen: H, Dmax: 8, panelW: W, seal,
    seals: sealsLR(W, H, seal, bot), cuts: [], shelf: 'stack', flapEdge: { col: 0, y: H - F },
    face: { x0: seal + 6, x1: W - seal - 6, y0: bot + 6, y1: H - F - 8 } } };
}
function buildMailer(s) { // flat poly mailer: clean front, self-seal flap folded over onto the back
  const W = s.w * IN, H = s.h * IN, F = (s.g || 2) * IN, seal = 4, bot = 4;
  const fp = flatPanels({ W, Hf: H, Hb: H, seal, bot, puff: 0.7, crN: 7, crAmp: 0.6, wrinkle: 0.5, topEase: 0.5 });
  fp.g.add(foldFlap(W, H, F, 1, fp.zAt, seal));
  return { group: fp.g, meta: { type: 'mailer', flat2: true, W, H, G: 0, Htot: H + 1.3, vLen: H, Dmax: 4, panelW: W, seal,
    seals: sealsLR(W, H, seal, bot), cuts: [], shelf: 'stack', flapEdge: { col: 1, y: H - F },
    face: { x0: seal + 10, x1: W - seal - 10, y0: bot + 10, y1: H - 14 } } };
}
function buildStaple(s) { // a pad of flat bags, their lips stapled between two chipboard strips, two hang holes
  const W = s.w * IN, H = s.h * IN, lip = (s.g || 1.5) * IN, Hb = H + lip, seal = 3, bot = 3, NPAD = Q < 1 ? 3 : 8, gap = (Q < 1 ? 2.2 : 0.9);
  const fp = flatPanels({ W, Hf: H, Hb, seal, bot, puff: 0.5, crN: 7, wrinkle: 0.7, mouthLift: 0.3, extZ: () => 0 });
  const g = fp.g; const one = g.children.slice();
  for (let k = 1; k < NPAD; k++) for (const m of one) { const c = new THREE.Mesh(m.geometry, m.material); c.userData = { ...m.userData }; c.position.z = -k * gap; c.position.y = -k * 0.15; g.add(c); }
  const hs = W >= 8 * IN ? 4 * IN : W * 0.5, hy = H + lip * 0.55, hr = 5;
  const c0 = H + 2, c1 = Hb - 1, ch = c1 - c0;
  const cg = chipC.getContext('2d'); cg.clearRect(0, 0, 512, 128); cg.fillStyle = '#b8a587'; cg.fillRect(0, 0, 512, 128);
  seed = 91; for (let k = 0; k < 1400; k++) { cg.fillStyle = `rgba(${rnd() > 0.5 ? '60,45,25' : '255,250,235'},${0.08 + rnd() * 0.08})`; cg.fillRect(rnd() * 512, rnd() * 128, 1 + rnd() * 3, 1 + rnd() * 2); }
  cg.globalCompositeOperation = 'destination-out'; cg.fillStyle = '#000';
  for (const x of [-hs / 2, hs / 2]) { cg.beginPath(); cg.ellipse((x + W / 2) / W * 512, (1 - (hy - c0) / ch) * 128, hr / W * 512, hr / ch * 128, 0, 0, 6.3); cg.fill(); }
  cg.globalCompositeOperation = 'source-over'; chipTex.needsUpdate = true;
  const zf = 0.9, zb = -(NPAD - 1) * gap - 0.9;
  for (const z of [zf, zb]) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, ch, 1.1), chipMat); b.position.set(0, c0 + ch / 2, z); b.castShadow = true; b.userData.part = 'bag'; b.userData.cast = true; g.add(b); }
  const sg = new THREE.BoxGeometry(12, 0.75, 0.5);
  for (const x of [-Math.min(W * 0.32, 60), Math.min(W * 0.32, 60)]) for (const z of [zf + 0.8, zb - 0.8]) { const st = new THREE.Mesh(sg, stapleMat); st.position.set(x, c0 + ch * 0.22, z); st.userData.part = 'bag'; g.add(st); }
  return { group: g, meta: { type: 'staple', flat2: true, W, H, G: 0, Htot: Hb, vLen: Hb, Dmax: -zb + 3, panelW: W, seal, lipV: (H + 0.5) / Hb, artTop: H,
    seals: sealsLR(W, H, seal, bot), cuts: [{ k: 'circle', x: -hs / 2, y: hy, r: hr }, { k: 'circle', x: hs / 2, y: hy, r: hr }],
    hang: { xs: [-hs / 2, hs / 2], y: hy + hr }, shelf: 'hook', perfY: H + 5,
    face: { x0: seal + 6, x1: W - seal - 6, y0: bot + 6, y1: H - 10 } } };
}

/* block-bottom pouches: rectangular section (superellipse), flat floor, gussets fold in toward a flat top seal */
function loftU(rows) { // rows: { y, v, front: [[x,z,u]], back: [[x,z,u]] } with u given
  const cols = N + 1, per = cols * 2, M = rows.length;
  const pos = new Float32Array(M * per * 3), uv = new Float32Array(M * per * 2);
  for (let j = 0; j < M; j++) { const r = rows[j];
    for (let h = 0; h < 2; h++) { const pts = h === 0 ? r.front : r.back;
      for (let i = 0; i < cols; i++) { const k = j * per + h * cols + i; pos[k * 3] = pts[i][0]; pos[k * 3 + 1] = r.y; pos[k * 3 + 2] = pts[i][1]; uv[k * 2] = pts[i][2]; uv[k * 2 + 1] = r.v; } } }
  const idx = [];
  for (let j = 0; j < M - 1; j++) for (let h = 0; h < 2; h++) for (let i = 0; i < N; i++) { const a = j * per + h * cols + i, b = a + 1, c = a + per, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function sePt(a, b, n, th) { const c = Math.cos(th), s = Math.sin(th); return [a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]; }
function boxHalf(a, b, n, front, P0, dz) { // N+1 points evenly spaced along the half section, u from the panel centre outward
  const K = 360, pts = [], L = [0];
  for (let k = 0; k <= K; k++) { const th = front ? Math.PI - Math.PI * k / K : -Math.PI * k / K; pts.push(sePt(a, b, n, th)); if (k) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])); }
  const tot = L[K], out = []; let q = 0;
  for (let i = 0; i <= N; i++) { const s = tot * i / N; while (q < K - 1 && L[q + 1] < s) q++; const t = (s - L[q]) / Math.max(1e-6, L[q + 1] - L[q]);
    let x = lerp(pts[q][0], pts[q + 1][0], t), z = lerp(pts[q][1], pts[q + 1][1], t);
    const w = Math.max(0, 1 - Math.pow(Math.abs(x) / a, 6)); if (dz) z += Math.sign(z || (front ? 1 : -1)) * dz(x) * w;
    out.push([x, z, (front ? 0.25 : 0.75) + (s - tot / 2) / (2 * P0)]); }
  return out;
}
function buildBlock(s, quad) {
  const W = s.w * IN, H = s.h * IN, G = s.g * IN, a = W / 2, b0 = G / 2;
  const topSeal = Math.min(quad ? 12 : 10, H * 0.06), yTop = H - topSeal, zipY = quad ? 0 : H - Math.min(30, H * 0.12);
  const fold = Math.max(G * 0.7, 22), n0 = quad ? 14 : 9;
  const P0 = (() => { let p = 0, pr = null; for (let k = 0; k <= 400; k++) { const q = sePt(a, b0, n0, Math.PI - Math.PI * k / 400); if (pr) p += Math.hypot(q[0] - pr[0], q[1] - pr[1]); pr = q; } return p; })();
  const rows = [], M = Math.round(170 * Q), bel = Math.min(W, H) * 0.035;
  const bAt = (y) => { const tf = smooth(yTop - fold, yTop, y); return { b: b0 * (1 - tf) * (1 + 0.03 * Math.sin(Math.PI * y / H)) + 0.45 * tf, tf }; };
  for (let j = 0; j <= M; j++) {
    const y = H * j / M, { b, tf } = bAt(y); const n = lerp(n0, 2.4, Math.pow(tf, 0.7));
    const dz = (x) => (bel * (1 - Math.pow(x / a, 2)) * (1 - tf) * smooth(0, 18, y) + (zipY ? 1.5 * Math.exp(-Math.pow((y - zipY) / 1.7, 2)) : 0)) * (1 - smooth(yTop - 4, yTop, y)) + 0.35 * fnoise(x, y) * (1 - tf);
    rows.push({ y, v: y / H, front: boxHalf(a, b, n, true, P0, dz), back: boxHalf(a, b, n, false, P0, dz) });
  }
  const g = new THREE.Group();
  const body = new THREE.Mesh(loftU(rows), bodyMat); body.castShadow = true; body.userData.role = 'pBody'; body.userData.cast = true; g.add(body);
  const bottom = new THREE.Mesh(cap(rows[0], 0.05), boxBotMat); bottom.userData.role = 'bcap'; g.add(bottom);
  if (quad) { // four vertical corner seals (fins) running the full height
    const fw = Math.min(5, W * 0.05), ny = Math.round(80 * Q);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const geo = gridGeo(1, ny, (i, j) => { const y = (yTop + topSeal * 0.6) * j / ny, { b, tf } = bAt(y); const n = lerp(n0, 2.4, Math.pow(tf, 0.7));
        const c = sePt(a, b, n, Math.atan2(sz, sx)); const dx = sx * 0.62, dzz = sz * 0.78 * (1 - tf) + 0.0;
        const l = Math.hypot(dx, dzz) || 1; return [c[0] + dx / l * fw * i * 0.98, Math.max(0.3, y), c[1] + dzz / l * fw * i, i, y / H]; });
      const f = new THREE.Mesh(geo, finMat); f.userData.role = 'fin'; g.add(f);
    }
  }
  return { group: g, meta: { type: quad ? 'quad' : 'box', W, H, G, Htot: H, Dmax: G + (quad ? 10 : 4), panelW: P0, seal: 2, topSeal, zipY: zipY || undefined, block: true,
    seals: [[0, H - topSeal, P0, H]],
    face: { x0: P0 / 2 - W / 2 + 6, x1: P0 / 2 + W / 2 - 6, y0: 8, y1: (zipY || yTop) - 10 } } };
}

/* rollstock: a roll of printed film on a kraft core; a length of web runs off the top and lies on the table showing the repeats */
function buildRoll(s, zip) {
  const Ww = s.w * IN, rep = s.h * IN, R = Math.max(45, s.g * IN / 2), rc = 44, ri = 38, cx = 6;
  const zipZ = -(Ww / 2 - Math.min(26, Ww * 0.12)), zband = (z) => (zip ? Math.exp(-Math.pow((z - zipZ) / 4.5, 4)) : 0);
  const Lf = rep * 2.25;
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  // roll surface (axis along z, resting on the table), printed outside
  const nT = Math.round(150 * Q), nZ = Math.round(60 * Q) + (zip ? 30 : 0);
  const zz = (j) => { const t = j / nZ; return Ww / 2 - Ww * t; };
  const rollGeo = gridGeo(nT, nZ, (i, j) => { const th = -Math.PI + 2 * Math.PI * i / nT, z = zz(j), r = R + 3.5 * zband(z); return [r * Math.sin(th), R + r * Math.cos(th), z, R * th / rep, (Ww / 2 - z) / Ww]; });
  const roll = new THREE.Mesh(rollGeo, rollMat); roll.castShadow = true; roll.userData.role = 'rRoll'; roll.userData.cast = true; inner.add(roll);
  // wound edges: concentric film layers, then the core
  const rg = ringC.getContext('2d'); rg.clearRect(0, 0, 512, 512); rg.fillStyle = '#fff'; rg.fillRect(0, 0, 512, 512);
  seed = 13; for (let rr = rc; rr < R; rr += 0.55) { rg.strokeStyle = `rgba(0,0,0,${0.03 + rnd() * 0.06})`; rg.lineWidth = 0.6; rg.beginPath(); rg.arc(256, 256, rr / R * 256, 0, 6.3); rg.stroke(); }
  { const gr = rg.createRadialGradient(256, 256, rc / R * 256, 256, 256, 256); gr.addColorStop(0, 'rgba(0,0,0,0.10)'); gr.addColorStop(0.6, 'rgba(0,0,0,0)'); gr.addColorStop(0.97, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0.15)'); rg.fillStyle = gr; rg.fillRect(0, 0, 512, 512); }
  ringTex.needsUpdate = true;
  for (const side of [1, -1]) {
    const e = new THREE.Mesh(new THREE.RingGeometry(rc, R, 96, 1), ringMat); e.userData.role = 'rEnd'; e.userData.cast = true;
    e.position.set(0, R, side * Ww / 2); if (side < 0) e.rotation.y = Math.PI; inner.add(e);
    const ce = new THREE.Mesh(new THREE.RingGeometry(ri, rc, 64, 1), coreMat); ce.position.set(0, R, side * (Ww / 2 + cx)); if (side < 0) ce.rotation.y = Math.PI; inner.add(ce);
  }
  const coreO = new THREE.Mesh(new THREE.CylinderGeometry(rc, rc, Ww + 2 * cx, 64, 1, true), coreMat); coreO.rotation.x = Math.PI / 2; coreO.position.y = R; inner.add(coreO);
  const coreI = new THREE.Mesh(new THREE.CylinderGeometry(ri, ri, Ww + 2 * cx, 64, 1, true), coreInMat); coreI.rotation.x = Math.PI / 2; coreI.position.y = R; inner.add(coreI);
  // the web: wraps over the top, leaves the left side of the roll, falls to the table and lies flat with a slight curl at the cut end
  const phi = 1.25, P = [-R * Math.sin(phi), R + R * Math.cos(phi)], dir = [-Math.cos(phi), -Math.sin(phi)], Fp = [-R * 1.9, 1.3];
  const B1 = [P[0] + dir[0] * R * 0.45, P[1] + dir[1] * R * 0.45], B2 = [Fp[0] + R * 0.55, Fp[1]];
  const path = []; const nD = Math.round(40 * Q) + 6;
  for (let k = 0; k <= nD; k++) { const t = k / nD, mt = 1 - t; path.push([0, 1].map((c) => mt * mt * mt * P[c] + 3 * mt * mt * t * B1[c] + 3 * mt * t * t * B2[c] + t * t * t * Fp[c])); }
  const nF = Math.round(120 * Q) + 10;
  for (let k = 1; k <= nF; k++) { const x = Fp[0] - Lf * k / nF, end = smooth(Lf - 30, Lf, Fp[0] - x); path.push([x, 1.3 + 5 * end * end + 0.15 * fnoise(x * 0.6, 3)]); }
  const S = [0]; for (let k = 1; k < path.length; k++) S.push(S[k - 1] + Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]));
  const u0 = -R * phi / rep, nW = Math.round(50 * Q) + (zip ? 30 : 0);
  const sheet = gridGeo(path.length - 1, nW, (i, j) => { const z = -Ww / 2 + Ww * j / nW, p = path[i]; const flat = i > nD ? 1 : 0;
    const lift = 2.2 * zband(z) + 0.25 * Math.sin(z * 0.03 + p[0] * 0.008) * flat;
    return [p[0], p[1] + lift * (flat ? 1 : 0.5), z, u0 - S[i] / rep, (Ww / 2 - z) / Ww]; });
  const sh = new THREE.Mesh(sheet, rollSheetMat); sh.receiveShadow = true; sh.userData.role = 'rSheet'; inner.add(sh);
  const x0 = Fp[0] - Lf, x1 = R; inner.position.x = -(x0 + x1) / 2;
  return { group: g, meta: { type: zip ? 'rollzip' : 'roll', roll: true, W: x1 - x0, H: 2 * R, G: 0, Htot: 2 * R + 4, Dmax: Ww + 2 * cx, panelW: rep, rep, Ww, R, zip, zipY: Ww / 2 - zipZ, noDims: true,
    views: { angle: new THREE.Vector3(0.42, 1.05, 1), front: new THREE.Vector3(0, 1.15, 0.85), back: new THREE.Vector3(-0.2, 0.55, -1), side: new THREE.Vector3(1, 0.4, 0.15), bottom: new THREE.Vector3(0.0001, 1, 0.02) },
    face: { x0: rep * 0.07, x1: rep * 0.93, y0: 22, y1: zip ? Ww / 2 - zipZ - 12 : Ww - 14 } } };
}
function paintRoll(m) {
  const sxr = RCW / m.rep, syr = RCH / m.Ww, X = (mm) => mm * sxr, Y = (mm) => (m.Ww - mm) * syr;
  const clear = isClear();
  rctx.globalCompositeOperation = 'source-over'; rctx.clearRect(0, 0, RCW, RCH);
  if (clear) { rctx.fillStyle = 'rgba(176,186,196,0.07)'; rctx.fillRect(0, 0, RCW, RCH); } else { rctx.fillStyle = state.color; rctx.fillRect(0, 0, RCW, RCH); }
  const r = artRect(m); rctx.imageSmoothingQuality = 'high';
  rctx.save(); rctx.beginPath(); rctx.rect(0, 0, RCW, RCH); rctx.clip(); rctx.drawImage(r.img, X(r.x), Y(r.y), r.w * sxr, r.h * syr); rctx.restore();
  rctx.fillStyle = '#16181b'; rctx.fillRect(X(m.rep - 9), Y(17), 6 * sxr, 12 * syr); // eye mark, once per repeat
  rctx.fillStyle = clear ? 'rgba(40,46,52,0.25)' : 'rgba(0,0,0,0.10)'; rctx.fillRect(X(m.rep) - 2, Y(10), 3, 7 * syr); // cut-off tick
  if (m.zip) { // the zipper track: two profiles on a white base strip
    const zy = m.zipY; rctx.fillStyle = 'rgba(0,0,0,0.10)'; rctx.fillRect(0, Y(zy + 7.5), RCW, 15 * syr);
    rctx.fillStyle = '#e4ebef'; rctx.fillRect(0, Y(zy + 6), RCW, 12 * syr);
    rctx.fillStyle = 'rgba(40,60,80,0.38)'; rctx.fillRect(0, Y(zy + 3.2), RCW, 1.6 * syr); rctx.fillRect(0, Y(zy - 1.6), RCW, 1.6 * syr);
    rctx.fillStyle = 'rgba(255,255,255,0.9)'; rctx.fillRect(0, Y(zy + 1.0), RCW, 1.2 * syr);
    rctx.fillStyle = 'rgba(40,60,80,0.18)'; rctx.fillRect(0, Y(zy + 6), RCW, 0.8 * syr); rctx.fillRect(0, Y(zy - 5.2), RCW, 0.8 * syr);
  }
  rollTex.needsUpdate = true;
  const og = rollOpC.getContext('2d'); og.fillStyle = clear ? '#d7e0e2' : state.color; og.fillRect(0, 0, RCW, RCH); og.drawImage(rollC, 0, 0);
  if (clear) { og.fillStyle = 'rgba(255,255,255,0.12)'; og.fillRect(0, 0, RCW, RCH); }
  rollOpTex.needsUpdate = true;
  const base = new THREE.Color(clear ? '#c5d4d0' : state.color); if (!clear) base.offsetHSL(0, 0, -0.05); ringMat.color.copy(base);
}
/* print-atlas details shared by the flat bags: seal bands, flap shadow, tape liner, die-cut holes, and the inside-face masks */
function paintFlat(m, X, Y, sx, sy, clear) {
  for (let col = 0; col < 2; col++) for (const [x0, y0, x1, y1] of m.seals || []) { actx.fillStyle = clear ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.035)'; actx.fillRect(X(x0, col), Y(y1), (x1 - x0) * sx, (y1 - y0) * sy); }
  if (m.flapEdge) { const { col, y } = m.flapEdge; const gr = actx.createLinearGradient(0, Y(y), 0, Y(y - 4)); gr.addColorStop(0, clear ? 'rgba(60,70,80,0.18)' : 'rgba(0,0,0,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); actx.fillStyle = gr; actx.fillRect(X(0, col), Y(y), m.W * sx, 4 * sy); }
  if (m.perfY) { actx.fillStyle = clear ? 'rgba(40,46,52,0.42)' : 'rgba(0,0,0,0.22)'; for (let x = 3; x < m.W - 2; x += 4) actx.fillRect(X(x, 1), Y(m.perfY + 0.45), 2.0 * sx, 0.9 * sy); }
  if (m.lipV) { const gr = actx.createLinearGradient(0, Y(m.H), 0, Y(m.H - 2.5)); gr.addColorStop(0, 'rgba(0,0,0,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); actx.fillStyle = gr; actx.fillRect(X(0, 0), Y(m.H), m.W * sx, 2.5 * sy); }
  const liner = (g2, x0, y1, w, h) => { g2.fillStyle = '#f5f4ef'; g2.fillRect(x0, y1, w, h); g2.fillStyle = 'rgba(0,0,0,0.13)'; g2.fillRect(x0, y1, w, Math.max(1, h * 0.06)); g2.fillRect(x0, y1 + h * 0.94, w, Math.max(1, h * 0.06)); g2.fillStyle = 'rgba(120,150,190,0.10)'; g2.fillRect(x0, y1 + h * 0.3, w, h * 0.4); };
  if (m.tape && clear) liner(actx, X(m.tape.x0, 1), Y(m.tape.y1), (m.tape.x1 - m.tape.x0) * sx, (m.tape.y1 - m.tape.y0) * sy);
  actx.globalCompositeOperation = 'destination-out'; actx.fillStyle = '#000';
  for (const c of m.cuts || []) for (let col = 0; col < 2; col++) {
    const px = (x) => X(m.W / 2 + (col ? -x : x), col);
    actx.beginPath();
    if (c.k === 'circle') actx.ellipse(px(c.x), Y(c.y), c.r * sx, c.r * sy, 0, 0, Math.PI * 2);
    else if (c.k === 'oval') { const rr = c.h / 2, L2 = c.w / 2 - rr; for (let k = 0; k <= 48; k++) { const t = k / 48 * Math.PI * 2; const cxx = c.x + (Math.cos(t) >= 0 ? L2 : -L2); const x = cxx + rr * Math.cos(t), y = c.y + rr * Math.sin(t); k ? actx.lineTo(px(x), Y(y)) : actx.moveTo(px(x), Y(y)); } actx.closePath(); }
    else if (c.k === 'notch') { const dir = c.x < 0 ? 1 : -1; actx.moveTo(px(c.x - dir), Y(c.y + 2.6)); actx.lineTo(px(c.x + dir * 4.2), Y(c.y)); actx.lineTo(px(c.x - dir), Y(c.y - 2.6)); actx.closePath(); }
    else if (c.k === 'slit') { const [[ax, ay], [bx, by]] = c.pts; const l = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / l * c.w / 2, ny = (bx - ax) / l * c.w / 2; actx.moveTo(px(ax + nx), Y(ay + ny)); actx.lineTo(px(bx + nx), Y(by + ny)); actx.lineTo(px(bx - nx), Y(by - ny)); actx.lineTo(px(ax - nx), Y(ay - ny)); actx.closePath(); }
    actx.fill();
  }
  actx.globalCompositeOperation = 'source-over';
  const lg = lipInC.getContext('2d'); lg.fillStyle = '#fff'; lg.fillRect(0, 0, 1024, 1024);
  if (m.perfY) { const lsx = 512 / m.W, lsy = 1024 / m.vLen; lg.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 3; x < m.W - 2; x += 4) lg.fillRect(512 + x * lsx, (m.vLen - m.perfY - 0.45) * lsy, 2.0 * lsx, Math.max(1.5, 0.9 * lsy)); }
  if (m.tape) { const lsx = 512 / m.W, lsy = 1024 / m.vLen; liner(lg, 512 + (m.W - m.tape.x1) * lsx, (m.vLen - m.tape.y1) * lsy, (m.tape.x1 - m.tape.x0) * lsx, (m.tape.y1 - m.tape.y0) * lsy); }
  lipInTex.needsUpdate = true;
  const hg = holeC.getContext('2d'); hg.globalCompositeOperation = 'copy'; hg.drawImage(atlas, 0, 0, 512, 512);
  hg.globalCompositeOperation = 'source-in'; hg.fillStyle = '#fff'; hg.fillRect(0, 0, 512, 512);
  hg.globalCompositeOperation = 'destination-over'; hg.fillStyle = '#000'; hg.fillRect(0, 0, 512, 512); hg.globalCompositeOperation = 'source-over';
  holeTex.needsUpdate = true;
}
const BUILD = { pouch: (s) => buildPouch(s), wicket: (s) => buildWicket(s), bread: (s) => buildBread(s), box: (s) => buildBlock(s, false), quad: (s) => buildBlock(s, true),
  flat: buildFlatPouch, mailer: buildMailer, roll: (s) => buildRoll(s, false), rollzip: (s) => buildRoll(s, true), diecut: buildDieCut, doorknob: buildDoorKnob,
  header: buildHeader, tape: buildTape, fliptop: buildFlip, staple: buildStaple };

/* ---------- demo artwork ---------- */
function demoArt() {
  const c=document.createElement('canvas');c.width=900;c.height=1060;const g=c.getContext('2d');
  g.fillStyle='#e3e8df';roundRect(g,40,54,820,952,23);g.fill();
  g.lineWidth=2;g.strokeStyle='#929f90';roundRect(g,70,84,760,892,16);g.stroke();
  g.beginPath();g.arc(450,445,69,0,Math.PI*2);g.fillStyle='#f5f5ef';g.fill();
  g.strokeStyle='#314338';g.lineWidth=7;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(450,469);g.lineTo(450,418);g.moveTo(430,438);g.lineTo(450,418);g.lineTo(470,438);g.stroke();
  g.fillStyle='#2d4035';g.textAlign='center';g.font='600 67px Inter, Arial, sans-serif';g.fillText('Your artwork',450,591);
  return c;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
let demo = null;

/* ---------- paint the print atlas ---------- */
let cur = null; // {group, meta}
function artRect(meta, override) {
  const f = meta.face, rot = false, fw = f.x1 - f.x0, fh = f.y1 - f.y0; // print always upright (bread stands on the shelf too)
  const img = override || state.art || demo; const ar = img.width / img.height;
  let w, h;
  if (state.fit === 'fill') { if (ar > fw / fh) { h = fh; w = h * ar; } else { w = fw; h = w / ar; } }
  else { if (ar > fw / fh) { w = fw; h = w / ar; } else { h = fh; w = h * ar; } }
  w *= state.scale; h *= state.scale;
  const cx = (f.x0 + f.x1) / 2 + (rot ? -state.oy * fh : state.ox * fw), cy = (f.y0 + f.y1) / 2 + (rot ? state.ox * fw : state.oy * fh);
  return { x: cx - w / 2, y: cy + h / 2, cx, cy, w, h, rot, img: (!override && isClear() && state.koWhite && state.artKO && state.art) ? state.artKO : img };
}
function paint() {
  if (!cur) return;
  const m = cur.meta; const Hm = m.vLen || m.Htot;
  if (m.roll) { paintRoll(m); needsRender = true; return; }
  const sx = (AW / 2) / m.panelW, sy = AH / Hm;
  const X = (mm, col) => col * AW / 2 + mm * sx, Y = (mm) => (Hm - mm) * sy;
  actx.globalCompositeOperation = 'source-over';
  actx.clearRect(0, 0, AW, AH);
  const clear = isClear();
  if (clear) { // see-through film: a faint haze (frosted when matte); ink stays opaque
    actx.fillStyle = state.finish === 'matte' ? 'rgba(238,241,243,0.34)' : 'rgba(176,186,196,0.07)'; actx.fillRect(0, 0, AW, AH);
  } else { actx.fillStyle = state.color; actx.fillRect(0, 0, AW, AH); }
  for (let col = 0; col < 2; col++) {
    if (col === 1 && state.back === 'plain') continue;
    const customBack=col===1&&state.back==='custom'&&state.artBack&&!state.fullPanels;const r=artRect(m,customBack?state.artBack:undefined);
    actx.save();
    actx.beginPath();
    const topClip = m.artTop ?? (m.type === 'wicket' ? m.H : Hm);
    actx.rect(col * AW / 2, Y(topClip), AW / 2, AH - Y(topClip));
    actx.clip();
    actx.imageSmoothingQuality = 'high';
    if (state.fullPanels&&(m.type==='bread'||m.type==='wicket')) {const panel=col===0?state.art:state.artBack;if(panel){const iy=m.type==='wicket'?Y(m.H):0;actx.drawImage(panel,col*AW/2,iy,AW/2,AH-iy);}}
    else if (r.rot) { // lying loaf (clip end to the left seen from the front): turn the print a quarter so it reads level on the shelf; the back panel turns the other way so flipped loaves read too
      actx.translate(X(r.cx, col), Y(r.cy)); actx.scale(sx, -sy); actx.rotate(col === 0 ? -Math.PI / 2 : Math.PI / 2); actx.scale(1, -1);
      actx.drawImage(r.img, -r.w / 2, -r.h / 2, r.w, r.h);
    } else actx.drawImage(r.img, X(r.x, col), Y(r.y), r.w * sx, r.h * sy);
    actx.restore();
  }
  // construction details printed into the film map
  if (m.type === 'pouch' || m.type === 'box') {
    for (let col = 0; col < 2; col++) {
      const x0 = X(m.seal, col), x1 = X(m.panelW - m.seal, col);
      actx.fillStyle = 'rgba(0,0,0,0.10)'; actx.fillRect(x0, Y(m.zipY + 1.6), x1 - x0, 3.2 * sy);
      actx.fillStyle = 'rgba(255,255,255,0.35)'; actx.fillRect(x0, Y(m.zipY + 2.6), x1 - x0, 0.9 * sy);
      actx.fillStyle = 'rgba(0,0,0,0.05)'; actx.fillRect(x0, Y(m.zipY - 3), x1 - x0, 1.2 * sy);
      // tear notches (cut out)
      actx.globalCompositeOperation = 'destination-out';
      const ny = m.zipY + Math.min(12, (m.H - m.zipY) * 0.5);
      for (const edge of [0, 1]) {
        const ex = edge ? X(m.panelW, col) : X(0, col), dir = edge ? -1 : 1;
        actx.beginPath(); actx.moveTo(ex - dir, Y(ny + 3)); actx.lineTo(ex + dir * 4.5 * sx, Y(ny)); actx.lineTo(ex - dir, Y(ny - 3)); actx.closePath(); actx.fill();
      }
      actx.globalCompositeOperation = 'source-over';
    }
  }
  if (m.type === 'wicket') {
    for (let col = 0; col < 2; col++) { // side welds + the front panel's cut edge
      const top = col === 0 ? m.H : Hm;
      for (const sx0 of [m.seal, m.W - m.seal]) {
        actx.fillStyle = 'rgba(0,0,0,0.10)'; actx.fillRect(X(sx0 - 0.5, col), Y(top), 1.0 * sx, top * sy);
        actx.fillStyle = 'rgba(255,255,255,0.5)'; actx.fillRect(X(sx0 + 0.6, col), Y(top), 0.6 * sx, top * sy);
      }
      actx.fillStyle = clear ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.035)'; actx.fillRect(X(0, col), Y(top), m.seal * sx, top * sy); actx.fillRect(X(m.W - m.seal, col), Y(top), m.seal * sx, top * sy);
      if (clear) { actx.fillStyle = 'rgba(255,255,255,0.16)'; actx.fillRect(X(0, col), Y(m.G > 0 ? 3 : 2.5), m.W * sx, (m.G > 0 ? 3 : 2.5) * sy); } // bottom fold / seal
    }
    if (clear) { const col = 1; for (const hx of m.holes) { const cx = X(m.W / 2 - hx, col); actx.strokeStyle = 'rgba(255,255,255,0.55)'; actx.lineWidth = 1.6 * sx; actx.beginPath(); actx.ellipse(cx, Y(m.holeY), (m.holeR + 0.9) * sx, (m.holeR + 0.9) * sy, 0, 0, Math.PI * 2); actx.stroke(); } }
    { const gr = actx.createLinearGradient(0, Y(m.H), 0, Y(m.H - 2.5)); gr.addColorStop(0, 'rgba(0,0,0,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); actx.fillStyle = gr; actx.fillRect(X(0, 0), Y(m.H), m.W * sx, 2.5 * sy); }
    // perforation on the back lip outside
    actx.fillStyle = clear ? 'rgba(40,46,52,0.42)' : 'rgba(0,0,0,0.22)'; for (let x = 3; x < m.W - 2; x += 4) actx.fillRect(X(x, 1), Y(m.perfY + 0.45), 2.0 * sx, 0.9 * sy);
    actx.globalCompositeOperation = 'destination-out';
    const col = 1;
    for (const hx of m.holes) {
      const cx = X(m.W / 2 - hx, col);
      actx.beginPath(); actx.ellipse(cx, Y(m.holeY), m.holeR * sx, m.holeR * sy, 0, 0, Math.PI * 2); actx.fill();
    }
    actx.globalCompositeOperation = 'source-over';
    // hole mask for the inside face of the back panel (right half of the uv)
    const hg = holeC.getContext('2d'); hg.fillStyle = '#fff'; hg.fillRect(0, 0, 512, 512); hg.fillStyle = '#000';
    const hsx = 256 / m.W, hsy = 512 / Hm;
    for (const hx of m.holes) { hg.beginPath(); hg.ellipse(256 + (m.W / 2 - hx) * hsx, (Hm - m.holeY) * hsy, m.holeR * hsx, m.holeR * hsy, 0, 0, Math.PI * 2); hg.fill(); }
    const lg = lipInC.getContext('2d'); lg.fillStyle = '#fff'; lg.fillRect(0, 0, 1024, 1024);
    const lsx = 512 / m.W, lsy = 1024 / Hm;
    lg.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 3; x < m.W - 2; x += 4) lg.fillRect(512 + x * lsx, (Hm - m.perfY - 0.45) * lsy, 2.0 * lsx, Math.max(1.5, 0.9 * lsy));
    { const gr = lg.createLinearGradient(0, (Hm - m.H - 10) * lsy, 0, (Hm - m.H) * lsy); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.10)'); lg.fillStyle = gr; lg.fillRect(512, (Hm - m.H - 10) * lsy, 512, 10 * lsy); }
    for (const sx0 of [m.seal, m.W - m.seal]) { lg.fillStyle = 'rgba(0,0,0,0.08)'; lg.fillRect(512 + (m.W - sx0) * lsx - 0.5 * lsx, 0, lsx, 1024); lg.fillRect(sx0 * lsx - 0.5 * lsx, (Hm - m.H) * lsy, lsx, 1024); }
    lipInTex.needsUpdate = true;
    holeTex.needsUpdate = true;
  }
  if (m.flat2) paintFlat(m, X, Y, sx, sy, clear);
  if (m.block) for (let col = 0; col < 2; col++) { actx.fillStyle = clear ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.04)'; actx.fillRect(X(0, col), Y(m.H), m.panelW * sx, m.topSeal * sy); }
  atlasTex.needsUpdate = true;
  const fh = filmHex(); flapMat.color.set(fh); finMat.color.set(fh); finMat.emissive.set(fh); boxBotMat.color.set(fh); boxBotMat.emissive.set(fh); finMat.color.offsetHSL(0, 0, -0.02); plainMat.color.set(fh); plainMat.emissive.set(fh); innerMat.color.set(fh); filmInMat.color.set(fh); filmInMat.color.offsetHSL(0, 0, -0.04);
  clearCap.opacity = state.finish === 'matte' ? 0.38 : 0.12; clearUniforms.uHaze.value = state.finish === 'matte' ? 0.34 : 0.07;
  plainMat.color.offsetHSL(0, 0, -0.03);
  needsRender = true;
}

function paintBump(m) {
  seed = 11;
  const B = 1024, g = bctx; const HH = m.vLen || m.Htot; const sx = (B / 2) / m.panelW, sy = B / HH;
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, B, B);
  // fine film grain
  const id = g.getImageData(0, 0, B, B), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (rnd() - 0.5) * 5; d[i] = d[i + 1] = d[i + 2] = v; }
  g.putImageData(id, 0, 0);
  const stroke = (pts, w, a, light) => { g.strokeStyle = light ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  if (m.roll) { bumpTex.needsUpdate = true; return; }
  for (let col = 0; col < 2; col++) {
    const X = (mm) => col * B / 2 + mm * sx, Y = (mm) => (HH - mm) * sy;
    if (m.seals) { // v7 types: crimp lines across each seal band, a few tension wrinkles
      for (const [x0, y0, x1, y1] of m.seals) {
        g.fillStyle = 'rgba(0,0,0,0.18)';
        if (x1 - x0 < y1 - y0) for (let y = y0; y < y1; y += 1.6) g.fillRect(X(x0), Y(y), (x1 - x0) * sx, Math.max(1, 0.6 * sy));
        else for (let x = x0; x < x1; x += 1.6) g.fillRect(X(x), Y(y1), Math.max(1, 0.6 * sx), (y1 - y0) * sy);
      }
      const n = m.block ? 6 : 10, yr = (m.H || HH) / HH, sl = m.seal || 3;
      for (let k = 0; k < n; k++) {
        const y = HH * (0.12 + 0.75 * rnd()) * yr;
        for (const side of [0, 1]) {
          const x0 = side ? m.panelW - sl : sl, len = m.panelW * (0.06 + 0.12 * rnd()), dy = (rnd() - 0.4) * len * 0.8, x1 = side ? x0 - len : x0 + len;
          stroke([[X(x0), Y(y)], [X((x0 + x1) / 2), Y(y + dy * 0.6)], [X(x1), Y(y + dy)]], 3 + rnd() * 5, 0.04 + rnd() * 0.05, rnd() > 0.5);
        }
      }
      continue;
    }
    if (m.type !== 'bread') {
      // seal crimp lines on side seals
      for (const [a, b] of [[0, m.seal], [m.panelW - m.seal, m.panelW]]) {
        for (let y = 0; y < (m.type === 'wicket' ? m.H : HH); y += 1.6) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(X(a), Y(y), (b - a) * sx, Math.max(1, 0.6 * sy)); }
      }
      if (m.type === 'pouch') for (let x = 0; x < m.panelW; x += 1.6) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(X(x), Y(HH), Math.max(1, 0.6 * sx), m.topSeal * sy); }
      // tension wrinkles fanning in from the seals
      const n = 14;
      for (let k = 0; k < n; k++) {
        const y = HH * (0.12 + 0.8 * rnd()) * (m.type === 'wicket' ? m.H / HH : 1);
        for (const side of [0, 1]) {
          const x0 = side ? m.panelW - m.seal : m.seal, len = m.panelW * (0.08 + 0.14 * rnd()), dy = (rnd() - 0.4) * len * 0.8;
          const x1 = side ? x0 - len : x0 + len;
          stroke([[X(x0), Y(y)], [X((x0 + x1) / 2), Y(y + dy * 0.6)], [X(x1), Y(y + dy)]], 3 + rnd() * 5, 0.05 + rnd() * 0.06, rnd() > 0.5);
        }
      }
      // soft long creases on the panel
      for (let k = 0; k < 6; k++) {
        const x = m.panelW * (0.2 + 0.6 * rnd()), y = HH * (0.15 + 0.6 * rnd());
        stroke([[X(x), Y(y)], [X(x + (rnd() - 0.5) * 30), Y(y + 20 + rnd() * 40)]], 6 + rnd() * 8, 0.035, rnd() > 0.5);
      }
    } else {
      // bread: vertical gathering folds above the loaf, a few soft body creases
      for (let k = 0; k < 70; k++) {
        const x = m.panelW * rnd(); const y0 = m.Hd + (m.Hn - m.Hd) * rnd() * 0.5; const y1 = HH * (0.97 - 0.05 * rnd());
        stroke([[X(x), Y(y0)], [X(x + (rnd() - 0.5) * 20), Y((y0 + y1) / 2)], [X(x + (rnd() - 0.5) * 30), Y(y1)]], 2 + rnd() * 6, 0.12 + rnd() * 0.12, rnd() > 0.5);
      }
      for (let k = 0; k < 10; k++) {
        const x = m.panelW * rnd(), y = m.Hb * (0.2 + 0.75 * rnd());
        stroke([[X(x), Y(y)], [X(x + (rnd() - 0.5) * 40), Y(y + (rnd() - 0.5) * 30)]], 5 + rnd() * 8, 0.04, rnd() > 0.5);
      }
    }
  }
  bumpTex.needsUpdate = true;
}


/* ---------- dimension lines ---------- */
const dimRoot = new THREE.Group(); scene.add(dimRoot);
let showDims = false;
function labelSprite(text, hM) {
  const c = document.createElement('canvas'); const g = c.getContext('2d'); const fs = 64;
  g.font = `700 ${fs}px Inter, sans-serif`; const w = Math.ceil(g.measureText(text).width) + 44; c.width = w; c.height = fs + 30;
  g.fillStyle = 'rgba(27,29,33,0.88)'; roundRect(g, 0, 0, w, c.height, 22); g.fill();
  g.fillStyle = '#fff'; g.font = `700 ${fs}px Inter, sans-serif`; g.textBaseline = 'middle'; g.fillText(text, 22, c.height / 2 + 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  sp.scale.set(hM * w / c.height, hM, 1); sp.renderOrder = 10; return sp;
}
function dimLine(a, b, tick, label, hM, offset) {
  const grp = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0x1b1d21, transparent: true, opacity: 0.75, depthTest: false });
  const pts = [a, b, a.clone().add(tick), a.clone().sub(tick), b.clone().add(tick), b.clone().sub(tick)];
  const geo = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]]);
  const ln = new THREE.LineSegments(geo, mat); ln.renderOrder = 9; grp.add(ln);
  const sp = labelSprite(label, hM); sp.position.copy(a).add(b).multiplyScalar(0.5).add(offset); grp.add(sp);
  return grp;
}
function buildDims() {
  dimRoot.clear(); if (!cur) return;
  if (cur.meta.noDims) { dimRoot.visible = false; return; }
  const m = cur.meta, k = 0.001, W = m.W * k, Dz = (m.Dmax / 2 + 12) * k, hM = Math.max(0.012, fitR * 0.075);
  const flatH = (m.type === 'bread' ? m.Htot : m.H) * k;
  const tk = 5 * k;
  const wl = state.type === 'bread' ? `${fmt(state.size.w)}″ wide` : `${fmt(state.size.w)}″`;
  dimRoot.add(dimLine(new THREE.Vector3(-W / 2, 0.002, Dz), new THREE.Vector3(W / 2, 0.002, Dz), new THREE.Vector3(0, tk, 0), wl, hM, new THREE.Vector3(0, -hM * 0.9, 0)));
  const xr = W / 2 + 14 * k;
  const hl = state.type === 'bread' ? `${fmt(state.size.h)}″ long (flat)` : `${fmt(state.size.h)}″`;
  dimRoot.add(dimLine(new THREE.Vector3(xr, 0, 0), new THREE.Vector3(xr, flatH, 0), new THREE.Vector3(tk, 0, 0), hl, hM, new THREE.Vector3(hM * 0.4 + 0.01, 0, 0)));
  if (state.size.g > 0 && (['pouch', 'wicket', 'bread'].includes(state.type) || BAGS[state.type].gLabel)) {
    const G = Math.max(m.Dmax - 4, 6) * k * (m.type === 'bread' ? 1 : 1);
    const gl = m.type === 'bread' || BAGS[state.type].gLabel ? `${fmt(state.size.g)}″ gusset` : `${fmt(state.size.g)}″ BG`;
    dimRoot.add(dimLine(new THREE.Vector3(-W / 2 - 14 * k, 0.002, -G / 2), new THREE.Vector3(-W / 2 - 14 * k, 0.002, G / 2), new THREE.Vector3(0, tk, 0), gl, hM, new THREE.Vector3(-hM * 1.6, hM * 0.2, 0)));
  }
  dimRoot.visible = showDims && state.mode === 'studio';
}

/* ---------- build / swap bag ---------- */
const bagRoot = new THREE.Group(); scene.add(bagRoot);
let fitR = 0.2, centerY = 0.1;
function rebuild(keepView = true) {
  if (cur) { bagRoot.remove(cur.group); cur.group.traverse((o) => o.geometry && o.geometry.dispose()); }
  const b = BUILD[state.type](state.size);
  b.group.scale.setScalar(0.001);
  cur = b; applyFilm(b.group); bagRoot.add(b.group); clearUniforms.uLipV.value = b.meta.lipV ?? (b.meta.type === 'wicket' ? (b.meta.H + 0.5) / b.meta.Htot : 2.0); if (state.mode === 'studio') scene.background = studioBgNow();
  bodyMat.side = state.type === 'bread' ? THREE.DoubleSide : THREE.FrontSide;
  bodyMat.needsUpdate = true;
  const m = b.meta;
  const Wm = m.W / 1000, Hm = m.Htot / 1000, Dm = m.Dmax / 1000;
  fitR = 0.5 * Math.hypot(Wm, Hm, Dm); centerY = Hm / 2;
  blob.scale.set(Wm * 1.35, Math.max(Dm, Wm * 0.25) * 1.6, 1);
  fitShadow(); buildDims();
  paintBump(m); paint();
  $('#badge').textContent = `${sizeLabel(state.type, state.size)} ${BAGS[state.type].name}`;
  $('#shelfBtn').hidden = !!BAGS[state.type].noShelf; $('#dimBtn').hidden = !!m.noDims;
  { const bb = $('[data-view=bottom]'); if (bb) bb.textContent = m.roll ? 'Top' : 'Bottom'; }
  setView(currentView, !keepView);
}

function fitShadow() {
  key.shadow.camera.left = key.shadow.camera.bottom = -fitR * 2.2; key.shadow.camera.right = key.shadow.camera.top = fitR * 2.2;
  key.shadow.camera.near = 0.1; key.shadow.camera.far = 12; key.shadow.camera.updateProjectionMatrix();
  key.target.position.set(0, centerY, 0);
}
/* ---------- camera views ---------- */
const VIEWS = {
  angle: new THREE.Vector3(0.62, 0.22, 1), front: new THREE.Vector3(0, 0.06, 1), back: new THREE.Vector3(0, 0.06, -1),
  side: new THREE.Vector3(1, 0.08, 0.0001), bottom: new THREE.Vector3(0.25, -1, 0.8),
};
let currentView = 'angle', tween = null;
function fitDist() {
  const asp = camera.aspect; const vf = THREE.MathUtils.degToRad(camera.fov);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * asp); const f = Math.min(vf, hf);
  return (fitR / Math.sin(f / 2)) * 1.14;
}
function setView(name, instant) {
  currentView = VIEWS[name] ? name : '';
  $$('#views button').forEach((b) => b.classList.toggle('on', b.dataset.view === name));
  const target = new THREE.Vector3(0, cur && cur.meta.roll ? centerY * 0.55 : centerY - (name === 'bottom' ? 0 : fitR * 0.07), 0);
  const V = (cur && cur.meta.views && cur.meta.views[name]) || VIEWS[name];
  const dir = V ? V.clone().normalize() : camera.position.clone().sub(controls.target).normalize();
  const dist = fitDist() * (name === 'bottom' ? 0.92 : 1) * (state.type === 'wicket' ? 1.1 : 1) * (cur && cur.meta.roll ? (camera.aspect < 1 ? 1.12 : 0.9) : 1);
  if (instant) { controls.target.copy(target); camera.position.copy(target).addScaledVector(dir, dist); controls.update(); needsRender = true; return; }
  const fromDir = camera.position.clone().sub(controls.target).normalize();
  const fromDist = camera.position.distanceTo(controls.target);
  tween = { t0: performance.now(), dur: 650, fromDir, toDir: dir, fromDist, toDist: dist, fromT: controls.target.clone(), toT: target };
}
function stepTween(now) {
  if (!tween) return;
  let t = Math.min(1, (now - tween.t0) / tween.dur); const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const q = new THREE.Quaternion().setFromUnitVectors(tween.fromDir, tween.toDir);
  const qi = new THREE.Quaternion().slerp(q, e);
  const d = tween.fromDir.clone().applyQuaternion(qi);
  controls.target.lerpVectors(tween.fromT, tween.toT, e);
  camera.position.copy(controls.target).addScaledVector(d, lerp(tween.fromDist, tween.toDist, e));
  if (t >= 1) tween = null;
  needsRender = true;
}
function stopAuto() { if (controls.autoRotate) { controls.autoRotate = false; $('#hint').style.opacity = 0; } }
canvas.addEventListener('pointerdown', () => { stopAuto(); tween = null; });
controls.addEventListener('start', () => { if (state.mode === 'studio') { currentView = ''; $$('#views button').forEach((b) => b.classList.remove('on')); } });

/* ---------- shelf scene: a real supermarket gondola, shot from the aisle ---------- */
const shelfRoot = new THREE.Group(); shelfRoot.visible = false; scene.add(shelfRoot);
function buildLite(q) { const pN = N, pQ = Q; N = Math.round(96 * q); Q = q; try { return BUILD[state.type](state.size); } finally { N = pN; Q = pQ; } }
let liteCache = null;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
function shelfPose() { // the bag as one template: its meshes with their transforms relative to a pivot (footprint centred, bottom at y=0; wicket: pivot at the holes)
  if (liteCache) liteCache.group.traverse((o) => o.geometry && o.geometry.dispose());
  liteCache = buildLite(0.4); const g = liteCache.group; const meta = liteCache.meta; g.scale.setScalar(0.001); applyFilm(g);
  g.traverse((o) => { if (o.userData && o.userData.part === 'wicket') o.visible = false; });
  // bread stands on the shelf like the pouches: gusset flat on the deck, opening and clip on top (Sol, Nov 11 — never lying flat)
  const pivot = new THREE.Group(); pivot.add(g);
  if (meta.shelf === 'stack') g.rotation.x = -Math.PI / 2; // laid flat, print up, top of the bag toward the back of the shelf
  pivot.updateMatrixWorld(true);
  const bb = new THREE.Box3();
  g.traverse((o) => { if (o.isMesh && o.visible) { o.geometry.computeBoundingBox(); bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
  if (state.type === 'wicket') g.position.set(0, -meta.holeY * 0.001, 0);
  else if (meta.hang) g.position.set(0, -meta.hang.y * 0.001, 0); // pivot at the top of the hang hole: it rests on the peg
  else g.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  pivot.updateMatrixWorld(true);
  const size = bb.getSize(new THREE.Vector3());
  const parts = [];
  g.traverse((o) => { if (o.isMesh && o.visible) parts.push({ geo: o.geometry, mat: o.material, local: o.matrixWorld.clone(), panel: o.userData.panel, role: o.userData.role }); });
  return { parts, size, meta };
}
const SH = { // shelving materials (shared, built once)
  panel: null, deck: new THREE.MeshStandardMaterial({ color: 0xe4e5e3, roughness: 0.5, metalness: 0.25 }),
  strip: new THREE.MeshStandardMaterial({ color: 0xc9ccce, roughness: 0.32, metalness: 0.55 }),
  label: new THREE.MeshStandardMaterial({ color: 0xf7f7f3, roughness: 0.55, emissive: 0xffffff, emissiveIntensity: 0.08 }),
  upright: new THREE.MeshStandardMaterial({ color: 0xb9bcbe, roughness: 0.45, metalness: 0.4 }),
  kick: new THREE.MeshStandardMaterial({ color: 0x45494e, roughness: 0.55, metalness: 0.3 }),
  pin: new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.2, metalness: 0.95 }),
  floor: null, wall: null,
};
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const aoTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c); })();
SH.ao = new THREE.MeshBasicMaterial({ color: 0x1c1a17, alphaMap: aoTex, transparent: true, opacity: 0.42, depthWrite: false, fog: true });
const aoGeo = new THREE.PlaneGeometry(1, 1); // alphaMap v=1 at the top edge: dark at the shelf, fading down / forward

const pinGeo = (() => { const gg = new THREE.CylinderGeometry(0.0022, 0.0022, 1, 6); gg.rotateX(Math.PI / 2); gg.translate(0, 0, 0.5); return gg; })();
(() => { // pegboard back panel + store floor + far wall textures
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#e0e1de'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,0.04)'; g.fillRect(0, 62, 64, 2);
  g.fillStyle = '#909497'; g.beginPath(); g.arc(32, 32, 6, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(40,42,45,0.4)'; g.beginPath(); g.arc(32, 31, 4.6, Math.PI + 0.3, -0.3); g.fill();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, maxAniso);
  SH.panel = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.1 });
  const f = document.createElement('canvas'); f.width = f.height = 512; const h = f.getContext('2d');
  let sd = 11; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const v = 214 + Math.round(r() * 8); h.fillStyle = `rgb(${v},${v - 3},${v - 9})`; h.fillRect(i * 256, j * 256, 256, 256); }
  for (let i = 0; i < 1400; i++) { h.fillStyle = r() > 0.5 ? 'rgba(120,110,95,0.06)' : 'rgba(255,255,255,0.08)'; h.fillRect(r() * 512, r() * 512, 2 + r() * 5, 2 + r() * 5); }
  h.fillStyle = 'rgba(110,104,95,0.35)'; h.fillRect(0, 0, 512, 3); h.fillRect(0, 256, 512, 3); h.fillRect(0, 0, 3, 512); h.fillRect(256, 0, 3, 512);
  const ft = new THREE.CanvasTexture(f); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = Math.min(8, maxAniso); ft.repeat.set(14 / 1.2, 8 / 1.2);
  SH.floor = new THREE.MeshStandardMaterial({ map: ft, color: 0xc9c4bb, roughness: 0.3, metalness: 0, envMapIntensity: 0.7 });
  SH.wall = new THREE.MeshBasicMaterial({ color: 0xe9eae8 });
})();

/* neighbouring products: generic packs, no names, colour blocks only. 4 shapes, one draw call each; design + colour per instance */
const NB = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); // channels: r = pale label, g = dark accent, b = second colour
  const q = (i, j, fn) => { g.save(); g.translate(i * 256, (1 - j) * 256); fn(); g.restore(); };
  q(0, 0, () => { g.fillStyle = '#ff0000'; g.fillRect(56, 84, 144, 64); g.fillStyle = '#00ff00'; g.fillRect(0, 214, 256, 42); g.fillStyle = '#0000ff'; g.fillRect(36, 172, 110, 10); });
  q(1, 0, () => { g.fillStyle = '#ff0000'; g.fillRect(0, 0, 256, 74); g.fillStyle = '#0000ff'; g.beginPath(); g.arc(128, 150, 40, 0, 6.3); g.fill(); g.fillStyle = '#00ff00'; g.fillRect(60, 226, 136, 12); });
  q(0, 1, () => { g.fillStyle = '#0000ff'; g.beginPath(); g.moveTo(0, 150); g.lineTo(256, 90); g.lineTo(256, 160); g.lineTo(0, 220); g.fill(); g.fillStyle = '#ff0000'; g.beginPath(); g.ellipse(128, 86, 62, 28, 0, 0, 6.3); g.fill(); });
  q(1, 1, () => { g.fillStyle = '#ff0000'; g.fillRect(28, 28, 200, 200); g.fillStyle = '#000'; g.fillRect(44, 44, 168, 168); g.fillStyle = '#00ff00'; g.fillRect(44, 150, 168, 62); g.fillStyle = '#ff0000'; g.fillRect(70, 80, 116, 26); });
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = Math.min(4, maxAniso);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0, envMapIntensity: 0.5 });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute vec3 aNb;\nvarying vec3 vNb;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = vMapUv * 0.5 + aNb.xy; vNb = aNb;');
    sh.fragmentShader = 'varying vec3 vNb;\n' + sh.fragmentShader.replace('#include <map_fragment>', '').replace('#include <color_fragment>', `
      vec4 nbT = texture2D(map, vMapUv);
      float nbL = dot(vColor, vec3(0.3, 0.59, 0.11)); vec3 nbBase = mix(vec3(nbL), vColor, 0.72) * (0.9 + 0.2 * fract(vNb.z * 7.31));
      vec3 nbC2 = mix(vec3(nbL), vColor.brg, 0.4) * (fract(vNb.z) > 0.5 ? 1.15 : 0.75);
      vec3 nbC = mix(nbBase, mix(vec3(0.84, 0.83, 0.79), nbBase, 0.25), nbT.r * 0.85);
      nbC = mix(nbC, nbBase * 0.55, nbT.g * 0.85);
      nbC = mix(nbC, clamp(nbC2, 0.0, 0.95), nbT.b);
      diffuseColor.rgb = nbC;`);
  };
  mat.customProgramCacheKey = () => 'nbpack';
  const carton = unitBox;
  const pillow = (() => { const gg = new THREE.BoxGeometry(1, 1, 1, 10, 10, 1); const p = gg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const k = Math.sqrt(Math.max(0, 1 - Math.pow(2 * x, 4))) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * y, 6))); p.setZ(i, p.getZ(i) * (0.12 + 0.88 * k)); }
    gg.computeVertexNormals(); return gg; })();
  const pouch = (() => { const gg = new THREE.BoxGeometry(1, 1, 1, 6, 10, 1); const p = gg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) + 0.5; const k = Math.max(0.06, 1 - Math.pow(y, 1.6)) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * x, 6))); p.setZ(i, p.getZ(i) * (0.1 + 0.9 * k)); }
    gg.computeVertexNormals(); return gg; })();
  const loaf = (() => { const gg = new THREE.BoxGeometry(1, 1, 1, 10, 10, 1); const p = gg.attributes.position; // a bagged loaf lying down: soft rounded crown, flat ends
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const k = Math.sqrt(Math.max(0, 1 - Math.pow(2 * x, 8))) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * y, 4))); p.setZ(i, p.getZ(i) * (0.5 + 0.5 * k)); }
    gg.computeVertexNormals(); return gg; })();
  const can = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
  const PAL = ['#55708f', '#8b9a6c', '#c7b28a', '#a3594b', '#33445a', '#d8d0bf', '#6e5444', '#d4b65e', '#7b8f9c', '#4f7a6a', '#8a7a92', '#b98a5a', '#e2dccf', '#5e5f63', '#2f5d50', '#e6e2d6'];
  return { mat, geos: { carton, pillow, pouch, can, loaf }, PAL };
})();

const shelfOwned = []; const STK = 0.38; // slope of the riser under piled flat bags
function buildShelf() {
  const t0 = performance.now();
  shelfRoot.traverse((o) => { if (o.isInstancedMesh) o.dispose(); }); shelfRoot.clear(); while (shelfOwned.length) shelfOwned.pop().dispose();
  const pose = shelfPose();
  const type = state.type, lying = false; // bread always stands
  const Wm = pose.size.x, Hm = pose.size.y, Dm = Math.max(pose.size.z, 0.012);
  const BAY = 1.22, D = type === 'bread' ? 0.46 : 0.42, BASE = 0.13, NBSP = 0.33;
  seed = 4242;
  // ---- levels in the centre bay (bottom to top): neighbours below, the customer's bag at eye level, neighbours above
  const stack = lying ? 2 : 1;
  const levels = []; let y = BASE;
  const push = (kind, h) => { levels.push({ kind, y, h }); y += h; };
  if (type === 'wicket') {
    const rowH = pose.meta.Htot * 0.001 + 0.09;
    push('nb', NBSP); push('nb', NBSP * 0.95);
    push('hook', rowH); push('hook', rowH);
    if (y < 1.74) push('nb', Math.max(0.26, Math.min(NBSP, 2.0 - y)));
  } else if (pose.meta.hang) { // peg-hook rows: bags hang by their hole
    const rowH = pose.meta.Htot * 0.001 + 0.085;
    push('nb', NBSP); push('nb', NBSP * 0.95);
    push('hook', rowH); push('hook', rowH); if (rowH < 0.3 && y + rowH < 1.75) push('hook', rowH);
    if (y < 1.7) push('nb', Math.max(0.26, Math.min(NBSP, 2.0 - y)));
  } else if (pose.meta.shelf === 'stack') { // neat piles of flat bags
    push('nb', NBSP); push('nb', NBSP * 0.95);
    const sh = Math.max(0.17, Dm * Math.sin(STK) + 0.085); push('cust', sh); push('cust', sh);
    if (y < 1.62) push('nb', Math.max(0.3, Math.min(NBSP, 1.95 - y)));
  } else {
    const sp = Hm * stack * (lying ? 0.93 : 1) + 0.075;
    push('nb', NBSP);
    if (sp < 0.42) push('nb', NBSP * 0.95);
    push('cust', sp); push('cust', sp);
    if (y < 1.62) push('nb', Math.max(0.3, Math.min(NBSP, 1.95 - y)));
  }
  const topY = y + 0.01;
  const boxes = { deck: [], strip: [], label: [], upright: [], kick: [], panelTop: [], aoV: [], aoH: [] };
  const put = (arr, x, yy, z, sx, sy, sz) => { _m.compose(_v.set(x, yy, z), _q.identity(), _s.set(sx, sy, sz)); arr.push(_m.clone()); };
  const custM = []; const nbI = { carton: [], pillow: [], pouch: [], can: [], loaf: [] }; const pins = [];
  const BAYS = [-3, -2, -1, 0, 1, 2];
  // ---- the shelving: back panel (pegboard), uprights, base deck + kick plate, shelves with blank label strips
  const panelW = BAY * BAYS.length;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(panelW, topY - 0.02), SH.panel);
  panel.material.map.repeat.set(panelW / 0.0254, (topY - 0.02) / 0.0254);
  shelfOwned.push(panel.geometry); panel.position.set((BAYS[0] + BAYS[BAYS.length - 1]) * BAY / 2, (topY - 0.02) / 2 + 0.02, 0); panel.receiveShadow = true; shelfRoot.add(panel);
  for (const b of BAYS) {
    const bx = b * BAY;
    put(boxes.upright, bx - BAY / 2, topY / 2 + 0.03, 0.02, 0.045, topY + 0.06, 0.04);
    put(boxes.kick, bx, BASE / 2, D + 0.05, BAY, BASE, 0.012);
    put(boxes.deck, bx, BASE - 0.01, (D + 0.05) / 2, BAY - 0.046, 0.02, D + 0.05);
    put(boxes.panelTop, bx, topY + 0.035, 0.08, BAY + 0.045, 0.07, 0.16);
    const lv = b === 0 ? levels : (() => { const out = []; let yy = BASE; while (yy + 0.28 < topY - 0.05) { out.push({ kind: 'nb', y: yy, h: Math.min(NBSP + (rnd() - 0.5) * 0.04, topY - yy - 0.02) }); yy += out[out.length - 1].h; } return out; })();
    for (const L of lv) {
      if (L.kind === 'hook') { // pegboard hooks: two wire prongs per facing, bags hung by their wicket holes
        continue;
      }
      { // shade where the level meets the back panel and under the shelf above it
        const ceil = L.y + L.h - 0.023, hh = Math.min(0.22, L.h * 0.6);
        _m.compose(_v.set(bx, ceil - hh / 2, 0.002), _q.identity(), _s.set(BAY - 0.05, hh, 1)); boxes.aoV.push(_m.clone());
        _e.set(-Math.PI / 2, 0, 0); _m.compose(_v.set(bx, L.y + 0.0015, 0.09), _q.setFromEuler(_e), _s.set(BAY - 0.05, 0.18, 1)); boxes.aoH.push(_m.clone());
      }
      if (L.y > BASE + 0.01) { // a shelf (the base deck is already there)
        put(boxes.deck, bx, L.y - 0.012, D / 2, BAY - 0.046, 0.022, D);
        put(boxes.strip, bx, L.y - 0.021, D + 0.006, BAY - 0.046, 0.04, 0.012);
      } else put(boxes.strip, bx, L.y - 0.021, D + 0.056, BAY - 0.046, 0.034, 0.008);
      const stripZ = L.y > BASE + 0.01 ? D + 0.0125 : D + 0.0605;
      const room = L.h - 0.035;
      if (L.kind === 'cust' && pose.meta.shelf === 'stack') { // neat piles on a sloped wire riser, print up and tipped toward the aisle
        const gap = Math.max(0.02, Wm * 0.08), pitch = Wm + gap;
        const cols = Math.max(1, Math.min(8, Math.floor((BAY - 0.06) / pitch)));
        const th = Math.max(0.0012, Hm * 0.85), nS = Math.max(6, Math.min(12, Math.floor(0.03 / th)));
        const x0 = bx - (cols - 1) * pitch / 2, zF = D - 0.03, yF = L.y + 0.012, cs = Math.cos(STK), sn = Math.sin(STK);
        const depth = Math.min(D - 0.05, (Dm + 0.03) * cs);
        _e.set(STK, 0, 0); _q.setFromEuler(_e);
        _m.compose(_v.set(bx, yF + depth / cs / 2 * sn - 0.004, zF - depth / 2), _q, _s.set(BAY - 0.06, 0.006, depth / cs)); boxes.deck.push(_m.clone());
        put(boxes.strip, bx, yF + 0.006, zF + 0.004, BAY - 0.06, 0.022, 0.004); // front lip that holds the piles
        for (let c = 0; c < cols; c++) {
          if (c % 2 === 0 || cols < 5) put(boxes.label, x0 + c * pitch, L.y - 0.021, stripZ, 0.055, 0.026, 0.002);
          for (let s2 = 0; s2 < nS; s2++) {
            const d0 = 0.012 + Dm / 2, h0 = s2 * th + 0.0005;
            _e.set(STK, (rnd() - 0.5) * 0.008, 0);
            _m.compose(_v.set(x0 + c * pitch + (rnd() - 0.5) * 0.002, yF + d0 * sn + h0 * cs, zF - d0 * cs + h0 * sn + (rnd() - 0.5) * 0.002), _q.setFromEuler(_e), _s.set(1, 1, 1)); custM.push(_m.clone());
          }
        }
      } else if (L.kind === 'cust') {
        const gap = lying ? 0.018 : Math.max(0.01, Wm * 0.07), pitch = Wm + gap;
        const cols = Math.max(2, Math.min(10, Math.floor((BAY - 0.06) / pitch)));
        const deep = Math.max(1, Math.min(lying ? 4 : 3, Math.floor((D - 0.02) / (Dm + 0.012))));
        const x0 = bx - (cols - 1) * pitch / 2;
        for (let c = 0; c < cols; c++) {
          if (c % 2 === 0 || cols < 5) put(boxes.label, x0 + c * pitch, L.y - 0.021, stripZ, 0.055, 0.026, 0.002);
          for (let k = 0; k < deep; k++) for (let s = 0; s < stack; s++) {
            // freshly stocked: every bag square to the shelf edge, all the same way round (print to the aisle, clips at one end),
            // lined up in straight columns directly behind each other. Only a barely-there wobble (≤ ~0.3°, ≤ 1.5 mm) so it isn't CG-perfect.
            const ry = (rnd() - 0.5) * 0.01;
            const xx = x0 + c * pitch + (rnd() - 0.5) * 0.003;
            const zz = D - 0.012 - Dm / 2 - k * (Dm + 0.01);
            const yy = L.y + s * Hm * 0.93;
            _e.set(0, ry, 0);
            _m.compose(_v.set(xx, yy, zz), _q.setFromEuler(_e), _s.set(1, 1, 1)); custM.push(_m.clone());
          }
        }
      } else fillNeighbours(bx, L.y, room, D, stripZ, b === 0, nbI, boxes, put);
    }
    if (b === 0 && type !== 'wicket' && pose.meta.hang) { // peg hooks for the hanging flat bags: one prong per hang hole
      for (const L of levels.filter((l) => l.kind === 'hook')) {
        const hookY = L.y + L.h - 0.035, xsH = pose.meta.hang.xs;
        const pitch = Wm + Math.max(0.035, Wm * 0.22);
        const cols = Math.max(2, Math.min(9, Math.floor((BAY - 0.04) / pitch)));
        const x0 = bx - (cols - 1) * pitch / 2, nBag = type === 'staple' ? 2 : 4, hookL = 0.2, sp = Math.max(0.011, Dm + 0.004);
        for (let c = 0; c < cols; c++) {
          const xc = x0 + c * pitch;
          for (const hx of xsH) { _m.compose(_v.set(xc + hx * 0.001, hookY, 0), _q.identity(), _s.set(1, 1, hookL)); pins.push(_m.clone()); }
          put(boxes.label, xc + xsH[0] * 0.001, hookY + 0.012, hookL + 0.004, 0.05, 0.028, 0.003);
          for (let k = 0; k < nBag; k++) {
            _e.set(-0.02, (rnd() - 0.5) * 0.008, 0);
            _m.compose(_v.set(xc, hookY + 0.0022, hookL - 0.03 - k * sp), _q.setFromEuler(_e), _s.set(1, 1, 1)); custM.push(_m.clone());
          }
        }
      }
    }
    if (b === 0 && type === 'wicket') { // hook rows
      for (const L of levels.filter((l) => l.kind === 'hook')) {
        const hookY = L.y + L.h - 0.035, hs = (pose.meta.holes[1] - pose.meta.holes[0]) * 0.001;
        const pitch = Wm + Math.max(0.035, Wm * 0.22);
        const cols = Math.max(2, Math.min(8, Math.floor((BAY - 0.04) / pitch)));
        const x0 = bx - (cols - 1) * pitch / 2, nBag = 4, hookL = 0.2;
        for (let c = 0; c < cols; c++) {
          const xc = x0 + c * pitch;
          for (const sx of [-1, 1]) { _m.compose(_v.set(xc + sx * hs / 2, hookY, 0), _q.identity(), _s.set(1, 1, hookL)); pins.push(_m.clone()); }
          put(boxes.label, xc, hookY + 0.012, hookL + 0.004, 0.05, 0.028, 0.003); // blank hook tag at the tip
          for (let k = 0; k < nBag; k++) {
            const zz = hookL - 0.03 - k * 0.011;
            _e.set(-0.03, (rnd() - 0.5) * 0.008, 0); // hung straight, all square to the aisle
            _m.compose(_v.set(xc, hookY - pose.meta.holeR * 0.001 * 0.6, zz), _q.setFromEuler(_e), _s.set(1, 1, 1)); custM.push(_m.clone());
          }
        }
      }
    }
  }
  // ---- instanced shelving
  const inst = (geo, mat, list, cast, recv) => { if (!list.length) return null; const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = cast; im.receiveShadow = recv; im.frustumCulled = false; shelfRoot.add(im); return im; };
  inst(unitBox, SH.deck, boxes.deck, true, true); inst(unitBox, SH.strip, boxes.strip, true, true); inst(unitBox, SH.label, boxes.label, false, true);
  inst(unitBox, SH.upright, boxes.upright, true, true); inst(unitBox, SH.kick, boxes.kick, false, true); inst(unitBox, SH.deck, boxes.panelTop, true, true);
  inst(pinGeo, SH.pin, pins, true, false);
  { const a = inst(aoGeo, SH.ao, boxes.aoV, false, false); if (a) a.renderOrder = -2; }
  { const flipV = aoGeo.clone(); shelfOwned.push(flipV); const uv = flipV.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); const a = inst(flipV, SH.ao, boxes.aoH, false, false); if (a) a.renderOrder = -2; }
  // ---- neighbours
  for (const k of Object.keys(nbI)) {
    const L = nbI[k]; if (!L.length) continue;
    const im = new THREE.InstancedMesh(NB.geos[k], NB.mat, L.length);
    const aNb = new Float32Array(L.length * 3); const col = new THREE.Color();
    L.forEach((it, i) => { im.setMatrixAt(i, it.m); im.setColorAt(i, col.set(it.color)); aNb[i * 3] = it.d[0]; aNb[i * 3 + 1] = it.d[1]; aNb[i * 3 + 2] = it.d[2]; });
    im.geometry = NB.geos[k].clone(); shelfOwned.push(im.geometry); im.geometry.setAttribute('aNb', new THREE.InstancedBufferAttribute(aNb, 3));
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; shelfRoot.add(im);
  }
  // ---- the customer's bag: one instanced draw per part, instances ordered far to near so clear film blends right
  custM.sort((a, b) => a.elements[14] - b.elements[14]);
  for (const p of pose.parts) {
    const im = new THREE.InstancedMesh(p.geo, p.mat, custM.length);
    custM.forEach((m, i) => im.setMatrixAt(i, _m.multiplyMatrices(m, p.local)));
    const tr = !!p.mat.transparent;
    im.castShadow = !tr; im.receiveShadow = !tr; im.frustumCulled = false;
    im.renderOrder = (type === 'wicket' || pose.meta.flat2) && isClear() ? (p.panel === 'front' ? 2 : 1) : (p.role === 'cap' && isClear() ? -0.5 : 0);
    shelfRoot.add(im);
  }
  // ---- floor + the store beyond
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), SH.floor); shelfOwned.push(floor.geometry); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3.2); floor.receiveShadow = true; shelfRoot.add(floor);
  window.__shelfMs = Math.round(performance.now() - t0);
  return { topY, D, levels, BAY, count: custM.length, stack: pose.meta.shelf === 'stack' };
}
function fillNeighbours(bx, y0, room, D, stripZ, centre, nbI, boxes, put) {
  // blocks of one product, 2-5 facings wide, like a real planogram
  let x = bx - (1.22 - 0.06) / 2;
  const xEnd = bx + (1.22 - 0.06) / 2;
  while (x < xEnd - 0.08) {
    const r = rnd(); const kind = state.type === 'bread' ? (r < 0.45 ? 'pillowLie' : r < 0.7 ? 'carton' : r < 0.85 ? 'pillow' : 'can') : (r < 0.38 ? 'carton' : r < 0.62 ? 'pouch' : r < 0.85 ? 'pillow' : 'can');
    let w, h, d;
    if (kind === 'carton') { w = 0.14 + rnd() * 0.08; h = Math.min(room, 0.2 + rnd() * 0.1); d = 0.06 + rnd() * 0.03; }
    else if (kind === 'pouch') { w = 0.11 + rnd() * 0.06; h = Math.min(room, 0.16 + rnd() * 0.08); d = 0.06 + rnd() * 0.02; }
    else if (kind === 'pillow') { w = 0.15 + rnd() * 0.08; h = Math.min(room, 0.2 + rnd() * 0.1); d = 0.07 + rnd() * 0.03; }
    else if (kind === 'pillowLie') { w = 0.3 + rnd() * 0.06; h = 0.11 + rnd() * 0.02; d = 0.12 + rnd() * 0.02; }
    else { w = 0.08 + rnd() * 0.04; h = Math.min(room, 0.12 + rnd() * 0.1); d = w; }
    const n = Math.max(1, Math.min(kind === 'pillowLie' ? 2 : 5, Math.floor((xEnd - x) / (w + 0.012)), 2 + Math.floor(rnd() * 4)));
    const color = NB.PAL[Math.floor(rnd() * NB.PAL.length)];
    const dsg = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]][Math.floor(rnd() * 4)]; const dz = Math.floor(rnd() * 9) + (rnd() > 0.5 ? 0.75 : 0.25);
    const deep = Math.max(1, Math.min(3, Math.floor((D - 0.02) / (d + 0.01))));
    const stackN = kind === 'pillowLie' && room > h * 2 + 0.04 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const cx = x + w / 2 + i * (w + 0.012);
      if (i === 0) put(boxes.label, cx, y0 - 0.021, stripZ, 0.055, 0.026, 0.002);
      for (let k = 0; k < deep; k++) for (let s = 0; s < stackN; s++) {
        const geoK = kind === 'pillowLie' ? 'loaf' : kind;
        _e.set(kind === 'pillowLie' ? -Math.PI / 2 + 0.55 : 0, (rnd() - 0.5) * 0.06, 0);
        const sx = w, sy = kind === 'pillowLie' ? d : h, sz = kind === 'pillowLie' ? h * 0.9 : d;
        const yy = kind === 'pillowLie' ? y0 + h / 2 + s * h * 0.85 : y0 + h / 2;
        _m.compose(_v.set(cx + (rnd() - 0.5) * 0.006, yy, D - 0.012 - d / 2 - k * (d + 0.008)), _q.setFromEuler(_e), _s.set(sx, sy, sz));
        nbI[geoK].push({ m: _m.clone(), color, d: [dsg[0], dsg[1], dz] });
      }
    }
    x += n * (w + 0.012) + 0.008;
  }
}
let shelfInfo = null;
const studioLights = { hemi: 0, key: 0, rim: 0, fill: 0 };
function frameShelf() {
  const { topY, D } = shelfInfo;
  const phone = camera.aspect < 1;
  camera.fov = phone ? 42 : 36; camera.updateProjectionMatrix();
  const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const custL = shelfInfo.levels.filter((l) => l.kind !== 'nb');
  const midY = phone ? (custL[0].y + custL[custL.length - 1].y + custL[custL.length - 1].h) / 2 : topY * 0.5;
  const needH = phone ? (custL[custL.length - 1].y + custL[custL.length - 1].h - custL[0].y) + 0.8 : topY + 0.75;
  const needW = phone ? 1.22 * 1.42 : 1.22 * 2.3;
  const dist = Math.max((needH / 2) / Math.tan(vf / 2), (needW / 2) / Math.tan(hf / 2));
  const visH = 2 * dist * Math.tan(vf / 2);
  const c = new THREE.Vector3(0.04, phone ? Math.max(visH / 2 - 0.15, Math.min(midY, topY + 0.12 - visH / 2 + 0.08)) : midY, D * 0.5);
  const az = phone ? 0.14 : 0.2, eye = shelfInfo.stack ? midY + 0.75 : Math.min(1.6, Math.max(1.3, midY + 0.4));
  controls.target.copy(c);
  camera.position.set(c.x + Math.sin(az) * dist, eye, c.z + Math.cos(az) * dist);
  controls.minDistance = dist * 0.45; controls.maxDistance = dist * 1.2;
  controls.minAzimuthAngle = -0.55; controls.maxAzimuthAngle = 0.7; controls.minPolarAngle = shelfInfo.stack ? 0.8 : 1.2; controls.maxPolarAngle = 1.72;
  controls.update(); needsRender = true;
}
function enterShelf() {
  const wasShelf = state.mode === 'shelf';
  state.mode = 'shelf'; stopAuto(); tween = null;
  shelfInfo = buildShelf();
  bagRoot.visible = false; blob.visible = false; ground.visible = false; dimRoot.visible = false; shelfRoot.visible = true;
  scene.background = shelfBg; scene.fog = shelfFog;
  if (!wasShelf) { studioLights.hemi = hemi.intensity; studioLights.key = key.intensity; studioLights.rim = rim.intensity; studioLights.fill = fill.intensity; }
  // store lighting: bright, even overhead fluorescent, soft shadow under each shelf
  hemi.intensity = 0.62; hemi.color.set(0xfdfdfb); hemi.groundColor.set(0x9f9b93);
  key.intensity = 1.55; key.position.set(0.5, 3.6, 2.0); key.target.position.set(0, shelfInfo.topY * 0.45, 0.2);
  rim.intensity = 0.12; fill.intensity = 0.38; fill.position.set(-1.2, 1.6, 3.4);
  key.shadow.camera.left = -2.6; key.shadow.camera.right = 2.6; key.shadow.camera.bottom = -1.6; key.shadow.camera.top = 1.8;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 8; key.shadow.camera.updateProjectionMatrix(); key.shadow.needsUpdate = true;
  $('#views').hidden = true; $('#dimBtn').hidden = true; $('#shelfBtn').hidden = true; $('#shelfbar').hidden = false; $('#badge').textContent = `${sizeLabel(state.type, state.size)} ${BAGS[state.type].name} · on the shelf`;
  frameShelf();
  if (matchMedia('(max-width: 900px)').matches && viewer.getBoundingClientRect().top < -40) viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function exitShelf() {
  state.mode = 'studio'; paint(); shelfRoot.visible = false; shelfRoot.clear(); bagRoot.visible = true; blob.visible = true; ground.visible = true; dimRoot.visible = showDims;
  scene.background = studioBgNow(); scene.fog = studioFog; camera.fov = 30; camera.updateProjectionMatrix();
  hemi.intensity = studioLights.hemi; hemi.color.set(0xffffff); hemi.groundColor.set(0xcfc8be); key.intensity = studioLights.key; rim.intensity = studioLights.rim; fill.intensity = studioLights.fill;
  key.position.set(1.0, 4.2, 1.5); fill.position.set(-3, 1.5, 1.5);
  $('#views').hidden = false; $('#dimBtn').hidden = !!cur?.meta.noDims; $('#shelfBtn').hidden = !!BAGS[state.type].noShelf; $('#shelfbar').hidden = true;
  controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI;
  controls.minDistance = 0; controls.maxDistance = Infinity;
  $('#badge').textContent = `${sizeLabel(state.type, state.size)} ${BAGS[state.type].name}`;
  fitShadow(); setView('angle', true);
}

/* ---------- render loop ---------- */
let needsRender = true;
function resize() {
  const r = viewer.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (state.mode === 'shelf') { if (shelfInfo) frameShelf(); } else if (currentView) setView(currentView, true);
  needsRender = true;
}
new ResizeObserver(resize).observe(viewer);
function frame(now) {
  if (window.__paused) { requestAnimationFrame(frame); return; }
  stepTween(now);
  if (!tween) { if (controls.update()) needsRender = true; }
  if (controls.autoRotate) needsRender = true;
  const cd = camera.position.clone().sub(controls.target).normalize(); const dv = showDims && state.mode === 'studio' && camera.position.y > 0.01 && cd.z > 0.45; if (dimRoot.visible !== dv) { dimRoot.visible = dv; needsRender = true; }
  if (needsRender) { sortPanels(); renderer.render(scene, camera); needsRender = false; }
  requestAnimationFrame(frame);
}
controls.addEventListener('change', () => { needsRender = true; });
function sortPanels() { // clear wicketed bag: draw the far panel first, so the near one composites over it from any side
  if (!cur || !(cur.meta.type === 'wicket' || cur.meta.flat2) || state.mode !== 'studio') return;
  const nearFront = camera.position.z >= 0;
  for (const o of cur.group.children) if (o.userData.panel) o.renderOrder = isClear() ? ((o.userData.panel === 'front') === nearFront ? 2 : 1) : 0;
}

/* ---------- download ---------- */
const logoImg = new Image(); logoImg.src = 'logo.png';
async function download() {
  sortPanels(); renderer.render(scene, camera);
  const src = renderer.domElement; const W = src.width, H = src.height;
  const foot = Math.round(Math.max(64, W * 0.06));
  const out = document.createElement('canvas'); out.width = W; out.height = H + foot; const g = out.getContext('2d');
  g.drawImage(src, 0, 0);
  g.fillStyle = '#ffffff'; g.fillRect(0, H, W, foot); g.fillStyle = '#F0810A'; g.fillRect(0, H, W, Math.max(3, foot * 0.06));
  if (logoImg.complete && logoImg.naturalWidth) { const lh = foot * 0.5, lw = lh * logoImg.naturalWidth / logoImg.naturalHeight; g.drawImage(logoImg, foot * 0.35, H + (foot - lh) / 2 + 1, lw, lh); }
  g.fillStyle = '#5d6470'; g.textAlign = 'right'; g.font = `600 ${Math.round(foot * 0.24)}px Inter, sans-serif`;
  g.fillText(`${sizeLabel(state.type, state.size)} ${BAGS[state.type].name} · mockup preview · metropack.com`, W - foot * 0.35, H + foot * 0.6);
  const blob = await new Promise((res) => out.toBlob(res, 'image/png'));
  const name = `metropack-${state.type}-mockup.png`;
  const file = new File([blob], name, { type: 'image/png' });
  const touch = matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'My bag mockup' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
window.__mockup = { clearUniforms, state, download, setView, enterShelf, exitShelf, render: () => renderer.render(scene, camera) };
/* Design-your-bag embed: the designer hands over its front/back panels (already cropped to the loaf face) */
window.__mockup.faceIn = (size) => { const b = BUILD.bread(size); const f = b.meta.face; b.group.traverse((o) => o.geometry && o.geometry.dispose()); return { x0: f.x0 / IN, x1: f.x1 / IN, y0: f.y0 / IN, y1: f.y1 / IN, panelW: b.meta.panelW / IN }; };
window.__mockup.setDesign = ({ type='bread', front, back, size, film, fullPanels }) => {
  state.fullPanels=!!fullPanels;
  type=type==='wicket'?'wicket':'bread';
  const sizeChanged = state.type !== type || ['w', 'h', 'g'].some((k) => state.size[k] !== size[k]);
  state.type = type; state.size = { w: size.w, h: size.h, g: size.g };
  state.color = film; state.colors[type] = film; state.art = front; state.artBack = back || null; state.artKO = null; state.koWhite = false;
  state.fit = 'fill'; state.scale = 1; state.ox = state.oy = 0; state.back = 'same';
  if (sizeChanged || !cur) rebuild(false); else { applyFilm(cur.group); paint(); }
  if (state.mode === 'studio') scene.background = studioBgNow();
  if (state.mode === 'shelf') enterShelf(); else setView('front');
  needsRender = true;
};

/* ---------- UI wiring ---------- */
function renderSizes() {
  const B = BAGS[state.type];
  $('#sizes').innerHTML = B.sizes.map((s, i) => `<button role="radio" data-i="${i}" aria-checked="${s.w === state.size.w && s.h === state.size.h && s.g === state.size.g}">${sizeLabel(state.type, s)}</button>`).join('');
  const ids = { w: '#iw', h: '#ih', g: '#ig' };
  const box = $('#custom');
  for (const k of ['w', 'h', 'g']) $(ids[k]).parentElement.hidden = !B.order.includes(k);
  B.order.forEach((k) => { const lab = $(ids[k]).parentElement; box.appendChild(lab); lab.querySelector('span').textContent = B.labels[k]; $(ids[k]).value = state.size[k]; $(ids[k]).min = B.lim[k][0]; $(ids[k]).max = B.lim[k][1]; });
  const mm = (v) => Math.round(v * IN);
  $('#mm').textContent = `${B.order.map((k) => `${B.labels[k]} ${mm(state.size[k])} mm`).join(' · ')}${state.type === 'wicket' ? ' · 2″ wicket lip' : ''}`;
}
$('#types').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  state.type = b.dataset.type; state.size = { ...BAGS[state.type].sizes[BAGS[state.type].def] };
  $$('#types button').forEach((x) => x.setAttribute('aria-checked', x === b));
  state.color = state.colors[state.type]; syncColors();
  renderSizes(); syncFinish();
  if (state.mode === 'shelf' && BAGS[state.type].noShelf) { state.mode = 'studio'; exitShelf(); rebuild(false); setView('angle'); }
  else if (state.mode === 'shelf') { rebuild(); enterShelf(); } else { rebuild(false); setView('angle'); }
});
$('#sizes').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  state.size = { ...BAGS[state.type].sizes[+b.dataset.i] }; renderSizes(); rebuild(); if (state.mode === 'shelf') enterShelf();
});
let sizeTimer = 0;
for (const k of ['w', 'h', 'g']) {
  $('#i' + k).addEventListener('input', (e) => {
    const v = parseFloat(e.target.value); const L = BAGS[state.type].lim[k];
    if (!isFinite(v)) return;
    state.size[k] = Math.min(L[1], Math.max(L[0], v));
    clearTimeout(sizeTimer); sizeTimer = setTimeout(() => {
      $$('#sizes button').forEach((b) => { const s = BAGS[state.type].sizes[+b.dataset.i]; b.setAttribute('aria-checked', s.w === state.size.w && s.h === state.size.h && s.g === state.size.g); });
      const mm = (x) => Math.round(x * IN); const B = BAGS[state.type];
      $('#mm').textContent = `${B.order.map((q) => `${B.labels[q]} ${mm(state.size[q])} mm`).join(' · ')}${state.type === 'wicket' ? ' · 2″ wicket lip' : ''}`;
      rebuild(); if (state.mode === 'shelf') enterShelf();
    }, 250);
  });
  $('#i' + k).addEventListener('change', (e) => { e.target.value = state.size[k]; });
}
function loadFile(f, back = false) {
  const label=$(back?'#backFileLabel':'#fileLabel');
  if (!f) return;
  if (!/^image\//.test(f.type) && !/\.(png|jpe?g|webp|svg)$/i.test(f.name)) { label.innerHTML = `That file type isn't supported yet <small>Use PNG, JPG, WebP or SVG</small>`; return; }
  if(f.size>25*1024*1024){label.innerHTML='That file is over 25 MB <small>Choose a smaller image</small>';return;}
  const url = URL.createObjectURL(f); const img = new Image();
  img.onload = () => {
    let src = img;
    const max = 2400; if (img.width > max || img.height > max || /svg/.test(f.type)) {
      const k = Math.min(1, max / Math.max(img.width || max, img.height || max)); const c = document.createElement('canvas');
      c.width = Math.round((img.width || 1200) * k); c.height = Math.round((img.height || 1200) * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); src = c;
    }
    URL.revokeObjectURL(url);
    if(back){state.artBack=src;state.back='custom';$$('[data-back]').forEach(x=>x.classList.remove('on'));label.innerHTML=`${escapeHtml(f.name)} <small>Replace back artwork</small>`;paint();if(state.mode==='shelf')enterShelf();else setView('back');return;}
    state.art = src; state.artKO = knockoutWhite(src); state.artName = f.name; syncColors(); state.scale = 1; state.ox = state.oy = 0; state.fit = 'fit'; syncFit();
    label.innerHTML = `${escapeHtml(f.name)} <small>Replace front artwork</small>`;
    paint(); if (state.mode === 'shelf') enterShelf(); else if (!currentView) setView('front');
  };
  img.onerror = () => { URL.revokeObjectURL(url); label.innerHTML = `Couldn't read that image <small>Try a PNG or JPG</small>`; };
  img.src = url;
}
/* artwork with a plain white background: make that background see-through for clear film (white inside the design stays) */
function knockoutWhite(img) {
  const k = Math.min(1, 1400 / Math.max(img.width, img.height)); const w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
  const id = g.getImageData(0, 0, w, h), d = id.data;
  let transp = 0; for (let i = 3; i < d.length; i += 16) if (d[i] < 250) transp++;
  if (transp > (d.length / 16) * 0.01) return null; // already has a transparent background: printed as is
  const white = (p) => { const r = d[p * 4], gg = d[p * 4 + 1], b = d[p * 4 + 2]; return Math.min(r, gg, b) >= 228 && Math.max(r, gg, b) - Math.min(r, gg, b) < 22; };
  let wb = 0, nb = 0; const border = []; for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  for (const p of border) { nb++; if (white(p)) wb++; }
  if (wb / nb < 0.25) return null; // no white background to remove
  const seen = new Uint8Array(w * h), st = []; for (const p of border) if (!seen[p] && white(p)) { seen[p] = 1; st.push(p); }
  while (st.length) { const p = st.pop(); const x = p % w, y = (p / w) | 0;
    if (x > 0 && !seen[p - 1] && white(p - 1)) { seen[p - 1] = 1; st.push(p - 1); } if (x < w - 1 && !seen[p + 1] && white(p + 1)) { seen[p + 1] = 1; st.push(p + 1); }
    if (y > 0 && !seen[p - w] && white(p - w)) { seen[p - w] = 1; st.push(p - w); } if (y < h - 1 && !seen[p + w] && white(p + w)) { seen[p + w] = 1; st.push(p + w); } }
  { // letter counters (the inside of an O, A, P…) are white islands right next to the removed background: clear them too.
    // White areas far from the background (white type on a colour panel) stay white ink.
    const D = new Float32Array(w * h); const INF = 1e9;
    for (let p = 0; p < w * h; p++) D[p] = seen[p] ? 0 : INF;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = y * w + x; let v = D[p];
      if (x > 0) v = Math.min(v, D[p - 1] + 1); if (y > 0) { v = Math.min(v, D[p - w] + 1); if (x > 0) v = Math.min(v, D[p - w - 1] + 1.414); if (x < w - 1) v = Math.min(v, D[p - w + 1] + 1.414); } D[p] = v; }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const p = y * w + x; let v = D[p];
      if (x < w - 1) v = Math.min(v, D[p + 1] + 1); if (y < h - 1) { v = Math.min(v, D[p + w] + 1); if (x < w - 1) v = Math.min(v, D[p + w + 1] + 1.414); if (x > 0) v = Math.min(v, D[p + w - 1] + 1.414); } D[p] = v; }
    const thr = Math.max(6, Math.min(w, h) * 0.045), vis = new Uint8Array(w * h);
    for (let p0 = 0; p0 < w * h; p0++) {
      if (seen[p0] || vis[p0] || !white(p0)) continue;
      const reg = [p0]; vis[p0] = 1; let far = 0;
      for (let k = 0; k < reg.length; k++) { const p = reg[k]; if (D[p] > far) far = D[p]; const x = p % w;
        for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) if (q >= 0 && q < w * h && !vis[q] && !seen[q] && white(q)) { vis[q] = 1; reg.push(q); } }
      if (far < thr) for (const p of reg) seen[p] = 1;
    }
  }
  for (let p = 0; p < w * h; p++) {
    if (seen[p]) { d[p * 4 + 3] = 0; continue; }
    const x = p % w, y = (p / w) | 0; // soften the anti-aliased rim next to the removed white
    if ((x > 0 && seen[p - 1]) || (x < w - 1 && seen[p + 1]) || (y > 0 && seen[p - w]) || (y < h - 1 && seen[p + w])) {
      const m = Math.min(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]); const a = Math.min(1, Math.max(0.15, (255 - m) / 90)); d[p * 4 + 3] = Math.round(255 * a);
    }
  }
  g.putImageData(id, 0, 0); return c;
}
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
$('#file').addEventListener('change',(e)=>{loadFile(e.target.files[0]);e.target.value='';});
$('#backFile').addEventListener('change',(e)=>{loadFile(e.target.files[0],true);e.target.value='';});
const up = $('.upload');
['dragenter', 'dragover'].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.add('drag'); }));
['dragleave', 'drop'].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.remove('drag'); }));
up.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));
function syncFit() {
  $('#scale').value = Math.round(state.scale * 100); $('#scaleOut').textContent = Math.round(state.scale * 100) + '%';
  $('#ox').value = Math.round(state.ox * 100); $('#oy').value = Math.round(state.oy * 100);
  $$('[data-fit]').forEach((b) => b.classList.toggle('on', b.dataset.fit === state.fit));
}
let paintQueued = false; const queuePaint = () => { if (paintQueued) return; paintQueued = true; requestAnimationFrame(() => { paintQueued = false; paint(); }); };
$('#scale').addEventListener('input', (e) => { state.scale = e.target.value / 100; $('#scaleOut').textContent = e.target.value + '%'; queuePaint(); });
$('#ox').addEventListener('input', (e) => { state.ox = e.target.value / 100; queuePaint(); });
$('#oy').addEventListener('input', (e) => { state.oy = e.target.value / 100; queuePaint(); });
$$('[data-fit]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.fit === 'reset') { state.ox = state.oy = 0; state.scale = 1; } else { state.fit = b.dataset.fit; state.scale = 1; }
  syncFit(); paint();
}));
$$('[data-back]').forEach((b) => b.addEventListener('click', () => {
  state.back = b.dataset.back; $$('[data-back]').forEach((x) => x.classList.toggle('on', x === b)); paint();
  if (state.mode === 'studio') setView('back');
}));
const FILM_NAMES = { clear: 'Clear', '#ffffff': 'White', '#f3eadb': 'Cream', '#c49a6c': 'Kraft', '#1d1d1f': 'Black', '#f0810a': 'Orange' };
function syncColors() {
  const c = state.color.toLowerCase(); let hit = false;
  $$('#colors button').forEach((x) => { const on = x.dataset.color.toLowerCase() === c; hit = hit || on; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
  $('#colors .pick').classList.toggle('on', !hit);
  $('#filmName').textContent = FILM_NAMES[c] || 'Custom';
  $('#koRow').hidden = !(isClear() && state.art && state.artKO); $('#filmNote').hidden = !isClear();
}
function setColor(c) {
  const was = isClear(); state.color = c; state.colors[state.type] = c; syncColors();
  if (was !== isClear()) { if (cur) applyFilm(cur.group); if (state.mode === 'studio') scene.background = studioBgNow(); if (state.mode === 'shelf') { paint(); enterShelf(); return; } }
  queuePaint();
}
$$('#colors button').forEach((b) => b.addEventListener('click', () => setColor(b.dataset.color)));
$('#colorPick').addEventListener('input', (e) => setColor(e.target.value));
$$('[data-ko]').forEach((b) => b.addEventListener('click', () => { state.koWhite = b.dataset.ko === 'clear'; $$('[data-ko]').forEach((x) => x.classList.toggle('on', x === b)); paint(); }));
function setFinish(f) {
  state.finish = f;
  const gloss = f === 'gloss';
  for (const m of [bodyMat, plainMat]) { m.roughness = gloss ? 0.34 : 0.72; m.clearcoat = gloss ? 0.7 : 0; m.clearcoatRoughness = gloss ? 0.26 : 0.6; m.envMapIntensity = gloss ? 0.62 : 0.45; m.needsUpdate = true; }
  bodyMat.bumpScale = gloss ? 1.2 : 0.8;
  for (const m of [filmMat, breadMat]) { m.roughness = gloss ? 0.4 : 0.74; m.clearcoat = gloss ? 0.35 : 0; m.clearcoatRoughness = gloss ? 0.32 : 0.6; m.envMapIntensity = gloss ? 0.75 : 0.5; m.needsUpdate = true; }
  for (const m of [clearOut, clearIn, clearBody]) { m.roughness = gloss ? 0.3 : 0.55; m.envMapIntensity = gloss ? 0.85 : 0.6; }
  clearUniforms.uSpec.value = gloss ? 0.5 : 0.35; clearUniforms.uEdge.value = gloss ? 0.38 : 0.3;
  paint();
  needsRender = true;
}
$$('[data-finish]').forEach((b) => b.addEventListener('click', () => { $$('[data-finish]').forEach((x) => x.classList.toggle('on', x === b)); setFinish(b.dataset.finish); }));
const POUCHES = ['pouch', 'box', 'quad', 'flat']; // Sol, Nov 11: the finish choice stays on the pouches only; plain bags and rollstock get one natural film sheen
function syncFinish() {
  const show = POUCHES.includes(state.type); $('#finishRow').hidden = !show;
  if (!show && state.finish !== 'gloss') { $$('[data-finish]').forEach((x) => x.classList.toggle('on', x.dataset.finish === 'gloss')); setFinish('gloss'); }
}
$('#views').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; stopAuto(); setView(b.dataset.view); });
$('#shelfBtn').addEventListener('click', enterShelf);
$('#shelfExit').addEventListener('click', exitShelf);
$('#dlBtn').addEventListener('click', download);
$('#dimBtn').addEventListener('click', () => { showDims = !showDims; $('#dimBtn').setAttribute('aria-pressed', showDims); dimRoot.visible = showDims && state.mode === 'studio'; needsRender = true; });

/* ---------- go ---------- */
demo = demoArt();
state.color = state.colors[state.type]; syncColors(); renderSizes(); setFinish('gloss');
resize(); rebuild(false); setView('angle', true);
requestAnimationFrame(frame);
document.fonts && document.fonts.ready.then(() => { demo = demoArt(); paint(); });
