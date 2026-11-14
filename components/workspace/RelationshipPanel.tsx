'use client';

/**
 * Gaṇaka — Pañcadhā Maitrī and the favourable attributes.
 *
 * The friendship engine and the attribute table both existed as pure functions
 * but were never surfaced, so the workspace showed neither. This panel reads
 * them off the chart.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { Info, Users, Sparkles, Grid3x3 } from 'lucide-react';
import { calculateRelationshipMatrix } from '@/lib/jyotisha/relationships';

interface RelationshipPanelProps {
  chart: JyotishaChart;
}

const GRADE_INK: Record<string, string> = {
  'Adhi Mitra': 'text-emerald-700',
  'Mitra': 'text-emerald-600',
  'Sama': 'text-slate-500',
  'Shatru': 'text-amber-700',
  'Adhi Shatru': 'text-[#8C2D19]',
};

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({ chart }) => {
  const [tab, setTab] = useState<'dispositors' | 'matrix' | 'attributes'>('dispositors');

  /**
   * Which divisional chart the temporal and compound readings are taken from.
   *
   * Natural friendship never changes — it is fixed by the planetary cabinet.
   * Temporal friendship is the sign distance between the two grahas, so it does
   * change with the varga, and the compound verdict changes with it.
   */
  const [varga, setVarga] = useState<string>('D1');

  const rel: any = useMemo(() => calculateRelationshipMatrix(chart, varga), [chart, varga]);
  const dispositors: any[] = (chart as any).dispositorRelations || [];
  const attrs: any = (chart as any).attributes;

  const summary = rel?.summary;

  const matrixRows = useMemo(() => {
    if (!rel?.byPlanet) return [];
    return Object.entries(rel.byPlanet).map(([planet, list]: any) => ({
      planet,
      list: list as any[],
    }));
  }, [rel]);

  const tabs = [
    { id: 'dispositors' as const, label: 'Dispositors', icon: Users },
    { id: 'matrix' as const, label: 'Maitrī Matrix', icon: Grid3x3 },
    { id: 'attributes' as const, label: 'Attributes', icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">
            Pañcadhā Maitrī &amp; Attributes
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          The five-fold relationship between grahas — natural, temporal and their compound —
          together with the favourable number, colour, day, gem and deity read from the birth
          nakṣatra.
        </p>
        {summary && (
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              ['Adhi Mitra', summary.adhiMitra],
              ['Mitra', summary.mitra],
              ['Sama', summary.sama],
              ['Shatru', summary.shatru],
              ['Adhi Shatru', summary.adhiShatru],
            ].map(([label, n]) => (
              <span key={String(label)} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
                {label} <span className="font-mono font-bold">{String(n)}</span>
              </span>
            ))}
          </div>
        )}
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
                active
                  ? 'bg-[#8C2D19] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'dispositors' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Each graha and the lord of the sign it occupies
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                {['Graha', 'Rāśi', 'Dispositor', 'Natural', 'Temporal', 'Pañcadhā'].map((h) => (
                  <th key={h} className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dispositors.map((d) => (
                <tr key={d.planet} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-700">{d.planetName}</td>
                  <td className="py-1.5 text-slate-600">{d.rashiName}</td>
                  <td className="py-1.5 text-slate-600">{d.dispositorName}</td>
                  <td className="py-1.5 text-slate-500">{d.natural}</td>
                  <td className="py-1.5 text-slate-500">{d.temporal === 'friend' ? 'Friend' : 'Enemy'}</td>
                  <td className={`py-1.5 font-semibold ${GRADE_INK[d.compound] ?? 'text-slate-600'}`}>{d.compound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'matrix' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Compound relation of each graha to every other
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="rel-varga" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Chart
              </label>
              <select
                id="rel-varga"
                value={varga}
                onChange={(e) => setVarga(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                {['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Graha</th>
                {matrixRows.map((r) => (
                  <th key={r.planet} className="text-center py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                    {r.planet.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row.planet} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-700 capitalize">{row.planet}</td>
                  {matrixRows.map((col) => {
                    if (col.planet === row.planet) {
                      return <td key={col.planet} className="text-center text-slate-200">—</td>;
                    }
                    const cell = row.list.find((x: any) => x.other === col.planet);
                    const short = cell
                      ? { 'Adhi Mitra': 'AM', 'Mitra': 'M', 'Sama': 'S', 'Shatru': 'X', 'Adhi Shatru': 'AX' }[cell.compound as string]
                      : '—';
                    return (
                      <td
                        key={col.planet}
                        className={`text-center font-mono ${cell ? GRADE_INK[cell.compound] : 'text-slate-300'}`}
                        title={cell ? `${row.planet} → ${col.planet}: ${cell.compound}` : undefined}
                      >
                        {short}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9px] font-mono text-slate-400 mt-2">
            AM great friend · M friend · S neutral · X enemy · AX great enemy
          </p>
        </div>
      )}

      {tab === 'attributes' && attrs && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Favourable attributes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              ['Janma Graha', `${attrs.janmaGrahaName} (${attrs.nakshatraName})`],
              ['Number', `${attrs.luckyNumber} · ${attrs.companionNumbers?.join(' & ')}`],
              ['Colour', attrs.luckyColour],
              ['Day', attrs.luckyDay],
              ['Metal', attrs.luckyMetal],
              ['Gem', attrs.gemstone],
              ['Deity', attrs.deity],
              ['Direction', attrs.direction],
            ].map(([k, v]) => (
              <div key={String(k)} className="border border-slate-100 rounded-lg px-3 py-2">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">{k}</div>
                <div className="text-[11px] text-slate-700">{String(v ?? '—')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {attrs?.note ||
            'Natural friendship is fixed by the planetary cabinet and never changes; temporal friendship comes from the sign distance between the two grahas in the chart selected above; the compound reading is the two combined. Astrologers differ on two points: whether the compound verdict should be read from the rāśi or from a divisional chart, and whether the cabinet should follow the Parāśarī or the Jaimini table — the two disagree on a handful of pairs. Switch the varga above to see how far the temporal reading moves.'}
        </p>
      </div>
    </div>
  );
};
