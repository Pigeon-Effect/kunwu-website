/**
 * Calligraphy (楷书) for titles, written stroke by stroke in the correct stroke order.
 *
 * Stroke outlines, medians and order come from Make Me a Hanzi via the `hanzi-writer-data` package
 * (outlines derived from Arphic PL KaitiM GB – Arphic Public License, see node_modules/hanzi-writer-data/ARPHICPL.TXT).
 * The data is read at build time only; the pages receive plain inline SVG, nothing is loaded at runtime.
 *
 * Coordinates are the font's: a 1024 em square, y up, baseline at 900 – hence the
 * `translate(0 900) scale(1 -1)` in the component.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Pt = [number, number];

export interface Stroke {
  /** filled outline of the stroke (also the clip for the moving brush) */
  outline: string;
  /** centre line the brush follows, extended a little before the stroke's start */
  median: string;
  /** length of the median in font units */
  length: number;
}

const DATA = join(process.cwd(), 'node_modules', 'hanzi-writer-data');
const cache = new Map<string, Stroke[]>();

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** move the first point back along the stroke, so the round brush tip starts outside the outline */
function extendStart(pts: Pt[], by: number): Pt[] {
  if (pts.length < 2) return pts;
  const a = pts[0]!;
  const b = pts[1]!;
  const d = dist(a, b) || 1;
  const start: Pt = [a[0] - ((b[0] - a[0]) / d) * by, a[1] - ((b[1] - a[1]) / d) * by];
  return [start, ...pts.slice(1)];
}

export function strokesOf(char: string): Stroke[] {
  const hit = cache.get(char);
  if (hit) return hit;
  let raw: { strokes: string[]; medians: Pt[][] };
  try {
    raw = JSON.parse(readFileSync(join(DATA, `${char}.json`), 'utf8'));
  } catch {
    throw new Error(`calligraphy: no stroke data for "${char}" (hanzi-writer-data)`);
  }
  const strokes = raw.strokes.map((outline, i) => {
    const pts = extendStart(raw.medians[i] ?? [], 80);
    let length = 0;
    for (let k = 1; k < pts.length; k++) length += dist(pts[k - 1]!, pts[k]!);
    const median = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${Math.round(x)} ${Math.round(y)}`).join('');
    return { outline: outline.replace(/\s*([MLQCZ])\s*/g, '$1').trim(), median, length: Math.max(length, 1) };
  });
  cache.set(char, strokes);
  return strokes;
}
