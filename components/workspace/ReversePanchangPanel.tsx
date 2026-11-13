'use client';

/**
 * Gaṇaka — Reverse Pañcāṅga (chart finder).
 *
 * Search a span for a tithi, nakṣatra, yoga, vāra or rising sign. The scan runs
 * in chunks so it can show its progress; results come back as windows with an
 * exact opening and closing instant, drawn on a timeline of the range.
 */

import React, { useCallback, useRef, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import {
  searchPanchangaAsync, hasCriteria,
  type PanchangaWindow, type PanchangaSearchCriteria, type SearchProgress,
} from '@/lib/jyotisha/reverse-panchanga';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { RASHIS, NAKSHATRAS } from '@/lib/jyotisha/constants';
import { Search, Info, CalendarClock, Radar } from 'lucide-react';

interface ReversePanchangPanelProps {
  chart: JyotishaChart;
}

const VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const field = 'w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40';
const label = 'block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1';

export const ReversePanchangPanel: React.FC<ReversePanchangPanelProps> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [from, setFrom] = useState(iso(today));
  const [to, setTo] = useState(iso(new Date(today.getTime() + 30 * 864e5)));
  const [tithi, setTithi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [vara, setVara] = useState('');
  const [lagna, setLagna] = useState('');

  const [results, setResults] = useState<PanchangaWindow[] | null>(null);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rangeJD, setRangeJD] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');
  const runId = useRef(0);

  const run = useCallback(async () => {
    const criteria: PanchangaSearchCriteria = {};
    if (tithi) criteria.tithi = Number(tithi);
    if (nakshatra) criteria.nakshatra = Number(nakshatra);
    if (vara !== '') criteria.vara = Number(vara);
    if (lagna) criteria.lagnaRashi = Number(lagna);

    if (!hasCriteria(criteria)) {
      setError('Choose at least one criterion to search on.');
      setResults(null);
      return;
    }

    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    if (!fy || !ty) {
      setError('Pick a start and end date.');
      return;
    }

    const myRun = ++runId.current;
    const cancel = { cancelled: false };
    setBusy(true);
    setError('');
    setResults(null);
    setProgress({ percent: 0, done: 0, total: 0, found: 0, scanning: '' });

    const tz = b.timezoneOffsetHours;
    setRangeJD([
      calculateJulianDay(fy, fm, fd, 0, 0, 0) - tz / 24,
      calculateJulianDay(ty, tm, td, 23, 59, 59) - tz / 24,
    ]);

    const t0 = performance.now();
    try {
      const out = await searchPanchangaAsync(
        criteria,
        {
          from: { year: fy, month: fm, day: fd },
          to: { year: ty, month: tm, day: td },
          latitude: b.latitude,
          longitude: b.longitude,
          timezoneOffsetHours: tz,
          maxResults: 60,
        },
        (p) => { if (runId.current === myRun) setProgress(p); },
        cancel
      );
      if (runId.current !== myRun) return;
      setResults(out);
      setElapsed(performance.now() - t0);
    } catch (e) {
      console.warn('Pañcāṅga search failed', e);
      if (runId.current === myRun) setError('Search failed.');
    } finally {
      if (runId.current === myRun) {
        setBusy(false);
        setProgress(null);
      }
    }
  }, [tithi, nakshatra, vara, lagna, from, to, b]);

  const rangeStart = rangeJD?.[0] ?? 0;
  const rangeSpan = rangeJD ? Math.max(1e-9, rangeJD[1] - rangeJD[0]) : 1;
  const pct = (jd: number) => Math.max(0, Math.min(100, ((jd - rangeStart) / rangeSpan) * 100));

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Reverse Pañcāṅga — Chart Finder</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Find when a tithi, nakṣatra, vāra or rising sign occurs in a span. Criteria left blank
          are not tested. Results are windows with exact opening and closing instants.
        </p>
      </div>

      {/* criteria */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className={label}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label}>Tithi (1–30)</label>
            <input type="number" min={1} max={30} value={tithi} onChange={(e) => setTithi(e.target.value)} placeholder="any" className={field} />
          </div>
          <div>
            <label className={label}>Nakṣatra</label>
            <select value={nakshatra} onChange={(e) => setNakshatra(e.target.value)} className={field}>
              <option value="">any</option>
              {NAKSHATRAS.slice(0, 27).map((n: any, i: number) => (
                <option key={n.name} value={i + 1}>{i + 1}. {n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Vāra</label>
            <select value={vara} onChange={(e) => setVara(e.target.value)} className={field}>
              <option value="">any</option>
              {VARAS.map((v, i) => <option key={v} value={i}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Lagna</label>
            <select value={lagna} onChange={(e) => setLagna(e.target.value)} className={field}>
              <option value="">any</option>
              {Object.entries(RASHIS).map(([k, v]: any) => (
                <option key={k} value={k}>{k}. {v.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="w-full px-3 py-1.5 rounded-lg bg-[#8C2D19] text-white text-xs font-semibold hover:bg-[#73240f] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <Search className={`w-3.5 h-3.5 ${busy ? 'animate-pulse' : ''}`} />
              {busy ? 'Scanning…' : 'Search'}
            </button>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#8C2D19] mt-3">{error}</p>}
      </div>

      {/* live scan */}
      {busy && progress && (
        <div className="bg-white border border-[#8C2D19]/30 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8C2D19]">
              <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '2.4s' }} />
              Scanning
            </span>
            <span className="text-[10px] font-mono tabular-nums text-slate-500">
              {progress.percent}% · {progress.done}/{progress.total} samples · {progress.found} found
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#8C2D19] transition-all duration-150 ease-out"
              style={{ width: `${Math.max(2, progress.percent)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] font-mono text-slate-400">
            {progress.scanning ? `at ${progress.scanning}` : 'finishing…'}
          </p>
        </div>
      )}

      {/* results */}
      {results && (
        <>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-[#8C2D19]" />
              {results.length} window{results.length === 1 ? '' : 's'}
              <span className="text-slate-300 normal-case tracking-normal font-normal">
                · scanned in {elapsed < 1000 ? `${Math.round(elapsed)} ms` : `${(elapsed / 1000).toFixed(1)} s`}
              </span>
            </h3>

            {results.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nothing in this span carries that combination. Widen the range or relax a criterion.
              </p>
            ) : (
              <>
                {/* timeline */}
                <div className="mb-4">
                  <div className="relative h-6 w-full rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                    {results.map((w, i) => (
                      <div
                        key={`tl-${i}`}
                        className="absolute top-0 bottom-0 bg-[#8C2D19]/75 hover:bg-[#8C2D19] transition-colors"
                        style={{ left: `${pct(w.startJD)}%`, width: `${Math.max(0.4, pct(w.endJD) - pct(w.startJD))}%` }}
                        title={w.label}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-400">
                    <span>{from}</span>
                    <span>each bar is one window</span>
                    <span>{to}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">#</th>
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Window</th>
                        <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Length</th>
                        <th className="text-left py-2 pl-4 font-mono text-[9px] uppercase tracking-wider text-slate-400">Tithi</th>
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Nakṣatra</th>
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Vāra</th>
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Lagna</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((m, i) => (
                        <tr key={`${m.startJD}-${i}`} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 font-mono tabular-nums text-slate-400">{i + 1}</td>
                          <td className="py-1.5 font-mono tabular-nums text-slate-700 whitespace-nowrap">{m.label}</td>
                          <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">
                            {m.hours >= 1 ? `${m.hours.toFixed(1)}h` : `${Math.round(m.hours * 60)}m`}
                          </td>
                          <td className="py-1.5 pl-4 text-slate-600">{m.tithiName}</td>
                          <td className="py-1.5 text-slate-600">{m.nakshatraName}</td>
                          <td className="py-1.5 text-slate-600">{m.varaName}</td>
                          <td className="py-1.5 text-slate-600">{m.lagnaName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Each result is a window with an exact opening and closing instant, found by bisecting
          where the limb changes — not a sampled instant that happened to match. The Moon holds a
          nakṣatra for about a day, so a two-hour scan cannot miss one; a lagna search tightens to
          ten minutes because the rising sign changes every two hours. The scan yields between
          chunks, so the progress bar reflects real work rather than a timer. Results are capped at
          60 windows.
        </p>
      </div>
    </div>
  );
};
