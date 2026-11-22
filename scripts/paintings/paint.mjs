// Builds the site's paper and painting excerpts (committed; re-run only to change them).
//   npm run paintings                       everything
//   npm run paintings -- hero pine waves    only these (paper, hero, or excerpt names from excerpts.mjs)
//   npm run paintings -- --proof out/       also write JPEG proofs, laid on the paper, into out/
// Sources: src/assets/photos/chinese_traditional_paintings/, src/assets/photos/background/ (the paper) and
//          src/assets/photos/header/ (the home landscape)
// Output:  src/assets/paper/rice-paper(@2x).webp, src/assets/paintings/*.webp (ink on transparent, for
//          mix-blend-mode: multiply on the page)
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { paperFiles } from './paper.mjs';
import { hero } from './hero.mjs';
import { excerpts, renderExcerpt } from './excerpts.mjs';
import { toSharp, withAlpha } from './lib.mjs';

const args = process.argv.slice(2);
const proofAt = args.indexOf('--proof');
const proofDir = proofAt >= 0 ? args.splice(proofAt, 2)[1] : null;
const all = ['paper', 'hero', ...Object.keys(excerpts)];
const wanted = args.length ? args : all;
for (const w of wanted) if (!all.includes(w)) throw new Error(`unknown: ${w} (known: ${all.join(', ')})`);

const paperDir = new URL('../../src/assets/paper/', import.meta.url);
const outDir = new URL('../../src/assets/paintings/', import.meta.url);
await mkdir(paperDir, { recursive: true });
await mkdir(outDir, { recursive: true });
if (proofDir) await mkdir(proofDir, { recursive: true });

const webp = (rgba) => toSharp(rgba).webp({ quality: 90, alphaQuality: 92, effort: 6 }).toBuffer();
const kb = (b) => `${(b.length / 1024).toFixed(0)} KB`;

/** a proof: the ink multiplied onto the real paper tile */
async function proof(name, rgba) {
  if (!proofDir) return;
  const tile = await sharp(new URL('rice-paper.webp', paperDir).pathname.replace(/^\/([A-Za-z]:)/, '$1')).raw().toBuffer({ resolveWithObject: true });
  const { w, h } = rgba;
  const o = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const pi = ((y % tile.info.height) * tile.info.width + (x % tile.info.width)) * 3;
      const i = y * w + x;
      const a = rgba.d[i * 4 + 3];
      for (let k = 0; k < 3; k++) o[i * 3 + k] = Math.round(tile.data[pi + k] * (1 - a * (1 - rgba.d[i * 4 + k])));
    }
  await sharp(o, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 88 }).toFile(`${proofDir}/${name}.jpg`);
}

for (const name of wanted) {
  const t = Date.now();
  if (name === 'paper') {
    const { files, note } = await paperFiles();
    for (const [file, buf] of Object.entries(files)) {
      await writeFile(new URL(file, paperDir), buf);
      console.log(`✓ paper/${file} ${note} ${kb(buf)} (${Date.now() - t} ms)`);
    }
    continue;
  }
  if (name === 'hero') {
    for (const format of ['wide', 'tall']) {
      const { image, mask } = await hero(format);
      const rgba = withAlpha(image, mask);
      const buf = await webp(rgba);
      await writeFile(new URL(`hero-${format}.webp`, outDir), buf);
      await proof(`hero-${format}`, rgba);
      console.log(`✓ paintings/hero-${format}.webp ${rgba.w}×${rgba.h} ${kb(buf)} (${Date.now() - t} ms)`);
    }
    continue;
  }
  const { image, mask } = await renderExcerpt(name);
  const rgba = withAlpha(image, mask);
  const buf = await webp(rgba);
  await writeFile(new URL(`${name}.webp`, outDir), buf);
  await proof(name, rgba);
  console.log(`✓ paintings/${name}.webp ${rgba.w}×${rgba.h} ${kb(buf)} (${Date.now() - t} ms)`);
}
