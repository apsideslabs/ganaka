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
      return buildOverallReading(report, chart);
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

      {/* how the reading is weighed */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4">
        <p className="text-[11px] text-slate-500 leading-relaxed">{reading.method}</p>
      </div>

      {/* the four movements */}
      {reading.movements.map((m) => (
        <div key={m.title} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#8C2D19]">
              {m.title}
            </h3>
            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              m.activation === 'active'
                ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                : m.activation === 'dormant'
                  ? 'text-slate-500 border-slate-200 bg-slate-50'
                  : 'text-amber-700 border-amber-200 bg-amber-50'
            }`}>
              {m.activation === 'active' ? 'activated now' : m.activation === 'dormant' ? 'dormant' : 'partly open'}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 mb-4">{m.body}</p>
          <div className="flex flex-wrap gap-2">
            {m.scores.map((sc) => (
              <span
                key={sc.id}
                title={sc.layers.map((l) => `${l.name} ${(l.score * 100).toFixed(0)} — ${l.read}`).join('\n')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md border ${
                  sc.tone === 'strong' ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                    : sc.tone === 'favourable' ? 'text-teal-700 border-teal-200 bg-teal-50'
                      : sc.tone === 'mixed' ? 'text-amber-700 border-amber-200 bg-amber-50'
                        : 'text-[#8C2D19] border-[#8C2D19]/20 bg-[#8C2D19]/5'
                }`}
              >
                {sc.label.split('&')[0].trim()} {sc.total}
              </span>
            ))}
          </div>
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

      {/* what to hold lightly, and what is merely dormant */}
      {(reading.thinnest.length > 0 || reading.strongButDormant.length > 0) && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4 space-y-2">
          {reading.thinnest.length > 0 && (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">Hold lightly:</span>{' '}
              {reading.thinnest.join(', ')} — the thinnest ground in this chart.
            </p>
          )}
          {reading.strongButDormant.length > 0 && (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">Strong but dormant:</span>{' '}
              {reading.strongButDormant.join(', ')} — well supported in the chart, but the
              running period does not open them yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
