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
| `npm run paintings` | rebuild the paper tile and the painting excerpts (`src/assets/paper/`, `src/assets/paintings/`) from the source paintings – `npm run paintings -- hero pine` for some, `-- --proof dir/` writes proofs on the paper |
| `npm run ink` | repaint our own brush stroke (`src/assets/ink/stroke.webp`) |
| `npm run calligraphy` | paint the calligraphy strokes for the titles into `src/assets/calligraphy/` (`-- --sheet file.png` for a proof sheet) |
| `npm run seal-glyphs` | extract outlines for new seal characters into `src/data/seal-glyphs.json` |
| `npm run icons` | regenerate favicons, touch icons, the social image (the landscape on the paper) and logo exports from the seal |
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
| Painting excerpts per page, their sources and credits | `src/data/paintings.ts` (made by `scripts/paintings/`) |
| Programs | `src/content/programs/{en,zh}/*.md` |
| FAQ | `src/content/faq/{en,zh}/*.md` |
| UI text | `src/i18n/{en,zh}.json` (zh is type-checked against en) |
| Video clips | `public/videos/` + `src/data/videos.ts` |
| Logos | `src/assets/brand/` (see README there) |

Anything written as `[PLACEHOLDER: …]` is highlighted on the page automatically. Gallery and video sections stay hidden until real content exists.

## Design system (traditional painting on rice paper)

Every page is a hanging scroll: real rice paper, details of real paintings on it, and a silk mounting – the header is
the scroll's top (天头: wooden rod, damask silk, key-fret border strip, a shadow on the paper; it slides away while
scrolling down and comes back on any scroll up), the footer its bottom with the roller (地杆) and its knobs. The logo is
a paper title slip (题签) glued onto the silk. Tokens in `src/styles/global.css`:

| | | |
|---|---|---|
| 宣 paper | `#DDD8D4` | the sheet's mean tone; the page shows the real paper tile |
| 宣 paper-deep | translucent | a deeper shade of the sheet: mounts, quiet sections |
| 米 rice | `#FAF6EF` | text on cinnabar and on the silk |
| 墨 ink | `#1F1C18` | text (12:1) |
| 淡墨 ink-soft | `#5A5348` | secondary text (5.4:1) |
| 淡墨 ink-faint | `#8C8376` | hairlines and ornaments only |
| 朱 vermilion | `#B0392A` | cinnabar: seals, the primary button, hover marks |
| 绫 silk | `#4C4639` | the mounting silk of header and footer |

**Paper** – `src/assets/paper/rice-paper.webp` (`npm run paintings -- paper`, `scripts/paintings/paper.mjs`) from
`src/assets/photos/background/background_ricepaper.jpg`: the photo's light fall-off is divided out, the few most
recognisable specks are retouched with quiet paper from nearby, and the tile is made seamless by cross-fading the paper
that lies beyond its edge (contrast-preserving, along a ragged line) – nothing is mirrored or duplicated, so neither
seams nor repeats show. A fine SVG grain in `global.css` restores the tooth that compression smooths.

**Paintings** – `Painting` + `src/data/paintings.ts` (with credits; the footer lists the ones each page shows). Made by
`npm run paintings` (`scripts/paintings/`): each excerpt is cut from a source painting in
`src/assets/photos/chinese_traditional_paintings/` (CC0 / public domain), its old paper or silk divided out so only ink
and pigment remain, its edge dissolved into mist, and multiplied into the site's paper. One theme per page:

| page | theme | excerpts |
|---|---|---|
| home | 山水 landscape | the hero (Ren Yu, *Landscapes* 1892, with Mi Youren's cloud range and Bian Shoumin's water; four small figures practising kung fu, painted in Ren Yu's figure manner by `figures.mjs`), Fan Qi's temple on a cliff |
| masters | 花木 plants, trees | pine and narcissus (Wang Xuehao), peony – Heze's flower (Wang Xuehao), chrysanthemums (Zheng Xie) |
| programs | 翎毛 animals | wild goose (Bian Shoumin), mantis – Shandong's mantis boxing, Bada Shanren's bird, dragonfly, two crabs (Coimbra album) |
| contact | 海 the sea | waves and a fishing boat (Suzhou woodblock print *Happy Fisherfolk*) |
| daily life | 人物 people | children kicking a jianzi (Shen Qinglan) |
| book | 行旅 travellers | Ren Yu's travellers on a snowy path |

In a page head the vertical calligraphy is the painting's inscription: beside it (`artMode="beside"`), or over its empty
space (`"behind"`). Paintings below the first screen load on approach.

**Type** – Latin display: Cormorant Garamond (@fontsource). Chinese display: Noto Serif SC, subset to the glyphs in use
(`npm run fonts`, ~50 KB). Body: system sans.

**Our own brush** (`scripts/ink/` – a small brush engine on top of sharp): the dry stroke `stroke` (`BrushRule`, between
sections and under page titles) and the calligraphy.

**Calligraphy** – `Calligraphy`: titles in brush calligraphy, written stroke by stroke in the correct stroke order when
they scroll into view (an SVG mask follows each stroke's centre line; CSS only; finished at once without JS or with
reduced motion). Hero 坤武功夫, the home section titles, inner page heads and the master names; the 未曾学艺先学礼
inscription in the same hand, unanimated. Every stroke is painted ink, not a font: `npm run calligraphy`
(`scripts/ink/calligraphy.mjs`) paints each character stroke by stroke – a slight hand wobble, ink pooling where the
brush presses in, dry-brush streaks (飞白) on fast strokes and tails, bleed into the paper, the brush re-dipped every few
strokes – into one small sprite per character (`src/assets/calligraphy/`, ~6 KB each) plus `src/data/calligraphy.json`.
To write a new character, add the text in that script and re-run (`npm run calligraphy -- --sheet proof.png` writes a
proof sheet). Stroke shapes, centre lines and order come from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi)
via the `hanzi-writer-data` package (dev dependency). The outlines are derived from Arphic PL KaitiM GB, © Arphic
Technology, under the Arphic Public License (copy shipped as `public/licenses/ARPHICPL.TXT`).

**Seals** – `Seal` / `src/lib/seal.ts`: worn hand-stamped seals from glyph outlines (Noto Serif SC Black).
白文 for names (logo 坤武功夫, masters 淞 · 涛), 朱文 for all other marks (programs, 住 · 食 · 休, 德).

**Elements** – section labels "(wǔ dé) 武德"; the day ring with the twelve double hours (十二时辰, /daily-life only);
photos toned like old prints (`.aged`), master portraits mounted (`.mount`); subtle reveal on scroll, a painting comes
into focus once as it loads – all off with `prefers-reduced-motion`.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (enable Pages → Source: GitHub Actions in the repo settings).
Without a custom domain the site is served at `https://<owner>.github.io/<repo>/`.
To redeploy without a new commit: Actions → "Deploy to GitHub Pages" → **Run workflow** (on `main`). Do not re-run old runs – they would put an old build online, so the workflow now refuses to deploy any commit that is not the current `main`.
The base path comes from `SITE_BASE` (default `/kunwu-website/`; `BASE_PATH` is still accepted). For a domain root – e.g. a
China-friendly host later – build with `SITE_BASE=/ SITE_URL=https://<domain> npm run build`; all links go through
`localePath()` / `asset()`, nothing is hard-coded. On GitHub: add `public/CNAME` and set the repository variables
`SITE_URL=https://<domain>` and `SITE_BASE=/`.
