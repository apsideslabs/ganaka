/**
 * Gaṇaka — Viṃśottarī Daśā Engine
 * Calculates Mahādaśā, Antardaśā, Pratyantardaśā, and Sūkṣma Daśā
 * based on Moon's exact Nakṣatra fraction at birth per BPHS Chapters 46-50.
 * Also computes exact Bhukta (elapsed), Bhogya (remaining), and Daśā Sandhi junctions.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DashaPeriod } from '../jyotisha/types';
import { NAKSHATRAS, VIMSHOTTARI_SEQUENCE, GRAHA_PROPERTIES } from '../jyotisha/constants';

export interface DashaTimeSpan {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  percentage: number;
}

export interface ActiveDashaHierarchy {
  mahadasha: DashaPeriod;
  antardasha: DashaPeriod;
  pratyantardasha: DashaPeriod;
  sookshmadasha?: DashaPeriod;
  bhukta: DashaTimeSpan;
  bhogya: DashaTimeSpan;
  isSandhiActive: boolean;
  sandhiDetails?: {
    leavingLord: PlanetId;
    enteringLord: PlanetId;
    sandhiStartDate: string;
    sandhiEndDate: string;
    warning: string;
  };
}

export interface DashaCalculationResult {
  balanceAtBirth: {
    lord: PlanetId;
    yearsRemaining: number;
    percentRemaining: number;
  };
  tree: DashaPeriod[];
}

/**
 * Calculates complete 4-level Viṃśottarī Daśā timeline.
 */
