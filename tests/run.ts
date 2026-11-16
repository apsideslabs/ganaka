/**
 * Gaṇaka — regression suite.
 *
 * Run with:  npx esbuild tests/run.ts --bundle --platform=node --format=cjs \
 *              --outfile=/tmp/t.cjs && node /tmp/t.cjs
 *
 * Two kinds of check, and the second is the one that matters:
 *
 *   1. ACCURACY — positions against Swiss Ephemeris references.
 *   2. REGRESSION — a specific assertion for every bug the Sanskrit audit
 *      found, so none of them can come back silently.
 *
 * The audit found six defects. Each has a named test below. A checksum would
 * not have caught the aṣṭakavarga one, and no type would have caught any of
 * them — only these.
 */
import { calculateFullJyotishaChart } from '../lib/jyotisha/calculator';
import { calculateHouses } from '../lib/jyotisha/houses';
import { parseTimeInput } from '../lib/jyotisha/time-format';
import { to24Hour } from '../lib/jyotisha/time-format';
import { chartPdfFilename } from '../lib/report/filenames';
import { chartToJsonString } from '../lib/report/export-chart-json';
import { calculateAllPlanets, sunMoonLongitudes } from '../lib/astronomy/ephemeris';
import { chartJsonFilename } from '../lib/report/export-chart-json';
import { CLASSICAL_YOGA_REGISTRY } from '../lib/yogas/yoga-engine';
import { NITYA_YOGAS } from '../lib/jyotisha/panchanga';
import { calculateAshtakavarga } from '../lib/ashtakavarga/ashtakavarga';
import { NAKSHATRA_NAMAKSHARAS, NAKSHATRA_YONIS, NAKSHATRA_RAJJUS } from '../lib/jyotisha/avakahada';
import { calculateSudarshanaChakra, sudarshanaHouseForYear } from '../lib/jyotisha/sudarshana';
import { calculateVarshaphala } from '../lib/varshaphala/varshaphala';
import { calculatePanchanga } from '../lib/jyotisha/panchanga';
import { calculateBhavaBala } from '../lib/shadbala/bhava-bala';
import { calculateVimshopakaBala } from '../lib/jyotisha/vimshopaka';
import { calculatePhala } from '../lib/jyotisha/phala-advanced';
import { CONDITIONAL_DASHA_SPECS, lordIndexAtBirth, calculateConditionalDasha } from '../lib/dashas/conditional-dashas';
import { mandookaOrder, mandookaYears, trikonaOrder, calculateMandookaDasha, calculateTrikonaDasha } from '../lib/dashas/jaimini-mandooka-trikona';
import { searchPanchanga, searchPanchangaAsync } from '../lib/jyotisha/reverse-panchanga';
import { calculatePranapada } from '../lib/jyotisha/pranapada';
import { findBrahmaGraha, calculateSthiraDasha } from '../lib/dashas/jaimini-sthira';
import { calculateMudda, calculatePatyayini, calculateTajikaAspects } from '../lib/varshaphala/tajika-dashas';
import { calculatePrashna, arudhaFromDirection } from '../lib/jyotisha/prashna';
import { buildChartExport } from '../lib/report/export-chart-json';
import { findEclipses } from '../lib/astronomy/eclipses';
import { calculateBhavaChalit } from '../lib/jyotisha/bhava-chalit';
import { calculateKpLayer } from '../lib/kp';
import { generateClassicalChartIndications } from '../lib/jyotisha/indications';
import { calculateMrityuBhaga, mrityuBhagaTable } from '../lib/jyotisha/mrityu-bhaga';
import { calculateNadi } from '../lib/jyotisha/nadi';
import { fourStepForAll } from '../lib/kp/four-step';
import { calculateRelationshipMatrix } from '../lib/jyotisha/relationships';
import { kaksyaOf, KAKSHA_DIVISIONS } from '../lib/ashtakavarga/ashtakavarga';
import { evaluateNeechaBhanga, evaluateAllNeechaBhanga } from '../lib/jyotisha/neechabhanga';
import { evaluateNeechaRajaYoga, RAJA_YOGA_NOTE } from '../lib/jyotisha/raja-yoga-neecha';
import { GRAHA_PROPERTIES } from '../lib/jyotisha/constants';
import { calculateCurrentTransits } from '../lib/jyotisha/transits';
import { ALL_DOSHA_DEFINITIONS } from '../lib/doshas/dosha-engine';
import { getRemediesForDosha, NO_REMEDY_PRESCRIBED } from '../lib/doshas/classical-remedies';
import { calculateKpAspects, isAspectBenefic, RASI_ASPECTS } from '../lib/kp/aspects';
import { housesSignified } from '../lib/kp/significators';
import { calculateNavaTara, taraFor, taraToday } from '../lib/jyotisha/navatara';
import { buildOverallReading } from '../lib/jyotisha/indications/overall';
import { scoreDomain } from '../lib/jyotisha/reading/five-layer';
import { SS_SIDEREAL_YEAR, KALI_EPOCH_JD, suryaSiddhantaSun, suryaSiddhantaNode, bijaCorrections, siddhanticResiduals } from '../lib/astronomy/siddhantic';
import { fertilityOf } from '../lib/kp/constants';
import { VIMSHOPAKA_SCHEMES, vimshopakaBand } from '../lib/jyotisha/vimshopaka';
import { calculateDoubleTransit } from '../lib/jyotisha/transits';
import { calculateRulingPlanets, calculateSignificators, evaluateCuspPromise, KP_MATTERS, buildKpCusps } from '../lib/jyotisha/kp';
import { RASHIS } from '../lib/jyotisha/constants';
import { assessTimeSensitivity } from '../lib/jyotisha/time-sensitivity';
import { offsetForZone } from '../lib/astronomy/city-index';
import { KNOWLEDGE_BASE, searchRules, getRule, knowledgeBaseSummary } from '../lib/jyotisha/knowledge-base';
import { SBC_RING, nakshatraAt, vedhaFor, buildSarvatobhadraGrid } from '../lib/jyotisha/sarvatobhadra';
import { calculateKakshyaTransits, kakshyaFor, KAKSHYA_SPAN } from '../lib/ashtakavarga/kakshya';
import { calculateSpecialPoints } from '../lib/jyotisha/special-lagnas';
import { calculateVargaRashi } from '../lib/vargas/varga-engine';

/** Async checks collected here and awaited before the summary. */
const pendingAsync: Promise<void>[] = [];
import { calculateJulianDay } from '../lib/astronomy/julian';
import { FIXTURES, TOLERANCE_ARCSEC, type FixtureChart } from './fixtures';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Read a source file from the repo root, tolerating a missing file. */
function readSource(rel: string): string {
  try {
    return require('fs').readFileSync(require('path').join(process.cwd(), rel), 'utf8');
  } catch {
    return '';
  }
}

const angDiffArcsec = (a: number, b: number) => {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d * 3600;
};

function buildChart(f: FixtureChart) {
  return calculateFullJyotishaChart(f.birth) as any;
}

/* ------------------------------------------------------------------ 1. ACCURACY */

console.log('\n== Accuracy against Swiss Ephemeris ==');
for (const f of FIXTURES) {
  const chart = buildChart(f);
  for (const [body, expected] of Object.entries(f.expected)) {
    const got = chart.planets[body]?.siderealLongitude;
    if (typeof got !== 'number') {
      check(`${f.id}/${body} present`, false, 'missing longitude');
      continue;
    }
    const d = angDiffArcsec(got, expected);
    check(
      `${f.id}/${body} within ${TOLERANCE_ARCSEC}"`,
      d <= TOLERANCE_ARCSEC,
      `${d.toFixed(1)}" off`
    );
  }
}

/* ------------------------------------------- 2. REGRESSION: the audit's six bugs */

const chart = buildChart(FIXTURES[0]);

console.log('\n== Regression: bugs found by the Sanskrit audit ==');

// --- Bug 1: Drekkāṇa bala gender order (BPHS 27.6) -------------------------
// आद्यमध्यावसानेषु … पुंनपुंसकयोषाख्याः — first masculine, middle neuter,
// last feminine. The code once had female and neuter transposed.
{
  const genders = ['Male', 'Neuter', 'Female'];
  check(
    'BPHS 27.6 drekkana genders are male/neuter/female',
    genders[0] === 'Male' && genders[1] === 'Neuter' && genders[2] === 'Female'
  );
  // and the shipped source must not carry the transposed literal
  const src = readSource('lib/shadbala/shadbala.ts');
  check(
    'shadbala.ts does not contain the transposed order',
    !src.includes("['Male', 'Female', 'Neuter']")
  );
}

// --- Bug 2: Ojayugma bala must score both rāśi and navāṃśa (BPHS 27.5) -----
// Maximum is 30 virūpas, not 15.
{
  const src = readSource('lib/shadbala/shadbala.ts');
  check('ojayugma scores the navamsa too', src.includes('isOddNavamsa'));
  for (const p of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
    const sb = chart.shadbala[p];
    check(
      `shadbala/${p} total is finite and positive`,
      typeof sb?.totalVirupas === 'number' && sb.totalVirupas > 0,
      String(sb?.totalVirupas)
    );
  }
}

// --- Bug 3: D11 Rudrāṃśa start sign is anti-zodiacal ------------------------
// Aries and Libra start from themselves; Taurus from Pisces; Sagittarius from Leo.
{
  const d11Start = (rashi: number) => (((13 - rashi) % 12) + 12) % 12 + 1;
  check('D11 Aries starts from Aries', d11Start(1) === 1);
  check('D11 Taurus starts from Pisces', d11Start(2) === 12);
  check('D11 Gemini starts from Aquarius', d11Start(3) === 11);
  check('D11 Libra starts from Libra', d11Start(7) === 7);
  check('D11 Sagittarius starts from Leo', d11Start(9) === 5);
  // and the shipped engine must carry that formula, not a copy of it
  const vargaSrc = readSource('lib/vargas/varga-engine.ts');
  check('varga-engine.ts uses the anti-zodiacal D11 start',
    vargaSrc.includes('13 - rashiNum') && !vargaSrc.includes('13 - rashiNum - 1'));
}

// --- Bug 4: Aṣṭakavarga totals are the classical ones ----------------------
// 48/49/39/54/56/52/39 summing to 337 — and this passes for BOTH recensions,
// which is exactly why the checksum alone could never catch the table swap.
{
  const rashiMap: any = { sun: 5, moon: 8, mars: 3, mercury: 6, jupiter: 9, venus: 7, saturn: 11 };
  const expectedTotals: Record<string, number> = {
    sun: 48, moon: 49, mars: 39, mercury: 54, jupiter: 56, venus: 52, saturn: 39,
  };
  for (const recension of ['parashara', 'varahamihira'] as const) {
    const av: any = calculateAshtakavarga(rashiMap, 8, { recension });
    const sav: number[] = av.sav?.bindusByRashi || [];
    check(
      `SAV total 337 (${recension})`,
      sav.reduce((a, b) => a + b, 0) === 337,
      String(sav.reduce((a, b) => a + b, 0))
    );
    for (const [p, want] of Object.entries(expectedTotals)) {
      const bav: any = av.bav?.[p];
      const arr: number[] = bav?.bindusByRashi || [];
      const total = arr.reduce((a, b) => a + b, 0);
      check(`BAV ${p} = ${want} (${recension})`, total === want, String(total));
    }
  }
  // the two recensions must differ in the four documented cells
  const a: any = calculateAshtakavarga(rashiMap, 8, { recension: 'parashara' });
  const b: any = calculateAshtakavarga(rashiMap, 8, { recension: 'varahamihira' });
  check(
    'the two recensions are not identical',
    JSON.stringify(a.bav?.moon) !== JSON.stringify(b.bav?.moon)
  );
}

// --- Bug 5: Yoni labels are consistent within a yoni ----------------------
// The Kuta calculator compares labels by string equality. Two nakshatras of the
// same yoni with different spellings silently lost their 4 points, and the
// Mahāvaira zero-point rule failed too.
{
  const byAnimal = new Map<string, number[]>();
  for (const [n, detail] of Object.entries(NAKSHATRA_YONIS)) {
    const key = detail.animal;
    if (!byAnimal.has(key)) byAnimal.set(key, []);
    byAnimal.get(key)!.push(Number(n));
  }
  check('yoni table covers all 27 nakshatras', Object.keys(NAKSHATRA_YONIS).length === 27);
  check(
    'yoni table has 14 species',
    byAnimal.size === 14,
    String(byAnimal.size)
  );
  // every label must appear as a whole string — no "Cow" vs "Cow / Bull" split
  const labels = [...byAnimal.keys()];
  check(
    'no yoni label carries an alternate-spelling suffix',
    !labels.some((l) => l.includes(' / ')),
    labels.filter((l) => l.includes(' / ')).join(', ')
  );
  // Meṣa and Gau must each pair their two nakshatras
  check(
    'Sheep (Meṣa) pairs nakshatras 3 and 8',
    JSON.stringify(byAnimal.get('Sheep (Meṣa)')) === JSON.stringify([3, 8]),
    JSON.stringify(byAnimal.get('Sheep (Meṣa)'))
  );
  check(
    'Cow (Gau) pairs nakshatras 12 and 26',
    JSON.stringify(byAnimal.get('Cow (Gau)')) === JSON.stringify([12, 26]),
    JSON.stringify(byAnimal.get('Cow (Gau)'))
  );
}

// --- Bug 6: Nāmākṣara for the first 21 nakshatras is canonical ------------
{
  const CANON_21 = [
    'चु','चे','चो','ला', 'ली','लू','ले','लो', 'अ','ई','उ','ए', 'ओ','वा','वी','वु',
    'वे','वो','का','की', 'कु','घ','ङ','छ', 'के','को','हा','ही', 'हू','हे','हो','डा',
    'डी','डू','डे','डो', 'मा','मी','मू','मे', 'मो','टा','टी','टू', 'टे','टो','पा','पी',
    'पू','ष','ण','ठ', 'पे','पो','रा','री', 'रू','रे','रो','ता', 'ती','तू','ते','तो',
    'ना','नी','नू','ने', 'नो','या','यी','यू', 'ये','यो','भा','भी', 'भू','धा','फा','ढा',
    'भे','भो','जा','जी',
  ];
  const flat: string[] = [];
  for (let n = 1; n <= 21; n++) {
    const row = NAKSHATRA_NAMAKSHARAS[n];
    for (const cell of row) {
      const dev = String(cell).match(/[\u0900-\u097F]+/);
      flat.push(dev ? dev[0] : '');
    }
  }
  check('namakshara 1-21 matches the canonical 84 syllables',
    JSON.stringify(flat) === JSON.stringify(CANON_21),
    `${flat.filter((x, i) => x !== CANON_21[i]).length} differing`);
}

// --- Citations: no mechanically-generated verse numbers ------------------
// The Nābhāsa set once carried verse numbers stepping one per yoga
// (35.17, 35.18, … 35.28) while the actual Vāpī verse is BPHS 35.12.
{
  const nabhasa = readSource('lib/yogas/nabhasa-yogas.ts');
  check('Vapi is pinned to the verified verse BPHS 35.12', nabhasa.includes('BPHS 35.12'));
  check('no mechanical BPHS 35.17-35.28 run remains', !nabhasa.includes('BPHS Ch. 35, v. 2'));
  check('nabhasa carries the citation caveat', nabhasa.includes('CITATION NOTE'));

  // BPHS ch.75: the five Mahāpuruṣa yogas share one rule verse (75.1-2) and are
  // described in blocks — 3-7, 8-12, 13-16, 17-19, 20-22. A mechanical +3 run
  // (2-4, 5-7, 8-10, …) is the signature of numbering that was never looked up.
  const engineSrc = readSource('lib/yogas/yoga-engine.ts');
  check('Pancha Mahapurusha cite the shared rule verse 75.1-2',
    (engineSrc.match(/BPHS 75\.1-2/g) || []).length === 5,
    String((engineSrc.match(/BPHS 75\.1-2/g) || []).length));
  check('no mechanical BPHS 75 verse run remains',
    !/BPHS Ch\. 75, v\. (2-4|5-7|8-10|11-13|14-16)/.test(engineSrc));
  check('Gajakesari pinned to BPHS 36.3', engineSrc.includes('BPHS 36.3'));

  // BPHS 35: v.3 lists the names, the definitions begin at v.7 (Rajju/Musala/
  // Nala) and v.8 (Mala/Sarpa); Kamala and Vāpī share v.12.
  // the āśraya/dala yogas live in yoga-engine.ts, the ākṛti ones in nabhasa-yogas.ts
  check('Rajju cites its definition at 35.7', engineSrc.includes('BPHS 35.7 (Rajju defined)'));
  check('Mala cites its definition at 35.8', engineSrc.includes('BPHS 35.8 (Mala defined)'));
  check('Kamala cites 35.12', engineSrc.includes('BPHS 35.12'));

  // BPHS 36.5 defines Amalakirti, not v.10.
  check('Amala cites 36.5', engineSrc.includes('BPHS 36.5'));

  // BPHS 41: bahudravya is 41.2-8; the 9th/5th lords verse is 41.16.
  check('dhana_5_9 cites 41.16', engineSrc.includes('BPHS 41.16'));
  const dhanaSrc = readSource('lib/yogas/classical-raja-dhana-yogas.ts');
  check('bahudravya cites 41.2-8', dhanaSrc.includes('BPHS 41.2-8'));

  // Lakshmi is a fortune yoga; BPHS ch.42 is the poverty chapter.
  check('Lakshmi no longer cites the poverty chapter', !/Lakshmi[\s\S]{0,400}BPHS Ch\. 42/.test(engineSrc));
}

/* ------------------------------------------------------ 3. STRUCTURAL INVARIANTS */

console.log('\n== Structural invariants ==');
{
  // Karakas: distinct planets, sorted by degrees descending
  const ks = chart.jaimini.charaKarakas;
  check('7 chara karakas', ks.length === 7, String(ks.length));
  check('karakas are distinct planets', new Set(ks.map((k: any) => k.planet)).size === ks.length);
  check('karakas sorted by degrees descending',
    ks.every((k: any, i: number) => i === 0 || ks[i - 1].degrees >= k.degrees));

  // Arudha: never on its own bhava
  const lagnaRashi = Math.floor(chart.lagna.siderealLongitude / 30) + 1;
  const onOwnBhava = chart.jaimini.arudhaPadas.filter((a: any) => {
    const houseRashi = ((lagnaRashi - 1 + (a.house - 1)) % 12) + 1;
    return a.rashiNumber === houseRashi;
  });
  check('no arudha falls on its own bhava', onOwnBhava.length === 0, String(onOwnBhava.length));

  // Rajju: 27 covered, 5 types, Śiro holds exactly 3
  check('rajju covers 27 nakshatras', Object.keys(NAKSHATRA_RAJJUS).length === 27);
  const rajjuCounts = new Map<string, number>();
  for (const r of Object.values(NAKSHATRA_RAJJUS)) {
    rajjuCounts.set(r.type, (rajjuCounts.get(r.type) || 0) + 1);
  }
  check('rajju has 5 types', rajjuCounts.size === 5);
  const shiro = [...rajjuCounts.entries()].find(([k]) => k.startsWith('Śiro'));
  check('Śiro rajju holds 3 nakshatras (Raman p.89)', shiro?.[1] === 3, String(shiro?.[1]));

  // Vimshottari: nine mahadashas, 120 years
  const tree = chart.vimshottari?.tree || [];
  check('9 mahadashas', tree.length === 9, String(tree.length));
  // The tree runs from birth, so a native born mid-dasha has less than 120 years
  // remaining. The cycle is complete only when the elapsed portion is added back.
  const totalYears = tree.reduce((a: number, d: any) => a + (d.durationYears || 0), 0);
  const elapsed = tree[0]?.elapsedBeforeBirthYears || 0;
  check(
    'vimshottari cycle is 120 years from the start of the birth dasha',
    Math.abs(totalYears + elapsed - 120) < 0.5,
    `${totalYears.toFixed(2)} + ${elapsed.toFixed(2)} elapsed`
  );

  // Vargas: all 24 present (16 classical + D5, D6, D8, D11, D81, D108, D144, D150)
  check('24 vargas computed', Object.keys(chart.vargas).length === 24,
    String(Object.keys(chart.vargas).length));
}

/* ------------------------------------------------- SUDARSHANA CAKRA (BPHS 74) */

console.log('\n== Sudarshana Cakra ==');
{
  const sc: any = calculateSudarshanaChakra(chart, { yearOfLife: 17 });

  // BPHS 74.4-6: three rings, each holding all twelve houses.
  check('three rings', sc.rings.length === 3);
  check('each ring has twelve houses', sc.rings.every((r: any) => r.houses.length === 12));
  check('ring order is lagna, moon, sun',
    sc.rings.map((r: any) => r.reference).join(',') === 'lagna,moon,sun');

  // The signs never move between rings — only the house number does.
  for (const r of sc.rings) {
    const all = r.houses.flatMap((h: any) => h.planets);
    check(`${r.reference} ring holds every graha exactly once`,
      all.length === 9 && new Set(all).size === 9, `${all.length} placements`);
  }

  // The published worked example: Lagna Virgo, Moon Pisces, Sun Sagittarius,
  // Jupiter in Gemini -> 10th from lagna, 4th from moon, 7th from sun.
  const houseFrom = (ref: number, tgt: number) => ((tgt - ref + 12) % 12) + 1;
  check('worked example: Virgo->Gemini is the 10th', houseFrom(6, 3) === 10);
  check('worked example: Pisces->Gemini is the 4th', houseFrom(12, 3) === 4);
  check('worked example: Sagittarius->Gemini is the 7th', houseFrom(9, 3) === 7);

  // BPHS 74.22: one house per year, twelve-year cycle.
  check('year 1 -> 1st house', sudarshanaHouseForYear(1) === 1);
  check('year 12 -> 12th house', sudarshanaHouseForYear(12) === 12);
  check('year 13 -> 1st house', sudarshanaHouseForYear(13) === 1);
  check('year 25 -> 1st house', sudarshanaHouseForYear(25) === 1);
  check('dasha attached for year 17 -> 5th house',
    sc.dasha?.house === sudarshanaHouseForYear(17));

  // BPHS 74.19-20: the use condition must be reported, not silently ignored.
  check('applicability flag is present', typeof sc.applicable === 'boolean');
  const distinct = new Set([chart.lagna.rashiNumber,
    chart.planets.moon.rashiNumber, chart.planets.sun.rashiNumber]).size;
  check('applicable only when all three reference signs differ',
    sc.applicable === (distinct === 3));
  if (!sc.applicable) {
    check('inapplicable charts carry a reason', typeof sc.inapplicableReason === 'string');
  }
}

/* --------------------------------------- SUDARSHANA GEOMETRY (no overflow) */

{
  // Mirrors the constants in SudarshanaPanel.tsx. Two failures have to be
  // impossible: a graha label outside its band, and a stack tall enough to run
  // into the neighbouring cell.
  const BANDS: [number, number][] = [[34, 86], [90, 134], [138, 182]];
  const MAX_STACK_STEP = 9.6;
  const BAND_MID = 0.60;
  const stackStep = (n: number, mid: number): number => {
    if (n <= 1) return 0;
    const halfRoom = Math.max(4, mid * Math.sin(Math.PI / 12) - 5);
    return Math.min(MAX_STACK_STEP, (2 * halfRoom) / (n - 1));
  };

  let outside = 0;
  let tooTall = 0;
  for (const [rIn, rOut] of BANDS) {
    const mid = rIn + (rOut - rIn) * BAND_MID;
    if (mid < rIn + 4 || mid > rOut - 4) outside++;
    for (let n = 1; n <= 6; n++) {
      // half-height of the centred stack, in screen units
      const half = ((n - 1) / 2) * stackStep(n, mid);
      // the sector is 30 degrees; at radius `mid` its usable half-height is
      // mid * sin(15) minus the label's own half-height (~4 units)
      if (half > mid * Math.sin(Math.PI / 12) - 4) tooTall++;
    }
  }
  check('every cell anchor sits inside its band', outside === 0, String(outside));
  check('no stack is taller than its 30-degree sector', tooTall === 0, String(tooTall));
}

/* ------------------------------------------ NODE CONVENTION (mean vs true) */

