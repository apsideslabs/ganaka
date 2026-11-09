'use client';

/**
 * Gaṇaka — Pañcāṅga Header & Location/Date Control Layer
 * Pure daily calculation: Location + Date (No birth time required).
 */

import React, { useState, useMemo } from 'react';
import {
  CITIES_DATABASE,
  CityLocation,
  searchLocations,
  formatDMS,
} from '@/lib/astronomy/coordinates';
import { formatPlace, formatPlaceRegion } from '@/lib/format-place';
import { useCitySearch } from '@/hooks/use-city-search';
import {
  AYANAMSHA_DEFINITIONS,
  AyanamshaType,
} from '@/lib/astronomy/ayanamsha';
import { GanakaDatePicker } from '@/components/ui/GanakaDatePicker';
import { savePlatformSettings } from '@/lib/settings/settings-storage';
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Check,
  Search,
} from 'lucide-react';

interface PanchangaHeaderProps {
  date: Date;
  onDateChange: (d: Date) => void;
  selectedCity: CityLocation;
  onCityChange: (c: CityLocation) => void;
  customLat: string;
  onLatChange: (lat: string) => void;
  customLng: string;
  onLngChange: (lng: string) => void;
  customTz: string;
  onTzChange: (tz: string) => void;
  ayanamshaType: AyanamshaType;
  onAyanamshaChange: (ay: AyanamshaType) => void;
  ayanamshaFormatted: string;
  jd: number;
}

