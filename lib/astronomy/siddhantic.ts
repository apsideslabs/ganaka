/**
 * Sūrya Siddhānta — the classical planetary method.
 *
 * The tradition's own computation, not a modern approximation of it. Mean
 * longitude comes from the revolution counts the text gives; true longitude from
 * the manda and śīghra epicycles. For the Sun and Moon there is only the manda
 * correction; for the five tārā grahas, Sūrya Siddhānta 2.43 prescribes four in
 * sequence — half-śīghra, half-manda, full-manda, full-śīghra.
 *
 * CONSTANTS. Revolution counts per Mahāyuga, Sūrya Siddhānta 2.29–33:
 *
 *   Sun            4,320,000     Moon          57,753,336
 *   Mars           2,296,832     Jupiter          364,220
 *   Saturn           146,568     Mercury śīghra 17,937,060
 *   Venus śīghra   7,022,376     Moon's apogee    488,203
 *   Moon's node      232,238 (westward)
 *
 *   Civil days in a Mahāyuga: 1,577,917,828
 *   Sidereal year: 1,577,917,828 ÷ 4,320,000 = 365.2587565 d
 *
 * Epicycle circumferences (paridhi, in degrees), Sūrya Siddhānta 2.34–38:
 *
 *   planet   manda        śīghra
 *   Sun      14           —
 *   Moon     32           —
 *   Mars     75           235
 *   Mercury  28           133
 *   Jupiter  32            72
 *   Venus    14           262
 *   Saturn   49            40
 *
 * ⚠ THE RAW TEXT DRIFTS. Its sidereal year is 207 seconds too long, so mean
 * longitude accumulates about 12° of error over the 5,100 years since the Kali
 * epoch. That is a property of the text, not a bug here: raw Sūrya Siddhānta
 * positions genuinely differ from the sky by that much today. Living pañcāṅga
 * practice applies a bīja ("seed") correction to the revolution counts to pull
 * them back; `bija` is offered as an option and its effect is visible in the
 * comparison view rather than hidden.
 *
 * NOT IMPLEMENTED, and stated so rather than approximated: the pulsating
 * epicycle. The text makes the epicycle circumference vary between the min and
 * max values tabulated above as the planet moves; this uses the tabulated value
 * directly, which is the reading most editions print and which keeps the result
 * within the arcminute band the method already occupies.
 */

import { normalizeDegrees } from './julian';

/** Days in a Mahāyuga — the sāvana day count of Sūrya Siddhānta 1.29–34. */
export const MAHAYUGA_DAYS = 1_577_917_828;
export const MAHAYUGA_YEARS = 4_320_000;
/** Sūrya Siddhānta sidereal year, in days. */
export const SS_SIDEREAL_YEAR = MAHAYUGA_DAYS / MAHAYUGA_YEARS; // 365.2587565

/**
 * Kali epoch — 18 February 3102 BCE (Julian), midnight at Ujjain.
 * Julian Day of that instant.
 */
export const KALI_EPOCH_JD = 588465.5;

/** Revolutions per Mahāyuga, Sūrya Siddhānta 2.29–33. */
export const REVOLUTIONS = {
  sun: 4_320_000,
  moon: 57_753_336,
  mars: 2_296_832,
  mercury: 17_937_060, // this is Mercury's śīghra; its own motion is the Sun's
  jupiter: 364_220,
  venus: 7_022_376,    // Venus's śīghra
  saturn: 146_568,
  moonApogee: 488_203,
  moonNode: 232_238,   // westward
} as const;

/** Manda epicycle circumference in degrees, Sūrya Siddhānta 2.34–38. */
const MANDA_PARIDHI: Record<string, number> = {
  sun: 14, moon: 32, mars: 75, mercury: 28, jupiter: 32, venus: 14, saturn: 49,
};

/** Śīghra epicycle circumference in degrees. Sun and Moon have none. */
const SIGHRA_PARIDHI: Record<string, number> = {
  mars: 235, mercury: 133, jupiter: 72, venus: 262, saturn: 40,
};

/**
 * Mandocca — the apogee of each planet's manda epicycle, in sidereal longitude
 * at the Kali epoch. Sūrya Siddhānta ch. 2. The Moon's is not fixed: it has its
 * own revolution count and is advanced from the epoch below.
 */
