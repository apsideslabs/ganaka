/**
 * Gaṇaka — eclipse calculation (grahaṇa).
 *
 * An eclipse is a syzygy that lands near a node. The engine already knows both
 * halves of that: the Sun–Moon elongation gives the new and full moons, and the
 * Moon's ecliptic latitude says how far the shadow axis misses the Earth.
 *
 * The search is:
 *
 *   1. step the range a day at a time, watching the elongation for a crossing
 *      of 0° (new moon) or 180° (full moon);
 *   2. bisect each crossing to the second;
 *   3. read the Moon's ecliptic latitude at that instant;
 *   4. if the latitude is inside the limit, the syzygy is an eclipse.
 *
 * The limits used are the conventional ones — the Moon must be within about
 * 1.5° of the ecliptic for a solar eclipse and about 1.0° for a lunar one. The
 * true limit varies with the Sun's and Moon's distance, so the classification is
 * a good approximation rather than a Besselian-element solution: this tells you
 * which syzygies are eclipses and roughly how deep, not the path of totality.
 *
 * Visibility is reported as a horizon check at the given place — whether the
 * Sun (for a solar eclipse) or the Moon (for a lunar one) is above the horizon
 * at the moment of greatest eclipse. That is a necessary condition, not a
 * sufficient one: a local horizon or the edge of the penumbra can still hide an
 * event this test accepts.
 */
import { calculateAllPlanets } from './ephemeris';
import { calculateSolarTimes, calculateLunarTimes } from './ephemeris';
import { normalizeDegrees } from './julian';

export type EclipseKind = 'solar' | 'lunar';

export interface EclipseEvent {
  kind: EclipseKind;
  /** Julian Day of greatest eclipse (the syzygy). */
  jd: number;
  /** Civil date in the given timezone. */
  date: { year: number; month: number; day: number; hour: number; minute: number };
  /** ISO-like stamp for display. */
  label: string;
  /** Moon's ecliptic latitude at the syzygy, in degrees. */
  moonLatitude: number;
  /** The limit the latitude was tested against. */
  limit: number;
  /**
   * How deep the eclipse runs, 0 at the limit and 1 on the axis. A proxy for
   * magnitude, not the magnitude itself.
   */
  depth: number;
  /** True when the luminary is above the horizon at the given place. */
  aboveHorizon: boolean;
  /** Plain description. */
  description: string;
}

export interface EclipseSearchOptions {
  from: { year: number; month: number; day: number };
  to: { year: number; month: number; day: number };
  latitude?: number;
  longitude?: number;
  timezoneOffsetHours?: number;
  ayanamshaType?: any;
  customAyanamshaValue?: number;
  /** Cap on returned events. Default 40. */
  maxResults?: number;
}

const SOLAR_LIMIT = 1.5;
const LUNAR_LIMIT = 1.0;

/** Julian Day from a civil date at 00:00 UT. */
function jdFromDate(y: number, m: number, d: number): number {
  let a = Math.floor((14 - m) / 12);
  let yy = y + 4800 - a;
  let mm = m + 12 * a - 3;
  let jdn =
    d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) -
    Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return jdn - 0.5;
}

