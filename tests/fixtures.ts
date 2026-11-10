/**
 * Gaṇaka — test fixtures.
 *
 * Each chart carries birth data and the sidereal longitudes produced by the
 * Swiss Ephemeris (Lahiri, DE431 compressed) for the same instant. Those are
 * the reference; Ganaka's own series must land within TOLERANCE of them.
 *
 * Reference values generated with swisseph-wasm, SE_SIDM_LAHIRI, flags
 * SEFLG_SWIEPH | SEFLG_SIDEREAL.
 */

export interface FixtureChart {
  id: string;
  label: string;
  birth: {
    year: number; month: number; day: number;
    hour: number; minute: number; second: number;
    timezoneOffsetHours: number;
    latitude: number; longitude: number;
    locationName: string;
  };
  /** Swiss Ephemeris sidereal longitudes, degrees, Lahiri. */
  expected: Record<string, number>;
}

/**
 * Ganaka's series are truncated, so it will never be exact. The measured worst
 * case is ~33 arcsec; 60 gives headroom without being so loose it stops
 * catching a real regression. A 1-degree error fails; a rounding wobble does not.
 */
export const TOLERANCE_ARCSEC = 60;

export const FIXTURES: FixtureChart[] = [
  {
    id: 'jalah-2009',
    label: 'Jalah (Baksa), Assam — 3 Mar 2009 23:51:24 IST',
    birth: {
      year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
      timezoneOffsetHours: 5.5, latitude: 26.65653, longitude: 91.21622,
      locationName: 'Jalah, Baksa, Assam',
    },
    expected: {
      sun: 319.322595, moon: 42.043782, mercury: 298.252505, venus: 351.292347,
      mars: 297.10952, jupiter: 289.301561, saturn: 144.794175, rahu: 283.703157,
    },
  },
  {
    id: 'chennai-1990',
    label: 'Chennai — 1 Jan 1990 12:00 IST',
    birth: {
      year: 1990, month: 1, day: 1, hour: 12, minute: 0, second: 0,
      timezoneOffsetHours: 5.5, latitude: 13.0827, longitude: 80.2707,
      locationName: 'Chennai, Tamil Nadu',
    },
    expected: {
      sun: 256.859923, moon: 306.465258, mercury: 272.014436, venus: 282.530007,
      mars: 226.118116, jupiter: 71.458921, saturn: 261.909691, rahu: 294.726414,
    },
  },
  {
    id: 'delhi-1950',
    label: 'Delhi — 15 Aug 1950 06:30 IST',
    birth: {
      year: 1950, month: 8, day: 15, hour: 6, minute: 30, second: 0,
      timezoneOffsetHours: 5.5, latitude: 28.6139, longitude: 77.2090,
      locationName: 'Delhi',
    },
    expected: {
      sun: 118.475325, moon: 135.287578, mercury: 145.024168, venus: 94.942048,
      mars: 189.463536, jupiter: 310.776727, saturn: 145.60421, rahu: 336.976074,
    },
  },
];
