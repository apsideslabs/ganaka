'use client';

/**
 * Gaṇaka — Classical Drik Pañcāṅga & Calendrical Astronomical Monitor
 * Academic drafting & archival aesthetic rendering all 5 Panchanga limbs,
 * sub-second transition moments (Start & End in 12-Hour AM/PM), Udaya Tithi/Nakshatra,
 * Tithi Nature & Nitya Devis, Nakshatra Pada Aksharas, Bhadrā Location,
 * Day & Night Choghadiya cycles, Special Vedic Yogas, Twilights & Moon Illumination.
 */

import React, { useState } from 'react';
import { PanchangaResult } from '../../lib/jyotisha/types';
import { Calendar, Sun, Moon, Clock, Compass, Sparkles, ShieldAlert, Award, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface PanchangaCardProps {
  panchanga: PanchangaResult;
  locationName: string;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({ panchanga, locationName }) => {
  const { tithi, vara, nakshatra, yoga, karana, sunTimes, muhurtas, calendar } = panchanga;
  const [showChoghadiya, setShowChoghadiya] = useState<boolean>(false);
  const [choghadiyaTab, setChoghadiyaTab] = useState<'day' | 'night'>('day');

  return (
    <div className="bg-[#FAF7F0] border border-[#D8CEBA] rounded-xl p-5 md:p-6 shadow-2xs space-y-6 text-[#171614]">
      {/* Top Bar / Classical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6DEC8] pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#7A2D12]/10 border border-[#7A2D12]/20 flex items-center justify-center text-[#7A2D12]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#171614] tracking-tight">
              Pañcāṅga &amp; Astronomical Chronometry
            </h3>
            <p className="text-xs text-[#5C5850]">
              {locationName} • Drik High-Precision Ephemeris (NOAA / Meeus / ELP-2000)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-[#F0ECE1] text-[#4A463E] border border-[#D8CEBA] rounded-md font-serif font-semibold">
            {vara.sunriseVedicVara}
          </span>
          <span className="text-xs px-2.5 py-1 bg-[#F0ECE1] text-[#5C5850] border border-[#D8CEBA] rounded-md font-mono">
            Civil: {vara.civilWeekday}
          </span>
          {vara.horaLordNowName && (
            <span className="text-xs px-2.5 py-1 bg-[#7A2D12]/10 text-[#7A2D12] border border-[#7A2D12]/20 rounded-md font-serif font-semibold">
              Current Horā: {vara.horaLordNowName}
            </span>
          )}
        </div>
      </div>

      {/* Special Auspicious Yogas Alert (if active) */}
      {(muhurtas.amritaSiddhiYoga || muhurtas.sarvarthaSiddhiYoga || muhurtas.pushyaYoga) && (
        <div className="p-3.5 rounded-xl bg-[#F4F9F4] border border-[#C6E6C6] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs">
          <div className="flex items-center gap-2.5 text-xs text-[#1E4620]">
            <Star className="w-4 h-4 text-[#2D7A32] fill-[#2D7A32] shrink-0" />
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-sm block">Special Vedic Auspicious Yoga Active Today</span>
              <span className="text-[11px] text-[#3B693E]">
                {[muhurtas.pushyaYoga, muhurtas.amritaSiddhiYoga, muhurtas.sarvarthaSiddhiYoga].filter(Boolean).join(' • ')}
              </span>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-[#2D7A32] text-white font-serif font-semibold whitespace-nowrap self-start sm:self-auto">
            Mahā-Śubha Kāla
          </span>
        </div>
      )}

      {/* 5 Primary Limbs (Pañca-Aṅga) */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#7A2D12] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Pañca-Aṅga (Five Astronomical Limbs with Samāpti Kāla)
          </span>
          <span className="text-[10px] text-[#7A7468] font-normal normal-case">
            Times displayed in 12-Hour AM/PM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. TITHI */}
          <div className="p-3.5 rounded-lg bg-white border border-[#E6DEC8] flex flex-col justify-between shadow-3xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C5850] mb-1">
                <span className="font-serif font-bold text-[#171614]">Tithi (तिथि)</span>
                <span className="font-semibold text-[#7A2D12] text-[11px] font-serif">{tithi.paksha} Pakṣa</span>
              </div>
              <div className="text-sm font-bold text-[#171614]">{tithi.name}</div>
              <div className="text-[11px] text-[#7A7468] font-serif">
                {tithi.sanskritName} • Deity: {tithi.deity}
              </div>
              {tithi.nature && (
                <div className="text-[10px] text-[#5C5850] mt-1 flex flex-wrap gap-1 font-mono">
                  <span className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E6DEC8]">{tithi.nature}</span>
                  <span className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E6DEC8]">{tithi.tattva}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-mono text-[#5C5850]">
                <span>Ends At:</span>
                <span className="font-bold text-[#171614]">{tithi.endTime}</span>
              </div>
              {tithi.udayaTithi && (
                <div className="text-[10px] text-[#7A7468] font-serif flex items-center justify-between">
                  <span>Udaya Tithi:</span>
                  <span className="font-semibold text-[#171614]">{tithi.udayaTithi.split(' ')[0]}</span>
                </div>
              )}
              {tithi.nityaDeity && (
                <div className="text-[10px] text-[#7A7468] font-serif truncate">
                  Nityā: {tithi.nityaDeity}
                </div>
              )}
              <div className="flex items-center justify-between text-[#7A7468] text-[10px]">
                <span>Elapsed: {tithi.percentElapsed}%</span>
                <span>Next: {tithi.nextTithiName?.split(' ')[0]}</span>
              </div>
              <div className="w-full bg-[#EDE6D6] h-1 rounded-full overflow-hidden">
                <div className="bg-[#7A2D12] h-full" style={{ width: `${tithi.percentElapsed}%` }} />
              </div>
            </div>
          </div>

          {/* 2. VĀRA */}
          <div className="p-3.5 rounded-lg bg-white border border-[#E6DEC8] flex flex-col justify-between shadow-3xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C5850] mb-1">
                <span className="font-serif font-bold text-[#171614]">Vāra (वार)</span>
                <span className="font-semibold capitalize text-[#7A2D12] text-[11px] font-mono">Lord: {vara.lord}</span>
              </div>
              <div className="text-sm font-bold text-[#171614]">{vara.name}</div>
              <div className="text-[11px] text-[#7A7468] font-serif">{vara.sanskritName}</div>
              {vara.deity && (
                <div className="text-[10px] text-[#5C5850] mt-1">
                  Deity: {vara.deity}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] space-y-1 text-[11px]">
              {vara.color && (
                <div className="text-[10px] text-[#7A7468]">
                  Color: <span className="text-[#171614]">{vara.color}</span>
                </div>
              )}
              {vara.metal && (
                <div className="text-[10px] text-[#7A7468]">
                  Metal: <span className="text-[#171614]">{vara.metal}</span>
                </div>
              )}
              <div className="text-[#5C5850] pt-1">
                <span className="text-[10px] text-[#7A7468] block">Vedic Day Standard:</span>
                <span className="font-serif text-[#171614]">Sūryodaya to Sūryodaya</span>
              </div>
            </div>
          </div>

          {/* 3. NAKṢATRA */}
          <div className="p-3.5 rounded-lg bg-white border border-[#E6DEC8] flex flex-col justify-between shadow-3xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C5850] mb-1">
                <span className="font-serif font-bold text-[#171614]">Nakṣatra (नक्षत्र)</span>
                <span className="font-semibold text-[#7A2D12] text-[11px] font-mono">Pada {nakshatra.pada}</span>
              </div>
              <div className="text-sm font-bold text-[#171614] truncate">{nakshatra.name}</div>
              <div className="text-[11px] text-[#7A7468] font-serif truncate">
                {nakshatra.sanskritName} • Deity: {nakshatra.deity}
              </div>
              {nakshatra.akshara && (
                <div className="text-[10px] text-[#5C5850] mt-1 flex flex-wrap gap-1 font-mono">
                  <span className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E6DEC8]">Pada Akṣara: {nakshatra.akshara}</span>
                  {nakshatra.varna && <span className="bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E6DEC8]">{nakshatra.varna}</span>}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-mono text-[#5C5850]">
                <span>Ends At:</span>
                <span className="font-bold text-[#171614]">{nakshatra.endTime}</span>
              </div>
              {nakshatra.udayaNakshatra && (
                <div className="text-[10px] text-[#7A7468] font-serif flex items-center justify-between">
                  <span>Udaya Star:</span>
                  <span className="font-semibold text-[#171614]">{nakshatra.udayaNakshatra}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#7A7468] text-[10px]">
                <span>Elapsed: {nakshatra.percentElapsed}%</span>
                <span>Lord: {nakshatra.lord.toUpperCase()}</span>
              </div>
              <div className="w-full bg-[#EDE6D6] h-1 rounded-full overflow-hidden">
                <div className="bg-[#7A2D12] h-full" style={{ width: `${nakshatra.percentElapsed}%` }} />
              </div>
            </div>
          </div>

          {/* 4. YOGA */}
          <div className="p-3.5 rounded-lg bg-white border border-[#E6DEC8] flex flex-col justify-between shadow-3xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C5850] mb-1">
                <span className="font-serif font-bold text-[#171614]">Yoga (योग)</span>
                <span className="font-mono text-[10px] text-[#7A2D12]">#{yoga.number}/27</span>
              </div>
              <div className="text-sm font-bold text-[#171614] truncate">{yoga.name}</div>
              <div className="text-[11px] text-[#7A7468] font-serif truncate">{yoga.sanskritName}</div>
              {yoga.auspiciousness && (
                <div className={`text-[10px] font-semibold mt-1 ${yoga.auspiciousness.includes('Śubha') ? 'text-[#1E4620]' : 'text-[#8B0000]'}`}>
                  {yoga.auspiciousness}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-mono text-[#5C5850]">
                <span>Ends At:</span>
                <span className="font-bold text-[#171614]">{yoga.endTime}</span>
              </div>
              {yoga.udayaYoga && (
                <div className="text-[10px] text-[#7A7468] font-serif flex items-center justify-between">
                  <span>Udaya Yoga:</span>
                  <span className="font-semibold text-[#171614]">{yoga.udayaYoga}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#7A7468] text-[10px]">
                <span>Elapsed: {yoga.percentElapsed}%</span>
                <span>Next: {yoga.nextYogaName}</span>
              </div>
              <div className="w-full bg-[#EDE6D6] h-1 rounded-full overflow-hidden">
                <div className="bg-[#7A2D12] h-full" style={{ width: `${yoga.percentElapsed}%` }} />
              </div>
            </div>
          </div>

          {/* 5. KARAṆA */}
          <div className="p-3.5 rounded-lg bg-white border border-[#E6DEC8] flex flex-col justify-between shadow-3xs">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5C5850] mb-1">
                <span className="font-serif font-bold text-[#171614]">Karaṇa (करण)</span>
                <span className="text-[10px] text-[#7A2D12] font-semibold">{karana.type.split(' ')[0]}</span>
              </div>
              <div className="text-sm font-bold text-[#171614] truncate">{karana.name}</div>
              <div className="text-[11px] text-[#7A7468] font-serif truncate">{karana.sanskritName} • Deity: {karana.deity}</div>
              {karana.isBhadraActive && (
                <div className="text-[10px] text-[#8B0000] font-bold mt-1 bg-[#FDF2F2] p-1 rounded border border-[#F5C2C2]">
                  Bhadrā: {karana.bhadraLocation}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-mono text-[#5C5850]">
                <span>Ends At:</span>
                <span className="font-bold text-[#171614]">{karana.endTime}</span>
              </div>
              {karana.udayaKarana && (
                <div className="text-[10px] text-[#7A7468] font-serif flex items-center justify-between">
                  <span>Udaya:</span>
                  <span className="font-semibold text-[#171614]">{karana.udayaKarana}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#7A7468] text-[10px]">
                <span>Half #{karana.number}/60</span>
                <span>Next: {karana.nextKaranaName}</span>
              </div>
              <div className="w-full bg-[#EDE6D6] h-1 rounded-full overflow-hidden">
                <div className="bg-[#7A2D12] h-full" style={{ width: `${karana.percentElapsed}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Calendar, Eras, Saṅkrānti, Ṛtu & Ayana */}
      <div className="p-4 rounded-xl bg-white border border-[#E6DEC8] space-y-4 shadow-3xs">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#171614] tracking-tight uppercase border-b border-[#F0ECE1] pb-2.5">
          <Compass className="w-4 h-4 text-[#7A2D12]" />
          Traditional Vedic Calendar, Saṅkrānti, Ṛtu &amp; Historical Eras
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Solar Month & Day */}
          <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E6DEC8] space-y-1">
            <span className="text-[#7A7468] block text-[11px] font-serif font-semibold">Sauramāsa (Solar Month &amp; Day)</span>
            <div className="font-bold text-[#171614] text-sm">{calendar.solarMonth.name}</div>
            <div className="text-[11px] text-[#5C5850] font-mono">
              Day {calendar.solarMonth.solarDay} • Sun at {calendar.solarMonth.sunDegreeInRashi}
            </div>
            <div className="text-[10px] text-[#7A7468] font-serif">{calendar.solarMonth.sanskritName}</div>
          </div>

          {/* Lunar Month (Amānta & Pūrṇimānta) */}
          <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E6DEC8] space-y-1">
            <span className="text-[#7A7468] block text-[11px] font-serif font-semibold">Cāndramāsa (Lunar Month)</span>
            <div className="font-bold text-[#171614] text-sm">{calendar.lunarMonth.amantaName}</div>
            <div className="text-[11px] text-[#5C5850] font-serif">
              Pūrṇimānta: <span className="font-medium text-[#171614]">{calendar.lunarMonth.purnimantaName}</span>
            </div>
            <div className="text-[10px] text-[#7A2D12] font-medium">{calendar.lunarMonth.status}</div>
          </div>

          {/* Ṛtu & Ayana */}
          <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E6DEC8] space-y-1">
            <span className="text-[#7A7468] block text-[11px] font-serif font-semibold">Ṛtu &amp; Ayana</span>
            <div className="font-bold text-[#171614] text-sm">{calendar.rtu.sanskritName} ({calendar.rtu.name})</div>
            <div className="text-[11px] text-[#5C5850] font-serif">
              {calendar.ayana.sanskritName} ({calendar.ayana.name})
            </div>
            <div className="text-[10px] text-[#7A7468] truncate">{calendar.rtu.vedicSeason}</div>
          </div>

          {/* Eras: Kali, Vikrama, Shaka, Samvatsara */}
          <div className="p-3 rounded-lg bg-[#FAF7F0] border border-[#E6DEC8] space-y-1">
            <span className="text-[#7A7468] block text-[11px] font-serif font-semibold">Traditional Eras &amp; Saṃvatsara</span>
            <div className="font-bold text-[#171614] text-sm">
              #{calendar.eras.samvatsara60.number} {calendar.eras.samvatsara60.name}
            </div>
            <div className="text-[11px] font-mono text-[#5C5850]">
              Śaka: {calendar.eras.shakaSamvat} • Vikrama: {calendar.eras.vikramaSamvat}
            </div>
            <div className="text-[10px] text-[#7A7468] font-mono">
              Kali Yuga: {calendar.eras.kaliYugaYear} Elapsed
            </div>
          </div>
        </div>

        {/* Saṅkrānti Timing Banner */}
        <div className="p-2.5 rounded-lg bg-[#F4EFE6] border border-[#E0D7C4] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7A2D12]" />
            <span className="text-[#5C5850]">
              Active Ingress: <strong className="text-[#171614]">{calendar.sankranti.currentSankrantiName}</strong> • Next Ingress:{' '}
              <strong className="text-[#7A2D12]">{calendar.sankranti.nextSankrantiName}</strong> at{' '}
              <strong className="font-mono text-[#171614]">{calendar.sankranti.nextSankrantiDateTime}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#5C5850] whitespace-nowrap">
            Puṇya Kāla: {calendar.sankranti.punyaKalaWindow}
          </span>
        </div>
      </div>

      {/* Solar Ephemeris & Auspicious/Inauspicious Muhurtas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Solar & Lunar Ephemeris Events */}
        <div className="p-4 rounded-xl bg-white border border-[#E6DEC8] space-y-3 shadow-3xs">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#171614] tracking-tight uppercase border-b border-[#F0ECE1] pb-2">
            <Sun className="w-4 h-4 text-[#D97706]" /> Solar &amp; Lunar Ephemeris Timings
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Sūryodaya (Sunrise)</span>
              <span className="font-mono font-bold text-[#171614] text-sm">{sunTimes.sunrise}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Sūryāsta (Sunset)</span>
              <span className="font-mono font-bold text-[#171614] text-sm">{sunTimes.sunset}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Madhyāhna (Solar Noon)</span>
              <span className="font-mono font-bold text-[#171614] text-sm">{sunTimes.solarNoon}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Candrodaya (Moonrise)</span>
              <span className="font-mono font-bold text-[#171614] text-sm">{sunTimes.moonrise || 'No rise today'}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Candrāsta (Moonset)</span>
              <span className="font-mono font-bold text-[#171614] text-sm">{sunTimes.moonset || 'No set today'}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#7A7468] block text-[11px] font-serif">Dinamāna / Rātrimāna</span>
              <span className="font-mono font-semibold text-[#171614] text-[11px] block">
                {sunTimes.dayDuration} / {sunTimes.nightDuration}
              </span>
              <span className="font-mono text-[9px] text-[#7A7468] block">
                {sunTimes.dayDurationGhatis}
              </span>
            </div>
          </div>

          {/* Twilights & Ephemeris Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
            {sunTimes.civilDawn && (
              <div>
                <span className="text-[#7A7468] block text-[10px]">Civil Dawn:</span>
                <span className="font-mono font-semibold text-[#171614]">{sunTimes.civilDawn}</span>
              </div>
            )}
            {sunTimes.civilDusk && (
              <div>
                <span className="text-[#7A7468] block text-[10px]">Civil Dusk:</span>
                <span className="font-mono font-semibold text-[#171614]">{sunTimes.civilDusk}</span>
              </div>
            )}
            {sunTimes.moonPhaseName && (
              <div>
                <span className="text-[#7A7468] block text-[10px]">Moon Phase:</span>
                <span className="font-medium text-[#171614]">{sunTimes.moonPhaseName}</span>
              </div>
            )}
            {sunTimes.moonIlluminationPct !== undefined && (
              <div>
                <span className="text-[#7A7468] block text-[10px]">Illumination:</span>
                <span className="font-mono font-semibold text-[#171614]">{sunTimes.moonIlluminationPct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Muhūrta Windows */}
        <div className="p-4 rounded-xl bg-white border border-[#E6DEC8] space-y-3 shadow-3xs">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#171614] tracking-tight uppercase border-b border-[#F0ECE1] pb-2">
            <Clock className="w-4 h-4 text-[#7A2D12]" /> Auspicious &amp; Inauspicious Muhūrta Windows
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#8B0000] font-medium block text-[11px] font-serif">Rāhukāla (Inauspicious)</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.rahukala}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#1E4620] font-medium block text-[11px] font-serif">Abhijit (Auspicious)</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.abhijit}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#8B0000] font-medium block text-[11px] font-serif">Yamagaṇḍa</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.yamaghanta}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#1E4620] font-medium block text-[11px] font-serif">Brahma Muhūrta</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.brahmaMuhurta}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#5C5850] block text-[11px] font-serif">Gulikakāla</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.gulikakala}</span>
            </div>
            <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#E6DEC8]">
              <span className="text-[#1E4620] font-medium block text-[11px] font-serif">Amṛta Kāla</span>
              <span className="font-mono font-semibold text-[#171614]">{muhurtas.amritKalam}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Choghadiya Expansion Section */}
      {(muhurtas.choghadiyaDay || muhurtas.choghadiyaNight) && (
        <div className="p-4 rounded-xl bg-white border border-[#E6DEC8] space-y-3 shadow-3xs">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowChoghadiya(!showChoghadiya)}
              className="flex items-center gap-2 text-xs font-serif font-bold text-[#7A2D12] tracking-tight uppercase hover:text-[#5C1E0A] transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Choghadiyā Table (Daily 8-Period Planetary Muhūrta)</span>
              {showChoghadiya ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showChoghadiya && (
              <div className="flex items-center gap-1 bg-[#F0ECE1] p-0.5 rounded-lg border border-[#D8CEBA]">
                <button
                  type="button"
                  onClick={() => setChoghadiyaTab('day')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                    choghadiyaTab === 'day' ? 'bg-[#7A2D12] text-white' : 'text-[#5C5850]'
                  }`}
                >
                  Day Choghadiyā
                </button>
                <button
                  type="button"
                  onClick={() => setChoghadiyaTab('night')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                    choghadiyaTab === 'night' ? 'bg-[#7A2D12] text-white' : 'text-[#5C5850]'
                  }`}
                >
                  Night Choghadiyā
                </button>
              </div>
            )}
          </div>

          {showChoghadiya && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#F4EFE6] text-[#4A463E] border-b border-[#D8CEBA]">
                    <th className="p-2.5 font-semibold">#</th>
                    <th className="p-2.5 font-semibold">Choghadiyā</th>
                    <th className="p-2.5 font-semibold">Time Window (12-Hour)</th>
                    <th className="p-2.5 font-semibold">Nature &amp; Category</th>
                    <th className="p-2.5 font-semibold">Ruling Planet</th>
                    <th className="p-2.5 font-semibold">Auspiciousness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {(choghadiyaTab === 'day' ? muhurtas.choghadiyaDay : muhurtas.choghadiyaNight)?.map((slot) => (
                    <tr
                      key={slot.number}
                      className={`hover:bg-[#FAF7F0] transition-colors ${
                        slot.isCurrent ? 'bg-[#FFF8EE] font-semibold' : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono text-[#7A2D12]">
                        {slot.number}
                        {slot.isCurrent && <span className="ml-1 text-[10px] text-[#7A2D12]">(Now)</span>}
                      </td>
                      <td className="p-2.5 font-serif font-bold text-[#171614]">
                        {slot.name} ({slot.sanskritName})
                      </td>
                      <td className="p-2.5 font-mono text-[#171614]">{slot.timeRange}</td>
                      <td className="p-2.5 text-[#5C5850]">{slot.nature}</td>
                      <td className="p-2.5 font-serif text-[#171614]">{slot.rulingPlanetName}</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            slot.isAuspicious
                              ? 'bg-[#EBF7EB] text-[#1E4620] border border-[#C6E6C6]'
                              : 'bg-[#FDF2F2] text-[#8B0000] border border-[#F5C2C2]'
                          }`}
                        >
                          {slot.isAuspicious ? 'Auspicious' : 'Inauspicious'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
