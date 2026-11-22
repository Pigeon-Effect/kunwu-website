// A detail in the site's own brush: a dry stroke, the divider between sections and under page titles.
import sharp from 'sharp';
import { stroke, taper, toRGBA } from './lib.mjs';

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
