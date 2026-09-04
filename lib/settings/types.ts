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
  defaultChartStyle: 'north' | 'south';
  themeTone: 'classic_parchment' | 'pure_white' | 'slate_astronomy';
}

export interface WorkspaceSettings {
  chartStyle: 'north' | 'south';
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
};

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  chartStyle: 'north',
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
