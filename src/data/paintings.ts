/**
 * The painting excerpts that decorate the site (made by `npm run paintings`, scripts/paintings/) and the
 * paintings they come from. Every source is public domain or CC0; the footer credits the ones each page shows.
 * Titles are given in Chinese only where the collection gives a Chinese title; otherwise the English one.
 *
 * One theme per page: home 山水 landscape · masters 花木 plants and trees · training 翎毛 animals ·
 * contact 海 the sea · daily life 人物 people · book 行旅 travellers.
 */
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/utils';
import heroWide from '../assets/paintings/hero-wide.webp';
import heroTall from '../assets/paintings/hero-tall.webp';
import cliffTemple from '../assets/paintings/cliff-temple.webp';
import range from '../assets/paintings/range.webp';
import pine from '../assets/paintings/pine.webp';
import chrysanthemum from '../assets/paintings/chrysanthemum.webp';
import peony from '../assets/paintings/peony.webp';
import goose from '../assets/paintings/goose.webp';
import mantis from '../assets/paintings/mantis.webp';
import bird from '../assets/paintings/bird.webp';
import dragonfly from '../assets/paintings/dragonfly.webp';
import crabs from '../assets/paintings/crabs.webp';
import waves from '../assets/paintings/waves.webp';
import jianzi from '../assets/paintings/jianzi.webp';
import travellers from '../assets/paintings/travellers.webp';

type T = Record<Lang, string>;

export interface Source {
  artist: T;
  title: T;
  date: T;
  collection: T;
  url: string;
}

/** The source paintings. Licences: CC0 (museum open access) or public domain (Wikimedia Commons). */
export const sources = {
  renYu: {
    artist: { en: 'Ren Yu (1853–1901)', zh: '任预（1853–1901）' },
    title: { en: 'Landscapes, four hanging scrolls', zh: '山水图四条屏' },
    date: { en: '1892', zh: '1892年' },
    collection: { en: 'The Cleveland Museum of Art, 1915.97, CC0', zh: '克利夫兰艺术博物馆 1915.97，CC0' },
    url: 'https://clevelandart.org/art/1915.97',
  },
  miYouren: {
    artist: { en: 'Mi Youren (1072–1151)', zh: '米友仁（1072–1151）' },
    title: { en: 'Cloudy Mountains', zh: '云山图' },
    date: { en: '1130', zh: '1130年' },
    collection: { en: 'The Cleveland Museum of Art, 1933.220, CC0', zh: '克利夫兰艺术博物馆 1933.220，CC0' },
    url: 'https://clevelandart.org/art/1933.220',
  },
  bianShoumin: {
    artist: { en: 'Bian Shoumin (1684–1752)', zh: '边寿民（1684–1752）' },
    title: { en: 'Geese Descending on a Sandbank', zh: 'Geese Descending on a Sandbank' },
    date: { en: '1730', zh: '1730年' },
    collection: { en: 'Museum of Fine Arts, Houston, public domain', zh: '休斯敦美术馆，公有领域' },
    url: 'https://commons.wikimedia.org/w/index.php?curid=21880482',
  },
  fanQi: {
    artist: { en: 'Fan Qi (1616–1694)', zh: '樊圻（1616–1694）' },
    title: { en: 'Landscapes Painted for Yuweng', zh: '为玉翁作山水图册' },
    date: { en: '1673', zh: '1673年' },
    collection: { en: 'The Metropolitan Museum of Art, 1989.363.131, CC0', zh: '大都会艺术博物馆 1989.363.131，CC0' },
    url: 'https://commons.wikimedia.org/wiki/File:%E6%B8%85_%E6%A8%8A%E5%9C%BB_%E7%82%BA%E7%8E%89%E7%BF%81%E4%BD%9C%E5%B1%B1%E6%B0%B4%E5%9C%96_%E5%86%8A-Landscapes_Painted_for_Yuweng_MET_DP160555.jpg',
  },
  wangXuehao: {
    artist: { en: 'Wang Xuehao (1754–1832)', zh: '王学浩（1754–1832）' },
    title: { en: 'Eight Landscape and Flower Paintings', zh: 'Eight Landscape and Flower Paintings' },
    date: { en: 'early 19th century', zh: '19世纪初' },
    collection: { en: 'Honolulu Museum of Art, CC0', zh: '檀香山艺术博物馆，CC0' },
    url: "https://commons.wikimedia.org/wiki/File:%27Eight_Landscape_and_Flower_Paintings%27_by_Wang_Xuehao,_Honolulu_Museum_of_Art_II.JPG",
  },
  zhengXie: {
    artist: { en: 'Zheng Xie (1693–1766)', zh: '郑燮（1693–1766）' },
    title: { en: 'Chrysanthemum Spring of Gangu', zh: '甘谷菊泉图' },
    date: { en: '1766', zh: '1766年' },
    collection: { en: 'Nanjing Museum, public domain', zh: '南京博物院，公有领域' },
    url: 'https://commons.wikimedia.org/wiki/File:Chrysanthemum_Spring_of_Gangu_by_Zheng_Xie.jpg',
  },
  coimbraAlbum: {
    artist: { en: 'Unknown painter', zh: '佚名' },
    title: { en: 'Album pages', zh: '册页' },
    date: { en: '1800–1900', zh: '19世纪' },
    collection: { en: 'Museu Nacional de Machado de Castro, Coimbra, CC0', zh: '科英布拉国立马沙多·德·卡斯特罗博物馆，CC0' },
    url: 'https://commons.wikimedia.org/wiki/File:Album_pages,_China,_1800-1900_-_Museu_Nacional_de_Machado_de_Castro_-_Coimbra,_Portugal_-_DSC00301.jpg',
  },
  badaShanren: {
    artist: { en: 'Bada Shanren (1626–1705)', zh: '八大山人（1626–1705）' },
    title: { en: 'Lotus and Ducks', zh: 'Lotus and Ducks' },
    date: { en: 'c. 1696', zh: '约1696年' },
    collection: { en: 'Freer Gallery of Art, Washington, public domain', zh: '弗利尔美术馆，公有领域' },
    url: 'https://commons.wikimedia.org/w/index.php?curid=13318800',
  },
  happyFisherfolk: {
    artist: { en: 'Suzhou print, issued by Lü Yuntai', zh: '姑苏吕云台发行' },
    title: { en: 'Happy Fisherfolk, woodblock print', zh: '渔家欢乐（木版年画）' },
    date: { en: '1662–1722', zh: '康熙年间' },
    collection: { en: 'The Cleveland Museum of Art, 2025.91, CC0', zh: '克利夫兰艺术博物馆 2025.91，CC0' },
    url: 'https://clevelandart.org/art/2025.91.b',
  },
  shenQinglan: {
    artist: { en: 'Shen Qinglan', zh: '沈庆兰' },
    title: { en: 'Children Playing Jianzi', zh: '童儿娱毽图' },
    date: { en: 'Qing dynasty', zh: '清代' },
    collection: { en: 'public domain', zh: '公有领域' },
    url: 'https://commons.wikimedia.org/wiki/File:Children_Playing_Jianzi.jpg',
  },
} satisfies Record<string, Source>;

