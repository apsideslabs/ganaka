'use client';

/**
 * Gaṇaka — Reverse Pañcāṅga (chart finder).
 *
 * Search a span for a tithi, nakṣatra, yoga, vāra or rising sign. Used for
 * muhūrta selection and for rectifying a birth time against a known limb.
 */

import React, { useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { searchPanchanga, type PanchangaMatch, type PanchangaSearchCriteria } from '@/lib/jyotisha/reverse-panchanga';
import { RASHIS, NAKSHATRAS } from '@/lib/jyotisha/constants';
import { Search, Info, CalendarClock } from 'lucide-react';

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
  const [step, setStep] = useState('30');
  const [results, setResults] = useState<PanchangaMatch[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = () => {
    setBusy(true);
    setError('');
    try {
      const criteria: PanchangaSearchCriteria = {};
      if (tithi) criteria.tithi = Number(tithi);
      if (nakshatra) criteria.nakshatra = Number(nakshatra);
      if (vara !== '') criteria.vara = Number(vara);
      if (lagna) criteria.lagnaRashi = Number(lagna);

      if (Object.keys(criteria).length === 0) {
        setError('Choose at least one criterion to search on.');
        setResults(null);
        setBusy(false);
        return;
      }

      const [fy, fm, fd] = from.split('-').map(Number);
      const [ty, tm, td] = to.split('-').map(Number);
      const out = searchPanchanga(criteria, {
        from: { year: fy, month: fm, day: fd },
        to: { year: ty, month: tm, day: td },
        latitude: b.latitude,
        longitude: b.longitude,
        timezoneOffsetHours: b.timezoneOffsetHours,
        stepMinutes: Number(step) || 30,
        maxResults: 100,
      });
      setResults(out);
    } catch (e) {
      console.warn('Pañcāṅga search failed', e);
      setError('Search failed.');
      setResults(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Reverse Pañcāṅga — Chart Finder</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Find the moments in a span that carry a given tithi, nakṣatra, vāra or rising sign.
          Criteria left blank are not tested. Evaluated at the birth place.
        </p>
      </div>

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
          <div>
            <label className={label}>Step (min)</label>
            <input type="number" min={1} max={180} value={step} onChange={(e) => setStep(e.target.value)} className={field} />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="w-full px-3 py-1.5 rounded-lg bg-[#8C2D19] text-white text-xs font-semibold hover:bg-[#73240f] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {busy ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
        {error && <p className="text-[11px] text-[#8C2D19] mt-3">{error}</p>}
      </div>

      {results && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#8C2D19]" />
            {results.length} match{results.length === 1 ? '' : 'es'}
            {results.length >= 100 ? ' (capped at 100)' : ''}
          </h3>
          {results.length === 0 ? (
            <p className="text-xs text-slate-400">Nothing in this span carries that combination.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Date</th>
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Time</th>
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Tithi</th>
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Nakṣatra</th>
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Vāra</th>
                    <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Lagna</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((m, i) => (
                    <tr key={`${m.jd}-${i}`} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 font-mono tabular-nums text-slate-700">
                        {m.day}/{String(m.month).padStart(2, '0')}/{m.year}
                      </td>
                      <td className="py-1.5 font-mono tabular-nums text-slate-600">
                        {String(m.hour).padStart(2, '0')}:{String(m.minute).padStart(2, '0')}
                      </td>
                      <td className="py-1.5 text-slate-600">{m.tithiName}</td>
                      <td className="py-1.5 text-slate-600">{m.nakshatraName}</td>
                      <td className="py-1.5 text-slate-600">{m.varaName}</td>
                      <td className="py-1.5 text-slate-600">{m.lagnaName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The search samples at the step you set. The Moon covers a nakṣatra in about a day, so a
          30-minute step cannot miss one; the lagna changes sign every two hours, so tighten the
          step when a lagna match must be exact. A match is a sample that satisfies the criteria,
          not the start of the window — read it as the first sampled moment inside it.
        </p>
      </div>
    </div>
  );
};
