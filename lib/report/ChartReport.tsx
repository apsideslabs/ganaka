'use client';

/**
 * Gaṇaka — the chart report as a react-pdf document.
 *
 * Replaces the hand-placed jsPDF generator. Everything here is laid out with
 * flexbox instead of millimetre coordinates, the charts are real SVG polygons
 * with fills, and the type is Noto Serif, so IAST diacritics render properly
 * rather than being folded to ASCII.
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Svg,
  Polygon,
  Line,
  StyleSheet,
} from '@react-pdf/renderer';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateAvakahadaChakra } from '@/lib/jyotisha/avakahada';
import { SERIF } from './fonts';

const INK = '#1B1B1F';
const MUTED = '#7A7267';
const ACCENT = '#8C2D19';
const RULE = '#E0D8C8';
const PAPER = '#FDFBF6';
const KENDRA = '#F7EFDF';
const BAND = '#F5EEE0';

const RASHI = [
  'Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Simha', 'Kanyā',
  'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna',
];
const RASHI_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const GRAHA: Record<string, { short: string; name: string; deva: string; ink: string }> = {
  sun: { short: 'Su', name: 'Sūrya', deva: 'सूर्य', ink: '#B45309' },
  moon: { short: 'Mo', name: 'Candra', deva: 'चन्द्र', ink: '#3F4A5A' },
  mars: { short: 'Ma', name: 'Maṅgala', deva: 'मङ्गल', ink: '#B91C1C' },
  mercury: { short: 'Me', name: 'Budha', deva: 'बुध', ink: '#15803D' },
  jupiter: { short: 'Ju', name: 'Guru', deva: 'गुरु', ink: '#A16207' },
  venus: { short: 'Ve', name: 'Śukra', deva: 'शुक्र', ink: '#7C3AED' },
  saturn: { short: 'Sa', name: 'Śani', deva: 'शनि', ink: '#1E3A8A' },
  rahu: { short: 'Ra', name: 'Rāhu', deva: 'राहु', ink: '#6B21A8' },
  ketu: { short: 'Ke', name: 'Ketu', deva: 'केतु', ink: '#0F766E' },
};
const PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

/* ---------------------------------------------------------------- geometry */

const HOUSE_POLY: Record<number, string> = {
  1: '50,0 75,25 50,50 25,25',
  2: '0,0 50,0 25,25',
  3: '0,0 25,25 0,50',
  4: '0,50 25,25 50,50 25,75',
  5: '0,50 25,75 0,100',
  6: '0,100 25,75 50,100',
  7: '50,50 75,75 50,100 25,75',
  8: '50,100 75,75 100,100',
  9: '75,75 100,50 100,100',
  10: '50,50 75,25 100,50 75,75',
  11: '75,25 100,0 100,50',
  12: '50,0 100,0 75,25',
};
const KENDRA_HOUSES = [1, 4, 7, 10];
/** Percent positions: sign label near the outer edge, planets at the cell centre. */
const SIGN_AT: Array<[number, number]> = [
  [50, 9], [25, 5.5], [5.5, 25], [9, 50], [5.5, 75], [25, 94.5],
  [50, 91], [75, 94.5], [94.5, 75], [91, 50], [94.5, 25], [75, 5.5],
];
const CENTRE_AT: Array<[number, number]> = [
  [50, 29], [25, 12], [12, 25], [29, 50], [12, 75], [25, 88],
  [50, 71], [75, 88], [88, 75], [71, 50], [88, 25], [75, 12],
];

/* ------------------------------------------------------------------ styles */

