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
  Path,
  Circle,
  Line,
  StyleSheet,
} from '@react-pdf/renderer';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateAvakahadaChakra } from '@/lib/jyotisha/avakahada';
import { calculateBhavaBala } from '@/lib/shadbala/bhava-bala';
import { calculatePhala } from '@/lib/jyotisha/phala-advanced';
import { calculateVimshopakaBala } from '@/lib/jyotisha/vimshopaka';
import { calculateAllExtendedDashas } from '@/lib/dashas/extended-engine';
import { calculateSudarshanaChakra } from '@/lib/jyotisha/sudarshana';
import { findEclipses } from '@/lib/astronomy/eclipses';
import { calculateDoubleTransit } from '@/lib/jyotisha/transits';
import { calculateRulingPlanets, KP_MATTERS, evaluateCuspPromise } from '@/lib/jyotisha/kp';
import { calculateCurrentTransits } from '@/lib/jyotisha/transits';
import { SERIF, SYMBOLS, SYMBOLS2 } from './fonts';

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
  // The engine also reports the true node; label it so it never prints as a raw
  // id, but keep it out of the drawn chart where the mean node already sits.
  true_rahu: { short: 'Rt', name: 'Rāhu (true)', deva: 'राहु', ink: '#6B21A8' },
  true_ketu: { short: 'Kt', name: 'Ketu (true)', deva: 'केतु', ink: '#0F766E' },
};
const PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

/** Unicode glyphs, drawn with Noto Sans Symbols. */
const RASHI_GLYPH = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const GRAHA_GLYPH: Record<string, string> = {
  sun: '☉', moon: '☽', mars: '♂', mercury: '☿', jupiter: '♃',
  venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋',
};
/** Sun lives in Symbols 2; everything else in Symbols 1. */
const glyphFamily = (id: string) => (id === 'sun' ? SYMBOLS2 : SYMBOLS);

const RAD = Math.PI / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => [
  cx + r * Math.cos(deg * RAD),
  cy + r * Math.sin(deg * RAD),
] as const;

/** Annulus sector, for the zodiac ring. */
function sector(cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number) {
  const [x1, y1] = pt(cx, cy, rOut, a0);
  const [x2, y2] = pt(cx, cy, rOut, a1);
  const [x3, y3] = pt(cx, cy, rIn, a1);
  const [x4, y4] = pt(cx, cy, rIn, a0);
  return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
}


/**
 * The body face is Noto Serif, which has no Devanagari coverage, so any
 * Devanagari embedded in a data string would render as empty boxes. Drop it
 * rather than print tofu; IAST transliteration is kept.
 */
const clean = (v: unknown): string =>
  String(v ?? '')
    .replace(/[\u0900-\u097F]+/g, '')
    .replace(/\(\s*[)\]}]*\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

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
  chapterNum: { fontSize: 15, color: ACCENT, marginRight: 8, letterSpacing: 0.4 },

  folio: {
    position: 'absolute', bottom: 20, left: 42, right: 42,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 0.5, borderTopColor: RULE, paddingTop: 4,
  },
  folioLeft: { fontSize: 6.2, letterSpacing: 1.1, color: MUTED },
  folioRight: { fontSize: 7, letterSpacing: 0.6, color: MUTED },

  h3: { fontSize: 10.5, marginTop: 12, marginBottom: 6, color: INK },

  glanceRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, marginBottom: 4 },
  glanceCell: {
    width: '33.33%', paddingHorizontal: 3, paddingVertical: 6,
  },
  glanceLabel: { fontSize: 6, letterSpacing: 0.8, color: MUTED, marginBottom: 1.5 },
  glanceValue: { fontSize: 9.4, color: INK },
  rule: { height: 0.5, backgroundColor: RULE, marginBottom: 7 },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2.6 },
  barLabel: { width: 62, fontSize: 7.4, color: INK },
  barTrack: { flex: 1, height: 7, backgroundColor: '#F1EADC', borderRadius: 1.5, marginRight: 6 },
  barFill: { height: 7, backgroundColor: ACCENT, borderRadius: 1.5, opacity: 0.85 },
  barValue: { width: 42, fontSize: 7, color: MUTED, textAlign: 'right' },

  timelineTrack: { flexDirection: 'row', height: 12, borderRadius: 2, overflow: 'hidden' },
  timelineKey: { fontSize: 6.2, color: MUTED, marginRight: 8 },

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
  coverPage: { fontFamily: SERIF, backgroundColor: '#FDFBF6', color: INK },
  frameOuter: { position: 'absolute', top: 18, left: 18, right: 18, bottom: 18, borderWidth: 0.9, borderColor: '#B08D4F' },
  frameInner: { position: 'absolute', top: 23, left: 23, right: 23, bottom: 23, borderWidth: 0.35, borderColor: '#D3BE93' },
  corner: { position: 'absolute', width: 5, height: 5, backgroundColor: '#B08D4F', transform: 'rotate(45deg)' },
  mastBrand: { position: 'absolute', top: 46, left: 0, width: '100%', textAlign: 'center', fontSize: 13, letterSpacing: 7, color: ACCENT },
  mastTag: { position: 'absolute', top: 63, left: 0, width: '100%', textAlign: 'center', fontSize: 5.6, letterSpacing: 2.6, color: '#8A7A5E' },
  mastRule: { position: 'absolute', top: 74, left: 214, width: 167, height: 0.5, backgroundColor: '#C9B790' },
  mastDiamond: { position: 'absolute', top: 71.5, left: 295, width: 4, height: 4, backgroundColor: '#B08D4F', transform: 'rotate(45deg)' },
  coverKicker2: { position: 'absolute', top: 552, left: 0, width: '100%', textAlign: 'center', fontSize: 6, letterSpacing: 3, color: '#8A7A5E' },
  coverBigTitle: { position: 'absolute', top: 570, left: 0, width: '100%', textAlign: 'center', fontSize: 30, color: ACCENT },
  coverSubName: { position: 'absolute', top: 610, left: 0, width: '100%', textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: INK },
  coverDivider: { position: 'absolute', top: 636, left: 246, width: 103, height: 0.4, backgroundColor: '#C9B790' },
  coverDividerDiamond: { position: 'absolute', top: 633.5, left: 295.5, width: 4, height: 4, backgroundColor: '#B08D4F', transform: 'rotate(45deg)' },
  infoBar: { position: 'absolute', top: 664, left: 66, width: 463, flexDirection: 'row', borderWidth: 0.6, borderColor: '#D3BE93', backgroundColor: '#FBF6EA', paddingVertical: 11 },
  infoCol: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  infoSep: { width: 0.4, backgroundColor: '#D8C7A4' },
  infoLabel: { fontSize: 5.2, letterSpacing: 1.6, color: '#9A8A6E', marginBottom: 3 },
  infoValue: { fontSize: 9.2, color: INK },
  infoSub: { fontSize: 6.2, color: MUTED, marginTop: 2 },
  coverImprint: { position: 'absolute', top: 752, left: 0, width: '100%', textAlign: 'center', fontSize: 5.4, letterSpacing: 1.8, color: '#8A7A5E' },
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


