'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { useTranslation } from '@/lib/i18n/use-translation';

export function ResearchView() {
  const { t } = useTranslation();

  const researchAreas = [
    {
      id: 'classical-texts',
      title: t.research.area1Title,
      description: t.research.area1Desc,
      scope: ['Bṛhat Parāśara Horā Śāstra', 'Sūryasiddhānta', 'Bṛhat Jātaka', 'Phaladīpikā', 'Sarvāvalī'],
      status: 'Active Index',
    },
    {
      id: 'rule-provenance',
      title: t.research.area2Title,
      description: t.research.area2Desc,
      scope: ['Varga division rules', 'Daśā duration models', 'Planetary strength formulas', 'Yogas'],
      status: 'Verified',
    },
    {
      id: 'astronomical-methods',
      title: 'Astronomical Models & Historical Theories',
      description:
        'Comparative study between historical siddhāntic astronomy, medieval computational tables, and modern high-precision planetary ephemerides.',
      scope: ['Siddhāntic mean motions', 'Equation of center models', 'Precession rates', 'Eclipses'],
      status: 'Operational',
    },
    {
      id: 'calculation-methods',
      title: 'Calculation Methods & Standardizations',
      description:
        'Auditing differences among Ayanāṃśa formulations, true vs. mean lunar nodes, sunrise definitions, and spherical horizon projections.',
      scope: ['Lahiri / NC Lahiri', 'Krishnamurti (KP)', 'Raman', 'Yukteshwar', 'Sūryasiddhānta Ayanāṃśa'],
      status: 'Operational',
    },
    {
      id: 'regional-traditions',
      title: 'Regional Traditions & Specialized Systems',
      description:
        'Dedicated historical and mathematical inquiry into distinct regional practices, with special focus on Assamese, Bengali, Kerala, and Tamil Jyotiṣa literature.',
      scope: ['Assamese Pañcāṅga tradition', 'Eastern Indian chart schemes', 'Kerala Daśā variants', 'Aṣṭakavarga reductions'],
      status: 'Ongoing Inquiry',
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 md:pt-16 pb-12 border-b border-[#E5E1D8]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8B4513] font-semibold bg-[#F5EBE1] px-2.5 py-1 rounded-sm border border-[#E5D8CC]">
              Scholarly Domain
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            {t.research.title}
          </h1>
          <p className="mt-4 text-lg text-[#4B5563] font-serif leading-relaxed">
            {t.research.subtitle}
          </p>
        </div>
      </section>

      {/* Main Research Agenda List */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-12">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Research Domains &amp; Inquiry Agenda
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#4B5563]">
            {t.research.introParagraph}
          </p>
        </div>

        <div className="space-y-6">
          {researchAreas.map((area, index) => (
            <div
              key={area.id}
              id={area.id}
              className="p-6 sm:p-8 bg-white border border-[#E5E1D8] rounded-sm shadow-2xs transition-colors hover:border-[#8B4513]/40"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#8B4513]">
                      0{index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">
                      {area.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                    {area.description}
                  </p>

                  {/* Scope tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {area.scope.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs font-mono text-[#4B5563] bg-[#F9FAFB] border border-[#E5E1D8] rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="shrink-0 md:text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#8B4513] bg-[#F5EBE1] border border-[#E5D8CC] rounded-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B4513]" />
                    {area.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div>
            Scholarly inquiries or contributions to the classical text index can be directed to the Gaṇaka research team.
          </div>
          <Link
            href="/documentation"
            prefetch={false}
            className="inline-flex items-center gap-1.5 font-semibold text-[#1A1A1A] hover:text-[#8B4513] transition-all active:scale-95"
          >
            <span>Read Calculation Philosophy</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
