'use client';

/**
 * Gaṇaka — Bhāva Bala (भाव बल) Panel
 * Reference: BPHS 27.26–31. House strength in virūpas, sixty to a rūpa.
 */

import React, { useMemo } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateBhavaBala } from '@/lib/shadbala/bhava-bala';
import { Info, Home, TrendingUp } from 'lucide-react';

interface BhavaBalaPanelProps {
  chart: JyotishaChart;
}

const REF_LABEL: Record<string, string> = {
  ascendant: 'Ascendant',
  nadir: '4th (Nadir)',
  descendant: '7th (Desc.)',
  meridian: '10th (Merid.)',
};

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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Bhāva Bala could not be computed for this chart.</p>
      </div>
    );
  }

  const rows = Object.values(result).sort((a, b) => a.houseNumber - b.houseNumber);
  const strongest = rows.reduce((a, b) => (b.totalVirupas > a.totalVirupas ? b : a), rows[0]);
  const weakest = rows.reduce((a, b) => (b.totalVirupas < a.totalVirupas ? b : a), rows[0]);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Bhāva Bala — House Strength</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Directional strength from the sign-group rule, a quarter added or removed for benefic or
          malefic aspect, the lord&rsquo;s śaḍbala, the occupancy rule, and the rising-class bonus —
          BPHS 27.26–31. Measured in virūpas, sixty to a rūpa.
        </p>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Strongest</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {strongest.houseNumber}th — {strongest.totalRupas.toFixed(2)} rūpas
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{strongest.rashiName} · lord {strongest.lordName}</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Weakest</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {weakest.houseNumber}th — {weakest.totalRupas.toFixed(2)} rūpas
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{weakest.rashiName} · lord {weakest.lordName}</div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Bhāva</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Rāśi</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Reference</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Dig</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Dṛg</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Adhipati</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Occ.</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Time</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Rūpas</th>
              <th className="text-center py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Rank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.houseNumber} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 font-mono tabular-nums text-slate-700">{r.houseNumber}</td>
                <td className="py-1.5 text-slate-600">{r.rashiName}</td>
                <td className="py-1.5 text-[10px] text-slate-400">{REF_LABEL[r.referenceAngle] ?? r.referenceAngle}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-600">{r.digBala.toFixed(1)}</td>
                <td className={`py-1.5 text-right font-mono tabular-nums ${r.drigAdjustment > 0 ? 'text-emerald-700' : r.drigAdjustment < 0 ? 'text-[#8C2D19]' : 'text-slate-400'}`}>
                  {r.drigAdjustment === 0 ? '—' : r.drigAdjustment.toFixed(1)}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-600">{r.adhipatiBala.toFixed(0)}</td>
                <td className={`py-1.5 text-right font-mono tabular-nums ${r.occupancyAdjustment > 0 ? 'text-emerald-700' : r.occupancyAdjustment < 0 ? 'text-[#8C2D19]' : 'text-slate-400'}`}>
                  {r.occupancyAdjustment === 0 ? '—' : r.occupancyAdjustment > 0 ? '+60' : '−60'}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">
                  {r.dayNightAdjustment ? '+15' : '—'}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                  {r.totalRupas.toFixed(2)}
                </td>
                <td className="py-1.5 text-center font-mono tabular-nums text-slate-500">{r.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* aspect detail */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">Dṛṣṭi on each bhāva</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {rows.map((r) => (
            <div key={r.houseNumber} className="border border-slate-100 rounded-lg px-2.5 py-2">
              <div className="text-[10px] font-mono text-slate-400 mb-0.5">{r.houseNumber} · {r.rashiName}</div>
              <div className="text-[11px] leading-snug">
                {r.aspectingPlanets.length === 0 ? (
                  <span className="text-slate-400">no aspect</span>
                ) : (
                  <span className="text-slate-600">
                    {r.aspectingPlanets.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* scope note */}
      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Bhāva madhya is taken from the active house system. Under the whole-sign default every
          madhya sits at 15° of its sign, so the Sagittarius and Capricorn half-sign split in
          BPHS 27.26 resolves to one side. Choose Śrīpati or Placidus cusps for the split to act
          as the verse intends.
        </p>
      </div>
    </div>
  );
};
