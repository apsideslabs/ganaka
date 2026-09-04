'use client';

/**
 * Gaṇaka — Professional Manual Time Picker (TOB / LMT)
 * Fast, crisp, accessible and zero-lag time input instrument.
 * Features direct numeric field entry (HH:MM:SS), AM/PM toggles,
 * precision increment steppers, astronomical solar presets (Dawn, Noon, Dusk, Midnight, Now),
 * and quick hour/minute selection matrices.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Clock as ClockIcon,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from 'lucide-react';

export interface TimeValue {
  hour: number; // 0 - 23 (24-hour format for astronomical calculation backend)
  minute: number; // 0 - 59
  second?: number; // 0 - 59
}

interface GanakaClockPickerProps {
  id?: string;
  value?: TimeValue | null;
  onChange: (time: TimeValue | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function GanakaClockPicker({
  id = 'ganaka-clock-picker',
  value,
  onChange,
  placeholder = 'Select Time of Birth (HH:MM AM/PM)...',
  label,
  required = false,
}: GanakaClockPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focusable input refs
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  // Internal working values (12-hour display mode by default)
  const [is24HourMode, setIs24HourMode] = useState<boolean>(false);

  // Draft values fallback (when value is null)
  const [draftH24, setDraftH24] = useState<number>(6);
  const [draftMin, setDraftMin] = useState<number>(0);
  const [draftSec, setDraftSec] = useState<number>(0);

  const activeH24 = value ? value.hour : draftH24;
  const activeMin = value ? value.minute : draftMin;
  const activeSec = value?.second !== undefined ? value.second : draftSec;

  // Derived 12-hour values
  const draftH12 = activeH24 % 12 === 0 ? 12 : activeH24 % 12;
  const isPM = activeH24 >= 12;

  // Manual direct string input (e.g. "06:30 PM")
  const [manualText, setManualText] = useState<string>('');

  // Close when clicking outside
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

  // Helper to commit to parent immediately
  const applyTime = useCallback(
    (h24: number, min: number, sec: number) => {
      const cleanH = Math.min(23, Math.max(0, h24));
      const cleanM = Math.min(59, Math.max(0, min));
      const cleanS = Math.min(59, Math.max(0, sec));

      setDraftH24(cleanH);
      setDraftMin(cleanM);
      setDraftSec(cleanS);

      onChange({
        hour: cleanH,
        minute: cleanM,
        second: cleanS,
      });
    },
    [onChange]
  );

  // Change 12-hour component
  const updateH12 = (newH12: number, pm: boolean) => {
    const clampedH12 = Math.min(12, Math.max(1, newH12));
    let h24 = clampedH12;
    if (pm) {
      h24 = clampedH12 === 12 ? 12 : clampedH12 + 12;
    } else {
      h24 = clampedH12 === 12 ? 0 : clampedH12;
    }
    applyTime(h24, activeMin, activeSec);
  };

  // Stepper handlers
  const stepHour = (delta: number) => {
    const newH24 = (activeH24 + delta + 24) % 24;
    applyTime(newH24, activeMin, activeSec);
  };

  const stepMinute = (delta: number) => {
    const newMin = (activeMin + delta + 60) % 60;
    applyTime(activeH24, newMin, activeSec);
  };

  const stepSecond = (delta: number) => {
    const newSec = (activeSec + delta + 60) % 60;
    applyTime(activeH24, activeMin, newSec);
  };

  // Toggle AM / PM
  const togglePeriod = (targetPM: boolean) => {
    if (targetPM === isPM) return;
    if (targetPM) {
      // Switch to PM (+12h if not 12)
      const newH24 = activeH24 < 12 ? activeH24 + 12 : activeH24;
      applyTime(newH24, activeMin, activeSec);
    } else {
      // Switch to AM (-12h if >= 12)
      const newH24 = activeH24 >= 12 ? activeH24 - 12 : activeH24;
      applyTime(newH24, activeMin, activeSec);
    }
  };

  // Solar & Astronomical Presets
  const setPreset = (h: number, m: number, s: number = 0) => {
    applyTime(h, m, s);
  };

  const setNow = () => {
    const now = new Date();
    applyTime(now.getHours(), now.getMinutes(), now.getSeconds());
  };

  // Direct text parser on blur or Enter
  const handleParseManualText = () => {
    const raw = manualText.trim();
    if (!raw) return;

    // Matches: "6:30", "06:30", "6:30:15", "6:30 PM", "18:45", "6:30pm"
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const s = match[3] ? parseInt(match[3], 10) : 0;
      const period = match[4]?.toUpperCase();

      if (period === 'PM') {
        if (h < 12) h += 12;
      } else if (period === 'AM') {
        if (h === 12) h = 0;
      }

      applyTime(h, m, s);
      setManualText('');
    }
  };

  // Format display string
  const formatDisplay = (val: TimeValue | null | undefined): string => {
    if (!val) return '';
    const h = val.hour;
    const m = String(val.minute).padStart(2, '0');
    const s = String(val.second || 0).padStart(2, '0');

    if (is24HourMode) {
      return `${String(h).padStart(2, '0')}:${m}:${s}`;
    }

    const h12 = h % 12 === 0 ? 12 : h % 12;
    const period = h >= 12 ? 'PM' : 'AM';
    return `${String(h12).padStart(2, '0')}:${m}:${s} ${period}`;
  };

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171614] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-[#8B2F0B]" />
            <span>{label}</span>
          </span>
          {required && !value && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B2F0B] font-bold">
              Required
            </span>
          )}
        </label>
      )}

      {/* Primary Input Trigger Field */}
      <div
        className={`w-full bg-[#F4F0E7] border transition-all ${
          isOpen
            ? 'border-[#8B2F0B] bg-[#FCFAF6] rounded-t-xs rounded-b-none border-b-transparent shadow-xs'
            : value
            ? 'border-[#DCD5C6] text-[#171614] rounded-xs hover:border-[#8B2F0B]'
            : 'border-[#DCD5C6] text-[#847E72] rounded-xs hover:border-[#BCB4A4]'
        }`}
      >
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer text-left select-none"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <ClockIcon
              className={`w-4 h-4 shrink-0 transition-colors ${
                value ? 'text-[#8B2F0B]' : 'text-[#847E72]'
              }`}
            />
            <span
              className={`font-mono text-sm tracking-wide ${
                value ? 'text-[#171614] font-bold' : 'text-[#847E72]'
              }`}
            >
              {value ? formatDisplay(value) : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {value && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                title="Clear time"
                className="p-1 text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-[#5C5850]">
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-[#8B2F0B]" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>
        </button>
      </div>

      {/* Clean, Fast, Attached Time Adjustment Instrument */}
      {isOpen && (
        <div
          id={`${id}-attached-panel`}
          className="bg-[#FCFAF6] border border-t-0 border-[#8B2F0B] rounded-b-xs shadow-lg p-3.5 sm:p-4 space-y-3.5 animate-in fade-in duration-100"
        >
          {/* Header & Mode Switch */}
          <div className="flex items-center justify-between pb-2 border-b border-[#DCD5C6]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B2F0B]" />
              <span className="text-xs font-mono uppercase font-bold text-[#171614] tracking-wider">
                Precision Time Instrument
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIs24HourMode((prev) => !prev)}
                className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#ECE7DC] hover:bg-[#DCD5C6] text-[#5C5850] rounded-xs border border-[#DCD5C6] transition-colors cursor-pointer"
              >
                {is24HourMode ? '24-Hour Mode' : '12-Hour (AM/PM)'}
              </button>
            </div>
          </div>

          {/* Direct Segmented Numeric Input Boxes (HH : MM : SS) */}
          <div className="bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Numeric Stepper Cells */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Hour Box */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => (is24HourMode ? stepHour(1) : updateH12(draftH12 + 1, isPM))}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-t-xs transition-colors cursor-pointer"
                  title="Increment Hour"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <input
                  ref={hourInputRef}
                  type="text"
                  inputMode="numeric"
                  value={
                    is24HourMode
                      ? String(draftH24).padStart(2, '0')
                      : String(draftH12).padStart(2, '0')
                  }
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    if (!isNaN(num)) {
                      if (is24HourMode) {
                        applyTime(Math.min(23, num), draftMin, draftSec);
                      } else {
                        updateH12(Math.min(12, num), isPM);
                      }
                      if (e.target.value.length >= 2 && minuteInputRef.current) {
                        minuteInputRef.current.focus();
                        minuteInputRef.current.select();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      is24HourMode ? stepHour(1) : updateH12(draftH12 + 1, isPM);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      is24HourMode ? stepHour(-1) : updateH12(draftH12 - 1, isPM);
                    }
                  }}
                  className="w-11 sm:w-12 h-9 bg-white border border-[#DCD5C6] rounded-xs text-center font-mono font-bold text-base text-[#171614] focus:outline-none focus:border-[#8B2F0B] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => (is24HourMode ? stepHour(-1) : updateH12(draftH12 - 1, isPM))}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-b-xs transition-colors cursor-pointer"
                  title="Decrement Hour"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#847E72] mt-0.5">
                  Hour
                </span>
              </div>

              {/* Colon Separator */}
              <div className="text-xl font-bold font-mono text-[#8B2F0B] pb-3">:</div>

              {/* Minute Box */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => stepMinute(1)}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-t-xs transition-colors cursor-pointer"
                  title="Increment Minute"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  value={String(draftMin).padStart(2, '0')}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    if (!isNaN(num)) {
                      applyTime(draftH24, Math.min(59, num), draftSec);
                      if (e.target.value.length >= 2 && secondInputRef.current) {
                        secondInputRef.current.focus();
                        secondInputRef.current.select();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      stepMinute(1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      stepMinute(-1);
                    }
                  }}
                  className="w-11 sm:w-12 h-9 bg-white border border-[#DCD5C6] rounded-xs text-center font-mono font-bold text-base text-[#171614] focus:outline-none focus:border-[#8B2F0B] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => stepMinute(-1)}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-b-xs transition-colors cursor-pointer"
                  title="Decrement Minute"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#847E72] mt-0.5">
                  Min
                </span>
              </div>

              {/* Colon Separator */}
              <div className="text-xl font-bold font-mono text-[#8B2F0B] pb-3">:</div>

              {/* Second Box */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => stepSecond(1)}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-t-xs transition-colors cursor-pointer"
                  title="Increment Second"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <input
                  ref={secondInputRef}
                  type="text"
                  inputMode="numeric"
                  value={String(draftSec).padStart(2, '0')}
                  onChange={(e) => {
                    const num = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    if (!isNaN(num)) {
                      applyTime(draftH24, draftMin, Math.min(59, num));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      stepSecond(1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      stepSecond(-1);
                    }
                  }}
                  className="w-11 sm:w-12 h-9 bg-white border border-[#DCD5C6] rounded-xs text-center font-mono font-bold text-base text-[#171614] focus:outline-none focus:border-[#8B2F0B] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => stepSecond(-1)}
                  className="w-10 h-6 flex items-center justify-center text-[#5C5850] hover:text-[#8B2F0B] hover:bg-[#ECE7DC] rounded-b-xs transition-colors cursor-pointer"
                  title="Decrement Second"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#847E72] mt-0.5">
                  Sec
                </span>
              </div>
            </div>

            {/* AM / PM Segmented Toggle Buttons */}
            {!is24HourMode && (
              <div className="flex items-center gap-1 bg-[#ECE7DC] p-1 border border-[#DCD5C6] rounded-xs">
                <button
                  type="button"
                  onClick={() => togglePeriod(false)}
                  className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xs transition-all cursor-pointer ${
                    !isPM
                      ? 'bg-[#8B2F0B] text-white shadow-xs'
                      : 'text-[#5C5850] hover:text-[#171614] hover:bg-[#FAF7F0]'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => togglePeriod(true)}
                  className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xs transition-all cursor-pointer ${
                    isPM
                      ? 'bg-[#8B2F0B] text-white shadow-xs'
                      : 'text-[#5C5850] hover:text-[#171614] hover:bg-[#FAF7F0]'
                  }`}
                >
                  PM
                </button>
              </div>
            )}
          </div>

          {/* Quick Astronomical Solar Presets */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#847E72] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8B2F0B]" />
              <span>Solar &amp; Astronomical Presets:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setPreset(6, 0, 0)}
                className="px-2 py-1.5 text-[11px] font-mono bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Sunrise className="w-3 h-3 text-[#8B2F0B]" />
                <span>06:00 AM (Dawn)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(12, 0, 0)}
                className="px-2 py-1.5 text-[11px] font-mono bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Sun className="w-3 h-3 text-[#8B2F0B]" />
                <span>12:00 PM (Noon)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(18, 0, 0)}
                className="px-2 py-1.5 text-[11px] font-mono bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Sunset className="w-3 h-3 text-[#8B2F0B]" />
                <span>06:00 PM (Dusk)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(0, 0, 0)}
                className="px-2 py-1.5 text-[11px] font-mono bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Moon className="w-3 h-3 text-[#8B2F0B]" />
                <span>12:00 AM (Mid)</span>
              </button>
              <button
                type="button"
                onClick={setNow}
                className="col-span-2 sm:col-span-1 px-2 py-1.5 text-[11px] font-mono font-bold bg-[#171614] hover:bg-[#8B2F0B] text-white rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <ClockIcon className="w-3 h-3" />
                <span>Now</span>
              </button>
            </div>
          </div>

          {/* Quick Select Hours (1 - 12) Matrix */}
          <div className="space-y-1 pt-1 border-t border-[#DCD5C6]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#847E72]">
              Quick Hours:
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {HOURS_12.map((h) => {
                const isSelected = draftH12 === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateH12(h, isPM)}
                    className={`py-1 text-xs font-mono font-semibold rounded-xs border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B2F0B] text-white border-[#8B2F0B]'
                        : 'bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#171614] border-[#DCD5C6]'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Select Minutes Matrix & Step Adjusters */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#847E72]">
                Quick Minutes:
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => stepMinute(-15)}
                  className="px-1 py-0.5 bg-[#ECE7DC] hover:bg-[#DCD5C6] rounded-xs cursor-pointer"
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => stepMinute(-5)}
                  className="px-1 py-0.5 bg-[#ECE7DC] hover:bg-[#DCD5C6] rounded-xs cursor-pointer"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => stepMinute(5)}
                  className="px-1 py-0.5 bg-[#ECE7DC] hover:bg-[#DCD5C6] rounded-xs cursor-pointer"
                >
                  +5m
                </button>
                <button
                  type="button"
                  onClick={() => stepMinute(15)}
                  className="px-1 py-0.5 bg-[#ECE7DC] hover:bg-[#DCD5C6] rounded-xs cursor-pointer"
                >
                  +15m
                </button>
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
              {MINUTE_PRESETS.map((m) => {
                const isSelected = draftMin === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => applyTime(draftH24, m, draftSec)}
                    className={`py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B2F0B] text-white border-[#8B2F0B] font-bold'
                        : 'bg-[#FAF7F0] hover:bg-[#ECE7DC] text-[#5C5850] border-[#DCD5C6]'
                    }`}
                  >
                    :{String(m).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Manual Text Entry (Optional Alternative) */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DCD5C6]">
            <input
              type="text"
              placeholder="Or type e.g. 06:30 PM"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onBlur={handleParseManualText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleParseManualText();
                }
              }}
              className="flex-1 px-2.5 py-1 text-xs font-mono bg-white border border-[#DCD5C6] rounded-xs text-[#171614] placeholder:text-[#847E72] focus:outline-none focus:border-[#8B2F0B]"
            />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1 bg-[#171614] hover:bg-[#8B2F0B] text-white text-xs font-mono uppercase font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Time</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
