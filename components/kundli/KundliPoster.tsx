'use client';

/**
 * Gaṇaka — Kuṇḍalī leaf.
 *
 * A printed page carrying the whole chart, not a summary card: the three
 * reference signs, every graha with its nakṣatra and dignity, the twelve
 * bhāvas, the Viṃśottarī timeline, the yogas, the doṣas, the aṣṭakavarga and
 * the śaḍbala — in one continuous scroll, in the poster language.
 *
 * Everything here comes straight from the chart object; nothing is inferred.
 */
import React, { useMemo } from 'react';
import type { JyotishaChart } from '../../lib/jyotisha/types';
import { RashiMedallion, RASHI_ROMAN, RASHI_DEVANAGARI } from './RashiMedallion';

const GRAHA_DEVA: Record<string, string> = {
  sun: 'सूर्य', moon: 'चन्द्र', mars: 'मङ्गल', mercury: 'बुध', jupiter: 'गुरु',
  venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु',
};
const GRAHA_EN: Record<string, string> = {
  sun: 'Sūrya', moon: 'Candra', mars: 'Maṅgala', mercury: 'Budha', jupiter: 'Guru',
  venus: 'Śukra', saturn: 'Śani', rahu: 'Rāhu', ketu: 'Ketu',
};
const ORDER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

const SectionHead: React.FC<{ n: string; title: string; deva?: string }> = ({ n, title, deva }) => (
  <div className="flex items-baseline gap-3 mb-4">
    <span className="text-[11px] tracking-[0.3em] text-[#C8963E] font-semibold">{n}</span>
    <h2 className="text-[1.15rem] font-bold tracking-[0.16em] uppercase text-[#8E1B2C]">{title}</h2>
    {deva ? (
      <span className="text-[13px] text-[#A98A5E]"
            style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>{deva}</span>
    ) : null}
    <span className="flex-1 h-px bg-gradient-to-r from-[#E9BE72] to-transparent" />
  </div>
);

const Rule = () => (
  <div className="my-9 flex items-center justify-center gap-2">
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#E9BE72]" />
    <span className="w-1.5 h-1.5 rotate-45 bg-[#C8963E]" />
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#E9BE72]" />
  </div>
);

