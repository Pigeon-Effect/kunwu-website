// 册页 – the excerpts each page is decorated with: a single motif cut from a painting, its old paper
// removed, its edge dissolved into the site's paper. One theme per page:
//   home        山水 landscape   (the hero is composed in hero.mjs; here Fan Qi's cliff temple, and Mi
//                                Youren's cloudy range for the menu)
//   masters     花木 plants, trees: pine, chrysanthemum, peony
//   training    翎毛 animals: wild goose, mantis, duck on a rock, dragonfly, crabs
//   contact     海   the sea: waves and a fishing boat
//   daily life  人物 people: children playing jianzi
//   book        行旅 travellers
// `out` is the master width in px (about twice the largest size the page shows it at).
import { mask as makeMask, excerpt, FLAT } from './compose.mjs';
import { resizeImg } from './lib.mjs';
import { tone } from './compose.mjs';

const WANG_I = "'Eight_Landscape_and_Flower_Paintings'_by_Wang_Xuehao,_Honolulu_Museum_of_Art_I.jpg";
const WANG_II = "'Eight_Landscape_and_Flower_Paintings'_by_Wang_Xuehao,_Honolulu_Museum_of_Art_II.jpg";
const ALBUM = (n) => `Album_pages,_China,_1800-1900_-_Museu_Nacional_de_Machado_de_Castro_-_Coimbra,_Portugal_-_DSC0030${n}.jpg`;