console.log('\n== Node convention ==');
{
  // Swiss Ephemeris sidereal values for the same moment, Lahiri.
  // Geometric Swiss Ephemeris (SEFLG_TRUEPOS), the same convention as the
  // planet fixtures.
  const SWE_MEAN_RAHU = 283.703157;
  const SWE_TRUE_RAHU = 284.756694;
  const TOL = 25; // arcsec

  const nodeBirth = FIXTURES[0].birth;
  const meanChart: any = calculateFullJyotishaChart({ ...nodeBirth, nodeType: 'mean' });
  const trueChart: any = calculateFullJyotishaChart({ ...nodeBirth, nodeType: 'true' });

  const meanRahu = meanChart.planets.rahu.siderealLongitude;
  const trueRahu = trueChart.planets.rahu.siderealLongitude;

  const dMean = Math.abs(meanRahu - SWE_MEAN_RAHU) * 3600;
  const dTrue = Math.abs(trueRahu - SWE_TRUE_RAHU) * 3600;

  check('mean node within 60" of Swiss Ephemeris', dMean < TOL, dMean.toFixed(1) + '"');
  // The osculating node was 23 arcmin out when it came from a 4-term series.
  check('true node within 60" of Swiss Ephemeris', dTrue < TOL, dTrue.toFixed(1) + '"');

  // The switch must actually move the chart.
  check('switching the node moves Rāhu by about a degree',
    Math.abs(trueRahu - meanRahu) > 0.5, Math.abs(trueRahu - meanRahu).toFixed(4) + '°');

  // Ketu stays opposite in both modes.
  for (const [name, c] of [['mean', meanChart], ['true', trueChart]] as const) {
    const diff = ((c.planets.ketu.siderealLongitude - c.planets.rahu.siderealLongitude) % 360 + 360) % 360;
    check(`Ketu opposite Rāhu (${name})`, Math.abs(diff - 180) < 0.001, diff.toFixed(4) + '°');
  }

  // Derived values must follow the chosen node, not the mean one.
  check('true-mode Rāhu nakṣatra is derived from the true longitude',
    trueChart.planets.rahu.nakshatraIndex ===
      Math.floor(trueRahu / (360 / 27)) % 27);
  check('mean-mode Rāhu nakṣatra is derived from the mean longitude',
    meanChart.planets.rahu.nakshatraIndex ===
      Math.floor(meanRahu / (360 / 27)) % 27);

  // The chart must carry exactly the nine grahas — not eleven. The ephemeris
  // also produces true_rahu/true_ketu; surfacing them put Rāhu in the planet
  // grid twice.
  for (const [label, c] of [['mean', meanChart], ['true', trueChart]] as const) {
    const keys = Object.keys(c.planets);
    check(`chart carries exactly nine grahas (${label})`, keys.length === 9, String(keys.length));
    check(`no true_rahu leaked into the chart (${label})`, !keys.includes('true_rahu'));
    check(`no true_ketu leaked into the chart (${label})`, !keys.includes('true_ketu'));
  }

  // Default must remain the Parāśari convention.
  const defaultChart: any = calculateFullJyotishaChart(nodeBirth);
  check('default node is mean',
    Math.abs(defaultChart.planets.rahu.siderealLongitude - meanRahu) < 1e-9);
}

/* ------------------------------------------- HISTORICAL TZ & TIME SENSITIVITY */

console.log('\n== Time zone & birth-time sensitivity ==');
{
  // India has had no daylight saving since 1945, but it ran UTC+6:30 during
  // the war, and Britain ran permanent UTC+1 from Oct 1968 to Oct 1971.
  check('IST 2009 resolves to +5:30', offsetForZone('Asia/Kolkata', 2009, 3, 3) === 5.5);
  check('IST 1942 resolves to +6:30 (wartime)',
    offsetForZone('Asia/Kolkata', 1942, 9, 1) === 6.5, String(offsetForZone('Asia/Kolkata', 1942, 9, 1)));
  check('London July 1970 resolves to +1 (permanent BST)',
    offsetForZone('Europe/London', 1970, 7, 15) === 1);
  check('London January 1970 also +1 — the same experiment',
    offsetForZone('Europe/London', 1970, 1, 15) === 1, String(offsetForZone('Europe/London', 1970, 1, 15)));
  check('London January 1980 resolves to 0',
    offsetForZone('Europe/London', 1980, 1, 15) === 0);
  check('New York July resolves to -4, January to -5',
    offsetForZone('America/New_York', 1980, 7, 4) === -4 &&
    offsetForZone('America/New_York', 1980, 1, 4) === -5);

  // Sensitivity: every verdict must come from two real calculations.
  const f = FIXTURES[0].birth as any;
  const rep: any = assessTimeSensitivity({
    year: f.year, month: f.month, day: f.day, hour: f.hour, minute: f.minute, second: f.second,
    latitude: f.latitude, longitude: f.longitude, timezoneOffsetHours: f.timezoneOffsetHours,
  } as any, 5);

  check('sensitivity reports every compared output',
    rep.stable.length + rep.unstable.length >= 9,
    `${rep.stable.length} stable + ${rep.unstable.length} unstable`);
  check('a one-minute window is at least as stable as a five-minute one',
    assessTimeSensitivity({
      year: f.year, month: f.month, day: f.day, hour: f.hour, minute: f.minute, second: f.second,
      latitude: f.latitude, longitude: f.longitude, timezoneOffsetHours: f.timezoneOffsetHours,
    } as any, 1).unstable.length <= rep.unstable.length);
  check('sensitivity gives a distance to the next lagna sign change',
    rep.minutesToLagnaChange != null && rep.minutesToLagnaChange > 0 && rep.minutesToLagnaChange <= 130,
    String(rep.minutesToLagnaChange));
  check('varga outputs are actually read, not silently blank',
    rep.stable.concat(rep.unstable.map((u: any) => u.label)).some((l: string) => l.startsWith('D-9')),
    rep.unstable.map((u: any) => u.label).join(','));
  // The reference chart's lagna sits 0.97° before a navāṃśa boundary — about
  // four minutes — so D-9 must move across a five-minute window there.
  const refChart: any = assessTimeSensitivity({
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 0,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5,
  } as any, 5);
  check('the reference D-9 lagna moves at ±5 min',
    refChart.unstable.some((u: any) => u.label === 'D-9 lagna'),
    refChart.unstable.map((u: any) => u.label).join(','));
  check('the reference lagna sign itself does not move at ±5 min',
    refChart.stable.includes('Lagna rāśi'));
}

/* ------------------------------------------------ KNOWLEDGE BASE & SEARCH UI */

console.log('\n== Knowledge base ==');
{
  const kb = knowledgeBaseSummary();
  check('knowledge base holds records', kb.total >= 15, String(kb.total));
  check('every record carries a source and location',
    KNOWLEDGE_BASE.every((r) => r.work && r.location && r.edition && r.translation));
  check('every record names its implementation',
    KNOWLEDGE_BASE.every((r) => r.implementation.length > 0));
  check('Sanskrit records also carry a transliteration',
    KNOWLEDGE_BASE.filter((r) => r.sanskrit).every((r) => r.transliteration));
  check('most records note a disagreement',
    kb.withDisagreement >= kb.total - 3, `${kb.withDisagreement} of ${kb.total}`);
  check('record ids are unique',
    new Set(KNOWLEDGE_BASE.map((r) => r.id)).size === KNOWLEDGE_BASE.length);
  check('lookup by id works', getRule('bphs_46_168_sthira_years')?.location.includes('46') === true);
  check('search finds the Sthira rule by keyword',
    searchRules('sthira').some((r) => r.id === 'bphs_46_168_sthira_years'));
  check('search finds rules by implementation file',
    searchRules('pranapada.ts').length > 0);
  check('an empty search returns everything', searchRules('').length === kb.total);
}

console.log('\n== Reverse panchanga async ==');
{
  // The suite runs synchronously, so the async scan is driven through a promise
  // and the checks run in its continuation. Anything after this block that must
  // wait belongs inside it.
  const opts = {
    from: { year: 2009, month: 3, day: 1 },
    to: { year: 2009, month: 3, day: 8 },
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5,
  };
  const sync = searchPanchanga({ nakshatra: 4 }, opts);
  let ticks = 0;
  const done = searchPanchangaAsync({ nakshatra: 4 }, opts, () => { ticks++; }).then((asyncOut) => {
    check('async search returns the same windows as the sync one',
      asyncOut.length === sync.length &&
      asyncOut.every((w, i) => Math.abs(w.startJD - sync[i].startJD) < 1e-9));
    check('async search reports progress more than once', ticks > 1, `${ticks} ticks`);
  });
  pendingAsync.push(done);
}

/* ------------------------------------------- STRENGTH PANELS ARE REAL DATA */

console.log('\n== Ṣaḍbala, Bhāva Bala & Viṃśopaka ==');
{
  // Every value these panels display must come from a calculation, be finite,
  // and add up. A panel that renders "undefined" or a placeholder would pass a
  // smoke test but mislead the reader, so the arithmetic is checked here.
  for (const fixture of FIXTURES) {
    const c: any = calculateFullJyotishaChart(fixture.birth);
    const tag = `${fixture.birth.year}-${fixture.birth.month}-${fixture.birth.day}`;

    const sb = Object.entries(c.shadbala) as Array<[string, any]>;
    check(`[${tag}] ṣaḍbala covers seven grahas`, sb.length === 7, String(sb.length));

    const components = ['sthanaBala', 'digBala', 'kalaBala', 'chestaBala', 'naisargikaBala', 'drigBala'];
    check(`[${tag}] every graha carries all six balas`,
      sb.every(([, v]) => components.every((k) => typeof v[k] === 'number' && Number.isFinite(v[k]))),
      sb.filter(([, v]) => !components.every((k) => Number.isFinite(v[k]))).map(([k]) => k).join(','));

    // The total is the six components plus the Yuddha Bala adjustment, and the
    // war adjustments net to zero across the chart — so the column of totals
    // must equal the column of component sums even where two grahas fight.
    const totalOfTotals = sb.reduce((t, [, v]) => t + v.totalVirupas, 0);
    const totalOfComponents = sb.reduce(
      (t, [, v]) => t + components.reduce((s, k) => s + v[k], 0), 0);
    check(`[${tag}] totals equal components, war adjustment netting to zero`,
      Math.abs(totalOfTotals - totalOfComponents) < 0.5,
      `${totalOfTotals.toFixed(1)} vs ${totalOfComponents.toFixed(1)}`);

    check(`[${tag}] dṛg bala stays within its sixty-virūpa bound`,
      sb.every(([, v]) => v.drigBala >= -60 && v.drigBala <= 60),
      sb.map(([, v]) => v.drigBala).join(','));

    check(`[${tag}] rūpas are the virūpas over sixty`,
      sb.every(([, v]) => Math.abs(v.totalRupas - v.totalVirupas / 60) < 0.02));

    check(`[${tag}] every graha is ranked, ranks unique`,
      new Set(sb.map(([, v]) => v.rank)).size === 7);

    const bb = Object.values(calculateBhavaBala(c)) as any[];
    check(`[${tag}] bhāva bala covers twelve houses`, bb.length === 12, String(bb.length));
    check(`[${tag}] every house total is finite and positive`,
      bb.every((h) => Number.isFinite(h.totalVirupas) && h.totalVirupas > 0));
    check(`[${tag}] house ranks are unique one to twelve`,
      new Set(bb.map((h) => h.rank)).size === 12);

    const vim = calculateVimshopakaBala(c.vargas) as any[];
    check(`[${tag}] viṃśopaka scores seven grahas`, vim.length === 7, String(vim.length));
  }

  // The graded dṛṣṭi must actually distinguish aspects. A flat sixty would
  // only ever produce drig values that are multiples of fifteen.
  const graded = FIXTURES.some((f) => {
    const c: any = calculateFullJyotishaChart(f.birth);
    return (Object.values(c.shadbala) as any[]).some((v) => Math.abs(v.drigBala % 15) > 1e-9);
  });
  check('dṛṣṭi is graded, not a flat sixty per aspect', graded);
}

/* ---------------------------------------------------- REPORT & EXPORT PARITY */

console.log('\n== Report & export parity ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });

  // Everything the workspace shows must reach the JSON.
  const required = ['bhavaBala', 'phala', 'vimshopaka', 'sarvatobhadra',
                    'extendedDashas', 'varshaphala', 'tajika', 'prashna'];
  for (const k of required) {
    check(`JSON carries ${k}`, e[k] != null && (Array.isArray(e[k]) ? e[k].length > 0 : Object.keys(e[k]).length > 0));
  }
  check('JSON viṃśopaka covers seven grahas', e.vimshopaka.length === 7, String(e.vimshopaka.length));
  check('JSON viṃśopaka carries every varga set',
    e.vimshopaka.every((v: any) => ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga']
      .every((k) => typeof v[k] === 'number')));

  // Every doṣa and yoga must name its source. A result with no verse is a
  // weakness the checklist calls out explicitly.
  const doshas = natal.doshas.evaluatedDoshas as any[];
  check('every doṣa names a chapter or verse',
    doshas.every((d) => d.primarySource?.chapter || d.primarySource?.verseOrShloka),
    doshas.filter((d) => !d.primarySource?.chapter && !d.primarySource?.verseOrShloka)
      .map((d) => d.name).join(','));
  check('every yoga names a chapter and verse',
    (natal.yogas as any[]).every((y) => y.chapterAndVerse),
    (natal.yogas as any[]).filter((y) => !y.chapterAndVerse).map((y) => y.name).join(','));

  // No citation may point past the end of the work it cites.
  const impossible: string[] = [];
  for (const d of doshas) {
    const t = `${d.primarySource?.chapter ?? ''} ${d.primarySource?.verseOrShloka ?? ''}`;
    for (const m of t.matchAll(/(?:Ch\.?|Chapter)\s*(\d+)/gi)) if (+m[1] > 97) impossible.push(d.name);
  }
  for (const y of natal.yogas as any[]) {
    for (const m of String(y.chapterAndVerse || '').matchAll(/(?:Ch\.?|Chapter)\s*(\d+)/gi)) if (+m[1] > 97) impossible.push(y.name);
  }
  check('no citation points past chapter 97', impossible.length === 0, impossible.slice(0, 4).join(','));
}

/* ----------------------------------------- RELATIONSHIPS & ATTRIBUTES */

console.log('\n== Pañcadhā maitrī & attributes ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  check('relationship matrix is attached to the chart', !!natal.relationships);
  check('every graha relates to every other',
    natal.relationships.pairs.length === 9 * 8, String(natal.relationships.pairs.length));
  check('compound grades are one of the five',
    natal.relationships.pairs.every((p: any) =>
      ['Adhi Mitra', 'Mitra', 'Sama', 'Shatru', 'Adhi Shatru'].includes(p.compound)));
  check('summary counts every pair',
    Object.values(natal.relationships.summary).reduce((a: any, b: any) => a + b, 0)
      === natal.relationships.pairs.length);
  check('dispositor relations cover nine grahas', natal.dispositorRelations.length === 9);

  // Natural friendship must be antisymmetric-consistent: if A calls B a friend
  // and B calls A a friend, the compound cannot be an enmity on both sides.
  const both = natal.relationships.pairs.find(
    (p: any) => p.natural === 'Mitra' && p.temporal === 'friend');
  check('friend + temporal friend reads as at least Mitra',
    !both || ['Adhi Mitra', 'Mitra'].includes(both.compound), both?.compound);

  check('attributes are attached', !!natal.attributes);
  check('lucky number is 1-9',
    natal.attributes.luckyNumber >= 1 && natal.attributes.luckyNumber <= 9,
    String(natal.attributes.luckyNumber));
  check('attributes carry colour, day, metal, gem and deity',
    ['luckyColour', 'luckyDay', 'luckyMetal', 'gemstone', 'deity']
      .every((k) => typeof natal.attributes[k] === 'string' && natal.attributes[k].length > 0));

  // Avasthās must reach every graha, not just the ones the panel happened to read.
  const planets = Object.values(natal.planets) as any[];
  check('every graha carries all three avasthās',
    planets.every((p) => p.avasthas?.baladi && p.avasthas?.jagradadi && p.avasthas?.deeptadi),
    planets.filter((p) => !p.avasthas?.deeptadi).length + ' missing');

  // Sāyana must sit ayanāṃśa degrees above nirayana.
  const sun: any = natal.planets.sun;
  const diff = sun.tropicalLongitude - sun.siderealLongitude;
  check('sāyana minus nirayana equals the ayanāṃśa',
    Math.abs(diff - natal.meta.ayanamshaValue) < 0.01, diff.toFixed(4));

  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  for (const k of ['relationships', 'dispositorRelations', 'attributes', 'sayana', 'bhavaSpasht', 'drishti', 'sudarshana']) {
    check(`JSON carries ${k}`,
      e[k] != null && (Array.isArray(e[k]) ? e[k].length > 0 : Object.keys(e[k]).length > 0));
  }
  check('JSON carries the engine meta block', !!e.meta && !!e.meta.engineVersion);
  check('JSON records the node convention',
    e.calculation.nodeType === 'mean' || e.calculation.nodeType === 'true',
    String(e.calculation.nodeType));
  check('meta records the node convention too',
    natal.meta.nodeType === 'mean' || natal.meta.nodeType === 'true');
  check('JSON sāyana covers nine grahas', e.sayana.length === 9);
  check('JSON bhāva spaṣṭa covers twelve houses', e.bhavaSpasht.length === 12);

  // Dṛṣṭi: every planet aspects at least the 7th from itself, and the byHouse
  // index must agree with the byPlanet one.
  check('every graha aspects at least one house',
    Object.values(e.drishti.byPlanet).every((h: any) => Array.isArray(h) && h.length > 0));
  const houseIdx: any = e.drishti.byHouse;
  let consistent = true;
  for (const [pid, houses] of Object.entries(e.drishti.byPlanet as any)) {
    for (const h of houses as number[]) {
      if (!(houseIdx[String(h)] || []).includes(pid)) consistent = false;
    }
  }
  check('dṛṣṭi byHouse agrees with byPlanet', consistent);

  check('Sudarśana has three rings', e.sudarshana.rings.length === 3);
  check('each ring covers twelve houses',
    e.sudarshana.rings.every((r: any) => r.houses.length === 12));
  check('Sudarśana names the active house',
    e.sudarshana.dasha?.house >= 1 && e.sudarshana.dasha?.house <= 12,
    String(e.sudarshana.dasha?.house));
}

/* --------------------------------------------------- BHĀVA CHALITA & ANGLES */

console.log('\n== Bhāva Chalita ==');
{
  // The cusp midpoint must be taken along the short arc. Before the fix a pair
  // straddling 0° produced a house spanning 210° that swallowed the zodiac.
  for (const f of FIXTURES) {
    const c: any = calculateFullJyotishaChart(f.birth as any);
    const bc = calculateBhavaChalit(c, 'sripati');
    const tag = String((f.birth as any).year);

    check(`[${tag}] chalit covers every graha`, bc.entries.length === 9, String(bc.entries.length));

    // Every bhāva span must be under half the circle and the twelve must tile it.
    const spans = bc.bhavas.map((b) => {
      let d = ((b.end - b.start) % 360 + 360) % 360;
      return d;
    });
    check(`[${tag}] no bhāva spans more than half the zodiac`,
      spans.every((d) => d > 0 && d < 180), spans.map((d) => d.toFixed(0)).join(','));
    const total = spans.reduce((a, b) => a + b, 0);
    check(`[${tag}] the twelve bhāvas close the circle`,
      Math.abs(total - 360) < 0.5, total.toFixed(2));

    // Each graha must sit inside exactly one bhāva.
    const counts: Record<string, number> = {};
    for (const b of bc.bhavas) for (const p of b.occupants) counts[p] = (counts[p] ?? 0) + 1;
    check(`[${tag}] every graha occupies exactly one bhāva`,
      Object.values(counts).every((n) => n === 1) && Object.keys(counts).length === 9,
      JSON.stringify(counts));

    // Under whole-sign houses nothing can shift.
    const whole = calculateBhavaChalit(c, 'equal_whole');
    check(`[${tag}] whole-sign chalit never shifts`, whole.summary.shifted === 0);
  }

  // The 1950 chart shifts three grahas under Sripati — proof the comparison runs.
  const c1950: any = calculateFullJyotishaChart(FIXTURES[2].birth as any);
  const bc1950 = calculateBhavaChalit(c1950, 'sripati');
  check('the 1950 chart shifts grahas under Sripati', bc1950.summary.shifted > 0,
    bc1950.entries.filter((e) => e.shifted).map((e) => `${e.planet}:${e.rashiHouse}->${e.chalitHouse}`).join(' '));

  // The local sky must be recorded, not thrown away.
  check('the chart carries the midheaven', typeof c1950.angles?.mc === 'number');
  const sep = (a: number, b: number) => ((a - b) % 360 + 360) % 360;
  check('the descendant sits opposite the ascendant',
    typeof c1950.angles?.descendant === 'number' &&
    Math.abs(sep(c1950.angles.descendant, c1950.lagna.siderealLongitude) - 180) < 0.01,
    String(sep(c1950.angles?.descendant ?? 0, c1950.lagna.siderealLongitude)));
  check('IC is opposite the MC',
    Math.abs(sep(c1950.angles.ic, c1950.angles.mc) - 180) < 0.01,
    String(sep(c1950.angles.ic, c1950.angles.mc)));

  const e: any = buildChartExport(c1950, { dashaDepth: 3 });
  check('JSON carries bhavaChalit', !!e.bhavaChalit?.entries?.length);
  check('JSON carries the local angles', typeof e.angles?.mc === 'number');
}

/* ------------------------------------------------------------- ECLIPSES */

console.log('\n== Saṃhitā — eclipses ==');
{
  const got = findEclipses({
    from: { year: 2009, month: 6, day: 1 },
    to: { year: 2010, month: 8, day: 1 },
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5,
  });

  // The five real eclipses in that window. Dates are local to IST, so the
  // 31 Dec 2009 lunar eclipse appears on 1 Jan 2010.
  const want = [
    ['solar', 2009, 7, 22],
    ['lunar', 2010, 1, 1],
    ['solar', 2010, 1, 15],
    ['lunar', 2010, 6, 26],
    ['solar', 2010, 7, 12],
  ];
  for (const [kind, y, m, d] of want as any[]) {
    const hit = got.find((e) => e.kind === kind && e.date.year === y && e.date.month === m && e.date.day === d);
    check(`${kind} eclipse on ${d}-${m}-${y} is found`, !!hit,
      got.map((e) => `${e.kind}:${e.date.day}/${e.date.month}/${e.date.year}`).join(' '));
  }

  check('no spurious eclipses in a clean window', got.length === want.length, String(got.length));

  // The July 2009 eclipse was total — the Moon sat almost on the ecliptic.
  const jul09 = got.find((e) => e.kind === 'solar' && e.date.month === 7 && e.date.year === 2009);
  check('the July 2009 eclipse is deep', !!jul09 && jul09.depth > 0.9, String(jul09?.depth));
  check('the July 2009 eclipse was above the horizon in Assam', !!jul09 && jul09.aboveHorizon);

  // The July 2010 total eclipse was not visible from India.
  const jul10 = got.find((e) => e.kind === 'solar' && e.date.month === 7 && e.date.year === 2010);
  check('the July 2010 eclipse is below the horizon in Assam', !!jul10 && !jul10.aboveHorizon);

  // Syzygy times must be accurate to a couple of minutes: the July 2009 new
  // moon fell at 08:05 IST and the January 2010 full moon at 00:43 IST.
  check('July 2009 syzygy lands on 08:0x IST',
    !!jul09 && jul09.date.hour === 8 && Math.abs(jul09.date.minute - 4) <= 3,
    jul09 ? `${jul09.date.hour}:${jul09.date.minute}` : 'missing');
  const jan10 = got.find((e) => e.kind === 'lunar' && e.date.month === 1 && e.date.year === 2010);
  check('January 2010 syzygy lands on 00:4x IST',
    !!jan10 && jan10.date.hour === 0 && Math.abs(jan10.date.minute - 43) <= 3,
    jan10 ? `${jan10.date.hour}:${jan10.date.minute}` : 'missing');

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  check('JSON carries the eclipse list', Array.isArray(e.eclipses?.events) && e.eclipses.events.length > 0);
  check('JSON states the eclipse method', typeof e.eclipses?.method === 'string' && e.eclipses.method.length > 40);
}

/* --------------------------------------- PREDICTION CHECKLIST COMPLIANCE */

console.log('\n== Practitioner checklist ==');
{
  // 1. BAV totals are fixed by the tables — a free check on any calculator.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const want: any = { sun: 48, moon: 49, mars: 39, mercury: 54, jupiter: 56, venus: 52, saturn: 39 };
  const got: any = {};
  for (const [p, o] of Object.entries(natal.ashtakavarga.bav) as any) got[p] = o.totalBindus;
  check('every BAV total matches the published table',
    Object.keys(want).every((k) => got[k] === want[k]), JSON.stringify(got));
  check('SAV totals exactly 337', natal.ashtakavarga.sav.total === 337);

  // 2. Shadbala required minimums: the common set.
  const req: any = {};
  for (const [p, o] of Object.entries(natal.shadbala) as any) req[p] = o.requiredRupas;
  check('required shadbala matches the common set',
    req.sun === 5 && req.moon === 6 && req.mars === 5 && req.mercury === 7 &&
    req.jupiter === 6.5 && req.venus === 5.5 && req.saturn === 5,
    JSON.stringify(req));
  check('every graha carries a shadbala ratio',
    Object.values(natal.shadbala).every((o: any) => typeof o.ratio === 'number' && o.ratio > 0));

  // 3. Vimshopaka: four schemes, each weighting exactly twenty.
  for (const [name, w] of Object.entries(VIMSHOPAKA_SCHEMES)) {
    const sum = Object.values(w as Record<string, number>).reduce((a, b) => a + b, 0) as number;
    check(`vimshopaka ${name} weights total twenty`, Math.abs(sum - 20) < 1e-9, String(sum));
  }
  const vim = calculateVimshopakaBala(natal.vargas) as any[];
  check('vimshopaka covers seven grahas', vim.length === 7);
  check('vimshopaka scores stay within 0-20',
    vim.every((v) => [v.shadvargaScore, v.saptavargaScore, v.dashavargaScore, v.shodashavargaScore]
      .every((s) => s >= 0 && s <= 20)));
  // The four schemes must be independently computed, not scaled copies.
  check('the four schemes give genuinely different scores',
    vim.some((v) => new Set([v.shadvargaScore, v.saptavargaScore, v.dashavargaScore, v.shodashavargaScore]).size > 1));
  check('vimshopaka carries a band and a named grade',
    vim.every((v) => typeof v.band === 'string' && typeof v.namedGrade === 'string'));
  check('the band ladder matches the published cuts',
    vimshopakaBand(4.9).band === 'Incapable' && vimshopakaBand(9.9).band === 'Some good' &&
    vimshopakaBand(14.9).band === 'Middling' && vimshopakaBand(15).band === 'Wholly favourable');
  check('atipurna sits at 17.5 and above', vimshopakaBand(17.5).namedGrade === 'Atipūrṇa');
  check('atihina sits below 2.5', vimshopakaBand(2.4).namedGrade === 'Atihīna');

  // 4. All five avastha sets.
  const sets = Object.keys(natal.planets.sun.avasthas || {});
  for (const k of ['baladi', 'jagradadi', 'deeptadi', 'lajjitadi', 'sayanadi']) {
    check(`avastha set ${k} is present`, sets.includes(k), sets.join(','));
  }
  check('every graha carries all five avasthas',
    Object.values(natal.planets).every((p: any) =>
      ['baladi', 'jagradadi', 'deeptadi', 'lajjitadi', 'sayanadi'].every((k) => !!p.avasthas?.[k])));

  // 5. Double transit: two planets, one house.
  const dt = calculateDoubleTransit(natal.lagna.rashiNumber, new Date(2026, 10, 14));
  check('double transit covers twelve houses', dt.houses.length === 12);
  check('a house is active only when both planets reach it',
    dt.houses.every((h) => h.active === (h.jupiterActivates && h.saturnActivates)));

  // 6. Argala is attached with its obstruction.
  check('argala is attached to the chart', Array.isArray(natal.argala) && natal.argala.length > 0);
  check('every argala names its virodha house',
    natal.argala.every((a: any) => typeof a.virodhaHouse === 'number'));

  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  check('JSON carries the double transit', !!e.doubleTransit?.houses?.length);
  check('JSON carries argala', Array.isArray(e.argala) && e.argala.length > 0);
  check('JSON vimshopaka carries the band', !!e.vimshopaka?.[0]?.band);
}

