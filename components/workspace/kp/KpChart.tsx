'use client';

/**
 * KP cuspal chart.
 *
 * KP does not read the square kuṇḍalī: a cusp is a calculated degree, and the
 * houses are unequal, so the chart is drawn as a wheel with the real Placidus
 * cusps as spokes. A graha is placed at its own longitude, which means it can
 * sit inside a house whose arc is narrow while its sign is something else
 * entirely — that mismatch is the point of the KP view.
 */

import React from 'react';
import type { KpCusp } from '@/lib/kp';
import type { KpPlanetRow } from '@/lib/kp';

interface KpChartProps {
  cusps: KpCusp[];
  planets: KpPlanetRow[];
  size?: number;
}

const RASHI_GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const GRAHA_ABBR: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
  venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

/** Place a sidereal longitude on the wheel, ascendant at the left (9 o'clock). */
function angleFor(longitude: number, ascendant: number): number {
  // Chart rotates anticlockwise; ascendant sits at 180° on the SVG circle.
  return 180 - (longitude - ascendant);
}

function point(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
}

export const KpChart: React.FC<KpChartProps> = ({ cusps, planets, size = 420 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rCusp = size * 0.34;
  const rPlanet = size * 0.40;
  const rRashi = size * 0.44;

  if (cusps.length === 0) return null;
  const ascendant = cusps[0].longitude;

  // Group planets that fall close together so their labels do not collide.
  const placed = planets
    .map((p) => ({ p, a: angleFor(p.longitude, ascendant) }))
    .sort((x, y) => x.a - y.a);
  const used: number[] = [];
  for (const item of placed) {
    let a = item.a;
    while (used.some((u) => Math.abs(((u - a + 540) % 360) - 180) < 9)) a += 9;
    used.push(a);
    (item as any).finalAngle = a;
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto max-w-[440px] mx-auto"
      role="img"
      aria-label="KP Placidus cusp chart"
    >
      {/* house sectors */}
      {cusps.map((c, i) => {
        const a1 = angleFor(c.longitude, ascendant);
        const a2 = angleFor(cusps[(i + 1) % 12].longitude, ascendant);
        const [x1, y1] = point(cx, cy, rOuter, a1);
        const [x2, y2] = point(cx, cy, rOuter, a2);
        const mid = a1 - (((a1 - a2) % 360) + 360) % 360 / 2;
        const [lx, ly] = point(cx, cy, rCusp + 12, mid);
        const shade = i % 2 === 0 ? 'fill-slate-50/70' : 'fill-white';
        return (
          <g key={c.house}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 0 ${x2} ${y2} Z`}
              className={shade}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              className="fill-slate-400 font-mono"
              style={{ fontSize: size * 0.028 }}
            >
              {c.house}
            </text>
          </g>
        );
      })}

      {/* cusp spokes with their sub lord */}
      {cusps.map((c) => {
        const a = angleFor(c.longitude, ascendant);
        const [x1, y1] = point(cx, cy, rCusp - 6, a);
        const [x2, y2] = point(cx, cy, rOuter, a);
        return (
          <line key={`s-${c.house}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#94a3b8" strokeWidth={c.house === 1 ? 1.6 : 0.8}
            strokeDasharray={c.house === 1 ? undefined : '3 3'} />
        );
      })}

      {/* rashi ring */}
      <circle cx={cx} cy={cy} r={rRashi} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      {Array.from({ length: 12 }, (_, i) => {
        const lon = i * 30;
        const a = angleFor(lon, ascendant);
        const [gx, gy] = point(cx, cy, rRashi + size * 0.012, a - 15);
        return (
          <text key={`r-${i}`} x={gx} y={gy}
            textAnchor="middle" dominantBaseline="middle"
            className="fill-[#8C2D19]/45"
            style={{ fontSize: size * 0.032 }}>
            {RASHI_GLYPH[i]}
          </text>
        );
      })}

      {/* planets */}
      {placed.map(({ p, finalAngle }: any) => {
        const [px, py] = point(cx, cy, rPlanet, finalAngle);
        const isNode = p.id === 'rahu' || p.id === 'ketu';
        return (
          <g key={p.id}>
            <circle cx={px} cy={py} r={size * 0.032}
              className={isNode ? 'fill-slate-100' : 'fill-[#8C2D19]/10'}
              stroke={isNode ? '#cbd5e1' : '#8C2D19'} strokeWidth="0.9" />
            <text x={px} y={py}
              textAnchor="middle" dominantBaseline="middle"
              className={isNode ? 'fill-slate-600' : 'fill-[#8C2D19]'}
              style={{ fontSize: size * 0.026, fontWeight: 600 }}>
              {GRAHA_ABBR[p.id] ?? p.name.slice(0, 2)}
            </text>
            {p.retrograde && (
              <text x={px + size * 0.026} y={py - size * 0.024}
                className="fill-slate-400" style={{ fontSize: size * 0.02 }}>R</text>
            )}
          </g>
        );
      })}

      {/* centre */}
      <circle cx={cx} cy={cy} r={size * 0.055} className="fill-white" stroke="#e2e8f0" strokeWidth="0.8" />
      <text x={cx} y={cy - 3} textAnchor="middle" className="fill-slate-400 font-mono" style={{ fontSize: size * 0.022 }}>
        KP
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-300 font-mono" style={{ fontSize: size * 0.018 }}>
        Placidus
      </text>
    </svg>
  );
};