export type SourceKey = keyof typeof sources;

export interface Painting {
  image: ImageMetadata;
  /** paintings it is cut or composed from */
  from: SourceKey[];
}

export const paintings = {
  heroWide: { image: heroWide, from: ['renYu', 'miYouren', 'bianShoumin'] },
  heroTall: { image: heroTall, from: ['renYu', 'miYouren', 'bianShoumin'] },
  cliffTemple: { image: cliffTemple, from: ['fanQi'] },
  range: { image: range, from: ['miYouren'] },
  pine: { image: pine, from: ['wangXuehao'] },
  chrysanthemum: { image: chrysanthemum, from: ['zhengXie'] },
  peony: { image: peony, from: ['wangXuehao'] },
  goose: { image: goose, from: ['bianShoumin'] },
  mantis: { image: mantis, from: ['coimbraAlbum'] },
  bird: { image: bird, from: ['badaShanren'] },
  dragonfly: { image: dragonfly, from: ['coimbraAlbum'] },
  crabs: { image: crabs, from: ['coimbraAlbum'] },
  waves: { image: waves, from: ['happyFisherfolk'] },
  jianzi: { image: jianzi, from: ['shenQinglan'] },
  travellers: { image: travellers, from: ['renYu'] },
} satisfies Record<string, Painting>;

export type PaintingKey = keyof typeof paintings;

/** The sources behind a set of paintings, each once, in order of first use. */
export const sourcesOf = (keys: PaintingKey[]): Source[] => [
  ...new Set(keys.flatMap((k) => paintings[k].from as SourceKey[])),
].map((s) => sources[s]);
