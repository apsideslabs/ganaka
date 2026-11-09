'use client';

/**
 * Gaṇaka — Classical Monthly Pañcāṅga Almanac Matrix (मासिक पञ्चाङ्ग)
 * Features:
 * - Full multi-year / multi-month astronomical ephemeris calendar.
 * - Precision SVG Moon Phase vector rendering for all 30 lunar days.
 * - Sacred Vedic festivals, Ekādaśī, Pūrṇimā, Amāvāsyā, and Saṅkrānti markers.
 * - Grid Calendar and Detailed Ephemeris Table views.
 * - One-click integration with Daily Pañcāṅga and Horoscope Workspace.
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { calculateAllPlanets, calculateSolarTimes } from '@/lib/astronomy/ephemeris';
import { calculatePanchanga, TITHI_SANSKRIT } from '@/lib/jyotisha/panchanga';
import { RASHIS } from '@/lib/jyotisha/constants';
import { RashiNumber } from '@/lib/jyotisha/types';
import { PanchangaMoonPhaseSvg } from './PanchangaMoonPhaseSvg';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sparkles,
  Compass,
  Layers,
  Table,
  Eye,
} from 'lucide-react';
import { formatPlace } from '@/lib/format-place';

interface PanchangaMonthlyAlmanacProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
}

export function PanchangaMonthlyAlmanac({
  currentDate,
  onSelectDate,
  selectedCity,
  ayanamshaType,
}: PanchangaMonthlyAlmanacProps) {
  const router = useRouter();

  // Local state for the displayed month & year
  const [viewYear, setViewYear] = useState<number>(() => currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => currentDate.getMonth()); // 0-indexed
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(() => currentDate.getDate());

  // Loading Overlay State for when opening Workspace or Pañcāṅga
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Total days in view month
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // First day weekday offset (0: Sunday, 1: Monday, ...)
  const firstDayWeekday = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToMonth = (y: number, m: number) => {
    setViewYear(y);
    setViewMonth(m);
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDayNum(now.getDate());
    onSelectDate(now);
  };

  // Calculate day-by-day astronomical data
  const monthDaysData = useMemo(() => {
    const list = [];
    const lat = selectedCity.latitude;
    const lng = selectedCity.longitude;
    const tz = selectedCity.timezoneOffsetHours;

    for (let d = 1; d <= daysInMonth; d++) {
      // Ephemeris evaluated at 06:00 AM local sunrise estimate
      const utHours = 6.0 - tz;
      const jd = calculateJulianDay(viewYear, viewMonth + 1, d, utHours);
      const planets = calculateAllPlanets(jd, ayanamshaType);
      const p = calculatePanchanga(
        planets.sun.siderealLongitude,
        planets.moon.siderealLongitude,
        jd,
        lat,
        lng,
        tz,
        ayanamshaType
      );

      const solar = calculateSolarTimes(jd, lat, lng, tz);

      // Sacred festival & day detection
      const tithiNum = p.tithi.number;
      const isEkadashi = tithiNum === 11 || tithiNum === 26;
      const isDvadashi = tithiNum === 12 || tithiNum === 27;
      const isPradosha = tithiNum === 13 || tithiNum === 28;
      const isPurnima = tithiNum === 15;
      const isAmavasya = tithiNum === 30;
      const isChaturthi = tithiNum === 4 || tithiNum === 19;
      const isAshtami = tithiNum === 8 || tithiNum === 23;

      // Detect special festivals for August (Śrāvaṇa / Bhādrapada)
      let festivalName = '';
      if (isEkadashi) {
        festivalName = tithiNum === 11 ? 'Śukla Ekādaśī (पवित्रा/अजा)' : 'Kṛṣṇa Ekādaśī (कामिका)';
      } else if (isPurnima) {
        festivalName = 'Śrāvaṇa Pūrṇimā / Rakṣābandhana';
      } else if (isAmavasya) {
        festivalName = 'Amāvāsyā / Darśa';
      } else if (isPradosha) {
        festivalName = 'Pradoṣa Vrata';
      } else if (isChaturthi && tithiNum === 19) {
        festivalName = 'Saṅkaṣṭa Caturthī';
      } else if (isAshtami && tithiNum === 23 && viewMonth === 7) {
        festivalName = 'Śrī Kṛṣṇa Janmāṣṭamī (जयन्ती)';
      }

      list.push({
        dayNumber: d,
        dateObj: new Date(viewYear, viewMonth, d, 6, 0, 0),
        jd,
        tithiNumber: tithiNum,
        tithiName: p.tithi.name,
        tithiSanskrit: TITHI_SANSKRIT[tithiNum - 1] || '',
        tithiPaksha: p.tithi.paksha,
        tithiEndTime: p.tithi.endTime,
        nakshatraName: p.nakshatra.name,
        nakshatraPada: p.nakshatra.pada,
        nakshatraEndTime: p.nakshatra.endTime,
        yogaName: p.yoga.name,
        karanaName: p.karana.name,
        varaName: p.vara.civilWeekday,
        varaDevanagari: p.vara.sanskritName,
        sunriseStr: solar.sunriseLocalHours,
        sunsetStr: solar.sunsetLocalHours,
        sunRasi: RASHIS[(Math.floor(planets.sun.siderealLongitude / 30) + 1) as RashiNumber]?.sanskritName || 'Meṣa',
        moonRasi: RASHIS[(Math.floor(planets.moon.siderealLongitude / 30) + 1) as RashiNumber]?.sanskritName || 'Meṣa',
        isEkadashi,
        isDvadashi,
        isPradosha,
        isPurnima,
        isAmavasya,
        isChaturthi,
        festivalName,
        isToday:
          new Date().getFullYear() === viewYear &&
          new Date().getMonth() === viewMonth &&
          new Date().getDate() === d,
        isSelected: selectedDayNum === d,
      });
    }
    return list;
  }, [viewYear, viewMonth, daysInMonth, selectedCity, ayanamshaType, selectedDayNum]);

  // Current selected day data object
  const activeDayData = useMemo(() => {
    return monthDaysData.find((d) => d.dayNumber === selectedDayNum) || monthDaysData[0];
  }, [monthDaysData, selectedDayNum]);

  // Month Formatted Title
  const monthName = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [viewYear, viewMonth]);

  // Open day in Horoscope Workspace
  const handleOpenInWorkspace = (dayData: typeof activeDayData) => {
    setIsNavigating(true);

    const params = new URLSearchParams({
      name: `Pañcāṅga — ${dayData.dayNumber} ${monthName}`,
      year: viewYear.toString(),
      month: (viewMonth + 1).toString(),
      day: dayData.dayNumber.toString(),
      hour: '6',
      minute: '0',
      second: '0',
      city: selectedCity.name,
      lat: selectedCity.latitude.toFixed(4),
      lng: selectedCity.longitude.toFixed(4),
      tz: selectedCity.timezoneOffsetHours.toString(),
      ayan: ayanamshaType,
      house: 'equal_whole',
    });

    router.push(`/workspace?${params.toString()}`);
  };

  // Open day in Daily Pañcāṅga View
  const handleOpenInPanchanga = (dayData: typeof activeDayData) => {
    onSelectDate(dayData.dateObj);
  };

  // Summary counts for the month
  const monthSummary = useMemo(() => {
    const ekadashis = monthDaysData.filter((d) => d.isEkadashi);
    const purnima = monthDaysData.find((d) => d.isPurnima);
    const amavasya = monthDaysData.find((d) => d.isAmavasya);
    return { ekadashis, purnima, amavasya };
  }, [monthDaysData]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
      {/* 1. Header Toolbar with Month Navigation & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        {/* Title & Indian Astronomical Months */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8C2D19]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] font-bold">
              Drik Siddhānta Monthly Matrix
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 tracking-tight">
            Monthly Pañcāṅga Almanac — {monthName}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Geographic Ephemeris: <strong className="text-slate-900 font-serif">{formatPlace(selectedCity)}</strong> (
            {selectedCity.latitude.toFixed(2)}°N, {selectedCity.longitude.toFixed(2)}°E) • Ayanāṃśa: {ayanamshaType}
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Steppers */}
          <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-slate-200/60 text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 text-xs font-mono font-bold text-slate-900 min-w-[130px] text-center">
              {monthName}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-slate-200/60 text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Jump: August 2026 & Today */}
          <button
            type="button"
            onClick={() => handleJumpToMonth(2026, 7)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
              viewYear === 2026 && viewMonth === 7
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            August 2026
          </button>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-mono bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Current Month
          </button>

          {/* View Toggle */}
          <div className="inline-flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table size={13} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Sacred Highlights Ribbon for this Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Ekādaśī Vratas</div>
            <div className="font-bold text-slate-900 font-serif">
              {monthSummary.ekadashis.map((e) => `${e.dayNumber} ${e.tithiPaksha}`).join(', ') || 'None'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-center shrink-0">
            <PanchangaMoonPhaseSvg tithiNumber={15} size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Pūrṇimā (Full Moon)</div>
            <div className="font-bold text-slate-900 font-serif">
              {monthSummary.purnima ? `${monthSummary.purnima.dayNumber} ${monthName}` : '—'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <PanchangaMoonPhaseSvg tithiNumber={30} size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Amāvāsyā (New Moon)</div>
            <div className="font-bold text-slate-900 font-serif">
              {monthSummary.amavasya ? `${monthSummary.amavasya.dayNumber} ${monthName}` : '—'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4 text-[#8C2D19]" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Selected Date Action</div>
            <div className="font-bold text-[#8C2D19] font-serif">
              Day {activeDayData.dayNumber} • {activeDayData.tithiName}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CALENDAR GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-3">
          {/* Weekday Column Headers with Sanskrit */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono font-bold text-slate-700 bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[#8C2D19]">Sun</span> <span className="text-[10px] text-slate-400">(रवि)</span>
            </div>
            <div>
              <span>Mon</span> <span className="text-[10px] text-slate-400">(सोम)</span>
            </div>
            <div>
              <span>Tue</span> <span className="text-[10px] text-slate-400">(भौम)</span>
            </div>
            <div>
              <span>Wed</span> <span className="text-[10px] text-slate-400">(बुध)</span>
            </div>
            <div>
              <span>Thu</span> <span className="text-[10px] text-slate-400">(गुरु)</span>
            </div>
            <div>
              <span>Fri</span> <span className="text-[10px] text-slate-400">(शुक्र)</span>
            </div>
            <div>
              <span className="text-[#8C2D19]">Sat</span> <span className="text-[10px] text-slate-400">(शनि)</span>
            </div>
          </div>

          {/* 7-Column Day Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {/* Offset empty slots */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="hidden md:block min-h-[115px] p-2 bg-slate-50/20 border border-dashed border-slate-200 rounded-xl"
              />
            ))}

            {monthDaysData.map((d) => {
              const isSelected = selectedDayNum === d.dayNumber;
              let borderClass = 'border-slate-200/80';
              let bgClass = 'bg-slate-50/70';

              if (isSelected) {
                borderClass = 'border-[#8C2D19] ring-2 ring-[#8C2D19]/20 shadow-xs';
                bgClass = 'bg-white';
              } else if (d.isToday) {
                borderClass = 'border-emerald-400';
                bgClass = 'bg-emerald-50/30';
              }

              return (
                <div
                  key={d.dayNumber}
                  onClick={() => setSelectedDayNum(d.dayNumber)}
                  className={`min-h-[115px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:border-slate-300 hover:bg-white relative group ${bgClass} ${borderClass}`}
                >
                  {/* Top Bar: Day Number, Moon Phase SVG & Sacred Badges */}
                  <div>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isSelected ? 'text-[#8C2D19]' : d.isToday ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                        {d.isToday && (
                          <span className="text-[8px] font-mono px-1 py-0.2 bg-emerald-600 text-white rounded font-bold uppercase">
                            Today
                          </span>
                        )}
                      </div>

                      <PanchangaMoonPhaseSvg tithiNumber={d.tithiNumber} size={18} />
                    </div>

                    {/* Tithi & Paksha */}
                    <div className="mt-1.5">
                      <div className="text-xs font-serif font-bold text-slate-900 leading-tight truncate" title={d.tithiName}>
                        {d.tithiName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{d.tithiPaksha === 'Shukla' ? 'Śukla' : 'Kṛṣṇa'}</span>
                        {d.tithiEndTime && <span className="text-[9px] text-slate-400">{d.tithiEndTime}</span>}
                      </div>
                    </div>

                    {/* Nakshatra */}
                    <div className="mt-1 text-[11px] font-serif text-[#8C2D19] truncate" title={`${d.nakshatraName} (Pada ${d.nakshatraPada})`}>
                      {d.nakshatraName} <span className="font-mono text-[9px] text-slate-500">P{d.nakshatraPada}</span>
                    </div>

                    {/* Sacred Festival Tag if any */}
                    {d.festivalName && (
                      <div className="mt-1 text-[9px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-900 font-bold rounded border border-amber-200 truncate" title={d.festivalName}>
                        ★ {d.festivalName}
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Quick Click Actions */}
                  <div className="mt-2 pt-1 border-t border-slate-200/70 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{d.sunriseStr}</span>
                    <span className="text-[#8C2D19] font-medium group-hover:underline">
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DETAILED EPHEMERIS TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white">
          <table className="w-full text-left text-xs font-mono border-collapse divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] font-serif">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Moon</th>
                <th className="p-3">Vāra (Day)</th>
                <th className="p-3">Tithi (Limb 1)</th>
                <th className="p-3">Nakṣatra (Limb 2)</th>
                <th className="p-3">Yoga (Limb 3)</th>
                <th className="p-3">Karaṇa (Limb 4)</th>
                <th className="p-3">Sun / Moon Rāśi</th>
                <th className="p-3">Sunrise/Set</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthDaysData.map((d) => (
                <tr
                  key={d.dayNumber}
                  onClick={() => setSelectedDayNum(d.dayNumber)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedDayNum === d.dayNumber ? 'bg-amber-50/50 font-semibold' : ''
                  }`}
                >
                  <td className="p-3 whitespace-nowrap">
                    <span className={`font-bold ${d.isToday ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {d.dayNumber} {monthName.slice(0, 3)}
                    </span>
                    {d.isToday && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 bg-emerald-600 text-white rounded uppercase">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <PanchangaMoonPhaseSvg tithiNumber={d.tithiNumber} size={18} showPercent />
                  </td>
                  <td className="p-3 whitespace-nowrap font-serif text-slate-800">{d.varaName}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-serif font-bold text-slate-900">{d.tithiName}</div>
                    <div className="text-[10px] text-slate-500">{d.tithiPaksha} • {d.tithiEndTime || 'Full Day'}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-serif text-[#8C2D19]">{d.nakshatraName} (P{d.nakshatraPada})</div>
                    <div className="text-[10px] text-slate-500">{d.nakshatraEndTime || ''}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap font-serif text-slate-700">{d.yogaName}</td>
                  <td className="p-3 whitespace-nowrap font-serif text-slate-700">{d.karanaName}</td>
                  <td className="p-3 whitespace-nowrap text-[11px] text-slate-700">
                    <div>☉ {d.sunRasi}</div>
                    <div>☽ {d.moonRasi}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-[10px] text-slate-500">
                    <div>↑ {d.sunriseStr}</div>
                    <div>↓ {d.sunsetStr}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInPanchanga(d);
                      }}
                      className="px-3 py-1 bg-slate-900 text-white text-[10px] font-mono uppercase font-bold rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Selected Day Active Control Panel */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border border-slate-200/90 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <PanchangaMoonPhaseSvg tithiNumber={activeDayData.tithiNumber} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C2D19]">
                Day {activeDayData.dayNumber} Selected ({activeDayData.varaName})
              </span>
              {activeDayData.festivalName && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-200 font-bold">
                  {activeDayData.festivalName}
                </span>
              )}
            </div>
            <div className="font-serif font-bold text-base text-slate-900">
              {activeDayData.tithiName} ({activeDayData.tithiPaksha} Pakṣa) • Nakṣatra: {activeDayData.nakshatraName} (Pāda {activeDayData.nakshatraPada})
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Sunrise: {activeDayData.sunriseStr} • Sunset: {activeDayData.sunsetStr} • Yoga: {activeDayData.yogaName} • Karaṇa: {activeDayData.karanaName}
            </div>
          </div>
        </div>

        {/* Action Buttons for the Selected Day */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleOpenInPanchanga(activeDayData)}
            className="flex-1 md:flex-none px-4 py-2.5 text-xs font-mono uppercase font-bold bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs select-none"
          >
            <Eye size={14} className="text-[#8C2D19]" />
            <span>Open Day Pañcāṅga</span>
          </button>

          <button
            type="button"
            disabled={isNavigating}
            onClick={() => handleOpenInWorkspace(activeDayData)}
            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-mono uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 select-none shadow-xs ${
              isNavigating
                ? 'bg-slate-900 text-white cursor-wait opacity-90'
                : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
            }`}
          >
            {isNavigating ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Opening Workspace...</span>
              </>
            ) : (
              <>
                <Compass size={14} />
                <span>Calculate Ephemeris &amp; Open Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
