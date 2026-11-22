// 宣纸 – the site's paper: a large seamless tile grown from src/assets/photos/background/background_ricepaper.jpg
// at the photo's own resolution – extended, never stretched, so no fibre loses its sharpness.
// 1. the photo's light fall-off (darker corners) is divided out, so pieces do not meet in light/dark steps
// 2. the few most conspicuous marks are retouched and the darkest specks softened a little – no single mark
//    stands out enough to be recognised where it recurs
// 3. extended by image quilting (Efros & Freeman): the sheet is laid out of overlapping square pieces of the
//    photo, each turned or mirrored at random (paper fibres lie in every direction, so a turned piece is still
//    the same paper but no longer recognisable as a repeat), each chosen to match its neighbours, and joined
//    along the line where the two pieces differ least – the seams follow the gaps between fibres
// 4. seamless without mirroring: the quilt is larger than the tile, so the strip beyond the tile's right
//    (bottom) edge – the paper's true continuation – is cross-faded into the left (top) edge along a ragged
//    line, contrast-preserving, so the blend zone has the same grain
// 5. whiter: the sheet's tone is lifted to a warm white, its fibres and grain kept at full strength
import { fileURLToPath } from 'node:url';
import { blur, channel, fbm, img, load, lowpass, luminance, setChannel, smoothstep, toSharp } from './lib.mjs';

const SRC = fileURLToPath(new URL('../../src/assets/photos/background/background_ricepaper.jpg', import.meta.url));
/** tile size in photo px; shown at 2 photo px per CSS px → a 1400 × 1400 CSS px tile */
const TILE = 2800;
const BAND = 240;
/** quilting: piece size and overlap (photo px) */
const PIECE = 320;
const OVERLAP = 80;
/** the paper's new tone (sRGB 0–255): a warm white, and how strongly fibres and grain show on it */
const WHITE = [242, 239, 232];
const GAIN = 1.12;
const CHROMA = 0.75;

/** small seeded PRNG (mulberry32) */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1 · flat field + 2 · retouch: the photo, evenly lit and quieted */
async function prepare() {
  const src = await load(SRC);
  const { w, h } = src;

  // 1 · flat field: every channel divided by its own low-pass, scaled to the paper's centre tone
  for (let k = 0; k < 3; k++) {
    const ch = channel(src, k);
    const low = lowpass(ch, w, h, 520);
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
  //      would recognise where they recur – stamped over with quiet paper from close by
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
    for (let n = 0; n < 14; n++) {
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

  // 2b · soften only the extreme outliers (the darkest specks) relative to the local tone
  const lum = luminance(src);
  const local = blur(lum, w, h, 28);
  let sd = 0;
  for (let i = 0; i < lum.length; i++) sd += (lum[i] - local[i]) ** 2;
  sd = Math.sqrt(sd / lum.length);
  const lim = 3 * sd;
  for (let i = 0; i < lum.length; i++) {
    const d = lum[i] - local[i];
    if (d >= -lim) continue;
    const soft = -lim + (d + lim) * 0.5;
    const f = (local[i] + soft) / Math.max(1e-3, lum[i]);
    for (let k = 0; k < 3; k++) src.d[i * 3 + k] *= f;
  }

  // 2c · the most saturated specks and fibres (orange, rust) are pulled part of the way towards the local
  //      paper colour – on a whiter sheet they would read as pink
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
      if (dev[i] < 1.2 * sc) continue;
      const keep = (1.2 * sc + (dev[i] - 1.2 * sc) * 0.3) / dev[i];
      for (let k = 0; k < 3; k++) {
        const chroma = src.d[i * 3 + k] - lumNow[i];
        const base = localC[k][i] - localL[i];
        src.d[i * 3 + k] = lumNow[i] + base + (chroma - base) * keep;
      }
    }
  }
  return src;
}

