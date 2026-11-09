'use client';

/**
 * Gaṇaka — Daily Rising Signs (Lagna) 24-Hour Table
 * Precise calculation of the 12 rising Lagnas from local Sunrise to next Sunrise,
 * showing exact durations, Lagna Lord, Tattva, mobility, and currently active Ascendant.
 */

import React, { useState, useMemo } from 'react';
import { calculateDailyLagnaTable } from '@/lib/muhurta/lagna-calculator';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import {
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { formatPlace } from '@/lib/format-place';

interface PanchangaLagnaViewProps {
  date: Date;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
  sunriseStr: string;
  sunsetStr: string;
}

export function PanchangaLagnaView({
  date,
  selectedCity,
  ayanamshaType,
  sunriseStr,
  sunsetStr,
}: PanchangaLagnaViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'day' | 'night'>('all');

  const sunriseParts = sunriseStr.split(':');
  const sunriseHourDec =
    parseInt(sunriseParts[0] || '6', 10) + parseInt(sunriseParts[1] || '0', 10) / 60;

  const sunsetParts = sunsetStr.split(':');
  const sunsetHourDec =
    parseInt(sunsetParts[0] || '18', 10) + parseInt(sunsetParts[1] || '0', 10) / 60;

  const lagnaList = useMemo(() => {
    return calculateDailyLagnaTable(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      selectedCity.latitude,
      selectedCity.longitude,
      selectedCity.timezoneOffsetHours,
      sunriseHourDec,
      sunsetHourDec,
      ayanamshaType
    );
  }, [date, selectedCity, sunriseHourDec, sunsetHourDec, ayanamshaType]);

  const filteredLagnas = useMemo(() => {
    if (filterMode === 'day') return lagnaList.filter((l) => l.isDaytime);
    if (filterMode === 'night') return lagnaList.filter((l) => !l.isDaytime);
    return lagnaList;
  }, [lagnaList, filterMode]);

  const activeLagna = lagnaList.find((l) => l.isCurrentlyActive) || lagnaList[0];

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-[#8C2D19]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Rising Ascendant Horizon Table
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Daily Lagna Transitions (24-Hour Diurnal Cycle)
          </h2>
          <p className="text-xs font-serif text-slate-500 mt-0.5">
            {formattedDate} • {formatPlace(selectedCity)} (Sunrise: {sunriseStr} | Sunset: {sunsetStr})
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All 12 Lagnas ({lagnaList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('day')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'day'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Day Only</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('night')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'night'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Night Only</span>
          </button>
        </div>
      </div>

      {/* 2. Currently Active Lagna Spotlight Banner */}
      {activeLagna && (
        <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-lg">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                  Active Ascendant
                </span>
                <span className="text-xs font-mono text-slate-600 font-medium">
                  {activeLagna.startTimeStr} – {activeLagna.endTimeStr}
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-slate-900 mt-1">
                {activeLagna.rashiName} ({activeLagna.sanskritName}) — Lord: {activeLagna.lagnaLordName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 self-start sm:self-center">
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
              {activeLagna.mobility}
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
              {activeLagna.tattva}
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-bold text-[#8C2D19]">
              {activeLagna.durationMinutes} min ({activeLagna.durationGhatikas})
            </span>
          </div>
        </div>
      )}

      {/* 3. High-Density Lagna Table */}
      <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-serif">
              <th className="py-3 px-3.5">#</th>
              <th className="py-3 px-3.5">Ascendant (Lagna)</th>
              <th className="py-3 px-3.5">Ruler (Lord)</th>
              <th className="py-3 px-3.5">Time Window</th>
              <th className="py-3 px-3.5">Duration</th>
              <th className="py-3 px-3.5">Mobility &amp; Element</th>
              <th className="py-3 px-3.5">Classical Suitability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLagnas.map((item) => (
              <tr
                key={`${item.rashiNumber}-${item.index}`}
                className={`transition-colors ${
                  item.isCurrentlyActive
                    ? 'bg-amber-50/60 font-bold text-slate-900'
                    : 'hover:bg-slate-50/80 text-slate-800'
                }`}
              >
                {/* Index & Active Indicator */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="font-bold">{item.index}</span>
                  {item.isCurrentlyActive && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#8C2D19] animate-pulse" />
                  )}
                </td>

                {/* Lagna Name */}
                <td className="py-3 px-3.5 whitespace-nowrap font-serif font-bold text-sm text-slate-900">
                  {item.rashiName}{' '}
                  <span className="text-xs text-slate-500 font-normal font-sans">
                    ({item.sanskritName})
                  </span>
                </td>

                {/* Lord */}
                <td className="py-3 px-3.5 whitespace-nowrap text-[#8C2D19] font-medium">
                  {item.lagnaLordName}
                </td>

                {/* Time Window */}
                <td className="py-3 px-3.5 whitespace-nowrap font-semibold">
                  <div className="flex items-center gap-1.5">
                    {item.isDaytime ? (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    <span>{item.startTimeStr} – {item.endTimeStr}</span>
                  </div>
                </td>

                {/* Duration */}
                <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                  {item.durationMinutes} min <span className="text-[10px] text-slate-400">({item.durationGhatikas})</span>
                </td>

                {/* Mobility & Tattva */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] mr-1 text-slate-700">
                    {item.mobility.split(' ')[0]}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-700">
                    {item.tattva.split(' ')[0]}
                  </span>
                </td>

                {/* Favorable Activities */}
                <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate font-sans">
                  {item.favorableActivities}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
