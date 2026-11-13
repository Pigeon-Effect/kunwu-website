// Architecture and objects, drawn in the same pencil hand as the figures.
import { add, ellipsePts, blob, smooth, lerp } from './pencil.mjs';

const G = '#2a2724';
const mid = (o = 1) => ({ layer: 'mid', opacity: o });
const back = (o = 0.6) => ({ layer: 'back', opacity: o });
const hatchFill = (gap = 3.5) => ({ fill: G, fillStyle: 'hachure', hachureGap: gap });

/** Temple hall: curved roof with upturned eaves, tiles, pillars, lattice doors. */
export function templeRoof(s, cx, y, w, pillarH = 70, o = 0.75) {
  const h = w * 0.17;
  const L = (k) => cx - w * k;
  const Rr = (k) => cx + w * k;
  const st = back(o);
  s.line([L(0.33), y], [Rr(0.33), y], { strokeWidth: 1.6 }, st);
  s.curve([[L(0.33), y], [L(0.36), y - 6], [L(0.38), y - 12]], { strokeWidth: 1.3 }, st);
  s.curve([[Rr(0.33), y], [Rr(0.36), y - 6], [Rr(0.38), y - 12]], { strokeWidth: 1.3 }, st);
  s.curve([[L(0.33), y], [L(0.42), y + h * 0.55], [L(0.5), y + h * 0.88], [L(0.55), y + h * 0.7]], { strokeWidth: 1.4 }, st);
  s.curve([[Rr(0.33), y], [Rr(0.42), y + h * 0.55], [Rr(0.5), y + h * 0.88], [Rr(0.55), y + h * 0.7]], { strokeWidth: 1.4 }, st);
  const eave = [[L(0.5), y + h * 0.88], [cx, y + h * 1.02], [Rr(0.5), y + h * 0.88]];
  s.curve(eave, { strokeWidth: 1.4 }, st);
  for (let i = -11; i <= 11; i++) {
    const x = cx + (i * w) / 26;
    s.line([x, y + 4], [x + (x - cx) * 0.1, y + h * 0.9], { strokeWidth: 0.7 }, back(o * 0.45));
  }
  s.tone([...eave, [Rr(0.45), y + h * 1.25], [L(0.45), y + h * 1.25]], { gap: 2.8, opacity: o * 0.6, layer: 'back' });
  if (pillarH > 0) {
    const top = y + h * 1.05;
    for (const k of [-0.4, -0.16, 0.16, 0.4]) {
      s.line([cx + w * k, top], [cx + w * k, top + pillarH], { strokeWidth: 1.2 }, st);
      s.line([cx + w * k + 7, top], [cx + w * k + 7, top + pillarH], { strokeWidth: 0.8 }, back(o * 0.6));
    }
    for (let x = cx - w * 0.14; x < cx + w * 0.14; x += 12) s.line([x, top + 8], [x, top + pillarH - 6], { strokeWidth: 0.6 }, back(o * 0.35));
    s.line([L(0.47), top + pillarH], [Rr(0.47), top + pillarH], { strokeWidth: 1.1 }, st);
  }
}

/** Low sun on the horizon with a few cloud strokes. */
export function sun(s, cx, cy, r) {
  s.arc(cx, cy, r * 2, r * 2, Math.PI, Math.PI * 2, { strokeWidth: 1 }, back(0.55));
  for (const [dx, dy, l] of [[-r * 1.6, -r * 0.5, r * 1.2], [r * 0.9, -r * 0.85, r * 1.5], [-r * 0.3, -r * 1.25, r * 0.9]]) {
    s.line([cx + dx, cy + dy], [cx + dx + l, cy + dy], { strokeWidth: 0.8 }, back(0.4));
  }
}

/** Courtyard flagstones in perspective between y0 (far) and the bottom of the sheet. */
export function flagstones(s, y0, vpX = s.w / 2) {
  let y = y0;
  let step = 10;
  while (y < s.h + 10) {
    s.line([-10, y], [s.w + 10, y + 1], { strokeWidth: 0.7 }, back(0.35));
    y += step;
    step *= 1.45;
  }
  for (let i = -6; i <= 6; i++) s.line([vpX + i * 22, y0], [vpX + i * 110, s.h + 10], { strokeWidth: 0.6 }, back(0.25));
}

