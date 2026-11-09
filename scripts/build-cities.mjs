#!/usr/bin/env node
/**
 * Build the offline place index from GeoNames dumps.
 *
 * GeoNames data is licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
 * and requires attribution, written to public/data/CITY-NOTICE.txt.
 *
 * Outputs:
 *   public/data/cities.json      towns worldwide + Indian towns (one file)
 *   public/data/in/<letter>.json Indian villages, sharded by first letter
 *
 * The `cities*` extracts filter by population, so Indian revenue villages
 * (feature class P in the country extract) are absent from them. IN.txt, the
 * per-country extract, has every feature in India; we keep class P and shard
 * the result by initial letter so the browser fetches ~250 KB instead of 27 MB.
 *
 * Inputs (all optional except cities5000):
 *   cities5000.txt, cities1000.txt, cities500.txt, IN.txt,
 *   admin1CodesASCII.txt, admin2Codes.txt, countryInfo.txt, timeZones.txt
 */
import fs from 'node:fs';
import path from 'node:path';

const GN = process.env.GN_DIR || '/tmp/gn';
const OUT_DIR = path.resolve('public/data');
const SHARD_DIR = path.join(OUT_DIR, 'in');
const OUT = path.join(OUT_DIR, 'cities.json');
const NOTICE = path.join(OUT_DIR, 'CITY-NOTICE.txt');

const ALT_POP_THRESHOLD = 100000;
const MAX_ALTS = 3;

const read = (f) => {
  const p = path.join(GN, f);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
};

function parseAdmin1(txt) {
  const m = new Map();
  if (!txt) return m;
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    const [code, name] = line.split('\t');
    if (code && name) m.set(code, name);
  }
  return m;
}

function parseCountries(txt) {
  const m = new Map();
  if (!txt) return m;
  for (const line of txt.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const c = line.split('\t');
    if (c[0] && c[4]) m.set(c[0], c[4]);
  }
  return m;
}

function parseTimeZones(txt) {
  const m = new Map();
  if (!txt) return m;
  const lines = txt.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  for (const line of lines.slice(1)) {
    const c = line.split('\t');
    const id = c[1];
    const raw = parseFloat(c[4]);
    if (id && Number.isFinite(raw)) m.set(id, raw);
  }
  return m;
}

function cleanAlts(alternates, name, ascii, max = MAX_ALTS) {
  if (!alternates) return '';
  const seen = new Set([name.toLowerCase(), ascii.toLowerCase()]);
  const out = [];
  for (const raw of alternates.split(',')) {
    const a = raw.trim();
    if (!a || a.length < 3 || a.length > 28) continue;
    if (!/^[\x20-\x7E]+$/.test(a)) continue;
    const k = a.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
    if (out.length >= max) break;
  }
  return out.join('|');
}

function rowFrom(c, admin1, admin2, countries, { withAlt }) {
  const lat = parseFloat(c[4]);
  const lon = parseFloat(c[5]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const pop = parseInt(c[14], 10) || 0;
  const name = c[1];
  const ascii = c[2] || name;
  // GeoNames admin codes are keyed by the full dotted path: admin1 is
  // "IN.03", admin2 is "IN.03.324". Using the bare code returns nothing, which
  // is why every place once had a blank state.
  const stateName = admin1.get(`${c[8]}.${c[10]}`) || '';
  const districtName = admin2.get(`${c[8]}.${c[10]}.${c[11]}`) || '';
  // Fold the district in so same-named places can be told apart:
  // "Baksa, Assam" against "Kamrup, Assam" rather than "Assam" twice.
  const regionLabel =
    districtName && stateName && districtName !== stateName
      ? `${districtName}, ${stateName}`
      : districtName || stateName;
  return {
    id: c[0],
    name,
    ascii,
    state: regionLabel,
    country: countries.get(c[8]) || c[8],
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000,
    tz: c[17] || '',
    pop,
    alt: withAlt && pop >= ALT_POP_THRESHOLD ? cleanAlts(c[3], name, ascii) : '',
  };
}

function parseCities(txt, admin1, admin2, countries, onlyCountry, opts) {
  const out = [];
  if (!txt) return out;
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    const c = line.split('\t');
    if (c.length < 18) continue;
    if (onlyCountry && c[8] !== onlyCountry) continue;
    const r = rowFrom(c, admin1, admin2, countries, opts);
    if (r) out.push(r);
  }
  return out;
}

/** India country extract: keep populated places only (feature class P). */
function parseCountryExtract(txt, admin1, admin2, countries) {
  const out = [];
  if (!txt) return out;
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    const c = line.split('\t');
    if (c.length < 18) continue;
    if (c[6] !== 'P') continue;
    const r = rowFrom(c, admin1, admin2, countries, { withAlt: true });
    if (r) out.push(r);
  }
  return out;
}

