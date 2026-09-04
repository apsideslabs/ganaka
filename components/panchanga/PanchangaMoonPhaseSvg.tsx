'use client';

/**
 * Gaṇaka — Classical Moon Phase Vector SVG Component
 * Generates mathematically accurate, crisp vector moon phases
 * based on Tithi (1-30) or exact Phase Angle (0-360°).
 */

import React from 'react';

interface PanchangaMoonPhaseSvgProps {
  tithiNumber?: number; // 1 to 30 (1-15: Shukla, 16-30: Krishna)
  illuminationFraction?: number; // 0.0 to 1.0
  phaseAngleDeg?: number; // 0 to 360 deg
  size?: number;
  className?: string;
  showPercent?: boolean;
}

export function PanchangaMoonPhaseSvg({
  tithiNumber,
  illuminationFraction,
  phaseAngleDeg,
  size = 28,
  className = '',
  showPercent = false,
}: PanchangaMoonPhaseSvgProps) {
  // Determine illumination fraction (0 to 1) and phase direction (waxing/shukla vs waning/krishna)
  let illumination = 0.5;
  let isShukla = true;

  if (illuminationFraction !== undefined) {
    illumination = Math.max(0, Math.min(1, illuminationFraction));
    if (phaseAngleDeg !== undefined) {
      // 0 to 180 is Waxing (Shukla), 180 to 360 is Waning (Krishna)
      const normAngle = ((phaseAngleDeg % 360) + 360) % 360;
      isShukla = normAngle <= 180;
    } else if (tithiNumber !== undefined) {
      isShukla = tithiNumber <= 15;
    }
  } else if (tithiNumber !== undefined) {
    isShukla = tithiNumber <= 15;
    if (tithiNumber <= 15) {
      illumination = tithiNumber / 15;
    } else {
      illumination = (30 - tithiNumber) / 15;
    }
  } else if (phaseAngleDeg !== undefined) {
    const normAngle = ((phaseAngleDeg % 360) + 360) % 360;
    isShukla = normAngle <= 180;
    illumination = (1 - Math.cos((normAngle * Math.PI) / 180)) / 2;
  }

  const isPurnima = illumination >= 0.97 || tithiNumber === 15;
  const isAmavasya = illumination <= 0.03 || tithiNumber === 30;
  const percent = Math.round(illumination * 100);

  const gradId = tithiNumber ?? Math.round(illumination * 100);
  const radius = 12;
  const center = 14;

  // Render SVG with exact mathematical crescent/gibbous arc
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        className="shrink-0 drop-shadow-2xs"
        aria-label={`Moon Phase: ${percent}% illuminated (${isShukla ? 'Śukla' : 'Kṛṣṇa'})`}
      >
        <defs>
          <radialGradient id={`moon-glow-${gradId}`} cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="60%" stopColor="#F5E6BE" />
            <stop offset="100%" stopColor="#E2C98A" />
          </radialGradient>
          <radialGradient id={`dark-disc-${gradId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A2723" />
            <stop offset="85%" stopColor="#1C1A17" />
            <stop offset="100%" stopColor="#121110" />
          </radialGradient>
        </defs>

        {/* Outer subtle halo ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 1}
          fill="none"
          stroke={isPurnima ? '#D97706' : isAmavasya ? '#5C5850' : '#DCD5C6'}
          strokeWidth="0.75"
          opacity={0.8}
        />

        {/* Base dark lunar disc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={`url(#dark-disc-${gradId})`}
        />

        {/* Illuminated portion */}
        {isPurnima ? (
          // Full Moon — Radiant Golden Disc
          <g>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={`url(#moon-glow-${gradId})`}
            />
            {/* Subtle maria crater textures */}
            <circle cx="11" cy="11" r="2.2" fill="#D4B66B" opacity="0.35" />
            <circle cx="17" cy="16" r="3" fill="#D4B66B" opacity="0.3" />
            <circle cx="15" cy="10" r="1.8" fill="#D4B66B" opacity="0.25" />
            <circle cx="10" cy="17" r="1.5" fill="#D4B66B" opacity="0.35" />
          </g>
        ) : isAmavasya ? (
          // New Moon — Pure Dark Disc with fine golden rim
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="#171614"
            stroke="#8B2F0B"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
        ) : (
          // Partial Phase (Waxing / Waning)
          <g>
            {/* Draw phase using SVG path with bezier curves */}
            {isShukla ? (
              // Waxing (Illuminated on Right)
              <path
                d={
                  illumination < 0.5
                    ? // Crescent: Right semi-circle minus inner curve
                      `M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} A ${(1 - 2 * illumination) * radius} ${radius} 0 0 1 ${center} ${center - radius} Z`
                    : // Gibbous: Right semi-circle plus left inner curve
                      `M ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center + radius} A ${(2 * illumination - 1) * radius} ${radius} 0 0 0 ${center} ${center - radius} Z`
                }
                fill={`url(#moon-glow-${gradId})`}
              />
            ) : (
              // Waning (Illuminated on Left)
              <path
                d={
                  illumination < 0.5
                    ? // Crescent: Left semi-circle minus inner curve
                      `M ${center} ${center - radius} A ${radius} ${radius} 0 0 0 ${center} ${center + radius} A ${(1 - 2 * illumination) * radius} ${radius} 0 0 0 ${center} ${center - radius} Z`
                    : // Gibbous: Left semi-circle plus right inner curve
                      `M ${center} ${center - radius} A ${radius} ${radius} 0 0 0 ${center} ${center + radius} A ${(2 * illumination - 1) * radius} ${radius} 0 0 1 ${center} ${center - radius} Z`
                }
                fill={`url(#moon-glow-${gradId})`}
              />
            )}
          </g>
        )}
      </svg>

      {showPercent && (
        <span className="text-[10px] font-mono text-[#5C5850]">
          {percent}%
        </span>
      )}
    </div>
  );
}
