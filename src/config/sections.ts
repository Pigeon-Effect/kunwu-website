/**
 * Section labels "(pinyin) 汉字" – the same in both languages. The accessible English name
 * comes from the i18n files (nav.* / page titles).
 */
export const sections = {
  philosophy: { pinyin: 'wǔ dé', hanzi: '武德' },
  masters: { pinyin: 'shī zī', hanzi: '师资' },
  programs: { pinyin: 'kè chéng', hanzi: '课程' },
  contact: { pinyin: 'lián xì', hanzi: '联系' },
  dailyLife: { pinyin: 'rì cháng', hanzi: '日常' },
  schedule: { pinyin: 'zuò xī', hanzi: '作息' },
  gallery: { pinyin: 'yǐng xiàng', hanzi: '影像' },
  book: { pinyin: 'bào míng', hanzi: '报名' },
  notFound: { pinyin: 'mí lù', hanzi: '迷路' },
} as const;

export type SectionKey = keyof typeof sections;
