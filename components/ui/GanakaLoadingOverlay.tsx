'use client';

/**
 * Gaṇaka — Astronomical Engine Loading & Transition Overlay
 * Provides immediate, elegant visual feedback with animated vector SVG dials
 * during ephemeris calculation and workspace transitions.
 */

import React, { useEffect, useState } from 'react';

interface GanakaLoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
}

const COMPUTATION_PHASES = [
  'Initializing VSOP87 Analytical Ephemeris...',
  'Evaluating Planetary Geocentric Longitudes (Sphuṭas)...',
  'Aligning Sidereal Ayanāṃśa & Oblique Ascendant (Lagna)...',
  'Constructing Ṣoḍaśavarga Harmonics & Bhāva Madhyas...',
  'Computing 4-Tier Viṃśottarī Daśā & Śaḍbala Matrices...',
  'Opening Gaṇaka Workstation...',
];

export function GanakaLoadingOverlay({
  isOpen,
  title = 'Gaṇaka Astronomical Engine',
  subtitle,
  onComplete,
}: GanakaLoadingOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) return;

    // Step through phases quickly and smoothly
    const interval = setInterval(() => {
      setPhaseIndex((prev) => {
        const next = prev + 1;
        if (next < COMPUTATION_PHASES.length) {
          setProgress(Math.round(((next + 1) / COMPUTATION_PHASES.length) * 100));
          return next;
        }
        setProgress(100);
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 50);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calculating Ephemeris"
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#171614]/80 backdrop-blur-xs transition-opacity duration-150"
    >
      <div className="w-full max-w-md mx-4 p-7 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Animated Astronomical Dial (SVG) */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Outer Rotating Ring: 12 Zodiac Marks */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite] text-[#8B2F0B]"
            viewBox="0 0 100 100"
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
            {/* 12 Cardinal Rays / Ticks */}
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

          {/* Middle Counter-Rotating Ring: 27 Nakshatra Radians */}
          <svg
            className="absolute inset-2 w-24 h-24 animate-[spin_3s_linear_infinite_reverse] text-[#8B2F0B]"
            viewBox="0 0 100 100"
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
              const x1 = 50 + 34 * Math.cos(angle);
              const y1 = 50 + 34 * Math.sin(angle);
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
                  opacity={0.7}
                />
              );
            })}
          </svg>

          {/* Center Glowing Sun-Moon Axis with Pulse */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#8B2F0B] flex items-center justify-center shadow-xs">
            <svg
              className="w-7 h-7 text-[#8B2F0B] animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              {/* Classical Sun Icon with Radiating Lotus Rays */}
              <circle cx="12" cy="12" r="4" fill="#FBF0D9" stroke="#8B2F0B" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
        </div>

        {/* Text & Steps */}
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-lg text-[#171614] tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-mono text-[#8B2F0B] min-h-[20px] transition-all duration-150">
            {subtitle || COMPUTATION_PHASES[phaseIndex]}
          </p>
        </div>

        {/* Progress Track */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-1.5 bg-[#ECE7DC] rounded-full overflow-hidden border border-[#DCD5C6]">
            <div
              className="h-full bg-[#8B2F0B] transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#5C5850]">
            <span>VSOP87 • Sidereal Drik</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
