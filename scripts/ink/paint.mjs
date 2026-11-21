// Paints the site's ink-wash artwork into src/assets/ink/ (committed; re-run only to change the art).
//   npm run ink [-- figure mountains mountains-strip stroke plum]
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { paintFigure } from './figure.mjs';
import { heroMountains, stripMountains } from './mountains.mjs';
import { paintPlum, paintStroke } from './details.mjs';

const out = new URL('../../src/assets/ink/', import.meta.url);
await mkdir(out, { recursive: true });

const jobs = {
  figure: async () => paintFigure(),
  mountains: heroMountains,
  'mountains-strip': stripMountains,
  stroke: paintStroke,
  plum: paintPlum,
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(jobs);
for (const name of wanted) {
  const t = Date.now();
  const png = await jobs[name]();
  const webp = await sharp(png).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toBuffer();
  await writeFile(new URL(`${name}.webp`, out), webp);
  const { width, height } = await sharp(png).metadata();
  console.log(`✓ ${name}.webp ${width}×${height} ${(webp.length / 1024).toFixed(0)} KB (${Date.now() - t} ms)`);
}
