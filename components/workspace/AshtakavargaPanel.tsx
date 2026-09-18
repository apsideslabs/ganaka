'use client';

/**
 * Gaṇaka — Classical Aṣṭakavarga, Śodhana & Kakshā Engine
 * Features:
 * 1. 12-House SVG Kundalī Chart (North & South Indian styles) displaying actual points per House (not signs)
 *    with Red (<25), Yellow (25-29), and Green (30+) color highlights and total points.
 * 2. Individual Planet Contribution (BAV) switchable in the same SVG chart style.
 * 3. Interactive House Inspector detailing individual Graha bindu contributions.
 * 4. Comprehensive, publication-grade 12-House Ashtakavarga Table with sorting and filtering.
 * 5. Master Rāśi Matrix (BAV + SAV + Trikona & Ekadhipatya Shodhana + Shodhya Pinda).
 * 6. Prastārāṣṭakavarga (8 Kakshās per Sign).
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AshtakavargaResult, RashiNumber, VargaChart, VargaId } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { RASHIS } from '@/lib/jyotisha/constants';
import { HouseAshtakavargaSvg, HousePointData } from '@/components/ashtakavarga/HouseAshtakavargaSvg';
import { downloadChartAsSvg } from '@/components/charts/chartLayoutUtils';
import { calculateAshtakavarga } from '@/lib/ashtakavarga/ashtakavarga';
import { VARGA_DEFINITIONS } from '@/lib/vargas/varga-engine';
import {
  Table as TableIcon,
  Award,
  Layers,
  Compass,
  Grid,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronDown,
} from 'lucide-react';

interface AshtakavargaPanelProps {
  ashtakavarga: AshtakavargaResult;
  lagnaRashi?: RashiNumber;
  vargas?: Record<VargaId, VargaChart>;
  selectedVargaId?: VargaId;
  onSelectVarga?: (vargaId: VargaId) => void;
}

interface BhavaDefinition {
  num: number;
  sanskrit: string;
  english: string;
  short: string;
  signification: string;
  favorablePhala: string;
  weakPhala: string;
}

const BHAVA_DEFINITIONS: BhavaDefinition[] = [
  {
    num: 1,
    sanskrit: 'Tanu',
    english: 'Ascendant & Physical Vitality',
    short: 'Tanu (Self)',
    signification: 'Physical body, general health, vitality, innate constitution, longevity.',
    favorablePhala: 'Robust physical resilience, magnetic aura, commanding demeanor, good constitutional vitality.',
    weakPhala: 'Sensitive constitution, prone to physical exhaustion; demands disciplined health regimens.',
  },
  {
    num: 2,
    sanskrit: 'Dhana',
    english: 'Wealth & Accumulated Assets',
    short: 'Dhana (Wealth)',
    signification: 'Accumulated savings, liquid treasury, family heritage, speech, dietary nourishment.',
    favorablePhala: 'Strong capacity for wealth retention, persuasive and dignified speech, enduring family assets.',
    weakPhala: 'Fluctuations in liquid savings; prudent budgetary controls and financial oversight advised.',
  },
  {
    num: 3,
    sanskrit: 'Sahaja',
    english: 'Courage, Siblings & Initiative',
    short: 'Sahaja (Courage)',
    signification: 'Courage, entrepreneurial valor, siblings, communications, short travels, manual craft.',
    favorablePhala: 'High initiative, self-motivated tenacity, cordial sibling solidarity, effective communicator.',
    weakPhala: 'Periodic lapses in stamina or motivation; requires deliberate effort to maintain momentum.',
  },
  {
    num: 4,
    sanskrit: 'Sukha',
    english: 'Comforts, Home & Mother',
    short: 'Sukha (Home)',
    signification: 'Maternal bond, residential property, conveyances/vehicles, domestic peace of mind.',
    favorablePhala: 'Deep emotional contentment, favorable real estate holdings, reliable conveyances, maternal blessings.',
    weakPhala: 'Domestic restlessness or mental anxiety; property transactions require careful scrutiny.',
  },
  {
    num: 5,
    sanskrit: 'Putra',
    english: 'Intellect, Progeny & Pūrva Puṇya',
    short: 'Putra (Intellect)',
    signification: 'Creative genius, discernment (Buddhi), progeny, mantras, speculative acumen, past-life merits.',
    favorablePhala: 'Sharp intellectual discrimination, creative accomplishments, blessings through children, academic distinction.',
    weakPhala: 'Creative blocks or delays in speculative ventures; benefits from structured intellectual routines.',
  },
  {
    num: 6,
    sanskrit: 'Ari',
    english: 'Adversaries, Health & Daily Duty',
    short: 'Ari (Duty)',
    signification: 'Overcoming competitors, resistance to acute disease, resolving debts, dedicated service.',
    favorablePhala: 'Superb competitive stamina, ability to vanquish adversaries, robust immune defense against acute ailments.',
    weakPhala: 'Vulnerability to lingering debts, litigious stress, or minor ailments; avoid unnecessary liabilities.',
  },
  {
    num: 7,
    sanskrit: 'Yuvati',
    english: 'Partnerships & Public Alliance',
    short: 'Yuvati (Partners)',
    signification: 'Spouse, business alliances, interpersonal contracts, public engagement, foreign travel.',
    favorablePhala: 'Harmonious conjugal rapport, trustworthy business alliances, popular standing in public commerce.',
    weakPhala: 'Occasional friction in intimate or business partnerships; proactive diplomacy essential.',
  },
  {
    num: 8,
    sanskrit: 'Randhra',
    english: 'Longevity & Deep Transformation',
    short: 'Randhra (Endurance)',
    signification: 'Longevity, unforeseen transformations, esoteric research, occult intuition, legacies.',
    favorablePhala: 'Exceptional resilience through life transitions, longevity, keen investigative and occult insights.',
    weakPhala: 'Sensitivity to sudden shifts or hidden liabilities; preventive wellness care recommended.',
  },
  {
    num: 9,
    sanskrit: 'Dharma',
    english: 'Fortune, Guru & Higher Wisdom',
    short: 'Dharma (Fortune)',
    signification: 'Bhāgya (divine grace/fortune), moral virtue, father/preceptor, higher philosophy, pilgrimages.',
    favorablePhala: 'Abundant divine protection, fruitful mentorship from gurus, virtuous conduct, fortuitous breaks.',
    weakPhala: 'Fortunes require self-directed grit; rewards manifest after diligent, self-reliant ethical work.',
  },
  {
    num: 10,
    sanskrit: 'Karma',
    english: 'Career, Status & Public Action',
    short: 'Karma (Career)',
    signification: 'Professional vocation, societal authority, public reputation, administrative leadership.',
    favorablePhala: 'Prominent career recognition, administrative leadership, successful execution of grand public projects.',
    weakPhala: 'Career trajectory requires patient, steady perseverance; consistent professional upgrading needed.',
  },
  {
    num: 11,
    sanskrit: 'Lābha',
    english: 'Gains, Inflows & Aspirations',
    short: 'Lābha (Gains)',
    signification: 'Income streams, financial windfalls, social networks, realization of cherished desires.',
    favorablePhala: 'Expansive financial inflows, influential circle of allies, effortless fulfillment of key objectives.',
    weakPhala: 'Gains require hard, steady labor; thoroughly evaluate speculative ventures and informal networks.',
  },
  {
    num: 12,
    sanskrit: 'Vyaya',
    english: 'Expenses, Seclusion & Mokṣa',
    short: 'Vyaya (Mokṣa)',
    signification: 'Outlays, expenditures, foreign residency, spiritual solitude, restful sleep, final liberation.',
    favorablePhala: 'Expenditures directed toward noble and charitable avenues, positive foreign journeys, spiritual peace.',
    weakPhala: 'Propensity for unintended or unforeseen expenses; disciplined fiscal budgeting is paramount.',
  },
];

const PLANET_METADATA: Record<PlanetId, { name: string; sanskrit: string; totalStd: number; symbol: string }> = {
  sun: { name: 'Sun', sanskrit: 'Sūrya', totalStd: 48, symbol: 'Su' },
  moon: { name: 'Moon', sanskrit: 'Candra', totalStd: 49, symbol: 'Mo' },
  mars: { name: 'Mars', sanskrit: 'Maṅgala', totalStd: 39, symbol: 'Ma' },
  mercury: { name: 'Mercury', sanskrit: 'Budha', totalStd: 54, symbol: 'Me' },
  jupiter: { name: 'Jupiter', sanskrit: 'Guru', totalStd: 56, symbol: 'Ju' },
  venus: { name: 'Venus', sanskrit: 'Śukra', totalStd: 52, symbol: 'Ve' },
  saturn: { name: 'Saturn', sanskrit: 'Śani', totalStd: 39, symbol: 'Sa' },
  rahu: { name: 'Rahu', sanskrit: 'Rāhu', totalStd: 0, symbol: 'Ra' },
  ketu: { name: 'Ketu', sanskrit: 'Ketu', totalStd: 0, symbol: 'Ke' },
  true_rahu: { name: 'True Rahu', sanskrit: 'Rāhu', totalStd: 0, symbol: 'tRa' },
  true_ketu: { name: 'True Ketu', sanskrit: 'Ketu', totalStd: 0, symbol: 'tKe' },
};

const GRAHAS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

const ALL_VARGA_IDS: VargaId[] = [
  'D1',
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D27',
  'D30',
  'D40',
  'D45',
  'D60',
];

export function AshtakavargaPanel({
  ashtakavarga: initialAshtakavarga,
  lagnaRashi: initialLagnaRashi = 1,
  vargas,
  selectedVargaId,
  onSelectVarga,
}: AshtakavargaPanelProps) {
  const [uncontrolledVargaId, setUncontrolledVargaId] = useState<VargaId>(selectedVargaId || 'D1');
  const [isVargaDropdownOpen, setIsVargaDropdownOpen] = useState(false);
  const vargaDropdownRef = useRef<HTMLDivElement | null>(null);

  const activeVargaId = selectedVargaId || uncontrolledVargaId;

  const handleSelectVarga = (vId: VargaId) => {
    setUncontrolledVargaId(vId);
    setIsVargaDropdownOpen(false);
    onSelectVarga?.(vId);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        vargaDropdownRef.current &&
        !vargaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVargaDropdownOpen(false);
      }
    }
    if (isVargaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVargaDropdownOpen]);

  // Compute Ashtakavarga and Lagna for all 16 Vargas
  const allVargasData = useMemo(() => {
    const map: Record<
      VargaId,
      {
        ashtakavarga: AshtakavargaResult;
        lagnaRashi: RashiNumber;
        name: string;
        sanskritName: string;
        factor: number;
        significance: string;
      }
    > = {} as any;

    // D1 is the primary natal base
    map['D1'] = {
      ashtakavarga: initialAshtakavarga,
      lagnaRashi: initialLagnaRashi,
      name: 'Rāśi',
      sanskritName: 'राशि (डी-१)',
      factor: 1,
      significance: 'Physical body, general existence, life path',
    };

    for (const vId of ALL_VARGA_IDS) {
      if (vId === 'D1') continue;
      const def = VARGA_DEFINITIONS[vId] || {
        name: vId,
        sanskritName: vId,
        factor: 1,
        significance: '',
      };
      const vChart = vargas?.[vId];

      if (vChart && vChart.planets) {
        const pMap: Record<PlanetId, RashiNumber> = {
          sun: vChart.planets.sun?.rashiNumber ?? 1,
          moon: vChart.planets.moon?.rashiNumber ?? 1,
          mars: vChart.planets.mars?.rashiNumber ?? 1,
          mercury: vChart.planets.mercury?.rashiNumber ?? 1,
          jupiter: vChart.planets.jupiter?.rashiNumber ?? 1,
          venus: vChart.planets.venus?.rashiNumber ?? 1,
          saturn: vChart.planets.saturn?.rashiNumber ?? 1,
          rahu: vChart.planets.rahu?.rashiNumber ?? 1,
          ketu: vChart.planets.ketu?.rashiNumber ?? 1,
          true_rahu: (vChart.planets.true_rahu?.rashiNumber ?? vChart.planets.rahu?.rashiNumber ?? 1) as RashiNumber,
          true_ketu: (vChart.planets.true_ketu?.rashiNumber ?? vChart.planets.ketu?.rashiNumber ?? 1) as RashiNumber,
        };
        map[vId] = {
          ashtakavarga: calculateAshtakavarga(pMap, vChart.lagnaRashi),
          lagnaRashi: vChart.lagnaRashi,
          name: def.name,
          sanskritName: def.sanskritName,
          factor: def.factor,
          significance: def.significance,
        };
      } else {
        map[vId] = {
          ashtakavarga: initialAshtakavarga,
          lagnaRashi: initialLagnaRashi,
          name: def.name,
          sanskritName: def.sanskritName,
          factor: def.factor,
          significance: def.significance,
        };
      }
    }

    return map;
  }, [initialAshtakavarga, initialLagnaRashi, vargas]);

  const currentVargaInfo = allVargasData[activeVargaId] || allVargasData['D1'];
  const ashtakavarga = currentVargaInfo.ashtakavarga;
  const lagnaRashi = currentVargaInfo.lagnaRashi;
  // Navigation modes: 12-House Kuṇḍalī & Ledger, Master Matrix, and Prastāra
  const [viewMode, setViewMode] = useState<'chart' | 'matrix' | 'kaksha'>('chart');
  const [chartGraha, setChartGraha] = useState<'sav' | PlanetId>('sav');
  const [chartStyle, setChartStyle] = useState<'north' | 'south' | 'east'>('north');
  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [tableSort, setTableSort] = useState<'house' | 'points-desc' | 'points-asc'>('house');
  const [tableFilter, setTableFilter] = useState<'all' | 'strong' | 'average' | 'weak'>('all');
  const [selectedKakshaGraha, setSelectedKakshaGraha] = useState<string>('jupiter');

  const svgRef = useRef<SVGSVGElement | null>(null);

  const grahas = GRAHAS;

  const rashiHeaders = [
    { num: 1, name: 'Meṣa (1)' },
    { num: 2, name: 'Vṛṣa (2)' },
    { num: 3, name: 'Mith (3)' },
    { num: 4, name: 'Kark (4)' },
    { num: 5, name: 'Siṃh (5)' },
    { num: 6, name: 'Kany (6)' },
    { num: 7, name: 'Tulā (7)' },
    { num: 8, name: 'Vṛśc (8)' },
    { num: 9, name: 'Dhan (9)' },
    { num: 10, name: 'Maka (10)' },
    { num: 11, name: 'Kumb (11)' },
    { num: 12, name: 'Mīna (12)' },
  ];

  // Kaksha order
  const kakshaList = ashtakavarga.kakshaOrder || [
    { id: 'saturn', name: 'Śani (Saturn)', span: '0°00′ – 3°45′' },
    { id: 'jupiter', name: 'Guru (Jupiter)', span: '3°45′ – 7°30′' },
    { id: 'mars', name: 'Maṅgala (Mars)', span: '7°30′ – 11°15′' },
    { id: 'sun', name: 'Sūrya (Sun)', span: '11°15′ – 15°00′' },
    { id: 'venus', name: 'Śukra (Venus)', span: '15°00′ – 18°45′' },
    { id: 'mercury', name: 'Budha (Mercury)', span: '18°45′ – 22°30′' },
    { id: 'moon', name: 'Candra (Moon)', span: '22°30′ – 26°15′' },
    { id: 'lagna', name: 'Lagna (Ascendant)', span: '26°15′ – 30°00′' },
  ];

  // -------------------------------------------------------------
  // HOUSE-BASED ASHTAKAVARGA COMPUTATION (1st to 12th Houses)
  // -------------------------------------------------------------
  const housesData: HousePointData[] = useMemo(() => {
    return BHAVA_DEFINITIONS.map((bhava) => {
      const hNum = bhava.num;
      // Canonical BPHS dynamic house-to-sign calculation:
      // signIndex = ((ascendantSignIndex + houseNumber - 2) % 12) + 1
      const rashiNum = (((lagnaRashi + hNum - 2) % 12) + 1) as RashiNumber;
      const rashiIdx = rashiNum - 1; // 0-indexed for array access
      const rashiMeta = RASHIS[rashiNum];
      const rashiSanskrit = rashiMeta?.sanskritName || '';
      const rashiEnglish = rashiMeta?.name || `Rashi ${rashiNum}`;
      const rashiLord = rashiMeta?.lord || '';

      // Extract planetary contributions (BAV) for this specific house's sign
      const bavContributions: Record<string, number> = {};
      GRAHAS.forEach((g) => {
        bavContributions[g] = ashtakavarga.bav[g]?.bindusByRashi[rashiIdx] ?? 0;
      });

      // Actual points based on current selection: SAV (sum of all) or specific Planet BAV
      const points =
        chartGraha === 'sav'
          ? ashtakavarga.sav.bindusByRashi[rashiIdx] ?? 0
          : bavContributions[chartGraha] ?? 0;

      // Status thresholds:
      // In SAV: >= 30 Strong (Green), 25-29 Average (Yellow), < 25 Weak (Red)
      // In BAV: >= 5 Strong (Green), 4 Average (Yellow), <= 3 Weak (Red)
      let status: 'strong' | 'average' | 'weak';
      if (chartGraha === 'sav') {
        if (points >= 30) status = 'strong';
        else if (points >= 25) status = 'average';
        else status = 'weak';
      } else {
        if (points >= 5) status = 'strong';
        else if (points === 4) status = 'average';
        else status = 'weak';
      }

      // Exact color configurations for SVG & UI styling
      const statusColor =
        status === 'strong'
          ? {
              bg: '#F0F7ED',
              border: '#A3D193',
              text: '#1E6316',
              badgeBg: '#DCF2D5',
              badgeBorder: '#86C573',
            }
          : status === 'average'
          ? {
              bg: '#FEFBF0',
              border: '#E5CD82',
              text: '#8A5E08',
              badgeBg: '#FDF0CD',
              badgeBorder: '#E0BC57',
            }
          : {
              bg: '#FDF3F1',
              border: '#EAA396',
              text: '#A32417',
              badgeBg: '#FBD5CF',
              badgeBorder: '#E48979',
            };

      return {
        houseNum: hNum,
        houseName: `${hNum}${getOrdinal(hNum)} House • ${bhava.sanskrit} (${bhava.english})`,
        shortName: bhava.short,
        rashiNum,
        rashiName: `${rashiSanskrit} (${rashiEnglish})`,
        rashiSanskrit,
        rashiLord,
        points,
        status,
        statusColor,
        bavBreakdown: bavContributions,
      };
    });
  }, [ashtakavarga, lagnaRashi, chartGraha]);

  // Summary Metrics
  const totalPoints = useMemo(() => {
    if (chartGraha === 'sav') {
      return ashtakavarga.sav.total || 337;
    }
    return ashtakavarga.bav[chartGraha]?.totalBindus || 0;
  }, [chartGraha, ashtakavarga]);

  const averagePoints = useMemo(() => {
    return totalPoints / 12;
  }, [totalPoints]);

  const strongestHouse = useMemo(() => {
    return [...housesData].sort((a, b) => b.points - a.points)[0];
  }, [housesData]);

  const weakestHouse = useMemo(() => {
    return [...housesData].sort((a, b) => a.points - b.points)[0];
  }, [housesData]);

  const strongCount = housesData.filter((h) => h.status === 'strong').length;
  const avgCount = housesData.filter((h) => h.status === 'average').length;
  const weakCount = housesData.filter((h) => h.status === 'weak').length;

  // Parāśari Dhana Balance rule: House 11 (Lābha / Gains) vs House 12 (Vyaya / Expenses)
  const h11 = housesData.find((h) => h.houseNum === 11);
  const h12 = housesData.find((h) => h.houseNum === 12);
  const labhaVyayaBalance = h11 && h12 ? h11.points - h12.points : 0;

  // Selected house object for the inspector card
  const activeHouseData = useMemo(() => {
    return housesData.find((h) => h.houseNum === selectedHouse) || housesData[0];
  }, [housesData, selectedHouse]);

  const activeBhavaDef = useMemo(() => {
    return BHAVA_DEFINITIONS.find((b) => b.num === activeHouseData.houseNum) || BHAVA_DEFINITIONS[0];
  }, [activeHouseData]);

  // Filtered & Sorted houses for the table
  const processedTableHouses = useMemo(() => {
    let list = [...housesData];
    if (tableFilter !== 'all') {
      list = list.filter((h) => h.status === tableFilter);
    }
    if (tableSort === 'points-desc') {
      list.sort((a, b) => b.points - a.points);
    } else if (tableSort === 'points-asc') {
      list.sort((a, b) => a.points - b.points);
    } else {
      list.sort((a, b) => a.houseNum - b.houseNum);
    }
    return list;
  }, [housesData, tableFilter, tableSort]);

  // Current view title
  const currentChartTitle =
    chartGraha === 'sav'
      ? 'Sarvāṣṭakavarga (Master 337 SAV)'
      : `${PLANET_METADATA[chartGraha].sanskrit} (${PLANET_METADATA[chartGraha].name}) BAV`;

  return (
    <div id="ashtakavarga-panel-container" className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & TOP LEVEL TAB NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div id="ashtakavarga-header-bar" className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CEBA] pb-3">
        <div>
          <h2 id="ashtakavarga-main-title" className="font-serif text-xl font-bold tracking-tight text-[#2B1810]">
            Aṣṭakavarga &amp; Śodhana Bindu Architecture
          </h2>
          <p className="font-sans text-xs text-[#6B5E51]">
            12-House Kuṇḍalī, Bhinnāṣṭakavarga (BAV), Sarvāṣṭakavarga (SAV 337), Śodhya Piṇḍa &amp; Kakshās
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 font-sans text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                viewMode === 'chart' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32] hover:text-[#8C2D19]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              12-House Kuṇḍalī &amp; Ledger
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                viewMode === 'matrix' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32] hover:text-[#8C2D19]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Master Matrix (Rāśis)
            </button>
            <button
              onClick={() => setViewMode('kaksha')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                viewMode === 'kaksha' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32] hover:text-[#8C2D19]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Prastāra (Kakshās)
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DIVISIONAL CHART SELECTOR BAR (D1 TO D60)                      */}
      {/* ------------------------------------------------------------- */}
      <div id="ashtakavarga-varga-selector-bar" className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#D8CEBA] shadow-xs space-y-3 font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Label & Dropdown Popover */}
          <div className="flex items-center gap-2.5 relative" ref={vargaDropdownRef}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C2D19] shrink-0">
              <Layers className="w-4 h-4 text-[#8C2D19]" />
              <span>Divisional Chart SAV:</span>
            </div>

            {/* Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                id="btn-varga-dropdown-toggle"
                onClick={() => setIsVargaDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D8CEBA] bg-white text-xs font-serif font-bold text-[#2B1810] shadow-xs hover:border-[#8C2D19] transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#8C2D19]" />
                <span className="text-[#8C2D19] font-mono">{activeVargaId}</span>
                <span>— {currentVargaInfo.name} ({currentVargaInfo.sanskritName})</span>
                <span className="text-[10px] text-[#6B5E51] font-sans font-normal border-l border-[#D8CEBA] pl-2 hidden sm:inline">
                  Lagna: {RASHIS[lagnaRashi]?.sanskritName} (#{lagnaRashi})
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C2D19] transition-transform ${isVargaDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isVargaDropdownOpen && (
                <div
                  id="varga-dropdown-menu"
                  className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto bg-white rounded-2xl border border-[#D8CEBA] shadow-xl z-50 p-2 divide-y divide-slate-100"
                >
                  {/* Top Item: D1 Rasi (Default / Root) */}
                  <div className="pb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B5C] px-3 py-1">
                      Root Natal Base (D1)
                    </div>
                    <button
                      type="button"
                      id="varga-select-d1"
                      onClick={() => handleSelectVarga('D1')}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        activeVargaId === 'D1' ? 'bg-[#8C2D19] text-white font-bold' : 'hover:bg-[#FAF6EE] text-[#2B1810]'
                      }`}
                    >
                      <div>
                        <div className="font-serif text-xs flex items-center gap-1.5">
                          <span className="font-mono font-bold">D1</span>
                          <span>— Rāśi (राशि)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                            activeVargaId === 'D1' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                          }`}>
                            Root Default
                          </span>
                        </div>
                        <div className={`text-[11px] mt-0.5 ${activeVargaId === 'D1' ? 'text-amber-100' : 'text-[#6B5E51]'}`}>
                          Physical body, general existence, life path
                        </div>
                      </div>
                      <div className={`text-[10px] font-mono shrink-0 pl-2 ${activeVargaId === 'D1' ? 'text-white' : 'text-[#8C2D19]'}`}>
                        H1 = {RASHIS[allVargasData['D1']?.lagnaRashi || 1]?.sanskritName}
                      </div>
                    </button>
                  </div>

                  {/* All Other Divisional Charts D2 through D60 */}
                  <div className="pt-2 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B5C] px-3 py-1">
                      Harmonic Divisional Charts (D2–D60)
                    </div>
                    {ALL_VARGA_IDS.filter((v) => v !== 'D1').map((vId) => {
                      const vInfo = allVargasData[vId];
                      const isSelected = activeVargaId === vId;
                      return (
                        <button
                          key={vId}
                          type="button"
                          id={`varga-select-${vId.toLowerCase()}`}
                          onClick={() => handleSelectVarga(vId)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#8C2D19] text-white font-bold' : 'hover:bg-[#FAF6EE] text-[#2B1810]'
                          }`}
                        >
                          <div>
                            <div className="font-serif text-xs flex items-center gap-1.5">
                              <span className="font-mono font-bold">{vId}</span>
                              <span>— {vInfo.name} ({vInfo.sanskritName})</span>
                              <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                                1/{vInfo.factor}
                              </span>
                            </div>
                            <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-amber-100' : 'text-[#6B5E51]'}`}>
                              {vInfo.significance}
                            </div>
                          </div>
                          <div className={`text-[10px] font-mono shrink-0 pl-2 ${isSelected ? 'text-white' : 'text-[#8C2D19]'}`}>
                            H1 = {RASHIS[vInfo.lagnaRashi]?.sanskritName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tab Pills for Fast 1-Click Access */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {['D1', 'D9', 'D10', 'D7', 'D3', 'D12', 'D60'].map((vId) => {
              const isSelected = activeVargaId === vId;
              const def = allVargasData[vId as VargaId];
              return (
                <button
                  key={vId}
                  type="button"
                  id={`btn-quick-varga-${vId.toLowerCase()}`}
                  onClick={() => handleSelectVarga(vId as VargaId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-xs'
                      : 'bg-white border border-[#D8CEBA] text-[#4A3B32] hover:bg-[#F2EADC]'
                  }`}
                  title={`${vId} — ${def?.name} (${def?.sanskritName})`}
                >
                  <span className="font-mono font-bold">{vId}</span>
                  <span className="ml-1 font-serif text-[11px]">{def?.name}</span>
                  {vId === 'D1' && <span className="ml-1 text-[9px] opacity-80">(Default)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#D8CEBA]/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#2B1810]">
              {activeVargaId === 'D1' ? 'D1 Rāśi SAV (Root Base)' : `${activeVargaId} ${currentVargaInfo.name} SAV`}:
            </span>
            <span className="text-[#8C2D19] font-serif font-semibold">
              Ascendant House 1 = {RASHIS[lagnaRashi]?.sanskritName} ({RASHIS[lagnaRashi]?.name} • #{lagnaRashi})
            </span>
            <span className="text-slate-400 font-mono hidden md:inline">•</span>
            <span className="text-[#6B5E51] hidden md:inline">
              Total 337 Bindus (7 Grahas)
            </span>
            {activeVargaId !== 'D1' && (
              <span className="text-[11px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-[#D8CEBA]">
                Factor 1/{currentVargaInfo.factor}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeVargaId !== 'D1' ? (
              <button
                type="button"
                id="btn-reset-to-d1-sav"
                onClick={() => handleSelectVarga('D1')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
              >
                <span>Switch to D1 Rāśi</span>
              </button>
            ) : (
              <span className="text-[11px] text-[#7A6B5C] italic">
                Natal baseline chart active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: 12-HOUSE KUṆḌALĪ & COMPREHENSIVE LEDGER (PRIMARY)     */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'chart' && (
        <div id="subview-ashtakavarga-12houses" className="space-y-6 font-sans">
          {/* Top Control Ribbon: Planet Switcher + Chart Style Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF6EE] p-4 rounded-xl border border-[#D8CEBA] shadow-xs">
            {/* Target Selector: SAV or Individual Planet */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A6B5C] block">
                Select Ashtakavarga Target (Houses 1–12):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setChartGraha('sav')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                    chartGraha === 'sav'
                      ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm ring-1 ring-[#8C2D19]'
                      : 'bg-[#F2EADC] text-[#2B1810] hover:bg-[#EAE0D0]'
                  }`}
                >
                  Sarvāṣṭakavarga (SAV • 337)
                </button>
                {grahas.map((g) => {
                  const meta = PLANET_METADATA[g];
                  const isSelected = chartGraha === g;
                  const pts = ashtakavarga.bav[g]?.totalBindus || meta.totalStd;
                  return (
                    <button
                      key={g}
                      onClick={() => setChartGraha(g)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm ring-1 ring-[#8C2D19]'
                          : 'bg-[#F2EADC] text-[#4A3B32] hover:bg-[#EAE0D0]'
                      }`}
                    >
                      {meta.sanskrit} ({meta.name}) • {pts}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart Style & Export Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 text-xs">
                <button
                  onClick={() => setChartStyle('north')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    chartStyle === 'north' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-xs' : 'text-[#4A3B32] hover:text-[#8C2D19]'
                  }`}
                >
                  North
                </button>
                <button
                  onClick={() => setChartStyle('south')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    chartStyle === 'south' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-xs' : 'text-[#4A3B32] hover:text-[#8C2D19]'
                  }`}
                >
                  South
                </button>
                <button
                  onClick={() => setChartStyle('east')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                    chartStyle === 'east' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-xs' : 'text-[#4A3B32] hover:text-[#8C2D19]'
                  }`}
                >
                  East
                </button>
              </div>

              <button
                onClick={() => downloadChartAsSvg(svgRef.current, `ashtakavarga-12houses-${chartGraha}-${chartStyle}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D8CEBA] bg-[#FDFBF7] text-[#4A3B32] hover:bg-[#F2EADC] transition-colors"
                title="Download Chart Vector Image"
              >
                <Download className="w-3.5 h-3.5 text-[#8C2D19]" />
                <span className="hidden sm:inline">Export Chart</span>
              </button>
            </div>
          </div>

          {/* Architectural Notice: Varga SAV Calculation & Integrity */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">
                {activeVargaId === 'D1'
                  ? 'D1 Rāśi Dataset Integrity: '
                  : `${activeVargaId} ${currentVargaInfo.name} Independent Calculation: `}
              </span>
              <span>
                Sarvāṣṭakavarga (SAV • 337 Bindus) is anchored to{' '}
                {activeVargaId === 'D1' ? 'the Janma Lagna' : `this Varga's Ascendant`} (House 1 ={' '}
                {RASHIS[lagnaRashi]?.sanskritName} • #{lagnaRashi}).
              </span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium">
              {activeVargaId === 'D1'
                ? 'By classical doctrine, D1 SAV is preserved in its natal frame and never converted using divisional chart ascendants.'
                : `Harmonic division 1/${currentVargaInfo.factor} calculated independently from ${activeVargaId} planetary placements and ${activeVargaId} Ascendant.`}
            </div>
          </div>

          {/* Metric Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Total Points */}
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B5C] block">
                Total Score
              </span>
              <div className="font-mono text-xl font-bold text-[#8C2D19] mt-0.5">
                {totalPoints} <span className="text-xs font-normal text-[#6B5E51]">pts</span>
              </div>
              <span className="text-[10px] text-[#8A7968] block mt-0.5">
                {chartGraha === 'sav' ? 'Out of 337 standard' : `Avg ${averagePoints.toFixed(1)} / house`}
              </span>
            </div>

            {/* Average Points */}
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B5C] block">
                House Average
              </span>
              <div className="font-mono text-xl font-bold text-[#2B1810] mt-0.5">
                {averagePoints.toFixed(1)} <span className="text-xs font-normal text-[#6B5E51]">pts</span>
              </div>
              <span className="text-[10px] text-[#8A7968] block mt-0.5">
                {chartGraha === 'sav' ? 'Baseline: 28.08 pts' : 'Baseline: ~4.0 pts'}
              </span>
            </div>

            {/* Highest House */}
            <div className="p-3 rounded-xl bg-[#EEF5E7] border border-[#C8D9B8]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A27] block">
                Strongest House
              </span>
              <div className="font-serif text-sm font-bold text-[#1E6316] mt-0.5 truncate">
                {strongestHouse ? `${strongestHouse.houseNum}${getOrdinal(strongestHouse.houseNum)} House (${strongestHouse.points} pts)` : '—'}
              </div>
              <span className="text-[10px] text-[#2D5A27] block mt-0.5">
                {strongestHouse?.shortName}
              </span>
            </div>

            {/* Lowest House */}
            <div className="p-3 rounded-xl bg-[#FDF0EE] border border-[#E6BFB8]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C2216] block">
                Weakest House
              </span>
              <div className="font-serif text-sm font-bold text-[#A32417] mt-0.5 truncate">
                {weakestHouse ? `${weakestHouse.houseNum}${getOrdinal(weakestHouse.houseNum)} House (${weakestHouse.points} pts)` : '—'}
              </div>
              <span className="text-[10px] text-[#9C2216] block mt-0.5">
                {weakestHouse?.shortName}
              </span>
            </div>

            {/* House Distribution (Green/Yellow/Red count) */}
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6B5C] block">
                Distribution
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-[#1E6316]">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> {strongCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-[#8A5E08]">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" /> {avgCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-[#A32417]">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> {weakCount}
                </span>
              </div>
              <span className="text-[10px] text-[#8A7968] block mt-0.5">
                Strong • Avg • Low
              </span>
            </div>

            {/* Parāśari Wealth Equation (H11 - H12) */}
            <div className="p-3 rounded-xl bg-[#F2EADC] border border-[#D8CEBA]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C2D19] block">
                Dhana Balance
              </span>
              <div className={`font-mono text-base font-bold mt-0.5 ${labhaVyayaBalance >= 0 ? 'text-[#1E6316]' : 'text-[#A32417]'}`}>
                {labhaVyayaBalance >= 0 ? `+${labhaVyayaBalance} pts surplus` : `${labhaVyayaBalance} pts deficit`}
              </div>
              <span className="text-[10px] text-[#6B5E51] block mt-0.5">
                H11 ({h11?.points}) vs H12 ({h12?.points})
              </span>
            </div>
          </div>

          {/* Color Threshold Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA] text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#4A3B32]">
              <Sparkles className="w-4 h-4 text-[#8C2D19]" />
              <span className="font-semibold">Highlight Thresholds:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#16A34A] ring-2 ring-[#DCF2D5]" />
                <span className="text-[#1E6316] font-semibold">Green (Auspicious / Strong)</span>
                <span className="text-[#6B5E51]">({chartGraha === 'sav' ? '≥ 30 pts' : '≥ 5 pts'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D97706] ring-2 ring-[#FDF0CD]" />
                <span className="text-[#8A5E08] font-semibold">Yellow (Average / Moderate)</span>
                <span className="text-[#6B5E51]">({chartGraha === 'sav' ? '25 – 29 pts' : '4 pts'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#DC2626] ring-2 ring-[#FBD5CF]" />
                <span className="text-[#A32417] font-semibold">Red (Deficit / Low)</span>
                <span className="text-[#6B5E51]">({chartGraha === 'sav' ? '< 25 pts' : '≤ 3 pts'})</span>
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE: SVG Chart on Left, Interactive House Inspector on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SVG Chart Column (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#FAF6EE] border border-[#D8CEBA] shadow-sm">
              <div className="w-full flex items-center justify-between mb-3 text-xs text-[#6B5E51] border-b border-[#E6DEC8] pb-2">
                <span className="font-serif font-bold text-sm text-[#2B1810]">
                  {currentChartTitle}
                </span>
                <span className="font-sans text-[11px] text-[#8A7968]">
                  Click any house in chart to inspect
                </span>
              </div>

              {/* The SVG Chart Component */}
              <HouseAshtakavargaSvg
                housesData={housesData}
                chartStyle={chartStyle}
                selectedHouse={selectedHouse}
                onSelectHouse={(h) => setSelectedHouse(h)}
                targetTitle={currentChartTitle}
                totalPoints={totalPoints}
                averagePoints={averagePoints}
                svgRef={svgRef}
              />

              <p className="font-sans text-[11px] text-[#8A7968] mt-3 text-center">
                Numbered 1st to 12th relative to Janma Lagna #{lagnaRashi}. Each cell denotes the House and its actual Bindus.
              </p>
            </div>

            {/* House Inspector & Planetary Contribution Card (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-[#D8CEBA] bg-[#FAF6EE] p-5 shadow-sm space-y-4">
                {/* Inspector Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[#E6DEC8] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C2D19] block">
                      Active House Inspector
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2B1810] mt-0.5">
                      {activeHouseData.houseNum}{getOrdinal(activeHouseData.houseNum)} House • {activeBhavaDef.sanskrit} Bhāva
                    </h3>
                    <p className="text-xs text-[#6B5E51]">
                      {activeBhavaDef.english} • Rāśi: {activeHouseData.rashiName} (Lord {activeHouseData.rashiLord})
                    </p>
                  </div>

                  {/* Points Badge */}
                  <div className="text-right">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-xs"
                      style={{
                        backgroundColor: activeHouseData.statusColor.badgeBg,
                        color: activeHouseData.statusColor.text,
                        border: `1px solid ${activeHouseData.statusColor.badgeBorder}`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: activeHouseData.statusColor.text }}
                      />
                      {activeHouseData.points} pts
                    </span>
                    <span className="text-[10px] block mt-1 font-semibold capitalize" style={{ color: activeHouseData.statusColor.text }}>
                      {activeHouseData.status === 'strong' ? 'Auspicious' : activeHouseData.status === 'average' ? 'Average' : 'Low / Deficit'}
                    </span>
                  </div>
                </div>

                {/* Classical Astrological Significance & Phala */}
                <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E2D5C0] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#2B1810]">
                    <Zap className="w-3.5 h-3.5 text-[#8C2D19]" />
                    <span>Classical Significance (Parāśari):</span>
                  </div>
                  <p className="text-[#5C4A3E] leading-relaxed">
                    {activeBhavaDef.signification}
                  </p>
                  <div className="pt-1.5 border-t border-[#E6DEC8] text-[#2B1810]">
                    <span className="font-semibold">Observation: </span>
                    {activeHouseData.status === 'strong'
                      ? activeBhavaDef.favorablePhala
                      : activeHouseData.status === 'average'
                      ? `Moderate baseline strength (${activeHouseData.points} pts). Delivers steady, standard results with minimal disruption during transits.`
                      : activeBhavaDef.weakPhala}
                  </div>
                </div>

                {/* Individual Planet Contribution to this House (7 Grahas) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2B1810] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#8C2D19]" />
                      Planetary Contribution to {activeHouseData.houseNum}{getOrdinal(activeHouseData.houseNum)} House:
                    </span>
                    <span className="font-mono text-[11px] text-[#7A6B5C]">
                      Sum = {Object.values(activeHouseData.bavBreakdown || {}).reduce((a, b) => a + b, 0)} SAV pts
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {grahas.map((g) => {
                      const meta = PLANET_METADATA[g];
                      const pts = activeHouseData.bavBreakdown?.[g] ?? 0;
                      // Maximum points a planet can give to a house in classical BAV is 8
                      const pct = Math.min(100, Math.round((pts / 8) * 100));
                      const isHigh = pts >= 5;
                      const isLow = pts <= 3;

                      return (
                        <div
                          key={g}
                          onClick={() => setChartGraha(g)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            chartGraha === g
                              ? 'bg-[#F2EADC] border-[#8C2D19] ring-1 ring-[#8C2D19]'
                              : 'bg-[#FAF6EE] border-[#E6DEC8] hover:bg-[#F4EFE6]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 font-mono text-[10px] font-bold text-[#8C2D19] bg-[#F2EADC] px-1 py-0.5 rounded text-center">
                              {meta.symbol}
                            </span>
                            <span className="font-serif font-bold text-[#2B1810]">
                              {meta.sanskrit} ({meta.name})
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Visual mini bar */}
                            <div className="w-16 h-2 bg-[#E6DEC8] rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  isHigh ? 'bg-[#16A34A]' : isLow ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <span
                              className={`font-mono font-bold text-xs ${
                                isHigh ? 'text-[#1E6316]' : isLow ? 'text-[#A32417]' : 'text-[#8A5E08]'
                              }`}
                            >
                              +{pts} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#8A7968] italic">
                    Click any planet row above to switch the main chart to that planet&apos;s BAV.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* THE 12-HOUSE ASHTAKAVARGA COMPREHENSIVE LEDGER (TABLE) */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border border-[#D8CEBA] bg-[#FAF6EE] shadow-sm overflow-hidden space-y-0">
            {/* Table Action Header */}
            <div className="border-b border-[#D8CEBA] bg-[#EFE7D8] p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B1810] flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-[#8C2D19]" />
                  12-House Aṣṭakavarga Master Ledger &amp; Graha Contribution Table
                </h3>
                <p className="text-xs text-[#6B5E51]">
                  Complete house-by-house tabulation with planetary bindus, sign rulers, and classical Phala
                </p>
              </div>

              {/* Sorting and Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#D8CEBA]">
                  <Filter className="w-3.5 h-3.5 text-[#7A6B5C]" />
                  <span className="text-[#7A6B5C] font-semibold">Filter:</span>
                  <select
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value as any)}
                    className="bg-transparent font-medium text-[#2B1810] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Houses (12)</option>
                    <option value="strong">Auspicious (Green)</option>
                    <option value="average">Average (Yellow)</option>
                    <option value="weak">Deficit (Red)</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#D8CEBA]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6B5C]" />
                  <span className="text-[#7A6B5C] font-semibold">Sort:</span>
                  <select
                    value={tableSort}
                    onChange={(e) => setTableSort(e.target.value as any)}
                    className="bg-transparent font-medium text-[#2B1810] focus:outline-none cursor-pointer"
                  >
                    <option value="house">House Order (1–12)</option>
                    <option value="points-desc">Highest Points First</option>
                    <option value="points-asc">Lowest Points First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table id="ashtakavarga-12houses-table" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-semibold">
                    <th className="py-3 px-4 text-left">House &amp; Bhāva</th>
                    <th className="py-3 px-3 text-left">Rāśi &amp; Lord</th>
                    <th className="py-3 px-3 text-center">
                      {chartGraha === 'sav' ? 'SAV Score' : `${PLANET_METADATA[chartGraha].sanskrit} Score`}
                    </th>
                    <th className="py-3 px-3 text-center">Strength Status</th>
                    <th className="py-3 px-3 text-center">
                      Planetary Breakdown (Su Mo Ma Me Ju Ve Sa)
                    </th>
                    <th className="py-3 px-4 text-left">Classical Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {processedTableHouses.map((h) => {
                    const isSelected = selectedHouse === h.houseNum;
                    const bhava = BHAVA_DEFINITIONS.find((b) => b.num === h.houseNum);

                    return (
                      <tr
                        key={h.houseNum}
                        onClick={() => setSelectedHouse(h.houseNum)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F2EADC] font-medium' : 'hover:bg-[#F7F2E7]'
                        }`}
                      >
                        {/* House & Bhāva */}
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-sm text-[#2B1810] flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                                isSelected ? 'bg-[#8C2D19] text-[#FDFBF7]' : 'bg-[#E6DEC8] text-[#2B1810]'
                              }`}
                            >
                              {h.houseNum}
                            </span>
                            <span>{h.houseNum === 1 ? '1st House (Lagna)' : `${h.houseNum}${getOrdinal(h.houseNum)} House`}</span>
                          </div>
                          <span className="text-[11px] text-[#6B5E51] block ml-8">
                            {bhava?.sanskrit} • {bhava?.english}
                          </span>
                        </td>

                        {/* Sign in House */}
                        <td className="py-3 px-3">
                          <span className="font-serif font-semibold text-[#2B1810] block">
                            {h.rashiName}
                          </span>
                          <span className="text-[11px] text-[#7A6B5C]">
                            Lord: {h.rashiLord}
                          </span>
                        </td>

                        {/* Actual Points Badge */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className="inline-flex items-center justify-center min-w-[56px] px-2.5 py-1 rounded-full font-mono text-sm font-extrabold shadow-2xs"
                            style={{
                              backgroundColor: h.statusColor.badgeBg,
                              color: h.statusColor.text,
                              border: `1px solid ${h.statusColor.badgeBorder}`,
                            }}
                          >
                            {h.points} <span className="text-[10px] font-normal ml-0.5">pts</span>
                          </span>
                        </td>

                        {/* Status classification */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: h.statusColor.bg,
                              color: h.statusColor.text,
                              border: `1px solid ${h.statusColor.border}`,
                            }}
                          >
                            {h.status === 'strong' ? 'Auspicious' : h.status === 'average' ? 'Average' : 'Low / Deficit'}
                          </span>
                        </td>

                        {/* Planetary Contributions (Su, Mo, Ma, Me, Ju, Ve, Sa) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            {grahas.map((g) => {
                              const pts = h.bavBreakdown?.[g] ?? 0;
                              const meta = PLANET_METADATA[g];
                              const isHigh = pts >= 5;
                              const isLow = pts <= 3;

                              return (
                                <span
                                  key={g}
                                  title={`${meta.sanskrit} (${meta.name}) contributed ${pts} bindus`}
                                  className={`inline-flex flex-col items-center px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                    isHigh
                                      ? 'bg-[#EEF5E7] text-[#1E6316] font-bold border border-[#C8D9B8]'
                                      : isLow
                                      ? 'bg-[#FDF0EE] text-[#A32417] border border-[#E6BFB8]'
                                      : 'bg-[#FAF6EE] text-[#4A3B32] border border-[#D8CEBA]'
                                  }`}
                                >
                                  <span className="text-[8px] font-sans text-[#8A7968] uppercase">{meta.symbol}</span>
                                  <span>{pts}</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Classical Phala / Significance */}
                        <td className="py-3 px-4 max-w-xs text-[#5C4A3E]">
                          <span className="line-clamp-2 text-[11px] leading-relaxed">
                            {h.status === 'strong'
                              ? bhava?.favorablePhala
                              : h.status === 'weak'
                              ? bhava?.weakPhala
                              : `Balanced baseline vitality (${h.points} pts). Ensures stable functioning without extreme shocks.`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-[#D8CEBA] bg-[#EFE7D8] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#6B5E51]">
              <span>
                Showing {processedTableHouses.length} of 12 Houses
              </span>
              <span className="font-mono text-[11px] font-bold text-[#8C2D19]">
                Total Ashtakavarga Bindus: {totalPoints}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: MASTER MATRIX (RĀŚIS) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'matrix' && (
        <div id="subview-ashtakavarga-matrix" className="space-y-6 font-sans">
          {/* Main Table */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] shadow-sm overflow-hidden">
            <div className="border-b border-[#D8CEBA] bg-[#EFE7D8] px-4 py-2.5 flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#2B1810]">
                8 BAV Planetary Tables &amp; Master Sarvāṣṭakavarga (SAV)
              </span>
              <span className="font-mono text-xs font-bold text-[#8C2D19] bg-[#F2EADC] px-2.5 py-0.5 rounded">
                Total SAV Bindus: {ashtakavarga.sav.total} / 337
              </span>
            </div>

            <div className="overflow-x-auto">
              <table id="ashtakavarga-data-table" className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                    <th className="py-2.5 px-3 text-left">Graha / Table</th>
                    {rashiHeaders.map((r) => (
                      <th key={r.num} className="py-2.5 px-2 font-semibold">
                        {r.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 bg-[#EFE7D8] font-bold text-[#8C2D19]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {grahas.map((g) => {
                    const bav = ashtakavarga.bav[g];
                    if (!bav) return null;

                    return (
                      <tr key={g} id={`bav-row-${g}`} className="hover:bg-[#F2EADC] transition-colors">
                        <td className="py-2 px-3 text-left font-serif font-bold uppercase text-[#2B1810]">
                          {bav.planet} BAV
                        </td>
                        {bav.bindusByRashi.map((val, idx) => (
                          <td
                            key={idx}
                            className={`py-2 px-2 font-mono ${
                              val >= 5
                                ? 'font-bold text-[#2D5A27] bg-[#E1EAD2]/40'
                                : val <= 3
                                ? 'text-[#8C2D19]'
                                : 'text-[#3D2F28]'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                        <td className="py-2 px-3 font-mono font-bold bg-[#EFE7D8] text-[#8C2D19]">
                          {bav.totalBindus}
                        </td>
                      </tr>
                    );
                  })}

                  {/* SAV Row */}
                  <tr className="bg-[#EAE0D0] font-bold border-t-2 border-[#D8CEBA]">
                    <td className="py-3 px-3 text-left font-serif text-[#8C2D19] text-sm">
                      SARVĀṢṬAKAVARGA (SAV)
                    </td>
                    {ashtakavarga.sav.bindusByRashi.map((val, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-2 font-mono text-sm ${
                          val >= 30
                            ? 'text-[#2D5A27] bg-[#E1EAD2]/60 font-bold'
                            : val < 25
                            ? 'text-[#8C2D19] bg-[#F9DCD5]/60 font-bold'
                            : 'text-[#2B1810]'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="py-3 px-3 font-mono text-sm text-[#8C2D19] bg-[#E2D5C0]">
                      {ashtakavarga.sav.total}
                    </td>
                  </tr>

                  {/* Trikona Shodhana */}
                  <tr className="bg-[#FAF6EE] text-[#5C4A3E]">
                    <td className="py-2 px-3 text-left font-serif">Trikoṇa Śodhana</td>
                    {ashtakavarga.trikonaReductions.map((val, idx) => (
                      <td key={idx} className="py-2 px-2 font-mono font-medium">
                        {val}
                      </td>
                    ))}
                    <td className="py-2 px-3 font-mono font-semibold bg-[#EFE7D8]">
                      {ashtakavarga.trikonaReductions.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>

                  {/* Ekadhipatya Shodhana */}
                  <tr className="bg-[#FAF6EE] text-[#5C4A3E]">
                    <td className="py-2 px-3 text-left font-serif">Ekādhipatya Śodhana</td>
                    {ashtakavarga.ekadhipatyaReductions.map((val, idx) => (
                      <td key={idx} className="py-2 px-2 font-mono font-medium">
                        {val}
                      </td>
                    ))}
                    <td className="py-2 px-3 font-mono font-semibold bg-[#EFE7D8]">
                      {ashtakavarga.ekadhipatyaReductions.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shodhya Pinda Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#7A6B5C] block font-bold uppercase tracking-wider">Rāśi Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#2B1810]">
                {ashtakavarga.shodhyaPinda.rasiPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Multiplied with classical sign gunakaras</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#7A6B5C] block font-bold uppercase tracking-wider">Graha Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#2B1810]">
                {ashtakavarga.shodhyaPinda.grahaPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Multiplied with planetary gunakaras</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2EADC] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#8C2D19] block font-bold uppercase tracking-wider">Total Śodhya Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#8C2D19]">
                {ashtakavarga.shodhyaPinda.totalShodhyaPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Composite vitality factor (Rāśi + Graha)</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: PRASTĀRĀṢṬAKAVARGA (KAKSHĀS) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'kaksha' && (
        <div id="subview-ashtakavarga-kaksha" className="space-y-4 font-sans">
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DEC8] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B1810]">
                  Prastārāṣṭakavarga (8 Kakṣā Sub-divisions per Sign)
                </h3>
                <p className="text-xs text-[#7A6B5C]">
                  Each Rāśi of 30° is divided into 8 Kakṣās of 3°45′ each, ruled in fixed sequence: Saturn → Lagna.
                </p>
              </div>

              {/* Graha selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#7A6B5C] font-semibold">Select Planet:</span>
                <select
                  value={selectedKakshaGraha}
                  onChange={(e) => setSelectedKakshaGraha(e.target.value)}
                  className="rounded-md border border-[#D8CEBA] bg-[#FDFBF7] px-3 py-1 font-serif text-xs font-bold text-[#8C2D19] focus:outline-none"
                >
                  {grahas.map((g) => (
                    <option key={g} value={g}>
                      {g.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kaksha Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                    <th className="py-2.5 px-3 text-left">Kakṣā Lord</th>
                    <th className="py-2.5 px-2 text-left">Degree Span</th>
                    {rashiHeaders.map((r) => (
                      <th key={r.num} className="py-2.5 px-2 font-semibold">
                        {r.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 bg-[#EFE7D8] font-bold text-[#8C2D19]">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {kakshaList.map((k) => {
                    const row = ashtakavarga.prastaraGrids?.[selectedKakshaGraha]?.[k.id] || new Array(12).fill(0);
                    const rowSum = row.reduce((a, b) => a + b, 0);

                    return (
                      <tr key={k.id} className="hover:bg-[#F2EADC] transition-colors">
                        <td className="py-2 px-3 text-left font-serif font-bold text-[#2B1810]">
                          {k.name}
                        </td>
                        <td className="py-2 px-2 text-left font-mono text-[10px] text-[#7A6B5C]">
                          {k.span}
                        </td>
                        {row.map((val: number, idx: number) => (
                          <td
                            key={idx}
                            className={`py-2 px-2 font-mono font-bold ${
                              val === 1 ? 'text-[#2D5A27] bg-[#E1EAD2]/50' : 'text-[#A89C89]'
                            }`}
                          >
                            {val === 1 ? '1' : '0'}
                          </td>
                        ))}
                        <td className="py-2 px-3 font-mono font-bold bg-[#EFE7D8] text-[#8C2D19]">
                          {rowSum}
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
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
