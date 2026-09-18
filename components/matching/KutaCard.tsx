'use client';

import React from 'react';
import { SingleKutaResult } from '@/lib/jyotisha/kuta/types';
import { BookOpen, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface KutaCardProps {
  kuta: SingleKutaResult;
  index: number;
}

export function KutaCard({ kuta, index }: KutaCardProps) {
  const isFull = kuta.obtainedScore === kuta.maxScore;
  const isZero = kuta.obtainedScore === 0;
  const isException = kuta.isCancelledByException && kuta.exceptionApplied;

  return (
    <div
      id={`kuta-card-${kuta.id}`}
      className={`border rounded-xl p-4.5 transition-all bg-white shadow-xs ${
        isZero
          ? 'border-rose-200 hover:border-rose-300'
          : isException
          ? 'border-amber-200 hover:border-amber-300'
          : isFull
          ? 'border-emerald-200 hover:border-emerald-300'
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Header with Title and Score Pill */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-400">
              #{index + 1}
            </span>
            <h4 className="text-sm font-serif font-bold text-stone-900 tracking-tight">
              {kuta.name}
            </h4>
          </div>
          <p className="text-[11px] font-mono text-stone-500 mt-0.5">
            Condition: <span className="font-semibold text-stone-700">{kuta.matchingCondition}</span>
          </p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-end">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              isZero
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : isException
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : isFull
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-stone-100 text-stone-800 border border-stone-200'
            }`}
          >
            {isZero ? (
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ) : isException ? (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            ) : isFull ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>
              {kuta.obtainedScore} / {kuta.maxScore} pts
            </span>
          </div>
          {isException && (
            <span className="text-[10px] font-mono text-amber-700 font-medium mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Parihāra Active
            </span>
          )}
        </div>
      </div>

      {/* Inputs comparison */}
      <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 bg-stone-50/80 rounded-lg border border-stone-100 text-xs">
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
            Groom (Vara)
          </span>
          <span className="font-semibold text-stone-800 break-words">
            {kuta.groomValue}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
            Bride (Kanyā)
          </span>
          <span className="font-semibold text-stone-800 break-words">
            {kuta.brideValue}
          </span>
        </div>
      </div>

      {/* Analysis explanation */}
      <p className="text-xs text-stone-600 leading-relaxed">
        {kuta.explanation}
      </p>

      {/* Exception banner if applied */}
      {isException && kuta.exceptionApplied && (
        <div className="mt-3 p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Classical Exception: {kuta.exceptionApplied.ruleTitle}</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-normal font-sans">
            {kuta.exceptionApplied.conditionDescription}
          </p>
          {kuta.exceptionApplied.shloka && (
            <p className="text-[11px] font-serif italic text-amber-950/80 mt-1 border-t border-amber-200/60 pt-1">
              &quot;{kuta.exceptionApplied.shloka}&quot;
            </p>
          )}
          <span className="text-[10px] font-mono text-amber-700 block mt-0.5">
            Source: {kuta.exceptionApplied.sourceText} ({kuta.exceptionApplied.chapterAndVerse})
          </span>
        </div>
      )}

      {/* Classical Citation footer */}
      <div className="mt-3 pt-2 border-t border-stone-100 flex items-start gap-1.5 text-[11px] text-stone-500">
        <BookOpen className="w-3 h-3 text-[#8C2D19] mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-semibold text-stone-700">
            {kuta.citation.sanskritTextName} ({kuta.citation.chapterOrSection} {kuta.citation.verseOrSutra})
          </span>
          {kuta.citation.shlokaOriginal && (
            <p className="font-serif italic text-[10px] text-stone-600 line-clamp-1 hover:line-clamp-none transition-all">
              &quot;{kuta.citation.shlokaOriginal}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
