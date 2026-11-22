// Brush calligraphy for the titles: every character painted stroke by stroke, in stroke order.
//   npm run calligraphy            → src/assets/calligraphy/<codepoint>.webp + src/data/calligraphy.json
//   npm run calligraphy -- --sheet <file.png>   also writes a proof sheet of all characters
//
// Structure and stroke order come from Make Me a Hanzi (hanzi-writer-data: stroke outlines, centre
// lines and order; outlines derived from Arphic PL KaitiM GB, Arphic Public License). The outline
// only gives the shape of each stroke – the ink is painted: the hand wobbles a little, the brush
// presses in and lifts off, ink pools where it rests, bristles run dry on fast strokes (飞白), fibres
// split at the tails, wet ink bleeds into the paper, and the brush is re-dipped every few strokes.
//
// Each stroke becomes its own small image (packed into one sprite per character), so the page can
// reveal them one after another along the stroke's centre line (src/components/Calligraphy.astro).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { blur, clamp01, fbm, rng, smoothstep, spline, valueNoise } from './lib.mjs';

const root = new URL('../../', import.meta.url);
const DATA = new URL('node_modules/hanzi-writer-data/', root);

/** Every text that is written in calligraphy on the site (titles, names, the inscription). */
const { sections } = await import('../../src/config/sections.ts');
const TEXTS = ['坤武功夫', '释延淞', '释延涛', '未曾学艺先学礼', '未曾习武先习德', ...Object.values(sections).map((s) => s.hanzi)];

const P = 0.5; // paint scale: px per font unit (a character is painted at 512 px)
const OUT = 256; // output size of one character in px
const O = OUT / 1024; // output px per font unit
const PAD = 24; // paint padding (px) around the em square

/** font units (y up, baseline 900) → paint px */
const toPaint = ([x, y]) => [x * P + PAD, (900 - y) * P + PAD];
/** paint px → output px (the page's viewBox is 0 0 320 320 for the em square) */
const toOut = ([x, y]) => [((x - PAD) / P) * O, ((y - PAD) / P) * O];

async function rasterOutline(d, size, transform) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path fill="#fff" transform="${transform}" d="${d}"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) out[i] = buf[i] / 255;
  return out;
}

