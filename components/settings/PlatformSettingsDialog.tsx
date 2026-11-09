'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Settings,
  X,
  RotateCcw,
  Check,
  Compass,
  MapPin,
  Clock,
  Languages,
  Layers,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  PlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformLanguage,
  DefaultLocationSetting,
} from '@/lib/settings/types';
import {
  getPlatformSettings,
  savePlatformSettings,
  resetPlatformSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { CITIES_DATABASE, CityLocation, searchLocations } from '@/lib/astronomy/coordinates';
import { formatPlaceRegion, formatUtcOffset } from '@/lib/format-place';
import { useCitySearch } from '@/hooks/use-city-search';
import { useTranslation } from '@/lib/i18n/use-translation';

interface PlatformSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

export function PlatformSettingsDialog({
  open,
  onOpenChange,
  triggerButton,
}: PlatformSettingsDialogProps) {
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useState<PlatformSettings>(() => getPlatformSettings());
  const [activeTab, setActiveTab] = useState<'ayanamsha' | 'geo' | 'language' | 'display'>('ayanamsha');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Location search & custom coordinates states
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customLat, setCustomLat] = useState<number>(23.1765);
  const [customLng, setCustomLng] = useState<number>(75.7885);
  const [customTz, setCustomTz] = useState<number>(5.5);
  const [customTzName, setCustomTzName] = useState('IST');

  // Filtered cities list (curated + full GeoNames index)
  const filteredCities = useCitySearch(citySearchQuery, 8, 0);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const fresh = getPlatformSettings();
        setSettings(fresh);
        if (fresh.defaultLocation?.isCustom) {
          setCustomName(fresh.defaultLocation.name);
          setCustomLat(fresh.defaultLocation.latitude);
          setCustomLng(fresh.defaultLocation.longitude);
          setCustomTz(fresh.defaultLocation.timezoneOffsetHours);
          setCustomTzName(fresh.defaultLocation.timezoneName || 'UTC');
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    return subscribeToSettings((scope) => {
      if (scope === 'platform') {
        const fresh = getPlatformSettings();
        setSettings(fresh);
      }
    });
  }, []);

  const handleDone = () => {
    if (isCustomLocation && customName.trim()) {
      const loc: DefaultLocationSetting = {
        name: customName.trim(),
        country: 'Custom',
        latitude: customLat,
        longitude: customLng,
        timezoneOffsetHours: customTz,
        timezoneName: customTzName || 'UTC',
        isCustom: true,
      };
      savePlatformSettings({
        defaultLocation: loc,
        defaultCityName: loc.name,
      });
    } else if (citySearchQuery.trim() && filteredCities.length > 0) {
      handleSelectCity(filteredCities[0]);
    }
    onOpenChange(false);
  };

  const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    const updated = savePlatformSettings({ [key]: value });
    setSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1800);
  };

  const handleSelectCity = (city: CityLocation) => {
    const loc: DefaultLocationSetting = {
      name: city.name,
      country: city.country || 'India',
      stateOrRegion: city.stateOrRegion,
      latitude: city.latitude,
      longitude: city.longitude,
      timezoneOffsetHours: city.timezoneOffsetHours,
      timezoneName: city.timezoneName,
      isCustom: false,
    };
    const updated = savePlatformSettings({
      defaultLocation: loc,
      defaultCityName: city.name,
    });
    setSettings(updated);
    setCitySearchQuery('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1800);
  };

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const loc: DefaultLocationSetting = {
      name: customName.trim(),
      country: 'Custom',
      latitude: customLat,
      longitude: customLng,
      timezoneOffsetHours: customTz,
      timezoneName: customTzName || 'UTC',
      isCustom: true,
    };
    const updated = savePlatformSettings({
      defaultLocation: loc,
      defaultCityName: loc.name,
    });
    setSettings(updated);
    setIsCustomLocation(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1800);
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      const reset = resetPlatformSettings();
      setSettings(reset);
      setIsResetting(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1800);
    }, 450);
  };

  // Vedic Astronomical Pilgrimage & Regional Anchors
  const prominentAnchors = useMemo(() => {
    return [
      { name: 'Ujjain (Avanti - Prime Meridian of Surya Siddhanta)', lat: 23.1765, lng: 75.7885, tz: 5.5, country: 'India' },
      { name: 'Varanasi (Kāśī - Sacred Jyotiṣa Vidya Center)', lat: 25.3176, lng: 82.9739, tz: 5.5, country: 'India' },
      { name: 'Guwahati / Prāgjyotiṣpura (Kāmarūpa Observatory)', lat: 26.1445, lng: 91.7362, tz: 5.5, country: 'India' },
      { name: 'New Delhi (Jantar Mantar Observatory)', lat: 28.6139, lng: 77.2090, tz: 5.5, country: 'India' },
      { name: 'Bengaluru (Karnataka)', lat: 12.9716, lng: 77.5946, tz: 5.5, country: 'India' },
      { name: 'Mumbai (Maharashtra)', lat: 19.0760, lng: 72.8777, tz: 5.5, country: 'India' },
      { name: 'Kolkata (Bengal Observatory Tradition)', lat: 22.5726, lng: 88.3639, tz: 5.5, country: 'India' },
      { name: 'Haridwar (Brahmakund Ganga Meru)', lat: 29.9457, lng: 78.1642, tz: 5.5, country: 'India' },
      { name: 'Puri (Śrī Kṣetra Jagannātha)', lat: 19.8135, lng: 85.8312, tz: 5.5, country: 'India' },
      { name: 'Tezpur (Sonitpur / Assam)', lat: 26.6338, lng: 92.7926, tz: 5.5, country: 'India' },
      { name: 'London (Greenwich Prime Meridian)', lat: 51.5074, lng: -0.1278, tz: 0.0, country: 'United Kingdom' },
      { name: 'New York (US Eastern)', lat: 40.7128, lng: -74.0060, tz: -5.0, country: 'United States' },
    ];
  }, []);

  const curLoc = settings.defaultLocation || DEFAULT_PLATFORM_SETTINGS.defaultLocation;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {triggerButton && <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay
          id="platform-settings-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <Dialog.Content
          id="platform-settings-modal"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col focus:outline-none animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <span>{t.settingsModal.title}</span>
                  <span className="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Universal
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-sans mt-0.5">
                  {t.settingsModal.subtitle}
                </Dialog.Description>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{t.settingsModal.savedNotice}</span>
                </span>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  id="platform-settings-close-btn"
                  aria-label="Close Settings"
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all active:scale-[0.95] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
            <button
              type="button"
              id="platform-settings-tab-ayanamsha"
              onClick={() => setActiveTab('ayanamsha')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                activeTab === 'ayanamsha'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.settingsModal.tabAyanamsha}</span>
            </button>

            <button
              type="button"
              id="platform-settings-tab-geo"
              onClick={() => setActiveTab('geo')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                activeTab === 'geo'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.settingsModal.tabLocation}</span>
            </button>

            <button
              type="button"
              id="platform-settings-tab-language"
              onClick={() => setActiveTab('language')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                activeTab === 'language'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t.settingsModal.tabLanguage}</span>
            </button>

            <button
              type="button"
              id="platform-settings-tab-display"
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                activeTab === 'display'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.settingsModal.tabDisplay}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. AYANAMSHA TAB */}
            {activeTab === 'ayanamsha' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="font-semibold text-slate-900">Ephemeris Standard: </strong>
                    The chosen Ayanāṃśa sets the default celestial coordinate offset between the
                    Sayana (tropical vernal equinox) and Nirayana (sidereal zodiac) across all new
                    workspaces and Pañcāṅga calculations.
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="platform-default-ayanamsha-select" className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Default Ayanāṃśa System
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      {
                        id: 'lahiri' as AyanamshaType,
                        name: 'Lahiri (Chitrapaksha / Indian Standard)',
                        desc: 'Government of India Calendar Reform Committee 1952. Star Spica (Citra) at 180°00′.',
                        tag: 'Standard',
                      },
                      {
                        id: 'true_chitra' as AyanamshaType,
                        name: 'True Chitra (Swiss Ephemeris SE_SIDM_TRUE_CITRA)',
                        desc: 'Dynamically references the exact center of star Spica (Alpha Virginis).',
                        tag: 'High Precision',
                      },
                      {
                        id: 'kp' as AyanamshaType,
                        name: 'Krishnamurti (KP System)',
                        desc: 'Formulated by Prof. K.S. Krishnamurti for Sub-Lord astrology.',
                        tag: 'KP Astrologers',
                      },
                      {
                        id: 'raman' as AyanamshaType,
                        name: 'Dr. B.V. Raman',
                        desc: 'Classical Revati Zero 397 AD anchor favored in Dr. B.V. Raman publications.',
                        tag: 'Classical',
                      },
                      {
                        id: 'pushya_paksha' as AyanamshaType,
                        name: 'Pushya Paksha (P.V.R. Narasimha Rao)',
                        desc: 'Delta Cancri (Pushya yogathara) fixed at exact 106°00′ sidereal.',
                        tag: 'PVR Rao',
                      },
                      {
                        id: 'yukteshwar' as AyanamshaType,
                        name: 'Sri Yukteshwar (The Holy Science 1894)',
                        desc: 'Equinox Revati 499 AD alignment described by Swami Sri Yukteshwar Giri.',
                        tag: 'Historical',
                      },
                      {
                        id: 'tropical' as AyanamshaType,
                        name: 'Sayana (Tropical / Modern Geocentric 0°)',
                        desc: 'Western tropical zodiac with 0° Ayanāṃśa relative to Vernal Equinox.',
                        tag: 'Western',
                      },
                    ].map((opt) => {
                      const isSelected = settings.defaultAyanamsha === opt.id;
                      return (
                        <div
                          key={opt.id}
                          id={`platform-ayanamsha-opt-${opt.id}`}
                          onClick={() => updateSetting('defaultAyanamsha', opt.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 active:scale-[0.99] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-serif font-bold text-slate-900">
                                {opt.name}
                              </span>
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {opt.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                          <div className="shrink-0 pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. LOCATION & TIME TAB */}
            {activeTab === 'geo' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Active Default Location Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-700" />
                      <span>{t.settingsModal.activeDefaultLocation}</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </span>
                  </div>
                  <div className="text-sm font-serif font-bold text-slate-900">
                    {curLoc.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600 flex-wrap">
                    <span>Lat: {curLoc.latitude.toFixed(4)}°</span>
                    <span>•</span>
                    <span>Lng: {curLoc.longitude.toFixed(4)}°</span>
                    <span>•</span>
                    <span>{formatUtcOffset(curLoc.timezoneOffsetHours)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Applied automatically across Pañcāṅga, Birth Horoscopes, and Workspace calculations.
                  </p>
                </div>

                {/* City Search Bar */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block flex items-center justify-between">
                    <span>{t.settingsModal.locationSearchTitle}</span>
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      id="platform-location-search-input"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredCities.length > 0) {
                          e.preventDefault();
                          handleSelectCity(filteredCities[0]);
                        }
                      }}
                      placeholder="Type city name (e.g. Guwahati, Varanasi, Ujjain, London, New York...)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                    {citySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCitySearchQuery('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {filteredCities.length > 0 && (
                    <div className="mt-1 max-h-56 overflow-y-auto border border-blue-200 rounded-xl bg-white shadow-lg divide-y divide-slate-100 z-20">
                      {filteredCities.map((city) => (
                        <div
                          key={`${city.name}-${city.latitude}`}
                          onClick={() => handleSelectCity(city)}
                          className="p-2.5 px-3.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 font-serif block">
                              {city.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatPlaceRegion(city)} • {formatUtcOffset(city.timezoneOffsetHours)}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-blue-700 font-bold px-2 py-0.5 rounded bg-blue-50">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prominent Regional & Historical Presets */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    {t.settingsModal.presetLocationsTitle}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {prominentAnchors.map((anc) => {
                      const isSelected = curLoc.name === anc.name;
                      return (
                        <button
                          key={anc.name}
                          type="button"
                          onClick={() =>
                            handleSelectCity({
                              name: anc.name,
                              country: anc.country,
                              latitude: anc.lat,
                              longitude: anc.lng,
                              timezoneOffsetHours: anc.tz,
                              timezoneName: anc.tz === 5.5 ? 'IST' : anc.tz === 0 ? 'GMT' : 'EST',
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] flex items-start justify-between gap-1.5 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 font-bold text-slate-900 shadow-2xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="text-xs font-serif block truncate font-semibold">
                              {anc.name.split(' (')[0]}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 block truncate">
                              {anc.lat.toFixed(2)}°N, {anc.lng.toFixed(2)}°E
                            </span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Coordinates Collapsible */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCustomLocation(!isCustomLocation)}
                    className="flex items-center justify-between w-full text-xs font-mono uppercase tracking-wider text-blue-700 font-bold py-1 hover:text-blue-900 cursor-pointer"
                  >
                    <span>{t.settingsModal.customCoordsToggle}</span>
                    <span>{isCustomLocation ? '− Hide' : '+ Enter Custom Coordinates'}</span>
                  </button>

                  {isCustomLocation && (
                    <form
                      onSubmit={handleSaveCustomLocation}
                      className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in"
                    >
                      <div>
                        <label className="text-[11px] font-mono text-slate-600 block mb-1">
                          Location Name
                        </label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. My Observational Studio, Guwahati"
                          className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-mono text-slate-600 block mb-1">
                            Latitude (°N)
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={customLat}
                            onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-600 block mb-1">
                            Longitude (°E)
                          </label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={customLng}
                            onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-600 block mb-1">
                            TZ Offset (Hrs)
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            required
                            value={customTz}
                            onChange={(e) => setCustomTz(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-mono font-bold transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Set as Default Platform Location
                      </button>
                    </form>
                  )}
                </div>

                {/* Time & Degree format options */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Time Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="platform-time-format-24h"
                      onClick={() => updateSetting('timeFormat', '24h')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.timeFormat === '24h'
                          ? 'border-blue-600 bg-blue-50/40 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-mono block">24-Hour Military</span>
                      <span className="text-[11px] text-slate-500 font-normal">e.g. 14:30:45 (IST)</span>
                    </button>

                    <button
                      type="button"
                      id="platform-time-format-12h"
                      onClick={() => updateSetting('timeFormat', '12h')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.timeFormat === '12h'
                          ? 'border-blue-600 bg-blue-50/40 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-mono block">12-Hour AM/PM</span>
                      <span className="text-[11px] text-slate-500 font-normal">e.g. 02:30:45 PM</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Degree Representation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="platform-degree-format-dms"
                      onClick={() => updateSetting('degreeFormat', 'dms')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.degreeFormat === 'dms'
                          ? 'border-blue-600 bg-blue-50/40 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-mono block">DMS Notation</span>
                      <span className="text-[11px] text-slate-500 font-normal">24° 15′ 42″</span>
                    </button>

                    <button
                      type="button"
                      id="platform-degree-format-decimal"
                      onClick={() => updateSetting('degreeFormat', 'decimal')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.degreeFormat === 'decimal'
                          ? 'border-blue-600 bg-blue-50/40 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-mono block">Decimal Degrees</span>
                      <span className="text-[11px] text-slate-500 font-normal">24.2617°</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LANGUAGE & SCRIPT TAB */}
            {activeTab === 'language' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Language Selection: English, Hindi, Pure Sanskrit, Assamese */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold block">
                      {t.settingsModal.languageSelectorTitle}
                    </label>
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      4 Languages
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.settingsModal.languageSelectorDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'english' as PlatformLanguage,
                        name: 'English',
                        native: 'English (Default)',
                        desc: 'Global scientific & academic Jyotiṣa terminology',
                        tag: 'Default',
                      },
                      {
                        id: 'hindi' as PlatformLanguage,
                        name: 'Hindi',
                        native: 'हिन्दी (Hindi)',
                        desc: 'परिष्कृत प्रामाणिक हिन्दी भाषा',
                        tag: 'National',
                      },
                      {
                        id: 'sanskrit' as PlatformLanguage,
                        name: 'Pure Sanskrit',
                        native: 'संस्कृतम् (Sanskritam)',
                        desc: 'शुद्धं पारम्परिकं शास्त्रीय-संस्कृतम्',
                        tag: 'Classical',
                      },
                      {
                        id: 'assamese' as PlatformLanguage,
                        name: 'Assamese',
                        native: 'অসমীয়া (Assamese)',
                        desc: 'প্ৰামাণিক কামৰূপী আৰু অসমীয়া ভাষা',
                        tag: 'Regional',
                      },
                    ].map((item) => {
                      const isSelected = settings.language === item.id;
                      return (
                        <div
                          key={item.id}
                          id={`platform-language-opt-${item.id}`}
                          onClick={() => {
                            updateSetting('language', item.id);
                            setLanguage(item.id);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-[0.98] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-sm font-serif font-bold text-slate-900 block">
                                {item.native}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {item.name}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Sanskrit Authenticity Rule:</strong> No matter which language is selected,
                      classical Sanskrit mantras, Vedic epigraphs (*सिद्धांते गणितं प्रधानम्*), and 27
                      Nakṣatra names remain preserved in authentic Sanskrit.
                    </span>
                  </div>
                </div>

                {/* Nomenclature preference */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Planetary &amp; Sign Nomenclature
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      {
                        id: 'iast' as const,
                        title: 'IAST Diacritics (Academic Vedic)',
                        example: 'Sūrya, Candra, Maṅgala, Budha, Bṛhaspati, Śukra, Śani',
                        desc: 'Standard international transliteration for scientific astrological manuscripts.',
                      },
                      {
                        id: 'devanagari' as const,
                        title: 'Devanagari Script (देवनागरी)',
                        example: 'सूर्य, चन्द्र, मंगल, बुध, गुरु (बृहस्पति), शुक्र, शनि',
                        desc: 'Traditional Sanskrit and Hindi script for classical Jyotiṣa terms.',
                      },
                      {
                        id: 'english' as const,
                        title: 'English Simplified',
                        example: 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn',
                        desc: 'Clean anglicized terminology suitable for contemporary readers.',
                      },
                    ].map((item) => {
                      const isSelected = settings.scriptPreference === item.id;
                      return (
                        <div
                          key={item.id}
                          id={`platform-script-${item.id}`}
                          onClick={() => updateSetting('scriptPreference', item.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 active:scale-[0.99] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-serif font-bold text-slate-900 block">
                              {item.title}
                            </span>
                            <span className="text-xs font-mono text-blue-800 bg-blue-50/60 px-2 py-0.5 rounded block w-fit">
                              {item.example}
                            </span>
                            <p className="text-[11px] text-slate-500">{item.desc}</p>
                          </div>
                          <div className="shrink-0 pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Dina-Māna (Day Duration) Display Units
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'hours' as const, label: 'Civil Hours', desc: '12h 45m 20s' },
                      { id: 'ghatis' as const, label: 'Vedic Ghaṭīs', desc: '31 Ghaṭīs, 53 Palas' },
                      { id: 'both' as const, label: 'Both Units', desc: 'Hours + Ghaṭīs' },
                    ].map((unit) => {
                      const isSelected = settings.dinaManaUnit === unit.id;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          id={`platform-dinamana-${unit.id}`}
                          onClick={() => updateSetting('dinaManaUnit', unit.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 text-slate-900 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-serif block">{unit.label}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal">
                            {unit.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. DISPLAY STYLE TAB */}
            {activeTab === 'display' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Default Kundali Chart Rendering Style
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      id="platform-chart-style-north"
                      onClick={() => updateSetting('defaultChartStyle', 'north')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.defaultChartStyle === 'north'
                          ? 'border-blue-600 bg-blue-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-serif font-bold text-slate-900">
                          North Indian
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          Fixed Houses
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Lagna is fixed in the top central diamond. Zodiac signs rotate counter-clockwise.
                      </p>
                    </button>

                    <button
                      type="button"
                      id="platform-chart-style-south"
                      onClick={() => updateSetting('defaultChartStyle', 'south')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.defaultChartStyle === 'south'
                          ? 'border-blue-600 bg-blue-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-serif font-bold text-slate-900">
                          South Indian
                        </span>
                        <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          Fixed Signs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        12 zodiac signs are fixed in a clockwise grid starting from Pisces/Aries top-row.
                      </p>
                    </button>

                    <button
                      type="button"
                      id="platform-chart-style-east"
                      onClick={() => updateSetting('defaultChartStyle', 'east')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                        settings.defaultChartStyle === 'east'
                          ? 'border-blue-600 bg-blue-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-serif font-bold text-slate-900">
                          East Indian
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Bengali/Mithila
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Fixed signs with bisected corner chambers. Aries top-center, anti-clockwise.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
                    Workspace Persistence
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Custom adjustments made inside individual workspaces (e.g., active chart,
                    rectification steppers, or date overrides) remain active during your session and
                    can be reset anytime.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <button
              type="button"
              id="platform-settings-reset-btn"
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              {isResetting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-700" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>{t.settingsModal.resetBtn}</span>
            </button>

            <button
              type="button"
              id="platform-settings-apply-btn"
              onClick={handleDone}
              className="px-5 py-2 text-xs font-mono uppercase font-bold text-white bg-slate-900 hover:bg-blue-700 rounded-xl transition-all shadow-xs active:scale-[0.97] cursor-pointer"
            >
              {t.settingsModal.doneBtn}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
