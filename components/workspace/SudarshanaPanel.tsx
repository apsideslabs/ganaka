'use client';

/**
 * Gaṇaka — Sudarśana Cakra (सुदर्शन चक्र).
 *
 * BPHS ch. 74: three concentric rings of twelve houses, counted from the Lagna,
 * the Moon and the Sun, drawn from one centre so each spoke carries three signs.
 *
 * Drawing decisions that matter for legibility:
 *
 * - Twelve annular SECTORS, not twelve spokes with text dropped on them. Sector
 *   boundaries fall at −15°, +15°, … so every label sits at the middle of its
 *   cell and never lands on a line.
 * - Three separate radial BANDS, one per ring, so the Lagna, Candra and Sūrya
 *   reckonings are physically distinct rather than three labels on one arc.
 * - A cell holding three or more grahas wraps into a 2×2 grid inside its band.
 *   A plain radial stack overflowed the 44-unit band and put the fourth label
 *   on the ring stroke.
 * - House numbers appear once, on the outer rim, because the twelve houses are
 *   aligned across all three rings — repeating them three times is clutter.
 */
import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '../../lib/jyotisha/types';
import {
  calculateSudarshanaChakra,
  sudarshanaHouseForYear,
  type SudarshanaReference,
} from '../../lib/jyotisha/sudarshana';

const GRAHA: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
  venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

const RING: Record<
  SudarshanaReference,
  { label: string; deva: string; colour: string; rIn: number; rOut: number }
> = {
  lagna: { label: 'Lagna', deva: 'लग्न', colour: '#8C2D19', rIn: 40, rOut: 84 },
  moon: { label: 'Candra', deva: 'चन्द्र', colour: '#41506B', rIn: 88, rOut: 132 },
  sun: { label: 'Sūrya', deva: 'सूर्य', colour: '#9A6A1E', rIn: 136, rOut: 180 },
};

const VB = 400;
const CX = VB / 2;
const CY = VB / 2;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const px = (r: number, deg: number) => CX + r * Math.cos(rad(deg));
const py = (r: number, deg: number) => CY + r * Math.sin(rad(deg));

