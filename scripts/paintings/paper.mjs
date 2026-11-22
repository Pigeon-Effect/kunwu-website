// 宣纸 – the site's paper: a seamless tile made from src/assets/photos/background/background_ricepaper.jpg.
// 1. the photo's light fall-off (darker corners) is divided out, so tiles do not meet in light/dark steps
// 2. the few darkest specks and fibres are softened – no single mark stands out enough to be recognised
//    when the tile repeats
// 3. seamless without mirroring or duplicating: the photo is larger than the tile, so the strip that lies
//    beyond the tile's right (bottom) edge – the paper's true continuation – is cross-faded into the
//    left (top) edge along a ragged line, contrast-preserving, so the blend zone has the same grain.
import { fileURLToPath } from 'node:url';
import { blur, channel, fbm, img, load, lowpass, luminance, setChannel, smoothstep, toSharp } from './lib.mjs';

const SRC = fileURLToPath(new URL('../../src/assets/photos/background/background_ricepaper.jpg', import.meta.url));
const BAND = 240;

export async function paper() {
  const src = await load(SRC);
  const { w, h } = src;

  // 1 · flat field: every channel divided by its own low-pass, scaled to the paper's centre tone
  for (let k = 0; k < 3; k++) {
    const ch = channel(src, k);
    const low = lowpass(ch, w, h, 520);
    // target: the bright centre of the sheet (the photo is evenly lit there)
    let sum = 0;
    let n = 0;
    for (let y = Math.floor(h * 0.35); y < h * 0.65; y++)
      for (let x = Math.floor(w * 0.35); x < w * 0.65; x++) {
        sum += low[y * w + x];
        n++;
      }
    const target = sum / n;
    for (let i = 0; i < ch.length; i++) ch[i] = (ch[i] / low[i]) * target;
    setChannel(src, k, ch);
  }

  // 2a · retouch: the most conspicuous marks (a big brown fibre, a blue-grey streak …) are the ones the eye
  //      would recognise on the next tile – they are stamped over with quiet paper from close by
  {
    const L0 = luminance(src);
    const ref = blur(L0, w, h, 28);
    const sal = new Float32Array(w * h);
    for (let i = 0; i < sal.length; i++) {
      const j = i * 3;
      const chroma = Math.abs(src.d[j] - src.d[j + 2]) + Math.abs(src.d[j + 1] - (src.d[j] + src.d[j + 2]) / 2);
      sal[i] = Math.abs(L0[i] - ref[i]) + 0.8 * chroma;
    }
    const s = blur(sal, w, h, 7);
    const R = 52;
    const discSum = (cx, cy) => {
      let t = 0;
      for (let y = cy - R; y <= cy + R; y += 3)
        for (let x = cx - R; x <= cx + R; x += 3) if (x >= 0 && y >= 0 && x < w && y < h) t += s[y * w + x];
      return t;
    };
    const taken = new Uint8Array(w * h);
    for (let n = 0; n < 24; n++) {
      let best = -1;
      let bi = 0;
      for (let y = R; y < h - R; y += 2)
        for (let x = R; x < w - R; x += 2) {
          const i = y * w + x;
          if (!taken[i] && s[i] > best) {
            best = s[i];
            bi = i;
          }
        }
      const cx = bi % w;
      const cy = Math.floor(bi / w);
      for (let y = cy - 2 * R; y <= cy + 2 * R; y++)
        for (let x = cx - 2 * R; x <= cx + 2 * R; x++) if (x >= 0 && y >= 0 && x < w && y < h) taken[y * w + x] = 1;
      // the quietest nearby disc of the same size
      let from = null;
      let fromSum = Infinity;
      for (const [ox, oy] of [[150, 0], [-150, 0], [0, 150], [0, -150], [130, 130], [-130, 130], [130, -130], [-130, -130], [220, 60], [-220, -60]]) {
        const fx = cx + ox;
        const fy = cy + oy;
        if (fx < R || fy < R || fx >= w - R || fy >= h - R) continue;
        const t = discSum(fx, fy);
        if (t < fromSum) {
          fromSum = t;
          from = [fx, fy];
        }
      }
      if (!from) continue;
      const patch = new Float32Array((2 * R + 1) ** 2 * 3);
      for (let y = -R; y <= R; y++)
        for (let x = -R; x <= R; x++)
          for (let k = 0; k < 3; k++) patch[((y + R) * (2 * R + 1) + (x + R)) * 3 + k] = src.d[((from[1] + y) * w + (from[0] + x)) * 3 + k];
      for (let y = -R; y <= R; y++)
        for (let x = -R; x <= R; x++) {
          const a = smoothstep(R, R * 0.55, Math.hypot(x, y));
          if (a <= 0) continue;
          const di = ((cy + y) * w + (cx + x)) * 3;
          for (let k = 0; k < 3; k++) src.d[di + k] += (patch[((y + R) * (2 * R + 1) + (x + R)) * 3 + k] - src.d[di + k]) * a;
        }
    }
  }

  // 2b · soften outliers (dark specks, the darkest fibres) relative to the local tone
  const lum = luminance(src);
  const local = blur(lum, w, h, 28);
  let sd = 0;
  for (let i = 0; i < lum.length; i++) sd += (lum[i] - local[i]) ** 2;
  sd = Math.sqrt(sd / lum.length);
  const lim = 2.3 * sd;
  for (let i = 0; i < lum.length; i++) {
    const d = lum[i] - local[i];
    if (d >= -lim) continue;
    const soft = -lim + (d + lim) * 0.35;
    const f = (local[i] + soft) / Math.max(1e-3, lum[i]);
    for (let k = 0; k < 3; k++) src.d[i * 3 + k] *= f;
  }

  // … and the most saturated specks (orange, rust): their colour is pulled towards the local paper colour
  {
    const localC = [0, 1, 2].map((k) => blur(channel(src, k), w, h, 28));
    const lumNow = luminance(src);
    const localL = blur(lumNow, w, h, 28);
    let sc = 0;
    const dev = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      let d = 0;
      for (let k = 0; k < 3; k++) d += (src.d[i * 3 + k] - lumNow[i] - (localC[k][i] - localL[i])) ** 2;
      dev[i] = Math.sqrt(d);
      sc += d;
    }
    sc = Math.sqrt(sc / (w * h));
    for (let i = 0; i < w * h; i++) {
      if (dev[i] < 1.6 * sc) continue;
      const keep = (1.6 * sc + (dev[i] - 1.6 * sc) * 0.25) / dev[i];
      for (let k = 0; k < 3; k++) {
        const chroma = src.d[i * 3 + k] - lumNow[i];
        const base = localC[k][i] - localL[i];
        src.d[i * 3 + k] = lumNow[i] + base + (chroma - base) * keep;
      }
    }
  }

  // channel means (for the contrast-preserving blend)
  const mean = [0, 1, 2].map((k) => {
    let s = 0;
    for (let i = 0; i < w * h; i++) s += src.d[i * 3 + k];
    return s / (w * h);
  });

  // 3 · seamless: horizontal pass, then vertical
  // weights for a blend that keeps the grain's contrast constant (a plain cross-fade would wash it out)
  const seam = (t) => ({ wa: 1 - t, wb: t, norm: 1 / Math.sqrt((1 - t) ** 2 + t * t) });
  const nH = fbm(5, 4);
  const tw = w - BAND;
  const passH = img(tw, h, 3);
  for (let y = 0; y < h; y++) {
    const c = 0.5 + 0.62 * (nH(0.5, y / 260) - 0.5);
    for (let x = 0; x < tw; x++) {
      const o = (y * tw + x) * 3;
      if (x >= BAND) {
        for (let k = 0; k < 3; k++) passH.d[o + k] = src.d[(y * w + x) * 3 + k];
        continue;
      }
      // a = the paper beyond the right edge (continues the tile's last column); b = the tile itself
      const t = smoothstep(c - 0.17, c + 0.17, x / BAND);
      const { wa, wb, norm } = seam(t);
      for (let k = 0; k < 3; k++) {
        const a = src.d[(y * w + x + tw) * 3 + k] - mean[k];
        const b = src.d[(y * w + x) * 3 + k] - mean[k];
        passH.d[o + k] = mean[k] + (a * wa + b * wb) * norm;
      }
    }
  }
  const nV = fbm(9, 4);
  const th = h - BAND;
  const tile = img(tw, th, 3);
  for (let y = 0; y < th; y++)
    for (let x = 0; x < tw; x++) {
      const o = (y * tw + x) * 3;
      if (y >= BAND) {
        for (let k = 0; k < 3; k++) tile.d[o + k] = passH.d[(y * tw + x) * 3 + k];
        continue;
      }
      const c = 0.5 + 0.62 * (nV(x / 260, 0.5) - 0.5);
      const t = smoothstep(c - 0.17, c + 0.17, y / BAND);
      const { wa, wb, norm } = seam(t);
      for (let k = 0; k < 3; k++) {
        const a = passH.d[((y + th) * tw + x) * 3 + k] - mean[k];
        const b = passH.d[(y * tw + x) * 3 + k] - mean[k];
        tile.d[o + k] = mean[k] + (a * wa + b * wb) * norm;
      }
    }

  // 4 · periodic flat field: any remaining slow tone change is divided out with a low-pass that wraps
  //     around the tile's edges, so no soft light or dark band appears where tiles meet
  for (let k = 0; k < 3; k++) {
    const ch = channel(tile, k);
    const low = blur(ch, tw, th, 140, true);
    for (let i = 0; i < ch.length; i++) ch[i] = (ch[i] / low[i]) * mean[k];
    setChannel(tile, k, ch);
  }

  const avg = mean.map((v) => Math.round(v * 255));
  return { tile, avg };
}

/** The tile as shipped: 80 % size (finer fibres on screen), WebP, ~60 KB. Compression keeps the fibres and
 *  the tone but smooths the paper's finest grain – global.css lays that back on top as a tiny SVG noise
 *  (no download). AVIF smooths more at the same size. Shown 1 image px = 1 CSS px. */
export async function paperFiles() {
  const { tile, avg } = await paper();
  const w = Math.round(tile.w * 0.8);
  const h = Math.round(tile.h * 0.8);
  const webp = await toSharp(tile).resize(w, h, { kernel: 'lanczos3' }).webp({ quality: 48, effort: 6 }).toBuffer();
  return {
    files: { 'rice-paper.webp': webp },
    note: `${w}×${h}, mean #${avg.map((v) => v.toString(16).padStart(2, '0')).join('')}`,
  };
}
