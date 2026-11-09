/**
 * Lazy loader and search over the GeoNames-derived city index.
 *
 * The bundled CITIES_DATABASE in coordinates.ts holds a few hundred curated
 * places and is available synchronously. This module adds the full index
 * (tens of thousands of places, generated at build time by
 * scripts/build-cities.mjs) without blocking first paint: it is fetched once
 * in the background and, until it arrives, searchIndexedCities returns [] so
 * callers fall back to the bundled list.
 *
 * Data: GeoNames, CC BY 4.0. See public/data/CITY-NOTICE.txt.
 */
import type { LocationInfo } from './coordinates';

/** Compact row: [name, state, country, lat, lon, tzIndex, tzOffsetHours, population] */
type Row = [string, string, string, number, number, number, number, number];

interface CityIndexFile {
  v: number;
  tz: string[];
  cities: Row[];
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const INDEX_URL = `${BASE_PATH}/data/cities.json`;

let records: LocationInfo[] | null = null;
let keys: string[] | null = null;
let inflight: Promise<void> | null = null;

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

/** Fetch and parse the index. Safe to call repeatedly; the work happens once. */
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
      keys = loaded.map((c) =>
        `${c.name} ${c.stateOrRegion || ''} ${c.country}`.toLowerCase()
      );
      records = loaded;
    } catch (err) {
      console.warn('[city-index] load failed', err);
    }
  })();
  return inflight;
}

/** True once the full index is in memory. */
export function cityIndexReady(): boolean {
  return records !== null;
}

/** How many places are loaded (0 until the fetch resolves). */
export function cityIndexSize(): number {
  return records ? records.length : 0;
}

/**
 * Search the full index. Synchronous by design: callers already expect
 * searchLocations() to return immediately. Returns [] while the index is
 * still loading, which makes the caller fall back to the bundled list.
 */
export function searchIndexedCities(query: string, limit = 40): LocationInfo[] {
  if (!records || !keys) {
    void loadCityIndex();
    return [];
  }
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

  return prefix.concat(contains).slice(0, limit).map((i) => records![i]);
}

// Start loading as soon as this module is used in the browser, so the index is
// usually ready by the time the user has typed a few characters.
if (typeof window !== 'undefined') {
  void loadCityIndex();
}
