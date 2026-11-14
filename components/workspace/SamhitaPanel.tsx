'use client';

/**
 * Gaṇaka — Saṃhitā: eclipses (grahaṇa).
 *
 * The one branch of the Saṃhitā literature that is fully computable is the
 * eclipse. Rainfall, omens and the Vāstu sections need a textual corpus rather
 * than an ephemeris, so they are not offered here rather than faked.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { findEclipses, ECLIPSE_METHOD_NOTE, type EclipseEvent } from '@/lib/astronomy/eclipses';
import { Info, Eclipse, Sun, Moon } from 'lucide-react';

interface SamhitaPanelProps {
  chart: JyotishaChart;
}

export const SamhitaPanel: React.FC<SamhitaPanelProps> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const [span, setSpan] = useState(2);

  const events: EclipseEvent[] = useMemo(() => {
    try {
      const y = new Date().getFullYear();
      return findEclipses({
        from: { year: y, month: 1, day: 1 },
        to: { year: y + span, month: 12, day: 31 },
        latitude: b.latitude,
        longitude: b.longitude,
        timezoneOffsetHours: b.timezoneOffsetHours,
        ayanamshaType: (chart.meta as any).ayanamshaType,
        maxResults: 40,
      });
    } catch (e) {
      console.warn('Eclipse search failed', e);
      return [];
    }
  }, [b, span, chart]);

  const solar = events.filter((e) => e.kind === 'solar');
  const lunar = events.filter((e) => e.kind === 'lunar');
  const visible = events.filter((e) => e.aboveHorizon);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Saṃhitā — Grahaṇa</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Every eclipse in the span, found by bisecting the Sun–Moon elongation and testing
          the Moon&rsquo;s ecliptic latitude at the syzygy. Dates are local to the birth place.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {solar.length} solar
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {lunar.length} lunar
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {visible.length} above the horizon here
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-3 flex-wrap">
        <label htmlFor="smi" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Span
        </label>
        <select
          id="smi"
          value={span}
          onChange={(e) => setSpan(Number(e.target.value))}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
        >
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>next {n} year{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Eclipse className="w-3.5 h-3.5 text-[#8C2D19]" /> Eclipses
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-slate-400">No eclipses found in this span.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                {['Type', 'Moment', 'Moon latitude', 'Depth', 'Here'].map((h) => (
                  <th key={h} className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={`${e.jd}-${i}`} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5">
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      {e.kind === 'solar'
                        ? <Sun className="w-3 h-3 text-[#B45309]" />
                        : <Moon className="w-3 h-3 text-[#3F4A5A]" />}
                      {e.kind === 'solar' ? 'Solar' : 'Lunar'}
                    </span>
                  </td>
                  <td className="py-1.5 font-mono tabular-nums text-slate-700 whitespace-nowrap">{e.label}</td>
                  <td className="py-1.5 font-mono tabular-nums text-slate-500">
                    {e.moonLatitude.toFixed(2)}° <span className="text-slate-300">/ {e.limit}°</span>
                  </td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#8C2D19]"
                          style={{ width: `${Math.max(3, e.depth * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{(e.depth * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-[10px]">
                    {e.aboveHorizon
                      ? <span className="text-emerald-700">visible</span>
                      : <span className="text-slate-400">below horizon</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">{ECLIPSE_METHOD_NOTE}</p>
      </div>
    </div>
  );
};
