/*
  Checks the frontmatter of every content file for the one mistake that actually happens when
  writing copy: an unquoted value containing ": ", which YAML reads as a nested mapping.

  Worth having because that error does not fail loudly in development — `astro dev` exits while
  starting and the wrapper reports only "process exited before becoming ready", which is a
  confusing way to learn that a colon needs quoting. `astro build` does report it properly, so
  this is a faster version of the same signal:

    node scripts/check-content.mjs

  Deliberately dependency-free: it is a lint, not a parser, and adding a YAML library to the
  project for it would cost more than it saves.
*/
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = 'src/content';
const SUSPECT = /^(\s*(?:- )?[A-Za-z_]+):\s+(?!["'|>])(.*: .*)$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith('.md')) yield path;
  }
}

let failures = 0;
for await (const path of walk(ROOT)) {
  const source = await readFile(path, 'utf8');
  if (!source.startsWith('---')) {
    console.error(`${relative('.', path)}: no frontmatter block`);
    failures++;
    continue;
  }
  const end = source.indexOf('\n---', 3);
  source
    .slice(4, end)
    .split('\n')
    .forEach((line, i) => {
      const match = SUSPECT.exec(line);
      if (match) {
        console.error(
          `${relative('.', path)}:${i + 2} value contains ": " and must be quoted — ${match[1].trim()}`,
        );
        failures++;
      }
    });
}

console.log(failures === 0 ? 'Content frontmatter OK' : `${failures} problem(s) found`);
process.exit(failures === 0 ? 0 : 1);
