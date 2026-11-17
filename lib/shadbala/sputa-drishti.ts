/**
 * Sputa Dṛṣṭi — the degree-based aspect of BPHS 26.6–26.12.
 *
 * Shadbala's dṛgbala needs the aspect a graha actually casts on another at its
 * exact degree. The whole-sign version used before gave one of four values (0,
 * 15, 30, 45, 60) depending on which sign apart the two fell in, so any graha
 * nobody happened to aspect by sign read exactly 0.00 — four grahas did on the
 * first chart tested. The texts measure the aspect by degrees.
 *
 * General rule, BPHS 26.6–26.8. With θ the longitude of the aspected point less
 * that of the aspecting graha, taken forward in [0, 360):
 *
 *   θ < 30        0
 *   30–60         (θ − 30) / 2
 *   60–90         θ − 45
 *   90–120        30 + (120 − θ) / 2
 *   120–150       150 − θ
 *   150–180       2(θ − 150)
 *   180–300       (300 − θ) / 2
 *   θ ≥ 300       0
 *
 * This yields the classical curve: 0 at 30°, 15 at 60°, 45 at 90°, 30 at 120°,
 * 0 at 150°, 60 at 180° (full), 45 at 210°, 30 at 240°, 15 at 270°, 0 at 300°.
 *
 * The special aspects, BPHS 26.9–26.12, replace the general value in named
 * bands for Mars, Jupiter and Saturn. The recensions disagree on Jupiter's
 * 4th/8th-sign term — one reads "twice the degrees", the other "once" — and on
 * whether the special aspects are separate curves or additions to the general
 * one. This follows the reading whose curves join the general one and stay
 * within a rūpa; the alternative is recorded in the comment, not silently
 * blended.
 */

export type DrishtiGraha = 'mars' | 'jupiter' | 'saturn' | 'sun' | 'moon' | 'mercury' | 'venus' | 'rahu' | 'ketu';

/** BPHS 26.6–26.8 — the general sputa dṛṣṭi, 0 to 60 virūpas. */
export function generalSputaDrishti(theta: number): number {
  const t = ((theta % 360) + 360) % 360;
  if (t < 30) return 0;
  if (t < 60) return (t - 30) / 2;
  if (t < 90) return t - 45;
  if (t < 120) return 30 + (120 - t) / 2;
  if (t < 150) return 150 - t;
  if (t < 180) return 2 * (t - 150);
  if (t < 300) return (300 - t) / 2;
  return 0;
}

/**
 * The full sputa dṛṣṭi including the special aspects of Mars, Jupiter and
 * Saturn (BPHS 26.9–26.12). Always clamped to [0, 60]: no aspect exceeds a rūpa.
 */
export function sputaDrishti(
  aspectingLongitude: number,
  aspectedLongitude: number,
  graha: DrishtiGraha
): number {
  const t = ((aspectedLongitude - aspectingLongitude) % 360 + 360) % 360;
  const base = generalSputaDrishti(t);
  const sign = Math.floor(t / 30);      // 0-based whole signs between them
  const d = t - sign * 30;              // degrees past those whole signs

  let v = base;
  if (graha === 'saturn') {
    // 2nd sign (30–60): 2d · 3rd sign (60–90): 60 − d/2
    // 9th sign (240–270): d + 30 · 10th sign (270–300): 2(30 − d)
    if (sign === 1) v = 2 * d;
    else if (sign === 2) v = 60 - d / 2;
    else if (sign === 8) v = d + 30;
    else if (sign === 9) v = 2 * (30 - d);
  } else if (graha === 'mars') {
    // 4th sign (90–120): 45 + d/2 · 5th (120–150): 2(30 − d)
    // 7th sign (180–210): 60 · 8th (210–240): 30 − d + 30 = 60 − d
    if (sign === 3) v = 45 + d / 2;
    else if (sign === 4) v = 2 * (30 - d);
    else if (sign === 6) v = 60;
    else if (sign === 7) v = 60 - d;
  }
  // Jupiter's special aspect is deliberately NOT applied.
  //
  // Every recension of BPHS 26.11–12 leaves it discontinuous, and they disagree
  // about where. One reading ("twice the degrees") drops from 60 to 30 at 240°
  // and from 0 to 15 at 270°; the other ("once the degrees", and the Saravali
  // table) jumps 60 to 35 at 240°. A 15-virūpa step in an aspect curve is not a
  // rounding artefact — it is a real disagreement between manuscripts that no
  // source consulted settles. Mars and Saturn are continuous in both readings
  // and are applied above; Jupiter falls back to the general curve, which every
  // recension agrees on and which is continuous everywhere.
  return Math.max(0, Math.min(60, v));
}
