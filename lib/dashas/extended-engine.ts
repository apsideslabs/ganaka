/**
 * Gaṇaka — Extended Daśā Systems Master Engine
 * 
 * Central coordinator and comparison synthesizer for:
 * 1. Aṣṭottarī Daśā (108-Year Nakṣatra Cycle)
 * 2. Yoginī Daśā (36-Year Mother Goddess Cycle)
 * 3. Kālacakra Daśā (Nakṣatra-Pāda Savya/Apasavya Wheel of Time)
 * 4. Jaiminī Cara Daśā (Rāśi Daśā)
 * 5. Jaiminī Nārāyaṇa Daśā (Padakrama Rāśi Daśā)
 * 6. Jaiminī Śūla Daśā (Ayur-Daśā)
 * 7. Jaiminī Dṛg Daśā (Vision / Dharma Daśā)
 */

import { JyotishaChart } from '../jyotisha/types';
import {
  ExtendedDashaSystemId,
  ExtendedDashaCalculationResult,
  DashaComparisonRow,
} from './extended-types';
import { calculateAstottariDasha, ASTOTTARI_SYSTEM_DEF } from './astottari';
import { calculateYoginiDasha, YOGINI_SYSTEM_DEF } from './yogini';
import { calculateKalacakraDasha, KALACAKRA_SYSTEM_DEF } from './kalacakra';
import { calculateCharaDasha, JAIMINI_CHARA_SYSTEM_DEF } from './jaimini-chara';
import { calculateNarayanaDasha, JAIMINI_NARAYANA_SYSTEM_DEF } from './jaimini-narayana';
import { calculateShulaDasha, JAIMINI_SHULA_SYSTEM_DEF } from './jaimini-shula';
import { calculateDrgDasha, JAIMINI_DRG_SYSTEM_DEF } from './jaimini-drg';

export * from './extended-types';
export {
  calculateAstottariDasha,
  calculateYoginiDasha,
  calculateKalacakraDasha,
  calculateCharaDasha,
  calculateNarayanaDasha,
  calculateShulaDasha,
  calculateDrgDasha,
};

export const ALL_EXTENDED_SYSTEMS = [
  ASTOTTARI_SYSTEM_DEF,
  YOGINI_SYSTEM_DEF,
  KALACAKRA_SYSTEM_DEF,
  JAIMINI_CHARA_SYSTEM_DEF,
  JAIMINI_NARAYANA_SYSTEM_DEF,
  JAIMINI_SHULA_SYSTEM_DEF,
  JAIMINI_DRG_SYSTEM_DEF,
];

export function calculateSingleExtendedDasha(
  systemId: ExtendedDashaSystemId,
  chart: JyotishaChart,
  birthDate: Date,
  variant?: string
): ExtendedDashaCalculationResult {
  switch (systemId) {
    case 'astottari':
      return calculateAstottariDasha(
        chart,
        birthDate,
        variant === 'ardradi_27' ? 'ardradi_27' : 'ardradi_28'
      );
    case 'yogini':
      return calculateYoginiDasha(chart, birthDate);
    case 'kalacakra':
      return calculateKalacakraDasha(chart, birthDate);
    case 'chara':
      return calculateCharaDasha(
        chart,
        birthDate,
        variant === 'kn_rao_9th' ? 'kn_rao_9th' : 'classical_lagna'
      );
    case 'narayana':
      return calculateNarayanaDasha(chart, birthDate);
    case 'shula':
      return calculateShulaDasha(chart, birthDate);
    case 'drg':
      return calculateDrgDasha(chart, birthDate);
    default:
      return calculateAstottariDasha(chart, birthDate);
  }
}

export function calculateAllExtendedDashas(
  chart: JyotishaChart,
  birthDate: Date
): Record<ExtendedDashaSystemId, ExtendedDashaCalculationResult> {
  return {
    astottari: calculateAstottariDasha(chart, birthDate),
    yogini: calculateYoginiDasha(chart, birthDate),
    kalacakra: calculateKalacakraDasha(chart, birthDate),
    chara: calculateCharaDasha(chart, birthDate),
    narayana: calculateNarayanaDasha(chart, birthDate),
    shula: calculateShulaDasha(chart, birthDate),
    drg: calculateDrgDasha(chart, birthDate),
  };
}

export function buildDashaComparisonMatrix(
  chart: JyotishaChart,
  birthDate: Date
): DashaComparisonRow[] {
  const allResults = calculateAllExtendedDashas(chart, birthDate);
  const rows: DashaComparisonRow[] = [];

  const systemOrder: ExtendedDashaSystemId[] = [
    'astottari',
    'yogini',
    'kalacakra',
    'chara',
    'narayana',
    'shula',
    'drg',
  ];

  for (const sysId of systemOrder) {
    const res = allResults[sysId];
    const cp = res.currentPeriod;

    const remainingStr = `${cp.remainingYears}y ${cp.remainingMonths}m ${cp.remainingDays}d`;

    rows.push({
      systemId: sysId,
      systemName: res.system.name,
      sanskritName: res.system.sanskritName,
      classification: res.system.classification,
      cycleYears: res.system.cycleYears,
      currentMajorPeriod: cp.majorPeriod.name,
      currentSubPeriod: cp.subPeriod ? cp.subPeriod.name : '—',
      startDateStr: cp.majorPeriod.startDateStr,
      endDateStr: cp.majorPeriod.endDateStr,
      remainingStr,
      progressPercentage: cp.progressPercentage,
      eligibilityStatus: res.eligibility.status,
      eligibilityTitle: res.eligibility.conditionTitle,
    });
  }

  return rows;
}
