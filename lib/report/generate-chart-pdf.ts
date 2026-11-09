/**
 * Gaṇaka — full chart report as a real PDF.
 *
 * The old "Save as PDF" button called window.print(), which opened the browser's
 * preview and left the user to find the save button themselves. This builds an
 * actual multi-page A4 document instead: birth data, every divisional chart,
 * aṣṭakavarga, the complete Viṃśottarī hierarchy and śaḍbala, then hands the
 * file straight to the browser as a download.
 *
 * Everything is drawn with jsPDF primitives, so the charts stay vector and stay
 * sharp at any zoom.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateAvakahadaChakra } from '@/lib/jyotisha/avakahada';
type JyotishaChart = any;

const PAGE = { w: 210, h: 297 };
const M = 13;
const CW = PAGE.w - M * 2;

const INK = '#1B1B1F';
const MUTED = '#7A7267';
const RULE = '#E0D8C8';
const ACCENT = '#8C2D19';
const PAPER = '#FDFBF6';
const KENDRA_TINT = '#F7EFDF';
const HEAD_BAND = '#F5EEE0';

/** Graha colours, so the charts read at a glance instead of as grey text. */
const GRAHA_INK: Record<string, string> = {
  sun: '#B45309', moon: '#3F4A5A', mars: '#B91C1C', mercury: '#15803D',
  jupiter: '#A16207', venus: '#7C3AED', saturn: '#1E3A8A',
  rahu: '#6B21A8', ketu: '#0F766E',
};

/** PDF base fonts are WinAnsi, so IAST diacritics must be folded to ASCII. */
const A = (s: unknown): string =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E\xB0]/g, '');

const RASHI = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const GRAHA_SHORT: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju',
  venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};

interface Ctx {
  doc: jsPDF;
  y: number;
  page: number;
  title: string;
  toc: Array<{ title: string; page: number }>;
  identity?: string;
}

