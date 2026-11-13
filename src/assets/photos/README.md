# Photos

- `gallery/` – every image here appears automatically in the gallery on the Daily life page
  (sorted by file name). Add bilingual alt texts in `src/data/gallery.ts`.
- Other photos (hero, master portrait, rooms, food …): put them here, import them in the page
  and pass them to `<Photo src={...} alt={...} />`. Without `src`, `<Photo>` renders a marked placeholder.
- `master/` – photos of Master Shi Yanpeng (originals in `master/originals/`, crops and alt texts in `src/data/photos.ts`).
- `posters/` – poster frames for video clips (see `src/data/videos.ts`).

Originals can be large (JPEG, 2000–3000 px wide is ideal); Astro generates AVIF/WebP in several sizes at build time.
