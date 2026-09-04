'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon } from '@/components/ui/icons';
import { useTranslation } from '@/lib/i18n/use-translation';

export function AboutView() {
  const { t } = useTranslation();

  const principles = [
    {
      title: t.about.p1Title,
      description: t.about.p1Desc,
    },
    {
      title: t.about.p2Title,
      description: t.about.p2Desc,
    },
    {
      title: t.about.p3Title,
      description: t.about.p3Desc,
    },
    {
      title: t.about.p4Title,
      description: t.about.p4Desc,
    },
    {
      title: t.about.p5Title,
      description: t.about.p5Desc,
    },
    {
      title: t.about.p6Title,
      description: t.about.p6Desc,
    },
    {
      title: t.about.p7Title,
      description: t.about.p7Desc,
    },
  ];

  const roadmapItems = [
    { name: 'Astronomy & Ephemeris', phase: 'Engine Phase', status: 'Operational' },
    { name: 'Pañcāṅga Computation', phase: 'Calendrics', status: 'Operational' },
    { name: 'Multiformat Chart Construction', phase: 'Visualization', status: 'Operational' },
    { name: '16 Vargas (Ṣoḍaśavarga)', phase: 'Division Algorithms', status: 'Operational' },
    { name: 'Daśā Systems (Viṁśottarī, etc.)', phase: 'Time-Lord Models', status: 'Operational' },
    { name: 'Aṣṭakavarga & Reductions', phase: 'Point Matrices', status: 'Operational' },
    { name: 'Classical Rule Interpretability', phase: 'Textual Knowledge Base', status: 'Active' },
    { name: 'Regional & Assamese Research', phase: 'Historical Study', status: 'Active' },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 md:pt-16 pb-12 border-b border-[#E5E1D8]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8B4513] font-semibold bg-[#F5EBE1] px-2.5 py-1 rounded-sm border border-[#E5D8CC]">
              Editorial Background
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            {t.about.title}
          </h1>
          <p className="mt-4 text-lg text-[#4B5563] font-serif leading-relaxed">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-20">
        {/* 1. What is Gaṇaka? */}
        <section id="what-is-ganaka" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-xl font-bold text-[#1A1A1A] font-sans">
              What is Gaṇaka?
            </h2>
            <div className="mt-2 text-xs font-mono text-[#6B7280]">
              Sanskrit: <span className="text-[#8B4513] font-semibold">गणक</span> (noun, m.)
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4 text-base text-[#4B5563] leading-relaxed">
            <p>
              {t.about.introParagraph}
            </p>
            <p>
              Gaṇaka revives this foundational role: treating Jyotiṣa not as opaque commercial prophecy,
              but as an intricate, deterministic computational discipline grounded in spherical geometry,
              astronomical observation, and classical textual canons.
            </p>
          </div>
        </section>

        <hr className="border-[#E5E1D8]" />

        {/* 2. The Idea & Purpose */}
        <section id="the-idea" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-xl font-bold text-[#1A1A1A] font-sans">
              The Idea
            </h2>
            <div className="mt-2 text-xs font-mono text-[#6B7280]">
              Computational Transparency
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4 text-base text-[#4B5563] leading-relaxed">
            <p>
              The core idea behind Gaṇaka is to create a modern, open, and mathematically rigorous
              software environment specifically built for the scholarly study, verification, and implementation
              of traditional Jyotiṣa calculation systems.
            </p>
            <p>
              Rather than producing instant black-box outputs with undisclosed rules, Gaṇaka enables researchers,
              students, and practitioners to inspect every formula, compare divergent classical schools, and
              verify computational integrity down to the underlying coordinate transformations.
            </p>
          </div>
        </section>

        <hr className="border-[#E5E1D8]" />

        {/* 3. Principles */}
        <section id="principles" className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#8B4513]">
              Standards of Practice
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              {t.about.principlesTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4B5563]">
              Every module, formula, and visual interface in Gaṇaka is governed by seven non-negotiable tenets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <div
                key={principle.title}
                className="p-6 bg-white border border-[#E5E1D8] rounded-sm shadow-2xs hover:border-[#8B4513]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#8B4513]">
                      0{index + 1}
                    </span>
                    <CheckIcon size={14} className="text-[#8B4513]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A1A]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-[#E5E1D8]" />

        {/* 4. Future Direction */}
        <section id="future-direction" className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#8B4513]">
              Computational Milestones
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              {t.about.roadmapTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4B5563]">
              The calculation engines and research tools available within the Gaṇaka platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmapItems.map((item) => (
              <div
                key={item.name}
                className="p-4 bg-white border border-[#E5E1D8] rounded-sm shadow-2xs hover:border-[#8B4513]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                    {item.phase}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                    {item.name}
                  </h3>
                </div>
                <div className="mt-4 pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-xs font-mono text-[#8B4513]">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-700">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation Callout with tactile active animation */}
        <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/research"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#8B4513] transition-all active:scale-95"
          >
            <span>Proceed to Research Agenda</span>
            <ArrowRightIcon size={14} />
          </Link>
          <Link
            href="/documentation"
            prefetch={false}
            className="text-sm text-[#4B5563] hover:text-[#1A1A1A] transition-all active:scale-95"
          >
            View System Documentation &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