const S = StyleSheet.create({
  page: {
    paddingTop: 64, paddingBottom: 46, paddingHorizontal: 42,
    fontFamily: SERIF, fontSize: 8.6, color: INK, backgroundColor: '#FFFFFF',
  },
  runningHead: {
    position: 'absolute', top: 18, left: 42, right: 42,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  runningBrand: { fontSize: 8, letterSpacing: 2, color: ACCENT, fontFamily: SERIF },
  runningMeta: { fontSize: 6.4, color: MUTED },
  runningChapter: { fontSize: 6.4, color: MUTED, letterSpacing: 1.2 },
  headRule: { position: 'absolute', top: 44, left: 42, right: 42, height: 0.8, backgroundColor: ACCENT },
  headRuleThin: { position: 'absolute', top: 46.4, left: 42, right: 42, height: 0.4, backgroundColor: RULE },

  chapterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chapterBar: { width: 3, height: 15, backgroundColor: ACCENT, marginRight: 7 },
  chapterTitle: { fontSize: 15, letterSpacing: 0.2 },

  h3: { fontSize: 10.5, marginTop: 12, marginBottom: 6, color: INK },
  rule: { height: 0.5, backgroundColor: RULE, marginBottom: 7 },

  /* tables */
  tHead: { flexDirection: 'row', backgroundColor: BAND, borderTopWidth: 0.6, borderTopColor: ACCENT, paddingVertical: 3.4 },
  tRow: { flexDirection: 'row', borderBottomWidth: 0.3, borderBottomColor: RULE, paddingVertical: 3.2 },
  tRowAlt: { backgroundColor: '#FBF8F1' },
  tCell: { fontSize: 7.6, paddingHorizontal: 3.4 },
  tCellHead: { fontSize: 6.6, paddingHorizontal: 3.4, letterSpacing: 0.6, color: MUTED },

  /* key/value pairs */
  kvWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  kv: { width: '50%', marginBottom: 7, paddingRight: 8 },
  kvLabel: { fontSize: 6.2, letterSpacing: 1, color: MUTED, marginBottom: 1.4 },
  kvValue: { fontSize: 9 },

  /* charts */
  chartCard: { marginBottom: 14, alignItems: 'center' },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 3.5, width: '100%' },
  chartTitle: { fontSize: 8.2, letterSpacing: 0.4 },
  chartNote: { fontSize: 6.6, color: MUTED },
  chartBox: { backgroundColor: PAPER, borderWidth: 0.5, borderColor: '#E4DCCC', position: 'relative' },

  /* cover */
  cover: { paddingHorizontal: 42, paddingTop: 54, paddingBottom: 40, fontFamily: SERIF, backgroundColor: PAPER },
  coverRule: { height: 1.4, backgroundColor: ACCENT, marginBottom: 4 },
  coverBrandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 },
  coverBrand: { fontSize: 9, letterSpacing: 3, color: ACCENT },
  coverTag: { fontSize: 6.4, color: MUTED, letterSpacing: 1.6 },
  coverTitle: { fontSize: 44, letterSpacing: -0.5 },
  coverTitle2: { fontSize: 34, color: ACCENT, marginTop: -4 },
  coverKicker: { fontSize: 7, letterSpacing: 3.4, color: MUTED, marginTop: 12 },
  coverName: { fontSize: 17, fontStyle: 'italic', color: ACCENT, marginTop: 22 },
  coverDate: { fontSize: 10, marginTop: 14, letterSpacing: 0.6 },
  coverPlace: { fontSize: 11, marginTop: 4 },
  coverCoords: { fontSize: 7.4, color: MUTED, marginTop: 3 },
  coverFoot: { position: 'absolute', left: 42, right: 42, bottom: 34 },
  coverFootRule: { height: 0.4, backgroundColor: RULE, marginBottom: 6 },
  coverFootRow: { flexDirection: 'row', justifyContent: 'space-between' },
  coverFootTxt: { fontSize: 6.8, color: MUTED },

  /* contents */
  tocRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 9 },
  tocNum: { width: 22, fontSize: 7.6, color: ACCENT, letterSpacing: 1 },
  tocTitle: { fontSize: 11 },
  tocDesc: { fontSize: 7.4, color: MUTED, marginTop: 1.2 },
  tocDots: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#D8D0C2', borderStyle: 'dotted', marginHorizontal: 5, marginBottom: 3 },

  footer: { position: 'absolute', bottom: 26, left: 42, right: 42, flexDirection: 'row', justifyContent: 'space-between' },
  footerTxt: { fontSize: 6.2, color: MUTED },
});

