'use client';

/**
 * Gaṇaka — Sudarśana Cakra (सुदर्शन चक्र).
 *
 * BPHS ch. 74. Three concentric rings of twelve houses — from the Lagna, from
 * the Moon, from the Sun — drawn from one centre, so that each spoke carries
 * three signs and the planets in them.
 *
 * The panel is deliberately plain: the value of this cakra is that you can see
 * the same planet in three houses at once, which is hard to do across three
 * separate charts. It shows that, the use condition from 74.19–20, and the
 * annual daśā from 74.22. It does not invent interpretations.
 */
import React, { useMemo, useState } from 'react';
import type { JyotishaChart, PlanetId } from '../../lib/jyotisha/types';
import {
  calculateSudarshanaChakra,
  sudarshanaHouseForYear,
  type SudarshanaReference,
} from '../../lib/jyotisha/sudarshana';

const GRAHA_LABEL: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
  venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

const RING_STYLE: Record<SudarshanaReference, { label: string; colour: string; radius: number }> = {
  lagna: { label: 'Lagna', colour: '#8C2D19', radius: 62 },
  moon: { label: 'Candra', colour: '#3F4A5A', radius: 96 },
  sun: { label: 'Sūrya', colour: '#B45309', radius: 130 },
};

const SIZE = 320;
const C = SIZE / 2;

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

export const SudarshanaPanel: React.FC<{ chart: JyotishaChart }> = ({ chart }) => {
  const [year, setYear] = useState<number>(() => {
    const b = chart.meta.birthDetails;
    const now = new Date();
    const elapsed = now.getFullYear() - b.year;
    return elapsed > 0 ? elapsed : 1;
  });

  const chakra = useMemo(
    () => calculateSudarshanaChakra(chart, { yearOfLife: year }),
    [chart, year]
  );

  const activeHouse = sudarshanaHouseForYear(year);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
            <h2 className="text-base font-serif font-bold text-slate-900">Sudarśana Cakra</h2>
          </div>
          <p className="text-xs text-slate-500">
            Three rings of twelve houses — from the Lagna, the Moon and the Sun — read together.
            <span className="font-mono text-[10px] ml-2 text-slate-400">BPHS ch. 74</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Year of life
          </label>
          <input
            type="number"
            min={1}
            value={year}
            onChange={(e) => setYear(Math.max(1, Number(e.target.value) || 1))}
            className="w-20 px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
          />
          <span className="text-[10px] font-mono text-slate-500">
            → house <span className="font-bold text-[#8C2D19]">{activeHouse}</span>
          </span>
        </div>
      </div>

      {/* use condition, BPHS 74.19-20 */}
      {!chakra.applicable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-900 font-semibold mb-0.5">
            Not authoritative for this chart
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {chakra.inapplicableReason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* the three rings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
            The three rings
          </h3>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[360px] mx-auto">
            {/* spokes */}
            {Array.from({ length: 12 }, (_, i) => {
              const [x1, y1] = polar(38, i * 30);
              const [x2, y2] = polar(130, i * 30);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#E0D8C8" strokeWidth="0.8" />
              );
            })}
            {/* rings */}
            {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
              const st = RING_STYLE[ref];
              return (
                <circle key={ref} cx={C} cy={C} r={st.radius}
                        fill="none" stroke={st.colour} strokeWidth="1.2" opacity="0.7" />
              );
            })}
            <circle cx={C} cy={C} r={38} fill="#FDFBF6" stroke="#8C2D19" strokeWidth="1.2" />

            {/* house numbers, once, in the innermost band */}
            {Array.from({ length: 12 }, (_, i) => {
              const [x, y] = polar(50, i * 30);
              const isActive = i + 1 === activeHouse;
              return (
                <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                      fontSize="8" fontFamily="monospace"
                      fill={isActive ? '#8C2D19' : '#9A8A6E'}
                      fontWeight={isActive ? 'bold' : 'normal'}>
                  {i + 1}
                </text>
              );
            })}

            {/* planets: one glyph per ring per house */}
            {chakra.rings.map((ring) => {
              const st = RING_STYLE[ring.reference];
              const r = st.radius - 16;
              return ring.houses.map((h) => {
                if (!h.planets.length) return null;
                const [x, y] = polar(r, (h.house - 1) * 30);
                return (
                  <text key={`${ring.reference}-${h.house}`} x={x} y={y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="7.5" fontWeight="bold" fill={st.colour}>
                    {h.planets.map((p) => GRAHA_LABEL[p] ?? p).join(' ')}
                  </text>
                );
              });
            })}
          </svg>
          <div className="flex items-center justify-center gap-4 mt-2">
            {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((ref) => {
              const st = RING_STYLE[ref];
              const ring = chakra.rings.find((r) => r.reference === ref)!;
              return (
                <div key={ref} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: st.colour }} />
                  <span className="text-[10px] font-mono text-slate-600">
                    {st.label} · {ring.referenceRashiName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* the three-fold table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
            Each graha in three houses
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1.5 font-mono text-[10px] uppercase text-slate-500">Graha</th>
                {(['lagna', 'moon', 'sun'] as SudarshanaReference[]).map((r) => (
                  <th key={r} className="text-center py-1.5 font-mono text-[10px] uppercase"
                      style={{ color: RING_STYLE[r].colour }}>
                    {RING_STYLE[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(chakra.perGraha).map(([g, h]) => (
                <tr key={g} className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-700">{GRAHA_LABEL[g] ?? g}</td>
                  {(['fromLagna', 'fromMoon', 'fromSun'] as const).map((k) => {
                    const active = h[k] === activeHouse;
                    return (
                      <td key={k}
                          className={`text-center py-1.5 font-mono ${active ? 'font-bold text-[#8C2D19]' : 'text-slate-600'}`}>
                        {h[k]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
            The signs never move between rings; only the house number changes with the reference
            (BPHS 74.6). The bold column marks the house active in the selected year.
          </p>
        </div>
      </div>

      {/* the active house, read across all three rings */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
          Year {year} · house {activeHouse} in all three rings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {chakra.rings.map((ring) => {
            const h = ring.houses[activeHouse - 1];
            const st = RING_STYLE[ring.reference];
            return (
              <div key={ring.reference} className="border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1"
                     style={{ color: st.colour }}>
                  from {st.label}
                </div>
                <div className="text-sm font-serif text-slate-800">
                  house {h.house} · sign {h.rashi}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {h.planets.length
                    ? h.planets.map((p: PlanetId) => GRAHA_LABEL[p] ?? p).join(', ')
                    : 'empty — judge by the lord (74.14)'}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
          {chakra.dasha?.note}
        </p>
      </div>
    </div>
  );
};
