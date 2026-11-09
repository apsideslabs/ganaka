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
import { searchCitiesAsync } from '@/lib/astronomy/city-index';

const DEBOUNCE_MS = 120;

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

  useEffect(() => {
    // Immediate synchronous pass: curated places plus whatever index is loaded.
    setResults(compute());

    const q = query.trim();
    if (q.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      searchCitiesAsync(q, limit)
        .then((full) => {
          if (!cancelled && full.length > 0) setResults(full);
        })
        .catch(() => {
          /* keep the synchronous results on failure */
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [compute, query, limit]);

  return results;
}
