// Favicons, touch / manifest icons, the social preview image and logo exports – all from the seal
// (src/lib/seal.ts), the paper and the home page's landscape (src/assets/paper/, src/assets/paintings/).
// Run: npm run icons   (outputs are committed; re-run when the seal or the art changes)
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { sealSVG } from '../src/lib/seal.ts';

const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
const PAPER = '#ddd8d4';
const glyphs = JSON.parse(await readFile(new URL('src/data/seal-glyphs.json', root), 'utf8'));
const asset = (path) => fileURLToPath(new URL(`src/assets/${path}`, root));

const logo = sealSVG(glyphs, { text: '坤武功夫', style: 'bai', id: 'logo' });
const mark = sealSVG(glyphs, { text: '坤', style: 'bai', id: 'mark' });

/** render an SVG string to a square PNG of `size` px */
const render = (svg, size) => sharp(Buffer.from(svg), { density: 72 * (size / 106) * 2 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

/** the seal centred on paper */
async function onPaper(svg, size, scale) {
  const inner = await render(svg, Math.round(size * scale));
  return sharp({ create: { width: size, height: size, channels: 4, background: PAPER } }).composite([{ input: inner, gravity: 'center' }]).png().toBuffer();
}

/** Minimal ICO writer: PNG-compressed entries (supported by all current browsers). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await writeFile(new URL('favicon.svg', pub), mark);
await writeFile(new URL('favicon.ico', pub), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(mark, size) })))));
await writeFile(new URL('apple-touch-icon.png', pub), await onPaper(logo, 180, 0.78));
await writeFile(new URL('icon-192.png', pub), await onPaper(logo, 192, 0.86));
await writeFile(new URL('icon-512.png', pub), await onPaper(logo, 512, 0.86));
await writeFile(new URL('icon-maskable-512.png', pub), await onPaper(logo, 512, 0.62));

// Social preview (WeChat, WhatsApp …): the home page's landscape and the seal on the rice paper – no
// text, works in both languages
const W = 1200;
const H = 630;
const paper = await sharp(asset('paper/rice-paper.webp')).extract({ left: 0, top: 0, width: W, height: H }).raw().toBuffer();
// the painting is ink on a transparent ground: multiply it into the paper (pixel = paper × (1 − a(1 − c)))
const PW = 1080;
const art = await sharp(asset('paintings/hero-wide.webp')).resize(PW, H, { fit: 'cover', position: 'right bottom' }).ensureAlpha().raw().toBuffer();
for (let y = 0; y < H; y++)
  for (let x = 0; x < PW; x++) {
    const a = art[(y * PW + x) * 4 + 3] / 255;
    if (!a) continue;
    const o = (y * W + x + (W - PW)) * 3;
    for (let k = 0; k < 3; k++) paper[o + k] = Math.round(paper[o + k] * (1 - a * (1 - art[(y * PW + x) * 4 + k] / 255)));
  }
const og = await sharp(paper, { raw: { width: W, height: H, channels: 3 } })
  .composite([{ input: await render(logo, 200), top: 215, left: 150, blend: 'multiply' }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toBuffer();
await rm(new URL('og-image.png', pub), { force: true });
await writeFile(new URL('og-image.jpg', pub), og);

// Logo exports for print / WeChat profile / messengers
await rm(new URL('brand/', pub), { recursive: true, force: true });
await mkdir(new URL('brand/', pub), { recursive: true });
await writeFile(new URL('brand/kunwu-seal.svg', pub), logo);
await writeFile(new URL('brand/kunwu-seal-1024.png', pub), await render(logo, 1024));

console.log('Icons written to public/');
