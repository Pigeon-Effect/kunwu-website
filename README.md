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
| `npm run sketches` | regenerate the pencil sketches (`scripts/sketches/scenes.mjs` → `src/assets/sketches/`); `-- --only id1,id2 --preview sheet.jpg` for a contact sheet |

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
| Master biography | `src/content/master/{en,zh}.md` |
| Programs | `src/content/programs/{en,zh}/*.md` |
| FAQ | `src/content/faq/{en,zh}/*.md` |
| UI text | `src/i18n/{en,zh}.json` (zh is type-checked against en) |
| Pencil sketches (stand in for photos) | `src/data/sketches.ts` (alt texts), drawn by `scripts/sketches/` |
| Gallery photos | drop into `src/assets/photos/gallery/`, alt texts in `src/data/gallery.ts` – they replace the sketchbook automatically |
| Video clips | `public/videos/` + `src/data/videos.ts` |
| Logos | `src/assets/brand/` (see README there) |

Anything written as `[PLACEHOLDER: …]` is highlighted on the page automatically. A photo slot without a photo renders as a striped placeholder.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (enable Pages → Source: GitHub Actions in the repo settings).
Without a custom domain the site is served at `https://<owner>.github.io/<repo>/`.
When the domain is final: add `public/CNAME`, and set the repository variables `SITE_URL=https://<domain>` and `BASE_PATH=/`.