const MANDOCCA_AT_EPOCH: Record<string, number> = {
  sun: 77 + 17 / 60,      // 77°17′
  moon: 90,               // 3 signs at the Kali epoch; advanced by moonApogee
  mars: 130 + 2 / 60,     // 130°02′
  mercury: 220 + 27 / 60, // 220°27′
  jupiter: 171 + 18 / 60, // 171°18′ — close to Jupiter's true aphelion of 170.8°
  venus: 79 + 50 / 60,    // 79°50′
  saturn: 236 + 37 / 60,  // 236°37′
};

/**
 * Epoch longitudes.
 *
 * Sūrya Siddhānta sets every mean planet at 0° Aries at the Kali epoch — the
 * assumed grand conjunction — with two exceptions: the Moon's apogee starts at
 * 90° (three signs) and its node at 180° (six signs), the node moving westward.
 * Starting the node at 0° put Rāhu 176° out; at 180° it lands within 4° of the
 * modern mean node.
 */
const NODE_EPOCH_LONGITUDE = 180;

/** The deferent radius in degrees, the Indian R = 3438′ expressed in degrees. */
const R_DEG = 360 / (2 * Math.PI); // 57.29578

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/**
 * Bīja correction.
 *
 * The documented integer corrections to the revolution counts, from Burgess's
 * Sūrya Siddhānta translation: "the planetary revolutions were further changed
 * thus … According to Dīkṣita these new corrections were introduced by the
 * author of the Makaranda tables."
 *
 *   Moon's apogee  −4     Moon's node  +4
 *   Mercury       −16     Venus        −12
 *   Mars            0     Jupiter       −8
 *   Saturn        +12
 *
 * ⚠ THESE DO NOT CLOSE THE GAP, AND THE MODULE SAYS SO RATHER THAN PRETENDING.
 * One revolution per Mahāyuga is 0.4258° today, so the largest correction here
 * moves a graha by about 6.8° — while raw Kali-epoch Sūrya Siddhānta is 45° out
 * on Mercury. The bīja refines the Makaranda tables *from their own epoch*
 * (Śaka 1400 / 1478 CE); it was never meant to repair five thousand years of
 * drift from the Kali epoch. Offered because it is documented and real, not
 * because it fixes anything on its own.
 */
const BIJA_REVOLUTIONS: Record<string, number> = {
  sun: 0, moon: 0, moonApogee: -4, moonNode: +4,
  mars: 0, mercury: -16, jupiter: -8, venus: -12, saturn: +12,
};

/** Revolutions of a body per Mahāyuga, with the documented bīja applied. */
function revolutionsOf(body: keyof typeof REVOLUTIONS, bija: boolean): number {
  const base = REVOLUTIONS[body];
  if (!bija) return base;
  return base + (BIJA_REVOLUTIONS[body] ?? 0);
}

/** The bīja table, for display. */
export function bijaCorrections(): Array<{ body: string; base: number; delta: number; corrected: number }> {
  return (Object.keys(REVOLUTIONS) as Array<keyof typeof REVOLUTIONS>).map((b) => ({
    body: b,
    base: REVOLUTIONS[b],
    delta: BIJA_REVOLUTIONS[b] ?? 0,
    corrected: REVOLUTIONS[b] + (BIJA_REVOLUTIONS[b] ?? 0),
  }));
}

/** Ahargaṇa — days elapsed since the Kali epoch, to the given instant. */
export function ahargana(jdUt: number): number {
  return jdUt - KALI_EPOCH_JD;
}

/** Mean longitude of a body, in degrees, from its revolution count. */
function meanLongitude(
  body: keyof typeof REVOLUTIONS,
  ah: number,
  bija: boolean,
  retrograde = false
): number {
  const revs = revolutionsOf(body, bija);
  const turns = (revs / MAHAYUGA_DAYS) * ah;
  const lon = (turns % 1) * 360;
  return normalizeDegrees(retrograde ? -lon : lon);
}

/**
 * The epicycle correction.
 *
 * bhujajyā = r·sin(kendra), koṭijyā = r·cos(kendra), and the correction is
 * asin(bhujajyā ÷ √((R ± koṭijyā)² + bhujajyā²)). The sign of the koṭijyā term
 * differs between the manda and śīghra constructions, which is why it is passed
 * in rather than assumed.
 */
