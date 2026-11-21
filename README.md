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
| `npm run ink` | repaint the ink artwork in `src/assets/ink/` (figure, peaks, brush stroke, plum branch) – `npm run ink -- figure` for one |
| `npm run seal-glyphs` | extract outlines for new seal characters into `src/data/seal-glyphs.json` |
| `npm run icons` | regenerate favicons, touch icons, the social image and logo exports from the seal and the ink art |
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

## Design system (antique ink painting)

Bright, antique, calm – like a Chinese ink painting on old rice paper. Tokens in `src/styles/global.css`:

| | | |
|---|---|---|
| 宣 paper | `#F3ECDF` | background, with paper fibres and a soft aged vignette |
| 宣 paper-deep | `#E8DDC8` | mounts, quiet sections |
| 墨 ink | `#1F1C18` | text |
| 淡墨 ink-soft | `#5A5348` | secondary text (6.4:1) |
| 淡墨 ink-faint | `#8C8376` | hairlines and ornaments only |
| 朱 vermilion | `#B0392A` | cinnabar: seals, the primary button, hover marks |

**Type** – Latin display: Cormorant Garamond (@fontsource). Chinese display: Noto Serif SC, subset to the glyphs in use
(`npm run fonts`, ~50 KB). Body: system sans.

**Ink art** (`src/assets/ink/`, painted by `scripts/ink/` – a small brush engine on top of sharp):

- `figure` – an abstract xieyi figure after the side-kick photo (`src/assets/photos/master/originals/shi-yanpeng-side-kick.jpeg`)
- `mountains`, `mountains-strip` – Zhangjiajie sandstone peaks in mist (hero; footer and mobile menu)
- `stroke` – a dry brush stroke (`BrushRule`, between sections and under page titles)
- `plum` – a plum branch (梅, for Meihua Quan) in the philosophy section

**Seals** – `Seal` / `src/lib/seal.ts`: worn hand-stamped seals from glyph outlines (Noto Serif SC Black).
白文 for names (logo 坤武功夫, masters 淞 · 涛), 朱文 for all other marks (programs, 住 · 食 · 休, 德).

**Elements** – section labels "(wǔ dé) 武德"; the day ring with the twelve double hours (十二时辰, /daily-life only);
photos toned like old prints (`.aged`), master portraits mounted (`.mount`); subtle reveal on scroll, the hero ink
settles in once – all off with `prefers-reduced-motion`.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (enable Pages → Source: GitHub Actions in the repo settings).
Without a custom domain the site is served at `https://<owner>.github.io/<repo>/`.
To redeploy without a new commit: Actions → "Deploy to GitHub Pages" → **Run workflow** (on `main`). Do not re-run old runs – they would put an old build online, so the workflow now refuses to deploy any commit that is not the current `main`.
The base path comes from `SITE_BASE` (default `/kunwu-website/`; `BASE_PATH` is still accepted). For a domain root – e.g. a
China-friendly host later – build with `SITE_BASE=/ SITE_URL=https://<domain> npm run build`; all links go through
`localePath()` / `asset()`, nothing is hard-coded. On GitHub: add `public/CNAME` and set the repository variables
`SITE_URL=https://<domain>` and `SITE_BASE=/`.
