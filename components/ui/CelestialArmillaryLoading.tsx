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
 * CelestialArmillaryLoading
 * Compact, high-precision astronomical armillary dial & sidereal planetary mechanism.
 * Tailored specifically to classical astronomical instrument design (Khagola / Gola Yantra):
 * - Refined compact footprint (160px - 180px) replacing bulky canvases
 * - Thin, delicate brass/slate instrument hairlines (0.5px - 0.75px)
 * - Classical 27 Nakṣatra azimuth ticks & 12 cardinal Rāśi coordinate marks
 * - Micro planetary spheres with subtle astronomical colors (no neon or AI-slop glows)
 * - Subtle, high-legibility typographic hierarchy with astronomical status indicators
 */
export function CelestialArmillaryLoading({
  fullScreen = false,
  isOverlay = false,
  title,
  subtitle,
  className = '',
  size = 'md',
}: CelestialArmillaryLoadingProps) {
  // Dimensions calibrated to be compact, elegant, and non-intrusive
  const dimensionClass =
    size === 'sm'
      ? 'w-24 h-24'
      : size === 'lg'
      ? 'w-36 h-36'
      : 'w-28 h-28 sm:w-32 sm:h-32';

  const content = (
    <div className="flex flex-col items-center justify-center p-3 text-center select-none">
      {/* Precision Astrolabe / Armillary Instrument Stage */}
      <div className={`relative ${dimensionClass} flex items-center justify-center`}>
        {/* Outer Graduated Astrolabe Ring (27 Nakṣatras & 12 Rāśis) */}
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-0 w-full h-full animate-[spin_160s_linear_infinite] text-stone-400/40 pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Calibration Ring */}
          <circle cx="120" cy="120" r="115" stroke="currentColor" strokeWidth="0.6" />
          <circle
            cx="120"
            cy="120"
            r="110"
            stroke="currentColor"
            strokeWidth="0.4"
            strokeDasharray="1.5 2.5"
            opacity="0.65"
          />
          <circle cx="120" cy="120" r="88" stroke="currentColor" strokeWidth="0.35" opacity="0.3" />

          {/* 12 Cardinal & Kendra Rāśi Division Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const isKendra = deg % 90 === 0;
            return (
              <line
                key={`cad-deg-${deg}`}
                x1="120"
                y1="5"
                x2="120"
                y2={isKendra ? '15' : '11'}
                stroke={isKendra ? '#8C2D19' : 'currentColor'}
                strokeWidth={isKendra ? '1' : '0.5'}
                strokeOpacity={isKendra ? '0.9' : '0.5'}
                transform={`rotate(${deg} 120 120)`}
              />
            );
          })}

          {/* 27 Nakṣatra Division Ticks (13°20') */}
          {Array.from({ length: 27 }).map((_, i) => (
            <line
              key={`cad-nak-${i}`}
              x1="120"
              y1="9"
              x2="120"
              y2="13"
              stroke="currentColor"
              strokeWidth="0.4"
              opacity="0.4"
              transform={`rotate(${(i * 360) / 27} 120 120)`}
            />
          ))}
        </svg>

        {/* Ecliptic Oblique Axis Ring (Tilted at 23.44° angle) */}
        <svg
          viewBox="0 0 240 240"
          className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] animate-[spin_100s_linear_infinite_reverse] pointer-events-none opacity-30 text-[#8C2D19]"
          fill="none"
        >
          <ellipse
            cx="120"
            cy="120"
            rx="96"
            ry="38"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            transform="rotate(-23.44 120 120)"
          />
        </svg>

        {/* Compact Prograde Concentric Planetary Orbits */}

        {/* Orbit 5: Saturn (Śanaiścara) with rings - r = 78px, 26s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[156px] h-[156px] rounded-full border border-stone-300/40 relative animate-[spin_26s_linear_infinite]">
            <div
              className="absolute -top-[3.5px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-300 border border-stone-400 flex items-center justify-center"
              title="Śani (Saturn)"
            >
              <div className="absolute -inset-[2px] rounded-full border border-amber-700/50 rotate-45 scale-y-[0.3]" />
            </div>
          </div>
        </div>

        {/* Orbit 4: Jupiter (Guru) - r = 62px, 17s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[124px] h-[124px] rounded-full border border-stone-300/40 relative animate-[spin_17s_linear_infinite]">
            <div
              className="absolute -top-[3.5px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-600/90 border border-amber-300"
              title="Guru (Jupiter)"
            />
          </div>
        </div>

        {/* Orbit 3: Mars (Maṅgala) - r = 48px, 11s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[96px] h-[96px] rounded-full border border-stone-300/45 relative animate-[spin_11s_linear_infinite]">
            <div
              className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#8C2D19] border border-amber-200"
              title="Maṅgala (Mars)"
            />
          </div>
        </div>

        {/* Orbit 2: Earth & Moon (Bhūmi & Candra) - r = 35px, 7s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[70px] h-[70px] rounded-full border border-stone-300/50 relative animate-[spin_7s_linear_infinite]">
            <div
              className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-stone-600 border border-stone-300 flex items-center justify-center"
              title="Pṛthvī (Earth)"
            >
              <div className="absolute -inset-[3px] rounded-full animate-[spin_1.5s_linear_infinite]">
                <div className="w-[3px] h-[3px] rounded-full bg-stone-200 absolute -top-[1px] left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Orbit 1: Mercury & Venus (Inner Sidereal Grahas) - r = 22px, 3.2s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[44px] h-[44px] rounded-full border border-stone-300/55 relative animate-[spin_3.2s_linear_infinite]">
            <div
              className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-400 border border-stone-500"
              title="Budha / Śukra"
            />
          </div>
        </div>

        {/* Subtle Central Surya (Classical Refined Solar Core) */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#8C2D19] border border-amber-300/70 flex items-center justify-center shadow-xs">
            <div className="w-1 h-1 rounded-full bg-amber-100" />
          </div>
        </div>
      </div>

      {/* Professional Classical Instrumentation Caption */}
      {(title || subtitle) && (
        <div className="mt-2.5 space-y-0.5">
          {title && (
            <p className="font-serif text-xs font-semibold text-stone-800 tracking-tight">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="font-mono text-[10px] text-stone-500 tracking-normal flex items-center justify-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-[#8C2D19]/70 animate-pulse" />
              <span>{subtitle}</span>
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
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FAF9F6]/92 backdrop-blur-xs animate-in fade-in duration-150 ${className}`}
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

  return (
    <div className={`w-full py-6 flex items-center justify-center ${className}`}>
      {content}
    </div>
  );
}