/** Simple ground line with a few flicks. */
export function ground(s, y, x0 = 0, x1 = s.w) {
  s.line([x0, y], [x1, y + 2], { strokeWidth: 0.9, roughness: 1.5 }, back(0.5));
  for (let x = x0 + 15; x < x1; x += 37) s.line([x, y + 6], [x + 9, y + 5], { strokeWidth: 0.6 }, back(0.35));
}

/** A brick wall between y0 and y1. */
export function brickWall(s, x0, x1, y0, y1, o = 0.5) {
  s.rect(x0, y0, x1 - x0, y1 - y0, { strokeWidth: 1 }, back(o));
  let row = 0;
  for (let y = y0 + 14; y < y1; y += 14, row++) {
    s.line([x0, y], [x1, y], { strokeWidth: 0.5 }, back(o * 0.6));
    for (let x = x0 + (row % 2 ? 18 : 0); x < x1; x += 36) s.line([x, y - 14], [x, y], { strokeWidth: 0.5 }, back(o * 0.5));
  }
}

/** A bowl seen slightly from above; with a heap of rice. */
export function bowl(s, cx, cy, w, { rice = true } = {}) {
  const h = w * 0.32;
  s.ellipse(cx, cy, w, h, { strokeWidth: 1.3 }, mid());
  s.ellipse(cx, cy + 2, w * 0.86, h * 0.72, { strokeWidth: 0.7 }, mid(0.5));
  s.curve([[cx - w / 2, cy], [cx - w * 0.38, cy + w * 0.36], [cx, cy + w * 0.46], [cx + w * 0.38, cy + w * 0.36], [cx + w / 2, cy]], { strokeWidth: 1.3 }, mid());
  s.tone([[cx + w * 0.1, cy + h * 0.5], [cx + w / 2, cy], [cx + w * 0.38, cy + w * 0.36], [cx + w * 0.05, cy + w * 0.45]], { gap: 3, opacity: 0.45 });
  s.ellipse(cx, cy + w * 0.44, w * 0.36, w * 0.08, { strokeWidth: 0.8 }, mid(0.6));
  if (rice) {
    s.curve([[cx - w * 0.4, cy], [cx - w * 0.2, cy - h * 0.55], [cx + w * 0.05, cy - h * 0.7], [cx + w * 0.3, cy - h * 0.4], [cx + w * 0.42, cy]], { strokeWidth: 1 }, mid(0.85));
    for (let i = 0; i < 9; i++) {
      const x = cx - w * 0.28 + ((i * 37) % 100) * w * 0.0055;
      const y = cy - h * 0.15 - ((i * 53) % 40) * h * 0.012;
      s.ellipse(x, y, 5, 2.6, { strokeWidth: 0.6, roughness: 0.6 }, mid(0.5));
    }
  }
  s.shadow(cx + w * 0.08, cy + w * 0.47, w * 0.9, w * 0.12, 0.3);
}

/** Steamed buns on a plate. */
export function bunPlate(s, cx, cy, w) {
  s.ellipse(cx, cy, w, w * 0.34, { strokeWidth: 1.3 }, mid());
  s.ellipse(cx, cy, w * 0.78, w * 0.24, { strokeWidth: 0.6 }, mid(0.45));
  for (const [dx, dy, k] of [[-0.2, -0.06, 1], [0.18, -0.05, 0.95], [0, 0.06, 1.05]]) {
    const bx = cx + dx * w;
    const by = cy + dy * w;
    const r = w * 0.17 * k;
    const shape = blob(bx, by - r * 0.35, r, r * 0.72, k * 7, 0.08);
    s.poly(shape, { strokeWidth: 1.2 }, mid());
    s.tone(shape.filter((p) => p[0] > bx - r * 0.1 && p[1] > by - r * 0.5), { gap: 3, opacity: 0.35 });
    s.curve([[bx - r * 0.25, by - r * 0.6], [bx, by - r * 0.85], [bx + r * 0.2, by - r * 0.55]], { strokeWidth: 0.8 }, mid(0.6));
  }
  s.shadow(cx + w * 0.06, cy + w * 0.2, w * 1.02, w * 0.14, 0.3);
}

