// 人物 – small figures practising kung fu, in the manner of the figures in Ren Yu's landscapes: a fine,
// slightly broken ink outline, pale washes of colour (celadon, ochre, grey, a little cinnabar), and solid
// ink only for hair, sash and boots. None of the source paintings shows martial arts, so they are painted
// here: each pose is a skeleton in units of the figure's height, dressed in sleeves, trousers and a tunic.
//
// Poses: master (standing, hands behind his back, watching), kick (侧踹 side kick), punch (弓步冲拳 bow
// stance, straight punch), staff (齐眉棍 eyebrow-high staff, thrust in a bow stance).
import { clamp01, fbm, smoothstep, valueNoise } from './lib.mjs';

const SS = 4; // supersampling
const INK = [34, 30, 26];
const SKIN = [232, 208, 180];
const TROUSERS = [226, 222, 212];
export const ROBES = {
  grey: [146, 156, 162],
  ochre: [204, 170, 120],
  celadon: [150, 182, 168],
  stone: [178, 172, 162],
  cinnabar: [192, 84, 58],
};

/* ------------------------------------------------------------------ poses (x right, y up = negative) */
// limbs: [joints…] with widths at each joint; all in units of the figure height H
const POSES = {
  master: (c) => ({
    parts: [
      // arm behind the back (drawn first, mostly hidden by the robe)
      { kind: 'limb', pts: [[0.02, -0.8], [0.08, -0.64], [0.11, -0.56]], w: [0.09, 0.092, 0.1], fill: c.robe },
      // boots under the long robe
      { kind: 'limb', pts: [[-0.05, -0.05], [-0.13, -0.015]], w: [0.05, 0.045], fill: 'ink', cut: false },
      { kind: 'limb', pts: [[0.05, -0.05], [-0.02, -0.015]], w: [0.05, 0.045], fill: 'ink', cut: false },
      // long robe: shoulders to the ankles, widening
      { kind: 'trunk', spine: [[0, -0.82], [0.01, -0.5], [0.02, -0.06]], w: [0.2, 0.18, 0.32], fill: c.robe },
      { kind: 'limb', pts: [[-0.085, -0.53], [0.1, -0.52]], w: [0.035, 0.035], fill: 'ink', cut: false }, // sash
      // near arm, sleeve hanging, hand tucked behind
      { kind: 'limb', pts: [[-0.01, -0.79], [0.03, -0.64], [0.08, -0.57]], w: [0.095, 0.095, 0.105], fill: c.robe },
      { kind: 'head', at: [-0.005, -0.915], r: 0.066, hair: 'cap' },
    ],
  }),
  kick: (c) => ({
    parts: [
      { kind: 'limb', pts: [[0.2, -0.76], [0.34, -0.66], [0.43, -0.6]], w: [0.078, 0.08, 0.092], fill: c.robe }, // rear arm
      { kind: 'disc', at: [0.445, -0.595], r: 0.024, fill: 'skin' },
      // supporting leg
      { kind: 'limb', pts: [[0.06, -0.5], [0.08, -0.27], [0.07, -0.05]], w: [0.12, 0.1, 0.085], fill: 'trousers' },
      { kind: 'limb', pts: [[0.07, -0.05], [0.15, -0.015]], w: [0.055, 0.048], fill: 'ink', cut: false },
      // kicking leg, out level, heel leading
      { kind: 'limb', pts: [[0.04, -0.5], [-0.18, -0.55], [-0.41, -0.6]], w: [0.125, 0.1, 0.085], fill: 'trousers' },
      { kind: 'limb', pts: [[-0.4, -0.56], [-0.47, -0.66]], w: [0.055, 0.045], fill: 'ink', cut: false },
      // torso leaning away from the kick
      { kind: 'trunk', spine: [[0.22, -0.77], [0.06, -0.52], [0.02, -0.4]], w: [0.18, 0.16, 0.23], fill: c.robe },
      { kind: 'limb', pts: [[0.0, -0.5], [0.15, -0.55]], w: [0.035, 0.035], fill: c.sash, cut: false },
      { kind: 'limb', pts: [[0.2, -0.76], [0.08, -0.79], [0.0, -0.86]], w: [0.078, 0.08, 0.092], fill: c.robe }, // guard
      { kind: 'disc', at: [-0.015, -0.875], r: 0.024, fill: 'skin' },
      { kind: 'head', at: [0.29, -0.865], r: 0.064, hair: 'knot' },
    ],
  }),
  punch: (c) => ({
    parts: [
      { kind: 'limb', pts: [[-0.01, -0.71], [-0.11, -0.58], [-0.04, -0.5]], w: [0.078, 0.08, 0.092], fill: c.robe }, // chambered fist
      { kind: 'limb', pts: [[-0.02, -0.42], [-0.17, -0.22], [-0.33, -0.05]], w: [0.125, 0.1, 0.085], fill: 'trousers' }, // back leg
      { kind: 'limb', pts: [[-0.33, -0.05], [-0.27, -0.015]], w: [0.055, 0.048], fill: 'ink', cut: false },
      { kind: 'limb', pts: [[0.01, -0.42], [0.2, -0.25], [0.22, -0.05]], w: [0.125, 0.105, 0.085], fill: 'trousers' }, // front leg
      { kind: 'limb', pts: [[0.22, -0.05], [0.3, -0.015]], w: [0.055, 0.048], fill: 'ink', cut: false },
      { kind: 'trunk', spine: [[0.01, -0.74], [0.0, -0.45], [0.0, -0.33]], w: [0.19, 0.16, 0.25], fill: c.robe },
      { kind: 'limb', pts: [[-0.08, -0.45], [0.08, -0.45]], w: [0.035, 0.035], fill: c.sash, cut: false },
      { kind: 'limb', pts: [[0.02, -0.72], [0.2, -0.715], [0.36, -0.71]], w: [0.078, 0.08, 0.092], fill: c.robe }, // punch
      { kind: 'disc', at: [0.385, -0.71], r: 0.025, fill: 'skin' },
      { kind: 'head', at: [0.025, -0.845], r: 0.064, hair: 'knot' },
    ],
  }),
  staff: (c) => ({
    parts: [
      { kind: 'limb', pts: [[0.02, -0.42], [0.17, -0.22], [0.33, -0.05]], w: [0.125, 0.1, 0.085], fill: 'trousers' }, // back leg
      { kind: 'limb', pts: [[0.33, -0.05], [0.27, -0.015]], w: [0.055, 0.048], fill: 'ink', cut: false },
      { kind: 'limb', pts: [[-0.01, -0.42], [-0.2, -0.25], [-0.22, -0.05]], w: [0.125, 0.105, 0.085], fill: 'trousers' }, // front leg
      { kind: 'limb', pts: [[-0.22, -0.05], [-0.3, -0.015]], w: [0.055, 0.048], fill: 'ink', cut: false },
      { kind: 'trunk', spine: [[-0.02, -0.74], [0.0, -0.45], [0.0, -0.33]], w: [0.19, 0.16, 0.25], fill: c.robe },
      { kind: 'limb', pts: [[-0.08, -0.45], [0.08, -0.45]], w: [0.035, 0.035], fill: c.sash, cut: false },
      { kind: 'limb', pts: [[0.0, -0.72], [0.1, -0.6], [0.04, -0.6]], w: [0.078, 0.08, 0.092], fill: c.robe }, // rear hand on the staff
      { kind: 'staff', from: [0.4, -0.555], to: [-0.6, -0.705], w: 0.022 },
      { kind: 'limb', pts: [[-0.02, -0.72], [-0.14, -0.66], [-0.22, -0.65]], w: [0.078, 0.08, 0.092], fill: c.robe }, // front hand
      { kind: 'disc', at: [-0.235, -0.653], r: 0.024, fill: 'skin' },
      { kind: 'disc', at: [0.035, -0.6], r: 0.023, fill: 'skin' },
      { kind: 'head', at: [-0.03, -0.845], r: 0.064, hair: 'knot' },
    ],
  }),
};

