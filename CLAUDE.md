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
1. Home – hero, short intro, call to action "Book your training"
2. Masters – 释延淞 and 释延涛 (data in `src/data/masters.ts`; 释延朋 kept there with `visible: false`)
3. Daily life – daily schedule (timeline), photo gallery, video clips
4. Training & prices – programs (Shaolin Kung Fu, Tai Chi, MMA, Wing Chun), durations, prices, what's included (accommodation, meals)
5. Book – program selection → Stripe Payment Link per program/duration
6. FAQ – visa, arrival, equipment, language, health requirements
7. Contact – address, WeChat QR code, email

## Design direction ("clean but epic", redesign Nov 2026)
- Dark, cinematic, heritage feel; Chinese motifs. Calm: few sections, much space, one idea per screen.
- Tokens (`src/styles/global.css`): `ink` #12100E background · `paper` #EFE7D6 text · `stone` #8A857B secondary text · `vermilion` #B8321F the single accent (seals, hover marks, the one primary CTA). No other colours; no gradients except dark overlays on photos.
- Section labels: "(wǔ dé) 武德" – pinyin small caps + hanzi, muted (`SectionLabel`). `Seal` = vermilion chop with one or two hanzi.
- Oversized faint hanzi behind at most two sections. The twelve-branch day ring only on /daily-life.
- Low-resolution photos get the `.film` treatment (overlay, vignette, grain) and are never shown larger than native size where avoidable; see `images.todo.md`.
- Motion subtle: `.reveal` (fade/translate on scroll) on a few elements, slow hero zoom; respect `prefers-reduced-motion`.

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
