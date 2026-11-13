'use client';

/**
 * Gaṇaka — birth-time sensitivity panel.
 *
 * Recomputes the chart at the stated uncertainty either side of the recorded
 * time and shows which outputs hold and which move. Nothing here is inferred:
 * every row is a comparison of two real calculations.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { assessTimeSensitivity } from '@/lib/jyotisha/time-sensitivity';
import { Info, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TimeSensitivityPanelProps {
  chart: JyotishaChart;
}

export const TimeSensitivityPanel: React.FC<TimeSensitivityPanelProps> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const [minutes, setMinutes] = useState(5);

  const report = useMemo(() => {
    try {
      return assessTimeSensitivity(
        {
          year: b.year, month: b.month, day: b.day,
          hour: b.hour, minute: b.minute, second: b.second,
          latitude: b.latitude, longitude: b.longitude,
          timezoneOffsetHours: b.timezoneOffsetHours,
          locationName: b.locationName,
          ayanamshaType: (chart.meta as any).ayanamshaType,
          nodeType: 'mean',
        } as any,
        minutes
      );
    } catch (e) {
      console.warn('Time sensitivity failed', e);
      return null;
    }
  }, [chart, b, minutes]);

  if (!report) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Sensitivity could not be assessed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Birth-Time Sensitivity</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          The chart is recomputed at the recorded time and at the same time ± your stated
          uncertainty. Every row below is a real comparison, not an estimate. A birth time rounded
          to the nearest five minutes moves the ascendant about a degree, which is enough to change
          a navāṃśa.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-3 flex-wrap">
        <label htmlFor="ts-min" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Recorded time ±
        </label>
        <input
          id="ts-min"
          type="number"
          min={1}
          max={120}
          value={minutes}
          onChange={(e) => setMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 5)))}
          className="w-20 px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
        />
        <span className="text-xs text-slate-500">minutes</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-semibold ${report.isStable ? 'text-emerald-700' : 'text-[#8C2D19]'}`}>
          {report.isStable
            ? <><CheckCircle2 className="w-4 h-4" /> stable</>
            : <><AlertTriangle className="w-4 h-4" /> {report.unstable.length} output{report.unstable.length === 1 ? '' : 's'} move</>}
        </span>
      </div>

      {/* distance to the next boundary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Lagna sign changes in</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {report.minutesToLagnaChange != null ? `${report.minutesToLagnaChange} min` : '—'}
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Moon nakṣatra changes in</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {report.minutesToNakshatraChange != null
              ? `${Math.round(report.minutesToNakshatraChange / 60)} h`
              : '—'}
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Daśā balance shift</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {report.dashaBalanceShiftYears < 1
              ? `${Math.round(report.dashaBalanceShiftYears * 365)} days`
              : `${report.dashaBalanceShiftYears.toFixed(2)} y`}
          </div>
        </div>
      </div>

      {/* what moves */}
      {report.unstable.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Outputs that move across ±{report.uncertaintyMinutes} minutes
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Output</th>
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">−{report.uncertaintyMinutes} min</th>
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Recorded</th>
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">+{report.uncertaintyMinutes} min</th>
              </tr>
            </thead>
            <tbody>
              {report.unstable.map((u) => (
                <tr key={u.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-700">{u.label}</td>
                  <td className="py-1.5 text-slate-500">{u.atMinus}</td>
                  <td className="py-1.5 font-semibold text-slate-900">{u.atRecorded}</td>
                  <td className="py-1.5 text-slate-500">{u.atPlus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* what holds */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
          Outputs that hold
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {report.stable.map((s) => (
            <span key={s} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The lagna advances about 15° an hour, so a five-minute uncertainty is about 1.25°; a
          navāṃśa is 3°20′, which is why a chart can be stable in D-1 and move in D-9 at the same
          uncertainty. The Moon moves far slower and rarely moves a nakṣatra within minutes. If an
          output you rely on appears above, the birth time needs rectifying before that reading can
          be trusted.
        </p>
      </div>
    </div>
  );
};