export function chopsticks(s, x, y, len, angle) {
  const a = [x, y];
  const b = add(a, angle, len);
  s.line(a, b, { strokeWidth: 2 }, mid(0.9));
  s.line([a[0] + 7, a[1] + 3], [b[0] + 3, b[1] + 8], { strokeWidth: 2 }, mid(0.9));
  const rest = add(a, angle, len * 0.25);
  s.ellipse(rest[0], rest[1] + 6, 22, 10, { strokeWidth: 1, ...hatchFill(2.4) }, mid(0.8));
}

/** Teapot with lid, spout and handle. */
export function teapot(s, cx, cy, w) {
  const h = w * 0.62;
  const body = blob(cx, cy, w / 2, h / 2, 2, 0.04, 20);
  s.poly(body, { strokeWidth: 1.4 }, mid());
  s.tone(body.filter((p) => p[0] > cx - w * 0.05), { gap: 3.2, opacity: 0.4 });
  s.ellipse(cx, cy - h * 0.48, w * 0.42, h * 0.16, { strokeWidth: 1.1 }, mid());
  s.ellipse(cx, cy - h * 0.6, w * 0.1, h * 0.1, { strokeWidth: 1 }, mid());
  s.curve([[cx + w * 0.44, cy], [cx + w * 0.62, cy - h * 0.15], [cx + w * 0.72, cy - h * 0.45]], { strokeWidth: 1.6 }, mid());
  s.curve([[cx + w * 0.42, cy + h * 0.15], [cx + w * 0.6, cy - h * 0.05], [cx + w * 0.76, cy - h * 0.42]], { strokeWidth: 1.1 }, mid());
  s.arc(cx - w * 0.55, cy - h * 0.05, w * 0.32, h * 0.62, Math.PI * 0.45, Math.PI * 1.55, { strokeWidth: 1.5 }, mid());
  s.shadow(cx + w * 0.1, cy + h * 0.5, w * 1.1, w * 0.12, 0.32);
}

export function cup(s, cx, cy, w) {
  s.ellipse(cx, cy, w, w * 0.34, { strokeWidth: 1.2 }, mid());
  s.path([[cx - w / 2, cy], [cx - w * 0.38, cy + w * 0.6], [cx + w * 0.38, cy + w * 0.6], [cx + w / 2, cy]], { strokeWidth: 1.2 }, mid());
  s.tone([[cx + w * 0.05, cy + 4], [cx + w / 2, cy], [cx + w * 0.38, cy + w * 0.6], [cx + w * 0.05, cy + w * 0.6]], { gap: 3, opacity: 0.4 });
  s.ellipse(cx, cy + 2, w * 0.7, w * 0.2, { strokeWidth: 0.6 }, mid(0.5));
  s.shadow(cx + w * 0.1, cy + w * 0.62, w * 1.1, w * 0.18, 0.3);
}

export function steam(s, x, y, h) {
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push([x + Math.sin(i * 1.3) * 10, y - (i * h) / 6]);
  s.curve(pts, { strokeWidth: 0.9, roughness: 0.8 }, mid(0.45));
}

