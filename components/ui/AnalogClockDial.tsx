'use client';

/**
 * Gaṇaka — the analogue clock dial.
 *
 * Replaces the orbital "solar system" loader. Two jobs:
 *
 *   LIVE      the hands follow the real clock. This is the default, and it is
 *             what a gochara or transit view wants: the dial shows now.
 *
 *   TRANSITION  given a target instant, the hands start at the current time and
 *             wind to it one at a time — hour, then minute, then second — and
 *             stop dead on the moment asked for. That is what a birth chart
 *             needs: the dial settles on the birth time rather than spinning
 *             forever.
 *
 * The movement is a single requestAnimationFrame loop over three eased phases,
 * so the hands stop exactly together with the target and no timers are left
 * running. Everything is one SVG — no blur, no filters, no stacked layers.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface AnalogClockDialProps {
  /** Animate from the current time to this instant, then hold. */
  targetTime?: Date | null;
  /** Follow the real clock. Ignored when `targetTime` is set. */
  live?: boolean;
  fullScreen?: boolean;
  isOverlay?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Duration of each hand's sweep in ms. Three hands, so the total is 3×. */
  handDuration?: number;
  onComplete?: () => void;
}

const INK = '#2A241A';
const MUTED = '#8A8279';
const ACCENT = '#8C2D19';
const PAPER = '#FCFAF6';
const BRASS = '#B08D5F';

const C = 120;          // centre of the 240 viewBox
const R_OUTER = 116;    // bezel
const R_FACE = 106;     // dial edge
const R_TICK_OUT = 104;
const R_MINOR_IN = 99;
const R_MAJOR_IN = 94;
const R_NUMERAL = 82;

interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

/** Clock angles in degrees, 0 = 12 o'clock, clockwise. */
function anglesFor(d: Date): HandAngles {
  const ms = d.getMilliseconds();
  const s = d.getSeconds() + ms / 1000;
  const m = d.getMinutes() + s / 60;
  const h = (d.getHours() % 12) + m / 60;
  return {
    hour: h * 30,
    minute: m * 6,
    second: s * 6,
  };
}

/** Signed shortest arc from `a` to `b`, in degrees. */
function shortestArc(a: number, b: number): number {
  let delta = ((b - a) % 360 + 540) % 360 - 180;
  if (Object.is(delta, -180)) delta = 180;
  return delta;
}

/** Smooth in-and-out, so each hand settles rather than snapping. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

const SIZE_MAP = { sm: 150, md: 210, lg: 280 } as const;

/** Roman numerals at the quarters, the way a dial is usually marked. */
const QUARTERS: Array<[number, string]> = [
  [0, 'XII'],
  [90, 'III'],
  [180, 'VI'],
  [270, 'IX'],
];

function Ticks() {
  const marks: React.ReactElement[] = [];
  for (let deg = 0; deg < 360; deg += 6) {
    const major = deg % 30 === 0;
    const [x1, y1] = polar(major ? R_MAJOR_IN : R_MINOR_IN, deg);
    const [x2, y2] = polar(R_TICK_OUT, deg);
    marks.push(
      <line
        key={deg}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={major ? INK : MUTED}
        strokeWidth={major ? 2.4 : 0.9}
        opacity={major ? 0.9 : 0.5}
        strokeLinecap="round"
      />
    );
  }
  return <g>{marks}</g>;
}

