/**
 * Gaṇaka — Bhāva Bala (भाव बल), house strength.
 *
 * Reference: Bṛhat Parāśara Horā Śāstra 27.26–31 (numbered 28 in some editions).
 *
 * The classical method, in the order the verses give it:
 *
 *   1. Bhāva Dig Bala — the sign the bhāva falls in picks a reference angle
 *      (ascendant, 4th, 7th or 10th cusp). Measure the arc from that angle to
 *      the bhāva madhya; if it exceeds six signs take it from twelve, so the
 *      arc is never over 180°. Divide the degrees by three. A bhāva on its
 *      reference angle scores 0, the one opposite scores 60 virūpas.
 *
 *   2. Aspect adjustment — a benefic dṛṣṭi adds a quarter, a malefic one
 *      removes a quarter. If Jupiter or Mercury aspect the bhāva, their own
 *      dṛg bala is added as well.
 *
 *   3. Bhavādhipati Bala — the śaḍbala of the lord of the bhāva is added.
 *
 *   4. Special rules (27.30–31) — a bhāva holding Jupiter or Mercury gains a
 *      rūpa, one holding Saturn, Mars or the Sun loses a rūpa. Fifteen virūpas
 *      go to Śīrṣodaya signs on a day birth, to Ubhayodaya signs at twilight,
 *      and to Pṛṣṭhodaya signs on a night birth.
 *
 * The result is in virūpas, sixty to a rūpa, as the texts give it.
 */
import type { JyotishaChart, BhavaCusp, PlanetId, RashiNumber } from '../jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '../jyotisha/constants';

const VIRUPAS_PER_RUPA = 60;

/** Grahas that are benefic for the dṛṣṭi quarter-adjustment. */
const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];

/**
 * Śīrṣodaya, Pṛṣṭhodaya and Ubhayodaya signs (BPHS ch. 3).
 * Head-first risers, hind-first risers, and those that rise with both.
 */
const SHIRSHODAYA: RashiNumber[] = [3, 6, 7, 8, 11]; // Mithuna, Kanyā, Tulā, Vṛścika, Kumbha
const PRISHTHODAYA: RashiNumber[] = [1, 2, 4, 9, 10]; // Meṣa, Vṛṣabha, Karka, Dhanu, Makara
const UBHAYODAYA: RashiNumber[] = [5, 12]; // Siṃha, Mīna

export interface BhavaBalaComponents {
  /** Directional strength from the sign-group rule, 0–60 virūpas. */
  digBala: number;
  /** Signed aspect adjustment, ±25% of dig bala plus Jupiter/Mercury dṛg bala. */
  drigAdjustment: number;
  /** Śaḍbala of the bhāva's lord. */
  adhipatiBala: number;
  /** Occupancy rule: +1 rūpa for Jupiter/Mercury, −1 for Saturn/Mars/Sun. */
  occupancyAdjustment: number;
  /** 15 virūpas for the rising-class match with the time of birth. */
  dayNightAdjustment: number;
  /** Sum of the above. */
  totalVirupas: number;
  totalRupas: number;
}

export interface BhavaBalaResult extends BhavaBalaComponents {
  houseNumber: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  /** Which reference angle the sign group selected. */
  referenceAngle: 'ascendant' | 'nadir' | 'descendant' | 'meridian';
  lord: PlanetId;
  lordName: string;
  /** Grahas casting dṛṣṭi on this bhāva. */
  aspectingPlanets: PlanetId[];
  beneficAspects: PlanetId[];
  maleficAspects: PlanetId[];
  /** Occupants of the bhāva. */
  planetsInHouse: PlanetId[];
  rank: number;
}

