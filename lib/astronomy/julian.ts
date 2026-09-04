/**
 * Gaṇaka — Julian Day & Astronomical Time Utility
 * High-precision Julian Day calculation according to Jean Meeus / Astronomical Algorithms.
 */

export interface DateTimeInput {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  timezoneOffsetHours: number; // e.g. +5.5 for IST, -5 for EST
}

/**
 * Calculates the Julian Day (JD) for a given UT (Universal Time).
 */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): number {
  let y = year;
  let m = month;

  // In astronomical calculations, Jan & Feb are months 13 & 14 of the previous year
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const d = day + hour / 24.0 + minute / 1440.0 + second / 86400.0;

  // Gregorian calendar reform cutoff (Oct 15, 1582)
  const isGregorian =
    year > 1582 ||
    (year === 1582 && (month > 10 || (month === 10 && day >= 15)));

  let a = 0;
  let b = 0;

  if (isGregorian) {
    a = Math.floor(y / 100);
    b = 2 - a + Math.floor(a / 4);
  }

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    b -
    1524.5;

  return jd;
}

/**
 * Converts local civil date and time into Universal Time (UT) Julian Day.
 */
export function getUniversalTimeJulianDay(input: DateTimeInput): number {
  // Convert local civil time to UTC
  const totalLocalHours =
    input.hour + input.minute / 60.0 + input.second / 3600.0;
  const utHours = totalLocalHours - input.timezoneOffsetHours;

  let utDay = input.day;
  let utMonth = input.month;
  let utYear = input.year;

  let finalHour = utHours;

  if (finalHour < 0) {
    finalHour += 24;
    utDay -= 1;
    if (utDay < 1) {
      utMonth -= 1;
      if (utMonth < 1) {
        utMonth = 12;
        utYear -= 1;
      }
      utDay = getDaysInMonth(utYear, utMonth);
    }
  } else if (finalHour >= 24) {
    finalHour -= 24;
    utDay += 1;
    const maxDays = getDaysInMonth(utYear, utMonth);
    if (utDay > maxDays) {
      utDay = 1;
      utMonth += 1;
      if (utMonth > 12) {
        utMonth = 1;
        utYear += 1;
      }
    }
  }

  const h = Math.floor(finalHour);
  const m = Math.floor((finalHour - h) * 60);
  const s = Math.round(((finalHour - h) * 60 - m) * 60);

  return calculateJulianDay(utYear, utMonth, utDay, h, m, s);
}

/**
 * Helper to get number of days in a month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) in degrees [0, 360).
 */
export function calculateGMST(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0

  // IAU formula for GMST in seconds of time
  let gmstSeconds =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;

  // Convert to degrees and normalize to [0, 360)
  return normalizeDegrees(gmstSeconds);
}

/**
 * Calculates Local Sidereal Time (LST) in degrees for a given longitude.
 * East longitude is positive, West is negative.
 */
export function calculateLST(jd: number, longitudeDegrees: number): number {
  const gmst = calculateGMST(jd);
  return normalizeDegrees(gmst + longitudeDegrees);
}

/**
 * Calculates the Obliquity of the Ecliptic (epsilon) in degrees for a given Julian Day.
 */
export function calculateObliquity(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  // Laskar's formula
  const eps0 =
    23.43929111 -
    0.013004167 * t -
    0.0000001639 * t * t +
    0.0000005036 * t * t * t;
  return eps0;
}

/**
 * Normalizes an angle in degrees to [0, 360).
 */
export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) {
    d += 360;
  }
  return d;
}

/**
 * Converts decimal degrees to Sign, Degrees, Minutes, Seconds.
 */
export function toDMS(decimalDegrees: number): {
  signIndex: number;
  signName: string;
  degrees: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const norm = normalizeDegrees(decimalDegrees);
  const signIndex = Math.floor(norm / 30);
  const remDeg = norm % 30;
  const deg = Math.floor(remDeg);
  const remMin = (remDeg - deg) * 60;
  const min = Math.floor(remMin);
  const sec = Math.round((remMin - min) * 60);

  const signs = [
    'Mesha (Aries)',
    'Vrishabha (Taurus)',
    'Mithuna (Gemini)',
    'Karka (Cancer)',
    'Simha (Leo)',
    'Kanya (Virgo)',
    'Tula (Libra)',
    'Vrishchika (Scorpio)',
    'Dhanu (Sagittarius)',
    'Makara (Capricorn)',
    'Kumbha (Aquarius)',
    'Meena (Pisces)',
  ];

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(deg)}° ${pad(min)}′ ${pad(sec)}″`;

  return {
    signIndex,
    signName: signs[signIndex],
    degrees: deg,
    minutes: min,
    seconds: sec,
    formatted,
  };
}
