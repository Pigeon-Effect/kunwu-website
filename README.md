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
| Gallery photos | drop into `src/assets/photos/gallery/`, alt texts in `src/data/gallery.ts` – the gallery section appears as soon as there is one photo |
| Video clips | `public/videos/` + `src/data/videos.ts` |
| Logos | `src/assets/brand/` (see README there) |

Anything written as `[PLACEHOLDER: …]` is highlighted on the page automatically. Gallery and video sections stay hidden until real content exists.

## Design system

**Colour code** (tokens in `src/styles/global.css`) – each colour has one job:

| | | |
|---|---|---|
| 墨 ink | `#171411` | text |
| 宣 paper | `#FBF8F1` | page background |
| 朱 vermilion | `#C23B22` | the only action / accent colour: buttons, seals, "now" |
| 金 gold | `#B08A3E` | lines and ornaments only |
| 米 rice | `#F3ECD9` | tinted sections |

The plum-blossom red appears only inside the logo.

**Recurring elements**

- 题款 + 印章 – every page head carries a short vertical inscription signed with a seal (`PageHead`, `Inscription`, `Seal`).
- 回纹 – the Chinese key fret (`.fret`) is the one divider: under the header, above the footer, in page heads.
- 印 – seals mark programs (少林 · 太极 · 格斗 · 咏春), daily life (住 · 食 · 休); booking steps use 壹 贰 叁.
- 月洞门 – modern photos sit in a moon-gate arch with a gold contour (`<Photo frame="moon">`); archival photos as paper prints (`frame="print"`).
- 十二时辰 – the day ring is labelled with the twelve double hours; the current one lights up in vermilion.

Chinese inscriptions and seals use the system Kai (regular script) fonts with the CJK sans stack as fallback – no web fonts.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (enable Pages → Source: GitHub Actions in the repo settings).
Without a custom domain the site is served at `https://<owner>.github.io/<repo>/`.
To redeploy without a new commit: Actions → "Deploy to GitHub Pages" → **Run workflow** (on `main`). Do not re-run old runs – they would put an old build online, so the workflow now refuses to deploy any commit that is not the current `main`.
When the domain is final: add `public/CNAME`, and set the repository variables `SITE_URL=https://<domain>` and `BASE_PATH=/`.
