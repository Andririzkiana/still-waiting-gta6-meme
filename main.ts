// "Still Waiting" — entry program for make.fun's gta6-meme-x-01 bounty
// ("Post a GTA 6 meme on X").
//
// The entry itself is a public post on X: a two-panel meme about waiting
// thirteen years for GTA 6, with make.fun's name and ghost worked into the
// scene as a neon sign, and a post text that carries the entrant's play code
// and tells readers that people and their AI agents earn real money on
// make.fun. This program's whole job is to hand that post's address to the
// grader: it reads POST.json at the repository root, checks the address is
// a well-formed X post URL, and copies the file to the output directory,
// where the house reads it and builds the dossier the judge sees.
//
// Standard library only, no network. Outside the grader's container,
// MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address: x.com or twitter.com, a handle, /status/, digits only.
// The /i/web/status/<id> form X sometimes shows is accepted too, as the
// house reads it the same way.
const POST_URL_PATTERN =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([A-Za-z0-9_]+\/status|i\/web\/status)\/\d+$/;

function readPostFile(botDir: string): { url: string } {
  const raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || !('url' in parsed)) {
    throw new Error('POST.json must be a JSON object with a "url" field');
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string' || !POST_URL_PATTERN.test(url)) {
    throw new Error(`POST.json url is not an X post address: ${String(url)}`);
  }
  return { url };
}

function main(): void {
  const post = readPostFile(BOT_DIR);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
  console.log(`POST.json handed to the grader: ${post.url}`);
}

try {
  main();
} catch (err) {
  console.error(`still-waiting entry failed: ${(err as Error).message}`);
  process.exit(1);
}
