// Small details in the same brush: a dry stroke (divider) and a plum branch (梅 – for Meihua Quan).
import sharp from 'sharp';
import { dab, over, rng, stroke, taper, toRGBA } from './lib.mjs';

const VERMILION = [172, 52, 34];

export async function paintStroke() {
  const W = 900;
  const H = 90;
  const c = new Float32Array(W * H);
  stroke(c, W, H, [[24, 52], [300, 44], [600, 42], [876, 36]], {
    width: taper(30, 12, { press: 0.05, lift: 0.3 }),
    ink: 0.88,
    dry: 0.9,
    dryFrom: 0.2,
    bristles: 22,
    seed: 31,
  });
  return sharp(toRGBA(c, W, H), { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

export async function paintPlum() {
  const W = 900;
  const H = 640;
  const r = rng(77);
  const wood = new Float32Array(W * H);
  const bloom = new Float32Array(W * H);
  const heart = new Float32Array(W * H);

  // old branch: angular, dry-brushed; young twigs thin and quick
  stroke(wood, W, H, [[8, 632], [130, 500], [235, 440], [335, 318], [470, 262], [560, 168], [650, 118]], {
    width: taper(40, 6, { press: 0.04, lift: 0.3 }), ink: 0.9, dry: 0.75, dryFrom: 0.15, bristles: 12, seed: 41,
  });
  const twigs = [
    [[335, 318], [420, 340], [520, 330], [612, 362]],
    [[470, 262], [486, 190], [528, 96]],
    [[235, 440], [306, 478], [392, 490]],
    [[560, 168], [640, 186], [720, 170]],
    [[130, 500], [140, 420], [176, 360]],
  ];
  twigs.forEach((t, i) => stroke(wood, W, H, t, { width: taper(12, 2, { lift: 0.5 }), ink: 0.85, dry: 0.4, dryFrom: 0.5, seed: 50 + i }));

  // blossoms: five pale vermilion petals, dark stamens
  const flower = (x, y, size, turn) => {
    for (let p = 0; p < 5; p++) {
      const a = turn + (p / 5) * Math.PI * 2;
      dab(bloom, W, H, x + Math.cos(a) * size * 0.9, y + Math.sin(a) * size * 0.9, size, size * 0.85, { ink: 0.5, rim: 0.55, rot: a, rough: 0.12, seed: Math.round(x + y + p) });
    }
    for (let s = 0; s < 7; s++) {
      const a = r() * Math.PI * 2;
      const d = size * (0.4 + r() * 0.5);
      dab(heart, W, H, x + Math.cos(a) * d, y + Math.sin(a) * d, 1.6, 1.6, { ink: 0.85, rim: 0, seed: s });
    }
  };
  const flowers = [
    // x, y, petal size
    [560, 164, 17], [438, 330, 16], [300, 470, 15], [520, 104, 14], [612, 360, 15], [176, 362, 14], [700, 172, 12],
  ];
  flowers.forEach(([x, y, s]) => flower(x, y, s, r() * 6));
  // buds
  [[395, 488], [648, 120], [500, 228], [262, 430]].forEach(([x, y], i) =>
    dab(bloom, W, H, x, y, 5.5, 5, { ink: 0.85, rim: 0.2, seed: 90 + i }),
  );

  const img = toRGBA(wood, W, H);
  over(img, toRGBA(bloom, W, H, VERMILION));
  over(img, toRGBA(heart, W, H));
  return sharp(img, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}
