'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GeometricSolarSystemBackground } from '@/components/background/GeometricSolarSystemBackground';
import { HomeBirthDetailsPanel } from '@/components/home/HomeBirthDetailsPanel';
import { GanakaButton } from '@/components/ui/GanakaButton';
import {
  Compass,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  Cpu,
  Orbit,
  MapPin,
  Clock,
  Sun,
  Moon,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function HomeView() {
  const { t, language } = useTranslation();
  const [navigatingToPanchanga, setNavigatingToPanchanga] = useState(false);
  const [navigatingToWorkspace, setNavigatingToWorkspace] = useState(false);

  return (
    <div className="w-full flex flex-col items-center bg-[#F2EDE3]">
      {/* 1. HERO WORKSTATION SECTION WITH CELESTIAL MECHANICS BACKGROUND */}
      <section
        id="hero-section"
        className="relative isolate w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden"
      >
        {/* Background Coordinates Grid & Radial Vignette */}
        <GeometricSolarSystemBackground />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col space-y-6">
          {/* Header Instrument Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD5C6] pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B2F0B] ring-4 ring-[#8B2F0B]/15 animate-pulse" />
              <span className="font-bold text-[#171614] uppercase tracking-widest">
                {t.hero.statusBarTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#5C5850] text-[11px]">
              <span className="px-2 py-0.5 bg-[#E8E1D3] text-[#171614] rounded-xs font-bold border border-[#D5CDBC]">
                VSOP87 / IAU-1980
              </span>
              <span>•</span>
              <span>Lahiri / Chitra Paksha (24°14&apos;38&quot;)</span>
              <span>•</span>
              <span>{t.hero.verifiedCities}</span>
            </div>
          </div>

          {/* Core Title & Epigraph (Sanskrit stays authentic across all translations) */}
          <div className="space-y-2 pt-1">
            <div className="font-serif italic text-xs sm:text-sm text-[#8B2F0B] tracking-wider font-semibold">
              {t.hero.epigraph}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#171614] leading-[1.08]">
              {t.hero.title}
            </h1>
            <p className="text-sm sm:text-base text-[#5C5850] font-serif leading-relaxed max-w-3xl pt-1">
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
              icon={<Calendar className="w-4 h-4 text-[#8B2F0B]" />}
            >
              {t.hero.ctaViewPanchanga}
            </GanakaButton>

            <Link
              href="/about"
              className="text-xs font-mono text-[#5C5850] hover:text-[#8B2F0B] underline uppercase tracking-wider ml-auto active:scale-95 transition-all select-none"
            >
              {t.hero.ctaResearch} &rarr;
            </Link>
          </div>
        </div>

        {/* 2. PROMINENT EPHEMERIS CALCULATION CONSOLE (Anchored in Hero) */}
        <div id="calculate-chart-panel" className="relative z-10 mt-8 max-w-5xl mx-auto">
          <HomeBirthDetailsPanel />
        </div>
      </section>

      {/* 3. LIVE ASTRONOMICAL STATUS BAR */}
      <section
        id="live-ephemeris-strip"
        className="w-full border-y border-[#DCD5C6] bg-[#EAE3D4] py-4 shadow-inner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
            {/* Metric 1 */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs">
              <Sun className="w-4 h-4 text-[#C49A45] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#847E72] uppercase">Sūrya Sphuṭa</div>
                <div className="font-bold text-[#171614] truncate">Apparent Solar Arc</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs">
              <Moon className="w-4 h-4 text-[#8B2F0B] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#847E72] uppercase">Chandra Sphuṭa</div>
                <div className="font-bold text-[#171614] truncate">Sidereal Moon / Nakṣatra</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs">
              <Compass className="w-4 h-4 text-[#C49A45] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#847E72] uppercase">Ayanāṃśa Baseline</div>
                <div className="font-bold text-[#171614]">Lahiri / Chitra Paksha</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs">
              <Clock className="w-4 h-4 text-[#8B2F0B] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#847E72] uppercase">Sunrise Anchor</div>
                <div className="font-bold text-[#171614]">Apparent Solar Horizon</div>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="flex items-center gap-2.5 p-2.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs col-span-2 sm:col-span-1">
              <MapPin className="w-4 h-4 text-[#171614] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-[#847E72] uppercase">Geodetic Engine</div>
                <div className="font-bold text-[#171614]">{t.hero.verifiedCities}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE COMPUTATIONAL DOMAINS (6 TACTILE 3D CARDS WITH GRAPHICAL MINIATURES) */}
      <section
        id="core-domains-section"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16"
      >
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8B2F0B] flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5" />
            <span>Calculation Framework</span>
          </div>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#171614]">
            {t.features.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-[#5C5850] font-serif leading-relaxed">
            {t.features.sectionSubtitle}
          </p>
        </div>

        {/* 6-Column 3D Tactile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Horoscopy & Vargas */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[01]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">D1 – D60</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                {t.features.sixteenVargasTitle}
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                {t.features.sixteenVargasDesc}
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-center">
                <svg className="w-full h-16 text-[#8B2F0B]" viewBox="0 0 160 64" fill="none">
                  <rect x="30" y="4" width="100" height="56" stroke="#DCD5C6" strokeWidth="1" />
                  <line x1="30" y1="4" x2="130" y2="60" stroke="#BCB4A4" strokeWidth="0.75" />
                  <line x1="130" y1="4" x2="30" y2="60" stroke="#BCB4A4" strokeWidth="0.75" />
                  <polygon points="80,4 130,32 80,60 30,32" stroke="#8B2F0B" strokeWidth="1.2" fill="#FCFAF6" />
                  <text x="80" y="35" fontSize="8" fontFamily="serif" textAnchor="middle" fill="#8B2F0B" fontWeight="bold">LAGNA</text>
                </svg>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">16 Vargas • Bhāva Sphuṭas</span>
              <Link href="/workspace" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                Open &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Daily Panchanga */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[02]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">Pañcāṅga</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                Dainika Pañcāṅga &amp; Ephemeris
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                Sub-second dynamic sunrise-anchored five limbs (Tithi, Vāra, Nakṣatra, Yoga, Karaṇa), Choghadiyā windows, planetary Horās, and rising Lagna transitions.
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-around text-[10px] font-mono">
                <span className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">Tithi</span>
                <span className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">Vāra</span>
                <span className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs text-[#8B2F0B] font-bold">Nakṣatra</span>
                <span className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">Yoga</span>
                <span className="px-2 py-1 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">Karaṇa</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">Five Limbs • Horās</span>
              <Link href="/panchanga" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                View &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Classical Muhurta Finder */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[03]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">Electional</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                {t.features.muhurtaEngineTitle}
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                {t.features.muhurtaEngineDesc}
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-[#171614]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C49A45]" />
                  <span>21 Doṣa Exclusions</span>
                </div>
                <span className="px-1.5 py-0.5 bg-[#171614] text-[#C49A45] text-[10px] rounded-xs font-bold">
                  Purity: 94/100
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">Muhūrta Cintāmaṇi</span>
              <Link href="/panchanga?tab=muhurta" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                Search &rarr;
              </Link>
            </div>
          </div>

          {/* Card 4: Compatibility & Milan */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[04]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">36 Guṇas</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                Aṣṭakūṭa Milan &amp; Compatibility
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                Authentic 36-point Guna Milan breakdown (Varṇa, Vaśya, Tārā, Yoni, Maitrī, Gaṇa, Bhakūṭa, Nāḍī), Maṅgala Doṣa exceptions, and Vedha audits.
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between text-xs font-mono">
                <span className="text-[#5C5850]">Aṣṭakūṭa Metric</span>
                <span className="font-bold text-[#8B2F0B]">8 Kūṭas • 36 Points</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">Maṅgala Parihāra</span>
              <Link href="/workspace?tab=jaimini" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                Calculate &rarr;
              </Link>
            </div>
          </div>

          {/* Card 5: Astronomical Rigor */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[05]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">Śaḍbala</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                {t.features.astronomicalRigorTitle}
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                {t.features.astronomicalRigorDesc}
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                <span className="bg-[#FCFAF6] py-0.5 border border-[#DCD5C6]">Sthāna</span>
                <span className="bg-[#FCFAF6] py-0.5 border border-[#DCD5C6]">Dik</span>
                <span className="bg-[#FCFAF6] py-0.5 border border-[#DCD5C6]">Kāla</span>
                <span className="bg-[#FCFAF6] py-0.5 border border-[#DCD5C6]">Ceṣṭā</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">Parāśari Śaḍbala • SAV</span>
              <Link href="/workspace?tab=shadbala" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                Inspect &rarr;
              </Link>
            </div>
          </div>

          {/* Card 6: Source Transparency & Regional Traditions */}
          <div className="p-6 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B2F0B]">[06]</span>
                <span className="text-[11px] font-mono text-[#847E72] uppercase">Traditions</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#171614]">
                {t.features.regionalTraditionsTitle}
              </h3>
              <p className="text-xs text-[#5C5850] font-serif leading-relaxed">
                {t.features.regionalTraditionsDesc}
              </p>

              {/* Vector Miniature Preview Graphic */}
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between text-[11px] font-mono">
                <span>Assamese • Bengali • Kerala</span>
                <span className="text-[#8B2F0B] font-bold">Traceable</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5850]">Classical Provenance</span>
              <Link href="/about" className="text-[#8B2F0B] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all">
                Read &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AUDITABLE CLASSICAL TREATISE MATRIX */}
      <section
        id="classical-treatises-section"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 border-t border-[#DCD5C6] bg-[#EAE4D6]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Thesis */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest font-bold text-[#8B2F0B]">
              Canonical Lineage
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#171614]">
              Authentic Sanskrit Treatises
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5850] font-serif leading-relaxed">
              Every mathematical calculation in Gaṇaka cites its canonical verse from classical texts.
              No arbitrary adjustments, black-box scores, or commercial heuristics.
            </p>
            <div className="p-4 bg-[#FCFAF6] border-l-2 border-[#8B2F0B] rounded-xs shadow-xs text-xs font-mono text-[#171614]">
              <div className="font-bold text-[#8B2F0B]">Canonical Principle</div>
              <div className="mt-1 text-[#5C5850]">
                All astronomical positions and Jyotiṣa yogas reference verified Sanskrit recensions with book, chapter, and shloka citations.
              </div>
            </div>
          </div>

          {/* Right Column: 4 Clean Treatise Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Treatise 1 */}
            <div className="p-4 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs space-y-1.5">
              <div className="text-[10px] font-mono text-[#8B2F0B] uppercase font-bold">Parāśara Horā</div>
              <div className="font-serif font-bold text-sm text-[#171614]">Bṛhat Parāśara Horā Śāstra</div>
              <p className="text-xs text-[#5C5850] font-serif">
                Ṣoḍaśavargas (Ch. 6–7), Śaḍbala (Ch. 27–29), Viṃśottarī Daśā (Ch. 46–48), and Avayoga remedies.
              </p>
            </div>

            {/* Treatise 2 */}
            <div className="p-4 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs space-y-1.5">
              <div className="text-[10px] font-mono text-[#8B2F0B] uppercase font-bold">Astronomy &amp; Siddhānta</div>
              <div className="font-serif font-bold text-sm text-[#171614]">Sūrya Siddhānta</div>
              <p className="text-xs text-[#5C5850] font-serif">
                Madhyamādhikāra, Sphuṭādhikāra, Tri-praśnādhikāra (diurnal arcs, Lagna ascendant, and sunrise reckoning).
              </p>
            </div>

            {/* Treatise 3 */}
            <div className="p-4 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs space-y-1.5">
              <div className="text-[10px] font-mono text-[#8B2F0B] uppercase font-bold">Electional Astrology</div>
              <div className="font-serif font-bold text-sm text-[#171614]">Muhūrta Cintāmaṇi</div>
              <p className="text-xs text-[#5C5850] font-serif">
                Pañcāṅga Shuddhi, 21 Mahādoṣa evaluation, Viṣṭi Bhadrā avoidance, and Vivāha / Saṃskāra timings.
              </p>
            </div>

            {/* Treatise 4 */}
            <div className="p-4 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-xs space-y-1.5">
              <div className="text-[10px] font-mono text-[#8B2F0B] uppercase font-bold">Classical Horoscopy</div>
              <div className="font-serif font-bold text-sm text-[#171614]">Bṛhat Jātaka &amp; Phaladīpikā</div>
              <p className="text-xs text-[#5C5850] font-serif">
                Varāhamihira&apos;s planetary dignities, Jaimini Kāraka mechanics, and Mantreśvara&apos;s transit formulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM WORKSTATION LAUNCH BANNER */}
      <section
        id="explore-invitation"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14"
      >
        <div className="p-6 sm:p-8 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs shadow-3d-console flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#171614]">
              Launch the Complete Gaṇaka Workstation
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5850] font-serif">
              Full workspace with 5-domain navigation, 16 Vargas, Viṃśottarī timelines, Śaḍbala matrices, and 220+ coordinates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              variant="outline"
              size="md"
              loading={navigatingToPanchanga}
              onClick={() => setNavigatingToPanchanga(true)}
            >
              {t.nav.panchanga}
            </GanakaButton>
          </div>
        </div>
      </section>
    </div>
  );
}
