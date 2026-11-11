'use client';

/**
 * Gaṇaka — rāśi medallion.
 *
 * The visual centrepiece for the poster-style views: a warm disc with a double
 * gold ring, radiating ornament and the rāśi named in Devanagari at the centre.
 *
 * Deliberately drawn rather than iconographic: Unicode zodiac glyphs (♈ ♉ ♊)
 * are not present in the fonts the app ships, and would render as tofu. The
 * Devanagari name is authentic, needs no glyph hunt, and carries the same weight.
 */
import React from 'react';

export const RASHI_DEVANAGARI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन',
] as const;

export const RASHI_ROMAN = [
  'Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Siṃha', 'Kanyā',
  'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna',
] as const;

interface RashiMedallionProps {
  /** 1–12 */
  rashi: number;
  size?: number;
  /** shown under the Devanagari name */
  caption?: string;
  accent?: string;
}

export const RashiMedallion: React.FC<RashiMedallionProps> = ({
  rashi,
  size = 200,
  caption,
  accent = '#E6670A',
}) => {
  const i = Math.min(12, Math.max(1, Math.round(rashi))) - 1;
  const deva = RASHI_DEVANAGARI[i];
  const roman = RASHI_ROMAN[i];

  // 36 radiating ticks around the outer ring
  const ticks = Array.from({ length: 36 }, (_, k) => {
    const a = (k * 10 - 90) * (Math.PI / 180);
    const long = k % 3 === 0;
    const r1 = long ? 78 : 83;
    const r2 = 88;
    return {
      x1: 100 + r1 * Math.cos(a), y1: 100 + r1 * Math.sin(a),
      x2: 100 + r2 * Math.cos(a), y2: 100 + r2 * Math.sin(a),
      w: long ? 1.4 : 0.7,
      o: long ? 0.85 : 0.45,
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`${roman} (${deva})`}
    >
      <defs>
        <radialGradient id={`disc-${i}`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#FFF9EA" />
          <stop offset="62%" stopColor="#FDEBC4" />
          <stop offset="100%" stopColor="#F6DCA8" />
        </radialGradient>
        <linearGradient id={`ring-${i}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9BE72" />
          <stop offset="50%" stopColor="#C8963E" />
          <stop offset="100%" stopColor="#A9762A" />
        </linearGradient>
      </defs>

      {/* radiating ticks */}
      {ticks.map((t, k) => (
        <line key={k} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#C8963E" strokeWidth={t.w} opacity={t.o}
              strokeLinecap="round" />
      ))}

      {/* outer ring */}
      <circle cx="100" cy="100" r="74" fill="none"
              stroke={`url(#ring-${i})`} strokeWidth="2.2" />
      <circle cx="100" cy="100" r="70" fill="none"
              stroke="#C8963E" strokeWidth="0.6" opacity="0.55" />

      {/* warm disc */}
      <circle cx="100" cy="100" r="66" fill={`url(#disc-${i})`} />
      <circle cx="100" cy="100" r="66" fill="none"
              stroke="#B8862F" strokeWidth="0.8" opacity="0.5" />

      {/* corner ornaments: four small leaves at the diagonals */}
      {[45, 135, 225, 315].map((deg) => {
        const a = (deg - 90) * (Math.PI / 180);
        const cx = 100 + 58 * Math.cos(a);
        const cy = 100 + 58 * Math.sin(a);
        return (
          <g key={deg} transform={`translate(${cx} ${cy}) rotate(${deg})`}>
            <path d="M0,-4 C3,-2 3,2 0,4 C-3,2 -3,-2 0,-4 Z"
                  fill="#C8963E" opacity="0.55" />
          </g>
        );
      })}

      {/* the rāśi, in Devanagari */}
      <text
        x="100" y="96"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="34"
        fontWeight="700"
        fill="#7A2A12"
        style={{ fontFamily: '"Noto Serif Devanagari", "Noto Sans Devanagari", serif' }}
      >
        {deva}
      </text>
      <text
        x="100" y="126"
        textAnchor="middle"
        fontSize="10.5"
        letterSpacing="2.4"
        fill={accent}
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        {roman.toUpperCase()}
      </text>

      {caption ? (
        <text x="100" y="146" textAnchor="middle" fontSize="8"
              letterSpacing="1.6" fill="#8A6A3E"
              style={{ fontFamily: 'ui-monospace, monospace' }}>
          {caption.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
};
