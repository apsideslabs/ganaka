/**
 * Gaṇaka — Reverse Pañcāṅga (chart finder).
 *
 * The forward engine answers "what was the pañcāṅga at this moment". This
 * answers the question an astrologer actually asks when fixing a muhūrta or
 * rectifying a birth time: "when in this span does a given combination occur".
 *
 * It is a transition solver, not a sampler. The earlier version stepped through
 * the range at a fixed interval and reported each sample that happened to
 * satisfy the criteria — slow (a full ephemeris call every thirty minutes) and
 * it returned instants rather than windows. This one walks the range at a step
 * wide enough that no limb can be missed, finds where the match flips, and
 * bisects each flip to the second. What comes back is a window with a start and
 * an end, which is what a muhūrta search actually needs.
 *
 * The four lunar limbs are derived straight from the Sun and Moon longitudes —
 * tithi from their separation in 12° steps, nakṣatra from the Moon in 13°20′,
 * yoga from their sum in 13°20′, karaṇa from the separation in 6° — so the scan
 * does not build a whole pañcāṅga object per step.
 *
 * The slowest limb sets the step. Karaṇa is the shortest at about 11h48m, so a
 * two-hour step cannot skip one. The lagna changes sign about every two hours,
 * so a lagna search tightens to ten minutes.
 */
import type { RashiNumber } from '../jyotisha/types';
import type { AyanamshaType } from '../astronomy/ayanamsha';
import { calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateJulianDay } from '../astronomy/julian';
import { calculatePanchanga } from '../jyotisha/panchanga';
import { calculateAscendant } from '../jyotisha/houses';
import { RASHIS } from '../jyotisha/constants';

export interface PanchangaSearchCriteria {
  /** 1–30 (tithi index, 1 = Śukla Pratipadā). */
  tithi?: number;
  /** 1–27. */
  nakshatra?: number;
  /** 1–27 nitya yoga. */
  yoga?: number;
  /** 1–60 karana. */
  karana?: number;
  /** 0 = Sunday … 6 = Saturday. */
  vara?: number;
  /** 1–12 rising sign. */
  lagnaRashi?: number;
  /** Restrict to one fortnight. */
  paksha?: 'shukla' | 'krishna';
}

export interface PanchangaWindow {
  /** Julian Day the window opens. */
  startJD: number;
  /** Julian Day it closes; equal to startJD when the span ends the range. */
  endJD: number;
  start: { year: number; month: number; day: number; hour: number; minute: number };
  end: { year: number; month: number; day: number; hour: number; minute: number };
  /** Human-readable span, e.g. "3 Mar 21:40 → 4 Mar 21:20". */
  label: string;
  tithiName: string;
  tithiNumber: number;
  nakshatraName: string;
  nakshatraNumber: number;
  yogaName: string;
  karanaName: string;
  varaName: string;
  lagnaRashi: RashiNumber;
  lagnaName: string;
  /** Duration in hours. */
  hours: number;
}

export interface PanchangaSearchOptions {
  from: { year: number; month: number; day: number };
  to: { year: number; month: number; day: number };
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  /** Cap on returned windows. Default 60. */
  maxResults?: number;
  ayanamshaType?: AyanamshaType;
  customAyanamshaValue?: number;
}

const NAK_SPAN = 360 / 27;
const TITHI_SPAN = 12;
const KARANA_SPAN = 6;

