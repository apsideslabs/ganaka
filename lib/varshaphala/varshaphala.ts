/**
 * Gaṇaka — Varṣaphala (वर्षफल), the annual chart.
 *
 * The janma kuṇḍalī is cast for the moment of birth and read for the whole
 * life. Varṣaphala is cast once a year — for the instant the Sun returns to
 * its own natal sidereal longitude, the varṣapraveśa — and read for that year
 * alone.
 *
 * It is a Tājika system, the annual horoscopy that entered Indian practice
 * through Nīlakaṇṭha's *Tājika Nīlakaṇṭhī* (16th c.). Its machinery is its
 * own: the munthā, the varṣeśa, the sahams. It is not the natal chart read
 * again.
 *
 * What this module implements, and what it does not:
 *
 *   ✓ the solar-return instant, solved by bisection on the Sun's sidereal
 *     longitude to under a second
 *   ✓ the annual chart, cast for that instant at the birthplace
 *   ✓ the munthā, advancing one house a year from the natal ascendant
 *   ✓ the varṣeśa, elected by pañcavargīya bala
 *   ✓ the saham mechanism, with the two sahams whose formulas are unambiguous
 *
 *   ✗ the full saham list. Around thirty are given in the Tājika texts and
 *     their pairs differ between recensions; inventing them would be worse
 *     than omitting them.
 *   ✗ harṣala and tri-paṭākī, the Tājika aspect strengths.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from '../jyotisha/types';
import { calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateVargaRashi } from '../vargas/varga-engine';
import { calculateDignity } from '../jyotisha/dignity';
import { calculateFullJyotishaChart } from '../jyotisha/calculator';
import { RASHIS, GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { AyanamshaType } from '../astronomy/ayanamsha';
import { calculateJulianDay } from '../astronomy/julian';

const SEVEN_GRAHAS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** The five vargas of pañcavargīya bala: kṣetra, horā, drekkāṇa, navāṃśa, dvādaśāṃśa. */
const PANCAVARGA = ['D1', 'D2', 'D3', 'D9', 'D12'] as const;

export interface VarshaphalaSaham {
  key: string;
  name: string;
  sanskritName: string;
  longitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  /** House of the annual chart the saham falls in. */
  house: number;
}

export interface VarshaphalaResult {
  /** Completed years of life this chart governs; 1 for the first year. */
  yearNumber: number;
  /** Julian Day (UT) of the varṣapraveśa. */
  solarReturnJD: number;
  /** The same instant as a civil date-time, in the birthplace's timezone. */
  solarReturn: {
    year: number; month: number; day: number;
    hour: number; minute: number; second: number;
  };
  /** The natal Sun longitude the return was solved against. */
  natalSunLongitude: number;
  /** The Sun's longitude at the solved instant — should match to < 1". */
  returnSunLongitude: number;
  /** Seconds between the two; a check on the solver. */
  residualArcsec: number;

  /** The annual chart itself, cast at the birthplace. */
  chart: JyotishaChart;

  muntha: {
    /** House of the annual chart the munthā occupies. */
    house: number;
    rashiNumber: RashiNumber;
    rashiName: string;
    /** The natal house it has advanced to, 1-12. */
    natalHouse: number;
  };

  varshesha: {
    lord: PlanetId;
    lordName: string;
    sanskritName: string;
    /** Pañcavargīya bala per graha, out of 25. */
    scores: Array<{ planet: PlanetId; name: string; points: number }>;
  };

  sahams: VarshaphalaSaham[];
}

