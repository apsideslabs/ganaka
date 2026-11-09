'use client';

/**
 * Gaṇaka — Core Calculation Workspace Client
 * Professional astronomical Jyotiṣa calculation workstation with structured 9-domain navigation,
 * High-precision classical mechanics, dual chart views,
 * birth-time rectification steppers, and horoscope profile persistence.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CITIES_DATABASE, CityLocation, searchLocations, formatDMS } from '../../lib/astronomy/coordinates';
import { useCitySearch } from '../../hooks/use-city-search';
import { formatPlace, formatPlaceRegion, formatUtcOffset } from '@/lib/format-place';
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '../../lib/astronomy/ayanamsha';
import { calculateFullJyotishaChart } from '../../lib/jyotisha/calculator';
import { JyotishaChart, VargaId } from '../../lib/jyotisha/types';
import { KundaliChart } from '../charts/KundaliChart';
import { PlanetaryTable } from './PlanetaryTable';
import { SphutasPanel } from './SphutasPanel';
import { JanmaPanchangaPanel } from './JanmaPanchangaPanel';

import { VimshottariPanel } from './VimshottariPanel';
import { ExtendedDashaPanel } from './ExtendedDashaPanel';
import { AshtakavargaPanel } from './AshtakavargaPanel';
import { ShadbalaPanel } from './ShadbalaPanel';
import { YogasPanel } from './YogasPanel';
import { DoshasPanel } from './DoshasPanel';
import { RemediesPanel } from './RemediesPanel';
import { VargasPanel } from './VargasPanel';
import { NavamshaPanel } from './NavamshaPanel';
import { JaiminiSpecialPanel } from './JaiminiSpecialPanel';
import { AspectsPanel } from './AspectsPanel';
import { TransitsPanel } from './TransitsPanel';
import { BhavaChalitPanel } from './BhavaChalitPanel';
import { MuhurtaPanel } from './MuhurtaPanel';
import { AvakahadaPanel } from './AvakahadaPanel';
import { IndicationsPanel } from './IndicationsPanel';
import { MatchingBridgePanel } from './MatchingBridgePanel';
import { GanakaButton } from '../ui/GanakaButton';
import { GanakaDatePicker } from '../ui/GanakaDatePicker';
import { GanakaClockPicker } from '../ui/GanakaClockPicker';
import { WorkspaceSettingsDialog } from '../settings/WorkspaceSettingsDialog';
import {
  getPlatformSettings,
  getWorkspaceSettings,
  savePlatformSettings,
  saveWorkspaceSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import {
  Calendar,
  Clock,
  MapPin,
  Compass,
  Layers,
  Table,
  BookOpen,
  Award,
  RefreshCw,
  Eye,
  Activity,
  Home as HomeIcon,
  Sun,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Settings,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Bookmark,
  Plus,
  Trash2,
  Columns,
  Sunrise,
  Sunset,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Flower2,
  Search,
  Users,
} from 'lucide-react';

interface PresetEvent {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface SavedChartProfile {
  id: string;
  name: string;
  savedAt: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ayanamsha: AyanamshaType;
  houseSystem: 'equal_whole' | 'sripati' | 'placidus';
}

const PRESETS: PresetEvent[] = [
  {
    name: 'India Independence (Midnight 1947)',
    year: 1947,
    month: 8,
    day: 15,
    hour: 0,
    minute: 0,
    cityName: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  },
  {
    name: 'Ujjain Prime Meridian Epoch',
    year: 2024,
    month: 1,
    day: 1,
    hour: 6,
    minute: 30,
    cityName: 'Ujjain (Avanti - Prime Meridian of Surya Siddhanta)',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 5.5,
  },
  {
    name: 'Varanasi Vedic Dawn (Kāśī)',
    year: 2025,
    month: 4,
    day: 14,
    hour: 5,
    minute: 45,
    cityName: 'Varanasi (Kāśī / Benares)',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 5.5,
  },
  {
    name: 'Albert Einstein (1879)',
    year: 1879,
    month: 3,
    day: 14,
    hour: 11,
    minute: 30,
    cityName: 'Ulm, Germany',
    latitude: 48.4011,
    longitude: 9.9876,
    timezone: 1.0,
  },
  {
    name: 'Swami Vivekananda (1863)',
    year: 1863,
    month: 1,
    day: 12,
    hour: 6,
    minute: 33,
    cityName: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.89,
  },
];

export type WorkspaceTab =
  | 'kundali'
  | 'avakahada'
  | 'vargas'
  | 'navamsha'
  | 'planets'
  | 'sphutas'
  | 'bhavas'
  | 'aspects'
  | 'vimshottari'
  | 'extended_dashas'
  | 'jaimini'
  | 'shadbala'
  | 'ashtakavarga'
  | 'yogas'
  | 'doshas'
  | 'remedies'
  | 'transits'
  | 'panchanga'
  | 'indications';

interface NavDomain {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  subTabs: {
    id: WorkspaceTab;
    name: string;
    shortName: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

/**
 * Clean, well-spaced 10-domain architectural categorization
 * strictly separating distinct calculation disciplines without cramming.
 */
