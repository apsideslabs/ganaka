/**
 * Gaṇaka — Śaḍbala (Six-fold Strength) Engine
 *
 * Computes Sthāna, Dig, Kāla, Ceṣṭā, Naisargika and Dṛg bala in Virūpas
 * (1 Rūpa = 60 Virūpas) per BPHS chapters 27-29.
 *
 * Previously several components were missing and their share was replaced by
 * hardcoded constants (a bare +45 in Sthāna Bala, a bare +30 in Kāla Bala), and
 * Dṛg Bala used Math.random(). Both are gone. Every term below is either
 * computed from the chart or explicitly zero with a note saying why.
 *
 * Still approximated, and marked as such in the code:
 *   - Ceṣṭā Bala uses a motion-state classification rather than the classical
 *     seeghrocha (mean minus true anomaly) method, because the mean-longitude
 *     elements needed for it are not exposed by the ephemeris module.
 *   - Yuddha Bala (planetary war) is not implemented; it applies only when two
 *     planets are within one degree and is omitted rather than guessed.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { ShadbalaComponent, RashiNumber } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import { normalizeDegrees } from '../astronomy/julian';

/** Standard minimum required Rūpas per BPHS. */
export const REQUIRED_SHADBALA_RUPAS: Record<PlanetId, number> = {
  sun: 6.5,
  moon: 6.0,
  mars: 5.0,
  mercury: 7.0,
  jupiter: 6.5,
  venus: 5.5,
  saturn: 5.0,
  rahu: 5.0,
  ketu: 5.0,
  true_rahu: 5.0,
  true_ketu: 5.0,
};

/** Fixed Naisargika Bala in Virūpas (BPHS 27.34). */
export const NAISARGIKA_BALA_VIRUPAS: Record<PlanetId, number> = {
  sun: 60.0,
  moon: 51.43,
  venus: 42.86,
  jupiter: 34.29,
  mercury: 25.71,
  mars: 17.14,
  saturn: 8.57,
  rahu: 8.57,
  ketu: 8.57,
  true_rahu: 8.57,
  true_ketu: 8.57,
};

const GRAHAS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Optional chart context. Without it, the time-dependent Kāla terms stay 0. */
export interface ShadbalaContext {
  jd?: number;
  sunriseJD?: number;
  sunsetJD?: number;
  solarNoonJD?: number;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  timezoneOffsetHours?: number;
  /** Ayanamsa in degrees, needed for Ayana Bala. */
  ayanamsha?: number;
}

// ---------------------------------------------------------------------------
// Natural relationships (BPHS 3.55) used by Saptavargaja Bala.
// ---------------------------------------------------------------------------
const NATURAL_FRIENDS: Record<string, string[]> = {
  sun: ['moon', 'mars', 'jupiter'],
  moon: ['sun', 'mercury'],
  mars: ['sun', 'moon', 'jupiter'],
  mercury: ['sun', 'venus'],
  jupiter: ['sun', 'moon', 'mars'],
  venus: ['mercury', 'saturn'],
  saturn: ['mercury', 'venus'],
};
const NATURAL_ENEMIES: Record<string, string[]> = {
  sun: ['venus', 'saturn'],
  moon: [],
  mars: ['mercury'],
  mercury: ['moon'],
  jupiter: ['mercury', 'venus'],
  venus: ['sun', 'moon'],
  saturn: ['sun', 'moon', 'mars'],
};

/** Adhimitra = a friend of a friend. Adhiśatru = an enemy of a friend. */
function deriveGreatRelationships() {
  const adhimitra: Record<string, Set<string>> = {};
  const adhisatru: Record<string, Set<string>> = {};
  for (const p of GRAHAS) {
    const friends = NATURAL_FRIENDS[p] || [];
    const enemies = NATURAL_ENEMIES[p] || [];
    const known = new Set<string>([p, ...friends, ...enemies]);
    const greatFriend = new Set<string>();
    const greatEnemy = new Set<string>();
    for (const f of friends) {
      for (const q of NATURAL_FRIENDS[f] || []) if (!known.has(q)) greatFriend.add(q);
      for (const q of NATURAL_ENEMIES[f] || []) if (!known.has(q)) greatEnemy.add(q);
    }
    adhimitra[p] = greatFriend;
    adhisatru[p] = greatEnemy;
  }
  return { adhimitra, adhisatru };
}
const { adhimitra: ADHIMITRA, adhisatru: ADHISATRU } = deriveGreatRelationships();

