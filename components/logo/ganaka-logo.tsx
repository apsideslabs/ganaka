import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  isLink?: boolean;
}

export function GanakaSymbol({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Gaṇaka celestial calculation emblem"
      className={`inline-block shrink-0 ${className}`}
    >
      {/* Outer calibration ring */}
      <circle
        cx="20"
        cy="20"
        r="17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="0.5 3.5"
        strokeLinecap="round"
        className="text-[#8B2F0B]"
      />
      {/* Primary boundary circle */}
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-[#171614]"
      />
      {/* Precision orthogonal axes */}
      <line
        x1="20"
        y1="3"
        x2="20"
        y2="37"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        className="text-[#A8A194]"
      />
      <line
        x1="3"
        y1="20"
        x2="37"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        className="text-[#A8A194]"
      />
      {/* Inclined orbital arc / celestial coordinate intersection */}
      <ellipse
        cx="20"
        cy="20"
        rx="13"
        ry="6.5"
        transform="rotate(-28 20 20)"
        stroke="currentColor"
        strokeWidth="1"
        className="text-[#5C5850]"
      />
      {/* Concentric inner calibration node */}
      <circle
        cx="20"
        cy="20"
        r="3"
        fill="#F4F0E7"
        stroke="currentColor"
        strokeWidth="1"
        className="text-[#171614]"
      />
      {/* Central focal node in accent copper */}
      <circle
        cx="20"
        cy="20"
        r="1.2"
        fill="#8B2F0B"
      />
      {/* Quadrant measurement ticks */}
      <line x1="20" y1="4" x2="20" y2="7" stroke="#8B2F0B" strokeWidth="1.2" />
      <line x1="36" y1="20" x2="33" y2="20" stroke="#8B2F0B" strokeWidth="1.2" />
      <line x1="20" y1="36" x2="20" y2="33" stroke="#8B2F0B" strokeWidth="1.2" />
      <line x1="4" y1="20" x2="7" y2="20" stroke="#8B2F0B" strokeWidth="1.2" />
    </svg>
  );
}

export function GanakaLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
  isLink = true,
}: LogoProps) {
  const symbolSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <GanakaSymbol size={symbolSize} />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-semibold tracking-tight text-[#171614] font-sans ${
              size === 'sm'
                ? 'text-base leading-tight'
                : size === 'lg'
                ? 'text-2xl leading-tight tracking-normal'
                : 'text-lg leading-tight'
            }`}
          >
            Gaṇaka
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8B2F0B] font-semibold hidden sm:inline-block">
            गणक
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[#5C5850] font-normal tracking-normal ${
              size === 'sm'
                ? 'text-[10px]'
                : size === 'lg'
                ? 'text-xs'
                : 'text-[11px]'
            }`}
          >
            Jyotiṣa Calculation & Research
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
      className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2F0B] focus-visible:ring-offset-2 rounded-sm"
      aria-label="Gaṇaka — Jyotiṣa Calculation & Research Homepage"
    >
      {content}
    </Link>
  );
}
