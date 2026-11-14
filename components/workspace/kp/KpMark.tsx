'use client';

/**
 * The KP mark.
 *
 * A cusp wheel cut to the four angles: twelve spokes for the Placidus cusps,
 * with the ascendant and meridian emphasised. Drawn rather than borrowed so it
 * carries the app's own accent and stays legible at 16 px.
 */

import React from 'react';

export const KpMark: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => {
  const c = 12;
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={c} cy={c} r="9.4" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      {spokes.map((a, i) => {
        const inner = i % 3 === 0 ? 3.2 : 5.4;
        const x1 = c + inner * Math.cos(a);
        const y1 = c - inner * Math.sin(a);
        const x2 = c + 9.4 * Math.cos(a);
        const y2 = c - 9.4 * Math.sin(a);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 1.3 : 0.7}
            opacity={i % 3 === 0 ? 1 : 0.5}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={c} cy={c} r="2.1" fill="currentColor" opacity="0.85" />
    </svg>
  );
};
