/**
 * Gaṇaka — Reverse Pañcāṅga (chart finder).
 *
 * The forward engine answers "what was the pañcāṅga at this moment". This
 * answers the question an astrologer actually asks when fixing a muhūrta or
 * rectifying a birth time: "when in this span does a given combination occur".
 *
 * The search walks the range in fixed steps, evaluates the five limbs and the
 * rising sign at each, and reports the moments that satisfy every criterion
 * given. Criteria left undefined are not tested.
 *
 * Step size matters. The Moon moves about 0.55° an hour, so a nakṣatra (13°20′)
 * lasts roughly a day and a 30-minute step cannot miss one. The lagna moves a
 * sign every two hours, so a step of 30 minutes resolves it to a quarter sign.
 * Tighten the step when a lagna match must be exact.
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

export interface PanchangaMatch {
  jd: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tithiName: string;
  tithiNumber: number;
  nakshatraName: string;
  nakshatraNumber: number;
  yogaName: string;
  karanaName: string;
  varaName: string;
  lagnaRashi: RashiNumber;
  lagnaName: string;
}

export interface PanchangaSearchOptions {
  from: { year: number; month: number; day: number };
  to: { year: number; month: number; day: number };
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  /** Minutes between samples. Default 30. */
  stepMinutes?: number;
  /** Stop after this many matches. Default 50. */
  maxResults?: number;
  ayanamshaType?: AyanamshaType;
  customAyanamshaValue?: number;
}

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
  return { year, month, day, hour: Math.floor(secs / 3600) % 24, minute: Math.floor(secs / 60) % 60 };
}

function nameOf(v: any, fallback = ''): string {
  if (typeof v === 'string') return v;
  return v?.name ?? fallback;
}

/**
 * Search a date range for a pañcāṅga combination.
 */
export function searchPanchanga(
  criteria: PanchangaSearchCriteria,
  opts: PanchangaSearchOptions
): PanchangaMatch[] {
  const stepMinutes = Math.max(1, opts.stepMinutes ?? 30);
  const maxResults = Math.max(1, opts.maxResults ?? 50);
  const ayan: AyanamshaType = (opts.ayanamshaType ?? 'lahiri') as AyanamshaType;
  const custom = opts.customAyanamshaValue ?? 0;

  const startJD = calculateJulianDay(opts.from.year, opts.from.month, opts.from.day, 0, 0, 0);
  const endJD = calculateJulianDay(opts.to.year, opts.to.month, opts.to.day, 23, 59, 59);

  const stepDays = stepMinutes / (24 * 60);
  const matches: PanchangaMatch[] = [];

  for (let jd = startJD; jd <= endJD; jd += stepDays) {
    if (matches.length >= maxResults) break;

    const planets: any = calculateAllPlanets(jd, ayan, custom);
    const sunLon = planets?.sun?.siderealLongitude;
    const moonLon = planets?.moon?.siderealLongitude;
    if (sunLon == null || moonLon == null) continue;

    const pan: any = calculatePanchanga(
      sunLon, moonLon, jd,
      opts.latitude, opts.longitude, opts.timezoneOffsetHours
    );

    // Tithi index: 1–30 across both fortnights.
    const tithiNumber: number = pan?.tithi?.number ?? pan?.tithi?.index ?? 0;
    const nakNumber: number = (Math.floor(moonLon / (360 / 27)) + 1);
    const yogaNumber: number = pan?.yoga?.number ?? pan?.yoga?.index ?? 0;
    const karanaNumber: number = pan?.karana?.number ?? pan?.karana?.index ?? 0;
    const varaName: string = nameOf(pan?.vara);
    const varaIndex: number = pan?.vara?.index ?? pan?.varaIndex ?? -1;

    const isShukla = tithiNumber >= 1 && tithiNumber <= 15;

    if (criteria.tithi != null && tithiNumber !== criteria.tithi) continue;
    if (criteria.nakshatra != null && nakNumber !== criteria.nakshatra) continue;
    if (criteria.yoga != null && yogaNumber !== criteria.yoga) continue;
    if (criteria.karana != null && karanaNumber !== criteria.karana) continue;
    if (criteria.vara != null && varaIndex !== criteria.vara) continue;
    if (criteria.paksha != null) {
      if (criteria.paksha === 'shukla' && !isShukla) continue;
      if (criteria.paksha === 'krishna' && isShukla) continue;
    }

    const lagna: any = calculateAscendant(jd, opts.latitude, opts.longitude, ayan, custom);
    const lagnaRashi = (lagna?.rashiNumber ?? 1) as RashiNumber;
    if (criteria.lagnaRashi != null && lagnaRashi !== criteria.lagnaRashi) continue;

    const civil = jdToLocal(jd, opts.timezoneOffsetHours);
    matches.push({
      jd,
      ...civil,
      tithiName: nameOf(pan?.tithi),
      tithiNumber,
      nakshatraName: nameOf(pan?.nakshatra),
      nakshatraNumber: nakNumber,
      yogaName: nameOf(pan?.yoga),
      karanaName: nameOf(pan?.karana),
      varaName,
      lagnaRashi,
      lagnaName: RASHIS[lagnaRashi]?.name ?? '',
    });
  }

  return matches;
}
