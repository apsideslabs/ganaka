'use client';

/**
 * Gaṇaka — the KP layer.
 *
 * Ruling planets of the moment, the four-level significators for a house, and
 * the sub-lord promise rule. KP is a separate framework — Placidus cusps and
 * nakṣatra sub-division — and is kept in its own card rather than mixed into the
 * Parāśarī judgements.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import {
  calculateRulingPlanets, calculateSignificators, evaluateCuspPromise, KP_MATTERS,
} from '@/lib/jyotisha/kp';
import { Info, Compass, ListOrdered, Target } from 'lucide-react';

interface KPPanelProps {
  chart: JyotishaChart;
}

const PROMISE_STYLE: Record<string, string> = {
  promised: 'text-emerald-700',
  denied: 'text-[#8C2D19]',
  mixed: 'text-amber-700',
  undetermined: 'text-slate-500',
};

export const KPPanel: React.FC<KPPanelProps> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const [tab, setTab] = useState<'ruling' | 'significators' | 'promise'>('ruling');
  const [house, setHouse] = useState(7);
  const [matter, setMatter] = useState<keyof typeof KP_MATTERS>('marriage');

  const ruling = useMemo(() => {
    try {
      return calculateRulingPlanets(
        new Date(), b.latitude, b.longitude, b.timezoneOffsetHours,
        (chart.meta as any).ayanamshaType
      );
    } catch (e) {
      console.warn('KP ruling planets failed', e);
      return null;
    }
  }, [b, chart]);

  const sigs = useMemo(() => {
    try { return calculateSignificators(chart, house); } catch { return []; }
  }, [chart, house]);

  const promise = useMemo(() => {
    try {
      const m = KP_MATTERS[matter];
      return evaluateCuspPromise(chart, house, m.matter, m.detrimental);
    } catch { return null; }
  }, [chart, house, matter]);

  const tabs = [
    { id: 'ruling' as const, label: 'Ruling Planets', icon: Compass },
    { id: 'significators' as const, label: 'Significators', icon: ListOrdered },
    { id: 'promise' as const, label: 'Cusp Promise', icon: Target },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">KP — Krishnamurti Paddhati</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Placidus cusps and nakṣatra sub-division. A separate framework from the Parāśarī
          judgements — read it on its own terms rather than mixing the two.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                active ? 'bg-[#8C2D19] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'ruling' && ruling && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Ruling planets of the moment
          </h3>
          <table className="w-full text-xs">
            <tbody>
              {ruling.planets.map((p) => (
                <tr key={p.role} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-500">{p.role}</td>
                  <td className="py-1.5 text-right font-semibold text-slate-800">{p.planetName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            {ruling.distinct.length} distinct grahas
          </p>
        </div>
      )}

      {tab === 'significators' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <label htmlFor="kph" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">House</label>
            <select
              id="kph"
              value={house}
              onChange={(e) => setHouse(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>House {h}</option>
              ))}
            </select>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {sigs.map((l) => (
                <tr key={l.level} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-mono text-[10px] text-slate-400 w-8">L{l.level}</td>
                  <td className="py-2 text-slate-600">{l.rule}</td>
                  <td className="py-2 text-right text-slate-800">
                    {l.planetNames.join(', ') || <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'promise' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <select
              value={house}
              onChange={(e) => setHouse(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>House {h}</option>
              ))}
            </select>
            <select
              value={matter}
              onChange={(e) => setMatter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {Object.entries(KP_MATTERS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          {promise ? (
            <>
              <div className={`text-sm font-serif font-bold mb-2 ${PROMISE_STYLE[promise.promise]}`}>
                {promise.promise.charAt(0).toUpperCase() + promise.promise.slice(1)}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{promise.reading}</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Sub lord</td>
                    <td className="py-1.5 text-right text-slate-800">{promise.subLordName}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Signifies houses</td>
                    <td className="py-1.5 text-right font-mono text-slate-700">{promise.signifies.join(', ')}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Matter houses</td>
                    <td className="py-1.5 text-right font-mono text-slate-700">{promise.matterHouses.join(', ')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500">Detrimental houses</td>
                    <td className="py-1.5 text-right font-mono text-slate-700">{promise.detrimentalHouses.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-xs text-slate-400">No cusp reading available for this house.</p>
          )}
        </div>
      )}

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {tab === 'ruling'
            ? ruling?.note
            : tab === 'significators'
            ? 'A graha can appear at more than one level; the strongest level it reaches is the one that counts.'
            : 'If the sub lord of the cusp signifies the matter’s house group it fructifies; if it signifies only the detrimental houses it does not; if both, the native gets both results in different periods.'}
        </p>
      </div>
    </div>
  );
};
