/**
 * Nīcabhaṅga — the cancellation of debilitation.
 *
 * Phaladīpikā 7.26–30 gives the conditions; the numbering below follows the
 * verses so a reader can check each one.
 *
 *   7.26  the lord of the debilitation sign, or the planet exalted in that
 *         sign, sits in a kendra (1/4/7/10) from the Lagna or the Moon
 *   7.27  the lord of the debilitation sign and the lord of the planet's
 *         exaltation sign occupy mutual kendras
 *   7.28  the debilitated planet is aspected by the lord of the sign it
 *         occupies — its dispositor, and specifically that lord
 *   7.30  the debilitated planet itself sits in a kendra from Lagna or Moon
 *
 * Two cautions the sources are explicit about, and this module honours:
 *
 *   1. A cancellation is NOT by itself a Rāja Yoga, and the difference has a
 *      rule. Practice — Jagannātha Horā's own guidance, and the wider
 *      commentarial tradition — adds a precondition for the rāja grade: the
 *      cancelled graha must LORD a kendra (1/4/7/10) or trikoṇa (5/9). A graha
 *      that rules only duṣṭhānas (3/6/8/11/12) has its weakness repaired and
 *      nothing more, because the houses it governs carry no rāja-yoga potential.
 *      Two further supports are recorded: whether the graha is exalted or in its
 *      own sign in the Navāṃśa (the tradition's most reliable single
 *      confirmation), and how many cancellation conditions fire.
 *
 *      So this module returns a VERDICT — 'none', 'NB' or 'NBRY' — rather than
 *      a bare boolean. NB is the cancellation; NBRY is the cancellation plus
 *      the lordship that lets it be read as royal. Daśā timing is a fourth
 *      condition and is not chart-static, so it is reported as unchecked.
 *
 *   2. When the Lagna and the Moon share a sign, a kendra from one is a kendra
 *      from the other. Counting both would inflate the tally, so the pair is
 *      collapsed to a single reference point.
 *
 * The same rules apply inside a divisional chart, using that varga's own
 * houses and its own whole-sign aspects — a graha debilitated in D-9 is judged
 * by the D-9 chart, not by the birth chart.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { GRAHA_PROPERTIES } from './constants';
import { RASHIS } from './constants';
import type { RashiNumber } from './types';

export interface BhangaCondition {
  /** Which verse or tradition the condition comes from. */
  rule: 'PD 7.26' | 'PD 7.27' | 'PD 7.28' | 'PD 7.30';
  id: string;
  label: string;
  met: boolean;
  /** What satisfied or failed it, in words. */
  detail: string;
}

export interface NeechaBhangaResult {
  planet: PlanetId;
  planetName: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  /**
   * 'none'  no cancellation condition holds
   * 'NB'    cancelled, but the graha lords no kendra or trikoṇa — the weakness
   *         is repaired and nothing more
   * 'NBRY'  cancelled AND the graha lords a kendra or trikoṇa, so the
   *         cancellation can be read as a rāja yoga
   */
  verdict: 'none' | 'NB' | 'NBRY';
  /** True when at least one condition holds. */
  cancelled: boolean;
  /** How many distinct conditions hold — more is a firmer cancellation. */
  strength: number;
  conditions: BhangaCondition[];
  /** The conditions that actually hold, named. */
  reasons: string[];
  /** The houses this graha rules, from the varga lagna. */
  ruledHouses: number[];
  /** True when it rules at least one kendra (1/4/7/10) or trikoṇa (5/9). */
  lordsKendraOrTrikona: boolean;
  /** Its dignity in the Navāṃśa, when D-9 is supplied. */
  navamsaDignity?: string;
  /** Exalted or own sign in D-9 — the tradition's strongest single confirmation. */
  navamsaConfirmed: boolean;
  /** The fourth condition, which is not chart-static. */
  dashaChecked: false;
  note: string;
}

const KENDRA = [1, 4, 7, 10];
const isKendra = (h: number | undefined) => h !== undefined && KENDRA.includes(h);

/** Whole-sign aspect houses for a graha, in the Parāśarī set. */
function aspectHouses(id: PlanetId): number[] {
  const base = [7];
  if (id === 'mars') return [...base, 4, 8];
  if (id === 'jupiter') return [...base, 5, 9];
  if (id === 'saturn') return [...base, 3, 10];
  return base;
}

/** House number of `target` as seen from `from`, 1–12. */
const houseFrom = (from: number, target: number) => (((target - from + 12) % 12) + 1);

/** Does `aspecting` cast a whole-sign aspect on the sign `targetRashi`? */
function aspectsRashi(aspecting: PlanetId, aspectingRashi: number, targetRashi: number): boolean {
  const h = houseFrom(aspectingRashi, targetRashi);
  return aspectHouses(aspecting).includes(h);
}

export interface VargaPositions {
  /** Each graha's rashi and house in this varga. */
  planets: Record<string, { rashiNumber: number; house: number }>;
  /** The varga's own lagna rashi. */
  lagnaRashi: number;
  /** House of each graha measured from the varga lagna. */
  moonHouse?: number;
  /**
   * The Navāṃśa positions, when this is a D-1 evaluation. Supplying them turns
   * on the D-9 confirmation, which practice treats as the single most reliable
   * check on whether a cancellation is real.
   */
  navamsa?: Record<string, { rashiNumber: number }>;
}

