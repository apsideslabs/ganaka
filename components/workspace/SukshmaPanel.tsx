'use client';

/**
 * Sūkṣma Bindu — the fine points.
 *
 * Three tables that were computed but never shown: the five avasthā sets that
 * land on every graha, the Mṛtyu Bhāga degrees with both recensions side by
 * side, and the nakṣatra nāḍī cycle.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateMrityuBhaga, mrityuBhagaTable, type MrityuRecension } from '@/lib/jyotisha/mrityu-bhaga';
import { calculateNadi, NADI_INFO } from '@/lib/jyotisha/nadi';
import { Info, Sparkles, Skull, Waves } from 'lucide-react';

interface Props {
  chart: JyotishaChart;
}

type Tab = 'avasthas' | 'mrityu' | 'nadi';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'avasthas', label: 'Avasthās', icon: Sparkles },
  { id: 'mrityu', label: 'Mṛtyu Bhāga', icon: Skull },
  { id: 'nadi', label: 'Nakṣatra Nāḍī', icon: Waves },
];

const SETS: Array<{ key: string; label: string; blurb: string }> = [
  { key: 'baladi', label: 'Bālādi', blurb: 'Age — infant to dead, by degree within the sign' },
  { key: 'jagradadi', label: 'Jāgradādi', blurb: 'Waking, dreaming, sleeping — by dignity' },
  { key: 'deeptadi', label: 'Dīptādi', blurb: 'Nine states from radiant to afflicted' },
  { key: 'lajjitadi', label: 'Lajjitādi', blurb: 'Six states from ashamed to agitated' },
  { key: 'shayanadi', label: 'Śayanādi', blurb: 'Twelve states, by nakṣatra and degree' },
];

const SectionHead: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="flex items-baseline justify-between gap-4 mb-4">
    <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-slate-500 font-semibold">{children}</h3>
    {right}
  </div>
);

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`text-left py-2.5 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap ${className}`}>{children}</th>
);

export const SukshmaPanel: React.FC<Props> = ({ chart }) => {
  const [tab, setTab] = useState<Tab>('avasthas');
  const [recension, setRecension] = useState<MrityuRecension>('jataka_parijata');

  const mrityu = useMemo(() => calculateMrityuBhaga(chart, recension), [chart, recension]);
  const nadi = useMemo(() => calculateNadi(chart), [chart]);
  const table = useMemo(() => mrityuBhagaTable(), []);

  const planets = useMemo(() => {
    const out: Array<{ id: string; name: string; av: any }> = [];
    for (const [id, p] of Object.entries(chart.planets as any)) {
      const pp: any = p;
      if (pp?.avasthas) out.push({ id, name: String(pp.name ?? id).split(' ')[0], av: pp.avasthas });
    }
    return out;
  }, [chart]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl px-7 py-5 shadow-xs">
        <p className="font-serif text-xl text-slate-900 leading-tight">Sūkṣma Bindu</p>
        <p className="text-[13px] text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          The fine points — the five avasthā sets, the fateful degrees, and the nakṣatra nāḍī.
          All three were already computed for every chart; this is where they are shown.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all ${
                active ? 'bg-[#8C2D19] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── avasthās ─────────────────────────────────────────── */}
      {tab === 'avasthas' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <SectionHead right={<span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">five sets</span>}>
              Planetary avasthās
            </SectionHead>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50/70">
                  <Th>Graha</Th>
                  {SETS.map((s) => <Th key={s.key}>{s.label}</Th>)}
                </tr>
              </thead>
              <tbody>
                {planets.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">{p.name}</td>
                    {SETS.map((s) => (
                      <td key={s.key} className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {String(p.av?.[s.key] ?? '—').replace(/\s*\(.*\)\s*$/, '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
              {SETS.map((s) => (
                <p key={s.key} className="text-[12px] text-slate-500">
                  <span className="font-semibold text-slate-700">{s.label}</span> — {s.blurb}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── mṛtyu bhāga ──────────────────────────────────────── */}
      {tab === 'mrityu' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <SectionHead right={
              <select aria-label="Recension" value={recension}
                onChange={(e) => setRecension(e.target.value as MrityuRecension)}
                className="px-3 py-2 text-[13px] border border-slate-300 rounded-lg bg-white text-slate-700">
                <option value="jataka_parijata">Jātaka Pārijāta</option>
                <option value="phaladipika">Phaladīpikā</option>
              </select>
            }>Mṛtyu Bhāga · this chart</SectionHead>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70">
                    <Th>Body</Th><Th>Rāśi</Th><Th>Degree</Th><Th>Critical</Th><Th>Δ</Th><Th>Orb</Th>
                  </tr>
                </thead>
                <tbody>
                  {mrityu.rows.map((r) => (
                    <tr key={r.body} className={`border-t border-slate-100 ${r.withinOrb ? 'bg-[#8C2D19]/[0.06]' : ''}`}>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{r.bodyName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.rashiName}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">{r.degreeInRashi.toFixed(2)}°</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">{r.criticalDegree}°</td>
                      <td className={`py-2.5 px-3 font-mono tabular-nums ${r.withinOrb ? 'text-[#8C2D19] font-semibold' : 'text-slate-500'}`}>
                        {r.deltaMinutes > 0 ? '+' : ''}{r.deltaMinutes.toFixed(0)}′
                      </td>
                      <td className="py-2.5 px-3">
                        {r.withinOrb
                          ? <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#8C2D19] text-white font-medium">in orb</span>
                          : <span className="text-[11px] text-slate-400">±{r.orbMinutes}′</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-[13px] text-slate-700">
                {mrityu.affected.length === 0
                  ? 'No graha sits on its fateful degree in this chart.'
                  : `${mrityu.affected.map((r) => r.bodyName).join(', ')} ${mrityu.affected.length === 1 ? 'sits' : 'sit'} on the fateful degree.`}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100">
              <SectionHead right={<span className="text-[10px] font-mono uppercase tracking-wider text-[#8C2D19]">sources differ</span>}>
                The full table · both recensions
              </SectionHead>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50/70">
                    <Th>Body</Th>
                    {['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'].map((s) => <Th key={s}>{s}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr key={row.body} className="border-t border-slate-100">
                      <td className="py-2 px-3 text-slate-800 font-medium whitespace-nowrap">
                        {row.bodyName}
                        {row.differs && <span className="ml-1.5 text-[10px] text-[#8C2D19] font-mono">≠</span>}
                      </td>
                      {row[recension === 'jataka_parijata' ? 'jataka' : 'phaladipika'].map((d, i) => {
                        const other = recension === 'jataka_parijata' ? row.phaladipika[i] : row.jataka[i];
                        return (
                          <td key={i} className={`py-2 px-3 font-mono tabular-nums ${d !== other ? 'text-[#8C2D19] font-semibold' : 'text-slate-600'}`}>
                            {d}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 leading-relaxed">{mrityu.note}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── nāḍī ─────────────────────────────────────────────── */}
      {tab === 'nadi' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
            <SectionHead>Nāḍī of this chart</SectionHead>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                ['Moon', nadi.moonNakshatra, nadi.moonNumber, nadi.moonNadiInfo],
                ['Lagna', nadi.lagnaNakshatra, nadi.lagnaNumber, nadi.lagnaNadiInfo],
              ].map(([label, nak, num, info]: any) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">{label}</div>
                  <div className="text-[15px] text-slate-900 font-medium">{nak} <span className="text-slate-400 font-mono text-[13px]">#{num}</span></div>
                  <div className="text-[14px] text-[#8C2D19] font-semibold mt-1.5">{info.english} · {info.dosha}</div>
                  <div className="text-[12px] text-slate-500 mt-1">{info.nature}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100 flex gap-2 flex-wrap">
              {(['adi', 'madhya', 'antya'] as const).map((k) => (
                <span key={k} className="text-[12px] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                  {NADI_INFO[k].english} · {nadi.distribution[k]} nakṣatras
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-7 py-4 border-b border-slate-100"><SectionHead>The 27 nakṣatras</SectionHead></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-100">
              {nadi.table.map((n) => (
                <div key={n.number} className="px-5 py-2 flex items-center gap-3 text-[13px] border-b border-slate-100">
                  <span className="font-mono text-slate-300 w-6 text-[11px]">{n.number}</span>
                  <span className="text-slate-700 flex-1">{n.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    n.nadi === 'adi' ? 'bg-sky-50 text-sky-700'
                      : n.nadi === 'madhya' ? 'bg-orange-50 text-orange-700'
                        : 'bg-emerald-50 text-emerald-700'
                  }`}>{n.nadiName}</span>
                </div>
              ))}
            </div>
            <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 leading-relaxed">{nadi.note}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          {tab === 'avasthas'
            ? 'The five avasthā sets answer different questions — age, alertness, dignity, shame and rest — and are read together, never one alone.'
            : tab === 'mrityu'
              ? mrityu.note
              : nadi.note}
        </p>
      </div>
    </div>
  );
};
