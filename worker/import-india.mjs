#!/usr/bin/env node
/**
 * Stream GeoNames allCountries.zip and emit chunked SQL for Cloudflare D1.
 *
 * The `cities*` extracts only contain towns above a population threshold, so
 * Indian revenue villages are missing from them. They live in allCountries.txt
 * as feature class 'P'. This script pulls exactly those rows for one country.
 *
 * Usage:
 *   curl -O https://download.geonames.org/export/dump/allCountries.zip
 *   node worker/import-india.mjs --zip ./allCountries.zip --country IN --out ./sql
 *
 *   for f in sql/*.sql; do
 *     wrangler d1 execute ganaka-places --remote --file "$f"
 *   done
 *
 * Data: GeoNames, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
 */
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ZIP = arg('zip', 'allCountries.zip');
const COUNTRY = arg('country', 'IN').toUpperCase();
const OUT = arg('out', 'sql');
const CHUNK = parseInt(arg('chunk', '25000'), 10);
const MIN_POP = parseInt(arg('min-pop', '0'), 10);
const ENTRY = 'allCountries.txt';

if (!fs.existsSync(ZIP)) {
  console.error(`zip not found: ${ZIP}`);
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const sqlStr = (s) => (s == null || s === '' ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const norm = (s) => (s || '').toLowerCase().trim();

let chunk = 1;
let placesInChunk = 0;
let totalPlaces = 0;
let totalAliases = 0;
let fd = null;
let writeChain = Promise.resolve();

function openChunk() {
  const file = path.join(OUT, `part-${String(chunk).padStart(3, '0')}.sql`);
  fd = fs.createWriteStream(file);
  fd.write('PRAGMA defer_foreign_keys = ON;\nBEGIN TRANSACTION;\n');
}

function rotate() {
  const stream = fd;
  stream.write('COMMIT;\n');
  writeChain = new Promise((resolve) => stream.end(resolve));
  chunk += 1;
  placesInChunk = 0;
  openChunk();
}

openChunk();

const unzip = spawn('unzip', ['-p', ZIP, ENTRY], { stdio: ['ignore', 'pipe', 'inherit'] });
const rl = readline.createInterface({ input: unzip.stdout, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (!line) return;
  const c = line.split('\t');
  if (c.length < 18) return;
  if (c[8] !== COUNTRY) return;
  if (c[6] !== 'P') return; // feature class P = populated place
  const pop = parseInt(c[14], 10) || 0;
  if (pop < MIN_POP) return;
  const lat = parseFloat(c[4]);
  const lon = parseFloat(c[5]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

  const id = c[0];
  const name = c[1];
  const ascii = c[2] || name;
  const tz = c[17] || '';

  fd.write(
    `INSERT OR REPLACE INTO place (id,name,state,country,lat,lon,tz,pop) VALUES (${id},${sqlStr(name)},NULL,${sqlStr(COUNTRY)},${lat},${lon},${sqlStr(tz)},${pop});\n`
  );

  const keys = new Set();
  keys.add(norm(name));
  keys.add(norm(ascii));
  if (c[3]) {
    for (const a of c[3].split(',')) {
      const k = norm(a);
      if (k.length >= 3 && k.length <= 40 && /^[\x20-\x7E]+$/.test(a)) keys.add(k);
    }
  }
  for (const k of keys) {
    if (!k) continue;
    fd.write(`INSERT INTO alias (key,place_id) VALUES (${sqlStr(k)},${id});\n`);
    totalAliases += 1;
  }

  totalPlaces += 1;
  placesInChunk += 1;
  if (placesInChunk >= CHUNK) rotate();
});

rl.on('close', async () => {
  fd.write('COMMIT;\n');
  await new Promise((r) => fd.end(r));
  await writeChain;
  console.log(
    `[import] ${COUNTRY}: ${totalPlaces} places, ${totalAliases} search keys, ${chunk} file(s) in ${OUT}`
  );
});

unzip.on('error', (err) => {
  console.error('[import] failed to run unzip:', err.message);
  process.exit(1);
});
