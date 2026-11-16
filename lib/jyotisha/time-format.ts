/**
 * Time-of-birth formatting and the 12/24-hour conversion.
 *
 * Kept free of React so the conversion can be tested directly. This is where a
 * birth at 23:51 becomes 11:51 if a meridiem is dropped — the single character
 * that turned a Vṛścika ascendant into a Mithuna one.
 */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Resolve a face value to a 24-hour hour.
 *
 * On a 24-hour face the number is the hour. On a 12-hour face it is not:
 * 12 AM is midnight (0), 12 PM is noon (12), and every other PM hour is +12.
 */
export function to24Hour(hour: number, isPm: boolean, is24HourFace: boolean): number {
  if (is24HourFace) return clamp(hour, 0, 23);
  const h12 = clamp(hour, 1, 12);
  if (h12 === 12) return isPm ? 12 : 0;
  return isPm ? h12 + 12 : h12;
}

/** `23:51:24` */
export function formatTime24(hour: number, minute: number, second = 0): string {
  return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

/** `11:51:24 PM` */
export function formatTime12(hour: number, minute: number, second = 0): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${pad(h12)}:${pad(minute)}:${pad(second)} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/** `UTC+05:30` */
export function formatZone(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : '−';
  const abs = Math.abs(offsetHours);
  return `UTC${sign}${pad(Math.floor(abs))}:${pad(Math.round((abs % 1) * 60))}`;
}
