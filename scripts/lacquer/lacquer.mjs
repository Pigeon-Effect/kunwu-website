// 剔红 – carved cinnabar lacquer for the navigation bar: npm run lacquer → src/assets/lacquer/tihong.{avif,webp}
//
// Carved lacquer is built up from many thin coats of cinnabar lacquer and then cut back into relief. The
// bar is modelled as such a carving – a height map lit like a real object, not a flat picture of one:
//   top     a rounded bead (the lip of the panel), a sunk groove
//   field   天锦 "sky brocade", the ground pattern of carved lacquer: a lattice of small diamonds cut with
//           V-grooves, a tiny four-petalled flower raised in each
//   bottom  a groove, a band of 回纹 key fret raised between two fillets, a smaller bead
// Light falls from the upper left. The raised parts are rubbed to a soft sheen; dust and old shadow sit in
// the grooves; the lacquer is never quite even in tone.
// The tile repeats sideways (420 CSS px) and is drawn at 2 px per CSS px.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { clamp01, rng, smoothstep } from '../ink/lib.mjs';

const S = 2; // px per CSS px
const H = 72 * S; // the bar: 4.5rem
const P = 20; // brocade period (px): the width and height of one diamond
const F = 24; // key-fret period (px)
const W = 840; // tile width: a whole number of diamonds (42) and frets (35)
// rows (px)
const BEAD = [0, 11];
const FIELD = [14, 118];
const FRET = [121, 139];
const BEAD2 = [139, H];

/** value noise that repeats every `cells` cells across x (so the tile has no seam) */
function pnoise(seed, cells) {
  const r = rng(seed);
  const rows = 64;
  const t = new Float32Array(cells * rows).map(() => r());
  const at = (x, y) => t[(((y % rows) + rows) % rows) * cells + (((x % cells) + cells) % cells)];
  const f = (v) => v * v * (3 - 2 * v);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = f(x - xi);
    const yf = f(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

/** 回纹: the key fret raised in the bottom band, rasterised from a path – a squared spiral rising from a
 *  continuous base line, one per period (F × 14 px) */
async function fretPlane() {
  const fh = 14;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${fh}">
    <defs><pattern id="f" width="${F}" height="${fh}" patternUnits="userSpaceOnUse">
      <path d="M1 13V1h16v8H7V5h6M0 13h${F}" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="square"/>
    </pattern></defs>
    <rect width="100%" height="100%" fill="url(#f)"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
  return { p: Float32Array.from(buf, (v) => v / 255), h: fh };
}

function blurPlane(p, w, h, sigma) {
  // separable gaussian, wrapping in x (the tile repeats), clamped in y
  const r = Math.ceil(sigma * 3);
  const k = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)));
  const ks = k.reduce((a, b) => a + b, 0);
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += p[y * w + ((x + i + w) % w)] * k[i + r];
      tmp[y * w + x] = s / ks;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + r];
      out[y * w + x] = s / ks;
    }
  return out;
}

async function carve() {
  const h = new Float32Array(W * H);
  const fret = await fretPlane();
  const fieldMid = (FIELD[0] + FIELD[1]) / 2;
  // a hand, not a machine: the lattice lines wander by a fraction of a pixel
  const jx = pnoise(21, 24);
  const jy = pnoise(22, 24);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v;
      if (y < BEAD[1]) {
        // the lip: a round bead
        const t = (y + 0.5 - (BEAD[0] + BEAD[1]) / 2) / ((BEAD[1] - BEAD[0]) / 2 + 0.6);
        v = 1.6 + 2.2 * Math.sqrt(Math.max(0, 1 - t * t));
      } else if (y < FIELD[0]) {
        v = 0.5; // groove
      } else if (y < FIELD[1]) {
        // 天锦: small diamonds between two sets of diagonal V-grooves, a four-petalled flower raised in each
        const yy = y + 0.5 - fieldMid + (jy((x / W) * 24, y / 26) - 0.5) * 0.9;
        const xx = x + 0.5 + (jx((x / W) * 24, y / 26) - 0.5) * 0.9;
        const u = (xx + yy) / P;
        const w = (xx - yy) / P;
        const fu = u - Math.floor(u);
        const fw = w - Math.floor(w);
        const d = (Math.min(fu, 1 - fu, fw, 1 - fw) * P) / Math.SQRT2; // px to the nearest groove
        const cut = smoothstep(0.15, 1.5, d);
        // the flower, in screen axes from the diamond's centre
        const a = fu - 0.5;
        const b = fw - 0.5;
        const cx = ((a + b) * P) / 2;
        const cy = ((a - b) * P) / 2;
        const pd = P * 0.2;
        const petal = (px, py, along) => {
          const ex = along ? (cx - px) / 2.3 : (cx - px) / 1.55;
          const ey = along ? (cy - py) / 1.55 : (cy - py) / 2.3;
          return smoothstep(1.1, 0.45, Math.hypot(ex, ey));
        };
        const flower = Math.max(petal(pd, 0, true), petal(-pd, 0, true), petal(0, pd, false), petal(0, -pd, false));
        const heart = smoothstep(1.6, 0.7, Math.hypot(cx, cy));
        v = 0.9 + cut * (1.1 + 0.7 * flower + 0.5 * heart);
      } else if (y < FRET[0]) {
        v = 0.5; // groove
      } else if (y < FRET[1]) {
        // 回纹 between two fillets
        const fy = y - FRET[0];
        const fillet = fy < 2 || fy >= FRET[1] - FRET[0] - 2 ? 1 : 0;
        const fi = fy - 2;
        const f = fi >= 0 && fi < fret.h ? fret.p[fi * W + x] : 0;
        v = 1.0 + 1.3 * Math.max(fillet, f);
      } else {
        // the lower edge: a smaller bead rolling away into shadow
        const t = (y + 0.5 - (BEAD2[0] + BEAD2[1]) / 2) / ((BEAD2[1] - BEAD2[0]) / 2 + 0.4);
        v = 0.9 + 1.5 * Math.sqrt(Math.max(0, 1 - t * t));
      }
      h[y * W + x] = v;
    }
  // the knife leaves crisp but not razor edges
  return blurPlane(h, W, H, 0.65);
}

