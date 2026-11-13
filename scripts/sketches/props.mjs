// Scenery and objects, drawn in the same pencil hand as the figures.
import { add, ellipsePts, blob, smooth, HATCH } from './pencil.mjs';

const back = { layer: 'back' };
const faint = (o = 0.5) => ({ layer: 'back', opacity: o });

/** Layered hill ridges across the sheet, the nearest one hatched. */
export function hills(s, baseY) {
  const w = s.w;
  const ridge = (y, amp, step, seed) => {
    const pts = [];
    for (let x = -20; x <= w + 20; x += step) pts.push([x, y - amp * (0.5 + 0.5 * Math.sin(x / (55 + seed) + seed))]);
    return pts;
  };
  const far = ridge(baseY - 70, 50, 30, 3);
  s.curve(far, { strokeWidth: 0.9, roughness: 1.4 }, faint(0.45));
  const near = ridge(baseY - 20, 45, 25, 7);
  s.curve(near, { strokeWidth: 1, roughness: 1.4 }, faint(0.6));
  // shading only as a band under the ridge, with a ragged lower edge
  const band = near.map(([x, y], i) => [x, y + 18 + 10 * Math.sin(i * 1.3)]).reverse();
  s.tone([...near, ...band], { gap: 5.5, opacity: 0.3, layer: 'back' });
}

/** A windswept pine: crooked trunk, layered needle clumps. */
export function pine(s, x, y, k = 1) {
  const t = [[x + 22 * k, y + 220 * k], [x + 8 * k, y + 150 * k], [x - 6 * k, y + 90 * k], [x + 6 * k, y + 30 * k]];
  s.curve(t, { strokeWidth: 1.7 }, faint(0.85));
  s.curve(t.map(([a, b], i) => [a + (9 - i) * k, b]), { strokeWidth: 1.1 }, faint(0.65));
  s.tone([...t, ...t.map(([a, b], i) => [a + (9 - i) * k, b]).reverse()], { gap: 2.6, opacity: 0.5, layer: 'back' });
  const clumps = [[-46, 38, 62, 18], [44, 8, 74, 20], [0, -24, 54, 17], [76, 64, 50, 15], [-16, 92, 44, 14]];
  clumps.forEach(([dx, dy, rx, ry], i) => {
    const c = [x + dx * k, y + dy * k];
    const shape = blob(c[0], c[1], rx * k, ry * k, i + 3, 0.3);
    s.poly(shape, { strokeWidth: 1, roughness: 1.6 }, faint(0.7));
    s.tone(shape.filter((p) => p[1] > c[1] - ry * 0.2), { gap: 2.8, opacity: 0.55, layer: 'back' });
    s.curve([[c[0] - rx * 0.6 * k, c[1] + ry * 0.4 * k], [c[0], c[1] + ry * 0.7 * k], [x + 4 * k, y + (dy + 26) * k]], { strokeWidth: 0.9 }, faint(0.6));
  });
}

/** A flat rock to stand on. */
export function rock(s, cx, topY, w) {
  const pts = [[cx - w / 2, topY + 4], [cx - w * 0.38, topY - 6], [cx + w * 0.2, topY - 8], [cx + w / 2, topY + 2], [cx + w * 0.55, topY + 30], [cx - w * 0.55, topY + 32]];
  s.poly(pts, { strokeWidth: 1.2, roughness: 1.6 }, back);
  s.tone(pts.slice(3).concat([[cx - w * 0.1, topY + 8]]), { gap: 3.6, opacity: 0.45, layer: 'back' });
  s.line([cx - w * 0.3, topY + 12], [cx + w * 0.1, topY + 16], { strokeWidth: 0.8 }, faint(0.5));
}

export { ellipsePts, add, HATCH };
