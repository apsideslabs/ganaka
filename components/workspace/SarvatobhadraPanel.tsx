'use client';

/**
 * Gaṇaka — Sarvatobhadra Cakra panel.
 *
 * Renders the 9×9 grid with the 28-nakṣatra ring, and shows each graha's ring
 * position with the vedha it casts.
 */

import React, { useMemo } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { buildSarvatobhadraGrid, vedhaFor } from '@/lib/jyotisha/sarvatobhadra';
import { RASHIS } from '@/lib/jyotisha/constants';
import { Info, Grid3x3 } from 'lucide-react';

interface SarvatobhadraPanelProps {
  chart: JyotishaChart;
}

export const SarvatobhadraPanel: React.FC<SarvatobhadraPanelProps> = ({ chart }) => {
  const cells = useMemo(() => buildSarvatobhadraGrid(), []);

  const grahas = useMemo(() => {
    const out: Array<{ id: string; name: string; nak: string; vedha: any }> = [];
    for (const [id, pos] of Object.entries(chart.planets as any)) {
      const p: any = pos;
      if (p.nakshatraIndex == null) continue;
      out.push({
        id,
        name: p.name ?? id,
        nak: p.nakshatraName ?? '',
        vedha: vedhaFor(p.nakshatraIndex),
      });
    }
    return out;
  }, [chart]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Sarvatobhadra Cakra</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          A 9×9 figure of 81 cells. The outer ring carries the 28 nakṣatras including Abhijit,
          seven to a side, counted clockwise from the north-east corner.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <div className="grid grid-cols-9 gap-1 min-w-[560px]">
          {cells.map((c) => {
            const isNak = c.layer === 'nakshatra';
            const isRashi = c.layer === 'rashi';
            const isCorner = c.layer === 'corner';
            return (
              <div
                key={`${c.row}-${c.col}`}
                className={[
                  'aspect-square flex items-center justify-center rounded text-center p-0.5 leading-tight',
                  isNak ? 'bg-[#FCFAF6] border border-[#E1D8C7] text-[8px] font-medium text-slate-700' : '',
                  isRashi ? 'bg-[#8C2D19]/8 border border-[#8C2D19]/25 text-[8px] font-mono text-[#8C2D19]' : '',
                  isCorner ? 'bg-slate-100 border border-slate-300 text-[10px] text-slate-600' : '',
                  c.layer === 'empty' ? 'bg-slate-50/60 border border-slate-100' : '',
                ].join(' ')}
                title={c.value || undefined}
              >
                {isRashi && c.value ? RASHIS[Number(c.value.slice(1)) as 1]?.name?.slice(0, 3) : c.value}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Grid3x3 className="w-3.5 h-3.5 text-[#8C2D19]" /> Grahas and their vedha
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Graha</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Nakṣatra</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Opposite</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Left</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Right</th>
            </tr>
          </thead>
          <tbody>
            {grahas.map((g) => (
              <tr key={g.id} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 text-slate-700 capitalize">{g.name}</td>
                <td className="py-1.5 text-slate-600">{g.nak}</td>
                <td className="py-1.5 text-slate-600">{g.vedha.front}</td>
                <td className="py-1.5 text-slate-600">{g.vedha.left}</td>
                <td className="py-1.5 text-slate-600">{g.vedha.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The ring and its geometry are rendered in full. The classical vedha set also crosses the
          rāśi, tithi, vāra and akṣara layers — the text has a graha in Kṛttikā obstructing Bharaṇī
          and Viśākhā together with a vowel, two rāśis and a tithi — and that cross-layer mapping is
          not reproduced here. What is shown is the ring skeleton.
        </p>
      </div>
    </div>
  );
};
