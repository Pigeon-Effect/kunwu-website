// Shared "pencil" style for every sketch – one place, so the whole set looks drawn by one hand.
import rough from 'roughjs';

const gen = rough.generator();

export const GRAPHITE = '#2a2724';
export const PAPER = '#f7f3ea';

/** Every hatch in every sketch runs at the same angle, like one right-handed artist. */
export const HATCH = -41;
export const CROSS = 49;

const R = Math.PI / 180;
/** Angle convention: 0 = down, 90 = right, 180 = up, -90 = left (screen coordinates). */
export const dir = (a) => [Math.sin(a * R), Math.cos(a * R)];
export const add = (p, a, l) => {
  const d = dir(a);
  return [p[0] + d[0] * l, p[1] + d[1] * l];
};
export const angleOf = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]) / R;
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Polygon approximating a tapered limb with rounded ends. */
export function capsule(a, b, wa, wb, seg = 7) {
  const ang = angleOf(a, b);
  const pts = [];
  for (let i = 0; i <= seg; i++) pts.push(add(b, ang + 90 - (180 * i) / seg, wb / 2));
  for (let i = 0; i <= seg; i++) pts.push(add(a, ang - 90 - (180 * i) / seg, wa / 2));
  return pts;
}

/** Chaikin corner cutting for a closed ring – turns hard polygons into organic shapes. */
export function smooth(ring, iterations = 2) {
  let pts = ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring;
  for (let k = 0; k < iterations; k++) {
    const next = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    pts = next;
  }
  return pts;
}

/** Deterministic irregular blob (foliage, clouds, peony petals). */
export function blob(cx, cy, rx, ry, seed = 1, wobble = 0.22, seg = 16) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    const n = 1 + wobble * Math.sin(t * 3 + seed * 1.7) * Math.cos(t * 2 + seed);
    pts.push([cx + Math.cos(t) * rx * n, cy + Math.sin(t) * ry * n]);
  }
  return smooth(pts, 1);
}

export function ellipsePts(cx, cy, rx, ry, seg = 28, rot = 0) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    const c = Math.cos(rot * R);
    const s = Math.sin(rot * R);
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

export class Sheet {
  constructor(width, height, seed) {
    this.w = width;
    this.h = height;
    this.seed = seed;
    this.n = 0;
    this.layers = { back: [], mid: [], front: [] };
  }

  opts(o = {}) {
    return {
      seed: this.seed * 997 + ++this.n,
      stroke: GRAPHITE,
      strokeWidth: 1.15,
      roughness: 1.25,
      bowing: 1.1,
      hachureAngle: HATCH,
      hachureGap: 5,
      fillWeight: 0.55,
      ...o,
    };
  }

  push(drawable, { opacity = 1, layer = 'mid' } = {}) {
    for (const p of gen.toPaths(drawable)) {
      const fill = p.fill && p.fill !== 'none' ? p.fill : 'none';
      this.layers[layer].push(
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${fill}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    }
  }

  // Each primitive: (geometry..., roughOptions, { opacity, layer })
  line(a, b, o, s) {
    this.push(gen.line(a[0], a[1], b[0], b[1], this.opts(o)), s);
  }
  poly(points, o, s) {
    this.push(gen.polygon(points, this.opts(o)), s);
  }
  path(points, o, s) {
    this.push(gen.linearPath(points, this.opts(o)), s);
  }
  curve(points, o, s) {
    this.push(gen.curve(points, this.opts(o)), s);
  }
  ellipse(cx, cy, w, h, o, s) {
    this.push(gen.ellipse(cx, cy, w, h, this.opts(o)), s);
  }
  arc(cx, cy, w, h, start, stop, o, s) {
    this.push(gen.arc(cx, cy, w, h, start, stop, false, this.opts(o)), s);
  }
  rect(x, y, w, h, o, s) {
    this.push(gen.rectangle(x, y, w, h, this.opts(o)), s);
  }
  svgPath(d, o, s) {
    this.push(gen.path(d, this.opts(o)), s);
  }

  /** Hatched tone inside a polygon (no outline). */
  tone(points, { gap = 5, angle = HATCH, weight = 0.55, opacity = 0.5, layer = 'mid', cross = false } = {}) {
    this.poly(points, { stroke: 'none', fill: GRAPHITE, fillStyle: 'hachure', hachureGap: gap, hachureAngle: angle, fillWeight: weight }, { opacity, layer });
    if (cross) {
      this.poly(points, { stroke: 'none', fill: GRAPHITE, fillStyle: 'hachure', hachureGap: gap * 1.35, hachureAngle: CROSS, fillWeight: weight * 0.9 }, { opacity: opacity * 0.75, layer });
    }
  }

  /** Soft ground shadow: a hatched ellipse. */
  shadow(cx, cy, w, h = w * 0.16, opacity = 0.42) {
    this.tone(ellipsePts(cx, cy, w / 2, h / 2), { gap: 3.2, opacity, layer: 'back' });
  }

  toSVG() {
    const { w, h } = this;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
  <filter id="paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.33  0 0 0 0 0.28  0 0 0 0.11 0"/>
  </filter>
  <filter id="graphite" x="-3%" y="-3%" width="106%" height="106%">
    <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="${this.seed}" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.42" result="grain"/>
    <feComposite in="wobble" in2="grain" operator="in"/>
  </filter>
  <radialGradient id="fadeGrad" cx="50%" cy="50%" r="72%">
    <stop offset="0.62" stop-color="#fff"/>
    <stop offset="1" stop-color="#000"/>
  </radialGradient>
  <mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="url(#fadeGrad)"/>
  </mask>
</defs>
<rect width="${w}" height="${h}" fill="${PAPER}"/>
<rect width="${w}" height="${h}" filter="url(#paper)"/>
<g filter="url(#graphite)" mask="url(#fade)">
  <g opacity="0.8">${this.layers.back.join('')}</g>
  <g>${this.layers.mid.join('')}</g>
  <g>${this.layers.front.join('')}</g>
</g>
</svg>`;
  }
}
