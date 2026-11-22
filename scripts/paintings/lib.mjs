// Image toolkit for the painting excerpts and the paper: float RGB images (0..1), blurs, a max filter,
// flat-field correction (old paper → white, ink and pigment kept), soft ragged masks, "multiply" compositing.
// Pure JS on top of sharp for I/O – no native deps beyond sharp.
import sharp from 'sharp';
import { fbm, valueNoise, clamp01, smoothstep } from '../ink/lib.mjs';

export { fbm, valueNoise, clamp01, smoothstep };

/** { w, h, c, d } – d is a Float32Array of w*h*c values 0..1 */
export const img = (w, h, c = 3, fill = 0) => ({ w, h, c, d: new Float32Array(w * h * c).fill(fill) });

/** Load (and optionally crop / resize) an image as float RGB. */
export async function load(file, { extract, resize, kernel = 'lanczos3' } = {}) {
  let s = sharp(file).removeAlpha().toColourspace('srgb');
  if (extract) s = s.extract(extract);
  if (resize) s = s.resize({ ...resize, kernel });
  const { data, info } = await s.raw().toBuffer({ resolveWithObject: true });
  const out = img(info.width, info.height, 3);
  for (let i = 0; i < out.d.length; i++) out.d[i] = data[i] / 255;
  return out;
}

const to8 = (v) => (v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255));

/** Float image → sharp instance (RGB or RGBA). */
export function toSharp(im) {
  const buf = Buffer.alloc(im.d.length);
  for (let i = 0; i < im.d.length; i++) buf[i] = to8(im.d[i]);
  return sharp(buf, { raw: { width: im.w, height: im.h, channels: im.c } });
}

/** Resize a float image through sharp (8-bit round trip – fine for display assets). */
export async function resizeImg(im, w, h, kernel = 'lanczos3') {
  const { data, info } = await toSharp(im).resize(w, h, { fit: 'fill', kernel }).raw().toBuffer({ resolveWithObject: true });
  const out = img(info.width, info.height, info.channels);
  for (let i = 0; i < out.d.length; i++) out.d[i] = data[i] / 255;
  return out;
}

/** One channel as its own Float32Array. */
export function channel(im, k) {
  const out = new Float32Array(im.w * im.h);
  for (let i = 0; i < out.length; i++) out[i] = im.d[i * im.c + k];
  return out;
}
export function setChannel(im, k, plane) {
  for (let i = 0; i < plane.length; i++) im.d[i * im.c + k] = plane[i];
}
export const luminance = (im) => {
  const out = new Float32Array(im.w * im.h);
  for (let i = 0; i < out.length; i++) {
    const j = i * im.c;
    out[i] = 0.2126 * im.d[j] + 0.7152 * im.d[j + 1] + 0.0722 * im.d[j + 2];
  }
  return out;
};

/* ------------------------------------------------------------------ plane filters (Float32Array, w × h) */

/** Box blur, radius r, one pass in x then y, clamped edges (or wrapped). */
export function boxBlur(p, w, h, r, wrap = false) {
  if (r < 1) return p.slice();
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const n = 2 * r + 1;
  const at = (i, len) => (wrap ? ((i % len) + len) % len : i < 0 ? 0 : i >= len ? len - 1 : i);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let s = 0;
    for (let k = -r; k <= r; k++) s += p[row + at(k, w)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = s / n;
      s += p[row + at(x + r + 1, w)] - p[row + at(x - r, w)];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += tmp[at(k, h) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / n;
      s += tmp[at(y + r + 1, h) * w + x] - tmp[at(y - r, h) * w + x];
    }
  }
  return out;
}

/** Gaussian-ish blur: three box passes. */
export function blur(p, w, h, sigma, wrap = false) {
  if (sigma < 0.5) return p.slice();
  const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2));
  return boxBlur(boxBlur(boxBlur(p, w, h, r, wrap), w, h, r, wrap), w, h, r, wrap);
}

/** Separable max filter (grey dilation) with a square window of radius r – monotonic deque, O(n). */
export function maxFilter(p, w, h, r) {
  const pass = (src, len, count, stride, step) => {
    const dst = new Float32Array(src.length);
    const q = new Int32Array(len + 2 * r + 2);
    for (let line = 0; line < count; line++) {
      const base = line * stride;
      let head = 0;
      let tail = 0;
      const val = (i) => src[base + Math.min(len - 1, Math.max(0, i)) * step];
      for (let i = -r; i < len + r; i++) {
        const v = val(i);
        while (tail > head && val(q[tail - 1]) <= v) tail--;
        q[tail++] = i;
        const centre = i - r;
        if (centre >= 0) {
          while (q[head] < centre - r) head++;
          dst[base + centre * step] = val(q[head]);
        }
      }
    }
    return dst;
  };
  const a = pass(p, w, h, w, 1);
  return pass(a, h, w, 1, w);
}

/** Downsample a plane by an integer factor (box average). */
export function shrink(p, w, h, f) {
  const W = Math.ceil(w / f);
  const H = Math.ceil(h / f);
  const out = new Float32Array(W * H);
  const n = new Float32Array(W * H);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = Math.floor(y / f) * W + Math.floor(x / f);
      out[i] += p[y * w + x];
      n[i]++;
    }
  for (let i = 0; i < out.length; i++) out[i] /= n[i];
  return { p: out, w: W, h: H };
}

