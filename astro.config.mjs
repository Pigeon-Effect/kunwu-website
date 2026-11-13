// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * The final domain is not decided yet (see CLAUDE.md, open questions).
 * SITE_URL / BASE_PATH are set by the GitHub Pages workflow; locally the
 * site builds for http://localhost:4321/.
 *   GitHub Pages without custom domain: SITE_URL=https://<user>.github.io  BASE_PATH=/<repo>
 *   With custom domain (public/CNAME):  SITE_URL=https://<domain>          BASE_PATH=/
 */
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

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