/** Normalise an angle difference into (-180, 180]. */
function signedDelta(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

/**
 * Solve for the instant the Sun returns to `targetLongitude`.
 *
 * The Sun moves between 0.953 and 1.019 degrees a day, so a fixed 365.25-day
 * step can be a day out. Bisection on the actual ephemeris converges to under
 * a second in ~50 iterations and cannot land on the wrong year, because the
 * search window is only twelve days wide.
 */
function findSolarReturn(
  targetLongitude: number,
  searchFromJD: number,
  ayanamshaType: AyanamshaType,
  customAyanamsha: number
): number {
  const sunAt = (jd: number) =>
    calculateAllPlanets(jd, ayanamshaType, customAyanamsha).sun.siderealLongitude;

  // The return happens about one sidereal year (365.256 d) after the previous
  // one. The window brackets it comfortably without spanning a second return.
  let lo = searchFromJD + 358;
  let hi = searchFromJD + 372;

  const f = (jd: number) => signedDelta(sunAt(jd), targetLongitude);

  // f(lo) < 0 < f(hi): the Sun is short of the target at lo, past it at hi.
  if (f(lo) > 0) lo = searchFromJD + 340;
  if (f(hi) < 0) hi = searchFromJD + 385;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Julian Day (UT) to a civil date-time in the given timezone offset. */
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

  const totalSeconds = Math.round(frac * 86400);
  return {
    year, month, day,
    hour: Math.floor(totalSeconds / 3600) % 24,
    minute: Math.floor(totalSeconds / 60) % 60,
    second: totalSeconds % 60,
  };
}

/**
 * Pañcavargīya bala — the Tājika strength used to elect the varṣeśa.
 *
 * Each graha is scored in five vargas (kṣetra D1, horā D2, drekkāṇa D3,
 * navāṃśa D9, dvādaśāṃśa D12) on its dignity there: 5 for own sign,
 * mūlatrikoṇa or exaltation, down to 0 for great enemy or debilitation.
 * Maximum 25.
 *
 * Sources differ on the exact weighting — some give fixed virūpas per varga
 * (30/15/10/7/5) rather than a flat scale. This uses the flat scale, which is
 * the form most often implemented, and states it here rather than pretending
 * the question is settled.
 */
function pancavargiyaBala(
  planet: PlanetId,
  chart: JyotishaChart
): number {
  const dignityPoints: Record<string, number> = {
    'Exalted (Ucca)': 5,
    Moolatrikona: 5,
    'Own Sign (Swakshetra)': 5,
    'Great Friend (Adhi Mitra)': 4,
    'Friend (Mitra)': 3,
    'Neutral (Sama)': 2,
    'Enemy (Shatru)': 1,
    'Great Enemy (Adhi Shatru)': 0,
    'Debilitated (Neecha)': 0,
  };

  let total = 0;
  for (const varga of PANCAVARGA) {
    // Every graha's position in this varga, so the compound relationship with
    // the sign lord is computed from the varga and not from the rāśi chart.
    const vargaPositions: Record<string, { siderealLongitude: number }> = {};
    for (const g of SEVEN_GRAHAS) {
      const p: any = (chart.planets as any)[g];
      if (!p) continue;
      const { rashiNumber } = calculateVargaRashi(p.siderealLongitude, varga);
      // Mid-sign, so mūlatrikoṇa edges never decide the election.
      vargaPositions[g] = { siderealLongitude: (rashiNumber - 1) * 30 + 15 };
    }
    const self = vargaPositions[planet];
    if (!self) continue;
    const dignity = calculateDignity(planet, self.siderealLongitude, vargaPositions as any);
    total += dignityPoints[dignity] ?? 2;
  }
  return total;
}

export interface VarshaphalaOptions {
  /** Completed years of life. 1 gives the first annual chart after birth. */
  yearNumber?: number;
  /** Birthplace coordinates — the annual chart is cast there, not where you are now. */
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  ayanamshaType?: AyanamshaType;
  customAyanamshaValue?: number;
  nodeType?: 'mean' | 'true';
  houseSystem?: 'equal_whole' | 'sripati' | 'placidus';
}

/**
 * Build the Varṣaphala for a given year of life.
 */
export function calculateVarshaphala(
  natalChart: JyotishaChart,
  opts: VarshaphalaOptions
): VarshaphalaResult {
  const yearNumber = Math.max(1, Math.floor(opts.yearNumber ?? 1));
  const ayanamshaType = (opts.ayanamshaType ?? 'lahiri') as AyanamshaType;
  const customAyanamsha = opts.customAyanamshaValue ?? 0;

  const b = natalChart.meta.birthDetails;
  const natalSunLongitude = natalChart.planets.sun.siderealLongitude;

  // The return for year N is roughly (N-1) sidereal years after birth.
  const birthJD = calculateJulianDay(
    b.year, b.month, b.day,
    b.hour - b.timezoneOffsetHours, b.minute, b.second
  );

  const searchFrom = birthJD + (yearNumber - 1) * 365.256363;
  const solarReturnJD = findSolarReturn(
    natalSunLongitude, searchFrom, ayanamshaType, customAyanamsha
  );

  const returnSunLongitude =
    calculateAllPlanets(solarReturnJD, ayanamshaType, customAyanamsha).sun.siderealLongitude;
  const residualArcsec = Math.abs(signedDelta(returnSunLongitude, natalSunLongitude)) * 3600;

  const solarReturn = jdToLocal(solarReturnJD, opts.timezoneOffsetHours);

  // The annual chart, cast for the return instant at the birthplace.
  const chart = calculateFullJyotishaChart({
    year: solarReturn.year,
    month: solarReturn.month,
    day: solarReturn.day,
    hour: solarReturn.hour,
    minute: solarReturn.minute,
    second: solarReturn.second,
    latitude: opts.latitude,
    longitude: opts.longitude,
    timezoneOffsetHours: opts.timezoneOffsetHours,
    locationName: b.locationName,
    ayanamshaType,
    customAyanamshaValue: customAyanamsha,
    nodeType: opts.nodeType,
    houseSystem: opts.houseSystem,
  });

  // --- munthā -----------------------------------------------------------
  // It starts in the natal ascendant and advances one sign a year.
  const natalLagnaRashi = natalChart.lagna.rashiNumber;
  const munthaLagnaHouse = ((yearNumber - 1) % 12) + 1;
  const munthaRashi = (((natalLagnaRashi - 1 + (yearNumber - 1)) % 12) + 1) as RashiNumber;
  const munthaHouse = (((munthaRashi - chart.lagna.rashiNumber + 12) % 12) + 1);

  // --- varṣeśa ----------------------------------------------------------
  const scores = SEVEN_GRAHAS.map((planet) => ({
    planet,
    name: GRAHA_PROPERTIES[planet]?.name ?? planet,
    points: pancavargiyaBala(planet, chart),
  })).sort((a, z) => z.points - a.points);

  const winner = scores[0];

  // --- sahams -----------------------------------------------------------
  // Saham = (A − B) + lagna, with A and B exchanged for a night birth. Only
  // the two whose pairs are unambiguous across the Tājika sources are given.
  const isDayBirth = (() => {
    const sun: any = chart.planets.sun;
    const h = sun.house;
    return [1, 2, 3, 4, 5, 6, 7].includes(h) && true;
  })();

  const sahamLongitude = (a: number, bLon: number) => {
    const diff = isDayBirth ? a - bLon : bLon - a;
    return ((diff + chart.lagna.siderealLongitude) % 360 + 360) % 360;
  };

  const sahamDefs = [
    { key: 'punya', name: 'Punya', sanskritName: 'पुण्य', a: chart.planets.moon.siderealLongitude, b: chart.planets.sun.siderealLongitude },
    { key: 'vidya', name: 'Vidyā', sanskritName: 'विद्या', a: chart.planets.sun.siderealLongitude, b: chart.planets.moon.siderealLongitude },
  ];

  const sahams: VarshaphalaSaham[] = sahamDefs.map((d) => {
    const longitude = sahamLongitude(d.a, d.b);
    const rashiNumber = (Math.floor(longitude / 30) + 1) as RashiNumber;
    return {
      key: d.key,
      name: d.name,
      sanskritName: d.sanskritName,
      longitude,
      rashiNumber,
      rashiName: RASHIS[rashiNumber]?.name ?? '',
      house: (((rashiNumber - chart.lagna.rashiNumber + 12) % 12) + 1),
    };
  });

  return {
    yearNumber,
    solarReturnJD,
    solarReturn,
    natalSunLongitude,
    returnSunLongitude,
    residualArcsec,
    chart,
    muntha: {
      house: munthaHouse,
      rashiNumber: munthaRashi,
      rashiName: RASHIS[munthaRashi]?.name ?? '',
      natalHouse: munthaLagnaHouse,
    },
    varshesha: {
      lord: winner.planet,
      lordName: winner.name,
      sanskritName: GRAHA_PROPERTIES[winner.planet]?.sanskritName ?? '',
      scores,
    },
    sahams,
  };
}