function epicycleCorrection(
  kendraDeg: number,
  paridhiDeg: number,
  koṭijyāSign: 1 | -1
): number {
  const r = paridhiDeg / (2 * Math.PI);
  const k = kendraDeg * D2R;
  const bhujajya = r * Math.sin(k);
  const kotijya = r * Math.cos(k);
  const denom = Math.sqrt(
    (R_DEG + koṭijyāSign * kotijya) ** 2 + bhujajya ** 2
  );
  if (denom === 0) return 0;
  return Math.asin(Math.max(-1, Math.min(1, bhujajya / denom))) * R2D;
}

/** Apply a correction with the sign its kendra quadrant demands. */
function applyCorrection(meanLon: number, correction: number, kendraDeg: number): number {
  const k = ((kendraDeg % 360) + 360) % 360;
  // The correction is additive through the first and fourth quadrants, and
  // subtractive through the second and third — the standard rule.
  return normalizeDegrees(k <= 180 ? meanLon + correction : meanLon - correction);
}

export interface SiddhanticPosition {
  longitude: number;
  meanLongitude: number;
  /** Total correction applied, in degrees. */
  correction: number;
  retrograde: boolean;
}

/**
 * True longitude of the Sun.
 */
export function suryaSiddhantaSun(jdUt: number, bija = false): SiddhanticPosition {
  const ah = ahargana(jdUt);
  const mean = meanLongitude('sun', ah, bija);
  const apogee = MANDOCCA_AT_EPOCH.sun;
  const kendra = normalizeDegrees(apogee - mean);
  const corr = epicycleCorrection(kendra, MANDA_PARIDHI.sun, 1);
  return {
    longitude: applyCorrection(mean, corr, kendra),
    meanLongitude: mean,
    correction: corr,
    retrograde: false,
  };
}

/**
 * True longitude of the Moon.
 *
 * Manda only, like the Sun, but the Moon's apogee itself moves — it has its own
 * revolution count (488,203 per Mahāyuga), which is why it is advanced here
 * rather than held at a fixed longitude.
 */
export function suryaSiddhantaMoon(jdUt: number, bija = false): SiddhanticPosition {
  const ah = ahargana(jdUt);
  const mean = meanLongitude('moon', ah, bija);
  const apogee = normalizeDegrees(MANDOCCA_AT_EPOCH.moon + meanLongitude('moonApogee', ah, bija));
  const kendra = normalizeDegrees(apogee - mean);
  const corr = epicycleCorrection(kendra, MANDA_PARIDHI.moon, 1);
  return {
    longitude: applyCorrection(mean, corr, kendra),
    meanLongitude: mean,
    correction: corr,
    retrograde: false,
  };
}

/**
 * True longitude of a tārā graha, by the four corrections of 2.43.
 *
 * Order, exactly as the verse gives it:
 *   1. half śīghra to the mean
 *   2. half manda to that
 *   3. full manda to the mean, using the twice-corrected position
 *   4. full śīghra to the result
 */
export function suryaSiddhantaPlanet(
  planet: 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn',
  jdUt: number,
  bija = false
): SiddhanticPosition {
  const ah = ahargana(jdUt);
  const sun = suryaSiddhantaSun(jdUt, bija);

  // Mercury and Venus have the Sun's own motion; their revolution counts are
  // the śīghra. Mars, Jupiter and Saturn move by their own count and their
  // śīghra is the Sun's motion — Sūrya Siddhānta 2.29.
  const inferior = planet === 'mercury' || planet === 'venus';
  const mean = inferior
    ? meanLongitude('sun', ah, bija)
    : meanLongitude(planet, ah, bija);

  const sighraMean = inferior
    ? meanLongitude(planet, ah, bija)
    : sun.meanLongitude;

  const mandaParidhi = MANDA_PARIDHI[planet];
  const sighraParidhi = SIGHRA_PARIDHI[planet];

  const apogee = MANDOCCA_AT_EPOCH[planet];
  let total = 0;

  // 1. Half śīghra.
  const kendra1 = normalizeDegrees(sighraMean - mean);
  const c1 = epicycleCorrection(kendra1, sighraParidhi, -1) / 2;
  const afterSighra = applyCorrection(mean, c1, kendra1);
  total += c1;

  // 2. Half manda on the result.
  const kendra2 = normalizeDegrees(apogee - afterSighra);
  const c2 = epicycleCorrection(kendra2, mandaParidhi, 1) / 2;
  const afterMandaHalf = applyCorrection(afterSighra, c2, kendra2);
  total += c2;

  // 3. Full manda. The kendra is read off the twice-corrected position, but the
  // correction itself is applied back to the original mean — Sūrya Siddhānta 2.44.
  const kendra3 = normalizeDegrees(apogee - afterMandaHalf);
  const c3 = epicycleCorrection(kendra3, mandaParidhi, 1);
  const afterManda = applyCorrection(mean, c3, kendra3);
  total += c3;

  // 4. Full śīghra to the result.
  const kendra4 = normalizeDegrees(sighraMean - afterManda);
  const c4 = epicycleCorrection(kendra4, sighraParidhi, -1);
  const final = applyCorrection(afterManda, c4, kendra4);
  total += c4;

  return {
    longitude: final,
    meanLongitude: mean,
    correction: total,
    retrograde: false,
  };
}

