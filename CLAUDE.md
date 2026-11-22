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
- The navigation bar is a panel of carved cinnabar lacquer (剔红): a rounded lip, a field of 天锦 sky brocade (small diamonds, a flower raised in each), a band of 回纹 key fret, lit from the upper left and casting a shadow on the paper – rendered from a height map by `npm run lacquer` (scripts/lacquer/lacquer.mjs → `src/assets/lacquer/tihong.webp`, a 420 CSS px tile at 2×). Links in gold (like 戗金 inscriptions), Book a raised black-lacquer plaque edged in gold, the logo on a paper title slip (题签) pasted on. It slides away while scrolling down and returns at once on any scroll up (Base.astro).
- The footer is the bottom of a hanging scroll (地头: mounting silk, the roller 地杆 with knobs 轴头).
- The page is real rice paper, a warm white: `src/assets/paper/rice-paper.webp` (1400 px) and `rice-paper@2x.webp` (2800 px, swapped in after load on dense screens via `html.paper-hd`), one seamless 1400 CSS px tile made by `npm run paintings` (scripts/paintings/paper.mjs) from `src/assets/photos/background/background_ricepaper.jpg`: extended at the photo's own resolution by image quilting (turned/mirrored pieces joined along minimum-error cuts) – never stretched – then made seamless and whitened; plus a fine SVG grain in `global.css`.
- Decoration = subtle but detailed excerpts of real traditional paintings (`src/assets/photos/chinese_traditional_paintings/`, all CC0 / public domain): cut out, their old paper removed, edges dissolved like mist, multiplied into the paper (`Painting`; data and credits in `src/data/paintings.ts`; made by `npm run paintings`, scripts/paintings/). One theme per page: home 山水 landscape · masters 花木 plants and trees · programs 翎毛 animals · contact 海 the sea · daily life 人物 people · book 行旅 travellers. The footer credits what each page shows. One painting per screen; an inscription (the vertical calligraphy) stands in a painting's empty space or beside it, never on its figures. Paintings are never cut: every motif lies whole inside its excerpt (what the source's own edge cuts dissolves into mist), and no painting bleeds off the page or lies under text.
- The home landscape is the school's own picture `src/assets/photos/header/kungfu_landscape_4x.jpg` (a figure in a bow stance on a stone bridge; open mist on the left for the name). `scripts/paintings/hero.mjs` removes its paper, dissolves its edges and paints out its pseudo-inscription (malformed characters); two formats: wide (whole) and tall (its right part, portrait screens). It is never cropped: it stands at the bottom right, as wide as the screen or as tall as the first screen. Where its inscription stood, the page writes Wang Wei's 行到水穷处 / 坐看云起时 in the site's brush.
- Tokens (`src/styles/global.css`): `paper` #F2EFE8 (the sheet's mean tone) · `paper-deep` a translucent deeper shade · `rice` #FAF6EF text on cinnabar and silk · `ink` #1F1C18 · `ink-soft` #5A5348 secondary text · `ink-faint` #8C8376 ornaments only · `vermilion` #B0392A cinnabar: seals, the primary button, hover marks · `silk` #4C4639 / `silk-light` the footer's mounting · `lacquer` #7B2219 the nav bar · `gold` #ECD3A0 / `gold-bright` letters on the lacquer.
- Our own brush (`npm run ink`, scripts/ink/): only the dry stroke of `BrushRule` and the calligraphy. Do not add new kinds of decoration beyond the painting excerpts and the nav bar's lacquer.
- Seals (`Seal`, `src/lib/seal.ts`): worn hand-stamped look. 白文 (`bai`) for names – the logo 坤武功夫 and the masters; 朱文 (`zhu`) for all other marks. New seal characters: `npm run seal-glyphs`. Logo/favicons/social image: `npm run icons`.
- Calligraphy (`Calligraphy`): titles in brush calligraphy, written stroke by stroke in the correct stroke order. Each stroke is painted ink (`npm run calligraphy`, scripts/ink/calligraphy.mjs → `src/assets/calligraphy/`, `src/data/calligraphy.json`; structure and order from Make Me a Hanzi via `hanzi-writer-data`). New title characters: add the text in that script and re-run. Used for the hero 坤武功夫, home section titles, inner page heads, master names; the 未曾学艺 inscription and the Wang Wei couplet in the same hand, unanimated. Only the hero and page heads load their ink eagerly.
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
