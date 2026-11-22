// 水 – still water in the old manner: untouched paper, crossed here and there by long, pale, dry ripple
// lines that break off and start again (after the water in Bian Shoumin's "Geese Descending on a
// Sandbank"), faint under the far shore, a little stronger towards the near bank. The light lies on the
// open water in between.
import { rng, stroke, taper } from '../ink/lib.mjs';
import { inkInto } from './lib.mjs';

const WATER_INK = [96, 102, 108]; // a cool, pale ink

/**
 * rows: [{ x, y, len, n?, ink? }] – a ripple row starting at x (relative to the water box), y its level,
 * len its length. Each row: a long line broken into 2–4 pieces, with a shorter echo just below.
 */
export function water(c, { x: X, y: Y, w: W, h: H, rows, seed = 1, ink = 1 }) {
  const plane = new Float32Array(W * H);
  const r = rng(seed);
  const line = (x0, y0, len, strength, width) => {
    const pts = [];
    const k = 5;
    for (let i = 0; i <= k; i++) pts.push([x0 + (len * i) / k, y0 + Math.sin(i * 1.7 + r() * 6) * 1.6 + (r() - 0.5) * 1.2]);
    stroke(plane, W, H, pts, {
      width: taper(width, width * 0.6, { press: 0.12, lift: 0.35 }),
      ink: strength * ink,
      dry: 0.8,
      dryFrom: 0,
      bristles: 9,
      seed: Math.floor(r() * 1e6),
    });
  };
  for (const row of rows) {
    const strength = row.ink ?? 0.2;
    const width = row.width ?? 3.2;
    // the row breaks into pieces with small gaps
    let x = row.x;
    const end = row.x + row.len;
    while (x < end - 20) {
      const piece = Math.min(end - x, 60 + r() * row.len * 0.5);
      line(x, row.y + (r() - 0.5) * 2, piece, strength * (0.75 + r() * 0.4), width);
      x += piece + 10 + r() * 34;
    }
    // a shorter echo below
    for (let e = 0; e < (row.n ?? 1); e++) {
      const len = row.len * (0.25 + r() * 0.35);
      line(row.x + r() * (row.len - len), row.y + 11 + e * 10 + r() * 4, len, strength * 0.7, width * 0.85);
    }
  }
  inkInto(c, plane, W, H, X, Y, WATER_INK);
}
