# Kunwu Kung Fu – Website

Website for **坤武功夫国际交流中心 / Kunwu International Kung Fu Training Center**,
led by **释延朋师傅 (Master Shi Yanpeng)**, 34th-generation lay disciple of the Shaolin Temple.
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
- Deployment: GitHub Pages via `withastro/action` (GitHub Actions)
- Custom domain via `public/CNAME`; `site` set in `astro.config.mjs`

## Hard rules (China compatibility)
- NO Google services: no Google Fonts, Maps, Analytics, reCAPTCHA, YouTube embeds.
- NO external CDNs for JS/CSS. Everything self-hosted and bundled.
- Chinese text uses system fonts only: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`.
- Latin display font (if any) self-hosted via @fontsource, max. one family, subset to latin.
- Images via Astro `<Image>` / `<Picture>` (AVIF + WebP, lazy loading, explicit sizes).
- Videos: short compressed MP4 (H.264, <5 MB each), self-hosted, `preload="none"` with poster image. External links to YouTube / Bilibili allowed as plain links only.
- Maps: static image or OpenStreetMap link, no embed.
- Minimal JavaScript. Prefer zero-JS pages; islands only where needed (e.g. mobile menu, language switch).

## Pages (both languages)
1. Home – hero, short intro, call to action "Book your training"
2. Master – biography of 释延朋师傅 (see `content/master.md`)
3. Daily life – daily schedule (timeline), photo gallery, video clips
4. Training & prices – programs (Shaolin Kung Fu, Tai Chi, MMA, Wing Chun), durations, prices, what's included (accommodation, meals)
5. Book – program selection → Stripe Payment Link per program/duration
6. FAQ – visa, arrival, equipment, language, health requirements
7. Contact – address, WeChat QR code, email

## Design direction
- Derived from the logos in `src/assets/brand/`: black/white yin-yang, gold ring, plum-blossom red.
- Calm and restrained. Lots of white space, strong photography. One memorable element, the rest quiet.
- Draft tokens (refine before building):
  - `ink` #000000 · `paper` #FFFFFF · `gold` #B08A3E · `blossom` #E2674A (sparing, accents only) · `rice` #FAF5DC (soft section background)
- Follow the frontend-design guidance: no generic SaaS card kit, no all-caps eyebrow labels, no fade-in on every section.

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