export function PanchangaHeader({
  date,
  onDateChange,
  selectedCity,
  onCityChange,
  customLat,
  onLatChange,
  customLng,
  onLngChange,
  customTz,
  onTzChange,
  ayanamshaType,
  onAyanamshaChange,
  ayanamshaFormatted,
  jd,
}: PanchangaHeaderProps) {
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [showCoordinateDrawer, setShowCoordinateDrawer] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSavedDefault, setIsSavedDefault] = useState<boolean>(false);

  // Filtered Cities for Search (curated + full GeoNames index, incl. villages)
  const filteredCities = useCitySearch(citySearchQuery, 25, 18);

  const handleSaveAsDefaultLocation = () => {
    setIsSavedDefault(true);
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
    setTimeout(() => setIsSavedDefault(false), 2000);
  };

  const handleSaveCustomAsDefault = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    const tz = parseFloat(customTz);
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(tz)) {
      setIsSavedDefault(true);
      savePlatformSettings({
        defaultLocation: {
          name: selectedCity.name || 'Custom Location',
          country: selectedCity.country || 'Custom',
          latitude: lat,
          longitude: lng,
          timezoneOffsetHours: tz,
          timezoneName: `UTC${tz >= 0 ? `+${tz}` : tz}`,
          isCustom: true,
        },
        defaultCityName: selectedCity.name || 'Custom Location',
      });
      setTimeout(() => setIsSavedDefault(false), 2000);
    }
  };

  const handleSelectCity = (city: CityLocation) => {
    onCityChange(city);
    onLatChange(city.latitude.toString());
    onLngChange(city.longitude.toString());
    onTzChange(city.timezoneOffsetHours.toString());
    setIsCityDropdownOpen(false);
    setCitySearchQuery('');
  };

  const handleStepDay = (days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  };

  const handleStepMonth = (months: number) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    onDateChange(next);
  };

  const handleResetToToday = () => {
    setIsRefreshing(true);
    const now = new Date();
    onDateChange(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Formatted date string for display
  const formattedDateTitle = useMemo(() => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [date]);

  return (
    <div className="space-y-4">
      {/* Main Controls: Date Picker & City Selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Date Selector */}
        <div className="md:col-span-5">
          <GanakaDatePicker
            id="panchanga-date-picker"
            label="1. Select Date (दिनाङ्क)"
            value={date}
            onChange={(newDate) => {
              if (newDate) onDateChange(newDate);
            }}
          />
        </div>

        {/* Location Selector */}
        <div className="md:col-span-7 relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>2. Select Location (स्थानम्)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAsDefaultLocation}
                disabled={isSavedDefault}
                className="text-[11px] font-mono text-emerald-800 hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-all font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                title="Save this location as the global Platform Default"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{isSavedDefault ? 'Saved as Default!' : 'Set as Default'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCoordinateDrawer((prev) => !prev)}
                className="text-[11px] font-mono text-[#8C2D19] hover:underline cursor-pointer flex items-center gap-1 font-medium"
              >
                <SlidersHorizontal size={12} />
                <span>{showCoordinateDrawer ? 'Hide Coordinates' : 'Custom Lat / Long'}</span>
              </button>
            </div>
          </div>

          {/* City Button with Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              id="city-picker-button"
              onClick={() => setIsCityDropdownOpen((prev) => !prev)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-medium text-slate-900 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 overflow-hidden text-left">
                <MapPin className="w-4 h-4 text-[#8C2D19] shrink-0" />
                <span className="truncate font-serif font-bold text-slate-900">
                  {formatPlace(selectedCity)}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0 ml-2">
                {formatDMS(selectedCity.latitude, true)}, {formatDMS(selectedCity.longitude, false)}
              </span>
            </button>

            {/* City Selection Dropdown */}
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search cities, tīrthas & locations..."
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredCities.map((city) => {
                    const isCurrent =
                      city.name === selectedCity.name &&
                      Math.abs(city.latitude - selectedCity.latitude) < 0.001;
                    return (
                      <button
                        key={`${city.name}-${city.latitude}-${city.longitude}`}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                          isCurrent ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif text-slate-900">{city.name}</span>
                            {isCurrent && <Check size={12} className="text-[#8C2D19]" />}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {formatPlaceRegion(city)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDMS(city.latitude, true)} {formatDMS(city.longitude, false)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coordinate & Ayanamsha Overrides (Drawer) */}
      {showCoordinateDrawer && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl text-xs font-mono border border-slate-200/80">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Latitude (° Decimal)
            </label>
            <input
              type="number"
              step="0.0001"
              value={customLat}
              onChange={(e) => onLatChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Longitude (° Decimal)
            </label>
            <input
              type="number"
              step="0.0001"
              value={customLng}
              onChange={(e) => onLngChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Timezone Offset (Hours UTC)
            </label>
            <input
              type="number"
              step="0.25"
              value={customTz}
              onChange={(e) => onTzChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Ayanāṃśa Mode
            </label>
            <select
              value={ayanamshaType}
              onChange={(e) => onAyanamshaChange(e.target.value as AyanamshaType)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-serif font-bold text-slate-900 focus:outline-none focus:border-[#8C2D19] cursor-pointer"
            >
              {Object.values(AYANAMSHA_DEFINITIONS).map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.sanskritName})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4 flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveCustomAsDefault}
              disabled={isSavedDefault}
              className="px-3 py-1.5 bg-slate-900 hover:bg-[#8C2D19] text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check size={13} className="text-emerald-400" />
              <span>{isSavedDefault ? 'Saved as Platform Default!' : 'Save These Coordinates as Default'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stepper Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStepMonth(-1)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-all"
            title="Previous Month"
          >
            « Prev Month
          </button>
          <button
            type="button"
            onClick={() => handleStepDay(-1)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-all flex items-center gap-1"
            title="Previous Day"
          >
            <ChevronLeft size={13} />
            <span>Prev Day</span>
          </button>
          <button
            type="button"
            onClick={handleResetToToday}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-[#8C2D19] active:scale-95 text-white rounded-lg font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-75"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Recalculating...' : 'Today (Live)'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleStepDay(1)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-all flex items-center gap-1"
            title="Next Day"
          >
            <span>Next Day</span>
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleStepMonth(1)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-all"
            title="Next Month"
          >
            Next Month »
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          <span>Sunrise Anchor: <strong className="text-slate-700">Local Apparent Solar Time</strong></span>
        </div>
      </div>
    </div>
  );
}
