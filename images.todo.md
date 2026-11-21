# Images – inventory and to-do

Every photo the site uses. Alt texts (en + zh) and the `todoReplace` flag live in
`src/data/photos.ts`; the gallery order is in `src/data/gallery.ts`.

All eleven photos added on 2026-11-21 (`67ab8bd`) are WeChat re-compressions: 72 dpi and soft,
and most are only ~1000 px on the long side. They are used anyway, with the `.film` treatment
(dark overlay, vignette, fine grain). The pipeline never generates widths above the original,
and the photos are kept small on screen. **Please send the originals (camera or phone files, not
forwarded through WeChat) for every row marked "replace".**

| File (`src/assets/photos/…`) | Size | Shows | Used in | Status |
|---|---|---|---|---|
| `gallery/shi-yantao-guandao-temple.jpg` | 2411×1280, 809 KB | 释延涛 with guandao before a temple hall | **Home hero** (full-bleed), home card Shi Yantao, /master portrait Shi Yantao, gallery | **replace**: the best of the set but soft at full screen. Also the only photo of Shi Yantao, so the home page shows it twice (hero + card). A second photo of him, ideally a portrait, would fix that. |
| `gallery/shi-yansong-sword-bamboo.jpg` | 1921×1080, 1.0 MB | 释延淞 with two swords, bamboo | Home card Shi Yansong (4:5 crop), /master portrait, gallery | **replace**: soft. A vertical original would crop better. |
| `gallery/shi-yansong-blue-robe.jpg` | 1080×1921, 1.0 MB | 释延淞 in a blue robe under indigo banners | /master (small), gallery | **replace**: softest of the master photos (shown small only) |
| `gallery/shi-yansong-guandao-hall.jpg` | 1888×4096, 2.0 MB | 释延淞 kneeling with guandao, 武 calligraphy | /master (small), gallery | **replace**: soft despite the pixel count (upscaled before sending) |
| `gallery/school-forecourt.jpg` | 981×755, 75 KB | Forecourt and building with arched glass front | Gallery | **replace**: low resolution |
| `gallery/school-flower-beds.jpg` | 1005×526, 106 KB | Red flower beds before white buildings | Gallery | **replace**: low resolution. Trimmed: 6 px white edge removed left and bottom; untouched file in `gallery/originals/` |
| `gallery/school-lake.jpg` | 1019×718, 93 KB | Buildings reflected in the lake | Gallery | **replace**: low resolution. Would make a good hero if an original exists. |
| `gallery/lounge.jpg` | 1002×709, 88 KB | Lounge behind a glass wall | Gallery | **replace**: low resolution |
| `gallery/dining-hall.jpg` | 1080×690, 183 KB | Dining hall with buffet | Gallery | **replace**: low resolution |
| `gallery/guest-room.jpg` | 1080×748, 115 KB | Room with double bed | Gallery | **replace**: low resolution. Is this a student room? If yes, it belongs in "Where you live" on /daily-life. |
| `gallery/banquet-room.jpg` | 1080×728, 183 KB | Private dining room, round table | Gallery | **replace**: low resolution |
| `master/early-years.jpg` | 502×744 | 释延朋, early photograph | Nowhere (entry `shi-yanpeng` is `visible: false`) | keep |
| `master/side-kick.jpg` | 3000×2250 | 释延朋, side kick | Nowhere (hidden entry) | keep |
| `master/side-kick-portrait.jpg` | 1760×2200 | 4:5 crop of the above | Nowhere (was the old home hero) | can be deleted |

## Still missing (rendered as marked placeholders)

- WeChat QR code (home contact section, /contact) → `src/config/site.ts` → `wechatQr`
- Photos for "Where you live", "What you eat", "Rest days" on /daily-life (currently text placeholders only)
- Poster frames for video clips (`src/data/videos.ts`), once there are clips

## Notes

- Who is in which photo was confirmed by the site owner on 2026-11-21: 2011 = Shi Yantao;
  2012, 2013, 2014 = Shi Yansong.
- Alt texts describe only what is visible. They make no claim about where a photo was taken.
