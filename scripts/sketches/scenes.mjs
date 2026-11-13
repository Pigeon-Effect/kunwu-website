// Every pencil sketch on the site. Canvas width is always 600 units; height follows `ratio`.
// Angles: 0 = down, 90 = right, 180 = up, -90 = left.
import { drawFigure, motionLines } from './figure.mjs';
import * as P from './props.mjs';
import * as O from './objects.mjs';

const grain = (s, ys) => {
  for (const y of ys) s.curve([[-10, y], [180, y - 6], [400, y + 5], [610, y - 2]], { strokeWidth: 0.6, roughness: 1.6 }, { layer: 'back', opacity: 0.3 });
};

export const scenes = [
  // ---------------------------------------------------------------- Training programs (4:3)
  {
    id: 'program-shaolin',
    ratio: [4, 3],
    draw(s) {
      P.hills(s, 255);
      P.pine(s, 500, 40, 1);
      P.rock(s, 300, 418, 180);
      drawFigure(s, {
        x: 300, y: 240, size: 330, style: 'shaolin',
        arms: { l: [-100, -97], r: [100, 98] },
        legs: { l: [2, -1, -75, 1, 1, 0.7], r: [102, 2, 20, 0.92, 0.9, 0.8] },
      }, { shadowY: 418, shadowWidth: 150 });
    },
  },
  {
    id: 'program-taichi',
    ratio: [4, 3],
    draw(s) {
      P.pine(s, 505, 70, 0.85);
      O.ground(s, 412);
      const f = drawFigure(s, {
        x: 260, y: 255, size: 315, style: 'taichi', side: 0.72, face: 1, spine: 182,
        arms: { l: [8, 48], r: [112, 92] },
        legs: { l: [-32, -22, -70], r: [28, -2, 88] },
      });
      const [hx, hy] = f.aR.hand;
      s.arc(hx + 18, hy + 10, 120, 120, -Math.PI * 0.55, Math.PI * 0.35, { strokeWidth: 0.8, roughness: 0.7 }, { opacity: 0.4 });
      s.arc(hx + 18, hy + 10, 170, 170, -Math.PI * 0.45, Math.PI * 0.25, { strokeWidth: 0.7, roughness: 0.7 }, { opacity: 0.28 });
    },
  },
  {
    id: 'program-mma',
    ratio: [4, 3],
    draw(s) {
      O.heavyBag(s, 470, 70, 235);
      O.ground(s, 420);
      const f = drawFigure(s, {
        x: 225, y: 268, size: 320, style: 'mma', side: 0.6, face: 1, spine: 176,
        arms: { l: [28, 168, 1, 0.9], r: [95, 91] },
        legs: { l: [-18, -8, 70], r: [22, 4, 90] },
      });
      motionLines(s, [f.aR.hand[0] - 40, f.aR.hand[1]], -90, 60, 3, 13);
      s.curve([[425, 150], [418, 170], [425, 190]], { strokeWidth: 1 }, { opacity: 0.55 });
      s.curve([[412, 140], [402, 170], [412, 200]], { strokeWidth: 0.8 }, { opacity: 0.4 });
    },
  },
  {
    id: 'program-wingchun',
    ratio: [4, 3],
    draw(s) {
      O.woodenDummy(s, 445, 150, 265, -1);
      O.ground(s, 422);
      drawFigure(s, {
        x: 215, y: 272, size: 310, style: 'shaolin', side: 0.6, face: 1,
        styleOverrides: { wraps: false, hem: 0.9 },
        arms: { l: [96, 168, 0.72, 0.62], r: [104, 92] },
        legs: { l: [-8, 8, 75], r: [12, -6, 95] },
      });
    },
  },

  // ---------------------------------------------------------------- Home strip
  {
    id: 'morning-stance',
    ratio: [4, 3],
    draw(s) {
      O.templeRoof(s, 300, 68, 540, 92, 0.7);
      O.sun(s, 300, 40, 22);
      O.flagstones(s, 262);
      for (const x of [118, 300, 482]) {
        drawFigure(s, {
          x, y: 340, size: 172, style: 'shaolin',
          arms: { l: [-14, 140, 1, 0.45], r: [14, -140, 1, 0.45] },
          legs: { l: [-68, -4, -80, 1, 1, 0.8], r: [68, 4, 80, 1, 1, 0.8] },
        });
      }
    },
  },
  {
    id: 'shared-meal',
    ratio: [3, 4],
    draw(s) {
      grain(s, [120, 330, 560, 760]);
      O.teapot(s, 290, 215, 170);
      O.cup(s, 480, 275, 70);
      O.bowl(s, 185, 455, 170);
      O.bowl(s, 425, 505, 160);
      O.bunPlate(s, 285, 665, 250);
      O.chopsticks(s, 395, 745, 190, 132);
    },
  },
  {
    id: 'forms-practice',
    ratio: [1, 1],
    draw(s) {
      O.flagstones(s, 330, 260);
      const f = drawFigure(s, {
        x: 265, y: 330, size: 380, style: 'shaolin', side: 0.62, face: 1,
        arms: { l: [-24, 82, 1, 0.75], r: [94, 91] },
        legs: { l: [-48, -50, -62], r: [72, 2, 92] },
      });
      motionLines(s, [f.aR.hand[0] + 10, f.aR.hand[1]], 90, 46, 3, 14);
    },
  },

  // ---------------------------------------------------------------- Daily life
  {
    id: 'student-room',
    ratio: [4, 3],
    draw(s) {
      const faint = { layer: 'back', opacity: 0.55 };
      s.rect(130, 60, 340, 240, { strokeWidth: 1.2 }, faint);
      for (const [a, b] of [[[130, 300], [-40, 470]], [[470, 300], [640, 470]], [[130, 60], [-40, -60]], [[470, 60], [640, -60]]]) s.line(a, b, { strokeWidth: 1 }, faint);
      for (const x of [-120, 40, 200, 400, 560, 720]) s.line([300 + (x - 300) * 0.28, 300], [x, 470], { strokeWidth: 0.5 }, { layer: 'back', opacity: 0.3 });
      O.latticeWindow(s, 160, 100, 110, 110);
      // bed
      const top = [[290, 262], [462, 262], [494, 318], [258, 318]];
      s.poly(top, { strokeWidth: 1.3 });
      s.poly([[258, 318], [494, 318], [494, 352], [258, 352]], { strokeWidth: 1.3 });
      s.tone([[258, 318], [494, 318], [494, 352], [258, 352]], { gap: 3.4, opacity: 0.45, cross: true });
      for (const x of [264, 488]) s.line([x, 352], [x, 374], { strokeWidth: 1.6 });
      s.poly([[296, 270], [350, 268], [356, 284], [292, 287]], { strokeWidth: 1.1 });
      s.poly([[398, 252], [452, 252], [462, 272], [394, 272]], { strokeWidth: 1.1 });
      s.poly([[394, 272], [462, 272], [462, 284], [394, 284]], { strokeWidth: 1.1 });
      s.tone([[394, 272], [462, 272], [462, 284], [394, 284]], { gap: 2.6, opacity: 0.5 });
      O.hangingJacket(s, 380, 118, 80);
      // desk with cup
      s.poly([[34, 338], [168, 338], [184, 362], [24, 362]], { strokeWidth: 1.2 });
      for (const x of [30, 178]) s.line([x, 362], [x, 440], { strokeWidth: 1.4 });
      O.cup(s, 100, 330, 34);
      O.shoes(s, 320, 404, 48);
    },
  },
  {
    id: 'dining',
    ratio: [4, 3],
    draw(s) {
      s.line([-10, 392], [610, 398], { strokeWidth: 1.2 }, { layer: 'back', opacity: 0.7 });
      s.tone([[-10, 398], [610, 404], [610, 470], [-10, 470]], { gap: 6, opacity: 0.25, layer: 'back' });
      grain(s, [430, 455]);
      O.steamers(s, 220, 368, 200, 3);
      O.bowl(s, 440, 352, 120, { rice: false });
      s.ellipse(440, 334, 118, 36, { strokeWidth: 1.1 }, { opacity: 0.85 });
      s.ellipse(440, 316, 116, 35, { strokeWidth: 1.1 }, { opacity: 0.85 });
      O.cup(s, 545, 318, 52);
      for (const dx of [-8, -2, 5, 10]) s.line([545 + dx, 322], [545 + dx * 1.8, 250], { strokeWidth: 1.4 });
    },
  },
  {
    id: 'rest-day',
    ratio: [4, 3],
    draw(s) {
      P.pine(s, 95, 75, 0.8);
      O.pavilion(s, 430, 118, 220);
      O.birds(s, 280, 70, 2);
      s.line([-10, 300], [610, 302], { strokeWidth: 1 }, { layer: 'back', opacity: 0.6 });
      for (const [x, y, l] of [[300, 316, 70], [380, 328, 90], [470, 318, 60], [520, 340, 50], [250, 340, 40]]) s.line([x, y], [x + l, y], { strokeWidth: 0.7 }, { layer: 'back', opacity: 0.4 });
      O.peony(s, 110, 385, 48, 1);
      O.peony(s, 225, 415, 38, 2);
      O.peony(s, 40, 320, 30, 3);
    },
  },

  // ---------------------------------------------------------------- Gallery
  {
    id: 'gallery-flying-kick',
    ratio: [4, 5],
    draw(s) {
      O.ground(s, 690);
      const f = drawFigure(s, {
        x: 285, y: 330, size: 360, style: 'shaolin', side: 0.65, face: 1, spine: 186,
        arms: { l: [-125, -140], r: [128, 122] },
        legs: { l: [100, 12, 30, 0.9, 0.85], r: [128, 124, 140] },
      }, { shadowY: 690, shadowWidth: 130 });
      motionLines(s, [f.pelvis[0] - 10, f.pelvis[1] + 150], 0, 70, 3, 18);
    },
  },
  {
    id: 'gallery-staff',
    ratio: [1, 1],
    draw(s) {
      O.ground(s, 512);
      const f = drawFigure(s, {
        x: 290, y: 335, size: 360, style: 'shaolin', side: 0.7, face: 1,
        arms: { l: [62, 118], r: [120, 72] },
        legs: { l: [-40, -10, -70], r: [45, 5, 90] },
      });
      const [a, b] = [f.aL.hand, f.aR.hand];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const p0 = [a[0] - ux * 230, a[1] - uy * 230];
      const p1 = [b[0] + ux * 230, b[1] + uy * 230];
      s.line(p0, p1, { strokeWidth: 2.4, roughness: 0.6 }, { layer: 'front' });
      s.line([p0[0] + 4, p0[1] + 3], [p1[0] + 4, p1[1] + 3], { strokeWidth: 1, roughness: 0.6 }, { layer: 'front', opacity: 0.6 });
    },
  },
  {
    id: 'gallery-meditation',
    ratio: [3, 4],
    draw(s) {
      s.ellipse(300, 330, 360, 360, { strokeWidth: 1.2 }, { layer: 'back', opacity: 0.5 });
      s.ellipse(300, 330, 340, 340, { strokeWidth: 0.7 }, { layer: 'back', opacity: 0.35 });
      O.cushion(s, 300, 605, 320);
      drawFigure(s, {
        x: 300, y: 562, size: 380, style: 'shaolin', face: 0,
        arms: { l: [-15, -14], r: [15, 14] },
        legs: { l: [-82, 72, 95, 0.85, 0.75, 0.45], r: [82, -72, -95, 0.85, 0.75, 0.45] },
      }, { shadowY: null });
      O.incense(s, 495, 690);
    },
  },
  {
    id: 'gallery-wooden-dummy',
    ratio: [4, 3],
    draw(s) {
      O.brickWall(s, -10, 610, 30, 300, 0.32);
      O.ground(s, 405);
      O.woodenDummy(s, 300, 110, 285, -1);
    },
  },
  {
    id: 'gallery-weapons',
    ratio: [4, 5],
    draw(s) {
      O.brickWall(s, -10, 610, 40, 560, 0.25);
      s.line([-10, 600], [610, 603], { strokeWidth: 1 }, { layer: 'back', opacity: 0.6 });
      O.weaponRack(s, 300, 175, 420);
    },
  },
  {
    id: 'gallery-stretching',
    ratio: [1, 1],
    draw(s) {
      O.ground(s, 492);
      O.stretchBar(s, 330, 575, 308, 492);
      drawFigure(s, {
        x: 210, y: 300, size: 360, style: 'shaolin', side: 0.6, face: 1, spine: 130,
        arms: { l: [112, 98], r: [118, 100] },
        legs: { l: [0, 0, 90], r: [92, 90, 172] },
      }, { shadowY: 492, shadowWidth: 120 });
    },
  },
];
