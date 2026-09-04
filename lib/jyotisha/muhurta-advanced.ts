/**
 * Gaṇaka — Classical Muhūrta, Horā, Choghadiyā & Tārā Bala Research Engine
 * Reference: Muhūrta Chintāmaṇi, Sūrya Siddhānta, and BPHS
 */

import { PlanetId } from '../astronomy/ephemeris';
import { NakshatraInfo } from './types';
import { NAKSHATRAS } from './constants';

export interface HoraPeriod {
  hourIndex: number;
  timeRange: string;
  ruler: PlanetId;
  rulerName: string;
  isFavorableFor: string;
}

export interface ChoghadiyaPeriod {
  index: number;
  name: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  nature: 'Best (Amṛta)' | 'Good (Śubha)' | 'Gain (Lābha)' | 'Neutral (Cala)' | 'Disease (Roga)' | 'Loss (Kāla)' | 'Anxiety (Udvega)';
  ruler: PlanetId;
  isAuspicious: boolean;
  timeRange: string;
  recommendedActivities: string;
}

export interface TaraBalaInfo {
  taraNumber: number; // 1 to 9
  name: string;
  sanskritName: string;
  nature: 'Auspicious' | 'Inauspicious' | 'Extremely Auspicious';
  score: number; // 1 or 0
  description: string;
}

const TARA_NAMES: Array<{ name: string; sanskrit: string; nature: TaraBalaInfo['nature']; score: number; desc: string }> = [
  { name: 'Janma', sanskrit: 'जन्म तारा', nature: 'Inauspicious', score: 0, desc: 'Birth star: Mixed for general matters, avoid start of medical cures' },
  { name: 'Sampat', sanskrit: 'सम्पत् तारा', nature: 'Extremely Auspicious', score: 1, desc: 'Wealth & prosperity: Highly favorable for financial, business, and investments' },
  { name: 'Vipat', sanskrit: 'विपत् तारा', nature: 'Inauspicious', score: 0, desc: 'Danger & distress: Avoid critical tasks and journeys' },
  { name: 'Kshema', sanskrit: 'क्षेम तारा', nature: 'Auspicious', score: 1, desc: 'Well-being & safety: Excellent for general undertakings, celebrations, travels' },
  { name: 'Pratyak', sanskrit: 'प्रत्यक् तारा', nature: 'Inauspicious', score: 0, desc: 'Obstacles & hurdles: Delayed progress, avoid negotiations' },
  { name: 'Sadhana', sanskrit: 'साधन तारा', nature: 'Extremely Auspicious', score: 1, desc: 'Accomplishment & realization: Best for spiritual, professional, and creative endeavors' },
  { name: 'Naidhana', sanskrit: 'निधन तारा (वध)', nature: 'Inauspicious', score: 0, desc: 'Destruction / Vadha: Highly critical; avoid all major auspicious beginnings' },
  { name: 'Mitra', sanskrit: 'मित्र तारा', nature: 'Auspicious', score: 1, desc: 'Friendly & harmonious: Excellent for meetings, alliances, partnerships' },
  { name: 'Parama Mitra', sanskrit: 'परम मित्र तारा', nature: 'Extremely Auspicious', score: 1, desc: 'Greatest friend / supreme ally: Most auspicious star for all undertakings' },
];

/**
 * Classical planetary order of Horās (Chaldean / Vedic descent from Saturn down to Moon):
 * Saturn -> Jupiter -> Mars -> Sun -> Venus -> Mercury -> Moon
 */
const HORA_CYCLE: PlanetId[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

const VARA_FIRST_HORA_LORD: Record<number, PlanetId> = {
  0: 'sun', // Sunday
  1: 'moon', // Monday
  2: 'mars', // Tuesday
  3: 'mercury', // Wednesday
  4: 'jupiter', // Thursday
  5: 'venus', // Friday
  6: 'saturn', // Saturday
};

function formatHour12(hour24: number): string {
  const h = ((Math.floor(hour24) % 24) + 24) % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:00 ${period}`;
}

export function calculateDailyHoras(dayOfWeek: number, sunriseHour: number = 6): HoraPeriod[] {
  const firstLord = VARA_FIRST_HORA_LORD[dayOfWeek] || 'sun';
  const startIdx = HORA_CYCLE.indexOf(firstLord);

  const horas: HoraPeriod[] = [];
  const favorability: Partial<Record<PlanetId, string>> = {
    sun: 'Government, administration, authority, gold, leadership',
    moon: 'Public relations, water, journeys, creative arts, peace',
    mars: 'Engineering, litigation, sports, real estate, energy',
    mercury: 'Trade, accounting, mathematics, writing, communication',
    jupiter: 'Spiritual initiation, education, finances, weddings, dharma',
    venus: 'Arts, romance, luxury, purchases, vehicles, entertainment',
    saturn: 'Labor, agriculture, oil, long-term foundations, asceticism',
    rahu: 'Foreign matters, research',
    ketu: 'Moksha, meditation',
    true_rahu: 'Foreign matters, research',
    true_ketu: 'Moksha, meditation',
  };

  const planetNames: Partial<Record<PlanetId, string>> = {
    sun: 'Sūrya (Sun)',
    moon: 'Candra (Moon)',
    mars: 'Maṅgala (Mars)',
    mercury: 'Budha (Mercury)',
    jupiter: 'Guru (Jupiter)',
    venus: 'Śukra (Venus)',
    saturn: 'Śani (Saturn)',
    rahu: 'Rāhu',
    ketu: 'Ketu',
    true_rahu: 'True Rāhu',
    true_ketu: 'True Ketu',
  };

  for (let i = 0; i < 24; i++) {
    const lord = HORA_CYCLE[(startIdx + i) % 7];
    const hStart = (sunriseHour + i) % 24;
    const hEnd = (hStart + 1) % 24;
    const timeRange = `${formatHour12(hStart)} – ${formatHour12(hEnd)}`;

    horas.push({
      hourIndex: i + 1,
      timeRange,
      ruler: lord,
      rulerName: planetNames[lord] || lord,
      isFavorableFor: favorability[lord] || 'General activities',
    });
  }

  return horas;
}

/**
 * Calculates 27 Nakshatra Tārā Balam evaluated from the native's Janma Nakshatra
 */
export function calculateAllTaraBalam(
  janmaNakshatraNumber: number // 1 to 27
): Array<{ nakshatra: NakshatraInfo; tara: TaraBalaInfo }> {
  return NAKSHATRAS.map((nak) => {
    // Count from Janma Nakshatra to target Nakshatra
    const count = ((nak.number - janmaNakshatraNumber + 27) % 27) + 1;
    const taraIdx = (count - 1) % 9;
    const taraData = TARA_NAMES[taraIdx];

    return {
      nakshatra: nak,
      tara: {
        taraNumber: taraIdx + 1,
        name: taraData.name,
        sanskritName: taraData.sanskrit,
        nature: taraData.nature,
        score: taraData.score,
        description: taraData.desc,
      },
    };
  });
}