/* ------------------------------------------------------------------ rasterising */

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy || 1e-9;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { d: Math.hypot(px - (ax + t * dx), py - (ay + t * dy)), t };
}

/** coverage test for one part at a point (figure units); `g` 0..1 roughens the edge like a brush */
function inside(part, x, y, g = 1) {
  if (part.kind === 'limb' || part.kind === 'staff') {
    const pts = part.kind === 'staff' ? [part.from, part.to] : part.pts;
    const ws = part.kind === 'staff' ? [part.w, part.w * 0.8] : part.w;
    for (let i = 0; i < pts.length - 1; i++) {
      const { d, t } = segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      // cloth ends (cuffs, trouser hems) are cut straight; joints stay round
      if (part.cut !== false && i === pts.length - 2 && t >= 1) continue;
      if (d <= ((ws[i] + (ws[i + 1] - ws[i]) * t) / 2) * g) return true;
    }
    return false;
  }
  if (part.kind === 'disc' || part.kind === 'head') return Math.hypot(x - part.at[0], y - part.at[1]) <= part.r * (0.5 + 0.5 * g);
  if (part.kind === 'trunk') {
    // a tapered band around the spine; the hem is cut straight across
    const s = part.spine;
    for (let i = 0; i < s.length - 1; i++) {
      const { d, t } = segDist(x, y, s[i][0], s[i][1], s[i + 1][0], s[i + 1][1]);
      const half = ((part.w[i] + (part.w[i + 1] - part.w[i]) * t) / 2) * g;
      if (d <= half && t > 0 && t < 1) return true;
      // rounded shoulders at the top; the hem stays cut straight
      if (i === 0 && t === 0 && d <= half * 0.9) return true;
    }
    return false;
  }
  return false;
}