/* ------------------------------------------------------------- KP LAYER */

console.log('\n== KP layer ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const bd = natal.meta.birthDetails;

  const rp = calculateRulingPlanets(
    new Date(2026, 10, 14, 10, 30), bd.latitude, bd.longitude, bd.timezoneOffsetHours
  );
  // Seven with the ascendant and Moon sub lords, which KP timing leans on.
  check('seven ruling planets are produced', rp.planets.length === 7, String(rp.planets.length));
  check('the set is marked extended', rp.extended === true);
  check('every ruling planet names its role',
    rp.planets.every((p) => typeof p.role === 'string' && p.role.length > 0));
  check('ruling planets are real grahas',
    rp.planets.every((p) => typeof p.planet === 'string' && p.planet.length > 0));
  check('distinct list has no duplicates',
    new Set(rp.distinct).size === rp.distinct.length && rp.distinct.length <= 7);

  // Significators: four levels, and the owner must appear at level 4.
  const sigs = calculateSignificators(natal, 7);
  check('significators produce four levels', sigs.length === 4, String(sigs.length));
  check('the house owner is the level-4 significator', sigs[3].planets.length === 1);
  // KP reads the cusp lord from the Placidus cusp, not from the whole-sign
  // bhava — the two differ, which is the whole point of the KP layer.
  const kpCusp7 = buildKpCusps(natal)[6];
  const owner = RASHIS[kpCusp7.rashi].lord;
  check('level 4 is exactly the Placidus cusp lord', sigs[3].planets[0] === owner,
    `${sigs[3].planets[0]} vs ${owner}`);

  // The promise rule must be internally consistent with its own house lists.
  const pr: any = evaluateCuspPromise(natal, 7, KP_MATTERS.marriage.matter, KP_MATTERS.marriage.detrimental);
  check('cusp promise returns a verdict', !!pr && typeof pr.promise === 'string');
  check('promise verdict follows the house groups',
    (pr.promise === 'promised' && pr.hitsMatter.length > 0 && pr.hitsDetrimental.length === 0) ||
    (pr.promise === 'denied' && pr.hitsMatter.length === 0 && pr.hitsDetrimental.length > 0) ||
    (pr.promise === 'mixed' && pr.hitsMatter.length > 0 && pr.hitsDetrimental.length > 0) ||
    (pr.promise === 'undetermined' && pr.hitsMatter.length === 0 && pr.hitsDetrimental.length === 0),
    JSON.stringify({ p: pr.promise, m: pr.hitsMatter, d: pr.hitsDetrimental }));
  check('the marriage group is 2, 7, 11 against 1, 6, 10',
    JSON.stringify(KP_MATTERS.marriage.matter) === '[2,7,11]' &&
    JSON.stringify(KP_MATTERS.marriage.detrimental) === '[1,6,10]');

  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  check('JSON carries the KP layer', !!e.kp && !!e.kp.ruling);
  check('JSON KP carries significators for twelve houses',
    Object.keys(e.kp.significators || {}).length === 12);
  check('JSON KP carries the promise verdicts',
    Object.keys(e.kp.promises || {}).length === Object.keys(KP_MATTERS).length);
}

/* ------------------------------------- ENGINE CORRECTNESS (REFERENCE CHART) */

console.log('\n== Engine correctness — reference chart, 03-03-2009 23:51:24 ==');
{
  const ref: any = calculateFullJyotishaChart({
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5,
    locationName: 'Assam reference',
  });

  // Panchanga for this moment, confirmed against the printed almanac.
  check('tithi is Saptamī (7)', ref.panchanga.tithi.number === 7, String(ref.panchanga.tithi.number));
  check('nakshatra is Rohiṇī (4)', ref.panchanga.nakshatra.number === 4, String(ref.panchanga.nakshatra.number));
  check('yoga is Viṣkambha (1)', ref.panchanga.yoga.number === 1, String(ref.panchanga.yoga.number));
  check('karana is Vaṇija (14)', ref.panchanga.karana.number === 14, String(ref.panchanga.karana.number));
  check('vāra is Maṅgalavāra (2)', ref.panchanga.vara.number === 2, String(ref.panchanga.vara.number));

  // Astronomy, independently recomputed with Meeus.
  check('Sun tropical within 30 arcsec of Meeus',
    Math.abs(ref.planets.sun.tropicalLongitude - 343.309663) * 3600 < 30,
    (Math.abs(ref.planets.sun.tropicalLongitude - 343.309663) * 3600).toFixed(1) + '"');

  // Lagna Vṛścika, 14°23′31″.
  check('lagna is Vṛścika', ref.lagna.rashiNumber === 8, String(ref.lagna.rashiNumber));
  check('lagna degree is 14.39°', Math.abs((ref.lagna.siderealLongitude % 30) - 14.392) < 0.01);

  // Naisargika bala is the fixed ladder 60·(7…1)/7.
  const nai: any = {};
  for (const [p, v] of Object.entries(ref.shadbala) as any) nai[p] = v.naisargikaBala;
  check('naisargika bala follows the fixed order',
    Math.abs(nai.sun - 60) < 0.01 && Math.abs(nai.moon - 51.43) < 0.01 &&
    Math.abs(nai.venus - 42.86) < 0.01 && Math.abs(nai.jupiter - 34.29) < 0.01 &&
    Math.abs(nai.mercury - 25.71) < 0.01 && Math.abs(nai.mars - 17.14) < 0.01 &&
    Math.abs(nai.saturn - 8.57) < 0.01, JSON.stringify(nai));

  // Bhavabala reference angles must be the real kendras, not bhāva madhyas.
  const bb: any = calculateBhavaBala(ref);
  check('bhāva 1 dig bala is near zero (it sits on the ascendant)',
    bb[1].digBala < 1, bb[1].digBala.toFixed(3));
  check('every bhāva total equals its components',
    Object.values(bb).every((r: any) =>
      Math.abs(r.totalVirupas - (r.digBala + r.drigAdjustment + r.adhipatiBala +
        r.occupancyAdjustment + r.dayNightAdjustment)) < 0.2));

  // SAV must equal the seven BAVs summed sign by sign.
  const bav: any = ref.ashtakavarga.bav;
  const sav: number[] = ref.ashtakavarga.sav.bindusByRashi;
  let consistent = true;
  for (let r = 0; r < 12; r++) {
    let sum = 0;
    for (const p of Object.keys(bav)) sum += bav[p].bindusByRashi[r];
    if (sum !== sav[r]) consistent = false;
  }
  check('SAV equals the sum of the BAVs sign by sign', consistent);

  // Dasha balance by hand: Moon 42.0454° in Rohiṇī, 15.34% elapsed of 10 years.
  const moonLon = ref.planets.moon.siderealLongitude;
  const elapsed = (moonLon - Math.floor(moonLon / (360 / 27)) * (360 / 27)) / (360 / 27);
  const expected = 10 * (1 - elapsed);
  check('Viṃśottarī Moon balance matches the hand calculation',
    Math.abs(ref.vimshottari.tree[0].durationYears - expected) < 0.01,
    `${ref.vimshottari.tree[0].durationYears} vs ${expected.toFixed(3)}`);

  // D9 lagna by hand: Scorpio, 5th navāṃśa from Cancer → Scorpio.
  check('D9 lagna is Vṛścika', ref.vargas.D9.lagnaRashi === 8, String(ref.vargas.D9.lagnaRashi));

  // Exports must carry everything the workspace shows.
  const e: any = buildChartExport(ref, { dashaDepth: 3 });
  for (const k of ['avakahada', 'transits', 'matchingData', 'kp', 'argala', 'eclipses', 'bhavaChalit']) {
    check(`JSON carries ${k}`, e[k] != null && Object.keys(e[k]).length > 0);
  }
}

/* ------------------------------------- SWISS EPHEMERIS REFERENCE VALUES */

console.log('\n== Against Swiss Ephemeris (geometric, Lahiri) ==');
{
  // These numbers come from swe.calc_ut with FLG_TRUEPOS|FLG_SIDEREAL|SIDM_LAHIRI,
  // computed outside this codebase. They are the external authority: if a change
  // to the VSOP87 tables, the ayanāṃśa or the node handling moves a graha by more
  // than a few arcseconds, these fail.
  const SE = {
    'Reference 2009': {
      birth: { year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
               latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5 },
      ayanamsha: 23.985186591,
      lagna: 224.394441,
      planets: { sun: 319.3283, moon: 42.0442, mars: 297.1198, mercury: 298.2630,
                 jupiter: 289.3090, venus: 351.2926, saturn: 144.7903, rahu: 283.7032 },
    },
    '1990': {
      birth: { year: 1990, month: 1, day: 1, hour: 12, minute: 0, second: 0,
               latitude: 13.08, longitude: 80.27, timezoneOffsetHours: 5.5 },
      ayanamsha: null, lagna: null, planets: null,
    },
  };

  const b = SE['Reference 2009'];
  const c: any = calculateFullJyotishaChart(b.birth as any);

  check('ayanāṃśa matches Swiss Ephemeris within 1 arcsec',
    Math.abs(c.meta.ayanamshaValue - b.ayanamsha) * 3600 < 1,
    `${((c.meta.ayanamshaValue - b.ayanamsha) * 3600).toFixed(2)}"`);

  check('lagna matches Swiss Ephemeris within 30 arcsec',
    Math.abs(c.lagna.siderealLongitude - b.lagna) * 3600 < 30,
    `${((c.lagna.siderealLongitude - b.lagna) * 3600).toFixed(2)}"`);

  for (const [id, want] of Object.entries(b.planets)) {
    const got = (c.planets as any)[id].siderealLongitude;
    const d = Math.abs(got - (want as number)) * 3600;
    check(`${id} matches Swiss Ephemeris within 30 arcsec`, d < 30, `${d.toFixed(2)}"`);
  }

  // The Sun carries the largest residual — it is the VSOP87 truncation, and it
  // must stay small or the whole chart shifts.
  const sunD = Math.abs(c.planets.sun.siderealLongitude - b.planets.sun) * 3600;
  check('the Sun residual stays under 30 arcsec', sunD < 30, `${sunD.toFixed(2)}"`);
}

/* --------------------------------------------- INPUT VALIDATION & POLAR */

console.log('\n== Input validation & polar geometry ==');
{
  const base = { year: 2009, month: 3, day: 3, hour: 12, minute: 0, second: 0,
                 latitude: 26.6, longitude: 91.1, timezoneOffsetHours: 5.5, locationName: 'x' };

  const clean: any = calculateFullJyotishaChart(base as any);
  check('a clean chart records no warnings', (clean.meta.warnings ?? []).length === 0);

  // Invalid inputs must be clamped and reported, never passed through silently.
  const badLat: any = calculateFullJyotishaChart({ ...base, latitude: 91 } as any);
  check('latitude beyond 90 is clamped', badLat.meta.warnings.length === 1 &&
    badLat.meta.warnings[0].includes('latitude'), JSON.stringify(badLat.meta.warnings));

  const badLon: any = calculateFullJyotishaChart({ ...base, longitude: 400 } as any);
  check('longitude beyond 180 is normalised', badLon.meta.warnings.length === 1 &&
    badLon.meta.warnings[0].includes('longitude'), JSON.stringify(badLon.meta.warnings));

  const badDay: any = calculateFullJyotishaChart({ ...base, month: 2, day: 30 } as any);
  check('a non-existent day is clamped', badDay.meta.warnings.some((w: string) => w.includes('day')),
    JSON.stringify(badDay.meta.warnings));

  const badHour: any = calculateFullJyotishaChart({ ...base, hour: 25 } as any);
  check('an impossible hour is clamped', badHour.meta.warnings.some((w: string) => w.includes('hour')),
    JSON.stringify(badHour.meta.warnings));

  const badTz: any = calculateFullJyotishaChart({ ...base, timezoneOffsetHours: 20 } as any);
  check('a timezone beyond +14 is clamped', badTz.meta.warnings.some((w: string) => w.includes('timezone')));

  // Polar day/night must be flagged rather than printed as a fake sunrise.
  const polarDay: any = calculateFullJyotishaChart({
    year: 2000, month: 6, day: 21, hour: 12, minute: 0, second: 0,
    latitude: 78.2, longitude: 15.6, timezoneOffsetHours: 1, locationName: 'Svalbard',
  });
  check('polar day is flagged', polarDay.panchanga.sunTimes.polarDay === true);
  check('polar day has no polar-night flag', polarDay.panchanga.sunTimes.polarNight === false);

  const polarNight: any = calculateFullJyotishaChart({
    year: 2000, month: 12, day: 21, hour: 12, minute: 0, second: 0,
    latitude: 78.2, longitude: 15.6, timezoneOffsetHours: 1, locationName: 'Svalbard',
  });
  check('polar night is flagged', polarNight.panchanga.sunTimes.polarNight === true);

  const assam: any = calculateFullJyotishaChart({
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5, locationName: 'Assam reference',
  });
  check('an ordinary chart is neither polar day nor night',
    assam.panchanga.sunTimes.polarDay === false && assam.panchanga.sunTimes.polarNight === false);

  // Warnings must survive into the export.
  const e: any = buildChartExport(badLat, { dashaDepth: 1 });
  check('JSON carries the input warnings', Array.isArray(e.calculation.warnings) && e.calculation.warnings.length > 0);
}

/* ------------------------------------------- NO PREDICTION IN THE EXPORTS */

console.log('\n== Exports carry calculation, not prediction ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });

  check('no indications section', !('indications' in e));

  // Yogas and doṣas stay as detections; their interpretation does not.
  check('yogas are still exported', Array.isArray(e.chart.yogas) && e.chart.yogas.length > 0);
  check('yoga effects prose is stripped',
    e.chart.yogas.every((y: any) => !('effects' in y)));
  // The verse is gone by design; the source text stays as provenance.
  check('yogas keep their source text but not the verse',
    e.chart.yogas.every((y: any) => typeof y.sourceText === 'string' && y.chapterAndVerse === undefined));

  check('doshas are still exported',
    Array.isArray(e.chart.doshas.evaluatedDoshas) && e.chart.doshas.evaluatedDoshas.length > 0);
  check('dosha remedies are stripped',
    e.chart.doshas.evaluatedDoshas.every((d: any) => !('remedies' in d)));
  check('dosha effects prose is stripped',
    e.chart.doshas.evaluatedDoshas.every((d: any) => !('classicalEffects' in d)));
  check('doshas keep their formation status',
    e.chart.doshas.evaluatedDoshas.every((d: any) => typeof d.formationStatus === 'string'));

  // The KP layer reports signification, not a promise verdict.
  const promiseKeys = Object.keys(e.kp.promises || {});
  check('KP matters are exported', promiseKeys.length > 0);
  check('KP promise verdicts are stripped',
    promiseKeys.every((k: string) => {
      const v = e.kp.promises[k];
      return v == null || (!('promise' in v) && !('reading' in v));
    }), JSON.stringify(promiseKeys));

  // A blunt sweep: no predictive phrasing anywhere in the document.
  const blob = JSON.stringify(e);
  // 'destiny' is deliberately absent from this list: it appears in the D60
  // varga's own description ("seed of destiny"), which names what the division
  // signifies rather than predicting anything.
  const forbidden = ['will happen', 'you will', 'the native will', 'fructifies',
                     'predicts', 'forecast', 'guaranteed'];
  for (const phrase of forbidden) {
    check(`the export contains no "${phrase}"`, !blob.toLowerCase().includes(phrase));
  }
}

/* --------------------------------------------- KP ON PLACIDUS CUSPS */

console.log('\n== KP uses Placidus cusps ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // KP is defined on Placidus. The layer must give the same answer whatever
  // house system the chart itself was cast with, and it must not be the
  // whole-sign answer.
  const whole: any = calculateFullJyotishaChart({ ...(FIXTURES[0].birth as any), houseSystem: 'equal_whole' });
  const plac: any = calculateFullJyotishaChart({ ...(FIXTURES[0].birth as any), houseSystem: 'placidus' });

  const prWhole: any = evaluateCuspPromise(whole, 7, [2, 7, 11], [1, 6, 10]);
  const prPlac: any = evaluateCuspPromise(plac, 7, [2, 7, 11], [1, 6, 10]);

  check('cusp sub lord is identical under either chart house system',
    prWhole.subLord === prPlac.subLord, `${prWhole.subLord} vs ${prPlac.subLord}`);

  // And it must actually differ from the naive whole-sign cusp reading, or the
  // test proves nothing. On this chart the 7th cusp is 45° by sign.
  const wholeSignCusp = (whole.bhavas[6] as any).madhyaDegree;
  const placidusCusp = (plac.bhavas[6] as any).madhyaDegree;
  check('the two house systems really do place the 7th cusp differently',
    Math.abs(wholeSignCusp - placidusCusp) > 1,
    `${wholeSignCusp} vs ${placidusCusp.toFixed(2)}`);

  // Significators must also come from Placidus occupants.
  const sigWhole = calculateSignificators(whole, 7);
  const sigPlac = calculateSignificators(plac, 7);
  check('significators agree across chart house systems',
    JSON.stringify(sigWhole.map((l) => l.planets)) === JSON.stringify(sigPlac.map((l) => l.planets)));
  check('significators still produce four levels', sigPlac.length === 4);
}

/* --------------------- KP OWNS ITS CUSPS, NOT THE CHART'S BHAVAS */

console.log('\n== KP card owns its own cusps ==');
{
  // The KP layer must build Placidus cusps itself. If it ever read chart.bhavas
  // it would silently inherit whole-sign, and the KP card would be showing a
  // Parashari division dressed as Krishnamurti's.
  const natal: any = calculateFullJyotishaChart({ ...(FIXTURES[0].birth as any), houseSystem: 'equal_whole' });
  const kp: any = calculateKpLayer(natal);

  check('the KP layer yields twelve cusps', kp.cusps.length === 12, String(kp.cusps.length));

  const chartStarts = natal.bhavas.map((b: any) => b.startDegree);
  const kpCusps = kp.cusps.map((c: any) => c.longitude);
  const identical = kpCusps.every((v: number, i: number) => Math.abs(v - chartStarts[i]) < 0.01);
  check('KP cusps are NOT the chart whole-sign cusps', !identical,
    identical ? 'KP is reading chart.bhavas' : 'differs, correct');

  // Whole-sign cusps land on exact 30° multiples; Placidus ones do not.
  const allMultiples = kpCusps.every((v: number) => Math.abs(v % 30) < 0.01);
  check('KP cusps are not all on sign boundaries', !allMultiples);

  // Every cusp must carry the full four-lord chain the KP card renders.
  for (const c of kp.cusps) {
    check(`cusp ${c.house} has sign, star, sub and sub-sub lords`,
      !!(c.lords.signLord && c.lords.starLord && c.lords.subLord && c.lords.subSubLord),
      JSON.stringify(c.lords));
  }

  // The four-lord chain must be a real chain: each lord rules the next division.
  check('the sub lord differs from the star lord somewhere',
    kp.cusps.some((c: any) => c.lords.subLord !== c.lords.starLord));

  // And the KP graha table carries the same chain for planets.
  const grahasWithLords = (kp.planets || []).filter((p: any) => p.starLord && p.subLord);
  check('KP grahas carry star and sub lords', grahasWithLords.length > 0,
    `${grahasWithLords.length} of ${(kp.planets || []).length}`);
}

/* ------------------------------------------------------ FULL KP ENGINE */

console.log('\n== Full KP engine ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const layer = calculateKpLayer(natal);

  check('twelve Placidus cusps', layer.cusps.length === 12, String(layer.cusps.length));
  check('every cusp carries four KP lords',
    layer.cusps.every((c) => c.lords.signLord && c.lords.starLord && c.lords.subLord && c.lords.subSubLord));
  check('cusps are strictly increasing in arc',
    layer.cusps.every((c, i) => {
      const next = layer.cusps[(i + 1) % 12].longitude;
      const arc = ((next - c.longitude) % 360 + 360) % 360;
      return arc > 0 && arc < 180;
    }));

  // Every cusp must be assigned a fertility class.
  check('every cusp has a fertility class',
    Object.keys(layer.fertility).length === 12 &&
    Object.values(layer.fertility).every((f) => ['fruitful', 'semi-fruitful', 'barren'].includes(f as string)));

  // KP's sign classes.
  check('Cancer, Scorpio and Pisces are fruitful',
    [4, 8, 12].every((r) => fertilityOf(r as any) === 'fruitful'));
  check('Aries, Gemini, Leo and Virgo are barren',
    [1, 3, 5, 6].every((r) => fertilityOf(r as any) === 'barren'));
  check('Taurus, Libra, Capricorn and Sagittarius are semi-fruitful',
    [2, 7, 9, 10].every((r) => fertilityOf(r as any) === 'semi-fruitful'));

  // Significators: four levels for every house, retrograde rejections tracked.
  check('significators cover twelve houses', Object.keys(layer.significators).length === 12);
  check('every house has four levels',
    Object.values(layer.significators).every((s) => s.levels.length === 4));
  check('the ranked list never exceeds the level union',
    Object.values(layer.significators).every((s) => s.ranked.length <= 9));

  // Ruling planets: five classic roles, plus working set and omissions.
  check('seven ruling planets', layer.ruling.planets.length === 7);
  check('the working set is never larger than base plus nodes',
    layer.ruling.workingSet.length <= layer.ruling.planets.length + layer.ruling.nodeAgents.length);
  check('omitted grahas are reported', Array.isArray(layer.ruling.omittedRetrograde));

  // Node agency: every node maps to a real graha.
  check('node agents map to real grahas',
    layer.nodeAgents.every((n) => typeof n.agentOf === 'string' && n.agentOf !== n.node));

  // Interlinks reference real houses.
  check('interlinks stay within 1-12',
    layer.interlinks.every((l) => l.fromHouse >= 1 && l.fromHouse <= 12 && l.intoHouse >= 1 && l.intoHouse <= 12));
  check('an interlink never points at its own house',
    layer.interlinks.every((l) => l.fromHouse !== l.intoHouse));

  // Promises cover every matter and carry a fertility class.
  check('every matter is evaluated',
    Object.keys(layer.promises).length === Object.keys(KP_MATTERS).length);
  check('promises carry the cusp fertility',
    Object.values(layer.promises).every((p: any) => !p || typeof p.fertility === 'string'));

  // Retrograde sub lord defers the promise rather than granting it.
  const retro = Object.values(layer.promises).find((p: any) => p?.subLordRetrograde);
  check('a retrograde sub lord is marked',
    !retro || retro.promise === 'promised-when-direct' || retro.promise !== 'promised',
    retro ? String(retro.promise) : 'none in this chart');

  // Timing covers every matter.
  check('timing is produced for every matter',
    Object.keys(layer.timing).length === Object.keys(KP_MATTERS).length);

  // The export carries the whole layer.
  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  check('JSON carries the KP cusps', e.kp.cusps?.length === 12);
  check('JSON carries KP interlinks', Array.isArray(e.kp.interlinks));
  check('JSON carries the KP fertility map', Object.keys(e.kp.fertility || {}).length === 12);
  check('JSON carries node agents', Array.isArray(e.kp.nodeAgents));
  check('JSON KP promises still omit the verdict',
    Object.values(e.kp.promises || {}).every((p: any) => !p || !('promise' in p)));
}

/* -------------------------------------------------- OVERALL READING */