export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDate: { year: number; month: number; day: number; hour: number; minute: number }
): DashaCalculationResult {
  // 1. Identify starting Nakṣatra and remaining fraction
  const nakSpan = 360.0 / 27.0; // 13°20' = 13.333333°
  const nakRaw = moonLongitude / nakSpan;
  const nakIndex = Math.floor(nakRaw) % 27;
  const nakInfo = NAKSHATRAS[nakIndex];
  const startingLord = nakInfo.lord;

  const fractionElapsed = nakRaw - Math.floor(nakRaw);
  const fractionRemaining = 1.0 - fractionElapsed;

  // Find position in 9-lord sequence
  const startSeqIndex = VIMSHOTTARI_SEQUENCE.findIndex((s) => s.lord === startingLord);
  const startDashaDef = VIMSHOTTARI_SEQUENCE[startSeqIndex];

  const yearsRemaining = startDashaDef.years * fractionRemaining;
  const percentRemaining = fractionRemaining * 100;

  // Build Julian decimal year or Date object
  let currentDate = new Date(
    Date.UTC(birthDate.year, birthDate.month - 1, birthDate.day, birthDate.hour, birthDate.minute)
  );

  // We start by allocating the remaining portion of the first Mahadasha
  const dashaTree: DashaPeriod[] = [];

  // Generate for a full 120-year cycle (9 Mahadashas)
  for (let i = 0; i < 9; i++) {
    const seqIndex = (startSeqIndex + i) % 9;
    const mDef = VIMSHOTTARI_SEQUENCE[seqIndex];
    const isFirst = i === 0;
    const mDurationYears = isFirst ? yearsRemaining : mDef.years;

    const mStartDate = new Date(currentDate);
    const mEndDate = addYearsToDate(mStartDate, mDurationYears);

    // Compute 9 Antardashas for this Mahadasha
    const antardashas: DashaPeriod[] = [];
    let antCurrentDate = new Date(mStartDate);

    for (let j = 0; j < 9; j++) {
      const aSeqIndex = (seqIndex + j) % 9;
      const aDef = VIMSHOTTARI_SEQUENCE[aSeqIndex];

      // Standard Antardasha proportion: (M_years * A_years) / 120
      const fullAntarDuration = (mDef.years * aDef.years) / 120.0;
      // Scale if first Mahadasha is truncated
      const aDuration = isFirst ? fullAntarDuration * fractionRemaining : fullAntarDuration;

      const aStartDate = new Date(antCurrentDate);
      const aEndDate = addYearsToDate(aStartDate, aDuration);

      // Compute 9 Pratyantardashas
      const pratyantars: DashaPeriod[] = [];
      let pratCurrentDate = new Date(aStartDate);

      for (let k = 0; k < 9; k++) {
        const pSeqIndex = (aSeqIndex + k) % 9;
        const pDef = VIMSHOTTARI_SEQUENCE[pSeqIndex];
        const pDuration = (aDuration * pDef.years) / 120.0;

        const pStartDate = new Date(pratCurrentDate);
        const pEndDate = addYearsToDate(pStartDate, pDuration);

        // Compute 9 Sūkṣma Daśās (4th level)
        const sookshmas: DashaPeriod[] = [];
        let sookCurrentDate = new Date(pStartDate);

        for (let l = 0; l < 9; l++) {
          const sSeqIndex = (pSeqIndex + l) % 9;
          const sDef = VIMSHOTTARI_SEQUENCE[sSeqIndex];
          const sDuration = (pDuration * sDef.years) / 120.0;

          const sStartDate = new Date(sookCurrentDate);
          const sEndDate = addYearsToDate(sStartDate, sDuration);

          sookshmas.push({
            lord: sDef.lord,
            lordName: sDef.name,
            startDate: formatDate(sStartDate),
            endDate: formatDate(sEndDate),
            durationYears: parseFloat(sDuration.toFixed(5)),
          });

          sookCurrentDate = sEndDate;
        }

        pratyantars.push({
          lord: pDef.lord,
          lordName: pDef.name,
          startDate: formatDate(pStartDate),
          endDate: formatDate(pEndDate),
          durationYears: parseFloat(pDuration.toFixed(4)),
          subPeriods: sookshmas,
        });

        pratCurrentDate = pEndDate;
      }

      antardashas.push({
        lord: aDef.lord,
        lordName: aDef.name,
        startDate: formatDate(aStartDate),
        endDate: formatDate(aEndDate),
        durationYears: parseFloat(aDuration.toFixed(4)),
        subPeriods: pratyantars,
      });

      antCurrentDate = aEndDate;
    }

    dashaTree.push({
      lord: mDef.lord,
      lordName: mDef.name,
      startDate: formatDate(mStartDate),
      endDate: formatDate(mEndDate),
      durationYears: parseFloat(mDurationYears.toFixed(4)),
      subPeriods: antardashas,
    });

    currentDate = mEndDate;
  }

  return {
    balanceAtBirth: {
      lord: startingLord,
      yearsRemaining: parseFloat(yearsRemaining.toFixed(2)),
      percentRemaining: parseFloat(percentRemaining.toFixed(1)),
    },
    tree: dashaTree,
  };
}

/**
 * Resolves currently active Mahadasha, Antardasha, Pratyantar, and Sookshma for any target date
 */
