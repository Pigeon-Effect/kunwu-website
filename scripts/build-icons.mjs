// Generates favicons, touch icons, manifest icons and the social preview image
// from the simplified vector marks in src/assets/brand/.
// Run: npm run icons   (outputs are committed; re-run only when the marks change)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const brand = new URL('src/assets/brand/', root);
const pub = new URL('public/', root);
const RICE = '#FAF5DC';

await mkdir(pub, { recursive: true });
const taiji = await readFile(new URL('kunwu-taiji.svg', brand));
const emblem = await readFile(new URL('kunwu-emblem.svg', brand));

const png = (svg, size) => sharp(svg, { density: 72 * (size / 64) * 4 }).resize(size, size).png().toBuffer();

/** Square icon with the emblem centered on a solid background. */
async function padded(svg, size, scale, background) {
  const inner = Math.round(size * scale);
  const mark = await sharp(svg, { density: 600 }).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
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
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await writeFile(new URL('favicon.svg', pub), taiji);
await writeFile(
  new URL('favicon.ico', pub),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(taiji, size) })))),
);
await writeFile(new URL('apple-touch-icon.png', pub), await padded(emblem, 180, 0.86, RICE));
await writeFile(new URL('icon-192.png', pub), await padded(emblem, 192, 0.92, { r: 0, g: 0, b: 0, alpha: 0 }));
await writeFile(new URL('icon-512.png', pub), await padded(emblem, 512, 0.92, { r: 0, g: 0, b: 0, alpha: 0 }));
await writeFile(new URL('icon-maskable-512.png', pub), await padded(emblem, 512, 0.7, RICE));

// Social preview (WeChat, WhatsApp, etc.): emblem on rice paper, no text so it works in both languages.
const og = await sharp({ create: { width: 1200, height: 630, channels: 4, background: RICE } })
  .composite([{ input: await sharp(emblem, { density: 600 }).resize(470, 470).png().toBuffer(), gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(new URL('og-image.png', pub), og);

// Emblem exports for print / WeChat profile / messenger use
await mkdir(new URL('brand/', pub), { recursive: true });
await writeFile(new URL('brand/kunwu-emblem.svg', pub), emblem);
await writeFile(new URL('brand/kunwu-emblem-1024.png', pub), await padded(emblem, 1024, 1, { r: 0, g: 0, b: 0, alpha: 0 }));

console.log('Icons written to public/');
