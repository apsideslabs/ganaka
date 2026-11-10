'use client';

import React from 'react';

interface CelestialArmillaryLoadingProps {
  fullScreen?: boolean;
  isOverlay?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Gaṇaka — loading instrument.
 *
 * A single SVG armillary dial rather than a stack of spinning divs: crisper at
 * any DPI, one compositing layer instead of six, and no blur or drop shadows on
 * the overlay (both of which cost more than everything else here combined).
 *
 * The orbits are drawn to scale and turn at rates that follow Kepler's third
 * law — period proportional to a^1.5 — so the inner planets genuinely outrun
 * the outer ones. The radii below are a compressed but monotonic scale of the
 * real semi-major axes (0.39, 0.72, 1.00, 1.52, 5.20, 9.54 AU).
 */

/** Orbit radius in viewBox units, and the period it implies. */
const ORBITS = [
  { id: 'mercury', r: 26, size: 2.6, ink: '#8C8273', dur: 4.0 },
  { id: 'venus', r: 38, size: 3.4, ink: '#C8B48B', dur: 7.1 },
  { id: 'earth', r: 52, size: 3.4, ink: '#6E8494', dur: 11.3 },
  { id: 'mars', r: 68, size: 3.0, ink: '#A9604A', dur: 16.9 },
  { id: 'jupiter', r: 86, size: 4.6, ink: '#B08D5F', dur: 24.1 },
  { id: 'saturn', r: 100, size: 4.0, ink: '#9C9182', dur: 30.2 },
];

const C = 120; // centre of the 240 viewBox
const R_RING = 112;
const R_INNER = 104;

/** Tick marks: a fine graduation every 5°, a heavier one every 30°. */
function ticks() {
  const out: React.ReactElement[] = [];
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const a = ((deg - 90) * Math.PI) / 180;
    const r1 = major ? R_INNER - 7 : R_INNER - 3;
    const r2 = R_INNER;
    out.push(
      <line
        key={deg}
        x1={C + r1 * Math.cos(a)}
        y1={C + r1 * Math.sin(a)}
        x2={C + r2 * Math.cos(a)}
        y2={C + r2 * Math.sin(a)}
        stroke="#8A8279"
        strokeWidth={major ? 1.1 : 0.6}
        opacity={major ? 0.75 : 0.45}
        strokeLinecap="round"
      />
    );
  }
  return out;
}

export function CelestialArmillaryLoading({
  fullScreen = false,
  isOverlay = false,
  title,
  subtitle,
  className = '',
  size = 'md',
}: CelestialArmillaryLoadingProps) {
  const dimensionClass =
    size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-40 h-40' : 'w-28 h-28 sm:w-32 sm:h-32';

  const content = (
    <div className="flex flex-col items-center justify-center p-3 text-center select-none">
      <div className={`relative ${dimensionClass}`}>
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* instrument frame */}
          <circle cx={C} cy={C} r={R_RING} stroke="#8A8279" strokeWidth="1" opacity="0.55" />
          <circle cx={C} cy={C} r={R_INNER} stroke="#8A8279" strokeWidth="0.5" opacity="0.4" />
          {ticks()}

          {/* orbits, faintest at the outside so the centre stays legible */}
          {ORBITS.map((o) => (
            <circle
              key={`o-${o.id}`}
              cx={C}
              cy={C}
              r={o.r}
              stroke="#8A8279"
              strokeWidth="0.45"
              opacity={0.18 + (1 - o.r / R_RING) * 0.18}
            />
          ))}

          {/* planets: one rotating group each, centre-anchored so no origin maths */}
          {ORBITS.map((o) => (
            <g key={`p-${o.id}`}>
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from={`0 ${C} ${C}`}
                to={`360 ${C} ${C}`}
                dur={`${o.dur}s`}
                repeatCount="indefinite"
              />
              {o.id === 'saturn' && (
                <ellipse
                  cx={C}
                  cy={C - o.r}
                  rx={o.size + 4.5}
                  ry={o.size * 0.4}
                  stroke={o.ink}
                  strokeWidth="0.9"
                  opacity="0.8"
                  transform={`rotate(-18 ${C} ${C - o.r})`}
                />
              )}
              <circle cx={C} cy={C - o.r} r={o.size} fill={o.ink} />
            </g>
          ))}

          {/* sun at the centre */}
          <circle cx={C} cy={C} r="6.5" fill="#8C2D19" opacity="0.9" />
          <circle cx={C} cy={C} r="6.5" stroke="#C8B48B" strokeWidth="0.8" opacity="0.8" />
        </svg>
      </div>

      {(title || subtitle) && (
        <div className="mt-3 space-y-1">
          {title && (
            <p className="font-serif text-xs font-semibold text-stone-800 tracking-tight">{title}</p>
          )}
          {subtitle && (
            <p className="font-mono text-[10px] text-stone-500 leading-relaxed max-w-[15rem] mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <div
        id="ganaka-celestial-overlay"
        role="status"
        aria-label={title || 'Calculating astronomical ephemeris'}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FAF9F6] ${className}`}
      >
        {content}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className={`min-h-[50vh] w-full flex items-center justify-center bg-[#FAF9F6] ${className}`}>
        {content}
      </div>
    );
  }

  return <div className={`w-full py-6 flex items-center justify-center ${className}`}>{content}</div>;
}
