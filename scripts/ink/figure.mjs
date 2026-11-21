// 写意人物 – an abstract ink figure after the side-kick photo
// (src/assets/photos/master/originals/shi-yanpeng-side-kick.jpeg, keypoints in its 2000 px version).
// 1. the dark clothing gives the silhouette (it separates cleanly from the red and grey wall)
// 2. brush strokes complete what the colour mask misses (sleeve, neck, feet)
// 3. blur + threshold simplify it to a gesture, then it is painted: tone from the photo,
//    pooled edges, paper grain, dry brush (飞白) at the kicking foot and the robe hem,
//    pale washes for head and hands, a faint bleed into the paper
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { blur, clamp01, dab, fbm, smoothstep, stroke, taper, toRGBA, valueNoise } from './lib.mjs';

const SRC = fileURLToPath(new URL('../../src/assets/photos/master/originals/shi-yanpeng-side-kick.jpeg', import.meta.url));
const X0 = 690;
const Y0 = 330;
const W = 1180;
const H = 1170;
const P = (pts) => pts.map(([x, y]) => [x - X0, y - Y0]);

export async function paintFigure() {
  const { data, info } = await sharp(SRC)
    .resize(2000)
    .extract({ left: X0, top: Y0, width: W, height: H })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const N = W * H;

  // 1 · silhouette + tone from the photo
  const mask = new Float32Array(N);
  const tone = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = data[i * ch];
    const g = data[i * ch + 1];
    const b = data[i * ch + 2];
    const mx = Math.max(r, g, b);
    if (mx < 85 || (b - r > 22 && mx < 165)) mask[i] = 1;
    tone[i] = clamp01((205 - mx) / 165);
  }
  for (let y = 1345 - Y0; y < H; y++) for (let x = 0; x < W; x++) if (x + X0 < 1270 || x + X0 > 1360) mask[y * W + x] = 0; // pavement joints

  // the head is painted as a pale wash – drop the dark hair from the mask
  for (let y = 600 - Y0; y < 800 - Y0; y++)
    for (let x = 1595 - X0; x < 1760 - X0; x++) if (((x + X0 - 1672) / 80) ** 2 + ((y + Y0 - 700) / 92) ** 2 < 1) mask[y * W + x] = 0;

  // the robe flap pokes out above the kicking leg as a thin line – drop it
  for (let x = 950; x < 1240; x++) {
    const top = 470 + (x - 850) * 0.675 - 10; // upper edge of the kicking leg
    for (let y = 600; y < top; y++) mask[(y - Y0) * W + (x - X0)] = 0;
  }
  for (let x = 1240; x < 1300; x++) for (let y = 650; y < 690; y++) mask[(y - Y0) * W + (x - X0)] = 0;

  // opening (erode, then dilate) removes wall texture and stray threads
  {
    let m = await blur(mask, W, H, 4);
    for (let i = 0; i < N; i++) m[i] = m[i] > 0.72 ? 1 : 0;
    m = await blur(m, W, H, 4);
    for (let i = 0; i < N; i++) mask[i] = m[i] > 0.28 ? 1 : 0;
  }

  // 2 · complete the shape with strokes (max blend = pure shape)
  const before = mask.slice();
  const add = (pts, w0, w1) => stroke(mask, W, H, P(pts), { width: taper(w0, w1, { lift: 0.1, press: 0.02 }), ink: 1, dry: 0, edge: 0, mode: 'max', seed: 1 });
  add([[1490, 700], [1385, 640], [1280, 578], [1240, 556]], 90, 74); // guard sleeve
  add([[1585, 800], [1640, 755]], 58, 50); // neck / collar
  add([[1400, 712], [1480, 705], [1560, 745]], 92, 80); // shoulder joining the guard arm
  add([[1430, 770], [1490, 775], [1550, 740]], 84, 70); // hand and cuff at the chest
  add([[1415, 800], [1470, 812]], 52, 44);
  add([[1300, 1360], [1312, 1405], [1318, 1438]], 66, 58); // ankle of the planted leg
  add([[875, 503], [845, 480]], 64, 56); // ankle of the kicking leg

  // added parts get a body tone (the photo is pale there: skin, cuffs, wall)
  for (let i = 0; i < N; i++) if (mask[i] > 0.5 && before[i] < 0.5) tone[i] = Math.max(tone[i], 0.72);

  // 3 · simplify to the gesture
  let shape = await blur(mask, W, H, 6.5);
  for (let i = 0; i < N; i++) shape[i] = smoothstep(0.46, 0.6, shape[i]);
  shape = await blur(shape, W, H, 0.9);
  const inner = await blur(shape, W, H, 5);
  const halo = await blur(shape, W, H, 12);
  const softTone = await blur(tone, W, H, 7);

  // pale parts: head, hands, feet – separate washes
  const pale = new Float32Array(N);
  dab(pale, W, H, 1662 - X0, 708 - Y0, 72, 86, { ink: 0.44, rim: 0.7, rot: -0.2, seed: 13, mode: 'max' });
  dab(pale, W, H, 1196 - X0, 530 - Y0, 36, 31, { ink: 0.34, rim: 0.8, rot: -0.3, seed: 9, mode: 'max' });
  stroke(pale, W, H, P([[842, 478], [795, 440], [748, 404]]), { width: taper(44, 26, { lift: 0.3 }), ink: 0.3, dry: 0.2, edge: 0.4, seed: 7, mode: 'max' });
  stroke(pale, W, H, P([[1290, 1454], [1364, 1467], [1446, 1479]]), { width: taper(36, 24, { lift: 0.3 }), ink: 0.34, dry: 0.2, edge: 0.4, seed: 14, mode: 'max' });

  // 4 · paint
  const grain = fbm(11, 5);
  const bloom = fbm(71, 3);
  const fibre = fbm(29, 3);
  const streakA = valueNoise(47);
  const streakB = valueNoise(53);
  const jitter = valueNoise(61);
  // kicking leg axis (hip → foot) and robe hem axis (waist → hem), in crop coordinates
  const axes = [
    { from: [1290 - X0, 840 - Y0], to: [790 - X0, 440 - Y0], start: 0.5, width: 130, n: streakA },
    { from: [1390 - X0, 880 - Y0], to: [1630 - X0, 1200 - Y0], start: 0.55, width: 190, n: streakB },
  ].map((a) => {
    const dx = a.to[0] - a.from[0];
    const dy = a.to[1] - a.from[1];
    const len = Math.hypot(dx, dy);
    return { ...a, ux: dx / len, uy: dy / len, len };
  });

  const ink = new Float32Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let d = shape[i] * (0.42 + 0.5 * smoothstep(0.25, 0.85, softTone[i]));
      // wet blooms: the wash is never even
      d *= 0.68 + 0.32 * smoothstep(0.3, 0.7, bloom(x / 170, y / 170));
      d *= 0.82 + 0.18 * grain(x / 45, y / 45);
      // ink pools along the edge of a wet stroke
      d += 0.4 * clamp01((shape[i] - inner[i]) * 4) * d;
      // 飞白 – the brush runs dry at the end of the kick and at the hem
      for (const a of axes) {
        const along = (x - a.from[0]) * a.ux + (y - a.from[1]) * a.uy;
        const across = -(x - a.from[0]) * a.uy + (y - a.from[1]) * a.ux;
        const t = along / a.len;
        const weight = smoothstep(a.start, 1.05, t) * smoothstep(a.width, a.width * 0.4, Math.abs(across));
        if (weight <= 0) continue;
        const v = a.n(across / 5 + 4 * jitter(along / 300, 0.5), along / 160);
        const gap = smoothstep(0.62 - 0.3 * weight, 0.7 - 0.25 * weight, v);
        d *= 1 - gap * Math.min(1, weight * 1.4);
      }
      // pale washes on top
      d = Math.max(d, pale[i]);
      // bleed into the paper
      d = Math.max(d, halo[i] * 0.13 * (0.5 + 0.5 * fibre(x / 7, y / 7)));
      ink[i] = d;
    }

  return sharp(toRGBA(ink, W, H), { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}
