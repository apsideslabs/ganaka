'use client';

/**
 * KP — the workspace.
 *
 * A complete KP reading on one page: the Placidus cuspal chart, the twelve cusps
 * and their lord chains, the graha table, the four-level significators, the
 * ruling planets, the cuspal sub-lord promise for every matter, the daśā windows
 * that can deliver it, and the Viṃśottarī table.
 *
 * Type scale: body 13–14px, table cells 13px, section labels 11px mono. The
 * first version set everything at 9–11px, which made a dense reading unreadable.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateKpLayer, KP_MATTERS, type KpLayer } from '@/lib/kp';
import { fourStepCheck, type FourStepResult } from '@/lib/kp/four-step';
import { calculateKpAspects } from '@/lib/kp/aspects';
import { housesSignified } from '@/lib/kp/significators';
import {
  Compass, ListOrdered, Target, ShieldCheck, Clock, Link2, Info, ChevronRight,
  Orbit, CalendarRange, ListChecks, Zap,
} from 'lucide-react';
import { KpChart } from './kp/KpChart';
import { KpMark } from './kp/KpMark';

interface KPPanelProps {
  chart: JyotishaChart;
}

type Tab = 'chart' | 'cusps' | 'planets' | 'significators' | 'ruling' | 'promise' | 'timing' | 'dasha' | 'fourstep' | 'aspects';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'chart', label: 'Chart', icon: Orbit },
  { id: 'cusps', label: 'Cusps', icon: Compass },
  { id: 'planets', label: 'Grahas', icon: ListOrdered },
  { id: 'significators', label: 'Significators', icon: ListOrdered },
  { id: 'ruling', label: 'Ruling Planets', icon: Target },
  { id: 'promise', label: 'Promise', icon: ShieldCheck },
  { id: 'timing', label: 'Timing', icon: Clock },
  { id: 'fourstep', label: '4-Step Check', icon: ListChecks },
  { id: 'aspects', label: 'Aspects', icon: Zap },
  { id: 'dasha', label: 'Daśā', icon: CalendarRange },
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

/** A section header used above every block. */
const SectionHead: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="flex items-baseline justify-between gap-4 mb-4">
    <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-slate-500 font-semibold">
      {children}
    </h3>
    {right}
  </div>
);

/** A table cell that reads at a glance. */
const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`text-left py-2.5 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap ${className}`}>
    {children}
  </th>
);