/** 3 · image quilting: an N × N sheet laid out of turned and mirrored pieces of the photo */
function quilt(src, N, seed = 11) {
  const { w, h } = src;
  const P = PIECE;
  const O = OVERLAP;
  const S = P - O;
  const rand = rng(seed);
  const out = img(N, N, 3);
  const filled = new Uint8Array(N * N);

  // a piece of the photo at (sx, sy), turned / mirrored by o (one of the 8 symmetries of the square)
  const piece = (sx, sy, o) => {
    const p = new Float32Array(P * P * 3);
    for (let v = 0; v < P; v++)
      for (let u = 0; u < P; u++) {
        let a = o & 1 ? P - 1 - u : u;
        let b = o & 4 ? P - 1 - v : v;
        if (o & 2) [a, b] = [b, a];
        const si = ((sy + b) * w + (sx + a)) * 3;
        const di = (v * P + u) * 3;
        p[di] = src.d[si];
        p[di + 1] = src.d[si + 1];
        p[di + 2] = src.d[si + 2];
      }
    return p;
  };

  // squared difference between the sheet and a piece at (X, Y), per pixel of the piece (only where filled)
  const diff = (p, X, Y, u, v) => {
    const x = X + u;
    const y = Y + v;
    if (x >= N || y >= N || !filled[y * N + x]) return 0;
    const si = (y * N + x) * 3;
    const pi = (v * P + u) * 3;
    return (out.d[si] - p[pi]) ** 2 + (out.d[si + 1] - p[pi + 1]) ** 2 + (out.d[si + 2] - p[pi + 2]) ** 2;
  };

  const cells = Math.ceil((N - O) / S);
  for (let j = 0; j < cells; j++)
    for (let i = 0; i < cells; i++) {
      const X = i * S;
      const Y = j * S;
      // choose: the best match of the overlap among a few dozen random pieces
      let best = null;
      let bestErr = Infinity;
      const tries = i === 0 && j === 0 ? 1 : 40;
      for (let t = 0; t < tries; t++) {
        const sx = Math.floor(rand() * (w - P));
        const sy = Math.floor(rand() * (h - P));
        const o = Math.floor(rand() * 8);
        const p = piece(sx, sy, o);
        let e = 0;
        if (i > 0) for (let v = 0; v < P; v += 3) for (let u = 0; u < O; u += 3) e += diff(p, X, Y, u, v);
        if (j > 0) for (let v = 0; v < O; v += 3) for (let u = O; u < P; u += 3) e += diff(p, X, Y, u, v);
        if (e < bestErr) {
          bestErr = e;
          best = p;
        }
      }
      const p = best;

      // join: minimum-error boundary cuts through the left and top overlaps
      const m = new Float32Array(P * P).fill(1);
      // E(a, c): the error at position a along the overlap strip (P long) and c across it (O wide)
      const cut = (E) => {
        const along = P;
        const across = O;
        const cost = new Float32Array(along * across);
        for (let a = 0; a < along; a++)
          for (let c = 0; c < across; c++) {
            const e = E(a, c);
            if (a === 0) cost[c] = e;
            else {
              let mn = cost[(a - 1) * across + c];
              if (c > 0) mn = Math.min(mn, cost[(a - 1) * across + c - 1]);
              if (c < across - 1) mn = Math.min(mn, cost[(a - 1) * across + c + 1]);
              cost[a * across + c] = e + mn;
            }
          }
        const path = new Int32Array(along);
        let c = 0;
        for (let k = 1; k < across; k++) if (cost[(along - 1) * across + k] < cost[(along - 1) * across + c]) c = k;
        path[along - 1] = c;
        for (let a = along - 2; a >= 0; a--) {
          let nc = c;
          for (const d of [-1, 1]) {
            const k = c + d;
            if (k >= 0 && k < across && cost[a * across + k] < cost[a * across + nc]) nc = k;
          }
          c = nc;
          path[a] = c;
        }
        return path;
      };
      if (i > 0) {
        const path = cut((a, c) => diff(p, X, Y, c, a));
        for (let v = 0; v < P; v++) for (let u = 0; u < path[v]; u++) m[v * P + u] = 0;
      }
      if (j > 0) {
        const path = cut((a, c) => diff(p, X, Y, a, c));
        for (let u = 0; u < P; u++) for (let v = 0; v < path[u]; v++) m[v * P + u] = 0;
      }
      // a soft edge of a pixel or two along the cut, so the grain meets without a step
      const mb = blur(m, P, P, 1.2);
      for (let v = 0; v < P; v++)
        for (let u = 0; u < P; u++) {
          const x = X + u;
          const y = Y + v;
          if (x >= N || y >= N) continue;
          const di = (y * N + x) * 3;
          const pi = (v * P + u) * 3;
          const a = filled[y * N + x] ? (m[v * P + u] === 1 && mb[v * P + u] > 0.999 ? 1 : mb[v * P + u]) : 1;
          for (let k = 0; k < 3; k++) out.d[di + k] = out.d[di + k] * (1 - a) + p[pi + k] * a;
          filled[y * N + x] = 1;
        }
    }
  return out;
}

