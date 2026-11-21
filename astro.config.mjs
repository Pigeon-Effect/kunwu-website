// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * Base path and site URL come from the environment, so the same code builds for
 * GitHub Pages (sub-folder) and for a domain root (later, China-friendly host).
 *   SITE_BASE  path the site is served under   default: /kunwu-website/
 *              domain root: SITE_BASE=/
 *              (BASE_PATH is still accepted as an older name for the same thing)
 *   SITE_URL   origin, used for canonical / hreflang / og URLs and the sitemap
 * Git Bash on Windows rewrites values that look like paths – prefix with MSYS_NO_PATHCONV=1.
 * All internal links go through localePath() / asset() in src/i18n/utils.ts, which read the base.
 */
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.SITE_BASE || process.env.BASE_PATH || '/kunwu-website/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
      // `/` is a hand-written page (src/pages/index.astro) that picks en or zh.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hans' } },
      filter: (page) => /\/(en|zh)\//.test(page),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
