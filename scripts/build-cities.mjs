#!/usr/bin/env node
/**
 * Build the offline city index from GeoNames dumps.
 *
 * GeoNames data is licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
 * and requires attribution, which is written to public/data/CITY-NOTICE.txt.
 *
 * Inputs (tab-separated, from https://download.geonames.org/export/dump/):
 *   cities5000.txt, cities1000.txt, admin1CodesASCII.txt, countryInfo.txt, timeZones.txt
 *
 * Output:
 *   public/data/cities.json   compact index consumed by lib/astronomy/city-index.ts
 *
 * Selection:
 *   - every place in cities5000 (population > 5000, or an administrative seat)
 *   - plus every Indian place in cities1000, so villages are searchable
 * Deduplicated by geonameid, sorted by population descending.
 */
import fs from 'node:fs';
import path from 'node:path';

const GN = process.env.GN_DIR || '/tmp/gn';
const OUT_DIR = path.resolve('public/data');
const OUT = path.join(OUT_DIR, 'cities.json');
const NOTICE = path.join(OUT_DIR, 'CITY-NOTICE.txt');

const read = (f) => {
  const p = path.join(GN, f);
  if (!fs.existsSync(p)) {
    console.warn(`[cities] missing ${p} - skipping index build`);
    return null;
  }
  return fs.readFileSync(p, 'utf8');
};

// admin1 code -> state name, e.g. "IN.16" -> "Assam"
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

// ISO2 -> country name
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

// timezone id -> standard offset in hours
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

function parseCities(txt, admin1, countries, onlyCountry) {
  const out = [];
  if (!txt) return out;
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    const c = line.split('\t');
    if (c.length < 18) continue;
    const cc = c[8];
    if (onlyCountry && cc !== onlyCountry) continue;
    const lat = parseFloat(c[4]);
    const lon = parseFloat(c[5]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    out.push({
      id: c[0],
      name: c[1],
      state: admin1.get(c[10]) || '',
      country: countries.get(cc) || cc,
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
      tz: c[17] || '',
      pop: parseInt(c[14], 10) || 0,
    });
  }
  return out;
}

const admin1 = parseAdmin1(read('admin1CodesASCII.txt'));
const countries = parseCountries(read('countryInfo.txt'));
const tzOffsets = parseTimeZones(read('timeZones.txt'));

const big = parseCities(read('cities5000.txt'), admin1, countries, null);
const india = parseCities(read('cities1000.txt'), admin1, countries, 'IN');

if (big.length === 0) {
  console.warn('[cities] no input data found; leaving existing index untouched');
  process.exit(0);
}

// dedupe by geonameid, prefer the cities5000 record
const byId = new Map();
for (const r of india) byId.set(r.id, r);
for (const r of big) byId.set(r.id, r);

const rows = [...byId.values()].sort((a, b) => b.pop - a.pop);

// compact representation: parallel arrays with a timezone dictionary
tzIndex = new Map();
const tzList = [];
for (const r of rows) {
  if (!r.tz) continue;
  if (!tzIndex.has(r.tz)) {
    tzIndex.set(r.tz, tzList.length);
    tzList.push(r.tz);
  }
}

const cities = rows.map((r) => [
  r.name,
  r.state,
  r.country,
  r.lat,
  r.lon,
  r.tz ? tzIndex.get(r.tz) : -1,
  r.tz && tzOffsets.has(r.tz) ? tzOffsets.get(r.tz) : 0,
  r.pop,
]);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ v: 1, tz: tzList, cities }));
fs.writeFileSync(
  NOTICE,
  [
    'Place data in this directory is derived from GeoNames.',
    '',
    'Source: GeoNames (https://www.geonames.org/), files cities5000.zip, cities1000.zip,',
    'admin1CodesASCII.txt, countryInfo.txt and timeZones.txt, downloaded from',
    'https://download.geonames.org/export/dump/',
    '',
    'License: Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/)',
    '',
    'Changes: filtered to populated places, selected fields, resolved administrative',
    'region and country names, converted to a compact JSON index. GeoNames does not',
    'endorse this project. Data is provided as is, without warranty of accuracy,',
    'timeliness or completeness.',
    '',
  ].join('\n')
);

const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`[cities] wrote ${cities.length} places (${mb} MB) to ${OUT}`);
console.log(`[cities] timezones: ${tzList.length}`);