export async function paper() {
  const src = quilt(await prepare(), TILE + BAND);
  const { w, h } = src;

  // channel means (for the contrast-preserving blend)
  const mean = [0, 1, 2].map((k) => {
    let s = 0;
    for (let i = 0; i < w * h; i++) s += src.d[i * 3 + k];
    return s / (w * h);
  });

  // 4 · seamless: horizontal pass, then vertical
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

  // periodic flat field: any remaining slow tone change is divided out with a low-pass that wraps around
  // the tile's edges, so no soft light or dark band appears where tiles meet
  for (let k = 0; k < 3; k++) {
    const ch = channel(tile, k);
    const low = blur(ch, tw, th, 160, true);
    for (let i = 0; i < ch.length; i++) ch[i] = (ch[i] / low[i]) * mean[k];
    setChannel(tile, k, ch);
  }

  // 5 · whiter: the mean tone moves to WHITE; fibres and grain keep (a little more than) their light and dark,
  //     a little less of their colour
  const meanL = 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2];
  for (let i = 0; i < tw * th; i++) {
    const j = i * 3;
    const dl = 0.2126 * tile.d[j] + 0.7152 * tile.d[j + 1] + 0.0722 * tile.d[j + 2] - meanL;
    for (let k = 0; k < 3; k++) {
      const dc = tile.d[j + k] - mean[k] - dl;
      tile.d[j + k] = WHITE[k] / 255 + dl * GAIN + dc * CHROMA;
    }
  }
  const avg = [0, 1, 2].map((k) => {
    let s = 0;
    for (let i = 0; i < tw * th; i++) s += Math.min(1, Math.max(0, tile.d[i * 3 + k]));
    return Math.round((s / (tw * th)) * 255);
  });
  return { tile, avg };
}

/** Compression spends most of its bytes on the paper's finest, faintest grain: it is thinned a little (a soft
 *  threshold on the finest detail – fibres and specks stand well above it and stay as they are). global.css
 *  lays a fine grain back on top as a tiny SVG noise, drawn at the screen's own resolution (no download). */
function thinGrain(tile, amount) {
  for (let k = 0; k < 3; k++) {
    const ch = channel(tile, k);
    const lo = blur(ch, tile.w, tile.h, 1.2, true);
    let sd = 0;
    for (let i = 0; i < ch.length; i++) sd += (ch[i] - lo[i]) ** 2;
    const t = amount * Math.sqrt(sd / ch.length);
    for (let i = 0; i < ch.length; i++) {
      const hp = ch[i] - lo[i];
      ch[i] = lo[i] + Math.sign(hp) * Math.max(0, Math.abs(hp) - t);
    }
    setChannel(tile, k, ch);
  }
  return tile;
}

/** The tile as shipped, WebP, shown as a 1400 × 1400 CSS px tile (global.css):
 *    rice-paper.webp     1400 px – what every screen loads first
 *    rice-paper@2x.webp  2800 px, the photo's full resolution – swapped in after the page has loaded, on
 *                        screens with 1.5 device px per CSS px or more (Base.astro adds html.paper-hd), so it
 *                        never competes with what the page needs first */
export async function paperFiles() {
  const { tile, avg } = await paper();
  thinGrain(tile, 0.5);
  const two = await toSharp(tile).webp({ quality: 52, effort: 6 }).toBuffer();
  const one = await toSharp(tile).resize(tile.w / 2, tile.h / 2, { kernel: 'lanczos3' }).webp({ quality: 58, effort: 6 }).toBuffer();
  return {
    files: { 'rice-paper@2x.webp': two, 'rice-paper.webp': one },
    note: `${tile.w}×${tile.h} (2×) / ${tile.w / 2}×${tile.h / 2} (1×), mean #${avg.map((v) => v.toString(16).padStart(2, '0')).join('')}`,
  };
}
