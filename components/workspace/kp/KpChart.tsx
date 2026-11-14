'use client';

/**
 * KP cuspal chart.
 *
 * KP does not read the square kuṇḍalī: a cusp is a calculated degree and the
 * houses are unequal, so the chart is drawn as a wheel with the real Placidus
 * cusps as spokes. A graha is placed at its own longitude, which means it can sit
 * inside a house whose arc is narrow while its sign is something else entirely —
 * that mismatch is the point of the KP view.
 *
 * Everything here is a real SVG attribute — fills, sizes, weights — never a
 * Tailwind class. Utility classes do nothing inside an <svg> once it leaves the
 * page, and the first version of this wheel rendered as a black disc because of
 * exactly that.
 */

import React from 'react';
import type { KpCusp, KpPlanetRow } from '@/lib/kp';

interface KpChartProps {
  cusps: KpCusp[];
  planets: KpPlanetRow[];
  size?: number;
}

const INK = '#1e293b';
const MUTED = '#94a3b8';
const ACCENT = '#8C2D19';
const LINE = '#cbd5e1';

const GRAHA_ABBR: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
  venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

/** Short rashi names — Unicode zodiac glyphs are not in every font. */
const RASHI_SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

/** Sidereal longitude to a point on the wheel; ascendant sits at 9 o'clock. */
function pt(cx: number, cy: number, r: number, longitude: number, asc: number): [number, number] {
  // Screen angle: 180° puts the ascendant on the left, and longitude runs
  // anticlockwise, so it is subtracted.
  const a = (180 - (longitude - asc)) * (Math.PI / 180);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

export const KpChart: React.FC<KpChartProps> = ({ cusps, planets, size = 560 }) => {
  if (!cusps || cusps.length < 12) return null;

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.47;
  const rRashi = size * 0.40;   // inner edge of the rashi ring
  const rHouse = size * 0.235;  // inner edge of the house ring
  const rPlanet = size * 0.315; // planet markers sit in the house ring
  const rHouseNum = size * 0.215;
  const asc = cusps[0].longitude;

  // Nudge planets that fall close together so their markers do not overlap.
  const placed = planets
    .map((p) => ({ p, lon: p.longitude }))
    .sort((a, b) => ((a.lon - asc + 360) % 360) - ((b.lon - asc + 360) % 360));
  const usedAngles: number[] = [];
  const finalPositions = placed.map(({ p, lon }) => {
    let l = lon;
    let guard = 0;
    while (
      usedAngles.some((u) => Math.abs(((u - l + 540) % 360) - 180) < 15) &&
      guard < 40
    ) { l += 15; guard++; }
    usedAngles.push(l);
    return { p, lon: l };
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, display: 'block', margin: '0 auto' }}
      role="img"
      aria-label="KP Placidus cusp chart"
    >
      {/* ground */}
      <circle cx={cx} cy={cy} r={rOuter} fill="#ffffff" stroke={INK} strokeWidth={1.6} />
      <circle cx={cx} cy={cy} r={rRashi} fill="#faf7f4" stroke={LINE} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={rHouse} fill="#ffffff" stroke={LINE} strokeWidth={1} />

      {/* rashi ring: 12 equal divisions, labelled */}
      {Array.from({ length: 12 }, (_, i) => {
        const start = i * 30;
        const [x1, y1] = pt(cx, cy, rRashi, start, asc);
        const [x2, y2] = pt(cx, cy, rOuter, start, asc);
        const [tx, ty] = pt(cx, cy, (rRashi + rOuter) / 2, start + 15, asc);
        return (
          <g key={`r-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE} strokeWidth={1} />
            <text
              x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.026} fontFamily="ui-monospace, monospace"
              fontWeight={600} fill={MUTED}
            >
              {RASHI_SHORT[i]}
            </text>
          </g>
        );
      })}

      {/* cusp spokes — the real Placidus degrees */}
      {cusps.map((c, i) => {
        const isAngle = c.house === 1 || c.house === 4 || c.house === 7 || c.house === 10;
        const [x1, y1] = pt(cx, cy, rHouse, c.longitude, asc);
        const [x2, y2] = pt(cx, cy, rRashi, c.longitude, asc);
        return (
          <line
            key={`c-${c.house}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isAngle ? INK : LINE}
            strokeWidth={isAngle ? 2.2 : 1}
            strokeDasharray={isAngle ? undefined : '4 3'}
          />
        );
      })}

      {/* house numbers, at the middle of each cusp arc */}
      {cusps.map((c, i) => {
        const next = cusps[(i + 1) % 12].longitude;
        const span = ((next - c.longitude) % 360 + 360) % 360;
        const mid = c.longitude + span / 2;
        const [hx, hy] = pt(cx, cy, rHouseNum, mid, asc);
        return (
          <text
            key={`h-${c.house}`} x={hx} y={hy} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.03} fontFamily="ui-monospace, monospace" fontWeight={700}
            fill={c.house === 1 ? ACCENT : MUTED}
          >
            {c.house}
          </text>
        );
      })}

      {/* planets */}
      {finalPositions.map(({ p, lon }) => {
        const [px, py] = pt(cx, cy, rPlanet, lon, asc);
        const r = size * 0.036;
        const isNode = p.id === 'rahu' || p.id === 'ketu';
        return (
          <g key={p.id}>
            <circle
              cx={px} cy={py} r={r}
              fill={isNode ? '#f1f5f9' : '#fbeeea'}
              stroke={isNode ? MUTED : ACCENT}
              strokeWidth={1.2}
            />
            <text
              x={px} y={py} textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.028} fontFamily="system-ui, sans-serif" fontWeight={700}
              fill={isNode ? '#475569' : ACCENT}
            >
              {GRAHA_ABBR[p.id] ?? p.name.slice(0, 2)}
            </text>
            {p.retrograde && (
              <text
                x={px + r * 0.85} y={py - r * 0.85} textAnchor="middle"
                fontSize={size * 0.02} fontFamily="system-ui, sans-serif" fontWeight={700}
                fill={MUTED}
              >
                R
              </text>
            )}
          </g>
        );
      })}

      {/* ascendant marker */}
      {(() => {
        const [ax, ay] = pt(cx, cy, rOuter - size * 0.02, asc, asc);
        const [ax2, ay2] = pt(cx, cy, rRashi + size * 0.02, asc, asc);
        return (
          <g>
            <line x1={ax} y1={ay} x2={ax2} y2={ay2} stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
            <circle cx={ax} cy={ay} r={size * 0.012} fill={ACCENT} />
          </g>
        );
      })()}

      {/* centre */}
      <circle cx={cx} cy={cy} r={rHouse * 0.82} fill="#ffffff" stroke={LINE} strokeWidth={1} />
      <text x={cx} y={cy - size * 0.014} textAnchor="middle"
        fontSize={size * 0.032} fontFamily="Georgia, serif" fontWeight={700} fill={INK}>
        KP
      </text>
      <text x={cx} y={cy + size * 0.022} textAnchor="middle"
        fontSize={size * 0.021} fontFamily="ui-monospace, monospace" fill={MUTED}>
        Placidus
      </text>
    </svg>
  );
};
