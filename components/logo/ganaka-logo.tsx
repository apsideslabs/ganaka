'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  isLink?: boolean;
  variant?: 'seal' | 'monochrome';
}

export function GanakaSymbol({
  size = 32,
  className = '',
  variant = 'seal',
  animate = false,
}: {
  size?: number;
  className?: string;
  variant?: 'seal' | 'monochrome';
  animate?: boolean;
}) {
  const animClass = animate ? 'animate-logo-spin' : '';

  if (variant === 'monochrome') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Gaṇaka celestial emblem"
        className={`inline-block shrink-0 ${animClass} ${className}`}
      >
        {/* Outer Celestial Reference Ring */}
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2 2.5"
          strokeOpacity="0.4"
        />

        {/* Primary Ecliptic Orbit */}
        <ellipse
          cx="22"
          cy="22"
          rx="15"
          ry="7.5"
          transform="rotate(-30 22 22)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Secondary Horizon Orbit */}
        <ellipse
          cx="22"
          cy="22"
          rx="15"
          ry="7.5"
          transform="rotate(30 22 22)"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />

        {/* Central Kundali Kendra Diamond */}
        <polygon
          points="22,10 34,22 22,34 10,22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Cardinal Points */}
        <polygon points="22,6 24,10 22,12 20,10" fill="currentColor" />
        <polygon points="22,38 24,34 22,32 20,34" fill="currentColor" />
        <polygon points="6,22 10,24 12,22 10,20" fill="currentColor" />
        <polygon points="38,22 34,24 32,22 34,20" fill="currentColor" />

        {/* Central Bindu Core */}
        <circle cx="22" cy="22" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="22" cy="22" r="1.8" fill="currentColor" />
      </svg>
    );
  }

  // Full-color 'seal' vector logo
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Gaṇaka celestial emblem"
      className={`inline-block shrink-0 transition-transform duration-200 group-hover:scale-105 ${animClass} ${className}`}
    >
      <defs>
        <linearGradient id="ganakaSealGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9E341E" />
          <stop offset="50%" stopColor="#872915" />
          <stop offset="100%" stopColor="#63190B" />
        </linearGradient>

        <linearGradient id="ganakaGoldRing" x1="12" y1="12" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE6B8" />
          <stop offset="100%" stopColor="#D4A152" />
        </linearGradient>

        <filter id="ganakaGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#471106" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Base Squircle Container */}
      <rect
        x="1.5"
        y="1.5"
        width="41"
        height="41"
        rx="11"
        fill="url(#ganakaSealGrad)"
        stroke="#521407"
        strokeWidth="1"
        filter="url(#ganakaGlow)"
      />

      {/* Inner Subtle Hairline Highlight */}
      <rect
        x="3"
        y="3"
        width="38"
        height="38"
        rx="9.5"
        fill="none"
        stroke="#FFF8F0"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Celestial Coordinate Perimeter Ring */}
      <circle
        cx="22"
        cy="22"
        r="15"
        stroke="#FFF8F0"
        strokeOpacity="0.2"
        strokeWidth="0.8"
        strokeDasharray="1.5 2.5"
      />

      {/* Planetary Orbit 1: Solar Ecliptic (Golden) */}
      <ellipse
        cx="22"
        cy="22"
        rx="14"
        ry="6.8"
        transform="rotate(-30 22 22)"
        stroke="url(#ganakaGoldRing)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Planetary Orbit 2: Horizon / Equator */}
      <ellipse
        cx="22"
        cy="22"
        rx="14"
        ry="6.8"
        transform="rotate(30 22 22)"
        stroke="#FFF8F0"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Classical Kundali Ascendant Diamond (Lagna Bhāva) */}
      <polygon
        points="22,9.5 34.5,22 22,34.5 9.5,22"
        fill="#772312"
        fillOpacity="0.55"
        stroke="#FFF8F0"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Cardinal Kendra Markers (Dikpalas) */}
      <polygon points="22,6.5 23.8,9.5 22,11.2 20.2,9.5" fill="url(#ganakaGoldRing)" />
      <polygon points="22,37.5 23.8,34.5 22,32.8 20.2,34.5" fill="url(#ganakaGoldRing)" />
      <polygon points="6.5,22 9.5,23.8 11.2,22 9.5,20.2" fill="url(#ganakaGoldRing)" />
      <polygon points="37.5,22 34.5,23.8 32.8,22 34.5,20.2" fill="url(#ganakaGoldRing)" />

      {/* Central Cosmic Observer (Bindu) */}
      <circle cx="22" cy="22" r="4.2" fill="#58160A" stroke="url(#ganakaGoldRing)" strokeWidth="1.1" />
      <circle cx="22" cy="22" r="1.9" fill="#FFFBF5" />
    </svg>
  );
}

export function GanakaLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
  isLink = true,
  variant = 'seal',
}: LogoProps) {
  const [isClicked, setIsClicked] = useState(false);
  const symbolSize = size === 'sm' ? 26 : size === 'lg' ? 42 : 34;

  const handleLogoClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 800);
  };

  const content = (
    <div className={`flex items-center gap-3 select-none btn-press-tactile ${className}`} onClick={handleLogoClick}>
      <div className="relative">
        <GanakaSymbol size={symbolSize} variant={variant} animate={isClicked} />
        {isClicked && (
          <span className="pointer-events-none absolute -inset-1 rounded-full animate-subtle-glow z-0" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-serif font-bold tracking-tight text-stone-900 group-hover:text-[#8C2D19] transition-colors leading-none ${
              size === 'sm'
                ? 'text-base'
                : size === 'lg'
                ? 'text-2xl'
                : 'text-lg'
            }`}
          >
            Gaṇaka
          </span>
          <span className="text-[10px] font-serif font-semibold text-[#8C2D19] bg-[#8C2D19]/8 border border-[#8C2D19]/15 px-1.5 py-0.5 rounded leading-none hidden sm:inline-block">
            गणक
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-stone-500 font-sans tracking-tight leading-tight mt-0.5 ${
              size === 'sm'
                ? 'text-[10px]'
                : size === 'lg'
                ? 'text-xs'
                : 'text-[11px]'
            }`}
          >
            Classical Jyotiṣa &amp; Ephemeris
          </span>
        )}
      </div>
    </div>
  );

  if (!isLink) {
    return content;
  }

  return (
    <Link
      href="/"
      prefetch={false}
      id="ganaka-brand-header-link"
      className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C2D19] focus-visible:ring-offset-2 rounded-lg"
      aria-label="Gaṇaka — Classical Jyotiṣa & Ephemeris Homepage"
    >
      {content}
    </Link>
  );
}

