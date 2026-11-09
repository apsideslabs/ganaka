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
 * Results are ranked for the device's part of the world: a country chosen in
 * Config wins, otherwise the device timezone is used. Country matches come
 * first, then distance, then the natural order.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  CITIES_DATABASE,
  searchLocations,
  type LocationInfo,
} from '@/lib/astronomy/coordinates';
import {
  searchCitiesAsync,
  countryForTimezone,
  cityIndexReady,
} from '@/lib/astronomy/city-index';
import {
  deviceTimezone,
  getPreferredCountry,
  haversineKm,
  SEARCH_COUNTRY_EVENT,
  type GeoBias,
} from '@/lib/astronomy/geo-bias';

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

  // Resolve the ranking bias. A country chosen in Config wins; otherwise the
  // device timezone is used, which needs no permission and no network call.
  // Re-runs whenever the preference changes.
  const resolveBias = useCallback(() => {
    const preferred = getPreferredCountry();
    const country = preferred || countryForTimezone(deviceTimezone());
    setBias(country ? { country, lat: null, lon: null } : null);
  }, []);

  useEffect(() => {
    resolveBias();
    // The index has to be loaded before a timezone can be mapped to a country.
    const timers = [setTimeout(resolveBias, 1500), setTimeout(resolveBias, 4000)];
    const onChange = () => resolveBias();
    window.addEventListener(SEARCH_COUNTRY_EVENT, onChange);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener(SEARCH_COUNTRY_EVENT, onChange);
    };
  }, [resolveBias]);

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
