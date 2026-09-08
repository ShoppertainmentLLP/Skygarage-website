/*
  Regenerates public/fonts/archivo-latin-wdth-subset.woff2 — the only font file on the critical
  path, preloaded by BaseLayout for the hero headline. It carries the characters English copy
  actually uses; everything else falls through to the two unsubset faces declared in
  src/styles/global.css, which download only when such a character is on the page.

  subset-font is not a project dependency, since this runs once per font update rather than per
  build. Run it as:

    pnpm add -D subset-font && node scripts/subset-font.mjs && pnpm remove subset-font

  After regenerating, check the unicode-range on the subset face in global.css still matches
  CHARS below: a range that claims a character the file does not contain renders a blank box,
  and a range that overlaps the next face makes the browser download both files.
*/
import { readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

const SOURCE = 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2';
const TARGET = 'public/fonts/archivo-latin-wdth-subset.woff2';

let CHARS = '';
for (let c = 0x20; c <= 0x7e; c++) CHARS += String.fromCodePoint(c);
CHARS += '–—‘’“”•…€™−×÷°·£¥¢©®º ª½¼';

const source = await readFile(SOURCE);
const subset = await subsetFont(source, CHARS, { targetFormat: 'woff2' });
await writeFile(TARGET, subset);
console.log(`${SOURCE} ${source.length} bytes -> ${TARGET} ${subset.length} bytes`);
