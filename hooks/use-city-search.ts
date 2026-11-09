'use client';

/**
 * Debounced, three-tier city search for React components.
 *
 * The bundled town index (public/data/cities.json) and the per-letter Indian
 * village shards (public/data/in/<letter>.json) are fetched lazily by
 * city-index.ts. searchLocations() is synchronous and can only see whatever has
 * loaded so far, so a component calling it directly inside useMemo never shows
 * the villages - the data ships, but the UI never reaches it.
 *
 * This hook returns the synchronous result immediately, so the curated list and
 * any already-loaded index appear with no flicker, then upgrades to the full
 * asynchronous result - which may fetch a village shard - a moment later.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  CITIES_DATABASE,
  searchLocations,
  type LocationInfo,
} from '@/lib/astronomy/coordinates';
import { searchCitiesAsync, countryForTimezone, cityIndexReady } from '@/lib/astronomy/city-index';
import { deviceTimezone, haversineKm, type GeoBias } from '@/lib/astronomy/geo-bias';

const DEBOUNCE_MS = 120;

/**
 * Rank results for the device's part of the world.
 *
 * Country match dominates, then distance when geolocation is available, then
 * the original order (which is prefix matches before substring matches, and
 * population order within each). Without a bias the list is returned untouched.
 */
export function applyBias(list: LocationInfo[], bias: GeoBias | null): LocationInfo[] {
  if (!bias || (!bias.country && bias.lat === null)) return list;
  const scored = list.map((place, index) => {
    let score = index; // keep the original ordering as the tie-break
    if (bias.country && place.country === bias.country) score -= 10000;
    if (bias.lat !== null && bias.lon !== null) {
      score += haversineKm(bias.lat, bias.lon, place.latitude, place.longitude) / 10;
    }
    return { place, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.place);
}


/**
 * @param query the raw search string from the input
 * @param limit how many results to show
 * @param emptySlice how many curated places to show when the query is empty
 *        (0 means show nothing until the user types)
 */
export function useCitySearch(
  query: string,
  limit: number,
  emptySlice = limit
): LocationInfo[] {
  const compute = useCallback((): LocationInfo[] => {
    if (!query || query.trim().length === 0) {
      return emptySlice > 0 ? CITIES_DATABASE.slice(0, emptySlice) : [];
    }
    return searchLocations(query).slice(0, limit);
  }, [query, limit, emptySlice]);

  const [results, setResults] = useState<LocationInfo[]>(compute);
  const [bias, setBias] = useState<GeoBias | null>(null);

  // Resolve the device's likely country from its timezone. This needs no
  // permission and no network call; it simply reads Intl. The index has to be
  // loaded before the timezone can be mapped, so this waits for it.
  useEffect(() => {
    let cancelled = false;
    const resolve = () => {
      if (cancelled) return;
      const country = countryForTimezone(deviceTimezone());
      if (country) setBias({ country, lat: null, lon: null });
    };
    if (cityIndexReady()) {
      resolve();
    } else {
      const timer = setTimeout(resolve, 1500);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Immediate synchronous pass: curated places plus whatever index is loaded.
    setResults(applyBias(compute(), bias));

    const q = query.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      searchCitiesAsync(q, limit)
        .then((full) => {
          if (!cancelled && full.length > 0) setResults(applyBias(full, bias));
        })
        .catch(() => {
          /* keep the synchronous results on failure */
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [compute, query, limit, bias]);

  return results;
}
