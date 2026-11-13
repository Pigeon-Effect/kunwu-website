/**
 * Contact and location data. `null` = not known yet → the site renders a visible placeholder.
 * See CLAUDE.md → open questions.
 */
import type { ImageMetadata } from 'astro';

export interface SiteContact {
  email: string | null;
  phone: string | null;
  wechatId: string | null;
  /** import the QR image from src/assets/contact/ once available */
  wechatQr: ImageMetadata | null;
  /** Exact coordinates for the OpenStreetMap link – [lat, lon] */
  coordinates: [number, number] | null;
  /** Plain links only (no embeds) */
  social: { label: string; url: string }[];
}

export const contact: SiteContact = {
  email: null,
  phone: null,
  wechatId: null,
  wechatQr: null,
  coordinates: null,
  social: [],
};

/** Address as given in content/master.md. Spelling to be confirmed by the school. */
export const address = {
  confirmed: false,
  zh: '山东省菏泽市牡丹区尧舜产业园内尧舜牡丹酒店 坤武功夫国际交流中心',
  zhLines: ['坤武功夫国际交流中心', '尧舜牡丹酒店（尧舜产业园内）', '山东省菏泽市牡丹区'],
  enLines: [
    'Kunwu Kung Fu International Exchange Center',
    'Yaoshun Peony Hotel, Yaoshun Industrial Park',
    'Mudan District, Heze',
    'Shandong Province, China',
  ],
};

export const mapLink = (): string => {
  if (contact.coordinates) {
    const [lat, lon] = contact.coordinates;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
  }
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent('菏泽 牡丹区 尧舜')}`;
};

/** Heze is on China Standard Time (UTC+8, no daylight saving). */
export const SCHOOL_UTC_OFFSET_MINUTES = 8 * 60;
