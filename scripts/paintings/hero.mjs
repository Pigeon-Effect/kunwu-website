// 山水 – the landscape on the home screen: src/assets/photos/header/kungfu_landscape_4x.jpg, the school's own
// picture – misty peaks, an autumn tree, a figure in a bow stance on a stone bridge over a still river, and
// open mist on the left that holds the site's name.
// Like the painting excerpts, it is laid onto the site's paper: its own paper is divided out (white = nothing,
// for mix-blend-mode: multiply), its edges dissolve like mist, and the pseudo-inscription in its top right
// corner (malformed characters and an illegible seal, as image generators write them) is painted out – the
// page writes Wang Wei's couplet there with the site's own brush instead (src/pages/[lang]/index.astro).
// Two formats: wide (the whole picture, landscape screens) and tall (its right part, portrait screens).
import { fileURLToPath } from 'node:url';
import { blur, clamp01, fbm, load, luminance, maxFilter, smoothstep } from './lib.mjs';

const SRC = fileURLToPath(new URL('../../src/assets/photos/header/kungfu_landscape_4x.jpg', import.meta.url));
/** the picture's paper (sRGB: its brightest mist) – divided out, so the site's paper shows instead */
const PAPER = [244, 239, 228];
/** the pseudo-inscription and its seal (px of the full picture, 6336 × 2688) */
const INSCRIPTION = { x0: 6070, y0: 30, x1: 6300, y1: 610 };

export const FORMATS = {
  wide: { extract: { left: 0, top: 0, width: 6336, height: 2688 }, width: 3168, fade: { left: 0.08, top: 0.07, bottom: 0.11 }, seed: 71 },
  tall: { extract: { left: 3420, top: 0, width: 2916, height: 2688 }, width: 1600, fade: { left: 0.2, top: 0.08, bottom: 0.11 }, seed: 73 },
};

/** paint out the dark strokes and the red seal inside a box: filled from the mist around them */
function paintOut(im, box) {
  const { w, h } = im;
  const L = luminance(im);
  const x0 = Math.max(0, box.x0);
  const y0 = Math.max(0, box.y0);
  const x1 = Math.min(w, box.x1);
  const y1 = Math.min(h, box.y1);
  // the mist behind the strokes: brightest nearby, smoothed
  const r = Math.max(2, Math.round((box.x1 - box.x0) / 22));
  const bg = blur(maxFilter(L, w, h, r), w, h, r);
  const hole = new Float32Array(w * h);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = y * w + x;
      const red = im.d[i * 3] - (im.d[i * 3 + 1] + im.d[i * 3 + 2]) / 2;
      hole[i] = Math.max(smoothstep(0.02, 0.08, bg[i] - L[i]), smoothstep(0.04, 0.12, red));
    }
  // a little wider than the strokes, so no dark rim stays
  const grown = blur(hole, w, h, r * 0.6);
  for (let i = 0; i < hole.length; i++) hole[i] = Math.max(hole[i], smoothstep(0.02, 0.15, grown[i]));
  // fill: normalised convolution of what is left around the hole (a few passes, finer each time)
  for (const sigma of [r * 5, r * 2.5, r * 1.2]) {
    const keep = new Float32Array(w * h);
    for (let i = 0; i < keep.length; i++) keep[i] = 1 - hole[i];
    const wsum = blur(keep, w, h, sigma);
    for (let k = 0; k < 3; k++) {
      const ch = new Float32Array(w * h);
      for (let i = 0; i < ch.length; i++) ch[i] = im.d[i * 3 + k] * keep[i];
      const s = blur(ch, w, h, sigma);
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = y * w + x;
          if (hole[i] <= 0) continue;
          const fill = wsum[i] > 1e-3 ? s[i] / wsum[i] : 1;
          im.d[i * 3 + k] = im.d[i * 3 + k] * (1 - hole[i]) + fill * hole[i];
        }
    }
    for (let i = 0; i < hole.length; i++) hole[i] *= 0.35;
  }
}

/** One format: { image (float RGB, paper = white), mask } */
export async function hero(format) {
  const F = FORMATS[format];
  const s = F.width / F.extract.width;
  const im = await load(SRC, { extract: F.extract, resize: { width: F.width } });
  const { w, h } = im;

  // its paper → white: divide by the paper's colour, levels with a soft knee at the white point
  const white = 0.965;
  const knee = 0.05;
  for (let i = 0; i < w * h; i++)
    for (let k = 0; k < 3; k++) {
      let t = im.d[i * 3 + k] / (PAPER[k] / 255) / white;
      if (t > 1 - knee) t = 1 - knee + knee * smoothstep(1 - knee, 1 + knee, t);
      im.d[i * 3 + k] = clamp01(t);
    }

  paintOut(im, {
    x0: Math.round((INSCRIPTION.x0 - F.extract.left) * s),
    y0: Math.round((INSCRIPTION.y0 - F.extract.top) * s),
    x1: Math.round((INSCRIPTION.x1 - F.extract.left) * s),
    y1: Math.round((INSCRIPTION.y1 - F.extract.top) * s),
  });

  // edges dissolve like mist (the right edge is the screen's edge: it stays)
  const n = fbm(F.seed, 5);
  const mask = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const wob = (n(x / 520, y / 180) - 0.5) * 0.9;
      let v = 1;
      if (F.fade.top) v *= smoothstep(0, 1, y / (F.fade.top * h) + wob);
      if (F.fade.bottom) v *= smoothstep(0, 1, (h - 1 - y) / (F.fade.bottom * h) + wob);
      if (F.fade.left) v *= smoothstep(0, 1, x / (F.fade.left * w) + (n(y / 180, x / 520) - 0.5) * 0.9);
      mask[y * w + x] = clamp01(v);
    }
  return { image: im, mask };
}
