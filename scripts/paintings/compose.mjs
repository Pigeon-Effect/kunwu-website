// Cutting painting excerpts: a region of a source painting, flattened (its paper → white), masked with a
// ragged, misty edge, optionally lightened for distance. White stays paper on the site.
import { fileURLToPath } from 'node:url';
import {
  borderFade,
  clamp01,
  fbm,
  flatten,
  img,
  load,
  polygon,
  ragged,
  smoothstep,
} from './lib.mjs';

export const SOURCES = fileURLToPath(new URL('../../src/assets/photos/chinese_traditional_paintings/', import.meta.url));

/** Flatten settings that suit most album leaves and scrolls. */
export const FLAT = { paperScale: 260, inkRadius: 45, white: 0.93 };

const cache = new Map();
/** A flattened excerpt (cached per source + region + settings). */
export async function excerpt(src, extract, flat = FLAT, resize) {
  const key = JSON.stringify([src, extract, flat, resize]);
  if (!cache.has(key)) cache.set(key, flatten(await load(SOURCES + src, { extract, resize }), flat));
  return cache.get(key);
}

/**
 * Mask for an excerpt of size w × h.
 *   keep     polygon(s) in relative coords (0..1) – what to keep; default the whole rect
 *   fade     { top, bottom, left, right } – fraction of the size over which that side dissolves into mist
 *   feather  px of the soft edge around `keep`; rag: how ragged (0..1)
 *   mist     how far the mist line wanders (fraction of the fade); drift: noise stretch [x, y]
 */
export function mask(w, h, { keep = null, fade = {}, feather = 50, rag = 0.55, seed = 1, mist = 0.5, drift = [3, 0.7] } = {}) {
  let m;
  if (keep) {
    const polys = Array.isArray(keep[0][0]) ? keep : [keep];
    const shape = new Float32Array(w * h);
    for (const p of polys) {
      const pm = polygon(w, h, p.map(([x, y]) => [x * w, y * h]));
      for (let i = 0; i < shape.length; i++) shape[i] = Math.max(shape[i], pm[i]);
    }
    m = ragged(shape, w, h, { feather, rag, seed });
  } else m = new Float32Array(w * h).fill(1);
  const n = fbm(seed + 17, 5);
  const amp = mist; // how far the mist line wanders, as a fraction of the fade length
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = m[i];
      // mist lies in horizontal bands: the noise is stretched sideways (drift)
      const wob = (n(x / (150 * drift[0]), y / (150 * drift[1])) - 0.5) * 2 * amp;
      if (fade.top) v *= smoothstep(0, 1, y / (fade.top * h) + wob);
      if (fade.bottom) v *= smoothstep(0, 1, (h - 1 - y) / (fade.bottom * h) + wob);
      if (fade.left) v *= smoothstep(0, 1, x / (fade.left * w) + wob);
      if (fade.right) v *= smoothstep(0, 1, (w - 1 - x) / (fade.right * w) + wob);
      m[i] = clamp01(v);
    }
  return borderFade(m, w, h, 3);
}

/** Lighten (lift < 1 keeps that share of the ink) and desaturate an excerpt: distance in ink painting. */
export function tone(f, { lift = 1, sat = 1 }) {
  const out = img(f.w, f.h, 3);
  for (let i = 0; i < f.w * f.h; i++) {
    const j = i * 3;
    const l = 0.2126 * f.d[j] + 0.7152 * f.d[j + 1] + 0.0722 * f.d[j + 2];
    for (let k = 0; k < 3; k++) {
      const c = l + (f.d[j + k] - l) * sat;
      out.d[j + k] = 1 - (1 - c) * lift;
    }
  }
  return out;
}

