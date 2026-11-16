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


export interface Parsed {
  /** A complete, unambiguous time. */
  value?: TimeValue;
  /** An hour of 1–12 with no meridiem — we need the user to say which half. */
  ambiguous?: { hour12: number; minute: number; second: number };
  /** Still being typed. */
  partial: boolean;
}

/**
 * Parse anything a person might type. Accepts a meridiem in any of the usual
 * spellings, with or without a space, and tolerates digits-only entry.
 */
export function parseTimeInput(raw: string): Parsed {
  const text = raw.trim().toLowerCase();
  if (!text) return { partial: true };

  // Pull off a trailing meridiem: "pm", "p.m.", and a bare "p" all count.
  const m = text.match(/([ap])\.?m?\.?$/);
  const meridiem = m ? (m[1].startsWith('p') ? 'pm' : 'am') : null;
  let body = (m ? text.slice(0, m.index) : text).replace(/[^0-9:]/g, '');

  // "2351" or "235124" — digits only, no separators.
  if (!body.includes(':')) {
    if (body.length <= 2) return { partial: true };
    if (body.length === 3) body = `${body[0]}:${body.slice(1)}`;
    else if (body.length === 4) body = `${body.slice(0, 2)}:${body.slice(2)}`;
    else if (body.length === 5) body = `${body[0]}:${body.slice(1, 3)}:${body.slice(3)}`;
    else if (body.length === 6) body = `${body.slice(0, 2)}:${body.slice(2, 4)}:${body.slice(4)}`;
    else return { partial: true };
  }

  const parts = body.split(':');
  const h = parseInt(parts[0] || '', 10);
  const minRaw = parts[1];
  if (Number.isNaN(h) || minRaw === undefined || minRaw === '') return { partial: true };
  const min = parseInt(minRaw, 10);
  if (Number.isNaN(min) || min > 59) return { partial: true };
  const sec = parts[2] ? parseInt(parts[2], 10) : 0;
  if (Number.isNaN(sec) || sec > 59) return { partial: true };

  if (meridiem) {
    // 12-hour reading with an explicit half of day.
    if (h < 1 || h > 12) return { partial: true };
    return { value: { hour: to24Hour(h, meridiem === 'pm', false), minute: min, second: sec }, partial: false };
  }

  // No meridiem. 13–23 is unambiguous, and so is a two-digit hour written with
  // a leading zero — "06:51" is a 24-hour entry by intent, where "6:51" is a
  // clock reading that could be either half of the day.
  const twoDigitHour = parts[0].length === 2;
  const leadingZero = parts[0].startsWith('0');
  if (h >= 13) return { value: { hour: h, minute: min, second: sec }, partial: false };
  if (h === 0) return { value: { hour: 0, minute: min, second: sec }, partial: false };
  if (twoDigitHour && leadingZero) return { value: { hour: h, minute: min, second: sec }, partial: false };
  return { ambiguous: { hour12: h, minute: min, second: sec }, partial: false };
}