/**
 * Paint one figure into the canvas (white-ground RGB float image, multiplied in).
 * { pose, x, y (ground point, canvas px), h (height px), face: 1 right | -1 left, robe, sash, seed }
 */
export function figure(c, { pose, x: gx, y: gy, h: H, face = 1, robe = ROBES.ochre, sash = ROBES.cinnabar, seed = 1 }) {
  const { parts } = POSES[pose]({ robe, sash });
  const box = { x0: -0.75, x1: 0.75, y0: -1.05, y1: 0.08 }; // figure units
  const W = Math.ceil((box.x1 - box.x0) * H * SS);
  const Hh = Math.ceil((box.y1 - box.y0) * H * SS);
  const label = new Int16Array(W * Hh).fill(-1);
  const toUnits = (px, py) => [face * (box.x0 + px / (H * SS)), box.y0 + py / (H * SS)];
  const rough = fbm(seed + 11, 3);
  for (let py = 0; py < Hh; py++)
    for (let px = 0; px < W; px++) {
      const [ux, uy] = toUnits(px + 0.5, py + 0.5);
      const g = 1 + 0.3 * (rough(ux * 9 + 9, uy * 9 + 9) - 0.5);
      for (let k = parts.length - 1; k >= 0; k--)
        if (inside(parts[k], ux, uy, g)) {
          label[py * W + px] = k;
          break;
        }
    }

  // hair: a dark cap or a top-knot on the back/top half of the head
  const headIdx = parts.findIndex((p) => p.kind === 'head');
  const head = parts[headIdx];
  const isHair = (ux, uy) => {
    const hx = (ux - head.at[0]) / head.r;
    const hy = (uy - head.at[1]) / head.r;
    if (hx * hx + hy * hy > 1) {
      // top-knot: a small bun above the crown
      return head.hair === 'knot' && Math.hypot(ux - (head.at[0] - 0.02), uy - (head.at[1] - head.r * 1.05)) < head.r * 0.42;
    }
    // hair covers the top and the back (away from the face, which looks towards +x before mirroring)
    return hy < -0.15 + 0.55 * Math.max(0, -hx) || (hx < -0.35 && hy < 0.55) || (head.hair === 'cap' && hy < 0.05);
  };

  // hair gets its own label, so it is outlined and filled with ink
  for (let py = 0; py < Hh; py++)
    for (let px = 0; px < W; px++) {
      const [ux, uy] = toUnits(px + 0.5, py + 0.5);
      if (isHair(ux, uy)) label[py * W + px] = 999;
    }

  // outline: where the label changes, or at the silhouette – thickened to ~1.1 px
  const R = Math.max(1, Math.round(SS * 0.55 * Math.min(1.4, H / 70)));
  const edge = new Uint8Array(W * Hh);
  for (let py = 0; py < Hh; py++)
    for (let px = 0; px < W; px++) {
      const l = label[py * W + px];
      if (l < 0) continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of nb) {
        const qx = px + dx;
        const qy = py + dy;
        const m = qx < 0 || qy < 0 || qx >= W || qy >= Hh ? -1 : label[qy * W + qx];
        if (m !== l) {
          edge[py * W + px] = 1;
          break;
        }
      }
    }
  const brk = valueNoise(seed + 5);
  const press = valueNoise(seed + 9);
  const inkD = new Float32Array(W * Hh);
  for (let py = 0; py < Hh; py++)
    for (let px = 0; px < W; px++) {
      if (!edge[py * W + px]) continue;
      // broken line: some stretches fainter, as a fine brush lifts; the pressure swells and thins it
      const b = 0.5 + 0.5 * smoothstep(0.25, 0.6, brk(px / (SS * 3.5), py / (SS * 3.5)));
      const rr = R * (0.65 + 0.75 * press(px / (SS * 5), py / (SS * 5)));
      for (let dy = -R - 1; dy <= R + 1; dy++)
        for (let dx = -R - 1; dx <= R + 1; dx++) {
          if (dx * dx + dy * dy > rr * rr) continue;
          const qx = px + dx;
          const qy = py + dy;
          if (qx < 0 || qy < 0 || qx >= W || qy >= Hh) continue;
          inkD[qy * W + qx] = Math.max(inkD[qy * W + qx], 0.8 * b);
        }
    }

  // colour: pale washes that pool a little darker towards their edges, never perfectly even
  const near = new Float32Array(W * Hh);
  {
    const r = Math.max(2, Math.round(SS * 1.6 * Math.min(1.4, H / 70)));
    for (let py = 0; py < Hh; py++)
      for (let px = 0; px < W; px++) {
        if (!edge[py * W + px]) continue;
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const qx = px + dx;
            const qy = py + dy;
            if (qx < 0 || qy < 0 || qx >= W || qy >= Hh) continue;
            const v = 1 - Math.hypot(dx, dy) / (r + 1);
            if (v > near[qy * W + qx]) near[qy * W + qx] = v;
          }
      }
  }
  const wash = fbm(seed, 3);
  const rgb = new Float32Array(W * Hh * 3).fill(1);
  const colourOf = (k) => {
    if (k === 999) return { col: INK, a: 0.9 };
    const f = parts[k].fill;
    if (f === 'ink') return { col: INK, a: 0.88 };
    if (f === 'skin') return { col: SKIN, a: 0.5 };
    if (f === 'trousers') return { col: TROUSERS, a: 0.45 };
    if (parts[k].kind === 'staff') return { col: [78, 58, 40], a: 0.9 };
    if (parts[k].kind === 'head') return { col: SKIN, a: 0.5 };
    return { col: f, a: 0.5 };
  };
  for (let py = 0; py < Hh; py++)
    for (let px = 0; px < W; px++) {
      const i = py * W + px;
      const k = label[i];
      if (k < 0) continue;
      let { col, a } = colourOf(k);
      if (a < 0.8) a *= 1 + 0.45 * near[i];
      a *= 0.84 + 0.32 * (wash((px / SS) * 0.35, (py / SS) * 0.35) - 0.5);
      for (let ch = 0; ch < 3; ch++) rgb[i * 3 + ch] = 1 - clamp01(a) * (1 - col[ch] / 255);
    }

  // a faint shadow on the ground, under the feet
  const shadow = (ux, uy) => {
    const v = ((ux - 0) / 0.32) ** 2 + ((uy - 0.0) / 0.025) ** 2;
    return v < 1 ? 0.16 * (1 - v) : 0;
  };

  // downsample and multiply into the canvas
  const fw = Math.ceil(W / SS);
  const fh = Math.ceil(Hh / SS);
  const ox = Math.round(gx + box.x0 * H);
  const oy = Math.round(gy + box.y0 * H);
  for (let y = 0; y < fh; y++)
    for (let x = 0; x < fw; x++) {
      let r = 0, g = 0, bl = 0, ink = 0, n = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const px = x * SS + sx;
          const py = y * SS + sy;
          if (px >= W || py >= Hh) continue;
          const i = py * W + px;
          r += rgb[i * 3];
          g += rgb[i * 3 + 1];
          bl += rgb[i * 3 + 2];
          ink += inkD[i];
          n++;
        }
      r /= n; g /= n; bl /= n; ink /= n;
      const [ux, uy] = toUnits(x * SS + SS / 2, y * SS + SS / 2);
      const sh = shadow(ux, uy);
      const cx = ox + x;
      const cy = oy + y;
      if (cx < 0 || cy < 0 || cx >= c.w || cy >= c.h) continue;
      const di = (cy * c.w + cx) * 3;
      const px = [r, g, bl];
      for (let k = 0; k < 3; k++) {
        let v = px[k] * (1 - clamp01(ink) * (1 - INK[k] / 255));
        v *= 1 - sh * (1 - 0.55);
        c.d[di + k] *= v;
      }
    }
}

/** Several figures: [{ pose, x, y, h, face, robe, sash }] */
export function figures(c, list) {
  list.forEach((f, i) => figure(c, { seed: 31 + i * 7, ...f }));
}