/* ------------------------------------------------------------- sub-components */

function RunningHead({ chapter, identity }: { chapter: string; identity: string }) {
  return (
    <>
      <View style={S.runningHead} fixed>
        <View>
          <Text style={S.runningBrand}>GANAKA</Text>
          <Text style={S.runningMeta}>{identity}</Text>
        </View>
        <Text style={S.runningChapter}>{chapter.toUpperCase()}</Text>
      </View>
      <View style={S.headRule} fixed />
      <View style={S.headRuleThin} fixed />
    </>
  );
}

function ChapterTitle({ children }: { children: string }) {
  return (
    <View style={S.chapterRow}>
      <View style={S.chapterBar} />
      <Text style={S.chapterTitle}>{children}</Text>
    </View>
  );
}

function SubTitle({ children }: { children: string }) {
  return (
    <>
      <Text style={S.h3}>{children}</Text>
      <View style={S.rule} />
    </>
  );
}

function KV({ rows }: { rows: Array<[string, string]> }) {
  return (
    <View style={S.kvWrap}>
      {rows.map(([k, v], i) => (
        <View key={i} style={S.kv}>
          <Text style={S.kvLabel}>{k.toUpperCase()}</Text>
          <Text style={S.kvValue}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

interface Col { label: string; width: number; align?: 'left' | 'right' | 'center' }

function Table({ cols, rows }: { cols: Col[]; rows: string[][] }) {
  return (
    <View>
      <View style={S.tHead} fixed>
        {cols.map((c, i) => (
          <Text
            key={i}
            style={[S.tCellHead, { width: `${c.width}%`, textAlign: c.align || 'left' }]}
          >
            {c.label.toUpperCase()}
          </Text>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={ri % 2 === 1 ? [S.tRow, S.tRowAlt] : S.tRow} wrap={false}>
          {r.map((cell, ci) => (
            <Text
              key={ci}
              style={[S.tCell, { width: `${cols[ci].width}%`, textAlign: cols[ci].align || 'left' }]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Kundali({ varga, size, title }: { varga: any; size: number; title: string }) {
  const byHouse: Record<number, Array<{ id: string; short: string; ink: string }>> = {};
  for (const [id, p] of Object.entries<any>(varga.planets || {})) {
    const g = GRAHA[id] || { short: id.slice(0, 2), ink: INK };
    (byHouse[p.house] ||= []).push({ id, short: g.short, ink: g.ink });
  }

  return (
    <View style={S.chartCard}>
      <View style={[S.chartHead, { width: size }]}>
        <Text style={S.chartTitle}>{title}</Text>
        <Text style={S.chartNote}>Lagna {RASHI[varga.lagnaRashi - 1]}</Text>
      </View>
      <View style={[S.chartBox, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {KENDRA_HOUSES.map((h) => (
            <Polygon key={`k${h}`} points={HOUSE_POLY[h]} fill={KENDRA} />
          ))}
          <Polygon points="0,0 100,0 100,100 0,100" fill="none" stroke="#4A4238" strokeWidth={0.7} />
          <Line x1={0} y1={0} x2={100} y2={100} stroke="#4A4238" strokeWidth={0.3} />
          <Line x1={100} y1={0} x2={0} y2={100} stroke="#4A4238" strokeWidth={0.3} />
          <Polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="#4A4238" strokeWidth={0.7} />
        </Svg>

        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const rashi = ((varga.lagnaRashi - 1 + h - 1) % 12) + 1;
          const [sx, sy] = SIGN_AT[h - 1];
          const [cx, cy] = CENTRE_AT[h - 1];
          const list = byHouse[h] || [];
          const fs = list.length > 4 ? 5.6 : list.length > 2 ? 6.4 : 7.4;
          return (
            <React.Fragment key={`h${h}`}>
              <Text
                style={{
                  position: 'absolute', left: (sx / 100) * size - 8, top: (sy / 100) * size - 4,
                  width: 16, textAlign: 'center', fontSize: 7, color: ACCENT,
                }}
              >
                {rashi}
              </Text>
              {list.map((p, i) => (
                <Text
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: (cx / 100) * size - 12,
                    top: (cy / 100) * size - (list.length * fs * 0.62) / 2 + i * fs * 0.62,
                    width: 24,
                    textAlign: 'center',
                    fontSize: fs,
                    color: p.ink,
                  }}
                >
                  {p.short}
                </Text>
              ))}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function Cover({ chart, personName }: { chart: JyotishaChart; personName?: string }) {
  const bd = chart.meta.birthDetails;
  const p2 = (n: number) => String(n).padStart(2, '0');
  return (
    <Page size="A4" style={S.cover}>
      <View style={S.coverBrandRow}>
        <Text style={S.coverBrand}>GANAKA</Text>
        <Text style={S.coverTag}>CLASSICAL JYOTIṢA ENGINE</Text>
      </View>
      <View style={S.coverRule} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 96 }}>
        <View style={{ width: 300 }}>
          <Text style={S.coverTitle}>Jyotiṣa</Text>
          <Text style={S.coverTitle2}>Birth Chart</Text>
          <Text style={S.coverKicker}>C O M P L E T E   R E P O R T</Text>
          {personName ? <Text style={S.coverName}>{personName}</Text> : null}
          <Text style={S.coverDate}>
            {`${p2(bd.day)}-${p2(bd.month)}-${bd.year}   ·   ${p2(bd.hour)}:${p2(bd.minute)}:${p2(bd.second)}`}
          </Text>
          <Text style={S.coverPlace}>{bd.locationName || '—'}</Text>
          <Text style={S.coverCoords}>
            {`Lat ${Math.abs(bd.latitude).toFixed(4)}${bd.latitude >= 0 ? ' N' : ' S'}   ·   Lon ${Math.abs(bd.longitude).toFixed(4)}${bd.longitude >= 0 ? ' E' : ' W'}   ·   UTC${bd.timezoneOffsetHours >= 0 ? '+' : ''}${bd.timezoneOffsetHours}`}
          </Text>
        </View>

        <View style={{ width: 130, alignItems: 'center', marginTop: 6 }}>
          <Svg width={130} height={130} viewBox="0 0 100 100">
            <Polygon points="50,2 98,50 50,98 2,50" fill="none" stroke={ACCENT} strokeWidth={0.8} />
            <Polygon points="50,20 80,50 50,80 20,50" fill="none" stroke={ACCENT} strokeWidth={0.5} />
            <Polygon points="50,38 62,50 50,62 38,50" fill={ACCENT} />
          </Svg>
          <Text style={{ fontSize: 6.4, letterSpacing: 1.6, color: ACCENT, marginTop: 8 }}>LAGNA</Text>
          <Text style={{ fontSize: 12, marginTop: 2 }}>{RASHI[chart.lagna.rashiNumber - 1]}</Text>
          <Text style={{ fontSize: 7, color: MUTED, marginTop: 1 }}>{chart.lagna.degreeStr}</Text>
        </View>
      </View>

      <View style={S.coverFoot} fixed>
        <View style={S.coverFootRule} />
        <View style={S.coverFootRow}>
          <Text style={S.coverFootTxt}>
            {`Ayanāṃśa ${chart.meta.ayanamshaType} ${chart.meta.ayanamshaFormatted}`}
          </Text>
          <Text style={S.coverFootTxt}>{chart.meta.engineVersion}</Text>
        </View>
        <View style={[S.coverFootRow, { marginTop: 2 }]}>
          <Text style={S.coverFootTxt}>{chart.meta.houseSystem.replace('_', ' ')}</Text>
          <Text style={S.coverFootTxt}>{new Date().toISOString().slice(0, 10)}</Text>
        </View>
      </View>
    </Page>
  );
}

const CHAPTERS: Array<{ title: string; desc: string }> = [
  { title: 'Birth Data & Pañcāṅga', desc: 'Date, place, ayanāṃśa, tithi, nakṣatra, yoga, karaṇa' },
  { title: 'Avakahada Cakra', desc: 'Birth matrix: nāmākṣara, paya, yoni, gaṇa, nāḍī, gotra' },
  { title: 'Planetary Positions', desc: 'All nine grahas with rāśi, degree, nakṣatra and dignity' },
  { title: 'Lagna Kuṇḍalī (D-1)', desc: 'Rāśi chart with the twelve bhāvas' },
  { title: 'Divisional Charts', desc: 'Ṣoḍaśavargas, D-1 through D-144' },
  { title: 'Aṣṭakavarga', desc: 'Sarva and bhinna aṣṭakavarga bindus' },
  { title: 'Viṃśottarī Daśā', desc: 'Mahā, antara and pratyantar periods' },
  { title: 'Śaḍbala', desc: 'Six-fold planetary strength in virūpas' },
  { title: 'Doṣas, Jaimini & Sphuṭas', desc: 'Doṣa status, chara kārakas, ārūḍhas, upagrahas' },
];

function Contents() {
  return (
    <Page size="A4" style={S.page} wrap>
      <ChapterTitle>Contents</ChapterTitle>
      <View style={{ marginTop: 8 }}>
        {CHAPTERS.map((c, i) => (
          <View key={i} style={S.tocRow} wrap={false}>
            <Text style={S.tocNum}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={{ flex: 1 }}>
              <Text style={S.tocTitle}>{c.title}</Text>
              <Text style={S.tocDesc}>{c.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

/* ------------------------------------------------------------------ document */

export function ChartReport({
  chart,
  personName,
}: {
  chart: JyotishaChart;
  personName?: string;
}) {
  const bd = chart.meta.birthDetails;
  const p2 = (n: number) => String(n).padStart(2, '0');
  const identity = [personName, `${p2(bd.day)}-${p2(bd.month)}-${bd.year}`, bd.locationName]
    .filter(Boolean)
    .join('  ·  ');

  const vargas = Object.values(chart.vargas || {}) as any[];
  const av: any = (() => {
    try {
      return calculateAvakahadaChakra(chart);
    } catch {
      return null;
    }
  })();
  const pn: any = chart.panchanga;
  const tree: any[] = (chart.vimshottari as any)?.tree || [];
  const sav: number[] = (chart.ashtakavarga as any)?.sav?.bindusByRashi || [];

  const chartPages: any[][] = [];
  for (let i = 0; i < vargas.length; i += 2) chartPages.push(vargas.slice(i, i + 2));

  return (
    <Document
      title={`Jyotisa Birth Chart${personName ? ` — ${personName}` : ''}`}
      author="Ganaka"
      subject="Vedic birth chart report"
      creator="Ganaka Classical Jyotisa Engine"
    >
      <Cover chart={chart} personName={personName} />
      <Contents />

      {/* ------------------------------------------------ birth data */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Birth Data" identity={identity} />
        <ChapterTitle>Birth Data &amp; Pañcāṅga</ChapterTitle>
        <SubTitle>Particulars</SubTitle>
        <KV
          rows={[
            ['Date', `${p2(bd.day)}-${p2(bd.month)}-${bd.year}`],
            ['Time', `${p2(bd.hour)}:${p2(bd.minute)}:${p2(bd.second)}`],
            ['Place', bd.locationName || '—'],
            ['Timezone', `UTC${bd.timezoneOffsetHours >= 0 ? '+' : ''}${bd.timezoneOffsetHours}`],
            ['Latitude', `${Math.abs(bd.latitude).toFixed(4)}${bd.latitude >= 0 ? ' N' : ' S'}`],
            ['Longitude', `${Math.abs(bd.longitude).toFixed(4)}${bd.longitude >= 0 ? ' E' : ' W'}`],
            ['Ayanāṃśa', `${chart.meta.ayanamshaType} (${chart.meta.ayanamshaFormatted})`],
            ['House system', chart.meta.houseSystem.replace('_', ' ')],
          ]}
        />
        <SubTitle>Ascendant</SubTitle>
        <KV
          rows={[
            ['Lagna', `${RASHI[chart.lagna.rashiNumber - 1]} ${chart.lagna.degreeStr}`],
            ['Nakṣatra', `${chart.lagna.nakshatraName} pada ${chart.lagna.pada}`],
          ]}
        />
        <SubTitle>Pañcāṅga</SubTitle>
        <KV
          rows={[
            ['Tithi', pn?.tithi ? `${pn.tithi.name} (${pn.tithi.number})` : '—'],
            ['Pakṣa', pn?.tithi?.paksha || '—'],
            ['Vāra', pn?.vara?.name || '—'],
            ['Nakṣatra', pn?.nakshatra ? `${pn.nakshatra.name} (${pn.nakshatra.number})` : '—'],
            ['Yoga', pn?.yoga?.name || '—'],
            ['Karaṇa', pn?.karana?.name || '—'],
            ['Sunrise', pn?.sunTimes?.sunrise || '—'],
            ['Sunset', pn?.sunTimes?.sunset || '—'],
          ]}
        />
      </Page>

      {/* ------------------------------------------------ avakahada */}
      {av && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="Avakahada Cakra" identity={identity} />
          <ChapterTitle>Avakahada Cakra</ChapterTitle>
          <SubTitle>Birth Matrix</SubTitle>
          <KV
            rows={[
              ['Lagna', `${av.lagna.sanskritName} ${av.lagna.degreeFormatted}`],
              ['Lagna lord', av.lagna.lordName],
              ['Rāśi (Moon)', `${av.rashi.name} ${av.rashi.degreeInRashi}`],
              ['Rāśi lord', av.rashi.lordName],
              ['Sun sign', av.sunSign.name],
              ['Nakṣatra', `${av.nakshatra.name} pada ${av.nakshatra.pada}`],
              ['Nakṣatra lord', av.nakshatra.lordName],
              ['Nāmākṣara', av.namakshara.iast || av.namakshara.fullDisplay],
            ]}
          />
          <SubTitle>Classical Classifications</SubTitle>
          <Table
            cols={[{ label: 'Attribute', width: 30 }, { label: 'Value', width: 70 }]}
            rows={[
              ['Paya', `${av.paya.type} · ${av.paya.metal}`],
              ['Varṇa', av.varna.type],
              ['Vaśya', av.vashya.type],
              ['Yoni', `${av.yoni.animal} (${av.yoni.gender})`],
              ['Gaṇa', av.gana.type],
              ['Nāḍī', av.nadi.type],
              ['Rajju', av.rajju.type],
              ['Tattva', av.tattva.type],
              ['Vihaga', av.vihaga.bird],
              ['Vedha', av.vedha?.pairText || '—'],
              ['Yunja', av.yunja.type],
              ['Gotra', av.gotra.rishi],
              ['Vṛkṣa', av.vriksha.treeName],
            ]}
          />
        </Page>
      )}

      {/* ------------------------------------------------ planets */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Planetary Positions" identity={identity} />
        <ChapterTitle>Planetary Positions</ChapterTitle>
        <Table
          cols={[
            { label: 'Graha', width: 16 },
            { label: 'Rāśi', width: 17 },
            { label: 'Degree', width: 15, align: 'right' },
            { label: 'Nakṣatra', width: 20 },
            { label: 'Pada', width: 8, align: 'center' },
            { label: 'Bhāva', width: 9, align: 'center' },
            { label: 'State', width: 15 },
          ]}
          rows={PLANETS.map((id) => {
            const p: any = (chart.planets as any)[id];
            if (!p) return ['—', '—', '—', '—', '—', '—', '—'];
            const state = [p.isRetrograde ? 'Retro' : '', p.isCombust ? 'Combust' : '']
              .filter(Boolean)
              .join(', ') || 'Direct';
            return [
              `${GRAHA[id]?.name || id}`,
              RASHI[p.rashiNumber - 1],
              p.degreeStr,
              p.nakshatraName,
              String(p.pada),
              String(p.house),
              state,
            ];
          })}
        />
      </Page>

      {/* ------------------------------------------------ D-1 */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Lagna Kundali" identity={identity} />
        <ChapterTitle>Lagna Kuṇḍalī (D-1)</ChapterTitle>
        <Kundali varga={chart.vargas.D1} size={330} title="D-1 · Rāśi" />
        <SubTitle>Bhāvas</SubTitle>
        <Table
          cols={[
            { label: 'Bhāva', width: 14, align: 'center' },
            { label: 'Rāśi', width: 30 },
            { label: 'Lord', width: 26 },
            { label: 'Occupants', width: 30 },
          ]}
          rows={(chart.bhavas || []).slice(0, 12).map((b: any) => [
            String(b.houseNumber),
            RASHI[b.rashiNumber - 1],
            GRAHA[b.rashiLord]?.name || String(b.rashiLord || '—'),
            (b.planetsInHouse || []).map((id: string) => GRAHA[id]?.short || id).join(' ') || '—',
          ])}
        />
      </Page>

      {/* ------------------------------------------------ vargas */}
      {chartPages.map((pair, i) => (
        <Page key={i} size="A4" style={S.page} wrap>
          <RunningHead chapter="Divisional Charts" identity={identity} />
          {i === 0 && <ChapterTitle>Divisional Charts</ChapterTitle>}
          {pair.map((v) => (
            <Kundali
              key={v.id}
              varga={v}
              size={i === 0 ? 300 : 322}
              title={v.name && v.name !== v.id ? `${v.id} · ${v.name}` : v.id}
            />
          ))}
          <Text style={[S.footerTxt, { marginTop: 'auto', textAlign: 'right' }]}>
            {`${i * 2 + 1}–${Math.min(i * 2 + 2, vargas.length)} of ${vargas.length}`}
          </Text>
        </Page>
      ))}

      {/* ------------------------------------------------ ashtakavarga */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Aṣṭakavarga" identity={identity} />
        <ChapterTitle>Aṣṭakavarga</ChapterTitle>
        <SubTitle>Sarvaṣṭakavarga</SubTitle>
        <Table
          cols={[{ label: '', width: 16 }, ...RASHI_EN.map((r) => ({ label: r.slice(0, 3), width: 7, align: 'center' as const }))]}
          rows={[['Bindus', ...sav.map(String)]]}
        />
        <SubTitle>Bhinnaṣṭakavarga</SubTitle>
        <Table
          cols={[{ label: '', width: 16 }, ...RASHI_EN.map((r) => ({ label: r.slice(0, 3), width: 7, align: 'center' as const }))]}
          rows={PLANETS.slice(0, 7).map((id) => {
            const t: any = (chart.ashtakavarga as any)?.bav?.[id];
            const arr = t?.bindusByRashi || [];
            return [GRAHA[id].short, ...(arr.length ? arr.map(String) : RASHI_EN.map(() => '—'))];
          })}
        />
      </Page>

      {/* ------------------------------------------------ dasha */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Viṃśottarī Daśā" identity={identity} />
        <ChapterTitle>Viṃśottarī Daśā</ChapterTitle>
        <SubTitle>Mahādaśā</SubTitle>
        <Table
          cols={[
            { label: 'Lord', width: 34 },
            { label: 'Start', width: 24 },
            { label: 'End', width: 24 },
            { label: 'Years', width: 18, align: 'right' },
          ]}
          rows={tree.map((d) => [
            d.lordName || GRAHA[d.lord]?.name || String(d.lord),
            d.startDate,
            d.endDate,
            d.durationYears != null ? Number(d.durationYears).toFixed(2) : '—',
          ])}
        />
        {tree.map((md, i) => {
          const subs: any[] = md.subPeriods || [];
          if (!subs.length) return null;
          return (
            <View key={i} wrap={false}>
              <SubTitle>{`Antardaśā — ${md.lordName || md.lord}`}</SubTitle>
              <Table
                cols={[
                  { label: 'Antardaśā', width: 40 },
                  { label: 'Start', width: 30 },
                  { label: 'End', width: 30 },
                ]}
                rows={subs.map((s2) => [
                  s2.lordName || GRAHA[s2.lord]?.name || String(s2.lord),
                  s2.startDate,
                  s2.endDate,
                ])}
              />
            </View>
          );
        })}
      </Page>

      {/* ------------------------------------------------ shadbala */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Śaḍbala" identity={identity} />
        <ChapterTitle>Śaḍbala</ChapterTitle>
        <Table
          cols={[
            { label: 'Graha', width: 16 },
            { label: 'Sthāna', width: 13, align: 'right' },
            { label: 'Kāla', width: 13, align: 'right' },
            { label: 'Dig', width: 12, align: 'right' },
            { label: 'Ceṣṭā', width: 13, align: 'right' },
            { label: 'Naisargika', width: 14, align: 'right' },
            { label: 'Dṛg', width: 11, align: 'right' },
            { label: 'Total', width: 14, align: 'right' },
          ]}
          rows={PLANETS.slice(0, 7).map((id) => {
            const r: any = (chart.shadbala as any)?.[id] || {};
            const f = (n: any) => (typeof n === 'number' ? n.toFixed(1) : '—');
            return [
              GRAHA[id].name, f(r.sthanaBala), f(r.kalaBala), f(r.digBala),
              f(r.chestaBala), f(r.naisargikaBala), f(r.drigBala), f(r.totalVirupas),
            ];
          })}
        />
      </Page>

      {/* ------------------------------------------------ doshas / jaimini */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Doṣas & Jaimini" identity={identity} />
        <ChapterTitle>Doṣas, Jaimini &amp; Sphuṭas</ChapterTitle>
        {((chart as any).doshas?.evaluatedDoshas || []).length > 0 && (
          <>
            <SubTitle>Doṣas</SubTitle>
            <Table
              cols={[
                { label: 'Doṣa', width: 46 },
                { label: 'Status', width: 28 },
                { label: 'Severity', width: 26 },
              ]}
              rows={(chart as any).doshas.evaluatedDoshas.map((d: any) => [
                d.name, d.formationStatus, d.severity,
              ])}
            />
          </>
        )}
        {((chart as any).jaimini?.charaKarakas || []).length > 0 && (
          <>
            <SubTitle>Chara Kārakas</SubTitle>
            <Table
              cols={[
                { label: 'Kāraka', width: 44 },
                { label: 'Graha', width: 34 },
                { label: 'Degrees', width: 22, align: 'right' },
              ]}
              rows={(chart as any).jaimini.charaKarakas.map((k: any) => [
                `${k.karakaKey} · ${k.karakaName}`,
                k.planetName,
                typeof k.degrees === 'number' ? k.degrees.toFixed(4) : '—',
              ])}
            />
          </>
        )}
        {((chart as any).jaimini?.arudhaPadas || []).length > 0 && (
          <>
            <SubTitle>Ārūḍha Padas</SubTitle>
            <Table
              cols={[
                { label: 'Bhāva', width: 18, align: 'center' },
                { label: 'Pada', width: 52 },
                { label: 'Rāśi', width: 30 },
              ]}
              rows={(chart as any).jaimini.arudhaPadas.map((a: any) => [
                String(a.house), a.name, RASHI[a.rashiNumber - 1] || '—',
              ])}
            />
          </>
        )}
      </Page>
    </Document>
  );
}