export const excerpts = {
  // 山水 · home — Fan Qi: a temple on a cliff top, a waterfall, the foot lost in cloud
  'cliff-temple': {
    src: '清_樊圻_為玉翁作山水圖_冊-Landscapes_Painted_for_Yuweng_MET_DP160555.jpg',
    extract: { left: 470, top: 40, width: 980, height: 1290 },
    out: 900,
    mask: { fade: { bottom: 0.4, left: 0.18, right: 0.16, top: 0.05 }, seed: 41 },
  },

  // Mi Youren, Cloudy Mountains (1130): a long range of hills in cloud – for the menu panel
  range: {
    src: '1933.220_print.jpg',
    extract: { left: 1300, top: 70, width: 2000, height: 420 },
    flat: { paperScale: 400, inkRadius: 120, white: 0.95 },
    out: 1600,
    tone: { lift: 0.75, sat: 0.7 },
    mask: { fade: { top: 0.2, bottom: 0.35, left: 0.25, right: 0.25 }, seed: 39 },
  },

  // 花木 · masters — Wang Xuehao: pine bough over narcissus (inscription and seal left out)
  pine: {
    src: WANG_II,
    extract: { left: 30, top: 24, width: 2140, height: 1840 },
    out: 1200,
    mask: {
      keep: [[0.02, 0], [1, 0], [1, 1], [0.17, 1], [0.17, 0.44], [0.02, 0.44]],
      feather: 60,
      fade: { bottom: 0.25, right: 0.12, left: 0.06, top: 0.03 },
      seed: 43,
    },
  },
  // Zheng Xie: ink chrysanthemums leaning out from a rock
  chrysanthemum: {
    src: 'Chrysanthemum_Spring_of_Gangu_by_Zheng_Xie.jpg',
    extract: { left: 640, top: 1500, width: 646, height: 1800 },
    out: 600,
    mask: { fade: { top: 0.15, bottom: 0.2, left: 0.38, right: 0.04 }, seed: 45 },
  },
  // Wang Xuehao: a peony – the flower of Heze
  peony: {
    src: WANG_I,
    extract: { left: 470, top: 380, width: 1640, height: 1440 },
    out: 1000,
    mask: { fade: { bottom: 0.18, right: 0.1, left: 0.12, top: 0.08 }, seed: 47 },
  },

  // 翎毛 · training — Bian Shoumin: a wild goose coming down
  goose: {
    src: 'Bian_Shoumin_-_Geese_Descending_on_a_Sandbank_-_Google_Art_Project.jpg',
    extract: { left: 1660, top: 2880, width: 1120, height: 920 },
    out: 1000,
    mask: { fade: { bottom: 0.15, right: 0.12, left: 0.12, top: 0.08 }, seed: 51 },
  },
  // Coimbra album: a praying mantis (螳螂 – Shandong's mantis boxing)
  mantis: {
    src: ALBUM(1),
    extract: { left: 3080, top: 1150, width: 1560, height: 1180 },
    out: 820,
    flat: { paperScale: 320, inkRadius: 60, white: 0.92 },
    mask: { fade: { bottom: 0.15, right: 0.1, left: 0.1, top: 0.1 }, seed: 53 },
  },
  // Bada Shanren: a bird on the edge of a rock, with his white, sideways eye – stillness, watchfulness
  bird: {
    src: 'Bada_Shanren_-_Lotus_and_Ducks_-_Google_Art_Project.jpg',
    extract: { left: 88, top: 630, width: 340, height: 280 },
    out: 340,
    mask: { fade: { bottom: 0.22, right: 0.18, left: 0.12, top: 0.12 }, seed: 55 },
  },
  // Coimbra album: a dragonfly (its seal left out)
  dragonfly: {
    src: ALBUM(2),
    extract: { left: 880, top: 1090, width: 1420, height: 1200 },
    out: 760,
    flat: { paperScale: 320, inkRadius: 60, white: 0.92 },
    mask: { keep: [[0.46, 0], [1, 0], [1, 1], [0, 1], [0, 0.22], [0.46, 0.22]], feather: 40, fade: { bottom: 0.15, right: 0.1, left: 0.1, top: 0.08 }, seed: 57 },
  },
  // Coimbra album: two crabs, claws locked
  crabs: {
    src: ALBUM(3),
    extract: { left: 640, top: 850, width: 1560, height: 940 },
    out: 820,
    flat: { paperScale: 320, inkRadius: 60, white: 0.92 },
    mask: { fade: { bottom: 0.15, right: 0.1, left: 0.1, top: 0.12 }, seed: 59 },
  },

  // 海 · contact — Suzhou woodblock print "Happy Fisherfolk": waves and a boat with three fishermen
  waves: {
    src: '2025.91_print.jpg',
    extract: { left: 1290, top: 2925, width: 1030, height: 445 },
    flat: { paperScale: 220, inkRadius: 40, white: 0.95 },
    tone: { lift: 0.9, sat: 0.55 },
    mask: { fade: { top: 0.1, right: 0.16, left: 0.12, bottom: 0.05 }, mist: 0.35, seed: 61 },
  },

  // 人物 · daily life — Shen Qinglan: children kicking a jianzi under a pine (signature left out)
  jianzi: {
    src: 'Children_Playing_Jianzi.jpg',
    extract: { left: 40, top: 790, width: 740, height: 880 },
    out: 740,
    mask: { keep: [[0, 0], [1, 0], [1, 1], [0.12, 1], [0.12, 0.86], [0, 0.86]], feather: 30, fade: { top: 0.12, bottom: 0.08, left: 0.1, right: 0.1 }, seed: 63 },
  },

  // 行旅 · book — Ren Yu: travellers on a snowy mountain path
  travellers: {
    src: '1915.97_print.jpg',
    extract: { left: 2790, top: 2330, width: 560, height: 560 },
    out: 560,
    mask: { fade: { top: 0.3, bottom: 0.2, left: 0.2, right: 0.15 }, seed: 65 },
  },
};

/** Render one excerpt: { image (float RGB on white, at `out` width), mask } */
export async function renderExcerpt(name) {
  const E = excerpts[name];
  let f = await excerpt(E.src, E.extract, E.flat ?? FLAT);
  if (E.out && E.out < f.w) f = await resizeImg(f, E.out, Math.round((f.h * E.out) / f.w));
  if (E.tone) f = tone(f, E.tone);
  const m = makeMask(f.w, f.h, E.mask ?? {});
  return { image: f, mask: m };
}