/** Bamboo steamer stack with lid and steam. */
export function steamers(s, cx, baseY, w, tiers = 3) {
  const th = w * 0.22;
  for (let i = 0; i < tiers; i++) {
    const y = baseY - i * th;
    s.ellipse(cx, y - th, w, w * 0.22, { strokeWidth: 0.7 }, mid(0.35));
    s.line([cx - w / 2, y - th], [cx - w / 2, y], { strokeWidth: 1.3 }, mid());
    s.line([cx + w / 2, y - th], [cx + w / 2, y], { strokeWidth: 1.3 }, mid());
    s.arc(cx, y, w, w * 0.22, 0, Math.PI, { strokeWidth: 1.3 }, mid());
    for (let k = 1; k < 4; k++) s.arc(cx, y - (th * k) / 4, w, w * 0.22, 0.05, Math.PI - 0.05, { strokeWidth: 0.5 }, mid(0.4));
    s.tone([[cx + w * 0.15, y - th], [cx + w / 2, y - th], [cx + w / 2, y], [cx + w * 0.15, y + w * 0.1]], { gap: 3, opacity: 0.35 });
  }
  const top = baseY - tiers * th;
  s.curve([[cx - w / 2, top], [cx - w * 0.3, top - w * 0.2], [cx + w * 0.3, top - w * 0.2], [cx + w / 2, top]], { strokeWidth: 1.3 }, mid());
  s.ellipse(cx, top - w * 0.19, w * 0.18, w * 0.06, { strokeWidth: 1 }, mid());
  steam(s, cx - w * 0.15, top - w * 0.3, w * 0.9);
  steam(s, cx + w * 0.18, top - w * 0.25, w * 0.75);
  s.shadow(cx + w * 0.08, baseY + w * 0.1, w * 1.2, w * 0.16, 0.32);
}

/** Wooden dummy (木人桩) on its frame. facing = -1 → arms point left. */
export function woodenDummy(s, cx, topY, h, facing = -1) {
  const w = h * 0.2;
  const bot = topY + h;
  s.line([cx - w * 2.2, topY + h * 0.18], [cx - w * 2.2, bot + h * 0.08], { strokeWidth: 1.1 }, back(0.6));
  s.line([cx + w * 2.2, topY + h * 0.18], [cx + w * 2.2, bot + h * 0.08], { strokeWidth: 1.1 }, back(0.6));
  s.line([cx - w * 2.4, topY + h * 0.25], [cx + w * 2.4, topY + h * 0.25], { strokeWidth: 1.2 }, back(0.65));
  s.line([cx - w * 2.4, topY + h * 0.75], [cx + w * 2.4, topY + h * 0.75], { strokeWidth: 1.2 }, back(0.65));
  s.ellipse(cx, topY, w, w * 0.3, { strokeWidth: 1.2 }, mid());
  s.line([cx - w / 2, topY], [cx - w / 2, bot], { strokeWidth: 1.5 }, mid());
  s.line([cx + w / 2, topY], [cx + w / 2, bot], { strokeWidth: 1.5 }, mid());
  s.arc(cx, bot, w, w * 0.3, 0, Math.PI, { strokeWidth: 1.2 }, mid());
  const shadeX = facing < 0 ? cx + w * 0.05 : cx - w / 2;
  s.tone([[shadeX, topY], [shadeX + w * 0.45, topY], [shadeX + w * 0.45, bot], [shadeX, bot]], { gap: 3, opacity: 0.45, cross: true });
  for (let y = topY + 12; y < bot; y += 22) s.curve([[cx - w * 0.3, y], [cx - w * 0.1, y + 3], [cx + w * 0.1, y - 1]], { strokeWidth: 0.5 }, mid(0.35));
  const arm = (y, dy, len) => {
    const a = [cx + facing * w * 0.45, y];
    const b = [cx + facing * (w * 0.45 + len), y + dy];
    s.line([a[0], a[1] - 4], [b[0], b[1] - 3], { strokeWidth: 1.3 }, mid());
    s.line([a[0], a[1] + 4], [b[0], b[1] + 3], { strokeWidth: 1.3 }, mid());
    s.ellipse(b[0], b[1], 5, 7, { strokeWidth: 1 }, mid());
  };
  arm(topY + h * 0.2, -8, w * 1.6);
  arm(topY + h * 0.26, -2, w * 1.8);
  arm(topY + h * 0.42, 6, w * 1.4);
  s.path([[cx + facing * w * 0.45, topY + h * 0.66], [cx + facing * w * 1.6, topY + h * 0.78], [cx + facing * w * 1.5, topY + h * 0.98]], { strokeWidth: 2.4 }, mid());
  s.shadow(cx, bot + 8, w * 4, w * 0.5, 0.35);
}

