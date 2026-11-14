'use client';

/**
 * KP — the workspace.
 *
 * A complete KP reading on one page: the Placidus cusps and their lord chains,
 * the four-level significators, the ruling planets of the moment, the cuspal
 * sub-lord promise for every matter, and the daśā windows that can deliver it.
 *
 * It reads the chart the engine already built, so there is no birth-data form —
 * open the tab and the reading is there. KP is a separate framework from the
 * Parāśarī panels: Placidus cusps and nakṣatra sub-division, judged on its own
 * terms.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateKpLayer, KP_MATTERS, type KpLayer } from '@/lib/kp';
import {
  Compass, ListOrdered, Target, ShieldCheck, Clock, Link2, Info, ChevronRight,
} from 'lucide-react';

interface KPPanelProps {
  chart: JyotishaChart;
}

type Tab = 'cusps' | 'significators' | 'ruling' | 'promise' | 'timing';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'cusps', label: 'Cusps', icon: Compass },
  { id: 'significators', label: 'Significators', icon: ListOrdered },
  { id: 'ruling', label: 'Ruling Planets', icon: Target },
  { id: 'promise', label: 'Promise', icon: ShieldCheck },
  { id: 'timing', label: 'Timing', icon: Clock },
];

const TONE: Record<string, { text: string; bg: string; border: string }> = {
  promised: { text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'promised-when-direct': { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  mixed: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  denied: { text: 'text-[#8C2D19]', bg: 'bg-[#8C2D19]/5', border: 'border-[#8C2D19]/20' },
  undetermined: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

const PROMISE_LABEL: Record<string, string> = {
  promised: 'Promised',
  'promised-when-direct': 'Promised, when direct',
  mixed: 'Both results',
  denied: 'Not promised',
  undetermined: 'Silent',
};

/** A thin bar showing where a cusp falls in its sign. */
const CuspBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
    <div className="h-full rounded-full bg-[#8C2D19]/70" style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
  </div>
);

