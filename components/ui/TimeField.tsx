'use client';

/**
 * Birth time — a plain three-field entry with an explicit half-of-day choice.
 *
 * The previous control was a clock dial with a 12-hour face that defaulted to
 * AM. A birth at 23:51 typed as "11:51" was silently stored as 11:51 — twelve
 * hours out, a whole ascendant wrong — and nothing in the control said so.
 *
 * This one is boring on purpose. Hours, minutes, seconds as numbers; a 24-hour
 * or 12-hour face; and in 12-hour mode an AM/PM choice you have to make. The
 * value handed to the engine is ALWAYS 24-hour, and the resolved time is shown
 * back in both forms so the reading can be checked at a glance.
 */

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { to24Hour, formatTime24, formatTime12 } from '@/lib/jyotisha/time-format';

export interface TimeValue {
  hour: number;   // always 0–23
  minute: number; // 0–59
  second: number; // 0–59
}

interface TimeFieldProps {
  id?: string;
  label?: string;
  value: TimeValue | null;
  onChange: (v: TimeValue) => void;
  required?: boolean;
  placeholder?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const TimeField: React.FC<TimeFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
  placeholder = 'HH : MM : SS',
}) => {
  const [use24, setUse24] = useState(true);
  // The 12-hour face needs a meridiem of its own; it is not derivable from a
  // value the user has not entered yet, and defaulting it silently is exactly
  // the bug this component exists to remove.
  const [pm, setPm] = useState(false);

  const [hh, setHh] = useState('');
  const [mm, setMm] = useState('');
  const [ss, setSs] = useState('');

  // Reflect an externally-set value (URL, localStorage, reset).
  useEffect(() => {
    if (!value) return;
    setHh(String(value.hour));
    setMm(pad(value.minute));
    setSs(pad(value.second));
    setPm(value.hour >= 12);
  }, [value?.hour, value?.minute, value?.second]);

  /** Compose the 24-hour value from whatever the face currently shows. */
  const commit = (rawH: string, rawM: string, rawS: string, isPm: boolean, is24: boolean) => {
    if (rawH === '') return; // nothing to commit yet
    const h = parseInt(rawH, 10);
    const m = clamp(parseInt(rawM || '0', 10) || 0, 0, 59);
    const s = clamp(parseInt(rawS || '0', 10) || 0, 0, 59);
    if (Number.isNaN(h)) return;

    onChange({ hour: to24Hour(h, isPm, is24), minute: m, second: s });
  };

  const onH = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setHh(digits);
    commit(digits, mm, ss, pm, use24);
  };
  const onM = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setMm(digits);
    commit(hh, digits, ss, pm, use24);
  };
  const onS = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setSs(digits);
    commit(hh, mm, digits, pm, use24);
  };

  const switchMode = (to24: boolean) => {
    setUse24(to24);
    if (value) {
      // Re-render the same instant on the other face.
      const h12 = value.hour % 12 === 0 ? 12 : value.hour % 12;
      setHh(String(to24 ? value.hour : h12));
      setPm(value.hour >= 12);
    }
  };

  const setMeridiem = (isPm: boolean) => {
    setPm(isPm);
    commit(hh, mm, ss, isPm, use24);
  };

  const displayHour = use24
    ? (value ? pad(value.hour) : '')
    : (value ? String(value.hour % 12 === 0 ? 12 : value.hour % 12) : '');

  const field =
    'w-full text-center font-mono tabular-nums text-[15px] bg-transparent outline-none ' +
    'text-slate-900 placeholder:text-slate-300';

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="flex items-center justify-between text-[13px] font-medium text-slate-700"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
            {label}
          </span>
          {required && !value && (
            <span className="text-[11px] uppercase tracking-wider text-[#8C2D19] font-semibold">
              Required
            </span>
          )}
        </label>
      )}

      <div className="rounded-xl border border-slate-300 bg-white focus-within:border-[#8C2D19] transition-colors">
        <div className="flex items-center gap-1 px-3 py-2.5">
          {/* hour */}
          <input
            id={id}
            inputMode="numeric"
            aria-label="Hour"
            value={hh !== '' ? hh : displayHour}
            onChange={(e) => onH(e.target.value)}
            placeholder="HH"
            className={`${field} w-9`}
          />
          <span className="text-slate-300 select-none">:</span>
          <input
            inputMode="numeric"
            aria-label="Minute"
            value={mm}
            onChange={(e) => onM(e.target.value)}
            placeholder="MM"
            className={`${field} w-9`}
          />
          <span className="text-slate-300 select-none">:</span>
          <input
            inputMode="numeric"
            aria-label="Second"
            value={ss}
            onChange={(e) => onS(e.target.value)}
            placeholder="SS"
            className={`${field} w-9`}
          />

          {/* meridiem — only on the 12-hour face, and never pre-chosen */}
          {!use24 && (
            <div className="ml-2 inline-flex rounded-lg border border-slate-300 overflow-hidden">
              {(['AM', 'PM'] as const).map((m, i) => {
                const active = (i === 1) === pm;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMeridiem(i === 1)}
                    className={`px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                      active ? 'bg-[#8C2D19] text-white' : 'bg-white text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* 24 / 12 face */}
          <div className="ml-auto inline-flex rounded-lg border border-slate-300 overflow-hidden">
            {[true, false].map((is24) => (
              <button
                key={String(is24)}
                type="button"
                onClick={() => switchMode(is24)}
                className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
                  use24 === is24 ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:text-slate-800'
                }`}
              >
                {is24 ? '24h' : '12h'}
              </button>
            ))}
          </div>
        </div>

        {/* The resolved value, stated plainly — this is what the engine receives. */}
        <div className="px-3 pb-2 -mt-0.5">
          <span className="text-[11px] text-slate-400 font-mono">
            {value
              ? `${formatTime24(value.hour, value.minute, value.second)} (24-hour)` +
                (!use24 ? ` · ${formatTime12(value.hour, value.minute, value.second)}` : '')
              : placeholder}
          </span>
        </div>
      </div>
    </div>
  );
};
