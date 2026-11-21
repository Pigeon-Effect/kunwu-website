// Small toolkit for painting ink-wash images pixel by pixel (no native deps beyond sharp).
// Every image is a Float32Array of ink density 0..1; `toRGBA` turns it into ink on transparent paper.
import sharp from 'sharp';

/** Deterministic PRNG (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 2D value noise, smooth, seeded. Returns n(x, y) in 0..1. */
export function valueNoise(seed) {
  const size = 256;
  const r = rng(seed);
  const table = new Float32Array(size * size).map(() => r());
  const at = (x, y) => table[(y & (size - 1)) * size + (x & (size - 1))];
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

/** Fractal noise: octaves of value noise, 0..1. */
export function fbm(seed, octaves = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => valueNoise(seed + i * 101));
  return (x, y) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    let f = 1;
    for (const n of layers) {
      sum += n(x * f, y * f) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
}

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Gaussian blur of a density field via sharp. */
export async function blur(field, width, height, sigma) {
  if (sigma < 0.3) return field;
  const buf = Buffer.alloc(width * height);
  for (let i = 0; i < field.length; i++) buf[i] = Math.round(clamp01(field[i]) * 255);
  const out = await sharp(buf, { raw: { width, height, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer();
  const res = new Float32Array(width * height);
  for (let i = 0; i < res.length; i++) res[i] = out[i] / 255;
  return res;
}

/** Ink colour (warm black) with alpha = density. */
export function toRGBA(field, width, height, color = [28, 25, 21]) {
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < field.length; i++) {
    out[i * 4] = color[0];
    out[i * 4 + 1] = color[1];
    out[i * 4 + 2] = color[2];
    out[i * 4 + 3] = Math.round(clamp01(field[i]) * 255);
  }
  return out;
}

/** Composite several RGBA layers (straight alpha, "over"). */
export function over(dst, src) {
  for (let i = 0; i < dst.length; i += 4) {
    const sa = src[i + 3] / 255;
    if (sa === 0) continue;
    const da = dst[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    for (let k = 0; k < 3; k++) dst[i + k] = Math.round((src[i + k] * sa + dst[i + k] * da * (1 - sa)) / oa);
    dst[i + 3] = Math.round(oa * 255);
  }
  return dst;
}

export async function savePNG(rgba, width, height, file) {
  await sharp(rgba, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
}

/* ------------------------------------------------------------------ brush engine */

/** Catmull-Rom through control points → dense polyline with cumulative length. */
export function spline(points, samplesPerSegment = 40) {
  const pts = [points[0], ...points, points[points.length - 1]];
  const out = [];
  for (let i = 1; i < pts.length - 2; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    for (let k = 0; k < samplesPerSegment; k++) {
      const t = k / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]);
  const len = [0];
  for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len, total: len[len.length - 1] };
}

/**
 * Paints one brush stroke into `canvas` (Float32Array density, width W).
 * opts.width(s)  stroke width along the stroke, s = 0..1
 * opts.ink       base density (0..1)
 * opts.dry       dry-brush amount at the end (0..1); opts.dryFrom where it starts (s)
 * opts.bristles  number of bristle streaks across the stroke
 * Overlapping strokes darken like ink layers: d = 1 - (1 - a)(1 - b).
 */
export function stroke(canvas, W, H, points, opts) {
  const { width, ink = 0.85, dry = 0.5, dryFrom = 0.55, bristles = 14, seed = 1, edge = 0.18, rough = 0.05, mode = 'ink' } = opts;
  const { pts, len, total } = spline(points);
  const bristle = valueNoise(seed);
  const grain = fbm(seed + 7, 3);
  const edgeN = valueNoise(seed + 13);
  let maxW = 0;
  for (let i = 0; i <= 20; i++) maxW = Math.max(maxW, width(i / 20));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const pad = maxW;
  const x0 = Math.max(0, Math.floor(minX - pad)), x1 = Math.min(W - 1, Math.ceil(maxX + pad));
  const y0 = Math.max(0, Math.floor(minY - pad)), y1 = Math.min(H - 1, Math.ceil(maxY + pad));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      // nearest point on the polyline
      let best = Infinity, bs = 0, bt = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[i + 1];
        const dx = bx - ax, dy = by - ay;
        const l2 = dx * dx + dy * dy || 1;
        let u = ((x - ax) * dx + (y - ay) * dy) / l2;
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const px = ax + u * dx, py = ay + u * dy;
        const d2 = (x - px) ** 2 + (y - py) ** 2;
        if (d2 < best) {
          best = d2;
          bs = (len[i] + u * (len[i + 1] - len[i])) / total;
          bt = ((x - ax) * dy - (y - ay) * dx) / Math.sqrt(l2); // signed distance
        }
      }
      const s = bs;
      const h = (width(s) / 2) * (1 + rough * (edgeN(s * total / 70, bt > 0 ? 3 : 9) - 0.5) * 2);
      const dist = Math.sqrt(best);
      if (dist > h + 1.5) continue;
      const cover = smoothstep(h + 1.2, h - 1.2, dist);
      const across = bt / Math.max(h, 1); // -1..1
      // bristle streaks run along the stroke
      const b = bristle((across + 1) * bristles * 0.5, (s * total) / 140);
      const dryness = dry * smoothstep(dryFrom, 1, s);
      let d = ink * (0.82 + 0.18 * grain(x / 40, y / 40));
      d *= 1 - smoothstep(0.62 - dryness * 0.55, 0.7 - dryness * 0.5, 1 - b) * Math.min(1, dryness * 1.6);
      d += edge * smoothstep(0.55, 1, Math.abs(across)) * d; // ink pools at the edges
      d *= cover;
      const i = y * W + x;
      canvas[i] = mode === 'max' ? Math.max(canvas[i], clamp01(d)) : 1 - (1 - canvas[i]) * (1 - clamp01(d));
    }
}

/** A soft dab (petal, dot, knot): ellipse with ragged edge, darker rim. */
export function dab(canvas, W, H, cx, cy, rx, ry, opts = {}) {
  const { ink = 0.6, rot = 0, seed = 3, rim = 0.35, rough = 0.07, mode = 'ink' } = opts;
  const n = valueNoise(seed);
  const g = fbm(seed + 5, 3);
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const R = Math.max(rx, ry) * (1 + rough) + 2;
  for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(H - 1, cy + R); y++)
    for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(W - 1, cx + R); x++) {
      const dx = x - cx, dy = y - cy;
      const u = (dx * cos + dy * sin) / rx;
      const v = (-dx * sin + dy * cos) / ry;
      const ang = Math.atan2(v, u);
      const r = Math.hypot(u, v) / (1 + rough * (n(Math.cos(ang) * 2 + 5, Math.sin(ang) * 2 + 5) - 0.5) * 2);
      if (r > 1.08) continue;
      let d = ink * (0.8 + 0.2 * g(x / 14, y / 14));
      d *= 1 + rim * smoothstep(0.6, 0.98, r);
      d *= smoothstep(1.06, 0.94, r);
      const i = y * W + x;
      canvas[i] = mode === 'max' ? Math.max(canvas[i], clamp01(d)) : 1 - (1 - canvas[i]) * (1 - clamp01(d));
    }
}

/** Taper helpers for stroke widths. */
export const taper = (w0, w1, { press = 0.08, lift = 0.25 } = {}) => (s) => {
  const base = w0 + (w1 - w0) * s;
  const start = 0.75 + 0.25 * smoothstep(0, press, s);
  const end = 1 - 0.65 * smoothstep(1 - lift, 1, s);
  return base * start * end;
};
