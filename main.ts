// EMBERFALL DUEL — the hand-in program (Node 22, standard library only).
// The game itself is the static game/ folder beside this file (plain HTML + ES modules, no
// library, no network). This program copies game/ and screenshots/ into the output directory
// and writes dossier.json there with the vendored make.fun library — the summary the judge
// reads before it ever opens the game.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });

const shotsDir = join(out, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), shotsDir, { recursive: true });
}

// The scorer's caps, mirrored so an over-limit entry fails here instead of at grading:
// at most 4 screenshots of 256 KiB each, at most 993 game files / 48 MiB in game/.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`emberfall-duel: handed in game/ + screenshots/ + dossier.json (${dossier.length} bytes) to ${out}`);