/** Normalise an angle difference into (−180, 180]. */
function signedDelta(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

/**
 * Pick the reference angle for a bhāva from the sign it occupies (BPHS 27.26–27).
 * Sagittarius and Capricorn are split at 15°; every other sign sits whole in
 * one group.
 */
function referenceAngleFor(
  rashiNumber: RashiNumber,
  degreeInRashi: number
): 'ascendant' | 'nadir' | 'descendant' | 'meridian' {
  const firstHalf = degreeInRashi < 15;

  // Ascendant group — Cancer, Scorpio
  if (rashiNumber === 4 || rashiNumber === 8) return 'ascendant';

  // Descendant group — Virgo, Gemini, Libra, Aquarius, first half of Sagittarius
  if ([6, 3, 7, 11].includes(rashiNumber)) return 'descendant';
  if (rashiNumber === 9 && firstHalf) return 'descendant';

  // Meridian group — second half of Capricorn, Pisces
  if (rashiNumber === 10 && !firstHalf) return 'meridian';
  if (rashiNumber === 12) return 'meridian';

  // Nadir group — Aries, Taurus, Leo, first half of Capricorn, second half of Sagittarius
  return 'nadir';
}

/**
 * Whether a graha casts rāśi dṛṣṭi on a given sign, using its own aspect
 * distances (7th for all, plus 4/8 for Mars, 5/9 for Jupiter, 3/10 for Saturn).
 */
function aspectsRashi(
  fromRashi: RashiNumber,
  planet: PlanetId,
  targetRashi: RashiNumber
): boolean {
  const distances = GRAHA_PROPERTIES[planet]?.aspectDistances ?? [7];
  return distances.some((d) => ((fromRashi - 1 + d - 1) % 12) + 1 === targetRashi);
}

export interface BhavaBalaOptions {
  /** Julian Day of birth, to place it in day, night or twilight. */
  birthJD?: number;
}

/**
 * Compute Bhāva Bala for all twelve houses.
 */
export function calculateBhavaBala(
  chart: JyotishaChart,
  opts: BhavaBalaOptions = {}
): Record<number, BhavaBalaResult> {
  const bhavas = chart.bhavas as unknown as BhavaCusp[];
  if (!bhavas || bhavas.length < 12) return {};

  /**
   * Reference angles: the four kendras themselves.
   *
   * BPHS 27.26 names the ascendant, the descendant, the meridian and the nadir —
   * the real points, not the centres of the houses that carry them. Reading them
   * off the bhāva madhyas is exact only under Sripati, where the cusp IS the
   * madhya; under whole-sign houses it put the meridian and nadir out by eight
   * degrees on this chart, which is 2.7 virūpas on every bhāva in those two
   * groups. The chart's own angles are used when present.
   */
  const angles: any = (chart as any).angles ?? {};
  const ascendant = typeof chart.lagna?.siderealLongitude === 'number'
    ? chart.lagna.siderealLongitude
    : bhavas[0].midDegree;
  const seventh = typeof angles.descendant === 'number'
    ? angles.descendant
    : bhavas[6].midDegree;
  const tenth = typeof angles.mc === 'number'
    ? angles.mc
    : bhavas[9].midDegree;
  const fourth = typeof angles.ic === 'number'
    ? angles.ic
    : bhavas[3].midDegree;

  const refLon = {
    ascendant,
    nadir: fourth,
    descendant: seventh,
    meridian: tenth,
  } as const;

  // Day / night / twilight, for the rising-class adjustment.
  const sunTimes: any = (chart.panchanga as any)?.sunTimes;
  const jd = opts.birthJD ?? (chart.meta as any)?.julianDay;
  let phase: 'day' | 'night' | 'twilight' = 'day';
  if (sunTimes?.sunriseJD != null && sunTimes?.sunsetJD != null && jd != null) {
    const dawn = sunTimes.sunriseJD;
    const dusk = sunTimes.sunsetJD;
    const twilightSpan = 0.5 / 24; // 30 minutes either side
    if (jd >= dawn + twilightSpan && jd <= dusk - twilightSpan) phase = 'day';
    else if (jd < dawn - twilightSpan || jd > dusk + twilightSpan) phase = 'night';
    else phase = 'twilight';
  }

  const out: Record<number, BhavaBalaResult> = {};

  for (const bhava of bhavas) {
    const midLon = bhava.midDegree;
    const rashiNumber = bhava.rashiNumber as RashiNumber;
    const degreeInRashi = ((midLon % 360) + 360) % 360 % 30;

    // --- 1. Bhāva Dig Bala ------------------------------------------------
    const ref = referenceAngleFor(rashiNumber, degreeInRashi);
    const arc = Math.abs(signedDelta(midLon, refLon[ref])); // 0–180
    const digBala = arc / 3; // 0–60 virūpas

    // --- 2. Aspect adjustment --------------------------------------------
    const aspecting: PlanetId[] = [];
    const benefic: PlanetId[] = [];
    const malefic: PlanetId[] = [];
    let drigAdjustment = 0;

    for (const p of Object.keys(chart.planets) as PlanetId[]) {
      const pos: any = (chart.planets as any)[p];
      if (!pos) continue;
      if (!aspectsRashi(pos.rashiNumber as RashiNumber, p, rashiNumber)) continue;
      aspecting.push(p);
      if (BENEFICS.includes(p)) benefic.push(p);
      else malefic.push(p);
    }

    if (benefic.length > 0) drigAdjustment += digBala * 0.25;
    if (malefic.length > 0) drigAdjustment -= digBala * 0.25;

    // Jupiter and Mercury contribute their own dṛg bala on top.
    for (const p of ['jupiter', 'mercury'] as PlanetId[]) {
      if (!aspecting.includes(p)) continue;
      const sb: any = (chart.shadbala as any)?.[p];
      if (sb?.drigBala) drigAdjustment += sb.drigBala;
    }

    // --- 3. Bhavādhipati Bala --------------------------------------------
    const lord = RASHIS[rashiNumber]?.lord as PlanetId;
    const lordShadbala: any = (chart.shadbala as any)?.[lord];
    const adhipatiBala = lordShadbala?.totalVirupas ?? 0;

    // --- 4. Special rules (27.30–31) --------------------------------------
    const occupants = (bhava.planetsInHouse ?? []) as PlanetId[];
    let occupancyAdjustment = 0;
    if (occupants.includes('jupiter') || occupants.includes('mercury')) {
      occupancyAdjustment += VIRUPAS_PER_RUPA;
    }
    if (occupants.includes('saturn') || occupants.includes('mars') || occupants.includes('sun')) {
      occupancyAdjustment -= VIRUPAS_PER_RUPA;
    }

    let dayNightAdjustment = 0;
    if (phase === 'day' && SHIRSHODAYA.includes(rashiNumber)) dayNightAdjustment = 15;
    else if (phase === 'twilight' && UBHAYODAYA.includes(rashiNumber)) dayNightAdjustment = 15;
    else if (phase === 'night' && PRISHTHODAYA.includes(rashiNumber)) dayNightAdjustment = 15;

    const totalVirupas =
      digBala + drigAdjustment + adhipatiBala + occupancyAdjustment + dayNightAdjustment;

    out[bhava.houseNumber] = {
      houseNumber: bhava.houseNumber,
      rashiNumber,
      rashiName: RASHIS[rashiNumber]?.name ?? '',
      referenceAngle: ref,
      lord,
      lordName: GRAHA_PROPERTIES[lord]?.name ?? lord,
      aspectingPlanets: aspecting,
      beneficAspects: benefic,
      maleficAspects: malefic,
      planetsInHouse: occupants,
      digBala,
      drigAdjustment,
      adhipatiBala,
      occupancyAdjustment,
      dayNightAdjustment,
      totalVirupas,
      totalRupas: totalVirupas / VIRUPAS_PER_RUPA,
      rank: 0,
    };
  }

  // Rank 1 = strongest.
  const ordered = Object.values(out).sort((a, b) => b.totalVirupas - a.totalVirupas);
  ordered.forEach((r, i) => {
    out[r.houseNumber].rank = i + 1;
  });

  return out;
}