export const KPPanel: React.FC<KPPanelProps> = ({ chart }) => {
  const [tab, setTab] = useState<Tab>('cusps');
  const [house, setHouse] = useState(7);
  const [matter, setMatter] = useState('marriage');

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
  const matterDef = KP_MATTERS[matter];

  const promiseCounts = Object.values(kp.promises).reduce(
    (acc: Record<string, number>, p: any) => {
      if (p) acc[p.promise] = (acc[p.promise] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#8C2D19]" />
                <h2 className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  KP · Krishnamurti Paddhati
                </h2>
              </div>
              <p className="font-serif text-lg text-slate-900 leading-snug">
                Placidus cusps, sub-lords and ruling planets
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-2xl leading-relaxed">
                A separate framework from the Parāśarī panels — a cusp is a calculated
                degree, and every nakṣatra is read through its star and sub lord. Derived
                entirely from the chart already loaded.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                ['12', 'cusps'],
                [String(kp.ruling.workingSet.length), 'ruling'],
                [String(kp.interlinks.length), 'interlinks'],
                [String(kp.nodeAgents.length), 'agents'],
              ].map(([n, l]) => (
                <div key={l} className="text-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="font-serif text-base text-slate-900 leading-none">{n}</div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* promise tally strip */}
        <div className="px-6 py-3 flex items-center gap-2 flex-wrap bg-slate-50/50">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mr-1">
            Matters
          </span>
          {Object.entries(promiseCounts).map(([k, n]) => (
            <span
              key={k}
              className={`text-[10px] px-2 py-0.5 rounded-md border ${TONE[k]?.bg ?? 'bg-slate-50'} ${TONE[k]?.border ?? 'border-slate-200'} ${TONE[k]?.text ?? 'text-slate-600'}`}
            >
              {PROMISE_LABEL[k] ?? k} · {n}
            </span>
          ))}
        </div>
      </div>

      {/* ── tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                active
                  ? 'bg-[#8C2D19] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── cusps ──────────────────────────────────────────────── */}
      {tab === 'cusps' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Placidus cusps · the four KP lords
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/60">
                  {['#', 'Cusp', 'Rāśi', 'Sign', 'Star', 'Sub', 'Sub-sub', 'Occupants', 'Fertility'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 font-mono text-[9px] uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kp.cusps.map((c) => (
                  <tr key={c.house} className="border-t border-slate-100 hover:bg-slate-50/40">
                    <td className="py-2 px-3 font-mono text-slate-400">{c.house}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-slate-700 w-14">
                          {c.longitude.toFixed(2)}°
                        </span>
                        <CuspBar pct={((c.longitude % 30) / 30) * 100} />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{c.rashiName}</td>
                    <td className="py-2 px-3 text-slate-600 capitalize">{c.lords.signLord}</td>
                    <td className="py-2 px-3 text-slate-600 capitalize">{c.lords.starLord}</td>
                    <td className="py-2 px-3 font-semibold text-[#8C2D19] capitalize">{c.lords.subLord}</td>
                    <td className="py-2 px-3 text-slate-400 capitalize">{c.lords.subSubLord}</td>
                    <td className="py-2 px-3 text-slate-500 capitalize">{c.occupants.join(', ') || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        kp.fertility[c.house] === 'fruitful' ? 'bg-emerald-50 text-emerald-700'
                          : kp.fertility[c.house] === 'semi-fruitful' ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {kp.fertility[c.house]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── significators ──────────────────────────────────────── */}
      {tab === 'significators' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Four-level significators
              </h3>
              <select
                aria-label="House"
                value={house}
                onChange={(e) => setHouse(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>House {h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {sig.levels.map((l) => (
                <div
                  key={l.level}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    l.level === 1 ? 'bg-[#8C2D19]/[0.04] border-[#8C2D19]/15'
                      : 'bg-slate-50/60 border-slate-200/70'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                    l.level === 1 ? 'bg-[#8C2D19] text-white' : 'bg-white border border-slate-200 text-slate-500'
                  }`}>
                    L{l.level}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-500">{l.rule}</div>
                    <div className="text-sm text-slate-900 mt-0.5">
                      {l.planetNames.length ? l.planetNames.join(', ') : <span className="text-slate-300">—</span>}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                    {l.level === 1 ? 'strongest' : l.level === 4 ? 'weakest' : ''}
                  </span>
                </div>
              ))}
            </div>

            {sig.nodeBorrowed.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Nodes acting as agents
                </div>
                {sig.nodeBorrowed.map((b) => (
                  <div key={b.node} className="text-[11px] text-slate-600">
                    <span className="capitalize font-semibold">{b.node}</span> represents{' '}
                    <span className="capitalize">{b.agentOf}</span> — carries houses{' '}
                    <span className="font-mono">{b.houses.join(', ') || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            {sig.rejectedRetrograde.length > 0 && (
              <p className="text-[10px] text-amber-700 mt-3">
                Rejected — sitting in a retrograde star (horary rule): {sig.rejectedRetrograde.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── ruling planets ─────────────────────────────────────── */}
      {tab === 'ruling' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Ruling planets of the moment
            </h3>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
              {kp.ruling.extended ? 'seven-planet set' : 'five-planet set'}
            </span>
          </div>
          <div className="p-5 space-y-1.5">
            {kp.ruling.planets.map((p, i) => (
              <div key={`${p.role}-${i}`} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-[9px] font-mono text-slate-300 w-4">{i + 1}</span>
                <span className="text-[11px] text-slate-500 flex-1">{p.role}</span>
                <span className="text-sm font-semibold text-slate-900 capitalize">{p.planetName}</span>
              </div>
            ))}
            {kp.ruling.nodeAgents.length > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                {kp.ruling.nodeAgents.map((p, i) => (
                  <div key={`n-${i}`} className="flex items-center gap-3 py-1">
                    <span className="text-[9px] font-mono text-slate-300 w-4">+</span>
                    <span className="text-[11px] text-slate-500 flex-1">{p.role}</span>
                    <span className="text-sm text-slate-700 capitalize">{p.planetName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100">
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Working set</div>
            <div className="text-xs text-slate-700 capitalize">
              {kp.ruling.workingSet.map((p) => p.planetName).join(' · ') || 'none'}
            </div>
            {kp.ruling.omittedRetrograde.length > 0 && (
              <p className="text-[10px] text-amber-700 mt-1">
                Omitted (retrograde star or sub, horary rule): {kp.ruling.omittedRetrograde.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── promise ────────────────────────────────────────────── */}
      {tab === 'promise' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Cuspal sub-lord promise
              </h3>
              <select
                aria-label="Matter"
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                {Object.entries(KP_MATTERS).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            </div>

            {promise ? (
              <>
                <div className={`rounded-xl border p-4 mb-4 ${TONE[promise.promise]?.bg} ${TONE[promise.promise]?.border}`}>
                  <div className={`font-serif text-base font-semibold ${TONE[promise.promise]?.text}`}>
                    {PROMISE_LABEL[promise.promise]}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{promise.reading}</p>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ['Cusp', `House ${promise.house}`],
                    ['Sub lord', `${promise.subLordName}${promise.subLordRetrograde ? ' (retrograde)' : ''}`],
                    ['Signifies', promise.signifies.join(', ') || '—'],
                    ['Matter houses', promise.matterHouses.join(', ')],
                    ['Detrimental', promise.detrimentalHouses.join(', ')],
                    ['Held', promise.hitsMatter.join(', ') || 'none'],
                    ['Cusp fertility', promise.fertility],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
                      <dd className="text-xs text-slate-800 mt-0.5 capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-xs text-slate-400">No reading for this matter.</p>
            )}
          </div>

          {/* all matters at a glance */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Every matter
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(kp.promises).map(([k, p]: any) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMatter(k)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-slate-50/60 ${k === matter ? 'bg-slate-50' : ''}`}
                >
                  <span className="text-xs text-slate-700 flex-1">{KP_MATTERS[k].label}</span>
                  <span className="text-[10px] font-mono text-slate-400 capitalize">
                    {p ? `${p.subLordName} · cusp ${p.house}` : '—'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border ${TONE[p?.promise]?.bg ?? 'bg-slate-50'} ${TONE[p?.promise]?.border ?? 'border-slate-200'} ${TONE[p?.promise]?.text ?? 'text-slate-500'}`}>
                    {p ? PROMISE_LABEL[p.promise] : '—'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── timing ─────────────────────────────────────────────── */}
      {tab === 'timing' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Daśā delivery
              </h3>
              <select
                aria-label="Matter for timing"
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                {Object.entries(KP_MATTERS).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              A period delivers only when the mahā, antara and pratyantara lords between them
              cover the whole house group — {matterDef.matter.join(', ')} — each supplying a
              different house.
            </p>

            {timing?.current ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 mb-4">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Running now
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {timing.current.lords.map((l, i) => (
                      <React.Fragment key={`${l.lord}-${i}`}>
                        {i > 0 && <span className="text-slate-300 text-xs">›</span>}
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border ${
                          l.covers.length ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {l.lordName}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Covers {timing.current.covered.join(', ') || 'none'}
                    {timing.current.missing.length > 0 && (
                      <> · missing <span className="text-[#8C2D19]">{timing.current.missing.join(', ')}</span></>
                    )}
                  </div>
                </div>

                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Delivering windows · {timing.windows.length}
                </div>
                {timing.windows.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No window in the current mahādaśā covers the whole group.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {timing.windows.map((w, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200/70 bg-white">
                        <span className="text-[10px] font-mono text-slate-500 w-40 shrink-0">
                          {w.from.slice(0, 10)} → {w.to.slice(0, 10)}
                        </span>
                        <span className="text-[11px] text-slate-700 flex-1 capitalize">
                          {w.lords.map((l) => l.lordName).join(' › ')}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 shrink-0">
                          {w.covered.join(',')}
                        </span>
                        {w.strong && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            RP
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">No daśā data available.</p>
            )}
          </div>

          {/* interlinks */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#8C2D19]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Cuspal interlinks · {kp.interlinks.length}
              </h3>
            </div>
            {kp.interlinks.length === 0 ? (
              <p className="px-5 py-4 text-xs text-slate-400">No interlinks in this chart.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {kp.interlinks.map((l, i) => (
                  <div key={i} className="px-5 py-2 flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-slate-400 w-6">H{l.fromHouse}</span>
                    <span className="text-slate-700 capitalize">{l.fromSubLordName}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="font-mono text-slate-500">house {l.intoHouse}</span>
                    <span className="text-slate-400 capitalize ml-auto">{l.intoCuspLord}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── footnote ───────────────────────────────────────────── */}
      <div className="flex gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-4">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {tab === 'ruling' ? kp.ruling.note
            : tab === 'timing' ? timing?.note ?? 'Cuspal interlinks chain one house to another through the star lords.'
              : tab === 'promise' ? 'The cuspal sub lord settles whether a matter is promised; everything else refines timing and texture. A birth chart gives retrogression no weight — that is a horary rule.'
                : tab === 'significators' ? 'Ranked strongest first: a graha in the star of a house occupant outranks the occupant itself, which outranks a graha in the cusp lord\u2019s star, which outranks the cusp lord.'
                  : 'Placidus cusps are calculated degrees, not sign boundaries — the whole sub-lord reading depends on them.'}
        </p>
      </div>
    </div>
  );
};
