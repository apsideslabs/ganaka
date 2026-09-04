'use client';

/**
 * Gaṇaka — Avakahada Chakra Component (अवकहड़ा चक्र)
 * Professional, clean classical tabular presentation of all essential birth classifications.
 * Follows classical Jyotiṣa / Pañcāṅga standards (BPHS, Muhūrta Chintāmaṇi).
 * Strictly renders deterministic data without client-side guessing or colorful AI card grids.
 */

import React, { useMemo } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import { calculateAvakahadaChakra, AvakahadaChakraResult } from '../../lib/jyotisha/avakahada';
import {
  Table as TableIcon,
  Sparkles,
  Info,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
} from 'lucide-react';

interface AvakahadaPanelProps {
  chart: JyotishaChart;
}

export const AvakahadaPanel: React.FC<AvakahadaPanelProps> = ({ chart }) => {
  const avakahada: AvakahadaChakraResult = useMemo(() => {
    return calculateAvakahadaChakra(chart);
  }, [chart]);

  return (
    <div className="space-y-6">
      {/* 1. Header Information Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
            <h2 className="text-base font-serif font-bold text-slate-900">
              Avakahada Cakra (अवकहड़ा चक्र)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 font-mono font-medium">
              Classical Birth Matrix
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Canonical 34-factor birth classifications, Ashtakoota fundamentals, Vedha, Pāya, and Ghaṭī mechanics based on BPHS &amp; Muhūrta Chintāmaṇi.
          </p>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
            <span className="text-slate-500 mr-1.5">Lagna:</span>
            <span className="font-serif font-bold text-slate-900">{avakahada.lagna.sanskritName} ({avakahada.lagna.name})</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
            <span className="text-slate-500 mr-1.5">Rāśi:</span>
            <span className="font-serif font-bold text-[#8C2D19]">{avakahada.rashi.sanskritName} ({avakahada.rashi.name})</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
            <span className="text-slate-500 mr-1.5">Nakṣatra:</span>
            <span className="font-serif font-bold text-slate-900">{avakahada.nakshatra.name} (Pada {avakahada.nakshatra.pada})</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50/80 border border-amber-200 rounded-xl font-medium text-amber-950">
            <span className="text-amber-700 mr-1.5">Nāmakṣara:</span>
            <span className="font-serif font-bold text-amber-900">{avakahada.namakshara.fullDisplay}</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY AVAKAHADA CHAKRA MASTER TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-[#8C2D19]" />
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-800">
              Primary Avakahada &amp; Birth Identifiers Table
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Calculated from sidereal longitude λ = {avakahada.rashi.totalLongitude}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-48">Classification (अङ्ग)</th>
                <th className="py-3 px-4 w-52">Calculated Value (मान)</th>
                <th className="py-3 px-4 w-40">Sanskrit / Devanagari</th>
                <th className="py-3 px-4">Classical Significance &amp; Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Lagna */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">01</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Janma Lagna (Ascendant)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.lagna.name} ({avakahada.lagna.degreeFormatted})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.lagna.sanskritName} ({avakahada.lagna.devanagari})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Eastern horizon cusp at birth; determines physical constitution and vitality
                </td>
              </tr>

              {/* Lagna Lord */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">02</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Lagna Lord (Lagneśa)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.lagna.lordName}</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">{avakahada.lagna.lordSanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Governs bodily strength, longevity, and overall life path alignment
                </td>
              </tr>

              {/* Janma Rashi */}
              <tr className="hover:bg-slate-50/60 transition-colors bg-amber-50/30">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">03</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Janma Rāśi (Moon Sign)</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-bold">
                  {avakahada.rashi.name} ({avakahada.rashi.degreeInRashi})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.rashi.sanskritName} ({avakahada.rashi.devanagari})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Seat of consciousness (Manas), emotional template, and Gocāra transit base
                </td>
              </tr>

              {/* Rashi Lord */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">04</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Rāśi Lord (Rāśīśa)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.rashi.lordName}</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">{avakahada.rashi.lordSanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Primary dispositor of Moon; determines mental tranquility and happiness
                </td>
              </tr>

              {/* Surya Rashi */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">05</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Sūrya Rāśi (Sun Sign)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.sunSign.name} ({avakahada.sunSign.degreeInRashi})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.sunSign.sanskritName} ({avakahada.sunSign.devanagari})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Soul identity (Ātman), sovereign authority, and solar Sauramāsa solar month
                </td>
              </tr>

              {/* Janma Nakshatra */}
              <tr className="hover:bg-slate-50/60 transition-colors bg-amber-50/30">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">06</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Janma Nakṣatra</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-bold">
                  {avakahada.nakshatra.name} (#{avakahada.nakshatra.number})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.nakshatra.sanskritName} ({avakahada.nakshatra.devanagari})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Lunar mansion of birth; governs Daśā cycles, temperament, and biological rhythm
                </td>
              </tr>

              {/* Nakshatra Pada */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">07</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Nakṣatra Pada (Caraṇa)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  Pada {avakahada.nakshatra.pada} (Quarter {avakahada.nakshatra.pada}/4)
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">
                  {avakahada.nakshatra.pada} चरण (Lord: {avakahada.nakshatra.padaLordName})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  3° 20&apos; arc segment; defines the D-9 Navāṃśa sign and specific phonetic sound
                </td>
              </tr>

              {/* Nakshatra Lord */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">08</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Nakṣatra Lord (Nakṣatreśa)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.nakshatra.lordName}</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">{avakahada.nakshatra.lordSanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Viṃśottarī Janma Daśā ruler initiating lifetime progression cycles
                </td>
              </tr>

              {/* Adhyakshara / Namakshara */}
              <tr className="hover:bg-slate-50/60 transition-colors bg-amber-50/40">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">09</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Nāmakṣara / Adhyakṣara</td>
                <td className="py-2.5 px-4 text-amber-950 font-serif font-bold text-sm">
                  {avakahada.namakshara.fullDisplay}
                </td>
                <td className="py-2.5 px-4 text-amber-900 font-serif font-bold text-sm">
                  {avakahada.namakshara.devanagari} ({avakahada.namakshara.iast})
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Auspicious first phonetic syllable for naming (Nāmakaraṇa Saṃskāra)
                </td>
              </tr>

              {/* Paya */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">10</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Pāya (Metal Foot of Birth)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.paya.type.split(' ')[0]} ({avakahada.paya.metal.split(' ')[0]})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.paya.sanskritPhala.split(' ')[0]}
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Moon in Bhāva {avakahada.paya.houseFromLagna} from Lagna: {avakahada.paya.result}
                </td>
              </tr>

              {/* Varna */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">11</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Varṇa (Temperamental Order)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.varna.category}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.varna.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Derived from {avakahada.varna.element}; 1 point in Aṣṭakūṭa marriage compatibility
                </td>
              </tr>

              {/* Vashya */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">12</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Vaśya (Inherent Nature)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.vashya.category}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.vashya.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  {avakahada.vashya.description}; 2 points in Aṣṭakūṭa
                </td>
              </tr>

              {/* Yoni & Yoni Vaira */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">13</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Yoni (Animal Species)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.yoni.animal} [{avakahada.yoni.gender}]
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">{avakahada.yoni.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Physical/sexual affinity (4 points in Aṣṭakūṭa); Inimical Yoni: <strong className="text-slate-800">{avakahada.yoni.inimicalYoni} ({avakahada.yoni.inimicalSanskrit})</strong>
                </td>
              </tr>

              {/* Gana */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">14</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Gaṇa (Temperament)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.gana.type}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.gana.sanskrit} गण</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  {avakahada.gana.temperament}; 6 points in Aṣṭakūṭa
                </td>
              </tr>

              {/* Nadi */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">15</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Nāḍī (Prāṇic Pulse / Humor)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.nadi.type}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.nadi.sanskrit} नाड़ी</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Ayurvedic humor ({avakahada.nadi.humor}); 8 points (highest weighting in Aṣṭakūṭa)
                </td>
              </tr>

              {/* Rajju */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">16</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Rajju (Body Axis / Cord)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.rajju.limb}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.rajju.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Five bodily zones (Head, Neck, Navel, Waist, Feet); crucial for longevity alignment
                </td>
              </tr>

              {/* Tattva */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">17</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Tattva (Element &amp; Lord)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.tattva.type}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.tattva.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Primary cosmic element governing psychological drives; Lord: {avakahada.tattva.lordName}
                </td>
              </tr>

              {/* Vihaga */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">18</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Vihaga (Avakahada Pakṣi)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.vihaga.bird}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.vihaga.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Avakahada avian totem used in traditional biorhythm and Pañcapakṣī correlations
                </td>
              </tr>

              {/* Vedha */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">19</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Vedha (Piercing Star)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.vedha.afflictingNakshatraName} (#{avakahada.vedha.afflictingNakshatraNumber})
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.vedha.pairText}
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Nakshatra Vedha Cakra mutual affliction pair to be avoided in Muhūrta &amp; alliance
                </td>
              </tr>

              {/* Yunja */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">20</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Yuñja (Zonal Sector)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.yunja.type}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.yunja.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Tri-fold zodiacal division (Aśvinī–Puṣya, Āśleṣā–Anurādhā, Jyeṣṭhā–Revatī)
                </td>
              </tr>

              {/* Gotra */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">21</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Gotra (Saptarṣi Lineage)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.gotra.rishi}</td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.gotra.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Cosmic Rishi ruler of the Janma Nakṣatra among the 7 Prajāpatis
                </td>
              </tr>

              {/* Vriksha */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">22</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Vṛkṣa (Sacred Tree / Plant)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.vriksha.treeName}</td>
                <td className="py-2.5 px-4 text-emerald-800 font-serif font-semibold">{avakahada.vriksha.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Botanical: <span className="italic">{avakahada.vriksha.botanicalName}</span>; recommended for environmental harmony
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MATHEMATICAL COMPUTATIONS & TIME METRICS (BHAYĀT, BHĀBHOGA, DAŚĀ BALANCE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bhayat (भयात) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-slate-900">Bhayāt (भयात)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Elapsed Time
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The portion of the Janma Nakṣatra elapsed from its ingress moment up to the exact birth time.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Ghaṭī-Pala-Vipala:</span>
              <strong className="text-slate-900">{avakahada.mathematics.bhayat.ghatis} Gh : {avakahada.mathematics.bhayat.palas} Pal : {avakahada.mathematics.bhayat.vipalas} Vip</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Arc Ingress:</span>
              <strong className="text-[#8C2D19]">{avakahada.mathematics.bhayat.elapsedFormatted}</strong>
            </div>
          </div>
        </div>

        {/* Bhabhoga (भाभोग) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-slate-900">Bhābhoga (भाभोग)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Total Nakṣatra Span
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The total duration and span of the Janma Nakṣatra standard canonical astronomical measure.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Standard Ghaṭīs:</span>
              <strong className="text-slate-900">{avakahada.mathematics.bhabhoga.formattedGhatis}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Arc Span:</span>
              <strong className="text-[#8C2D19]">{avakahada.mathematics.bhabhoga.spanFormatted}</strong>
            </div>
          </div>
        </div>

        {/* Janma Dasha Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-slate-900">Janma Daśā Balance (दशा शेष)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              Viṃśottarī At Birth
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Exact planetary balance remaining in the starting Viṃśottarī Daśā cycle at the moment of birth.
          </p>
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5 font-mono text-xs text-amber-950">
            <div className="flex justify-between">
              <span>Starting Lord:</span>
              <strong className="text-[#8C2D19] font-serif">{avakahada.mathematics.dashaBalance.lordSanskrit}</strong>
            </div>
            <div className="flex justify-between">
              <span>Balance Remaining:</span>
              <strong className="text-slate-900 font-bold">{avakahada.mathematics.dashaBalance.formattedBalance}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BIRTH PANCHANGA & COSMIC CLASSIFICATIONS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8C2D19]" />
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-800">
              Birth Pañcāṅga &amp; Traditional Calendar Constants
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Saṃvatsara: {avakahada.panchanga.samvatsara.name} ({avakahada.panchanga.samvatsara.sanskrit})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-48">Pañcāṅga Element</th>
                <th className="py-3 px-4 w-52">Birth Value</th>
                <th className="py-3 px-4 w-40">Sanskrit / Devanagari</th>
                <th className="py-3 px-4">Classical Category &amp; Lord</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Tithi */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">01</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Janma Tithi (Lunar Phase)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.panchanga.tithi.name} ({avakahada.panchanga.tithi.paksha} Pakṣa)
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  {avakahada.panchanga.tithi.sanskrit}
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Class: <strong className="text-slate-800">{avakahada.panchanga.tithi.classType}</strong> • Deity: {avakahada.panchanga.tithi.classDeity} • Lord: {avakahada.panchanga.tithi.classLord}
                </td>
              </tr>

              {/* Vara */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">02</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Vāra (Solar Weekday)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">{avakahada.panchanga.vara.name}</td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">{avakahada.panchanga.vara.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Vāreśa (Day Lord): <strong className="text-slate-800">{avakahada.panchanga.vara.lordSanskrit}</strong>
                </td>
              </tr>

              {/* Yoga */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">03</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Nitya Yoga (Sol-Lunar Sum)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.panchanga.yoga.name} (#{avakahada.panchanga.yoga.number})
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.panchanga.yoga.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Auspiciousness: <strong className="text-slate-800">{avakahada.panchanga.yoga.auspiciousness}</strong>
                </td>
              </tr>

              {/* Karana */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">04</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Karaṇa (Half-Tithi Limb)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.panchanga.karana.name} (#{avakahada.panchanga.karana.number})
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.panchanga.karana.sanskrit}</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Type: <strong className="text-slate-800">{avakahada.panchanga.karana.type}</strong>
                </td>
              </tr>

              {/* Ritu */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">05</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Ṛtu (Vedic Season)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.panchanga.ritu.name} ({avakahada.panchanga.ritu.season})
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-serif font-semibold">{avakahada.panchanga.ritu.sanskrit} ॠतु</td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Bi-monthly solar seasonal cycle governing biological and temperamental humors
                </td>
              </tr>

              {/* Masa */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">06</td>
                <td className="py-2.5 px-4 text-slate-900 font-semibold">Māsa (Lunar &amp; Solar Month)</td>
                <td className="py-2.5 px-4 text-slate-900 font-serif font-bold">
                  {avakahada.panchanga.masa.amanta} (Amānta) / {avakahada.panchanga.masa.purnimanta} (Pūrṇimānta)
                </td>
                <td className="py-2.5 px-4 text-[#8C2D19] font-serif font-semibold">
                  Sauramāsa: {avakahada.panchanga.masa.solarMonth} Day {avakahada.panchanga.masa.solarDay}
                </td>
                <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                  Dual calendar standard (Amānta in South/West, Pūrṇimānta in North India)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
