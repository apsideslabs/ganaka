'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ArrowRight,
  Search,
  Sliders,
  Settings,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';
import { CITIES_DATABASE, CityLocation, searchLocations } from '@/lib/astronomy/coordinates';
import { useCitySearch } from '@/hooks/use-city-search';
import { formatPlace, formatPlaceRegion } from '@/lib/format-place';
import { getPreferredCountry, setPreferredCountry, deviceTimezone } from '@/lib/astronomy/geo-bias';
import { availableCountries, countryForTimezone } from '@/lib/astronomy/city-index';
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { GanakaDatePicker } from '@/components/ui/GanakaDatePicker';
import { GanakaClockPicker, TimeValue } from '@/components/ui/GanakaClockPicker';
import { CelestialArmillaryLoading } from '@/components/ui/CelestialArmillaryLoading';
import {
  getPlatformSettings,
  savePlatformSettings,
  saveWorkspaceSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '@/lib/settings/types';
import { useTranslation } from '@/lib/i18n/use-translation';

export function HomeBirthDetailsPanel() {
  const router = useRouter();
  const { t } = useTranslation();

  // Loading indicator for instant button state
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isQuickFilling, setIsQuickFilling] = useState<boolean>(false);
  const [usedDefaultLocSuccess, setUsedDefaultLocSuccess] = useState<boolean>(false);

  // Platform settings - initialize with static defaults to ensure SSR/CSR hydration match
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  // Core Form States
  const [chartName, setChartName] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [tob, setTob] = useState<TimeValue | null>(null);

  // Location States
  const [selectedCity, setSelectedCity] = useState<CityLocation | null>(null);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);

  // Tracks the last default location applied, so a settings change is picked
  // up but a user-typed city is not overwritten.
  const appliedLocationKey = useRef<string | null>(null);

  // Search region preference (which country's places rank first)
  const [searchCountry, setSearchCountry] = useState<string>(() => getPreferredCountry() || '');
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Settings Modal / Drawer State
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Populate the region list once the place index has loaded, and record what
  // the device timezone suggests so "Auto" can say which country it picked.
  useEffect(() => {
    const fill = () => {
      const list = availableCountries();
      if (list.length > 0) setCountryOptions(list);
      setDetectedCountry(countryForTimezone(deviceTimezone()));
    };
    fill();
    const t1 = setTimeout(fill, 1500);
    const t2 = setTimeout(fill, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Advanced Configuration (inside Settings modal)
  const [isCustomCoordinates, setIsCustomCoordinates] = useState<boolean>(false);
  const [customCityName, setCustomCityName] = useState<string>('');
  const [customLat, setCustomLat] = useState<number>(23.1765);
  const [customLng, setCustomLng] = useState<number>(75.7885);
  const [customTz, setCustomTz] = useState<number>(5.5);

  const [ayanamshaType, setAyanamshaType] = useState<AyanamshaType>('lahiri');
  const [houseSystem, setHouseSystem] = useState<'equal_whole' | 'sripati' | 'placidus'>('equal_whole');

  useEffect(() => {
    // Read local storage settings safely on client mount without triggering SSR hydration mismatch
    const applyFresh = (fresh: PlatformSettings, isInitial = false) => {
      setPlatformSettings(fresh);
      if (fresh.defaultAyanamsha && fresh.defaultAyanamsha in AYANAMSHA_DEFINITIONS) {
        setAyanamshaType(fresh.defaultAyanamsha);
      }
      // Apply the Platform Settings location on first load, and again whenever
      // it actually changes - so picking a place in Settings updates this form
      // without overwriting a city the user has already typed here.
      const defaultLoc = fresh.defaultLocation;
      const locKey =
        defaultLoc && typeof defaultLoc.latitude === 'number'
          ? `${defaultLoc.name}|${defaultLoc.latitude}|${defaultLoc.longitude}`
          : null;
      if (
        locKey &&
        defaultLoc &&
        (isInitial || appliedLocationKey.current !== locKey)
      ) {
        appliedLocationKey.current = locKey;
        const city: CityLocation = {
          name: defaultLoc.name,
          country: defaultLoc.country || 'India',
          stateOrRegion: defaultLoc.stateOrRegion,
          latitude: defaultLoc.latitude,
          longitude: defaultLoc.longitude,
          timezoneOffsetHours: defaultLoc.timezoneOffsetHours,
          timezoneName: defaultLoc.timezoneName || 'IST',
        };
        setSelectedCity(city);
        setLocationQuery(formatPlace(city));
      }
    };

    const timer = setTimeout(() => {
      applyFresh(getPlatformSettings(), true);
    }, 0);

    const unsubscribe = subscribeToSettings((scope) => {
      if (scope === 'platform' || scope === 'workspace') {
        applyFresh(getPlatformSettings(), false);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Filtered Locations (curated + full GeoNames index, incl. Indian villages)
  const locationResults = useCitySearch(locationQuery, 40, 8);

  // Use Default Location handler
  const handleApplyDefaultLocation = () => {
    const loc = platformSettings.defaultLocation;
    if (loc && typeof loc.latitude === 'number') {
      const city: CityLocation = {
        name: loc.name,
        country: loc.country || 'India',
        stateOrRegion: loc.stateOrRegion,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezoneOffsetHours: loc.timezoneOffsetHours,
        timezoneName: loc.timezoneName || 'IST',
      };
      setSelectedCity(city);
      setLocationQuery(formatPlace(city));
      setIsCustomCoordinates(false);
      setUsedDefaultLocSuccess(true);
      setTimeout(() => setUsedDefaultLocSuccess(false), 2000);
    }
  };

  // Quick Fill Gochar handler
  const handleQuickFillGochar = () => {
    setIsQuickFilling(true);
    const now = new Date();
    setDob(now);
    setTob({
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    });
    if (!chartName) {
      setChartName(`Gochar Transits (${now.toLocaleDateString()})`);
    }
    // Also apply default location if no location selected
    if (!selectedCity && !customCityName) {
      handleApplyDefaultLocation();
    }
    setTimeout(() => setIsQuickFilling(false), 400);
  };

  // Validation Checks — Required: Location, DOB, TOB
  const isLocationValid = isCustomCoordinates
    ? customCityName.trim().length > 0 && !isNaN(customLat) && !isNaN(customLng) && !isNaN(customTz)
    : selectedCity !== null;
  const isDobValid = dob !== null;
  const isTobValid = tob !== null;
  const isFormValid = isLocationValid && isDobValid && isTobValid;

  // Submit and Navigate to Workspace
  const handleCalculateChart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid || !dob || !tob) return;

    const finalYear = dob.getFullYear();
    const finalMonth = dob.getMonth() + 1;
    const finalDay = dob.getDate();
    const finalHour = tob.hour;
    const finalMinute = tob.minute;
    const finalSecond = tob.second || 0;

    const finalLat = isCustomCoordinates ? customLat : selectedCity!.latitude;
    const finalLng = isCustomCoordinates ? customLng : selectedCity!.longitude;
    const finalTz = isCustomCoordinates ? customTz : selectedCity!.timezoneOffsetHours;
    const finalCity = isCustomCoordinates ? customCityName : selectedCity!.name;
    const finalName = chartName.trim() || 'Jātaka';

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'ganaka_chart_params',
          JSON.stringify({
            name: finalName,
            year: finalYear,
            month: finalMonth,
            day: finalDay,
            hour: finalHour,
            minute: finalMinute,
            second: finalSecond,
            cityName: finalCity,
            latitude: finalLat,
            longitude: finalLng,
            timezone: finalTz,
            ayanamsha: ayanamshaType,
            houseSystem,
          })
        );
      } catch (err) {
        console.error('LocalStorage write error', err);
      }
    }

    const params = new URLSearchParams({
      name: finalName,
      year: finalYear.toString(),
      month: finalMonth.toString(),
      day: finalDay.toString(),
      hour: finalHour.toString(),
      minute: finalMinute.toString(),
      second: finalSecond.toString(),
      city: finalCity,
      lat: finalLat.toFixed(4),
      lng: finalLng.toFixed(4),
      tz: finalTz.toString(),
      ayan: ayanamshaType,
      house: houseSystem,
    });

    setIsCalculating(true);
    router.push(`/workspace?${params.toString()}`);
  };

  const defaultLocName = platformSettings.defaultLocation?.name || 'Default';

  return (
    <div
      id="home-birth-details-panel"
      className="w-full max-w-4xl mx-auto bg-white border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-900/5 relative z-20 overflow-hidden"
    >
      {/* Header with Quick Fill and Settings Button */}
      <div className="bg-stone-50/90 px-6 sm:px-8 py-4.5 border-b border-stone-200/80 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8C2D19] ring-4 ring-[#8C2D19]/15" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
              {t.birthPanel.title}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            {t.birthPanel.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Fill Gochar Button */}
          <button
            type="button"
            onClick={handleQuickFillGochar}
            id="home-quick-fill-gochar-btn"
            title="Populate with current time and transits"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white hover:bg-stone-50 text-[#8C2D19] border border-stone-200 hover:border-[#8C2D19]/40 rounded-lg shadow-xs transition-all btn-press-tactile cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {isQuickFilling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C2D19]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#8C2D19]" />
            )}
            <span>{t.birthPanel.quickFillGochar}</span>
          </button>

          {/* Config Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            id="home-settings-gear-btn"
            title="Advanced Settings (Ayanāṃśa, Custom Coordinates, House Systems)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 rounded-lg shadow-xs transition-all cursor-pointer btn-press-tactile focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Main Form with Gaṇaka Custom Controls */}
      <form onSubmit={handleCalculateChart} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
          {/* 1. Native's Name (Optional) */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider font-semibold text-stone-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>{t.birthPanel.chartNameLabel}</span>
              <span className="text-[11px] font-normal text-stone-400 lowercase">(optional)</span>
            </label>
            <input
              type="text"
              id="home-native-name-input"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder={t.birthPanel.chartNamePlaceholder}
              className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#8C2D19] focus:bg-white focus:ring-2 focus:ring-[#8C2D19]/15 transition-all"
            />
          </div>

          {/* 2. Location (City search) - Required */}
          <div className="lg:col-span-6 space-y-1.5 relative">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-mono uppercase tracking-wider font-semibold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8C2D19]" />
                <span>{t.birthPanel.birthplaceLabel}</span>
              </label>

              {/* Quick button to use the default location configured in settings */}
              <button
                type="button"
                id="home-use-default-location-btn"
                onClick={handleApplyDefaultLocation}
                suppressHydrationWarning
                title={`Quickly apply default location: ${defaultLocName}`}
                className="text-[11px] font-mono text-stone-600 hover:text-[#8C2D19] bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 px-2.5 py-0.5 rounded-md transition-all active:scale-[0.97] cursor-pointer flex items-center gap-1"
              >
                <span suppressHydrationWarning>{usedDefaultLocSuccess ? '✓ Applied' : `Use: ${defaultLocName.split(' (')[0]}`}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                id="home-location-search-input"
                value={isCustomCoordinates ? customCityName : locationQuery}
                onFocus={() => {
                  if (!isCustomCoordinates) setShowLocationDropdown(true);
                }}
                onChange={(e) => {
                  if (isCustomCoordinates) {
                    setCustomCityName(e.target.value);
                  } else {
                    setLocationQuery(e.target.value);
                    setSelectedCity(null);
                    setShowLocationDropdown(true);
                  }
                }}
                placeholder={t.birthPanel.birthplacePlaceholder}
                className="w-full px-4 py-2.5 pl-10 pr-9 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#8C2D19] focus:bg-white focus:ring-2 focus:ring-[#8C2D19]/15 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {locationQuery && !isCustomCoordinates && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationQuery('');
                    setSelectedCity(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#8C2D19] cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Suggestions Dropdown */}
            {showLocationDropdown && !isCustomCoordinates && locationResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                {locationResults.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCity(loc);
                      setLocationQuery(formatPlace(loc));
                      setShowLocationDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{loc.name}</span>
                      {formatPlaceRegion(loc) && (
                        <span className="text-stone-500 ml-1.5">— {formatPlaceRegion(loc)}</span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-stone-500">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Date of Birth (DOB) — Custom Gaṇaka DayPicker Popover */}
          <div className="lg:col-span-6">
            <GanakaDatePicker
              id="home-dob-picker"
              label={t.birthPanel.dobLabel}
              value={dob}
              onChange={setDob}
              placeholder="Select calendar date..."
              required
            />
          </div>

          {/* 4. Time of Birth (TOB) — Custom 3D Cylindrical Drum Wheel */}
          <div className="lg:col-span-6">
            <GanakaClockPicker
              id="home-tob-picker"
              label={t.birthPanel.tobLabel}
              value={tob}
              onChange={setTob}
              placeholder="Select exact birth time..."
              required
            />
          </div>
        </div>

        {/* Collapsible Advanced Settings Drawer */}
        {showSettings && (
          <div
            id="home-advanced-settings-drawer"
            className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-4 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
              <div className="flex items-center gap-2 font-mono uppercase tracking-wider font-bold text-[#8C2D19] text-xs">
                <Sliders className="w-4 h-4" />
                <span>{t.birthPanel.settingsTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Region — which country's places are listed first */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-stone-800 block text-[11px]">
                  Search Region
                </label>
                <select
                  value={searchCountry}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSearchCountry(next);
                    setPreferredCountry(next === '' ? null : next);
                  }}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:border-[#8C2D19] focus:ring-2 focus:ring-[#8C2D19]/15"
                >
                  <option value="">
                    Auto{detectedCountry ? ` — ${detectedCountry}` : ''}
                  </option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500">
                  Places in this country are listed first when you search.
                </p>
              </div>

              {/* Ayanamsha System */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-stone-800 block text-[11px]">
                  {t.birthPanel.ayanamshaSystem}
                </label>
                <select
                  value={ayanamshaType}
                  onChange={(e) => {
                    const nextAyan = e.target.value as AyanamshaType;
                    setAyanamshaType(nextAyan);
                    savePlatformSettings({ defaultAyanamsha: nextAyan });
                    saveWorkspaceSettings({ ayanamsha: nextAyan });
                  }}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:border-[#8C2D19] focus:ring-2 focus:ring-[#8C2D19]/15"
                >
                  {Object.entries(AYANAMSHA_DEFINITIONS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.name} ({item.sanskritName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500">
                  Default configured in Platform Settings.
                </p>
              </div>

              {/* House Division System */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-stone-800 block text-[11px]">
                  {t.birthPanel.houseSystemLabel}
                </label>
                <select
                  value={houseSystem}
                  onChange={(e) => setHouseSystem(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:border-[#8C2D19] focus:ring-2 focus:ring-[#8C2D19]/15"
                >
                  <option value="equal_whole">Rāśi = Bhāva (Whole Sign / Parāśara Standard)</option>
                  <option value="sripati">Śrīpati (Porphyry Cusps &amp; Sandhis)</option>
                  <option value="placidus">Placidus (Semi-Arc Cusps)</option>
                </select>
                <p className="text-[10px] text-stone-500">
                  Controls Bhāva Chalit cusp calculations.
                </p>
              </div>

              {/* Custom Coordinates Toggle */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-stone-800 block text-[11px] flex items-center justify-between">
                  <span>{t.birthPanel.customCoordsToggle}</span>
                  <input
                    type="checkbox"
                    checked={isCustomCoordinates}
                    onChange={(e) => setIsCustomCoordinates(e.target.checked)}
                    className="accent-[#8C2D19] cursor-pointer"
                  />
                </label>
                <p className="text-[10px] text-stone-500">
                  Enable manual latitude, longitude, and UTC offset input.
                </p>
              </div>
            </div>

            {/* Custom Coordinates Inputs when enabled */}
            {isCustomCoordinates && (
              <div className="p-3.5 bg-white border border-stone-200 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-500">Location Name</label>
                  <input
                    type="text"
                    value={customCityName}
                    onChange={(e) => setCustomCityName(e.target.value)}
                    placeholder="e.g. Vrindavan, India"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-500">{t.birthPanel.latLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-500">{t.birthPanel.lngLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-500">{t.birthPanel.tzLabel}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customTz}
                    onChange={(e) => setCustomTz(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation Status Indicator if incomplete */}
        {!isFormValid && (
          <div className="flex items-center gap-2 p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600">
            <AlertCircle className="w-4 h-4 text-[#8C2D19] shrink-0" />
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="font-semibold text-stone-800">{t.birthPanel.requiredNotice}</span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] ${isLocationValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-900 border border-amber-200/60'}`}>
                {isLocationValid ? `✓ ${t.birthPanel.birthplaceField}` : `• ${t.birthPanel.birthplaceField}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] ${isDobValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-900 border border-amber-200/60'}`}>
                {isDobValid ? `✓ ${t.birthPanel.dobField}` : `• ${t.birthPanel.dobField}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] ${isTobValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-900 border border-amber-200/60'}`}>
                {isTobValid ? `✓ ${t.birthPanel.tobField}` : `• ${t.birthPanel.tobField}`}
              </span>
            </div>
          </div>
        )}

        {/* Submit Action Button with natural tactile press and subtle glow */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={!isFormValid || isCalculating}
            id="home-calculate-chart-submit-btn"
            className={`w-full py-3.5 px-6 rounded-xl font-mono uppercase tracking-wider text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 select-none btn-press-tactile ${
              isCalculating
                ? 'bg-[#8C2D19] text-white opacity-95 cursor-wait shadow-inner ring-1 ring-amber-500/30'
                : isFormValid
                ? 'bg-[#8C2D19] hover:bg-[#742312] active:bg-[#5C1B0E] text-white shadow-sm shadow-[#8C2D19]/15 hover:shadow-md cursor-pointer'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t.birthPanel.calculatingBtn}</span>
                </>
              ) : isFormValid ? (
                <>
                  <span>{t.birthPanel.calculateBtn}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </>
              ) : (
                <span>{t.birthPanel.fillRequiredBtn}</span>
              )}
            </div>
          </button>
        </div>
      </form>

      {/* Clean Solar System Astronomical Loading Overlay */}
      {isCalculating && (
        <CelestialArmillaryLoading
          isOverlay
          title="Calculating Ephemeris & Kundalī..."
        />
      )}
    </div>
  );
}
