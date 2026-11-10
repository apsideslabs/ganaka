import { AyanamshaType } from '../astronomy/ayanamsha';
import { VargaId } from '../jyotisha/types';
import { PanchangaViewTab } from '@/components/panchanga/types';

export type PlatformLanguage = 'english' | 'hindi' | 'sanskrit' | 'assamese';

export interface DefaultLocationSetting {
  name: string;
  country: string;
  stateOrRegion?: string;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  timezoneName: string;
  isCustom?: boolean;
}

export interface PlatformSettings {
  defaultAyanamsha: AyanamshaType;
  defaultCityName: string;
  defaultLocation: DefaultLocationSetting;
  language: PlatformLanguage;
  scriptPreference: 'iast' | 'devanagari' | 'english';
  degreeFormat: 'dms' | 'decimal';
  timeFormat: '24h' | '12h';
  dinaManaUnit: 'hours' | 'ghatis' | 'both';
  defaultChartStyle: 'north' | 'south' | 'east';
  themeTone: 'classic_parchment' | 'pure_white' | 'slate_astronomy';
  /**
   * Which recension of the aṣṭakavarga tables the engine uses.
   *
   * The two differ in exactly four cells and both total 337, so the checksum
   * cannot tell them apart — only the source text can.
   *   parashara     Bṛhat Parāśara Horā Śāstra ch. 66 — the working convention
   *                 of modern practice, and what most software follows.
   *   varahamihira  Bṛhat Jātaka ch. 13 — the older text (6th c.), continuously
   *                 commented, and the lineage Kāmarūpa's own almanac cites.
   */
  ashtakavargaRecension: 'parashara' | 'varahamihira';
}

export type VargaSetMode = 'standard' | 'extended';

export interface WorkspaceSettings {
  chartStyle: 'north' | 'south' | 'east';
  ayanamsha: AyanamshaType;
  nodeMode: 'mean' | 'true';
  houseSystem: 'equal_whole' | 'sripati' | 'placidus';
  showDegreesInCells: boolean;
  highlightDignities: boolean;
  showRetrogradeBadge: boolean;
  showCombustionBadge: boolean;
  showDigbalaBadge: boolean;
  dualViewMode: boolean;
  dualSecondaryVarga: VargaId;
  aspectLines: boolean;
  vargaSetMode: VargaSetMode;
  enabledExtendedVargas: VargaId[];
}

export interface PanchangaSettings {
  ayanamsha: AyanamshaType;
  tithiReckoning: 'astronomical_exact' | 'udaya_tithi';
  masaSystem: 'amanta' | 'purnimanta';
  dinaManaFormat: 'hours' | 'ghatis' | 'both';
  highlightAbhijit: boolean;
  highlightBrahmaMuhurta: boolean;
  highlightInauspicious: boolean;
  choghadiyaAnchor: 'sunrise' | 'six_am';
  horaChaldeanDisplay: boolean;
  defaultTab: PanchangaViewTab;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  defaultAyanamsha: 'lahiri',
  defaultCityName: 'Ujjain (Avanti - Prime Meridian of Surya Siddhanta)',
  defaultLocation: {
    name: 'Ujjain (Avanti - Prime Meridian of Surya Siddhanta)',
    country: 'India',
    stateOrRegion: 'Madhya Pradesh',
    latitude: 23.1765,
    longitude: 75.7885,
    timezoneOffsetHours: 5.5,
    timezoneName: 'IST',
    isCustom: false,
  },
  language: 'english',
  scriptPreference: 'iast',
  degreeFormat: 'dms',
  timeFormat: '24h',
  dinaManaUnit: 'both',
  defaultChartStyle: 'north',
  themeTone: 'classic_parchment',
  ashtakavargaRecension: 'parashara',
};

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  chartStyle: 'north',
  ayanamsha: 'lahiri',
  nodeMode: 'mean',
  houseSystem: 'equal_whole',
  showDegreesInCells: true,
  highlightDignities: true,
  showRetrogradeBadge: true,
  showCombustionBadge: true,
  showDigbalaBadge: true,
  dualViewMode: false,
  dualSecondaryVarga: 'D9',
  aspectLines: false,
  vargaSetMode: 'standard',
  enabledExtendedVargas: ['D5', 'D6', 'D8', 'D11', 'D81', 'D108', 'D144'],
};

export const DEFAULT_PANCHANGA_SETTINGS: PanchangaSettings = {
  ayanamsha: 'lahiri',
  tithiReckoning: 'udaya_tithi',
  masaSystem: 'amanta',
  dinaManaFormat: 'both',
  highlightAbhijit: true,
  highlightBrahmaMuhurta: true,
  highlightInauspicious: true,
  choghadiyaAnchor: 'sunrise',
  horaChaldeanDisplay: true,
  defaultTab: 'daily',
};
