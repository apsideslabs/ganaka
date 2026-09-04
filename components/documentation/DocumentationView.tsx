'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { useTranslation } from '@/lib/i18n/use-translation';

export function DocumentationView() {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'overview',
      title: t.documentation.secOverviewTitle,
      subtitle: t.documentation.secOverviewSubtitle,
      content: t.documentation.secOverviewContent,
    },
    {
      id: 'architecture',
      title: t.documentation.secArchitectureTitle,
      subtitle: t.documentation.secArchitectureSubtitle,
      content: t.documentation.secArchitectureContent,
    },
    {
      id: 'philosophy',
      title: t.documentation.secPhilosophyTitle,
      subtitle: t.documentation.secPhilosophySubtitle,
      content: t.documentation.secPhilosophyContent,
    },
    {
      id: 'sources',
      title: t.documentation.secSourcesTitle,
      subtitle: t.documentation.secSourcesSubtitle,
      content: t.documentation.secSourcesContent,
    },
    {
      id: 'methods',
      title: t.documentation.secMethodsTitle,
      subtitle: t.documentation.secMethodsSubtitle,
      content: t.documentation.secMethodsContent,
    },
    {
      id: 'changelog',
      title: 'Changelog & Milestones',
      subtitle: 'Version history and release notes',
      content: `Version 1.0.0 (Sidereal Release):
• Production ephemeris and Sidereal solar kinematics (VSOP87 / IAU-1980).
• 16 Harmonic Divisional Charts (Ṣoḍaśavargas D1 to D60).
• Dainika Pañcāṅga with sunrise-anchored limbs, Choghadiyā, and planetary Horās.
• Canonical Muhūrta engine with 21 Mahādoṣa exclusions.
• Multi-language localized UI: English, Hindi, Sanskrit, and Assamese.
• Persistent customizable Platform Settings with Default Location geodetic calibration.`,
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 md:pt-16 pb-12 border-b border-[#E5E1D8]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8B4513] font-semibold bg-[#F5EBE1] px-2.5 py-1 rounded-sm border border-[#E5D8CC]">
              Technical Specifications
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            {t.documentation.title}
          </h1>
          <p className="mt-4 text-lg text-[#4B5563] font-serif leading-relaxed">
            {t.documentation.subtitle}
          </p>
        </div>
      </section>

      {/* Main Documentation Body */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Sticky Sidebar TOC */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-1 text-sm">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#8B4513] block mb-3">
                Contents
              </span>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-1.5 text-[#4B5563] hover:text-[#8B4513] transition-colors border-l-2 border-transparent hover:border-[#8B4513] pl-3"
                >
                  {sec.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Right: Detailed Content Sections */}
          <main className="lg:col-span-9 space-y-16">
            <p className="text-base text-[#4B5563] leading-relaxed">
              {t.documentation.introParagraph}
            </p>

            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 space-y-4 pt-6 border-t border-[#E5E1D8] first:border-t-0 first:pt-0"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
                    {section.title}
                  </h2>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#6B7280] mt-1">
                    {section.subtitle}
                  </p>
                </div>
                <div className="text-base text-[#4B5563] leading-relaxed whitespace-pre-line font-serif">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Bottom Callout */}
            <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/workspace"
                prefetch={false}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#8B4513] transition-all active:scale-95"
              >
                <span>Launch Calculation Workspace</span>
                <ArrowRightIcon size={14} />
              </Link>
              <Link
                href="/about"
                prefetch={false}
                className="text-sm text-[#4B5563] hover:text-[#1A1A1A] transition-all active:scale-95"
              >
                About the Editorial Team &rarr;
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