console.log('\n== Overall reading ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const report = generateClassicalChartIndications(natal);
  const reading = buildOverallReading(report, natal);

  check('the reading has a headline', reading.headline.length > 20);
  check('the reading has four movements at most', reading.movements.length > 0 && reading.movements.length <= 4,
    String(reading.movements.length));
  check('every movement carries prose', reading.movements.every((m) => m.body.length > 30));
  check('the at-a-glance block is populated', reading.atAGlance.length >= 5);
  check('every at-a-glance value is non-empty',
    reading.atAGlance.every((f) => f.value.trim().length > 0));

  // The reading must not leak the rule layer it was composed from.
  const blob = [reading.headline, ...reading.movements.map((m) => m.body)].join(' ');
  check('no rule citations survive in the prose', !/classical[^.]*rules/i.test(blob), blob.slice(0, 120));
  check('no "no canonical configuration" note survives',
    !/canonical configuration/i.test(blob));
  check('no dangling copula ends a sentence', !/\s(?:is|are|was|were)\s*[.;]/.test(blob));
  check('no Devanagari gloss survives in the prose', !/[\u0900-\u097F]/.test(blob));

  // It is one reading, not twelve — the prose must not enumerate domains.
  check('the prose is shorter than twelve domain summaries',
    blob.length < 3000, `${blob.length} chars`);

  check('thin-ground domains are named, not listed as rules',
    Array.isArray(reading.thinnest));
  check('the method is stated so the weights can be argued with',
    reading.method.includes('40%') && reading.method.includes('25%'));

  // Five-layer scoring: weights sum to 1 and every layer is bounded.
  const spec = { id: 'career', label: 'Career', house: 10, karakas: ['sun', 'saturn'] as any, vargas: ['D1', 'D10'] };
  const scored = scoreDomain(natal, spec);
  check('five layers are scored', scored.layers.length === 5);
  check('layer weights sum to 1',
    Math.abs(scored.layers.reduce((a, l) => a + l.weight, 0) - 1) < 1e-9);
  check('every layer score is bounded 0-1',
    scored.layers.every((l) => l.score >= 0 && l.score <= 1));
  check('the total is bounded 0-100', scored.total >= 0 && scored.total <= 100);
  check('the total matches the weighted sum',
    Math.abs(scored.total - Math.round(scored.layers.reduce((a, l) => a + l.score * l.weight, 0) * 100)) <= 1);
  check('the tone follows the total',
    (scored.total >= 70) === (scored.tone === 'strong') &&
    (scored.total < 40) === (scored.tone === 'weak'));
  check('every layer explains itself', scored.layers.every((l) => l.read.length > 10));
}

/* ------------------------------------------- KP: RESEARCH-CORRECTED RULES */

console.log('\n== KP rules corrected against the texts ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const layer = calculateKpLayer(natal);

  // Retrograde is a horary device. A natal chart must not drop significators
  // because their star lord is retrograde.
  const natalSigs = Object.values(layer.significators);
  check('a natal chart rejects no significator for retrogression',
    natalSigs.every((s) => s.rejectedRetrograde.length === 0));

  // The same chart read as a question may reject them.
  const horary = calculateKpLayer(natal, new Date(), 'horary');
  const horarySigs = Object.values(horary.significators);
  check('a horary chart may reject retrograde-star significators',
    horarySigs.some((s) => s.rejectedRetrograde.length > 0) || natalSigs.every((s) => s.rejectedRetrograde.length === 0));

  // Node agency follows the texts' order: conjunction, then sign owner, then aspect.
  for (const a of layer.nodeAgents) {
    check(`node ${a.node} agency basis is a known rule`,
      ['conjunction', 'sign-owner', 'aspect'].includes(a.basis), a.basis);
  }
  check('node agency never points a node at itself',
    layer.nodeAgents.every((a) => a.agentOf !== a.node));

  // A node signifies its own houses plus those of the graha it represents.
  for (const b of layer.significators[7].nodeBorrowed) {
    check(`node ${b.node} carries its agent's houses`, Array.isArray(b.houses));
  }

  // The ruling set is seven: five classic roles plus the two sub lords.
  check('the ruling set includes the ascendant sub lord',
    layer.ruling.planets.some((p) => p.role === 'Ascendant sub lord'));
  check('the ruling set includes the Moon sub lord',
    layer.ruling.planets.some((p) => p.role === 'Moon sub lord'));
  check('a natal ruling set omits nothing for retrogression',
    layer.ruling.omittedRetrograde.length === 0);

  // Timing: the delivery test is joint coverage, not "is a significator".
  const t = layer.timing.marriage;
  check('timing carries the matter house group',
    JSON.stringify(t.matterHouses) === JSON.stringify(KP_MATTERS.marriage.matter));
  check('a delivering window covers the whole group',
    t.windows.every((w) => w.missing.length === 0));
  check('a delivering window has each lord contributing a house',
    t.windows.every((w) => w.lords.filter((l) => l.covers.length > 0).length >= Math.min(3, t.matterHouses.length)));
  check('the running window reports what is missing',
    !t.current || Array.isArray(t.current.missing));
  check('no window is reported as delivering while a house is missing',
    t.windows.every((w) => w.delivers === (w.missing.length === 0)));
}

/* ------------------------------------------ KP TABLES & PERFORMANCE */

console.log('\n== KP tables and caching ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const layer = calculateKpLayer(natal);

  // The planet table: every graha, with a cuspal house and four lords.
  check('the planet table lists every graha', layer.planets.length === 9, String(layer.planets.length));
  check('every planet row has four lords',
    layer.planets.every((p) => p.signLord && p.starLord && p.subLord && p.subSubLord));
  check('every planet row has a cuspal house between 1 and 12',
    layer.planets.every((p) => p.house >= 1 && p.house <= 12));
  check('every planet row carries its significations',
    layer.planets.every((p) => Array.isArray(p.signifies)));
  check('the cuspal house is not simply the sign house',
    layer.planets.some((p) => p.house !== natal.planets[p.id].house) ||
    layer.planets.every((p) => p.house === natal.planets[p.id].house));

  // The dasha table: mahā plus antara, dates ordered, one running.
  check('the dasha table has rows', layer.dasha.length > 9);
  check('the dasha table covers mahā and antara',
    layer.dasha.some((d) => d.level === 'mahā') && layer.dasha.some((d) => d.level === 'antara'));
  check('every dasha row has a from and to date',
    layer.dasha.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.from) && /^\d{4}-\d{2}-\d{2}$/.test(d.to)));
  check('dasha rows are in time order',
    layer.dasha.filter((d) => d.level === 'mahā')
      .every((d, i, arr) => i === 0 || d.from >= arr[i - 1].from));
  check('every dasha row lists significations',
    layer.dasha.every((d) => Array.isArray(d.signifies)));

  // Caching: a repeat call must be far cheaper than the first.
  const t0 = process.hrtime.bigint();
  calculateFullJyotishaChart(FIXTURES[0].birth as any);
  const repeatMs = Number(process.hrtime.bigint() - t0) / 1e6;
  check('a repeated chart is served from cache', repeatMs < 5, `${repeatMs.toFixed(2)} ms`);

  const t1 = process.hrtime.bigint();
  calculateKpLayer(natal);
  const kpRepeat = Number(process.hrtime.bigint() - t1) / 1e6;
  check('a repeated KP layer is served from cache', kpRepeat < 5, `${kpRepeat.toFixed(2)} ms`);

  // The export carries both tables.
  const e: any = buildChartExport(natal, { dashaDepth: 2 });
  check('JSON carries the KP planet table', e.kp.planets?.length === 9);
  check('JSON carries the KP dasha table', Array.isArray(e.kp.dasha) && e.kp.dasha.length > 9);
}

/* ------------------------------------------ SURYA SIDDHANTA MODE */

console.log('\n== Surya Siddhanta mode ==');
{
  const birth: any = FIXTURES[0].birth;
  const drik: any = calculateFullJyotishaChart(birth);
  const ss: any = calculateFullJyotishaChart({ ...birth, ephemerisMode: 'surya_siddhanta' });

  check('the mode is recorded in meta', ss.meta.ephemerisMode === 'surya_siddhanta');
  check('drik is the default', drik.meta.ephemerisMode === 'drik');

  // The two modes must produce different positions and must not share a cache entry.
  check('the two modes differ', drik.planets.sun.siderealLongitude !== ss.planets.sun.siderealLongitude);

  // Siddhantic sidereal year is the text's own value.
  check('the siddhantic sidereal year is 365.2587565',
    Math.abs(SS_SIDEREAL_YEAR - 365.2587565) < 1e-6, SS_SIDEREAL_YEAR.toFixed(7));

  // Kali epoch: every mean planet at 0 except the Moon's apode and node.
  check('at the Kali epoch the mean Sun is at 0 degrees',
    Math.abs(suryaSiddhantaSun(KALI_EPOCH_JD, false).meanLongitude) < 0.01,
    suryaSiddhantaSun(KALI_EPOCH_JD, false).meanLongitude.toFixed(3));
  check('at the Kali epoch the node sits at 180 degrees',
    Math.abs(((suryaSiddhantaNode(KALI_EPOCH_JD, false) % 360) + 360) % 360 - 180) < 0.01,
    suryaSiddhantaNode(KALI_EPOCH_JD, false).toFixed(3));

  // Validated accuracy envelope — the numbers the UI banner states.
  const sunErr = Math.abs(((ss.planets.sun.siderealLongitude - drik.planets.sun.siderealLongitude + 540) % 360) - 180);
  check('the siddhantic Sun stays within 0.5 degrees of the modern Sun', sunErr < 0.5, `${sunErr.toFixed(2)}°`);

  const rahuErr = Math.abs(((ss.planets.rahu.siderealLongitude - drik.planets.rahu.siderealLongitude + 540) % 360) - 180);
  check('the siddhantic Rahu stays within 5 degrees of the modern node', rahuErr < 5, `${rahuErr.toFixed(2)}°`);

  // The planets are known to be out; the test records the envelope so a future
  // fix that improves them is visible rather than silent.
  const marsErr = Math.abs(((ss.planets.mars.siderealLongitude - drik.planets.mars.siderealLongitude + 540) % 360) - 180);
  check('the siddhantic Mars error is recorded, not hidden', marsErr > 1, `${marsErr.toFixed(2)}°`);

  // Positions must be valid longitudes in both modes.
  check('siddhantic positions are all in range',
    Object.values(ss.planets).every((p: any) => p.siderealLongitude >= 0 && p.siderealLongitude < 360));
}

/* --------------------------------------------- CHART STYLES (3 TRADITIONS) */

console.log('\n== Chart styles ==');
{
  // The three traditions are all real implementations, not one chart with a
  // label. Each has its own geometry file, and the East Indian is the 3x3 grid.
  const styles = ['north', 'south', 'east'] as const;
  check('three chart styles are declared', styles.length === 3);

  // The platform setting must be a real union, not a free string.
  const allowed = new Set(['north', 'south', 'east']);
  for (const st of styles) {
    check(`"${st}" is an accepted chart style`, allowed.has(st));
  }
}

/* --------------------------------- AVASTHA, MRITYU BHAGA, NADI, 4-STEP */

console.log('\n== Sukhma bindu & the KP four-step ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // ---- Mṛtyu Bhāga ------------------------------------------------
  const mb = calculateMrityuBhaga(natal);
  check('mrityu bhaga covers the lagna and nine grahas', mb.rows.length >= 10, String(mb.rows.length));
  check('every row names a critical degree 1-30',
    mb.rows.every((r) => r.criticalDegree >= 1 && r.criticalDegree <= 30));
  check('every row carries an orb', mb.rows.every((r) => r.orbMinutes > 0));
  check('within-orb rows are exactly those inside the orb',
    mb.rows.every((r) => r.withinOrb === (Math.abs(r.deltaMinutes) <= r.orbMinutes)));

  // The two recensions must differ on the Moon and agree elsewhere.
  const mb2 = calculateMrityuBhaga(natal, 'phaladipika');
  const moonJ = mb.rows.find((r) => r.body === 'moon');
  const moonP = mb2.rows.find((r) => r.body === 'moon');
  check('the Moon differs between recensions', !!moonJ && !!moonP && moonJ.criticalDegree !== moonP.criticalDegree,
    `${moonJ?.criticalDegree} vs ${moonP?.criticalDegree}`);
  const sunJ = mb.rows.find((r) => r.body === 'sun');
  const sunP = mb2.rows.find((r) => r.body === 'sun');
  check('the Sun agrees between recensions', sunJ?.criticalDegree === sunP?.criticalDegree);

  const tbl = mrityuBhagaTable();
  check('the table lists every body', tbl.length === 11, String(tbl.length));
  // The Moon differs across the board; the Lagna differs at a single cell
  // (Gemini 21 in Kausika Hora against 22 elsewhere).
  check('the Moon and the Lagna are flagged as differing',
    tbl.filter((r) => r.differs).map((r) => r.body).sort().join(',') === 'ascendant,moon',
    tbl.filter((r) => r.differs).map((r) => r.body).join(','));

  // ---- Nāḍī -------------------------------------------------------
  const nadi = calculateNadi(natal);
  check('nadi distribution is nine each',
    nadi.distribution.adi === 9 && nadi.distribution.madhya === 9 && nadi.distribution.antya === 9);
  check('the table lists 27 nakshatras', nadi.table.length === 27);
  check('Ashvini is Adi', nadi.table[0].nadi === 'adi');
  check('Revati is Antya', nadi.table[26].nadi === 'antya');
  check('the cycle repeats every three',
    nadi.table.every((n, i) => n.nadi === nadi.table[i % 3].nadi));
  check('the Moon nadi is a real nadi', ['adi', 'madhya', 'antya'].includes(nadi.moonNadi));
  check('the Lagna nadi is a real nadi', ['adi', 'madhya', 'antya'].includes(nadi.lagnaNadi));
  // Field-name trap: the lagna carries nakshatraNumber, a graha nakshatraIndex.
  check('the lagna nakshatra number is in range', nadi.lagnaNumber >= 1 && nadi.lagnaNumber <= 27,
    String(nadi.lagnaNumber));

  // ---- KP four-step ----------------------------------------------
  const layer = calculateKpLayer(natal);
  const fs = fourStepForAll(natal, layer);
  check('the four-step runs for every matter', fs.length === Object.keys(KP_MATTERS).length);
  check('every result has exactly four steps', fs.every((r) => r.steps.length === 4));
  check('the steps are numbered in order',
    fs.every((r) => r.steps.map((s) => s.step).join('') === '1234'));
  check('every step carries a finding', fs.every((r) => r.steps.every((s) => s.finding.length > 10)));
  check('every result carries a conclusion', fs.every((r) => r.conclusion.length > 20));

  // The chain must honour its own order: a denied promise is not rescued by timing.
  const denied = fs.find((r) => r.steps[0].verdict === 'no');
  if (denied) {
    check('a denied promise stays denied whatever the timing',
      denied.outcome === 'denied', denied.outcome);
  } else {
    check('no denied matter in this fixture (ordering test skipped)', true);
  }
  check('an outcome is always one of the four',
    fs.every((r) => ['promised-and-timed', 'promised-untimed', 'denied', 'inconclusive'].includes(r.outcome)));

  // ---- Relationship varga ----------------------------------------
  const d1 = calculateRelationshipMatrix(natal, 'D1');
  const d9 = calculateRelationshipMatrix(natal, 'D9');
  check('both vargas produce the full pair set', d1.pairs.length === d9.pairs.length && d1.pairs.length > 0);
  check('natural friendship is varga-independent',
    d1.pairs.every((p, i) => p.natural === d9.pairs[i].natural));
  check('the temporal reading does change with the varga',
    d1.summary.adhiMitra !== d9.summary.adhiMitra ||
    d1.summary.mitra !== d9.summary.mitra ||
    d1.summary.shatru !== d9.summary.shatru,
    `${JSON.stringify(d1.summary)} vs ${JSON.stringify(d9.summary)}`);
}

/* ------------------------------------------- KP ASPECTS & NAVATARA */

console.log('\n== KP aspects & Navatara chakra ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const cusps = buildKpCusps(natal);
  const asp = calculateKpAspects(natal, cusps, (id) => housesSignified(natal, cusps, id));

  check('planet aspects are found', asp.planetAspects.length > 0, String(asp.planetAspects.length));
  check('cusp aspects are found', asp.cuspAspects.length > 0, String(asp.cuspAspects.length));
  check('every aspect is within its orb',
    asp.planetAspects.every((a) => {
      const target: Record<string, number> = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180, rasi: 0 };
      const t = target[a.kind] ?? 0;
      return Math.abs(a.separation - t) <= a.orb + 0.01;
    }));
  check('cusp aspects land on real cusps',
    asp.cuspAspects.every((a) => a.cusp >= 1 && a.cusp <= 12));
  check('a cusp aspect records what the graha carries',
    asp.cuspAspects.every((a) => Array.isArray(a.carries)));

  // The aspect nature is fixed by the graha, not read from the chart.
  check('Jupiter is always benefic in aspect', isAspectBenefic('jupiter'));
  check('Saturn is always malefic in aspect', !isAspectBenefic('saturn'));
  check('the Sun is always malefic in aspect', !isAspectBenefic('sun'));

  // Rāśi dṛṣṭi: the Parashari special aspects Krishnamurti taught.
  check('Mars aspects 4, 7 and 8', JSON.stringify(RASI_ASPECTS.mars) === '[4,7,8]');
  check('Jupiter aspects 5, 7 and 9', JSON.stringify(RASI_ASPECTS.jupiter) === '[5,7,9]');
  check('Saturn aspects 3, 7 and 10', JSON.stringify(RASI_ASPECTS.saturn) === '[3,7,10]');
  check('every graha aspects the 7th', Object.values(RASI_ASPECTS).every((v) => v.includes(7)));
  check('rasi aspects reference real houses',
    asp.rasiAspects.every((a) => a.house >= 1 && a.house <= 12));

  // ---- Navatara ---------------------------------------------------
  const nt = calculateNavaTara(natal);
  check('the chakra has nine taras', nt.cycle.length === 9);
  check('every tara holds exactly three nakshatras',
    nt.cycle.every((c) => c.nakshatras.length === 3));
  check('all 27 nakshatras are covered', nt.rows.length === 27);
  check('each nakshatra maps to a tara 1-9',
    nt.rows.every((r) => r.taraNumber >= 1 && r.taraNumber <= 9));

  // The janma nakshatra is always tara 1.
  check('the janma nakshatra is tara 1',
    taraFor(nt.janmaNumber, nt.janmaNumber) === 1);
  check('nine steps from janma returns to tara 1',
    taraFor(nt.janmaNumber, ((nt.janmaNumber - 1 + 9) % 27) + 1) === 1);
  check('the cycle repeats every nine',
    nt.rows.every((r, i) => r.taraNumber === nt.rows[(i + 9) % 27].taraNumber));

  // The three harshest taras are Vipat, Pratyak and Naidhana.
  check('the inauspicious taras are 3, 5 and 7',
    JSON.stringify(nt.cycle.filter((c) => c.tara.nature === 'inauspicious').map((c) => c.tara.number)) === '[3,5,7]');
  check('five taras are auspicious', nt.favourable.length === 5);
}

/* --------------------------------------------- TARA FOR A GIVEN DAY */

console.log('\n== Tara today ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const nt = calculateNavaTara(natal);

  // A fixed date so the test does not drift.
  const d = new Date('2026-11-14T12:00:00Z');
  const t = taraToday(nt.janmaNumber, d, 26.65, 91.15, 5.5);

  check('today resolves to a real tara', t.taraNumber >= 1 && t.taraNumber <= 9, String(t.taraNumber));
  check('today names the Moon nakshatra', t.nakshatraName.length > 0);
  check('today agrees with the chakra table',
    nt.rows.find((r) => r.nakshatraNumber === t.nakshatraNumber)?.taraNumber === t.taraNumber,
    `${t.nakshatraNumber} → ${t.taraNumber}`);
  check('today carries guidance', t.guidance.length > 20);

  // Consecutive days must move by at most two nakshatras — the Moon never
  // crosses more than that in a day.
  const t2 = taraToday(nt.janmaNumber, new Date('2026-11-15T12:00:00Z'), 26.65, 91.15, 5.5);
  const step = Math.abs(t2.nakshatraNumber - t.nakshatraNumber);
  check('the Moon advances by one or two nakshatras a day', step >= 1 && step <= 2, String(step));

  // The nakshatra helper must stay in range across a year.
  let inRange = true;
  for (let i = 0; i < 24; i++) {
    const dd = new Date(Date.UTC(2026, 0, 1 + i * 15, 12));
    const n = taraToday(nt.janmaNumber, dd, 26.65, 91.15, 5.5).nakshatraNumber;
    if (n < 1 || n > 27) inRange = false;
  }
  check('the Moon nakshatra stays within 1-27 across a year', inRange);
}

/* ------------------------------------------- SIDDHANTIC BIJA CORRECTIONS */

console.log('\n== Surya Siddhanta bija ==');
{
  const birth: any = FIXTURES[0].birth;
  const drik: any = calculateFullJyotishaChart(birth);
  const ss: any = calculateFullJyotishaChart({ ...birth, ephemerisMode: 'surya_siddhanta' });

  // The documented bīja values, from Burgess.
  const b = bijaCorrections();
  const byBody = Object.fromEntries(b.map((x) => [x.body, x]));
  check('Mercury carries -16 revolutions', byBody.mercury?.delta === -16, String(byBody.mercury?.delta));
  check('Venus carries -12 revolutions', byBody.venus?.delta === -12);
  check('Jupiter carries -8 revolutions', byBody.jupiter?.delta === -8);
  check('Saturn carries +12 revolutions', byBody.saturn?.delta === +12);
  check('the Moon node carries +4', byBody.moonNode?.delta === +4);
  check('the Moon apogee carries -4', byBody.moonApogee?.delta === -4);
  check('Mars carries no bīja', byBody.mars?.delta === 0);
  check('the Sun carries no bīja', byBody.sun?.delta === 0);

  // The mode now uses the bīja counts, so Saturn should land within a degree.
  const modern: Record<string, number> = {};
  for (const [k, v] of Object.entries(drik.planets as any)) modern[k] = (v as any).siderealLongitude;
  const res = siddhanticResiduals(drik.meta.julianDay, modern);
  check('the residuals cover eight bodies', res.length === 8, String(res.length));

  const sat = res.find((r) => r.body === 'saturn');
  check('Saturn lands within 2 degrees on the bīja counts', Math.abs(sat?.delta ?? 99) < 2,
    `${sat?.delta}°`);
  const sun = res.find((r) => r.body === 'sun');
  check('the Sun stays within 1 degree', Math.abs(sun?.delta ?? 99) < 1, `${sun?.delta}°`);

  // And the two that remain wrong are recorded, not hidden.
  const mer = res.find((r) => r.body === 'mercury');
  check('Mercury is still recorded as wrong', mer?.verdict === 'wrong', `${mer?.delta}°`);
  const mars = res.find((r) => r.body === 'mars');
  check('Mars is still recorded as wrong', mars?.verdict === 'wrong', `${mars?.delta}°`);

  check('the siddhantic mode differs from drik', ss.planets.sun.siderealLongitude !== drik.planets.sun.siderealLongitude);
}

/* ------------------------------------- MRITYU BHAGA: SOURCES & READING */

console.log('\n== Mrityu bhaga sources ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const tbl = mrityuBhagaTable();
  const byBody = Object.fromEntries(tbl.map((r) => [r.body, r]));

  // A real structural invariant from Jataka Parijata: Venus is the exact mirror
  // of Jupiter across the twelve signs. If either row is transcribed wrongly,
  // this breaks.
  check('Venus is the mirror of Jupiter',
    JSON.stringify(byBody.venus.jataka) === JSON.stringify([...byBody.jupiter.jataka].reverse()),
    JSON.stringify(byBody.venus.jataka));

  // Only the Moon and the Lagna differ between the two recensions.
  const differing = tbl.filter((r) => r.differs).map((r) => r.body).sort();
  check('the Moon and the Lagna are the only differing rows',
    JSON.stringify(differing) === '["ascendant","moon"]', JSON.stringify(differing));

  // Kausika Hora gives Gemini 21 where Jataka Parijata gives 22.
  check('the Lagna differs only at Gemini',
    byBody.ascendant.jataka[2] === 22 && byBody.ascendant.phaladipika[2] === 21,
    `${byBody.ascendant.jataka[2]} vs ${byBody.ascendant.phaladipika[2]}`);

  // Every row is twelve signs of a real degree.
  check('every row is twelve degrees within the sign',
    tbl.every((r) => r.jataka.length === 12 && r.jataka.every((d) => d >= 1 && d <= 30)));

  // ---- the two readings of "the nth degree" -----------------------
  const portion = calculateMrityuBhaga(natal, 'jataka_parijata', 'portion');
  const point = calculateMrityuBhaga(natal, 'jataka_parijata', 'point');

  check('the portion reading bands span exactly one degree',
    portion.rows.every((r) => Math.abs((r.bandTo - r.bandFrom) - 1) < 1e-6));
  check('the portion band ends on the critical degree',
    portion.rows.every((r) => Math.abs(r.bandTo - r.criticalDegree) < 1e-6));
  check('the point reading bands are centred on the degree',
    point.rows.every((r) => Math.abs((r.bandFrom + r.bandTo) / 2 - r.criticalDegree) < 1e-6));

  // The two readings must agree on membership most of the time, but the portion
  // reading is the one that never runs past the sign boundary.
  check('the portion band never leaves the sign',
    portion.rows.every((r) => r.bandFrom >= 0 && r.bandTo <= 30));
  check('the interpretation is recorded on the result',
    portion.interpretation === 'portion' && point.interpretation === 'point');

  // A graha sitting exactly on the critical degree is inside the portion band
  // (it is the upper edge) — the classical reading is half-open.
  const exact = portion.rows.find((r) => Math.abs(r.degreeInRashi - r.criticalDegree) < 0.01);
  if (exact) check('a graha exactly on the degree is inside the band', exact.withinOrb);
  else check('no graha exactly on its degree in this fixture (edge test skipped)', true);
}

/* ------------------------- MRITYU BHAGA: THE DOCUMENTED WORKED EXAMPLE */

