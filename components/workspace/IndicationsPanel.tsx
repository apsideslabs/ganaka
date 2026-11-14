'use client';

/**
 * Indications — the overall reading.
 *
 * One reading of the chart as a whole, not twelve separate forecasts and not a
 * rule audit. The domain evaluators still run underneath and still carry their
 * verses and condition checks; this panel composes their conclusions into four
 * movements and shows the chart facts they rest on.
 *
 * If a domain-by-domain or rule-level view is ever wanted, it belongs in its own
 * card — this one answers a single question: what does this chart say overall.
 */

import React, { useMemo } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { generateClassicalChartIndications } from '@/lib/jyotisha/indications';
import { buildOverallReading } from '@/lib/jyotisha/indications/overall';
import { BookOpen, Sparkles } from 'lucide-react';

interface IndicationsPanelProps {
  chart: JyotishaChart;
}

export const IndicationsPanel: React.FC<IndicationsPanelProps> = ({ chart }) => {
  const reading = useMemo(() => {
    try {
      const report = generateClassicalChartIndications(chart);
      return buildOverallReading(report);
    } catch (e) {
      console.warn('Overall reading failed', e);
      return null;
    }
  }, [chart]);

  if (!reading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-sm text-slate-500">
        The overall reading could not be composed for this chart.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* headline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#8C2D19]" />
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Overall Reading
          </h2>
        </div>
        <p className="font-serif text-lg leading-relaxed text-slate-900">
          {reading.headline}
        </p>
      </div>

      {/* the four movements */}
      {reading.movements.map((m) => (
        <div key={m.title} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#8C2D19] mb-3">
            {m.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-700">{m.body}</p>
        </div>
      ))}

      {/* the facts it rests on */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> The chart this reading rests on
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          {reading.atAGlance.map((f) => (
            <div key={f.label}>
              <dt className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                {f.label}
              </dt>
              <dd className="text-xs text-slate-800 mt-0.5">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* honesty about thin ground, in reading language rather than rule language */}
      {reading.thinGrounds.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This reading stands on firmer classical ground in some areas than others.
            {' '}
            {reading.thinGrounds.join(' and ')}
            {' '}
            {reading.thinGrounds.length === 1 ? 'rests' : 'rest'} on fewer verified
            configurations than the rest, so treat those parts of the reading as the
            softest.
          </p>
        </div>
      )}
    </div>
  );
};
