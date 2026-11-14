/**
 * KP — cusps and the lord chain.
 *
 * KP is defined on Placidus cusps: a cusp is a calculated degree, not a sign
 * boundary. Every judgement in this module starts from these degrees, so they
 * are built here once and passed down — never read from the chart's own
 * `bhavas`, which may be whole-sign.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import { calculateHouses } from '../jyotisha/houses';
import { calculateKPPosition } from '../jyotisha/sphutas';

/** The four KP lords of any zodiacal point. */
export interface KpLords {
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  subSubLord: PlanetId;
}

export interface KpCusp {
  house: number;
  /** The cusp degree, sidereal. */
  longitude: number;
  rashi: RashiNumber;
  rashiName: string;
  degreeInRashi: number;
  lords: KpLords;
  /** Grahas whose longitude falls between this cusp and the next. */
  occupants: PlanetId[];
  fertility: string;
}

/**
 * Build the twelve Placidus cusps with their KP lord chain and occupants.
 *
 * Occupancy is decided by cusp boundaries, not by sign — a graha belongs to the
 * house whose arc contains it.
 */
export function buildKpCusps(chart: JyotishaChart): KpCusp[] {
  const positions: Record<string, { siderealLongitude: number }> = {};
  for (const [id, p] of Object.entries(chart.planets as any)) {
    positions[id] = { siderealLongitude: (p as any).siderealLongitude };
  }

  const lagna = chart.lagna.siderealLongitude;
  const mc = Number((chart as any).angles?.mc ?? ((lagna + 270) % 360));

  const bhavas = calculateHouses(lagna, mc, 'placidus' as any, positions as any) as any[];

  const planetLongitudes: Array<{ id: PlanetId; lon: number }> = [];
  for (const [id, p] of Object.entries(chart.planets as any)) {
    const lon = (p as any).siderealLongitude;
    if (typeof lon === 'number') planetLongitudes.push({ id: id as PlanetId, lon });
  }

  const cusps: KpCusp[] = bhavas.map((b, i) => {
    const cuspLon = b.midDegree;
    const kp = calculateKPPosition(cuspLon);
    const rashi = (Math.floor(cuspLon / 30) + 1) as RashiNumber;

    // Occupants: between this cusp and the next, going forward.
    const next = bhavas[(i + 1) % 12];
    const start = cuspLon;
    const end = next.midDegree;
    const occupants = planetLongitudes
      .filter(({ lon }) => {
        const within = start < end ? lon >= start && lon < end : lon >= start || lon < end;
        return within;
      })
      .map((p) => p.id);

    return {
      house: b.houseNumber ?? i + 1,
      longitude: Number(cuspLon.toFixed(4)),
      rashi,
      rashiName: RASHIS[rashi]?.name ?? '',
      degreeInRashi: Number((cuspLon % 30).toFixed(4)),
      lords: {
        signLord: kp.signLord,
        starLord: kp.starLord,
        subLord: kp.subLord,
        subSubLord: kp.subSubLord,
      },
      occupants,
      fertility: '',
    };
  });

  return cusps;
}

/** The lord of the sign on a cusp — the "cusp lord" of the texts. */
export function cuspLord(cusp: KpCusp): PlanetId {
  return RASHIS[cusp.rashi]?.lord as PlanetId;
}