const NAV_DOMAINS: NavDomain[] = [
  {
    id: 'kundali_vargas',
    name: 'Kuṇḍalī & Vargas',
    shortName: 'Charts',
    icon: Compass,
    description: 'D-1 Lagna birth chart, Avakahada Cakra, 16 harmonic divisional Ṣoḍaśavargas, & Navāṃśa mapping',
    subTabs: [
      { id: 'kundali', name: 'Lagna Kuṇḍalī (D-1)', shortName: 'D-1 Lagna', icon: Compass },
      { id: 'avakahada', name: 'Avakahada Cakra (अवकहड़ा चक्र)', shortName: 'Avakahada Cakra', icon: Sparkles, badge: 'Birth Matrix' },
      { id: 'vargas', name: 'Ṣoḍaśavarga (16 Charts)', shortName: '16 Vargas (D1–D60)', icon: Layers, badge: '16 Charts' },
      { id: 'navamsha', name: 'Navāṃśa (D-9) Reference & Grahas', shortName: 'Navāṃśa Table', icon: Table, badge: 'Canonical D9' },
      { id: 'matching_bridge', name: 'Vivāha Kūṭa Matching Profile', shortName: 'Kuṭa Profile', icon: Users, badge: 'Matching' },
    ],
  },
  {
    id: 'sphutas',
    name: 'Sphuṭas & Longitudes',
    shortName: 'Sphuṭas',
    icon: Table,
    description: 'True sidereal longitudes, speeds, Trisphuṭa, and Dhūmādi upagrahas',
    subTabs: [
      { id: 'planets', name: 'Planetary Table & Speeds', shortName: 'Graha Longitudes', icon: Table },
      { id: 'sphutas', name: 'Special Sphuṭas & Upagrahas', shortName: 'Upagrahas & Sphuṭas', icon: Compass, badge: 'Upagrahas' },
    ],
  },
  {
    id: 'bhavas_aspects',
    name: 'Bhāvas & Dṛṣṭi',
    shortName: 'Bhāvas',
    icon: HomeIcon,
    description: 'Bhāva Chalita cusps, Sandhis, and Graha Dṛṣṭi aspect rays',
    subTabs: [
      { id: 'bhavas', name: 'Bhāva Chalita & Sandhis', shortName: 'Bhāva Chalita', icon: HomeIcon },
      { id: 'aspects', name: 'Dṛṣṭi (Aspects Matrix)', shortName: 'Dṛṣṭi Matrix', icon: Eye },
    ],
  },
  {
    id: 'dashas',
    name: 'Viṃśottarī & Daśās',
    shortName: 'Daśās',
    icon: Clock,
    description: 'Viṃśottarī 6-level hierarchy & Extended systems (Aṣṭottarī, Yoginī, Kālacakra, Jaiminī)',
    subTabs: [
      { id: 'vimshottari', name: 'Viṃśottarī Daśā (6-Level Hierarchy)', shortName: 'Viṃśottarī (6 Levels)', icon: Clock, badge: '120y' },
      { id: 'extended_dashas', name: 'Extended Daśās (7 Systems)', shortName: 'Extended Daśās', icon: Layers, badge: '7 Systems' },
    ],
  },
  {
    id: 'jaimini',
    name: 'Jaimini Systems',
    shortName: 'Jaimini',
    icon: Compass,
    description: 'Chara Kārakas, Chara Daśā, Rāśi Dṛṣṭi, Argalā, Arūḍha Padas, & Upapada',
    subTabs: [
      { id: 'jaimini', name: 'Jaimini Sūtra Systems', shortName: 'Jaimini Sūtras', icon: Compass, badge: 'Classical' },
    ],
  },
  {
    id: 'strengths',
    name: 'Śaḍbala & Potencies',
    shortName: 'Śaḍbala',
    icon: Award,
    description: 'Six-fold planetary potency, Bhāva Bala, and Viṃśopakā 20-point dignity',
    subTabs: [
      { id: 'shadbala', name: 'Śaḍbala & Viṃśopakā Bala', shortName: 'Śaḍbala & Viṃśopakā', icon: Award },
    ],
  },
  {
    id: 'ashtakavarga',
    name: 'Aṣṭakavarga System',
    shortName: 'Aṣṭakavarga',
    icon: FileSpreadsheet,
    description: 'Bhinnaṣṭakavarga, Sarvāṣṭakavarga (SAV), Trikona & Ekādhipatya reductions',
    subTabs: [
      { id: 'ashtakavarga', name: 'Aṣṭakavarga & Śodhana', shortName: 'Aṣṭakavarga & Śodhana', icon: FileSpreadsheet, badge: 'Kakshās' },
    ],
  },
  {
    id: 'yogas',
    name: 'Classical Yogas',
    shortName: 'Yogas',
    icon: BookOpen,
    description: '50+ Parāśara, Rāja, Dhana, Nabhasa, Candra/Sūrya yogas',
    subTabs: [
      { id: 'yogas', name: 'Classical Vedic Yogas', shortName: '50+ Vedic Yogas', icon: BookOpen },
    ],
  },
  {
    id: 'doshas',
    name: 'Doshas & Ariṣṭa',
    shortName: 'Doshas',
    icon: ShieldAlert,
    description: '30+ Classical Sanskrit afflictions, BPHS Ch. 83 Śāpas, Ariṣṭa, Gandānta & Kuja Doṣa',
    subTabs: [
      { id: 'doshas', name: 'Classical Doshas & Ariṣṭa', shortName: '30+ Verified Doshas', icon: ShieldAlert, badge: 'Canonical' },
      { id: 'remedies', name: 'Classical Remedies (Śānti & Parihāra)', shortName: 'Remedies (Śānti & Parihāra)', icon: Flower2, badge: 'Active Afflictions' },
    ],
  },
  {
    id: 'transits',
    name: 'Gocāra & Sāḍhē Sātī',
    shortName: 'Transits',
    icon: Activity,
    description: 'Real-time planetary transits, Sāḍhē Sātī phases, Aṣṭama Śani & Vedha',
    subTabs: [
      { id: 'transits', name: 'Real-Time Gocāra & Sāḍhē Sātī', shortName: 'Gocāra & Transits', icon: Activity, badge: 'Vedha' },
    ],
  },
  {
    id: 'panchanga_muhurta',
    name: 'Pañcāṅga & Muhūrta',
    shortName: 'Pañcāṅga',
    icon: Sun,
    description: 'Janma Kuṇḍalī chart, 5 sacred limbs of birth, and temporal Muhūrta of the birth day',
    subTabs: [
      { id: 'panchanga', name: 'Janma Pañcāṅga & Muhūrta (जन्म पञ्चाङ्ग)', shortName: 'Janma Pañcāṅga', icon: Sun, badge: '5 Limbs' },
    ],
  },
  {
    id: 'indications',
    name: 'Chart Indications',
    shortName: 'Indications',
    icon: Sparkles,
    description: 'Evidence-based classical chart indications across 12 major life domains (BPHS, Phaladīpikā, Sārāvalī)',
    subTabs: [
      { id: 'indications', name: 'Classical Chart Indications (फल विवेक)', shortName: '12 Life Domains', icon: Sparkles, badge: '12 Domains' },
    ],
  },
];

const VARGA_LABELS: Record<VargaId, string> = {
  D1: 'D-1 (Rāśi / Body & Soul)',
  D2: 'D-2 (Horā / Wealth)',
  D3: 'D-3 (Drekkāṇa / Siblings)',
  D4: 'D-4 (Caturthāṃśa / Fortune)',
  D7: 'D-7 (Saptāṃśa / Progeny)',
  D9: 'D-9 (Navāṃśa / Dharma & Spouse)',
  D10: 'D-10 (Daśāṃśa / Career & Status)',
  D12: 'D-12 (Dvādaśāṃśa / Parents)',
  D16: 'D-16 (Ṣoḍaśāṃśa / Vehicles)',
  D20: 'D-20 (Viṃśāṃśa / Upāsanā)',
  D24: 'D-24 (Caturviṃśāṃśa / Learning)',
  D27: 'D-27 (Saptaviṃśāṃśa / Strengths)',
  D30: 'D-30 (Triṃśāṃśa / Ariṣṭa)',
  D40: 'D-40 (Khavedāṃśa / Auspiciousness)',
  D45: 'D-45 (Akṣavedāṃśa / Character)',
  D60: 'D-60 (Ṣaṣṭyāṃśa / Past Karma)',
  // Supported Traditional Extended Vargas
  D5: 'D-5 (Pañcāṃśa / Spiritual & Fame)',
  D6: 'D-6 (Ṣaṣṭhāṃśa / Kauluka / Health & Rogas)',
  D8: 'D-8 (Aṣṭāṃśa / Longevity & Occult)',
  D11: 'D-11 (Rudrāṃśa / Force & Victory)',
  D81: 'D-81 (Ekāśītāṃśa / Navanavāṃśa)',
  D108: 'D-108 (Aṣṭottaraśatāṃśa / Nakshatra Pada)',
  D144: 'D-144 (Dvādaśadvādaśāṃśa / Deep Lineage)',
};

