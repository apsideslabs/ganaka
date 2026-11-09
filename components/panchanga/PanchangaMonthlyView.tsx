'use client';

/**
 * Gaṇaka — Monthly Pañcāṅga Table & Astronomical Almanac
 * Month-level comprehensive ledger showing all daily limbs, solar/lunar transitions,
 * and key Parvas/Vratas for the entire selected month.
 */

import React, { useMemo } from 'react';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { calculateAllPlanets } from '@/lib/astronomy/ephemeris';
import { calculatePanchanga } from '@/lib/jyotisha/panchanga';
import { PanchangaMoonPhaseSvg } from './PanchangaMoonPhaseSvg';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { CityLocation } from '@/lib/astronomy/coordinates';
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { formatPlace } from '@/lib/format-place';

interface PanchangaMonthlyViewProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
}

export function PanchangaMonthlyView({
  selectedDate,
  onSelectDate,
  selectedCity,
  ayanamshaType,
}: PanchangaMonthlyViewProps) {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const handlePrevMonth = () => {
    const next = new Date(currentYear, currentMonth - 1, 1);
    onSelectDate(next);
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonth + 1, 1);
    onSelectDate(next);
  };

  // Calculate full month ledger
  const monthlyLedger = useMemo(() => {
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const rows: Array<{
      day: number;
      dateObj: Date;
      dayOfWeek: string;
      tithiName: string;
      tithiPaksha: 'Shukla' | 'Krishna';
      nakshatraName: string;
      nakshatraPada: number;
      yogaName: string;
      karanaName: string;
      sunrise: string;
      sunset: string;
      moonFraction: number;
      moonAngle: number;
      parvaLabel?: string;
    }> = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d, 6, 0, 0);
      const utSunrise = 6.0 - selectedCity.timezoneOffsetHours;
      const jd = calculateJulianDay(currentYear, currentMonth + 1, d, utSunrise);

      const planets = calculateAllPlanets(jd, ayanamshaType);
      const p = calculatePanchanga(
        planets.sun.siderealLongitude,
        planets.moon.siderealLongitude,
        jd,
        selectedCity.latitude,
        selectedCity.longitude,
        selectedCity.timezoneOffsetHours,
        ayanamshaType
      );

      let parvaLabel: string | undefined = undefined;
      const tNum = p.tithi.number;
      if (tNum === 11 || tNum === 26) parvaLabel = 'Ekādaśī';
      else if (tNum === 13 || tNum === 28) parvaLabel = 'Pradoṣa Vrata';
      else if (tNum === 15) parvaLabel = 'Pūrṇimā';
      else if (tNum === 30) parvaLabel = 'Amāvāsyā';
      else if (tNum === 4 || tNum === 19) parvaLabel = 'Saṅkaṣṭī / Vināyaka';

      rows.push({
        day: d,
        dateObj,
        dayOfWeek: p.vara.name,
        tithiName: p.tithi.name,
        tithiPaksha: p.tithi.paksha,
        nakshatraName: p.nakshatra.name,
        nakshatraPada: p.nakshatra.pada,
        yogaName: p.yoga.name,
        karanaName: p.karana.name,
        sunrise: p.sunTimes.sunrise,
        sunset: p.sunTimes.sunset,
        moonFraction: (p.sunTimes.moonIlluminationPct ?? ((tNum <= 15 ? tNum : 30 - tNum) / 15 * 100)) / 100,
        moonAngle: tNum * 12,
        parvaLabel,
      });
    }

    return rows;
  }, [currentYear, currentMonth, selectedCity, ayanamshaType]);

  const monthName = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-[#8C2D19]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Monthly Astronomical Ledger
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Monthly Pañcāṅga — {monthName}
          </h2>
          <p className="text-xs font-serif text-slate-500 mt-0.5">
            Complete month-level ledger of daily limbs, solar coordinates, and sacred Parvas for {formatPlace(selectedCity)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Full Month Tabular Ledger */}
      <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-serif">
              <th className="py-3 px-3.5">Date / Day</th>
              <th className="py-3 px-3.5">Phase</th>
              <th className="py-3 px-3.5">Tithi (Lunar Day)</th>
              <th className="py-3 px-3.5">Nakṣatra (Asterism)</th>
              <th className="py-3 px-3.5">Yoga</th>
              <th className="py-3 px-3.5">Karaṇa</th>
              <th className="py-3 px-3.5">Sunrise / Sunset</th>
              <th className="py-3 px-3.5">Events / Vratas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyLedger.map((row) => {
              const isSelected =
                selectedDate.getFullYear() === currentYear &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getDate() === row.day;

              return (
                <tr
                  key={row.day}
                  onClick={() => onSelectDate(row.dateObj)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-50/70 font-bold text-slate-900'
                      : 'hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  {/* Date & Day */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-xs">{String(row.day).padStart(2, '0')}</span>{' '}
                    <span className="text-[11px] text-slate-500">({row.dayOfWeek.slice(0, 3)})</span>
                  </td>

                  {/* Moon Phase Icon */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <PanchangaMoonPhaseSvg
                      illuminationFraction={row.moonFraction}
                      phaseAngleDeg={row.moonAngle}
                      size={18}
                    />
                  </td>

                  {/* Tithi */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-serif">
                    <span className={row.tithiPaksha === 'Shukla' ? 'text-[#8C2D19] font-medium' : 'text-slate-800'}>
                      {row.tithiName}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400">({row.tithiPaksha[0]})</span>
                  </td>

                  {/* Nakshatra */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-serif">
                    {row.nakshatraName} <span className="text-[10px] text-slate-400 font-mono">P{row.nakshatraPada}</span>
                  </td>

                  {/* Yoga */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                    {row.yogaName}
                  </td>

                  {/* Karana */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                    {row.karanaName}
                  </td>

                  {/* Sun Times */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-500">
                    {row.sunrise} – {row.sunset}
                  </td>

                  {/* Events / Parvas */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {row.parvaLabel ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-50 text-amber-900 rounded-md border border-amber-200">
                        {row.parvaLabel}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
