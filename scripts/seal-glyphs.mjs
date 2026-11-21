// Extracts the outlines of every character used on a seal (印章) from Noto Serif SC Black
// into src/data/seal-glyphs.json, so seals render identically everywhere (pages, favicon,
// social image) and do not depend on web-font loading.
// Run after adding a seal with new characters:  npm run seal-glyphs
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import subsetFont from 'subset-font';

const root = fileURLToPath(new URL('../', import.meta.url));
const FONT = join(root, 'node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-900-normal.woff2');

// characters: fixed seals + everything written as a seal in the sources
const chars = new Set('坤武功夫德');
async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else if (/\.(astro|ts|md)$/.test(e.name)) yield p;
  }
}
const PATTERNS = [/<Seal\b[^>]*\btext="([^"]+)"/g, /\bseal:\s*'([^']+)'/g, /^seal:\s*(\S+)\s*$/gm, /\bseal:\s*"([^"]+)"/g];
for await (const f of files(join(root, 'src'))) {
  const text = await readFile(f, 'utf8');
  for (const re of PATTERNS) for (const m of text.matchAll(re)) for (const c of m[1]) if (/\p{Script=Han}/u.test(c)) chars.add(c);
}
// daily life seals are built from an array in the page
for (const c of '住食休') chars.add(c);

const text = [...chars].sort().join('');
const sfnt = await subsetFont(await readFile(FONT), text, { targetFormat: 'sfnt' });
const font = opentype.parse(sfnt.buffer.slice(sfnt.byteOffset, sfnt.byteOffset + sfnt.byteLength));

const glyphs = {};
for (const c of text) {
  const path = font.charToGlyph(c).getPath(0, 880, 1000);
  const bb = path.getBoundingBox();
  glyphs[c] = { d: path.toPathData(1), box: [bb.x1, bb.y1, bb.x2, bb.y2].map((v) => Math.round(v)) };
}
await writeFile(join(root, 'src/data/seal-glyphs.json'), `${JSON.stringify({ source: 'Noto Serif SC Black (OFL)', glyphs })}\n`);
console.log(`✓ seal-glyphs: ${text.length} characters → src/data/seal-glyphs.json (${text})`);
