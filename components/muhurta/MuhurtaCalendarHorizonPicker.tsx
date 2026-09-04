'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

interface MuhurtaCalendarHorizonPickerProps {
  startDate: Date;
  endDate: Date;
  onChangeRange: (start: Date, end: Date) => void;
}

export type HorizonPresetId =
  | 'today'
  | 'tomorrow'
  | 'next_3_days'
  | 'this_week'
  | 'next_7_days'
  | 'this_month'
  | 'next_30_days'
  | 'next_60_days'
  | 'next_90_days'
  | 'full_year';

interface PresetOption {
  id: HorizonPresetId;
  label: string;
  sublabel: string;
  getRange: () => { start: Date; end: Date };
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'today',
    label: 'Today',
    sublabel: 'Single Day (अद्य)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    sublabel: 'Target Day (श्वः)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'next_3_days',
    label: 'Next 3 Days',
    sublabel: 'Short Horizon (त्रिदिनम्)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'this_week',
    label: 'This Week',
    sublabel: 'Through Sunday (सप्ताह)',
    getRange: () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'next_7_days',
    label: 'Next 7 Days',
    sublabel: '1 Full Week (सप्ताह)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'this_month',
    label: 'This Month',
    sublabel: 'Through Month-End (मासान्त)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const end = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'next_30_days',
    label: 'Next 30 Days',
    sublabel: '1 Full Month (१ मास)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 29, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'next_60_days',
    label: 'Next 60 Days',
    sublabel: '2 Full Months (२ मास)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 59, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'next_90_days',
    label: 'Next 90 Days',
    sublabel: '1 Season (ऋतु / 3 Months)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 89, 23, 59, 59);
      return { start, end };
    },
  },
  {
    id: 'full_year',
    label: 'Full Year',
    sublabel: 'Saṁvatsara (संवत्सर)',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate() - 1, 23, 59, 59);
      return { start, end };
    },
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function MuhurtaCalendarHorizonPicker({
  startDate,
  endDate,
  onChangeRange,
}: MuhurtaCalendarHorizonPickerProps) {
  // Calendar viewing month/year
  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  );

  // Selection mode: 'start' | 'end'
  const [selectionTarget, setSelectionTarget] = useState<'start' | 'end'>('start');

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Generate grid days for the month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelectedStart: boolean;
      isSelectedEnd: boolean;
      isInRange: boolean;
    }> = [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const startStr = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    const endStr = `${endDate.getFullYear()}-${endDate.getMonth()}-${endDate.getDate()}`;

    const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const curDate = new Date(viewYear, viewMonth - 1, d);
      days.push({
        date: curDate,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        isSelectedStart: false,
        isSelectedEnd: false,
        isInRange: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      const curStr = `${viewYear}-${viewMonth}-${d}`;
      const curTime = curDate.getTime();

      const isSelectedStart = curStr === startStr;
      const isSelectedEnd = curStr === endStr;
      const isInRange = curTime >= startTime && curTime <= endTime;
      const isToday = curStr === todayStr;

      days.push({
        date: curDate,
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
        isSelectedStart,
        isSelectedEnd,
        isInRange,
      });
    }

    // Next month padding to fill complete rows (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const curDate = new Date(viewYear, viewMonth + 1, d);
      days.push({
        date: curDate,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        isSelectedStart: false,
        isSelectedEnd: false,
        isInRange: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, startDate, endDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (clickedDate: Date) => {
    const normClicked = new Date(
      clickedDate.getFullYear(),
      clickedDate.getMonth(),
      clickedDate.getDate(),
      12, 0, 0
    );

    if (selectionTarget === 'start') {
      // Set start date
      if (normClicked > endDate) {
        // If start is after end, set both to start
        onChangeRange(normClicked, normClicked);
      } else {
        onChangeRange(normClicked, endDate);
      }
      setSelectionTarget('end');
    } else {
      // Set end date
      if (normClicked < startDate) {
        // If clicked is before start, set as new start
        onChangeRange(normClicked, startDate);
      } else {
        onChangeRange(startDate, normClicked);
      }
      setSelectionTarget('start');
    }
  };

  const handleApplyPreset = (preset: PresetOption) => {
    const { start, end } = preset.getRange();
    onChangeRange(start, end);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
  };

  const diffDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return (
    <div
      id="muhurta-calendar-horizon-picker"
      className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-4 sm:p-5 shadow-xs font-sans"
    >
      {/* Top Header: Current Selected Horizon Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD5C6] pb-3.5 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B2F0B] font-bold">
            Search Horizon &amp; Astronomical Date Span
          </span>
          <div className="text-sm sm:text-base font-serif font-bold text-[#171614] flex items-center gap-2 mt-0.5">
            <span>
              {startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-[#847E72] font-normal">to</span>
            <span>
              {endDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#ECE7DC] text-[#8B2F0B] font-semibold rounded-xs ml-1">
              {diffDays} {diffDays === 1 ? 'Day' : 'Days'} Window
            </span>
          </div>
        </div>

        {/* Start / End Selection Toggle Indicator */}
        <div className="flex items-center gap-1 bg-[#ECE7DC] p-0.5 rounded-xs border border-[#DCD5C6] text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectionTarget('start')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              selectionTarget === 'start'
                ? 'bg-[#171614] text-[#FCFAF6] font-bold'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            1. Set Start Date
          </button>
          <button
            type="button"
            onClick={() => setSelectionTarget('end')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              selectionTarget === 'end'
                ? 'bg-[#171614] text-[#FCFAF6] font-bold'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            2. Set End Date
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Preset Horizon Chips */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#5C5850] font-semibold block mb-1">
            Real-World Constraint Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
            {PRESET_OPTIONS.map((preset) => {
              const { start, end } = preset.getRange();
              const pDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
              const isMatch = diffDays === pDays;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left p-2 text-xs font-mono border rounded-xs transition-all flex flex-col justify-between cursor-pointer ${
                    isMatch
                      ? 'bg-[#171614] text-[#FCFAF6] border-[#171614] font-bold shadow-xs ring-1 ring-[#171614]'
                      : 'bg-[#F4F0E7] text-[#171614] border-[#DCD5C6] hover:border-[#8B2F0B] hover:bg-[#ECE7DC]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold">{preset.label}</span>
                    {isMatch && <Check className="w-3 h-3 text-[#C49A45]" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 block truncate ${isMatch ? 'text-[#C49A45]' : 'text-[#847E72]'}`}>
                    {preset.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pt-2 text-[11px] text-[#847E72] font-serif leading-tight">
            * <strong>Constraint-First Selection:</strong> Searches strictly within your required time horizon. Blemishes are disclosed with classical mitigations.
          </div>
        </div>

        {/* Right Column: Interactive Clean Bespoke Calendar Month Grid */}
        <div className="lg:col-span-7 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs p-4">
          {/* Month Navigation Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C6]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xs hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-serif font-bold text-[#171614] tracking-wide">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xs hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-[#DCD5C6] text-[11px] font-mono font-bold text-[#5C5850]">
            {WEEKDAY_NAMES.map((wd, i) => (
              <div key={wd} className={i === 0 ? 'text-[#8B2F0B]' : ''}>
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {calendarDays.map((item, idx) => {
              const isStart = item.isSelectedStart;
              const isEnd = item.isSelectedEnd;
              const inRange = item.isInRange;

              let btnClass = 'text-[#171614] hover:bg-[#ECE7DC]';
              if (!item.isCurrentMonth) {
                btnClass = 'text-[#A69F91] opacity-40 hover:bg-transparent';
              } else if (isStart || isEnd) {
                btnClass = 'bg-[#8B2F0B] text-[#FCFAF6] font-bold shadow-xs';
              } else if (inRange) {
                btnClass = 'bg-[#ECE7DC] text-[#8B2F0B] font-semibold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!item.isCurrentMonth}
                  onClick={() => item.isCurrentMonth && handleSelectDay(item.date)}
                  className={`h-9 sm:h-10 text-xs sm:text-sm font-mono rounded-xs flex flex-col items-center justify-center relative transition-colors cursor-pointer ${btnClass}`}
                >
                  <span>{item.dayNumber}</span>
                  {item.isToday && !isStart && !isEnd && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8B2F0B]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