/**
 * A horizontal strength bar.
 *
 * Several chapters were tables of bare numbers — Bhāva Bala, Śaḍbala, the
 * daśā lengths. A reader cannot compare a column of figures at a glance; a bar
 * shows the ranking immediately. Drawn with Views rather than SVG because a
 * rectangle with a width percentage is cheaper and stays crisp.
 */
function StrengthBars({
  rows,
  max,
  unit = '',
}: {
  rows: Array<{ label: string; value: number; note?: string }>;
  max?: number;
  unit?: string;
}) {
  const top = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <View style={{ marginTop: 2 }}>
      {rows.map((r, i) => (
        <View key={i} style={S.barRow} wrap={false}>
          <Text style={S.barLabel}>{clean(r.label)}</Text>
          <View style={S.barTrack}>
            <View
              style={[
                S.barFill,
                { width: `${Math.max(1, Math.min(100, (r.value / top) * 100))}%` },
              ]}
            />
          </View>
          <Text style={S.barValue}>
            {r.value.toFixed(1)}{unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * A proportional timeline. Used for the daśā sequence so the reader can see how
 * much of a life each period claims before reading any dates.
 */
function Timeline({
  segments,
}: {
  segments: Array<{ label: string; weight: number; ink?: string }>;
}) {
  const total = segments.reduce((t, x) => t + x.weight, 0) || 1;
  return (
    <View style={{ marginTop: 4, marginBottom: 8 }}>
      <View style={S.timelineTrack}>
        {segments.map((x, i) => (
          <View
            key={i}
            style={{
              width: `${(x.weight / total) * 100}%`,
              height: 12,
              backgroundColor: x.ink || ACCENT,
              opacity: 0.55 + (i % 3) * 0.15,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 }}>
        {segments.map((x, i) => (
          <Text key={i} style={S.timelineKey}>
            {clean(x.label)} {x.weight.toFixed(1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

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

      {/* Folio. A bound report is paged; a web page is not. */}
      <View style={S.folio} fixed>
        <Text style={S.folioLeft}>GANAKA · CLASSICAL JYOTIṢA ENGINE</Text>
        <Text
          style={S.folioRight}
          render={({ pageNumber, totalPages }: any) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </>
  );
}

function ChapterTitle({ children, num }: { children: string; num?: number }) {
  return (
    <View style={S.chapterRow}>
      <View style={S.chapterBar} />
      {num != null && <Text style={S.chapterNum}>{String(num).padStart(2, '0')}</Text>}
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
          <Text style={S.kvValue}>{clean(v)}</Text>
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
            {clean(c.label).toUpperCase()}
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
              {clean(cell)}
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
    if (id.startsWith('true_')) continue; // mean node already drawn
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
          // A line of type is ~1.2x its size, so the step has to be at least
          // that or consecutive planets overlap - which is exactly what
          // happened in a house holding four of them.
          const fs = list.length > 5 ? 5 : list.length > 3 ? 5.8 : list.length > 2 ? 6.6 : 7.6;
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
                    top: (cy / 100) * size - (list.length * fs * 1.22) / 2 + i * fs * 1.22,
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

/** The cover: ornamental frame, zodiac wheel, title block, particulars bar. */
function Cover({ chart }: { chart: JyotishaChart }) {
  const bd = chart.meta.birthDetails;
  const p2 = (n: number) => String(n).padStart(2, '0');

  const W = 595.28;
  const H = 841.89;
  const cx = W / 2;
  const cy = 352;
  const R_OUT = 168;
  const R_RASHI = 140;   // inner edge of the zodiac band
  const R_HOUSE = 120;   // inner edge of the house-number band
  const R_FIELD = 52;    // inner field, planets orbit here
  const R_CENTRE = 44;

  const lagnaRashi = chart.lagna.rashiNumber;

  // planet glyphs grouped by house, spread across each 30 degree sector
  const byHouse: Record<number, string[]> = {};
  for (const id of PLANETS) {
    const pl: any = (chart.planets as any)[id];
    if (!pl) continue;
    (byHouse[pl.house] ||= []).push(id);
  }

  return (
    <Page size="A4" style={S.coverPage}>
      {/* ornamental frame */}
      <View style={S.frameOuter} fixed />
      <View style={S.frameInner} fixed />
      <View style={[S.corner, { top: 10, left: 10 }]} fixed />
      <View style={[S.corner, { top: 10, right: 10 }]} fixed />
      <View style={[S.corner, { bottom: 10, left: 10 }]} fixed />
      <View style={[S.corner, { bottom: 10, right: 10 }]} fixed />

      {/* masthead */}
      <Text style={S.mastBrand}>GANAKA</Text>
      <Text style={S.mastTag}>CLASSICAL JYOTISA ENGINE</Text>
      <View style={S.mastRule} />
      <View style={S.mastDiamond} />

      {/* zodiac wheel */}
      <View style={{ position: 'absolute', top: cy - R_OUT - 12, left: cx - R_OUT - 12, width: (R_OUT + 12) * 2, height: (R_OUT + 12) * 2 }}>
        <Svg width={(R_OUT + 12) * 2} height={(R_OUT + 12) * 2} viewBox={`0 0 ${(R_OUT + 12) * 2} ${(R_OUT + 12) * 2}`}>
          {Array.from({ length: 12 }, (_, i) => {
            const a0 = -90 + i * 30 - 15;
            const a1 = a0 + 30;
            const c = (R_OUT + 12);
            return (
              <Path
                key={i}
                d={sector(c, c, R_OUT, R_RASHI, a0, a1)}
                fill={i % 2 === 0 ? '#F6EEDD' : '#FBF6EA'}
                stroke="#C9B790"
                strokeWidth={0.5}
              />
            );
          })}
          <Circle cx={R_OUT + 12} cy={R_OUT + 12} r={R_HOUSE} fill="none" stroke="#C9B790" strokeWidth={0.5} />
          <Circle cx={R_OUT + 12} cy={R_OUT + 12} r={R_CENTRE} fill="#F6EEDD" stroke={ACCENT} strokeWidth={0.9} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = -90 + i * 30;
            const c = R_OUT + 12;
            const [x1, y1] = pt(c, c, R_CENTRE, a);
            const [x2, y2] = pt(c, c, R_HOUSE, a);
            return <Line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D8C7A4" strokeWidth={0.35} />;
          })}
        </Svg>

        {/* rashi glyphs */}
        {Array.from({ length: 12 }, (_, i) => {
          const house = i + 1;
          const rashi = ((lagnaRashi - 1 + i) % 12) + 1;
          const a = -90 + i * 30;
          const [x, y] = pt(R_OUT + 12, R_OUT + 12, (R_OUT + R_RASHI) / 2, a);
          return (
            <Text
              key={`r${i}`}
              style={{ position: 'absolute', left: x - 10, top: y - 7, width: 20, textAlign: 'center',
                       fontFamily: SYMBOLS, fontSize: 13, color: house === 1 ? ACCENT : '#7A6A4F' }}
            >
              {RASHI_GLYPH[rashi - 1]}
            </Text>
          );
        })}

        {/* house numbers */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = -90 + i * 30;
          const [x, y] = pt(R_OUT + 12, R_OUT + 12, R_HOUSE - 9, a);
          return (
            <Text
              key={`h${i}`}
              style={{ position: 'absolute', left: x - 8, top: y - 4, width: 16, textAlign: 'center',
                       fontSize: 6.4, color: '#9A8A6E' }}
            >
              {i + 1}
            </Text>
          );
        })}

        {/* planets */}
        {Object.entries(byHouse).flatMap(([h, ids]) =>
          ids.map((id, k) => {
            const n = ids.length;
            // Keep the group inside its 30 degree sector and give each glyph a
            // slot wide enough to read: alternate two radii when crowded, and
            // step the angle by at least a glyph width.
            const rMid = (R_HOUSE + R_FIELD) / 2;
            const radii = n > 3 ? [rMid - 14, rMid + 14] : n > 2 ? [rMid - 10, rMid + 10] : [rMid];
            const stepDeg = Math.min(6.5, 20 / Math.max(n, 1));
            const a = -90 + (Number(h) - 1) * 30 + (k - (n - 1) / 2) * stepDeg;
            const r = radii[k % radii.length];
            const [x, y] = pt(R_OUT + 12, R_OUT + 12, r, a);
            const gs = n > 3 ? 8.5 : n > 2 ? 9.5 : 11;
            return (
              <Text
                key={`${h}-${id}`}
                style={{ position: 'absolute', left: x - 9, top: y - gs * 0.55, width: 18, textAlign: 'center',
                         fontFamily: glyphFamily(id), fontSize: gs, color: GRAHA[id]?.ink || INK }}
              >
                {GRAHA_GLYPH[id]}
              </Text>
            );
          })
        )}

        {/* lagna in the centre */}
        <Text style={{ position: 'absolute', left: R_OUT + 12 - 12, top: R_OUT + 12 - 22, width: 24,
                       textAlign: 'center', fontFamily: SYMBOLS, fontSize: 18, color: ACCENT }}>
          {RASHI_GLYPH[lagnaRashi - 1]}
        </Text>
        <Text style={{ position: 'absolute', left: R_OUT + 12 - 24, top: R_OUT + 12 + 5, width: 48,
                       textAlign: 'center', fontSize: 4.8, letterSpacing: 1.2, color: '#8A7A5E' }}>
          LAGNA
        </Text>
      </View>

      {/* ascendant marker at the top of the wheel */}
      <Text style={{ position: 'absolute', top: cy - R_OUT - 24, left: cx - 14, width: 28, textAlign: 'center',
                     fontSize: 5.8, letterSpacing: 1.6, color: ACCENT }}>ASC</Text>
      <View style={{ position: 'absolute', top: cy - R_OUT - 15, left: cx - 5, width: 10, height: 6 }}>
        <Svg width={10} height={6} viewBox="0 0 10 6">
          <Polygon points="0,0 10,0 5,6" fill={ACCENT} />
        </Svg>
      </View>

      {/* title block */}
      <Text style={S.coverKicker2}>C O M P L E T E   J Y O T I S A   R E P O R T</Text>
      <Text style={S.coverBigTitle}>Jyotiṣa Birth Chart</Text>
      <View style={S.coverDivider} />
      <View style={S.coverDividerDiamond} />

      {/* particulars bar */}
      <View style={S.infoBar}>
        <View style={S.infoCol}>
          <Text style={S.infoLabel}>DATE &amp; TIME</Text>
          <Text style={S.infoValue}>{`${p2(bd.day)}-${p2(bd.month)}-${bd.year}  ·  ${p2(bd.hour)}:${p2(bd.minute)}`}</Text>
          <Text style={S.infoSub}>{`UTC${bd.timezoneOffsetHours >= 0 ? '+' : ''}${bd.timezoneOffsetHours}`}</Text>
        </View>
        <View style={S.infoSep} />
        <View style={S.infoCol}>
          <Text style={S.infoLabel}>PLACE</Text>
          <Text style={S.infoValue}>{bd.locationName || '—'}</Text>
          <Text style={S.infoSub}>{`${Math.abs(bd.latitude).toFixed(2)}° ${bd.latitude >= 0 ? 'N' : 'S'} · ${Math.abs(bd.longitude).toFixed(2)}° ${bd.longitude >= 0 ? 'E' : 'W'}`}</Text>
        </View>
        <View style={S.infoSep} />
        <View style={S.infoCol}>
          <Text style={S.infoLabel}>LAGNA</Text>
          <Text style={S.infoValue}>{RASHI[lagnaRashi - 1]}</Text>
          <Text style={S.infoSub}>{chart.lagna.degreeStr}</Text>
        </View>
      </View>

      {/* imprint */}
      <Text style={S.coverImprint}>
        {`${chart.meta.ayanamshaType.toUpperCase()} AYANĀṂŚA   ·   ${chart.meta.houseSystem.replace('_', ' ').toUpperCase()}   ·   VIṂŚOTTARĪ DAŚĀ`}
      </Text>
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
  { title: 'Bhāva Bala & Phala', desc: 'House strength, iṣṭa and kaṣṭa, viṃśopaka' },
  { title: 'Yogas', desc: 'Classical combinations detected in the chart' },
  { title: 'Daśā Systems', desc: 'All sixteen systems and the period running now' },
  { title: 'Dṛṣṭi & Sudarśana', desc: 'Graha aspects by house, and the three annual rings' },
  { title: 'Saṃhitā — Grahaṇa', desc: 'Eclipses across the decade, with the Moon’s latitude at each syzygy' },
  { title: 'KP Layer', desc: 'Ruling planets of the moment, and the sub-lord promise for each matter' },
  { title: 'Gochara', desc: 'Current transits with vedha and sāḍhe sātī, read from the natal Moon' },
  { title: 'Relationships & Attributes', desc: 'Pañcadhā maitrī, dispositors, favourable number, colour, day, gem' },
  { title: 'Doṣas, Jaimini & Sphuṭas', desc: 'Doṣa status, chara kārakas, ārūḍhas, upagrahas' },
];

function Contents({ identity }: { identity: string }) {
  return (
    <Page size="A4" style={S.page} wrap>
      <RunningHead chapter="Contents" identity={identity} />
      <ChapterTitle>Contents</ChapterTitle>
      <View style={{ marginTop: 8 }}>
        {CHAPTERS.map((c, i) => (
          <View key={i} style={S.tocRow} wrap={false}>
            <Text style={S.tocNum}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={{ flex: 1 }}>
              <Text style={S.tocTitle}>{clean(c.title)}</Text>
              <Text style={S.tocDesc}>{clean(c.desc)}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

/* ------------------------------------------------------------------ document */

export function ChartReport({ chart }: { chart: JyotishaChart }) {
  const bd = chart.meta.birthDetails;
  const p2 = (n: number) => String(n).padStart(2, '0');
  // The running head carries the moment and place only — this is Gaṇaka's
  // report, not a personal document.
  const identity = [`${p2(bd.day)}-${p2(bd.month)}-${bd.year}`, bd.locationName]
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

  // Strength and phala are computed here rather than passed in, so the report
  // carries every section the workspace shows. Each is guarded: a failure in one
  // drops that section rather than the whole document.
  const safe = (fn: () => any) => { try { return fn(); } catch { return null; } };
  const bhavaBala: any = safe(() => calculateBhavaBala(chart as any));
  const phala: any = safe(() => calculatePhala(chart as any));
  const vimshopaka: any = safe(() => calculateVimshopakaBala(chart.vargas));
  const extended: any = safe(() => {
    const b = chart.meta.birthDetails;
    const birth = new Date(Date.UTC(
      b.year, b.month - 1, b.day,
      Math.round(b.hour - (b.timezoneOffsetHours ?? 0)), b.minute, b.second
    ));
    return calculateAllExtendedDashas(chart as any, birth);
  });
  const dispositorRelations: any[] = ((chart as any).dispositorRelations || []);
  const relationshipSummary: any = ((chart as any).relationships?.summary) || null;
  const natalAttributes: any = ((chart as any).attributes) || null;
  const sudarshana: any = safe(() => {
    const yearOfLife = Math.max(1, new Date().getFullYear() - bd.year);
    return calculateSudarshanaChakra(chart as any, { yearOfLife });
  });
  const eclipses: any[] = safe(() => {
    const y = bd.year;
    return findEclipses({
      from: { year: y, month: 1, day: 1 },
      to: { year: y + 10, month: 12, day: 31 },
      latitude: bd.latitude, longitude: bd.longitude,
      timezoneOffsetHours: bd.timezoneOffsetHours,
      ayanamshaType: (chart.meta as any).ayanamshaType,
      maxResults: 40,
    });
  }) || [];
  const doubleTransit: any = safe(() =>
    calculateDoubleTransit(chart.lagna.rashiNumber, new Date(), (chart.meta as any).ayanamshaType));
  const argalaList: any[] = ((chart as any).argala || []);
  const kpRuling: any = safe(() => calculateRulingPlanets(
    new Date(), bd.latitude, bd.longitude, bd.timezoneOffsetHours, (chart.meta as any).ayanamshaType));
  const kpPromises: any[] = safe(() =>
    Object.entries(KP_MATTERS).map(([key, m]: any) => {
      const primary = m.matter[0] ?? 1;
      const r: any = evaluateCuspPromise(chart as any, primary, m.matter, m.detrimental);
      return r ? { ...r, label: m.label } : null;
    }).filter(Boolean)) || [];
  const gochar: any = safe(() => calculateCurrentTransits(
    (chart.planets as any).moon.rashiNumber,
    chart.lagna.rashiNumber,
    (chart.meta as any).ayanamshaType
  ));
  const formedYogas: any[] = ((chart.yogas as any[]) || []).filter(
    (y: any) => y && (y.isPresent !== false)
  );

  const chartPages: any[][] = [];
  for (let i = 0; i < vargas.length; i += 2) chartPages.push(vargas.slice(i, i + 2));

  return (
    <Document
      title="Jyotisa Birth Chart — Ganaka"
      author="Ganaka"
      subject="Vedic birth chart report"
      creator="Ganaka Classical Jyotisa Engine"
    >
      <Cover chart={chart} />
      <Contents identity={identity} />

      {/* ------------------------------------------------ birth data */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Birth Data" identity={identity} />
        <ChapterTitle num={1}>Birth Data &amp; Pañcāṅga</ChapterTitle>
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
        <SubTitle>Chart at a Glance</SubTitle>
        <View style={S.glanceRow}>
          {[
            ['Lagna', `${RASHI[(chart.lagna.rashiNumber || 1) - 1]} ${chart.lagna.degreeStr || ''}`.trim()],
            ['Candra Rāśi', RASHI[((chart.planets as any).moon?.rashiNumber || 1) - 1]],
            ['Janma Nakṣatra', `${(chart.planets as any).moon?.nakshatraName || '—'} pāda ${(chart.planets as any).moon?.pada ?? '—'}`],
            ['Mahādaśā', (() => {
              const active = tree.find((n: any) => n?.isBirthActive) ?? tree[0];
              return active?.lordName || active?.name || '—';
            })()],
            ['Yogas formed', String(((chart.yogas as any[]) || []).length)],
            ['Doṣas present', String(((chart as any).doshas?.evaluatedDoshas || [])
              .filter((d: any) => d.formationStatus !== 'Not Formed').length)],
          ].map(([k, v], i) => (
            <View key={i} style={S.glanceCell}>
              <Text style={S.glanceLabel}>{String(k).toUpperCase()}</Text>
              <Text style={S.glanceValue}>{clean(String(v))}</Text>
            </View>
          ))}
        </View>

        <SubTitle>Pañcāṅga</SubTitle>
        <KV
          rows={[
            ['Tithi', pn?.tithi ? (String(pn.tithi.name).includes('(') ? pn.tithi.name : `${pn.tithi.name} (${pn.tithi.number})`) : '—'],
            ['Pakṣa', pn?.tithi?.paksha || '—'],
            ['Vāra', pn?.vara?.name || '—'],
            ['Nakṣatra', pn?.nakshatra ? (String(pn.nakshatra.name).includes('(') ? pn.nakshatra.name : `${pn.nakshatra.name} (${pn.nakshatra.number})`) : '—'],
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
          <ChapterTitle num={2}>Avakahada Cakra</ChapterTitle>
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
        <ChapterTitle num={3}>Planetary Positions</ChapterTitle>
        <Table
          cols={[
            { label: 'Graha', width: 16 },
            { label: 'Rāśi', width: 17 },
            { label: 'Degree', width: 15, align: 'right' },
            { label: 'Nakṣatra', width: 20 },
            { label: 'Pada', width: 8, align: 'center' },
            { label: 'Bhāva', width: 9, align: 'center' },
            { label: 'State', width: 11 },
            { label: 'Bālādi', width: 11 },
            { label: 'Lajjitādi', width: 12 },
            { label: 'Sāyana', width: 11, align: 'right' },
          ]}
          rows={PLANETS.map((id) => {
            const p: any = (chart.planets as any)[id];
            if (!p) return ['—', '—', '—', '—', '—', '—', '—', '—', '—'];
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
              // Bālādi avasthā, the state the texts read strength from.
              String(p.avasthas?.baladi ?? '—').split(' ')[0],
              String(p.avasthas?.lajjitadi ?? '—').split(' ')[0],
              // Sāyana — the tropical longitude, before the ayanāṃśa is removed.
              typeof p.tropicalLongitude === 'number' ? `${p.tropicalLongitude.toFixed(2)}°` : '—',
            ];
          })}
        />

        <SubTitle>Bhāva Chalita</SubTitle>
        <Text style={{ fontSize: 7.2, color: MUTED, marginBottom: 5 }}>
          The same grahas placed by bhāva cusp rather than by sign. A graha marked with a shift
          sits in a different house once the unequal cusps are used — the reading changes with it.
        </Text>
        <Table
          cols={[
            { label: 'Graha', width: 18 },
            { label: 'Rāśi house', width: 15, align: 'center' },
            { label: 'Bhāva house', width: 16, align: 'center' },
            { label: 'Shift', width: 11, align: 'center' },
            { label: 'Degrees into bhāva', width: 22, align: 'right' },
            { label: 'From crest', width: 18, align: 'right' },
          ]}
          rows={(((chart as any).bhavaChalit?.entries) || []).map((e: any) => [
            GRAHA[e.planet]?.name || e.planet,
            String(e.rashiHouse),
            String(e.chalitHouse),
            e.shifted ? '◆' : '—',
            `${e.degreeInBhava.toFixed(2)}°`,
            `${e.fromMid > 0 ? '+' : ''}${e.fromMid.toFixed(2)}°`,
          ])}
        />

        <SubTitle>Bhāva Lords &amp; Occupants</SubTitle>
        <Table
          cols={[
            { label: 'Bhāva', width: 10, align: 'center' },
            { label: 'Rāśi', width: 24 },
            { label: 'Lord', width: 22 },
            { label: 'Occupants', width: 44 },
          ]}
          rows={((chart.bhavas as any[]) || []).map((h: any) => [
            String(h.houseNumber ?? h.house ?? '—'),
            RASHI[(h.rashiNumber || 1) - 1],
            GRAHA[String(h.rashiLord || h.lord || '').toLowerCase()]?.name || h.rashiLord || '—',
            (h.planetsInHouse || []).length
              ? (h.planetsInHouse as any[]).map((x: any) =>
                  GRAHA[String(x.planetId || x).toLowerCase()]?.name || String(x.planetId || x)).join(', ')
              : '—',
          ])}
        />
      </Page>

      {/* ------------------------------------------------ D-1 */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Lagna Kundali" identity={identity} />
        <ChapterTitle num={4}>Lagna Kuṇḍalī (D-1)</ChapterTitle>
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
          {i === 0 && <ChapterTitle num={5}>Divisional Charts</ChapterTitle>}
          {pair.map((v) => (
            <Kundali
              key={v.id}
              varga={v}
              size={i === 0 ? 300 : 322}
              title={v.name && v.name !== v.id ? `${v.id} · ${v.name}` : v.id}
            />
          ))}
        </Page>
      ))}

      {/* ------------------------------------------------ ashtakavarga */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Aṣṭakavarga" identity={identity} />
        <ChapterTitle num={6}>Aṣṭakavarga</ChapterTitle>
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
        <ChapterTitle num={7}>Viṃśottarī Daśā</ChapterTitle>
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
        <ChapterTitle num={8}>Śaḍbala</ChapterTitle>
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

        <SubTitle>Total Strength in Virūpas</SubTitle>
        <StrengthBars
          rows={PLANETS.slice(0, 7).map((id) => ({
            label: GRAHA[id]?.name || id,
            value: Number((chart.shadbala as any)?.[id]?.totalVirupas ?? 0),
          }))}
        />
        <Text style={{ fontSize: 6.8, color: MUTED, marginTop: 3 }}>
          Bars are scaled to the strongest graha. The required minimum for each is in the table above.
        </Text>
      </Page>


      {/* ------------------------------------------------ bhava bala & phala */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Bhāva Bala & Phala" identity={identity} />
        <ChapterTitle num={9}>Bhāva Bala &amp; Phala</ChapterTitle>
        <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
          House strength by the five components of BPHS 27.26–31, then the iṣṭa and kaṣṭa
          reading of BPHS 28 — which always total sixty — and the viṃśopaka weighting across
          the divisional charts.
        </Text>

        {bhavaBala && (
          <>
            <SubTitle>Bhāva Bala</SubTitle>
            <Table
              cols={[
                { label: 'Bhāva', width: 9, align: 'center' },
                { label: 'Rāśi', width: 20 },
                { label: 'Dig', width: 12, align: 'right' },
                { label: 'Dṛg', width: 12, align: 'right' },
                { label: 'Adhipati', width: 15, align: 'right' },
                { label: 'Total', width: 16, align: 'right' },
                { label: 'Rūpa', width: 16, align: 'right' },
              ]}
              rows={Object.entries(bhavaBala).map(([h, r]: any) => [
                h,
                r.rashiName || '—',
                r.digBala.toFixed(1),
                r.drigAdjustment.toFixed(1),
                r.adhipatiBala.toFixed(1),
                r.totalVirupas.toFixed(1),
                r.totalRupas.toFixed(2),
              ])}
            />
            <SubTitle>House Strength in Virūpas</SubTitle>
            <StrengthBars
              rows={Object.entries(bhavaBala).map(([h, r]: any) => ({
                label: `House ${h}`,
                value: r.totalVirupas,
              }))}
            />
          </>
        )}

        {phala?.planets && (
          <>
            <SubTitle>Iṣṭa &amp; Kaṣṭa Phala</SubTitle>
            <Table
              cols={[
                { label: 'Graha', width: 22 },
                { label: 'Ucca', width: 15, align: 'right' },
                { label: 'Ceṣṭā', width: 15, align: 'right' },
                { label: 'Iṣṭa', width: 16, align: 'right' },
                { label: 'Kaṣṭa', width: 16, align: 'right' },
                { label: 'Motion', width: 16 },
              ]}
              rows={Object.entries(phala.planets).map(([id, p]: any) => [
                GRAHA[id]?.name || id,
                p.uccaBala.toFixed(1),
                p.chestaBala.toFixed(1),
                p.ishta.toFixed(1),
                p.kashta.toFixed(1),
                p.motionState || '—',
              ])}
            />
          </>
        )}

        {vimshopaka && (
          <>
            <SubTitle>Viṃśopaka Bala</SubTitle>
            <Table
              cols={[
                { label: 'Graha', width: 20 },
                { label: 'Ṣaḍvarga', width: 16, align: 'right' },
                { label: 'Saptavarga', width: 18, align: 'right' },
                { label: 'Daśavarga', width: 17, align: 'right' },
                { label: 'Ṣoḍaśavarga', width: 17, align: 'right' },
                { label: 'Rating', width: 10, align: 'right' },
                { label: 'Band', width: 15 },
                { label: 'Grade', width: 12 },
              ]}
              rows={(Array.isArray(vimshopaka) ? vimshopaka : []).map((v: any) => {
                const f = (n: any) => (typeof n === 'number' ? n.toFixed(2) : '—');
                return [
                  v.planetName || GRAHA[v.planet]?.name || v.planet || '—',
                  f(v.shadvargaScore),
                  f(v.saptavargaScore),
                  f(v.dashavargaScore),
                  f(v.shodashavargaScore),
                  typeof v.percentageRating === 'number' ? `${v.percentageRating}` : '—',
                  v.band || '—',
                  v.namedGrade || '—',
                ];
              })}
            />
          </>
        )}
      </Page>

      {/* ------------------------------------------------ yogas */}
      {formedYogas.length > 0 && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="Yogas" identity={identity} />
          <ChapterTitle num={10}>Yogas</ChapterTitle>
          <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
            {formedYogas.length} classical combinations detected. Each carries its source and
            verse in the workspace; only the formed ones are listed here. A name marked * is
            flagged by the engine as an unverified reading rather than a settled rule.
          </Text>
          <Table
            cols={[
              { label: 'Yoga', width: 34 },
              { label: 'Source', width: 24 },
              { label: 'Verse', width: 20 },
              { label: 'Strength', width: 22 },
            ]}
            rows={formedYogas.map((y: any) => [
              `${y.name || y.id || '—'}${y.isUnverified ? ' *' : ''}`,
              y.sourceText || '—',
              y.chapterAndVerse || '—',
              y.strengthRating || y.strength || '—',
            ])}
          />
        </Page>
      )}

      {/* ------------------------------------------------ dasha systems */}
      {extended && Object.keys(extended).length > 0 && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="Daśā Systems" identity={identity} />
          <ChapterTitle num={11}>Daśā Systems</ChapterTitle>
          <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
            Sixteen systems, each with the period running at the date of this report. A system
            that does not apply to this chart is marked ineligible rather than omitted.
          </Text>
          <Table
            cols={[
              { label: 'System', width: 30 },
              { label: 'Cycle', width: 12, align: 'right' },
              { label: 'Eligibility', width: 20 },
              { label: 'Current period', width: 38 },
            ]}
            rows={Object.entries(extended).map(([id, r]: any) => [
              r.system?.name || id,
              r.system?.cycleYears ? `${r.system.cycleYears}y` : '—',
              r.eligibility?.status || 'universal',
              r.currentPeriod?.majorPeriod?.name || '—',
            ])}
          />

          {tree.length > 0 && (
            <>
              <SubTitle>Viṃśottarī — how a life divides</SubTitle>
              <Timeline
                segments={tree.map((n: any) => ({
                  label: (n.lordName || n.name || '').split(' ')[0],
                  weight: Number(n.durationYears ?? 0),
                }))}
              />
              <Text style={{ fontSize: 6.8, color: MUTED }}>
                Each segment is one mahādaśā, its width proportional to its length in years.
              </Text>
            </>
          )}
        </Page>
      )}

      {/* ------------------------------------------------ drishti & sudarshana */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Dṛṣṭi & Sudarśana" identity={identity} />
        <ChapterTitle num={12}>Dṛṣṭi &amp; Sudarśana</ChapterTitle>

        <SubTitle>Graha Dṛṣṭi — which houses each graha aspects</SubTitle>
        <Table
          cols={[
            { label: 'Graha', width: 16 },
            ...Array.from({ length: 12 }, (_, i) => ({
              label: String(i + 1), width: 7, align: 'center' as const,
            })),
          ]}
          rows={PLANETS.map((id) => {
            const p: any = (chart.planets as any)[id];
            const houses: number[] = p?.aspectsToHouses ?? [];
            return [
              GRAHA[id]?.name || id,
              // U+25CF and U+00B7 are not in Noto Serif and render as bars.
              // The bullet U+2022 is, and reads clearly at this size.
              ...Array.from({ length: 12 }, (_, i) =>
                houses.includes(i + 1) ? '•' : ''),
            ];
          })}
        />
        <Text style={{ fontSize: 6.8, color: MUTED, marginTop: 3 }}>
          Whole-sign dṛṣṭi. Columns are houses numbered from the lagna; a bullet marks an aspect.
        </Text>

        {sudarshana && sudarshana.rings && (
          <>
            <SubTitle>Sudarśana Cakra — the three rings</SubTitle>
            <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 6 }}>
              {`Year ${sudarshana.dasha?.yearOfLife} of life activates house ${sudarshana.dasha?.house} in all three rings (BPHS 74.21–22).`}
            </Text>
            <Table
              cols={[
                { label: 'House', width: 10, align: 'center' },
                { label: 'From Lagna', width: 30 },
                { label: 'From Candra', width: 30 },
                { label: 'From Sūrya', width: 30 },
              ]}
              rows={Array.from({ length: 12 }, (_, i) => {
                const cell = (ref: string) => {
                  const ring = sudarshana.rings.find((r: any) => r.reference === ref);
                  const h = ring?.houses?.[i];
                  if (!h) return '—';
                  const names = (h.planets || []).map(
                    (x: string) => GRAHA[x]?.short || x).join(' ');
                  return `${RASHI[(h.rashi || 1) - 1]}${names ? '  ·  ' + names : ''}`;
                };
                return [String(i + 1), cell('lagna'), cell('moon'), cell('sun')];
              })}
            />
          </>
        )}
      </Page>

      {/* ------------------------------------------------ samhita: eclipses */}
      {eclipses.length > 0 && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="Saṃhitā — Grahaṇa" identity={identity} />
          <ChapterTitle num={13}>Saṃhitā — Grahaṇa</ChapterTitle>
          <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
            Eclipses across the decade from the birth year, found by bisecting the Sun–Moon
            elongation and testing the Moon’s ecliptic latitude at each syzygy. Dates are local
            to the birth place.
          </Text>
          {doubleTransit?.houses?.length > 0 && (
            <>
              <SubTitle>Jupiter–Saturn Double Transit</SubTitle>
              <Text style={{ fontSize: 7.2, color: MUTED, marginBottom: 5 }}>
                {`As of ${doubleTransit.transitDateStr}. A house is doubly activated when transiting Jupiter ` +
                 `(5th, 7th, 9th from itself) and transiting Saturn (3rd, 7th, 10th) both reach it.`}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {doubleTransit.houses.filter((h: any) => h.active).map((h: any) => (
                  <Text key={h.house} style={{ fontSize: 8, color: ACCENT, marginRight: 12 }}>
                    {`House ${h.house} — ${h.detail}`}
                  </Text>
                ))}
                {doubleTransit.activeHouses.length === 0 && (
                  <Text style={{ fontSize: 8, color: MUTED }}>No house carries a double transit today.</Text>
                )}
              </View>
            </>
          )}

          {argalaList.length > 0 && (
            <>
              <SubTitle>Jaimini Argalā &amp; Virodhārgalā</SubTitle>
              <Table
                cols={[
                  { label: 'Reference', width: 22 },
                  { label: 'Argala', width: 26 },
                  { label: 'Obstruction', width: 26 },
                  { label: 'Status', width: 26 },
                ]}
                rows={argalaList.map((a: any) => [
                  `${a.argalaType} — house ${a.houseFromLagna}`,
                  (a.argalaPlanets || []).length ? a.argalaPlanets.map((x: string) => GRAHA[x]?.short || x).join(' ') : '—',
                  `${a.virodhaHouse}: ${(a.virodhaPlanets || []).map((x: string) => GRAHA[x]?.short || x).join(' ') || '—'}`,
                  a.status,
                ])}
              />
            </>
          )}

          <Table
            cols={[
              { label: 'Type', width: 12 },
              { label: 'Moment', width: 30 },
              { label: 'Moon latitude', width: 18, align: 'right' },
              { label: 'Depth', width: 14, align: 'right' },
              { label: 'Here', width: 26 },
            ]}
            rows={eclipses.map((e: any) => [
              e.kind === 'solar' ? 'Solar' : 'Lunar',
              e.label,
              `${e.moonLatitude.toFixed(2)}° / ${e.limit}°`,
              `${(e.depth * 100).toFixed(0)}%`,
              e.aboveHorizon ? 'Above horizon' : 'Below horizon',
            ])}
          />
        </Page>
      )}

      {/* ------------------------------------------------ KP layer */}
      {kpRuling && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="KP Layer" identity={identity} />
          <ChapterTitle num={14}>KP Layer</ChapterTitle>
          <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
            Krishnamurti Paddhati reads Placidus cusps and nakṣatra sub-division. It is a separate
            framework, kept here on its own terms rather than mixed into the Parāśarī judgements.
          </Text>

          <SubTitle>Ruling Planets of the Moment</SubTitle>
          <Table
            cols={[{ label: 'Role', width: 55 }, { label: 'Graha', width: 45 }]}
            rows={kpRuling.planets.map((p: any) => [p.role, p.planetName])}
          />

          {kpPromises.length > 0 && (
            <>
              <SubTitle>Sub-lord Signification by Matter</SubTitle>
              <Table
                cols={[
                  { label: 'Matter', width: 20 },
                  { label: 'Cusp', width: 8, align: 'center' },
                  { label: 'Sub lord', width: 18 },
                  { label: 'Signifies', width: 26 },
                  { label: 'Matter houses held', width: 28 },
                ]}
                rows={kpPromises.map((p: any) => [
                  p.label,
                  String(p.house),
                  p.subLordName,
                  p.signifies.join(', '),
                  p.hitsMatter.length ? p.hitsMatter.join(', ') : '—',
                ])}
              />
            </>
          )}
        </Page>
      )}

      {/* ------------------------------------------------ gochara */}
      {gochar && (
        <Page size="A4" style={S.page} wrap>
          <RunningHead chapter="Gochara" identity={identity} />
          <ChapterTitle num={15}>Gochara</ChapterTitle>
          <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 8 }}>
            {`Transits as of ${gochar.transitDateStr}, read from the natal Moon as Indian practice does. ` +
             `A transit is the trigger, never the promise — it is judged against the running daśā and the natal strength.`}
          </Text>

          <SubTitle>Current Transits</SubTitle>
          <Table
            cols={[
              { label: 'Graha', width: 16 },
              { label: 'Rāśi', width: 20 },
              { label: 'From Moon', width: 12, align: 'center' },
              { label: 'From Lagna', width: 13, align: 'center' },
              { label: 'Favourable', width: 13, align: 'center' },
              { label: 'Vedha', width: 26 },
            ]}
            rows={(gochar.planets || []).map((p: any) => [
              GRAHA[p.id]?.name || p.id,
              p.transitRashiName,
              String(p.houseFromNatalMoon),
              String(p.houseFromNatalLagna),
              p.isBeneficTransitFromMoon ? 'yes' : 'no',
              p.hasVedhaObstruction
                ? `obstructed from house ${p.vedhaHouse}`
                : '—',
            ])}
          />

          <SubTitle>Sāḍhe Sātī</SubTitle>
          <Text style={{ fontSize: 7.6, color: INK, marginBottom: 6 }}>
            {gochar.sadeSati?.isActive
              ? `Active — ${gochar.sadeSati.phase}. Saturn transits the ${gochar.sadeSati.saturnNatalHouseFromMoon}th from the natal Moon.`
              : `Not active. Saturn transits the ${gochar.sadeSati?.saturnNatalHouseFromMoon}th from the natal Moon.`}
          </Text>

        </Page>
      )}

      {/* ------------------------------------------------ relationships & attributes */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Relationships & Attributes" identity={identity} />
        <ChapterTitle num={16}>Relationships &amp; Attributes</ChapterTitle>

        {dispositorRelations.length > 0 && (
          <>
            <SubTitle>Each Graha and the Lord of its Sign</SubTitle>
            <Table
              cols={[
                { label: 'Graha', width: 18 },
                { label: 'Rāśi', width: 22 },
                { label: 'Dispositor', width: 20 },
                { label: 'Natural', width: 13 },
                { label: 'Temporal', width: 13 },
                { label: 'Pañcadhā', width: 14 },
              ]}
              rows={dispositorRelations.map((d: any) => [
                GRAHA[d.planet]?.name || d.planet,
                d.rashiName,
                GRAHA[d.dispositor]?.name || d.dispositor,
                d.natural,
                d.temporal === 'friend' ? 'Friend' : 'Enemy',
                d.compound,
              ])}
            />
          </>
        )}

        {relationshipSummary && (
          <>
            <SubTitle>Pañcadhā Maitrī — Chart Summary</SubTitle>
            <Text style={{ fontSize: 7.6, color: MUTED, marginBottom: 6 }}>
              {`${relationshipSummary.adhiMitra} great friendships, ${relationshipSummary.mitra} friendships, ` +
               `${relationshipSummary.sama} neutral, ${relationshipSummary.shatru} enmities and ` +
               `${relationshipSummary.adhiShatru} great enmities across the nine grahas.`}
            </Text>
          </>
        )}

        {natalAttributes && (
          <>
            <SubTitle>Favourable Attributes</SubTitle>
            <KV rows={[
              ['Janma Graha', `${natalAttributes.janmaGrahaName} (lord of ${natalAttributes.nakshatraName})`],
              ['Number', `${natalAttributes.luckyNumber}  ·  with ${natalAttributes.companionNumbers.join(' and ')}`],
              ['Colour', natalAttributes.luckyColour],
              ['Day', natalAttributes.luckyDay],
              ['Metal', natalAttributes.luckyMetal],
              ['Gem', natalAttributes.gemstone],
              ['Deity', natalAttributes.deity],
              ['Direction', natalAttributes.direction],
            ]} />
            <Text style={{ fontSize: 6.8, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>
              {clean(natalAttributes.note)}
            </Text>
          </>
        )}

        {((chart.bhavas as any[]) || []).length > 0 && (
          <>
            <SubTitle>Bhāva Spaṣṭa</SubTitle>
            <Table
              cols={[
                { label: 'Bhāva', width: 10, align: 'center' },
                { label: 'Ādi', width: 22, align: 'right' },
                { label: 'Madhya', width: 24, align: 'right' },
                { label: 'Anta', width: 22, align: 'right' },
                { label: 'Lord', width: 22 },
              ]}
              rows={((chart.bhavas as any[]) || []).map((h: any) => {
                const f = (n: any) => (typeof n === 'number' ? `${n.toFixed(2)}°` : '—');
                return [
                  String(h.houseNumber ?? h.house ?? '—'),
                  f(h.aadiDegree ?? h.startDegree),
                  f(h.madhyaDegree ?? h.midDegree),
                  f(h.antaDegree ?? h.endDegree),
                  GRAHA[String(h.rashiLord || h.lord || '').toLowerCase()]?.name || '—',
                ];
              })}
            />
          </>
        )}
      </Page>

      {/* ------------------------------------------------ doshas / jaimini */}
      <Page size="A4" style={S.page} wrap>
        <RunningHead chapter="Doṣas & Jaimini" identity={identity} />
        <ChapterTitle num={17}>Doṣas, Jaimini &amp; Sphuṭas</ChapterTitle>
        {((chart as any).doshas?.evaluatedDoshas || []).length > 0 && (
          <>
            <SubTitle>Doṣas</SubTitle>
            <Text style={{ fontSize: 7.4, color: MUTED, marginBottom: 6 }}>
              {(() => {
                const all = (chart as any).doshas.evaluatedDoshas as any[];
                const formed = all.filter((d) => d.formationStatus !== 'Not Formed');
                return `${formed.length} of ${all.length} doṣas evaluated are present. Absent ones are omitted.`;
              })()}
            </Text>
            <Table
              cols={[
                { label: 'Doṣa', width: 34 },
                { label: 'Status', width: 18 },
                { label: 'Severity', width: 14 },
                { label: 'Source', width: 34 },
              ]}
              rows={(chart as any).doshas.evaluatedDoshas
                .filter((d: any) => d.formationStatus !== 'Not Formed')
                .map((d: any) => [
                  d.name,
                  d.formationStatus,
                  d.severity,
                  // The checklist asks that every result show the rule behind it.
                  d.primarySource?.verseOrShloka || d.primarySource?.chapter || '—',
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
                GRAHA[String(k.planetName || '').toLowerCase()]?.name || k.planetName,
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