export function getCurrentActiveDasha(
  tree: DashaPeriod[],
  targetDate: Date = new Date()
): ActiveDashaHierarchy | null {
  const targetTime = targetDate.getTime();

  for (let m = 0; m < tree.length; m++) {
    const maha = tree[m];
    const mStart = new Date(maha.startDate).getTime();
    const mEnd = new Date(maha.endDate).getTime();

    if (targetTime >= mStart && targetTime < mEnd) {
      // Find Antardasha
      let activeAntar = maha.subPeriods?.[0] || maha;
      if (maha.subPeriods) {
        for (const antar of maha.subPeriods) {
          const aStart = new Date(antar.startDate).getTime();
          const aEnd = new Date(antar.endDate).getTime();
          if (targetTime >= aStart && targetTime < aEnd) {
            activeAntar = antar;
            break;
          }
        }
      }

      // Find Pratyantar
      let activePrat = activeAntar.subPeriods?.[0] || activeAntar;
      if (activeAntar.subPeriods) {
        for (const prat of activeAntar.subPeriods) {
          const pStart = new Date(prat.startDate).getTime();
          const pEnd = new Date(prat.endDate).getTime();
          if (targetTime >= pStart && targetTime < pEnd) {
            activePrat = prat;
            break;
          }
        }
      }

      // Find Sookshma
      let activeSook = activePrat.subPeriods?.[0];
      if (activePrat.subPeriods) {
        for (const sook of activePrat.subPeriods) {
          const sStart = new Date(sook.startDate).getTime();
          const sEnd = new Date(sook.endDate).getTime();
          if (targetTime >= sStart && targetTime < sEnd) {
            activeSook = sook;
            break;
          }
        }
      }

      // Calculate Bhukta (Elapsed) and Bhogya (Remaining) for the Mahadasha
      const mTotalMs = mEnd - mStart;
      const elapsedMs = Math.max(0, targetTime - mStart);
      const remainingMs = Math.max(0, mEnd - targetTime);

      const bhuktaDays = Math.floor(elapsedMs / (1000 * 3600 * 24));
      const bhogyaDays = Math.floor(remainingMs / (1000 * 3600 * 24));

      const bhuktaYears = bhuktaDays / 365.2422;
      const bhogyaYears = bhogyaDays / 365.2422;

      const bhukta = {
        years: Math.floor(bhuktaYears),
        months: Math.floor((bhuktaYears % 1) * 12),
        days: Math.floor((((bhuktaYears % 1) * 12) % 1) * 30.4375),
        totalDays: bhuktaDays,
        percentage: parseFloat(((elapsedMs / mTotalMs) * 100).toFixed(1)),
      };

      const bhogya = {
        years: Math.floor(bhogyaYears),
        months: Math.floor((bhogyaYears % 1) * 12),
        days: Math.floor((((bhogyaYears % 1) * 12) % 1) * 30.4375),
        totalDays: bhogyaDays,
        percentage: parseFloat(((remainingMs / mTotalMs) * 100).toFixed(1)),
      };

      // Daśā Sandhi check: ±6 months (182 days) from Mahadasha transition
      const sixMonthsMs = 182.5 * 24 * 3600 * 1000;
      let isSandhi = false;
      let sandhiDetails: ActiveDashaHierarchy['sandhiDetails'] = undefined;

      if (remainingMs <= sixMonthsMs && m < tree.length - 1) {
        // Ending Sandhi
        const nextMaha = tree[m + 1];
        isSandhi = true;
        sandhiDetails = {
          leavingLord: maha.lord,
          enteringLord: nextMaha.lord,
          sandhiStartDate: formatDate(new Date(mEnd - sixMonthsMs)),
          sandhiEndDate: formatDate(new Date(mEnd + sixMonthsMs)),
          warning: `Daśā Sandhi (Transition Junction): ${maha.lordName} Mahādaśā is concluding in ${bhogya.months}m ${bhogya.days}d. Transitional energy may cause volatility or reorganization before ${nextMaha.lordName} begins.`,
        };
      } else if (elapsedMs <= sixMonthsMs && m > 0) {
        // Beginning Sandhi
        const prevMaha = tree[m - 1];
        isSandhi = true;
        sandhiDetails = {
          leavingLord: prevMaha.lord,
          enteringLord: maha.lord,
          sandhiStartDate: formatDate(new Date(mStart - sixMonthsMs)),
          sandhiEndDate: formatDate(new Date(mStart + sixMonthsMs)),
          warning: `Daśā Sandhi: Fresh entry into ${maha.lordName} Mahādaśā from ${prevMaha.lordName}. Energies are stabilizing during this foundational phase.`,
        };
      }

      return {
        mahadasha: maha,
        antardasha: activeAntar,
        pratyantardasha: activePrat,
        sookshmadasha: activeSook,
        bhukta,
        bhogya,
        isSandhiActive: isSandhi,
        sandhiDetails,
      };
    }
  }

  return null;
}

function addYearsToDate(date: Date, years: number): Date {
  const ms = years * 365.2422 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

