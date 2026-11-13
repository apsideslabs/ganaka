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
const R_OUTER = 117;    // bezel
const R_FACE = 108;     // dial edge
const R_TICK_OUT = 104;
const R_MINOR_IN = 100;
const R_MAJOR_IN = 96;
const R_NUMERAL = 84;
const R_INNER = 72;     // fine ring that separates the chapter from the centre
const LEN_HOUR = 54;
const LEN_MINUTE = 82;
const LEN_SECOND = 88;

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

/** Keep an angle in 0–360 so a hand that lands on the short arc still reports
 *  a canonical value (355.7°, not −4.3°). */
function wrap(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Cosine in-and-out.
 *
 * The cubic curve used before peaked at twice the average speed in the middle
 * of every sweep, so a 120° arc crossed in 1.4s read as a flick. The cosine
 * curve peaks at 1.57×, which is steady enough to follow while still easing
 * into the stop rather than hitting it.
 */
function easeInOut(t: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
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
        strokeWidth={major ? 2.2 : 0.8}
        opacity={major ? 0.92 : 0.42}
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
  handDuration = 1800,
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

    const to = anglesFor(targetTime);

    // Reduced motion: land on the target at once and report completion.
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) {
      setAngles(to);
      setSettled(true);
      onComplete?.();
      return;
    }

    const from = anglesFor(new Date());
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
        onComplete?.();

        // The dial has landed on the birth moment. It must not sit frozen while
        // the workspace loads — a stopped clock reads as broken. Carry the
        // second hand forward from the target so the instrument stays alive.
        const settledAt = performance.now();
        const tick = (t2: number) => {
          setAngles(anglesFor(new Date(targetTime.getTime() + (t2 - settledAt))));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setAngles({
        hour: wrap(from.hour + shortestArc(from.hour, to.hour) * phase(0)),
        minute: wrap(from.minute + shortestArc(from.minute, to.minute) * phase(1)),
        second: wrap(from.second + shortestArc(from.second, to.second) * phase(2)),
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
    const [hx, hy] = polar(LEN_HOUR, angles.hour);
    const [mx, my] = polar(LEN_MINUTE, angles.minute);
    const [sx, sy] = polar(LEN_SECOND, angles.second);
    const [sbx, sby] = polar(-15, angles.second); // counterweight
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
          <stop offset="62%" stopColor="#FDFBF6" />
          <stop offset="100%" stopColor="#F1EADC" />
        </radialGradient>
        <linearGradient id="gkd-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9C7A0" />
          <stop offset="45%" stopColor="#C0A173" />
          <stop offset="100%" stopColor="#96794B" />
        </linearGradient>
      </defs>

      {/* bezel */}
      <circle cx={C} cy={C} r={R_OUTER} fill="url(#gkd-bezel)" />
      <circle cx={C} cy={C} r={R_OUTER - 2.2} fill="none" stroke="#6F5730" strokeWidth="0.5" opacity="0.45" />
      {/* dial face */}
      <circle cx={C} cy={C} r={R_FACE} fill="url(#gkd-face)" stroke="#E8DFCC" strokeWidth="0.6" />
      <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="#D9CFBA" strokeWidth="0.5" opacity="0.8" />

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
            fontSize="10.5"
            letterSpacing="0.3"
            fill={INK}
            fontFamily="Georgia, 'Times New Roman', serif"
            opacity="0.88"
          >
            {label}
          </text>
        );
      })}

      <text
        x={C}
        y={C + 46}
        textAnchor="middle"
        fontSize="3.4"
        letterSpacing="1.5"
        fill={MUTED}
        fontFamily="Georgia, 'Times New Roman', serif"
        opacity="0.85"
      >
        GAṆAKA
      </text>

      {/* hour hand */}
      <line
        x1={C} y1={C} x2={hands.hx} y2={hands.hy}
        stroke={INK} strokeWidth="4.2" strokeLinecap="round"
      />
      {/* minute hand */}
      <line
        x1={C} y1={C} x2={hands.mx} y2={hands.my}
        stroke={INK} strokeWidth="2.6" strokeLinecap="round"
      />
      {/* second hand, with its counterweight */}
      <line
        x1={hands.sbx} y1={hands.sby} x2={hands.sx} y2={hands.sy}
        stroke={ACCENT} strokeWidth="1.05" strokeLinecap="round"
      />
      {/* centre pin */}
      <circle cx={C} cy={C} r="4.6" fill={BRASS} stroke="#6F5730" strokeWidth="0.6" />
      <circle cx={C} cy={C} r="1.5" fill={ACCENT} />
    </svg>
  );

  const body = (
    <div className={`flex flex-col items-center ${className}`}>
      {/* a soft lift so the dial sits on the paper rather than floating flat */}
      <div style={{ filter: 'drop-shadow(0 10px 24px rgba(43,36,26,0.14))' }}>
        {dial}
      </div>

      {(title || subtitle) && (
        <div className="text-center mt-6 px-6">
          {title && (
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#8C2D19]/85">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-[11px] text-stone-500 mt-2 max-w-xs leading-relaxed mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* A hairline that fills as the hands wind, so the wait is legible without
          turning the screen into a progress-bar dashboard. */}
      {targetTime && !settled && (
        <div className="mt-5 h-px w-24 bg-[#8C2D19]/15 overflow-hidden">
          <div className="h-full w-1/3 bg-[#8C2D19]/70 animate-[gkd-slide_1.4s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] grid place-items-center bg-[#FBF7EF]">
        {body}
      </div>
    );
  }

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-[200] grid place-items-center bg-[#FBF7EF]/94 backdrop-blur-[3px]">
        {body}
      </div>
    );
  }

  return body;
}
