/**
 * Gaṇaka — Daily 24-Hour Rising Lagna (Ascendant) Calculator
 * Computes exact start and end times for all 12 rising signs from local Sunrise to next Sunrise.
 */

import { calculateAscendant } from '@/lib/jyotisha/houses';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { RASHIS, GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';

export interface DailyLagnaPeriod {
  index: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  sanskritName: string;
  lagnaLord: PlanetId;
  lagnaLordName: string;
  tattva: 'Pṛthvī (Earth)' | 'Jala (Water)' | 'Tejas (Fire)' | 'Vāyu (Air)';
  mobility: 'Chara (Moveable)' | 'Sthira (Fixed)' | 'Dvisvabhāva (Dual)';
  startTimeStr: string;
  endTimeStr: string;
  startHourDecimal: number;
  endHourDecimal: number;
  durationMinutes: number;
  durationGhatikas: string;
  isDaytime: boolean;
  favorableActivities: string;
  isCurrentlyActive?: boolean;
}

const TATTVA_MAP: Record<RashiNumber, DailyLagnaPeriod['tattva']> = {
  1: 'Tejas (Fire)',
  2: 'Pṛthvī (Earth)',
  3: 'Vāyu (Air)',
  4: 'Jala (Water)',
  5: 'Tejas (Fire)',
  6: 'Pṛthvī (Earth)',
  7: 'Vāyu (Air)',
  8: 'Jala (Water)',
  9: 'Tejas (Fire)',
  10: 'Pṛthvī (Earth)',
  11: 'Vāyu (Air)',
  12: 'Jala (Water)',
};

const MOBILITY_MAP: Record<RashiNumber, DailyLagnaPeriod['mobility']> = {
  1: 'Chara (Moveable)',
  2: 'Sthira (Fixed)',
  3: 'Dvisvabhāva (Dual)',
  4: 'Chara (Moveable)',
  5: 'Sthira (Fixed)',
  6: 'Dvisvabhāva (Dual)',
  7: 'Chara (Moveable)',
  8: 'Sthira (Fixed)',
  9: 'Dvisvabhāva (Dual)',
  10: 'Chara (Moveable)',
  11: 'Sthira (Fixed)',
  12: 'Dvisvabhāva (Dual)',
};

const FAVORABILITY_MAP: Record<RashiNumber, string> = {
  1: 'Courage, executive action, surgery, sports, technology',
  2: 'Gṛhapraveśa, foundation, asset purchase, banking, luxury, agriculture',
  3: 'Trade, communications, agreements, intellectual deeds, media',
  4: 'Water projects, domestic wellness, emotional harmony, travel',
  5: 'Government, leadership, high administration, investments',
  6: 'Accounting, auditing, medical diagnosis, service, dispute settlement',
  7: 'Commerce, partnerships, negotiations, arts, travel, agreements',
  8: 'Research, occult, deep mining, insurance, long-term investments',
  9: 'Spiritual initiation, higher education, legal counsel, pilgrimage',
  10: 'Career, public office, corporate ventures, construction',
  11: 'Wealth acquisition, social networking, large assemblies, tech projects',
  12: 'Meditation, philanthropy, overseas ventures, spiritual ceremonies',
};

function formatTime12(decimalHours: number): string {
  const normalized = ((decimalHours % 24) + 24) % 24;
  const h24 = Math.floor(normalized);
  const m = Math.floor((normalized - h24) * 60);
  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * High-precision algorithm that scans the 24-hour diurnal cycle from Sunrise
 * to find the exact entry and exit time for all rising signs.
 */
export function calculateDailyLagnaTable(
  year: number,
  month: number,
  day: number,
  lat: number,
  lng: number,
  tz: number,
  sunriseDecimalHour: number = 6.0,
  sunsetDecimalHour: number = 18.0,
  ayanamshaType: AyanamshaType = 'lahiri'
): DailyLagnaPeriod[] {
  const intervals: Array<{ rashi: RashiNumber; startHour: number; endHour: number }> = [];

  // Step across 24 hours at 2-minute resolution to detect boundary transitions
  const totalMinutes = 24 * 60;
  const stepMin = 2;

  let currentRashi: RashiNumber | null = null;
  let currentStartHour = sunriseDecimalHour;

  for (let m = 0; m <= totalMinutes; m += stepMin) {
    const currentDecHour = sunriseDecimalHour + m / 60;
    const utHours = currentDecHour - tz;
    const jd = calculateJulianDay(year, month, day, utHours);

    const asc = calculateAscendant(jd, lat, lng, ayanamshaType);
    const rashi = asc.rashiNumber;

    if (currentRashi === null) {
      currentRashi = rashi;
      currentStartHour = currentDecHour;
    } else if (rashi !== currentRashi) {
      // Transition detected
      intervals.push({
        rashi: currentRashi,
        startHour: currentStartHour,
        endHour: currentDecHour,
      });
      currentRashi = rashi;
      currentStartHour = currentDecHour;
    }
  }

  // Close final interval
  if (currentRashi !== null && currentStartHour < sunriseDecimalHour + 24) {
    intervals.push({
      rashi: currentRashi,
      startHour: currentStartHour,
      endHour: sunriseDecimalHour + 24,
    });
  }

  // Determine current system time for active marker
  const now = new Date();
  const currentHourDec = now.getHours() + now.getMinutes() / 60;

  return intervals.map((intv, idx) => {
    const rashiInfo = RASHIS[intv.rashi];
    const durationMin = Math.round((intv.endHour - intv.startHour) * 60);
    const ghatikas = (durationMin / 24).toFixed(1);

    const startNorm = intv.startHour % 24;
    const endNorm = intv.endHour % 24;

    const isDaytime = startNorm >= sunriseDecimalHour && startNorm < sunsetDecimalHour;
    const isCurrentlyActive =
      startNorm <= endNorm
        ? currentHourDec >= startNorm && currentHourDec < endNorm
        : currentHourDec >= startNorm || currentHourDec < endNorm;

    const lord = rashiInfo.lord;
    const lordName = GRAHA_PROPERTIES[lord]?.name || lord;

    return {
      index: idx + 1,
      rashiNumber: intv.rashi,
      rashiName: rashiInfo.name,
      sanskritName: rashiInfo.sanskritName,
      lagnaLord: lord,
      lagnaLordName: lordName,
      tattva: TATTVA_MAP[intv.rashi] || 'Pṛthvī (Earth)',
      mobility: MOBILITY_MAP[intv.rashi] || 'Sthira (Fixed)',
      startTimeStr: formatTime12(intv.startHour),
      endTimeStr: formatTime12(intv.endHour),
      startHourDecimal: intv.startHour,
      endHourDecimal: intv.endHour,
      durationMinutes: durationMin,
      durationGhatikas: `${ghatikas} Ghaṭīs`,
      isDaytime,
      favorableActivities: FAVORABILITY_MAP[intv.rashi] || 'General undertakings',
      isCurrentlyActive,
    };
  });
}
