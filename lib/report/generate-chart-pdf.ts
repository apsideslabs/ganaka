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
type JyotishaChart = any;

const PAGE = { w: 210, h: 297 };
const M = 13;
const CW = PAGE.w - M * 2;

const INK = '#1F2937';
const MUTED = '#6B7280';
const RULE = '#D6D3CD';
const ACCENT = '#8C2D19';

/** PDF base fonts are WinAnsi, so IAST diacritics must be folded to ASCII. */
const A = (s: unknown): string =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E]/g, '');

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
}

function header(ctx: Ctx, section: string) {
  const { doc } = ctx;
  doc.setFillColor('#FBF7EF');
  doc.rect(0, 0, PAGE.w, 16, 'F');
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.4);
  doc.line(0, 16, PAGE.w, 16);

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(ACCENT);
  doc.text('Ganaka', M, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(MUTED);
  doc.text(A(section), M + 17, 8);

  doc.setFontSize(7);
  doc.text(`Page ${ctx.page}`, PAGE.w - M, 8, { align: 'right' });
  ctx.y = 24;
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
  need(ctx, 16, ctx.title);
  const { doc } = ctx;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(INK);
  doc.text(A(text), M, ctx.y);
  doc.setDrawColor(RULE);
  doc.setLineWidth(0.3);
  doc.line(M, ctx.y + 1.8, PAGE.w - M, ctx.y + 1.8);
  ctx.y += 7;
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
  title: string
) {
  const s = size;
  doc.setDrawColor('#4A4238');
  doc.setLineWidth(0.35);
  doc.rect(x0, y0, s, s);
  doc.line(x0, y0, x0 + s, y0 + s);
  doc.line(x0 + s, y0, x0, y0 + s);
  doc.setLineWidth(0.45);
  doc.lines(
    [[s / 2, s / 2], [s / 2, -s / 2], [-s / 2, -s / 2], [-s / 2, s / 2]],
    x0 + s / 2, y0, [1, 1], 'S', false
  );

  // unit positions: sign label near the outer edge, planets at the cell centre
  const signAt: Array<[number, number]> = [
    [0.5, 0.11], [0.25, 0.05], [0.05, 0.25], [0.11, 0.5], [0.05, 0.75], [0.25, 0.95],
    [0.5, 0.89], [0.75, 0.95], [0.95, 0.75], [0.89, 0.5], [0.95, 0.25], [0.75, 0.05],
  ];
  const centreAt: Array<[number, number]> = [
    [0.5, 0.25], [0.25, 0.13], [0.13, 0.25], [0.25, 0.5], [0.13, 0.75], [0.25, 0.87],
    [0.5, 0.75], [0.75, 0.87], [0.87, 0.75], [0.75, 0.5], [0.87, 0.25], [0.75, 0.13],
  ];

  const byHouse: Record<number, string[]> = {};
  for (const [id, p] of Object.entries<any>(varga.planets || {})) {
    const short = GRAHA_SHORT[id] || id.slice(0, 2);
    (byHouse[p.house] ||= []).push(short);
  }

  for (let h = 1; h <= 12; h++) {
    const rashi = ((varga.lagnaRashi - 1 + h - 1) % 12) + 1;
    const [sx, sy] = signAt[h - 1];
    doc.setFont('times', 'bold');
    doc.setFontSize(size > 70 ? 7 : 5.6);
    doc.setTextColor(ACCENT);
    doc.text(String(rashi), x0 + sx * s, y0 + sy * s, { align: 'center' });

    const list = byHouse[h] || [];
    if (!list.length) continue;
    const [cx, cy] = centreAt[h - 1];
    doc.setFont('helvetica', 'bold');
    const fs = list.length > 4 ? 5 : list.length > 2 ? 6 : 7;
    doc.setFontSize(fs);
    doc.setTextColor(INK);
    const step = fs * 0.42;
    const startY = y0 + cy * s - ((list.length - 1) * step) / 2;
    list.forEach((p, i) => {
      doc.text(p, x0 + cx * s, startY + i * step, { align: 'center' });
    });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size > 70 ? 7.5 : 6);
  doc.setTextColor(INK);
  doc.text(A(title), x0, y0 - 2.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.setTextColor(MUTED);
  doc.text(`Lagna: ${RASHI[varga.lagnaRashi - 1]}`, x0 + s, y0 - 2.2, { align: 'right' });
}

export function buildChartPdf(chart: JyotishaChart, personName?: string): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const ctx: Ctx = { doc, y: 24, page: 1, title: 'Chart Report' };
  const bd = chart.meta.birthDetails;
  const pad = (n: number) => String(n).padStart(2, '0');

  header(ctx, 'Birth Chart Report');

  // ---------------- Page 1: identity + birth data + panchanga ----------------
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

  // ---------------- Page 2: planetary positions ----------------
  newPage(ctx, 'Planetary Positions');
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
    styles: { font: 'helvetica', fontSize: 7.6, cellPadding: 1.8, textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontStyle: 'bold', fontSize: 7.4 },
    alternateRowStyles: { fillColor: '#FCFAF6' },
    theme: 'grid',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  // ---------------- D1 chart + bhava table ----------------
  need(ctx, 100, ctx.title);
  sectionTitle(ctx, 'Lagna Kundali (D-1)');
  drawDiamond(doc, chart.vargas.D1, M, ctx.y + 4, 78, 'D-1 Rasi');
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
    theme: 'grid',
  });
  ctx.y = Math.max(ctx.y + 90, (doc as any).lastAutoTable.finalY + 6);

  // ---------------- Divisional charts ----------------
  const vargaList = Object.values(chart.vargas || {}) as any[];
  const perPage = 4;
  for (let i = 0; i < vargaList.length; i += perPage) {
    newPage(ctx, 'Divisional Charts');
    const chunk = vargaList.slice(i, i + perPage);
    sectionTitle(ctx, `Divisional Charts (${i + 1}-${i + chunk.length} of ${vargaList.length})`);
    const box = 78;
    const gapX = (CW - box * 2) / 1;
    chunk.forEach((v, k) => {
      const col = k % 2;
      const row = Math.floor(k / 2);
      const x = M + col * (box + gapX);
      const y = ctx.y + row * (box + 14) + 5;
      drawDiamond(doc, v, x, y, box, A(v.name || v.id));
    });
  }

  // ---------------- Ashtakavarga ----------------
  newPage(ctx, 'Ashtakavarga');
  sectionTitle(ctx, 'Sarvashtakavarga (SAV)');
  const sav: number[] = (chart.ashtakavarga as any)?.sav?.bindusByRashi || [];
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['', ...RASHI]],
    body: [['Bindus', ...sav.map(String)]],
    styles: { fontSize: 7, cellPadding: 1.6, halign: 'center', textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 6.8, fontStyle: 'bold' },
    theme: 'grid',
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
    theme: 'grid',
  });
  ctx.y = (doc as any).lastAutoTable.finalY + 8;

  // ---------------- Vimshottari ----------------
  const tree: any[] = (chart.vimshottari as any)?.tree || [];
  newPage(ctx, 'Vimshottari Dasha');
  sectionTitle(ctx, 'Mahadasha');
  autoTable(doc, {
    startY: ctx.y,
    margin: { left: M, right: M },
    head: [['Lord', 'Start', 'End', 'Years']],
    body: tree.map((d) => [A(d.lordName || d.lord), d.startDate, d.endDate, d.durationYears?.toFixed(2) ?? '-']),
    styles: { fontSize: 8, cellPadding: 1.8, textColor: INK },
    headStyles: { fillColor: '#F3EDE2', textColor: INK, fontSize: 7.6, fontStyle: 'bold' },
    theme: 'grid',
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
      theme: 'grid',
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
        theme: 'grid',
      });
      ctx.y = (doc as any).lastAutoTable.finalY + 5;
    });
  }

  // ---------------- Shadbala ----------------
  newPage(ctx, 'Shadbala');
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
    theme: 'grid',
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
      theme: 'grid',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Doshas ----------------
  const evaluated: any[] = (chart as any).doshas?.evaluatedDoshas || [];
  if (evaluated.length) {
    newPage(ctx, 'Doshas');
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
      theme: 'grid',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Jaimini ----------------
  const jm: any = (chart as any).jaimini || {};
  if (jm.charaKarakas?.length || jm.arudhaPadas?.length) {
    newPage(ctx, 'Jaimini');
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
        theme: 'grid',
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
        theme: 'grid',
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
      theme: 'grid',
    });
    ctx.y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------- Footers ----------------
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
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

/** Builds the report and hands it to the browser as a download. */
export function downloadChartPdf(chart: JyotishaChart, personName?: string) {
  const doc = buildChartPdf(chart, personName);
  const safe = A(personName || chart.meta.birthDetails.locationName || 'chart')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'chart';
  const d = chart.meta.birthDetails;
  doc.save(`${safe}-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.pdf`);
}