function header(ctx: Ctx, section: string) {
  const { doc } = ctx;
  doc.setFillColor(PAPER);
  doc.rect(0, 0, PAGE.w, 18, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(ACCENT);
  doc.text('GANAKA', M, 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(MUTED);
  if (ctx.identity) doc.text(A(ctx.identity), M, 12.6);

  doc.setFontSize(6.6);
  doc.setTextColor(MUTED);
  doc.text(A(section).toUpperCase(), PAGE.w - M, 12.6, { align: 'right' });

  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.7);
  doc.line(M, 15.6, PAGE.w - M, 15.6);
  doc.setDrawColor(RULE);
  doc.setLineWidth(0.3);
  doc.line(M, 17, PAGE.w - M, 17);

  ctx.y = 27;
}

function newPage(ctx: Ctx, section: string) {
  ctx.doc.addPage();
  ctx.page += 1;
  header(ctx, section);
}

function need(ctx: Ctx, height: number, section: string) {
  if (ctx.y + height > PAGE.h - M) newPage(ctx, section);
}

function sectionTitle(ctx: Ctx, text: string) {
  need(ctx, 20, ctx.title);
  const { doc } = ctx;
  doc.setFillColor(ACCENT);
  doc.rect(M, ctx.y - 3.4, 1.6, 5.2, 'F');
  doc.setFont('times', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(INK);
  doc.text(A(text), M + 5, ctx.y);
  doc.setDrawColor(RULE);
  doc.setLineWidth(0.3);
  doc.line(M, ctx.y + 3, PAGE.w - M, ctx.y + 3);
  ctx.y += 10;
}

function kvGrid(
  ctx: Ctx,
  rows: Array<[string, string]>,
  cols = 2
) {
  const { doc } = ctx;
  const colW = CW / cols;
  const rowH = 9.5;
  rows.forEach(([k, v], i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    if (c === 0) need(ctx, rowH, ctx.title);
    const x = M + c * colW;
    const y = ctx.y + r * rowH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(MUTED);
    doc.text(A(k).toUpperCase(), x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(INK);
    doc.text(A(v), x, y + 4.2);
  });
  ctx.y += Math.ceil(rows.length / cols) * rowH + 3;
}

/** North Indian diamond, drawn as vector so it stays crisp at any zoom. */
function drawDiamond(
  doc: jsPDF,
  varga: any,
  x0: number,
  y0: number,
  size: number,
  title: string,
  note?: string
) {
  const s = size;
  const mid = s / 2;

  // ---- card ----
  doc.setFillColor('#FFFFFF');
  doc.setDrawColor('#E4DCCC');
  doc.setLineWidth(0.3);
  doc.rect(x0 - 3, y0 - 9.5, s + 6, s + 14.5, 'FD');
  doc.setFillColor(PAPER);
  doc.rect(x0, y0, s, s, 'F');

  // No polygon fills: jsPDF's doc.lines() shares the current path, and filling
  // through it has twice thrown a giant diamond across the page. Kendras are
  // emphasised with line weight instead, which cannot misfire.

  // ---- structure. Every segment is its own doc.line(): doc.lines() appends to
  // whatever path is still open, which is what threw giant stray strokes across
  // the page in the first version. ----
  doc.setDrawColor('#4A4238');
  doc.setLineWidth(0.45);
  doc.rect(x0, y0, s, s, 'S');
  doc.setLineWidth(0.22);
  doc.line(x0, y0, x0 + s, y0 + s);
  doc.line(x0 + s, y0, x0, y0 + s);
  doc.setLineWidth(0.55);
  doc.line(x0 + mid, y0, x0 + s, y0 + mid);
  doc.line(x0 + s, y0 + mid, x0 + mid, y0 + s);
  doc.line(x0 + mid, y0 + s, x0, y0 + mid);
  doc.line(x0, y0 + mid, x0 + mid, y0);
  doc.setLineWidth(0.22);

  // ---- labels ----
  // Sign number sits just inside the outer edge of its own cell; planets stack
  // at the cell centre, so the two never share a spot.
  const signAt: Array<[number, number]> = [
    [0.5, 0.13], [0.25, 0.06], [0.06, 0.25], [0.13, 0.5], [0.06, 0.75], [0.25, 0.94],
    [0.5, 0.87], [0.75, 0.94], [0.94, 0.75], [0.87, 0.5], [0.94, 0.25], [0.75, 0.06],
  ];
  const centreAt: Array<[number, number]> = [
    [0.5, 0.31], [0.25, 0.16], [0.16, 0.25], [0.31, 0.5], [0.16, 0.75], [0.25, 0.84],
    [0.5, 0.69], [0.75, 0.84], [0.84, 0.75], [0.69, 0.5], [0.84, 0.25], [0.75, 0.16],
  ];

  const byHouse: Record<number, Array<{ id: string; short: string }>> = {};
  for (const [id, pl] of Object.entries<any>(varga.planets || {})) {
    const short = GRAHA_SHORT[id] || id.slice(0, 2);
    (byHouse[pl.house] ||= []).push({ id, short });
  }

  const big = s > 70;
  for (let h = 1; h <= 12; h++) {
    const rashi = ((varga.lagnaRashi - 1 + h - 1) % 12) + 1;
    const [sx, sy] = signAt[h - 1];
    doc.setFont('times', 'bold');
    doc.setFontSize(big ? 8.5 : 6.4);
    doc.setTextColor(ACCENT);
    doc.text(String(rashi), x0 + sx * s, y0 + sy * s, { align: 'center' });

    const list = byHouse[h] || [];
    if (!list.length) continue;
    const [cx, cy] = centreAt[h - 1];
    const fs = list.length > 4 ? (big ? 6.4 : 4.8) : list.length > 2 ? (big ? 7.6 : 5.8) : big ? 9 : 6.6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    const step = fs * 0.40;
    const startY = y0 + cy * s - ((list.length - 1) * step) / 2;
    list.forEach((pl, i) => {
      doc.setTextColor(GRAHA_INK[pl.id] || INK);
      doc.text(pl.short, x0 + cx * s, startY + i * step, { align: 'center' });
    });
  }

  // ---- title ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(big ? 7.4 : 5.8);
  doc.setTextColor(INK);
  doc.text(A(title), x0 - 2.5, y0 - 5.4);
  if (note) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(big ? 6 : 5.2);
    doc.setTextColor(MUTED);
    // right-aligned at the card's inner edge, so it can never spill past it
    doc.text(A(note), x0 + s - 1, y0 - 5.4, { align: 'right' });
  }
}


/** A nested-diamond motif, used on the cover and as a chapter ornament. */
function ornament(doc: jsPDF, cx: number, cy: number, r: number, colour = ACCENT) {
  doc.setDrawColor(colour);
  doc.setLineWidth(0.5);
  doc.line(cx, cy - r, cx + r, cy);
  doc.line(cx + r, cy, cx, cy + r);
  doc.line(cx, cy + r, cx - r, cy);
  doc.line(cx - r, cy, cx, cy - r);
  doc.setLineWidth(0.3);
  const r2 = r * 0.62;
  doc.line(cx, cy - r2, cx + r2, cy);
  doc.line(cx + r2, cy, cx, cy + r2);
  doc.line(cx, cy + r2, cx - r2, cy);
  doc.line(cx - r2, cy, cx, cy - r2);
  const r3 = r * 0.28;
  doc.line(cx, cy - r3, cx + r3, cy);
  doc.line(cx + r3, cy, cx, cy + r3);
  doc.line(cx, cy + r3, cx - r3, cy);
  doc.line(cx - r3, cy, cx, cy - r3);
}

function drawCover(doc: jsPDF, chart: JyotishaChart, personName?: string) {
  const bd = chart.meta.birthDetails;
  const pad2 = (n: number) => String(n).padStart(2, '0');

  doc.setFillColor('#FDFBF6');
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F');

  // top band
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1.4);
  doc.line(M, 28, PAGE.w - M, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(ACCENT);
  doc.text('G A N A K A', M, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(MUTED);
  doc.text('CLASSICAL JYOTISA ENGINE', PAGE.w - M, 22, { align: 'right' });

  // title block
  doc.setFont('times', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(INK);
  doc.text('Jyotisa', M, 74);
  doc.setFontSize(34);
  doc.text('Birth Chart', M, 96);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text('C O M P L E T E   R E P O R T', M, 108);

  if (personName) {
    doc.setFont('times', 'italic');
    doc.setFontSize(17);
    doc.setTextColor(ACCENT);
    doc.text(A(personName), M, 124);
  }

  // birth particulars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(INK);
  doc.text(
    `${pad2(bd.day)}-${pad2(bd.month)}-${bd.year}   ·   ${pad2(bd.hour)}:${pad2(bd.minute)}:${pad2(bd.second)}`,
    M, 140
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(INK);
  doc.text(A(bd.locationName || '-'), M, 148);
  doc.setFontSize(7.8);
  doc.setTextColor(MUTED);
  doc.text(
    A(`Lat ${Math.abs(bd.latitude).toFixed(4)}${bd.latitude >= 0 ? ' N' : ' S'}   ·   Lon ${Math.abs(bd.longitude).toFixed(4)}${bd.longitude >= 0 ? ' E' : ' W'}   ·   UTC${bd.timezoneOffsetHours >= 0 ? '+' : ''}${bd.timezoneOffsetHours}`),
    M, 155
  );

  // ornament, right of the title block
  ornament(doc, 158, 92, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(ACCENT);
  doc.text('LAGNA', 158, 126, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(INK);
  doc.text(`${RASHI[chart.lagna.rashiNumber - 1]}`, 158, 132, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MUTED);
  doc.text(A(chart.lagna.degreeStr), 158, 137, { align: 'center' });

  // bottom rule + imprint
  doc.setDrawColor(RULE);
  doc.setLineWidth(0.4);
  doc.line(M, 252, PAGE.w - M, 252);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(MUTED);
  doc.text(A(`Ayanamsa ${chart.meta.ayanamshaType} ${chart.meta.ayanamshaFormatted}`), M, 259);
  doc.text(A(chart.meta.houseSystem.replace('_', ' ')), M, 264);
  doc.text(A(chart.meta.engineVersion), PAGE.w - M, 259, { align: 'right' });
  doc.text(new Date().toISOString().slice(0, 10), PAGE.w - M, 264, { align: 'right' });
}

function drawContents(doc: jsPDF, entries: Array<{ title: string; page: number }>) {
  doc.setFillColor('#FFFFFF');
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F');
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1);
  doc.line(M, 30, PAGE.w - M, 30);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(INK);
  doc.text('Contents', M, 24);

  let y = 46;
  entries.forEach((e, i) => {
    if (y > PAGE.h - 24) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(ACCENT);
    doc.text(String(i + 1).padStart(2, '0'), M, y);

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text(A(e.title), M + 10, y);

    const titleW = doc.getTextWidth(A(e.title));
    const numStr = String(e.page);
    const numW = doc.getTextWidth(numStr);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(numStr, PAGE.w - M, y, { align: 'right' });

    // dot leader
    doc.setDrawColor('#D8D0C2');
    doc.setLineWidth(0.3);
    const from = M + 10 + titleW + 3;
    const to = PAGE.w - M - numW - 3;
    for (let x = from; x < to; x += 3) doc.circle(x, y - 1, 0.25, 'F');

    y += 11;
  });
}

export function buildChartPdf(chart: JyotishaChart, personName?: string): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const bd0 = chart.meta.birthDetails;
  const pad0 = (n: number) => String(n).padStart(2, '0');
  const identity = [
    personName ? A(personName) : null,
    `${pad0(bd0.day)}-${pad0(bd0.month)}-${bd0.year}`,
    A(bd0.locationName || ''),
  ].filter(Boolean).join('  ·  ');

  const ctx: Ctx = { doc, y: 24, page: 1, title: 'Chart Report', toc: [], identity };
  const bd = chart.meta.birthDetails;
  const pad = (n: number) => String(n).padStart(2, '0');

  drawCover(doc, chart, personName);
  doc.addPage();
  ctx.page = 2;
  header(ctx, 'Birth Data');
  ctx.toc.push({ title: 'Birth Data & Panchanga', page: ctx.page });

  // ---------------- Page 2: identity + birth data + panchanga ----------------
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(INK);
  doc.text('Jyotisa Birth Chart Report', M, 30);
  if (personName) {
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(ACCENT);
    doc.text(A(personName), M, 37);
  }

  ctx.y = 44;
  sectionTitle(ctx, 'Birth Data');
  kvGrid(ctx, [
    ['Date', `${bd.day}-${pad(bd.month)}-${bd.year}`],
    ['Time', `${pad(bd.hour)}:${pad(bd.minute)}:${pad(bd.second)}`],
    ['Place', bd.locationName || '-'],
    ['Timezone', `UTC${bd.timezoneOffsetHours >= 0 ? '+' : ''}${bd.timezoneOffsetHours}`],
    ['Latitude', `${Math.abs(bd.latitude).toFixed(4)}${bd.latitude >= 0 ? ' N' : ' S'}`],
    ['Longitude', `${Math.abs(bd.longitude).toFixed(4)}${bd.longitude >= 0 ? ' E' : ' W'}`],
    ['Ayanamsa', `${chart.meta.ayanamshaType} (${chart.meta.ayanamshaFormatted})`],
    ['House System', chart.meta.houseSystem.replace('_', ' ')],
    ['Julian Day', chart.meta.julianDay.toFixed(5)],
    ['Engine', chart.meta.engineVersion],
  ]);

  sectionTitle(ctx, 'Ascendant');
  kvGrid(ctx, [
    ['Lagna', `${RASHI[chart.lagna.rashiNumber - 1]} ${chart.lagna.degreeStr}`],
    ['Nakshatra', `${chart.lagna.nakshatraName} pada ${chart.lagna.pada}`],
  ]);

  const pn: any = chart.panchanga;
  sectionTitle(ctx, 'Panchanga');
  kvGrid(ctx, [
    ['Tithi', pn?.tithi ? `${pn.tithi.name} (${pn.tithi.number})` : '-'],
    ['Vara', pn?.vara?.name || '-'],
    ['Nakshatra', pn?.nakshatra ? `${pn.nakshatra.name} (${pn.nakshatra.number})` : '-'],
    ['Yoga', pn?.yoga?.name || '-'],
    ['Karana', pn?.karana?.name || '-'],
    ['Sunrise', pn?.sunTimes?.sunrise || '-'],
    ['Sunset', pn?.sunTimes?.sunset || '-'],
    ['Paksha', pn?.tithi?.paksha || '-'],
  ]);

  // ---------------- Avakahada Cakra ----------------
  let av: any = null;
  try {
    av = calculateAvakahadaChakra(chart);
  } catch (err) {
    // Never swallow this quietly: a missing page is worse than a logged error.
    console.warn('[report] Avakahada Cakra could not be built', err);
  }

  if (av) {
    newPage(ctx, 'Avakahada Cakra');
    ctx.toc.push({ title: 'Avakahada Cakra', page: ctx.page });
    sectionTitle(ctx, 'Avakahada Cakra - Birth Matrix');

    kvGrid(ctx, [
      ['Lagna', `${av.lagna.sanskritName} (${av.lagna.name}) ${av.lagna.degreeFormatted}`],
      ['Lagna Lord', av.lagna.lordName],
      ['Rashi (Moon)', `${av.rashi.name} ${av.rashi.degreeInRashi}`],
      ['Rashi Lord', av.rashi.lordName],
      ['Sun Sign', `${av.sunSign.name} ${av.sunSign.degreeInRashi}`],
      ['Nakshatra', `${av.nakshatra.name} pada ${av.nakshatra.pada}`],
      ['Nakshatra Lord', av.nakshatra.lordName],
      ['Pada Lord', av.nakshatra.padaLordName],
      ['Deity', av.nakshatra.deity],
      ['Namakshara', av.namakshara.iast || av.namakshara.fullDisplay],
    ]);

    sectionTitle(ctx, 'Classical Classifications');
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Attribute', 'Value']],
      body: [
        ['Paya', `${A(av.paya.type)} - ${A(av.paya.metal)}`],
        ['Varna', A(av.varna.type)],
        ['Vashya', A(av.vashya.type)],
        ['Yoni', `${A(av.yoni.animal)} (${A(av.yoni.gender)})`],
        ['Gana', A(av.gana.type)],
        ['Nadi', A(av.nadi.type)],
        ['Rajju', A(av.rajju.type)],
        ['Tattva', A(av.tattva.type)],
        ['Vihaga', A(av.vihaga.bird)],
        ['Vedha', A(av.vedha?.pairText || av.vedha?.afflictingNakshatraName || '-')],
        ['Yunja', A(av.yunja.type)],
        ['Gotra', A(av.gotra.rishi)],
        ['Vriksha', A(av.vriksha.treeName)],
      ],
      styles: { fontSize: 7.6, cellPadding: 1.6, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7.2, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#FCFAF6' },
      columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;

    sectionTitle(ctx, 'Panchanga Limbs at Birth');
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Limb', 'Value']],
      body: [
        ['Tithi', `${A(av.panchanga.tithi.name)} (${av.panchanga.tithi.number}) - ${A(av.panchanga.tithi.paksha)}`],
        ['Vara', `${A(av.panchanga.vara.name)} - lord ${A(av.panchanga.vara.lordName)}`],
        ['Yoga', `${A(av.panchanga.yoga.name)} (${av.panchanga.yoga.number})`],
        ['Karana', `${A(av.panchanga.karana.name)} (${av.panchanga.karana.number})`],
        ['Ritu', A(av.panchanga.ritu.name)],
        ['Masa', `${A(av.panchanga.masa.amanta)} / ${A(av.panchanga.masa.solarMonth)}`],
        ['Samvatsara', `${A(av.panchanga.samvatsara.name)} (${av.panchanga.samvatsara.number})`],
      ],
      styles: { fontSize: 7.6, cellPadding: 1.6, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7.2, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#FCFAF6' },
      columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Page 2: planetary positions ----------------
  newPage(ctx, 'Planetary Positions');
  ctx.toc.push({ title: 'Planetary Positions', page: ctx.page });
  sectionTitle(ctx, 'Graha Positions');
  const planetIds = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['Graha', 'Rashi', 'Degree', 'Nakshatra', 'Pada', 'House', 'State', 'Dignity']],
    body: planetIds.map((id) => {
      const p: any = (chart.planets as any)[id];
      if (!p) return ['-', '-', '-', '-', '-', '-', '-', '-'];
      const state = [p.isRetrograde ? 'Retro' : '', p.isCombust ? 'Combust' : '']
        .filter(Boolean)
        .join(', ') || 'Direct';
      return [
        A(p.name), RASHI[p.rashiNumber - 1], p.degreeStr,
        A(p.nakshatraName), String(p.pada), String(p.house),
        state, A(p.dignity),
      ];
    }),
    styles: { font: 'helvetica', fontSize: 7.8, cellPadding: 2.4, textColor: INK, lineColor: RULE, lineWidth: 0.15 },
    headStyles: { fillColor: HEAD_BAND, textColor: INK, fontStyle: 'bold', fontSize: 7.2, lineWidth: 0 },
    alternateRowStyles: { fillColor: '#FBF8F1' },
    theme: 'plain',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  // ---------------- D1 chart + bhava table ----------------
  need(ctx, 100, ctx.title);
  sectionTitle(ctx, 'Lagna Kundali (D-1)');
  drawDiamond(doc, chart.vargas.D1, M + 3, ctx.y + 6, 76, 'D-1 Rasi', `Lagna ${RASHI[chart.vargas.D1.lagnaRashi - 1]}`);
  const bhavaX = M + 88;
  autoTable(doc, {
    startY: ctx.y + 2,
    margin: { left: bhavaX, right: M },
    head: [['H', 'Rashi', 'Lord']],
    body: (chart.bhavas || []).slice(0, 12).map((b: any) => [
      String(b.houseNumber), RASHI[b.rashiNumber - 1], A(b.rashiLord || ''),
    ]),
    styles: { fontSize: 6.8, cellPadding: 1.2, textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
    theme: 'plain',
  });
  ctx.y = Math.max(ctx.y + 90, (doc as any).lastAutoTable.finalY + 6);

  // ---------------- Divisional charts ----------------
  const vargaList = Object.values(chart.vargas || {}) as any[];
  const perPage = 2;
  for (let i = 0; i < vargaList.length; i += perPage) {
    newPage(ctx, 'Divisional Charts');
    if (i === 0) ctx.toc.push({ title: 'Divisional Charts', page: ctx.page });
    const chunk = vargaList.slice(i, i + perPage);
    sectionTitle(ctx, `Divisional Charts (${i + 1}-${i + chunk.length} of ${vargaList.length})`);
    // Two charts per page at 110mm - large enough to read comfortably and to
    // fill the sheet, instead of four cramped ones floating in white space.
    const box = 108;
    const colX = M + (CW - box) / 2;
    chunk.forEach((v, k) => {
      const row = k;
      const x = colX;
      const y = ctx.y + row * (box + 20) + 8;
      drawDiamond(doc, v, x, y, box, A(v.name || v.id), `Lagna ${RASHI[v.lagnaRashi - 1]}`);
    });
  }

  // ---------------- Ashtakavarga ----------------
  newPage(ctx, 'Ashtakavarga');
  ctx.toc.push({ title: 'Ashtakavarga', page: ctx.page });
  sectionTitle(ctx, 'Sarvashtakavarga (SAV)');
  const sav: number[] = (chart.ashtakavarga as any)?.sav?.bindusByRashi || [];
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['', ...RASHI]],
    body: [['Bindus', ...sav.map(String)]],
    styles: { fontSize: 7, cellPadding: 1.6, halign: 'center', textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
    theme: 'plain',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  sectionTitle(ctx, 'Bhinnashtakavarga (BAV)');
  const bavRows = planetIds.map((id) => {
    const t: any = (chart.ashtakavarga as any)?.bav?.[id];
    const arr = t?.bindusByRashi || t?.bindus || [];
    return [A(GRAHA_SHORT[id]), ...(Array.isArray(arr) ? arr.map(String) : RASHI.map(() => '-'))];
  });
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['', ...RASHI]],
    body: bavRows,
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center', textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
    theme: 'plain',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  // ---------------- Vimshottari ----------------
  const tree: any[] = (chart.vimshottari as any)?.tree || [];
  newPage(ctx, 'Vimshottari Dasha');
  ctx.toc.push({ title: 'Vimshottari Dasha', page: ctx.page });
  sectionTitle(ctx, 'Mahadasha');
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['Lord', 'Start', 'End', 'Years']],
    body: tree.map((d) => [A(d.lordName || d.lord), d.startDate, d.endDate, d.durationYears?.toFixed(2) ?? '-']),
    styles: { fontSize: 8, cellPadding: 1.8, textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7.6, fontStyle: 'bold' },
    theme: 'plain',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  sectionTitle(ctx, 'Antardasha');
  tree.forEach((md) => {
    const subs: any[] = md.subPeriods || [];
    if (!subs.length) return;
    need(ctx, 26 + subs.length * 5.2, 'Vimshottari Dasha');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(ACCENT);
    doc.text(A(`${md.lordName || md.lord} Mahadasha`), M, ctx.y);
    ctx.y += 2;
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Antardasha', 'Start', 'End']],
      body: subs.map((s) => [A(s.lordName || s.lord), s.startDate, s.endDate]),
      styles: { fontSize: 7.2, cellPadding: 1.3, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7, fontStyle: 'bold' },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 5;
  });

  // Pratyantardasha for the mahadasha running at birth
  const active = tree.find((d) => d.isBirthActive) || tree[0];
  if (active) {
    newPage(ctx, 'Vimshottari Dasha');
    sectionTitle(ctx, `Pratyantardasha - ${A(active.lordName || active.lord)} Mahadasha`);
    (active.subPeriods || []).forEach((ad: any) => {
      const subs: any[] = ad.subPeriods || [];
      if (!subs.length) return;
      need(ctx, 24 + subs.length * 5, 'Vimshottari Dasha');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(ACCENT);
      doc.text(A(`${ad.lordName || ad.lord} Antardasha`), M, ctx.y);
      ctx.y += 2;
      autoTable(doc, {
        startY: ctx.y,
        margin: { left: M, right: M },
        head: [['Pratyantardasha', 'Start', 'End']],
        body: subs.map((s) => [A(s.lordName || s.lord), s.startDate, s.endDate]),
        styles: { fontSize: 7, cellPadding: 1.2, textColor: INK },
        headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
        theme: 'plain',
      });
      ctx.y = (doc as any).lastAutoTable.finalY + 5;
    });
  }

  // ---------------- Shadbala ----------------
  newPage(ctx, 'Shadbala');
  ctx.toc.push({ title: 'Shadbala', page: ctx.page });
  sectionTitle(ctx, 'Shadbala (virupas)');
  const sb = (chart as any).shadbala || {};
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['Graha', 'Sthana', 'Kala', 'Dig', 'Chesta', 'Naisargika', 'Drig', 'Total', 'Rupas']],
    body: planetIds.slice(0, 7).map((id) => {
      const r: any = sb[id] || {};
      const f = (n: any) => (typeof n === 'number' ? n.toFixed(2) : '-');
      return [
        A(GRAHA_SHORT[id]), f(r.sthanaBala), f(r.kalaBala), f(r.digBala),
        f(r.chestaBala), f(r.naisargikaBala), f(r.drigBala),
        f(r.totalVirupas), f(r.totalVirupas != null ? r.totalVirupas / 60 : undefined),
      ];
    }),
    styles: { fontSize: 7.4, cellPadding: 1.5, halign: 'right', textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    theme: 'plain',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  // ---------------- Yogas / doshas ----------------
  const yogas: any[] = (chart as any).yogas || [];
  if (yogas.length) {
    sectionTitle(ctx, 'Yogas');
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Yoga', 'Category']],
      body: yogas.map((y) => [A(y.name), A(y.category || y.type || '-')]),
      styles: { fontSize: 7.4, cellPadding: 1.5, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7, fontStyle: 'bold' },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Doshas ----------------
  const evaluated: any[] = (chart as any).doshas?.evaluatedDoshas || [];
  if (evaluated.length) {
    newPage(ctx, 'Doshas');
    ctx.toc.push({ title: 'Doshas & Arista', page: ctx.page });
    sectionTitle(ctx, 'Doshas & Arista');
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Dosha', 'Category', 'Status', 'Severity']],
      body: evaluated.map((d) => [
        A(d.name), A(d.category), A(d.formationStatus), A(d.severity),
      ]),
      styles: { fontSize: 7, cellPadding: 1.3, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#FCFAF6' },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Jaimini ----------------
  const jm: any = (chart as any).jaimini || {};
  if (jm.charaKarakas?.length || jm.arudhaPadas?.length) {
    newPage(ctx, 'Jaimini');
    ctx.toc.push({ title: 'Jaimini & Sphutas', page: ctx.page });
    if (jm.charaKarakas?.length) {
      sectionTitle(ctx, 'Chara Karakas');
      autoTable(doc, {
        startY: ctx.y,
        margin: { left: M, right: M },
        head: [['Karaka', 'Graha', 'Degrees']],
        body: jm.charaKarakas.map((k: any) => [
          A(`${k.karakaKey} - ${k.karakaName}`), A(k.planetName),
          typeof k.degrees === 'number' ? k.degrees.toFixed(4) : '-',
        ]),
        styles: { fontSize: 7.4, cellPadding: 1.4, textColor: INK },
        headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7, fontStyle: 'bold' },
        theme: 'plain',
      });
      ctx.y = (doc as any).lastAutoTable.finalY + 8;
    }
    if (jm.arudhaPadas?.length) {
      sectionTitle(ctx, 'Arudha Padas');
      autoTable(doc, {
        startY: ctx.y,
        margin: { left: M, right: M },
        head: [['House', 'Pada', 'Rashi']],
        body: jm.arudhaPadas.map((a: any) => [
          String(a.house), A(a.name), RASHI[a.rashiNumber - 1] || '-',
        ]),
        styles: { fontSize: 7.4, cellPadding: 1.4, textColor: INK },
        headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7, fontStyle: 'bold' },
        theme: 'plain',
      });
      ctx.y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ---------------- Sphutas & special points ----------------
  const sp: any = (chart as any).specialPoints || {};
  const spKeys = ['gulika', 'mandi', 'dhooma', 'vyatipata', 'parivesha', 'indrachapa',
    'upaketu', 'bhavaLagna', 'horaLagna', 'ghatiLagna', 'shreeLagna', 'induLagna'];
  const spRows = spKeys
    .filter((k) => sp[k] && typeof sp[k].rashi === 'number')
    .map((k) => [k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      RASHI[sp[k].rashi - 1], sp[k].degreeStr || '-']);
  if (spRows.length) {
    sectionTitle(ctx, 'Sphutas & Upagrahas');
    autoTable(doc, {
      startY: ctx.y,
      margin: { left: M, right: M },
      head: [['Point', 'Rashi', 'Degree']],
      body: spRows,
      styles: { fontSize: 7.4, cellPadding: 1.4, textColor: INK },
      headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7, fontStyle: 'bold' },
      theme: 'plain',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Contents page (inserted at position 2) ----------------
  doc.insertPage(2);
  doc.setPage(2);
  // every recorded page number shifts by one once the contents page is in
  drawContents(doc, ctx.toc.map((t) => ({ title: t.title, page: t.page + 1 })));

  // ---------------- Footers ----------------
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    if (i === 1) continue; // cover carries its own imprint
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(MUTED);
    doc.setDrawColor(RULE);
    doc.setLineWidth(0.25);
    doc.line(M, PAGE.h - 10, PAGE.w - M, PAGE.h - 10);
    doc.text(
      A(`${chart.meta.engineVersion} | ayanamsa ${chart.meta.ayanamshaType} | generated ${new Date().toISOString().slice(0, 10)}`),
      M, PAGE.h - 6.5
    );
    doc.text(`${i} / ${total}`, PAGE.w - M, PAGE.h - 6.5, { align: 'right' });
  }

  return doc;
}

/** Suggested filename for the report. */
export function chartPdfFilename(chart: JyotishaChart, personName?: string): string {
  const safe = A(personName || chart.meta.birthDetails.locationName || 'chart')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'chart';
  const d = chart.meta.birthDetails;
  return `${safe}-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.pdf`;
}

/** Builds the report and hands it to the browser as a download. */
export function downloadChartPdf(chart: JyotishaChart, personName?: string) {
  const doc = buildChartPdf(chart, personName);
  doc.save(chartPdfFilename(chart, personName));
}