const admin1 = parseAdmin1(read('admin1CodesASCII.txt'));
const admin2 = parseAdmin1(read('admin2Codes.txt'));
const countries = parseCountries(read('countryInfo.txt'));
const tzOffsets = parseTimeZones(read('timeZones.txt'));

const big = parseCities(read('cities5000.txt'), admin1, admin2, countries, null, { withAlt: true });
const mid = parseCities(read('cities1000.txt'), admin1, admin2, countries, 'IN', { withAlt: true });
const small = parseCities(read('cities500.txt'), admin1, admin2, countries, 'IN', { withAlt: true });
const indiaFull = parseCountryExtract(read('IN.txt'), admin1, admin2, countries);

if (big.length === 0) {
  console.warn('[cities] cities5000.txt missing; leaving existing index untouched');
  process.exit(0);
}

function buildTz(rows) {
  const tzIndex = new Map();
  const tzList = [];
  for (const r of rows) {
    if (r.tz && !tzIndex.has(r.tz)) {
      tzIndex.set(r.tz, tzList.length);
      tzList.push(r.tz);
    }
  }
  return { tzIndex, tzList };
}

const compact = (r, tzIndex) => [
  r.name,
  r.state,
  r.country,
  r.lat,
  r.lon,
  r.tz ? tzIndex.get(r.tz) : -1,
  r.tz && tzOffsets.has(r.tz) ? tzOffsets.get(r.tz) : 0,
  r.pop,
  r.alt,
];

// ---- Main index: worldwide towns + Indian towns ----
const byId = new Map();
for (const r of small) byId.set(r.id, r);
for (const r of mid) byId.set(r.id, r);
for (const r of big) byId.set(r.id, r);

const rows = [...byId.values()].sort((a, b) => b.pop - a.pop);
const { tzIndex, tzList } = buildTz(rows);
const cities = rows.map((r) => compact(r, tzIndex));

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ v: 3, tz: tzList, cities }));

// ---- India shards: every populated place in the country extract ----
let shardCount = 0;
let shardPlaces = 0;
let shardBytes = 0;

if (indiaFull.length > 0) {
  fs.rmSync(SHARD_DIR, { recursive: true, force: true });
  fs.mkdirSync(SHARD_DIR, { recursive: true });

  // Drop anything already in the main index; the browser checks that first.
  const inMain = new Set(rows.map((r) => r.id));
  const extra = indiaFull.filter((r) => !inMain.has(r.id));

  const buckets = new Map();
  for (const r of extra) {
    const key = (r.ascii || r.name || '').trim().charAt(0).toLowerCase();
    const b = /^[a-z]$/.test(key) ? key : '_';
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b).push(r);
  }

  const shardTz = buildTz(extra);
  for (const [letter, list] of buckets) {
    list.sort((a, b) => b.pop - a.pop);
    const payload = {
      v: 3,
      letter,
      tz: shardTz.tzList,
      cities: list.map((r) => compact(r, shardTz.tzIndex)),
    };
    const file = path.join(SHARD_DIR, `${letter}.json`);
    const body = JSON.stringify(payload);
    fs.writeFileSync(file, body);
    shardBytes += Buffer.byteLength(body);
    shardCount += 1;
    shardPlaces += list.length;
  }
}

fs.writeFileSync(
  NOTICE,
  [
    'Place data in this directory is derived from GeoNames.',
    '',
    'Source: GeoNames (https://www.geonames.org/), files cities5000.zip, cities1000.zip,',
    'cities500.zip, IN.zip, admin1CodesASCII.txt, admin2Codes.txt, countryInfo.txt and timeZones.txt,',
    'downloaded from https://download.geonames.org/export/dump/',
    '',
    'License: Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/)',
    '',
    'Changes: filtered to populated places, selected fields, resolved administrative',
    'region and country names, added alternate names for large places, sharded the',
    'Indian village set by initial letter. GeoNames does not endorse this project.',
    'Data is provided as is, without warranty of accuracy, timeliness or completeness.',
    '',
  ].join('\n')
);

const indiaMain = cities.filter((c) => c[2] === 'India').length;
const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`[cities] main index: ${cities.length} places (${indiaMain} India) in ${mb} MB`);
if (shardCount > 0) {
  console.log(
    `[cities] india shards: ${shardPlaces} villages across ${shardCount} files, ${(shardBytes / 1024 / 1024).toFixed(2)} MB total`
  );
} else {
  console.log('[cities] no IN.txt found; village shards skipped');
}
