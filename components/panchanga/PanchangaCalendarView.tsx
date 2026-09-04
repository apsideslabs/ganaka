'use client';

/**
 * Gaṇaka — Large Interactive Monthly Calendar Navigation View
 * Large primary monthly grid. Clicking any date loads that day's Daily Pañcāṅga below.
 */

import React, { useMemo } from 'react';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { calculateAllPlanets } from '@/lib/astronomy/ephemeris';
import { calculatePanchanga } from '@/lib/jyotisha/panchanga';
import { PanchangaDailyView } from './PanchangaDailyView';
import { PanchangaMoonPhaseSvg } from './PanchangaMoonPhaseSvg';
import { AyanamshaType, calculateAyanamsha, formatAyanamsha } from '@/lib/astronomy/ayanamsha';
import { CityLocation } from '@/lib/astronomy/coordinates';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface PanchangaCalendarViewProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
}

export function PanchangaCalendarView({
  selectedDate,
  onSelectDate,
  selectedCity,
  ayanamshaType,
}: PanchangaCalendarViewProps) {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth(); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    const next = new Date(currentYear, currentMonth - 1, selectedDate.getDate());
    onSelectDate(next);
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonth + 1, selectedDate.getDate());
    onSelectDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    onSelectDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
  };

  // Compute all days in the current calendar month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    const days: Array<{
      dayNumber: number;
      dateObj: Date;
      isCurrentSelected: boolean;
      isToday: boolean;
      tithiName: string;
      tithiPaksha: 'Shukla' | 'Krishna';
      nakshatraName: string;
      moonFraction: number;
      moonAngle: number;
      specialParva?: string;
    }> = [];

    const today = new Date();

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

      const isCurrentSelected =
        selectedDate.getFullYear() === currentYear &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getDate() === d;

      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === d;

      let specialParva: string | undefined = undefined;
      const tNum = p.tithi.number;
      if (tNum === 11 || tNum === 26) specialParva = 'Ekādaśī';
      else if (tNum === 13 || tNum === 28) specialParva = 'Pradoṣa';
      else if (tNum === 15) specialParva = 'Pūrṇimā';
      else if (tNum === 30) specialParva = 'Amāvāsyā';
      else if (tNum === 4 || tNum === 19) specialParva = 'Caturthī';

      days.push({
        dayNumber: d,
        dateObj,
        isCurrentSelected,
        isToday,
        tithiName: p.tithi.name,
        tithiPaksha: p.tithi.paksha,
        nakshatraName: p.nakshatra.name,
        moonFraction: (p.sunTimes.moonIlluminationPct ?? ((tNum <= 15 ? tNum : 30 - tNum) / 15 * 100)) / 100,
        moonAngle: tNum * 12,
        specialParva,
      });
    }

    return { days, startingDayOfWeek };
  }, [currentYear, currentMonth, selectedDate, selectedCity, ayanamshaType]);

  // Daily calculation for the actively selected date
  const activeDayPanchanga = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();

    const utSunrise = 6.0 - selectedCity.timezoneOffsetHours;
    const jd = calculateJulianDay(y, m, d, utSunrise);
    const planets = calculateAllPlanets(jd, ayanamshaType);

    const panchanga = calculatePanchanga(
      planets.sun.siderealLongitude,
      planets.moon.siderealLongitude,
      jd,
      selectedCity.latitude,
      selectedCity.longitude,
      selectedCity.timezoneOffsetHours,
      ayanamshaType
    );

    const ayanamshaVal = calculateAyanamsha(jd, ayanamshaType);
    const ayanamshaFormatted = formatAyanamsha(ayanamshaVal);

    return { panchanga, planets, jd, ayanamshaFormatted };
  }, [selectedDate, selectedCity, ayanamshaType]);

  const monthName = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* 1. Large Monthly Calendar Primary Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        {/* Month Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-[#8C2D19]" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Interactive Monthly Calendar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              {monthName}
            </h2>
            <p className="text-xs font-serif text-slate-500 mt-0.5">
              Click any date to inspect its complete Daily Pañcāṅga below
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
              onClick={handleToday}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 transition-colors cursor-pointer"
            >
              Today
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

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {weekDayLabels.map((w, idx) => (
              <div
                key={w}
                className={`py-2 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg ${
                  idx === 0 || idx === 6 ? 'text-[#8C2D19] bg-amber-50/50' : 'text-slate-500 bg-slate-50'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Date Tiles */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: calendarDays.startingDayOfWeek }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[76px] sm:min-h-[92px] bg-slate-50/30 border border-transparent rounded-xl"
              />
            ))}

            {/* Days in Month */}
            {calendarDays.days.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => onSelectDate(d.dateObj)}
                className={`min-h-[76px] sm:min-h-[92px] p-2 sm:p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  d.isCurrentSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : d.isToday
                    ? 'bg-amber-50/60 border-amber-300 text-slate-900 hover:bg-amber-50'
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-sm sm:text-base font-serif font-bold ${
                      d.isCurrentSelected
                        ? 'text-white'
                        : d.isToday
                        ? 'text-[#8C2D19]'
                        : 'text-slate-900'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                  <PanchangaMoonPhaseSvg
                    illuminationFraction={d.moonFraction}
                    phaseAngleDeg={d.moonAngle}
                    size={16}
                  />
                </div>

                <div className="space-y-0.5 mt-1">
                  <span
                    className={`text-[10px] sm:text-[11px] font-serif block truncate font-medium ${
                      d.isCurrentSelected ? 'text-slate-100' : 'text-slate-800'
                    }`}
                  >
                    {d.tithiName}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono block truncate ${
                      d.isCurrentSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {d.nakshatraName}
                  </span>
                  {d.specialParva && (
                    <span
                      className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                        d.isCurrentSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {d.specialParva}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Selected Day's Detailed Pañcāṅga (Loads below the calendar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-serif font-bold text-slate-900">
            Detailed Pañcāṅga for Selected Date: {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Coordinates: {selectedCity.name}
          </span>
        </div>

        <PanchangaDailyView
          panchanga={activeDayPanchanga.panchanga}
          planets={activeDayPanchanga.planets}
          date={selectedDate}
          cityName={selectedCity.name}
          ayanamshaFormatted={activeDayPanchanga.ayanamshaFormatted}
          jd={activeDayPanchanga.jd}
        />
      </div>
    </div>
  );
}
