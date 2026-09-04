/**
 * Gaṇaka — Parāśari Viṃśopakā Bala (20-Point Divisional Strength) Engine
 * Reference: Bṛhat Parāśara Horā Śāstra, Ch. 45 (Viṃśopaka Bala)
 */

import { PlanetId } from '../astronomy/ephemeris';
import { VargaId, VargaChart, RashiNumber } from './types';
import { RASHIS } from './constants';

export interface PlanetVimshopakaScore {
  planet: PlanetId;
  planetName: string;
  shadvargaScore: number; // Max 20
  saptavargaScore: number; // Max 20
  dashavargaScore: number; // Max 20
  shodashavargaScore: number; // Max 20
  percentageRating: number;
}

// Classical Parāśari weight factors for Ṣoḍaśavarga (summing to 20):
// D1 (3.5), D2 (1.0), D3 (1.0), D4 (0.5), D7 (0.5), D9 (3.0), D10 (0.5), D12 (0.5),
// D16 (2.0), D20 (0.5), D24 (0.5), D27 (0.5), D30 (1.0), D40 (0.5), D45 (0.5), D60 (4.0)
const SHODASHAVARGA_WEIGHTS: Record<VargaId, number> = {
  D1: 3.5,
  D2: 1.0,
  D3: 1.0,
  D4: 0.5,
  D7: 0.5,
  D9: 3.0,
  D10: 0.5,
  D12: 0.5,
  D16: 2.0,
  D20: 0.5,
  D24: 0.5,
  D27: 0.5,
  D30: 1.0,
  D40: 0.5,
  D45: 0.5,
  D60: 4.0,
};

export function calculateVimshopakaBala(
  vargas: Record<VargaId, VargaChart>
): PlanetVimshopakaScore[] {
  const planetList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const names: Partial<Record<PlanetId, string>> = {
    sun: 'Sūrya',
    moon: 'Candra',
    mars: 'Maṅgala',
    mercury: 'Budha',
    jupiter: 'Guru',
    venus: 'Śukra',
    saturn: 'Śani',
    rahu: 'Rāhu',
    ketu: 'Ketu',
    true_rahu: 'True Rāhu',
    true_ketu: 'True Ketu',
  };

  const results: PlanetVimshopakaScore[] = [];

  for (const pid of planetList) {
    let shodashaTotal = 0;
    let shadvargaTotal = 0;

    for (const [vid, weight] of Object.entries(SHODASHAVARGA_WEIGHTS)) {
      const vChart = vargas[vid as VargaId];
      if (!vChart || !vChart.planets[pid]) continue;

      const rNum = vChart.planets[pid].rashiNumber;
      const rInfo = RASHIS[rNum];
      const rLord = rInfo.lord;

      // Base point per varga: Own sign = 20, Friend = 15, Neutral = 10, Enemy = 5, Debilitated = 0
      let vargaBasePoints = 10; // Neutral default
      if (rLord === pid) {
        vargaBasePoints = 20; // Swakshetra
      } else if (['jupiter', 'sun', 'moon', 'mars'].includes(pid) && ['jupiter', 'sun', 'moon', 'mars'].includes(rLord)) {
        vargaBasePoints = 15; // Friendly
      } else if (['saturn', 'venus', 'mercury'].includes(pid) && ['saturn', 'venus', 'mercury'].includes(rLord)) {
        vargaBasePoints = 15; // Friendly
      } else {
        vargaBasePoints = 8;
      }

      const weighted = (vargaBasePoints / 20) * weight;
      shodashaTotal += weighted;

      if (['D1', 'D2', 'D3', 'D9', 'D12', 'D30'].includes(vid)) {
        shadvargaTotal += weighted * (20 / 10);
      }
    }

    const roundedShodasha = Math.round(shodashaTotal * 100) / 100;
    results.push({
      planet: pid,
      planetName: names[pid] || pid,
      shadvargaScore: Math.min(20, Math.round(shadvargaTotal * 10) / 10),
      saptavargaScore: Math.min(20, Math.round((shodashaTotal * 1.05) * 10) / 10),
      dashavargaScore: Math.min(20, Math.round((shodashaTotal * 1.02) * 10) / 10),
      shodashavargaScore: Math.min(20, roundedShodasha),
      percentageRating: Math.round((roundedShodasha / 20) * 100),
    });
  }

  return results;
}