/**
 * Evaluate Nīcabhaṅga for one debilitated graha within a set of positions.
 *
 * `positions` is a varga chart (or D-1). Everything is measured from that
 * chart's own lagna and its own graha placements.
 */
export function evaluateNeechaBhanga(
  planet: PlanetId,
  positions: VargaPositions
): NeechaBhangaResult | null {
  const prop = (GRAHA_PROPERTIES as any)[planet];
  if (!prop) return null;

  const p = positions.planets[planet];
  if (!p) return null;

  const debilitationSign = prop.debilitationSign as number;
  // Only a graha actually in its debilitation sign is a candidate.
  if (p.rashiNumber !== debilitationSign) return null;

  const dispositor = RASHIS[debilitationSign as RashiNumber]?.lord as PlanetId | undefined;
  const exaltationLord = RASHIS[prop.exaltationSign as RashiNumber]?.lord as PlanetId | undefined;
  const exaltedInSign = (Object.entries(GRAHA_PROPERTIES) as any[])
    .find(([, v]) => v.exaltationSign === debilitationSign)?.[0] as PlanetId | undefined;

  const lagnaRashi = positions.lagnaRashi;
  const moonRashi = positions.planets.moon?.rashiNumber;
  const lagnaHouse = 1;
  const moonHouse = moonRashi !== undefined ? houseFrom(lagnaRashi, moonRashi) : undefined;

  // Cautions #2: if the Moon sits in the Lagna sign the two reference points
  // are the same, so the kendra test is one test, not two.
  const sameReference = moonRashi === lagnaRashi;

  /**
   * Is `graha` in a kendra from the Lagna or (distinctly) from the Moon?
   *
   * The Moon cannot be measured from itself: the house from a sign to that same
   * sign is always 1, which is a kendra, so the test would pass trivially for
   * the Moon and for anything the Moon itself is asked about. When the graha
   * being tested IS the Moon, only the Lagna reference is used.
   */
  const inKendraFromEither = (graha: PlanetId): { yes: boolean; detail: string } => {
    const gp = positions.planets[graha];
    if (!gp) return { yes: false, detail: `${graha} not placed` };
    const hLagna = houseFrom(lagnaRashi, gp.rashiNumber);
    const selfReference = graha === 'moon';
    const hMoon = moonRashi !== undefined && !selfReference ? houseFrom(moonRashi, gp.rashiNumber) : undefined;
    const yesLagna = isKendra(hLagna);
    const yesMoon = hMoon !== undefined && isKendra(hMoon);
    if (yesLagna) return { yes: true, detail: `${graha} is in kendra ${hLagna} from the Lagna` };
    if (yesMoon && !sameReference) return { yes: true, detail: `${graha} is in kendra ${hMoon} from the Moon` };
    return { yes: false, detail: `${graha} is in neither kendra (Lagna ${hLagna}${hMoon ? `, Moon ${hMoon}` : ''})` };
  };

  const conditions: BhangaCondition[] = [];

  // --- PD 7.26a: dispositor in a kendra from Lagna or Moon
  if (dispositor) {
    const r = inKendraFromEither(dispositor);
    conditions.push({
      rule: 'PD 7.26', id: 'dispositor_kendra',
      label: 'Lord of the debilitation sign in a kendra from the Lagna or Moon',
      met: r.yes, detail: r.detail,
    });
  }

  // --- PD 7.26b: the planet exalted in that sign, in a kendra
  if (exaltedInSign) {
    const r = inKendraFromEither(exaltedInSign);
    conditions.push({
      rule: 'PD 7.26', id: 'exalted_graha_kendra',
      label: 'The graha exalted in that sign in a kendra from the Lagna or Moon',
      met: r.yes, detail: r.detail,
    });
  }

  // --- PD 7.26c (translator's note): lord of the exaltation sign in a kendra
  if (exaltationLord) {
    const r = inKendraFromEither(exaltationLord);
    conditions.push({
      rule: 'PD 7.26', id: 'exaltation_lord_kendra',
      label: "Lord of the graha's exaltation sign in a kendra from the Lagna or Moon",
      met: r.yes, detail: r.detail,
    });
  }

  // --- PD 7.27: dispositor and exaltation lord in mutual kendras
  if (dispositor && exaltationLord && dispositor !== exaltationLord) {
    const dp = positions.planets[dispositor];
    const ep = positions.planets[exaltationLord];
    let met = false;
    let detail = 'the two lords are the same graha';
    if (dp && ep) {
      const h = houseFrom(dp.rashiNumber, ep.rashiNumber);
      met = isKendra(h);
      detail = `${exaltationLord} is in kendra ${h} from ${dispositor}`;
    }
    conditions.push({
      rule: 'PD 7.27', id: 'lords_mutual_kendra',
      label: 'The two lords in mutual kendras',
      met, detail,
    });
  }

  // --- PD 7.28: the debilitated graha aspected by its dispositor
  // The verse is precise: the aspect comes from the dispositor, not the
  // exaltation lord.
  if (dispositor) {
    const dp = positions.planets[dispositor];
    let met = false;
    let detail = `${dispositor} not placed`;
    if (dp) {
      met = aspectsRashi(dispositor, dp.rashiNumber, p.rashiNumber);
      detail = met
        ? `${dispositor} aspects it from ${RASHIS[dp.rashiNumber as RashiNumber]?.name ?? dp.rashiNumber}`
        : `${dispositor} does not aspect it`;
    }
    conditions.push({
      rule: 'PD 7.28', id: 'dispositor_aspect',
      label: 'The graha aspected by the lord of the sign it occupies',
      met, detail,
    });
  }

  // --- PD 7.30: the debilitated graha itself in a kendra
  {
    const hLagna = houseFrom(lagnaRashi, p.rashiNumber);
    // The Moon measured from itself is always house 1 — a degenerate kendra.
    const selfReference = planet === 'moon';
    const hMoon = moonRashi !== undefined && !selfReference ? houseFrom(moonRashi, p.rashiNumber) : undefined;
    const met = isKendra(hLagna) || (hMoon !== undefined && !sameReference && isKendra(hMoon));
    conditions.push({
      rule: 'PD 7.30', id: 'self_kendra',
      label: 'The debilitated graha itself in a kendra from the Lagna or Moon',
      met,
      detail: met
        ? `it sits in kendra ${isKendra(hLagna) ? hLagna : hMoon}`
        : `it sits in house ${hLagna} from the Lagna, not a kendra`,
    });
  }

  const reasons = conditions.filter((c) => c.met).map((c) => c.detail);

  /**
   * Which houses does this graha rule, from the varga lagna?
   *
   * A graha owns a house when it owns that house's sign. This is the
   * precondition that separates a repair from a rāja yoga.
   */
  const ruledHouses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const rashiOfHouse = (((lagnaRashi - 1) + (h - 1)) % 12) + 1;
    if (RASHIS[rashiOfHouse as RashiNumber]?.lord === planet) ruledHouses.push(h);
  }
  const lordsKendraOrTrikona = ruledHouses.some((h) => [1, 4, 5, 7, 9, 10].includes(h));

  // Navāṃśa confirmation — exalted or own sign in D-9.
  let navamsaDignity: string | undefined;
  let navamsaConfirmed = false;
  const nav = positions.navamsa?.[planet];
  if (nav) {
    if (nav.rashiNumber === prop.exaltationSign) {
      navamsaDignity = 'Exalted (Ucca)';
      navamsaConfirmed = true;
    } else if ((prop.ownSigns ?? []).includes(nav.rashiNumber)) {
      navamsaDignity = 'Own Sign (Swakshetra)';
      navamsaConfirmed = true;
    } else if (nav.rashiNumber === prop.debilitationSign) {
      navamsaDignity = 'Debilitated (Neecha)';
    } else {
      navamsaDignity = 'Neither exalted nor own';
    }
  }

  const cancelled = reasons.length > 0;
  const verdict: 'none' | 'NB' | 'NBRY' = !cancelled
    ? 'none'
    : lordsKendraOrTrikona
      ? 'NBRY'
      : 'NB';

  const note = !cancelled
    ? 'None of the Phaladīpikā 7.26–30 conditions holds, so the debilitation stands uncancelled.'
    : verdict === 'NBRY'
      ? 'Cancelled, and the graha lords a kendra or trikoṇa — so the cancellation can be read as a rāja yoga. '
        + (navamsaConfirmed
          ? 'The Navāṃśa confirms it: the graha is ' + navamsaDignity + ' there, the tradition\'s strongest single check. '
          : navamsaDignity
            ? 'The Navāṃśa does not confirm it — ' + navamsaDignity + ' there — which weakens the reading. '
            : '')
        + 'Daśā timing is the fourth condition and is not checked here.'
      : 'Cancelled, but this graha lords no kendra or trikoṇa — only duṣṭhānas. '
        + 'The weakness is repaired; the houses it governs carry no rāja-yoga potential, so this is Nīcabhaṅga and not a rāja yoga.';

  return {
    planet,
    planetName: (prop.sanskritName as string) ?? planet,
    rashiNumber: p.rashiNumber as RashiNumber,
    rashiName: RASHIS[p.rashiNumber as RashiNumber]?.name ?? '',
    verdict,
    cancelled,
    strength: reasons.length,
    conditions,
    reasons,
    ruledHouses,
    lordsKendraOrTrikona,
    navamsaDignity,
    navamsaConfirmed,
    dashaChecked: false,
    note,
  };
}

/**
 * Every debilitated graha in a set of positions, with its Nīcabhaṅga verdict.
 */
export function evaluateAllNeechaBhanga(positions: VargaPositions): NeechaBhangaResult[] {
  const out: NeechaBhangaResult[] = [];
  for (const id of Object.keys(positions.planets) as PlanetId[]) {
    const r = evaluateNeechaBhanga(id, positions);
    if (r) out.push(r);
  }
  return out;
}
