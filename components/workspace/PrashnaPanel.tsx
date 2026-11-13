'use client';

/**
 * Gaṇaka — Prasna Marga horary panel.
 *
 * Casts the prasna chart for the moment the question is put, resolves the
 * arudha from the direction the questioner faced, and shows the sphuṭas and the
 * six factors of Prasna Marga 8.1.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculatePrashna, DIRECTION_SIGNS } from '@/lib/jyotisha/prashna';
import { Info, Compass, Sparkles } from 'lucide-react';

interface PrashnaPanelProps {
  chart: JyotishaChart;
}

export const PrashnaPanel: React.FC<PrashnaPanelProps> = ({ chart }) => {
  const [direction, setDirection] = useState('');

  const result = useMemo(() => {
    try {
      return calculatePrashna(chart, direction || undefined);
    } catch (e) {
      console.warn('Prasna calculation failed', e);
      return null;
    }
  }, [chart, direction]);

  if (!result) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Prasna could not be computed.</p>
      </div>
    );
  }

  const sphutas = [
    result.trisphuta, result.chatusphuta, result.panchasphuta,
    result.pranaSphuta, result.dehaSphuta, result.mrityuSphuta,
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Praśna — Horary Chart</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          A prasna is cast for the moment the question is put, not for a birth. Prasna Marga 8.1
          names six things to study; three come from the moment, three from the sitting.
        </p>
      </div>

      {/* arudha direction */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <label htmlFor="prashna-dir" className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
          Direction the questioner faced
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            id="prashna-dir"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
          >
            <option value="">not given</option>
            {DIRECTION_SIGNS.map((d) => (
              <option key={d.direction} value={d.direction}>{d.direction} ({d.sanskrit})</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Arudha</span>
            <span className="font-serif text-sm font-bold text-slate-900">
              {result.arudha ? result.arudha.rashiName : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* sphutas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8C2D19]" /> Sphuṭas
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Point</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Longitude</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Rāśi</th>
            </tr>
          </thead>
          <tbody>
            {sphutas.map((s) => (
              <tr key={s.key} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 text-slate-700">
                  {s.name} <span className="text-slate-400">{s.sanskritName}</span>
                </td>
                <td className="py-1.5 font-mono tabular-nums text-slate-600">{s.longitude.toFixed(2)}°</td>
                <td className="py-1.5 text-slate-600">{s.degreeStr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* six factors */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
          The six factors (Prasna Marga 8.1)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {result.sixFactors.map((f) => (
            <div key={f.name} className="border border-slate-100 rounded-lg px-3 py-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">{f.name}</div>
              <div className={`text-[11px] ${f.computable ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The chhatra and the touched-limb sign depend on how the questioner sat and what they
          touched; neither can come from an ephemeris, so both are left to the astrologer rather
          than guessed. The arudha needs the compass direction of the question.
        </p>
      </div>
    </div>
  );
};
