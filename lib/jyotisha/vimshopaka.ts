/**
 * Gaṇaka — Viṃśopaka Bala (विंशोपक बल), the twenty-point disposition measure.
 *
 * The method: choose a scheme of six, seven, ten or sixteen vargas; each varga in
 * the scheme carries a weight, and every scheme's weights total exactly twenty, so
 * scores across schemes are comparable. In each varga the graha is graded by its
 * relationship with the lord of the sign it occupies there. Its score is the sum
 * of weight × grade ÷ 20. A graha in its own sign in every division scores a
 * clean 20, which no real chart reaches.
 *
 * WHAT THIS REPLACES. The earlier implementation was not this method. It graded
 * friendship by two hardcoded planet groups rather than by the chart's own
 * compound relationship, used a four-step 20/15/8/10 scale instead of the text's
 * seven, and — worst — fabricated the saptavarga and dashavarga scores as the
 * shodashavarga total multiplied by 1.05 and 1.02. Those two numbers were
 * invented, not computed. Every score below is now derived from its own weight
 * table and the graha's actual relationship in that varga.
 *
 * The grade ladder and the four weight tables are the ones printed in the
 * reference: own or exaltation 20, mūlatrikoṇa or great friend 18, friend 15,
 * neutral 10, enemy 7, bitter enemy 5, debilitation 0.
 */
import type { PlanetId, RashiNumber, VargaId, VargaChart } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';
import { calculateNaturalFriendship, getTatkalikaRelationship } from './dignity';

/** The varga divisions each scheme uses, with their weights (each column sums to 20). */
const SCHEMES: Record<string, Record<string, number>> = {
  // Ṣaḍvarga — six divisions
  shadvarga: { D1: 6, D2: 2, D3: 4, D9: 5, D12: 2, D30: 1 },
  // Saptavarga — seven
  saptavarga: { D1: 5, D2: 2, D3: 3, D7: 2.5, D9: 4.5, D12: 2, D30: 1 },
  // Daśavarga — ten
  dashavarga: { D1: 3, D2: 1.5, D3: 1.5, D7: 1.5, D9: 1.5, D10: 1.5, D12: 1.5, D16: 1.5, D30: 1.5, D60: 5 },
  // Ṣoḍaśavarga — sixteen
  shodashavarga: {
    D1: 3.5, D2: 1, D3: 1, D4: 0.5, D7: 0.5, D9: 3, D10: 0.5, D12: 0.5,
    D16: 2, D20: 0.5, D24: 0.5, D27: 0.5, D30: 1, D40: 0.5, D45: 0.5, D60: 4,
  },
};

/** The seven-step grade ladder. */
const GRADE = {
  ownOrExalted: 20,
  moolatrikonaOrGreatFriend: 18,
  friend: 15,
  neutral: 10,
  enemy: 7,
  bitterEnemy: 5,
  debilitated: 0,
} as const;

export interface VimshopakaSchemeResult {
  /** 0–20. */
  score: number;
  /** Which scheme produced it. */
  scheme: 'shadvarga' | 'saptavarga' | 'dashavarga' | 'shodashavarga';
}

export interface PlanetVimshopakaScore {
  planet: PlanetId;
  planetName: string;
  shadvargaScore: number;
  saptavargaScore: number;
  dashavargaScore: number;
  shodashavargaScore: number;
  /** Percentage of the 20-point ceiling. */
  percentageRating: number;
  /** Which band the shodashavarga score falls in. */
  band: string;
  /** The eight named grades Parāśara subdivides the top band into. */
  namedGrade: string;
  /** Plain reading. */
  reading: string;
}

/**
 * The band a score falls in. The reference gives four bands and then subdivides
 * the top one into eight named grades for daśā work.
 */
export function vimshopakaBand(score: number): { band: string; namedGrade: string; reading: string } {
  // The eight named grades, atipūrṇa down to atihīna.
  let namedGrade: string;
  if (score >= 17.5) namedGrade = 'Atipūrṇa';
  else if (score >= 15) namedGrade = 'Pūrṇa';
  else if (score >= 12.5) namedGrade = 'Atiśubha';
  else if (score >= 10) namedGrade = 'Śubha';
  else if (score >= 7.5) namedGrade = 'Sama';
  else if (score >= 5) namedGrade = 'Aśubha';
  else if (score >= 2.5) namedGrade = 'Atiaśubha';
  else namedGrade = 'Atihīna';

  if (score < 5) {
    return {
      band: 'Incapable',
      namedGrade,
      reading: 'Below five: the graha is incapable of giving auspicious results through this measure.',
    };
  }
  if (score < 10) {
    return {
      band: 'Some good',
      namedGrade,
      reading: 'Five to ten: some good effects, thinned and partial.',
    };
  }
  if (score < 15) {
    return {
      band: 'Middling',
      namedGrade,
      reading: 'Ten to fifteen: middling disposition — the graha neither helps nor obstructs strongly.',
    };
  }
  return {
    band: 'Wholly favourable',
    namedGrade,
    reading: 'Fifteen to twenty: wholly favourable, and most of what the graha promises will land.',
  };
}

