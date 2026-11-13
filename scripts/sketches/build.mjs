// Renders every pencil sketch in scenes.mjs to src/assets/sketches/<id>.jpg
//   npm run sketches                      – all
//   npm run sketches -- --only a,b        – some
//   npm run sketches -- --preview out.jpg – also write a contact sheet for review
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { Sheet } from './pencil.mjs';
import { scenes } from './scenes.mjs';

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const preview = args.includes('--preview') ? args[args.indexOf('--preview') + 1] : null;
const svgOut = args.includes('--svg') ? args[args.indexOf('--svg') + 1] : null;

const outDir = new URL('../../src/assets/sketches/', import.meta.url);
await mkdir(outDir, { recursive: true });

const WIDTH = 600; // drawing units; rendered at 2x
const rendered = [];
for (const [i, scene] of scenes.entries()) {
  if (only && !only.includes(scene.id)) continue;
  const [rw, rh] = scene.ratio;
  const sheet = new Sheet(WIDTH, Math.round((WIDTH * rh) / rw), 101 + i * 17);
  scene.draw(sheet);
  const svg = sheet.toSVG();
  if (svgOut) await writeFile(`${svgOut}/${scene.id}.svg`, svg);
  const jpg = await sharp(Buffer.from(svg), { density: 144 }).flatten({ background: '#f7f3ea' }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  await writeFile(new URL(`${scene.id}.jpg`, outDir), jpg);
  rendered.push({ id: scene.id, jpg });
  console.log(`✓ ${scene.id}  ${(jpg.length / 1024).toFixed(0)} KB`);
}

if (preview && rendered.length) {
  const cell = 360;
  const cols = Math.min(4, rendered.length);
  const rows = Math.ceil(rendered.length / cols);
  const tiles = await Promise.all(
    rendered.map(async (r, i) => ({
      input: await sharp(r.jpg).resize(cell, cell, { fit: 'contain', background: '#ffffff' }).toBuffer(),
      left: (i % cols) * (cell + 8),
      top: Math.floor(i / cols) * (cell + 8),
    })),
  );
  await sharp({ create: { width: cols * (cell + 8), height: rows * (cell + 8), channels: 3, background: '#ffffff' } })
    .composite(tiles)
    .jpeg({ quality: 85 })
    .toFile(preview);
  console.log(`preview → ${preview}`);
}
