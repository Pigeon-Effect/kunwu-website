// Paints the site's own ink artwork into src/assets/ink/ (committed; re-run only to change the art):
// the dry brush stroke used as a divider. (The paintings come from real scrolls: npm run paintings.)
//   npm run ink [-- stroke]
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { paintStroke } from './details.mjs';

const out = new URL('../../src/assets/ink/', import.meta.url);
await mkdir(out, { recursive: true });

const jobs = {
  stroke: paintStroke,
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
