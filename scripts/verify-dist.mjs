// Post-build check (China compatibility): the built site must not load anything from
// Google or any external host. Plain <a href> links to other sites are allowed
// (Stripe, OpenStreetMap, Bilibili …) – they are navigations, not requests.
// Run automatically by `npm run build`.
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const FORBIDDEN = /google|gstatic|googleapis|doubleclick|youtube\.com\/embed|ytimg|jsdelivr|unpkg|cdnjs|cloudflare|fontawesome|typekit/i;

/** Attributes that make the browser fetch something */
const FETCHING = [
  /<(?:script|img|source|video|audio|iframe|embed|track)\b[^>]*?\s(?:src|poster|srcset)=["']([^"']+)["']/gi,
  /<link\b(?![^>]*rel=["'](?:canonical|alternate)["'])[^>]*?\shref=["']([^"']+)["']/gi,
  /<(?:img|source)\b[^>]*?\ssrcset=["']([^"']+)["']/gi,
  /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
  /@import\s+["']([^"']+)["']/gi,
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const problems = [];
let files = 0;
for await (const file of walk(DIST.pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  if (!['.html', '.css', '.js', '.webmanifest', '.xml'].includes(extname(file))) continue;
  files++;
  const text = await readFile(file, 'utf8');
  const rel = file.slice(file.indexOf('dist'));

  if (extname(file) !== '.xml') {
    for (const re of FETCHING) {
      for (const m of text.matchAll(re)) {
        for (const url of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
          if (/^(https?:)?\/\//i.test(url)) problems.push(`${rel}: external resource ${url}`);
        }
      }
    }
  }
  // xmlns="http://www.google.com/schemas/..." in the sitemap is an identifier, not a request
  const forbidden = text.replace(/\sxmlns(:\w+)?="[^"]*"/g, '').match(FORBIDDEN);
  if (forbidden) problems.push(`${rel}: forbidden host/string "${forbidden[0]}"`);
}

if (problems.length) {
  console.error(`✗ verify-dist: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ verify-dist: ${files} files checked – no external resources, no Google, no CDNs.`);
