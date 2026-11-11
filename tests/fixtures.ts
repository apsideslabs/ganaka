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
/**
 * Tolerance against the Swiss Ephemeris reference longitudes, in arcseconds.
 *
 * The reference values below are GEOMETRIC positions — Swiss Ephemeris with
 * SEFLG_TRUEPOS — because that is the model this engine implements and the
 * convention PyJHora uses. The previous values were apparent positions, which
 * carry a light-time correction of up to 37" and made a correct engine look
 * wrong.
 *
 * Measured after the ΔT and VSOP87-Earth fixes: every planet is within 0.5"
 * across all three charts, and the Sun within 19" (it drifts with epoch
 * because of the truncated nutation series). 25" holds that.
 */
export const TOLERANCE_ARCSEC = 25;

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
      sun: 319.328331,
      moon: 42.044194,
      mercury: 298.263037,
      venus: 351.292567,
      mars: 297.119769,
      jupiter: 289.309045,
      saturn: 144.790284,
      rahu: 283.703157,
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
      sun: 256.865708,
      moon: 306.465492,
      mercury: 272.013295,
      venus: 282.529667,
      mars: 226.127502,
      jupiter: 71.455609,
      saturn: 261.917206,
      rahu: 294.726414,
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
      sun: 118.480946,
      moon: 135.287677,
      mercury: 145.031185,
      venus: 94.952755,
      mars: 189.468739,
      jupiter: 310.773806,
      saturn: 145.611097,
      rahu: 336.976074,
    },
  },
];
