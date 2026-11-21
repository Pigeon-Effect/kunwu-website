// 张家界 – sandstone pillars in mist, three layers of pale ink.
// Tall columns with tree-crowned tops and vertical texture strokes (皴), dissolving into mist
// at the base. Painted pale on purpose: it sits behind text and the figure.
import sharp from 'sharp';
import { blur, clamp01, dab, fbm, rng, smoothstep, toRGBA, valueNoise } from './lib.mjs';

/**
 * @param {object} o
 * @param {number} o.width
 * @param {number} o.height
 * @param {number} o.seed
 * @param {Array<{count:number, alpha:number, blur:number, minW:number, maxW:number, minTop:number, maxTop:number, zones?:[number,number][]}>} o.layers
 */
export async function paintMountains({ width: W, height: H, seed = 5, layers, birds = 0 }) {
  const N = W * H;
  const r = rng(seed);
  const out = new Float32Array(N);
  const mist = fbm(seed + 90, 4);

  for (const [li, L] of layers.entries()) {
    const layer = new Float32Array(N);
    const side = valueNoise(seed + li * 17);
    const cun = valueNoise(seed + li * 23);
    const grain = fbm(seed + li * 31, 3);
    for (let k = 0; k < L.count; k++) {
      const zone = L.zones ? L.zones[Math.floor(r() * L.zones.length)] : [0, 1];
      const cx0 = (zone[0] + r() * (zone[1] - zone[0])) * W;
      const w = L.minW + r() * (L.maxW - L.minW);
      const top = H * (L.minTop + r() * (L.maxTop - L.minTop));
      const lean = (r() - 0.5) * 0.1; // never quite vertical
      const narrow = 0.5 + r() * 0.35; // how much the column narrows towards the crown
      const ph = r() * 100;
      // ledges: the column steps sideways a little at a few heights
      const ledges = Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({ y: top + (H - top) * (0.12 + r() * 0.5), dx: (r() - 0.5) * w * 0.35 }));
      const strata = Array.from({ length: 2 + Math.floor(r() * 4) }, () => top + (H - top) * (0.08 + r() * 0.55));
      const centreAt = (y) => cx0 + lean * (y - top) + ledges.reduce((a, l) => a + l.dx * smoothstep(l.y - 4, l.y + 4, y), 0);
      const x0 = Math.max(0, Math.floor(cx0 - w * 1.2));
      const x1 = Math.min(W - 1, Math.ceil(cx0 + w * 1.2));
      for (let y = Math.max(0, Math.floor(top - w * 0.2)); y < H; y++) {
        const t = (y - top) / (H - top); // 0 at the crown, 1 at the bottom
        const c = centreAt(y);
        const half = (w / 2) * (narrow + (1 - narrow) * smoothstep(0, 0.4, t));
        const left = c - half * (1 + 0.32 * (side(ph + y / 55, 1) - 0.5));
        const right = c + half * (1 + 0.32 * (side(ph + y / 55, 7) - 0.5));
        for (let x = x0; x <= x1; x++) {
          const u = (x - c) / half;
          const crown = top + w * 0.22 * u * u;
          if (y < crown) continue;
          if (x < left - 1.5 || x > right + 1.5) continue;
          const cover = smoothstep(left - 1.5, left + 1.5, x) * smoothstep(right + 1.5, right - 1.5, x);
          const fromL = (x - left) / Math.max(1, right - left); // 0 at the left edge, 1 at the right
          // pale body; the shaded (left) side and the edges carry the ink
          let d = 0.28;
          d += 0.6 * smoothstep(0.3, 0, fromL);
          d += 0.3 * smoothstep(0.82, 1, fromL);
          d += 0.45 * smoothstep(0.14, 0, t); // dark under the crown
          // broken vertical cracks
          const crack = cun(x / 4.5 + 3 * side(y / 260, 20 + ph), y / 110 + ph);
          d *= 0.72 + 0.6 * smoothstep(0.35, 0.8, crack) * smoothstep(0.1, 0.4, fromL) * smoothstep(0.95, 0.7, fromL);
          // a few horizontal strata
          for (const sy of strata) d += 0.14 * Math.exp(-(((y - sy) / 1.4) ** 2)) * smoothstep(0.55, 0.75, cun(x / 14, sy));
          d *= 0.85 + 0.15 * grain(x / 30, y / 30);
          d *= smoothstep(1, 0.32, t); // into the mist
          const i = y * W + x;
          layer[i] = Math.max(layer[i], clamp01(d * cover));
        }
      }
      // 点苔 moss dots: trees on the crown and down the shaded side
      const c0 = centreAt(top);
      const half0 = (w / 2) * narrow;
      const dots = 10 + Math.round(w * 0.5);
      const scale = Math.max(0.6, w / 90);
      for (let j = 0; j < dots; j++) {
        const onSide = r() < 0.3;
        let tx, ty;
        if (onSide) {
          ty = top + (H - top) * r() * 0.22;
          tx = centreAt(ty) - (w / 2) * (narrow + (1 - narrow) * smoothstep(0, 0.4, (ty - top) / (H - top))) + r() * 6 * scale;
        } else {
          const u = (r() * 2 - 1) * 0.95;
          tx = c0 + u * half0;
          ty = top + w * 0.22 * u * u - r() * 5 * scale;
        }
        const sz = (1.6 + r() * 3.2) * scale;
        dab(layer, W, H, tx, ty, sz, sz * (0.6 + r() * 0.4), { ink: 0.8 + r() * 0.2, rim: 0, rough: 0.3, rot: r() * 3, seed: seed + j + k * 7, mode: 'max' });
      }
    }
    const soft = await blur(layer, W, H, L.blur);
    for (let i = 0; i < N; i++) {
      const y = Math.floor(i / W);
      const x = i % W;
      // drifting mist bands thin the ink
      const m = smoothstep(0.42, 0.72, mist(x / 420, y / 90 + li * 3));
      const v = soft[i] * L.alpha * (1 - 0.6 * m);
      out[i] = 1 - (1 - out[i]) * (1 - v);
    }
  }

  // a few birds: two quick strokes each
  for (let b = 0; b < birds; b++) {
    const bx = W * (0.55 + r() * 0.3);
    const by = H * (0.1 + r() * 0.2);
    const s = 5 + r() * 4;
    for (let k = -1; k <= 1; k += 2)
      for (let q = 0; q <= 1; q += 0.02) {
        const x = bx + k * q * s * 1.6;
        const y = by - Math.sin(q * Math.PI * 0.9) * s * 0.55 + q * q * s * 0.3;
        dab(out, W, H, x, y, 1.3 * (1 - q * 0.6), 1.1, { ink: 0.55, rim: 0, rough: 0, seed: 1, mode: 'max' });
      }
  }

  return sharp(toRGBA(out, W, H, [38, 36, 34]), { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

export const heroMountains = () =>
  paintMountains({
    width: 2400,
    height: 1000,
    seed: 8,
    birds: 3,
    layers: [
      { count: 18, alpha: 0.14, blur: 3, minW: 36, maxW: 90, minTop: 0.34, maxTop: 0.62 },
      { count: 9, alpha: 0.24, blur: 1.5, minW: 55, maxW: 120, minTop: 0.2, maxTop: 0.48, zones: [[0, 0.32], [0.66, 1]] },
      { count: 4, alpha: 0.36, blur: 0.8, minW: 90, maxW: 160, minTop: 0.06, maxTop: 0.26, zones: [[0, 0.14], [0.86, 1]] },
    ],
  });

/** A short, low strip of peaks for page heads and the footer. */
export const stripMountains = () =>
  paintMountains({
    width: 1600,
    height: 360,
    seed: 21,
    layers: [
      { count: 16, alpha: 0.16, blur: 2.4, minW: 24, maxW: 60, minTop: 0.3, maxTop: 0.62 },
      { count: 6, alpha: 0.3, blur: 1, minW: 36, maxW: 80, minTop: 0.12, maxTop: 0.42, zones: [[0, 0.35], [0.7, 1]] },
    ],
  });