export async function lacquer() {
  const h = await carve();
  const cav = blurPlane(h, W, H, 3);
  const mottle = pnoise(11, 12);
  const fine = pnoise(12, 210);
  const L = [-0.42, -0.72, 0.56];
  const ll = Math.hypot(...L);
  const Lx = L[0] / ll;
  const Ly = L[1] / ll;
  const Lz = L[2] / ll;
  const Hx = Lx;
  const Hy = Ly;
  const Hz0 = Lz + 1;
  const hl = Math.hypot(Hx, Hy, Hz0);
  // cinnabar lacquer: the rubbed surface, and the old dark red in the grooves
  const surface = [0.56, 0.135, 0.09];
  const recess = [0.2, 0.035, 0.025];
  const sheen = [1, 0.84, 0.72];
  const out = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const dx = (h[y * W + ((x + 1) % W)] - h[y * W + ((x - 1 + W) % W)]) / 2;
      const dy = (h[Math.min(H - 1, y + 1) * W + x] - h[Math.max(0, y - 1) * W + x]) / 2;
      const k = 1.25;
      let nx = -dx * k;
      let ny = -dy * k;
      let nz = 1;
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl;
      ny /= nl;
      nz /= nl;
      const ndl = nx * Lx + ny * Ly + nz * Lz;
      const shade = 0.42 + 0.58 * Math.max(0, ndl) / Lz;
      const ndh = (nx * Hx + ny * Hy + nz * Hz0) / hl;
      const high = smoothstep(1.7, 3.0, h[i]);
      const spec = Math.pow(Math.max(0, ndh), 38) * 0.3 * (0.35 + 0.65 * high) + Math.pow(Math.max(0, ndh), 5) * 0.05;
      const ao = 1 - clamp01((cav[i] - h[i]) * 0.38);
      const depth = smoothstep(0.6, 2.2, h[i]);
      const m = 1 + 0.07 * (mottle((x / W) * 12, y / 40) - 0.5) + 0.035 * (fine((x / W) * 210, y / 3.2) - 0.5);
      // the edges of the bar: the top touches the window's edge, the bottom turns away into shadow
      const edge = smoothstep(0, 2.5, y) * smoothstep(H, H - 2.5, y + 0.5);
      for (let c = 0; c < 3; c++) {
        let alb = recess[c] + (surface[c] - recess[c]) * depth;
        alb *= 1 + 0.08 * high * (c === 0 ? 1 : 0.6); // rubbed: a little lighter and warmer on the highs
        const v = (alb * shade * ao * m + sheen[c] * spec) * (0.35 + 0.65 * edge);
        out[i * 3 + c] = Math.round(clamp01(v) * 255);
      }
    }
  return sharp(out, { raw: { width: W, height: H, channels: 3 } });
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('lacquer.mjs')) {
  const dir = new URL('../../src/assets/lacquer/', import.meta.url);
  await mkdir(dir, { recursive: true });
  const img = await lacquer();
  // AVIF for current browsers, WebP for the rest (Header.astro: image-set with type())
  const avif = await img.clone().avif({ quality: 60, effort: 6 }).toBuffer();
  const webp = await img.clone().webp({ quality: 78, effort: 6 }).toBuffer();
  await writeFile(new URL('tihong.avif', dir), avif);
  await writeFile(new URL('tihong.webp', dir), webp);
  const proof = process.argv.indexOf('--proof');
  if (proof > -1) await img.clone().png().toFile(process.argv[proof + 1]);
  console.log(`✓ lacquer/tihong.avif + .webp ${W}×${H} ${(avif.length / 1024).toFixed(0)} KB / ${(webp.length / 1024).toFixed(0)} KB`);
}