export function AnalogClockDial({
  targetTime = null,
  live = false,
  fullScreen = false,
  isOverlay = false,
  title,
  subtitle,
  className = '',
  size = 'md',
  handDuration = 820,
  onComplete,
}: AnalogClockDialProps) {
  const [angles, setAngles] = useState<HandAngles>(() => anglesFor(targetTime ?? new Date()));
  const [settled, setSettled] = useState(false);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ---- transition: wind each hand in turn, then hold ----------------------
  useEffect(() => {
    if (!targetTime) return;
    stop();
    setSettled(false);

    const from = anglesFor(new Date());
    const to = anglesFor(targetTime);
    const span = Math.max(120, handDuration);
    const total = span * 3;
    const startedAt = performance.now();

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const phase = (i: number) =>
        easeInOut(Math.min(1, Math.max(0, (elapsed - i * span) / span)));

      if (elapsed >= total) {
        setAngles(to);
        setSettled(true);
        rafRef.current = null;
        onComplete?.();
        return;
      }

      setAngles({
        hour: from.hour + shortestArc(from.hour, to.hour) * phase(0),
        minute: from.minute + shortestArc(from.minute, to.minute) * phase(1),
        second: from.second + shortestArc(from.second, to.second) * phase(2),
      });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return stop;
  }, [targetTime, handDuration, onComplete, stop]);

  // ---- live: follow the real clock ---------------------------------------
  useEffect(() => {
    if (targetTime || !live) return;
    stop();
    const tick = () => {
      setAngles(anglesFor(new Date()));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return stop;
  }, [live, targetTime, stop]);

  // A static dial when neither mode is asked for.
  useEffect(() => {
    if (targetTime || live) return;
    setAngles(anglesFor(new Date()));
  }, [targetTime, live]);

  const px = SIZE_MAP[size];

  const hands = useMemo(() => {
    const [hx, hy] = polar(58, angles.hour);
    const [mx, my] = polar(84, angles.minute);
    const [sx, sy] = polar(90, angles.second);
    const [sbx, sby] = polar(-16, angles.second); // counterweight
    return { hx, hy, mx, my, sx, sy, sbx, sby };
  }, [angles]);

  const dial = (
    <svg
      viewBox="0 0 240 240"
      width={px}
      height={px}
      className="shrink-0"
      role="img"
      aria-label="Analogue clock dial"
    >
      <defs>
        <radialGradient id="gkd-face" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="62%" stopColor={PAPER} />
          <stop offset="100%" stopColor="#F1EADC" />
        </radialGradient>
        <linearGradient id="gkd-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9C9A6" />
          <stop offset="45%" stopColor={BRASS} />
          <stop offset="100%" stopColor="#8E7043" />
        </linearGradient>
      </defs>

      {/* bezel */}
      <circle cx={C} cy={C} r={R_OUTER} fill="url(#gkd-bezel)" />
      <circle cx={C} cy={C} r={R_OUTER - 3} fill="none" stroke="#6F5730" strokeWidth="0.6" opacity="0.5" />
      {/* dial face */}
      <circle cx={C} cy={C} r={R_FACE} fill="url(#gkd-face)" stroke="#E4DAC7" strokeWidth="0.8" />

      <Ticks />

      {QUARTERS.map(([deg, label]) => {
        const [x, y] = polar(R_NUMERAL, deg);
        return (
          <text
            key={deg}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            letterSpacing="0.4"
            fill={INK}
            fontFamily="Georgia, 'Times New Roman', serif"
            opacity="0.88"
          >
            {label}
          </text>
        );
      })}

      {/* hour hand */}
      <line
        x1={C} y1={C} x2={hands.hx} y2={hands.hy}
        stroke={INK} strokeWidth="5.4" strokeLinecap="round"
      />
      {/* minute hand */}
      <line
        x1={C} y1={C} x2={hands.mx} y2={hands.my}
        stroke={INK} strokeWidth="3.4" strokeLinecap="round"
      />
      {/* second hand, with its counterweight */}
      <line
        x1={hands.sbx} y1={hands.sby} x2={hands.sx} y2={hands.sy}
        stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round"
      />
      {/* centre pin */}
      <circle cx={C} cy={C} r="5.2" fill={BRASS} stroke="#6F5730" strokeWidth="0.7" />
      <circle cx={C} cy={C} r="1.8" fill={ACCENT} />
    </svg>
  );

  const body = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {dial}
      {(title || subtitle) && (
        <div className="text-center px-4">
          {title && (
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8C2D19] font-bold">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-[11px] text-stone-500 mt-1.5 max-w-xs leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {/* a quiet pulse so it reads as working, not frozen */}
      {targetTime && !settled && (
        <div className="h-0.5 w-16 rounded-full bg-[#8C2D19]/25 overflow-hidden">
          <div className="h-full w-1/2 bg-[#8C2D19] animate-[gkd-slide_1.2s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#FCFAF6]">
        {body}
      </div>
    );
  }

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/45 backdrop-blur-[2px]">
        <div className="bg-[#FCFAF6] rounded-2xl border border-[#E1D8C7] shadow-xl px-10 py-8">
          {body}
        </div>
      </div>
    );
  }

  return body;
}
