// Lists every "[PLACEHOLDER: ...]" in the sources – the to-do list of missing content.
// Run: npm run placeholders
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const RE = /\[PLACEHOLDER:[^\]]*\]|PLACEHOLDER-[\w-]+/g;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(md|json|ts|astro)$/.test(entry.name)) yield path;
  }
}

const found = new Map();
for await (const file of walk(join(root, 'src'))) {
  const text = await readFile(file, 'utf8');
  const hits = [...new Set(text.match(RE) ?? [])];
  if (hits.length) found.set(relative(root, file).replaceAll('\\', '/'), hits);
}

let total = 0;
for (const [file, hits] of [...found].sort()) {
  console.log(`\n${file}`);
  for (const h of hits) console.log(`  · ${h}`);
  total += hits.length;
}
console.log(`\n${total} placeholders in ${found.size} files. (Photos without src render as placeholders too.)`);
