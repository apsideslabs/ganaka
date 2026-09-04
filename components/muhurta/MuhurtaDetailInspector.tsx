'use client';

import React, { useState } from 'react';
import { CandidateMuhurtaPeriod } from '@/lib/muhurta/types';
import {
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  Compass,
  Sun,
  Moon,
  Sparkles,
  Check,
  XCircle,
  Layers,
  Crown,
  Info,
} from 'lucide-react';

interface MuhurtaDetailInspectorProps {
  candidate: CandidateMuhurtaPeriod;
  onSelectResultDate?: (d: Date) => void;
}

type InspectorTab = 'mahadoshas' | 'rules' | 'kundali' | 'chronometry' | 'citations';

export function MuhurtaDetailInspector({
  candidate,
  onSelectResultDate,
}: MuhurtaDetailInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('mahadoshas');

  const isStrong = candidate.classification === 'STRONGLY_RECOMMENDED';
  const isSuitable = candidate.classification === 'SUITABLE';
  const isConditional = candidate.classification === 'CONDITIONAL';

  let badgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
  if (isStrong) badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  else if (isSuitable) badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
  else if (isConditional) badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
  else badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';

  // Audit stats
  const totalAudit = candidate.mahaDoshasAudit.length;
  const clearedAudit = candidate.mahaDoshasAudit.filter((a) => a.status === 'CLEARED').length;
  const mitigatedAudit = candidate.mahaDoshasAudit.filter((a) => a.status === 'MITIGATED').length;
  const afflictedAudit = candidate.mahaDoshasAudit.filter((a) => a.status === 'AFFLICTED').length;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6 space-y-5 sticky top-4 shadow-xs font-sans">
      {/* Top Header */}
      <div className="border-b border-[#E2E8F0] pb-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
            Shāstric Verification Inspector
          </span>
          <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md border ${badgeClass}`}>
            {candidate.classificationLabel}
          </span>
        </div>

        <h3 className="text-lg font-serif font-bold text-[#0F172A]">
          {candidate.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <p className="text-[#1D4ED8] font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            {candidate.startTime} – {candidate.endTime} ({candidate.durationMinutes} min)
          </p>
          <span className="font-bold px-2 py-1 bg-[#F8FAFC] rounded-md text-[#0F172A] border border-[#E2E8F0]">
            Lagna: {candidate.lagnaName} ({candidate.lagnaSanskrit})
          </span>
        </div>
      </div>

      {/* Qualification Statement Box */}
      <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">
            Classical Decision Statement (निर्णय सारम्)
          </span>
          <span className="text-xs font-mono font-bold text-[#0F172A]">
            Purity Index: {candidate.purityScore}/100
          </span>
        </div>
        <p className="font-serif text-[#0F172A] text-xs leading-relaxed">
          {candidate.classicalBasisSummary}
        </p>
        {candidate.cautionSummary && (
          <p className="text-[11px] font-mono text-amber-700 pt-1.5 border-t border-[#E2E8F0] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>{candidate.cautionSummary}</span>
          </p>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('mahadoshas')}
          className={`px-3 py-1.5 rounded-t-md transition-colors cursor-pointer whitespace-nowrap font-medium ${
            activeTab === 'mahadoshas'
              ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          21 Mahā-Doṣas ({clearedAudit + mitigatedAudit}/{totalAudit})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kundali')}
          className={`px-3 py-1.5 rounded-t-md transition-colors cursor-pointer whitespace-nowrap font-medium ${
            activeTab === 'kundali'
              ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          Lagna &amp; Houses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chronometry')}
          className={`px-3 py-1.5 rounded-t-md transition-colors cursor-pointer whitespace-nowrap font-medium ${
            activeTab === 'chronometry'
              ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          Horā &amp; Choghadiyā
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-t-md transition-colors cursor-pointer whitespace-nowrap font-medium ${
            activeTab === 'rules'
              ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          Rule Tiers
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('citations')}
          className={`px-3 py-1.5 rounded-t-md transition-colors cursor-pointer whitespace-nowrap font-medium ${
            activeTab === 'citations'
              ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          Shlokas ({candidate.citations.length})
        </button>
      </div>

      {/* Tab 1: 21 Mahā-Doṣas Audit Matrix */}
      {activeTab === 'mahadoshas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] uppercase font-bold text-[#64748B]">
              21 Classical Mahā-Doṣas Ledger (एकविंशति महादोषाः)
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                {clearedAudit} Cleared
              </span>
              {mitigatedAudit > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                  {mitigatedAudit} Mitigated
                </span>
              )}
              {afflictedAudit > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                  {afflictedAudit} Afflicted
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {candidate.mahaDoshasAudit.map((audit, idx) => {
              const isCleared = audit.status === 'CLEARED';
              const isMitigated = audit.status === 'MITIGATED';
              const isAfflicted = audit.status === 'AFFLICTED';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-md border text-xs space-y-1 transition-all ${
                    isCleared
                      ? 'bg-white border-[#E2E8F0]'
                      : isMitigated
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-[#0F172A]">
                      {audit.name} ({audit.sanskritName})
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : isMitigated
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B] font-mono">
                    {audit.detail}
                  </p>

                  {audit.mitigationText && (
                    <p className="text-[11px] text-amber-800 font-serif italic bg-amber-50 p-1.5 rounded border border-amber-200">
                      <strong>Classical Remedy:</strong> {audit.mitigationText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Planetary Fortifications & Houses */}
      {activeTab === 'kundali' && (
        <div className="space-y-3.5 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
              <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">
                8th House (Aṣṭama Śuddhi)
              </span>
              <span
                className={`font-serif font-bold block text-sm mt-0.5 ${
                  candidate.ashtamaShuddhi.isClean ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {candidate.ashtamaShuddhi.isClean ? '✓ Completely Pure' : '⚠ Occupied'}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-1">
                {candidate.ashtamaShuddhi.description}
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
              <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">
                7th House (Jāmitra Śuddhi)
              </span>
              <span
                className={`font-serif font-bold block text-sm mt-0.5 ${
                  candidate.jamitraShuddhi.isClean ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {candidate.jamitraShuddhi.isClean ? '✓ Completely Pure' : '⚠ Jāmitra Afflicted'}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-1">
                {candidate.jamitraShuddhi.description}
              </span>
            </div>
          </div>

          {/* Kendra & Upachaya Fortifications */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md space-y-1.5">
            <span className="text-[10px] text-[#64748B] block uppercase tracking-wider font-bold">
              Kendra &amp; Upachaya House Fortifications
            </span>
            <div className="text-[11px] text-[#0F172A] space-y-1">
              <div className="flex items-center justify-between">
                <span>Benefics in Kendra (1, 4, 7, 10):</span>
                <span className="font-bold text-[#1D4ED8]">
                  {candidate.kendraBenefics.length > 0
                    ? candidate.kendraBenefics.join(', ')
                    : 'None (Neutral)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Malefics in Upachaya (3, 6, 11):</span>
                <span className="font-bold text-emerald-700">
                  {candidate.upachayaMalefics.length > 0
                    ? candidate.upachayaMalefics.join(', ')
                    : 'None (Neutral)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Candra-Lagna Relation:</span>
                <span className="font-bold text-[#0F172A]">
                  {candidate.chandraLagnaRelation.description}
                </span>
              </div>
            </div>
          </div>

          {/* Planetary Placements Table */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
              Rising Planetary Placements
            </span>
            <div className="max-h-48 overflow-y-auto border border-[#E2E8F0] rounded-md divide-y divide-[#E2E8F0]">
              {candidate.planetaryPositions.map((p, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between bg-white text-[11px]">
                  <div>
                    <span className="font-bold text-[#0F172A]">{p.planetName}</span>
                    <span className="text-[10px] text-[#64748B] ml-1.5">
                      ({p.sanskritName})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#64748B]">
                      House {p.houseFromLagna} ({p.rashiName})
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        p.isBenefic ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.isBenefic ? 'Benefic' : 'Malefic'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chronometry & Diurnal Windows */}
      {activeTab === 'chronometry' && (
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
              Active Horā &amp; Choghadiyā Alignment
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded">
                <span className="text-[10px] text-[#64748B] block uppercase">Active Horā Lord</span>
                <span className="font-serif font-bold text-sm text-[#0F172A] block mt-0.5">
                  {candidate.panchangaSnapshot.activeHoraLord}
                </span>
                <span className="text-[10px] text-[#1D4ED8] block">
                  {candidate.panchangaSnapshot.activeHoraFavorability}
                </span>
              </div>

              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded">
                <span className="text-[10px] text-[#64748B] block uppercase">Choghadiyā Window</span>
                <span className="font-serif font-bold text-sm text-[#0F172A] block mt-0.5">
                  {candidate.panchangaSnapshot.activeChoghadiyaName}
                </span>
                <span
                  className={`text-[10px] block ${
                    candidate.panchangaSnapshot.activeChoghadiyaIsAuspicious
                      ? 'text-emerald-700 font-bold'
                      : 'text-rose-700'
                  }`}
                >
                  {candidate.panchangaSnapshot.activeChoghadiyaNature}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
              Classical Timing Windows &amp; Exclusions
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Rāhu Kāla:</span>
                <span
                  className={`font-bold ${
                    candidate.panchangaSnapshot.isRahuKala ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {candidate.panchangaSnapshot.isRahuKala ? '⚠ Intersects Window' : '✓ Cleared'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Bhadrā (Viṣṭi Karaṇa):</span>
                <span
                  className={`font-bold ${
                    candidate.panchangaSnapshot.isBhadra ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {candidate.panchangaSnapshot.isBhadra ? '⚠ Active Bhadrā' : '✓ Cleared'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Yamagaṇḍa / Gulika:</span>
                <span
                  className={`font-bold ${
                    candidate.panchangaSnapshot.isYamaganda || candidate.panchangaSnapshot.isGulika
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {candidate.panchangaSnapshot.isYamaganda || candidate.panchangaSnapshot.isGulika
                    ? '⚠ Present'
                    : '✓ Cleared'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Abhijit Muhūrta:</span>
                <span className="font-bold text-[#0F172A]">
                  {candidate.panchangaSnapshot.isAbhijit ? '✓ Aligned' : '○ Not Applicable'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Godhūli Belā:</span>
                <span className="font-bold text-[#0F172A]">
                  {candidate.panchangaSnapshot.isGodhuli ? '✓ Active Twilight' : '○ Outside'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Categorized Rule Ledger */}
      {activeTab === 'rules' && (
        <div className="space-y-3.5">
          {/* Absolute Prohibitions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
              <span>1. Absolute Prohibitions (वर्ज्य / महादोष)</span>
              <span>{candidate.ruleCategoriesBreakdown.absoluteProhibitions.length} Rules</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {candidate.ruleCategoriesBreakdown.absoluteProhibitions.map((cond, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-xs space-y-1 ${
                    cond.status === 'MET'
                      ? 'bg-white border-[#E2E8F0]'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#0F172A]">{cond.rule.name}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        cond.status === 'MET'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cond.status === 'MET' ? 'CLEARED' : 'VIOLATION'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    Observed: <strong>{cond.observedValue}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Major Conditions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0F172A] bg-[#F8FAFC] px-2.5 py-1 rounded border border-[#E2E8F0]">
              <span>2. Major Required Conditions (मुख्य लक्षण)</span>
              <span>{candidate.ruleCategoriesBreakdown.majorConditions.length} Rules</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {candidate.ruleCategoriesBreakdown.majorConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border border-[#E2E8F0] bg-white text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#0F172A]">{cond.rule.name}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        cond.status === 'MET'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cond.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    Observed: <strong>{cond.observedValue}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Classical Text Citations */}
      {activeTab === 'citations' && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Classical Shāstric Authorities</span>
          </h4>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {candidate.citations.map((c, idx) => (
              <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif font-bold text-[#1D4ED8] block">
                    {c.text} ({c.chapter} {c.shlokaRange})
                  </span>
                  <span className="text-[10px] font-serif text-[#64748B]">
                    {c.sanskritTitle}
                  </span>
                </div>
                {c.sanskritQuote && (
                  <p className="text-[11px] font-serif text-[#0F172A] italic bg-white p-2 rounded border border-[#E2E8F0]">
                    &ldquo;{c.sanskritQuote}&rdquo;
                  </p>
                )}
                <p className="text-[11px] font-serif text-[#0F172A] leading-relaxed">
                  {c.englishTranslation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Jump to Daily Date Button */}
      {onSelectResultDate && (
        <button
          type="button"
          onClick={() => onSelectResultDate(candidate.date)}
          className="w-full py-2.5 bg-[#1D4ED8] hover:bg-blue-800 text-white rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          <span>Open Date in Daily Pañcāṅga</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