/** Heavy bag hanging from a chain. */
export function heavyBag(s, cx, topY, h) {
  const w = h * 0.36;
  for (let y = 4; y < topY - 18; y += 9) s.ellipse(cx, y, 4, 8, { strokeWidth: 0.6 }, back(0.55));
  s.path([[cx - w / 2, topY], [cx, topY - 18], [cx + w / 2, topY]], { strokeWidth: 0.9 }, mid(0.7));
  s.ellipse(cx, topY, w, w * 0.25, { strokeWidth: 1.2 }, mid());
  s.line([cx - w / 2, topY], [cx - w / 2 + 2, topY + h], { strokeWidth: 1.5 }, mid());
  s.line([cx + w / 2, topY], [cx + w / 2 - 2, topY + h], { strokeWidth: 1.5 }, mid());
  s.arc(cx, topY + h, w - 4, w * 0.25, 0, Math.PI, { strokeWidth: 1.4 }, mid());
  s.tone([[cx + w * 0.05, topY], [cx + w / 2, topY], [cx + w / 2 - 2, topY + h], [cx + w * 0.05, topY + h + 8]], { gap: 3, opacity: 0.5, cross: true });
  s.line([cx - w / 2, topY + h * 0.3], [cx + w / 2, topY + h * 0.3], { strokeWidth: 0.7 }, mid(0.5));
  s.line([cx - w / 2, topY + h * 0.7], [cx + w / 2, topY + h * 0.7], { strokeWidth: 0.7 }, mid(0.5));
}

/** Weapons rack with staff, spear, broadsword and straight sword. */
export function weaponRack(s, cx, topY, h) {
  const w = h * 0.62;
  const L = cx - w / 2;
  const Rx = cx + w / 2;
  for (const x of [L, Rx]) {
    s.line([x, topY], [x, topY + h], { strokeWidth: 1.7 }, mid());
    s.line([x + 8, topY], [x + 8, topY + h], { strokeWidth: 1 }, mid(0.6));
    s.line([x - 16, topY + h], [x + 24, topY + h], { strokeWidth: 1.6 }, mid());
  }
  for (const y of [topY + h * 0.12, topY + h * 0.62]) {
    s.line([L, y], [Rx + 8, y], { strokeWidth: 1.5 }, mid());
    s.line([L, y + 8], [Rx + 8, y + 8], { strokeWidth: 0.9 }, mid(0.6));
  }
  const slot = (i) => L + 26 + i * ((w - 40) / 4);
  s.line([slot(0), topY - h * 0.08], [slot(0), topY + h * 0.98], { strokeWidth: 2.2 }, mid());
  const sx = slot(1);
  s.line([sx, topY + h * 0.06], [sx, topY + h * 0.98], { strokeWidth: 1.6 }, mid());
  s.poly([[sx, topY - h * 0.1], [sx - 6, topY], [sx, topY + h * 0.06], [sx + 6, topY]], { strokeWidth: 1.2, ...hatchFill(2) }, mid());
  for (let i = -3; i <= 3; i++) s.curve([[sx, topY + h * 0.07], [sx + i * 4, topY + h * 0.13], [sx + i * 6, topY + h * 0.18]], { strokeWidth: 0.7 }, mid(0.6));
  const dx = slot(2.2);
  s.curve([[dx, topY + h * 0.08], [dx + 10, topY + h * 0.3], [dx + 6, topY + h * 0.56]], { strokeWidth: 1.4 }, mid());
  s.curve([[dx - 8, topY + h * 0.12], [dx - 4, topY + h * 0.36], [dx - 3, topY + h * 0.56]], { strokeWidth: 1.2 }, mid());
  s.line([dx - 12, topY + h * 0.57], [dx + 14, topY + h * 0.57], { strokeWidth: 2 }, mid());
  s.line([dx + 1, topY + h * 0.58], [dx + 1, topY + h * 0.72], { strokeWidth: 3 }, mid());
  const jx = slot(3.4);
  s.line([jx - 3, topY + h * 0.02], [jx - 3, topY + h * 0.6], { strokeWidth: 1.1 }, mid());
  s.line([jx + 3, topY + h * 0.02], [jx + 3, topY + h * 0.6], { strokeWidth: 1.1 }, mid());
  s.line([jx, topY - 0.02 * h], [jx, topY + h * 0.6], { strokeWidth: 0.5 }, mid(0.6));
  s.line([jx - 12, topY + h * 0.61], [jx + 12, topY + h * 0.61], { strokeWidth: 2 }, mid());
  s.line([jx, topY + h * 0.62], [jx, topY + h * 0.74], { strokeWidth: 3 }, mid());
  s.shadow(cx, topY + h + 6, w * 1.3, w * 0.14, 0.32);
}