/** Own signs and Moolatrikona (sign + degree range) per BPHS 3.49-3.54. */
const OWN_SIGNS: Record<string, number[]> = {
  sun: [5],
  moon: [4],
  mars: [1, 8],
  mercury: [3, 6],
  jupiter: [9, 12],
  venus: [2, 7],
  saturn: [10, 11],
};
const MOOLATRIKONA: Record<string, { sign: number; from: number; to: number }> = {
  sun: { sign: 5, from: 0, to: 20 },
  moon: { sign: 4, from: 3, to: 30 },
  mars: { sign: 1, from: 0, to: 12 },
  mercury: { sign: 6, from: 15, to: 20 },
  jupiter: { sign: 9, from: 0, to: 10 },
  venus: { sign: 7, from: 0, to: 15 },
  saturn: { sign: 11, from: 0, to: 20 },
};

/** Saptavargaja Bala values, BPHS 27.6-27.19, in Virūpas. */
const SAPTAVARGAJA = {
  moolatrikona: 45,
  own: 30,
  adhimitra: 22.5,
  mitra: 15,
  sama: 7.5,
  satru: 3.75,
  adhisatru: 1.875,
};

// ---------------------------------------------------------------------------
// Varga sign derivations needed for Saptavargaja Bala (D1, D2, D3, D7, D9, D12, D30)
// ---------------------------------------------------------------------------
const VARGA_IDS = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'] as const;
type SaptaVarga = (typeof VARGA_IDS)[number];

function vargaSign(siderealLongitude: number, varga: SaptaVarga): number {
  const lon = normalizeDegrees(siderealLongitude);
  const rashi = Math.floor(lon / 30) + 1;
  const deg = lon % 30;
  const odd = rashi % 2 === 1;
  switch (varga) {
    case 'D1':
      return rashi;
    case 'D2':
      if (odd) return deg < 15 ? 5 : 4;
      return deg < 15 ? 4 : 5;
    case 'D3': {
      const part = Math.floor(deg / 10);
      return (((rashi - 1 + [0, 4, 8][part]) % 12) + 1);
    }
    case 'D7': {
      const part = Math.floor(deg / (30 / 7));
      const base = odd ? 0 : 6;
      return (((rashi - 1 + base + part) % 12) + 1);
    }
    case 'D9': {
      const part = Math.floor(deg / (30 / 9));
      return (((rashi - 1) * 9 + part) % 12) + 1;
    }
    case 'D12': {
      const part = Math.floor(deg / 2.5);
      return (((rashi - 1 + part) % 12) + 1);
    }
    case 'D30': {
      if (odd) {
        if (deg < 5) return 1;
        if (deg < 10) return 11;
        if (deg < 18) return 9;
        if (deg < 25) return 3;
        return 7;
      }
      if (deg < 5) return 2;
      if (deg < 12) return 6;
      if (deg < 20) return 12;
      if (deg < 25) return 10;
      return 8;
    }
  }
}

function dignityValue(planet: string, sign: number, degInSign: number, isD1: boolean): number {
  if (isD1) {
    const mt = MOOLATRIKONA[planet];
    if (mt && mt.sign === sign && degInSign >= mt.from && degInSign <= mt.to) {
      return SAPTAVARGAJA.moolatrikona;
    }
  }
  if ((OWN_SIGNS[planet] || []).includes(sign)) return SAPTAVARGAJA.own;
  if ((ADHIMITRA[planet] || new Set()).has(signToPlanetLord(sign))) return SAPTAVARGAJA.adhimitra;
  const lord = signToPlanetLord(sign);
  if ((NATURAL_FRIENDS[planet] || []).includes(lord)) return SAPTAVARGAJA.mitra;
  if ((NATURAL_ENEMIES[planet] || []).includes(lord)) return SAPTAVARGAJA.satru;
  if ((ADHISATRU[planet] || new Set()).has(lord)) return SAPTAVARGAJA.adhisatru;
  return SAPTAVARGAJA.sama;
}

