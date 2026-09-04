'use client';

import React from 'react';
import { CandidateMuhurtaPeriod } from '@/lib/muhurta/types';
import {
  Clock,
  Crown,
  Check,
  ShieldCheck,
  XCircle,
  Sparkles,
  AlertTriangle,
  Sun,
  Shield,
  Star,
} from 'lucide-react';

interface MuhurtaCandidateCardProps {
  candidate: CandidateMuhurtaPeriod;
  isSelected: boolean;
  onSelect: (c: CandidateMuhurtaPeriod) => void;
}

export function MuhurtaCandidateCard({
  candidate,
  isSelected,
  onSelect,
}: MuhurtaCandidateCardProps) {
  const isStrong = candidate.classification === 'STRONGLY_RECOMMENDED';
  const isSuitable = candidate.classification === 'SUITABLE';
  const isConditional = candidate.classification === 'CONDITIONAL';
  const isAvoid = candidate.classification === 'AVOID';

  // Badge styling
  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
  if (isStrong) {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (isSuitable) {
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (isConditional) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (isAvoid) {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
  }

  // Choghadiya styling
  const choghadiyaNature = candidate.panchangaSnapshot.activeChoghadiyaNature;
  const isGoodChoghadiya = candidate.panchangaSnapshot.activeChoghadiyaIsAuspicious;

  return (
    <div
      onClick={() => onSelect(candidate)}
      className={`p-4 sm:p-5 rounded-lg border transition-all cursor-pointer space-y-3.5 ${
        isSelected
          ? 'bg-white border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 shadow-md'
          : isStrong
          ? 'bg-white border-[#E2E8F0] hover:border-[#1D4ED8] shadow-xs'
          : isSuitable
          ? 'bg-white border-[#E2E8F0] hover:border-[#1D4ED8] shadow-xs'
          : isConditional
          ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-amber-400 shadow-2xs'
          : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
      }`}
    >
      {/* Top Header: Classification, Horizon Badge, Date & Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Classification Pill */}
          <span
            className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-md border flex items-center gap-1.5 ${badgeColor}`}
          >
            {isStrong && <Crown className="w-3.5 h-3.5" />}
            {isSuitable && <Check className="w-3.5 h-3.5" />}
            {isConditional && <ShieldCheck className="w-3.5 h-3.5" />}
            {isAvoid && <XCircle className="w-3.5 h-3.5" />}
            <span>{candidate.classificationLabel}</span>
          </span>

          {candidate.isBestInRequestedRange && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>Sovereign Horizon Pick</span>
            </span>
          )}

          <span className="text-xs sm:text-sm font-serif font-bold text-[#0F172A]">
            {candidate.date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Time Window & Score */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {candidate.startTime} – {candidate.endTime} ({candidate.durationMinutes} min)
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 bg-slate-100 text-[#0F172A] rounded-md border border-[#E2E8F0]">
            <span>{candidate.purityScore}</span>
            <span className="text-[10px] text-[#64748B]">/100</span>
          </div>
        </div>
      </div>

      {/* Real-Time Classical Window Badges: Choghadiya, Hora, & Auspicious Yogas */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {/* Choghadiya Badge */}
        {candidate.panchangaSnapshot.activeChoghadiyaName && (
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded-md border flex items-center gap-1 font-semibold ${
              isGoodChoghadiya
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : choghadiyaNature === 'Neutral / Movement'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>Choghadiyā: <strong>{candidate.panchangaSnapshot.activeChoghadiyaName}</strong> ({choghadiyaNature})</span>
          </span>
        )}

        {/* Hora Lord Badge */}
        {candidate.panchangaSnapshot.activeHoraLord && (
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded-md border flex items-center gap-1 font-medium ${
              candidate.panchangaSnapshot.activeHoraFavorability === 'AUSPICIOUS'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>Horā: <strong>{candidate.panchangaSnapshot.activeHoraLord}</strong> ({candidate.panchangaSnapshot.activeHoraLordSanskrit})</span>
          </span>
        )}

        {/* Special Yogas */}
        {candidate.specialYogas.map((yoga, yIdx) => (
          <span
            key={yIdx}
            className="px-2 py-0.5 text-[10px] font-serif bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{yoga}</span>
          </span>
        ))}

        {/* Godhuli Window */}
        {candidate.panchangaSnapshot.isGodhuli && (
          <span className="px-2 py-0.5 text-[10px] font-serif bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-semibold flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-600" />
            <span>Godhūli Belā (गोधूलि)</span>
          </span>
        )}

        {/* Abhijit Window */}
        {candidate.panchangaSnapshot.isAbhijit && (
          <span className="px-2 py-0.5 text-[10px] font-serif bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3 text-emerald-600" />
            <span>Abhijit Muhūrta (अभिजित्)</span>
          </span>
        )}

        {/* Vijaya Window */}
        {candidate.panchangaSnapshot.isVijaya && (
          <span className="px-2 py-0.5 text-[10px] font-serif bg-purple-50 text-purple-800 border border-purple-200 rounded-md font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Vijaya Muhūrta (विजय)</span>
          </span>
        )}
      </div>

      {/* Pañcāṅga Limbs & Astrological Anchors Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
        <div className="p-2 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">Lagna (Ascendant)</span>
          <span className="font-serif font-bold text-[#0F172A]">{candidate.lagnaName}</span>
          <span className="text-[10px] text-[#64748B] block">{candidate.lagnaSanskrit} ({candidate.lagnaLordName})</span>
        </div>

        <div className="p-2 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">Tithi</span>
          <span className="font-serif text-[#0F172A] truncate block font-medium">
            {candidate.panchangaSnapshot.tithiName}
          </span>
          <span className="text-[10px] text-[#64748B] block">{candidate.panchangaSnapshot.tithiPaksha} Pakṣa</span>
        </div>

        <div className="p-2 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">Nakṣatra</span>
          <span className="font-serif text-[#0F172A] truncate block font-medium">
            {candidate.panchangaSnapshot.nakshatraName}
          </span>
          <span className="text-[10px] text-[#64748B] block">Pada {candidate.panchangaSnapshot.nakshatraPada}</span>
        </div>

        <div className="p-2 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
          <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">House Purity</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                candidate.ashtamaShuddhi.isClean
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              8th: {candidate.ashtamaShuddhi.isClean ? 'Pure' : 'Occupied'}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                candidate.jamitraShuddhi.isClean
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              7th: {candidate.jamitraShuddhi.isClean ? 'Pure' : 'Occupied'}
            </span>
          </div>
        </div>
      </div>

      {/* Classical Basis Summary */}
      <p className="text-xs font-serif text-[#0F172A] leading-relaxed pt-0.5">
        {candidate.classicalBasisSummary}
      </p>

      {/* Caution Summary */}
      {candidate.cautionSummary && (
        <p className="text-[11px] font-mono text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>{candidate.cautionSummary}</span>
        </p>
      )}

      {/* Applied Parihāras (Classical Exceptions) */}
      {candidate.appliedPariharas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {candidate.appliedPariharas.map((par, pIdx) => (
            <span
              key={pIdx}
              className="px-2 py-0.5 text-[11px] font-serif bg-blue-50 text-[#1D4ED8] border border-blue-200 rounded-md font-medium flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-[#1D4ED8]" />
              <span>{par.title}: {par.mitigatesDosha}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