/** Bilinear upsample of a small plane to w × h. */
export function grow(small, sw, sh, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const fy = Math.min(sh - 1, Math.max(0, ((y + 0.5) * sh) / h - 0.5));
    const y0 = Math.floor(fy);
    const y1 = Math.min(sh - 1, y0 + 1);
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = Math.min(sw - 1, Math.max(0, ((x + 0.5) * sw) / w - 0.5));
      const x0 = Math.floor(fx);
      const x1 = Math.min(sw - 1, x0 + 1);
      const tx = fx - x0;
      const a = small[y0 * sw + x0] + (small[y0 * sw + x1] - small[y0 * sw + x0]) * tx;
      const b = small[y1 * sw + x0] + (small[y1 * sw + x1] - small[y1 * sw + x0]) * tx;
      out[y * w + x] = a + (b - a) * ty;
    }
  }
  return out;
}

/**
 * Illumination / paper estimate of a plane: low-pass at scale `size` px.
 * `ink: true` first lifts dark marks away with a max filter, so ink does not darken the estimate.
 */
export function lowpass(p, w, h, size, { ink = false, inkRadius = 0 } = {}) {
  const f = Math.max(1, Math.floor(size / 12));
  let s = shrink(p, w, h, f);
  let q = s.p;
  if (ink) q = maxFilter(q, s.w, s.h, Math.max(1, Math.round(inkRadius / f)));
  q = blur(q, s.w, s.h, size / f / 2);
  return grow(q, s.w, s.h, w, h);
}

/* ------------------------------------------------------------------ painting excerpts */

/**
 * Flat-field an old painting: divide by the paper estimate, so the (yellowed, stained, unevenly lit)
 * paper or silk becomes white and ink and pigment keep their hue.
 *   paperScale  size of the paper estimate's low-pass (px of this image)
 *   inkRadius   ink marks narrower than ~2× this vanish from the estimate (big washes need a larger one)
 *   white       levels: values above this become paper (cleans stains / silk texture), soft knee
 *   gamma       >1 darkens mid tones of the ink a little
 *   sat         saturation multiplier for pigments
 */
export function flatten(im, { paperScale = 300, inkRadius = 60, white = 0.94, black = 0, gamma = 1, sat = 1, knee = 0.06 } = {}) {
  const { w, h } = im;
  const out = img(w, h, 3);
  const L = luminance(im);
  const paper = lowpass(L, w, h, paperScale, { ink: true, inkRadius });
  // chroma of the paper: low-passed per channel ratio to luminance, so a yellow silk turns neutral
  const ratio = [0, 1, 2].map((k) => {
    const ch = channel(im, k);
    const r = new Float32Array(w * h);
    for (let i = 0; i < r.length; i++) r[i] = ch[i] / Math.max(1e-3, L[i]);
    // weight towards paper pixels: only bright pixels define the paper's tint
    return r;
  });
  const bright = new Float32Array(w * h);
  for (let i = 0; i < bright.length; i++) bright[i] = smoothstep(0.82, 0.97, L[i] / Math.max(1e-3, paper[i]));
  const tint = ratio.map((r) => {
    const num = new Float32Array(w * h);
    for (let i = 0; i < num.length; i++) num[i] = r[i] * bright[i];
    const a = lowpass(num, w, h, paperScale * 1.5);
    const b = lowpass(bright, w, h, paperScale * 1.5);
    const t = new Float32Array(w * h);
    for (let i = 0; i < t.length; i++) t[i] = b[i] > 0.02 ? a[i] / b[i] : 1;
    return t;
  });
  for (let i = 0; i < w * h; i++) {
    let rgb = [0, 1, 2].map((k) => im.d[i * 3 + k] / Math.max(1e-3, paper[i] * tint[k][i]));
    // levels with a soft knee at the white point
    rgb = rgb.map((v) => {
      let t = (v - black) / (white - black);
      if (t > 1 - knee) t = 1 - knee + knee * smoothstep(1 - knee, 1 + knee, t);
      return Math.pow(clamp01(t), gamma);
    });
    if (sat !== 1) {
      const l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      rgb = rgb.map((v) => clamp01(l + (v - l) * sat));
    }
    out.d[i * 3] = rgb[0];
    out.d[i * 3 + 1] = rgb[1];
    out.d[i * 3 + 2] = rgb[2];
  }
  return out;
}

/** Ink density of a flattened image (0 = paper, 1 = black). */
export const density = (im) => {
  const L = luminance(im);
  for (let i = 0; i < L.length; i++) L[i] = 1 - L[i];
  return L;
};

/* ------------------------------------------------------------------ masks */

/** Polygon fill (even-odd), coordinates in px. Returns a 0/1 plane. */
export function polygon(w, h, pts) {
  const m = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > y + 0.5 !== yj > y + 0.5) xs.push(xi + ((y + 0.5 - yi) * (xj - xi)) / (yj - yi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - 0.5));
      const x1 = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = x0; x <= x1; x++) m[y * w + x] = 1;
    }
  }
  return m;
}