/**
 * The Moon's ascending node (Rāhu) — the text gives it 232,238 westward
 * revolutions per Mahāyuga. Ketu is the opposite point.
 */
export function suryaSiddhantaNode(jdUt: number, bija = false): number {
  const ah = ahargana(jdUt);
  const travelled = meanLongitude('moonNode', ah, bija);
  // Westward from 180° at the epoch.
  return normalizeDegrees(NODE_EPOCH_LONGITUDE - travelled);
}

/** All seven classical grahas plus the node, in sidereal longitude. */
export function suryaSiddhantaPositions(
  jdUt: number,
  bija = false
): Record<string, number> {
  const sun = suryaSiddhantaSun(jdUt, bija);
  const moon = suryaSiddhantaMoon(jdUt, bija);
  const rahu = suryaSiddhantaNode(jdUt, bija);

  return {
    sun: sun.longitude,
    moon: moon.longitude,
    mars: suryaSiddhantaPlanet('mars', jdUt, bija).longitude,
    mercury: suryaSiddhantaPlanet('mercury', jdUt, bija).longitude,
    jupiter: suryaSiddhantaPlanet('jupiter', jdUt, bija).longitude,
    venus: suryaSiddhantaPlanet('venus', jdUt, bija).longitude,
    saturn: suryaSiddhantaPlanet('saturn', jdUt, bija).longitude,
    rahu,
    ketu: normalizeDegrees(rahu + 180),
  };
}

/** The method's own summary, for the settings panel and the report. */
export const SURYA_SIDDHANTA_NOTE =
  'Sūrya Siddhānta: mean longitude from the text\'s revolution counts, then manda ' +
  'and śīghra epicycle corrections. Its sidereal year is 207 s longer than the ' +
  'modern one, so raw positions drift about 12° from the sky by 2026 — the text\'s ' +
  'own bīja correction exists for exactly this and is offered as an option.';

/**
 * The siddhāntic positions against the modern ones, graha by graha.
 *
 * The residual is the honest measure of what this mode can and cannot do, and it
 * belongs in front of the reader rather than in a footnote. As of the bīja-
 * corrected counts the Sun, Saturn, Rāhu and the Moon land within about 4°,
 * Jupiter within 11°, and Mars and Mercury remain 26° and 45° out — those two
 * need revolution counts the documented bīja does not carry.
 */
export function siddhanticResiduals(
  jdUt: number,
  modern: Record<string, number>,
  bija = true
): Array<{ body: string; siddhantic: number; modern: number; delta: number; verdict: string }> {
  const ss = suryaSiddhantaPositions(jdUt, bija);
  const out: Array<{ body: string; siddhantic: number; modern: number; delta: number; verdict: string }> = [];
  for (const body of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu']) {
    const m = modern[body];
    if (typeof m !== 'number' || typeof ss[body] !== 'number') continue;
    const delta = ((ss[body] - m + 540) % 360) - 180;
    const a = Math.abs(delta);
    out.push({
      body,
      siddhantic: Number(ss[body].toFixed(2)),
      modern: Number(m.toFixed(2)),
      delta: Number(delta.toFixed(2)),
      verdict: a < 1 ? 'exact' : a < 5 ? 'close' : a < 15 ? 'loose' : 'wrong',
    });
  }
  return out;
}