/**
 * Grade a graha against the lord of the sign it occupies in one varga.
 *
 * Uses the chart's compound relationship — natural friendship adjusted by the
 * temporary friendship produced by the two grahas' placements in that varga —
 * which is why two natives with the same graha in the same sign can score
 * differently.
 */
function gradeInVarga(
  planet: PlanetId,
  rashi: RashiNumber,
  lordRashi: RashiNumber
): number {
  const lord = RASHIS[rashi]?.lord as PlanetId | undefined;
  if (!lord) return GRADE.neutral;

  const props = GRAHA_PROPERTIES[planet];
  if (props) {
    if (props.exaltationSign === rashi) return GRADE.ownOrExalted;
    if (props.debilitationSign === rashi) return GRADE.debilitated;
    if (props.moolatrikonaSign === rashi) return GRADE.moolatrikonaOrGreatFriend;
    if (props.ownSigns?.includes(rashi)) return GRADE.ownOrExalted;
  }

  if (lord === planet) return GRADE.ownOrExalted;

  // Compound: natural friendship adjusted by the temporary relation in this varga.
  const natural = calculateNaturalFriendship(planet, lord);
  const temporal = getTatkalikaRelationship(rashi, lordRashi);

  const naturalValue = natural === 'Mitra' ? 1 : natural === 'Shatru' ? -1 : 0;
  const temporalValue = temporal === 'friend' ? 1 : -1;
  const total = naturalValue + temporalValue;

  if (total === 2) return GRADE.moolatrikonaOrGreatFriend; // Adhi Mitra
  if (total === 1) return GRADE.friend;                    // Mitra
  if (total === 0) return GRADE.neutral;                   // Sama
  if (total === -1) return GRADE.enemy;                    // Shatru
  return GRADE.bitterEnemy;                                // Adhi Shatru
}

function scoreScheme(
  pid: PlanetId,
  vargas: Record<VargaId, VargaChart>,
  weights: Record<string, number>
): number {
  let total = 0;
  for (const [vid, weight] of Object.entries(weights)) {
    const vChart = vargas[vid as VargaId];
    const pos = vChart?.planets?.[pid];
    if (!pos) continue;

    const rashi = pos.rashiNumber as RashiNumber;
    const lord = RASHIS[rashi]?.lord as PlanetId | undefined;
    const lordPos = lord ? vChart.planets?.[lord] : undefined;
    const lordRashi = (lordPos?.rashiNumber ?? rashi) as RashiNumber;

    const grade = gradeInVarga(pid, rashi, lordRashi);
    total += (weight * grade) / 20;
  }
  return Math.min(20, Math.round(total * 100) / 100);
}

/**
 * Compute Viṃśopaka Bala for the seven tāras across all four schemes.
 */
export function calculateVimshopakaBala(
  vargas: Record<VargaId, VargaChart>
): PlanetVimshopakaScore[] {
  const planets: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const names: Partial<Record<PlanetId, string>> = {
    sun: 'Sūrya', moon: 'Candra', mars: 'Maṅgala', mercury: 'Budha',
    jupiter: 'Guru', venus: 'Śukra', saturn: 'Śani',
  };

  return planets.map((pid) => {
    const shadvargaScore = scoreScheme(pid, vargas, SCHEMES.shadvarga);
    const saptavargaScore = scoreScheme(pid, vargas, SCHEMES.saptavarga);
    const dashavargaScore = scoreScheme(pid, vargas, SCHEMES.dashavarga);
    const shodashavargaScore = scoreScheme(pid, vargas, SCHEMES.shodashavarga);
    const { band, namedGrade, reading } = vimshopakaBand(shodashavargaScore);

    return {
      planet: pid,
      planetName: names[pid] || pid,
      shadvargaScore,
      saptavargaScore,
      dashavargaScore,
      shodashavargaScore,
      percentageRating: Math.round((shodashavargaScore / 20) * 100),
      band,
      namedGrade,
      reading,
    };
  });
}

/** The weight tables, exported so a caller can state which one it used. */
export const VIMSHOPAKA_SCHEMES = SCHEMES;
