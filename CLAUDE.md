# Kunwu Kung Fu – Website

Website for **坤武功夫国际交流中心 / Kunwu International Kung Fu Training Center**.
Masters: **释延淞 (Shi Yansong)** and **释延涛 (Shi Yantao)**, Meihua Quan successors and lay disciples of the Shaolin Temple.
Location: Heze, Shandong, China.

## Goals
- Simple, clear, fast. Mobile first, works equally well on desktop.
- Bilingual: English (`/en/`) and Simplified Chinese (`/zh/`). Every page exists in both languages.
- Visitors can sign up and pay directly (Stripe Payment Links, no own backend).
- Strong insight into daily life at the school: daily schedule, photos, short video clips.
- Must load fast in mainland China AND abroad.

## Stack
- Astro (static output), Tailwind CSS, TypeScript
- Astro i18n routing: `defaultLocale: 'en'`, `locales: ['en', 'zh']`, `prefixDefaultLocale: true`
- Content in Astro content collections (Markdown/MDX), one file per language
- UI strings in `src/i18n/{en,zh}.json`
- Deployment: GitHub Pages via `withastro/action` (GitHub Actions). Base path from `SITE_BASE` (default `/kunwu-website/`, `/` for a domain root)
- Custom domain via `public/CNAME`; `site` set in `astro.config.mjs`

## Hard rules (China compatibility)
- NO Google services: no Google Fonts, Maps, Analytics, reCAPTCHA, YouTube embeds.
- NO external CDNs for JS/CSS. Everything self-hosted and bundled.
- Chinese body text uses system fonts only: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`.
- Chinese display type (headings, names, seals, labels) uses Noto Serif SC, self-hosted as ONE subset woff2 built by `npm run fonts` (`src/assets/fonts/kunwu-serif-sc.woff2`). Never load the full font.
- Latin display font: Cormorant Garamond, self-hosted via @fontsource (latin + latin-ext for pinyin), one family only.
- Images via Astro `<Image>` / `<Picture>` (AVIF + WebP, lazy loading, explicit sizes).
- Videos: short compressed MP4 (H.264, <5 MB each), self-hosted, `preload="none"` with poster image. External links to YouTube / Bilibili allowed as plain links only.
- Maps: static image or OpenStreetMap link, no embed.
- Minimal JavaScript. Prefer zero-JS pages; islands only where needed (e.g. mobile menu, language switch).

## Pages (both languages)
1. Home – hero (a painted landscape), short intro (武德), call to action "Book your training". Only that: masters, programs, daily life and contact are separate pages, never sections of the home page
2. Masters – 释延淞 and 释延涛 (data in `src/data/masters.ts`; 释延朋 kept there with `visible: false`)
3. Daily life – daily schedule (timeline), photo gallery, video clips
4. Training & prices – programs (Shaolin Kung Fu, Tai Chi, MMA, Wing Chun), durations, prices, what's included (accommodation, meals)
5. Book – program selection → Stripe Payment Link per program/duration
6. FAQ – visa, arrival, equipment, language, health requirements
7. Contact – address, WeChat QR code, email

## Design direction (traditional painting on rice paper, Nov 2026)
- Each page is a hanging scroll (立轴): the header is its top mounting (天头: wooden rod, mounting silk with a ruyi-cloud damask, a key-fret border strip 隔水, a cast shadow), the footer its bottom (地头, the roller 地杆 with knobs 轴头). The logo sits on a paper title slip (题签). The header slides away while scrolling down and returns at once on any scroll up (Base.astro).
- The page is real rice paper: `src/assets/paper/rice-paper.webp`, a seamless tile (no visible repeat, no seams) made from `src/assets/photos/background/background_ricepaper.jpg` by `npm run paintings` (scripts/paintings/paper.mjs), plus a fine SVG grain in `global.css`.
- Decoration = subtle but detailed excerpts of real traditional paintings (`src/assets/photos/chinese_traditional_paintings/`, all CC0 / public domain): cut out, their old paper removed, edges dissolved like mist, multiplied into the paper (`Painting`; data and credits in `src/data/paintings.ts`; made by `npm run paintings`, scripts/paintings/). One theme per page: home 山水 landscape · masters 花木 plants and trees · programs 翎毛 animals · contact 海 the sea · daily life 人物 people · book 行旅 travellers. The footer credits what each page shows. One painting per screen; an inscription (the vertical calligraphy) stands in a painting's empty space, never on its figures.
- The home landscape (`scripts/paintings/hero.mjs`) is composed from Ren Yu's scroll 1915.97 with Mi Youren's cloud range and Bian Shoumin's water, in two formats (wide / tall). Its small kung fu figures are painted by `scripts/paintings/figures.mjs` in Ren Yu's figure manner (no source painting shows martial arts).
- Tokens (`src/styles/global.css`): `paper` #DDD8D4 (the sheet's mean tone) · `paper-deep` a translucent deeper shade · `rice` #FAF6EF text on cinnabar and silk · `ink` #1F1C18 · `ink-soft` #5A5348 secondary text · `ink-faint` #8C8376 ornaments only · `vermilion` #B0392A cinnabar: seals, the primary button, hover marks · `silk` #4C4639 / `silk-light` the mounting.
- Our own brush (`npm run ink`, scripts/ink/): only the dry stroke of `BrushRule` and the calligraphy. Do not add new kinds of decoration beyond the painting excerpts.
- Seals (`Seal`, `src/lib/seal.ts`): worn hand-stamped look. 白文 (`bai`) for names – the logo 坤武功夫 and the masters; 朱文 (`zhu`) for all other marks. New seal characters: `npm run seal-glyphs`. Logo/favicons/social image: `npm run icons`.
- Calligraphy (`Calligraphy`): titles in brush calligraphy, written stroke by stroke in the correct stroke order. Each stroke is painted ink (`npm run calligraphy`, scripts/ink/calligraphy.mjs → `src/assets/calligraphy/`, `src/data/calligraphy.json`; structure and order from Make Me a Hanzi via `hanzi-writer-data`). New title characters: add the text in that script and re-run. Used for the hero 坤武功夫, home section titles, inner page heads, master names; the 未曾学艺 inscription in the same hand, unanimated. Only the hero and page heads load their ink eagerly.
- Section labels "(wǔ dé) 武德" (`SectionLabel`). The twelve-branch day ring only on /daily-life.
- Photos get the `.aged` print toning; master portraits sit in a `.mount`. Never shown larger than native size where avoidable; see `images.todo.md`.
- Motion subtle: `.reveal` on a few elements, a painting comes into focus once when it loads; respect `prefers-reduced-motion`.
- Weight: paintings below the first screen load on approach (`Painting` default `load="defer"`); AVIF quality stays low (a soft ink painting looks the same) – keep every page ≥ 95 in Lighthouse mobile.

## Conventions
- Accessible: semantic HTML, alt text in both languages, visible focus, `prefers-reduced-motion` respected.
- `lang` attribute set per page (`en`, `zh-Hans`).
- Language switch keeps the current page (e.g. `/en/master/` ↔ `/zh/master/`).
- Payment Link URLs live in one config file (`src/config/booking.ts`), never hard-coded in pages.
- Keep Lighthouse performance ≥ 95 on mobile.

## Open questions (do not invent answers)
- Final domain (logo shows `yanpengshaolin.com`)
- Programs, durations, prices, accommodation details
- Who receives payments (Stripe account owner)
- Exact address spelling and contact details (WeChat ID, email)