/** Julian Day to a civil date-time in a given timezone offset. */
function jdToLocal(jd: number, tzHours: number) {
  const local = jd + tzHours / 24;
  const z = Math.floor(local + 0.5);
  const frac = local + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const secs = Math.round(frac * 86400);
  return {
    year, month, day,
    hour: Math.floor(secs / 3600) % 24,
    minute: Math.floor(secs / 60) % 60,
  };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function stamp(d: ReturnType<typeof jdToLocal>): string {
  return `${d.day} ${MONTHS[d.month - 1]} ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`;
}

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** The four lunar limbs, straight from the two longitudes. */
function lunarLimbs(sunLon: number, moonLon: number) {
  const sep = norm(moonLon - sunLon);
  const sum = norm(moonLon + sunLon);
  return {
    tithi: Math.floor(sep / TITHI_SPAN) + 1,      // 1–30
    nakshatra: Math.floor(norm(moonLon) / NAK_SPAN) + 1, // 1–27
    yoga: Math.floor(sum / NAK_SPAN) + 1,          // 1–27
    karana: Math.floor(sep / KARANA_SPAN) + 1,     // 1–60
  };
}

/**
 * Does the moment satisfy every criterion? Returns null when a criterion needs
 * a value this function does not compute (vāra and lagna are handled by the
 * caller, which has the location).
 */
function matchesLunar(
  criteria: PanchangaSearchCriteria,
  limbs: ReturnType<typeof lunarLimbs>
): boolean {
  if (criteria.tithi != null && limbs.tithi !== criteria.tithi) return false;
  if (criteria.nakshatra != null && limbs.nakshatra !== criteria.nakshatra) return false;
  if (criteria.yoga != null && limbs.yoga !== criteria.yoga) return false;
  if (criteria.karana != null && limbs.karana !== criteria.karana) return false;
  if (criteria.paksha != null) {
    const isShukla = limbs.tithi >= 1 && limbs.tithi <= 15;
    if (criteria.paksha === 'shukla' && !isShukla) return false;
    if (criteria.paksha === 'krishna' && isShukla) return false;
  }
  return true;
}

/**
 * Search a date range and return the windows that satisfy the criteria.
 */
export function searchPanchanga(
  criteria: PanchangaSearchCriteria,
  opts: PanchangaSearchOptions
): PanchangaWindow[] {
  const ayan: AyanamshaType = (opts.ayanamshaType ?? 'lahiri') as AyanamshaType;
  const custom = opts.customAyanamshaValue ?? 0;
  const maxResults = Math.max(1, opts.maxResults ?? 60);
  const tz = opts.timezoneOffsetHours;

  // The dates the caller gives are local, so the range must open at local
  // midnight — not UT midnight, which would start the scan five and a half
  // hours late for IST and shift every reported window.
  const startJD = calculateJulianDay(opts.from.year, opts.from.month, opts.from.day, 0, 0, 0) - tz / 24;
  const endJD = calculateJulianDay(opts.to.year, opts.to.month, opts.to.day, 23, 59, 59) - tz / 24;
  if (endJD <= startJD) return [];

  const needsLagna = criteria.lagnaRashi != null;
  const needsVara = criteria.vara != null;

  // A lagna search needs sign-change resolution; the lunar limbs are all long
  // enough that a two-hour step cannot miss one.
  const stepDays = (needsLagna ? 10 : 120) / (24 * 60);

  // Bound the work so an over-wide range degrades in resolution, not in patience.
  const maxSamples = 20000;
  const samples = Math.min(maxSamples, Math.ceil((endJD - startJD) / stepDays));
  const step = (endJD - startJD) / Math.max(1, samples);

  const sunMoonAt = (jd: number) => {
    const p: any = calculateAllPlanets(jd, ayan, custom);
    return { sun: p.sun.siderealLongitude, moon: p.moon.siderealLongitude };
  };

  const varaAt = (jd: number, sun: number, moon: number): number => {
    const pan: any = calculatePanchanga(sun, moon, jd, opts.latitude, opts.longitude, tz);
    return pan?.vara?.number ?? -1;
  };

  const lagnaAt = (jd: number): RashiNumber => {
    const a: any = calculateAscendant(jd, opts.latitude, opts.longitude, ayan, custom);
    return (a?.rashiNumber ?? 1) as RashiNumber;
  };

  /** Full predicate at a moment. */
  const matches = (jd: number): boolean => {
    const { sun, moon } = sunMoonAt(jd);
    if (!matchesLunar(criteria, lunarLimbs(sun, moon))) return false;
    if (needsVara && varaAt(jd, sun, moon) !== criteria.vara) return false;
    if (needsLagna && lagnaAt(jd) !== criteria.lagnaRashi) return false;
    return true;
  };

  /**
   * The instant the verdict flips between two adjacent samples.
   *
   * The two ends disagree by construction. Bisect on "does this moment already
   * carry the far end's verdict" so the result converges on the first moment of
   * the new state. The earlier version tested the near end's verdict instead,
   * which converged on the last moment of the old state — an entry was reported
   * at the far sample rather than at the transition.
   */
  const boundary = (lo: number, hi: number): number => {
    const target = matches(hi);
    let a = lo;
    let b = hi;
    for (let i = 0; i < 14; i++) {
      const mid = (a + b) / 2;
      if (matches(mid) === target) b = mid;
      else a = mid;
    }
    return b;
  };

  const windows: PanchangaWindow[] = [];
  let cursor = startJD;
  let prev = matches(cursor);
  let windowStart = prev ? cursor : null;

  while (cursor < endJD && windows.length < maxResults) {
    const next = Math.min(endJD, cursor + step);
    const verdict = matches(next);

    if (verdict !== prev) {
      const t = boundary(cursor, next);
      if (verdict) {
        windowStart = t; // opening
      } else if (windowStart != null) {
        windows.push(buildWindow(windowStart, t, criteria, {
          sunMoonAt, lagnaAt, tz, ayan, custom, opts,
        }));
        windowStart = null;
      }
    }
    prev = verdict;
    cursor = next;
  }

  // A window still open at the end of the range closes at endJD.
  if (windowStart != null && windows.length < maxResults) {
    windows.push(buildWindow(windowStart, endJD, criteria, {
      sunMoonAt, lagnaAt, tz, ayan, custom, opts,
    }));
  }

  return windows;
}

function buildWindow(
  startJD: number,
  endJD: number,
  criteria: PanchangaSearchCriteria,
  ctx: any
): PanchangaWindow {
  // Read the labels a minute inside the window. On the boundary itself the
  // limb still carries the value it is leaving, so a Scorpio lagna window
  // would be labelled with the sign before it.
  const probe = Math.min(endJD, startJD + 1 / (24 * 60));
  const { sun, moon } = ctx.sunMoonAt(probe);
  const limbs = lunarLimbs(sun, moon);
  const pan: any = calculatePanchanga(sun, moon, startJD, ctx.opts.latitude, ctx.opts.longitude, ctx.tz);
  const lagnaRashi = (ctx.lagnaAt(probe) ?? 1) as RashiNumber;
  const s = jdToLocal(startJD, ctx.tz);
  const e = jdToLocal(endJD, ctx.tz);

  return {
    startJD,
    endJD,
    start: s,
    end: e,
    label: `${stamp(s)} → ${stamp(e)}`,
    tithiName: pan?.tithi?.name ?? '',
    tithiNumber: limbs.tithi,
    nakshatraName: pan?.nakshatra?.name ?? '',
    nakshatraNumber: limbs.nakshatra,
    yogaName: pan?.yoga?.name ?? '',
    karanaName: pan?.karana?.name ?? '',
    varaName: pan?.vara?.name ?? '',
    lagnaRashi,
    lagnaName: RASHIS[lagnaRashi]?.name ?? '',
    hours: (endJD - startJD) * 24,
  };
}

/** True when at least one criterion is set. */
export function hasCriteria(c: PanchangaSearchCriteria): boolean {
  return Object.values(c).some((v) => v != null);
}
