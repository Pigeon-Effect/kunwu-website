# Photos

- `gallery/` – school and master photos. Register each photo once in `src/data/photos.ts`
  (both alt texts, `todoReplace` flag), then list its id in `src/data/gallery.ts` to show it in the
  gallery on the Daily life page. `gallery/originals/` holds untouched files where a copy was trimmed.
- `master/` – photos of Shi Yanpeng (hidden entry in `src/data/masters.ts`; originals in `master/originals/`).
- Master portraits and extra photos are chosen in `src/data/masters.ts` (`image`, `imagePosition`, `photos`).
- `posters/` – poster frames for video clips (see `src/data/videos.ts`).

Originals can be large (JPEG, 2000–3000 px wide is ideal); Astro generates AVIF/WebP in several sizes at
build time and never wider than the original. Inventory and replacement list: `images.todo.md` in the repo root.
