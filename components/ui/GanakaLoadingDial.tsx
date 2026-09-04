'use client';

/**
 * Gaṇaka — Astronomical Engine Vector SVG Loading Dial & Fallback
 * Provides a clean, elegant, vector-rendered animated astronomical dial
 * for Suspense boundaries, page loading, and ephemeris calculation states.
 */

import React from 'react';

interface GanakaLoadingDialProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
}

export function GanakaLoadingDial({
  title = 'Gaṇaka Calculation Engine',
  subtitle = 'Evaluating Sidereal Ephemeris & Planetary Harmonics...',
  fullScreen = false,
  className = '',
}: GanakaLoadingDialProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-5 max-w-md mx-auto">
      {/* Precision Vector SVG Astronomical Dial */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        {/* Outer Rotating Ring: 12 Zodiac Rāśi Divisions */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] text-[#8B2F0B]"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#DCD5C6"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + 40 * Math.cos(angle);
            const y1 = 50 + 40 * Math.sin(angle);
            const x2 = 50 + 47 * Math.cos(angle);
            const y2 = 50 + 47 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 3 === 0 ? '#8B2F0B' : '#847E72'}
                strokeWidth={i % 3 === 0 ? '2' : '1'}
              />
            );
          })}
        </svg>

        {/* Middle Counter-Rotating Ring: 27 Nakṣatra Radians */}
        <svg
          className="absolute inset-2 w-20 h-20 sm:w-24 sm:h-24 animate-[spin_10s_linear_infinite_reverse] text-[#8B2F0B]"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#ECE7DC"
            strokeWidth="2"
          />
          {Array.from({ length: 27 }).map((_, i) => {
            const angle = (i * (360 / 27) * Math.PI) / 180;
            const x1 = 50 + 33 * Math.cos(angle);
            const y1 = 50 + 33 * Math.sin(angle);
            const x2 = 50 + 39 * Math.cos(angle);
            const y2 = 50 + 39 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#8B2F0B"
                strokeWidth="1"
                opacity={0.65}
              />
            );
          })}
        </svg>

        {/* Inner Pulsing Solar Core */}
        <div className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FAF7F0] border border-[#8B2F0B] flex items-center justify-center shadow-xs">
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B2F0B] animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="12" cy="12" r="4" fill="#FBF0D9" stroke="#8B2F0B" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-1.5">
        <h3 className="font-serif font-bold text-base sm:text-lg text-[#171614] tracking-tight">
          {title}
        </h3>
        <p className="text-xs font-mono text-[#8B2F0B]">
          {subtitle}
        </p>
      </div>

      {/* Subtle pulsing indicator line */}
      <div className="w-32 h-1 bg-[#ECE7DC] rounded-full overflow-hidden border border-[#DCD5C6]">
        <div className="h-full bg-[#8B2F0B] w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-[70vh] w-full flex items-center justify-center ${className}`}>
        {content}
      </div>
    );
  }

  return <div className={`w-full py-16 flex items-center justify-center ${className}`}>{content}</div>;
}
