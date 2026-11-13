/**
 * Gaṇaka — Praṇapada Lagna (प्राणपद लग्न), BPHS ch. 3, vv. 71–74.
 *
 * The rule, in the translation's own words: "Convert the given time into
 * vighatikas and divide the same by 15. The resultant rāśi, degrees etc. be
 * added to Sūrya, if he is in a movable rāśi. If Sūrya is in a fixed rāśi, add
 * 240 degrees additionally, and if in a dual rāśi, add 120 degrees."
 *
 * So 15 vighaṭis make one sign and one vighaṭi is worth 2°, counted from
 * sunrise to the birth. The Sun's class adds 0°, 240° or 120°.
 *
 * The three worked examples the text itself gives, all at 16 ghaṭis 25
 * vighaṭis (= 985 vighaṭis, ÷ 15 = 65 signs 20° = 5 signs 20° after casting
 * out whole rounds, i.e. an arc of 170°):
 *
 *   Sun Aries 15°  (movable) → 15 + 170          = 185° → Libra 5°    ✓
 *   Sun Taurus 15° (fixed)   → 45 + 170 + 240    = 455° → Cancer 5°   ✓
 *   Sun Gemini 15° (dual)    → 75 + 170 + 120    = 365° → Aries 5°    ✓
 *
 * All three are exercised in the test suite.
 */
import type { RashiNumber } from './types';
import { RASHIS } from './constants';
import { normalizeDegrees } from '../astronomy/julian';

const MOVABLE: RashiNumber[] = [1, 4, 7, 10];
const FIXED: RashiNumber[] = [2, 5, 8, 11];

/** Houses from the lagna the text calls auspicious for this point. */
const FAVOURABLE_HOUSES = [2, 4, 5, 9, 10, 11];

export interface PranapadaResult {
  longitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeInRashi: number;
  degreeStr: string;
  /** The vighaṭis between sunrise and birth. */
  vighatis: number;
  /** The arc the elapsed time contributes, in degrees. */
  elapsedArc: number;
  /** The offset added for the Sun's sign class: 0, 120 or 240. */
  classOffset: number;
  /** Sun's sign class. */
  sunClass: 'movable' | 'fixed' | 'dual';
  /** House from the natal lagna. */
  houseFromLagna: number;
  /** True when the house falls in the text's favourable list. */
  isFavourable: boolean;
}

/**
 * Compute Praṇapada from the birth moment, sunrise and the Sun's longitude.
 *
 * @param sunLongitude   Sidereal longitude of the Sun at birth.
 * @param birthJD        Julian Day (UT) of birth.
 * @param sunriseJD      Julian Day (UT) of that morning's sunrise.
 * @param lagnaLongitude Sidereal longitude of the natal lagna.
 */
export function calculatePranapada(
  sunLongitude: number,
  birthJD: number,
  sunriseJD: number,
  lagnaLongitude: number
): PranapadaResult {
  // Elapsed time in vighaṭis. One ghaṭi is 24 minutes, one vighaṭi 24 seconds.
  const elapsedSeconds = Math.max(0, (birthJD - sunriseJD) * 86400);
  const vighatis = elapsedSeconds / 24;

  // Fifteen vighaṭis per sign, so one vighaṭi is 2°.
  const elapsedArc = (vighatis / 15) * 30;

  const sunRashi = (Math.floor(normalizeDegrees(sunLongitude) / 30) + 1) as RashiNumber;
  const sunClass: 'movable' | 'fixed' | 'dual' =
    MOVABLE.includes(sunRashi) ? 'movable' : FIXED.includes(sunRashi) ? 'fixed' : 'dual';
  const classOffset = sunClass === 'fixed' ? 240 : sunClass === 'dual' ? 120 : 0;

  const longitude = normalizeDegrees(sunLongitude + elapsedArc + classOffset);
  const rashiNumber = (Math.floor(longitude / 30) + 1) as RashiNumber;
  const degreeInRashi = longitude % 30;

  // Carry the seconds so 4°59′60″ displays as 5°00′00″.
  let d = Math.floor(degreeInRashi);
  let m = Math.floor((degreeInRashi - d) * 60);
  let s = Math.round((((degreeInRashi - d) * 60) - m) * 60);
  if (s >= 60) { s -= 60; m += 1; }
  if (m >= 60) { m -= 60; d += 1; }

  const lagnaRashi = (Math.floor(normalizeDegrees(lagnaLongitude) / 30) + 1) as RashiNumber;
  const houseFromLagna = ((rashiNumber - lagnaRashi + 12) % 12) + 1;

  return {
    longitude,
    rashiNumber,
    rashiName: RASHIS[rashiNumber]?.name ?? '',
    degreeInRashi,
    degreeStr: `${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″ ${RASHIS[rashiNumber]?.sanskritName ?? ''}`,
    vighatis,
    elapsedArc,
    classOffset,
    sunClass,
    houseFromLagna,
    isFavourable: FAVOURABLE_HOUSES.includes(houseFromLagna),
  };
}
