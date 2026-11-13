/**
 * Photos of Master Shi Yanpeng (originals in src/assets/photos/master/originals/).
 * Derived files: early-years.jpg = scan with the white scanner edge trimmed;
 * side-kick-portrait.jpg = 4:5 crop of side-kick.jpg for the home hero.
 */
import type { ImageMetadata } from 'astro';
import earlyYears from '../assets/photos/master/early-years.jpg';
import sideKick from '../assets/photos/master/side-kick.jpg';
import sideKickPortrait from '../assets/photos/master/side-kick-portrait.jpg';

export interface SitePhoto {
  src: ImageMetadata;
  alt: { en: string; zh: string };
  caption?: { en: string; zh: string };
}

export const masterEarlyYears: SitePhoto = {
  src: earlyYears,
  alt: {
    en: 'An early photograph of Shi Yanpeng in a saffron robe and prayer beads, balancing on one leg on a rock with his arms spread wide, wooded hills behind him.',
    zh: '释延朋早年留影：身着黄色僧袍、佩戴念珠，单腿立于山石之上，双臂展开，身后是青山。',
  },
  caption: { en: 'An early photograph', zh: '早年留影' },
};

const sideKickAlt = {
  en: 'Master Shi Yanpeng kicking high to the side in front of a red brick wall.',
  zh: '释延朋师傅在红墙前高位侧踹。',
};

export const masterSideKick: SitePhoto = { src: sideKick, alt: sideKickAlt };
export const masterSideKickPortrait: SitePhoto = { src: sideKickPortrait, alt: sideKickAlt };