export const KPPanel: React.FC<KPPanelProps> = ({ chart }) => {
  const [tab, setTab] = useState<Tab>('chart');
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
  const fourStep: FourStepResult | null = fourStepCheck(chart, kp, matter);
  const aspects = useMemo(
    () => calculateKpAspects(chart, kp.cusps, (id) => housesSignified(chart, kp.cusps, id)),
    [chart, kp]
  );

  const promiseCounts = Object.values(kp.promises).reduce(
    (acc: Record<string, number>, p: any) => {
      if (p) acc[p.promise] = (acc[p.promise] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-5">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-7 pt-6 pb-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <KpMark size={26} className="text-[#8C2D19]" />
                <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500 font-semibold">
                  KP · Krishnamurti Paddhati
                </h2>
              </div>
              <p className="font-serif text-2xl text-slate-900 leading-tight">
                Placidus cusps, sub-lords and ruling planets
              </p>
              <p className="text-[13px] text-slate-500 mt-2 max-w-2xl leading-relaxed">
                A separate framework from the Parāśarī panels — a cusp is a calculated degree,
                and every nakṣatra is read through its star and sub lord. Derived entirely from
                the chart already loaded.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {[
                ['12', 'cusps'],
                [String(kp.ruling.workingSet.length), 'ruling'],
                [String(kp.interlinks.length), 'links'],
                [String(kp.planets.length), 'grahas'],
              ].map(([n, l]) => (
                <div key={l} className="text-center px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[68px]">
                  <div className="font-serif text-xl text-slate-900 leading-none">{n}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-7 py-3 flex items-center gap-2 flex-wrap bg-slate-50/60 border-t border-slate-100">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">Matters</span>
          {Object.entries(promiseCounts).map(([k, n]) => (
            <span key={k} className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${TONE[k]?.bg ?? 'bg-slate-50'} ${TONE[k]?.border ?? 'border-slate-200'} ${TONE[k]?.text ?? 'text-slate-600'}`}>
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
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all ${
                active
                  ? 'bg-[#8C2D19] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── chart ──────────────────────────────────────────────── */}
      {tab === 'chart' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead right={
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                ascendant at 9 o&rsquo;clock · houses unequal
              </span>
            }>
              Placidus cusp chart
            </SectionHead>
          </div>
          <div className="p-7">
            <KpChart cusps={kp.cusps} planets={kp.planets} size={600} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 mt-7 pt-6 border-t border-slate-100">
              {kp.planets.map((p) => (
                <div key={p.id} className="text-[13px] text-slate-600 flex items-baseline gap-1.5">
                  <span className="font-semibold text-[#8C2D19] w-16 shrink-0">{p.name.split(' ')[0]}</span>
                  <span className="text-slate-500">{p.rashiName} {p.degreeInRashi.toFixed(1)}°</span>
                  <span className="font-mono text-[11px] text-slate-400">H{p.house} · {p.subLord}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── cusps ──────────────────────────────────────────────── */}
      {tab === 'cusps' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead>Placidus cusps · the four KP lords</SectionHead>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50/70">
                  <Th>#</Th><Th>Cusp</Th><Th>Rāśi</Th><Th>Sign</Th><Th>Star</Th>
                  <Th>Sub</Th><Th>Sub-sub</Th><Th>Occupants</Th><Th>Fertility</Th>
                </tr>
              </thead>
              <tbody>
                {kp.cusps.map((c) => (
                  <tr key={c.house} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{c.house}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono tabular-nums text-slate-700 w-16">{c.longitude.toFixed(2)}°</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#8C2D19]/70" style={{ width: `${Math.max(3, (c.longitude % 30) / 30 * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{c.rashiName}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize">{c.lords.signLord}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize">{c.lords.starLord}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#8C2D19] capitalize">{c.lords.subLord}</td>
                    <td className="py-2.5 px-3 text-slate-400 capitalize">{c.lords.subSubLord}</td>
                    <td className="py-2.5 px-3 text-slate-500 capitalize">{c.occupants.join(', ') || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                        kp.fertility[c.house] === 'fruitful' ? 'bg-emerald-50 text-emerald-700'
                          : kp.fertility[c.house] === 'semi-fruitful' ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>{kp.fertility[c.house]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── grahas ─────────────────────────────────────────────── */}
      {tab === 'planets' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead>Grahas · the four lords of each degree</SectionHead>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50/70">
                  <Th>Graha</Th><Th>Long.</Th><Th>Rāśi</Th><Th>Deg</Th><Th>H</Th>
                  <Th>Nakṣatra</Th><Th>Pd</Th><Th>Sign</Th><Th>Star</Th><Th>Sub</Th><Th>Sig.</Th>
                </tr>
              </thead>
              <tbody>
                {kp.planets.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {p.name.split(' ')[0]}
                      {p.retrograde && <span className="text-slate-400 text-[11px] ml-1.5 font-mono">R</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">{p.longitude.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{p.rashiName}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">{p.degreeInRashi.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.house}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{p.nakshatra}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.pada}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize">{p.signLord}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize">{p.starLord}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#8C2D19] capitalize">{p.subLord}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.signifies.join(',')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
            <p className="text-[12px] text-slate-500 leading-relaxed">
              H is the Placidus house whose arc holds the graha, which need not match its sign —
              that mismatch is what the cuspal reading turns on.
            </p>
          </div>
        </div>
      )}

      {/* ── significators ──────────────────────────────────────── */}
      {tab === 'significators' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
          <SectionHead right={
            <select aria-label="House" value={house} onChange={(e) => setHouse(Number(e.target.value))}
              className="px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-700">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>House {h}</option>
              ))}
            </select>
          }>
            Four-level significators
          </SectionHead>

          <div className="space-y-3">
            {sig.levels.map((l) => (
              <div key={l.level}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  l.level === 1 ? 'bg-[#8C2D19]/[0.045] border-[#8C2D19]/20' : 'bg-slate-50/70 border-slate-200/70'
                }`}>
                <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold ${
                  l.level === 1 ? 'bg-[#8C2D19] text-white' : 'bg-white border border-slate-200 text-slate-500'
                }`}>L{l.level}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] text-slate-500">{l.rule}</div>
                  <div className="text-[15px] text-slate-900 mt-1">
                    {l.planetNames.length ? l.planetNames.join(', ') : <span className="text-slate-300">—</span>}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0 pt-1">
                  {l.level === 1 ? 'strongest' : l.level === 4 ? 'weakest' : ''}
                </span>
              </div>
            ))}
          </div>

          {sig.nodeBorrowed.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">Nodes acting as agents</div>
              {sig.nodeBorrowed.map((b) => (
                <div key={b.node} className="text-[13px] text-slate-600 mb-1">
                  <span className="capitalize font-semibold text-slate-800">{b.node}</span> represents{' '}
                  <span className="capitalize">{b.agentOf}</span> — carries houses{' '}
                  <span className="font-mono text-slate-700">{b.houses.join(', ') || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ruling planets ─────────────────────────────────────── */}
      {tab === 'ruling' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead right={
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {kp.ruling.extended ? 'seven-planet set' : 'five-planet set'}
              </span>
            }>Ruling planets of the moment</SectionHead>
          </div>
          <div className="p-7 space-y-2">
            {kp.ruling.planets.map((p, i) => (
              <div key={`${p.role}-${i}`} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                <span className="text-[11px] font-mono text-slate-300 w-5">{i + 1}</span>
                <span className="text-[13px] text-slate-600 flex-1">{p.role}</span>
                <span className="text-[15px] font-semibold text-slate-900 capitalize">{p.planetName}</span>
              </div>
            ))}
            {kp.ruling.nodeAgents.map((p, i) => (
              <div key={`n-${i}`} className="flex items-center gap-4 py-2">
                <span className="text-[11px] font-mono text-slate-300 w-5">+</span>
                <span className="text-[13px] text-slate-500 flex-1">{p.role}</span>
                <span className="text-[15px] text-slate-700 capitalize">{p.planetName}</span>
              </div>
            ))}
          </div>
          <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Working set</div>
            <div className="text-[14px] text-slate-800 capitalize">
              {kp.ruling.workingSet.map((p) => p.planetName).join(' · ') || 'none'}
            </div>
          </div>
        </div>
      )}

      {/* ── promise ────────────────────────────────────────────── */}
      {tab === 'promise' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <SectionHead right={
              <select aria-label="Matter" value={matter} onChange={(e) => setMatter(e.target.value)}
                className="px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-700">
                {Object.entries(KP_MATTERS).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            }>Cuspal sub-lord promise</SectionHead>

            {promise ? (
              <>
                <div className={`rounded-xl border p-5 mb-6 ${TONE[promise.promise]?.bg} ${TONE[promise.promise]?.border}`}>
                  <div className={`font-serif text-xl font-semibold ${TONE[promise.promise]?.text}`}>
                    {PROMISE_LABEL[promise.promise]}
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-2">{promise.reading}</p>
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
                  {[
                    ['Cusp', `House ${promise.house}`],
                    ['Sub lord', `${promise.subLordName}${promise.subLordRetrograde ? ' (R)' : ''}`],
                    ['Signifies', promise.signifies.join(', ') || '—'],
                    ['Matter houses', promise.matterHouses.join(', ')],
                    ['Detrimental', promise.detrimentalHouses.join(', ')],
                    ['Held', promise.hitsMatter.join(', ') || 'none'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{k}</dt>
                      <dd className="text-[14px] text-slate-800 mt-1 capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-[13px] text-slate-400">No reading for this matter.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100"><SectionHead>Every matter</SectionHead></div>
            <div className="divide-y divide-slate-100">
              {Object.entries(kp.promises).map(([k, p]: any) => (
                <button key={k} type="button" onClick={() => setMatter(k)}
                  className={`w-full flex items-center gap-4 px-7 py-3 text-left hover:bg-slate-50/70 transition-colors ${k === matter ? 'bg-slate-50' : ''}`}>
                  <span className="text-[14px] text-slate-800 flex-1">{KP_MATTERS[k].label}</span>
                  <span className="text-[12px] font-mono text-slate-400 capitalize hidden sm:inline">
                    {p ? `${p.subLordName} · cusp ${p.house}` : '—'}
                  </span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${TONE[p?.promise]?.bg ?? 'bg-slate-50'} ${TONE[p?.promise]?.border ?? 'border-slate-200'} ${TONE[p?.promise]?.text ?? 'text-slate-500'}`}>
                    {p ? PROMISE_LABEL[p.promise] : '—'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── timing ─────────────────────────────────────────────── */}
      {tab === 'timing' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <SectionHead right={
              <select aria-label="Matter for timing" value={matter} onChange={(e) => setMatter(e.target.value)}
                className="px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-700">
                {Object.entries(KP_MATTERS).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            }>Daśā delivery</SectionHead>

            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              A period delivers only when the mahā, antara and pratyantara lords between them
              cover the whole house group — <span className="font-mono text-slate-700">{matterDef.matter.join(', ')}</span> —
              each supplying a different house.
            </p>

            {timing?.current ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 mb-6">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-3">Running now</div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {timing.current.lords.map((l, i) => (
                      <React.Fragment key={`${l.lord}-${i}`}>
                        {i > 0 && <span className="text-slate-300">›</span>}
                        <span className={`text-[13px] px-3 py-1 rounded-lg border font-medium ${
                          l.covers.length ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>{l.lordName}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-[13px] text-slate-600">
                    Covers <span className="font-mono">{timing.current.covered.join(', ') || 'none'}</span>
                    {timing.current.missing.length > 0 && (
                      <> · missing <span className="font-mono text-[#8C2D19]">{timing.current.missing.join(', ')}</span></>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Delivering windows · {timing.windows.length}
                </div>
                {timing.windows.length === 0 ? (
                  <p className="text-[13px] text-slate-400">No window in the current mahādaśā covers the whole group.</p>
                ) : (
                  <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
                    {timing.windows.map((w, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-2.5 rounded-lg border border-slate-200/70 bg-white">
                        <span className="text-[12px] font-mono text-slate-500 w-44 shrink-0">
                          {w.from.slice(0, 10)} → {w.to.slice(0, 10)}
                        </span>
                        <span className="text-[13px] text-slate-700 flex-1 capitalize">
                          {w.lords.map((l) => l.lordName).join(' › ')}
                        </span>
                        <span className="text-[12px] font-mono text-emerald-700 shrink-0">{w.covered.join(',')}</span>
                        {w.strong && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-medium">RP</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[13px] text-slate-400">No daśā data available.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#8C2D19]" />
              <SectionHead>Cuspal interlinks · {kp.interlinks.length}</SectionHead>
            </div>
            {kp.interlinks.length === 0 ? (
              <p className="px-7 py-5 text-[13px] text-slate-400">No interlinks in this chart.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {kp.interlinks.map((l, i) => (
                  <div key={i} className="px-7 py-2.5 flex items-center gap-3 text-[13px]">
                    <span className="font-mono text-slate-400 w-8">H{l.fromHouse}</span>
                    <span className="text-slate-800 capitalize">{l.fromSubLordName}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-mono text-slate-600">house {l.intoHouse}</span>
                    <span className="text-slate-400 capitalize ml-auto">{l.intoCuspLord}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4-step check ───────────────────────────────────────── */}
      {tab === 'fourstep' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <SectionHead right={
              <select aria-label="Matter for the four-step check" value={matter} onChange={(e) => setMatter(e.target.value)}
                className="px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-700">
                {Object.entries(KP_MATTERS).map(([k, m]) => (
                  <option key={k} value={k}>{m.label}</option>
                ))}
              </select>
            }>The four-step check</SectionHead>

            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              Promise first, then significators, then the ruling planets, then timing. The order is
              the procedure — a matter refused at step 1 is not rescued by a good daśā at step 4.
            </p>

            {fourStep ? (
              <>
                <div className="space-y-3">
                  {fourStep.steps.map((st) => {
                    const ink =
                      st.verdict === 'yes' ? 'border-emerald-200 bg-emerald-50/60'
                        : st.verdict === 'partial' ? 'border-amber-200 bg-amber-50/50'
                          : st.verdict === 'no' ? 'border-[#8C2D19]/25 bg-[#8C2D19]/[0.04]'
                            : 'border-slate-200 bg-slate-50';
                    const badge =
                      st.verdict === 'yes' ? 'bg-emerald-600 text-white'
                        : st.verdict === 'partial' ? 'bg-amber-500 text-white'
                          : st.verdict === 'no' ? 'bg-[#8C2D19] text-white'
                            : 'bg-slate-400 text-white';
                    return (
                      <div key={st.step} className={`rounded-xl border p-5 ${ink}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold ${badge}`}>
                            {st.step}
                          </span>
                          <span className="text-[14px] font-semibold text-slate-900">{st.title}</span>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 ml-auto">{st.verdict}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 mb-1.5">{st.question}</p>
                        <p className="text-[13px] text-slate-800 leading-relaxed">{st.finding}</p>
                        {st.evidence.length > 0 && (
                          <ul className="mt-2.5 space-y-0.5">
                            {st.evidence.map((e, i) => (
                              <li key={i} className="text-[12px] font-mono text-slate-500">{e}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl border-2 border-[#8C2D19]/25 bg-[#8C2D19]/[0.045] p-5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C2D19] mb-2">Conclusion</div>
                  <p className="text-[14px] text-slate-900 leading-relaxed">{fourStep.conclusion}</p>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-slate-400">No reading for this matter.</p>
            )}
          </div>
        </div>
      )}

      {/* ── aspects ────────────────────────────────────────────── */}
      {tab === 'aspects' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <div className="rounded-xl border-2 border-[#8C2D19]/25 bg-[#8C2D19]/[0.045] p-5 mb-6">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C2D19] mb-2">The cardinal rule</div>
              <p className="text-[13px] text-slate-800 leading-relaxed">
                Aspects support or suppress a signification — they never override the cuspal
                sub lord. A graha aspecting a cusp gains a secondary link to that house; it does
                not become a primary significator, and it cannot reverse a denial.
              </p>
            </div>

            <SectionHead right={<span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{aspects.planetAspects.length} aspects</span>}>
              Graha to graha
            </SectionHead>
            {aspects.planetAspects.length === 0 ? (
              <p className="text-[13px] text-slate-400">No degree aspects within orb.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-slate-50/70">
                      <Th>From</Th><Th>Aspect</Th><Th>To</Th><Th>Separation</Th><Th>Orb</Th><Th>Motion</Th><Th>Nature</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {aspects.planetAspects.map((a, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-800 font-medium">{a.fromName}</td>
                        <td className="py-2.5 px-3 text-slate-600 capitalize">{a.kind}</td>
                        <td className="py-2.5 px-3 text-slate-800">{a.toName}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">{a.separation}°</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">±{a.orb}°</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{a.applying ? 'applying' : 'separating'}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                            a.benefic ? 'bg-emerald-50 text-emerald-700' : 'bg-[#8C2D19]/10 text-[#8C2D19]'
                          }`}>{a.benefic ? 'benefic' : 'malefic'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100">
              <SectionHead right={<span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">the half whole-sign dṛṣṭi cannot express</span>}>
                Graha to cusp · {aspects.cuspAspects.length}
              </SectionHead>
            </div>
            <div className="overflow-x-auto max-h-[26rem] overflow-y-auto">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-slate-50/90">
                    <Th>Graha</Th><Th>Aspect</Th><Th>Cusp</Th><Th>Sep.</Th><Th>Carries</Th><Th>Nature</Th>
                  </tr>
                </thead>
                <tbody>
                  {aspects.cuspAspects.map((a, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-800 font-medium">{a.fromName}</td>
                      <td className="py-2 px-3 text-slate-600 capitalize">{a.kind}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">H{a.cusp} <span className="text-slate-400 text-[11px]">{a.cuspLongitude.toFixed(1)}°</span></td>
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-600">{a.separation}°</td>
                      <td className="py-2 px-3 font-mono text-[12px] text-slate-500">{a.carries.join(',') || '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          a.benefic ? 'bg-emerald-50 text-emerald-700' : 'bg-[#8C2D19]/10 text-[#8C2D19]'
                        }`}>{a.benefic ? 'benefic' : 'malefic'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100">
              <SectionHead>Rāśi dṛṣṭi · whole sign</SectionHead>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-100">
              {aspects.rasiAspects.map((a, i) => (
                <div key={i} className="px-5 py-2 flex items-center gap-2.5 text-[13px] border-b border-slate-100">
                  <span className="text-slate-800 w-16 shrink-0">{a.fromName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-mono text-slate-600 flex-1">house {a.house}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${a.benefic ? 'bg-emerald-500' : 'bg-[#8C2D19]'}`} />
                </div>
              ))}
            </div>
            <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 leading-relaxed">
                All grahas aspect the 7th; Mars adds the 4th and 8th, Jupiter the 5th and 9th,
                Saturn the 3rd and 10th — taught by Krishnamurti himself in KP Reader 1.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── dasha ──────────────────────────────────────────────── */}
      {tab === 'dasha' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead right={
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">KP uses Viṃśottarī only</span>
            }>Viṃśottarī · mahā and antara</SectionHead>
          </div>
          <div className="max-h-[34rem] overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50/90">
                  <Th>Level</Th><Th>Lord</Th><Th>From</Th><Th>To</Th><Th>Signifies</Th>
                </tr>
              </thead>
              <tbody>
                {kp.dasha.map((d, i) => (
                  <tr key={`${d.level}-${d.lord}-${i}`}
                    className={`border-t border-slate-100 ${d.isRunning ? 'bg-[#8C2D19]/[0.05]' : ''}`}>
                    <td className="py-2 px-3 text-[11px] font-mono text-slate-400">
                      {d.level === 'mahā' ? 'MD' : 'AD'}
                    </td>
                    <td className={`py-2 px-3 capitalize ${d.level === 'mahā' ? 'text-slate-900 font-semibold' : 'text-slate-600 pl-7'}`}>
                      {d.lordName}
                      {d.isRunning && (
                        <span className="ml-2.5 text-[10px] px-2 py-0.5 rounded-md bg-[#8C2D19] text-white font-medium">now</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 tabular-nums">{d.from}</td>
                    <td className="py-2 px-3 font-mono text-slate-600 tabular-nums">{d.to}</td>
                    <td className="py-2 px-3 font-mono text-[12px] text-slate-500">{d.signifies.join(',')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── footnote ───────────────────────────────────────────── */}
      <div className="flex gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          {tab === 'aspects' ? aspects.note
            : tab === 'ruling' ? kp.ruling.note
            : tab === 'timing' ? timing?.note ?? 'Cuspal interlinks chain one house to another through the star lords.'
              : tab === 'promise' ? 'The cuspal sub lord settles whether a matter is promised; everything else refines timing and texture. A birth chart gives retrogression no weight — that is a horary rule.'
                : tab === 'significators' ? 'Ranked strongest first: a graha in the star of a house occupant outranks the occupant itself, which outranks a graha in the cusp lord\u2019s star, which outranks the cusp lord.'
                  : 'Placidus cusps are calculated degrees, not sign boundaries — the whole sub-lord reading depends on them.'}
        </p>
      </div>
    </div>
  );
};
