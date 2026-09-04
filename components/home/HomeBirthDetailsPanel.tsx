'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { GanakaDatePicker } from '@/components/ui/GanakaDatePicker';
import { GanakaClockPicker, TimeValue } from '@/components/ui/GanakaClockPicker';
import { getPlatformSettings, subscribeToSettings } from '@/lib/settings/settings-storage';
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

  useEffect(() => {
    // Read local storage settings safely on client mount without triggering SSR hydration mismatch
    const timer = setTimeout(() => {
      setPlatformSettings(getPlatformSettings());
    }, 0);

    const unsubscribe = subscribeToSettings((scope) => {
      if (scope === 'platform') {
        setPlatformSettings(getPlatformSettings());
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Core Form States
  const [chartName, setChartName] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [tob, setTob] = useState<TimeValue | null>(null);

  // Location States
  const [selectedCity, setSelectedCity] = useState<CityLocation | null>(null);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);

  // Settings Modal / Drawer State
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Advanced Configuration (inside Settings modal)
  const [isCustomCoordinates, setIsCustomCoordinates] = useState<boolean>(false);
  const [customCityName, setCustomCityName] = useState<string>('');
  const [customLat, setCustomLat] = useState<number>(23.1765);
  const [customLng, setCustomLng] = useState<number>(75.7885);
  const [customTz, setCustomTz] = useState<number>(5.5);

  const [ayanamshaType, setAyanamshaType] = useState<AyanamshaType>(() => platformSettings.defaultAyanamsha || 'lahiri');
  const [houseSystem, setHouseSystem] = useState<'equal_whole' | 'sripati' | 'placidus'>('equal_whole');

  // Filtered Locations
  const locationResults = useMemo(() => {
    if (!locationQuery || locationQuery.trim().length === 0) {
      return CITIES_DATABASE.slice(0, 8);
    }
    return searchLocations(locationQuery);
  }, [locationQuery]);

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
      setLocationQuery(loc.name);
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
      className="w-full max-w-4xl mx-auto bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-console relative z-20 overflow-hidden"
    >
      {/* Header with Quick Fill and Settings Button */}
      <div className="bg-gradient-to-r from-[#ECE7DC] via-[#F4F0E7] to-[#ECE7DC] px-5 sm:px-8 py-4 border-b border-[#DCD5C6] flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B2F0B] ring-4 ring-[#8B2F0B]/10" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#171614] tracking-tight">
              {t.birthPanel.title}
            </h2>
          </div>
          <p className="text-xs text-[#5C5850] mt-0.5 font-mono">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-white hover:bg-amber-50 text-[#8B2F0B] border border-[#DCD5C6] rounded-xs shadow-xs transition-all active:scale-[0.97] cursor-pointer"
          >
            {isQuickFilling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B2F0B]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#8B2F0B]" />
            )}
            <span>{t.birthPanel.quickFillGochar}</span>
          </button>

          {/* Config Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            id="home-settings-gear-btn"
            title="Advanced Settings (Ayanāṃśa, Custom Coordinates, House Systems)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-[#FCFAF6] hover:bg-[#FFFFFF] text-[#171614] border border-[#DCD5C6] rounded-xs shadow-xs transition-all cursor-pointer active:scale-[0.97]"
          >
            <Settings className="w-3.5 h-3.5 text-[#8B2F0B]" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Main Form with Gaṇaka Custom Controls */}
      <form onSubmit={handleCalculateChart} className="p-5 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
          {/* 1. Native's Name (Optional) */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171614] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8B2F0B]" />
              <span>{t.birthPanel.chartNameLabel}</span>
              <span className="text-[11px] font-normal text-[#847E72] lowercase">(optional)</span>
            </label>
            <input
              type="text"
              id="home-native-name-input"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder={t.birthPanel.chartNamePlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-sm text-[#171614] placeholder-[#847E72] focus:outline-none focus:border-[#8B2F0B] focus:bg-white transition-colors"
            />
          </div>

          {/* 2. Location (City search) - Required */}
          <div className="lg:col-span-6 space-y-1.5 relative">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171614] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8B2F0B]" />
                <span>{t.birthPanel.birthplaceLabel}</span>
              </label>

              {/* Quick button to use the default location configured in settings */}
              <button
                type="button"
                id="home-use-default-location-btn"
                onClick={handleApplyDefaultLocation}
                suppressHydrationWarning
                title={`Quickly apply default location: ${defaultLocName}`}
                className="text-[10px] font-mono text-blue-700 hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 px-2 py-0.5 rounded-xs transition-all active:scale-[0.97] cursor-pointer flex items-center gap-1"
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
                className="w-full px-3.5 py-2.5 pl-9 pr-8 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-sm text-[#171614] placeholder-[#847E72] focus:outline-none focus:border-[#8B2F0B] focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-[#8B2F0B] absolute left-3 top-1/2 -translate-y-1/2" />
              {locationQuery && !isCustomCoordinates && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationQuery('');
                    setSelectedCity(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#847E72] hover:text-[#8B2F0B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Suggestions Dropdown */}
            {showLocationDropdown && !isCustomCoordinates && locationResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-md z-50 max-h-60 overflow-y-auto divide-y divide-[#ECE7DC]">
                {locationResults.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCity(loc);
                      setLocationQuery(`${loc.name}${loc.stateOrRegion ? `, ${loc.stateOrRegion}` : ''}`);
                      setShowLocationDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#ECE7DC] text-xs flex items-center justify-between transition-colors cursor-pointer active:bg-blue-50"
                  >
                    <div>
                      <span className="font-semibold text-[#171614]">{loc.name}</span>
                      {loc.stateOrRegion && <span className="text-[#5C5850] ml-1.5">({loc.stateOrRegion})</span>}
                      {loc.country && <span className="text-[#847E72] ml-1.5">• {loc.country}</span>}
                    </div>
                    <span className="font-mono text-[11px] text-[#5C5850]">
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
            className="p-5 bg-[#ECE7DC] border border-[#DCD5C6] rounded-xs space-y-4 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#DCD5C6]">
              <div className="flex items-center gap-2 font-mono uppercase tracking-wider font-bold text-[#8B2F0B] text-xs">
                <Sliders className="w-4 h-4" />
                <span>{t.birthPanel.settingsTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 text-[#5C5850] hover:text-[#171614] rounded-xs cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ayanamsha System */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-[#171614] block text-[11px]">
                  {t.birthPanel.ayanamshaSystem}
                </label>
                <select
                  value={ayanamshaType}
                  onChange={(e) => setAyanamshaType(e.target.value as AyanamshaType)}
                  className="w-full p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs text-xs text-[#171614] focus:border-[#8B2F0B]"
                >
                  {Object.entries(AYANAMSHA_DEFINITIONS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.name} ({item.sanskritName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#5C5850]">
                  Default configured in Platform Settings.
                </p>
              </div>

              {/* House Division System */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-[#171614] block text-[11px]">
                  {t.birthPanel.houseSystemLabel}
                </label>
                <select
                  value={houseSystem}
                  onChange={(e) => setHouseSystem(e.target.value as any)}
                  className="w-full p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs text-xs text-[#171614] focus:border-[#8B2F0B]"
                >
                  <option value="equal_whole">Rāśi = Bhāva (Whole Sign / Parāśara Standard)</option>
                  <option value="sripati">Śrīpati (Porphyry Cusps &amp; Sandhis)</option>
                  <option value="placidus">Placidus (Semi-Arc Cusps)</option>
                </select>
                <p className="text-[10px] text-[#5C5850]">
                  Controls Bhāva Chalit cusp calculations.
                </p>
              </div>

              {/* Custom Coordinates Toggle */}
              <div className="space-y-1.5">
                <label className="font-mono uppercase tracking-wider font-semibold text-[#171614] block text-[11px] flex items-center justify-between">
                  <span>{t.birthPanel.customCoordsToggle}</span>
                  <input
                    type="checkbox"
                    checked={isCustomCoordinates}
                    onChange={(e) => setIsCustomCoordinates(e.target.checked)}
                    className="accent-[#8B2F0B] cursor-pointer"
                  />
                </label>
                <p className="text-[10px] text-[#5C5850]">
                  Enable manual latitude, longitude, and UTC offset input.
                </p>
              </div>
            </div>

            {/* Custom Coordinates Inputs when enabled */}
            {isCustomCoordinates && (
              <div className="p-3.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#5C5850]">Location Name</label>
                  <input
                    type="text"
                    value={customCityName}
                    onChange={(e) => setCustomCityName(e.target.value)}
                    placeholder="e.g. Vrindavan, India"
                    className="w-full p-2 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#5C5850]">{t.birthPanel.latLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#5C5850]">{t.birthPanel.lngLabel}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#5C5850]">{t.birthPanel.tzLabel}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customTz}
                    onChange={(e) => setCustomTz(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation Status Indicator if incomplete */}
        {!isFormValid && (
          <div className="flex items-center gap-2 p-3 bg-[#ECE7DC] border border-[#DCD5C6] rounded-xs text-xs text-[#5C5850]">
            <AlertCircle className="w-4 h-4 text-[#8B2F0B] shrink-0" />
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="font-semibold text-[#171614]">{t.birthPanel.requiredNotice}</span>
              <span className={`px-2 py-0.5 rounded-xs text-[11px] ${isLocationValid ? 'bg-[#D6E8D6] text-[#1B5E20]' : 'bg-[#F2DDD9] text-[#7A2D12]'}`}>
                {isLocationValid ? `✓ ${t.birthPanel.birthplaceField}` : `✗ ${t.birthPanel.birthplaceField}`}
              </span>
              <span className={`px-2 py-0.5 rounded-xs text-[11px] ${isDobValid ? 'bg-[#D6E8D6] text-[#1B5E20]' : 'bg-[#F2DDD9] text-[#7A2D12]'}`}>
                {isDobValid ? `✓ ${t.birthPanel.dobField}` : `✗ ${t.birthPanel.dobField}`}
              </span>
              <span className={`px-2 py-0.5 rounded-xs text-[11px] ${isTobValid ? 'bg-[#D6E8D6] text-[#1B5E20]' : 'bg-[#F2DDD9] text-[#7A2D12]'}`}>
                {isTobValid ? `✓ ${t.birthPanel.tobField}` : `✗ ${t.birthPanel.tobField}`}
              </span>
            </div>
          </div>
        )}

        {/* Submit Action Button with visible loading spinner and press animation */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={!isFormValid || isCalculating}
            id="home-calculate-chart-submit-btn"
            className={`w-full py-3.5 px-6 rounded-xs font-mono uppercase tracking-wider text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 select-none active:scale-[0.98] ${
              isCalculating
                ? 'bg-[#8B2F0B] text-white opacity-95 cursor-wait shadow-inner ring-2 ring-[#8B2F0B]/30'
                : isFormValid
                ? 'bg-[#171614] hover:bg-[#8B2F0B] active:bg-[#722608] text-[#FCFAF6] shadow-xs cursor-pointer'
                : 'bg-[#DCD5C6] text-[#847E72] cursor-not-allowed border border-[#DCD5C6]'
            }`}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{t.birthPanel.calculatingBtn}</span>
              </>
            ) : isFormValid ? (
              <>
                <span>{t.birthPanel.calculateBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>{t.birthPanel.fillRequiredBtn}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