/** Peony bloom: leaves, three rings of petals, a dark heart. */
export function peony(s, cx, cy, r, seed = 1) {
  for (let i = 0; i < 3; i++) {
    const a = seed * 40 + i * 120;
    const tip = add([cx, cy], a, r * 1.9);
    const m = lerp([cx, cy], tip, 0.5);
    s.curve([[cx, cy], add(m, a + 90, r * 0.35), tip, add(m, a - 90, r * 0.3), [cx, cy]], { strokeWidth: 0.9 }, back(0.6));
    s.line([cx, cy], tip, { strokeWidth: 0.5 }, back(0.45));
  }
  for (let ring = 0; ring < 3; ring++) {
    const rr = r * (1 - ring * 0.28);
    const n = 7 - ring;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + seed * 23 + ring * 19;
      const c = add([cx, cy - ring * r * 0.06], a, rr * 0.55);
      s.poly(blob(c[0], c[1], rr * 0.5, rr * 0.38, seed + i + ring * 5, 0.25, 12), { strokeWidth: 1, roughness: 1.4 }, mid(0.85));
    }
  }
  s.tone(blob(cx, cy, r * 0.3, r * 0.22, seed, 0.2), { gap: 2.4, opacity: 0.55 });
}

/** Small open pavilion with railing. */
export function pavilion(s, cx, y, w) {
  templeRoof(s, cx, y, w, 0, 0.7);
  const top = y + w * 0.17 * 1.05;
  const ph = w * 0.55;
  for (const k of [-0.38, -0.13, 0.13, 0.38]) s.line([cx + w * k, top], [cx + w * k, top + ph], { strokeWidth: 1.2 }, back(0.7));
  s.line([cx - w * 0.45, top + ph * 0.62], [cx + w * 0.45, top + ph * 0.62], { strokeWidth: 1 }, back(0.6));
  for (let x = cx - w * 0.38; x < cx + w * 0.38; x += 10) s.line([x, top + ph * 0.62], [x, top + ph], { strokeWidth: 0.5 }, back(0.4));
  s.poly([[cx - w * 0.5, top + ph], [cx + w * 0.5, top + ph], [cx + w * 0.56, top + ph + 12], [cx - w * 0.56, top + ph + 12]], { strokeWidth: 1.1 }, back(0.7));
}

export function birds(s, x, y, n = 2) {
  for (let i = 0; i < n; i++) {
    const bx = x + i * 26;
    const by = y + (i % 2) * 10;
    s.curve([[bx - 8, by - 3], [bx - 3, by - 1], [bx, by + 2]], { strokeWidth: 0.9 }, back(0.6));
    s.curve([[bx, by + 2], [bx + 4, by - 2], [bx + 10, by - 4]], { strokeWidth: 0.9 }, back(0.6));
  }
}

/** Meditation cushion. */
export function cushion(s, cx, cy, w) {
  s.ellipse(cx, cy, w, w * 0.26, { strokeWidth: 1.3 }, back(0.9));
  s.ellipse(cx, cy - w * 0.06, w * 0.92, w * 0.2, { strokeWidth: 0.7 }, back(0.5));
  s.tone(ellipsePts(cx + w * 0.12, cy + w * 0.03, w * 0.36, w * 0.09), { gap: 3, opacity: 0.4, layer: 'back' });
}

