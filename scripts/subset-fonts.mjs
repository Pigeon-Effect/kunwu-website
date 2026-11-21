// Builds the self-hosted Chinese display font: Noto Serif SC (SemiBold), cut down to the
// characters the site actually sets in display type (see scripts/lib/display-glyphs.mjs).
//
// Run after changing Chinese headings, names, seals or labels:
//   npm run build && npm run fonts && npm run build
// Output is committed: src/assets/fonts/kunwu-serif-sc.woff2 (+ .txt with the character list).
// `npm run build` warns when the built pages use a display glyph that is not in the subset.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import { glyphsInDist } from './lib/display-glyphs.mjs';

const root = new URL('../', import.meta.url);
const dist = fileURLToPath(new URL('dist/', root));
const source = new URL(
  'node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-600-normal.woff2',
  root,
);
const outDir = new URL('src/assets/fonts/', root);

if (!existsSync(dist)) {
  console.error('✗ subset-fonts: no dist/ – run `npm run build` first.');
  process.exit(1);
}

const glyphs = [...(await glyphsInDist(dist))].sort();
const text = glyphs.join('');
const font = await subsetFont(await readFile(source), text, { targetFormat: 'woff2' });

await mkdir(outDir, { recursive: true });
await writeFile(new URL('kunwu-serif-sc.woff2', outDir), font);
await writeFile(new URL('kunwu-serif-sc.txt', outDir), `${text}\n`);
console.log(`✓ subset-fonts: ${glyphs.length} glyphs → kunwu-serif-sc.woff2 (${(font.length / 1024).toFixed(1)} KB)`);