/** Civil date-time from a Julian Day in a timezone. */
function dateFromJD(jd: number, tz: number) {
  const local = jd + tz / 24;
  const z = Math.floor(local + 0.5);
  const frac = local + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const dd = Math.floor(365.25 * c);
  const e = Math.floor((b - dd) / 30.6001);
  const day = b - dd - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const secs = Math.round(frac * 86400);
  return { year, month, day, hour: Math.floor(secs / 3600) % 24, minute: Math.floor(secs / 60) % 60 };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function stamp(d: ReturnType<typeof dateFromJD>): string {
  return `${String(d.day).padStart(2, '0')} ${MONTHS[d.month - 1]} ${d.year} ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`;
}

/**
 * The Moon's ecliptic latitude at a moment, in degrees.
 */
function moonLatitudeAt(jd: number, ayan: any, custom: number): number {
  const p: any = calculateAllPlanets(jd, ayan, custom);
  return Number(p.moon.latitude ?? 0);
}

/**
 * Find every eclipse between two dates.
 */
export function findEclipses(opts: EclipseSearchOptions): EclipseEvent[] {
  const ayan = opts.ayanamshaType ?? 'lahiri';
  const custom = opts.customAyanamshaValue ?? 0;
  const tz = opts.timezoneOffsetHours ?? 5.5;
  const maxResults = Math.max(1, opts.maxResults ?? 40);

  const startJD = jdFromDate(opts.from.year, opts.from.month, opts.from.day);
  const endJD = jdFromDate(opts.to.year, opts.to.month, opts.to.day);
  if (endJD <= startJD) return [];

  /** Sun–Moon elongation, 0–360, where 0 is new moon and 180 is full. */
  const elongation = (jd: number): number => {
    const p: any = calculateAllPlanets(jd, ayan, custom);
    return normalizeDegrees(p.moon.siderealLongitude - p.sun.siderealLongitude);
  };

  const events: EclipseEvent[] = [];
  let prev = elongation(startJD);

  for (let jd = startJD + 0.5; jd <= endJD && events.length < maxResults; jd += 0.5) {
    const cur = elongation(jd);

    // A syzygy is a crossing of 0° (new moon) or 180° (full moon). The
    // elongation rises ~12°/day, so a half-day step cannot skip one.
    const crossedNew = prev > 300 && cur < 60;
    const crossedFull =
      (prev < 180 && cur >= 180) || (prev > 180 && cur <= 180);

    if (crossedNew || crossedFull) {
      // Bisect a SIGNED function so the root is found exactly. Comparing
      // absolute distances only hill-climbs, which converged slowly and left
      // the July 2010 syzygy eighty minutes late.
      //
      //   new moon : g = elongation folded to −180…180, zero at 0°
      //   full moon: h = elongation − 180
      const signed = (x: number): number => {
        const e = elongation(x);
        return crossedNew ? ((e + 180) % 360) - 180 : e - 180;
      };

      let lo = jd - 0.5;
      let hi = jd;
      let fLo = signed(lo);
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        const fMid = signed(mid);
        if ((fLo <= 0 && fMid <= 0) || (fLo >= 0 && fMid >= 0)) {
          lo = mid;
          fLo = fMid;
        } else {
          hi = mid;
        }
      }
      const syzygy = (lo + hi) / 2;

      const beta = Math.abs(moonLatitudeAt(syzygy, ayan, custom));
      const kind: EclipseKind = crossedNew ? 'solar' : 'lunar';
      const limit = kind === 'solar' ? SOLAR_LIMIT : LUNAR_LIMIT;

      if (beta <= limit) {
        const d = dateFromJD(syzygy, tz);

        // Above the horizon at the given place? Necessary, not sufficient.
        let aboveHorizon = false;
        if (opts.latitude != null && opts.longitude != null) {
          try {
            const sunT: any = calculateSolarTimes(syzygy, opts.latitude, opts.longitude, tz);
            const moonT: any = calculateLunarTimes(syzygy, opts.latitude, opts.longitude, tz);
            aboveHorizon = kind === 'solar'
              ? syzygy >= sunT.sunriseJD && syzygy <= sunT.sunsetJD
              : syzygy >= moonT.moonriseJD && syzygy <= moonT.moonsetJD;
          } catch {
            aboveHorizon = false;
          }
        }

        const depth = Math.max(0, 1 - beta / limit);
        events.push({
          kind,
          jd: syzygy,
          date: d,
          label: stamp(d),
          moonLatitude: Number(beta.toFixed(4)),
          limit,
          depth: Number(depth.toFixed(3)),
          aboveHorizon,
          description:
            `${kind === 'solar' ? 'Solar' : 'Lunar'} eclipse at ${stamp(d)}; ` +
            `the Moon stands ${beta.toFixed(2)}° from the ecliptic against a limit of ${limit}°.` +
            (opts.latitude != null
              ? aboveHorizon
                ? ' The luminary is above the horizon at this place.'
                : ' The luminary is below the horizon here, so this one is not visible locally.'
              : ''),
        });
      }
    }

    prev = cur;
  }

  return events;
}

/**
 * The classical limit note, so a reader knows what this is and is not.
 */
export const ECLIPSE_METHOD_NOTE =
  'Syzygies are found by bisecting the Sun–Moon elongation and tested against the Moon’s ' +
  'ecliptic latitude. The 1.5° and 1.0° limits are conventional; the true limit varies with ' +
  'distance. This identifies which new and full moons are eclipses and roughly how deep — it ' +
  'does not compute the shadow path, magnitude or local contact times.';