/** Annular sector from rIn to rOut between two angles (degrees, 0 = top). */
function sectorPath(rIn: number, rOut: number, a0: number, a1: number): string {
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${px(rOut, a0).toFixed(2)} ${py(rOut, a0).toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${px(rOut, a1).toFixed(2)} ${py(rOut, a1).toFixed(2)}`,
    `L ${px(rIn, a1).toFixed(2)} ${py(rIn, a1).toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${px(rIn, a0).toFixed(2)} ${py(rIn, a0).toFixed(2)}`,
    'Z',
  ].join(' ');
}

/**
 * Where the k-th graha of an n-graha cell sits, as [radius, angularOffset].
 * Kept in step with the geometry test in tests/run.ts.
 */
export function cellSlot(k: number, n: number, rIn: number, rOut: number): [number, number] {
  const mid = rIn + (rOut - rIn) * 0.62;
  if (n === 1) return [mid, 0];
  if (n === 2) return [rIn + 24 + k * 11, 0];
  const rows = Math.ceil(n / 2);
  const dr = rows > 1 ? 9 : 0;
  const da = 6.5;
  const c = k % 2;
  const r = Math.floor(k / 2);
  return [mid + (r - (rows - 1) / 2) * dr, (c - 0.5) * da];
}

export const SudarshanaPanel: React.FC<{ chart: JyotishaChart }> = ({ chart }) => {
  const b = chart.meta.birthDetails;

  const [year, setYear] = useState<number>(() => {
    const now = new Date();
    let y = now.getFullYear() - b.year;
    const beforeBirthday =
      now.getMonth() + 1 < b.month ||
      (now.getMonth() + 1 === b.month && now.getDate() < b.day);
    if (beforeBirthday) y -= 1;
    return Math.max(1, y);
  });

  const chakra = useMemo(
    () => calculateSudarshanaChakra(chart, { yearOfLife: year }),
    [chart, year]
  );
  const activeHouse = sudarshanaHouseForYear(year);

  return (
    <div className="space-y-6">
      {/* ---------- header ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
            <h2 className="text-base font-serif font-bold text-slate-900">Sudarśana Cakra</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Three rings of twelve houses, counted from the Lagna, the Moon and the Sun, read
            together. The signs do not move between rings — only the house number changes with
            the reference.
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            BPHS ch. 74 (सुदर्शनचक्रफलाध्याय)
          </p>
        </div>

        <div className="flex items-end gap-3 shrink-0">
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              Year of life
            </label>
            <input
              type="number"
              min={1}
              value={year}
              onChange={(e) => setYear(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
            />
          </div>
          <div className="pb-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              Active house
            </div>
            <div className="text-2xl font-serif font-bold text-[#8C2D19] leading-none">
              {activeHouse}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- use condition, BPHS 74.19–20 ---------- */}
      {!chakra.applicable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
          <div className="text-amber-500 text-sm leading-none pt-0.5">▲</div>
          <div>
            <p className="text-xs text-amber-900 font-semibold">Not authoritative for this chart</p>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              {chakra.inapplicableReason}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ---------- the dial ---------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
            The three rings
          </h3>

          <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full max-w-[460px] mx-auto block">
            {/* sector fills */}
            {Array.from({ length: 12 }, (_, i) => {
              const h = i + 1;
              const a0 = i * 30 - 15;
              const a1 = i * 30 + 15;
              const isActive = h === activeHouse;
              return (
                <g key={`fill-${h}`}>
                  {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
                    const st = RING[ref];
                    return (
                      <path
                        key={ref}
                        d={sectorPath(st.rIn, st.rOut, a0, a1)}
                        fill={isActive ? '#8C2D19' : i % 2 ? '#FBF8F1' : '#FFFFFF'}
                        fillOpacity={isActive ? 0.07 : 1}
                        stroke="#E6DECB"
                        strokeWidth="0.7"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* ring circles */}
            {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => (
              <circle
                key={`ring-${ref}`}
                cx={CX}
                cy={CY}
                r={RING[ref].rOut}
                fill="none"
                stroke={RING[ref].colour}
                strokeWidth="1.1"
                opacity="0.55"
              />
            ))}

            {/* centre disc */}
            <circle cx={CX} cy={CY} r={38} fill="#FDFBF6" stroke="#8C2D19" strokeWidth="1.1" />
            <text x={CX} y={CY - 9} textAnchor="middle" fontSize="7.5"
                  fontFamily="ui-monospace, monospace" fill="#9A8A6E" letterSpacing="1">
              YEAR {year}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fontSize="20"
                  fontFamily="ui-serif, Georgia, serif" fontWeight="bold" fill="#8C2D19">
              {activeHouse}
            </text>
            <text x={CX} y={CY + 24} textAnchor="middle" fontSize="6"
                  fontFamily="ui-monospace, monospace" fill="#9A8A6E" letterSpacing="0.8">
              HOUSE
            </text>

            {/* house numbers on the outer rim */}
            {Array.from({ length: 12 }, (_, i) => {
              const h = i + 1;
              const isActive = h === activeHouse;
              return (
                <text
                  key={`hn-${h}`}
                  x={px(192, i * 30).toFixed(2)}
                  y={py(192, i * 30).toFixed(2)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isActive ? 10 : 8.5}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fill={isActive ? '#8C2D19' : '#A89C86'}
                >
                  {h}
                </text>
              );
            })}

            {/* cell contents: sign number, then grahas in a band-aware grid */}
            {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
              const st = RING[ref];
              const ring = chakra.rings.find((r) => r.reference === ref)!;
              return ring.houses.map((cell) => {
                const ang = (cell.house - 1) * 30;
                const n = cell.planets.length;
                const fs = n <= 2 ? 8 : n <= 4 ? 7 : 6;
                return (
                  <g key={`${ref}-${cell.house}`}>
                    <text
                      x={px(st.rIn + 7.5, ang).toFixed(2)}
                      y={py(st.rIn + 7.5, ang).toFixed(2)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="7"
                      fontFamily="ui-serif, Georgia, serif"
                      fill={st.colour}
                      opacity="0.7"
                    >
                      {cell.rashi}
                    </text>
                    {cell.planets.map((p, k) => {
                      const [rr, da] = cellSlot(k, n, st.rIn, st.rOut);
                      return (
                        <text
                          key={p}
                          x={px(rr, ang + da).toFixed(2)}
                          y={py(rr, ang + da).toFixed(2)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={fs}
                          fontWeight="bold"
                          fontFamily="ui-sans-serif, system-ui, sans-serif"
                          fill="#2A2A30"
                        >
                          {GRAHA[p] ?? p}
                        </text>
                      );
                    })}
                  </g>
                );
              });
            })}
          </svg>

          {/* legend */}
          <div className="flex items-center justify-center gap-5 mt-1">
            {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
              const st = RING[ref];
              const ring = chakra.rings.find((r) => r.reference === ref)!;
              return (
                <div key={ref} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] rounded" style={{ background: st.colour }} />
                  <span className="text-[10px] font-mono" style={{ color: st.colour }}>
                    {st.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {ring.referenceRashiName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- the three-fold table ---------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Each graha in three houses
          </h3>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pl-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Graha
                </th>
                {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((r) => (
                  <th
                    key={r}
                    className="text-center py-2 font-mono text-[9px] uppercase tracking-wider"
                    style={{ color: RING[r].colour }}
                  >
                    {RING[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(chakra.perGraha).map(([g, h]) => (
                <tr key={g} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 pl-1">
                    <span className="w-5 text-center font-bold text-slate-700">
                      {GRAHA[g] ?? g}
                    </span>
                  </td>
                  {(['fromLagna', 'fromMoon', 'fromSun'] as const).map((k) => {
                    const on = h[k] === activeHouse;
                    return (
                      <td key={k} className="text-center py-1.5">
                        <span
                          className={
                            on
                              ? 'inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#8C2D19] text-white font-mono font-bold text-[11px]'
                              : 'inline-flex items-center justify-center w-6 h-6 font-mono text-slate-600 text-[11px]'
                          }
                        >
                          {h[k]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
            Filled cells mark the house active in year {year}. A graha keeps its sign in every
            ring; only the house number changes with the reference (BPHS 74.6).
          </p>
        </div>
      </div>

      {/* ---------- the active house read across the three rings ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            House {activeHouse} in all three rings
          </h3>
          <span className="text-[10px] font-mono text-slate-400">year {year}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
            const ring = chakra.rings.find((r) => r.reference === ref)!;
            const cell = ring.houses[activeHouse - 1];
            const st = RING[ref];
            return (
              <div key={ref} className="border border-slate-200 rounded-xl p-3.5">
                <div
                  className="text-[9px] font-mono uppercase tracking-widest mb-1.5"
                  style={{ color: st.colour }}
                >
                  from {st.label}
                </div>
                <div className="text-sm font-serif text-slate-800">
                  house {cell.house} · sign {cell.rashi}
                </div>
                <div className="text-xs mt-1.5 min-h-[18px]">
                  {cell.planets.length ? (
                    <span className="font-semibold text-slate-700">
                      {cell.planets.map((p) => GRAHA[p] ?? p).join(' · ')}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">empty — judge by the lord (74.14)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">{chakra.dasha?.note}</p>
      </div>
    </div>
  );
};
