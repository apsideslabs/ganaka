/**
 * Gaṇaka — Centralized PredictionContext (Phase 1)
 * 
 * Ingests the fully calculated JyotishaChart and exposes deterministic query methods
 * and pre-computed astrometric abstractions.
 * 
 * Crucial invariants:
 * - Never re-calculates or mutates astronomical data.
 * - Categorizes SAV bindus rigorously (<24 = critical deficit, e.g. 18 SAV is never labeled high).
 * - Distinguishes actual aspects, dignities, and combustions from superficial placements.
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../types';
import { RASHIS, GRAHA_NAMES } from '../constants';

export interface NormalizedHouse {
  houseNumber: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiSanskrit: string;
  lordId: PlanetId;
  lordName: string;
  occupants: PlanetId[];
  beneficOccupants: PlanetId[];
  maleficOccupants: PlanetId[];
  aspectsReceived: {
    planetId: PlanetId;
    isBenefic: boolean;
    aspectType: string;
  }[];
  savBindus: number;
  savClassification: 'high' | 'adequate' | 'deficient' | 'critical';
  isSavFavorable: boolean;
}

export interface NormalizedPlanet {
  id: PlanetId;
  name: string;
  sanskritName: string;
  house: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  dignity: string;
  isExalted: boolean;
  isDebilitated: boolean;
  isOwnSign: boolean;
  isMoolatrikona: boolean;
  isFriendly: boolean;
  isEnemy: boolean;
  isRetrograde: boolean;
  isCombust: boolean;
  shadbalaRatio: number;
  shadbalaRupas: number;
  isStrongShadbala: boolean;
  housesOwned: number[];
  isVargottama: boolean;
  isFunctionalBenefic: boolean;
  isFunctionalMalefic: boolean;
}

export const NATURAL_BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
export const NATURAL_MALEFICS: PlanetId[] = ['saturn', 'mars', 'sun', 'rahu', 'ketu', 'true_rahu', 'true_ketu'];

export const COMBUSTION_ORBS: Partial<Record<PlanetId, number>> = {
  moon: 12.0,
  mars: 17.0,
  mercury: 14.0,
  jupiter: 11.0,
  venus: 10.0,
  saturn: 15.0,
};

export class PredictionContext {
  public readonly chart: JyotishaChart;
  public readonly referenceDate: Date;
  public readonly houses: Record<number, NormalizedHouse> = {};
  public readonly planets: Record<PlanetId, NormalizedPlanet> = {} as any;
  public readonly activeMahadasha: PlanetId;
  public readonly activeAntardasha: PlanetId;
  public readonly nativeAge: number;
  public readonly verifiedYogaNames: Set<string>;

  constructor(chart: JyotishaChart, referenceDate?: Date) {
    this.chart = chart;
    this.referenceDate = referenceDate || new Date();

    // 1. Calculate age and active dasha
    const birthYear = chart.meta?.birthDetails?.year || 1990;
    const birthMonth = (chart.meta?.birthDetails?.month || 1) - 1;
    const birthDay = chart.meta?.birthDetails?.day || 1;
    const birthDate = new Date(birthYear, birthMonth, birthDay);
    const ageDiffMs = this.referenceDate.getTime() - birthDate.getTime();
    this.nativeAge = Math.max(0, Math.floor(ageDiffMs / (1000 * 60 * 60 * 24 * 365.25)));

    // Active dasha determination
    const dashaTree = chart.vimshottari?.tree || [];
    let mdLord: PlanetId = 'jupiter';
    let adLord: PlanetId = 'saturn';
    const now = this.referenceDate;

    for (const md of dashaTree) {
      const s = new Date(md.startDate);
      const e = new Date(md.endDate);
      if (now >= s && now <= e) {
        mdLord = md.lord;
        if (md.subPeriods) {
          for (const ad of md.subPeriods) {
            const asDate = new Date(ad.startDate);
            const aeDate = new Date(ad.endDate);
            if (now >= asDate && now <= aeDate) {
              adLord = ad.lord;
              break;
            }
          }
        }
        break;
      }
    }
    this.activeMahadasha = mdLord;
    this.activeAntardasha = adLord;

    // 2. Verified yogas
    this.verifiedYogaNames = new Set((chart.yogas || []).map((y) => y.name.toLowerCase()));

    // 3. Normalize planets
    const sunPlanet = chart.planets?.sun;
    const lagnaRashiNum = (chart.lagna?.rashiNumber || 1) as RashiNumber;

    const allPlanetIds: PlanetId[] = [
      'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'
    ];

    allPlanetIds.forEach((pId) => {
      const p = chart.planets?.[pId];
      const rNum = (p?.rashiNumber || 1) as RashiNumber;
      const rInfo = RASHIS[rNum] || { name: 'Aries', sanskritName: 'Meṣa' };
      const d = p?.dignity || 'Neutral';
      const shad = chart.shadbala?.[pId];
      const ratio = shad?.ratio ?? 1.0;
      const rupas = shad?.totalRupas ?? 5.5;

      // Combustion check
      let isCombust = !!p?.isCombust;
      if (!isCombust && sunPlanet && pId !== 'sun' && pId !== 'rahu' && pId !== 'ketu') {
        const orb = COMBUSTION_ORBS[pId] || 12.0;
        const diff = Math.abs((p?.siderealLongitude || 0) - (sunPlanet.siderealLongitude || 0));
        const circularDiff = Math.min(diff, 360 - diff);
        if (circularDiff <= orb) {
          isCombust = true;
        }
      }

      // Houses owned
      const housesOwned: number[] = [];
      for (let h = 1; h <= 12; h++) {
        const hRashi = (((lagnaRashiNum - 1) + (h - 1)) % 12) + 1;
        const ruler = RASHIS[hRashi as RashiNumber]?.lord;
        if (ruler === pId) {
          housesOwned.push(h);
        }
      }

      // Functional benefic / malefic for this Lagna
      const isFuncBenefic = housesOwned.some((h) => [1, 5, 9].includes(h));
      const isFuncMalefic = housesOwned.some((h) => [6, 8, 12].includes(h)) && !isFuncBenefic;

      const vargottamaList = chart.vargottamaPlanets || [];

      this.planets[pId] = {
        id: pId,
        name: GRAHA_NAMES[pId]?.english || pId,
        sanskritName: GRAHA_NAMES[pId]?.sanskrit || pId,
        house: p?.house || 1,
        rashiNumber: rNum,
        rashiName: rInfo.name,
        dignity: d,
        isExalted: d.includes('Exalted'),
        isDebilitated: d.includes('Debilitated'),
        isOwnSign: d.includes('Own Sign'),
        isMoolatrikona: d.includes('Moolatrikona'),
        isFriendly: d.includes('Friend') || d.includes('Great Friend'),
        isEnemy: d.includes('Enemy') || d.includes('Great Enemy'),
        isRetrograde: !!p?.isRetrograde,
        isCombust,
        shadbalaRatio: parseFloat(ratio.toFixed(2)),
        shadbalaRupas: parseFloat(rupas.toFixed(2)),
        isStrongShadbala: ratio >= 1.1,
        housesOwned,
        isVargottama: vargottamaList.includes(pId),
        isFunctionalBenefic: isFuncBenefic,
        isFunctionalMalefic: isFuncMalefic,
      };
    });

    // 4. Normalize houses
    for (let h = 1; h <= 12; h++) {
      const rNum = ((((lagnaRashiNum - 1) + (h - 1)) % 12) + 1) as RashiNumber;
      const rInfo = RASHIS[rNum] || { name: 'Aries', sanskritName: 'Meṣa', lord: 'mars' as PlanetId };
      const lordId = rInfo.lord;

      // Occupants
      const occupants: PlanetId[] = [];
      allPlanetIds.forEach((pId) => {
        if (this.planets[pId]?.house === h) {
          occupants.push(pId);
        }
      });

      const beneficOccupants = occupants.filter((pId) => NATURAL_BENEFICS.includes(pId));
      const maleficOccupants = occupants.filter((pId) => NATURAL_MALEFICS.includes(pId));

      // Aspects received on this house
      const aspectsReceived: NormalizedHouse['aspectsReceived'] = [];
      allPlanetIds.forEach((pId) => {
        const plHouse = this.planets[pId]?.house;
        if (!plHouse || plHouse === h) return;

        // Vedic special aspects
        let castsAspect = false;
        let aspectDistance = ((h - plHouse + 12) % 12);
        if (aspectDistance === 0) aspectDistance = 12;

        // 7th house aspect (all planets)
        if (aspectDistance === 7) {
          castsAspect = true;
        }
        // Mars special aspects: 4th, 8th
        else if (pId === 'mars' && (aspectDistance === 4 || aspectDistance === 8)) {
          castsAspect = true;
        }
        // Jupiter & Rahu/Ketu special aspects: 5th, 9th
        else if (['jupiter', 'rahu', 'ketu'].includes(pId) && (aspectDistance === 5 || aspectDistance === 9)) {
          castsAspect = true;
        }
        // Saturn special aspects: 3rd, 10th
        else if (pId === 'saturn' && (aspectDistance === 3 || aspectDistance === 10)) {
          castsAspect = true;
        }

        if (castsAspect) {
          aspectsReceived.push({
            planetId: pId,
            isBenefic: NATURAL_BENEFICS.includes(pId),
            aspectType: `${aspectDistance}th house classical dṛṣṭi`,
          });
        }
      });

      // SAV bindus
      const savBindus = chart.ashtakavarga?.sav?.bindusByRashi?.[rNum - 1] ?? 28;

      let savClassification: 'high' | 'adequate' | 'deficient' | 'critical' = 'adequate';
      if (savBindus >= 32) {
        savClassification = 'high';
      } else if (savBindus >= 28) {
        savClassification = 'adequate';
      } else if (savBindus >= 24) {
        savClassification = 'deficient';
      } else {
        savClassification = 'critical'; // e.g. 18 SAV is critical, never called high!
      }

      this.houses[h] = {
        houseNumber: h,
        rashiNumber: rNum,
        rashiName: rInfo.name,
        rashiSanskrit: rInfo.sanskritName || rInfo.name,
        lordId,
        lordName: GRAHA_NAMES[lordId]?.english || lordId,
        occupants,
        beneficOccupants,
        maleficOccupants,
        aspectsReceived,
        savBindus,
        savClassification,
        isSavFavorable: savBindus >= 28,
      };
    }
  }

  public getHouse(num: number): NormalizedHouse {
    return this.houses[num] || this.houses[1];
  }

  public getPlanet(id: PlanetId): NormalizedPlanet {
    return this.planets[id];
  }

  public getLordOfHouse(houseNum: number): NormalizedPlanet {
    const house = this.getHouse(houseNum);
    return this.planets[house.lordId];
  }

  public checkNichabhanga(planetId: PlanetId): { isNichabhanga: boolean; reasons: string[] } {
    const p = this.planets[planetId];
    if (!p || !p.isDebilitated) {
      return { isNichabhanga: false, reasons: [] };
    }

    const reasons: string[] = [];
    const debSign = p.rashiNumber;
    const signRuler = RASHIS[debSign]?.lord;
    const rulerPlanet = signRuler ? this.planets[signRuler] : null;

    // Condition 1: Sign ruler of debilitation sign is in a Kendra from Lagna or Moon
    if (rulerPlanet && [1, 4, 7, 10].includes(rulerPlanet.house)) {
      reasons.push(`Dispositor ${rulerPlanet.name} sits in Kendra (House ${rulerPlanet.house})`);
    }

    // Condition 2: Planet that is exalted in that sign is in a Kendra
    // Aries: Sun, Taurus: Moon, Cancer: Jupiter, Virgo: Mercury, Libra: Saturn, Cap: Mars, Pisces: Venus
    const exaltationMap: Partial<Record<RashiNumber, PlanetId>> = {
      1: 'sun', 2: 'moon', 4: 'jupiter', 6: 'mercury', 7: 'saturn', 10: 'mars', 12: 'venus'
    };
    const exGrahaId = exaltationMap[debSign];
    if (exGrahaId) {
      const exGraha = this.planets[exGrahaId];
      if (exGraha && [1, 4, 7, 10].includes(exGraha.house)) {
        reasons.push(`Exaltation ruler ${exGraha.name} sits in Kendra (House ${exGraha.house})`);
      }
    }

    // Condition 3: Planet aspected by its sign ruler
    const aspects = this.houses[p.house]?.aspectsReceived || [];
    if (signRuler && aspects.some((a) => a.planetId === signRuler)) {
      reasons.push(`Debilitated planet receives direct aspect from its dispositor ${signRuler}`);
    }

    return {
      isNichabhanga: reasons.length > 0,
      reasons,
    };
  }

  public isLordInKendraOrTrikona(houseNum: number): boolean {
    const lord = this.getLordOfHouse(houseNum);
    return [1, 4, 7, 10, 5, 9].includes(lord.house);
  }

  public isLordInDusthana(houseNum: number): boolean {
    const lord = this.getLordOfHouse(houseNum);
    return [6, 8, 12].includes(lord.house);
  }

  public hasAffliction(houseNum: number): {
    isAfflicted: boolean;
    maleficCount: number;
    details: string[];
  } {
    const house = this.getHouse(houseNum);
    const details: string[] = [];
    let count = 0;

    house.maleficOccupants.forEach((m) => {
      count += 1;
      details.push(`Occupied by malefic ${this.planets[m].name}`);
    });

    house.aspectsReceived.filter((a) => !a.isBenefic).forEach((a) => {
      count += 0.75;
      details.push(`Aspected by ${this.planets[a.planetId].name} (${a.aspectType})`);
    });

    const lord = this.getLordOfHouse(houseNum);
    if (lord.isCombust) {
      count += 1;
      details.push(`Lord ${lord.name} is combust (Astaṅgata)`);
    }
    if (lord.isDebilitated) {
      const nb = this.checkNichabhanga(lord.id);
      if (!nb.isNichabhanga) {
        count += 1.5;
        details.push(`Lord ${lord.name} is debilitated without Nīchabhaṅga`);
      }
    }
    if ([6, 8, 12].includes(lord.house)) {
      count += 1;
      details.push(`Lord ${lord.name} placed in Dusthāna (House ${lord.house})`);
    }

    return {
      isAfflicted: count >= 1.5,
      maleficCount: count,
      details,
    };
  }

  public getAspectsOnHouse(houseNum: number): PlanetId[] {
    const house = this.getHouse(houseNum);
    return house.aspectsReceived.map((a) => a.planetId);
  }

  public planetAspectsHouse(planetId: PlanetId, targetHouse: number): boolean {
    const house = this.getHouse(targetHouse);
    return house.aspectsReceived.some((a) => a.planetId === planetId);
  }
}
