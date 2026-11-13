'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GeometricSolarSystemBackground } from '@/components/background/GeometricSolarSystemBackground';
import { GanakaButton } from '@/components/ui/GanakaButton';
import { AnalogClockDial } from '@/components/ui/AnalogClockDial';

const HomeBirthDetailsPanel = dynamic(
  () =>
    import('@/components/home/HomeBirthDetailsPanel').then(
      (mod) => mod.HomeBirthDetailsPanel
    ),
  {
    loading: () => (
      <div className="w-full min-h-[360px] p-8 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-center shadow-sm">
        <AnalogClockDial live size="md" title="Gaṇaka Calculation Console" />
      </div>
    ),
  }
);
import {
  Compass,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  Orbit,
  Clock,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function HomeView() {
  const { t } = useTranslation();
  const [navigatingToPanchanga, setNavigatingToPanchanga] = useState(false);
  const [navigatingToWorkspace, setNavigatingToWorkspace] = useState(false);

  return (
    <div className="w-full flex flex-col items-center bg-[#FAF9F6]">
      {/* 1. HERO WORKSTATION SECTION WITH CELESTIAL BACKGROUND */}
      <section
        id="hero-section"
        className="relative isolate w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden"
      >
        {/* Background Coordinates Grid & Radial Vignette */}
        <GeometricSolarSystemBackground />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col space-y-6">
          {/* Header Instrument Status Bar - Clean and Professional */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C2D19] ring-4 ring-[#8C2D19]/15 animate-pulse" />
              <span className="font-semibold text-stone-800 tracking-wider uppercase text-xs">
                {t.hero.statusBarTitle}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-stone-500 text-xs font-sans">
              <span className="font-medium text-stone-700">Canonical Siddhāntas</span>
              <span className="text-stone-300">•</span>
              <span>16 Ṣoḍaśavargas</span>
              <span className="text-stone-300">•</span>
              <span>Sūryodaya Ephemeris</span>
            </div>
          </div>

          {/* Core Title & Epigraph */}
          <div className="space-y-3 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-600/20 text-[#8C2D19] rounded-full text-xs font-serif font-semibold tracking-wide">
              <span>{t.hero.epigraph}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-[1.12]">
              {t.hero.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed max-w-3xl pt-1">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <GanakaButton
              href="#calculate-chart-panel"
              variant="primary"
              size="md"
              id="hero-primary-cta"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {t.hero.ctaEnterDetails}
            </GanakaButton>

            <GanakaButton
              href="/panchanga"
              variant="outline"
              size="md"
              id="hero-panchanga-cta"
              loading={navigatingToPanchanga}
              onClick={() => setNavigatingToPanchanga(true)}
              icon={<Calendar className="w-4 h-4 text-[#8C2D19]" />}
            >
              {t.hero.ctaViewPanchanga}
            </GanakaButton>

            <Link
              href="/about"
              className="text-xs font-mono text-stone-500 hover:text-[#8C2D19] uppercase tracking-wider ml-auto active:scale-95 transition-all select-none flex items-center gap-1"
            >
              <span>{t.hero.ctaResearch}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 2. PROMINENT EPHEMERIS CALCULATION CONSOLE (Anchored in Hero) */}
        <div id="calculate-chart-panel" className="relative z-10 mt-10 max-w-5xl mx-auto">
          <HomeBirthDetailsPanel />
        </div>
      </section>

      {/* 3. FOUNDATIONAL METHODOLOGY BAR (Clean, purposeful architectural pillars) */}
      <section
        id="foundational-pillars-strip"
        className="w-full border-y border-stone-200/80 bg-stone-100/70 py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="flex items-start gap-3.5 p-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Sun className="w-4 h-4 text-[#8C2D19]" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 font-serif text-sm">Siddhānta Rigor</h4>
                <p className="text-stone-600 mt-0.5 leading-normal">
                  Planetary positions calculated strictly without numerical shortcuts or heuristic approximations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Layers className="w-4 h-4 text-[#8C2D19]" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 font-serif text-sm">Ṣoḍaśavargas &amp; Bhāva Chalit</h4>
                <p className="text-stone-600 mt-0.5 leading-normal">
                  All 16 canonical divisional charts (D1–D60) with customizable house division standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-4 h-4 text-[#8C2D19]" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 font-serif text-sm">Traceable Provenance</h4>
                <p className="text-stone-600 mt-0.5 leading-normal">
                  Every calculation cites its corresponding Sanskrit shloka from classical treatises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE COMPUTATIONAL DOMAINS (6 Refined, Professional Cards) */}
      <section
        id="core-domains-section"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-20"
      >
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8C2D19] flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5" />
            <span>Calculation Framework</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
            {t.features.sectionTitle}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
            {t.features.sectionSubtitle}
          </p>
        </div>

        {/* 6-Column Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {/* Card 1: Horoscopy & Vargas */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  षोडशवर्ग
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t.features.sixteenVargasTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  {t.features.sixteenVargasDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">D1–D60 Vargas</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Bhāva Chalit</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Nakṣatra Padas</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">16 Harmonic Divisions</span>
              <Link href="/workspace" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                Open Workspace &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Daily Panchanga */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  दैनिक पञ्चाङ्ग
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Dainika Pañcāṅga &amp; Ephemeris
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  Dynamic sunrise-anchored five limbs (Tithi, Vāra, Nakṣatra, Yoga, Karaṇa), Choghadiyā windows, planetary Horās, and rising Lagna transitions.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Five Limbs</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Planetary Horās</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Choghadiyā</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Sūryodaya Ephemeris</span>
              <Link href="/panchanga" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                View Pañcāṅga &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Classical Muhurta Finder */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  मुहूर्त निर्णय
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t.features.muhurtaEngineTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  {t.features.muhurtaEngineDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">21 Mahādoṣa Audits</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Viṣṭi Bhadrā</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Saṃskāra Timings</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Muhūrta Cintāmaṇi</span>
              <Link href="/panchanga?tab=muhurta" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                Find Muhūrta &rarr;
              </Link>
            </div>
          </div>

          {/* Card 4: Compatibility & Milan */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  अष्टकूट मिलन
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Aṣṭakūṭa Milan &amp; Compatibility
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  Authentic 36-point Guna Milan breakdown across 8 kūṭas (Varṇa, Vaśya, Tārā, Yoni, Maitrī, Gaṇa, Bhakūṭa, Nāḍī) with Maṅgala Doṣa exceptions.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">36 Guṇa Breakdown</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Maṅgala Parihāra</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Vedha &amp; Nāḍī</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">8 Kūṭas • 36 Points</span>
              <Link href="/matching" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                Match Charts &rarr;
              </Link>
            </div>
          </div>

          {/* Card 5: Astronomical Rigor */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <Orbit className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  षड्बल
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t.features.astronomicalRigorTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  Sixfold planetary strength evaluation (Sthāna, Dik, Kāla, Ceṣṭā, Naisargika, Dṛgbala) alongside Sarvāṣṭakavarga matrices.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Sthāna &amp; Dik Bala</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Kāla &amp; Ceṣṭā</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Sarvāṣṭakavarga</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Parāśari Potency</span>
              <Link href="/workspace?tab=shadbala" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                Inspect Śaḍbala &rarr;
              </Link>
            </div>
          </div>

          {/* Card 6: Source Transparency & Regional Traditions */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-serif text-stone-500 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/70">
                  परम्परा
                </span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t.features.regionalTraditionsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed mt-1.5">
                  {t.features.regionalTraditionsDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">North &amp; South Formats</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Eastern Traditions</span>
                <span className="px-2 py-0.5 bg-stone-50 text-stone-600 rounded text-[11px] font-mono border border-stone-200/60">Canonical Provenance</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Classical Lineages</span>
              <Link href="/about" className="text-[#8C2D19] font-semibold hover:underline flex items-center gap-1 transition-all">
                Read Research &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AUDITABLE CLASSICAL TREATISE MATRIX */}
      <section
        id="classical-treatises-section"
        className="w-full border-t border-stone-200/80 bg-stone-100/60 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Thesis */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8C2D19]">
                Canonical Lineage • शास्त्र प्रमाणम्
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
                Authentic Sanskrit Treatises
              </h2>
              <p className="text-sm text-stone-600 font-sans leading-relaxed">
                Every mathematical calculation and astrological formulation in Gaṇaka cites its canonical verse from classical texts. No arbitrary adjustments, black-box scores, or commercial heuristics.
              </p>
              <div className="p-4 bg-white border border-stone-200/90 rounded-xl shadow-xs text-xs text-stone-700 space-y-1">
                <div className="font-semibold text-[#8C2D19] font-serif">Verifiable Methodology</div>
                <div className="text-stone-600 font-sans leading-normal">
                  All planetary positions, divisional charts, and Jyotiṣa yogas reference verified Sanskrit recensions with chapter and shloka citations.
                </div>
              </div>
            </div>

            {/* Right Column: 4 Clean Treatise Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Treatise 1 */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-xl shadow-xs space-y-2 hover:border-stone-300 transition-colors">
                <div className="text-[11px] font-mono text-[#8C2D19] uppercase font-semibold">Parāśara Horā</div>
                <div className="font-serif font-bold text-sm text-stone-900">
                  Bṛhat Parāśara Horā Śāstra
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Ṣoḍaśavargas (Ch. 6–7), Śaḍbala (Ch. 27–29), Viṃśottarī Daśā (Ch. 46–48), and Avayoga remedies.
                </p>
              </div>

              {/* Treatise 2 */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-xl shadow-xs space-y-2 hover:border-stone-300 transition-colors">
                <div className="text-[11px] font-mono text-[#8C2D19] uppercase font-semibold">Astronomy &amp; Siddhānta</div>
                <div className="font-serif font-bold text-sm text-stone-900">
                  Sūrya Siddhānta
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Madhyamādhikāra, Sphuṭādhikāra, and Tri-praśnādhikāra (diurnal arcs, Lagna ascendant, and sunrise reckoning).
                </p>
              </div>

              {/* Treatise 3 */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-xl shadow-xs space-y-2 hover:border-stone-300 transition-colors">
                <div className="text-[11px] font-mono text-[#8C2D19] uppercase font-semibold">Electional Astrology</div>
                <div className="font-serif font-bold text-sm text-stone-900">
                  Muhūrta Cintāmaṇi
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pañcāṅga Shuddhi, 21 Mahādoṣa evaluation, Viṣṭi Bhadrā avoidance, and Vivāha / Saṃskāra timings.
                </p>
              </div>

              {/* Treatise 4 */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-xl shadow-xs space-y-2 hover:border-stone-300 transition-colors">
                <div className="text-[11px] font-mono text-[#8C2D19] uppercase font-semibold">Classical Horoscopy</div>
                <div className="font-serif font-bold text-sm text-stone-900">
                  Bṛhat Jātaka &amp; Phaladīpikā
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Varāhamihira&apos;s planetary dignities, Jaimini Kāraka mechanics, and Mantreśvara&apos;s transit formulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM WORKSTATION LAUNCH BANNER */}
      <section
        id="explore-invitation"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16"
      >
        <div className="p-8 sm:p-10 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-stone-800">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Interactive Jyotiṣa Workstation
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
              Complete computational environment with 16 divisional charts, live planetary positions, Viṃśottarī timelines, and comprehensive astronomical tables.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <GanakaButton
              href="/workspace"
              variant="primary"
              size="md"
              loading={navigatingToWorkspace}
              onClick={() => setNavigatingToWorkspace(true)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Open Workspace
            </GanakaButton>

            <GanakaButton
              href="/panchanga"
              variant="secondary"
              size="md"
              loading={navigatingToPanchanga}
              onClick={() => setNavigatingToPanchanga(true)}
            >
              {t.nav.panchanga}
            </GanakaButton>
          </div>
        </div>
      </section>

      {/* Navigation overlays show the current time — these routes compute for now */}
      {navigatingToPanchanga && (
        <AnalogClockDial isOverlay live size="md" title="Loading Drik Pañcāṅga" />
      )}
      {navigatingToWorkspace && (
        <AnalogClockDial isOverlay live size="md" title="Loading Kuṇḍalī Workspace" />
      )}
    </div>
  );
}