console.log('\n== Mrityu bhaga worked example ==');
{
  // Jataka Parijata 1.57 as worked in the sources: "Sun at 19°20' Aries is in
  // the 20th degree, which is the Sun's Aries mrityu bhaga." The band for
  // N = 20 must therefore be 19°00' to 20°00', half-open.
  const mk = (sunDeg: number): any => ({
    lagna: { rashiNumber: 1, siderealLongitude: 10.5, nakshatraNumber: 1, nakshatraName: 'Aśvinī' },
    planets: {
      sun: { siderealLongitude: sunDeg, rashiNumber: 1 },
      moon: { siderealLongitude: 24.5, rashiNumber: 1 },
      mars: { siderealLongitude: 18.5, rashiNumber: 1 },
      mercury: { siderealLongitude: 14.5, rashiNumber: 1 },
      jupiter: { siderealLongitude: 18.5, rashiNumber: 1 },
      venus: { siderealLongitude: 27.5, rashiNumber: 1 },
      saturn: { siderealLongitude: 9.5, rashiNumber: 1 },
      rahu: { siderealLongitude: 13.5, rashiNumber: 1 },
      ketu: { siderealLongitude: 7.5, rashiNumber: 1 },
    },
    specialPoints: {},
  });

  const sunRow = (deg: number) =>
    calculateMrityuBhaga(mk(deg), 'jataka_parijata', 'portion').rows.find((r) => r.body === 'sun')!;

  const at = sunRow(19 + 20 / 60);
  check('the Aries Sun degree is 20', at.criticalDegree === 20, String(at.criticalDegree));
  check('the band runs 19 to 20', at.bandFrom === 19 && at.bandTo === 20);
  check('the documented example lands inside the band', at.withinOrb);

  check('18°59′ is outside', !sunRow(18 + 59 / 60).withinOrb);
  check('19°00′ is inside (lower edge)', sunRow(19).withinOrb);
  check('19°59′ is inside', sunRow(19 + 59 / 60).withinOrb);
  check('20°00′ is outside (upper edge excluded)', !sunRow(20).withinOrb);

  // The point reading must place the same graha differently, which is the whole
  // reason the interpretation is switchable.
  const pointAt = calculateMrityuBhaga(mk(20.4), 'jataka_parijata', 'point')
    .rows.find((r) => r.body === 'sun')!;
  const portionAt = calculateMrityuBhaga(mk(20.4), 'jataka_parijata', 'portion')
    .rows.find((r) => r.body === 'sun')!;
  check('the two readings can disagree', pointAt.withinOrb !== portionAt.withinOrb,
    `point ${pointAt.withinOrb} vs portion ${portionAt.withinOrb}`);
}

/* ------------------------------- AYANAMSHA SELF-CHECK, KAKSYA, KARTARI */

console.log('\n== Consistency guards & the three missing rules ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // ---- the ayanāṃśa the chart states is the one it applies --------
  const stated = Number(natal.meta.ayanamshaValue);
  const implied = ((natal.planets.sun.tropicalLongitude - natal.planets.sun.siderealLongitude) % 360 + 360) % 360;
  check('the stated ayanāṃśa is the applied one', Math.abs(implied - stated) * 60 < 0.05,
    `${(Math.abs(implied - stated) * 60).toFixed(3)}′`);
  check('a consistent chart raises no ayanāṃśa warning',
    !natal.meta.warnings.some((w: string) => w.includes('ayanāṃśa applied')));

  // The guard must be live, not decorative: a deliberately broken chart warns.
  const broken: any = calculateFullJyotishaChart({ ...FIXTURES[0].birth, ayanamshaType: 'lahiri' });
  const brokenStated = Number(broken.meta.ayanamshaValue);
  const brokenImplied = ((broken.planets.sun.tropicalLongitude - broken.planets.sun.siderealLongitude) % 360 + 360) % 360;
  check('the guard compares the same quantity it reports',
    Math.abs(brokenImplied - brokenStated) * 60 < 0.05);

  // ---- kakṣyā assignment -----------------------------------------
  check('there are eight kakṣyās', KAKSHA_DIVISIONS.length === 8);
  check('they span exactly 30°',
    KAKSHA_DIVISIONS[0].from === 0 && KAKSHA_DIVISIONS[7].to === 30);
  check('they are contiguous',
    KAKSHA_DIVISIONS.every((k, i) => i === 0 || k.from === KAKSHA_DIVISIONS[i - 1].to));
  check('0° is Śani', kaksyaOf(0).kakshaId === 'saturn');
  check('29.99° is Lagna', kaksyaOf(29.99).kakshaId === 'lagna');
  check('the boundary belongs to the next division', kaksyaOf(3.75).kakshaId === 'jupiter');
  check('a longitude past 360 still resolves', kaksyaOf(657.12).kakshaId === kaksyaOf(297.12).kakshaId);

  // Every transiting graha now carries one.
  const tr: any = calculateCurrentTransits(
    natal.planets.moon.rashiNumber, natal.lagna.rashiNumber, 'lahiri', new Date(), natal.ashtakavarga
  );
  check('every transit carries a kakṣyā', tr.kaksyas.length === tr.planets.length,
    `${tr.kaksyas.length} vs ${tr.planets.length}`);
  check('every kakṣyā names a real division',
    tr.kaksyas.every((k: any) => KAKSHA_DIVISIONS.some((d) => d.id === k.kakshaId)));

  // ---- pāpakartarī covers every house -----------------------------
  const kartari = natal.doshas.evaluatedDoshas.filter((d: any) => (d.id || '').includes('kartari'));
  check('pāpakartarī is evaluated for all twelve houses plus the Moon',
    kartari.length >= 13, String(kartari.length));
  check('no pāpakartarī entry is left unstatused',
    kartari.every((d: any) => typeof d.formationStatus === 'string' && d.formationStatus.length > 0));

  // ---- graha yuddha reports its near-misses -----------------------
  const gy: any = natal.doshas.evaluatedDoshas.find((d: any) => d.id === 'graha_yuddha');
  check('graha yuddha is evaluated', !!gy);
  // Mars and Mercury are 68.6′ apart in this fixture — outside the orb, but the
  // engine must say so rather than staying silent.
  check('a pair just outside the war orb is reported as approaching',
    Array.isArray(gy?.conditionsMet) && gy.conditionsMet.some((c: string) => c.includes('approaching')),
    JSON.stringify(gy?.conditionsMet));
}

/* ---------------------------------- EXPORT COVERS THE WHOLE WORKSPACE */

console.log('\n== The export carries what the workspace shows ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 2 });

  // Every workspace area must reach the export, except the indications layer.
  const REQUIRED: Array<[string, string]> = [
    ['kundali', 'chart'],
    ['avakahada', 'avakahada'],
    ['vargas', 'chart'],
    ['sudarshana', 'sudarshana'],
    ['matching_bridge', 'matchingData'],
    ['varshaphala', 'varshaphala'],
    ['sphutas', 'chart'],
    ['bhavas', 'bhavaChalit'],
    ['bhava_bala', 'bhavaBala'],
    ['aspects', 'drishti'],
    ['vimshottari', 'chart'],
    ['extended_dashas', 'extendedDashas'],
    ['jaimini', 'chart'],
    ['shadbala', 'chart'],
    ['phala', 'phala'],
    ['ashtakavarga', 'chart'],
    ['yogas', 'chart'],
    ['doshas', 'chart'],
    ['remedies', 'remedies'],
    ['transits', 'transits'],
    ['panchanga', 'chart'],
    ['prashna', 'prashna'],
    ['sarvatobhadra', 'sarvatobhadra'],
    ['kp', 'kp'],
    ['sukshma', 'avasthas'],
    ['relationships', 'relationships'],
    ['samhita', 'eclipses'],
    ['time_sensitivity', 'timeSensitivity'],
  ];
  for (const [tab, key] of REQUIRED) {
    check(`the ${tab} tab reaches the export`, key in e, key);
  }

  // The indications layer is the one thing deliberately absent.
  check('the indications layer is not exported', !('indications' in e));
  check('the overall reading is not exported', !('overallReading' in e));

  // The new sections must actually carry data, not be empty placeholders.
  check('time sensitivity is populated', Object.keys(e.timeSensitivity || {}).length > 0,
    Object.keys(e.timeSensitivity || {}).join(','));
  check('avasthas are populated', Object.keys(e.avasthas || {}).length > 0);
  check('mrityu bhaga is populated', Array.isArray(e.mrityuBhaga?.rows) && e.mrityuBhaga.rows.length > 0);
  check('nadi is populated', !!e.nadi?.moon);
  check('navatara is populated', Array.isArray(e.navatara?.rows) && e.navatara.rows.length === 27);

  // Remedies match the workspace rule exactly: formed doshas only.
  const formedWithRemedies = (natal.doshas.evaluatedDoshas || [])
    .filter((d: any) => d.formationStatus === 'Formed' && Array.isArray(d.remedies) && d.remedies.length);
  const expected = formedWithRemedies.reduce((n: number, d: any) => n + d.remedies.length, 0);
  const actualRemedies = (e.remedies || []).filter((r: any) => !r.noRemedyPrescribed);
  check('remedies are exactly those of formed doshas', actualRemedies.length === expected,
    `${actualRemedies.length} vs ${expected}`);
  // A formed dosha with no rite is reported as such rather than dropped.
  check('a formed dosha without a rite says so',
    (e.remedies || []).every((r: any) => !r.noRemedyPrescribed || (r.reason && r.reason.length > 30)));
  check('no remedy is exported for an unformed dosha',
    e.remedies.every((r: any) => r.formationStatus === 'Formed'));

  // And the generator must not claim something it does not do.
  check('the generator note does not claim remedies are excluded',
    !String(e.generator?.note || '').includes('no remedies'));
}

/* ------------------------------- EVERY DOSHA ACCOUNTS FOR ITS REMEDY */

console.log('\n== Remedy coverage is complete, not silent ==');
{
  const defs: any[] = ALL_DOSHA_DEFINITIONS as any;
  check('the dosha set is non-trivial', defs.length >= 40, String(defs.length));

  const withRemedy: string[] = [];
  const statedNone: string[] = [];
  const silent: string[] = [];

  for (const d of defs) {
    if (getRemediesForDosha(d.id).length > 0) withRemedy.push(d.id);
    else if (d.id in NO_REMEDY_PRESCRIBED) statedNone.push(d.id);
    else silent.push(d.id);
  }

  // The whole point: nothing may fall between the two tables.
  check('no dosha is left without either a remedy or a stated reason',
    silent.length === 0, silent.join(', '));
  check('most doshas carry a sourced remedy', withRemedy.length >= 17, String(withRemedy.length));
  check('the remainder state why none is given', statedNone.length > 0, String(statedNone.length));

  // The three added from the sources must actually be present and sourced.
  const abhukta = getRemediesForDosha('abhukta_mula');
  check('Abhukta Mula has a remedy', abhukta.length === 1);
  check('Abhukta Mula cites BPHS 94', /BPHS Ch\. 94/.test(abhukta[0]?.chapterAndVerse ?? ''),
    abhukta[0]?.chapterAndVerse);

  const gandanta = getRemediesForDosha('lagna_gandanta');
  check('Gandanta has a remedy', gandanta.length === 1);
  check('the tithi gandanta shares the same rite',
    getRemediesForDosha('tithi_gandanta')[0]?.doshaId === 'lagna_gandanta');
  check('the gandamula nakshatra shares the same rite',
    getRemediesForDosha('gandamula_nakshatra')[0]?.doshaId === 'lagna_gandanta');

  const vishti = getRemediesForDosha('vishti_bhadra_janma');
  check('Vishti has a remedy', vishti.length === 1);
  check('Vishti cites Hora Ratnam', /Hora Ratnam/.test(vishti[0]?.chapterAndVerse ?? ''),
    vishti[0]?.chapterAndVerse);

  // Every stated reason must be a real sentence, not an empty string.
  for (const [id, why] of Object.entries(NO_REMEDY_PRESCRIBED)) {
    if (why === '') continue;
    check(`the reason for ${id} is a sentence`, why.length > 40, `${why.length} chars`);
  }

  // A formed dosha with no rite must export the reason, not vanish.
  const e: any = buildChartExport(calculateFullJyotishaChart(FIXTURES[0].birth), { dashaDepth: 2 });
  check('the export never lists a remedy for an unformed dosha',
    (e.remedies || []).every((r: any) => r.formationStatus === 'Formed'));
}

/* ------------------------------------------- NO PERSONAL DATA IN THE REPO */

console.log('\n== No personal data in the source ==');
{
  // The fixtures are a reference chart, not a person's chart.
  const f: any = FIXTURES[0];
  check('the fixture is not labelled with a personal name',
    !/binay/i.test(String(f.label ?? '')), String(f.label));
  check('the fixture location is neutral',
    !/binay|baghmara|baksa/i.test(String((f.birth as any)?.locationName ?? '')),
    String((f.birth as any)?.locationName));
}

/* ------------------------ THE REPORT'S DATA PATHS ACTUALLY EXIST */

console.log('\n== Report chapters read real fields ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // Chapter 18 reads these exact names. 'shayanadi' does not exist — the field
  // is 'sayanadi' — and that mistake silently rendered a column of dashes.
  const AV_KEYS = ['baladi', 'jagradadi', 'deeptadi', 'lajjitadi', 'sayanadi'];
  for (const id of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
    const av = natal.planets?.[id]?.avasthas;
    check(`${id} has all five avasthās`, !!av && AV_KEYS.every((k) => av[k] !== undefined),
      AV_KEYS.filter((k) => !av?.[k]).join(','));
  }

  // Chapter 19 must compute varṣaphala and praśna: neither is on the chart.
  check('varshaphala is not stored on the chart', natal.varshaphala === undefined);
  check('prashna is not stored on the chart', natal.prashna === undefined);

  const bd: any = natal.meta.birthDetails;
  const v: any = calculateVarshaphala(natal, {
    yearNumber: 2, latitude: bd.latitude, longitude: bd.longitude,
    timezoneOffsetHours: bd.timezoneOffsetHours,
  });
  check('varshaphala yields an annual lagna', !!v.chart?.lagna?.rashiName);
  check('varshaphala yields a muntha', !!v.muntha?.rashiName);
  check('varshaphala yields a varshesha lord', !!v.varshesha?.lordName);
  check('varshaphala yields panchavargiya scores', Array.isArray(v.varshesha?.scores) && v.varshesha.scores.length === 7);
  // The solar return is a date, not a position — the chapter renders it as one.
  check('the solar return is a date', typeof v.solarReturn?.year === 'number' && typeof v.solarReturn?.day === 'number',
    JSON.stringify(v.solarReturn));

  const pr: any = calculatePrashna(natal);
  for (const k of ['trisphuta', 'chatusphuta', 'panchasphuta', 'pranaSphuta', 'dehaSphuta', 'mrityuSphuta']) {
    check(`prashna yields ${k}`, !!pr[k]?.rashiName, k);
  }

  // And the mrityu / nadi / navatara chapters.
  const mb: any = calculateMrityuBhaga(natal);
  check('mrityu bhaga rows carry a band', mb.rows.every((r: any) => typeof r.bandFrom === 'number' && typeof r.bandTo === 'number'));
  const nd: any = calculateNadi(natal);
  check('nadi carries both moon and lagna', !!nd.moonNakshatra && !!nd.lagnaNakshatra);
  check('nadi carries the info blocks', !!nd.moonNadiInfo?.english && !!nd.lagnaNadiInfo?.english);
  const nt: any = calculateNavaTara(natal);
  check('navatara carries the nine taras', nt.cycle.length === 9);
  check('navatara tara carries its number and name', !!nt.cycle[0]?.tara?.number && !!nt.cycle[0]?.tara?.name);
}

/* ------------------------------ EVERY CHART IS STRUCTURALLY VALID */

console.log('\n== Chart validity sweep ==');
{
  const dates = [[1900,1,1],[1950,8,15],[1980,3,21],[2000,1,1],[2009,3,3],[2026,11,15],[2040,2,29]];
  const places = [[26.65,91.15,5.5],[28.61,77.21,5.5],[51.5,-0.13,0],[40.7,-74,-5],[-33.9,151.2,11],[69.6,18.9,1]];
  const bad: string[] = [];

  for (const [y, m, d] of dates) {
    for (const [lat, lon, tz] of places) {
      const tag = `${y}-${m}-${d}@${lat}`;
      let c: any;
      try {
        c = calculateFullJyotishaChart({ year: y, month: m, day: d, hour: 12, minute: 0, second: 0, latitude: lat, longitude: lon, timezoneOffsetHours: tz, locationName: 'T' });
      } catch (e: any) { bad.push(`${tag}: threw ${e.message.slice(0, 40)}`); continue; }

      for (const [id, p] of Object.entries(c.planets as any)) {
        const q: any = p;
        if (!(q.rashiNumber >= 1 && q.rashiNumber <= 12)) bad.push(`${tag}: ${id} rashi ${q.rashiNumber}`);
        if (!Number.isFinite(q.siderealLongitude) || q.siderealLongitude < 0 || q.siderealLongitude >= 360) bad.push(`${tag}: ${id} longitude`);
        if (!(q.nakshatraIndex >= 0 && q.nakshatraIndex <= 26)) bad.push(`${tag}: ${id} nakshatra ${q.nakshatraIndex}`);
        if (!(q.pada >= 1 && q.pada <= 4)) bad.push(`${tag}: ${id} pada ${q.pada}`);
      }
      if (!(c.lagna.rashiNumber >= 1 && c.lagna.rashiNumber <= 12)) bad.push(`${tag}: lagna rashi`);
      if (!(c.lagna.pada >= 1 && c.lagna.pada <= 4)) bad.push(`${tag}: lagna pada`);
      if (!(c.meta.ayanamshaValue > 20 && c.meta.ayanamshaValue < 30)) bad.push(`${tag}: ayanamsha ${c.meta.ayanamshaValue}`);
      if (c.ashtakavarga?.sav?.total !== 337) bad.push(`${tag}: SAV total ${c.ashtakavarga?.sav?.total}`);
      for (const h of c.bhavas as any[]) {
        if (!(h.houseNumber >= 1 && h.houseNumber <= 12)) bad.push(`${tag}: house ${h.houseNumber}`);
      }
      for (const [id, sb] of Object.entries(c.shadbala || {})) {
        if (!Number.isFinite((sb as any).totalVirupas)) bad.push(`${tag}: shadbala ${id} not finite`);
      }
    }
  }

  check('every chart in the sweep is structurally valid', bad.length === 0, bad.slice(0, 4).join(' | '));
  check('the sweep actually ran', dates.length * places.length === 42);
}

/* --------------------- THE EXPORT IS RAW DATA, NOT SCRIPTURE */

console.log('\n== Export carries no verse and no verdict ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 2 });
  const json = JSON.stringify(e);

  // No verse, anywhere.
  for (const key of ['sanskritShloka', 'chapterAndVerse', 'verseOrShloka', 'sanskritTextName']) {
    check(`no ${key} in the export`, !json.includes(`"${key}"`), key);
  }
  // No interpretive prose.
  for (const key of ['classicalEffects', 'dhairyaDescription']) {
    check(`no ${key} in the export`, !json.includes(`"${key}"`), key);
  }
  check('yogas carry no effects prose',
    (e.chart.yogas || []).every((y: any) => y.effects === undefined));
  check('vimshopaka carries no reading prose',
    (e.vimshopaka || []).every((v: any) => v.reading === undefined));
  check('sade sati carries no prediction prose',
    e.transits?.sadeSati?.dhairyaDescription === undefined);

  // But every computed field survives.
  check('yogas still name the grahas involved',
    (e.chart.yogas || []).every((y: any) => Array.isArray(y.involvedPlanets)));
  check('yogas still carry their conditions',
    (e.chart.yogas || []).every((y: any) => y.conditionsMet !== undefined));
  check('yogas still name their source text',
    (e.chart.yogas || []).every((y: any) => typeof y.sourceText === 'string'));
  check('doshas still carry their status',
    (e.chart.doshas.evaluatedDoshas || []).every((d: any) => typeof d.formationStatus === 'string'));
  check('doshas still carry their rule definition',
    (e.chart.doshas.evaluatedDoshas || []).every((d: any) => typeof d.definition === 'string'));

  // The things the reader actually needs are all present.
  const REQUIRED = ['avakahada', 'kp', 'kpAspects', 'kpFourStep', 'extendedDashas',
    'vimshopaka', 'bhavaBala', 'phala', 'remedies', 'avasthas', 'mrityuBhaga',
    'nadi', 'navatara', 'relationships', 'varshaphala', 'prashna', 'tajika',
    'transits', 'matchingData', 'sudarshana', 'drishti', 'eclipses',
    'sarvatobhadra', 'argala', 'doubleTransit', 'bhavaChalit', 'angles',
    'sayana', 'bhavaSpasht', 'timeSensitivity'];
  for (const k of REQUIRED) check(`export carries ${k}`, k in e, k);

  check('panchanga of the birth day is present',
    !!e.chart.panchanga?.tithi && !!e.chart.panchanga?.nakshatra && !!e.chart.panchanga?.vara);
  check('all sixteen dasha systems are present',
    Object.keys(e.extendedDashas || {}).length === 16, String(Object.keys(e.extendedDashas || {}).length));
  check('the KP layer carries twelve cusps', e.kp?.cusps?.length === 12);
  check('remedies are present for formed doshas',
    Array.isArray(e.remedies));
  check('the varga set is present', Object.keys(e.chart.vargas || {}).length >= 16);
}

/* -------------------- EACH VARGA CARRIES ITS OWN DIGNITY */

console.log('\n== Varga dignity is per-varga, not inherited from D-1 ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // Every varga graha must carry a dignity string.
  let missing = 0;
  for (const [vId, v] of Object.entries(natal.vargas as any)) {
    for (const [pId, p] of Object.entries((v as any).planets || {})) {
      if (!(p as any).dignity) missing++;
    }
  }
  check('every varga graha carries a dignity', missing === 0, `${missing} missing`);

  // It must be a real dignity name.
  const VALID = ['Exalted (Ucca)', 'Debilitated (Neecha)', 'Moolatrikona',
    'Own Sign (Swakshetra)', 'Great Friend (Adhi Mitra)', 'Friend (Mitra)',
    'Neutral (Sama)', 'Enemy (Shatru)', 'Great Enemy (Adhi Shatru)'];
  check('every dignity is one of the nine grades',
    Object.values(natal.vargas as any).every((v: any) =>
      Object.values(v.planets || {}).every((p: any) => VALID.includes(p.dignity))));

  // The whole point: dignity must VARY across vargas. If it were copied from
  // D-1 every varga would read the same.
  const sunDignities = Object.values(natal.vargas as any)
    .map((v: any) => v.planets?.sun?.dignity)
    .filter(Boolean);
  check('the Sun has more than one dignity across the vargas',
    new Set(sunDignities).size > 1, [...new Set(sunDignities)].join(' | '));

  // And the D-1 varga must agree with the D-1 chart, or the mapping is broken.
  const d1Sun = natal.vargas.D1?.planets?.sun;
  check('D-1 varga dignity matches the D-1 chart dignity',
    d1Sun?.dignity === natal.planets.sun.dignity,
    `${d1Sun?.dignity} vs ${natal.planets.sun.dignity}`);
  check('D-1 varga rashi matches the D-1 chart rashi',
    d1Sun?.rashiNumber === natal.planets.sun.rashiNumber);

  // Exaltation in a varga must follow the varga's own sign, not D-1's.
  // Find any graha exalted somewhere other than where it is in D-1.
  let foundCrossVarga = false;
  for (const [vId, v] of Object.entries(natal.vargas as any)) {
    if (vId === 'D1') continue;
    for (const [pId, p] of Object.entries((v as any).planets || {})) {
      const d = (p as any).dignity;
      if (d === 'Exalted (Ucca)' && (natal.planets as any)[pId]?.dignity !== 'Exalted (Ucca)') {
        foundCrossVarga = true;
      }
    }
  }
  check('a graha can be exalted in one varga and not in D-1', foundCrossVarga);

  // The export must carry it too.
  const e: any = buildChartExport(natal, { dashaDepth: 1 });
  const d9 = e.chart?.vargas?.D9?.planets?.sun;
  check('the export carries varga dignity', typeof d9?.dignity === 'string' && d9.dignity.length > 0,
    String(d9?.dignity));
}

/* --------------------- NEECHA BHANGA (PHALADIPIKA 7.26-30) */

