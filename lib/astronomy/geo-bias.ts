'use client';

/**
 * Device-location bias for city search.
 *
 * Two sources, in order of cost:
 *
 *  1. The device's IANA timezone, read from Intl. No permission prompt, no
 *     network call, works offline. "Asia/Kolkata" resolves to India because the
 *     city index records which country each timezone mostly covers.
 *  2. The browser Geolocation API, only if the user grants it. Gives exact
 *     coordinates, which lets results be ranked by distance instead of just by
 *     country.
 *
 * Nothing here is sent anywhere. The timezone never leaves the browser, and the
 * coordinates are used only to sort a list that is already on the device.
 */

export interface GeoBias {
  /** ISO country name as used by the place index, e.g. "India". */
  country: string | null;
  /** Device latitude in degrees, when geolocation was granted. */
  lat: number | null;
  /** Device longitude in degrees, when geolocation was granted. */
  lon: number | null;
}

/** The IANA timezone of the device, or null when unavailable. */
export function deviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/** Great-circle distance in kilometres. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Ask the browser for the device position. Resolves to null if the user
 * declines, the API is missing, or it takes too long - never throws, so a
 * caller can treat it as a pure enhancement.
 */
export function requestDevicePosition(
  timeoutMs = 8000
): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    let settled = false;
    const done = (v: { lat: number; lon: number } | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        done({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        done(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 600000 }
    );
  });
}
