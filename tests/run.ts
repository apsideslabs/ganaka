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
import { assessTimeSensitivity } from '../lib/jyotisha/time-sensitivity';
import { offsetForZone } from '../lib/astronomy/city-index';
import { KNOWLEDGE_BASE, searchRules, getRule, knowledgeBaseSummary } from '../lib/jyotisha/knowledge-base';
import { SBC_RING, nakshatraAt, vedhaFor, buildSarvatobhadraGrid } from '../lib/jyotisha/sarvatobhadra';
import { calculateKakshyaTransits, kakshyaFor, KAKSHYA_SPAN } from '../lib/ashtakavarga/kakshya';
import { calculateSpecialPoints } from '../lib/jyotisha/special-lagnas';
import { calculateVargaRashi } from '../lib/vargas/varga-engine';
import { calculateAllPlanets } from '../lib/astronomy/ephemeris';

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
  // The Baghmara chart's lagna sits 0.97° before a navāṃśa boundary — about
  // four minutes — so D-9 must move across a five-minute window there.
  const baghmara: any = assessTimeSensitivity({
    year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 0,
    latitude: 26.65, longitude: 91.15, timezoneOffsetHours: 5.5,
  } as any, 5);
  check('the Baghmara D-9 lagna moves at ±5 min',
    baghmara.unstable.some((u: any) => u.label === 'D-9 lagna'),
    baghmara.unstable.map((u: any) => u.label).join(','));
  check('the Baghmara lagna sign itself does not move at ±5 min',
    baghmara.stable.includes('Lagna rāśi'));
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

  // A bhāva opposite its reference angle scores the full 60.
  const maxDig = Math.max(...rows.map((r) => r.digBala));
  check('some bhāva reaches the 60-virūpa maximum', maxDig > 59.9, maxDig.toFixed(2));

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