export const KundliPoster: React.FC<{ chart: JyotishaChart }> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const sun: any = chart.planets.sun;
  const moon: any = chart.planets.moon;
  const lagnaRashi = chart.lagna.rashiNumber;

  const monthName = useMemo(
    () => new Date(Date.UTC(b.year, b.month - 1, b.day))
      .toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' }), [b]);
  const weekday = useMemo(
    () => new Date(Date.UTC(b.year, b.month - 1, b.day))
      .toLocaleString('en-GB', { weekday: 'long', timeZone: 'UTC' }), [b]);

  const pn: any = (chart as any).panchanga ?? {};
  const dashaTree: any[] = (chart.vimshottari as any)?.tree ?? [];
  const yogas: any[] = ((chart as any).yogas ?? []).filter((y: any) => y.isPresent !== false);
  const doshas: any[] = ((chart as any).doshas?.evaluatedDoshas ?? []).filter(
    (d: any) => d.classicalStatus && !/not\s*formed/i.test(String(d.classicalStatus))
  );
  const sav: number[] = (chart.ashtakavarga as any)?.sav?.bindusByRashi ?? [];
  const karakas: any[] = (chart.jaimini as any)?.charaKarakas ?? [];

  return (
    <div className="ganaka-poster relative w-full">
      {/* ---- maroon bar ---- */}
      <div className="poster-bar">
        <div className="mx-auto max-w-3xl px-5 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.26em] uppercase opacity-75">Gaṇaka ››</div>
            <div className="text-sm font-semibold tracking-[0.1em] mt-0.5">Kuṇḍalī Patraka</div>
          </div>
          <div className="text-[10px] tracking-[0.2em] opacity-75">
            {chart.meta.ayanamshaFormatted}
          </div>
        </div>
      </div>

      <div className="poster-ornament" />

      <div className="mx-auto max-w-3xl px-6 pb-24">
        {/* ================= cover ================= */}
        <div className="text-center pt-10">
          <h1 className="poster-title">Kuṇḍalī of</h1>
          <p className="poster-name mt-1">{b.locationName.split(',')[0]}</p>

          <div className="poster-meta mt-6">
            <div>{b.locationName}</div>
            <div className="mt-1">{b.day} {monthName} {b.year}</div>
            <div className="mt-1">
              {weekday}, {String(b.hour).padStart(2, '0')}:{String(b.minute).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 poster-meta">
            <span>Lagna <strong className="text-[#8E1B2C]">{RASHI_ROMAN[lagnaRashi - 1]}</strong></span>
            <span>Rāśi <strong className="text-[#8E1B2C]">{moon?.rashiName}</strong></span>
            <span>Nakṣatra <strong className="text-[#8E1B2C]">{moon?.nakshatraName} {moon?.pada}</strong></span>
          </div>
        </div>

        <Rule />

        {/* ================= three reference signs ================= */}
        <SectionHead n="01" title="The Three Signs" deva="त्रिलग्न" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-center">
          <div className="text-center">
            <RashiMedallion rashi={sun?.rashiNumber ?? 1} size={180} caption="Sūrya" />
            <p className="poster-meta mt-2">{sun?.degreeStr}</p>
          </div>
          <div className="text-center">
            <RashiMedallion rashi={moon?.rashiNumber ?? 1} size={180} caption="Candra" />
            <p className="poster-meta mt-2">{moon?.degreeStr}</p>
          </div>
          <div className="text-center">
            <RashiMedallion rashi={lagnaRashi} size={180} caption="Lagna" accent="#8E1B2C" />
            <p className="poster-meta mt-2">{chart.lagna.degreeStr}</p>
          </div>
        </div>

        <Rule />

        {/* ================= graha table ================= */}
        <SectionHead n="02" title="Graha Sphuṭa" deva="ग्रहस्फुट" />
        <div className="paper-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F8E7C4]/70 text-[#8A6A3E]">
                <th className="text-left py-2 pl-3 font-normal tracking-[0.14em] text-[10px] uppercase">Graha</th>
                <th className="text-left py-2 font-normal tracking-[0.14em] text-[10px] uppercase">Rāśi</th>
                <th className="text-right py-2 font-normal tracking-[0.14em] text-[10px] uppercase">Degree</th>
                <th className="text-left py-2 pl-4 font-normal tracking-[0.14em] text-[10px] uppercase">Nakṣatra</th>
                <th className="text-center py-2 font-normal tracking-[0.14em] text-[10px] uppercase">Bhāva</th>
                <th className="text-right py-2 pr-3 font-normal tracking-[0.14em] text-[10px] uppercase">Dignity</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((k) => {
                const p: any = (chart.planets as any)[k];
                if (!p) return null;
                return (
                  <tr key={k} className="border-t border-[#EBDCBB]">
                    <td className="py-2 pl-3 whitespace-nowrap">
                      <span className="text-[13px] text-[#8E1B2C] mr-2"
                            style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>
                        {GRAHA_DEVA[k]}
                      </span>
                      <span className="text-[#3B2416]">{GRAHA_EN[k]}</span>
                      {p.isRetrograde ? <span className="ml-1 text-[10px] text-[#C0392B]">R</span> : null}
                      {p.isCombust ? <span className="ml-1 text-[10px] text-[#B8862F]">C</span> : null}
                    </td>
                    <td className="py-2 text-[#5C4028]">{p.rashiName}</td>
                    <td className="py-2 text-right tabular-nums text-[#5C4028]">{p.degreeStr}</td>
                    <td className="py-2 pl-4 text-[#5C4028]">
                      {p.nakshatraName} <span className="text-[#A98A5E]">{p.pada}</span>
                    </td>
                    <td className="py-2 text-center tabular-nums text-[#5C4028]">{p.house}</td>
                    <td className="py-2 pr-3 text-right text-[12px] text-[#8A6A3E]">{p.dignity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Rule />

        {/* ================= bhavas ================= */}
        <SectionHead n="03" title="Bhāva" deva="भाव" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {((chart as any).bhavas ?? []).map((h: any) => (
            <div key={h.houseNumber} className="paper-card px-3 py-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] tracking-[0.2em] text-[#A98A5E]">HOUSE {h.houseNumber}</span>
                <span className="text-[11px] text-[#8E1B2C]">{RASHI_ROMAN[h.rashiNumber - 1]}</span>
              </div>
              <div className="mt-1 text-[12px] text-[#3B2416]">
                {h.planetsInHouse?.length
                  ? h.planetsInHouse.map((p: string) => GRAHA_EN[p] ?? p).join(' · ')
                  : <span className="text-[#B8A88A] italic">empty</span>}
              </div>
            </div>
          ))}
        </div>

        <Rule />

        {/* ================= vimshottari ================= */}
        <SectionHead n="04" title="Viṃśottarī Daśā" deva="विंशोत्तरी" />
        <div className="paper-card divide-y divide-[#EBDCBB]">
          {dashaTree.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
              <span className="flex items-center gap-3">
                <span className="text-[#8E1B2C] w-14"
                      style={{ fontFamily: '"Noto Serif Devanagari", serif' }}>
                  {GRAHA_DEVA[d.lord] ?? d.lord}
                </span>
                <span className="text-[#3B2416]">{GRAHA_EN[d.lord] ?? d.lordName}</span>
                {d.isBirthActive ? (
                  <span className="text-[9px] tracking-[0.14em] text-[#E6670A] border border-[#E6670A]/40 rounded px-1 py-px">
                    BIRTH
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums text-[#5C4028] text-[12px]">
                {d.startDate} — {d.endDate}
              </span>
            </div>
          ))}
        </div>

        <Rule />

        {/* ================= yogas ================= */}
        {yogas.length ? (
          <>
            <SectionHead n="05" title="Yogas" deva="योग" />
            <div className="flex flex-wrap gap-2">
              {yogas.map((y: any, i: number) => (
                <span key={i} className="paper-chip">{y.name}</span>
              ))}
            </div>
            <Rule />
          </>
        ) : null}

        {/* ================= doshas ================= */}
        {doshas.length ? (
          <>
            <SectionHead n="06" title="Doṣas" deva="दोष" />
            <div className="paper-card divide-y divide-[#EBDCBB]">
              {doshas.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-[#3B2416]">{d.name}</span>
                  <span className="text-[11px] text-[#8E1B2C]">{d.classicalStatus}</span>
                </div>
              ))}
            </div>
            <Rule />
          </>
        ) : null}

        {/* ================= ashtakavarga ================= */}
        {sav.length ? (
          <>
            <SectionHead n="07" title="Sarvāṣṭakavarga" deva="अष्टकवर्ग" />
            <div className="paper-card p-3">
              <div className="grid grid-cols-6 gap-1.5">
                {sav.map((v, i) => (
                  <div key={i} className="text-center py-1.5 rounded-sm bg-[#FBF0D8]">
                    <div className="text-[9px] tracking-[0.1em] text-[#A98A5E]">{i + 1}</div>
                    <div className="text-[15px] font-semibold tabular-nums text-[#8E1B2C]">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-center text-[11px] text-[#8A6A3E]">
                total {sav.reduce((a: number, x: number) => a + x, 0)}
              </div>
            </div>
            <Rule />
          </>
        ) : null}

        {/* ================= jaimini ================= */}
        {karakas.length ? (
          <>
            <SectionHead n="08" title="Jaimini Kārakas" deva="कारक" />
            <div className="paper-card divide-y divide-[#EBDCBB]">
              {karakas.map((k: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 text-[13px]">
                  <span className="text-[#8A6A3E] text-[11px] tracking-[0.14em]">{k.karakaKey}</span>
                  <span className="text-[#3B2416]">{GRAHA_EN[k.planet] ?? k.planet}</span>
                  <span className="tabular-nums text-[#5C4028] text-[12px]">{k.degrees?.toFixed(2)}°</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <p className="poster-meta mt-14 text-center opacity-60">
          Gaṇaka · classical jyotiṣa calculation · {chart.meta.engineVersion}
        </p>
      </div>
    </div>
  );
};
