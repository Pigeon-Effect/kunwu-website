// 山水 – the landscape on the home screen, after Ren Yu's Landscapes (1892, Cleveland Museum of Art 1915.97,
// CC0). Built from his first scroll: the peak in mist, the grove, the rocks and the pavilion on stilts over the
// water. A far range from the misty handscroll 1933.220 closes the horizon, the water takes its ripples from
// Bian Shoumin's geese scroll, and on the open ground by the pavilion four small figures practise kung fu – painted by
// figures.mjs in Ren Yu's figure manner (no source painting shows martial arts).
// Two formats: wide (landscape screens) and tall (phones) – the same scene, rearranged.
import { canvas, lay } from './compose.mjs';
import { water } from './water.mjs';
import { figures, ROBES } from './figures.mjs';

const REN = '1915.97_print.jpg';
const MIST = '1933.220_print.jpg';
// regions of the sources (source px)
const PEAK = { left: 255, top: 230, width: 560, height: 1250 };
const GROVE = { left: 20, top: 2050, width: 780, height: 900 };
const RANGE = { left: 1700, top: 110, width: 950, height: 260 };
const RANGE_FLAT = { paperScale: 400, inkRadius: 120, white: 0.95 };
// Bian Shoumin's water: broad, dry ripple sweeps, between the reeds and the geese
const BIAN = 'Bian_Shoumin_-_Geese_Descending_on_a_Sandbank_-_Google_Art_Project.jpg';
const RIPPLES = { left: 1670, top: 5430, width: 780, height: 270 };
const RIPPLE_FLAT = { paperScale: 300, inkRadius: 60, white: 0.93 };
const ripple = (x, y, scale, { flip = false, opacity = 0.6, seed = 1 } = {}) => ({
  src: BIAN,
  extract: RIPPLES,
  flat: RIPPLE_FLAT,
  scale,
  flip,
  x,
  y,
  opacity,
  tone: { lift: 0.8, sat: 0.35 },
  mask: { fade: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }, mist: 0.7, seed },
});

/** the practice: staff, kick and punch, the master watching (x offsets in figure heights) */
const practice = (x, y, h) => [
  { pose: 'staff', x: x, y: y + h * 0.02, h, face: 1, robe: ROBES.stone, sash: ROBES.cinnabar },
  { pose: 'kick', x: x + h * 1.02, y: y - h * 0.01, h, face: -1, robe: ROBES.ochre, sash: ROBES.cinnabar },
  { pose: 'punch', x: x + h * 1.78, y: y + h * 0.03, h, face: 1, robe: ROBES.celadon, sash: ROBES.cinnabar },
  { pose: 'master', x: x + h * 2.62, y: y - h * 0.02, h: h * 1.02, face: -1, robe: ROBES.grey },
];

export const layouts = {
  wide: {
    w: 2400,
    h: 1400,
    layers: [
      // water: three takes of Bian Shoumin's ripples, softly dissolved into the paper
      ripple(380, 1010, 1.1, { seed: 31, opacity: 0.55 }),
      ripple(1060, 1130, 0.95, { flip: true, seed: 33, opacity: 0.6 }),
      ripple(80, 1210, 1.3, { flip: true, seed: 35, opacity: 0.7 }),
      // the far range on the left horizon, pale, its foot in mist
      { src: MIST, extract: RANGE, flat: RANGE_FLAT, scale: 1.25, x: 120, y: 640, tone: { lift: 0.5, sat: 0.7 }, mask: { fade: { bottom: 0.55, left: 0.35, right: 0.3, top: 0.05 }, seed: 11 } },
      // a second peak behind the main one, paler, mirrored – depth
      { src: REN, extract: PEAK, scale: 0.62, flip: true, x: 1080, y: 260, tone: { lift: 0.4, sat: 0.6 }, mask: { fade: { bottom: 0.55, left: 0.25, right: 0.18 }, seed: 3 } },
      // the main peak
      { src: REN, extract: PEAK, scale: 0.96, x: 1440, y: 40, mask: { fade: { bottom: 0.45, left: 0.12, right: 0.06, top: 0.02 }, seed: 5 } },
      // grove, rocks, pavilion
      { src: REN, extract: GROVE, scale: 1.1, x: 2400 - 858, y: 1400 - 990, mask: { fade: { top: 0.28, left: 0.16 }, mist: 0.6, seed: 9 } },
    ],
    water: {
      x: 0,
      y: 860,
      w: 2400,
      h: 540,
      seed: 21,
      ink: 1.2,
      rows: [
        // under the far shore: faint and short
        { x: 300, y: 40, len: 260, ink: 0.13, width: 2.6 },
        { x: 720, y: 58, len: 340, ink: 0.13, width: 2.6 },
        { x: 1180, y: 34, len: 220, ink: 0.12, width: 2.4 },
        { x: 1380, y: 180, len: 260, ink: 0.13 },
      ],
    },
    figures: practice(2010, 1300, 58),
  },
  tall: {
    w: 1200,
    h: 2200,
    layers: [
      ripple(-60, 1330, 1.0, { seed: 31, opacity: 0.55 }),
      ripple(260, 1560, 0.9, { flip: true, seed: 33, opacity: 0.6 }),
      ripple(-120, 1760, 1.15, { seed: 35, opacity: 0.65 }),
      { src: MIST, extract: RANGE, flat: RANGE_FLAT, scale: 0.95, x: -120, y: 1030, tone: { lift: 0.5, sat: 0.7 }, mask: { fade: { bottom: 0.55, left: 0.2, right: 0.3, top: 0.05 }, seed: 11 } },
      { src: REN, extract: PEAK, scale: 0.7, flip: true, x: 300, y: 380, tone: { lift: 0.4, sat: 0.6 }, mask: { fade: { bottom: 0.55, left: 0.25, right: 0.18 }, seed: 3 } },
      { src: REN, extract: PEAK, scale: 1.2, x: 530, y: 90, mask: { fade: { bottom: 0.42, left: 0.12, right: 0.04, top: 0.02 }, seed: 5 } },
      { src: REN, extract: GROVE, scale: 1.3, x: 1200 - 1014, y: 2200 - 1170, mask: { fade: { top: 0.28, left: 0.2 }, mist: 0.6, seed: 9 } },
    ],
    water: {
      x: 0,
      y: 1240,
      w: 1200,
      h: 720,
      seed: 22,
      ink: 1.2,
      rows: [
        { x: 120, y: 50, len: 240, ink: 0.13, width: 2.6 },
        { x: 470, y: 72, len: 200, ink: 0.12, width: 2.4 },
        { x: 520, y: 260, len: 260, ink: 0.13 },
      ],
    },
    figures: practice(560, 2075, 70),
  },
};

export async function hero(format) {
  const L = layouts[format];
  const c = canvas(L.w, L.h);
  water(c, L.water);
  for (const layer of L.layers) await lay(c, layer);
  figures(c, L.figures);
  return c;
}
