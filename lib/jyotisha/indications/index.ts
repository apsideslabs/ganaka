/**
 * Gaṇaka — Classical Chart Indications System (शास्त्रीय फलविचार)
 * Master Entry Point aggregating all 12 specialized domain evaluators.
 * 
 * Strict Evidence Pipeline:
 * Calculated Horoscope Data → Exact Classical Rule → Every Required Condition → Condition Verification 
 * → Direct Classical Phala → Cross-Text Comparison & Conflict Analysis → Controlled Synthesis → Modern Interpretive Mapping
 */

import { JyotishaChart, PlanetId } from '../types';
import {
  ClassicalIndicationsReport,
  DomainId,
  DomainIndication,
} from './types';

import { evaluateConstitutionDomain } from './evaluators/constitution';
import { evaluateTemperamentDomain } from './evaluators/temperament';
import { evaluateCareerDomain } from './evaluators/career';
import { evaluateWealthDomain } from './evaluators/wealth';
import { evaluateEducationDomain } from './evaluators/education';
import { evaluateMarriageDomain } from './evaluators/marriage';
import { evaluateChildrenDomain } from './evaluators/children';
import { evaluateFamilyDomain } from './evaluators/family';
import { evaluateHealthDomain } from './evaluators/health';
import { evaluateSpiritualityDomain } from './evaluators/spirituality';
import { evaluateStatusDomain } from './evaluators/status';
import { evaluateLifeThemesDomain } from './evaluators/life-themes';
import { getHouseLord, getCharaKarakaPlanet, GRAHA_SANSKRIT_NAMES } from './shared-utils';

export * from './types';
export * from './classical-sources';

export const ORDERED_DOMAIN_IDS: DomainId[] = [
  'constitution',
  'temperament',
  'career',
  'wealth',
  'education',
  'marriage',
  'children',
  'family',
  'health',
  'spirituality',
  'status',
  'life_themes',
];

/**
 * Generate full 12-domain Classical Indications Report from calculated Jyotisha chart
 */
export function generateClassicalChartIndications(chart: JyotishaChart): ClassicalIndicationsReport {
  // Execute all 12 specialized domain evaluators
  const constitution = evaluateConstitutionDomain(chart);
  const temperament = evaluateTemperamentDomain(chart);
  const career = evaluateCareerDomain(chart);
  const wealth = evaluateWealthDomain(chart);
  const education = evaluateEducationDomain(chart);
  const marriage = evaluateMarriageDomain(chart);
  const children = evaluateChildrenDomain(chart);
  const family = evaluateFamilyDomain(chart);
  const health = evaluateHealthDomain(chart);
  const spirituality = evaluateSpiritualityDomain(chart);
  const status = evaluateStatusDomain(chart);
  const life_themes = evaluateLifeThemesDomain(chart);

  const domains: Record<DomainId, DomainIndication> = {
    constitution,
    temperament,
    career,
    wealth,
    education,
    marriage,
    children,
    family,
    health,
    spirituality,
    status,
    life_themes,
  };

  // Extract highest Shadbala planet
  let strongestPlanetName = 'Sūrya';
  let maxRupas = 0;
  const planetKeys = Object.keys(chart.planets) as PlanetId[];
  planetKeys.forEach((p) => {
    const rupas = chart.shadbala?.[p]?.totalRupas || (chart.planets[p] as any)?.shadbala?.totalRupas || 0;
    if (rupas > maxRupas) {
      maxRupas = rupas;
      strongestPlanetName = `${GRAHA_SANSKRIT_NAMES[p] || p} (${rupas.toFixed(1)} Rūpas)`;
    }
  });

  const lagneśa = getHouseLord(chart, 1);
  const akId = getCharaKarakaPlanet(chart, 'AK');
  const amkId = getCharaKarakaPlanet(chart, 'AmK');

  const lagnaRashiName = chart.lagna?.rashiName || 'Lagna';
  const lagnaDegreeStr = chart.lagna?.degreeStr || '';

  return {
    calculatedAt: chart.meta?.calculatedAt || new Date().toISOString(),
    ayanamshaFormatted: chart.meta?.ayanamshaFormatted || 'Lahiri (Chitra Paksha)',
    totalDomains: 12,
    domains,
    orderedDomainIds: ORDERED_DOMAIN_IDS,
    globalChartSummary: {
      ascendantSign: `${lagnaRashiName} (${lagnaDegreeStr})`,
      ascendantLord: lagneśa.name,
      moonSign: `${chart.planets.moon.rashiName} (${chart.planets.moon.degreeStr})`,
      moonNakshatra: chart.planets.moon.nakshatraName,
      sunSign: `${chart.planets.sun.rashiName} (${chart.planets.sun.degreeStr})`,
      atmakaraka: `${GRAHA_SANSKRIT_NAMES[akId] || akId} (AK)`,
      amatyakaraka: `${GRAHA_SANSKRIT_NAMES[amkId] || amkId} (AmK)`,
      strongestPlanetByShadbala: strongestPlanetName,
      dominantElement: 'Agni-Pṛthvī Dynamic',
      dominantGuna: 'Sāttvika / Rājasika',
    },
  };
}
