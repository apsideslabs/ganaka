'use client';

/**
 * Gaṇaka — Bhāva Chalita Table & House Cusp Architecture
 * Supports Krishnamurti (KP), Śrīpati, and Sama Bhāva (Equal House),
 * exact Ādi (Start), Madhya (Crest), Anta (End) coordinates, KP Sub-Lords,
 * and Bhāva Shift Analysis.
 */

import React, { useState, useMemo } from 'react';
import { BhavaCusp, CalculatedPlanet, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { RASHIS } from '@/lib/jyotisha/constants';
import { calculateHouses } from '@/lib/jyotisha/houses';
import { Home, Layers, Compass, Shield, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

interface BhavaChalitPanelProps {
  bhavas: BhavaCusp[];
  planets: Record<PlanetId, CalculatedPlanet>;
  lagnaRashi: RashiNumber;
  lagnaLongitude: number;
  mcLongitude?: number;
  initialHouseSystem?: 'equal_whole' | 'sripati' | 'placidus';
}

const BHAVA_SIGNIFICANCES: Array<{ name: string; sanskrit: string; karaka: string; portfolio: string }> = [
  { name: '1st (Tanu Bhāva)', sanskrit: 'तनु भाव', karaka: 'Sun (Sūrya)', portfolio: 'Self, physical constitution, complexion, vitality, head, general destiny' },
  { name: '2nd (Dhana Bhāva)', sanskrit: 'धन भाव', karaka: 'Jupiter (Guru)', portfolio: 'Accumulated wealth, family lineage (Kula), speech (Vāk), face, right eye, nourishment' },
  { name: '3rd (Bhrātṛ Bhāva)', sanskrit: 'भ्रातृ भाव', karaka: 'Mars (Maṅgala)', portfolio: 'Younger siblings, courage (Parākrama), manual skills, throat, arms, short travels' },
  { name: '4th (Mātṛ / Sukha Bhāva)', sanskrit: 'मातृ/सुख भाव', karaka: 'Moon (Candra)', portfolio: 'Mother, mental tranquility, conveyances (Vāhana), landed property, heart, domestic shelter' },
  { name: '5th (Putra / Pūrva Puṇya)', sanskrit: 'पुत्र/बुद्धि भाव', karaka: 'Jupiter (Guru)', portfolio: 'Progeny, creative intellect (Dhī), past-life merit (Pūrva Puṇya), mantra sādhanā, discernment' },
  { name: '6th (Śatru / Roga Bhāva)', sanskrit: 'शत्रु/रोग भाव', karaka: 'Mars & Saturn', portfolio: 'Overcoming obstacles, debts (Ṛṇa), diseases (Roga), competitors, litigation, service' },
  { name: '7th (Kalatra Bhāva)', sanskrit: 'कलत्र भाव', karaka: 'Venus (Śukra)', portfolio: 'Spouse, marriage, business partnerships, trade, foreign interactions, public diplomacy' },
  { name: '8th (Āyur / Randhra Bhāva)', sanskrit: 'आयुर् भाव', karaka: 'Saturn (Śani)', portfolio: 'Longevity (Āyus), unearned wealth, occult research, transformative crises, chronic matters' },
  { name: '9th (Dharma / Bhāgya Bhāva)', sanskrit: 'धर्म/भाग्य भाव', karaka: 'Jupiter & Sun', portfolio: 'Dharma, higher philosophy, spiritual preceptor (Guru), father, pilgrimage, fortune, righteousness' },
  { name: '10th (Karma Bhāva)', sanskrit: 'कर्म भाव', karaka: 'Sun, Merc, Jup, Sat', portfolio: 'Profession, societal standing (Kīrti), public authority, royal favor, executive power' },
  { name: '11th (Lābha / Āya Bhāva)', sanskrit: 'लाभ भाव', karaka: 'Jupiter (Guru)', portfolio: 'All categories of gains (Lābha), elder siblings, fulfillment of desires, alliances, windfalls' },
  { name: '12th (Vyaya / Mokṣa Bhāva)', sanskrit: 'व्यय/मोक्ष भाव', karaka: 'Saturn (Śani)', portfolio: 'Expenditures, foreign stay, confinement, spiritual liberation (Mokṣa), subconscious dreams' },
];

export function BhavaChalitPanel({
  bhavas: initialBhavas,
  planets,
  lagnaRashi,
  lagnaLongitude,
  mcLongitude = (lagnaLongitude + 270) % 360,
  initialHouseSystem = 'equal_whole',
}: BhavaChalitPanelProps) {
  const [selectedSystem, setSelectedSystem] = useState<'equal_whole' | 'sripati' | 'placidus'>(initialHouseSystem);
  const [activeTab, setActiveTab] = useState<'cusps' | 'relationships' | 'shifts'>('cusps');

  // Compute active bhavas based on selected system
  const activeBhavas = useMemo(() => {
    const pForHouses: Record<PlanetId, { siderealLongitude: number }> = {} as any;
    for (const [pId, pData] of Object.entries(planets)) {
      pForHouses[pId as PlanetId] = { siderealLongitude: pData.siderealLongitude };
    }
    return calculateHouses(lagnaLongitude, mcLongitude, selectedSystem, pForHouses);
  }, [lagnaLongitude, mcLongitude, selectedSystem, planets]);

  // Analyze Bhāva Chalita planetary shifts (Rāśi House vs Bhāva Chalit House)
  const planetaryShifts = useMemo(() => {
    const shifts: Array<{
      planetId: PlanetId;
      planetName: string;
      rashiHouse: number;
      bhavaHouse: number;
      hasShifted: boolean;
      degreeInSign: number;
    }> = [];

    for (const [pId, pData] of Object.entries(planets)) {
      // Find which bhava contains this planet in activeBhavas
      let foundBhava = pData.house;
      for (const bh of activeBhavas) {
        if (bh.planetsInHouse.includes(pId as PlanetId)) {
          foundBhava = bh.houseNumber;
          break;
        }
      }

      shifts.push({
        planetId: pId as PlanetId,
        planetName: pData.sanskritName,
        rashiHouse: pData.house,
        bhavaHouse: foundBhava,
        hasShifted: pData.house !== foundBhava,
        degreeInSign: pData.longitudeInRashi,
      });
    }

    return shifts;
  }, [planets, activeBhavas]);

  return (
    <div id="bhava-panel-container" className="space-y-6">
      {/* Header & House System Selector */}
      <div id="bhava-header-bar" className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CEBA] pb-3">
        <div>
          <h2 id="bhava-main-title" className="font-serif text-xl font-bold tracking-tight text-[#2B1810]">
            Bhāva Cusp Table &amp; Chalita Dynamics
          </h2>
          <p className="font-sans text-xs text-[#6B5E51]">
            Ādi (Start), Madhya (Crest), Anta (End), KP Sub-Lords, and House-Sign Relationships
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* House System Switcher */}
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 font-sans text-xs">
            <button
              onClick={() => setSelectedSystem('equal_whole')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                selectedSystem === 'equal_whole'
                  ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm'
                  : 'text-[#4A3B32] hover:text-[#2B1810]'
              }`}
            >
              Sama Bhāva (Equal)
            </button>
            <button
              onClick={() => setSelectedSystem('sripati')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                selectedSystem === 'sripati'
                  ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm'
                  : 'text-[#4A3B32] hover:text-[#2B1810]'
              }`}
            >
              Śrīpati (Porphyry)
            </button>
            <button
              onClick={() => setSelectedSystem('placidus')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                selectedSystem === 'placidus'
                  ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm'
                  : 'text-[#4A3B32] hover:text-[#2B1810]'
              }`}
            >
              Krishnamurti (KP)
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#FAF6EE] p-1 font-sans text-xs">
            <button
              onClick={() => setActiveTab('cusps')}
              className={`rounded-md px-3 py-1 font-semibold transition-all ${
                activeTab === 'cusps' ? 'bg-[#2B1810] text-[#FDFBF7]' : 'text-[#4A3B32]'
              }`}
            >
              Cusp Table
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`rounded-md px-3 py-1 font-semibold transition-all ${
                activeTab === 'relationships' ? 'bg-[#2B1810] text-[#FDFBF7]' : 'text-[#4A3B32]'
              }`}
            >
              Classifications
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`rounded-md px-3 py-1 font-semibold transition-all ${
                activeTab === 'shifts' ? 'bg-[#2B1810] text-[#FDFBF7]' : 'text-[#4A3B32]'
              }`}
            >
              Bhāva Shifts
            </button>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: Complete 12-Bhava Cusp Table */}
      {activeTab === 'cusps' && (
        <div id="subview-bhava-cusps" className="space-y-4">
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] shadow-sm overflow-hidden">
            <div className="border-b border-[#D8CEBA] bg-[#EFE7D8] px-4 py-2.5 flex items-center justify-between font-sans">
              <span className="font-serif text-sm font-bold text-[#2B1810]">
                12 Bhāvas — Exact Coordinates (Ādi, Madhya, Anta) &amp; Sub-Lords
              </span>
              <span className="text-xs font-mono text-[#7A6B5C]">
                System: {selectedSystem === 'placidus' ? 'KP Placidus' : selectedSystem === 'sripati' ? 'Śrīpati' : 'Sama Bhāva'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table id="bhava-cusp-data-table" className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                    <th className="py-2.5 px-3">House (Bhāva)</th>
                    <th className="py-2.5 px-3">Sign (Rāśi)</th>
                    <th className="py-2.5 px-3">Ādi (Start)</th>
                    <th className="py-2.5 px-3 font-mono font-bold text-[#8C2D19]">Madhya (Crest Cusp)</th>
                    <th className="py-2.5 px-3">Anta (End)</th>
                    <th className="py-2.5 px-3">Sign / Star / Sub Lord</th>
                    <th className="py-2.5 px-3">Occupants</th>
                    <th className="py-2.5 px-3">Primary Kāraka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {activeBhavas.map((bhava, idx) => {
                    const info = BHAVA_SIGNIFICANCES[idx];
                    const rInfo = RASHIS[bhava.rashiNumber];
                    const lordPlanet = planets[bhava.rashiLord];

                    return (
                      <tr key={bhava.houseNumber} id={`bhava-row-${bhava.houseNumber}`} className="hover:bg-[#F2EADC] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#2B1810]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#E8DEC8] text-[#8C2D19] flex items-center justify-center font-mono text-[10px]">
                              {bhava.houseNumber}
                            </span>
                            <div>
                              <span className="font-serif">{info.name}</span>
                              <span className="block text-[10px] text-[#7A6B5C] font-normal">
                                {info.sanskrit}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-[#3D2F28]">
                          {rInfo.sanskritName} ({rInfo.name})
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5C4A3E]">
                          {bhava.aadiDMS || `${bhava.startDegree.toFixed(2)}°`}
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold text-[#8C2D19]">
                          {bhava.madhyaDMS || bhava.midDegreeStr}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5C4A3E]">
                          {bhava.antaDMS || `${bhava.endDegree.toFixed(2)}°`}
                        </td>

                        <td className="py-2.5 px-3 text-[11px]">
                          <div className="font-medium text-[#2B1810]">
                            Sign: <span className="font-bold text-[#8C2D19]">{bhava.rashiLord.toUpperCase()}</span>
                          </div>
                          {bhava.kp?.starLord && (
                            <div className="text-[#5C4A3E] text-[10px]">
                              Star: {bhava.kp.starLord.toUpperCase()} | Sub: <span className="font-semibold text-[#8C2D19]">{bhava.kp.subLord?.toUpperCase()}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          {bhava.planetsInHouse.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {bhava.planetsInHouse.map((pid) => (
                                <span
                                  key={pid}
                                  className="px-1.5 py-0.5 rounded bg-[#F2EADC] text-[#8C2D19] font-bold text-[10px]"
                                >
                                  {planets[pid]?.sanskritName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#A89C89] italic">—</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5C4A3E]">
                          {info.karaka}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: House-Sign Relationships (Kendras, Trikonas, Dusthanas, etc.) */}
      {activeTab === 'relationships' && (
        <div id="subview-bhava-relationships" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          {/* Kendra Houses */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#8C2D19] text-base">Kendra Bhāvas (Pillars)</span>
              <span className="bg-[#E8DEC8] px-2 py-0.5 rounded text-[11px] font-mono font-bold">1, 4, 7, 10</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Vishnu Sthāna: Houses of vitality, emotional security, partnerships, and worldly achievement. Strong planets here grant stability and success.
            </p>
          </div>

          {/* Trikona Houses */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#2D5A27] text-base">Trikoṇa Bhāvas (Trines)</span>
              <span className="bg-[#E1EAD2] text-[#2D5A27] px-2 py-0.5 rounded text-[11px] font-mono font-bold">1, 5, 9</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Lakṣmī Sthāna: Purely auspicious houses of fortune, intellect, dharma, mantra siddhi, and grace from past virtuous actions.
            </p>
          </div>

          {/* Dusthana Houses */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#A75412] text-base">Duḥsthāna Bhāvas (Difficult)</span>
              <span className="bg-[#FCE8D5] text-[#A75412] px-2 py-0.5 rounded text-[11px] font-mono font-bold">6, 8, 12</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Houses of struggle, diseases, debts, hidden transformations, and expenditure. Benefics here require careful assessment; malefics produce Viparita Raja Yoga.
            </p>
          </div>

          {/* Upachaya Houses */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#1E4A78] text-base">Upacaya Bhāvas (Growth)</span>
              <span className="bg-[#E3EDF7] text-[#1E4A78] px-2 py-0.5 rounded text-[11px] font-mono font-bold">3, 6, 10, 11</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Houses of progressive improvement over time through willpower and effort. Malefics positioned here yield great resilience and victory.
            </p>
          </div>

          {/* Maraka Houses */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#8C2D19] text-base">Māraka Bhāvas (Killers)</span>
              <span className="bg-[#F9DCD5] text-[#8C2D19] px-2 py-0.5 rounded text-[11px] font-mono font-bold">2, 7</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Terminal transition houses. Their lords or planets associated with 2nd and 7th houses govern bodily exhaustion and life-cycle completion during active dasha.
            </p>
          </div>

          {/* Panaphara & Apoklima */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
              <span className="font-serif font-bold text-[#3D2F28] text-base">Paṇaphara &amp; Āpoklima</span>
              <span className="bg-[#E8DEC8] text-[#3D2F28] px-2 py-0.5 rounded text-[11px] font-mono font-bold">2,5,8,11 / 3,6,9,12</span>
            </div>
            <p className="text-xs text-[#5C4A3E] leading-relaxed">
              Succeedent (Paṇaphara) houses yield fruits in middle age; Cadent (Āpoklima) houses yield results later in life or through overseas displacement.
            </p>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Bhava Chalit Planetary Shifts */}
      {activeTab === 'shifts' && (
        <div id="subview-bhava-shifts" className="space-y-4 font-sans">
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-3">
            <div className="border-b border-[#E6DEC8] pb-2">
              <h3 className="font-serif text-base font-bold text-[#2B1810]">
                Bhāva Chalita Shift Diagnostic
              </h3>
              <p className="text-xs text-[#7A6B5C]">
                Compares whole-sign Rāśi house positions with exact degree-based Bhāva Chalita spans
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {planetaryShifts.map((ps) => (
                <div
                  key={ps.planetId}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    ps.hasShifted
                      ? 'border-[#E6BFB8] bg-[#FDF0EE]'
                      : 'border-[#D8CEBA] bg-[#FAF6EE]'
                  }`}
                >
                  <div className="flex items-center justify-between font-serif font-bold">
                    <span className="text-[#2B1810]">{ps.planetName}</span>
                    {ps.hasShifted ? (
                      <span className="rounded bg-[#8C2D19] px-1.5 py-0.5 font-sans text-[10px] font-bold text-white">
                        SHIFTED
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#2D5A27] flex items-center gap-1 font-sans">
                        <CheckCircle2 className="h-3 w-3" /> Unchanged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#5C4A3E]">Rāśi House: <strong>{ps.rashiHouse}</strong></span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#8C2D19]" />
                    <span className="text-[#8C2D19] font-bold">Chalita: <strong>{ps.bhavaHouse}</strong></span>
                  </div>

                  {ps.hasShifted && (
                    <p className="text-[11px] text-[#8C2D19] leading-snug pt-1 border-t border-[#E6DEC8]">
                      Delivers primary experiential results of House {ps.bhavaHouse} while retaining sign ownership of House {ps.rashiHouse}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
