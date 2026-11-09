/**
 * Lazy loader and search over the GeoNames-derived city index, plus an
 * optional remote fallback for places too small to bundle.
 *
 * Three tiers, cheapest first:
 *   1. CITIES_DATABASE in coordinates.ts — a few hundred curated places,
 *      available synchronously, used until anything else loads.
 *   2. public/data/cities.json — ~70k places built at deploy time by
 *      scripts/build-cities.mjs, fetched once in the background.
 *   3. The Cloudflare Worker in worker/ — full populated-places table in D1,
 *      covering villages that the cities extracts omit. Only used when
 *      NEXT_PUBLIC_PLACE_API is set.
 *
 * Data: GeoNames, CC BY 4.0. See public/data/CITY-NOTICE.txt.
 */
import type { LocationInfo } from './coordinates';

/**
 * Compact row:
 *   [name, state, country, lat, lon, tzIndex, tzOffsetHours, population, alternates]
 */
type Row = [string, string, string, number, number, number, number, number, string?];

interface CityIndexFile {
  v: number;
  tz: string[];
  cities: Row[];
}

interface RemoteResult {
  name: string;
  stateOrRegion?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezoneName?: string;
  population?: number;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const INDEX_URL = `${BASE_PATH}/data/cities.json`;
const PLACE_API = (process.env.NEXT_PUBLIC_PLACE_API || '').replace(/\/$/, '');

let records: LocationInfo[] | null = null;
let keys: string[] | null = null;
let inflight: Promise<void> | null = null;

const remoteCache = new Map<string, LocationInfo[]>();

function toLocationInfo(file: CityIndexFile): LocationInfo[] {
  const out: LocationInfo[] = [];
  for (const r of file.cities) {
    const [name, state, country, lat, lon, tzIdx, offset] = r;
    out.push({
      name,
      stateOrRegion: state || undefined,
      country,
      latitude: lat,
      longitude: lon,
      timezoneOffsetHours: offset,
      timezoneName: tzIdx >= 0 ? file.tz[tzIdx] : 'UTC',
    });
  }
  return out;
}

/** Fetch and parse the bundled index. Safe to call repeatedly. */
export function loadCityIndex(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(INDEX_URL, { cache: 'force-cache' });
      if (!res.ok) {
        console.warn(`[city-index] ${INDEX_URL} returned ${res.status}`);
        return;
      }
      const file = (await res.json()) as CityIndexFile;
      if (!file || !Array.isArray(file.cities)) return;

      const loaded = toLocationInfo(file);
      const searchKeys: string[] = new Array(file.cities.length);
      for (let i = 0; i < file.cities.length; i++) {
        const [name, state, country, , , , , , alt] = file.cities[i];
        const base = `${name} ${state || ''} ${country}`.toLowerCase();
        searchKeys[i] = alt ? `${base} ${alt.replace(/\|/g, ' ')}` : base;
      }
      records = loaded;
      keys = searchKeys;
    } catch (err) {
      console.warn('[city-index] load failed', err);
    }
  })();
  return inflight;
}

/** True once the bundled index is in memory. */
export function cityIndexReady(): boolean {
  return records !== null;
}

/** How many places are bundled-loaded (0 until the fetch resolves). */
export function cityIndexSize(): number {
  return records ? records.length : 0;
}

/** Is a remote place API configured for this build? */
export function hasRemotePlaceApi(): boolean {
  return PLACE_API.length > 0;
}

function match(recordsList: LocationInfo[], searchKeys: string[], query: string, limit: number) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const prefix: number[] = [];
  const contains: number[] = [];
  for (let i = 0; i < searchKeys.length; i++) {
    const k = searchKeys[i];
    if (k.startsWith(q)) {
      prefix.push(i);
      if (prefix.length >= limit) break;
    } else if (contains.length < limit && k.includes(q)) {
      contains.push(i);
    }
  }
  return prefix.concat(contains).slice(0, limit).map((i) => recordsList[i]);
}

/**
 * Search the bundled index. Synchronous by design: callers already expect
 * searchLocations() to return immediately. Returns [] while the index is
 * still loading, which makes the caller fall back to CITIES_DATABASE.
 */
export function searchIndexedCities(query: string, limit = 40): LocationInfo[] {
  if (!records || !keys) {
    void loadCityIndex();
    return [];
  }
  return match(records, keys, query, limit);
}

/**
 * Async search across all tiers, including the remote Worker.
 *
 * Search boxes need to await this to use it (the current synchronous
 * searchLocations cannot). Results are cached per query so repeated
 * keystrokes and backspacing cost nothing.
 */
export async function searchCitiesAsync(query: string, limit = 20): Promise<LocationInfo[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const local = searchIndexedCities(q, limit);
  if (local.length > 0) return local;

  if (!PLACE_API) return [];

  const cacheKey = `${q.toLowerCase()}|${limit}`;
  const cached = remoteCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PLACE_API}/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const body = (await res.json()) as { results?: RemoteResult[] };
    const mapped: LocationInfo[] = (body.results || []).map((r) => ({
      name: r.name,
      stateOrRegion: r.stateOrRegion,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      timezoneOffsetHours: 0,
      timezoneName: r.timezoneName || 'UTC',
    }));
    remoteCache.set(cacheKey, mapped);
    return mapped;
  } catch (err) {
    console.warn('[city-index] remote search failed', err);
    return [];
  }
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

// Start loading as soon as this module is used in the browser.
if (typeof window !== 'undefined') {
  void loadCityIndex();
}
