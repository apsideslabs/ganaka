/**
 * Gaṇaka — natal attributes: number, colour, day, gem, metal and deity.
 *
 * These are the classical correspondences attached to each graha, read off the
 * chart through three lords:
 *
 *   JANMA GRAHA   the lord of the birth nakṣatra — governs the number, colour,
 *                 day and metal, which is why they are called favourable.
 *   LAGNA LORD    the gem, since remedial practice ties the gem to the lagna.
 *   CANDRA RĀŚI   the vāra and the deity of the birth star.
 *
 * Every value here is a correspondence stated in the texts, not a measurement.
 * The module labels it as an attribution so nothing downstream presents a
 * colour preference as a computed fact.
 */
import type { JyotishaChart, PlanetId } from './types';
import { GRAHA_PROPERTIES, RASHIS, NAKSHATRAS } from './constants';

export interface GrahaAttributes {
  /** Kabbalistic/Cheiro number the graha is assigned. */
  number: number;
  colour: string;
  day: string;
  metal: string;
  gem: string;
  deity: string;
  direction: string;
}

/**
 * The traditional correspondence set. These are the values in common use across
 * the Muhūrta and Ratna literature; where a text differs the difference is in
 * the wording rather than the planet.
 */
export const GRAHA_ATTRIBUTES: Record<string, GrahaAttributes> = {
  sun: { number: 1, colour: 'Copper / deep red', day: 'Sunday', metal: 'Copper', gem: 'Ruby (Māṇikya)', deity: 'Śiva / Agni', direction: 'East' },
  moon: { number: 2, colour: 'White / pearl', day: 'Monday', metal: 'Silver', gem: 'Pearl (Mauktika)', deity: 'Pārvatī / Varuṇa', direction: 'North-West' },
  jupiter: { number: 3, colour: 'Yellow / gold', day: 'Thursday', metal: 'Gold', gem: 'Yellow Sapphire (Puṣparāga)', deity: 'Brahmā / Indra', direction: 'North-East' },
  rahu: { number: 4, colour: 'Smoky grey', day: 'Saturday', metal: 'Lead', gem: 'Hessonite (Gomedha)', deity: 'Durgā', direction: 'South-West' },
  mercury: { number: 5, colour: 'Green', day: 'Wednesday', metal: 'Bronze', gem: 'Emerald (Marakata)', deity: 'Viṣṇu', direction: 'North' },
  venus: { number: 6, colour: 'White / silver', day: 'Friday', metal: 'Silver', gem: 'Diamond (Vajra)', deity: 'Lakṣmī / Indrāṇī', direction: 'South-East' },
  ketu: { number: 7, colour: 'Multi-hued / brown', day: 'Tuesday', metal: 'Mixed', gem: "Cat's Eye (Vaidūrya)", deity: 'Gaṇeśa', direction: 'South-West' },
  saturn: { number: 8, colour: 'Black / deep blue', day: 'Saturday', metal: 'Iron', gem: 'Blue Sapphire (Nīla)', deity: 'Śani / Brahmā', direction: 'West' },
  mars: { number: 9, colour: 'Red / crimson', day: 'Tuesday', metal: 'Copper', gem: 'Red Coral (Pravāla)', deity: 'Kārttikeya / Bhūmi', direction: 'South' },
};

export interface NatalAttributes {
  /** The lord of the birth nakṣatra — the graha the numbers are read from. */
  janmaGraha: PlanetId;
  janmaGrahaName: string;
  nakshatraName: string;
  /** Favourable number. */
  luckyNumber: number;
  /** The other two of the three-figure set the texts give. */
  companionNumbers: number[];
  luckyColour: string;
  luckyDay: string;
  luckyMetal: string;
  /** From the lagna lord, the way remedial practice assigns it. */
  gemstone: string;
  /** From the Moon's rāśi lord. */
  deity: string;
  direction: string;
  /** Plain statement of what these are. */
  note: string;
}

/**
 * Derive the favourable attributes from the birth nakṣatra, the lagna lord and
 * the Moon's sign lord.
 */
export function calculateNatalAttributes(chart: JyotishaChart): NatalAttributes {
  const moon: any = (chart.planets as any)?.moon;
  const moonLon = moon?.siderealLongitude ?? 0;

  const nakIndex = Math.floor((((moonLon % 360) + 360) % 360) / (360 / 27));
  const nak: any = (NAKSHATRAS as any[])[nakIndex] ?? {};
  const janmaGraha: PlanetId = (nak.lord ?? moon?.nakshatraLord ?? 'moon') as PlanetId;

  const lagnaLord: PlanetId = (RASHIS[chart.lagna.rashiNumber]?.lord ?? 'sun') as PlanetId;
  const moonRashiLord: PlanetId = (RASHIS[(moon?.rashiNumber ?? 1) as 1]?.lord ?? 'moon') as PlanetId;

  const janma = GRAHA_ATTRIBUTES[janmaGraha] ?? GRAHA_ATTRIBUTES.moon;
  const gemAttr = GRAHA_ATTRIBUTES[lagnaLord] ?? GRAHA_ATTRIBUTES.sun;
  const devaAttr = GRAHA_ATTRIBUTES[moonRashiLord] ?? GRAHA_ATTRIBUTES.moon;

  // The three-figure set the Muhūrta literature attaches to the janma graha:
  // the number itself, the graha's own day-lord number, and the sum reduced.
  const base = janma.number;
  const reduced = (a: number, b: number) => {
    let v = a + b;
    while (v > 9) v = String(v).split('').reduce((t, d) => t + Number(d), 0);
    return v;
  };

  return {
    janmaGraha,
    janmaGrahaName: GRAHA_PROPERTIES[janmaGraha]?.name ?? janmaGraha,
    nakshatraName: nak.name ?? moon?.nakshatraName ?? '',
    luckyNumber: base,
    companionNumbers: [reduced(base, 3), reduced(base, 5)],
    luckyColour: janma.colour,
    luckyDay: janma.day,
    luckyMetal: janma.metal,
    gemstone: gemAttr.gem,
    deity: devaAttr.deity,
    direction: janma.direction,
    note:
      'Traditional correspondences read from the birth nakṣatra lord, the lagna lord and the ' +
      'Moon’s sign lord. They are attributions stated in the texts, not measurements.',
  };
}