function getInitialParams(searchParams: ReturnType<typeof useSearchParams>) {
  let stored: Record<string, unknown> | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ganaka_chart_params');
      if (raw) stored = JSON.parse(raw);
    } catch {
      // ignore storage error
    }
  }

  const qName = searchParams?.get('name');
  const qYear = searchParams?.get('year');
  const qMonth = searchParams?.get('month');
  const qDay = searchParams?.get('day');
  const qHour = searchParams?.get('hour');
  const qMinute = searchParams?.get('minute');
  const qSecond = searchParams?.get('second');
  const qLat = searchParams?.get('lat');
  const qLng = searchParams?.get('lng');
  const qTz = searchParams?.get('tz');
  const qCity = searchParams?.get('city');
  const qAyan = searchParams?.get('ayan');
  const qHouse = searchParams?.get('house');

  const name = qName || (stored?.name as string) || 'Jyotiṣa Birth Chart';
  const year = qYear ? parseInt(qYear, 10) || 2024 : typeof stored?.year === 'number' ? stored.year : 2024;
  const month = qMonth ? parseInt(qMonth, 10) || 1 : typeof stored?.month === 'number' ? stored.month : 1;
  const day = qDay ? parseInt(qDay, 10) || 1 : typeof stored?.day === 'number' ? stored.day : 1;
  const hour =
    qHour !== null && qHour !== undefined && qHour !== ''
      ? parseInt(qHour, 10) || 0
      : typeof stored?.hour === 'number'
      ? stored.hour
      : 6;
  const minute =
    qMinute !== null && qMinute !== undefined && qMinute !== ''
      ? parseInt(qMinute, 10) || 0
      : typeof stored?.minute === 'number'
      ? stored.minute
      : 30;
  const second =
    qSecond !== null && qSecond !== undefined && qSecond !== ''
      ? parseInt(qSecond, 10) || 0
      : typeof stored?.second === 'number'
      ? stored.second
      : 0;

  const wsSettings = getWorkspaceSettings();
  const platSettings = getPlatformSettings();

  let city: CityLocation = CITIES_DATABASE[0];
  if (platSettings.defaultLocation && typeof platSettings.defaultLocation.latitude === 'number') {
    city = {
      name: platSettings.defaultLocation.name,
      country: platSettings.defaultLocation.country || 'India',
      stateOrRegion: platSettings.defaultLocation.stateOrRegion,
      latitude: platSettings.defaultLocation.latitude,
      longitude: platSettings.defaultLocation.longitude,
      timezoneOffsetHours: platSettings.defaultLocation.timezoneOffsetHours,
      timezoneName: platSettings.defaultLocation.timezoneName || 'IST',
    };
  }

  if (qLat && qLng && qTz) {
    const lat = parseFloat(qLat);
    const lng = parseFloat(qLng);
    const tz = parseFloat(qTz);
    city = {
      name: qCity || 'Custom Coordinates',
      country: 'India',
      latitude: lat,
      longitude: lng,
      timezoneOffsetHours: tz,
      timezoneName: `UTC${tz >= 0 ? `+${tz}` : tz}`,
    };
  } else if (stored && typeof stored.latitude === 'number' && typeof stored.longitude === 'number') {
    const sLat = stored.latitude as number;
    const sLng = stored.longitude as number;
    const sTz = typeof stored.timezone === 'number' ? stored.timezone : 5.5;
    city = {
      name: (stored.cityName as string) || 'Custom Coordinates',
      country: 'India',
      latitude: sLat,
      longitude: sLng,
      timezoneOffsetHours: sTz,
      timezoneName: `UTC${sTz >= 0 ? `+${sTz}` : sTz}`,
    };
  }

  const activeSettingAyan = wsSettings.ayanamsha || platSettings.defaultAyanamsha;

  let ayan: AyanamshaType = activeSettingAyan && activeSettingAyan in AYANAMSHA_DEFINITIONS ? activeSettingAyan : 'lahiri';
  if (qAyan && qAyan in AYANAMSHA_DEFINITIONS) {
    ayan = qAyan as AyanamshaType;
  } else if (!activeSettingAyan && stored?.ayanamsha && (stored.ayanamsha as string) in AYANAMSHA_DEFINITIONS) {
    ayan = stored.ayanamsha as AyanamshaType;
  }

  let house: 'equal_whole' | 'sripati' | 'placidus' = 'equal_whole';
  if (qHouse === 'equal_whole' || qHouse === 'sripati' || qHouse === 'placidus') {
    house = qHouse;
  } else if (
    stored?.houseSystem === 'equal_whole' ||
    stored?.houseSystem === 'sripati' ||
    stored?.houseSystem === 'placidus'
  ) {
    house = stored.houseSystem;
  }

  return { name, year, month, day, hour, minute, second, city, ayan, house };
}