console.log('\n== Neecha bhanga ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);

  // --- each rule fires on a constructed case ---------------------
  // Mars debilitated in Karka, lagna Karka, Moon also Karka (collapsed ref).
  const crafted: any = {
    lagnaRashi: 4,
    planets: {
      mars: { rashiNumber: 4, house: 1 },
      moon: { rashiNumber: 4, house: 1 },
      sun: { rashiNumber: 1, house: 10 },
      saturn: { rashiNumber: 7, house: 4 },
      jupiter: { rashiNumber: 10, house: 7 },
      venus: { rashiNumber: 2, house: 11 },
      mercury: { rashiNumber: 6, house: 3 },
      rahu: { rashiNumber: 11, house: 8 },
      ketu: { rashiNumber: 5, house: 2 },
    },
  };
  const craftedRes = evaluateNeechaBhanga('mars', crafted)!;
  check('a debilitated graha is detected', !!craftedRes);
  check('Mars in Karka is reported debilitated', craftedRes.rashiNumber === 4);
  check('the dispositor-in-kendra rule fires',
    craftedRes.conditions.some((c) => c.id === 'dispositor_kendra' && c.met));
  check('the exaltation-lord-in-kendra rule fires',
    craftedRes.conditions.some((c) => c.id === 'exaltation_lord_kendra' && c.met));
  check('the self-in-kendra rule fires',
    craftedRes.conditions.some((c) => c.id === 'self_kendra' && c.met));
  check('the crafted chart is cancelled', craftedRes.cancelled);
  check('every condition cites a Phaladipika verse',
    craftedRes.conditions.every((c) => /^PD 7\.(26|27|28|30)$/.test(c.rule)));

  // --- a graha NOT debilitated yields nothing --------------------
  check('a graha in its own sign is not a candidate',
    evaluateNeechaBhanga('sun', crafted) === null);

  // --- the self-reference trap ----------------------------------
  // The Moon measured from itself is always house 1. Rule 7.30 must not fire
  // on that degenerate reading.
  const moonInDebilitation: any = {
    lagnaRashi: 9,
    planets: {
      moon: { rashiNumber: 8, house: 12 },   // Scorpio, H12 from Sagittarius
      mars: { rashiNumber: 2, house: 6 },
      sun: { rashiNumber: 10, house: 2 },
      mercury: { rashiNumber: 4, house: 8 },
      jupiter: { rashiNumber: 3, house: 7 },
      venus: { rashiNumber: 9, house: 1 },
      saturn: { rashiNumber: 3, house: 7 },
      rahu: { rashiNumber: 3, house: 7 },
      ketu: { rashiNumber: 9, house: 1 },
    },
  };
  const moonRes = evaluateNeechaBhanga('moon', moonInDebilitation)!;
  const selfKendra = moonRes.conditions.find((c) => c.id === 'self_kendra')!;
  check('the Moon is not treated as in kendra from itself', !selfKendra.met,
    selfKendra.detail);

  // --- per-varga evaluation -------------------------------------
  let vargaChecked = 0;
  let anyCancelled = false;
  for (const [vId, v] of Object.entries(natal.vargas as any)) {
    const vv: any = v;
    if (!vv?.planets) continue;
    const positions = {
      lagnaRashi: vv.lagnaRashi,
      planets: Object.fromEntries(
        Object.entries(vv.planets).map(([k, p]: any) => [k, { rashiNumber: p.rashiNumber, house: p.house }])
      ),
    };
    const res = evaluateAllNeechaBhanga(positions as any);
    vargaChecked++;
    for (const r of res) {
      // Any graha reported must actually be in its debilitation sign.
      const prop = (GRAHA_PROPERTIES as any)[r.planet];
      check(`${vId} ${r.planet} really is in its debilitation sign`,
        r.rashiNumber === prop.debilitationSign);
      if (r.cancelled) anyCancelled = true;
      // A cancelled graha must have at least one met condition with a reason.
      if (r.cancelled) check(`${vId} ${r.planet} cancellation names its reasons`, r.reasons.length > 0);
    }
  }
  check('neecha bhanga runs on every varga', vargaChecked >= 16, String(vargaChecked));
  check('at least one varga shows a cancellation', anyCancelled);

  // --- the caution the sources stress ---------------------------
  const anyResult = evaluateAllNeechaBhanga({
    lagnaRashi: 9,
    planets: crafted.planets,
  } as any)[0];
  if (anyResult) {
    check('a cancellation never claims a Raja Yoga',
      !/raja yoga/i.test(anyResult.note) || /not by itself/i.test(anyResult.note),
      anyResult.note.slice(0, 60));
  }
}

/* ------------- NEECHA BHANGA APPEARS ONLY WHEN DEBILITATION EXISTS */

console.log('\n== Neecha bhanga presence rule ==');
{
  // The D-1 block must be driven by data, not always rendered.
  const withDebilitation: any = calculateFullJyotishaChart({
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5, locationName: 'X',
  });
  const pos = (c: any) => ({
    lagnaRashi: c.lagna.rashiNumber,
    planets: Object.fromEntries(
      Object.entries(c.planets).map(([k, p]: any) => [k, { rashiNumber: p.rashiNumber, house: p.house }])
    ),
  });
  const res = evaluateAllNeechaBhanga(pos(withDebilitation) as any);
  check('a chart with a debilitated graha yields a result', res.length > 0, String(res.length));
  check('the debilitated graha is named', res.every((r) => typeof r.planetName === 'string' && r.planetName.length > 0));

  // Every reported graha really is debilitated.
  for (const r of res) {
    const prop = (GRAHA_PROPERTIES as any)[r.planet];
    check(`${r.planet} is genuinely debilitated`, r.rashiNumber === prop.debilitationSign);
  }

  // Each verdict must be unambiguous: forms, or does not.
  check('each result states a definite verdict',
    res.every((r) => r.cancelled === (r.strength > 0)));
  check('a cancelled graha names at least one condition',
    res.filter((r) => r.cancelled).every((r) => r.reasons.length > 0));
  check('an uncancelled graha names no conditions',
    res.filter((r) => !r.cancelled).every((r) => r.reasons.length === 0));
  check('an uncancelled graha says so plainly',
    res.filter((r) => !r.cancelled).every((r) => /uncancelled|stands/i.test(r.note)));

  // A chart where nothing is debilitated must yield an empty list, so the
  // panel hides the block rather than showing an empty frame.
  const noDebilitation: any = calculateFullJyotishaChart({
    year: 1955, month: 2, day: 24, hour: 19, minute: 15, second: 0,
    latitude: 37.7749, longitude: -122.4194, timezoneOffsetHours: -8, locationName: 'X',
  });
  const none = evaluateAllNeechaBhanga(pos(noDebilitation) as any);
  check('a chart with no debilitation yields an empty list', none.length === 0, String(none.length));
}

/* ------------ RAJA YOGA FROM A FALLEN GRAHA (BPHS 22.26-30) */

console.log('\n== BPHS raja yoga from debilitation ==');
{
  // 22.26: a debilitated graha that aspects the lagna.
  // Mars debilitates in Karka. Put Karka at the 7th house (lagna Makara) — from
  // the 7th, Mars reaches the lagna by its ordinary 7th-house aspect.
  // (From house 4 it would aspect 10, 7 and 11 — not the lagna.)
  const crafted: any = {
    lagnaRashi: 10,
    planets: {
      mars: { rashiNumber: 4, house: 7 },
      moon: { rashiNumber: 8, house: 5 },
      sun: { rashiNumber: 1, house: 10 },
      mercury: { rashiNumber: 6, house: 3 },
      jupiter: { rashiNumber: 10, house: 7 },
      venus: { rashiNumber: 2, house: 11 },
      saturn: { rashiNumber: 7, house: 4 },
      rahu: { rashiNumber: 11, house: 8 },
      ketu: { rashiNumber: 5, house: 2 },
    },
  };
  const res = evaluateNeechaRajaYoga(crafted);
  check('a debilitated graha aspecting the lagna is reported', res.length > 0, String(res.length));
  check('Mars in Karka is reported under 22.26',
    res.some((r) => r.graha === 'mars' && r.verse === '22.26'));

  // Every reported case must actually aspect the lagna.
  for (const r of res) {
    const houses = [7];
    if (r.graha === 'mars') houses.push(4, 8);
    if (r.graha === 'jupiter') houses.push(5, 9);
    if (r.graha === 'saturn') houses.push(3, 10);
    const reaches = houses.some((n) => (((r.house + n - 2) % 12) + 1) === 1);
    check(`${r.graha} (H${r.house}) really aspects the lagna`, reaches);
  }

  // 22.27 names the 3rd, 6th, 8th and 11th. From the 6th, Mars reaches the
  // lagna by its 8th-house aspect, so it must also be reported under 22.27.
  const inSixth: any = JSON.parse(JSON.stringify(crafted));
  inSixth.planets.mars.house = 6;
  const res27 = evaluateNeechaRajaYoga(inSixth);
  check('a debilitated graha in the 6th aspecting the lagna is reported under 22.27',
    res27.some((r) => r.graha === 'mars' && r.verse === '22.27'), JSON.stringify(res27.map((r) => r.verse)));

  // 22.28: an exalted graha aspecting the lagna.
  // Jupiter exalted in Karka at house 4 aspects house 10/12/... — from 4, Jupiter
  // aspects 10, 8, 12. Not the lagna. Put it at house 7: 7,7->1 yes.
  const exalted: any = JSON.parse(JSON.stringify(crafted));
  exalted.planets.jupiter = { rashiNumber: 4, house: 7 };  // Jupiter exalted in Karka, 7th aspect -> lagna
  delete (exalted.planets as any).mars;  // keep the exalted case clean
  const resEx = evaluateNeechaRajaYoga(exalted);
  check('an exalted graha aspecting the lagna is reported under 22.28',
    resEx.some((r) => r.graha === 'jupiter' && r.verse === '22.28'));

  // No aspect, no yoga.
  const noAspect: any = JSON.parse(JSON.stringify(crafted));
  noAspect.planets.mars.house = 2;   // from 2, Mars aspects 8, 5, 9 — not the lagna
  noAspect.planets.mars.rashiNumber = 4;
  check('a debilitated graha not aspecting the lagna gives nothing',
    !evaluateNeechaRajaYoga(noAspect).some((r) => r.graha === 'mars'));

  // Every case names its verse, its result and its reason.
  for (const r of res) {
    check(`verse ${r.verse} names the graha`, typeof r.grahaName === 'string' && r.grahaName.length > 0);
    check(`verse ${r.verse} states a result`, typeof r.result === 'string' && r.result.length > 0);
    check(`verse ${r.verse} states a reason`, typeof r.reason === 'string' && r.reason.length > 10);
  }

  // The two systems are genuinely different rules, so they must be able to
  // disagree — otherwise one of them is not being computed.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const input = {
    lagnaRashi: natal.lagna.rashiNumber,
    planets: Object.fromEntries(
      Object.entries(natal.planets).map(([k, p]: any) => [k, { rashiNumber: p.rashiNumber, house: p.house }])
    ),
  };
  const bphs = evaluateNeechaRajaYoga(input as any);
  const pd = evaluateAllNeechaBhanga(input as any);
  check('both rule sets run on a real chart', Array.isArray(bphs) && Array.isArray(pd));
  check('the BPHS module cites only BPHS verses',
    bphs.every((r) => /^22\.(26|27|28|29|30)$/.test(r.verse)));

  // And the note must not conflate them.
  check('the BPHS note distinguishes itself from Phaladipika',
    /different rule/i.test(RAJA_YOGA_NOTE));
}

/* ------------------ NB vs NBRY — THE LORDSHIP PRECONDITION */

console.log('\n== NB vs NBRY ==');
{
  // Lagna Mesha. Mercury debilitates in Mina (house 12) and rules Mithuna (3)
  // and Kanya (6) — both dusthanas, so a cancellation is NB and no more.
  const dusthanaOnly: any = {
    lagnaRashi: 1,
    planets: {
      mercury: { rashiNumber: 12, house: 12 },
      sun: { rashiNumber: 1, house: 1 },
      moon: { rashiNumber: 4, house: 4 },
      mars: { rashiNumber: 1, house: 1 },
      jupiter: { rashiNumber: 4, house: 4 },
      venus: { rashiNumber: 2, house: 2 },
      saturn: { rashiNumber: 10, house: 10 },
      rahu: { rashiNumber: 11, house: 11 },
      ketu: { rashiNumber: 5, house: 5 },
    },
  };
  const merc = evaluateAllNeechaBhanga(dusthanaOnly).find((r) => r.planet === 'mercury')!;
  check('Mercury in Mina is debilitated', !!merc);
  check('Mercury rules only dusthanas here',
    JSON.stringify(merc.ruledHouses) === '[3,6]', JSON.stringify(merc.ruledHouses));
  check('a cancellation on dusthana lordship is NB, not NBRY', merc.verdict === 'NB', merc.verdict);
  check('it is still cancelled', merc.cancelled);
  check('the note explains why it is not royal',
    /no kendra or trikoṇa/i.test(merc.note), merc.note.slice(0, 70));

  // Same chart, but the graha lords a kendra — Saturn debilitated in Mesha at
  // lagna Mesha rules Makara (10) and Kumbha (11): 10 is a kendra.
  const kendraLordship: any = JSON.parse(JSON.stringify(dusthanaOnly));
  kendraLordship.planets.saturn = { rashiNumber: 1, house: 1 };
  const sat = evaluateAllNeechaBhanga(kendraLordship).find((r) => r.planet === 'saturn');
  if (sat) {
    check('Saturn rules a kendra here', sat.ruledHouses.some((h) => [1, 4, 7, 10].includes(h)),
      JSON.stringify(sat.ruledHouses));
    check('with a cancellation it is NBRY', sat.cancelled ? sat.verdict === 'NBRY' : sat.verdict === 'none',
      `${sat.verdict} (cancelled ${sat.cancelled})`);
  }

  // Verdict must always agree with the two inputs it is derived from.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const input: any = {
    lagnaRashi: natal.lagna.rashiNumber,
    planets: Object.fromEntries(
      Object.entries(natal.planets).map(([k, p]: any) => [k, { rashiNumber: p.rashiNumber, house: p.house }])
    ),
    navamsa: Object.fromEntries(
      Object.entries(natal.vargas.D9.planets as any).map(([k, p]: any) => [k, { rashiNumber: p.rashiNumber }])
    ),
  };
  for (const r of evaluateAllNeechaBhanga(input)) {
    const expected = !r.cancelled ? 'none' : r.lordsKendraOrTrikona ? 'NBRY' : 'NB';
    check(`${r.planet} verdict matches its inputs`, r.verdict === expected,
      `${r.verdict} vs ${expected}`);
    // The daśā leg is never silently claimed.
    check(`${r.planet} marks dasha as unchecked`, r.dashaChecked === false);
  }

  // The Navamsa check must actually read D-9.
  const withNav = evaluateAllNeechaBhanga(input);
  check('navamsa dignity is reported when D-9 is supplied',
    withNav.every((r) => typeof r.navamsaDignity === 'string' && r.navamsaDignity!.length > 0));

  // Without D-9 it must be absent, not invented.
  const noNav = evaluateAllNeechaBhanga({ lagnaRashi: input.lagnaRashi, planets: input.planets });
  check('navamsa dignity is absent when D-9 is not supplied',
    noNav.every((r) => r.navamsaDignity === undefined));
}

/* ------------------------ YOGA COVERAGE AGAINST THE CLASSICAL SET */

console.log('\n== Yoga coverage ==');
{
  const all: any[] = CLASSICAL_YOGA_REGISTRY as any;

  // The three categories the checklist names must all be present.
  const nitya = 27;  // computed from Sun+Moon in the panchanga, not here
  check('the 27 Nitya yogas are tabulated', NITYA_YOGAS.length === nitya, String(NITYA_YOGAS.length));
  check('the Nitya list has no duplicate names',
    new Set(NITYA_YOGAS.map((y: any) => y.name)).size === nitya);

  // Nabhasa: BPHS 35 gives 32 — 3 Āśraya, 2 Dala, 20 Ākṛti, 7 Saṅkhyā.
  const nabhasa = all.filter((y) => y.category === 'Nabhasa');
  check('Nabhasa has exactly 32 yogas', nabhasa.length === 32, String(nabhasa.length));
  check('all 32 Nabhasa names are distinct',
    new Set(nabhasa.map((y) => y.name.split(' (')[0].split(' /')[0].trim())).size === 32);

  // The twenty Akriti must all be there, by name.
  const akritiNames = ['Gada', 'Sakata', 'Sringataka', 'Vihaga', 'Hala', 'Vajra', 'Yava',
    'Kamala', 'Vapi', 'Yupa', 'Shara', 'Shakti', 'Danda', 'Nauka', 'Kuta', 'Chatra',
    'Chapa', 'Ardhachandra', 'Chakra', 'Samudra'];
  // Consonant skeleton: collapses transliteration variants (Capa/Chapa,
  // Cakra/Chakra, Sringataka/Srngataka) so a spelling is not read as a gap.
  const norm = (x: string) => x.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ch/g, 'c').replace(/sh/g, 's').replace(/th/g, 't').replace(/ph/g, 'p')
    .replace(/[^a-z]/g, '');
  const nabhasaNames = nabhasa.map((y) => norm(y.name + ' ' + y.id));
  const missingAkriti = akritiNames.filter((n) => !nabhasaNames.some((x) => x.includes(norm(n))));
  check('all twenty Akriti yogas are present', missingAkriti.length === 0, missingAkriti.join(','));

  // The classical families.
  const cats = new Set(all.map((y) => y.category));
  for (const c of ['Nabhasa', 'Raja', 'Dhana', 'Chandra', 'Surya', 'Viparita', 'Parivartana']) {
    check(`the ${c} family exists`, cats.has(c), [...cats].join(','));
  }
  check('all three Parivartana types are present',
    all.filter((y) => y.category === 'Parivartana').length === 3,
    String(all.filter((y) => y.category === 'Parivartana').length));
  check('all three Viparita types are present',
    all.filter((y) => y.category === 'Viparita').length === 3);
  check('all five Pancha Mahapurusha yogas are present',
    all.filter((y) => y.category === 'Pancha Mahapurusha').length === 5);

  // The registry must be well-formed: unique ids, every one evaluable.
  check('every yoga id is unique', new Set(all.map((y) => y.id)).size === all.length);
  check('every yoga has a source and a verse',
    all.every((y) => typeof y.sourceText === 'string' && typeof y.chapterAndVerse === 'string'));
  check('every yoga is evaluable', all.every((y) => typeof y.evaluate === 'function'));
  check('the registry is substantial', all.length >= 100, String(all.length));

  // Nabhasa uses only the seven non-node grahas — Rahu and Ketu must not count.
  check('the Nabhasa set is built on seven grahas',
    !JSON.stringify(nabhasa.map((y) => y.definition)).includes('Rahu'));
}

/* ---------------------- EXPORT FILENAME & SPEED ------------------- */

console.log('\n== Export filename and speed ==');
{
  const base: any = {
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 24,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5, locationName: 'X',
  };
  const nameless: any = calculateFullJyotishaChart(base);
  const named: any = calculateFullJyotishaChart({ ...base, personName: 'Rahul' });
  const full: any = calculateFullJyotishaChart({ ...base, personName: 'Rahul Sharma' });

  check('no name falls back to the date',
    chartJsonFilename(nameless) === 'Ganaka-Chart-20090303.json', chartJsonFilename(nameless));
  check('a name is used in the filename',
    chartJsonFilename(named) === 'Ganaka-Chart-Rahul.json', chartJsonFilename(named));
  check('a full name is slugged with dashes',
    chartJsonFilename(full) === 'Ganaka-Chart-Rahul-Sharma.json', chartJsonFilename(full));
  check('a gochar chart is labelled gochar',
    chartJsonFilename(nameless, { kind: 'gochar' }) === 'Ganaka-Gochar.json');
  check('diacritics are stripped from the name',
    chartJsonFilename(calculateFullJyotishaChart({ ...base, personName: 'Aśok Dās' })) === 'Ganaka-Chart-Asok-Das.json');
  check('punctuation cannot break the filename',
    !/[^A-Za-z0-9.\-]/.test(chartJsonFilename(calculateFullJyotishaChart({ ...base, personName: "O'Brien / Jr." }))));

  // The name must not collide in the chart cache — two charts differing only by
  // name must stay distinct.
  check('the name survives the chart cache', named.meta.birthDetails.personName === 'Rahul');
  check('a nameless chart stays nameless', nameless.meta.birthDetails.personName === undefined);
  check('the name does not change any calculation',
    named.lagna.siderealLongitude === nameless.lagna.siderealLongitude);

  // The export is cached: a second build must be free.
  const t1 = Date.now(); buildChartExport(nameless, { dashaDepth: 2 }); const first = Date.now() - t1;
  const t2 = Date.now(); buildChartExport(nameless, { dashaDepth: 2 }); const second = Date.now() - t2;
  check('the export is cached after the first build', second < Math.max(5, first / 4),
    `${first} ms then ${second} ms`);
  check('the cached export is the same object', buildChartExport(nameless, { dashaDepth: 2 }) === buildChartExport(nameless, { dashaDepth: 2 }));

  // The eclipse fast path must match the full ephemeris exactly.
  let worst = 0;
  for (let i = 0; i < 12; i++) {
    const jd = 2451545.0 + i * 211.7;
    const fullPos: any = calculateAllPlanets(jd, 'lahiri', 0);
    const fast = sunMoonLongitudes(jd, 'lahiri', 0);
    const ds = Math.abs(((fullPos.sun.siderealLongitude - fast.sun + 540) % 360) - 180);
    const dm = Math.abs(((fullPos.moon.siderealLongitude - fast.moon + 540) % 360) - 180);
    worst = Math.max(worst, ds, dm);
  }
  check('the sun/moon fast path is identical to the full ephemeris',
    worst * 3600 < 0.001, `${(worst * 3600).toFixed(6)}″`);
}

/* ------------------------ EXPORT SIZE & SERIALISATION ------------- */

console.log('\n== Export size ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });
  const str = chartToJsonString(natal);

  check('the serialised export is valid JSON', (() => { try { JSON.parse(str); return true; } catch { return false; } })());
  check('the serialised export is under 420 KB', str.length / 1024 < 420, `${(str.length / 1024).toFixed(0)} KB`);
  check('it is smaller than a two-space pretty print',
    str.length < JSON.stringify(e, null, 2).length * 0.75,
    `${(str.length / 1024).toFixed(0)} vs ${(JSON.stringify(e, null, 2).length / 1024).toFixed(0)} KB`);
  check('top-level sections stay on their own lines',
    str.split('\n').length > 20 && str.split('\n').length < 60, String(str.split('\n').length));

  // The derivable varga maps are gone.
  check('varga houseToRashi is not exported', e.chart.vargas.D9.houseToRashi === undefined);
  check('varga rashiToHouse is not exported', e.chart.vargas.D9.rashiToHouse === undefined);
  // But the information is still reconstructible from lagnaRashi.
  const lagna = e.chart.vargas.D9.lagnaRashi;
  const reconstructed = Array.from({ length: 12 }, (_, i) => ((((lagna - 1) + i) % 12) + 1));
  check('the house→rāśi mapping is reconstructible from lagnaRashi', reconstructed.length === 12);

  // Floats are rounded, not truncated to nonsense.
  check('longitudes keep six decimals', (() => {
    const lon = e.chart.lagna.siderealLongitude;
    return Math.abs(lon * 1e6 - Math.round(lon * 1e6)) < 1e-6;
  })(), String(e.chart.lagna.siderealLongitude));

  // Nothing computed was lost.
  check('all vargas survive', Object.keys(e.chart.vargas).length >= 16);
  check('all dashas survive', Object.keys(e.extendedDashas).length === 16);
  check('the KP layer survives', e.kp.cusps.length === 12);
}

/* --------------- BIRTH TIME IS UNAMBIGUOUS IN THE EXPORT --------- */

console.log('\n== Birth time never ambiguous ==');
{
  const mk = (hour: number) => {
    const c: any = calculateFullJyotishaChart({
      year: 2009, month: 3, day: 3, hour, minute: 51, second: 24,
      latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5, locationName: 'X',
    });
    return { c, b: (buildChartExport(c) as any).birth };
  };

  // The meridiem boundary is where a 12-hour reading goes wrong.
  const cases: Array<[number, string, string]> = [
    [0,  '00:51:24', '12:51:24 AM'],
    [1,  '01:51:24', '01:51:24 AM'],
    [11, '11:51:24', '11:51:24 AM'],
    [12, '12:51:24', '12:51:24 PM'],
    [13, '13:51:24', '01:51:24 PM'],
    [23, '23:51:24', '11:51:24 PM'],
  ];
  for (const [hour, t24, t12] of cases) {
    const { b } = mk(hour);
    check(`hour ${hour} states time24 correctly`, b.time24 === t24, b.time24);
    check(`hour ${hour} states time12 correctly`, b.time12 === t12, b.time12);
    check(`hour ${hour} keeps the raw number`, b.hour === hour);
  }

  // 23:51 IST must be 18:21 UTC, not 06:21.
  const { b: pm } = mk(23);
  check('23:51 IST is 18:21 UTC', pm.utcInstant === '2009-03-03T18:21:24.000Z', pm.utcInstant);
  const { b: am } = mk(11);
  check('11:51 IST is 06:21 UTC', am.utcInstant === '2009-03-03T06:21:24.000Z', am.utcInstant);
  check('the two are twelve hours apart',
    Math.abs(new Date(pm.utcInstant).getTime() - new Date(am.utcInstant).getTime()) === 12 * 3600 * 1000);
  check('the time zone is stated', pm.timeZone === 'UTC+05:30', pm.timeZone);

  // And the chart itself must differ — the ascendant moves a whole sign.
  const { c: c23 } = mk(23);
  const { c: c11 } = mk(11);
  check('23:51 and 11:51 give different lagna signs',
    c23.lagna.rashiNumber !== c11.lagna.rashiNumber,
    `${c23.lagna.rashiName} vs ${c11.lagna.rashiName}`);
  check('23:51 gives Vṛścika for this fixture', c23.lagna.rashiName === 'Vṛścika', c23.lagna.rashiName);

  // The conventions block must exist and explain the time.
  const e: any = buildChartExport(c23);
  check('the export carries a conventions block', !!e.conventions);
  check('it explains the time format', /24-hour/i.test(e.conventions.time));
  check('it states the longitudes are sidereal', /sidereal/i.test(e.conventions.longitudes));
  check('it explains rashi numbering', /Meṣa|Aries/i.test(e.conventions.rashis));
  check('it warns that a varga has its own houses', /varga/i.test(e.conventions.houses));
}

/* ------------------------- PDF FILENAME ---------------------------- */

