'use client';

/**
 * Gaṇaka — Bhāva Bala (भाव बल) Panel
 * Reference: BPHS 27.26–31. House strength in virūpas, sixty to a rūpa.
 */

import React, { useMemo } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateBhavaBala } from '@/lib/shadbala/bhava-bala';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BhavaBalaPanelProps {
  chart: JyotishaChart;
}

const REF_LABEL: Record<string, string> = {
  ascendant: 'Lagna',
  nadir: '4th',
  descendant: '7th',
  meridian: '10th',
};

/** The five components, in the order BPHS lists them. */
const COMPONENTS: Array<{ key: string; label: string; sub: string }> = [
  { key: 'digBala', label: 'Directional', sub: 'Dig' },
  { key: 'drigAdjustment', label: 'Aspect', sub: 'Dṛṣṭi' },
  { key: 'adhipatiBala', label: 'Lord’s strength', sub: 'Adhipati' },
  { key: 'occupancyAdjustment', label: 'Occupancy', sub: 'Bhāva' },
  { key: 'dayNightAdjustment', label: 'Day / night', sub: 'Kāla' },
];

export const BhavaBalaPanel: React.FC<BhavaBalaPanelProps> = ({ chart }) => {
  const result = useMemo(() => {
    try {
      return calculateBhavaBala(chart);
    } catch (e) {
      console.warn('Bhāva Bala calculation failed', e);
      return null;
    }
  }, [chart]);

  if (!result || Object.keys(result).length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs">
        <p className="text-[14px] text-slate-500">Bhāva Bala could not be computed for this chart.</p>
      </div>
    );
  }

  const rows = Object.values(result).sort((a, b) => a.houseNumber - b.houseNumber);
  const max = Math.max(...rows.map((r) => r.totalVirupas), 1);
  const strongest = rows.reduce((a, b) => (b.totalVirupas > a.totalVirupas ? b : a), rows[0]);
  const weakest = rows.reduce((a, b) => (b.totalVirupas < a.totalVirupas ? b : a), rows[0]);
  const mean = rows.reduce((n, r) => n + r.totalVirupas, 0) / rows.length;

  return (
    <div className="space-y-6">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-8 py-6 shadow-xs">
        <h2 className="font-serif text-[22px] font-semibold text-slate-900 leading-tight">
          Bhāva Bala — House Strength
        </h2>
        <p className="mt-2 text-[14px] text-slate-600 leading-relaxed max-w-3xl">
          Five components per house, in virūpas with sixty to a rūpa: directional strength from the
          sign group, a quarter added or removed for benefic or malefic aspect, the lord’s own
          śaḍbala, the occupancy rule, and the day-or-night bonus. BPHS 27.26–31.
        </p>
      </div>

      {/* ── summary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl px-6 py-5 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-slate-400">Strongest</span>
          </div>
          <div className="font-serif text-[26px] font-semibold text-slate-900 leading-none">
            {strongest.houseNumber}<span className="text-[15px] text-slate-400 ml-0.5">th</span>
          </div>
          <div className="text-[13px] text-slate-600 mt-1.5">{strongest.totalRupas.toFixed(2)} rūpas</div>
          <div className="text-[12px] text-slate-400 mt-0.5">{strongest.rashiName} · {strongest.lordName}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl px-6 py-5 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-slate-400">Weakest</span>
          </div>
          <div className="font-serif text-[26px] font-semibold text-slate-900 leading-none">
            {weakest.houseNumber}<span className="text-[15px] text-slate-400 ml-0.5">th</span>
          </div>
          <div className="text-[13px] text-slate-600 mt-1.5">{weakest.totalRupas.toFixed(2)} rūpas</div>
          <div className="text-[12px] text-slate-400 mt-0.5">{weakest.rashiName} · {weakest.lordName}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl px-6 py-5 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
            <span className="text-[12px] font-mono uppercase tracking-wider text-slate-400">Average</span>
          </div>
          <div className="font-serif text-[26px] font-semibold text-slate-900 leading-none">
            {(mean / 60).toFixed(2)}
          </div>
          <div className="text-[13px] text-slate-600 mt-1.5">rūpas across twelve</div>
          <div className="text-[12px] text-slate-400 mt-0.5">
            spread {(max - Math.min(...rows.map((r) => r.totalVirupas))).toFixed(0)} virūpas
          </div>
        </div>
      </div>

      {/* ── the table ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h3 className="font-serif text-[16px] font-semibold text-slate-900">The twelve houses</h3>
          <p className="text-[13px] text-slate-500 mt-1">
            Sorted by house. The bar is scaled to the strongest bhāva.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium text-slate-500 w-14">Bhāva</th>
                <th className="text-left px-3 py-3 font-medium text-slate-500">Rāśi &amp; lord</th>
                {COMPONENTS.map((c) => (
                  <th key={c.key} className="text-right px-3 py-3 font-medium text-slate-500 whitespace-nowrap">
                    <span className="block">{c.label}</span>
                    <span className="block text-[12px] font-normal text-slate-400 mt-0.5">{c.sub}</span>
                  </th>
                ))}
                <th className="text-right px-3 py-3 font-medium text-slate-500 whitespace-nowrap">
                  <span className="block">Total</span>
                  <span className="block text-[12px] font-normal text-slate-400 mt-0.5">rūpas</span>
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 w-32">Share</th>
                <th className="text-center px-3 py-3 font-medium text-slate-500 w-12">#</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = (r.totalVirupas / max) * 100;
                const isTop = r.houseNumber === strongest.houseNumber;
                const isBottom = r.houseNumber === weakest.houseNumber;
                return (
                  <tr key={r.houseNumber} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[15px] font-semibold text-slate-900 tabular-nums">
                        {r.houseNumber}
                      </span>
                      <span className="block text-[12px] text-slate-400 mt-0.5">
                        {REF_LABEL[r.referenceAngle] ?? r.referenceAngle}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-slate-800">{r.rashiName}</span>
                      <span className="block text-[12px] text-slate-400 mt-0.5">{r.lordName}</span>
                    </td>

                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-700">
                      {r.digBala.toFixed(1)}
                    </td>
                    <td className={`px-3 py-3.5 text-right font-mono tabular-nums ${
                      r.drigAdjustment > 0 ? 'text-emerald-700' : r.drigAdjustment < 0 ? 'text-[#8C2D19]' : 'text-slate-300'
                    }`}>
                      {r.drigAdjustment === 0 ? '—' : (r.drigAdjustment > 0 ? '+' : '') + r.drigAdjustment.toFixed(1)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-700">
                      {r.adhipatiBala.toFixed(0)}
                    </td>
                    <td className={`px-3 py-3.5 text-right font-mono tabular-nums ${
                      r.occupancyAdjustment > 0 ? 'text-emerald-700' : r.occupancyAdjustment < 0 ? 'text-[#8C2D19]' : 'text-slate-300'
                    }`}>
                      {r.occupancyAdjustment === 0 ? '—' : r.occupancyAdjustment > 0 ? '+60' : '−60'}
                    </td>
                    <td className={`px-3 py-3.5 text-right font-mono tabular-nums ${
                      r.dayNightAdjustment ? 'text-emerald-700' : 'text-slate-300'
                    }`}>
                      {r.dayNightAdjustment ? '+15' : '—'}
                    </td>

                    <td className="px-3 py-3.5 text-right">
                      <span className="font-mono text-[14px] font-semibold text-slate-900 tabular-nums">
                        {r.totalRupas.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isTop ? 'bg-emerald-600' : isBottom ? 'bg-[#8C2D19]' : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.max(pct, 3)}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-[11px] font-semibold ${
                        r.rank === 1 ? 'bg-emerald-600 text-white'
                          : r.rank === 12 ? 'bg-[#8C2D19] text-white'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.rank}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── aspect detail ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h3 className="font-serif text-[16px] font-semibold text-slate-900">Dṛṣṭi on each bhāva</h3>
          <p className="text-[13px] text-slate-500 mt-1">
            Which grahas aspect the house, and so feed the aspect component above.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.houseNumber} className="px-5 py-4">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span className="font-mono text-[13px] font-semibold text-slate-900">{r.houseNumber}</span>
                <span className="text-[11px] text-slate-400">{r.rashiName}</span>
              </div>
              {r.aspectingPlanets.length === 0 ? (
                <span className="text-[13px] text-slate-300">no aspect</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {r.aspectingPlanets.map((p) => (
                    <span key={p} className="text-[12px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── scope ──────────────────────────────────────────────── */}
      <div className="flex gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[13px] text-slate-600 leading-relaxed">
          Bhāva madhya is taken from the active house system. Under the whole-sign default every
          madhya sits at 15° of its sign, so the Sagittarius–Capricorn half-sign split in BPHS 27.26
          resolves to one side. Choose Śrīpati cusps for the split to act as the verse intends.
        </p>
      </div>
    </div>
  );
};
