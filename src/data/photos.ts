/**
 * Every photo the site uses, with alt texts in both languages.
 *
 * `todoReplace: true` = low-resolution copy (WeChat re-compression, ~1000 px on the long side for
 * most). Used anyway with the `.film` treatment and never shown larger than needed – replace with
 * originals when available. The full list with dimensions and places of use is in images.todo.md.
 *
 * Alt texts describe what is visible; they make no claims about places or events.
 */
import type { ImageMetadata } from 'astro';

import yantaoGuandaoTemple from '../assets/photos/gallery/shi-yantao-guandao-temple.jpg';
import yansongSwordBamboo from '../assets/photos/gallery/shi-yansong-sword-bamboo.jpg';
import yansongBlueRobe from '../assets/photos/gallery/shi-yansong-blue-robe.jpg';
import yansongGuandaoHall from '../assets/photos/gallery/shi-yansong-guandao-hall.jpg';
import schoolForecourt from '../assets/photos/gallery/school-forecourt.jpg';
import schoolFlowerBeds from '../assets/photos/gallery/school-flower-beds.jpg';
import schoolLake from '../assets/photos/gallery/school-lake.jpg';
import guestRoom from '../assets/photos/gallery/guest-room.jpg';
import diningHall from '../assets/photos/gallery/dining-hall.jpg';
import lounge from '../assets/photos/gallery/lounge.jpg';
import banquetRoom from '../assets/photos/gallery/banquet-room.jpg';
// Shi Yanpeng (entry hidden, see src/data/masters.ts). early-years.jpg = scan with the white
// scanner edge trimmed; side-kick-portrait.jpg = 4:5 crop of side-kick.jpg. Originals in master/originals/.
import yanpengEarlyYears from '../assets/photos/master/early-years.jpg';
import yanpengSideKick from '../assets/photos/master/side-kick.jpg';

export interface SitePhoto {
  src: ImageMetadata;
  alt: { en: string; zh: string };
  /** low quality – replace when a better original exists */
  todoReplace: boolean;
}

export const photos = {
  yantaoGuandaoTemple: {
    src: yantaoGuandaoTemple,
    alt: {
      en: 'Shi Yantao in a white uniform with red embroidery, in a low stance with a guandao raised behind his head, in front of a wide temple hall with red pillars.',
      zh: '释延涛身着绣有红色花纹的白色练功服，于红柱大殿前沉身下势，大刀举过头顶。',
    },
    todoReplace: true,
  },
  yansongSwordBamboo: {
    src: yansongSwordBamboo,
    alt: {
      en: 'Shi Yansong holding two swords with green and red tassels, one raised behind his head and one across his body, in front of bamboo.',
      zh: '释延淞手持双剑，一剑举过头顶、一剑横于身前，剑穗一绿一红，身后是竹林。',
    },
    todoReplace: true,
  },
  yansongBlueRobe: {
    src: yansongBlueRobe,
    alt: {
      en: 'Shi Yansong in a long blue robe and prayer beads, low in a stance with one hand raised, under indigo-dyed cloth banners in a paved lane.',
      zh: '释延淞身着蓝色长衫、佩戴念珠，在蓝染布幔下的石板小巷中沉身下势，一手上扬。',
    },
    todoReplace: true,
  },
  yansongGuandaoHall: {
    src: yansongGuandaoHall,
    alt: {
      en: 'Shi Yansong kneeling on one knee with a guandao raised, in a bright hall with a calligraphy of the character 武 on the wall behind him.',
      zh: '释延淞单膝跪地，举起大刀，身后墙上挂着“武”字书法。',
    },
    todoReplace: true,
  },
  schoolForecourt: {
    src: schoolForecourt,
    alt: {
      en: 'A wide forecourt with a large stone in front of white low buildings with an arched glass front, under a blue sky.',
      zh: '蓝天下宽阔的广场，一块大石立在白色低层建筑前，建筑带有拱形玻璃立面。',
    },
    todoReplace: true,
  },
  schoolFlowerBeds: {
    src: schoolFlowerBeds,
    alt: {
      en: 'Beds of red flowers in bloom in front of white buildings and trees, under an overcast sky.',
      zh: '阴天下，白色建筑与树木前盛开着成片的红色花朵。',
    },
    todoReplace: true,
  },
  schoolLake: {
    src: schoolLake,
    alt: {
      en: 'White buildings reflected in a still lake in the evening light.',
      zh: '傍晚的光线中，白色建筑倒映在平静的湖面上。',
    },
    todoReplace: true,
  },
  guestRoom: {
    src: guestRoom,
    alt: {
      en: 'A bright room with a double bed, a desk, two wooden armchairs and a balcony door.',
      zh: '明亮的房间：一张双人床、书桌、两把木扶手椅和通往阳台的门。',
    },
    todoReplace: true,
  },
  diningHall: {
    src: diningHall,
    alt: {
      en: 'A large dining hall with round tables, upholstered chairs and a long buffet counter.',
      zh: '宽敞的餐厅：圆桌、软垫椅和长长的自助餐台。',
    },
    todoReplace: true,
  },
  lounge: {
    src: lounge,
    alt: {
      en: 'A lounge with wooden armchairs behind a glass wall, looking out onto water and white buildings.',
      zh: '玻璃墙后摆着木扶手椅的休息区，窗外是水面和白色建筑。',
    },
    todoReplace: true,
  },
  banquetRoom: {
    src: banquetRoom,
    alt: {
      en: 'A private dining room with a large carved round table, gilded chairs and a calligraphy scroll on the wall.',
      zh: '包间：雕花大圆桌、金色座椅，墙上挂着书法长卷。',
    },
    todoReplace: true,
  },
  yanpengEarlyYears: {
    src: yanpengEarlyYears,
    alt: {
      en: 'An early photograph of Shi Yanpeng in a saffron robe and prayer beads, balancing on one leg on a rock with his arms spread wide, wooded hills behind him.',
      zh: '释延朋早年留影：身着黄色僧袍、佩戴念珠，单腿立于山石之上，双臂展开，身后是青山。',
    },
    todoReplace: false,
  },
  yanpengSideKick: {
    src: yanpengSideKick,
    alt: {
      en: 'Master Shi Yanpeng kicking high to the side in front of a red brick wall.',
      zh: '释延朋师傅在红墙前高位侧踹。',
    },
    todoReplace: false,
  },
} satisfies Record<string, SitePhoto>;

export type PhotoId = keyof typeof photos;