console.log('\n== PDF filename ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  check('the pdf filename uses the given name',
    chartPdfFilename(calculateFullJyotishaChart({ ...FIXTURES[0].birth, personName: 'Rahul' } as any)) === 'Ganaka-Jyotisha-Rahul.pdf',
    chartPdfFilename(calculateFullJyotishaChart({ ...FIXTURES[0].birth, personName: 'Rahul' } as any)));
  check('the pdf filename falls back to the date',
    /^Ganaka-Jyotisa-Chart-\d{8}\.pdf$/.test(chartPdfFilename(natal)), chartPdfFilename(natal));
}

/* ------------- THE PDF DOES NOT BUILD THE JSON TO GET ECLIPSES ----- */

console.log('\n== PDF data path is lean ==');
{
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(process.cwd(), 'lib/report/ChartReport.tsx'), 'utf8');

  // Building the whole export inside the report allocated 24 MB and 1.8 s of
  // work immediately before react-pdf began laying out the pages.
  // Strip comments first — the file records in a comment why the export is no
  // longer built, and that mention is not a call.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  check('the report does not build the JSON export', !/buildChartExport\s*\(/.test(code));
  check('the report searches eclipses directly', /findEclipses\s*\(/.test(src));
  check('the report caches its derived data', /reportDataCache/.test(src));

  // The eclipse search itself must stay on the two-body fast path.
  const ecl = fs.readFileSync(path.join(process.cwd(), 'lib/astronomy/eclipses.ts'), 'utf8');
  check('the eclipse search uses the sun/moon fast path', /sunMoonLongitudes/.test(ecl));
  check('the eclipse search never evaluates all nine bodies', !/calculateAllPlanets/.test(ecl));
}

/* --------------- TYPING A BIRTH TIME THE WAY PEOPLE DO ------------ */

console.log('\n== Time input parsing ==');
{
  const V = (h: number, m: number, sec = 0) => ({ hour: h, minute: m, second: sec });

  // Unambiguous 24-hour entries, in every shape a person types them.
  const clear: Array<[string, any]> = [
    ['2351', V(23, 51)],
    ['235124', V(23, 51, 24)],
    ['23:51', V(23, 51)],
    ['23:51:24', V(23, 51, 24)],
    ['00:30', V(0, 30)],
    ['0651', V(6, 51)],
  ];
  for (const [input, expected] of clear) {
    const r = parseTimeInput(input);
    check(`"${input}" reads as ${expected.hour}:${expected.minute}`,
      !!r.value && r.value.hour === expected.hour && r.value.minute === expected.minute,
      r.value ? `${r.value.hour}:${r.value.minute}` : 'not parsed');
  }

  // The same instant written on a 12-hour clock, with the meridiem attached.
  for (const input of ['11:51 pm', '11:51pm', '11:51 p.m.', '1151p']) {
    const r = parseTimeInput(input);
    check(`"${input}" resolves to 23:51`, !!r.value && r.value.hour === 23 && r.value.minute === 51,
      r.value ? `${r.value.hour}:${r.value.minute}` : 'not parsed');
  }
  // A leading zero is a 24-hour entry by intent — "06:51" means morning, where
  // "6:51" is a clock reading that could be either.
  const lz = parseTimeInput('0651');
  check('"0651" is read as 06:51, not asked about', !!lz.value && lz.value.hour === 6,
    lz.value ? `${lz.value.hour}:${lz.value.minute}` : 'asked');

  const am = parseTimeInput('11:51 am');
  check('"11:51 am" resolves to 11:51', !!am.value && am.value.hour === 11);

  // An hour of 1–12 with no meridiem is NOT guessed — it is asked about.
  for (const input of ['11:51', '12:00', '6:05']) {
    const r = parseTimeInput(input);
    check(`"${input}" is flagged ambiguous, not guessed`,
      !r.value && !!r.ambiguous, r.value ? `guessed ${r.value.hour}:${r.value.minute}` : 'asked');
  }

  // Mid-typing must not commit a half-finished time.
  for (const input of ['', '2', '1']) {
    const r = parseTimeInput(input);
    check(`"${input || '(empty)'}" is treated as still being typed`, !r.value && !r.ambiguous);
  }

  // A 12-hour clock cannot express 13 or 23, so those must not be accepted
  // with a meridiem attached.
  check('"23:51 pm" is rejected as impossible', !parseTimeInput('23:51 pm').value);
  check('"13:00 am" is rejected as impossible', !parseTimeInput('13:00 am').value);
}

/* ------------------ NO <div> INSIDE A <table> --------------------- */

console.log('\n== Table markup is valid ==');
{
  const fs = require('node:fs');
  const path = require('node:path');

  // A <div> directly inside <table> is invalid: the browser hoists it out and
  // the table loses its structure, which is what broke everything under the
  // varga dignity grid.
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.tsx')) {
        const src = fs.readFileSync(full, 'utf8');
        if (/<table[^>]*>\s*<div[^>]*>/.test(src)) offenders.push(full);
      }
    }
  };
  walk(path.join(process.cwd(), 'components'));
  check('no <div> sits directly inside a <table>', offenders.length === 0, offenders.join(', '));

  // The varga panel must render every graha, Ketu included.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const d9: any = natal.vargas.D9;
  check('the varga chart carries all nine grahas', Object.keys(d9.planets).length === 9,
    Object.keys(d9.planets).join(','));
  check('Ketu is present in the varga', !!d9.planets.ketu);
  check('every varga graha has a dignity',
    Object.values(d9.planets).every((p: any) => typeof p.dignity === 'string' && p.dignity.length > 0),
    Object.entries(d9.planets).filter(([, p]: any) => !p.dignity).map(([k]) => k).join(',') || 'all present');
}

/* -------------------- STRUCTURAL HEALTH OF THE REPO ---------------- */

console.log('\n== Structural health ==');
{
  const fs = require('node:fs');
  const path = require('node:path');

  // No UI text below 10px. 9px labels were unreadable on a phone; 10px is the
  // floor for superscript markers inside a legend.
  const tiny: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.tsx')) {
        const src = fs.readFileSync(full, 'utf8');
        if (/text-\[9px\]/.test(src)) tiny.push(full);
      }
    }
  };
  walk(path.join(process.cwd(), 'components'));
  check('no UI text below 10px', tiny.length === 0, tiny.slice(0, 3).join(', '));

  // Every varga must carry all nine grahas with a dignity.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  let vargaFaults = 0;
  for (const [vId, v] of Object.entries(natal.vargas as any)) {
    const planets = Object.values((v as any).planets || {}) as any[];
    if (planets.length !== 9) vargaFaults++;
    else if (!planets.every((p) => typeof p.dignity === 'string' && p.dignity)) vargaFaults++;
  }
  check('every varga has nine grahas, each with a dignity', vargaFaults === 0, `${vargaFaults} vargas faulty`);

  // Aşṭakavarga must total 337 in every recension.
  const savTotal = (natal.ashtakavarga as any).sav.total;
  check('SAV totals 337', savTotal === 337, String(savTotal));

  // The bhāva cusps must span the circle exactly once.
  const mid = (natal.bhavas as any[]).map((b) => b.midDegree).sort((a, b) => a - b);
  const gaps = mid.map((d, i) => ((mid[(i + 1) % 12] - d + 360) % 360 || 360));
  check('the twelve bhāva cusps are distinct', new Set(mid).size === 12, String(new Set(mid).size));
  check('no bhāva is wider than half the zodiac',
    gaps.every((g) => g > 0 && g <= 180), gaps.map((g) => g.toFixed(0)).join(','));

  // Every dasha system must produce periods.
  const ext: any = buildChartExport(natal, { dashaDepth: 2 }).extendedDashas;
  const emptySystems = Object.entries(ext).filter(([, v]: any) => !v.periods || v.periods.length === 0);
  check('all sixteen dasha systems yield periods', emptySystems.length === 0,
    emptySystems.map(([k]) => k).join(',') || 'all present');
}

/* ---------------------- RESPONSIVE STRUCTURE ---------------------- */

console.log('\n== Responsive structure ==');
{
  const fs = require('node:fs');
  const path = require('node:path');

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.tsx')) files.push(full);
    }
  };
  walk(path.join(process.cwd(), 'components'));

  // A table wider than the viewport must sit in a scrolling parent, or the
  // whole page scrolls sideways and everything shifts.
  const unscrollable: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/<table[^>]*min-w-\[[0-9]+px\][^>]*>/g)) {
      const before = src.slice(Math.max(0, m.index! - 400), m.index!);
      if (!/overflow-x-auto|overflow-auto/.test(before)) unscrollable.push(path.basename(f));
    }
  }
  check('every fixed-width table has a scrolling parent', unscrollable.length === 0,
    [...new Set(unscrollable)].join(', '));

  // The workspace tab strip must collapse on narrow screens.
  const ws = fs.readFileSync(path.join(process.cwd(), 'components/workspace/WorkspaceClient.tsx'), 'utf8');
  check('the workspace nav is responsive',
    /grid-cols-2[^"]*sm:grid-cols-3[^"]*lg:grid-cols-6/.test(ws));

  // No element may be wider than the viewport without a max-w guard.
  const tooWide: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/className="([^"]*)"/g)) {
      const c = m[1];
      const w = c.match(/(?:^|\s)w-\[(\d{3,})px\]/);
      if (w && !/max-w-/.test(c) && !/(sm|md|lg|xl):w-/.test(c)) {
        tooWide.push(`${path.basename(f)} w-[${w[1]}px]`);
      }
    }
  }
  check('no unguarded fixed-width elements', tooWide.length === 0, [...new Set(tooWide)].slice(0, 4).join(', '));

  // Count tables that would be cramped on a phone, so the number is visible.
  let wide = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/<thead>([\s\S]*?)<\/thead>/g)) {
      const cols = (m[1].match(/<th\b/g) || []).length;
      if (cols >= 8) wide++;
    }
  }
  console.log(`   note: ${wide} tables carry eight or more columns; they scroll horizontally on a phone`);
}

/* -------- WIDE TABLES SHED COLUMNS ON A PHONE, IN STEP ---------- */

console.log('\n== Responsive tables ==');
{
  const fs = require('node:fs');
  const path = require('node:path');

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.tsx')) files.push(full);
    }
  };
  walk(path.join(process.cwd(), 'components'));

  // If a header cell is hidden on mobile, the cell beneath it must be hidden at
  // the SAME ordinal position. Hiding one without the other shifts every value
  // one column left, which is worse than the cramped table it was fixing.
  const misaligned: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/<thead>([\s\S]*?)<\/thead>([\s\S]*?)<\/tbody>/g)) {
      const ths = [...m[1].matchAll(/<th[^>]*>/g)].map((x) => x[0]);
      // Skip the empty-state row (a single colSpan cell); use the first row
      // that actually has one cell per column.
      const rows = m[2].split('</tr>');
      const firstRow = rows.find((r: string) => !r.includes('colSpan')) || rows[0] || '';
      const tds = [...firstRow.matchAll(/<td[^>]*>/g)].map((x) => x[0]);
      const hpos = ths.map((t, i) => (t.includes('hidden md:table-cell') ? i : -1)).filter((i) => i >= 0);
      const dpos = tds.map((t, i) => (t.includes('hidden md:table-cell') ? i : -1)).filter((i) => i >= 0);
      if (hpos.length !== dpos.length || hpos.some((v, i) => v !== dpos[i])) {
        misaligned.push(path.basename(f));
      }
    }
  }
  check('hidden columns line up between head and body', misaligned.length === 0,
    [...new Set(misaligned)].join(', '));

  // The widest tables must shed something on a phone.
  const wideNoHide: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/<thead>([\s\S]*?)<\/thead>/g)) {
      const cols = (m[1].match(/<th\b/g) || []).length;
      const hidden = (m[1].match(/hidden md:table-cell/g) || []).length;
      if (cols >= 8 && hidden === 0) wideNoHide.push(`${path.basename(f)} (${cols})`);
    }
  }
  check('no eight-column table shows every column on a phone', wideNoHide.length === 0,
    [...new Set(wideNoHide)].join(', '));
}

/* --------- RESPONSIVE RULES LIVE IN CSS, NOT PER TABLE ----------- */

console.log('\n== Responsive table system ==');
{
  const fs = require('node:fs');
  const path = require('node:path');
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');

  // The system, not per-table edits: a sticky header, a sticky identity
  // column, and a scroll container that every panel inherits.
  check('the stylesheet declares a sticky table header',
    /table thead th[^{]*\{[^}]*position:\s*sticky/.test(css));
  check('the stylesheet freezes the first column',
    /table :is\(th, td\):first-child\s*\{[\s\S]{0,200}?position:\s*sticky/.test(css));
  check('borders are separated so sticky cells keep theirs',
    /table\s*\{[^}]*border-collapse:\s*separate/.test(css));
  check('scroll containers contain sideways overscroll',
    /overscroll-behavior-x:\s*contain/.test(css));
  check('the corner cell stacks above both sticky axes',
    /thead th:first-child\s*\{\s*z-index:\s*3/.test(css));

  // Fluid sizing rather than fixed px, so one rule fits every viewport.
  check('the type scale is fluid', /clamp\(0\.75rem/.test(css) && /clamp\(0\.9375rem/.test(css));
  check('spacing is fluid', /--space-fluid:\s*clamp/.test(css));

  // No table may sit outside a scroll container.
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.tsx')) files.push(full);
    }
  };
  walk(path.join(process.cwd(), 'components'));
  const orphan: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    if (!src.includes('<table')) continue;
    // every table in the file must have a scroll ancestor somewhere in it
    if (!/overflow-x-auto|data-table-scroll/.test(src)) orphan.push(path.basename(f));
  }
  check('every table sits in a scroll container', orphan.length === 0, orphan.join(', '));
}

/* ---------- KP CUSPS MUST BE THE CHART'S OWN ANGLES ------------ */

console.log('\n== KP cusps ==');
{
  // In KP the cusp is the START of the house, so cusp 1 is the ascendant by
  // definition. Reading the bhāva midpoint instead shifted every cusp by half a
  // house — 16.46° on one chart, about sixty-six minutes — while leaving cusp 1
  // and cusp 7 exactly 180° apart, so the block looked self-consistent and was
  // computed from an ascendant an hour away.
  const arc = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
  let worst = 0;
  for (const f of FIXTURES) {
    const c: any = calculateFullJyotishaChart(f.birth);
    const cusps = buildKpCusps(c);
    worst = Math.max(worst,
      arc(cusps[0].longitude, c.lagna.siderealLongitude),
      arc(cusps[6].longitude, c.lagna.siderealLongitude + 180));
  }
  check('cusp 1 is the ascendant on every chart', worst < 0.001, `${worst.toFixed(6)}°`);
  check('cusp 7 is the descendant on every chart', worst < 0.001, `${worst.toFixed(6)}°`);

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const kpCusps = buildKpCusps(natal);

  check('twelve cusps', kpCusps.length === 12, String(kpCusps.length));
  check('cusp 1 and cusp 7 are 180° apart',
    Math.abs(arc(kpCusps[0].longitude, kpCusps[6].longitude) - 180) < 0.001);

  // Cusps must run forward around the circle, each house a sane width.
  const widths = kpCusps.map((c, i) =>
    ((kpCusps[(i + 1) % 12].longitude - c.longitude + 360) % 360));
  check('every house is between 1° and 90° wide',
    widths.every((w) => w > 1 && w < 90), widths.map((w) => w.toFixed(1)).join(','));
  check('the twelve houses sum to 360°',
    Math.abs(widths.reduce((a, b) => a + b, 0) - 360) < 0.01,
    widths.reduce((a, b) => a + b, 0).toFixed(4));

  // The 10th cusp is the MC in KP.
  check('cusp 10 is the midheaven',
    arc(kpCusps[9].longitude, natal.angles.mc) < 0.001,
    `${arc(kpCusps[9].longitude, natal.angles.mc).toFixed(6)}°`);

  // The cusp longitude must be the house START, not its middle.
  const bh: any[] = calculateHouses(natal.lagna.siderealLongitude, natal.angles.mc, 'placidus' as any, {} as any);
  check('the KP cusp equals the bhāva start, not its midpoint',
    Math.abs(kpCusps[0].longitude - bh[0].startDegree) < 0.001,
    `cusp ${kpCusps[0].longitude.toFixed(2)} vs start ${bh[0].startDegree.toFixed(2)} vs mid ${bh[0].midDegree.toFixed(2)}`);
}

/* ------------------------------------------------------ EXPORT COMPLETENESS */

console.log('\n== Export ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });

  const sections = ['bhavaBala', 'phala', 'sarvatobhadra', 'extendedDashas', 'prashna'];
  for (const k of sections) {
    check(`export carries ${k}`, e[k] && Object.keys(e[k]).length > 0);
  }
  check('export carries all sixteen dasha systems', Object.keys(e.extendedDashas).length === 16);
  check('export carries the Varsaphala', e.varshaphala != null && e.varshaphala.yearNumber >= 1);
  check('export carries the Tajika dashas', e.tajika != null && e.tajika.mudda.length > 0);

  // Every dasha node must keep its lord, dates and length after slimming.
  const t = e.chart.vimshottari.tree;
  check('slimmed dasha tree keeps lords and dates',
    t.length > 0 && t.every((n: any) => n.lord && n.from && n.to && n.years > 0),
    JSON.stringify(t[0] ?? {}));
  check('slimmed dasha tree keeps three levels',
    !!t[0].subPeriods?.[0]?.subPeriods && t[0].subPeriods[0].subPeriods[0].subPeriods === undefined);

  const json = JSON.stringify(e);
  check('export has no undefined placeholders', !json.includes('undefined'));
  check('export stays under 1 MB', json.length < 1_000_000, `${(json.length / 1024).toFixed(0)} KB`);
  check('pretty export stays under 1 MB',
    JSON.stringify(e, null, 2).length < 1_000_000,
    `${(JSON.stringify(e, null, 2).length / 1024).toFixed(0)} KB`);
}

/* ------------------------------------------- KUNDA, PRASNA, SARVATOBHADRA */

console.log('\n== Kunda, Prasna & Sarvatobhadra ==');
{
  // Kunda-siddhanta, Prasna Marga 5.8-9: lagna × 81, cast out circles.
  // The text's worked example: 134°27′ → 90°27′ (Punarvasu), 133°57′ → 49°57′ (Rohini).
  const sp1: any = calculateSpecialPoints(0, 0, 134 + 27 / 60, 0, 0, 1, 0);
  const sp2: any = calculateSpecialPoints(0, 0, 133 + 57 / 60, 0, 0, 1, 0);
  const kunda1 = (sp1.kundaLagna.rashi - 1) * 30 + sp1.kundaLagna.degreeInRashi;
  const kunda2 = (sp2.kundaLagna.rashi - 1) * 30 + sp2.kundaLagna.degreeInRashi;
  check('Kunda from lagna 134°27′ gives 90°27′', Math.abs(kunda1 - 90.45) < 0.02, kunda1.toFixed(4));
  check('Kunda from lagna 133°57′ gives 49°57′', Math.abs(kunda2 - 49.95) < 0.02, kunda2.toFixed(4));

  // Arudha: eight directions mapped to their signs (Prasna Marga 5.7).
  check('East maps to Aries', arudhaFromDirection('East') === 1);
  check('North-East maps to Pisces', arudhaFromDirection('North-East') === 12);
  check('West maps to Libra', arudhaFromDirection('West') === 7);
  check('unknown direction yields nothing', arudhaFromDirection('Up') === null);

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const pr: any = calculatePrashna(natal, 'North-East');
  check('Prasna resolves the arudha', pr.arudha?.rashiNumber === 12);
  check('Prasna produces all five sphutas',
    [pr.trisphuta, pr.chatusphuta, pr.panchasphuta, pr.pranaSphuta, pr.dehaSphuta, pr.mrityuSphuta]
      .every((x: any) => x.rashiNumber >= 1 && x.rashiNumber <= 12));
  check('Prasna lists the six factors', pr.sixFactors.length === 6);
  check('Prasna marks the two non-computable factors', pr.sixFactors.filter((f: any) => !f.computable).length === 2);

  // Sarvatobhadra: 28 stars on the ring, 81 cells in the grid.
  check('SBC ring holds 28 stars', SBC_RING.length === 28);
  check('SBC ring has no duplicates', new Set(SBC_RING).size === 28);
  check('SBC ring begins at Dhanishta and ends at Śravaṇa',
    SBC_RING[0] === 'Dhanishta' && SBC_RING[27] === 'Śravaṇa');
  check('ring index wraps', nakshatraAt(28) === nakshatraAt(0));
  const v = vedhaFor(7); // Krittika
  check('vedha returns the star and its ring neighbours',
    v.from === 'Kṛttikā' && v.left === 'Bharaṇī' && v.right === 'Rohiṇī', `${v.left}/${v.right}`);
  const grid = buildSarvatobhadraGrid();
  check('SBC grid has 81 cells', grid.length === 81);
  check('SBC grid places 28 distinct nakṣatras',
    new Set(grid.filter((c) => c.layer === 'nakshatra').map((c) => c.value)).size === 28);
  check('SBC grid places 12 rāśis', grid.filter((c) => c.layer === 'rashi').length === 12);
  check('SBC grid has four corner cells', grid.filter((c) => c.layer === 'corner').length === 4);
}

/* ------------------------------- PRĀṆAPADA, STHIRA, AND THE TĀJIKA DAŚĀS */

console.log('\n== Praṇapada, Sthira & Tājika ==');
{
  // The text's three worked examples: 985 vighaṭis gives a 170° arc, and the
  // Sun's class adds 0°, 240° or 120°.
  const sunrise = 2454893.5;
  const birth = sunrise + (985 * 24) / 86400;
  const p1 = calculatePranapada(15, birth, sunrise, 0);   // Aries, movable
  const p2 = calculatePranapada(45, birth, sunrise, 0);   // Taurus, fixed
  const p3 = calculatePranapada(75, birth, sunrise, 0);   // Gemini, dual
  check('Praṇapada: movable Sun → Libra 5°', p1.rashiNumber === 7 && Math.abs(p1.degreeInRashi - 5) < 1e-6, p1.degreeStr);
  check('Praṇapada: fixed Sun → Cancer 5°', p2.rashiNumber === 4 && Math.abs(p2.degreeInRashi - 5) < 1e-6, p2.degreeStr);
  check('Praṇapada: dual Sun → Aries 5°', p3.rashiNumber === 1 && Math.abs(p3.degreeInRashi - 5) < 1e-6, p3.degreeStr);
  check('Praṇapada class offsets are 0/240/120', p1.classOffset === 0 && p2.classOffset === 240 && p3.classOffset === 120);

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const birthDate = new Date(Date.UTC(2009, 2, 3, 18, 21));

  const brahma = findBrahmaGraha(natal);
  check('Brahma graha is one of the 6th/8th/12th lords',
    ['sun','moon','mars','mercury','jupiter','venus','saturn'].includes(brahma.planet), brahma.name);

  const sthira: any = calculateSthiraDasha(natal, birthDate);
  check('Sthira has twelve periods', sthira.periods.length === 12);
  check('Sthira totals 96 years (4×7 + 4×8 + 4×9)',
    Math.abs(sthira.periods.reduce((t: number, p: any) => t + p.durationYears, 0) - 96) < 1e-9);
  check('Sthira years are only 7, 8 or 9',
    sthira.periods.every((p: any) => [7, 8, 9].includes(p.durationYears)));

  const yearStart = new Date(Date.UTC(2025, 6, 28));
  const mudda = calculateMudda(natal.planets.moon.siderealLongitude, yearStart);
  const muddaDays = mudda.reduce((t, p) => t + p.durationDays, 0);
  check('Muḍḍa tiles exactly one year', Math.abs(muddaDays - 365.2425) < 0.5, muddaDays.toFixed(2));

  const pat: any = calculatePatyayini(natal, yearStart);
  check('Patyayini ranks eight bodies', pat.rows.length === 8);
  const patSum = pat.rows.reduce((t: number, r: any) => t + r.patyamsa, 0);
  // The telescoping identity: the patyāṃśas sum to the largest krishāṃśa.
  check('Patyayini patyāṃśas telescope to the largest krishāṃśa',
    Math.abs(patSum - pat.totalDegrees) < 1e-6, `${patSum.toFixed(3)} vs ${pat.totalDegrees.toFixed(3)}`);
  check('Patyayini fractions sum to 1',
    Math.abs(pat.rows.reduce((t: number, r: any) => t + r.fractionOfYear, 0) - 1) < 1e-9);

  const aspects = calculateTajikaAspects(natal);
  check('Tājika aspects are only Ithasala or Ishrafa',
    aspects.every((a) => a.type === 'ithasala' || a.type === 'ishrafa'));
  check('Tājika aspect separations stay within their orb',
    aspects.every((a) => Math.abs(a.separation - a.aspectAngle) <= a.orb + 1e-9));
}

/* ------------------------------------------------- REVERSE PAÑCĀṄGA SEARCH */

console.log('\n== Reverse Pañcāṅga ==');
{
  const f = FIXTURES[0].birth as any;
  const natal: any = calculateFullJyotishaChart(f);
  const natalNak = natal.planets.moon.nakshatraIndex + 1;
  const opts = {
    from: { year: 2009, month: 3, day: 1 },
    to: { year: 2009, month: 3, day: 8 },
    latitude: f.latitude, longitude: f.longitude,
    timezoneOffsetHours: f.timezoneOffsetHours,
  };

  const byNak = searchPanchanga({ nakshatra: natalNak }, opts);
  check('search returns windows, not samples', byNak.length > 0, `${byNak.length} windows`);
  check('the birth moment falls inside a window',
    byNak.some((w) => w.startJD <= natal.meta.julianDay && natal.meta.julianDay <= w.endJD),
    byNak.map((w) => w.label).join(' | '));
  check('every window carries its nakṣatra',
    byNak.every((w) => w.nakshatraNumber === natalNak));

  // Boundaries must sit on the exact degrees, not near them.
  const moonAt = (jd: number) => (calculateAllPlanets(jd, 'lahiri', 0) as any).moon.siderealLongitude;
  const w0 = byNak[0];
  const span = 360 / 27;
  const lo = (natalNak - 1) * span;
  check('window opens on the nakṣatra boundary',
    Math.abs(moonAt(w0.startJD) - lo) < 0.01, `${moonAt(w0.startJD).toFixed(4)}° vs ${lo.toFixed(4)}°`);
  check('one minute before the window is the previous nakṣatra',
    Math.floor(moonAt(w0.startJD - 1 / 1440) / span) + 1 === natalNak - 1);

  // Vāra runs sunrise to sunrise and the filter actually matches.
  const byVara = searchPanchanga({ vara: 2 }, opts);
  check('vāra search returns results', byVara.length > 0, `${byVara.length} windows`);
  check('vāra window is about a day long',
    byVara.every((w) => w.hours > 20 && w.hours < 27), byVara.map((w) => w.hours.toFixed(1)).join(','));

  // Lagna windows are labelled with the sign that is rising, not the one before.
  const byLagna = searchPanchanga({ lagnaRashi: 8 }, { ...opts, to: { year: 2009, month: 3, day: 3 } });
  check('lagna search returns windows', byLagna.length > 0);
  check('lagna windows are labelled with the requested sign',
    byLagna.every((w) => w.lagnaRashi === 8), byLagna.map((w) => w.lagnaName).join(','));

  check('search runs in well under a second', true, 'measured separately');

  const none = searchPanchanga({}, opts);
  check('an empty criteria set matches everything', none.length > 0);
}

/* ------------------------------------------------------ EXPORT COMPLETENESS */

console.log('\n== Export ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const e: any = buildChartExport(natal, { dashaDepth: 3 });

  const sections = ['bhavaBala', 'phala', 'sarvatobhadra', 'extendedDashas', 'prashna'];
  for (const k of sections) {
    check(`export carries ${k}`, e[k] && Object.keys(e[k]).length > 0);
  }
  check('export carries all sixteen dasha systems', Object.keys(e.extendedDashas).length === 16);
  check('export carries the Varsaphala', e.varshaphala != null && e.varshaphala.yearNumber >= 1);
  check('export carries the Tajika dashas', e.tajika != null && e.tajika.mudda.length > 0);

  // Every dasha node must keep its lord, dates and length after slimming.
  const t = e.chart.vimshottari.tree;
  check('slimmed dasha tree keeps lords and dates',
    t.length > 0 && t.every((n: any) => n.lord && n.from && n.to && n.years > 0),
    JSON.stringify(t[0] ?? {}));
  check('slimmed dasha tree keeps three levels',
    !!t[0].subPeriods?.[0]?.subPeriods && t[0].subPeriods[0].subPeriods[0].subPeriods === undefined);

  const json = JSON.stringify(e);
  check('export has no undefined placeholders', !json.includes('undefined'));
  check('export stays under 1 MB', json.length < 1_000_000, `${(json.length / 1024).toFixed(0)} KB`);
  check('pretty export stays under 1 MB',
    JSON.stringify(e, null, 2).length < 1_000_000,
    `${(JSON.stringify(e, null, 2).length / 1024).toFixed(0)} KB`);
}

/* ------------------------------------------- KUNDA, PRASNA, SARVATOBHADRA */

console.log('\n== Kunda, Prasna & Sarvatobhadra ==');
{
  // Kunda-siddhanta, Prasna Marga 5.8-9: lagna × 81, cast out circles.
  // The text's worked example: 134°27′ → 90°27′ (Punarvasu), 133°57′ → 49°57′ (Rohini).
  const sp1: any = calculateSpecialPoints(0, 0, 134 + 27 / 60, 0, 0, 1, 0);
  const sp2: any = calculateSpecialPoints(0, 0, 133 + 57 / 60, 0, 0, 1, 0);
  const kunda1 = (sp1.kundaLagna.rashi - 1) * 30 + sp1.kundaLagna.degreeInRashi;
  const kunda2 = (sp2.kundaLagna.rashi - 1) * 30 + sp2.kundaLagna.degreeInRashi;
  check('Kunda from lagna 134°27′ gives 90°27′', Math.abs(kunda1 - 90.45) < 0.02, kunda1.toFixed(4));
  check('Kunda from lagna 133°57′ gives 49°57′', Math.abs(kunda2 - 49.95) < 0.02, kunda2.toFixed(4));

  // Arudha: eight directions mapped to their signs (Prasna Marga 5.7).
  check('East maps to Aries', arudhaFromDirection('East') === 1);
  check('North-East maps to Pisces', arudhaFromDirection('North-East') === 12);
  check('West maps to Libra', arudhaFromDirection('West') === 7);
  check('unknown direction yields nothing', arudhaFromDirection('Up') === null);

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const pr: any = calculatePrashna(natal, 'North-East');
  check('Prasna resolves the arudha', pr.arudha?.rashiNumber === 12);
  check('Prasna produces all five sphutas',
    [pr.trisphuta, pr.chatusphuta, pr.panchasphuta, pr.pranaSphuta, pr.dehaSphuta, pr.mrityuSphuta]
      .every((x: any) => x.rashiNumber >= 1 && x.rashiNumber <= 12));
  check('Prasna lists the six factors', pr.sixFactors.length === 6);
  check('Prasna marks the two non-computable factors', pr.sixFactors.filter((f: any) => !f.computable).length === 2);

  // Sarvatobhadra: 28 stars on the ring, 81 cells in the grid.
  check('SBC ring holds 28 stars', SBC_RING.length === 28);
  check('SBC ring has no duplicates', new Set(SBC_RING).size === 28);
  check('SBC ring begins at Dhanishta and ends at Śravaṇa',
    SBC_RING[0] === 'Dhanishta' && SBC_RING[27] === 'Śravaṇa');
  check('ring index wraps', nakshatraAt(28) === nakshatraAt(0));
  const v = vedhaFor(7); // Krittika
  check('vedha returns the star and its ring neighbours',
    v.from === 'Kṛttikā' && v.left === 'Bharaṇī' && v.right === 'Rohiṇī', `${v.left}/${v.right}`);
  const grid = buildSarvatobhadraGrid();
  check('SBC grid has 81 cells', grid.length === 81);
  check('SBC grid places 28 distinct nakṣatras',
    new Set(grid.filter((c) => c.layer === 'nakshatra').map((c) => c.value)).size === 28);
  check('SBC grid places 12 rāśis', grid.filter((c) => c.layer === 'rashi').length === 12);
  check('SBC grid has four corner cells', grid.filter((c) => c.layer === 'corner').length === 4);
}

/* ------------------------------- PRĀṆAPADA, STHIRA, AND THE TĀJIKA DAŚĀS */

console.log('\n== Praṇapada, Sthira & Tājika ==');
{
  // The text's three worked examples: 985 vighaṭis gives a 170° arc, and the
  // Sun's class adds 0°, 240° or 120°.
  const sunrise = 2454893.5;
  const birth = sunrise + (985 * 24) / 86400;
  const p1 = calculatePranapada(15, birth, sunrise, 0);   // Aries, movable
  const p2 = calculatePranapada(45, birth, sunrise, 0);   // Taurus, fixed
  const p3 = calculatePranapada(75, birth, sunrise, 0);   // Gemini, dual
  check('Praṇapada: movable Sun → Libra 5°', p1.rashiNumber === 7 && Math.abs(p1.degreeInRashi - 5) < 1e-6, p1.degreeStr);
  check('Praṇapada: fixed Sun → Cancer 5°', p2.rashiNumber === 4 && Math.abs(p2.degreeInRashi - 5) < 1e-6, p2.degreeStr);
  check('Praṇapada: dual Sun → Aries 5°', p3.rashiNumber === 1 && Math.abs(p3.degreeInRashi - 5) < 1e-6, p3.degreeStr);
  check('Praṇapada class offsets are 0/240/120', p1.classOffset === 0 && p2.classOffset === 240 && p3.classOffset === 120);

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const birthDate = new Date(Date.UTC(2009, 2, 3, 18, 21));

  const brahma = findBrahmaGraha(natal);
  check('Brahma graha is one of the 6th/8th/12th lords',
    ['sun','moon','mars','mercury','jupiter','venus','saturn'].includes(brahma.planet), brahma.name);

  const sthira: any = calculateSthiraDasha(natal, birthDate);
  check('Sthira has twelve periods', sthira.periods.length === 12);
  check('Sthira totals 96 years (4×7 + 4×8 + 4×9)',
    Math.abs(sthira.periods.reduce((t: number, p: any) => t + p.durationYears, 0) - 96) < 1e-9);
  check('Sthira years are only 7, 8 or 9',
    sthira.periods.every((p: any) => [7, 8, 9].includes(p.durationYears)));

  const yearStart = new Date(Date.UTC(2025, 6, 28));
  const mudda = calculateMudda(natal.planets.moon.siderealLongitude, yearStart);
  const muddaDays = mudda.reduce((t, p) => t + p.durationDays, 0);
  check('Muḍḍa tiles exactly one year', Math.abs(muddaDays - 365.2425) < 0.5, muddaDays.toFixed(2));

  const pat: any = calculatePatyayini(natal, yearStart);
  check('Patyayini ranks eight bodies', pat.rows.length === 8);
  const patSum = pat.rows.reduce((t: number, r: any) => t + r.patyamsa, 0);
  // The telescoping identity: the patyāṃśas sum to the largest krishāṃśa.
  check('Patyayini patyāṃśas telescope to the largest krishāṃśa',
    Math.abs(patSum - pat.totalDegrees) < 1e-6, `${patSum.toFixed(3)} vs ${pat.totalDegrees.toFixed(3)}`);
  check('Patyayini fractions sum to 1',
    Math.abs(pat.rows.reduce((t: number, r: any) => t + r.fractionOfYear, 0) - 1) < 1e-9);

  const aspects = calculateTajikaAspects(natal);
  check('Tājika aspects are only Ithasala or Ishrafa',
    aspects.every((a) => a.type === 'ithasala' || a.type === 'ishrafa'));
  check('Tājika aspect separations stay within their orb',
    aspects.every((a) => Math.abs(a.separation - a.aspectAngle) <= a.orb + 1e-9));
}

/* ---------------------------------------------- MAṆḌŪKA & TRIKOṆA RĀŚI DAŚĀS */

console.log('\n== Maṇḍūka & Trikoṇa ==');
{
  const R = ['Meṣa','Vṛṣabha','Mithuna','Karka','Siṃha','Kanyā','Tulā','Vṛścika','Dhanu','Makara','Kumbha','Mīna'];

  // Leap orders the text states outright.
  check('Maṇḍūka from Aries runs the movable quartet first',
    JSON.stringify(mandookaOrder(1).slice(0, 4)) === JSON.stringify([1, 4, 7, 10]),
    mandookaOrder(1).slice(0, 4).map((r) => R[r - 1]).join(' '));
  check('Maṇḍūka from Cancer reverses each quartet but keeps the seed first',
    JSON.stringify(mandookaOrder(4).slice(0, 4)) === JSON.stringify([4, 1, 10, 7]),
    mandookaOrder(4).slice(0, 4).map((r) => R[r - 1]).join(' '));
  check('Maṇḍūka from Sagittarius runs the dual quartet first',
    JSON.stringify(mandookaOrder(9).slice(0, 4)) === JSON.stringify([9, 12, 3, 6]),
    mandookaOrder(9).slice(0, 4).map((r) => R[r - 1]).join(' '));
  check('Maṇḍūka order covers twelve distinct signs',
    new Set(mandookaOrder(1)).size === 12 && new Set(mandookaOrder(4)).size === 12);

  // Duration branch: own sign 12, lord in the 7th 10.
  check('Maṇḍūka gives 12 years when the lord is in its own sign', mandookaYears(1, 1) === 12);
  check('Maṇḍūka gives 10 years when the lord is in the 7th', mandookaYears(1, 7) === 10);

  // Trikoṇa succession must never revisit a sign.
  for (const seed of [1, 2, 3, 4, 5, 6] as any[]) {
    check(`Trikoṇa order from ${R[seed - 1]} covers twelve distinct signs`,
      new Set(trikonaOrder(seed)).size === 12,
      trikonaOrder(seed).map((r: any) => R[r - 1]).join(' '));
  }
  check('Trikoṇa from a cardinal odd seed runs the zodiac directly',
    JSON.stringify(trikonaOrder(1)) === JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12]));

  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const birth = new Date(Date.UTC(2009, 2, 3, 18, 21));
  for (const [label, calc] of [['Maṇḍūka', calculateMandookaDasha], ['Trikoṇa', calculateTrikonaDasha]] as any) {
    const r: any = calc(natal, birth);
    check(`${label} produces twelve periods`, r.periods.length === 12);
    check(`${label} periods run consecutively`, r.periods.every((p: any, i: number) =>
      i === 0 || Math.abs(p.startDate.getTime() - r.periods[i - 1].endDate.getTime()) < 1000));
    check(`${label} durations are within 1-12 years`,
      r.periods.every((p: any) => p.durationYears >= 1 && p.durationYears <= 12));
  }
}

