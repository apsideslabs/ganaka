/**
 * Lazy place search over a three-tier index, all served as static files.
 *
 *   1. CITIES_DATABASE in coordinates.ts — a few hundred curated places,
 *      available synchronously, used until anything else loads.
 *   2. public/data/cities.json — ~70k towns worldwide, fetched once in the
 *      background.
 *   3. public/data/in/<letter>.json — every populated place in India, sharded
 *      by initial letter, fetched only when a query needs that letter. This is
 *      how villages appear without any server.
 *
 * No API, no key, no backend. Everything is a file on the same static host.
 *
 * Data: GeoNames, CC BY 4.0. See public/data/CITY-NOTICE.txt.
 */
import type { LocationInfo } from './coordinates';

/**
 * Compact row:
 *   [name, state, country, lat, lon, tzIndex, tzOffsetHours, population, alternates]
 */
type Row = [string, string, string, number, number, number, number, number, string?];

interface IndexFile {
  v: number;
  tz: string[];
  cities: Row[];
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * The place data is fetched with force-cache so it is not re-downloaded on
 * every keystroke, but that also means a browser keeps an old copy after a
 * deploy - which is how users went on seeing a stale index with empty state
 * names long after the data had been rebuilt. Stamping each build's id onto the
 * URL makes every deploy a different URL, so the cache is bypassed exactly once.
 */
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || '';
const V = BUILD_ID ? `?v=${encodeURIComponent(BUILD_ID)}` : '';

const INDEX_URL = `${BASE_PATH}/data/cities.json${V}`;
const SHARD_URL = (letter: string) => `${BASE_PATH}/data/in/${letter}.json${V}`;

let records: LocationInfo[] = [];
let keys: string[] = [];
let indexLoaded = false;
let inflight: Promise<void> | null = null;

/** letter -> true once its shard has been merged in (or failed). */
const shards = new Map<string, Promise<void>>();

/**
 * For each IANA timezone, how many indexed places fall in each country. Used to
 * turn the device timezone into a likely country without any network call or
 * permission prompt.
 */
const TZ_COUNTRY_COUNTS = new Map<string, Map<string, number>>();

function append(file: IndexFile) {
  for (const r of file.cities) {
    const [name, state, country, lat, lon, tzIdx, offset, , alt] = r;
    const tzName = tzIdx >= 0 ? file.tz[tzIdx] : 'UTC';
    records.push({
      name,
      stateOrRegion: state || undefined,
      country,
      latitude: lat,
      longitude: lon,
      timezoneOffsetHours: offset,
      timezoneName: tzName,
    });
    const base = `${name} ${state || ''} ${country}`.toLowerCase();
    keys.push(alt ? `${base} ${alt.replace(/\|/g, ' ')}` : base);

    let byCountry = TZ_COUNTRY_COUNTS.get(tzName);
    if (!byCountry) {
      byCountry = new Map();
      TZ_COUNTRY_COUNTS.set(tzName, byCountry);
    }
    byCountry.set(country, (byCountry.get(country) || 0) + 1);
  }
}

/**
 * The country a timezone mostly covers, e.g. "Asia/Kolkata" -> "India".
 * Returns null until the index has loaded, or for an unknown zone.
 */
/**
 * Every country present in the loaded index, sorted. Empty until it loads.
 */
export function availableCountries(): string[] {
  const seen = new Set<string>();
  for (const byCountry of TZ_COUNTRY_COUNTS.values()) {
    for (const country of byCountry.keys()) seen.add(country);
  }
  return [...seen].sort();
}

export function countryForTimezone(tz: string | null | undefined): string | null {
  if (!tz) return null;
  const byCountry = TZ_COUNTRY_COUNTS.get(tz);
  if (!byCountry) return null;
  let best: string | null = null;
  let bestCount = -1;
  for (const [country, count] of byCountry) {
    if (count > bestCount) {
      bestCount = count;
      best = country;
    }
  }
  return best;
}

/** Fetch the main town index. Safe to call repeatedly. */
export function loadCityIndex(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(INDEX_URL, { cache: 'force-cache' });
      if (!res.ok) {
        console.warn(`[city-index] ${INDEX_URL} returned ${res.status}`);
        return;
      }
      append((await res.json()) as IndexFile);
      indexLoaded = true;
    } catch (err) {
      console.warn('[city-index] load failed', err);
    }
  })();
  return inflight;
}

/**
 * Fetch and merge the village shard for one initial letter. Idempotent, and
 * safe to fire without awaiting: the next keystroke will see the new rows.
 */
export function ensureShard(letter: string): Promise<void> {
  const l = letter.toLowerCase();
  if (!/^[a-z_]$/.test(l)) return Promise.resolve();
  const existing = shards.get(l);
  if (existing) return existing;

  const p = (async () => {
    try {
      const res = await fetch(SHARD_URL(l), { cache: 'force-cache' });
      if (!res.ok) return;
      append((await res.json()) as IndexFile);
    } catch (err) {
      console.warn(`[city-index] shard ${l} failed`, err);
    }
  })();
  shards.set(l, p);
  return p;
}

/** True once the main town index is in memory. */
export function cityIndexReady(): boolean {
  return indexLoaded;
}

/** How many places are currently in memory. */
export function cityIndexSize(): number {
  return records.length;
}

/** Which village shards have been requested so far. */
export function loadedShards(): string[] {
  return [...shards.keys()].sort();
}

function match(query: string, limit: number): LocationInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const prefix: number[] = [];
  const contains: number[] = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k.startsWith(q)) {
      prefix.push(i);
      if (prefix.length >= limit) break;
    } else if (contains.length < limit && k.includes(q)) {
      contains.push(i);
    }
  }
  return prefix.concat(contains).slice(0, limit).map((i) => records[i]);
}

/**
 * Search the in-memory index. Synchronous by design: callers already expect
 * searchLocations() to return immediately.
 *
 * If the query is short on results, the village shard for its first letter is
 * requested in the background. Results appear on the next keystroke, which is
 * the same render cycle the user is already producing.
 */
export function searchIndexedCities(query: string, limit = 40): LocationInfo[] {
  if (!indexLoaded) void loadCityIndex();
  const q = query.trim();
  if (!q) return [];

  const hits = match(q, limit);
  if (hits.length < limit) void ensureShard(q.charAt(0));
  return hits;
}

/**
 * Await the best possible result for a query, including its village shard.
 * Search boxes that can hold async state should prefer this.
 */
export async function searchCitiesAsync(query: string, limit = 20): Promise<LocationInfo[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  await loadCityIndex();
  await ensureShard(q.charAt(0));
  return match(q, limit);
}

/**
 * The UTC offset, in hours, that an IANA zone was actually on at a given local
 * date. Uses the platform's own tz database via Intl, so no library and no data
 * file is needed. Returns null if the zone is unknown.
 *
 * This is what a chart needs: a July birth in London is UTC+1, not UTC+0.
 */
export function offsetForZone(
  timeZoneName: string | undefined,
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0
): number | null {
  if (!timeZoneName || !/^[A-Za-z]+\/[A-Za-z_]+/.test(timeZoneName)) return null;
  try {
    const dt = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneName,
      timeZoneName: 'longOffset',
    });
    const part = fmt.formatToParts(dt).find((p) => p.type === 'timeZoneName');
    if (!part) return null;
    const m = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(part.value);
    if (!m) return part.value === 'GMT' ? 0 : null;
    const sign = m[1] === '-' ? -1 : 1;
    const h = parseInt(m[2], 10);
    const mins = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (h + mins / 60);
  } catch {
    return null;
  }
}

if (typeof window !== 'undefined') {
  void loadCityIndex();
}