/** paint one character; returns its strokes as RGBA crops (output scale) + reveal paths */
async function paintChar(ch, ink) {
  const raw = JSON.parse(await readFile(new URL(`${ch}.json`, DATA), 'utf8'));
  const S = Math.round(1024 * P + PAD * 2); // paint canvas
  const seed = ch.codePointAt(0);
  const r = rng(seed);
  const wobble = fbm(seed + 1, 2);
  const fibre = fbm(seed + 2, 3);
  const grain = fbm(seed + 3, 3);
  const streakA = valueNoise(seed + 4);
  const streakB = valueNoise(seed + 5);
  const strokes = [];

  // the brush is re-dipped before each character, and again when it runs dry
  if (ink.load < 0.75) ink.load = 1;

  for (let si = 0; si < raw.strokes.length; si++) {
    // a human hand: each stroke sits a little off, turned a little
    const med0 = raw.medians[si];
    const cx = med0.reduce((a, p) => a + p[0], 0) / med0.length;
    const cy = med0.reduce((a, p) => a + p[1], 0) / med0.length;
    const rot = (r() - 0.5) * 0.035;
    const dx = (r() - 0.5) * 10;
    const dy = (r() - 0.5) * 10;
    const sc = 1 + (r() - 0.5) * 0.04;
    const hand = ([x, y]) => {
      const u = (x - cx) * sc, v = (y - cy) * sc;
      return [cx + u * Math.cos(rot) - v * Math.sin(rot) + dx, cy + u * Math.sin(rot) + v * Math.cos(rot) + dy];
    };
    const median = med0.map(hand).map(toPaint);
    // the same transform for the outline, as an SVG transform (font units → paint px)
    const [a, b, c, d, e, f] = (() => {
      // hand: p' = R·S·(p - c) + c + t ; toPaint: (x*P + PAD, (900 - y)*P + PAD)
      const cs = Math.cos(rot) * sc, sn = Math.sin(rot) * sc;
      const tx = cx - cs * cx + sn * cy + dx;
      const ty = cy - sn * cx - cs * cy + dy;
      // x' = cs x - sn y + tx ; y' = sn x + cs y + ty  → paint
      return [cs * P, -sn * P, -sn * P, -cs * P, tx * P + PAD, (900 - ty) * P + PAD];
    })();
    const mask0 = await rasterOutline(raw.strokes[si], S, `matrix(${a} ${b} ${c} ${d} ${e} ${f})`);

    // bounding box of the stroke
    let x0 = S, y0 = S, x1 = 0, y1 = 0;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++)
        if (mask0[y * S + x] > 0.02) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    const m = 14;
    x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(S - 1, x1 + m); y1 = Math.min(S - 1, y1 + m);
    const W = x1 - x0 + 1, H = y1 - y0 + 1;

    // shape: hand wobble, corners softened by the brush, a fibrous edge
    const local = new Float32Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const gx = x + x0, gy = y + y0;
        const ox = (wobble(gx / 60, gy / 60 + 9) - 0.5) * 5;
        const oy = (wobble(gx / 60 + 4, gy / 60) - 0.5) * 5;
        const sx = Math.min(S - 1, Math.max(0, Math.round(gx + ox))), sy = Math.min(S - 1, Math.max(0, Math.round(gy + oy)));
        local[y * W + x] = mask0[sy * S + sx];
      }
    const soft = await blur(local, W, H, 2.2);
    const shape = new Float32Array(W * H);
    for (let i = 0; i < shape.length; i++) {
      const x = (i % W) + x0, y = Math.floor(i / W) + y0;
      const n = fibre(x / 3.2, y / 3.2) - 0.5;
      shape[i] = smoothstep(0.42 + n * 0.3, 0.6 + n * 0.3, soft[i]);
    }

    // along / across coordinates from the centre line
    const { pts, len, total } = spline(median, 14);
    const N = pts.length;
    const tan = pts.map((p, i) => {
      const q = pts[Math.min(N - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      const l = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1;
      return [(q[0] - o[0]) / l, (q[1] - o[1]) / l];
    });
    const inside = (x, y) => {
      const ix = Math.round(x), iy = Math.round(y);
      return ix >= 0 && iy >= 0 && ix < S && iy < S && mask0[iy * S + ix] > 0.5;
    };
    const half = (i, sign) => {
      const [px, py] = pts[i];
      const [tx, ty] = tan[i];
      let k = 0;
      while (k < 80 && inside(px + sign * ty * k, py - sign * tx * k)) k += 0.5;
      return Math.max(1.5, k);
    };
    const smoothArr = (arr, w) => arr.map((_, i) => {
      let s = 0, n = 0;
      for (let k = -w; k <= w; k++) if (arr[i + k] !== undefined) { s += arr[i + k]; n++; }
      return s / n;
    });
    const hr = smoothArr(pts.map((_, i) => half(i, 1)), 3);
    const hl = smoothArr(pts.map((_, i) => half(i, -1)), 3);
    const hmax = Math.max(...hr.map((v, i) => v + hl[i])) / 2;

    // ink: fast long strokes run dry, a full brush is wet and bleeds
    const lengthUnits = total / P;
    const wet = clamp01((ink.load - 0.45) / 0.55);
    const dryBase = clamp01((1 - ink.load) * 0.9 + smoothstep(300, 800, lengthUnits) * 0.22 + (r() - 0.5) * 0.15);
    ink.load -= 0.05 + lengthUnits / 4200;
    if (ink.load < 0.42) ink.load = 1; // dip again

    const dens = new Float32Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (shape[i] <= 0.001) continue;
        const gx = x + x0, gy = y + y0;
        // nearest point on the centre line
        let best = Infinity, bi = 0, bu = 0, bt = 0;
        for (let k = 0; k < N - 1; k++) {
          const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
          const ex = bx - ax, ey = by - ay;
          const l2 = ex * ex + ey * ey || 1;
          let u = ((gx - ax) * ex + (gy - ay) * ey) / l2;
          u = u < 0 ? 0 : u > 1 ? 1 : u;
          const qx = ax + u * ex - gx, qy = ay + u * ey - gy;
          const d2 = qx * qx + qy * qy;
          if (d2 < best) {
            best = d2; bi = k; bu = u;
            bt = ((gx - ax) * ey - (gy - ay) * ex) / Math.sqrt(l2);
          }
        }
        const s = (len[bi] + bu * (len[bi + 1] - len[bi])) / total;
        const h = bt >= 0 ? hr[bi] : hl[bi];
        const across = Math.max(-1.2, Math.min(1.2, bt / h));
        const sPx = s * total;
        const thin = 1 - smoothstep(0.25, 0.6, (hr[bi] + hl[bi]) / 2 / hmax);

        // dryness grows along the stroke, at the edges first, and in thin tails
        let dry = dryBase * smoothstep(0.2, 1, s) * (0.85 + 0.3 * Math.abs(across));
        dry += thin * smoothstep(0.7, 1, s) * 0.55;
        dry = clamp01(dry);
        // bristle streaks run along the stroke
        const streak = streakA(across * 3.5 + 40, sPx / 150) * 0.7 + streakB(across * 11 + 80, sPx / 60) * 0.3;
        const gap = smoothstep(dry * 0.58 - 0.05, dry * 0.58 + 0.05, streak);

        let v = 0.9 + 0.08 * wet;
        v += 0.08 * (1 - smoothstep(0, 0.14, s)); // ink pools where the brush presses in
        v += 0.05 * smoothstep(0.88, 1, s) * (1 - thin); // and where it rests before lifting
        v += 0.05 * wet * smoothstep(0.6, 1, Math.abs(across)); // wet edges dry a little darker
        v *= 1 - 0.3 * dry; // a dry brush leaves greyer ink
        v *= 0.9 + 0.1 * grain(gx / 2.5, gy / 2.5); // paper grain
        dens[i] = clamp01(v * gap * shape[i]);
      }

    // wet ink bleeds into the paper: a soft halo around the stroke
    const halo = await blur(shape, W, H, 3.5 + wet * 2.5);
    for (let i = 0; i < dens.length; i++) {
      const x = (i % W) + x0, y = Math.floor(i / W) + y0;
      const hv = halo[i] * (0.1 + 0.16 * wet) * (0.55 + 0.45 * fibre(x / 5, y / 5));
      dens[i] = 1 - (1 - dens[i]) * (1 - hv);
    }

    // to output scale
    const rgba = Buffer.alloc(W * H * 4);
    for (let i = 0; i < dens.length; i++) {
      rgba[i * 4] = 26; rgba[i * 4 + 1] = 23; rgba[i * 4 + 2] = 20;
      rgba[i * 4 + 3] = Math.round(clamp01(dens[i]) * 255);
    }
    const ow = Math.max(1, Math.round(W * (O / P))), oh = Math.max(1, Math.round(H * (O / P)));
    const img = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).resize(ow, oh, { kernel: 'lanczos3' }).raw().toBuffer();
    const [ox, oy] = toOut([x0, y0]);

    // reveal path for the page: the centre line in output px, started a little before the stroke
    const outPts = med0.map(hand).map(toPaint).map(toOut);
    const [p0, p1] = outPts;
    const l01 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    const ext = 6;
    outPts[0] = [p0[0] - ((p1[0] - p0[0]) / l01) * ext, p0[1] - ((p1[1] - p0[1]) / l01) * ext];
    let revealLen = 0;
    for (let k = 1; k < outPts.length; k++) revealLen += Math.hypot(outPts[k][0] - outPts[k - 1][0], outPts[k][1] - outPts[k - 1][1]);

    strokes.push({
      img, w: ow, h: oh,
      x: +ox.toFixed(1), y: +oy.toFixed(1),
      path: outPts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''),
      len: Math.round(revealLen),
      brush: Math.round(hmax * 2 * (O / P) + 14), // reveal width: the stroke's widest point + a margin
      units: Math.round(lengthUnits),
    });
  }
  return strokes;
}