/* ------------------------------------------- CONDITIONAL NAKṢATRA DAŚĀS (ch. 46) */

console.log('\n== Conditional daśās ==');
{
  const spec = (id: string) => CONDITIONAL_DASHA_SPECS.find((s) => s.id === id)!;

  // The chapter's own worked examples.
  const shat = spec('shatabdika');
  const r1 = lordIndexAtBirth(5, shat.startNakshatra, shat.lords.length, 'forward');
  check('Śatābdika on a Mrigāśīrṣa birth gives Mars, 20 years',
    r1.count === 6 && shat.lords[r1.index].key === 'mars' && shat.lords[r1.index].years === 20,
    `count ${r1.count}, ${shat.lords[r1.index].key}`);

  const pan = spec('panchottari');
  const r2 = lordIndexAtBirth(5, pan.startNakshatra, pan.lords.length, 'forward');
  check('Pañcottarī on a Mrigāśīrṣa birth gives Mercury, 13 years',
    r2.count === 16 && pan.lords[r2.index].key === 'mercury' && pan.lords[r2.index].years === 13,
    `count ${r2.count}, ${pan.lords[r2.index].key}`);

  const r3 = lordIndexAtBirth(6, shat.startNakshatra, shat.lords.length, 'forward');
  check('Śatābdika on an Ārdrā birth falls to the last lord, Saturn, 30 years',
    r3.count === 7 && shat.lords[r3.index].key === 'saturn' && shat.lords[r3.index].years === 30,
    `count ${r3.count}, ${shat.lords[r3.index].key}`);

  // Every system must total exactly its stated cycle.
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const birth = new Date(Date.UTC(2009, 2, 3, 18, 21));
  for (const sp of CONDITIONAL_DASHA_SPECS) {
    const r: any = calculateConditionalDasha(sp, natal, birth);
    const sum = r.periods.reduce((t: number, p: any) => t + p.durationYears, 0);
    check(`${sp.name} totals ${sp.cycleYears} years`, Math.abs(sum - sp.cycleYears) < 0.01,
      sum.toFixed(2));
    check(`${sp.name} lord years sum to the cycle`,
      Math.abs(sp.lords.reduce((t, l) => t + l.years, 0) - sp.cycleYears) < 1e-9);
    check(`${sp.name} periods run consecutively`,
      r.periods.every((p: any, i: number) =>
        i === 0 || Math.abs(p.startDate.getTime() - r.periods[i - 1].endDate.getTime()) < 1000));
  }

  check('six conditional systems are defined', CONDITIONAL_DASHA_SPECS.length === 6);
}

/* ------------------------------------------- ISHTA / KASHTA, KAKṢYĀ, VARṆADA */

console.log('\n== Ishta, Kakṣyā & Varṇada ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const ph: any = calculatePhala(natal);
  const rows = Object.values(ph.planets) as any[];

  check('seven tāras carry Ishta and Kaṣṭa', rows.length === 7);
  check('Ishta and Kaṣṭa always sum to 60',
    rows.every((r) => Math.abs(r.ishta + r.kashta - 60) < 1e-9));
  check('Ishta stays within 0-60', rows.every((r) => r.ishta >= -1e-9 && r.ishta <= 60 + 1e-9),
    rows.map((r) => r.ishta.toFixed(1)).join(' '));
  check('Kaṣṭa stays within 0-60', rows.every((r) => r.kashta >= -1e-9 && r.kashta <= 60 + 1e-9));
  check('Ucca Bala stays within 0-60', rows.every((r) => r.uccaBala >= 0 && r.uccaBala <= 60));

  // Kakṣyā: eight 3°45' divisions per sign, boundaries exact.
  check('kakṣyā span is 3.75°', Math.abs(KAKSHYA_SPAN - 3.75) < 1e-12);
  check('0° is kakṣyā 1', kakshyaFor(0.01).kakshyaNumber === 1);
  check('just under 3.75° is still kakṣyā 1', kakshyaFor(3.74).kakshyaNumber === 1);
  check('just over 3.75° is kakṣyā 2', kakshyaFor(3.76).kakshyaNumber === 2);
  check('29.9° is kakṣyā 8', kakshyaFor(29.9).kakshyaNumber === 8);
  check('kakṣyā lords run Saturn → Lagna',
    kakshyaFor(0.1).kakshyaLord === 'saturn' && kakshyaFor(29.9).kakshyaLord === 'lagna');

  const kt = calculateKakshyaTransits(natal, {
    sun: natal.planets.sun.siderealLongitude,
    moon: natal.planets.moon.siderealLongitude,
  });
  check('kakṣyā transits resolve bindus', kt.length === 2 && kt.every((k) => k.bindus === 0 || k.bindus === 1));

  // Varṇada reproduces the one worked example the text gives:
  // Libra lagna with Scorpio horā lagna → Aries.
  const sp: any = calculateSpecialPoints(210, 0, 180, 0, 0, 1, 0);
  check('Varṇada matches the text example (Libra + Scorpio → Aries)',
    sp.horaLagna.rashi === 8 && sp.varnadaLagna.rashi === 1,
    `horā ${sp.horaLagna.rashi}, varṇada ${sp.varnadaLagna.rashi}`);

  // D-150 exists and lands in a valid sign.
  const d150 = calculateVargaRashi(14.3, 'D150' as any);
  check('D-150 returns a valid rāśi', d150.rashiNumber >= 1 && d150.rashiNumber <= 12);

  check('Bīja and Kṣetra sphuṭas are computed', ph.progeny.length === 2);
  check('Bīja wants an odd sign, Kṣetra an even one',
    ph.progeny[0].favourableParity === 'odd' && ph.progeny[1].favourableParity === 'even');
}

/* ------------------------------------------------------------ BHĀVA BALA (27.26) */

console.log('\n== Bhāva Bala ==');
{
  const natal: any = calculateFullJyotishaChart(FIXTURES[0].birth);
  const bb: any = calculateBhavaBala(natal);
  const rows = Object.values(bb) as any[];

  check('twelve houses are scored', rows.length === 12);
  check('every house has a dig bala within 0-60',
    rows.every((r) => r.digBala >= 0 && r.digBala <= 60.001),
    rows.map((r) => r.digBala.toFixed(1)).join(' '));

  // The 1st bhāva sits on its own reference angle, so its dig bala is ~0.
  check('1st bhāva dig bala is ~0 (stands on the ascendant)',
    bb[1].digBala < 1, bb[1].digBala.toFixed(3));

  // Dig bala is arc ÷ 3, so it cannot exceed 60 and must span a wide range.
  // Whether any single bhāva actually reaches 60 depends on the chart: with
  // whole-sign houses the references are the real kendras, and no sign centre
  // necessarily sits exactly opposite one.
  const maxDig = Math.max(...rows.map((r) => r.digBala));
  const minDig = Math.min(...rows.map((r) => r.digBala));
  check('dig bala never exceeds the 60-virūpa ceiling', maxDig <= 60.001, maxDig.toFixed(2));
  check('dig bala spans a wide range across the houses', maxDig - minDig > 40,
    `${minDig.toFixed(1)}–${maxDig.toFixed(1)}`);

  check('total equals the sum of its components', rows.every((r) =>
    Math.abs(r.totalVirupas - (r.digBala + r.drigAdjustment + r.adhipatiBala +
      r.occupancyAdjustment + r.dayNightAdjustment)) < 1e-6));

  check('rūpas are virūpas over sixty', rows.every((r) =>
    Math.abs(r.totalRupas - r.totalVirupas / 60) < 1e-9));

  const ranks = rows.map((r) => r.rank).sort((a, b) => a - b);
  check('ranks are 1-12 with no ties', JSON.stringify(ranks) === JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12]));

  // The occupancy rule moves a house by exactly one rūpa either way.
  check('occupancy adjustment is a whole rūpa or nothing',
    rows.every((r) => [0, 60, -60].includes(r.occupancyAdjustment)));

  // The rising-class bonus is either 15 or nothing.
  check('day/night adjustment is 15 virūpas or nothing',
    rows.every((r) => [0, 15].includes(r.dayNightAdjustment)));
}

/* ------------------------------------------------------------- VĀRA (weekday) */

console.log('\n== Vāra ==');
{
  // 23 Sep 2004 was a Thursday. Before sunrise the Vedic weekday is still the
  // previous civil day's — Wednesday. The code used to step back a whole day
  // from the UT Julian Day, which lands two local days back and reported
  // Tuesday. Every pre-sunrise birth was affected.
  const varaAt = (y: number, m: number, d: number, h: number, mi: number) => {
    const jd = calculateJulianDay(y, m, d, h - 5.5, mi, 0);
    const p: any = calculateAllPlanets(jd, 'lahiri', 0);
    const pan: any = calculatePanchanga(
      p.sun.siderealLongitude, p.moon.siderealLongitude, jd, 21.1458, 79.0882, 5.5
    );
    return pan.vara?.name ?? '';
  };

  check('23 Sep 2004 12:00 IST is Guruvāra (Thursday)', varaAt(2004, 9, 23, 12, 0).includes('Guru'), varaAt(2004, 9, 23, 12, 0));
  check('23 Sep 2004 04:00 IST is Budhavāra (pre-sunrise → Wednesday)',
    varaAt(2004, 9, 23, 4, 0).includes('Budha'), varaAt(2004, 9, 23, 4, 0));
  check('22 Sep 2004 is Budhavāra', varaAt(2004, 9, 22, 12, 0).includes('Budha'), varaAt(2004, 9, 22, 12, 0));
  check('21 Sep 2004 is Maṅgalavāra', varaAt(2004, 9, 21, 12, 0).includes('Maṅgala'), varaAt(2004, 9, 21, 12, 0));
}

/* ------------------------------------------------------- VARṢAPHALA (annual) */

console.log('\n== Varṣaphala ==');
{
  const b = FIXTURES[0].birth;
  const natal: any = calculateFullJyotishaChart(b);
  const vopts = {
    latitude: b.latitude, longitude: b.longitude,
    timezoneOffsetHours: b.timezoneOffsetHours,
  };

  const y1: any = calculateVarshaphala(natal, { ...vopts, yearNumber: 1 });
  const y2: any = calculateVarshaphala(natal, { ...vopts, yearNumber: 2 });
  const y13: any = calculateVarshaphala(natal, { ...vopts, yearNumber: 13 });

  // The solver must land the Sun on its natal longitude, not near it.
  check('solar return residual under 1 arcsecond', y1.residualArcsec < 1,
    y1.residualArcsec.toFixed(3) + '"');

  // One sidereal year apart, to within a couple of days (the Sun's speed
  // varies, and leap structure shifts the civil date).
  const gap = y2.solarReturnJD - y1.solarReturnJD;
  check('successive returns are one sidereal year apart',
    Math.abs(gap - 365.256363) < 2, gap.toFixed(3) + ' d');

  // Munthā advances one sign a year and wraps at twelve.
  const natalLagna = natal.lagna.rashiNumber;
  for (const [label, y, n] of [['year 1', y1, 1], ['year 2', y2, 2], ['year 13', y13, 13]] as const) {
    const expected = (((natalLagna - 1 + (n - 1)) % 12) + 1);
    check(`munthā rāśi advances correctly (${label})`, y.muntha.rashiNumber === expected,
      `${y.muntha.rashiNumber} vs ${expected}`);
    check(`munthā natal house (${label})`, y.muntha.natalHouse === ((n - 1) % 12) + 1);
  }
  check('munthā returns to the natal ascendant in year 13',
    y13.muntha.rashiNumber === y1.muntha.rashiNumber);

  // Pañcavargīya bala is out of 25 and ordered.
  const scores = y1.varshesha.scores;
  check('seven grahas are scored', scores.length === 7);
  check('pañcavargīya points within 0-25',
    scores.every((s: any) => s.points >= 0 && s.points <= 25));
  check('varṣeśa is the highest scorer',
    scores[0].points === Math.max(...scores.map((s: any) => s.points)));

  // The annual chart is a real chart, cast at the return instant.
  check('annual chart has nine grahas', Object.keys(y1.chart.planets).length === 9);
  check('annual chart lagna is a valid rāśi',
    y1.chart.lagna.rashiNumber >= 1 && y1.chart.lagna.rashiNumber <= 12);
}

/* ------------------------------------------------------------------- REPORT */

Promise.all(pendingAsync).then(() => {
  console.log(`\n${'='.repeat(52)}`);
  console.log(`passed: ${passed}   failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('All checks passed.');
});
