/**
 * Placidus house cusps.
 *
 * KP is Placidus by definition — Krishnamurti adopted it and the whole
 * sub-lord apparatus is read off those cusps. What this file replaces divided
 * each quadrant into equal thirds, which is Porphyry, not Placidus. On one
 * chart that put cusps 2 and 3 nearly four degrees from where Placidus puts
 * them, and every sub lord on those cusps was therefore read from the wrong
 * degree.
 *
 * Placidus divides time, not arc: a cusp is the ecliptic degree that has
 * travelled a fixed fraction of its own semi-arc since the meridian. Because
 * the semi-arc depends on the degree's declination, and the declination depends
 * on the degree, the four intermediate cusps are solved by iteration.
 */

const DEG = Math.PI / 180;
const norm = (d: number) => ((d % 360) + 360) % 360;

export interface PlacidusInput {
  /** Sidereal or tropical ascendant, degrees. */
  ascendant: number;
  /** Sidereal or tropical midheaven, degrees. */
  mc: number;
  /** Geographic latitude, degrees (+ north). */
  latitude: number;
  /** Obliquity of the ecliptic, degrees. */
  obliquity: number;
  /** Sidereal offset to subtract, if the inputs are tropical. */
  ayanamsha?: number;
}

/**
 * Solve one intermediate cusp.
 *
 * `fraction` is how far along the semi-arc the cusp sits, and `below` says
 * whether it is measured on the nocturnal semi-arc (cusps 2 and 3) rather than
 * the diurnal one (cusps 11 and 12).
 */
function solveCusp(
  ramc: number,
  latitude: number,
  obliquity: number,
  fraction: number,
  below: boolean
): number {
  const phi = latitude * DEG;
  const eps = obliquity * DEG;

  // The ecliptic degree we are looking for, in tropical longitude.
  let lon = 0;
  // Seed from the equal-thirds answer, then let the iteration pull it right.
  lon = norm(ramc + (below ? 180 * fraction : 90 * fraction));

  for (let i = 0; i < 60; i++) {
    const lam = lon * DEG;
    // Right ascension and declination of this ecliptic degree.
    const ra = norm(Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) / DEG);
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));

    // Semi-diurnal arc: how far the degree travels from rising to meridian.
    const cosSD = -Math.tan(phi) * Math.tan(dec);
    // Circumpolar degrees have no semi-arc; Placidus is undefined there.
    const sd = Math.acos(Math.max(-1, Math.min(1, cosSD))) / DEG;
    const sn = 180 - sd;

    // Target hour angle for this cusp.
    const h = below ? -(sd + sn * fraction) : -sd * fraction;

    // Hour angle = RAMC − RA, so the RA we need is RAMC − h.
    const targetRA = norm(ramc - h);
    // Convert that right ascension back to an ecliptic longitude.
    const nextLon = norm(
      Math.atan2(Math.sin(targetRA * DEG), Math.cos(targetRA * DEG) * Math.cos(eps)) / DEG
    );

    if (Math.abs(((nextLon - lon + 540) % 360) - 180) < 1e-9) {
      lon = nextLon;
      break;
    }
    lon = nextLon;
  }
  return lon;
}

/**
 * The twelve cusps, 1-based in the returned array's first twelve slots.
 * Returns `null` where Placidus is undefined (inside the polar circles).
 */
export function placidusCusps(input: PlacidusInput): number[] | null {
  const { ascendant, mc, latitude, obliquity } = input;
  const ayan = input.ayanamsha ?? 0;

  // Work in tropical terms: Placidus is defined on the tropical ecliptic.
  const ascT = norm(ascendant + ayan);
  const mcT = norm(mc + ayan);
  // Right ascension of the midheaven.
  // tan α = tan λ · cos ε  →  α = atan2(sin λ · cos ε, cos λ)
  const ramc = norm(
    Math.atan2(Math.sin(mcT * DEG) * Math.cos(obliquity * DEG), Math.cos(mcT * DEG)) / DEG
  );

  // Placidus has no solution beyond the polar circle.
  if (Math.abs(latitude) > 66.0) return null;

  const c11 = solveCusp(ramc, latitude, obliquity, 1 / 3, false);
  const c12 = solveCusp(ramc, latitude, obliquity, 2 / 3, false);
  const c2 = solveCusp(ramc, latitude, obliquity, 1 / 3, true);
  const c3 = solveCusp(ramc, latitude, obliquity, 2 / 3, true);

  const tropical = [
    ascT, c2, c3, norm(mcT + 180), norm(c11 + 180), norm(c12 + 180),
    norm(ascT + 180), norm(c2 + 180), norm(c3 + 180), mcT, c11, c12,
  ];
  return tropical.map((d) => norm(d - ayan));
}
