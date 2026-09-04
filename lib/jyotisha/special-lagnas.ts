/**
 * Gaṇaka — Special Lagnas & Upagrahas Engine
 * Calculates Bhāva Lagna, Horā Lagna, Ghaṭī Lagna, Śrī Lagna, Indu Lagna,
 * and classical Upagrahas (Gulika, Māndi, Dhūma, Vyatīpāta, Pariveṣa, Indracāpa, Upaketu)
 * per BPHS Chapters 5 and 25.
 */

import { normalizeDegrees, toDMS } from '../astronomy/julian';
import { RashiNumber, SpecialPoints } from './types';
import { RASHIS } from './constants';

export function calculateSpecialPoints(
  sunLongitude: number,
  moonLongitude: number,
  lagnaLongitude: number,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number,
  dayIndex: number // 0=Sun, 1=Mon, ..., 6=Sat
): SpecialPoints {
  const isDayBirth = birthJD >= sunriseJD && birthJD <= sunsetJD;
  const elapsedDaysFromSunrise = isDayBirth
    ? birthJD - sunriseJD
    : birthJD - sunsetJD;
  const elapsedGhatis = Math.max(0, elapsedDaysFromSunrise * 24.0 * 2.5); // 1 day = 60 ghatis, 1 hour = 2.5 ghatis

  // 1. Bhāva Lagna: Moves 1 sign (30°) per 1 Ghati (24 minutes)
  const bhavaLagnaLong = normalizeDegrees(sunLongitude + elapsedGhatis * 30.0);

  // 2. Horā Lagna: Moves 1 sign (30°) per 2.5 Ghatis (1 hour / 1 hora)
  const horaLagnaLong = normalizeDegrees(sunLongitude + (elapsedGhatis / 2.5) * 30.0);

  // 3. Ghaṭī Lagna: Moves 1 sign (30°) per 1 Ghati from sunrise with factor of 1.25 signs per ghati
  const ghatiLagnaLong = normalizeDegrees(sunLongitude + elapsedGhatis * 30.0 * 1.25);

  // 4. Śrī Lagna: Based on Moon's nakshatra fraction added to Lagna
  const moonNakFraction = (moonLongitude % (360.0 / 27.0)) / (360.0 / 27.0);
  const shreeLagnaLong = normalizeDegrees(lagnaLongitude + moonNakFraction * 360.0);

  // 5. Indu Lagna (Wealth Ascendant):
  // Ray values: Sun=30, Moon=16, Mars=6, Mercury=8, Jupiter=10, Venus=12, Saturn=1
  // 9th lord from Lagna rays + 9th lord from Moon rays, sum mod 12 from Moon sign.
  const rayMap: Record<string, number> = {
    sun: 30,
    moon: 16,
    mars: 6,
    mercury: 8,
    jupiter: 10,
    venus: 12,
    saturn: 1,
  };
  const lagna9thRashi = (((Math.floor(lagnaLongitude / 30) + 8) % 12) + 1) as RashiNumber;
  const moon9thRashi = (((Math.floor(moonLongitude / 30) + 8) % 12) + 1) as RashiNumber;
  const rays1 = rayMap[RASHIS[lagna9thRashi].lord] || 8;
  const rays2 = rayMap[RASHIS[moon9thRashi].lord] || 8;
  const totalRays = rays1 + rays2;
  const induOffsetSigns = (totalRays % 12) === 0 ? 12 : (totalRays % 12);
  const moonRashi = Math.floor(moonLongitude / 30) + 1;
  const induRashiNum = (((moonRashi - 1 + (induOffsetSigns - 1)) % 12) + 1) as RashiNumber;
  const induLagnaLong = (induRashiNum - 1) * 30 + (moonLongitude % 30);

  // 6. Upagrahas (calculated from Sun's longitude per BPHS Ch. 25)
  // Dhūma = Sun + 133°20' (4 signs 13°20')
  const dhoomaLong = normalizeDegrees(sunLongitude + 133.33333333333334);
  // Vyatīpāta = 360° - Dhūma
  const vyatipataLong = normalizeDegrees(360.0 - dhoomaLong);
  // Pariveṣa = Vyatīpāta + 180°
  const pariveshaLong = normalizeDegrees(vyatipataLong + 180.0);
  // Indracāpa = 360° - Pariveṣa
  const indrachapaLong = normalizeDegrees(360.0 - pariveshaLong);
  // Upaketu = Indracāpa + 16°40'
  const upaketuLong = normalizeDegrees(indrachapaLong + 16.666666666666668);

  // 7. Gulika & Māndi:
  // Gulika rises at the start of Saturn's portion of the day/night (divided into 8 parts).
  // Māndi rises at the middle of Saturn's portion.
  const gulikaDayPortions = [7, 6, 5, 4, 3, 2, 1]; // Sun..Sat day
  const gulikaNightPortions = [3, 2, 1, 7, 6, 5, 4]; // Sun..Sat night
  const port = isDayBirth ? gulikaDayPortions[dayIndex] : gulikaNightPortions[dayIndex];
  const gulikaGhatis = (port - 1) * 3.75; // 30 ghatis / 8 = 3.75 ghatis per portion
  const gulikaLong = normalizeDegrees(sunLongitude + gulikaGhatis * 30.0);
  const mandiLong = normalizeDegrees(gulikaLong + 1.875 * 15.0);

  function makePoint(deg: number) {
    const rashi = (Math.floor(deg / 30) + 1) as RashiNumber;
    const degInRashi = deg % 30;
    const dms = toDMS(deg);
    return {
      rashi,
      degreeInRashi: degInRashi,
      degreeStr: `${dms.degrees}°${dms.minutes}′ ${RASHIS[rashi].sanskritName}`,
    };
  }

  return {
    gulika: makePoint(gulikaLong),
    mandi: makePoint(mandiLong),
    dhooma: makePoint(dhoomaLong),
    vyatipata: makePoint(vyatipataLong),
    parivesha: makePoint(pariveshaLong),
    indrachapa: makePoint(indrachapaLong),
    upaketu: makePoint(upaketuLong),
    bhavaLagna: makePoint(bhavaLagnaLong),
    horaLagna: makePoint(horaLagnaLong),
    ghatiLagna: makePoint(ghatiLagnaLong),
    shreeLagna: makePoint(shreeLagnaLong),
    induLagna: makePoint(induLagnaLong),
  };
}
