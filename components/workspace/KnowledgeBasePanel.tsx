'use client';

/**
 * Gaṇaka — textual knowledge base panel.
 *
 * Every rule the engine applies, with its verse, translation, edition and — where
 * the sources disagree — the disagreement itself.
 */

import React, { useMemo, useState } from 'react';
import {
  KNOWLEDGE_BASE, searchRules, knowledgeBaseSummary,
  type RuleRecord,
} from '@/lib/jyotisha/knowledge-base';
import { BookOpen, Search, Info, AlertTriangle } from 'lucide-react';

const CONFIDENCE_LABEL: Record<string, { text: string; cls: string }> = {
  'verse-verified': { text: 'verse read', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'translation-verified': { text: 'translation', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  'chapter-level': { text: 'chapter level', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const KnowledgeBasePanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(KNOWLEDGE_BASE[0]?.id ?? null);

  const results = useMemo(() => searchRules(query), [query]);
  const summary = useMemo(() => knowledgeBaseSummary(), []);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Textual Knowledge Base</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          Every rule the engine applies, with its source, edition, chapter and verse. Where the
          sources disagree, the disagreement is recorded rather than resolved silently.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {summary.total} rules
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {summary.withSanskrit} with Sanskrit
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {summary.withDisagreement} note a disagreement
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {summary.byConfidence['verse-verified'] ?? 0} verse-verified
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by rule, text, verse, condition or implementation file…"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
          />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-2">
          {results.length} match{results.length === 1 ? '' : 'es'}
        </p>
      </div>

      <div className="space-y-2">
        {results.map((r: RuleRecord) => {
          const open = openId === r.id;
          const conf = CONFIDENCE_LABEL[r.confidence] ?? CONFIDENCE_LABEL['chapter-level'];
          return (
            <div key={r.id} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#8C2D19] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-sm text-slate-900">{r.title}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider ${conf.cls}`}>
                      {conf.text}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{r.school}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.work} · {r.location} · {r.edition}
                  </div>
                </div>
                <span className="text-slate-300 text-xs shrink-0">{open ? '−' : '+'}</span>
              </button>

              {open && (
                <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100">
                  {r.sanskrit && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Sanskrit</div>
                      <p className="font-serif text-sm text-slate-800 leading-relaxed">{r.sanskrit}</p>
                    </div>
                  )}
                  {r.transliteration && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Transliteration</div>
                      <p className="text-[11px] italic text-slate-600 leading-relaxed">{r.transliteration}</p>
                    </div>
                  )}
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Translation</div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{r.translation}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Conditions</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{r.conditions}</p>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Interpretation</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{r.interpretation}</p>
                    </div>
                  </div>
                  {r.exceptions && (
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">Exceptions</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{r.exceptions}</p>
                    </div>
                  )}
                  {r.disagreement && (
                    <div className="flex gap-2 rounded-lg bg-amber-50/70 border border-amber-200 px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest text-amber-700 mb-0.5">Where sources differ</div>
                        <p className="text-[11px] text-amber-900/80 leading-relaxed">{r.disagreement}</p>
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-slate-400">
                    implemented in <span className="text-slate-600">{r.implementation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {results.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <p className="text-xs text-slate-400">No rule matches that search.</p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This is a seed, not the corpus. It holds the rules the engine implements, with the verses
          behind them — sixteen so far, five read directly from the Sanskrit. Extending it means
          adding records, not changing the schema. A rule marked “chapter level” has its source
          located but its verse not yet read, and should be treated as less firm than one marked
          “verse read”.
        </p>
      </div>
    </div>
  );
};
