/**
 * KP — constants.
 *
 * The tables KP judgement rests on. Kept in one place so a rule can be checked
 * or corrected without hunting through the engine.
 */

import type { PlanetId, RashiNumber } from '../jyotisha/types';

/**
 * Fruitful, semi-fruitful and barren signs.
 *
 * KP-Simple-Rules: "Cancer, Scorpio and Pisces are all fruitful in nature: all
 * watery signs are fruitful. Taurus, Libra, Capricorn and Sagittarius are said
 * to be semi-fruitful. Aries, Gemini, Leo and Virgo are called the barren or
 * sterile signs."
 */
export type Fertility = 'fruitful' | 'semi-fruitful' | 'barren';

export const SIGN_FERTILITY: Record<RashiNumber, Fertility> = {
  1: 'barren',          // Aries
  2: 'semi-fruitful',   // Taurus
  3: 'barren',          // Gemini
  4: 'fruitful',        // Cancer
  5: 'barren',          // Leo
  6: 'barren',          // Virgo
  7: 'semi-fruitful',   // Libra
  8: 'fruitful',        // Scorpio
  9: 'semi-fruitful',   // Sagittarius
  10: 'semi-fruitful',  // Capricorn
  11: 'barren',         // Aquarius — see note
  12: 'fruitful',       // Pisces
};

/**
 * Aquarius is a wind sign and KP counts it with the barren group alongside the
 * other airy signs, even though it is not listed by name in the rules above.
 * Stated explicitly so the departure is visible rather than buried.
 */
export const FRUITFUL_SIGNS: RashiNumber[] = [4, 8, 12];
export const SEMI_FRUITFUL_SIGNS: RashiNumber[] = [2, 7, 9, 10];
export const BARREN_SIGNS: RashiNumber[] = [1, 3, 5, 6, 11];

export function fertilityOf(rashi: RashiNumber): Fertility {
  return SIGN_FERTILITY[rashi] ?? 'barren';
}

/**
 * KP house groups for the common questions.
 *
 * The detrimental houses are the twelfth from the group, which is the rule the
 * text gives: for marriage the group is 2, 7, 11 and the detrimental houses are
 * 1, 6, 10.
 */
export interface KpMatter {
  label: string;
  /** Primary house under question. */
  primary: number;
  matter: number[];
  detrimental: number[];
}

export const KP_MATTERS: Record<string, KpMatter> = {
  marriage:   { label: 'Marriage',   primary: 7,  matter: [2, 7, 11],   detrimental: [1, 6, 10] },
  career:     { label: 'Career',     primary: 10, matter: [2, 6, 10, 11], detrimental: [1, 5, 8, 12] },
  wealth:     { label: 'Wealth',     primary: 2,  matter: [2, 6, 11],   detrimental: [5, 8, 12] },
  children:   { label: 'Children',   primary: 5,  matter: [2, 5, 11],   detrimental: [1, 4, 10] },
  property:   { label: 'Property',   primary: 4,  matter: [4, 11, 12],  detrimental: [3, 8, 9] },
  education:  { label: 'Education',  primary: 4,  matter: [4, 9, 11],   detrimental: [3, 8, 12] },
  health:     { label: 'Health',     primary: 1,  matter: [1, 5, 11],   detrimental: [6, 8, 12] },
  litigation: { label: 'Litigation', primary: 6,  matter: [6, 11],      detrimental: [5, 12] },
  foreign:    { label: 'Foreign travel', primary: 12, matter: [3, 9, 12], detrimental: [2, 4, 10] },
};

/** The seven tārā grahas that own signs. Rāhu and Ketu own none. */
export const SIGN_OWNERS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Rāhu and Ketu — treated in KP as agents of the grahas they associate with. */
export const NODES: PlanetId[] = ['rahu', 'ketu'];
