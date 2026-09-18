'use client';

import React from 'react';

/**
 * GeometricSolarSystemBackground
 * Deeply crafted sidereal armillary & celestial mechanics background.
 * Features subtle parchment warm radial gradients, golden-ratio coordinate meridians,
 * 27 Nakṣatra azimuth hash tracks, and mathematical ecliptic projections.
 */
export function GeometricSolarSystemBackground() {
  return (
    <div
      id="astronomical-coordinate-bg"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Warm Ambient Vignette & Depth Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(184,134,11,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(140,45,25,0.03),transparent_50%)]" />

      {/* Armillary Mathematical Coordinate Projections */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <svg
          viewBox="0 0 1200 1200"
          className="w-[700px] h-[700px] sm:w-[950px] sm:h-[950px] md:w-[1200px] md:h-[1200px] shrink-0 text-[#171614] stroke-current animate-celestial-drift"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Prime Calibration Circle */}
          <circle cx="600" cy="600" r="560" strokeWidth="0.75" opacity="0.4" />
          <circle cx="600" cy="600" r="550" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
          <circle cx="600" cy="600" r="480" strokeWidth="0.6" opacity="0.35" />
          <circle cx="600" cy="600" r="400" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
          <circle cx="600" cy="600" r="300" strokeWidth="0.6" opacity="0.25" />
          <circle cx="600" cy="600" r="180" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.2" />
          <circle cx="600" cy="600" r="80" strokeWidth="0.6" opacity="0.3" />

          {/* Meridian and Equator Crosshairs */}
          <g strokeWidth="0.6" strokeDasharray="3 3" opacity="0.45">
            <line x1="600" y1="30" x2="600" y2="1170" />
            <line x1="30" y1="600" x2="1170" y2="600" />
            <line x1="200" y1="200" x2="1000" y2="1000" strokeDasharray="2 6" opacity="0.25" />
            <line x1="200" y1="1000" x2="1000" y2="200" strokeDasharray="2 6" opacity="0.25" />
          </g>

          {/* 27 Nakṣatra Division Rays (13°20' increments = 27 divisions) */}
          <g opacity="0.35" strokeWidth="0.5">
            {Array.from({ length: 27 }).map((_, i) => {
              const deg = (i * 360) / 27;
              return (
                <line
                  key={`nak-${i}`}
                  x1="600"
                  y1="50"
                  x2="600"
                  y2="64"
                  transform={`rotate(${deg} 600 600)`}
                  stroke="#8B2F0B"
                  strokeWidth={i % 3 === 0 ? '1' : '0.6'}
                />
              );
            })}
          </g>

          {/* 12 Rāśi 30° Coordinate Rays & Graduation Marks */}
          <g opacity="0.5" strokeWidth="0.75">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={`rasi-${deg}`}
                x1="600"
                y1="40"
                x2="600"
                y2="72"
                transform={`rotate(${deg} 600 600)`}
                stroke="#171614"
              />
            ))}
          </g>

          {/* Ecliptic Obliquity Axis (23.44° angle projection) */}
          <g transform="rotate(-23.44 600 600)" opacity="0.4">
            <line x1="60" y1="600" x2="1140" y2="600" strokeWidth="0.8" strokeDasharray="6 4" stroke="#8B2F0B" />
            <ellipse cx="600" cy="600" rx="550" ry="220" strokeWidth="0.8" />
            <ellipse cx="600" cy="600" rx="460" ry="175" strokeWidth="0.5" strokeDasharray="3 3" />
          </g>

          {/* Celestial Center Point */}
          <circle cx="600" cy="600" r="3.5" fill="#8B2F0B" opacity="0.7" />
          <circle cx="600" cy="600" r="10" strokeWidth="0.75" stroke="#8B2F0B" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