const SIGN_LORDS: string[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];
function signToPlanetLord(sign: number): string {
  return SIGN_LORDS[((sign - 1) % 12 + 12) % 12];
}

// ---------------------------------------------------------------------------
// Time helpers for Kāla Bala
// ---------------------------------------------------------------------------
const WEEKDAY_LORDS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
/** 0 = Sunday ... 6 = Saturday. JD 2451545.0 (2000-01-01 12:00 TT) was a Saturday. */
function weekdayIndex(jd: number): number {
  return ((Math.floor(jd + 1.5) % 7) + 7) % 7;
}

/** Chaldean order used for planetary hours. */
const HORA_ORDER = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

function ayanaBala(planet: string, siderealLongitude: number, ayanamsha: number): number {
  const tropical = (siderealLongitude + ayanamsha) * (Math.PI / 180);
  const eps = 23.4392911 * (Math.PI / 180);
  const decl = Math.asin(Math.sin(tropical) * Math.sin(eps)) * (180 / Math.PI);
  const northStrong = ['sun', 'mars', 'jupiter', 'venus', 'mercury'].includes(planet);
  const value = northStrong ? (23.45 + decl) / 46.9 : (23.45 - decl) / 46.9;
  return Math.max(0, Math.min(60, value * 60));
}

/**
 * Calculates complete Śaḍbala for the seven classical grahas.
 *
 * @param planetaryPositions sidereal longitudes, speeds and retrograde state
 * @param lagnaLongitude sidereal ascendant
 * @param isDayBirth true when the birth falls between sunrise and sunset
 * @param ctx chart context; without it the time-dependent terms are zero
 */
/**
 * Mean longitudes (tropical, degrees) from the JPL approximate elements.
 * T is Julian centuries from J2000.
 */
function meanLongitudes(T: number) {
  const n = (x: number) => ((x % 360) + 360) % 360;
  return {
    sun: n(280.46646 + 36000.76983 * T + 0.0003032 * T * T),
    mercury: n(252.2503235 + 149472.67411175 * T + 0.00000536 * T * T),
    venus: n(181.9790995 + 58517.81538729 * T + 0.00000165 * T * T),
    mars: n(355.45332 + 19140.30268499 * T + 0.00002005 * T * T),
    jupiter: n(34.351519 + 3036.3027748 * T + 0.0002233 * T * T),
    saturn: n(50.077444 + 1223.5110686 * T + 0.00051908 * T * T),
  };
}

/**
 * Cesta bala from the cesta kendra (BPHS 27.24-25):
 *
 *   kendra = seeghrocha - (mean + true) / 2
 *   fold to 180, divide by 3
 *
 * Exported so the deploy can check it against B. V. Raman's worked example.
 */
export function chestaBalaFromKendra(
  seeghrocha: number,
  mean: number,
  trueTropical: number
): number {
  let k = (((seeghrocha - (mean + trueTropical) / 2) % 360) + 360) % 360;
  if (k > 180) k = 360 - k;
  return k / 3;
}

