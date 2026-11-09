#!/usr/bin/env python3
"""
Route every city search box through useCitySearch so the village tier is
reachable.

The data has been shipping for a while: 70k towns plus 550k Indian villages in
per-letter shards. But searchLocations() is synchronous and the components
called it inside useMemo, so only the curated list and whatever the index had
already loaded were ever visible. The villages were downloaded on every deploy
and never shown.
"""
import pathlib
import sys

changed = []
missing = []


def patch(path, pairs, import_line=None, anchor=None):
    p = pathlib.Path(path)
    if not p.exists():
        missing.append(f'{path} (not found)')
        return
    s = p.read_text()
    orig = s
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new)
        elif new not in s:
            missing.append(f'{path}: {old[:60]!r}')
    if import_line and import_line not in s and anchor and anchor in s:
        s = s.replace(anchor, anchor + '\n' + import_line, 1)
    if s != orig:
        p.write_text(s)
        changed.append(path)


# --- 1. Home birth details panel ------------------------------------------
patch(
    'components/home/HomeBirthDetailsPanel.tsx',
    [("""  // Filtered Locations
  const locationResults = useMemo(() => {
    if (!locationQuery || locationQuery.trim().length === 0) {
      return CITIES_DATABASE.slice(0, 8);
    }
    return searchLocations(locationQuery);
  }, [locationQuery]);""",
      """  // Filtered Locations (curated + full GeoNames index, incl. Indian villages)
  const locationResults = useCitySearch(locationQuery, 40, 8);""")],
    import_line="import { useCitySearch } from '@/hooks/use-city-search';",
    anchor="import { CITIES_DATABASE, CityLocation, searchLocations } from '@/lib/astronomy/coordinates';",
)

# --- 2. Panchanga header ---------------------------------------------------
patch(
    'components/panchanga/PanchangaHeader.tsx',
    [("""  // Filtered Cities for Search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return CITIES_DATABASE.slice(0, 18);
    return searchLocations(citySearchQuery).slice(0, 25);
  }, [citySearchQuery]);""",
      """  // Filtered Cities for Search (curated + full GeoNames index, incl. villages)
  const filteredCities = useCitySearch(citySearchQuery, 25, 18);""")],
    import_line="import { useCitySearch } from '@/hooks/use-city-search';",
    anchor="} from '@/lib/astronomy/coordinates';",
)

# --- 3. Settings dialog ----------------------------------------------------
patch(
    'components/settings/PlatformSettingsDialog.tsx',
    [("""  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) {
      return [];
    }
    return searchLocations(citySearchQuery).slice(0, 8);
  }, [citySearchQuery]);""",
      """  // Filtered cities list (curated + full GeoNames index)
  const filteredCities = useCitySearch(citySearchQuery, 8, 0);""")],
    import_line="import { useCitySearch } from '@/hooks/use-city-search';",
    anchor="import { CITIES_DATABASE, CityLocation, searchLocations } from '@/lib/astronomy/coordinates';",
)

# --- 4. Matching workspace (two boxes) -------------------------------------
patch(
    'components/matching/MatchingWorkspaceClient.tsx',
    [("""  const groomCityResults = useMemo(() => {
    return searchLocations(groomCitySearch).slice(0, 5);
  }, [groomCitySearch]);""",
      "  const groomCityResults = useCitySearch(groomCitySearch, 5, 5);"),
     ("""  const brideCityResults = useMemo(() => {
    return searchLocations(brideCitySearch).slice(0, 5);
  }, [brideCitySearch]);""",
      "  const brideCityResults = useCitySearch(brideCitySearch, 5, 5);")],
    import_line="import { useCitySearch } from '@/hooks/use-city-search';",
    anchor="import { CITIES_DATABASE, searchLocations } from '@/lib/astronomy/coordinates';",
)

# --- 5. Workspace ----------------------------------------------------------
patch(
    'components/workspace/WorkspaceClient.tsx',
    [("""  // Filtered Locations (Searches 220+ cities)
  const locationResults = useMemo(() => searchLocations(locationQuery), [locationQuery]);""",
      """  // Filtered Locations (curated + full GeoNames index, incl. Indian villages)
  const locationResults = useCitySearch(locationQuery, 40, 15);""")],
    import_line="import { useCitySearch } from '../../hooks/use-city-search';",
    anchor="import { CITIES_DATABASE, CityLocation, searchLocations, formatDMS } from '../../lib/astronomy/coordinates';",
)

print('changed:', changed or 'none')
for m in missing:
    print(f'::warning::not found -> {m}')