/** Incense burner with a rising thread of smoke. */
export function incense(s, x, y) {
  s.ellipse(x, y, 34, 11, { strokeWidth: 1.1 }, mid());
  s.path([[x - 17, y], [x - 12, y + 20], [x + 12, y + 20], [x + 17, y]], { strokeWidth: 1.1 }, mid());
  s.line([x, y - 2], [x - 3, y - 50], { strokeWidth: 1 }, mid());
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push([x - 3 + Math.sin(i * 0.9) * (4 + i * 1.6), y - 52 - i * 16]);
  s.curve(pts, { strokeWidth: 0.8, roughness: 0.6 }, mid(0.5));
}

/** Horizontal stretching bar on two posts. */
export function stretchBar(s, x0, x1, y, groundY) {
  s.line([x0, y], [x1, y], { strokeWidth: 2.2 }, mid());
  s.line([x0, y + 6], [x1, y + 6], { strokeWidth: 0.9 }, mid(0.5));
  for (const x of [x0 + 20, x1 - 20]) {
    s.line([x, y], [x, groundY], { strokeWidth: 1.8 }, mid());
    s.line([x + 6, y + 6], [x + 6, groundY], { strokeWidth: 0.9 }, mid(0.5));
  }
}

export function latticeWindow(s, x, y, w, h) {
  s.rect(x, y, w, h, { strokeWidth: 1.5 }, back(0.9));
  s.rect(x + 6, y + 6, w - 12, h - 12, { strokeWidth: 0.8 }, back(0.6));
  for (let i = 1; i < 4; i++) s.line([x + 6 + ((w - 12) * i) / 4, y + 6], [x + 6 + ((w - 12) * i) / 4, y + h - 6], { strokeWidth: 0.8 }, back(0.6));
  for (let i = 1; i < 4; i++) s.line([x + 6, y + 6 + ((h - 12) * i) / 4], [x + w - 6, y + 6 + ((h - 12) * i) / 4], { strokeWidth: 0.8 }, back(0.6));
  s.tone([[x, y + h], [x + w, y + h], [x + w + 14, y + h + 10], [x - 6, y + h + 10]], { gap: 2.6, opacity: 0.4, layer: 'back' });
}

/** A practice jacket hanging on a hook. */
export function hangingJacket(s, x, y, w) {
  s.line([x, y - 18], [x, y - 4], { strokeWidth: 1.2 }, mid());
  s.arc(x, y - 4, 18, 10, Math.PI, Math.PI * 2, { strokeWidth: 1 }, mid());
  const pts = smooth([[x - w * 0.2, y], [x - w * 0.55, y + w * 0.12], [x - w * 0.62, y + w * 0.55], [x - w * 0.42, y + w * 0.58], [x - w * 0.36, y + w * 0.32], [x - w * 0.34, y + w * 1.05], [x + w * 0.34, y + w * 1.05], [x + w * 0.36, y + w * 0.32], [x + w * 0.42, y + w * 0.58], [x + w * 0.62, y + w * 0.55], [x + w * 0.55, y + w * 0.12], [x + w * 0.2, y]], 1);
  s.poly(pts, { strokeWidth: 1.3 }, mid());
  s.tone(pts, { gap: 5, opacity: 0.3 });
  s.curve([[x - w * 0.2, y], [x + w * 0.05, y + w * 0.45], [x + w * 0.3, y + w * 0.6]], { strokeWidth: 1 }, mid(0.7));
  s.line([x - w * 0.34, y + w * 0.7], [x + w * 0.34, y + w * 0.7], { strokeWidth: 1 }, mid(0.6));
}

export function shoes(s, x, y, w) {
  for (const dx of [0, w * 0.7]) {
    const pts = blob(x + dx, y, w * 0.32, w * 0.12, dx + 2, 0.1, 14);
    s.poly(pts, { strokeWidth: 1.1 }, mid());
    s.tone(pts, { gap: 2.4, opacity: 0.55, cross: true });
  }
}
