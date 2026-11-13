// A posable figure drawn in pencil: light construction lines, one confident silhouette,
// hatched clothing, a few details (sash, collar, cuffs, leg wraps).
import polygonClipping from 'polygon-clipping';
import { add, capsule, ellipsePts, lerp, angleOf, smooth, HATCH } from './pencil.mjs';

/** Limb widths in head units: [start, end] */
const STYLES = {
  shaolin: { upper: [0.66, 0.58], fore: [0.56, 0.42], thigh: [1.0, 0.82], shin: [0.56, 0.4], hand: 0.27, hem: 0.75, wraps: true, sash: true, collar: true, cuffs: true },
  taichi: { upper: [0.72, 0.66], fore: [0.66, 0.54], thigh: [0.98, 0.86], shin: [0.84, 0.66], hand: 0.25, hem: 1.25, wraps: false, sash: true, collar: true, cuffs: true },
  mma: { upper: [0.52, 0.42], fore: [0.42, 0.34], thigh: [0.82, 0.64], shin: [0.58, 0.42], hand: 0.43, hem: 0.25, wraps: false, sash: false, collar: false, cuffs: false, gloves: true },
};

const toRing = (pts) => [...pts, pts[0]];
const union = (polys) => polygonClipping.union(...polys.map((p) => [toRing(p)])).map((poly) => [smooth(poly[0], 2)]);

/**
 * pose = {
 *   x, y: pelvis centre; size: standing height in px; style: 'shaolin' | 'taichi' | 'mma'
 *   spine: angle of the spine (180 = upright); head: tilt relative to spine
 *   side: 1 = facing viewer, ~0.5 = profile (narrows shoulders/hips)
 *   face: -1 | 0 | 1 – which way the head looks
 *   arms: { l: [upper, lower, upperScale?, lowerScale?], r: [...] }   (absolute angles)
 *   legs: { l: [thigh, shin, foot, thighScale?, shinScale?, footScale?], r: [...] }
 *   motion: [[x,y],...] optional speed lines are drawn by scenes
 * }
 * L / R = screen left / right.
 */
export function buildFigure(pose) {
  const S = { ...STYLES[pose.style ?? 'shaolin'], ...(pose.styleOverrides ?? {}) };
  const u = pose.size / 7.5;
  const spine = pose.spine ?? 180;
  const side = pose.side ?? 1;
  const pelvis = [pose.x, pose.y];
  const chest = add(pelvis, spine, 2.55 * u);
  const shoulderLine = add(chest, spine + 180, 0.32 * u);
  const sL = add(shoulderLine, spine + 90, 0.95 * u * side);
  const sR = add(shoulderLine, spine - 90, 0.95 * u * side);
  const hipW = 0.62 * u * Math.max(side, 0.62);
  const hL = add(pelvis, spine + 90, hipW);
  const hR = add(pelvis, spine - 90, hipW);
  const headC = add(chest, spine + (pose.head ?? 0), 0.85 * u);

  const arm = (s, [a0, a1, k0 = 1, k1 = 1]) => {
    const elbow = add(s, a0, 1.45 * u * k0);
    const wrist = add(elbow, a1, 1.25 * u * k1);
    const hand = add(wrist, a1, 0.16 * u);
    return { s, elbow, wrist, hand, a1 };
  };
  const leg = (h, [t, sh, f, k0 = 1, k1 = 1, k2 = 1]) => {
    const knee = add(h, t, 1.95 * u * k0);
    const ankle = add(knee, sh, 1.85 * u * k1);
    const heel = add(ankle, f + 180, 0.18 * u);
    const toe = add(ankle, f, 0.85 * u * k2);
    return { h, knee, ankle, heel, toe, sh };
  };

  const aL = arm(sL, pose.arms.l);
  const aR = arm(sR, pose.arms.r);
  const lL = leg(hL, pose.legs.l);
  const lR = leg(hR, pose.legs.r);

  const W = (k) => k * u;
  const hemL = add(add(hL, spine + 90, W(0.32) * side), spine + 180, W(S.hem));
  const hemR = add(add(hR, spine - 90, W(0.32) * side), spine + 180, W(S.hem));
  const across = (p, k) => [add(p, spine + 90, W(k) * side), add(p, spine - 90, W(k) * side)];
  const [neckL, neckR] = across(chest, 0.3);
  const [pitL, pitR] = across(add(shoulderLine, spine + 180, W(0.75)), 0.92);
  const [waistL, waistR] = across(add(pelvis, spine, W(0.55)), 0.86);
  const torso = [neckL, add(sL, spine + 90, W(0.14)), pitL, waistL, hemL, hemR, waistR, pitR, add(sR, spine - 90, W(0.14)), neckR];
  const neck = capsule(chest, add(chest, spine + (pose.head ?? 0), W(0.45)), W(0.42), W(0.36));
  const head = ellipsePts(headC[0], headC[1], W(0.47), W(0.56), 26, spine - 180 + (pose.head ?? 0));

  const limb = (a, b, w) => capsule(a, b, W(w[0]), W(w[1]));
  const parts = {
    top: [torso, limb(aL.s, aL.elbow, S.upper), limb(aL.elbow, aL.wrist, S.fore), limb(aR.s, aR.elbow, S.upper), limb(aR.elbow, aR.wrist, S.fore)],
    bottom: [limb(lL.h, lL.knee, S.thigh), limb(lL.knee, lL.ankle, S.shin), limb(lR.h, lR.knee, S.thigh), limb(lR.knee, lR.ankle, S.shin)],
    hands: [ellipsePts(aL.hand[0], aL.hand[1], W(S.hand), W(S.hand), 14), ellipsePts(aR.hand[0], aR.hand[1], W(S.hand), W(S.hand), 14)],
    feet: [capsule(lL.heel, lL.toe, W(0.4), W(0.24)), capsule(lR.heel, lR.toe, W(0.4), W(0.24))],
    skin: [head, neck],
  };
  return { pose, S, u, spine, side, chest, pelvis, headC, sL, sR, hL, hR, aL, aR, lL, lR, parts };
}

