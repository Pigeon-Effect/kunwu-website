# Kunwu Kung Fu – website

Static, bilingual (English / 简体中文) site for 坤武功夫国际交流中心 in Heze, Shandong.
Astro 7 · Tailwind CSS 4 · TypeScript (strict). Zero external requests – see `CLAUDE.md` for the rules.

## Commands

| | |
|---|---|
| `npm install` | install dependencies |
| `npm run dev` | dev server at http://localhost:4321 |
| `npm run build` | `astro check` + `astro build` + `verify-dist` (fails on any external script/style/font/image or Google/CDN host) |
| `npm run preview` | serve `dist/` |
| `npm run placeholders` | list all missing content (`[PLACEHOLDER: …]`) |
| `npm run icons` | regenerate favicons / touch icons / social image from `src/assets/brand/*.svg` |
| `npm run fonts` | rebuild the Chinese display-font subset from the built pages (run after `npm run build` when Chinese headings, names or labels change, then build again; the build warns when glyphs are missing) |

### Windows with Smart App Control

Windows may block Astro's native compiler (`astro.win32-x64-msvc.node`, "An Application Control policy has blocked this file").
Install the WebAssembly build of the compiler locally – Astro falls back to it automatically:

```
npm install --no-save --force @astrojs/compiler-binding-wasm32-wasi@0.5.3
```

(Match the version to `node_modules/@astrojs/compiler-binding/package.json`. Re-run after every `npm install`. CI on Linux does not need it.)

## Where things live

| What | Where |
|---|---|
| Prices, durations, **Stripe Payment Links** | `src/config/booking.ts` (only place) |
| Address, email, WeChat, phone, map coordinates | `src/config/site.ts` |
| Daily schedule (drives the day ring) | `src/data/schedule.ts` |
| Masters (biographies, credentials, portraits; Shi Yanpeng kept with `visible: false`) | `src/data/masters.ts` |
| Photos (alt texts, replace flags) / gallery order | `src/data/photos.ts` / `src/data/gallery.ts` – inventory in `images.todo.md` |
| Section labels "(wǔ dé) 武德" | `src/config/sections.ts` |
| Programs | `src/content/programs/{en,zh}/*.md` |
| FAQ | `src/content/faq/{en,zh}/*.md` |
| UI text | `src/i18n/{en,zh}.json` (zh is type-checked against en) |
| Video clips | `public/videos/` + `src/data/videos.ts` |
| Logos | `src/assets/brand/` (see README there) |

Anything written as `[PLACEHOLDER: …]` is highlighted on the page automatically. Gallery and video sections stay hidden until real content exists.

## Design system ("clean but epic")

Dark, cinematic, calm: few sections, much space, one idea per screen. Tokens in `src/styles/global.css`:

| | | |
|---|---|---|
| 墨 ink | `#12100E` | background |
| 宣 paper | `#EFE7D6` | text (15.5:1 on ink) |
| 石 stone | `#8A857B` | secondary text (5.2:1 on ink) |
| 朱 vermilion | `#B8321F` | the single accent: seals, hover marks, the primary button. Never small text on ink (3.2:1). |

No other colours; no gradients except dark overlays on photos.

**Type** – Latin display: Cormorant Garamond (@fontsource, latin + latin-ext). Chinese display: Noto Serif SC,
subset to the glyphs in use (`npm run fonts`, ~70 KB). Body: system sans (PingFang / YaHei / Noto Sans CJK).

**Elements**

- `SectionLabel` – "(wǔ dé) 武德": pinyin small caps + hanzi, muted. Home: 武德 · 师资 · 课程 · 联系.
- `Seal` – vermilion chop with one or two hanzi: logo (坤), masters (淞 · 涛), programs, 住 · 食 · 休, 德.
- Oversized faint hanzi behind two sections only: 武 (home, philosophy) and 承 (/master).
- `DayRing` – the twelve double hours (十二时辰), /daily-life only.
- `.film` – overlay, vignette and grain for the soft photos; `Photo` never requests widths above the original.
- Motion: `.reveal` on a few elements (IntersectionObserver), slow hero zoom; all off with `prefers-reduced-motion`.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (enable Pages → Source: GitHub Actions in the repo settings).
Without a custom domain the site is served at `https://<owner>.github.io/<repo>/`.
To redeploy without a new commit: Actions → "Deploy to GitHub Pages" → **Run workflow** (on `main`). Do not re-run old runs – they would put an old build online, so the workflow now refuses to deploy any commit that is not the current `main`.
The base path comes from `SITE_BASE` (default `/kunwu-website/`; `BASE_PATH` is still accepted). For a domain root – e.g. a
China-friendly host later – build with `SITE_BASE=/ SITE_URL=https://<domain> npm run build`; all links go through
`localePath()` / `asset()`, nothing is hard-coded. On GitHub: add `public/CNAME` and set the repository variables
`SITE_URL=https://<domain>` and `SITE_BASE=/`.