/**
 * A soft, ragged mask: shape (0/1 plane) → feathered over `feather` px, its edge broken by noise like
 * mist eating into a painting. `rag` 0..1 how much the noise moves the edge.
 */
export function ragged(shape, w, h, { feather = 60, rag = 0.6, seed = 1, scale = 1 } = {}) {
  const soft = blur(shape, w, h, feather / 2);
  const n = fbm(seed, 5);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const v = soft[i] + rag * (n((x / 170) * scale, (y / 170) * scale) - 0.5) * 0.9;
      out[i] = smoothstep(0.32, 0.72, v);
    }
  return out;
}

/** Fade the outer border of a plane to 0 over `px` (guarantees no hard frame edge). */
export function borderFade(m, w, h, px) {
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (d < px) m[y * w + x] *= smoothstep(0, px, d);
    }
  return m;
}

/* ------------------------------------------------------------------ compositing on white */

/**
 * Multiply `src` (flattened RGB, white = nothing) into `dst` at (dx, dy) with mask `m` (src-sized) and
 * opacity – like laying a transparent ink layer on paper. Optional `fade(x, y)` 0..1 in dst coords.
 */
export function multiplyInto(dst, src, dx, dy, m = null, opacity = 1) {
  for (let y = 0; y < src.h; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= dst.h) continue;
    for (let x = 0; x < src.w; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= dst.w) continue;
      const a = opacity * (m ? m[y * src.w + x] : 1);
      if (a <= 0) continue;
      const si = (y * src.w + x) * 3;
      const di = (ty * dst.w + tx) * 3;
      for (let k = 0; k < 3; k++) dst.d[di + k] *= 1 - a * (1 - src.d[si + k]);
    }
  }
}

/** Mirror a float image horizontally. */
export function flipX(im) {
  const out = img(im.w, im.h, im.c);
  for (let y = 0; y < im.h; y++)
    for (let x = 0; x < im.w; x++)
      for (let k = 0; k < im.c; k++) out.d[(y * im.w + x) * im.c + k] = im.d[(y * im.w + (im.w - 1 - x)) * im.c + k];
  return out;
}

/**
 * Final asset: RGB on white + alpha. Alpha = mask × "something is painted here", so the transparent
 * file never carries a white rectangle; RGB is un-premultiplied ink colour. Composited with
 * mix-blend-mode: multiply on the page.
 */
export function withAlpha(im, mask = null, { floor = 0.004, lo = 0.018, hi = 0.06 } = {}) {
  const out = img(im.w, im.h, 4);
  // how far from white – the ink's own alpha. In faint areas the old paper's grain is still there as a
  // thin, noisy veil: invisible on the page, but it costs a lot of bytes – smooth it there, and let
  // the faintest of it go (soft threshold between lo and hi).
  const raw = new Float32Array(im.w * im.h);
  for (let i = 0; i < raw.length; i++) raw[i] = clamp01(1 - Math.min(im.d[i * 3], im.d[i * 3 + 1], im.d[i * 3 + 2]));
  const smooth = blur(raw, im.w, im.h, 1.6);
  for (let i = 0; i < im.w * im.h; i++) {
    const r = im.d[i * 3];
    const g = im.d[i * 3 + 1];
    const b = im.d[i * 3 + 2];
    const t = smoothstep(0.06, 0.16, raw[i]);
    let a0 = smooth[i] + (raw[i] - smooth[i]) * t;
    a0 *= smoothstep(lo, hi, a0);
    const a = clamp01(a0) * (mask ? mask[i] : 1);
    if (a < floor) {
      out.d[i * 4 + 3] = 0;
      out.d[i * 4] = out.d[i * 4 + 1] = out.d[i * 4 + 2] = 1;
      continue;
    }
    // un-premultiply against white: colour c with alpha a over white gives 1 - a(1 - c). The hue comes
    // from the pixel and its own alpha; how dark it lies on the page from a (masked, cleaned).
    const inv = (v) => clamp01(1 - (1 - v) / Math.max(raw[i], 1e-4));
    out.d[i * 4] = inv(r);
    out.d[i * 4 + 1] = inv(g);
    out.d[i * 4 + 2] = inv(b);
    out.d[i * 4 + 3] = a;
  }
  return out;
}

/** Crop a float image to the bounding box where `plane` > thr, plus padding. */
export function bbox(plane, w, h, thr = 0.01, pad = 0) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (plane[y * w + x] > thr) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return { x: 0, y: 0, w, h };
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad);
  y1 = Math.min(h - 1, y1 + pad);
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export function cropImg(im, { x, y, w, h }) {
  const out = img(w, h, im.c);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++)
      for (let k = 0; k < im.c; k++) out.d[(j * w + i) * im.c + k] = im.d[((y + j) * im.w + (x + i)) * im.c + k];
  return out;
}
export function cropPlane(p, pw, { x, y, w, h }) {
  const out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out[j * w + i] = p[(y + j) * pw + (x + i)];
  return out;
}