export function drawFigure(sheet, pose, { shadowY, shadowWidth } = {}) {
  const f = buildFigure(pose);
  const { u, S, parts } = f;

  // ground shadow
  if (shadowY !== null) {
    const feetX = (f.lL.ankle[0] + f.lR.ankle[0]) / 2;
    const groundY = shadowY ?? Math.max(f.lL.toe[1], f.lR.toe[1], f.lL.heel[1], f.lR.heel[1]) + 0.12 * u;
    sheet.shadow(feetX, groundY, shadowWidth ?? 3.6 * u);
  }

  // 1. construction lines – light, loose
  for (const p of [...parts.top, ...parts.bottom, ...parts.skin]) {
    sheet.poly(p, { strokeWidth: 0.6, roughness: 1.9, bowing: 2 }, { opacity: 0.22 });
  }

  // 2. tone: trousers cross-hatched (darker), top lightly hatched, shoes dark
  for (const ring of union(parts.bottom)) sheet.tone(ring[0], { gap: 4.2, opacity: 0.55, cross: true });
  for (const ring of union(parts.top)) sheet.tone(ring[0], { gap: 7, opacity: 0.36 });
  for (const ring of union(parts.feet)) sheet.tone(ring[0], { gap: 2.2, opacity: 0.75, cross: true });
  if (S.gloves) for (const ring of union(parts.hands)) sheet.tone(ring[0], { gap: 2.4, opacity: 0.7, cross: true });
  // shading on the head's far side
  sheet.tone(
    ellipsePts(f.headC[0] + (pose.face ?? 0) * -0.14 * u, f.headC[1] + 0.06 * u, 0.32 * u, 0.48 * u, 18),
    { gap: 3.6, opacity: 0.22 },
  );

  // 3. silhouette – one confident line
  const all = [...parts.top, ...parts.bottom, ...parts.hands, ...parts.feet, ...parts.skin];
  for (const ring of union(all)) {
    sheet.poly(ring[0], { strokeWidth: 1.55, roughness: 1.05, bowing: 0.8 }, { opacity: 0.92 });
  }

  // 4. details
  const sp = f.spine;
  if (S.sash) {
    const y0 = add(f.pelvis, sp, 0.45 * u);
    const a = add(y0, sp + 90, 0.78 * u * Math.max(f.side, 0.62));
    const b = add(y0, sp - 90, 0.78 * u * Math.max(f.side, 0.62));
    sheet.line(a, b, { strokeWidth: 1.2 }, { opacity: 0.8 });
    sheet.line(add(a, sp + 180, 0.22 * u), add(b, sp + 180, 0.22 * u), { strokeWidth: 1 }, { opacity: 0.7 });
    const knot = lerp(a, b, f.side < 0.8 ? 0.7 : 0.35);
    sheet.curve([knot, add(knot, sp + 170, 0.6 * u), add(knot, sp + 175, 1.05 * u)], { strokeWidth: 1 }, { opacity: 0.75 });
    sheet.curve([knot, add(knot, sp + 195, 0.5 * u), add(knot, sp + 190, 0.9 * u)], { strokeWidth: 1 }, { opacity: 0.6 });
  }
  if (S.collar) {
    const nL = add(f.chest, sp + 90, 0.3 * u);
    const cross = add(add(f.chest, sp + 180, 1.15 * u), sp - 90, 0.35 * u * f.side);
    sheet.curve([nL, lerp(nL, cross, 0.55), cross], { strokeWidth: 1.1 }, { opacity: 0.75 });
    sheet.line(add(f.chest, sp - 90, 0.28 * u), lerp(nL, cross, 0.45), { strokeWidth: 0.9 }, { opacity: 0.55 });
  }
  if (S.cuffs) {
    for (const a of [f.aL, f.aR]) {
      const c = lerp(a.elbow, a.wrist, 0.82);
      const ang = angleOf(a.elbow, a.wrist);
      sheet.line(add(c, ang + 90, 0.3 * u), add(c, ang - 90, 0.3 * u), { strokeWidth: 1 }, { opacity: 0.7 });
    }
  }
  if (S.wraps) {
    for (const l of [f.lL, f.lR]) {
      const ang = angleOf(l.knee, l.ankle);
      for (let i = 0; i < 5; i++) {
        const c = lerp(l.knee, l.ankle, 0.38 + i * 0.13);
        sheet.line(add(add(c, ang + 90, 0.24 * u), ang, 0.12 * u), add(add(c, ang - 90, 0.24 * u), ang + 180, 0.1 * u), { strokeWidth: 0.85 }, { opacity: 0.6 });
      }
    }
  }
  // a few fold lines where cloth bunches: inside of elbows and knees
  for (const [a, b, c] of [[f.aL.s, f.aL.elbow, f.aL.wrist], [f.aR.s, f.aR.elbow, f.aR.wrist], [f.lL.h, f.lL.knee, f.lL.ankle], [f.lR.h, f.lR.knee, f.lR.ankle]]) {
    const bend = Math.abs(((angleOf(a, b) - angleOf(b, c) + 540) % 360) - 180);
    if (bend < 25) continue;
    const m = lerp(b, lerp(a, c, 0.5), 0.25);
    const ang = angleOf(a, b);
    sheet.curve([add(m, ang + 90, 0.18 * u), add(m, ang, 0.12 * u), add(m, ang - 90, 0.16 * u)], { strokeWidth: 0.8 }, { opacity: 0.5 });
  }

  // face direction: a small nose stroke + ear
  if (pose.face) {
    const dirFace = (pose.face > 0 ? -90 : 90) + f.spine + (pose.head ?? 0);
    const nose = add(f.headC, dirFace, 0.47 * u);
    sheet.line(nose, add(add(nose, dirFace, 0.1 * u), f.spine + 180, 0.12 * u), { strokeWidth: 1 }, { opacity: 0.8 });
  }
  return f;
}

/** Short curved speed lines trailing behind a point. */
export function motionLines(sheet, at, angle, length, count = 3, spread = 10) {
  for (let i = 0; i < count; i++) {
    const off = (i - (count - 1) / 2) * spread;
    const start = add(add(at, angle + 90, off), angle, 8);
    const end = add(start, angle, length * (1 - Math.abs(off) / (spread * count)));
    const mid = add(lerp(start, end, 0.5), angle + 90, length * 0.06);
    sheet.curve([start, mid, end], { strokeWidth: 0.9, roughness: 0.8 }, { opacity: 0.45 });
  }
}

export { HATCH };
