'use client';

/**
 * Birth time — one field you type into.
 *
 * The previous control was three separate number boxes. They fought the typist:
 * a value echoed back from the parent reset the boxes mid-entry, each box was
 * nine characters wide, and the meridiem only appeared once a value already
 * existed — so you chose it after the fact, or not at all.
 *
 * This is a single field with a mask. You type digits and the colons appear:
 *
 *   2351      → 23:51
 *   235124    → 23:51:24
 *   11:51 pm  → 23:51
 *   1151p     → 23:51
 *
 * An hour of 1–12 with no meridiem is genuinely ambiguous, so it is NOT
 * guessed. The field says so and waits for AM or PM. That is the whole bug
 * this component exists to prevent: 23:51 filed as 11:51, a whole ascendant
 * wrong.
 *
 * What the engine receives is always 24-hour.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { to24Hour, formatTime24, formatTime12, parseTimeInput, type TimeValue } from '@/lib/jyotisha/time-format';

export type { TimeValue };

interface TimeFieldProps {
  id?: string;
  label?: string;
  value: TimeValue | null;
  onChange: (v: TimeValue) => void;
  required?: boolean;
  placeholder?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const TimeField: React.FC<TimeFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
  placeholder = 'e.g. 23:51:24  or  11:51 PM',
}) => {
  const [text, setText] = useState('');
  const [needsMeridiem, setNeedsMeridiem] = useState<{ hour12: number; minute: number; second: number } | null>(null);
  // Guards the sync effect so it never overwrites what is being typed.
  const typing = useRef(false);

  // Reflect an externally-set value (URL, localStorage, reset) — but only when
  // the field is not the thing that produced it.
  useEffect(() => {
    if (typing.current) return;
    if (!value) { setText(''); setNeedsMeridiem(null); return; }
    setText(formatTime24(value.hour, value.minute, value.second));
    setNeedsMeridiem(null);
  }, [value?.hour, value?.minute, value?.second]);

  const commit = useCallback((v: TimeValue) => {
    typing.current = true;
    onChange(v);
    // release after the parent has re-rendered with the echoed value
    requestAnimationFrame(() => { typing.current = false; });
  }, [onChange]);

  const handle = (raw: string) => {
    setText(raw);
    const parsed = parseTimeInput(raw);
    if (parsed.value) {
      setNeedsMeridiem(null);
      commit(parsed.value);
    } else if (parsed.ambiguous) {
      setNeedsMeridiem(parsed.ambiguous);
    } else {
      setNeedsMeridiem(null);
    }
  };

  const choose = (pm: boolean) => {
    if (!needsMeridiem) return;
    const { hour12, minute, second } = needsMeridiem;
    const v = { hour: to24Hour(hour12, pm, false), minute, second };
    setNeedsMeridiem(null);
    setText(formatTime24(v.hour, v.minute, v.second));
    commit(v);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="flex items-center justify-between text-[13px] font-medium text-slate-700">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
            {label}
          </span>
          {required && !value && (
            <span className="text-[11px] uppercase tracking-wider text-[#8C2D19] font-semibold">Required</span>
          )}
        </label>
      )}

      <div
        className={`rounded-xl border bg-white transition-colors ${
          needsMeridiem ? 'border-[#B45309]' : 'border-slate-300 focus-within:border-[#8C2D19]'
        }`}
      >
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <input
            id={id}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(e) => handle(e.target.value)}
            onBlur={() => {
              // Tidy what is in the box into a canonical form once focus leaves.
              const parsed = parseTimeInput(text);
              if (parsed.value) setText(formatTime24(parsed.value.hour, parsed.value.minute, parsed.value.second));
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-mono tabular-nums text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-[13px]"
          />

          {/* Only when the hour could mean either half of the day. */}
          {needsMeridiem && (
            <div className="inline-flex rounded-lg border border-[#B45309] overflow-hidden shrink-0">
              {(['AM', 'PM'] as const).map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => choose(i === 1)}
                  className="px-3 py-1.5 text-[12px] font-semibold bg-white text-[#B45309] hover:bg-[#B45309] hover:text-white transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-3.5 pb-2 -mt-0.5">
          {needsMeridiem ? (
            <span className="text-[11px] text-[#B45309]">
              {pad(needsMeridiem.hour12)}:{pad(needsMeridiem.minute)} could be morning or night — choose AM or PM.
            </span>
          ) : value ? (
            <span className="text-[11px] text-slate-400 font-mono">
              {formatTime24(value.hour, value.minute, value.second)} · {formatTime12(value.hour, value.minute, value.second)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Type digits — colons are added for you.</span>
          )}
        </div>
      </div>
    </div>
  );
};
