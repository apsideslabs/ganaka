/**
 * Consistent place labels.
 *
 * A location should read "Guwahati, Assam" or "Pathsala, Assam, India" -
 * never "Guwahati Asia/Kolkata". The IANA zone is an implementation detail for
 * the ephemeris; it means nothing to someone picking their birthplace, so it is
 * kept out of labels and shown as a UTC offset only where a zone genuinely has
 * to be named.
 */

export interface PlaceLike {
  name: string;
  stateOrRegion?: string | null;
  country?: string | null;
}

/**
 * "Guwahati, Assam" or, with country, "Pathsala, Assam, India".
 * Duplicates are dropped, so a place whose state equals its name does not read
 * "Ujjain, Ujjain".
 */
export function formatPlace(place: PlaceLike, opts: { country?: boolean } = {}): string {
  const name = (place.name || '').trim();
  const state = (place.stateOrRegion || '').trim();
  const country = (place.country || '').trim();

  const parts: string[] = [];
  if (name) parts.push(name);
  if (state && state !== name) parts.push(state);
  if (opts.country && country && country !== state && country !== name) parts.push(country);
  return parts.join(', ');
}

/** Secondary line for a dropdown row: "Assam, India". */
export function formatPlaceRegion(place: PlaceLike): string {
  const state = (place.stateOrRegion || '').trim();
  const country = (place.country || '').trim();
  if (state && country && state !== country) return `${state}, ${country}`;
  return state || country || '';
}

/** "+05:30" from decimal hours. */
export function formatUtcOffset(hours: number): string {
  const sign = hours < 0 ? '-' : '+';
  const abs = Math.abs(hours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * A timezone label for the rare place that must name one. IANA ids like
 * "Asia/Kolkata" become "UTC+05:30"; anything unrecognised is passed through.
 */
export function formatZone(timezoneName: string | undefined, offsetHours: number): string {
  if (!timezoneName || timezoneName.includes('/')) return formatUtcOffset(offsetHours);
  return timezoneName;
}
