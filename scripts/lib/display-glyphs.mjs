// Which Chinese characters are set in the display serif (Noto Serif SC)?
// Shared by scripts/subset-fonts.mjs (builds the subset) and scripts/verify-dist.mjs (warns about gaps).
//
// Display text = headings (h1–h4), <blockquote>, and every element whose class contains
// font-display, font-hanzi or seal. The scan is deliberately generous (it reads a stretch of
// markup after each opening tag): an extra glyph costs a few hundred bytes, a missing one
// falls back to the system serif.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** CJK ideographs + CJK punctuation and full-width forms */
export const CJK = /[　-〿㐀-䶿一-鿿＀-￯]/gu;

/** Always included, whatever the scan finds. */
export const ALWAYS = '坤武功夫德师资课程联系日常报名子丑寅卯辰巳午未申酉戌亥（）：，。、—';

const RAW = /<(script|style)\b[\s\S]*?<\/\1\s*>/gi;
const HEADING = /<(h[1-4]|blockquote)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
const DISPLAY_CLASS = /<(\w+)\b[^>]*\bclass="[^"]*\b(?:font-display|font-hanzi|seal)\b[^"]*"[^>]*>/gi;

export function displayGlyphs(html, into = new Set()) {
  const text = html.replace(RAW, '');
  const add = (s) => {
    for (const c of s.replace(/<[^>]*>/g, '').match(CJK) ?? []) into.add(c);
  };
  for (const m of text.matchAll(HEADING)) add(m[2]);
  for (const m of text.matchAll(DISPLAY_CLASS)) add(text.slice(m.index + m[0].length, m.index + m[0].length + 500));
  return into;
}

export async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

export async function glyphsInDist(distDir) {
  const set = new Set(ALWAYS);
  for await (const file of htmlFiles(distDir)) displayGlyphs(await readFile(file, 'utf8'), set);
  return set;
}
