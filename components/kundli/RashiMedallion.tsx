'use client';

/**
 * Gaṇaka — rāśi medallion.
 *
 * A gold-rimmed disc carrying the sign's actual constellation — the stars at
 * their relative positions, sized by magnitude, joined by the traditional
 * figure — with the rāśi named in Devanagari beneath.
 *
 * The constellation is used rather than a zodiac glyph (♈ ♉ ♊) because those
 * code points are absent from the fonts the app ships and would render as
 * tofu, and rather than an animal drawing because hand-drawn animal line art
 * at this size looked amateur. The star pattern is authentic, verifiable
 * against the sky, and consistent across all twelve.
 */
import React from 'react';
import { CONSTELLATIONS } from '../../lib/jyotisha/constellations';

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
  /** small caption under the name, e.g. "Sun sign" */
  caption?: string;
  accent?: string;
}

const CX = 100;
const CY = 92;
const DISC = 62;

export const RashiMedallion: React.FC<RashiMedallionProps> = ({
  rashi,
  size = 200,
  caption,
  accent = '#E6670A',
}) => {
  const idx = Math.min(12, Math.max(1, Math.round(rashi)));
  const deva = RASHI_DEVANAGARI[idx - 1];
  const roman = RASHI_ROMAN[idx - 1];
  const c = CONSTELLATIONS[idx];

  /** star box is 0–100; map it into the disc */
  const scale = (DISC * 2) / 100;
  const mx = (v: number) => CX + (v - 50) * scale * 0.86;
  const my = (v: number) => CY + (v - 50) * scale * 0.86;

  const ticks = Array.from({ length: 36 }, (_, k) => {
    const a = (k * 10 - 90) * (Math.PI / 180);
    const long = k % 3 === 0;
    const r1 = long ? 70 : 74;
    const r2 = 79;
    return {
      x1: CX + r1 * Math.cos(a), y1: CY + r1 * Math.sin(a),
      x2: CX + r2 * Math.cos(a), y2: CY + r2 * Math.sin(a),
      w: long ? 1.3 : 0.65,
      o: long ? 0.85 : 0.42,
    };
  });

  return (
    <svg viewBox="0 0 200 196" width={size} height={size * 0.98}
         role="img" aria-label={`${roman} (${deva})`}>
      <defs>
        <radialGradient id={`disc-${idx}`} cx="50%" cy="36%" r="64%">
          <stop offset="0%" stopColor="#FFFCF2" />
          <stop offset="58%" stopColor="#FDF0D2" />
          <stop offset="100%" stopColor="#F4DCAE" />
        </radialGradient>
        <linearGradient id={`ring-${idx}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEC98A" />
          <stop offset="50%" stopColor="#C8963E" />
          <stop offset="100%" stopColor="#A2702A" />
        </linearGradient>
      </defs>

      {/* radiating ticks */}
      {ticks.map((t, k) => (
        <line key={k} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#C8963E" strokeWidth={t.w} opacity={t.o} strokeLinecap="round" />
      ))}

      {/* rings */}
      <circle cx={CX} cy={CY} r="66" fill="none" stroke={`url(#ring-${idx})`} strokeWidth="2" />
      <circle cx={CX} cy={CY} r="62" fill="none" stroke="#C8963E" strokeWidth="0.5" opacity="0.5" />

      {/* disc */}
      <circle cx={CX} cy={CY} r={DISC} fill={`url(#disc-${idx})`} />
      <circle cx={CX} cy={CY} r={DISC} fill="none" stroke="#B8862F" strokeWidth="0.7" opacity="0.45" />

      {/* corner ornament */}
      {[45, 135, 225, 315].map((deg) => {
        const a = (deg - 90) * (Math.PI / 180);
        return (
          <path key={deg}
                d="M0,-3.2 C2.4,-1.6 2.4,1.6 0,3.2 C-2.4,1.6 -2.4,-1.6 0,-3.2 Z"
                fill="#C8963E" opacity="0.5"
                transform={`translate(${CX + 53 * Math.cos(a)} ${CY + 53 * Math.sin(a)}) rotate(${deg})`} />
        );
      })}

      {/* the constellation */}
      {c.e.map(([a, b], k) => (
        <line key={`e${k}`}
              x1={mx(c.s[a][0])} y1={my(c.s[a][1])}
              x2={mx(c.s[b][0])} y2={my(c.s[b][1])}
              stroke="#C8963E" strokeWidth="0.75" opacity="0.75" />
      ))}
      {c.s.map(([x, y, m], k) => {
        const r = m === 1 ? 2.9 : m === 2 ? 2.2 : m === 3 ? 1.6 : 1.05;
        return <circle key={`s${k}`} cx={mx(x)} cy={my(y)} r={r} fill="#8E1B2C" />;
      })}

      {/* name */}
      <text x={CX} y="168" textAnchor="middle" fontSize="13" fontWeight="700"
            fill="#7A2A12" style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>
        {deva}
      </text>
      <text x={CX} y="182" textAnchor="middle" fontSize="8" letterSpacing="2.2"
            fill={accent} style={{ fontFamily: 'ui-monospace, monospace' }}>
        {roman.toUpperCase()}
      </text>
      {caption ? (
        <text x={CX} y="193" textAnchor="middle" fontSize="7" letterSpacing="1.4"
              fill="#A98A5E" style={{ fontFamily: 'ui-monospace, monospace' }}>
          {caption.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
};
