'use client';

/**
 * KP — the workspace.
 *
 * One card holding the whole KP layer: cusps, significators, ruling planets,
 * the cuspal sub-lord promise, interlinks and timing. It takes the chart the
 * engine already built, so there is no birth-data form here — open the tab and
 * the KP reading is there.
 *
 * KP is a separate framework from the Parāśarī readings elsewhere: Placidus
 * cusps and nakṣatra sub-division. It is kept in its own card on its own terms.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import {
  calculateKpLayer, KP_MATTERS,
  type KpLayer,
} from '@/lib/kp';
import { Info, Compass, ListOrdered, Target, Link2, Clock } from 'lucide-react';

interface KPPanelProps {
  chart: JyotishaChart;
}

const PROMISE_INK: Record<string, string> = {
  promised: 'text-emerald-700',
  'promised-when-direct': 'text-amber-700',
  denied: 'text-[#8C2D19]',
  mixed: 'text-amber-600',
  undetermined: 'text-slate-500',
};

type Tab = 'cusps' | 'significators' | 'ruling' | 'promise' | 'links';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'cusps', label: 'Cusps & Sub-lords', icon: Compass },
  { id: 'significators', label: 'Significators', icon: ListOrdered },
  { id: 'ruling', label: 'Ruling Planets', icon: Target },
  { id: 'promise', label: 'Promise', icon: Target },
  { id: 'links', label: 'Interlinks & Timing', icon: Link2 },
];

export const KPPanel: React.FC<KPPanelProps> = ({ chart }) => {
  const [tab, setTab] = useState<Tab>('cusps');
  const [house, setHouse] = useState(7);
  const [matter, setMatter] = useState<string>('marriage');

  const kp: KpLayer | null = useMemo(() => {
    try {
      return calculateKpLayer(chart);
    } catch (e) {
      console.warn('KP layer failed', e);
      return null;
    }
  }, [chart]);

  if (!kp) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-sm text-slate-500">
        The KP layer could not be computed for this chart.
      </div>
    );
  }

  const sig = kp.significators[house];
  const promise = kp.promises[matter];
  const timing = kp.timing[matter];

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">
            KP — Krishnamurti Paddhati
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Placidus cusps and nakṣatra sub-division. A separate framework from the Parāśarī
          readings — read it on its own terms. Everything here is derived from the chart already
          loaded, so nothing needs entering again.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            12 cusps
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {kp.ruling.workingSet.length} ruling planets
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {kp.interlinks.length} interlinks
          </span>
          {kp.nodeAgents.length > 0 && (
            <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
              nodes as agents: {kp.nodeAgents.map((n) => `${n.node}→${n.agentOf}`).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => {
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

      {/* cusps */}
      {tab === 'cusps' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Placidus cusps with their four KP lords
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                {['House', 'Cusp', 'Rāśi', 'Sign lord', 'Star lord', 'Sub lord', 'Sub-sub', 'Occupants', 'Fertility'].map((h) => (
                  <th key={h} className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kp.cusps.map((c) => (
                <tr key={c.house} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 font-mono text-slate-500">{c.house}</td>
                  <td className="py-1.5 font-mono tabular-nums text-slate-700">{c.longitude.toFixed(2)}°</td>
                  <td className="py-1.5 text-slate-600">{c.rashiName}</td>
                  <td className="py-1.5 text-slate-600 capitalize">{c.lords.signLord}</td>
                  <td className="py-1.5 text-slate-600 capitalize">{c.lords.starLord}</td>
                  <td className="py-1.5 font-semibold text-[#8C2D19] capitalize">{c.lords.subLord}</td>
                  <td className="py-1.5 text-slate-500 capitalize">{c.lords.subSubLord}</td>
                  <td className="py-1.5 text-slate-500 capitalize">{c.occupants.join(', ') || '—'}</td>
                  <td className="py-1.5 text-[10px] text-slate-400">{kp.fertility[c.house]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* significators */}
      {tab === 'significators' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <label htmlFor="kph" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">House</label>
            <select id="kph" value={house} onChange={(e) => setHouse(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>House {h}</option>
              ))}
            </select>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {sig.levels.map((l) => (
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
          {sig.rejectedRetrograde.length > 0 && (
            <p className="text-[10px] text-amber-700 mt-2">
              Rejected (sitting in a retrograde planet&rsquo;s star): {sig.rejectedRetrograde.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* ruling planets */}
      {tab === 'ruling' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Ruling planets of the birth moment
          </h3>
          <table className="w-full text-xs">
            <tbody>
              {kp.ruling.planets.map((p) => (
                <tr key={p.role} className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">{p.role}</td>
                  <td className="py-1.5 text-right font-semibold text-slate-800">{p.planetName}</td>
                </tr>
              ))}
              {kp.ruling.nodeAgents.map((p) => (
                <tr key={p.role + p.planet} className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">{p.role}</td>
                  <td className="py-1.5 text-right font-semibold text-slate-800">{p.planetName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {kp.ruling.omittedRetrograde.length > 0 && (
            <p className="text-[10px] text-amber-700 mt-2">
              Omitted (in a retrograde planet&rsquo;s star or sub): {kp.ruling.omittedRetrograde.join(', ')}
            </p>
          )}
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Working set: {kp.ruling.workingSet.map((p) => p.planetName).join(', ') || 'none'}
          </p>
        </div>
      )}

      {/* promise */}
      {tab === 'promise' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <label htmlFor="kpm" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Matter</label>
            <select id="kpm" value={matter} onChange={(e) => setMatter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
              {Object.entries(KP_MATTERS).map(([k, m]) => (
                <option key={k} value={k}>{m.label}</option>
              ))}
            </select>
          </div>
          {promise ? (
            <>
              <div className={`text-sm font-serif font-bold mb-2 ${PROMISE_INK[promise.promise]}`}>
                {promise.promise.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{promise.reading}</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Cusp {promise.house} sub lord</td>
                    <td className="py-1.5 text-right text-slate-800">{promise.subLordName}{promise.subLordRetrograde ? ' (retrograde)' : ''}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Signifies houses</td>
                    <td className="py-1.5 text-right font-mono text-slate-700">{promise.signifies.join(', ')}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-500">Matter / detrimental</td>
                    <td className="py-1.5 text-right font-mono text-slate-700">{promise.matterHouses.join(', ')} / {promise.detrimentalHouses.join(', ')}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500">Cusp fertility</td>
                    <td className="py-1.5 text-right text-slate-700">{promise.fertility}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-xs text-slate-400">No reading for this matter.</p>
          )}
        </div>
      )}

      {/* interlinks & timing */}
      {tab === 'links' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#8C2D19]" /> Cuspal interlinks
            </h3>
            {kp.interlinks.length === 0 ? (
              <p className="text-xs text-slate-400">No interlinks in this chart.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['From house', 'Sub lord', 'Links into', 'Cusp lord'].map((h) => (
                      <th key={h} className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kp.interlinks.map((l, i) => (
                    <tr key={`${l.fromHouse}-${l.intoHouse}-${i}`} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 font-mono text-slate-600">{l.fromHouse}</td>
                      <td className="py-1.5 text-slate-700">{l.fromSubLordName}</td>
                      <td className="py-1.5 font-mono text-slate-600">house {l.intoHouse}</td>
                      <td className="py-1.5 text-slate-500 capitalize">{l.intoCuspLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8C2D19]" /> Timing — ruling planets against the daśā
            </h3>
            {timing?.current ? (
              <>
                <p className="text-xs text-slate-600 mb-2">
                  Running: <span className="font-semibold">{timing.current.lordName}</span> mahādaśā,{' '}
                  {timing.current.from} → {timing.current.to}
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Ruling planet: {timing.current.isRulingPlanet ? 'yes' : 'no'} · Significator of house {house}:{' '}
                  {timing.current.isSignificator ? 'yes' : 'no'}
                </p>
                {timing.ripeWindows.length > 0 && (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Level', 'Lord', 'From', 'To'].map((h) => (
                          <th key={h} className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timing.ripeWindows.map((w, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 text-slate-500">{w.level}</td>
                          <td className="py-1.5 text-slate-800">{w.lordName}</td>
                          <td className="py-1.5 font-mono text-slate-600">{w.from}</td>
                          <td className="py-1.5 font-mono text-slate-600">{w.to}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {timing.ripeWindows.length === 0 && (
                  <p className="text-xs text-slate-400">No period currently qualifies on both counts.</p>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">No daśā data available.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {tab === 'ruling' ? kp.ruling.note
            : tab === 'promise' ? 'The cuspal sub lord settles whether a matter is promised; everything else refines timing and texture. A retrograde sub lord defers the promise until it turns direct.'
            : tab === 'links' ? timing?.note ?? 'Cuspal interlinks chain one house to another through the star lords.'
            : 'Significators are ranked strongest first: a graha in the star of a house occupant outranks the occupant itself, which outranks a graha in the cusp lord\u2019s star, which outranks the cusp lord.'}
        </p>
      </div>
    </div>
  );
};
