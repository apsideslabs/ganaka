'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, X, Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GanakaDatePickerProps {
  id?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const START_YEAR = 1900;
const END_YEAR = 2040;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export function GanakaDatePicker({
  id = 'ganaka-date-picker',
  value,
  onChange,
  placeholder = 'Select Date of Birth...',
  label,
  required = false,
}: GanakaDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // View state for month & year navigation
  const [viewYear, setViewYear] = useState<number>(() => (value ? value.getFullYear() : 2000));
  const [viewMonth, setViewMonth] = useState<number>(() => (value ? value.getMonth() : 0));
  const [manualInputText, setManualInputText] = useState<string>('');

  // Keep view in sync when opening or changing
  const handleToggleOpen = () => {
    if (!isOpen) {
      if (value) {
        setViewYear(value.getFullYear());
        setViewMonth(value.getMonth());
        setManualInputText(formatDisplay(value));
      } else {
        setManualInputText('');
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      if (viewYear > START_YEAR) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      if (viewYear < END_YEAR) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleYearJump = (delta: number) => {
    const nextY = Math.max(START_YEAR, Math.min(END_YEAR, viewYear + delta));
    setViewYear(nextY);
  };

  const handleSelectDay = (dayNumber: number, monthOffset: number = 0) => {
    let targetYear = viewYear;
    let targetMonth = viewMonth + monthOffset;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    if (targetYear < START_YEAR || targetYear > END_YEAR) return;

    const newDate = new Date(targetYear, targetMonth, dayNumber, 12, 0, 0);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(todayDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setManualInputText('');
  };

  // Direct manual text entry parsing
  const handleManualCommit = () => {
    const text = manualInputText.trim();
    if (!text) return;

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmy = text.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) {
      const d = parseInt(dmy[1], 10);
      const m = parseInt(dmy[2], 10) - 1;
      const y = parseInt(dmy[3], 10);
      if (y >= START_YEAR && y <= END_YEAR && m >= 0 && m <= 11) {
        const maxD = new Date(y, m + 1, 0).getDate();
        if (d >= 1 && d <= maxD) {
          const parsed = new Date(y, m, d, 12, 0, 0);
          onChange(parsed);
          setViewYear(y);
          setViewMonth(m);
          setIsOpen(false);
          return;
        }
      }
    }

    // YYYY-MM-DD
    const ymd = text.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymd) {
      const y = parseInt(ymd[1], 10);
      const m = parseInt(ymd[2], 10) - 1;
      const d = parseInt(ymd[3], 10);
      if (y >= START_YEAR && y <= END_YEAR && m >= 0 && m <= 11) {
        const maxD = new Date(y, m + 1, 0).getDate();
        if (d >= 1 && d <= maxD) {
          const parsed = new Date(y, m, d, 12, 0, 0);
          onChange(parsed);
          setViewYear(y);
          setViewMonth(m);
          setIsOpen(false);
        }
      }
    }
  };

  function formatDisplay(d: Date | null | undefined) {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Generate calendar days matrix for the active viewMonth and viewYear
  const calendarMatrix = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      monthOffset: number; // -1 = prev month, 0 = current, 1 = next
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const today = new Date();
    const isCurrentMonthThisYear =
      today.getFullYear() === viewYear && today.getMonth() === viewMonth;

    // Previous month padding days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        monthOffset: -1,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isSelected =
        !!value &&
        value.getFullYear() === viewYear &&
        value.getMonth() === viewMonth &&
        value.getDate() === d;
      const isToday = isCurrentMonthThisYear && today.getDate() === d;

      days.push({
        day: d,
        monthOffset: 0,
        isToday,
        isSelected,
      });
    }

    // Next month padding days to fill 5 or 6 rows (multiple of 7)
    const remainder = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainder; d++) {
      days.push({
        day: d,
        monthOffset: 1,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  const selectedDateFormatted = value
    ? value.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171614] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#8B2F0B]" />
            <span>{label}</span>
          </span>
          {required && !value && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B2F0B] font-bold">Required</span>
          )}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        className={`w-full bg-[#F4F0E7] border transition-colors ${
          isOpen
            ? 'border-[#8B2F0B] bg-[#FCFAF6] rounded-t-xs rounded-b-none border-b-transparent shadow-xs'
            : value
            ? 'border-[#DCD5C6] text-[#171614] rounded-xs hover:border-[#BCB4A4]'
            : 'border-[#DCD5C6] text-[#847E72] rounded-xs hover:border-[#BCB4A4]'
        }`}
      >
        <button
          type="button"
          id={id}
          onClick={handleToggleOpen}
          className="w-full px-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer text-left"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CalendarIcon
              className={`w-4 h-4 shrink-0 transition-colors ${
                value ? 'text-[#8B2F0B]' : 'text-[#847E72]'
              }`}
            />
            <span
              className={`font-mono text-sm ${
                value ? 'text-[#171614] font-bold' : 'text-[#847E72]'
              }`}
            >
              {value ? formatDisplay(value) : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {value && (
              <span
                onClick={handleClear}
                title="Clear date"
                className="p-1 text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-[#5C5850]">
              {isOpen ? <ChevronUp className="w-4 h-4 text-[#8B2F0B]" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </button>
      </div>

      {/* Clean Attached Date Picker Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${id}-dropdown-panel`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="overflow-hidden bg-[#FCFAF6] border border-t-0 border-[#8B2F0B] rounded-b-xs shadow-md z-40"
          >
            <div className="p-3.5 space-y-3">
              {/* Header: Selected Readout & Direct Typing Input */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#DCD5C6]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B2F0B]" />
                  <span className="text-xs font-serif font-bold text-[#171614]">
                    {selectedDateFormatted || `${MONTH_FULL_NAMES[viewMonth]} ${viewYear}`}
                  </span>
                </div>

                {/* Direct Entry Input */}
                <div className="flex items-center gap-1 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs px-2 py-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#5C5850]">Type:</span>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={manualInputText}
                    onChange={(e) => setManualInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleManualCommit();
                      }
                    }}
                    onBlur={handleManualCommit}
                    className="w-24 px-1 py-0.5 text-xs font-mono text-center text-[#171614] bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs focus:outline-none focus:border-[#8B2F0B]"
                  />
                  <button
                    type="button"
                    onClick={handleManualCommit}
                    className="text-[10px] font-mono font-bold text-[#8B2F0B] hover:underline cursor-pointer ml-1"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Month & Year Selection Controls */}
              <div className="flex items-center justify-between gap-1.5 bg-[#ECE7DC] p-1.5 rounded-xs border border-[#DCD5C6]">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-1.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#F4F0E7] text-[#171614] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Month Select */}
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                    className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs px-2 py-1 text-xs font-serif font-bold text-[#171614] focus:outline-none focus:border-[#8B2F0B] cursor-pointer"
                  >
                    {MONTH_FULL_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* Year Select */}
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                    className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs px-2 py-1 text-xs font-mono font-bold text-[#171614] focus:outline-none focus:border-[#8B2F0B] cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-1.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#F4F0E7] text-[#171614] cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Decade Jump Steppers */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5C5850]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleYearJump(-10)}
                    className="px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#ECE7DC] text-[10px] cursor-pointer"
                    title="Jump -10 years"
                  >
                    -10y
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYearJump(-1)}
                    className="px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#ECE7DC] text-[10px] cursor-pointer"
                    title="Jump -1 year"
                  >
                    -1y
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYearJump(1)}
                    className="px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#ECE7DC] text-[10px] cursor-pointer"
                    title="Jump +1 year"
                  >
                    +1y
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYearJump(10)}
                    className="px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs hover:bg-[#ECE7DC] text-[10px] cursor-pointer"
                    title="Jump +10 years"
                  >
                    +10y
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSetToday}
                  className="flex items-center gap-1 px-2 py-0.5 text-[#8B2F0B] font-semibold hover:bg-[#ECE7DC] cursor-pointer bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs text-[10px] font-mono uppercase"
                >
                  <CalendarIcon className="w-2.5 h-2.5" />
                  <span>Today</span>
                </button>
              </div>

              {/* Calendar Grid Matrix */}
              <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-2">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAY_LABELS.map((d, i) => (
                    <div
                      key={d}
                      className={`text-[10px] font-mono font-bold py-1 ${
                        i === 0 ? 'text-[#8B2F0B]' : 'text-[#5C5850]'
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarMatrix.map((item, idx) => {
                    const isOutsideMonth = item.monthOffset !== 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDay(item.day, item.monthOffset)}
                        className={`h-7 w-full flex items-center justify-center rounded-xs text-xs font-mono transition-colors cursor-pointer ${
                          item.isSelected
                            ? 'bg-[#171614] text-[#FCFAF6] font-bold'
                            : item.isToday
                            ? 'bg-[#ECE7DC] text-[#8B2F0B] font-bold border border-[#8B2F0B]/40'
                            : isOutsideMonth
                            ? 'text-[#AFA99E] hover:bg-[#F4F0E7] hover:text-[#5C5850]'
                            : 'text-[#171614] hover:bg-[#ECE7DC] hover:text-[#8B2F0B] font-medium'
                        }`}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#DCD5C6] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-mono text-[#5C5850] hover:text-[#8B2F0B] font-medium cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-[#171614] hover:bg-[#8B2F0B] text-[#FCFAF6] rounded-xs text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
