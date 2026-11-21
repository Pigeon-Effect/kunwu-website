/**
 * 印章 – an old, hand-stamped seal as an SVG string. Used by <Seal> on the pages and by
 * scripts/build-icons.mjs for the favicon and social image, so the logo is the same everywhere.
 *
 * bai (白文): characters cut out of a vermilion block – used for the logo and the masters
 * zhu (朱文): vermilion characters inside a vermilion frame – used for small markers
 * Characters come as outlines (src/data/seal-glyphs.json); unknown characters fall back to text.
 * The stamp texture is an SVG filter: wobbling edges, uneven ink, small white flecks, a chipped corner.
 */

export interface SealGlyphs {
  glyphs: Record<string, { d: string; box: [number, number, number, number] }>;
}

export interface SealOptions {
  text: string;
  style?: 'bai' | 'zhu';
  /** CSS colour of the ink */
  color?: string;
  /** colour behind the seal (for the cut-out parts in favicons); default transparent */
  paper?: string;
  /** stable variation between seals */
  seed?: number;
  /** unique id prefix (several seals on one page) */
  id?: string;
}

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h ^ c.codePointAt(0)!, 16777619) >>> 0), 2166136261);

/** cells in reading order: columns right → left, each top → bottom */
function layout(n: number): { w: number; h: number; cells: [number, number, number, number][] } {
  if (n === 1) return { w: 100, h: 100, cells: [[0, 0, 100, 100]] };
  if (n === 2) return { w: 100, h: 184, cells: [[0, 0, 100, 92], [0, 92, 100, 92]] };
  if (n === 3) return { w: 100, h: 100, cells: [[50, 0, 50, 50], [50, 50, 50, 50], [0, 0, 50, 100]] };
  return { w: 100, h: 100, cells: [[50, 0, 50, 50], [50, 50, 50, 50], [0, 0, 50, 50], [0, 50, 50, 50]] };
}

export function sealSVG(data: SealGlyphs, o: SealOptions): string {
  const chars = [...o.text].slice(0, 4);
  const style = o.style ?? 'bai';
  const color = o.color ?? '#b0392a';
  const seed = o.seed ?? hash(o.text) % 997;
  const id = o.id ?? `seal-${seed}`;
  const { w, h, cells } = layout(chars.length);
  const frame = style === 'bai' ? 8 : 6.5; // red margin (bai) / frame line (zhu)
  const inset = style === 'bai' ? frame : frame + 3.5;

  const glyphMarkup = chars
    .map((c, i) => {
      const cell = cells[i]!;
      // cell inside the frame
      const cx = cell[0] === 0 ? inset : cell[0] + 1.5;
      const cy = cell[1] === 0 ? inset : cell[1] + 1.5;
      const cw = cell[2] - (cell[0] === 0 ? inset : 1.5) - (cell[0] + cell[2] >= w ? inset : 1.5);
      const ch = cell[3] - (cell[1] === 0 ? inset : 1.5) - (cell[1] + cell[3] >= h ? inset : 1.5);
      const g = data.glyphs[c];
      if (!g) {
        const size = Math.min(cw, ch) * 0.9;
        return `<text x="${cx + cw / 2}" y="${cy + ch / 2}" font-size="${size}" text-anchor="middle" dominant-baseline="central" font-family="'Kunwu Serif SC','Songti SC',serif" font-weight="900">${c}</text>`;
      }
      const [x1, y1, x2, y2] = g.box;
      const gw = x2 - x1;
      const gh = y2 - y1;
      // seal glyphs fill their cell: fit, then stretch the short side a little
      const fit = Math.min(cw / gw, ch / gh);
      const sx = Math.min(cw / gw, fit * 1.18);
      const sy = Math.min(ch / gh, fit * 1.18);
      const tx = cx + (cw - gw * sx) / 2 - x1 * sx;
      const ty = cy + (ch - gh * sy) / 2 - y1 * sy;
      return `<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})" d="${g.d}"/>`;
    })
    .join('');

  // a chipped corner and a nick in the edge, different for every seal
  const r = (k: number) => ((seed * (k * 7919 + 13)) % 1000) / 1000;
  const corner = Math.floor(r(1) * 4);
  const chip = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ][corner]!;
  const nickX = 15 + r(2) * (w - 30);

  const filter = `<filter id="${id}-f" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="${seed}" result="warp"/>
<feDisplacementMap in="SourceGraphic" in2="warp" scale="3.6" xChannelSelector="R" yChannelSelector="G" result="edge"/>
<feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="${seed + 7}" result="speck"/>
<feColorMatrix in="speck" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -22 0 0 0 15.2" result="flecks"/>
<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seed + 3}" result="tone"/>
<feColorMatrix in="tone" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0 0 0 0.52" result="ink"/>
<feComposite in="flecks" in2="ink" operator="arithmetic" k1="1" result="cover"/>
<feComposite in="edge" in2="cover" operator="in"/>
</filter>`;

  const paper = o.paper ? `<rect width="${w}" height="${h}" fill="${o.paper}"/>` : '';
  let body: string;
  if (style === 'bai') {
    body = `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="-5" y="-5" width="${w + 10}" height="${h + 10}">
<rect x="-5" y="-5" width="${w + 10}" height="${h + 10}" fill="#fff"/>
<g fill="#000">${glyphMarkup}</g>
<circle cx="${chip[0]}" cy="${chip[1]}" r="${5 + r(3) * 4}" fill="#000"/>
<circle cx="${nickX}" cy="${r(4) > 0.5 ? 0 : h}" r="${1.6 + r(5) * 1.6}" fill="#000"/>
</mask>
<g filter="url(#${id}-f)"><rect width="${w}" height="${h}" rx="2" fill="${color}" mask="url(#${id}-m)"/></g>`;
  } else {
    body = `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="-5" y="-5" width="${w + 10}" height="${h + 10}">
<rect x="-5" y="-5" width="${w + 10}" height="${h + 10}" fill="#fff"/>
<circle cx="${chip[0]}" cy="${chip[1]}" r="${6 + r(3) * 4}" fill="#000"/>
</mask>
<g filter="url(#${id}-f)" fill="${color}" mask="url(#${id}-m)">
<rect x="${frame / 2}" y="${frame / 2}" width="${w - frame}" height="${h - frame}" rx="1.5" fill="none" stroke="${color}" stroke-width="${frame}"/>
${glyphMarkup}
</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 ${w + 6} ${h + 6}" width="${w + 6}" height="${h + 6}"><defs>${filter}</defs>${paper}${body}</svg>`;
}
