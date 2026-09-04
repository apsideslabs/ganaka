'use client';

/**
 * Gaṇaka — Dedicated Pañcāṅga & Muhūrta Workstation
 * Clean, structured, un-capped astronomical calculation environment modeled on the Main Workspace.
 * Features:
 * 1. Executive Command Deck with Day Steppers (-30d, -7d, -1d, Today, +1d, +7d, +30d) & Quick Actions
 * 2. Key Ephemeris Astronomical Metrics Strip
 * 3. 2-Tier Non-Sticky Structured Domain Navigation (3 Shāstric Domains & 9 Tools)
 * 4. Full-Width Un-Capped Active Tool Canvas
 */

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CITIES_DATABASE, CityLocation, formatDMS } from '@/lib/astronomy/coordinates';
import {
  AYANAMSHA_DEFINITIONS,
  AyanamshaType,
  calculateAyanamsha,
  formatAyanamsha,
} from '@/lib/astronomy/ayanamsha';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { calculateAllPlanets, calculateSolarTimes } from '@/lib/astronomy/ephemeris';
import { calculatePanchanga } from '@/lib/jyotisha/panchanga';
import { calculateDailyHoras } from '@/lib/jyotisha/muhurta-advanced';
import { PanchangaViewTab } from './types';
import { PanchangaHeader } from './PanchangaHeader';
import { PanchangaDailyView } from './PanchangaDailyView';
import { PanchangaCalendarView } from './PanchangaCalendarView';
import { PanchangaMonthlyView } from './PanchangaMonthlyView';
import { PanchangaYearlyView } from './PanchangaYearlyView';
import { PanchangaLagnaView } from './PanchangaLagnaView';
import { PanchangaPlanetaryHoras } from './PanchangaPlanetaryHoras';
import { PanchangaChoghadiya } from './PanchangaChoghadiya';
import { PanchangaMuhurtaMatrix } from './PanchangaMuhurtaMatrix';
import { MuhurtaFinderPanel } from '@/components/muhurta/MuhurtaFinderPanel';
import { PanchangaSettingsDialog } from '@/components/settings/PanchangaSettingsDialog';
import { RASHIS } from '@/lib/jyotisha/constants';
import { RashiNumber } from '@/lib/jyotisha/types';
import { getPlatformSettings, subscribeToSettings } from '@/lib/settings/settings-storage';
import { DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '@/lib/settings/types';

import {
  Award,
  Sparkles,
  Clock,
  Sun,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Copy,
  Printer,
  RefreshCw,
  Settings,
} from 'lucide-react';

interface PanchangaClientProps {
  initialTab?: PanchangaViewTab;
}

// 3 Structured Shastric Domains encompassing all 9 tools
interface DomainGroup {
  id: 'calendrics' | 'time_dynamics' | 'muhurta';
  title: string;
  sanskritTitle: string;
  description: string;
  tabs: Array<{
    id: PanchangaViewTab;
    title: string;
    sanskritName: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }>;
}

const PANCHANGA_DOMAINS: DomainGroup[] = [
  {
    id: 'calendrics',
    title: 'Calendrics & Almanac',
    sanskritTitle: 'कालपञ्चाङ्ग',
    description: 'Daily 5 limbs, solar-lunar physics, monthly ephemeris grid & yearly Saṁvatsara',
    tabs: [
      {
        id: 'daily',
        title: 'Daily Pañcāṅga',
        sanskritName: 'दैनिक पञ्चाङ्ग',
        subtitle: '5 Classical Limbs, Sun/Moon Ephemeris & Dina-Māna',
        icon: Layers,
      },
      {
        id: 'calendar',
        title: 'Calendar Grid',
        sanskritName: 'मासिक चक्र',
        subtitle: 'Interactive Monthly Grid, Moon Phases & Festivals',
        icon: Calendar,
      },
      {
        id: 'monthly',
        title: 'Monthly Ledger',
        sanskritName: 'मासिक पञ्चाङ्ग',
        subtitle: 'Tabular Ephemeris Ledger & Detailed Drik Calculations',
        icon: FileSpreadsheet,
      },
      {
        id: 'yearly',
        title: 'Yearly Almanac',
        sanskritName: 'वार्षिक पञ्चाङ्ग',
        subtitle: 'Saṁvatsara, 12 Solar Saṅkrāntis & 6 Vedic Ṛtus',
        icon: Compass,
      },
    ],
  },
  {
    id: 'time_dynamics',
    title: 'Time & Diurnal Dynamics',
    sanskritTitle: 'दिनमान एवं लग्न',
    description: 'Sub-day horary divisions, rising ascendants, planetary hours & Choghadiyā cycles',
    tabs: [
      {
        id: 'lagna',
        title: 'Rising Lagnas',
        sanskritName: 'लग्न सारणी',
        subtitle: '24-Hour Ascendant Entry & Exit Horizon Times',
        icon: Clock,
      },
      {
        id: 'horas',
        title: '24 Planetary Horās',
        sanskritName: 'होरा चक्र',
        subtitle: 'Diurnal & Nocturnal Planetary Hours & Ruling Grahas',
        icon: Sun,
      },
      {
        id: 'choghadiya',
        title: 'Choghadiyā Cycles',
        sanskritName: 'चौघड़िया',
        subtitle: 'Day & Night 8-fold Muhūrtas with Planetary Rulers',
        icon: Award,
      },
    ],
  },
  {
    id: 'muhurta',
    title: 'Auspicious Electional Muhūrta',
    sanskritTitle: 'मुहूर्त निर्णय',
    description: 'Deterministic classical electional search & daily auspicious/inauspicious windows',
    tabs: [
      {
        id: 'muhurta',
        title: 'Muhūrta Windows',
        sanskritName: 'मुहूर्त वेला',
        subtitle: 'Abhijit, Brahma Muhūrta, Rāhu Kāla, Gulika & Yamagaṇḍa',
        icon: Sparkles,
      },
      {
        id: 'finder',
        title: 'Muhūrta Finder',
        sanskritName: 'मुहूर्त शोधक',
        subtitle: 'Classical Shāstric Electional Engine with Dosha Filtering',
        icon: Search,
        badge: 'SHASTRA',
      },
    ],
  },
];

export function PanchangaClient({ initialTab = 'daily' }: PanchangaClientProps) {
  const today = useMemo(() => new Date(), []);

  // 1. Date State (Default: Today at 12:00 Solar Midday)
  const [date, setDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0)
  );

  // 2. Location & Ayanamsha State (Initialized from Platform Settings)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  const initialLocation = useMemo<CityLocation>(() => {
    const loc = platformSettings.defaultLocation;
    if (loc && typeof loc.latitude === 'number') {
      return {
        name: loc.name,
        country: loc.country || 'India',
        stateOrRegion: loc.stateOrRegion,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezoneOffsetHours: loc.timezoneOffsetHours,
        timezoneName: loc.timezoneName || 'IST',
      };
    }
    return (
      CITIES_DATABASE.find((c) => c.name.toLowerCase().includes('ujjain')) ||
      CITIES_DATABASE[0] || {
        name: 'Ujjain (Avanti - Prime Meridian)',
        country: 'India',
        latitude: 23.1765,
        longitude: 75.7885,
        timezoneOffsetHours: 5.5,
        timezoneName: 'IST',
      }
    );
  }, [platformSettings.defaultLocation]);

  const [selectedCity, setSelectedCity] = useState<CityLocation>(initialLocation);
  const [customLat, setCustomLat] = useState<string>(initialLocation.latitude.toString());
  const [customLng, setCustomLng] = useState<string>(initialLocation.longitude.toString());
  const [customTz, setCustomTz] = useState<string>(initialLocation.timezoneOffsetHours.toString());

  // 3. Ayanāṃśa & Active Workspace Tab
  const [ayanamshaType, setAyanamshaType] = useState<AyanamshaType>(() => platformSettings.defaultAyanamsha || 'lahiri');
  const [activeTab, setActiveTab] = useState<PanchangaViewTab>(initialTab);
  const [showControlDeck, setShowControlDeck] = useState<boolean>(false);
  const [showPanchangaSettings, setShowPanchangaSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Subscribe to platform settings updates so changes in settings modal are real and live!
  useEffect(() => {
    const timer = setTimeout(() => {
      const initial = getPlatformSettings();
      setPlatformSettings(initial);
    }, 0);

    const unsubscribe = subscribeToSettings((scope) => {
      if (scope === 'platform') {
        const fresh = getPlatformSettings();
        setPlatformSettings(fresh);
        if (fresh.defaultLocation) {
          const newCity: CityLocation = {
            name: fresh.defaultLocation.name,
            country: fresh.defaultLocation.country || 'India',
            stateOrRegion: fresh.defaultLocation.stateOrRegion,
            latitude: fresh.defaultLocation.latitude,
            longitude: fresh.defaultLocation.longitude,
            timezoneOffsetHours: fresh.defaultLocation.timezoneOffsetHours,
            timezoneName: fresh.defaultLocation.timezoneName || 'IST',
          };
          setSelectedCity(newCity);
          setCustomLat(newCity.latitude.toString());
          setCustomLng(newCity.longitude.toString());
          setCustomTz(newCity.timezoneOffsetHours.toString());
        }
        if (fresh.defaultAyanamsha) {
          setAyanamshaType(fresh.defaultAyanamsha);
        }
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Quick Day Stepper
  const shiftDays = (deltaDays: number) => {
    setDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + deltaDays);
      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
  };

  // 4. Astronomical Computations (Derived from Date & Location)
  const calculationData = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const lat = parseFloat(customLat) || selectedCity.latitude;
    const lng = parseFloat(customLng) || selectedCity.longitude;
    const tz = parseFloat(customTz) || selectedCity.timezoneOffsetHours;

    // Step 1: Solar Midday JD to derive precise astronomical sunrise for this date
    const utNoon = 12.0 - tz;
    const jdNoon = calculateJulianDay(year, month, day, utNoon);
    const solarTimes = calculateSolarTimes(jdNoon, lat, lng, tz);

    // Step 2: Exact Sunrise JD for the date (Udaya Kāla anchor)
    const jdSunrise = solarTimes.sunriseJD;
    const jd = jdSunrise + 0.0001;

    // Step 3: Precise Ayanāṃśa
    const ayanamshaVal = calculateAyanamsha(jd, ayanamshaType);
    const ayanamshaFormatted = formatAyanamsha(ayanamshaVal);

    // Step 4: Ephemeris Planets at exact Sunrise
    const planets = calculateAllPlanets(jd, ayanamshaType);

    // Step 5: Master Pañcāṅga Result
    const panchanga = calculatePanchanga(
      planets.sun.siderealLongitude,
      planets.moon.siderealLongitude,
      jd,
      lat,
      lng,
      tz,
      ayanamshaType
    );

    // 24 Planetary Horās derived from sunrise weekday
    const horas = calculateDailyHoras(panchanga.vara.number, 6);

    return {
      year,
      month,
      day,
      lat,
      lng,
      tz,
      jd,
      ayanamshaVal,
      ayanamshaFormatted,
      planets,
      panchanga,
      horas,
      solarTimes,
    };
  }, [date, selectedCity, customLat, customLng, customTz, ayanamshaType]);

  const { panchanga, planets, horas, jd, ayanamshaFormatted } = calculationData;

  // Active domain calculation
  const currentDomain = useMemo(() => {
    for (const domain of PANCHANGA_DOMAINS) {
      if (domain.tabs.some((t) => t.id === activeTab)) {
        return domain;
      }
    }
    return PANCHANGA_DOMAINS[0];
  }, [activeTab]);

  const selectDomain = (domain: DomainGroup) => {
    if (!domain.tabs.some((t) => t.id === activeTab)) {
      setActiveTab(domain.tabs[0].id);
    }
  };

  // Derived signs for metrics bar
  const sunRashiNum = (Math.floor(planets.sun.siderealLongitude / 30) + 1) as RashiNumber;
  const moonRashiNum = (Math.floor(planets.moon.siderealLongitude / 30) + 1) as RashiNumber;
  const sunRashiInfo = RASHIS[sunRashiNum];
  const moonRashiInfo = RASHIS[moonRashiNum];

  // Copy Pañcāṅga Summary to Clipboard
  const copySummary = () => {
    const summaryText = `Gaṇaka Drik Pañcāṅga
Date: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Location: ${selectedCity.name} (${selectedCity.latitude.toFixed(4)}°N, ${selectedCity.longitude.toFixed(4)}°E)
Ayanāṃśa: ${ayanamshaFormatted} (${AYANAMSHA_DEFINITIONS[ayanamshaType]?.name || ayanamshaType})
Māsa: ${panchanga.calendar.lunarMonth.amantaName} (${panchanga.tithi.paksha} Pakṣa)
Saṁvat: ${panchanga.calendar.eras.vikramaSamvat} Vikrama / ${panchanga.calendar.eras.shakaSamvat} Śaka (${panchanga.calendar.eras.samvatsara60.name})

The Five Limbs (Pañca-Aṅga):
1. Vāra: ${panchanga.vara.name} (${panchanga.vara.sanskritName}) - Lord: ${panchanga.vara.lord}
2. Tithi: ${panchanga.tithi.name} (${panchanga.tithi.sanskritName}) - Ends: ${panchanga.tithi.endTime}
3. Nakṣatra: ${panchanga.nakshatra.name} Pāda ${panchanga.nakshatra.pada} - Ends: ${panchanga.nakshatra.endTime} - Lord: ${panchanga.nakshatra.lord}
4. Yoga: ${panchanga.yoga.name} (#${panchanga.yoga.number}/27) - Ends: ${panchanga.yoga.endTime}
5. Karaṇa: ${panchanga.karana.name} (${panchanga.karana.type}) - Ends: ${panchanga.karana.endTime}

Solar & Lunar Horizons:
Sunrise: ${panchanga.sunTimes.sunrise} | Sunset: ${panchanga.sunTimes.sunset}
Moonrise: ${panchanga.sunTimes.moonrise} | Moonset: ${panchanga.sunTimes.moonset}
Dina-Māna: ${panchanga.sunTimes.dayDuration} (${panchanga.sunTimes.dayDurationGhatis})

Key Muhūrta Windows:
Abhijit Muhūrta: ${panchanga.muhurtas.abhijit}
Brāhma Muhūrta: ${panchanga.muhurtas.brahmaMuhurta}
Amṛta Kāla: ${panchanga.muhurtas.amritKalam}
Rāhu Kāla: ${panchanga.muhurtas.rahukala}
Yamagaṇḍa: ${panchanga.muhurtas.yamaghanta}
Gulika Kāla: ${panchanga.muhurtas.gulikakala}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6 text-slate-900">
      {/* 1. MASTER EXECUTIVE COMMAND DECK CARD (MODELED ON MAIN WORKSPACE) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C2D19] bg-[#8C2D19]/10 px-2.5 py-0.5 rounded-md border border-[#8C2D19]/20">
                Classical Pañcāṅga Workstation
              </span>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Ayanāṃśa:{' '}
                <strong className="text-slate-900">
                  {AYANAMSHA_DEFINITIONS[ayanamshaType]?.name || ayanamshaType}
                </strong>{' '}
                ({ayanamshaFormatted})
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                Drik Siddhānta Ephemeris
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
              <span>Pañcāṅga &amp; Muhūrta Workstation</span>
              <span className="text-sm sm:text-base font-serif text-[#8C2D19] font-medium hidden md:inline">
                (पञ्चाङ्ग एवं मुहूर्त महापीठम्)
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap font-mono">
              <span className="font-bold text-slate-900">
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-[#8C2D19]">
                {panchanga.calendar.lunarMonth.amantaName} Māsa ({panchanga.tithi.paksha} Pakṣa)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">
                {selectedCity.name} ({formatDMS(selectedCity.latitude, true)},{' '}
                {formatDMS(selectedCity.longitude, false)})
              </span>
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            <button
              type="button"
              onClick={() => setShowControlDeck(!showControlDeck)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                showControlDeck
                  ? 'bg-[#8C2D19] text-white border-[#8C2D19]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showControlDeck ? 'Hide Location / Date' : 'Change Location / Date'}</span>
              {showControlDeck ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              id="panchanga-settings-btn"
              onClick={() => setShowPanchangaSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Pañcāṅga & Muhūrta Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Copy Pañcāṅga Summary"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-xs rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/workspace"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase font-bold text-white bg-slate-900 hover:bg-[#8C2D19] rounded-xl transition-all shadow-2xs select-none"
            >
              <span>Kuṇḍalī Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Day Stepper & Quick Date Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-slate-600 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8C2D19]" />
              <span>Date Stepper:</span>
            </span>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => shiftDays(-30)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Previous Month (-30 Days)"
              >
                -30d
              </button>
              <button
                type="button"
                onClick={() => shiftDays(-7)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Previous Week (-7 Days)"
              >
                -7d
              </button>
              <button
                type="button"
                onClick={() => shiftDays(-1)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Previous Day (-1 Day)"
              >
                -1d
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1 bg-amber-50 border border-amber-200 text-[#8C2D19] rounded-md hover:bg-amber-100 cursor-pointer shadow-2xs font-bold transition-colors"
                title="Jump to Today"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftDays(1)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Next Day (+1 Day)"
              >
                +1d
              </button>
              <button
                type="button"
                onClick={() => shiftDays(7)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Next Week (+7 Days)"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => shiftDays(30)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer shadow-2xs font-semibold transition-colors"
                title="Next Month (+30 Days)"
              >
                +30d
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goToToday}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#8C2D19] font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Real-Time Today</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finder')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#8C2D19] text-white rounded-lg font-semibold hover:bg-[#701E00] transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muhūrta Finder</span>
            </button>
          </div>
        </div>

        {/* Collapsible Location & Date Control Drawer */}
        {showControlDeck && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in duration-150">
            <PanchangaHeader
              date={date}
              onDateChange={setDate}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              customLat={customLat}
              onLatChange={setCustomLat}
              customLng={customLng}
              onLngChange={setCustomLng}
              customTz={customTz}
              onTzChange={setCustomTz}
              ayanamshaType={ayanamshaType}
              onAyanamshaChange={setAyanamshaType}
              ayanamshaFormatted={ayanamshaFormatted}
              jd={jd}
            />
          </div>
        )}

        {/* Astronomical Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 pt-6 border-t border-slate-100">
          {/* 1. Vāra */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Vāra (Weekday)
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {panchanga.vara.name}
            </span>
            <span className="text-[11px] text-[#8C2D19] block truncate font-mono font-medium">
              Lord: {panchanga.vara.lord.toUpperCase()}
            </span>
          </div>

          {/* 2. Tithi */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Tithi (Lunar Day)
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {panchanga.tithi.name}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {panchanga.tithi.paksha} Pakṣa (#{panchanga.tithi.number})
            </span>
          </div>

          {/* 3. Nakṣatra */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Nakṣatra &amp; Pāda
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {panchanga.nakshatra.name}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              Pāda {panchanga.nakshatra.pada} • {panchanga.nakshatra.lord}
            </span>
          </div>

          {/* 4. Signs */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Candra &amp; Sūrya Rāśi
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {moonRashiInfo?.name} / {sunRashiInfo?.name}
            </span>
            <span className="text-[11px] text-[#8C2D19] block truncate font-mono font-medium">
              {panchanga.calendar.lunarMonth.amantaName} Māsa
            </span>
          </div>

          {/* 5. Sunrise / Sunset */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Sūryodaya / Sūryāsta
            </span>
            <span className="text-xs font-mono font-bold text-slate-900 block truncate">
              {panchanga.sunTimes.sunrise} – {panchanga.sunTimes.sunset}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              Dina: {panchanga.sunTimes.dayDurationGhatis}
            </span>
          </div>

          {/* 6. Saṁvatsara */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Saṁvatsara &amp; Ṛtu
            </span>
            <span className="text-sm font-bold text-slate-900 block truncate font-serif">
              {panchanga.calendar.eras.samvatsara60.name}
            </span>
            <span className="text-[11px] text-slate-600 block truncate font-mono">
              {panchanga.calendar.rtu.name} • {panchanga.calendar.ayana.name}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STRUCTURED PROFESSIONAL 3-DOMAIN NAVIGATION SYSTEM */}
      <div className="space-y-3">
        {/* Tier 1: 3 Dedicated Domain Navigation Cards */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PANCHANGA_DOMAINS.map((domain) => {
              const isDomainActive = currentDomain.id === domain.id;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => selectDomain(domain)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isDomainActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 w-full">
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        isDomainActive ? 'text-[#D97706]' : 'text-[#8C2D19]'
                      }`}
                    >
                      {domain.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-serif ${
                          isDomainActive ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {domain.sanskritTitle}
                      </span>
                      {isDomainActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[11px] block ${
                        isDomainActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {domain.description}
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
            {currentDomain.tabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isTabActive
                      ? 'bg-[#8C2D19] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isTabActive ? 'text-white' : 'text-[#8C2D19]'}`}
                  />
                  <span>{tab.title}</span>
                  <span
                    className={`text-[10px] font-serif ${
                      isTabActive ? 'text-amber-200' : 'text-slate-400'
                    }`}
                  >
                    ({tab.sanskritName})
                  </span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isTabActive
                          ? 'bg-[#701E00] text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Jump Selector Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-mono text-slate-500 hidden lg:inline">Quick Jump:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as PanchangaViewTab)}
              aria-label="Jump to calculation module"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#8C2D19]"
            >
              {PANCHANGA_DOMAINS.map((dom) => (
                <optgroup key={dom.id} label={`${dom.title} (${dom.sanskritTitle})`}>
                  {dom.tabs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} — {t.sanskritName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE TAB VIEWPORT AREA */}
      <div className="min-h-[500px] space-y-6">
        {/* 1. DAILY PAÑCĀṄGA */}
        {activeTab === 'daily' && (
          <PanchangaDailyView
            panchanga={panchanga}
            planets={planets}
            date={date}
            cityName={selectedCity.name}
            ayanamshaFormatted={ayanamshaFormatted}
            jd={jd}
            onNavigateToTab={(tab) => setActiveTab(tab as PanchangaViewTab)}
          />
        )}

        {/* 2. CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <PanchangaCalendarView
            selectedDate={date}
            onSelectDate={setDate}
            selectedCity={selectedCity}
            ayanamshaType={ayanamshaType}
          />
        )}

        {/* 3. MONTHLY PAÑCĀṄGA LEDGER */}
        {activeTab === 'monthly' && (
          <PanchangaMonthlyView
            selectedDate={date}
            onSelectDate={setDate}
            selectedCity={selectedCity}
            ayanamshaType={ayanamshaType}
          />
        )}

        {/* 4. YEARLY PAÑCĀṄGA */}
        {activeTab === 'yearly' && (
          <PanchangaYearlyView
            selectedDate={date}
            onSelectDate={setDate}
            selectedCity={selectedCity}
            ayanamshaType={ayanamshaType}
            onNavigateToTab={(tab) => setActiveTab(tab as PanchangaViewTab)}
          />
        )}

        {/* 5. LAGNA TABLE */}
        {activeTab === 'lagna' && (
          <PanchangaLagnaView
            date={date}
            selectedCity={selectedCity}
            ayanamshaType={ayanamshaType}
            sunriseStr={panchanga.sunTimes.sunrise}
            sunsetStr={panchanga.sunTimes.sunset}
          />
        )}

        {/* 6. PLANETARY HORĀS */}
        {activeTab === 'horas' && <PanchangaPlanetaryHoras horas={horas} />}

        {/* 7. CHOGHADIYĀ CYCLES */}
        {activeTab === 'choghadiya' && <PanchangaChoghadiya panchanga={panchanga} />}

        {/* 8. MUHŪRTA WINDOWS */}
        {activeTab === 'muhurta' && <PanchangaMuhurtaMatrix panchanga={panchanga} />}

        {/* 9. MUHŪRTA FINDER */}
        {activeTab === 'finder' && (
          <MuhurtaFinderPanel
            currentDate={date}
            selectedCity={selectedCity}
            ayanamshaType={ayanamshaType}
            onSelectResultDate={(newDate) => {
              setDate(newDate);
              setActiveTab('daily');
            }}
          />
        )}
      </div>

      {/* Pañcāṅga Settings Dialog */}
      <PanchangaSettingsDialog
        open={showPanchangaSettings}
        onOpenChange={setShowPanchangaSettings}
        onSettingsApplied={(newSettings) => {
          setAyanamshaType(newSettings.ayanamsha);
          setActiveTab(newSettings.defaultTab);
        }}
      />
    </div>
  );
}