export const WorkspaceClient: React.FC = () => {
  const searchParams = useSearchParams();
  const init = useMemo(() => getInitialParams(searchParams), [searchParams]);

  const [chartTitle, setChartTitle] = useState<string>(() => init.name);
  const [year, setYear] = useState<number>(() => init.year);
  const [month, setMonth] = useState<number>(() => init.month);
  const [day, setDay] = useState<number>(() => init.day);
  const [hour, setHour] = useState<number>(() => init.hour);
  const [minute, setMinute] = useState<number>(() => init.minute);
  const [second, setSecond] = useState<number>(() => init.second);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(() => init.city);
  const [locationQuery, setLocationQuery] = useState<string>(() => init.city.name);

  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  const [showParametersDrawer, setShowParametersDrawer] = useState<boolean>(false);
  const [showSavedProfilesDrawer, setShowSavedProfilesDrawer] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Professional View Settings
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState<boolean>(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south' | 'east'>('north');
  const [dualViewMode, setDualViewMode] = useState<boolean>(false);
  const [dualSecondaryVarga, setDualSecondaryVarga] = useState<VargaId>('D9');

  const [ayanamshaType, setAyanamshaType] = useState<AyanamshaType>(() => init.ayan);
  const [houseSystem, setHouseSystem] = useState<'equal_whole' | 'sripati' | 'placidus'>(() => init.house);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('kundali');
  const [ashtakavargaVargaId, setAshtakavargaVargaId] = useState<VargaId>('D1');
  const [isApplyingTime, setIsApplyingTime] = useState<boolean>(false);
  const [isApplyingLocation, setIsApplyingLocation] = useState<boolean>(false);
  const [isSavedDefaultLocation, setIsSavedDefaultLocation] = useState<boolean>(false);

  // The location chosen in Platform Settings is the default for chart
  // calculation. Applied on mount and whenever the platform scope changes, so
  // selecting a place in Settings carries through to this page without the user
  // having to pick it again here.
  const applyDefaultLocation = useCallback(
    (loc?: Partial<CityLocation> | null) => {
      if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
        return;
      }
      setSelectedCity((prev) => {
        if (prev.name === loc.name && prev.latitude === loc.latitude) return prev;
        return {
          name: loc.name || prev.name,
          country: loc.country || 'India',
          stateOrRegion: loc.stateOrRegion,
          latitude: loc.latitude as number,
          longitude: loc.longitude as number,
          timezoneOffsetHours:
            typeof loc.timezoneOffsetHours === 'number' ? loc.timezoneOffsetHours : 5.5,
          timezoneName: loc.timezoneName || 'IST',
        } as CityLocation;
      });
      setLocationQuery(formatPlace(loc as any));
    },
    []
  );

  useEffect(() => {
    applyDefaultLocation(getPlatformSettings()?.defaultLocation);
  }, [applyDefaultLocation]);

  // Synchronize with Workspace & Platform Settings in real-time
  useEffect(() => {
    const unsub = subscribeToSettings((scope) => {
      if (scope === 'workspace') {
        const currentWs = getWorkspaceSettings();
        if (currentWs.ayanamsha && currentWs.ayanamsha in AYANAMSHA_DEFINITIONS) {
          setAyanamshaType(currentWs.ayanamsha);
        }
      } else if (scope === 'platform') {
        const currentPlat = getPlatformSettings();
        if (currentPlat?.defaultAyanamsha && currentPlat.defaultAyanamsha in AYANAMSHA_DEFINITIONS) {
          setAyanamshaType(currentPlat.defaultAyanamsha);
        }
        applyDefaultLocation(currentPlat?.defaultLocation);
      }
    });
    return unsub;
  }, []);

  // Save current workspace chart params to localStorage for seamless persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = {
          name: chartTitle,
          year,
          month,
          day,
          hour,
          minute,
          second,
          cityName: selectedCity.name,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          timezone: selectedCity.timezoneOffsetHours,
          ayanamsha: ayanamshaType,
          houseSystem,
        };
        localStorage.setItem('ganaka_chart_params', JSON.stringify(params));
      } catch {}
    }
  }, [chartTitle, year, month, day, hour, minute, second, selectedCity, ayanamshaType, houseSystem]);

  const handleApplyDefaultLocation = () => {
    setIsApplyingLocation(true);
    const settings = getPlatformSettings();
    const loc = settings.defaultLocation;
    const matchingCity =
      CITIES_DATABASE.find((c) => c.name.toLowerCase() === loc.name.toLowerCase()) || {
        name: loc.name,
        country: loc.country || 'India',
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezoneOffsetHours: loc.timezoneOffsetHours,
        timezoneName: loc.timezoneName || 'UTC+5.5',
      };
    setSelectedCity(matchingCity);
    setLocationQuery(formatPlace(matchingCity));
    setTimeout(() => {
      setIsApplyingLocation(false);
    }, 500);
  };

  const handleSaveAsDefaultLocation = () => {
    setIsSavedDefaultLocation(true);
    savePlatformSettings({
      defaultLocation: {
        name: selectedCity.name,
        country: selectedCity.country || 'India',
        stateOrRegion: selectedCity.stateOrRegion,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        timezoneOffsetHours: selectedCity.timezoneOffsetHours,
        timezoneName: selectedCity.timezoneName || 'IST',
        isCustom: false,
      },
      defaultCityName: selectedCity.name,
    });
    setTimeout(() => {
      setIsSavedDefaultLocation(false);
    }, 1800);
  };

  // Saved Profiles Storage
  const [savedProfiles, setSavedProfiles] = useState<SavedChartProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ganaka_saved_profiles');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to load saved profiles', err);
      }
    }
    return [];
  });

  // Filtered Locations (curated + full GeoNames index, incl. Indian villages)
  const locationResults = useCitySearch(locationQuery, 40, 15);

  // Compute Full Jyotisha Chart
  const chartData: JyotishaChart = useMemo(() => {
    return calculateFullJyotishaChart({
      year,
      month,
      day,
      hour,
      minute,
      second,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezoneOffsetHours: selectedCity.timezoneOffsetHours,
      locationName: selectedCity.name,
      ayanamshaType,
      houseSystem,
    });
  }, [year, month, day, hour, minute, second, selectedCity, ayanamshaType, houseSystem]);

  // Determine which domain is currently active
  const currentDomain = useMemo(() => {
    for (const domain of NAV_DOMAINS) {
      if (domain.subTabs.some((t) => t.id === activeTab)) {
        return domain;
      }
    }
    return NAV_DOMAINS[0];
  }, [activeTab]);

  const selectDomain = (domain: NavDomain) => {
    if (!domain.subTabs.some((t) => t.id === activeTab)) {
      setActiveTab(domain.subTabs[0].id);
    }
  };

  // High-precision Time Shift Rectification Helper
  const shiftDateTime = (deltaMinutes: number) => {
    const current = new Date(year, month - 1, day, hour, minute, second);
    const updated = new Date(current.getTime() + deltaMinutes * 60 * 1000);
    setYear(updated.getFullYear());
    setMonth(updated.getMonth() + 1);
    setDay(updated.getDate());
    setHour(updated.getHours());
    setMinute(updated.getMinutes());
    setSecond(updated.getSeconds());
  };

  const applyPreset = (preset: PresetEvent) => {
    setYear(preset.year);
    setMonth(preset.month);
    setDay(preset.day);
    setHour(preset.hour);
    setMinute(preset.minute);
    setSecond(0);
    setSelectedCity({
      name: preset.cityName,
      country: 'India',
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezoneOffsetHours: preset.timezone,
      timezoneName: `UTC${preset.timezone >= 0 ? `+${preset.timezone}` : preset.timezone}`,
    });
    setLocationQuery(preset.cityName);
  };

  const applyCurrentTime = () => {
    setIsApplyingTime(true);
    const cur = new Date();
    setYear(cur.getFullYear());
    setMonth(cur.getMonth() + 1);
    setDay(cur.getDate());
    setHour(cur.getHours());
    setMinute(cur.getMinutes());
    setSecond(cur.getSeconds());
    setTimeout(() => {
      setIsApplyingTime(false);
    }, 600);
  };

  const saveCurrentProfile = () => {
    const newProfile: SavedChartProfile = {
      id: `profile_${Date.now()}`,
      name: chartTitle.trim() || `Chart ${year}-${month}-${day}`,
      savedAt: Date.now(),
      year,
      month,
      day,
      hour,
      minute,
      second,
      cityName: selectedCity.name,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: selectedCity.timezoneOffsetHours,
      ayanamsha: ayanamshaType,
      houseSystem,
    };

    const updated = [newProfile, ...savedProfiles.filter((p) => p.name !== newProfile.name)];
    setSavedProfiles(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ganaka_saved_profiles', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save profile', err);
      }
    }
  };

  const loadProfile = (profile: SavedChartProfile) => {
    setChartTitle(profile.name);
    setYear(profile.year);
    setMonth(profile.month);
    setDay(profile.day);
    setHour(profile.hour);
    setMinute(profile.minute);
    setSecond(profile.second || 0);
    setSelectedCity({
      name: profile.cityName,
      country: 'India',
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezoneOffsetHours: profile.timezone,
      timezoneName: `UTC${profile.timezone >= 0 ? `+${profile.timezone}` : profile.timezone}`,
    });
    setLocationQuery(profile.cityName);
    // Retain the user's active Ayanāṃśa setting across all charts as requested
    setHouseSystem(profile.houseSystem);
    setShowSavedProfilesDrawer(false);
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter((p) => p.id !== id);
    setSavedProfiles(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ganaka_saved_profiles', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to delete profile', err);
      }
    }
  };

  const copyChartSummaryToClipboard = () => {
    const summaryText = `
=== GAṆAKA JYOTIṢA CHART SUMMARY ===
Title: ${chartTitle}
Date of Birth: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}
Time of Birth: ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} (UTC${selectedCity.timezoneOffsetHours >= 0 ? `+${selectedCity.timezoneOffsetHours}` : selectedCity.timezoneOffsetHours})
Location: ${selectedCity.name} (${formatDMS(selectedCity.latitude, true)}, ${formatDMS(selectedCity.longitude, false)})
Ayanāṃśa: ${AYANAMSHA_DEFINITIONS[ayanamshaType]?.name || ayanamshaType} (${chartData.meta.ayanamshaFormatted})
Julian Day: ${chartData.meta.julianDay}

--- ASCENDANT & SEEDS ---
Lagna: ${chartData.lagna.rashiName} (${chartData.lagna.degreeStr}) • Nakṣatra: ${chartData.lagna.nakshatraName} P${chartData.lagna.pada}
Moon (Candra): ${chartData.planets.moon.rashiName} (${chartData.planets.moon.degreeStr}) • Nakṣatra: ${chartData.planets.moon.nakshatraName} P${chartData.planets.moon.pada}
Sun (Sūrya): ${chartData.planets.sun.rashiName} (${chartData.planets.sun.degreeStr}) • Nakṣatra: ${chartData.planets.sun.nakshatraName} P${chartData.planets.sun.pada}

--- PAÑCĀṄGA ---
Tithi: ${chartData.panchanga.tithi.name} (${chartData.panchanga.tithi.paksha} Pakṣa)
Vāra: ${chartData.panchanga.vara.name}
Yoga: ${chartData.panchanga.yoga.name}
Karaṇa: ${chartData.panchanga.karana.name}
Sunrise: ${chartData.panchanga.sunTimes.sunrise} • Sunset: ${chartData.panchanga.sunTimes.sunset}

--- PLANETARY SPHUṬA ---
${Object.values(chartData.planets)
  .map(
    (p) =>
      `${p.sanskritName} (${p.name}): ${p.rashiName} ${p.degreeStr} | H${p.house} | ${p.nakshatraName} P${p.pada} | ${p.dignity}${p.isRetrograde ? ' [Retro]' : ''}${p.isCombust ? ' [Combust]' : ''}`
  )
  .join('\n')}
=======================================
`.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6 text-slate-900">
      {/* 1. PROFESSIONAL EXECUTIVE HEADER & ASTRONOMICAL COMMAND DECK */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C2D19] bg-[#8C2D19]/10 px-2.5 py-0.5 rounded-md border border-[#8C2D19]/20">
                Classical Jyotiṣa Workstation
              </span>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Ayanāṃśa: <strong className="text-slate-900">{AYANAMSHA_DEFINITIONS[ayanamshaType]?.name || ayanamshaType}</strong> ({chartData.meta.ayanamshaFormatted})
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                VSOP87 / NOAA Ephemeris
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                aria-label="Chart title"
                className="bg-transparent hover:bg-slate-50 focus:bg-slate-50 px-2 -ml-2 py-0.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-[#8C2D19] focus:outline-none transition-all w-full max-w-xl"
                placeholder="Chart Title..."
              />
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap font-mono">
              <span className="font-bold text-slate-900">
                {year}-{String(month).padStart(2, '0')}-{String(day).padStart(2, '0')}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-[#8C2D19]">
                {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}:{String(second).padStart(2, '0')} (UTC{selectedCity.timezoneOffsetHours >= 0 ? `+${selectedCity.timezoneOffsetHours}` : selectedCity.timezoneOffsetHours})
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">{selectedCity.name} ({formatDMS(selectedCity.latitude, true)}, {formatDMS(selectedCity.longitude, false)})</span>
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            <GanakaButton
              type="button"
              size="sm"
              variant={showParametersDrawer ? 'primary' : 'secondary'}
              onClick={() => setShowParametersDrawer(!showParametersDrawer)}
              icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              <span>{showParametersDrawer ? 'Hide Ephemeris' : 'Edit Birth / Ephemeris'}</span>
              {showParametersDrawer ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </GanakaButton>

            <GanakaButton
              type="button"
              size="sm"
              variant={showSavedProfilesDrawer ? 'primary' : 'outline'}
              onClick={() => setShowSavedProfilesDrawer(!showSavedProfilesDrawer)}
              icon={<Bookmark className="w-3.5 h-3.5" />}
              title="Saved Chart Profiles"
            >
              <span>Saved Charts ({savedProfiles.length})</span>
            </GanakaButton>

            <GanakaButton
              type="button"
              id="workspace-settings-btn"
              size="sm"
              variant="outline"
              onClick={() => setShowWorkspaceSettings(true)}
              icon={<Settings className="w-3.5 h-3.5 text-[#8C2D19]" />}
              title="Workspace calculation models & visual markers"
            >
              <span>Settings</span>
            </GanakaButton>

            <GanakaButton
              type="button"
              size="sm"
              variant="outline"
              onClick={copyChartSummaryToClipboard}
              title="Copy complete chart ephemeris summary"
              icon={copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            >
              <span>{copiedSummary ? 'Copied!' : 'Copy Data'}</span>
            </GanakaButton>

            <GanakaButton
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              title="Print / Save PDF of current workspace view"
              icon={<Printer className="w-3.5 h-3.5 text-slate-500" />}
            />
          </div>
        </div>

        {/* 2. RECTIFICATION TIME-STEPPER & REAL-TIME CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-slate-600 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8C2D19]" />
              <span>Time Rectification Stepper:</span>
            </span>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => shiftDateTime(-60)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Subtract 1 hour"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => shiftDateTime(-5)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                type="button"
                onClick={() => shiftDateTime(-1)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => shiftDateTime(1)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={() => shiftDateTime(5)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Add 5 minutes"
              >
                +5m
              </button>
              <button
                type="button"
                onClick={() => shiftDateTime(60)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Add 1 hour"
              >
                +1h
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={applyCurrentTime}
              disabled={isApplyingTime}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#8C2D19] font-semibold hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isApplyingTime ? 'animate-spin' : ''}`} />
              <span>{isApplyingTime ? 'Updating...' : 'Real-Time (Now)'}</span>
            </button>

            <button
              type="button"
              onClick={saveCurrentProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#8C2D19] text-white rounded-lg font-semibold hover:bg-[#701E00] transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>

        {/* 3. SAVED PROFILES DRAWER */}
        {showSavedProfilesDrawer && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-serif font-bold text-slate-900">
                Saved Chart Profiles ({savedProfiles.length})
              </h4>
              <span className="text-xs text-slate-500">Stored in local browser storage</span>
            </div>

            {savedProfiles.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No custom profiles saved yet. Click <strong className="text-[#8C2D19]">&quot;Save Profile&quot;</strong> above to store the current birth chart.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                {savedProfiles.map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => loadProfile(prof)}
                    className="p-3.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#8C2D19] rounded-xl cursor-pointer transition-all flex items-start justify-between group shadow-2xs hover:shadow-sm"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <span className="text-sm font-serif font-bold text-slate-900 block truncate group-hover:text-[#8C2D19]">
                        {prof.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500 block">
                        {prof.year}-{String(prof.month).padStart(2, '0')}-{String(prof.day).padStart(2, '0')} • {String(prof.hour).padStart(2, '0')}:{String(prof.minute).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-slate-600 block truncate">
                        {prof.cityName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => deleteProfile(prof.id, e)}
                      title="Delete profile"
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. COLLAPSIBLE PARAMETERS DRAWER */}
        {showParametersDrawer && (
          <div className="pt-4 border-t border-slate-100 space-y-5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              {/* Clean Date of Birth Input */}
              <div className="space-y-1.5 sm:col-span-1">
                <GanakaDatePicker
                  id="workspace-dob-picker"
                  label="Date of Birth"
                  value={new Date(year, month - 1, day)}
                  onChange={(d) => {
                    if (d) {
                      setYear(d.getFullYear());
                      setMonth(d.getMonth() + 1);
                      setDay(d.getDate());
                    }
                  }}
                />
              </div>

              {/* High Precision Time of Birth Input */}
              <div className="space-y-1.5 sm:col-span-1">
                <GanakaClockPicker
                  id="workspace-tob-picker"
                  label="Time of Birth"
                  value={{ hour, minute, second }}
                  onChange={(t) => {
                    if (t) {
                      setHour(t.hour);
                      setMinute(t.minute);
                      setSecond(t.second || 0);
                    }
                  }}
                />
              </div>

              {/* Location Autocomplete */}
              <div className="space-y-1.5 relative sm:col-span-2">
                <label className="text-slate-700 font-semibold block flex items-center justify-between flex-wrap gap-1">
                  <span>Location</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyDefaultLocation}
                      disabled={isApplyingLocation}
                      className="text-[11px] font-mono text-[#8C2D19] hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-all font-medium bg-[#8C2D19]/5 px-1.5 py-0.5 rounded border border-[#8C2D19]/20"
                      title="Set to default location from Platform Settings"
                    >
                      <MapPin className={`w-3 h-3 ${isApplyingLocation ? 'animate-bounce' : ''}`} />
                      <span>{isApplyingLocation ? 'Applied!' : 'Use Default Location'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsDefaultLocation}
                      disabled={isSavedDefaultLocation}
                      className="text-[11px] font-mono text-emerald-800 hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-all font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                      title="Save this location as the global Platform Default"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isSavedDefaultLocation ? 'Saved as Default!' : 'Set as Default'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}°
                    </span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    onFocus={() => setShowLocationDropdown(true)}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#8C2D19] focus:ring-1 focus:ring-[#8C2D19] shadow-2xs"
                    placeholder="Search city (e.g. Ujjain, Varanasi, Ayodhya, Mumbai)..."
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C2D19]" />
                </div>

                {showLocationDropdown && locationResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {locationResults.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedCity(loc);
                          setLocationQuery(formatPlace(loc));
                          setShowLocationDropdown(false);
                        }}
                        className="px-4 py-2.5 text-xs hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{loc.name}</span>
                          <span className="text-slate-500 text-[11px] block font-mono">
                            {formatPlaceRegion(loc)} • {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                          </span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-[#8C2D19]">
                          {formatUtcOffset(loc.timezoneOffsetHours)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ayanamsha Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Ayanāṃśa Standard</label>
                <select
                  value={ayanamshaType}
                  onChange={(e) => {
                    const nextAyan = e.target.value as AyanamshaType;
                    setAyanamshaType(nextAyan);
                    saveWorkspaceSettings({ ayanamsha: nextAyan });
                    savePlatformSettings({ defaultAyanamsha: nextAyan });
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-[#8C2D19] focus:outline-none shadow-2xs"
                >
                  {Object.entries(AYANAMSHA_DEFINITIONS).map(([k, def]) => (
                    <option key={k} value={k}>
                      {def.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* House System */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">Bhāva System</label>
                <select
                  value={houseSystem}
                  onChange={(e) => setHouseSystem(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-[#8C2D19] focus:outline-none shadow-2xs"
                >
                  <option value="equal_whole">Rāśi = Bhāva (Whole Sign / Parāśara)</option>
                  <option value="sripati">Śrīpati (Porphyry-Vedic Madhyas)</option>
                  <option value="placidus">Placidus (Semi-Arc Cusps)</option>
                </select>
              </div>
            </div>

            {/* Historical Epoch Presets */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 text-xs font-semibold">Classical Research Presets:</span>
              {PRESETS.map((preset, idx) => (
                <GanakaButton
                  key={idx}
                  size="sm"
                  variant="preset"
                  type="button"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </GanakaButton>
              ))}
            </div>
          </div>
        )}

        {/* 5. ASTRONOMICAL KEY METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Lagna (Ascendant)</span>
            <span className="text-sm font-bold text-[#8C2D19] block truncate font-serif">
              {chartData.lagna.rashiName} ({chartData.lagna.degreeStr.split(' ')[0]})
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {chartData.lagna.nakshatraName} P{chartData.lagna.pada}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Candra (Moon)</span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {chartData.planets.moon.rashiName} ({chartData.planets.moon.degreeStr.split(' ')[0]})
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {chartData.planets.moon.nakshatraName} P{chartData.planets.moon.pada}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Sūrya (Sun)</span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {chartData.planets.sun.rashiName} ({chartData.planets.sun.degreeStr.split(' ')[0]})
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {chartData.planets.sun.nakshatraName} P{chartData.planets.sun.pada}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Janma Tithi</span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {chartData.panchanga.tithi.name}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {chartData.panchanga.tithi.paksha} Pakṣa
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-[#8C2D19]" />
              <span>Sūryodaya / Asta</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900 block truncate">
              {chartData.panchanga.sunTimes.sunrise} / {chartData.panchanga.sunTimes.sunset}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-serif">
              {chartData.panchanga.vara.name.split(' ')[0]}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Julian Day</span>
            <span className="text-xs font-mono font-bold text-slate-900 block truncate">
              {chartData.meta.julianDay}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              Yoga: {chartData.panchanga.yoga.name}
            </span>
          </div>
        </div>
      </div>

      {/* 6. STRUCTURED PROFESSIONAL 11-DOMAIN NAVIGATION SYSTEM */}
      <div className="space-y-3">
        {/* Tier 1: 11 Dedicated Domain Navigation Tabs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2">
            {NAV_DOMAINS.map((domain) => {
              const Icon = domain.icon;
              const isDomainActive = currentDomain.id === domain.id;

              return (
                <button
                  key={domain.id}
                  onClick={() => selectDomain(domain)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isDomainActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 w-full">
                    <Icon className={`w-4 h-4 ${isDomainActive ? 'text-[#D97706]' : 'text-[#8C2D19]'}`} />
                    {isDomainActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    )}
                  </div>
                  <div>
                    <span className={`text-xs font-serif font-bold block leading-snug ${isDomainActive ? 'text-white' : 'text-slate-900'}`}>
                      {domain.name}
                    </span>
                    <span className={`text-[10px] block mt-0.5 truncate ${isDomainActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {domain.shortName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Sub-module Segmented Navigation Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {currentDomain.subTabs.map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = activeTab === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSubActive
                      ? 'bg-[#8C2D19] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-[#8C2D19]'}`} />
                  <span>{sub.name}</span>
                  {sub.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isSubActive
                          ? 'bg-[#701E00] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Controls: Chart Style (North/South) & Dual View Toggle (when in Kuṇḍalī tab) */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {activeTab === 'kundali' && (
              <>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setChartStyle('north')}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      chartStyle === 'north'
                        ? 'bg-[#8C2D19] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="North Indian Diamond Chart"
                  >
                    North (Diamond)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartStyle('south')}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      chartStyle === 'south'
                        ? 'bg-[#8C2D19] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="South Indian 12-Box Chart"
                  >
                    South (Box)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartStyle('east')}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      chartStyle === 'east'
                        ? 'bg-[#8C2D19] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="East Indian (Bengali/Mithila) Chart"
                  >
                    East (Bengali)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDualViewMode(!dualViewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    dualViewMode
                      ? 'bg-[#8C2D19] text-white border-[#8C2D19] shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle Dual Chart View (e.g. D1 + D9 side by side)"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Dual View</span>
                </button>
              </>
            )}

            {/* Quick Jump Selector for all 14 calculation modules */}
            <div className="flex items-center gap-2 text-xs text-slate-600 pl-2 border-l border-slate-200">
              <span className="text-xs whitespace-nowrap font-medium">Jump:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as WorkspaceTab)}
                aria-label="Jump to calculation module"
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#8C2D19]"
              >
                {NAV_DOMAINS.map((dom) => (
                  <optgroup key={dom.id} label={dom.name}>
                    {dom.subTabs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 7. ACTIVE TAB VIEWPORT AREA */}
      <div className="min-h-[500px] space-y-6">
        {/* Category 1: Kundali & Vargas */}
        {activeTab === 'kundali' && (
          <div className="space-y-6">
            {dualViewMode ? (
              /* DUAL CHART SPLIT VIEW: D1 + Chosen Varga (e.g. D9 Navamsha) side-by-side */
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
                    <span className="text-sm font-serif font-bold text-slate-900">
                      Dual Synchronized Chart Inspection (D-1 Rāśi &amp; Divisional Varga)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-semibold">Secondary Chart:</span>
                    <select
                      value={dualSecondaryVarga}
                      onChange={(e) => setDualSecondaryVarga(e.target.value as VargaId)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8C2D19]"
                    >
                      {Object.entries(VARGA_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Chart: D-1 Lagna Rashi Chart */}
                  <div className="flex justify-center bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                    <KundaliChart
                      lagnaRashi={chartData.lagna.rashiNumber}
                      lagnaDegreeStr={chartData.lagna.degreeStr}
                      planets={chartData.planets}
                      title="Lagna Rāśi Kuṇḍalī (D-1)"
                      subtitle={`${selectedCity.name} • ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                      style={chartStyle}
                    />
                  </div>

                  {/* Right Chart: Selected Divisional Varga Chart (D-9, D-10, etc.) */}
                  <div className="flex justify-center bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                    {chartData.vargas[dualSecondaryVarga] ? (
                      <KundaliChart
                        lagnaRashi={chartData.vargas[dualSecondaryVarga].lagnaRashi}
                        planets={chartData.vargas[dualSecondaryVarga].planets}
                        title={chartData.vargas[dualSecondaryVarga].name}
                        subtitle={`${chartData.vargas[dualSecondaryVarga].significance}`}
                        style={chartStyle}
                      />
                    ) : (
                      <div className="p-12 text-center text-xs text-slate-500">
                        Varga chart not available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE CHART + DETAILED FACTORS VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* D-1 Vedic Square / Diamond Chart */}
                <div className="lg:col-span-6 flex justify-center bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <KundaliChart
                    lagnaRashi={chartData.lagna.rashiNumber}
                    lagnaDegreeStr={chartData.lagna.degreeStr}
                    planets={chartData.planets}
                    title="Lagna Rāśi Kuṇḍalī (D-1)"
                    subtitle={`${selectedCity.name} • ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                    style={chartStyle}
                  />
                </div>

                {/* Core Metrics & Ascendant Info */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-sm">
                    <h3 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-3.5">
                      Core Astronomical &amp; Ascendant Factors
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-xs text-slate-500 font-medium block">Ascendant (Lagna)</span>
                        <span className="text-base font-serif font-bold text-[#8C2D19] block">
                          {chartData.lagna.rashiName} ({chartData.lagna.degreeStr})
                        </span>
                        <span className="text-xs text-slate-600 block mt-1 font-mono">
                          Nakṣatra: {chartData.lagna.nakshatraName} (Pada {chartData.lagna.pada})
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-xs text-slate-500 font-medium block">Candra Rāśi (Moon Sign)</span>
                        <span className="text-base font-serif font-bold text-slate-900 block">
                          {chartData.planets.moon.rashiName} ({chartData.planets.moon.degreeStr})
                        </span>
                        <span className="text-xs text-slate-600 block mt-1 font-mono">
                          {chartData.planets.moon.nakshatraName} (Pada {chartData.planets.moon.pada})
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-xs text-slate-500 font-medium block">Sūrya Rāśi (Sun Sign)</span>
                        <span className="text-base font-serif font-bold text-slate-900 block">
                          {chartData.planets.sun.rashiName} ({chartData.planets.sun.degreeStr})
                        </span>
                        <span className="text-xs text-slate-600 block mt-1 font-mono">
                          {chartData.planets.sun.nakshatraName} (Pada {chartData.planets.sun.pada})
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-xs text-slate-500 font-medium block">Janma Tithi</span>
                        <span className="text-base font-serif font-bold text-slate-900 block">
                          {chartData.panchanga.tithi.name}
                        </span>
                        <span className="text-xs text-slate-600 block mt-1 font-mono">
                          {chartData.panchanga.tithi.paksha} Pakṣa ({chartData.panchanga.tithi.percentElapsed}%)
                        </span>
                      </div>
                    </div>

                    {/* Key Dignities Highlight */}
                    <div className="pt-2 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block font-serif">
                          Planetary Essential Dignity Highlights
                        </span>
                        {/* Legend */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#16845B]" />
                            <span className="text-slate-600 font-medium">Exalted</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#3B6FC4]" />
                            <span className="text-slate-600 font-medium">Friendly</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#667085]" />
                            <span className="text-slate-600 font-medium">Neutral</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#B54747]" />
                            <span className="text-slate-600 font-medium">Debilitated</span>
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {Object.values(chartData.planets).map((p) => {
                          const dig = p.dignity;
                          let bg = '#F2F4F7';
                          let border = '#667085';
                          let text = '#667085';
                          let dot = '#667085';

                          if (dig.startsWith('Exalted') || dig.includes('Ucca') || dig.includes('Uchcha')) {
                            bg = '#E8F5EF';
                            border = '#16845B';
                            text = '#16845B';
                            dot = '#16845B';
                          } else if (
                            dig.startsWith('Debilitated') ||
                            dig.includes('Neecha') ||
                            dig.startsWith('Enemy') ||
                            dig.startsWith('Great Enemy') ||
                            dig.includes('Shatru')
                          ) {
                            bg = '#FBECEC';
                            border = '#B54747';
                            text = '#B54747';
                            dot = '#B54747';
                          } else if (
                            dig.startsWith('Moolatrikona') ||
                            dig.startsWith('Own Sign') ||
                            dig.includes('Swakshetra') ||
                            dig.startsWith('Great Friend') ||
                            dig.startsWith('Friend') ||
                            dig.includes('Mitra')
                          ) {
                            bg = '#EDF3FC';
                            border = '#3B6FC4';
                            text = '#3B6FC4';
                            dot = '#3B6FC4';
                          }

                          return (
                            <div
                              key={p.id}
                              style={{
                                backgroundColor: bg,
                                borderColor: border,
                              }}
                              className="p-2.5 border rounded-xl flex items-center justify-between shadow-2xs transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: dot }}
                                />
                                <span className="font-bold text-slate-900">{p.sanskritName}</span>
                              </div>
                              <span
                                className="text-xs font-bold font-serif"
                                style={{ color: text }}
                              >
                                {p.dignity.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Panchanga Snapshot */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <span className="text-slate-500 block">Nitya Yoga:</span>
                      <strong className="text-slate-900 font-serif text-sm">{chartData.panchanga.yoga.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Karaṇa:</span>
                      <strong className="text-slate-900 font-serif text-sm">{chartData.panchanga.karana.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Vāra:</span>
                      <strong className="text-[#8C2D19] font-serif text-sm">{chartData.panchanga.vara.name.split(' ')[0]}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'avakahada' && (
          <AvakahadaPanel chart={chartData} />
        )}

        {activeTab === 'vargas' && (
          <VargasPanel
            vargas={chartData.vargas}
            vargottamaPlanets={chartData.vargottamaPlanets}
            onNavigateToNavamsha={() => setActiveTab('navamsha')}
            onNavigateToAshtakavarga={(vId) => {
              setAshtakavargaVargaId(vId);
              setActiveTab('ashtakavarga');
            }}
            onOpenSettings={() => setShowWorkspaceSettings(true)}
          />
        )}

        {activeTab === 'navamsha' && (
          <NavamshaPanel
            chart={chartData}
            onNavigateToVargaChart={() => setActiveTab('vargas')}
          />
        )}

        {activeTab === 'matching_bridge' && (
          <MatchingBridgePanel chart={chartData} />
        )}

        {/* Category 2: Planetary Sphuta & Spheres */}
        {activeTab === 'planets' && <PlanetaryTable planets={chartData.planets} />}

        {activeTab === 'sphutas' && <SphutasPanel chart={chartData} />}

        {/* Category 3: Bhavas & Aspects */}
        {activeTab === 'bhavas' && (
          <BhavaChalitPanel
            bhavas={chartData.bhavas}
            planets={chartData.planets}
            lagnaRashi={chartData.lagna.rashiNumber}
            lagnaLongitude={chartData.lagna.siderealLongitude}
            initialHouseSystem={houseSystem}
          />
        )}

        {activeTab === 'aspects' && (
          <AspectsPanel planets={chartData.planets} lagnaRashi={chartData.lagna.rashiNumber} />
        )}

        {/* Category 4: Dasha & Timing */}
        {activeTab === 'vimshottari' && (
          <VimshottariPanel
            chart={chartData}
            onOpenExtendedDashas={() => setActiveTab('extended_dashas')}
          />
        )}

        {activeTab === 'extended_dashas' && (
          <ExtendedDashaPanel
            chart={chartData}
            onBackToVimshottari={() => setActiveTab('vimshottari')}
          />
        )}

        {activeTab === 'jaimini' && (
          <JaiminiSpecialPanel
            jaimini={chartData.jaimini}
            specialPoints={chartData.specialPoints}
            planets={chartData.planets}
            lagnaRashi={chartData.lagna.rashiNumber}
            lagnaLongitude={chartData.lagna.siderealLongitude}
            birthYear={year}
          />
        )}

        {/* Category 5: Strengths & Potencies */}
        {activeTab === 'shadbala' && (
          <ShadbalaPanel shadbala={chartData.shadbala} vargas={chartData.vargas} />
        )}

        {/* Category 6: Ashtakavarga */}
        {activeTab === 'ashtakavarga' && (
          <AshtakavargaPanel
            ashtakavarga={chartData.ashtakavarga}
            lagnaRashi={chartData.lagna.rashiNumber}
            vargas={chartData.vargas}
            selectedVargaId={ashtakavargaVargaId}
            onSelectVarga={setAshtakavargaVargaId}
          />
        )}

        {/* Category 7: Classical Yogas */}
        {activeTab === 'yogas' && <YogasPanel yogas={chartData.yogas} chart={chartData} />}

        {/* Category 8: Classical Doshas & Ariṣṭa */}
        {activeTab === 'doshas' && (
          <DoshasPanel
            chart={chartData}
            onNavigateToRemedies={() => setActiveTab('remedies')}
          />
        )}

        {activeTab === 'remedies' && (
          <RemediesPanel
            chart={chartData}
            onNavigateToDosha={() => setActiveTab('doshas')}
          />
        )}

        {/* Category 9: Gocara & Transits */}
        {activeTab === 'transits' && (
          <TransitsPanel
            natalPlanets={chartData.planets}
            natalMoonRashi={chartData.planets.moon.rashiNumber}
            natalLagnaRashi={chartData.lagna.rashiNumber}
            ayanamshaType={ayanamshaType}
          />
        )}

        {/* Category 10: Panchanga & Muhurta (Janma Panchanga & Birth Chart Details) */}
        {activeTab === 'panchanga' && (
          <JanmaPanchangaPanel
            chart={chartData}
            year={year}
            month={month}
            day={day}
            hour={hour}
            minute={minute}
            second={second}
            cityName={selectedCity.name}
          />
        )}

        {/* Category 11: Classical Chart Indications */}
        {activeTab === 'indications' && (
          <IndicationsPanel chart={chartData} />
        )}
      </div>

      {/* Workspace Settings Dialog */}
      <WorkspaceSettingsDialog
        open={showWorkspaceSettings}
        onOpenChange={setShowWorkspaceSettings}
        onSettingsApplied={(newSettings) => {
          setChartStyle(newSettings.chartStyle);
          setHouseSystem(newSettings.houseSystem);
          setDualViewMode(newSettings.dualViewMode);
          setDualSecondaryVarga(newSettings.dualSecondaryVarga);
          if (newSettings.ayanamsha) {
            setAyanamshaType(newSettings.ayanamsha);
          }
        }}
      />
    </div>
  );
};
