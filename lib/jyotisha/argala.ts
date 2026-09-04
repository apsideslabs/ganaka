/**
 * Gaṇaka — Jaimini Argalā & Virodhārgalā (Intervention & Obstruction) Engine
 * Reference: Bṛhat Parāśara Horā Śāstra Ch. 31 & Jaimini Upadeśa Sūtras 1.1.5-9
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, CalculatedPlanet } from './types';

export interface ArgalaDetail {
  houseFromLagna: number;
  argalaType: 'Primary (2nd)' | 'Primary (4th)' | 'Primary (11th)' | 'Secondary (5th)';
  argalaPlanets: PlanetId[];
  virodhaHouse: number;
  virodhaPlanets: PlanetId[];
  isObstructed: boolean;
  status: 'Effective Śubha Argalā' | 'Effective Pāpa Argalā' | 'Obstructed (Bādhita)' | 'No Argalā';
}

export function calculateHouseArgalas(
  lagnaRashi: RashiNumber,
  planets: Record<PlanetId, CalculatedPlanet>
): ArgalaDetail[] {
  const getPlanetsInHouse = (h: number): PlanetId[] => {
    return Object.values(planets)
      .filter((p) => p.house === h)
      .map((p) => p.id);
  };

  const isBenefic = (pid: PlanetId): boolean => {
    return ['jupiter', 'venus', 'mercury', 'moon'].includes(pid);
  };

  const argalaConfigs = [
    { argalaH: 2, virodhaH: 12, type: 'Primary (2nd)' as const },
    { argalaH: 4, virodhaH: 10, type: 'Primary (4th)' as const },
    { argalaH: 11, virodhaH: 3, type: 'Primary (11th)' as const },
    { argalaH: 5, virodhaH: 9, type: 'Secondary (5th)' as const },
  ];

  const results: ArgalaDetail[] = [];

  for (const cfg of argalaConfigs) {
    const aPlanets = getPlanetsInHouse(cfg.argalaH);
    const vPlanets = getPlanetsInHouse(cfg.virodhaH);

    if (aPlanets.length === 0) {
      results.push({
        houseFromLagna: cfg.argalaH,
        argalaType: cfg.type,
        argalaPlanets: [],
        virodhaHouse: cfg.virodhaH,
        virodhaPlanets: vPlanets,
        isObstructed: false,
        status: 'No Argalā',
      });
      continue;
    }

    // Obstruction rule: If planets in virodha house >= planets in argala house, it's obstructed
    const isObstructed = vPlanets.length >= aPlanets.length && vPlanets.length > 0;

    let status: ArgalaDetail['status'] = 'Obstructed (Bādhita)';
    if (!isObstructed) {
      const hasBenefic = aPlanets.some(isBenefic);
      status = hasBenefic ? 'Effective Śubha Argalā' : 'Effective Pāpa Argalā';
    }

    results.push({
      houseFromLagna: cfg.argalaH,
      argalaType: cfg.type,
      argalaPlanets: aPlanets,
      virodhaHouse: cfg.virodhaH,
      virodhaPlanets: vPlanets,
      isObstructed,
      status,
    });
  }

  return results;
}