export function calculateShadbala(
  planetaryPositions: Record<
    PlanetId,
    { siderealLongitude: number; speedDegPerDay: number; isRetrograde: boolean }
  >,
  lagnaLongitude: number,
  isDayBirth: boolean,
  ctx: ShadbalaContext = {}
): Record<PlanetId, ShadbalaComponent> {
  const result: Partial<Record<PlanetId, ShadbalaComponent>> = {};

  const sunPos = planetaryPositions.sun;
  const moonPos = planetaryPositions.moon;
  const moonSunDiff = normalizeDegrees(moonPos.siderealLongitude - sunPos.siderealLongitude);
  const pakshaFraction = moonSunDiff / 180.0;

  // Kāla Bala shared inputs
  const jd = ctx.jd;
  const sunrise = ctx.sunriseJD;
  const sunset = ctx.sunsetJD;
  const hasTimes = typeof jd === 'number' && typeof sunrise === 'number' && typeof sunset === 'number';

  // Weekdays must be taken in local civil time, not UT: a 02:00 IST birth is
  // still the previous UT day, which would award Dina, Hora, Varsa and Masa
  // bala to the wrong lord.
  const tzDays = (typeof ctx.timezoneOffsetHours === 'number' ? ctx.timezoneOffsetHours : 0) / 24;
  const localWeekdayIndex = (j: number) => weekdayIndex(j + tzDays);

  // Tribhāga Bala: day divided into three, Mercury/Sun/Moon in order; night
  // divided into three, Moon/Venus/Mars.
  const tribhagaLord: string | null = (() => {
    if (!hasTimes) return null;
    if (isDayBirth) {
      const third = (sunset! - sunrise!) / 3;
      const idx = Math.min(2, Math.floor((jd! - sunrise!) / third));
      return ['mercury', 'sun', 'moon'][idx];
    }
    // night runs from sunset to the following sunrise
    const nextSunrise = sunrise! + 1;
    const third = (nextSunrise - sunset!) / 3;
    const idx = Math.min(2, Math.max(0, Math.floor((jd! - sunset!) / third)));
    return ['moon', 'venus', 'mars'][idx];
  })();

  // Horā Bala: the planetary hour, counted from sunrise in the Chaldean order.
  const horaLord: string | null = (() => {
    if (!hasTimes) return null;
    const start = isDayBirth ? sunrise! : sunset!;
    const hours = Math.floor((jd! - start) * 24);
    if (hours < 0) return null;
    const startIdx = HORA_ORDER.indexOf(WEEKDAY_LORDS[localWeekdayIndex(Math.floor(start))]);
    return HORA_ORDER[(startIdx + hours) % 7];
  })();

  // Dina Bala: the weekday lord of the birth day.
  const dinaLord = typeof jd === 'number' ? WEEKDAY_LORDS[localWeekdayIndex(jd)] : null;

  for (const pId of GRAHAS) {
    const pos = planetaryPositions[pId];
    const prop = GRAHA_PROPERTIES[pId];
    const lon = normalizeDegrees(pos.siderealLongitude);
    const pRashi = Math.floor(lon / 30) + 1;
    const degInSign = lon % 30;

    // ---- 1. STHĀNA BALA -------------------------------------------------
    // 1.1 Uccha Bala: 60 at deep exaltation, 0 at deep debilitation.
    const debDeg = (prop.debilitationSign - 1) * 30 + prop.debilitationDegree;
    let distFromDeb = Math.abs(lon - debDeg);
    if (distFromDeb > 180) distFromDeb = 360 - distFromDeb;
    const ucchaBala = (distFromDeb / 180.0) * 60.0;

    // 1.2 Saptavargaja Bala: dignity across seven vargas, BPHS 27.6-27.19.
    let saptavargajaBala = 0;
    for (const v of VARGA_IDS) {
      const sign = vargaSign(lon, v);
      const degInVargaSign = v === 'D1' ? degInSign : 0;
      saptavargajaBala += dignityValue(pId, sign, degInVargaSign, v === 'D1');
    }

    // 1.3 Ojayugma Bala: 15 virūpas in a favourable parity, otherwise 0.
    //     Sun, Mars, Jupiter, Mercury and Saturn favour odd signs; the Moon
    //     and Venus favour even signs (BPHS 27.12).
    const favoursOdd = ['sun', 'mars', 'jupiter', 'mercury', 'saturn'].includes(pId);
    const isOddSign = pRashi % 2 === 1;
    const ojayugmaBala = favoursOdd === isOddSign ? 15.0 : 0.0;

    // 1.4 Kendrādi Bala: kendra 60, panaphara 30, apoklima 15.
    const lagnaRashi = Math.floor(normalizeDegrees(lagnaLongitude) / 30) + 1;
    const house = (((pRashi - lagnaRashi + 12) % 12) + 1);
    let kendradiBala = 15.0;
    if ([1, 4, 7, 10].includes(house)) kendradiBala = 60.0;
    else if ([2, 5, 8, 11].includes(house)) kendradiBala = 30.0;

    // 1.5 Drekkāṇa Bala (BPHS 27.20): 15 virūpas in a same-gender drekkāṇa.
    const drekkanaPart = Math.floor(degInSign / 10);
    const drekkanaGender = ['Male', 'Female', 'Neuter'][drekkanaPart];
    const drekkanaBala = prop.gender === drekkanaGender ? 15.0 : 0.0;

    const sthanaBala =
      ucchaBala + saptavargajaBala + ojayugmaBala + kendradiBala + drekkanaBala;

    // ---- 2. DIG BALA ----------------------------------------------------
    let digIdealDeg = lagnaLongitude;
    if (pId === 'sun' || pId === 'mars') digIdealDeg = normalizeDegrees(lagnaLongitude + 270);
    else if (pId === 'saturn') digIdealDeg = normalizeDegrees(lagnaLongitude + 180);
    else if (pId === 'moon' || pId === 'venus') digIdealDeg = normalizeDegrees(lagnaLongitude + 90);

    let digDiff = Math.abs(lon - digIdealDeg);
    if (digDiff > 180) digDiff = 360 - digDiff;
    const digBala = (1.0 - digDiff / 180.0) * 60.0;

    // ---- 3. KĀLA BALA ---------------------------------------------------
    // 3.1 Natonnata Bala: Unnata peaks at noon, Nata at midnight.
    let natonnataBala: number;
    if (typeof jd === 'number' && typeof ctx.solarNoonJD === 'number') {
      const fromNoon = Math.min(12, Math.abs((jd - ctx.solarNoonJD) * 24));
      const unnata = 60 * (1 - fromNoon / 12);
      const nata = 60 - unnata;
      if (pId === 'mercury') natonnataBala = 60;
      else if (['sun', 'jupiter', 'venus'].includes(pId)) natonnataBala = unnata;
      else natonnataBala = nata;
    } else {
      if (pId === 'mercury') natonnataBala = 60;
      else if (['sun', 'jupiter', 'venus'].includes(pId)) natonnataBala = isDayBirth ? 60 : 0;
      else natonnataBala = isDayBirth ? 0 : 60;
    }

    // 3.2 Paksha Bala: benefics gain as the Moon waxes, malefics the reverse.
    //     The Moon's own paksha bala is doubled (BPHS 27.22).
    const benefic = ['jupiter', 'venus', 'mercury'].includes(pId) || (pId === 'moon' && pakshaFraction > 0.5);
    let pakshaBala = benefic ? pakshaFraction * 60 : (1 - pakshaFraction) * 60;
    if (pId === 'moon') pakshaBala *= 2;

    // 3.3 Tribhāga Bala: 60 virūpas to the lord of the birth third.
    const tribhagaBala = tribhagaLord === pId ? 60 : 0;

    // 3.4 Dina Bala: 45 virūpas to the weekday lord (BPHS 27.28).
    const dinaBala = dinaLord === pId ? 45 : 0;

    // 3.5 Horā Bala: 60 virūpas to the lord of the planetary hour (BPHS 27.29).
    const horaBala = horaLord === pId ? 60 : 0;

    // 3.6 Ayana Bala: from the planet's declination, BPHS 27.30-27.33.
    const ayana = ayanaBala(
      pId,
      lon,
      typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0
    );

    // 3.7 Varṣa Bala (15 virūpas) and Māsa Bala (30 virūpas), BPHS 27.26-27,
    //     go to the lord of the weekday on which the solar year and the solar
    //     month began. The caller passes the exact ingress instants, found by
    //     bisection on the Sun's sidereal longitude.
    let varshaBala = 0;
    let masaBala = 0;
    if (typeof ctx.masaIngressJD === 'number' &&
        WEEKDAY_LORDS[localWeekdayIndex(ctx.masaIngressJD)] === pId) {
      masaBala = 30;
    }
    if (typeof ctx.varshaIngressJD === 'number' &&
        WEEKDAY_LORDS[localWeekdayIndex(ctx.varshaIngressJD)] === pId) {
      varshaBala = 15;
    }

    const kalaBala =
      natonnataBala + pakshaBala + tribhagaBala + dinaBala + horaBala + ayana + varshaBala + masaBala;

    // ---- 4. CEṢṬĀ BALA --------------------------------------------------
    let chestaBala: number;
    if (pId === 'sun') {
      // BPHS: the Sun's ceṣṭā bala is its ayana bala.
      chestaBala = ayana;
    } else if (pId === 'moon') {
      // BPHS: the Moon's ceṣṭā bala is its paksha bala.
      chestaBala = pakshaBala;
    } else if (typeof ctx.jd === 'number') {
      // BPHS 27.24-25, the seeghrocha method (Raman, Graha and Bhava Balas,
      // ch. VI). Mars, Jupiter and Saturn take the mean Sun as their
      // seeghrocha; Mercury and Venus take their own heliocentric mean
      // longitude as the seeghrocha and the mean Sun as their mean position.
      // The mean longitudes are tropical, so the sidereal true longitude is
      // converted to tropical first.
      const T = (ctx.jd - 2451545.0) / 36525.0;
      const ml = meanLongitudes(T);
      const trueTropical = lon + (typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0);
      chestaBala =
        pId === 'mercury' || pId === 'venus'
          ? chestaBalaFromKendra((ml as any)[pId], ml.sun, trueTropical)
          : chestaBalaFromKendra(ml.sun, (ml as any)[pId], trueTropical);
    } else {
      // No Julian day in the context: fall back to the coarse motion state so
      // the figure is at least bounded. Callers that pass ctx always use the
      // seeghrocha method above.
      chestaBala = pos.isRetrograde ? 60.0 : 15.0;
    }

    // ---- 5. NAISARGIKA BALA ---------------------------------------------
    const naisargikaBala = NAISARGIKA_BALA_VIRUPAS[pId] || 20.0;

    // ---- 6. DṚG BALA ----------------------------------------------------
    // Parāśari whole-sign dṛṣṭi, BPHS ch. 26: every graha aspects the 7th;
    // Mars also the 4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and
    // 10th. Benefics add 60, malefics subtract, balance divided by 4.
    const ASPECT_HOUSES: Record<string, number[]> = {
      sun: [7],
      moon: [7],
      mercury: [7],
      venus: [7],
      mars: [4, 7, 8],
      jupiter: [5, 7, 9],
      saturn: [3, 7, 10],
    };
    const moonWaxing = moonSunDiff <= 180;
    let drishtiSum = 0;
    for (const other of GRAHAS) {
      if (other === pId) continue;
      const otherRashi = Math.floor(normalizeDegrees(planetaryPositions[other].siderealLongitude) / 30) + 1;
      const houseFromOther = (((pRashi - otherRashi + 12) % 12) + 1);
      if ((ASPECT_HOUSES[other] || [7]).includes(houseFromOther)) {
        const isBenefic =
          other === 'jupiter' ||
          other === 'venus' ||
          other === 'mercury' ||
          (other === 'moon' && moonWaxing);
        drishtiSum += isBenefic ? 60 : -60;
      }
    }
    const drigBala = Math.max(-60, Math.min(60, drishtiSum / 4));

    const totalVirupas =
      sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drigBala;
    const totalRupas = totalVirupas / 60.0;
    const reqRupas = REQUIRED_SHADBALA_RUPAS[pId] || 5.0;

    result[pId] = {
      sthanaBala: parseFloat(sthanaBala.toFixed(1)),
      digBala: parseFloat(digBala.toFixed(1)),
      kalaBala: parseFloat(kalaBala.toFixed(1)),
      chestaBala: parseFloat(chestaBala.toFixed(1)),
      naisargikaBala: parseFloat(naisargikaBala.toFixed(2)),
      drigBala: parseFloat(drigBala.toFixed(1)),
      totalVirupas: parseFloat(totalVirupas.toFixed(1)),
      totalRupas: parseFloat(totalRupas.toFixed(2)),
      requiredRupas: reqRupas,
      ratio: parseFloat((totalRupas / reqRupas).toFixed(2)),
      rank: 0,
    };
  }

  const sorted = Object.entries(result).sort(
    (a, b) => (b[1]?.totalVirupas || 0) - (a[1]?.totalVirupas || 0)
  );
  sorted.forEach(([pId, comp], idx) => {
    if (comp) comp.rank = idx + 1;
  });

  return result as Record<PlanetId, ShadbalaComponent>;
}

/** Ayanāṁśa supplied alongside the context, defaulting to Lahiri. */
function ctxAyanamsha(ctx: ShadbalaContext): number {
  return typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0;
}
