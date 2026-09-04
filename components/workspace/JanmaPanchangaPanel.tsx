'use client';

import React, { useState, useMemo } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import { KundaliChart } from '../charts/KundaliChart';
import { calculateDailyHoras } from '../../lib/jyotisha/muhurta-advanced';
import { calculateAvakahadaChakra } from '../../lib/jyotisha/avakahada';
import {
  Compass,
  Award,
  Sparkles,
  Sunrise,
  Layers,
} from 'lucide-react';

interface JanmaPanchangaPanelProps {
  chart: JyotishaChart;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  cityName: string;
}

export const JanmaPanchangaPanel: React.FC<JanmaPanchangaPanelProps> = ({
  chart,
  year,
  month,
  day,
  hour,
  minute,
  second,
  cityName,
}) => {
  const [chartStyle, setChartStyle] = useState<'north' | 'south' | 'east'>('north');
  const { panchanga, planets, lagna, meta } = chart;
  const { tithi, vara, nakshatra, yoga, karana, sunTimes, muhurtas, calendar } = panchanga;

  const avakahada = useMemo(() => calculateAvakahadaChakra(chart), [chart]);

  // Calculate day and night status
  const sunriseParts = sunTimes.sunrise.split(':');
  const sunsetParts = sunTimes.sunset.split(':');
  const sunriseHour = parseInt(sunriseParts[0] || '6', 10) + parseInt(sunriseParts[1] || '0', 10) / 60;
  const sunsetHour = parseInt(sunsetParts[0] || '18', 10) + parseInt(sunsetParts[1] || '0', 10) / 60;
  const birthDecimalHour = hour + minute / 60 + second / 3600;

  const isNightBirth = birthDecimalHour < sunriseHour || birthDecimalHour >= sunsetHour;

  // 24 Horas
  const dailyHoras = calculateDailyHoras(vara.number, sunriseHour);
  const currentHora = dailyHoras.find((h) => {
    let bHour = birthDecimalHour;
    if (bHour < sunriseHour) bHour += 24;
    return bHour >= h.hourIndex - 1 + sunriseHour && bHour < h.hourIndex + sunriseHour;
  }) || dailyHoras[0];

  // Active Choghadiya from calculated slots
  const choghadiyas = isNightBirth ? muhurtas.choghadiyaNight || [] : muhurtas.choghadiyaDay || [];
  const currentChoghadiya = choghadiyas.find((c) => c.isCurrent) || choghadiyas[0];

  return (
    <div className="space-y-6 text-[#171614]">
      {/* 1. TOP DIGNIFIED HEADER BANNER */}
      <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 shadow-3d-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B2F0B] ring-4 ring-[#8B2F0B]/15" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B2F0B]">
              Janma Pañcāṅga &amp; Muhūrta of Birth
            </span>
          </div>
          <h2 className="text-xl font-serif font-black text-[#171614] tracking-tight">
            Chronometry &amp; Five Astronomical Limbs of Birth
          </h2>
          <p className="text-xs text-[#5C5850] font-serif">
            Precise celestial configuration at the exact moment of birth: {year}-{String(month).padStart(2, '0')}-{String(day).padStart(2, '0')} at {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}:{String(second).padStart(2, '0')} ({cityName})
          </p>
        </div>

        {/* Quick Style Switcher & Ayanamsha Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-[#F2EDE3] border border-[#DCD5C6] px-2.5 py-1 rounded-xs text-[#171614]">
            <span className="text-[#7A7468]">Ayanāṃśa: </span>
            <span className="font-bold">{meta.ayanamshaFormatted}</span>
          </div>
          <div className="flex items-center bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs p-0.5">
            <button
              type="button"
              onClick={() => setChartStyle('north')}
              className={`px-2.5 py-1 text-xs rounded-xs font-bold transition-all cursor-pointer ${
                chartStyle === 'north'
                  ? 'bg-[#8B2F0B] text-[#FCFAF6] shadow-xs'
                  : 'text-[#5C5850] hover:text-[#171614]'
              }`}
            >
              North
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('south')}
              className={`px-2.5 py-1 text-xs rounded-xs font-bold transition-all cursor-pointer ${
                chartStyle === 'south'
                  ? 'bg-[#8B2F0B] text-[#FCFAF6] shadow-xs'
                  : 'text-[#5C5850] hover:text-[#171614]'
              }`}
            >
              South
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('east')}
              className={`px-2.5 py-1 text-xs rounded-xs font-bold transition-all cursor-pointer ${
                chartStyle === 'east'
                  ? 'bg-[#8B2F0B] text-[#FCFAF6] shadow-xs'
                  : 'text-[#5C5850] hover:text-[#171614]'
              }`}
            >
              East
            </button>
          </div>
        </div>
      </div>

      {/* 2. SPLIT VIEW: JANMA CHART (LEFT) + FIVE SACRED LIMBS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: THE BIRTH CHART (KUNDALI) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 shadow-3d-card flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between border-b border-[#DCD5C6] pb-3 mb-4">
              <span className="text-xs font-serif font-bold text-[#171614] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#8B2F0B]" />
                <span>Janma Kuṇḍalī (Lagna D-1)</span>
              </span>
              <span className="text-[11px] font-mono text-[#8B2F0B] font-bold">
                Lagna: {lagna.rashiName} ({lagna.degreeStr.split(' ')[0]})
              </span>
            </div>

            <div className="w-full flex justify-center py-2">
              <KundaliChart
                lagnaRashi={lagna.rashiNumber}
                lagnaDegreeStr={lagna.degreeStr}
                planets={planets}
                title="Janma Lagna Kuṇḍalī"
                subtitle={`${cityName} • ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                style={chartStyle}
              />
            </div>

            {/* Ascendant & Moon Seeds under chart */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#DCD5C6] text-xs font-mono">
              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block uppercase font-bold">Janma Lagna</span>
                <span className="font-bold text-[#8B2F0B] font-serif block truncate">{lagna.rashiName}</span>
                <span className="text-[11px] text-[#5C5850] block truncate">
                  {lagna.nakshatraName} P{lagna.pada}
                </span>
              </div>

              <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block uppercase font-bold">Janma Rāśi (Moon)</span>
                <span className="font-bold text-[#171614] font-serif block truncate">{planets.moon.rashiName}</span>
                <span className="text-[11px] text-[#5C5850] block truncate">
                  {planets.moon.nakshatraName} P{planets.moon.pada}
                </span>
              </div>
            </div>
          </div>

          {/* Solar & Diurnal Horizon on Birth Day */}
          <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-4 shadow-3d-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-2 text-xs font-serif font-bold text-[#171614]">
              <span className="flex items-center gap-1.5">
                <Sunrise className="w-3.5 h-3.5 text-[#8B2F0B]" />
                <span>Diurnal Arcs of Birth Day</span>
              </span>
              <span className="font-mono text-[11px] text-[#5C5850]">
                {vara.civilWeekday}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between">
                <span className="text-[#7A7468]">Sūryodaya:</span>
                <span className="font-bold text-[#171614]">{sunTimes.sunrise}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between">
                <span className="text-[#7A7468]">Sūryāsta:</span>
                <span className="font-bold text-[#171614]">{sunTimes.sunset}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between">
                <span className="text-[#7A7468]">Dina Māna:</span>
                <span className="font-bold text-[#171614]">{sunTimes.dayDuration || '12h 00m'}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs flex items-center justify-between">
                <span className="text-[#7A7468]">Rātri Māna:</span>
                <span className="font-bold text-[#171614]">{sunTimes.nightDuration || '12h 00m'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: THE COMPLETE 5 SACRED LIMBS & BIRTH MOMENT DETAILS */}
        <div className="lg:col-span-7 space-y-4">
          {/* THE 5 PRIMARY LIMBS (PAÑCA-AṄGA) */}
          <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8B2F0B]" />
                <h3 className="text-base font-serif font-bold text-[#171614]">
                  Pañca-Aṅga at Moment of Birth (पञ्चाङ्ग)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8B2F0B] font-bold">
                5 Astronomical Limbs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. TITHI */}
              <div className="p-3.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#8B2F0B]">1. Janma Tithi (तिथि)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs font-bold">
                    {tithi.paksha} Pakṣa
                  </span>
                </div>
                <div>
                  <div className="text-base font-serif font-bold text-[#171614]">{tithi.name}</div>
                  <div className="text-xs text-[#5C5850] font-serif">
                    {tithi.sanskritName} • Deity: {tithi.deity}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono text-[#5C5850]">
                  <span>Ends: <strong className="text-[#171614]">{tithi.endTime}</strong></span>
                  <span>Elapsed: <strong className="text-[#171614]">{tithi.percentElapsed}%</strong></span>
                </div>
              </div>

              {/* 2. VĀRA */}
              <div className="p-3.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#8B2F0B]">2. Janma Vāra (वार)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs font-bold uppercase">
                    Lord: {vara.lord}
                  </span>
                </div>
                <div>
                  <div className="text-base font-serif font-bold text-[#171614]">{vara.name}</div>
                  <div className="text-xs text-[#5C5850] font-serif">
                    {vara.sanskritName} • Deity: {vara.deity || 'Surya'}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono text-[#5C5850]">
                  <span>Vedic Day: <strong className="text-[#171614]">Sunrise to Sunrise</strong></span>
                  <span>Metal: <strong className="text-[#171614]">{vara.metal || 'Gold'}</strong></span>
                </div>
              </div>

              {/* 3. NAKṢATRA */}
              <div className="p-3.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#8B2F0B]">3. Janma Nakṣatra (नक्षत्र)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#8B2F0B] text-[#FCFAF6] rounded-xs font-bold">
                    Pada {nakshatra.pada}
                  </span>
                </div>
                <div>
                  <div className="text-base font-serif font-bold text-[#171614]">{nakshatra.name}</div>
                  <div className="text-xs text-[#5C5850] font-serif">
                    {nakshatra.sanskritName} • Deity: {nakshatra.deity}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono text-[#5C5850]">
                  <span>Lord: <strong className="text-[#171614]">{nakshatra.lord.toUpperCase()}</strong></span>
                  {nakshatra.akshara && (
                    <span>Nama Akṣara: <strong className="text-[#8B2F0B] font-bold">{nakshatra.akshara}</strong></span>
                  )}
                </div>
              </div>

              {/* 4. YOGA */}
              <div className="p-3.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#8B2F0B]">4. Janma Yoga (योग)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs font-bold">
                    #{yoga.number}/27
                  </span>
                </div>
                <div>
                  <div className="text-base font-serif font-bold text-[#171614]">{yoga.name}</div>
                  <div className="text-xs text-[#5C5850] font-serif">
                    {yoga.sanskritName}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DCD5C6] flex items-center justify-between text-xs font-mono text-[#5C5850]">
                  <span>Nature: <strong className="text-[#171614]">{yoga.auspiciousness}</strong></span>
                  <span>Ends: <strong className="text-[#171614]">{yoga.endTime}</strong></span>
                </div>
              </div>

              {/* 5. KARAṆA */}
              <div className="p-3.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#8B2F0B]">5. Janma Karaṇa (करण)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs font-bold">
                    {karana.type} (Half-Tithi #{karana.number}/60)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-serif font-bold text-[#171614]">{karana.name} ({karana.sanskritName})</div>
                    <div className="text-xs text-[#5C5850] font-serif">
                      Deity: {karana.deity} • {karana.isBhadraActive ? `Bhadrā Active (${karana.bhadraLocation || 'Pātāla'})` : 'Normal Karaṇa'}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-[#5C5850] sm:text-right">
                    <span>Ends: <strong className="text-[#171614]">{karana.endTime}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BIRTH MOMENT MUHŪRTA, HORĀ & CHOGHADIYĀ ANALYSIS */}
          <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B2F0B]" />
                <h3 className="text-base font-serif font-bold text-[#171614]">
                  Active Muhūrta &amp; Horā at Moment of Birth
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8B2F0B] font-bold">
                Temporal Rulers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {/* Active Horā */}
              <div className="p-3 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-1">
                <span className="text-[10px] text-[#7A7468] uppercase font-bold block">Active Planetary Horā</span>
                <div className="text-sm font-bold text-[#8B2F0B] font-serif">{currentHora?.rulerName || 'N/A'} Horā</div>
                <div className="text-[11px] text-[#5C5850]">
                  Lord: {currentHora?.ruler || 'N/A'} • {currentHora?.timeRange || ''}
                </div>
              </div>

              {/* Active Choghadiyā */}
              <div className="p-3 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-1">
                <span className="text-[10px] text-[#7A7468] uppercase font-bold block">Birth Choghadiyā</span>
                <div className="text-sm font-bold text-[#171614] font-serif">{currentChoghadiya?.name || 'N/A'}</div>
                <div className="text-[11px] text-[#5C5850]">
                  {currentChoghadiya?.nature || 'N/A'} • {currentChoghadiya?.timeRange || ''}
                </div>
              </div>

              {/* Day / Night Birth Classification */}
              <div className="p-3 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs space-y-1">
                <span className="text-[10px] text-[#7A7468] uppercase font-bold block">Diurnal Period</span>
                <div className="text-sm font-bold text-[#171614] font-serif">
                  {isNightBirth ? 'Rātri Janma (Night Birth)' : 'Divā Janma (Day Birth)'}
                </div>
                <div className="text-[11px] text-[#5C5850]">
                  {isNightBirth ? 'Moon Stronger' : 'Sun Stronger'}
                </div>
              </div>
            </div>

            {/* Special Auspicious / Inauspicious Times on Birth Day */}
            <div className="pt-2 border-t border-[#DCD5C6] space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#5C5850] block">
                Standard Muhūrta &amp; Kāla Windows on Birth Day:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Abhijit Muhūrta:</span>
                  <span className="font-bold text-[#16845B]">{muhurtas.abhijit || 'N/A'}</span>
                </div>
                <div className="p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Brahma Muhūrta:</span>
                  <span className="font-bold text-[#16845B]">{muhurtas.brahmaMuhurta || 'N/A'}</span>
                </div>
                <div className="p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Rāhukāla (Avoid):</span>
                  <span className="font-bold text-[#B54747]">{muhurtas.rahukala || 'N/A'}</span>
                </div>
                <div className="p-2 bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Yamagaṇḍa:</span>
                  <span className="font-bold text-[#B54747]">{muhurtas.yamaghanta || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AVAKAHADA CHAKRA & BIRTH SEED MATRICES */}
          {avakahada && (
            <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 shadow-3d-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCD5C6] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8B2F0B]" />
                  <h3 className="text-base font-serif font-bold text-[#171614]">
                    Avakahada Cakra Seeds (अवकहड़ा चक्र)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8B2F0B] font-bold">
                  Birth Identity Matrix
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Varṇa (वर्णा):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.varna.category}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Vaśya (वश्य):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.vashya.category}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Yoni (योनि):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.yoni.animal}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Gaṇa (गण):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.gana.temperament}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Nāḍī (नाडी):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.nadi.humor}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Rājju (रज्जु):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.rajju.limb}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Tatva (तत्त्व):</span>
                  <span className="font-bold text-[#171614] font-serif">{avakahada.tattva.sanskrit || avakahada.tattva.type}</span>
                </div>
                <div className="p-2.5 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                  <span className="text-[10px] text-[#7A7468] block">Pāyam (पाद):</span>
                  <span className="font-bold text-[#8B2F0B] font-serif">{avakahada.paya.metal}</span>
                </div>
              </div>
            </div>
          )}

          {/* TRADITIONAL CALENDAR ERAS OF BIRTH */}
          <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-4 shadow-3d-card space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase text-[#5C5850] block">
              Traditional Chronological Eras at Birth:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block">Sauramāsa:</span>
                <span className="font-bold text-[#171614]">{calendar.solarMonth.name}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block">Ṛtu (Season):</span>
                <span className="font-bold text-[#171614]">{calendar.rtu.name}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block">Ayana:</span>
                <span className="font-bold text-[#171614]">{calendar.ayana.name}</span>
              </div>
              <div className="p-2 bg-[#F2EDE3] border border-[#DCD5C6] rounded-xs">
                <span className="text-[10px] text-[#7A7468] block">Vikrama Samvat:</span>
                <span className="font-bold text-[#171614]">{calendar.eras.vikramaSamvat}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
