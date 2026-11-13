import en from './en.json';
import zh from './zh.json';

export const locales = ['en', 'zh'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

/** BCP 47 tags for <html lang> and hreflang */
export const htmlLang: Record<Lang, string> = { en: 'en', zh: 'zh-Hans' };
/** Intl locale for number / date formatting */
export const intlLocale: Record<Lang, string> = { en: 'en-US', zh: 'zh-CN' };

export type Dict = typeof en;
// Compile-time guarantee that zh.json has exactly the same keys as en.json.
const zhDict: Dict = zh;
const dicts: Record<Lang, Dict> = { en, zh: zhDict };

export const isLang = (value: unknown): value is Lang => locales.includes(value as Lang);

export const useT = (lang: Lang): Dict => dicts[lang];

/** Replace {name} tokens in a string. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));

export const weeksLabel = (lang: Lang, weeks: number): string => {
  const w = dicts[lang].common.weeks;
  return weeks === 1 ? w.one : fill(w.other, { n: weeks });
};

/** Route keys → URL segment. Same slugs in both languages, so switching only swaps the prefix. */
export const routes = {
  home: '',
  master: 'master',
  dailyLife: 'daily-life',
  training: 'training',
  book: 'book',
  contact: 'contact',
} as const;
export type RouteKey = keyof typeof routes;

const base = (() => {
  const b = import.meta.env.BASE_URL;
  return b.endsWith('/') ? b : `${b}/`;
})();

/** Absolute path (including base) for a locale + route, always with trailing slash. */
export const localePath = (lang: Lang, route: RouteKey | string = 'home', hash?: string): string => {
  const segment = route in routes ? routes[route as RouteKey] : route;
  const path = `${base}${lang}/${segment ? `${segment.replace(/^\/|\/$/g, '')}/` : ''}`;
  return hash ? `${path}#${hash}` : path;
};

/** Path of the current page in another language. */
export const switchLangPath = (pathname: string, to: Lang): string => {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const withoutLang = rest.replace(/^(en|zh)(\/|$)/, '');
  return `${base}${to}/${withoutLang}`;
};

/** Path to a file in /public (respects base). */
export const asset = (path: string): string => `${base}${path.replace(/^\//, '')}`;

/** Split a collection entry id like "en/shaolin" into its language and slug. */
export const splitId = (id: string): { lang: Lang; slug: string } => {
  const [lang, ...rest] = id.split('/');
  if (!isLang(lang)) throw new Error(`Content entry "${id}" is not inside an en/ or zh/ folder`);
  return { lang, slug: rest.join('/') };
};

export const getLangStaticPaths = () => locales.map((lang) => ({ params: { lang } }));