/** pack stroke crops into one sprite (shelf packing) */
async function pack(strokes) {
  const width = 290;
  let x = 0, y = 0, row = 0;
  for (const s of strokes) {
    if (x + s.w > width) { x = 0; y += row + 1; row = 0; }
    s.sx = x; s.sy = y;
    x += s.w + 1;
    row = Math.max(row, s.h);
  }
  const height = y + row;
  const sprite = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(strokes.map((s) => ({ input: s.img, raw: { width: s.w, height: s.h, channels: 4 }, left: s.sx, top: s.sy })))
    .webp({ quality: 60, alphaQuality: 60, effort: 6, smartSubsample: true })
    .toBuffer();
  return { sprite, width, height };
}

const chars = [...new Set(TEXTS.join(''))];
const outDir = new URL('src/assets/calligraphy/', root);
await mkdir(outDir, { recursive: true });
const data = {};
const ink = { load: 1 };
const sheet = [];
let bytes = 0;
for (const ch of chars) {
  const t = Date.now();
  const strokes = await paintChar(ch, ink);
  const { sprite, width, height } = await pack(strokes);
  const file = `u${ch.codePointAt(0).toString(16)}.webp`;
  await writeFile(new URL(file, outDir), sprite);
  bytes += sprite.length;
  data[ch] = {
    file,
    w: width,
    h: height,
    strokes: strokes.map(({ x, y, w, h, sx, sy, path, len, brush, units }) => ({ x, y, w, h, sx, sy, path, len, brush, units })),
  };
  sheet.push({ ch, strokes });
  console.log(`✓ ${ch} ${strokes.length} strokes, ${(sprite.length / 1024).toFixed(1)} KB (${Date.now() - t} ms)`);
}
await writeFile(new URL('src/data/calligraphy.json', root), JSON.stringify(data));
console.log(`${chars.length} characters, ${(bytes / 1024).toFixed(0)} KB in src/assets/calligraphy/`);

// optional proof sheet on paper
const sheetAt = process.argv.indexOf('--sheet');
if (sheetAt > -1) {
  const cols = 8;
  const cell = OUT + 20;
  const rows = Math.ceil(sheet.length / cols);
  const layers = [];
  sheet.forEach(({ strokes }, i) => {
    const bx = (i % cols) * cell + 10, by = Math.floor(i / cols) * cell + 10;
    for (const s of strokes) layers.push({ input: s.img, raw: { width: s.w, height: s.h, channels: 4 }, left: Math.max(0, Math.round(bx + s.x)), top: Math.max(0, Math.round(by + s.y)) });
  });
  await sharp({ create: { width: cols * cell, height: rows * cell, channels: 4, background: '#f3ecdf' } }).composite(layers).png().toFile(process.argv[sheetAt + 1]);
  console.log('sheet →', process.argv[sheetAt + 1]);
}
